@polyn/blueprint
================
An easy to use validation library for nodejs and browsers

## Usage

### Node

```Shell
$ npm install -save @polyn/blueprint
```

```JavaScript
const { blueprint, registerValidator } = require('@polyn/blueprint')

const actual = blueprint('requestBody', {
  name: 'string',
  age: 'number',
  favoriteMovie: {  // nested definitions are also validated
    title: 'string',
    director: 'string',
    year: 'number'
  }
}).validate({
  name: 'Aiden',
  age: 20,
  favoriteMovie: {
    title: 'Citizen Kane',
    director: 'Orson Welles',
    year: 1941
  }
})

if (actual.err) {
  throw actual.err
}

assert.strictEqual(actual.value.name, 'Aiden')
assert.strictEqual(actual.value.age, 20)
```

## Types
`blueprint` comes with several types already supported. You can also register your own validators. First let's look at what's already there:

```JavaScript
const { blueprint } = require('@polyn/blueprint')

const allTheTypes = blueprint('allTheTypes', {
  // strings
  requiredString: 'string',
  optionalString: 'string?',
  requiredArrayOfStrings: 'array<string>',
  optionalArrayOfStrings: 'array<string>?',
  // numbers
  requiredNumber: 'number',
  optionalNumber: 'number?',
  requiredArrayOfNumbers: 'array<number>',
  optionalArrayOfNumbers: 'array<number>?',
  // booleans
  requiredBoolean: 'boolean',
  optionalBoolean: 'boolean?',
  requiredArrayOfBooleans: 'array<boolean>',
  optionalArrayOfBooleans: 'array<boolean>?',
  // dates
  requiredDate: 'date',
  optionalDate: 'date?',
  requiredArrayOfDates: 'array<date>',
  optionalArrayOfDates: 'array<date>?',
  // regular expressions as values
  requiredRegExp: 'regexp',
  optionalRegExp: 'regexp?',
  requiredArrayOfRegExps: 'array<regexp>',
  optionalArrayOfRegExps: 'array<regexp>?',
  // regular expressions as validators
  requiredEnum: /^book|magazine$/i,
  // functions
  requiredFunction: 'function',
  optionalFunction: 'function?',
  requiredArrayOfFunctions: 'array<function>',
  optionalArrayOfFunctions: 'array<function>?',
  // objects
  requiredObject: 'object',
  optionalObject: 'object?',
  requiredArrayOfObjects: 'array<object>',
  optionalArrayOfObjects: 'array<object>?',
  // weakly typed arrays
  requiredArray: 'array',
  optionalArray: 'array?',
  // decimals
  requiredDecimal: 'decimal',
  optionalDecimal: 'decimal?',
  requiredArrayOfDecimals: 'array<decimal>',
  optionalArrayOfDecimals: 'array<decimal>?',
  // decimal places (up to 15 decimal places)
  requiredDecimalTo1Place: 'decimal:1',
  optionalDecimalTo1Place: 'decimal:1?',
  requiredDecimalTo15Places: 'decimal:15',
  optionalDecimalTo15Places: 'decimal:15?',
  // custom validation
  /**
   * @param {string} key - the name of the property that is being validated (custom in this case)
   * @param {any} value - the value being validated (i.e. `input[key]`)
   * @param {any} input - the object that is being validated
   * @param {any} root - the root object that is being validated (different when an object is nested)
  */
  custom: ({ key, value, input, root }) => {
    const logic = true
    if (!logic) {
      return {
        err: new Error('BOOM!'),
        value: null
      }
    }

    return {
      err: null,
      value
    }
  }
})
```

### Registering Validators
If the types listed above don't cover your scenario, it's easy to register custom validators:

```JavaScript
registerValidator('gt0', ({ key, value }) => {
  if (value < 0) {
    return {
      err: new Error('The value must be greater than 0'),
      value: null
    }
  }

  return {
    err: null,
    value
  }
})

const actual = blueprint('requestBody', {
  age: 'gt0'
}).validate({
  age: 20
})

assert.ifError(actual.err)
assert.strictEqual(actual.value.age, 20)
```

#### Registering Blueprints
Sometimes it's useful to register another blueprint as a validator

```JavaScript
const { blueprint, registerValidator } = require('@polyn/blueprint')

const isPerson = blueprint('person', {
  firstName: 'string',
  lastName: 'string'
})

// register a 'person' type
registerValidator('person', ({ key, value }) => {
  const validation = isPerson.validate(value)

  if (validation.err) {
    return {
      err: validation.err,
      value: null
    }
  }

  return {
    err: null,
    value: validation.value
  }
})

// or maybe an array of 'person'
registerValidator('array<person>', ({ key, value }) => {
  if (!Array.isArray(value)) {
    return {
      err: new Error(`${key} is required`),
      value: null
    }
  } else if (value.filter((person) => isPerson.validate(person).err).length) {
    return {
      err: new Error(`All values in ${key} must be of type, 'person'`),
      value: null
    }
  }

  return {
    err: null,
    value: validation.value
  }
})

const actual = blueprint('requestBody', {
  person: 'person'
}).validate({
  person: {
    firstName: 'John',
    lastName: 'Doe'
  }
})

assert.ifError(actual.err)
assert.strictEqual(actual.value.firstName, 'John')
assert.strictEqual(actual.value.lastName, 'Doe')
```
