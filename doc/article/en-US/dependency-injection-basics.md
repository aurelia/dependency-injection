---
{
  "name": "Dependency Injection: Basics",
  "culture": "en-US",
  "description": "Learn about how to leverage Aurelia's dependency injection container, the power behind all object creation in Aurelia applications.",
  "engines" : { "aurelia-doc" : "^1.0.0" },
  "author": {
    "name": "Rob Eisenberg",
    "url": "http://robeisenberg.com"
  },
  "contributors": [],
  "translators": [],
  "keywords": ["DI", "IoC"]
}
---
## [Introduction](aurelia-doc://section/1/version/1.0.0)

When building applications, it's often necessary to take a "divide and conquer" approach by breaking down complex problems into a series of simpler problems. In an object-oriented world, this translates to breaking down complex objects into a series of smaller objects, each focusing on a single concern, and collaborating with the others to form a complex system and model its behavior.

A dependency injection container is a tool that can simplify the process of decomposing such a system. Often times, when developers go through the work of destructuring a system, they introduce a new complexity of "re-assembling" the smaller parts again at runtime. This is what a dependency injection container can do for you, using simple declarative hints.

## [Injection](aurelia-doc://section/2/version/1.0.0)

Let's say we have a `CustomerEditScreen` that needs to load a `Customer` entity by ID from a web service. We wouldn't want to place all the details of our AJAX implementation inside our `CustomerEditScreen` class. Instead, we would want to factor that into a `CustomerService` class that our `CustomerEditScreen`, or any other class, can use when it needs to load a `Customer`. Aurelia's dependency injection container lets you accomplish this by declaring that the `CustomerEditScreen` needs to have a `CustomerService` injected at creation time.

The mechanism for declaring a class's dependencies depends on the language you have chosen to author your application with.
Typically, you would use Decorators, an ES Next feature supported by both Babel and TypeScript. Here's what it looks like to declare that the `CustomerEditScreen` needs a `CustomerService`:

<code-listing heading="CustomerEditScreen Injection">
  <source-code lang="ES 2015">
    import {CustomerService} from 'backend/customer-service';

    export class CustomerEditScreen {
      static inject() { return [CustomerService]; }

      constructor(customerService) {
        this.customerService = customerService;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer);
      }
    }
  </source-code>
  <source-code lang="ES 2016">
    import {CustomerService} from 'backend/customer-service';
    import {inject} from 'aurelia-framework';

    @inject(CustomerService)
    export class CustomerEditScreen {
      constructor(customerService) {
        this.customerService = customerService;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer);
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import {CustomerService} from 'backend/customer-service';
    import {inject} from 'aurelia-framework';

    @inject(CustomerService)
    export class CustomerEditScreen {
      constructor(private customerService: CustomerService) {
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer);
      }
    }
  </source-code>
</code-listing>

Notice that we use the `inject` decorator and that the constructor signature matches the list of dependencies in the `inject` decorator. This tells the DI that any time it wants to create an instance of `CustomerEditScreen` it must first obtain an instance of `CustomerService` which it can *inject* into the constructor of `CustomerEditScreen` during instantiation. You can have as many injected dependencies as you need. Simply ensure that the `inject` decorator and the constructor match one another. Here's a quick example of multiple dependencies:

<code-listing heading="CustomerEditScreen Multiple Injection">
  <source-code lang="ES 2015">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';


    export class CustomerEditScreen {
      static inject() { return [CustomerService, CommonDialogs, EventAggregator]; }

      constructor(customerService, dialogs, ea) {
        this.customerService = customerService;
        this.dialogs = dialogs;
        this.ea = ea;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit:begin', customer));
      }
    }
  </source-code>
  <source-code lang="ES 2016">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';
    import {inject} from 'aurelia-framework';

    @inject(CustomerService, CommonDialogs, EventAggregator)
    export class CustomerEditScreen {
      constructor(customerService, dialogs, ea) {
        this.customerService = customerService;
        this.dialogs = dialogs;
        this.ea = ea;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit:begin', customer));
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';
    import {inject} from 'aurelia-framework';

    @inject(CustomerService, CommonDialogs, EventAggregator)
    export class CustomerEditScreen {
      constructor(private customerService: CustomerService, private dialogs: CommonDialogs, private ea: EventAggregator) {
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit', customer));
      }
    }
  </source-code>
</code-listing>

> Info
> To use Decorators in Babel, you need the `babel-plugin-transform-decorators-legacy` plugin. To use them in TypeScript, you need to add the `"experimentalDecorators": true` setting to the `compilerOptions` section of your `tsconfig.json` file. Aurelia projects typically come with these options pre-configured.

If you are using TypeScript, you can take advantage of an experimental feature of the language to have the TypeScript transpiler automatically provide Type information to Aurelia's DI. You can do this by configuring the TypeScript compiler with the `"emitDecoratorMetadata": true` option in the `compilerOptions` section of your `tsconfig.json` file. If you do this, you don't need to duplicate the type information with `inject`, instead, as long as your constructor definition contains its parameters' types, you can use Aurelia's `autoinject` decorator like this:

<code-listing heading="CustomerEditScreen AutoInjection with TypeScript">
  <source-code lang="TypeScript">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';
    import {autoinject} from 'aurelia-framework';

    @autoinject
    export class CustomerEditScreen {
      constructor(private customerService: CustomerService, private dialogs: CommonDialogs, private ea: EventAggregator) {
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit', customer));
      }
    }
  </source-code>
</code-listing>

> Info
> Interestingly, you don't need to use our `autoinject` decorator at all to get the above to work. The TypeScript compiler will emit the type metadata if *any* decorator is added to the class. Aurelia can read this metadata regardless of what decorator triggers TypeScript to add it. We simply provide the `autoinject` decorator for consistency and clarity.

If you aren't using Babel's or TypeScript's decorator support (or don't want to), you can easily provide `inject` metadata using a simple static method or property on your class:

<code-listing heading="CustomerEditScreen Inject Method">
  <source-code lang="ES 2015">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';

    export class CustomerEditScreen {
      static inject() { return [CustomerService, CommonDialogs, EventAggregator]; }

      constructor(customerService, dialogs, ea) {
        this.customerService = customerService;
        this.dialogs = dialogs;
        this.ea = ea;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit:begin', customer));
      }
    }
  </source-code>
  <source-code lang="ES 2016/Typescript">
    import {CustomerService} from 'backend/customer-service';
    import {CommonDialogs} from 'resources/dialogs/common-dialogs';
    import {EventAggregator} from 'aurelia-event-aggregator';

    export class CustomerEditScreen {
      static inject = [CustomerService, CommonDialogs, EventAggregator];

      constructor(customerService, dialogs, ea) {
        this.customerService = customerService;
        this.dialogs = dialogs;
        this.ea = ea;
        this.customer = null;
      }

      activate(params) {
        return this.customerService.getCustomerById(params.customerId)
          .then(customer => this.customer = customer)
          .then(customer => this.ea.publish('edit:begin', customer));
      }
    }
  </source-code>
</code-listing>

In addition to a static `inject` method, a static `inject` property is also supported. In fact, the `inject` decorator simply sets the static property automatically. It's just syntax sugar. If you wanted to use decorators, but didn't want to use Aurelia's decorator, you could even create your own to set this same property.

The nice thing about dependency injection is that it works in a recursive fashion. For example, if class A depends on class B, and class B depends on classes C and D, and class D depends on E, F and G, then creating class A will result in the resolution of all the classes in the hierarchy that are needed.

## [Object Lifetime, Child Containers and Default Behavior](aurelia-doc://section/3/version/1.0.0)

Each object created by the dependency injection container has a "lifetime". There are three lifetime behaviors that are typical:

* **Container Singleton** - A singleton class, `A`, is instantiated when it is first needed by the DI container. The container then holds a reference to class `A`'s instance so that even if no other objects reference it, the container will keep it in memory. When any other class needs to inject `A`, the container will return the exact same instance. Thus, the instance of `A` has its lifetime connected to the container instance. It will not be garbage collected until the container itself is disposed and no other classes hold a reference to it.
* **Application Singleton** - In Aurelia, it's possible to have child DI containers created from parent containers. Each of these child containers inherits the services of the parent, but can override them with their own registrations. Every application has a root DI container from which all classes and child containers are created. An application singleton is just like a container singleton, except that the instance is referenced by the root DI container in the application. This means that the root and all child containers will return the same singleton instance, provided that a child container doesn't explicitly override it with its own registration.
* **Transient** - Any DI container can create transient instances. These instances are created each time they are needed. The container holds no references to them and always creates a new instance for each request.

Any class can be registered in a container as singleton or transient (or custom). We'll look at explicit configuration in the next section. Most classes in your application, however, are auto-registered by Aurelia. That is, there is no upfront configuration, but when an instance of class `A` is first needed, it is registered automatically at that point in time and then immediately resolved to an instance. What does this process look like? Let's look at a couple of examples to see how things work in practice.

### Example 1 - Root Container Resolution

Imagine that we have a single instance of `Container` called `root`. If a developer (or Aurelia) invokes `root.get(A)` to resolve an instance of `A`, the `root` will first check to see if it has a `Resolver` for `A`. If one is found, the `Resolver` is used to `get` the instance, which is then returned to the developer. If one is not found, the container will auto-register a `Resolver` for `A`. This resolver is configured with a *singleton* lifetime behavior. Immediately after auto-registration, the `Resolver` is used to `get` the instance of `A` which is returned to the developer. Subsequent calls to `root.get(A)` will now immediately find a `Resolver` for `A` which will return the singleton instance.

### Example 2 - Child Container Resolution

Now, imagine that we have a `Container` named `root` and we call `root.createChild()` to create a child container named `child`. Then, we invoke `child.get(A)` to resolve an instance of `A`. What will happen? First, `child` checks for a `Resolver` for `A`. If none is found, then it calls `get(A)` on its `parent` which is the `root` container from which it was created. `root` then checks to see if it has a `Resolver`. If not, it auto-registers `A` in `root` and then immediately calls the `Resolver` to `get` an instance of `A`.

### Example 3 - Child Container Resolution with Override

Let's start with an instance of `Container` named `root`. We will then call `root.createChild()` to create a child container named `child`. Next we will call `child.createChild()` to create a grandchild container from it named `grandchild`. Finally, we'll call `child.registerSingleton(A, A)`. What happens when we call `grandchild.get(A)`? First, `grandchild` checks for a `Resolver`. Since it doesn't find one, it delegates to its `parent` which is the `child` from which it was created. `child` then checks for a `Resolver`. Since `child.registerSingleton(A, A)` was called on `child` this means that `child` will have a `Resolver` for `A`. At this point `child`'s resolver is used to `get` an instance of `A` which is returned to the developer.

As you can see from these examples, the `Container` basically walks its hierarchy until it either finds a `Resolver` or reaches the root. If no `Resolver` is found in the root, it auto-registers the class as a singleton in the root. This means that all auto-registered classes are application-wide singletons, unless they are overriden by a child container.

## [How Aurelia Uses Containers](aurelia-doc://section/4/version/1.0.0)

Aurelia makes extensive use of DI throughout the framework. All view-models, components, services, etc. are created with DI. Aurelia also makes heavy use of child containers. The key to understanding the lifetime of your objects is in knowing how Aurelia uses child containers.

There are basically three cases where child containers get created and used by Aurelia, all essentially having to do with components.

### Custom Elements and Custom Attributes

When Aurelia creates a View, that view may contain occurrences of custom elements and custom attributes. Any time an HTML element is found to either *be* a custom element or *have* custom attributes, Aurelia creates a child container for that element, parented to the closest custom element container (or the view itself). It then manually registers the elements/attributes in the child container as singletons. This ensures that the elements and attributes aren't singletons at the application level or even the view level, which would not make sense. Instead, they are scoped to their location in the DOM. As a result of this, the HTML behaviors have access to classes registered above them in the DOM and on the same element. Likewise, they can be injected into classes that are created through their child element containers.

> Info
> Aurelia does not create child containers when there are plain HTML elements, or elements with only binding expressions, value converters, etc. It only creates them when the element itself is a custom element or if the element has custom attributes.

> Warning
> Despite that fact that the child container hierarchy is present in the DOM, you should be very wary of creating structural coupling between components in this way. The child container mechanism primarily exists to provide override services needed by custom elements and attributes such as `Element`/`DOM.Element`, `BoundViewFactory`, `ViewSlot`, `ElementEvents`/`DOM.Events`, `ViewResources` and `TargetInstruction`.

### Routed Components

Each time the `Router` navigates to a screen, it creates a child container to encapsulate all the resources related to that navigation event and then auto-registers the screen's view-model in that child container. As you know, auto-registration, by default, results in the view-model being registered as a singleton. However, it is possible to override this with explicit configuration, unlike custom elements and custom attributes, which are always container singletons.

### Dynamic Components

Dynamic composition, whether through the `<compose>` element or through the `CompositionEngine`, also creates child containers with auto-registration behavior, just like the `Router`. In fact, the `RouteLoader` simply calls the `CompositionEngine` internally to do the heavy lifting.

### The General Rule for Aurelia's DI Use

Everything is an application-level singleton except for those things which are classified as "components", essentially  custom elements, custom attributes and view-models created through the router or composition engine. You can change the lifetime of router and composition created components through explicit configuration.

## [Explicit Configuration](aurelia-doc://section/5/version/1.0.0)

For the most part, Aurelia's DI will do what you want with object lifetime. However, you may desire to change the behavior of individual classes for the specific needs of your application. This is easy to do by either directly using the `Container` API or by decorating your class with a `Registration`.

### The Container Registration API

The usual way to configure a class's lifetime is to use the `Container` API directly. Typically, you will want to do this configuration up-front in your application's main `configure` method. The `Aurelia` instance that is provided during configuration has a `container` property which points to the root DI container for your application. Recall that any `Resolver` configured at the application root will apply unless a child container has explicitly overriden the behavior.

Here's a survey of the registration APIs you have available through a `Container` instance:

* `container.registerSingleton(key: any, fn?: Function): void` - This method allows you to register a class as a singleton. This is the default, as discussed above, so there's rarely a reason to call this method. It is provided in the API for completeness. When calling, provide the *key* that will be used to look up the singleton and the *class* which should be used. It's common for the key and class to be the same. If they are the same, then only the *key* needs to be provided. Here are some examples:
  * `container.registerSingleton(History, BrowserHistory);`
  * `container.registerSingleton(HttpClient);`
* `container.registerTransient(key: any, fn?: Function): void` - This method allows you to register a class as transient. This means that every time the `container` is asked for the *key*, it will return a brand new instance of the *class*. As with the singleton behavior, the key is requried but the class is optional. If left off, the key will be treated as the class to be instantiated. Here's an example of using transient registration:
  * `container.registerTransient(LinkHandler, DefaultLinkHandler);`
* `container.registerInstance(key: any, instance?: any): void` - If you already have an existing instance, you can add that to the container with this method. You just need to pick a key that the instance will be retrievable by. If no key is provided then the key becomes the instance.
* `container.registerHandler(key: any, handler: (container?: Container, key?: any, resolver?: Resolver) => any): void` - In addition to simply declaring behaviors, you can also provide a custom function (a handler) that will respond any time the container is queried for the key. This custom handler has access to the container instance, the key and the internal resolver which stores the handler. This enables just about any sort of custom lifetime to be implemented by supplying a custom function. Here's an example:
  * `container.registerHandler('Foo', () => new Bar());`
* `container.registerResolver(key: any, resolver: Resolver): void` - You can also register a custom `Resolver` instance for the key. Under the hood, all previously discussed methods translate to using a built-in `Resolver` instance. However, you can always supply your own. We'll discuss this in more detail in the DI customization article.
* `container.autoRegister(fn: any, key?: any): Resolver` - As you know, if a container can't find a registration during its resolution stage, it will auto-register the requested type. That is done internally through the use of `autoRegister`. However, you can use it yourself to auto-register a type with a particular container instance. By default, this will result in a singleton registration, on the container this API is called on. However, if the type has registration decorators, that could provide an alternate registration. Whatever `Resolver` is established during auto-registration will be returned.

> Info: Registration Keys
> All registration APIs take a `key`. This key is typically the class itself (for convenience). However, the key can be *any* type, including strings and objects. This is possible because Aurelia's DI implementation uses a `Map` object to correlate a *key* to a `Resolver`. When using class-oriented registration APIs, if the key is not a class, you must provide the class to be created as the second argument to the API call.

### Registration Decorators

As an alternative to explicitly registering types with the container, you can rely on auto-registration, but specify the auto-registration behavior you desire, overriding the default container-root-singleton behavior. To provide auto-registration behavior, you simply decorate your type with an auto-registration decorator. What follows is a basic explanation of built-in registration decorators:

* `transient()` - Simply decorate your class with `transient()` and when it's requested from the container, a new instance will be created for each request.
* `singleton(overrideChild?:boolean)` - Normally, types are auto-registered as singletons in the root container. So, why do we provide this decorator? This decorator allows you to specify `true` as an argument to indicate that the singleton should be registered not in the root container, but in the immediate container to which the initial request was issued.
* `registration(registration: Registration)` - In addition to the built-in singleton and transient registrations, you can create your own and associate it with a class. We'll discuss this in more detail in the DI customization article.

> Warning: Registration Decorator Usage
> At present, the Decorators spec allows for decorators to use parens or not depending on whether or not the decorator requires arguments. This means that decorator invocation is dependent on how the decorator was implemented internally, which can be confusing from time to time. As a result of the way that the registration decorators are implemented, you *must* use them with parens.

## [Resolvers](aurelia-doc://section/6/version/1.0.0)

As mentioned above, the DI container uses `Resolvers` internally to provide all instances. When explicitly configuring the container, you are actually specifying what `Resolver` should be associated with a particular lookup key. However, there's a second way that resolvers are useful. Instead of supplying a key as part of the `inject` decorator, you can provide a `Resolver` instead. This resolver then communicates with the container to provide special resolution behavior, specific to the injection. Here's a list of the resolvers you can use in this capacity:

* `Lazy` - Injects a function for lazily evaluating the dependency.
  * ex. `Lazy.of(HttpClient)`
* `All` - Injects an array of all services registered with the provided key.
  * ex. `All.of(Plugin)`
* `Optional` - Injects an instance of a class only if it already exists in the container; null otherwise.
  * ex. `Optional.of(LoggedInUser)`
* `Parent` - Skips starting dependency resolution from the current container and instead begins the lookup process on the parent container.
  * ex. `Parent.of(MyCustomElement)`
* `Factory` - Used to allow injecting dependencies, but also passing data to the constructor.
  * ex. `Factory.of(CustomClass)`
* `NewInstance` - Used to inject a new instance of a dependency, without regard for existing instances in the container.
  * ex. `NewInstance.of(CustomClass).as(Another)`

If using TypeScript, keep in mind that `@autoinject` won't allow you to use `Resolvers`. Instead, you may use argument decorators, without duplicating argument order, which you otherwise have to maintain when using the class decorator or the static `inject` property. Available function parameter decorators are:

* `lazy(key)`
* `all(key)`
* `optional(checkParent?)`
* `parent`
* `factory(key, asValue?)`
* `newInstance(key?)`

Here's an example of how we might express a dependency on `HttpClient` that we may or may not actually need to use, depending on runtime scenarios:

<code-listing heading="Using Resolvers">
  <source-code lang="ES 2016">
    import {Lazy, inject} from 'aurelia-framework';
    import {HttpClient} from 'aurelia-fetch-client';

    @inject(Lazy.of(HttpClient))
    export class CustomerDetail {
      constructor(getHTTP){
        this.getHTTP = getHTTP;
      }
    }
  </source-code>
  <source-code lang="ES 2015">
    import {Lazy} from 'aurelia-framework';
    import {HttpClient} from 'aurelia-fetch-client';

    export class CustomerDetail {
      static inject() { return [Lazy.of(HttpClient)]; }

      constructor(getHTTP){
        this.getHTTP = getHTTP;
      }
    }
  </source-code>
  <source-code lang="TypeScript">
    import {lazy} from 'aurelia-framework';
    import {HttpClient} from 'aurelia-fetch-client';

    export class CustomerDetail {
      constructor(@lazy(HttpClient) private getHTTP: () => HttpClient){ }
    }
  </source-code>
</code-listing>

In this case, the `Lazy` resolver doesn't actually provide an instance of `HttpClient` directly. Instead, it provides a function that can be invoked at some point in the future to obtain an instance of `HttpClient` if needed.
