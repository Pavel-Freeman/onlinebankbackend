const {Accounts} = require('../models/models')
const ApiError = require('../error/ApiError');

module.exports = async function(req, res, next)
{
  if(req.method === "OPTIONS")
  {
    next()
  }
  const accountId = req.body.accountId ? req.body.accountId : req.params.accountId

  if(!accountId || typeof(accountId) !== 'number')
    return ApiError.badRequest('accountId не определен').fill(res)

  const userId = req.user.id

  let account = await Accounts.findOne({where:{ id: accountId, userId }})
  if(!account)
    return ApiError.forbidden('У пользователя нет прав').fill(res)
  req.account = account
  next()
};