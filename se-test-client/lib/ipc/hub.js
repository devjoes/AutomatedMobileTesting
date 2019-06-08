'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _nodeIpc = require('node-ipc');var _nodeIpc2 = _interopRequireDefault(_nodeIpc);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


_nodeIpc2.default.config.id = 'testing';
_nodeIpc2.default.config.retry = 1500;
_nodeIpc2.default.config.sync = true;
_nodeIpc2.default.config.silent = true;exports.default =

function (data) {
    _nodeIpc2.default.serve(function () {
        _nodeIpc2.default.server.on('get_emulator', function (r, socket) {
            var tmr = setInterval(function () {
                var em = data.getEmulator();
                if (!em) {
                    return;
                }
                clearInterval(tmr);
                data.incrementQueueLength(em.udid);
                _nodeIpc2.default.server.emit(socket, 'got_emulator_for_' + r.clientId, em);
            });
        });
        _nodeIpc2.default.server.on('release_emulator', function (r) {
            data.decrementQueueLength(r.udid);
        });
    });
    _nodeIpc2.default.server.start();
    console.log('IPC Hub started');
};
//# sourceMappingURL=hub.js.map