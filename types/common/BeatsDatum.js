const {
  GraphQLObjectType,
  GraphQLInt
} = require('@oudy/graphql')

module.exports = new GraphQLObjectType({
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