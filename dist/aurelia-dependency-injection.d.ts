declare module 'types' {
	export type Primitive = boolean
	  | string
	  | number
	  | symbol
	  | object
	  | ((...args: any[]) => any)
	  | Array<any>;

	export type CtorArgs<TBase> = TBase extends new (...args: infer TArgs) => infer Impl ? TArgs : any[];
	export type CtorImpl<TBase> = TBase extends new (...args: infer TArgs) => infer Impl ? Impl : any;
	export type FuncArgs<TBase> = TBase extends (...args: infer TArgs) => infer Impl ? TArgs : any[];
	export type FuncReturns<TBase> = TBase extends (...args: infer TArgs) => infer Impl ? Impl : any;

	export type Args<TBase> = CtorArgs<TBase>|FuncArgs<TBase>;
	export type Impl<TBase> = CtorImpl<TBase>|FuncReturns<TBase>;

	export type DependencyCtor<
	  TBase,
	  TImpl extends Impl<TBase> = Impl<TBase>,
	  TArgs extends Args<TBase> = Args<TBase>
	  > = new (...args: TArgs) => TImpl | TBase;

	export type DependencyFunctor<
	  TBase,
	  TImpl extends Impl<TBase> = Impl<TBase>,
	  TArgs extends Args<TBase> = Args<TBase>
	  > = (...args: TArgs) => TImpl | TBase;

	export type ImplOrAny<TImpl> = unknown extends TImpl ? any : TImpl;

	export type DependencyCtorOrFunctor<
	  TBase,
	  TImpl extends Impl<TBase> = Impl<TBase>,
	  TArgs extends Args<TBase> = Args<TBase>
	  > = DependencyCtor<TBase, TImpl, TArgs> | DependencyFunctor<TBase, TImpl, TArgs>;

	export type PrimitiveOrDependencyCtor<
	  TBase,
	  TImpl extends Impl<TBase> = Impl<TBase>,
	  TArgs extends Args<TBase> = Args<TBase>
	  > = DependencyCtor<TBase, TImpl, TArgs> | Primitive;

	export type PrimitiveOrDependencyCtorOrFunctor<
	  TBase,
	  TImpl extends Impl<TBase> = Impl<TBase>,
	  TArgs extends Args<TBase> = Args<TBase>
	  > = DependencyCtor<TBase, TImpl, TArgs>
	  | DependencyFunctor<TBase, TImpl, TArgs>
	  | Primitive;

}
declare module 'invokers' {
	/// <reference path="../../src/internal.d.ts" />
	import { Container } from 'container';
	import { DependencyCtorOrFunctor, ImplOrAny, Impl, Args } from 'types';
	/**
	 * Decorator: Specifies a custom Invoker for the decorated item.
	 */
	export function invoker<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(value: Invoker<TBase, TImpl, TArgs>): any;
	/**
	 * Decorator: Specifies that the decorated item should be called as a factory
	 * function, rather than a constructor.
	 */
	export function invokeAsFactory(potentialTarget?: any): any;
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
	    invoke(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dependencies: TArgs): ImplOrAny<TImpl>;
	    /**
	     * Invokes the function with the provided dependencies.
	     * @param fn The constructor or factory function.
	     * @param staticDependencies The static dependencies of the function.
	     * @param dynamicDependencies Additional dependencies to use during
	     * invocation.
	     * @return The result of the function invocation.
	     */
	    invokeWithDynamicDependencies(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, staticDependencies: TArgs[number][], dynamicDependencies: TArgs[number][]): ImplOrAny<TImpl>;
	}
	/**
	 * An Invoker that is used to invoke a factory method.
	 */
	export class FactoryInvoker<TBase = any, TArgs extends Args<TBase> = Args<TBase>, TImpl extends Impl<TBase> = Impl<TBase>> {
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
	    invoke(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dependencies: TArgs): ImplOrAny<TImpl>;
	    /**
	     * Invokes the function with the provided dependencies.
	     * @param container The calling container.
	     * @param fn The constructor or factory function.
	     * @param staticDependencies The static dependencies of the function.
	     * @param dynamicDependencies Additional dependencies to use during invocation.
	     * @return The result of the function invocation.
	     */
	    invokeWithDynamicDependencies(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, staticDependencies: TArgs[number][], dynamicDependencies: TArgs[number][]): ImplOrAny<TImpl>;
	}

}
declare module 'injection' {
	import { DependencyCtor, Args, Impl } from 'types';
	/**
	 * Decorator: Directs the TypeScript transpiler to write-out type metadata for
	 * the decorated class.
	 */
	export function autoinject(potentialTarget?: DependencyCtor<any, any, any>): any;
	/**
	 * Decorator: Specifies the dependencies that should be injected by the DI Container into the decorated class/function.
	 */
	export function inject<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(...rest: TArgs[number][]): any;

}
declare module 'resolvers' {
	import { Container } from 'container';
	import { PrimitiveOrDependencyCtor, DependencyCtorOrFunctor, PrimitiveOrDependencyCtorOrFunctor, DependencyCtor, DependencyFunctor, ImplOrAny, Impl, Args } from 'types';
	/**
	 * Decorator: Indicates that the decorated class/object is a custom resolver.
	 */
	export const resolver: {
	    decorates?: (key: any) => key is {
	        get(container: Container, key: any): any;
	    };
	} & (() => any);
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
	export const enum Strategy {
	    instance = 0,
	    singleton = 1,
	    transient = 2,
	    function = 3,
	    array = 4,
	    alias = 5
	}
	export type IStrategy = 1 | 2 | 3 | 4 | 5;
	export type StrategyFunctor<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> = (container?: Container, ctor?: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, strategyResolver?: any) => TImpl;
	export interface StrategyState<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    [Strategy.instance]: TImpl;
	    [Strategy.singleton]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	    [Strategy.transient]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	    [Strategy.function]: StrategyFunctor<TBase, TImpl, TArgs>;
	    [Strategy.array]: [{
	        get: (container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) => TImpl;
	    }, ...TImpl[]];
	    [Strategy.alias]: any;
	}
	/**
	 * Used to resolve instances, singletons, transients, aliases
	 */
	export class StrategyResolver<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>, TStrategyKey extends keyof StrategyState<TBase, TImpl, TArgs>> {
	    strategy: keyof StrategyState<TBase, TImpl, TArgs>;
	    state: StrategyState<TBase, TImpl, TArgs>[keyof StrategyState<TBase, TImpl, TArgs>];
	    /**
	     * Creates an instance of the StrategyResolver class.
	     * @param strategy The type of resolution strategy.
	     * @param state The state associated with the resolution strategy.
	     */
	    constructor(strategy: TStrategyKey, state: StrategyState<TBase, TImpl, TArgs>[TStrategyKey]);
	    /**
	     * Called by the container to allow custom resolution of dependencies for a
	     * function/class.
	     * @param container The container to resolve from.
	     * @param key The key that the resolver was registered as.
	     * @return Returns the resolved object.
	     */
	    get(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): TImpl;
	}
	/**
	 * Used to allow functions/classes to specify lazy resolution logic.
	 */
	export class Lazy<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the Lazy class.
	     * @param key The key to lazily resolve.
	     */
	    constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	    /**
	     * Called by the container to lazily resolve the dependency into a lazy locator
	     * function.
	     * @param container The container to resolve from.
	     * @return Returns a function which can be invoked at a later time to obtain
	     * the actual dependency.
	     */
	    get(container: Container): () => ImplOrAny<TImpl>;
	    /**
	     * Creates a Lazy Resolver for the supplied key.
	     * @param key The key to lazily resolve.
	     * @return Returns an instance of Lazy for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Lazy<TBase, TImpl, TArgs>;
	}
	/**
	 * Used to allow functions/classes to specify resolution of all matches to a key.
	 */
	export class All<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the All class.
	     * @param key The key to lazily resolve all matches for.
	     */
	    constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	    /**
	     * Called by the container to resolve all matching dependencies as an array of
	     * instances.
	     * @param container The container to resolve from.
	     * @return Returns an array of all matching instances.
	     */
	    get(container: Container): any[];
	    /**
	     * Creates an All Resolver for the supplied key.
	     * @param key The key to resolve all instances for.
	     * @return Returns an instance of All for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): All<TBase, TImpl, TArgs>;
	}
	/**
	 * Used to allow functions/classes to specify an optional dependency, which will
	 * be resolved only if already registred with the container.
	 */
	export class Optional<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the Optional class.
	     * @param key The key to optionally resolve for.
	     * @param checkParent Indicates whether or not the parent container hierarchy
	     * should be checked.
	     */
	    constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean);
	    /**
	     * Called by the container to provide optional resolution of the key.
	     * @param container The container to resolve from.
	     * @return Returns the instance if found; otherwise null.
	     */
	    get(container: Container): any;
	    /**
	     * Creates an Optional Resolver for the supplied key.
	     * @param key The key to optionally resolve for.
	     * @param [checkParent=true] Indicates whether or not the parent container
	     * hierarchy should be checked.
	     * @return Returns an instance of Optional for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean): Optional<TBase, TImpl, TArgs>;
	}
	/**
	 * Used to inject the dependency from the parent container instead of the current
	 * one.
	 */
	export class Parent<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the Parent class.
	     * @param key The key to resolve from the parent container.
	     */
	    constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	    /**
	     * Called by the container to load the dependency from the parent container
	     * @param container The container to resolve the parent from.
	     * @return Returns the matching instance from the parent container
	     */
	    get(container: Container): any;
	    /**
	     * Creates a Parent Resolver for the supplied key.
	     * @param key The key to resolve.
	     * @return Returns an instance of Parent for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Parent<TBase, TImpl, TArgs>;
	}
	/**
	 * Used to allow injecting dependencies but also passing data to the constructor.
	 */
	export class Factory<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the Factory class.
	     * @param key The key to resolve from the parent container.
	     */
	    constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>);
	    /**
	     * Called by the container to pass the dependencies to the constructor.
	     * @param container The container to invoke the constructor with dependencies
	     * and other parameters.
	     * @return Returns a function that can be invoked to resolve dependencies
	     * later, and the rest of the parameters.
	     */
	    get(container: Container): DependencyFunctor<TBase, TImpl, TArgs>;
	    /**
	     * Creates a Factory Resolver for the supplied key.
	     * @param key The key to resolve.
	     * @return Returns an instance of Factory for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>): Factory<TBase, TImpl, TArgs>;
	}
	/**
	 * Used to inject a new instance of a dependency, without regard for existing
	 * instances in the container. Instances can optionally be registered in the
	 * container
	 * under a different key by supplying a key using the `as` method.
	 */
	export class NewInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	    /**
	     * Creates an instance of the NewInstance class.
	     * @param key The key to resolve/instantiate.
	     * @param dynamicDependencies An optional list of dynamic dependencies.
	     */
	    constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, ...dynamicDependencies: TArgs[number][]);
	    /**
	     * Called by the container to instantiate the dependency and potentially
	     * register
	     * as another key if the `as` method was used.
	     * @param container The container to resolve the parent from.
	     * @return Returns the matching instance from the parent container
	     */
	    get(container: Container): ImplOrAny<TImpl>;
	    /**
	     * Instructs the NewInstance resolver to register the resolved instance using
	     * the supplied key.
	     * @param key The key to register the instance with.
	     * @return Returns the NewInstance resolver.
	     */
	    as(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>): this;
	    /**
	     * Creates an NewInstance Resolver for the supplied key.
	     * @param key The key to resolve/instantiate.
	     * @param dynamicDependencies An optional list of dynamic dependencies.
	     * @return Returns an instance of NewInstance for the key.
	     */
	    static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, ...dynamicDependencies: TArgs[number][]): NewInstance<TBase, TImpl, TArgs>;
	}
	/**
	 * Used by parameter decorators to call autoinject for the target and retrieve
	 * the target's inject property.
	 * @param target The target class.
	 * @return Returns the target's own inject property.
	 */
	export function getDecoratorDependencies<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}): TArgs[number][];
	/**
	 * Decorator: Specifies the dependency should be lazy loaded
	 */
	export function lazy<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number) => void;
	/**
	 * Decorator: Specifies the dependency should load all instances of the given
	 * key.
	 */
	export function all<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number) => void;
	/**
	 * Decorator: Specifies the dependency as optional
	 */
	export function optional<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(checkParentOrTarget?: boolean): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number) => void;
	/**
	 * Decorator: Specifies the dependency to look at the parent container for
	 * resolution
	 */
	export function parent<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number): void;
	/**
	 * Decorator: Specifies the dependency to create a factory method, that can
	 * accept optional arguments
	 */
	export function factory<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number) => void;
	/**
	 * Decorator: Specifies the dependency as a new instance. Instances can optionally be registered in the container
	 * under a different key and/or use dynamic dependencies
	 */
	export function newInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(asKeyOrTarget?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, ...dynamicDependencies: TArgs[number][]): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	    inject?: TArgs[number][];
	}, _key: any, index: number) => void;

}
declare module 'registrations' {
	/// <reference path="../../src/internal.d.ts" />
	import { Resolver } from 'resolvers';
	import { Container } from 'container';
	import { DependencyCtorOrFunctor, PrimitiveOrDependencyCtor, Impl, Args } from 'types';
	/**
	 * Decorator: Specifies a custom registration strategy for the decorated
	 * class/function.
	 */
	export function registration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(value: Registration<TBase, TImpl, TArgs>): any;
	/**
	 * Decorator: Specifies to register the decorated item with a "transient"
	 * lifetime.
	 */
	export function transient<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): any;
	/**
	 * Decorator: Specifies to register the decorated item with a "singleton"
	 * lifetime.
	 */
	export function singleton(registerInChild?: boolean): any;
	export function singleton<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, registerInChild?: boolean): any;
	/**
	 * Customizes how a particular function is resolved by the Container.
	 */
	export interface Registration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
	    /**
	     * Called by the container to register the resolver.
	     * @param container The container the resolver is being registered with.
	     * @param key The key the resolver should be registered as.
	     * @param fn The function to create the resolver for.
	     * @return The resolver that was registered.
	     */
	    registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	}
	/**
	 * Used to allow functions/classes to indicate that they should be registered as
	 * transients with the container.
	 */
	export class TransientRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> implements Registration<TBase, TImpl, TArgs> {
	    /**
	     * Creates an instance of TransientRegistration.
	     * @param key The key to register as.
	     */
	    constructor(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	    /**
	     * Called by the container to register the resolver.
	     * @param container The container the resolver is being registered with.
	     * @param key The key the resolver should be registered as.
	     * @param fn The function to create the resolver for.
	     * @return The resolver that was registered.
	     */
	    registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	}
	/**
	 * Used to allow functions/classes to indicate that they should be registered as
	 * singletons with the container.
	 */
	export class SingletonRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> implements Registration<TBase, TImpl, TArgs> {
	    /**
	     * Creates an instance of SingletonRegistration.
	     * @param key The key to register as.
	     */
	    constructor(keyOrRegisterInChild?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> | boolean, registerInChild?: boolean);
	    /**
	     * Called by the container to register the resolver.
	     * @param container The container the resolver is being registered with.
	     * @param key The key the resolver should be registered as.
	     * @param fn The function to create the resolver for.
	     * @return The resolver that was registered.
	     */
	    registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	}

}
declare module 'container' {
	/// <reference path="../../src/internal.d.ts" />
	import { Resolver } from 'resolvers';
	import { Invoker } from 'invokers';
	import { DependencyCtorOrFunctor, DependencyCtor, PrimitiveOrDependencyCtor, PrimitiveOrDependencyCtorOrFunctor, ImplOrAny, Impl, Args } from 'types';
	export const _emptyParameters: [];
	/**
	 * Stores the information needed to invoke a function.
	 */
	export class InvocationHandler<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
	    /**
	     * The function to be invoked by this handler.
	     */
	    fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	    /**
	     * The invoker implementation that will be used to actually invoke the function.
	     */
	    invoker: Invoker<TBase, TImpl, TArgs>;
	    /**
	     * The statically known dependencies of this function invocation.
	     */
	    dependencies: TArgs;
	    /**
	     * Instantiates an InvocationDescription.
	     * @param fn The Function described by this description object.
	     * @param invoker The strategy for invoking the function.
	     * @param dependencies The static dependencies of the function call.
	     */
	    constructor(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, invoker: Invoker<TBase, TImpl, TArgs>, dependencies: TArgs);
	    /**
	     * Invokes the function.
	     * @param container The calling container.
	     * @param dynamicDependencies Additional dependencies to use during invocation.
	     * @return The result of the function invocation.
	     */
	    invoke(container: Container, dynamicDependencies?: any[]): any;
	}
	/**
	 * Used to configure a Container instance.
	 */
	export interface ContainerConfiguration {
	    /**
	     * An optional callback which will be called when any function needs an
	     * InvocationHandler created (called once per Function).
	     */
	    onHandlerCreated?: (handler: InvocationHandler<any, any, any>) => InvocationHandler<any, any, any>;
	    handlers?: Map<any, any>;
	}
	/**
	 * A lightweight, extensible dependency injection container.
	 */
	export class Container {
	    /**
	     * The global root Container instance. Available if makeGlobal() has been
	     * called. Aurelia Framework calls makeGlobal().
	     */
	    static instance: Container;
	    /**
	     * The parent container in the DI hierarchy.
	     */
	    parent: Container;
	    /**
	     * The root container in the DI hierarchy.
	     */
	    root: Container;
	    /**
	     * Creates an instance of Container.
	     * @param configuration Provides some configuration for the new Container instance.
	     */
	    constructor(configuration?: ContainerConfiguration);
	    /**
	     * Makes this container instance globally reachable through Container.instance.
	     */
	    makeGlobal(): Container;
	    /**
	     * Sets an invocation handler creation callback that will be called when new
	     * InvocationsHandlers are created (called once per Function).
	     * @param onHandlerCreated The callback to be called when an
	     * InvocationsHandler is created.
	     */
	    setHandlerCreatedCallback<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(onHandlerCreated: (handler: InvocationHandler<TBase, TImpl, TArgs>) => InvocationHandler<TBase, TImpl, TArgs>): void;
	    /**
	     * Registers an existing object instance with the container.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param instance The instance that will be resolved when the key is matched.
	     * This defaults to the key value when instance is not supplied.
	     * @return The resolver that was registered.
	     */
	    registerInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, instance?: TImpl): Resolver;
	    /**
	     * Registers a type (constructor function) such that the container always
	     * returns the same instance for each request.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param fn The constructor function to use when the dependency needs to be
	     * instantiated. This defaults to the key value when fn is not supplied.
	     * @return The resolver that was registered.
	     */
	    registerSingleton<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: any, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	    /**
	     * Registers a type (constructor function) such that the container returns a
	     * new instance for each request.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param fn The constructor function to use when the dependency needs to be
	     * instantiated. This defaults to the key value when fn is not supplied.
	     * @return The resolver that was registered.
	     */
	    registerTransient<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: string, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	    registerTransient<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	    /**
	     * Registers a custom resolution function such that the container calls this
	     * function for each request to obtain the instance.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param handler The resolution function to use when the dependency is
	     * needed.
	     * @return The resolver that was registered.
	     */
	    registerHandler<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, handler: (container?: Container, key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, resolver?: Resolver) => any): Resolver;
	    /**
	     * Registers an additional key that serves as an alias to the original DI key.
	     * @param originalKey The key that originally identified the dependency; usually a constructor function.
	     * @param aliasKey An alternate key which can also be used to resolve the same dependency  as the original.
	     * @return The resolver that was registered.
	     */
	    registerAlias<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(originalKey: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, aliasKey: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Resolver;
	    /**
	     * Registers a custom resolution function such that the container calls this
	     * function for each request to obtain the instance.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param resolver The resolver to use when the dependency is needed.
	     * @return The resolver that was registered.
	     */
	    registerResolver<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, resolver: Resolver): Resolver;
	    /**
	     * Registers a type (constructor function) by inspecting its registration
	     * annotations. If none are found, then the default singleton registration is
	     * used.
	     * @param key The key that identifies the dependency at resolution time;
	     * usually a constructor function.
	     * @param fn The constructor function to use when the dependency needs to be
	     * instantiated. This defaults to the key value when fn is not supplied.
	     */
	    autoRegister<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: string, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	    autoRegister<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	    /**
	     * Registers an array of types (constructor functions) by inspecting their
	     * registration annotations. If none are found, then the default singleton
	     * registration is used.
	     * @param fns The constructor function to use when the dependency needs to be instantiated.
	     */
	    autoRegisterAll(fns: DependencyCtor<any, any, any>[]): void;
	    /**
	     * Unregisters based on key.
	     * @param key The key that identifies the dependency at resolution time; usually a constructor function.
	     */
	    unregister(key: any): void;
	    /**
	     * Inspects the container to determine if a particular key has been registred.
	     * @param key The key that identifies the dependency at resolution time; usually a constructor function.
	     * @param checkParent Indicates whether or not to check the parent container hierarchy.
	     * @return Returns true if the key has been registred; false otherwise.
	     */
	    hasResolver<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean): boolean;
	    /**
	     * Gets the resolver for the particular key, if it has been registered.
	     * @param key The key that identifies the dependency at resolution time; usually a constructor function.
	     * @return Returns the resolver, if registred, otherwise undefined.
	     */
	    getResolver<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>): any;
	    /**
	     * Resolves a single instance based on the provided key.
	     * @param key The key that identifies the object to resolve.
	     * @return Returns the resolved instance.
	     */
	    get<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): ImplOrAny<TImpl>;
	    get<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: typeof Container): Container;
	    _get(key: any): any;
	    /**
	     * Resolves all instance registered under the provided key.
	     * @param key The key that identifies the objects to resolve.
	     * @return Returns an array of the resolved instances.
	     */
	    getAll<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): ImplOrAny<TImpl>[];
	    /**
	     * Creates a new dependency injection container whose parent is the current container.
	     * @return Returns a new container instance parented to this.
	     */
	    createChild(): Container;
	    /**
	     * Invokes a function, recursively resolving its dependencies.
	     * @param fn The function to invoke with the auto-resolved dependencies.
	     * @param dynamicDependencies Additional function dependencies to use during invocation.
	     * @return Returns the instance resulting from calling the function.
	     */
	    invoke<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dynamicDependencies?: TArgs[number][]): ImplOrAny<TImpl>;
	    _createInvocationHandler<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs> & {
	        inject?: any;
	    }): InvocationHandler<TBase, TImpl, TArgs>;
	}

}
declare module 'aurelia-dependency-injection' {
	export * from 'container';
	export * from 'injection';
	export * from 'invokers';
	export * from 'registrations';
	export * from 'resolvers';

}
