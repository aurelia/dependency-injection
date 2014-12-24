import {Container, Transient} from '../src/index';

describe('container', () => {
  it('should have some tests', () => {
    var container = new Container();
    expect(container).toBe(container);
  });

  it('should instantiate a class without injected services', function() {
    class App {}

    var container = new Container();
    var app = container.get(App);

    expect(app).toEqual(jasmine.any(App));
  });

  it('should inject dependencies over static inject function', function() {
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

  it('should exec methods of injected dependencies', function() {
    class Logger {
      version() { return '1.2.3'; }
    }

    class App {
      static inject() { return [Logger]; };
      constructor(logger) {
        this.logger = logger;
      }

      get loggerVersion() {
        return this.logger.version();
      }
    }

    var container = new Container();
    var app = container.get(App);

    expect(app.loggerVersion).toEqual('1.2.3');
  });

  it('inject dependencies in many classes should be singleton', function() {
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

  it('transient inject dependencies in many classes should not be singleton', function() {
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
});