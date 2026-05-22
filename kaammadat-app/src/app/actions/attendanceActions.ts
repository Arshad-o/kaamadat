"use server";
import fs from 'fs';
import path from 'path';

const attendancePath = path.join(process.cwd(), 'attendance.json');

// Shape: { [jobId]: { totalSlots, confirmedWorkers: [{name, mobile, status: 'present'|'absent'|'pending'}], openSlots, location } }
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

function readAll(): Record<string, AttendanceRecord> {
  try {
    if (!fs.existsSync(attendancePath)) {
      fs.writeFileSync(attendancePath, JSON.stringify({}), 'utf-8');
      return {};
    }
    return JSON.parse(fs.readFileSync(attendancePath, 'utf-8'));
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, AttendanceRecord>) {
  fs.writeFileSync(attendancePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Get attendance for a specific job
export async function getAttendance(jobId: string): Promise<AttendanceRecord | null> {
  const all = readAll();
  return all[jobId] || null;
}

// Initialize attendance for a job (called by job giver from dashboard)
export async function initAttendance(jobId: string, jobTitle: string, location: string, totalSlots: number, date: string) {
  const all = readAll();
  if (!all[jobId]) {
    all[jobId] = {
      jobId,
      jobTitle,
      location,
      totalSlots,
      workers: [],
      openSlots: totalSlots,
      date,
    };
    writeAll(all);
  }
  return all[jobId];
}

// Add a worker to a job's attendance list
export async function addWorkerToJob(jobId: string, name: string, mobile: string) {
  const all = readAll();
  if (!all[jobId]) return { success: false, error: 'Job not found' };
  
  const record = all[jobId];
  
  // Check if already added
  if (record.workers.find(w => w.mobile === mobile)) {
    return { success: false, error: 'Worker already registered' };
  }
  
  // Check if slots available
  if (record.workers.filter(w => w.status !== 'absent').length >= record.totalSlots) {
    return { success: false, error: 'All slots are full' };
  }
  
  record.workers.push({ name, mobile, status: 'pending' });
  record.openSlots = record.totalSlots - record.workers.filter(w => w.status !== 'absent').length;
  writeAll(all);
  return { success: true };
}

// Mark worker present or absent
export async function markAttendance(jobId: string, mobile: string, status: 'present' | 'absent') {
  const all = readAll();
  if (!all[jobId]) return { success: false };
  
  const record = all[jobId];
  const worker = record.workers.find(w => w.mobile === mobile);
  if (worker) {
    worker.status = status;
  }
  
  // Recalculate open slots (absent workers free up slots)
  const activeWorkers = record.workers.filter(w => w.status !== 'absent').length;
  record.openSlots = Math.max(0, record.totalSlots - activeWorkers);
  
  writeAll(all);
  return { success: true, openSlots: record.openSlots };
}

// Get all jobs with open slots (for nearby worker notification)
export async function getOpenSlotJobs(workerLocation: string): Promise<AttendanceRecord[]> {
  const all = readAll();
  const open: AttendanceRecord[] = [];
  
  for (const record of Object.values(all)) {
    if (record.openSlots > 0) {
      // Simple location matching - check if location keywords overlap
      const workerParts = workerLocation.toLowerCase().split(',').map(s => s.trim());
      const jobParts = record.location.toLowerCase().split(',').map(s => s.trim());
      
      const isNearby = workerParts.some(wp => jobParts.some(jp => jp.includes(wp) || wp.includes(jp)));
      if (isNearby) {
        open.push(record);
      }
    }
  }
  
  return open;
}
