import Docker from 'dockerode';

const docker = new Docker(
  process.env.DOCKER_HOST
    ? undefined
    : { socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' }
);

export type ContainerSummary = {
  id: string;
  name: string;
  image: string;
  imageId: string;
  state: string;
  status: string;
  created: number;
  ports: { private: number; public?: number; type: string }[];
  labels: Record<string, string>;
  watchtowerEnabled: boolean;
  updateAvailable: boolean;
};

const LABEL_ENABLE = 'com.centurylinklabs.watchtower.enable';

export async function listContainers(): Promise<ContainerSummary[]> {
  const containers = await docker.listContainers({ all: true });

  return containers.map((c) => {
    const labels = c.Labels || {};
    return {
      id: c.Id,
      name: c.Names[0]?.replace(/^\//, '') || c.Id.slice(0, 12),
      image: c.Image,
      imageId: c.ImageID,
      state: c.State,
      status: c.Status,
      created: c.Created,
      ports: (c.Ports || []).map((p) => ({
        private: p.PrivatePort,
        public: p.PublicPort,
        type: p.Type,
      })),
      labels,
      // Penutx's shipped docker-compose.yml sets WATCHTOWER_LABEL_ENABLE=true
      // on the Watchtower service, which puts it in opt-in mode: only
      // containers explicitly labeled true are managed. So we treat a
      // container as managed only when the label is explicitly "true",
      // not merely "not false".
      watchtowerEnabled: labels[LABEL_ENABLE] === 'true',
      updateAvailable: false,
    };
  });
}

export async function getContainer(id: string) {
  return docker.getContainer(id);
}

export async function inspectContainer(id: string) {
  const container = docker.getContainer(id);
  return container.inspect();
}

export async function getContainerStats(id: string) {
  const container = docker.getContainer(id);
  const stats = await container.stats({ stream: false });
  return stats;
}

export async function getContainerLogs(id: string, tail = 200): Promise<string> {
  const container = docker.getContainer(id);
  const buffer = (await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  })) as unknown as Buffer;

  return demuxDockerLog(buffer);
}

function demuxDockerLog(buffer: Buffer): string {
  let result = '';
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32BE(offset + 4);
    const start = offset + 8;
    const end = start + size;
    if (end > buffer.length) break;
    result += buffer.subarray(start, end).toString('utf8');
    offset = end;
  }
  return result || buffer.toString('utf8');
}

export default docker;
