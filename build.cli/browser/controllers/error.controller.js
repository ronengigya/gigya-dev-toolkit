'use strict';

/* @ngInject */

function ErrorController($stateParams) {
  var vm = this;
  vm.error = $stateParams.params.error;
}

module.exports = ErrorController;