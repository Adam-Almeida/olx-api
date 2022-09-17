require('dotenv').config()
const express = require('express')
const swaggerUi = require('swagger-ui-express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const routes = require('./src/routes')
const swaggerFile = require('./swagger.json')

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

server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))
server.use("/", routes)

server.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`)
})