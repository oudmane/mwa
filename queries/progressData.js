const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLList
} = require('@oudy/graphql'),
  ElasticSeatch = require('../libraries/ElasticSearch'),
  ProgressDatum = require('../types/common/ProgressDatum'),
  moment = require('moment')

module.exports = {
  progressData: {
    type: new GraphQLObjectType({
      name: 'ProgressData',
      fields() {
        return {
          data: {
            type: new GraphQLList(ProgressDatum)
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
        before = moment().seconds(0).add(-24, 'hours'),
        must = [
          {
            range: {
              timestamp: {
                gt: before.valueOf(),
                lte: now.valueOf()
              }
            }
          }
        ];
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
                field: 'timestamp',
                interval: 'minute',
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                sum: {
                  sum: {
                    field: 'votes'
                  }
                }
              }
            }
          }
        }
      }).then(
        response => {
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