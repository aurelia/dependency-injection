// Fix Function#name on browsers that do not support it (IE):
if (!(function f() {}).name) {
  Object.defineProperty(Function.prototype, 'name', {
    get: function() {
      var name = this.toString().match(/^\s*function\s*(\S*)\s*\(/)[1];
      // For better performance only parse once, and then cache the
      // result through a new accessor for repeated access.
      Object.defineProperty(this, 'name', { value: name });
      return name;
    }
  });
}

function isUpperCase(char) {
  return char.toUpperCase() === char;
}

export function isClass(clsOrFunction) {
  if (clsOrFunction.name) {
    return isUpperCase(clsOrFunction.name.charAt(0));
  }

  return Object.keys(clsOrFunction.prototype).length > 0;
}