requires:
karma + jasmine, coffee preprocessor for tests, angular mocks
angular, underscore  - includes 1.2.21 and 1.6.0, resp


use case: complex directives where services are not DRY, and using require is not enough
because you need modular link functions too.
write directives in modular way without necessarily creating lots of directives as
require mechanism would require.



our use case: chart hierarchy
base chart service that contained boilerplate, then data service that handled async code, then charts -
common class for bar chart and histogram, then individual.


restrictions:
no link function or pre-link function, return post-link from compile instead
all isolate scope

how it works:
extend with extendWith, then finally instantiate - result is a DDO
