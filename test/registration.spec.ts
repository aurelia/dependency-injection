import { describe, it, expect } from 'bun:test';
import { Container } from '../src/container';
import { transient, singleton } from '../src/registrations';

describe('registration', () => {
  it('configures singleton via decorators helper (ES5/6)', () => {
    @singleton()
    class Logger { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).toBe(app2.logger);
  });

  it('configures transient (non singleton) via metadata method (ES5/6)', () => {
    @transient()
    class Logger { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).not.toBe(app2.logger);
  });

  it('uses base metadata method (ES5/6) when derived does not specify', () => {
    @transient()
    class LoggerBase { }

    class Logger extends LoggerBase {

    }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).not.toBe(app2.logger);
  });

  it('overrides base metadata method (ES5/6) with derived configuration', () => {
    @singleton()
    class LoggerBase { }
    @transient()
    class Logger extends LoggerBase { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).not.toBe(app2.logger);
  });

  it('doesn\'t get hidden when a super class adds metadata which doesn\'t include the base registration type', () => {
    @transient()
    class LoggerBase { }

    class Logger extends LoggerBase {
    }

    // @ts-ignore
    Reflect.defineMetadata('something', 'test', Logger);

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).not.toBe(app2.logger);
  });
});
