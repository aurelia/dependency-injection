System.register(['core-js', './container'], function (_export) {
  var core, Container, TransientRegistration, SingletonRegistration, Resolver, Lazy, All, Optional, Parent, ClassActivator, FactoryActivator;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  return {
    setters: [function (_coreJs) {
      core = _coreJs['default'];
    }, function (_container) {
      Container = _container.Container;
    }],
    execute: function () {
      'use strict';

      TransientRegistration = (function () {
        function TransientRegistration(key) {
          _classCallCheck(this, TransientRegistration);

          this.key = key;
        }

        TransientRegistration.prototype.register = function register(container, key, fn) {
          container.registerTransient(this.key || key, fn);
        };

        return TransientRegistration;
      })();

      _export('TransientRegistration', TransientRegistration);

      SingletonRegistration = (function () {
        function SingletonRegistration(keyOrRegisterInChild) {
          var registerInChild = arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, SingletonRegistration);

          if (typeof keyOrRegisterInChild === 'boolean') {
            this.registerInChild = keyOrRegisterInChild;
          } else {
            this.key = keyOrRegisterInChild;
            this.registerInChild = registerInChild;
          }
        }

        SingletonRegistration.prototype.register = function register(container, key, fn) {
          var destination = this.registerInChild ? container : container.root;
          destination.registerSingleton(this.key || key, fn);
        };

        return SingletonRegistration;
      })();

      _export('SingletonRegistration', SingletonRegistration);

      Resolver = (function () {
        function Resolver() {
          _classCallCheck(this, Resolver);
        }

        Resolver.prototype.get = function get(container) {
          throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
        };

        return Resolver;
      })();

      _export('Resolver', Resolver);

      Lazy = (function (_Resolver) {
        function Lazy(key) {
          _classCallCheck(this, Lazy);

          _Resolver.call(this);
          this.key = key;
        }

        _inherits(Lazy, _Resolver);

        Lazy.prototype.get = function get(container) {
          var _this = this;

          return function () {
            return container.get(_this.key);
          };
        };

        Lazy.of = function of(key) {
          return new Lazy(key);
        };

        return Lazy;
      })(Resolver);

      _export('Lazy', Lazy);

      All = (function (_Resolver2) {
        function All(key) {
          _classCallCheck(this, All);

          _Resolver2.call(this);
          this.key = key;
        }

        _inherits(All, _Resolver2);

        All.prototype.get = function get(container) {
          return container.getAll(this.key);
        };

        All.of = function of(key) {
          return new All(key);
        };

        return All;
      })(Resolver);

      _export('All', All);

      Optional = (function (_Resolver3) {
        function Optional(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, Optional);

          _Resolver3.call(this);
          this.key = key;
          this.checkParent = checkParent;
        }

        _inherits(Optional, _Resolver3);

        Optional.prototype.get = function get(container) {
          if (container.hasHandler(this.key, this.checkParent)) {
            return container.get(this.key);
          }

          return null;
        };

        Optional.of = function of(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];

          return new Optional(key, checkParent);
        };

        return Optional;
      })(Resolver);

      _export('Optional', Optional);

      Parent = (function (_Resolver4) {
        function Parent(key) {
          _classCallCheck(this, Parent);

          _Resolver4.call(this);
          this.key = key;
        }

        _inherits(Parent, _Resolver4);

        Parent.prototype.get = function get(container) {
          return container.parent ? container.parent.get(this.key) : null;
        };

        Parent.of = function of(key) {
          return new Parent(key);
        };

        return Parent;
      })(Resolver);

      _export('Parent', Parent);

      ClassActivator = (function () {
        function ClassActivator() {
          _classCallCheck(this, ClassActivator);
        }

        ClassActivator.prototype.invoke = function invoke(fn, args) {
          return Reflect.construct(fn, args);
        };

        _createClass(ClassActivator, null, [{
          key: 'instance',
          value: new ClassActivator(),
          enumerable: true
        }]);

        return ClassActivator;
      })();

      _export('ClassActivator', ClassActivator);

      FactoryActivator = (function () {
        function FactoryActivator() {
          _classCallCheck(this, FactoryActivator);
        }

        FactoryActivator.prototype.invoke = function invoke(fn, args) {
          return fn.apply(undefined, args);
        };

        _createClass(FactoryActivator, null, [{
          key: 'instance',
          value: new FactoryActivator(),
          enumerable: true
        }]);

        return FactoryActivator;
      })();

      _export('FactoryActivator', FactoryActivator);
    }
  };
});