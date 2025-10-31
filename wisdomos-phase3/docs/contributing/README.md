# Contributing to WisdomOS

Thank you for your interest in contributing!

## Code of Conduct

Be respectful, inclusive, and constructive.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/wisdomos.git`
3. Create a branch: `git checkout -b feature/your-feature`
4. Make changes and commit
5. Push and create pull request

## Development Setup

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your config

# Start development
pnpm dev
```

## Making Changes

### Code Style

- Run `pnpm lint` before committing
- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs

### Testing

```bash
# Run tests
pnpm test

# Run specific test
pnpm test -- path/to/test

# Watch mode
pnpm test:watch
```

### Commit Messages

Follow conventional commits:
```
feat: add dark mode support
fix: resolve authentication bug
docs: update API documentation
test: add tests for life areas
```

## Pull Requests

1. Ensure all tests pass
2. Update documentation if needed
3. Link related issues
4. Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

## Areas to Contribute

- **Features**: New life transformation tools
- **UI/UX**: Phoenix design improvements
- **Documentation**: Guides and tutorials
- **Tests**: Increase coverage
- **Bug Fixes**: Check GitHub issues
- **Translations**: i18n support

## Questions?

Ask in [GitHub Discussions](https://github.com/yourusername/wisdomos/discussions)
