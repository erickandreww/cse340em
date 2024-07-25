const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const reviewModel = require("../models/review-model")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}
/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.inv_id
  const data = await invModel.getVehicleByInventoryId(inv_id)
  const vehicleInfo = await utilities.buildVehicleInfo(data)

  const reviews = await reviewModel.getReviewsByInvId(inv_id)
  const reviewInfo = await utilities.buildInvReviewInfo(reviews)

  let nav = await utilities.getNav()
  const vehicleName = `${data.inv_year} ${data.inv_make} ${data.inv_model}`
  // pass this for utilities index
    res.render("./inventory/vehicles", {
      title: vehicleName, 
      nav, 
      vehicleInfo,
      reviewInfo,
      inv_id,
    })
  }
/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManage = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Vehicle Management",
    nav,
    errors: null,
    classificationSelect,
  })
}

invCont.buildNewClass = async function (req, res) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
  })
}

invCont.buildNewVehicle = async function (req, res) {
  let nav = await utilities.getNav()
  const classList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classList,
    errors: null,
  })
}

invCont.registerClass = async function (req, res) {
  let nav = await utilities.getNav();
  const {classification_name} = req.body;
  const classificationSelect = await utilities.buildClassificationList()
  const classResult = await invModel.registerClass(classification_name)
  
  if (classResult) {
    req.flash(
      "notice",
      `The ${classification_name} classification was successfull added.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
    })
  } else {
    req.flash("notice", "Sorry, the classification register failed.")
    res.status(501).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect, 
    })
  }
}

invCont.registerNewVehicle = async function (req, res) {
  let nav = await utilities.getNav();
  const {inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id} = req.body;
  
  const vehicleResult = await invModel.registerNewVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, 
    inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
  
  const classificationSelect = await utilities.buildClassificationList()
  
  if (vehicleResult) {
    req.flash(
      "notice",
      `The vehicle "${inv_make} ${inv_model}" was successfull added.`
    )
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect, 
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInv = async (req, res, next) => {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleByInventoryId(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res) {
  let nav = await utilities.getNav();
  const {
    inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_year, inv_miles, inv_color, classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail,
    inv_price, inv_year, inv_miles, inv_color, classification_id
  )
if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
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
    classification_id
    })
  }
}

invCont.buildDeleteInv = async (req, res, next) => {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleByInventoryId(inv_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price,
  })
}

invCont.deleteItem = async function (req, res) {
  const inv_id = parseInt(req.body.inv_id)
 
  const deleteResult = await invModel.deleteInventoryItem(inv_id)

if (deleteResult) {
    req.flash("notice", `The delection was successfull.`)
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the deletion failed.")
    res.redirect("inv/")
  }
}

module.exports = invCont