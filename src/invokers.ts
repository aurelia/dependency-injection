// tslint:disable-next-line:no-reference
/// <reference path="./internal.ts" />
import { metadata } from 'aurelia-metadata';
import { Container } from './container';
import { DependencyCtorOrFunctor, ImplOrAny, Impl, Args, DependencyCtor } from './types';

/**
 * Decorator: Specifies a custom Invoker for the decorated item.
 */
export function invoker<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  value: Invoker<TBase, TImpl, TArgs>
): (target: DependencyCtor<TBase, TImpl, TArgs>) => void {
  return target => {
    metadata.define(metadata.invoker, value, target);
  };
}

/**
 * Decorator: Specifies that the decorated item should be called as a factory
 * function, rather than a constructor.
 */
export function invokeAsFactory<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  potentialTarget?: DependencyCtor<TBase, TImpl, TArgs>
): void | ((target: DependencyCtor<TBase, TImpl, TArgs>) => void) {
  const deco = (target: DependencyCtor<TBase, TImpl, TArgs>) => {
    metadata.define(metadata.invoker, FactoryInvoker.instance, target);
  };

  return potentialTarget ? deco(potentialTarget) : deco;
}

/**
 * A strategy for invoking a function, resulting in an object instance.
 */
export interface Invoker<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param dependencies The dependencies of the function call.
   * @return The result of the function invocation.
   */
  invoke(
    container: Container,
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>,
    dependencies: TArgs
  ): ImplOrAny<TImpl>;

  /**
   * Invokes the function with the provided dependencies.
   * @param fn The constructor or factory function.
   * @param staticDependencies The static dependencies of the function.
   * @param dynamicDependencies Additional dependencies to use during
   * invocation.
   * @return The result of the function invocation.
   */
  invokeWithDynamicDependencies(
    container: Container,
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>,
    staticDependencies: TArgs[number][],
    dynamicDependencies: TArgs[number][]
  ): ImplOrAny<TImpl>;
}

/**
 * An Invoker that is used to invoke a factory method.
 */
export class FactoryInvoker<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>
  > implements Invoker<TBase, TImpl, TArgs> {
  /**
   * The singleton instance of the FactoryInvoker.
   */
  public static instance: FactoryInvoker<any>;

  /**
   * Invokes the function with the provided dependencies.
   * @param container The calling container.
   * @param fn The constructor or factory function.
   * @param dependencies The dependencies of the function call.
   * @return The result of the function invocation.
   */
  public invoke(
    container: Container,
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>,
    dependencies: TArgs
  ): ImplOrAny<TImpl> {
    let i = dependencies.length;
    const args = new Array(i);

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
  public invokeWithDynamicDependencies(
    container: Container,
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>,
    staticDependencies: TArgs[number][],
    dynamicDependencies: TArgs[number][]
  ): ImplOrAny<TImpl> {
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
