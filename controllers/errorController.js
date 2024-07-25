const utilities = require("../utilities/")

const errCont = {}

/* ***************************
 *  Build 505 error view
 * ************************** */
errCont.buildServerError = async function (req, res, next) {
  next({status: 500, title: "Server Error"})
}

module.exports = errCont;