import * as core from 'core-js';

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*/
export class TransientRegistration {
  /**
  * Creates an instance of TransientRegistration.
  * @param [key] The key to register as.
  */
  constructor(key: any) {
    this.key = key;
  }

  /**
  * Called by the container to register the annotated function/class as transient.
  * @param container The container to register with.
  * @param key The key to register as.
  * @param fn The function to register (target of the annotation).
  */
  register(container: Container, key: any, fn: Function): void {
    container.registerTransient(this.key || key, fn);
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*/
export class SingletonRegistration {
  /**
  * Creates an instance of SingletonRegistration.
  * @param [key] The key to register as.
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
  */
  register(container: Container, key: any, fn: Function): void {
    let destination = this.registerInChild ? container : container.root;
    destination.registerSingleton(this.key || key, fn);
  }
}

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
    if (container.hasHandler(this.key, this.checkParent)) {
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

/**
* Used to instantiate a class.
*/
export class ClassActivator {
  /**
  * The singleton instance of the ClassActivator.
  */
  static instance = new ClassActivator();

  /**
  * Invokes the classes constructor with the provided arguments.
  * @param fn The constructor function.
  * @param args The constructor args.
  * @return The newly created instance.
  */
  invoke(fn: Function, args: any[]): any {
    return Reflect.construct(fn, args);
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
  * @param args The function args.
  * @return The newly created instance.
  */
  invoke(fn: Function, args: any[]): any {
    return fn.apply(undefined, args);
  }
}
