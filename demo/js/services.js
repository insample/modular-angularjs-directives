/*
 * A simple example of how to use modular directives. This file defines a three-level hierarchy of
 * modular directive constructors. Each level in the hierarchy extends the previous one with
 * additional functionality. The constructors at the final level are later used to create directives
 * (see directives.js).
 *
 * To see how modular directives are tested, see the accompanying test files.
 */

angular.module("insample.modular_directives.demo")

// First extension to the base modular directive constructor adds code for fetching data from a fake
// data service.
.factory("ModularDirective_GetData", function(ModularDirectiveCtor) {

  return ModularDirectiveCtor.extendWith({

    controller: function($scope, FakeDataService) {

      $scope.$watch(FakeDataService.getData, function(newData) {
        $scope.data = newData
      })

    }

  })

})

// Second extension injects and extends the first with controller code to transform data already
// received, adds a link function that modifies the directive element, and adds additional Directive
// Definition Object (DDO) keys.
.factory("ModularDirective_TransformData", function(ModularDirective_GetData) {

  return ModularDirective_GetData.extendWith({

    controller: function($scope, $filter) {

      $scope.$watch("data", function(newData) {
        $scope.transformedData = $filter("uppercase")(newData)
      })

    },

    compile: function() {

      return function(scope, element, attrs) {
        element.addClass("data-box")
      }

    },

    restrict: "E",

    template: "<div>{{transformedData}}</div>"

  })

})

// The third extension adds a little more to the link function and yields a constructor for the
// final DDO.
.factory("DemoWidgetBlueCtor", function(ModularDirective_TransformData) {

  return ModularDirective_TransformData.extendWith({

    compile: function() {

      return function(scope, element, attrs) {
        element.addClass("blue")
      }

    }

  })

})

// A different DDO constructor that also extends the previous modular directive constructor.
.factory("DemoWidgetGreenCtor", function(ModularDirective_TransformData) {

  return ModularDirective_TransformData.extendWith({

    compile: function() {

      return function(scope, element, attrs) {
        element.addClass("green")
      }

    }

  })

})
