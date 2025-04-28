const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const keys = require('./leadtosheets-82f59e66f3d6.json'); // kendi JSON dosyanın adı burada olacak

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Google Sheets client'ı hazırla
const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Webhook doğrulama
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "verifyTokenForMeta2025";
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Facebook Webhook verisini al ve Sheets'e yaz
app.post('/webhook', async (req, res) => {
  console.log('Webhook event received:', JSON.stringify(req.body, null, 2));
  
  try {
    const spreadsheetId = '141MlZ6kx3SYGMOMmRsqVAvo-IuC9jjUTpPqNuMgBCfw'; // senin sheet ID
    const sheetName = 'Sheet1'; // senin sayfa adı

    const data = req.body; // gelen verinin tamamı burada

    const values = [
      [
        new Date().toISOString(), // A sütunu: webhook geldiği zaman
        JSON.stringify(data) // B sütunu: komple JSON verisi
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:B`, // A ve B sütunlarına yazacağız
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    });

    console.log('Data appended to sheet.');
    res.status(200).send('EVENT_RECEIVED');
  } catch (error) {
    console.error('Error appending to sheet:', error);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
