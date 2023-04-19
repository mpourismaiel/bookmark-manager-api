import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'
import { Request } from 'express-jwt'
import { v4 as uuid } from 'uuid'

import { prisma } from '../app'
import { auth } from '../middlewares'

const router = express.Router()

const createToken = (user: User) =>
  jwt.sign(
    { id: user.id, uuid: user.uuid, username: user.username },
    process.env.JWT_SECRET || 'just-in-dev',
  )

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  try {
    const user = await prisma.user.create({
      data: {
        uuid: uuid(),
        username: username || '',
        password: password ? bcrypt.hashSync(password, 10) : '',
      },
    })

    const token = createToken(user)
    res.json({ token, uuid: user.uuid, username })
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' })
    return
  }
})

router.put('/profile', auth, async (req: Request, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.auth.id } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const { username, password } = req.body
  const updateData: any = {}
  if (!!username) {
    updateData.username = username
  }
  if (!!password) {
    updateData.password = bcrypt.hashSync(password, 10)
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.auth.id },
    data: updateData,
  })
  res.json(updatedUser)
})

router.post('/login', async (req, res) => {
  const username = req.body.username
  let user: User | null = null
  user = await prisma.user.findUnique({ where: { username } })

  if (!user) {
    user = await prisma.user.findUnique({ where: { uuid: username } })
  }

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  if (user.password) {
    const checkPassword = bcrypt.compareSync(req.body.password, user.password)
    if (!checkPassword) {
      res.status(401).json({ error: 'uuid, username or password not valid' })
      return
    }
  }

  const token = createToken(user)
  res.json({ token, uuid: user.uuid, username: user.username })
})

export default router
