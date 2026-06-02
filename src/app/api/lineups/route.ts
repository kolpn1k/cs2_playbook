import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { MAP_IDS, UTILITY_IDS } from '@/lib/constants'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const map = searchParams.get('map')
  const type = searchParams.get('type')

  if (!map || !type) {
    return NextResponse.json({ error: 'map and type are required' }, { status: 400 })
  }

  try {
    const lineups = await prisma.lineup.findMany({
      where: { map, utilityType: type },
      orderBy: { createdAt: 'desc' },
      include: { images: { orderBy: { order: 'asc' } } },
    })

    const normalized = lineups.map(({ images, imagePath, ...l }) => ({
      ...l,
      images: images.length > 0
        ? images.map((img) => img.imagePath)
        : imagePath ? [imagePath] : [],
    }))

    return NextResponse.json(normalized)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lineups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const map = formData.get('map') as string
    const utilityType = formData.get('utilityType') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const isInsta = formData.get('isInsta') === 'true'
    const imageFiles = formData.getAll('images') as File[]

    if (!map || !utilityType || !title || !description || imageFiles.length === 0) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (!MAP_IDS.includes(map)) {
      return NextResponse.json({ error: 'Invalid map' }, { status: 400 })
    }

    if (!UTILITY_IDS.includes(utilityType)) {
      return NextResponse.json({ error: 'Invalid utility type' }, { status: 400 })
    }

    for (const img of imageFiles) {
      if (!img.type.startsWith('image/')) {
        return NextResponse.json({ error: 'All files must be images' }, { status: 400 })
      }
    }

    const uploadDir = path.join(process.cwd(), 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const savedPaths: string[] = []
    for (const img of imageFiles) {
      const ext = (img.name.split('.').pop() ?? 'png').toLowerCase()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
      const bytes = await img.arrayBuffer()
      await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))
      savedPaths.push(`/uploads/${filename}`)
    }

    const lineup = await prisma.lineup.create({
      data: {
        map, utilityType, title, description, isInsta,
        images: {
          create: savedPaths.map((imagePath, order) => ({ imagePath, order })),
        },
      },
      include: { images: { orderBy: { order: 'asc' } } },
    })

    const { images, imagePath, ...rest } = lineup
    return NextResponse.json(
      { ...rest, images: images.map((img) => img.imagePath) },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: 'Failed to create lineup' }, { status: 500 })
  }
}
