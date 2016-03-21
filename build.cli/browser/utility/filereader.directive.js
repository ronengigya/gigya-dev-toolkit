'use strict';

/* @ngInject */

function fileReader($q) {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: link
  };

  /* @ngInject */
  function link(scope, element, attrs, ngModel) {
    // Don't initialize if ng-model isn't provided
    if (!ngModel) {
      return;
    }

    // Don't know what this does
    ngModel.$render = function () {};

    // When the input changes
    element.bind('change', function (e) {
      // Get element
      var element = e.target;

      $q.all(Array.prototype.slice.call(element.files, 0).map(readFile)).then(function (values) {
        if (element.multiple) {
          // If multiple files, pass back array
          ngModel.$setViewValue(values);
        } else {
          // Pass back single file
          ngModel.$setViewValue(values.length ? values[0] : null);
        }
      });

      // Read file contents as data URL
      function readFile(file) {
        var deferred = $q.defer();

        var reader = new FileReader();
        reader.onload = function (e) {
          deferred.resolve(e.target.result);
        };
        reader.onerror = function (e) {
          deferred.reject(e);
        };
        reader.readAsDataURL(file);

        return deferred.promise;
      }
    });
  }
};

module.exports = fileReader;