
export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  cweId?: string;
  location?: string;
  impact: string;
  remediation: string;
  confidenceScore: number;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  target: string;
  type: 'Code' | 'Architecture' | 'Endpoint';
  status: 'Pending' | 'Completed' | 'Failed';
  vulnerabilities: Vulnerability[];
  summary: string;
}

export type ScanType = 'Code' | 'Architecture' | 'Endpoint';
