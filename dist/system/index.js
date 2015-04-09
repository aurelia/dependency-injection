System.register(['aurelia-metadata', './metadata', './container'], function (_export) {
  var Decorators, Metadata, TransientRegistration, SingletonRegistration, FactoryActivator;

  _export('inject', inject);

  _export('transient', transient);

  _export('singleton', singleton);

  _export('factory', factory);

  function inject() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target) {
      target.inject = rest;
    };
  }

  function transient(key) {
    return function (target) {
      Metadata.on(target).add(new TransientRegistration(key));
    };
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments[1] === undefined ? false : arguments[1];

    return function (target) {
      Metadata.on(target).add(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
    };
  }

  function factory(target) {
    Metadata.on(target).add(new FactoryActivator());
  }

  return {
    setters: [function (_aureliaMetadata) {
      Decorators = _aureliaMetadata.Decorators;
      Metadata = _aureliaMetadata.Metadata;
    }, function (_metadata) {
      TransientRegistration = _metadata.TransientRegistration;
      SingletonRegistration = _metadata.SingletonRegistration;
      FactoryActivator = _metadata.FactoryActivator;

      _export('Registration', _metadata.Registration);

      _export('TransientRegistration', _metadata.TransientRegistration);

      _export('SingletonRegistration', _metadata.SingletonRegistration);

      _export('Resolver', _metadata.Resolver);

      _export('Lazy', _metadata.Lazy);

      _export('All', _metadata.All);

      _export('Optional', _metadata.Optional);

      _export('Parent', _metadata.Parent);

      _export('InstanceActivator', _metadata.InstanceActivator);

      _export('FactoryActivator', _metadata.FactoryActivator);
    }, function (_container) {
      _export('Container', _container.Container);
    }],
    execute: function () {
      'use strict';

      Decorators.configure.parameterizedDecorator('inject', inject);
      Decorators.configure.parameterizedDecorator('transient', transient);
      Decorators.configure.parameterizedDecorator('singleton', singleton);
      Decorators.configure.parameterizedDecorator('factory', factory);
    }
  };
});