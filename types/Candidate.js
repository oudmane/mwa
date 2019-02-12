const Entity = require('@oudy/entity-mongodb'),
  {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLInt,
    GraphQLBoolean,
    Scalar
  } = require('@oudy/graphql'),
  {
    $type,
    $pubsub,
    $listQuery
  } = GraphQLEntity = require('@oudy/graphql-entity'),
  Category = require('./Category')

class Candidate extends GraphQLEntity.use(Entity) {
  static [$listQuery](resolve, options = { fields: {}, args: {} }) {
    options.args.query = {
      type: Scalar
    }
    return super[$listQuery](resolve, options)
  }
}

Candidate[$type] = new GraphQLObjectType({
  name: 'Candidate',
  fields() {
    return {
      id: {
        type: GraphQLID
      },
      category: Category.config,
      name: {
        type: GraphQLString
      },
      rtl: {
        type: GraphQLBoolean
      },
      votes: {
        type: GraphQLInt
      },
      image: {
        type: GraphQLString
      }
    }
  }
})

module.exports = Candidate