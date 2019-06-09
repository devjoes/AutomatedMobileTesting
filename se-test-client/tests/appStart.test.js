import {
    describe,
    it
} from 'mocha';
import {
    expect
} from 'chai';
import {getDriver,refreshDriver, innerIt} from '../src/driverActions';
import {
    basename
} from 'path';
import mlog from 'mocha-logger';

describe('When application first starts ' + basename(__filename), function () {
    let ctx;
    before(async () => {
        ctx = this.ctx;
        await getDriver(ctx);
    });
    after(async () => {
        if (ctx.driver) {
            await ctx.driver.quit();
        }
    });
    it('Then the test text should not be visible', async () => {
       await innerIt(ctx, async () =>{ 
            const testText = await ctx.driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            await new Promise(r => setTimeout(r, 2000));
            expect(testText).to.be.null;
       });
    });

    it('Then the test text should still not be visible', async () => {
        await innerIt(ctx, async () =>{ 
            const testText = await ctx.driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            //await new Promise(r => setTimeout(r, 2000));
            expect(testText).to.be.null;
        });
    });
});