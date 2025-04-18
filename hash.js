const bcrypt = require('bcrypt');

const plainTextPassword = '111111'; // 您的密码
const saltRounds = 10;

bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed Password:', hash);
});