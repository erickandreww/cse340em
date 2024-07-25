const utilities = require(".")
const reviewModel = require("../models/review-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.reviewRules = () => {
    return [
        // firstname is required and must be string
        body("review_text")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Review."),
      ]
}

validate.checkReviewEdit = async (req, res, next) => {
    const { review_id, review_text, review_date, title } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("./review/edit-review", {
        errors,
        title,
        nav,
        review_id,
        review_text,
        review_date, 
      })
      return
    }
    next()
}

module.exports = validate