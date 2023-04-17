import express from 'express'
import { prisma } from '../app'
import { auth } from '../middlewares'
import { Request } from 'express-jwt'

const router = express.Router()

router.get('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const lists = await prisma.list.findMany({
    where: { ownerId: req.auth.uuid },
    include: {
      sharedWith: {
        select: {
          username: true,
        },
      },
      shortcuts: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  })

  res.json(lists)
})

router.post('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title } = req.body

  const list = await prisma.list.create({
    data: {
      title,
      ownerId: req.auth.uuid,
    },
  })

  res.json(list)
})

router.put('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params
  const { title } = req.body

  const list = await prisma.list.update({
    where: { id },
    data: { title },
  })

  res.json(list)
})

router.delete('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params

  const list = await prisma.list.delete({
    where: { id },
  })

  res.json(list)
})

router.put('/:id/reorder', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params
  const { order }: { order: Record<string, number> } = req.body
  if (typeof order !== 'object') {
    res.status(400).json({ error: 'Invalid order' })
    return
  }

  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      shortcuts: {
        select: {
          id: true,
        },
      },
    },
  })

  if (
    !list ||
    list.shortcuts.filter(shortcut => order[shortcut.id] !== undefined)
      .length !== Object.keys(order).length
  ) {
    res.status(400).json({ error: 'Invalid order' })
    return
  }

  const updateOperations = list.shortcuts.map(shortcut => {
    return prisma.shortcut.update({
      where: { id: shortcut.id },
      data: { order: order[shortcut.id] },
    })
  })

  const shortcuts = await prisma.$transaction(updateOperations)
  res.json(shortcuts)
})

export default router
