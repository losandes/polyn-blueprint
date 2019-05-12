@polyn/blueprint
================
@polyn/blueprint is an easy to use, flexible, and powerful validation library for nodejs and browsers

## Usage

### Node

```Shell
$ npm install --save @polyn/blueprint
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
$ npm install --save @polyn/blueprint
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

## Types / Validators
`blueprint` comes with several types/validators already supported. You can also register your own validators. First let's look at what's already there:

```JavaScript
const {
  blueprint,
  gt, gte, lt, lte, range, optional
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
  maybeGt10: optional.gt(10),
  maybeGte10: optional.gte(10),
  maybeLt10: optional.lt(10),
  maybeLte10: optional.lte(10),
  maybeBetween10And20: optional.range({ gte: 10, lte: 20 }), // supports gt, gte, lt, lte

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
  requiredEnum: /^book|magazine$/,

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

  // inline custom validators
  someProperty: ({ key, value, input, root }) =>
    root.productType === 'book' && typeof value === 'string'
  )
```

## Custom Validators
Blueprint supports multiple ways for defining your own validators.

* Inline custom validators
* Registered validators
* Registered types
* Registered expressions
* Registered blueprints

### Custom Validator Return Values
_Inline custom validators_, _registered validators_, and _registered types_ support passing your own function to perform the validation. Your functions must return one of two types to work. The following examples will use inline custom validators for the example, but the same approach can be used when registering validators, or types.

#### Return boolean
Your validator can simply return `true`, or `false`. This is the least verbose of all approaches.

```JavaScript
const { blueprint } = require('@polyn/blueprint')

const something = blueprint('something', {
  someProperty: ({ value }) => typeof value === 'string'
```

#### Return `ValueOrError`
If you've used _callbacks_ in JavaScript, or programmed in Go, this should be familiar. Your validator can return an object that includes either an `err` property, or a `value` property. The `value` property is used to populate `value` on the output of `blueprint.validate` (@alsosee [Intercepting Values](#intercepting-values)).

```JavaScript
const { blueprint } = require('@polyn/blueprint')

const something = blueprint('something', {
  someProperty: ({ key, value, input, root }) => {
    if (typeof value === 'string') {
      return { err: new Error(`${key} must be a string`) }
    }

    return {
      value
    }
  }
})
```

#### Both Return Types Let You Throw an Error
For both return types, if you `throw`, blueprint will assume the value is not valid, and use the error to populate the validation output.

```JavaScript
const { blueprint } = require('@polyn/blueprint')

const something = blueprint('something', {
  someProperty: ({ key, value, input, root }) => {
    if (typeof value === 'string') {
      throw new Error(`${key} must be a string`)
    }

    // You MUST return either boolean
    return true
    // or:
    // return {
    //   value
    // }
  }
})
```

> NOTE that when registering custom validators, blueprint does NOT protect it's own type definitions, so you can override them. For instance, if you register a validator with the name 'string', blueprint will use your validator for strings from that point on, instead of it's own.

### Inline Custom Validators
When defining the schema for your blueprint, you can define the property type with a function. Blueprint will execute, and pass context to this function when you call `validate`. The context includes other properties on the object that is being validated, so you can perform complex validation.

* _@param {string}_ **key** - the name of the property that is being validated
* _@param {any}_ **value** - the value being validated (i.e. `input[key]`)
* _@param {any}_ **input** - the object that is being validated
* _@param {any}_ **root** - the root object that is being validated (different than input when the input is nested in another object)

In this example, we require the given property based on the value of another property:

```JavaScript
const { blueprint } = require('@polyn/blueprint')

const product = blueprint('product', {
  // require the ISBN if the productType is 'book'
  ISBN: ({ key, value, input, root }) =>
    root.productType === 'book' && typeof value === 'string' && value.length
})
```

> @alsosee [Custom Validator Return Values](#custom-validator-return-values) for information on supported return values

### Registering Validators
Sometimes we need to use custom validators in more than one blueprint. In the spirit of DRY, you can register your custom validators, so they can be added to multiple blueprints by name.

> If your validator returns an object, you MUST return the value on that object - it will be used to populate `blueprint.validate`'s `value` property.

```JavaScript
const { blueprint, registerValidator } = require('@polyn/blueprint')

registerValidator('gt0', ({ key, value }) => {
  return is.number(value) && value > 0
    ? { value }
    : { err: err: new Error('The value must be greater than 0') }
})

const actual = blueprint('requestBody', {
  age: 'gt0'
}).validate({
  age: 20
})

assert.ifError(actual.err)
assert.strictEqual(actual.value.age, 20)
```

> @alsosee [Custom Validator Return Values](#custom-validator-return-values) for information on supported return values

### Registering Types
If you want to support nulls and arrays for the validator you are registering, use `registerTypes` instead. For instance, to register the following:

```
char
char?
char[]
char[]?
```

You can register the type `'char'` like so:

```JavaScript
const { blueprint, registerType } = require('@polyn/blueprint')

registerType('char', ({ value }) =>
  typeof value === 'string' && value.length === 1
)

const actual = blueprint('requestBody', {
  oneChar: 'char',
  maybeChar: 'char?',
  chars: 'char[]',
  maybeChars: 'char[]?'
})
```

> @alsosee [Custom Validator Return Values](#custom-validator-return-values) for information on supported return values

### Registering Regular Expressions
Registering regular expressions works similarly to registering types, except you pass in a RegExp, or string expression as the second argument.

```JavaScript
const { blueprint, registerExpression } = require('@polyn/blueprint')

registerExpression('productType', /^book|movie$/)
registerExpression('movieType', '^comedy|drama$')

const actual = blueprint('requestBody', {
  type: 'productType',
  maybeType: 'productType?',
  types: 'productType[]',
  maybeTypes: 'productType[]?',

  movieType: 'movieType',
  maybeMovieType: 'movieType?',
  movieTypes: 'movieType[]',
  maybeMovieTypes: 'movieType[]?'
})
```

### Registering Blueprints
Sometimes it's useful to register another blueprint as a validator. `registerBlueprint` accepts the same arguments as constructing one, and stores the blueprint as a validator, so it can be used like a type. It includes support for nulls and arrays.

```JavaScript
const { blueprint, registerBlueprint } = require('@polyn/blueprint')

const personBlueprint = registerBlueprint('person', {
  firstName: 'string',
  lastName: 'string'
})

// it returns the blueprint so you can use it
// the same as when you use `blueprint`
personBlueprint.validate({
  firstName: 'John',
  lastName: 'Doe'
})

// it registers the blueprint by name,
// so you can reference it in other models
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

### Intercepting Values
_Inline custom validators_, _registered validators_, and _registered types_ provide the ability to intercept/modify the values that are returned by blueprint.validate.

Both of these examples trim the strings that are written to the `value` property

```JavaScript
registerValidator('string1', ({ key, value }) => {
  return is.string(value)
    ? { value: value.trim() }
    : { err: new Error(errorMessage('string')(key)) }
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
    ? { value: value.trim() }
    : { err: new Error(errorMessage('string')(key)) }
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

## Why @polyn/blueprint? Why not JSON Schema
There's noting wrong with JSON Schema. In many cases it makes more sense to use that, particularly in cases where the schema is meant to be shared across organizational boundaries. I started writing this library years ago when JSON Schema was in it's infancy. So why keep improving and maintaining it?

It's simple. It's less verbose than JSON Schema. It's functional (we write validators as functions, instead of configurations). Because of that it's easily extensible, and it's easy to write complex/dependency-based validations (i.e. _isbn is required if productType === 'book'_).
