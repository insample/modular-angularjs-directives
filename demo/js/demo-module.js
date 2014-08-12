angular.module("insample.modular_directives.demo", ["insample.modular_directives"])

.factory("FakeDataService", function() {

  var data = ""

  return {

    setData: function(newData) {
      data = newData
    },

    getData: function() {
      return data
    }

  }

})

.controller("DemoCtrl", function($scope, FakeDataService) {

  $scope.fakeData = "foo"

  $scope.$watch("fakeData", function(value) {
    FakeDataService.setData(value)
  })

})
