import express from 'express'
import { Request } from 'express-jwt'

import { auth } from '../middlewares'
import { User } from '../models'
import { organizeShortcuts } from '../utils/nested'

const router = express.Router()

router.get('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const result = await User.findById(req.auth.id).populate({
    path: 'lists sharedLists',
    populate: {
      path: 'shortcuts',
    },
  })
  if (!result) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const user = result.toJSON()
  user.lists.forEach((list: any) => {
    list.shortcuts = organizeShortcuts(list.shortcuts)
  })

  res.json(user)
})

export default router
