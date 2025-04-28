// server.js

const express     = require('express');
const bodyParser  = require('body-parser');
const { google }  = require('googleapis');

// Render’da yüklediğiniz Secret File adı
const keys = require('./leadtosheets-5aa9bd79b82f.json');

const app  = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());

// Google Auth
const auth   = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Webhook doğrulama (GET)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verifyTokenForMeta2025';
  const mode    = req.query['hub.mode'];
  const token   = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Webhook event (POST)
app.post('/webhook', async (req, res) => {
  console.log('Received webhook:', JSON.stringify(req.body));

  try {
    const spreadsheetId = '141MlZ6kx3SYGMOMmRsqVAvo-IuC9jjUTpPqNuMgBCfw';
    const sheetName     = 'Sheet1';

    // Leadgen payload içinden değişiklik objesini al
    const change = req.body.entry[0].changes[0].value;

    // field_data array’ini name→value haritasına çevir
    const map = {};
    (change.field_data || []).forEach(f => {
      map[f.name] = Array.isArray(f.values) ? f.values[0] : f.values;
    });

    // Sütunlara denk gelecek değişkenler
    const fullName = map.full_name       || '';
    const email    = map.email           || '';
    const telefon  = map.telefon_numarası || '';
    const country  = map.country         || '';
    const jobTitle = map.job_title       || '';

    // Şimdi A–E sütunlarına yazacağız
    const values = [[
      fullName,
      email,
      telefon,
      country,
      jobTitle
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });

    console.log('Data appended to sheet.');
    res.status(200).send('EVENT_RECEIVED');

  } catch (err) {
    console.error('Error writing to sheet:', err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
