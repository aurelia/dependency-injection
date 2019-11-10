import { protocol } from 'aurelia-metadata';
import { Container } from './container';
import { autoinject } from './injection';
import {
  PrimitiveOrDependencyCtor,
  DependencyCtorOrFunctor,
  PrimitiveOrDependencyCtorOrFunctor,
  DependencyCtor,
  DependencyFunctor,
  ImplOrAny,
  Impl,
  Args
} from './types';

/**
 * Decorator: Indicates that the decorated class/object is a custom resolver.
 */
export const resolver: {
  decorates?: (key: any) => key is { get(container: Container, key: any): any };
} & (() => any) = ((protocol as unknown) as { create(...args: any[]): any }).create(
  'aurelia:resolver',
  (target): string | boolean => {
    if (!(typeof target.get === 'function')) {
      return 'Resolvers must implement: get(container: Container, key: any): any';
    }

    return true;
  }
);

/**
 * Used to allow functions/classes to specify custom dependency resolution logic.
 */
export interface Resolver {
  /**
   * Called by the container to allow custom resolution of dependencies for a
   * function/class.
   * @param container The container to resolve from.
   * @param key The key that the resolver was registered as.
   * @return Returns the resolved object.
   */
  get(container: Container, key: any): any;
}

export enum Strategy {
  instance = 0,
  singleton = 1,
  transient = 2,
  function = 3,
  array = 4,
  alias = 5
}
export type IStrategy = 1 | 2 | 3 | 4 | 5;

export type StrategyFunctor<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>
  > = (
    container?: Container,
    ctor?: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>,
    strategyResolver?: any
  ) => TImpl;

export interface StrategyState<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>
  > {
  [Strategy.instance]: TImpl;
  [Strategy.singleton]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
  [Strategy.transient]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
  [Strategy.function]: StrategyFunctor<TBase, TImpl, TArgs>;
  /**
   * For typings purposes, this is done as ({ get: StrategyFunctor } | TImpl)[]
   * But it should be understood, and used as [{ get: StrategyFunctor }, ...TImp[]]
   */
  [Strategy.array]: ({
    get: (
      container: Container,
      key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>
    ) => TImpl
  } | TImpl)[];
  [Strategy.alias]: any;
}

function isStrategy<
  TBase,
  TImpl extends Impl<TBase>,
  TArgs extends Args<TBase>,
  TKey extends keyof StrategyState<TBase, TImpl, TArgs>
>(
  actual: Strategy,
  expected: TKey,
  state):
  state is StrategyState<TBase, TImpl, TArgs>[TKey] {
  return actual === expected;
}
/**
 * Used to resolve instances, singletons, transients, aliases
 */
@resolver()
export class StrategyResolver<
  TBase,
  TImpl extends Impl<TBase>,
  TArgs extends Args<TBase>,
  TStrategyKey extends keyof StrategyState<TBase, TImpl, TArgs>> {

  public strategy: keyof StrategyState<TBase, TImpl, TArgs>;
  public state: StrategyState<TBase, TImpl, TArgs>[keyof StrategyState<TBase, TImpl, TArgs>];

  /**
   * Creates an instance of the StrategyResolver class.
   * @param strategy The type of resolution strategy.
   * @param state The state associated with the resolution strategy.
   */
  constructor(strategy: TStrategyKey, state: StrategyState<TBase, TImpl, TArgs>[TStrategyKey]) {
    this.strategy = strategy;
    this.state = state;
  }

  /**
   * Called by the container to allow custom resolution of dependencies for a
   * function/class.
   * @param container The container to resolve from.
   * @param key The key that the resolver was registered as.
   * @return Returns the resolved object.
   */
  public get(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
    if (isStrategy<TBase, TImpl, TArgs, Strategy.instance>(this.strategy, Strategy.instance, this.state)) {
      return this.state;
    }
    if (isStrategy<TBase, TImpl, TArgs, Strategy.singleton>(this.strategy, Strategy.singleton, this.state)) {
      const singleton = container.invoke<TBase, TImpl, TArgs>(this.state);
      this.state = singleton;
      this.strategy = 0;
      return singleton;
    }
    if (isStrategy<TBase, TImpl, TArgs, Strategy.transient>(this.strategy, Strategy.transient, this.state)) {
      return container.invoke<TBase, TImpl, TArgs>(this.state);
    }
    if (isStrategy<TBase, TImpl, TArgs, Strategy.function>(this.strategy, Strategy.function, this.state)) {
      return this.state(container, key, this);
    }
    if (isStrategy<TBase, TImpl, TArgs, Strategy.array>(this.strategy, Strategy.array, this.state)) {
      return (this.state[0] as { get: StrategyFunctor<TBase, TImpl, TArgs> }).get(container, key);
    }
    if (isStrategy<TBase, TImpl, TArgs, Strategy.alias>(this.strategy, Strategy.alias, this.state)) {
      return container.get(this.state) as TImpl;
    }
    throw new Error('Invalid strategy: ' + this.strategy);
  }
}

/**
 * Used to allow functions/classes to specify lazy resolution logic.
 */
@resolver()
export class Lazy<TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of the Lazy class.
   * @param key The key to lazily resolve.
   */
  constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
    this._key = key;
  }

  /**
   * Called by the container to lazily resolve the dependency into a lazy locator
   * function.
   * @param container The container to resolve from.
   * @return Returns a function which can be invoked at a later time to obtain
   * the actual dependency.
   */
  public get(container: Container): () => ImplOrAny<TImpl> {
    return () => container.get<TBase, TImpl, TArgs>(this._key);
  }

  /**
   * Creates a Lazy Resolver for the supplied key.
   * @param key The key to lazily resolve.
   * @return Returns an instance of Lazy for the key.
   */
  public static of<
    TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>
    ) {
    return new Lazy<TBase, TImpl, TArgs>(key);
  }
}

/**
 * Used to allow functions/classes to specify resolution of all matches to a key.
 */
@resolver()
export class All<TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of the All class.
   * @param key The key to lazily resolve all matches for.
   */
  constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
    this._key = key;
  }

  /**
   * Called by the container to resolve all matching dependencies as an array of
   * instances.
   * @param container The container to resolve from.
   * @return Returns an array of all matching instances.
   */
  public get(container: Container): TImpl[] {
    return container.getAll(this._key);
  }

  /**
   * Creates an All Resolver for the supplied key.
   * @param key The key to resolve all instances for.
   * @return Returns an instance of All for the key.
   */
  public static of<TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>
    ): All<TBase, TImpl, TArgs> {
    return new All(key);
  }
}

/**
 * Used to allow functions/classes to specify an optional dependency, which will
 * be resolved only if already registred with the container.
 */
@resolver()
export class Optional<TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /** @internal */
  public _checkParent: boolean;

  /**
   * Creates an instance of the Optional class.
   * @param key The key to optionally resolve for.
   * @param checkParent Indicates whether or not the parent container hierarchy
   * should be checked.
   */
  constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent: boolean = true) {
    this._key = key;
    this._checkParent = checkParent;
  }

  /**
   * Called by the container to provide optional resolution of the key.
   * @param container The container to resolve from.
   * @return Returns the instance if found; otherwise null.
   */
  public get(container: Container): TImpl {
    if (container.hasResolver(this._key, this._checkParent)) {
      return container.get(this._key);
    }

    return null;
  }

  /**
   * Creates an Optional Resolver for the supplied key.
   * @param key The key to optionally resolve for.
   * @param [checkParent=true] Indicates whether or not the parent container
   * hierarchy should be checked.
   * @return Returns an instance of Optional for the key.
   */
  public static of<TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>,
      checkParent: boolean = true): Optional<TBase, TImpl, TArgs> {
    return new Optional(key, checkParent);
  }
}

/**
 * Used to inject the dependency from the parent container instead of the current
 * one.
 */
@resolver()
export class Parent<TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of the Parent class.
   * @param key The key to resolve from the parent container.
   */
  constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) {
    this._key = key;
  }

  /**
   * Called by the container to load the dependency from the parent container
   * @param container The container to resolve the parent from.
   * @return Returns the matching instance from the parent container
   */
  public get(container: Container): TImpl {
    return container.parent ? container.parent.get(this._key) : null;
  }

  /**
   * Creates a Parent Resolver for the supplied key.
   * @param key The key to resolve.
   * @return Returns an instance of Parent for the key.
   */
  public static of<TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>
    ): Parent<TBase, TImpl, TArgs> {
    return new Parent(key);
  }
}

/**
 * Used to allow injecting dependencies but also passing data to the constructor.
 */
@resolver()
export class Factory<TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public _key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>;

  /**
   * Creates an instance of the Factory class.
   * @param key The key to resolve from the parent container.
   */
  constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>) {
    this._key = key;
  }

  /**
   * Called by the container to pass the dependencies to the constructor.
   * @param container The container to invoke the constructor with dependencies
   * and other parameters.
   * @return Returns a function that can be invoked to resolve dependencies
   * later, and the rest of the parameters.
   */
  public get(container: Container): DependencyFunctor<TBase, TImpl, TArgs> {
    let fn = this._key;
    const resolver = container.getResolver(fn);
    if (resolver && resolver.strategy === Strategy.function) {
      fn = resolver.state;
    }

    return (...rest) => container.invoke(fn as DependencyCtorOrFunctor<TBase, TImpl, TArgs>, rest);
  }

  /**
   * Creates a Factory Resolver for the supplied key.
   * @param key The key to resolve.
   * @return Returns an instance of Factory for the key.
   */
  public static of<TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: DependencyCtor<TBase, TImpl, TArgs>
    ): Factory<TBase, TImpl, TArgs> {
    return new Factory(key);
  }
}

/**
 * Used to inject a new instance of a dependency, without regard for existing
 * instances in the container. Instances can optionally be registered in the
 * container
 * under a different key by supplying a key using the `as` method.
 */
@resolver()
export class NewInstance<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>> {
  /** @internal */
  public key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>;
  /** @internal */
  public asKey: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>;
  /** @internal */
  public dynamicDependencies: TArgs[number][];

  /**
   * Creates an instance of the NewInstance class.
   * @param key The key to resolve/instantiate.
   * @param dynamicDependencies An optional list of dynamic dependencies.
   */
  constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, ...dynamicDependencies: TArgs[number][]) {
    this.key = key;
    this.asKey = key;
    this.dynamicDependencies = dynamicDependencies;
  }

  /**
   * Called by the container to instantiate the dependency and potentially
   * register
   * as another key if the `as` method was used.
   * @param container The container to resolve the parent from.
   * @return Returns the matching instance from the parent container
   */
  public get(container: Container) {
    const dynamicDependencies =
      this.dynamicDependencies.length > 0
        ? this.dynamicDependencies.map(dependency =>
          dependency['protocol:aurelia:resolver']
            ? dependency.get(container)
            : container.get(dependency)
        )
        : undefined;

    let fn = this.key;
    const resolver = container.getResolver(fn);
    if (resolver && resolver.strategy === 3) {
      fn = resolver.state;
    }

    const instance = container.invoke(fn as DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dynamicDependencies);
    container.registerInstance(this.asKey, instance);
    return instance;
  }

  /**
   * Instructs the NewInstance resolver to register the resolved instance using
   * the supplied key.
   * @param key The key to register the instance with.
   * @return Returns the NewInstance resolver.
   */
  public as(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>) {
    this.asKey = key;
    return this;
  }

  /**
   * Creates an NewInstance Resolver for the supplied key.
   * @param key The key to resolve/instantiate.
   * @param dynamicDependencies An optional list of dynamic dependencies.
   * @return Returns an instance of NewInstance for the key.
   */
  public static of<TBase,
    TImpl extends Impl<TBase> = Impl<TBase>,
    TArgs extends Args<TBase> = Args<TBase>>(
      key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>,
      ...dynamicDependencies: TArgs[number][]): NewInstance<TBase, TImpl, TArgs> {
    return new NewInstance(key, ...dynamicDependencies);
  }
}

/**
 * Used by parameter decorators to call autoinject for the target and retrieve
 * the target's inject property.
 * @param target The target class.
 * @return Returns the target's own inject property.
 */
export function getDecoratorDependencies<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] }
  ) {
  autoinject(target);

  return target.inject;
}

/**
 * Decorator: Specifies the dependency should be lazy loaded
 */
export function lazy<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    keyValue: any
  ) {
  return (
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
    _key,
    index: number
  ) => {
    const inject = getDecoratorDependencies(target);
    inject[index] = Lazy.of(keyValue);
  };
}

/**
 * Decorator: Specifies the dependency should load all instances of the given
 * key.
 */
export function all<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    keyValue: any
  ) {
  return (
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
    _key,
    index: number
  ) => {
    const inject = getDecoratorDependencies(target);
    inject[index] = All.of(keyValue);
  };
}

/**
 * Decorator: Specifies the dependency as optional
 */
export function optional<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    checkParentOrTarget: boolean = true) {
  const deco = (checkParent: boolean) => {
    return (
      target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
      _key,
      index: number) => {
      const inject = getDecoratorDependencies(target);
      inject[index] = Optional.of(inject[index], checkParent);
    };
  };
  if (typeof checkParentOrTarget === 'boolean') {
    return deco(checkParentOrTarget);
  }
  return deco(true);
}

/**
 * Decorator: Specifies the dependency to look at the parent container for
 * resolution
 */
export function parent<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
    _key,
    index: number) {
  const inject = getDecoratorDependencies(target);
  inject[index] = Parent.of(inject[index]);
}

/**
 * Decorator: Specifies the dependency to create a factory method, that can
 * accept optional arguments
 */
export function factory<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>>(
    keyValue: any
  ) {
  return (
    target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
    _key,
    index: number
  ) => {
    const inject = getDecoratorDependencies(target);
    inject[index] = Factory.of(keyValue);
  };
}

/**
 * Decorator: Specifies the dependency as a new instance. Instances can optionally be registered in the container
 * under a different key and/or use dynamic dependencies
 */
export function newInstance<
  TBase,
  TImpl extends Impl<TBase> = Impl<TBase>,
  TArgs extends Args<TBase> = Args<TBase>
>(
  asKeyOrTarget?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
  ...dynamicDependencies: TArgs[number][]
) {
  const deco = (asKey?: typeof asKeyOrTarget) => {
    return (
      target: DependencyCtor<TBase, TImpl, TArgs> & { inject?: TArgs[number][] },
      _key,
      index: number
    ) => {
      const inject = getDecoratorDependencies(target);
      inject[index] = NewInstance.of(inject[index], ...dynamicDependencies);
      if (!!asKey) {
        inject[index].as(asKey);
      }
    };
  };
  if (arguments.length >= 1) {
    return deco(asKeyOrTarget);
  }
  return deco();
}
