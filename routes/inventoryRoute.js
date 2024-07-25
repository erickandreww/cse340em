// Needed Resources 
const express = require("express")
const utilities = require("../utilities/")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidate = require('../utilities/inventory-validation')

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

router.get("/detail/:inv_id", utilities.handleErrors(invController.buildByInvId));

router.get("/", utilities.checkAccountType, utilities.handleErrors(invController.buildManage));

router.get("/newclass", utilities.checkAccountType, utilities.handleErrors(invController.buildNewClass));
router.post(
    "/newclass", 
    invValidate.classificationRules(),
    invValidate.checkClassification,
    utilities.handleErrors(invController.registerClass)
);

router.get("/newvehicle", utilities.checkAccountType, utilities.handleErrors(invController.buildNewVehicle));
router.post(
    "/newvehicle", 
    invValidate.newVehicleRules(),
    invValidate.checkNewVehiclesInfo,
    utilities.handleErrors(invController.registerNewVehicle)
);

router.get("/getInventory/:classification_id", utilities.checkAccountType, utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildEditInv))
router.post(
    "/update", 
    invValidate.newVehicleRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

router.get("/delete/:inv_id", utilities.checkAccountType, utilities.handleErrors(invController.buildDeleteInv))
router.post("/delete", utilities.handleErrors(invController.deleteItem))

module.exports = router;