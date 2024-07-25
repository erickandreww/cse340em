const bcrypt = require("bcryptjs")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
  req.flash("loginMessage", "Complete all fields to log in.")
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

async function buildAccountManage(req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  const myReviews = await utilities.buildAccountReviewInfo(account_id)
  res.render("account/accountManagement", {
    title: "Account Management",
    nav,
    errors: null,
    myReviews,
  })
}

async function buildEditAccount(req, res) {
  const account_id = req.params.account_id
  const data = await accountModel.getAccountById(account_id)
  let nav = await utilities.getNav()
  res.render("account/edit-account", {
    title: "Edit Account",
    nav,
    account_firstname: data.account_firstname,
    account_lastname: data.account_lastname,
    account_email: data.account_email,
    account_id: data.account_id,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )
  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the vehicle registration failed.")
    res.status(501).render("account/login", {
      title: "Login",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        } else {
          res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
        }
      return res.redirect("/account/")
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Process account update
 * ************************************ */
async function accountBasicUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.accountBasicUpdate(
    account_id, account_firstname, account_lastname, account_email
  )
if (updateResult) {
    req.flash("notice", `Congratulations, your information has been updated.`)
    res.redirect("/account/")
  } else {
    req.flash("notice", "Sorry, the information update failed.")
    res.status(501).render("account/edit-account", {
    title: "Edit Account",
    nav,
    errors: null,
    account_firstname,
    account_lastname,
    account_email,
    account_id,
    })
  }
}

async function accountPasswordUpdate(req, res) {
  let nav = await utilities.getNav();
  const { account_id, account_password } = req.body

  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const updateResult = await accountModel.accountPasswordUpdate(
    account_id, hashedPassword
  )

  if (updateResult) {
      req.flash("notice", `Congratulations, your password has been updated.`)
      res.redirect("/inv/")
    } else {
      const data = await accountModel.getAccountById(account_id)
      req.flash("notice", "Sorry, the password update failed.")
      res.status(501).render("account/edit-account", {
      title: "Edit Account",
      nav,
      errors: null,
      account_firstname: data.account_firstname,
      account_lastname: data.account_lastname,
      account_email: data.account_email,
      account_id: data.account_id,
      })
    }
}


module.exports = { buildLogin, buildRegister, buildAccountManage, buildEditAccount, registerAccount, accountLogin, accountBasicUpdate, accountPasswordUpdate }