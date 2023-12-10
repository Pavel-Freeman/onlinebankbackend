const ApiError = require('../error/ApiError');
const { User, Accounts, Currency, TypeAccount, Credit } = require('../models/models')
const { getRandomInt, makeId } = require('../utils/utils')
const { Sequelize } = require('sequelize')
const { TypeAccountEnum } = require('../utils/constants')
const { transfer, getUserIdByRequisites } = require('../utils/transfer')
const f2aController = require('./f2aController')
const refinancingRate = require("./../utils/refinancingRate")

class AccountController {
  async getList(req, res, next)
  {
    const accounts = await Accounts.findAll({
        raw: true,
        where:{userId: req.user.id},
        attributes: [
        'id', 
        'name',
        [Sequelize.literal('CAST(amount AS DECIMAL(10, 2))'),'amount'], 
        [Sequelize.col('currency.type'), 'currency'],
        [Sequelize.col('type_account.type'), 'typeAccount']],
        include: [
            {
                model: Currency,
                attributes: []
            }, 
            {
              model: TypeAccount,
              attributes: []
            }
        ]
    })

    return res.json({accounts})
  }

  async getDetails(req, res, next) {
    const { accountId } = req.params

    let accId = -1;
    try {
      accId = parseInt(accountId)
    } catch (err) {
      return next(ApiError.badRequest('Некорректно задано accountId'))
    }

    const account = await Accounts.findOne({
      raw: true,
      where: { id: accId, userId: req.user.id },
      attributes: [
        'id',
        'name',
        [Sequelize.literal('CAST(amount AS DECIMAL(10, 2))'), 'amount'],
        'requisites',
        [Sequelize.col('currency.type'), 'currency'],
        [Sequelize.col('type_account.type'), 'typeAccount']
      ],
      include: [
        {
          model: Currency,
          attributes: []
        },
        {
          model: TypeAccount,
          attributes: []
        }
      ]
    })
    if (!account)
      return next(ApiError.badRequest('Тип счета не предналежит данному пользователю и/или счет не найден'))

    return res.json({ account })
  }

  async  getCreditDetails(req, res, next) {
    const { creditId } = req.params

    let accId = -1;
    try {
      accId = parseInt(creditId)
    } catch (err) {
      return next(ApiError.badRequest('Некорректно задано accountId'))
    }

    const credit = await Credit.findOne({
      raw: true,
      where: { accountId: accId, userId: req.user.id },
      attributes: [
        'id',
        [Sequelize.literal('CAST(amount AS DECIMAL(10, 2))'), 'amount'],
        'term',
        'refinancingRate',
        [Sequelize.literal('CAST(month_amount AS DECIMAL(10, 2))'), 'month_amount'],
      ],
    })
    if (!credit)
      return next(ApiError.badRequest('Кредит не предналежит данному пользователю и/или кредит не найден'))

    return res.json({ credit })
  }

  async getListWithoutCard(req, res, next) {

    const accounts = await Accounts.findAll({
      where: { userId: req.user.id, cardId: null },
      attributes: ['id', 'name'],
    })

    return res.json({ accounts })
  }

  async createCredit(creditAmount, term, accountId, next) {
    await Credit.create({ amount: creditAmount, term: term, accountId: accountId })
  }

  async create(req, res, next) {
    const { accountName, currencyId, typeAccountId, creditAmount, term } = req.body

    if (!accountName || typeof (accountName) !== 'string')
      return next(ApiError.badRequest('Некорректно задано имя счета'))

    if (!currencyId || typeof (currencyId) !== 'number' || ! await Currency.findOne({ where: { id: currencyId } }))
      return next(ApiError.badRequest('Некорректно задана волюта'))

    if (!typeAccountId || typeof (typeAccountId) !== 'number' || ! await TypeAccount.findOne({ where: { id: typeAccountId } }))
      return next(ApiError.badRequest('Некорректно задан тип счета'))

    const user = req.user;

    let requisites = "";
    let accountReq = null;
    do {
      requisites = 'BY' + getRandomInt(10, 99) + "BANK" + "3012" + makeId(16);
      accountReq = await Accounts.findOne({ where: { requisites: requisites } });
    } while (accountReq != undefined && accountReq);

    let account = undefined;
    try {
      account = await Accounts.create({
        amount: 0,
        name: accountName,
        userId: user.id,
        currencyId: currencyId,
        typeAccountId: typeAccountId,
        requisites: requisites
      })
    } catch (err) {
      return next(ApiError.internal(err.message))

    }

    if (typeAccountId == TypeAccountEnum.CREDIT) {
      await Credit.create(
        {
          amount: creditAmount,
          term: term,
          accountId: account.id,
          refinancingRate: await refinancingRate.refinancingOnData(new Date()),
          month_amount: (parseFloat(creditAmount) + (parseFloat(creditAmount) * ( parseFloat(await refinancingRate.refinancingOnData(new Date())) / 100) )) / parseFloat(term),
          userId: user.id,
        }
      )
      let oldAcc = await Accounts.findOne({ where: { id: 0 } })
      await Accounts.update({
        amount: parseFloat(oldAcc.amount) - parseFloat(creditAmount)
      },{where:{ id: 0}})
      await Accounts.update({
        amount: parseFloat(creditAmount)
      },{where:{ id: account.id}})
    }

    return res.json({ accountId: account.id })
  }

  async update(req, res, next) {
    const { id } = req.params
    const { accountName } = req.body

    if (!accountName || typeof (accountName) !== 'string')
      return next(ApiError.badRequest('Некорректно задано имя счета'))

    const account = req.account
    try {
      await Accounts.update({
        name: accountName
      }, { where: { id: account.id } })
    } catch (err) {
      return next(ApiError.internal(err.message))

    }
    return res.json({ account })
  }

  async delete(req, res, next) {
    await req.account.destroy()
    return res.json({ success: true })
  }

  async transfer(req, res, next) {
    const userID = req.user.id;
    const { requisitesFrom, requisitesTo, amount, code } = req.body

    if (!requisitesFrom || typeof (requisitesFrom) !== 'string')
      return next(ApiError.badRequest('Некорректно задано requisitesFrom'))

    if (!requisitesTo || typeof (requisitesTo) !== 'string')
      return next(ApiError.badRequest('Некорректно задано requisitesTo'))

    if (!amount || typeof (amount) !== 'number')
      return next(ApiError.badRequest('Некорректно задано amount'))

    if (!code || typeof (code) !== 'string')
      return next(ApiError.badRequest('Некорректно задано code'))

    if (requisitesFrom === requisitesTo)
      return next(ApiError.badRequest('Реквизиты отправителя и получателя не должны совпадать'))

    try {
      if (! await f2aController.check(code, await getUserIdByRequisites(requisitesFrom)))
        return next(ApiError.badRequest('Некорректно веден код'))
    } catch (err) {
      return next(err)
    }
    let success = {}
    try {
      success = await transfer(requisitesFrom, requisitesTo, amount, userID)
    } catch (err) {
      return next(err)
    }
    return res.json(success)
  }

}

module.exports = new AccountController()