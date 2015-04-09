define(['exports', 'core-js', 'aurelia-metadata', 'aurelia-logging', './metadata'], function (exports, _coreJs, _aureliaMetadata, _aureliaLogging, _metadata) {
  'use strict';

  var _interopRequire = function (obj) { return obj && obj.__esModule ? obj['default'] : obj; };

  var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _core = _interopRequire(_coreJs);

  var emptyParameters = Object.freeze([]),
      defaultActivator = new _metadata.ClassActivator();

  function test() {}
  if (!test.name) {
    Object.defineProperty(Function.prototype, 'name', {
      get: function get() {
        var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];

        Object.defineProperty(this, 'name', { value: name });
        return name;
      }
    });
  }

  var Container = (function () {
    function Container(constructionInfo) {
      _classCallCheck(this, Container);

      this.constructionInfo = constructionInfo || new Map();
      this.entries = new Map();
      this.root = this;
    }

    _createClass(Container, [{
      key: 'addParameterInfoLocator',
      value: function addParameterInfoLocator(locator) {
        if (this.locateParameterInfoElsewhere === undefined) {
          this.locateParameterInfoElsewhere = locator;
          return;
        }

        var original = this.locateParameterInfoElsewhere;
        this.locateParameterInfoElsewhere = function (fn) {
          return original(fn) || locator(fn);
        };
      }
    }, {
      key: 'registerInstance',
      value: function registerInstance(key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      }
    }, {
      key: 'registerTransient',
      value: function registerTransient(key, fn) {
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return x.invoke(fn);
        });
      }
    }, {
      key: 'registerSingleton',
      value: function registerSingleton(key, fn) {
        var singleton = null;
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return singleton || (singleton = x.invoke(fn));
        });
      }
    }, {
      key: 'autoRegister',
      value: function autoRegister(fn, key) {
        var registration;

        if (fn === null || fn === undefined) {
          throw new Error('fn cannot be null or undefined.');
        }

        registration = _aureliaMetadata.Metadata.on(fn).first(_metadata.Registration, true);

        if (registration) {
          registration.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      }
    }, {
      key: 'autoRegisterAll',
      value: function autoRegisterAll(fns) {
        var i = fns.length;
        while (i--) {
          this.autoRegister(fns[i]);
        }
      }
    }, {
      key: 'registerHandler',
      value: function registerHandler(key, handler) {
        this.getOrCreateEntry(key).push(handler);
      }
    }, {
      key: 'unregister',
      value: function unregister(key) {
        this.entries['delete'](key);
      }
    }, {
      key: 'get',
      value: function get(key) {
        var entry;

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        if (key instanceof _metadata.Resolver) {
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
      }
    }, {
      key: 'getAll',
      value: function getAll(key) {
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
      }
    }, {
      key: 'hasHandler',
      value: function hasHandler(key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];

        if (key === null || key === undefined) {
          throw new Error('key cannot be null or undefined.');
        }

        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      }
    }, {
      key: 'createChild',
      value: function createChild() {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        childContainer.root = this.root;
        childContainer.locateParameterInfoElsewhere = this.locateParameterInfoElsewhere;
        return childContainer;
      }
    }, {
      key: 'invoke',
      value: function invoke(fn) {
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
          throw _aureliaLogging.AggregateError('Error instantiating ' + fn.name + '.', e, true);
        }
      }
    }, {
      key: 'getOrCreateEntry',
      value: function getOrCreateEntry(key) {
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
      }
    }, {
      key: 'getOrCreateConstructionInfo',
      value: function getOrCreateConstructionInfo(fn) {
        var info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this.createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info;
      }
    }, {
      key: 'createConstructionInfo',
      value: function createConstructionInfo(fn) {
        var info = { activator: _aureliaMetadata.Metadata.on(fn).first(_metadata.InstanceActivator) || defaultActivator };

        if (fn.inject !== undefined) {
          if (typeof fn.inject === 'function') {
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
      }
    }]);

    return Container;
  })();

  exports.Container = Container;
});