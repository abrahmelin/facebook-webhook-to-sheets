const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Facebook Webhook için body'yi parse et
app.use(bodyParser.json());

// Webhook doğrulama (Facebook çağırınca ilk buraya GET atar)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = "your_verify_token"; // Birazdan Facebook'a gireceğiz
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

// Facebook'dan veri POST geldiğinde
app.post('/webhook', (req, res) => {
  console.log('Webhook event received:', JSON.stringify(req.body, null, 2));
  res.status(200).send('EVENT_RECEIVED');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
