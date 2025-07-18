
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a market price for a product.
 *
 * - suggestMarketPrice - A function that suggests a market price based on product details.
 * - SuggestMarketPriceInput - The input type for the suggestMarketPrice function.
 * - SuggestMarketPriceOutput - The return type for the suggestMarketPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SuggestMarketPriceInputSchema, SuggestMarketPriceOutputSchema } from '@/lib/schemas';


const prompt = ai.definePrompt({
  name: 'suggestMarketPricePrompt',
  input: {schema: SuggestMarketPriceInputSchema},
  output: {schema: SuggestMarketPriceOutputSchema},
  prompt: `
    You are an expert agricultural market analyst for the DamDoh platform. 
    Your task is to suggest a fair market price in USD based on the provided product information.

    Product Name: {{{productName}}}
    Description: {{{description}}}
    Category: {{{category}}}
    Target Location/Market: {{{location}}}

    Consider the product type, quality described, organic or sustainable mentions, and location.
    Provide ONLY the price as a single number, without any currency symbols, commas, or additional text.
    For example: 1250.50
  `,
});

const suggestMarketPriceFlow = ai.defineFlow(
  {
    name: 'suggestMarketPriceFlow',
    inputSchema: SuggestMarketPriceInputSchema,
    outputSchema: SuggestMarketPriceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.price || isNaN(output.price)) {
      console.error("AI returned a non-numeric or missing price suggestion:", output);
      // Fallback to a default or throw an error
      // throw new Error("AI returned an invalid price suggestion.");
      return { price: 0 };
    }
    return { price: output.price };
  }
);


export async function suggestMarketPrice(input: any): Promise<any> {
  return suggestMarketPriceFlow(input);
}
