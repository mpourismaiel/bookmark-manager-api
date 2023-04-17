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
    include: {
      lists: {
        include: {
          shortcuts: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      },
    },
  })

  res.json(lists)
})

export default router
