"use server";
import fs from 'fs';
import path from 'path';

const customMandalsPath = path.join(process.cwd(), 'customMandals.json');

// Get all custom mandals from JSON
export async function getCustomMandals(): Promise<Record<string, string[]>> {
  try {
    if (!fs.existsSync(customMandalsPath)) {
      fs.writeFileSync(customMandalsPath, JSON.stringify({}), 'utf-8');
      return {};
    }
    const data = fs.readFileSync(customMandalsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading custom mandals:", error);
    return {};
  }
}

// Add a custom mandal
export async function addCustomMandal(district: string, mandal: string) {
  try {
    const custom = await getCustomMandals();
    if (!custom[district]) {
      custom[district] = [];
    }
    // Avoid duplicates
    if (!custom[district].includes(mandal)) {
      custom[district].push(mandal);
      fs.writeFileSync(customMandalsPath, JSON.stringify(custom, null, 2), 'utf-8');
    }
    return true;
  } catch (error) {
    console.error("Error adding custom mandal:", error);
    return false;
  }
}

// Verify mandal via Wikipedia API
export async function verifyMandalInternet(district: string, mandal: string): Promise<{ verified: boolean, message: string }> {
  try {
    // We use Wikipedia Search API to check if the place exists in the context of the district or state.
    // Query format: "MandalName DistrictName"
    const query = encodeURIComponent(`${mandal} ${district}`);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      return { verified: false, message: "Network error during verification." };
    }
    
    const data = await response.json();
    if (data.query && data.query.search && data.query.search.length > 0) {
      // If there's at least one search result, we consider it verified
      return { verified: true, message: "Verified successfully on Wikipedia." };
    } else {
      // Secondary check: just search for the mandal name alone to be lenient
      const leniencyQuery = encodeURIComponent(`${mandal} India`);
      const res2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${leniencyQuery}&utf8=&format=json`);
      const data2 = await res2.json();
      
      if (data2.query && data2.query.search && data2.query.search.length > 0) {
        return { verified: true, message: "Verified successfully on Wikipedia." };
      }
      
      return { verified: false, message: "Could not verify this place on the internet. Please check spelling." };
    }
  } catch (error) {
    console.error("Error verifying mandal:", error);
    return { verified: false, message: "Verification service unavailable." };
  }
}
