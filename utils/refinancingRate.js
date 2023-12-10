const { response } = require('express');
var { doRequest } = require('./httpsRequest');


const refinancingOnData = async (date) => {

  const year = date.getFullYear();
  const month = date.getMonth() + 1; // Т.к. JS считает месяцы с 0 до 11, нужно добавить 1
  const day = date.getDate();
  const formattedDate = `${year}-${month}-${day}`;

  
  let responseData = await doRequest(process.env.RBNB_BANK + 'RefinancingRate?onDate=' + formattedDate,
            'GET'
  );
 
  return JSON.parse(responseData)[0]["Value"];
}


module.exports = {
    refinancingOnData
}