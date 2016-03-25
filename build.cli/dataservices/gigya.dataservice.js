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
      var userKey = _ref.userKey;
      var userSecret = _ref.userSecret;
      var partnerId = _ref.partnerId;

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
      var userKey = _ref2.userKey;
      var userSecret = _ref2.userSecret;
      var partnerId = _ref2.partnerId;

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
      var userKey = _ref3.userKey;
      var userSecret = _ref3.userSecret;
      var apiKey = _ref3.apiKey;
      var siteConfig, providers, restrictions;
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
              _context.next = 8;
              return _regenerator2.default.awrap(GigyaDataservice._api({
                endpoint: 'admin.getRestrictions',
                userKey: userKey,
                userSecret: userSecret,
                params: {
                  apiKey: apiKey,
                  include: 'BlockedIPs,BlockedWords'
                }
              }));

            case 8:
              restrictions = _context.sent;
              return _context.abrupt('return', _.merge(siteConfig, restrictions, providers));

            case 10:
            case 'end':
              return _context.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'fetchSchema',
    value: function fetchSchema(_ref4) {
      var userKey = _ref4.userKey;
      var userSecret = _ref4.userSecret;
      var apiKey = _ref4.apiKey;

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
      var userKey = _ref5.userKey;
      var userSecret = _ref5.userSecret;
      var apiKey = _ref5.apiKey;

      return GigyaDataservice._api({ endpoint: 'accounts.getPolicies', userKey: userKey, userSecret: userSecret, params: { apiKey: apiKey } });
    }
  }, {
    key: 'fetchScreensets',
    value: function fetchScreensets(_ref6) {
      var userKey = _ref6.userKey;
      var userSecret = _ref6.userSecret;
      var apiKey = _ref6.apiKey;

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
      var userKey = _ref7.userKey;
      var userSecret = _ref7.userSecret;
      var partnerId = _ref7.partnerId;
      var apiKey = _ref7.apiKey;
      var siteConfig = _ref7.siteConfig;
      var _ref7$copyEverything = _ref7.copyEverything;
      var copyEverything = _ref7$copyEverything === undefined ? true : _ref7$copyEverything;
      var response;
      return _regenerator2.default.async(function updateSiteConfig$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              // Clone site configuration because we may modify it
              siteConfig = _.cloneDeep(siteConfig);

              // Check to see if we're trying to create a new site

              if (!(apiKey === 'new')) {
                _context2.next = 8;
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

              // If the siteConfig is for a child site, the database shouldn't be active
              if (siteConfig.siteGroupOwner) {
                _.set(siteConfig, 'gigyaSettings.dsSize', undefined);
              }

            case 8:

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
                  gigyaSettings: siteConfig.gigyaSettings,
                  services: siteConfig.services,
                  urlShorteners: siteConfig.urlShorteners,
                  trustedSiteURLs: siteConfig.trustedSiteURLs,
                  trustedShareURLs: siteConfig.trustedShareURLs,
                  logoutURL: siteConfig.logoutURL,
                  siteGroupOwner: siteConfig.siteGroupOwner
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
                  settings: siteConfig.settings
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
              return _context2.abrupt('return', { apiKey: apiKey });

            case 16:
            case 'end':
              return _context2.stop();
          }
        }
      }, null, this);
    }
  }, {
    key: 'updateSchema',
    value: function updateSchema(_ref8) {
      var userKey = _ref8.userKey;
      var userSecret = _ref8.userSecret;
      var apiKey = _ref8.apiKey;
      var schema = _ref8.schema;

      var params, schemaTypes, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, schemaType, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _step2$value, key, _schema;

      return _regenerator2.default.async(function updateSchema$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              params = {
                apiKey: apiKey,
                profileSchema: schema.profileSchema,
                dataSchema: schema.dataSchema
              };
              _context3.prev = 1;
              _context3.next = 4;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey: userKey, userSecret: userSecret, params: params }));

            case 4:
              _context3.next = 61;
              break;

            case 6:
              _context3.prev = 6;
              _context3.t0 = _context3['catch'](1);

              if (!(_context3.t0.code === 400020)) {
                _context3.next = 60;
                break;
              }

              // Target group schema.
              params.scope = 'site';

              // Only send "required" attribute.
              schemaTypes = ['profileSchema', 'dataSchema'];
              _iteratorNormalCompletion = true;
              _didIteratorError = false;
              _iteratorError = undefined;
              _context3.prev = 14;
              _iterator = (0, _getIterator3.default)(schemaTypes);

            case 16:
              if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                _context3.next = 42;
                break;
              }

              schemaType = _step.value;

              delete params[schemaType].dynamicSchema;

              if (!(params[schemaType] && params[schemaType].fields)) {
                _context3.next = 39;
                break;
              }

              _iteratorNormalCompletion2 = true;
              _didIteratorError2 = false;
              _iteratorError2 = undefined;
              _context3.prev = 23;

              for (_iterator2 = (0, _getIterator3.default)((0, _entries2.default)(params[schemaType].fields)); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                _step2$value = (0, _slicedToArray3.default)(_step2.value, 2);
                key = _step2$value[0];
                _schema = _step2$value[1];

                params[schemaType].fields[key] = { required: _schema.required };
              }
              _context3.next = 31;
              break;

            case 27:
              _context3.prev = 27;
              _context3.t1 = _context3['catch'](23);
              _didIteratorError2 = true;
              _iteratorError2 = _context3.t1;

            case 31:
              _context3.prev = 31;
              _context3.prev = 32;

              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }

            case 34:
              _context3.prev = 34;

              if (!_didIteratorError2) {
                _context3.next = 37;
                break;
              }

              throw _iteratorError2;

            case 37:
              return _context3.finish(34);

            case 38:
              return _context3.finish(31);

            case 39:
              _iteratorNormalCompletion = true;
              _context3.next = 16;
              break;

            case 42:
              _context3.next = 48;
              break;

            case 44:
              _context3.prev = 44;
              _context3.t2 = _context3['catch'](14);
              _didIteratorError = true;
              _iteratorError = _context3.t2;

            case 48:
              _context3.prev = 48;
              _context3.prev = 49;

              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }

            case 51:
              _context3.prev = 51;

              if (!_didIteratorError) {
                _context3.next = 54;
                break;
              }

              throw _iteratorError;

            case 54:
              return _context3.finish(51);

            case 55:
              return _context3.finish(48);

            case 56:
              _context3.next = 58;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey: userKey, userSecret: userSecret, params: params }));

            case 58:
              _context3.next = 61;
              break;

            case 60:
              throw _context3.t0;

            case 61:
            case 'end':
              return _context3.stop();
          }
        }
      }, null, this, [[1, 6], [14, 44, 48, 56], [23, 27, 31, 39], [32,, 34, 38], [49,, 51, 55]]);
    }
  }, {
    key: 'updatePolicies',
    value: function updatePolicies(_ref9) {
      var userKey = _ref9.userKey;
      var userSecret = _ref9.userSecret;
      var apiKey = _ref9.apiKey;
      var policies = _ref9.policies;

      var params, keysToRemove, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, keyToRemove;

      return _regenerator2.default.async(function updatePolicies$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              params = _.extend({}, policies, { apiKey: apiKey });
              _context4.prev = 1;
              _context4.next = 4;
              return _regenerator2.default.awrap(GigyaDataservice._api({ endpoint: 'accounts.setPolicies', userKey: userKey, userSecret: userSecret, params: params }));

            case 4:
              _context4.next = 34;
              break;

            case 6:
              _context4.prev = 6;
              _context4.t0 = _context4['catch'](1);

              if (!(_context4.t0.code === 400006 && _context4.t0.message.indexOf('Member sites may not override') !== -1)) {
                _context4.next = 33;
                break;
              }

              // Remove group-level policies by parsing error message for keys to remove and try again.
              keysToRemove = _context4.t0.message.substring(_context4.t0.message.indexOf('(') + 1, _context4.t0.message.indexOf(')')).split(',');
              _iteratorNormalCompletion3 = true;
              _didIteratorError3 = false;
              _iteratorError3 = undefined;
              _context4.prev = 13;

              for (_iterator3 = (0, _getIterator3.default)(keysToRemove); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                keyToRemove = _step3.value;

                _.set(params, keyToRemove, undefined);
              }

              // We may need multiple rounds to remove all offending policies.
              _context4.next = 21;
              break;

            case 17:
              _context4.prev = 17;
              _context4.t1 = _context4['catch'](13);
              _didIteratorError3 = true;
              _iteratorError3 = _context4.t1;

            case 21:
              _context4.prev = 21;
              _context4.prev = 22;

              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }

            case 24:
              _context4.prev = 24;

              if (!_didIteratorError3) {
                _context4.next = 27;
                break;
              }

              throw _iteratorError3;

            case 27:
              return _context4.finish(24);

            case 28:
              return _context4.finish(21);

            case 29:
              _context4.next = 31;
              return _regenerator2.default.awrap(this.updatePolicies({ userKey: userKey, userSecret: userSecret, apiKey: apiKey, policies: params }));

            case 31:
              _context4.next = 34;
              break;

            case 33:
              throw _context4.t0;

            case 34:
            case 'end':
              return _context4.stop();
          }
        }
      }, null, this, [[1, 6], [13, 17, 21, 29], [22,, 24, 28]]);
    }
  }, {
    key: 'updateScreensets',
    value: function updateScreensets(_ref10) {
      var userKey = _ref10.userKey;
      var userSecret = _ref10.userSecret;
      var apiKey = _ref10.apiKey;
      var screensets = _ref10.screensets;

      var promises = [];
      _.each(screensets, function (_ref11) {
        var screenSetID = _ref11.screenSetID;
        var html = _ref11.html;
        var css = _ref11.css;
        var metadata = _ref11.metadata;

        var params = { apiKey: apiKey, screenSetID: screenSetID, html: html, css: css, metadata: metadata };
        promises.push(GigyaDataservice._api({ endpoint: 'accounts.setScreenSet', userKey: userKey, userSecret: userSecret, params: params }));
      });
      return promises;
    }
  }, {
    key: '_api',
    value: function _api(_ref12) {
      var _ref12$apiDomain = _ref12.apiDomain;
      var apiDomain = _ref12$apiDomain === undefined ? 'us1.gigya.com' : _ref12$apiDomain;
      var endpoint = _ref12.endpoint;
      var userKey = _ref12.userKey;
      var userSecret = _ref12.userSecret;
      var params = _ref12.params;
      var transform = _ref12.transform;
      var _ref12$isUseCache = _ref12.isUseCache;
      var isUseCache = _ref12$isUseCache === undefined ? false : _ref12$isUseCache;

      return new _promise2.default(function (resolve, reject) {
        params = params ? _.cloneDeep(params) : {};
        params.format = 'json';
        params.userKey = userKey;
        params.secret = userSecret;

        // Serialize objects as JSON strings
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = (0, _getIterator3.default)((0, _entries2.default)(params)), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var _step4$value = (0, _slicedToArray3.default)(_step4.value, 2);

            var _key = _step4$value[0];
            var param = _step4$value[1];

            if (_.isObject(param)) {
              params[_key] = (0, _stringify2.default)(param);
            }
          }

          // Fire request with params
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

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

            // Cache response
            if (isUseCache) {
              // Clone to avoid object that lives in cache being modified by reference after cache
              GigyaDataservice._cacheMap.set(cacheKey, _.cloneDeep(body));
            }

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

          // Check for Gigya error code
          if (body.errorCode !== 0) {
            var error = new Error(body.errorDetails ? body.errorDetails : body.errorMessage);
            error.code = body.errorCode;
            return reject(error);
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


module.exports = GigyaDataservice;