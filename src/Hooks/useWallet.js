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
import { QA_NETWORK, TEST_NETWORK } from "../Constants/index";
import { decodeAddress, encodeAddress } from "@polkadot/keyring";
import { Keyring } from "@polkadot/keyring";
import {
  setCurrentAcc,
  setNewAccount,
  pushAccounts,
  setBalance,
  setTxHistory,
} from "../Store/reducer/auth";
import { setAccountName } from "../Store/reducer/auth";
import Web3 from "web3";
import { decryptor, encryptor } from "../Helper/CryptoHelper";

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

  const [authData, setAuthData] = useState({
    temp1m: "",
    temp2p: "",
    evmAddress: "",
    nativeAddress: "",
  });

  useEffect(() => {
    console.log("Current network : ", currentNetwork);
    setReady(false);
    if (currentNetwork?.toLowerCase() === TEST_NETWORK)
      setUpApi(availableNetworks?.testnet);
    else if (currentNetwork.toLowerCase() === QA_NETWORK)
      setUpApi(availableNetworks?.qa);
  }, [currentNetwork]);

  const setUpApi = async (network) => {
    console.log("Network : ", network);
    let evm_api = new Web3(network);
    setEvmApi(evm_api);

    let provider;
    if (network?.startsWith("wss")) provider = new WsProvider(network);
    else provider = new HttpProvider(network);

    await cryptoWaitReady();
    await waitReady();
    const apiRes = await ApiPromise.create({ provider: provider });
    setNativeApi(apiRes);
    if (apiRes) setReady(true);
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

      return {
        error: false,
        data: "success!",
      };
    } catch (error) {
      console.log("error", error);
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
        of: "evm",
        balance: Math.round(Number(w3balance) / Math.pow(10, 18)),
      };
      console.log(
        "evm balance : ",
        Math.round(Number(w3balance) / Math.pow(10, 18))
      );
      dispatch(setBalance(payload));
    } catch (error) {
      console.log("error : ", error);
    }
  };

  const getNativeBalance = async () => {
    const nbalance = await nativeApi?.derive.balances.all(
      currentAccount?.nativeAddress
    );
    let payload = {
      of: "native",
      balance: Math.round(Number(nbalance.availableBalance) / Math.pow(10, 18)),
    };
    console.log(
      "nativeBalance : ",
      Math.round(Number(nbalance.availableBalance) / Math.pow(10, 18))
    );

    dispatch(setBalance(payload));
  };

  const getDateTime = () => {
    try {
      let currentdate = new Date();

      let date =
        currentdate.getDate() +
        "/" +
        (currentdate.getMonth() + 1) +
        "/" +
        currentdate.getFullYear() +
        " | ";

      let time =
        currentdate.getHours() +
        ":" +
        currentdate.getMinutes() +
        ":" +
        currentdate.getSeconds();

      time = time.split(":");
      time[3] = time[0] < 12 ? "AM" : "PM";
      time[0] = time[0] > 12 ? time[0] % 12 : time[0];

      let dateTime = date + `${time[0]}:${time[1]}:${time[2]}${time[3]}`;

      return dateTime;
    } catch (error) {
      console.log("Error : ", error);
      return "";
    }
  };

  const evmTransfer = async (data, isBig = false) => {
    try {
      if (
        balance.nativeBalance === 0 ||
        balance.nativeBalance === "" ||
        !data.amount
      )
        throw new Error("Error occured!");

      let to = Web3.utils.toChecksumAddress(data.to);

      const transactions = {
        from: currentAccount?.evmAddress,
        to: to,
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
      if (transactions.to) {
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
      const txInfo = await evmApi.eth.sendSignedTransaction(
        signedTx.rawTransaction
      );
      const hash = txInfo.transactionHash;

      let index = getAccId(currentAccount.id);
      let dataToDispatch = {
        data: {
          dateTime: getDateTime(),
          to: data.to,
          type: "Send",
          amount: data.amount,
          status: "Panding",
        },
        index: index,
      };
      dispatch(setTxHistory(dataToDispatch));

      if (hash)
        return {
          error: false,
          data: hash,
        };
      else throw new Error("Error occured! ");
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: "Error occured while sending!",
      };
    }
  };

  const nativeTransfer = async (data) => {
    try {
      if (
        balance.nativeBalance === 0 ||
        balance.nativeBalance === "" ||
        !data.amount
      )
        throw new Error("Error occured!");

      let index = getAccId(currentAccount.id);
      let dataToDispatch = {
        data: {
          dateTime: getDateTime(),
          to: data.to,
          type: "Send",
          amount: data.amount,
          status: "Panding",
        },
        index: index,
      };
      dispatch(setTxHistory(dataToDispatch));

      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const keyring = new Keyring({ type: "ed25519" });
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));
      const transfer = nativeApi.tx.balances.transferKeepAlive(
        data.toAddress,
        (Number(data.amount) * Math.pow(10, 18)).toString()
      );
      const transferRes = await transfer.signAndSend(alice);
      const hash = transferRes.toHex();

      if (hash)
        return {
          error: false,
          data: hash,
        };
      else throw new Error("Error occured! ");
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: "Error occured while sending!",
      };
    }
  };

  const nativeToEvmSwap = async (amount) => {
    try {
      if (
        balance.nativeBalance === 0 ||
        balance.nativeBalance === "" ||
        !amount
      )
        throw new Error(
          "Insufficent Balance or amount doesn't specified correctly!"
        );

      let index = getAccId(currentAccount.id);
      let dataToDispatch = {
        data: {
          dateTime: getDateTime(),
          to: "Native to Evm",
          type: "Swap",
          amount: amount,
          status: "Panding",
        },
        index: index,
      };
      dispatch(setTxHistory(dataToDispatch));

      amount = Number(
        Math.round(Number(amount) * Math.pow(10, 18) * 100) / 100
      ).toString();

      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const keyring = new Keyring({ type: "ed25519" });
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

      let deposit = await nativeApi.tx.evm.deposit(
        currentAccount?.evmAddress,
        amount
      );
      const transferRes = await deposit.signAndSend(alice);
      console.log(transferRes.toHex());
      const tx = transferRes.toHex();

      if (tx)
        return {
          error: false,
          data: tx,
        };
      else throw new Error("Error occured! ");
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: "Error occured while swapping!",
      };
    }
  };

  const evmToNativeSwap = async (amount) => {
    try {
      if (balance.evmBalance === 0 || balance.evmBalance === "" || !amount)
        throw new Error(
          "Insufficent Balance or amount doesn't specified correctly!"
        );

      let index = getAccId(currentAccount.id);

      let dataToDispatch = {
        data: {
          dateTime: getDateTime(),
          to: "Evm to Native",
          type: "Swap",
          amount: amount,
          status: "Panding",
        },
        index: index,
      };

      dispatch(setTxHistory(dataToDispatch));

      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const keyring = new Keyring({ type: "ed25519" });
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

      amount = Number(
        Math.round(Number(amount) * Math.pow(10, 18) * 100) / 100
      ).toString();
      const publicKey = u8aToHex(alice.publicKey);
      const transaction = {
        to: publicKey.slice(0, 42),
        value: amount.toString(),
        gas: 21000,
        nonce: await evmApi.eth.getTransactionCount(currentAccount?.evmAddress),
      };
      let temp2p = getKey(currentAccount.temp1m, pass);
      const signedTx = await evmApi.eth.accounts.signTransaction(
        transaction,
        temp2p //todo
      );

      let txHash;

      const isSuccess = await evmApi.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        async function (error, hash) {
          if (!error) {
            txHash = hash;
            return 1;
          } else {
            return 0;
          }
        }
      );

      if (isSuccess) {
        const withdraw = await nativeApi.tx.evm.withdraw(
          publicKey.slice(0, 42),
          amount.toString()
        );

        await withdraw.signAndSend(alice);
      }
      if (txHash)
        return {
          error: false,
          data: txHash,
        };
      else throw new Error("Error occured! ");
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: "Error occured while swapping!",
      };
    }
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
      } else throw new Error("Error occured!");
    } catch (error) {
      console.log("Error : ", error);
      return {
        error: true,
        data: "Error Occured!",
      };
    }
  };
  const retriveEvmFee = async (toAddress, amount, data = "") => {
    try {
      toAddress = toAddress ? toAddress : currentAccount?.nativeAddress;

      if (toAddress.startsWith("5"))
        toAddress = u8aToHex(toAddress).slice(0, 42);
      const tx = {
        to: toAddress,
        from: currentAccount?.evmAddress,
        value: "0x" + Number(amount).toString(16),
      };
      if (data) {
        tx.data = data;
      }
      const gasAmount = await evmApi.eth.estimateGas(tx);
      const gasPrice = await evmApi.eth.getGasPrice();
      let fee = Number((gasPrice * gasAmount) / 10 ** 18);
      return fee ? fee : 0;
    } catch (error) {
      console.log("error", error.toString());
      return 0;
    }
  };
  const retriveNativeFee = async (toAddress, amount) => {
    try {
      toAddress = toAddress ? toAddress : currentAccount?.evmAddress;
      let transferTx;
      const keyring = new Keyring({ type: "ed25519" });
      const seedAlice = mnemonicToMiniSecret(
        decryptor(currentAccount?.temp1m, pass)
      );
      const alice = keyring.addFromPair(ed25519PairFromSeed(seedAlice));

      amount = Number(amount)
        ? !(Number(amount) > 0 && Number(amount) < 1)
          ? Number(Math.round(Number(amount) * Math.pow(10, 18) * 100) / 100)
              // .noExponents()
              .toString()
          : 0
        : 0;
      if (toAddress.startsWith("0x")) {
        transferTx = await nativeApi.tx.evm.deposit(toAddress, amount);
      }

      console.log("amount : ", amount);

      if (toAddress.startsWith("5")) {
        transferTx = nativeApi.tx.balances.transferKeepAlive(toAddress, amount);
      }

      const info = await transferTx?.paymentInfo(alice);
      const adjFee = info?.partialFee;
      const fee = Number(adjFee) / Math.pow(10, 18);
      console.log("adjFee : ", Number(adjFee));
      console.log("Fee : ", fee);

      return fee ? fee : 0;
    } catch (error) {
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
