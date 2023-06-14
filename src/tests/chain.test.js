import {
  connectionTest,
  nativeSendTest,
  evmSendTest,
  evmToNativeSwapTest
} from "../Scripts/background-tests/test-chain";
import { NETWORK, TESTS } from "../Constants/index";
import { Connection } from "../Helper/connection.helper";

//Test Case #1 (Node connection test)
// eslint-disable-next-line jest/valid-title
test(TESTS.NODE_CONNECTION, async () => {
  for (const network of Object.values(NETWORK)) {
    const res = await connectionTest(network.toLowerCase());
    expect(true).toStrictEqual(res);
  }
});

//Test Cases #2 (Native transfer test for all available networks)
// eslint-disable-next-line jest/valid-title
test(TESTS.NATIVE_TRANSFER_TESTNET, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.TEST_NETWORK.toLowerCase());
  const res = await nativeSendTest(api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// eslint-disable-next-line jest/valid-title
test(TESTS.NATIVE_TRANSFER_QA, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.QA_NETWORK.toLowerCase());
  const res = await nativeSendTest(api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// eslint-disable-next-line jest/valid-title
test(TESTS.NATIVE_TRANSFER_UAT, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.UAT.toLowerCase());
  const res = await nativeSendTest(api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

//Test Cases #3 (EVM transfer test for all available networks)
// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TRANSFER_TESTNET, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.TEST_NETWORK.toLowerCase());
  const res = await evmSendTest(api.evmApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  api.nativeApi.disconnect();
});

// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TRANSFER_QA, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.QA_NETWORK.toLowerCase());
  const res = await evmSendTest(api.evmApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TRANSFER_UAT, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.UAT.toLowerCase());
  const res = await evmSendTest(api.evmApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

//Test Cases #4 (EVM to Native Swap test for all available networks)
// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TO_NATIVE_TESTNET, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.TEST_NETWORK.toLowerCase());
  const res = await evmToNativeSwapTest(api.evmApi, api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TO_NATIVE_QA, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.QA_NETWORK.toLowerCase());
  const res = await evmToNativeSwapTest(api.evmApi, api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TO_NATIVE_UAT, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.UAT.toLowerCase());
  const res = await evmToNativeSwapTest(api.evmApi, api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

//Test Cases #5 (EVM to Native Swap test for all available networks)
// eslint-disable-next-line jest/valid-title
test(TESTS.EVM_TO_NATIVE_TESTNET, async () => {
  const connection = new Connection();
  const api = await connection.initializeApi(NETWORK.TEST_NETWORK.toLowerCase());
  const res = await evmToNativeSwapTest(api.evmApi, api.nativeApi);
  expect(res.length).toStrictEqual(66);

  //disconnect the api after operation transaction
  disconnect(api.nativeApi);
});

// helpers
const disconnect = (api) => {
  api.disconnect();
};
