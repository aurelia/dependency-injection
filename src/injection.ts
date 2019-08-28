import { metadata } from 'aurelia-metadata';
import { _emptyParameters } from './container';
import { Args, Impl, DependencyCtor } from './types';

// tslint:disable-next-line:ban-types
export type Injectable = Function & { inject?: any[] | (() => any[]) };

function isInjectable(potentialTarget: any): potentialTarget is Injectable {
  return !!potentialTarget;
}

/**
 * Decorator: Directs the TypeScript transpiler to write-out type metadata for
 * the decorated class.
 */
export function autoinject<TPotential>(
  potentialTarget?: TPotential
): TPotential extends Injectable ? void : (target: Injectable) => void {
  const deco = (target: Injectable): void => {
    if (!target.hasOwnProperty('inject')) {
      target.inject = (
        (metadata.getOwn(metadata.paramTypes, target) as any[]) ||
        _emptyParameters
      ).slice();
      if (target.inject && target.inject.length > 0) {
        // TypeScript 3.0 metadata for "...rest" gives type "Object"
        // if last parameter is "Object", assume it's a ...rest and remove that
        // metadata.
        if (target.inject[target.inject.length - 1] === Object) {
          target.inject.splice(-1, 1);
        }
      }
    }
  };
  if (isInjectable(potentialTarget)) {
    return deco(potentialTarget) as TPotential extends Injectable ? void : (target: Injectable) => void;
  }
  return deco as TPotential extends Injectable ? void : (target: Injectable) => void;
}
/**
 * Decorator: Specifies the dependencies that should be injected by the DI Container into the decorated class/function.
 */
export function inject<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>
>(...rest: TArgs[number][]): any {
  return (
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject: any },
    _key: any,
    descriptor: any) => {
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
