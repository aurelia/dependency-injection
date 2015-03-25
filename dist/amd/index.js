define(["exports", "aurelia-metadata", "./metadata", "./container"], function (exports, _aureliaMetadata, _metadata, _container) {
  "use strict";

  /**
   * A lightweight, extensible dependency injection container for JavaScript.
   *
   * @module dependency-injection
   */
  var Metadata = _aureliaMetadata.Metadata;
  var Transient = _metadata.Transient;
  var Singleton = _metadata.Singleton;
  exports.Registration = _metadata.Registration;
  exports.Transient = _metadata.Transient;
  exports.Singleton = _metadata.Singleton;
  exports.Resolver = _metadata.Resolver;
  exports.Lazy = _metadata.Lazy;
  exports.All = _metadata.All;
  exports.Optional = _metadata.Optional;
  exports.Parent = _metadata.Parent;
  exports.Factory = _metadata.Factory;
  exports.Container = _container.Container;

  Metadata.configure.classHelper("transient", Transient);
  Metadata.configure.classHelper("singleton", Singleton);
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
});