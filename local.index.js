"use strict";

for (const [key, value] of Object.entries(require('./env.json'))) {
  process.env[key] = value
}

exports.__esModule = true
exports = require('./controllers')
