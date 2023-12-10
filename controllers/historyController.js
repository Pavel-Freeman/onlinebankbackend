const ApiError = require('../error/ApiError');
const {User, History} = require('../models/models')
const { where, Op, order, attributes } = require('sequelize');


class HistoryController
{
  async getListWithAccount(accountId){
    const account = await Accounts.findOne({
        where:{id: accountId, userId: req.user.id}
    })

    if(!account)
       return next(ApiError.badRequest('Тип счета не предналежит данному пользователю и/или счет не найден'))   
    
    //новое
    let {limit, page} = req.query
    page = page || 1
    limit = limit || 8
    let offset = page * limit - limit
    //.findAndCountAll({limit, offset})

    const histories = await History.findAll(
      {where:{
         userId: req.user.id, accountId: accountId }
      },

      {order: [
        ['id', 'DESC'], //только id? 
      ]},
      
      {attributes:
        ['senderName', 'receiverName', 'amount', 'createdAt'] //преобразовать createdAt в нормальный формат
      }
    )
    return histories 
  }

  async getListWithoutAccount(req, res, next){

    const histories = await History.findAll(
      {
      where: { userId: req.user.id },
      attributes: ['senderName', 'receiverName', 'amount', 'createdAt'],
      order: [['createdAt', 'DESC']], // Сортировка по убыванию по полю "createdAt"
    });

    return res.json({ histories })
  }

  async getList(req, res, next)
  {
    const { accountId } = req.body

    const histories = (accountId !== undefined) ? await this.getListWithAccount(accountId) : await this.getListWithoutAccount()

    return res.json({ histories })
  }
}

module.exports = new HistoryController()