const State = require('../models/State')
const User = require('../models/User')
const Category = require('../models/Category')
const Ad = require('../models/Ad')
const bcrypt = require('bcrypt')
const { validationResult, matchedData } = require('express-validator')

module.exports = {
    getStates: async (req, res) => {
        const states = await State.find()
        res.json({ states })
    },

    info: async (req, res) => {
        let { token } = req.query;
        const user = await User.findOne({ token })
        const state = await State.findById(user.state)
        const ads = await Ad.find({ idUser: user._id.toString() })

        let adsList = []
        for (let i in ads) {
            const category = await Category.findById(ads[i].category)
            adsList.push({
                ...ads[i], category: category.slug
            })
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adsList
        })
    },

    editAction: async (req, res) => {

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() })
            return
        }
        const data = matchedData(req)

        let updates = {}
        if (data.name) {
            updates.name = data.name
        }
        if (data.email) {
            const emailCheck = await User.findOne({ email: data.email })
            if (emailCheck && emailCheck.email !== data.email) {
                res.json({ error: "Email já existente" })
                return
            }
            updates.email = data.email
        }
        if (data.states) {
            if (mongoose.Types.ObjectId.isValid(data.state)) {
                const statesCheck = await State.findById(data.states)
                if (!statesCheck) {
                    res.json({ error: "O estado não parece válido." })
                    return
                }
                updates.state = data.state
            }
        }

        if(data.passwordHash){
            updates.passwordHash = await bcrypt.hash(data.password, 10)
        }

        const user = await User.findOneAndUpdate({ token: data.token }, { $set: updates })

        res.json({ Ok: "Dados atualizados com sucesso." })
    }
}