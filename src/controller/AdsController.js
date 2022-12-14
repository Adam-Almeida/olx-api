const { v4: uuidv4 } = require('uuid');
const jimp = require('jimp')
const { default: mongoose } = require('mongoose');

const Ad = require("../models/Ad")
const Category = require("../models/Category")
const User = require("../models/User");
const State = require('../models/State');

const addImage = async (buffer) => {
    let newName = `${uuidv4()}.jpg`
    let tmpImg = await jimp.read(buffer)
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`)
    return newName
}

module.exports = {
    getCategories: async (req, res) => {
        const categoryAll = await Category.find()

        let categories = []

        for (let i in categoryAll) {
            categories.push({
                ...categoryAll[i]._doc,
                img: `${process.env.BASE}/assets/images/${categoryAll[i].slug}.png`
            })
        }

        res.json({ categories })
    },

    addAction: async (req, res) => {
        let { title, price, priceNegotiable, description, category, token } = req.body
        const user = await User.findOne({ token }).exec()

        if (!title || !category) {
            res.json({ error: "Título e categoria são obrigatórios" })
            return
        }

        if(!mongoose.Types.ObjectId.isValid(category)){
            res.json({error: "Categoria inexistente"})
            return
        }

        const categoryExists = await Category.findById(category)
        if(!categoryExists){
            res.json({error: "Categoria inexistente"})
            return
        }

        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '')
            price = parseFloat(price)
        } else {
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

        if (req.files && req.files.img) {
            if (req.files.img.length == undefined) {
                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data)
                    newAdd.images.push({
                        url,
                        default: false
                    })
                }
            } else {
                for (let i = 0; i < req.files.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data)
                        newAdd.images.push({
                            url,
                            default: false
                        })
                    }
                }
            }
        }

        if (newAdd.images.length > 0) {
            newAdd.images[0].default = true
        }

        const info = await newAdd.save();
        res.json({ info })

    },
    getList: async (req, res) => {
        let { sort = 'asc', offset = 0, limit = 8, q, category, state } = req.query
        let filters = { stattus: true }

        if (q) {
            filters.title = { '$regex': q, '$options': 'i' }
        }

        if (category) {
            const c = await Category.findOne({ slug: category }).exec()
            if (c) {
                filters.category = c._id.toString()
            }
        }

        if (state) {
            const s = await State.findOne({ name: state.toUpperCase() }).exec()
            if (s) {
                filters.state = s._id.toString()
            }
        }

        const adsTotal = await Ad.find(filters).exec()
        const total = adsTotal.length ?? 0

        const all = await Ad.find(filters)
            .sort({ dateCreated: (sort == 'desc' ? -1 : 1) })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .exec()

        let ads = []
        for (let i in all) {

            let image
            let defaultImg = all[i].images.find(e => e.default);
            if (defaultImg) {
                image = `${process.env.BASE}/media/${defaultImg.url}`
            } else {
                image = `${process.env.BASE}/media/default.jpg`
            }

            ads.push({
                id: all[i]._id,
                title: all[i].title,
                price: all[i].price,
                priceNegotiable: all[i].priceNegotiable,
                image,
                description: all[i].description,
                views: all[i].views,
            })

        }

        res.json({ ads, total })

    },
    getItem: async (req, res) => {
        let { id, other = null } = req.query
        if (!id || id.length < 12) {
            res.json({ error: 'Produto não identificado' })
            return
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.json({ error: 'Id não identificado' })
            return
        }

        const ad = await Ad.findById(id)
        if (!ad) {
            res.json({ error: 'Produto inexistente' })
            return
        }

        ad.views++
        await ad.save()

        let images = []
        for (let i in ad.images) {
            images.push(`${process.env.BASE}/media/${ad.images[i].url}`)
        }

        const category = await Category.findById(ad.category).exec()
        const userInfo = await User.findById(ad.idUser).exec()
        const state = await State.findById(ad.state).exec()

        let others = []
        if (other) {
            const otherData = await Ad.find().exec()
            for (let i in otherData) {
                if (otherData[i]._id.toString() != ad._id.toString()) {

                    let image = `${process.env.BASE}/media/default.jpg`

                    let defaultImg = otherData[i].images.find(e => e.default)
                    if (defaultImg) {
                        image = `${process.env.BASE}/media/${defaultImg.url}`
                    }

                    others.push({
                        id: otherData[i]._id,
                        title: otherData[i].title,
                        price: otherData[i].price,
                        priceNegotiable: otherData[i].priceNegotiable,
                        description: otherData[i].description,
                        image
                    })
                }
            }
        }

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category: category.name,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email
            },
            state: state.name,
            others
        })

    },

    editAction: async (req, res) => {
        let { id } = req.params
        let { title, price, priceNegotiable, description, status, category, images, token } = req.body

        if (!mongoose.Types.ObjectId.isValid(id)) {
            res.json({ error: 'Id não identificado' })
            return
        }

        const ad = await Ad.findById(id).exec()
        if (!ad) {
            res.json({ error: 'Anuncio inexistente' })
            return
        }

        const user = await User.findOne({ token }).exec()
        if (user._id.toString() !== ad.idUser) {
            res.json({ error: 'O anuncio não pertence ao seu usuário' })
            return
        }

        let updates = {}

        if (title) {
            updates.title = title
        }
        if (price) {
            price = price.replace('.', '').replace(',', '.').replace('R$ ', '')
            price = parseFloat(price)
            updates.price = price
        }
        if (priceNegotiable) {
            updates.priceNegotiable = priceNegotiable
        }
        if (description) {
            updates.description = description
        }
        if (status) {
            updates.status = status
        }
        if (category) {
            const cat = await Category.findOne({ slug: category }).exec()
            if (!cat) {
                res.json({ error: 'Categoria inexistente' })
                return
            }
            updates.category = status._id.toString()
        }

        if (images) {
            updates.images = images
        }

        await Ad.findByIdAndUpdate(id, { $set: updates })

        if (req.files && req.files.img) {
            const adI = await Ad.findById(id)

            if (req.files.img.length == undefined) {
                if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)) {
                    let url = await addImage(req.files.img.data)
                    adI.images.push({
                        url,
                        default: false
                    })
                }
            } else {
                for (let i = 0; i < req.files.length; i++) {
                    if (['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)) {
                        let url = await addImage(req.files.img[i].data)
                        adI.images.push({
                            url,
                            default: false
                        })
                    }
                }
            }
            adI.images = [...adI.images]
            await adI.save()
        }

        res.json({ ok: 'Anuncio atualizado com sucesso.' })

    },

}