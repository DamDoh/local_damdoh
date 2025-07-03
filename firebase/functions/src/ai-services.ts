
import * as functions from "firebase-functions";
import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI model
// Ensure the API key is set in your environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export const suggestMarketPrice = onCall(async (request) => {
  const { productName, description, category, location } = request.data;
  
  if (!productName || !description) {
      throw new functions.https.HttpsError("invalid-argument", "Product name and description are required.");
  }

  const prompt = `
    You are an expert agricultural market analyst. Based on the following product information, suggest a market price in USD.
    
    Product Name: ${productName}
    Description: ${description}
    Category: ${category || 'Not specified'}
    Target Location/Market: ${location || 'Global'}

    Provide only the price as a number, without any currency symbols, commas, or additional text. For example: 1250.50
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const priceText = response.text().trim();
    
    // Clean the response to ensure it's a valid number
    const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

    if (isNaN(price)) {
        console.error("AI returned a non-numeric price suggestion:", priceText);
        throw new functions.https.HttpsError("internal", "AI returned a non-numeric suggestion.");
    }

    return { price };
  } catch (error) {
    console.error("Error suggesting market price:", error);
    throw new functions.https.HttpsError("internal", "Failed to suggest a market price.");
  }
});
