export class Inject{
  constructor(...keys) {
    this.keys = keys;
  }
}

export class Registration {
  register(container, key, fn){
    throw new Error('A custom Registration must implement register(container, key, fn).');
  }
}

export class Transient extends Registration {
  constructor(key){
    this.key = key;
  }

  register(container, key, fn){
    container.registerTransient(this.key || key, fn);
  }
}

export class Singleton extends Registration {
  constructor(key){
    this.key = key;
  }

  register(container, key, fn){
    container.registerSingleton(this.key || key, fn);
  }
}

export class Resolver {
  get(container){
    throw new Error('A custom Resolver must implement get(container) and return the resolved instance(s).');
  }
}

export class Lazy extends Resolver {
  constructor(key){
    this.key = key;
  }

  get(container){
    return () => {
      return container.get(this.key);
    };
  }

  static of(key){
    return new Lazy(key);
  }
}

export class All extends Resolver {
  constructor(key){
    this.key = key;
  }

  get(container){
    return container.getAll(this.key);
  }

  static of(key){
    return new All(key);
  }
}

export class Optional extends Resolver {
  constructor(key, checkParent=false){
    this.key = key;
    this.checkParent = checkParent;
  }

  get(container){
    if(container.hasHandler(this.key, this.checkParent)){
      return container.get(this.key);
    }

    return null;
  }

  static of(key, checkParent=false){
    return new Optional(key, checkParent);
  }
}