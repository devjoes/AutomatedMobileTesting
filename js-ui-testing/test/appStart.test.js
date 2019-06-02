import {  describe,  it} from 'mocha';
import {  expect} from 'chai';
import {  getDriver,  releaseDriver} from '../src/providers/webdriver';

describe('When application first starts', function () {
  let node;
  before(async () => {
    node = await getDriver(this.title, {});
  });
  after(async () => {
    await releaseDriver(node.emulator, node.driver, {});
  });
  it('Then the test text should not be visible', async () => {
    expect(await node.driver.elementByAccessibilityIdOrNull('MainActivity-TestText')).to.be.null;
  });
});