# DDO: Directive Definition Object, cf.
# http://docs.angularjs.org/api/ng/service/$compile

describe "The modular directive constructor service", ->

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

    partialDdo = null
    extendedModularDirectiveCtor = null
    linkCalls = controllerCalls = null

    beforeEach ->

      linkCalls = []
      controllerCalls = []

      partialDdo =
        scope:     key1: 1
        compile:   () -> (str) -> linkCalls.push "base: " + str
        controller:(serviceName1) ->
          arguments.whichController = "base"
          controllerCalls.push arguments
        template:  "firstTemplate"

      extendedModularDirectiveCtor = ModularDirectiveCtor.extendWith partialDdo

    it "returns a modular directive constructor", ->

      expect(new extendedModularDirectiveCtor).toEqual jasmine.any Object
      expect(extendedModularDirectiveCtor.extendWith).toBeDefined()


    it "tracks the partial DDO used to extend it", ->

      expect(extendedModularDirectiveCtor.wasExtendedWith).toEqual partialDdo


    describe "when passed a partial DDO with an isolate scope object", ->

      it "extends the base isolate scope object", ->

        secondPartialDdo = scope: key2: 2

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.scope).toEqual key1: 1, key2: 2


    describe "when passed a partial DDO with a link function", ->

      it "throws because this is not supported", ->

        secondPartialDdo = link: () ->

        willThrow = () ->
          twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo

        expect(willThrow).toThrow()


    describe "when passed a partial DDO with a compile function", ->

      it "concatenates the link functions, with the base function called first", ->

        secondPartialDdo =
          compile: () -> (str) -> linkCalls.push "extension: " + str

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        concatenatedLinkFct = twiceExtendedModularDdo.compile()
        concatenatedLinkFct "foo"

        expect(linkCalls).toEqual ["base: foo", "extension: foo"]


    describe "when passed a partial DDO with a controller function", ->

      it "concatenates the link controllers, with the base controller called first", ->

        secondPartialDdo =
          controller: () ->
            arguments.whichController = "extension"
            controllerCalls.push arguments

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        concatenatedControllerFct = twiceExtendedModularDdo.controller "foo"

        expect(controllerCalls[0].whichController).toEqual "base"
        expect(controllerCalls[1].whichController).toEqual "extension"


      it "annotates concatenated controllers with all dependencies", ->

        secondPartialDdo = controller: (serviceName2) ->

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.controller.$inject).toContain "serviceName1"
        expect(twiceExtendedModularDdo.controller.$inject).toContain "serviceName2"


      it "calls constituent controllers only with the dependencies they asked for", ->

        secondPartialDdo =
          controller: (serviceName2) ->
            arguments.whichController = "extension"
            controllerCalls.push arguments
        service1 = {name: "serviceName1"}
        service2 = {name: "serviceName2"}
        service3 = {name: "serviceName3"}

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor
        twiceExtendedModularDdo.controller(fakeScope, service1, service2)

        expect(controllerCalls[0]).toEqual {0: service1}
        expect(controllerCalls[1]).toEqual {0: service2}


    describe "when passed a partial DDO with some other DDO field", ->

      it "overwrites the field in the extended DDO", ->

        secondPartialDdo = template: "secondTemplate"

        twiceExtendedCtor = extendedModularDirectiveCtor.extendWith secondPartialDdo
        twiceExtendedModularDdo = new twiceExtendedCtor

        expect(twiceExtendedModularDdo.template).toEqual "secondTemplate"

