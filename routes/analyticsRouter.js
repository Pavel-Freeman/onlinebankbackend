const Router = require('express')
const router = new Router()
const analyticsController = require('../controllers/analyticsController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/currencies',  analyticsController.getCurrencies)
router.get('/typesaccount',  analyticsController.getTypesAccount)
router.get('/accountswithoutcard', authMiddleware, analyticsController.getAccountsWithoutCard)
router.get('/accountswithcard', authMiddleware, analyticsController.getAccountsWithCard)

module.exports = router 