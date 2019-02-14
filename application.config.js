const Application = require('@oudy/backend/Application'),
  Entity = require('@oudy/backend-component-entity'),
  GraphQL = require('@oudy/backend-component-graphql'),
  MongoDB = require('./libraries/MongoDB')

Entity.use(Application)
GraphQL.use(Application)

class System {
  static async beforeStart(application, request, response) {
    console.log('Connecting to MongoDB')
    return Promise.all([
      MongoDB.ready
    ]).then(
      () => {
        console.log('Connected')
      }
    )
  }
}

module.exports = System