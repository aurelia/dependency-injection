declare module 'aurelia-dependency-injection/container' {
  import core from 'core-js';
  import { Metadata }  from 'aurelia-metadata';
  import { AggregateError }  from 'aurelia-logging';
  import { Resolver, ClassActivator }  from 'aurelia-dependency-injection/metadata';
  export var emptyParameters: any;
  export class Container {
    constructor(constructionInfo: Map<any, any>);
    addParameterInfoLocator(locator: Function): void;
    registerInstance(key: any, instance: any): void;
    registerTransient(key: any, fn: any): void;
    registerSingleton(key: any, fn: any): void;
    autoRegister(fn: any, key: any): void;
    autoRegisterAll(fns: Function[]): void;
    registerHandler(key: any, handler: Function): void;
    unregister(key: any): void;
    get(key: any): any;
    getAll(key: any): any[];
    hasHandler(key: any, checkParent?: boolean): boolean;
    createChild(): Container;
    invoke(fn: Function): any;
    getOrCreateEntry(key: any): any;
    getOrCreateConstructionInfo(fn: any): any;
    createConstructionInfo(fn: any): any;
  }
}