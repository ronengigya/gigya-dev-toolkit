'use strict';

/* @ngInject */

function translateHelper($translateProvider) {
  $translateProvider.useSanitizeValueStrategy('escape');
  $translateProvider.preferredLanguage('en');
  $translateProvider.useLocalStorage();

  /*jshint validthis:true */
  this.configure = function configure(cfg) {
    angular.extend(config, cfg);
  };

  this.$get = TranslateHelper;

  /* @ngInject */
  function TranslateHelper($rootScope, $translate) {
    var service = {
      setTranslationTable: setTranslationTable,
      getTranslationTable: getTranslationTable,
      switchLanguage: switchLanguage,
      getLanguageCode: getLanguageCode
    };

    return service;

    ///////////////

    function setTranslationTable(languageCode, table) {
      $translateProvider.translations(languageCode, table);
    }

    function getTranslationTable() {
      var languageCode = arguments.length <= 0 || arguments[0] === undefined ? getLanguageCode() : arguments[0];

      return $translateProvider.translations(languageCode);
    }

    function switchLanguage(languageCode) {
      $translate.use(languageCode);
    }

    function getLanguageCode() {
      return $translate.use();
    }
  }
}

module.exports = translateHelper;