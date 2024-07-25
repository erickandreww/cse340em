const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
    return [
        // firstname is required and must be string
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .matches(/^[^' '\W]+$/)
            .withMessage("A valid Classification name is required.")
            .custom(async (classification_name) => {
                const classExists = await invModel.checkExistingClassification(classification_name)
                if (classExists) {
                    throw new Error("This Classification already exists.")
                }
            }),
      ]
}

validate.newVehicleRules = () => {
    return [  
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid Make."),

        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 3 })
            .withMessage("Please provide a valid Model."),
        
        body("inv_year")
            .trim()
            .isInt()
            .notEmpty()
            .isLength({ min: 4 })
            .withMessage("Please provide a valid Year."),

        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Description."),

        body("inv_image")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Image path."),
        
        body("inv_thumbnail")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Thumbnail path."),
        
        body("inv_price")
            .trim()
            .isFloat()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Price."),

        body("inv_miles")
            .trim()
            .isFloat()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Miles."),

        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Color."),
        
        body("classification_id")
            .trim()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a valid Classification."),
    ]
}

validate.checkClassification = async (req, res, next) => {
    const {classification_name} = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("inventory/add-classification", {
        errors,
        title: "Add New Classification",
        nav,
        classification_name,
      })
      return
    }
    next()
}

validate.checkNewVehiclesInfo = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classList = await utilities.buildClassificationList()
        res.render("inventory/add-inventory", {
          errors,
          title: "Add New Vehicle",
          nav,
          classList,
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price, 
          inv_miles, 
          inv_color, 
          classification_id,
        })
        return
      }
      next()
}

validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        res.render("inventory/edit-inventory", {
          errors,
          title: "Edit " + itemName,
          nav,
          classificationSelect: classificationSelect,
          inv_id,
          inv_make, 
          inv_model, 
          inv_year, 
          inv_description, 
          inv_image, 
          inv_thumbnail, 
          inv_price, 
          inv_miles, 
          inv_color, 
          classification_id,
        })
        return
      }
      next()
}


module.exports = validate