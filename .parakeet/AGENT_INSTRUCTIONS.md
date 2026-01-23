# Agent Instructions for some_claude_skills

Project Type: unknown

## Time Tracking

When working on this project, please track your time:

```python
from parakeet.changelog import ChangelogManager
from pathlib import Path

manager = ChangelogManager(Path.home() / '.parakeet')
manager.track_work_session(
    '/Users/erichowens/coding/some_claude_skills',
    duration_minutes=30,
    description='Description of work',
    milestone='Optional milestone name'
)
```

## Changelog Updates

Add changelog entries for significant changes:

```python
manager.add_changelog_entry(
    '/Users/erichowens/coding/some_claude_skills',
    {
        'timestamp': datetime.now().isoformat(),
        'description': 'What was changed',
        'duration_estimate': 45  # minutes
    }
)
```

## Best Practices

- Make small, focused commits with descriptive messages
- Track time for each work session
- Document milestones and their completion times
- Keep the changelog up to date
- Let Parakeet auto-commit when you're done for the day

