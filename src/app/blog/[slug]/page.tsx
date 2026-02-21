import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts, getPostBySlug } from '@/data/blog';
import { Calendar, Clock, ArrowLeft, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.title} | HygieneFix`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function renderMarkdown(content: string) {
  // Simple markdown-to-JSX for blog posts
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={key++} className="text-sm text-white/60 leading-relaxed mb-4">
            {renderInline(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h2 key={key++} className="font-display text-xl font-bold text-white mt-8 mb-4">
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      flushParagraph();
      elements.push(
        <p key={key++} className="text-sm font-semibold text-white/70 mb-2 mt-4">
          {trimmed.slice(2, -2)}
        </p>
      );
    } else if (trimmed === '') {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }
  flushParagraph();

  return elements;
}

function renderInline(text: string): React.ReactNode[] {
  // Handle **bold** and inline text
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={key++} className="text-white/70 font-semibold">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;

  // Article schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'HygieneFix',
      url: 'https://hygienefix.co.uk',
    },
    publisher: {
      '@type': 'Organization',
      name: 'HygieneFix',
      url: 'https://hygienefix.co.uk',
    },
  };

  return (
    <>
      <Header />
      <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-8">
          <ArrowLeft className="w-3 h-3" /> All articles
        </Link>

        <article>
          <div className="flex items-center gap-3 text-xs text-white/30 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-sky font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="prose-hygiene">
            {renderMarkdown(post.content)}
          </div>
        </article>

        {/* CTA */}
        <div className="mt-12 p-6 rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 to-brand-sky/5 text-center">
          <h3 className="font-display text-lg font-bold mb-2">Check Your Rating Now</h3>
          <p className="text-sm text-white/50 mb-4">See your score breakdown instantly. Free check, no signup required.</p>
          <Link
            href="/#search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-sky text-brand-navy text-sm font-bold hover:bg-brand-sky/90 transition-colors"
          >
            Check my rating <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Prev/Next navigation */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost && (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-xs text-white/30">← Previous</span>
              <p className="text-sm font-semibold text-white/60 mt-1 line-clamp-2">{prevPost.title}</p>
            </Link>
          )}
          {nextPost && (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors sm:text-right"
            >
              <span className="text-xs text-white/30">Next →</span>
              <p className="text-sm font-semibold text-white/60 mt-1 line-clamp-2">{nextPost.title}</p>
            </Link>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
