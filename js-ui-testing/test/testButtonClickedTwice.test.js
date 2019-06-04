// import {  describe,  it} from 'mocha';
// import {  expect} from 'chai';
// import {  getDriver,  releaseDriver, debug} from '../src/providers/webdriver';
// import {basename} from 'path';

// describe('When the test button is clicked twice '+ basename(__filename), function () {
//   let node;
//   before(async () => {
//     node = await getDriver(this.title, {});
//     await node.driver.elementByAccessibilityId('MainActivity-TestButton').click().click();
//   });
//   after(async () => {
//     if (node){
//       await releaseDriver(node.emulator, this.title, node.driver, {});
//     }
//   });
//   it('Then the test text should not be visible', async () => {
//     expect(await node.driver.elementByAccessibilityIdOrNull('MainActivity-TestText')).to.be.null;
//     debug(this.title + 'finished', __filename);
//   })
// });