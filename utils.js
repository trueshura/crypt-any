const readline = require('readline');

module.exports={
    questionAsync,
    prepareForStringifyObject
}

function questionAsync(prompt, password = false) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(prompt, answer => {
            rl.close();
            if (password) {
                if (process.stdout.moveCursor) process.stdout.moveCursor(0, -1);
                if (process.stdout.clearLine) process.stdout.clearLine();
            }
            resolve(answer.trim());
        });
    });
}

function prepareForStringifyObject (obj) {
    if (!(obj instanceof Object)) return obj;

    if (Buffer.isBuffer(obj)) return obj.toString('hex');
    if (Array.isArray(obj)) return obj.map(elem => prepareForStringifyObject(elem));

    const resultObject = {};
    for (let key of Object.keys(obj)) {
        if (typeof obj[key] === 'function' || typeof obj[key] === 'undefined') continue;

        if (Buffer.isBuffer(obj[key])) {
            resultObject[key] = obj[key].toString('hex');
        } else if (Array.isArray(obj[key])) {
            resultObject[key] = prepareForStringifyObject(obj[key]);
        } else if (obj[key] instanceof Object) {
            resultObject[key] = prepareForStringifyObject(obj[key]);
        } else {
            resultObject[key] = obj[key];
        }
    }
    return resultObject;
};
