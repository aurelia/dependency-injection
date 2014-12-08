import {getAnnotation} from 'metadata';
import {Inject, Resolver, Registration} from './annotations';
import {isClass} from './util';

export class Container {
  constructor(constructionInfo) {
    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
  }

  registerInstance(key, instance) {
    this.registerHandler(key, x => instance);
  }

  registerTransient(key, fn) {
    this.registerHandler(key, x => x.invoke(fn));
  }

  registerSingleton(key, fn) {
    var singleton = null;
    this.registerHandler(key, x => singleton || (singleton = x.invoke(fn)));
  }

  autoRegister(fn, key){
    var registrationAnnotation = getAnnotation(fn, Registration);
    
    if(registrationAnnotation){
      registrationAnnotation.register(this, key || fn, fn);
    }else{
      this.registerSingleton(key || fn, fn);
    }
  }

  autoRegisterAll(fns){
    fns.forEach(x => this.autoRegister(x));
  }

  registerHandler(key, handler) {
    this.getOrCreateEntry(key).push(handler);
  }

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

  hasHandler(key) {
    return this.entries.has(key);
  }

  createChild(){
    var childContainer = new Container(this.constructionInfo);
    childContainer.parent = this;
    return childContainer;
  }

  createTypedChild(childContainerType){
    var childContainer = new childContainerType(this.constructionInfo);
    childContainer.parent = this;
    return childContainer;
  }

  getOrCreateEntry(key) {
    var entry = this.entries.get(key);

    if (entry === undefined) {
      entry = [];
      this.entries.set(key, entry);
    }

    return entry;
  }

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
        keys = [], i, ii, parameters = fn.parameters, paramAnnotation;

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
      parameters.forEach((param, idx) => {
        for(i = 0, ii = param.length; i < ii; i++){
          paramAnnotation = param[i];

          if(paramAnnotation instanceof Inject) {
            keys[idx] = paramAnnotation.keys[0];
          }else if(!keys[idx]){ // Type Annotation
            keys[idx] = paramAnnotation;
          }
        }
      });
    }

    info.keys = keys;
    return info;
  }
}