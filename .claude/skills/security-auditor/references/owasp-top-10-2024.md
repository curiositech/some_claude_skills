# OWASP Top 10 2021 Reference Guide

This reference provides detailed guidance for each OWASP Top 10 category with detection patterns and remediation strategies.

## A01:2021 - Broken Access Control

### What It Is
Failures in enforcing access control policies that allow users to act outside their intended permissions.

### Common Vulnerabilities
- Missing authorization checks on API endpoints
- IDOR (Insecure Direct Object References)
- Elevation of privilege through parameter tampering
- JWT manipulation bypassing access controls
- CORS misconfigurations

### Detection Patterns

**Missing Auth Middleware:**
```javascript
// BAD: No auth check
app.get('/api/users/:id', (req, res) => {
  const user = db.getUser(req.params.id);
  res.json(user);
});

// GOOD: Auth middleware applied
app.get('/api/users/:id', authMiddleware, checkOwnership, (req, res) => {
  const user = db.getUser(req.params.id);
  res.json(user);
});
```

**IDOR Vulnerability:**
```python
# BAD: No ownership check
@app.route('/documents/<doc_id>')
def get_document(doc_id):
    return Document.query.get(doc_id)

# GOOD: Ownership verification
@app.route('/documents/<doc_id>')
@login_required
def get_document(doc_id):
    doc = Document.query.get(doc_id)
    if doc.owner_id != current_user.id:
        abort(403)
    return doc
```

### Remediation
1. Deny by default - require explicit authorization
2. Implement server-side access control
3. Log access control failures and alert on suspicious patterns
4. Rate limit APIs to prevent enumeration
5. Use indirect references (UUIDs vs sequential IDs)

---

## A02:2021 - Cryptographic Failures

### What It Is
Failures related to cryptography that expose sensitive data.

### Common Vulnerabilities
- Weak or deprecated algorithms (MD5, SHA1 for passwords)
- Insufficient key length
- Improper key management
- Transmitting data in clear text
- Not enforcing encryption

### Detection Patterns

**Weak Hash Algorithms:**
```javascript
// BAD: MD5 for passwords
const hash = crypto.createHash('md5').update(password).digest('hex');

// GOOD: bcrypt with proper rounds
const hash = await bcrypt.hash(password, 12);
```

**Insecure Randomness:**
```python
# BAD: Predictable random
token = str(random.randint(100000, 999999))

# GOOD: Cryptographically secure
import secrets
token = secrets.token_urlsafe(32)
```

### Remediation
1. Use bcrypt/argon2 for passwords (work factor ≥10)
2. Use SHA-256+ for integrity
3. Use TLS 1.3 for data in transit
4. Use secrets/crypto.randomBytes for security-sensitive random values
5. Rotate keys regularly

---

## A03:2021 - Injection

### What It Is
User-supplied data sent to an interpreter as part of a command or query.

### Common Vulnerabilities
- SQL injection
- Command injection
- LDAP injection
- XSS (Cross-Site Scripting)
- Template injection

### Detection Patterns

**SQL Injection:**
```python
# BAD: String concatenation
query = f"SELECT * FROM users WHERE name = '{name}'"

# GOOD: Parameterized query
cursor.execute("SELECT * FROM users WHERE name = %s", (name,))
```

**Command Injection:**
```javascript
// BAD: User input in exec
exec(`convert ${userInput} output.pdf`);

// GOOD: Use execFile with array
execFile('convert', [sanitizedInput, 'output.pdf']);
```

**XSS:**
```javascript
// BAD: innerHTML with user content
element.innerHTML = userContent;

// GOOD: textContent for text, sanitize for HTML
element.textContent = userContent;
// OR
element.innerHTML = DOMPurify.sanitize(userContent);
```

### Remediation
1. Use parameterized queries/prepared statements
2. Validate and sanitize all input
3. Use allowlists for command arguments
4. Escape output based on context
5. Use CSP headers

---

## A04:2021 - Insecure Design

### What It Is
Missing or ineffective security controls at the design level.

### Common Vulnerabilities
- Missing rate limiting
- No account lockout
- Credential recovery flaws
- Missing fraud detection
- Trust boundary violations

### Detection Patterns

**Missing Rate Limiting:**
```javascript
// BAD: No limits on sensitive endpoint
app.post('/login', (req, res) => {
  // Unlimited attempts
});

// GOOD: Rate limiting applied
app.post('/login',
  rateLimit({ windowMs: 15*60*1000, max: 5 }),
  (req, res) => { }
);
```

### Remediation
1. Establish secure design patterns
2. Threat model for each feature
3. Implement defense in depth
4. Segment trust levels
5. Test abuse cases, not just use cases

---

## A05:2021 - Security Misconfiguration

### What It Is
Missing security hardening or improperly configured permissions.

### Common Vulnerabilities
- Default credentials
- Unnecessary features enabled
- Verbose error messages
- Missing security headers
- Cloud storage misconfigurations

### Detection Patterns

**Debug Mode in Production:**
```python
# BAD
DEBUG = True  # In production

# GOOD
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
```

**Missing Security Headers:**
```javascript
// GOOD: Security headers applied
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"]
  }
}));
```

### Remediation
1. Minimal platform without unnecessary features
2. Review and update configurations regularly
3. Implement security headers
4. Automated security configuration verification
5. Different credentials for each environment

---

## A06:2021 - Vulnerable and Outdated Components

### What It Is
Using components with known vulnerabilities.

### Detection Commands
```bash
# Node.js
npm audit
npm audit --json | jq '.vulnerabilities'

# Python
pip-audit
safety check

# General
snyk test
trivy fs .
```

### Remediation
1. Remove unused dependencies
2. Subscribe to security bulletins
3. Scan dependencies in CI/CD
4. Plan for regular updates
5. Use LTS versions when possible

---

## A07:2021 - Identification and Authentication Failures

### What It Is
Weaknesses in authentication mechanisms.

### Common Vulnerabilities
- Credential stuffing susceptibility
- Weak password policies
- Session fixation
- Missing MFA
- Improper session management

### Detection Patterns

**Weak Password Policy:**
```javascript
// BAD: No validation
if (password) { createUser(password); }

// GOOD: Strong validation
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
if (strongPassword.test(password)) { createUser(password); }
```

### Remediation
1. Implement MFA where possible
2. Use strong password policies
3. Limit failed login attempts
4. Use secure session management
5. Invalidate sessions on logout/password change

---

## A08:2021 - Software and Data Integrity Failures

### What It Is
Code and infrastructure that doesn't protect against integrity violations.

### Common Vulnerabilities
- Insecure deserialization
- CI/CD pipeline compromise
- Auto-update without verification
- Unsigned code

### Detection Patterns

**Insecure Deserialization:**
```python
# BAD: Pickle with untrusted data
data = pickle.loads(user_input)

# GOOD: JSON with validation
data = json.loads(user_input)
validate_schema(data, expected_schema)
```

### Remediation
1. Use digital signatures for data/code
2. Verify component integrity
3. Secure CI/CD pipelines
4. Avoid insecure serialization formats
5. Review code before deployment

---

## A09:2021 - Security Logging and Monitoring Failures

### What It Is
Insufficient logging, monitoring, or response to security events.

### What to Log
- Authentication attempts (success/fail)
- Authorization failures
- Input validation failures
- Application errors
- Admin activities

### Detection Patterns

**Sensitive Data in Logs:**
```python
# BAD: Password in logs
logger.info(f"Login attempt: {username}, password: {password}")

# GOOD: Redacted sensitive data
logger.info(f"Login attempt: {username}, password: [REDACTED]")
```

### Remediation
1. Log security-relevant events
2. Use centralized log management
3. Set up alerting thresholds
4. Establish incident response procedures
5. Retain logs for forensics

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### What It Is
Web application fetches a remote resource without validating the user-supplied URL.

### Common Vulnerabilities
- URL parameter passed to fetch/request
- Webhook configurations
- File imports from URLs
- PDF generators with external resources

### Detection Patterns

**SSRF Vulnerability:**
```javascript
// BAD: User-controlled URL
const response = await fetch(req.query.url);

// GOOD: URL validation
const allowedDomains = ['api.trusted.com', 'cdn.trusted.com'];
const url = new URL(req.query.url);
if (!allowedDomains.includes(url.hostname)) {
  throw new Error('Domain not allowed');
}
const response = await fetch(url);
```

### Remediation
1. Validate and sanitize all URLs
2. Use allowlists for permitted domains
3. Disable HTTP redirects or validate targets
4. Block requests to private IP ranges
5. Use network segmentation

---

## Quick Reference Table

| Category | Key Detection Pattern | Critical Fix |
|----------|----------------------|--------------|
| A01 | Missing auth middleware | Add authorization checks |
| A02 | MD5/SHA1 for passwords | Use bcrypt/argon2 |
| A03 | String concat in queries | Parameterized queries |
| A04 | No rate limiting | Add rate limits |
| A05 | DEBUG=True in prod | Environment-based config |
| A06 | Old dependency versions | npm audit fix |
| A07 | No account lockout | Limit failed attempts |
| A08 | pickle.loads() | Use safe deserialization |
| A09 | Passwords in logs | Redact sensitive data |
| A10 | User URL in fetch() | URL allowlisting |
