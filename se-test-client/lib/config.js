'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.default = {
    seleniumUrl: 'http://40.113.3.66',
    seleniumHeaders: {
        'Authorization': 'Basic ' + Buffer.from('demo:demo').toString('base64') },

    maxQueueLength: 2,
    emulatorUpdateCoolOffMs: 5000,
    capabilities: {
        'deviceName': 'android',
        'platformName': 'android',
        'platformVersion': '4.2.2',
        'app': '/apps/app.apk',
        'browserName': 'android',
        'newSessionWaitTimeout': 60000 } };
//# sourceMappingURL=config.js.map