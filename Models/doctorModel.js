const mongoose=require("mongoose")

const doctorSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    specialization: { type: String, required: true },
    email: { type: String, required: true },
    contactInfo: {
        phone: { type: String, required: true },
        address:{ type: String }
    },
    qualifications: [{ type: String }],
    yearsOfExperience: { type: Number },
    patients: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
         }],
    currentAppointments: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Appointment"
     }],
    createdAt: {
         type: Date,
          default:
          Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
