/**
 * Security Manager - Advanced Security Implementation
 * 安全管理器 - 高级安全实现
 *
 * @version 3.0.0
 * @author Sound Healing Team
 */

import type { ValidationError } from '@/types'

// ============================================================================
// Security Configuration
// ============================================================================

interface SecurityConfig {
  maxLoginAttempts: number
  lockoutDuration: number
  sessionTimeout: number
  allowedOrigins: string[]
  rateLimiting: {
    windowMs: number
    maxRequests: number
  }
  encryption: {
    algorithm: string
    keySize: number
    iterations: number
  }
}

const SECURITY_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  allowedOrigins: [
    'https://soundflows.app',
    'https://www.soundflows.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100
  },
  encryption: {
    algorithm: 'AES-GCM',
    keySize: 256,
    iterations: 100000
  }
}

// ============================================================================
// Security Manager Singleton
// ============================================================================

export class SecurityManager {
  private static instance: SecurityManager
  private failedLoginAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()
  private rateLimitTracker: Map<string, { count: number; windowStart: number }> = new Map()
  private csrfToken: string | null = null
  private encryptionKey: CryptoKey | null = null
  private isInitialized: boolean = false

  private constructor() {}

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager()
    }
    return SecurityManager.instance
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  public async initialize(): Promise<void> {
    if (this.isInitialized) return

    console.log('🔒 Initializing Security Manager...')

    try {
      // Initialize CSRF protection
      await this.initializeCSRFProtection()

      // Initialize encryption
      await this.initializeEncryption()

      // Setup security headers
      this.setupSecurityHeaders()

      // Cleanup expired security data
      this.startSecurityCleanup()

      this.isInitialized = true
      console.log('✅ Security Manager initialized successfully')

    } catch (error) {
      console.error('❌ Security Manager initialization failed:', error)
      throw new Error('Security initialization failed')
    }
  }

  // ============================================================================
  // CSRF Protection
  // ============================================================================

  private async initializeCSRFProtection(): Promise<void> {
    // Generate or retrieve CSRF token
    this.csrfToken = await this.generateCSRFToken()

    // Inject CSRF token into forms and AJAX requests
    this.injectCSRFToken()

    // Validate CSRF token on requests
    this.setupCSRFValidation()
  }

  private async generateCSRFToken(): Promise<string> {
    const token = this.generateSecureRandomString(32)
    sessionStorage.setItem('csrfToken', token)
    return token
  }

  private injectCSRFToken(): void {
    // Add CSRF token to all forms
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = 'csrf_token'
        input.value = this.csrfToken!
        form.appendChild(input)
      }
    })

    // Setup AJAX interceptor for CSRF token
    this.setupAjaxCSRFProtection()
  }

  private setupAjaxCSRFProtection(): void {
    // Override fetch to include CSRF token
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      if (init && init.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(init.method.toUpperCase())) {
        const headers = new Headers(init.headers)

        if (!headers.has('X-CSRF-Token') && this.csrfToken) {
          headers.set('X-CSRF-Token', this.csrfToken)
        }

        init.headers = headers
      }

      return originalFetch(input, init)
    }
  }

  private setupCSRFValidation(): void {
    // Server-side validation would happen here
    // Client-side we can validate token format
    this.validateCSRFTokenFormat()
  }

  private validateCSRFTokenFormat(): void {
    const token = sessionStorage.getItem('csrfToken')
    if (!token || !/^[a-zA-Z0-9+/]{32}$/.test(token)) {
      console.warn('⚠️ Invalid CSRF token format')
      this.csrfToken = this.generateSecureRandomString(32)
      sessionStorage.setItem('csrfToken', this.csrfToken)
    }
  }

  // ============================================================================
  // Encryption
  // ============================================================================

  private async initializeEncryption(): Promise<void> {
    if (!window.crypto || !window.crypto.subtle) {
      console.warn('⚠️ Web Crypto API not available')
      return
    }

    // Generate or retrieve encryption key
    const keyData = sessionStorage.getItem('encryptionKey')

    if (keyData) {
      this.encryptionKey = await this.importEncryptionKey(keyData)
    } else {
      this.encryptionKey = await this.generateEncryptionKey()
      const exportedKey = await this.exportEncryptionKey(this.encryptionKey)
      sessionStorage.setItem('encryptionKey', exportedKey)
    }
  }

  private async generateEncryptionKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: SECURITY_CONFIG.encryption.algorithm,
        length: SECURITY_CONFIG.encryption.keySize
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async importEncryptionKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyData)
    return await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: SECURITY_CONFIG.encryption.algorithm,
        length: SECURITY_CONFIG.encryption.keySize
      },
      true,
      ['encrypt', 'decrypt']
    )
  }

  private async exportEncryptionKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key)
    return this.arrayBufferToBase64(exported)
  }

  public async encrypt(data: string): Promise<{ encrypted: string; iv: string }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized')
    }

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: SECURITY_CONFIG.encryption.algorithm,
        iv
      },
      this.encryptionKey,
      dataBuffer
    )

    return {
      encrypted: this.arrayBufferToBase64(encrypted),
      iv: this.arrayBufferToBase64(iv)
    }
  }

  public async decrypt(encrypted: string, iv: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption not initialized')
    }

    const encryptedBuffer = this.base64ToArrayBuffer(encrypted)
    const ivBuffer = this.base64ToArrayBuffer(iv)

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: SECURITY_CONFIG.encryption.algorithm,
        iv: ivBuffer
      },
      this.encryptionKey,
      encryptedBuffer
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  // ============================================================================
  // Rate Limiting
  // ============================================================================

  public checkRateLimit(identifier: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now()
    const windowStart = now - SECURITY_CONFIG.rateLimiting.windowMs

    let tracker = this.rateLimitTracker.get(identifier)

    if (!tracker || tracker.windowStart < windowStart) {
      tracker = {
        count: 1,
        windowStart: now
      }
    } else {
      tracker.count++
    }

    this.rateLimitTracker.set(identifier, tracker)

    const allowed = tracker.count <= SECURITY_CONFIG.rateLimiting.maxRequests
    const resetTime = allowed ? undefined : tracker.windowStart + SECURITY_CONFIG.rateLimiting.windowMs

    if (!allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${identifier}`)
    }

    return { allowed, resetTime }
  }

  // ============================================================================
  // Login Protection
  // ============================================================================

  public checkLoginAttempts(identifier: string): { allowed: boolean; lockoutTime?: number } {
    const attempts = this.failedLoginAttempts.get(identifier)

    if (!attempts) {
      return { allowed: true }
    }

    const now = Date.now()
    const timeSinceLastAttempt = now - attempts.lastAttempt

    // Reset if lockout period has passed
    if (timeSinceLastAttempt > SECURITY_CONFIG.lockoutDuration) {
      this.failedLoginAttempts.delete(identifier)
      return { allowed: true }
    }

    // Check if locked out
    if (attempts.count >= SECURITY_CONFIG.maxLoginAttempts) {
      const lockoutTime = attempts.lastAttempt + SECURITY_CONFIG.lockoutDuration
      console.warn(`⚠️ Account locked for ${identifier} until ${new Date(lockoutTime).toLocaleString()}`)
      return { allowed: false, lockoutTime }
    }

    return { allowed: true }
  }

  public recordFailedLogin(identifier: string): void {
    const attempts = this.failedLoginAttempts.get(identifier) || {
      count: 0,
      lastAttempt: 0
    }

    attempts.count++
    attempts.lastAttempt = Date.now()

    this.failedLoginAttempts.set(identifier, attempts)

    console.warn(`⚠️ Failed login attempt ${attempts.count} for ${identifier}`)

    // Lock out if max attempts reached
    if (attempts.count >= SECURITY_CONFIG.maxLoginAttempts) {
      this.triggerSecurityAlert('brute_force_attempt', {
        identifier,
        attempts: attempts.count,
        timestamp: new Date().toISOString()
      })
    }
  }

  public clearFailedLogins(identifier: string): void {
    this.failedLoginAttempts.delete(identifier)
  }

  // ============================================================================
  // Input Validation
  // ============================================================================

  public validateInput(input: string, type: 'email' | 'password' | 'username' | 'general'): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    switch (type) {
      case 'email':
        if (!this.isValidEmail(input)) {
          errors.push('Invalid email format')
        }
        break

      case 'password':
        if (!this.isValidPassword(input)) {
          errors.push('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character')
        }
        break

      case 'username':
        if (!this.isValidUsername(input)) {
          errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores')
        }
        break

      case 'general':
        if (!this.isValidGeneralInput(input)) {
          errors.push('Input contains invalid characters')
        }
        break
    }

    return { valid: errors.length === 0, errors }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email) && email.length <= 254
  }

  private isValidPassword(password: string): boolean {
    // At least 8 characters, uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return passwordRegex.test(password) && password.length <= 128
  }

  private isValidUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  }

  private isValidGeneralInput(input: string): boolean {
    // Prevent XSS and injection attacks
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^>]*>/gi,
      /<object\b[^>]*>/gi,
      /<embed\b[^>]*>/gi
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  // ============================================================================
  // Content Security Policy
  // ============================================================================

  private setupSecurityHeaders(): void {
    // This would typically be done server-side, but we can add client-side checks
    this.validateCSP()
  }

  private validateCSP(): void {
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (!metaCSP) {
      console.warn('⚠️ No CSP meta tag found')
    }
  }

  // ============================================================================
  // Origin Validation
  // ============================================================================

  public validateOrigin(origin: string): boolean {
    return SECURITY_CONFIG.allowedOrigins.includes(origin)
  }

  // ============================================================================
  // Security Monitoring
  // ============================================================================

  private triggerSecurityAlert(type: string, details: any): void {
    console.error(`🚨 Security Alert: ${type}`, details)

    // Send to monitoring service
    this.sendSecurityAlert(type, details)

    // Update UI if needed
    this.handleSecurityAlert(type, details)
  }

  private sendSecurityAlert(type: string, details: any): void {
    if (this.isOnline()) {
      fetch('/api/security/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken || ''
        },
        body: JSON.stringify({
          type,
          details,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(error => {
        console.error('Failed to send security alert:', error)
      })
    }
  }

  private handleSecurityAlert(type: string, details: any): void {
    switch (type) {
      case 'brute_force_attempt':
        // Show security notification
        this.showSecurityNotification('Multiple failed login attempts detected. Account temporarily locked.')
        break

      case 'xss_attempt':
        // Show XSS warning
        this.showSecurityNotification('Security threat detected. Action blocked.')
        break

      case 'csrf_violation':
        // Show CSRF warning
        this.showSecurityNotification('Invalid request detected. Please refresh the page.')
        break
    }
  }

  private showSecurityNotification(message: string): void {
    // Use the UI store to show notification
    if (window.useUIStore) {
      const uiStore = window.useUIStore()
      uiStore.addNotification({
        type: 'error',
        title: 'Security Alert',
        message,
        duration: 10000
      })
    } else {
      alert(message)
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateSecureRandomString(length: number): string {
    const array = new Uint8Array(length)
    window.crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  private isOnline(): boolean {
    return navigator.onLine
  }

  private startSecurityCleanup(): void {
    // Clean up expired rate limiting and login attempt data every 5 minutes
    setInterval(() => {
      this.cleanupExpiredData()
    }, 5 * 60 * 1000)
  }

  private cleanupExpiredData(): void {
    const now = Date.now()

    // Clean up expired rate limit trackers
    for (const [key, tracker] of this.rateLimitTracker.entries()) {
      if (now - tracker.windowStart > SECURITY_CONFIG.rateLimiting.windowMs) {
        this.rateLimitTracker.delete(key)
      }
    }

    // Clean up expired login attempt trackers
    for (const [key, attempts] of this.failedLoginAttempts.entries()) {
      if (now - attempts.lastAttempt > SECURITY_CONFIG.lockoutDuration) {
        this.failedLoginAttempts.delete(key)
      }
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  public getSecurityConfig(): SecurityConfig {
    return { ...SECURITY_CONFIG }
  }

  public isSecureConnection(): boolean {
    return location.protocol === 'https:' || location.hostname === 'localhost'
  }

  public validateSecurityHeaders(): { valid: boolean; missing: string[] } {
    const requiredHeaders = [
      'X-Content-Type-Options',
      'X-Frame-Options',
      'X-XSS-Protection',
      'Referrer-Policy'
    ]

    const missing: string[] = []

    // This would typically be checked server-side
    // Client-side we can check if we're on HTTPS
    if (!this.isSecureConnection()) {
      missing.push('HTTPS')
    }

    return { valid: missing.length === 0, missing }
  }

  public cleanup(): void {
    this.failedLoginAttempts.clear()
    this.rateLimitTracker.clear()
    this.csrfToken = null
    this.encryptionKey = null
    sessionStorage.removeItem('csrfToken')
    sessionStorage.removeItem('encryptionKey')
    this.isInitialized = false
  }
}

// ============================================================================
// Vue Composable
// ============================================================================

export const useSecurityManager = () => {
  const securityManager = SecurityManager.getInstance()

  return {
    securityManager,
    validateInput: (input: string, type: Parameters<typeof securityManager.validateInput>[1]) =>
      securityManager.validateInput(input, type),
    checkRateLimit: (identifier: string) =>
      securityManager.checkRateLimit(identifier),
    checkLoginAttempts: (identifier: string) =>
      securityManager.checkLoginAttempts(identifier),
    recordFailedLogin: (identifier: string) =>
      securityManager.recordFailedLogin(identifier),
    encrypt: (data: string) =>
      securityManager.encrypt(data),
    decrypt: (encrypted: string, iv: string) =>
      securityManager.decrypt(encrypted, iv),
    validateOrigin: (origin: string) =>
      securityManager.validateOrigin(origin),
    isSecureConnection: () =>
      securityManager.isSecureConnection()
  }
}

export default SecurityManager