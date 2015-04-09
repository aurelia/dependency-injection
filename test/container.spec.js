import {Container, inject, transient, singleton, Lazy, All, Optional, Parent} from '../src/index';
import {Decorators,Metadata} from 'aurelia-metadata';

describe('container', () => {
  describe('injection', () => {
    it('instantiates class without injected services', function() {
      class App {}

      var container = new Container();
      var app = container.get(App);

      expect(app).toEqual(jasmine.any(App));
    });

    it('uses static inject method (ES6)', function() {
      class Logger {}

      class App {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses static inject property (TypeScript,CoffeeScript,ES5)', function() {
      class Logger {}

      class App {
        constructor(logger) {
          this.logger = logger;
        }
      }

      App.inject = [Logger];

      var container = new Container();
      var app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });

  describe('registration', () => {
    it('asserts keys are defined', () => {
      var container = new Container();

      expect(() => container.get(null)).toThrow();
      expect(() => container.get(undefined)).toThrow();

      expect(() => container.get(null)).toThrow();
      expect(() => container.get(undefined)).toThrow();

      expect(() => container.registerInstance(null, {})).toThrow();
      expect(() => container.registerInstance(undefined, {})).toThrow();

      expect(() => container.registerSingleton(null)).toThrow();
      expect(() => container.registerSingleton(undefined)).toThrow();

      expect(() => container.registerTransient(null)).toThrow();
      expect(() => container.registerTransient(undefined)).toThrow();

      expect(() => container.autoRegister(null)).toThrow();
      expect(() => container.autoRegister(undefined)).toThrow();

      expect(() => container.autoRegisterAll([null])).toThrow();
      expect(() => container.autoRegisterAll([undefined])).toThrow();

      expect(() => container.registerHandler(null)).toThrow();
      expect(() => container.registerHandler(undefined)).toThrow();

      expect(() => container.hasHandler(null)).toThrow();
      expect(() => container.hasHandler(undefined)).toThrow();
    });

    it('automatically configures as singleton', () => {
      class Logger {}

      class App1 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      inject(Logger)(App1);

      class App2 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      inject(Logger)(App2);

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures singleton via api', () => {
      class Logger {}

      class App1 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      inject(Logger)(App1);

      class App2 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      inject(Logger)(App2);

      var container = new Container();
      container.registerSingleton(Logger, Logger);

      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures singleton via metadata method (ES6)', () => {
      class Logger {
        static decorators() { return Decorators.singleton(); };
      }

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures singleton via metadata property (ES5, AtScript, TypeScript, CoffeeScript)', () => {
      class Logger {}
      Logger.decorators = Decorators.singleton();

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures transient (non singleton) via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      container.registerTransient(Logger, Logger);

      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures transient (non singleton) via metadata method (ES6)', () => {
      class Logger {
        static decorators() { return Decorators.transient(); };
      }

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures transient (non singleton) via metadata property (ES5, AtScript, TypeScript, CoffeeScript)', () => {
      class Logger {}
      Logger.decorators = Decorators.transient();

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures instance via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var instance = new Logger();
      container.registerInstance(Logger, instance);

      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toBe(instance);
      expect(app2.logger).toBe(instance);
    });

    it('configures custom via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      container.registerHandler(Logger, c => "something strange");

      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).toEqual("something strange");
      expect(app2.logger).toEqual("something strange");
    });

    it('uses base metadata method (ES6) when derived does not specify', () => {
      class LoggerBase {
        static decorators() { return Decorators.transient(); };
      }

      class Logger extends LoggerBase {

      }

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('uses base metadata property (ES5, AtScript, TypeScript, CoffeeScript) when derived does not specify', () => {
      class LoggerBase {}
      LoggerBase.decorators = Decorators.transient();

      class Logger extends LoggerBase {

      }

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('overrides base metadata method (ES6) with derived configuration', () => {
      class LoggerBase {
        static decorators() { return Decorators.singleton(); };
      }

      class Logger extends LoggerBase {
        static decorators() { return Decorators.transient(); };
      }

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('overrides base metadata property (ES5, AtScript, TypeScript, CoffeeScript) with derived configuration', () => {
      class LoggerBase {
        static decorators() { return Decorators.singleton(); };
      }

      class Logger extends LoggerBase {}
      Logger.decorators = Decorators.transient();

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures key as service when transient api only provided with key', () => {
      class Logger {}

      var container = new Container();
      container.registerTransient(Logger);

      var logger1 = container.get(Logger),
          logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).not.toBe(logger1);
    });

    it('configures key as service when singleton api only provided with key', () => {
      class Logger {}

      var container = new Container();
      container.registerSingleton(Logger);

      var logger1 = container.get(Logger),
          logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).toBe(logger1);
    });

    it('configures concrete singelton via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        static inject() { return [LoggerBase]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      container.registerSingleton(LoggerBase, Logger);

      var app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('configures concrete transient via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        static inject() { return [LoggerBase]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      container.registerTransient(LoggerBase, Logger);

      var app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('doesn\'t get hidden when a super class adds metadata which don\'t include the base registration type', () => {
      class LoggerBase {
        static decorators() { return Decorators.transient(); };
      }

      class Logger extends LoggerBase {
      }

      Metadata.on(Logger).add('test');

      class App1 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; };
        constructor(logger) {
          this.logger = logger;
        }
      }

      var container = new Container();
      var app1 = container.get(App1);
      var app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    describe('Custom resolvers', () => {
      describe('Lazy', () => {
        it('provides a function which, when called, will return the instance', () => {
          class Logger {}

          class App1 {
            static inject() { return [Lazy.of(Logger)]; };
            constructor(getLogger) {
              this.getLogger = getLogger;
            }
          }

          var container = new Container();
          var app1 = container.get(App1);

          var logger = app1.getLogger;

          expect(logger()).toEqual(jasmine.any(Logger));
        });
      });

      describe('All', ()=> {
        it('resolves all matching dependencies as an array of instances', () => {
          class LoggerBase {}

          class VerboseLogger extends LoggerBase {}

          class Logger extends LoggerBase{}

          class App {
            static inject() { return [All.of(LoggerBase)]; };
            constructor(loggers) {
              this.loggers = loggers;
            }
          }

          var container = new Container();
          container.registerSingleton(LoggerBase, VerboseLogger);
          container.registerTransient(LoggerBase, Logger);
          var app = container.get(App);

          expect(app.loggers).toEqual(jasmine.any(Array));
          expect(app.loggers.length).toBe(2);
          expect(app.loggers[0]).toEqual(jasmine.any(VerboseLogger));
          expect(app.loggers[1]).toEqual(jasmine.any(Logger));
        });
      });

      describe('Optional', ()=> {
        it('injects the instance if its registered in the container', () => {
          class Logger{}

          class App {
            static inject() { return [Optional.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var container = new Container();
          container.registerSingleton(Logger, Logger);
          var app = container.get(App);

          expect(app.logger).toEqual(jasmine.any(Logger));
        });

        it('injects null if key is not registered in the container', () => {
          class VerboseLogger{}
          class Logger{}

          class App {
            static inject() { return [Optional.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var container = new Container();
          container.registerSingleton(VerboseLogger, Logger);
          var app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('injects null if key nor function is registered in the container', () => {
          class VerboseLogger{}
          class Logger{}

          class App {
            static inject() { return [Optional.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var container = new Container();
          var app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('doesn\'t check the parent container hierarchy when checkParent is false or default', () => {
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var parentContainer = new Container();
          parentContainer.registerSingleton(Logger, Logger);

          var childContainer = parentContainer.createChild();
          childContainer.registerSingleton(App, App);

          var app = childContainer.get(App);

          expect(app.logger).toBe(null);
        });

        it('checks the parent container hierarchy when checkParent is true', () => {
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger, true)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var parentContainer = new Container();
          parentContainer.registerSingleton(Logger, Logger);

          var childContainer = parentContainer.createChild();
          childContainer.registerSingleton(App, App);

          var app = childContainer.get(App);

          expect(app.logger).toEqual(jasmine.any(Logger));
        });
      });

      describe('Parent', ()=> {
        it('bypasses the current container and injects instance from parent container', () =>{
          class Logger {}

          class App {
            static inject() { return [Parent.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var parentContainer = new Container();
          var parentInstance = new Logger();
          parentContainer.registerInstance(Logger, parentInstance);

          var childContainer = parentContainer.createChild();
          var childInstance = new Logger();
          childContainer.registerInstance(Logger, childInstance);
          childContainer.registerSingleton(App, App);

          var app = childContainer.get(App);

          expect(app.logger).toBe(parentInstance);
        });

        it('returns null when no parent container exists', () =>{
          class Logger {}

          class App {
            static inject() { return [Parent.of(Logger)]; };
            constructor(logger) {
              this.logger = logger;
            }
          }

          var container = new Container();
          var instance = new Logger();
          container.registerInstance(Logger, instance);

          var app = container.get(App);

          expect(app.logger).toBe(null);
        });
      });
    });
  });
});
