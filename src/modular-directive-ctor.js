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
 * A module directive can be extended using its `extendWith` method, described below, which returns
 * another constructor for a DDO.
 */
angular.module("insample.modular_directives", []).factory("ModularDirectiveCtor", function() {

  var modularDirectiveCtor = function() {}

  modularDirectiveCtor.prototype = {
    // Only support isolate scope.
    scope: {},
    controller: function($scope) {},
    // Module directives do NOT support link functions attached to a `link` key; instead, use
    // compile functions to return link functions.
    compile: function(tElement, tAttrs) {
      return angular.noop
    }
  }

  /*
   * Returns a constructor for an modular directive that's extended with the keys in
   * partialDirective as follows:
   *
   * If partialDirective has a function valued key (e.g. controller), the new modular directive
   * will have that value defined to be a function that first calls the caller modular directive's
   * function (if defined) and then the function in partialDirective.
   *
   * If partialDirective has an object valued key (e.g. scope), the new modular directive will have
   * that value defined to be the extension of the caller modular directive's object (if defined)
   * with the one in partialDirective.
   *
   * Otherwise the value in the new modular directive will be overwritten to be the value in
   * partialDirective for the given key.
   */
  modularDirectiveCtor.extendWith = function(partialDirective) {
    var modularDirectivePrototype = new this();
    var extendedCtor = function() {

      if (_.has(partialDirective, "link")) {
        throw new Error("Standalone link functions are not supported; please use a compile " +
          "function that returns a link function instead.")
      }

      _.each(partialDirective, function(value, key) {
        var baseValue = modularDirectivePrototype[key]
        if (_.isFunction(value)) {
          /*
           * When creating compound controllers, we need to annotate the new function with
           * dependencies for angular injection to work, and also be careful about which arguments
           * we pass to which constituent function.
           */
          if (key == "controller") {

            var inj = angular.injector()
            var baseValueAnnotations = _.isUndefined(baseValue) ? [] : inj.annotate(baseValue)
            var valueAnnotations = inj.annotate(value)
            var compoundAnnotations = _.union(baseValueAnnotations, valueAnnotations)

            var compoundFct = function() {
              if (!_.isUndefined(baseValue)) {
                baseValue.apply(null,
                  extractServices(baseValueAnnotations, compoundAnnotations, arguments))
              }
              value.apply(null,
                extractServices(valueAnnotations, compoundAnnotations, arguments));
            }

            compoundFct.$inject = compoundAnnotations
            this[key] = compoundFct

          } else if (key == "compile") {

            this[key] = function() {
              var baseLink = undefined
              if (!_.isUndefined(baseValue)) {
                baseLink = baseValue.apply(null, arguments)
              }
              var link = value.apply(null, arguments)
              return function() {
                if (!_.isUndefined(baseLink)) {
                  baseLink.apply(null, arguments)
                }
                link.apply(null, arguments)
              }
            }


          } else {

            this[key] = function() {
              if (!_.isUndefined(baseValue)) {
                baseValue.apply(null, arguments)
              }
              value.apply(null, arguments);
            }

          }

        } else if (_.isObject(value) && !_.isArray(value)) {
          this[key] = _.clone(baseValue || {})
          _.extend(this[key], value)
        } else {
          this[key] = value;
        }
      }, this)
    }

    extendedCtor.prototype = modularDirectivePrototype

    extendedCtor.extendWith = this.extendWith

    extendedCtor.wasExtendedWith = partialDirective

    return extendedCtor
  }

  /*
   * This function gets the index in `serviceNameList` of every service name in `serviceNameSublist`
   * and returns the sublist of `serviceList` that corresponds to these indices.
   *
   * Every name in `serviceNameSublist` should appear in `serviceNameList`; `serviceNameList` should
   * be exactly equal to the list of names of services in `serviceList`.
   */
  var extractServices = function(serviceNameSublist, serviceNameList, serviceList) {

    if (serviceNameList.length != serviceList.length) {
      throw new Error("The number of provided services does not equal the number of service names.")
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
