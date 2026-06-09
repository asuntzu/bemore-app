/**
 * Be More Inc. API client
 *
 * Centralises all HTTP calls so:
 *  - The API base URL is configured in one place (.env VITE_API_BASE_URL)
 *  - Every response is fully typed — no `any`
 *  - Network/server errors surface as typed ApiError, never raw fetch errors
 */

const BASE = import.meta.env['VITE_API_BASE_URL'] ?? '/api';

// ─── Error type ─────────────────────────────────────────────────────────────

export interface ValidationIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly issues: ValidationIssue[] | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    issues?: ValidationIssue[],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
  } catch {
    // Network failure (offline, DNS, CORS preflight rejected, etc.)
    throw new ApiError(0, 'NETWORK_ERROR', 'Unable to reach the server. Please check your connection.');
  }

  if (!res.ok) {
    let body: { error?: string; code?: string; issues?: ValidationIssue[] } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // Non-JSON error body — use status text
    }
    throw new ApiError(
      res.status,
      body.code ?? 'UNKNOWN_ERROR',
      body.error ?? res.statusText,
      body.issues,
    );
  }

  return res.json() as Promise<T>;
}

// ─── Request / response types ────────────────────────────────────────────────

export interface FeedbackRequest {
  storefront_id: string;
  category: string;
  business_type: string;
  why: string;
  email?: string;
  language: 'en' | 'es';
}

export interface FeedbackResponse {
  success: true;
  message: string;
  feedback_id: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}

// ─── API methods ─────────────────────────────────────────────────────────────

/**
 * POST /api/feedback
 * Submit community feedback for a storefront.
 */
export function submitFeedback(data: FeedbackRequest): Promise<FeedbackResponse> {
  return request<FeedbackResponse>('/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * GET /api/health
 * Liveness check — call on app init to confirm API is reachable.
 */
export function checkHealth(): Promise<HealthResponse> {
  return request<HealthResponse>('/health', { method: 'GET' });
}
