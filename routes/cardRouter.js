const Router = require('express')
const router = new Router()
const cardController = require('../controllers/cardController')
const authMiddleware = require('../middleware/authMiddleware')
const cardBelongingMiddleware = require('../middleware/cardBelongingMiddleware')
const accountBelongingMiddleware = require('../middleware/accountBelongingMiddleware')

router.get('/', authMiddleware, cardController.getList)
router.get('/:id', authMiddleware, cardController.getDetails)
router.post('/', authMiddleware, accountBelongingMiddleware, cardController.create)
router.post('/block/', authMiddleware, /*cardBelongingMiddleware*/ cardController.block)
router.post('/unblock/', authMiddleware, /*cardBelongingMiddleware*/cardController.unblock)

module.exports = router 