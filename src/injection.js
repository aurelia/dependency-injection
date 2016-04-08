import {metadata} from 'aurelia-metadata';
import {_emptyParameters} from './container';

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject(potentialTarget?: any): any {
  let deco = function(target) {
    target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decorated class/function/property.
*/
export function inject(...rest: any[]): any {
  return function(target, key, descriptor) {
    // if it's defined then we are injecting rest into function/property and not Class constructor
    if (descriptor !== undefined) {
      // if it's true then we are injecting rest into function and not property
      if (descriptor.configurable) {
        const fn = descriptor.value;
        fn.inject = rest;
      } else {
        if (target.constructor.injectProperties === undefined) {
          target.constructor.injectProperties = {};
        }
        target.constructor.injectProperties[key] = rest[0];
        descriptor.writable = true;
      }
    } else {
      target.inject = rest;
    }
  };
}

export function injectProperties(container, fn, instance) {
  if (fn.injectProperties !== undefined) {
    let dependencies = fn.injectProperties;
    for (let property in dependencies) {
      instance[property] = container.get(dependencies[property]);
    }
  }
  return instance;
}
