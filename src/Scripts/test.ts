import axios, { Method } from 'axios';
import {
   SignedBlock,
   CodecHash,
   BlockNumber,
   DispatchInfo,
} from '@polkadot/types/interfaces';
const { ApiPromise } = require('@polkadot/api');
const _ = require('lodash');
const moment = require('moment');

import { u8aToHex } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

const temptransactionstatmin = {
   count: 0,
   time: moment(new Date()).format('mm'),
};

const temptransactionstathour = {
   count: 0,
   time: moment(new Date()).format('hh'),
};

/**
 * transaction fee calcul.
 * @param value
 * @returns
 */



// Get Transaction Details of Block
async function getBlockInsideDetails(
   api: typeof ApiPromise,
   lastHeader: any
) {
   try {
      const signedBlock: SignedBlock = await api.rpc.chain.getBlock(
         lastHeader.blockHash
      );
      const allRecords: any = await api.query.system.events.at(
         signedBlock.block.header.hash
      );

      let transactionCount = 0;
      let weight = 0;
      let deposit = 0;
      let transfer = 0;
      const date = new Date();
      /* @ts-ignore */
      // @ts-nocheck
      const payout:any = [];
      // const transactions: Tranaction[] = [];
      /* @ts-ignore */
      // @ts-nocheck
      const transactionObj = {};

      await signedBlock.block.extrinsics.forEach(
         ({ method: { method, section } }, index: number) => {
            let eraIndex: any = null;
            allRecords
               .filter(
                  (e: any) =>
                     e.phase.isApplyExtrinsic &&
                     e.phase.asApplyExtrinsic.eq(index)
               )
               .map(async ({ event }: any) => {
                  let transactionData: any;
                  if (event.method.toLowerCase() == 'extrinsicfailed') {
                     const [dispatchError] = event.data;

                     let errorInfo: string;

                     if (dispatchError.isModule) {
                        const decoded = api.registry.findMetaError(
                           dispatchError.asModule
                        );
                        errorInfo = `${decoded.section}.${decoded.name}`;
                     } else {
                        errorInfo = dispatchError.toString();
                     }

                     const data = JSON.parse(
                        signedBlock.block.extrinsics[index].toString()
                     );
                     /* @ts-ignore */
                     // @ts-nocheck
                     let txFee = transactionObj[
                        `${signedBlock.block.extrinsics[index].hash}`
                     ]?.txFee
                        ? /* @ts-ignore */
                          // @ts-nocheck
                          transactionObj[
                             `${signedBlock.block.extrinsics[index].hash}`
                          ].txFee
                        : 0;

                     const from = data?.signature?.signer?.id? data?.signature?.signer?.id.toString():"N/A";
                     const to = data?.method?.args?.dest?.id?data?.method?.args?.dest?.id.toString():"N/A";
                     const value = data?.method?.args?.value?Number(data?.method?.args?.value).toString():'0';

                     temptransactionstatmin['count'] =
                        temptransactionstatmin['count'] + 1;
                     temptransactionstathour['count'] =
                        temptransactionstathour['count'] + 1;
                     transactionCount = transactionCount + 1;

                     transactionData = {
                        from_address: from,
                        to_address: to,
                        value: value,
                        txhash:
                           signedBlock.block.extrinsics[index].hash.toString(),
                        reason: event.method.toLowerCase(),
                        sectionmethod: errorInfo,
                        status: 'failed',
                        txFee: txFee,
                        timestamp: date.toString(),
                        blocknumber: lastHeader.blockNumber.toString(),
                     };
                     /* @ts-ignore */
                     // @ts-nocheck
                     transactionObj[
                        signedBlock.block.extrinsics[index].hash.toString()
                     ] = transactionData;
                  } else if (
                     event.method.toLowerCase() == 'withdraw' && 
                     event.section == 'balances'
                  ) {
                     const data = JSON.parse(
                        signedBlock.block.extrinsics[index].toString()
                     );
                     const from = data?.signature?.signer?.id?data?.signature?.signer?.id.toString():"N/A";
                     const to = data?.method?.args?.dest?.id?data?.method?.args?.dest?.id.toString():"N/A";
                     const value = data?.method?.args?.value?Number(data?.method?.args?.value).toString():"0";
                     /* @ts-ignore */
                     // @ts-nocheck
                     transactionObj[
                        signedBlock.block.extrinsics[index].hash.toString()
                     ] =
                        /* @ts-ignore */
                        // @ts-nocheck
                        transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ]?.sectionmethod !== 'staking.Bonded'
                           ? {}
                           : /* @ts-ignore */
                             // @ts-nocheck
                             transactionObj[
                                signedBlock.block.extrinsics[
                                   index
                                ].hash.toString()
                             ];

                     /* @ts-ignore */
                     // @ts-nocheck
                     transactionObj[
                        signedBlock.block.extrinsics[index].hash.toString()
                     ].txFee = Number(event.data[1]) / Math.pow(10, 18);

                     if (from === to) {
                        transactionData = {
                           from_address: from,
                           to_address: to,
                           value: value,
                           txhash:
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString(),
                           reason: event.method.toLowerCase(),
                           sectionmethod: `${section}.${method}`,
                           status: 'success',
                           /* @ts-ignore */
                           // @ts-nocheck
                           txFee: transactionObj[
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString()
                           ].txFee,
                           timestamp: date.toString(),
                           blocknumber: lastHeader.blockNumber.toString(),
                        };

                        /* @ts-ignore */
                        // @ts-nocheck
                        transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ] = transactionData;

                        transactionCount = transactionCount + 1;
                        temptransactionstatmin['count'] =
                           temptransactionstatmin['count'] + 1;
                        temptransactionstathour['count'] =
                           temptransactionstathour['count'] + 1;
                     }
                  } else {
                     if (
                        event.method.toLowerCase() == 'transfer' &&
                        event.section == 'balances'
                     ) {
                        /* @ts-ignore */
                        // @ts-nocheck
                        let txFee = transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ]?.txFee
                           ? /* @ts-ignore */
                             // @ts-nocheck
                             transactionObj[
                                signedBlock.block.extrinsics[
                                   index
                                ].hash.toString()
                             ]?.txFee
                           : 0;
                        transactionData = {
                           from_address: event.data[0].toString(),
                           to_address: event.data[1].toString(),
                           value: event.data[2]
                              ? event.data[2].toString()
                              : 'N/A',
                           txhash:
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString(),
                           reason: event.method.toLowerCase(),
                           sectionmethod: `${section}.${method}`,
                           status: 'success',
                           txFee: txFee,
                           timestamp: date.toString(),
                           blocknumber: lastHeader.blockNumber.toString(),
                        };
                        /* @ts-ignore */
                        // @ts-nocheck
                        transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ] = transactionData;

                        transfer = transfer + Number(event.data[2]);
                        transactionCount = transactionCount + 1;
                        temptransactionstatmin['count'] =
                           temptransactionstatmin['count'] + 1;
                        temptransactionstathour['count'] =
                           temptransactionstathour['count'] + 1;
                     } else if (
                        (event.method.toLowerCase() === 'bonded' &&
                           event.section === 'staking') ||
                        (event.method.toLowerCase() === 'unbonded' &&
                           event.section === 'staking') ||
                        (event.method.toLowerCase() === 'chilled' &&
                           event.section === 'staking') ||
                        (event.method.toLowerCase() === 'validatorprefsset' &&
                           event.section === 'staking') ||
                           (event.method.toLowerCase() === 'nominatorprefsset' &&
                           event.section === 'staking')||
                           (event.method.toLowerCase() === 'withdrawn' &&
                           event.section === 'staking')
                     ) {
                        /* @ts-ignore */
                        // @ts-nocheck
                        let txFee = transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ].txFee
                           ? /* @ts-ignore */
                             // @ts-nocheck
                             transactionObj[
                                signedBlock.block.extrinsics[
                                   index
                                ].hash.toString()
                             ].txFee
                           : 0;
                        if (
                           (event.method.toLowerCase() ===
                              'validatorprefsset' &&
                              event.section === 'staking') ||
                           (event.method.toLowerCase() === 'nominatorprefsset' &&
                              event.section === 'staking')
                        ) {
                           if (
                              /* @ts-ignore */
                              // @ts-nocheck
                              transactionObj[
                                 signedBlock.block.extrinsics[
                                    index
                                 ].hash.toString()
                              ]?.sectionmethod !== 'staking.Bonded'
                           ) {
                              transactionData = {
                                 from_address: event.data[0].toString(),
                                 to_address: 'N/A',
                                 value: '0',
                                 txhash:
                                    signedBlock.block.extrinsics[
                                       index
                                    ].hash.toString(),
                                 reason: event.method.toLowerCase(),
                                 sectionmethod:
                                    event.method.toLowerCase() ===
                                    'validatorprefsset'
                                       ? 'staking.revalidated'
                                       : 'staking.renominated',
                                 status: 'success',
                                 txFee: txFee,
                                 timestamp: date.toString(),
                                 blocknumber: lastHeader.blockNumber.toString(),
                              };
                           }
                        } else {
                           transactionData = {
                              from_address: event.data[0].toString(),
                              to_address: 'N/A',
                              value: event.data[1]
                                 ? event.data[1].toString()
                                 : 'N/A',
                              txhash:
                                 signedBlock.block.extrinsics[
                                    index
                                 ].hash.toString(),
                              reason: event.method.toLowerCase(),
                              sectionmethod: `${event.section}.${event.method}`,
                              status: 'success',
                              txFee: txFee,
                              timestamp: date.toString(),
                              blocknumber: lastHeader.blockNumber.toString(),
                           };
                        }

                        /* @ts-ignore */
                        // @ts-nocheck
                        transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ] =
                           transactionData == undefined
                              ? /* @ts-ignore */
                                // @ts-nocheck
                                transactionObj[
                                   signedBlock.block.extrinsics[
                                      index
                                   ].hash.toString()
                                ]
                              : transactionData;

                        transfer = transfer + Number(event.data[1]);
                        transactionCount = transactionCount + 1;
                        temptransactionstatmin['count'] =
                           temptransactionstatmin['count'] + 1;
                        temptransactionstathour['count'] =
                           temptransactionstathour['count'] + 1;
                     } else if (
                        event.section === 'staking' &&
                        event.method.toLowerCase() === 'payoutstarted'
                     ) {
                        eraIndex = `${event.data[0]}`;
                        // const data = JSON.parse(
                        //    signedBlock.block.extrinsics[index].toString()
                        // );
                        // const from = data?.signature?.signer?.id.toString();

                        // console.log("data",data, JSON.stringify(data?.method?.args))
                     } else if (
                        event.section === 'staking' &&
                        event.method.toLowerCase() === 'rewarded'
                     ) {
                        const data = JSON.parse(
                           signedBlock.block.extrinsics[index].toString()
                        );
                        /* @ts-ignore */
                        // @ts-nocheck
                        let txFee = transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ].txFee
                           ? /* @ts-ignore */
                             // @ts-nocheck
                             transactionObj[
                                signedBlock.block.extrinsics[
                                   index
                                ].hash.toString()
                             ].txFee
                           : 0;

                        transactionData = {
                           from_address: data?.signature?.signer?.id.toString(),
                           to_address: 'N/A',
                           /* @ts-ignore */
                           // @ts-nocheck
                           value: transactionObj[
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString()
                           ]?.value
                              ? /* @ts-ignore */
                                // @ts-nocheck
                                (
                                   Number(
                                      /* @ts-ignore */
                                      // @ts-nocheck
                                      transactionObj[
                                         signedBlock.block.extrinsics[
                                            index
                                         ].hash.toString()
                                      ]?.value
                                   ) + Number(event.data[1])
                                ).toString()
                              : 0 + Number(event.data[1]),
                           txhash:
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString(),
                           reason: event.method.toLowerCase(),
                           sectionmethod: `${event.section}.${event.method}`,
                           status: 'success',
                           txFee: txFee,
                           timestamp: date.toString(),
                           blocknumber: lastHeader.blockNumber.toString(),
                        };
                        /* @ts-ignore */
                        // @ts-nocheck
                        transactionObj[
                           signedBlock.block.extrinsics[index].hash.toString()
                        ] = transactionData;
                        payout.push({
                           txhash:
                              signedBlock.block.extrinsics[
                                 index
                              ].hash.toString(),
                           eraindex: `${eraIndex}`,
                           stashaccount: `${event.data[0]}`,
                           reward: event.data[1].toString(),
                           status: 'success',
                           blocknumber: lastHeader.blockNumber.toString(),
                        });
                     } else if (
                        event.method.toLowerCase() == 'deposit' &&
                        event.section == 'balances'
                     ) {
                        deposit = deposit + Number(event.data[1]);
                     }

                     if (event.section.toLowerCase() == 'system') {
                        weight = weight + Number(event?.data[0]?.weight?event?.data[0]?.weight:0);
                     }
                  }
               });
         }
      );



   } catch (err) {
      console.log('Error while getting transaction details: ', err);
   }
}

export { getBlockInsideDetails };