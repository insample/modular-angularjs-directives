# Modular AngularJS Directives

Modular directives let you write AngularJS directives in an incremental, modular, and naturally hierarchical way.


## Why/when are they useful?

If you have directives that share a lot of code, the standard Angular way of DRYing up your code is encapsulating shared code into a service. This can cause an excess of helper services and associated boilerplate in your directives, resulting in less readable, bloated directives.

Modular directives are an alternative paradigm that allows you to define directives incrementally and hierarchically by allowing one modular directive to extend another. This results in directive code that is more modular, readable, testable, and allows you to write directives in a naturally
hierarchical way.


### Example use case

Modular directives are not globally superior to helper services, but in the right situation they can help a lot.

At InSample, we wrote our own visualization library, which included several charts. Charts share a lot of functionality related to asynchronously fetching data, responsive resizing, rendering titles and axes, etc. The size and complexity of this shared code was high, and using helper services resulted in an excess of boilerplate inside our directives. Using modular directives allowed us to organize shared chart code into a hierarchy, making our directives much leaner without compromising readability or testability.

For example, the part of the chart hierarchy that includes the histogram and bar chart looks like this:

1. A base modular directive that contains chart rendering boilerplate;
2. an extension that adds code to asynchronously fetch data;
3. an extension that encapsulates common data preprocessing logic;
4. branching from that, the histogram and bar chart directives.


## How do they work?

In AngularJS, a directive is defined with a [Directive Definition Object](https://docs.angularjs.org/api/ng/service/$compile) (DDO), which is a plain javascript object whose values configure the directive. A modular directive is a constructor function that instantiate a DDO and is extensible.

Extending a modular directive means that controller and link functions are called in sequence, and isolate scope object are extended (in the object sense). For details, see the comments in `src/modular-directive-ctor.js`.

This extensibility makes it possible to create "directive hierarchies". Once a modular directive
has been sufficiently extended, generating a directive is trivial: simply instantiate a DDO and use it to declare a new directive.


## How do you use and test them?

See the demo `demo/demo.html`. The file `demo/js/services.js` defines a simple modular directive hierarchy. The file `demo/test/abstract-demo-widget-spec.coffee` demonstrates how to test a modular directive. Both are extensively commented.


## Caveats

A modular directive must have an isolate scope.

Modular directives do not support pre-link functions. Link functions must be returned by compile
functions; standalone link functions defined on the `link` key are not supported.

## Dependencies

Dependencies are **not** managed directly (see below), but for reference they are:

1. [AngularJS 1.2.21](http://angularjs.org/)
2. [Underscore.js 1.6.0](http://underscorejs.org/)
3. [Jasmine 2.0](http://jasmine.github.io/)

All tests are written in [Coffeescript](http://coffeescript.org/).

## Installation

### Requirements

1. [Bower](http://www.bower.io) for dependency management.
2. [Karma](http://karma-runner.github.io/), with Jasmine plugin and Coffeescript preprocessor, for running tests.

### Set up

1. Install Bower and Karma (with `karma-jasmine` and `karma-coffee-preprocessor`).
2. Call `bower install` inside the project root directory to fetch dependencies.
3. Start Karma inside the project root directory: `karma start karma.conf.js`
