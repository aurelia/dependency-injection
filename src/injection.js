import {metadata} from 'aurelia-metadata';
import {_emptyParameters} from './container';

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class/property.
*/
export function autoinject(potentialTarget?: any, potentialKey?: any): any {
  let deco = function(target, key, descriptor) {
    if (key === undefined) {
      // we are injecting into Class constructor
      target.inject = metadata.getOwn(metadata.paramTypes, target) || _emptyParameters;
    } else if (descriptor === undefined) {
      // we are injecting into Class property
      if (target.constructor.injectProperties === undefined) {
        target.constructor.injectProperties = {};
      }
      target.constructor.injectProperties[key] = metadata.getOwn("design:type", target, key);
    }
  };

  return potentialTarget ? deco(potentialTarget, potentialKey) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decorated class/function/property.
*/
export function inject(...rest: any[]): any {
  return function(target, key, descriptor) {
    // if it's defined then we are injecting rest into function/property and not Class constructor
    if (key !== undefined) {
      // if it's true then we are injecting rest into function and not property
      if (descriptor.configurable) {
        const fn = descriptor.value;
        fn.inject = rest;
      } else {
        if (target.constructor.injectProperties === undefined) {
          target.constructor.injectProperties = {};
        }
        target.constructor.injectProperties[key] = rest[0];
        // we need the property to be writable to inject the dependency
        descriptor.writable = true;
      }
    } else {
      target.inject = rest;
    }
  };
}
