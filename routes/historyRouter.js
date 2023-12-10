const Router = require('express')
const router = new Router()
const historyController = require('../controllers/historyController')
const authMiddleware = require('../middleware/authMiddleware')
const accountBelongingMiddleware = require('../middleware/accountBelongingMiddleware')

router.get('/', authMiddleware, historyController.getListWithoutAccount)

module.exports = router 