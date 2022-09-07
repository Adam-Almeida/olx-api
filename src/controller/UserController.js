const State = require('../models/State')
const User = require('../models/User')
const Category = require('../models/Category')
const Ad = require('../models/Ad')

module.exports = {
    getStates: async (req, res) => {
        const states = await State.find()
        res.json({ states })
    },

    info: async (req, res) => {
        let { token } = req.query;
        const user = await User.findOne({token})
        const state = await State.findById(user.state)
        const ads = await Ad.find({idUser: user._id.toString()})

        let adsList = []
        for(let i in ads){
            const category = await Category.findById(ads[i].category)
            adsList.push({
                ...ads[i], category.slug
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

    }
}