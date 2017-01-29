'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var state = require('commander');
var _ = require('lodash');
var colors = require('colors');
var inquirer = require('inquirer');
var toolkit = require('./gigya-dev-toolkit.js');
var t = require('../src/translations/en.json');
var fs = require('fs');

// Command-line arguments
state.option('--userKey [value]', t.GIGYA_USER_KEY).option('--userSecret [value]', t.GIGYA_USER_SECRET_KEY).option('--task [value]', t.TASK).option('--settings [value]', t.SETTINGS).option('--partnerId [value]', t.GIGYA_PARTNER_ID).option('--sourceApiKey [value]', t.SOURCE_GIGYA_SITE).option('--sourceFile [value]', t.SETTINGS_FILE).option('--destinationApiKeys [value]', t.DESTINATION_GIGYA_SITES).option('--newSiteBaseDomain [value]', t.NEW_SITE_BASE_DOMAIN).option('--newSiteDescription [value]', t.NEW_SITE_DESCRIPTION).option('--newSiteDataCenter [value]', t.NEW_SITE_DATA_CENTER).option('--copyEverything', t.COPY_EVERYTHING).parse(process.argv);

// Convert strings to arrays when necessary
if (_.isString(state.settings) && state.task !== 'import') {
  state.settings = state.settings.split(',');
}
if (_.isString(state.destinationApiKeys)) {
  state.destinationApiKeys = state.destinationApiKeys.split(',');
}

function prompt(_ref) {
  var questions = _ref.questions;

  // Ensure array is passed, even for only 1 question
  if (!_.isArray(questions)) {
    questions = [questions];
  }

  // Mild transformation
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = (0, _getIterator3.default)(questions), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var question = _step.value;

      // For type = "file", we want to list only files in the current working directory
      if (question.type === 'file') {
        question.type = 'list';

        // Get list of files in current working directory
        question.choices = fs.readdirSync(process.cwd());

        // Only list .json files
        question.choices = _.filter(question.choices, function (file) {
          return file.endsWith('.json');
        });
      }

      // Localize
      if (t[question.message]) {
        question.message = t[question.message];
      }
      if (t[question.default]) {
        question.default = t[question.default];
      }

      // Typecast all choices as string (crashes otherwise)
      if (question.choices) {
        for (var key in question.choices) {
          var value = question.choices[key];

          // Convert shorthand string to object format
          if (!_.isObject(value)) {
            question.choices[key] = value = { name: value, value: value };
          }

          // Choice can be { name, value }
          // Typecast only name, which must be string
          if (!_.isString(value.name)) {
            value.name = value.name + '';
          }

          // Localize if necessary
          if (t[value.name]) {
            value.name = t[value.name];
          }

          // Command line bugs out if the value name > console width
          if (value.name.length > 93) {
            value.name = value.name.substr(0, 90) + '...';
          }
        }
      }
    }

    // Wrap in promise for await
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return new _promise2.default(function (resolve, reject) {
    inquirer.prompt(questions, function (res) {
      _.each(questions, function (question) {
        if (res[question.name] === '' || _.isArray(res[question.name]) && res[question.name].length === 0) {
          res[question.name] = undefined;
        }
      });

      _.merge(state, res);
      resolve();
    });
  });
}

function validate(_ref2) {
  var validations = _ref2.validations;

  _.each(validations, function (_ref3) {
    var diffs = _ref3.diffs,
        site = _ref3.site;

    console.log(('' + site.baseDomain).bold.underline);
    console.log('' + site.description);
    console.log('' + site.apiKey);
    console.log('');

    _.each(diffs, function (_ref4) {
      var setting = _ref4.setting,
          diff = _ref4.diff,
          sourceObj = _ref4.sourceObj,
          destinationObj = _ref4.destinationObj,
          isDifferent = _ref4.isDifferent,
          numAdded = _ref4.numAdded,
          numRemoved = _ref4.numRemoved,
          numChanged = _ref4.numChanged;

      console.log((t[setting.toUpperCase()] + ':').bold.underline);
      if (!isDifferent) {
        console.log(t.VALIDATION_PASSED.green);
      } else {
        if (numChanged) {
          console.log((t.CHANGED + ' ' + numChanged + ' ' + (numChanged > 1 ? t.VALUES : t.VALUE)).bold.yellow);
        }
        if (numRemoved) {
          console.log((t.REMOVED + ' ' + numRemoved + ' ' + (numRemoved > 1 ? t.VALUES : t.VALUE)).bold.red);
        }
        if (numAdded) {
          console.log((t.ADDED + ' ' + numAdded + ' ' + (numAdded > 1 ? t.VALUES : t.VALUE)).bold.green);
        }
        console.log('');

        // Print visual diff
        diff.forEach(function (part) {
          // Part type determines color
          var color = part.added ? 'green' : part.removed ? 'red' : 'grey';

          // Append text to pre
          process.stderr.write((part.abbrValue ? part.abbrValue : part.value)[color]);
        });
      }

      console.log('');
      console.log('');
    });
  });

  state.finished = true;
}

function info(_ref5) {
  var message = _ref5.message;

  console.log('');
  console.log(t[message].bold);
  state.finished = true;
}

function main() {
  var _this = this;

  if (!state.finished) {
    // Call toolkit with complete state
    toolkit(state).then(function _callee(res) {
      return _regenerator2.default.async(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = res.view;
              _context.next = _context.t0 === 'prompt' ? 3 : _context.t0 === 'info' ? 6 : _context.t0 === 'validate' ? 8 : 10;
              break;

            case 3:
              _context.next = 5;
              return _regenerator2.default.awrap(prompt(res.params));

            case 5:
              return _context.abrupt('break', 10);

            case 6:
              info(res.params);
              return _context.abrupt('break', 10);

            case 8:
              validate(res.params);
              return _context.abrupt('break', 10);

            case 10:

              main();

            case 11:
            case 'end':
              return _context.stop();
          }
        }
      }, null, _this);
    }, function (err) {
      if (err.message) {
        // User-friendly message, probably an expected error
        console.error(err.message.white.bgRed);
        console.error(err.stack);
      } else {
        // Unexpected error
        console.error(t.UNRECOVERABLE_ERROR.white.bgRed);
        if (err.stack) {
          console.error(err.stack);
        } else {
          console.error(err);
        }
      }

      state.finished = true;
      main();
    });
  }

  if (state.finished) {
    // Provide easy way to run this command again:
    var consoleCommand = 'gigya-dev-toolkit';

    // Loop through each possible command
    _.each(state.options, function (opt) {
      // If value for command exists in state
      if (state[opt.long.substr(2)]) {
        // Get value for this command
        var value = state[opt.long.substr(2)];

        // Convert arrays to strings
        if (_.isArray(value)) {
          value = value.join(',');
        }

        // Add command value to output
        consoleCommand += ' ' + opt.long + ' "' + value + '"';
      }
    });

    // Print full command
    console.log('');
    console.log((t.TO_RUN_THIS_COMMAND_AGAIN + ':').dim);
    console.log(consoleCommand.dim);
  }
}
main();