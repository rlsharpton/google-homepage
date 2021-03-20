!function (name, context, definition) {
    if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
      module.exports = definition();
    } else if (typeof define === 'function' && typeof define.amd === 'object') {
      define(function () {
        return definition();
      });
    } else {
      context[name] = definition();
    }
  }('chai', this, function () {
  
    function require(p) {
      var path = require.resolve(p)
        , mod = require.modules[path];
      if (!mod) throw new Error('failed to require "' + p + '"');
      if (!mod.exports) {
        mod.exports = {};
        mod.call(mod.exports, mod, mod.exports, require.relative(path));
      }
      return mod.exports;
    }
  
    require.modules = {};
  
    require.resolve = function (path) {
      var orig = path
        , reg = path + '.js'
        , index = path + '/index.js';
      return require.modules[reg] && reg
        || require.modules[index] && index
        || orig;
    };
  
    require.register = function (path, fn) {
      require.modules[path] = fn;
    };
  
    require.relative = function (parent) {
      return function (p) {
        if ('.' != p.charAt(0)) return require(p);
  
        var path = parent.split('/')
          , segs = p.split('/');
        path.pop();
  
        for (var i = 0; i < segs.length; i++) {
          var seg = segs[i];
          if ('..' == seg) path.pop();
          else if ('.' != seg) path.push(seg);
        }
  
        return require(path.join('/'));
      };
    };
  
    require.alias = function (from, to) {
      var fn = require.modules[from];
      require.modules[to] = fn;
    };
  
  
    require.register("chai.js", function (module, exports, require) {
      /*!
       * chai
       * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
       * MIT Licensed
       */
  
      var used = []
        , exports = module.exports = {};
  
      /*!
       * Chai version
       */
  
      exports.version = '1.5.0';
  
      /*!
       * Primary `Assertion` prototype
       */
  
      exports.Assertion = require('./chai/assertion');
  
      /*!
       * Assertion Error
       */
  
      exports.AssertionError = require('./chai/error');
  
      /*!
       * Utils for plugins (not exported)
       */
  
      var util = require('./chai/utils');
  
      /**
       * # .use(function)
       *
       * Provides a way to extend the internals of Chai
       *
       * @param {Function}
       * @returns {this} for chaining
       * @api public
       */
  
      exports.use = function (fn) {
        if (!~used.indexOf(fn)) {
          fn(this, util);
          used.push(fn);
        }
  
        return this;
      };
  
      /*!
       * Core Assertions
       */
  
      var core = require('./chai/core/assertions');
      exports.use(core);
  
      /*!
       * Expect interface
       */
  
      var expect = require('./chai/interface/expect');
      exports.use(expect);
  
      /*!
       * Should interface
       */
  
      var should = require('./chai/interface/should');
      exports.use(should);
  
      /*!
       * Assert interface
       */
  
      var assert = require('./chai/interface/assert');
      exports.use(assert);
  
    }); // module: chai.js
  
    require.register("chai/assertion.js", function (module, exports, require) {
      /*!
       * chai
       * http://chaijs.com
       * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
       * MIT Licensed
       */
  
      /*!
       * Module dependencies.
       */
  
      var AssertionError = require('./error')
        , util = require('./utils')
        , flag = util.flag;
  
      /*!
       * Module export.
       */
  
      module.exports = Assertion;
  
  
      /*!
       * Assertion Constructor
       *
       * Creates object for chaining.
       *
       * @api private
       */
  
      function Assertion(obj, msg, stack) {
        flag(this, 'ssfi', stack || arguments.callee);
        flag(this, 'object', obj);
        flag(this, 'message', msg);
      }
  
      /*!
        * ### Assertion.includeStack
        *
        * User configurable property, influences whether stack trace
        * is included in Assertion error message. Default of false
        * suppresses stack trace in the error message
        *
        *     Assertion.includeStack = true;  // enable stack on error
        *
        * @api public
        */
  
      Assertion.includeStack = false;
  
      /*!
       * ### Assertion.showDiff
       *
       * User configurable property, influences whether or not
       * the `showDiff` flag should be included in the thrown
       * AssertionErrors. `false` will always be `false`; `true`
       * will be true when the assertion has requested a diff
       * be shown.
       *
       * @api public
       */
  
      Assertion.showDiff = true;
  
      Assertion.addProperty = function (name, fn) {
        util.addProperty(this.prototype, name, fn);
      };
  
      Assertion.addMethod = function (name, fn) {
        util.addMethod(this.prototype, name, fn);
      };
  
      Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
        util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
      };
  
      Assertion.overwriteProperty = function (name, fn) {
        util.overwriteProperty(this.prototype, name, fn);
      };
  
      Assertion.overwriteMethod = function (name, fn) {
        util.overwriteMethod(this.prototype, name, fn);
      };
  
      /*!
       * ### .assert(expression, message, negateMessage, expected, actual)
       *
       * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
       *
       * @name assert
       * @param {Philosophical} expression to be tested
       * @param {String} message to display if fails
       * @param {String} negatedMessage to display if negated expression fails
       * @param {Mixed} expected value (remember to check for negation)
       * @param {Mixed} actual (optional) will default to `this.obj`
       * @api private
       */
  
      Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
        var ok = util.test(this, arguments);
        if (true !== showDiff) showDiff = false;
        if (true !== Assertion.showDiff) showDiff = false;
  
        if (!ok) {
          var msg = util.getMessage(this, arguments)
            , actual = util.getActual(this, arguments);
          throw new AssertionError({
            message: msg
            , actual: actual
            , expected: expected
            , stackStartFunction: (Assertion.includeStack) ? this.assert : flag(this, 'ssfi')
            , showDiff: showDiff
          });
        }
      };
  
      /*!
       * ### ._obj
       *
       * Quick reference to stored `actual` value for plugin developers.
       *
       * @api private
       */
  
      Object.defineProperty(Assertion.prototype, '_obj',
        {
          get: function () {
            return flag(this, 'object');
          }
          , set: function (val) {
            flag(this, 'object', val);
          }
        });
  
    }); // module: chai/assertion.js
  
    require.register("chai/core/assertions.js", function (module, exports, require) {
      /*!
       * chai
       * http://chaijs.com
       * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
       * MIT Licensed
       */
  
      module.exports = function (chai, _) {
        var Assertion = chai.Assertion
          , toString = Object.prototype.toString
          , flag = _.flag;
  
        /**
         * ### Language Chains
         *
         * The following are provide as chainable getters to
         * improve the readability of your assertions. They
         * do not provide an testing capability unless they
         * have been overwritten by a plugin.
         *
         * **Chains**
         *
         * - to
         * - be
         * - been
         * - is
         * - that
         * - and
         * - have
         * - with
         * - at
         * - of
         *
         * @name language chains
         * @api public
         */
  
        ['to', 'be', 'been'
          , 'is', 'and', 'have'
          , 'with', 'that', 'at'
          , 'of'].forEach(function (chain) {
            Assertion.addProperty(chain, function () {
              return this;
            });
          });
  
        /**
         * ### .not
         *
         * Negates any of assertions following in the chain.
         *
         *     expect(foo).to.not.equal('bar');
         *     expect(goodFn).to.not.throw(Error);
         *     expect({ foo: 'baz' }).to.have.property('foo')
         *       .and.not.equal('bar');
         *
         * @name not
         * @api public
         */
  
        Assertion.addProperty('not', function () {
          flag(this, 'negate', true);
        });
  
        /**
         * ### .deep
         *
         * Sets the `deep` flag, later used by the `equal` and
         * `property` assertions.
         *
         *     expect(foo).to.deep.equal({ bar: 'baz' });
         *     expect({ foo: { bar: { baz: 'quux' } } })
         *       .to.have.deep.property('foo.bar.baz', 'quux');
         *
         * @name deep
         * @api public
         */
  
        Assertion.addProperty('deep', function () {
          flag(this, 'deep', true);
        });
  
        /**
         * ### .a(type)
         *
         * The `a` and `an` assertions are aliases that can be
         * used either as language chains or to assert a value's
         * type.
         *
         *     // typeof
         *     expect('test').to.be.a('string');
         *     expect({ foo: 'bar' }).to.be.an('object');
         *     expect(null).to.be.a('null');
         *     expect(undefined).to.be.an('undefined');
         *
         *     // language chain
         *     expect(foo).to.be.an.instanceof(Foo);
         *
         * @name a
         * @alias an
         * @param {String} type
         * @param {String} message _optional_
         * @api public
         */
  
        function an(type, msg) {
          if (msg) flag(this, 'message', msg);
          type = type.toLowerCase();
          var obj = flag(this, 'object')
            , article = ~['a', 'e', 'i', 'o', 'u'].indexOf(type.charAt(0)) ? 'an ' : 'a ';
  
          this.assert(
            type === _.type(obj)
            , 'expected #{this} to be ' + article + type
            , 'expected #{this} not to be ' + article + type
          );
        }
  
        Assertion.addChainableMethod('an', an);
        Assertion.addChainableMethod('a', an);
  
        /**
         * ### .include(value)
         *
         * The `include` and `contain` assertions can be used as either property
         * based language chains or as methods to assert the inclusion of an object
         * in an array or a substring in a string. When used as language chains,
         * they toggle the `contain` flag for the `keys` assertion.
         *
         *     expect([1,2,3]).to.include(2);
         *     expect('foobar').to.contain('foo');
         *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
         *
         * @name include
         * @alias contain
         * @param {Object|String|Number} obj
         * @param {String} message _optional_
         * @api public
         */
  
        function includeChainingBehavior() {
          flag(this, 'contains', true);
        }
  
        function include(val, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object')
          this.assert(
            ~obj.indexOf(val)
            , 'expected #{this} to include ' + _.inspect(val)
            , 'expected #{this} to not include ' + _.inspect(val));
        }
  
        Assertion.addChainableMethod('include', include, includeChainingBehavior);
        Assertion.addChainableMethod('contain', include, includeChainingBehavior);
  
        /**
         * ### .ok
         *
         * Asserts that the target is truthy.
         *
         *     expect('everthing').to.be.ok;
         *     expect(1).to.be.ok;
         *     expect(false).to.not.be.ok;
         *     expect(undefined).to.not.be.ok;
         *     expect(null).to.not.be.ok;
         *
         * @name ok
         * @api public
         */
  
        Assertion.addProperty('ok', function () {
          this.assert(
            flag(this, 'object')
            , 'expected #{this} to be truthy'
            , 'expected #{this} to be falsy');
        });
  
        /**
         * ### .true
         *
         * Asserts that the target is `true`.
         *
         *     expect(true).to.be.true;
         *     expect(1).to.not.be.true;
         *
         * @name true
         * @api public
         */
  
        Assertion.addProperty('true', function () {
          this.assert(
            true === flag(this, 'object')
            , 'expected #{this} to be true'
            , 'expected #{this} to be false'
            , this.negate ? false : true
          );
        });
  
        /**
         * ### .false
         *
         * Asserts that the target is `false`.
         *
         *     expect(false).to.be.false;
         *     expect(0).to.not.be.false;
         *
         * @name false
         * @api public
         */
  
        Assertion.addProperty('false', function () {
          this.assert(
            false === flag(this, 'object')
            , 'expected #{this} to be false'
            , 'expected #{this} to be true'
            , this.negate ? true : false
          );
        });
  
        /**
         * ### .null
         *
         * Asserts that the target is `null`.
         *
         *     expect(null).to.be.null;
         *     expect(undefined).not.to.be.null;
         *
         * @name null
         * @api public
         */
  
        Assertion.addProperty('null', function () {
          this.assert(
            null === flag(this, 'object')
            , 'expected #{this} to be null'
            , 'expected #{this} not to be null'
          );
        });
  
        /**
         * ### .undefined
         *
         * Asserts that the target is `undefined`.
         *
         *      expect(undefined).to.be.undefined;
         *      expect(null).to.not.be.undefined;
         *
         * @name undefined
         * @api public
         */
  
        Assertion.addProperty('undefined', function () {
          this.assert(
            undefined === flag(this, 'object')
            , 'expected #{this} to be undefined'
            , 'expected #{this} not to be undefined'
          );
        });
  
        /**
         * ### .exist
         *
         * Asserts that the target is neither `null` nor `undefined`.
         *
         *     var foo = 'hi'
         *       , bar = null
         *       , baz;
         *
         *     expect(foo).to.exist;
         *     expect(bar).to.not.exist;
         *     expect(baz).to.not.exist;
         *
         * @name exist
         * @api public
         */
  
        Assertion.addProperty('exist', function () {
          this.assert(
            null != flag(this, 'object')
            , 'expected #{this} to exist'
            , 'expected #{this} to not exist'
          );
        });
  
  
        /**
         * ### .empty
         *
         * Asserts that the target's length is `0`. For arrays, it checks
         * the `length` property. For objects, it gets the count of
         * enumerable keys.
         *
         *     expect([]).to.be.empty;
         *     expect('').to.be.empty;
         *     expect({}).to.be.empty;
         *
         * @name empty
         * @api public
         */
  
        Assertion.addProperty('empty', function () {
          var obj = flag(this, 'object')
            , expected = obj;
  
          if (Array.isArray(obj) || 'string' === typeof object) {
            expected = obj.length;
          } else if (typeof obj === 'object') {
            expected = Object.keys(obj).length;
          }
  
          this.assert(
            !expected
            , 'expected #{this} to be empty'
            , 'expected #{this} not to be empty'
          );
        });
  
        /**
         * ### .arguments
         *
         * Asserts that the target is an arguments object.
         *
         *     function test () {
         *       expect(arguments).to.be.arguments;
         *     }
         *
         * @name arguments
         * @alias Arguments
         * @api public
         */
  
        function checkArguments() {
          var obj = flag(this, 'object')
            , type = Object.prototype.toString.call(obj);
          this.assert(
            '[object Arguments]' === type
            , 'expected #{this} to be arguments but got ' + type
            , 'expected #{this} to not be arguments'
          );
        }
  
        Assertion.addProperty('arguments', checkArguments);
        Assertion.addProperty('Arguments', checkArguments);
  
        /**
         * ### .equal(value)
         *
         * Asserts that the target is strictly equal (`===`) to `value`.
         * Alternately, if the `deep` flag is set, asserts that
         * the target is deeply equal to `value`.
         *
         *     expect('hello').to.equal('hello');
         *     expect(42).to.equal(42);
         *     expect(1).to.not.equal(true);
         *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
         *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
         *
         * @name equal
         * @alias equals
         * @alias eq
         * @alias deep.equal
         * @param {Mixed} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertEqual(val, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object');
          if (flag(this, 'deep')) {
            return this.eql(val);
          } else {
            this.assert(
              val === obj
              , 'expected #{this} to equal #{exp}'
              , 'expected #{this} to not equal #{exp}'
              , val
              , this._obj
              , true
            );
          }
        }
  
        Assertion.addMethod('equal', assertEqual);
        Assertion.addMethod('equals', assertEqual);
        Assertion.addMethod('eq', assertEqual);
  
        /**
         * ### .eql(value)
         *
         * Asserts that the target is deeply equal to `value`.
         *
         *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
         *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
         *
         * @name eql
         * @alias eqls
         * @param {Mixed} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertEql(obj, msg) {
          if (msg) flag(this, 'message', msg);
          this.assert(
            _.eql(obj, flag(this, 'object'))
            , 'expected #{this} to deeply equal #{exp}'
            , 'expected #{this} to not deeply equal #{exp}'
            , obj
            , this._obj
            , true
          );
        }
  
        Assertion.addMethod('eql', assertEql);
        Assertion.addMethod('eqls', assertEql);
  
        /**
         * ### .above(value)
         *
         * Asserts that the target is greater than `value`.
         *
         *     expect(10).to.be.above(5);
         *
         * Can also be used in conjunction with `length` to
         * assert a minimum length. The benefit being a
         * more informative error message than if the length
         * was supplied directly.
         *
         *     expect('foo').to.have.length.above(2);
         *     expect([ 1, 2, 3 ]).to.have.length.above(2);
         *
         * @name above
         * @alias gt
         * @alias greaterThan
         * @param {Number} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertAbove(n, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object');
          if (flag(this, 'doLength')) {
            new Assertion(obj, msg).to.have.property('length');
            var len = obj.length;
            this.assert(
              len > n
              , 'expected #{this} to have a length above #{exp} but got #{act}'
              , 'expected #{this} to not have a length above #{exp}'
              , n
              , len
            );
          } else {
            this.assert(
              obj > n
              , 'expected #{this} to be above ' + n
              , 'expected #{this} to be at most ' + n
            );
          }
        }
  
        Assertion.addMethod('above', assertAbove);
        Assertion.addMethod('gt', assertAbove);
        Assertion.addMethod('greaterThan', assertAbove);
  
        /**
         * ### .least(value)
         *
         * Asserts that the target is greater than or equal to `value`.
         *
         *     expect(10).to.be.at.least(10);
         *
         * Can also be used in conjunction with `length` to
         * assert a minimum length. The benefit being a
         * more informative error message than if the length
         * was supplied directly.
         *
         *     expect('foo').to.have.length.of.at.least(2);
         *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
         *
         * @name least
         * @alias gte
         * @param {Number} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertLeast(n, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object');
          if (flag(this, 'doLength')) {
            new Assertion(obj, msg).to.have.property('length');
            var len = obj.length;
            this.assert(
              len >= n
              , 'expected #{this} to have a length at least #{exp} but got #{act}'
              , 'expected #{this} to have a length below #{exp}'
              , n
              , len
            );
          } else {
            this.assert(
              obj >= n
              , 'expected #{this} to be at least ' + n
              , 'expected #{this} to be below ' + n
            );
          }
        }
  
        Assertion.addMethod('least', assertLeast);
        Assertion.addMethod('gte', assertLeast);
  
        /**
         * ### .below(value)
         *
         * Asserts that the target is less than `value`.
         *
         *     expect(5).to.be.below(10);
         *
         * Can also be used in conjunction with `length` to
         * assert a maximum length. The benefit being a
         * more informative error message than if the length
         * was supplied directly.
         *
         *     expect('foo').to.have.length.below(4);
         *     expect([ 1, 2, 3 ]).to.have.length.below(4);
         *
         * @name below
         * @alias lt
         * @alias lessThan
         * @param {Number} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertBelow(n, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object');
          if (flag(this, 'doLength')) {
            new Assertion(obj, msg).to.have.property('length');
            var len = obj.length;
            this.assert(
              len < n
              , 'expected #{this} to have a length below #{exp} but got #{act}'
              , 'expected #{this} to not have a length below #{exp}'
              , n
              , len
            );
          } else {
            this.assert(
              obj < n
              , 'expected #{this} to be below ' + n
              , 'expected #{this} to be at least ' + n
            );
          }
        }
  
        Assertion.addMethod('below', assertBelow);
        Assertion.addMethod('lt', assertBelow);
        Assertion.addMethod('lessThan', assertBelow);
  
        /**
         * ### .most(value)
         *
         * Asserts that the target is less than or equal to `value`.
         *
         *     expect(5).to.be.at.most(5);
         *
         * Can also be used in conjunction with `length` to
         * assert a maximum length. The benefit being a
         * more informative error message than if the length
         * was supplied directly.
         *
         *     expect('foo').to.have.length.of.at.most(4);
         *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
         *
         * @name most
         * @alias lte
         * @param {Number} value
         * @param {String} message _optional_
         * @api public
         */
  
        function assertMost(n, msg) {
          if (msg) flag(this, 'message', msg);
          var obj = flag(this, 'object');
          if (flag(this, 'doLength')) {
            new Assertion(obj, msg).to.have.property('length');
            var len = obj.length;
            this.assert(
              len <= n
              , 'expected #{this} to have a length at most #{exp} but got #{act}'
              , 'expected #{this} to have a length above #{exp}'
              , n
              , len
            );
          } else {
            this.assert(
              obj <= n
              , 'expected #{this} to be at most ' + n
              , 'expected #{this} to be above ' + n
            );
          }
        }
  
        Assertion.addMethod('most', assertMost);
        Assertion.addMethod('lte', assertMost);
  
        /**
         * ### .within(start, finish)
         *
         * Asserts that the target is within a range.
         *
         *     expect(7).to.be.within(5,10);
         *
         * Can also be used in conjunction with `length` to
         * assert a length range. The benefit being a
         * more informative error message than if the length
         * was supplied directly.
         *
         *     expect('foo').to.have.length.within(2,4);
         *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
         */