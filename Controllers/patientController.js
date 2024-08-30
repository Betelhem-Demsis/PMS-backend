const mongoose = require("mongoose");
const catchAsync = require("../utils/catchasync");
const Patient = require("../Models/patientModel"); 
const Doctor = require("../Models/doctorModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/features");

const ObjectId = mongoose.Types.ObjectId;

exports.getAllPatients = catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.query.id) {
        if (ObjectId.isValid(req.query.id)) {
            filter._id = req.query.id;
        } else {
            return next(new AppError('Invalid ID format', 400));
        }
    }

    const features = new APIFeatures(Patient.find(filter), req.query)
        .filter()
        .sort()
        .search() 
        .limit()
        .paginate();

    const patients = await features.query;

    res.status(200).json({
        status: "success",
        results: patients.length,
        data: {
            patients
        }
    });
});


exports.getPatient = catchAsync(async (req, res, next) => {
    let patient;

    if (ObjectId.isValid(req.params.id)) {
        patient = await Patient.findById(req.params.id);
    } else {
        patient = await Patient.findOne({ 
            $or: [
                { firstName: req.params.id },
                { lastName: req.params.id }
            ]
        });
    }

    if (!patient) {
        return next(new AppError('No patient found with that ID or name', 404));
    }

    res.status(200).json({
        status: "success",
        data: {
            patient
        }
    });
});

exports.createPatient = catchAsync(async (req, res, next) => {
    const newPatient = await Patient.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            patient: newPatient
        }
    });

    if (req.body.associatedDoctor) {
        await Doctor.findByIdAndUpdate(req.body.associatedDoctor, {
            $push: { patients: newPatient._id }
        });
    }
});

exports.updatePatient = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!patient) {
        return next(new AppError('No patient found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            patient
        }
    });
});

exports.deletePatient = catchAsync(async (req, res, next) => {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
        return next(new AppError('No patient found with that ID', 404));
    }

    res.status(204).json({
        status: "success",
        data: null
    });
});
