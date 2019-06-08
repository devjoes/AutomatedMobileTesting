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
    let driver;
    before(async () => {
        try {
            mlog.log('Gettting emulator');
            driver = await getDriver(this.ctx);
        } catch (err) {
            if (driver){
                // If a test gets retried then before() only runs once, we don't want to use beforeEach() and get a driver for each test
                await driver.quit();
                driver = await getDriver(this.ctx);
            }
            mlog.log('Error in appStart.begin', JSON.stringify(err));
            throw err;
        }
    });
    after(async () => {
        if (driver) {
            await driver.quit();
        }
    });
    it('Then the test text should not be visible', async () => {
        try {
            const testText = await driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            expect(testText).to.be.null;
        } catch (err) {
            mlog.log('Error in it', JSON.stringify(err));
            throw err;
        }
    });
});