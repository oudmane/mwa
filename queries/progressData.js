const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require('@oudy/graphql'),
  ElasticSeatch = require('../libraries/ElasticSearch'),
  moment = require('moment')

module.exports = {
  progressData: {
    type: new GraphQLObjectType({
      name: 'ProgressData',
      fields() {
        const ProgressDatum = new GraphQLObjectType({
          name: 'ProgressDatum',
          fields: {
            timestamp: {
              type: GraphQLInt,
            },
            sum: {
              type: GraphQLInt
            }
          }
        })
        return {
          data: {
            type: new GraphQLList(ProgressDatum)
          }
        }
      }
    }),
    resolve() {
      const now = moment().seconds(0),
        before = moment().seconds(0).add(-1, 'days')
      console.log({
        gt: before.valueOf(),
        lt: now.valueOf()
      })
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