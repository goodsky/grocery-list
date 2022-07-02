const http = require('http')
const app = require('./backend/app')

const PORT = process.env.PORT || 8080

const server = http.createServer(app)
server.listen(PORT, () => {
  console.log(`super-list has started on port ${PORT}`)
})
