import { useState, useEffect } from "react";
import {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  ed25519PairFromSeed,
  cryptoWaitReady,
} from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
// import { waitReady } from "@polkadot/wasm-crypto";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { NETWORK, TX_TYPE, STATUS, NATIVE, EVM } from "../Constants/index";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { Keyring } from "@polkadot/keyring";
import {
  setCurrentAcc,
  setNewAccount,
  pushAccounts,
  setBalance,
  setTxHistory,
  resetBalance,
  toggleLoader,
} from "../Store/reducer/auth";
import { setAccountName } from "../Store/reducer/auth";
import Web3 from "web3";
import { decryptor, encryptor } from "../Helper/CryptoHelper";
import { BigNumber } from "bignumber.js";
// import { toast } from "react-toastify";

let evmApi = null;
let nativeApi = null;
let web3Provider = null;
let tempNet = null;

export default function UseWallet() {
  const [authData, setAuthData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });
  const {
    currentAccount,
    availableNetworks,
    currentNetwork,
    // balance,
    pass,
    accountName,
    accounts,
    isLogin,
  } = useSelector((state) => state?.auth);
  const dispatch = useDispatch();
  const [isApiReady, setReady] = useState(false);

  const resetApi = () => {
    evmApi = null;
    nativeApi = null;
  }

  useEffect(() => {
    if (currentNetwork.toLowerCase() === "testnet") {
      if (tempNet !== availableNetworks.testnet) {
        tempNet = (availableNetworks.testnet);
        setReady(false);
        dispatch(resetBalance());
        resetApi();
        Promise.all([initializeNativeApi(availableNetworks.testnet), initializeEvmApi(availableNetworks.testnet)])
          .then(() => {
            console.log("its running low");
            setReady(true);
          })
          .catch((err) => {
            console.log("Error while connecting the evm and native chain: ", err);
            setReady(false)
          })
      } else {
        setReady(true);
      }
    } else if (currentNetwork.toLowerCase() === "qa") {
      if (tempNet !== availableNetworks.qa) {
        tempNet = (availableNetworks.qa);
        setReady(false);
        dispatch(resetBalance());
        resetApi();
        Promise.all([initializeNativeApi(availableNetworks.qa), initializeEvmApi(availableNetworks.qa)])
          .then(() => {
            console.log("its running low");
            setReady(true);
          })
          .catch((err) => {
            console.log("Error while connecting the evm and native chain: ", err);
            setReady(false)
          })
      } else {
        setReady(true);
      }
    } else {

      let wsNetwork = currentNetwork?.toLowerCase() === (NETWORK.TEST_NETWORK).toLowerCase() ? availableNetworks?.testnet : availableNetworks?.qa;
      tempNet = wsNetwork;
      Promise.all([initializeNativeApi(wsNetwork), initializeEvmApi(wsNetwork)])
        .then(() => {
          console.log("its running low");
          setReady(true);
        })
        .catch((err) => {
          console.log("Error while connecting the evm and native chain: ", err);
          setReady(false);
        })
    }
  }, [currentNetwork]);

  // console.log("is api readddyyy : ", isApiReady);
  // console.log("currentNetwork ", currentNetwork, "temp net : ", tempNet);


  const initializeNativeApi = async (network) => {
    try {
      let provider = new WsProvider(network);
      nativeApi = await ApiPromise.create({ provider: provider });
      nativeApi.on("disconnected", async () => {
        nativeApi.connect();
      });
      console.log("native Api : ", nativeApi);
    } catch (error) {
      console.log("Error while making connection with Native Api");
    }
  };

  const initializeEvmApi = async (network) => {
    try {
      let options = {
        reconnect: {
          auto: true,
          delay: 5000, // ms
          maxAttempts: 10,
          onTimeout: false
        }
      };
      web3Provider = new Web3.providers.WebsocketProvider(network, options);
      evmApi = new Web3(web3Provider);

      web3Provider.on('end', async () => {
        console.log("Trying to reconnect with Evm api");
        initializeEvmApi();
      });
      web3Provider.on('error', async (e) => {
        console.log("error occued while making connection with web3 : ", e);
        initializeEvmApi();
      });

      console.log("evmApi : ", evmApi);
    } catch (error) {
      console.log("Error while making connection with Native Api");
    }
  };

  const getKey = (str, p) => {
    const seed = decryptor(str, p);
    if (seed) {
      const { privateKey } = ethers.Wallet.fromMnemonic(seed);

      return privateKey;
    }
  };

  const getAccId = (id) => {
    let index = accounts.findIndex((obj) => obj.id === id);
    return index;
  };

  const walletSignUp = () => {
    try {
      dispatch(toggleLoader(true));

      const SS58Prefix = 6;
      // Create mnemonic string for Alice using BIP39
      let temp1m = mnemonicGenerate();

      // Create valid Substrate-compatible seed from mnemonic
      const seedAlice = mnemonicToMiniSecret(temp1m);

      // Generate new public/secret keypair for Alice from the supplied seed
      const { publicKey } = ed25519PairFromSeed(seedAlice);

      const nativeAddress = encodeAddress(decodeAddress(publicKey, SS58Prefix));
      const { address, privateKey } = ethers.Wallet.fromMnemonic(temp1m);
      const id = accounts.length + 1;

      let dataToDispatch = {
        id,
        temp1m,
        accountName,
        txHistory: [],
        nativeAddress,
        evmAddress: address,
        temp2p: privateKey,
      };

      setAuthData(dataToDispatch);

      if (!isLogin) dispatch(setNewAccount(dataToDispatch));
      else {
        dataToDispatch = {
          ...dataToDispatch,
          temp1m: encryptor(temp1m, pass),
          temp2p: null,
        };
        dispatch(setCurrentAcc(dataToDispatch));
        dispatch(pushAccounts(dataToDispatch));
      }
      dispatch(toggleLoader(false));

      return {
        error: false,
        data: "success!",
      };
    } catch (error) {
      console.log("error occured while creating new account ", error);
      dispatch(toggleLoader(false));

      return {
        error: true,
        data: "Error Occured!",
      };
    }
  };

  const getEvmBalance = async () => {
    try {

      const w3balance = await evmApi?.eth.getBalance(
        currentAccount?.evmAddress
      );
      let payload = {
        of: EVM,
        // balance: (Number(w3balance) / Math.pow(10, 18)),
        balance: new BigNumber(w3balance).dividedBy(10 ** 18),
      };
      console.log(
        "evm balance : ",
        payload.balance
      );
      dispatch(setBalance(payload));
    } catch (error) {
      console.log("Error while geting balance of evm : ", error);
    }
  };

  const getNativeBalance = async () => {
    try {
      const nbalance = await nativeApi?.derive.balances.all(
        currentAccount?.nativeAddress
      );
      let payload = {
        of: NATIVE,
        // balance: (Number(nbalance.availableBalance) / Math.pow(10, 18)),
        balance: new BigNumber(nbalance.availableBalance).dividedBy(10 ** 18),
      };
      console.log(
        "nativeBalance : ",
        payload.balance
      );

      dispatch(setBalance(payload));
    } catch (error) {
      console.log("Error while getting balance of native : ", error);
    }
  };

  const evmTransfer = async (data, isBig = false) => {
    return (new Promise(async (resolve, reject) => {
      try {
        dispatch(toggleLoader(true));
        const transactions = {
          from: currentAccount?.evmAddress,
          value: isBig
            ? data.amount
            // : (Number(data.amount) * Math.pow(10, 18)).toString(),
            : (new BigNumber(data.amount).multipliedBy(10 ** 18)).toString(),
          gas: 21000, //wei
          data: data?.data,
          nonce: await evmApi.eth.getTransactionCount(
            currentAccount?.evmAddress,
            "pending"
          ),
        };
        const gasTx = {
          from: transactions.from,
          value: transactions.value,
        };
        if (data.to) {
          transactions.to = Web3.utils.toChecksumAddress(data.to);
          gasTx.to = transactions.to;
        }
        if (transactions.data) {
          gasTx.data = transactions.data;
        }
        const gasAmount = await evmApi.eth.estimateGas(gasTx);
        transactions.gas = gasAmount;

        let temp2p = getKey(currentAccount.temp1m, pass);
        const signedTx = await evmApi.eth.accounts.signTransaction(
          transactions,
          temp2p
        );
        const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const hash = txInfo.transactionHash;

        if (hash) {

          let index = getAccId(currentAccount.id);
          let dataToDispatch = {
            data: {
              chain: currentNetwork.toLowerCase(),
              isEvm: true,
              dateTime: new Date(),
              to: data.to,
              type: TX_TYPE?.SEND,
              amount: data.amount,
              txHash: hash,
              status: STATUS.PENDING
            },
            index: index,
          };
          dispatch(setTxHistory(dataToDispatch));
          dispatch(toggleLoader(false));
          resolve({
            error: false,
            data: hash,
          });
        }
        else throw new Error("Error occured! ");
      } catch (error) {
        console.log("Error occured while evm transfer: ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while sending!",
        });
      }
    }))

  };

  const nativeTransfer = async (data) => {

    return new Promise(async (resolve, reject) => {

      try {
        let hash, err;
        dispatch(toggleLoader(true));
        let dataToDispatch = {
          data: {
            chain: currentNetwork.toLowerCase(),
            isEvm: false,
            dateTime: new Date(),
            to: data.to,
            type: TX_TYPE?.SEND,
            amount: data.amount,
          },
          index: getAccId(currentAccount.id)
        };

        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

        const transfer = nativeApi.tx.balances.transferKeepAlive(
          data.toAddress,
          (new BigNumber(data.amount).multipliedBy(10 ** 18)).toString()
        );

        //Send and sign txn
        transfer.signAndSend(alice, ({ status, events, txHash }) => {

          if (status.isInBlock) {

            if (hash !== txHash.toHex()) {
              hash = txHash.toHex();
              console.log("Hash : ", hash);
              let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

              //Matching Extrinsic Events for get the status
              phase.forEach(({ event }) => {

                if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                  err = false;
                  console.log("Extrinsic Success !! ");
                  dataToDispatch.data.status = STATUS.SUCCESS;
                } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                  err = false;
                  console.log("Extrinsic Failed");
                  dataToDispatch.data.status = STATUS.FAILED;
                }
                dispatch(toggleLoader(false));
              });

              dataToDispatch.data.txHash = hash;
              dispatch(setTxHistory(dataToDispatch));
              if (err) {
                resolve({
                  error: true,
                  data: "Error while sending!"
                })
              } else {
                resolve({
                  error: false,
                  data: hash
                })
              }
            }
          }
        });

      } catch (error) {
        console.log("Error while native transfer : ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while sending!",
        });
      }
    })
  };

  const nativeToEvmSwap = async (amount) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 1, err, evmDepositeHash, signedHash;
        dispatch(toggleLoader(true));
        let dataToDispatch = {
          data: {
            chain: currentNetwork.toLowerCase(),
            isEvm: false,
            dateTime: new Date(),
            to: "Native to Evm",
            type: TX_TYPE?.SWAP,
            amount: amount,
          },
          index: getAccId(currentAccount.id)
        };

        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

        let deposit = await nativeApi.tx.evm.deposit(
          currentAccount?.evmAddress,
          (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
        );

        evmDepositeHash = deposit.hash.toHex();

        deposit.signAndSend(alice, ({ status, events, txHash }) => {

          if (status.isInBlock) {
            console.log("Calling Count::: ", count);
            count++;
            if (signedHash !== txHash) {
              signedHash = txHash.toHex();
              console.log("Hash : ", signedHash);
              let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

              //Matching Extrinsic Events for get the status
              phase.forEach(({ event }) => {

                if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                  err = false;
                  console.log("Extrinsic Success !! ");
                  dataToDispatch.data.status = STATUS.SUCCESS;
                } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                  err = true;
                  console.log("Extrinsic Failed !!");
                  dataToDispatch.data.status = STATUS.FAILED;
                }
                dispatch(toggleLoader(false));
              });

              dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: signedHash };
              console.log("Data to dispatch : ", dataToDispatch);
              dispatch(setTxHistory(dataToDispatch));
              if (err) {
                resolve({
                  error: true,
                  data: "Error while sending!"
                })
              } else {
                resolve({
                  error: false,
                  data: evmDepositeHash
                })
              }
            }
          }
        });
      } catch (error) {
        console.log("Error occured while swapping native to evm : ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while swapping!",
        });
      }
    })
  };

  const evmToNativeSwap = async (amount) => {
    return (new Promise(async (resolve, reject) => {
      try {
        dispatch(toggleLoader(true));

        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
        const publicKey = u8aToHex(alice.publicKey);

        const transaction = {
          to: publicKey.slice(0, 42),
          // value: Math.round(Number(amount) * Math.pow(10, 18)).toString(),
          value: (new BigNumber(amount).multipliedBy(10 ** 18)).toString(),
          gas: 21000,
          nonce: await evmApi.eth.getTransactionCount(currentAccount?.evmAddress),
        };

        let temp2p = getKey(currentAccount.temp1m, pass);
        const signedTx = await evmApi.eth.accounts.signTransaction(
          transaction,
          temp2p
        );
        const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const signHash = txInfo.transactionHash;

        if (signHash) {
          const withdraw = await nativeApi.tx.evm.withdraw(
            publicKey.slice(0, 42),
            (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
          );
          let signRes = await withdraw.signAndSend(alice);

          console.log("Sign Res : ", signRes.toHex());

          let dataToDispatch = {
            data: {
              chain: currentNetwork.toLowerCase(),
              isEvm: true,
              dateTime: new Date(),
              to: "Evm to Native",
              type: TX_TYPE?.SWAP,
              amount: amount,
              txHash: { hash: signRes.toHex(), mainHash: signHash },
              status: STATUS.PENDING
            },
            index: getAccId(currentAccount.id),
          };

          dispatch(setTxHistory(dataToDispatch));
          dispatch(toggleLoader(false));

          resolve({
            error: false,
            data: signHash,
          });
        }
        else throw new Error("Error occured! ");

      } catch (error) {
        console.log("Error occured while swapping evm to native : ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while swapping!",
        });
      }
    }))
  };

  const importAccount = async (data) => {
    try {
      const SS58Prefix = 6;
      const isValidMnemonic = mnemonicValidate(data.key);

      if (isValidMnemonic) {
        // Create valid Substrate-compatible seed from mnemonic
        const seedAlice = mnemonicToMiniSecret(data.key);

        // Generate new public/secret keypair for Alice from the supplied seed
        const { publicKey } = ed25519PairFromSeed(seedAlice);

        const nativeAddress = encodeAddress(
          decodeAddress(publicKey, SS58Prefix)
        );
        const { address } = ethers.Wallet.fromMnemonic(data.key);

        const id = accounts.length + 1;
        let temp1m = data.key;
        if (isLogin) temp1m = encryptor(data.key, pass);

        const dataToDispatch = {
          id,
          temp1m,
          txHistory: [],
          nativeAddress,
          accountName: data.accName,
          evmAddress: address,
        };
        if (!isLogin) dispatch(setNewAccount(dataToDispatch));

        dispatch(setAccountName(data.accName));
        dispatch(setCurrentAcc(dataToDispatch));
        if (isLogin) dispatch(pushAccounts(dataToDispatch));

        return {
          error: false,
          data: "success",
        };
      } else return {
        error: true,
        data: "Invalid mnemonics!",
      };
    } catch (error) {
      console.log("Error while importing : ", error);
      return {
        error: true,
        data: "Error Occured!",
      };
    }
  };

  const retriveEvmFee = async (toAddress, amount, data = "") => {
    try {
      console.log("To addfress : ", toAddress, "amount : ", amount, " Data : ", data);
      dispatch(toggleLoader(true));
      toAddress = toAddress ? toAddress : currentAccount?.nativeAddress;

      if (toAddress.startsWith("5"))
        toAddress = u8aToHex(toAddress).slice(0, 42);

      const tx = {
        to: toAddress,
        from: currentAccount?.evmAddress,
        value: amount,
      };

      if (data) {
        tx.data = data;
      }
      const gasAmount = await evmApi.eth.estimateGas(tx);
      const gasPrice = await evmApi.eth.getGasPrice();
      // let fee = Number((gasPrice * gasAmount) / 10 ** 18);
      let fee = (new BigNumber(gasPrice * gasAmount)).dividedBy(10 ** 18).toString();
      console.log("Fee : ", fee);
      dispatch(toggleLoader(false));
      return fee ? fee : 0;

    } catch (error) {
      dispatch(toggleLoader(false));
      console.log("Error under EVM FEEE", error);
      return 0;
    }
  };

  const retriveNativeFee = async (toAddress, amount) => {
    try {
      dispatch(toggleLoader(true));

      toAddress = toAddress ? toAddress : currentAccount?.evmAddress;
      let transferTx;
      const keyring = new Keyring({ type: "ed25519" });
      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

      const amt = new BigNumber(amount).multipliedBy(10 ** 18).toString();

      if (toAddress.startsWith("0x")) {
        transferTx = await nativeApi.tx.evm.deposit(toAddress, amt);
      }

      if (toAddress.startsWith("5")) {
        transferTx = nativeApi.tx.balances.transferKeepAlive(toAddress, amt);
      }
      console.log("FEE AMOUNT : ", amt);

      const info = await transferTx?.paymentInfo(alice);
      console.log(`
      class=${info.class.toString()},
      weight=${info.weight.toString()},
      partialFee=${info.partialFee.toString()}
    `);
      const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
      console.log("Fee : ", fee);
      dispatch(toggleLoader(false));

      return fee ? fee : 0;
    } catch (error) {
      dispatch(toggleLoader(false));

      console.log("Error : ", error);
      return 0;
    }
  };

  return {
    walletSignUp,
    // setAuthData,
    authData,
    getEvmBalance,
    getNativeBalance,
    isApiReady,
    evmTransfer,
    nativeTransfer,
    importAccount,
    nativeToEvmSwap,
    evmToNativeSwap,
    retriveEvmFee,
    retriveNativeFee,
    getKey,
  };
}
