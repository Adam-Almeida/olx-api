const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { validationResult, matchedData } = require('express-validator')

const User = require('../models/User')
const State = require('../models/State')

module.exports = {
    signin: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() })
            return
        }
        const data = matchedData(req)
        const user = await User.findOne({
            email: data.email
        })

        if(!user){
            res.json({error: 'Email e/ou senha incorretos'})
            return
        }

        const match = await bcrypt.compare(data.password, user.passwordHash)
        if(!match){
            res.json({error: 'Email e/ou senha incorretos'})
            return
        }

        const payload = (Date.now() + Math.random()).toString()
        const token = await bcrypt.hash(payload, 10)
        user.token = token
        await user.save()
        res.json({token, email: data.email})
    },

    signup: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() })
            return
        }

        const data = matchedData(req)
        const user = await User.findOne({
            email: data.email
        })

        if (user) {
            res.json({
                error: { email: { msg: 'Usuário já cadastrado com este email.' } }
            })
            return
        }
        if (mongoose.Types.ObjectId.isValid(data.state)) {
            const state = await State.findById(data.state)
            if (!state) {
                res.json({
                    error: { state: { msg: 'O estado não parece válido.' } }
                })
                return
            }
        } else {
            res.json({
                error: { state: { msg: 'Código do estado inválido.' } }
            })
            return
        }

        const passwordHash = await bcrypt.hash(data.password, 10)
        const payload = (Date.now() + Math.random()).toString()
        const token = await bcrypt.hash(payload, 10)

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash: passwordHash,
            token,
            state: data.state
        })
        await newUser.save()
        res.json({ token })
    }
}