import './setup';
import {Container} from '../src/container';
import {transient, singleton} from '../src/registrations';
import {decorators} from 'aurelia-metadata';

describe('registration', () => {
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
});

