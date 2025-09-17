import { randomBytes } from 'crypto';

export async function uploadFileAndGetURL(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }
  
  // Generate a unique filename using crypto
  const fileExtension = file.name.split('.').pop();
  const uniqueFilename = `${randomBytes(16).toString('hex')}.${fileExtension}`;
  const fullPath = `${path}/${uniqueFilename}`;
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', fullPath);
  
  // Get the API URL from environment variables
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  
  // Upload file to backend
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.url;
}
