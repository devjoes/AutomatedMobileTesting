// import {
//     describe,
//     it
// } from 'mocha';
// import {
//     expect
// } from 'chai';
// import {
//     getDriver
// } from '../src/providers/webdriver';
// import {
//     pressButtons,
//     plus,
//     minus,
//     times,
//     divide,
//     equals,
//     clear,
//     point,
//     divideChar,
//     multiplyChar,
//     multiply,
//     pointChar
// } from '../src/utils';

// describe('Basic calculator tests', async function () {
//     let ctx;
//     before(async () => {
//         ctx = this.ctx;
//         await getDriver(ctx);
//     });
//     after(async () => {
//         if (ctx.driver) {
//             await ctx.driver.quit();
//         }
//     });
//     describe('When a number is clicked', async () => {
//         await refreshDriver(ctx);
//         const numClicked = '1';
//         it('It shows on the display', async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(numClicked);
//         });
//     });

//     describe('When 123.4...5 is entered', () => {
//         await refreshDriver(ctx);
//         const result = `123${pointChar}45`;
//         it('It displays ' + result, async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(result);
//         });
//     });

//     describe(`When -2 ${multiplyChar} ${multiplyChar} 2 ${divideChar} ${divideChar} is entered`, () => {
//         await refreshDriver(ctx);
//         const sum = `-2 ${multiplyChar} 2 ${divideChar} `;
//         it('It displays ' + sum, async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(sum);
//         });

//         it('Which equals -4', async () => {
//             await pressButtons(ctx.driver, equals);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('-4');
//         });
//     });

//     describe('When 2 + 3 is entered', () => {
//         await refreshDriver(ctx);
//         const sum = `2 + 3`
//         it('It displays ' + sum, async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(sum);
//         });

//         it('Which equals 5', async () => {
//             await pressButtons(ctx.driver, equals);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('5');
//         });
//     });

//     describe('When 5 * -5 is entered', () => {
//         await refreshDriver(ctx);
//         const sum = `5 ${multiplyChar} -5`;
//         it('It displays ' + sum, async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(sum);
//         });
//         it('Which equals -25', async () => {
//             await pressButtons(ctx.driver, equals);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('-25');
//         });
//     });

//     describe('When a sum is cleared', () => {
//         await refreshDriver(ctx);
//         it('It displays 0', async () => {
//             await pressButtons(ctx.driver, clear);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('0');
//         });
//     });

//     describe('When a result is cleared', () => {
//         await refreshDriver(ctx);
//         it('It displays 0', async () => {
//             await pressButtons(ctx.driver, clear);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('0');
//         });
//     });

//     describe('When a result is shown', () => {
//         await refreshDriver(ctx);
//         beforeEach(async () => {
//             await pressButtons(ctx.driver, clear, '2', minus, '3', equals);
//         });
//         it('Pressing a number clears it', async () => {
//             await pressButtons(ctx.driver, 1);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('1');
//         });
//         it('Arithmatic is appended to it', async () => {
//             await pressButtons(ctx.driver, multiply);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(`-1 ${multiplyChar} `);
//         });
//     });

//     describe(`When 0 ${divideChar} 0 is entered`, () => {
//         await refreshDriver(ctx);
//         const sum = `0 ${divideChar} 0`;
//         it('It displays ' + sum, async () => {
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal(sum);
//         });

//         it('Which equals NaN', async () => {
//             await pressButtons(ctx.driver, equals);
//             expect(await ctx.driver.elementByAccessibilityId('sum').text())
//                 .to.equal('NaN');
//         });
//     });
// });