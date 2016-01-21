'use strict';

const _ = require('lodash');

/* @ngInject */
function ValidateController($stateParams) {
  const vm = this;
  vm._ = _;
  vm.validations = $stateParams.params.validations;
}

module.exports = ValidateController;