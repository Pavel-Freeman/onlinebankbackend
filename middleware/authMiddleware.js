const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const ApiError = require('../error/ApiError');

module.exports = async function(req, res, next)
{
  if(req.method === "OPTIONS")
  {
    next()
  }
  try
  {
    const token = req.headers.authorization.split(' ')[1] // Bearer hbrjdbdnbjn
    if(!token)
    {
      return res.status(401).json({message: "Не авторизован"})
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY)
    req.user = await User.findOne({where:{ id: decoded.id }});
    if(!req.user)
      return res.status(401).json({message: "Не авторизован"}) 
    next()
  } catch(e)
  {
    res.status(401).json({message: "Не авторизован"}) 
  }
};