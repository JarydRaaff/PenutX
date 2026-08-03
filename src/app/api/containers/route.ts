import { NextResponse } from 'next/server';
import { listContainers, inspectContainer } from '@/lib/docker';
import { getRemoteDigest, hasNewerDigest } from '@/lib/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await listContainers();

    const withUpdateInfo = await Promise.all(
      containers.map(async (c) => {
        try {
          const details = await inspectContainer(c.id);
          const repoDigests: string[] = details.Image ? await getRepoDigests(c.id) : [];
          const remoteDigest = await getRemoteDigest(c.image);
          return {
            ...c,
            updateAvailable: hasNewerDigest(repoDigests, remoteDigest),
          };
        } catch {
          return c;
        }
      })
    );

    return NextResponse.json({ containers: withUpdateInfo });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          'Could not reach the Docker socket. Make sure /var/run/docker.sock is mounted into this container (see docker-compose.yml).',
        detail: (err as Error).message,
      },
      { status: 500 }
    );
  }
}

async function getRepoDigests(containerId: string): Promise<string[]> {
  const docker = (await import('@/lib/docker')).default;
  const image = await docker.getContainer(containerId).inspect();
  const imageInfo = await docker.getImage(image.Image).inspect();
  return imageInfo.RepoDigests || [];
}
