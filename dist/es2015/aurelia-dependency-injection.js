import { metadata, protocol } from 'aurelia-metadata';
import { AggregateError } from 'aurelia-pal';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function autoinject(potentialTarget) {
    const deco = (target) => {
        if (!target.hasOwnProperty('inject')) {
            target.inject = (metadata.getOwn(metadata.paramTypes, target) ||
                _emptyParameters).slice();
            if (target.inject && target.inject.length > 0) {
                if (target.inject[target.inject.length - 1] === Object) {
                    target.inject.splice(-1, 1);
                }
            }
        }
    };
    return potentialTarget ? deco(potentialTarget) : deco;
}
function inject(...rest) {
    return (target, _key, descriptor) => {
        if (typeof descriptor === 'number') {
            autoinject(target);
            if (rest.length === 1) {
                target.inject[descriptor] = rest[0];
            }
            return;
        }
        if (descriptor) {
            const fn = descriptor.value;
            fn.inject = rest;
        }
        else {
            target.inject = rest;
        }
    };
}

var Lazy_1, All_1, Optional_1, Parent_1, Factory_1, NewInstance_1;
const resolver = protocol.create('aurelia:resolver', (target) => {
    if (!(typeof target.get === 'function')) {
        return 'Resolvers must implement: get(container: Container, key: any): any';
    }
    return true;
});
function isStrategy(actual, expected, state) {
    return actual === expected;
}
let StrategyResolver = class StrategyResolver {
    constructor(strategy, state) {
        this.strategy = strategy;
        this.state = state;
    }
    get(container, key) {
        if (isStrategy(this.strategy, 0, this.state)) {
            return this.state;
        }
        if (isStrategy(this.strategy, 1, this.state)) {
            const singleton = container.invoke(this.state);
            this.state = singleton;
            this.strategy = 0;
            return singleton;
        }
        if (isStrategy(this.strategy, 2, this.state)) {
            return container.invoke(this.state);
        }
        if (isStrategy(this.strategy, 3, this.state)) {
            return this.state(container, key, this);
        }
        if (isStrategy(this.strategy, 4, this.state)) {
            return this.state[0].get(container, key);
        }
        if (isStrategy(this.strategy, 5, this.state)) {
            return container.get(this.state);
        }
        throw new Error('Invalid strategy: ' + this.strategy);
    }
};
StrategyResolver = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Number, Object])
], StrategyResolver);
let Lazy = Lazy_1 = class Lazy {
    constructor(key) {
        this._key = key;
    }
    get(container) {
        return () => container.get(this._key);
    }
    static of(key) {
        return new Lazy_1(key);
    }
};
Lazy = Lazy_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object])
], Lazy);
let All = All_1 = class All {
    constructor(key) {
        this._key = key;
    }
    get(container) {
        return container.getAll(this._key);
    }
    static of(key) {
        return new All_1(key);
    }
};
All = All_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object])
], All);
let Optional = Optional_1 = class Optional {
    constructor(key, checkParent = true) {
        this._key = key;
        this._checkParent = checkParent;
    }
    get(container) {
        if (container.hasResolver(this._key, this._checkParent)) {
            return container.get(this._key);
        }
        return null;
    }
    static of(key, checkParent = true) {
        return new Optional_1(key, checkParent);
    }
};
Optional = Optional_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object, Boolean])
], Optional);
let Parent = Parent_1 = class Parent {
    constructor(key) {
        this._key = key;
    }
    get(container) {
        return container.parent ? container.parent.get(this._key) : null;
    }
    static of(key) {
        return new Parent_1(key);
    }
};
Parent = Parent_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object])
], Parent);
let Factory = Factory_1 = class Factory {
    constructor(key) {
        this._key = key;
    }
    get(container) {
        let fn = this._key;
        const resolver = container.getResolver(fn);
        if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
        }
        return (...rest) => container.invoke(fn, rest);
    }
    static of(key) {
        return new Factory_1(key);
    }
};
Factory = Factory_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object])
], Factory);
let NewInstance = NewInstance_1 = class NewInstance {
    constructor(key, ...dynamicDependencies) {
        this.key = key;
        this.asKey = key;
        this.dynamicDependencies = dynamicDependencies;
    }
    get(container) {
        const dynamicDependencies = this.dynamicDependencies.length > 0
            ? this.dynamicDependencies.map(dependency => dependency['protocol:aurelia:resolver']
                ? dependency.get(container)
                : container.get(dependency))
            : undefined;
        let fn = this.key;
        const resolver = container.getResolver(fn);
        if (resolver && resolver.strategy === 3) {
            fn = resolver.state;
        }
        const instance = container.invoke(fn, dynamicDependencies);
        container.registerInstance(this.asKey, instance);
        return instance;
    }
    as(key) {
        this.asKey = key;
        return this;
    }
    static of(key, ...dynamicDependencies) {
        return new NewInstance_1(key, ...dynamicDependencies);
    }
};
NewInstance = NewInstance_1 = __decorate([
    resolver(),
    __metadata("design:paramtypes", [Object, Object])
], NewInstance);
function getDecoratorDependencies(target) {
    autoinject(target);
    return target.inject;
}
function lazy(keyValue) {
    return (target, _key, index) => {
        const inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = Lazy.of(keyValue);
    };
}
function all(keyValue) {
    return (target, _key, index) => {
        const inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = All.of(keyValue);
    };
}
function optional(checkParentOrTarget = true) {
    const deco = (checkParent) => {
        return (target, _key, index) => {
            const inject$$1 = getDecoratorDependencies(target);
            inject$$1[index] = Optional.of(inject$$1[index], checkParent);
        };
    };
    if (typeof checkParentOrTarget === 'boolean') {
        return deco(checkParentOrTarget);
    }
    return deco(true);
}
function parent(target, _key, index) {
    const inject$$1 = getDecoratorDependencies(target);
    inject$$1[index] = Parent.of(inject$$1[index]);
}
function factory(keyValue) {
    return (target, _key, index) => {
        const inject$$1 = getDecoratorDependencies(target);
        inject$$1[index] = Factory.of(keyValue);
    };
}
function newInstance(asKeyOrTarget, ...dynamicDependencies) {
    const deco = (asKey) => {
        return (target, _key, index) => {
            const inject$$1 = getDecoratorDependencies(target);
            inject$$1[index] = NewInstance.of(inject$$1[index], ...dynamicDependencies);
            if (!!asKey) {
                inject$$1[index].as(asKey);
            }
        };
    };
    if (arguments.length >= 1) {
        return deco(asKeyOrTarget);
    }
    return deco();
}

function validateKey(key) {
    if (key === null || key === undefined) {
        throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
    }
}
const _emptyParameters = Object.freeze([]);
metadata.registration = 'aurelia:registration';
metadata.invoker = 'aurelia:invoker';
const resolverDecorates = resolver.decorates;
class InvocationHandler {
    constructor(fn, invoker, dependencies) {
        this.fn = fn;
        this.invoker = invoker;
        this.dependencies = dependencies;
    }
    invoke(container, dynamicDependencies) {
        return dynamicDependencies !== undefined
            ? this.invoker.invokeWithDynamicDependencies(container, this.fn, this.dependencies, dynamicDependencies)
            : this.invoker.invoke(container, this.fn, this.dependencies);
    }
}
function invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
    let i = staticDependencies.length;
    let args = new Array(i);
    let lookup;
    while (i--) {
        lookup = staticDependencies[i];
        if (lookup === null || lookup === undefined) {
            throw new Error('Constructor Parameter with index ' +
                i +
                ' cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
        }
        else {
            args[i] = container.get(lookup);
        }
    }
    if (dynamicDependencies !== undefined) {
        args = args.concat(dynamicDependencies);
    }
    return Reflect.construct(fn, args);
}
const classInvoker = {
    invoke(container, Type, deps) {
        const instances = deps.map((dep) => container.get(dep));
        return Reflect.construct(Type, instances);
    },
    invokeWithDynamicDependencies
};
function getDependencies(f) {
    if (!f.hasOwnProperty('inject')) {
        return [];
    }
    if (typeof f.inject === 'function') {
        return f.inject();
    }
    return f.inject;
}
class Container {
    constructor(configuration) {
        if (configuration === undefined) {
            configuration = {};
        }
        this._configuration = configuration;
        this._onHandlerCreated = configuration.onHandlerCreated;
        this._handlers =
            configuration.handlers || (configuration.handlers = new Map());
        this._resolvers = new Map();
        this.root = this;
        this.parent = null;
    }
    makeGlobal() {
        Container.instance = this;
        return this;
    }
    setHandlerCreatedCallback(onHandlerCreated) {
        this._onHandlerCreated = onHandlerCreated;
        this._configuration.onHandlerCreated = onHandlerCreated;
    }
    registerInstance(key, instance) {
        return this.registerResolver(key, new StrategyResolver(0, instance === undefined ? key : instance));
    }
    registerSingleton(key, fn) {
        return this.registerResolver(key, new StrategyResolver(1, fn === undefined ? key : fn));
    }
    registerTransient(key, fn) {
        return this.registerResolver(key, new StrategyResolver(2, fn === undefined ? key : fn));
    }
    registerHandler(key, handler) {
        return this.registerResolver(key, new StrategyResolver(3, handler));
    }
    registerAlias(originalKey, aliasKey) {
        return this.registerResolver(aliasKey, new StrategyResolver(5, originalKey));
    }
    registerResolver(key, resolver$$1) {
        validateKey(key);
        const allResolvers = this._resolvers;
        const result = allResolvers.get(key);
        if (result === undefined) {
            allResolvers.set(key, resolver$$1);
        }
        else if (result.strategy === 4) {
            result.state.push(resolver$$1);
        }
        else {
            allResolvers.set(key, new StrategyResolver(4, [result, resolver$$1]));
        }
        return resolver$$1;
    }
    autoRegister(key, fn) {
        fn = fn === undefined ? key : fn;
        if (typeof fn === 'function') {
            const registration = metadata.get(metadata.registration, fn);
            if (registration === undefined) {
                return this.registerResolver(key, new StrategyResolver(1, fn));
            }
            return registration.registerResolver(this, key, fn);
        }
        return this.registerResolver(key, new StrategyResolver(0, fn));
    }
    autoRegisterAll(fns) {
        let i = fns.length;
        while (i--) {
            this.autoRegister(fns[i]);
        }
    }
    unregister(key) {
        this._resolvers.delete(key);
    }
    hasResolver(key, checkParent = false) {
        validateKey(key);
        return (this._resolvers.has(key) ||
            (checkParent &&
                this.parent !== null &&
                this.parent.hasResolver(key, checkParent)));
    }
    getResolver(key) {
        return this._resolvers.get(key);
    }
    get(key) {
        validateKey(key);
        if (key === Container) {
            return this;
        }
        if (resolverDecorates(key)) {
            return key.get(this, key);
        }
        const resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return this.autoRegister(key).get(this, key);
            }
            const registration = metadata.get(metadata.registration, key);
            if (registration === undefined) {
                return this.parent._get(key);
            }
            return registration.registerResolver(this, key, key).get(this, key);
        }
        return resolver$$1.get(this, key);
    }
    _get(key) {
        const resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return this.autoRegister(key).get(this, key);
            }
            return this.parent._get(key);
        }
        return resolver$$1.get(this, key);
    }
    getAll(key) {
        validateKey(key);
        const resolver$$1 = this._resolvers.get(key);
        if (resolver$$1 === undefined) {
            if (this.parent === null) {
                return _emptyParameters;
            }
            return this.parent.getAll(key);
        }
        if (resolver$$1.strategy === 4) {
            const state = resolver$$1.state;
            let i = state.length;
            const results = new Array(i);
            while (i--) {
                results[i] = state[i].get(this, key);
            }
            return results;
        }
        return [resolver$$1.get(this, key)];
    }
    createChild() {
        const child = new Container(this._configuration);
        child.root = this.root;
        child.parent = this;
        return child;
    }
    invoke(fn, dynamicDependencies) {
        try {
            let handler = this._handlers.get(fn);
            if (handler === undefined) {
                handler = this._createInvocationHandler(fn);
                this._handlers.set(fn, handler);
            }
            return handler.invoke(this, dynamicDependencies);
        }
        catch (e) {
            throw new AggregateError(`Error invoking ${fn.name}. Check the inner error for details.`, e, true);
        }
    }
    _createInvocationHandler(fn) {
        let dependencies;
        if (fn.inject === undefined) {
            dependencies =
                metadata.getOwn(metadata.paramTypes, fn) || _emptyParameters;
        }
        else {
            dependencies = [];
            let ctor = fn;
            while (typeof ctor === 'function') {
                dependencies.push(...getDependencies(ctor));
                ctor = Object.getPrototypeOf(ctor);
            }
        }
        const invoker = metadata.getOwn(metadata.invoker, fn) || classInvoker;
        const handler = new InvocationHandler(fn, invoker, dependencies);
        return this._onHandlerCreated !== undefined
            ? this._onHandlerCreated(handler)
            : handler;
    }
}

function invoker(value) {
    return target => {
        metadata.define(metadata.invoker, value, target);
    };
}
function invokeAsFactory(potentialTarget) {
    const deco = (target) => {
        metadata.define(metadata.invoker, FactoryInvoker.instance, target);
    };
    return potentialTarget ? deco(potentialTarget) : deco;
}
class FactoryInvoker {
    invoke(container, fn, dependencies) {
        let i = dependencies.length;
        const args = new Array(i);
        while (i--) {
            args[i] = container.get(dependencies[i]);
        }
        return fn.apply(undefined, args);
    }
    invokeWithDynamicDependencies(container, fn, staticDependencies, dynamicDependencies) {
        let i = staticDependencies.length;
        let args = new Array(i);
        while (i--) {
            args[i] = container.get(staticDependencies[i]);
        }
        if (dynamicDependencies !== undefined) {
            args = args.concat(dynamicDependencies);
        }
        return fn.apply(undefined, args);
    }
}
FactoryInvoker.instance = new FactoryInvoker();

function registration(value) {
    return (target) => {
        metadata.define(metadata.registration, value, target);
    };
}
function transient(key) {
    return registration(new TransientRegistration(key));
}
function singleton(keyOrRegisterInChild, registerInChild = false) {
    return registration(new SingletonRegistration(keyOrRegisterInChild, registerInChild));
}
class TransientRegistration {
    constructor(key) {
        this._key = key;
    }
    registerResolver(container, key, fn) {
        const existingResolver = container.getResolver(this._key || key);
        return existingResolver === undefined
            ? container.registerTransient((this._key || key), fn)
            : existingResolver;
    }
}
class SingletonRegistration {
    constructor(keyOrRegisterInChild, registerInChild = false) {
        if (typeof keyOrRegisterInChild === 'boolean') {
            this._registerInChild = keyOrRegisterInChild;
        }
        else {
            this._key = keyOrRegisterInChild;
            this._registerInChild = registerInChild;
        }
    }
    registerResolver(container, key, fn) {
        const targetContainer = this._registerInChild ? container : container.root;
        const existingResolver = targetContainer.getResolver(this._key || key);
        return existingResolver === undefined
            ? targetContainer.registerSingleton(this._key || key, fn)
            : existingResolver;
    }
}

export { _emptyParameters, InvocationHandler, Container, autoinject, inject, invoker, invokeAsFactory, FactoryInvoker, registration, transient, singleton, TransientRegistration, SingletonRegistration, resolver, StrategyResolver, Lazy, All, Optional, Parent, Factory, NewInstance, getDecoratorDependencies, lazy, all, optional, parent, factory, newInstance };
