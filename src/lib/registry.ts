type ParsedImage = {
  registry: string;
  repository: string;
  tag: string;
};

function parseImage(image: string): ParsedImage {
  let registry = 'registry-1.docker.io';
  let rest = image;

  const firstSlash = image.indexOf('/');
  if (firstSlash !== -1) {
    const maybeHost = image.slice(0, firstSlash);
    if (maybeHost.includes('.') || maybeHost.includes(':') || maybeHost === 'localhost') {
      registry = maybeHost;
      rest = image.slice(firstSlash + 1);
    }
  }

  let tag = 'latest';
  const lastColon = rest.lastIndexOf(':');
  const lastSlash = rest.lastIndexOf('/');
  if (lastColon > lastSlash) {
    tag = rest.slice(lastColon + 1);
    rest = rest.slice(0, lastColon);
  }

  if (registry === 'registry-1.docker.io' && !rest.includes('/')) {
    rest = `library/${rest}`;
  }

  return { registry, repository: rest, tag };
}

async function getAuthToken(registry: string, repository: string): Promise<string | null> {
  if (registry === 'registry-1.docker.io') {
    const url = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${repository}:pull`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.token as string;
  }
  return null;
}

export async function getRemoteDigest(image: string): Promise<string | null> {
  const { registry, repository, tag } = parseImage(image);

  try {
    const token = await getAuthToken(registry, repository);
    const headers: Record<string, string> = {
      Accept:
        'application/vnd.docker.distribution.manifest.v2+json,application/vnd.oci.image.manifest.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.oci.image.index.v1+json',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`https://${registry}/v2/${repository}/manifests/${tag}`, {
      method: 'HEAD',
      headers,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) return null;
    return res.headers.get('docker-content-digest');
  } catch {
    return null;
  }
}

export function hasNewerDigest(repoDigests: string[], remoteDigest: string | null): boolean {
  if (!remoteDigest) return false;
  if (repoDigests.length === 0) return false;
  return !repoDigests.some((rd) => rd.includes(remoteDigest));
}
