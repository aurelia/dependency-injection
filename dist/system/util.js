System.register([], function (_export) {
  "use strict";

  _export("isClass", isClass);

  function test() {}


  function isUpperCase(char) {
    return char.toUpperCase() === char;
  }

  function isClass(clsOrFunction) {
    if (clsOrFunction.name) {
      return isUpperCase(clsOrFunction.name.charAt(0));
    }

    return Object.keys(clsOrFunction.prototype).length > 0;
  }
  return {
    setters: [],
    execute: function () {
      if (!test.name) {
        Object.defineProperty(Function.prototype, "name", {
          get: function () {
            var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
            Object.defineProperty(this, "name", { value: name });
            return name;
          }
        });
      }
    }
  };
});