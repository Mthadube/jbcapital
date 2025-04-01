const bcrypt = require('bcryptjs');

/**
 * Generate a secure password hash
 * @param {string} password 
 * @returns {Promise<string>} Hashed password
 */
const generatePasswordHash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare a candidate password with a hash
 * @param {string} candidatePassword 
 * @param {string} hash 
 * @returns {Promise<boolean>} Whether the password matches
 */
const comparePasswords = async (candidatePassword, hash) => {
  return await bcrypt.compare(candidatePassword, hash);
};

module.exports = {
  generatePasswordHash,
  comparePasswords
}; 