'use strict'

class ErrorResponse {
  constructor(success, messageP, codeP, stackP) {
    this.success = success
    this.message = messageP || 'Server error. '
    this.code = codeP || 500
    this.stack = stackP || 'Unavailable.'
  }
}

export default ErrorResponse
