const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const { generateAdvisory, generateSoilAdvisory } = require("./geminiService");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "http://api.weatherapi.com/v1/forecast.json";

// 🌾 CROP ADVISORY ROUTE (UNCHANGED)
app.post("/api/advisory", async (req, res) => {
    try {
        const { location, cropType, cropName, activity } = req.body;
        if (!location || !cropType || !cropName || !activity) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        // Fetch weather forecast
        const response = await axios.get(BASE_URL, {
            params: { key: WEATHER_API_KEY, q: location, days: 5 }
        });

        const forecast = response.data.forecast.forecastday.map(day => ({
            date: day.date,
            maxTemp: day.day.maxtemp_c,
            minTemp: day.day.mintemp_c,
            humidity: day.day.avghumidity,
            rainfall: day.day.daily_chance_of_rain,
            condition: day.day.condition.text
        }));

        const advisory = await generateAdvisory(cropType, cropName, activity, forecast);

        res.json({ location: response.data.location.name, cropName, forecast, advisory });

    } catch (error) {
        console.error("Error fetching weather data:", error);
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// 🌱 SOIL HEALTH ADVISORY ROUTE (UPDATED)
app.post("/api/soil-advisory", async (req, res) => {
    try {
        const { location, soilType, soilPH, nitrogen, phosphorus, potassium, moisture } = req.body;
        if (!location || !soilType || !soilPH || !nitrogen || !phosphorus || !potassium || !moisture) {
            return res.status(400).json({ error: "Missing required soil parameters" });
        }

        // Generate soil health advisory (WITHOUT weather dependency)
        const advisory = await generateSoilAdvisory(soilType, soilPH, nitrogen, phosphorus, potassium, moisture, location);

        res.json({ location, soilType, advisory });

    } catch (error) {
        console.error("Error generating soil advisory:", error);
        res.status(500).json({ error: "Failed to generate soil advisory" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
