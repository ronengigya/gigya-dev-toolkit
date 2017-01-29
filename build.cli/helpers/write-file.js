'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var fs = require('fs');

var browserFilesaver = void 0;
try {
  browserFilesaver = require('browser-filesaver');
} catch (e) {}

function writeFile(_ref) {
  var filePath = _ref.filePath,
      data = _ref.data;

  // Write to file, return promise
  return new _promise2.default(function (resolve, reject) {
    // Stringify object data
    if (_.isObject(data) || _.isArray(data)) {
      data = (0, _stringify2.default)(data, null, 2);
    }

    if (fs && fs.writeFile) {
      // Use node FS to write
      fs.writeFile(process.cwd() + '/' + filePath, data, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      var blob = new Blob([data], { type: 'application/json;charset=utf-8' });
      browserFilesaver.saveAs(blob, filePath);

      // Small delay to bypass Chrome bug with downloading multiple files.
      setTimeout(function () {
        return resolve();
      }, 50);
    }
  });
}

module.exports = writeFile;