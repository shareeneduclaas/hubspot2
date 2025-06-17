const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;
  const HUBSPOT_TOKEN = process.env.HUBSPOT_TOKEN;

  if (!email || !HUBSPOT_TOKEN) {
    return res.status(400).json({ error: "Missing email or token" });
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
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json(contact.properties);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Error fetching contact" });
  }
};
