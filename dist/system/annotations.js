"use strict";

System.register([], function (_export) {
  var _slice, _inherits, Inject, Registration, Transient, Singleton, Resolver, Lazy, All, Optional, Parent;
  return {
    setters: [],
    execute: function () {
      _slice = Array.prototype.slice;
      _inherits = function (child, parent) {
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

      Inject = function Inject() {
        var keys = _slice.call(arguments);

        this.keys = keys;
      };

      _export("Inject", Inject);

      Registration = function Registration() {};

      Registration.prototype.register = function (container, key, fn) {
        throw new Error("A custom Registration must implement register(container, key, fn).");
      };

      _export("Registration", Registration);

      Transient = (function () {
        var _Registration = Registration;
        var Transient = function Transient(key) {
          this.key = key;
        };

        _inherits(Transient, _Registration);

        Transient.prototype.register = function (container, key, fn) {
          container.registerTransient(this.key || key, fn);
        };

        return Transient;
      })();
      _export("Transient", Transient);

      Singleton = (function () {
        var _Registration2 = Registration;
        var Singleton = function Singleton(key) {
          this.key = key;
        };

        _inherits(Singleton, _Registration2);

        Singleton.prototype.register = function (container, key, fn) {
          container.registerSingleton(this.key || key, fn);
        };

        return Singleton;
      })();
      _export("Singleton", Singleton);

      Resolver = function Resolver() {};

      Resolver.prototype.get = function (container) {
        throw new Error("A custom Resolver must implement get(container) and return the resolved instance(s).");
      };

      _export("Resolver", Resolver);

      Lazy = (function () {
        var _Resolver = Resolver;
        var Lazy = function Lazy(key) {
          this.key = key;
        };

        _inherits(Lazy, _Resolver);

        Lazy.prototype.get = function (container) {
          var _this = this;
          return function () {
            return container.get(_this.key);
          };
        };

        Lazy.of = function (key) {
          return new Lazy(key);
        };

        return Lazy;
      })();
      _export("Lazy", Lazy);

      All = (function () {
        var _Resolver2 = Resolver;
        var All = function All(key) {
          this.key = key;
        };

        _inherits(All, _Resolver2);

        All.prototype.get = function (container) {
          return container.getAll(this.key);
        };

        All.of = function (key) {
          return new All(key);
        };

        return All;
      })();
      _export("All", All);

      Optional = (function () {
        var _Resolver3 = Resolver;
        var Optional = function Optional(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];
          this.key = key;
          this.checkParent = checkParent;
        };

        _inherits(Optional, _Resolver3);

        Optional.prototype.get = function (container) {
          if (container.hasHandler(this.key, this.checkParent)) {
            return container.get(this.key);
          }

          return null;
        };

        Optional.of = function (key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];
          return new Optional(key, checkParent);
        };

        return Optional;
      })();
      _export("Optional", Optional);

      Parent = (function () {
        var _Resolver4 = Resolver;
        var Parent = function Parent(key) {
          this.key = key;
        };

        _inherits(Parent, _Resolver4);

        Parent.prototype.get = function (container) {
          return container.parent ? container.parent.get(this.key) : null;
        };

        Parent.of = function (key) {
          return new Parent(key);
        };

        return Parent;
      })();
      _export("Parent", Parent);
    }
  };
});