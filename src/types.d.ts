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
