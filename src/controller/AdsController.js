const Ad = require("../models/Ad")
const Category = require("../models/Category")
const User = require("../models/User")

module.exports = {
    getCategories: async (req, res) => {
        const categoryAll = await Category.find()

        let categories = []

        for(let i in categoryAll) {
            categories.push({
                ...categoryAll[i]._doc,
                img: `${process.env.BASE}/assets/images/${categoryAll[i].slug}.png`
            })
        }

        res.json({categories})
    },

    addAction: async (req, res) => {
        let { title, price, priceNegotiable, description, category, token} = req.body
        const user = await User.findOne({token}).exec()

        if(!title || !category){
            res.json({error: "Título e categoria são obrigatórios"})
            return
        }

        if(price){
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '')
            price = parseFloat(price)
        }else{
            price = 0
        }

        const newAdd = new Ad()
        newAdd.status = true
        newAdd.idUser = user._id
        newAdd.state = user.state
        newAdd.dateCreated = new Date()
        newAdd.title = title
        newAdd.category = category
        newAdd.price = price
        newAdd.priceNegotiable = (priceNegotiable === 'true' || priceNegotiable === 'on' ? true : false)
        newAdd.description = description
        newAdd.views = 0

    },
    getList: async (req, res) => {

    },
    getItem: async (req, res) => {

    },

    editAction: async (req, res) => {

    },

}