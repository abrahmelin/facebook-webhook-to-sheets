const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const keys = require('./leadtosheets-5aa9bd79b82f.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
const sheets = google.sheets({ version: 'v4', auth });

app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = 'verifyTokenForMeta2025';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

app.post('/webhook', async (req, res) => {
  console.log('Received webhook:', req.body);
  try {
    const spreadsheetId = '141MlZ6kx3SYGMOMmRsqVAvo-IuC9jjUTpPqNuMgBCfw';
    const sheetName = 'Sheet1';
    const values = [
      [ new Date().toISOString(), JSON.stringify(req.body) ]
    ];
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:B`,
      valueInputOption: 'USER_ENTERED',
      resource: { values }
    });
    res.status(200).send('EVENT_RECEIVED');
  } catch (err) {
    console.error('Error writing to sheet:', err);
    res.sendStatus(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
