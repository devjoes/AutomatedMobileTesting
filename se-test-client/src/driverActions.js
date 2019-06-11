import {
    promiseChainRemote
} from 'wd';
import mlog from 'mocha-logger';
import fs from 'fs';
import config from './config';
import ipcClient from './ipc/client';
import {
    suiteStarted,
    suiteCompleted,
    testStarted,
    testCompleted
} from './metrics';

export const refreshDriver = async ctx => {
    if (!ctx.driver || ctx.erroredInIt) {
        debug('refreshing driver', ctx.test.parent.driver, ctx.erroredInIt)
        if (ctx.test.parent.driver) {
            try {
                await ctx.test.parent.driver.quit(false);
            } catch (_) {}
        }
        ctx.driver = null;
        ctx.erroredInIt = false;
        await getDriver(ctx, false);
    }
};

export const getDriver = async (ctx, record = true) => {
    if (record) {
        const testCount = -1; //TODO: get this
        const rootCtx = getRootContext(ctx);
        rootCtx.started = rootCtx.started || new Date().getTime();
        suiteStarted(getUdId(ctx), getSuiteName(ctx), testCount);
    }
    //setupUtilFuncs(ctx);
    let attempts = 0;
    let totalEmulators = 6; //TODO: get this
    while (!ctx.driver && attempts++ < totalEmulators)
        try {
            debug('Gettting emulator');
            ctx.driver = await getDriverFromNode(ctx);
        } catch (err) {
            if (ctx.driver) {
                // If a test gets retried then before() only runs once, we don't want to use beforeEach() and get a driver for each test
                await ctx.driver.quit(false);
            }
            debug('Failed to get driver - ' + (attempts < totalEmulators ? 'retrying' : 'giving up'));
        }
};

export const releaseDriver = async ctx => {
    if (ctx && ctx.driver) {
        const suite = ctx.test.parent.parent || ctx.test.parent;
        if (suite) {
            const testCount = -1; //TODO: get this
            const rootCtx = getRootContext(ctx);
            const duration = new Date().getTime() - rootCtx.started;
            debug('duration=', duration, new Date().getTime(), rootCtx.started);
            suiteCompleted(getUdId(ctx), suite.title, testCount, duration);
        }
        await ctx.driver.quit();
    }
}

const getDriverFromNode = async ctx => {
    let driver;
    driver = promiseChainRemote(config.seleniumUrl + '/wd/hub');
    driver.clientId = Math.round(Math.random() * 100000);
    let client = await ipcClient(driver.clientId);
    let udid, host
    const em = await client.getEmulator();
    udid = em.udid;
    host = em.host;
    if (ctx) {
        const root = getRootContext(ctx);
        root.udid = udid;
        root.start |= new Date().getTime();
    }
    const caps = Object.assign({}, config.capabilities, {
        browserVersion: host,
        udid,
        //deviceName: udid
    });

    driver.client = client;
    driver.udid = udid;
    driver._quit = driver.quit;
    driver.quit = function () {
        debug('Released driver: ' + this.clientId)
        this._quit();
        this.client.releaseEmulator(this.udid);
    };

    let tmr;
    await Promise.race([
        new Promise((_, rej) => {
            tmr = setTimeout(() => {
                if (driver) {
                    try {
                        driver.quit();
                    } catch (_) {}
                }
                debug('timed out whilst aquiring driver')
                rej();
            }, ((config.maxQueueLength + 1) * config.maxTestDurationSecs * 1000) * 2)
        }),
        new Promise(async (res, rej) => {
            try {
                await driver.init(caps);
            } catch (err) {
                debug(err.message);
                clearTimeout(tmr);
                rej(err);
            }
            clearTimeout(tmr);
            res();
        })
    ]);

    debug('Got driver: ' + driver.clientId);
    return driver;
}

export const testWrapper = async function (ctx, f) {
    const start = new Date().getTime();
    testStarted(getUdId(ctx), getSuiteName(ctx), getTestName(ctx));
    await refreshDriver(ctx);
    try {
        let tmr;
        await Promise.race([
            f(),
            // Sometimes selenium hangs, if we fail a test then it just gets retried so we do this
            new Promise((_, r) => {
                tmr = setTimeout(() => {
                    debug('timed out');
                    r();
                }, config.maxTestDurationSecs * 1000);
            })
        ]);
        tmr && clearTimeout(tmr);
    } catch (err) {
        debug('Error in it()', err && err.message);
        ctx.erroredInIt = true;
        testCompleted(getUdId(ctx), getSuiteName(ctx), getTestName(ctx), new Date().getTime() - start);
        throw err;
    }
    testCompleted(getUdId(ctx), getSuiteName(ctx), getTestName(ctx), new Date().getTime() - start);
};

const getRootContext = ctx => {
    let cur = ctx;
    while (cur.test && cur.test.parent) {
        cur = cur.test.parent;
    }
    return cur;
}

const getUdId = ctx => getRootContext(ctx).udid;
const getSuiteName = ctx => getRootContext(ctx).title;
const getTestName = ctx => (ctx.currentTest || ctx.test).title;

const debug = (...args) => {
    mlog.log(args);
    //fs.appendFileSync('C:\\temp\\log.txt', args.join('\t') + '\n');
}