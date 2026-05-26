"use server";
import { revalidatePath } from 'next/cache';
import { supabase } from '@/utils/supabase';

// Helper to map Supabase job row to frontend expected format
function mapJob(j: any) {
  if (!j) return null;
  return {
    id: j.id,
    title: j.title,
    giver: j.employer_name || 'Unknown',
    location: j.location,
    date: j.date_range,
    salary: j.daily_wage,
    type: j.job_type,
    img: j.image_url,
    cap: j.capacity_string,
    isFull: j.is_full,
    lat: j.lat,
    lng: j.lng
  };
}

export async function getJobs() {
  try {
    // Fetch jobs descending (newest first)
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return (jobs || []).map(mapJob);
  } catch (error) {
    console.error("Error fetching jobs from Supabase:", error);
    return [];
  }
}

export async function postJob(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const capacity = formData.get('capacity') as string;
    const location = formData.get('location') as string;
    const salary = formData.get('salary') as string;
    const date = `${formData.get('startDate')} - ${formData.get('endDate')}`;
    const giverName = (formData.get('giverName') as string) || 'Unknown';
    
    // Default image logic
    const titleLower = title.toLowerCase().trim();
    let img = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop';
    if (titleLower.includes('electrician') || titleLower.includes('wire') || titleLower.includes('light')) img = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop';
    else if (titleLower.includes('carpenter') || titleLower.includes('wood') || titleLower.includes('furniture')) img = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=150&h=150&fit=crop';
    else if (titleLower.includes('catering') || titleLower.includes('boy') || titleLower.includes('cook') || titleLower.includes('chef') || titleLower.includes('food') || titleLower.includes('waiter')) img = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=150&h=150&fit=crop';
    else if (titleLower.includes('mechanic') || titleLower.includes('bike') || titleLower.includes('car') || titleLower.includes('repair') || titleLower.includes('garage')) img = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&h=150&fit=crop';
    else if (titleLower.includes('plumber') || titleLower.includes('pipe') || titleLower.includes('tap') || titleLower.includes('leak')) img = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=150&h=150&fit=crop';
    else if (titleLower.includes('paint') || titleLower.includes('wall') || titleLower.includes('brush')) img = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&h=150&fit=crop';
    else if (titleLower.includes('cleaner') || titleLower.includes('cleaning') || titleLower.includes('sweep') || titleLower.includes('dust')) img = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&h=150&fit=crop';
    else if (titleLower.includes('garden') || titleLower.includes('plant') || titleLower.includes('farmer') || titleLower.includes('agriculture')) img = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop';
    
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : 34.0836;
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : 74.7973;
    
    const capacityNum = parseInt(capacity) || 0;

    const { error } = await supabase.from('jobs').insert([{
      title: title,
      employer_name: giverName,
      location: location,
      daily_wage: parseInt(salary) || 0,
      slots_available: capacityNum,
      date_range: date,
      job_type: title,
      image_url: img,
      capacity_string: `0/${capacity} Slots`,
      is_full: false,
      lat: lat,
      lng: lng
    }]);

    if (error) {
      console.error("Supabase insert job error:", error);
      throw error;
    }
    
    // Tell Next.js to update any pages that show jobs
    revalidatePath('/worker/search');
    revalidatePath('/job-giver/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("Error saving job:", error);
    return { success: false };
  }
}
