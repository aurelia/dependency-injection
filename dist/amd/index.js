define(["exports", "./annotations", "./container"], function (exports, _annotations, _container) {
  "use strict";

  exports.Inject = _annotations.Inject;
  exports.Registration = _annotations.Registration;
  exports.Transient = _annotations.Transient;
  exports.Singleton = _annotations.Singleton;
  exports.Resolver = _annotations.Resolver;
  exports.Lazy = _annotations.Lazy;
  exports.All = _annotations.All;
  exports.Container = _container.Container;
});