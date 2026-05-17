"use server";
import fs from 'fs';
import path from 'path';

const fraudFilePath = path.join(process.cwd(), 'fraud_reports.json');

export async function getFraudReports() {
  try {
    if (!fs.existsSync(fraudFilePath)) return [];
    const data = fs.readFileSync(fraudFilePath, 'utf8');
    return JSON.parse(data);
  } catch {
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
    let reports: any[] = [];
    if (fs.existsSync(fraudFilePath)) {
      const data = fs.readFileSync(fraudFilePath, 'utf8');
      reports = JSON.parse(data);
    }
    reports.push({
      id: Date.now(),
      type: 'Fraud',
      workerName: report.workerName,
      workerEmail: report.workerEmail,
      job: report.jobTitle,
      reason: report.reason,
      status: 'Pending',
      reportedAt: new Date().toISOString(),
    });
    fs.writeFileSync(fraudFilePath, JSON.stringify(reports, null, 2), 'utf8');
    return { success: true };
  } catch (err: any) {
    console.error('Error saving fraud report:', err);
    return { success: false, error: err.message };
  }
}
