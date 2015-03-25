System.register([], function (_export) {
  var _inherits, _prototypeProperties, _classCallCheck, Registration, Transient, Singleton, Resolver, Lazy, All, Optional, Parent, Factory;

  return {
    setters: [],
    execute: function () {
      "use strict";

      _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

      _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

      _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

      /**
      * An abstract annotation used to allow functions/classes to indicate how they should be registered with the container.
      *
      * @class Registration
      * @constructor
      */
      Registration = _export("Registration", (function () {
        function Registration() {
          _classCallCheck(this, Registration);
        }

        _prototypeProperties(Registration, null, {
          register: {
            /**
            * Called by the container to allow custom registration logic for the annotated function/class.
            *
            * @method register
            * @param {Container} container The container to register with.
            * @param {Object} key The key to register as.
            * @param {Object} fn The function to register (target of the annotation).
            */

            value: function register(container, key, fn) {
              throw new Error("A custom Registration must implement register(container, key, fn).");
            },
            writable: true,
            configurable: true
          }
        });

        return Registration;
      })());

      /**
      * An annotation used to allow functions/classes to indicate that they should be registered as transients with the container.
      *
      * @class Transient
      * @constructor
      * @extends Registration
      * @param {Object} [key] The key to register as.
      */
      Transient = _export("Transient", (function (Registration) {
        function Transient(key) {
          _classCallCheck(this, Transient);

          this.key = key;
        }

        _inherits(Transient, Registration);

        _prototypeProperties(Transient, null, {
          register: {

            /**
            * Called by the container to register the annotated function/class as transient.
            *
            * @method register
            * @param {Container} container The container to register with.
            * @param {Object} key The key to register as.
            * @param {Object} fn The function to register (target of the annotation).
            */

            value: function register(container, key, fn) {
              container.registerTransient(this.key || key, fn);
            },
            writable: true,
            configurable: true
          }
        });

        return Transient;
      })(Registration));

      /**
      * An annotation used to allow functions/classes to indicate that they should be registered as singletons with the container.
      *
      * @class Singleton
      * @constructor
      * @extends Registration
      * @param {Object} [key] The key to register as.
      */
      Singleton = _export("Singleton", (function (Registration) {
        function Singleton(keyOrRegisterInChild) {
          var registerInChild = arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, Singleton);

          if (typeof keyOrRegisterInChild === "boolean") {
            this.registerInChild = keyOrRegisterInChild;
          } else {
            this.key = keyOrRegisterInChild;
            this.registerInChild = registerInChild;
          }
        }

        _inherits(Singleton, Registration);

        _prototypeProperties(Singleton, null, {
          register: {

            /**
            * Called by the container to register the annotated function/class as a singleton.
            *
            * @method register
            * @param {Container} container The container to register with.
            * @param {Object} key The key to register as.
            * @param {Object} fn The function to register (target of the annotation).
            */

            value: function register(container, key, fn) {
              var destination = this.registerInChild ? container : container.root;
              destination.registerSingleton(this.key || key, fn);
            },
            writable: true,
            configurable: true
          }
        });

        return Singleton;
      })(Registration));

      /**
      * An abstract annotation used to allow functions/classes to specify custom dependency resolution logic.
      *
      * @class Resolver
      * @constructor
      */
      Resolver = _export("Resolver", (function () {
        function Resolver() {
          _classCallCheck(this, Resolver);
        }

        _prototypeProperties(Resolver, null, {
          get: {
            /**
            * Called by the container to allow custom resolution of dependencies for a function/class.
            *
            * @method get
            * @param {Container} container The container to resolve from.
            * @return {Object} Returns the resolved object.
            */

            value: function get(container) {
              throw new Error("A custom Resolver must implement get(container) and return the resolved instance(s).");
            },
            writable: true,
            configurable: true
          }
        });

        return Resolver;
      })());

      /**
      * An annotation used to allow functions/classes to specify lazy resolution logic.
      *
      * @class Lazy
      * @constructor
      * @extends Resolver
      * @param {Object} key The key to lazily resolve.
      */
      Lazy = _export("Lazy", (function (Resolver) {
        function Lazy(key) {
          _classCallCheck(this, Lazy);

          this.key = key;
        }

        _inherits(Lazy, Resolver);

        _prototypeProperties(Lazy, {
          of: {

            /**
            * Creates a Lazy Resolver for the supplied key.
            *
            * @method of
            * @static
            * @param {Object} key The key to lazily resolve.
            * @return {Lazy} Returns an insance of Lazy for the key.
            */

            value: function of(key) {
              return new Lazy(key);
            },
            writable: true,
            configurable: true
          }
        }, {
          get: {

            /**
            * Called by the container to lazily resolve the dependency into a lazy locator function.
            *
            * @method get
            * @param {Container} container The container to resolve from.
            * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
            */

            value: function get(container) {
              var _this = this;

              return function () {
                return container.get(_this.key);
              };
            },
            writable: true,
            configurable: true
          }
        });

        return Lazy;
      })(Resolver));

      /**
      * An annotation used to allow functions/classes to specify resolution of all matches to a key.
      *
      * @class All
      * @constructor
      * @extends Resolver
      * @param {Object} key The key to lazily resolve all matches for.
      */
      All = _export("All", (function (Resolver) {
        function All(key) {
          _classCallCheck(this, All);

          this.key = key;
        }

        _inherits(All, Resolver);

        _prototypeProperties(All, {
          of: {

            /**
            * Creates an All Resolver for the supplied key.
            *
            * @method of
            * @static
            * @param {Object} key The key to resolve all instances for.
            * @return {All} Returns an insance of All for the key.
            */

            value: function of(key) {
              return new All(key);
            },
            writable: true,
            configurable: true
          }
        }, {
          get: {

            /**
            * Called by the container to resolve all matching dependencies as an array of instances.
            *
            * @method get
            * @param {Container} container The container to resolve from.
            * @return {Object[]} Returns an array of all matching instances.
            */

            value: function get(container) {
              return container.getAll(this.key);
            },
            writable: true,
            configurable: true
          }
        });

        return All;
      })(Resolver));

      /**
      * An annotation used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
      *
      * @class Optional
      * @constructor
      * @extends Resolver
      * @param {Object} key The key to optionally resolve for.
      * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
      */
      Optional = _export("Optional", (function (Resolver) {
        function Optional(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, Optional);

          this.key = key;
          this.checkParent = checkParent;
        }

        _inherits(Optional, Resolver);

        _prototypeProperties(Optional, {
          of: {

            /**
            * Creates an Optional Resolver for the supplied key.
            *
            * @method of
            * @static
            * @param {Object} key The key to optionally resolve for.
            * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
            * @return {Optional} Returns an insance of Optional for the key.
            */

            value: function of(key) {
              var checkParent = arguments[1] === undefined ? false : arguments[1];

              return new Optional(key, checkParent);
            },
            writable: true,
            configurable: true
          }
        }, {
          get: {

            /**
            * Called by the container to provide optional resolution of the key.
            *
            * @method get
            * @param {Container} container The container to resolve from.
            * @return {Object} Returns the instance if found; otherwise null.
            */

            value: function get(container) {
              if (container.hasHandler(this.key, this.checkParent)) {
                return container.get(this.key);
              }

              return null;
            },
            writable: true,
            configurable: true
          }
        });

        return Optional;
      })(Resolver));

      /**
      * An annotation used to inject the dependency from the parent container instead of the current one.
      *
      * @class Parent
      * @constructor
      * @extends Resolver
      * @param {Object} key The key to resolve from the parent container.
      */
      Parent = _export("Parent", (function (Resolver) {
        function Parent(key) {
          _classCallCheck(this, Parent);

          this.key = key;
        }

        _inherits(Parent, Resolver);

        _prototypeProperties(Parent, {
          of: {

            /**
            * Creates a Parent Resolver for the supplied key.
            *
            * @method of
            * @static
            * @param {Object} key The key to resolve.
            * @return {Parent} Returns an insance of Parent for the key.
            */

            value: function of(key) {
              return new Parent(key);
            },
            writable: true,
            configurable: true
          }
        }, {
          get: {

            /**
            * Called by the container to load the dependency from the parent container
            *
            * @method get
            * @param {Container} container The container to resolve the parent from.
            * @return {Function} Returns the matching instance from the parent container
            */

            value: function get(container) {
              return container.parent ? container.parent.get(this.key) : null;
            },
            writable: true,
            configurable: true
          }
        });

        return Parent;
      })(Resolver));

      /**
      * An annotation used to indicate that a particular function is a factory rather than a constructor.
      *
      * @class Factory
      * @constructor
      */
      Factory = _export("Factory", function Factory() {
        _classCallCheck(this, Factory);
      });
    }
  };
});