'use strict';

/* @ngInject */

function InfoController($stateParams, $state) {
  var vm = this;
  vm.message = $stateParams.params.message;
}

module.exports = InfoController;