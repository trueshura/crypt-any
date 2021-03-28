const {questionAsync} = require('./utils');
const LibEncrypt = require('./crypto-utils');

main().then(() => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});

async function main() {
    const strFileContent = await questionAsync('Paste file to decrypt:');
    const strPass=await questionAsync('Enter password:', true);
    const objResult = JSON.parse(strFileContent);

    const buffResult = await LibEncrypt.decrypt(strPass, objResult);
    console.log(buffResult.toString());
}
