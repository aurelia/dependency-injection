/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */
import {Metadata} from 'aurelia-metadata';
import {Transient, Singleton} from './metadata';
export {
  Registration,
  Transient,
  Singleton,
  Resolver,
  Lazy,
  All,
  Optional,
  Parent,
  Factory
} from './metadata';

export {Container} from './container';

Metadata.configure.classHelper('transient', Transient);
Metadata.configure.classHelper('singleton', Singleton);
