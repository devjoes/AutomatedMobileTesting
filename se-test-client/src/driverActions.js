import {
    promiseChainRemote
} from 'wd';
import mlog from 'mocha-logger';
import config from './config';
import ipcClient from './ipc/client';

export const refreshDriver = async ctx => {
    if (!ctx.test.parent.driver || ctx.test.parent.erroredInIt) {
        mlog.log('refreshing driver', ctx.test.parent.driver, ctx.test.parent.erroredInIt)
        if (ctx.test.parent.driver) {
            try {
                await ctx.test.parent.driver.quit();
            } catch (_) {}
        }
        ctx.test.parent.driver = null;
        ctx.test.parent.erroredInIt = false;
        await getDriver(ctx);
    }
};

export const getDriver = async ctx => {
    setupUtilFuncs(ctx);
    let attempts = 0;
    let totalEmulators = 6; //TODO: get this
    while (!ctx.test.parent.driver && attempts++ < totalEmulators)
        try {
            mlog.log('Gettting emulator');
            ctx.test.parent.driver = await getDriverFromNode(ctx);
        } catch (err) {
            if (ctx.test.parent.driver) {
                // If a test gets retried then before() only runs once, we don't want to use beforeEach() and get a driver for each test
                await driver.quit();
            }
            mlog.log('Failed to get driver - retrying');
            ctx.test.parent.driver = await getDriverFromNode(ctx);
        }
};

const setupUtilFuncs = ctx => {
    if (!ctx.utilsSetup) {
        Object.defineProperty(ctx, 'driver', {
            get: function () {
                return this.test.parent.driver
            }
        });
        ctx.utilsSetup = true;
    }
};

const getDriverFromNode = async ctx => {
    const driver = promiseChainRemote(config.seleniumUrl + '/wd/hub');
    driver.clientId = Math.round(Math.random() * 100000);
    let client = await ipcClient(driver.clientId);
    let udid, host
    const em = await client.getEmulator();
    udid = em.udid;
    host = em.host;
    if (ctx.test) {
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

export const innerIt = async function (ctx, f) {
    await refreshDriver(ctx);
    try {
        let tmr;
        await Promise.race([
            f(),
            // Sometimes selenium hangs, if we fail a test then it just gets retried so we do this
            new Promise((_, r) => {
                tmr = setTimeout(() => {
                    mlog.log('timed out');
                    r();
                }, config.maxTestDurationSecs * 1000);
            })
        ]);
        tmr && clearTimeout(tmr);
    } catch (err) {
        mlog.log('Error in it()', err && err.message);
        ctx.test.parent.erroredInIt = true;
        throw err;
    }
};