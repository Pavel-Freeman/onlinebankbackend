const ApiError = require('../error/ApiError');
const { Currency, Accounts, TypeAccount, Cards } = require('../models/models')
const { Op } = require("sequelize");

class AnalyticsController
{

  async getCurrencies(req, res, next)
  {
    const currencies = await Currency.findAll({
      attributes: [
        'id',
        ['type', 'value']
      ]
    })
    return res.json({currencies})
  }

  async getAccountsWithoutCard(req, res, next){
    const accounts = await Accounts.findAll({
      where: { userId: req.user.id, cardId: null },
      attributes: [
        'id',
        'name'
      ]
    })
    return res.json({accounts})
  }

  async getAccountsWithCard(req, res, next){
    const accounts = await Accounts.findAll({
      where: { 
        userId: req.user.id
      },
      include: {
        model: Cards,
        where: {
          blockId: 1
        },
        required: true
      },
      attributes: [
        'id',
        'name',
        'amount',
        'requisites'
      ]
    });

    return res.json({accounts})
  }

  async getTypesAccount(req, res, next){
     const types = await TypeAccount.findAll({
      attributes: [
        'id',
        ['type', 'value']
      ]
    })
    return res.json({types})
  }
}

module.exports = new AnalyticsController()