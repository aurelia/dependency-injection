export type Primitive = boolean
  | string
  | number
  | symbol
  | object
  | ((...args: any[]) => any)
  | Array<any>;

export type DependencyCtor<
  TBase,
  TImpl extends PrimitiveOrBase<TBase>,
  TArgs extends Array<any>
  > = new (...args: TArgs) => TImpl | TBase;

export type DependencyFunctor<
  TBase,
  TArgs extends Array<any>,
  TImpl extends PrimitiveOrBase<TBase> = PrimitiveOrBase<TBase>
  > = (...args: TArgs) => TImpl | TBase;

export type DependencyCtorOrFunctor<
  TBase,
  TArgs extends Array<any>,
  TImpl extends PrimitiveOrBase<TBase> = PrimitiveOrBase<TBase>
  > = DependencyCtor<TBase, TImpl, TArgs>
  | DependencyFunctor<TBase, TArgs, TImpl>;

export type PrimitiveOrDependencyCtor<
  TBase,
  TImpl extends PrimitiveOrBase<TBase>,
  TArgs extends Array<any>
  > = DependencyCtor<TBase, TImpl, TArgs> | Primitive;

export type PrimitiveOrDependencyCtorOrFunctor<
  TBase,
  TArgs extends Array<any>,
  TImpl extends PrimitiveOrBase<TBase> = PrimitiveOrBase<TBase>
  > = DependencyCtor<TBase, TImpl, TArgs>
  | DependencyFunctor<TBase, TArgs, TImpl>
  | Primitive;

export type PrimitiveOrBase<TBase> = Primitive extends TBase ? TBase : any;

export type ImplOrAny<TImpl> = unknown extends TImpl ? any : TImpl;
