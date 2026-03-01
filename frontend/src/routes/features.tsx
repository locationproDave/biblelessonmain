import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useSEO, trackPageView } from '@/lib/seo'
import { useEffect } from 'react'
import { 
  Map, Brain, Check, X, ChevronRight, Crown, Sparkles, 
  MapPin, BookOpen, Clock, Users, Lightbulb, Star
} from 'lucide-react'

export const Route = createFileRoute('/features')({
  component: FeaturesShowcasePage,
})

// Sample Biblical Map Data
const SAMPLE_MAP_DATA = {
  locations: [
    {
      name: "Jerusalem",
      modernName: "Jerusalem, Israel",
      lat: 31.7683,
      lng: 35.2137,
      type: "city",
      significance: "The holy city where Jesus was crucified and resurrected. Center of Jewish worship.",
      keyEvents: ["David's capital", "Solomon's Temple built", "Jesus' crucifixion and resurrection", "Pentecost"],
      scriptureRefs: ["Psalm 122:1-2", "Matthew 21:1", "Acts 2:1-4"]
    },
    {
      name: "Bethlehem",
      modernName: "Bethlehem, Palestine",
      lat: 31.7054,
      lng: 35.2024,
      type: "city",
      significance: "Birthplace of Jesus Christ and King David.",
      keyEvents: ["Birth of David", "Birth of Jesus", "Visit of the Magi"],
      scriptureRefs: ["Micah 5:2", "Matthew 2:1", "Luke 2:4-7"]
    },
    {
      name: "Sea of Galilee",
      modernName: "Lake Kinneret, Israel",
      lat: 32.8231,
      lng: 35.5831,
      type: "sea",
      significance: "Where Jesus performed many miracles and called His disciples.",
      keyEvents: ["Jesus walks on water", "Calming the storm", "Miraculous catch of fish"],
      scriptureRefs: ["Matthew 14:22-33", "Mark 4:35-41", "Luke 5:1-11"]
    },
    {
      name: "Nazareth",
      modernName: "Nazareth, Israel",
      lat: 32.6996,
      lng: 35.3035,
      type: "city",
      significance: "Jesus' hometown where He grew up.",
      keyEvents: ["Annunciation to Mary", "Jesus' childhood", "Rejected by hometown"],
      scriptureRefs: ["Luke 1:26-38", "Luke 4:16-30", "Matthew 2:23"]
    },
    {
      name: "Capernaum",
      modernName: "Kfar Nahum, Israel",
      lat: 32.8803,
      lng: 35.5753,
      type: "city",
      significance: "Jesus' ministry headquarters in Galilee.",
      keyEvents: ["Healing of centurion's servant", "Peter's mother-in-law healed", "Sermon on bread of life"],
      scriptureRefs: ["Matthew 8:5-13", "Mark 1:29-31", "John 6:22-59"]
    }
  ],
  distances: [
    { from: "Jerusalem", to: "Bethlehem", miles: 6, context: "Mary and Joseph's journey" },
    { from: "Nazareth", to: "Capernaum", miles: 25, context: "Jesus relocated His ministry" },
    { from: "Jerusalem", to: "Sea of Galilee", miles: 80, context: "Jesus' travels between regions" }
  ],
  region: {
    name: "Holy Land",
    centerLat: 32.0,
    centerLng: 35.3,
    zoomLevel: 7
  }
}

// Sample Quiz Data
const SAMPLE_QUIZ_DATA = {
  quizTitle: "The Good Samaritan - Comprehension Quiz",
  questions: [
    {
      id: "q1",
      type: "multiple_choice",
      question: "In Jesus' parable, who was the first person to pass by the injured man?",
      options: ["A Samaritan", "A priest", "A Levite", "A tax collector"],
      correctAnswer: "A priest",
      explanation: "Jesus specifically mentioned that a priest came down that road and passed by on the other side (Luke 10:31).",
      difficulty: "easy",
      points: 10
    },
    {
      id: "q2",
      type: "true_false",
      question: "The Samaritan took the injured man to an inn and paid for his care.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "The Samaritan brought him to an inn, took care of him, and paid the innkeeper two denarii for his ongoing care (Luke 10:34-35).",
      difficulty: "easy",
      points: 10
    },
    {
      id: "q3",
      type: "multiple_choice",
      question: "What question prompted Jesus to tell this parable?",
      options: [
        "How can I be saved?",
        "Who is my neighbor?",
        "How often should I forgive?",
        "What is the greatest commandment?"
      ],
      correctAnswer: "Who is my neighbor?",
      explanation: "A lawyer asked 'Who is my neighbor?' seeking to justify himself, prompting Jesus to tell this parable (Luke 10:29).",
      difficulty: "medium",
      points: 15
    },
    {
      id: "q4",
      type: "fill_blank",
      question: "Jesus concluded the parable by saying, 'Go and do ________.'",
      options: [],
      correctAnswer: "likewise",
      explanation: "Jesus told the lawyer to 'Go and do likewise' - showing mercy as the Samaritan did (Luke 10:37).",
      difficulty: "medium",
      points: 15
    },
    {
      id: "q5",
      type: "multiple_choice",
      question: "Why is it significant that a Samaritan was the hero of this story?",
      options: [
        "Samaritans were wealthy",
        "Jews and Samaritans had hostility between them",
        "Samaritans were Roman officials",
        "Samaritans were known as doctors"
      ],
      correctAnswer: "Jews and Samaritans had hostility between them",
      explanation: "There was deep cultural and religious hostility between Jews and Samaritans, making Jesus' choice of a Samaritan hero both shocking and instructive.",
      difficulty: "hard",
      points: 20
    }
  ],
  totalPoints: 70,
  passingScore: 70
}

function FeaturesShowcasePage() {
  const [activeTab, setActiveTab] = useState<'map' | 'quiz'>('map')
  const [selectedLocation, setSelectedLocation] = useState<typeof SAMPLE_MAP_DATA.locations[0] | null>(null)
  const [showQuizAnswer, setShowQuizAnswer] = useState<string | null>(null)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})

  useSEO({
    title: 'Biblical Map & Quiz Generator | Bible Lesson Planner Premium Features',
    description: 'See our AI-powered Biblical Map Generator and Quiz Generator in action. Create interactive maps and comprehension quizzes for your Sunday school lessons.',
    keywords: 'biblical map generator, Bible quiz maker, Sunday school quiz, interactive Bible map, lesson comprehension test',
  })

  useEffect(() => {
    trackPageView('/features', 'Features Showcase')
  }, [])

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-50 via-white to-emerald-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-emerald-950/20 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Crown className="w-3.5 h-3.5" /> Premium Features
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 dark:text-stone-50 mb-4" style={{ fontFamily: 'Crimson Text, serif' }}>
              Biblical Map & Quiz Generator
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto mb-8">
              Bring your Bible lessons to life with AI-powered interactive maps and comprehension quizzes. See exactly what you'll get with our Unlimited plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                data-testid="upgrade-cta"
              >
                <Sparkles className="w-4 h-4" /> Get Unlimited Access
              </Link>
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-semibold hover:border-amber-400 transition-all"
              >
                Try Free Lesson First <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'map'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-400'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-emerald-400'
            }`}
            data-testid="map-tab"
          >
            <Map className="w-4 h-4" /> Biblical Map Generator
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-2 border-indigo-400'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:border-indigo-400'
            }`}
            data-testid="quiz-tab"
          >
            <Brain className="w-4 h-4" /> Quiz Generator
          </button>
        </div>

        {/* Biblical Map Demo */}
        {activeTab === 'map' && (
          <div className="bg-white dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-lg">
            {/* Map Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <Map className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Biblical Map Generator</h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Sample: Life of Jesus in Galilee • {SAMPLE_MAP_DATA.locations.length} locations • {SAMPLE_MAP_DATA.distances.length} routes
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-0 lg:divide-x divide-stone-200 dark:divide-stone-700">
              {/* Interactive Map Visual */}
              <div className="p-6 bg-gradient-to-b from-amber-50/50 to-yellow-50/30 dark:from-stone-900/50 dark:to-stone-800/30 min-h-[400px] relative">
                <svg viewBox="80 10 220 250" className="w-full h-full" style={{ minHeight: '350px' }}>
                  <defs>
                    <radialGradient id="terrainGrad" cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#f5e6c8" />
                      <stop offset="100%" stopColor="#e8d5a8" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Land mass */}
                  <rect x="80" y="10" width="220" height="250" fill="url(#terrainGrad)" rx="4" />

                  {/* Mediterranean Sea */}
                  <path d="M 100,20 L 135,20 L 140,40 L 140,80 L 135,120 L 130,160 L 125,200 L 120,240 L 100,240 Z" fill="#a8d8ea" opacity="0.5" />
                  
                  {/* Sea of Galilee */}
                  <ellipse cx="200" cy="72" rx="12" ry="18" fill="#74b9ff" opacity="0.7" />
                  
                  {/* Dead Sea */}
                  <ellipse cx="205" cy="190" rx="7" ry="18" fill="#81ecec" opacity="0.6" />
                  
                  {/* Jordan River */}
                  <path d="M 200,90 Q 208,130 205,150 Q 202,170 205,172" fill="none" stroke="#74b9ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

                  {/* Water labels */}
                  <text x="105" y="130" fontSize="5" fill="#2980b9" opacity="0.5" fontStyle="italic" transform="rotate(-90, 105, 130)">Mediterranean Sea</text>
                  <text x="196" y="75" fontSize="4" fill="#2980b9" opacity="0.7" fontStyle="italic">Sea of Galilee</text>
                  <text x="200" y="195" fontSize="3.5" fill="#2980b9" opacity="0.7" fontStyle="italic">Dead Sea</text>

                  {/* Location markers */}
                  {/* Jerusalem */}
                  <g className="cursor-pointer" onClick={() => setSelectedLocation(SAMPLE_MAP_DATA.locations[0])}>
                    <circle cx="185" cy="165" r={selectedLocation?.name === 'Jerusalem' ? 6 : 4} fill="#e74c3c" stroke="white" strokeWidth="1" filter={selectedLocation?.name === 'Jerusalem' ? 'url(#glow)' : ''} />
                    <text x="185" y="175" fontSize="5" fill="#e74c3c" textAnchor="middle" fontWeight="700">Jerusalem</text>
                  </g>
                  
                  {/* Bethlehem */}
                  <g className="cursor-pointer" onClick={() => setSelectedLocation(SAMPLE_MAP_DATA.locations[1])}>
                    <circle cx="183" cy="175" r={selectedLocation?.name === 'Bethlehem' ? 5 : 3.5} fill="#e74c3c" stroke="white" strokeWidth="0.8" filter={selectedLocation?.name === 'Bethlehem' ? 'url(#glow)' : ''} />
                    <text x="170" y="180" fontSize="4" fill="#e74c3c" textAnchor="middle" fontWeight="600">Bethlehem</text>
                  </g>

                  {/* Nazareth */}
                  <g className="cursor-pointer" onClick={() => setSelectedLocation(SAMPLE_MAP_DATA.locations[3])}>
                    <circle cx="175" cy="65" r={selectedLocation?.name === 'Nazareth' ? 5 : 3.5} fill="#e74c3c" stroke="white" strokeWidth="0.8" filter={selectedLocation?.name === 'Nazareth' ? 'url(#glow)' : ''} />
                    <text x="165" y="62" fontSize="4" fill="#e74c3c" textAnchor="middle" fontWeight="600">Nazareth</text>
                  </g>

                  {/* Capernaum */}
                  <g className="cursor-pointer" onClick={() => setSelectedLocation(SAMPLE_MAP_DATA.locations[4])}>
                    <circle cx="205" cy="55" r={selectedLocation?.name === 'Capernaum' ? 5 : 3.5} fill="#e74c3c" stroke="white" strokeWidth="0.8" filter={selectedLocation?.name === 'Capernaum' ? 'url(#glow)' : ''} />
                    <text x="205" y="50" fontSize="4" fill="#e74c3c" textAnchor="middle" fontWeight="600">Capernaum</text>
                  </g>

                  {/* Distance lines */}
                  <line x1="185" y1="165" x2="183" y2="175" stroke="#e67e22" strokeWidth="0.8" strokeDasharray="2,1.5" opacity="0.7" />
                  <line x1="175" y1="65" x2="205" y2="55" stroke="#e67e22" strokeWidth="0.8" strokeDasharray="2,1.5" opacity="0.7" />

                  {/* Scale bar */}
                  <g transform="translate(85, 240)">
                    <line x1="0" y1="0" x2="30" y2="0" stroke="#888" strokeWidth="0.5" />
                    <line x1="0" y1="-2" x2="0" y2="2" stroke="#888" strokeWidth="0.5" />
                    <line x1="30" y1="-2" x2="30" y2="2" stroke="#888" strokeWidth="0.5" />
                    <text x="15" y="5" fontSize="3" fill="#888" textAnchor="middle">~30 miles</text>
                  </g>

                  <text x="190" y="22" fontSize="5" fill="#666" fontWeight="700" textAnchor="middle" opacity="0.6">Holy Land</text>
                </svg>

                <p className="text-xs text-stone-400 dark:text-stone-500 text-center mt-2">
                  Click on locations to see details
                </p>
              </div>

              {/* Location Details Panel */}
              <div className="p-6">
                {selectedLocation ? (
                  <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-stone-900 dark:text-stone-100">{selectedLocation.name}</h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{selectedLocation.modernName}</p>
                      </div>
                    </div>

                    <p className="text-sm text-stone-600 dark:text-stone-300 mb-4 leading-relaxed">
                      {selectedLocation.significance}
                    </p>

                    <div className="mb-4">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Key Biblical Events</h4>
                      <ul className="space-y-1.5">
                        {selectedLocation.keyEvents.map((event, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                            <Star className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            {event}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Scripture References</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLocation.scriptureRefs.map((ref, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200/60 dark:border-blue-800/40">
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
                      <MapPin className="w-7 h-7 text-stone-400 dark:text-stone-500" />
                    </div>
                    <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">Select a Location</h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Click on any marker to explore biblical history
                    </p>
                  </div>
                )}

                {/* Location List */}
                <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-700">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">All Locations</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_MAP_DATA.locations.map((loc) => (
                      <button
                        key={loc.name}
                        onClick={() => setSelectedLocation(loc)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          selectedLocation?.name === loc.name
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-400'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600 hover:border-emerald-400'
                        }`}
                      >
                        {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map Features Summary */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">AI-Powered</div>
                  <div className="text-xs text-stone-500">Location Extraction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Interactive</div>
                  <div className="text-xs text-stone-500">Click to Explore</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Historical</div>
                  <div className="text-xs text-stone-500">Context & Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Scripture</div>
                  <div className="text-xs text-stone-500">References Included</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Demo */}
        {activeTab === 'quiz' && (
          <div className="bg-white dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-lg">
            {/* Quiz Header */}
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{SAMPLE_QUIZ_DATA.quizTitle}</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {SAMPLE_QUIZ_DATA.questions.length} questions • {SAMPLE_QUIZ_DATA.totalPoints} total points • Pass: {SAMPLE_QUIZ_DATA.passingScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quiz Questions */}
            <div className="p-6 space-y-6">
              {SAMPLE_QUIZ_DATA.questions.map((q, index) => {
                const isAnswered = selectedAnswers[q.id]
                const isCorrect = selectedAnswers[q.id] === q.correctAnswer
                const showAnswer = showQuizAnswer === q.id

                return (
                  <div
                    key={q.id}
                    className={`rounded-xl border p-5 transition-all ${
                      showAnswer
                        ? isCorrect
                          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/10'
                          : 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10'
                        : 'border-stone-200 dark:border-stone-700 bg-stone-50/30 dark:bg-stone-800/30'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100 leading-relaxed">
                          {q.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          q.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                          q.difficulty === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                          'bg-red-100 dark:bg-red-900/30 text-red-600'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-xs text-stone-400">{q.points} pts</span>
                      </div>
                    </div>

                    {/* Answer Options */}
                    {q.type === 'multiple_choice' && (
                      <div className="space-y-2 mb-4">
                        {q.options.map((option, i) => {
                          const isSelected = selectedAnswers[q.id] === option
                          const isCorrectOption = showAnswer && option === q.correctAnswer
                          const isWrongSelection = showAnswer && isSelected && option !== q.correctAnswer

                          return (
                            <button
                              key={i}
                              onClick={() => {
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: option }))
                                setShowQuizAnswer(null)
                              }}
                              disabled={showAnswer}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left text-sm transition-all ${
                                isCorrectOption ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400' :
                                isWrongSelection ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400' :
                                isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400' :
                                'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-indigo-300'
                              }`}
                            >
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                isCorrectOption ? 'bg-emerald-500 text-white' :
                                isWrongSelection ? 'bg-red-500 text-white' :
                                isSelected ? 'bg-indigo-500 text-white' :
                                'bg-stone-100 dark:bg-stone-700 text-stone-500'
                              }`}>
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span className={`flex-1 ${isSelected ? 'font-medium' : ''}`}>
                                {option}
                              </span>
                              {showAnswer && isCorrectOption && <Check className="w-4 h-4 text-emerald-500" />}
                              {showAnswer && isWrongSelection && <X className="w-4 h-4 text-red-500" />}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="flex gap-3 mb-4">
                        {['True', 'False'].map(option => {
                          const isSelected = selectedAnswers[q.id] === option
                          const isCorrectOption = showAnswer && option === q.correctAnswer
                          const isWrongSelection = showAnswer && isSelected && option !== q.correctAnswer

                          return (
                            <button
                              key={option}
                              onClick={() => {
                                setSelectedAnswers(prev => ({ ...prev, [q.id]: option }))
                                setShowQuizAnswer(null)
                              }}
                              disabled={showAnswer}
                              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                                isCorrectOption ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400 text-emerald-700' :
                                isWrongSelection ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-400 text-red-700' :
                                isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-400 text-indigo-700' :
                                'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 hover:border-indigo-300'
                              }`}
                            >
                              {option}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {q.type === 'fill_blank' && (
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Type your answer..."
                          value={selectedAnswers[q.id] || ''}
                          onChange={(e) => {
                            setSelectedAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
                            setShowQuizAnswer(null)
                          }}
                          disabled={showAnswer}
                          className={`w-full px-4 py-3 rounded-lg text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            showAnswer
                              ? isCorrect ? 'border-emerald-400 bg-emerald-50' : 'border-red-400 bg-red-50'
                              : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
                          }`}
                        />
                      </div>
                    )}

                    {/* Check Answer Button */}
                    {isAnswered && !showAnswer && (
                      <button
                        onClick={() => setShowQuizAnswer(q.id)}
                        className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg text-sm font-semibold hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-colors"
                      >
                        Check Answer
                      </button>
                    )}

                    {/* Explanation */}
                    {showAnswer && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${
                        isCorrect
                          ? 'bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200'
                          : 'bg-amber-100/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200'
                      }`}>
                        <span className="font-semibold flex items-center gap-1">
                          {isCorrect ? <><Check className="w-4 h-4" /> Correct!</> : <><X className="w-4 h-4" /> Incorrect.</>}
                        </span>
                        {!isCorrect && <span className="ml-2">The correct answer is: <strong>{q.correctAnswer}</strong></span>}
                        <p className="mt-1 text-xs opacity-80">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Quiz Features Summary */}
            <div className="px-6 py-4 border-t border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">AI-Generated</div>
                  <div className="text-xs text-stone-500">From Your Lesson</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Multiple Types</div>
                  <div className="text-xs text-stone-500">MC, T/F, Fill-in</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Explanations</div>
                  <div className="text-xs text-stone-500">Learn Why</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Scoring</div>
                  <div className="text-xs text-stone-500">Track Progress</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200 dark:border-amber-800/40">
            <Crown className="w-10 h-10 text-amber-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              Ready to Transform Your Teaching?
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
              Get unlimited access to Biblical Map Generator, Quiz Generator, and all premium features with our Unlimited plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Unlimited - $9.99/mo
              </Link>
              <span className="text-xs text-stone-500">or $99/year (save 17%)</span>
            </div>
            <p className="text-xs text-stone-400 mt-4">
              Organizations: Add this feature for just $1.99/month
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesShowcasePage
