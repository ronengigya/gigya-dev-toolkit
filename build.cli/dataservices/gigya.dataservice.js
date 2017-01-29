'use strict';

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var superagent = require('superagent');
var _ = require('lodash');

var GigyaDataservice = function () {
  function GigyaDataservice() {
    (0, _classCallCheck3.default)(this, GigyaDataservice);
  }

  (0, _createClass3.default)(GigyaDataservice, null, [{
    key: 'fetchPartner',
    value: function fetchPartner(_ref) {
      var userKey = _ref.userKey,
          userSecret = _ref.userSecret,
          partnerId = _ref.partnerId;

      return GigyaDataservice._api({
        endpoint: 'admin.getPartner',
        userKey: userKey,
        userSecret: userSecret,
        params: { partnerID: partnerId },
        isUseCache: true
      });
    }
  }, {
    key: 'fetchUserSites',
    value: function fetchUserSites(_ref2) {
      var userKey = _ref2.userKey,
          userSecret = _ref2.userSecret,
          partnerId = _ref2.partnerId;

      return GigyaDataservice._api({
        endpoint: 'admin.getUserSites',
        userKey: userKey,
        userSecret: userSecret,
        params: { targetPartnerID: partnerId },
        transform: function transform(res) {
          return res.sites;
        },
        isUseCache: true
      });
    }
  }, {
    key: 'fetchSiteConfig',
    value: function fetchSiteConfig(_ref3) {
      var userKey = _ref3.userKey,
          userSecret = _ref3.userSecret,
          apiKey = _ref3.apiKey;
      var siteConfig, providers, restrictions, response, samlLoginConfig, registeredIdPs, samlIdpConfig, registeredSPs;
      return _regenerator2.default.async(function fetchSiteConfig$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'admin.getSiteConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  includeGigyaSettings: true,
                  includeServices: true,
                  includeSiteGroupConfig: true,
                  includeSiteID: false
                },
                transform: function transform(res) {
                  // Normalize for empty values
                  if (res.urlShorteners) {
                    for (var key in res.urlShorteners) {
                      if (!_.size(res.urlShorteners[key])) {
                        delete res.urlShorteners[key];
                      }
                    }
                    if (!_.size(res.urlShorteners)) {
                      delete res.urlShorteners;
                    }
                  }

                  return res;
                }
              }));

            case 2:
              siteConfig = _context.sent;
              _context.next = 5;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'socialize.getProvidersConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  includeCapabilities: true,
                  includeSettings: true
                }
              }));

            case 5:
              providers = _context.sent;

              providers.permissions = providers.settings;
              delete providers.settings;
              _context.next = 10;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'admin.getRestrictions',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  include: 'BlockedIPs,BlockedWords'
                }
              }));

            case 10:
              restrictions = _context.sent;
              response = _.merge(siteConfig, providers);

              // Attempt to add SAML configuration to response.

              _context.prev = 12;
              _context.next = 15;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.getConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey
                }
              }));

            case 15:
              samlLoginConfig = _context.sent;
              _context.next = 18;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.getRegisteredIdPs',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey
                }
              }));

            case 18:
              registeredIdPs = _context.sent;
              _context.next = 21;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.idp.getConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey
                }
              }));

            case 21:
              samlIdpConfig = _context.sent;
              _context.next = 24;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.idp.getRegisteredSPs',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey
                }
              }));

            case 24:
              registeredSPs = _context.sent;

              response.saml = {
                idp: _.assign(samlLoginConfig.config, { registeredIdPs: registeredIdPs.configs }),
                sp: _.assign(samlIdpConfig.config, { registeredSPs: registeredSPs.configs })
              };
              _context.next = 30;
              break;

            case 28:
              _context.prev = 28;
              _context.t0 = _context['catch'](12);

            case 30:

              // We want this at the bottom because the list is annoying.
              _.merge(response, restrictions);

              return _context.abrupt('return', response);

            case 32:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this, [[12, 28]]);
    }
  }, {
    key: 'fetchSchema',
    value: function fetchSchema(_ref4) {
      var userKey = _ref4.userKey,
          userSecret = _ref4.userSecret,
          apiKey = _ref4.apiKey;

      return GigyaDataservice._api({ endpoint: 'accounts.getSchema', userKey: userKey, userSecret: userSecret, params: { apiKey: apiKey }, transform: function transform(schema) {
          // Profile schema has a bunch of things that are read-only
          // We don't save these to the file because they never change
          delete schema.profileSchema.unique;
          delete schema.profileSchema.dynamicSchema;
          for (var fieldName in schema.profileSchema.fields) {
            var field = schema.profileSchema.fields[fieldName];
            delete field.arrayOp;
            delete field.allowNull;
            delete field.type;
            delete field.encrypt;
            delete field.format;
          }

          // Cannot set empty unique field on dataSchema or error
          if (schema.dataSchema.unique && _.isArray(schema.dataSchema.unique) && schema.dataSchema.unique.length === 0) {
            delete schema.dataSchema.unique;
          }

          // Remove fields from dataSchema that do not have a type
          for (var key in schema.dataSchema.fields) {
            var _field = schema.dataSchema.fields[key];
            if (!_field.type) {
              delete schema.dataSchema.fields[key];
            }
          }

          return schema;
        } });
    }
  }, {
    key: 'fetchPolicies',
    value: function fetchPolicies(_ref5) {
      var userKey = _ref5.userKey,
          userSecret = _ref5.userSecret,
          apiKey = _ref5.apiKey;

      return GigyaDataservice._api({ endpoint: 'accounts.getPolicies', userKey: userKey, userSecret: userSecret, params: { apiKey: apiKey } });
    }
  }, {
    key: 'fetchScreensets',
    value: function fetchScreensets(_ref6) {
      var userKey = _ref6.userKey,
          userSecret = _ref6.userSecret,
          apiKey = _ref6.apiKey;

      return GigyaDataservice._api({
        endpoint: 'accounts.getScreenSets',
        userKey: userKey,
        userSecret: userSecret,
        params: {
          apiKey: apiKey,
          include: 'screenSetID,html,css,metadata'
        },
        transform: function transform(res) {
          return res.screenSets;
        }
      });
    }
  }, {
    key: 'updateSiteConfig',
    value: function updateSiteConfig(_ref7) {
      var userKey = _ref7.userKey,
          userSecret = _ref7.userSecret,
          partnerId = _ref7.partnerId,
          apiKey = _ref7.apiKey,
          siteConfig = _ref7.siteConfig,
          _ref7$copyEverything = _ref7.copyEverything,
          copyEverything = _ref7$copyEverything === undefined ? false : _ref7$copyEverything;

      var response, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, idpConfig, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, spConfig;

      return _regenerator2.default.async(function updateSiteConfig$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Clone site configuration because we may modify it
              siteConfig = _.cloneDeep(siteConfig);

              // Check to see if we're trying to create a new site

              if (!(apiKey === '_new')) {
                _context2.next = 7;
                break;
              }

              _context2.next = 4;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'admin.createSite', userKey: userKey, userSecret: userSecret, params: {
                  partnerID: partnerId,
                  baseDomain: siteConfig.baseDomain,
                  description: siteConfig.description,
                  dataCenter: siteConfig.dataCenter
                } }));

            case 4:
              response = _context2.sent;

              apiKey = response.apiKey;

              // We want to clone source config to new key
              copyEverything = true;

            case 7:

              // If the siteConfig is for a child site, the database shouldn't be active
              if (siteConfig.siteGroupOwner) {
                _.set(siteConfig, 'gigyaSettings.dsSize', undefined);
              }

              // These settings are renewed because if a key already exists the basic configuration is typically static
              // You don't want to _clone_ the source key to the destination, you want to copy all settings
              if (copyEverything === false) {
                delete siteConfig.description;
                delete siteConfig.baseDomain;
                delete siteConfig.dataCenter;
                delete siteConfig.trustedSiteURLs;
                delete siteConfig.siteGroupOwner;
                delete siteConfig.logoutURL;
                _.set(siteConfig, 'gigyaSettings.dsSize', undefined);
              }

              // Requires 3 API calls
              _context2.next = 11;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'admin.setSiteConfig', userKey: userKey, userSecret: userSecret, params: {
                  apiKey: apiKey,
                  description: siteConfig.description,
                  gigyaSettings: siteConfig.gigyaSettings,
                  services: siteConfig.services,
                  urlShorteners: siteConfig.urlShorteners,
                  trustedSiteURLs: siteConfig.trustedSiteURLs,
                  trustedShareURLs: siteConfig.trustedShareURLs,
                  logoutURL: siteConfig.logoutURL,
                  siteGroupOwner: siteConfig.siteGroupOwner,
                  settings: siteConfig.settings
                } }));

            case 11:
              _context2.next = 13;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'socialize.setProvidersConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  providers: siteConfig.providers,
                  capabilities: siteConfig.capabilities,
                  settings: siteConfig.permissions
                }
              }));

            case 13:
              _context2.next = 15;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'admin.setRestrictions',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  blockedIps: _.map(siteConfig.blockedIPs, function (IP) {
                    return { IP: IP };
                  }),
                  blockedWords: siteConfig.blockedWords
                }
              }));

            case 15:
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context2.prev = 18;
              _iterator = (0, _getIterator3.default)(_.get(siteConfig, 'saml.idp.registeredIdPs', []));

            case 20:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context2.next = 27;
                break;
              }

              idpConfig = _step.value;
              _context2.next = 24;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.fidm.registerIdP',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  config: idpConfig
                }
              }));

            case 24:
              _iteratorNormalCompletion = true;
              _context2.next = 20;
              break;

            case 27:
              _context2.next = 33;
              break;

            case 29:
              _context2.prev = 29;
              _context2.t0 = _context2['catch'](18);
              _didIteratorError = true;
              _iteratorError = _context2.t0;

            case 33:
              _context2.prev = 33;
              _context2.prev = 34;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 36:
              _context2.prev = 36;

              if (!_didIteratorError) {
                _context2.next = 39;
                break;
              }

              throw _iteratorError;

            case 39:
              return _context2.finish(36);

            case 40:
              return _context2.finish(33);

            case 41:
              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context2.prev = 44;
              _iterator2 = (0, _getIterator3.default)(_.get(siteConfig, 'saml.sp.registeredSPs', []));

            case 46:
              if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                _context2.next = 53;
                break;
              }

              spConfig = _step2.value;
              _context2.next = 50;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.idp.registerSP',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  config: spConfig
                }
              }));

            case 50:
              _iteratorNormalCompletion2 = true;
              _context2.next = 46;
              break;

            case 53:
              _context2.next = 59;
              break;

            case 55:
              _context2.prev = 55;
              _context2.t1 = _context2['catch'](44);
              _didIteratorError2 = true;
              _iteratorError2 = _context2.t1;

            case 59:
              _context2.prev = 59;
              _context2.prev = 60;

              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }

            case 62:
              _context2.prev = 62;

              if (!_didIteratorError2) {
                _context2.next = 65;
                break;
              }

              throw _iteratorError2;

            case 65:
              return _context2.finish(62);

            case 66:
              return _context2.finish(59);

            case 67:
              if (!_.get(siteConfig, 'saml.idp')) {
                _context2.next = 71;
                break;
              }

              delete siteConfig.saml.idp.registeredIdPs;
              _context2.next = 71;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.setConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  config: siteConfig.saml.idp
                }
              }));

            case 71:
              if (!_.get(siteConfig, 'saml.sp')) {
                _context2.next = 75;
                break;
              }

              delete siteConfig.saml.sp.registeredSPs;
              _context2.next = 75;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'fidm.saml.idp.setConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  config: siteConfig.saml.sp
                }
              }));

            case 75:
              return _context2.abrupt('return', { apiKey: apiKey });

            case 76:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this, [[18, 29, 33, 41], [34,, 36, 40], [44, 55, 59, 67], [60,, 62, 66]]);
    }
  }, {
    key: 'fetchLoyaltyConfig',
    value: function fetchLoyaltyConfig(_ref8) {
      var userKey = _ref8.userKey,
          userSecret = _ref8.userSecret,
          apiKey = _ref8.apiKey;
      var globalConfig, actionConfig, challengeConfig, realJson;
      return _regenerator2.default.async(function fetchLoyaltyConfig$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              realJson = function realJson(obj) {
                if (_.isObject(obj)) {
                  for (var key in obj) {
                    if (_.isString(obj[key]) && obj[key].indexOf('{') === 0) {
                      try {
                        obj[key] = JSON.parse(obj[key]);
                      } catch (e) {}
                    } else if (_.isObject(obj[key])) {
                      realJson(obj[key]);
                    }
                  }
                }
              };

              _context3.next = 3;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.setGlobalConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey
                }
              }));

            case 3:
              globalConfig = _context3.sent;
              _context3.next = 6;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.getActionConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  lang: 'all',
                  includeDisabledActions: true
                }
              }));

            case 6:
              actionConfig = _context3.sent;
              _context3.next = 9;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.getChallengeConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  lang: 'all',
                  expandActions: true,
                  includeDisabledChallenges: true,
                  includeDisabledActions: true
                }
              }));

            case 9:
              challengeConfig = _context3.sent;

              realJson(actionConfig);
              realJson(challengeConfig);

              return _context3.abrupt('return', {
                callbackURL: globalConfig.callbackURL,
                allowClientSideActionNotifications: globalConfig.allowClientSideActionNotifications,
                actions: actionConfig.actions,
                challenges: challengeConfig.challenges
              });

            case 13:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'updateLoyaltyConfig',
    value: function updateLoyaltyConfig(_ref9) {
      var userKey = _ref9.userKey,
          userSecret = _ref9.userSecret,
          apiKey = _ref9.apiKey,
          _ref9$loyaltyConfig = _ref9.loyaltyConfig,
          callbackURL = _ref9$loyaltyConfig.callbackURL,
          allowClientSideActionNotifications = _ref9$loyaltyConfig.allowClientSideActionNotifications,
          actions = _ref9$loyaltyConfig.actions,
          challenges = _ref9$loyaltyConfig.challenges;

      var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, action, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, challenge;

      return _regenerator2.default.async(function updateLoyaltyConfig$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.setGlobalConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  callbackURL: callbackURL,
                  allowClientSideActionNotifications: allowClientSideActionNotifications
                }
              }));

            case 2:
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context4.prev = 5;
              _iterator3 = (0, _getIterator3.default)(actions);

            case 7:
              if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                _context4.next = 16;
                break;
              }

              action = _step3.value;

              delete action.source;
              action.apiKey = apiKey;
              _context4.next = 13;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.setActionConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: action
              }));

            case 13:
              _iteratorNormalCompletion3 = true;
              _context4.next = 7;
              break;

            case 16:
              _context4.next = 22;
              break;

            case 18:
              _context4.prev = 18;
              _context4.t0 = _context4['catch'](5);
              _didIteratorError3 = true;
              _iteratorError3 = _context4.t0;

            case 22:
              _context4.prev = 22;
              _context4.prev = 23;

              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }

            case 25:
              _context4.prev = 25;

              if (!_didIteratorError3) {
                _context4.next = 28;
                break;
              }

              throw _iteratorError3;

            case 28:
              return _context4.finish(25);

            case 29:
              return _context4.finish(22);

            case 30:
              _iteratorNormalCompletion4 = true;
              _didIteratorError4 = false;
              _iteratorError4 = undefined;
              _context4.prev = 33;
              _iterator4 = (0, _getIterator3.default)(challenges);

            case 35:
              if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                _context4.next = 43;
                break;
              }

              challenge = _step4.value;

              challenge.apiKey = apiKey;
              _context4.next = 40;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'gm.setChallengeConfig',
                userKey: userKey,
                userSecret: userSecret,
                params: challenge
              }));

            case 40:
              _iteratorNormalCompletion4 = true;
              _context4.next = 35;
              break;

            case 43:
              _context4.next = 49;
              break;

            case 45:
              _context4.prev = 45;
              _context4.t1 = _context4['catch'](33);
              _didIteratorError4 = true;
              _iteratorError4 = _context4.t1;

            case 49:
              _context4.prev = 49;
              _context4.prev = 50;

              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }

            case 52:
              _context4.prev = 52;

              if (!_didIteratorError4) {
                _context4.next = 55;
                break;
              }

              throw _iteratorError4;

            case 55:
              return _context4.finish(52);

            case 56:
              return _context4.finish(49);

            case 57:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[5, 18, 22, 30], [23,, 25, 29], [33, 45, 49, 57], [50,, 52, 56]]);
    }
  }, {
    key: 'updateSchema',
    value: function updateSchema(_ref10) {
      var userKey = _ref10.userKey,
          userSecret = _ref10.userSecret,
          apiKey = _ref10.apiKey,
          schema = _ref10.schema;

      var params, schemaTypes, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, schemaType, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _step6$value, key, _schema;

      return _regenerator2.default.async(function updateSchema$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              params = {
                apiKey: apiKey,
                profileSchema: schema.profileSchema,
                dataSchema: schema.dataSchema
              };
              _context5.prev = 1;
              _context5.next = 4;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey: userKey, userSecret: userSecret, params: params }));

            case 4:
              _context5.next = 61;
              break;

            case 6:
              _context5.prev = 6;
              _context5.t0 = _context5['catch'](1);

              if (!(_context5.t0.code === 400020)) {
                _context5.next = 60;
                break;
              }

              // Target group schema.
              params.scope = 'site';

              // Only send "required" attribute.
              schemaTypes = ['profileSchema', 'dataSchema'];
              _iteratorNormalCompletion5 = true;
              _didIteratorError5 = false;
              _iteratorError5 = undefined;
              _context5.prev = 14;
              _iterator5 = (0, _getIterator3.default)(schemaTypes);

            case 16:
              if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                _context5.next = 42;
                break;
              }

              schemaType = _step5.value;

              delete params[schemaType].dynamicSchema;

              if (!(params[schemaType] && params[schemaType].fields)) {
                _context5.next = 39;
                break;
              }

              _iteratorNormalCompletion6 = true;
              _didIteratorError6 = false;
              _iteratorError6 = undefined;
              _context5.prev = 23;

              for (_iterator6 = (0, _getIterator3.default)((0, _entries2.default)(params[schemaType].fields)); !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                _step6$value = (0, _slicedToArray3.default)(_step6.value, 2), key = _step6$value[0], _schema = _step6$value[1];

                params[schemaType].fields[key] = { required: _schema.required };
              }
              _context5.next = 31;
              break;

            case 27:
              _context5.prev = 27;
              _context5.t1 = _context5['catch'](23);
              _didIteratorError6 = true;
              _iteratorError6 = _context5.t1;

            case 31:
              _context5.prev = 31;
              _context5.prev = 32;

              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }

            case 34:
              _context5.prev = 34;

              if (!_didIteratorError6) {
                _context5.next = 37;
                break;
              }

              throw _iteratorError6;

            case 37:
              return _context5.finish(34);

            case 38:
              return _context5.finish(31);

            case 39:
              _iteratorNormalCompletion5 = true;
              _context5.next = 16;
              break;

            case 42:
              _context5.next = 48;
              break;

            case 44:
              _context5.prev = 44;
              _context5.t2 = _context5['catch'](14);
              _didIteratorError5 = true;
              _iteratorError5 = _context5.t2;

            case 48:
              _context5.prev = 48;
              _context5.prev = 49;

              if (!_iteratorNormalCompletion5 && _iterator5.return) {
                _iterator5.return();
              }

            case 51:
              _context5.prev = 51;

              if (!_didIteratorError5) {
                _context5.next = 54;
                break;
              }

              throw _iteratorError5;

            case 54:
              return _context5.finish(51);

            case 55:
              return _context5.finish(48);

            case 56:
              _context5.next = 58;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey: userKey, userSecret: userSecret, params: params }));

            case 58:
              _context5.next = 61;
              break;

            case 60:
              throw _context5.t0;

            case 61:
            case 'end':
              return _context5.stop();
          }
        }
      }, null, this, [[1, 6], [14, 44, 48, 56], [23, 27, 31, 39], [32,, 34, 38], [49,, 51, 55]]);
    }
  }, {
    key: 'updatePolicies',
    value: function updatePolicies(_ref11) {
      var userKey = _ref11.userKey,
          userSecret = _ref11.userSecret,
          apiKey = _ref11.apiKey,
          policies = _ref11.policies;

      var params, keysToRemove, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, keyToRemove;

      return _regenerator2.default.async(function updatePolicies$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              params = _.extend({}, policies, { apiKey: apiKey });
              _context6.prev = 1;
              _context6.next = 4;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setPolicies', userKey: userKey, userSecret: userSecret, params: params }));

            case 4:
              _context6.next = 34;
              break;

            case 6:
              _context6.prev = 6;
              _context6.t0 = _context6['catch'](1);

              if (!(_context6.t0.code === 400006 && _context6.t0.message.indexOf('Member sites may not override') !== -1)) {
                _context6.next = 33;
                break;
              }

              // Remove group-level policies by parsing error message for keys to remove and try again.
              keysToRemove = _context6.t0.message.substring(_context6.t0.message.indexOf('(') + 1, _context6.t0.message.indexOf(')')).split(',');
              _iteratorNormalCompletion7 = true;
              _didIteratorError7 = false;
              _iteratorError7 = undefined;
              _context6.prev = 13;

              for (_iterator7 = (0, _getIterator3.default)(keysToRemove); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                keyToRemove = _step7.value;

                _.set(params, keyToRemove, undefined);
              }

              // We may need multiple rounds to remove all offending policies.
              _context6.next = 21;
              break;

            case 17:
              _context6.prev = 17;
              _context6.t1 = _context6['catch'](13);
              _didIteratorError7 = true;
              _iteratorError7 = _context6.t1;

            case 21:
              _context6.prev = 21;
              _context6.prev = 22;

              if (!_iteratorNormalCompletion7 && _iterator7.return) {
                _iterator7.return();
              }

            case 24:
              _context6.prev = 24;

              if (!_didIteratorError7) {
                _context6.next = 27;
                break;
              }

              throw _iteratorError7;

            case 27:
              return _context6.finish(24);

            case 28:
              return _context6.finish(21);

            case 29:
              _context6.next = 31;
              return _regenerator2.default.awrap(this.updatePolicies({ userKey: userKey, userSecret: userSecret, apiKey: apiKey, policies: params }));

            case 31:
              _context6.next = 34;
              break;

            case 33:
              throw _context6.t0;

            case 34:
            case 'end':
              return _context6.stop();
          }
        }
      }, null, this, [[1, 6], [13, 17, 21, 29], [22,, 24, 28]]);
    }
  }, {
    key: 'updateScreensets',
    value: function updateScreensets(_ref12) {
      var userKey = _ref12.userKey,
          userSecret = _ref12.userSecret,
          apiKey = _ref12.apiKey,
          screensets = _ref12.screensets;

      var promises = [];
      _.each(screensets, function (_ref13) {
        var screenSetID = _ref13.screenSetID,
            html = _ref13.html,
            css = _ref13.css,
            metadata = _ref13.metadata;

        var params = { apiKey: apiKey, screenSetID: screenSetID, html: html, css: css, metadata: metadata };
        promises.push(GigyaDataservice._api({ endpoint: 'accounts.setScreenSet', userKey: userKey, userSecret: userSecret, params: params }));
      });
      return promises;
    }
  }, {
    key: '_api',
    value: function _api(_ref14) {
      var apiDomain = _ref14.apiDomain,
          endpoint = _ref14.endpoint,
          userKey = _ref14.userKey,
          userSecret = _ref14.userSecret,
          params = _ref14.params,
          transform = _ref14.transform,
          _ref14$isUseCache = _ref14.isUseCache,
          isUseCache = _ref14$isUseCache === undefined ? false : _ref14$isUseCache;

      return new _promise2.default(function (resolve, reject) {
        params = params ? _.cloneDeep(params) : {};
        params.format = 'json';
        params.userKey = userKey;
        params.secret = userSecret;

        // Serialize objects as JSON strings
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = (0, _getIterator3.default)((0, _entries2.default)(params)), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var _step8$value = (0, _slicedToArray3.default)(_step8.value, 2),
                _key = _step8$value[0],
                param = _step8$value[1];

            if (_.isObject(param)) {
              params[_key] = (0, _stringify2.default)(param);
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if (!apiDomain) {
          // Check for data center mapping in cache.
          if (params.apiKey) {
            apiDomain = GigyaDataservice._apiDomainMap.get(params.apiKey);
          }

          // Default to US1 if data center is not set.
          if (!apiDomain) {
            apiDomain = 'us1.gigya.com';
          }
        }

        // Fire request with params
        var namespace = endpoint.substring(0, endpoint.indexOf('.'));
        var url = 'https://' + namespace + '.' + apiDomain + '/' + endpoint;

        //console.log(url + '?' + require('querystring').stringify(params));

        // Create cache key
        var cacheKey = isUseCache ? url + (0, _stringify2.default)(params) : undefined;

        // Check cache and use cached response if we have it
        var body = GigyaDataservice._cacheMap.get(cacheKey);
        if (body && isUseCache) {
          // Clone to avoid object that lives in cache being modified by reference
          return onBody(_.cloneDeep(body));
        }

        // Prefix URL with /proxy/ if in browser
        if (process.browser) {
          // URL is double-encoded to prevent server errors in some environments
          url = 'proxy/' + encodeURIComponent(encodeURIComponent(url));
        }

        // Fire request
        superagent.post(url).type('form').send(params).end(function (err, res) {
          try {
            // Check for network error
            if (err) {
              return reject(err);
            }

            // Parse JSON
            body = JSON.parse(res.text);

            // Parse response.
            onBody(body);
          } catch (e) {
            reject(e);
          }
        });

        function onBody(body) {
          // Check for wrong data center
          if (body.errorCode === 301001 && body.apiDomain) {
            // Try again with correct data center
            return GigyaDataservice._api({
              apiDomain: body.apiDomain,
              endpoint: endpoint,
              userKey: userKey,
              userSecret: userSecret,
              params: params,
              transform: transform
            }).then(resolve, reject);
          }

          // Check for unknown user key or invalid API key, which can signal Russian DC
          if (body.errorCode === 403005 || body.errorCode === 400093) {
            return GigyaDataservice._api({
              apiDomain: 'ru1.gigya.com',
              endpoint: endpoint,
              userKey: userKey,
              userSecret: userSecret,
              params: params,
              transform: transform
            }).then(resolve, reject);
          }

          // Check for Gigya error code
          if (body.errorCode !== 0) {
            var error = new Error(body.errorDetails ? body.errorDetails : body.errorMessage);
            error.code = body.errorCode;
            return reject(error);
          }

          // Cache correct data center
          if (params.apiKey) {
            GigyaDataservice._apiDomainMap.set(params.apiKey, apiDomain);
          }

          // Cache response
          if (isUseCache) {
            // Clone to avoid object that lives in cache being modified by reference after cache
            GigyaDataservice._cacheMap.set(cacheKey, _.cloneDeep(body));
          }

          // Don't return trash
          delete body.callId;
          delete body.errorCode;
          delete body.statusCode;
          delete body.statusReason;
          delete body.time;

          // Transform response if necessary
          if (transform) {
            body = transform(body);
          }

          // Gigya response OK
          return resolve(body);
        }
      });
    }
  }]);
  return GigyaDataservice;
}();

GigyaDataservice._cacheMap = new _map2.default();
GigyaDataservice._apiDomainMap = new _map2.default();


module.exports = GigyaDataservice;