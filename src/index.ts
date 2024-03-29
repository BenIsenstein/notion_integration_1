import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import apiRouter from './routes/apiRouter'
import { initGoogleApi } from './helpers'
import { db } from './repositories'

;(async () => {
  await initGoogleApi()
  const app = express()
  
  app.use(logger('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.get('/health', (req, res) => {
    res.sendStatus(200)
  })

  app.post('/db', (req, res) => {
    const query: string = req.body.query
    if (!query) return res.status(400).send('SQL Query Required')
    if ((req.headers.Authorization || req.headers.authorization) !== `Bearer ${process.env.SQLITE_TOKEN}`) return res.sendStatus(401)

    try {
      res.status(200).json(db.prepare(query).all())
    } catch(e) {
      res.status(400).send(e.message)
    }
  })

  app.use('/api', apiRouter)

  // catch 404 and forward to error handler
  app.use((req, res, next) => next(createError(404)))

  // error handler
  app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.send('error')
  })

  const port = process.env.PORT ? Number(process.env.PORT) : 3000
  app.listen(port, '[::]', () => console.log('Server listening on port ' + port))
})()
