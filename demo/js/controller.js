angular.module("insample.modular_directives.demo")

.controller("DemoCtrl", function($scope, FakeDataService) {

  $scope.fakeData = "foo"

  $scope.$watch("fakeData", function(value) {
    FakeDataService.setData(value)
  })

})
