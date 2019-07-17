// tslint:disable-next-line:no-reference
/// <reference path="./internal.ts" />
import { Resolver } from './resolvers';
import { Container } from './container';
import { metadata } from 'aurelia-metadata';
import {
  DependencyCtorOrFunctor,
  PrimitiveOrDependencyCtor,
  Impl,
  Args,
  DependencyCtor
} from './types';

/**
 * Decorator: Specifies a custom registration strategy for the decorated
 * class/function.
 */
export function registration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  value: Registration<TBase, TImpl, TArgs>) {
  return (target: DependencyCtor<TBase, TImpl, TArgs>) => {
    metadata.define(metadata.registration, value, target);
  };
}

/**
 * Decorator: Specifies to register the decorated item with a "transient"
 * lifetime.
 */
export function transient<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
  return registration(new TransientRegistration<TBase, TImpl, TArgs>(key));
}

/**
 * Decorator: Specifies to register the decorated item with a "singleton"
 * lifetime.
 */
export function singleton(registerInChild?: boolean);
export function singleton<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, registerInChild?: boolean);
export function singleton<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(
  keyOrRegisterInChild?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> | boolean, registerInChild: boolean = false) {
  return registration<TBase, TImpl, TArgs>(
    new SingletonRegistration<TBase, TImpl, TArgs>(keyOrRegisterInChild, registerInChild)
  );
}

/**
 * Customizes how a particular function is resolved by the Container.
 */
export interface Registration<
  TBase,
  TImpl extends Impl<TBase>,
  TArgs extends Args<TBase>> {
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
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>
  ): Resolver;
}

/**
 * Used to allow functions/classes to indicate that they should be registered as
 * transients with the container.
 */
export class TransientRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>
  implements Registration<TBase, TImpl, TArgs> {
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
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>
  ): Resolver {
    const existingResolver = container.getResolver(this._key || key);
    return existingResolver === undefined
      ? container.registerTransient<TBase, TImpl, TArgs>(
        (this._key || key) as string,
        fn as DependencyCtorOrFunctor<TBase, TImpl, TArgs>)
      : existingResolver;
  }
}

/**
 * Used to allow functions/classes to indicate that they should be registered as
 * singletons with the container.
 */
export class SingletonRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>
  implements Registration<TBase, TImpl, TArgs> {
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
    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>
  ): Resolver {
    const targetContainer = this._registerInChild ? container : container.root;
    const existingResolver = targetContainer.getResolver(this._key || key);
    return existingResolver === undefined
      ? targetContainer.registerSingleton(this._key || key, fn)
      : existingResolver;
  }
}
