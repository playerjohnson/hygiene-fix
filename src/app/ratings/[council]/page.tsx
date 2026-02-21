import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CouncilEstablishments from '@/components/CouncilEstablishments';
import { getAuthorities, getLowRatedByAuthority } from '@/lib/fsa-api';
import { MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

interface PageProps {
  params: Promise<{ council: string }>;
}

// Build on-demand via ISR — the FSA API rate-limits bulk requests from
// Vercel build infra (403), so we generate pages on first visit instead.
export async function generateStaticParams() {
  return [];
}

export const dynamicParams = true;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function deslugify(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function findAuthority(slug: string) {
  try {
    const data = await getAuthorities();
    return data.authorities.find((a) => slugify(a.Name) === slug) || null;
  } catch {
    // If FSA API is down, return a synthetic authority from the slug
    return { LocalAuthorityId: 0, Name: deslugify(slug) };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { council } = await params;
  const name = deslugify(council);

  return {
    title: `Food Hygiene Ratings in ${name} | HygieneFix`,
    description: `See food hygiene ratings for businesses in ${name}. Find establishments rated 0–2 and get improvement action plans. Updated daily from FSA data.`,
    openGraph: {
      title: `Food Hygiene Ratings in ${name}`,
      description: `Check food hygiene ratings in ${name}. ${name} businesses rated 0–2 may need urgent improvements.`,
    },
  };
}

export const revalidate = 86400; // Revalidate daily

export default async function CouncilPage({ params }: PageProps) {
  const { council } = await params;
  const authority = await findAuthority(council);
  if (!authority) notFound();

  let lowRated;
  try {
    lowRated = await getLowRatedByAuthority(authority.LocalAuthorityId, 2, 1, 100);
  } catch {
    lowRated = { establishments: [], meta: { totalCount: 0, itemCount: 0, dataSource: '', extractDate: '', returncode: null, totalPages: 0, pageSize: 100, pageNumber: 1 } };
  }

  const totalLow = lowRated.meta?.totalCount || 0;
  const establishments = lowRated.establishments || [];

  return (
    <>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-8">
          ← Back to search
        </Link>

        <div className="mb-10">
          <div className="flex items-center gap-2 text-brand-sky text-xs font-semibold mb-3">
            <MapPin className="w-3.5 h-3.5" />
            Local Authority Area
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            Food Hygiene Ratings in {authority.Name}
          </h1>
          <p className="text-sm text-white/50 leading-relaxed max-w-2xl">
            There {totalLow === 1 ? 'is' : 'are'} currently <strong className="text-brand-amber">{totalLow.toLocaleString()} business{totalLow !== 1 ? 'es' : ''}</strong> rated
            0–2 in {authority.Name}. These businesses need urgent improvements to meet food safety standards.
            Data updated daily from the Food Standards Agency.
          </p>
        </div>

        {/* Filterable low-rated businesses */}
        {establishments.length > 0 && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-brand-amber" />
              Businesses Rated 0–2
              <span className="text-sm font-normal text-white/30 ml-2">({totalLow} total)</span>
            </h2>
            <CouncilEstablishments
              establishments={establishments}
              totalCount={totalLow}
              authorityName={authority.Name}
            />
          </section>
        )}

        {/* Info box */}
        <section className="mb-10">
          <div className="p-6 rounded-2xl border border-brand-amber/20 bg-brand-amber/5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-brand-amber mb-1">
                  Is your business rated 0–2?
                </p>
                <p className="text-sm text-white/50 leading-relaxed">
                  Businesses rated below 3 risk removal from delivery platforms like Deliveroo, Just Eat, and Uber Eats.
                  Get a personalised action plan showing exactly what to fix before your next inspection.
                </p>
                <Link
                  href="/#search"
                  className="inline-flex items-center gap-1.5 text-sm text-brand-sky hover:underline mt-3"
                >
                  Check your rating <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-xs text-white/20 text-center leading-relaxed">
          <p>
            Rating data sourced from the Food Standards Agency under the Open Government Licence v3.0.
            HygieneFix is not affiliated with the FSA or {authority.Name}.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
