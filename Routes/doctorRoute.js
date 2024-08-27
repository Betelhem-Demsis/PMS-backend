const express=require("express")
const doctorController=require("../Controllers/doctorController");
const router=express.Router();

router
  .route("/")
  .get(doctorController.getAllDoctors)
  .post(doctorController.createDoctor);

router
  .route("/:id")
  .get(doctorController.getDoctor)
  .patch(doctorController.updateDoctor)
  .delete(doctorController.deleteDoctor);

module.exports=router;