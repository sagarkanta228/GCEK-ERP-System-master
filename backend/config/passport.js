const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const fullName = profile.displayName;

                let user = await User.findOne({ email });

                if (!user) {
                    // Check if they exist in pre-registered student/staff lists
                    let detectedRole = "Student"; // Default
                    let department = "";
                    let regdNo = "";
                    let semester = "";

                    // Attempt to find in Student collection
                    const studentData = await require('../models/Student').findOne({ email });
                    if (studentData) {
                        detectedRole = "Student";
                        department = studentData.branch;
                        regdNo = studentData.regdNo;
                        semester = studentData.semester;
                    } else {
                        // Check if they are a known HOD/Dean/Faculty in the User/Staff database
                        // (Sometimes we have their email but not a User account yet)
                    }

                    // Create a random high-entropy password for OAuth users
                    const randomPassword = Math.random().toString(36).slice(-10) + "A1!";
                    const hashedPassword = await bcrypt.hash(randomPassword, 10);

                    user = await User.create({
                        fullName,
                        email,
                        password: hashedPassword,
                        role: detectedRole,
                        department,
                        regdNo,
                        semester,
                        isVerified: true,
                        isLoggedIn: true,
                        lastLogin: new Date()
                    });
                } else {
                    // Update login status for existing users logging in via Google
                    user.isVerified = true;
                    user.isLoggedIn = true;
                    user.lastLogin = new Date();
                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
