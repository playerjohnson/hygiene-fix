import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAllPosts } from '@/data/blog';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Food Hygiene Blog | HygieneFix',
  description: 'Guides, tips, and compliance advice for UK food businesses. Improve your food hygiene rating with expert knowledge.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-8">
          ← Back to home
        </Link>

        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Food Hygiene <span className="text-brand-sky">Blog</span>
        </h1>
        <p className="text-sm text-white/50 leading-relaxed mb-10 max-w-2xl">
          Practical guides for UK food businesses. Understand your rating, prepare for inspections, and improve your score.
        </p>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-3 text-xs text-white/30 mb-3">
                <span className="px-2 py-0.5 rounded-full bg-brand-blue/10 text-brand-sky font-semibold">
                  {post.category}
                </span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
              </div>
              <h2 className="font-display text-lg font-bold text-white/80 group-hover:text-white transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mb-3">
                {post.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm text-brand-sky group-hover:gap-2.5 transition-all">
                Read more <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
