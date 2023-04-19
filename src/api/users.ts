import express from 'express'
import { Request } from 'express-jwt'

import { prisma } from '../app'
import { auth } from '../middlewares'

const router = express.Router()

router.get('/', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const lists = await prisma.user.findUnique({
    where: { id: req.auth.id },
    select: {
      id: true,
      uuid: true,
      username: true,
      lists: {
        select: {
          id: true,
          title: true,
          shortcuts: true,
        },
      },
    },
  })

  res.json(lists)
})

export default router
