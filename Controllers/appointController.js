const catchAsync=require("../utils/catchasync");
const Appointment=require("../Models/appointmentModel")
const Doctor=require("../Models/doctorModel");
const Patient = require("../Models/patientModel");
const Feature=require("../utils/features")

exports.getAllAppointments = catchAsync(async (req, res, next) => {
    let filter = {};

    if (req.query.status && req.query.status !== "all") {
        filter.status = req.query.status;
    }

    const features = new Feature(Appointment.find(filter), req.query)
        .filter()
        .sort()
        .search()
        .limit()
        .paginate();

    const appointments = await features.query;

    res.status(200).json({
        status: "success",
        results: appointments.length,
        data: {
            appointments
        }
    });
});


exports.getAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findById(req.params.id); 
    if (!appointment) {
        return next(new AppError('No appointment found with that ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            appointment
        }
    });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }); 
    if (!appointment) {
        return next(new AppError('No appointment found with that ID', 404));
    }
    res.status(200).json({
        status: "success",
        data: {
            appointment
        }
    });
});


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


exports.deleteAppointment=catchAsync(async(req,res)=>{
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status:"success",
        data:null
    })
})