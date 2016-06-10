'use strict';

const superagent = require('superagent');
const _ = require('lodash');

class GigyaDataservice {
  static _cacheMap = new Map();

  static fetchPartner({ userKey, userSecret, partnerId }) {
    return GigyaDataservice._api({
      endpoint: 'admin.getPartner',
      userKey,
      userSecret,
      params: { partnerID: partnerId },
      isUseCache: true
    });
  }

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
        includeServices: true,
        includeSiteGroupConfig: true,
        includeSiteID: false
      },
      transform: (res) => {
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
    providers.permissions = providers.settings;
    delete providers.settings;
    const restrictions = await GigyaDataservice._api({
      endpoint: 'admin.getRestrictions',
      userKey,
      userSecret,
      params: {
        apiKey,
        include: 'BlockedIPs,BlockedWords'
      }
    });
    const response = _.merge(siteConfig, providers);

    // Attempt to add SAML configuration to response.
    try {
      const samlLoginConfig = await GigyaDataservice._api({
        endpoint: 'fidm.saml.getConfig',
        userKey,
        userSecret,
        params: {
          apiKey
        }
      });
      const registeredIdPs = await GigyaDataservice._api({
        endpoint: 'fidm.saml.getRegisteredIdPs',
        userKey,
        userSecret,
        params: {
          apiKey
        }
      });
      const samlIdpConfig = await GigyaDataservice._api({
        endpoint: 'fidm.saml.idp.getConfig',
        userKey,
        userSecret,
        params: {
          apiKey
        }
      });
      const registeredSPs = await GigyaDataservice._api({
        endpoint: 'fidm.saml.idp.getRegisteredSPs',
        userKey,
        userSecret,
        params: {
          apiKey
        }
      });
      response.saml = {
        idp: _.assign(samlLoginConfig.config, { registeredIdPs: registeredIdPs.configs }),
        sp: _.assign(samlIdpConfig.config, { registeredSPs: registeredSPs.configs })
      };
    } catch(e) {}

    // We want this at the bottom because the list is annoying.
    _.merge(response, restrictions);

    return response;
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

  static async updateSiteConfig({ userKey, userSecret, partnerId, apiKey, siteConfig, copyEverything = false }) {
    // Clone site configuration because we may modify it
    siteConfig = _.cloneDeep(siteConfig);

    // Check to see if we're trying to create a new site
    if(apiKey === '_new') {
      // Create API key and then call updateSiteConfig to set all other values.
      const response = await GigyaDataservice._api({ endpoint: 'admin.createSite', userKey, userSecret, params: {
        partnerID: partnerId,
        baseDomain: siteConfig.baseDomain,
        description: siteConfig.description,
        dataCenter: siteConfig.dataCenter
      } });
      apiKey = response.apiKey;

      // We want to clone source config to new key
      copyEverything = true;
    }

    // If the siteConfig is for a child site, the database shouldn't be active
    if(siteConfig.siteGroupOwner) {
      _.set(siteConfig, 'gigyaSettings.dsSize', undefined);
    }

    // These settings are renewed because if a key already exists the basic configuration is typically static
    // You don't want to _clone_ the source key to the destination, you want to copy all settings
    if(copyEverything === false) {
      delete siteConfig.description;
      delete siteConfig.baseDomain;
      delete siteConfig.dataCenter;
      delete siteConfig.trustedSiteURLs;
      delete siteConfig.siteGroupOwner;
      delete siteConfig.logoutURL;
      _.set(siteConfig, 'gigyaSettings.dsSize', undefined);
    }

    // Requires 3 API calls
    await GigyaDataservice._api({ endpoint: 'admin.setSiteConfig', userKey, userSecret, params: {
      apiKey,
      description: siteConfig.description,
      gigyaSettings: siteConfig.gigyaSettings,
      services: siteConfig.services,
      urlShorteners: siteConfig.urlShorteners,
      trustedSiteURLs: siteConfig.trustedSiteURLs,
      trustedShareURLs: siteConfig.trustedShareURLs,
      logoutURL: siteConfig.logoutURL,
      siteGroupOwner: siteConfig.siteGroupOwner,
      settings: siteConfig.settings
    } });
    await GigyaDataservice._api({
      endpoint: 'socialize.setProvidersConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        providers: siteConfig.providers,
        capabilities: siteConfig.capabilities,
        settings: siteConfig.permissions
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

    for(const idpConfig of _.get(siteConfig, 'saml.idp.registeredIdPs', [])) {
      await GigyaDataservice._api({
        endpoint: 'fidm.saml.fidm.registerIdP',
        userKey,
        userSecret,
        params: {
          apiKey,
          config: idpConfig
        }
      });
    }

    for(const spConfig of _.get(siteConfig, 'saml.sp.registeredSPs', [])) {
      await GigyaDataservice._api({
        endpoint: 'fidm.saml.idp.registerSP',
        userKey,
        userSecret,
        params: {
          apiKey,
          config: spConfig
        }
      });
    }

    if(_.get(siteConfig, 'saml.idp')) {
      delete siteConfig.saml.idp.registeredIdPs;
      await GigyaDataservice._api({
        endpoint: 'fidm.saml.setConfig',
        userKey,
        userSecret,
        params: {
          apiKey,
          config: siteConfig.saml.idp
        }
      });
    }

    if(_.get(siteConfig, 'saml.sp')) {
      delete siteConfig.saml.sp.registeredSPs;
      await GigyaDataservice._api({
        endpoint: 'fidm.saml.idp.setConfig',
        userKey,
        userSecret,
        params: {
          apiKey,
          config: siteConfig.saml.sp
        }
      });
    }

    return { apiKey };
  }

  static async fetchLoyaltyConfig({ userKey, userSecret, apiKey }) {
    const globalConfig = await GigyaDataservice._api({
      endpoint: 'gm.setGlobalConfig',
      userKey,
      userSecret,
      params: {
        apiKey
      }
    });

    const actionConfig = await GigyaDataservice._api({
      endpoint: 'gm.getActionConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        lang: 'all',
        includeDisabledActions: true
      }
    }); 

    const challengeConfig = await GigyaDataservice._api({
      endpoint: 'gm.getChallengeConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        lang: 'all',
        expandActions: true,
        includeDisabledChallenges: true,
        includeDisabledActions: true
      }
    });

    // Gigya returns JSON inside of strings for localized text.
    // Convert to real JSON.
    function realJson(obj) {
      if(_.isObject(obj)) {
        for(const key in obj) {
          if(_.isString(obj[key]) && obj[key].indexOf('{') === 0) {
            try {
              obj[key] = JSON.parse(obj[key]);
            } catch(e) {}
          } else if(_.isObject(obj[key])) {
            realJson(obj[key]);
          }
        }
      }
    }
    realJson(actionConfig);
    realJson(challengeConfig);

    return {
      callbackURL: globalConfig.callbackURL,
      allowClientSideActionNotifications: globalConfig.allowClientSideActionNotifications,
      actions: actionConfig.actions,
      challenges: challengeConfig.challenges
    };
  }

  static async updateLoyaltyConfig({ userKey, userSecret, apiKey, loyaltyConfig: { callbackURL, allowClientSideActionNotifications, actions, challenges } }) {
    await GigyaDataservice._api({
      endpoint: 'gm.setGlobalConfig',
      userKey,
      userSecret,
      params: {
        apiKey,
        callbackURL,
        allowClientSideActionNotifications
      }
    });

    for(const action of actions) {
      action.apiKey = apiKey;
      await GigyaDataservice._api({
        endpoint: 'gm.setActionConfig',
        userKey,
        userSecret,
        params: action
      });
    }

    for(const challenge of challenges) {
      challenge.apiKey = apiKey;
      await GigyaDataservice._api({
        endpoint: 'gm.setChallengeConfig',
        userKey,
        userSecret,
        params: challenge
      });
    }
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
      if(e.code === 400020) {
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

  static async updatePolicies({ userKey, userSecret, apiKey, policies }) {
    const params = _.extend({}, policies, { apiKey });
    try {
      await GigyaDataservice._api({ endpoint: 'accounts.setPolicies', userKey, userSecret, params });
    } catch(e) {
      // "Invalid argument: Member sites may not override group-level policies (registration,passwordComplexity,...)"
      // "Invalid argument: Member sites may not override subgroup policies (accountOptions.verifyProviderEmail,...)"
      if(e.code === 400006 && e.message.indexOf('Member sites may not override') !== -1) {
        // Remove group-level policies by parsing error message for keys to remove and try again.
        const keysToRemove = e.message.substring(e.message.indexOf('(') + 1, e.message.indexOf(')')).split(',');
        for(const keyToRemove of keysToRemove) {
          _.set(params, keyToRemove, undefined);
        }

        // We may need multiple rounds to remove all offending policies.
        await this.updatePolicies({ userKey, userSecret, apiKey, policies: params });
      } else {
        // Exception thrown that we don't care about, bubble up.
        throw e;
      }
    }
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
      for(const [key, param] of Object.entries(params)) {
        if(_.isObject(param)) {
          params[key] = JSON.stringify(param);
        }
      }

      // Fire request with params
      const namespace = endpoint.substring(0, endpoint.indexOf('.'));
      let url = `https://${namespace}.${apiDomain}/${endpoint}`;

      //console.log(url + '?' + require('querystring').stringify(params));

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