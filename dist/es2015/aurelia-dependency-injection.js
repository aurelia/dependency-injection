var _dec, _class, _dec2, _class2, _dec3, _class3, _dec4, _class4, _dec5, _class5, _dec6, _class6;

import { protocol, metadata } from 'aurelia-metadata';
import { AggregateError } from 'aurelia-pal';

export const resolver = protocol.create('aurelia:resolver', function (target) {
  if (!(typeof target.get === 'function')) {
    return 'Resolvers must implement: get(container: Container, key: any): any';
  }

  return true;
});

export let Lazy = (_dec = resolver(), _dec(_class = class Lazy {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return () => container.get(this._key);
  }

  static of(key) {
    return new Lazy(key);
  }
}) || _class);

export let All = (_dec2 = resolver(), _dec2(_class2 = class All {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.getAll(this._key);
  }

  static of(key) {
    return new All(key);
  }
}) || _class2);

export let Optional = (_dec3 = resolver(), _dec3(_class3 = class Optional {
  constructor(key, checkParent = false) {
    this._key = key;
    this._checkParent = checkParent;
  }

  get(container) {
    if (container.hasResolver(this._key, this._checkParent)) {
      return container.get(this._key);
    }

    return null;
  }

  static of(key, checkParent = false) {
    return new Optional(key, checkParent);
  }
}) || _class3);

export let Parent = (_dec4 = resolver(), _dec4(_class4 = class Parent {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.parent ? container.parent.get(this._key) : null;
  }

  static of(key) {
    return new Parent(key);
  }
}) || _class4);

export let StrategyResolver = (_dec5 = resolver(), _dec5(_class5 = class StrategyResolver {
  constructor(strategy, state) {
    this.strategy = strategy;
    this.state = state;
  }

  get(container, key) {
    switch (this.strategy) {
      case 0:
        return this.state;
      case 1:
        let singleton = container.invoke(this.state);
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
  }
}) || _class5);

export let Factory = (_dec6 = resolver(), _dec6(_class6 = class Factory {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return (...rest) => container.invoke(this._key, rest);
  }

  static of(key) {
    return new Factory(key);
  }
}) || _class6);

export function invoker(value) {
  return function (target) {
    metadata.define(metadata.invoker, value, target);
  };
}

export function factory(potentialTarget) {
  let deco = function (target) {
    metadata.define(metadata.invoker, FactoryInvoker.instance, target);
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export let FactoryInvoker = class FactoryInvoker {
  invoke(container, fn, dependencies) {
    let i = dependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(dependencies[i]);
    }

    return fn.apply(undefined, args);
  }

  invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
    let i = staticDependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(staticDependencies[i]);
    }

    if (dynamicDependencies !== undefined) {
      args = args.concat(dynamicDependencies);
    }

    return fn.apply(undefined, args);
  }
};

FactoryInvoker.instance = new FactoryInvoker();

export function registration(value) {
  return function (target) {
    metadata.define(metadata.registration, value, target);
  };
}

export function transient(key) {
  return registration(new TransientRegistration(key));
}

export function singleton(keyOrRegisterInChild, registerInChild = false) {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export let TransientRegistration = class TransientRegistration {
  constructor(key) {
    this._key = key;
  }

  registerResolver(container, key, fn) {
    let resolver = new StrategyResolver(2, fn);
    container.registerResolver(this._key || key, resolver);
    return resolver;
  }
};

export let SingletonRegistration = class SingletonRegistration {
  constructor(keyOrRegisterInChild, registerInChild = false) {
    if (typeof keyOrRegisterInChild === 'boolean') {
      this._registerInChild = keyOrRegisterInChild;
    } else {
      this._key = keyOrRegisterInChild;
      this._registerInChild = registerInChild;
    }
  }

  registerResolver(container, key, fn) {
    let resolver = new StrategyResolver(1, fn);

    if (this._registerInChild) {
      container.registerResolver(this._key || key, resolver);
    } else {
      container.root.registerResolver(this._key || key, resolver);
    }

    return resolver;
  }
};

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
export const _emptyParameters = Object.freeze([]);

metadata.registration = 'aurelia:registration';
metadata.invoker = 'aurelia:invoker';

let resolverDecorates = resolver.decorates;

export let InvocationHandler = class InvocationHandler {
  constructor(fn, invoker, dependencies) {
    this.fn = fn;
    this.invoker = invoker;
    this.dependencies = dependencies;
  }

  invoke(container, dynamicDependencies) {
    return dynamicDependencies !== undefined ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies) : this.invoker.invoke(container, this.fn, this.dependencies);
  }
};

function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
  let i = staticDependencies.length;
  let args = new Array(i);

  while (i--) {
    args[i] = container.get(staticDependencies[i]);
  }

  if (dynamicDependencies !== undefined) {
    args = args.concat(dynamicDependencies);
  }

  return Reflect.construct(fn, args);
}

let classInvokers = {
  [0]: {
    invoke(container, Type) {
      return new Type();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [1]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [2]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [3]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [4]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [5]: {
    invoke(container, Type, deps) {
      return new Type(container.get(deps[0]), container.get(deps[1]), container.get(deps[2]), container.get(deps[3]), container.get(deps[4]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  fallback: {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }
};

function getDependencies(f) {
  if (!f.hasOwnProperty('inject')) {
    return [];
  }

  if (typeof f.inject === 'function') {
    return f.inject();
  }

  return f.inject;
}

export let Container = class Container {
  constructor(configuration) {
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

  makeGlobal() {
    Container.instance = this;
    return this;
  }

  setHandlerCreatedCallback(onHandlerCreated) {
    this._onHandlerCreated = onHandlerCreated;
    this._configuration.onHandlerCreated = onHandlerCreated;
  }

  registerInstance(key, instance) {
    this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  registerSingleton(key, fn) {
    this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  registerTransient(key, fn) {
    this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  registerHandler(key, handler) {
    this.registerResolver(key, new StrategyResolver(3, handler));
  }

  registerAlias(originalKey, aliasKey) {
    this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  registerResolver(key, resolver) {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let allResolvers = this._resolvers;
    let result = allResolvers.get(key);

    if (result === undefined) {
      allResolvers.set(key, resolver);
    } else if (result.strategy === 4) {
      result.state.push(resolver);
    } else {
      allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
    }
  }

  autoRegister(fn, key) {
    let resolver;

    if (typeof fn === 'function') {
      let registration = metadata.get(metadata.registration, fn);

      if (registration === undefined) {
        resolver = new StrategyResolver(1, fn);
        this.registerResolver(key === undefined ? fn : key, resolver);
      } else {
        resolver = registration.registerResolver(this, key === undefined ? fn : key, fn);
      }
    } else {
      resolver = new StrategyResolver(0, fn);
      this.registerResolver(key === undefined ? fn : key, resolver);
    }

    return resolver;
  }

  autoRegisterAll(fns) {
    let i = fns.length;
    while (i--) {
      this.autoRegister(fns[i]);
    }
  }

  unregister(key) {
    this._resolvers.delete(key);
  }

  hasResolver(key, checkParent = false) {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    return this._resolvers.has(key) || checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent);
  }

  get(key) {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    if (key === Container) {
      return this;
    }

    if (resolverDecorates(key)) {
      return key.get(this, key);
    }

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
    }

    return resolver.get(this, key);
  }

  _get(key) {
    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
    }

    return resolver.get(this, key);
  }

  getAll(key) {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let resolver = this._resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return _emptyParameters;
      }

      return this.parent.getAll(key);
    }

    if (resolver.strategy === 4) {
      let state = resolver.state;
      let i = state.length;
      let results = new Array(i);

      while (i--) {
        results[i] = state[i].get(this, key);
      }

      return results;
    }

    return [resolver.get(this, key)];
  }

  createChild() {
    let child = new Container(this._configuration);
    child.root = this.root;
    child.parent = this;
    return child;
  }

  invoke(fn, dynamicDependencies) {
    try {
      let handler = this._handlers.get(fn);

      if (handler === undefined) {
        handler = this._createInvocationHandler(fn);
        this._handlers.set(fn, handler);
      }

      return handler.invoke(this, dynamicDependencies);
    } catch (e) {
      throw new AggregateError(`Error invoking ${ fn.name }. Check the inner error for details.`, e, true);
    }
  }

  _createInvocationHandler(fn) {
    let dependencies;

    if (fn.inject === undefined) {
      dependencies = metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
    } else {
      dependencies = [];
      let ctor = fn;
      while (typeof ctor === 'function') {
        dependencies.push(...getDependencies(ctor));
        ctor = Object.getPrototypeOf(ctor);
      }
    }

    let invoker = metadata.getOwn(metadata.invoker, fn) || classInvokers[dependencies.length] || classInvokers.fallback;

    let handler = new InvocationHandler(fn, invoker, dependencies);
    return this._onHandlerCreated !== undefined ? this._onHandlerCreated(handler) : handler;
  }
};

export function autoinject(potentialTarget) {
  let deco = function (target) {
    target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export function inject(...rest) {
  return function (target, key, descriptor) {
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}