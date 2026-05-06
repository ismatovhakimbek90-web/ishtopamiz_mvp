const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const FRONTEND = path.join(__dirname, 'frontend');

// Serve static files
app.use(express.static(FRONTEND));

// SPA fallback — all routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n⚡ IshTop frontend server running!`);
  console.log(`   🌐 http://localhost:${PORT}`);
  console.log(`\n   Test foydalanuvchilar:`);
  console.log(`   👤 Ish qidiruvchi: ali@test.uz / 123456`);
  console.log(`   👤 Ish qidiruvchi: malika@test.uz / 123456`);
  console.log(`   🏢 Ish beruvchi:   techcorp@test.uz / 123456`);
  console.log(`   🏢 Ish beruvchi:   digital@test.uz / 123456\n`);
});
