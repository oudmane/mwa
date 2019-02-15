const {
  RedisPubSub
} = require('graphql-redis-subscriptions')

module.exports = new RedisPubSub({
  connection: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379,
    retry_strategy: options => {
      return Math.max(options.attempt * 100, 3000);
    }
  }
})