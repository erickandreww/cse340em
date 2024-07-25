const express = require("express")
const errRoute = new express.Router()
const errController = require("../controllers/errorController")

errRoute.get("/500", errController.buildServerError)

module.exports = errRoute;