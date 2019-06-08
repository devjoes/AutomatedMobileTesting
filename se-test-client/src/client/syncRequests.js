import fetch from 'node-fetch';
import config from '../config';

const syncRequests = (data, intervalMs) => new Promise(res =>
        fetch(config.seleniumUrl + '/grid/admin/Console/requests', {
            headers: config.seleniumHeaders
        })
        .catch(console.warn)
        .finally(() => setTimeout(() => syncRequests(data, intervalMs), intervalMs))
        .then(r => r.json())
        .then(j => {
            const queueLengths = Object.keys(data.emulators).reduce((acc, i) => {
                acc[i] = 0;
                return acc;
            }, {});
            j['requested_capabilities'].forEach(i => {
                if (queueLengths[i.udid] !== undefined) {
                    queueLengths[i.udid]++;
                }
            });
            //console.log(queueLengths)
            data.updateQueueLengths(queueLengths);
            res();
        }));

export default syncRequests;

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