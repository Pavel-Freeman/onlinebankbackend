const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, F2A} = require('../models/models')
const { encrypt } = require('../utils/crypt')

var numberReg = '[0-9]'
var yearReg = '([0-9][0-9])';            ///< Allows a number between 2014 and 2029
var monthReg = '(0[1-9]|1[0-2])';               ///< Allows a number between 01 and 12
var dayReg = '(0[1-9]|[1-2][0-9]|3[0-1])';   ///< Allows a number between 01 and 31
var regionReg = '[A-Z]'                         ///< 
var serialNumberReg = '[0-9]{3}'
var citizenshipReg = '[A-Z]{2}'
var checkSum = '[0-9]'
var reg = new RegExp('^' + numberReg + dayReg + monthReg  + yearReg + regionReg + serialNumberReg + citizenshipReg + checkSum + '$');

var loginReg = new RegExp('[A-Za-z0-9]+')
var engPassReg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[\\W])[A-Za-z\\d\\W]{8,}$", 'g')

const generateJwt = (id, login) =>
{
  return jwt.sign(
    {id, login},
    process.env.SECRET_KEY,
    {expiresIn: '24h'})
}

function isLetter(str) {
  return str.match("[A-Z]");
}

function checkIdentNumber(identNumber){
    if (!identNumber || typeof(identNumber) !== 'string' || !reg.test(identNumber))
        return false;
    let sum = 0;
    let arr = [7,3,1];
    for(let i = 0; i < identNumber.length - 1; i++){
        let number = 0;
        if(isLetter(identNumber[i]))
            number = identNumber.charCodeAt(i) - 'A'.charCodeAt(0) + 10;
        else
            number = parseInt(identNumber[i]);
        sum = (sum + arr[i % arr.length] * number) % 10;
    }
    return sum === parseInt(identNumber[identNumber.length - 1]);
}

class UserController
{

  async registration(req, res, next)
  {
    const {identNumber, name, login, password, surname} = req.body
    if(!checkIdentNumber(identNumber))  
    {
      return next(ApiError.badRequest('Некорректный введен идентификационный номер'))
    }
    if(!name || typeof(name) !== 'string' || !surname || typeof(surname) !== 'string'){
        return next(ApiError.badRequest('Некорректно введено имя и/или фамилия'))
    }
    if( !login || typeof(login) !== 'string' || !loginReg.test(login)){
        return next(ApiError.badRequest('Некорректно введен логин'))
    }
    if( !password || typeof(password) !== 'string' || !engPassReg.test(password)){
        return next(ApiError.badRequest('Некорректно введен пароль'))
    }

    let candidate = await User.findOne({where:{identNumber : encrypt(identNumber)}})
    if(candidate) 
    {
      return next(ApiError.badRequest('Пользователь с таким идентификационный номер уже существует'))
    }else {
        const candidate = await User.findOne({where:{login}})
        if(candidate) 
        {
            return next(ApiError.badRequest('Пользователь с таким логином уже существует'))
        }
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const user = await User.create({identNumber: encrypt(identNumber), name, surname, login, password: hashPassword})
    await F2A.create({ userId: user.id, enabled: false, secretKey: ""})
    const token = generateJwt(user.id, user.login)

    return res.json({token, f2a: false})
  }

  async login(req, res, next)
  {
    const {identify, password} = req.body
    let user = await User.findOne({where:{ login:identify }})
    if(!user)
    {
      user = await User.findOne({where:{ identNumber:encrypt(identify) }})
      if(!user)  
        return next(ApiError.internal('Неверно указан Логин/идентификационный номер и/или пароль'))
    }
    let comparePassword = bcrypt.compareSync(password, user.password)
    if(!comparePassword)
    {
      return next(ApiError.internal('Неверно указан Логин/идентификационный номер и/или пароль'))
    }
    const token = generateJwt(user.id, user.login)

    let f2a = await F2A.findOne({where:{userId:user.id}})
    const isf2a = f2a ? f2a.enabled: false

    return res.json({token, f2a: isf2a})
  }

  async check(req, res, next)
  {
    const token = generateJwt(req.user.id, req.user.email, req.user.role)
    let f2a = await F2A.findOne({where:{userId:req.user.id}})
    const isf2a = f2a ? f2a.enabled: false
    return res.json({token, f2a: isf2a})
  }
}

module.exports = new UserController()