'use strict';

var _ = require('lodash');

/* @ngInject */
function PromptController($stateParams, $state) {
  // Questions sometimes passed as single object, not array
  var questions = _.isArray($stateParams.params.questions) ? $stateParams.params.questions : [$stateParams.params.questions];

  _.each(questions, function (question) {
    // Ensure choices are object format not shorthand string
    _.each(question.choices, function (choice, i) {
      if (!_.isObject(choice)) {
        question.choices[i] = { value: choice, name: choice };
      }
    });
  });

  var vm = this;
  vm.questions = questions;
  vm.answers = {};
  vm.submit = submit;

  //////////

  function submit() {
    // Transform Angular model into expected format
    var answers = _.cloneDeep(vm.answers);
    _.each(questions, function (question, i) {
      if (question.type === 'checkbox') {
        answers[question.name] = _.keys(answers[question.name]);
      }
    });

    var state = _.merge($stateParams.state, answers);
    $state.go('toolkit', { state: state });
  }
}

module.exports = PromptController;