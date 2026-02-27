import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { lessonStore, pickGradient, GRADIENTS, type LessonData, type LessonSection } from '@/lib/lesson-store'
import { useSEO, trackPageView } from '@/lib/seo'
import { 
  BookOpen, Star, Users, Clock, Heart, Sparkles, Search, X, 
  ChevronRight, Copy, Eye, Filter, LayoutGrid, Baby, GraduationCap,
  TreePine, Gift, Cross, Sunrise, Flame, Crown, Anchor, Mountain,
  WifiOff, Download, CloudOff, FileText
} from 'lucide-react'
import { usePendingTemplates } from '@/lib/use-pending-templates'
import { useOnlineStatus } from '@/lib/use-offline-lessons'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'
import { useI18n } from '@/i18n'

export const Route = createFileRoute('/templates')({
  component: TemplatesPage,
})

// Template categories - use translation keys
const CATEGORIES = [
  { id: 'all', nameKey: 'templates.allTemplates', icon: LayoutGrid },
  { id: 'holidays', nameKey: 'templates.holidaysSeasons', icon: Gift },
  { id: 'parables', nameKey: 'templates.parablesOfJesus', icon: BookOpen },
  { id: 'old-testament', nameKey: 'templates.oldTestamentHeroes', icon: Crown },
  { id: 'new-testament', nameKey: 'templates.newTestament', icon: Cross },
  { id: 'themes', nameKey: 'templates.characterThemes', icon: Heart },
]

// Age group filters - use translation keys
const AGE_GROUPS = [
  { id: 'all', nameKey: 'templates.allAges' },
  { id: 'preschool', nameKey: 'templates.preschool', icon: Baby },
  { id: 'elementary', nameKey: 'templates.elementary', icon: Users },
  { id: 'preteen', nameKey: 'templates.preteen', icon: GraduationCap },
]

// Lesson template data
interface LessonTemplate {
  id: string
  title: string
  passage: string
  description: string
  ageGroup: string
  duration: string
  theme: string
  category: string
  icon: typeof BookOpen
  popular: boolean
  memoryVerse: { text: string; reference: string }
  objectives: string[]
  sections: LessonSection[]
  materialsNeeded: { item: string; category: string }[]
  crossReferences: { reference: string; text: string }[]
  teacherNotes: string[]
}

const LESSON_TEMPLATES: LessonTemplate[] = [
  // HOLIDAYS & SEASONS
  {
    id: 'christmas-story',
    title: 'The Christmas Story: Jesus is Born',
    passage: 'Luke 2:1-20',
    description: 'Celebrate the birth of Jesus with this engaging lesson about the first Christmas, featuring shepherds, angels, and the manger.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'God\'s Love & Promise',
    category: 'holidays',
    icon: Gift,
    popular: true,
    memoryVerse: { text: 'For unto you is born this day in the city of David a Savior, who is Christ the Lord.', reference: 'Luke 2:11 (ESV)' },
    objectives: [
      'Understand why Jesus came to earth as a baby',
      'Recognize that Jesus is God\'s greatest gift to us',
      'Learn about the people who first heard about Jesus\' birth',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Welcome Activity:**\nAs children arrive, have them decorate a simple paper stable or manger scene.\n\n**Opening Prayer:**\n"Dear God, thank You for sending Jesus to be our Savior. Help us learn more about the special night He was born. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Read Luke 2:1-20 together**\n\nUse a children\'s Bible or read dramatically, pausing to explain:\n- Caesar Augustus - the Roman emperor\n- Bethlehem - the city of David\n- Manger - a feeding trough for animals\n- Shepherds - people who watched over sheep' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Points:**\n\n1. **God keeps His promises** - Prophets said Jesus would be born in Bethlehem\n\n2. **Jesus came for everyone** - Shepherds were ordinary people, but God chose them first to hear the news\n\n3. **Jesus is the greatest gift** - God loved us so much He sent His only Son' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '10 minutes', content: '**Nativity Scene Freeze Game:**\n- Assign roles: Mary, Joseph, shepherds, angels, animals\n- Play Christmas music\n- When music stops, everyone freezes in their character pose\n- Leader reads a verse from the story' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Manger Ornament Craft:**\n- Materials: Popsicle sticks, yarn, small star sticker\n- Glue sticks into a manger shape\n- Add yarn for "hay"\n- Place star sticker on top\n- Write memory verse on back' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Review Questions:**\n- Where was Jesus born?\n- Who came to visit baby Jesus first?\n- Why did God send Jesus?\n\n**Closing Prayer:**\n"Thank You, God, for the gift of Jesus. Help us share Your love with others. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Children\'s Bible', category: 'Teaching' },
      { item: 'Popsicle sticks', category: 'Craft' },
      { item: 'Yarn (tan/brown)', category: 'Craft' },
      { item: 'Star stickers', category: 'Craft' },
      { item: 'Glue', category: 'Craft' },
      { item: 'Christmas music', category: 'Activity' },
    ],
    crossReferences: [
      { reference: 'Isaiah 9:6', text: 'Prophecy of the coming Messiah' },
      { reference: 'Micah 5:2', text: 'Bethlehem foretold as birthplace' },
      { reference: 'Matthew 1:21', text: 'Jesus will save His people' },
    ],
    teacherNotes: [
      'Consider having a simple nativity set for visual aid',
      'Some children may not celebrate Christmas - be sensitive to different backgrounds',
      'Emphasize that the real meaning of Christmas is Jesus, not presents',
    ],
  },
  {
    id: 'easter-resurrection',
    title: 'The Resurrection: Jesus is Alive!',
    passage: 'Matthew 28:1-10',
    description: 'Experience the joy of Easter morning as we discover the empty tomb and celebrate that Jesus conquered death.',
    ageGroup: 'Elementary (6-10)',
    duration: '50 minutes',
    theme: 'Hope & New Life',
    category: 'holidays',
    icon: Sunrise,
    popular: true,
    memoryVerse: { text: 'He is not here; he has risen, just as he said.', reference: 'Matthew 28:6 (NIV)' },
    objectives: [
      'Understand that Jesus rose from the dead on the third day',
      'Recognize Easter as a celebration of Jesus\' victory over death',
      'Feel the joy and hope that comes from knowing Jesus is alive',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Excitement Builder:**\nAsk: "What\'s the best surprise you\'ve ever received?"\n\nToday we\'re going to hear about the BEST surprise ever!\n\n**Opening Prayer:**\n"God, fill our hearts with joy as we learn about the day Jesus rose again. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Read Matthew 28:1-10**\n\nDramatically tell the story:\n- It was early Sunday morning\n- The women came to visit Jesus\' tomb\n- There was an earthquake!\n- An angel appeared and rolled away the stone\n- The tomb was EMPTY!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Main Points:**\n\n1. **Jesus kept His promise** - He said He would rise again, and He did!\n\n2. **The tomb was empty** - Jesus wasn\'t there because He was ALIVE\n\n3. **This changes everything** - Because Jesus is alive, we can have eternal life too\n\n**Discussion:**\nHow do you think the women felt when they saw the empty tomb?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Empty Tomb Discovery:**\n- Hide plastic eggs around the room\n- Each egg contains a piece of the Easter story\n- Children find eggs and put the story in order\n- Final egg is EMPTY - representing the empty tomb!' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**"He Is Risen" Stone Craft:**\n- Paint smooth stones gray\n- Write "He is Risen!" on one side\n- Draw a small cross on the other\n- Use as paperweight or garden decoration' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Joyful Celebration:**\nLead children in saying together: "He is risen!" Response: "He is risen indeed!"\n\n**Closing Prayer:**\n"Thank You, Jesus, for rising from the dead. Thank You that we can have hope because You are alive! Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Plastic eggs', category: 'Activity' },
      { item: 'Story strips for eggs', category: 'Activity' },
      { item: 'Smooth stones', category: 'Craft' },
      { item: 'Acrylic paint (gray)', category: 'Craft' },
      { item: 'Fine-tip markers', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Luke 24:1-12', text: 'Luke\'s account of the resurrection' },
      { reference: '1 Corinthians 15:3-4', text: 'Christ died and rose again' },
      { reference: 'John 11:25', text: 'Jesus is the resurrection and the life' },
    ],
    teacherNotes: [
      'Easter is the most important celebration in Christianity',
      'Be prepared for questions about death - answer age-appropriately',
      'Focus on the JOY and HOPE of the resurrection',
    ],
  },

  // PARABLES OF JESUS
  {
    id: 'good-samaritan',
    title: 'The Good Samaritan: Loving Your Neighbor',
    passage: 'Luke 10:25-37',
    description: 'Jesus teaches us through this powerful parable that our neighbor is anyone who needs our help, and true love shows in action.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Compassion & Kindness',
    category: 'parables',
    icon: Heart,
    popular: true,
    memoryVerse: { text: 'Love your neighbor as yourself.', reference: 'Mark 12:31 (NIV)' },
    objectives: [
      'Understand that Jesus wants us to help everyone in need',
      'Learn that being a "neighbor" means showing kindness to others',
      'Identify ways to show compassion in everyday life',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion Starter:**\nAsk: "Who is your neighbor?" (Let children name people who live near them)\n\nToday Jesus is going to teach us that our neighbor might be someone unexpected!\n\n**Opening Prayer:**\n"Dear God, help us learn how to love others the way You love us. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Tell the Parable of the Good Samaritan (Luke 10:25-37)**\n\n**Characters:**\n- A man traveling from Jerusalem to Jericho\n- Robbers who hurt him\n- A priest who walked by\n- A Levite who walked by\n- A Samaritan who stopped to help\n\nUse different voices for each character!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Lessons:**\n\n1. **It\'s not enough to just know the right thing** - The priest and Levite knew God\'s laws but didn\'t help\n\n2. **Love shows through action** - The Samaritan didn\'t just feel sorry, he DID something\n\n3. **Everyone is our neighbor** - Even people who are different from us\n\n**Ask:** Why do you think the priest and Levite didn\'t stop?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Good Neighbor Role Play:**\n- Create scenarios where someone needs help\n- Children act out being "Good Samaritans"\n- Examples: New kid at school, someone drops books, friend is sad\n\n**Discuss:** How did it feel to help? How would it feel to be helped?' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Kindness Coupons Booklet:**\n- Create small booklets\n- Each page is a "coupon" for an act of kindness\n- Ideas: Help with chores, share a toy, give a hug\n- Children give coupons to family members' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nThis week, look for ONE person who needs help and be their "Good Samaritan"!\n\n**Closing Prayer:**\n"Jesus, help us see people who need our help. Give us courage to stop and show kindness. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Props for role play', category: 'Activity' },
      { item: 'Paper for booklets', category: 'Craft' },
      { item: 'Markers/crayons', category: 'Craft' },
      { item: 'Stapler', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Matthew 22:37-39', text: 'The greatest commandments' },
      { reference: '1 John 3:18', text: 'Love in action, not just words' },
      { reference: 'Galatians 6:2', text: 'Bear one another\'s burdens' },
    ],
    teacherNotes: [
      'Samaritans and Jews historically didn\'t get along - this makes the story more impactful',
      'Focus on practical ways children can show kindness',
      'Avoid making children feel guilty - emphasize the joy of helping others',
    ],
  },
  {
    id: 'prodigal-son',
    title: 'The Prodigal Son: God\'s Amazing Forgiveness',
    passage: 'Luke 15:11-32',
    description: 'Discover the incredible love of a father who welcomes his lost son home, teaching us about God\'s forgiveness and grace.',
    ageGroup: 'Pre-Teen (11-13)',
    duration: '50 minutes',
    theme: 'Forgiveness & Grace',
    category: 'parables',
    icon: Heart,
    popular: true,
    memoryVerse: { text: 'But while he was still a long way off, his father saw him and was filled with compassion for him.', reference: 'Luke 15:20 (NIV)' },
    objectives: [
      'Understand that God always welcomes us back when we repent',
      'Recognize that forgiveness is a gift, not something we earn',
      'Apply the lesson to their own lives and relationships',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Opening Question:**\nHave you ever made a mistake and wished you could start over?\n\nToday\'s story is about second chances and a love that never gives up.\n\n**Opening Prayer:**\n"God, thank You for loving us even when we mess up. Help us understand Your amazing forgiveness. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '12 minutes', content: '**Read Luke 15:11-32**\n\nDivide into three parts:\n1. The son leaves (v. 11-16)\n2. The son returns (v. 17-24)\n3. The older brother\'s reaction (v. 25-32)\n\n**Key moments to highlight:**\n- The son demands his inheritance\n- He wastes everything\n- He ends up feeding pigs (lowest job for a Jewish person)\n- The father RUNS to meet him' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '12 minutes', content: '**Deep Dive:**\n\n**The Father represents God:**\n- He didn\'t chase his son, but waited patiently\n- He was watching and hoping every day\n- He ran to him (unusual for a dignified man!)\n- He restored him completely\n\n**The Younger Son represents us:**\n- We sometimes want to do things our own way\n- Sin leads us to emptiness\n- We can always come back to God\n\n**The Older Brother:**\n- Sometimes we judge others\n- God\'s grace seems "unfair" but it\'s for everyone\n\n**Discussion:** Which character do you relate to most?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Small Group Discussion:**\nDivide into groups and discuss:\n1. Why did the son want to leave?\n2. What made him decide to come back?\n3. How do you think the father felt waiting?\n4. Is the older brother\'s anger understandable?\n\n**Share:** Each group shares one insight with the class.' },
      { title: 'Reflection & Application', icon: '💬', type: 'discussion', duration: '6 minutes', content: '**Personal Application:**\n- Is there anything keeping you from coming to God?\n- Is there someone you need to forgive?\n- How can you show "father-like" love to others?\n\n**Journal Prompt:**\nWrite a letter to God about something you want to bring back to Him.' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Reminder:**\nNo matter how far you\'ve wandered, God is waiting with open arms.\n\n**Closing Prayer:**\n"Father, thank You for Your incredible love that never gives up on us. Help us run to You and also forgive others the way You forgive us. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Journals or paper', category: 'Activity' },
      { item: 'Pens', category: 'Activity' },
      { item: 'Discussion question cards', category: 'Activity' },
    ],
    crossReferences: [
      { reference: 'Romans 5:8', text: 'God shows His love while we were sinners' },
      { reference: 'Ephesians 2:4-5', text: 'Rich in mercy, made alive in Christ' },
      { reference: 'Isaiah 55:7', text: 'The Lord will have mercy' },
    ],
    teacherNotes: [
      'This story can be emotional - be prepared for personal sharing',
      'Pre-teens may relate to wanting independence',
      'Emphasize that the father\'s love never changed, even when the son left',
    ],
  },

  // OLD TESTAMENT HEROES
  {
    id: 'david-goliath',
    title: 'David and Goliath: Courage with God',
    passage: '1 Samuel 17:1-50',
    description: 'The classic story of a young shepherd boy who faced a giant with nothing but faith in God and five smooth stones.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Courage & Faith',
    category: 'old-testament',
    icon: Mountain,
    popular: true,
    memoryVerse: { text: 'The LORD who rescued me from the paw of the lion and the paw of the bear will rescue me from the hand of this Philistine.', reference: '1 Samuel 17:37 (NIV)' },
    objectives: [
      'Learn that God gives us courage to face our fears',
      'Understand that God uses ordinary people for extraordinary things',
      'Identify "giants" in our own lives that God can help us overcome',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Icebreaker:**\nMeasure out 9 feet on the floor or wall - that\'s how tall Goliath was!\n\nAsk: "What would you do if you saw someone this tall coming toward you?"\n\n**Opening Prayer:**\n"God, help us learn from David that with You, we can face anything! Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Tell the story dramatically from 1 Samuel 17**\n\n**Scene 1:** The Israelite army is terrified of Goliath\n**Scene 2:** David arrives bringing food for his brothers\n**Scene 3:** David volunteers to fight\n**Scene 4:** David refuses Saul\'s armor\n**Scene 5:** David defeats Goliath with one stone\n\nUse sound effects and voices!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Lessons:**\n\n1. **David\'s confidence was in GOD, not himself**\n- He didn\'t say "I can beat him"\n- He said "GOD will deliver me"\n\n2. **God prepared David through small challenges**\n- Protecting sheep from lions and bears\n- These "small" victories built his faith\n\n3. **The world\'s solutions don\'t always fit**\n- Saul\'s armor didn\'t work for David\n- God used David\'s unique skills\n\n**Ask:** What are some "giants" kids face today? (fears, bullies, hard situations)' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Five Stones Challenge:**\nGive each child 5 paper "stones" to write on:\n\nStone 1: A fear I face\nStone 2: Something that seems impossible\nStone 3: A person who is hard to deal with\nStone 4: A challenge at school\nStone 5: Something I want God to help me with\n\nPray over these together, then keep stones as reminders.' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**"Giant Fighter" Shield Craft:**\n- Cut shield shape from cardboard\n- Decorate with crosses and stars\n- Write memory verse on it\n- Attach string to wear' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Encouragement:**\nRemember - David was just a kid! God can use YOU too!\n\n**Closing Prayer:**\n"Lord, when we face giants in our lives, help us remember that You are bigger than any problem. Give us David\'s courage. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Measuring tape', category: 'Visual Aid' },
      { item: 'Paper stones (cut-outs)', category: 'Activity' },
      { item: 'Cardboard', category: 'Craft' },
      { item: 'Markers/paint', category: 'Craft' },
      { item: 'String', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Psalm 27:1', text: 'The Lord is my light - whom shall I fear?' },
      { reference: 'Isaiah 41:10', text: 'Fear not, for I am with you' },
      { reference: 'Philippians 4:13', text: 'I can do all things through Christ' },
    ],
    teacherNotes: [
      'Emphasize that David\'s courage came from his relationship with God',
      'Help children identify real "giants" they face',
      'Don\'t glorify violence - focus on faith and trust',
    ],
  },
  {
    id: 'noah-ark',
    title: 'Noah\'s Ark: Trusting God\'s Plan',
    passage: 'Genesis 6:9-22, 7:1-24',
    description: 'Noah obeyed God even when it didn\'t make sense, building an ark for a flood that had never happened before.',
    ageGroup: 'Preschool (3-5)',
    duration: '30 minutes',
    theme: 'Obedience & Trust',
    category: 'old-testament',
    icon: Anchor,
    popular: true,
    memoryVerse: { text: 'Noah did everything just as God commanded him.', reference: 'Genesis 6:22 (NIV)' },
    objectives: [
      'Learn that Noah obeyed God even when it was hard',
      'Understand that God keeps His promises',
      'Practice counting and naming animals',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '4 minutes', content: '**Animal Sound Game:**\nMake animal sounds and have children guess the animal!\n\nToday we\'re learning about a man who built a BIG boat for lots of animals!\n\n**Opening Prayer:**\n"Dear God, help us listen and obey like Noah did. Amen."' },
      { title: 'Story Time', icon: '📖', type: 'scripture', duration: '8 minutes', content: '**Tell the Story Simply:**\n\n1. "God loved Noah because Noah loved God"\n2. "God told Noah to build a BIG boat called an ark"\n3. "Noah obeyed even though people laughed"\n4. "Animals came two by two - elephants, giraffes, lions!"\n5. "Rain came and covered everything"\n6. "God kept Noah and the animals safe"\n7. "God put a rainbow in the sky as a promise"\n\nUse toy animals and a toy boat as props!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '5 minutes', content: '**Simple Lessons:**\n\n**Noah OBEYED God**\n- When God asks us to do something, we should listen!\n- Parents and teachers help us know what\'s right\n\n**God kept His PROMISE**\n- The rainbow reminds us God keeps His promises\n\n**Ask:** Can you think of a time you obeyed even when it was hard?' },
      { title: 'Activity Time', icon: '🎮', type: 'activity', duration: '8 minutes', content: '**Animal Parade:**\n- Line up animals two by two\n- March around the room "into the ark"\n- Count: "Two giraffes, two elephants, two lions..."\n- Sing: "The animals came in two by two, hurrah, hurrah!"' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Rainbow Promise Craft:**\n- Pre-cut rainbow arcs in colors\n- Glue onto paper in order (red, orange, yellow, green, blue, purple)\n- Add cotton ball clouds\n- Write "God Keeps His Promises"' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Rainbow Reminder:**\nNext time you see a rainbow, remember that God always keeps His promises!\n\n**Closing Prayer:**\n"Thank You, God, for keeping us safe like You kept Noah safe. Help us obey You. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Toy animals (pairs)', category: 'Visual Aid' },
      { item: 'Toy boat/ark', category: 'Visual Aid' },
      { item: 'Rainbow paper arcs', category: 'Craft' },
      { item: 'Cotton balls', category: 'Craft' },
      { item: 'Glue sticks', category: 'Craft' },
      { item: 'Construction paper', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Genesis 9:13-16', text: 'God\'s rainbow promise' },
      { reference: 'Hebrews 11:7', text: 'By faith Noah built an ark' },
    ],
    teacherNotes: [
      'Keep it simple and interactive for preschoolers',
      'Use lots of visuals and movement',
      'Focus on obedience and God\'s faithfulness, not the flood destruction',
    ],
  },

  // NEW TESTAMENT
  {
    id: 'feeding-5000',
    title: 'Jesus Feeds 5,000: Sharing What We Have',
    passage: 'John 6:1-14',
    description: 'A young boy shares his lunch and Jesus multiplies it to feed thousands, teaching us that God can do amazing things with what we offer.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Generosity & Trust',
    category: 'new-testament',
    icon: Gift,
    popular: false,
    memoryVerse: { text: 'Here is a boy with five small barley loaves and two small fish, but how far will they go among so many?', reference: 'John 6:9 (NIV)' },
    objectives: [
      'Learn that Jesus can multiply what we give Him',
      'Understand the importance of sharing',
      'Trust that God can use small things for big purposes',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Opening Question:**\nHave you ever shared your lunch with someone? What did you share?\n\nToday we\'ll hear about a boy who shared his small lunch and something AMAZING happened!\n\n**Opening Prayer:**\n"Dear Jesus, help us learn to share like the boy in today\'s story. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Read John 6:1-14**\n\n**Bring the scene to life:**\n- 5,000 people were following Jesus\n- It was getting late and people were hungry\n- The disciples panicked: "Where can we get food?"\n- Andrew found a boy with 5 loaves and 2 fish\n- Jesus took the food, thanked God, and fed EVERYONE\n- There were 12 baskets of leftovers!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Points:**\n\n1. **The boy was willing to share**\n- He could have said "This is MY lunch!"\n- Instead, he gave what he had to Jesus\n\n2. **Jesus multiplied it**\n- 5 loaves + 2 fish = 5,000+ fed\n- Only Jesus could do this miracle!\n\n3. **Nothing is too small for God**\n- Your talents, time, and treasures matter to God\n- He can do big things with small offerings\n\n**Discussion:** What "small things" do you have that God might want to use?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '10 minutes', content: '**Sharing Circle Game:**\n- Sit in a circle with snack crackers\n- Start with one person having all crackers\n- As you read the story, have them share\n- By the end, everyone has some!\n\n**Discussion:** How did it feel to share? How did it feel to receive?' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**"I Can Share" Fish Craft:**\n- Cut fish shape from paper plate\n- Decorate with scales (small paper circles)\n- Write "Jesus Multiplies What I Share"\n- Add googly eyes and fins' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nThis week, look for one way to share something with someone else!\n\n**Closing Prayer:**\n"Jesus, thank You for showing us that small things matter to You. Help us share what we have and trust You to do big things. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Snack crackers', category: 'Activity' },
      { item: 'Paper plates', category: 'Craft' },
      { item: 'Colored paper circles', category: 'Craft' },
      { item: 'Googly eyes', category: 'Craft' },
      { item: 'Markers', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Matthew 14:13-21', text: 'Matthew\'s account of the feeding' },
      { reference: 'Luke 6:38', text: 'Give and it will be given to you' },
      { reference: '2 Corinthians 9:6', text: 'Whoever sows generously will reap generously' },
    ],
    teacherNotes: [
      'This miracle appears in all four Gospels - it\'s important!',
      'Emphasize that the boy\'s willingness was key',
      'Connect to modern-day sharing: time, toys, talents',
    ],
  },
  {
    id: 'pentecost',
    title: 'Pentecost: The Holy Spirit Comes',
    passage: 'Acts 2:1-41',
    description: 'Experience the powerful day when the Holy Spirit came upon the believers and the church was born.',
    ageGroup: 'Pre-Teen (11-13)',
    duration: '50 minutes',
    theme: 'Holy Spirit & Power',
    category: 'new-testament',
    icon: Flame,
    popular: false,
    memoryVerse: { text: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses.', reference: 'Acts 1:8 (NIV)' },
    objectives: [
      'Understand who the Holy Spirit is and His role',
      'Learn about the birth of the Church',
      'Recognize how the Holy Spirit empowers believers today',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion Starter:**\nJesus promised His followers a special Helper. Who do you think He was talking about?\n\nToday we\'re learning about the day everything changed for the early believers!\n\n**Opening Prayer:**\n"Holy Spirit, help us understand who You are and how You want to work in our lives. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '12 minutes', content: '**Read Acts 2:1-41**\n\n**The Scene:**\n- 50 days after Jesus rose (Pentecost = "50th day")\n- Believers gathered together in one place\n- Suddenly: wind, fire, and speaking in languages!\n- Peter preached boldly\n- 3,000 people believed that day!\n\n**Note the signs:**\n- Sound like wind - God\'s breath/Spirit\n- Tongues of fire - God\'s presence and power\n- Different languages - Gospel for ALL people' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '12 minutes', content: '**Who is the Holy Spirit?**\n- Third person of the Trinity\n- Jesus called Him "the Helper" (John 14:26)\n- He lives IN believers\n\n**What does the Holy Spirit do?**\n1. **Convicts** us of sin\n2. **Comforts** us in hard times\n3. **Guides** us into truth\n4. **Empowers** us to share our faith\n5. **Produces fruit** in our lives (Galatians 5:22-23)\n\n**The Birthday of the Church:**\nPentecost marks when the Church began - not a building, but people filled with God\'s Spirit!' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Small Group Activity: "Spirit-Empowered Living"**\n\nDiscuss in groups:\n1. Before Pentecost, the disciples were scared and hiding. After, they were bold. What changed?\n2. How does the Holy Spirit help you today?\n3. What "fruit of the Spirit" do you want to grow in?\n\n**Share:** One insight from each group' },
      { title: 'Reflection', icon: '💬', type: 'discussion', duration: '6 minutes', content: '**Personal Application:**\n\n- Have you ever felt the Holy Spirit prompting you to do something?\n- Is there an area where you need the Holy Spirit\'s power?\n- How can you be more aware of the Spirit\'s work in your life?\n\n**Quiet Moment:**\nTake 2 minutes of silence to ask the Holy Spirit to fill you fresh today.' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Reminder:**\nThe same Spirit who empowered Peter is available to you!\n\n**Closing Prayer:**\n"Come, Holy Spirit. Fill us with Your power. Help us be bold witnesses for Jesus. Produce Your fruit in our lives. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Discussion question cards', category: 'Activity' },
      { item: 'Journals', category: 'Reflection' },
      { item: 'Pens', category: 'Reflection' },
    ],
    crossReferences: [
      { reference: 'John 14:15-17', text: 'Jesus promises the Spirit' },
      { reference: 'Galatians 5:22-23', text: 'Fruit of the Spirit' },
      { reference: 'Romans 8:26', text: 'The Spirit helps us pray' },
    ],
    teacherNotes: [
      'Pentecost can be confusing - focus on the main point: God\'s power for witness',
      'Pre-teens may have questions about speaking in tongues - handle sensitively',
      'Emphasize that ALL believers receive the Holy Spirit',
    ],
  },

  // CHARACTER THEMES
  {
    id: 'fruit-of-spirit',
    title: 'The Fruit of the Spirit: Growing Good Character',
    passage: 'Galatians 5:22-23',
    description: 'Explore the nine characteristics that grow in us when we follow Jesus and let the Holy Spirit work in our hearts.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Character & Growth',
    category: 'themes',
    icon: TreePine,
    popular: true,
    memoryVerse: { text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.', reference: 'Galatians 5:22-23 (NIV)' },
    objectives: [
      'Memorize the nine fruits of the Spirit',
      'Understand that these qualities come from the Holy Spirit',
      'Identify ways to practice each fruit in daily life',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Fruit Tasting Activity:**\nBring different fruits for children to taste (apple, grape, orange, etc.)\n\nAsk: "What makes fruit grow?" (sun, water, good soil)\n\nToday we\'re learning about a different kind of fruit - the kind that grows in our hearts!\n\n**Opening Prayer:**\n"Holy Spirit, help us grow good fruit in our lives. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '8 minutes', content: '**Read Galatians 5:22-23**\n\n**The Nine Fruits:**\n1. **Love** - caring for others\n2. **Joy** - deep happiness from God\n3. **Peace** - calm inside even when things are hard\n4. **Patience** - waiting without complaining\n5. **Kindness** - being nice to everyone\n6. **Goodness** - doing what\'s right\n7. **Faithfulness** - keeping promises\n8. **Gentleness** - being soft and careful\n9. **Self-control** - controlling our actions and words' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Important Points:**\n\n**This is FRUIT, not fruits**\n- It\'s one fruit with nine parts\n- They all grow together!\n\n**The Holy Spirit grows it in us**\n- We can\'t make this fruit on our own\n- We need to stay connected to Jesus (like a branch to a vine)\n\n**How does fruit grow?**\n- Reading the Bible (water)\n- Prayer (sunlight)\n- Obeying God (good soil)\n- Being with other Christians (support)\n\n**Ask:** Which fruit do you think you need to grow more?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Fruit of the Spirit Relay:**\n- Divide into teams\n- At each station, act out one fruit\n- Others guess which fruit it is\n- Examples:\n  - Love: give a hug\n  - Joy: big smile and jump\n  - Peace: sit calmly with eyes closed\n  - Patience: wait without fidgeting\n  - Kindness: help someone up\n  - Goodness: share something\n  - Faithfulness: stand firm\n  - Gentleness: pet a stuffed animal gently\n  - Self-control: freeze perfectly still' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Fruit Tree Craft:**\n- Draw or provide tree outline\n- Add 9 paper fruits to the tree\n- Write one fruit of the Spirit on each\n- Decorate with leaves and grass' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nPick ONE fruit to focus on growing this week. Tell a parent which one you chose!\n\n**Memory Verse Practice:**\nSay it together using hand motions for each fruit.\n\n**Closing Prayer:**\n"Holy Spirit, grow Your beautiful fruit in our hearts. Help us show love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Real fruit for tasting', category: 'Opening' },
      { item: 'Bible', category: 'Teaching' },
      { item: 'Tree outline printout', category: 'Craft' },
      { item: 'Paper fruit shapes', category: 'Craft' },
      { item: 'Markers/crayons', category: 'Craft' },
      { item: 'Glue', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'John 15:4-5', text: 'Remain in me and you will bear fruit' },
      { reference: 'Matthew 7:16-20', text: 'By their fruit you will know them' },
      { reference: 'Colossians 3:12-14', text: 'Clothe yourselves with compassion, kindness...' },
    ],
    teacherNotes: [
      'Create a song or rhyme to help memorize all nine fruits',
      'This is a great series topic - one fruit per week!',
      'Emphasize that we grow these WITH the Holy Spirit\'s help, not on our own',
    ],
  },
  {
    id: 'armor-of-god',
    title: 'The Armor of God: Standing Strong',
    passage: 'Ephesians 6:10-18',
    description: 'Learn about the spiritual armor God gives us to stand firm against temptation and the enemy\'s schemes.',
    ageGroup: 'Pre-Teen (11-13)',
    duration: '50 minutes',
    theme: 'Spiritual Warfare',
    category: 'themes',
    icon: Crown,
    popular: true,
    memoryVerse: { text: 'Put on the full armor of God, so that you can take your stand against the devil\'s schemes.', reference: 'Ephesians 6:11 (NIV)' },
    objectives: [
      'Identify and understand each piece of spiritual armor',
      'Recognize that spiritual battles are real',
      'Learn practical ways to "put on" the armor daily',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion:**\nIf you were going into a real battle, what would you need? (weapons, armor, training, allies)\n\nPaul tells us we\'re in a REAL battle - not against people, but against spiritual forces. And God gives us armor!\n\n**Opening Prayer:**\n"Lord, help us understand the battle we\'re in and how to stand strong with Your armor. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Read Ephesians 6:10-18**\n\n**The Armor Pieces:**\n1. Belt of Truth (v.14)\n2. Breastplate of Righteousness (v.14)\n3. Shoes of the Gospel of Peace (v.15)\n4. Shield of Faith (v.16)\n5. Helmet of Salvation (v.17)\n6. Sword of the Spirit (v.17)\n\n**Plus:** Prayer (v.18)\n\n**Note:** Paul wrote this from prison, probably looking at Roman soldiers!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '12 minutes', content: '**Each Piece Explained:**\n\n**Belt of Truth** - Living honestly, knowing God\'s truth\n*Application:* Don\'t believe lies about yourself or God\n\n**Breastplate of Righteousness** - Living right, protected heart\n*Application:* Make good choices, confess sin quickly\n\n**Shoes of Gospel of Peace** - Ready to share, standing firm\n*Application:* Know your faith, be ready to explain it\n\n**Shield of Faith** - Blocks enemy\'s attacks\n*Application:* Trust God when doubts come\n\n**Helmet of Salvation** - Protected mind, secure identity\n*Application:* Remember you belong to God\n\n**Sword of the Spirit (God\'s Word)** - Only offensive weapon!\n*Application:* Know Scripture to fight back (like Jesus in Matthew 4)' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Armor Up Challenge:**\n\nIn pairs, discuss how each armor piece helps in real situations:\n\n1. A friend shares gossip about someone (Belt of Truth)\n2. You\'re tempted to cheat on a test (Breastplate of Righteousness)\n3. Someone asks why you go to church (Shoes of Gospel)\n4. You\'re doubting God loves you (Shield of Faith)\n5. You feel worthless and alone (Helmet of Salvation)\n6. You\'re tempted to give up (Sword of the Spirit)\n\n**Share:** Which piece do you need most right now?' },
      { title: 'Application', icon: '💬', type: 'discussion', duration: '8 minutes', content: '**Daily "Armor Up" Routine:**\n\nCreate a morning prayer:\n\n"Lord, today I put on:\n- The BELT of truth - help me live honestly\n- The BREASTPLATE of righteousness - guard my heart\n- The SHOES of peace - make me ready to share\n- The SHIELD of faith - help me trust You\n- The HELMET of salvation - remind me I\'m Yours\n- The SWORD of the Spirit - Your Word is my weapon\n\nAnd I commit to PRAY throughout the day. Amen."' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nPray the "Armor Up" prayer every morning this week!\n\n**Closing Prayer:**\nPray through each piece of armor together, asking God to equip students for the battles they face.' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Armor visuals/pictures', category: 'Visual Aid' },
      { item: 'Scenario cards', category: 'Activity' },
      { item: 'Armor Up prayer cards', category: 'Take-home' },
    ],
    crossReferences: [
      { reference: 'Matthew 4:1-11', text: 'Jesus uses Scripture against Satan' },
      { reference: '1 Peter 5:8-9', text: 'Be alert, resist the devil' },
      { reference: '2 Corinthians 10:4', text: 'Our weapons are not worldly' },
    ],
    teacherNotes: [
      'Be age-appropriate when discussing spiritual warfare',
      'Focus on God\'s power, not fear of the enemy',
      'Make it practical - how does this apply to school, home, online?',
    ],
  },
  
  // NEW TEMPLATES
  {
    id: 'sermon-on-mount',
    title: 'Sermon on the Mount: Living God\'s Way',
    passage: 'Matthew 5-7',
    description: 'Jesus teaches His followers what it means to live as citizens of God\'s kingdom through the Beatitudes and practical wisdom.',
    ageGroup: 'Pre-Teen (11-13)',
    duration: '55 minutes',
    theme: 'Character & Growth',
    category: 'new-testament',
    icon: Mountain,
    popular: false,
    memoryVerse: { text: 'Blessed are the pure in heart, for they will see God.', reference: 'Matthew 5:8 (NIV)' },
    objectives: [
      'Understand the revolutionary nature of Jesus\' teaching',
      'Learn what it means to be "blessed" according to Jesus',
      'Apply the principles of kingdom living to daily life',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion Starter:**\nIf you could give advice to everyone in the world, what would you say?\n\nToday we\'re going to hear the most famous sermon ever preached - Jesus\' Sermon on the Mount!\n\n**Opening Prayer:**\n"Lord, open our hearts to Your teaching. Help us live as citizens of Your kingdom. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '12 minutes', content: '**Read Matthew 5:1-12 (The Beatitudes)**\n\nExplain each "blessed" statement:\n- Poor in spirit = humble, recognizing need for God\n- Mourn = grieving over sin and injustice\n- Meek = gentle strength, not weakness\n- Hunger for righteousness = desperately wanting to do right\n- Merciful = showing compassion to others\n- Pure in heart = undivided devotion to God\n- Peacemakers = actively creating peace\n- Persecuted = suffering for doing right' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '15 minutes', content: '**Key Themes from the Sermon:**\n\n1. **Salt and Light (5:13-16)**\n- We are meant to influence the world\n- Our good works point people to God\n\n2. **Heart over Actions (5:21-48)**\n- It\'s not just what we do, but what\'s in our hearts\n- Anger = murder, lust = adultery\n\n3. **Genuine Faith (6:1-18)**\n- Don\'t show off your religion\n- Pray, give, and fast sincerely\n\n4. **Trust God (6:25-34)**\n- Don\'t worry about tomorrow\n- Seek first God\'s kingdom' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Beatitude Application Challenge:**\n\nIn small groups, take one Beatitude and create:\n1. A modern example of that quality\n2. Someone famous/historical who showed it\n3. How a teen could live it out this week\n\n**Share:** Each group presents to the class' },
      { title: 'Reflection', icon: '💬', type: 'discussion', duration: '8 minutes', content: '**Personal Application:**\n\nWhich Beatitude do you find:\n- Easiest to live out?\n- Most challenging?\n- Most counter-cultural?\n\n**Journal Prompt:**\nWrite one way you will apply the Sermon on the Mount this week.' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nPick ONE teaching from the Sermon on the Mount to focus on this week.\n\n**Closing Prayer:**\n"Jesus, Your teaching challenges us to live differently. Help us be salt and light in our world. Give us pure hearts that seek Your kingdom first. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Beatitudes handout', category: 'Resource' },
      { item: 'Journals', category: 'Activity' },
      { item: 'Pens', category: 'Activity' },
    ],
    crossReferences: [
      { reference: 'Luke 6:20-49', text: 'Luke\'s version (Sermon on the Plain)' },
      { reference: 'James 1:22', text: 'Be doers of the Word' },
      { reference: 'Romans 12:1-2', text: 'Living sacrifices, transformed minds' },
    ],
    teacherNotes: [
      'This is a LOT of content - consider a multi-week series',
      'Pre-teens may struggle with concepts like "poor in spirit"',
      'Make it practical and relevant to their world',
    ],
  },
  {
    id: 'creation-story',
    title: 'Creation: God Made Everything!',
    passage: 'Genesis 1-2',
    description: 'Discover how God created the world in six days and rested on the seventh, showing His power, creativity, and love for us.',
    ageGroup: 'Preschool (3-5)',
    duration: '30 minutes',
    theme: 'God as Creator',
    category: 'old-testament',
    icon: Sunrise,
    popular: true,
    memoryVerse: { text: 'In the beginning God created the heavens and the earth.', reference: 'Genesis 1:1 (NIV)' },
    objectives: [
      'Learn that God created everything',
      'Understand the order of creation',
      'Thank God for His wonderful creation',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '4 minutes', content: '**Nature Exploration:**\nShow pictures of beautiful things in nature (flowers, animals, stars, ocean).\n\nAsk: "Who made all these beautiful things?"\n\nToday we\'re going to learn how God made EVERYTHING!\n\n**Opening Prayer:**\n"Thank You, God, for making such a beautiful world. Help us learn about Your creation. Amen."' },
      { title: 'Story Time', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Tell the Creation Story Simply:**\n\n**Day 1:** God said "Let there be light!" (turn on a flashlight)\n**Day 2:** God made the sky and clouds (wave blue scarves)\n**Day 3:** God made land and plants (show potted plant)\n**Day 4:** God made the sun, moon, and stars (show cutouts)\n**Day 5:** God made fish and birds (show toy fish and birds)\n**Day 6:** God made animals and people! (show animal toys)\n**Day 7:** God rested and said it was VERY GOOD!\n\nUse props and have children do actions for each day!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '5 minutes', content: '**Simple Points:**\n\n1. **God made EVERYTHING** - There\'s nothing in the world God didn\'t make!\n\n2. **God made it GOOD** - Everything God makes is wonderful\n\n3. **God made YOU** - You are special because God made you!\n\n**Ask:** What\'s your favorite thing God made?' },
      { title: 'Activity Time', icon: '🎮', type: 'activity', duration: '6 minutes', content: '**Creation Countdown Game:**\n\nCount down from 7 to 1:\n- 7: Rest pose (lie down quietly)\n- 6: Be animals (roar, hop, slither)\n- 5: Flap like birds, swim like fish\n- 4: Point to ceiling (stars)\n- 3: Touch the ground, pretend to plant\n- 2: Reach to the sky (clouds)\n- 1: Cover eyes, then open (light!)' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Creation Wheel Craft:**\n- Pre-made paper plate divided into 7 sections\n- Children color or glue images for each day\n- Attach a spinner arrow in the center\n- Spin and tell what God made on each day!' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Memory Verse Practice:**\nSay it with hand motions:\n- "In the beginning" (hold hands wide)\n- "God created" (point up)\n- "the heavens" (reach high)\n- "and the earth" (touch ground)\n\n**Closing Prayer:**\n"Thank You, God, for making the sun and moon, animals and flowers, and most of all, for making ME! Amen."' },
    ],
    materialsNeeded: [
      { item: 'Flashlight', category: 'Props' },
      { item: 'Blue scarves', category: 'Props' },
      { item: 'Potted plant', category: 'Props' },
      { item: 'Sun/moon/star cutouts', category: 'Props' },
      { item: 'Toy animals, fish, birds', category: 'Props' },
      { item: 'Paper plate wheels', category: 'Craft' },
      { item: 'Crayons', category: 'Craft' },
      { item: 'Spinner arrows and fasteners', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Psalm 19:1', text: 'The heavens declare God\'s glory' },
      { reference: 'Psalm 139:14', text: 'I am fearfully and wonderfully made' },
    ],
    teacherNotes: [
      'Use lots of visuals and movement for preschoolers',
      'Keep it simple - focus on "God made it"',
      'The craft can be prepared ahead of time',
    ],
  },
  {
    id: 'daniel-lions',
    title: 'Daniel in the Lions\' Den: Faith Under Pressure',
    passage: 'Daniel 6',
    description: 'Daniel stayed faithful to God even when it could cost him his life, and God protected him in the lions\' den.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Courage & Faith',
    category: 'old-testament',
    icon: Crown,
    popular: false,
    memoryVerse: { text: 'My God sent his angel, and he shut the mouths of the lions.', reference: 'Daniel 6:22 (NIV)' },
    objectives: [
      'Learn that Daniel prayed to God even when it was dangerous',
      'Understand that God protects those who trust Him',
      'Be encouraged to stay faithful even when it\'s hard',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion:**\nHave you ever had to do the right thing even when it was really hard?\n\nToday we\'ll meet someone who did the right thing even when it could have cost him his LIFE!\n\n**Opening Prayer:**\n"God, give us courage like Daniel to always do what\'s right. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Tell the Story Dramatically (Daniel 6)**\n\n**Setting:** Daniel was an important leader in Babylon\n**Problem:** Jealous officials tricked the king into making a law - no praying to anyone except the king for 30 days!\n**Daniel\'s Choice:** He kept praying to God three times a day, just like always\n**Consequence:** Daniel was thrown into the lions\' den!\n**Miracle:** God sent an angel to shut the lions\' mouths\n**Result:** Daniel was safe! The king praised God\n\nUse sound effects: lion roars, dramatic voices!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Lessons:**\n\n1. **Daniel had a habit of prayer**\n- He prayed 3 times EVERY day\n- Good habits helped him stay strong\n\n2. **Daniel didn\'t hide his faith**\n- He prayed openly even when dangerous\n- He trusted God more than he feared people\n\n3. **God protected Daniel**\n- God shut the lions\' mouths\n- God may not always save us the same way, but He is ALWAYS with us\n\n**Discussion:** What would you have done if you were Daniel?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**"Lions\' Den" Scenario Game:**\n\nRead scenarios and ask: "What would Daniel do?"\n\n1. Your friends make fun of you for praying before lunch\n2. Someone says Christians are weird\n3. You\'re invited to something that conflicts with church\n4. A classmate asks why you believe in God\n\n**Discuss:** How can we be brave like Daniel today?' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Daniel & Lions Paper Bag Puppet:**\n- Brown paper bag = lion\n- Add yarn mane, googly eyes, nose, mouth\n- Create a Daniel figure to go with it\n- Act out the story!' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Challenge:**\nPray to God every day this week, even if it feels hard or you\'re busy!\n\n**Closing Prayer:**\n"Lord, thank You for the example of Daniel. Help us be brave and faithful like him. When we\'re afraid, remind us that You are with us. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Brown paper bags', category: 'Craft' },
      { item: 'Yarn (various colors)', category: 'Craft' },
      { item: 'Googly eyes', category: 'Craft' },
      { item: 'Markers', category: 'Craft' },
      { item: 'Glue', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Psalm 91:11', text: 'God commands His angels to guard you' },
      { reference: 'Isaiah 41:10', text: 'Do not fear, I am with you' },
      { reference: 'Hebrews 11:33', text: 'By faith shut the mouths of lions' },
    ],
    teacherNotes: [
      'Emphasize that God was with Daniel, not that God always removes danger',
      'Help kids identify their own "lions\' den" moments',
      'The story can be intense - focus on God\'s faithfulness',
    ],
  },
  {
    id: 'jonah-whale',
    title: 'Jonah and the Big Fish: Running from God',
    passage: 'Jonah 1-4',
    description: 'Jonah tried to run from God\'s call, but learned that God\'s love extends to everyone - even people we don\'t like.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Obedience & Trust',
    category: 'old-testament',
    icon: Anchor,
    popular: false,
    memoryVerse: { text: 'Salvation comes from the Lord.', reference: 'Jonah 2:9 (NIV)' },
    objectives: [
      'Learn that we cannot run from God',
      'Understand that God loves ALL people',
      'Recognize the importance of obeying God\'s calling',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Opening Question:**\nHave you ever been asked to do something you REALLY didn\'t want to do?\n\nToday we\'ll learn about a prophet who tried to RUN AWAY from what God asked him to do!\n\n**Opening Prayer:**\n"God, help us learn from Jonah\'s mistakes and follow You wherever You lead. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '12 minutes', content: '**Tell the Story of Jonah:**\n\n**Chapter 1:** God tells Jonah to go to Nineveh. Jonah runs the opposite direction! Storm on the ship. Jonah thrown overboard. Big fish swallows him!\n\n**Chapter 2:** Jonah prays from inside the fish for 3 days. The fish spits him out.\n\n**Chapter 3:** Jonah FINALLY goes to Nineveh. The whole city repents! God forgives them.\n\n**Chapter 4:** Jonah is ANGRY that God forgave them. God teaches Jonah about His love for all people.\n\nUse dramatic voices and sound effects!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Lessons:**\n\n1. **You can\'t run from God**\n- Jonah tried to sail away, but God was there\n- God sees everything and is everywhere\n\n2. **God gives second chances**\n- Jonah disobeyed, but God used him anyway\n- The fish was discipline AND rescue!\n\n3. **God loves everyone**\n- Even people we don\'t like (Jonah hated Nineveh)\n- God wants ALL people to know Him\n\n**Discussion:** Why do you think Jonah didn\'t want to go to Nineveh?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '10 minutes', content: '**Jonah Action Story:**\nAct out the story with movements:\n- "Go to Nineveh" - point one direction\n- "Jonah ran" - run in place\n- "Storm!" - shake and sway\n- "Thrown overboard" - dramatic fall\n- "Inside the fish" - curl up small\n- "Prayed" - hands together\n- "Spit out" - jump up\n- "Went to Nineveh" - march forward\n- "City repented" - kneel down' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Jonah in the Whale Craft:**\n- Blue paper plate folded in half (whale)\n- Cut whale shape with open mouth\n- Create small Jonah figure from paper\n- Attach Jonah so he can go in and out of whale\'s mouth' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Discussion:**\nIs there anything God might be asking YOU to do that you\'ve been avoiding?\n\n**Closing Prayer:**\n"Lord, help us obey You right away. Remind us that Your plans are always good, even when they\'re hard. Help us love people the way You do. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Blue paper plates', category: 'Craft' },
      { item: 'Scissors', category: 'Craft' },
      { item: 'Googly eyes', category: 'Craft' },
      { item: 'Paper for Jonah figure', category: 'Craft' },
      { item: 'Brads/fasteners', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Psalm 139:7-10', text: 'Where can I go from Your Spirit?' },
      { reference: 'Matthew 12:40', text: 'Jesus compares Himself to Jonah' },
      { reference: '2 Peter 3:9', text: 'God wants all to come to repentance' },
    ],
    teacherNotes: [
      'Focus on God\'s mercy, not just the "whale" adventure',
      'Chapter 4 is often skipped - it\'s the point of the story!',
      'Help kids see modern parallels - people we don\'t want to love',
    ],
  },
  {
    id: 'ten-commandments',
    title: 'The Ten Commandments: God\'s Rules for Living',
    passage: 'Exodus 20:1-17',
    description: 'God gave Moses the Ten Commandments to show His people how to love Him and love others.',
    ageGroup: 'Elementary (6-10)',
    duration: '50 minutes',
    theme: 'Obedience & Trust',
    category: 'old-testament',
    icon: Crown,
    popular: true,
    memoryVerse: { text: 'Love the Lord your God with all your heart and love your neighbor as yourself.', reference: 'Mark 12:30-31 (NIV)' },
    objectives: [
      'Learn the Ten Commandments',
      'Understand why God gave us these rules',
      'See how Jesus summarized them as love for God and others',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Discussion:**\nWhy do we have rules? (At home, school, sports)\nAre rules good or bad?\n\nToday we\'ll learn about the most famous rules ever - rules God Himself gave!\n\n**Opening Prayer:**\n"God, thank You for loving us enough to show us how to live. Help us learn Your commandments. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '12 minutes', content: '**Read/Teach the Ten Commandments (Exodus 20:1-17)**\n\n**Commands about God (1-4):**\n1. No other gods before Me\n2. No idols\n3. Don\'t misuse God\'s name\n4. Remember the Sabbath\n\n**Commands about Others (5-10):**\n5. Honor your parents\n6. Don\'t murder\n7. Don\'t commit adultery (be faithful)\n8. Don\'t steal\n9. Don\'t lie\n10. Don\'t covet (be jealous)\n\nUse kid-friendly language for each!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '12 minutes', content: '**Key Points:**\n\n1. **God gave rules because He LOVES us**\n- Like a parent\'s rules protect us\n- They show us the best way to live\n\n2. **Two Main Ideas: Love God, Love Others**\n- Commandments 1-4 = How to love God\n- Commandments 5-10 = How to love people\n- Jesus said this in Mark 12:30-31!\n\n3. **Nobody keeps them perfectly**\n- That\'s why we need Jesus!\n- He kept them perfectly for us\n\n**Ask:** Which commandment do you think is hardest to keep?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**Ten Commandments Relay:**\n\n- Divide into teams\n- Each station has a commandment scenario\n- Teams must identify which commandment applies\n\n**Scenarios:**\n1. Taking a toy without asking (#8 - stealing)\n2. Saying "God" as a swear word (#3 - name)\n3. Telling a lie about a friend (#9 - lying)\n4. Wanting what someone else has (#10 - coveting)\n5. Not listening to parents (#5 - honor parents)' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Stone Tablet Craft:**\n- Gray construction paper cut into tablet shapes\n- Write abbreviated commandments\n- Or: Number 1-10 on two "tablets"\n- Decorate edges to look like stone' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Summary:**\nAll the commandments can be summed up in two words: LOVE GOD and LOVE OTHERS!\n\n**Challenge:**\nPick one commandment to focus on obeying this week.\n\n**Closing Prayer:**\n"Thank You, God, for giving us rules that help us live well. Forgive us when we fail. Help us love You and love others. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Commandments poster', category: 'Visual Aid' },
      { item: 'Scenario cards', category: 'Activity' },
      { item: 'Gray construction paper', category: 'Craft' },
      { item: 'Markers', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Mark 12:30-31', text: 'Jesus\' summary of the Law' },
      { reference: 'Romans 3:23', text: 'All have sinned and fall short' },
      { reference: 'Galatians 3:24', text: 'The law leads us to Christ' },
    ],
    teacherNotes: [
      'Focus on the heart behind the rules, not just rule-following',
      'Be sensitive with #6 and #7 - use age-appropriate language',
      'Emphasize that Jesus fulfilled the law for us',
    ],
  },
  {
    id: 'jesus-walks-water',
    title: 'Jesus Walks on Water: Keeping Eyes on Jesus',
    passage: 'Matthew 14:22-33',
    description: 'When the disciples were terrified in a storm, Jesus came to them walking on water and taught Peter an important lesson about faith.',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    theme: 'Courage & Faith',
    category: 'new-testament',
    icon: Anchor,
    popular: false,
    memoryVerse: { text: 'Take courage! It is I. Don\'t be afraid.', reference: 'Matthew 14:27 (NIV)' },
    objectives: [
      'Learn that Jesus has power over nature',
      'Understand the importance of keeping our eyes on Jesus',
      'Trust Jesus when we feel afraid',
    ],
    sections: [
      { title: 'Opening & Welcome', icon: '👋', type: 'opening', duration: '5 minutes', content: '**Fear Discussion:**\nWhat are some things that make you afraid? (Dark, storms, heights, etc.)\n\nToday we\'ll see how Jesus helped His disciples when they were REALLY scared!\n\n**Opening Prayer:**\n"Jesus, when we feel afraid, help us trust You. Amen."' },
      { title: 'Scripture Reading', icon: '📖', type: 'scripture', duration: '10 minutes', content: '**Tell Matthew 14:22-33 Dramatically:**\n\n- Jesus sends disciples across the lake\n- A big storm comes at night\n- Disciples are terrified!\n- They see someone walking on the water\n- "It\'s a ghost!" they scream\n- Jesus: "Take courage! It is I!"\n- Peter: "Lord, if it\'s You, tell me to come"\n- Jesus: "Come"\n- Peter walks on water!\n- Peter looks at the waves... and sinks!\n- Jesus catches him\n- Storm stops\n\nUse sound effects and dramatic pauses!' },
      { title: 'Teaching Time', icon: '🎓', type: 'teaching', duration: '10 minutes', content: '**Key Lessons:**\n\n1. **Jesus has power over EVERYTHING**\n- He walked on water!\n- He calmed the storm\n- Nothing is impossible for Him\n\n2. **Peter stepped out in faith**\n- He asked to come to Jesus\n- He actually walked on water too!\n- Faith means trusting Jesus to do impossible things\n\n3. **Eyes on Jesus = standing firm**\n- When Peter looked at Jesus, he walked\n- When he looked at the waves, he sank\n- Keep your focus on Jesus!\n\n**Ask:** What "waves" might distract us from trusting Jesus?' },
      { title: 'Interactive Activity', icon: '🎮', type: 'activity', duration: '12 minutes', content: '**"Keep Your Eyes on Jesus" Game:**\n\n- One person is "Jesus" at one end of room\n- Others are "Peter" at the other end\n- "Peter" must walk toward "Jesus" keeping eye contact\n- Distractions (gentle waving arms, sounds) try to break focus\n- If Peter looks away, they must freeze\n\n**Debrief:** What helped you stay focused? What distracted you?' },
      { title: 'Craft Time', icon: '🎨', type: 'craft', duration: '8 minutes', content: '**Storm Jar/Ocean Bottle:**\n- Clear plastic bottle\n- Fill 1/3 with water + blue food coloring\n- Add 1/3 vegetable oil\n- Add glitter, small boat cutout\n- Seal tightly\n- Shake for "storm" - watch it calm down!' },
      { title: 'Closing & Prayer', icon: '🙏', type: 'closing', duration: '5 minutes', content: '**Remember:**\nWhen you feel scared or overwhelmed, remember Jesus is more powerful than any storm!\n\n**Closing Prayer:**\n"Jesus, thank You that You have power over everything. When we feel like we\'re sinking, help us reach for Your hand. Keep our eyes on You. Amen."' },
    ],
    materialsNeeded: [
      { item: 'Bible', category: 'Teaching' },
      { item: 'Clear plastic bottles', category: 'Craft' },
      { item: 'Blue food coloring', category: 'Craft' },
      { item: 'Vegetable oil', category: 'Craft' },
      { item: 'Glitter', category: 'Craft' },
      { item: 'Small boat cutouts (laminated)', category: 'Craft' },
    ],
    crossReferences: [
      { reference: 'Mark 6:45-52', text: 'Mark\'s account of walking on water' },
      { reference: 'Hebrews 12:2', text: 'Fix our eyes on Jesus' },
      { reference: 'Isaiah 43:2', text: 'When you pass through waters, I will be with you' },
    ],
    teacherNotes: [
      'Don\'t be too hard on Peter - he at least got out of the boat!',
      'Help kids identify their own "waves" (fears, distractions)',
      'The storm bottle is a great take-home reminder',
    ],
  },
]

function TemplatesPage() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { t } = useI18n()
  const isOnline = useOnlineStatus()
  const { saveForLater, templates: pendingTemplates, hasPendingTemplates } = usePendingTemplates()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all')
  const [previewTemplate, setPreviewTemplate] = useState<LessonTemplate | null>(null)

  // SEO optimization
  useSEO({
    title: 'Free Sunday School Lesson Templates | Bible Lesson Planner',
    description: 'Browse 50+ free Sunday school lesson templates. Christmas, Easter, Parables, Old Testament heroes & more. Ready-to-use lessons for Preschool through Adult.',
    keywords: 'Sunday school templates, free Bible lessons, children\'s church curriculum, VBS lessons, youth group Bible study templates, printable Bible lessons',
  })

  useEffect(() => {
    trackPageView('/templates', 'Lesson Templates')
  }, [])

  // Filter templates
  const filteredTemplates = LESSON_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.passage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.theme.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    
    const matchesAgeGroup = selectedAgeGroup === 'all' || 
      (selectedAgeGroup === 'preschool' && template.ageGroup.includes('Preschool')) ||
      (selectedAgeGroup === 'elementary' && template.ageGroup.includes('Elementary')) ||
      (selectedAgeGroup === 'preteen' && template.ageGroup.includes('Pre-Teen'))
    
    return matchesSearch && matchesCategory && matchesAgeGroup
  })

  // Apply template - creates a new lesson from template
  const applyTemplate = (template: LessonTemplate) => {
    const newLesson: LessonData = {
      id: `lesson-${Date.now()}`,
      title: template.title,
      passage: template.passage,
      description: template.description,
      ageGroup: template.ageGroup,
      duration: template.duration,
      theme: template.theme,
      format: 'Interactive',
      gradient: pickGradient(Math.floor(Math.random() * GRADIENTS.length)),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      favorite: false,
      memoryVerse: template.memoryVerse,
      objectives: template.objectives,
      sections: template.sections,
      materialsNeeded: template.materialsNeeded,
      crossReferences: template.crossReferences,
      teacherNotes: template.teacherNotes,
      parentTakeHome: {
        summary: template.description,
        memoryVerse: `${template.memoryVerse.text} - ${template.memoryVerse.reference}`,
        discussionStarters: template.objectives.map(obj => 
          `How can we ${obj.toLowerCase()}?`
        ),
        familyActivity: 'Review the lesson together and discuss how to apply it this week.',
        weeklyChallenge: 'Practice the memory verse together each day.'
      }
    }
    
    lessonStore.add(newLesson)
    navigate({ to: '/lesson/$lessonId', params: { lessonId: newLesson.id } })
  }

  // Save template for later (offline mode)
  const handleSaveForLater = async (template: LessonTemplate) => {
    if (!session) {
      toast.error(t('auth.signInRequired'))
      return
    }
    
    const result = await saveForLater({
      templateId: template.id,
      templateTitle: template.title,
      passage: template.passage,
      ageGroup: template.ageGroup,
      duration: template.duration,
      theme: template.theme,
      description: template.description,
      templateData: template,
    })
    
    if (result) {
      toast.success(t('templates.templateSaved'))
    }
  }

  const popularTemplates = LESSON_TEMPLATES.filter(t => t.popular)

  return (
    <div className="min-h-screen bg-[#F9F7F1] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Offline Banner */}
        {!isOnline && session && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">{t('offline.offline')}</h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  {t('templates.offlineBanner')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Pending Templates Banner */}
        {isOnline && hasPendingTemplates && (
          <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                    {t('templates.pendingBanner')}
                  </h3>
                </div>
              </div>
              <Link
                to="/settings"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {t('offline.savedTemplates')}
              </Link>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 dark:text-stone-50 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
            {t('templates.title')}
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 max-w-2xl mx-auto">
            {t('templates.subtitle')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder={t('templates.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-2xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-base shadow-sm"
              data-testid="template-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category Filter */}
          <div className="flex-1 bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-4">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const translatedName = t(cat.nameKey)
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700'
                        : 'text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-amber-400'
                    }`}
                    data-testid={`category-${cat.id}`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="hidden sm:inline">{translatedName}</span>
                    <span className="sm:hidden">{translatedName.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Age Group Filter */}
          <div className="sm:w-72 bg-white dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700 p-4">
            <h3 className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" /> {t('lessons.ageGroups')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {AGE_GROUPS.map(age => (
                <button
                  key={age.id}
                  onClick={() => setSelectedAgeGroup(age.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAgeGroup === age.id
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
                      : 'text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:border-emerald-400'
                  }`}
                  data-testid={`age-${age.id}`}
                >
                  {t(age.nameKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Templates Section */}
        {selectedCategory === 'all' && selectedAgeGroup === 'all' && !searchQuery && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" fill="currentColor" strokeWidth={1.5} />
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100" style={{ fontFamily: 'Crimson Text, serif' }}>
                {t('templates.popular')}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularTemplates.slice(0, 3).map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onUse={() => applyTemplate(template)}
                  onPreview={() => setPreviewTemplate(template)}
                  onSaveForLater={() => handleSaveForLater(template)}
                  isOnline={isOnline}
                  isLoggedIn={!!session}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-base text-stone-500 dark:text-stone-400">
            {filteredTemplates.length} {filteredTemplates.length !== 1 ? 'templates' : 'template'}
          </p>
          {(selectedCategory !== 'all' || selectedAgeGroup !== 'all' || searchQuery) && (
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedAgeGroup('all'); setSearchQuery('') }}
              className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> {t('common.cancel')}
            </button>
          )}
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-stone-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50 mb-2">{t('templates.noTemplatesFound')}</h3>
            <p className="text-base text-stone-500 dark:text-stone-400 mb-6">
              {t('templates.noTemplatesDesc')}
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSelectedAgeGroup('all'); setSearchQuery('') }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              {t('templates.allTemplates')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <TemplateCard 
                key={template.id} 
                template={template} 
                onUse={() => applyTemplate(template)}
                onPreview={() => setPreviewTemplate(template)}
                onSaveForLater={() => handleSaveForLater(template)}
                isOnline={isOnline}
                isLoggedIn={!!session}
                t={t}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 p-8">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-3" style={{ fontFamily: 'Crimson Text, serif' }}>
              {t('templates.cantFindTitle')}
            </h2>
            <p className="text-base text-stone-600 dark:text-stone-400 mb-6 max-w-lg mx-auto">
              {t('templates.cantFindDesc')}
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              {t('templates.createCustom')}
            </Link>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal 
          template={previewTemplate} 
          onClose={() => setPreviewTemplate(null)}
          onUse={() => { applyTemplate(previewTemplate); setPreviewTemplate(null) }}
          t={t}
        />
      )}
    </div>
  )
}

// Template Card Component
function TemplateCard({ 
  template, 
  onUse, 
  onPreview,
  onSaveForLater,
  isOnline,
  isLoggedIn,
  t
}: { 
  template: LessonTemplate
  onUse: () => void
  onPreview: () => void
  onSaveForLater: () => void
  isOnline: boolean
  isLoggedIn: boolean
  t: (key: string) => string
}) {
  const Icon = template.icon
  const { title, description, ageGroup, duration, theme } = template

  return (
    <div className="group bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-amber-400/50 transition-all duration-300 overflow-hidden" data-testid={`template-card-${template.id}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
          </div>
          {template.popular && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Star className="w-3 h-3" fill="currentColor" /> {t('templates.popular')}
            </span>
          )}
        </div>

        {/* Title & Passage */}
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 leading-tight mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-500 transition-colors" style={{ fontFamily: 'Crimson Text, serif' }}>
          {title}
        </h3>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-500 mb-3 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" strokeWidth={1.5} /> {template.passage}
        </p>

        {/* Description */}
        <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed mb-4">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-1">
            <Users className="w-3 h-3" strokeWidth={1.5} /> {ageGroup.split(' ')[0]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} /> {duration}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1">
            <Heart className="w-3 h-3" strokeWidth={1.5} /> {theme.split(' ')[0]}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-stone-100 dark:border-stone-700">
          <button
            onClick={onPreview}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-lg text-sm font-medium hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
            data-testid={`preview-${template.id}`}
          >
            <Eye className="w-4 h-4" strokeWidth={1.5} /> {t('templates.preview')}
          </button>
          {!isOnline && isLoggedIn ? (
            <button
              onClick={onSaveForLater}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
              data-testid={`save-later-${template.id}`}
            >
              <Download className="w-4 h-4" strokeWidth={1.5} /> {t('templates.saveForLater')}
            </button>
          ) : (
            <button
              onClick={onUse}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all"
              data-testid={`use-${template.id}`}
            >
              <Copy className="w-4 h-4" strokeWidth={1.5} /> {t('templates.useTemplate')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Template Preview Modal
function TemplatePreviewModal({ 
  template, 
  onClose, 
  onUse,
  t
}: { 
  template: LessonTemplate
  onClose: () => void
  onUse: () => void
  t: (key: string) => string
}) {
  const { title, description, ageGroup, duration, theme, memoryVerse, objectives, sections, materialsNeeded } = template

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-700 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2" style={{ fontFamily: 'Crimson Text, serif' }}>
              {title}
            </h2>
            <p className="text-base font-medium text-amber-700 dark:text-amber-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" strokeWidth={1.5} /> {template.passage}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Users className="w-4 h-4" strokeWidth={1.5} /> {ageGroup}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" strokeWidth={1.5} /> {duration}
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <Heart className="w-4 h-4" strokeWidth={1.5} /> {theme}
            </span>
          </div>

          {/* Description */}
          <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed mb-6">
            {description}
          </p>

          {/* Memory Verse */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl p-4 mb-6 border border-amber-200/60 dark:border-amber-800/40">
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">{t('lessonView.memoryVerse')}</h4>
            <p className="text-lg italic text-stone-800 dark:text-stone-200 mb-1">"{memoryVerse.text}"</p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-500">— {memoryVerse.reference}</p>
          </div>

          {/* Objectives */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3">{t('lessonView.objectives')}</h4>
            <ul className="space-y-2">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">{i + 1}</span>
                  {obj}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections Preview */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3">{t('lessonView.lessonFlow')}</h4>
            <div className="space-y-2">
              {sections.map((section, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                  <span className="text-lg">{section.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{section.title}</p>
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400">{section.duration}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-3">{t('lessonView.materials')}</h4>
            <div className="flex flex-wrap gap-2">
              {materialsNeeded.map((material, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  {material.item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-stone-200 dark:border-stone-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onUse}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
          >
            <Copy className="w-4 h-4" strokeWidth={1.5} /> {t('templates.useTemplate')}
          </button>
        </div>
      </div>
    </div>
  )
}
