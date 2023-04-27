// create a utility to encrypt and decrypt the user data

const CryptoJS = require("crypto-js");

const cryptoSecret = process.env.CRYPTO_SECRET_KEY

function encryptData(userData) {
  return CryptoJS.AES.encrypt(JSON.stringify(userData), cryptoSecret).toString();
}

function decryptData(encryptedData, key) {
  console.log("en: " + encryptedData)
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  console.log("bytes: " + bytes)
  console.log("final: " + bytes.toString(CryptoJS.enc.Utf8))
  return bytes.toString(CryptoJS.enc.Utf8);
}

module.exports = { encryptData, decryptData };