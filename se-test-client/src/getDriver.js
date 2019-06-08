import {
    promiseChainRemote
} from 'wd';
import config from './config';
import ipcClient from './ipc/client';

export default async ctx => {
    const driver = promiseChainRemote(config.seleniumUrl + '/wd/hub');
    driver.clientId = Math.round(Math.random() * 100000);
    const client = await ipcClient(driver.clientId);
    const {
        udid,
        host,
        totalEmulators
    } = await client.getEmulator();
    if (ctx && ctx.test){
        ctx.test.udid = udid;
    }
    const caps = Object.assign({}, config.capabilities, {
        browserVersion: host,
        udid,
        //deviceName: udid
    });
    await driver.init(caps);
    driver.client = client;
    driver.udid = udid;
    driver._quit = driver.quit;
    driver.quit = function() {
        console.log('Released driver: ' + this.clientId)
        this._quit();
        this.client.releaseEmulator(this.udid);
    };
    console.log('Got driver: '+ driver.clientId);
    return {driver, totalEmulators};
}