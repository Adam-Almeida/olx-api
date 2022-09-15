const Category = require("../models/Category")

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

    },
    getList: async (req, res) => {

    },
    getItem: async (req, res) => {

    },

    editAction: async (req, res) => {

    },

}