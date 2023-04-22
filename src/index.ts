import { app } from './app'

const port = process.env.PORT || 3000
if (!process.env.PORT) {
  console.log('PORT is not defined, using 3000')
}

// if app is run with --seed, seed the database
if (process.argv.includes('--seed')) {
  console.log('🥂 Seeding database...')
  import('./models/_seed').then(seed => {
    seed
      .default()
      .then(() => {
        console.log('🔥 Done')
        process.exit(0)
      })
      .catch(e => {
        console.error('❌', e)
        process.exit(1)
      })
  })
} else {
  app.listen(port, () => {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`)
    /* eslint-enable no-console */
  })
}
