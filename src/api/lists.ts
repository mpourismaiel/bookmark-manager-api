import express from 'express'
import { auth } from '../middlewares'
import { Request } from 'express-jwt'
import { List, Shortcut, User } from '../models'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const user = await User.findOne({ uuid: req.auth.uuid }).populate({
    path: 'lists',
    populate: {
      path: 'shortcuts',
    },
  })

  res.json(user)
})

router.post('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title } = req.body

  const list = await List.create({
    title,
    user: req.auth.id,
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

  const list = await List.updateOne({ _id: id, user: req.auth.id }, { title })

  res.json(list)
})

router.delete('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params
  const list = await List.deleteOne({ _id: id, user: req.auth.id })

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

  const list = await List.findOne({ _id: id, user: req.auth.id }).populate(
    'shortcuts',
  )
  if (
    list?.shortcuts.filter(s => s._id.toString() in order).length !==
    list?.shortcuts.length
  ) {
    res.status(400).json({ error: 'Invalid order' })
    return
  }

  const updates = Object.keys(order).map(shortcutId => ({
    updateOne: {
      filter: { _id: new mongoose.Types.ObjectId(shortcutId) },
      update: { order: order[shortcutId] },
    },
  }))
  const result = await Shortcut.bulkWrite(updates)

  res.json(result)
})

export default router
