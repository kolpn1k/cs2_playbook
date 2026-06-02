import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const lineupId = parseInt(id, 10)

  if (isNaN(lineupId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  try {
    const lineup = await prisma.lineup.findUnique({
      where: { id: lineupId },
      include: { images: true },
    })

    if (!lineup) {
      return NextResponse.json({ error: 'Lineup not found' }, { status: 404 })
    }

    // Delete all image files from disk
    const pathsToDelete = [
      ...lineup.images.map((img) => img.imagePath),
      ...(lineup.imagePath ? [lineup.imagePath] : []),
    ]
    await Promise.allSettled(
      pathsToDelete.map((p) => unlink(path.join(process.cwd(), p.replace(/^\/uploads\//, 'uploads/'))))
    )

    // Cascade deletes lineup_images rows automatically
    await prisma.lineup.delete({ where: { id: lineupId } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete lineup' }, { status: 500 })
  }
}
