import React from 'react';
import { QuotationForm } from './QuotationForm';
import { Sparkles, Phone, MessageSquare, Mail, CheckCircle2, ChevronRight, Waves, ShieldCheck } from 'lucide-react';

interface SelloLandingProps {
  onOpenAuth: (mode: 'signup' | 'login') => void;
  onOpenTracker: () => void;
  onOpenDriveModal: () => void;
}

export const SelloLanding: React.FC<SelloLandingProps> = ({
  onOpenAuth,
  onOpenTracker,
  onOpenDriveModal,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0a6f93] to-[#06364d] text-[#eaf8fb] overflow-hidden pt-24 pb-20 min-h-[85vh] flex items-center">
        {/* Background Grid Tiles */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'linear-gradient(180deg, #000 30%, transparent 95%)',
          }}
        />

        {/* Caustic water drift lines */}
        <div className="absolute left-[-10%] top-[18%] w-[120%] h-[140px] opacity-40 caustic-1 pointer-events-none bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent blur-xl" />
        <div className="absolute left-[-10%] top-[46%] w-[120%] h-[140px] opacity-30 caustic-2 pointer-events-none bg-gradient-to-r from-transparent via-teal-300/25 to-transparent blur-xl" />

        <div className="max-w-[1080px] mx-auto px-4 sm:px-5 relative z-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-[#1bb6d4] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#3fae49]" />
            <span>Pretoria & Surrounds Premier Pool Specialists</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold max-w-[14ch] leading-[1.05] tracking-tight font-heading">
            New pools and renovations with pump and sand filter
          </h1>

          <p className="text-lg sm:text-xl max-w-xl my-6 text-[#cfeef6] leading-relaxed">
            Sello Pools builds new fibreglass pools and renovates existing ones in Pretoria and surrounds. Pump and sand filter always included. Free quotation.
          </p>

          <div className="flex flex-wrap gap-3.5 pt-1">
            <a
              href="#quote-section"
              className="inline-flex items-center gap-2 font-bold text-sm sm:text-base py-3.5 px-6 rounded-full bg-[#3fae49] text-[#06210a] hover:-translate-y-0.5 transition-transform shadow-lg shadow-emerald-900/30 no-underline cursor-pointer"
            >
              <span>Get a free quote</span>
              <ChevronRight className="w-4 h-4" />
            </a>

            <a
              href="#included-section"
              className="inline-flex items-center gap-2 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-full border border-white/40 text-white hover:bg-white/10 hover:-translate-y-0.5 transition-all no-underline"
            >
              View included equipment
            </a>

            <button
              onClick={onOpenTracker}
              className="inline-flex items-center gap-2 font-semibold text-sm sm:text-base py-3.5 px-6 rounded-full bg-cyan-950/80 text-[#1bb6d4] border border-[#1bb6d4]/40 hover:bg-cyan-900/80 transition-all cursor-pointer"
            >
              Track Your Quotation
            </button>
          </div>

          <div className="mt-8 text-xs sm:text-sm text-[#9fd6e4] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3fae49] animate-pulse" />
            <span>08:00 - 17:00 Pretoria & surrounds • Free on-site consultation</span>
          </div>
        </div>
      </section>

      {/* Included Equipment Grid Section */}
      <section id="included-section" className="max-w-[1080px] mx-auto px-4 sm:px-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
            Complete Package Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-[var(--ink)] font-heading">
            Pump & sand filter always included
          </h2>
          <p className="text-[var(--muted)] text-base max-w-2xl mt-2">
            No hidden costs or missing hardware. Every new installation and complete renovation includes premium commercial-grade circulation equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--line)] border border-[var(--line)] rounded-[20px] overflow-hidden mt-8 shadow-sm">
          {/* Star Highlight Box */}
          <div className="bg-[#06364d] text-white p-7 md:row-span-2 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#3fae49] text-[#06210a] text-xs font-bold mb-3">
                Included with every pool
              </span>
              <h3 className="text-2xl font-bold font-heading">0.75kW Speck Pump & 2-Bag Sand Filter</h3>
              <p className="mt-3 text-sm text-[#b9e3ee] leading-relaxed">
                We supply genuine Speck pumps paired with high-flow multiport sand filters. Whisper-quiet motor, UV-resistant casing, and low energy consumption.
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-white/15 text-xs text-[#9fd6e4] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3fae49]" />
              <span>Full manufacturer warranty & installation guarantee</span>
            </div>
          </div>

          <div className="bg-[var(--surface)] text-[var(--ink)] p-6">
            <h4 className="text-lg font-bold font-heading mb-1">High-Rate Sand Media</h4>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0">
              Fresh 100% graded silica filter sand for crystal clear water clarity from day one.
            </p>
          </div>

          <div className="bg-[var(--surface)] text-[var(--ink)] p-6">
            <h4 className="text-lg font-bold font-heading mb-1">Electrical DB & Timer Box</h4>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0">
              Weatherproof distribution box with automatic mechanical timer and earth leakage protection.
            </p>
          </div>

          <div className="bg-[var(--surface)] text-[var(--ink)] p-6">
            <h4 className="text-lg font-bold font-heading mb-1">In-Line Leaf Weir Skimmer</h4>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0">
              Large-capacity weir basket to trap surface leaves before reaching the pump basket.
            </p>
          </div>

          <div className="bg-[var(--surface)] text-[var(--ink)] p-6">
            <h4 className="text-lg font-bold font-heading mb-1">2x Aimflo Directional Jets</h4>
            <p className="text-xs sm:text-sm text-[var(--muted)] m-0">
              Adjustable return nozzles for optimal circular water flow and dead-spot elimination.
            </p>
          </div>
        </div>
      </section>

      {/* Two Core Services */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
            Our Core Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-[var(--ink)] font-heading">
            New installations and renovations
          </h2>
          <p className="text-[var(--muted)] text-base max-w-2xl mt-2">
            Whether building a dream backyard retreat from scratch or restoring an aged, leaking pool to brand-new condition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Service 1 */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-7 shadow-sm">
            <div className="w-10 h-1 border-t-4 border-[#1bb6d4] mb-3" />
            <h3 className="text-2xl font-bold font-heading text-[var(--ink)] mb-2">
              New Fibreglass Pools
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Precision excavation, sand bedding, shell installation, full plumbing and equipment hookup with paved brick coping.
            </p>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[var(--muted)] pl-0 list-none">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1bb6d4] shrink-0" />
                <span>Heavy-duty fibreglass shell in sparkling pool blue</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1bb6d4] shrink-0" />
                <span>Speck 0.75kW pump and sand filter fully plumbed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1bb6d4] shrink-0" />
                <span>Backfill and cement ring-beam foundation support</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1bb6d4] shrink-0" />
                <span>Water filling, startup chemicals, and handover testing</span>
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[20px] p-7 shadow-sm">
            <div className="w-10 h-1 border-t-4 border-[#3fae49] mb-3" />
            <h3 className="text-2xl font-bold font-heading text-[var(--ink)] mb-2">
              Pool Renovations & Relining
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Transform rough, cracked marblite or flaking surfaces into a silky-smooth, leak-free fibreglass finish that lasts decades.
            </p>
            <ul className="mt-4 space-y-2 text-xs sm:text-sm text-[var(--muted)] pl-0 list-none">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3fae49] shrink-0" />
                <span>Complete surface sandblasting and crack stitching</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3fae49] shrink-0" />
                <span>Multi-layer fibreglass matting & isopthalic resin relining</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3fae49] shrink-0" />
                <span>Ceramic mosaic tile border installation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#3fae49] shrink-0" />
                <span>Pump overhaul, multiport valve repair, and sand replacement</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Service Coverage Areas Section */}
      <section className="bg-[#06364d] text-[#eaf8fb] py-16">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-5">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
            Service Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-1 text-white font-heading">
            Pretoria and surrounds
          </h2>
          <p className="text-[#a9d4e0] text-sm sm:text-base max-w-xl mt-2">
            Our mobile construction and technician teams operate daily across Gauteng North and the greater Pretoria municipal area.
          </p>

          <div className="flex flex-wrap gap-2.5 mt-8">
            {[
              'Pretoria East',
              'Centurion',
              'Midrand',
              'Garsfontein',
              'Faerie Glen',
              'Silver Lakes',
              'Waterkloof Ridge',
              'Pretoria North',
              'The Moot',
              'Moreleta Park',
              'Lynnwood',
              'Montana',
            ].map((suburb) => (
              <span
                key={suburb}
                className="border border-white/25 bg-white/5 py-2 px-4 rounded-full text-xs sm:text-sm font-medium hover:border-[#1bb6d4] transition-colors"
              >
                {suburb}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Quotation Form Section */}
      <section id="quote-section" className="max-w-[1080px] mx-auto px-4 sm:px-5">
        <QuotationForm
          onSuccess={(id) => {
            onOpenTracker();
          }}
          onOpenAuth={onOpenAuth}
        />
      </section>

      {/* FAQ Accordion Section */}
      <section className="max-w-[760px] mx-auto px-4 sm:px-5">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
            Got Questions?
          </span>
          <h2 className="text-3xl font-extrabold text-[var(--ink)] font-heading mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="border-t border-[var(--line)] space-y-0 text-sm">
          <details className="border-b border-[var(--line)] py-4 group">
            <summary className="font-bold text-base cursor-pointer list-none flex justify-between items-center text-[var(--ink)] font-heading">
              <span>What pump and sand filter do you include?</span>
              <span className="w-7 h-7 rounded-full bg-[#1bb6d4] text-[#032633] flex items-center justify-center font-bold text-base transition-transform group-open:rotate-45 group-open:bg-[#3fae49]">
                +
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              We include a standard 0.75kW Speck Porpoise pool pump and a matching 2-bag sand filter filled with high-grade silica sand. Electrical DB box with mechanical timer is also supplied and connected.
            </p>
          </details>

          <details className="border-b border-[var(--line)] py-4 group">
            <summary className="font-bold text-base cursor-pointer list-none flex justify-between items-center text-[var(--ink)] font-heading">
              <span>How long does a new fibreglass pool installation take?</span>
              <span className="w-7 h-7 rounded-full bg-[#1bb6d4] text-[#032633] flex items-center justify-center font-bold text-base transition-transform group-open:rotate-45 group-open:bg-[#3fae49]">
                +
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Most standard residential installations in Pretoria and Centurion are completed in 5 to 7 working days, weather permitting. This includes digging, shell delivery, plumbing, backfilling, and coping paving.
            </p>
          </details>

          <details className="border-b border-[var(--line)] py-4 group">
            <summary className="font-bold text-base cursor-pointer list-none flex justify-between items-center text-[var(--ink)] font-heading">
              <span>Can you reline an old cracked concrete or marblite pool?</span>
              <span className="w-7 h-7 rounded-full bg-[#1bb6d4] text-[#032633] flex items-center justify-center font-bold text-base transition-transform group-open:rotate-45 group-open:bg-[#3fae49]">
                +
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              Yes! Fibreglass relining is our specialty. We repair existing structural cracks, grind down algae-stained surfaces, and lay new fibreglass matting with pool-grade resin for a completely sealed, non-porous finish.
            </p>
          </details>

          <details className="border-b border-[var(--line)] py-4 group">
            <summary className="font-bold text-base cursor-pointer list-none flex justify-between items-center text-[var(--ink)] font-heading">
              <span>Do you charge for quotation visits in Pretoria?</span>
              <span className="w-7 h-7 rounded-full bg-[#1bb6d4] text-[#032633] flex items-center justify-center font-bold text-base transition-transform group-open:rotate-45 group-open:bg-[#3fae49]">
                +
              </span>
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              No. Our quotation and site assessment visits throughout Pretoria East, Centurion, and surrounds are 100% free with no obligation. Submit the form above to book a visit.
            </p>
          </details>
        </div>
      </section>

      {/* Direct Contact Box */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-5">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[24px] p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-md">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1bb6d4] font-heading">
              Direct Contact
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 text-[var(--ink)] font-heading">
              Speak directly with Sello Pools
            </h3>
            <p className="text-sm text-[var(--muted)] mt-2">
              Have questions about your pool size, soil conditions, or need an urgent pump replacement? Reach out directly via call or WhatsApp.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <a
                href="tel:+27825554912"
                className="flex items-center gap-3 text-[var(--ink)] font-semibold hover:text-[#1bb6d4] no-underline"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-100 text-[#0a6f93] flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span>082 555 4912 (Call)</span>
              </a>

              <a
                href="https://wa.me/27825554912"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-[var(--ink)] font-semibold hover:text-[#3fae49] no-underline"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#3fae49] flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span>WhatsApp Instant Quotations</span>
              </a>

              <div className="flex items-center gap-3 text-[var(--muted)]">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span>info@sellopools.co.za</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-6 text-center">
            <h4 className="text-lg font-bold font-heading text-[var(--ink)]">
              Already submitted a quotation request?
            </h4>
            <p className="text-xs text-[var(--muted)] mt-2">
              Track quotation status in real-time or log in with Google to review your maintenance schedules and project files.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenTracker}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full font-bold bg-[#1bb6d4] text-[#032633] text-xs hover:brightness-105 transition-all cursor-pointer"
              >
                View My Quotations
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full font-semibold border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs hover:bg-[var(--bg)] transition-colors cursor-pointer"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
