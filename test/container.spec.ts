import './setup';
import { Container } from '../src/container';
import { inject } from '../src/injection';

describe('container', () => {
  it('asserts keys are defined', () => {
    const container = new Container();

    expect(() => container.get(null as any)).toThrow();
    expect(() => container.get(undefined as any)).toThrow();

    expect(() => container.registerInstance(null as any, {})).toThrow();
    expect(() => container.registerInstance(undefined as any, {})).toThrow();

    expect(() => container.registerSingleton(null as any)).toThrow();
    expect(() => container.registerSingleton(undefined as any)).toThrow();

    expect(() => container.registerTransient(null as any)).toThrow();
    expect(() => container.registerTransient(undefined as any)).toThrow();

    expect(() => container.autoRegister(null as any)).toThrow();
    expect(() => container.autoRegister(undefined as any)).toThrow();

    expect(() => container.registerHandler(null as any, undefined as any)).toThrow();
    expect(() => container.registerHandler(undefined as any, undefined as any)).toThrow();

    expect(() => container.autoRegisterAll([null as any])).toThrow();
    expect(() => container.autoRegisterAll([undefined as any])).toThrow();

    const instance = { instanceProp: 'value' };

    const key1 = (...keyArgs: any[]) => null;
    container.registerInstance(key1, instance);
    expect(container.get(key1).instanceProp).toBe(instance.instanceProp);

    const key2 = { keyProperty: 1 };
    container.registerInstance(key2, instance);
    expect(container.get(key2).instanceProp).toBe(instance.instanceProp);

    const key3 = true;
    container.registerInstance(key3, instance);
    expect(container.get(key3).instanceProp).toBe(instance.instanceProp);

    const key4 = false;
    container.registerInstance(key4, instance);
    expect(container.get(key4).instanceProp).toBe(instance.instanceProp);

    const key5 = Symbol();
    container.registerInstance(key5, instance);
    expect(container.get(key5).instanceProp).toBe(instance.instanceProp);

    const key6 = 'stringKey';
    container.registerInstance(key6, instance);
    expect(container.get(key6).instanceProp).toBe(instance.instanceProp);

    class Key7 { public keyProps: string; }
    container.registerInstance(Key7, instance as any);
    expect(container.get(Key7).keyProps).toBe(undefined);
  });

  it('automatically configures as singleton', () => {
    class Logger { }

    @inject(Logger)
    class App1 {
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    @inject(Logger)
    class App2 {
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).toBe(app2.logger);
  });

  it('automatically configures non-functions as instances', () => {
    const someObject = {};

    class App1 {
      constructor(public something: {}) {
        this.something = something;
      }
    }

    inject(someObject)(App1);

    const container = new Container();
    const app1 = container.get(App1);

    expect(app1.something).toBe(someObject);
  });

  it('configures singleton via api', () => {
    class Logger { }

    @inject(Logger)
    class App1 {
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    @inject(Logger)
    class App2 {
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    container.registerSingleton(Logger, Logger);
    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).toBe(app2.logger);
  });

  it('configures transient (non singleton) via api', () => {
    class Logger { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    container.registerTransient(Logger, Logger);

    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).not.toBe(app2.logger);
  });

  it('configures instance via api', () => {
    class Logger { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    const instance = new Logger();
    container.registerInstance(Logger, instance);

    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).toBe(instance);
    expect(app2.logger).toBe(instance);
  });

  it('configures custom via api', () => {
    class Logger { }

    class App1 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    class App2 {
      public static inject() { return [Logger]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    container.registerHandler(Logger, (c) => 'something strange');

    const app1 = container.get(App1);
    const app2 = container.get(App2);

    expect(app1.logger).toEqual('something strange');
    expect(app2.logger).toEqual('something strange');
  });

  it('configures key as service when transient api only provided with key', () => {
    class Logger { }

    const container = new Container();
    container.registerTransient(Logger);

    const logger1 = container.get(Logger);
    const logger2 = container.get(Logger);

    expect(logger1).toEqual(jasmine.any(Logger));
    expect(logger2).toEqual(jasmine.any(Logger));
    expect(logger2).not.toBe(logger1);
  });

  it('configures key as service when singleton api only provided with key', () => {
    class Logger { }

    const container = new Container();
    container.registerSingleton(Logger);

    const logger1 = container.get(Logger);
    const logger2 = container.get(Logger);

    expect(logger1).toEqual(jasmine.any(Logger));
    expect(logger2).toEqual(jasmine.any(Logger));
    expect(logger2).toBe(logger1);
  });

  it('configures concrete singleton via api for abstract dependency', () => {
    class LoggerBase { }
    class Logger extends LoggerBase { }

    class App {
      public static inject() { return [LoggerBase]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    container.registerSingleton(LoggerBase, Logger);

    const app = container.get(App);

    expect(app.logger).toEqual(jasmine.any(Logger));
  });

  it('configures concrete transient via api for abstract dependency', () => {
    class LoggerBase { }
    class Logger extends LoggerBase { }

    class App {
      public static inject() { return [LoggerBase]; }
      constructor(public logger: Logger) {
        this.logger = logger;
      }
    }

    const container = new Container();
    container.registerTransient(LoggerBase, Logger);

    const app = container.get(App);

    expect(app.logger).toEqual(jasmine.any(Logger));
  });
});
