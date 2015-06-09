System.register(['core-js', 'aurelia-metadata', 'aurelia-logging', './metadata'], function (_export) {
  'use strict';

  var core, Metadata, AggregateError, Resolver, ClassActivator, emptyParameters, Container;

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function test() {}
  return {
    setters: [function (_coreJs) {
      core = _coreJs['default'];
    }, function (_aureliaMetadata) {
      Metadata = _aureliaMetadata.Metadata;
    }, function (_aureliaLogging) {
      AggregateError = _aureliaLogging.AggregateError;
    }, function (_metadata) {
      Resolver = _metadata.Resolver;
      ClassActivator = _metadata.ClassActivator;
    }],
    execute: function () {

      Metadata.registration = 'aurelia:registration';
      Metadata.instanceActivator = 'aurelia:instance-activator';

      if (!test.name) {
        Object.defineProperty(Function.prototype, 'name', {
          get: function get() {
            var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];

            Object.defineProperty(this, 'name', { value: name });
            return name;
          }
        });
      }

      emptyParameters = Object.freeze([]);

      _export('emptyParameters', emptyParameters);

      Container = (function () {
        function Container(constructionInfo) {
          _classCallCheck(this, Container);

          this.constructionInfo = constructionInfo || new Map();
          this.entries = new Map();
          this.root = this;
        }

        Container.prototype.addParameterInfoLocator = function addParameterInfoLocator(locator) {
          if (this.locateParameterInfoElsewhere === undefined) {
            this.locateParameterInfoElsewhere = locator;
            return;
          }

          var original = this.locateParameterInfoElsewhere;
          this.locateParameterInfoElsewhere = function (fn) {
            return original(fn) || locator(fn);
          };
        };

        Container.prototype.registerInstance = function registerInstance(key, instance) {
          this.registerHandler(key, function (x) {
            return instance;
          });
        };

        Container.prototype.registerTransient = function registerTransient(key, fn) {
          fn = fn || key;
          this.registerHandler(key, function (x) {
            return x.invoke(fn);
          });
        };

        Container.prototype.registerSingleton = function registerSingleton(key, fn) {
          var singleton = null;
          fn = fn || key;
          this.registerHandler(key, function (x) {
            return singleton || (singleton = x.invoke(fn));
          });
        };

        Container.prototype.autoRegister = function autoRegister(fn, key) {
          var registration;

          if (fn === null || fn === undefined) {
            throw new Error('fn cannot be null or undefined.');
          }

          if (typeof fn === 'function') {
            registration = Metadata.get(Metadata.registration, fn);

            if (registration !== undefined) {
              registration.register(this, key || fn, fn);
            } else {
              this.registerSingleton(key || fn, fn);
            }
          } else {
            this.registerInstance(fn, fn);
          }
        };

        Container.prototype.autoRegisterAll = function autoRegisterAll(fns) {
          var i = fns.length;
          while (i--) {
            this.autoRegister(fns[i]);
          }
        };

        Container.prototype.registerHandler = function registerHandler(key, handler) {
          this.getOrCreateEntry(key).push(handler);
        };

        Container.prototype.unregister = function unregister(key) {
          this.entries['delete'](key);
        };

        Container.prototype.get = function get(key) {
          var entry;

          if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
          }

          if (key === Container) {
            return this;
          }

          if (key instanceof Resolver) {
            return key.get(this);
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
        };

        Container.prototype.getAll = function getAll(key) {
          var _this = this;

          var entry;

          if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
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
        };

        Container.prototype.hasHandler = function hasHandler(key) {
          var checkParent = arguments[1] === undefined ? false : arguments[1];

          if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
          }

          return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
        };

        Container.prototype.createChild = function createChild() {
          var childContainer = new Container(this.constructionInfo);
          childContainer.parent = this;
          childContainer.root = this.root;
          childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
          return childContainer;
        };

        Container.prototype.invoke = function invoke(fn) {
          try {
            var info = this.getOrCreateConstructionInfo(fn),
                keys = info.keys,
                args = new Array(keys.length),
                i,
                ii;

            for (i = 0, ii = keys.length; i < ii; ++i) {
              args[i] = this.get(keys[i]);
            }

            return info.activator.invoke(fn, args);
          } catch (e) {
            var activatingText = info.activator instanceof ClassActivator ? 'instantiating' : 'invoking';
            var message = 'Error ' + activatingText + ' ' + fn.name + '.';
            if (i < ii) {
              message += ' The argument at index ' + i + ' (key:' + keys[i] + ') could not be satisfied.';
            }

            message += ' Check the inner error for details.';

            throw AggregateError(message, e, true);
          }
        };

        Container.prototype.getOrCreateEntry = function getOrCreateEntry(key) {
          var entry;

          if (key === null || key === undefined) {
            throw new Error('key cannot be null or undefined.');
          }

          entry = this.entries.get(key);

          if (entry === undefined) {
            entry = [];
            this.entries.set(key, entry);
          }

          return entry;
        };

        Container.prototype.getOrCreateConstructionInfo = function getOrCreateConstructionInfo(fn) {
          var info = this.constructionInfo.get(fn);

          if (info === undefined) {
            info = this.createConstructionInfo(fn);
            this.constructionInfo.set(fn, info);
          }

          return info;
        };

        Container.prototype.createConstructionInfo = function createConstructionInfo(fn) {
          var info = { activator: Metadata.getOwn(Metadata.instanceActivator, fn) || ClassActivator.instance };

          if (fn.inject !== undefined) {
            if (typeof fn.inject === 'function') {
              info.keys = fn.inject();
            } else {
              info.keys = fn.inject;
            }

            return info;
          }

          if (this.locateParameterInfoElsewhere !== undefined) {
            info.keys = this.locateParameterInfoElsewhere(fn) || Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
          } else {
            info.keys = Reflect.getOwnMetadata(Metadata.paramTypes, fn) || emptyParameters;
          }

          return info;
        };

        return Container;
      })();

      _export('Container', Container);
    }
  };
});