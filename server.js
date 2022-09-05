require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')

const server = express()

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({
    extended: true
}))
server.use(fileUpload())
server.use(express.static(__dirname + '/public'))

server.get('/ping', (req, res) => {
    res.json({ pong: true })
})

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})