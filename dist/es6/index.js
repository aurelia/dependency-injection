import core from 'core-js';
import {AggregateError} from 'aurelia-logging';
import {Metadata,Decorators} from 'aurelia-metadata';

const badKeyError = 'key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?';

Metadata.registration = 'aurelia:registration';
Metadata.instanceActivator = 'aurelia:instance-activator';

// Fix Function#name on browsers that do not support it (IE):
function test(){}
if (!test.name) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
      // For better performance only parse once, and then cache the
      // result through a new accessor for repeated access.
      Object.defineProperty(this, 'name', { value: name });
      return name;
    }
  });
}

export var emptyParameters = Object.freeze([]);

/**
* A lightweight, extensible dependency injection container.
*
* @class Container
* @constructor
*/
export class Container {
  constructor(constructionInfo) {
    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
    this.root = this;
  }

  /**
  * Makes this container instance globally reachable through Container.instance.
  *
  * @method makeGlobal
  */
  makeGlobal(){
    Container.instance = this;
    return this;
  }

 /**
 * Adds an additional location to search for constructor parameter type info.
 *
 * @method addParameterInfoLocator
 * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
 */
  addParameterInfoLocator(locator){
    if(this.locateParameterInfoElsewhere === undefined){
      this.locateParameterInfoElsewhere = locator;
      return;
    }

    var original = this.locateParameterInfoElsewhere;
    this.locateParameterInfoElsewhere = (fn) => {return original(fn) || locator(fn);};
  }

  /**
  * Registers an existing object instance with the container.
  *
  * @method registerInstance
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Object} instance The instance that will be resolved when the key is matched.
  */
  registerInstance(key, instance) {
    this.registerHandler(key, x => instance);
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  *
  * @method registerTransient
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerTransient(key, fn) {
    fn = fn || key;
    this.registerHandler(key, x => x.invoke(fn));
  }

  /**
  * Registers a type (constructor function) such that the container always returns the same instance for each request.
  *
  * @method registerSingleton
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerSingleton(key, fn) {
    var singleton = null;
    fn = fn || key;
    this.registerHandler(key, x => singleton || (singleton = x.invoke(fn)));
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  *
  * @method autoRegister
  * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
  * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
  */
  autoRegister(fn, key){
    var registration;

    if (fn === null || fn === undefined){
      throw new Error(badKeyError)
    }

    if(typeof fn === 'function'){
      registration = Metadata.get(Metadata.registration, fn);

      if(registration !== undefined){
        registration.register(this, key || fn, fn);
      }else{
        this.registerSingleton(key || fn, fn);
      }
    }else{
      this.registerInstance(fn, fn);
    }
  }

  /**
  * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
  *
  * @method autoRegisterAll
  * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
  */
  autoRegisterAll(fns){
    var i = fns.length;
    while(i--) {
      this.autoRegister(fns[i]);
    }
  }

  /**
  * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
  *
  * @method registerHandler
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
  */
  registerHandler(key, handler) {
    this.getOrCreateEntry(key).push(handler);
  }

  /**
  * Unregisters based on key.
  *
  * @method unregister
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  unregister(key) {
    this.entries.delete(key);
  }

  /**
  * Resolves a single instance based on the provided key.
  *
  * @method get
  * @param {Object} key The key that identifies the object to resolve.
  * @return {Object} Returns the resolved instance.
  */
  get(key) {
    var entry;

    if (key === null || key === undefined){
      throw new Error(badKeyError);
    }

    if(key === Container){
      return this;
    }

    if(key instanceof Resolver){
      return key.get(this);
    }

    entry = this.entries.get(key);

    if (entry !== undefined) {
      return entry[0](this);
    }

    if(this.parent){
      return this.parent.get(key);
    }

    this.autoRegister(key);
    entry = this.entries.get(key);

    return entry[0](this);
  }

  /**
  * Resolves all instance registered under the provided key.
  *
  * @method getAll
  * @param {Object} key The key that identifies the objects to resolve.
  * @return {Object[]} Returns an array of the resolved instances.
  */
  getAll(key) {
    var entry;

    if (key === null || key === undefined){
      throw new Error(badKeyError);
    }

    entry = this.entries.get(key);

    if(entry !== undefined){
      return entry.map(x => x(this));
    }

    if(this.parent){
      return this.parent.getAll(key);
    }

    return [];
  }

  /**
  * Inspects the container to determine if a particular key has been registred.
  *
  * @method hasHandler
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
  * @return {Boolean} Returns true if the key has been registred; false otherwise.
  */
  hasHandler(key, checkParent=false) {
    if (key === null || key === undefined){
      throw new Error(badKeyError);
    }

    return this.entries.has(key)
      || (checkParent && this.parent && this.parent.hasHandler(key, checkParent));
  }

  /**
  * Creates a new dependency injection container whose parent is the current container.
  *
  * @method createChild
  * @return {Container} Returns a new container instance parented to this.
  */
  createChild(){
    var childContainer = new Container(this.constructionInfo);
    childContainer.parent = this;
    childContainer.root = this.root;
    childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
    return childContainer;
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  *
  * @method invoke
  * @param {Function} fn The function to invoke with the auto-resolved dependencies.
  * @return {Object} Returns the instance resulting from calling the function.
  */
  invoke(fn) {
    try{
      var info = this.getOrCreateConstructionInfo(fn),
          keys = info.keys,
          args = new Array(keys.length),
          i, ii;

      for(i = 0, ii = keys.length; i < ii; ++i){
        args[i] = this.get(keys[i]);
      }

      return info.activator.invoke(fn, args);
    }catch(e){
      var activatingText = info.activator instanceof ClassActivator ? 'instantiating' : 'invoking';
      var message = `Error ${activatingText} ${fn.name}.`
      if (i < ii) {
        message += ` The argument at index ${i} (key:${keys[i]}) could not be satisfied.`;
      }

      message += ' Check the inner error for details.'

      throw AggregateError(message, e, true);
    }
  }

  getOrCreateEntry(key) {
    var entry;

    if (key === null || key === undefined){
      throw new Error('key cannot be null or undefined.  (Are you trying to inject something that doesn\'t exist with DI?)');
    }

    entry = this.entries.get(key);

    if (entry === undefined) {
      entry = [];
      this.entries.set(key, entry);
    }

    return entry;
  }

  getOrCreateConstructionInfo(fn){
    var info = this.constructionInfo.get(fn);

    if(info === undefined){
      info = this.createConstructionInfo(fn);
      this.constructionInfo.set(fn, info);
    }

    return info;
  }

  createConstructionInfo(fn){
    var info = {activator: Metadata.getOwn(Metadata.instanceActivator, fn) || ClassActivator.instance};

    if(fn.inject !== undefined){
      if(typeof fn.inject === 'function'){
        info.keys = fn.inject();
      }else{
        info.keys = fn.inject;
      }

      return info;
    }

    if(this.locateParameterInfoElsewhere !== undefined){
      info.keys = this.locateParameterInfoElsewhere(fn) || Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
    }else{
      info.keys = Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
    }

    return info;
  }
}

export function autoinject(target){
  var deco = function(target){
    target.inject = Reflect.getOwnMetadata(Metadata.paramTypes, target) || emptyParameters;
  };

  return target ? deco(target) : deco;
}

export function inject(...rest){
  return function(target){
    target.inject = rest;
  }
}

export function registration(value){
  return function(target){
    Reflect.defineMetadata(Metadata.registration, value, target);
  }
}

export function transient(key){
  return registration(new TransientRegistration(key));
}

export function singleton(keyOrRegisterInChild, registerInChild=false){
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator(value){
  return function(target){
    Reflect.defineMetadata(Metadata.instanceActivator, value, target);
  }
}

export function factory(){
  return instanceActivator(FactoryActivator.instance);
}

Decorators.configure.simpleDecorator('autoinject', autoinject);
Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('registration', registration);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
Decorators.configure.parameterizedDecorator('factory', factory);

/**
* Used to allow functions/classes to indicate that they should be registered as transients with the container.
*
* @class TransientRegistration
* @constructor
* @param {Object} [key] The key to register as.
*/
export class TransientRegistration {
  constructor(key){
    this.key = key;
  }

  /**
  * Called by the container to register the annotated function/class as transient.
  *
  * @method register
  * @param {Container} container The container to register with.
  * @param {Object} key The key to register as.
  * @param {Object} fn The function to register (target of the annotation).
  */
  register(container, key, fn){
    container.registerTransient(this.key || key, fn);
  }
}

/**
* Used to allow functions/classes to indicate that they should be registered as singletons with the container.
*
* @class SingletonRegistration
* @constructor
* @param {Object} [key] The key to register as.
*/
export class SingletonRegistration {
  constructor(keyOrRegisterInChild, registerInChild=false){
    if(typeof keyOrRegisterInChild === 'boolean'){
      this.registerInChild = keyOrRegisterInChild;
    }else{
      this.key = keyOrRegisterInChild;
      this.registerInChild = registerInChild;
    }
  }

  /**
  * Called by the container to register the annotated function/class as a singleton.
  *
  * @method register
  * @param {Container} container The container to register with.
  * @param {Object} key The key to register as.
  * @param {Object} fn The function to register (target of the annotation).
  */
  register(container, key, fn){
    var destination = this.registerInChild ? container : container.root;
    destination.registerSingleton(this.key || key, fn);
  }
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
  get(container){
    throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
  }
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
  constructor(key){
    super();
    this.key = key;
  }

  /**
  * Called by the container to lazily resolve the dependency into a lazy locator function.
  *
  * @method get
  * @param {Container} container The container to resolve from.
  * @return {Function} Returns a function which can be invoked at a later time to obtain the actual dependency.
  */
  get(container){
    return () => {
      return container.get(this.key);
    };
  }

  /**
  * Creates a Lazy Resolver for the supplied key.
  *
  * @method of
  * @static
  * @param {Object} key The key to lazily resolve.
  * @return {Lazy} Returns an insance of Lazy for the key.
  */
  static of(key){
    return new Lazy(key);
  }
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
  constructor(key){
    super();
    this.key = key;
  }

  /**
  * Called by the container to resolve all matching dependencies as an array of instances.
  *
  * @method get
  * @param {Container} container The container to resolve from.
  * @return {Object[]} Returns an array of all matching instances.
  */
  get(container){
    return container.getAll(this.key);
  }

  /**
  * Creates an All Resolver for the supplied key.
  *
  * @method of
  * @static
  * @param {Object} key The key to resolve all instances for.
  * @return {All} Returns an insance of All for the key.
  */
  static of(key){
    return new All(key);
  }
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
  constructor(key, checkParent=false){
    super();
    this.key = key;
    this.checkParent = checkParent;
  }

  /**
  * Called by the container to provide optional resolution of the key.
  *
  * @method get
  * @param {Container} container The container to resolve from.
  * @return {Object} Returns the instance if found; otherwise null.
  */
  get(container){
    if(container.hasHandler(this.key, this.checkParent)){
      return container.get(this.key);
    }

    return null;
  }

  /**
  * Creates an Optional Resolver for the supplied key.
  *
  * @method of
  * @static
  * @param {Object} key The key to optionally resolve for.
  * @param {Boolean} [checkParent=false] Indicates whether or not the parent container hierarchy should be checked.
  * @return {Optional} Returns an insance of Optional for the key.
  */
  static of(key, checkParent=false){
    return new Optional(key, checkParent);
  }
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
  constructor(key){
    super();
    this.key = key;
  }

  /**
  * Called by the container to load the dependency from the parent container
  *
  * @method get
  * @param {Container} container The container to resolve the parent from.
  * @return {Function} Returns the matching instance from the parent container
  */
  get(container){
    return container.parent
      ? container.parent.get(this.key)
      : null;
  }

  /**
  * Creates a Parent Resolver for the supplied key.
  *
  * @method of
  * @static
  * @param {Object} key The key to resolve.
  * @return {Parent} Returns an insance of Parent for the key.
  */
  static of(key){
    return new Parent(key);
  }
}

/**
* Used to instantiate a class.
*
* @class ClassActivator
* @constructor
*/
export class ClassActivator {
  static instance = new ClassActivator();

  invoke(fn, args){
    return Reflect.construct(fn, args);
  }
}

/**
* Used to invoke a factory method.
*
* @class FactoryActivator
* @constructor
*/
export class FactoryActivator {
  static instance = new FactoryActivator();

  invoke(fn, args){
    return fn.apply(undefined, args);
  }
}
