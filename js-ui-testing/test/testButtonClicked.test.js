import {  describe,  it} from 'mocha';
import {  expect} from 'chai';
import {  getDriver,  releaseDriver} from '../src/providers/webdriver';

describe('When the test button is clicked', function () {
  let node;
  before(async () => {
    node = await getDriver(this.title, {});
    await node.driver.elementByAccessibilityId('MainActivity-TestButton').click();
  });
  after(async () => {
    await releaseDriver(node.emulator, node.driver, {});
  });
  it('Then the test text should be visible', async () => {
    expect(await node.driver.elementByAccessibilityIdOrNull('MainActivity-TestText')).to.not.be.null;
  })
});