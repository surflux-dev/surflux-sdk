/**
 * Base error class for all Surflux SDK errors
 */
export class SurfluxError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'SurfluxError';
    Object.setPrototypeOf(this, SurfluxError.prototype);
  }
}

/**
 * Error thrown when API requests fail
 */
export class SurfluxAPIError extends SurfluxError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly statusText?: string,
    public readonly url?: string
  ) {
    super(message, 'API_ERROR');
    this.name = 'SurfluxAPIError';
    Object.setPrototypeOf(this, SurfluxAPIError.prototype);
  }
}

/**
 * Error thrown when authentication fails (invalid or missing API key)
 */
export class SurfluxAuthenticationError extends SurfluxAPIError {
  constructor(message: string = 'Invalid or missing API key', url?: string) {
    super(message, 401, 'Unauthorized', url);
    this.name = 'SurfluxAuthenticationError';
    Object.setPrototypeOf(this, SurfluxAuthenticationError.prototype);
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class SurfluxRateLimitError extends SurfluxAPIError {
  constructor(message: string = 'Rate limit exceeded', url?: string) {
    super(message, 429, 'Too Many Requests', url);
    this.name = 'SurfluxRateLimitError';
    Object.setPrototypeOf(this, SurfluxRateLimitError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class SurfluxNotFoundError extends SurfluxAPIError {
  constructor(message: string = 'Resource not found', url?: string) {
    super(message, 404, 'Not Found', url);
    this.name = 'SurfluxNotFoundError';
    Object.setPrototypeOf(this, SurfluxNotFoundError.prototype);
  }
}

/**
 * Error thrown when there are network connectivity issues
 */
export class SurfluxNetworkError extends SurfluxError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'SurfluxNetworkError';
    Object.setPrototypeOf(this, SurfluxNetworkError.prototype);
  }
}

/**
 * Error thrown when a request times out
 */
export class SurfluxTimeoutError extends SurfluxNetworkError {
  constructor(message: string = 'Request timeout', originalError?: Error) {
    super(message, originalError);
    this.name = 'SurfluxTimeoutError';
    Object.setPrototypeOf(this, SurfluxTimeoutError.prototype);
  }
}

/**
 * Error thrown when event stream connection fails
 */
export class SurfluxStreamError extends SurfluxError {
  constructor(message: string, public readonly originalError?: Error) {
    super(message, 'STREAM_ERROR');
    this.name = 'SurfluxStreamError';
    Object.setPrototypeOf(this, SurfluxStreamError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class SurfluxValidationError extends SurfluxError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'SurfluxValidationError';
    Object.setPrototypeOf(this, SurfluxValidationError.prototype);
  }
}
