System.register(["aurelia-metadata", "./metadata", "./container"], function (_export) {
  "use strict";

  var Metadata, Transient, Singleton;
  return {
    setters: [function (_aureliaMetadata) {
      Metadata = _aureliaMetadata.Metadata;
    }, function (_metadata) {
      Transient = _metadata.Transient;
      Singleton = _metadata.Singleton;
      _export("Registration", _metadata.Registration);

      _export("Transient", _metadata.Transient);

      _export("Singleton", _metadata.Singleton);

      _export("Resolver", _metadata.Resolver);

      _export("Lazy", _metadata.Lazy);

      _export("All", _metadata.All);

      _export("Optional", _metadata.Optional);

      _export("Parent", _metadata.Parent);
    }, function (_container) {
      _export("Container", _container.Container);
    }],
    execute: function () {
      Metadata.configure.classHelper("transient", Transient);
      Metadata.configure.classHelper("singleton", Singleton);
    }
  };
});