
import { onCall } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export const suggestMarketPrice = onCall(async (request) => {
  const { productName, description } = request.data;

  const prompt = `
    You are an expert agricultural market analyst. Based on the following product information, suggest a market price in USD.
    Product Name: ${productName}
    Description: ${description}
    Provide only the price as a number, without any currency symbols or additional text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const price = response.text().trim();
    return { price };
  } catch (error) {
    console.error("Error suggesting market price:", error);
    throw new functions.https.HttpsError("internal", "Failed to suggest a market price.");
  }
});
