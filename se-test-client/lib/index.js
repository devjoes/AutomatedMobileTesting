'use strict';var _mochaParallelTests = require('mocha-parallel-tests');var _mochaParallelTests2 = _interopRequireDefault(_mochaParallelTests);
var _fs = require('fs');var _fs2 = _interopRequireDefault(_fs);
var _path = require('path');var _path2 = _interopRequireDefault(_path);
var _syncEmulators = require('./client/syncEmulators');var _syncEmulators2 = _interopRequireDefault(_syncEmulators);
var _syncRequests = require('./client/syncRequests');var _syncRequests2 = _interopRequireDefault(_syncRequests);
var _hub = require('./ipc/hub');var _hub2 = _interopRequireDefault(_hub);
var _emulatorData = require('./emulatorData');var _emulatorData2 = _interopRequireDefault(_emulatorData);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var data = (0, _emulatorData2.default)();

var setup = async function setup() {
    (0, _hub2.default)(data);
    console.log('Syncing emulators');
    await (0, _syncEmulators2.default)(data, 10000);
    console.log('Syncing requests');
    await (0, _syncRequests2.default)(data, 250);
    console.log('Setup complete');
};
var runTests = function runTests() {return new Promise(function (res) {
        var mocha = new _mochaParallelTests2.default({
            timeout: 0,
            retries: 3 // selenium can be a bit unreliable
        });
        _fs2.default.readdir(_path2.default.join(__dirname, 'tests'), function (err, files) {
            if (err) {
                return console.error(err);
            }

            //TODO: Remove!!
            for (var i = 0; i < 100; i++) {
                files.forEach(function (f) {return mocha.addFile(_path2.default.join(__dirname, 'tests', f));});
            }
            console.log(mocha.files);

            mocha.run(function (failures) {
                console.log('Finished ' + failures + ' failures');
                res();
            });

        });
    });};
setup().catch(console.error).then(runTests);

// let lastOutput;
// setInterval(() => {
//     const output = JSON.stringify(data);
//     if (lastOutput !== output) {
//         console.log(data.emulators);
//     }
//     lastOutput = output;
// }, 1000);
//# sourceMappingURL=index.js.map