const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// 🌾 Existing Crop Advisory Function (English Only)
const generateAdvisory = async (cropType, cropName, activity, weather) => {
    const prompt = `
        Generate a **short and clear** agricultural advisory (2-3 lines per section). 

        📌 Inputs:
        - Crop Type: ${cropType}
        - Crop Name: ${cropName}
        - Activity: ${activity}
        - **Weather Forecast (Next 5 Days):**  
        ${JSON.stringify(weather, null, 2)}

        📢 Output Format:  
        - 📅 Date-wise Weather Summary (Max 2 lines per day)  
        - ⚠️ Risks & Warnings  
        - 🌱 Decision (Proceed/Delay) & Why?  
        - 🚜 Farmer Actions (Max 3 points, 1 line each)  

        **Provide the advisory in English only.**
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("Gemini API Error:", err);
        return "Advisory generation failed.";
    }
};

// 🌱 New Soil Health Advisory Function (English Only)
const generateSoilAdvisory = async (soilType, soilPH, nitrogen, phosphorus, potassium, moisture, location, concern) => {
    const prompt = `
        Generate a **brief and actionable** soil advisory based on the inputs.

        📌 **Inputs:**
        - **Soil Type:** ${soilType}
        - **pH Level:** ${soilPH}
        - **Nutrient Levels:**
          - Nitrogen: ${nitrogen}
          - Phosphorus: ${phosphorus}
          - Potassium: ${potassium}
        - **Moisture Level:** ${moisture}
        - **Location:** ${location}
        - **Farmer's Concern:** ${concern}

        📢 **Output Format (Max 3-4 Sentences):**  
        - 🚜 **Key Issue:** [One short sentence]
        - 🌱 **Immediate Fix:** [One short action]
        - 🔄 **Long-Term Solution:** [One short recommendation]

        🔹 **Important:**
        - Keep it within **50 words**.  
        - No unnecessary explanations, just direct steps.  
        - If soil health is good, suggest only maintenance tips.  
        
        Now, generate a **concise and practical** soil advisory.
    `;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error("Gemini API Error:", err);
        return "Advisory generation failed.";
    }
};


module.exports = { generateAdvisory, generateSoilAdvisory };
