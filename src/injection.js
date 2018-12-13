import {metadata} from 'aurelia-metadata';
import {_emptyParameters} from './container';

/**
* Decorator: Directs the TypeScript transpiler to write-out type metadata for the decorated class.
*/
export function autoinject(potentialTarget?: any): any {
  let deco = function(target) {
    if (!target.hasOwnProperty('inject')) {
      target.inject = (metadata.getOwn(metadata.paramTypes, target) || _emptyParameters).slice();
      // TypeScript 3.0 metadata for "...rest" gives type "Object"
      // if last parameter is "Object", assume it's a ...rest and remove that metadata.
      if (target.inject.length > 0 &&
          target.inject[target.inject.length - 1] === Object) {
        target.inject.pop();
      }
    }
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* Decorator: Specifies the dependencies that should be injected by the DI Container into the decorated class/function.
*/
export function inject(...rest: any[]): any {
  return function(target, key, descriptor) {
    // handle when used as a constructor parameter decorator
    if (typeof descriptor === 'number') {
      autoinject(target);
      if (rest.length === 1) {
        target.inject[descriptor] = rest[0];
      }
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
