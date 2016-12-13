import './setup';
import {Container} from '../src/container';
import {Lazy, All, Optional, Parent, Factory, NewInstance, lazy, all, optional, parent, factory, newInstance} from '../src/resolvers';
import {transient, singleton} from '../src/registrations';
import {inject, autoinject} from '../src/injection';
import {decorators} from 'aurelia-metadata';

describe('container', () => {
  describe('injection', () => {
    it('instantiates class without injected services', function() {
      class App {}

      let container = new Container();
      let app = container.get(App);

      expect(app).toEqual(jasmine.any(App));
    });

    it('uses static inject method (ES6)', function() {
      class Logger {}

      class App {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app = container.get(App);
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

      let container = new Container();
      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });

  describe('inheritence', function() {
    class Logger {}
    class Service {}

    it('loads dependencies for the parent class', function() {
      class ParentApp {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class ChildApp extends ParentApp {
        constructor(...rest) {
          super(...rest);
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('loads dependencies for the child class', function() {
      class ParentApp {
      }

      class ChildApp extends ParentApp {
        static inject() { return [Service]; }
        constructor(service, ...rest) {
          super(...rest);
          this.service = service;
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.service).toEqual(jasmine.any(Service));
    });

    it('loads dependencies for both classes', function() {
      class ParentApp {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class ChildApp extends ParentApp {
        static inject() { return [Service]; }
        constructor(service, ...rest) {
          super(...rest);
          this.service = service;
        }
      }

      let container = new Container();
      let app = container.get(ChildApp);
      expect(app.service).toEqual(jasmine.any(Service));
      expect(app.logger).toEqual(jasmine.any(Logger));
    });
  });


  describe('autoinject', () => {
    class Logger {}
    class Service {}
    class SubService1 {}
    class SubService2 {}

    it('loads dependencies in tree classes', function() {
      let ParentApp = decorators(autoinject(), Reflect.metadata('design:paramtypes', [Logger])).on(
      class {
        constructor(logger) {
          this.logger = logger;
        }
      });


      let ChildApp = decorators(autoinject(), Reflect.metadata('design:paramtypes', [Service, Logger])).on(
      class extends ParentApp {
        constructor(service, ...rest) {
          super(...rest);
          this.service = service;
        }
      });

      let SubChildApp1 = decorators(autoinject(), Reflect.metadata('design:paramtypes', [SubService1, Service, Logger])).on(
      class extends ChildApp {
        constructor(subService1, ...rest) {
          super(...rest);
          this.subService1 = subService1;
        }
      });

      let SubChildApp2 = decorators(autoinject(), Reflect.metadata('design:paramtypes', [SubService2, Service, Logger])).on(
      class extends ChildApp {
        constructor(subService2, ...rest) {
          super(...rest);
          this.subService2 = subService2;
        }
      });

      class SubChildApp3 extends ChildApp {
      }

      let SubChildApp4 = decorators(autoinject(), Reflect.metadata('design:paramtypes', [Logger, SubService1, Service])).on(
      class extends ChildApp {
        constructor(logger, subService1, service) {
          super(service, logger);
          this.subService1 = subService1;
        }
      });

      let container = new Container();

      let app1 = container.get(SubChildApp1);
      expect(app1.subService1).toEqual(jasmine.any(SubService1));
      expect(app1.service).toEqual(jasmine.any(Service));
      expect(app1.logger).toEqual(jasmine.any(Logger));

      let app2 = container.get(SubChildApp2);
      expect(app2.subService2).toEqual(jasmine.any(SubService2));
      expect(app2.service).toEqual(jasmine.any(Service));
      expect(app2.logger).toEqual(jasmine.any(Logger));

      let app3 = container.get(SubChildApp3);
      expect(app3.service).toEqual(jasmine.any(Service));
      expect(app3.logger).toEqual(jasmine.any(Logger));

      let app4 = container.get(SubChildApp4);
      expect(app4.subService1).toEqual(jasmine.any(SubService1));
      expect(app4.service).toEqual(jasmine.any(Service));
      expect(app4.logger).toEqual(jasmine.any(Logger));
    });
  });

  describe('registration', () => {
    it('asserts keys are defined', () => {
      let container = new Container();

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

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('automatically configures non-functions as instances', () => {
      let someObject = {};

      class App1 {
        constructor(something) {
          this.something = something;
        }
      }

      inject(someObject)(App1);


      let container = new Container();
      let app1 = container.get(App1);

      expect(app1.something).toBe(someObject);
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

      let container = new Container();
      container.registerSingleton(Logger, Logger);

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures singleton via decorators helper (ES5/6)', () => {
      let Logger = decorators(singleton()).on(class {});

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toBe(app2.logger);
    });

    it('configures transient (non singleton) via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerTransient(Logger, Logger);

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures transient (non singleton) via metadata method (ES5/6)', () => {
      let Logger = decorators(transient()).on(class { });

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures instance via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let instance = new Logger();
      container.registerInstance(Logger, instance);

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toBe(instance);
      expect(app2.logger).toBe(instance);
    });

    it('configures custom via api', () => {
      class Logger {}

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerHandler(Logger, c => 'something strange');

      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).toEqual('something strange');
      expect(app2.logger).toEqual('something strange');
    });

    it('uses base metadata method (ES5/6) when derived does not specify', () => {
      let LoggerBase = decorators(transient()).on(class {});

      class Logger extends LoggerBase {

      }

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('overrides base metadata method (ES5/6) with derived configuration', () => {
      let LoggerBase = decorators(singleton()).on(class { });
      let Logger = decorators(transient()).on(class extends LoggerBase {});

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    it('configures key as service when transient api only provided with key', () => {
      class Logger {}

      let container = new Container();
      container.registerTransient(Logger);

      let logger1 = container.get(Logger);
      let logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).not.toBe(logger1);
    });

    it('configures key as service when singleton api only provided with key', () => {
      class Logger {}

      let container = new Container();
      container.registerSingleton(Logger);

      let logger1 = container.get(Logger);
      let logger2 = container.get(Logger);

      expect(logger1).toEqual(jasmine.any(Logger));
      expect(logger2).toEqual(jasmine.any(Logger));
      expect(logger2).toBe(logger1);
    });

    it('configures concrete singleton via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        static inject() { return [LoggerBase]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerSingleton(LoggerBase, Logger);

      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('configures concrete transient via api for abstract dependency', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App {
        static inject() { return [LoggerBase]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      container.registerTransient(LoggerBase, Logger);

      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('doesn\'t get hidden when a super class adds metadata which doesn\'t include the base registration type', () => {
      let LoggerBase = decorators(transient()).on(class {});

      class Logger extends LoggerBase {
      }

      Reflect.defineMetadata('something', 'test', Logger);

      class App1 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      class App2 {
        static inject() { return [Logger]; }
        constructor(logger) {
          this.logger = logger;
        }
      }

      let container = new Container();
      let app1 = container.get(App1);
      let app2 = container.get(App2);

      expect(app1.logger).not.toBe(app2.logger);
    });

    describe('Custom resolvers', () => {
      describe('Lazy', () => {
        it('provides a function which, when called, will return the instance', () => {
          class Logger {}

          class App1 {
            static inject() { return [Lazy.of(Logger)]; }
            constructor(getLogger) {
              this.getLogger = getLogger;
            }
          }

          let container = new Container();
          let app1 = container.get(App1);

          let logger = app1.getLogger;

          expect(logger()).toEqual(jasmine.any(Logger));
        });

        it('provides a function which, when called, will return the instance using decorator', () => {
          class Logger {}

          class App1 {
            static inject = [Logger];
            constructor(getLogger) {
              this.getLogger = getLogger;
            }
          }

          lazy(Logger)(App1, null, 0);

          let container = new Container();
          let app1 = container.get(App1);

          let logger = app1.getLogger;

          expect(logger()).toEqual(jasmine.any(Logger));
        });
      });

      describe('All', ()=> {
        it('resolves all matching dependencies as an array of instances', () => {
          class LoggerBase {}

          class VerboseLogger extends LoggerBase {}

          class Logger extends LoggerBase {}

          class App {
            static inject() { return [All.of(LoggerBase)]; }
            constructor(loggers) {
              this.loggers = loggers;
            }
          }

          let container = new Container();
          container.registerSingleton(LoggerBase, VerboseLogger);
          container.registerTransient(LoggerBase, Logger);
          let app = container.get(App);

          expect(app.loggers).toEqual(jasmine.any(Array));
          expect(app.loggers.length).toBe(2);
          expect(app.loggers[0]).toEqual(jasmine.any(VerboseLogger));
          expect(app.loggers[1]).toEqual(jasmine.any(Logger));
        });

        it('resolves all matching dependencies as an array of instances using decorator', () => {
          class LoggerBase {}

          class VerboseLogger extends LoggerBase {}

          class Logger extends LoggerBase {}

          class App {
            static inject = [LoggerBase];
            constructor(loggers) {
              this.loggers = loggers;
            }
          }

          all(LoggerBase)(App, null, 0);

          let container = new Container();
          container.registerSingleton(LoggerBase, VerboseLogger);
          container.registerTransient(LoggerBase, Logger);
          let app = container.get(App);

          expect(app.loggers).toEqual(jasmine.any(Array));
          expect(app.loggers.length).toBe(2);
          expect(app.loggers[0]).toEqual(jasmine.any(VerboseLogger));
          expect(app.loggers[1]).toEqual(jasmine.any(Logger));
        });
      });

      describe('inject as param decorator', ()=> {
        it('resolves a matching dependency using the inject decorator', () => {
          class Logger {}

          class App1 {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          inject(Logger)(App1, null, 0);

          let container = new Container();
          let app1 = container.get(App1);

          let logger = app1.logger;

          expect(logger).toEqual(jasmine.any(Logger));
        });
      });

      describe('Optional', ()=> {
        it('injects the instance if its registered in the container', () => {
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          container.registerSingleton(Logger, Logger);
          let app = container.get(App);

          expect(app.logger).toEqual(jasmine.any(Logger));
        });

        it('injects the instance if its registered in the container using decorator', () => {
          class Logger {}

          class App {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          optional(Logger)(App, null, 0);

          let container = new Container();
          container.registerSingleton(Logger, Logger);
          let app = container.get(App);

          expect(app.logger).toEqual(jasmine.any(Logger));
        });

        it('injects null if key is not registered in the container', () => {
          class VerboseLogger {}
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          container.registerSingleton(VerboseLogger, Logger);
          let app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('injects null if key is not registered in the container using decorator', () => {
          class VerboseLogger {}
          class Logger {}

          class App {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          optional(Logger)(App, null, 0);

          let container = new Container();
          container.registerSingleton(VerboseLogger, Logger);
          let app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('injects null if key nor function is registered in the container', () => {
          class VerboseLogger {}
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          let app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('doesn\'t check the parent container hierarchy when checkParent is false', () => {
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger, false)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let parentContainer = new Container();
          parentContainer.registerSingleton(Logger, Logger);

          let childContainer = parentContainer.createChild();
          childContainer.registerSingleton(App, App);

          let app = childContainer.get(App);

          expect(app.logger).toBe(null);
        });

        it('checks the parent container hierarchy when checkParent is true or default', () => {
          class Logger {}

          class App {
            static inject() { return [Optional.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let parentContainer = new Container();
          parentContainer.registerSingleton(Logger, Logger);

          let childContainer = parentContainer.createChild();
          childContainer.registerSingleton(App, App);

          let app = childContainer.get(App);

          expect(app.logger).toEqual(jasmine.any(Logger));
        });
      });

      describe('Parent', ()=> {
        it('bypasses the current container and injects instance from parent container', () =>{
          class Logger {}

          class App {
            static inject() { return [Parent.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let parentContainer = new Container();
          let parentInstance = new Logger();
          parentContainer.registerInstance(Logger, parentInstance);

          let childContainer = parentContainer.createChild();
          let childInstance = new Logger();
          childContainer.registerInstance(Logger, childInstance);
          childContainer.registerSingleton(App, App);

          let app = childContainer.get(App);

          expect(app.logger).toBe(parentInstance);
        });

        it('bypasses the current container and injects instance from parent container using decorator', () =>{
          class Logger {}

          class App {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          parent(App, null, 0);

          let parentContainer = new Container();
          let parentInstance = new Logger();
          parentContainer.registerInstance(Logger, parentInstance);

          let childContainer = parentContainer.createChild();
          let childInstance = new Logger();
          childContainer.registerInstance(Logger, childInstance);
          childContainer.registerSingleton(App, App);

          let app = childContainer.get(App);

          expect(app.logger).toBe(parentInstance);
        });

        it('returns null when no parent container exists', () =>{
          class Logger {}

          class App {
            static inject() { return [Parent.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          let instance = new Logger();
          container.registerInstance(Logger, instance);

          let app = container.get(App);

          expect(app.logger).toBe(null);
        });

        it('returns null when no parent container exists using decorator', () =>{
          class Logger {}

          class App {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          parent(App, null, 0);

          let container = new Container();
          let instance = new Logger();
          container.registerInstance(Logger, instance);

          let app = container.get(App);

          expect(app.logger).toBe(null);
        });
      });

      describe('Factory', () => {
        let container;
        let app;
        let logger;
        let service;
        let data = 'test';

        class Logger {}

        class Service {
          static inject() { return [Factory.of(Logger)]; }
          constructor(getLogger, data) {
            this.getLogger = getLogger;
            this.data = data;
          }
        }

        class App {
          static inject() { return [Factory.of(Service)]; }
          constructor(GetService) {
            this.GetService = GetService;
            this.service = new GetService(data);
          }
        }

        beforeEach(() => {
          container = new Container();
        });

        it('provides a function which, when called, will return the instance', () => {
          app = container.get(App);
          service = app.GetService;
          expect(service()).toEqual(jasmine.any(Service));
        });

        it('passes data in to the constructor as the second argument', () => {
          app = container.get(App);
          expect(app.service.data).toEqual(data);
        });
      });

      describe('Factory decorator', () => {
        let container;
        let app;
        let logger;
        let service;
        let data = 'test';

        class Logger {}

        class Service {
          static inject= [Logger];
          constructor(getLogger, data) {
            this.getLogger = getLogger;
            this.data = data;
          }
        }

        factory(Logger)(Service, null, 0);

        class App {
          static inject = [Service];
          constructor(GetService) {
            this.GetService = GetService;
            this.service = new GetService(data);
          }
        }

        factory(Service)(App, null, 0);

        beforeEach(() => {
          container = new Container();
        });

        it('provides a function which, when called, will return the instance', () => {
          app = container.get(App);
          service = app.GetService;
          expect(service()).toEqual(jasmine.any(Service));
        });

        it('passes data in to the constructor as the second argument', () => {
          app = container.get(App);
          expect(app.service.data).toEqual(data);
        });
      });

      describe('NewInstance', () => {
        class Logger {
          constructor(dep?) {
            this.dep = dep;
          }
        }

        class Dependency {}

        it('inject a new instance of a dependency, without regard for existing instances in the container', () => {
          class App1 {
            static inject() { return [NewInstance.of(Logger)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
        });

        it('decorate to inject a new instance of a dependency', () => {
          class App1 {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          newInstance(Logger)(App1, null, 0);

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
        });

        it('inject a new instance of a dependency, with instance dynamic dependency', () => {
          class App1 {
            static inject() { return [NewInstance.of(Logger, Dependency)]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
          expect(app1.logger.dep).toEqual(jasmine.any(Dependency));
        });

        it('decorate to inject a new instance of a dependency, with instance dynamic dependency', () => {
          class App1 {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          newInstance(Logger, Dependency)(App1, null, 0);

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
          expect(app1.logger.dep).toEqual(jasmine.any(Dependency));
        });

        it('inject a new instance of a dependency, with resolver dynamic dependency', () => {
          class App1 {
            static inject() { return [NewInstance.of(Logger, Lazy.of(Dependency))]; }
            constructor(logger) {
              this.logger = logger;
            }
          }

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
          expect(app1.logger.dep()).toEqual(jasmine.any(Dependency));
        });

        it('decorate to inject a new instance of a dependency, with resolver dynamic dependency', () => {
          class App1 {
            static inject = [Logger];
            constructor(logger) {
              this.logger = logger;
            }
          }

          newInstance(Logger, Lazy.of(Dependency))(App1, null, 0);

          let container = new Container();
          let logger = container.get(Logger);
          let app1 = container.get(App1);

          expect(app1.logger).toEqual(jasmine.any(Logger));
          expect(app1.logger).not.toBe(logger);
          expect(app1.logger.dep()).toEqual(jasmine.any(Dependency));
        });
      });
    });
  });
});
