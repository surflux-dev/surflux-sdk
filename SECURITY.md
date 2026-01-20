# Security Policy

## Supported Versions

We actively support the following versions of the SDK with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | :white_check_mark: |
| < 0.2.0 | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** create a public GitHub issue for the vulnerability
2. Email security details to: contact@surflux.dev
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will provide an initial assessment within 7 days
- We will keep you informed of our progress
- We will notify you when the vulnerability has been resolved

### Disclosure Policy

- We will work with you to understand and resolve the issue quickly
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will publish a security advisory once the issue is resolved

## Security Best Practices

When using this SDK:

1. **Never commit API keys or stream keys** to version control
2. **Use environment variables** for sensitive credentials
3. **Keep the SDK updated** to the latest version
4. **Validate all user inputs** before passing them to SDK methods
5. **Use HTTPS** in production environments
6. **Implement rate limiting** on your application side
7. **Monitor API usage** for unusual patterns

## Known Security Considerations

- API keys and stream keys are sent as query parameters or headers - ensure you're using HTTPS
- The SDK does not store credentials - manage them securely in your application
- Event streams use Server-Sent Events (SSE) - ensure your network infrastructure supports this

## Additional Resources

- [Surflux Documentation](https://surflux.dev/docs)
