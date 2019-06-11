import {
    describe,
    it
} from 'mocha';
import {
    expect
} from 'chai';
import {
    getDriver,
    testWrapper,
    releaseDriver
} from '../src/driverActions';
import {
    pressButtons,
    plus,
    minus,
    times,
    divide,
    equals,
    clear,
    point,
    divideChar,
    multiplyChar,
    multiply,
    pointChar
} from './utils';

describe('Basic calculator tests', async function () {
    let ctx;
    before(async () => {
        ctx = this.ctx;
        await getDriver(ctx);
    });
    after(async () => await releaseDriver(ctx));

    it('When a number is clicked it shows on the display', async () => {
        const numClicked = '1';
        let sum;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, 1);
            sum = await ctx.driver.elementByAccessibilityId('sum').text()
        });
        expect(sum).to.equal(numClicked);
    });

    
    it('When 123.4...5 is entered it displays 123.45', async () => {
        let sum;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, clear, 1, 2, 3, point, 4, point, point, point, 5);
            sum = await ctx.driver.elementByAccessibilityId('sum').text();
            await pressButtons(ctx.driver, clear);
        });
        sum.to.equal(`123${pointChar}45`);
    });

    it(`When -2 ${multiplyChar} ${multiplyChar} 2 ${divideChar} ${divideChar} is entered it is displayed and equals -4`, async () => {
        let sum, result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, minus, 2, multiply, multiply, 2, divide, divide);
            sum = await ctx.driver.elementByAccessibilityId('sum').text();
            await pressButtons(ctx.driver, equals);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(sum).to.equal(`-2 ${multiplyChar} 2 ${divideChar} `);
        expect(result).to.equal('-4');
    });

    it('When 2 + 3 is entered it displays and equals 5', async () => {
        let sum, result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, '2', plus, '3');
            sum = await ctx.driver.elementByAccessibilityId('sum').text()
            await pressButtons(ctx.driver, equals);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(sum).to.equal('2 + 3');
        expect(result).to.equal('5');
    });

    it('When 5 * -5 is entered it displays and equals -25', async () => {
        let sum, result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, '5', multiply, minus, '5');
            sum = await ctx.driver.elementByAccessibilityId('sum').text();
            await pressButtons(ctx.driver, equals);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(sum).to.equal(`5 ${multiplyChar} -5`);
        expect(result).to.equal('-25');
    });

    it('When a sum is cleared it displays 0', async () => {
        let sum;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, '2', plus, '3');
            await pressButtons(ctx.driver, clear);
            sum = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(sum).to.equal('0');
    });

    it('When a result is cleared it displays 0', async () => {
        let result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, '2', plus, '3', equals);
            await pressButtons(ctx.driver, clear);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(result).to.equal('0');
    });

    it('When a result is shown pressing a number clears it', async () => {
        let result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, clear, '2', minus, '3', equals);
            await pressButtons(ctx.driver, 1);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(result).to.equal('1');
    });
    it('When a result is shown arithmatic is appended to it', async () => {
        let result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, clear, '2', minus, '3', equals);
            await pressButtons(ctx.driver, multiply);
            result = await ctx.driver.elementByAccessibilityId('sum').text();
        });
        expect(result).to.equal(`-1 ${multiplyChar} `);
    });

    it(`When 0 ${divideChar} 0 is entered it is displays and equals NaN`, async () => {
        let sum, result;
        await testWrapper(ctx, async () => {
            await pressButtons(ctx.driver, '0', divide, '0');
            sum = await ctx.driver.elementByAccessibilityId('sum').text();
            await pressButtons(ctx.driver, equals);
            result = await ctx.driver.elementByAccessibilityId('sum').text();

        });
        expect(sum).to.equal(`0 ${divideChar} 0`);
        expect(result).to.equal('NaN');
    });
});