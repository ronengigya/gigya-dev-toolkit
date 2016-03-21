'use strict';

var _ = require('lodash');

/* @ngInject */
function ValidateController($stateParams) {
  var vm = this;
  vm._ = _;
  vm.validations = $stateParams.params.validations;
}

module.exports = ValidateController;