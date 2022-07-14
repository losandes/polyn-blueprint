module.exports = () => {
  class InvalidValueError extends Error {
    constructor (err) {
      super(err && err.message)

      // Maintains proper stack trace for where our error was thrown (only available on V8)
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, InvalidValueError)
      }

      this.name = 'InvalidValueError'
      this.key = err.key
      this.value = err.value
      this.message = err.message
      this.code = err.code
      this.assertion = err.assertion
    }
  }

  return { InvalidValueError }
}
