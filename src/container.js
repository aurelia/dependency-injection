import * as core from 'core-js';
import {Metadata} from 'aurelia-metadata';
import {AggregateError} from 'aurelia-logging';
import {Resolver, ClassActivator} from './metadata';

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
  static instance : Container;

  constructor(constructionInfo? : Map<Function,Object>) {
    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
    this.root = this;
  }

  /**
  * Makes this container instance globally reachable through Container.instance.
  *
  * @method makeGlobal
  */
  makeGlobal() : Container {
    Container.instance = this;
    return this;
  }

  /**
  * Registers an existing object instance with the container.
  *
  * @method registerInstance
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Object} instance The instance that will be resolved when the key is matched.
  */
  registerInstance(key : any, instance : any) : void {
    this.registerHandler(key, x => instance);
  }

  /**
  * Registers a type (constructor function) such that the container returns a new instance for each request.
  *
  * @method registerTransient
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
  */
  registerTransient(key : any, fn? : Function) : void {
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
  registerSingleton(key : any, fn? : Function) : void {
    var singleton = null;
    fn = fn || key;
    this.registerHandler(key, x => singleton || (singleton = x.invoke(fn)));
  }

  /**
  * Registers an alias for another key with the container.
  *
  * @method registerAlias
  * @param {Object} alias The alias name of a key.
  * @param {Object} original The original key that is already registered or can be auto registered with the container.
  */
  registerAlias(alias : any, original : any) : void {
    if (alias === original){
      return;
    }
    this.registerHandler(alias, x => x.get(original));
  }

  /**
  * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
  *
  * @method autoRegister
  * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
  * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
  */
  autoRegister(fn : any, key? : any) : void {
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
  autoRegisterAll(fns : any[]) : void {
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
  registerHandler(key : any, handler : (c:Container) => any) : void {
    this._getOrCreateEntry(key).push(handler);
  }

  /**
  * Unregisters based on key.
  *
  * @method unregister
  * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
  */
  unregister(key : any) : void {
    this.entries.delete(key);
  }

  /**
  * Resolves a single instance based on the provided key.
  *
  * @method get
  * @param {Object} key The key that identifies the object to resolve.
  * @return {Object} Returns the resolved instance.
  */
  get(key : any) : any {
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
  getAll(key : any) : any[] {
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
  hasHandler(key : any, checkParent? : boolean = false) : boolean {
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
  createChild() : Container {
    var childContainer = new Container(this.constructionInfo);
    childContainer.parent = this;
    childContainer.root = this.root;
    return childContainer;
  }

  /**
  * Invokes a function, recursively resolving its dependencies.
  *
  * @method invoke
  * @param {Function} fn The function to invoke with the auto-resolved dependencies.
  * @param {any[]} [deps] Additional function dependencies to use during invocation.
  * @return {Object} Returns the instance resulting from calling the function.
  */
  invoke(fn : Function, deps? : any[]) : any {
    try{
      var info = this._getOrCreateConstructionInfo(fn),
          keys = info.keys,
          args = new Array(keys.length),
          i, ii;

      for(i = 0, ii = keys.length; i < ii; ++i){
        args[i] = this.get(keys[i]);
      }

      if(deps !== undefined){
        args = args.concat(deps);
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

  _getOrCreateEntry(key) {
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

  _getOrCreateConstructionInfo(fn){
    var info = this.constructionInfo.get(fn);

    if(info === undefined){
      info = this._createConstructionInfo(fn);
      this.constructionInfo.set(fn, info);
    }

    return info;
  }

  _createConstructionInfo(fn){
    var info = {activator: Metadata.getOwn(Metadata.instanceActivator, fn) || ClassActivator.instance};

    if(fn.inject !== undefined){
      if(typeof fn.inject === 'function'){
        info.keys = fn.inject();
      }else{
        info.keys = fn.inject;
      }

      return info;
    }

    info.keys = Metadata.getOwn(Metadata.paramTypes, fn) || emptyParameters;
    return info;
  }
}
