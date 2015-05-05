declare module 'aurelia-dependency-injection/index' {
  import { Decorators, Metadata }  from 'aurelia-metadata';
  import { TransientRegistration, SingletonRegistration, FactoryActivator }  from 'aurelia-dependency-injection/metadata';
  import { emptyParameters }  from 'aurelia-dependency-injection/container';
  export { TransientRegistration, SingletonRegistration, Resolver, Lazy, All, Optional, Parent, ClassActivator, FactoryActivator } from 'aurelia-dependency-injection/metadata';
  export { Container } from 'aurelia-dependency-injection/container';
  export function autoinject(target: any): any;
  export function inject(...rest: any[]): (target: any) => void;
  export function registration(value: any): (target: any) => void;
  export function transient(key: any): (target: any) => void;
  export function singleton(keyOrRegisterInChild: any, registerInChild?: boolean): (target: any) => void;
  export function instanceActivator(value: any): (target: any) => void;
  export function factory(): (target: any) => void;
}