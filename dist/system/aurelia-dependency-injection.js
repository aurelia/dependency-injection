System.register(['core-js', 'aurelia-metadata', 'aurelia-logging'], function (_export) {
  'use strict';

  var core, Metadata, Decorators, AggregateError, TransientRegistration, SingletonRegistration, Resolver, Lazy, All, Optional, Parent, ClassActivator, FactoryActivator, badKeyError, emptyParameters, Container;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  _export('autoinject', autoinject);

  _export('inject', inject);

  _export('registration', registration);

  _export('transient', transient);

  _export('singleton', singleton);

  _export('instanceActivator', instanceActivator);

  _export('factory', factory);

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function test() {}

  function autoinject(potentialTarget) {
    var deco = function deco(target) {
      target.inject = Metadata.getOwn(Metadata.paramTypes, target) || emptyParameters;
    };

    return potentialTarget ? deco(potentialTarget) : deco;
  }

  function inject() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target) {
      target.inject = rest;
    };
  }

  function registration(value) {
    return function (target) {
      Metadata.define(Metadata.registration, value, target);
    };
  }

  function transient(key) {
    return registration(new TransientRegistration(key));
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
  }

  function instanceActivator(value) {
    return function (target) {
      Metadata.define(Metadata.instanceActivator, value, target);
    };
  }

  function factory() {
    return instanceActivator(FactoryActivator.instance);
  }

  return {
    setters: [function (_coreJs) {
      core = _coreJs;
    }, function (_aureliaMetadata) {
      Metadata = _aureliaMetadata.Metadata;
      Decorators = _aureliaMetadata.Decorators;
    }, function (_aureliaLogging) {
      AggregateError = _aureliaLogging.AggregateError;
    }],
    execute: function () {
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
          var registerInChild = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

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
        _inherits(Lazy, _Resolver);

        function Lazy(key) {
          _classCallCheck(this, Lazy);

          _Resolver.call(this);
          this.key = key;
        }

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
        _inherits(All, _Resolver2);

        function All(key) {
          _classCallCheck(this, All);

          _Resolver2.call(this);
          this.key = key;
        }

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
        _inherits(Optional, _Resolver3);

        function Optional(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, Optional);

          _Resolver3.call(this);
          this.key = key;
          this.checkParent = checkParent;
        }

        Optional.prototype.get = function get(container) {
          if (container.hasHandler(this.key, this.checkParent)) {
            return container.get(this.key);
          }

          return null;
        };

        Optional.of = function of(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          return new Optional(key, checkParent);
        };

        return Optional;
      })(Resolver);

      _export('Optional', Optional);

      Parent = (function (_Resolver4) {
        _inherits(Parent, _Resolver4);

        function Parent(key) {
          _classCallCheck(this, Parent);

          _Resolver4.call(this);
          this.key = key;
        }

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

      badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';

      Metadata.registration = 'aurelia:registration';
      Metadata.instanceActivator = 'aurelia:instance-activator';

      if (!test.name) {
        Object.defineProperty(Function.prototype, 'name', {
          get: function get() {
            var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];

            Object.defineProperty(this, 'name', { value: name });
            return name;
          }
        });
      }

      emptyParameters = Object.freeze([]);

      _export('emptyParameters', emptyParameters);

      Container = (function () {
        function Container(constructionInfo) {
          _classCallCheck(this, Container);

          this.constructionInfo = constructionInfo || new Map();
          this.entries = new Map();
          this.root = this;
        }

        Container.prototype.makeGlobal = function makeGlobal() {
          Container.instance = this;
          return this;
        };

        Container.prototype.registerInstance = function registerInstance(key, instance) {
          this.registerHandler(key, function (x) {
            return instance;
          });
        };

        Container.prototype.registerTransient = function registerTransient(key, fn) {
          fn = fn || key;
          this.registerHandler(key, function (x) {
            return x.invoke(fn);
          });
        };

        Container.prototype.registerSingleton = function registerSingleton(key, fn) {
          var singleton = null;
          fn = fn || key;
          this.registerHandler(key, function (x) {
            return singleton || (singleton = x.invoke(fn));
          });
        };

        Container.prototype.autoRegister = function autoRegister(fn, key) {
          var registration = undefined;

          if (fn === null || fn === undefined) {
            throw new Error(badKeyError);
          }

          if (typeof fn === 'function') {
            registration = Metadata.get(Metadata.registration, fn);

            if (registration !== undefined) {
              registration.register(this, key || fn, fn);
            } else {
              this.registerSingleton(key || fn, fn);
            }
          } else {
            this.registerInstance(fn, fn);
          }
        };

        Container.prototype.autoRegisterAll = function autoRegisterAll(fns) {
          var i = fns.length;
          while (i--) {
            this.autoRegister(fns[i]);
          }
        };

        Container.prototype.registerHandler = function registerHandler(key, handler) {
          this._getOrCreateEntry(key).push(handler);
        };

        Container.prototype.unregister = function unregister(key) {
          this.entries['delete'](key);
        };

        Container.prototype.get = function get(key) {
          var entry = undefined;

          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          if (key === Container) {
            return this;
          }

          if (key instanceof Resolver) {
            return key.get(this);
          }

          entry = this.entries.get(key);

          if (entry !== undefined) {
            return entry[0](this);
          }

          if (this.parent) {
            return this.parent.get(key);
          }

          this.autoRegister(key);
          entry = this.entries.get(key);

          return entry[0](this);
        };

        Container.prototype.getAll = function getAll(key) {
          var _this2 = this;

          var entry = undefined;

          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          entry = this.entries.get(key);

          if (entry !== undefined) {
            return entry.map(function (x) {
              return x(_this2);
            });
          }

          if (this.parent) {
            return this.parent.getAll(key);
          }

          return [];
        };

        Container.prototype.hasHandler = function hasHandler(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
        };

        Container.prototype.createChild = function createChild() {
          var childContainer = new Container(this.constructionInfo);
          childContainer.parent = this;
          childContainer.root = this.root;
          return childContainer;
        };

        Container.prototype.invoke = function invoke(fn, deps) {
          var info = undefined;
          var i = undefined;
          var ii = undefined;
          var keys = undefined;
          var args = undefined;

          try {
            info = this._getOrCreateConstructionInfo(fn);
            keys = info.keys;
            args = new Array(keys.length);

            for (i = 0, ii = keys.length; i < ii; ++i) {
              args[i] = this.get(keys[i]);
            }

            if (deps !== undefined) {
              args = args.concat(deps);
            }

            return info.activator.invoke(fn, args);
          } catch (e) {
            var activatingText = info && info.activator instanceof ClassActivator ? 'instantiating' : 'invoking';
            var message = 'Error ' + activatingText + ' ' + fn.name + '.';
            if (i < ii) {
              message += ' The argument at index ' + i + ' (key:' + keys[i] + ') could not be satisfied.';
            }

            message += ' Check the inner error for details.';

            throw new AggregateError(message, e, true);
          }
        };

        Container.prototype._getOrCreateEntry = function _getOrCreateEntry(key) {
          var entry = undefined;

          if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.  (Are you trying to inject something that doesn\'t exist with DI?)');
          }

          entry = this.entries.get(key);

          if (entry === undefined) {
            entry = [];
            this.entries.set(key, entry);
          }

          return entry;
        };

        Container.prototype._getOrCreateConstructionInfo = function _getOrCreateConstructionInfo(fn) {
          var info = this.constructionInfo.get(fn);

          if (info === undefined) {
            info = this._createConstructionInfo(fn);
            this.constructionInfo.set(fn, info);
          }

          return info;
        };

        Container.prototype._createConstructionInfo = function _createConstructionInfo(fn) {
          var info = { activator: Metadata.getOwn(Metadata.instanceActivator, fn) || ClassActivator.instance };

          if (fn.inject !== undefined) {
            if (typeof fn.inject === 'function') {
              info.keys = fn.inject();
            } else {
              info.keys = fn.inject;
            }

            return info;
          }

          info.keys = Metadata.getOwn(Metadata.paramTypes, fn) || emptyParameters;
          return info;
        };

        return Container;
      })();

      _export('Container', Container);

      Decorators.configure.simpleDecorator('autoinject', autoinject);
      Decorators.configure.parameterizedDecorator('inject', inject);
      Decorators.configure.parameterizedDecorator('registration', registration);
      Decorators.configure.parameterizedDecorator('transient', transient);
      Decorators.configure.parameterizedDecorator('singleton', singleton);
      Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
      Decorators.configure.parameterizedDecorator('factory', factory);
    }
  };
});