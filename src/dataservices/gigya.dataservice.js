'use strict';

const superagent = require('superagent');
const _ = require('lodash');

class GigyaDataservice {
  static _cacheMap = new Map();

  static fetchUserSites({ userKey, userSecret, partnerId }) {
    return GigyaDataservice._api({
      endpoint: 'admin.getUserSites',
      userKey,
      userSecret,
      params: { targetPartnerID: partnerId },
      transform: (res) => res.sites,
      isUseCache: true
    });
  }

  static async fetchSiteConfig({ userKey, userSecret, apiKey }) {
    // Requires 3 API calls
    const siteConfig = await GigyaDataservice._api({
      endpoint: 'admin.getSiteConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        includeGigyaSettings: true,
        includeServices: false,
        includeSiteGroupConfig: false,
        includeSiteID: false
      },
      transform: (res) => {
        // Remove settings that can't or shouldn't be automatically copied
        delete res.description;
        delete res.baseDomain;
        delete res.dataCenter;
        delete res.trustedSiteURLs;
        delete res.siteGroupOwner;
        delete res.logoutURL;
        if(res.gigyaSettings) {
          delete res.gigyaSettings.dsSize;
        }

        // Normalize for empty values
        if(res.urlShorteners) {
          for(const key in res.urlShorteners) {
            if(!_.size(res.urlShorteners[key])) {
              delete res.urlShorteners[key];
            }
          }
          if(!_.size(res.urlShorteners)) {
            delete res.urlShorteners;
          }
        }

        return res;
      }
    });
    const providers = await GigyaDataservice._api({
      endpoint: 'socialize.getProvidersConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        includeCapabilities: true,
        includeSettings: true
      }
    });
    const restrictions = await GigyaDataservice._api({
      endpoint: 'admin.getRestrictions',
      userKey,
      userSecret,
      params: {
        apiKey,
        include: 'BlockedIPs,BlockedWords'
      }
    });
    return _.merge(siteConfig, restrictions, providers);
  }

  static fetchSchema({ userKey, userSecret, apiKey }) {
    return GigyaDataservice._api({ endpoint: 'accounts.getSchema', userKey, userSecret, params: { apiKey }, transform: (schema) => {
      // Profile schema has a bunch of things that are read-only
      // We don't save these to the file because they never change
      delete schema.profileSchema.unique;
      delete schema.profileSchema.dynamicSchema;
      for(const fieldName in schema.profileSchema.fields) {
        const field = schema.profileSchema.fields[fieldName];
        delete field.arrayOp;
        delete field.allowNull;
        delete field.type;
        delete field.encrypt;
        delete field.format;
      }

      // Cannot set empty unique field on dataSchema or error
      if(schema.dataSchema.unique && _.isArray(schema.dataSchema.unique) && schema.dataSchema.unique.length === 0) {
        delete schema.dataSchema.unique;
      }

      // Remove fields from dataSchema that do not have a type
      for(const key in schema.dataSchema.fields) {
        const field = schema.dataSchema.fields[key];
        if(!field.type) {
          delete schema.dataSchema.fields[key];
        }
      }

      return schema;
    } });
  }

  static fetchPolicies({ userKey, userSecret, apiKey }) {
    return GigyaDataservice._api({ endpoint: 'accounts.getPolicies', userKey, userSecret, params: { apiKey } });
  }

  static fetchScreensets({ userKey, userSecret, apiKey }) {
    return GigyaDataservice._api({
      endpoint: 'accounts.getScreenSets',
      userKey,
      userSecret,
      params: {
        apiKey,
        include: 'screenSetID,html,css,metadata'
      },
      transform: (res) => res.screenSets
    });
  }

  static async updateSiteConfig({ userKey, userSecret, apiKey, siteConfig }) {
    // Requires 3 API calls
    await GigyaDataservice._api({ endpoint: 'admin.setSiteConfig', userKey, userSecret, params: {
      apiKey,
      gigyaSettings: siteConfig.gigyaSettings,
      services: siteConfig.services,
      urlShorteners: siteConfig.urlShorteners,
      trustedShareURLs: siteConfig.trustedShareURLs
    } });
    await GigyaDataservice._api({
      endpoint: 'socialize.setProvidersConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        providers: siteConfig.providers,
        capabilities: siteConfig.capabilities,
        settings: siteConfig.settings
      }
    });
    await GigyaDataservice._api({
      endpoint: 'admin.setRestrictions',
      userKey,
      userSecret,
      params: {
        apiKey,
        blockedIps: _.map(siteConfig.blockedIPs, (IP) => { return { IP }; }),
        blockedWords: siteConfig.blockedWords
      }
    });
  }

  static async updateSchema({ userKey, userSecret, apiKey, schema }) {
    const params = {
      apiKey,
      profileSchema: schema.profileSchema,
      dataSchema: schema.dataSchema
    };
    try {
      await GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey, userSecret, params });
    } catch(e) {
      // "Group member site can change required field only in site scope."
      // Submit schema on site scope in case of this error.
      if(e.errorCode === 400020) {
        // Target group schema.
        params.scope = 'site';

        // Only send "required" attribute.
        const schemaTypes = ['profileSchema', 'dataSchema'];
        for(const schemaType of schemaTypes) {
          delete params[schemaType].dynamicSchema;
          if(params[schemaType] && params[schemaType].fields) {
            for(const [key, schema] of Object.entries(params[schemaType].fields)) {
              params[schemaType].fields[key] = { required: schema.required };
            }
          }
        }

        // Re-send request.
        await GigyaDataservice._api({ endpoint: 'accounts.setSchema', userKey, userSecret, params });
      } else {
        throw e;
      }
    }
  }

  static updatePolicies({ userKey, userSecret, apiKey, policies }) {
    const params = _.merge(policies, { apiKey });
    return GigyaDataservice._api({ endpoint: 'accounts.setPolicies', userKey, userSecret, params });
  }

  static updateScreensets({ userKey, userSecret, apiKey, screensets }) {
    const promises = [];
    _.each(screensets, ({ screenSetID, html, css, metadata }) => {
      const params = { apiKey, screenSetID, html, css, metadata };
      promises.push(GigyaDataservice._api({ endpoint: 'accounts.setScreenSet', userKey, userSecret, params }));
    });
    return promises;
  }

  static _api({ apiDomain = 'us1.gigya.com', endpoint, userKey, userSecret, params, transform, isUseCache = false }) {
    return new Promise((resolve, reject) => {
      params = params ? _.cloneDeep(params) : {};
      params.format = 'json';
      params.userKey = userKey;
      params.secret = userSecret;

      // Serialize objects as JSON strings
      _.each(params, (param, key) => {
        if(_.isObject(param)) {
          params[key] = JSON.stringify(param);
        }
      });

      // Fire request with params
      const namespace = endpoint.substring(0, endpoint.indexOf('.'));
      let url = `https://${namespace}.${apiDomain}/${endpoint}`;

      // Create cache key
      const cacheKey = isUseCache ? url + JSON.stringify(params) : undefined;

      // Check cache and use cached response if we have it
      let body = GigyaDataservice._cacheMap.get(cacheKey);
      if(body && isUseCache) {
        // Clone to avoid object that lives in cache being modified by reference
        return onBody(_.cloneDeep(body));
      }

      // Prefix URL with /proxy/ if in browser
      if(process.browser) {
        // URL is double-encoded to prevent server errors in some environments
        url = 'proxy/' + encodeURIComponent(encodeURIComponent(url));
      }

      // Fire request
      superagent.post(url)
        .type('form')
        .send(params)
        .end((err, res) => {
          try {
            // Check for network error
            if(err) {
              return reject(err);
            }

            // Parse JSON
            body = JSON.parse(res.text);

            // Cache response
            if(isUseCache) {
              // Clone to avoid object that lives in cache being modified by reference after cache
              GigyaDataservice._cacheMap.set(cacheKey, _.cloneDeep(body));
            }

            onBody(body);
          } catch(e) {
            reject(e);
          }
        });

      function onBody(body) {
        // Check for wrong data center
        if(body.errorCode === 301001 && body.apiDomain) {
          // Try again with correct data center
          return GigyaDataservice._api({
            apiDomain: body.apiDomain,
            endpoint,
            userKey,
            userSecret,
            params,
            transform
          }).then(resolve, reject);
        }

        // Check for Gigya error code
        if(body.errorCode !== 0) {
          const error = new Error(body.errorDetails ? body.errorDetails : body.errorMessage);
          error.errorCode = body.errorCode;
          return reject(error);
        }

        // Don't return trash
        delete body.callId;
        delete body.errorCode;
        delete body.statusCode;
        delete body.statusReason;
        delete body.time;

        // Transform response if necessary
        if(transform) {
          body = transform(body);
        }

        // Gigya response OK
        return resolve(body);
      }
    });
  }
}

module.exports = GigyaDataservice;