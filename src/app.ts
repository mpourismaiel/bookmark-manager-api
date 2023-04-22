import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import mongoose from 'mongoose'

require('dotenv').config()
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined')
}

mongoose.connect(process.env.DATABASE_URL)

import middlewares from './middlewares'
import api from './api'

const createApp = () => {
  const app = express()

  app.use(morgan('dev'))
  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.get('/', (req, res) => {
    res.json({
      message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
    })
  })

  app.use('/api/v1', api)

  app.use(middlewares.notFound)
  app.use(middlewares.errorHandler)

  return app
}

export const app = createApp()
