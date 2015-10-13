import 'core-js';
import {metadata,decorators} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-pal';

/**
* An abstract resolver used to allow functions/classes to specify custom dependency resolution logic.
*/
export class Resolver {
  /**
  * Called by the container to allow custom resolution of dependencies for a function/class.
  * @param container The container to resolve from.
  * @return Returns the resolved object.
  */
  get(container: Container): any {
    throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
  }
}

/**
* Used to allow functions/classes to specify lazy resolution logic.
*/
export class Lazy extends Resolver {
  /**
  * Creates an instance of the Lazy class.
  * @param key The key to lazily resolve.
  */
  constructor(key: any) {
    super();
    this.key = key;
  }

  /**
  * Called by the container to lazily resolve the dependency into a lazy locator function.
  * @param container The container to resolve from.
  * @return Returns a function which can be invoked at a later time to obtain the actual dependency.
  */
  get(container: Container): any {
    return () => {
      return container.get(this.key);
    };
  }

  /**
  * Creates a Lazy Resolver for the supplied key.
  * @param key The key to lazily resolve.
  * @return Returns an insance of Lazy for the key.
  */
  static of(key: any): Lazy {
    return new Lazy(key);
  }
}

/**
* Used to allow functions/classes to specify resolution of all matches to a key.
*/
export class All extends Resolver {
  /**
  * Creates an instance of the All class.
  * @param key The key to lazily resolve all matches for.
  */
  constructor(key: any) {
    super();
    this.key = key;
  }

  /**
  * Called by the container to resolve all matching dependencies as an array of instances.
  * @param container The container to resolve from.
  * @return Returns an array of all matching instances.
  */
  get(container: Container): any[] {
    return container.getAll(this.key);
  }

  /**
  * Creates an All Resolver for the supplied key.
  * @param key The key to resolve all instances for.
  * @return Returns an insance of All for the key.
  */
  static of(key: any): All {
    return new All(key);
  }
}

/**
* Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
*/
export class Optional extends Resolver {
  /**
  * Creates an instance of the Optional class.
  * @param key The key to optionally resolve for.
  * @param [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
  */
  constructor(key: any, checkParent?: boolean = false) {
    super();
    this.key = key;
    this.checkParent = checkParent;
  }

  /**
  * Called by the container to provide optional resolution of the key.
  * @param container The container to resolve from.
  * @return Returns the instance if found; otherwise null.
  */
  get(container: Container): any {
    if (container.hasResolver(this.key, this.checkParent)) {
      return container.get(this.key);
    }

    return null;
  }

  /**
  * Creates an Optional Resolver for the supplied key.
  * @param key The key to optionally resolve for.
  * @param [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
  * @return Returns an insance of Optional for the key.
  */
  static of(key: any, checkParent?: boolean = false): Optional {
    return new Optional(key, checkParent);
  }
}


/**
* Used to inject the dependency from the parent container instead of the current one.
*/
export class Parent extends Resolver {
  /**
  * Creates an instance of the Parent class.
  * @param key The key to resolve from the parent container.
  */
  constructor(key: any) {
    super();
    this.key = key;
  }

  /**
  * Called by the container to load the dependency from the parent container
  * @param container The container to resolve the parent from.
  * @return Returns the matching instance from the parent container
  */
  get(container: Container): any {
    return container.parent
      ? container.parent.get(this.key)
      : null;
  }

  /**
  * Creates a Parent Resolver for the supplied key.
  * @param key The key to resolve.
  * @return Returns an insance of Parent for the key.
  */
  static of(key : any) : Parent {
    return new Parent(key);
  }
}

export class StrategyResolver {
  constructor(strategy, state) {
    this.strategy = strategy;
    this.state = state;
  }

  get(container, key) {
    switch (this.strategy) {
    case 0: //instance
      return this.state;
    case 1: //singleton
      let singleton = container.invoke(this.state);
      this.state = singleton;
      this.strategy = 0;
      return singleton;
    case 2: //transient
      return container.invoke(this.state);
    case 3: //function
      return this.state(container, key, this);
    case 4: //array
      return this.state[0].get(container, key);
    case 5: //alias
      return container.get(this.state);
    default:
      throw new Error('Invalid strategy: ' + this.strategy);
    }
  }
}

/**
* Used to invoke a factory method.
*/
export class FactoryActivator {
  /**
  * The singleton instance of the FactoryActivator.
  */
  static instance = new FactoryActivator();

  /**
  * Invokes the factory function with the provided arguments.
  * @param fn The factory function.
  * @param keys The keys representing the function's service dependencies.
  * @return The newly created instance.
  */
  invoke(container, fn, keys): any {
    let i = keys.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(keys[i]);
    }

    return fn.apply(undefined, args);
  }

  /**
  * Invokes the factory function with the provided arguments.
  * @param fn The factory function.
  * @param keys The keys representing the function's service dependencies.
  * @param deps Additional function dependencies to use during invocation.
  * @return The newly created instance.
  */
  invokeWithDynamicDependencies(container, fn, keys, deps): any {
    let i = keys.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(keys[i]);
    }

    if (deps !== undefined) {
      args = args.concat(deps);
    }

    return fn.apply(undefined, args);
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*/
export class TransientRegistration {
  /**
  * Creates an instance of TransientRegistration.
  * @param key The key to register as.
  */
  constructor(key: any) {
    this.key = key;
  }

  /**
  * Called by the container to register the annotated function/class as transient.
  * @param container The container to register with.
  * @param key The key to register as.
  * @param fn The function to register (target of the annotation).
  * @return The resolver that should to be used.
  */
  createResolver(container: Container, key: any, fn: Function): Resolver {
    return new StrategyResolver(2, fn);
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*/
export class SingletonRegistration {
  /**
  * Creates an instance of SingletonRegistration.
  * @param key The key to register as.
  */
  constructor(keyOrRegisterInChild: any, registerInChild?: boolean = false) {
    if (typeof keyOrRegisterInChild === 'boolean') {
      this.registerInChild = keyOrRegisterInChild;
    } else {
      this.key = keyOrRegisterInChild;
      this.registerInChild = registerInChild;
    }
  }

  /**
  * Called by the container to register the annotated function/class as a singleton.
  * @param container The container to register with.
  * @param key The key to register as.
  * @param fn The function to register (target of the annotation).
  * @return The resolver that should to be used.
  */
  createResolver(container: Container, key: any, fn: Function): Resolver {
    let resolver = new StrategyResolver(1, fn);

    if (!this.registerInChild && container !== container.root) {
      container.root.registerResolver(this.key || key, resolver);
    }

    return resolver;
  }
}

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
export const _emptyParameters = Object.freeze([]);

metadata.registration = 'aurelia:registration';
metadata.instanceActivator = 'aurelia:instance-activator';

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
  registerInstance(key: any, instance?: any): void {
    this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  /**
  * Registers a type (constructor function) such that the container always returns the same instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerSingleton(key: any, fn?: Function): void {
    this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerTransient(key: any, fn?: Function): void {
    this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param handler The resolution function to use when the dependency is needed.
  */
  registerHandler(key: any, handler: (container?: Container, key?: any, resolver?: Resolver) => any): void {
    this.registerResolver(key, new StrategyResolver(3, handler));
  }

  /**
  * Registers an additional key that serves as an alias to the original DI key.
  * @param originalKey The key that originally identified the dependency; usually a constructor function.
  * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
  */
  registerAlias(originalKey: any, aliasKey: any): void {
    this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param resolver The resolver to use when the dependency is needed.
  */
  registerResolver(key: any, resolver: Resolver): void {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    let result = this.resolvers.get(key);

    if (result === undefined) {
      this.resolvers.set(key, resolver);
    } else if (result.strategy === 4) {
      result.state.push(resolver);
    } else {
      this.resolvers.set(key, new StrategyResolver(4, [result, resolver]));
    }
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  * @param fn The constructor function to use when the dependency needs to be instantiated.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  autoRegister(fn: any, key?: any): Resolver {
    let resolver;

    if (typeof fn === 'function') {
      let registration = metadata.get(metadata.registration, fn);

      if (registration === undefined) {
        resolver = new StrategyResolver(1, fn);
      } else {
        resolver = registration.createResolver(this, key === undefined ? fn : key, fn);
      }
    } else {
      resolver = new StrategyResolver(0, fn);
    }

    this.registerResolver(key === undefined ? fn : key, resolver);
    return resolver;
  }

  /**
  * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
  * @param fns The constructor function to use when the dependency needs to be instantiated.
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
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
    }

    return resolver.get(this, key);
  }

  _get(key) {
    let resolver = this.resolvers.get(key);

    if (resolver === undefined) {
      if (this.parent === null) {
        return this.autoRegister(key).get(this, key);
      }

      return this.parent._get(key);
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
      info = this.constructionInfo.get(fn);

      if (info === undefined) {
        info = this._createConstructionInfo(fn);
        this.constructionInfo.set(fn, info);
      }

      return info.activator.invoke(this, fn, info.keys);
    } catch (e) {
      throw new AggregateError(`Error invoking ${fn.name}. Check the inner error for details.`, e, true);
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
      info = this.constructionInfo.get(fn);

      if (info === undefined) {
        info = this._createConstructionInfo(fn);
        this.constructionInfo.set(fn, info);
      }

      return info.activator.invokeWithDynamicDependencies(this, fn, info.keys, deps);
    } catch (e) {
      throw new AggregateError(`Error invoking ${fn.name}. Check the inner error for details.`, e, true);
    }
  }

  _createConstructionInfo(fn) {
    let keys;

    if (typeof fn.inject === 'function') {
      keys = fn.inject();
    } else if (fn.inject === undefined) {
      keys = metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
    } else {
      keys = fn.inject;
    }

    let activator = metadata.getOwn(metadata.instanceActivator, fn)
      || classActivators[keys.length] || classActivators.fallback;

    return new ConstructionInfo(activator, keys);
  }
}

export function autoinject(potentialTarget?: any) {
  let deco = function(target) {
    target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export function inject(...rest: any[]) {
  return function(target, key, descriptor) {
    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}

export function registration(value: any) {
  return function(target) {
    metadata.define(metadata.registration, value, target);
  };
}

export function transient(key?: any) {
  return registration(new TransientRegistration(key));
}

export function singleton(keyOrRegisterInChild?: any, registerInChild?: boolean = false) {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator(value: any) {
  return function(target) {
    metadata.define(metadata.instanceActivator, value, target);
  };
}

export function factory() {
  return instanceActivator(FactoryActivator.instance);
}

decorators.configure.simpleDecorator('autoinject', autoinject);
decorators.configure.parameterizedDecorator('inject', inject);
decorators.configure.parameterizedDecorator('registration', registration);
decorators.configure.parameterizedDecorator('transient', transient);
decorators.configure.parameterizedDecorator('singleton', singleton);
decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
decorators.configure.parameterizedDecorator('factory', factory);
