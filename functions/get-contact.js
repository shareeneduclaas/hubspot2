const axios = require("axios");

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const { email } = JSON.parse(event.body);
  const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

  if (!email || !HUBSPOT_TOKEN) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing email or token" })
    };
  }

  try {
    const response = await axios.post(
      "https://api.hubapi.com/crm/v3/objects/contacts/search",
      {
        filterGroups: [{
          filters: [{ propertyName: "email", operator: "EQ", value: email }]
        }],
        properties: [
          "business_unit_r",
          "marketing_solution_group",
          "country_r",
          "customer_segment_r",
          "wim_segment_r"
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${HUBSPOT_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    const contact = response.data.results[0];
    if (!contact) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Contact not found" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(contact.properties)
    };
  } catch (err) {
    console.error(err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error fetching contact" })
    };
  }
};
