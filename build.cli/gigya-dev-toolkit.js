'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var GigyaDataservice = require('./dataservices/gigya.dataservice');
var writeFile = require('./helpers/write-file');
var readFile = require('./helpers/read-file');
var jsdiff = require('diff');

var toolkit = function _callee(_ref) {
  var _ref$env = _ref.env,
      env = _ref$env === undefined ? 'us1.gigya.com' : _ref$env,
      userKey = _ref.userKey,
      userSecret = _ref.userSecret,
      task = _ref.task,
      settings = _ref.settings,
      partnerID = _ref.partnerID,
      sourceFile = _ref.sourceFile,
      sourceAPIKey = _ref.sourceAPIKey,
      destinationAPIKeys = _ref.destinationAPIKeys,
      newSiteBaseDomain = _ref.newSiteBaseDomain,
      newSiteDescription = _ref.newSiteDescription,
      newSiteDataCenter = _ref.newSiteDataCenter,
      copyEverything = _ref.copyEverything,
      _ref$acceptAllDefault = _ref.acceptAllDefaults,
      acceptAllDefaults = _ref$acceptAllDefault === undefined ? false : _ref$acceptAllDefault;

  var allPartnerSites, findPartner, partnerSites, sites, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, site, crud, settingsData, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, setting, sourceFileData, choices, def, _def, _def2, _setting, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, destinationAPIKey, _setting2, params, validations, sourceObjs, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _setting3, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _destinationAPIKey, diffs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _setting4, sourceObj, destinationObj, diff, numAdded, numRemoved, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, part, numChanged, isDifferent, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _part, diffLength, halfDiffLength, valueFirstHalf, valueLastHalf;

  return _regenerator2.default.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          crud = function crud(operation, setting) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var method = '' + operation + setting.charAt(0).toUpperCase() + setting.slice(1);
            return GigyaDataservice[method](_.merge({ userKey: userKey, userSecret: userSecret, partnerID: partnerID, copyEverything: copyEverything }, params));
          };

          // Set environment.
          GigyaDataservice.defaultAPIDomain = env;

          // Gigya credentials needed to access API

          if (!(!userKey || !userSecret)) {
            _context.next = 4;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'userKey',
                type: 'input',
                message: 'GIGYA_USER_KEY',
                default: userKey
              }, {
                name: 'userSecret',
                type: 'password',
                message: 'GIGYA_USER_SECRET_KEY',
                default: userSecret
              }]
            }
          });

        case 4:
          _context.next = 6;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret }));

        case 6:
          allPartnerSites = _context.sent;

          if (partnerID) {
            _context.next = 17;
            break;
          }

          if (!(allPartnerSites.length === 1)) {
            _context.next = 12;
            break;
          }

          partnerID = allPartnerSites[0].partnerID;
          _context.next = 17;
          break;

        case 12:
          if (!(allPartnerSites.length <= 10)) {
            _context.next = 16;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerID',
                type: 'list',
                message: 'GIGYA_PARTNER_ID',
                choices: _.map(allPartnerSites, 'partnerID')
              }
            }
          });

        case 16:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerID',
                type: 'input',
                message: 'GIGYA_PARTNER_ID'
              }
            }
          });

        case 17:

          // Fetch all partner sites (not all partners + sites)
          // This also validates the partner ID exists
          // We'll first look for it in the array of all partners + sites we already have to save some time
          findPartner = _.filter(allPartnerSites, { partnerID: partnerID });

          if (!findPartner.length) {
            _context.next = 22;
            break;
          }

          _context.t0 = findPartner;
          _context.next = 25;
          break;

        case 22:
          _context.next = 24;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret, partnerID: partnerID }));

        case 24:
          _context.t0 = _context.sent;

        case 25:
          partnerSites = _context.t0;


          // Used to list sites on partner
          sites = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 30;

          for (_iterator = (0, _getIterator3.default)(partnerSites[0].sites); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            site = _step.value;

            // If the site breaks onto a second line it breaks my console, keep line length sane
            sites.push({
              name: '' + site.baseDomain + (site.description ? ' "' + site.description + '"' : '') + ' ' + site.apiKey,
              value: site.apiKey
            });
          }

          _context.next = 38;
          break;

        case 34:
          _context.prev = 34;
          _context.t1 = _context['catch'](30);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 38:
          _context.prev = 38;
          _context.prev = 39;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 41:
          _context.prev = 41;

          if (!_didIteratorError) {
            _context.next = 44;
            break;
          }

          throw _iteratorError;

        case 44:
          return _context.finish(41);

        case 45:
          return _context.finish(38);

        case 46:
          if (task) {
            _context.next = 48;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'task',
                type: 'list',
                message: 'TASK',
                choices: [{ name: 'EXPORT', value: 'export' }, { name: 'IMPORT', value: 'import' }, { name: 'COPY', value: 'copy' }, { name: 'VALIDATE', value: 'validate' }]
              }
            }
          });

        case 48:
          if (settings) {
            _context.next = 50;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                type: task !== 'import' ? 'checkbox' : 'list', // TODO: Import multiple settings at a time
                name: 'settings',
                message: task !== 'import' ? 'SETTINGS' : 'SETTING',
                choices: [{ name: 'SITE_CONFIG', value: 'siteConfig' }, { name: 'SCREENSETS', value: 'screenSets' }, { name: 'SCHEMA', value: 'schema' }, { name: 'POLICIES', value: 'policies' }, { name: 'LOYALTY_CONFIG', value: 'loyaltyConfig' }]
              }
            }
          });

        case 50:
          settingsData = {};

          if (!(task === 'export' || task === 'copy' || task === 'validate')) {
            _context.next = 81;
            break;
          }

          if (sourceAPIKey) {
            _context.next = 54;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'sourceAPIKey',
                type: 'list',
                message: 'SOURCE_GIGYA_SITE',
                choices: sites
              }
            }
          });

        case 54:

          // Fetch settings from selected key
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 57;
          _iterator2 = (0, _getIterator3.default)(settings);

        case 59:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 67;
            break;
          }

          setting = _step2.value;
          _context.next = 63;
          return _regenerator2.default.awrap(crud('fetch', setting, { apiKey: sourceAPIKey }));

        case 63:
          settingsData[setting] = _context.sent;

        case 64:
          _iteratorNormalCompletion2 = true;
          _context.next = 59;
          break;

        case 67:
          _context.next = 73;
          break;

        case 69:
          _context.prev = 69;
          _context.t2 = _context['catch'](57);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t2;

        case 73:
          _context.prev = 73;
          _context.prev = 74;

          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }

        case 76:
          _context.prev = 76;

          if (!_didIteratorError2) {
            _context.next = 79;
            break;
          }

          throw _iteratorError2;

        case 79:
          return _context.finish(76);

        case 80:
          return _context.finish(73);

        case 81:
          if (!(task === 'import')) {
            _context.next = 90;
            break;
          }

          if (sourceFile) {
            _context.next = 84;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'sourceFile',
                type: 'file',
                message: 'LOAD_FILE'
              }
            }
          });

        case 84:
          _context.t3 = JSON;
          _context.next = 87;
          return _regenerator2.default.awrap(readFile({ file: sourceFile }));

        case 87:
          _context.t4 = _context.sent;
          sourceFileData = _context.t3.parse.call(_context.t3, _context.t4);

          settingsData[settings] = sourceFileData;

        case 90:
          if (!(task === 'import' || task === 'copy' || task === 'validate')) {
            _context.next = 117;
            break;
          }

          if (destinationAPIKeys) {
            _context.next = 95;
            break;
          }

          // Create destination site options
          choices = _.filter(sites, function (site) {
            return site.value !== sourceAPIKey;
          });

          // Add new site option to destination API key if importing site config

          if (task !== 'validate' && settings.indexOf('siteConfig') !== -1) {
            choices.unshift({ name: 'NEW_SITE', value: '_new' });
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'destinationAPIKeys',
                type: 'checkbox',
                message: 'DESTINATION_GIGYA_SITES',
                choices: choices
              }
            }
          });

        case 95:
          if (!(destinationAPIKeys.indexOf('_new') !== -1)) {
            _context.next = 117;
            break;
          }

          if (newSiteBaseDomain) {
            _context.next = 103;
            break;
          }

          def = settingsData['siteConfig'].baseDomain;

          if (!acceptAllDefaults) {
            _context.next = 102;
            break;
          }

          newSiteBaseDomain = def;
          _context.next = 103;
          break;

        case 102:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteBaseDomain',
                type: 'input',
                message: 'NEW_SITE_BASE_DOMAIN',
                default: def
              }]
            }
          });

        case 103:
          if (newSiteDescription) {
            _context.next = 110;
            break;
          }

          _def = settingsData['siteConfig'].description;

          if (!acceptAllDefaults) {
            _context.next = 109;
            break;
          }

          newSiteDescription = _def;
          _context.next = 110;
          break;

        case 109:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDescription',
                type: 'input',
                message: 'NEW_SITE_DESCRIPTION',
                default: sdef
              }]
            }
          });

        case 110:
          if (newSiteDataCenter) {
            _context.next = 117;
            break;
          }

          _def2 = settingsData['siteConfig'].dataCenter;

          if (!acceptAllDefaults) {
            _context.next = 116;
            break;
          }

          newSiteDescription = _def2;
          _context.next = 117;
          break;

        case 116:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDataCenter',
                type: 'input',
                message: 'NEW_SITE_DATA_CENTER',
                default: _def2
              }]
            }
          });

        case 117:
          if (!(task === 'export')) {
            _context.next = 126;
            break;
          }

          _context.t5 = _regenerator2.default.keys(settingsData);

        case 119:
          if ((_context.t6 = _context.t5()).done) {
            _context.next = 125;
            break;
          }

          _setting = _context.t6.value;
          _context.next = 123;
          return _regenerator2.default.awrap(writeFile({
            filePath: _setting + '.' + sourceAPIKey + '.' + new Date().getTime() + '.json',
            data: settingsData[_setting]
          }));

        case 123:
          _context.next = 119;
          break;

        case 125:
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: 'EXPORT_SUCCESSFUL'
            }
          });

        case 126:
          if (!(task === 'copy' || task === 'import')) {
            _context.next = 161;
            break;
          }

          // Push settings from source into destination(s)
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context.prev = 130;
          _iterator3 = (0, _getIterator3.default)(destinationAPIKeys);

        case 132:
          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
            _context.next = 146;
            break;
          }

          destinationAPIKey = _step3.value;
          _context.t7 = _regenerator2.default.keys(settingsData);

        case 135:
          if ((_context.t8 = _context.t7()).done) {
            _context.next = 143;
            break;
          }

          _setting2 = _context.t8.value;

          // Put together params and be sure to clone the settingsData
          params = (0, _defineProperty3.default)({
            apiKey: destinationAPIKey
          }, _setting2, _.assign({}, settingsData[_setting2]));

          // If the destinationAPIKey is new, override specific params

          if (destinationAPIKey === '_new') {
            params['siteConfig'].baseDomain = newSiteBaseDomain;
            params['siteConfig'].description = newSiteDescription;
            params['siteConfig'].dataCenter = newSiteDataCenter;

            // Default to the provided base domain.
            delete params['siteConfig'].trustedSiteURLs;
          }

          // Update via API call
          _context.next = 141;
          return _regenerator2.default.awrap(crud('update', _setting2, params));

        case 141:
          _context.next = 135;
          break;

        case 143:
          _iteratorNormalCompletion3 = true;
          _context.next = 132;
          break;

        case 146:
          _context.next = 152;
          break;

        case 148:
          _context.prev = 148;
          _context.t9 = _context['catch'](130);
          _didIteratorError3 = true;
          _iteratorError3 = _context.t9;

        case 152:
          _context.prev = 152;
          _context.prev = 153;

          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }

        case 155:
          _context.prev = 155;

          if (!_didIteratorError3) {
            _context.next = 158;
            break;
          }

          throw _iteratorError3;

        case 158:
          return _context.finish(155);

        case 159:
          return _context.finish(152);

        case 160:
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: task.toUpperCase() + '_SUCCESSFUL'
            }
          });

        case 161:
          if (!(task === 'validate')) {
            _context.next = 292;
            break;
          }

          validations = [];
          sourceObjs = {};
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          _context.prev = 167;
          _iterator4 = (0, _getIterator3.default)(settings);

        case 169:
          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
            _context.next = 177;
            break;
          }

          _setting3 = _step4.value;
          _context.next = 173;
          return _regenerator2.default.awrap(crud('fetch', _setting3, { apiKey: sourceAPIKey }));

        case 173:
          sourceObjs[_setting3] = _context.sent;

        case 174:
          _iteratorNormalCompletion4 = true;
          _context.next = 169;
          break;

        case 177:
          _context.next = 183;
          break;

        case 179:
          _context.prev = 179;
          _context.t10 = _context['catch'](167);
          _didIteratorError4 = true;
          _iteratorError4 = _context.t10;

        case 183:
          _context.prev = 183;
          _context.prev = 184;

          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }

        case 186:
          _context.prev = 186;

          if (!_didIteratorError4) {
            _context.next = 189;
            break;
          }

          throw _iteratorError4;

        case 189:
          return _context.finish(186);

        case 190:
          return _context.finish(183);

        case 191:
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          _context.prev = 194;
          _iterator5 = (0, _getIterator3.default)(destinationAPIKeys);

        case 196:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            _context.next = 277;
            break;
          }

          _destinationAPIKey = _step5.value;
          diffs = [];
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _iteratorError6 = undefined;
          _context.prev = 202;
          _iterator6 = (0, _getIterator3.default)(settings);

        case 204:
          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
            _context.next = 259;
            break;
          }

          _setting4 = _step6.value;

          // Fetch objects and run jsdiff
          sourceObj = sourceObjs[_setting4];
          _context.next = 209;
          return _regenerator2.default.awrap(crud('fetch', _setting4, { apiKey: _destinationAPIKey }));

        case 209:
          destinationObj = _context.sent;
          diff = jsdiff.diffJson(sourceObj, destinationObj);

          // Calculate stats

          numAdded = 0;
          numRemoved = 0;
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _iteratorError7 = undefined;
          _context.prev = 216;

          for (_iterator7 = (0, _getIterator3.default)(diff); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            part = _step7.value;

            if (part.added) {
              numAdded += part.count;
            } else if (part.removed) {
              numRemoved += part.count;
            }
          }
          _context.next = 224;
          break;

        case 220:
          _context.prev = 220;
          _context.t11 = _context['catch'](216);
          _didIteratorError7 = true;
          _iteratorError7 = _context.t11;

        case 224:
          _context.prev = 224;
          _context.prev = 225;

          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }

        case 227:
          _context.prev = 227;

          if (!_didIteratorError7) {
            _context.next = 230;
            break;
          }

          throw _iteratorError7;

        case 230:
          return _context.finish(227);

        case 231:
          return _context.finish(224);

        case 232:
          numChanged = Math.min(numAdded, numRemoved);

          numRemoved -= numChanged;
          numAdded -= numChanged;
          isDifferent = numAdded || numRemoved || numChanged;

          // Abbreviate diff value if necessary, retains original value, creats new abbrValue index
          // Standardize newlines

          _iteratorNormalCompletion8 = true;
          _didIteratorError8 = false;
          _iteratorError8 = undefined;
          _context.prev = 239;
          for (_iterator8 = (0, _getIterator3.default)(diff); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            _part = _step8.value;

            // Trim newlines at ends so we can ENSURE they exist consistently
            _part.value = _part.value.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\n";

            // Abbr length varies, show less of unchanged text
            diffLength = _part.added || _part.removed ? 1000 : 300;
            halfDiffLength = diffLength / 2;

            // We don't want to show the entire value
            // Limit to X chars -> find next newline -> if newline doesn't exist in X additional chars chop off

            if (_part.value.length > diffLength) {
              // Halve diff
              valueFirstHalf = _part.value.substr(0, halfDiffLength);
              valueLastHalf = _part.value.substr(_part.value.length - halfDiffLength);

              // Look for newline breakpoints

              valueFirstHalf = valueFirstHalf.substr(0, valueFirstHalf.lastIndexOf("\n"));
              valueLastHalf = valueLastHalf.substr(valueLastHalf.indexOf("\n"));

              // Write back to diff
              // Trim newlines at ends so we can ENSURE they exist consistently
              _part.abbrValue = valueFirstHalf.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\r\n...\r\n" + valueLastHalf.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\r\n";
            }
          }

          // This is what we're returning
          _context.next = 247;
          break;

        case 243:
          _context.prev = 243;
          _context.t12 = _context['catch'](239);
          _didIteratorError8 = true;
          _iteratorError8 = _context.t12;

        case 247:
          _context.prev = 247;
          _context.prev = 248;

          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }

        case 250:
          _context.prev = 250;

          if (!_didIteratorError8) {
            _context.next = 253;
            break;
          }

          throw _iteratorError8;

        case 253:
          return _context.finish(250);

        case 254:
          return _context.finish(247);

        case 255:
          diffs.push({
            setting: _setting4,
            diff: diff,
            sourceObj: sourceObj,
            destinationObj: destinationObj,
            isDifferent: isDifferent,
            numAdded: numAdded,
            numRemoved: numRemoved,
            numChanged: numChanged
          });

        case 256:
          _iteratorNormalCompletion6 = true;
          _context.next = 204;
          break;

        case 259:
          _context.next = 265;
          break;

        case 261:
          _context.prev = 261;
          _context.t13 = _context['catch'](202);
          _didIteratorError6 = true;
          _iteratorError6 = _context.t13;

        case 265:
          _context.prev = 265;
          _context.prev = 266;

          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }

        case 268:
          _context.prev = 268;

          if (!_didIteratorError6) {
            _context.next = 271;
            break;
          }

          throw _iteratorError6;

        case 271:
          return _context.finish(268);

        case 272:
          return _context.finish(265);

        case 273:

          validations.push({ diffs: diffs, site: _.find(partnerSites[0].sites, { apiKey: _destinationAPIKey }) });

        case 274:
          _iteratorNormalCompletion5 = true;
          _context.next = 196;
          break;

        case 277:
          _context.next = 283;
          break;

        case 279:
          _context.prev = 279;
          _context.t14 = _context['catch'](194);
          _didIteratorError5 = true;
          _iteratorError5 = _context.t14;

        case 283:
          _context.prev = 283;
          _context.prev = 284;

          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }

        case 286:
          _context.prev = 286;

          if (!_didIteratorError5) {
            _context.next = 289;
            break;
          }

          throw _iteratorError5;

        case 289:
          return _context.finish(286);

        case 290:
          return _context.finish(283);

        case 291:
          return _context.abrupt('return', {
            view: 'validate',
            params: { validations: validations }
          });

        case 292:
          throw new Error('No view rendered.');

        case 293:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this, [[30, 34, 38, 46], [39,, 41, 45], [57, 69, 73, 81], [74,, 76, 80], [130, 148, 152, 160], [153,, 155, 159], [167, 179, 183, 191], [184,, 186, 190], [194, 279, 283, 291], [202, 261, 265, 273], [216, 220, 224, 232], [225,, 227, 231], [239, 243, 247, 255], [248,, 250, 254], [266,, 268, 272], [284,, 286, 290]]);
};

module.exports = toolkit;