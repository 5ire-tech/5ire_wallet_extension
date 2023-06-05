"use strict";

var _Constants = require("../../Constants");
var _connnectionTest = require("./connnection-test");
//node connection test
async function nodeConnectionTest() {
  for (const network of Object.values(_Constants.NETWORK)) {
    const res = await (0, _connnectionTest.connectionTest)(network.toLowerCase());
    console.log(`Test '${res.test}' for network '${network}' is ${res.err ? "\x1b[31mFailed!\x1b[0m" : "\x1b[32mPassed\x1b[0m"} ${res.err ? "due to: " + res.err.message : ""}`);
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