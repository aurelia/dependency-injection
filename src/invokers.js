import {metadata} from 'aurelia-metadata';
import {Container} from './container';

/**
* Decorator: Specifies a custom Invoker for the decorated item.
*/
export function invoker(value: Invoker): any {
  return function(target) {
    metadata.define(metadata.invoker, value, target);
  };
}

/**
* Decorator: Specifies that the decorated item should be called as a factory function, rather than a constructor.
*/
export function invokeAsFactory(potentialTarget?: any): any {
  let deco = function(target) {
    metadata.define(metadata.invoker, FactoryInvoker.instance, target);
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
* A strategy for invoking a function, resulting in an object instance.
*/
export interface Invoker {
  /**
  * Invokes the function with the provided dependencies.
  * @param fn The constructor or factory function.
  * @param dependencies The dependencies of the function call.
  * @return The result of the function invocation.
  */
  invoke(container: Container, fn: Function, dependencies: any[]): any;

  /**
  * Invokes the function with the provided dependencies.
  * @param fn The constructor or factory function.
  * @param staticDependencies The static dependencies of the function.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invokeWithDynamicDependencies(container: Container, fn: Function, staticDependencies: any[], dynamicDependencies: any[]): any;
}

/**
* An Invoker that is used to invoke a factory method.
*/
export class FactoryInvoker {
  /**
  * The singleton instance of the FactoryInvoker.
  */
  static instance: FactoryInvoker;

  /**
  * Invokes the function with the provided dependencies.
  * @param container The calling container.
  * @param fn The constructor or factory function.
  * @param dependencies The dependencies of the function call.
  * @return The result of the function invocation.
  */
  invoke(container: Container, fn: Function, dependencies: any[]): any {
    let i = dependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(dependencies[i]);
    }

    return fn.apply(undefined, args);
  }

  /**
  * Invokes the function with the provided dependencies.
  * @param container The calling container.
  * @param fn The constructor or factory function.
  * @param staticDependencies The static dependencies of the function.
  * @param dynamicDependencies Additional dependencies to use during invocation.
  * @return The result of the function invocation.
  */
  invokeWithDynamicDependencies(container: Container, fn: Function, staticDependencies: any[], dynamicDependencies: any[]): any {
    let i = staticDependencies.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(staticDependencies[i]);
    }

    if (dynamicDependencies !== undefined) {
      args = args.concat(dynamicDependencies);
    }

    return fn.apply(undefined, args);
  }
}

FactoryInvoker.instance = new FactoryInvoker();
