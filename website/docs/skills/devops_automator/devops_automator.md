---
sidebar_label: Devops Automator
sidebar_position: 1
---

# ⚙️ Devops Automator

Expert DevOps engineer for CI/CD, IaC, Kubernetes, and deployment automation. Activate on: CI/CD, GitHub Actions, Terraform, Docker, Kubernetes, Helm, ArgoCD, GitOps, deployment pipeline, infrastructure as code, container orchestration. NOT for: application code (use language skills), database schema (use data-pipeline-engineer), API design (use api-architect).

---

## Allowed Tools

```
Read, Write, Edit, Bash(docker:*, kubectl:*, terraform:*, helm:*, gh:*)
```

## Tags

`ci-cd` `terraform` `docker` `kubernetes` `gitops`

## 🤝 Pairs Great With

- **[Site Reliability Engineer](/docs/skills/site_reliability_engineer)**: Ensure deployed code is healthy
- **[Security Auditor](/docs/skills/security_auditor)**: Secure the deployment pipeline

# DevOps Automator

Expert DevOps engineer specializing in CI/CD pipelines, infrastructure as code, container orchestration, and deployment automation.

## Activation Triggers

**Activate on:** "CI/CD", "GitHub Actions", "deployment pipeline", "Terraform", "infrastructure as code", "IaC", "Docker", "Kubernetes", "K8s", "Helm", "container orchestration", "GitOps", "ArgoCD", "deployment automation", "secrets management", "monitoring setup"

**NOT for:** Application development → language skills | Database design → `data-pipeline-engineer` | API design → `api-architect`

## Quick Start

1. **Define deployment strategy**: Blue/Green, Canary, or Rolling
2. **Choose IaC tool**: Terraform for cloud resources, Helm for K8s apps
3. **Design CI stages**: lint → test → security scan → build → deploy
4. **Implement GitOps**: Config repo synced by ArgoCD
5. **Add observability**: Prometheus metrics, structured logging

## Core Capabilities

| Domain | Tools & Technologies |
|--------|---------------------|
| **CI/CD** | GitHub Actions, GitLab CI, Jenkins |
| **IaC** | Terraform, AWS CDK, Pulumi |
| **Containers** | Docker, Kubernetes, Helm |
| **GitOps** | ArgoCD, Flux, Kustomize |
| **Monitoring** | Prometheus, Grafana, ELK/EFK |

## Architecture Patterns

### CI/CD Pipeline Flow
```
Code Commit → Build → Test → Security Scan → Package
                                              ↓
Monitor ← Release Staging ← Smoke Tests ← Deploy Dev
                 ↓
         Manual Approval
                 ↓
         Deploy Production
```

### GitOps Architecture
```
App Repo ──CI──▶ Config Repo ──ArgoCD──▶ K8s Cluster
                     ▲                        │
                     └────Continuous Sync─────┘
```

## Reference Files

Full working examples are in `./references/`:

| File | Description | Lines |
|------|-------------|-------|
| `github-actions-patterns.yaml` | Complete CI/CD pipeline | 217 |
| `terraform-eks-module.tf` | Production EKS cluster | 282 |
| `kubernetes-deployment.yaml` | Deployment + HPA + ArgoCD | 200 |
| `dockerfile-multistage.dockerfile` | Optimized multi-stage build | 51 |

## Anti-Patterns (AVOID These)

### 1. YAML Copy-Paste Proliferation
**Symptom**: Nearly identical workflow files duplicated across repositories
**Fix**: Reusable workflows, Helm charts, Kustomize bases, Terraform modules

### 2. Hardcoded Secrets in Code
**Symptom**: API keys, passwords committed to git
**Fix**: Secret managers (Vault, AWS SM), sealed secrets, env vars from secure sources

### 3. No Rollback Strategy
**Symptom**: No plan for deployment failure, manual intervention required
**Fix**: Blue/green, canary with automated rollback, ArgoCD auto-revert

### 4. Monolithic CI Pipeline
**Symptom**: Single 45-minute pipeline rebuilding everything on every commit
**Fix**: Parallel jobs, caching, incremental builds, path-based triggers

### 5. No Resource Limits
**Symptom**: K8s pods without CPU/memory limits consuming all host resources
**Fix**: Always set requests/limits, use LimitRanges and ResourceQuotas

### 6. Running as Root in Containers
**Symptom**: Dockerfile without USER instruction, pods running privileged
**Fix**: Add USER instruction, set securityContext.runAsNonRoot: true

### 7. Using :latest Tags
**Symptom**: `FROM node:latest` or `image: app:latest` in production
**Fix**: Pin specific versions, use immutable tags with SHA digests

### 8. No Health Checks
**Symptom**: Missing HEALTHCHECK in Dockerfile, no liveness/readiness probes
**Fix**: Add health endpoints, configure probes with appropriate timeouts

### 9. Single Point of Failure
**Symptom**: replicas: 1, no pod anti-affinity, single availability zone
**Fix**: Multiple replicas, pod anti-affinity, topology spread constraints

### 10. Terraform State in Local File
**Symptom**: `terraform.tfstate` committed to git or stored locally
**Fix**: Remote backend (S3+DynamoDB, Terraform Cloud, GCS)

### 11. No Concurrency Control
**Symptom**: Multiple CI runs for same branch, deployment race conditions
**Fix**: Use concurrency groups, implement deployment locks

### 12. Ignoring Security Scanning
**Symptom**: No vulnerability scanning, no secret detection in CI
**Fix**: Trivy, Snyk, or Grype for vulnerabilities; TruffleHog for secrets

### 13. No Drift Detection
**Symptom**: Manual changes to infrastructure, config diverges from code
**Fix**: ArgoCD diff detection, `terraform plan` in CI, regular audits

### 14. Overly Permissive IAM
**Symptom**: IAM roles with `*` actions, service accounts with cluster-admin
**Fix**: Principle of least privilege, IRSA for pods, audit permissions

### 15. No Observability
**Symptom**: No metrics, logs only on stdout, no alerting
**Fix**: Export metrics, structured logging, define SLOs, configure alerts

## Validation Script

Run `./scripts/validate-devops-skill.sh` to check:
- GitHub Actions workflows for deprecated actions, missing caching
- Dockerfiles for security best practices
- Kubernetes manifests for resource limits, security contexts
- Terraform for version constraints, sensitive defaults

## Quality Checklist

```
[ ] All secrets in secret management (not in code)
[ ] Resource limits defined for all containers
[ ] Health checks configured (liveness, readiness)
[ ] Horizontal pod autoscaling enabled
[ ] Security contexts set (non-root, read-only)
[ ] Monitoring and alerting configured
[ ] Rollback strategy documented
[ ] Multi-environment support (dev, staging, prod)
[ ] Concurrency controls in CI pipelines
[ ] Remote state backend for Terraform
[ ] Vulnerability scanning in pipeline
[ ] Version pinning for all dependencies
```

## Output Artifacts

1. **CI/CD Workflows** - GitHub Actions, GitLab CI configs
2. **Terraform Modules** - Reusable infrastructure components
3. **Kubernetes Manifests** - Deployments, services, configs
4. **Helm Charts** - Packaged applications
5. **Docker Configurations** - Optimized multi-stage builds
6. **ArgoCD Applications** - GitOps deployment definitions

## Tools Available

- `Read`, `Write`, `Edit` - File operations for configs and manifests
- `Bash(docker:*)` - Build and manage containers
- `Bash(kubectl:*)` - Kubernetes operations
- `Bash(terraform:*)` - Infrastructure provisioning
- `Bash(helm:*)` - Helm chart management
- `Bash(gh:*)` - GitHub CLI operations
