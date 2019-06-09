export default {
    seleniumUrl: 'http://40.113.3.66',
    seleniumHeaders: {
        'Authorization': 'Basic ' + Buffer.from('demo:demo').toString('base64')
    },
    maxQueueLength: 2,
    emulatorUpdateCoolOffMs: 5000,
    maxTestDurationSecs: 60,
    capabilities: {
        'deviceName': 'android',
        'platformName': 'android',
        'platformVersion': '4.2.2',
        'app': '/apps/app.apk',
        'browserName': 'android',
        'newSessionWaitTimeout': 30000,
        'fullReset':false
    }
}