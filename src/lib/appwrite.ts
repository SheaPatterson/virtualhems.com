import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'http://localhost:8080/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '6990ba79002c79bde24f');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { client };
