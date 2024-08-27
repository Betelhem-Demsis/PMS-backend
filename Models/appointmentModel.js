const mongoose=require("mongoose")


const appointmentSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient',
        required: true
     },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Doctor', 
         required: true
         },
    appointmentDate: { 
        type: Date, 
        required: true
     },
    reason: {
         type: String,
        required: true
     },
    status: { 
        type: String, 
        enum: ['Scheduled', 'Completed', 'Cancelled'],
         default: 'Scheduled' 
        },
    notes: { 
        type: String
     },
    createdAt: { 
        type: Date, default: 
        Date.now },
    updatedAt: { type: Date,
         default: 
         Date.now }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
