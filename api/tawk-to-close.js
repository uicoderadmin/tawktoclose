const express = require('express');
const axios = require('axios');
const Closeio = require('close.io');

const closeio = new Closeio(process.env.CLOSE_CRM_API_KEY);
const app = express();

app.use(express.json()); // To parse incoming JSON data

// Webhook handler for Tawk.to
app.post('/webhook', async (req, res) => {
  try {
    // Extract data from the webhook (assuming name, email, and message)
    const leadfields = {};
    // Parse the message text into key-value pairs
    req.body?.message.text.split("\r\n").forEach((text) => {
      const splitedData = text.split(" : ");
      leadfields[splitedData[0]] = splitedData[1];
    });

    // Prepare the data to send to Close CRM
    const leadData = {
      name: leadfields.Name,
      contacts: [
        {
          name: leadfields.Name,
          emails: [
            {
              type: "office",
              email: leadfields.Email
            }
          ],
          phones: [
            {
              type: "office",
              phone: leadfields.Phone
            }
          ]
        },
      ],
      custom: {
        'Referral Source': 'Tawk Chat'
      },
    };

    console.log('Lead Data:', leadData);

    // Create a lead in Close CRM
    const lead = await closeio.lead.create(leadData);
    console.log('Lead created successfully:', lead);

    // Optionally, you can read the lead again if necessary
    const createdLead = await closeio.lead.read(lead.id);
    console.log('Created Lead Data:', createdLead);

    // Respond with the created lead data
    res.status(200).json({ message: 'Lead created successfully', data: createdLead });
  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

module.exports = app;
