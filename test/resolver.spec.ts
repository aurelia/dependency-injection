import { describe, it, expect, beforeEach } from 'bun:test';
import { Container } from '../src/container';
import {
  Lazy, All, Optional, Parent,
  Factory, NewInstance, lazy, all, optional,
  parent, factory, newInstance
} from '../src/resolvers';
import { inject, autoinject } from '../src/injection';
// import { DependencyCtorOrFunctor, DependencyCtor, DependencyFunctor } from '../src/types';

describe('resolver', () => {
  describe('Custom resolvers', () => {
    describe('Lazy', () => {
      it('provides a  which=>, when called, will return the instance', () => {
        class Logger { }
        class App1 {
          public static inject() { return [Lazy.of(Logger)]; }
          constructor(@lazy(Logger) public getLogger: () => Logger) {
            this.getLogger = getLogger;
          }
        }

        const container = new Container();
        const app1 = container.get(App1);

        const logger = app1.getLogger;

        expect(logger()).toEqual(expect.any(Logger));
      });

      it('provides a  which=>, when called, will return the instance using decorator', () => {
        class Logger { }

        @autoinject()
        class App {
          constructor(@lazy(Logger) public getLogger: () => Logger) {
            this.getLogger = getLogger;
          }
        }

        const container = new Container();
        const app = container.get(App);

        const logger = app.getLogger;
        expect(logger()).toEqual(expect.any(Logger));
      });
    });

    describe('All', () => {
      it('resolves all matching dependencies as an array of instances', () => {
        class LoggerBase { }

        class VerboseLogger extends LoggerBase { }

        class Logger extends LoggerBase { }

        class App {
          public static inject() { return [All.of(LoggerBase)]; }
          constructor(public loggers) {
            this.loggers = loggers;
          }
        }

        const container = new Container();
        container.registerSingleton(LoggerBase, VerboseLogger);
        container.registerTransient(LoggerBase, Logger);
        const app = container.get(App);

        expect(app.loggers).toEqual(expect.any(Array));
        expect(app.loggers.length).toBe(2);
        expect(app.loggers[0]).toEqual(expect.any(VerboseLogger));
        expect(app.loggers[1]).toEqual(expect.any(Logger));
      });

      it('resolves all matching dependencies as an array of instances using decorator', () => {
        class LoggerBase { }

        class VerboseLogger extends LoggerBase { }

        class Logger extends LoggerBase { }

        @autoinject
        class App {
          constructor(@all(LoggerBase) public loggers) {
            this.loggers = loggers;
          }
        }

        const container = new Container();
        container.registerSingleton(LoggerBase, VerboseLogger);
        container.registerTransient(LoggerBase, Logger);
        const app = container.get(App);

        expect(app.loggers).toEqual(expect.any(Array));
        expect(app.loggers.length).toBe(2);
        expect(app.loggers[0]).toEqual(expect.any(VerboseLogger));
        expect(app.loggers[1]).toEqual(expect.any(Logger));
      });
    });

    describe('Optional', () => {
      it('injects the instance if its registered in the container', () => {
        class Logger { }

        class App {
          public static inject() { return [Optional.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        container.registerSingleton(Logger, Logger);
        const app = container.get(App);

        expect(app.logger).toEqual(expect.any(Logger));
      });

      it('injects the instance if its registered in the container using decorator', () => {
        class Logger { }

        @autoinject()
        class App {
          constructor(@optional() public logger?: Logger) {
          }
        }
        const container = new Container();
        container.registerSingleton(Logger, Logger);
        const app = container.get(App);

        expect(app.logger).toEqual(expect.any(Logger));
      });

      it('injects null if key is not registered in the container', () => {
        class VerboseLogger { }
        class Logger { }

        class App {
          public static inject() { return [Optional.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        container.registerSingleton(VerboseLogger, Logger);
        const app = container.get(App);

        expect(app.logger).toBe(null);
      });

      it('injects null if key is not registered in the container using decorator', () => {
        class VerboseLogger { }
        class Logger { }

        @autoinject
        class App {
          constructor(@optional() public logger: Logger) {
          }
        }

        const container = new Container();
        container.registerSingleton(VerboseLogger, Logger);
        const app = container.get(App);

        expect(app.logger).toBe(null);
      });

      it('injects null if key nor  is=> registered in the container', () => {
        class VerboseLogger { }
        class Logger { }

        class App {
          public static inject() { return [Optional.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        const app = container.get(App);

        expect(app.logger).toBe(null);
      });

      it('doesn\'t check the parent container hierarchy when checkParent is false', () => {
        class Logger { }

        class App {
          public static inject() { return [Optional.of(Logger, false)]; }
          constructor(public logger: Logger) {
          }
        }

        const parentContainer = new Container();
        parentContainer.registerSingleton(Logger, Logger);

        const childContainer = parentContainer.createChild();
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toBe(null);
      });

      it('doesn\'t check the parent container hierarchy when checkParent is false using decorator', () => {
        class Logger { }

        @autoinject()
        class App {
          constructor(@optional(false) public logger: Logger) {
          }
        }
        const parentContainer = new Container();
        parentContainer.registerSingleton(Logger, Logger);

        const childContainer = parentContainer.createChild();
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toBe(null);
      });

      it('checks the parent container hierarchy when checkParent is true or default', () => {
        class Logger { }

        class App {
          public static inject() { return [Optional.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const parentContainer = new Container();
        parentContainer.registerSingleton(Logger, Logger);

        const childContainer = parentContainer.createChild();
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toEqual(expect.any(Logger));
      });

      it('checks the parent container hierarchy when checkParent is true or default using decorator', () => {
        class Logger { }

        @autoinject
        class App {
          constructor(@optional() public logger: Logger) {
          }
        }
        const parentContainer = new Container();
        parentContainer.registerSingleton(Logger, Logger);

        const childContainer = parentContainer.createChild();
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toEqual(expect.any(Logger));
      });
    });

    describe('Parent', () => {
      it('bypasses the current container and injects instance from parent container', () => {
        class Logger { }

        class App {
          public static inject() { return [Parent.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const parentContainer = new Container();
        const parentInstance = new Logger();
        parentContainer.registerInstance(Logger, parentInstance);

        const childContainer = parentContainer.createChild();
        const childInstance = new Logger();
        childContainer.registerInstance(Logger, childInstance);
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toBe(parentInstance);
      });

      it('bypasses the current container and injects instance from parent container using decorator', () => {
        class Logger { }

        @autoinject()
        class App {
          constructor(@parent public logger: Logger) {
          }
        }
        const parentContainer = new Container();
        const parentInstance = new Logger();
        parentContainer.registerInstance(Logger, parentInstance);

        const childContainer = parentContainer.createChild();
        const childInstance = new Logger();
        childContainer.registerInstance(Logger, childInstance);
        childContainer.registerSingleton(App, App);

        const app = childContainer.get(App);

        expect(app.logger).toBe(parentInstance);
      });

      it('returns null when no parent container exists', () => {
        class Logger { }

        class App {
          public static inject() { return [Parent.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        const instance = new Logger();
        container.registerInstance(Logger, instance);

        const app = container.get(App);

        expect(app.logger).toBe(null);
      });

      it('returns null when no parent container exists using decorator', () => {
        class Logger { }

        @autoinject
        class App {
          constructor(@parent public logger: Logger) {
          }
        }

        const container = new Container();
        const instance = new Logger();
        container.registerInstance(Logger, instance);

        const app = container.get(App);

        expect(app.logger).toBe(null);
      });
    });

    describe('Factory', () => {
      let container: Container;
      let app: App;
      let service: (data?: string) => Service;
      const data = 'test';

      class Logger { }

      class Service {
        public static inject() { return [Factory.of(Logger)]; }
        constructor(public getLogger: () => Logger, public data: string) {
        }
      }

      class App {
        public static inject() { return [Factory.of(Service)]; }
        public service: Service;
        constructor(public GetService: (data?: string) => Service) {
          this.service = GetService(data);
        }
      }

      beforeEach(() => {
        container = new Container();
      });

      it('provides a function which, when called, will return the instance', () => {
        app = container.get(App);
        service = app.GetService;
        expect(service()).toEqual(expect.any(Service));
      });

      it('passes data in to the constructor as the second argument', () => {
        app = container.get(App);
        expect(app.service.data).toEqual(data);
      });
    });

    describe('Factory decorator', () => {
      let container;
      let app;
      let service;
      const data = 'test';

      class Logger { }

      @inject(Logger)
      class Service {
        constructor(public getLogger: Logger, public data: string) {
        }
      }

      @autoinject()
      class App {
        public service: Service;
        constructor(@factory(Service) public GetService: (data?: string) => Service) {
          this.service = GetService(data);
        }
      }

      beforeEach(() => {
        container = new Container();
      });

      it('provides a  which=>, when called, will return the instance', () => {
        app = container.get(App);
        service = app.GetService;
        expect(service()).toEqual(expect.any(Service));
      });

      it('passes data in to the constructor as the second argument', () => {
        app = container.get(App);
        expect(app.service.data).toEqual(data);
      });
    });

    describe('NewInstance', () => {
      class Logger {
        constructor(public dep?) {
          this.dep = dep;
        }
      }

      class Dependency { }

      it('inject a new instance of a dependency, without regard for existing instances in the container', () => {
        class App1 {
          public static inject() { return [NewInstance.of(Logger)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
      });

      it('decorate to inject a new instance of a dependency', () => {
        @autoinject
        class App1 {
          constructor(@newInstance() public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
      });

      it('decorate to inject a new instance of a dependency under a new key', () => {
        @autoinject()
        class App1 {
          constructor(@newInstance('aKey') public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get<string, Logger>('akey');
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toEqual(logger);
      });

      it('inject a new instance of a dependency, with instance dynamic dependency', () => {
        class App1 {
          public static inject() { return [NewInstance.of(Logger, Dependency)]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
        expect(app1.logger.dep).toEqual(expect.any(Dependency));
      });

      it('decorate to inject a new instance of a dependency, with instance dynamic dependency', () => {
        @autoinject
        class App1 {
          constructor(@newInstance(Logger, Dependency) public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
        expect(app1.logger.dep).toEqual(expect.any(Dependency));
      });

      it('inject a new instance of a dependency, with resolver dynamic dependency', () => {
        class App1 {
          public static inject() { return [NewInstance.of(Logger, Lazy.of(Dependency))]; }
          constructor(public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
        expect(app1.logger.dep()).toEqual(expect.any(Dependency));
      });

      it('decorate to inject a new instance of a dependency, with resolver dynamic dependency', () => {
        class App1 {
          constructor(@newInstance(Logger, Lazy.of(Dependency)) public logger: Logger) {
          }
        }

        const container = new Container();
        const logger = container.get(Logger);
        const app1 = container.get(App1);

        expect(app1.logger).toEqual(expect.any(Logger));
        expect(app1.logger).not.toBe(logger);
        expect(app1.logger.dep()).toEqual(expect.any(Dependency));
      });
    });
  });

  describe('inheritance with parameter decorators', () => {
    class Dependency { }
    class LoggerBase {
      public dep: any;
      constructor(dep?) {
        this.dep = dep;
      }
    }
    class VerboseLogger extends LoggerBase { }
    class Logger extends LoggerBase { }
    class Service { }
    class SubService1 { }
    class SubService2 { }

    @autoinject
    abstract class ParentApp {
      constructor(@lazy(Logger) public logger: () => Logger) { }
    }

    @autoinject()
    class ChildApp extends ParentApp {
      constructor(public service: Service, @lazy(Logger) ...rest: [() => Logger]) {
        super(...rest);
      }
    }

    @autoinject
    class SubChildApp1 extends ChildApp {
      constructor(@lazy(SubService1) public subService1: () => SubService1,
                  service: Service, @lazy(Logger) ...rest: [() => Logger]) {
        super(service, ...rest);
      }
    }

    @autoinject()
    class SubChildApp2 extends ChildApp {
      constructor(@lazy(SubService2) public subService2: () => SubService2,
                  @newInstance(Service) service: Service,
                  @lazy(Logger) ...rest: [() => Logger]) {
        super(service, ...rest);
      }
    }

    class SubChildApp3 extends ChildApp {
    }

    @autoinject
    class SubChildApp4 extends ChildApp {
      constructor(@lazy(Logger) logger: () => Logger,
                  @lazy(SubService1) public subService1: () => SubService1, service: Service) {
        super(service, logger);
        this.subService1 = subService1;
      }
    }

    const container = new Container();

    const app1 = container.get(SubChildApp1);
    const app2 = container.get(SubChildApp2);
    const app3 = container.get(SubChildApp3);
    const app4 = container.get(SubChildApp4);

    it('loads dependencies in tree classes', () => {
      expect(app1.subService1()).toEqual(expect.any(SubService1));
      expect(app1.service).toEqual(expect.any(Service));
      expect(app1.logger()).toEqual(expect.any(Logger));
    });

    it('does not effect other child classes with different parameters', () => {
      const app2 = container.get(SubChildApp2);
      const service = container.get(Service);
      expect(app2.subService2()).toEqual(expect.any(SubService2));
      expect(app2.service).toEqual(expect.any(Service));
      expect(app2.service).not.toBe(service);
      expect(app2.logger()).toEqual(expect.any(Logger));
    });

    it('does inherit injection without own autoinject', () => {
      expect(app3.service).toEqual(expect.any(Service));
      expect(app3.logger()).toEqual(expect.any(Logger));
    });

    it('does allow a changed constructor parameter order', () => {
      expect(app4.subService1()).toEqual(expect.any(SubService1));
      expect(app4.service).toEqual(expect.any(Service));
      expect(app4.logger()).toEqual(expect.any(Logger));
    });
  });

  describe('autoinject', () => {
    it('allows multiple parameter decorators', () => {
      const data = 'test';
      class Dependency { }
      class LoggerBase {
        constructor(public dep?) {
          this.dep = dep;
        }
      }
      class VerboseLogger extends LoggerBase { }
      class Logger extends LoggerBase { }
      class Service { }

      @autoinject()
      class MyService {
        constructor(@factory(Logger) public getLogger: (data) => Logger, public data) {
        }
      }

      @autoinject
      class App {
        public service: Service & { data: string };
        constructor(
          @lazy(Logger) public getLogger: () => Logger,
          @all(LoggerBase) public loggers: Logger[],
          @optional() public optionalLogger: Logger,
          @parent public parentLogger: Logger,
          @newInstance(Logger, Dependency) public newLogger: Logger,
          @factory(MyService) public GetService: (data?: string) => (Service & { data: string }),
          @inject(NewInstance.of(Logger)) public otherNewLogger: Logger) {
          this.service = GetService(data);
        }
      }

      const parentContainer = new Container();
      const parentInstance = new Logger();
      parentContainer.registerInstance(Logger, parentInstance);

      const container = parentContainer.createChild();
      const childInstance = new Logger();
      container.registerSingleton(LoggerBase, VerboseLogger);
      container.registerTransient(LoggerBase, Logger);
      container.registerSingleton(Logger, Logger);
      container.registerInstance(Logger, childInstance);
      container.registerSingleton(App, App);

      const app = container.get(App);

      const logger = app.getLogger;
      expect(logger()).toEqual(expect.any(Logger));

      expect(app.loggers).toEqual(expect.any(Array));
      expect(app.loggers.length).toBe(2);
      expect(app.loggers[0]).toEqual(expect.any(VerboseLogger));
      expect(app.loggers[1]).toEqual(expect.any(Logger));

      expect(app.optionalLogger).toEqual(expect.any(Logger));

      expect(app.parentLogger).toBe(parentInstance);

      expect(app.newLogger).toEqual(expect.any(Logger));
      expect(app.newLogger).not.toBe(logger);
      expect(app.newLogger.dep).toEqual(expect.any(Dependency));

      const service = app.GetService;
      expect(service()).toEqual(expect.any(MyService));
      expect(app.service.data).toEqual(data);

      expect(app.otherNewLogger).toEqual(expect.any(Logger));
      expect(app.otherNewLogger).not.toBe(logger);
      expect(app.otherNewLogger).not.toBe(app.newLogger);
    });
  });
});
