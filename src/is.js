module.exports = {
  name: 'is',
  factory: () => {
    'use strict'

    const is = {
      getType: undefined,
      defined: undefined,
      nullOrUndefined: undefined,
      function: undefined,
      func: undefined,
      promise: undefined,
      asyncFunction: undefined,
      asyncFunc: undefined,
      object: undefined,
      array: undefined,
      string: undefined,
      boolean: undefined,
      date: undefined,
      regexp: undefined,
      number: undefined,
      nullOrWhitespace: undefined,
      decimal: undefined,
      primitive: undefined,
      arrayOf: undefined,
      not: {
        defined: undefined,
        nullOrUndefined: undefined,
        function: undefined,
        func: undefined,
        promise: undefined,
        asyncFunction: undefined,
        asyncFunc: undefined,
        object: undefined,
        array: undefined,
        string: undefined,
        boolean: undefined,
        date: undefined,
        regexp: undefined,
        number: undefined,
        nullOrWhitespace: undefined,
        decimal: undefined,
        primitive: undefined,
        arrayOf: undefined,
      },
    }

    const primitives = [
      'boolean',
      'null',
      'undefined',
      'number',
      'bigint',
      'string',
      'symbol',
    ]

    /**
     * Produces the printed type (i.e. [object Object], [object Function]),
     * removes everything except for the type, and returns the lowered form.
     * (i.e. boolean, number, string, function, asyncfunction, promise, array,
     * date, regexp, object)
     */
    is.getType = function (obj) {
      return Object.prototype.toString.call(obj)
        .replace(/(^\[object )|(\]$)/g, '')
        .toLowerCase()
    }

    is.defined = function (obj) {
      return is.getType(obj) !== 'undefined'
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
      const type = is.getType(obj)
      return type === 'function' ||
        type === 'asyncfunction' ||
        type === 'promise'
    }

    is.func = is.function // typescript support

    is.not.function = function (obj) {
      return is.function(obj) === false
    }

    is.not.func = is.not.function // typescript support

    is.promise = function (obj) {
      const type = is.getType(obj)
      return type === 'asyncfunction' ||
        type === 'promise'
    }

    is.not.promise = function (obj) {
      return is.promise(obj) === false
    }

    is.asyncFunction = function (obj) {
      return is.promise(obj)
    }

    is.asyncFunc = is.asyncFunction // consistency for typescript

    is.not.asyncFunction = function (obj) {
      return is.asyncFunction(obj) === false
    }

    is.not.asyncFunc = is.not.asyncFunction // consistency for typescript

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

    is.primitive = function (input) {
      return primitives.indexOf(is.getType(input)) > -1
    }

    is.not.primitive = function (input) {
      return is.primitive(input) === false
    }

    is.arrayOf = function (type) {
      if (!is[type]) {
        throw new Error(`is does not support evaluation of {${type}}`)
      }

      return function (input) {
        return input.find((v) => is.not[type](v)) === undefined
      }
    }

    is.not.arrayOf = function (type) {
      if (!is[type]) {
        throw new Error(`is does not support evaluation of {${type}}`)
      }

      return function (input) {
        return is.arrayOf(type)(input) === false
      }
    }

    return is
  },
}
