"use server";
import { supabase } from '@/utils/supabase';

export type WorkerEntry = {
  name: string;
  mobile: string;
  status: 'present' | 'absent' | 'pending';
};

export type AttendanceRecord = {
  jobId: string;
  jobTitle: string;
  location: string;
  totalSlots: number;
  workers: WorkerEntry[];
  openSlots: number;
  date: string;
};

function mapRecord(row: any): AttendanceRecord {
  return {
    jobId: row.job_id,
    jobTitle: row.job_title,
    location: row.location,
    totalSlots: row.total_slots,
    openSlots: row.open_slots,
    date: row.date,
    workers: row.workers || [],
  };
}

// Get attendance for a specific job
export async function getAttendance(jobId: string): Promise<AttendanceRecord | null> {
  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('job_id', jobId)
      .single();
    if (error || !data) return null;
    return mapRecord(data);
  } catch {
    return null;
  }
}

// Initialize attendance for a job (called by job giver from dashboard)
export async function initAttendance(
  jobId: string,
  jobTitle: string,
  location: string,
  totalSlots: number,
  date: string
) {
  try {
    // Check if already exists
    const { data: existing } = await supabase
      .from('attendance')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (existing) return mapRecord(existing);

    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        job_id: jobId,
        job_title: jobTitle,
        location,
        total_slots: totalSlots,
        open_slots: totalSlots,
        date,
        workers: [],
      }])
      .select()
      .single();

    if (error) throw error;
    return mapRecord(data);
  } catch (error) {
    console.error('Error initializing attendance:', error);
    return null;
  }
}

// Add a worker to a job's attendance list
export async function addWorkerToJob(jobId: string, name: string, mobile: string) {
  try {
    const { data: row, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error || !row) return { success: false, error: 'Job not found' };

    const workers: WorkerEntry[] = row.workers || [];

    if (workers.find(w => w.mobile === mobile)) {
      return { success: false, error: 'Worker already registered' };
    }

    const activeCount = workers.filter(w => w.status !== 'absent').length;
    if (activeCount >= row.total_slots) {
      return { success: false, error: 'All slots are full' };
    }

    workers.push({ name, mobile, status: 'pending' });
    const openSlots = row.total_slots - workers.filter(w => w.status !== 'absent').length;

    const { error: updateError } = await supabase
      .from('attendance')
      .update({ workers, open_slots: openSlots })
      .eq('job_id', jobId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Mark worker present or absent
export async function markAttendance(jobId: string, mobile: string, status: 'present' | 'absent') {
  try {
    const { data: row, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (error || !row) return { success: false };

    const workers: WorkerEntry[] = row.workers || [];
    const worker = workers.find(w => w.mobile === mobile);
    if (worker) worker.status = status;

    const activeWorkers = workers.filter(w => w.status !== 'absent').length;
    const openSlots = Math.max(0, row.total_slots - activeWorkers);

    const { error: updateError } = await supabase
      .from('attendance')
      .update({ workers, open_slots: openSlots })
      .eq('job_id', jobId);

    if (updateError) throw updateError;
    return { success: true, openSlots };
  } catch (error: any) {
    return { success: false };
  }
}

// Get all jobs with open slots (for nearby worker notification)
export async function getOpenSlotJobs(workerLocation: string): Promise<AttendanceRecord[]> {
  try {
    const { data: rows, error } = await supabase
      .from('attendance')
      .select('*')
      .gt('open_slots', 0);

    if (error || !rows) return [];

    const workerParts = workerLocation.toLowerCase().split(',').map(s => s.trim());
    return rows
      .filter(row => {
        const jobParts = (row.location || '').toLowerCase().split(',').map((s: string) => s.trim());
        return workerParts.some(wp => jobParts.some((jp: string) => jp.includes(wp) || wp.includes(jp)));
      })
      .map(mapRecord);
  } catch {
    return [];
  }
}
