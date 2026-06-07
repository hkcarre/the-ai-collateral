/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SharePreferenceType = 'completely-anonymous' | 'role-only' | 'public-alias';

export interface Story {
  id: string;
  title: string;
  originalText: string;
  anonymizedText: string;
  alias: string;
  sharePreference: SharePreferenceType;
  role: string | null;
  industry: string | null;
  dateSubmitted: string;
  companyName: string | null;
  issueOrigin: 'mobbing' | 'company-discrimination' | 'manager' | 'teammates' | null;
  category: string;
  isModerated: boolean;
  safetyStatus: 'approved' | 'needs-review' | 'flagged';
  summary: string;
  humanImpact: string;
  managementExcuse: string;
  severityIndex: number;
  extractedPatterns: string[];
  supportResponse: string;
  upvotes: number;
  tags: string[];
}

export interface ModerationResult {
  isSafe: boolean;
  anonymizedText: string;
  primaryCategory: string;
  severityIndex: number;
  extractedPatterns: string[];
  summary: string;
  humanImpact: string;
  managementExcuse: string;
  supportResponse: string;
}

export interface CategoryStructure {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
}
