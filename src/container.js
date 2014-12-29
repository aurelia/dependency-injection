/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */

import {getAnnotation} from 'aurelia-metadata';
import {Inject, Resolver, Registration} from './annotations';
import {isClass} from './util';

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
    var registrationAnnotation = getAnnotation(fn, Registration);
    
    if(registrationAnnotation){
      registrationAnnotation.register(this, key || fn, fn);
    }else{
      this.registerSingleton(key || fn, fn);
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
  * Resolves a single instance based on the provided key.
  *
  * @method get
  * @param {Object} key The key that identifies the object to resolve.
  * @return {Object} Returns the resolved instance.
  */
  get(key) {
    var entry;

    if(key instanceof Resolver){
      return key.get(this);
    }

    if(key === Container){
      return this;
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
    var entry = this.entries.get(key);

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
    return childContainer;
  }

  /**
  * Creates a new dependency injection container using a derived container type whose parent is the current container.
  *
  * @method createTypedChild
  * @param {Function} childContainerType A type derived from Container which will be instantiated as the child.
  * @return {Container} Returns a new container instance parented to this.
  */
  createTypedChild(childContainerType){
    var childContainer = new childContainerType(this.constructionInfo);
    childContainer.parent = this;
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
    var info = this.getOrCreateConstructionInfo(fn),
        keys = info.keys,
        args = new Array(keys.length),
        context, i, ii;

    for(i = 0, ii = keys.length; i < ii; ++i){
      args[i] = this.get(keys[i]);
    }

    if(info.isClass){
      context = Object.create(fn.prototype);
      return fn.apply(context, args) || context;
    }else{
      return fn.apply(undefined, args);
    }
  }

  getOrCreateEntry(key) {
    var entry = this.entries.get(key);

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
    var info = {isClass: isClass(fn)}, injectAnnotation,
        keys = [], i, ii, j, jj, param, parameters = fn.parameters, paramAnnotation;

    if(fn.inject !== undefined){
      if(typeof fn.inject === 'function'){
        info.keys = fn.inject();
      }else{
        info.keys = fn.inject;
      }

      return info;
    }

    injectAnnotation = getAnnotation(fn, Inject);
    if(injectAnnotation){
      keys = keys.concat(injectAnnotation.keys);
    }

    if (parameters) {
      for(i = 0, ii = parameters.length; i < ii; ++i){
        param = parameters[i];

        for(j = 0, jj = param.length; j < jj; ++j){
          paramAnnotation = param[j];

          if(paramAnnotation instanceof Inject) {
            keys[i] = paramAnnotation.keys[0];
          }else if(!keys[i]){ // Type Annotation
            keys[i] = paramAnnotation;
          }
        }
      }
    }

    info.keys = keys;
    return info;
  }
}