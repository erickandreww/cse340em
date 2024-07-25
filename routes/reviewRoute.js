// Needed Resources 
const express = require("express")
const utilities = require("../utilities/")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const reviewValidate = require('../utilities/review-validation')

router.post("/addReview", utilities.handleErrors(reviewController.addReview))


router.get("/editReview/:review_id", utilities.handleErrors(reviewController.buildEditReview))
router.post(
    "/updateReview", 
    reviewValidate.reviewRules(),
    reviewValidate.checkReviewEdit,
    utilities.handleErrors(reviewController.updateReview)
);

router.get("/deleteReview/:review_id", utilities.handleErrors(reviewController.buildDeleteReview))
router.post("/eraseReview", utilities.handleErrors(reviewController.deleteReview))


module.exports = router;