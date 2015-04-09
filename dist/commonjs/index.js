'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.inject = inject;
exports.transient = transient;
exports.singleton = singleton;
exports.factory = factory;

var _Decorators$Metadata = require('aurelia-metadata');

var _TransientRegistration$SingletonRegistration$FactoryActivator = require('./metadata');

Object.defineProperty(exports, 'Registration', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.Registration;
  }
});
Object.defineProperty(exports, 'TransientRegistration', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.TransientRegistration;
  }
});
Object.defineProperty(exports, 'SingletonRegistration', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.SingletonRegistration;
  }
});
Object.defineProperty(exports, 'Resolver', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.Resolver;
  }
});
Object.defineProperty(exports, 'Lazy', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.Lazy;
  }
});
Object.defineProperty(exports, 'All', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.All;
  }
});
Object.defineProperty(exports, 'Optional', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.Optional;
  }
});
Object.defineProperty(exports, 'Parent', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.Parent;
  }
});
Object.defineProperty(exports, 'InstanceActivator', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.InstanceActivator;
  }
});
Object.defineProperty(exports, 'FactoryActivator', {
  enumerable: true,
  get: function get() {
    return _TransientRegistration$SingletonRegistration$FactoryActivator.FactoryActivator;
  }
});

var _Container = require('./container');

Object.defineProperty(exports, 'Container', {
  enumerable: true,
  get: function get() {
    return _Container.Container;
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
    _Decorators$Metadata.Metadata.on(target).add(new _TransientRegistration$SingletonRegistration$FactoryActivator.TransientRegistration(key));
  };
}

function singleton(keyOrRegisterInChild) {
  var registerInChild = arguments[1] === undefined ? false : arguments[1];

  return function (target) {
    _Decorators$Metadata.Metadata.on(target).add(new _TransientRegistration$SingletonRegistration$FactoryActivator.SingletonRegistration(keyOrRegisterInChild, registerInChild));
  };
}

function factory(target) {
  _Decorators$Metadata.Metadata.on(target).add(new _TransientRegistration$SingletonRegistration$FactoryActivator.FactoryActivator());
}

_Decorators$Metadata.Decorators.configure.parameterizedDecorator('inject', inject);
_Decorators$Metadata.Decorators.configure.parameterizedDecorator('transient', transient);
_Decorators$Metadata.Decorators.configure.parameterizedDecorator('singleton', singleton);
_Decorators$Metadata.Decorators.configure.parameterizedDecorator('factory', factory);