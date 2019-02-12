const MongoDB = require('@oudy/mongodb')

MongoDB.ready = MongoDB.configure(
  process.env.MONGODB_URL || 'mongodb://mongodb',
  { useNewUrlParser: true },
  'mwa'
)

module.exports = MongoDB