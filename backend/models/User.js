const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
    },

    role: {
      type: String,
      enum: [
        "Student",
        "Faculty",
        "HOD",
        "Dean",
        "Registrar",
        "Principal",
        "Admin",
      ],
      default: "Student",
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },

    otp: {
      type: String,
    },

    otpExpires: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Faculty specific fields
    assignedRole: {
      type: String,
      default: "None",
    },
    teachingAssignments: [
      {
        subject: String,
        semester: String,
        branch: String,
      }
    ],
    designation: {
      type: String,
    },
    department: {
      type: String,
    },
    semester: {
      type: String,
    },
    qualification: {
      type: String,
    },
    portalAccess: {
      type: Boolean,
      default: true,
    },
    // Editable profile fields
    phone: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    // Registration Number for students
    regdNo: {
      type: String,
      default: '',
    },
    // Faculty ID for faculty
    facultyId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);