import * as core from 'core-js';
import {Metadata} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-logging';
import {ClassActivator} from './activators';
import {Resolver, StrategyResolver} from './resolvers';

// Fix Function#name on browsers that do not support it (IE):
function test() {}
if (!test.name) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      let name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
      // For better performance only parse once, and then cache the
      // result through a new accessor for repeated access.
      Object.defineProperty(this, 'name', { value: name });
      return name;
    }
  });
}

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
export const emptyParameters = Object.freeze([]);

Metadata.registration = 'aurelia:registration';
Metadata.instanceActivator = 'aurelia:instance-activator';

class ConstructionInfo {
  constructor(activator, keys) {
    this.activator = activator;
    this.keys = keys;
  }
}

function invokeWithDynamicDependencies(container, fn, keys, deps) {
  let i = keys.length;
  let args = new Array(i);

  while (i--) {
    args[i] = container.get(keys[i]);
  }

  if (deps !== undefined) {
    args = args.concat(deps);
  }

  return Reflect.construct(fn, args);
}

let classActivators = {
  [0]: {
    invoke(container, Type, keys) {
      return new Type();
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [1]: {
    invoke(container, Type, keys) {
      return new Type(container.get(keys[0]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [2]: {
    invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [3]: {
    invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [4]: {
    invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]), container.get(keys[3]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  [5]: {
    invoke(container, Type, keys) {
      return new Type(container.get(keys[0]), container.get(keys[1]), container.get(keys[2]), container.get(keys[3]), container.get(keys[4]));
    },
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  },
  fallback: {
    invoke: invokeWithDynamicDependencies,
    invokeWithDynamicDependencies: invokeWithDynamicDependencies
  }
};

/**
* A lightweight, extensible dependency injection container.
*/
export class Container {
  static instance: Container;

  constructor(constructionInfo?: Map<Function, Object>) {
    this.resolvers = new Map();
    this.constructionInfo = constructionInfo === undefined ? new Map() : constructionInfo;
    this.root = this;
    this.parent = null;
  }

  /**
  * Makes this container instance globally reachable through Container.instance.
  */
  makeGlobal(): Container {
    Container.instance = this;
    return this;
  }

  /**
  * Registers an existing object instance with the container.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param instance The instance that will be resolved when the key is matched.
  */
  registerInstance(key: any, instance?: any): Resolver {
    return this._registerStrategyResolver(key, 0, instance === undefined ? key : instance);
  }

  /**
  * Registers a type (constructor function) such that the container always returns the same instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerSingleton(key: any, fn?: Function): Resolver {
    return this._registerStrategyResolver(key, 1, fn === undefined ? key : fn);
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerTransient(key: any, fn?: Function): Resolver {
    return this._registerStrategyResolver(key, 2, fn === undefined ? key : fn);
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
  */
  registerHandler(key: any, handler: (container?: Container, key?: any, resolver?: Resolver) => any): Resolver {
    return this._registerStrategyResolver(key, 3, handler);
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  * @param fn The constructor function to use when the dependency needs to be instantiated.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  autoRegister(fn: any, key?: any): Resolver {
    if (typeof fn === 'function') {
      let registration = Metadata.get(Metadata.registration, fn);

      if (registration === undefined) {
        return this._registerStrategyResolver(key === undefined ? fn : key, 1, fn);
      }

      let resolver = registration.createResolver(this, key === undefined ? fn : key, fn);
      this.resolvers.set(key === undefined ? fn : key, resolver);
      return resolver;
    }

    return this._registerStrategyResolver(key === undefined ? fn : key, 0, fn);
  }

  /**
  * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
  * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
  */
  autoRegisterAll(fns: any[]): void {
    let i = fns.length;
    while (i--) {
      this.autoRegister(fns[i]);
    }
  }

  /**
  * Unregisters based on key.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  unregister(key: any) : void {
    this.resolvers.delete(key);
  }

  /**
  * Inspects the container to determine if a particular key has been registred.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param checkParent Indicates whether or not to check the parent container hierarchy.
  * @return Returns true if the key has been registred; false otherwise.
  */
  hasResolver(key: any, checkParent?: boolean = false): boolean {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    return this.resolvers.has(key) || (checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent));
  }

  /**
  * Deprecated. Use hasResolver instead.
  */
  hasHandler(key, checkParent) {
    return this.hasResolver(key, checkParent);
  }

  /**
  * Resolves a single instance based on the provided key.
  * @param key The key that identifies the object to resolve.
  * @return Returns the resolved instance.
  */
  get(key: any): any {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    if (key === Container) {
      return this;
    }

    if (key instanceof Resolver) {
      return key.get(this);
    }

    let resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        resolver = this.autoRegister(key);
      } else {
        return this.parent._get(key);
      }
    }

    return resolver.get(this, key);
  }

  _get(key) {
    let resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        resolver = this.autoRegister(key);
      } else {
        return this.parent._get(key);
      }
    }

    return resolver.get(this, key);
  }

  /**
  * Resolves all instance registered under the provided key.
  * @param key The key that identifies the objects to resolve.
  * @return Returns an array of the resolved instances.
  */
  getAll(key: any): any[] {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return emptyParameters;
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

    return resolver.get(this, key);
  }

  /**
  * Creates a new dependency injection container whose parent is the current container.
  * @return Returns a new container instance parented to this.
  */
  createChild(): Container {
    let child = new Container(this.constructionInfo);
    child.root = this.root;
    child.parent = this;
    return child;
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  * @param fn The function to invoke with the auto-resolved dependencies.
  * @return Returns the instance resulting from calling the function.
  */
  invoke(fn: Function): any {
    let info;

    try {
      info = this._getOrCreateConstructionInfo(fn);
      return info.activator.invoke(this, fn, info.keys);
    } catch(e) {
      let activatingText = info && info.activator instanceof ClassActivator ? 'instantiating' : 'invoking';
      let message = `Error ${activatingText} ${fn.name}. Check the inner error for details.`;
      throw new AggregateError(message, e, true);
    }
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  * @param fn The function to invoke with the auto-resolved dependencies.
  * @param deps Additional function dependencies to use during invocation.
  * @return Returns the instance resulting from calling the function.
  */
  invokeWithDynamicDependencies(fn: Function, deps: any[]) {
    let info;

    try {
      info = this._getOrCreateConstructionInfo(fn);
      return info.activator.invokeWithDynamicDependencies(this, fn, info.keys, deps);
    } catch(e) {
      let activatingText = info && info.activator instanceof ClassActivator ? 'instantiating' : 'invoking';
      let message = `Error ${activatingText} ${fn.name}. Check the inner error for details.`;
      throw new AggregateError(message, e, true);
    }
  }

  _registerStrategyResolver(key, strategy, state) {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      this.resolvers.set(key, resolver = new StrategyResolver(strategy, state));
    } else if (resolver.strategy === 4) {
      resolver.state.push(new StrategyResolver(strategy, state));
    } else {
      let states = [resolver, new StrategyResolver(strategy, state)];
      this.resolvers.set(key, resolver = new StrategyResolver(4, states));
    }

    return resolver;
  }

  _getOrCreateConstructionInfo(fn) {
    let info = this.constructionInfo.get(fn);

    if (info === undefined) {
      info = this._createConstructionInfo(fn);
      this.constructionInfo.set(fn, info);
    }

    return info;
  }

  _createConstructionInfo(fn) {
    let keys;

    if (typeof fn.inject === 'function') {
      keys = fn.inject();
    } else if (fn.inject === undefined) {
      keys = Metadata.getOwn(Metadata.paramTypes, fn) || emptyParameters;
    } else {
      keys = fn.inject;
    }

    let activator = Metadata.getOwn(Metadata.instanceActivator, fn)
      || classActivators[keys.length] || classActivators.fallback;

    return new ConstructionInfo(activator, keys);
  }
}
