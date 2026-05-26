"use server";
import { supabase } from '@/utils/supabase';

export async function adminGetAnalytics() {
  try {
    // Fetch users for registration timeline
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('created_at, role');
    
    // Fetch jobs for job posting timeline
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('created_at');
      
    // Fetch attendance for attendance stats
    const { data: attendance, error: attError } = await supabase
      .from('attendance')
      .select('date, total_slots, open_slots, workers');

    if (userError || jobError || attError) {
      console.error("Error fetching analytics", userError, jobError, attError);
      return null;
    }

    return {
      users: users || [],
      jobs: jobs || [],
      attendance: attendance || []
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return null;
  }
}
