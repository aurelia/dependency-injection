System.register(['aurelia-metadata', './metadata', './container'], function (_export) {
  var Decorators, Metadata, TransientRegistration, SingletonRegistration, FactoryActivator, emptyParameters;

  _export('autoinject', autoinject);

  _export('inject', inject);

  _export('registration', registration);

  _export('transient', transient);

  _export('singleton', singleton);

  _export('instanceActivator', instanceActivator);

  _export('factory', factory);

  function autoinject(target) {
    var deco = function deco(target) {
      target.inject = Reflect.getOwnMetadata(Metadata.paramTypes, target) || emptyParameters;
    };

    return target ? deco(target) : deco;
  }

  function inject() {
    for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
      rest[_key] = arguments[_key];
    }

    return function (target) {
      target.inject = rest;
    };
  }

  function registration(value) {
    return function (target) {
      Reflect.defineMetadata(Metadata.registration, value, target);
    };
  }

  function transient(key) {
    return registration(new TransientRegistration(key));
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments[1] === undefined ? false : arguments[1];

    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
  }

  function instanceActivator(value) {
    return function (target) {
      Reflect.defineMetadata(Metadata.instanceActivator, value, target);
    };
  }

  function factory() {
    return instanceActivator(FactoryActivator.instance);
  }

  return {
    setters: [function (_aureliaMetadata) {
      Decorators = _aureliaMetadata.Decorators;
      Metadata = _aureliaMetadata.Metadata;
    }, function (_metadata) {
      TransientRegistration = _metadata.TransientRegistration;
      SingletonRegistration = _metadata.SingletonRegistration;
      FactoryActivator = _metadata.FactoryActivator;
      emptyParameters = _metadata.emptyParameters;

      _export('TransientRegistration', _metadata.TransientRegistration);

      _export('SingletonRegistration', _metadata.SingletonRegistration);

      _export('Resolver', _metadata.Resolver);

      _export('Lazy', _metadata.Lazy);

      _export('All', _metadata.All);

      _export('Optional', _metadata.Optional);

      _export('Parent', _metadata.Parent);

      _export('ClassActivator', _metadata.ClassActivator);

      _export('FactoryActivator', _metadata.FactoryActivator);
    }, function (_container) {
      _export('Container', _container.Container);
    }],
    execute: function () {
      'use strict';

      Decorators.configure.simpleDecorator('autoinject', autoinject);
      Decorators.configure.parameterizedDecorator('inject', inject);
      Decorators.configure.parameterizedDecorator('registration', registration);
      Decorators.configure.parameterizedDecorator('transient', transient);
      Decorators.configure.parameterizedDecorator('singleton', singleton);
      Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
      Decorators.configure.parameterizedDecorator('factory', factory);
    }
  };
});