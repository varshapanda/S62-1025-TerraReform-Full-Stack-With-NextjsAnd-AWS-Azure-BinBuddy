"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Leaf,
  Users,
  Zap,
  Globe,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const [, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            BinBuddy
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#impact" className="hover:text-emerald-400 transition">
              Impact
            </a>
            <a
              href="#how-it-works"
              className="hover:text-emerald-400 transition"
            >
              How It Works
            </a>
            <a href="#benefits" className="hover:text-emerald-400 transition">
              Benefits
            </a>
            <button className="bg-linear-to-r from-emerald-500 to-green-500 px-6 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl opacity-10"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="mb-6 inline-block">
            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-full text-sm font-medium">
              The future of waste management starts here
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Waste Into{" "}
            <span className="bg-linear-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              Impact
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Every year, billions of tons of waste go untracked at the source.
            BinBuddy empowers communities to segregate responsibly, verify
            collaboratively, and drive real change in how waste is managed.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-linear-to-r from-emerald-500 to-green-500 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              Start Making A Difference
              <ArrowRight size={20} />
            </Link>
            <button className="border border-slate-600 px-8 py-4 rounded-lg font-semibold text-lg hover:border-emerald-400 hover:text-emerald-400 transition">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section id="impact" className="py-24 px-6 bg-slate-900/50 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            The Crisis We&apos;re Facing
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="border-l-4 border-emerald-500 pl-6">
                  <p className="text-5xl font-bold text-emerald-400 mb-2">
                    2.12 Billion Tons
                  </p>
                  <p className="text-slate-300">
                    of municipal solid waste generated annually worldwide —
                    projected to reach 3.4 billion tons by 2050
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <p className="text-5xl font-bold text-green-400 mb-2">~30%</p>
                  <p className="text-slate-300">
                    of waste that reaches landfills could have been recycled or
                    composted if segregated properly at the source
                  </p>
                </div>

                <div className="border-l-4 border-teal-500 pl-6">
                  <p className="text-5xl font-bold text-teal-400 mb-2">
                    No Visibility
                  </p>
                  <p className="text-slate-300">
                    Municipal systems struggle to track whether households
                    segregate waste before collection — creating accountability
                    gaps
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-linear-to-br from-emerald-500/10 to-green-500/5 border border-emerald-500/30 p-8 rounded-2xl">
                <Globe className="text-emerald-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-3">
                  Environmental Impact
                </h3>
                <p className="text-slate-300">
                  Without proper segregation, hazardous materials contaminate
                  soil and groundwater. Recyclables buried in landfills emit
                  methane. Biodegradable waste creates toxic leachate.
                </p>
              </div>

              <div className="bg-linear-to-br from-green-500/10 to-teal-500/5 border border-green-500/30 p-8 rounded-2xl">
                <Users className="text-green-400 mb-4" size={32} />
                <h3 className="text-xl font-semibold mb-3">
                  Accountability Gap
                </h3>
                <p className="text-slate-300">
                  Communities lack the tools to verify compliance. Authorities
                  can&apos;t prioritize action. The system remains reactive
                  rather than preventative.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            How BinBuddy Works
          </h2>
          <p className="text-center text-slate-400 mb-16 text-lg">
            A simple three-step cycle that creates impact
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-800 to-slate-800/50 border border-emerald-500/30 rounded-2xl p-8 h-full">
                <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-emerald-400">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Residents Report</h3>
                <p className="text-slate-300 mb-6">
                  Households capture photos of segregated waste, add location
                  details, and submit reports in seconds.
                </p>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={18} />
                  <span className="text-sm">Simple & quick</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-800 to-slate-800/50 border border-green-500/30 rounded-2xl p-8 h-full">
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-green-400">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Community Verifies</h3>
                <p className="text-slate-300 mb-6">
                  Volunteers review reports, verify accuracy, and build a
                  reputation-based verification network.
                </p>
                <div className="flex items-center gap-2 text-green-400">
                  <Users size={18} />
                  <span className="text-sm">Collective wisdom</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-linear-to-br from-slate-800 to-slate-800/50 border border-teal-500/30 rounded-2xl p-8 h-full">
                <div className="bg-teal-500/20 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl font-bold text-teal-400">3</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Authorities Act</h3>
                <p className="text-slate-300 mb-6">
                  Municipal teams schedule pickups, track completion, and
                  measure impact in real-time.
                </p>
                <div className="flex items-center gap-2 text-teal-400">
                  <TrendingUp size={18} />
                  <span className="text-sm">Data-driven action</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 px-6 bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Real Impact. Real Change.
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* For Residents */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-emerald-400 flex items-center gap-3">
                <Leaf size={28} /> For Residents
              </h3>
              <div className="space-y-4">
                {[
                  "Earn points and badges for responsible waste segregation",
                  "See your impact on the community leaderboard",
                  "Receive recognition and tangible rewards",
                  "Build environmental consciousness one report at a time",
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 shrink-0"></div>
                    <p className="text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* For Authorities */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-green-400 flex items-center gap-3">
                <Zap size={28} /> For Authorities
              </h3>
              <div className="space-y-4">
                {[
                  "Real-time visibility into waste segregation compliance",
                  "Data-driven insights to optimize collection routes",
                  "Reduce contamination in recycling streams by 30%+",
                  "Allocate resources where they matter most",
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 shrink-0"></div>
                    <p className="text-slate-300">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Environmental Stats */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-linear-to-br from-emerald-500/10 to-transparent border border-emerald-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-emerald-400 mb-2">30%</p>
              <p className="text-slate-300">
                Potential increase in recycling rates through better segregation
              </p>
            </div>
            <div className="bg-linear-to-br from-green-500/10 to-transparent border border-green-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-green-400 mb-2">50%</p>
              <p className="text-slate-300">
                Reduction in methane emissions from properly managed organic
                waste
              </p>
            </div>
            <div className="bg-linear-to-br from-teal-500/10 to-transparent border border-teal-500/30 rounded-xl p-8 text-center">
              <p className="text-4xl font-bold text-teal-400 mb-2">100%</p>
              <p className="text-slate-300">
                Transparency in waste handling from source to final disposition
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-green-500/10 rounded-3xl"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make A Difference?
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join thousands of residents, volunteers, and municipalities building
            a cleaner, more accountable waste system.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-linear-to-r from-emerald-500 to-green-500 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105 inline-flex items-center justify-center"
            >
              Create Your Account
            </Link>
            <Link
              href="/login"
              className="bg-linear-to-r from-emerald-500 to-green-500 px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/50 transition transform hover:scale-105 inline-flex items-center justify-center"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <p className="text-2xl font-bold bg-linear-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-4">
                BinBuddy
              </p>
              <p className="text-slate-400 text-sm">
                Building a community-driven approach to waste segregation and
                environmental responsibility.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-4">Product</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Company</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-4">Legal</p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-emerald-400 transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; 2025 BinBuddy. Building a cleaner future, together.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
