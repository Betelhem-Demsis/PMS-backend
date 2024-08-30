const Bull = require("bull");
const Redis = require("ioredis");
const moment = require("moment");
const Appointment = require("../Models/appointmentModel");
const sendEmail = require("./mailer");

const redis = new Redis();

const reminder = new Bull("email-reminders", {
  redis: {
    port: 6379,
    host: "127.0.0.1",
    maxRetriesPerRequest: null,
  },
});

reminder.process(async (job) => {
  const { appointmentId } = job.data;

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("doctor");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const message = `Dear ${
      appointment.patient.firstName
    },\n\nThis is a reminder for your appointment with Dr. ${
      appointment.doctor.firstName
    } scheduled on ${moment(appointment.appointmentDate).format(
      "MMMM Do YYYY, h:mm a"
    )}.\n\nReason: ${appointment.reason}\n\nThank you.`;

    await sendEmail({
      email: appointment.patient.email,
      subject: "Appointment Reminder",
      message,
    });

    console.log(`Reminder sent for appointment ${appointmentId}`);
  } catch (error) {
    console.error(
      `Error processing reminder for appointment ${appointmentId}:`,
      error
    );
    throw error;
  }
});

module.exports = reminder;
