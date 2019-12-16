'use strict';
const SUPPORTED_NODE_VERSIONS = require('./package.json').engines.node;
const webpack = require('./.webpack.config.js');

const base = {
  // possible errors:
  // enforce 'for' loop update clause moving the counter in the right direction
  'for-direction': 'error',
  // disallow window alert / confirm / prompt calls
  'no-alert': 'error',
  // disallow comparing against -0
  'no-compare-neg-zero': 'error',
  // disallow use of console
  'no-console': 'error',
  // disallow constant expressions in conditions
  'no-constant-condition': ['error', { checkLoops: false }],
  // disallow control characters in regular expressions
  'no-control-regex': 'error',
  // disallow use of debugger
  'no-debugger': 'error',
  // disallow duplicate arguments in functions
  'no-dupe-args': 'error',
  // disallow duplicate keys when creating object literals
  'no-dupe-keys': 'error',
  // disallow a duplicate case label.
  'no-duplicate-case': 'error',
  // disallow else after a return in an if
  'no-else-return': 'error',
  // disallow empty statements
  'no-empty': 'error',
  // disallow the use of empty character classes in regular expressions
  'no-empty-character-class': 'error',
  // disallow unnecessary boolean casts
  'no-extra-boolean-cast': 'error',
  // disallow unnecessary semicolons
  'no-extra-semi': 'error',
  // disallow assigning to the exception in a catch block
  'no-ex-assign': 'error',
  // disallow overwriting functions written as function declarations
  'no-func-assign': 'error',
  // disallow invalid regular expression strings in the RegExp constructor
  'no-invalid-regexp': 'error',
  // disallow irregular whitespace outside of strings and comments
  'no-irregular-whitespace': 'error',
  // disallow characters which are made with multiple code points in character class syntax
  'no-misleading-character-class': 'error',
  // disallow the use of object properties of the global object (Math and JSON) as functions
  'no-obj-calls': 'error',
  // disallow use of Object.prototypes builtins directly
  'no-prototype-builtins': 'error',
  // disallow multiple spaces in a regular expression literal
  'no-regex-spaces': 'error',
  // disallow returning values from setters
  'no-setter-return': 'error',
  // disallow sparse arrays
  'no-sparse-arrays': 'error',
  // disallow template literal placeholder syntax in regular strings
  'no-template-curly-in-string': 'error',
  // avoid code that looks like two expressions but is actually one
  'no-unexpected-multiline': 'error',
  // disallow negation of the left operand of an in expression
  'no-unsafe-negation': 'error',
  // disallow comparisons with the value NaN
  'use-isnan': 'error',
  // disallow unreachable statements after a return, throw, continue, or break statement
  'no-unreachable': 'error',
  // ensure that the results of typeof are compared against a valid string
  'valid-typeof': 'error',

  // best practices:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': 'error',
  // encourages use of dot notation whenever possible
  'dot-notation': ['error', { allowKeywords: true }],
  // enforce newline before and after dot
  'dot-location': ['error', 'property'],
  // disallow use of arguments.caller or arguments.callee
  'no-caller': 'error',
  // disallow lexical declarations in case/default clauses
  'no-case-declarations': 'error',
  // disallow duplicate conditions in if-else-if chains
  'no-dupe-else-if': 'error',
  // disallow empty functions, except for standalone funcs/arrows
  'no-empty-function': 'error',
  // disallow empty destructuring patterns
  'no-empty-pattern': 'error',
  // disallow use of eval()
  'no-eval': 'error',
  // disallow adding to native types
  'no-extend-native': 'error',
  // disallow unnecessary function binding
  'no-extra-bind': 'error',
  // disallow unnecessary labels
  'no-extra-label': 'error',
  // disallow fallthrough of case statements
  'no-fallthrough': 'error',
  // disallow the use of leading or trailing decimal points in numeric literals
  'no-floating-decimal': 'error',
  // disallow reassignments of native objects
  'no-global-assign': 'error',
  // disallow use of eval()-like methods
  'no-implied-eval': 'error',
  // disallow usage of __iterator__ property
  'no-iterator': 'error',
  // disallow use of labels for anything other then loops and switches
  'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
  // disallow unnecessary nested blocks
  'no-lone-blocks': 'error',
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': 'error',
  // disallow use of multiple spaces
  'no-multi-spaces': ['error', { ignoreEOLComments: true }],
  // disallow use of multiline strings
  'no-multi-str': 'error',
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': 'error',
  // disallow use of new operator for Function object
  'no-new-func': 'error',
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': 'error',
  // disallow use of (old style) octal literals
  'no-octal': 'error',
  // disallow use of octal escape sequences in string literals, such as var foo = 'Copyright \251';
  'no-octal-escape': 'error',
  // disallow usage of __proto__ property
  'no-proto': 'error',
  // disallow declaring the same variable more then once
  'no-redeclare': 'error',
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': 'error',
  // disallow redundant return statements
  'no-useless-return': 'error',
  // disallow use of `javascript:` urls.
  'no-script-url': 'error',
  // disallow self assignment
  'no-self-assign': 'error',
  // disallow comparisons where both sides are exactly the same
  'no-self-compare': 'error',
  // disallow use of comma operator
  'no-sequences': 'error',
  // restrict what can be thrown as an exception
  'no-throw-literal': 'error',
  // disallow usage of expressions in statement position
  'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
  // disallow unused labels
  'no-unused-labels': 'error',
  // disallow unnecessary catch clauses
  'no-useless-catch': 'error',
  // disallow useless string concatenation
  'no-useless-concat': 'error',
  // disallow unnecessary string escaping
  'no-useless-escape': 'error',
  // disallow void operators
  'no-void': 'error',
  // disallow use of the with statement
  'no-with': 'error',
  // require use of the second argument for parseInt()
  radix: 'error',

  // variables:
  // disallow catch clause parameters from shadowing variables in the outer scope
  'no-catch-shadow': 'error',
  // disallow deletion of variables
  'no-delete-var': 'error',
  // disallow labels that share a name with a variable
  'no-label-var': 'error',
  // disallow declaration of variables already declared in the outer scope
  'no-shadow': 'error',
  // disallow shadowing of names such as arguments
  'no-shadow-restricted-names': 'error',
  // disallow use of undeclared variables unless mentioned in a /*global */ block
  'no-undef': ['error'],
  // disallow initializing variables to undefined
  'no-undef-init': 'error',
  // disallow declaration of variables that are not used in the code
  'no-unused-vars': ['error', { vars: 'local', args: 'after-used', ignoreRestSiblings: true }],

  // stylistic issues:
  // enforce spacing inside array brackets
  'array-bracket-spacing': ['error', 'never'],
  // enforce spacing inside single-line blocks
  'block-spacing': ['error', 'always'],
  // enforce one true brace style
  'brace-style': ['error', '1tbs', { allowSingleLine: true }],
  // require camel case names
  camelcase: ['error', { properties: 'never' }],
  // enforce trailing commas in multiline object literals
  'comma-dangle': ['error', 'always-multiline'],
  // enforce spacing after comma
  'comma-spacing': 'error',
  // enforce one true comma style
  'comma-style': ['error', 'last', { exceptions: { VariableDeclaration: true } }],
  // disallow padding inside computed properties
  'computed-property-spacing': ['error', 'never'],
  // enforce one newline at the end of files
  'eol-last': ['error', 'always'],
  // disallow space between function identifier and application
  'func-call-spacing': 'error',
  // this option sets a specific tab width for your code
  'indent-legacy': ['error', 2, { VariableDeclarator: 2, SwitchCase: 1 }],
  // require a space before & after certain keywords
  'keyword-spacing': ['error', { before: true, after: true }],
  // enforces spacing between keys and values in object literal properties
  'key-spacing': ['error', { beforeColon: false, afterColon: true }],
  // enforce consistent linebreak style
  'linebreak-style': ['error', 'unix'],
  // specify the maximum length of a line in your program
  'max-len': ['error', 120, 2],
  // enforce a maximum depth that callbacks can be nested
  'max-nested-callbacks': ['error', 4],
  // specify the maximum number of statement allowed in a function
  'max-statements': ['error', 40],
  // require a capital letter for constructors
  'new-cap': ['error', { newIsCap: true, capIsNew: false }],
  // require parentheses when invoking a constructor with no arguments
  'new-parens': 'error',
  // disallow if as the only statement in an else block
  'no-lonely-if': 'error',
  // disallow mixed spaces and tabs for indentation
  'no-mixed-spaces-and-tabs': 'error',
  // disallow multiple empty lines and only one newline at the end
  'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
  // disallow tabs
  'no-tabs': 'error',
  // disallow trailing whitespace at the end of lines
  'no-trailing-spaces': 'error',
  // disallow the use of boolean literals in conditional expressions and prefer `a || b` over `a ? a : b`
  'no-unneeded-ternary': ['error', { defaultAssignment: false }],
  // disallow whitespace before properties
  'no-whitespace-before-property': 'error',
  // enforce the location of single-line statements
  'nonblock-statement-body-position': ['error', 'beside'],
  // enforce spaces inside braces
  'object-curly-spacing': ['error', 'always'],
  // require newlines around variable declarations with initializations
  'one-var-declaration-per-line': ['error', 'initializations'],
  // enforce padding within blocks
  'padded-blocks': ['error', 'never'],
  // specify whether double or single quotes should be used
  quotes: ['error', 'single', 'avoid-escape'],
  // require or disallow use of quotes around object literal property names
  'quote-props': ['error', 'as-needed', { keywords: false }],
  // require or disallow use of semicolons instead of ASI
  semi: ['error', 'always'],
  // enforce spacing before and after semicolons
  'semi-spacing': 'error',
  // enforce location of semicolons
  'semi-style': ['error', 'last'],
  // require or disallow space before blocks
  'space-before-blocks': 'error',
  // require or disallow space before function opening parenthesis
  'space-before-function-paren': ['error', { anonymous: 'always', named: 'never' }],
  // require or disallow spaces inside parentheses
  'space-in-parens': 'error',
  // require spaces around operators
  'space-infix-ops': 'error',
  // Require or disallow spaces before/after unary operators
  'space-unary-ops': 'error',
  // require or disallow a space immediately following the // or /* in a comment
  'spaced-comment': ['error', 'always', { line: { exceptions: ['/'] }, block: { exceptions: ['*'] } }],
  // enforce spacing around colons of switch statements
  'switch-colon-spacing': 'error',
  // require or disallow the Unicode Byte Order Mark
  'unicode-bom': ['error', 'never'],

  // commonjs:
  // require require() calls to be placed at top-level module scope
  'global-require': 'error',
  // disallow require calls to be mixed with regular variable declarations
  'no-mixed-requires': ['error', { grouping: true, allowCall: false }],
  // disallow new operators with calls to require
  'no-new-require': 'error',
  // disallow string concatenation with `__dirname` and `__filename`
  'no-path-concat': 'error',

  // import:
  // ensure all imports appear before other statements
  'import/first': 'error',
  // forbid AMD imports
  'import/no-amd': 'error',
  // forbid cycle dependencies
  'import/no-cycle': ['error', { commonjs: true }],
  // ensure imports point to files / modules that can be resolved
  'import/no-unresolved': ['error', { commonjs: true }],
  // forbid import of modules using absolute paths
  'import/no-absolute-path': 'error',
  // forbid `require()` calls with expressions
  'import/no-dynamic-require': 'error',
  // disallow importing from the same path more than once
  'import/no-duplicates': 'error',
  // forbid a module from importing itself
  'import/no-self-import': 'error',
  // forbid useless path segments
  'import/no-useless-path-segments': 'error',

  // node:
  // enforce the style of file extensions in `import` declarations
  'node/file-extension-in-import': ['error', 'never'],
  // disallow the assignment to `exports`
  'node/no-exports-assign': 'error',

  // es6+:
  // require parentheses around arrow function arguments
  'arrow-parens': ['error', 'as-needed'],
  // enforce consistent spacing before and after the arrow in arrow functions
  'arrow-spacing': 'error',
  // enforce the location of arrow function bodies
  'implicit-arrow-linebreak': ['error', 'beside'],
  // disallow unnecessary computed property keys in object literals
  'no-useless-computed-key': 'error',
  // disallow unnecessary constructors
  'no-useless-constructor': 'error',
  // require let or const instead of var
  'no-var': 'error',
  // disallow renaming import, export, and destructured assignments to the same name
  'no-useless-rename': 'error',
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': 'error',
  // require using arrow functions for callbacks
  'prefer-arrow-callback': 'error',
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': ['error', { destructuring: 'all' }],
  // require destructuring from arrays and/or objects
  'prefer-destructuring': 'error',
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': 'error',
  // require template literals instead of string concatenation
  'prefer-template': 'error',
  // enforce spacing between rest and spread operators and their expressions
  'rest-spread-spacing': 'error',
  // require or disallow spacing around embedded expressions of template strings
  'template-curly-spacing': ['error', 'always'],

  // require strict mode directives
  strict: ['error', 'global'],

  // unicorn
  // enforce a specific parameter name in catch clauses
  'unicorn/catch-error-name': ['error', { name: 'error', caughtErrorsIgnorePattern: '^err' }],
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': 'error',
  // require escape sequences to use uppercase values
  'unicorn/escape-case': 'error',
  // enforce a case style for filenames
  'unicorn/filename-case': ['error', { case: 'kebabCase' }],
  // enforce importing index files with `.`
  'unicorn/import-index': 'error',
  // enforce specifying rules to disable in eslint-disable comments
  'unicorn/no-abusive-eslint-disable': 'error',
  // do not use leading/trailing space between `console.log` parameters
  'unicorn/no-console-spaces': 'error',
  // enforce the use of unicode escapes instead of hexadecimal escapes
  'unicorn/no-hex-escape': 'error',
  // disallow unreadable array destructuring
  'unicorn/no-unreadable-array-destructuring': 'error',
  // disallow unsafe regular expressions
  'unicorn/no-unsafe-regex': 'error',
  // disallow unused object properties
  'unicorn/no-unused-properties': 'error',
  // enforce lowercase identifier and uppercase value for number literals
  'unicorn/number-literal-case': 'error',
  // prefer `String#slice` over `String#{ substr, substring }`
  'unicorn/prefer-string-slice': 'error',
  // enforce the use of regex shorthands to improve readability
  'unicorn/regex-shorthand': 'error',

  // optimize regex literals
  'optimize-regex/optimize-regex': 'error',

  // sonarjs
  // merging collapsible if statements increases the code's readability
  'sonarjs/no-collapsible-if': 'error',
  // collection sizes and array length comparisons should make sense
  'sonarjs/no-collection-size-mischeck': 'error',
  // two branches in a conditional structure should not have exactly the same implementation
  'sonarjs/no-duplicated-branches': 'error',
  // collection elements should not be replaced unconditionally
  'sonarjs/no-element-overwrite': 'error',
  // function calls should not pass extra arguments
  'sonarjs/no-extra-arguments': 'error',
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': 'error',
  // boolean checks should not be inverted
  'sonarjs/no-inverted-boolean-check': 'error',
  // loops with at most one iteration should be refactored
  'sonarjs/no-one-iteration-loop': 'error',
  // boolean literals should not be redundant
  'sonarjs/no-redundant-boolean': 'error',
  // jump statements should not be redundant
  'sonarjs/no-redundant-jump': 'error',
  // conditionals should start on new lines
  'sonarjs/no-same-line-conditional': 'error',
  // collection and array contents should be used
  'sonarjs/no-unused-collection': 'error',
  // the output of functions that don't return anything should not be used
  'sonarjs/no-use-of-empty-return-value': 'error',
  // local variables should not be declared and then immediately returned or thrown
  'sonarjs/prefer-immediate-return': 'error',
  // object literal syntax should be used
  'sonarjs/prefer-object-literal': 'error',
  // return of boolean expressions should not be wrapped into an `if-then-else` statement
  'sonarjs/prefer-single-boolean-return': 'error',
  // a `while` loop should be used instead of a `for` loop with condition only
  'sonarjs/prefer-while': 'error',
};

const es3 = {
  // disallow trailing commas in multiline object literals
  'comma-dangle': ['error', 'never'],
  // encourages use of dot notation whenever possible
  'dot-notation': ['error', { allowKeywords: false }],
  // disallow function or variable declarations in nested blocks
  'no-inner-declarations': 'error',
  // require let or const instead of var
  'no-var': 'off',
  // require or disallow method and property shorthand syntax for object literals
  'object-shorthand': 'off',
  // require using arrow functions for callbacks
  'prefer-arrow-callback': 'off',
  // require const declarations for variables that are never reassigned after declared
  'prefer-const': 'off',
  // require destructuring from arrays and/or objects
  'prefer-destructuring': 'off',
  // prefer the exponentiation operator over `Math.pow()`
  'prefer-exponentiation-operator': 'off',
  // require template literals instead of string concatenation
  'prefer-template': 'off',
  // require or disallow use of quotes around object literal property names
  'quote-props': ['error', 'as-needed', { keywords: true }],
  // require strict mode directives
  strict: 'off',
};

const node = {
  // disallow deprecated APIs
  'node/no-deprecated-api': 'error',
  // disallow unsupported ECMAScript built-ins on the specified version
  'node/no-unsupported-features/es-builtins': ['error', { version: SUPPORTED_NODE_VERSIONS }],
  // disallow unsupported ECMAScript syntax on the specified version
  'node/no-unsupported-features/es-syntax': ['error', { version: SUPPORTED_NODE_VERSIONS }],
};

const tests = {
  // require strict mode directives
  strict: 'off',

  // relax for testing:
  // enforces return statements in callbacks of array's methods
  'array-callback-return': 'off',
  // specify the maximum length of a line in your program
  'max-len': ['error', 180, 2],
  // specify the maximum number of statement allowed in a function
  'max-statements': 'off',
  // disallow function declarations and expressions inside loop statements
  'no-loop-func': 'off',
  // disallow use of new operator when not part of the assignment or comparison
  'no-new': 'off',
  // disallow use of new operator for Function object
  'no-new-func': 'off',
  // disallows creating new instances of String, Number, and Boolean
  'no-new-wrappers': 'off',
  // restrict what can be thrown as an exception
  'no-throw-literal': 'off',
  // disallow usage of expressions in statement position
  'no-unused-expressions': 'off',
  // disallow unnecessary calls to `.call()` and `.apply()`
  'no-useless-call': 'off',
  // enforce passing a message value when throwing a built-in error
  'unicorn/error-message': 'off',
  // functions should not have identical implementations
  'sonarjs/no-identical-functions': 'off',
};

const qunit = {
  // ensure the correct number of assert arguments is used
  'qunit/assert-args': 'error',
  // forbid the use of assert.equal
  'qunit/no-assert-equal': 'error',
  // forbid binary logical expressions in assert arguments
  'qunit/no-assert-logical-expression': 'error',
  // forbid async calls in loops
  'qunit/no-async-in-loops': 'error',
  // forbid the use of asyncTest
  'qunit/no-async-test': 'error',
  // forbid commented tests
  'qunit/no-commented-tests': 'error',
  // forbid comparing relational expression to boolean in assertions
  'qunit/no-compare-relation-boolean': 'error',
  // prevent early return in a qunit test
  'qunit/no-early-return': 'error',
  // forbid the use of global qunit assertions
  'qunit/no-global-assertions': 'error',
  // forbid the use of global expect
  'qunit/no-global-expect': 'error',
  // forbid the use of global module / test / asyncTest
  'qunit/no-global-module-test': 'error',
  // forbid use of global stop / start
  'qunit/no-global-stop-start': 'error',
  // forbid identical test and module names
  'qunit/no-identical-names': 'error',
  // forbid use of QUnit.init
  'qunit/no-init': 'error',
  // forbid use of QUnit.jsDump
  'qunit/no-jsdump': 'error',
  // forbid equality comparisons in assert.{ok, notOk}
  'qunit/no-ok-equality': 'error',
  // forbid the use of QUnit.push
  'qunit/no-qunit-push': 'error',
  // forbid QUnit.start within tests or test hooks
  'qunit/no-qunit-start-in-tests': 'error',
  // forbid the use of QUnit.stop
  'qunit/no-qunit-stop': 'error',
  // forbid overwriting of QUnit logging callbacks
  'qunit/no-reassign-log-callbacks': 'error',
  // forbid use of QUnit.reset
  'qunit/no-reset': 'error',
  // forbid setup / teardown module hooks
  'qunit/no-setup-teardown': 'error',
  // forbid expect argument in QUnit.test
  'qunit/no-test-expect-argument': 'error',
  // forbid assert.throws() with block, string, and message
  'qunit/no-throws-string': 'error',
  // require that all async calls should be resolved in tests
  'qunit/resolve-async': 'error',
};

module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    node: true,
    worker: true,
  },
  plugins: [
    'import',
    'node',
    'optimize-regex',
    'qunit',
    'sonarjs',
    'unicorn',
  ],
  settings: {
    'import/resolver': {
      webpack: {
        config: webpack.options,
      },
    },
  },
  reportUnusedDisableDirectives: true,
  rules: base,
  overrides: [
    {
      files: [
        'packages/core-js/**',
        'packages/core-js-pure/**',
        'tests/promises-aplus/**',
        'tests/compat/**',
      ],
      parserOptions: {
        ecmaVersion: 3,
      },
      rules: es3,
    },
    {
      files: [
        'tests/helpers/**',
        'tests/pure/**',
        'tests/tests/**',
        'tests/wpt-url-resources/**',
        'tests/commonjs.js',
        'tests/commonjs-entries-content.js',
        'tests/targets-parser.js',
      ],
      parserOptions: {
        sourceType: 'module',
      },
      rules: tests,
    },
    {
      files: [
        'tests/helpers/**',
        'tests/pure/**',
        'tests/tests/**',
      ],
      env: {
        qunit: true,
      },
      rules: qunit,
    },
    {
      files: [
        'packages/core-js-builder/**',
        'packages/core-js-compat/**',
        'tests/commonjs.js',
        'tests/commonjs-entries-content.js',
        'tests/targets-parser.js',
        '.eslintrc.js',
        '.webpack.config.js',
        'babel.config.js',
        'Gruntfile.js',
      ],
      env: {
        es6: true,
      },
      rules: node,
    },
    {
      files: [
        'tests/tests/**',
        'tests/compat/**',
      ],
      env: {
        es6: true,
      },
      globals: {
        compositeKey: true,
        compositeSymbol: true,
        globalThis: true,
        queueMicrotask: true,
        AggregateError: true,
        AsyncIterator: true,
        Iterator: true,
        Observable: true,
      },
    },
  ],
};
