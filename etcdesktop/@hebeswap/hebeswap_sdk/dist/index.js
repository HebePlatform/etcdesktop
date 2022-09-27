
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./hebeswap_sdk.cjs.production.min.js')
} else {
  module.exports = require('./hebeswap_sdk.cjs.development.js')
}
