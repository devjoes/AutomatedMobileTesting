'use strict';var _mocha = require('mocha');



var _chai = require('chai');


var _getDriver = require('../getDriver');var _getDriver2 = _interopRequireDefault(_getDriver);
var _path = require('path');


var _mochaLogger = require('mocha-logger');var _mochaLogger2 = _interopRequireDefault(_mochaLogger);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

(0, _mocha.describe)('When application first starts ' + (0, _path.basename)(__filename), function () {
    var driver = void 0;
    before(async function () {
        try {
            _mochaLogger2.default.log('Gettting emulator');
            driver = await (0, _getDriver2.default)();
        } catch (err) {
            _mochaLogger2.default.log('Error in appStart.begin', JSON.stringify(err));
            throw err;
        }
    });
    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });
    (0, _mocha.it)('Then the test text should not be visible', async function () {
        try {
            var testText = await driver.elementByAccessibilityIdOrNull('MainActivity-TestText');
            (0, _chai.expect)(testText).to.be.null;
        } catch (err) {
            _mochaLogger2.default.log('Error in it', JSON.stringify(err));
            throw err;
        }
    });
});
//# sourceMappingURL=appStart.test.js.map