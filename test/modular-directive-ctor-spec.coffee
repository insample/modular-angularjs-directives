# DDO: Directive Definition Object, cf.
# http://docs.angularjs.org/api/ng/service/$compile

describe "The modular directive constructor", ->

  ModularDirectiveCtor = null

  beforeEach ->
    module "insample.modular_directives"
    inject (_ModularDirectiveCtor_) ->
      ModularDirectiveCtor = _ModularDirectiveCtor_

  it "returns a constructor", ->

    expect(new ModularDirectiveCtor).toEqual jasmine.any Object


  it "instantiates an object whose keys are all permitted", ->

    # Directive Definition Object keys as of AngularJS 1.3.0
    permittedKeys = [
      "multiElement",
      "priority",
      "terminal",
      "scope",
      "controller",
      "require",
      "controllerAs",
      "restrict",
      "type",
      "template",
      "templateUrl",
      "transclude",
      "compile",
      # Link key is NOT supported.
      # "link"
    ]
    modularDdo = new ModularDirectiveCtor

    ### We intentionally iterate over all inhertied fields too. ###
    for key, value of modularDdo
      expect(permittedKeys).toContain key


  describe "has an extendWith function that", ->

    extendedModularDirectiveCtor = null
    linkCalls = controllerCalls = null
    partialDdo = secondPartialDdo = null

    beforeEach ->

      linkCalls = []
      controllerCalls = []

      partialDdo =
        scope:     key1: 1
        compile:   () -> (str) -> linkCalls.push "base: " + str
        controller:(serviceName1) ->
          controllerCalls.push {
            arguments: arguments,
            whichController: "base"
          }
        template:  "firstTemplate"

      extendedModularDirectiveCtor = ModularDirectiveCtor.extendWith partialDdo

    it "returns a modular directive constructor", ->

      expect(new extendedModularDirectiveCtor).toEqual jasmine.any Object
      expect(extendedModularDirectiveCtor.extendWith).toBeDefined()


    it "tracks the partial DDO used to extend it", ->

      expect(extendedModularDirectiveCtor.wasExtendedWith).toEqual partialDdo


    describe "when passed a partial DDO with an isolate scope object", ->

      beforeEach ->
        secondPartialDdo = scope: key2: 2

      it "extends the base isolate scope object", ->

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.scope).toEqual key1: 1, key2: 2


    describe "when passed a partial DDO with a link function", ->

      beforeEach ->
        secondPartialDdo = link: () ->

      it "throws because this is not supported", ->

        willThrow = () ->
          twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo

        expect(willThrow).toThrow()


    describe "when passed a partial DDO with a compile function", ->

      beforeEach ->
        secondPartialDdo =
          compile: () -> (str) -> linkCalls.push "extension: " + str

      it "concatenates the link functions, with the base function called first", ->

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        concatenatedLinkFct = twiceExtendedModularDdo.compile()
        concatenatedLinkFct "foo"

        expect(linkCalls).toEqual ["base: foo", "extension: foo"]


    describe "when passed a partial DDO with a controller function", ->

      fakeScope = service1 = service2 = null
      twiceExtendedModularDdo = null

      beforeEach ->

        fakeScope = {name: "$scope"}
        service1 = {name: "serviceName1"}
        service2 = {name: "serviceName2"}

        secondPartialDdo =
          controller: (serviceName2) ->
            controllerCalls.push {
              arguments: arguments,
              whichController: "extension"
            }

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

      it "concatenates the controllers, with the base controller called first", ->

        twiceExtendedModularDdo.controller fakeScope, service1, service2

        expect(controllerCalls[0].whichController).toEqual "base"
        expect(controllerCalls[1].whichController).toEqual "extension"


      it "annotates concatenated controllers with all dependencies", ->

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.controller.$inject).toContain "serviceName1"
        expect(twiceExtendedModularDdo.controller.$inject).toContain "serviceName2"


      it "calls constituent controllers only with the dependencies they asked for", ->

        twiceExtendedModularDdo.controller fakeScope, service1, service2

        expect(controllerCalls[0].arguments[0]).toEqual service1
        expect(controllerCalls[0].arguments.length).toEqual 1

        expect(controllerCalls[1].arguments[0]).toEqual service2
        expect(controllerCalls[1].arguments.length).toEqual 1


    describe "when passed a partial DDO with some other DDO field", ->

      beforeEach ->
        secondPartialDdo = template: "secondTemplate"

      it "overwrites the field in the extended DDO", ->

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.template).toEqual "secondTemplate"

