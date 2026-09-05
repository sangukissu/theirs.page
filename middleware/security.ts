import { NextRequest, NextResponse } from 'next/server'

/**
 * Security middleware for additional runtime security checks
 */
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()

  // Force HTTPS in production
  // Use the public request URL instead of x-forwarded-proto. OpenNext may use
  // an HTTP hop internally even when the visitor connected over HTTPS.
  if (process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'http:') {
    const httpsUrl = request.nextUrl.clone()
    httpsUrl.protocol = 'https:'
    return NextResponse.redirect(httpsUrl, 301)
  }

  // Add standard security headers at runtime
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=(self)')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('X-Download-Options', 'noopen')

  return response
}

/**
 * Validate request origin for state-changing operations (CSRF mitigation)
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')

  // Modern browsers provide Fetch Metadata even when Origin is absent.
  if (fetchSite === 'cross-site') return false

  // Direct navigation / internal server calls without origin header
  if (!origin) return true

  try {
    const originUrl = new URL(origin)
    const allowedOrigins = process.env.NODE_ENV === 'production'
      ? ['https://theirs.page', 'https://www.theirs.page']
      : [request.nextUrl.origin, 'http://localhost:3000', 'http://127.0.0.1:3000']

    return allowedOrigins.includes(originUrl.origin)
  } catch {
    return false
  }
}

/**
 * Detect common vulnerability scanner probes, hidden dotfiles, and path traversal
 */
export function isMaliciousProbe(pathname: string): boolean {
  const lower = pathname.toLowerCase()

  // Path traversal
  if (lower.includes('..') || lower.includes('%2e%2e')) {
    return true
  }

  // Sensitive hidden files & directories
  if (
    lower.includes('/.env') ||
    lower.includes('/.git') ||
    lower.includes('/.aws') ||
    lower.includes('/.ds_store') ||
    lower.includes('/.config')
  ) {
    return true
  }

  // Common PHP / CMS attack patterns
  if (
    lower.endsWith('.php') ||
    lower.includes('/wp-admin') ||
    lower.includes('/wp-content') ||
    lower.includes('/wp-includes') ||
    lower.includes('/xmlrpc.php') ||
    lower.includes('/actuator') ||
    lower.includes('/cgi-bin') ||
    lower.includes('/shell')
  ) {
    return true
  }

  return false
}

/**
 * Detect aggressive, zero-ROI scraping bots that inflate serverless bills
 */
export function isZeroRoiScraper(userAgent: string): boolean {
  if (!userAgent) return false
  const blockedScrapers = /bytespider|diffbot|imagesiftbot/i
  return blockedScrapers.test(userAgent)
}

/**
 * Check for suspicious request patterns on sensitive API routes
 */
export function detectSuspiciousActivity(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || ''

  // Reject missing user-agent on API routes
  if (!userAgent.trim()) {
    return true
  }

  // Flag known automated exploitation or scraping signatures
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /acunetix/i,
    /nessus/i,
    /dirbuster/i,
    /gobuster/i,
    /wpscan/i,
    /masscan/i,
    /zgrab/i,
  ]

  return suspiciousPatterns.some(pattern => pattern.test(userAgent))
}

/**
 * Sanitize file upload paths
 */
export function sanitizeFilePath(filename: string): string {
  // Remove directory traversal attempts
  const sanitized = filename
    .replace(/\.\./g, '') // Remove ..
    .replace(/\//g, '') // Remove forward slashes
    .replace(/\\/g, '') // Remove backslashes
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .trim()
  
  // Ensure filename is not empty and has reasonable length
  if (!sanitized || sanitized.length > 255) {
    throw new Error('Invalid filename')
  }
  
  return sanitized
}

/**
 * Generate secure random tokens
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  if (!Number.isSafeInteger(length) || length < 1 || length > 1024) {
    throw new Error('Invalid token length')
  }
  const random = new Uint8Array(length)
  crypto.getRandomValues(random)
  let result = ''

  for (let i = 0; i < length; i++) {
    result += chars.charAt(random[i] % chars.length)
  }

  return result
}
