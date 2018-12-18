'use strict';

System.register(['aurelia-metadata', 'aurelia-pal'], function (_export, _context) {
  "use strict";

  var protocol, metadata, AggregateError, _dec, _class, _dec2, _class2, _dec3, _class3, _dec4, _class4, _dec5, _class5, _dec6, _class6, _dec7, _class7, _classInvokers, resolver, StrategyResolver, Lazy, All, Optional, Parent, Factory, NewInstance, FactoryInvoker, TransientRegistration, SingletonRegistration, _emptyParameters, resolverDecorates, InvocationHandler, classInvokers, Container;

  

  function getDecoratorDependencies(target) {
    autoinject(target);

    return target.inject;
  }

  _export('getDecoratorDependencies', getDecoratorDependencies);

  function lazy(keyValue) {
    return function (target, key, index) {
      var inject = getDecoratorDependencies(target);
      inject[index] = Lazy.of(keyValue);
    };
  }

  _export('lazy', lazy);

  function all(keyValue) {
    return function (target, key, index) {
      var inject = getDecoratorDependencies(target);
      inject[index] = All.of(keyValue);
    };
  }

  _export('all', all);

  function optional() {
    var checkParentOrTarget = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

    var deco = function deco(checkParent) {
      return function (target, key, index) {
        var inject = getDecoratorDependencies(target);
        inject[index] = Optional.of(inject[index], checkParent);
      };
    };
    if (typeof checkParentOrTarget === 'boolean') {
      return deco(checkParentOrTarget);
    }
    return deco(true);
  }

  _export('optional', optional);

  function parent(target, key, index) {
    var inject = getDecoratorDependencies(target);
    inject[index] = Parent.of(inject[index]);
  }

  _export('parent', parent);

  function factory(keyValue) {
    return function (target, key, index) {
      var inject = getDecoratorDependencies(target);
      inject[index] = Factory.of(keyValue);
    };
  }

  _export('factory', factory);

  function newInstance(asKeyOrTarget) {
    for (var _len4 = arguments.length, dynamicDependencies = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      dynamicDependencies[_key4 - 1] = arguments[_key4];
    }

    var deco = function deco(asKey) {
      return function (target, key, index) {
        var inject = getDecoratorDependencies(target);
        inject[index] = NewInstance.of.apply(NewInstance, [inject[index]].concat(dynamicDependencies));
        if (!!asKey) {
          inject[index].as(asKey);
        }
      };
    };
    if (arguments.length >= 1) {
      return deco(asKeyOrTarget);
    }
    return deco();
  }

  _export('newInstance', newInstance);

  function invoker(value) {
    return function (target) {
      metadata.define(metadata.invoker, value, target);
    };
  }

  _export('invoker', invoker);

  function invokeAsFactory(potentialTarget) {
    var deco = function deco(target) {
      metadata.define(metadata.invoker, FactoryInvoker.instance, target);
    };

    return potentialTarget ? deco(potentialTarget) : deco;
  }

  _export('invokeAsFactory', invokeAsFactory);

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
    var registerInChild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
  }

  _export('singleton', singleton);

  function validateKey(key) {
    if (key === null || key === undefined) {
      throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
    }
  }


  function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
    var i = staticDependencies.length;
    var args = new Array(i);
    var lookup = void 0;

    while (i--) {
      lookup = staticDependencies[i];

      if (lookup === null || lookup === undefined) {
        throw new Error('Constructor Parameter with index ' + i + ' cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
      } else {
        args[i] = container.get(lookup);
      }
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

  function autoinject(potentialTarget) {
    var deco = function deco(target) {
      if (!target.hasOwnProperty('inject')) {
        target.inject = (metadata.getOwn(metadata.paramTypes, target) || _emptyParameters).slice();

        if (target.inject.length > 0 && target.inject[target.inject.length - 1] === Object) {
          target.inject.pop();
        }
      }
    };

    return potentialTarget ? deco(potentialTarget) : deco;
  }

  _export('autoinject', autoinject);

  function inject() {
    for (var _len5 = arguments.length, rest = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      rest[_key5] = arguments[_key5];
    }

    return function (target, key, descriptor) {
      if (typeof descriptor === 'number') {
        autoinject(target);
        if (rest.length === 1) {
          target.inject[descriptor] = rest[0];
        }
        return;
      }

      if (descriptor) {
        var _fn = descriptor.value;
        _fn.inject = rest;
      } else {
        target.inject = rest;
      }
    };
  }

  _export('inject', inject);

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

      _export('StrategyResolver', StrategyResolver = (_dec = resolver(), _dec(_class = function () {
        function StrategyResolver(strategy, state) {
          

          this.strategy = strategy;
          this.state = state;
        }

        StrategyResolver.prototype.get = function get(container, key) {
          switch (this.strategy) {
            case 0:
              return this.state;
            case 1:
              var _singleton = container.invoke(this.state);
              this.state = _singleton;
              this.strategy = 0;
              return _singleton;
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
      }()) || _class));

      _export('StrategyResolver', StrategyResolver);

      _export('Lazy', Lazy = (_dec2 = resolver(), _dec2(_class2 = function () {
        function Lazy(key) {
          

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
      }()) || _class2));

      _export('Lazy', Lazy);

      _export('All', All = (_dec3 = resolver(), _dec3(_class3 = function () {
        function All(key) {
          

          this._key = key;
        }

        All.prototype.get = function get(container) {
          return container.getAll(this._key);
        };

        All.of = function of(key) {
          return new All(key);
        };

        return All;
      }()) || _class3));

      _export('All', All);

      _export('Optional', Optional = (_dec4 = resolver(), _dec4(_class4 = function () {
        function Optional(key) {
          var checkParent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

          

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
          var checkParent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

          return new Optional(key, checkParent);
        };

        return Optional;
      }()) || _class4));

      _export('Optional', Optional);

      _export('Parent', Parent = (_dec5 = resolver(), _dec5(_class5 = function () {
        function Parent(key) {
          

          this._key = key;
        }

        Parent.prototype.get = function get(container) {
          return container.parent ? container.parent.get(this._key) : null;
        };

        Parent.of = function of(key) {
          return new Parent(key);
        };

        return Parent;
      }()) || _class5));

      _export('Parent', Parent);

      _export('Factory', Factory = (_dec6 = resolver(), _dec6(_class6 = function () {
        function Factory(key) {
          

          this._key = key;
        }

        Factory.prototype.get = function get(container) {
          var fn = this._key;
          var resolver = container.getResolver(fn);
          if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
          }

          return function () {
            for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
              rest[_key] = arguments[_key];
            }

            return container.invoke(fn, rest);
          };
        };

        Factory.of = function of(key) {
          return new Factory(key);
        };

        return Factory;
      }()) || _class6));

      _export('Factory', Factory);

      _export('NewInstance', NewInstance = (_dec7 = resolver(), _dec7(_class7 = function () {
        function NewInstance(key) {
          

          this.key = key;
          this.asKey = key;

          for (var _len2 = arguments.length, dynamicDependencies = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            dynamicDependencies[_key2 - 1] = arguments[_key2];
          }

          this.dynamicDependencies = dynamicDependencies;
        }

        NewInstance.prototype.get = function get(container) {
          var dynamicDependencies = this.dynamicDependencies.length > 0 ? this.dynamicDependencies.map(function (dependency) {
            return dependency['protocol:aurelia:resolver'] ? dependency.get(container) : container.get(dependency);
          }) : undefined;

          var fn = this.key;
          var resolver = container.getResolver(fn);
          if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
          }

          var instance = container.invoke(fn, dynamicDependencies);
          container.registerInstance(this.asKey, instance);
          return instance;
        };

        NewInstance.prototype.as = function as(key) {
          this.asKey = key;
          return this;
        };

        NewInstance.of = function of(key) {
          for (var _len3 = arguments.length, dynamicDependencies = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            dynamicDependencies[_key3 - 1] = arguments[_key3];
          }

          return new (Function.prototype.bind.apply(NewInstance, [null].concat([key], dynamicDependencies)))();
        };

        return NewInstance;
      }()) || _class7));

      _export('NewInstance', NewInstance);

      _export('FactoryInvoker', FactoryInvoker = function () {
        function FactoryInvoker() {
          
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

      _export('TransientRegistration', TransientRegistration = function () {
        function TransientRegistration(key) {
          

          this._key = key;
        }

        TransientRegistration.prototype.registerResolver = function registerResolver(container, key, fn) {
          var existingResolver = container.getResolver(this._key || key);
          return existingResolver === undefined ? container.registerTransient(this._key || key, fn) : existingResolver;
        };

        return TransientRegistration;
      }());

      _export('TransientRegistration', TransientRegistration);

      _export('SingletonRegistration', SingletonRegistration = function () {
        function SingletonRegistration(keyOrRegisterInChild) {
          var registerInChild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          

          if (typeof keyOrRegisterInChild === 'boolean') {
            this._registerInChild = keyOrRegisterInChild;
          } else {
            this._key = keyOrRegisterInChild;
            this._registerInChild = registerInChild;
          }
        }

        SingletonRegistration.prototype.registerResolver = function registerResolver(container, key, fn) {
          var targetContainer = this._registerInChild ? container : container.root;
          var existingResolver = targetContainer.getResolver(this._key || key);
          return existingResolver === undefined ? targetContainer.registerSingleton(this._key || key, fn) : existingResolver;
        };

        return SingletonRegistration;
      }());

      _export('SingletonRegistration', SingletonRegistration);

      _export('_emptyParameters', _emptyParameters = Object.freeze([]));

      _export('_emptyParameters', _emptyParameters);

      metadata.registration = 'aurelia:registration';
      metadata.invoker = 'aurelia:invoker';

      resolverDecorates = resolver.decorates;

      _export('InvocationHandler', InvocationHandler = function () {
        function InvocationHandler(fn, invoker, dependencies) {
          

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
          return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
        };

        Container.prototype.registerSingleton = function registerSingleton(key, fn) {
          return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
        };

        Container.prototype.registerTransient = function registerTransient(key, fn) {
          return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
        };

        Container.prototype.registerHandler = function registerHandler(key, handler) {
          return this.registerResolver(key, new StrategyResolver(3, handler));
        };

        Container.prototype.registerAlias = function registerAlias(originalKey, aliasKey) {
          return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
        };

        Container.prototype.registerResolver = function registerResolver(key, resolver) {
          validateKey(key);

          var allResolvers = this._resolvers;
          var result = allResolvers.get(key);

          if (result === undefined) {
            allResolvers.set(key, resolver);
          } else if (result.strategy === 4) {
            result.state.push(resolver);
          } else {
            allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
          }

          return resolver;
        };

        Container.prototype.autoRegister = function autoRegister(key, fn) {
          fn = fn === undefined ? key : fn;

          if (typeof fn === 'function') {
            var _registration = metadata.get(metadata.registration, fn);

            if (_registration === undefined) {
              return this.registerResolver(key, new StrategyResolver(1, fn));
            }

            return _registration.registerResolver(this, key, fn);
          }

          return this.registerResolver(key, new StrategyResolver(0, fn));
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
          var checkParent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

          validateKey(key);

          return this._resolvers.has(key) || checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent);
        };

        Container.prototype.getResolver = function getResolver(key) {
          return this._resolvers.get(key);
        };

        Container.prototype.get = function get(key) {
          validateKey(key);

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

            var _registration2 = metadata.get(metadata.registration, key);

            if (_registration2 === undefined) {
              return this.parent._get(key);
            }

            return _registration2.registerResolver(this, key, key).get(this, key);
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
          validateKey(key);

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
    }
  };
});