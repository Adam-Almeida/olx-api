const express = require('express')
const router = express.Router()

const AuthController = require('./controller/AuthController')
const UserController = require('./controller/UserController')
const AdsController = require('./controller/AdsController')

const Auth = require('./middlewares/Auth')

router.get('/ping', (req, res) => {
    res.json({ pong: true })
})

router.get('/states', Auth.private, UserController.getStates)

router.post('/user/signin', AuthController.signin)
router.post('/user/signup', AuthController.signup)

router.get('/user/me', Auth.private, UserController.info)
router.put('/user/me', Auth.private, UserController.editAction)

router.get('/categories', AdsController.getCategories)

router.post('/ad/add', Auth.private, AdsController.addAction)
router.get('/ad/list', AdsController.getList)

router.get('/ad/item', AdsController.getItem)
router.post('/ad/:id', Auth.private, AdsController.editAction)

module.exports = router