const crypto = require('crypto');

// algorithm used to symmtrical encryption/decryption (for storing privateKeys)
const ALGO = 'aes256';
const LENGTH = 16;
const SCRYPT_OPTIONS = {N: 262144, p: 1, r: 8};

module.exports = class LibEncrypt {

    /**
     *
     * @param {String} password
     * @param {Buffer} salt - use randombytes! to generate it!
     * @param {Number} hashLength - in BYTES!
     * @param {Options} options - @see https://nodejs.org/api/crypto.html#crypto_crypto_scryptsync_password_salt_keylen_options
     * @returns {Buffer}
     */
    static scrypt(password, salt, hashLength = 32, options) {
        return crypto.scryptSync(password, salt, hashLength, options);
    }

    static createKey(passwordHashFunction, password, salt, hashOptions) {
        let key;
        let options;
        switch (passwordHashFunction) {
            case 'argon2':
                key = this.argon2(password, salt, 32);
                break;
            case 'scrypt':
                options = {...SCRYPT_OPTIONS, ...hashOptions};
                options.maxmem = 129 * options.N * options.r;
                key = this.scrypt(
                    password,
                    salt,
                    32,
                    options
                );
                break;
            default:
                throw new Error(`Hash function ${passwordHashFunction} is unknown`);
                break;
        }
        return {key: Buffer.from(key, 'hex'), options};
    }

    /**
     * Used to stored privateKey
     *
     * @param {String} password - plain text (utf8) secret
     * @param {Object} objEncryptedData - {iv, encrypted, salt, hashOptions, keyAlgo}
     * @return {Buffer} - decrypted key
     */
    static decrypt(password, objEncryptedData) {
        let {iv, encrypted, salt, hashOptions, keyAlgo} = objEncryptedData;
        iv = Buffer.from(iv, 'hex');
        encrypted = Buffer.from(encrypted, 'hex');
        salt = !salt || Buffer.from(salt, 'hex');

        const {key} = this.createKey(
            keyAlgo,
            password,
            salt,
            hashOptions
        );

        const decipher = crypto.createDecipheriv(ALGO, key, iv);
        try {
            return Buffer.concat([decipher.update(encrypted), decipher.final()]);
        } catch (err) {
            return undefined;
        }
    }

    /**
     * Used to decrypt stored privateKey
     *
     *
     * @param {String} password - utf8 encoded
     * @param {Buffer} buffer - buffer to encode
     * @param {String} keyAlgo - @see this.createKey
     * @return {Object}
     */
    static async encrypt(password, buffer, keyAlgo = 'scrypt') {

        // generate salt for 'scrypt' & 'argon2'
        const salt = this.randomBytes(LENGTH);

        const {key, options: hashOptions} = this.createKey(keyAlgo, password, salt);
        const iv = this.randomBytes(LENGTH);
        const cipher = crypto.createCipheriv(ALGO, key, iv);
        const enc = Buffer.concat([cipher.update(buffer), cipher.final()]);

        return {
            iv,
            encrypted: enc,
            salt,
            hashOptions,
            keyAlgo
        };
    }

    static randomBytes(length) {
        return crypto.randomBytes(length);
    }
}

