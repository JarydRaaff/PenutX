import { NextRequest, NextResponse } from 'next/server';
import { getContainerLogs } from '@/lib/docker';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const logs = await getContainerLogs(params.id, 200);
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json(
      { error: 'Could not fetch logs', detail: (err as Error).message },
      { status: 500 }
    );
  }
}
