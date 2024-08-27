const catchAsync = require("../utils/catchasync");
const Patient = require("../Models/patientModel"); 
const Doctor = require("../Models/doctorModel");
const AppError = require("../utils/appError");

exports.getAllPatients = catchAsync(async (req, res,next) => {
    const patient = await Patient.find();  
    res.status(200).json({
        status: "success",
        results: patient.length,
        data: {
            patient
        }
    });
});

exports.getPatient = catchAsync(async (req, res,next) => {
    const patient = await Patient.findById(req.params.id);
    
    res.status(200).json({
        status: "success",
        data: {
            patient
        }
    });
});

exports.createPatient=catchAsync(async (req, res,next) => {
    const newpatient = await Patient.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            data: newpatient
        }
    });

    if (req.body.associatedDoctor) {
        await Doctor.findByIdAndUpdate(req.body.associatedDoctor, {
            $push: { patients:[ newpatient._id ]}
        });
    }
});


exports.updatePatient = catchAsync(async (req, res,next) => {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if(!patient){
        return next(new AppError('No patient found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: patient 
        }
    });
});

exports.deletePatient = catchAsync(async (req, res,next) => {
    await Patient.findByIdAndDelete(req.params.id);  

    res.status(204).json({
        status: "success",
        data: null   
    });
});
