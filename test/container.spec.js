import './setup';
import {Container} from '../src/container';
import {inject} from '../src/injection';

describe('container', () => {
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
});
