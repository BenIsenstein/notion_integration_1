// Import environment variables
require("dotenv").config()
require("./helpers").initGoogleApi()

// Import other packages
const createError = require('http-errors')
const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

// Define express app
const app = express()

// Configure Express App
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Routes
app.use('/api', require('./routes/apiRouter'))

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