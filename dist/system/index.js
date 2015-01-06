"use strict";

System.register(["./annotations", "./container"], function (_export) {
  return {
    setters: [function (_annotations) {
      _export("Inject", _annotations.Inject);

      _export("Registration", _annotations.Registration);

      _export("Transient", _annotations.Transient);

      _export("Singleton", _annotations.Singleton);

      _export("Resolver", _annotations.Resolver);

      _export("Lazy", _annotations.Lazy);

      _export("All", _annotations.All);

      _export("Optional", _annotations.Optional);
    }, function (_container) {
      _export("Container", _container.Container);
    }],
    execute: function () {}
  };
});