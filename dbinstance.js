const {Currency, TypeAccount, Blocks, Accounts} = require('./models/models')

var cc = require('currency-codes/data');

const createCurrency = async (id, type) => {
    try{
  await Currency.create({
        id: id, 
        type: type
    })
    }catch(e){}
}

const createCurrencies = async () =>{
  cc.map( currency => {
    createCurrency(parseInt(currency.number), currency.code)
  })
}

const createAccountType = async(type) =>{
    try{
  await TypeAccount.create({
        type: type
    })
}catch(e){}
}

// const createBankAccount = async() =>{
//   try{
//     await Accounts.create({
//       id : 0,
//       amount: 10000000,
//       name: 'Bank',
//       userId: 0,
//       currencyId: 978,
//       typeAccountId: 1,
//       requisites: 'BY00BANK00000000000000000000'
//     })
//   }catch(e){}
// }



const createAccountTypes = async () =>{
  createAccountType("DEBIT")
  createAccountType("CREDIT")
}

const createBlock = async (type) => {
    try{
   await Blocks.create({
        type: type
    })
    }catch(e){}
}


const createBlocks = async() =>{
  createBlock("unblock")
  createBlock("block by user")
  createBlock("block by sysadmin")
}



module.exports = function(){
    createCurrencies()
    createAccountTypes()
    createBlocks()
    createBankAccount()
}