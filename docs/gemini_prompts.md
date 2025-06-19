# Gemini API Prompts for DamDoh

This document outlines examples of potential prompts or requests that would be sent to the Gemini API for different AI use cases within the DamDoh platform. These examples illustrate the type of information that would be provided to Gemini and the expected output.

## 1. Pest and Disease Identification

This prompt is designed to analyze an uploaded image of a crop and identify potential pests or diseases, providing suggested solutions.

**Input Data:**

*   **Image:** The actual image file of the affected crop.
*   **Context:**
    *   `crop_type`: (e.g., "tomato", "wheat", "maize")
    *   `location`: (e.g., "latitude, longitude" or "region, country")
    *   `timestamp`: The date and time the photo was taken.
    *   `user_id`: ID of the farmer.

**Prompt Example:**
```
text
Analyze the provided image of a [crop_type] crop from [location] taken on [timestamp]. Identify any signs of pests or diseases present. Based on the identification, suggest possible causes and recommended solutions or treatments. Consider local conditions if possible.
```
**Expected Output:**

A structured response (e.g., JSON) containing:

*   `identified_issues`: A list of potential pests or diseases identified.
    *   `name`: Name of the pest or disease.
    *   `confidence_score`: A score indicating the confidence of the identification.
    *   `description`: A brief description of the issue.
*   `suggested_solutions`: A list of recommended solutions or treatments.
    *   `type`: (e.g., "biological", "chemical", "cultural practice")
    *   `details`: Specific instructions or recommendations.
    *   `precautions`: Any necessary precautions.
*   `confidence_message`: A natural language summary of the findings and recommendations.

## 2. Personalized Crop Advisory

This prompt provides comprehensive data about a farmer's specific context and requests personalized advice to optimize crop growth.

**Input Data:**

*   `user_id`: ID of the farmer.
*   `farm_id`: ID of the farm/plot.
*   `crop_type`: (e.g., "tomato", "wheat", "maize")
*   `planting_date`: Date the crop was planted.
*   `current_growth_stage`: (e.g., "vegetative", "flowering", "fruiting")
*   `location`: (e.g., "latitude, longitude" or "region, country")
*   `soil_data`: (e.g., "pH": 6.5, "nitrogen": "medium", "phosphorus": "high")
*   `recent_weather_data`: (e.g., average temperature, rainfall in the last week)
*   `historical_yield_data`: (e.g., yield from previous seasons for this crop on this farm)
*   `farmer_observations`: Any specific observations or concerns from the farmer.

**Prompt Example:**
```
text
Provide personalized advice to optimize the growth of the [crop_type] crop on farm [farm_id] located at [location]. The crop was planted on [planting_date] and is currently in the [current_growth_stage] stage. Consider the following data:
- Soil data: [soil_data]
- Recent weather: [recent_weather_data]
- Historical yield: [historical_yield_data]
- Farmer observations: "[farmer_observations]"

Suggest recommendations for irrigation, fertilization, pest/disease prevention, and any other relevant practices to improve yield and quality.
```
**Expected Output:**

A natural language response providing actionable advice, potentially structured with headings for different areas of focus (e.g., Irrigation, Fertilization, Pest Management). The response should be tailored to the farmer's specific context and easy to understand.

## 3. Natural Language Interaction (Chatbot)

This prompt represents a user's query to an AI-powered chatbot and requests a helpful and informative response on an agricultural topic.

**Input Data:**

*   `user_id`: ID of the user.
*   `user_query`: The user's question in natural language (e.g., "How to grow tomatoes in [region]?").
*   `user_context`: (Optional) Information about the user's role, location, or interests to personalize the response.

**Prompt Example:**
```
text
The user [user_id] has asked: "[user_query]". Provide a helpful and informative response based on your agricultural knowledge. If the query is about a specific region, provide relevant information for that region. Keep the language clear and easy to understand.
```
**Expected Output:**

A natural language response directly addressing the user's query. The response should be informative, accurate, and easy to comprehend, potentially offering further resources or related information.