const {Cards} = require('../models/models')
const ApiError = require('../error/ApiError');

module.exports = async function(req, res, next)
{
  if(req.method === "OPTIONS")
  {
    next()
  }
  const cardId = req.body.cardId ? req.body.cardId : req.params.cardId

  if(!cardId || typeof(cardId) !== 'number')
    return ApiError.badRequest('cardId не определен').fill(res)

  let card = await Cards.findOne({where:{ id: req.cardId, userId: req.user.id }})
  if(!card)
    return ApiError.forbidden('У пользователя нет прав').fill(res)
  next()
};