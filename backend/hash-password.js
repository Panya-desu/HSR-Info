const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the password to hash: ', (password) => {
    if (!password) {
        console.error('Password cannot be empty');
        rl.close();
        process.exit(1);
    }
    
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error('Error hashing password:', err);
        } else {
            console.log('\n--- Hashed Password ---');
            console.log(hash);
            console.log('-----------------------\n');
            console.log('Copy the hash value above and paste it in your backend .env file as:');
            console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
        }
        rl.close();
    });
});
