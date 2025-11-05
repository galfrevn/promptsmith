# Contributing to PromptSmith

Thank you for your interest in contributing to PromptSmith! We welcome contributions from the community and are grateful for your support.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. We expect all contributors to:

- Be respectful and considerate in communication
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **Bun** >= 1.2.15 (recommended) or npm/pnpm/yarn
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/promptsmith.git
cd promptsmith
```

3. Add the upstream repository:

```bash
git remote add upstream https://github.com/galfrevn/promptsmith.git
```

## Development Setup

### Install Dependencies

```bash
bun install
```

This will install all dependencies for the monorepo, including packages in `apps/core` and `apps/docs`.

### Start Development

```bash
# Start all apps in development mode
bun dev

# Or start specific apps
bun dev:docs        # Documentation site only
```

### Build the Project

```bash
bun build           # Build all packages
```

## Project Structure

```
promptsmith/
├── apps/
│   ├── core/                    # Main library package (promptsmith-ts)
│   │   ├── src/
│   │   │   ├── builder.ts       # SystemPromptBuilder class
│   │   │   ├── schemas.ts       # Zod schema utilities
│   │   │   ├── tester.ts        # Testing framework
│   │   │   ├── templates/       # Pre-built templates
│   │   │   └── types.ts         # TypeScript definitions
│   │   ├── __tests__/           # Test suite
│   │   └── scripts/             # Build scripts
│   └── docs/                    # Documentation site (Next.js + Fumadocs)
│       ├── content/docs/        # Documentation content (MDX)
│       └── src/                 # Documentation app source
├── assets/                      # Logo and branding assets
├── CONTRIBUTING.md              # This file
├── LICENSE                      # MIT License
└── README.md                    # Project overview
```

## Development Workflow

### 1. Create a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test improvements

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add or update tests as needed
- Update documentation if you're changing functionality

### 3. Test Your Changes

```bash
# Run tests
bun test

# Run tests with coverage
bun test:coverage

# Run tests in watch mode (from apps/core/)
cd apps/core
bun test --watch
```

### 4. Lint and Format

Before committing, ensure your code passes all quality checks:

```bash
# Lint your code
bun lint

# Format your code
bun format

# Or run both
bun lint && bun format
```

### 5. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
git commit -m "feat: add new template for data analysis"
git commit -m "fix: resolve token counting issue in TOON format"
git commit -m "docs: update API reference for withTool method"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `chore:` - Maintenance tasks

### 6. Keep Your Branch Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git rebase upstream/main
```

### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript

- **Strict mode**: Always enabled
- **Type safety**: Prefer explicit types over `any`
- **Naming conventions**:
  - `camelCase` for variables and functions
  - `PascalCase` for types, interfaces, and classes
  - `UPPER_CASE` for constants

### Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting:

- **Indentation**: 2 spaces
- **Line length**: 100 characters (soft limit)
- **Quotes**: Double quotes for strings
- **Semicolons**: Required
- **Trailing commas**: Always in multiline

### Documentation

- **JSDoc**: Use for public APIs
- **Inline comments**: For complex logic or non-obvious code
- **README updates**: Update relevant README files when adding features

Example:

```typescript
/**
 * Creates a new prompt builder instance with default configuration
 * 
 * @returns A new SystemPromptBuilder instance
 * 
 * @example
 * ```typescript
 * const builder = createPromptBuilder()
 *   .withIdentity("You are a helpful assistant")
 *   .withCapabilities(["Answer questions"]);
 * ```
 */
export function createPromptBuilder(): SystemPromptBuilder {
  // Implementation
}
```

## Testing

### Writing Tests

- Place tests in `apps/core/__tests__/`
- Name test files with `.test.ts` suffix
- Use descriptive test names that explain what is being tested

Example test structure:

```typescript
import { describe, it, expect } from "bun:test";
import { createPromptBuilder } from "../src/builder";

describe("SystemPromptBuilder", () => {
  describe("withIdentity", () => {
    it("should set the agent identity", () => {
      const builder = createPromptBuilder()
        .withIdentity("You are a helpful assistant");
      
      const prompt = builder.build();
      expect(prompt).toContain("You are a helpful assistant");
    });
  });
});
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test builder.test.ts

# Run with coverage
bun test:coverage

# Watch mode
bun test --watch
```

### Test Coverage

We aim for high test coverage, especially for:
- Core builder functionality
- Schema parsing and validation
- Tool integration
- Template generation

## Submitting Changes

### Pull Request Process

1. **Update Documentation**: Ensure README and relevant docs are updated
2. **Add Tests**: Include tests for new features or bug fixes
3. **Run Quality Checks**: Ensure `bun lint && bun format && bun test` passes
4. **Write a Clear PR Description**:
   - What changes were made
   - Why they were made
   - How to test them
   - Link to related issues

### PR Title Format

Follow Conventional Commits:

```
feat: add multilingual support template
fix: resolve memory leak in tool execution
docs: improve API reference examples
```

### PR Description Template

```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Linting and formatting checks pass

## Related Issues
Fixes #123
```

### Review Process

- At least one maintainer will review your PR
- Address any feedback or requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be included in the next release

## Reporting Issues

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check documentation** to ensure it's not a usage question
3. **Update to latest version** to see if the issue persists

### Creating a Bug Report

Include:

- **Clear title** describing the bug
- **PromptSmith version** you're using
- **Node.js and Bun version**
- **Steps to reproduce** the issue
- **Expected behavior** vs. **actual behavior**
- **Code sample** or minimal reproduction
- **Error messages** or stack traces

### Issue Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Create builder with...
2. Call method...
3. See error

**Expected behavior**
What you expected to happen.

**Code Sample**
```typescript
// Your code here
```

**Environment**
- PromptSmith version: X.Y.Z
- Node version: X.Y.Z
- Bun version: X.Y.Z
- OS: [e.g., macOS, Linux, Windows]

**Additional context**
Any other relevant information.
```

## Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** to see if it's already requested
2. **Describe the feature** clearly and concisely
3. **Explain the use case** and why it would be valuable
4. **Provide examples** of how it would work

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other relevant information, examples, or screenshots.
```

## Questions?

- 💬 **Discussions**: [GitHub Discussions](https://github.com/galfrevn/promptsmith/discussions)
- 🐛 **Issues**: [GitHub Issues](https://github.com/galfrevn/promptsmith/issues)
- 📚 **Docs**: [Full Documentation](./apps/core/README.md)

---

Thank you for contributing to PromptSmith! 🎉
