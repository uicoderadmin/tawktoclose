const express = require('express');
const axios = require('axios');

const app = express();

app.use(express.json()); // To parse incoming JSON data

// Webhook handler for Tawk.to
app.post('/webhook', async (req, res) => {
  try {
    // Extract data from the webhook (assuming name, email, and message)
    const leadfields ={}

    console.log('API Key:', process.env.CLOSE_CRM_API_KEY);
    const message = req.body?.message.text.split("\r\n").forEach((text) =>{
        const splitedData=  text.split(" : ")
        leadfields[splitedData[0]]=splitedData[1]
    });

    // Prepare the data to send to Close CRM
    const leadData = {
      name: leadfields.Name,
      contacts: [
        {
          name: leadfields.Name,
          emails: [{ email: leadfields.Email }],
          phones: [
                {
                    "type": "office",
                    "phone": leadfields.Phone
                }
            ]
        },
      ],
      custom: {
        Source: 'Tawk.to Pre-Chat Form',
      },
    };

    // Send the data to Close CRM API
    const response = await axios.post('https://api.close.com/api/v1/lead/', leadData, {
      headers: {
        'Authorization': `Bearer ${process.env.CLOSE_CRM_API_KEY}`, // Use environment variable for API key
        'Content-Type': 'application/json',
      },
    });

    console.log('Lead created in Close CRM:', response.data);
    res.status(200).json({ message: 'Lead created successfully', data: response.data });
  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

module.exports = app;
