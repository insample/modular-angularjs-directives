/*
 ************************************
 *
 * Modular Directives
 *
 * Copyright (c) 2014 InSample, Inc.
 *
 * Released under the MIT License
 *
 ************************************
 *
 * A modular directive is a constructor for an AngularJS Directive Definition Object (DDO), cf.
 * http://docs.angularjs.org/api/ng/service/$compile
 *
 * A modular directive can be extended using its `extendWith` method, described below, which returns
 * another modular directive.
 */
angular.module("insample.modular_directives", []).factory("ModularDirectiveCtor", function() {

  var modularDirectiveCtor = function() {}

  // Use this prototype to set DDO defaults.
  modularDirectiveCtor.prototype = {
    // Modular directives ONLY support isolate scope.
    scope: {},
    controller: function($scope) {},
    // Modular directives do NOT support link functions attached to a `link` key; instead, use
    // compile functions to return link functions. Pre-link functions are currently also NOT
    // supported.
    compile: function(tElement, tAttrs) {
      return angular.noop
    }
  }


  /* UPDATE!!!
   * Returns a constructor for an modular directive that's extended with the keys in
   * partialDdo as follows:
   *
   * If partialDdo has a function valued key (e.g. controller), the new modular directive
   * will have that value defined to be a function that first calls the caller modular directive's
   * function (if defined) and then the function in partialDdo.
   *
   * If partialDdo has an object valued key (e.g. scope), the new modular directive will have
   * that value defined to be the extension of the caller modular directive's object (if defined)
   * with the one in partialDdo.
   *
   * Otherwise the value in the new modular directive will be overwritten to be the value in
   * partialDdo for the given key.
   */
  modularDirectiveCtor.extendWith = function(partialDdo) {

    if (_.has(partialDdo, "link")) {
      throw new Error("Standalone link functions are not supported; please use a compile " +
        "function that returns a link function instead.")
    }

    var modularDirectivePrototype = new this()

    var extendedCtor = function() {

      _.each(partialDdo, function(value, key) {

        var baseValue = modularDirectivePrototype[key]

        switch (key) {

          case "link":
            // Not supported
            break

          case "scope":

            this[key] = _.clone(baseValue || {})
            _.extend(this[key], value)

            break

          case "compile":

            this[key] = function() {

              var baseLink = undefined
              if (!_.isUndefined(baseValue)) {
                baseLink = baseValue.apply(null, arguments)
              }
              var link = value.apply(null, arguments)

              return concatenateFunctions(baseLink, link)

            }

            break

          case "controller":

            /*
             * When creating concatenated controllers, we need to annotate the concatenated
             * controller with dependencies for angular injection to work. Inside the concatenated
             * controller, we must be careful about which arguments we pass to which constituent
             * controller.
             */
            var inj = angular.injector()
            var baseValueAnnotations = _.isUndefined(baseValue) ? [] : inj.annotate(baseValue)
            var valueAnnotations = inj.annotate(value)
            var allAnnotations = _.union(baseValueAnnotations, valueAnnotations)

            var concatenatedController = concatenateFunctions(
              function() {
                baseValue.apply(null,
                  extractServices(baseValueAnnotations, allAnnotations, arguments))
              }, function() {
                value.apply(null,
                  extractServices(valueAnnotations, allAnnotations, arguments))
              }
            )

            concatenatedController.$inject = allAnnotations
            this[key] = concatenatedController

            break

          default:

            this[key] = value

            break

        }

      }, this)

    }

    extendedCtor.prototype = modularDirectivePrototype

    extendedCtor.extendWith = this.extendWith

    extendedCtor.wasExtendedWith = partialDdo

    return extendedCtor

  }


  /* Returns a function that calls `baseFct` and then `extensionFct` in sequence. */
  var concatenateFunctions = function(baseFct, extensionFct) {

    return function() {
      if (!_.isUndefined(baseFct)) {
        baseFct.apply(null, arguments)
      }
      extensionFct.apply(null, arguments)
    }

  }


  /*
   * This function gets the index in `serviceNameList` of every service name in `serviceNameSublist`
   * and returns the sublist of `serviceList` that corresponds to these indices.
   *
   * Every name in `serviceNameSublist` should appear in `serviceNameList`; `serviceNameList` should
   * be exactly equal to the list of names of services in `serviceList`.
   */
  var extractServices = function(serviceNameSublist, serviceNameList, serviceList) {

    if (serviceNameList.length > serviceList.length) {
      throw new Error(
        "The number of provided services is less than the number of requested services.")
    }

    return _.map(serviceNameSublist, function(serviceName) {
      var indexInServiceList = _.indexOf(serviceNameList, serviceName)
      if (indexInServiceList < 0) {
        throw new Error(serviceName + " was not found in the list of service names.")
      }
      return serviceList[indexInServiceList]
    })
  }


  return modularDirectiveCtor

})
