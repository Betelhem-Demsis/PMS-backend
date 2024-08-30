const mongoose = require("mongoose");
const dotenv = require("dotenv");
const reminder = require("./utils/reminder");
const moment = require("moment");
const Appointment = require("./Models/appointmentModel"); 

dotenv.config({ path: "./.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

async function rescheduleReminders() {
  console.log("Rescheduling reminders...");
  const upcomingAppointments = await Appointment.find({
    appointmentDate: { $gte: new Date() },
    status: "Scheduled",
  });

  for (let appointment of upcomingAppointments) {
    const reminderTime = moment(appointment.appointmentDate)
      .subtract(1, "days")
      .toDate();
    if (reminderTime > new Date()) {
      await reminder.add(
        { appointmentId: appointment._id },
        {
          jobId: `reminder-${appointment._id}`,
          delay: Math.max(0, reminderTime.getTime() - Date.now()),
          attempts: 3,
        }
      );
    }
  }
  console.log("Reminders rescheduled");
}

mongoose
  .connect(DB)
  .then(() => console.log("Database connection successful"))
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, async () => {
      console.log(`Server running on port ${port}`);
      await rescheduleReminders();
    });
  })
  .catch((err) => console.error("Database connection error:", err));

