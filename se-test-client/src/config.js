export default {
    influxdbConfig: {
        host: '40.113.3.66',
        options: {
            path: '/influxdb/write?db=selenium&p=root&precision=n&rp=&u=root',
            port: 80
        },
        database: 'selenium',
    },
    seleniumUrl: 'http://40.113.3.66',
    seleniumHeaders: {
        'Authorization': 'Basic ' + Buffer.from('demo:demo').toString('base64')
    },
    maxQueueLength: 1,
    emulatorUpdateCoolOffMs: 5000,
    maxTestDurationSecs: 60,
    capabilities: {
        'deviceName': 'android',
        'platformName': 'android',
        'platformVersion': '4.2.2',
        'app': '/apps/calc.apk',
        //'app': '/apps/app.apk',
        'browserName': 'android',
        'newSessionWaitTimeout': 30000,
        'waitTimeout': 30000,
        'fullReset': false
    }
}