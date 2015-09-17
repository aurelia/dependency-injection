import * as core from 'core-js';

/**
* Used to invoke a factory method.
*/
export class FactoryActivator {
  /**
  * The singleton instance of the FactoryActivator.
  */
  static instance = new FactoryActivator();

  /**
  * Invokes the factory function with the provided arguments.
  * @param fn The factory function.
  * @param keys The keys representing the function's service dependencies.
  * @return The newly created instance.
  */
  invoke(container, fn, keys): any {
    let i = keys.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(keys[i]);
    }

    return fn.apply(undefined, args);
  }

  /**
  * Invokes the factory function with the provided arguments.
  * @param fn The factory function.
  * @param keys The keys representing the function's service dependencies.
  * @param deps Additional function dependencies to use during invocation.
  * @return The newly created instance.
  */
  invokeWithDynamicDependencies(container, fn, keys, deps): any {
    let i = keys.length;
    let args = new Array(i);

    while (i--) {
      args[i] = container.get(keys[i]);
    }

    if (deps !== undefined) {
      args = args.concat(deps);
    }

    return fn.apply(undefined, args);
  }
}
