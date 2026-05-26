"use server";
import { supabase } from '@/utils/supabase';

// Get all custom mandals from Supabase
export async function getCustomMandals(): Promise<Record<string, string[]>> {
  try {
    const { data, error } = await supabase
      .from('custom_mandals')
      .select('district, mandal');

    if (error || !data) return {};

    // Group by district
    const result: Record<string, string[]> = {};
    for (const row of data) {
      if (!result[row.district]) result[row.district] = [];
      result[row.district].push(row.mandal);
    }
    return result;
  } catch (error) {
    console.error("Error reading custom mandals:", error);
    return {};
  }
}

// Add a custom mandal
export async function addCustomMandal(district: string, mandal: string) {
  try {
    const { error } = await supabase
      .from('custom_mandals')
      .insert([{ district, mandal }]);

    // Ignore duplicate key errors (already exists)
    if (error && !error.message.includes('duplicate')) throw error;
    return true;
  } catch (error) {
    console.error("Error adding custom mandal:", error);
    return false;
  }
}

// Verify mandal via Wikipedia API
export async function verifyMandalInternet(district: string, mandal: string): Promise<{ verified: boolean, message: string }> {
  try {
    const query = encodeURIComponent(`${mandal} ${district}`);
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${query}&utf8=&format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      return { verified: false, message: "Network error during verification." };
    }

    const data = await response.json();
    if (data.query && data.query.search && data.query.search.length > 0) {
      return { verified: true, message: "Verified successfully on Wikipedia." };
    } else {
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
