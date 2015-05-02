/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */
import {Decorators, Metadata} from 'aurelia-metadata';
import {TransientRegistration, SingletonRegistration, FactoryActivator} from './metadata';
import {emptyParameters} from './container';
export {
  TransientRegistration,
  SingletonRegistration,
  Resolver,
  Lazy,
  All,
  Optional,
  Parent,
  ClassActivator,
  FactoryActivator
} from './metadata';

export {Container} from './container';

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
