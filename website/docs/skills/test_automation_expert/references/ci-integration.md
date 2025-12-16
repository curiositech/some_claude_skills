---
title: CI/CD Test Integration
sidebar_label: CI/CD Test Integration
sidebar_position: 1
---
# CI/CD Test Integration

Complete configurations for integrating tests into continuous integration pipelines.

## GitHub Actions

### Complete Test Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  CI: true

jobs:
  # ============================================
  # Unit & Integration Tests
  # ============================================
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage --maxWorkers=2

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          fail_ci_if_error: true

      - name: Archive coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
          retention-days: 7

  # ============================================
  # E2E Tests
  # ============================================
  e2e-tests:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: unit-tests # Only run if unit tests pass

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium firefox

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npx playwright test
        env:
          BASE_URL: http://localhost:3000

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 7

  # ============================================
  # Component Tests (Storybook)
  # ============================================
  component-tests:
    name: Component Tests
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # For Chromatic

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          onlyChanged: true

  # ============================================
  # Test Summary
  # ============================================
  test-summary:
    name: Test Summary
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests]
    if: always()

    steps:
      - name: Check test results
        run: |
          if [ "${{ needs.unit-tests.result }}" == "failure" ] || \
             [ "${{ needs.e2e-tests.result }}" == "failure" ]; then
            echo "Tests failed!"
            exit 1
          fi
          echo "All tests passed!"
```

### Matrix Testing (Multiple Versions)

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 22]
        exclude:
          - os: windows-latest
            node: 18

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
```

### Parallel E2E with Sharding

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  strategy:
    fail-fast: false
    matrix:
      shard: [1, 2, 3, 4]

  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx playwright install --with-deps

    - name: Run tests (shard ${{ matrix.shard }}/4)
      run: npx playwright test --shard=${{ matrix.shard }}/4
```

## GitLab CI

### Complete Pipeline

```yaml
# .gitlab-ci.yml
stages:
  - install
  - test
  - e2e
  - report

variables:
  NODE_VERSION: "20"
  npm_config_cache: "$CI_PROJECT_DIR/.npm"

cache:
  key:
    files:
      - package-lock.json
  paths:
    - .npm/
    - node_modules/

# ============================================
# Install Stage
# ============================================
install:
  stage: install
  image: node:$\{NODE_VERSION\}
  script:
    - npm ci
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 hour

# ============================================
# Test Stage
# ============================================
unit-tests:
  stage: test
  image: node:$\{NODE_VERSION\}
  needs: [install]
  script:
    - npm test -- --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    when: always
    paths:
      - coverage/
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

lint:
  stage: test
  image: node:$\{NODE_VERSION\}
  needs: [install]
  script:
    - npm run lint
    - npm run typecheck

# ============================================
# E2E Stage
# ============================================
e2e-tests:
  stage: e2e
  image: mcr.microsoft.com/playwright:v1.40.0-jammy
  needs: [unit-tests]
  script:
    - npm ci
    - npm run build
    - npx playwright test
  artifacts:
    when: always
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week

# ============================================
# Report Stage
# ============================================
pages:
  stage: report
  needs: [unit-tests, e2e-tests]
  script:
    - mkdir public
    - cp -r coverage/ public/coverage
    - cp -r playwright-report/ public/e2e
  artifacts:
    paths:
      - public
  only:
    - main
```

## CircleCI

### Complete Config

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.1.0
  browser-tools: circleci/browser-tools@1.4.6

executors:
  node-executor:
    docker:
      - image: cimg/node:20.10
    working_directory: ~/project

commands:
  install-deps:
    steps:
      - restore_cache:
          keys:
            - npm-deps-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: npm-deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules

jobs:
  # ============================================
  # Unit Tests
  # ============================================
  unit-tests:
    executor: node-executor
    steps:
      - checkout
      - install-deps
      - run:
          name: Run unit tests
          command: npm test -- --coverage --ci
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage
          destination: coverage
      - run:
          name: Upload coverage
          command: bash <(curl -s https://codecov.io/bash)

  # ============================================
  # E2E Tests
  # ============================================
  e2e-tests:
    executor: node-executor
    parallelism: 4
    steps:
      - checkout
      - install-deps
      - run:
          name: Install Playwright
          command: npx playwright install --with-deps
      - run:
          name: Build app
          command: npm run build
      - run:
          name: Run E2E tests
          command: |
            SHARD="$(($\{CIRCLE_NODE_INDEX\}+1))"
            npx playwright test --shard=$\{SHARD\}/$\{CIRCLE_NODE_TOTAL\}
      - store_artifacts:
          path: playwright-report
          destination: playwright-report
      - store_test_results:
          path: test-results

  # ============================================
  # Integration Tests (with services)
  # ============================================
  integration-tests:
    docker:
      - image: cimg/node:20.10
      - image: postgres:15
        environment:
          POSTGRES_DB: test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
      - image: redis:7
    steps:
      - checkout
      - install-deps
      - run:
          name: Wait for services
          command: dockerize -wait tcp://localhost:5432 -wait tcp://localhost:6379 -timeout 30s
      - run:
          name: Run integration tests
          command: npm run test:integration
          environment:
            DATABASE_URL: postgres://test:test@localhost:5432/test
            REDIS_URL: redis://localhost:6379

workflows:
  test:
    jobs:
      - unit-tests
      - integration-tests:
          requires:
            - unit-tests
      - e2e-tests:
          requires:
            - unit-tests
```

## Jenkins

### Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
    agent {
        docker {
            image 'node:20'
        }
    }

    environment {
        CI = 'true'
        npm_config_cache = "$\{WORKSPACE\}/.npm"
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm test -- --coverage --ci'
                    }
                    post {
                        always {
                            junit 'junit.xml'
                            publishHTML([
                                reportDir: 'coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Coverage Report'
                            ])
                        }
                    }
                }

                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('E2E Tests') {
            agent {
                docker {
                    image 'mcr.microsoft.com/playwright:v1.40.0-jammy'
                }
            }
            steps {
                sh 'npm ci'
                sh 'npm run build'
                sh 'npx playwright test'
            }
            post {
                always {
                    publishHTML([
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Report'
                    ])
                }
            }
        }
    }

    post {
        failure {
            slackSend(
                color: 'danger',
                message: "Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
            )
        }
    }
}
```

## Test Caching Strategies

### npm/Node.js

```yaml
# GitHub Actions
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
    key: npm-${{ hashFiles('package-lock.json') }}
    restore-keys: npm-

# Playwright browsers
- uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('package-lock.json') }}
```

### pytest

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.cache/pip
      .pytest_cache
    key: pytest-${{ hashFiles('requirements.txt') }}
```

## Flaky Test Handling

### Retry Configuration

```yaml
# GitHub Actions
- name: Run tests with retry
  uses: nick-fields/retry@v2
  with:
    max_attempts: 3
    timeout_minutes: 10
    command: npm test

# Playwright built-in
- name: Run E2E with retries
  run: npx playwright test --retries=2
```

### Quarantine Flaky Tests

```javascript
// Mark flaky tests for tracking
test.describe('Flaky Feature', () => {
  test.fixme('sometimes fails due to race condition', async () => {
    // Test code
  });
});

// Or skip in CI only
test('flaky test', async () => {
  test.skip(process.env.CI, 'Flaky in CI - JIRA-123');
});
```

## Notifications

### Slack Integration

```yaml
# GitHub Actions
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Tests failed on ${{ github.ref }}",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Test Failure*\n• Repository: ${{ github.repository }}\n• Branch: ${{ github.ref }}\n• Commit: ${{ github.sha }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

## Performance Optimization

### Test Splitting

```yaml
# Dynamic test splitting based on timing
- name: Run tests with timing
  run: |
    npx jest --listTests --json > tests.json
    npx jest $(cat tests.json | jq -r '.[] | select(. | test("unit"))' | head -n $(($(cat tests.json | jq length) / 4)))
```

### Selective Testing

```yaml
# Only run affected tests
- uses: dorny/paths-filter@v2
  id: changes
  with:
    filters: |
      src:
        - 'src/**'
      tests:
        - 'tests/**'

- name: Run tests if source changed
  if: steps.changes.outputs.src == 'true'
  run: npm test
```
