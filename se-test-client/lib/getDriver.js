'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _wd = require('wd');


var _config = require('./config');var _config2 = _interopRequireDefault(_config);
var _client = require('./ipc/client');var _client2 = _interopRequireDefault(_client);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.default =

async function () {
    var driver = (0, _wd.promiseChainRemote)(_config2.default.seleniumUrl + '/wd/hub');
    driver.clientId = Math.round(Math.random() * 100000);
    var client = await (0, _client2.default)(driver.clientId);var _ref =



    await client.getEmulator(),udid = _ref.udid,host = _ref.host;
    var caps = Object.assign({}, _config2.default.capabilities, {
        browserVersion: host,
        udid: udid
        //deviceName: udid
    });
    console.log('Getting driver', caps);
    await driver.init(caps);
    console.log('Got driver');
    driver.client = client;
    driver.udid = udid;
    driver._quit = driver.quit;
    driver.quit = function () {
        this._quit();
        this.client.releaseEmulator(this.udid);
    };
    return driver;
};
//# sourceMappingURL=getDriver.js.map