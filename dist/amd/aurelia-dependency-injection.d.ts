declare module 'aurelia-dependency-injection' {
  import core from 'core-js';
  import { AggregateError }  from 'aurelia-logging';
  import { Metadata, Decorators }  from 'aurelia-metadata';
  
  /**
  * Used to allow functions/classes to indicate that they should be registered as transients with the container.
  *
  * @class TransientRegistration
  * @constructor
  * @param {Object} [key] The key to register as.
  */
  export class TransientRegistration {
    constructor(key: any);
    
    /**
      * Called by the container to register the annotated function/class as transient.
      *
      * @method register
      * @param {Container} container The container to register with.
      * @param {Object} key The key to register as.
      * @param {Object} fn The function to register (target of the annotation).
      */
    register(container: any, key: any, fn: any): any;
  }
  
  /**
  * Used to allow functions/classes to indicate that they should be registered as singletons with the container.
  *
  * @class SingletonRegistration
  * @constructor
  * @param {Object} [key] The key to register as.
  */
  export class SingletonRegistration {
    constructor(keyOrRegisterInChild: any, registerInChild?: any);
    
    /**
      * Called by the container to register the annotated function/class as a singleton.
      *
      * @method register
      * @param {Container} container The container to register with.
      * @param {Object} key The key to register as.
      * @param {Object} fn The function to register (target of the annotation).
      */
    register(container: any, key: any, fn: any): any;
  }
  
  /**
  * An abstract resolver used to allow functions/classes to specify custom dependency resolution logic.
  *
  * @class Resolver
  * @constructor
  */
  export class Resolver {
    
    /**
      * Called by the container to allow custom resolution of dependencies for a function/class.
      *
      * @method get
      * @param {Container} container The container to resolve from.
      * @return {Object} Returns the resolved object.
      */
    get(container: any): any;
  }
  
  /**
  * Used to allow functions/classes to specify lazy resolution logic.
  *
  * @class Lazy
  * @constructor
  * @extends Resolver
  * @param {Object} key The key to lazily resolve.
  */
  export class Lazy extends Resolver {
    constructor(key: any);
    
    /**
      * Called by the container to lazily resolve the dependency into a lazy locator function.
      *
      * @method get
      * @param {Container} container The container to resolve from.
      * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
      */
    get(container: any): any;
    
    /**
      * Creates a Lazy Resolver for the supplied key.
      *
      * @method of
      * @static
      * @param {Object} key The key to lazily resolve.
      * @return {Lazy} Returns an insance of Lazy for the key.
      */
    static of(key: any): any;
  }
  
  /**
  * Used to allow functions/classes to specify resolution of all matches to a key.
  *
  * @class All
  * @constructor
  * @extends Resolver
  * @param {Object} key The key to lazily resolve all matches for.
  */
  export class All extends Resolver {
    constructor(key: any);
    
    /**
      * Called by the container to resolve all matching dependencies as an array of instances.
      *
      * @method get
      * @param {Container} container The container to resolve from.
      * @return {Object[]} Returns an array of all matching instances.
      */
    get(container: any): any;
    
    /**
      * Creates an All Resolver for the supplied key.
      *
      * @method of
      * @static
      * @param {Object} key The key to resolve all instances for.
      * @return {All} Returns an insance of All for the key.
      */
    static of(key: any): any;
  }
  
  /**
  * Used to allow functions/classes to specify an optional dependency, which will be resolved only if already registred with the container.
  *
  * @class Optional
  * @constructor
  * @extends Resolver
  * @param {Object} key The key to optionally resolve for.
  * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
  */
  export class Optional extends Resolver {
    constructor(key: any, checkParent?: any);
    
    /**
      * Called by the container to provide optional resolution of the key.
      *
      * @method get
      * @param {Container} container The container to resolve from.
      * @return {Object} Returns the instance if found; otherwise null.
      */
    get(container: any): any;
    
    /**
      * Creates an Optional Resolver for the supplied key.
      *
      * @method of
      * @static
      * @param {Object} key The key to optionally resolve for.
      * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
      * @return {Optional} Returns an insance of Optional for the key.
      */
    static of(key: any, checkParent?: any): any;
  }
  
  /**
  * Used to inject the dependency from the parent container instead of the current one.
  *
  * @class Parent
  * @constructor
  * @extends Resolver
  * @param {Object} key The key to resolve from the parent container.
  */
  export class Parent extends Resolver {
    constructor(key: any);
    
    /**
      * Called by the container to load the dependency from the parent container
      *
      * @method get
      * @param {Container} container The container to resolve the parent from.
      * @return {Function} Returns the matching instance from the parent container
      */
    get(container: any): any;
    
    /**
      * Creates a Parent Resolver for the supplied key.
      *
      * @method of
      * @static
      * @param {Object} key The key to resolve.
      * @return {Parent} Returns an insance of Parent for the key.
      */
    static of(key: any): any;
  }
  
  /**
  * Used to instantiate a class.
  *
  * @class ClassActivator
  * @constructor
  */
  export class ClassActivator {
    static instance: any;
    invoke(fn: any, args: any): any;
  }
  
  /**
  * Used to invoke a factory method.
  *
  * @class FactoryActivator
  * @constructor
  */
  export class FactoryActivator {
    static instance: any;
    invoke(fn: any, args: any): any;
  }
  export var emptyParameters: any;
  
  /**
  * A lightweight, extensible dependency injection container.
  *
  * @class Container
  * @constructor
  */
  export class Container {
    constructor(constructionInfo: any);
    
    /**
      * Makes this container instance globally reachable through Container.instance.
      *
      * @method makeGlobal
      */
    makeGlobal(): any;
    
    /**
     * Adds an additional location to search for constructor parameter type info.
     *
     * @method addParameterInfoLocator
     * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
     */
    addParameterInfoLocator(locator: any): any;
    
    /**
      * Registers an existing object instance with the container.
      *
      * @method registerInstance
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Object} instance The instance that will be resolved when the key is matched.
      */
    registerInstance(key: any, instance: any): any;
    
    /**
      * Registers a type (constructor function) such that the container returns a new instance for each request.
      *
      * @method registerTransient
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
      */
    registerTransient(key: any, fn: any): any;
    
    /**
      * Registers a type (constructor function) such that the container always returns the same instance for each request.
      *
      * @method registerSingleton
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
      */
    registerSingleton(key: any, fn: any): any;
    
    /**
      * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
      *
      * @method autoRegister
      * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
      * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
      */
    autoRegister(fn: any, key: any): any;
    
    /**
      * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
      *
      * @method autoRegisterAll
      * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
      */
    autoRegisterAll(fns: any): any;
    
    /**
      * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
      *
      * @method registerHandler
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
      */
    registerHandler(key: any, handler: any): any;
    
    /**
      * Unregisters based on key.
      *
      * @method unregister
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      */
    unregister(key: any): any;
    
    /**
      * Resolves a single instance based on the provided key.
      *
      * @method get
      * @param {Object} key The key that identifies the object to resolve.
      * @return {Object} Returns the resolved instance.
      */
    get(key: any): any;
    
    /**
      * Resolves all instance registered under the provided key.
      *
      * @method getAll
      * @param {Object} key The key that identifies the objects to resolve.
      * @return {Object[]} Returns an array of the resolved instances.
      */
    getAll(key: any): any;
    
    /**
      * Inspects the container to determine if a particular key has been registred.
      *
      * @method hasHandler
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
      * @return {Boolean} Returns true if the key has been registred; false otherwise.
      */
    hasHandler(key: any, checkParent?: any): any;
    
    /**
      * Creates a new dependency injection container whose parent is the current container.
      *
      * @method createChild
      * @return {Container} Returns a new container instance parented to this.
      */
    createChild(): any;
    
    /**
      * Invokes a function, recursively resolving its dependencies.
      *
      * @method invoke
      * @param {Function} fn The function to invoke with the auto-resolved dependencies.
      * @return {Object} Returns the instance resulting from calling the function.
      */
    invoke(fn: any): any;
    getOrCreateEntry(key: any): any;
    getOrCreateConstructionInfo(fn: any): any;
    createConstructionInfo(fn: any): any;
  }
  export function autoinject(target: any): any;
  export function inject(...rest: any[]): any;
  export function registration(value: any): any;
  export function transient(key: any): any;
  export function singleton(keyOrRegisterInChild: any, registerInChild?: any): any;
  export function instanceActivator(value: any): any;
  export function factory(): any;
}