import { NETWORK } from "../../Constants";
import { connectionTest } from "./connnection-test";

//node connection test
async function nodeConnectionTest() {
  for (const network of Object.values(NETWORK)) {
    const res = await connectionTest(network.toLowerCase());
    console.log(
      `Test '${res.test}' for network '${network}' is ${
        res.err ? "\x1b[31mFailed!\x1b[0m" : "\x1b[32mPassed\x1b[0m"
      } ${res.err ? "due to: " + res.err.message : ""}`
    );
  }
}

/**
 * Run the all test for connection, transaction and utility functions
 */
async function testRunner() {
  await nodeConnectionTest();
}

//run the tests
testRunner();
