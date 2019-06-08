'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _nodeFetch = require('node-fetch');var _nodeFetch2 = _interopRequireDefault(_nodeFetch);
var _config = require('../config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}

var getBrowsers = function getBrowsers(r) {return (
    r.map(function (n) {return Object.values(n.protocols['web_driver'].browsers)[0];}).
    map(function (b) {
      var host = Object.keys(b).filter(function (k) {return Array.isArray(b[k]);})[0];
      return {
        type: b.name,
        host: host,
        capabilities: b[host][0].capabilities };

    }));};

var getEmulators = function getEmulators(data) {return (
    getBrowsers(data).
    filter(function (b) {return b.type === 'android';}).
    reduce(function (acc, b) {return (
        acc.concat([].concat(_toConsumableArray(new Array(b.capabilities.maxInstances).keys())).
        map(function (i) {return {
            type: b.type,
            host: b.host,
            udid: b.host.substr(5) + '_' + i + ':5555' };})));},
    []));};

var syncEmulators = function syncEmulators(data, intervalMs) {return new Promise(function (res) {return (
      (0, _nodeFetch2.default)(_config2.default.seleniumUrl + '/grid/admin/Console/', {
        headers: _config2.default.seleniumHeaders }).

      finally(function () {
        setTimeout(function () {return syncEmulators(data, intervalMs);}, intervalMs);
        res();
      }).
      catch(console.warn).
      then(function (r) {return r.json();}).
      then(function (j) {return data.updateEmulators(getEmulators(j.nodes));}));});};exports.default =


syncEmulators;

/*
               {
                 "nodes": [
                   {
                     "protocols": {
                       "web_driver": {
                         "browsers": {
                           "android": {
                             "name": "android",
                             "node-droid722700001J": [ {}, {}, {} ]
                           }
                         }
                       }
                     }
                   }
                 ]
               }
               */
//# sourceMappingURL=syncEmulators.js.map