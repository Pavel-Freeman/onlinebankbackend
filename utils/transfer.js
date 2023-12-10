const { Accounts, Currency, User, History } = require('../models/models');
const { Sequelize } = require('sequelize');
const sequelize = require('../db');

const CC = require('currency-converter-lt')

let currencyConverter = new CC()

const getOutAccount = async (requisites) => {
    const account = await Accounts.findOne({
        raw: true,
        where: { requisites: requisites },
        attributes: [
            'id', 
            'amount', 
            'requisites',
            [Sequelize.col('currency.type'), 'currency'],
            [Sequelize.col('user.name'), 'name'],
            [Sequelize.col('user.surname'), 'surname'],
        ],
        include: [
            {
                model: Currency,
                attributes: []
            },
            {
                model: User,
                attributes: []
            }
        ]
    })

    if(account){
        account.personName = account.name + " " + account.surname
        account.isOur = true
    }

    return account
}

const getAlienAccount = async (requisites) => {
    throw ApiError.badRequest("Данный банк не поддерживает взаимодействия с чужими банками")
}

const getAccount = async (requisites) => {
    let account = await getOutAccount(requisites)
    if( !account ) 
        account = await getAlienAccount(requisites)
    return account
}

const findCurrencyId = async (currencyType) => {
    const currency = await Currency.findOne({ where: { type: currencyType }})
    if(!currency)
        throw ApiError.forbbiden("Не найдена валюта в справочнике")

    return currency.id
}

const updateOur = async (account, accountFrom, accountTo, amount, options, userID) => {
    await History.create({
            amount: amount,
            initiator: account.requisites,
            sender: accountFrom.requisites,
            senderName: accountFrom.personName,
            receiver: accountTo.requisites,
            receiverName: accountTo.personName,
            senderCurrencyId: await findCurrencyId(accountFrom.currency),
            receiverCurrencyId: await findCurrencyId(accountTo.currency),
            userId: userID
        }, options)

    options.where = { id: account.id }
    const am = account.amount + amount
    await Accounts.update({ amount: am }, options);
}

const updateAlien = async (account, accountFrom, accountTo, amount) => {
    throw ApiError.badRequest("Данный банк не поддерживает взаимодействия с чужими банками")
}

const updateAccount = async (account, accountFrom, accountTo, amount, options, userID) => {
    if( account.isOur == true){
       await updateOur(account, accountFrom, accountTo, amount, options,  userID)
    }else{
        await updateAlien(account, accountFrom, accountTo, amount, options)
    }
}

const transfer = async(accountRequisitesFrom, accountRequisitesTo, amount, userID) => {
    let accountFrom =  await getAccount(accountRequisitesFrom)
    let accountTo = await getAccount(accountRequisitesTo)

    if(accountFrom.amount < amount)
        throw ApiError.badRequest("Недостаточно средств на счете")

    const amount_convert = await currencyConverter.from(accountFrom.currency).to(accountTo.currency).amount(amount).convert()

    await sequelize.transaction(async (t) => {
        await updateAccount(accountFrom, accountFrom, accountTo, -amount, { transaction: t }, userID)
        await updateAccount(accountTo, accountFrom, accountTo, amount_convert, { transaction: t }, userID)
    })
    return { success: true }
}

const getUserIdByRequisitesOur = async(requisites) => {
    let account = await Accounts.findOne({
      where:{ requisites },
      attributes: [],
      include: [
          {
              model: User,
              attributes: [ 'id' ]
          }
      ]
    })

    return account.user;
}

const getUserIdByRequisitesOther = async(requisites) =>{
   throw ApiError.badRequest("Данный банк не поддерживает взаимодействия с чужими банками") 
}


const getUserIdByRequisites = async(requisites) =>{
    let user = await getUserIdByRequisitesOur(requisites);
    if( !user)
        user = await getUserIdByRequisitesOther(requisites);
    return user.id;
}

module.exports = {
    transfer,
    getUserIdByRequisites,
}