import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { Rocket, Sparkles, BookOpen, FileQuestion, Users, Printer, ChevronDown, ChevronRight, Mail, HelpCircle, MessageCircle, Library, CalendarDays, Calendar, BarChart3, Layers } from 'lucide-react'
import { useI18n } from '@/i18n'

export const Route = createFileRoute('/help')({
  component: HelpPage,
})

function HelpPage() {
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const { t } = useI18n()

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Tutorial data with translation keys
  const tutorials = [
    {
      id: 'getting-started',
      titleKey: 'help.tutorial.gettingStarted',
      icon: <Rocket className="w-6 h-6" />,
      descKey: 'help.tutorial.gettingStartedDesc',
    },
    {
      id: 'creating-lessons',
      titleKey: 'help.tutorial.creatingLessons',
      icon: <Sparkles className="w-6 h-6" />,
      descKey: 'help.tutorial.creatingLessonsDesc',
    },
    {
      id: 'lesson-planner',
      titleKey: 'help.tutorial.weeklyPlanner',
      icon: <CalendarDays className="w-6 h-6" />,
      descKey: 'help.tutorial.weeklyPlannerDesc',
    },
    {
      id: 'lesson-series',
      titleKey: 'help.tutorial.creatingSeries',
      icon: <Calendar className="w-6 h-6" />,
      descKey: 'help.tutorial.creatingSeriesDesc',
    },
    {
      id: 'curriculum-planning',
      titleKey: 'help.tutorial.curriculumPlanning',
      icon: <Layers className="w-6 h-6" />,
      descKey: 'help.tutorial.curriculumPlanningDesc',
    },
    {
      id: 'progress-tracking',
      titleKey: 'help.tutorial.progressTracking',
      icon: <BarChart3 className="w-6 h-6" />,
      descKey: 'help.tutorial.progressTrackingDesc',
    },
    {
      id: 'quizzes-activities',
      titleKey: 'help.tutorial.quizzesActivities',
      icon: <FileQuestion className="w-6 h-6" />,
      descKey: 'help.tutorial.quizzesActivitiesDesc',
    },
    {
      id: 'team-collaboration',
      titleKey: 'help.tutorial.teamCollaboration',
      icon: <Users className="w-6 h-6" />,
      descKey: 'help.tutorial.teamCollaborationDesc',
    },
    {
      id: 'exporting-printing',
      titleKey: 'help.tutorial.printingLessons',
      icon: <Printer className="w-6 h-6" />,
      descKey: 'help.tutorial.printingLessonsDesc',
    },
  ]

  // Tutorial step content - bilingual
  const tutorialSteps: Record<string, { title: string; content: string }[]> = {
    'getting-started': [
      { title: 'Step 1: Create Your Free Account', content: 'Look at the top right corner of your screen. You\'ll see a blue button that says "Sign In / Sign Up". Click on it. A box will appear asking for your email address and a password you want to use. Type in your email (the one you use regularly) and create a password you\'ll remember. Then click the "Sign Up" button. That\'s it - you now have an account!' },
      { title: 'Step 2: Create Your First Lesson', content: 'At the top of the page, you\'ll see a menu. Click on "Create Lesson". A new page will open where you can type in what you want to teach. You can type things like "John 3:16", "The Story of Noah", or even just "forgiveness". Then pick who you\'re teaching (like "Preschool" or "Adult"). Finally, click the big "Generate Lesson" button. Wait about 30 seconds, and your complete lesson will appear!' },
      { title: 'Step 3: Look at Your New Lesson', content: 'After your lesson is created, you\'ll see it on screen. Scroll down slowly to see everything - the Bible verses, discussion questions, activities, and materials you\'ll need. Each section has its own colored box so it\'s easy to find what you need.' },
      { title: 'Step 4: Save Your Lessons', content: 'All your lessons are automatically saved! To find them later, click "My Lessons" in the top menu. You\'ll see a list of everything you\'ve created. Want to mark a favorite? Look for the heart icon and click it. Your favorites are easy to find when you need them again.' },
      { title: 'Step 5: Print When You\'re Ready', content: 'When it\'s time to teach, open your lesson and look for the "Print" button (it looks like a little printer). Click it, and your lesson will be formatted nicely for printing. You can print it right from your computer like any other document.' },
    ],
    'creating-lessons': [
      { title: 'What to Type in the "Passage" Box', content: 'You can type almost anything! Try: Bible verses like "Psalm 23" or "Matthew 6:9-13", Story names like "David and Goliath" or "The Good Samaritan", Topics like "prayer", "kindness", or "trusting God". Don\'t worry about getting the exact verse numbers - our system is smart and will find what you mean.' },
      { title: 'Choosing the Right Age Group', content: 'Click on the age group that matches who you\'re teaching. Here\'s a simple guide:\n\n• Preschool (3-5 years): Uses simple words, lots of pictures, short activities\n• Elementary (6-10 years): Adds more detail, fun crafts, basic discussions\n• Pre-Teen (11-13 years): More reading, deeper questions, relatable examples\n• Teen (14-17 years): Real-world applications, serious discussions\n• Adult (18+): In-depth study, historical context, life application\n\nIf your group has mixed ages, choose the youngest age - it\'s easier to add complexity than simplify!' },
      { title: 'Picking the Lesson Length', content: 'Choose how much time you have:\n\n• 15 minutes: Perfect for quick devotionals or opening activities\n• 30 minutes: Good for Sunday School classes\n• 45 minutes: Great for youth groups or Bible studies\n• 60+ minutes: For extended studies or retreats\n\nRemember: It\'s better to have extra material than not enough!' },
      { title: 'Making Changes to Your Lesson', content: 'After your lesson appears, you can change anything you want. Click on any section and a text box will appear. You can add your own stories, change words to fit your style, or remove parts you don\'t need. Just click "Save" when you\'re done.' },
      { title: 'Getting Your Lesson Ready to Use', content: 'When your lesson looks just right, you have several options:\n\n• Click "Print" to print it at home\n• Click "Export" to save it as a file you can email\n• Click "Share" to send a link to a helper\n\nYour lesson will look professional and be easy to follow during class.' },
    ],
    'lesson-planner': [
      { title: 'What is the Weekly Planner?', content: 'The Weekly Planner is your personal scheduling tool. It shows you a calendar view of the current week (or any week you choose) where you can assign lessons to specific days. Think of it like a teacher\'s planner book, but digital and always with you!' },
      { title: 'Navigating to the Planner', content: 'Click on "My Lessons" in the top menu, then select "Planner" from the dropdown. You\'ll see a weekly calendar view. You can click the arrows to move forward or backward through weeks, or click "Today" to jump back to the current week.' },
      { title: 'Adding Lessons to Your Schedule', content: 'To schedule a lesson, click on any empty day in the calendar. A list of your available lessons will appear. Click on the lesson you want to teach that day, and it will be added to your schedule. The lesson title and a brief summary will appear on that day.' },
      { title: 'Moving and Rescheduling Lessons', content: 'Plans change! To move a scheduled lesson to a different day, simply click and drag it to the new date. You can also click on a scheduled lesson and select "Remove" if you need to unschedule it entirely.' },
      { title: 'Viewing Scheduled Lesson Details', content: 'Click on any scheduled lesson in your planner to see a quick preview with the key details: title, passage, age group, and duration. Click "Open Full Lesson" to view the complete lesson content. This makes it easy to review what\'s coming up!' },
      { title: 'Weekly Overview and Preparation', content: 'At a glance, see everything you have planned for the week. The Planner shows you which days have lessons scheduled and which are open. Use this to prepare your materials ahead of time and ensure balanced coverage across your teaching schedule.' },
    ],
    'lesson-series': [
      { title: 'What is a Lesson Series?', content: 'A Series is a collection of related lessons grouped together under one theme. For example, you might create a series called "Heroes of Faith" that includes lessons on Abraham, Moses, David, and Esther. Series help you organize connected teachings and plan multi-week themes.' },
      { title: 'Creating a New Series', content: 'Go to "My Lessons" and select "Series" from the dropdown menu. Click the "Create Series" button. Give your series a name (like "Summer VBS - Adventures in the Bible") and add an optional description. You can also choose a color tag to make it easy to identify.' },
      { title: 'Adding Lessons to a Series', content: 'Once your series is created, click "Add Lessons" to see all your available lessons. Check the box next to each lesson you want to include. You can add existing lessons or create new ones specifically for this series. The order you add them becomes the teaching order.' },
      { title: 'Reordering Lessons in a Series', content: 'Want to teach lessons in a different order? Open your series and drag-and-drop the lessons to rearrange them. The numbers will automatically update. This is helpful when you want to build concepts progressively throughout the series.' },
      { title: 'Viewing Series Progress', content: 'Each series shows you how many lessons you\'ve completed versus the total. As you mark lessons complete in Progress Tracker, your series progress updates automatically. A progress bar helps you visualize how far along you are.' },
      { title: 'Sharing and Duplicating Series', content: 'Created a great series? You can share it with team members or duplicate it for next year. Click the menu icon on any series to see options for sharing, duplicating, or archiving. Duplicating creates a fresh copy you can modify without affecting the original.' },
    ],
    'curriculum-planning': [
      { title: 'What is a Curriculum?', content: 'A curriculum is simply a plan for several weeks of teaching. Instead of creating lessons one at a time, you can see your whole teaching season at a glance. Think of it like a menu for a week\'s meals - you plan ahead so you know what\'s coming.' },
      { title: 'How to Start a New Curriculum', content: 'Go to "My Lessons" at the top of the page, then click on "Curriculum". You\'ll see a button that says "New Curriculum" - click it. Give your curriculum a name like "Summer Bible School 2025" or "Youth Group - Fall Quarter". This helps you find it later.' },
      { title: 'Adding Lessons to Your Curriculum', content: 'After creating your curriculum, you\'ll see a button to "Add Lessons". Click it, and you\'ll see all your saved lessons. Click on each one you want to include - they\'ll be added to your curriculum. You can drag and drop them to put them in the order you want to teach them.' },
      { title: 'Setting Your Teaching Dates', content: 'Click on "Set Dates" to choose when your curriculum starts and ends. Pick your first teaching date from the calendar that appears, then pick your last date. The system will help you space out your lessons evenly.' },
      { title: 'Tracking Your Progress', content: 'As you teach each lesson, come back and check it off. Click the circle next to any completed lesson to mark it done. You\'ll see a progress bar showing how far you\'ve come in your curriculum. This helps you stay on track all season!' },
      { title: 'Syncing with Your Calendar (Optional)', content: 'If you use Google Calendar, Outlook, or Apple Calendar, you can add all your lessons at once! Look for the "Calendar Sync" button. Click it, choose your calendar type, and download the file. Open it, and all your lessons appear as events with reminders!' },
    ],
    'progress-tracking': [
      { title: 'What is Progress Tracking?', content: 'Progress Tracking helps you keep a record of which lessons you\'ve taught, which ones you\'re currently working on, and which ones are still ahead. It\'s like a checklist that remembers everything for you, so you never lose track of where you are in your teaching.' },
      { title: 'Accessing Progress Tracker', content: 'Click on "My Lessons" in the top menu, then select "Progress" from the dropdown. You\'ll see a dashboard showing all your lessons organized by their status: Completed, In Progress, or Not Started. You\'ll also see statistics like your overall completion rate.' },
      { title: 'Understanding Lesson Status', content: 'Each lesson can have one of three statuses:\n\n• Not Started: You haven\'t begun teaching this lesson yet\n• In Progress: You\'ve started but not finished (maybe it\'s a multi-week lesson)\n• Completed: You\'ve finished teaching this lesson\n\nStatus helps you quickly see what needs attention.' },
      { title: 'Updating Lesson Progress', content: 'To change a lesson\'s status, find it in your Progress Tracker and click the status dropdown. Select the new status: "Not Started", "In Progress", or "Completed". The change saves automatically, and your statistics update immediately.' },
      { title: 'Filtering Your View', content: 'Use the filter buttons at the top to show only certain lessons. Click "Completed" to see everything you\'ve finished (great for reviewing!). Click "Not Started" to see what\'s still ahead. This helps you focus on exactly what you need.' },
      { title: 'Adding Notes to Progress', content: 'Each progress entry can include personal notes. Click on a lesson\'s progress card to expand it, then add notes like "Kids loved the craft activity" or "Need more time for discussion next time". These notes help you improve your teaching over time.' },
      { title: 'Viewing Progress Statistics', content: 'At the top of Progress Tracker, you\'ll see a statistics summary showing:\n\n• Total lessons in your library\n• How many are completed, in progress, and not started\n• Your overall completion percentage\n\nWatch your completion rate grow as you teach!' },
    ],
    'quizzes-activities': [
      { title: 'Creating a Quiz for Your Lesson', content: 'Open any lesson and scroll down until you see the "Quiz" button. Click it, and a new quiz will be created automatically! The questions are based on what\'s in your lesson, so students learn while they play.' },
      { title: 'Types of Questions', content: 'Your quiz will include:\n\n• Multiple Choice: Students pick the right answer from 4 options\n• True or False: Students decide if a statement is right or wrong\n\nAll questions are designed to help students remember the key points from your lesson.' },
      { title: 'Printing Quiz Sheets', content: 'Click "Print Quiz" to get a paper version. You\'ll get:\n\n• A student version with blank answers\n• A teacher version with the correct answers marked\n\nThis makes it easy to grade or use for group discussions.' },
      { title: 'Activities Already in Your Lessons', content: 'Every lesson you create includes activities appropriate for the age group:\n\n• Crafts for young children (with step-by-step instructions)\n• Games and object lessons for elementary kids\n• Discussion questions for teens and adults\n• Reflection exercises for personal study\n\nAll materials needed are listed in the "Supplies" section.' },
    ],
    'team-collaboration': [
      { title: 'Inviting a Team Member', content: 'Click "Team" in the top menu. You\'ll see a button that says "Invite Member" - click it. Type in your helper\'s email address and click "Send Invitation". They\'ll get an email with instructions to join your team. It\'s that simple!' },
      { title: 'Understanding Team Roles', content: 'When you invite someone, you choose what they can do:\n\n• Viewer: Can see and print lessons, but not change them (perfect for substitute teachers)\n• Editor: Can view, print, AND make changes to lessons (great for co-teachers)\n• Owner: Full control over everything (that\'s you!)\n\nYou can change someone\'s role anytime by clicking on their name in the Team page.' },
      { title: 'Sharing a Specific Lesson', content: 'Don\'t want to share everything? No problem! Open any lesson and click the "Share" button. You can:\n\n• Copy a link to send in an email or text message\n• Email the lesson directly to someone\n• Print a copy for them\n\nThis way, you control exactly what gets shared.' },
      { title: 'Sending Lessons by Email', content: 'Open a lesson, click "Share", then click "Email Lesson". Type in the person\'s email address and add a short note if you want. Click "Send" and they\'ll receive a beautifully formatted lesson they can read on any computer or phone.' },
    ],
    'exporting-printing': [
      { title: 'How to Print a Lesson', content: 'Open the lesson you want to print. Look for the "Print" button near the top (it has a little printer icon). Click it. A preview will show you exactly how your lesson will look. Then click "Print" again, choose your printer, and hit "Print". Your lesson will come out looking professional and organized!' },
      { title: 'Saving as a PDF File', content: 'Want to save your lesson to your computer or send it by email? Click "Export" and choose "PDF". A file will download to your computer. You can:\n\n• Attach it to an email\n• Save it in a folder for later\n• Upload it to Google Drive or Dropbox\n• Print it at a copy shop if you need many copies' },
      { title: 'Getting Word Documents', content: 'If you want to edit your lesson more before printing, choose "Word" when you export. This creates a file you can open in Microsoft Word or Google Docs. You can:\n\n• Add your own pictures\n• Change fonts and colors\n• Rearrange sections\n• Add notes just for you' },
      { title: 'Tips for Best Printing Results', content: '• Use regular letter-size paper (8.5 x 11 inches)\n• Print activity pages in color when possible - kids love color!\n• For text-heavy pages, black and white works fine and saves ink\n• Print an extra copy to keep in your teaching bag\n• Consider two-sided printing to save paper' },
      { title: 'Getting Your Supply List Ready', content: 'Every lesson shows what materials you need. Click "Supply List" to see everything in one place. You can:\n\n• Print the list to take shopping\n• Check off items as you gather them\n• See estimated costs to help with budgeting\n• Find substitution ideas if you can\'t find something' },
    ],
  }

  const faqs = [
    { question: 'Is this free to use?', answer: 'Yes! You can create 3 lessons per month completely free. This is enough for many teachers. If you need more lessons, our Starter plan ($9.99/month) gives you 25 lessons, and Unlimited ($19.99/month) has no limits at all.' },
    { question: 'Can I change the lessons after they\'re created?', answer: 'Absolutely! Think of the generated lesson as a starting point. You can click on any section and type your own words, add personal stories, change activities, or remove parts you don\'t need. The lesson becomes yours to customize however you want.' },
    { question: 'What Bible versions can I use?', answer: 'We support many Bible versions including NIV, ESV, KJV, NKJV, NLT, and more. When you sign up, you can pick your favorite version, and all your lessons will use it. You can change this anytime in your account settings.' },
    { question: 'Can I use the lessons without internet?', answer: 'Yes! Export your lessons to PDF before you teach, and you\'ll have them saved on your computer. You can print them or read them even without internet. This is great if your church has spotty Wi-Fi!' },
    { question: 'How do I cancel if I don\'t need it anymore?', answer: 'No worries - canceling is easy. Click on your name in the top right, go to "Account Settings", then "Subscription". Click "Cancel Subscription" and confirm. You won\'t be charged again, and you can still use your account until the end of the period you\'ve paid for.' },
    { question: 'Is my information kept private?', answer: 'Yes, 100%! Your lessons and personal information are private. We don\'t share, sell, or give away your data to anyone. We use bank-level security to keep everything safe.' },
    { question: 'I\'m not tech-savvy. Can I still use this?', answer: 'Definitely! We designed Bible Lesson Planner to be as simple as possible. If you can send an email, you can use our service. Just type in what you want to teach, click a button, and get your lesson. If you ever get stuck, our support team is happy to help!' },
    { question: 'Can multiple people use the same account?', answer: 'For a single church or ministry, yes! Use the Team feature to invite other teachers. They each get their own login, but everyone shares the lesson library. This way, your whole team can work together without paying for separate accounts.' },
  ]

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      {/* Hero Section */}
      <section className="py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
            <Library className="w-4 h-4" strokeWidth={1.5} /> {t('help.badge')}
          </span>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('help.title')}
          </h1>
          
          <p className="text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('help.subtitle')}
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-4 border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {tutorials.map(tutorial => (
              <a
                key={tutorial.id}
                href={`#${tutorial.id}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-all"
              >
                <span className="text-amber-600 dark:text-amber-500">{tutorial.icon}</span>
                {t(tutorial.titleKey)}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {tutorials.map(tutorial => (
            <div
              key={tutorial.id}
              id={tutorial.id}
              className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden shadow-sm"
            >
              {/* Tutorial Header */}
              <button
                onClick={() => setActiveSection(activeSection === tutorial.id ? null : tutorial.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
                    {tutorial.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                      {t(tutorial.titleKey)}
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {t(tutorial.descKey)}
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-stone-400 transition-transform duration-200 ${activeSection === tutorial.id ? 'rotate-180' : ''}`}
                  strokeWidth={1.5}
                />
              </button>

              {/* Tutorial Steps */}
              {activeSection === tutorial.id && tutorialSteps[tutorial.id] && (
                <div className="border-t border-stone-200 dark:border-stone-700 p-5 bg-stone-50/50 dark:bg-stone-800/50">
                  <div className="space-y-4">
                    {tutorialSteps[tutorial.id].map((step, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </div>
                        </div>
                        <div className="flex-1 pt-0.5">
                          <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                            {step.title}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-line">
                            {step.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section className="py-10 bg-white dark:bg-stone-800/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              {t('help.faqTitle')}
            </h2>
            <p className="text-stone-500 dark:text-stone-400">
              {t('help.faqSubtitle')}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 border border-stone-200 dark:border-stone-700"
              >
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2 flex items-start gap-2">
                  <span className="text-amber-600 dark:text-amber-500">Q:</span>
                  {faq.question}
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support - Premium Sunday Morning Design */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-1 shadow-2xl shadow-amber-500/20">
            <div className="relative rounded-[22px] bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700 p-8 sm:p-12 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 -translate-y-32 translate-x-32">
                <div className="w-full h-full rounded-full bg-white/10 blur-3xl" />
              </div>
              <div className="absolute bottom-0 left-0 w-48 h-48 translate-y-24 -translate-x-24">
                <div className="w-full h-full rounded-full bg-orange-400/20 blur-2xl" />
              </div>
              
              {/* Pattern Overlay */}
              <div className="absolute inset-0 opacity-5">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <pattern id="support-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                    <circle cx="5" cy="5" r="1" fill="currentColor" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#support-pattern)" className="text-white" />
                </svg>
              </div>
              
              <div className="relative text-center">
                {/* Icon */}
                <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mx-auto mb-6 rotate-3 transform hover:rotate-0 transition-transform duration-300">
                  <MessageCircle className="w-10 h-10 text-white" strokeWidth={1.5} />
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
                  {t('help.stillNeedHelp')}
                </h2>
                <p className="text-white/80 mb-8 text-lg max-w-md mx-auto">
                  {t('help.teamHere')}
                </p>
                
                <Link
                  to="/contact"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-amber-700 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/20 hover:scale-105 transition-all duration-300"
                  data-testid="contact-support-btn"
                >
                  <Mail className="w-5 h-5" strokeWidth={2} />
                  {t('help.contactSupport')}
                  <ChevronRight className="w-5 h-5 opacity-50 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
