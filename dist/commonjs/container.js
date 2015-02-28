"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var Metadata = require("aurelia-metadata").Metadata;

var _metadata = require("./metadata");

var Resolver = _metadata.Resolver;
var Registration = _metadata.Registration;

var isClass = require("./util").isClass;

var emptyParameters = Object.freeze([]);

/**
* A lightweight, extensible dependency injection container.
*
* @class Container
* @constructor
*/

var Container = exports.Container = (function () {
  function Container(constructionInfo) {
    _classCallCheck(this, Container);

    this.constructionInfo = constructionInfo || new Map();
    this.entries = new Map();
    this.root = this;
  }

  _prototypeProperties(Container, null, {
    supportAtScript: {

      /**
      * Add support for AtScript RTTI according to spec at http://www.atscript.org
      *
      * @method useAtScript
      */

      value: function supportAtScript() {
        this.addParameterInfoLocator(function (fn) {
          var parameters = fn.parameters,
              keys,
              i,
              ii;

          if (parameters) {
            keys = new Array(parameters.length);

            for (i = 0, ii = parameters.length; i < ii; ++i) {
              keys[i] = parameters[i].is || parameters[i][0];
            }
          }

          return keys;
        });
      },
      writable: true,
      configurable: true
    },
    addParameterInfoLocator: {

      /**
      * Adds an additional location to search for constructor parameter type info.
      *
      * @method addParameterInfoLocator
      * @param {Function} locator Configures a locator function to use when searching for parameter info. It should return undefined if no parameter info is found.
      */

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
      configurable: true
    },
    registerInstance: {

      /**
      * Registers an existing object instance with the container.
      *
      * @method registerInstance
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Object} instance The instance that will be resolved when the key is matched.
      */

      value: function registerInstance(key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      },
      writable: true,
      configurable: true
    },
    registerTransient: {

      /**
      * Registers a type (constructor function) such that the container returns a new instance for each request.
      *
      * @method registerTransient
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
      */

      value: function registerTransient(key, fn) {
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return x.invoke(fn);
        });
      },
      writable: true,
      configurable: true
    },
    registerSingleton: {

      /**
      * Registers a type (constructor function) such that the container always returns the same instance for each request.
      *
      * @method registerSingleton
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} [fn] The constructor function to use when the dependency needs to be instantiated.
      */

      value: function registerSingleton(key, fn) {
        var singleton = null;
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return singleton || (singleton = x.invoke(fn));
        });
      },
      writable: true,
      configurable: true
    },
    autoRegister: {

      /**
      * Registers a type (constructor function) by inspecting its registration annotations. If none are found, then the default singleton registration is used.
      *
      * @method autoRegister
      * @param {Function} fn The constructor function to use when the dependency needs to be instantiated.
      * @param {Object} [key] The key that identifies the dependency at resolution time; usually a constructor function.
      */

      value: function autoRegister(fn, key) {
        var registration;

        if (fn === null || fn === undefined) {
          throw new Error("fn cannot be null or undefined.");
        }

        registration = Metadata.on(fn).first(Registration, true);

        if (registration) {
          registration.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      },
      writable: true,
      configurable: true
    },
    autoRegisterAll: {

      /**
      * Registers an array of types (constructor functions) by inspecting their registration annotations. If none are found, then the default singleton registration is used.
      *
      * @method autoRegisterAll
      * @param {Function[]} fns The constructor function to use when the dependency needs to be instantiated.
      */

      value: function autoRegisterAll(fns) {
        var i = fns.length;
        while (i--) {
          this.autoRegister(fns[i]);
        }
      },
      writable: true,
      configurable: true
    },
    registerHandler: {

      /**
      * Registers a custom resolution function such that the container calls this function for each request to obtain the instance.
      *
      * @method registerHandler
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Function} handler The resolution function to use when the dependency is needed. It will be passed one arguement, the container instance that is invoking it.
      */

      value: function registerHandler(key, handler) {
        this.getOrCreateEntry(key).push(handler);
      },
      writable: true,
      configurable: true
    },
    get: {

      /**
      * Resolves a single instance based on the provided key.
      *
      * @method get
      * @param {Object} key The key that identifies the object to resolve.
      * @return {Object} Returns the resolved instance.
      */

      value: function get(key) {
        var entry;

        if (key === null || key === undefined) {
          throw new Error("key cannot be null or undefined.");
        }

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
      configurable: true
    },
    getAll: {

      /**
      * Resolves all instance registered under the provided key.
      *
      * @method getAll
      * @param {Object} key The key that identifies the objects to resolve.
      * @return {Object[]} Returns an array of the resolved instances.
      */

      value: function getAll(key) {
        var _this = this;

        var entry;

        if (key === null || key === undefined) {
          throw new Error("key cannot be null or undefined.");
        }

        entry = this.entries.get(key);

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
      configurable: true
    },
    hasHandler: {

      /**
      * Inspects the container to determine if a particular key has been registred.
      *
      * @method hasHandler
      * @param {Object} key The key that identifies the dependency at resolution time; usually a constructor function.
      * @param {Boolean} [checkParent=false] Indicates whether or not to check the parent container hierarchy.
      * @return {Boolean} Returns true if the key has been registred; false otherwise.
      */

      value: function hasHandler(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];

        if (key === null || key === undefined) {
          throw new Error("key cannot be null or undefined.");
        }

        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      },
      writable: true,
      configurable: true
    },
    createChild: {

      /**
      * Creates a new dependency injection container whose parent is the current container.
      *
      * @method createChild
      * @return {Container} Returns a new container instance parented to this.
      */

      value: function createChild() {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        childContainer.root = this.root;
        childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
        return childContainer;
      },
      writable: true,
      configurable: true
    },
    invoke: {

      /**
      * Invokes a function, recursively resolving its dependencies.
      *
      * @method invoke
      * @param {Function} fn The function to invoke with the auto-resolved dependencies.
      * @return {Object} Returns the instance resulting from calling the function.
      */

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
      configurable: true
    },
    getOrCreateEntry: {
      value: function getOrCreateEntry(key) {
        var entry;

        if (key === null || key === undefined) {
          throw new Error("key cannot be null or undefined.");
        }

        entry = this.entries.get(key);

        if (entry === undefined) {
          entry = [];
          this.entries.set(key, entry);
        }

        return entry;
      },
      writable: true,
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
      configurable: true
    }
  });

  return Container;
})();

Object.defineProperty(exports, "__esModule", {
  value: true
});