var _dec, _class, _dec2, _class2, _dec3, _class3, _dec4, _class4, _dec5, _class5, _dec6, _class6, _dec7, _class7;

import { protocol, metadata } from 'aurelia-metadata';
import { AggregateError } from 'aurelia-pal';

export const resolver = protocol.create('aurelia:resolver', function (target) {
  if (!(typeof target.get === 'function')) {
    return 'Resolvers must implement: get(container: Container, key: any): any';
  }

  return true;
});

export let StrategyResolver = (_dec = resolver(), _dec(_class = class StrategyResolver {
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
}) || _class);

export let Lazy = (_dec2 = resolver(), _dec2(_class2 = class Lazy {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return () => container.get(this._key);
  }

  static of(key) {
    return new Lazy(key);
  }
}) || _class2);

export let All = (_dec3 = resolver(), _dec3(_class3 = class All {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.getAll(this._key);
  }

  static of(key) {
    return new All(key);
  }
}) || _class3);

export let Optional = (_dec4 = resolver(), _dec4(_class4 = class Optional {
  constructor(key, checkParent = true) {
    this._key = key;
    this._checkParent = checkParent;
  }

  get(container) {
    if (container.hasResolver(this._key, this._checkParent)) {
      return container.get(this._key);
    }

    return null;
  }

  static of(key, checkParent = true) {
    return new Optional(key, checkParent);
  }
}) || _class4);

export let Parent = (_dec5 = resolver(), _dec5(_class5 = class Parent {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    return container.parent ? container.parent.get(this._key) : null;
  }

  static of(key) {
    return new Parent(key);
  }
}) || _class5);

export let Factory = (_dec6 = resolver(), _dec6(_class6 = class Factory {
  constructor(key) {
    this._key = key;
  }

  get(container) {
    let fn = this._key;
    let resolver = container.getResolver(fn);
    if (resolver && resolver.strategy === 3) {
      fn = resolver.state;
    }

    return (...rest) => container.invoke(fn, rest);
  }

  static of(key) {
    return new Factory(key);
  }
}) || _class6);

export let NewInstance = (_dec7 = resolver(), _dec7(_class7 = class NewInstance {
  constructor(key, ...dynamicDependencies) {
    this.key = key;
    this.asKey = key;
    this.dynamicDependencies = dynamicDependencies;
  }

  get(container) {
    let dynamicDependencies = this.dynamicDependencies.length > 0 ? this.dynamicDependencies.map(dependency => dependency['protocol:aurelia:resolver'] ? dependency.get(container) : container.get(dependency)) : undefined;

    let fn = this.key;
    let resolver = container.getResolver(fn);
    if (resolver && resolver.strategy === 3) {
      fn = resolver.state;
    }

    const instance = container.invoke(fn, dynamicDependencies);
    container.registerInstance(this.asKey, instance);
    return instance;
  }

  as(key) {
    this.asKey = key;
    return this;
  }

  static of(key, ...dynamicDependencies) {
    return new NewInstance(key, ...dynamicDependencies);
  }
}) || _class7);

export function getDecoratorDependencies(target) {
  autoinject(target);

  return target.inject;
}

export function lazy(keyValue) {
  return function (target, key, index) {
    let inject = getDecoratorDependencies(target);
    inject[index] = Lazy.of(keyValue);
  };
}

export function all(keyValue) {
  return function (target, key, index) {
    let inject = getDecoratorDependencies(target);
    inject[index] = All.of(keyValue);
  };
}

export function optional(checkParentOrTarget = true) {
  let deco = function (checkParent) {
    return function (target, key, index) {
      let inject = getDecoratorDependencies(target);
      inject[index] = Optional.of(inject[index], checkParent);
    };
  };
  if (typeof checkParentOrTarget === 'boolean') {
    return deco(checkParentOrTarget);
  }
  return deco(true);
}

export function parent(target, key, index) {
  let inject = getDecoratorDependencies(target);
  inject[index] = Parent.of(inject[index]);
}

export function factory(keyValue) {
  return function (target, key, index) {
    let inject = getDecoratorDependencies(target);
    inject[index] = Factory.of(keyValue);
  };
}

export function newInstance(asKeyOrTarget, ...dynamicDependencies) {
  let deco = function (asKey) {
    return function (target, key, index) {
      let inject = getDecoratorDependencies(target);
      inject[index] = NewInstance.of(inject[index], ...dynamicDependencies);
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

export function invoker(value) {
  return function (target) {
    metadata.define(metadata.invoker, value, target);
  };
}

export function invokeAsFactory(potentialTarget) {
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
    let existingResolver = container.getResolver(this._key || key);
    return existingResolver === undefined ? container.registerTransient(this._key || key, fn) : existingResolver;
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
    let targetContainer = this._registerInChild ? container : container.root;
    let existingResolver = targetContainer.getResolver(this._key || key);
    return existingResolver === undefined ? targetContainer.registerSingleton(this._key || key, fn) : existingResolver;
  }
};

function validateKey(key) {
  if (key === null || key === undefined) {
    throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
  }
}
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
  let lookup;

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
    return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  registerSingleton(key, fn) {
    return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  registerTransient(key, fn) {
    return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  registerHandler(key, handler) {
    return this.registerResolver(key, new StrategyResolver(3, handler));
  }

  registerAlias(originalKey, aliasKey) {
    return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  registerResolver(key, resolver) {
    validateKey(key);

    let allResolvers = this._resolvers;
    let result = allResolvers.get(key);

    if (result === undefined) {
      allResolvers.set(key, resolver);
    } else if (result.strategy === 4) {
      result.state.push(resolver);
    } else {
      allResolvers.set(key, new StrategyResolver(4, [result, resolver]));
    }

    return resolver;
  }

  autoRegister(key, fn) {
    fn = fn === undefined ? key : fn;

    if (typeof fn === 'function') {
      let registration = metadata.get(metadata.registration, fn);

      if (registration === undefined) {
        return this.registerResolver(key, new StrategyResolver(1, fn));
      }

      return registration.registerResolver(this, key, fn);
    }

    return this.registerResolver(key, new StrategyResolver(0, fn));
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
    validateKey(key);

    return this._resolvers.has(key) || checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent);
  }

  getResolver(key) {
    return this._resolvers.get(key);
  }

  get(key) {
    validateKey(key);

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

      let registration = metadata.get(metadata.registration, key);

      if (registration === undefined) {
        return this.parent._get(key);
      }

      return registration.registerResolver(this, key, key).get(this, key);
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
    validateKey(key);

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
      throw new AggregateError(`Error invoking ${fn.name}. Check the inner error for details.`, e, true);
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
    if (!target.hasOwnProperty('inject')) {
      target.inject = (metadata.getOwn(metadata.paramTypes, target) || _emptyParameters).slice();

      if (target.inject.length > 0 && target.inject[target.inject.length - 1] === Object) {
        target.inject.pop();
      }
    }
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export function inject(...rest) {
  return function (target, key, descriptor) {
    if (typeof descriptor === 'number') {
      autoinject(target);
      if (rest.length === 1) {
        target.inject[descriptor] = rest[0];
      }
      return;
    }

    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}