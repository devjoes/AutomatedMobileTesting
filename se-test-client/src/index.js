import Mocha from 'mocha-parallel-tests';
import fs from 'fs';
import path from 'path';
import syncEmulators from './client/syncEmulators';
import syncRequests from './client/syncRequests';
import hub from './ipc/hub';
import emulatorData from './emulatorData';
import config from './config';

const data = emulatorData();

const setup = async () => {
    hub(data);
    console.log('Syncing emulators');
    await syncEmulators(data, 10000);
    console.log('Syncing requests');
    await syncRequests(data, 250);
    console.log('Setup complete');
};
const runTests = () => new Promise(res => {
    const mocha = new Mocha({
        timeout: 0,
        slow:0,
        retries: 10 // selenium can be a bit unreliable
    });
    mocha.setMaxParallel(data.emulators.length * config.maxQueueLength);
    fs.readdir(path.join(__dirname,'..', 'tests'), (err, files) => {
        if (err) {
            return console.error(err);
        }

        //TODO: Make it give up if takes x time more than the average time to get a driver

        //TODO: Remove!!
        for (let i = 0; i < 500; i++) {
            files.filter(f => f.match(/test\.js/i))
                .forEach(f => mocha.addFile(path.join(__dirname,'..', 'tests', f)));
            //mocha.addFile("C:\\Development\\testing-talk\\AutomatedMobileTesting\\se-test-client\\src\\tests\\retry.test.js");
        }

        const runner = mocha.run(failures => {
            console.log(`Finished, there were ${failures} failures`);
            res();
        });

        runner.on('fail', test =>
            test && test.udid && data.testFailure(test.udid));
    });
});
setup()
    .catch(console.error).then(runTests)
    .then(() => process.exit());

// let lastOutput;
// setInterval(() => {
//     const output = JSON.stringify(data);
//     if (lastOutput !== output) {
//         console.log(data.emulators);
//     }
//     lastOutput = output;
// }, 1000);