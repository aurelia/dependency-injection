import './setup';
import {Container} from '../src/container';
import {Lazy, All, Optional, Parent, Factory, NewInstance, lazy, all, optional, parent, factory, newInstance} from '../src/resolvers';
import {inject, autoinject} from '../src/injection';
import {decorators} from 'aurelia-metadata';

describe('resolver', () => {
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

        class App {
          constructor(getLogger: () => Logger) {
            this.getLogger = getLogger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [()=>Logger]) ).on(App);
        lazy(Logger)(App, null, 0);
        decorators( autoinject() ).on(App);

        let container = new Container();
        let app = container.get(App);

        let logger = app.getLogger;
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
          constructor(loggers) {
            this.loggers = loggers;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [LoggerBase]) ).on(App);
        all(LoggerBase)(App, null, 0);
        decorators( autoinject() ).on(App);

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
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        optional()(App, null, 0);
        decorators( autoinject() ).on(App);

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
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        optional()(App, null, 0);
        decorators( autoinject() ).on(App);

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

      it('doesn\'t check the parent container hierarchy when checkParent is false using decorator', () => {
        class Logger {}

        class App {
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        optional(false)(App, null, 0);
        decorators( autoinject() ).on(App);

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

      it('checks the parent container hierarchy when checkParent is true or default using decorator', () => {
        class Logger {}

        class App {
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        optional()(App, null, 0);
        decorators( autoinject() ).on(App);

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
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        parent(App, null, 0);
        decorators( autoinject() ).on(App);

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
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App);
        parent(App, null, 0);
        decorators( autoinject() ).on(App);

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
        constructor(getLogger, data) {
          this.getLogger = getLogger;
          this.data = data;
        }
      }
      decorators( Reflect.metadata('design:paramtypes', [() => Logger]) ).on(Service);
      factory(Logger)(Service, null, 0);
      decorators( autoinject() ).on(Service);

      class App {
        constructor(GetService) {
          this.GetService = GetService;
          this.service = new GetService(data);
        }
      }
      decorators( Reflect.metadata('design:paramtypes', [() => Service]) ).on(App);
      factory(Service)(App, null, 0);
      decorators( autoinject() ).on(App);

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
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
        newInstance()(App1, null, 0);
        decorators( autoinject() ).on(App1);

        let container = new Container();
        let logger = container.get(Logger);
        let app1 = container.get(App1);

        expect(app1.logger).toEqual(jasmine.any(Logger));
        expect(app1.logger).not.toBe(logger);
      });

      it('decorate to inject a new instance of a dependency under a new key', () => {
        class App1 {
          constructor(logger) {
            this.logger = logger;
          }
        }
        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
        newInstance('aKey')(App1, null, 0);
        decorators( autoinject() ).on(App1);

        let container = new Container();
        let logger = container.get('akey');
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
          constructor(logger) {
            this.logger = logger;
          }
        }

        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
        newInstance(Logger, Dependency)(App1, null, 0);
        decorators( autoinject() ).on(App1);

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
          constructor(logger) {
            this.logger = logger;
          }
        }

        decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
        newInstance(Logger, Lazy.of(Dependency))(App1, null, 0);
        decorators( autoinject() ).on(App1);

        let container = new Container();
        let logger = container.get(Logger);
        let app1 = container.get(App1);

        expect(app1.logger).toEqual(jasmine.any(Logger));
        expect(app1.logger).not.toBe(logger);
        expect(app1.logger.dep()).toEqual(jasmine.any(Dependency));
      });
    });
  });

  describe('inheritance with parameter decorators', () => {
    class Dependency {}
    class LoggerBase {
      constructor(dep?) {
        this.dep = dep;
      }
    }
    class VerboseLogger extends LoggerBase {}
    class Logger extends LoggerBase {}
    class Service {}
    class SubService1 {}
    class SubService2 {}

    class ParentApp {
      constructor(logger) {
        this.logger = logger;
      }
    }
    decorators(Reflect.metadata('design:paramtypes', [()=>Logger])).on(ParentApp);
    lazy(Logger)(ParentApp, null, 0);
    decorators( autoinject() ).on(ParentApp);

    class ChildApp extends ParentApp {
      constructor(service, ...rest) {
        super(...rest);
        this.service = service;
      }
    }
    decorators(Reflect.metadata('design:paramtypes', [Service, ()=>Logger])).on(ChildApp);
    lazy(Logger)(ChildApp, null, 1);
    decorators( autoinject() ).on(ChildApp);

    class SubChildApp1 extends ChildApp {
      constructor(subService1, ...rest) {
        super(...rest);
        this.subService1 = subService1;
      }
    }
    decorators(Reflect.metadata('design:paramtypes', [()=>SubService1, Service, ()=>Logger])).on(SubChildApp1);
    lazy(SubService1)(SubChildApp1, null, 0);
    lazy(Logger)(SubChildApp1, null, 2);
    decorators( autoinject() ).on(SubChildApp1);

    class SubChildApp2 extends ChildApp {
      constructor(subService2, ...rest) {
        super(...rest);
        this.subService2 = subService2;
      }
    }
    decorators(Reflect.metadata('design:paramtypes', [()=>SubService2, Service, ()=>Logger])).on(SubChildApp2);
    lazy(SubService2)(SubChildApp2, null, 0);
    newInstance(Service)(SubChildApp2, null, 1);
    lazy(Logger)(SubChildApp2, null, 2);
    decorators( autoinject() ).on(SubChildApp2);

    class SubChildApp3 extends ChildApp {
    }

    class SubChildApp4 extends ChildApp {
      constructor(logger, subService1, service) {
        super(service, logger);
        this.subService1 = subService1;
      }
    }
    decorators(Reflect.metadata('design:paramtypes', [()=>Logger, ()=>SubService1, Service])).on(SubChildApp4);
    lazy(SubService1)(SubChildApp4, null, 1);
    lazy(Logger)(SubChildApp4, null, 0);
    decorators( autoinject() ).on(SubChildApp4);

    let container = new Container();

    let app1 = container.get(SubChildApp1);
    let app2 = container.get(SubChildApp2);
    let app3 = container.get(SubChildApp3);
    let app4 = container.get(SubChildApp4);

    it('loads dependencies in tree classes', function() {
      expect(app1.subService1()).toEqual(jasmine.any(SubService1));
      expect(app1.service).toEqual(jasmine.any(Service));
      expect(app1.logger()).toEqual(jasmine.any(Logger));
    });

    it('does not effect other child classes with different parameters', function() {
      let app2 = container.get(SubChildApp2);
      let service = container.get(Service);
      expect(app2.subService2()).toEqual(jasmine.any(SubService2));
      expect(app2.service).toEqual(jasmine.any(Service));
      expect(app2.service).not.toBe(service);
      expect(app2.logger()).toEqual(jasmine.any(Logger));
    });

    it('does inherit injection without own autoinject', function() {
      expect(app3.service).toEqual(jasmine.any(Service));
      expect(app3.logger()).toEqual(jasmine.any(Logger));
    });

    it('does allow a changed constructor parameter order', function() {
      expect(app4.subService1()).toEqual(jasmine.any(SubService1));
      expect(app4.service).toEqual(jasmine.any(Service));
      expect(app4.logger()).toEqual(jasmine.any(Logger));
    });
  });

  describe('autoinject', () => {
    it('allows multiple parameter decorators', () => {
      let data = 'test';
      class Dependency {}
      class LoggerBase {
        constructor(dep?) {
          this.dep = dep;
        }
      }
      class VerboseLogger extends LoggerBase {}
      class Logger extends LoggerBase {}
      class Service {}

      class MyService {
        constructor(getLogger, data) {
          this.getLogger = getLogger;
          this.data = data;
        }
      }
      decorators( Reflect.metadata('design:paramtypes', [() => Logger]) ).on(MyService);
      factory(Logger)(MyService, null, 0);
      decorators( autoinject() ).on(MyService);

      class App {
        constructor(getLogger: () => Logger, loggers, optionalLogger, parentLogger, newLogger, GetService, otherNewLogger) {
          this.getLogger = getLogger;
          this.loggers = loggers;
          this.optionalLogger = optionalLogger;
          this.parentLogger = parentLogger;
          this.newLogger = newLogger;
          this.GetService = GetService;
          this.service = new GetService(data);
          this.otherNewLogger = otherNewLogger;
        }
      }

      decorators( Reflect.metadata('design:paramtypes', [()=>Logger, LoggerBase, Logger, Logger, Logger, MyService, Logger]) ).on(App);
      lazy(Logger)(App, null, 0);
      all(LoggerBase)(App, null, 1);
      optional()(App, null, 2);
      parent(App, null, 3);
      newInstance(Logger, Dependency)(App, null, 4);
      factory(MyService)(App, null, 5);
      inject(NewInstance.of(Logger))(App, null, 6);
      decorators( autoinject() ).on(App);

      let parentContainer = new Container();
      let parentInstance = new Logger();
      parentContainer.registerInstance(Logger, parentInstance);

      let container = parentContainer.createChild();
      let childInstance = new Logger();
      container.registerSingleton(LoggerBase, VerboseLogger);
      container.registerTransient(LoggerBase, Logger);
      container.registerSingleton(Logger, Logger);
      container.registerInstance(Logger, childInstance);
      container.registerSingleton(App, App);

      let app = container.get(App);

      let logger = app.getLogger;
      expect(logger()).toEqual(jasmine.any(Logger));

      expect(app.loggers).toEqual(jasmine.any(Array));
      expect(app.loggers.length).toBe(2);
      expect(app.loggers[0]).toEqual(jasmine.any(VerboseLogger));
      expect(app.loggers[1]).toEqual(jasmine.any(Logger));

      expect(app.optionalLogger).toEqual(jasmine.any(Logger));

      expect(app.parentLogger).toBe(parentInstance);

      expect(app.newLogger).toEqual(jasmine.any(Logger));
      expect(app.newLogger).not.toBe(logger);
      expect(app.newLogger.dep).toEqual(jasmine.any(Dependency));

      let service = app.GetService;
      expect(service()).toEqual(jasmine.any(MyService));
      expect(app.service.data).toEqual(data);

	    expect(app.otherNewLogger).toEqual(jasmine.any(Logger));
      expect(app.otherNewLogger).not.toBe(logger);
      expect(app.otherNewLogger).not.toBe(app.newLogger);
    });
  });
});
