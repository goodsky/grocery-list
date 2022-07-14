const http = require('http')

const app = require('./backend/app')
const logger = require('./backend/utils/logger')

const PORT = process.env.PORT || 8080

const server = http.createServer(app)
server.listen(PORT, () => {
    logger.log(`super-list has started on port ${PORT}`)
})
