'use strict';

var _ = require('lodash');

/* @ngInject */
function ConfigController(translateHelper, $stateParams) {
  var vm = this;
  vm._ = _;
  vm.state = $stateParams.state;
  vm.languages = [{ code: 'en', label: 'ENGLISH' }, { code: 'es', label: 'SPANISH' }];
  vm.languageCode = translateHelper.getLanguageCode;
  vm.switchLanguage = translateHelper.switchLanguage;
}

module.exports = ConfigController;