const sequelize = require('../db')
const {DataTypes} = require('sequelize') //импортируем типы полей


const User = sequelize.define('user', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  identNumber:{type: DataTypes.STRING, unique:true, allowNull:false},
  login:{type: DataTypes.STRING, unique:true, allowNull:false},
  password:{type: DataTypes.STRING, allowNull:false},
  name: {type: DataTypes.STRING, allowNull:false},
  surname: {type: DataTypes.STRING, allowNull:false},
})

const F2A = sequelize.define('F2A', {
  userId: { type: DataTypes.INTEGER, primaryKey: true },
  enabled: {type: DataTypes.BOOLEAN, allowNull:false },
  secretKey: {type: DataTypes.STRING, allowNull:false },
})

const Cards = sequelize.define('card', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  number:{type: DataTypes.STRING, unique:true, allowNull:false},
  month: {type: DataTypes.INTEGER, allowNull:false},
  year: {type: DataTypes.INTEGER, allowNull:false},
  CVV:{type: DataTypes.INTEGER, allowNull:false},
  name: {type: DataTypes.STRING, allowNull:false},
})

const Blocks = sequelize.define('block', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  type:{type: DataTypes.STRING, primaryKey: true, allowNull:false, unique:true}
})

const Accounts = sequelize.define('accounts', 
{
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  amount: {type: DataTypes.NUMBER, allowNull:false},
  name: {type: DataTypes.STRING, allowNull:false},
  requisites: {type: DataTypes.STRING, unique: true, allowNull:false},
}, { indexes: [
    // Create a unique index on email
    {
      unique: true,
      fields: ['requisites']
    }
]})

const TypeAccount = sequelize.define('type_account', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  type:{type: DataTypes.STRING, allowNull:false, unique:true}
})

const Currency = sequelize.define('currency', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  type:{type: DataTypes.STRING, allowNull:false, unique:true}
})

const Credit = sequelize.define('credit', 
{
  id:{type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  amount:{type: DataTypes.NUMBER, allowNull:false},
  term:{type: DataTypes.INTEGER, allowNull:false },
  refinancingRate: {type: DataTypes.NUMBER, allowNull: false},
  month_amount:{type: DataTypes.NUMBER, allowNull:false},
  userId:{type: DataTypes.INTEGER, allowNull:false },
})

const History = sequelize.define('history', 
{
  id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull:false},
  amount: {type: DataTypes.NUMBER, allowNull:false},
  sender: {type: DataTypes.STRING, allowNull:false},
  senderName: {type: DataTypes.STRING, allowNull:false},
  receiver: { type: DataTypes.STRING, allowNull:false },
  receiverName: { type: DataTypes.STRING, allowNull:false },
  initiator: { type: DataTypes.STRING, allowNull:false }
})

// F2a.userId
User.hasOne(F2A, {foreignKey: { name: 'userId', allowNull: false }})
// user.f2aId
User.belongsTo(F2A, { onDelete: "CASCADE" })

User.hasMany(Cards, {onDelete: 'CASCADE'})
Cards.belongsTo(User, {foreignKey: { allowNull: false }})

Cards.belongsTo(Blocks, {foreignKey: { allowNull: false }})

Cards.belongsTo(Accounts, {foreignKey: { allowNull: false, unique: true }})
Accounts.belongsTo(Cards, {foreignKey: { unique: true }})

Accounts.belongsTo(TypeAccount, {foreignKey: { allowNull: false }})
Accounts.belongsTo(Currency, {foreignKey: { allowNull: false }})
Accounts.belongsTo(User, {foreignKey: { allowNull: false }})
User.hasMany(Accounts, {onDelete: 'CASCADE'})

Credit.belongsTo(Accounts, {foreignKey: { allowNull: false }})

User.hasMany(History, {onDelete: 'CASCADE'})
History.belongsTo(User, {foreignKey: {  name: 'userId', allowNull: false }})
History.belongsTo(Currency, { as: "senderCurrency" })
History.belongsTo(Currency, { as: "receiverCurrency" })

module.exports =
{
  User,
  F2A,
  Blocks,
  Cards,
  History,
  Accounts,
  TypeAccount,
  Currency,
  Credit,
} 