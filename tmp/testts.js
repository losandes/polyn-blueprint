"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// make sure tsc can build this
const chai_1 = require("chai");
const index_1 = require("./index");
chai_1.expect(index_1.is.string('str'), `is.string('str') should work`).to.equal(true);
chai_1.expect(index_1.is.not.string(1), `is.not.string(1) should work`).to.equal(true);
chai_1.expect(index_1.is.func(() => true), `is.func(() => true should work`).to.equal(true);
chai_1.expect(index_1.is.not.func('str'), `is.not.func('str') should work`).to.equal(true);
const isCharBool = (context) => {
    return typeof context.value === 'string' && context.value.length === 1;
};
const isCharVal = (context) => {
    if (typeof context.value === 'string' && context.value.length === 1) {
        return {
            err: null,
            messages: null,
            value: context.value
        };
    }
    return {
        err: new Error('BOOM!'),
        messages: ['BOOM!'],
        value: context.value
    };
};
index_1.registerValidator('oneChar', isCharBool),
    index_1.registerValidator('oneChar2', isCharVal),
    index_1.registerType('char', isCharBool),
    index_1.registerType('char2', isCharVal);
const myCharsBp = index_1.blueprint('myChars', {
    a: 'oneChar',
    b: 'oneChar2',
    c: 'char',
    d: 'char2'
});
index_1.registerBlueprint('myChars', myCharsBp);
index_1.registerExpression('productType', /^book|movie$/);
const myModelBp = index_1.blueprint('myModel', {
    prop1: 'string',
    prop2: 'number',
    prop3: 'myChars',
    prop4: 'productType',
    gt: index_1.gt(20),
    gte: index_1.gte(20),
    lt: index_1.lt(20),
    lte: index_1.lte(20),
    range: index_1.range({ gt: 10, lt: 20 }),
    maybeGt: index_1.optional.gt(20),
    maybeGte: index_1.optional.gte(20),
    maybeLt: index_1.optional.lt(20),
    maybeLte: index_1.optional.lte(20),
    maybeRange: index_1.optional.range({ gt: 10, lt: 20 })
});
const result = myModelBp.validate({
    prop1: 'hello world!',
    prop2: 42,
    prop3: {
        a: 'a',
        b: 'b',
        c: 'c',
        d: 'd'
    },
    prop4: 'book'
});
chai_1.expect(result.err).to.be.null;
