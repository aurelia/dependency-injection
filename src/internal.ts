import { DependencyCtorOrFunctor } from './types';
import { Invoker } from './invokers';
import { SingletonRegistration, TransientRegistration } from './registrations';

/** @internal */
declare module 'aurelia-metadata' {
  interface MetadataType {
    invoker: 'aurelia:invoker';
    getOwn(
      metadataKey: 'aurelia:invoker',
      target: DependencyCtorOrFunctor<any, any, any>
    ): Invoker<any, any, any>;
    registration: 'aurelia:registration';
    get(
      metadataKey: 'aurelia:registration',
      target: any
    ): SingletonRegistration<any, any, any> | TransientRegistration<any, any, any>;
  }
}
