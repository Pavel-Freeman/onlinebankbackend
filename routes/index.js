const Router = require('express')
const router = new Router()
const userRouter = require('./userRouter')
const accountRouter = require('./accountRouter')
const cardRouter = require('./cardRouter')
const historyRouter = require('./historyRouter')
const f2aRouter = require('./f2aRouter')
const analyticsRouter = require('./analyticsRouter')

router.use('/users', userRouter)
router.use('/cards', cardRouter)
router.use('/accounts', accountRouter)
router.use('/histories', historyRouter)
router.use('/f2a', f2aRouter)
router.use('/analytics', analyticsRouter)

module.exports = router