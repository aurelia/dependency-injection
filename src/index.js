/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */
import {Decorators, Metadata} from 'aurelia-metadata';
import {TransientRegistration, SingletonRegistration, FactoryActivator} from './metadata';
export {
  Registration,
  TransientRegistration,
  SingletonRegistration,
  Resolver,
  Lazy,
  All,
  Optional,
  Parent,
  InstanceActivator,
  FactoryActivator
} from './metadata';

export {Container} from './container';

export function inject(...rest){
  return function(target){
    target.inject = rest;
    return target;
  }
}

export function transient(key){
  return function(target){
    Metadata.on(target).add(new TransientRegistration(key));
    return target;
  }
}

export function singleton(keyOrRegisterInChild, registerInChild=false){
  return function(target){
    Metadata.on(target).add(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
    return target;
  }
}

export function factory(target){
  Metadata.on(target).add(new FactoryActivator());
  return target;
}

Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('factory', factory);
