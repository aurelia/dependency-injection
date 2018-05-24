import './setup';
import {Container} from '../src/container';
import {inject, autoinject} from '../src/injection';
import {decorators} from 'aurelia-metadata';

describe('injection', () => {
  it('instantiates class without injected services', function() {
    class App {}

    let container = new Container();
    let app = container.get(App);

    expect(app).toEqual(jasmine.any(App));
  });

  describe('inject', () => {
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

    it('uses inject decorator', function() {
      class Logger {}

      let App = decorators(inject(Logger)).on(
        class App {
          constructor(logger) {
            this.logger = logger;
          }
        });

      let container = new Container();
      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
    });

    it('uses inject as param decorator', ()=> {
      class Logger {}

      class App1 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
      inject(Logger)(App1, null, 0);
      decorators( autoinject() ).on(App1);

      let container = new Container();
      let app1 = container.get(App1);

      let logger = app1.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });

    describe('inheritance', function() {
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
  });

  describe('autoinject', () => {
    class Logger {}
    class Service {}
    class SubService1 {}
    class SubService2 {}

    it('injects using design:paramtypes metadata', function() {
      let App = decorators(autoinject(), Reflect.metadata('design:paramtypes', [Logger, Service ])).on(
        class App {
          constructor(logger, service) {
            this.logger = logger;
            this.service = service;
          }
        });

      let container = new Container();
      let app = container.get(App);

      expect(app.logger).toEqual(jasmine.any(Logger));
      expect(app.service).toEqual(jasmine.any(Service));
    });

    describe('inheritance', function() {
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
      let app2 = container.get(SubChildApp2);
      let app3 = container.get(SubChildApp3);
      let app4 = container.get(SubChildApp4);

      it('loads dependencies in tree classes', function() {
        expect(app1.subService1).toEqual(jasmine.any(SubService1));
        expect(app1.service).toEqual(jasmine.any(Service));
        expect(app1.logger).toEqual(jasmine.any(Logger));
      });

      it('does not effect other child classes with different parameters', function() {
        expect(app2.subService2).toEqual(jasmine.any(SubService2));
        expect(app2.service).toEqual(jasmine.any(Service));
        expect(app2.logger).toEqual(jasmine.any(Logger));
      });

      it('does inherit injection without own autoinject', function() {
        expect(app3.service).toEqual(jasmine.any(Service));
        expect(app3.logger).toEqual(jasmine.any(Logger));
      });

      it('does allow a changed constructor parameter order', function() {
        expect(app4.subService1).toEqual(jasmine.any(SubService1));
        expect(app4.service).toEqual(jasmine.any(Service));
        expect(app4.logger).toEqual(jasmine.any(Logger));
      });

      it('not fail with inherited inject() method', function() {
        class ParentApp {
          static inject() { return [Logger]; }
          constructor(logger) {
            this.logger = logger;
          }
        }
        Reflect.metadata(ParentApp, 'design:paramtypes', [Logger]);

        class App {
          static inject() { return [Logger]; }
          constructor(logger) {
            this.logger = logger;
          }
        }

        let ChildApp = decorators(autoinject(), Reflect.metadata('design:paramtypes', [Service, Logger])).on(
          class extends ParentApp {
            constructor(service, ...rest) {
              super(...rest);
              this.service = service;
            }
          });

        let container = new Container();

        let app1 = container.get(ParentApp);
        expect(app1.logger).toEqual(jasmine.any(Logger));

        let app2 = container.get(ChildApp);
        expect(app2.logger).toEqual(jasmine.any(Logger));
        expect(app2.service).toEqual(jasmine.any(Service));
      });
    });
  });

  describe('inject as param decorator', ()=> {
    it('a simple dependency (Typescript)', () => {
      class Logger {}

      class App1 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
      inject()(App1, null, 0);
      decorators( autoinject() ).on(App1);

      let container = new Container();
      let app1 = container.get(App1);

      let logger = app1.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });

    // not very useful maybe, but allowed in the current implementation
    it('a simple dependency (ES6)', () => {
      class Logger {}

      class App1 {
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

    it('fixes the dependency derived from metadata (Typescript)', () => {
      class LoggerBase {}
      class Logger extends LoggerBase {}

      class App1 {
        constructor(logger) {
          this.logger = logger;
        }
      }

      decorators( Reflect.metadata('design:paramtypes', [Logger]) ).on(App1);
      inject(LoggerBase)(App1, null, 0);
      decorators( autoinject() ).on(App1);

      let container = new Container();
      let app1 = container.get(App1);

      let logger = app1.logger;

      expect(logger).not.toEqual(jasmine.any(Logger));
      expect(logger).toEqual(jasmine.any(LoggerBase));
    });

    // not sure if that's useful, but current implementation allows it
    it('on a member function', () => {
      class Logger {}

      /*
      class App1 {
        @inject(Logger)
        member(logger){
          this.logger=logger;
        }
      }
      */
      class App1 {
        member(logger) {
          this.logger = logger;
        }
      }
      decorators(inject(Logger)).on(App1.prototype.member);

      let container = new Container();
      let app1 = container.get(App1);
      let member = container.get(app1.member);

      let logger = member.logger;

      expect(logger).toEqual(jasmine.any(Logger));
    });
  });
});

