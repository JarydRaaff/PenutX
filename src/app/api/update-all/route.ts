import { NextResponse } from 'next/server';
import { triggerUpdate, WatchtowerError } from '@/lib/watchtower';

export async function POST() {
  try {
    const result = await triggerUpdate();
    return NextResponse.json({ ok: true, message: 'Update-all triggered', detail: result.body });
  } catch (err) {
    if (err instanceof WatchtowerError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
