const pubsub = require('../libraries/pubsub'),
  {
    withFilter
  } = require('apollo-server-core'),
  {
    GraphQLID
  } = require('@oudy/graphql'),
  BeatsDatum = require('../types/common/BeatsDatum'),
  ProgressDatum = require('../types/common/ProgressDatum'),
  moment = require('moment')

pubsub.subscribe('all', message => {
  console.log('all', message)
})

module.exports = {
  beatsData: {
    type: BeatsDatum,
    args: {
      category: {
        type: GraphQLID
      },
      candidate: {
        type: GraphQLID
      }
    },
    subscribe(source, args) {
      if (args.category || args.candidate)
        return pubsub.asyncIterator(args.category || args.candidate)
      return pubsub.asyncIterator('all')
    },
    resolve(source) {
      return {
        timestamp: moment().millisecond(0).seconds(0).valueOf() / 1000,
        sum: source.change
      }
    }
  },
  progressData: {
    type: ProgressDatum,
    args: {
      category: {
        type: GraphQLID
      },
      candidate: {
        type: GraphQLID
      }
    },
    subscribe(source, args) {
      if (args.category || args.candidate)
        return pubsub.asyncIterator(args.category || args.candidate)
      return pubsub.asyncIterator('all')
    },
    resolve(source) {
      return {
        timestamp: moment().millisecond(0).seconds(0).valueOf() / 1000,
        sum: source.votes
      }
    }
  }
}