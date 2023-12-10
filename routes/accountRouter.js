const Router = require('express')
const router = new Router()
const accountController = require('../controllers/accountController')
const authMiddleware = require('../middleware/authMiddleware')
const accountBelongingMiddleware = require('../middleware/accountBelongingMiddleware')

router.get('/', authMiddleware, accountController.getList)
router.get('/:accountId', authMiddleware, accountController.getDetails)
router.get('/credits/:creditId', authMiddleware, accountController.getCreditDetails)
router.get('/withoutcard/:id', authMiddleware, accountController.getListWithoutCard)
router.post('/', authMiddleware, accountController.create)
router.patch('/:id', authMiddleware, accountBelongingMiddleware, accountController.update)
router.delete('/:id', authMiddleware, /*accountBelongingMiddleware,*/ accountController.delete)
router.post('/transfer/', authMiddleware, accountController.transfer)

module.exports = router 