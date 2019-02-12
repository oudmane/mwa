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
  static async afterLoad(application, request, response, route, payload) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  }
}

module.exports = System