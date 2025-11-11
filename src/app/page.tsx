export default function BinBuddyLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-teal-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-teal-700">🗑️ BinBuddy</div>
          <div className="flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              How It Works
            </a>
            <a
              href="#impact"
              className="text-gray-700 hover:text-teal-600 transition"
            >
              Impact
            </a>
            <button className="bg-teal-600 text-white px-6 py-2 rounded-full hover:bg-teal-700 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Smart Waste Management for Cleaner Communities
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Report waste with a photo, let AI classify it, and earn rewards
              for making your community cleaner. Join the movement today.
            </p>
            <div className="flex gap-4">
              <button className="bg-teal-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-700 transition shadow-lg">
                Start Reporting
              </button>
              <button className="border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-teal-50 transition">
                Learn More
              </button>
            </div>
            <div className="mt-12 flex gap-8">
              <div>
                <div className="text-3xl font-bold text-teal-600">1.5k+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">8.2k</div>
                <div className="text-gray-600">Reports Filed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-teal-600">95%</div>
                <div className="text-gray-600">Resolution Rate</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition">
              <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4">📸</div>
                  <div className="text-xl font-semibold text-teal-700">
                    Snap. Report. Earn.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
            Why Choose BinBuddy?
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            Powered by AI and driven by community action, BinBuddy makes waste
            management simple, transparent, and rewarding.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                AI-Powered Classification
              </h3>
              <p className="text-gray-600">
                Gemini AI automatically verifies and classifies waste from
                photos, ensuring accurate categorization every time.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Smart Task Assignment
              </h3>
              <p className="text-gray-600">
                Automated task distribution to waste collectors and teams based
                on location and priority for efficient cleanup.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 hover:shadow-xl transition">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Gamified Rewards
              </h3>
              <p className="text-gray-600">
                Earn points and badges for every report, climb leaderboards, and
                unlock rewards for eco-friendly actions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-teal-50 to-emerald-50"
      >
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-bold text-lg mb-2">Snap a Photo</h3>
              <p className="text-gray-600">
                Take a picture of improperly disposed waste in your area
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-bold text-lg mb-2">AI Classifies</h3>
              <p className="text-gray-600">
                Our AI automatically identifies and categorizes the waste type
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-bold text-lg mb-2">Task Assigned</h3>
              <p className="text-gray-600">
                Collection teams receive automatic notifications for cleanup
              </p>
            </div>
            <div className="text-center">
              <div className="bg-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-bold text-lg mb-2">Earn Rewards</h3>
              <p className="text-gray-600">
                Get points and climb the leaderboard for your contributions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Real Impact, Real Change
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                BinBuddy empowers urban residents, waste collectors, and city
                administrators to work together for cleaner, healthier
                communities.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Faster Response Times
                    </h4>
                    <p className="text-gray-600">
                      Reports reach authorities instantly, reducing cleanup
                      delays by 70%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="font-semibold mb-1">Community Engagement</h4>
                    <p className="text-gray-600">
                      Gamification drives ongoing participation and eco-friendly
                      behavior
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-2xl">✅</div>
                  <div>
                    <h4 className="font-semibold mb-1">
                      Data-Driven Decisions
                    </h4>
                    <p className="text-gray-600">
                      City administrators gain insights for better waste
                      management planning
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl p-12 text-center">
              <div className="text-6xl mb-6">🌍</div>
              <div className="text-5xl font-bold text-teal-700 mb-2">
                12.4 Tons
              </div>
              <div className="text-xl text-gray-700">
                Waste Collected This Month
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-teal-600 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-teal-50 mb-8">
            Join thousands of community members already creating cleaner
            neighborhoods
          </p>
          <button className="bg-white text-teal-600 px-10 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition shadow-2xl">
            Join BinBuddy Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold text-teal-400 mb-4">
            🗑️ BinBuddy
          </div>
          <p className="text-gray-400 mb-6">
            Smart waste management for cleaner communities
          </p>
          <div className="flex justify-center gap-8 text-gray-400">
            <a href="#" className="hover:text-teal-400 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-teal-400 transition">
              Terms
            </a>
            <a href="#" className="hover:text-teal-400 transition">
              Contact
            </a>
          </div>
          <p className="text-gray-500 mt-8">
            © 2024 BinBuddy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
