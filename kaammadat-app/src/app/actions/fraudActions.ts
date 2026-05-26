"use server";
import { supabase } from '@/utils/supabase';

export async function getFraudReports() {
  try {
    const { data, error } = await supabase
      .from('fraud_reports')
      .select('*')
      .order('reported_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((r: any) => ({
      id: r.id,
      type: r.type,
      workerName: r.worker_name,
      workerEmail: r.worker_email,
      job: r.job,
      reason: r.reason,
      status: r.status,
      reportedAt: r.reported_at,
    }));
  } catch (error) {
    console.error('Error fetching fraud reports:', error);
    return [];
  }
}

export async function saveFraudReport(report: {
  workerName: string;
  workerEmail: string;
  jobTitle: string;
  reason: string;
}) {
  try {
    const { error } = await supabase
      .from('fraud_reports')
      .insert([{
        type: 'Fraud',
        worker_name: report.workerName,
        worker_email: report.workerEmail,
        job: report.jobTitle,
        reason: report.reason,
        status: 'Pending',
      }]);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error saving fraud report:', err);
    return { success: false, error: err.message };
  }
}
