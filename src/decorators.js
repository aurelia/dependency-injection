import {Decorators, Metadata} from 'aurelia-metadata';
import {TransientRegistration, SingletonRegistration} from './registrations';
import {FactoryActivator} from './activators';
import {emptyParameters} from './container';

export function autoinject(potentialTarget?: any) {
  let deco = function(target) {
    target.inject = Metadata.getOwn(Metadata.paramTypes, target) || emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export function inject(...rest: any[]) {
  return function(target) {
    target.inject = rest;
  };
}

export function registration(value: any) {
  return function(target) {
    Metadata.define(Metadata.registration, value, target);
  };
}

export function transient(key?: any) {
  return registration(new TransientRegistration(key));
}

export function singleton(keyOrRegisterInChild?: any, registerInChild?: boolean = false) {
  return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}

export function instanceActivator(value: any) {
  return function(target) {
    Metadata.define(Metadata.instanceActivator, value, target);
  };
}

export function factory() {
  return instanceActivator(FactoryActivator.instance);
}

Decorators.configure.simpleDecorator('autoinject', autoinject);
Decorators.configure.parameterizedDecorator('inject', inject);
Decorators.configure.parameterizedDecorator('registration', registration);
Decorators.configure.parameterizedDecorator('transient', transient);
Decorators.configure.parameterizedDecorator('singleton', singleton);
Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
Decorators.configure.parameterizedDecorator('factory', factory);
