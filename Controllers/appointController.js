const catchAsync=require("../utils/catchasync");
const Appointment=require("../Models/appointmentModel")
const Doctor=require("../Models/doctorModel");
const Patient = require("../Models/patientModel");
const Feature=require("../utils/features")

exports.getAllAppointments=catchAsync(async(req,res,next)=>{

    let filter={};
    
    if(req.params.status && req.params.status!=="all"){
        filter={status :req.params.status} 
    }

    const features=new Feature(Appointment.find(),req.query).filter().sort().search().limit().paginate()

    const appointments=await features.query();
    
    res.status(200).json({
        status:"success",
        results:appointments.length,
        data:{
            appointments
        }
    })
})

exports.getAppointment=catchAsync(async(req,res,next)=>{
    const Appointment=await Appointment.findById(req.params.id);
    res.status(200).json({
        status:"success",
        data:{
            Appointment
        }
    })
})

exports.createAppointment=catchAsync(async(req,res)=>{
    const newAppointment=await Appointment.create(req.body);
    
    if(req.body.patient){
        const patient=await Patient.findById(req.body.patient);
        patient.currentAppointments.push(newAppointment._id);
        await patient.save();
    }
    if(req.body.doctor){
        const doctor=await Doctor.findById(req.body.doctor);
        doctor.currentAppointments.push(newAppointment._id);
        await doctor.save();
    }
    res.status(200).json({
        status:"success",
        data:{
            newAppointment
        }
    })
})

exports.updateAppointment=catchAsync(async(req,res)=>{
    const Appointment=await findByIdAndUpdate(req.params.id,req.body);
    res.status(200).json({
        status:"success",
        data:{
            Appointment
        }
    })
})

exports.deleteAppointment=catchAsync(async(req,res)=>{
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:"success",
        data:null
    })
})