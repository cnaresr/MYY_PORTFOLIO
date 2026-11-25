"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Calendar, Clock, Search, X } from "lucide-react";

export interface BlogPostSummary {
  slug: string;
  title: string;
  description: string;
  pubDate: string;
  lang: "en" | "id";
  tags: string[];
  readingTime: number;
  coverImage?: string;
}

interface BlogFilterGridProps {
  posts: BlogPostSummary[];
}

type LangFilter = "all" | "en" | "id";

const LANG_OPTIONS: { value: LangFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "en", label: "EN" },
  { value: "id", label: "ID" },
];

function formatPostDate(isoDate: string, lang: "en" | "id"): string {
  return new Date(isoDate).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function BlogFilterGrid({ posts }: BlogFilterGridProps) {
  const [langFilter, setLangFilter] = useState<LangFilter>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag]) => tag);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return posts.filter((post) => {
      if (langFilter !== "all" && post.lang !== langFilter) {
        return false;
      }
      if (selectedTag && !post.tags.includes(selectedTag)) {
        return false;
      }
      if (query) {
        const haystack = [post.title, post.description, ...post.tags]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [posts, langFilter, selectedTag, searchQuery]);

  const hasActiveFilters =
    langFilter !== "all" || selectedTag !== null || searchQuery.trim().length > 0;

  const resetFilters = () => {
    setLangFilter("all");
    setSelectedTag(null);
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Language Filter */}
          <div
            className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 self-start"
            role="group"
            aria-label="Filter posts by language"
          >
            {LANG_OPTIONS.map((option) => {
              const active = langFilter === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLangFilter(option.value)}
                  aria-pressed={active}
                  className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    active
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, tags..."
              aria-label="Search blog posts"
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-['Hanken_Grotesk'] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:focus:ring-white/20 focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filter Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold mr-1">
              Tags:
            </span>
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              aria-pressed={selectedTag === null}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold uppercase tracking-wider border transition-colors cursor-pointer ${
                selectedTag === null
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(active ? null : tag)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold tracking-wider border transition-colors cursor-pointer ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-slate-950 dark:border-emerald-500"
                      : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
        <span>
          Showing {filteredPosts.length} of {posts.length}{" "}
          {posts.length === 1 ? "article" : "articles"}
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white underline underline-offset-4 cursor-pointer"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900/70 border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-500" />
          <p className="font-['Space_Grotesk'] text-lg font-bold text-slate-900 dark:text-white">
            No matching articles found
          </p>
          <p className="font-['Hanken_Grotesk'] text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Try clearing your search query or switching language and tag filters.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Top Meta Row */}
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold uppercase tracking-wider border ${
                      post.lang === "id"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/25"
                    }`}
                  >
                    {post.lang.toUpperCase()}
                  </span>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {formatPostDate(post.pubDate, post.lang)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {post.readingTime} min
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="font-['Space_Grotesk'] text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {post.title}
                  </h2>
                  <p className="font-['Hanken_Grotesk'] text-sm sm:text-[15px] leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {post.description}
                  </p>
                </div>
              </div>

              {/* Bottom Tags & Read More */}
              <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 font-mono text-[11px] text-slate-600 dark:text-slate-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-slate-900 dark:text-white shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Read
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
