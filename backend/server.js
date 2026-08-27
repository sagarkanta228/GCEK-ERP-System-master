const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const dns = require("dns");

dotenv.config();
// Use public DNS servers so SRV lookups work reliably even if local DNS blocks them
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("./config/passport");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://gcek-erp-system.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_session_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // REQUIRED on HTTPS (Render + Vercel)
      sameSite: "none"     // REQUIRED for cross-origin
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose
  .connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    family: 4 // Use IPv4, skip trying IPv6
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/sections", require("./routes/sectionRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/class-sessions", require("./routes/classSessionRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/result", require("./routes/resultRoutes"));
app.use("/api/feedback", require("./routes/feedbackRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/semester-results", require("./routes/semesterResultRoutes"));

// Serve uploaded documents natively via express
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});