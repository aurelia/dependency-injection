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
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decoratored class/function.
*/
export function inject(...rest: any[]): any {
  return function(target, key, descriptor) {
    // handle when used as a parameter
    if (typeof descriptor === 'number' && rest.length === 1) {
      let params = target.inject;
      if (typeof params === 'function') {
        throw new Error('Decorator inject cannot be used with "inject()".  Please use an array instead.');
      }
      if (!params) {
        params = metadata.getOwn(metadata.paramTypes, target).concat();
        target.inject = params;
      }
      params[descriptor] = rest[0];
      return;
    }
    // if it's true then we injecting rest into function and not Class constructor
    if (descriptor) {
      const fn = descriptor.value;
      fn.inject = rest;
    } else {
      target.inject = rest;
    }
  };
}
