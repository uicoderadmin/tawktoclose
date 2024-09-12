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
          "emails": [
                {
                    "type": "office",
                    "email": leadfields.Email
                }
            ],
            "phones": [
                {
                    "type": "office",
                    "phone": leadfields.Phone
                }
            ]
        },
      ],
      custom: {
       'Referral Source': 'Tawk Chat'
      },
    };
    console.log(leadData);
    
   closeio.lead.create(leadData)
    .then(function(lead){
      console.log('Lead created:', lead);
      return closeio.lead.read(lead.id);
    }).catch(function(error){
      console.error('Error creating lead:', error.response?.data || error.message);
    })
  } catch (error) {
    console.error('Error creating lead:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

module.exports = app;
