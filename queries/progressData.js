const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
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
    resolve() {
      const now = moment().seconds(0),
        before = moment().seconds(0).add(-60, 'minutes')
      return ElasticSeatch.connection.search({
        index: 'changes',
        type: '_doc',
        size: 0,
        body: {
          "query": {
            "bool": {
              "must": [
                {
                  range: {
                    timestamp: {
                      gt: before.valueOf(),
                      lt: now.valueOf()
                    }
                  }
                }
              ],
              "must_not": [

              ]
            }
          },
          "aggs": {
            "votes": {
              "date_histogram": {
                "field": "timestamp",
                "interval": "minute",
                "order": {
                  "_key": "asc"
                }
              },
              "aggs": {
                "sum": {
                  "sum": {
                    "field": "votes"
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