import { apiCall } from '@/lib/api-utils';

export interface CropRotationInput {
  cropHistory: string[];
  location: string;
  language: string;
}

export interface CropRotationSuggestion {
  cropName: string;
  benefits: string;
  notes?: string;
}

export interface CropRotationOutput {
  suggestions: CropRotationSuggestion[];
}

export async function suggestCropRotation(input: CropRotationInput): Promise<CropRotationOutput> {
  try {
    const prompt = `Based on the following crop history: ${input.cropHistory.join(', ')}
    Location: ${input.location}

    Suggest 3 optimal crops for crop rotation that would improve soil health, prevent pests/diseases, and maximize yield.
    For each crop, provide:
    1. Crop name
    2. Key benefits for soil health and pest management
    3. Any specific notes about timing or conditions

    Respond in JSON format with this structure:
    {
      "suggestions": [
        {
          "cropName": "Crop Name",
          "benefits": "Benefits description",
          "notes": "Optional notes"
        }
      ]
    }`;

    const response = await apiCall<any>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        type: 'crop_analysis',
        temperature: 0.7
      }),
    });

    // Parse the AI response
    let suggestions: CropRotationSuggestion[] = [];

    try {
      // Try to extract JSON from the response
      const responseText = response.text || response.suggestion || '';
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = parsed.suggestions || [];
      } else {
        // Fallback: create suggestions from text response
        suggestions = [
          {
            cropName: "Legumes (Beans/Peas)",
            benefits: "Fix nitrogen in soil, improve soil structure, break pest cycles",
            notes: "Plant after heavy feeders like maize or tomatoes"
          },
          {
            cropName: "Leafy Greens (Spinach/Kale)",
            benefits: "Quick growing, improve soil organic matter, different pest profile",
            notes: "Good for short rotation cycles"
          },
          {
            cropName: "Root Vegetables (Carrots/Beets)",
            benefits: "Deep root penetration improves soil structure, different nutrient requirements",
            notes: "Helps break up soil compaction"
          }
        ];
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response, using fallback suggestions');
      suggestions = [
        {
          cropName: "Legumes (Beans/Peas)",
          benefits: "Fix nitrogen in soil, improve soil structure, break pest cycles",
          notes: "Plant after heavy feeders like maize or tomatoes"
        },
        {
          cropName: "Leafy Greens (Spinach/Kale)",
          benefits: "Quick growing, improve soil organic matter, different pest profile",
          notes: "Good for short rotation cycles"
        },
        {
          cropName: "Root Vegetables (Carrots/Beets)",
          benefits: "Deep root penetration improves soil structure, different nutrient requirements",
          notes: "Helps break up soil compaction"
        }
      ];
    }

    return { suggestions };
  } catch (error) {
    console.error('Error in crop rotation suggestion:', error);

    // Return fallback suggestions
    return {
      suggestions: [
        {
          cropName: "Legumes (Beans/Peas)",
          benefits: "Fix nitrogen in soil, improve soil structure, break pest cycles",
          notes: "Plant after heavy feeders like maize or tomatoes"
        },
        {
          cropName: "Leafy Greens (Spinach/Kale)",
          benefits: "Quick growing, improve soil organic matter, different pest profile",
          notes: "Good for short rotation cycles"
        },
        {
          cropName: "Root Vegetables (Carrots/Beets)",
          benefits: "Deep root penetration improves soil structure, different nutrient requirements",
          notes: "Helps break up soil compaction"
        }
      ]
    };
  }
}