describe "the abstract directive service", ->

  ModularDirectiveCtor = null

  beforeEach ->
    module "insample.modular_directives"
    inject (_ModularDirectiveCtor_) ->
      ModularDirectiveCtor = _ModularDirectiveCtor_

  it "returns a constructor", ->
    expect(new ModularDirectiveCtor).toEqual jasmine.any Object

  # it "instantiates an object whose fields are all permitted", ->
  #   permittedFields = [
  #     "priority",
  #     "template",
  #     "templateUrl",
  #     "replace",
  #     "transclude",
  #     "restrict",
  #     "scope",
  #     "controller",
  #     "require",
  #     "compile",
  #     "link"
  #   ]
  #   abstractDirective = new abstractDirectiveCtor
  #   ### We intentionally iterate over all inhertied fields too. ###
  #   for key, value of abstractDirective
  #     expect(permittedFields).toContain key

  # describe "when extended", ->

  #   linkCalls = controllerCalls = null
  #   extendedAbstractDirectiveCtor = null

  #   beforeEach ->
  #     linkCalls = []
  #     controllerCalls = []
  #     firstExtensionObj =
  #       scope:     key1: 1
  #       compile:   () -> (str) -> linkCalls.push "base: " + str
  #       controller:(service1) -> controllerCalls.push arguments
  #       restrict:  "a"
  #     extendedAbstractDirectiveCtor = abstractDirectiveCtor.extendWith firstExtensionObj

  #   it "returns a constructor", ->
  #     expect(new extendedAbstractDirectiveCtor).toEqual jasmine.any Object

  #   it "extends object-valued keys in the objects it instantiates", ->
  #     secondExtensionObj = scope: key2: 2
  #     twiceExtendedCtor = extendedAbstractDirectiveCtor.extendWith secondExtensionObj
  #     twiceExtendedAbstractDirective = new twiceExtendedCtor
  #     expect(twiceExtendedAbstractDirective.scope).toEqual key1: 1, key2: 2

  #   it "overwrites string valued keys in the objects it instantiates", ->
  #     secondExtensionObj = restrict: "b"
  #     twiceExtendedCtor = extendedAbstractDirectiveCtor.extendWith secondExtensionObj
  #     twiceExtendedAbstractDirective = new twiceExtendedCtor
  #     expect(twiceExtendedAbstractDirective.restrict).toBe "b"

  #   it "concatenates calls to function valued keys, with the base function called first", ->
  #     secondExtensionObj =
  #       compile: () -> (str) -> linkCalls.push "extension: " + str
  #     twiceExtendedCtor = extendedAbstractDirectiveCtor.extendWith secondExtensionObj

  #     twiceExtendedAbstractDirective = new twiceExtendedCtor
  #     linkFct = twiceExtendedAbstractDirective.compile()
  #     linkFct("foo")
  #     expect(linkCalls).toEqual ["base: foo", "extension: foo"]

  #   it "annotates compound controllers with the right dependencies", ->
  #     secondExtensionObj = controller: (service2) ->
  #     twiceExtendedCtor = extendedAbstractDirectiveCtor.extendWith secondExtensionObj
  #     twiceExtendedAbstractDirective = new twiceExtendedCtor
  #     expect(twiceExtendedAbstractDirective.controller.$inject).toContain "service1"
  #     expect(twiceExtendedAbstractDirective.controller.$inject).toContain "service2"

  #   it "calls constituent controllers only with the dependencies they expect", ->
  #     secondExtensionObj = controller: (service2) -> controllerCalls.push arguments
  #     fakeScope = {name: "fakeScope"}
  #     service1 = {name: "service1"}
  #     service2 = {name: "service2"}

  #     twiceExtendedCtor = extendedAbstractDirectiveCtor.extendWith secondExtensionObj
  #     twiceExtendedAbstractDirective = new twiceExtendedCtor
  #     twiceExtendedAbstractDirective.controller(fakeScope, service1, service2)

  #     expect(controllerCalls[0]).toEqual {0: service1}
  #     expect(controllerCalls[1]).toEqual {0: service2}
