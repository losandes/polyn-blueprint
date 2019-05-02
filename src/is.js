module.exports = {
  name: 'is',
  factory: () => {
    'use strict'

    const is = {
      getType: undefined,
      defined: undefined,
      nullOrUndefined: undefined,
      function: undefined,
      object: undefined,
      array: undefined,
      string: undefined,
      boolean: undefined,
      date: undefined,
      regexp: undefined,
      number: undefined,
      nullOrWhitespace: undefined,
      decimal: undefined,
      not: {
        defined: undefined,
        nullOrUndefined: undefined,
        function: undefined,
        object: undefined,
        array: undefined,
        string: undefined,
        boolean: undefined,
        date: undefined,
        regexp: undefined,
        number: undefined,
        nullOrWhitespace: undefined,
        decimal: undefined
      }
    }
    const class2Types = {}
    const class2ObjTypes = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object']
    let name

    for (let i = 0; i < class2ObjTypes.length; i += 1) {
      name = class2ObjTypes[i]
      class2Types['[object ' + name + ']'] = name.toLowerCase()
    }

    is.getType = function (obj) {
      if (typeof obj === 'undefined') {
        return 'undefined'
      }

      if (obj === null) {
        return String(obj)
      }

      return typeof obj === 'object' || typeof obj === 'function'
        ? class2Types[Object.prototype.toString.call(obj)] || 'object'
        : typeof obj
    }

    is.defined = function (obj) {
      try {
        return is.getType(obj) !== 'undefined'
      } catch (e) {
        return false
      }
    }

    is.not.defined = function (obj) {
      return is.defined(obj) === false
    }

    is.nullOrUndefined = function (obj) {
      return is.not.defined(obj) || obj === null
    }

    is.not.nullOrUndefined = function (obj) {
      return is.nullOrUndefined(obj) === false
    }

    is.not.nullOrWhitespace = function (str) {
      if (typeof str === 'undefined' || str === null) {
        return false
      } else if (Array.isArray(str)) {
        return true
      }

      // ([^\s]*) = is not whitespace
      // /^$|\s+/ = is empty or whitespace

      return (/([^\s])/).test(str)
    }

    is.nullOrWhitespace = function (str) {
      return is.not.nullOrWhitespace(str) === false
    }

    is.function = function (obj) {
      return is.getType(obj) === 'function'
    }

    is.not.function = function (obj) {
      return is.function(obj) === false
    }

    is.object = function (obj) {
      return is.getType(obj) === 'object'
    }

    is.not.object = function (obj) {
      return is.object(obj) === false
    }

    is.array = function (obj) {
      return is.getType(obj) === 'array'
    }

    is.not.array = function (obj) {
      return is.array(obj) === false
    }

    is.string = function (obj) {
      return is.getType(obj) === 'string'
    }

    is.not.string = function (obj) {
      return is.string(obj) === false
    }

    is.boolean = function (obj) {
      return is.getType(obj) === 'boolean'
    }

    is.not.boolean = function (obj) {
      return is.boolean(obj) === false
    }

    is.date = function (obj) {
      return is.getType(obj) === 'date' &&
        is.function(obj.getTime) &&
        !isNaN(obj.getTime())
    }

    is.not.date = function (obj) {
      return is.date(obj) === false
    }

    is.regexp = function (obj) {
      return is.getType(obj) === 'regexp'
    }

    is.not.regexp = function (obj) {
      return is.regexp(obj) === false
    }

    is.number = function (obj) {
      return is.getType(obj) === 'number'
    }

    is.not.number = function (obj) {
      return is.number(obj) === false
    }

    is.decimal = function (num, places) {
      if (is.not.number(num)) {
        return false
      }

      if (!places && is.number(num)) {
        return true
      }

      const padded = +(+num || 0).toFixed(20) // pad to the right for whole numbers

      return padded.toFixed(places) === `${+num}`
    }

    is.not.decimal = function (val, places) {
      return is.decimal(val, places) === false
    }

    return is
  }
}
