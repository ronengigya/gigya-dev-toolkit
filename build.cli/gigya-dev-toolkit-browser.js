'use strict';

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $ = global.jQuery = require('jquery'); // Expose for Bootstrap / Angular / jQuery plugins
require('jquery.actual/jquery.actual.js');
var bootstrap = require('bootstrap');
var angular = require('angular');
var app = angular.module('app', [require('angular-sanitize'), require('angular-ui-router'), require('angular-translate'), require('angular-cookies'), require('angular-translate-storage-cookie'), require('angular-translate-storage-local')]);
var _ = require('lodash');
var LZString = require('lz-string');
var toolkit = require('./gigya-dev-toolkit.js');
var state = {};

app.provider('routerHelper', require('./browser/utility/router-helper.provider.js')).provider('translateHelper', require('./browser/utility/translate-helper.provider.js')).directive('filereader', require('./browser/utility/filereader.directive')).directive('jsdiff', require('./browser/utility/jsdiff.directive')).controller('ConfigController', require('./browser/controllers/config.controller')).controller('InfoController', require('./browser/controllers/info.controller')).controller('PromptController', require('./browser/controllers/prompt.controller')).controller('ValidateController', require('./browser/controllers/validate.controller')).controller('ErrorController', require('./browser/controllers/error.controller')).run(run);

/* @ngInject */
function run(routerHelper, translateHelper, $state, $rootScope, $translate) {
  // Configure translations
  // Must hard-code require calls, cannot use loop
  translateHelper.setTranslationTable('en', require('./translations/en.json'));
  translateHelper.setTranslationTable('es', require('./translations/es.json'));

  // Add custom types for use in routes
  routerHelper.configureTypes([{
    type: 'compressedJson',
    definition: {
      encode: function encode(obj) {
        return LZString.compressToEncodedURIComponent(angular.toJson(obj));
      },
      decode: function decode(string) {
        return angular.fromJson(LZString.decompressFromEncodedURIComponent(string));
      },
      is: function is(obj) {
        return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object';
      },
      equals: angular.equals,
      pattern: /.*/
    }
  }]);

  // Add base routes
  routerHelper.configureStates([{
    state: 'toolkit',
    config: {
      url: '/toolkit?{state:compressedJson}',
      params: {
        state: {
          value: {}
        },
        params: {
          value: {}
        }
      },
      views: {
        '@': {
          /* @ngInject */
          controller: function controller($stateParams) {
            if ($stateParams.state !== state) {
              angular.copy($stateParams.state, state);
            }
            main();
          }
        },
        'config': {
          template: require('./browser/controllers/config.html'),
          controller: 'ConfigController',
          controllerAs: 'vm'
        }
      }
    }
  }, {
    state: 'toolkit.info',
    config: {
      views: {
        '@': {
          template: require('./browser/controllers/info.html'),
          controller: 'InfoController',
          controllerAs: 'vm'
        }
      }
    }
  }, {
    state: 'toolkit.prompt',
    config: {
      views: {
        '@': {
          template: require('./browser/controllers/prompt.html'),
          controller: 'PromptController',
          controllerAs: 'vm'
        }
      }
    }
  }, {
    state: 'toolkit.validate',
    config: {
      views: {
        '@': {
          template: require('./browser/controllers/validate.html'),
          controller: 'ValidateController',
          controllerAs: 'vm'
        }
      }
    }
  }, {
    state: 'toolkit.error',
    config: {
      views: {
        '@': {
          template: require('./browser/controllers/error.html'),
          controller: 'ErrorController',
          controllerAs: 'vm'
        }
      }
    }
  }]);

  // When a user hits home, redirect to toolkit
  routerHelper.when('', function () {
    return $state.go('toolkit', {}, { replace: true });
  });

  // The config floats at the bottom of the screen
  // Ensure that you can scroll the entire page content
  $rootScope.$on('$stateChangeSuccess', function () {
    setTimeout(function () {
      // Get element's outerHeight (even when element is hidden)
      var configHeight = $('div.config').actual('outerHeight');

      // Add margin to adjust elements depending on the variable height of the config
      $('div.page').css('margin-bottom', configHeight);
      $('div.config-toggle').css('margin-bottom', configHeight);
    }, 50);
  });

  // The logical flow of this app is a little strange because it was written to work on command-line and browser
  // main() is called once, initially, and it uses toolkit to get the current view
  // The view is then brought up via Angular's router
  // When the view finishes, it updates the state which triggers main() again and the process is repeated
  function main() {
    // Loading spinner (toolkit may do AJAX calls, etc)
    $('body').addClass('loading');

    // Call toolkit with complete state
    toolkit(state).then(function (res) {
      // Remove loading spinner
      // View will never do additional loading
      $('body').removeClass('loading');

      // Load view as requested by toolkit
      $state.go('toolkit.' + res.view, { state: state, params: res.params }, { location: 'replace' });
    }, function (error) {
      // Remove loading spinner
      $('body').removeClass('loading');

      // Show error
      if ((typeof console === 'undefined' ? 'undefined' : (0, _typeof3.default)(console)) === 'object' && console.error) {
        console.error(error.stack);
      }
      $state.go('toolkit.error', { state: state, params: { error: error } });
    });
  }
}