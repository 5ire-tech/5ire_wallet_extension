import Web3 from "web3";
import * as ethers from "ethers";
import { EventEmitter } from 'events';
import Keyring from "@polkadot/keyring";
import * as protector from './protector';
import { Common } from '@ethereumjs/common';
import EthKeyring from '@metamask/eth-hd-keyring';
import * as utilCrypto from '@polkadot/util-crypto';
import { TransactionFactory } from "@ethereumjs/tx";
import { EventPayload } from "../Utility/network_calls";
import SimpleKeyring from '@metamask/eth-simple-keyring';
import { WALLET_TYPES, KEYRING_EVENTS } from "../Constants";
import { ERRCODES, ERROR_MESSAGES } from "../Constants/index";
import { ErrorPayload, Error } from "../Utility/error_helper";
// import { mnemonicToMiniSecret, ed25519PairFromSeed } from "@polkadot/util-crypto";



export class HybridKeyring extends EventEmitter {
    keyrings
    static vault = "";
    static password = "";
    static keyrings = [];
    static accounts = [];
    static isLocked = false;
    static ethKeyring;
    static polkaKeyring;
    static simpleEthKeyring;

    constructor() {
        super();
        this.initKeyring();
    }

    initKeyring() {
        HybridKeyring.polkaKeyring = new Keyring();
        HybridKeyring.ethKeyring = new EthKeyring();
        HybridKeyring.simpleEthKeyring = new SimpleKeyring();
    }

    /**
     * Generate random mnemonics with given length.
     * @param {number} length 
     * @returns 
     */
    generateRandomMnemonics(length = 12) {
        return utilCrypto.mnemonicGenerate(length).trim()
    }


    /**
     * Recover all keyrings and wallet using back json file
     * @param {*} data 
     * @param {*} password 
     */
    // async recoverWalletUsingJson(data, password) {
    //   const key = await protector.importKey(data.exportedKeyString)
    //   await protector.decryptWithKey(key, JSON.parse(data.vault));
    //   HybridKeyring.vault = data.vault;
    //   await protector.decryptWithDetail(password, HybridKeyring.vault);
    //   await this.loadPersistData(password, HybridKeyring.vault)
    // }


    /**
    * Backup wallet to json file.
    * @param {*} password 
    */
    async backupWallet(password) {
        await this._verifyPassword(password);
        return JSON.stringify(await this._persistData(password))
    }

    /**
   * Load encrypted state of all keyrings with password 
   * @param {string} password simpleEthKeyring
   * @param {string} vault 
   */
    async loadPersistData(password, vault) {

        const res = await protector.decryptWithDetail(password, vault);


        if (res.vault && res.vault.length > 0) {
            this.initKeyring();
            HybridKeyring.password = password;
            HybridKeyring.vault = vault;

            //Empty exsiting data to avoid duplicate content
            HybridKeyring.keyrings = [];
            HybridKeyring.accounts = [];

            for (const v of res.vault) {
                if (v.type === WALLET_TYPES.HD) {
                    //Load keyrings and add pairs in both evm and native signer
                    this._generateNativeAccounts(v)
                    await HybridKeyring.ethKeyring.deserialize(v)

                } else if (v.type === WALLET_TYPES.ETH_SIMPLE) {
                    const oldKeys = await HybridKeyring.simpleEthKeyring.serialize();
                    //Merge keys with existing keys from other keyrings like IMPORTED NATIVE
                    await HybridKeyring.simpleEthKeyring.deserialize(oldKeys.concat(v.private_keys));
                    for (const k of v.private_keys) {
                        HybridKeyring.polkaKeyring.addFromUri(k)
                    }

                } else if (v.type === WALLET_TYPES.IMPORTED_NATIVE) {

                    const oldKeys = await HybridKeyring.simpleEthKeyring.serialize();
                    for (const k of v.mnemonics) {
                        HybridKeyring.polkaKeyring.addFromUri(k)
                        const keyWallet = ethers.Wallet.fromMnemonic(k)
                        oldKeys.push(keyWallet.privateKey)
                    }
                    await HybridKeyring.simpleEthKeyring.deserialize(oldKeys)

                }
                HybridKeyring.keyrings.push(v)
                HybridKeyring.accounts = [...HybridKeyring.accounts, ...v.accounts]
            }
        } else {
            //Need to discuss with devs
            // this.createOrRestore(password)
        }
    }

    /**
     * Verify user's password.
     * @param {object} message 
     * @returns 
     */
    async verifyUserPassword(message) {
        const { password } = message.data;
        const verifiedResponse = await this._verifyPassword(password);
        const verified = verifiedResponse.vault ? true : false;

        return new EventPayload(message.event, message.event, { verified }, [], false);
    }

    /**
     * This method help to remove all active instances of keyring and lock everything except public keys.
     */
    lock(message) {

        HybridKeyring.keyrings = [];
        HybridKeyring.ethKeyring = undefined;
        HybridKeyring.polkaKeyring = undefined;
        HybridKeyring.simpleEthKeyring = undefined;
        HybridKeyring.password = ''
        HybridKeyring.isLocked = true;

        return new EventPayload(message.event, message.event, { isLogin: false }, [], false);
    }

    /**
     * Load keyring state back to instance.
     * @param {object} message 
     */
    async unlock(message) {

        let { password, vault } = message.data;

        vault = HybridKeyring.vault ? HybridKeyring.vault : vault;
        HybridKeyring.password = password;
        HybridKeyring.isLocked = false;
        await this.loadPersistData(HybridKeyring.password, vault);
        // const payload = { accounts: HybridKeyring.accounts, isLogin: true };

        return new EventPayload(message.event, message.event, { isLogin: true }, [], false);

    }

    /**
     * Create or restore mnemonics in HD wallet for first time in entire keyring lifecycle.
     * User load persistent data method if this is already done and you have vault info.
     * @param {object} message 
     * @returns 
     */
    // async createOrRestore(password, opts = {}) {
    async createOrRestore(message) {

        let { password, opts, type } = message.data;

        if (!password) {
            if (HybridKeyring.password)
                password = HybridKeyring.password;
            else throw new Error("Password required");
        }

        //We allow only one root account
        if (HybridKeyring?.accounts?.length > 0) {
            return HybridKeyring.accounts
        }
        HybridKeyring.password = password;
        this._initKeys(opts)
        const data = this._getKeyringData(WALLET_TYPES.HD);

        await HybridKeyring.ethKeyring.deserialize({ mnemonic: data.mnemonic, numberOfAccounts: data.numberOfAccounts });

        const ethAccounts = HybridKeyring.ethKeyring.getAccounts()
        const nativeAccounts = this._generateNativeAccounts(data);


        for (let i = 0; i < data.numberOfAccounts; i++) {
            const acc = {
                nativeAddress: nativeAccounts[i],
                evmAddress: Web3.utils.toChecksumAddress(ethAccounts[i]),
                type: WALLET_TYPES.HD,
                accountName: opts?.name || WALLET_TYPES.HD + "_" + i,
                accountIndex: i,
            }
            HybridKeyring.accounts.push(acc)
            data.accounts.push(acc)
        }

        const newAcc = { ...HybridKeyring.accounts[HybridKeyring.accounts.length - 1] };

        const key = await this._persistData(password);
        const keyResponse = await this._exportEthAccountByAddress(newAcc.evmAddress, HybridKeyring.password);


        newAcc.evmPrivateKey = keyResponse ? keyResponse : "";
        newAcc.mnemonic = data.mnemonic;

        const payload = { vault: key.vault, newAccount: newAcc, type };


        return new EventPayload(message.event, message.event, payload, [], false);

    }

    /**
     * Added new account in main HD wallet keyring.
     * @param {string} name 
     * @returns 
     */
    async addAccount(message) {
        const { name } = message.data;

        if (HybridKeyring.accounts.length <= 0) {
            throw new Error("No root account exists");
        }
        const keyring = this._getKeyringData(WALLET_TYPES.HD);

        const eth = await HybridKeyring.ethKeyring.addAccounts(1);
        //Check existing accounts in HD category
        const oldAccounts = HybridKeyring.accounts.filter(acc => acc.type === WALLET_TYPES.HD)
        const existingHdAccounts = oldAccounts.length
        const mainPair = HybridKeyring.polkaKeyring.getPair(oldAccounts[0]?.nativeAddress);
        const newKr = mainPair.derive("//" + existingHdAccounts);
        const newAcc = {
            nativeAddress: newKr.address,
            evmAddress: Web3.utils.toChecksumAddress(eth[0]),
            type: WALLET_TYPES.HD,
            accountName: name || WALLET_TYPES.HD + "_" + existingHdAccounts,
            accountIndex: existingHdAccounts,
        }

        HybridKeyring.accounts.push(newAcc);
        keyring.numberOfAccounts = existingHdAccounts + 1;
        keyring.accounts.push(newAcc);
        this.emit(KEYRING_EVENTS.ACCOUNT_ADDED, newAcc);

        const keyResponse = await this._exportEthAccountByAddress(newAcc.evmAddress, HybridKeyring.password);

        newAcc.evmPrivateKey = keyResponse ? keyResponse : "";
        newAcc.drivePath = "//" + existingHdAccounts;

        const response = await this._persistData(HybridKeyring.password);


        const payload = {
            newAccount: newAcc,
            vault: response.vault
        }
        // return newAcc;
        return new EventPayload(message.event, message.event, payload, [], false);
    }

    /**
     * Import other wallet keys like metamask, trustwallet etc and generate EVM and native accounts.
     * @param {string} pvtKey 
     * @param {string} name 
     * @returns 
     */
    async importAccountByPrivateKey(pvtKey, name = "") {


        const keyWallet = new ethers.Wallet(pvtKey)
        const isExist = HybridKeyring.accounts.find(acc => acc.evmAddress === keyWallet.address);

        if (isExist)
            // throw ("Account already exist");
            throw new Error("Account already exist");

        //Handle Keyring
        let keyring = this._getKeyringData(WALLET_TYPES.ETH_SIMPLE)

        if (keyring) {
            keyring.private_keys.push(pvtKey);
            keyring.numberOfAccounts++;
        } else {
            //Check if simple eth keyring not exists in array
            const newKeyring = {
                numberOfAccounts: 1,
                private_keys: [pvtKey],
                type: WALLET_TYPES.ETH_SIMPLE,
                accounts: []
            }
            HybridKeyring.keyrings.push(newKeyring)
            keyring = newKeyring;
        }

        //Eth flow
        const oldKeys = await HybridKeyring.simpleEthKeyring.serialize();
        oldKeys.push(pvtKey)
        await HybridKeyring.simpleEthKeyring.deserialize(oldKeys);
        const newAccountIndex = oldKeys.length - 1;
        const accounts = await HybridKeyring.simpleEthKeyring.getAccounts();
        const ethAddress = Web3.utils.toChecksumAddress(accounts[newAccountIndex]);

        //Generate native account from private key
        const newKr = HybridKeyring.polkaKeyring.addFromUri(pvtKey);

        const newAcc = {
            nativeAddress: newKr.address,
            evmAddress: ethAddress,
            type: WALLET_TYPES.ETH_SIMPLE,
            accountname: name || WALLET_TYPES.ETH_SIMPLE + "_" + keyring.numberOfAccounts,
            accountIndex: keyring.accounts.length
        }
        HybridKeyring.accounts.push(newAcc);
        //Push data for backup purpose
        keyring.accounts.push(newAcc)
        this.emit(KEYRING_EVENTS.ACCOUNT_ADDED, newAcc)
        await this._persistData(HybridKeyring.password)

        return newAcc
    }

    /**
     * Import wallet from mnemonics. User can add multiple mnemonics using this method.
     * @param {object} message 
     * @returns 
     */
    async importAccountByMnemonics(message) {
        try {
            const { mnemonic, name } = message?.data;
            const keyWallet = ethers.Wallet.fromMnemonic(mnemonic)
            const isExist = HybridKeyring.accounts.find(acc => acc.evmAddress === keyWallet.address);

            if (isExist)
                throw new Error("Account already exist");

            //Handle Keyring
            let keyring = this._getKeyringData(WALLET_TYPES.IMPORTED_NATIVE)

            if (keyring) {
                keyring.mnemonics.push(mnemonic);
                keyring.numberOfAccounts++;
            } else {
                //Check if simple eth keyring not exists in array
                const newKeyring = {
                    numberOfAccounts: 1,
                    mnemonics: [mnemonic],
                    type: WALLET_TYPES.IMPORTED_NATIVE,
                    accounts: []
                }
                HybridKeyring.keyrings.push(newKeyring)
                keyring = newKeyring;
            }

            //Eth flow
            const oldKeys = await HybridKeyring.simpleEthKeyring.serialize();
            oldKeys.push(keyWallet.privateKey)
            await HybridKeyring.simpleEthKeyring.deserialize(oldKeys);
            const ethAddress = Web3.utils.toChecksumAddress(keyWallet.address);

            //Generate native account from private key
            const newKr = HybridKeyring.polkaKeyring.addFromUri(mnemonic);

            const newAcc = {
                nativeAddress: newKr.address,
                evmAddress: ethAddress,
                type: WALLET_TYPES.IMPORTED_NATIVE,
                accountName: name || WALLET_TYPES.IMPORTED_NATIVE + "_" + keyring.numberOfAccounts,
                accountIndex: keyring.accounts.length
            }
            HybridKeyring.accounts.push(newAcc);

            //Push data for backup purpose
            keyring.accounts.push(newAcc)
            this.emit(KEYRING_EVENTS.ACCOUNT_ADDED, newAcc);
            const response = await this._persistData(HybridKeyring.password);

            const payload = {
                newAccount: newAcc,
                vault: response.vault
            };

            // return newAcc
            return new EventPayload(null, message.event, payload, [], false);

        } catch (error) {
            console.log("error in import account by mnemonic : ", error);
            return new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_PROPERTY)).throw();
        }


    }

    /**
    * Remove account by address. Address can be natvie or eth.
    * @param {object} message 
    */
    async removeAccount(message) {
        console.log("Message ::: ", message);
        const { address } = message?.data;
        const password = message?.data?.password ? message?.data?.password : HybridKeyring.password;

        await this._verifyPassword(password);
        const info = HybridKeyring.accounts.find(acc => acc.evmAddress === address || acc.nativeAddress === address);

        if (!info)

            throw new Error("No account exist with this address");

        const keyring = this._getKeyringData(info.type)

        if (info.type === WALLET_TYPES.HD) {
            HybridKeyring.ethKeyring.removeAccount(info.evmAddress)

        } else if (info.type === WALLET_TYPES.ETH_SIMPLE) {
            HybridKeyring.simpleEthKeyring.removeAccount(info.evmAddress)
            keyring.private_keys.splice(info.accountIndex, 1)
        } else if (info.type === WALLET_TYPES.IMPORTED_NATIVE) {
            HybridKeyring.simpleEthKeyring.removeAccount(info.evmAddress)
            keyring.mnemonics.splice(info.accountIndex, 1)
        }
        HybridKeyring.polkaKeyring.removePair(info.nativeAddress)


        keyring.numberOfAccounts--;
        keyring.accounts = keyring.accounts.filter(acc => acc.evmAddress !== info.evmAddress)
        HybridKeyring.accounts = HybridKeyring.accounts.filter(acc => acc.evmAddress !== info.evmAddress)

        //Persist state
        const prsistRes = await this._persistData(HybridKeyring.password)
        const payload = {
            vault: prsistRes.vault,
            accounts: HybridKeyring.accounts
        }

        // return accounts
        return new EventPayload(message.event, message.event, payload, [], false);
    }

    /**
      * Forgot Password by Mnemonic
      * @param {object} message
      */
    async forgotPassByMnemonic(message) {
        try {
            this.initKeyring();
            HybridKeyring.vault = "";
            HybridKeyring.accounts = [];
            const createRes = await this.createOrRestore(message);
            return createRes;

        } catch (error) {
            console.log("error in forgot by mnemonic : ", error);
            return new Error(new ErrorPayload(ERRCODES.INTERNAL, ERROR_MESSAGES.INVALID_PROPERTY)).throw();
        }
    }


    /**
     * Remove account from keyring by given address.
     * @param {string} password 
     * @param {string} address 
     */
    async removeEthAccount(password, address) {

        await this._verifyPassword(password)
        const info = HybridKeyring.accounts.find(acc => acc.evmAddress === address);

        if (!info)
            throw new Error("No account exist with this address")

        const keyring = this._getKeyringData(info.type)

        if (info.type === WALLET_TYPES.HD) {
            HybridKeyring.ethKeyring.removeAccount(address)

        } else if (info.type === WALLET_TYPES.ETH_SIMPLE) {
            HybridKeyring.simpleEthKeyring.removeAccount(address)
            keyring.private_keys.splice(info.accountIndex, 1)
        } else if (info.type === WALLET_TYPES.IMPORTED_NATIVE) {
            HybridKeyring.simpleEthKeyring.removeAccount(address)
            keyring.mnemonics.splice(info.accountIndex, 1)
        }

        keyring.numberOfAccounts--;
        keyring.accounts = keyring.accounts.filter(acc => acc.evmAddress !== address)
        HybridKeyring.accounts = HybridKeyring.accounts.filter(acc => acc.evmAddress !== address)

        //Persist state
        await this._persistData(HybridKeyring.password)

    }

    /**
     * Remove given  address pair from keyring and update vault state.
     * @param {string} password 
     * @param {string} address 
     */
    async removeNativeAccount(password, address) {
        await this._verifyPassword(password)

        const info = HybridKeyring.accounts.find(acc => acc.nativeAddress === address);

        if (!info)
            throw new Error("No account exist with this address")

        const keyring = this._getKeyringData(info.type)
        if (info.type === WALLET_TYPES.ETH_SIMPLE) {
            keyring.private_keys.splice(info.accountIndex, 1)
        }
        else if (info.type === WALLET_TYPES.IMPORTED_NATIVE) {
            keyring.mnemonics.splice(info.accountIndex, 1)
        }

        HybridKeyring.polkaKeyring.removePair(address)

        keyring.numberOfAccounts--;
        keyring.accounts = keyring.accounts.filter(acc => acc.nativeAddress !== address)
        HybridKeyring.accounts = HybridKeyring.accounts.filter(acc => acc.nativeAddress !== address)

        //Persist state
        await this._persistData(HybridKeyring.password)

    }

    /**
     * Get all accounts list in form of array.
     * @returns 
     */
    getAccounts(message) {
        console.log("Accounts :: ",HybridKeyring.accounts);
        console.log("vault :: ",HybridKeyring.vault);

        return new EventPayload(null, message.event, HybridKeyring.accounts, [], false);
    }

    /**
     * Get native keyring pair by given address.
     * You can use this pair to sign native transactions.
     * @param {string} address 
     * @returns 
     */
    getNativeSignerByAddress(address) {
        return HybridKeyring.polkaKeyring.getPair(address)
    }


    async signEthTx(address, tx) {

        const acc = HybridKeyring.accounts.find(acc => acc.evmAddress === address);

        const common = Common.custom({ chainId: 997, networkId: 1 }, { hardfork: "london" })
        const txn = TransactionFactory.fromTxData(tx, { common });


        let signedTx = null;
        if (acc.type === WALLET_TYPES.HD) {
            signedTx = await HybridKeyring.ethKeyring.signTransaction(address, txn)
        }
        else if (acc.type === WALLET_TYPES.ETH_SIMPLE || acc.type === WALLET_TYPES.IMPORTED_NATIVE) {
            signedTx = await HybridKeyring.simpleEthKeyring.signTransaction(address, txn)

        } else {
            throw new Error("Invalid address");
        }
        return '0x' + signedTx.serialize().toString('hex');
    }

    /**
     * Sign native transaction with given pair address.
     * @param {string} address 
     * @param {object} tx 
     * @returns 
     */
    async signNativeTx(address, tx) {
        const pair = this.getNativeSignerByAddress(address);
        return pair.sign(tx)
    }

    async exportPrivatekey(message) {
        const { address } = message.data;
        const result = await this._exportEthAccountByAddress(address, HybridKeyring.password);
        const payload = { privateKey: result ? result : "" }
        return new EventPayload(message.event, message.event, payload, [], false);
    }

    async exportSeedPhrase(message) {
        const { address } = message.data;
        const result = await this._exportNativeAccountByAddress(address, HybridKeyring.password);
        const payload = { seedPhrase: result };
        return new EventPayload(message.event, message.event, payload, [], false);
    }


    /******************************** Internal methods ***********************/
    /**
     * This internal method generate default HD native addresses.
     * @private
     * @param {object} data 
     * @returns 
     */

    _generateNativeAccounts(data) {
        const accounts = [];
        const keyringPair = HybridKeyring.polkaKeyring.addFromUri(data.mnemonic)
        accounts.push(keyringPair.address);
        if (data.numberOfAccounts > 1) {

            for (let i = 1; i < data.numberOfAccounts; i++) {
                const derivedPair = keyringPair.derive("//" + i);
                // const derivedPair = HybridKeyring.polkaKeyring.addFromUri(data.mnemonic + "//" + i)
                accounts.push(derivedPair.address)
            }
        }
        return accounts
    }

    /**
    * Export eth private key from keyring in plaintext.
    * @private
    * @param {string} address 
    * @param {string} password 
    * @returns 
    */
    async _exportEthAccountByAddress(address, password) {

        await this._verifyPassword(password);

        const acc = HybridKeyring.accounts.find(acc => acc.evmAddress === address);
        if (!acc) {
            throw new Error("Invalid address");
        }
        let pvtKey = "";
        if (acc.type === WALLET_TYPES.HD) {
            pvtKey = await HybridKeyring.ethKeyring.exportAccount(address)

        } else if (acc.type === WALLET_TYPES.ETH_SIMPLE || acc.type === WALLET_TYPES.IMPORTED_NATIVE) {
            pvtKey = await HybridKeyring.simpleEthKeyring.exportAccount(address)
        }
        return "0x" + pvtKey
    }

    /**
     * Export native account secrets from keyring in plaintext.
     * @private
     * @param {string} address 
     * @param {string} password 
     * @returns 
     */
    async _exportNativeAccountByAddress(address, password) {

        await this._verifyPassword(password);

        const acc = HybridKeyring.accounts.find(acc => acc.nativeAddress === address);
        if (!acc) {
            throw new Error("Invalid address")
        }
        if (acc.type === WALLET_TYPES.HD) {
            const data = this._getKeyringData(WALLET_TYPES.HD)
            const path = acc.accountIndex === 0 ? '' : "//" + acc.accountIndex;
            return data.mnemonic + path
        } else if (acc.type === WALLET_TYPES.ETH_SIMPLE) {
            const data = this._getKeyringData(WALLET_TYPES.ETH_SIMPLE)
            return data.private_keys[acc.accountIndex];

        } else if (acc.type === WALLET_TYPES.IMPORTED_NATIVE) {
            const data = this._getKeyringData(WALLET_TYPES.IMPORTED_NATIVE)
            return data.mnemonics[acc.accountIndex];
        } else {
            throw new Error("Invalid keyring");
        }
    }

    /**
     * Verify user's keyring password.
     * @private
     * @param {string} password 
     * @returns 
     */
    async _verifyPassword(password) {
        const res = await protector.decryptWithDetail(password, HybridKeyring.vault);
        HybridKeyring.password = password;
        return res;
    }

    /**
     * This internal method emit  state change event and store encrypted wallet in current instance.
     * @private
     * @param {string} password 
     */
    async _persistData(password) {
        const res = await protector.encryptWithDetail(password, HybridKeyring.keyrings);
        this.emit(KEYRING_EVENTS.STATE_CHANGED, res);
        HybridKeyring.vault = res.vault
        return res;
    }

    /**
    * This is internal method to get keyring details based on given type.
    * @private
    * @param {string} type 
    * @returns 
    */
    _getKeyringData(type = WALLET_TYPES.HD) {
        return HybridKeyring.keyrings.find(kr => kr.type === type)
    }

    /**
     * This internal method is used to create first keyring and accept optional mnemonics and number of default accounts.
     * @private
     * @param {object} opts 
     */
    _initKeys(opts) {
        HybridKeyring.keyrings.push({
            numberOfAccounts: opts?.numberOfAccounts || 1,
            mnemonic: opts?.mnemonic || this.generateRandomMnemonics(),
            type: WALLET_TYPES.HD,
            accounts: []
        })
    }
}
