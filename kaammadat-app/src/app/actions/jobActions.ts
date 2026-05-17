"use server";
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';

const jobsFilePath = path.join(process.cwd(), 'jobs.json');

export async function getJobs() {
  try {
    const data = fs.readFileSync(jobsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading jobs:", error);
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
    
    // Assign generic images based on category
    let img = 'https://images.unsplash.com/photo-1541888081622-1bc81d43a6d1?w=150&h=150&fit=crop';
    if(title === 'Electrician') img = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=150&h=150&fit=crop';
    if(title === 'Carpenter') img = 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=150&h=150&fit=crop';
    if(title === 'Catering Boys') img = 'https://images.unsplash.com/photo-1555244162-803834f70033?w=150&h=150&fit=crop';

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

    const jobs = await getJobs();
    jobs.unshift(newJob); // Add to top of list
    
    fs.writeFileSync(jobsFilePath, JSON.stringify(jobs, null, 2));
    
    // Tell Next.js to update any pages that show jobs
    revalidatePath('/worker/search');
    revalidatePath('/job-giver/dashboard');
    
    return { success: true };
  } catch (error) {
    console.error("Error saving job:", error);
    return { success: false };
  }
}
