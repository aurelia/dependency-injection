"use strict";

exports.isClass = isClass;
// Fix Function#name on browsers that do not support it (IE):
function test() {}
if (!test.name) {
  Object.defineProperty(Function.prototype, "name", {
    get: function get() {
      var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
      // For better performance only parse once, and then cache the
      // result through a new accessor for repeated access.
      Object.defineProperty(this, "name", { value: name });
      return name;
    }
  });
}

function isUpperCase(char) {
  return char.toUpperCase() === char;
}

function isClass(clsOrFunction) {
  if (clsOrFunction.name) {
    return isUpperCase(clsOrFunction.name.charAt(0));
  }

  return Object.keys(clsOrFunction.prototype).length > 0;
}

Object.defineProperty(exports, "__esModule", {
  value: true
});