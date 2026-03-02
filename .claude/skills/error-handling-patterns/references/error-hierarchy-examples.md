# Error Hierarchy Examples

Complete, production-ready error class hierarchies for TypeScript and Python. These are reference implementations, not templates — copy and adapt them.

---

## TypeScript: Full Application Error Hierarchy

```typescript
// ============================================================================
// Base Error
// ============================================================================

/**
 * All application errors extend AppError.
 * isOperational: true  = expected failure, log and handle
 * isOperational: false = programming error, crash the process
 */
export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    isOperational = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
    };
  }
}

// ============================================================================
// HTTP / API Errors
// ============================================================================

export class BadRequestError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'BAD_REQUEST', 400, true, context);
  }
}

export class ValidationError extends AppError {
  readonly fields: Record<string, string[]>;

  constructor(fields: Record<string, string[]>, message = 'Validation failed') {
    super(message, 'VALIDATION_ERROR', 422, true);
    this.fields = fields;
  }

  toJSON() {
    return { ...super.toJSON(), fields: this.fields };
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, { resource, identifier });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'CONFLICT', 409, true, context);
  }
}

export class RateLimitError extends AppError {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number, message = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT', 429, true, { retryAfterMs });
    this.retryAfterMs = retryAfterMs;
  }
}

// ============================================================================
// Infrastructure Errors
// ============================================================================

export class DatabaseError extends AppError {
  readonly operation: string;

  constructor(operation: string, cause?: Error) {
    super(`Database error during ${operation}`, 'DATABASE_ERROR', 503, true, { operation });
    this.operation = operation;
    if (cause) this.cause = cause;
  }
}

export class NetworkError extends AppError {
  readonly endpoint: string;

  constructor(endpoint: string, cause?: Error) {
    super(`Network error reaching ${endpoint}`, 'NETWORK_ERROR', 503, true, { endpoint });
    this.endpoint = endpoint;
    if (cause) this.cause = cause;
  }
}

export class TimeoutError extends AppError {
  readonly timeoutMs: number;

  constructor(operation: string, timeoutMs: number) {
    super(`${operation} timed out after ${timeoutMs}ms`, 'TIMEOUT', 504, true, { operation, timeoutMs });
    this.timeoutMs = timeoutMs;
  }
}

export class CircuitOpenError extends AppError {
  constructor(service: string) {
    super(`Circuit breaker OPEN for ${service}`, 'CIRCUIT_OPEN', 503, true, { service });
  }
}

// ============================================================================
// Business Logic Errors
// ============================================================================

export class InsufficientFundsError extends AppError {
  readonly required: number;
  readonly available: number;

  constructor(required: number, available: number, currency = 'USD') {
    super(
      `Insufficient funds: required ${required} ${currency}, available ${available} ${currency}`,
      'INSUFFICIENT_FUNDS',
      402,
      true,
      { required, available, currency }
    );
    this.required = required;
    this.available = available;
  }
}

export class FeatureNotAvailableError extends AppError {
  constructor(feature: string, requiredPlan: string) {
    super(
      `${feature} requires ${requiredPlan} plan`,
      'FEATURE_NOT_AVAILABLE',
      403,
      true,
      { feature, requiredPlan }
    );
  }
}

// ============================================================================
// Type guards
// ============================================================================

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

export function isOperationalError(e: unknown): boolean {
  if (isAppError(e)) return e.isOperational;
  return false; // unknown errors are non-operational by default
}
```

---

## TypeScript: Express Error Handler

```typescript
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.headers['x-request-id'] as string;

  if (err instanceof AppError) {
    // Expected operational error — log at warn, return structured response
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      context: err.context,
      requestId,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { fields: err.fields }),
        requestId,
      },
    });
  }

  // Unexpected error — log full stack, do not leak internals
  logger.error('Unexpected error', {
    error: err instanceof Error ? {
      message: err.message,
      stack: err.stack,
      name: err.name,
    } : String(err),
    requestId,
    path: req.path,
    method: req.method,
  });

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      requestId,
    },
  });
}
```

---

## TypeScript: Result Type with Utilities

```typescript
// ============================================================================
// Result type — for operations where failure is an expected outcome
// ============================================================================

export type Result<T, E extends Error = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E extends Error>(error: E): Result<never, E> => ({ ok: false, error });

// Async variant
export type AsyncResult<T, E extends Error = AppError> = Promise<Result<T, E>>;

// Map over success value (like Array.map but for Result)
export function mapResult<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => U
): Result<U, E> {
  if (result.ok) return ok(fn(result.value));
  return result;
}

// Flat map for chaining Result-returning operations
export async function flatMapResult<T, U, E extends Error>(
  result: Result<T, E>,
  fn: (value: T) => Promise<Result<U, E>>
): Promise<Result<U, E>> {
  if (!result.ok) return result;
  return fn(result.value);
}

// Unwrap or throw (use at boundaries where you've already handled errors)
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error;
}

// Convert exception-throwing function to Result-returning function
export async function tryCatch<T>(
  fn: () => Promise<T>,
  mapError?: (e: unknown) => AppError
): AsyncResult<T> {
  try {
    return ok(await fn());
  } catch (e) {
    const mapped = mapError ? mapError(e) : toAppError(e);
    return err(mapped);
  }
}

function toAppError(e: unknown): AppError {
  if (e instanceof AppError) return e;
  if (e instanceof Error) return new AppError(e.message, 'UNKNOWN', 500, false);
  return new AppError(String(e), 'UNKNOWN', 500, false);
}
```

---

## Python: Full Application Error Hierarchy

```python
from __future__ import annotations
from typing import Any, Optional
import logging

logger = logging.getLogger(__name__)


class AppError(Exception):
    """
    Base error for all application errors.

    is_operational=True  → expected failure; log and handle gracefully
    is_operational=False → programming error; crash and alert
    """

    def __init__(
        self,
        message: str,
        code: str,
        status: int = 500,
        is_operational: bool = True,
        context: Optional[dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status = status
        self.is_operational = is_operational
        self.context = context or {}

    def to_dict(self) -> dict[str, Any]:
        return {
            "type": self.__class__.__name__,
            "code": self.code,
            "message": str(self),
            "status": self.status,
            "context": self.context,
        }

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(code={self.code!r}, message={str(self)!r})"


# ============================================================================
# HTTP / API Errors
# ============================================================================

class BadRequestError(AppError):
    def __init__(self, message: str, context: Optional[dict] = None) -> None:
        super().__init__(message, "BAD_REQUEST", 400, context=context)


class ValidationError(AppError):
    def __init__(self, fields: dict[str, list[str]], message: str = "Validation failed") -> None:
        super().__init__(message, "VALIDATION_ERROR", 422)
        self.fields = fields

    def to_dict(self) -> dict[str, Any]:
        return {**super().to_dict(), "fields": self.fields}


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Authentication required") -> None:
        super().__init__(message, "UNAUTHORIZED", 401)


class ForbiddenError(AppError):
    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message, "FORBIDDEN", 403)


class NotFoundError(AppError):
    def __init__(self, resource: str, identifier: Any = None) -> None:
        message = f"{resource} '{identifier}' not found" if identifier else f"{resource} not found"
        super().__init__(message, "NOT_FOUND", 404, context={"resource": resource, "identifier": identifier})


class RateLimitError(AppError):
    def __init__(self, retry_after_ms: int, message: str = "Rate limit exceeded") -> None:
        super().__init__(message, "RATE_LIMIT", 429, context={"retry_after_ms": retry_after_ms})
        self.retry_after_ms = retry_after_ms


# ============================================================================
# Infrastructure Errors
# ============================================================================

class DatabaseError(AppError):
    def __init__(self, operation: str, cause: Optional[Exception] = None) -> None:
        super().__init__(
            f"Database error during {operation}",
            "DATABASE_ERROR",
            503,
            context={"operation": operation},
        )
        if cause:
            self.__cause__ = cause  # preserves traceback chain


class NetworkError(AppError):
    def __init__(self, endpoint: str, cause: Optional[Exception] = None) -> None:
        super().__init__(
            f"Network error reaching {endpoint}",
            "NETWORK_ERROR",
            503,
            context={"endpoint": endpoint},
        )
        if cause:
            self.__cause__ = cause


class TimeoutError(AppError):
    def __init__(self, operation: str, timeout_ms: int) -> None:
        super().__init__(
            f"{operation} timed out after {timeout_ms}ms",
            "TIMEOUT",
            504,
            context={"operation": operation, "timeout_ms": timeout_ms},
        )
        self.timeout_ms = timeout_ms


# ============================================================================
# Python Exception Chaining Best Practices
# ============================================================================

# CORRECT: use 'from' to preserve the causal chain
def fetch_user(user_id: str) -> dict:
    try:
        return db.execute("SELECT * FROM users WHERE id = %s", [user_id]).fetchone()
    except psycopg2.OperationalError as e:
        raise DatabaseError("user_fetch", e) from e  # ← explicit chain

# WRONG: this hides the original exception context
def fetch_user_bad(user_id: str) -> dict:
    try:
        return db.execute("SELECT * FROM users WHERE id = %s", [user_id]).fetchone()
    except psycopg2.OperationalError:
        raise DatabaseError("user_fetch")  # ← original traceback lost

# When re-raising to suppress context (intentional suppression):
def parse_config(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise ValidationError({"config": ["Invalid JSON format"]}) from None  # ← suppress internal
```

---

## Python: FastAPI Error Handler

```python
from fastapi import Request
from fastapi.responses import JSONResponse
import uuid


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))

    log_data = {
        "code": exc.code,
        "message": str(exc),
        "status": exc.status,
        "context": exc.context,
        "request_id": request_id,
        "path": str(request.url.path),
        "method": request.method,
    }

    if exc.is_operational:
        logger.warning("Operational error", extra=log_data)
    else:
        logger.error("Non-operational error", extra={**log_data, "stack": True})

    body = {
        "error": {
            "code": exc.code,
            "message": str(exc),
            "request_id": request_id,
        }
    }

    if isinstance(exc, ValidationError):
        body["error"]["fields"] = exc.fields

    return JSONResponse(status_code=exc.status, content=body)


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))

    logger.exception(
        "Unhandled exception",
        extra={"request_id": request_id, "path": str(request.url.path)},
    )

    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred. Please try again.",
                "request_id": request_id,
            }
        },
    )


# Register handlers
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_error_handler)
```

---

## Error Classification Helper

Use this at process exit to decide whether to crash:

```typescript
// In the global uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  logger.fatal('Uncaught exception', { error });

  if (!isOperationalError(error)) {
    // Non-operational: programmer error — crash so the process manager restarts cleanly
    process.exit(1);
  }
  // Operational: the error was logged, service can continue
  // (rare: usually operational errors are caught at the API boundary)
});
```

```python
# Python equivalent in main entrypoint
import sys
import logging

def handle_exception(exc_type, exc_value, exc_traceback):
    if isinstance(exc_value, AppError) and exc_value.is_operational:
        logging.error("Unhandled operational error", exc_info=(exc_type, exc_value, exc_traceback))
        # Allow process to continue if possible
    else:
        logging.critical("Non-operational error — crashing", exc_info=(exc_type, exc_value, exc_traceback))
        sys.exit(1)

sys.excepthook = handle_exception
```
