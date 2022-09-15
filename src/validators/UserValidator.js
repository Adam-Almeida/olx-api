const { checkSchema } = require("express-validator")

module.exports = {
  update: checkSchema({
    token:{ notEmpty:true },
    name: {
      optional: true,
      trim: true,
      isLength: {
        options: { min: 2, max: 255 }
      },
      errorMessage: 'O nome precisa ter ao menos 2 caracteres.'
    },
    email: {
      optional:true,
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'O email não parece válido.' 
    },
    password: {
      optional: true,
      isLength: {
        options: { min: 8, max: 48 }
      },
      errorMessage: 'A senha deve ter entre 8 e 48 caracteres.'
    },
    state: {
      optional: true,
      notEmpty: true,
      errorMessage: 'O estado deve ser preenchido.'
    }
  })
}