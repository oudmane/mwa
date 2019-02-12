// Usealy I'll run this using global command backend (Install @oudy/backend -g)

const Server = require('@oudy/backend/Server')

const server = new Server(8080, '0.0.0.0', true)

console.log('Helloooo')