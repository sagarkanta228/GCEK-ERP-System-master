require('dotenv').config();
const fs = require('fs');
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`)
    .then(res => res.json())
    .then(data => fs.writeFileSync('gemini_models.json', JSON.stringify(data, null, 2)))
    .catch(err => console.error(err));
