const adventure = require('terminal-adventure')

adventure.menu('Did you build the browser distribution?', ['Yes', 'No', 'Don\'t Need To'])
  .then((answer) => {
    if (answer === 'No') {
      process.exit(1)
    }

    adventure.complete()
  })
