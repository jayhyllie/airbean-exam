const bcrypt = require('bcryptjs');

async function hashPW(password) {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
}

async function comparePW(password, hashed) {
    const exist = await bcrypt.compare(password, hashed);
    return exist;
}

module.exports = { hashPW, comparePW }