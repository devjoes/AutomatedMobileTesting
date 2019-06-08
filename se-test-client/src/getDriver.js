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
        host
    } = await client.getEmulator();
    if (ctx && ctx.test){
        ctx.test.udid = udid;
    }
    const caps = Object.assign({}, config.capabilities, {
        browserVersion: host,
        udid,
        //deviceName: udid
    });
    console.log('Getting driver', caps);
    await driver.init(caps);
    console.log('Got driver');
    driver.client = client;
    driver.udid = udid;
    driver._quit = driver.quit;
    driver.quit = function() {
        this._quit();
        this.client.releaseEmulator(this.udid);
    };
    return driver;
}