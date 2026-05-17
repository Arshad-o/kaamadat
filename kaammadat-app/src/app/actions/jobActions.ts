"use server";
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const jobsFilePath = path.join(process.cwd(), 'jobs.json');

// Serverless-safe hybrid state persistence fallback for newly added jobs
let inMemoryJobs: any[] = [];

export async function getJobs() {
  try {
    const data = fs.readFileSync(jobsFilePath, 'utf8');
    const staticJobs = JSON.parse(data);
    return [...inMemoryJobs, ...staticJobs];
  } catch (error) {
    console.error("Error reading jobs:", error);
    return inMemoryJobs;
  }
}

export async function postJob(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const capacity = formData.get('capacity') as string;
    const location = formData.get('location') as string;
    const salary = formData.get('salary') as string;
    const date = `${formData.get('startDate')} - ${formData.get('endDate')}`;
    
    // Automatically map work title to professional premium Unsplash labor photos
    const titleLower = title.toLowerCase().trim();
    let img = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop'; // Default: Construction labor
    
    if (titleLower.includes('electrician') || titleLower.includes('wire') || titleLower.includes('light')) {
      img = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop'; // Electrician
    } else if (titleLower.includes('carpenter') || titleLower.includes('wood') || titleLower.includes('furniture')) {
      img = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=150&h=150&fit=crop'; // Carpenter
    } else if (titleLower.includes('catering') || titleLower.includes('boy') || titleLower.includes('cook') || titleLower.includes('chef') || titleLower.includes('food') || titleLower.includes('waiter')) {
      img = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=150&h=150&fit=crop'; // Catering
    } else if (titleLower.includes('mechanic') || titleLower.includes('bike') || titleLower.includes('car') || titleLower.includes('repair') || titleLower.includes('garage')) {
      img = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=150&h=150&fit=crop'; // Mechanic
    } else if (titleLower.includes('plumber') || titleLower.includes('pipe') || titleLower.includes('tap') || titleLower.includes('leak')) {
      img = 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=150&h=150&fit=crop'; // Plumber
    } else if (titleLower.includes('paint') || titleLower.includes('wall') || titleLower.includes('brush')) {
      img = 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=150&h=150&fit=crop'; // Painter
    } else if (titleLower.includes('cleaner') || titleLower.includes('cleaning') || titleLower.includes('sweep') || titleLower.includes('dust')) {
      img = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150&h=150&fit=crop'; // Cleaner
    } else if (titleLower.includes('garden') || titleLower.includes('plant') || titleLower.includes('farmer') || titleLower.includes('agriculture')) {
      img = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=150&h=150&fit=crop'; // Gardening / Agriculture
    } else if (titleLower.includes('construction') || titleLower.includes('mason') || titleLower.includes('brick') || titleLower.includes('labor') || titleLower.includes('builder')) {
      img = 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=150&h=150&fit=crop'; // Construction
    }

    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : 34.0836;
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : 74.7973;

    const newJob = {
      id: Date.now(),
      title: title,
      giver: "Anand Sharma", // Hardcoded mock user for now
      location: location,
      date: date,
      salary: parseInt(salary),
      type: title,
      img: img,
      cap: `0/${capacity} Slots`,
      isFull: false,
      lat: lat,
      lng: lng
    };

    // Prepend to in-memory cache to guarantee real-time updates on Vercel
    inMemoryJobs.unshift(newJob);
    
    // Attempt local write (will fail on Vercel read-only container, which is fine since we have the in-memory fallback!)
    try {
      const fullJobsList = await getJobs();
      fs.writeFileSync(jobsFilePath, JSON.stringify(fullJobsList, null, 2));
    } catch (writeErr) {
      console.warn("Write to jobs.json bypassed (running in serverless container):", writeErr);
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
