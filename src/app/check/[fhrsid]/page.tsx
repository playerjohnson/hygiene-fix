import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEstablishment } from '@/lib/fsa-api';
import { interpretRating, formatRatingDate, daysSinceRating, getRatingColor } from '@/lib/scores';
import { detectJurisdiction } from '@/lib/jurisdiction';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import EmailCapture from '@/components/EmailCapture';
import RatingBadge from '@/components/RatingBadge';
import CheckoutButton from '@/components/CheckoutButton';
import {
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  ExternalLink,
  Info,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ fhrsid: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { fhrsid } = await params;
  const est = await getEstablishment(Number(fhrsid));
  if (!est) return { title: 'Business Not Found — HygieneFix' };

  return {
    title: `${est.BusinessName} — Food Hygiene Rating ${est.RatingValue} | HygieneFix`,
    description: `${est.BusinessName} in ${est.PostCode} has a food hygiene rating of ${est.RatingValue}. See the full score breakdown and get improvement advice.`,
  };
}

export default async function CheckPage({ params }: PageProps) {
  const { fhrsid } = await params;
  const est = await getEstablishment(Number(fhrsid));

  if (!est) notFound();

  const breakdown = interpretRating(est);
  const ratingNum = parseInt(est.RatingValue) || 0;
  const isLow = ratingNum <= 2;
  const daysAgo = daysSinceRating(est.RatingDate);
  const address = [est.AddressLine1, est.AddressLine2, est.AddressLine3, est.AddressLine4, est.PostCode]
    .filter(Boolean)
    .join(', ');
  const ratingColor = getRatingColor(ratingNum);
  const jurisdiction = detectJurisdiction(est.SchemeType, est.LocalAuthorityName);

  return (
    <>
      <Header />
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Jurisdiction notices */}
        {jurisdiction.notices.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-brand-amber/20 bg-brand-amber/5">
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
              <div className="space-y-2">
                {jurisdiction.notices.map((notice, i) => (
                  <p key={i} className="text-xs text-white/50 leading-relaxed">{notice}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors mb-8"
        >
          ← Back to search
        </Link>

        {/* Business header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          <RatingBadge rating={est.RatingValue} size="xl" showLabel />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight">
              {est.BusinessName}
            </h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-white/40">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {address}
              </span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> {est.BusinessType}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Inspected {formatRatingDate(est.RatingDate)}
                {daysAgo > 0 && <span className="text-white/25">({daysAgo} days ago)</span>}
              </span>
            </div>

            {/* Overall verdict */}
            <div
              className="mt-4 p-4 rounded-xl border"
              style={{ borderColor: ratingColor + '33', backgroundColor: ratingColor + '0A' }}
            >
              <p className="text-sm font-semibold" style={{ color: ratingColor }}>
                {breakdown.overall.label}
              </p>
              <p className="text-sm text-white/50 mt-1">{breakdown.overall.description}</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {breakdown.scores.length > 0 ? (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full" style={{ backgroundColor: ratingColor }} />
              Score Breakdown
            </h2>
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
              <ScoreBreakdown scores={breakdown.scores} />
            </div>
          </section>
        ) : (
          <section className="mb-10">
            <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] text-center">
              <Info className="w-6 h-6 text-white/30 mx-auto mb-2" />
              <p className="text-sm text-white/40">
                Detailed score breakdown is not available for this establishment.
                This may be because the business is exempt, awaiting inspection, or uses the Scottish FHIS scheme.
              </p>
            </div>
          </section>
        )}

        {/* Primary action */}
        {isLow && breakdown.primaryAction && (
          <section className="mb-10">
            <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-brand-amber" />
              Priority Action
            </h2>
            <div className="p-6 rounded-2xl border border-brand-amber/20 bg-brand-amber/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-brand-amber mb-1">
                    Your biggest area for improvement: {breakdown.worstArea}
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {breakdown.primaryAction}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Delivery platform warning */}
        {isLow && (
          <section className="mb-10">
            <div className="p-5 rounded-2xl border border-brand-red/20 bg-brand-red/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-brand-red mb-1">
                    Your rating may affect delivery platform listings
                  </p>
                  <p className="text-sm text-white/50 leading-relaxed">
                    Businesses rated below 3 risk removal from Deliveroo, Just Eat, and Uber Eats.
                    For takeaways and restaurants, this can mean losing 30–50% of revenue overnight.
                    {ratingNum <= 1 && ' At your current rating, removal is likely already in effect.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA: Get action plan */}
        {isLow && (
          <section className="mb-10">
            <div className="p-6 sm:p-8 rounded-2xl border border-brand-blue/20 bg-gradient-to-br from-brand-blue/10 to-brand-sky/5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="flex-1">
                  <h3 className="font-display text-xl font-bold mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-sky" />
                    Get Your Personalised Action Plan
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed mb-4">
                    A detailed, prioritised checklist tailored to your exact scores. Know exactly what to fix,
                    in what order, with SFBB documentation guidance and re-inspection preparation.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-white/40">
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-green" /> Score-specific steps</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-green" /> Priority ranked</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-green" /> Re-inspection ready</span>
                  </div>
                  <a
                    href="/api/sample-plan"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-sky hover:text-brand-sky/80 mt-3 transition-colors"
                  >
                    <FileText className="w-3 h-3" /> See a sample action plan (PDF)
                  </a>
                  <p className="text-[10px] text-white/25 mt-3 leading-relaxed">
                    This action plan is AI-generated based on FSA inspection criteria. It is not a substitute for advice from a
                    qualified Environmental Health Professional. HygieneFix accepts no liability for reinspection outcomes.
                  </p>
                </div>
                <CheckoutButton fhrsid={String(est.FHRSID)} businessName={est.BusinessName} />
              </div>
            </div>
          </section>
        )}

        {/* Email capture */}
        <section className="mb-10">
          <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
            <EmailCapture
              fhrsid={String(est.FHRSID)}
              businessName={est.BusinessName}
              context={isLow
                ? 'Get free improvement tips for your specific scores:'
                : 'Get food safety tips and regulation updates:'
              }
            />
          </div>
        </section>

        {/* Local authority info */}
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-5 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-brand-slate" />
            Your Local Authority
          </h2>
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
            <p className="font-semibold text-white/80 mb-2">{est.LocalAuthorityName}</p>
            {est.LocalAuthorityEmailAddress && (
              <p className="text-sm text-white/40 mb-1">
                Email: <a href={`mailto:${est.LocalAuthorityEmailAddress}`} className="text-brand-sky hover:underline">{est.LocalAuthorityEmailAddress}</a>
              </p>
            )}
            {est.LocalAuthorityWebSite && (
              <a
                href={est.LocalAuthorityWebSite.startsWith('http') ? est.LocalAuthorityWebSite : `https://${est.LocalAuthorityWebSite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-sky hover:underline"
              >
                Visit website <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="text-xs text-white/20 text-center leading-relaxed">
          <p>
            Rating data sourced from the Food Standards Agency under the Open Government Licence v3.0.
            HygieneFix is not affiliated with the FSA or any local authority.
            Information is provided for guidance only and should not be relied upon as professional food safety advice.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
