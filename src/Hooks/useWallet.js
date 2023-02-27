import Web3 from "web3";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { Keyring } from "@polkadot/keyring";
import { useState } from "react";
import Browser from "webextension-polyfill";
import { TX_TYPE, STATUS } from "../Constants/index";
import { setAccountName } from "../Store/reducer/auth";
import { useSelector, useDispatch } from "react-redux";
import { u8aToHex, hexToU8a, isHex } from "@polkadot/util";
import { decryptor, encryptor } from "../Helper/CryptoHelper";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import {
  mnemonicGenerate,
  mnemonicToMiniSecret,
  mnemonicValidate,
  ed25519PairFromSeed
} from "@polkadot/util-crypto";
import {
  setCurrentAcc,
  setNewAccount,
  pushAccounts,
  setBalance,
  setTxHistory,
  toggleLoader,
} from "../Store/reducer/auth";


export default function UseWallet() {

  const dispatch = useDispatch();
  const [authData, setAuthData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });
  const {
    currentAccount,
    currentNetwork,
    balance,
    pass,
    accountName,
    accounts,
    isLogin,
    httpEndPoints
  } = useSelector((state) => state?.auth);


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
      // console.log("error occured while creating new account ", error);
      dispatch(toggleLoader(false));

      return {
        error: true,
        data: "Error Occured!",
      };
    }
  };

  const getBalance = async (evm_api, native_api, isHttp = true) => {
    try {
      let nbalance = 0;

      // Evm Balance
      const w3balance = await evm_api?.eth?.getBalance(
        currentAccount?.evmAddress
      );

      //Native Balance
      if (isHttp) {
        let balance_ = await native_api?._query.system.account(currentAccount?.nativeAddress);
        nbalance = balance_.data.free;
        nbalance = parseFloat(`${balance_.data.free}`);
      } else {
        let balance_ = await native_api?.derive.balances.all(
          currentAccount?.nativeAddress
        );
        nbalance = balance_.availableBalance;
      }

      let evmBalance = new BigNumber(w3balance).dividedBy(10 ** 18).toString();
      let nativeBalance = new BigNumber(nbalance).dividedBy(10 ** 18).toString();


      if (Number(nativeBalance) % 1 !== 0)
        nativeBalance = new BigNumber(nbalance).dividedBy(10 ** 18).toFixed(6, 8).toString();


      if (Number(evmBalance) % 1 !== 0)
        evmBalance = new BigNumber(w3balance).dividedBy(10 ** 18).toFixed(6, 8).toString();


      let totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toString();
      if (Number(totalBalance) % 1 !== 0)
        totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toFixed(6, 8).toString()

      // console.log("balance.nativeBalance : ", balance.nativeBalance, " && now ", nativeBalance);
      // console.log("balance.nativeBalance : ", balance.evmBalance, " && now ", evmBalance);

      // if ((balance.nativeBalance !== nativeBalance && balance.evmBalance !== evmBalance) && (!isNaN(evmBalance) && !(isNaN(nativeBalance)))) {
      const payload = {
        evmBalance,
        nativeBalance,
        totalBalance
      }
      dispatch(setBalance(payload));
      // }

    } catch (error) {
      console.log("Error while geting balance : ", error);
    }
  }


  //for http-requests
 async function httpRequest(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: payload
  });
  const data = await res.json();
  return data;
}


  const evmTransfer = async (evmApi, data, isBig = false) => {
    // console.log("EVM APIIII : ", evmApi);
    return (new Promise(async (resolve, reject) => {

      // console.log("Condition Here: ", (Number(data.amount) > Number(balance.evmBalance) && data.amount !== '0x0') || Number(balance.evmBalance) <= 0);
      // console.log("Here are individual conditions: ", data.amount !== '0x0', (Number(data.amount) > Number(balance.evmBalance), Number(balance.evmBalance) <= 0));
      // console.log("individual balance: ", Number(data.amount), Number(balance.evmBalance), data.amount);

      try {
        if ((Number(data.amount) > Number(balance.evmBalance) && data.amount !== '0x0') || Number(balance.evmBalance) <= 0) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
          dispatch(toggleLoader(true));
          const transactions = {
            from: currentAccount?.evmAddress,
            value: isBig
              ? data.amount
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

          //Sign And Send Transaction
          const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
          const hash = txInfo.transactionHash;

          if (hash) {


            const txRecipt = await httpRequest(httpEndPoints[currentNetwork.toLowerCase()], JSON.stringify({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [hash], id: 1}));

            let txStatus = STATUS.PENDING;
            if(txRecipt.result) {
              txStatus = Boolean(Number(txRecipt.result.status)) ? STATUS.SUCCESS : STATUS.PENDING
            }

            let dataToDispatch = {
              data: {
                chain: currentNetwork.toLowerCase(),
                isEvm: true,
                dateTime: new Date(),
                to: data.to ? data.to : "",
                type: data.to ? TX_TYPE?.SEND : "Contract Deployement",
                amount: data.to ? data?.amount : 0,
                txHash: hash,
                status: txStatus
              },
              index: getAccId(currentAccount.id),
            };


            dispatch(setTxHistory(dataToDispatch));
            dispatch(toggleLoader(false));

            //send the tx notification
            Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: {isFound: txStatus !== STATUS.PENDING, status: txStatus.toLowerCase()}});

            resolve({
              error: false,
              data: hash,
            });
          }
          else throw new Error("Error occured! ");
        }
      } catch (error) {
        console.log("Error occured while evm transfer: ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: error.message,
        });
      }
    }))

  };

  const nativeTransfer = async (nativeApi, data, isHttp = true) => {
    return new Promise(async (resolve, reject) => {
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

      try {
        if (Number(data.amount) >= Number(balance.nativeBalance)) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
          let hash, err;
          dispatch(toggleLoader(true));

          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

          const transfer = nativeApi.tx.balances.transferKeepAlive(
            data.to,
            (new BigNumber(data.amount).multipliedBy(10 ** 18)).toString()
          );

          if (isHttp) {
            transfer.signAndSend(alice, (txHash) => {
              if (txHash) {

                let hash = txHash.toHex();
                dataToDispatch.data.txHash = hash;
                dataToDispatch.data.status = STATUS.SUCCESS;
                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                resolve({
                  error: false,
                  data: hash
                });

              } else {

                dataToDispatch.data.txHash = "";
                dataToDispatch.data.status = STATUS.FAILED;
                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                resolve({
                  error: true,
                  data: "error while sending!"
                });

              }
            });

          } else {
            //Send and sign txn
            transfer.signAndSend(alice, ({ status, events, txHash }) => {
              if (status.isInBlock) {

                if (hash !== txHash.toHex()) {
                  hash = txHash.toHex();
                  let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                  //Matching Extrinsic Events for get the status
                  phase.forEach(({ event }) => {

                    if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {

                      err = false;
                      dataToDispatch.data.status = STATUS.SUCCESS;

                    } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {

                      err = false;
                      dataToDispatch.data.status = STATUS.FAILED;

                    }
                    dispatch(toggleLoader(false));
                  });

                  dataToDispatch.data.txHash = hash ? hash : "";
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
          }
        }
      } catch (error) {
        console.log("Error while native transfer : ", error);
        dataToDispatch.data.txHash = "";
        dataToDispatch.data.status = STATUS.FAILED;
        dispatch(setTxHistory(dataToDispatch));
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while sending!",
        });
      }
    })
  };

  const nativeToEvmSwap = async (evmApi, nativeApi, amount, isHttp = true) => {
    return new Promise(async (resolve) => {
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

      try {
        if (Number(amount) >= Number(balance.nativeBalance) || Number(amount) <= 0) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
          let err, evmDepositeHash, signedHash;
          dispatch(toggleLoader(true));

          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

          //Deposite amount
          let deposit = await nativeApi.tx.evm.deposit(
            currentAccount?.evmAddress,
            (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
          );
          evmDepositeHash = deposit.hash.toHex();

          if (isHttp) {

            deposit.signAndSend(alice, (txHash) => {
              if (txHash) {

                let hash = txHash.toHex();
                dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: hash };
                dataToDispatch.data.status = STATUS.SUCCESS;
                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                resolve({
                  error: false,
                  data: hash
                });

              } else {

                dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: "" };
                dataToDispatch.data.status = STATUS.FAILED;
                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                resolve({
                  error: true,
                  data: "error while swapping!"
                });
              }
            });

          } else {

            //Sign and Send txn
            deposit.signAndSend(alice, ({ status, events, txHash }) => {
              if (status.isInBlock) {

                if (signedHash !== txHash) {
                  signedHash = txHash.toHex();
                  let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                  //Matching Extrinsic Events for get the status
                  phase.forEach(({ event }) => {

                    if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                      err = false;
                      // console.log("Extrinsic Success !! ");
                      dataToDispatch.data.status = STATUS.SUCCESS;
                    } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                      err = true;
                      // console.log("Extrinsic Failed !!");
                      dataToDispatch.data.status = STATUS.FAILED;
                    }
                    dispatch(toggleLoader(false));
                  });

                  dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: signedHash };
                  dispatch(setTxHistory(dataToDispatch));
                  if (err) {
                    resolve({
                      error: true,
                      data: "Error while swapping!"
                    })
                  } else {
                    resolve({
                      error: false,
                      data: signedHash
                    })
                  }
                }
              }
            });
          }

        }
      } catch (error) {
        console.log("Error occured while swapping native to evm : ", error);
        dataToDispatch.data.txHash = { hash: "", mainHash: "" };
        dataToDispatch.data.status = STATUS.FAILED;
        dispatch(setTxHistory(dataToDispatch));
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while swapping!",
        });
      }
    })
  };

  const evmToNativeSwap = async (evmApi, nativeApi, amount) => {
    return (new Promise(async (resolve, reject) => {
      try {
        if (Number(amount) >= Number(balance.evmBalance) || Number(amount) <= 0) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
          dispatch(toggleLoader(true));
          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
          const publicKey = u8aToHex(alice.publicKey);

          const transaction = {
            to: publicKey.slice(0, 42),
            value: (new BigNumber(amount).multipliedBy(10 ** 18)).toString(),
            gas: 21000,
            nonce: await evmApi.eth.getTransactionCount(currentAccount?.evmAddress),
          };

          let temp2p = getKey(currentAccount.temp1m, pass);
          const signedTx = await evmApi.eth.accounts.signTransaction(
            transaction,
            temp2p
          );

          //sign and send
          const txInfo = await evmApi.eth.sendSignedTransaction(signedTx.rawTransaction);
          const signHash = txInfo.transactionHash;

          if (signHash) {
            //withdraw amount
            const withdraw = await nativeApi.tx.evm.withdraw(
              publicKey.slice(0, 42),
              (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
            );
            let signRes = await withdraw.signAndSend(alice);

            // console.log("Sign Res : ", signRes.toHex());



            const txRecipt = await httpRequest(httpEndPoints[currentNetwork.toLowerCase()], JSON.stringify({jsonrpc: "2.0", method: "eth_getTransactionReceipt", params: [signHash], id: 1}));

            let txStatus = STATUS.PENDING;
            if(txRecipt.result) {
              txStatus = Boolean(Number(txRecipt.result.status)) ? STATUS.SUCCESS : STATUS.PENDING
            }


            let dataToDispatch = {
              data: {
                chain: currentNetwork.toLowerCase(),
                isEvm: true,
                dateTime: new Date(),
                to: "Evm to Native",
                type: TX_TYPE?.SWAP,
                amount: amount,
                txHash: { mainHash: signHash, hash: signRes.toHex() },
                status: txStatus
              },
              index: getAccId(currentAccount.id),
            };

            //send the transaction notification

            // console.log("data to dispatch : ",dataToDispatch);
            dispatch(setTxHistory(dataToDispatch));
            dispatch(toggleLoader(false));

            //send the tx notification
            Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: {isFound: txStatus !== STATUS.PENDING, status: txStatus.toLowerCase()}});

            resolve({
              error: false,
              data: signHash,
            });
          }
          else throw new Error("Error occured! ");
        }
      } catch (error) {
        console.log("Error occured while swapping evm to native: ", error);
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
          accountName: data.accName.trim(),
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

  const retriveEvmFee = async (evmApi, toAddress, amount, data = "") => {
    try {
      dispatch(toggleLoader(true));
      toAddress = toAddress ? toAddress : currentAccount?.nativeAddress;

      if (toAddress.startsWith("5"))
        toAddress = u8aToHex(toAddress).slice(0, 42);

      if (toAddress.startsWith("0x")) {
        try {
          amount = Math.round(Number(amount));
          Web3.utils.toChecksumAddress(toAddress);
        } catch (error) {
          dispatch(toggleLoader(false));
          return ({
            error: true,
            data: "Invalid 'Recipient' address."
          });
        }
      }

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
      let fee = (new BigNumber(gasPrice * gasAmount)).dividedBy(10 ** 18).toString();

      dispatch(toggleLoader(false));
      return {
        error: false,
        data: fee,
      }

    } catch (error) {
      dispatch(toggleLoader(false));
      // console.log("Error while getting evm fee: ", error);
      return {
        error: true,
      }
    }
  };

  const validateAddress = async (address) => {
    if (address.startsWith("0x")) {
      try {
        Web3.utils.toChecksumAddress(address);
        return ({
          error: false,
          data: "Address is correct."
        });
      } catch (error) {
        dispatch(toggleLoader(false));
        return ({
          error: true,
          data: "Incorrect 'Recipient' address."
        });
      }
    } else if (address.startsWith("5")) {

      try {
        encodeAddress(
          isHex(address)
            ? hexToU8a(address)
            : decodeAddress(address)
        );
        return ({
          error: false,
          data: "Address is correct."
        });
      } catch (error) {
        dispatch(toggleLoader(false));

        return ({
          error: true,
          data: "Incorrect 'Recipient' address"
        });
      }

    }
  }

  const retriveNativeFee = async (nativeApi, toAddress, amount) => {
    try {
      dispatch(toggleLoader(true));
      toAddress = toAddress ? toAddress : currentAccount?.evmAddress;
      let transferTx;
      const keyring = new Keyring({ type: "ed25519" });
      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

      if (toAddress.startsWith("0x")) {
        const amt = new BigNumber(amount).multipliedBy(10 ** 18).toFixed().toString();
        try {
          Web3.utils.toChecksumAddress(toAddress);
        } catch (error) {
          dispatch(toggleLoader(false));
          return ({
            error: true,
            data: "Invalid 'Recipient' address."
          });
        }
        transferTx = await nativeApi.tx.evm.deposit(toAddress, amt);
      }

      if (toAddress.startsWith("5")) {
        const amt = new BigNumber(amount).multipliedBy(10 ** 18).toString();
        try {
          encodeAddress(
            isHex(toAddress)
              ? hexToU8a(toAddress)
              : decodeAddress(toAddress)
          );
        } catch (error) {
          dispatch(toggleLoader(false));

          return ({
            error: true,
            data: "Invalid 'Recipient' address!"
          });
        }
        transferTx = nativeApi.tx.balances.transferKeepAlive(toAddress, amt);

      }
      const info = await transferTx?.paymentInfo(alice);
      const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();

      dispatch(toggleLoader(false));

      return {
        error: false,
        data: fee,
      };
    } catch (error) {
      dispatch(toggleLoader(false));
      // console.log("Error while getting native fee: ", error);
      return {
        error: true,
      }
    }
  };

  return {
    walletSignUp,
    authData,
    evmTransfer,
    nativeTransfer,
    importAccount,
    nativeToEvmSwap,
    evmToNativeSwap,
    retriveEvmFee,
    retriveNativeFee,
    getKey,
    getBalance,
    validateAddress
  };
}
