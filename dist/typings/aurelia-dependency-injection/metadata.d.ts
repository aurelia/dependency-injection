declare module 'aurelia-dependency-injection/metadata' {
  import core from 'core-js';
  import { Container }  from 'aurelia-dependency-injection/container';
  export class TransientRegistration {
    constructor(key: any);
    register(container: Container, key: any, fn: any): void;
  }
  export class SingletonRegistration {
    constructor(keyOrRegisterInChild: any, registerInChild?: boolean);
    register(container: Container, key: any, fn: any): void;
  }
  export class Resolver {
    get(container: any): Container;
  }
  export class Lazy extends Resolver {
    constructor(key: any);
    get(container: Container): any;
    static of(key: any): Lazy;
  }
  export class All extends Resolver {
    constructor(key: any);
    get(container: Container): any;
    static of(key: any): All;
  }
  export class Optional extends Resolver {
    constructor(key: any, checkParent?: boolean);
    get(container: Container): any;
    static of(key: any, checkParent?: boolean): Optional;
  }
  export class Parent extends Resolver {
    constructor(key: any);
    get(container: Container): any;
    static of(key: any): Parent;
  }
  export class ClassActivator {
    static instance: ClassActivator;
    invoke(fn: any, args: any[]): any;
  }
  export class FactoryActivator {
    static instance: FactoryActivator;
    invoke(fn: Function, args: any[]): any;
  }
}