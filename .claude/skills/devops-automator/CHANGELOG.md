# Changelog

All notable changes to the devops-automator skill will be documented in this file.

## [2.0.0] - 2024-12-11

### Changed
- **BREAKING**: Restructured SKILL.md from 955 lines to 171 lines for progressive disclosure
- Moved all large code examples to `./references/` directory
- Expanded anti-patterns section from 5 to 15 patterns

### Added
- `references/github-actions-patterns.yaml` - Complete CI/CD pipeline with lint, test, security, build, deploy stages
- `references/terraform-eks-module.tf` - Production-ready EKS cluster with OIDC, node groups, encryption
- `references/kubernetes-deployment.yaml` - Deployment, Service, HPA, ArgoCD Application definitions
- `references/dockerfile-multistage.dockerfile` - Optimized 3-stage Docker build with security best practices
- `scripts/validate-devops-skill.sh` - Validation script for GitHub Actions, Dockerfile, K8s, Terraform
- New anti-patterns: Running as Root, Using :latest Tags, No Health Checks, Single Point of Failure, Terraform State Local, No Concurrency Control, Ignoring Security Scanning, No Drift Detection, Overly Permissive IAM, No Observability
- Expanded quality checklist with 12 items
- Version number in frontmatter

### Removed
- Inline code examples (now in references/)
- Redundant capability descriptions

## [1.0.0] - 2024-12-10

### Added
- Initial release
- CI/CD pipeline design capabilities
- Infrastructure as code patterns
- Container orchestration support
- GitOps workflow patterns
- Monitoring and observability guidance
