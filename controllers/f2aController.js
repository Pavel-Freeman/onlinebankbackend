const ApiError = require('../error/ApiError');
const {User, F2A} = require('../models/models')
const  qrcode = require('qrcode');
const { authenticator } = require('otplib');

class F2AController
{

  async getQRCode(req, res, next)
  {
    const user = req.user
    const secret = authenticator.generateSecret()
    const uri = authenticator.keyuri(user.login, "BANKING", secret);
    const image = await qrcode.toDataURL(uri);

    let f2a = await F2A.findOne({where:{userId:user.id}})

    if(!f2a){
      f2a = await F2A.create({ userId: user.id, enabled: false, secretKey: ""});
    }
    f2a.secretKey = secret;
    await f2a.save();

    return res.json({image})
  }

  async set(req, res, next){
    const { code } = req.body

    if (!code) {
      return next(ApiError.badRequest('Некорректно задан code'))
    }

    let f2a = await F2A.findOne({where:{userId:req.user.id}})

    if(!f2a){
      f2a = await F2A.create({ userId: user.id, enabled: false, secretKey: ""});
    }

    if(f2a.secretKey === "") {
      return next(ApiError.badRequest('Не был сгенерирован qrcode'))
    }

    const verified = authenticator.check(code, f2a.secretKey)
    if(!verified) {
      return next(ApiError.badRequest('Некорректно введен код'))
    }

    f2a.enabled = true
    await f2a.save()

    return res.json({ success: true })
  }

  async check(code, userId){

    if (!code || typeof(code) !== 'string')
      throw ApiError.badRequest('Некорректно задан code')

    let f2a = await F2A.findOne({where:{userId}})

    if (!f2a)
      throw ApiError.badRequest('Двойная аутентификация не найдена')

    if (!f2a.enabled)
      throw ApiError.badRequest('Двойная аутентификация не подтверждена')

    const verified = authenticator.check(code, f2a.secretKey)
    return verified
  }
}

module.exports = new F2AController()