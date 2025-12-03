---
title: Professional Network Data Acquisition Guide
sidebar_label: Professional Network Data A...
sidebar_position: 3
---
# Professional Network Data Acquisition Guide

## Executive Summary

This document provides a comprehensive guide to acquiring professional network data for graph analysis, with a focus on identifying superconnectors, influence brokers, and knowledge mavens. We cover official APIs, third-party data providers, scraping tools, and alternative network reconstruction strategies—along with legal considerations and practical implementation code.

**Key Insight**: For network analysis purposes, reconstructing professional networks from public sources (publications, conferences, GitHub) often yields higher-quality relationship data than LinkedIn scraping, which captures connections rather than actual collaboration.

---

## Table of Contents

1. [Data Source Hierarchy](#data-source-hierarchy)
2. [Official LinkedIn Routes](#official-linkedin-routes)
3. [Third-Party Data Providers](#third-party-data-providers)
4. [Scraping Tools](#scraping-tools)
5. [Alternative Network Reconstruction](#alternative-network-reconstruction)
6. [Legal Considerations](#legal-considerations)
7. [Recommended Strategy](#recommended-strategy)

---

## Data Source Hierarchy

### Quality vs. Accessibility Matrix

| Data Source | Relationship Quality | Accessibility | Cost | Legal Risk |
|-------------|---------------------|---------------|------|------------|
| Co-authorship (papers) | ★★★★★ | High | Free | None |
| GitHub collaboration | ★★★★☆ | High | Free | None |
| Conference co-speaking | ★★★★☆ | Medium | Free | None |
| LinkedIn connections | ★★☆☆☆ | Low | $$$ | Medium |
| Email/calendar data | ★★★★★ | Very Low | N/A | High |

**Why LinkedIn connections are low quality for network analysis:**
- People accept connections from strangers
- No indication of relationship strength
- No collaboration signal
- Includes recruiters, salespeople, random requests

**Why co-authorship is gold:**
- Months of collaboration required
- Trust signal (putting your name on shared work)
- Repeated co-authorship = strong relationship
- Position on author list indicates role

---

## Official LinkedIn Routes

### 1. Personal Data Export

**Access**: Settings → Data Privacy → Get a copy of your data

**What you get**:
- `Connections.csv`: Name, company, position, connected date
- `Messages.csv`: Message history
- `Invitations.csv`: Sent/received invitations

**Limitations**:
- Only YOUR 1st-degree network
- No 2nd-degree visibility
- No relationship strength indicators

**Use case**: Analyzing your own network position, finding paths to targets

```python
import pandas as pd

# Load your LinkedIn export
connections = pd.read_csv('Connections.csv', skiprows=3)

# Basic analysis
print(f"Total connections: {len(connections)}")
print(f"Companies represented: {connections['Company'].nunique()}")

# Find potential bridges (people at companies you have few connections to)
company_counts = connections['Company'].value_counts()
rare_companies = company_counts[company_counts <= 2].index
bridges = connections[connections['Company'].isin(rare_companies)]
```

### 2. LinkedIn Sales Navigator

**Pricing**: $99.99/mo (Core) to $179.99/mo (Advanced)

**Capabilities**:
- Advanced search filters (industry, company size, seniority)
- Lead lists and saved searches
- InMail credits
- Account mapping (org charts)

**Export options**:
- Lead lists to CSV (limited fields)
- CRM integrations (Salesforce, HubSpot)

**For network analysis**:
- Can identify target individuals
- No graph structure data
- Best combined with enrichment tools

### 3. LinkedIn APIs (Enterprise)

**Available APIs**:
- Marketing API (ad targeting, company pages)
- Talent Solutions API (recruiting)
- Learning API (course completions)
- Consumer API (deprecated for most uses)

**Access requirements**:
- Enterprise partnership agreement
- Significant annual spend ($50K+)
- Compliance review

**Reality**: Not accessible for most network analysis use cases.

---

## Third-Party Data Providers

### Tier 1: Full-Service B2B Data

#### Apollo.io

**Data**: 275M+ contacts, 73M+ companies

**Pricing**:
- Free: 50 credits/month
- Basic: $49/mo (900 credits)
- Professional: $99/mo (unlimited emails)

**Best for**: Lead generation, email finding, basic enrichment

**API Example**:
```python
import requests

APOLLO_API_KEY = 'your_key'

def search_people(domain, title_keywords):
    """Search Apollo for people at a company."""
    response = requests.post(
        'https://api.apollo.io/v1/mixed_people/search',
        headers={'X-Api-Key': APOLLO_API_KEY},
        json={
            'q_organization_domains': domain,
            'person_titles': title_keywords,
            'page': 1,
            'per_page': 25
        }
    )
    return response.json()['people']

# Find ML engineers at top AI labs
for domain in ['anthropic.com', 'openai.com', 'deepmind.com']:
    people = search_people(domain, ['Machine Learning', 'Research'])
    print(f"{domain}: {len(people)} people found")
```

#### ZoomInfo

**Data**: 100M+ business profiles, org charts, intent data

**Pricing**: Enterprise (contact sales, typically $15K+/year)

**Best for**: Enterprise recruiting, account-based marketing

**Network analysis value**: Org charts can reveal internal influence structures

#### Clearbit (now Breeze by HubSpot)

**Data**: Company + person enrichment

**Pricing**: Per-lookup ($0.05-0.20 per enrichment)

**API Example**:
```python
import clearbit

clearbit.key = 'your_key'

# Enrich a person by email
person = clearbit.Person.find(email='elon@tesla.com', stream=True)

print(f"Name: {person['name']['fullName']}")
print(f"Role: {person['employment']['title']}")
print(f"Company: {person['employment']['name']}")
print(f"LinkedIn: {person['linkedin']['handle']}")
```

### Tier 2: LinkedIn-Specific APIs

#### Proxycurl

**What it does**: API wrapper for LinkedIn profile data

**Pricing**:
- $0.01 per profile lookup
- $0.003 per company lookup
- Bulk discounts available

**Data returned**:
- Full profile (experience, education, skills)
- Company data
- Job postings

**API Example**:
```python
import requests

PROXYCURL_API_KEY = 'your_key'

def get_linkedin_profile(linkedin_url):
    """Fetch full LinkedIn profile data."""
    response = requests.get(
        'https://nubela.co/proxycurl/api/v2/linkedin',
        params={'url': linkedin_url},
        headers={'Authorization': f'Bearer {PROXYCURL_API_KEY}'}
    )
    return response.json()

# Get profile data
profile = get_linkedin_profile('https://linkedin.com/in/satlokomern')

# Extract for network analysis
person = {
    'name': profile['full_name'],
    'current_company': profile['experiences'][0]['company'] if profile['experiences'] else None,
    'past_companies': [exp['company'] for exp in profile['experiences']],
    'education': [edu['school'] for edu in profile['education']],
    'connections': profile.get('connections')  # Often not available
}
```

#### People Data Labs

**What it does**: Bulk access to 1.5B+ person records

**Pricing**: API credits, starting ~$0.01/record

**Best for**: Large-scale network reconstruction

**Key advantage**: Employment history allows you to infer "worked together" relationships

```python
import requests

PDL_API_KEY = 'your_key'

def find_coworkers(company, year_range):
    """Find people who worked at a company during a time period."""
    response = requests.get(
        'https://api.peopledatalabs.com/v5/person/search',
        headers={'X-Api-Key': PDL_API_KEY},
        params={
            'query': f"experience.company.name:{company} AND experience.start_date:[{year_range[0]} TO {year_range[1]}]",
            'size': 100
        }
    )
    return response.json()['data']

# Find people who worked at Stripe 2018-2022
stripe_alumni = find_coworkers('Stripe', ('2018', '2022'))

# People with overlapping tenure likely know each other
# This is MUCH better than LinkedIn connections for inferring real relationships
```

---

## Scraping Tools

### Browser Automation Tools

These tools automate YOUR logged-in LinkedIn session:

#### Phantombuster

**Pricing**: Free tier (2 hours/day) to $900/mo (enterprise)

**Capabilities**:
- Profile visitor (triggers profile views)
- Profile scraper (export profile data)
- Search export (save search results)
- Connection automation

**Rate limits**: ~80 profiles/day safely

**Example workflow**:
```
1. Sales Navigator search → Save to CSV
2. Phantombuster profile scraper → Enrich with full data
3. Export to Google Sheets or Airtable
4. NetworkX analysis
```

#### Evaboot

**Pricing**: $49-99/mo

**Specialization**: Sales Navigator export specifically

**What it does**: One-click export of Sales Navigator searches

#### Dux-Soup / Octopus CRM / Waalaxy

**Pricing**: $15-100/mo range

**Capabilities**: Similar browser automation, varying features

### Scraping Risks & Mitigation

**Account ban risk factors**:
- Too many profile views (&gt;100/day)
- Automated patterns (regular intervals)
- Scraping from non-premium account
- Using headless browsers

**Mitigation strategies**:
```python
import random
import time

def human_like_delay():
    """Randomized delays to avoid detection."""
    base_delay = random.uniform(30, 90)  # 30-90 seconds
    jitter = random.gauss(0, 10)  # Normal distribution jitter
    return max(15, base_delay + jitter)

def scrape_with_delays(profile_urls):
    """Scrape with human-like patterns."""
    results = []
    for i, url in enumerate(profile_urls):
        # Don't scrape more than ~50/day
        if i >= 50:
            print("Daily limit reached")
            break

        result = scrape_profile(url)
        results.append(result)

        delay = human_like_delay()
        print(f"Waiting {delay:.1f}s before next request...")
        time.sleep(delay)

        # Take breaks
        if i > 0 and i % 10 == 0:
            long_break = random.uniform(300, 600)  # 5-10 minute break
            print(f"Taking {long_break/60:.1f} minute break...")
            time.sleep(long_break)

    return results
```

---

## Alternative Network Reconstruction

### This is the recommended approach for finding superconnectors.

### 1. Publication Co-authorship Networks

**Why this is gold**: Co-authorship requires months of collaboration and trust.

#### Semantic Scholar API (Free, Excellent)

```python
import requests
from collections import defaultdict
import networkx as nx

class SemanticScholarNetwork:
    BASE_URL = 'https://api.semanticscholar.org/graph/v1'

    def __init__(self):
        self.G = nx.Graph()
        self.author_cache = {}

    def search_papers(self, query, limit=100):
        """Search for papers by topic."""
        response = requests.get(
            f'{self.BASE_URL}/paper/search',
            params={
                'query': query,
                'limit': limit,
                'fields': 'title,authors,year,citationCount'
            }
        )
        return response.json().get('data', [])

    def get_author_papers(self, author_id):
        """Get all papers by an author."""
        response = requests.get(
            f'{self.BASE_URL}/author/{author_id}',
            params={'fields': 'papers.authors,papers.title,papers.year'}
        )
        return response.json()

    def build_coauthorship_network(self, papers):
        """Build network from list of papers."""
        for paper in papers:
            authors = paper.get('authors', [])
            author_ids = [a['authorId'] for a in authors if a.get('authorId')]

            # Add nodes
            for author in authors:
                if author.get('authorId'):
                    self.G.add_node(
                        author['authorId'],
                        name=author.get('name', 'Unknown')
                    )

            # Add edges between all co-authors
            for i, a1 in enumerate(author_ids):
                for a2 in author_ids[i+1:]:
                    if self.G.has_edge(a1, a2):
                        self.G[a1][a2]['weight'] += 1
                        self.G[a1][a2]['papers'].append(paper.get('title'))
                    else:
                        self.G.add_edge(a1, a2, weight=1, papers=[paper.get('title')])

        return self.G

    def find_superconnectors(self, top_n=20):
        """Find authors with highest betweenness centrality."""
        bc = nx.betweenness_centrality(self.G, weight='weight')
        sorted_bc = sorted(bc.items(), key=lambda x: x[1], reverse=True)

        results = []
        for author_id, score in sorted_bc[:top_n]:
            results.append({
                'author_id': author_id,
                'name': self.G.nodes[author_id].get('name'),
                'betweenness': score,
                'degree': self.G.degree(author_id),
                'collaborators': list(self.G.neighbors(author_id))
            })

        return results


# Usage Example: Find AI Safety superconnectors
network = SemanticScholarNetwork()

# Search for AI safety papers
papers = network.search_papers('AI safety alignment', limit=500)
print(f"Found {len(papers)} papers")

# Build co-authorship network
G = network.build_coauthorship_network(papers)
print(f"Network: {G.number_of_nodes()} authors, {G.number_of_edges()} collaborations")

# Find superconnectors
superconnectors = network.find_superconnectors(top_n=10)
for sc in superconnectors:
    print(f"{sc['name']}: BC={sc['betweenness']:.4f}, {sc['degree']} collaborators")
```

#### arXiv API (Free)

```python
import arxiv
from collections import defaultdict

def build_arxiv_network(query, max_results=500):
    """Build co-authorship network from arXiv papers."""

    search = arxiv.Search(
        query=query,
        max_results=max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate
    )

    G = nx.Graph()

    for paper in search.results():
        authors = [a.name for a in paper.authors]

        # Add nodes
        for author in authors:
            if author not in G:
                G.add_node(author, papers=1)
            else:
                G.nodes[author]['papers'] += 1

        # Add edges
        for i, a1 in enumerate(authors):
            for a2 in authors[i+1:]:
                if G.has_edge(a1, a2):
                    G[a1][a2]['weight'] += 1
                else:
                    G.add_edge(a1, a2, weight=1)

    return G

# Example: LLM research network
G = build_arxiv_network('cat:cs.CL AND (large language model OR LLM)', max_results=1000)
```

### 2. GitHub Collaboration Networks

```python
import requests
from collections import defaultdict

class GitHubNetwork:
    def __init__(self, token):
        self.token = token
        self.headers = {'Authorization': f'token {token}'}
        self.G = nx.Graph()

    def get_repo_contributors(self, owner, repo):
        """Get all contributors to a repository."""
        contributors = []
        page = 1

        while True:
            response = requests.get(
                f'https://api.github.com/repos/{owner}/{repo}/contributors',
                headers=self.headers,
                params={'page': page, 'per_page': 100}
            )

            if response.status_code != 200:
                break

            data = response.json()
            if not data:
                break

            contributors.extend(data)
            page += 1

        return contributors

    def get_pr_reviewers(self, owner, repo, limit=100):
        """Get PR review relationships (high trust signal)."""
        response = requests.get(
            f'https://api.github.com/repos/{owner}/{repo}/pulls',
            headers=self.headers,
            params={'state': 'all', 'per_page': limit}
        )

        reviews = defaultdict(lambda: defaultdict(int))

        for pr in response.json():
            author = pr['user']['login']

            # Get reviewers for this PR
            review_response = requests.get(
                pr['url'] + '/reviews',
                headers=self.headers
            )

            for review in review_response.json():
                reviewer = review['user']['login']
                if reviewer != author:
                    reviews[author][reviewer] += 1

        return reviews

    def build_network_from_repos(self, repos):
        """Build collaboration network from list of repos."""
        for owner, repo in repos:
            contributors = self.get_repo_contributors(owner, repo)

            # Add nodes
            for c in contributors:
                login = c['login']
                if login not in self.G:
                    self.G.add_node(login, contributions=c['contributions'])
                else:
                    self.G.nodes[login]['contributions'] += c['contributions']

            # Add edges between contributors (same repo = collaboration)
            logins = [c['login'] for c in contributors]
            for i, u1 in enumerate(logins):
                for u2 in logins[i+1:]:
                    if self.G.has_edge(u1, u2):
                        self.G[u1][u2]['weight'] += 1
                        self.G[u1][u2]['repos'].append(f"{owner}/{repo}")
                    else:
                        self.G.add_edge(u1, u2, weight=1, repos=[f"{owner}/{repo}"])

        return self.G


# Example: Build ML framework contributor network
github = GitHubNetwork('your_token')

ml_repos = [
    ('pytorch', 'pytorch'),
    ('tensorflow', 'tensorflow'),
    ('huggingface', 'transformers'),
    ('langchain-ai', 'langchain'),
    ('anthropics', 'anthropic-sdk-python'),
]

G = github.build_network_from_repos(ml_repos)
print(f"Network: {G.number_of_nodes()} developers, {G.number_of_edges()} collaborations")
```

### 3. Conference Speaker Networks

```python
import requests
from bs4 import BeautifulSoup
from collections import defaultdict

class ConferenceNetwork:
    def __init__(self):
        self.G = nx.Graph()
        self.speakers = defaultdict(list)  # speaker -> conferences

    def scrape_neurips_speakers(self, year):
        """Scrape NeurIPS speaker list."""
        # Note: Actual implementation depends on conference website structure
        # This is a template
        url = f'https://neurips.cc/{year}/Schedule'
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')

        sessions = []
        # Parse session data...
        return sessions

    def add_conference_edges(self, conference_name, sessions):
        """Add edges for co-presenters at same session."""
        for session in sessions:
            speakers = session.get('speakers', [])

            # Add nodes
            for speaker in speakers:
                if speaker not in self.G:
                    self.G.add_node(speaker, conferences=[conference_name])
                else:
                    if conference_name not in self.G.nodes[speaker]['conferences']:
                        self.G.nodes[speaker]['conferences'].append(conference_name)

            # Same panel/session = strong edge
            for i, s1 in enumerate(speakers):
                for s2 in speakers[i+1:]:
                    if self.G.has_edge(s1, s2):
                        self.G[s1][s2]['weight'] += 2  # Co-panel is strong signal
                    else:
                        self.G.add_edge(s1, s2, weight=2, type='co_panel')

            # Same conference = weak edge (add later in batch)

    def add_same_conference_edges(self):
        """Add weak edges between all speakers at same conference."""
        conference_speakers = defaultdict(list)

        for node in self.G.nodes():
            for conf in self.G.nodes[node].get('conferences', []):
                conference_speakers[conf].append(node)

        for conf, speakers in conference_speakers.items():
            for i, s1 in enumerate(speakers):
                for s2 in speakers[i+1:]:
                    if not self.G.has_edge(s1, s2):
                        self.G.add_edge(s1, s2, weight=0.5, type='same_conference')
```

### 4. Multi-Source Fusion

```python
def fuse_professional_networks(networks, weights):
    """
    Combine multiple network sources with configurable weights.

    Args:
        networks: dict of {source_name: nx.Graph}
        weights: dict of {source_name: float}

    Returns:
        Unified nx.Graph with combined edge weights
    """
    G_unified = nx.Graph()

    # Entity resolution: normalize names across sources
    name_mapping = {}  # Maps variations to canonical name

    for source, G_source in networks.items():
        source_weight = weights.get(source, 1.0)

        for u, v, data in G_source.edges(data=True):
            # Normalize names
            u_canonical = name_mapping.get(u, u)
            v_canonical = name_mapping.get(v, v)

            edge_weight = data.get('weight', 1.0) * source_weight

            if G_unified.has_edge(u_canonical, v_canonical):
                G_unified[u_canonical][v_canonical]['weight'] += edge_weight
                G_unified[u_canonical][v_canonical]['sources'].append(source)
            else:
                G_unified.add_edge(
                    u_canonical, v_canonical,
                    weight=edge_weight,
                    sources=[source]
                )

    return G_unified


# Example usage
networks = {
    'semantic_scholar': coauthorship_network,
    'github': github_network,
    'conferences': conference_network,
}

weights = {
    'semantic_scholar': 1.0,  # Strongest signal
    'github': 0.8,            # Strong signal
    'conferences': 0.6,       # Medium signal
}

unified = fuse_professional_networks(networks, weights)

# Now analyze the unified network
bc = nx.betweenness_centrality(unified, weight='weight')
superconnectors = sorted(bc.items(), key=lambda x: x[1], reverse=True)[:20]
```

---

## Legal Considerations

### LinkedIn Terms of Service

**Prohibited activities** (Section 8.2):
- Scraping or copying profiles
- Using bots or automated tools
- Circumventing access restrictions

**Consequences**:
- Account suspension/termination
- Legal action (rare but possible)

### hiQ Labs v. LinkedIn (2022)

**Key ruling**: Scraping *publicly available* LinkedIn data does not violate the Computer Fraud and Abuse Act (CFAA).

**What this means**:
- Criminal liability unlikely for public data scraping
- LinkedIn can still enforce ToS (ban accounts)
- Civil liability less clear

**Limitations**:
- Does not apply to logged-in scraping
- Does not override other laws (GDPR, CCPA)
- LinkedIn may use technical measures

### GDPR Considerations (EU)

If processing EU residents' data:
- Need legal basis (legitimate interest, consent)
- Data minimization required
- Right to erasure must be honored
- Document your processing activities

### Best Practices for Compliance

1. **Prefer public APIs** (Semantic Scholar, GitHub, arXiv)
2. **Use official exports** for your own data
3. **Buy from legitimate providers** who handle compliance
4. **Document business purpose** for any scraping
5. **Don't store unnecessary PII**
6. **Honor opt-out requests**

---

## Recommended Strategy

### For Finding Superconnectors

**Don't start with LinkedIn.** Start with better data:

```
Week 1: Define Target Domain
├── List key conferences
├── Identify top journals/venues
├── Find major open source projects
└── Note industry thought leaders (seed nodes)

Week 2: Build Publication Network
├── Semantic Scholar API for papers
├── arXiv for preprints
├── Google Scholar for citations
└── Identify high-betweenness authors

Week 3: Add Collaboration Signals
├── GitHub contributor networks
├── Conference speaker lists
├── Podcast guest appearances
└── Fuse with publication network

Week 4: Targeted Enrichment
├── Proxycurl for top 50 candidates
├── Apollo for contact info
├── LinkedIn manual research
└── Prioritized outreach list
```

### Cost-Effective Stack

| Purpose | Tool | Monthly Cost |
|---------|------|--------------|
| Publication data | Semantic Scholar API | Free |
| Code collaboration | GitHub API | Free |
| Conference data | Web scraping | Free |
| Contact enrichment | Apollo.io | $49 |
| LinkedIn profiles | Proxycurl | ~$20 (pay per use) |
| **Total** | | **~$70/month** |

### For Organizational Network Analysis

**Internal data sources** (requires proper authorization):
- Slack/Teams message patterns
- Meeting co-attendance (calendar)
- Email headers (not content)
- Document collaboration
- Code review assignments

**Survey-based ONA**:
- "Who do you go to for advice?"
- "Who do you collaborate with most?"
- "Who is influential in decisions?"

This is the gold standard for ONA—explicit relationship mapping with consent.

---

## Conclusion

For professional network analysis aimed at finding superconnectors:

1. **LinkedIn is overrated** for this purpose—connections ≠ relationships
2. **Co-authorship and code collaboration** are stronger signals
3. **Public data sources** are legally safer and often higher quality
4. **Targeted enrichment** of top candidates is more cost-effective than bulk scraping
5. **Multi-source fusion** produces the most accurate network maps

The best superconnector identification comes from asking: "Who has actually worked with people across multiple communities?"—and that question is best answered by publication, code, and conference data rather than LinkedIn connection counts.
