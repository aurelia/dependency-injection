"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var getAnnotation = require("aurelia-metadata").getAnnotation;
var Inject = require("./annotations").Inject;
var Resolver = require("./annotations").Resolver;
var Registration = require("./annotations").Registration;
var isClass = require("./util").isClass;
var Container = (function () {
  var Container = function Container(constructionInfo) {
    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
  };

  _prototypeProperties(Container, null, {
    registerInstance: {
      value: function (key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerTransient: {
      value: function (key, fn) {
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return x.invoke(fn);
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerSingleton: {
      value: function (key, fn) {
        var singleton = null;
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return singleton || (singleton = x.invoke(fn));
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    autoRegister: {
      value: function (fn, key) {
        var registrationAnnotation = getAnnotation(fn, Registration, true);

        if (registrationAnnotation) {
          registrationAnnotation.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    autoRegisterAll: {
      value: function (fns) {
        var i = fns.length;
        while (i--) {
          this.autoRegister(fns[i]);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerHandler: {
      value: function (key, handler) {
        this.getOrCreateEntry(key).push(handler);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {
      value: function (key) {
        var entry;

        if (key instanceof Resolver) {
          return key.get(this);
        }

        if (key === Container) {
          return this;
        }

        entry = this.entries.get(key);

        if (entry !== undefined) {
          return entry[0](this);
        }

        if (this.parent) {
          return this.parent.get(key);
        }

        this.autoRegister(key);
        entry = this.entries.get(key);

        return entry[0](this);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getAll: {
      value: function (key) {
        var _this = this;
        var entry = this.entries.get(key);

        if (entry !== undefined) {
          return entry.map(function (x) {
            return x(_this);
          });
        }

        if (this.parent) {
          return this.parent.getAll(key);
        }

        return [];
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    hasHandler: {
      value: function (key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];
        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    createChild: {
      value: function () {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        return childContainer;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    invoke: {
      value: function (fn) {
        var info = this.getOrCreateConstructionInfo(fn), keys = info.keys, args = new Array(keys.length), context, i, ii;

        for (i = 0, ii = keys.length; i < ii; ++i) {
          args[i] = this.get(keys[i]);
        }

        if (info.isClass) {
          context = Object.create(fn.prototype);
          return fn.apply(context, args) || context;
        } else {
          return fn.apply(undefined, args);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getOrCreateEntry: {
      value: function (key) {
        var entry = this.entries.get(key);

        if (entry === undefined) {
          entry = [];
          this.entries.set(key, entry);
        }

        return entry;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    getOrCreateConstructionInfo: {
      value: function (fn) {
        var info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this.createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    createConstructionInfo: {
      value: function (fn) {
        var info = { isClass: isClass(fn) }, injectAnnotation, keys = [], i, ii, j, jj, param, parameters = fn.parameters, paramAnnotation;

        if (fn.inject !== undefined) {
          if (typeof fn.inject === "function") {
            info.keys = fn.inject();
          } else {
            info.keys = fn.inject;
          }

          return info;
        }

        injectAnnotation = getAnnotation(fn, Inject);
        if (injectAnnotation) {
          keys = keys.concat(injectAnnotation.keys);
        }

        if (parameters) {
          for (i = 0, ii = parameters.length; i < ii; ++i) {
            param = parameters[i];

            for (j = 0, jj = param.length; j < jj; ++j) {
              paramAnnotation = param[j];

              if (paramAnnotation instanceof Inject) {
                keys[i] = paramAnnotation.keys[0];
              } else if (!keys[i]) {
                keys[i] = paramAnnotation;
              }
            }
          }
        }

        info.keys = keys;
        return info;
      },
      writable: true,
      enumerable: true,
      configurable: true
    }
  });

  return Container;
})();

exports.Container = Container;