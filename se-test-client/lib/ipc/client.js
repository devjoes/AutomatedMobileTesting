'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _nodeIpc = require('node-ipc');var _nodeIpc2 = _interopRequireDefault(_nodeIpc);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

_nodeIpc2.default.config.id = 'testing';
_nodeIpc2.default.config.retry = 1500;
_nodeIpc2.default.config.sync = true;
_nodeIpc2.default.config.silent = true;exports.default =

function (clientId) {return {
        getEmulator: function getEmulator() {return new Promise(function (res) {
                _nodeIpc2.default.connectTo(
                _nodeIpc2.default.config.id,
                function () {
                    _nodeIpc2.default.of.testing.on(
                    'connect',
                    function () {
                        _nodeIpc2.default.of.testing.emit('get_emulator', {
                            clientId: clientId });

                    });
                    _nodeIpc2.default.of.testing.on(
                    'got_emulator_for_' + clientId,
                    function (e) {
                        res(e);
                        _nodeIpc2.default.disconnect(_nodeIpc2.default.config.id);
                    });

                });

            });},
        releaseEmulator: function releaseEmulator(udid) {return new Promise(function (res) {
                _nodeIpc2.default.connectTo(
                _nodeIpc2.default.config.id,
                function () {return _nodeIpc2.default.of.testing.on(
                    'connect',
                    function () {
                        _nodeIpc2.default.of.testing.emit('release_emulator', {
                            udid: udid });

                        res();
                        _nodeIpc2.default.disconnect(_nodeIpc2.default.config.id);
                    });});

            });} };};
//# sourceMappingURL=client.js.map