import {decorators, metadata} from 'aurelia-metadata';
import {TransientRegistration, SingletonRegistration} from './registrations';
import {FactoryActivator} from './activators';
import {_emptyParameters} from './container';

export function autoinject(potentialTarget?: any) {
  let deco = function(target) {
    target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

export function inject(...rest: any[]) {
  return function(target, key, descriptor) {
    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}

export function registration(value: any) {
  return function(target) {
    metadata.define(metadata.registration, value, target);
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
    metadata.define(metadata.instanceActivator, value, target);
  };
}

export function factory() {
  return instanceActivator(FactoryActivator.instance);
}

decorators.configure.simpleDecorator('autoinject', autoinject);
decorators.configure.parameterizedDecorator('inject', inject);
decorators.configure.parameterizedDecorator('registration', registration);
decorators.configure.parameterizedDecorator('transient', transient);
decorators.configure.parameterizedDecorator('singleton', singleton);
decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
decorators.configure.parameterizedDecorator('factory', factory);
