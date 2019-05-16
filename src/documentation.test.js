module.exports = (test) => {
  const {
    blueprint,
    registerBlueprint
  } = test.sut

  return test('given `blueprint`', {
    'documentation': {
      '// schema inheritance': () => {
        // const { blueprint, registerBlueprint } = require('@polyn/blueprint')

        const productBp = blueprint('Product', {
          id: 'string',
          title: 'string',
          description: 'string',
          price: 'decimal:2',
          type: /^book|magazine|card$/,
          metadata: {
            keywords: 'string[]'
          }
        })

        registerBlueprint('Author', {
          firstName: 'string',
          lastName: 'string'
        })

        const bookBp = blueprint('Book', {
          ...productBp.schema,
          ...{
            metadata: {
              ...productBp.schema.metadata,
              ...{
                isbn: 'string',
                authors: 'Author[]'
              }
            }
          }
        })

        console.dir(productBp.validate({
          id: '5623c1263b952eb796d79e02',
          title: 'Happy Birthday',
          description: 'A birthday card',
          price: 9.99,
          type: 'card',
          metadata: {
            keywords: ['bday']
          }
        }), { depth: null })

        console.dir(bookBp.validate({
          id: '5623c1263b952eb796d79e03',
          title: 'Swamplandia',
          description: 'From the celebrated...',
          price: 9.99,
          type: 'book',
          metadata: {
            keywords: ['swamp'],
            isbn: '0-307-26399-1',
            authors: [{
              firstName: 'Karen',
              lastName: 'Russell'
            }]
          }
        }), { depth: null })
      }
    }
  })
}
