@polyn/blueprint
================
An easy to use validation library for nodejs and browsers

## Usage

### Node

```Shell
$ npm install -save @polyn/blueprint
```

```JavaScript
const {
  blueprint,
  registerValidator,
  registerBlueprint
} = require('@polyn/blueprint')

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

### Browser
Blueprint works the same in the browser, and is packaged in the `dist` folder. You can find all of blueprint's features on `window.polyn.blueprint`.

```Shell
$ npm install -save @polyn/blueprint
```

```HTML
<script src="./node_modules/@polyn/blueprint/dist/blueprint.min.js" />
<script>
  const {
    blueprint,
    registerValidator,
    registerBlueprint
  } = window.polyn.blueprint

  const actual = blueprint('requestBody', {
    name: 'string',
    // ...
  }).validate({
    name: 'Aiden'
    // ...
  })

  if (actual.err) {
    throw actual.err
  }

  console.log(actual.value.name)
</script>
```

## Types
`blueprint` comes with several types already supported. You can also register your own validators. First let's look at what's already there:

```JavaScript
const {
  blueprint,
  gt, gte, lt, lte, range
} = require('@polyn/blueprint')

const allTheTypes = blueprint('allTheTypes', {
  // strings
  requiredString: 'string',
  optionalString: 'string?',
  requiredArrayOfStrings: 'string[]',
  optionalArrayOfStrings: 'string[]?',
  // numbers
  requiredNumber: 'number',
  optionalNumber: 'number?',
  requiredArrayOfNumbers: 'number[]',
  optionalArrayOfNumbers: 'number[]?',
  gt10: gt(10),
  gte10: gte(10),
  lt10: lt(10),
  lte10: lte(10),
  between10And20: range({ gte: 10, lte: 20 }), // supports gt, gte, lt, lte
  // booleans
  requiredBoolean: 'boolean',
  optionalBoolean: 'boolean?',
  requiredArrayOfBooleans: 'boolean[]',
  optionalArrayOfBooleans: 'boolean[]?',
  // dates
  requiredDate: 'date',
  optionalDate: 'date?',
  requiredArrayOfDates: 'date[]',
  optionalArrayOfDates: 'date[]?',
  // regular expressions as values
  requiredRegExp: 'regexp',
  optionalRegExp: 'regexp?',
  requiredArrayOfRegExps: 'regexp[]',
  optionalArrayOfRegExps: 'regexp[]?',
  // regular expressions as validators
  requiredEnum: /^book|magazine$/i,
  // functions
  requiredFunction: 'function',
  optionalFunction: 'function?',
  requiredArrayOfFunctions: 'function[]',
  optionalArrayOfFunctions: 'function[]?',
  // objects
  requiredObject: 'object',
  optionalObject: 'object?',
  requiredArrayOfObjects: 'object[]',
  optionalArrayOfObjects: 'object[]?',
  // any
  requiredAny: 'any',
  optionalAny: 'any?',
  requiredArrayOfAny: 'any[]',
  optionalArrayOfAny: 'any[]?',
  // weakly typed arrays
  requiredArray: 'array',  // same as any[]
  optionalArray: 'array?', // same as any[]?
  // decimals
  requiredDecimal: 'decimal',
  optionalDecimal: 'decimal?',
  requiredArrayOfDecimals: 'decimal[]',
  optionalArrayOfDecimals: 'decimal[]?',
  // decimal places (up to 15 decimal places)
  requiredDecimalTo1Place: 'decimal:1',
  optionalDecimalTo1Place: 'decimal:1?',
  requiredDecimalTo15Places: 'decimal:15',
  optionalDecimalTo15Places: 'decimal:15?',
  // custom validation
  /**
   * Lets you define your own validators inline, and gives you
   * access to other properties for complex validation.
   * This is useful when you have properties that are required
   * depending on the values of other properties.
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
If the types listed above don't cover your scenario, it's easy to register custom validators.

> If your validator returns an object, you MUST return the value on that object - it will be used to populate `blueprint.validate`'s `value` property.

```JavaScript
registerValidator('gt0', ({ key, value }) => {
  if (value > 0) {
    return {
      err: null,
      value
    }
  }

  return {
    err: new Error('The value must be greater than 0'),
    value: null
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

#### Registering Types
If you want to support nulls and arrays for the validator you are registering, use `registerTypes` instead.

```JavaScript
registerType('char', ({ key, value }) => {
  return typeof value === 'string' && value.length === 1
    ? { err: null, value: value }
    : { err: new Error(`${key} must be a {myString}`), value: null }
})
```

Boolean validators are also accepted:

```JavaScript
registerType('char', ({ value }) => typeof value === 'string' && value.length === 1)
```

Both of these examples will register the following types on blueprint:

```
char
char?
char[]
char[]?
```

#### Registering Blueprints
Sometimes it's useful to register another blueprint as a validator. `registerBlueprint` accepts a blueprint, and registers validators for it, including support for nulls, and arrays.

```JavaScript
const { blueprint, registerBlueprint } = require('@polyn/blueprint')

registerBlueprint('person', {
  firstName: 'string',
  lastName: 'string'
})

const actual = blueprint('requestBody', {
  person: 'person',
  optionalPerson: 'person?',
  people: 'person[]',
  optionalPeople: 'person[]?'
}).validate({
  person: {
    firstName: 'John',
    lastName: 'Doe'
  },
  people: [{
    firstName: 'John',
    lastName: 'Doe'
  }]
})

assert.ifError(actual.err)
assert.strictEqual(actual.value.person.firstName, 'John')
assert.strictEqual(actual.value.person.lastName, 'Doe')
// ...
```

#### Intercepting Values
Both `registerValidator`, and `registerType` can be used to intercept/mutate the values that are returned by blueprint.validate. Both of these examples trim the strings that are

```JavaScript
registerValidator('string1', ({ key, value }) => {
  return is.string(value)
    ? { err: null, value: value.trim() }
    : { err: new Error(errorMessage('string')(key)), value: null }
}) // registers string1 on blueprint

console.log(
  blueprint('string1-test', {
    name: 'string1'
  })
  .validate({
    name: '  whitespace '
  })
  .value
)

// prints { name: 'whitespace' }

registerType('string2', ({ key, value }) => {
  return is.string(value)
    ? { err: null, value: value.trim() }
    : { err: new Error(errorMessage('string')(key)), value: null }
}) // registers string2, string2?, string2[], and string2[]? on blueprint

console.log(
  blueprint('string2-test', {
    requiredName: 'string2',
    optionalName: 'string2?',
    requiredArray: 'string2[]',
    optionalArray: 'string2[]?'
  })
  .validate({
    requiredName: '  whitespace ',
    optionalName: '  whitespace ',
    requiredArray: ['  whitespace '],
    optionalArray: ['  whitespace ']
  })
  .value
)

// prints
// {
//   requiredName: 'whitespace',
//   optionalName: 'whitespace',
//   requiredArray: ['whitespace'],
//   optionalArray: ['whitespace']
// }
```
