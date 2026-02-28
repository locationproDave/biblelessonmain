import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/lib/auth-client'
import { adminAPI } from '@/lib/api'
import { useState } from 'react'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Calendar,
  Clock,
  ChevronDown,
  Search,
  Shield,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  CreditCard,
  Globe,
  Eye,
  MousePointerClick,
  Timer,
  Smartphone,
  Monitor,
  ExternalLink,
  Plus,
  X,
  Gift
} from 'lucide-react'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { data: session, isPending: sessionLoading } = useSession()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('7d')
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<'overview' | 'traffic' | 'behavior'>('overview')
  
  // Custom Subscription Modal State
  const [showCustomSubModal, setShowCustomSubModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [customSubForm, setCustomSubForm] = useState({
    planName: '',
    price: 0,
    interval: 'month' as 'month' | 'year',
    lessonsLimit: 100,
    durationMonths: 12,
    notes: ''
  })
  const [customSubLoading, setCustomSubLoading] = useState(false)

  const isAdmin = session?.user?.role === 'admin'

  // GA4 Property ID and Clarity Project ID
  const GA4_PROPERTY_ID = 'G-H6JP1LBZL4'
  const CLARITY_PROJECT_ID = 'vhxcm4vtlx'

  // Fetch analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics', period],
    queryFn: () => adminAPI.getAnalytics(period),
    enabled: isAdmin,
  })

  // Fetch users
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', userPage, userSearch],
    queryFn: () => adminAPI.getUsers(userPage, 10, userSearch || undefined),
    enabled: isAdmin,
  })

  // Fetch spending
  const { data: spending, isLoading: spendingLoading } = useQuery({
    queryKey: ['admin-spending', period],
    queryFn: () => adminAPI.getSpending(period),
    enabled: isAdmin,
  })

  // Fetch lesson stats
  const { data: lessonStats, isLoading: lessonStatsLoading } = useQuery({
    queryKey: ['admin-lessons-stats', period],
    queryFn: () => adminAPI.getLessonsStats(period),
    enabled: isAdmin,
  })

  // Fetch plan breakdown
  const { data: planBreakdown, isLoading: planBreakdownLoading } = useQuery({
    queryKey: ['admin-plan-breakdown'],
    queryFn: () => adminAPI.getPlanBreakdown(),
    enabled: isAdmin,
  })

  // Show loading while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  // Not logged in - show login prompt
  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Admin Access Required</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-4">Please sign in with an admin account.</p>
          <button
            onClick={() => navigate({ to: '/signin' })}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // Logged in but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F7F1] dark:bg-[#1C1917]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Access Denied</h2>
          <p className="text-stone-500 dark:text-stone-400 mb-4">You don't have permission to view this page.</p>
          <button
            onClick={() => navigate({ to: '/lessons' })}
            className="px-6 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-xl font-medium"
          >
            Go to Lessons
          </button>
        </div>
      </div>
    )
  }

  const periodOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Shield className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-stone-500 dark:text-stone-400">
              Monitor site performance and manage users
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="relative">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="appearance-none bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              data-testid="period-selector"
            >
              {periodOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Users"
            value={analytics?.metrics.totalUsers || 0}
            change={analytics?.metrics.newSignups || 0}
            changeLabel="new this period"
            icon={<Users className="w-5 h-5" />}
            loading={analyticsLoading}
            testId="stat-total-users"
          />
          <StatCard
            title="Total Lessons"
            value={analytics?.metrics.totalLessons || 0}
            change={analytics?.metrics.lessonsCreated || 0}
            changeLabel="created this period"
            icon={<BookOpen className="w-5 h-5" />}
            loading={analyticsLoading}
            testId="stat-total-lessons"
          />
          <StatCard
            title="Active Users"
            value={analytics?.metrics.activeUsers || 0}
            icon={<Activity className="w-5 h-5" />}
            loading={analyticsLoading}
            testId="stat-active-users"
          />
          <StatCard
            title="Revenue"
            value={`$${spending?.metrics.totalRevenue?.toFixed(2) || '0.00'}`}
            change={spending?.metrics.newSubscriptions || 0}
            changeLabel="new subscriptions"
            icon={<DollarSign className="w-5 h-5" />}
            loading={spendingLoading}
            testId="stat-revenue"
          />
        </div>

        {/* Plan Breakdown Section */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-8" data-testid="plan-breakdown">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Subscription Plan Breakdown
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                Track which plans users signed up for
              </p>
            </div>
            {planBreakdown && (
              <div className="text-right">
                <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  ${planBreakdown.totalMRR.toFixed(2)}
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">Monthly Recurring Revenue</p>
              </div>
            )}
          </div>
          
          {planBreakdownLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : planBreakdown?.breakdown?.length ? (
            <div className="space-y-4">
              {/* Plan cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {planBreakdown.breakdown.map((plan) => (
                  <div 
                    key={plan.planId} 
                    className={`p-4 rounded-xl border ${
                      plan.planId === 'pro' ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20' :
                      plan.planId === 'team' ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20' :
                      plan.planId === 'enterprise' ? 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20' :
                      'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-semibold uppercase ${
                        plan.planId === 'pro' ? 'text-amber-600 dark:text-amber-400' :
                        plan.planId === 'team' ? 'text-blue-600 dark:text-blue-400' :
                        plan.planId === 'enterprise' ? 'text-purple-600 dark:text-purple-400' :
                        'text-stone-500 dark:text-stone-400'
                      }`}>
                        {plan.planName}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          ${plan.price}/mo
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                      {plan.userCount}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {plan.percentage}% of users
                    </p>
                    {plan.monthlyRevenue > 0 && (
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                        ${plan.monthlyRevenue.toFixed(2)} MRR
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Visual bar chart */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-stone-600 dark:text-stone-400 mb-3">Distribution</h4>
                <div className="flex h-8 rounded-lg overflow-hidden bg-stone-100 dark:bg-stone-700">
                  {planBreakdown.breakdown.map((plan) => (
                    plan.percentage > 0 && (
                      <div
                        key={plan.planId}
                        className={`flex items-center justify-center text-xs font-medium text-white ${
                          plan.planId === 'pro' ? 'bg-amber-500' :
                          plan.planId === 'team' ? 'bg-blue-500' :
                          plan.planId === 'enterprise' ? 'bg-purple-500' :
                          'bg-stone-400'
                        }`}
                        style={{ width: `${Math.max(plan.percentage, 5)}%` }}
                        title={`${plan.planName}: ${plan.userCount} users (${plan.percentage}%)`}
                      >
                        {plan.percentage >= 10 && `${plan.percentage}%`}
                      </div>
                    )
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {planBreakdown.breakdown.map((plan) => (
                    <div key={plan.planId} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        plan.planId === 'pro' ? 'bg-amber-500' :
                        plan.planId === 'team' ? 'bg-blue-500' :
                        plan.planId === 'enterprise' ? 'bg-purple-500' :
                        'bg-stone-400'
                      }`} />
                      <span className="text-xs text-stone-600 dark:text-stone-400">
                        {plan.planName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8">
              No subscription data available
            </p>
          )}
        </div>

        {/* GA4 & Website Analytics Section */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6 mb-8" data-testid="ga4-analytics">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Website Analytics
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                GA4, Microsoft Clarity & Bing data
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Analytics Tab Switcher */}
              <div className="flex bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
                {(['overview', 'traffic', 'behavior'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveAnalyticsTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      activeAnalyticsTab === tab
                        ? 'bg-white dark:bg-stone-600 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links to Analytics Platforms */}
          <div className="flex flex-wrap gap-2 mb-6">
            <a
              href={`https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID.replace('G-', '')}/reports/intelligenthome`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <img src="https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg" alt="GA4" className="w-4 h-4" />
              Google Analytics
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href={`https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/dashboard`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
              Microsoft Clarity
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.bing.com/webmasters/home"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3v18l4-1.5V18l7-2.5V8l-4 1.5V6.5l4-1.5V3l-11 4z"/></svg>
              Bing Webmaster
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Overview Tab */}
          {activeAnalyticsTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Page Views</span>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">--</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">View in GA4</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">--</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">View in GA4</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl p-4 border border-amber-100 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Avg. Duration</span>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">--</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">View in GA4</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl p-4 border border-purple-100 dark:border-purple-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <MousePointerClick className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Bounce Rate</span>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">--</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">View in GA4</p>
                </div>
              </div>

              {/* GA4 Embed Placeholder */}
              <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-6 border border-stone-200 dark:border-stone-700">
                <div className="text-center">
                  <Globe className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                  <h4 className="font-medium text-stone-700 dark:text-stone-300 mb-2">Live GA4 Analytics</h4>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-md mx-auto">
                    Click the buttons above to view detailed analytics in Google Analytics, Microsoft Clarity, or Bing Webmaster Tools.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      GA4 Active
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                      Clarity Recording
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded text-xs">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
                      Bing Indexed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Traffic Tab */}
          {activeAnalyticsTab === 'traffic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Traffic Sources
                  </h4>
                  <div className="space-y-3">
                    {[
                      { source: 'Organic Search', icon: '🔍', color: 'bg-emerald-500' },
                      { source: 'Direct', icon: '🔗', color: 'bg-blue-500' },
                      { source: 'Referral', icon: '↗️', color: 'bg-purple-500' },
                      { source: 'Social', icon: '📱', color: 'bg-pink-500' },
                    ].map((item) => (
                      <div key={item.source} className="flex items-center gap-3">
                        <span className="text-lg">{item.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-stone-700 dark:text-stone-300">{item.source}</span>
                            <span className="text-stone-500 dark:text-stone-400">--</span>
                          </div>
                          <div className="h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: '0%' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 text-center">
                    View detailed data in GA4
                  </p>
                </div>

                {/* Device Breakdown */}
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                    Device Breakdown
                  </h4>
                  <div className="space-y-4">
                    {[
                      { device: 'Desktop', icon: Monitor, pct: '--' },
                      { device: 'Mobile', icon: Smartphone, pct: '--' },
                      { device: 'Tablet', icon: Monitor, pct: '--' },
                    ].map((item) => (
                      <div key={item.device} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-600">
                          <item.icon className="w-5 h-5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{item.device}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{item.pct} of sessions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-4 text-center">
                    View detailed data in GA4
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Behavior Tab */}
          {activeAnalyticsTab === 'behavior' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Pages */}
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    Top Pages
                  </h4>
                  <div className="space-y-2">
                    {[
                      { page: '/', name: 'Home' },
                      { page: '/generate', name: 'Create Lesson' },
                      { page: '/templates', name: 'Templates' },
                      { page: '/pricing', name: 'Pricing' },
                      { page: '/lessons', name: 'My Lessons' },
                    ].map((item) => (
                      <div key={item.page} className="flex items-center justify-between py-2 border-b border-stone-200 dark:border-stone-700 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{item.name}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{item.page}</p>
                        </div>
                        <span className="text-sm text-stone-500 dark:text-stone-400">--</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* User Flow Events */}
                <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-5 border border-stone-200 dark:border-stone-700">
                  <h4 className="font-medium text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4 text-emerald-600" />
                    Key Events (Clarity)
                  </h4>
                  <div className="space-y-3">
                    {[
                      { event: 'Lesson Generated', desc: 'AI lesson creation' },
                      { event: 'Sign Up', desc: 'New user registration' },
                      { event: 'Template Used', desc: 'Template selection' },
                      { event: 'PDF Export', desc: 'Lesson downloaded' },
                      { event: 'Upgrade Click', desc: 'Pricing interest' },
                    ].map((item) => (
                      <div key={item.event} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{item.event}</p>
                          <p className="text-xs text-stone-500 dark:text-stone-400">{item.desc}</p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-stone-200 dark:bg-stone-700 rounded text-stone-600 dark:text-stone-400">
                          --
                        </span>
                      </div>
                    ))}
                  </div>
                  <a
                    href={`https://clarity.microsoft.com/projects/view/${CLARITY_PROJECT_ID}/recordings`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View session recordings
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Signups Chart */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="daily-signups-chart">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Daily Signups
              </h3>
            </div>
            {analyticsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <SimpleBarChart data={analytics?.charts.dailySignups || {}} color="amber" />
            )}
          </div>

          {/* Daily Lessons Chart */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="daily-lessons-chart">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Daily Lessons Created
              </h3>
            </div>
            {analyticsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <SimpleBarChart data={analytics?.charts.dailyLessons || {}} color="blue" />
            )}
          </div>
        </div>

        {/* Age Group & Theme Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Age Group Distribution */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="age-distribution">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Lessons by Age Group
              </h3>
            </div>
            {lessonStatsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <DistributionList data={lessonStats?.ageGroupDistribution || {}} />
            )}
          </div>

          {/* Theme Distribution */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="theme-distribution">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Lessons by Theme
              </h3>
            </div>
            {lessonStatsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : (
              <DistributionList data={lessonStats?.themeDistribution || {}} maxItems={6} />
            )}
          </div>
        </div>

        {/* Recent Activity & Users */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Signups */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="recent-signups">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                Recent Signups
              </h3>
            </div>
            {analyticsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : analytics?.recentSignups?.length ? (
              <div className="space-y-3">
                {analytics.recentSignups.slice(0, 5).map((user, idx) => (
                  <div key={user.id || idx} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-700 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-medium text-sm">
                        {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                          {user.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-stone-400">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8">
                No recent signups
              </p>
            )}
          </div>

          {/* Recent Lessons */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="recent-lessons">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Recent Lessons
              </h3>
            </div>
            {analyticsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
              </div>
            ) : analytics?.recentLessons?.length ? (
              <div className="space-y-3">
                {analytics.recentLessons.slice(0, 5).map((lesson, idx) => (
                  <div key={lesson.id || idx} className="flex items-center justify-between py-2 border-b border-stone-100 dark:border-stone-700 last:border-0">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100 text-sm line-clamp-1">
                        {lesson.title}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        {lesson.ageGroup}
                      </p>
                    </div>
                    <span className="text-xs text-stone-400">
                      {formatDate(lesson.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8">
                No recent lessons
              </p>
            )}
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-6" data-testid="user-management">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              User Management
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value)
                  setUserPage(1)
                }}
                className="pl-9 pr-4 py-2 w-full sm:w-64 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                data-testid="user-search-input"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-200 dark:border-stone-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">User</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden md:table-cell">Lessons</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.users?.map((user) => (
                      <tr key={user.id} className="border-b border-stone-100 dark:border-stone-700/50 hover:bg-stone-50 dark:hover:bg-stone-700/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-700 dark:text-amber-400 font-medium text-sm flex-shrink-0">
                              {(user.name || user.email)?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">
                                {user.name || 'Unknown'}
                              </p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm text-stone-600 dark:text-stone-300">
                            {user.lessonCount || 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-sm text-stone-500 dark:text-stone-400">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersData && usersData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    Showing {((userPage - 1) * 10) + 1} - {Math.min(userPage * 10, usersData.total)} of {usersData.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setUserPage(p => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-stone-600"
                      data-testid="users-prev-page"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-stone-600 dark:text-stone-400">
                      {userPage} / {usersData.totalPages}
                    </span>
                    <button
                      onClick={() => setUserPage(p => Math.min(usersData.totalPages, p + 1))}
                      disabled={userPage === usersData.totalPages}
                      className="px-3 py-1.5 text-sm font-medium rounded-lg bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-200 dark:hover:bg-stone-600"
                      data-testid="users-next-page"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  loading,
  testId 
}: { 
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  loading?: boolean
  testId?: string
}) {
  return (
    <div 
      className="bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 p-5"
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</span>
        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-500">
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 flex items-center">
          <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{value}</p>
          {change !== undefined && changeLabel && (
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                <ArrowUpRight className="w-3 h-3" />
                +{change}
              </span>
              {changeLabel}
            </p>
          )}
        </>
      )}
    </div>
  )
}

// Simple Bar Chart Component
function SimpleBarChart({ data, color }: { data: Record<string, number>; color: 'amber' | 'blue' }) {
  const entries = Object.entries(data).sort((a, b) => a[0].localeCompare(b[0])).slice(-7)
  const maxValue = Math.max(...entries.map(([, v]) => v), 1)
  
  const colorClasses = {
    amber: 'bg-amber-500 dark:bg-amber-600',
    blue: 'bg-blue-500 dark:bg-blue-600',
  }

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
        No data for this period
      </div>
    )
  }

  return (
    <div className="h-48 flex items-end gap-2">
      {entries.map(([date, value]) => {
        const height = (value / maxValue) * 100
        const displayDate = date.slice(5) // MM-DD format
        return (
          <div key={date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-medium text-stone-600 dark:text-stone-300">{value}</span>
            <div 
              className={`w-full rounded-t-lg ${colorClasses[color]} transition-all duration-300`}
              style={{ height: `${Math.max(height, 4)}%` }}
            />
            <span className="text-[10px] text-stone-400 dark:text-stone-500">{displayDate}</span>
          </div>
        )
      })}
    </div>
  )
}

// Distribution List Component
function DistributionList({ data, maxItems = 5 }: { data: Record<string, number>; maxItems?: number }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, maxItems)
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1
  
  const colors = [
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-rose-500',
    'bg-cyan-500',
  ]

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-stone-400 dark:text-stone-500 text-sm">
        No data available
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map(([label, value], idx) => {
        const percentage = ((value / total) * 100).toFixed(1)
        return (
          <div key={label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-700 dark:text-stone-300 truncate pr-2">{label || 'Unknown'}</span>
              <span className="text-stone-500 dark:text-stone-400 flex-shrink-0">{value} ({percentage}%)</span>
            </div>
            <div className="h-2 bg-stone-100 dark:bg-stone-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${colors[idx % colors.length]} rounded-full transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Date formatter
function formatDate(dateString: string | undefined): string {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return 'N/A'
  }
}
