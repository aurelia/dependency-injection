define(["exports", "aurelia-metadata", "./annotations", "./util"], function (exports, _aureliaMetadata, _annotations, _util) {
  "use strict";

  var getAnnotation = _aureliaMetadata.getAnnotation;
  var Inject = _annotations.Inject;
  var Resolver = _annotations.Resolver;
  var Registration = _annotations.Registration;
  var isClass = _util.isClass;
  var Container = (function () {
    var Container = function Container(constructionInfo) {
      this.constructionInfo = constructionInfo || new Map();
      this.entries = new Map();
    };

    Container.prototype.registerInstance = function (key, instance) {
      this.registerHandler(key, function (x) {
        return instance;
      });
    };

    Container.prototype.registerTransient = function (key, fn) {
      this.registerHandler(key, function (x) {
        return x.invoke(fn);
      });
    };

    Container.prototype.registerSingleton = function (key, fn) {
      var singleton = null;
      this.registerHandler(key, function (x) {
        return singleton || (singleton = x.invoke(fn));
      });
    };

    Container.prototype.autoRegister = function (fn, key) {
      var registrationAnnotation = getAnnotation(fn, Registration);

      if (registrationAnnotation) {
        registrationAnnotation.register(this, key || fn, fn);
      } else {
        this.registerSingleton(key || fn, fn);
      }
    };

    Container.prototype.autoRegisterAll = function (fns) {
      var _this = this;
      fns.forEach(function (x) {
        return _this.autoRegister(x);
      });
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
      var _this2 = this;
      var entry = this.entries.get(key);

      if (entry !== undefined) {
        return entry.map(function (x) {
          return x(_this2);
        });
      }

      if (this.parent) {
        return this.parent.getAll(key);
      }

      return [];
    };

    Container.prototype.hasHandler = function (key) {
      return this.entries.has(key);
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

    Container.prototype.getOrCreateEntry = function (key) {
      var entry = this.entries.get(key);

      if (entry === undefined) {
        entry = [];
        this.entries.set(key, entry);
      }

      return entry;
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

    Container.prototype.getOrCreateConstructionInfo = function (fn) {
      var info = this.constructionInfo.get(fn);

      if (info === undefined) {
        info = this.createConstructionInfo(fn);
        this.constructionInfo.set(fn, info);
      }

      return info;
    };

    Container.prototype.createConstructionInfo = function (fn) {
      var info = { isClass: isClass(fn) }, injectAnnotation, keys = [], i, ii, parameters = fn.parameters, paramAnnotation;

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
        parameters.forEach(function (param, idx) {
          for (i = 0, ii = param.length; i < ii; i++) {
            paramAnnotation = param[i];

            if (paramAnnotation instanceof Inject) {
              keys[idx] = paramAnnotation.keys[0];
            } else if (!keys[idx]) {
              keys[idx] = paramAnnotation;
            }
          }
        });
      }

      info.keys = keys;
      return info;
    };

    return Container;
  })();

  exports.Container = Container;
});