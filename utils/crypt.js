const crypto = require('crypto');

//Encrypting text
function encrypt(text) {
   let cipher = crypto.createCipheriv(process.env.CRYPT_ALG, Buffer.from(process.env.CRYPT_KEY, 'hex'), Buffer.from(process.env.CRYPT_IV, 'hex'));
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return encrypted.toString('hex')
}

// Decrypting text
function decrypt(text) {
   let encryptedText = Buffer.from(text.encryptedData, 'hex');
   let decipher = crypto.createDecipheriv(process.env.CRYPT_ALG, Buffer.from(process.env.CRYPT_KEY, 'hex'), Buffer.from(process.env.CRYPT_IV, 'hex'));
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

module.exports = {
    encrypt,
    decrypt,
}