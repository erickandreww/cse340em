const { cookie } = require("express-validator")
const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const reviewModel = require("../models/review-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the vehicles view HTML
* ************************************ */
Util.buildVehicleInfo = async function(data) {
  let info
  if(data) {
    info = '<div class="vehicle-main">'
    info += '<div class="vehicle-div-img"><img id="vehicle-img" src="' + data.inv_image
        +'" alt="Image of '+ data.inv_make + ' ' + data.inv_model 
        +' on CSE Motors" /></a></div>'
    info += '<div class="vehicle-details">'
    info += '<h3 id="vehicle-name">' + data.inv_make + ' ' + data.inv_model + ' Details</h3>'
    info += '<p id="vehicle-price"><strong>Price</strong>: $' + data.inv_price + '</p>'
    info += '<p id="vehicle-description"><strong>Description</strong>: ' + data.inv_description + '</p>'
    info += '<p id="vehicle-color"><strong>Color</strong>: ' + data.inv_color + '</p>'
    info += '<p id="vehicle-miles"><strong>Miles</strong>: ' + data.inv_miles + '</p>'
    info += '</div>'
    info += '</div>'
  } else {
    info += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return info
}

Util.buildInvReviewInfo = async function(reviews) {
  let view = '<ul id="costumer-reviews">';
  for (let index = 0; index < reviews.length; index++) {
    const account = await accountModel.getAccountById(reviews[index].account_id)
    const date = await Util.formatDate(reviews[index].review_date)
    view += '<li>';
    view += '<p><b>' + account.account_firstname + "</b> wrote on " + date + '</p>';
    view += '<hr><p>' + reviews[index].review_text + '</p>';
    view += '</li>';
  }
  view += '</ul>';
  return view
}

Util.buildAccountReviewInfo = async function(account_id) {
  let data = await reviewModel.getReviewsByAccountId(account_id)
  let reviewsList = '<ol id="reviewList">'
  for (let index = 0; index < data.length; index++) {
    const vehicle = await invModel.getVehicleByInventoryId(data[index].inv_id)
    const date = await Util.formatDate(data[index].review_date)

    reviewsList += '<li name="review_text">'
    reviewsList += '<p> Reviewed the <b>' + vehicle.inv_year + ' '
    reviewsList += vehicle.inv_make + ' ' + vehicle.inv_model + '</b> on ' + date + '</p>'
    reviewsList += `<a id="first-a" href='/review/editReview/${data[index].review_id}' title='Click to edit'>| Edit </a>`
    reviewsList += `<a href='/review/deleteReview/${data[index].review_id}' title='Click to delete'>| Delete</a>`
    reviewsList += "</li>"
  }
  reviewsList += "</ol>"
  return reviewsList
}

Util.formatDate = async function(dateString) {
  const date = new Date(dateString);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/* **************************************
* Build the Classification List view HTML
* ************************************ */
 Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Check Account Type
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin) {
    if (res.locals.accountData.account_type !== 'Client') {
      next()
    } else {
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    }
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 *  Logout
 * ************************************ */
Util.logout = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      res.clearCookie("jwt"),
      res.redirect("/")
    )
  }
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util