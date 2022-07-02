const Router = require('express')

const router = Router()
router.get('/', (request, response) => {
  const hello = {
    message: 'Hello World!',
  }

  response.status(200).json(hello)
})

module.exports = router
