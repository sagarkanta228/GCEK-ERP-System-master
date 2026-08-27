const User = require("../models/User");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const StaffAttendance = require("../models/StaffAttendance");

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ================= HELPERS =================
const adminCreateUser = async ({ fullName, email, role, department, designation, phone, regdNo, facultyId }) => {
  let user = await User.findOne({ email });
  
  if (user) {
    if (role) user.role = role;
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (phone) user.phone = phone;
    if (regdNo) user.regdNo = regdNo;
    if (facultyId) user.facultyId = facultyId;
    await user.save();
    return user;
  }

  const defaultPassword = "Welcome@123";
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  user = new User({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'Faculty',
    department,
    designation,
    phone,
    regdNo,
    facultyId,
    isApproved: true,
  });

  await user.save();
  return user;
};

exports.adminCreateUserHelper = adminCreateUser;

// ================= SIGNUP =================
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password, role, department, semester } = req.body;
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user) {
      user = new User({
        fullName,
        email,
        password: hashedPassword,
        role,
        department,
        semester,
      });
    } else {
      user.password = hashedPassword;
      user.fullName = fullName;
      user.role = role || user.role;
      user.department = department || user.department;
      user.semester = semester || user.semester;
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    user.isVerified = false;

    await user.save();

    await sendEmail({
      email: user.email,
      subject: "GCEK Portal - Verification OTP",
      message: `Your OTP is ${otp}`,
      html: `
        <h2>GCEK ERP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    res.status(200).json({
      message: "OTP sent to your email",
      requireOtp: true,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password, role, department, semester } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your account first" });

    if (user.role !== role)
      return res.status(403).json({ message: "Access tier mismatch" });

    if ((role === 'Faculty' || role === 'HOD') && department) {
      if (user.department && user.department !== department) {
        return res.status(403).json({ message: `Access denied. Registered under ${user.department}, but trying to access ${department}.` });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    if (role === 'Student') {
      if (department) user.department = department;
      if (semester) user.semester = semester;
    }

    await user.save();

    await sendEmail({
      email: user.email,
      subject: "GCEK Portal - Login OTP",
      message: `Your login OTP is ${otp}`,
      html: `
        <h2>GCEK ERP Login</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    res.json({
      message: "OTP sent to your email",
      requireOtp: true,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isLoggedIn = true;
    user.lastLogin = new Date();

    await user.save();

    const staffRoles = ['Principal', 'HOD', 'Faculty', 'Dean', 'Registrar'];
    if (staffRoles.includes(user.role)) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await StaffAttendance.findOne({ 
          userId: user._id, 
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } 
        });
        if (!existing) {
          await new StaffAttendance({
            userId: user._id,
            date: today,
            status: 'Present',
            verificationStatus: 'Verified',
            metadata: { backgroundDetected: 'Login Triggered (Auto-marked)', faceMatched: true }
          }).save();
        }
      } catch (attErr) {
        console.error("Error auto-marking staff attendance:", attErr);
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified successfully",
      token,
      role: user.role,
      id: user._id,
      name: user.fullName,
      email: user.email,
      regdNo: user.regdNo,
      assignedRole: user.assignedRole,
      department: user.department,
      semester: user.semester,
      teachingAssignments: user.teachingAssignments,
      phone: user.phone,
      bio: user.bio,
      profileImage: user.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GOOGLE CALLBACK =================
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    if (user.role === 'Student' && !user.regdNo) {
      try {
        // Use an indexed search instead of regex for speed
        const studentDetail = await Student.findOne({ name: user.fullName });
        if (studentDetail) {
          user.regdNo = studentDetail.regdNo;
          if (!user.department) user.department = studentDetail.branch;
          if (!user.semester) user.semester = studentDetail.semester;
          await user.save();
        }
      } catch (err) {
        console.error("Error auto-linking student:", err);
      }
    }

    const staffRoles = ['Principal', 'HOD', 'Faculty', 'Dean', 'Registrar'];
    if (staffRoles.includes(user.role)) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const exists = await StaffAttendance.exists({ 
          userId: user._id, 
          date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) } 
        });
        if (!exists) {
          await StaffAttendance.create({
            userId: user._id,
            date: today,
            status: 'Present',
            verificationStatus: 'Verified',
            metadata: { backgroundDetected: 'Login Triggered (Auto-marked)', faceMatched: true }
          });
        }
      } catch (attErr) {
        console.error("Error auto-marking staff attendance:", attErr);
      }
    }

    // Only send necessary data in URL, keep it light
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendBaseUrl}/oauth-success`);
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("role", user.role);
    redirectUrl.searchParams.append("id", user._id);
    redirectUrl.searchParams.append("name", user.fullName);
    redirectUrl.searchParams.append("email", user.email);
    if (user.regdNo) redirectUrl.searchParams.append("regdNo", user.regdNo);
    if (user.department) redirectUrl.searchParams.append("department", user.department);
    if (user.semester) redirectUrl.searchParams.append("semester", user.semester);
    if (user.assignedRole) redirectUrl.searchParams.append("assignedRole", user.assignedRole);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Google Callback Error:", error);
    res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`);
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: "GCEK Portal - Password Reset OTP",
      message: `Your password reset OTP is ${otp}`,
      html: `
        <h2>GCEK ERP Password Reset</h2>
        <p>Your OTP to reset password is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    res.json({ message: "OTP sent to your email", requireOtp: true, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= GET PROFILE =================
exports.getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= MULTI-ROLE OTP LOGIN =================

// Helper: case-insensitive name comparison
const namesMatch = (a, b) => {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};

// Step 1: Verify identity details against DB, then send OTP
exports.otpLoginRequest = async (req, res) => {
  try {
    const { type, name, email, regdNo, branch, semester } = req.body;

    if (!type || !name || !email) {
      return res.status(400).json({ message: 'Name and Email are required.' });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    const targetEmail = email.trim().toLowerCase();
    let found = null;

    if (type === 'Student') {
      if (!regdNo) return res.status(400).json({ message: 'Registration number is required for students.' });
      found = await Student.findOne({ regdNo: regdNo.trim() });
      if (!found) return res.status(404).json({ message: 'No student found with this Registration No.' });
      if (!namesMatch(found.name, name)) return res.status(403).json({ message: 'Name does not match our records.' });
      if (branch && found.branch && found.branch.toLowerCase() !== branch.toLowerCase()) {
        return res.status(403).json({ message: `Branch mismatch. Registered under: ${found.branch}` });
      }
      if (semester && found.semester && String(found.semester) !== String(semester)) {
        return res.status(403).json({ message: `Semester mismatch. Registered in semester: ${found.semester}` });
      }
      if (found.email && found.email !== targetEmail) {
        return res.status(403).json({ message: 'Email does not match our records.' });
      }
      if (!found.email) found.email = targetEmail;
      found.otp = otp; found.otpExpires = otpExpires;
      await found.save();
    } else if (type === 'Faculty') {
      found = await User.findOne({ email: targetEmail, role: 'Faculty' });
      if (!found) return res.status(404).json({ message: 'No faculty found with this email.' });
      if (!namesMatch(found.fullName, name)) return res.status(403).json({ message: 'Name does not match our records.' });
      if (branch && found.department && found.department.toLowerCase() !== branch.toLowerCase()) {
        return res.status(403).json({ message: `Branch mismatch. Registered under: ${found.department}` });
      }
      found.otp = otp; found.otpExpires = otpExpires;
      await found.save();
    } else if (type === 'HOD') {
      found = await User.findOne({ email: targetEmail, role: 'HOD' });
      if (!found) return res.status(404).json({ message: 'No HOD found with this email.' });
      if (!namesMatch(found.fullName, name)) return res.status(403).json({ message: 'Name does not match our records.' });
      if (branch && found.department && found.department.toLowerCase() !== branch.toLowerCase()) {
        return res.status(403).json({ message: `Branch mismatch. Registered under: ${found.department}` });
      }
      found.otp = otp; found.otpExpires = otpExpires;
      await found.save();
    } else if (type === 'Principal') {
      found = await User.findOne({ email: targetEmail, role: 'Principal' });
      if (!found) return res.status(404).json({ message: 'No Principal found with this email.' });
      if (!namesMatch(found.fullName, name)) return res.status(403).json({ message: 'Name does not match our records.' });
      found.otp = otp; found.otpExpires = otpExpires;
      await found.save();
    } else if (type === 'Dean') {
      found = await User.findOne({ email: targetEmail, role: 'Dean' });
      if (!found) return res.status(404).json({ message: 'No Dean found with this email.' });
      if (!namesMatch(found.fullName, name)) return res.status(403).json({ message: 'Name does not match our records.' });
      found.otp = otp; found.otpExpires = otpExpires;
      await found.save();
    } else {
      return res.status(400).json({ message: 'Invalid role type.' });
    }

    try {
      await sendEmail({
        email: targetEmail,
        subject: 'GCEK Portal - Your Login OTP',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden"><div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px;text-align:center"><h1 style="color:#fff;margin:0;font-size:22px">GCEK Portal</h1><p style="color:#e0e7ff;margin:4px 0 0;font-size:12px">One-Time Password</p></div><div style="padding:32px;text-align:center"><p style="color:#475569;font-size:15px">Hello <strong>${name}</strong>,</p><p style="color:#475569;font-size:14px">Your login OTP is:</p><div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#6366f1;padding:16px 0">${otp}</div><p style="color:#94a3b8;font-size:12px">Expires in <strong>10 minutes</strong>. Do not share it.</p></div></div>`
      });
      console.log(`[OTP] Sent to ${targetEmail} for ${type}`);
    } catch (emailErr) {
      console.error('[OTP] Email failed:', emailErr.message);
      return res.status(500).json({ message: 'Failed to send OTP email. Please contact admin.' });
    }

    res.status(200).json({ message: `OTP sent to ${targetEmail}. Please check your inbox.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Verify OTP & issue token (Step 2)
exports.otpLoginVerify = async (req, res) => {
  try {
    const { type, email, otp, regdNo, branch, semester } = req.body;

    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required.' });

    const targetEmail = email.trim().toLowerCase();
    let finalUser = null;
    let isStudentModel = false;

    if (type === 'Student') {
      finalUser = await Student.findOne({ regdNo: regdNo?.trim() });
      isStudentModel = true;
    } else if (type === 'HOD') {
      finalUser = await User.findOne({ email: targetEmail, role: 'HOD' });
    } else if (type === 'Principal') {
      finalUser = await User.findOne({ email: targetEmail, role: 'Principal' });
    } else if (type === 'Dean') {
      finalUser = await User.findOne({ email: targetEmail, role: 'Dean' });
    } else {
      finalUser = await User.findOne({ email: targetEmail, role: 'Faculty' });
    }

    if (!finalUser) return res.status(404).json({ message: 'User record not found.' });
    if (finalUser.otp !== otp || finalUser.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    finalUser.otp = undefined;
    finalUser.otpExpires = undefined;
    finalUser.isVerified = true;
    if (!isStudentModel) {
      finalUser.isLoggedIn = true;
      finalUser.lastLogin = new Date();
    }
    await finalUser.save();

    // For students: ensure User record exists for JWT
    if (isStudentModel) {
      let authUser = await User.findOne({ regdNo: finalUser.regdNo });
      if (!authUser) {
        authUser = await User.create({
          fullName:   finalUser.name,
          role:       'Student',
          regdNo:     finalUser.regdNo,
          email:      finalUser.email || targetEmail,
          department: branch || finalUser.branch,
          semester:   semester || finalUser.semester,
          phone:      finalUser.phoneNumber || '',
          isApproved: true, isVerified: true, isLoggedIn: true,
          lastLogin:  new Date(),
        });
      } else {
        authUser.isVerified = true; authUser.isLoggedIn = true; authUser.lastLogin = new Date();
        if (branch)   authUser.department = branch;
        if (semester) authUser.semester = semester;
        if (!authUser.email) authUser.email = targetEmail;
        await authUser.save();
      }
      finalUser = authUser;
    }

    // Principal attendance auto-mark
    if (type === 'Principal') {
      try {
        const StaffAttendance = require('../models/StaffAttendance');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const existing = await StaffAttendance.findOne({
          userId: finalUser._id,
          date: { $gte: today, $lt: new Date(today.getTime() + 86400000) }
        });
        if (!existing) {
          await new StaffAttendance({
            userId: finalUser._id, date: today, status: 'Present',
            verificationStatus: 'Verified',
            metadata: { backgroundDetected: 'Login Triggered', faceMatched: true }
          }).save();
        }
      } catch (e) { console.error('Principal attendance mark error:', e.message); }
    }

    const token = jwt.sign(
      { id: finalUser._id, role: finalUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id:                  finalUser._id,
        name:                finalUser.fullName || finalUser.name,
        email:               finalUser.email,
        role:                finalUser.role,
        assignedRole:        finalUser.assignedRole || 'None',
        department:          branch || finalUser.department,
        semester:            semester || finalUser.semester,
        regdNo:              finalUser.regdNo || '',
        facultyId:           finalUser.facultyId || '',
        teachingAssignments: finalUser.teachingAssignments || [],
        profileImage:        finalUser.profileImage || '',
        phone:               finalUser.phone || '',
        bio:                 finalUser.bio || '',
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};