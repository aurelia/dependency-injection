import {StrategyResolver, Resolver} from './resolvers';
import {Container} from './container';
import {metadata} from 'aurelia-metadata';
import {factory} from './invokers';

/**
* Decorator: Specifies a custom registration strategy for the decorated class/function.
*/
export function registration(value: Registration): any {
  return function(target, key, descriptor) {
    if (key && key.length > 0) {
      value.factoryFn = target[key].bind(target);
      // TODO: move key to metadata
      target = metadata.get('design:returntype', target, key);
    }

    if (value instanceof ConfigurationRegistration) {
      value.target = target;
      ConfigurationRegistration.configurations.add(value);

      if(!metadata.get(metadata.registration, ConfigurationRegistration)) {
        metadata.define(metadata.registration, ConfigurationRegistration.configurations, ConfigurationRegistration);
      }

    } else {
      metadata.define(metadata.registration, value, target);
    }
  };
}

/**
* Decorator: Specifies to register the decorated item with a "transient" lifetime.
*/
export function transient(key?: any): any {
  return registration(new TransientRegistration(key));
}

/**
* Decorator: Specifies to register the decorated item with a "singleton" lieftime.
*/
export function singleton(keyOrRegisterInChild?: any, registerInChild: boolean = false): any {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

/**
 * Decorator: Specifies to register the decorated item as a configuration class.
 * @param child Should a child container be created?
 * @returns {any}
 */
export function config(child?: boolean): any {
  return registration(new ConfigurationRegistration(child));
}

/**
* Customizes how a particular function is resolved by the Container.
*/
export class Registration {
  /**
   * Factory function invoked instead of the target
   */
  factoryFn: Function;

  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    if (this.factoryFn) {
      factory(this.factoryFn);
      return this.factoryFn;
    }

    return fn;
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*/
export class TransientRegistration extends Registration {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of TransientRegistration.
  * @param key The key to register as.
  */
  constructor(key?: any) {
    super();
    this._key = key;
  }

  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    return container.registerTransient(this._key || key, fn);
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*/
export class SingletonRegistration extends Registration {
  /** @internal */
  _registerInChild: any;

  /** @internal */
  _key: any;

  /**
  * Creates an instance of SingletonRegistration.
  * @param key The key to register as.
  */
  constructor(keyOrRegisterInChild?: any, registerInChild: boolean = false) {
    super();

    if (typeof keyOrRegisterInChild === 'boolean') {
      this._registerInChild = keyOrRegisterInChild;
    } else {
      this._key = keyOrRegisterInChild;
      this._registerInChild = registerInChild;
    }
  }

  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    fn = super.registerResolver(container, key, fn);

    return this._registerInChild
      ? container.registerSingleton(this._key || key, fn)
      : container.root.registerSingleton(this._key || key, fn);
  }
}

/**
 * Used to allow creating configuration classes that will be invoked automatically by the framework to allow
 * configuring dependencies
 */
class ConfigurationRegistration extends Registration {
  static configurations = new Set();

  createChild: boolean;
  target: any;

  /**
   * Creates an instance of ConfigurationRegistration
   * @param createChild Indicates if a child container should be created
   */
  constructor(createChild: boolean) {
    super();
    this.createChild = createChild;
  }

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  registerResolver(container: Container, key: any, fn: Function): Resolver {
    container.registerSingleton(this._key || key, fn);
  }
}
