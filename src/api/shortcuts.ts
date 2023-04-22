import express from 'express'
import { auth } from '../middlewares'
import { Request } from 'express-jwt'
import { pickDefined } from '../utils/object'
import { List, Shortcut } from '../models'
import mongoose from 'mongoose'

const router = express.Router()

router.get('/:listId', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const shortcuts = await Shortcut.find({ listId: req.params.listId }).sort(
    'order',
  )

  res.json(shortcuts)
})

router.post('/:listId', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { title, url, icon, parent } = req.body
  const list = await List.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(req.params.listId) } },
    {
      $lookup: {
        from: 'shortcuts',
        localField: 'shortcuts',
        foreignField: '_id',
        as: 'shortcuts',
      },
    },
    { $addFields: { shortcutCount: { $size: '$shortcuts' } } },
  ])

  const order = list.length ? list[0].shortcutCount : 0
  const shortcut = await Shortcut.create({
    title,
    url,
    list: req.params.listId,
    user: req.auth.id,
    icon,
    parent,
    order,
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

  const shortcut = await Shortcut.updateOne(
    {
      _id: id,
      user: req.auth.id,
    },
    pickDefined({ title, url, icon, parent }),
  )

  res.json(shortcut)
})

router.delete('/:id', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const { id } = req.params
  const shortcut = await Shortcut.deleteOne({ _id: id })

  res.json(shortcut)
})

export default router
