# Social Features Schema Patterns

Proven database patterns for social features in Supabase.

## Friend/Connection System

### Basic Friend Request Schema

```sql
-- Friend relationships (bidirectional once accepted)
CREATE TABLE friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- RLS Policies
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their friendships" ON friendships
  FOR SELECT USING (
    auth.uid() IN (requester_id, addressee_id)
  );

CREATE POLICY "Users can request friendship" ON friendships
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
    AND requester_id != addressee_id
  );

CREATE POLICY "Addressee can accept/reject" ON friendships
  FOR UPDATE USING (
    auth.uid() = addressee_id
    AND status = 'pending'
  );

CREATE POLICY "Either party can delete" ON friendships
  FOR DELETE USING (
    auth.uid() IN (requester_id, addressee_id)
  );
```

### Query Helpers

```sql
-- Get all friends for a user (accepted only)
CREATE OR REPLACE FUNCTION get_friends(user_uuid uuid)
RETURNS TABLE(friend_id uuid, friend_since timestamptz) AS $$
  SELECT
    CASE
      WHEN requester_id = user_uuid THEN addressee_id
      ELSE requester_id
    END as friend_id,
    updated_at as friend_since
  FROM friendships
  WHERE status = 'accepted'
    AND (requester_id = user_uuid OR addressee_id = user_uuid)
$$ LANGUAGE sql STABLE;

-- Check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1 uuid, user2 uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM friendships
    WHERE status = 'accepted'
      AND ((requester_id = user1 AND addressee_id = user2)
           OR (requester_id = user2 AND addressee_id = user1))
  )
$$ LANGUAGE sql STABLE;
```

## Sponsor/Sponsee Relationships

### Hierarchical Mentor Relationship

```sql
-- Sponsor relationships (one-to-many)
CREATE TABLE sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  sponsee_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code text UNIQUE,
  status text CHECK (status IN ('pending', 'active', 'ended')) DEFAULT 'pending',
  program text, -- 'aa', 'na', 'cma', etc.
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sponsor_id, sponsee_id)
);

-- Invite code generation function
CREATE OR REPLACE FUNCTION generate_sponsor_invite()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := upper(substr(md5(random()::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sponsor_invite
  BEFORE INSERT ON sponsorships
  FOR EACH ROW EXECUTE FUNCTION generate_sponsor_invite();

-- RLS Policies
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View own sponsorships" ON sponsorships
  FOR SELECT USING (auth.uid() IN (sponsor_id, sponsee_id));

CREATE POLICY "Sponsors create invites" ON sponsorships
  FOR INSERT WITH CHECK (auth.uid() = sponsor_id);

CREATE POLICY "Either party can update" ON sponsorships
  FOR UPDATE USING (auth.uid() IN (sponsor_id, sponsee_id));
```

### Accept Invite by Code

```sql
CREATE OR REPLACE FUNCTION accept_sponsor_invite(code text)
RETURNS sponsorships AS $$
DECLARE
  result sponsorships;
BEGIN
  UPDATE sponsorships
  SET
    sponsee_id = auth.uid(),
    status = 'active',
    started_at = now(),
    invite_code = NULL -- Clear code after use
  WHERE invite_code = code
    AND status = 'pending'
    AND sponsee_id IS NULL
  RETURNING * INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invite code';
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Ad-Hoc Groups (Meeting-Based)

### Ephemeral Group Schema

```sql
-- Groups that form around meetings or topics
CREATE TABLE groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text CHECK (type IN ('meeting', 'topic', 'support', 'private')) DEFAULT 'topic',
  visibility text CHECK (visibility IN ('public', 'private', 'invite')) DEFAULT 'public',
  meeting_id uuid REFERENCES meetings(id) ON DELETE SET NULL, -- Optional meeting link
  creator_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  max_members int DEFAULT 50,
  expires_at timestamptz, -- For ephemeral groups
  created_at timestamptz DEFAULT now()
);

-- Group membership
CREATE TABLE group_members (
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- Indexes
CREATE INDEX idx_groups_meeting ON groups(meeting_id) WHERE meeting_id IS NOT NULL;
CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- RLS Policies
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups visible" ON groups
  FOR SELECT USING (
    visibility = 'public'
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
        AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members see membership" ON group_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
        AND gm.user_id = auth.uid()
    )
  );
```

### Auto-Create Group for Meeting

```sql
CREATE OR REPLACE FUNCTION create_meeting_group(
  meeting_uuid uuid,
  group_name text DEFAULT NULL
)
RETURNS groups AS $$
DECLARE
  meeting_record meetings;
  new_group groups;
BEGIN
  -- Get meeting info
  SELECT * INTO meeting_record FROM meetings WHERE id = meeting_uuid;

  IF meeting_record IS NULL THEN
    RAISE EXCEPTION 'Meeting not found';
  END IF;

  -- Create group
  INSERT INTO groups (name, type, meeting_id, creator_id, expires_at)
  VALUES (
    COALESCE(group_name, meeting_record.name || ' Group'),
    'meeting',
    meeting_uuid,
    auth.uid(),
    now() + interval '24 hours' -- Ephemeral by default
  )
  RETURNING * INTO new_group;

  -- Add creator as owner
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (new_group.id, auth.uid(), 'owner');

  RETURN new_group;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Direct Messaging

### Conversation Schema

```sql
-- Conversations (1:1 or group)
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text CHECK (type IN ('direct', 'group')) DEFAULT 'direct',
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Conversation participants
CREATE TABLE conversation_participants (
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  muted_until timestamptz,
  PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text', -- 'text', 'image', 'system'
  created_at timestamptz DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- RLS Policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants see conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants see messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Participants send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );
```

### Get or Create DM Conversation

```sql
CREATE OR REPLACE FUNCTION get_or_create_dm(other_user_id uuid)
RETURNS conversations AS $$
DECLARE
  existing_conversation conversations;
  new_conversation conversations;
BEGIN
  -- Check for existing DM
  SELECT c.* INTO existing_conversation
  FROM conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1
      WHERE cp1.conversation_id = c.id AND cp1.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2
      WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id
    )
    AND (SELECT count(*) FROM conversation_participants WHERE conversation_id = c.id) = 2
  LIMIT 1;

  IF existing_conversation IS NOT NULL THEN
    RETURN existing_conversation;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (type)
  VALUES ('direct')
  RETURNING * INTO new_conversation;

  -- Add participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES
    (new_conversation.id, auth.uid()),
    (new_conversation.id, other_user_id);

  RETURN new_conversation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Real-Time Subscriptions

```typescript
// Subscribe to new messages
const subscription = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    },
    (payload) => {
      addMessage(payload.new);
    }
  )
  .subscribe();

// Subscribe to friend requests
const friendRequests = supabase
  .channel('friend-requests')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'friendships',
      filter: `addressee_id=eq.${userId}`
    },
    (payload) => {
      showNotification('New friend request!');
    }
  )
  .subscribe();
```

## Performance Tips

1. **Index foreign keys and filter columns**
2. **Use `(SELECT auth.uid())` in policies for JWT caching**
3. **Paginate messages with cursor-based pagination**
4. **Consider materialized views for friend counts**
5. **Use database functions for complex operations**
6. **Clean up expired ephemeral groups with scheduled job**
