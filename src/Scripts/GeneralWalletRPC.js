import BigNumber from "bignumber.js";
import { DECIMALS, ERRCODES, ERROR_MESSAGES, LABELS, STATE_CHANGE_ACTIONS } from "../Constants";
import { ErrorPayload } from "../Utility/error_helper";
import { EventPayload } from "../Utility/network_calls";
import { isNullorUndef, log } from "../Utility/utility";
import { HybridKeyring } from "./5ire-keyring";
import ValidatorNominatorHandler from "./nativehelper";
import { NetworkHandler } from "./NetworkHandler";
import { ERC20_ABI } from "../Constants/erc20.abi";
import { assert, compactToU8a, isHex, u8aConcat, u8aEq, u8aToHex } from "@polkadot/util";
import Web3 from "web3";
import { getDataLocal } from "../Storage/loadstore";

/**
 * For balance, fee and other calls
 */
export class GeneralWalletRPC {
  // static feeStore = {};

  constructor() {
    this.hybridKeyring = HybridKeyring.getInstance();
    this.nominatorValidatorHandler = ValidatorNominatorHandler.getInstance();
  }

  //for fething the balance of both (evm and native)
  getBalance = async (message, state) => {
    try {
      // console.log("network and api: ", NetworkHandler.api, state.currentNetwork);
      const balance =
        state.allAccountsBalance[state.currentAccount?.evmAddress][
          state.currentNetwork.toLowerCase()
        ];

      if (!NetworkHandler.api[state.currentNetwork.toLowerCase()]?.evmApi)
        return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, {
          data: balance
        });

      // let nbalance = 0;
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const account = state.currentAccount;

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      // Evm Balance
      // const w3balance = await evmApi?.eth?.getBalance(account.evmAddress);

      let balances = await nativeApi?.query.system.account(account.evmAddress);
      const balance1 = balances.toHuman();

      const free = +balance1?.data?.free?.replaceAll(",", "");
      const frozen = +balance1?.data?.frozen?.replaceAll(",", "");
      let stakedBalance = new BigNumber(frozen).dividedBy(DECIMALS).toString();
      let totalBalance = new BigNumber(free).dividedBy(DECIMALS).toString();

      if (Number(stakedBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(frozen).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0) stakedBalance = parseInt(tempBalance);
        else stakedBalance = tempBalance;
      }

      if (Number(totalBalance) % 1 !== 0) {
        let tempBalance = new BigNumber(free).dividedBy(DECIMALS).toFixed(6, 8).toString();
        if (Number(tempBalance) % 1 === 0) totalBalance = parseInt(tempBalance);
        else totalBalance = tempBalance;
      }

      let transferableBalance = new BigNumber(totalBalance).minus(stakedBalance).toString();
      if (Number(transferableBalance) % 1 !== 0)
        transferableBalance = new BigNumber(totalBalance)
          .minus(stakedBalance)
          .toFixed(6, 8)
          .toString();

      const payload = {
        data: {
          totalBalance,
          stakedBalance,
          transferableBalance
        }
      };

      return new EventPayload(STATE_CHANGE_ACTIONS.BALANCE, null, payload);
    } catch (err) {
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_BALANCE_FETCH, err.message)
      );
    }
  };

  getTokenBalance = async (message, state) => {
    try {
      const account = state.currentAccount?.evmAddress;
      const network = state?.currentNetwork?.toLowerCase();

      const tokens = state?.tokens[account][network];

      if (tokens?.length) {
        const tokensToUpdate = [];
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
          const contract = new evmApi.eth.Contract(ERC20_ABI, token?.address);
          const balance = await contract.methods.balanceOf(account).call();
          tokensToUpdate.push({
            ...token,
            balance: balance
          });
        }

        const payload = {
          data: {
            tokensToUpdate,
            network,
            account
          }
        };

        return new EventPayload(STATE_CHANGE_ACTIONS.TOKEN_BALANCE, null, payload);
      }
      return new EventPayload(null, null, null);
    } catch (error) {
      // console.log("error while getting tokenBalance : ", error);
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.TOKEN_BALANCE_UPDATE, error?.message)
      );
    }
  };

  //get the evm fee
  evmFee = async (message, state) => {
    try {
      const { data } = message;
      const {
        options: { account }
      } = data;

      const { evmApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      const contractAddress = data?.data ? null : account.nativeAddress;
      let toAddress = data.toAddress ?? contractAddress;
      let amount = data?.value;

      if (toAddress?.startsWith("5")) {
        toAddress = u8aToHex(toAddress).slice(0, 42);
      }

      if (toAddress?.startsWith("0x")) {
        toAddress && Web3.utils.toChecksumAddress(toAddress);
      }

      const tx = {
        to: toAddress,
        from: account.evmAddress,
        // value: Number(amount) * DECIMALS
        value: new BigNumber(amount).multipliedBy(DECIMALS)
      };

      if (data?.data) {
        tx.data = data.data;
      }

      const gasPrice = await evmApi.eth.getGasPrice();
      const gasAmount = await evmApi.eth.estimateGas(tx);
      const fee = new BigNumber(gasPrice * gasAmount).dividedBy(DECIMALS).toString();

      // GeneralWalletRPC.feeStore[id] = fee;
      const payload = {
        data: { fee }
      };

      return new EventPayload(null, message.event, payload);
    } catch (err) {
      console.log("error while getting fee : ", err);
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message)
      );
    }
  };

  //get native gas fee
  nativeFee = async (message, state) => {
    try {
      const { data } = message;
      const {
        options: { account },
        isEd
      } = data;
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

      if (isNullorUndef(account))
        new Error(new ErrorPayload(ERRCODES.NULL_UNDEF, ERROR_MESSAGES.UNDEF_DATA)).throw();

      const toAddress = data.toAddress ? data.toAddress : account.evmAddress;
      let transferTx;

      const signer = this.hybridKeyring.getNativeSignerByAddress(account.nativeAddress);

      if (toAddress?.startsWith("0x")) {
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        transferTx = await nativeApi.tx.evm.deposit(
          toAddress,
          Number(amt).noExponents().toString()
        );
      } else if (toAddress?.startsWith("5")) {
        const amt = new BigNumber(data.value).multipliedBy(DECIMALS).toString();
        if (isEd)
          transferTx = nativeApi.tx.balances.transferKeepAlive(
            toAddress,
            Number(amt).noExponents().toString()
          );
        else
          transferTx = nativeApi.tx.balances.transfer(
            toAddress,
            Number(amt).noExponents().toString()
          );
      }
      const info = await transferTx?.paymentInfo(signer);
      const fee = new BigNumber(info.partialFee.toString()).div(DECIMALS).toString();

      //construct payload
      const payload = { data: { fee } };
      return new EventPayload(null, message.event, payload);
    } catch (err) {
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message)
      );
    }
  };

  //external native transaction fee
  externalNativeTransactionArgsAndGas = async (message, state) => {
    const { activeSession } = await getDataLocal(LABELS.EXTERNAL_CONTROLS);
    const { nativeApi: api } = NetworkHandler.api[state.currentNetwork.toLowerCase()];

    const hex = activeSession.message?.method;

    // const DEFAULT_INFO = {
    //   decoded: null,
    //   extrinsicCall: null,
    //   extrinsicError: null,
    //   extrinsicFn: null,
    //   extrinsicHex: null,
    //   extrinsicKey: 'none',
    //   extrinsicPayload: null,
    //   isCall: true
    // };

    try {
      assert(isHex(hex), "Expected a hex-encoded call");

      let extrinsicCall,
        extrinsicPayload = null,
        decoded = null;
      // let isCall = false;

      try {
        // cater for an extrinsic input
        const tx = api.tx(hex);

        // ensure that the full data matches here
        assert(tx.toHex() === hex, "Cannot decode data as extrinsic, length mismatch");

        decoded = tx;
        extrinsicCall = api.createType("Call", decoded.method);
      } catch (e) {
        try {
          // attempt to decode as Call
          extrinsicCall = api.createType("Call", hex);

          const callHex = extrinsicCall.toHex();

          if (callHex === hex) {
            // all good, we have a call
            // isCall = true;
          } else if (hex.startsWith(callHex)) {
            // this could be an un-prefixed payload...
            const prefixed = u8aConcat(compactToU8a(extrinsicCall.encodedLength), hex);

            extrinsicPayload = api.createType("ExtrinsicPayload", prefixed);

            assert(
              u8aEq(extrinsicPayload.toU8a(), prefixed),
              "Unable to decode data as un-prefixed ExtrinsicPayload"
            );

            extrinsicCall = api.createType("Call", extrinsicPayload.method.toHex());
          } else {
            new Error(
              new ErrorPayload(
                ERRCODES.INTERNAL,
                "Unable to decode data as Call, length mismatch in supplied data"
              )
            ).throw();
          }
        } catch {
          // final attempt, we try this as-is as a (prefixed) payload
          extrinsicPayload = api.createType("ExtrinsicPayload", hex);

          assert(
            extrinsicPayload.toHex() === hex,
            "Unable to decode input data as Call, Extrinsic or ExtrinsicPayload"
          );
          extrinsicCall = api.createType("Call", extrinsicPayload.method.toHex());
        }
      }

      const { method, section } = api.registry.findMetaCall(extrinsicCall.callIndex);
      const extrinsicFn = api.tx[section][method];
      // const extrinsicKey = extrinsicCall.callIndex.toString();

      if (!decoded) {
        decoded = extrinsicFn(...extrinsicCall.args);
      }

      const info = await decoded?.paymentInfo(
        this.hybridKeyring.getNativeSignerByAddress(state.currentAccount.nativeAddress)
      );
      const fee = new BigNumber(info.partialFee.toString()).div(DECIMALS).toFixed(6, 8).toString();
      const params = decoded.method.toJSON()?.args;

      const payload = {
        method: `${section}.${method}`,
        estimatedGas: fee,
        args: params,
        txHash: decoded.hash.toHex()
      };

      return new EventPayload(null, message.event, { data: payload });
    } catch (err) {
      log("error formatting and getting the native external ", err);
      return new EventPayload(
        null,
        message.event,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE, err.message)
      );
    }
  };

  //calculate the fee for nominator and validator
  validatorNominatorFee = async (message, state) => {
    try {
      // const id = message.data.options.id;
      // //check if fee is calculated for same request
      // if (GeneralWalletRPC.feeStore[id])
      //   return new EventPayload(null, message.event, GeneralWalletRPC.feeStore[id]);

      const eventPayload = await this.nominatorValidatorHandler.handleNativeAppsTask(
        state,
        message,
        true
      );

      //set the current fee using tx id
      // GeneralWalletRPC.feeStore[id] = eventPayload.payload;

      return eventPayload;
    } catch (err) {
      log("here is error: ", err);
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(
          ERRCODES.ERROR_WHILE_GETTING_ESTIMATED_FEE,
          err.message?.errMessage ? err.message.errMessage : err.message
        )
      );
    }
  };

  getED = async (message, state) => {
    try {
      const { nativeApi } = NetworkHandler.api[state.currentNetwork.toLowerCase()];
      const ed = nativeApi.consts.balances.existentialDeposit.toString();
      const payload = {
        data: { ed }
      };

      return new EventPayload(null, message.event, payload);
    } catch (err) {
      return new EventPayload(
        null,
        null,
        null,
        new ErrorPayload(ERRCODES.ERROR_WHILE_GETTING_ED, err?.message)
      );
    }
  };
}
