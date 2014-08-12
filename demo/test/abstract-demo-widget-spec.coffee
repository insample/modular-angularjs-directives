# Sample spec for the AbstractDemoWidget service defined in js/services.js
#
# This file demonstrates how modular directive constructors are tested. Given a modular directive
# constructor that is an extension of another (in this case AbstractDemoWidget extends
# ModularDataFetcher), we inject a fake base constructor and define a basic directive implementing
# the extended constructor. This allows us to write succinct tests that test the extended directive
# in isolation.
#
describe "The AbstractDemoWidget service", ->

  $compile = ModularDirectiveCtor = null
  scope = directiveScope = null

  # A basic directive that implements the modular directive under test.
  angular.module("insample.modular_directives.demo").directive "abstractDemoWidgetImpl",

    (AbstractDemoWidget) ->
      ddoCtor = AbstractDemoWidget.extendWith {
        # Intercept the directive scope so it can be interrogated in tests.
        controller: ($scope) -> directiveScope = $scope
      }
      new ddoCtor


  beforeEach ->

    # Fake out any functionality expected from the base modular directive.
    fakeDataFetcherDdo = {
      controller: ($scope) -> $scope.data = "fake data"
    }

    module "insample.modular_directives.demo", ($provide) ->
      # Inject direct extension of ModularDirectiveCtor instead of the real base modular directive.
      $provide.factory 'ModularDataFetcher',
        () -> ModularDirectiveCtor.extendWith(fakeDataFetcherDdo)
      null

    inject (_$rootScope_, _$compile_, _ModularDirectiveCtor_) ->
      scope = _$rootScope_.$new()
      $compile = _$compile_
      ModularDirectiveCtor = _ModularDirectiveCtor_


  describe "has a controller that", ->

    beforeEach ->
      elt = angular.element "<abstract-demo-widget-impl></abstract-demo-widget-impl>"
      $compile(elt) scope
      scope.$digest()

    it "transforms previously fetched data", ->
      expect(directiveScope.transformedData).toEqual "FAKE DATA"


  describe "has a link function that", ->

    elt = null

    beforeEach ->
      elt = angular.element "<abstract-demo-widget-impl></abstract-demo-widget-impl>"
      $compile(elt) scope
      scope.$digest()

    it "applies a class to the directive element", ->
      expect(elt.hasClass "data-box").toBe true
