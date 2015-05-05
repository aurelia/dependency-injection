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

export function autoinject(target: any): any {
  var deco = function(target){
    target.inject = Reflect.getOwnMetadata(Metadata.paramTypes, target) || emptyParameters;
  };

  return target ? deco(target) : deco;
}

export function inject(...rest: any[]): (target: any) => void {
  return function(target){
    target.inject = rest;
  };
}

export function registration(value: any): (target: any) => void {
  return function(target){
    Reflect.defineMetadata(Metadata.registration, value, target);
  };
}

export function transient(key: any): (target: any) => void {
  return registration(new TransientRegistration(key));
}

export function singleton(keyOrRegisterInChild: any, registerInChild: boolean = false): (target: any) => void {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator(value: any): (target: any) => void {
  return function(target){
    Reflect.defineMetadata(Metadata.instanceActivator, value, target);
  };
}

export function factory(): (target: any) => void {
  return instanceActivator(FactoryActivator.instance);
}

Decorators.configure.simpleDecorator('autoinject', autoinject);
Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('registration', registration);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
Decorators.configure.parameterizedDecorator('factory', factory);
