"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// Node, or global
;

(function (root) {
  // eslint-disable-line no-extra-semi
  'use strict';

  var module = {
    factories: {}
  };
  Object.defineProperty(module, 'exports', {
    get: function get() {
      return null;
    },
    set: function set(val) {
      module.factories[val.name] = val.factory;
    },
    // this property should show up when this object's property names are enumerated
    enumerable: true,
    // this property may not be deleted
    configurable: false
  });
  module.exports = {
    name: 'blueprint',
    factory: function factory(is) {
      'use strict';

      var validators = {};
      /**
       * Validates the input values against the blueprint expectations
       * @curried
       * @param {string} name - the name of the model being validated
       * @param {object} blueprint - the type definitions
       * @param {object} input - the values being validated
       */

      var validate = function validate(name, blueprint) {
        return function (input, root) {
          var outcomes = Object.keys(blueprint).reduce(function (output, key) {
            if (is.object(blueprint[key])) {
              var child = validate("".concat(name, ".").concat(key), blueprint[key])(input[key], root || input);

              if (child.err) {
                output.validationErrors = output.validationErrors.concat(child.messages);
              }

              output.value[key] = child.value;
              return output;
            }

            var validator;

            if (is.function(blueprint[key])) {
              validator = blueprint[key];
            } else if (is.regexp(blueprint[key])) {
              validator = validators.expression(blueprint[key]);
            } else {
              validator = validators[blueprint[key]];
            }

            if (!validator) {
              output.validationErrors.push("I don't know how to validate ".concat(blueprint[key]));
              return output;
            }

            var result = validator({
              key: "".concat(name, ".").concat(key),
              value: input && input[key],
              input: input,
              root: root || input
            });

            if (result && result.err) {
              output.validationErrors.push(result.err.message);
              return output;
            }

            output.value[key] = input[key];
            return output;
          }, {
            validationErrors: [],
            value: {}
          });

          if (outcomes.validationErrors.length) {
            return {
              err: new Error("Invalid ".concat(name, ": ").concat(outcomes.validationErrors.join(', '))),
              messages: outcomes.validationErrors,
              value: null
            };
          }

          return {
            err: null,
            messages: null,
            value: outcomes.value
          };
        };
      }; // /validate

      /**
      * Returns a validator (fluent interface) for validating the input values
      * against the blueprint expectations
      * @param {string} name - the name of the model being validated
      * @param {object} blueprint - the type definitions
      * @param {object} validate.input - the values being validated
      */


      var blueprint = function blueprint(name, _blueprint) {
        if (is.not.string(name) || is.not.object(_blueprint)) {
          return {
            err: new Error('blueprint requires a name {string}, and a blueprint {object}'),
            value: null
          };
        }

        return {
          err: null,
          name: name,
          validate: validate(name, _blueprint)
        };
      };
      /**
       * Registers a validator by name, so it can be used in blueprints
       * @param {string} name - the name of the validator
       * @param {function} validator - the validator
       */


      var registerValidator = function registerValidator(name, validator) {
        if (is.not.string(name) || is.not.function(validator)) {
          var message = 'registerValidator requires a name {string}, and a validator {function}';
          return {
            err: new Error(message),
            messages: [message],
            value: null
          };
        }

        validators[name] = validator;
        return {
          err: null,
          messages: null,
          value: validator
        };
      }; // /registerValidator

      /**
       * Registers a blueprint that can be used as a validator
      * @param {string} name - the name of the model being validated
      * @param {object} blueprint - the type definitions
       */


      var registerBlueprint = function registerBlueprint(name, definition) {
        var bp = blueprint(name, definition);

        if (bp.err) {
          return bp;
        }

        var arrayName = "array<".concat(bp.name, ">");

        var validateOne = function validateOne(_ref) {
          var value = _ref.value;
          var validation = bp.validate(value);

          if (validation.err) {
            return {
              err: validation.err,
              value: null
            };
          }

          return {
            err: null,
            value: validation.value
          };
        };

        var validateMany = function validateMany(_ref2) {
          var value = _ref2.value;

          if (is.not.array(value)) {
            return {
              err: new Error("".concat(arrayName, " {array} is required")),
              value: null
            };
          } else if (value.filter(function (val) {
            return validateOne({
              value: val
            }).err;
          }).length) {
            return {
              err: new Error("All values for ".concat(arrayName, " must be of type, '").concat(bp.name, "'")),
              value: null
            };
          } else {
            return {
              err: null,
              value: value
            };
          }
        }; // /registerBlueprint


        registerValidator(bp.name, validateOne);
        registerValidator("".concat(bp.name, "?"), function (_ref3) {
          var value = _ref3.value;

          if (is.nullOrUndefined(value)) {
            return {
              err: null,
              value: value
            };
          }

          return validateOne({
            value: value
          });
        });
        registerValidator(arrayName, validateMany);
        registerValidator("".concat(arrayName, "?"), function (_ref4) {
          var value = _ref4.value;

          if (is.nullOrUndefined(value)) {
            return {
              err: null,
              value: value
            };
          }

          return validateMany({
            value: value
          });
        });
        return {
          err: null
        };
      };

      var register = function register(isKey, scrub) {
        scrub = is.function(scrub) ? scrub : function (input) {
          return input;
        };
        registerValidator(isKey, function (_ref5) {
          var key = _ref5.key,
              value = _ref5.value;
          return is[isKey](value) ? {
            err: null,
            value: scrub(value)
          } : {
            err: new Error("".concat(key, " {").concat(isKey, "} is required")),
            value: null
          };
        });
        registerValidator("".concat(isKey, "?"), function (_ref6) {
          var key = _ref6.key,
              value = _ref6.value;

          if (is.nullOrUndefined(value)) {
            return {
              err: null,
              value: scrub(value)
            };
          } else if (is[isKey](value)) {
            return {
              err: null,
              value: scrub(value)
            };
          } else {
            return {
              err: new Error("".concat(key, " must be a ").concat(isKey, " if present")),
              value: null
            };
          }
        });
      };

      var registerArrayOfType = function registerArrayOfType(isKey) {
        var name = "array<".concat(isKey, ">");
        registerValidator(name, function (_ref7) {
          var key = _ref7.key,
              value = _ref7.value;

          if (is.not.array(value)) {
            return {
              err: new Error("".concat(key, " {").concat(name, "} is required")),
              value: null
            };
          } else if (value.filter(function (val) {
            return is.not[isKey](val);
          }).length) {
            return {
              err: new Error("All values for ".concat(key, " must be of type, '").concat(isKey, "'")),
              value: null
            };
          } else {
            return {
              err: null,
              value: value
            };
          }
        });
        registerValidator("".concat(name, "?"), function (_ref8) {
          var key = _ref8.key,
              value = _ref8.value;

          if (is.nullOrUndefined(value)) {
            return {
              err: null,
              value: value
            };
          } else if (is.not.array(value)) {
            return {
              err: new Error("".concat(key, " {").concat(name, "} is required")),
              value: null
            };
          } else if (value.filter(function (val) {
            return is.not[isKey](val);
          }).length) {
            return {
              err: new Error("All values for ".concat(key, " must be of type, '").concat(isKey, "'")),
              value: null
            };
          } else {
            return {
              err: null,
              value: value
            };
          }
        });
      };

      var types = ['function', 'object', 'array', 'boolean', 'date', 'number', 'decimal', 'regexp' // 'string', // registered separately with a trimmer
      ];
      types.forEach(function (type) {
        register(type);
        registerArrayOfType(type);
      });
      register('string', function (input) {
        return is.string(input) ? input.trim() : input;
      });
      registerArrayOfType('string'); // support up to 15 decimal places for decimal precision

      var _loop = function _loop(i) {
        registerValidator("decimal:".concat(i), function (_ref10) {
          var key = _ref10.key,
              value = _ref10.value;
          return is.decimal(value, i) ? {
            err: null,
            value: value
          } : {
            err: new Error("".concat(key, " {decimal} is required, and must have ").concat(i, " places")),
            value: null
          };
        });
        registerValidator("decimal:".concat(i, "?"), function (_ref11) {
          var key = _ref11.key,
              value = _ref11.value;

          if (is.nullOrUndefined(value)) {
            return {
              err: null,
              value: value
            };
          } else if (is.decimal(value, i)) {
            return {
              err: null,
              value: value
            };
          } else {
            return {
              err: new Error("".concat(key, " must be a decimal with ").concat(i, " places if present")),
              value: null
            };
          }
        });
      };

      for (var i = 1; i <= 15; i += 1) {
        _loop(i);
      }

      registerValidator('expression', function (regex) {
        return function (_ref9) {
          var key = _ref9.key,
              value = _ref9.value;
          return regex.test(value) === true ? {
            err: null,
            value: value
          } : {
            err: new Error("".concat(key, " does not match ").concat(regex.toString())),
            value: null
          };
        };
      });
      return {
        blueprint: blueprint,
        registerValidator: registerValidator,
        registerBlueprint: registerBlueprint
      };
    }
  };
  module.exports = {
    name: 'is',
    factory: function factory() {
      'use strict';

      var is = {
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
      };
      var class2Types = {};
      var class2ObjTypes = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object'];
      var name;

      for (var i = 0; i < class2ObjTypes.length; i += 1) {
        name = class2ObjTypes[i];
        class2Types['[object ' + name + ']'] = name.toLowerCase();
      }

      is.getType = function (obj) {
        if (typeof obj === 'undefined') {
          return 'undefined';
        }

        if (obj === null) {
          return String(obj);
        }

        return _typeof(obj) === 'object' || typeof obj === 'function' ? class2Types[Object.prototype.toString.call(obj)] || 'object' : _typeof(obj);
      };

      is.defined = function (obj) {
        try {
          return is.getType(obj) !== 'undefined';
        } catch (e) {
          return false;
        }
      };

      is.not.defined = function (obj) {
        return is.defined(obj) === false;
      };

      is.nullOrUndefined = function (obj) {
        return is.not.defined(obj) || obj === null;
      };

      is.not.nullOrUndefined = function (obj) {
        return is.nullOrUndefined(obj) === false;
      };

      is.not.nullOrWhitespace = function (str) {
        if (typeof str === 'undefined' || str === null) {
          return false;
        } else if (Array.isArray(str)) {
          return true;
        } // ([^\s]*) = is not whitespace
        // /^$|\s+/ = is empty or whitespace


        return /([^\s])/.test(str);
      };

      is.nullOrWhitespace = function (str) {
        return is.not.nullOrWhitespace(str) === false;
      };

      is.function = function (obj) {
        return is.getType(obj) === 'function';
      };

      is.not.function = function (obj) {
        return is.function(obj) === false;
      };

      is.object = function (obj) {
        return is.getType(obj) === 'object';
      };

      is.not.object = function (obj) {
        return is.object(obj) === false;
      };

      is.array = function (obj) {
        return is.getType(obj) === 'array';
      };

      is.not.array = function (obj) {
        return is.array(obj) === false;
      };

      is.string = function (obj) {
        return is.getType(obj) === 'string';
      };

      is.not.string = function (obj) {
        return is.string(obj) === false;
      };

      is.boolean = function (obj) {
        return is.getType(obj) === 'boolean';
      };

      is.not.boolean = function (obj) {
        return is.boolean(obj) === false;
      };

      is.date = function (obj) {
        return is.getType(obj) === 'date' && is.function(obj.getTime) && !isNaN(obj.getTime());
      };

      is.not.date = function (obj) {
        return is.date(obj) === false;
      };

      is.regexp = function (obj) {
        return is.getType(obj) === 'regexp';
      };

      is.not.regexp = function (obj) {
        return is.regexp(obj) === false;
      };

      is.number = function (obj) {
        return is.getType(obj) === 'number';
      };

      is.not.number = function (obj) {
        return is.number(obj) === false;
      };

      is.decimal = function (num, places) {
        if (is.not.number(num)) {
          return false;
        }

        if (!places && is.number(num)) {
          return true;
        }

        var padded = +(+num || 0).toFixed(20); // pad to the right for whole numbers

        return padded.toFixed(places) === "".concat(+num);
      };

      is.not.decimal = function (val, places) {
        return is.decimal(val, places) === false;
      };

      return is;
    }
  };
  module.exports = {
    name: 'numberValidators',
    factory: function factory() {
      'use strict';

      var gt = function gt(min) {
        return function (_ref12) {
          var key = _ref12.key,
              value = _ref12.value;

          if (value > min) {
            return {
              err: null,
              value: value
            };
          }

          return {
            err: new Error("".concat(key, " must be greater than ").concat(min)),
            value: null
          };
        };
      };

      var gte = function gte(min) {
        return function (_ref13) {
          var key = _ref13.key,
              value = _ref13.value;

          if (value >= min) {
            return {
              err: null,
              value: value
            };
          }

          return {
            err: new Error("".concat(key, " must be greater than, or equal to ").concat(min)),
            value: null
          };
        };
      };

      var lt = function lt(max) {
        return function (_ref14) {
          var key = _ref14.key,
              value = _ref14.value;

          if (value < max) {
            return {
              err: null,
              value: value
            };
          }

          return {
            err: new Error("".concat(key, " must be less than ").concat(max)),
            value: null
          };
        };
      };

      var lte = function lte(max) {
        return function (_ref15) {
          var key = _ref15.key,
              value = _ref15.value;

          if (value <= max) {
            return {
              err: null,
              value: value
            };
          }

          return {
            err: new Error("".concat(key, " must be less than, or equal to ").concat(max)),
            value: null
          };
        };
      };

      var range = function range(options) {
        if (!options) {
          throw new Error('You must specify a range');
        } else if (isNaN(options.gt) && isNaN(options.gte)) {
          throw new Error('You must specify `gt`, or `gte` {number} when defining a range');
        } else if (isNaN(options.lt) && isNaN(options.lte)) {
          throw new Error('You must specify `lt`, or `lte` {number} when defining a range');
        }

        var gtExpression = options.gt ? gt(options.gt) : gte(options.gte);
        var ltExpression = options.lt ? lt(options.lt) : lte(options.lte);
        return function (input) {
          var ltOutcome = ltExpression(input);

          if (ltOutcome.err) {
            return ltOutcome;
          }

          return gtExpression(input);
        };
      };

      return {
        gt: gt,
        gte: gte,
        lt: lt,
        lte: lte,
        range: range
      };
    }
  };
  var is = module.factories.is();
  var blueprint = Object.assign({
    is: is
  }, module.factories.numberValidators(), module.factories.blueprint(is));
  root.polyn = root.polyn || {};
  root.polyn.blueprint = Object.freeze(blueprint); // we don't need these anymore

  delete module.factories;
})(window);