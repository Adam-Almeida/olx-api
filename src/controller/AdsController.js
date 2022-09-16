const { v4: uuidv4 } = require('uuid');
const jimp = require('jimp')

const Ad = require("../models/Ad")
const Category = require("../models/Category")
const User = require("../models/User")

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

        if(req.files && req.files.img){
            if(req.files.img.length == undefined){
                if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img.mimetype)){
                    let url = await addImage(req.files.img.data)
                    newAdd.images.push({
                        url,
                        default: false
                    })
                }
            }else{
                for(let i = 0; i < req.files.length; i++){
                    if(['image/jpeg', 'image/jpg', 'image/png'].includes(req.files.img[i].mimetype)){
                        let url = await addImage(req.files.img[i].data)
                        newAdd.images.push({
                            url,
                            default: false
                        })
                    }
                }
            }
        }

        if(newAdd.images.length > 0){
            newAdd.images[0].default = true
        }

        const info = await newAdd.save();
        res.json({info})

    },
    getList: async (req, res) => {

    },
    getItem: async (req, res) => {

    },

    editAction: async (req, res) => {

    },

}