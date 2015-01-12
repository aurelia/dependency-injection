System.register([], function (_export) {
  "use strict";

  var _inherits, _prototypeProperties, Inject, Registration, Transient, Singleton, Resolver, Lazy, All, Optional, Parent;
  return {
    setters: [],
    execute: function () {
      _inherits = function (child, parent) {
        if (typeof parent !== "function" && parent !== null) {
          throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
        }
        child.prototype = Object.create(parent && parent.prototype, {
          constructor: {
            value: child,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
        if (parent) child.__proto__ = parent;
      };

      _prototypeProperties = function (child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
      };

      Inject = function Inject() {
        var keys = [];

        for (var _key = 0; _key < arguments.length; _key++) {
          keys[_key] = arguments[_key];
        }

        this.keys = keys;
      };

      _export("Inject", Inject);

      Registration = (function () {
        var Registration = function Registration() {};

        _prototypeProperties(Registration, null, {
          register: {
            value: function (container, key, fn) {
              throw new Error("A custom Registration must implement register(container, key, fn).");
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Registration;
      })();
      _export("Registration", Registration);

      Transient = (function (Registration) {
        var Transient = function Transient(key) {
          this.key = key;
        };

        _inherits(Transient, Registration);

        _prototypeProperties(Transient, null, {
          register: {
            value: function (container, key, fn) {
              container.registerTransient(this.key || key, fn);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Transient;
      })(Registration);
      _export("Transient", Transient);

      Singleton = (function (Registration) {
        var Singleton = function Singleton(key) {
          this.key = key;
        };

        _inherits(Singleton, Registration);

        _prototypeProperties(Singleton, null, {
          register: {
            value: function (container, key, fn) {
              container.registerSingleton(this.key || key, fn);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Singleton;
      })(Registration);
      _export("Singleton", Singleton);

      Resolver = (function () {
        var Resolver = function Resolver() {};

        _prototypeProperties(Resolver, null, {
          get: {
            value: function (container) {
              throw new Error("A custom Resolver must implement get(container) and return the resolved instance(s).");
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Resolver;
      })();
      _export("Resolver", Resolver);

      Lazy = (function (Resolver) {
        var Lazy = function Lazy(key) {
          this.key = key;
        };

        _inherits(Lazy, Resolver);

        _prototypeProperties(Lazy, {
          of: {
            value: function (key) {
              return new Lazy(key);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          get: {
            value: function (container) {
              var _this = this;
              return function () {
                return container.get(_this.key);
              };
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Lazy;
      })(Resolver);
      _export("Lazy", Lazy);

      All = (function (Resolver) {
        var All = function All(key) {
          this.key = key;
        };

        _inherits(All, Resolver);

        _prototypeProperties(All, {
          of: {
            value: function (key) {
              return new All(key);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          get: {
            value: function (container) {
              return container.getAll(this.key);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return All;
      })(Resolver);
      _export("All", All);

      Optional = (function (Resolver) {
        var Optional = function Optional(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];
          this.key = key;
          this.checkParent = checkParent;
        };

        _inherits(Optional, Resolver);

        _prototypeProperties(Optional, {
          of: {
            value: function (key) {
              var checkParent = arguments[1] === undefined ? false : arguments[1];
              return new Optional(key, checkParent);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          get: {
            value: function (container) {
              if (container.hasHandler(this.key, this.checkParent)) {
                return container.get(this.key);
              }

              return null;
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Optional;
      })(Resolver);
      _export("Optional", Optional);

      Parent = (function (Resolver) {
        var Parent = function Parent(key) {
          this.key = key;
        };

        _inherits(Parent, Resolver);

        _prototypeProperties(Parent, {
          of: {
            value: function (key) {
              return new Parent(key);
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        }, {
          get: {
            value: function (container) {
              return container.parent ? container.parent.get(this.key) : null;
            },
            writable: true,
            enumerable: true,
            configurable: true
          }
        });

        return Parent;
      })(Resolver);
      _export("Parent", Parent);
    }
  };
});