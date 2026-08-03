import { NextRequest, NextResponse } from 'next/server';
import { inspectContainer } from '@/lib/docker';
import { triggerUpdate, WatchtowerError } from '@/lib/watchtower';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const details = await inspectContainer(params.id);
    const imageName = details.Config.Image;

    const result = await triggerUpdate(imageName);
    return NextResponse.json({ ok: true, message: 'Update triggered', detail: result.body });
  } catch (err) {
    if (err instanceof WatchtowerError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    return NextResponse.json(
      { ok: false, error: 'Container not found or Docker error', detail: (err as Error).message },
      { status: 500 }
    );
  }
}
