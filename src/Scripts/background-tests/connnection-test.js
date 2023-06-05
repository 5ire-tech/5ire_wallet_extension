import assert from "assert";
import { Connection } from "../../Helper/connection.helper";
import { log } from "console";

//test the node connection
export const connectionTest = async (network) => {
  try {
    const connection = new Connection();
    const apis = await connection.initializeApi(network);
    const networkId = await apis.evmApi.eth.net.getId();
    assert.equal(networkId, 997);
    return { test: "Node Connection", err: null };
  } catch (err) {
    return { test: "Node Connection", err: err };
  }
};

// test the native transfer
export const nativeSendTest = async () => {
  try {
    const item = "hello main";
    log(item);
  } catch (err) {
    return { test: "Native Send", err: err };
  }
};
