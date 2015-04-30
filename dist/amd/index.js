define(['exports', 'aurelia-metadata', './metadata', './container'], function (exports, _aureliaMetadata, _metadata, _container) {
  'use strict';

  exports.__esModule = true;
  exports.autoinject = autoinject;
  exports.inject = inject;
  exports.registration = registration;
  exports.transient = transient;
  exports.singleton = singleton;
  exports.instanceActivator = instanceActivator;
  exports.factory = factory;
  exports.TransientRegistration = _metadata.TransientRegistration;
  exports.SingletonRegistration = _metadata.SingletonRegistration;
  exports.Resolver = _metadata.Resolver;
  exports.Lazy = _metadata.Lazy;
  exports.All = _metadata.All;
  exports.Optional = _metadata.Optional;
  exports.Parent = _metadata.Parent;
  exports.ClassActivator = _metadata.ClassActivator;
  exports.FactoryActivator = _metadata.FactoryActivator;
  exports.Container = _container.Container;

  function autoinject(target) {
    var deco = function deco(target) {
      target.inject = Reflect.getOwnMetadata(_aureliaMetadata.Metadata.paramTypes, target) || _metadata.emptyParameters;
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
      Reflect.defineMetadata(_aureliaMetadata.Metadata.registration, value, target);
    };
  }

  function transient(key) {
    return registration(new _metadata.TransientRegistration(key));
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments[1] === undefined ? false : arguments[1];

    return registration(new _metadata.SingletonRegistration(keyOrRegisterInChild, registerInChild));
  }

  function instanceActivator(value) {
    return function (target) {
      Reflect.defineMetadata(_aureliaMetadata.Metadata.instanceActivator, value, target);
    };
  }

  function factory() {
    return instanceActivator(_metadata.FactoryActivator.instance);
  }

  _aureliaMetadata.Decorators.configure.simpleDecorator('autoinject', autoinject);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('inject', inject);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('registration', registration);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('transient', transient);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('singleton', singleton);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('instanceActivator', instanceActivator);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('factory', factory);
});