const createUserValidator = {
  body: {
    type: "object",
    required: [
      ""
    ],
    properties: {
      username: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      document: { type: 'string' },
      phonenumber: { type: 'string' },
      birthday: { type: 'string', format: 'date-time' },

    }
  },
  response: {
    200: {
      type: "object",
      properties: {
        jwt: {
          type: "string"
        }
      }
    }
  }
}