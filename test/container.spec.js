import {Container, Transient, Singleton} from '../src/index';

describe('container', () => {
  it('should instantiate a class without injected services', function() {
    class App {}

    var container = new Container();
    var app = container.get(App);

    expect(app).toEqual(jasmine.any(App));
  });

  it('should inject dependencies via static inject method (ES6)', function() {
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

  it('should inject dependencies via static inject property (TypeScript,CoffeeScript,ES5)', function() {
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

  it('should inject dependencies via static parameters property (AtScript)', function() {
    class Logger {}

    class App {
      constructor(logger) {
        this.logger = logger;
      }
    }

    App.parameters = [[Logger]];

    var container = new Container();
    var app = container.get(App);

    expect(app.logger).toEqual(jasmine.any(Logger));
  });

  it('should inject dependency in many classes as singleton', function() {
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
    var app1 = container.get(App1);
    var app2 = container.get(App2);

    expect(app1.logger).toBe(app2.logger);
  });

  it('should inject dependency in many classes as transient (non singleton) via api', function() {
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

  it('should inject dependency in many classes as transient (non singleton) via annotations method (ES6)', function() {
    class Logger {
      static annotations() { return [new Transient()] };
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

  it('should inject dependency in many classes as transient (non singleton) via annotations property (ES5, AtScript, TypeScript, CoffeeScript)', function() {
    class Logger {}
    Logger.annotations = [new Transient()];

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

  it('should inject dependency in many *extended* classes as transient (non singleton) via base annotations method (ES6)', function() {
    class LoggerBase {
      static annotations() { return [new Transient()] };
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

  it('should inject dependency in many *extended* classes as transient (non singleton) via base annotations property (ES5, AtScript, TypeScript, CoffeeScript)', function() {
    class LoggerBase {}
    LoggerBase.annotations = [new Transient()];

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

  it('should inject dependency in many *extended* classes as transient (non singleton) via annotations method (ES6)', function() {
    class LoggerBase {
      static annotations() { return [new Singleton()] };
    }

    class Logger extends LoggerBase {
      static annotations() { return [new Transient()] };
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

  it('should inject dependency in many *extended* classes as transient (non singleton) via annotations property (ES5, AtScript, TypeScript, CoffeeScript)', function() {
    class LoggerBase {
      static annotations() { return [new Singleton()] };
    }

    class Logger extends LoggerBase {}
    Logger.annotations = [new Transient()];

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

  it('should inject concrete singelton dependency in classes that require abstract base class via api', function() {
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

  it('should inject concrete transient dependency in classes that require abstract base class via api', function() {
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

  it('should register key as service when only key provided for transient api', function() {
    class Logger {}

    var container = new Container();
    container.registerTransient(Logger);

    var logger1 = container.get(Logger),
        logger2 = container.get(Logger);

    expect(logger1).toEqual(jasmine.any(Logger));
    expect(logger2).toEqual(jasmine.any(Logger));
    expect(logger2).not.toBe(logger1);
  });

  it('should register key as service when only key provided for singleton api', function() {
    class Logger {}

    var container = new Container();
    container.registerSingleton(Logger);

    var logger1 = container.get(Logger),
        logger2 = container.get(Logger);

    expect(logger1).toEqual(jasmine.any(Logger));
    expect(logger2).toEqual(jasmine.any(Logger));
    expect(logger2).toBe(logger1);
  });
});