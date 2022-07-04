const Router = require('express')

const router = Router()
router.get('/', (request, response) => {
  const hello = {
    message: `Hello World! The time is ${new Date()}.`,
  }

  response.status(200).json(hello)
})

module.exports = router
