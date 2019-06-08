'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _config = require('./config');var _config2 = _interopRequireDefault(_config);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}exports.default =

function () {return {
        emulators: {},
        getEmulator: function getEmulator() {
            var availableEms = Object.values(this.emulators).
            filter(function (e) {return e.readyBy < new Date().getTime() && e.queueLength < _config2.default.maxQueueLength;});
            return availableEms.length ?
            availableEms[Math.round(Math.random() * 1000) % availableEms.length] :
            null;
        },
        incrementQueueLength: function incrementQueueLength(udid) {
            this.emulators[udid].queueLength++;
            // Before we inform selenium syncRequests might run and reset this value
            this.emulators[udid].readyBy = new Date().getTime() + _config2.default.emulatorUpdateCoolOffMs;
        },
        decrementQueueLength: function decrementQueueLength(udid) {
            this.emulators[udid].queueLength--;
        },
        updateEmulators: function updateEmulators(newEmulators) {var _this = this;
            this.emulators = newEmulators.
            reduce(function (acc, em) {
                var oldEmulator = (_this.emulators || {})[em.udid];
                acc[em.udid] = Object.assign({}, em, {
                    // If the emulator is new then let it warm up
                    readyBy: oldEmulator && oldEmulator.readyBy || new Date().getTime() + _config2.default.emulatorUpdateCoolOffMs,
                    queueLength: oldEmulator && oldEmulator.queueLength || 0 });

                return acc;
            }, {});
        },
        updateQueueLengths: function updateQueueLengths(queueLengths) {var _this2 = this;
            Object.keys(this.emulators).forEach(function (k) {
                _this2.emulators[k].queueLength = queueLengths[k] || 0;
                // Reset readyBy, set in incrementQueueLength
                _this2.emulators[k].readyBy = new Date().getTime();
            });
        } };};
//# sourceMappingURL=emulatorData.js.map