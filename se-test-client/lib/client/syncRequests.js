'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _nodeFetch = require('node-fetch');var _nodeFetch2 = _interopRequireDefault(_nodeFetch);
var _config = require('../config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var syncRequests = function syncRequests(data, intervalMs) {return new Promise(function (res) {return (
            (0, _nodeFetch2.default)(_config2.default.seleniumUrl + '/grid/admin/Console/requests', {
                headers: _config2.default.seleniumHeaders }).

            catch(console.warn).
            finally(function () {return setTimeout(function () {return syncRequests(data, intervalMs);}, intervalMs);}).
            then(function (r) {return r.json();}).
            then(function (j) {
                var queueLengths = Object.keys(data.emulators).reduce(function (acc, i) {
                    acc[i] = 0;
                    return acc;
                }, {});
                j['requested_capabilities'].forEach(function (i) {
                    if (queueLengths[i.udid] !== undefined) {
                        queueLengths[i.udid]++;
                    }
                });
                //console.log(queueLengths)
                data.updateQueueLengths(queueLengths);
                res();
            }));});};exports.default =

syncRequests;

/*
              {
                  "requested_capabilities": [
                      {
                      "app": "/apps/app.apk",
                      "browserName": "android",
                      "browserVersion": "node-droid722700001J",
                      "deviceName": "android",
                      "newSessionWaitTimeout": 60000,
                      "platformName": "android",
                      "platformVersion": "4.2.2",
                      "udid": "droid722700001J_2:5555"
                      }
                  ]
              }
              */
//# sourceMappingURL=syncRequests.js.map