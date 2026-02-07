'use client';

import * as React from 'react';
import { Search, Sparkles, ArrowRight, Star } from 'lucide-react';
import { type Skill, skills } from '@/lib/skills';
import { Button } from '@/components/ui/button';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WEBSCAPE NAVIGATOR - Retro Browser Skill Search
 * "Ask Dageeves" - AI-powered skill discovery
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SkillSearchProps {
  onSelectSkill: (skill: Skill) => void;
}

export function SkillSearch({ onSelectSkill }: SkillSearchProps) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<Array<{ skill: Skill; reason: string }>>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [hasSearched, setHasSearched] = React.useState(false);

  // Simulated AI search (in production, this would call Haiku via API)
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Smart keyword matching (simplified version of what Haiku would do)
    const searchTerms = query.toLowerCase();
    const matchedSkills = skills
      .map(skill => {
        let score = 0;
        const reasons: string[] = [];

        // Check description match
        if (skill.description.toLowerCase().includes(searchTerms)) {
          score += 3;
          reasons.push('Matches your description');
        }

        // Check tag matches
        const matchingTags = skill.tags.filter(tag => 
          searchTerms.includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(searchTerms.split(' ')[0])
        );
        if (matchingTags.length > 0) {
          score += matchingTags.length * 2;
          reasons.push(`Tagged: ${matchingTags.join(', ')}`);
        }

        // Check title match
        if (skill.title.toLowerCase().includes(searchTerms.split(' ')[0])) {
          score += 5;
          reasons.push('Direct match');
        }

        // Keyword-based matching for common queries
        const keywordMatches: Record<string, string[]> = {
          'api': ['api-architect', 'rest-api-design', 'graphql', 'openapi-spec-writer'],
          'test': ['test-automation-expert', 'playwright-e2e-tester', 'vitest-testing-patterns'],
          'design': ['web-design-expert', 'design-system-creator', 'ui-designer', 'ux-friction-analyzer'],
          'debug': ['fullstack-debugger', 'refactoring-surgeon'],
          'deploy': ['devops-automator', 'cloudflare-worker-dev', 'vercel-deployment'],
          'ai': ['ai-engineer', 'prompt-engineer', 'llm-streaming-response-handler'],
          'database': ['postgresql-optimization', 'drizzle-migrations', 'data-pipeline-engineer'],
          'mobile': ['mobile-ux-optimizer', 'pwa-expert', 'native-app-designer'],
          'security': ['security-auditor', 'hipaa-compliance', 'oauth-oidc-implementer'],
          'write': ['technical-writer', 'email-composer', 'recovery-education-writer'],
          'career': ['career-biographer', 'cv-creator', 'job-application-optimizer'],
        };

        for (const [keyword, skillIds] of Object.entries(keywordMatches)) {
          if (searchTerms.includes(keyword) && skillIds.includes(skill.id)) {
            score += 4;
            reasons.push(`Expert in ${keyword}`);
          }
        }

        return { skill, score, reason: reasons[0] || 'Related skill' };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ skill, reason }) => ({ skill, reason }));

    // If no matches, show some defaults based on category
    if (matchedSkills.length === 0) {
      const defaults = skills.slice(0, 3).map(skill => ({
        skill,
        reason: 'Popular skill you might like',
      }));
      setResults(defaults);
    } else {
      setResults(matchedSkills);
    }

    setIsSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Browser Chrome */}
      <BrowserChrome />

      {/* Browser Content */}
      <div className="flex-1 overflow-auto bg-win31-gray-light">
        <div className="mx-auto max-w-3xl p-6">
          {/* Search Portal Header */}
          <div className="mb-8 text-center">
            {/* Dageeves Logo */}
            <div className="mb-4 inline-flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/ask-dageeves.webp" 
                alt="Ask Dageeves butler mascot"
                className="h-24 w-24 object-contain drop-shadow-lg"
              />
              <div className="text-left">
                <h1 className="font-serif text-4xl font-bold tracking-tight">
                  <span className="text-purple-700">Ask</span>{' '}
                  <span className="text-indigo-600">Dageeves</span>
                </h1>
                <p className="text-sm text-win31-gray-darker italic">
                  &ldquo;Your AI butler for Claude skills&rdquo;
                </p>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative mx-auto max-w-xl">
              <div className="flex items-stretch overflow-hidden rounded-sm border-4 border-win31-black bg-white shadow-[4px_4px_0_var(--color-win31-black)]">
                <div className="flex items-center bg-purple-100 px-3">
                  <Search className="h-5 w-5 text-purple-600" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What do you want to build with AI today?"
                  className="flex-1 px-4 py-3 text-lg outline-none placeholder:text-win31-gray-darker/50"
                />
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="rounded-none border-0 border-l-4 border-win31-black"
                >
                  {isSearching ? (
                    <span className="animate-pulse">Searching...</span>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Ask Dageeves
                    </>
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-win31-gray-darker">
                Try: &ldquo;build an API&rdquo;, &ldquo;test my React app&rdquo;, &ldquo;design a dashboard&rdquo;
              </p>
            </div>
          </div>

          {/* Search Results */}
          {hasSearched && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-win31-navy">
                <Star className="h-4 w-4" />
                {results.length > 0 ? 'Dageeves Found These Skills For You' : 'No exact matches, but try these...'}
              </h2>
              <div className="space-y-3">
                {results.map(({ skill, reason }) => (
                  <SearchResultCard
                    key={skill.id}
                    skill={skill}
                    reason={reason}
                    onClick={() => onSelectSkill(skill)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Marquee of Skills */}
          <SkillMarquee skills={skills} onSelectSkill={onSelectSkill} />

          {/* Advertisement Banners - Using actual images */}
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {/* Learn to Build Skills */}
            <button
              onClick={() => window.open('https://github.com/erichowens/some_claude_skills', '_blank')}
              className="group relative overflow-hidden rounded-sm border-4 border-win31-black bg-win31-gray shadow-[4px_4px_0_var(--color-win31-black)] transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/learn_to_build_skills.webp" 
                alt="Learn to Build Skills"
                className="h-24 w-full object-cover"
              />
              <div className="bg-win31-yellow px-2 py-1 text-center text-xs font-bold text-win31-black">
                CLICK HERE!
              </div>
            </button>

            {/* winDAGs.AI Banner */}
            <button
              onClick={() => {}}
              className="group relative overflow-hidden rounded-sm border-4 border-win31-black bg-win31-gray shadow-[4px_4px_0_var(--color-win31-black)] transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/windags-banner.webp" 
                alt="winDAGs.AI - The Future of AI Workflows"
                className="h-24 w-full object-cover"
              />
              <div className="absolute -right-6 top-2 rotate-45 bg-win31-lime px-8 py-0.5 text-xs font-bold text-win31-black shadow">
                NEW
              </div>
            </button>

            {/* Smaller winDAGs Logo */}
            <button
              onClick={() => {}}
              className="group relative flex items-center justify-center overflow-hidden rounded-sm border-4 border-win31-black bg-gradient-to-br from-purple-900 to-indigo-900 shadow-[4px_4px_0_var(--color-win31-black)] transition-transform hover:scale-105"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/img/smaller-windags-logo.webp" 
                alt="winDAGs.AI"
                className="h-24 w-full object-contain p-2"
              />
            </button>
          </div>

          {/* Cool Site Awards Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t-2 border-dashed border-win31-gray-darker pt-6">
            {/* Main Cool Skill Badge - actual image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/img/cool-skill-of-the-day-transparent-bg.webp" 
              alt="Cool Skill of the Day"
              className="h-20 w-auto drop-shadow-lg"
            />
            <CoolSiteBadge text="Best of Claude 2026" />
            <CoolSiteBadge text="Top 100 AI Tools" />
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * Browser Chrome Component
 */
function BrowserChrome() {
  return (
    <div className="flex-shrink-0 border-b-4 border-win31-black bg-win31-gray">
      {/* Title Bar */}
      <div className="flex items-center justify-between bg-gradient-to-r from-win31-navy to-win31-blue px-3 py-1">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="/img/webscape-logo-transparent-bg.webp" 
            alt="Webscape Navigator"
            className="h-5 w-5 object-contain"
          />
          <span className="font-mono text-sm font-bold text-white">
            Webscape Navigator 3.1
          </span>
        </div>
        <div className="flex gap-1">
          <button className="flex h-5 w-5 items-center justify-center border border-win31-black bg-win31-gray text-xs font-bold">_</button>
          <button className="flex h-5 w-5 items-center justify-center border border-win31-black bg-win31-gray text-xs font-bold">□</button>
          <button className="flex h-5 w-5 items-center justify-center border border-win31-black bg-win31-gray text-xs font-bold">✕</button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="flex gap-4 border-b border-win31-gray-darker px-2 py-1 text-xs">
        <span className="hover:bg-win31-navy hover:text-white px-2">File</span>
        <span className="hover:bg-win31-navy hover:text-white px-2">Edit</span>
        <span className="hover:bg-win31-navy hover:text-white px-2">View</span>
        <span className="hover:bg-win31-navy hover:text-white px-2">Go</span>
        <span className="hover:bg-win31-navy hover:text-white px-2">Bookmarks</span>
        <span className="hover:bg-win31-navy hover:text-white px-2">Help</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-2 py-1">
        <ToolbarButton icon="←" label="Back" />
        <ToolbarButton icon="→" label="Forward" />
        <ToolbarButton icon="🏠" label="Home" />
        <ToolbarButton icon="🔄" label="Reload" />
        <div className="h-6 w-px bg-win31-gray-darker" />
        <ToolbarButton icon="🔍" label="Search" />
        <ToolbarButton icon="⭐" label="Bookmarks" />
      </div>

      {/* Location Bar */}
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="text-xs font-semibold text-win31-gray-darker">Location:</span>
        <div className="flex flex-1 items-center border-2 border-win31-black bg-white px-2 py-0.5 shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)]">
          <span className="font-mono text-sm text-win31-gray-darker">http://</span>
          <span className="font-mono text-sm">someclaudeskills.com/search</span>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      title={label}
      className="flex h-8 w-8 items-center justify-center border-2 border-win31-black bg-win31-gray text-sm shadow-[inset_1px_1px_0_var(--color-win31-white),inset_-1px_-1px_0_var(--color-win31-gray-darker)] hover:bg-win31-gray-light active:shadow-[inset_-1px_-1px_0_var(--color-win31-white),inset_1px_1px_0_var(--color-win31-gray-darker)]"
    >
      {icon}
    </button>
  );
}

/*
 * Search Result Card
 */
interface SearchResultCardProps {
  skill: Skill;
  reason: string;
  onClick: () => void;
}

function SearchResultCard({ skill, reason, onClick }: SearchResultCardProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-4 rounded-sm border-2 border-win31-black bg-white p-4 text-left transition-all hover:bg-purple-50 hover:shadow-md"
    >
      {/* Skill Icon */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-purple-100 to-indigo-100 text-2xl">
        {skill.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-win31-navy">{skill.title}</h3>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
            {reason}
          </span>
        </div>
        <p className="mt-1 text-sm text-win31-gray-darker line-clamp-2">
          {skill.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {skill.tags.slice(0, 4).map(tag => (
            <span key={tag} className="rounded bg-win31-gray-light px-1.5 py-0.5 text-xs text-win31-gray-darker">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-5 w-5 flex-shrink-0 text-purple-400" />
    </button>
  );
}

/*
 * Skill Marquee - Classic 90s scrolling banner!
 */
function SkillMarquee({ skills, onSelectSkill }: { skills: Skill[]; onSelectSkill: (s: Skill) => void }) {
  // Take a random subset for the marquee
  const marqueeSkills = React.useMemo(() => {
    const shuffled = [...skills].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  }, [skills]);

  return (
    <div className="overflow-hidden rounded-sm border-2 border-win31-black bg-win31-navy py-2">
      <div className="flex animate-marquee gap-4 whitespace-nowrap">
        {[...marqueeSkills, ...marqueeSkills].map((skill, i) => (
          <button
            key={`${skill.id}-${i}`}
            onClick={() => onSelectSkill(skill)}
            className="inline-flex items-center gap-2 rounded-sm bg-win31-gray px-3 py-1 text-sm font-medium text-win31-black hover:bg-win31-lime transition-colors"
          >
            <span>{skill.icon}</span>
            <span>{skill.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/*
 * Cool Site Badge
 */
function CoolSiteBadge({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-sm border-2 border-win31-black bg-gradient-to-r from-purple-500 to-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-md">
      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
      {text}
      <Star className="h-3 w-3 fill-yellow-300 text-yellow-300" />
    </div>
  );
}

export default SkillSearch;
