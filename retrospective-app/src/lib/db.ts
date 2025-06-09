import fs from 'fs/promises';
import path from 'path';

// Define the structure of an item
export interface RetrospectiveItem {
  id: string;
  text: string;
  column: 'went-well' | 'can-be-improved' | 'action-item';
  votes: number;
}

// Define the structure of the database
export interface Database {
  items: RetrospectiveItem[];
}

// Path to the JSON file, resolve to be relative to the project root
const dataFilePath = path.resolve('retrospective-app/src/data.json');

// Function to read the database
export async function readDb(): Promise<Database> {
  try {
    await fs.access(dataFilePath); // Check if file exists
  } catch (error) {
    // If file doesn't exist, initialize it with default structure
    await writeDb({ items: [] });
    return { items: [] };
  }

  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (!fileContent.trim()) { // Handle empty file
        await writeDb({ items: [] });
        return { items: [] };
    }
    const data = JSON.parse(fileContent) as Database;
    // Basic validation
    if (!data || typeof data !== 'object' || !Array.isArray(data.items)) {
        console.error("Invalid data structure in data.json, reinitializing.");
        await writeDb({ items: [] });
        return { items: [] };
    }
    return data;
  } catch (error) {
    console.error('Error reading or parsing data.json:', error);
    // If there's an error (e.g., corrupted JSON), reinitialize
    await writeDb({ items: [] });
    return { items: [] }; // Return a default structure
  }
}

// Function to write to the database
export async function writeDb(data: Database): Promise<void> {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(dataFilePath, jsonData, 'utf-8');
  } catch (error) {
    console.error('Error writing to data.json:', error);
    // Depending on the app's needs, you might want to throw the error
    // or handle it more gracefully. For now, just logging.
    throw new Error('Failed to write to database.');
  }
}
