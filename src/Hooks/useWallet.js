import Web3 from "web3";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { Keyring } from "@polkadot/keyring";
import { useState } from "react";
import Browser from "webextension-polyfill";
import { TX_TYPE, STATUS } from "../Constants/index";
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
  setAccountName
} from "../Utility/redux_helper";

import { httpRequest, EVMRPCPayload } from "../Utility/network_calls";
import { HTTP_METHODS, EVM_JSON_RPC_METHODS, ERROR_MESSAGES } from "../Constants/index";
import { getCurrentTabUId, getCurrentTabUrl } from "../Scripts/utils";
import { ACCOUNT_CHANGED_EVENT } from "../Scripts/constants";

const DECIMALS = 10 ** 18;
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
    httpEndPoints,
    api
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

        //when new keypair created or imported the old key key emit the account change event
        getCurrentTabUId((id) => {
          getCurrentTabUrl((url) => {
            if (!(url === "chrome://extensions")) {
              Browser.tabs.sendMessage(id, { id: ACCOUNT_CHANGED_EVENT, method: ACCOUNT_CHANGED_EVENT, response: { evmAddress: address, nativeAddress: nativeAddress } })
            }
          })
        })
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
        nbalance = parseFloat(`${balance_.data.free}`) - parseFloat(`${balance_.data.miscFrozen}`);
      } else {
        let balance_ = await native_api?.derive.balances.all(
          currentAccount?.nativeAddress
        );
        nbalance = balance_.availableBalance;
      }


      let evmBalance = new BigNumber(w3balance).dividedBy(DECIMALS).toString();
      let nativeBalance = new BigNumber(nbalance).dividedBy(DECIMALS).toString();


      if (Number(nativeBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(nbalance).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0)
          nativeBalance = parseInt(tempBalance)
        else
          nativeBalance = tempBalance;
      }


      if (Number(evmBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(w3balance).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0)
          evmBalance = parseInt(tempBalance)
        else
          evmBalance = tempBalance;
      }


      let totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toString();
      if (Number(totalBalance) % 1 !== 0)
        totalBalance = new BigNumber(evmBalance).plus(nativeBalance).toFixed(6, 8).toString()


      const payload = {
        evmBalance,
        nativeBalance,
        totalBalance
      }

      dispatch(setBalance(payload));

    } catch (error) {
      console.log("Error while geting balance : ", error);
    }
  }


  const evmTransfer = async (evmApi, data, isBig = false) => {
    return (new Promise(async (resolve, reject) => {
      try {
        const tempAmount = isBig ? (new BigNumber(data.amount).dividedBy(DECIMALS)).toString() : data.amount;
        if ((Number(tempAmount) > (Number(balance.evmBalance)) && data.amount !== '0x0') || Number(balance.evmBalance) <= 0) {
          resolve({
            error: true,
            data: ERROR_MESSAGES.INSUFFICENT_BALANCE
          })
        } else {
          dispatch(toggleLoader(true));

          let amt = (new BigNumber(data.amount).multipliedBy(DECIMALS)).toString();

          const transactions = {
            from: currentAccount?.evmAddress,
            value: isBig
              ? data.amount
              : (Number(amt).noExponents()).toString(),
            gas: 21000, 
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

            const txRecipt = await httpRequest(httpEndPoints[currentNetwork.toLowerCase()], HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [hash])));

            let txStatus = STATUS.PENDING;
            if (txRecipt.result) {
              txStatus = Boolean(Number(txRecipt.result.status)) ? STATUS.SUCCESS : STATUS.PENDING
            }

            let dataToDispatch = {
              data: {
                chain: currentNetwork.toLowerCase(),
                isEvm: true,
                dateTime: new Date(),
                to: data.to ? data.to : "",
                type: data.to ? (data.amount !== "0x0" ? TX_TYPE.SEND : "Contract Execution") : "Contract Deployement",
                amount: data.amount !== "0x0" ? data.amount : 0,
                txHash: hash,
                status: txStatus
              },
              index: getAccId(currentAccount.id),
            };


            console.log("send for dispatch: ", dataToDispatch);
            
              dispatch(setTxHistory(dataToDispatch));
              dispatch(toggleLoader(false));
  
              //send the tx notification
              Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: { isFound: txStatus !== STATUS.PENDING, status: txStatus.toLowerCase() } });


            resolve({
              error: false,
              data: hash,
            });
          }
          else throw new Error("Error occured. ");
        }
      } catch (error) {
        console.log("Error occured while evm transfer: ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error while transfer.",
        });
      }
    }))

  };


  const nativeTransfer = async (nativeApi, data, isHttp = true) => {

    return new Promise(async (resolve) => {

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
            data: ERROR_MESSAGES.INSUFFICENT_BALANCE
          })
        } else {

          let hash, err;
          dispatch(toggleLoader(true));

          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
          const amt = new BigNumber(data.amount).multipliedBy(DECIMALS).toString();

          // const transfer = nativeApi.tx.balances.transferKeepAlive(
          //   data.to,
          //   (Number(amt).noExponents()).toString()
          // );

          const transfer = nativeApi.tx.balances.transfer(
            data.to,
            (Number(amt).noExponents()).toString()
          );

          if (isHttp) {
            transfer.signAndSend(alice, async (txHash) => {
              if (txHash) {


                const hash = txHash.toHex();
                dataToDispatch.data.txHash = hash;
                const txRecipt = await httpRequest(api[currentNetwork?.toLowerCase()] + hash, HTTP_METHODS.GET);

                let txStatus = STATUS.PENDING.toLowerCase();
                if (txRecipt?.data?.transaction) {
                  txStatus = txRecipt.data.transaction.status;
                }

                //set the transaction status
                dataToDispatch.data.status = txStatus;


                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                // send the tx notification
                Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: { isFound: txStatus !== STATUS.PENDING.toLowerCase(), status: txStatus } });

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
                  data: "Error while transfer."
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
                      data: "Error while transfer."
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
          data: "Error while transfer.",
        });
      }
    })
  };

  const nativeToEvmSwap = async (nativeApi, amount, isHttp = true) => {
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
            data: ERROR_MESSAGES.INSUFFICENT_BALANCE
          })
        } else {
          let err, evmDepositeHash, signedHash;
          dispatch(toggleLoader(true));

          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
          const amt = (new BigNumber(amount).multipliedBy(DECIMALS)).toString();

          //Deposite amount
          let deposit = await nativeApi.tx.evm.deposit(
            currentAccount?.evmAddress,
            (Number(amt).noExponents()).toString()
          );
          evmDepositeHash = deposit.hash.toHex();

          if (isHttp) {

            //Sign and Send txn for http provider
            deposit.signAndSend(alice, async (txHash) => {
              if (txHash) {

                const hash = txHash.toHex();
                dataToDispatch.data.txHash = { hash: evmDepositeHash, mainHash: hash };
                const txRecipt = await httpRequest(api[currentNetwork?.toLowerCase()] + hash, HTTP_METHODS.GET);

                let txStatus = STATUS.PENDING.toLowerCase();
                if (txRecipt?.data?.transaction) {
                  txStatus = txRecipt.data.transaction.status;
                }

                //set the transaction status
                dataToDispatch.data.status = txStatus;


                dispatch(setTxHistory(dataToDispatch));
                dispatch(toggleLoader(false));

                // send the tx notification
                Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: { isFound: txStatus !== STATUS.PENDING.toLowerCase(), status: txStatus } });


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

            //Sign and Send txn for websocket provider
            deposit.signAndSend(alice, ({ status, events, txHash }) => {
              if (status.isInBlock) {

                if (signedHash !== txHash) {

                  signedHash = txHash.toHex();
                  let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                  //Matching Extrinsic Events for get the status
                  phase.forEach(({ event }) => {

                    if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                      err = false;
                      dataToDispatch.data.status = STATUS.SUCCESS;
                    } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                      err = true;
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
          data: "Error while swapping.",
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
            data: ERROR_MESSAGES.INSUFFICENT_BALANCE
          })
        } else {
          dispatch(toggleLoader(true));
          const seedAlice = mnemonicToMiniSecret(
            decryptor(currentAccount?.temp1m, pass)
          );
          const keyring = new Keyring({ type: "ed25519" });
          const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
          const publicKey = u8aToHex(alice.publicKey);
          const amt = new BigNumber(amount).multipliedBy(DECIMALS).toString()

          const transaction = {
            to: publicKey.slice(0, 42),
            value: (Number(amt).noExponents()).toString(),
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
              (Number(amt).noExponents()).toString()
            );
            let signRes = await withdraw.signAndSend(alice);

            const txRecipt = await httpRequest(httpEndPoints[currentNetwork.toLowerCase()], HTTP_METHODS.POST, JSON.stringify(new EVMRPCPayload(EVM_JSON_RPC_METHODS.GET_TX_RECIPT, [signHash])));

            let txStatus = STATUS.PENDING;
            if (txRecipt.result) {
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

            dispatch(setTxHistory(dataToDispatch));
            dispatch(toggleLoader(false));


            //send the tx notification
            Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch, statusCheck: { isFound: txStatus !== STATUS.PENDING, status: txStatus.toLowerCase() } });

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
          data: "Error while swapping.",
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

        //when new keypair created or imported the old key key emit the account change event
        getCurrentTabUId((id) => {
          getCurrentTabUrl((url) => {
            if (!(url === "chrome://extensions")) {
              Browser.tabs.sendMessage(id, { id: ACCOUNT_CHANGED_EVENT, method: ACCOUNT_CHANGED_EVENT, response: { evmAddress: address, nativeAddress: nativeAddress } })
            }
          })
        })

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
        data: "Error occured.",
      };
    }
  };

  const retriveEvmFee = async (evmApi, toAddress, amount, data = "", isLoading = true) => {
    try {

      if (isLoading) dispatch(toggleLoader(true));

      toAddress = toAddress ? toAddress : currentAccount?.nativeAddress;

      if (toAddress.startsWith("5"))
        toAddress = u8aToHex(toAddress).slice(0, 42);

      if (toAddress.startsWith("0x")) {
        try {
          amount = Math.round(Number(amount));
          Web3.utils.toChecksumAddress(toAddress);
        } catch (error) {

          if (isLoading) dispatch(toggleLoader(false));

          return ({
            error: true,
            data: "Invalid Recipient address."
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
      let fee = (new BigNumber(gasPrice * gasAmount)).dividedBy(DECIMALS).toString();

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

        const amt = BigNumber(amount).multipliedBy(DECIMALS).toString();
        transferTx = await nativeApi.tx.evm.deposit(toAddress, (Number(amt).noExponents()).toString());
      }
      else if (toAddress.startsWith("5")) {
        const amt = new BigNumber(amount).multipliedBy(DECIMALS).toString();
        // transferTx = nativeApi.tx.balances.transferKeepAlive(toAddress, (Number(amt).noExponents()).toString());

        transferTx = nativeApi.tx.balances.transfer(toAddress, (Number(amt).noExponents()).toString());

      }
      const info = await transferTx?.paymentInfo(alice);
      const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS)).toString();

      dispatch(toggleLoader(false));

      return {
        error: false,
        data: fee,
      };
    } catch (error) {
      dispatch(toggleLoader(false));
      console.log("Error while getting native fee: ", error);
      return {
        error: true,
        data: "Error while getting fee."
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
        // dispatch(toggleLoader(false));
        return ({
          error: true,
          data: "Incorrect address."
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
        // dispatch(toggleLoader(false));
        console.log("Error : ", error);
        return ({
          error: true,
          data: "Incorrect address."
        });
      }

    } else {
      return ({
        error: true,
        data: "Incorrect address."
      });
    }
  }

  const getKeyring = () => {
    const seedAccount = mnemonicToMiniSecret(
      decryptor(currentAccount?.temp1m, pass)
    );
    const keyring = new Keyring({ type: "ed25519" });
    const signer = keyring.addFromPair(ed25519PairFromSeed(seedAccount));
    return signer;
  }

  //Nominator methods
  const addNominator = async (nativeApi, payload, isFee = false) => {

    try {
      if (!payload?.stakeAmount || !payload.validatorsAccounts) {
        return {
          error: true,
          data: "Invalid Params: Stake Amount and Validator Accounts are required"
        }
      }
      const { stakeAmount, validatorsAccounts } = payload;

      const bondedAmount = (new BigNumber(stakeAmount).multipliedBy(DECIMALS)).toFixed().toString()

      const stashId = encodeAddress(currentAccount?.nativeAddress);
      const nominateTx = nativeApi.tx.staking.nominate(validatorsAccounts);
      const points = await nativeApi.derive.staking?.currentPoints(); //find points
      const bondOwnTx = await nativeApi.tx.staking.bond(stashId, bondedAmount, "Staked");
      const batchAll = await nativeApi.tx.utility.batchAll([bondOwnTx, nominateTx]);

      if (isFee) {
        const info = await batchAll?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }

      const txHash = await batchAll.signAndSend(getKeyring())

      const data = {
        txHash: txHash.toHex(),
        stakeAmount,
        points,
      };
      return {
        error: false,
        data
      }
    } catch (err) {
      return {
        error: true,
        data: err?.message
      }
    }
  }

  const reNominate = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.validatorAccounts) {
        return {
          error: true,
          data: "Invalid Params: Validator Accounts are required"
        }
      }
      const { validatorAccounts } = payload
      const nominateTx = nativeApi.tx.staking.nominate(validatorAccounts);
      const points = await nativeApi.derive.staking?.currentPoints(); //find points
      const batchAll = await nativeApi.tx.utility.batchAll([nominateTx]);
      if (isFee) {
        const info = await batchAll?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await batchAll.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex(), points },
      };
    } catch (err) {
      return { error: true, data: err?.message };
    }

  };

  const nominatorValidatorPayout = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.validatorIdList) {
        return {
          error: true,
          data: "Invalid Params: Validator Accounts are required"
        }
      }

      const { validatorIdList } = payload;
      const validators = [validatorIdList];
      const allEras = await nativeApi?.derive?.staking?.erasHistoric();
      const era = await nativeApi?.derive?.staking?.stakerRewardsMultiEras(validators, allEras);
      if (era[0]?.length === 0) {
        return {
          error: true,
          data: "You have no era to payout"
        };
      }
      const payout = await nativeApi?.tx?.staking?.payoutStakers(validators[0], era[0][0]?.era);

      if (isFee) {
        const info = await payout?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await payout.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }

    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  const stopValidatorNominator = async (nativeApi, isFee = false) => {
    try {
      const stopValidator = await nativeApi.tx.staking.chill();

      if (isFee) {
        const info = await stopValidator?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await stopValidator.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  const unbondNominatorValidator = async (nativeApi, payload, isFee = false) => {
    try {


      if (!payload.amount) {
        return {
          error: true,
          data: "Invalid Params: Amount is required"
        }

      }


      const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
      const unbound = await nativeApi.tx.staking.unbond(amt);
      if (isFee) {
        const info = await unbound?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await unbound.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };


  const withdrawNominatorValidatorData = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.amount || !payload.address) {
        return {
          error: true,
          data: "Invalid Params: Amount and Address are required"
        }
      }

      const { amount, address } = payload
      const sendAmounts = (new BigNumber(amount).multipliedBy(DECIMALS)).toFixed().toString()
      // const sendAmt = nativeApi.tx.balances.transferKeepAlive(address, sendAmounts);
      const sendAmt = nativeApi.tx.balances.transfer(address, sendAmounts);

      if (isFee) {
        const info = await sendAmt?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await sendAmt.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };

  const withdrawNominatorUnbonded = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.value) {
        return {
          error: true,
          data: "Invalid Params: Value is required"
        }
      }
      const unbond = await nativeApi.tx.staking.withdrawUnbonded(payload.value);

      if (isFee) {
        const info = await unbond?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await unbond.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };
    }
  };


  //validators methods
  const addValidator = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.commission || !payload.bondedAmount) {
        return {
          error: true,
          data: "Invalid Params: Commission and Bonded Amount are required"
        }
      }
      const rotateKey = await nativeApi.rpc.author.rotateKeys();
      const bondAmt = (new BigNumber(payload.bondedAmount).multipliedBy(DECIMALS)).toFixed().toString()

      const stashId = encodeAddress(decodeAddress(currentAccount?.nativeAddress));
      const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;

      const validatorInfo = {
        bondTx: nativeApi.tx.staking.bond(stashId, bondAmt, 'Staked'),
        sessionTx: nativeApi.tx.session.setKeys(rotateKey, new Uint8Array()),
        validateTx: nativeApi.tx.staking.validate({
          blocked: false,
          commission,
        }),
      };
      const validationTransfer = await nativeApi.tx.utility.batchAll([
        validatorInfo.bondTx,
        validatorInfo.sessionTx,
        validatorInfo.validateTx,
      ]);


      if (isFee) {
        const info = await validationTransfer?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }

      const txHash = await validationTransfer.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };

    }

  };


  const bondMoreFunds = async (nativeApi, payload, isFee = false) => {
    try {

      if (!payload.amount) {
        return {
          error: true,
          data: "Invalid Params: Amount is required"
        }
      }
      const amt = (new BigNumber(payload.amount).multipliedBy(DECIMALS)).toFixed().toString()
      const bondExtraTx = await nativeApi.tx.staking.bondExtra(amt);

      if (isFee) {
        const info = await bondExtraTx?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await bondExtraTx.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };

    }
  };


  const restartValidator = async (nativeApi, payload, isFee = false) => {
    try {
      if (!payload.commission) {
        return {
          error: true,
          data: "Invalid Params: Commission is required"
        }
      }
      const commission = payload.commission === 0 ? 1 : payload.commission * 10 ** 7;
      const validatorInfo = {
        validateTx: nativeApi.tx.staking.validate({
          blocked: false,
          commission,
        }),
      };

      const validationTransfer = await nativeApi.tx.utility.batchAll([validatorInfo.validateTx]);

      if (isFee) {
        const info = await validationTransfer?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = await validationTransfer.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash: txHash.toHex() }
      }
    } catch (err) {
      return { error: true, data: err?.message };

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
    addNominator,
    reNominate,
    nominatorValidatorPayout,
    stopValidatorNominator,
    unbondNominatorValidator,
    withdrawNominatorValidatorData,
    withdrawNominatorUnbonded,
    addValidator,
    bondMoreFunds,
    restartValidator,
    validateAddress
    // setAuthData,
    // getEvmBalance,
    // getNativeBalance,
  };
}
