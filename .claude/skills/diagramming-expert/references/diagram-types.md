# Diagram Types Taxonomy

Complete reference for choosing and creating the right diagram type.

## Decision Matrix: Which Diagram Type?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WHAT ARE YOU SHOWING?                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  STRUCTURE          PROCESS           RELATIONSHIP      DATA        │
│  ─────────          ───────           ────────────      ────        │
│  ▼                  ▼                 ▼                 ▼           │
│  • Hierarchy        • Flowchart       • Network         • Table     │
│  • Layers           • Sequence        • Mind Map        • Matrix    │
│  • Tree             • State           • Concept Map     • Timeline  │
│  • Org Chart        • Swimlane        • Venn            • Chart     │
│  • Nested           • Cycle           • Causal Loop     • Graph     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. FLOWCHARTS

### When to Use
- Process steps and decisions
- Algorithms and logic
- Workflows with branches
- Troubleshooting guides

### Basic Pattern

```
┌─────────┐
│  Start  │
└────┬────┘
     │
     ▼
┌─────────┐
│ Process │
└────┬────┘
     │
     ▼
   ┌───┐
  ╱     ╲        Standard shapes:
 ╱ Cond? ╲       □ Process
 ╲       ╱       ◇ Decision
  ╲     ╱        ○ Terminal
   └─┬─┘         ▱ Data
     │
  ┌──┴──┐
  │     │
  ▼     ▼
┌───┐ ┌───┐
│Yes│ │No │
└───┘ └───┘
```

### Decision Diamond (ASCII)

```
       │
       ▼
    ┌─────┐
   ╱       ╲
  ╱ Decision╲
  ╲    ?    ╱
   ╲       ╱
    └──┬──┘
    Y  │  N
  ┌────┴────┐
  ▼         ▼
```

### Horizontal Process

```
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ Step 1 │───►│ Step 2 │───►│ Step 3 │───►│ Step 4 │
└────────┘    └────────┘    └────────┘    └────────┘
```

### With Annotations

```
┌────────┐    ┌────────┐    ┌────────┐
│ Input  │───►│Process │───►│ Output │
└────────┘    └────┬───┘    └────────┘
                   │
              ┌────┴────┐
              │ Details │
              │ go here │
              └─────────┘
```

---

## 2. HIERARCHY / TREE DIAGRAMS

### When to Use
- Organizational structures
- File systems / taxonomies
- Inheritance / class hierarchies
- Categories and subcategories

### Top-Down Tree

```
                    ┌─────────┐
                    │   CEO   │
                    └────┬────┘
           ┌─────────────┼─────────────┐
           ▼             ▼             ▼
      ┌─────────┐   ┌─────────┐   ┌─────────┐
      │   CTO   │   │   CFO   │   │   COO   │
      └────┬────┘   └─────────┘   └────┬────┘
     ┌─────┴─────┐                ┌────┴────┐
     ▼           ▼                ▼         ▼
┌────────┐ ┌────────┐       ┌────────┐ ┌────────┐
│  Dev   │ │   QA   │       │  Ops   │ │Support │
└────────┘ └────────┘       └────────┘ └────────┘
```

### Indented Tree (Directory Style)

```
Root
├── Branch A
│   ├── Leaf A.1
│   ├── Leaf A.2
│   └── Leaf A.3
├── Branch B
│   ├── Leaf B.1
│   └── Sub-branch B.2
│       ├── Leaf B.2.1
│       └── Leaf B.2.2
└── Branch C
    └── Leaf C.1
```

### Horizontal Tree

```
                              ┌── Leaf 1
                   ┌── Sub A ─┤
                   │          └── Leaf 2
         ┌── A ────┤
         │         └── Sub B ─── Leaf 3
Root ────┤
         │         ┌── Sub C ─── Leaf 4
         └── B ────┤
                   └── Sub D ─┬─ Leaf 5
                              └─ Leaf 6
```

---

## 3. LAYER DIAGRAMS

### When to Use
- System architecture
- Network stacks
- Abstraction levels
- Tech stack visualization

### Simple Layers

```
┌─────────────────────────────────────────┐
│            Presentation Layer           │
├─────────────────────────────────────────┤
│            Business Logic               │
├─────────────────────────────────────────┤
│            Data Access Layer            │
├─────────────────────────────────────────┤
│               Database                  │
└─────────────────────────────────────────┘
```

### Layers with Components

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                        │
│   ┌─────────┐   ┌─────────┐   ┌─────────┐               │
│   │   Web   │   │ Mobile  │   │   CLI   │               │
│   └─────────┘   └─────────┘   └─────────┘               │
├─────────────────────────────────────────────────────────┤
│                      API LAYER                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │              REST / GraphQL Gateway             │   │
│   └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│                    SERVICE LAYER                        │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐         │
│   │  Auth Svc │   │ User Svc  │   │ Data Svc  │         │
│   └───────────┘   └───────────┘   └───────────┘         │
├─────────────────────────────────────────────────────────┤
│                    DATA LAYER                           │
│   ┌───────────┐   ┌───────────┐   ┌───────────┐         │
│   │  Postgres │   │   Redis   │   │    S3     │         │
│   └───────────┘   └───────────┘   └───────────┘         │
└─────────────────────────────────────────────────────────┘
```

### OSI Model Style

```
┌───────────────────────────────────┐
│ 7. Application  │ HTTP, FTP, DNS  │
├─────────────────┼─────────────────┤
│ 6. Presentation │ SSL, TLS        │
├─────────────────┼─────────────────┤
│ 5. Session      │ Sockets         │
├─────────────────┼─────────────────┤
│ 4. Transport    │ TCP, UDP        │
├─────────────────┼─────────────────┤
│ 3. Network      │ IP, ICMP        │
├─────────────────┼─────────────────┤
│ 2. Data Link    │ Ethernet, Wi-Fi │
├─────────────────┼─────────────────┤
│ 1. Physical     │ Cables, Radio   │
└─────────────────┴─────────────────┘
```

---

## 4. SEQUENCE DIAGRAMS

### When to Use
- Time-ordered interactions
- API call sequences
- User journeys
- Protocol flows

### Basic Sequence

```
  User          Server         Database
   │               │               │
   │   Request     │               │
   │──────────────►│               │
   │               │    Query      │
   │               │──────────────►│
   │               │               │
   │               │    Result     │
   │               │◄──────────────│
   │   Response    │               │
   │◄──────────────│               │
   │               │               │
```

### With Activation Boxes

```
  Client              Server              DB
    │                   │                  │
    │    login(u,p)     │                  │
    │──────────────────►│                  │
    │                   │                  │
    │                   ├─┐                │
    │                   │ │ validate       │
    │                   │◄┘                │
    │                   │                  │
    │                   │   SELECT user    │
    │                   │─────────────────►│
    │                   │                  │
    │                   │   user record    │
    │                   │◄─────────────────│
    │                   │                  │
    │    JWT token      │                  │
    │◄──────────────────│                  │
    │                   │                  │
```

### Loop Pattern

```
  Client              Server
    │                   │
    │                   │
    ├───────────────────┤
    │   loop [retry]    │
    │                   │
    │      Request      │
    │──────────────────►│
    │                   │
    │      Error        │
    │◄──────────────────│
    │                   │
    ├───────────────────┤
    │                   │
```

---

## 5. STATE DIAGRAMS

### When to Use
- Object lifecycles
- UI component states
- Workflow states
- Finite state machines

### Basic State Machine

```
                    ┌───────────────────────────────────┐
                    │                                   │
                    ▼                                   │
┌───────┐      ┌─────────┐      ┌───────────┐      ┌────┴────┐
│ START │─────►│ Pending │─────►│ Approved  │─────►│Complete │
└───────┘      └────┬────┘      └───────────┘      └─────────┘
                    │
                    │ reject
                    ▼
               ┌─────────┐
               │Rejected │
               └─────────┘
```

### With Entry/Exit Actions

```
┌─────────────────────────────────────┐
│              LOGGED_IN              │
├─────────────────────────────────────┤
│ entry / load user preferences       │
│ exit  / save session state          │
├─────────────────────────────────────┤
│ • browse()    → BROWSING            │
│ • logout()    → LOGGED_OUT          │
│ • timeout()   → SESSION_EXPIRED     │
└─────────────────────────────────────┘
```

---

## 6. RELATIONSHIP DIAGRAMS

### When to Use
- Entity relationships
- Network connections
- Dependencies
- System integrations

### Entity Relationship

```
┌──────────────┐         ┌──────────────┐
│    USER      │         │    ORDER     │
├──────────────┤         ├──────────────┤
│ id       PK  │───┐     │ id       PK  │
│ name         │   │     │ user_id  FK  │───┐
│ email        │   │     │ total        │   │
└──────────────┘   │     │ status       │   │
                   │     └──────────────┘   │
                   │                        │
                   │     ┌──────────────┐   │
                   │     │  ORDER_ITEM  │   │
                   │     ├──────────────┤   │
                   │     │ id       PK  │   │
                   └────►│ order_id FK  │◄──┘
                         │ product_id   │
                         │ quantity     │
                         └──────────────┘

    1:N relationship: User ─┬─< Order
```

### Network Diagram

```
                    ┌─────────────┐
                    │   Router    │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
     ┌───────────┐   ┌───────────┐   ┌───────────┐
     │  Switch A │   │  Switch B │   │  Switch C │
     └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
       ┌───┴───┐       ┌───┴───┐       ┌───┴───┐
       │       │       │       │       │       │
       ▼       ▼       ▼       ▼       ▼       ▼
     ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐   ┌───┐
     │PC1│   │PC2│   │PC3│   │PC4│   │PC5│   │PC6│
     └───┘   └───┘   └───┘   └───┘   └───┘   └───┘
```

---

## 7. COMPARISON DIAGRAMS

### When to Use
- Before/after analysis
- Feature comparison
- Trade-off visualization
- Option evaluation

### Side-by-Side

```
         BEFORE                           AFTER
┌─────────────────────────┐   ┌─────────────────────────┐
│ • Manual process        │   │ • Automated workflow    │
│ • 5 minute latency      │   │ • Real-time processing  │
│ • Error-prone           │   │ • Validated inputs      │
│ • Single point failure  │   │ • Distributed, resilient│
└─────────────────────────┘   └─────────────────────────┘
```

### Comparison Table

```
┌────────────────┬─────────────┬─────────────┬─────────────┐
│    Feature     │  Option A   │  Option B   │  Option C   │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ Cost           │    Low      │   Medium    │    High     │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ Performance    │   Medium    │    High     │    High     │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ Complexity     │    Low      │   Medium    │    High     │
├────────────────┼─────────────┼─────────────┼─────────────┤
│ Maintenance    │    Low      │    Low      │    High     │
└────────────────┴─────────────┴─────────────┴─────────────┘
```

### Venn Diagram (ASCII)

```
        ┌─────────────────────────────────────┐
        │              Set A                  │
        │                                     │
        │     ┌───────────────────────┐       │
        │     │    A ∩ B              │       │
        │     │                       │       │
   ─────┼─────┼───────────────────────┼───────┼─────
        │     │                       │       │
        │     │    Both A and B       │       │
        │     └───────────────────────┘       │
        │                                     │
        │              Set B                  │
        └─────────────────────────────────────┘
```

---

## 8. CYCLE / FEEDBACK DIAGRAMS

### When to Use
- Iterative processes
- Feedback loops
- Reinforcing/balancing systems
- Continuous improvement

### Simple Cycle

```
        ┌───────────┐
        │   Plan    │
        └─────┬─────┘
              │
              ▼
        ┌───────────┐
   ┌────│    Do     │
   │    └─────┬─────┘
   │          │
   │          ▼
   │    ┌───────────┐
   │    │   Check   │
   │    └─────┬─────┘
   │          │
   │          ▼
   │    ┌───────────┐
   └────│    Act    │
        └───────────┘
```

### Causal Loop (Reinforcing)

```
                    (+)
            ┌────────────────┐
            │                │
            ▼                │
       ┌─────────┐      ┌────┴────┐
       │ Growth  │─────►│ Revenue │
       └─────────┘  (+) └─────────┘
            ▲                │
            │                │
            │       (+)      │
            └────────────────┘

        (R) = Reinforcing Loop
        All (+) links = exponential growth
```

### Causal Loop (Balancing)

```
                    (-)
            ┌────────────────┐
            │                │
            ▼                │
       ┌─────────┐      ┌────┴────┐
       │ Effort  │─────►│ Backlog │
       └─────────┘  (-) └─────────┘
            ▲                │
            │                │
            │       (+)      │
            └────────────────┘

        (B) = Balancing Loop
        One (-) link = goal-seeking behavior
```

---

## 9. MATRIX / GRID DIAGRAMS

### When to Use
- 2D categorization
- Priority matrices
- Feature matrices
- Responsibility assignment

### 2x2 Matrix

```
                    HIGH IMPACT
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    │    DO LATER        │     DO FIRST       │
    │                    │                    │
    │    (schedule it)   │    (urgent +       │
    │                    │     important)     │
────┼────────────────────┼────────────────────┼────
LOW │                    │                    │ HIGH
URGENCY                  │                    │ URGENCY
    │                    │                    │
    │    DELEGATE        │     DO QUICK       │
    │                    │                    │
    │    (or eliminate)  │    (if < 2 min)    │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                    LOW IMPACT
```

### RACI Matrix

```
┌──────────────┬───────┬───────┬───────┬───────┐
│   Task       │ Dev   │  QA   │ PM    │ Ops   │
├──────────────┼───────┼───────┼───────┼───────┤
│ Design       │  R    │  C    │  A    │  I    │
├──────────────┼───────┼───────┼───────┼───────┤
│ Implement    │  R,A  │  I    │  C    │  I    │
├──────────────┼───────┼───────┼───────┼───────┤
│ Test         │  C    │ R,A   │  I    │  I    │
├──────────────┼───────┼───────┼───────┼───────┤
│ Deploy       │  C    │  C    │  I    │ R,A   │
└──────────────┴───────┴───────┴───────┴───────┘

R = Responsible, A = Accountable, C = Consulted, I = Informed
```

---

## 10. TIMELINE / GANTT DIAGRAMS

### When to Use
- Project schedules
- Historical events
- Process duration
- Milestone tracking

### Simple Timeline

```
2024
│
├─── Jan ─── Project Kickoff
│
├─── Mar ─── Design Complete
│
├─── Jun ─── MVP Launch
│
├─── Sep ─── Beta Release
│
└─── Dec ─── v1.0 Production
```

### Gantt-style

```
Task          │ Jan │ Feb │ Mar │ Apr │ May │ Jun │
──────────────┼─────┼─────┼─────┼─────┼─────┼─────┤
Planning      │███████████│     │     │     │     │
Design        │     │█████████████████│     │     │
Development   │     │     │     │█████████████████│
Testing       │     │     │     │     │     │█████│
```

### Milestone Timeline

```
○─────────●─────────●─────────●─────────●─────────○
│         │         │         │         │         │
│         │         │         │         │         │
▼         ▼         ▼         ▼         ▼         ▼
Start   Phase 1   Phase 2   Phase 3   Launch    End
Jan 1   Mar 15    Jun 1     Sep 1     Nov 15   Dec 31
```

---

## Quick Selection Guide

```
"I want to show..."                    "Use..."
─────────────────────────────────────────────────────
A process with decisions           →   Flowchart
Organization structure             →   Hierarchy Tree
System architecture                →   Layer Diagram
Interactions over time             →   Sequence Diagram
Object states and transitions      →   State Diagram
How things connect                 →   Relationship Diagram
Before vs. after                   →   Comparison (Side-by-side)
Continuous loop/cycle              →   Cycle Diagram
2D categorization                  →   Matrix
Schedule or history                →   Timeline
Data structure                     →   Entity Diagram
Cause and effect                   →   Causal Loop
```
