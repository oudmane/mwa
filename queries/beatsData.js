const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList
} = require('@oudy/graphql'),
  ElasticSeatch = require('../libraries/ElasticSearch'),
  BeatsDatum = require('../types/common/BeatsDatum'),
  moment = require('moment')

module.exports = {
  beatsData: {
    type: new GraphQLObjectType({
      name: 'BeatsData',
      fields() {
        return {
          data: {
            type: new GraphQLList(BeatsDatum)
          }
        }
      }
    }),
    args: {
      category: {
        type: GraphQLID
      },
      candidate: {
        type: GraphQLID
      }
    },
    resolve(source, args) {
      const now = moment().seconds(0),
        before = moment().seconds(0).add(-20, 'minutes'),
        must = [{
          range: {
            timestamp: {
              gt: before.valueOf(),
              lte: now.valueOf()
            }
          }
        }];
      ['category', 'candidate'].forEach(
        key =>
          args[key] && must.push({
            term: {
              [key]: {
                value: args[key]
              }
            }
          })
      )
      return ElasticSeatch.connection.search({
        index: 'changes',
        type: '_doc',
        size: 0,
        body: {
          query: {
            bool: {
              must
            }
          },
          aggs: {
            votes: {
              date_histogram: {
                field: "timestamp",
                interval: "minute",
                order: {
                  _key: "asc"
                }
              },
              aggs: {
                sum: {
                  sum: {
                    field: "change"
                  }
                }
              }
            }
          }
        }
      }).then(
        response => {
          console.log(response.aggregations.votes.buckets.length)
          return {
            data: response.aggregations.votes.buckets.map(
              bucket => ({
                timestamp: bucket.key / 1000,
                sum: bucket.sum.value
              })
            )
          }
        }
      )
    }
  }
}