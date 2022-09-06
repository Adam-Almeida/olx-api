const { checkSchema } = require("express-validator")

module.exports = {
  signup: checkSchema({
    name: {
      trim: true,
      notEmpty: true,
      isLength: {
        options: { min: 2, max: 255 }
      },
      errorMessage: 'O nome precisa ter ao menos 2 caracteres.'
    },
    email: {
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'O email não parece válido.' 
    },
    password: {
      notEmpty: true,
      isLength: {
        options: { min: 8, max: 48 }
      },
      errorMessage: 'A senha deve ter entre 8 e 48 caracteres.'
    },
    state: {
      notEmpty: true,
      errorMessage: 'O estado deve ser preechido.'
    }
  })
}