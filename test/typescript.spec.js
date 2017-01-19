import {Container, Transient, Singleton} from '../src/index';

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var audi = {
    Container: Container,
    Transient: Transient,
    Singleton: Singleton
}

    // 15 -----------------
    var LoggerBase15 = (function () {
        function LoggerBase15() {
        }
        LoggerBase15.annotations = [];
        return LoggerBase15;
    })();
    LoggerBase15.annotations = [new audi.Transient()];
    var Logger15 = (function (_super) {
        __extends(Logger15, _super);
        function Logger15() {
            _super.apply(this, arguments);
        }
        return Logger15;
    })(LoggerBase15);
    var App15One = (function () {
        function App15One(logger) {
            this.logger = logger;
        }
        App15One.inject = function () {
            return [Logger15];
        };
        return App15One;
    })();
    var App15Two = (function () {
        function App15Two(logger) {
            this.logger = logger;
        }
        App15Two.inject = function () {
            return [Logger15];
        };
        return App15Two;
    })();
    // 15A -----------------
    var LoggerBase15A = (function () {
        function LoggerBase15A() {
        }
        LoggerBase15A.annotations = [];
        return LoggerBase15A;
    })();
    var Logger15A = (function (_super) {
        __extends(Logger15A, _super);
        function Logger15A() {
            _super.apply(this, arguments);
        }
        return Logger15A;
    })(LoggerBase15A);
    LoggerBase15A.annotations = [new audi.Transient()];
    var App15AOne = (function () {
        function App15AOne(logger) {
            this.logger = logger;
        }
        App15AOne.inject = function () {
            return [Logger15A];
        };
        return App15AOne;
    })();
    var App15ATwo = (function () {
        function App15ATwo(logger) {
            this.logger = logger;
        }
        App15ATwo.inject = function () {
            return [Logger15A];
        };
        return App15ATwo;
    })();
    describe("container", function () {
        describe("registration", function () {
            it("uses base annotations property (ES5, AtScript, TypeScript, CoffeeScript) when derived does not specify", function () {
                var container = new audi.Container();
                var app1 = container.get(App15One);
                var app2 = container.get(App15Two);
                expect(app1.logger).not.toBe(app2.logger);
            });
            it("uses base annotations property (ES5, AtScript, TypeScript, CoffeeScript) when derived does not specify", function () {
                var container = new audi.Container();
                var app1 = container.get(App15AOne);
                var app2 = container.get(App15ATwo);
                expect(app1.logger).not.toBe(app2.logger);
            });
        });
});
//# sourceMappingURL=di-test.spec.js.map