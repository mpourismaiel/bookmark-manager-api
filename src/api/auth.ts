import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Request } from 'express-jwt'
import { v4 as uuid } from 'uuid'

import { User } from '../models'
import { auth } from '../middlewares'

const router = express.Router()

const createToken = user =>
  jwt.sign(
    { id: user.id, uuid: user.uuid, username: user.username },
    process.env.JWT_SECRET || 'just-in-dev',
  )

router.post('/register', async (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' })
    return
  }

  try {
    const user = await User.create({
      username,
      password: bcrypt.hashSync(password, 10),
      uuid: uuid(),
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

  const user = await User.findOne({ uuid: req.auth.uuid })
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

  const updatedUser = await User.updateOne({ _id: user._id }, updateData)
  res.json(updatedUser)
})

router.post('/login', async (req, res) => {
  const username = req.body.username
  let user = await User.findOne({ username })

  if (!user) {
    user = await User.findOne({ uuid: username })
  }

  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  if (user.password && req.body.password) {
    const checkPassword = bcrypt.compareSync(req.body.password, user.password)
    if (!checkPassword) {
      res.status(401).json({ error: 'uuid, username or password not valid' })
      return
    }
  } else if (
    (user.password && !req.body.password) ||
    (!user.password && req.body.password)
  ) {
    res.status(401).json({ error: 'uuid, username or password not valid' })
    return
  }

  const token = createToken(user)
  res.json({ token, uuid: user.uuid, username: user.username })
})

export default router
