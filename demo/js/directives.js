/*
 * To create a directive from a modular directive constructor, simply inject it and use it to
 * instantiate a Directive Definition Object.
 */

angular.module("insample.modular_directives.demo")

.directive("demoWidgetBlue", function(DemoWidgetBlueCtor) {

  return new DemoWidgetBlueCtor()

})


.directive("demoWidgetGreen", function(DemoWidgetGreenCtor) {

  return new DemoWidgetGreenCtor()

})
