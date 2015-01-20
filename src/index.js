/**
 * A lightweight, extensible dependency injection container for JavaScript.
 *
 * @module dependency-injection
 */

export {
  Registration,
  Transient,
  Singleton,
  Resolver,
  Lazy,
  All,
  Optional,
  Parent
} from './metadata';

export {Container} from './container';