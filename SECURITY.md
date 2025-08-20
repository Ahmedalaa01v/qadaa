# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

The security of Qada Tracker is important to us. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send a detailed report to:
- **Email**: security@qadaa.org (if available)
- **GitHub**: Use GitHub's private vulnerability reporting feature

### What to Include

Please include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if available)
- Your contact information

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Status Updates**: Every 7 days until resolved

### Disclosure Policy

- We will investigate all legitimate reports
- We will keep you informed of our progress
- We will credit you for the discovery (unless you prefer to remain anonymous)
- We will coordinate public disclosure timing with you

### Security Best Practices

For users of Qada Tracker:

1. **Environment Variables**: Never commit `.env` files to version control
2. **Database Security**: Use Row Level Security (RLS) policies in Supabase
3. **Authentication**: Use strong passwords and enable MFA when available
4. **Updates**: Keep your deployment updated with the latest version
5. **HTTPS**: Always use HTTPS in production
6. **CSP**: Content Security Policy is configured - don't disable it

### Scope

This security policy applies to:
- The main Qada Tracker application
- Database schemas and configurations
- Deployment configurations
- Documentation that could affect security

### Out of Scope

- Issues in third-party dependencies (report to the respective maintainers)
- Social engineering attacks
- Physical security issues

## Security Features

Our application includes:
- Content Security Policy (CSP)
- HTTP security headers
- Input validation and sanitization
- Rate limiting on API endpoints
- Row Level Security (RLS) in database
- Secure authentication flows

Thank you for helping keep Qada Tracker secure for the Muslim community.
