const https = require('https');

/**
 * Send OTP via Fast2SMS (Indian SMS service).
 * Sign up at https://www.fast2sms.com/ to get a free API key.
 * Free tier allows ~100 SMS/day to Indian mobile numbers.
 *
 * @param {string} phoneNumber - 10-digit Indian mobile number
 * @param {string} otp - 6-digit OTP string
 */
const sendSMS = async (phoneNumber, otp) => {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_FAST2SMS_API_KEY_HERE') {
    console.warn('[SMS] Fast2SMS API key not configured. OTP will not be sent via SMS.');
    return { success: false, reason: 'API key not configured' };
  }

  // Strip any country code prefix (+91 etc.) to get 10-digit number
  const cleanNumber = phoneNumber.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

  const payload = JSON.stringify({
    route: 'q',
    message: `Verification Code: ${otp}`,
    language: 'english',
    flash: 0,
    numbers: cleanNumber,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.fast2sms.com',
      path: '/dev/bulkV2',
      method: 'POST',
      headers: {
        authorization: apiKey,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.return === true) {
            console.log(`[SMS] OTP sent to ${cleanNumber}`);
            resolve({ success: true });
          } else {
            console.error('[SMS] Fast2SMS error:', parsed);
            resolve({ success: false, reason: parsed.message });
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('[SMS] Request error:', e.message);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
};

module.exports = sendSMS;
