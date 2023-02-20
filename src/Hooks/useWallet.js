import Web3 from "web3";
import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { Keyring } from "@polkadot/keyring";
import { useState, useEffect } from "react";
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

  const getBalance = async (evm_api, native_api) => {
    try {

      // Evm Balance
      const w3balance = await evm_api?.eth?.getBalance(
        currentAccount?.evmAddress
      );

      //Native Balance
      const nbalance = await native_api?.derive.balances.all(
        currentAccount?.nativeAddress
      );

      let evmBalance = new BigNumber(w3balance).dividedBy(10 ** 18).toString();
      let nativeBalance = new BigNumber(nbalance.availableBalance).dividedBy(10 ** 18).toString();


      if (Number(nativeBalance) % 1 !== 0)
        nativeBalance = new BigNumber(nbalance.availableBalance).dividedBy(10 ** 18).toFixed(6, 8).toString();


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
      // console.log("Error while geting balance : ", error);
    }
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

            let dataToDispatch = {
              data: {
                chain: currentNetwork.toLowerCase(),
                isEvm: true,
                dateTime: new Date(),
                to: data.to ? data.to : "",
                type: data.to ? TX_TYPE?.SEND : "Contract Deployement",
                amount: data.to ? data?.amount : 0,
                txHash: hash,
                status: STATUS.PENDING
              },
              index: getAccId(currentAccount.id),
            };


            dispatch(setTxHistory(dataToDispatch));
            dispatch(toggleLoader(false));

            //send the tx notification
            Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch });

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

  const nativeTransfer = async (nativeApi, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (Number(data.amount) >= Number(balance.nativeBalance)) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
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
            data.to,
            (new BigNumber(data.amount).multipliedBy(10 ** 18)).toString()
          );

          //Send and sign txn
          transfer.signAndSend(alice, ({ status, events, txHash }) => {

            if (status.isInBlock) {

              if (hash !== txHash.toHex()) {
                hash = txHash.toHex();
                // console.log("Hash : ", hash);
                let phase = events.filter(({ phase }) => phase.isApplyExtrinsic);

                //Matching Extrinsic Events for get the status
                phase.forEach(({ event }) => {

                  if (nativeApi.events.system.ExtrinsicSuccess.is(event)) {
                    err = false;
                    // console.log("Extrinsic Success !! ");
                    dataToDispatch.data.status = STATUS.SUCCESS;
                  } else if (nativeApi.events.system.ExtrinsicFailed.is(event)) {
                    err = false;
                    // console.log("Extrinsic Failed");
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
        }
      } catch (error) {
        // console.log("Error while native transfer : ", error);
        dispatch(toggleLoader(false));
        resolve({
          error: true,
          data: "Error occured while sending!",
        });
      }
    })
  };

  const nativeToEvmSwap = async (evmApi, nativeApi, amount) => {
    return new Promise(async (resolve) => {
      try {
        if (Number(amount) >= Number(balance.nativeBalance) || Number(amount) <= 0) {
          resolve({
            error: true,
            data: "Insufficent Balance!"
          })
        } else {
          let err, evmDepositeHash, signedHash;
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

          //Deposite amount
          let deposit = await nativeApi.tx.evm.deposit(
            currentAccount?.evmAddress,
            (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
          );
          evmDepositeHash = deposit.hash.toHex();
          console.log("evmDepositHash", evmDepositeHash)

          //Sign and Send txn
          deposit.signAndSend(alice, ({ status, events, txHash }) => {
            if (status.isInBlock) {

              if (signedHash !== txHash) {
                signedHash = txHash.toHex();
                // console.log("Hash : ", signedHash);
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
                // console.log("Data to dispatch : ", dataToDispatch);
                dispatch(setTxHistory(dataToDispatch));
                if (err) {
                  resolve({
                    error: true,
                    data: "Error while sending!"
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
      } catch (error) {
        // console.log("Error occured while swapping native to evm : ", error);
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

            let dataToDispatch = {
              data: {
                chain: currentNetwork.toLowerCase(),
                isEvm: true,
                dateTime: new Date(),
                to: "Evm to Native",
                type: TX_TYPE?.SWAP,
                amount: amount,
                txHash: { mainHash: signHash, hash: signRes.toHex() },
                status: STATUS.PENDING
              },
              index: getAccId(currentAccount.id),
            };

            //send the transaction notification

            // console.log("data to dispatch : ",dataToDispatch);
            dispatch(setTxHistory(dataToDispatch));
            dispatch(toggleLoader(false));
            Browser.runtime.sendMessage({ type: "tx", ...dataToDispatch });

            resolve({
              error: false,
              data: signHash,
            });
          }
          else throw new Error("Error occured! ");
        }
      } catch (error) {
        // console.log("Error occured while swapping evm to native: ", error);
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
      // console.log("Error while importing : ", error);
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
            data: "Invalid 'To' address."
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
          // console.log("Amount after ", amt);
          Web3.utils.toChecksumAddress(toAddress);
        } catch (error) {
          dispatch(toggleLoader(false));
          return ({
            error: true,
            data: "Invalid 'to' address."
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
            data: "Invalid 'to' address!"
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

  // const initializeNativeApi = async (network) => {
  //   try {
  //     let provider = new WsProvider(network);
  //     nativeApi = await ApiPromise.create({ provider: provider });
  //     nativeApi.on("disconnected", async () => {
  //       nativeApi.connect();
  //     });
  //     console.log("native Api : ", nativeApi);
  //   } catch (error) {
  //     console.log("Error while making connection with Native Api");
  //   }
  // };

  // const initializeEvmApi = async (network) => {
  //   try {
  //     let options = {
  //       reconnect: {
  //         auto: true,
  //         delay: 5000, // ms
  //         maxAttempts: 10,
  //         onTimeout: false
  //       }
  //     };
  //     web3Provider = new Web3.providers.WebsocketProvider(network, options);
  //     evmApi = new Web3(web3Provider);

  //     web3Provider.on('end', async () => {
  //       console.log("Trying to reconnect with Evm api");
  //       initializeEvmApi();
  //     });
  //     web3Provider.on('error', async (e) => {
  //       console.log("error occued while making connection with web3 : ", e);
  //       initializeEvmApi();
  //     });

  //     console.log("evmApi : ", evmApi);
  //   } catch (error) {
  //     console.log("Error while making connection with Native Api");
  //   }
  // };


  // const getEvmBalance = async () => {
  //   try {

  //     const w3balance = await evmApi?.eth.getBalance(
  //       currentAccount?.evmAddress
  //     );
  //     let payload = {
  //       of: EVM,
  //       balance: new BigNumber(w3balance).dividedBy(10 ** 18).toFixed(6, 8),
  //     };

  //     console.log("balance.evmBalance : " + balance.evmBalance, "payload.balance : ", payload.balance);

  //     if ((balance.evmBalance !== payload.balance) && !isNaN(payload.balance)) {
  //       dispatch(setBalance(payload));
  //     }

  //   } catch (error) {
  //     console.log("Error while geting balance of evm : ", error);
  //   }
  // };

  // const getNativeBalance = async () => {
  //   try {
  //     const nbalance = await nativeApi?.derive.balances.all(
  //       currentAccount?.nativeAddress
  //     );
  //     let payload = {
  //       of: NATIVE,
  //       balance: new BigNumber(nbalance.availableBalance).dividedBy(10 ** 18).toFixed(6, 8).toString(),
  //     };
  //     console.log("balance.nativeBalance : " + balance.nativeBalance, "payload.balance : ", payload.balance);

  //     if ((balance.nativeBalance !== payload.balance) && !isNaN(payload.balance)) {
  //       dispatch(setBalance(payload));
  //     }

  //   } catch (error) {
  //     console.log("Error while getting balance of native : ", error);
  //   }
  // };


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

      const bondedAmount = (new BigNumber(stakeAmount).multipliedBy(10 ** 18)).toString()

      const stashId = encodeAddress(currentAccount?.nativeAddress);
      const nominateTx = nativeApi.tx.staking.nominate(validatorsAccounts);
      const points = await nativeApi.derive.staking?.currentPoints(); //find points
      const bondOwnTx = await nativeApi.tx.staking.bond(stashId, bondedAmount, "Staked");
      const batchAll = await nativeApi.tx.utility.batchAll([bondOwnTx, nominateTx]);

      if (isFee) {
        const info = await batchAll?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }

      const txHash = batchAll.signAndSend(getKeyring())

      const data = {
        txHash,
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
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = batchAll.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash, points },
      };
    } catch (err) {
      return { error: true, message: err?.message };
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
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = payout.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }

    } catch (err) {
      return { error: true, message: err?.message };
    }
  };

  const stopValidatorNominator = async (nativeApi, isFee = false) => {
    try {
      const stopValidator = await nativeApi.tx.staking.chill();

      if (isFee) {
        const info = await stopValidator?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = stopValidator.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };
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


      const amt = (new BigNumber(payload.amount).multipliedBy(10 ** 18)).toString()
      const unbound = await nativeApi.tx.staking.unbond(amt);
      if (isFee) {
        const info = await unbound?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = unbound.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };
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
      const sendAmounts = (new BigNumber(amount).multipliedBy(10 ** 18)).toString()
      const sendAmt = nativeApi.tx.balances.transferKeepAlive(address, sendAmounts);

      if (isFee) {
        const info = await sendAmt?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = sendAmt.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };
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
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = unbond.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };
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
      const { commission, bondedAmount } = payload;
      const rotateKey = await nativeApi.rpc.author.rotateKeys();
      const bondAmt = (new BigNumber(bondedAmount).multipliedBy(10 ** 18)).toString()

      const stashId = encodeAddress(decodeAddress(currentAccount?.nativeAddress));
      commission = commission === 0 ? 1 : commission * 10 ** 7;

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
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }

      const txHash = validationTransfer.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };

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
      const amt = (new BigNumber(payload.amount).multipliedBy(10 ** 18)).toString()
      const bondExtraTx = await nativeApi.tx.staking.bondExtra(amt);

      if (isFee) {
        const info = await bondExtraTx?.paymentInfo(getKeyring());
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = bondExtraTx.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };

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
        const fee = (new BigNumber(info.partialFee.toString()).div(10 ** 18).toFixed(6, 8)).toString();
        return {
          error: false,
          data: fee
        }
      }
      const txHash = validationTransfer.signAndSend(getKeyring())
      return {
        error: false,
        data: { txHash }
      }
    } catch (err) {
      return { error: true, message: err?.message };

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
    restartValidator
    // setAuthData,
    // getEvmBalance,
    // getNativeBalance,
  };
}
