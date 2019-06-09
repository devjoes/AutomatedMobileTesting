import {
    promiseChainRemote
} from 'wd';
import config from './config';
import ipcClient from './ipc/client';

export default async ctx => {
    const driver = promiseChainRemote(config.seleniumUrl + '/wd/hub');
    driver.clientId = Math.round(Math.random() * 100000);
    let client = await ipcClient(driver.clientId);
    let udid, host
    try {
        const em = await client.getEmulator();
        udid = em.udid;
        host = em.host;
    } catch (e) {
        client = await ipcClient(driver.clientId);
        const em = await client.getEmulator();
        udid = em.udid;
        host = em.host;
    }
    if (ctx && ctx.test) {
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
    driver.quit = function () {
        console.log('Released driver: ' + this.clientId)
        this._quit();
        this.client.releaseEmulator(this.udid);
    };
    console.log('Got driver: ' + driver.clientId);
    return driver;
}