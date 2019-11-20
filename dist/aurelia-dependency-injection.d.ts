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
export declare const resolver: {
	decorates?: (key: any) => key is {
		get(container: Container, key: any): any;
	};
} & (() => any);
export interface Resolver {
	get(container: Container, key: any): any;
}
export declare enum Strategy {
	instance = 0,
	singleton = 1,
	transient = 2,
	function = 3,
	array = 4,
	alias = 5
}
export declare type IStrategy = 1 | 2 | 3 | 4 | 5;
export declare type StrategyFunctor<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> = (container?: Container, ctor?: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, strategyResolver?: any) => TImpl;
export interface StrategyState<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	[Strategy.instance]: TImpl;
	[Strategy.singleton]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	[Strategy.transient]: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	[Strategy.function]: StrategyFunctor<TBase, TImpl, TArgs>;
	[Strategy.array]: ({
		get: (container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>) => TImpl;
	} | TImpl)[];
	[Strategy.alias]: any;
}
export declare class StrategyResolver<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>, TStrategyKey extends keyof StrategyState<TBase, TImpl, TArgs>> {
	strategy: keyof StrategyState<TBase, TImpl, TArgs>;
	state: StrategyState<TBase, TImpl, TArgs>[keyof StrategyState<TBase, TImpl, TArgs>];
	constructor(strategy: TStrategyKey, state: StrategyState<TBase, TImpl, TArgs>[TStrategyKey]);
	get(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): TImpl;
}
export declare class Lazy<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	get(container: Container): () => ImplOrAny<TImpl>;
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Lazy<TBase, TImpl, TArgs>;
}
export declare class All<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	get(container: Container): TImpl[];
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): All<TBase, TImpl, TArgs>;
}
export declare class Optional<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean);
	get(container: Container): TImpl;
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean): Optional<TBase, TImpl, TArgs>;
}
export declare class Parent<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	get(container: Container): TImpl;
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Parent<TBase, TImpl, TArgs>;
}
export declare class Factory<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>);
	get(container: Container): DependencyFunctor<TBase, TImpl, TArgs>;
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>): Factory<TBase, TImpl, TArgs>;
}
export declare class NewInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> {
	constructor(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, ...dynamicDependencies: TArgs[number][]);
	get(container: Container): ImplOrAny<TImpl>;
	as(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>): this;
	static of<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>, ...dynamicDependencies: TArgs[number][]): NewInstance<TBase, TImpl, TArgs>;
}
export declare function getDecoratorDependencies<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}): TArgs[number][];
export declare function lazy<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number) => void;
export declare function all<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number) => void;
export declare function optional<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(checkParentOrTarget?: boolean): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number) => void;
export declare function parent<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number): void;
export declare function factory<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(keyValue: any): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number) => void;
export declare function newInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(asKeyOrTarget?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, ...dynamicDependencies: TArgs[number][]): (target: DependencyCtor<TBase, TImpl, TArgs> & {
	inject?: TArgs[number][];
}, _key: any, index: number) => void;
export declare function invoker<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(value: Invoker<TBase, TImpl, TArgs>): (target: DependencyCtor<TBase, TImpl, TArgs>) => void;
export declare function invokeAsFactory<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(potentialTarget?: DependencyCtor<TBase, TImpl, TArgs>): void | ((target: DependencyCtor<TBase, TImpl, TArgs>) => void);
export interface Invoker<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
	invoke(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dependencies: TArgs): ImplOrAny<TImpl>;
	invokeWithDynamicDependencies(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, staticDependencies: TArgs[number][], dynamicDependencies: TArgs[number][]): ImplOrAny<TImpl>;
}
export declare class FactoryInvoker<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>> implements Invoker<TBase, TImpl, TArgs> {
	static instance: FactoryInvoker<any>;
	invoke(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dependencies: TArgs): ImplOrAny<TImpl>;
	invokeWithDynamicDependencies(container: Container, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, staticDependencies: TArgs[number][], dynamicDependencies: TArgs[number][]): ImplOrAny<TImpl>;
}
export declare const _emptyParameters: [];
export declare class InvocationHandler<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
	fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>;
	invoker: Invoker<TBase, TImpl, TArgs>;
	dependencies: TArgs;
	constructor(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, invoker: Invoker<TBase, TImpl, TArgs>, dependencies: TArgs);
	invoke(container: Container, dynamicDependencies?: TArgs[]): TImpl;
}
export interface ContainerConfiguration {
	onHandlerCreated?: (handler: InvocationHandler<any, any, any>) => InvocationHandler<any, any, any>;
	handlers?: Map<any, any>;
}
export declare class Container {
	static instance: Container;
	parent: Container;
	root: Container;
	constructor(configuration?: ContainerConfiguration);
	makeGlobal(): Container;
	setHandlerCreatedCallback<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(onHandlerCreated: (handler: InvocationHandler<TBase, TImpl, TArgs>) => InvocationHandler<TBase, TImpl, TArgs>): void;
	registerInstance<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, instance?: TImpl): Resolver;
	registerSingleton<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: Primitive, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	registerSingleton<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	registerTransient<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: Primitive, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	registerTransient<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	registerHandler<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, handler: (container?: Container, key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, resolver?: Resolver) => any): Resolver;
	registerAlias<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(originalKey: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, aliasKey: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): Resolver;
	registerResolver<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, resolver: Resolver): Resolver;
	autoRegister<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: Primitive, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	autoRegister<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: DependencyCtor<TBase, TImpl, TArgs>, fn?: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
	autoRegisterAll(fns: DependencyCtor<any, any, any>[]): void;
	unregister(key: any): void;
	hasResolver<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, checkParent?: boolean): boolean;
	getResolver<TStrategyKey extends keyof StrategyState<TBase, TImpl, TArgs>, TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtorOrFunctor<TBase, TImpl, TArgs>): StrategyResolver<TBase, TImpl, TArgs, TStrategyKey>;
	get<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): ImplOrAny<TImpl>;
	get<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: typeof Container): Container;
	_get(key: any): any;
	getAll<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): ImplOrAny<TImpl>[];
	createChild(): Container;
	invoke<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>, dynamicDependencies?: TArgs[number][]): ImplOrAny<TImpl>;
	_createInvocationHandler<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs> & {
		inject?: any;
	}): InvocationHandler<TBase, TImpl, TArgs>;
}
export declare type Injectable = Function & {
	inject?: any[] | (() => any[]);
};
export declare function autoinject<TPotential>(potentialTarget?: TPotential): TPotential extends Injectable ? void : (target: Injectable) => void;
export declare function inject<TBase, TImpl extends Impl<TBase> = Impl<TBase>, TArgs extends Args<TBase> = Args<TBase>>(...rest: TArgs[number][]): any;
export declare function registration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(value: Registration<TBase, TImpl, TArgs>): (target: DependencyCtor<TBase, TImpl, TArgs>) => void;
export declare function transient<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>): (target: DependencyCtor<TBase, TImpl, TArgs>) => void;
export declare function singleton(registerInChild?: boolean): any;
export declare function singleton<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>>(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, registerInChild?: boolean): any;
export interface Registration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> {
	registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
}
export declare class TransientRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> implements Registration<TBase, TImpl, TArgs> {
	constructor(key?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>);
	registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
}
export declare class SingletonRegistration<TBase, TImpl extends Impl<TBase>, TArgs extends Args<TBase>> implements Registration<TBase, TImpl, TArgs> {
	constructor(keyOrRegisterInChild?: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs> | boolean, registerInChild?: boolean);
	registerResolver(container: Container, key: PrimitiveOrDependencyCtor<TBase, TImpl, TArgs>, fn: DependencyCtorOrFunctor<TBase, TImpl, TArgs>): Resolver;
}