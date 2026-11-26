const fs = require('fs');
const src = `C:\\Users\\sheru\\.gemini\\antigravity\\brain\\fc9b0dce-4efe-4474-83c5-e52e4b6c21c9\\academic_paper_bg_1790941845008.jpg`;
const dest = `c:\\Users\\sheru\\Downloads\\gen_ai\\bg.jpg`;
fs.copyFileSync(src, dest);
console.log('Background image copied successfully to', dest);
