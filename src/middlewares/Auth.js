const User = require('../models/User')

module.exports = {
    private: async (req, res, next) => {
        if (!req.query.token && !req.body.token) {
            res.status("401").json({ notallowed: "Unauthorized" })
            return
        }

        let token = ""
        if (req.query.token) {
            token = req.query.token
        }
        if (req.body.token) {
            token = req.body.token
        }
        if (token == "") {
            res.status("401").json({ notallowed: "Unauthorized" })
            return
        }

        const user = await User.findOne({ token })

        if (!user) {
            res.status("401").json({ notallowed: "Unauthorized" })
            return
        }
        next()
    }
}