import {StrategyResolver, Resolver} from './resolvers';

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
