define(['exports', 'aurelia-metadata', './metadata', './container'], function (exports, _aureliaMetadata, _metadata, _container) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.inject = inject;
  exports.transient = transient;
  exports.singleton = singleton;
  exports.factory = factory;
  Object.defineProperty(exports, 'Registration', {
    enumerable: true,
    get: function get() {
      return _metadata.Registration;
    }
  });
  Object.defineProperty(exports, 'TransientRegistration', {
    enumerable: true,
    get: function get() {
      return _metadata.TransientRegistration;
    }
  });
  Object.defineProperty(exports, 'SingletonRegistration', {
    enumerable: true,
    get: function get() {
      return _metadata.SingletonRegistration;
    }
  });
  Object.defineProperty(exports, 'Resolver', {
    enumerable: true,
    get: function get() {
      return _metadata.Resolver;
    }
  });
  Object.defineProperty(exports, 'Lazy', {
    enumerable: true,
    get: function get() {
      return _metadata.Lazy;
    }
  });
  Object.defineProperty(exports, 'All', {
    enumerable: true,
    get: function get() {
      return _metadata.All;
    }
  });
  Object.defineProperty(exports, 'Optional', {
    enumerable: true,
    get: function get() {
      return _metadata.Optional;
    }
  });
  Object.defineProperty(exports, 'Parent', {
    enumerable: true,
    get: function get() {
      return _metadata.Parent;
    }
  });
  Object.defineProperty(exports, 'InstanceActivator', {
    enumerable: true,
    get: function get() {
      return _metadata.InstanceActivator;
    }
  });
  Object.defineProperty(exports, 'FactoryActivator', {
    enumerable: true,
    get: function get() {
      return _metadata.FactoryActivator;
    }
  });
  Object.defineProperty(exports, 'Container', {
    enumerable: true,
    get: function get() {
      return _container.Container;
    }
  });

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
      _aureliaMetadata.Metadata.on(target).add(new _metadata.TransientRegistration(key));
    };
  }

  function singleton(keyOrRegisterInChild) {
    var registerInChild = arguments[1] === undefined ? false : arguments[1];

    return function (target) {
      _aureliaMetadata.Metadata.on(target).add(new _metadata.SingletonRegistration(keyOrRegisterInChild, registerInChild));
    };
  }

  function factory(target) {
    _aureliaMetadata.Metadata.on(target).add(new _metadata.FactoryActivator());
  }

  _aureliaMetadata.Decorators.configure.parameterizedDecorator('inject', inject);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('transient', transient);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('singleton', singleton);
  _aureliaMetadata.Decorators.configure.parameterizedDecorator('factory', factory);
});