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
 * A modular directive constructor is an extensible constructor for an AngularJS Directive
 * Definition Object (DDO), cf. http://docs.angularjs.org/api/ng/service/$compile
 *
 * A modular directive constructor can be extended using its `extendWith` method, described below.
 */
angular.module("insample.modular_directives", []).factory("ModularDirectiveCtor", function() {

  var modularDirectiveCtor = function() {};

  // Use this prototype to set DDO defaults.
  modularDirectiveCtor.prototype = {
    // Modular directives ONLY support isolate scope.
    scope: {},
    controller: ['$scope', function($scope) {}],
    // Modular directives do NOT support link functions attached to a `link` key; instead, use
    // compile functions to return link functions. Pre-link functions are currently also NOT
    // supported.
    compile: function(tElement, tAttrs) {
      return angular.noop
    }
  };

  /* This method takes `partialDdo`, which must be a valid Directive Definition Object (DDO), and
   * returns a modular directive constructor. Let “base DDO” be the DDO that would have been
   * returned by the un-extended input constructor, and let “output DDO” be the DDO that is returned
   * by the output returned by this function. Then the output DDO is an extension of the base DDO in
   * the following sense:

   * 1. The output DDO has an isolate scope object that equals the isolate scope object attached to
   * the base DDO, if any, extended by the isolate scope object attached to `partialDdo`.
   *
   * 2. The output DDO’s controller function is a concatenation of the base DDO and `partialDdo`
   * controller functions; the former is called before the latter. The same is true of the output
   * DDO’s link function, though link functions should be returned by compile functions (see
   * Restrictions below).
   *
   * 3. For all other DDO properties, the value in `partialDdo` is written over the value in the
   * base DDO.
   *
   * Restrictions:
   *
   * 1. The output DDO will always have an isolate scope.
   *
   * 2. Standalone link functions are not supported: `partialDdo` may not have a `link` property.
   * Use compile functions to return link functions. Pre-link functions are not supported, so
   * compile functions should return functions, not objects containing pre- and post-link functions.
   */
  modularDirectiveCtor.extendWith = function(partialDdo) {

    if (_.has(partialDdo, "link")) {
      throw new Error("Standalone link functions are not supported; please use a compile " +
        "function that returns a link function instead.")
    }

    var modularDirectivePrototype = new this();

    var extendedCtor = function() {

      _.each(partialDdo, function(value, key) {

        var baseValue = modularDirectivePrototype[key];

        switch (key) {

          case "link":
            // Not supported
            break;

          case "scope":

            this[key] = _.clone(baseValue || {});
            _.extend(this[key], value);

            break;

          case "compile":

            this[key] = function() {

              var baseLink = undefined;
              if (!_.isUndefined(baseValue)) {
                baseLink = baseValue.apply(null, arguments)
              }
              var link = value.apply(null, arguments);

              return concatenateFunctions(baseLink, link)

            };

            break;

          /*
           * When concatenating controllers, we need to annotate the concatenated controller with
           * dependencies for angular injection to work. Inside the concatenated controller, we must
           * be careful about which arguments we pass to which constituent controller.
           */
          case "controller":

            var inj = angular.injector();
            var baseValueAnnotations = _.isUndefined(baseValue) ? [] : inj.annotate(baseValue);
            var valueAnnotations = inj.annotate(value);
            var allAnnotations = _.union(baseValueAnnotations, valueAnnotations);

            // Pull out functions in case of array notation
            var baseValueFunction =
              _.isArray(baseValue) ? baseValue[baseValue.length - 1] : baseValue
            var valueFunction =
              _.isArray(value) ? value[value.length - 1] : value

            var concatenatedController = concatenateFunctions(
              function() {
                baseValueFunction.apply(null,
                  extractServices(baseValueAnnotations, allAnnotations, arguments))
              }, function() {
                valueFunction.apply(null,
                  extractServices(valueAnnotations, allAnnotations, arguments))
              }
            );

            concatenatedController.$inject = allAnnotations;
            this[key] = concatenatedController;

            break;

          default:

            this[key] = value;

            break

        }

      }, this)

    };

    extendedCtor.prototype = modularDirectivePrototype;

    extendedCtor.extendWith = this.extendWith;

    extendedCtor.wasExtendedWith = partialDdo;

    return extendedCtor

  };


  /* Returns a function that calls `baseFct` and then `extensionFct` in sequence. */
  var concatenateFunctions = function(baseFct, extensionFct) {

    return function() {
      if (!_.isUndefined(baseFct)) {
        baseFct.apply(null, arguments)
      }
      extensionFct.apply(null, arguments)
    }

  };


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
      var indexInServiceList = _.indexOf(serviceNameList, serviceName);
      if (indexInServiceList < 0) {
        throw new Error(serviceName + " was not found in the list of service names.")
      }
      return serviceList[indexInServiceList]
    })
  };


  return modularDirectiveCtor

});
