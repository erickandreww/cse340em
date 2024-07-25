const express = require("express")
const utilities = require("../utilities/")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManage))

// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData, 
    utilities.handleErrors(accountController.accountLogin)
)

router.get("/update/:account_id", utilities.handleErrors(accountController.buildEditAccount))
router.post(
    "/updateBasic", 
    regValidate.updateBasicRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.accountBasicUpdate))

router.post(
    "/updatePassword", 
    regValidate.updatePasswordRules(),
    regValidate.checkUpdateData,
    utilities.handleErrors(accountController.accountPasswordUpdate))

router.get("/logout", utilities.checkLogin, utilities.logout)


module.exports = router;