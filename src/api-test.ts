import { resolve } from "./container";
import { Optional } from "./resolvers";
import { All, Factory, factory, Lazy, newInstance, Parent } from "./resolvers";

declare const assertType: <R, U = [R]>(result: [R] extends U ? R : never) => void

function testResolve() {

  function testAbstractClass() {
    abstract class A {
      a = 1;
    }

    const a = resolve(A);
    if (a.a === 2) {
      
    }
  }

  function testResolveSingle() {
    class A { a = 1 }
    class B { b = '2' }
    const aInstance = resolve(A);
    const bInstance = resolve(B);

    // @ts-expect-error number and string no overlap
    if (aInstance.a === bInstance.b) {

    }
  }

  function testResolveMultiple() {
    class A { a = 1 }
    class B { b = '2' }
    const [aInstance, bInstance] = resolve(A, B);
    aInstance.a;
    bInstance.b;
    // @ts-expect-error
    if (aInstance.a === '2') {

    }
    // @ts-expect-error
    if (bInstance.b === 2) {

    }
  }

  function testResolveFactory() {
    class A { a = 1 };
    const aFactory = resolve(Factory.of(A));
    // @ts-expect-error
    assertType<new () => A>(aFactory);

    const aInstance = aFactory();

    assertType<A>(aInstance);
    assertType<A>({ a: 5 });

    // @ts-expect-error
    assertType<A>({});
    // @ts-expect-error
    if (aInstance.a === '1') { }

    const bInstance = aFactory(1, 2, 3);

    assertType<A>(bInstance);

    // @ts-expect-error
    if (bInstance.a === '1') { }
  }

  function testResolveLazy() {
    class A { a = 1 };
    const aFactory = resolve(Lazy.of(A));
    assertType<() => A>(aFactory);

    const aInstance = aFactory();

    assertType<A>(aInstance);
    assertType<A>({ a: 5 });

    // @ts-expect-error
    assertType<A>({});
    // @ts-expect-error
    if (aInstance.a === '1') { }

    // @ts-expect-error
    const bInstance = aFactory(1, 2, 3);

    assertType<A>(bInstance);

    // @ts-expect-error
    if (bInstance.a === '1') { }
  }

  function testResolveAll() {
    class A { a = 1 }
    const instances = resolve(All.of(A));

    assertType<A[]>(instances);
  }

  function testResolveParent() {
    class A { a = 1 }
    const instance = resolve(Parent.of(A));

    assertType<A | null>(instance);
  }

  function testResolveOptional() {
    class A { a = 1 }
    const instance = resolve(Optional.of(A));

    assertType<A | null>(instance);
  }

  function testResolveMix() {
    class A { a = 1 }
    class B { b = '2' }
    const [aInstance, bInstance, instances] = resolve(A, B, All.of(A));

    assertType<A>(aInstance);
    assertType<B>(bInstance);
    assertType<A[]>(instances);
  }
}
