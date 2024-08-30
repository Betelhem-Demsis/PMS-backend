const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  firstName: { 
    type: String,
     required: [true, "First name is required"],
     },
  lastName: { 
    type: String,
     required: [true, "Last name is required"] },
  dateOfBirth: { 
    type: Date, 
    required: [true , "Date of Birth is required"]
  },
  gender: { 
    type: String,
     enum: ["Male", "Female"], 
     required: [true, "Gender is required"]
     },
  email: { 
      type: String
     },
  contactInfo: {
    phone: { 
      type: String, 
      required: [true, "Phone number is required"]
     },
    address: { 
      type: String
     },
  },
  medicalHistory: [
    {
      condition: { 
        type: String 
      },
      diagnosisDate: { 
        type: Date
       },
      treatment: {
         type: String
         },
    },
  ],
  associatedDoctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Doctor"
   },
  currentMedications: [{ type: String }],
  allergies: [{ type: String }],
  emergencyContact: {
    name: { 
      type: String, 
      required: true
     },
    relationship: { 
      type: String,
       required: true
       },
    phone: { 
      type: String, 
      required: true 
    },
  },
  currentAppointments: [{
     type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment" 
    }],
  createdAt: {
     type: Date, 
     default: Date.now
    },
  updatedAt: {
     type: Date, 
     default: Date.now 
    },
});

const Patient = mongoose.model("Patient", patientSchema);
module.exports = Patient;
