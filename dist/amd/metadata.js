define(["exports"], function (exports) {
  "use strict";

  var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

  var Registration = exports.Registration = (function () {
    function Registration() {}

    _prototypeProperties(Registration, null, {
      register: {
        value: function register(container, key, fn) {
          throw new Error("A custom Registration must implement register(container, key, fn).");
        },
        writable: true,
        configurable: true
      }
    });

    return Registration;
  })();
  var Transient = exports.Transient = (function (Registration) {
    function Transient(key) {
      this.key = key;
    }

    _inherits(Transient, Registration);

    _prototypeProperties(Transient, null, {
      register: {
        value: function register(container, key, fn) {
          container.registerTransient(this.key || key, fn);
        },
        writable: true,
        configurable: true
      }
    });

    return Transient;
  })(Registration);
  var Singleton = exports.Singleton = (function (Registration) {
    function Singleton(key) {
      this.key = key;
    }

    _inherits(Singleton, Registration);

    _prototypeProperties(Singleton, null, {
      register: {
        value: function register(container, key, fn) {
          container.registerSingleton(this.key || key, fn);
        },
        writable: true,
        configurable: true
      }
    });

    return Singleton;
  })(Registration);
  var Resolver = exports.Resolver = (function () {
    function Resolver() {}

    _prototypeProperties(Resolver, null, {
      get: {
        value: function get(container) {
          throw new Error("A custom Resolver must implement get(container) and return the resolved instance(s).");
        },
        writable: true,
        configurable: true
      }
    });

    return Resolver;
  })();
  var Lazy = exports.Lazy = (function (Resolver) {
    function Lazy(key) {
      this.key = key;
    }

    _inherits(Lazy, Resolver);

    _prototypeProperties(Lazy, {
      of: {
        value: function of(key) {
          return new Lazy(key);
        },
        writable: true,
        configurable: true
      }
    }, {
      get: {
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
  })(Resolver);
  var All = exports.All = (function (Resolver) {
    function All(key) {
      this.key = key;
    }

    _inherits(All, Resolver);

    _prototypeProperties(All, {
      of: {
        value: function of(key) {
          return new All(key);
        },
        writable: true,
        configurable: true
      }
    }, {
      get: {
        value: function get(container) {
          return container.getAll(this.key);
        },
        writable: true,
        configurable: true
      }
    });

    return All;
  })(Resolver);
  var Optional = exports.Optional = (function (Resolver) {
    function Optional(key) {
      var checkParent = arguments[1] === undefined ? false : arguments[1];
      this.key = key;
      this.checkParent = checkParent;
    }

    _inherits(Optional, Resolver);

    _prototypeProperties(Optional, {
      of: {
        value: function of(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];
          return new Optional(key, checkParent);
        },
        writable: true,
        configurable: true
      }
    }, {
      get: {
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
  })(Resolver);
  var Parent = exports.Parent = (function (Resolver) {
    function Parent(key) {
      this.key = key;
    }

    _inherits(Parent, Resolver);

    _prototypeProperties(Parent, {
      of: {
        value: function of(key) {
          return new Parent(key);
        },
        writable: true,
        configurable: true
      }
    }, {
      get: {
        value: function get(container) {
          return container.parent ? container.parent.get(this.key) : null;
        },
        writable: true,
        configurable: true
      }
    });

    return Parent;
  })(Resolver);
  exports.__esModule = true;
});