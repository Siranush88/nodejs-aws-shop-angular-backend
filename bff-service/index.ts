const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 4000;

app.use(express.json());

app.all("/:recipient/:id?", async (req, res) => {
  const { recipient, id } = req.params;

  const recipientURL = process.env[`${recipient.toUpperCase()}_SERVICE_URL`];

  const url = id ? `${recipientURL}/${id}` : recipientURL;

  if (!recipientURL) {
    return res.status(502).json({ error: "Cannot process request ..." });
  }

  const { method, body, query } = req;
  console.log("body>>>", body);

  try {
    const response = await axios({
      method: method,
      url,
      params: query,
      ...(method !== "GET" && { data: body }),
    });

    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json(`${error.response.data} ....`);
    } else {
      res.status(500).json({ error: "Internal Server Error ..." });
    }
  }
});

app.listen(port, () => {
  console.log(`BFF service listening at http://localhost:${port}`);
});
