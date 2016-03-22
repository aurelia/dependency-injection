'use strict';

System.register(['aurelia-metadata', 'aurelia-pal'], function (_export, _context) {
  var protocol, metadata, AggregateError, _dec, _class, _dec2, _class2, _dec3, _class3, _dec4, _class4, _dec5, _class5, _dec6, _class6, _classInvokers, resolver, Lazy, All, Optional, Parent, StrategyResolver, Factory, FactoryInvoker, TransientRegistration, SingletonRegistration, badKeyError, _emptyParameters, resolverDecorates, InvocationHandler, classInvokers, Container;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
    var i = staticDependencies.length;
    var args = new Array(i);

    while (i--) {
      args[i] = container.get(staticDependencies[i]);
    }

    if (dynamicDependencies !== undefined) {
      args = args.concat(dynamicDependencies);
    }

    return Reflect.construct(fn, args);
  }

  function getDependencies(f) {
    if (!f.hasOwnProperty('inject')) {
      return [];
    }

    if (typeof f.inject === 'function') {
      return f.inject();
    }

    return f.inject;
  }

  return {
    setters: [function (_aureliaMetadata) {
      protocol = _aureliaMetadata.protocol;
      metadata = _aureliaMetadata.metadata;
    }, function (_aureliaPal) {
      AggregateError = _aureliaPal.AggregateError;
    }],
    execute: function () {
      _export('resolver', resolver = protocol.create('aurelia:resolver', function (target) {
        if (!(typeof target.get === 'function')) {
          return 'Resolvers must implement: get(container: Container, key: any): any';
        }

        return true;
      }));

      _export('resolver', resolver);

      _export('Lazy', Lazy = (_dec = resolver(), _dec(_class = function () {
        function Lazy(key) {
          _classCallCheck(this, Lazy);

          this._key = key;
        }

        Lazy.prototype.get = function get(container) {
          var _this = this;

          return function () {
            return container.get(_this._key);
          };
        };

        Lazy.of = function of(key) {
          return new Lazy(key);
        };

        return Lazy;
      }()) || _class));

      _export('Lazy', Lazy);

      _export('All', All = (_dec2 = resolver(), _dec2(_class2 = function () {
        function All(key) {
          _classCallCheck(this, All);

          this._key = key;
        }

        All.prototype.get = function get(container) {
          return container.getAll(this._key);
        };

        All.of = function of(key) {
          return new All(key);
        };

        return All;
      }()) || _class2));

      _export('All', All);

      _export('Optional', Optional = (_dec3 = resolver(), _dec3(_class3 = function () {
        function Optional(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, Optional);

          this._key = key;
          this._checkParent = checkParent;
        }

        Optional.prototype.get = function get(container) {
          if (container.hasResolver(this._key, this._checkParent)) {
            return container.get(this._key);
          }

          return null;
        };

        Optional.of = function of(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          return new Optional(key, checkParent);
        };

        return Optional;
      }()) || _class3));

      _export('Optional', Optional);

      _export('Parent', Parent = (_dec4 = resolver(), _dec4(_class4 = function () {
        function Parent(key) {
          _classCallCheck(this, Parent);

          this._key = key;
        }

        Parent.prototype.get = function get(container) {
          return container.parent ? container.parent.get(this._key) : null;
        };

        Parent.of = function of(key) {
          return new Parent(key);
        };

        return Parent;
      }()) || _class4));

      _export('Parent', Parent);

      _export('StrategyResolver', StrategyResolver = (_dec5 = resolver(), _dec5(_class5 = function () {
        function StrategyResolver(strategy, state) {
          _classCallCheck(this, StrategyResolver);

          this.strategy = strategy;
          this.state = state;
        }

        StrategyResolver.prototype.get = function get(container, key) {
          switch (this.strategy) {
            case 0:
              return this.state;
            case 1:
              var singleton = container.invoke(this.state);
              this.state = singleton;
              this.strategy = 0;
              return singleton;
            case 2:
              return container.invoke(this.state);
            case 3:
              return this.state(container, key, this);
            case 4:
              return this.state[0].get(container, key);
            case 5:
              return container.get(this.state);
            default:
              throw new Error('Invalid strategy: ' + this.strategy);
          }
        };

        return StrategyResolver;
      }()) || _class5));

      _export('StrategyResolver', StrategyResolver);

      _export('Factory', Factory = (_dec6 = resolver(), _dec6(_class6 = function () {
        function Factory(key) {
          _classCallCheck(this, Factory);

          this._key = key;
        }

        Factory.prototype.get = function get(container) {
          var _this2 = this;

          return function () {
            for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
              rest[_key] = arguments[_key];
            }

            return container.invoke(_this2._key, rest);
          };
        };

        Factory.of = function of(key) {
          return new Factory(key);
        };

        return Factory;
      }()) || _class6));

      _export('Factory', Factory);

      function invoker(value) {
        return function (target) {
          metadata.define(metadata.invoker, value, target);
        };
      }

      _export('invoker', invoker);

      function factory(potentialTarget) {
        var deco = function deco(target) {
          metadata.define(metadata.invoker, FactoryInvoker.instance, target);
        };

        return potentialTarget ? deco(potentialTarget) : deco;
      }

      _export('factory', factory);

      _export('FactoryInvoker', FactoryInvoker = function () {
        function FactoryInvoker() {
          _classCallCheck(this, FactoryInvoker);
        }

        FactoryInvoker.prototype.invoke = function invoke(container, fn, dependencies) {
          var i = dependencies.length;
          var args = new Array(i);

          while (i--) {
            args[i] = container.get(dependencies[i]);
          }

          return fn.apply(undefined, args);
        };

        FactoryInvoker.prototype.invokeWithDynamicDependencies = function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
          var i = staticDependencies.length;
          var args = new Array(i);

          while (i--) {
            args[i] = container.get(staticDependencies[i]);
          }

          if (dynamicDependencies !== undefined) {
            args = args.concat(dynamicDependencies);
          }

          return fn.apply(undefined, args);
        };

        return FactoryInvoker;
      }());

      _export('FactoryInvoker', FactoryInvoker);

      FactoryInvoker.instance = new FactoryInvoker();

      function registration(value) {
        return function (target) {
          metadata.define(metadata.registration, value, target);
        };
      }

      _export('registration', registration);

      function transient(key) {
        return registration(new TransientRegistration(key));
      }

      _export('transient', transient);

      function singleton(keyOrRegisterInChild) {
        var registerInChild = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

        return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
      }

      _export('singleton', singleton);

      _export('TransientRegistration', TransientRegistration = function () {
        function TransientRegistration(key) {
          _classCallCheck(this, TransientRegistration);

          this._key = key;
        }

        TransientRegistration.prototype.registerResolver = function registerResolver(container, key, fn) {
          var resolver = new StrategyResolver(2, fn);
          container.registerResolver(this._key || key, resolver);
          return resolver;
        };

        return TransientRegistration;
      }());

      _export('TransientRegistration', TransientRegistration);

      _export('SingletonRegistration', SingletonRegistration = function () {
        function SingletonRegistration(keyOrRegisterInChild) {
          var registerInChild = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          _classCallCheck(this, SingletonRegistration);

          if (typeof keyOrRegisterInChild === 'boolean') {
            this._registerInChild = keyOrRegisterInChild;
          } else {
            this._key = keyOrRegisterInChild;
            this._registerInChild = registerInChild;
          }
        }

        SingletonRegistration.prototype.registerResolver = function registerResolver(container, key, fn) {
          var resolver = new StrategyResolver(1, fn);

          if (this._registerInChild) {
            container.registerResolver(this._key || key, resolver);
          } else {
            container.root.registerResolver(this._key || key, resolver);
          }

          return resolver;
        };

        return SingletonRegistration;
      }());

      _export('SingletonRegistration', SingletonRegistration);

      badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';

      _export('_emptyParameters', _emptyParameters = Object.freeze([]));

      _export('_emptyParameters', _emptyParameters);

      metadata.registration = 'aurelia:registration';
      metadata.invoker = 'aurelia:invoker';

      resolverDecorates = resolver.decorates;

      _export('InvocationHandler', InvocationHandler = function () {
        function InvocationHandler(fn, invoker, dependencies) {
          _classCallCheck(this, InvocationHandler);

          this.fn = fn;
          this.invoker = invoker;
          this.dependencies = dependencies;
        }

        InvocationHandler.prototype.invoke = function invoke(container, dynamicDependencies) {
          return dynamicDependencies !== undefined ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies) : this.invoker.invoke(container, this.fn, this.dependencies);
        };

        return InvocationHandler;
      }());

      _export('InvocationHandler', InvocationHandler);

      classInvokers = (_classInvokers = {}, _classInvokers[0] = {
        invoke: function invoke(container, Type) {
          return new Type();
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers[1] = {
        invoke: function invoke(container, Type, deps) {
          return new Type(container.get(deps[0]));
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers[2] = {
        invoke: function invoke(container, Type, deps) {
          return new Type(container.get(deps[0]), container.get(deps[1]));
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers[3] = {
        invoke: function invoke(container, Type, deps) {
          return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers[4] = {
        invoke: function invoke(container, Type, deps) {
          return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers[5] = {
        invoke: function invoke(container, Type, deps) {
          return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
        },

        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers.fallback = {
        invoke: invokeWithDynamicDependencies,
        invokeWithDynamicDependencies: invokeWithDynamicDependencies
      }, _classInvokers);

      _export('Container', Container = function () {
        function Container(configuration) {
          _classCallCheck(this, Container);

          if (configuration === undefined) {
            configuration = {};
          }

          this._configuration = configuration;
          this._onHandlerCreated = configuration.onHandlerCreated;
          this._handlers = configuration.handlers || (configuration.handlers = new Map());
          this._resolvers = new Map();
          this.root = this;
          this.parent = null;
        }

        Container.prototype.makeGlobal = function makeGlobal() {
          Container.instance = this;
          return this;
        };

        Container.prototype.setHandlerCreatedCallback = function setHandlerCreatedCallback(onHandlerCreated) {
          this._onHandlerCreated = onHandlerCreated;
          this._configuration.onHandlerCreated = onHandlerCreated;
        };

        Container.prototype.registerInstance = function registerInstance(key, instance) {
          this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
        };

        Container.prototype.registerSingleton = function registerSingleton(key, fn) {
          this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
        };

        Container.prototype.registerTransient = function registerTransient(key, fn) {
          this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
        };

        Container.prototype.registerHandler = function registerHandler(key, handler) {
          this.registerResolver(key, new StrategyResolver(3, handler));
        };

        Container.prototype.registerAlias = function registerAlias(originalKey, aliasKey) {
          this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
        };

        Container.prototype.registerResolver = function registerResolver(key, resolver) {
          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          var allResolvers = this._resolvers;
          var result = allResolvers.get(key);

          if (result === undefined) {
            allResolvers.set(key, resolver);
          } else if (result.strategy === 4) {
            result.state.push(resolver);
          } else {
            allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
          }
        };

        Container.prototype.autoRegister = function autoRegister(fn, key) {
          var resolver = void 0;

          if (typeof fn === 'function') {
            var _registration = metadata.get(metadata.registration, fn);

            if (_registration === undefined) {
              resolver = new StrategyResolver(1, fn);
              this.registerResolver(key === undefined ? fn : key, resolver);
            } else {
              resolver = _registration.registerResolver(this, key === undefined ? fn : key, fn);
            }
          } else {
            resolver = new StrategyResolver(0, fn);
            this.registerResolver(key === undefined ? fn : key, resolver);
          }

          return resolver;
        };

        Container.prototype.autoRegisterAll = function autoRegisterAll(fns) {
          var i = fns.length;
          while (i--) {
            this.autoRegister(fns[i]);
          }
        };

        Container.prototype.unregister = function unregister(key) {
          this._resolvers.delete(key);
        };

        Container.prototype.hasResolver = function hasResolver(key) {
          var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          return this._resolvers.has(key) || checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent);
        };

        Container.prototype.get = function get(key) {
          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          if (key === Container) {
            return this;
          }

          if (resolverDecorates(key)) {
            return key.get(this, key);
          }

          var resolver = this._resolvers.get(key);

          if (resolver === undefined) {
            if (this.parent === null) {
              return this.autoRegister(key).get(this, key);
            }

            return this.parent._get(key);
          }

          return resolver.get(this, key);
        };

        Container.prototype._get = function _get(key) {
          var resolver = this._resolvers.get(key);

          if (resolver === undefined) {
            if (this.parent === null) {
              return this.autoRegister(key).get(this, key);
            }

            return this.parent._get(key);
          }

          return resolver.get(this, key);
        };

        Container.prototype.getAll = function getAll(key) {
          if (key === null || key === undefined) {
            throw new Error(badKeyError);
          }

          var resolver = this._resolvers.get(key);

          if (resolver === undefined) {
            if (this.parent === null) {
              return _emptyParameters;
            }

            return this.parent.getAll(key);
          }

          if (resolver.strategy === 4) {
            var state = resolver.state;
            var i = state.length;
            var results = new Array(i);

            while (i--) {
              results[i] = state[i].get(this, key);
            }

            return results;
          }

          return [resolver.get(this, key)];
        };

        Container.prototype.createChild = function createChild() {
          var child = new Container(this._configuration);
          child.root = this.root;
          child.parent = this;
          return child;
        };

        Container.prototype.invoke = function invoke(fn, dynamicDependencies) {
          try {
            var _handler = this._handlers.get(fn);

            if (_handler === undefined) {
              _handler = this._createInvocationHandler(fn);
              this._handlers.set(fn, _handler);
            }

            return _handler.invoke(this, dynamicDependencies);
          } catch (e) {
            throw new AggregateError('Error invoking ' + fn.name + '. Check the inner error for details.', e, true);
          }
        };

        Container.prototype._createInvocationHandler = function _createInvocationHandler(fn) {
          var dependencies = void 0;

          if (fn.inject === undefined) {
            dependencies = metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
          } else {
            dependencies = [];
            var ctor = fn;
            while (typeof ctor === 'function') {
              var _dependencies;

              (_dependencies = dependencies).push.apply(_dependencies, getDependencies(ctor));
              ctor = Object.getPrototypeOf(ctor);
            }
          }

          var invoker = metadata.getOwn(metadata.invoker, fn) || classInvokers[dependencies.length] || classInvokers.fallback;

          var handler = new InvocationHandler(fn, invoker, dependencies);
          return this._onHandlerCreated !== undefined ? this._onHandlerCreated(handler) : handler;
        };

        return Container;
      }());

      _export('Container', Container);

      function autoinject(potentialTarget) {
        var deco = function deco(target) {
          target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
        };

        return potentialTarget ? deco(potentialTarget) : deco;
      }

      _export('autoinject', autoinject);

      function inject() {
        for (var _len2 = arguments.length, rest = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          rest[_key2] = arguments[_key2];
        }

        return function (target, key, descriptor) {
          if (descriptor) {
            var _fn = descriptor.value;
            _fn.inject = rest;
          } else {
            target.inject = rest;
          }
        };
      }

      _export('inject', inject);
    }
  };
});