"use strict";

System.register(["aurelia-metadata", "./annotations", "./util"], function (_export) {
  var getAnnotation, Inject, Resolver, Registration, isClass, Container;
  return {
    setters: [function (_aureliaMetadata) {
      getAnnotation = _aureliaMetadata.getAnnotation;
    }, function (_annotations) {
      Inject = _annotations.Inject;
      Resolver = _annotations.Resolver;
      Registration = _annotations.Registration;
    }, function (_util) {
      isClass = _util.isClass;
    }],
    execute: function () {
      Container = function Container(constructionInfo) {
        this.constructionInfo = constructionInfo || new Map();
        this.entries = new Map();
      };

      Container.prototype.registerInstance = function (key, instance) {
        this.registerHandler(key, function (x) {
          return instance;
        });
      };

      Container.prototype.registerTransient = function (key, fn) {
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return x.invoke(fn);
        });
      };

      Container.prototype.registerSingleton = function (key, fn) {
        var singleton = null;
        fn = fn || key;
        this.registerHandler(key, function (x) {
          return singleton || (singleton = x.invoke(fn));
        });
      };

      Container.prototype.autoRegister = function (fn, key) {
        var registrationAnnotation = getAnnotation(fn, Registration, true);

        if (registrationAnnotation) {
          registrationAnnotation.register(this, key || fn, fn);
        } else {
          this.registerSingleton(key || fn, fn);
        }
      };

      Container.prototype.autoRegisterAll = function (fns) {
        var i = fns.length;
        while (i--) {
          this.autoRegister(fns[i]);
        }
      };

      Container.prototype.registerHandler = function (key, handler) {
        this.getOrCreateEntry(key).push(handler);
      };

      Container.prototype.get = function (key) {
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
      };

      Container.prototype.getAll = function (key) {
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
      };

      Container.prototype.hasHandler = function (key) {
        var checkParent = arguments[1] === undefined ? false : arguments[1];
        return this.entries.has(key) || checkParent && this.parent && this.parent.hasHandler(key, checkParent);
      };

      Container.prototype.createChild = function () {
        var childContainer = new Container(this.constructionInfo);
        childContainer.parent = this;
        return childContainer;
      };

      Container.prototype.createTypedChild = function (childContainerType) {
        var childContainer = new childContainerType(this.constructionInfo);
        childContainer.parent = this;
        return childContainer;
      };

      Container.prototype.invoke = function (fn) {
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
      };

      Container.prototype.getOrCreateEntry = function (key) {
        var entry = this.entries.get(key);

        if (entry === undefined) {
          entry = [];
          this.entries.set(key, entry);
        }

        return entry;
      };

      Container.prototype.getOrCreateConstructionInfo = function (fn) {
        var info = this.constructionInfo.get(fn);

        if (info === undefined) {
          info = this.createConstructionInfo(fn);
          this.constructionInfo.set(fn, info);
        }

        return info;
      };

      Container.prototype.createConstructionInfo = function (fn) {
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
      };

      _export("Container", Container);
    }
  };
});