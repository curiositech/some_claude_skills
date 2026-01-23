# Advanced RLS Policy Patterns

## Policy Types

| Type | Use Case |
|------|----------|
| `FOR SELECT` | Read access |
| `FOR INSERT` | Create access (use `WITH CHECK`) |
| `FOR UPDATE` | Modify access |
| `FOR DELETE` | Remove access |
| `FOR ALL` | All operations |

## Pattern 1: Owner-Based Access

```sql
-- Only owner can see/modify their data
CREATE POLICY "Owner access" ON user_data
  FOR ALL USING (auth.uid() = user_id);
```

## Pattern 2: Public Read, Authenticated Write

```sql
-- Anyone can read
CREATE POLICY "Public read" ON posts
  FOR SELECT USING (true);

-- Only authenticated users can create (owning their posts)
CREATE POLICY "Auth write" ON posts
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = author_id
  );

-- Only author can update
CREATE POLICY "Author update" ON posts
  FOR UPDATE USING (auth.uid() = author_id);
```

## Pattern 3: Role-Based Access Control (RBAC)

```sql
-- Store roles in profiles
ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';

-- Admin can do anything
CREATE POLICY "Admin full access" ON content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
    )
  );

-- Moderators can read and update
CREATE POLICY "Mod read" ON content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role IN ('admin', 'moderator')
    )
  );
```

## Pattern 4: Team/Organization Access

```sql
-- Users belong to teams
CREATE TABLE team_members (
  team_id uuid REFERENCES teams(id),
  user_id uuid REFERENCES profiles(id),
  role text DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

-- Team members can access team resources
CREATE POLICY "Team access" ON team_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_resources.team_id
        AND team_members.user_id = (SELECT auth.uid())
    )
  );
```

## Pattern 5: Privacy Settings

```sql
-- Users control their own visibility
ALTER TABLE profiles ADD COLUMN privacy text DEFAULT 'public';

CREATE POLICY "Respect privacy" ON profiles
  FOR SELECT USING (
    privacy = 'public'
    OR id = (SELECT auth.uid())
    OR (
      privacy = 'friends'
      AND EXISTS (
        SELECT 1 FROM friendships
        WHERE status = 'accepted'
          AND (
            (requester_id = profiles.id AND addressee_id = (SELECT auth.uid()))
            OR (addressee_id = profiles.id AND requester_id = (SELECT auth.uid()))
          )
      )
    )
  );
```

## Pattern 6: Temporal Access (Time-Based)

```sql
-- Content visible only during certain times
CREATE POLICY "Time-limited access" ON events
  FOR SELECT USING (
    starts_at <= now()
    AND (ends_at IS NULL OR ends_at > now())
  );

-- Soft-deleted items hidden
CREATE POLICY "Hide deleted" ON posts
  FOR SELECT USING (deleted_at IS NULL);
```

## Pattern 7: Hierarchical Access (Parent-Child)

```sql
-- Comments inherit visibility from posts
CREATE POLICY "Comments follow posts" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = comments.post_id
        AND (
          posts.visibility = 'public'
          OR posts.author_id = (SELECT auth.uid())
        )
    )
  );
```

## Performance Optimization

### Always Use Subquery for auth.uid()

```sql
-- SLOW: JWT parsed for every row
CREATE POLICY "slow" ON data
  FOR SELECT USING (user_id = auth.uid());

-- FAST: JWT parsed once
CREATE POLICY "fast" ON data
  FOR SELECT USING (user_id = (SELECT auth.uid()));
```

### Index Policy Columns

```sql
-- Create indexes on columns used in policies
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_team_members_lookup ON team_members(team_id, user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### Use Security Definer Functions for Complex Logic

```sql
-- Move complex logic to a function
CREATE OR REPLACE FUNCTION can_access_resource(resource_id uuid)
RETURNS boolean AS $$
  -- Complex access logic here
  SELECT EXISTS (
    SELECT 1 FROM permissions
    WHERE permissions.resource_id = $1
      AND permissions.user_id = (SELECT auth.uid())
      AND permissions.expires_at > now()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Simple policy using function
CREATE POLICY "Check permissions" ON resources
  FOR SELECT USING (can_access_resource(id));
```

## Debugging Policies

```sql
-- See all policies on a table
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test as anonymous
SET ROLE anon;
SELECT * FROM your_table LIMIT 1;
RESET ROLE;

-- Test as authenticated with specific user
SET request.jwt.claims TO '{"sub": "user-uuid", "role": "authenticated"}';
SELECT * FROM your_table;

-- Check current auth context
SELECT
  auth.uid() as user_id,
  auth.role() as role,
  current_user as db_user;
```

## Common Mistakes

1. **Forgetting to enable RLS**: `ALTER TABLE t ENABLE ROW LEVEL SECURITY;`
2. **Not indexing policy columns**: Causes full table scans
3. **Using `auth.uid()` directly**: Use `(SELECT auth.uid())` instead
4. **Overly permissive policies**: Start restrictive, add permissions
5. **Circular references**: Policy A depends on B depends on A
6. **Missing INSERT policies**: `WITH CHECK` is required for INSERT
7. **Testing only as superuser**: Superuser bypasses RLS
