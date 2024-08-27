const express = require("express");
const morgan=require("morgan")
const patientRoute = require("./Routes/PatientRoute");
const doctorRoute = require("./Routes/doctorRoute");
const appointmentRoute = require("./Routes/appointmentRoute");


const app = express();
app.use(express.json());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
  }

app.use("/api/patient", patientRoute);
app.use("/api/doctor", doctorRoute);
app.use("/api/appointment", appointmentRoute);


module.exports= app;