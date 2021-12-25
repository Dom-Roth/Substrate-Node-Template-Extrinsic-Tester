const { ApiPromise, WsProvider } = require('@polkadot/api');
import { Tester } from "./Tester";

const argv = require('minimist')(process.argv.slice(2));
let endpoint;

/*
Index:

    printTestResult()
    printHelp()
    testDoSomething()
    testCauseError()
    testFastCheck()
    handleArguments()
    main()
 */


function printTestResult(testNum:number, wasTestSuccess:boolean, testDescription:string) {
    if (wasTestSuccess === true) {
        console.log("\nTest #" + testNum + ": [X] Passed\n" + testDescription + "\n");
    } else {
        console.warn("\nTest #" + testNum + ": [ ] FAILED!\n" + testDescription + "\n");
    }
}

function printHelp() {
    console.log("Usage: main.ts [OPTION] -a ENDPOINT_ADDRESS");
    console.log("The following options are available:");
    console.log("--test-doSomething-success | Tests all expected doSomething() successful options.");
    console.log("--test-doSomething-failure | Tests all expected doSomething() failing options.");
    console.log("--test-causeError-success | Tests all expected causeError() successful options.");
    console.log("--test-causeError-failure | Tests all expected causeError() failing options.");
    console.log("--test-fast-check | Runs fast check tests.");
    console.log("-a | Endpoint address should be in the form of e.g.: ws://127.0.0.1:9944");
    console.log("--help | Shows this text");
}

function testDoSomething(tester) {
    if (argv["test-doSomething-success"] == true) {
        console.log("Starting doSomething success test...");
        tester.testSuccessfulDoSomething(printTestResult);
    }
    if (argv["test-doSomething-failure"] == true) {
        console.log("Starting doSomething failure test...");
        tester.testErrorDoSomething(printTestResult);
    }
}

function testCauseError(tester) {
    if (argv["test-causeError-success"] == true) {
        console.log("Starting causeError success test...");
        tester.testSuccessfulCauseError(printTestResult);
    }
    if (argv["test-causeError-failure"] == true) {
        console.log("Starting causeError failure test...");
        tester.testErrorCauseError(printTestResult);
    }
}

function testFastCheck(tester) {
    if (argv["test-fast-check"] == true) {
        console.log("Starting Fast Check test...");
        tester.fastCheckTest_DoSomething();
    }
}

function handleArguments() {
    if (argv['help'] == true) {
        printHelp();
        process.exit(0);
    }
    // Exit if no mode has been selected or endpoint is undefined.
    if (argv['test-doSomething-success'] == false &&
        argv['test-doSomething-failure'] == false &&
        argv['test-causeError-success'] == false &&
        argv['test-causeError-failure'] == false &&
        argv['test-fast-check'] == false ||
        !argv['a'].startsWith("ws://")) {
        console.error("Please provide an option!\n");
        printHelp();
        process.exit(0);
    }
    endpoint = argv._[argv._.length-1];
}

async function main () {
    handleArguments();
    // Initialise the provider to connect to the defined node
    const provider = new WsProvider(endpoint);
    // Create the API and wait until ready
    const api = await ApiPromise.create({ provider });

    // Create tester object
    let tester = new Tester(api);
    await tester.printChainInformation();

    // Run tests
    console.log("\nTests starting...\n");
    await new Promise(() => {
        testDoSomething(tester);

        testCauseError(tester);

        testFastCheck(tester);
    }).finally(() => {
        console.log("General Tests completed!");
        api.disconnect();
        // Application should exit here... I said SHOULD alright! -.-
        process.exit(0);
    });
}

main().catch(console.error).finally(() => process.exit());
