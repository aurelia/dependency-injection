// tslint:disable-next-line:no-reference
/// <reference path="./internal" />
import { Resolver } from './resolvers';
import { Container } from './container';
import { metadata } from 'aurelia-metadata';
import {
  DependencyCtorOrFunctor,
  PrimitiveOrDependencyCtor,
  PrimitiveOrBase
} from './types';

/**
 * Decorator: Specifies a custom registration strategy for the decorated
 * class/function.
 */
export function registration<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>(
  value: Registration<TBase, TArgs, TImpl>): any {
  return (target: (...rest: any[]) => any) => {
    metadata.define(metadata.registration, value, target);
  };
}

/**
 * Decorator: Specifies to register the decorated item with a "transient"
 * lifetime.
 */
export function transient<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>(
  key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): any {
  return registration(new TransientRegistration<TBase, TArgs, TImpl>(key));
}

/**
 * Decorator: Specifies to register the decorated item with a "singleton"
 * lifetime.
 */
export function singleton(registerInChild?: boolean): any;
export function singleton<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>(
  key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, registerInChild?: boolean): any;
export function singleton<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>(
  keyOrRegisterInChild?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> | boolean, registerInChild: boolean = false) {
  return registration<TBase, TArgs, TImpl>(
    new SingletonRegistration<TBase, TArgs, TImpl>(keyOrRegisterInChild, registerInChild)
  );
}

/**
 * Customizes how a particular function is resolved by the Container.
 */
export interface Registration<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>> {
  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  registerResolver(
    container: Container,
    key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>,
    fn: DependencyCtorOrFunctor<TBase, TArgs, TImpl>
  ): Resolver;
}

/**
 * Used to allow functions/classes to indicate that they should be registered as
 * transients with the container.
 */
export class TransientRegistration<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>
  implements Registration<TBase, TArgs, TImpl> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of TransientRegistration.
   * @param key The key to register as.
   */
  constructor(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
    this._key = key;
  }

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  public registerResolver(
    container: Container,
    key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>,
    fn: DependencyCtorOrFunctor<TBase, TArgs, TImpl>
  ): Resolver {
    const existingResolver = container.getResolver(this._key || key);
    return existingResolver === undefined
      ? container.registerTransient<TBase, TArgs, TImpl>(
        (this._key || key) as string,
        fn as DependencyCtorOrFunctor<TBase, TArgs, TImpl>)
      : existingResolver;
  }
}

/**
 * Used to allow functions/classes to indicate that they should be registered as
 * singletons with the container.
 */
export class SingletonRegistration<TBase, TArgs extends Array<any>, TImpl extends PrimitiveOrBase<TBase>>
  implements Registration<TBase, TArgs, TImpl> {
  /** @internal */
  public _registerInChild: boolean;

  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of SingletonRegistration.
   * @param key The key to register as.
   */
  constructor(
    keyOrRegisterInChild?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> | boolean,
    registerInChild: boolean = false) {
    if (typeof keyOrRegisterInChild === 'boolean') {
      this._registerInChild = keyOrRegisterInChild;
    } else {
      this._key = keyOrRegisterInChild;
      this._registerInChild = registerInChild;
    }
  }

  /**
   * Called by the container to register the resolver.
   * @param container The container the resolver is being registered with.
   * @param key The key the resolver should be registered as.
   * @param fn The function to create the resolver for.
   * @return The resolver that was registered.
   */
  public registerResolver(
    container: Container,
    key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>,
    fn: DependencyCtorOrFunctor<TBase, TArgs, TImpl>
  ): Resolver {
    const targetContainer = this._registerInChild ? container : container.root;
    const existingResolver = targetContainer.getResolver(this._key || key);
    return existingResolver === undefined
      ? targetContainer.registerSingleton(this._key || key, fn)
      : existingResolver;
  }
}
