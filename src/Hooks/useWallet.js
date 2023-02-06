import { useState, useEffect } from "react";
import {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  ed25519PairFromSeed,
  cryptoWaitReady,
} from "@polkadot/util-crypto";
import { u8aToHex } from "@polkadot/util";
import { waitReady } from "@polkadot/wasm-crypto";
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
  toggleLoader,
} from "../Store/reducer/auth";
import { setAccountName } from "../Store/reducer/auth";
import Web3 from "web3";
import { decryptor, encryptor } from "../Helper/CryptoHelper";
import { BigNumber } from "bignumber.js";
// import { toast } from "react-toastify";


export default function UseWallet() {
  const dispatch = useDispatch();
  const {
    currentAccount,
    availableNetworks,
    currentNetwork,
    balance,
    pass,
    accountName,
    accounts,
    isLogin,
  } = useSelector((state) => state?.auth);
  const [evmApi, setEvmApi] = useState(null);
  const [nativeApi, setNativeApi] = useState(null);
  const [isApiReady, setReady] = useState(false);
  const [network, setNetwork] = useState(null);
  const [web3Provider, setWebProvider] = useState(null);

  const [authData, setAuthData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });

  useEffect(() => {

    if (currentNetwork?.toLowerCase() === (NETWORK.TEST_NETWORK).toLowerCase())
      setNetwork(availableNetworks?.testnet);
    else if (currentNetwork.toLowerCase() === (NETWORK.QA_NETWORK).toLowerCase())
      setNetwork(availableNetworks?.qa);
    setReady(false);

  }, [currentNetwork]);

  useEffect(() => {
    if (network) {
      initializeNativeApi();
      initializeEvmApi();
    }
  }, [network]);

  useEffect(() => {
    try {
      if (nativeApi && evmApi && web3Provider) {
        setReady(true);
        nativeApi.on("disconnected", async () => {
          console.log("Trying to reconnect with native api!");
          nativeApi.connect();
        });
        web3Provider.on('end', async () => {
          console.log("Trying to reconnect with Evm api");
          initializeEvmApi();
        });
      }
    } catch (error) {
      console.log("Error : ", error);
    }
  }, [nativeApi, evmApi, web3Provider]);


  const initializeNativeApi = async () => {
    try {
      let provider = new WsProvider(network);
      const apiRes = await ApiPromise.create({ provider: provider });
      setNativeApi(apiRes);
    } catch (error) {
      console.log("Error while making connection with Native Api");
    }
  };

  const initializeEvmApi = async () => {
    try {
      let provider = new Web3.providers.WebsocketProvider(network);
      let evm_api = new Web3(provider);
      setWebProvider(provider);
      setEvmApi(evm_api);
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
      // console.log("evm Api : ", evmApi);
      const w3balance = await evmApi?.eth.getBalance(
        currentAccount?.evmAddress
      );
      let payload = {
        of: EVM,
        balance: (Number(w3balance) / Math.pow(10, 18)),
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
        balance: (Number(nbalance.availableBalance) / Math.pow(10, 18)),
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
        let index = getAccId(currentAccount.id);
        let dataToDispatch = {
          data: {
            isEvm: true,
            dateTime: new Date(),
            to: data.to,
            type: TX_TYPE?.SEND,
            amount: data.amount,
          },
          index: index,
        };
        const transactions = {
          from: currentAccount?.evmAddress,
          value: isBig
            ? data.amount
            : (Number(data.amount) * Math.pow(10, 18)).toString(),
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

        console.log("transactions : ", transactions);
        let temp2p = getKey(currentAccount.temp1m, pass);
        const signedTx = await evmApi.eth.accounts.signTransaction(
          transactions,
          temp2p
        );
        const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const hash = txInfo.transactionHash;

        if (hash) {
          dataToDispatch.data.txHash = hash;
          evmApi.eth.getTransactionReceipt(hash, (err, res) => {
            if (res) {
              console.log("Response : ", res);
              if (res.status)
                dataToDispatch.data.status = STATUS.SUCCESS;
              else
                dataToDispatch.data.status = STATUS.FAILED;
            } else
              dataToDispatch.data.status = STATUS.PENDING;

            dispatch(setTxHistory(dataToDispatch));
          });
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
        dispatch(toggleLoader(true));
        let _amount = (Number(data.amount) * Math.pow(10, 18)).toString();
        let index = getAccId(currentAccount.id);
        let dataToDispatch = {
          data: {
            isEvm: false,
            dateTime: new Date(),
            to: data.to,
            type: TX_TYPE?.SEND,
            amount: data.amount,
          },
          index: index,
        };
        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
        const transfer = nativeApi.tx.balances.transferKeepAlive(
          data.toAddress,
          _amount
        );

        //Send and sign txn
        await transfer.signAndSend(alice, ({ status, events }, extrinsicData) => {
          if (status.isInBlock || status.isFinalized) {
            let hash;
            if (status.isInBlock) {
              hash = transfer.hash.toHex();
            }

            events.filter(
              ({ phase }) => phase.isApplyExtrinsic)
              .forEach(({ event }) => {
                if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                  console.log("Extrinsic Success");
                  dispatch(toggleLoader(false));
                  dataToDispatch.txHash = hash;
                  dataToDispatch.status = STATUS.SUCCESS;
                  dispatch(setTxHistory(dataToDispatch));
                  resolve({
                    error: false,
                    data: hash
                  });
                } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                  console.log("Extrinsic Failed");

                  // extract the data for this event
                  const [dispatchError] = event.data;
                  let errorInfo;
                  dataToDispatch.data.txHash = null;
                  dataToDispatch.data.status = STATUS.FAILED;
                  dispatch(setTxHistory(dataToDispatch));

                  // decode the error
                  if (dispatchError.isModule) {
                    // for module errors, we have the section indexed, lookup
                    // (For specific known errors, we can also do a check against the
                    // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
                    const decoded =
                      nativeApi.registry.findMetaError(
                        dispatchError.asModule
                      );
                    console.log(`${decoded.section}.${decoded.name}`);
                    errorInfo = `${decoded.section}.${decoded.name}`;
                  } else {
                    // Other, CannotLookup, BadOrigin, no extra info
                    errorInfo = dispatchError.toString();
                  }
                  dispatch(toggleLoader(false));
                  resolve({
                    data: errorInfo,
                    error: true,
                  });
                }
              }
              );
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
        dispatch(toggleLoader(true));
        const _amount = Number(
          Math.round(Number(amount) * Math.pow(10, 18) * 100) / 100
        ).toString();
        let index = getAccId(currentAccount.id);
        let dataToDispatch = {
          data: {
            isEvm: false,
            dateTime: new Date(),
            to: "Native to Evm",
            type: TX_TYPE?.SWAP,
            amount: amount,
          },
          index: index,
        };

        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

        let deposit = await nativeApi.tx.evm.deposit(
          currentAccount?.evmAddress,
          _amount
        );

        await deposit.signAndSend(alice, ({ status, events }, extrinsicData) => {
          if (status.isInBlock || status.isFinalized) {
            let hash;
            if (status.isInBlock) {
              hash = deposit.hash.toHex();
            }

            events.filter(
              ({ phase }) => phase.isApplyExtrinsic)
              .forEach(({ event }) => {
                if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                  console.log("Extrinsic Success");
                  dispatch(toggleLoader(false));
                  dataToDispatch.data.txHash = hash;
                  dataToDispatch.data.status = STATUS.SUCCESS;
                  dispatch(setTxHistory(dataToDispatch));
                  resolve({
                    error: false,
                    data: hash
                  });
                } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                  console.log("Extrinsic Failed");

                  // extract the data for this event
                  const [dispatchError] = event.data;
                  let errorInfo;
                  dataToDispatch.data.txHash = null;
                  dataToDispatch.data.status = STATUS.FAILED;
                  dispatch(setTxHistory(dataToDispatch));

                  // decode the error
                  if (dispatchError.isModule) {
                    // for module errors, we have the section indexed, lookup
                    // (For specific known errors, we can also do a check against the
                    // api.errors.<module>.<ErrorName>.is(dispatchError.asModule) guard)
                    const decoded =
                      nativeApi.registry.findMetaError(
                        dispatchError.asModule
                      );
                    console.log(`${decoded.section}.${decoded.name}`);
                    errorInfo = `${decoded.section}.${decoded.name}`;
                  } else {
                    // Other, CannotLookup, BadOrigin, no extra info
                    errorInfo = dispatchError.toString();
                  }
                  dispatch(toggleLoader(false));
                  resolve({
                    error: true,
                    data: errorInfo,
                  });
                }
              }
              );
          }

        });
        // const transferRes = await deposit.signAndSend(alice);
        // const tx = transferRes.toHex();

        // if (tx) {
        //   let index = getAccId(currentAccount.id);
        //   let dataToDispatch = {
        //     data: {
        //       dateTime: new Date(),
        //       to: "Native to Evm",
        //       type: TX_TYPE?.SWAP,
        //       amount: amount,
        //       status: STATUS.SUCCESS,
        //       hash: tx
        //     },
        //     index: index,
        //   };
        //   dispatch(toggleLoader(false));
        //   dispatch(setTxHistory(dataToDispatch));

        //   return {
        //     error: false,
        //     data: tx,
        //   };
        // }
        // else throw new Error("Error occured! ");
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
        let index = getAccId(currentAccount.id);
        let dataToDispatch = {
          data: {
            isEvm: true,
            dateTime: new Date(),
            to: "Evm to Native",
            type: TX_TYPE?.SWAP,
            amount: amount
          },
          index: index,
        };

        const seedAlice = mnemonicToMiniSecret(
          decryptor(currentAccount?.temp1m, pass)
        );
        const keyring = new Keyring({ type: "ed25519" });
        const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
        const publicKey = u8aToHex(alice.publicKey);

        const transaction = {
          to: publicKey.slice(0, 42),
          value: Math.round(Number(amount) * Math.pow(10, 18)).toString(),
          gas: 21000,
          nonce: await evmApi.eth.getTransactionCount(currentAccount?.evmAddress),
        };

        let temp2p = getKey(currentAccount.temp1m, pass);
        const signedTx = await evmApi.eth.accounts.signTransaction(
          transaction,
          temp2p
        );
        const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
        const hash = txInfo.transactionHash;

        if (hash) {
          dataToDispatch.data.txHash = hash;
          const withdraw = await nativeApi.tx.evm.withdraw(
            publicKey.slice(0, 42),
            Math.round(Number(amount) * Math.pow(10, 18)).toString()
          );
          await withdraw.signAndSend(alice);
          evmApi.eth.getTransactionReceipt(hash, (err, res) => {
            if (res) {
              console.log("Response : ", res);
              if (res.status)
                dataToDispatch.data.status = STATUS.SUCCESS;
              else
                dataToDispatch.data.status = STATUS.FAILED;
            } else
              dataToDispatch.data.status = STATUS.PENDING;

            dispatch(setTxHistory(dataToDispatch));
          });
          dispatch(toggleLoader(false));

          resolve({
            error: false,
            data: hash,
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
    console.log("Data :: ", data);
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
      dispatch(toggleLoader(true));

      // let api = evmApi
      // if (!api) {
      //   const { evm_api } = await setUpApi()
      //   api = evm_api
      // }

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
      let fee = Number((gasPrice * gasAmount) / 10 ** 18);
      console.log("HERE EVM FEEE", gasAmount, gasPrice, fee);
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
      const fee = new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)
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
