const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

reviewCont.addReview = async function (req, res) {
    const { review_text } = req.body
    const inv_id = parseInt(req.body.inv_id)
    const account_id = res.locals.accountData.account_id
    const reviewResult = await reviewModel.registerReview(review_text, inv_id, account_id)
    if (reviewResult) {
      req.flash("notice", `The review was successfull.`)
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", `Sorry, the review failed.`)
      res.redirect(`/inv/detail/${inv_id}`)
    }
}

reviewCont.buildEditReview = async (req, res, next) => {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()

    const itemData = await reviewModel.getReviewsByreviewId(review_id)
    const vehicle = await invModel.getVehicleByInventoryId(itemData.inv_id)

    const review_date = await utilities.formatDate(itemData.review_date)

    const itemName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`
    res.render("./review/edit-review", {
      title: "Edit " + itemName,
      nav,
      errors: null,
      review_id: itemData.review_id,
      review_text: itemData.review_text,
      review_date,
    })
}

reviewCont.updateReview = async function (req, res) {
    let nav = await utilities.getNav();
    const { review_id, review_text, review_date, title } = req.body
    const updateResult = await reviewModel.updateReview(review_id, review_text)
    if (updateResult) {
        req.flash("notice", `The Review was successfully updated.`)
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the insert failed.")
        res.status(501).render("./review/edit-review", {
        title,
        nav,
        errors: null,
        review_id,
        review_text,
        review_date, 
        })
    }
}

reviewCont.buildDeleteReview = async (req, res, next) => {
    const review_id = parseInt(req.params.review_id)
    let nav = await utilities.getNav()

    const itemData = await reviewModel.getReviewsByreviewId(review_id)
    const vehicle = await invModel.getVehicleByInventoryId(itemData.inv_id)

    const review_date = await utilities.formatDate(itemData.review_date)

    const itemName = `${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}`

    res.render("./review/delete-review", {
        title: "Delete " + itemName,
        nav,
        errors: null,
        review_id: itemData.review_id,
        review_text: itemData.review_text,
        review_date,
    })
}
  
reviewCont.deleteReview = async function (req, res) {
    const review_id = parseInt(req.body.review_id)

    const deleteResult = await reviewModel.deleteReview(review_id)

    if (deleteResult) {
        req.flash("notice", "The delection was successfull.")
        res.redirect("/account/")
    } else {
        req.flash("notice", "Sorry, the deletion failed.")
        res.redirect("/account/")
    }
}


module.exports = reviewCont