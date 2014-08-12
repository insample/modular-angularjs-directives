/*
 * A simple example of how to use modular directives. This file defines a hierarchy of modular
 * directive constructors. Each level in the hierarchy extends the previous one with additional
 * functionality. The constructors at the final level are later used to create directives (see
 * directives.js).
 *
 * To see how modular directives are tested, see the accompanying test files.
 */

angular.module("insample.modular_directives.demo")

// First extension to the base modular directive constructor adds code for fetching data from a fake
// data service.
.factory("ModularDataFetcher", function(ModularDirectiveCtor) {

  return ModularDirectiveCtor.extendWith({

    controller: function($scope, FakeDataService) {

      $scope.$watch(FakeDataService.getData, function(newData) {
        $scope.data = newData
      })

    }

  })

})

// Second extension adds more controller code to transform received data, a link function that
// modifies the directive element, and additional Directive Definition Object (DDO) keys.
.factory("AbstractDemoWidget", function(ModularDataFetcher) {

  return ModularDataFetcher.extendWith({

    // This controller will run after the controller from the base modular directive.
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
.factory("DemoWidgetBlueCtor", function(AbstractDemoWidget) {

  return AbstractDemoWidget.extendWith({

    // This link function will run after the link function from the base modular directive.
    compile: function() {

      return function(scope, element, attrs) {
        element.addClass("blue")
      }

    }

  })

})

// A different DDO constructor that also extends the previous modular directive constructor.
.factory("DemoWidgetGreenCtor", function(AbstractDemoWidget) {

  return AbstractDemoWidget.extendWith({

    compile: function() {

      return function(scope, element, attrs) {
        element.addClass("green")
      }

    }

  })

})
