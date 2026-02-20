import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchBar from '@/components/SearchBar';
import EmailCapture from '@/components/EmailCapture';
import {
  ShieldCheck,
  Search,
  BarChart3,
  FileText,
  AlertTriangle,
  TrendingDown,
  Clock,
  ChevronDown,
  Zap,
  Lock,
  Users,
} from 'lucide-react';

const STATS = [
  { value: '14,000+', label: 'UK businesses rated 0–2', icon: AlertTriangle },
  { value: '~100', label: 'New low ratings daily', icon: TrendingDown },
  { value: '3 months', label: 'Average time to re-inspect', icon: Clock },
];

const STEPS = [
  { icon: Search, title: 'Search Your Business', desc: 'Enter your postcode or business name. We pull your official FSA food hygiene data instantly.' },
  { icon: BarChart3, title: 'See Your Score Breakdown', desc: 'Understand exactly where you lost marks — hygiene handling, structural condition, or management systems.' },
  { icon: FileText, title: 'Get Your Action Plan', desc: 'Receive a personalised, prioritised checklist showing exactly what to fix before requesting a re-inspection.' },
];

const FAQ_ITEMS = [
  {
    q: 'Where does the rating data come from?',
    a: 'All data comes directly from the Food Standards Agency (FSA) public register, updated daily. We display the same scores your local authority records.',
  },
  {
    q: 'Can I really improve my rating?',
    a: 'Absolutely. Most businesses rated 0–2 can reach a 4 or 5 within 3–6 months with the right improvements. The key is understanding your specific score breakdown and addressing the weakest areas first.',
  },
  {
    q: 'How quickly can I get re-inspected?',
    a: 'You can request a re-inspection from your local authority at any time. Most councils charge £170–£342 and aim to re-inspect within 3 months. Our checklist helps you prepare so you pass first time.',
  },
  {
    q: 'What if my business isn\'t showing up?',
    a: 'Try searching by both postcode and business name. New businesses or very recent inspections may take a few days to appear on the FSA register. Scottish businesses use a different scheme (FHIS) which we don\'t currently cover.',
  },
  {
    q: 'Is this an official FSA service?',
    a: 'No. HygieneFix is an independent service that uses publicly available FSA data. We are not affiliated with the Food Standards Agency or any local authority.',
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-white/5 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors">
        <span className="text-sm font-semibold text-white/80 pr-4">{q}</span>
        <ChevronDown className="w-4 h-4 text-white/30 shrink-0 group-open:rotate-180 transition-transform" />
      </summary>
      <div className="px-5 pb-4">
        <p className="text-sm text-white/50 leading-relaxed">{a}</p>
      </div>
    </details>
  );
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center relative z-40">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold mb-6 animate-fade-in">
            <AlertTriangle className="w-3.5 h-3.5" />
            14,000+ UK food businesses currently rated 0–2
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 animate-slide-up">
            Your Food Hygiene Rating Is
            <span className="text-brand-sky"> Costing You</span> Customers
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 animate-slide-up stagger-1 leading-relaxed">
            Low ratings lose you delivery platforms, walk-in trade, and reputation.
            Check your scores, understand exactly where you lost marks, and get a clear plan to fix it.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto animate-slide-up stagger-2 relative z-50">
            <SearchBar size="hero" />
          </div>

          <p className="text-xs text-white/25 mt-4 animate-fade-in stagger-3">
            Free instant check · Official FSA data · No signup required
          </p>
        </section>

        {/* Stats bar */}
        <section className="border-y border-white/5 bg-white/[0.01] relative z-0">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-10 h-10 rounded-xl bg-brand-amber/10 flex items-center justify-center shrink-0">
                  <stat.icon className="w-5 h-5 text-brand-amber" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/40">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why it matters */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-4">
            A Low Rating Isn&apos;t Just Embarrassing
          </h2>
          <p className="text-center text-white/40 max-w-2xl mx-auto mb-12">
            It&apos;s actively losing you money — every single day.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Delivery Platforms Drop You',
                desc: 'Just Eat removed all zero-rated restaurants. Uber Eats requires a 2. Deliveroo removes 0 and 1 rated businesses. A low rating cuts off your biggest revenue stream.',
                color: 'text-brand-red',
                bg: 'bg-brand-red/10',
              },
              {
                icon: Users,
                title: 'Walk-In Customers Check First',
                desc: '73% of consumers check food hygiene ratings before eating somewhere new. Your low rating is the first thing they see — and the last reason they need to go elsewhere.',
                color: 'text-brand-amber',
                bg: 'bg-brand-amber/10',
              },
              {
                icon: Lock,
                title: 'Enforcement Gets Serious',
                desc: 'Persistent low ratings lead to more frequent inspections, improvement notices, and ultimately prosecution. Environmental health officers keep closer tabs on businesses rated 0–2.',
                color: 'text-brand-orange',
                bg: 'bg-brand-orange/10',
              },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">
            Three Steps to a <span className="text-brand-green">Better Rating</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center mx-auto mb-5">
                  <step.icon className="w-7 h-7 text-brand-sky" />
                </div>
                <div className="absolute top-8 -right-4 w-8 h-0.5 bg-white/10 hidden md:block last:hidden" />
                <span className="text-xs font-mono text-brand-sky/50 mb-2 block">0{i + 1}</span>
                <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing teaser */}
        <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="rounded-3xl border border-white/5 bg-white/[0.02] p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              Free check · Paid action plan
            </div>
            <h2 className="font-display text-3xl font-bold mb-3">
              Free Rating Check. <span className="text-brand-sky">£49</span> Action Plan.
            </h2>
            <p className="text-white/40 max-w-xl mx-auto mb-8">
              Your score breakdown is always free. When you&apos;re ready to fix it, get a personalised,
              prioritised improvement checklist — tailored to your exact scores, business type, and local authority.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
              {[
                'Score-specific improvement steps',
                'Priority order (quick wins first)',
                'SFBB/HACCP documentation guide',
                'Re-inspection preparation checklist',
                'Local authority contact & process',
                'Consultant matching (optional)',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span className="text-sm text-white/60">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="font-display text-3xl font-bold text-center mb-10">
            Common Questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>

        {/* Email capture */}
        <section className="max-w-xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold mb-2 text-center">Stay Informed</h3>
            <p className="text-sm text-white/40 text-center mb-6">
              Get food safety tips, regulation updates, and improvement advice — free.
            </p>
            <EmailCapture context="Enter your email for free improvement tips:" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
