require("dotenv").config()
require('./helpers').initGoogleApi()
require('./cron').startJobs()
import { existsSync } from 'fs'
import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import apiRouter from './routes/apiRouter'

const app = express()

// Configure Express App
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Healthcheck route
app.get('/health', (req, res) => {
  if (existsSync(`${__dirname}/credentials`)) {
    res.sendStatus(200)
  } else {
    res.sendStatus(418)
  }
})

// Routes
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)))

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.send('error')
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server listening on port ' + port))