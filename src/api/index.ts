import express from 'express'
import auth from './auth'
import shortcuts from './shortcuts'
import lists from './lists'
import users from './users'

const router = express.Router()

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  })
})

router.use('/auth', auth)
router.use('/shortcuts', shortcuts)
router.use('/lists', lists)
router.use('/users', users)

export default router
