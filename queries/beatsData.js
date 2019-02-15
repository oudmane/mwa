const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} = require('@oudy/graphql'),
  ElasticSeatch = require('../libraries/ElasticSearch'),
  moment = require('moment')

module.exports = {
  beatsData: {
    type: new GraphQLObjectType({
      name: 'BeatsData',
      fields() {
        const BeatsDatum = new GraphQLObjectType({
          name: 'BeatsDatum',
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
            type: new GraphQLList(BeatsDatum)
          }
        }
      }
    }),
    resolve() {
      const now = moment().seconds(0),
        before = moment().seconds(0).add(-10, 'minutes')
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
                    "field": "change"
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