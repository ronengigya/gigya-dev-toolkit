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
  var userKey = _ref.userKey,
      userSecret = _ref.userSecret,
      task = _ref.task,
      settings = _ref.settings,
      partnerId = _ref.partnerId,
      sourceFile = _ref.sourceFile,
      sourceApiKey = _ref.sourceApiKey,
      destinationApiKeys = _ref.destinationApiKeys,
      newSiteBaseDomain = _ref.newSiteBaseDomain,
      newSiteDescription = _ref.newSiteDescription,
      newSiteDataCenter = _ref.newSiteDataCenter,
      copyEverything = _ref.copyEverything;

  var allPartnerSites, findPartner, partnerSites, sites, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, site, crud, settingsData, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, setting, sourceFileData, choices, _setting, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, destinationApiKey, _setting2, params, validations, sourceObjs, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _setting3, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _destinationApiKey, diffs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _setting4, sourceObj, destinationObj, diff, numAdded, numRemoved, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, part, numChanged, isDifferent, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _part, diffLength, halfDiffLength, valueFirstHalf, valueLastHalf;

  return _regenerator2.default.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          crud = function crud(operation, setting) {
            var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var method = '' + operation + setting.charAt(0).toUpperCase() + setting.slice(1);
            return GigyaDataservice[method](_.merge({ userKey: userKey, userSecret: userSecret, partnerId: partnerId, copyEverything: copyEverything }, params));
          };

          if (!(!userKey || !userSecret)) {
            _context.next = 3;
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

        case 3:
          _context.next = 5;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret }));

        case 5:
          allPartnerSites = _context.sent;

          if (partnerId) {
            _context.next = 16;
            break;
          }

          if (!(allPartnerSites.length === 1)) {
            _context.next = 11;
            break;
          }

          partnerId = allPartnerSites[0].partnerID;
          _context.next = 16;
          break;

        case 11:
          if (!(allPartnerSites.length <= 10)) {
            _context.next = 15;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerId',
                type: 'list',
                message: 'GIGYA_PARTNER_ID',
                choices: _.map(allPartnerSites, 'partnerID')
              }
            }
          });

        case 15:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerId',
                type: 'input',
                message: 'GIGYA_PARTNER_ID'
              }
            }
          });

        case 16:

          // Fetch all partner sites (not all partners + sites)
          // This also validates the partner ID exists
          // We'll first look for it in the array of all partners + sites we already have to save some time
          findPartner = _.filter(allPartnerSites, { partnerID: partnerId });

          if (!findPartner.length) {
            _context.next = 21;
            break;
          }

          _context.t0 = findPartner;
          _context.next = 24;
          break;

        case 21:
          _context.next = 23;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret, partnerId: partnerId }));

        case 23:
          _context.t0 = _context.sent;

        case 24:
          partnerSites = _context.t0;


          // Used to list sites on partner
          sites = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 29;

          for (_iterator = (0, _getIterator3.default)(partnerSites[0].sites); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            site = _step.value;

            // If the site breaks onto a second line it breaks my console, keep line length sane
            sites.push({
              name: '' + site.baseDomain + (site.description ? ' "' + site.description + '"' : '') + ' ' + site.apiKey,
              value: site.apiKey
            });
          }

          _context.next = 37;
          break;

        case 33:
          _context.prev = 33;
          _context.t1 = _context['catch'](29);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 37:
          _context.prev = 37;
          _context.prev = 38;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 40:
          _context.prev = 40;

          if (!_didIteratorError) {
            _context.next = 43;
            break;
          }

          throw _iteratorError;

        case 43:
          return _context.finish(40);

        case 44:
          return _context.finish(37);

        case 45:
          if (task) {
            _context.next = 47;
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

        case 47:
          if (settings) {
            _context.next = 49;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                type: task !== 'import' ? 'checkbox' : 'list', // TODO: Import multiple settings at a time
                name: 'settings',
                message: task !== 'import' ? 'SETTINGS' : 'SETTING',
                choices: [{ name: 'SITE_CONFIG', value: 'siteConfig' }, { name: 'SCREENSETS', value: 'screensets' }, { name: 'SCHEMA', value: 'schema' }, { name: 'POLICIES', value: 'policies' }, { name: 'LOYALTY_CONFIG', value: 'loyaltyConfig' }]
              }
            }
          });

        case 49:
          settingsData = {};

          if (!(task === 'export' || task === 'copy' || task === 'validate')) {
            _context.next = 80;
            break;
          }

          if (sourceApiKey) {
            _context.next = 53;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'sourceApiKey',
                type: 'list',
                message: 'SOURCE_GIGYA_SITE',
                choices: sites
              }
            }
          });

        case 53:

          // Fetch settings from selected key
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 56;
          _iterator2 = (0, _getIterator3.default)(settings);

        case 58:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 66;
            break;
          }

          setting = _step2.value;
          _context.next = 62;
          return _regenerator2.default.awrap(crud('fetch', setting, { apiKey: sourceApiKey }));

        case 62:
          settingsData[setting] = _context.sent;

        case 63:
          _iteratorNormalCompletion2 = true;
          _context.next = 58;
          break;

        case 66:
          _context.next = 72;
          break;

        case 68:
          _context.prev = 68;
          _context.t2 = _context['catch'](56);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t2;

        case 72:
          _context.prev = 72;
          _context.prev = 73;

          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }

        case 75:
          _context.prev = 75;

          if (!_didIteratorError2) {
            _context.next = 78;
            break;
          }

          throw _iteratorError2;

        case 78:
          return _context.finish(75);

        case 79:
          return _context.finish(72);

        case 80:
          if (!(task === 'import')) {
            _context.next = 89;
            break;
          }

          if (sourceFile) {
            _context.next = 83;
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

        case 83:
          _context.t3 = JSON;
          _context.next = 86;
          return _regenerator2.default.awrap(readFile({ file: sourceFile }));

        case 86:
          _context.t4 = _context.sent;
          sourceFileData = _context.t3.parse.call(_context.t3, _context.t4);

          settingsData[settings] = sourceFileData;

        case 89:
          if (!(task === 'import' || task === 'copy' || task === 'validate')) {
            _context.next = 101;
            break;
          }

          if (destinationApiKeys) {
            _context.next = 94;
            break;
          }

          // Create destination site options
          choices = _.filter(sites, function (site) {
            return site.value !== sourceApiKey;
          });

          // Add new site option to destination API key if importing site config

          if (task !== 'validate' && settings.indexOf('siteConfig') !== -1) {
            choices.unshift({ name: 'NEW_SITE', value: '_new' });
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'destinationApiKeys',
                type: 'checkbox',
                message: 'DESTINATION_GIGYA_SITES',
                choices: choices
              }
            }
          });

        case 94:
          if (!(destinationApiKeys.indexOf('_new') !== -1)) {
            _context.next = 101;
            break;
          }

          if (newSiteBaseDomain) {
            _context.next = 97;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteBaseDomain',
                type: 'input',
                message: 'NEW_SITE_BASE_DOMAIN',
                default: settingsData['siteConfig'].baseDomain
              }]
            }
          });

        case 97:
          if (newSiteDescription) {
            _context.next = 99;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDescription',
                type: 'input',
                message: 'NEW_SITE_DESCRIPTION',
                default: settingsData['siteConfig'].description
              }]
            }
          });

        case 99:
          if (newSiteDataCenter) {
            _context.next = 101;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDataCenter',
                type: 'input',
                message: 'NEW_SITE_DATA_CENTER',
                default: settingsData['siteConfig'].dataCenter
              }]
            }
          });

        case 101:
          if (!(task === 'export')) {
            _context.next = 110;
            break;
          }

          _context.t5 = _regenerator2.default.keys(settingsData);

        case 103:
          if ((_context.t6 = _context.t5()).done) {
            _context.next = 109;
            break;
          }

          _setting = _context.t6.value;
          _context.next = 107;
          return _regenerator2.default.awrap(writeFile({
            filePath: _setting + '.' + sourceApiKey + '.' + new Date().getTime() + '.json',
            data: settingsData[_setting]
          }));

        case 107:
          _context.next = 103;
          break;

        case 109:
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: 'EXPORT_SUCCESSFUL'
            }
          });

        case 110:
          if (!(task === 'copy' || task === 'import')) {
            _context.next = 145;
            break;
          }

          // Push settings from source into destination(s)
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context.prev = 114;
          _iterator3 = (0, _getIterator3.default)(destinationApiKeys);

        case 116:
          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
            _context.next = 130;
            break;
          }

          destinationApiKey = _step3.value;
          _context.t7 = _regenerator2.default.keys(settingsData);

        case 119:
          if ((_context.t8 = _context.t7()).done) {
            _context.next = 127;
            break;
          }

          _setting2 = _context.t8.value;

          // Put together params and be sure to clone the settingsData
          params = (0, _defineProperty3.default)({
            apiKey: destinationApiKey
          }, _setting2, _.assign({}, settingsData[_setting2]));

          // If the destinationApiKey is new, override specific params

          if (destinationApiKey === '_new') {
            params['siteConfig'].baseDomain = newSiteBaseDomain;
            params['siteConfig'].description = newSiteDescription;
            params['siteConfig'].dataCenter = newSiteDataCenter;

            // Default to the provided base domain.
            delete params['siteConfig'].trustedSiteURLs;
          }

          // Update via API call
          _context.next = 125;
          return _regenerator2.default.awrap(crud('update', _setting2, params));

        case 125:
          _context.next = 119;
          break;

        case 127:
          _iteratorNormalCompletion3 = true;
          _context.next = 116;
          break;

        case 130:
          _context.next = 136;
          break;

        case 132:
          _context.prev = 132;
          _context.t9 = _context['catch'](114);
          _didIteratorError3 = true;
          _iteratorError3 = _context.t9;

        case 136:
          _context.prev = 136;
          _context.prev = 137;

          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }

        case 139:
          _context.prev = 139;

          if (!_didIteratorError3) {
            _context.next = 142;
            break;
          }

          throw _iteratorError3;

        case 142:
          return _context.finish(139);

        case 143:
          return _context.finish(136);

        case 144:
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: task.toUpperCase() + '_SUCCESSFUL'
            }
          });

        case 145:
          if (!(task === 'validate')) {
            _context.next = 276;
            break;
          }

          validations = [];
          sourceObjs = {};
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          _context.prev = 151;
          _iterator4 = (0, _getIterator3.default)(settings);

        case 153:
          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
            _context.next = 161;
            break;
          }

          _setting3 = _step4.value;
          _context.next = 157;
          return _regenerator2.default.awrap(crud('fetch', _setting3, { apiKey: sourceApiKey }));

        case 157:
          sourceObjs[_setting3] = _context.sent;

        case 158:
          _iteratorNormalCompletion4 = true;
          _context.next = 153;
          break;

        case 161:
          _context.next = 167;
          break;

        case 163:
          _context.prev = 163;
          _context.t10 = _context['catch'](151);
          _didIteratorError4 = true;
          _iteratorError4 = _context.t10;

        case 167:
          _context.prev = 167;
          _context.prev = 168;

          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }

        case 170:
          _context.prev = 170;

          if (!_didIteratorError4) {
            _context.next = 173;
            break;
          }

          throw _iteratorError4;

        case 173:
          return _context.finish(170);

        case 174:
          return _context.finish(167);

        case 175:
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          _context.prev = 178;
          _iterator5 = (0, _getIterator3.default)(destinationApiKeys);

        case 180:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            _context.next = 261;
            break;
          }

          _destinationApiKey = _step5.value;
          diffs = [];
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _iteratorError6 = undefined;
          _context.prev = 186;
          _iterator6 = (0, _getIterator3.default)(settings);

        case 188:
          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
            _context.next = 243;
            break;
          }

          _setting4 = _step6.value;

          // Fetch objects and run jsdiff
          sourceObj = sourceObjs[_setting4];
          _context.next = 193;
          return _regenerator2.default.awrap(crud('fetch', _setting4, { apiKey: _destinationApiKey }));

        case 193:
          destinationObj = _context.sent;
          diff = jsdiff.diffJson(sourceObj, destinationObj);

          // Calculate stats

          numAdded = 0;
          numRemoved = 0;
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _iteratorError7 = undefined;
          _context.prev = 200;

          for (_iterator7 = (0, _getIterator3.default)(diff); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            part = _step7.value;

            if (part.added) {
              numAdded += part.count;
            } else if (part.removed) {
              numRemoved += part.count;
            }
          }
          _context.next = 208;
          break;

        case 204:
          _context.prev = 204;
          _context.t11 = _context['catch'](200);
          _didIteratorError7 = true;
          _iteratorError7 = _context.t11;

        case 208:
          _context.prev = 208;
          _context.prev = 209;

          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }

        case 211:
          _context.prev = 211;

          if (!_didIteratorError7) {
            _context.next = 214;
            break;
          }

          throw _iteratorError7;

        case 214:
          return _context.finish(211);

        case 215:
          return _context.finish(208);

        case 216:
          numChanged = Math.min(numAdded, numRemoved);

          numRemoved -= numChanged;
          numAdded -= numChanged;
          isDifferent = numAdded || numRemoved || numChanged;

          // Abbreviate diff value if necessary, retains original value, creats new abbrValue index
          // Standardize newlines

          _iteratorNormalCompletion8 = true;
          _didIteratorError8 = false;
          _iteratorError8 = undefined;
          _context.prev = 223;
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
          _context.next = 231;
          break;

        case 227:
          _context.prev = 227;
          _context.t12 = _context['catch'](223);
          _didIteratorError8 = true;
          _iteratorError8 = _context.t12;

        case 231:
          _context.prev = 231;
          _context.prev = 232;

          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }

        case 234:
          _context.prev = 234;

          if (!_didIteratorError8) {
            _context.next = 237;
            break;
          }

          throw _iteratorError8;

        case 237:
          return _context.finish(234);

        case 238:
          return _context.finish(231);

        case 239:
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

        case 240:
          _iteratorNormalCompletion6 = true;
          _context.next = 188;
          break;

        case 243:
          _context.next = 249;
          break;

        case 245:
          _context.prev = 245;
          _context.t13 = _context['catch'](186);
          _didIteratorError6 = true;
          _iteratorError6 = _context.t13;

        case 249:
          _context.prev = 249;
          _context.prev = 250;

          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }

        case 252:
          _context.prev = 252;

          if (!_didIteratorError6) {
            _context.next = 255;
            break;
          }

          throw _iteratorError6;

        case 255:
          return _context.finish(252);

        case 256:
          return _context.finish(249);

        case 257:

          validations.push({ diffs: diffs, site: _.find(partnerSites[0].sites, { apiKey: _destinationApiKey }) });

        case 258:
          _iteratorNormalCompletion5 = true;
          _context.next = 180;
          break;

        case 261:
          _context.next = 267;
          break;

        case 263:
          _context.prev = 263;
          _context.t14 = _context['catch'](178);
          _didIteratorError5 = true;
          _iteratorError5 = _context.t14;

        case 267:
          _context.prev = 267;
          _context.prev = 268;

          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }

        case 270:
          _context.prev = 270;

          if (!_didIteratorError5) {
            _context.next = 273;
            break;
          }

          throw _iteratorError5;

        case 273:
          return _context.finish(270);

        case 274:
          return _context.finish(267);

        case 275:
          return _context.abrupt('return', {
            view: 'validate',
            params: { validations: validations }
          });

        case 276:
          throw new Error('No view rendered.');

        case 277:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this, [[29, 33, 37, 45], [38,, 40, 44], [56, 68, 72, 80], [73,, 75, 79], [114, 132, 136, 144], [137,, 139, 143], [151, 163, 167, 175], [168,, 170, 174], [178, 263, 267, 275], [186, 245, 249, 257], [200, 204, 208, 216], [209,, 211, 215], [223, 227, 231, 239], [232,, 234, 238], [250,, 252, 256], [268,, 270, 274]]);
};

module.exports = toolkit;