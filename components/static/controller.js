const serveStatic = require('serve-static'),
  path = require('path'),
  serve = serveStatic(
    path.join(__dirname, '../../dist'),
    {
      fallthrough: false
    }
  )

class Controller {
  static async run(application, request, response, route, payload) {
    return new Promise(
      resolve => {
        serve(request, response, resolve)
      }
    ).then(
      error => {
        console.log(error)
        response.finished = true
      }
    )
  }
}

Controller.route = {
  url: /.*/
}

console.log('Static')

module.exports = Controller