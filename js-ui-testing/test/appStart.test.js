import {
  describe,
  it
} from 'mocha';
import {
  expect
} from 'chai';
import {
  getDriver,
  releaseDriver,
  debug
} from '../src/providers/webdriver';
import {
  basename
} from 'path';

describe('When application first starts ' + basename(__filename), function () {
  let node;
  before(async () => {
    try {
      debug('Gettting emulator');
      node = await getDriver(this.title, {});
      debug('Got emulator ' + node.emulator);
    } catch (err) {
      debug('Error in appStart.begin', JSON.stringify(err));
      throw err;
    }
  });
  after(async () => {
    if (node) {
      await releaseDriver(node.emulator, this.title, node.driver, {});
    }
  });
  it('Then the test text should not be visible', async () => {
    try {
      const testText = await node.driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
      expect(testText).to.be.null;
    } catch (err) {
      debug('Error in it', JSON.stringify(err));
      throw err;
    }
  });
});