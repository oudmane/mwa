const Entity = require('@oudy/entity-mongodb'),
  {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
  } = require('@oudy/graphql'),
  {
    $type,
    $pubsub
  } = GraphQLEntity = require('@oudy/graphql-entity')

class Category extends GraphQLEntity.use(Entity) {

}

Category[$type] = new GraphQLObjectType({
  name: 'Category',
  fields() {
    return {
      id: {
        type: GraphQLID
      },
      name: {
        type: GraphQLString
      }
    }
  }
})

module.exports = Category