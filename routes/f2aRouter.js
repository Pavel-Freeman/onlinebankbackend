const Router = require('express')
const router = new Router()
const f2aController = require('../controllers/f2aController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/QRCode', authMiddleware, f2aController.getQRCode)
router.post('/set', authMiddleware, f2aController.set)


module.exports = router 