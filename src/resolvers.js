import {protocol} from 'aurelia-metadata';
import {Container} from './container';

/**
* Decorator: Indicates that the decorated class/object is a custom resolver.
*/
export const resolver: Function & { decorates?: any } = protocol.create('aurelia:resolver', function(target): string | boolean {
  if (!(typeof target.get === 'function')) {
    return 'Resolvers must implement: get(container: Container, key: any): any';
  }

  return true;
});

/**
* Used to allow functions/classes to specify custom dependency resolution logic.
*/
export interface Resolver {
  /**
  * Called by the container to allow custom resolution of dependencies for a function/class.
  * @param container The container to resolve from.
  * @param key The key that the resolver was registered as.
  * @return Returns the resolved object.
  */
  get(container: Container, key: any): any;
}

/**
* Used to allow functions/classes to specify lazy resolution logic.
*/
@resolver()
export class Lazy {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of the Lazy class.
  * @param key The key to lazily resolve.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to lazily resolve the dependency into a lazy locator function.
  * @param container The container to resolve from.
  * @return Returns a function which can be invoked at a later time to obtain the actual dependency.
  */
  get(container: Container): any {
    return () => container.get(this._key);
  }

  /**
  * Creates a Lazy Resolver for the supplied key.
  * @param key The key to lazily resolve.
  * @return Returns an instance of Lazy for the key.
  */
  static of(key: any): Lazy {
    return new Lazy(key);
  }
}

/**
* Used to allow functions/classes to specify resolution of all matches to a key.
*/
@resolver()
export class All {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of the All class.
  * @param key The key to lazily resolve all matches for.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to resolve all matching dependencies as an array of instances.
  * @param container The container to resolve from.
  * @return Returns an array of all matching instances.
  */
  get(container: Container): any[] {
    return container.getAll(this._key);
  }

  /**
  * Creates an All Resolver for the supplied key.
  * @param key The key to resolve all instances for.
  * @return Returns an instance of All for the key.
  */
  static of(key: any): All {
    return new All(key);
  }
}

/**
* Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
*/
@resolver()
export class Optional {
  /** @internal */
  _key: any;

  /** @internal */
  _checkParent: boolean;

  /**
  * Creates an instance of the Optional class.
  * @param key The key to optionally resolve for.
  * @param checkParent Indicates whether or not the parent container hierarchy should be checked.
  */
  constructor(key: any, checkParent: boolean = true) {
    this._key = key;
    this._checkParent = checkParent;
  }

  /**
  * Called by the container to provide optional resolution of the key.
  * @param container The container to resolve from.
  * @return Returns the instance if found; otherwise null.
  */
  get(container: Container): any {
    if (container.hasResolver(this._key, this._checkParent)) {
      return container.get(this._key);
    }

    return null;
  }

  /**
  * Creates an Optional Resolver for the supplied key.
  * @param key The key to optionally resolve for.
  * @param [checkParent=true] Indicates whether or not the parent container hierarchy should be checked.
  * @return Returns an instance of Optional for the key.
  */
  static of(key: any, checkParent: boolean = true): Optional {
    return new Optional(key, checkParent);
  }
}


/**
* Used to inject the dependency from the parent container instead of the current one.
*/
@resolver()
export class Parent {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of the Parent class.
  * @param key The key to resolve from the parent container.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to load the dependency from the parent container
  * @param container The container to resolve the parent from.
  * @return Returns the matching instance from the parent container
  */
  get(container: Container): any {
    return container.parent
      ? container.parent.get(this._key)
      : null;
  }

  /**
  * Creates a Parent Resolver for the supplied key.
  * @param key The key to resolve.
  * @return Returns an instance of Parent for the key.
  */
  static of(key: any) : Parent {
    return new Parent(key);
  }
}

@resolver()
export class StrategyResolver {
  strategy: StrategyResolver | number;
  state: any;

  /**
  * Creates an instance of the StrategyResolver class.
  * @param strategy The type of resolution strategy.
  * @param state The state associated with the resolution strategy.
  */
  constructor(strategy, state) {
    this.strategy = strategy;
    this.state = state;
  }

  /**
  * Called by the container to allow custom resolution of dependencies for a function/class.
  * @param container The container to resolve from.
  * @param key The key that the resolver was registered as.
  * @return Returns the resolved object.
  */
  get(container: Container, key: any): any {
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
* Used to allow injecting dependencies but also passing data to the constructor.
*/
@resolver()
export class Factory {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of the Factory class.
  * @param key The key to resolve from the parent container.
  */
  constructor(key: any) {
    this._key = key;
  }

  /**
  * Called by the container to pass the dependencies to the constructor.
  * @param container The container to invoke the constructor with dependencies and other parameters.
  * @return Returns a function that can be invoked to resolve dependencies later, and the rest of the parameters.
  */
  get(container: Container): any {
    return (...rest) => container.invoke(this._key, rest);
  }

  /**
  * Creates a Factory Resolver for the supplied key.
  * @param key The key to resolve.
  * @return Returns an instance of Factory for the key.
  */
  static of(key: any): Factory {
    return new Factory(key);
  }
}

/**
* Used to inject a new instance of a dependency, without regard for existing
* instances in the container. Instances can optionally be registered in the container
* under a different key by supplying a key using the `as` method.
*/
@resolver()
export class NewInstance {
  key;
  asKey;

  /**
  * Creates an instance of the NewInstance class.
  * @param key The key to resolve/instantiate.
  * @param dynamicDependencies An optional list of dynamic dependencies.
  */
  constructor(key, ...dynamicDependencies: any[]) {
    this.key = key;
    this.asKey = key;
    this.dynamicDependencies = dynamicDependencies;
  }

  /**
  * Called by the container to instantiate the dependency and potentially register
  * as another key if the `as` method was used.
  * @param container The container to resolve the parent from.
  * @return Returns the matching instance from the parent container
  */
  get(container) {
    let dynamicDependencies = this.dynamicDependencies.length > 0 ?
      this.dynamicDependencies.map(dependency => dependency['protocol:aurelia:resolver'] ?
        dependency.get(container) : container.get(dependency)) : undefined;
    const instance = container.invoke(this.key, dynamicDependencies);
    container.registerInstance(this.asKey, instance);
    return instance;
  }

  /**
  * Instructs the NewInstance resolver to register the resolved instance using the supplied key.
  * @param key The key to register the instance with.
  * @return Returns the NewInstance resolver.
  */
  as(key) {
    this.asKey = key;
    return this;
  }

  /**
  * Creates an NewInstance Resolver for the supplied key.
  * @param key The key to resolve/instantiate.
  * @param dynamicDependencies An optional list of dynamic dependencies.
  * @return Returns an instance of NewInstance for the key.
  */
  static of(key, ...dynamicDependencies: any[]) {
    return new NewInstance(key, ...dynamicDependencies);
  }
}

export function getDecoratorDependencies(target, name) {
  let dependencies = target.inject;
  if (typeof dependencies === 'function') {
    throw new Error('Decorator ' + name + ' cannot be used with "inject()".  Please use an array instead.');
  }
  if (!dependencies) {
    dependencies = metadata.getOwn(metadata.paramTypes, target).slice();
    target.inject = dependencies;
  }

  return dependencies;
}

/**
* Decorator: Specifies the dependency should be lazy loaded
*/
export function lazy(keyValue: any) {
  return function(target, key, index) {
    let params = getDecoratorDependencies(target, 'lazy');
    params[index] = Lazy.of(keyValue);
  };
}

/**
* Decorator: Specifies the dependency should load all instances of the given key.
*/
export function all(keyValue: any) {
  return function(target, key, index) {
    let params = getDecoratorDependencies(target, 'all');
    params[index] = All.of(keyValue);
  };
}

/**
* Decorator: Specifies the dependency as optional
*/
export function optional(checkParentOrTarget: boolean = true) {
  let deco = function(checkParent: boolean) {
    return function(target, key, index) {
      let params = getDecoratorDependencies(target, 'optional');
      params[index] = Optional.of(params[index], checkParent);
    };
  };
  if (typeof checkParentOrTarget === 'boolean') {
    return deco(checkParentOrTarget);
  }
  return deco(true);
}

/**
* Decorator: Specifies the dependency to look at the parent container for resolution
*/
export function parent(target, key, index) {
  let params = getDecoratorDependencies(target, 'parent');
  params[index] = Parent.of(params[index]);
}

/**
* Decorator: Specifies the dependency to create a factory method, that can accept optional arguments
*/
export function factory(keyValue: any, asValue?: any) {
  return function(target, key, index) {
    let params = getDecoratorDependencies(target, 'factory');
    let factory = Factory.of(keyValue);
    params[index] = asValue ? factory.as(asValue) : factory;
  };
}

/**
* Decorator: Specifies the dependency as a new instance
*/
export function newInstance(asKeyOrTarget?: any, ...dynamicDependencies: any[]) {
  let deco = function(asKey?: any) {
    return function(target, key, index) {
      let params = getDecoratorDependencies(target, 'newInstance');
      params[index] = NewInstance.of(params[index], ...dynamicDependencies);
      if (!!asKey) {
        params[index].as(asKey);
      }
    };
  };
  if (arguments.length >= 1) {
    return deco(asKeyOrTarget);
  }
  return deco();
}
