/*
 * An extensible directive is a service providing a constructor for an object whose keys are a subset
 * of the keys found in a Directive Definition Object.
 */
angular.module("insample.extensible_directives", []).factory("ExtensibleDirectiveCtor", function() {

  var extensibleDirectiveCtor = function() {}
  /*
   * The keys defined on this object will be inhertied by all extensible directives. Each such key
   * should be a key in a Directive Definition Object, cf.
   * http://docs.angularjs.org/api/ng/service/$compile
   */
  extensibleDirectiveCtor.prototype = {
    scope: {},
    controller: function($scope) {},
    compile: function(tElement, tAttrs) {
      return angular.noop
    }
  }

  /*
   * Returns a constructor for an extensible directive that's extended with the keys in
   * partialDirective as follows:
   *
   * If partialDirective has a function valued key (e.g. controller), the new extensible directive
   * will have that value defined to be a function that first calls the caller extensible directive's
   * function (if defined) and then the function in partialDirective.
   *
   * If partialDirective has an object valued key (e.g. scope), the new extensible directive will have
   * that value defined to be the extension of the caller extensible directive's object (if defined)
   * with the one in partialDirective.
   *
   * Otherwise the value in the new extensible directive will be overwritten to be the value in
   * partialDirective for the given key.
   */
  extensibleDirectiveCtor.extendWith = function(partialDirective) {
    var extensibleDirectivePrototype = new this();
    var extendedCtor = function() {

      if (_.has(partialDirective, "link")) {
        throw new Error("Standalone link functions are not supported; please use a compile " +
          "function that returns a link function instead.")
      }

      _.each(partialDirective, function(value, key) {
        var baseValue = extensibleDirectivePrototype[key]
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
                  extractBasedOnIndex(baseValueAnnotations, compoundAnnotations, arguments))
              }
              value.apply(null,
                extractBasedOnIndex(valueAnnotations, compoundAnnotations, arguments));
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
    extendedCtor.prototype = extensibleDirectivePrototype
    extendedCtor.extendWith = this.extendWith
    extendedCtor.scopeKeysAdded = partialDirective.scope ? _.keys(partialDirective.scope) : []
    return extendedCtor
  }

  /*
   * The array arr1 should be a subset of arr2; the length of arr2 should equal that of targetArr.
   *
   * This function gets the indices in arr2 that correspond to elements of arr1, and extracts the
   * elements of targetArr that correspond to those indices.
   */
  var extractBasedOnIndex = function(arr1, arr2, targetArr) {
    return _.map(arr1, function(elt) {
      return targetArr[_.indexOf(arr2, elt)]
    })
  }

  return extensibleDirectiveCtor
})
