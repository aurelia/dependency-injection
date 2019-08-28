import './setup';
import { Container } from '../src/container';
import { inject, autoinject } from '../src/injection';

describe('injection', () => {
  it('instantiates class without injected services', () => {
    class App { }

    const container = new Container();
    const app = container.get(App);

    expect(app).toEqual(jasmine.any(App));
  });

  describe('inject', () => {
    it('uses public static inject method (ES6)', () => {
      class Logger { }

      class App {
        public static inject() { return [Logger]; }
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app = container.get(App);
      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses public static inject property (TypeScript,CoffeeScript,ES5)', () => {
      class Logger { }

      class App {
        public static inject: Logger[];
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      App.inject = [Logger];

      const container = new Container();
      const app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses inject decorator', () => {
      class Logger { }

      @inject(Logger)
      class App {
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses inject as param decorator', () => {

      class Logger { }

      @inject(Logger)
      @autoinject()
      class App1 {
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app1 = container.get(App1);

      const logger = app1.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });

    describe('inheritance', () => {
      class Logger { }
      class Service { }

      it('loads dependencies for the parent class', () => {
        class ParentApp {
          public static inject() { return [Logger]; }
          constructor(public logger: Logger) {
            this.logger = logger;
          }
        }

        class ChildApp extends ParentApp {
          constructor(...rest) {
            // @ts-ignore
            super(...rest);
          }
        }

        const container = new Container();
        const app = container.get(ChildApp);
        expect(app.logger).toEqual(jasmine.any(Logger));
      });

      it('loads dependencies for the child class', () => {
        class ParentApp {
        }

        class ChildApp extends ParentApp {
          public static inject() { return [Service]; }
          constructor(public service: Service, ...rest) {
            // @ts-ignore
            super(...rest);
            this.service = service;
          }
        }

        const container = new Container();
        const app = container.get(ChildApp);
        expect(app.service).toEqual(jasmine.any(Service));
      });

      it('loads dependencies for both classes', () => {
        class ParentApp {
          public static inject() { return [Logger]; }
          constructor(public logger: Logger) {
            this.logger = logger;
          }
        }

        class ChildApp extends ParentApp {
          public static inject() { return [Service]; }
          constructor(public service: Service, ...rest) {
            // @ts-ignore
            super(...rest);
            this.service = service;
          }
        }

        const container = new Container();
        const app = container.get(ChildApp);
        expect(app.service).toEqual(jasmine.any(Service));
        expect(app.logger).toEqual(jasmine.any(Logger));
      });
    });
  });

  describe('autoinject', () => {
    class Logger { }
    class Service { }
    class SubService1 { }
    class SubService2 { }

    it('injects using design:paramtypes metadata', () => {

      @autoinject()
      class App {
        constructor(public logger: Logger, public service: Service) {
        }
      }

      const container = new Container();
      const app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
      expect(app.service).toEqual(jasmine.any(Service));
    });

    describe('inheritance', () => {
      @autoinject()
      abstract class ParentApp {
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      @autoinject()
      class ChildApp extends ParentApp {
        constructor(public service: Service, ...rest) {
          // @ts-ignore
          super(...rest);
          this.service = service;
        }
      }

      @autoinject()
      class SubChildApp1 extends ChildApp {
        constructor(public subService1: SubService1, ...rest) {
          // @ts-ignore
          super(...rest);
          this.subService1 = subService1;
        }
      }

      @autoinject()
      class SubChildApp2 extends ChildApp {
        constructor(public subService2: SubService2, ...rest) {
          // @ts-ignore
          super(...rest);
          this.subService2 = subService2;
        }
      }

      class SubChildApp3 extends ChildApp {
      }

      @autoinject()
      class SubChildApp4 extends ChildApp {
        constructor(public logger: Logger, public subService1: SubService1, public service: Service) {
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
        expect(app1.subService1).toEqual(jasmine.any(SubService1));
        expect(app1.service).toEqual(jasmine.any(Service));
        expect(app1.logger).toEqual(jasmine.any(Logger));
      });

      it('does not effect other child classes with different parameters', () => {
        expect(app2.subService2).toEqual(jasmine.any(SubService2));
        expect(app2.service).toEqual(jasmine.any(Service));
        expect(app2.logger).toEqual(jasmine.any(Logger));
      });

      it('does inherit injection without own autoinject', () => {
        expect(app3.service).toEqual(jasmine.any(Service));
        expect(app3.logger).toEqual(jasmine.any(Logger));
      });

      it('does allow a changed constructor parameter order', () => {
        expect(app4.subService1).toEqual(jasmine.any(SubService1));
        expect(app4.service).toEqual(jasmine.any(Service));
        expect(app4.logger).toEqual(jasmine.any(Logger));
      });

      it('not fail with inherited inject() method', () => {
        class ParentApp {
          public static inject() { return [Logger]; }
          constructor(public logger: Logger) {
            this.logger = logger;
          }
        }

        Reflect.set(ParentApp, 'design:paramtypes', [Logger]);

        @inject(Logger)
        class App {
          public static inject() { return [Logger]; }
          constructor(public logger: Logger) {
            this.logger = logger;
          }
        }

        @autoinject()
        class ChildApp extends ParentApp {
          constructor(public service: Service, ...rest) {
            // @ts-ignore
            super(...rest);
            this.service = service;
          }
        }

        const container = new Container();

        const app1 = container.get(ParentApp);
        expect(app1.logger).toEqual(jasmine.any(Logger));

        const app2 = container.get(ChildApp);
        expect(app2.logger).toEqual(jasmine.any(Logger));
        expect(app2.service).toEqual(jasmine.any(Service));
      });

      it('test variadic arguments (TypeScript metadata)', () => {
        const container = new Container();
        const VariadicArg = Object; // TypeScript emits "Object" type for "...rest" param

        class Dep$1 { }
        class Dep$2 { }
        class Dep$3 { }
        class Dep$4 { }
        class Dep$5 { }

        @autoinject()
        class ParentOneDep {
          constructor(public dep1: Dep$1) {
            this.dep1 = dep1;
          }
        }

        @autoinject()
        class ParentTwoDeps {
          constructor(public dep1: Dep$1, public dep2: Dep$2) {
            this.dep1 = dep1;
            this.dep2 = dep2;
          }
        }

        class ChildZeroDeps$1 extends ParentOneDep { }
        class ChildZeroDeps$2 extends ParentTwoDeps { }

        @autoinject()
        class ChildOneDep$1 extends ParentOneDep {
          constructor(public dep3: Dep$3, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep3 = dep3;
          }
        }

        {
          const a = container.get(ChildOneDep$1);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
        }

        @autoinject()
        class ChildOneDep$2 extends ParentTwoDeps {
          constructor(public dep3: Dep$3, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep3 = dep3;
          }
        }

        {
          const a = container.get(ChildOneDep$2);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
        }

        @autoinject()
        class ChildTwoDeps$1 extends ParentOneDep {
          constructor(public dep3: Dep$3, public dep4: Dep$4, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep3 = dep3;
            this.dep4 = dep4;
          }
        }

        @autoinject()
        class ChildTwoDeps$2 extends ParentTwoDeps {
          constructor(public dep3: Dep$3, public dep4: Dep$4, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep3 = dep3;
            this.dep4 = dep4;
          }
        }

        class GrandChildZeroDeps$01 extends ChildZeroDeps$1 { }
        {
          const a = container.get(GrandChildZeroDeps$01);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
        }

        class GrandChildZeroDeps$02 extends ChildZeroDeps$2 { }
        {
          const a = container.get(GrandChildZeroDeps$02);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
        }

        class GrandChildZeroDeps$11 extends ChildOneDep$1 { }
        {
          const a = container.get(GrandChildZeroDeps$11);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
        }

        class GrandChildZeroDeps$12 extends ChildOneDep$2 { }
        {
          const a = container.get(GrandChildZeroDeps$12);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
        }

        class GrandChildZeroDeps$21 extends ChildTwoDeps$1 { }
        {
          const a = container.get(GrandChildZeroDeps$21);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep4).toEqual(jasmine.any(Dep$4));
        }

        class GrandChildZeroDeps$22 extends ChildTwoDeps$2 { }
        {
          const a = container.get(GrandChildZeroDeps$22);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep4).toEqual(jasmine.any(Dep$4));
        }

        @autoinject()
        class GrandChildOneDep$01 extends ChildZeroDeps$1 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }

        {
          const a = container.get(GrandChildOneDep$01);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }

        @autoinject()
        class GrandChildOneDep$02 extends ChildZeroDeps$2 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }
        {
          const a = container.get(GrandChildOneDep$02);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }

        @autoinject()
        class GrandChildOneDep$11 extends ChildOneDep$1 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }
        {
          const a = container.get(GrandChildOneDep$11);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }

        @autoinject()
        class GrandChildOneDep$12 extends ChildOneDep$2 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }
        {
          const a = container.get(GrandChildOneDep$12);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }

        @autoinject()
        class GrandChildOneDep$21 extends ChildTwoDeps$1 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }
        {
          const a = container.get(GrandChildOneDep$21);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep4).toEqual(jasmine.any(Dep$4));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }

        @autoinject()
        class GrandChildOneDep$22 extends ChildTwoDeps$2 {
          constructor(public dep5: Dep$5, ...rest) {
            // @ts-ignore
            super(...rest);
            this.dep5 = dep5;
          }
        }

        {
          const a = container.get(GrandChildOneDep$22);
          expect(a.dep1).toEqual(jasmine.any(Dep$1));
          expect(a.dep2).toEqual(jasmine.any(Dep$2));
          expect(a.dep3).toEqual(jasmine.any(Dep$3));
          expect(a.dep4).toEqual(jasmine.any(Dep$4));
          expect(a.dep5).toEqual(jasmine.any(Dep$5));
        }
      });
    });
  });

  describe('inject as param decorator', () => {
    it('a simple dependency (Typescript)', () => {
      class Logger { }

      @inject(Logger)
      @autoinject()
      class App1 {
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app1 = container.get(App1);

      const logger = app1.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });

    // not very useful maybe, but allowed in the current implementation
    it('a simple dependency (ES6)', () => {
      class Logger { }

      class App1 {
        constructor(public logger: Logger) {
          this.logger = logger;
        }
      }

      inject(Logger)(App1, null, 0);

      const container = new Container();
      const app1 = container.get(App1);

      const logger = app1.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });

    it('fixes the dependency derived from metadata (Typescript)', () => {
      class LoggerBase { }
      class Logger extends LoggerBase { }
      @inject(LoggerBase)
      @autoinject()
      class App1 {
        constructor(public logger: LoggerBase) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app1 = container.get(App1);

      const logger = app1.logger;

      expect(logger).not.toEqual(jasmine.any(Logger));
      expect(logger).toEqual(jasmine.any(LoggerBase));
    });

    // not sure if that's useful, but current implementation allows it
    it('on a member function', () => {
      class Logger { }

      /*
      class App1 {
        @inject(Logger)
        member(logger){
          this.logger=logger;
        }
      }
      */
      class App1 {
        public logger;
        @inject(Logger)
        public member(logger) {
          this.logger = logger;
        }
      }

      const container = new Container();
      const app1 = container.get(App1);
      // @ts-ignore
      const member: App1 = container.get(app1.member);

      const logger = member.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });
  });
});
