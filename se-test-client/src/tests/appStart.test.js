import {
    describe,
    it
} from 'mocha';
import {
    expect
} from 'chai';
import getDriver from '../getDriver';
import {
    basename
} from 'path';
import mlog from 'mocha-logger';

describe('When application first starts ' + basename(__filename), function () {
    mlog.log('Describe start');
    let driver, erroredInIt;
    const retrieveDriver = async () => {
        let attempts = 0;
        let totalEmulators = 2; //TODO: get this somehow
        while (!driver && attempts++ < totalEmulators)
            try {
                mlog.log('Gettting emulator');
                driver = await getDriver(this.ctx);
            } catch (err) {
                if (driver) {
                    // If a test gets retried then before() only runs once, we don't want to use beforeEach() and get a driver for each test
                    await driver.quit();
                }
                mlog.log('Failed to get driver - retrying');
                const resp = await getDriver(this.ctx);
                driver = resp.driver;
            }
    };
    beforeEach(async () => {
        mlog.log('before each ', erroredInIt)
        if (!driver || erroredInIt) {
            if (driver) {
                try {
                    await driver.quit();
                } catch (_) {}
            }
            driver = null;
            erroredInIt = false;
            await retrieveDriver();
        }
    });
    before(retrieveDriver);
    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });
    it('Then the test text should not be visible', async () => {
        try {
            const testText = await driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            await new Promise(r => setTimeout(r, 2000));
            expect(testText).to.be.null;
        } catch (err) {
            mlog.log('Error in it', JSON.stringify(err));
            erroredInIt = true;
            throw err;
        }
    });

    it('Then the test text should still not be visible', async () => {
        try {
            const testText = await driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            //await new Promise(r => setTimeout(r, 2000));
            expect(testText).to.be.null;
        } catch (err) {
            mlog.log('Error in it', JSON.stringify(err));
            erroredInIt = true;
            throw err;
        }
    });
});