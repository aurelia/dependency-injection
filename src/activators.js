import * as core from 'core-js';

/**
* Used to instantiate a class.
*/
export class ClassActivator {
  /**
  * The singleton instance of the ClassActivator.
  */
  static instance = new ClassActivator();

  /**
  * Invokes the classes constructor with the provided arguments.
  * @param fn The constructor function.
  * @param args The constructor args.
  * @return The newly created instance.
  */
  invoke(fn: Function, args: any[]): any {
    return Reflect.construct(fn, args);
  }
}

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
  * @param args The function args.
  * @return The newly created instance.
  */
  invoke(fn: Function, args: any[]): any {
    return fn.apply(undefined, args);
  }
}
