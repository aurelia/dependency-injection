import {metadata} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-pal';
import {ConfigurationRegistration} from './registrations';
import {resolver, StrategyResolver, Resolver} from './resolvers';
import {Invoker} from './invokers';

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';
export const _emptyParameters = Object.freeze([]);

metadata.registration = 'aurelia:registration';
metadata.invoker = 'aurelia:invoker';

export const congigurations = new Set();
metadata.define(metadata.registration, congigurations, ConfigurationRegistration);

let resolverDecorates = resolver.decorates;

/**
* Stores the information needed to invoke a function.
*/
export class InvocationHandler {
  /**
  * The function to be invoked by this handler.
  */
  fn: Function;

  /**
  * The invoker implementation that will be used to actually invoke the function.
  */
  invoker: Invoker;

  /**
  * The statically known dependencies of this function invocation.
  */
  dependencies: any[];

  /**
  * Instantiates an InvocationDescription.
  * @param fn The Function described by this description object.
  * @param invoker The strategy for invoking the function.
  * @param dependencies The static dependencies of the function call.
  */
  constructor(fn: Function, invoker: Invoker, dependencies: any[]) {
    this.fn = fn;
    this.invoker = invoker;
    this.dependencies = dependencies;
  }

  /**
  * Invokes the function.
  * @param container The calling container.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invoke(container: Container, dynamicDependencies?: any[]): any {
    return dynamicDependencies !== undefined
      ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
      : this.invoker.invoke(container, this.fn, this.dependencies);
  }
}

/**
* Used to configure a Container instance.
*/
export interface ContainerConfiguration {
  /**
  * An optional callback which will be called when any function needs an InvocationHandler created (called once per Function).
  */
  onHandlerCreated?: (handler: InvocationHandler) => InvocationHandler;

  handlers?: Map<any, any>;
}

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

/**
* A lightweight, extensible dependency injection container.
*/
export class Container {
  /**
  * The global root Container instance. Available if makeGlobal() has been called. Aurelia Framework calls makeGlobal().
  */
  static instance: Container;

  /**
  * The parent container in the DI hierarchy.
  */
  parent: Container;

  /**
  * The root container in the DI hierarchy.
  */
  root: Container;

  /** @internal */
  _configuration: ContainerConfiguration;

  /** @internal */
  _onHandlerCreated: (handler: InvocationHandler) => InvocationHandler;

  /** @internal */
  _handlers: Map<any, any>;

  /** @internal */
  _resolvers: Map<any, any>;

  /**
  * Creates an instance of Container.
  * @param configuration Provides some configuration for the new Container instance.
  */
  constructor(configuration?: ContainerConfiguration) {
    if (configuration === undefined) {
      configuration = {};
    }

    this._configuration = configuration;
    this._onHandlerCreated = configuration.onHandlerCreated;
    this._handlers = configuration.handlers || (configuration.handlers = new Map());
    this._resolvers = new Map();
    this._configInitialized = false;
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
  * Sets an invocation handler creation callback that will be called when new InvocationsHandlers are created (called once per Function).
  * @param onHandlerCreated The callback to be called when an InvocationsHandler is created.
  */
  setHandlerCreatedCallback(onHandlerCreated: (handler: InvocationHandler) => InvocationHandler) {
    this._onHandlerCreated = onHandlerCreated;
    this._configuration.onHandlerCreated = onHandlerCreated;
  }

  /**
  * Registers an existing object instance with the container.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param instance The instance that will be resolved when the key is matched. This defaults to the key value when instance is not supplied.
  * @return The resolver that was registered.
  */
  registerInstance(key: any, instance?: any): Resolver {
    return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
  }

  /**
  * Registers a type (constructor function) such that the container always returns the same instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
  * @return The resolver that was registered.
  */
  registerSingleton(key: any, fn?: Function): Resolver {
    return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
  * @return The resolver that was registered.
  */
  registerTransient(key: any, fn?: Function): Resolver {
    return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param handler The resolution function to use when the dependency is needed.
  * @return The resolver that was registered.
  */
  registerHandler(key: any, handler: (container?: Container, key?: any, resolver?: Resolver) => any): Resolver {
    return this.registerResolver(key, new StrategyResolver(3, handler));
  }

  /**
  * Registers an additional key that serves as an alias to the original DI key.
  * @param originalKey The key that originally identified the dependency; usually a constructor function.
  * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
  * @return The resolver that was registered.
  */
  registerAlias(originalKey: any, aliasKey: any): Resolver {
    return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param resolver The resolver to use when the dependency is needed.
  * @return The resolver that was registered.
  */
  registerResolver(key: any, resolver: Resolver): Resolver {
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

    return resolver;
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param fn The constructor function to use when the dependency needs to be instantiated. This defaults to the key value when fn is not supplied.
  */
  autoRegister(key: any, fn?: Function): Resolver {
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
    this._resolvers.delete(key);
  }

  /**
  * Inspects the container to determine if a particular key has been registred.
  * @param key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param checkParent Indicates whether or not to check the parent container hierarchy.
  * @return Returns true if the key has been registred; false otherwise.
  */
  hasResolver(key: any, checkParent: boolean = false): boolean {
    if (key === null || key === undefined) {
      throw new Error(badKeyError);
    }

    return this._resolvers.has(key) || (checkParent && this.parent !== null && this.parent.hasResolver(key, checkParent));
  }

  /**
   * Run registration for all config classes
   *
   * @private
   */
  _registerAllConfigs() {
    if (!this._configInitialized) {
      this._configInitialized = true; // this method is not recursive
      let configs = metadata.get(metadata.registration, ConfigurationRegistration);
      configs.forEach((config) => {
        config.registerResolver(this, config.target);
        this._get(config.target);
      });
    }
  }

  /**
  * Resolves a single instance based on the provided key.
  * @param key The key that identifies the object to resolve.
  * @return Returns the resolved instance.
  */
  get(key: any): any {
    this._registerAllConfigs();

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

  /**
  * Resolves all instance registered under the provided key.
  * @param key The key that identifies the objects to resolve.
  * @return Returns an array of the resolved instances.
  */
  getAll(key: any): any[] {
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

  /**
  * Creates a new dependency injection container whose parent is the current container.
  * @return Returns a new container instance parented to this.
  */
  createChild(): Container {
    let child = new Container(this._configuration);
    child.root = this.root;
    child.parent = this;
    return child;
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  * @param fn The function to invoke with the auto-resolved dependencies.
  * @param dynamicDependencies Additional function dependencies to use during invocation.
  * @return Returns the instance resulting from calling the function.
  */
  invoke(fn: Function & { name?: string }, dynamicDependencies?: any[]) {
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

  _createInvocationHandler(fn: Function & { inject?: any }): InvocationHandler {
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

    let invoker = metadata.getOwn(metadata.invoker, fn)
      || classInvokers[dependencies.length] || classInvokers.fallback;

    let handler = new InvocationHandler(fn, invoker, dependencies);
    return this._onHandlerCreated !== undefined ? this._onHandlerCreated(handler) : handler;
  }
}
