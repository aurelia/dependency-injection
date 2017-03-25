import {StrategyResolver, Resolver} from './resolvers';
import {Container} from './container';
import {metadata} from 'aurelia-metadata';

/**
* Decorator: Specifies a custom registration strategy for the decorated class/function.
*/
export function registration(value: Registration): any {
  return function(target) {
    metadata.define(metadata.registration, value, target);
  };
}

/**
* Decorator: Specifies to register the decorated item with a "transient" lifetime.
*/
export function transient(key?: any): any {
  return registration(new TransientRegistration(key));
}

/**
* Decorator: Specifies to register the decorated item with a "singleton" lifetime.
*/
export function singleton(keyOrRegisterInChild?: any, registerInChild: boolean = false): any {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

/**
* Customizes how a particular function is resolved by the Container.
*/
export interface Registration {
  /**
  * Called by the container to register the resolver.
  * @param container The container the resolver is being registered with.
  * @param key The key the resolver should be registered as.
  * @param fn The function to create the resolver for.
  * @return The resolver that was registered.
  */
  registerResolver(container: Container, key: any, fn: Function): Resolver;
}

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*/
export class TransientRegistration {
  /** @internal */
  _key: any;

  /**
  * Creates an instance of TransientRegistration.
  * @param key The key to register as.
  */
  constructor(key?: any) {
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
    let existingResolver = container.getResolver(this._key || key);
    return existingResolver === undefined ? container.registerTransient(this._key || key, fn) : existingResolver;
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*/
export class SingletonRegistration {
  /** @internal */
  _registerInChild: any;

  /** @internal */
  _key: any;

  /**
  * Creates an instance of SingletonRegistration.
  * @param key The key to register as.
  */
  constructor(keyOrRegisterInChild?: any, registerInChild: boolean = false) {
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
    let targetContainer = this._registerInChild ? container : container.root;
    let existingResolver = targetContainer.getResolver(this._key || key);
    return existingResolver === undefined ? targetContainer.registerSingleton(this._key || key, fn) : existingResolver;
  }
}
