define(['exports', 'core-js', 'aurelia-metadata', 'aurelia-pal'], function (exports, _coreJs, _aureliaMetadata, _aureliaPal) {
  'use strict';

  exports.__esModule = true;

  var _classActivators;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  exports.autoinject = autoinject;
  exports.inject = inject;
  exports.registration = registration;
  exports.transient = transient;
  exports.singleton = singleton;
  exports.instanceActivator = instanceActivator;
  exports.factory = factory;

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Resolver = (function () {
    function Resolver() {
      _classCallCheck(this, Resolver);
    }

    Resolver.prototype.get = function get(container) {
      throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
    };

    return Resolver;
  })();

  exports.Resolver = Resolver;

  var Lazy = (function (_Resolver) {
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

  exports.Lazy = Lazy;

  var All = (function (_Resolver2) {
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

  exports.All = All;

  var Optional = (function (_Resolver3) {
    _inherits(Optional, _Resolver3);

    function Optional(key) {
      var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      _classCallCheck(this, Optional);

      _Resolver3.call(this);
      this.key = key;
      this.checkParent = checkParent;
    }

    Optional.prototype.get = function get(container) {
      if (container.hasResolver(this.key, this.checkParent)) {
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

  exports.Optional = Optional;

  var Parent = (function (_Resolver4) {
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

  exports.Parent = Parent;

  var StrategyResolver = (function () {
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
  })();

  exports.StrategyResolver = StrategyResolver;

  var FactoryActivator = (function () {
    function FactoryActivator() {
      _classCallCheck(this, FactoryActivator);
    }

    FactoryActivator.prototype.invoke = function invoke(container, fn, keys) {
      var i = keys.length;
      var args = new Array(i);

      while (i--) {
        args[i] = container.get(keys[i]);
      }

      return fn.apply(undefined, args);
    };

    FactoryActivator.prototype.invokeWithDynamicDependencies = function invokeWithDynamicDependencies(container, fn, keys, deps) {
      var i = keys.length;
      var args = new Array(i);

      while (i--) {
        args[i] = container.get(keys[i]);
      }

      if (deps !== undefined) {
        args = args.concat(deps);
      }

      return fn.apply(undefined, args);
    };

    _createClass(FactoryActivator, null, [{
      key: 'instance',
      value: new FactoryActivator(),
      enumerable: true
    }]);

    return FactoryActivator;
  })();

  exports.FactoryActivator = FactoryActivator;

  var TransientRegistration = (function () {
    function TransientRegistration(key) {
      _classCallCheck(this, TransientRegistration);

      this.key = key;
    }

    TransientRegistration.prototype.createResolver = function createResolver(container, key, fn) {
      return new StrategyResolver(2, fn);
    };

    return TransientRegistration;
  })();

  exports.TransientRegistration = TransientRegistration;

  var SingletonRegistration = (function () {
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

    SingletonRegistration.prototype.createResolver = function createResolver(container, key, fn) {
      var resolver = new StrategyResolver(1, fn);

      if (!this.registerInChild && container !== container.root) {
        this.targetContainer = container.root;
      }

      return resolver;
    };

    return SingletonRegistration;
  })();

  exports.SingletonRegistration = SingletonRegistration;

  var badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
  var _emptyParameters = Object.freeze([]);

  exports._emptyParameters = _emptyParameters;
  _aureliaMetadata.metadata.registration = 'aurelia:registration';
  _aureliaMetadata.metadata.instanceActivator = 'aurelia:instance-activator';

  var ConstructionInfo = function ConstructionInfo(activator, keys) {
    _classCallCheck(this, ConstructionInfo);

    this.activator = activator;
    this.keys = keys;
  };

  function invokeWithDynamicDependencies(container, fn, keys, deps) {
    var i = keys.length;
    var args = new Array(i);

    while (i--) {
      args[i] = container.get(keys[i]);
    }

    if (deps !== undefined) {
      args = args.concat(deps);
    }

    return Reflect.construct(fn, args);
  }

  var classActivators = (_classActivators = {}, _classActivators[0] = {
    invoke: function invoke(container, Type, keys) {
      return new Type();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators[1] = {
    invoke: function invoke(container, Type, keys) {
      return new Type(container.get(keys[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators[2] = {
    invoke: function invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators[3] = {
    invoke: function invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators[4] = {
    invoke: function invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]), container.get(keys[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators[5] = {
    invoke: function invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]), container.get(keys[3]), container.get(keys[4]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators.fallback = {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }, _classActivators);

  var Container = (function () {
    function Container(constructionInfo) {
      _classCallCheck(this, Container);

      this.resolvers = new Map();
      this.constructionInfo = constructionInfo === undefined ? new Map() : constructionInfo;
      this.root = this;
      this.parent = null;
    }

    Container.prototype.makeGlobal = function makeGlobal() {
      Container.instance = this;
      return this;
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

      var result = this.resolvers.get(key);

      if (result === undefined) {
        this.resolvers.set(key, resolver);
      } else if (result.strategy === 4) {
        result.state.push(resolver);
      } else {
        this.resolvers.set(key, new StrategyResolver(4, [result, resolver]));
      }
    };

    Container.prototype.autoRegister = function autoRegister(fn, key) {
      var resolver = undefined;

      if (typeof fn === 'function') {
        var _registration = _aureliaMetadata.metadata.get(_aureliaMetadata.metadata.registration, fn);

        if (_registration === undefined) {
          resolver = new StrategyResolver(1, fn);
        } else {
          resolver = _registration.createResolver(this, key === undefined ? fn : key, fn);
        }
      } else {
        resolver = new StrategyResolver(0, fn);
      }

      var targetContainer = resolver.targetContainer || this;
      targetContainer.registerResolver(key === undefined ? fn : key, resolver);
      return resolver;
    };

    Container.prototype.autoRegisterAll = function autoRegisterAll(fns) {
      var i = fns.length;
      while (i--) {
        this.autoRegister(fns[i]);
      }
    };

    Container.prototype.unregister = function unregister(key) {
      this.resolvers['delete'](key);
    };

    Container.prototype.hasResolver = function hasResolver(key) {
      var checkParent = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

      if (key === null || key === undefined) {
        throw new Error(badKeyError);
      }

      return this.resolvers.has(key) || checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent);
    };

    Container.prototype.hasHandler = function hasHandler(key, checkParent) {
      return this.hasResolver(key, checkParent);
    };

    Container.prototype.get = function get(key) {
      if (key === null || key === undefined) {
        throw new Error(badKeyError);
      }

      if (key === Container) {
        return this;
      }

      if (key instanceof Resolver) {
        return key.get(this);
      }

      var resolver = this.resolvers.get(key);

      if (resolver === undefined) {
        if (this.parent === null) {
          return this.autoRegister(key).get(this, key);
        }

        return this.parent._get(key);
      }

      return resolver.get(this, key);
    };

    Container.prototype._get = function _get(key) {
      var resolver = this.resolvers.get(key);

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

      var resolver = this.resolvers.get(key);

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

      return resolver.get(this, key);
    };

    Container.prototype.createChild = function createChild() {
      var child = new Container(this.constructionInfo);
      child.root = this.root;
      child.parent = this;
      return child;
    };

    Container.prototype.invoke = function invoke(fn) {
      var info = undefined;

      try {
        info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this._createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info.activator.invoke(this, fn, info.keys);
      } catch (e) {
        throw new _aureliaPal.AggregateError('Error invoking ' + fn.name + '. Check the inner error for details.', e, true);
      }
    };

    Container.prototype.invokeWithDynamicDependencies = function invokeWithDynamicDependencies(fn, deps) {
      var info = undefined;

      try {
        info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this._createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info.activator.invokeWithDynamicDependencies(this, fn, info.keys, deps);
      } catch (e) {
        throw new _aureliaPal.AggregateError('Error invoking ' + fn.name + '. Check the inner error for details.', e, true);
      }
    };

    Container.prototype._createConstructionInfo = function _createConstructionInfo(fn) {
      var keys = undefined;

      if (typeof fn.inject === 'function') {
        keys = fn.inject();
      } else if (fn.inject === undefined) {
        keys = _aureliaMetadata.metadata.getOwn(_aureliaMetadata.metadata.paramTypes, fn) || _emptyParameters;
      } else {
        keys = fn.inject;
      }

      var activator = _aureliaMetadata.metadata.getOwn(_aureliaMetadata.metadata.instanceActivator, fn) || classActivators[keys.length] || classActivators.fallback;

      return new ConstructionInfo(activator, keys);
    };

    return Container;
  })();

  exports.Container = Container;

  function autoinject(potentialTarget) {
    var deco = function deco(target) {
      target.inject = _aureliaMetadata.metadata.getOwn(_aureliaMetadata.metadata.paramTypes, target) || _emptyParameters;
    };

    return potentialTarget ? deco(potentialTarget) : deco;
  }

  function inject() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target, key, descriptor) {
      if (descriptor) {
        var fn = descriptor.value;
        fn.inject = rest;
      } else {
        target.inject = rest;
      }
    };
  }

  function registration(value) {
    return function (target) {
      _aureliaMetadata.metadata.define(_aureliaMetadata.metadata.registration, value, target);
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
      _aureliaMetadata.metadata.define(_aureliaMetadata.metadata.instanceActivator, value, target);
    };
  }

  function factory() {
    return instanceActivator(FactoryActivator.instance);
  }

  _aureliaMetadata.decorators.configure.simpleDecorator('autoinject', autoinject);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('inject', inject);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('registration', registration);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('transient', transient);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('singleton', singleton);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
  _aureliaMetadata.decorators.configure.parameterizedDecorator('factory', factory);
});