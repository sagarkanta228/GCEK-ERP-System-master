const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for SRV lookups on some networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User'); // Register User model
const Notice = require('./models/Notice');

async function checkNotices() {
    try {
        console.log("Connecting to DB...");
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log("Connected to DB");
        const notices = await Notice.find({}).populate('sender', 'fullName role');
        console.log(JSON.stringify(notices, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkNotices();
