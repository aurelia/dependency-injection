define(["exports"], function (exports) {
  "use strict";

  var _slice = Array.prototype.slice;
  var _extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype, {
      constructor: {
        value: child,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    child.__proto__ = parent;
  };

  var Inject = function Inject() {
    var keys = _slice.call(arguments);

    this.keys = keys;
  };

  exports.Inject = Inject;
  var Registration = (function () {
    var Registration = function Registration() {};

    Registration.prototype.register = function (container, key, fn) {
      throw new Error("A custom Registration must implement register(container, key, fn).");
    };

    return Registration;
  })();

  exports.Registration = Registration;
  var Transient = (function (Registration) {
    var Transient = function Transient(key) {
      this.key = key;
    };

    _extends(Transient, Registration);

    Transient.prototype.register = function (container, key, fn) {
      container.registerTransient(this.key || key, fn);
    };

    return Transient;
  })(Registration);

  exports.Transient = Transient;
  var Singleton = (function (Registration) {
    var Singleton = function Singleton(key) {
      this.key = key;
    };

    _extends(Singleton, Registration);

    Singleton.prototype.register = function (container, key, fn) {
      container.registerSingleton(this.key || key, fn);
    };

    return Singleton;
  })(Registration);

  exports.Singleton = Singleton;
  var Resolver = (function () {
    var Resolver = function Resolver() {};

    Resolver.prototype.get = function (container) {
      throw new Error("A custom Resolver must implement get(container) and return the resolved instance(s).");
    };

    return Resolver;
  })();

  exports.Resolver = Resolver;
  var Lazy = (function (Resolver) {
    var Lazy = function Lazy(key) {
      this.key = key;
    };

    _extends(Lazy, Resolver);

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
  })(Resolver);

  exports.Lazy = Lazy;
  var All = (function (Resolver) {
    var All = function All(key) {
      this.key = key;
    };

    _extends(All, Resolver);

    All.prototype.get = function (container) {
      return container.getAll(this.key);
    };

    All.of = function (key) {
      return new All(key);
    };

    return All;
  })(Resolver);

  exports.All = All;
});