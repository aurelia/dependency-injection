define(['exports', 'core-js'], function (exports, _coreJs) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

  var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var Registration = (function () {
    function Registration() {
      _classCallCheck(this, Registration);
    }

    _createClass(Registration, [{
      key: 'register',
      value: function register(container, key, fn) {
        throw new Error('A custom Registration must implement register(container, key, fn).');
      }
    }]);

    return Registration;
  })();

  exports.Registration = Registration;

  var TransientRegistration = (function (_Registration) {
    function TransientRegistration(key) {
      _classCallCheck(this, TransientRegistration);

      _get(Object.getPrototypeOf(TransientRegistration.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(TransientRegistration, _Registration);

    _createClass(TransientRegistration, [{
      key: 'register',
      value: function register(container, key, fn) {
        container.registerTransient(this.key || key, fn);
      }
    }]);

    return TransientRegistration;
  })(Registration);

  exports.TransientRegistration = TransientRegistration;

  var SingletonRegistration = (function (_Registration2) {
    function SingletonRegistration(keyOrRegisterInChild) {
      var registerInChild = arguments[1] === undefined ? false : arguments[1];

      _classCallCheck(this, SingletonRegistration);

      _get(Object.getPrototypeOf(SingletonRegistration.prototype), 'constructor', this).call(this);

      if (typeof keyOrRegisterInChild === 'boolean') {
        this.registerInChild = keyOrRegisterInChild;
      } else {
        this.key = keyOrRegisterInChild;
        this.registerInChild = registerInChild;
      }
    }

    _inherits(SingletonRegistration, _Registration2);

    _createClass(SingletonRegistration, [{
      key: 'register',
      value: function register(container, key, fn) {
        var destination = this.registerInChild ? container : container.root;
        destination.registerSingleton(this.key || key, fn);
      }
    }]);

    return SingletonRegistration;
  })(Registration);

  exports.SingletonRegistration = SingletonRegistration;

  var Resolver = (function () {
    function Resolver() {
      _classCallCheck(this, Resolver);
    }

    _createClass(Resolver, [{
      key: 'get',
      value: function get(container) {
        throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
      }
    }]);

    return Resolver;
  })();

  exports.Resolver = Resolver;

  var Lazy = (function (_Resolver) {
    function Lazy(key) {
      _classCallCheck(this, Lazy);

      _get(Object.getPrototypeOf(Lazy.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(Lazy, _Resolver);

    _createClass(Lazy, [{
      key: 'get',
      value: function get(container) {
        var _this = this;

        return function () {
          return container.get(_this.key);
        };
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new Lazy(key);
      }
    }]);

    return Lazy;
  })(Resolver);

  exports.Lazy = Lazy;

  var All = (function (_Resolver2) {
    function All(key) {
      _classCallCheck(this, All);

      _get(Object.getPrototypeOf(All.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(All, _Resolver2);

    _createClass(All, [{
      key: 'get',
      value: function get(container) {
        return container.getAll(this.key);
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new All(key);
      }
    }]);

    return All;
  })(Resolver);

  exports.All = All;

  var Optional = (function (_Resolver3) {
    function Optional(key) {
      var checkParent = arguments[1] === undefined ? false : arguments[1];

      _classCallCheck(this, Optional);

      _get(Object.getPrototypeOf(Optional.prototype), 'constructor', this).call(this);
      this.key = key;
      this.checkParent = checkParent;
    }

    _inherits(Optional, _Resolver3);

    _createClass(Optional, [{
      key: 'get',
      value: function get(container) {
        if (container.hasHandler(this.key, this.checkParent)) {
          return container.get(this.key);
        }

        return null;
      }
    }], [{
      key: 'of',
      value: function of(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];

        return new Optional(key, checkParent);
      }
    }]);

    return Optional;
  })(Resolver);

  exports.Optional = Optional;

  var Parent = (function (_Resolver4) {
    function Parent(key) {
      _classCallCheck(this, Parent);

      _get(Object.getPrototypeOf(Parent.prototype), 'constructor', this).call(this);
      this.key = key;
    }

    _inherits(Parent, _Resolver4);

    _createClass(Parent, [{
      key: 'get',
      value: function get(container) {
        return container.parent ? container.parent.get(this.key) : null;
      }
    }], [{
      key: 'of',
      value: function of(key) {
        return new Parent(key);
      }
    }]);

    return Parent;
  })(Resolver);

  exports.Parent = Parent;

  var InstanceActivator = (function () {
    function InstanceActivator() {
      _classCallCheck(this, InstanceActivator);
    }

    _createClass(InstanceActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        throw new Error('A custom Activator must implement invoke(fn, args).');
      }
    }]);

    return InstanceActivator;
  })();

  exports.InstanceActivator = InstanceActivator;

  var ClassActivator = (function (_InstanceActivator) {
    function ClassActivator() {
      _classCallCheck(this, ClassActivator);

      if (_InstanceActivator != null) {
        _InstanceActivator.apply(this, arguments);
      }
    }

    _inherits(ClassActivator, _InstanceActivator);

    _createClass(ClassActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        return Reflect.construct(fn, args);
      }
    }]);

    return ClassActivator;
  })(InstanceActivator);

  exports.ClassActivator = ClassActivator;

  var FactoryActivator = (function (_InstanceActivator2) {
    function FactoryActivator() {
      _classCallCheck(this, FactoryActivator);

      if (_InstanceActivator2 != null) {
        _InstanceActivator2.apply(this, arguments);
      }
    }

    _inherits(FactoryActivator, _InstanceActivator2);

    _createClass(FactoryActivator, [{
      key: 'invoke',
      value: function invoke(fn, args) {
        return fn.apply(undefined, args);
      }
    }]);

    return FactoryActivator;
  })(InstanceActivator);

  exports.FactoryActivator = FactoryActivator;
});