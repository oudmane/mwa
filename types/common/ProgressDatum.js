const {
  GraphQLObjectType,
  GraphQLInt
} = require('@oudy/graphql')

module.exports = new GraphQLObjectType({
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