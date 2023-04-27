// Import CryptoJS module
const CryptoJS = require("crypto-js");

// Retrieve secret key from environment variables
const cryptoSecret = process.env.CRYPTO_SECRET_KEY;

// Function to encrypt user data
function encryptData(userData) {
  // Encrypt the user data using AES and the secret key, then convert it to a string
  return CryptoJS.AES.encrypt(JSON.stringify(userData), cryptoSecret).toString();
}

// Function to decrypt encrypted data -> used with validating mobile app access token and checking if encoded user data sent to web browser is original
function decryptData(encryptedData, key) {
  // Decrypt the encrypted data using AES and the provided key
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  // Convert the decrypted data to a UTF-8 string
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Export the encryptData and decryptData functions
module.exports = { encryptData, decryptData };