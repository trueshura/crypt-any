const {questionAsync, prepareForStringifyObject} = require('./utils');
const LibEncrypt = require('./crypto-utils');

main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    const strContent = await questionAsync('Enter text to encrypt:', true);
    const strPass = await questionAsync('Enter password:', true);
    const strPassConfirm = await questionAsync('Re-Enter password:', true);
    if(strPass !== strPassConfirm) throw new Error('Passwords doesnt match!');

    const objResult = await LibEncrypt.encrypt(strPass, Buffer.from(strContent));
    console.dir(JSON.stringify(prepareForStringifyObject(objResult)), {colors: true, depth: null});
}
