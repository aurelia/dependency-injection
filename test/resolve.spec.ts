import { beforeEach, describe, it, expect } from 'bun:test';
import { Container, resolve } from '../src/container';
import { All, Factory, Lazy, NewInstance, Optional, Parent } from '../src/resolvers';

describe('resolve()', () => {
  let container: Container;
  
  class Key {}

  beforeEach(() => {
    container = new Container();
  });

  it('throws when using resolve without a context container', () => {
    expect(() => resolve(Key)).toThrow();
  });

  describe('NewInstance.of', () => {
    class Bar {}
    class Foo {
      provider: () => Bar = resolve(Lazy.of(Bar));
      constructor(...args: any[]) {}
    }

    it('works with container.get', function () {
      expect(container.hasResolver(Foo)).toBe(false);
      const foo1 = container.get(NewInstance.of(Foo));
      const foo2 = container.get(NewInstance.of(Foo));

      expect(foo1).not.toBe(foo2);
      expect(container.getAll(Foo)).toEqual([foo1, foo2]);
    });
  });

  describe('Lazy.of()', function () {
    class Bar {}
    class Foo {
      provider: () => Bar = resolve(Lazy.of(Bar));
      constructor(...args: any[]) {}
    }
    it('works with container.get', function () {
      const bar0 = container.get(Foo).provider();
      const bar1 = container.get(Foo).provider();

      expect(bar0).toBe(bar1);
    });

    it('works with container.invoke', function () {
      const bar0 = container.invoke(Foo).provider();
      const bar1 = container.invoke(Foo).provider();

      expect(bar0).toBe(bar1);
    });

    it('works with container.invoke + dynamic deps', function () {
      const bar0 = container.invoke(Foo, [1]).provider();
      const bar1 = container.invoke(Foo, [2]).provider();

      expect(bar0).toBe(bar1);
    });
  });

  describe('Factory.of()', function () {
    class Bar {
      args: unknown[];
      constructor(...args: unknown[]) {
        this.args = args;
      }
    }
    class Foo {
      provider: (...args: unknown[]) => Bar = resolve(Factory.of(Bar));
      constructor(...args: any[]) {}
    }
    it('works with container.get', function () {
      const bar0 = container.get(Foo).provider(1);
      const bar1 = container.get(Foo).provider(2);

      expect(bar0).not.toBe(bar1);
      expect(bar0.args).toEqual([1]);
      expect(bar1.args).toEqual([2]);
      // factory invokes, so there's no registration with container
      expect(container.getAll(Bar)).toEqual([]);
      expect(container.getAll(Foo)).toEqual([container.get(Foo)])
    });

    it('works with container.invoke', function () {
      const bar0 = container.invoke(Foo).provider();
      const bar1 = container.invoke(Foo).provider();

      expect(bar0).not.toBe(bar1);
    });

    it('works with container.invoke + dynamic deps', function () {
      const bar0 = container.invoke(Foo, [1]).provider();
      const bar1 = container.invoke(Foo, [2]).provider();

      expect(bar0).not.toBe(bar1);
    });
  });

  describe('Optional.of()', function () {
    it('with default', function () {
      class Foo {
        test = resolve(Optional.of('key')) ?? 'hello';
      }

      expect(container.get(Foo).test).toBe('hello');
    });

    it('works without default', function () {
      class Foo {
        test = resolve(Optional.of('key'));
      }

      expect(container.get(Foo).test).toBe(null);
    });
  });

  describe('All.of', () => {
    it('works with container.get/container.invoke', function () {
      class Bar {}
      class Foo {
        bars = resolve(All.of(Bar));
      }

      const foo1 = container.get(Foo);
      expect(foo1.bars).toEqual([]);

      const bar1 = container.get(Bar);
      const foo2 = container.invoke(Foo);
      expect(foo2.bars).toEqual([bar1]);
    });
  });

  describe('Parent.of', () => {
    it('works with container.get/container.invoke', function () {
      class Bar {}
      class Foo {
        bar = resolve(Parent.of(Bar));
      }

      const childContainer = container.createChild();
      const foo1 = childContainer.get(Foo);
      expect(foo1.bar).toBe(null);
      expect(childContainer.hasResolver(Bar)).toBe(false);

      const bar1 = container.get(Bar);
      const childContainer2 = container.createChild();
      const foo2 = childContainer2.invoke(Foo);
      expect(foo2).not.toBe(foo1);
      expect(foo2.bar).toBe(bar1);
      expect(childContainer2.hasResolver(Bar)).toBe(false);
      expect(container.getAll(Bar)).toEqual([bar1]);
    });
  });

  describe('combo', () => {
    it('works with a combination of usages', () => {
      class Bar {}
      class Foo {
        provider: () => Bar = resolve(Lazy.of(Bar));
      }
  
      const foo1 = container.get(NewInstance.of(Foo));
      const foo2 = container.get(Factory.of(Foo))();
  
      expect(foo1).not.toBe(foo2);
      const bar1 = foo1.provider();
      const bar2 = foo2.provider();
      expect(bar1).toBe(bar2);
      expect(container.getAll(Bar)).toEqual([bar1]);
    });

    it('works with nested resolve', () => {
      class Bar {}
      class Foo {
        provider = resolve(Lazy.of(Bar));
      }
      class Baz {
        foo = resolve(NewInstance.of(Foo));
      }
  
      const baz1 = container.get(NewInstance.of(Baz));
      const baz2 = container.get(NewInstance.of(Baz));
  
      expect(baz1).not.toBe(baz2);
      expect(baz1.foo).not.toBe(baz2.foo);
      expect(baz1.foo.provider()).toBe(baz2.foo.provider());
      expect(container.getAll(Bar)).toEqual([baz1.foo.provider()]);
    });
  });
});
