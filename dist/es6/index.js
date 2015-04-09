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
  }
}

export function transient(key){
  return function(target){
    Metadata.on(target).add(new TransientRegistration(key));
  }
}

export function singleton(keyOrRegisterInChild, registerInChild=false){
  return function(target){
    Metadata.on(target).add(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
  }
}

export function factory(target){
  Metadata.on(target).add(new FactoryActivator());
}

Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('factory', factory);
