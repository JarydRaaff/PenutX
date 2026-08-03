import { NextRequest, NextResponse } from 'next/server';
import { inspectContainer } from '@/lib/docker';
import { triggerUpdate, WatchtowerError } from '@/lib/watchtower';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Sanity-check the container exists before triggering anything.
    await inspectContainer(params.id);

    // NOTE: Watchtower's `?image=` filter (used to scope an update to just
    // this one container) isn't reliably supported across Watchtower
    // versions -- notably it's absent/non-functional on the last release
    // of the original containrrr/watchtower image. Rather than silently
    // do nothing when the filter fails to match, we trigger a full scan
    // of every managed container. Scope is still controlled by your
    // watchtower.enable labels, so this doesn't touch anything you've
    // excluded -- it just isn't limited to this one container.
    const result = await triggerUpdate();
    return NextResponse.json({
      ok: true,
      message: 'Update check triggered for all managed containers',
      detail: result.body,
    });
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
