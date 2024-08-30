const mongoose = require("mongoose");
const moment = require("moment");
const reminder = require("../utils/reminder");


const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  appointmentDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

appointmentSchema.pre("save", async function (next) {
  const appointment = this;

  if (appointment.isModified("appointmentDate") || appointment.isNew) {
    await reminder.removeJobs(`reminder-${appointment._id}`);

    const reminderTime = moment(appointment.appointmentDate)
      .subtract(1, "days")
      .toDate();

    await reminder.add(
      { appointmentId: appointment._id },
      {
        jobId: `reminder-${appointment._id}`,
        delay: Math.max(0, reminderTime.getTime() - Date.now()),
        attempts: 3,
      }
    );
  }

  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
