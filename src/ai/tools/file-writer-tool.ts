'use server';
/**
 * @fileOverview A Genkit tool for writing content to files.
 * This tool allows an AI flow to create or overwrite files in the project's file system.
 * It is a powerful tool and should be used with caution and clear instructions in prompts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { promises as fs } from 'fs';
import path from 'path';

export const fileWriterTool = ai.defineTool(
  {
    name: 'fileWriterTool',
    description: 'Creates a new file or completely overwrites an existing file with the provided content. Use this to write code, configuration, or text. The full file path is required.',
    inputSchema: z.object({
      filePath: z.string().describe("The absolute path of the file to create or overwrite. The path should be relative to the project root, e.g., 'src/components/new-component.tsx'."),
      content: z.string().describe('The entire content to be written to the file.'),
    }),
    outputSchema: z.object({
      success: z.boolean().describe("Whether the file was written successfully."),
      message: z.string().describe("A message indicating the result of the operation."),
    }),
  },
  async (input) => {
    console.log(`[fileWriterTool] Attempting to write to: ${input.filePath}`);

    // Basic security check to prevent path traversal attacks (e.g., ../../)
    const resolvedPath = path.resolve(process.cwd(), input.filePath);
    if (!resolvedPath.startsWith(process.cwd())) {
        console.error(`[fileWriterTool] Security Error: Attempted to write outside of project directory to ${resolvedPath}`);
        return {
            success: false,
            message: `Error: File path is outside the allowed project directory.`,
        };
    }

    try {
      // Ensure the directory exists before writing the file
      const dirname = path.dirname(resolvedPath);
      await fs.mkdir(dirname, { recursive: true });

      // Write the file
      await fs.writeFile(resolvedPath, input.content, 'utf8');

      console.log(`[fileWriterTool] Successfully wrote ${input.content.length} bytes to ${input.filePath}`);
      return {
        success: true,
        message: `Successfully wrote file to ${input.filePath}.`,
      };
    } catch (error: any) {
      console.error(`[fileWriterTool] Error writing file to ${input.filePath}:`, error);
      return {
        success: false,
        message: `Failed to write file. Error: ${error.message}`,
      };
    }
  }
);
