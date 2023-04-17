import express from 'express'
import { prisma } from '../app'
import { auth } from '../middlewares'
import { Request } from 'express-jwt'
import { pickDefined } from '../utils/object'

const router = express.Router()

router.get('/:listId', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const shortcuts = await prisma.shortcut.findMany({
    where: { listId: req.params.listId },
    include: {
      parent: true,
    },
  })

  res.json(shortcuts)
})

router.post('/:listId', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title, url, icon, parent } = req.body
  const list = await prisma.list.findUnique({
    where: { id: req.params.listId },
    include: {
      _count: {
        select: {
          shortcuts: true,
        },
      },
    },
  })

  const order = (list?._count.shortcuts || -1) + 1
  const shortcut = await prisma.shortcut.create({
    data: {
      title,
      url,
      listId: req.params.listId,
      icon,
      parent,
      order,
    },
  })

  res.json(shortcut)
})

router.put('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params
  const { title, url, icon, parent } = req.body

  const shortcut = await prisma.shortcut.update({
    where: { id },
    data: pickDefined({ title, url, icon, parent }),
  })

  res.json(shortcut)
})

router.delete('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params

  const shortcut = await prisma.shortcut.delete({
    where: { id },
  })

  res.json(shortcut)
})

export default router
