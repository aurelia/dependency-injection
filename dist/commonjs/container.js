"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var Metadata = require("aurelia-metadata").Metadata;
var Resolver = require("./metadata").Resolver;
var Registration = require("./metadata").Registration;
var isClass = require("./util").isClass;


var emptyParameters = Object.freeze([]);

var Container = (function () {
  function Container(constructionInfo) {
    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
  }

  _prototypeProperties(Container, null, {
    supportAtScript: {
      value: function supportAtScript() {
        this.addParameterInfoLocator(function (fn) {
          var parameters = fn.parameters,
              keys,
              i,
              ii;

          if (parameters) {
            keys = new Array(parameters.length);

            for (i = 0, ii = parameters.length; i < ii; ++i) {
              keys[i] = parameters[i].is;
            }
          }

          return keys;
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    addParameterInfoLocator: {
      value: function addParameterInfoLocator(locator) {
        if (this.locateParameterInfoElsewhere === undefined) {
          this.locateParameterInfoElsewhere = locator;
          return;
        }

        var original = this.locateParameterInfoElsewhere;
        this.locateParameterInfoElsewhere = function (fn) {
          return original(fn) || locator(fn);
        };
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerInstance: {
      value: function registerInstance(key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    registerTransient: {
      value: function registerTransient(key, fn) {
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
      value: function registerSingleton(key, fn) {
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
      value: function autoRegister(fn, key) {
        var registration = Metadata.on(fn).first(Registration, true);

        if (registration) {
          registration.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    autoRegisterAll: {
      value: function autoRegisterAll(fns) {
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
      value: function registerHandler(key, handler) {
        this.getOrCreateEntry(key).push(handler);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    get: {
      value: function get(key) {
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
      value: function getAll(key) {
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
      value: function hasHandler(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];
        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    createChild: {
      value: function createChild() {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
        return childContainer;
      },
      writable: true,
      enumerable: true,
      configurable: true
    },
    invoke: {
      value: function invoke(fn) {
        var info = this.getOrCreateConstructionInfo(fn),
            keys = info.keys,
            args = new Array(keys.length),
            context,
            i,
            ii;

        for (i = 0, ii = keys.length; i < ii; ++i) {
          args[i] = this.get(keys[i]);
        }

        if (info.isClass) {
          context = Object.create(fn.prototype);

          if ("initialize" in fn) {
            fn.initialize(context);
          }

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
      value: function getOrCreateEntry(key) {
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
      value: function getOrCreateConstructionInfo(fn) {
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
      value: function createConstructionInfo(fn) {
        var info = { isClass: isClass(fn) };

        if (fn.inject !== undefined) {
          if (typeof fn.inject === "function") {
            info.keys = fn.inject();
          } else {
            info.keys = fn.inject;
          }

          return info;
        }

        if (this.locateParameterInfoElsewhere !== undefined) {
          info.keys = this.locateParameterInfoElsewhere(fn) || emptyParameters;
        } else {
          info.keys = emptyParameters;
        }

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