// Lesson data types shared across the app
export interface LessonSection {
  title: string
  duration: string
  icon: string
  type: string
  content: string
}

export interface LessonMaterial {
  item: string
  category: string
}

export interface CrossReference {
  reference: string
  text: string
}

export interface ParentTakeHome {
  summary: string
  memoryVerse: string
  discussionStarters: string[]
  familyActivity: string
  weeklyChallenge: string
}

export interface LessonData {
  id: string
  title: string
  passage: string
  ageGroup: string
  duration: string
  format: string
  theme: string
  createdAt: string
  memoryVerse: {
    text: string
    reference: string
  }
  objectives: string[]
  materialsNeeded: LessonMaterial[]
  sections: LessonSection[]
  parentTakeHome: ParentTakeHome
  crossReferences: CrossReference[]
  teacherNotes: string[]
  favorite: boolean
  gradient: string
  description: string
}

export interface LessonConfig {
  scripture: {
    book: string
    chapter: string
    verse: string
    topic: string
    theme: string
  }
  audience: {
    ageGroup: string
    duration: string
    format: string
  }
  customize: {
    activities: boolean
    crafts: boolean
    memoryVerse: boolean
    discussion: boolean
    prayer: boolean
    parentTakeHome: boolean
  }
}

// Gradient palette for lessons
export const GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-violet-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-blue-600',
  'from-slate-500 to-gray-600',
  'from-lime-500 to-green-600',
]

export function pickGradient(index: number): string {
  return GRADIENTS[index % GRADIENTS.length]
}

// Generate a demo lesson from config
export function generateDemoLesson(config: LessonConfig): LessonData {
  const passage = config.scripture.book
    ? `${config.scripture.book}${config.scripture.chapter ? ` ${config.scripture.chapter}` : ''}${config.scripture.verse ? `:${config.scripture.verse}` : ''}`
    : 'Selected Passage'

  const topic = config.scripture.topic || config.scripture.theme || 'God\'s Love'
  const ageGroup = config.audience.ageGroup || 'Elementary (6-10)'
  const duration = config.audience.duration || '45 min'
  const format = config.audience.format || 'Interactive'
  const id = `lesson-${Date.now()}`

  const sections: LessonSection[] = []

  // Always include opening and closing
  sections.push({
    title: 'Opening & Welcome',
    duration: '5 minutes',
    icon: '👋',
    type: 'opening',
    content: `Welcome everyone warmly as they arrive. Begin with a brief opening prayer:\n\n**Prayer:** "Dear God, thank You for bringing us together today. Open our hearts and minds to learn from Your Word. Help us understand Your truth and apply it to our lives. In Jesus' name, Amen."\n\n**Icebreaker Question:** "Can anyone share a time when you experienced ${topic.toLowerCase()} in your own life?"\n\nAllow 2-3 people to share briefly. Affirm their responses and transition into the lesson by saying: "Today we're going to explore what the Bible teaches us about ${topic.toLowerCase()} through ${passage}."`,
  })

  sections.push({
    title: 'Scripture Reading',
    duration: '10 minutes',
    icon: '📖',
    type: 'scripture',
    content: `Read ${passage} aloud, or have confident readers take turns reading verses.\n\n**Context for Teachers:** This passage speaks powerfully about ${topic.toLowerCase()}. Take time to set the historical and cultural context so your class can fully appreciate the depth of this Scripture.\n\n**Key Points to Emphasize:**\n- Pay attention to the main characters and their actions\n- Notice the setting and circumstances described\n- Look for the central message God is communicating\n- Consider how the original audience would have received this teaching\n\n**Discussion Pause:** After reading, ask: "What stood out to you most in this passage? Why?"`,
  })

  sections.push({
    title: 'Teaching Time',
    duration: '10 minutes',
    icon: '🎓',
    type: 'teaching',
    content: `**Main Teaching Points:**\n\n**1. Understanding the Context**\nHelp your class understand the background of ${passage}. Who wrote it? Who was the audience? What was happening at that time? This context enriches our understanding of ${topic.toLowerCase()}.\n\n**2. The Core Message**\nThe heart of this passage teaches us about ${topic.toLowerCase()}. God wants us to understand that His truth applies to every area of our lives. Walk through the key verses and explain their meaning.\n\n**3. Application for Today**\nThis isn't just an ancient text — it's living and active. Help your class see how ${topic.toLowerCase()} applies to their daily lives, relationships, and decisions.\n\n**Visual Aid:** Create a simple diagram or chart on the whiteboard showing the main concepts and how they connect to everyday life.\n\nAsk: "How does understanding ${topic.toLowerCase()} change the way we live?"`,
  })

  if (config.customize.activities) {
    sections.push({
      title: 'Interactive Activity',
      duration: '10 minutes',
      icon: '🎮',
      type: 'activity',
      content: `**Activity: "${topic} in Action"**\n\nDivide into small groups. Give each group a scenario card and ask them to discuss and act out how they would apply ${topic.toLowerCase()} in that situation:\n\n**Scenario 1:** A friend at school/work is going through a difficult time and feels alone.\n**Scenario 2:** You witness someone being treated unfairly in your community.\n**Scenario 3:** A family member makes a decision you disagree with.\n**Scenario 4:** You have an opportunity to help someone but it will cost you time and effort.\n**Scenario 5:** Someone asks you to explain what ${topic.toLowerCase()} means to you.\n\nAfter each group presents, discuss:\n- "What made this situation challenging?"\n- "How does Scripture guide our response?"\n- "What would it look like to live this out consistently?"`,
    })
  }

  if (config.customize.crafts) {
    sections.push({
      title: 'Craft Time',
      duration: '8 minutes',
      icon: '🎨',
      type: 'craft',
      content: `**Craft: "${topic} Reminder"**\n\n**Instructions:**\n1. Give each person the craft supplies\n2. Create a visual reminder of today's lesson about ${topic.toLowerCase()}\n3. Include the memory verse on the craft\n4. Decorate with colors and designs that represent the theme\n5. Add personal reflections or commitments\n\n**While crafting, discuss:**\n- "What is one thing you want to remember from today's lesson?"\n- "How will you apply ${topic.toLowerCase()} this week?"\n\nEncourage everyone to display their craft at home as a daily reminder of what they learned.`,
    })
  }

  if (config.customize.discussion) {
    sections.push({
      title: 'Discussion Questions',
      duration: '5 minutes',
      icon: '💬',
      type: 'discussion',
      content: `Lead a group discussion with these questions:\n\n1. **What does ${passage} teach us about ${topic.toLowerCase()}?**\n   *(Guide the group to identify the key principles from the text)*\n\n2. **Why is ${topic.toLowerCase()} important in our relationship with God?**\n   *(Help them see the spiritual significance)*\n\n3. **Can you think of a time when you saw ${topic.toLowerCase()} demonstrated in real life?**\n   *(Personal sharing — affirm all responses)*\n\n4. **What is one specific way you can practice ${topic.toLowerCase()} this week?**\n   *(Encourage specific, actionable commitments)*\n\n5. **How does living out ${topic.toLowerCase()} impact those around us?**\n   *(Help them see the ripple effect of faithful living)*`,
    })
  }

  sections.push({
    title: 'Closing & Prayer',
    duration: '5 minutes',
    icon: '🙏',
    type: 'closing',
    content: `**Memory Verse Review:**\nSay the memory verse together three times. Use creative methods to help memorize it:\n- Say it with motions\n- Whisper it, then say it loudly\n- Take turns saying one word at a time\n\n**Closing Prayer:**\n"Dear God, thank You for teaching us about ${topic.toLowerCase()} through Your Word today. Help us to not just be hearers of Your Word, but doers. Give us the courage and wisdom to live out what we've learned. Transform our hearts and minds as we seek to follow You more closely. In Jesus' name, Amen."\n\n**Take-Home Challenge:**\nChallenge everyone to practice one specific act related to ${topic.toLowerCase()} this week and share their experience next time we meet.`,
  })

  const totalMinutes = sections.reduce((sum, s) => sum + parseInt(s.duration), 0)

  return {
    id,
    title: `${config.scripture.book || topic}: ${topic}`,
    passage,
    ageGroup,
    duration: `${totalMinutes} minutes`,
    format,
    theme: topic,
    createdAt: 'Just now',
    memoryVerse: {
      text: `"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."`,
      reference: 'John 3:16 (NIV)',
    },
    objectives: [
      `Understand what ${passage} teaches about ${topic.toLowerCase()}`,
      `Learn how ${topic.toLowerCase()} applies to daily life`,
      `Identify practical ways to live out ${topic.toLowerCase()}`,
      `Grow in faith through studying God's Word together`,
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Whiteboard and markers', category: 'essential' },
      { item: 'Printed handout of the passage', category: 'essential' },
      ...(config.customize.crafts ? [
        { item: 'Construction paper, crayons, and glue sticks', category: 'craft' },
        { item: 'Decorative stickers and markers', category: 'craft' },
      ] : []),
      ...(config.customize.activities ? [
        { item: 'Scenario cards (printed or handwritten)', category: 'activity' },
        { item: 'Props for role-play activities', category: 'activity' },
      ] : []),
      { item: 'Coloring sheets related to the passage', category: 'optional' },
    ],
    sections,
    parentTakeHome: {
      summary: `Today we studied ${passage} and learned about ${topic.toLowerCase()}. The class discovered how God's Word speaks directly to our lives and how we can apply these truths daily.`,
      memoryVerse: '"For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." — John 3:16',
      discussionStarters: [
        `Ask about what they learned from ${passage} today.`,
        `Talk about a time when your family experienced ${topic.toLowerCase()}.`,
        `Brainstorm together: How can your family practice ${topic.toLowerCase()} this week?`,
        `Read the passage together (${passage}) and discuss what stands out.`,
      ],
      familyActivity: `As a family, choose one way to practice ${topic.toLowerCase()} together this week. It could be serving someone in your community, having a meaningful conversation, or doing a related Bible study together.`,
      weeklyChallenge: `Each family member picks one way to practice ${topic.toLowerCase()} this week. Share your experiences at dinner on Friday!`,
    },
    crossReferences: [
      { reference: 'Romans 8:28', text: 'God works all things together for good' },
      { reference: 'Philippians 4:13', text: 'I can do all things through Christ who strengthens me' },
      { reference: 'Jeremiah 29:11', text: 'God has plans to prosper you and give you hope' },
      { reference: 'Psalm 119:105', text: 'Your word is a lamp to my feet and a light to my path' },
      { reference: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart' },
    ],
    teacherNotes: [
      'Be sensitive to different experience levels with Scripture in your group',
      'If time is short, the craft can be simplified or sent home as a take-home activity',
      `Adapt the scenarios to be age-appropriate for ${ageGroup}`,
      'Consider pairing experienced members with newer ones during group activities',
    ],
    favorite: false,
    gradient: pickGradient(Math.floor(Math.random() * GRADIENTS.length)),
    description: `A ${format.toLowerCase()} lesson exploring ${topic.toLowerCase()} through ${passage} for ${ageGroup}.`,
  }
}

// Sample lessons for the library (used when user has no saved lessons)
export const SAMPLE_LESSONS: LessonData[] = [
  {
    id: 'demo-lesson',
    title: 'The Good Samaritan: Loving Your Neighbor',
    passage: 'Luke 10:25-37',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    format: 'Interactive',
    theme: 'Compassion & Kindness',
    createdAt: '2 days ago',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Explore Jesus\' parable about loving your neighbor through interactive activities, crafts, and discussion.',
    favorite: true,
    memoryVerse: {
      text: '"Love your neighbor as yourself."',
      reference: 'Mark 12:31 (NIV)',
    },
    objectives: [
      'Understand the story of the Good Samaritan and its context',
      'Learn what it means to be a "neighbor" in God\'s eyes',
      'Identify ways to show compassion and kindness to others',
      'Recognize that God calls us to help everyone, not just people like us',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Whiteboard and markers', category: 'essential' },
      { item: 'Construction paper, crayons, and glue sticks', category: 'craft' },
      { item: 'Bandages and first aid supplies (for demonstration)', category: 'activity' },
      { item: 'Printed handout of the story', category: 'essential' },
      { item: 'Small heart stickers', category: 'craft' },
      { item: 'Scenario cards (printed or handwritten)', category: 'activity' },
      { item: 'Coloring sheets of the Good Samaritan', category: 'optional' },
    ],
    sections: [
      {
        title: 'Opening & Welcome',
        duration: '5 minutes',
        icon: '👋',
        type: 'opening',
        content: 'Welcome the children warmly as they arrive. Begin with a brief opening prayer:\n\n**Prayer:** "Dear God, thank You for bringing us together today. Open our hearts and minds to learn from Your Word. Help us understand how to love others the way You love us. In Jesus\' name, Amen."\n\n**Icebreaker Question:** "Has anyone ever helped you when you were hurt or needed something? How did that make you feel?"\n\nAllow 2-3 children to share briefly. Affirm their responses and transition into the lesson by saying: "Today we\'re going to hear an amazing story Jesus told about someone who helped a stranger in need."',
      },
      {
        title: 'Scripture Reading',
        duration: '10 minutes',
        icon: '📖',
        type: 'scripture',
        content: 'Read Luke 10:25-37 aloud, or have confident readers take turns reading verses.\n\n**Context for Teachers:** A lawyer asked Jesus, "Who is my neighbor?" Jesus responded with this parable. In Jesus\' time, Jews and Samaritans did not get along — they avoided each other. This makes the Samaritan\'s kindness even more remarkable.\n\n**Key Points to Emphasize:**\n- The priest and Levite were religious leaders who "passed by on the other side"\n- The Samaritan was someone the audience would not expect to help\n- The Samaritan didn\'t just feel sorry — he took action\n- He bandaged wounds, carried the man, paid for his care, and promised to return\n\n**Discussion Pause:** After reading, ask: "Why do you think the priest and the Levite didn\'t stop to help?"',
      },
      {
        title: 'Teaching Time',
        duration: '10 minutes',
        icon: '🎓',
        type: 'teaching',
        content: '**Main Teaching Points:**\n\n**1. Everyone Is Our Neighbor**\nJesus taught that our "neighbor" isn\'t just the person who lives next door or looks like us. Our neighbor is anyone who needs help — even people who are different from us.\n\n**2. Love Requires Action**\nThe Good Samaritan didn\'t just feel bad for the hurt man. He stopped, helped, and sacrificed his own time and money. Real love means doing something, not just feeling something.\n\n**3. God Wants Us to Be Like the Samaritan**\nJesus ended the story by saying, "Go and do likewise." He wants us to be the kind of people who stop and help others.\n\n**Visual Aid:** Draw three responses on the whiteboard:\n- 😐 "I see you" (walked past)\n- 😢 "I feel bad for you" (felt sorry but didn\'t act)\n- ❤️ "I will help you" (the Samaritan\'s response)\n\nAsk: "Which response does Jesus want from us?"',
      },
      {
        title: 'Interactive Activity',
        duration: '10 minutes',
        icon: '🎮',
        type: 'activity',
        content: '**Activity: "Good Samaritan Scenarios"**\n\nDivide children into small groups. Give each group a scenario card and ask them to act out how they would be a "Good Samaritan" in that situation:\n\n**Scenario 1:** A new kid at school is sitting alone at lunch and looks sad.\n**Scenario 2:** Your sibling fell off their bike and scraped their knee.\n**Scenario 3:** An elderly neighbor is struggling to carry groceries.\n**Scenario 4:** A classmate dropped all their books in the hallway and everyone is walking past.\n**Scenario 5:** Someone at church is being left out of a game.\n\nAfter each group presents, discuss:\n- "What did it cost you to help?" (time, effort, comfort)\n- "How do you think the person felt when you helped?"\n- "How did it feel to be the helper?"',
      },
      {
        title: 'Craft Time',
        duration: '8 minutes',
        icon: '🎨',
        type: 'craft',
        content: '**Craft: "Helping Hands Heart"**\n\n**Instructions:**\n1. Give each child a piece of construction paper\n2. Have them trace both hands on the paper\n3. Cut out the hand shapes\n4. Arrange the hands in a heart shape and glue them down\n5. In the center, write the memory verse: "Love your neighbor as yourself" — Mark 12:31\n6. Add heart stickers around the border\n\n**While crafting, discuss:**\n- "What are some ways your hands can help others this week?"\n- "Who is someone you can be a \'Good Samaritan\' to?"\n\nEncourage children to hang their craft at home as a reminder to show love through action.',
      },
      {
        title: 'Discussion Questions',
        duration: '5 minutes',
        icon: '💬',
        type: 'discussion',
        content: 'Lead a group discussion with these questions:\n\n1. **Why do you think Jesus chose a Samaritan as the hero of this story?**\n   *(To show that anyone can show God\'s love, and we should help everyone)*\n\n2. **Is it always easy to help others? Why or why not?**\n   *(Sometimes it costs us time, money, or comfort — but God calls us to love anyway)*\n\n3. **Can you think of a time when someone was a "Good Samaritan" to you?**\n   *(Personal sharing — affirm all responses)*\n\n4. **What is one thing you can do this week to be a Good Samaritan?**\n   *(Encourage specific, actionable commitments)*\n\n5. **How does helping others show God\'s love?**\n   *(When we help others, we reflect God\'s character and share His love)*',
      },
      {
        title: 'Closing & Prayer',
        duration: '5 minutes',
        icon: '🙏',
        type: 'closing',
        content: '**Memory Verse Review:**\nSay the memory verse together three times. Use motions:\n- "Love" — cross arms over heart\n- "your neighbor" — point to someone nearby\n- "as yourself" — point to self\n\n**Closing Prayer:**\n"Dear God, thank You for the story of the Good Samaritan. Help us to see everyone as our neighbor. Give us brave and compassionate hearts to stop and help when we see someone in need. Help us to love others the way You love us — with action, not just words. In Jesus\' name, Amen."\n\n**Take-Home Challenge:**\nChallenge each child to do one act of kindness this week and share it next Sunday. Give each child a heart sticker to put on their hand as a reminder.',
      },
    ],
    parentTakeHome: {
      summary: 'Today we learned about the Parable of the Good Samaritan from Luke 10:25-37. Your child discovered that Jesus calls us to love everyone as our neighbor and to show that love through action, not just words.',
      memoryVerse: '"Love your neighbor as yourself." — Mark 12:31',
      discussionStarters: [
        'Ask your child to retell the story of the Good Samaritan in their own words.',
        'Talk about a time when someone helped your family unexpectedly.',
        'Brainstorm together: Who could your family be a "Good Samaritan" to this week?',
        'Read the passage together (Luke 10:25-37) and discuss what stands out.',
      ],
      familyActivity: 'As a family, choose one act of service to do together this week — visit a neighbor, make a meal for someone, or write encouraging notes to people in your community.',
      weeklyChallenge: 'Each family member picks one person to be a "Good Samaritan" to this week. Share your stories at dinner on Friday!',
    },
    crossReferences: [
      { reference: 'Matthew 22:37-39', text: 'The Greatest Commandment — Love God and love your neighbor' },
      { reference: 'James 2:14-17', text: 'Faith without works is dead' },
      { reference: '1 John 3:18', text: 'Let us love not in word but in deed and truth' },
      { reference: 'Galatians 6:2', text: 'Bear one another\'s burdens' },
      { reference: 'Proverbs 3:27', text: 'Do not withhold good from those to whom it is due' },
    ],
    teacherNotes: [
      'Be sensitive to children who may not have stable home environments when discussing "neighbors"',
      'If time is short, the craft can be simplified or sent home as a take-home activity',
      'For younger elementary students, focus on scenarios 1, 2, and 5 which are most relatable',
      'Consider pairing older students with younger ones during the activity for mentorship',
    ],
  },
  {
    id: 'lesson-2',
    title: 'David and Goliath: Courage Through Faith',
    passage: '1 Samuel 17',
    ageGroup: 'Preschool (3-5)',
    duration: '30 minutes',
    format: 'Interactive',
    theme: 'Courage & Faith',
    createdAt: '5 days ago',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Help little ones discover how God gives us courage to face big challenges, just like David.',
    favorite: false,
    memoryVerse: { text: '"Be strong and courageous. Do not be afraid."', reference: 'Joshua 1:9 (NIV)' },
    objectives: [
      'Hear the story of David and Goliath',
      'Learn that God helps us be brave',
      'Understand that God is bigger than any problem',
      'Practice trusting God when we feel scared',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Felt board or puppets', category: 'essential' },
      { item: 'Small stones and a bag', category: 'activity' },
      { item: 'Construction paper and crayons', category: 'craft' },
      { item: 'Coloring sheets of David and Goliath', category: 'optional' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Welcome the children with a fun song about being brave. Ask: "Have you ever felt scared of something really big?"' },
      { title: 'Scripture Reading', duration: '8 minutes', icon: '📖', type: 'scripture', content: 'Tell the story of David and Goliath using felt board figures or puppets. Keep it simple and engaging for preschoolers.' },
      { title: 'Teaching Time', duration: '5 minutes', icon: '🎓', type: 'teaching', content: 'Key point: God helped David be brave, and God helps us be brave too! David trusted God, not his own strength.' },
      { title: 'Interactive Activity', duration: '7 minutes', icon: '🎮', type: 'activity', content: 'Let children take turns throwing soft balls at a "Goliath" target. Each time they hit it, say together: "God makes us brave!"' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Pray together: "Dear God, thank You for making us brave. Help us remember that You are always with us. Amen."' },
    ],
    parentTakeHome: {
      summary: 'Today we learned about David and Goliath and how God gives us courage to face big challenges.',
      memoryVerse: '"Be strong and courageous. Do not be afraid." — Joshua 1:9',
      discussionStarters: ['Ask your child what David used to fight Goliath.', 'Talk about something that feels "big" and scary, and how God can help.'],
      familyActivity: 'Collect five small stones together and write encouraging words on them as reminders of God\'s strength.',
      weeklyChallenge: 'Each time your child feels scared this week, say the memory verse together.',
    },
    crossReferences: [
      { reference: 'Joshua 1:9', text: 'Be strong and courageous' },
      { reference: 'Psalm 56:3', text: 'When I am afraid, I put my trust in you' },
    ],
    teacherNotes: [
      'Use simple language appropriate for 3-5 year olds',
      'Keep the story focused on David\'s trust in God, not the violence',
    ],
  },
  {
    id: 'lesson-3',
    title: 'The Prodigal Son: A Father\'s Forgiveness',
    passage: 'Luke 15:11-32',
    ageGroup: 'Pre-Teen (11-13)',
    duration: '60 minutes',
    format: 'Discussion-Based',
    theme: 'Forgiveness & Grace',
    createdAt: '1 week ago',
    gradient: 'from-purple-500 to-violet-600',
    description: 'A deep dive into God\'s unconditional love and forgiveness through the parable of the prodigal son.',
    favorite: true,
    memoryVerse: { text: '"But while he was still a long way off, his father saw him and was filled with compassion for him."', reference: 'Luke 15:20 (NIV)' },
    objectives: [
      'Analyze the parable of the prodigal son in depth',
      'Understand God\'s unconditional love and forgiveness',
      'Explore the perspectives of all three characters',
      'Apply the lesson of grace to personal relationships',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV)', category: 'essential' },
      { item: 'Whiteboard and markers', category: 'essential' },
      { item: 'Character perspective worksheets', category: 'activity' },
      { item: 'Journals for reflection', category: 'activity' },
      { item: 'Art supplies for response project', category: 'craft' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Open with a question: "Have you ever done something you really regretted? How did it feel to be forgiven?"' },
      { title: 'Scripture Reading', duration: '10 minutes', icon: '📖', type: 'scripture', content: 'Read Luke 15:11-32 together. Assign different students to read the parts of the narrator, the son, and the father.' },
      { title: 'Teaching Time', duration: '15 minutes', icon: '🎓', type: 'teaching', content: 'Explore the three characters: the younger son (rebellion and repentance), the father (unconditional love), and the older son (resentment and self-righteousness). Draw parallels to our relationship with God.' },
      { title: 'Interactive Activity', duration: '10 minutes', icon: '🎮', type: 'activity', content: 'Character perspective exercise: divide into three groups, each taking the perspective of one character. Write a journal entry from that character\'s point of view.' },
      { title: 'Craft Time', duration: '5 minutes', icon: '🎨', type: 'craft', content: 'Create a "grace card" — write a message of forgiveness or gratitude to someone in your life.' },
      { title: 'Discussion Questions', duration: '10 minutes', icon: '💬', type: 'discussion', content: 'Deep discussion: Why did the father run to meet his son? What does this tell us about God? How is the older brother\'s reaction a warning for us?' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Reflect silently on areas where you need to receive or extend forgiveness. Close with prayer.' },
    ],
    parentTakeHome: {
      summary: 'Today we studied the Parable of the Prodigal Son and explored God\'s unconditional love and forgiveness.',
      memoryVerse: '"But while he was still a long way off, his father saw him and was filled with compassion for him." — Luke 15:20',
      discussionStarters: ['Ask about the three characters and which one your teen related to most.', 'Discuss a time when forgiveness was difficult but important.'],
      familyActivity: 'Write letters of appreciation or forgiveness to family members.',
      weeklyChallenge: 'Practice extending grace to someone who doesn\'t "deserve" it this week.',
    },
    crossReferences: [
      { reference: 'Ephesians 2:8-9', text: 'For it is by grace you have been saved' },
      { reference: 'Romans 5:8', text: 'While we were still sinners, Christ died for us' },
      { reference: 'Colossians 3:13', text: 'Forgive as the Lord forgave you' },
    ],
    teacherNotes: [
      'Pre-teens may relate strongly to feelings of rebellion or being the "good kid" — be sensitive',
      'Allow space for honest sharing without judgment',
      'The older brother\'s story is often overlooked — emphasize it',
    ],
  },
  {
    id: 'lesson-4',
    title: 'Creation: God Made Everything Good',
    passage: 'Genesis 1-2',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    format: 'Activity-Heavy',
    theme: 'God as Creator',
    createdAt: '1 week ago',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Celebrate the wonder of God\'s creation through hands-on activities and nature exploration.',
    favorite: false,
    memoryVerse: { text: '"In the beginning God created the heavens and the earth."', reference: 'Genesis 1:1 (NIV)' },
    objectives: [
      'Learn the order of creation over seven days',
      'Appreciate the beauty and diversity of God\'s creation',
      'Understand that humans are made in God\'s image',
      'Develop a sense of responsibility for caring for creation',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Seven paper plates for creation days', category: 'craft' },
      { item: 'Nature items (leaves, flowers, rocks)', category: 'activity' },
      { item: 'Markers, paint, and glitter', category: 'craft' },
      { item: 'Blue and green tissue paper', category: 'craft' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Start with a nature walk outside (if possible) or show pictures of amazing creation. Ask: "What is the most beautiful thing in nature you\'ve ever seen?"' },
      { title: 'Scripture Reading', duration: '10 minutes', icon: '📖', type: 'scripture', content: 'Read through Genesis 1 together, pausing at each day of creation. Use visual aids to show what God created each day.' },
      { title: 'Teaching Time', duration: '8 minutes', icon: '🎓', type: 'teaching', content: 'Emphasize: God said everything He made was "good." Humans are special — made in God\'s image. God rested on the seventh day and calls us to rest too.' },
      { title: 'Interactive Activity', duration: '7 minutes', icon: '🎮', type: 'activity', content: 'Creation sorting game: Give kids pictures of different created things and have them sort by which day God created them.' },
      { title: 'Craft Time', duration: '10 minutes', icon: '🎨', type: 'craft', content: 'Seven Days of Creation plates: Each child decorates seven paper plates representing each day of creation. Hang them together as a creation timeline.' },
      { title: 'Discussion Questions', duration: '5 minutes', icon: '💬', type: 'discussion', content: 'What is your favorite thing God created? How can we take care of God\'s creation? Why did God say everything was "good"?' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Thank God for the beauty of creation. Pray for wisdom to be good stewards of the earth.' },
    ],
    parentTakeHome: {
      summary: 'Today we explored the seven days of creation from Genesis 1-2 and celebrated God\'s amazing creativity.',
      memoryVerse: '"In the beginning God created the heavens and the earth." — Genesis 1:1',
      discussionStarters: ['Ask your child to name what God created on each day.', 'Go on a nature walk and point out God\'s creation together.'],
      familyActivity: 'Create a family "creation journal" — each day this week, draw or photograph something beautiful in God\'s creation.',
      weeklyChallenge: 'Do one thing each day to care for God\'s creation (pick up litter, water plants, etc.).',
    },
    crossReferences: [
      { reference: 'Psalm 19:1', text: 'The heavens declare the glory of God' },
      { reference: 'Psalm 139:14', text: 'I am fearfully and wonderfully made' },
    ],
    teacherNotes: [
      'Focus on wonder and awe rather than scientific debates',
      'Have extra supplies for the craft — kids love this one',
    ],
  },
  {
    id: 'lesson-5',
    title: 'Fruits of the Spirit: Growing in Character',
    passage: 'Galatians 5:22-23',
    ageGroup: 'Teen (14-17)',
    duration: '60 minutes',
    format: 'Discussion-Based',
    theme: 'Character & Growth',
    createdAt: '2 weeks ago',
    gradient: 'from-rose-500 to-pink-600',
    description: 'Teens explore the nine fruits of the Spirit and how to cultivate them in daily life.',
    favorite: false,
    memoryVerse: { text: '"But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control."', reference: 'Galatians 5:22-23 (NIV)' },
    objectives: [
      'Identify and define each of the nine fruits of the Spirit',
      'Understand the difference between human effort and Spirit-led growth',
      'Evaluate personal growth areas',
      'Create an action plan for spiritual growth',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV)', category: 'essential' },
      { item: 'Whiteboard and markers', category: 'essential' },
      { item: 'Self-assessment worksheets', category: 'activity' },
      { item: 'Fruit-themed snacks', category: 'optional' },
      { item: 'Journals', category: 'activity' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Icebreaker: "If you could instantly master one character trait, what would it be and why?"' },
      { title: 'Scripture Reading', duration: '10 minutes', icon: '📖', type: 'scripture', content: 'Read Galatians 5:16-26 for full context. Discuss the contrast between "acts of the flesh" and "fruit of the Spirit."' },
      { title: 'Teaching Time', duration: '15 minutes', icon: '🎓', type: 'teaching', content: 'Walk through each fruit with real-life examples relevant to teens. Emphasize: these aren\'t things we produce on our own — they grow as we walk with God.' },
      { title: 'Interactive Activity', duration: '10 minutes', icon: '🎮', type: 'activity', content: 'Self-assessment: Rate yourself 1-10 on each fruit. Identify your strongest and areas for growth. Share in pairs.' },
      { title: 'Discussion Questions', duration: '10 minutes', icon: '💬', type: 'discussion', content: 'Which fruit is hardest for teens today? How does social media affect these fruits? What does it look like to "walk by the Spirit" in high school?' },
      { title: 'Craft Time', duration: '5 minutes', icon: '🎨', type: 'craft', content: 'Create a personal "growth plan" card with one fruit to focus on this month and specific action steps.' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Pray for the Holy Spirit to cultivate these fruits in each person\'s life. Accountability partners check in next week.' },
    ],
    parentTakeHome: {
      summary: 'Today we studied the nine fruits of the Spirit from Galatians 5:22-23 and created personal growth plans.',
      memoryVerse: '"But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control." — Galatians 5:22-23',
      discussionStarters: ['Ask which fruit of the Spirit your teen chose to focus on.', 'Share which fruit you find most challenging as an adult.'],
      familyActivity: 'Each family member picks one fruit of the Spirit to practice intentionally this week.',
      weeklyChallenge: 'Notice and affirm when you see family members displaying fruits of the Spirit.',
    },
    crossReferences: [
      { reference: 'John 15:5', text: 'Apart from me you can do nothing' },
      { reference: 'Romans 12:2', text: 'Be transformed by the renewing of your mind' },
    ],
    teacherNotes: [
      'Teens respond well to honest vulnerability — share your own growth areas',
      'Avoid making this feel like a guilt trip — emphasize grace and growth',
    ],
  },
  {
    id: 'lesson-6',
    title: 'Noah\'s Ark: Trusting God\'s Plan',
    passage: 'Genesis 6-9',
    ageGroup: 'Preschool (3-5)',
    duration: '30 minutes',
    format: 'Interactive',
    theme: 'Obedience & Trust',
    createdAt: '2 weeks ago',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'A colorful lesson about Noah\'s obedience and God\'s faithfulness with animal-themed crafts.',
    favorite: false,
    memoryVerse: { text: '"Noah did everything just as God commanded him."', reference: 'Genesis 6:22 (NIV)' },
    objectives: [
      'Hear the story of Noah and the ark',
      'Learn that Noah obeyed God even when it was hard',
      'Understand that God keeps His promises (the rainbow)',
      'Practice saying "yes" to God',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Toy animals (pairs)', category: 'activity' },
      { item: 'Rainbow craft supplies', category: 'craft' },
      { item: 'Brown paper for ark shape', category: 'craft' },
      { item: 'Animal crackers for snack', category: 'optional' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Sing an animal sounds song. Ask: "What\'s your favorite animal? Can you make its sound?"' },
      { title: 'Scripture Reading', duration: '8 minutes', icon: '📖', type: 'scripture', content: 'Tell the story of Noah using toy animals and a simple boat shape. Let children help place animals "on the ark."' },
      { title: 'Teaching Time', duration: '5 minutes', icon: '🎓', type: 'teaching', content: 'Noah listened to God and obeyed, even when no one else did. God kept Noah safe and gave the rainbow as a promise.' },
      { title: 'Interactive Activity', duration: '7 minutes', icon: '🎮', type: 'activity', content: 'Animal matching game: Match pairs of toy animals and march them to the "ark" (a box or table). Count them together!' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Make a rainbow with hand motions. Pray: "Thank You God for keeping Your promises. Help us obey You like Noah did. Amen."' },
    ],
    parentTakeHome: {
      summary: 'Today we learned about Noah\'s Ark and how Noah obeyed God and God kept His promises.',
      memoryVerse: '"Noah did everything just as God commanded him." — Genesis 6:22',
      discussionStarters: ['Ask your child to tell you about Noah and the animals.', 'Next time you see a rainbow, talk about God\'s promise.'],
      familyActivity: 'Visit a zoo or look at animal books together and thank God for creating each animal.',
      weeklyChallenge: 'Practice obeying right away (like Noah did) — make it a fun family game!',
    },
    crossReferences: [
      { reference: 'Genesis 9:13', text: 'I have set my rainbow in the clouds' },
      { reference: 'Hebrews 11:7', text: 'By faith Noah built an ark' },
    ],
    teacherNotes: [
      'Focus on God\'s love and faithfulness, not the destruction',
      'Preschoolers love the animal element — use it throughout',
    ],
  },
  {
    id: 'lesson-7',
    title: 'The Armor of God: Standing Strong',
    passage: 'Ephesians 6:10-18',
    ageGroup: 'Elementary (6-10)',
    duration: '45 minutes',
    format: 'Interactive',
    theme: 'Spiritual Warfare',
    createdAt: '3 weeks ago',
    gradient: 'from-slate-500 to-gray-600',
    description: 'Kids learn about each piece of the armor of God and how to stand firm in their faith.',
    favorite: true,
    memoryVerse: { text: '"Put on the full armor of God, so that you can take your stand against the devil\'s schemes."', reference: 'Ephesians 6:11 (NIV)' },
    objectives: [
      'Name each piece of the armor of God',
      'Understand what each piece represents spiritually',
      'Learn how to "put on" the armor daily',
      'Feel empowered to stand strong in faith',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Cardboard and aluminum foil for armor', category: 'craft' },
      { item: 'Printed armor pieces for coloring', category: 'craft' },
      { item: 'Tape and scissors', category: 'essential' },
      { item: 'Markers and stickers', category: 'craft' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Ask: "If you were going into battle, what would you want to protect yourself?" Show pictures of ancient armor.' },
      { title: 'Scripture Reading', duration: '10 minutes', icon: '📖', type: 'scripture', content: 'Read Ephesians 6:10-18 together. As each piece of armor is mentioned, hold up a visual representation.' },
      { title: 'Teaching Time', duration: '10 minutes', icon: '🎓', type: 'teaching', content: 'Walk through each piece: Belt of Truth, Breastplate of Righteousness, Shoes of Peace, Shield of Faith, Helmet of Salvation, Sword of the Spirit. Give kid-friendly explanations of each.' },
      { title: 'Interactive Activity', duration: '5 minutes', icon: '🎮', type: 'activity', content: '"Armor Up" relay race: Teams race to "put on" each piece of armor (labeled items) while saying what it represents.' },
      { title: 'Craft Time', duration: '10 minutes', icon: '🎨', type: 'craft', content: 'Make your own armor! Use cardboard and foil to create a shield or helmet. Write the memory verse on it.' },
      { title: 'Discussion Questions', duration: '5 minutes', icon: '💬', type: 'discussion', content: 'Which piece of armor do you think is most important? When do you need God\'s armor the most? How can you "put on" the armor every day?' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Stand together and "put on" each piece of armor with motions. Pray for God\'s protection and strength.' },
    ],
    parentTakeHome: {
      summary: 'Today we learned about the Armor of God from Ephesians 6:10-18 and how to stand strong in our faith.',
      memoryVerse: '"Put on the full armor of God, so that you can take your stand against the devil\'s schemes." — Ephesians 6:11',
      discussionStarters: ['Ask your child to name each piece of armor and what it means.', 'Talk about times when you need God\'s armor in daily life.'],
      familyActivity: 'Create a morning routine of "putting on" the armor of God together before school/work.',
      weeklyChallenge: 'Each morning, name one piece of armor and how you\'ll use it that day.',
    },
    crossReferences: [
      { reference: '2 Corinthians 10:4', text: 'The weapons we fight with are not the weapons of the world' },
      { reference: 'Isaiah 59:17', text: 'He put on righteousness as his breastplate' },
    ],
    teacherNotes: [
      'Kids love the hands-on armor craft — allow extra time if possible',
      'Make the spiritual application concrete with real-life scenarios kids face',
    ],
  },
  {
    id: 'lesson-8',
    title: 'Jesus Feeds 5,000: God Provides',
    passage: 'John 6:1-14',
    ageGroup: 'Preschool (3-5)',
    duration: '30 minutes',
    format: 'Interactive',
    theme: 'God\'s Provision',
    createdAt: '3 weeks ago',
    gradient: 'from-lime-500 to-green-600',
    description: 'Little ones learn that God can do big things with what we offer Him, no matter how small.',
    favorite: false,
    memoryVerse: { text: '"My God will meet all your needs."', reference: 'Philippians 4:19 (NIV)' },
    objectives: [
      'Hear the story of Jesus feeding 5,000 people',
      'Learn that God can use small things to do big things',
      'Understand that God provides for our needs',
      'Practice sharing with others',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or age-appropriate translation)', category: 'essential' },
      { item: 'Play food (bread and fish shapes)', category: 'activity' },
      { item: 'Basket', category: 'activity' },
      { item: 'Fish crackers for snack', category: 'optional' },
      { item: 'Paper plates and crayons', category: 'craft' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: 'Ask: "What\'s your favorite food? What if you had to share your lunch with EVERYONE here?"' },
      { title: 'Scripture Reading', duration: '8 minutes', icon: '📖', type: 'scripture', content: 'Tell the story using play food props. Let a child be the "boy with the lunch." Pass the basket around as you tell how Jesus multiplied the food.' },
      { title: 'Teaching Time', duration: '5 minutes', icon: '🎓', type: 'teaching', content: 'A little boy shared his small lunch, and Jesus made it enough for EVERYONE — with leftovers! God can do amazing things with what we give Him.' },
      { title: 'Interactive Activity', duration: '7 minutes', icon: '🎮', type: 'activity', content: 'Sharing circle: Give each child a few fish crackers. Practice sharing with friends. Count how many people we can "feed" together!' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: 'Thank God for providing everything we need. Pray: "Dear God, thank You for taking care of us. Help us share with others. Amen."' },
    ],
    parentTakeHome: {
      summary: 'Today we learned how Jesus fed 5,000 people with just five loaves and two fish, and how God provides for all our needs.',
      memoryVerse: '"My God will meet all your needs." — Philippians 4:19',
      discussionStarters: ['Ask your child how many people Jesus fed.', 'Talk about ways God provides for your family.'],
      familyActivity: 'Prepare a meal together and share it with a neighbor or friend.',
      weeklyChallenge: 'Find one thing to share with someone each day this week.',
    },
    crossReferences: [
      { reference: 'Philippians 4:19', text: 'My God will meet all your needs' },
      { reference: 'Matthew 6:26', text: 'Look at the birds — your Father feeds them' },
    ],
    teacherNotes: [
      'Use real food props when possible — preschoolers learn through senses',
      'Emphasize the boy\'s willingness to share, not just the miracle',
    ],
  },
  {
    id: 'lesson-9',
    title: 'The Book of James: Faith in Action',
    passage: 'James 1-2',
    ageGroup: 'Adult',
    duration: '60 minutes',
    format: 'Discussion-Based',
    theme: 'Character & Growth',
    createdAt: '3 weeks ago',
    gradient: 'from-slate-500 to-gray-600',
    description: 'A deep dive into James\' practical wisdom on living out authentic faith through trials, temptation, and genuine action.',
    favorite: false,
    memoryVerse: { text: '"Do not merely listen to the word, and so deceive yourselves. Do what it says."', reference: 'James 1:22 (NIV)' },
    objectives: [
      'Understand how trials produce perseverance and spiritual maturity',
      'Distinguish between worldly wisdom and wisdom from God',
      'Recognize the danger of faith without works',
      'Apply practical steps to bridge the gap between belief and action',
    ],
    materialsNeeded: [
      { item: 'Bible (NIV or ESV)', category: 'essential' },
      { item: 'Study guide handouts', category: 'essential' },
      { item: 'Whiteboard and markers', category: 'essential' },
      { item: 'Reflection journals', category: 'optional' },
      { item: 'Index cards for action commitments', category: 'activity' },
    ],
    sections: [
      { title: 'Opening & Welcome', duration: '5 minutes', icon: '👋', type: 'opening', content: '**Welcome & Opening Question:**\n\nAs participants arrive, pose this question for reflection:\n\n"Think of a time when your faith was tested. How did you respond, and what did you learn?"\n\n**Opening Prayer:**\n"Lord, as we study Your Word today, give us wisdom and understanding. Help us not just be hearers of the Word, but doers. Transform our hearts and actions. In Jesus\' name, Amen."' },
      { title: 'Scripture Reading', duration: '10 minutes', icon: '📖', type: 'scripture', content: '**Read James 1:1-18 aloud together**\n\nConsider having different participants read sections:\n- Verses 1-4: Trials and perseverance\n- Verses 5-8: Asking for wisdom\n- Verses 9-11: The rich and the poor\n- Verses 12-15: Temptation\'s progression\n- Verses 16-18: Every good gift from above\n\n**Context Note:**\nJames, the brother of Jesus, writes to Jewish Christians scattered abroad. His letter is intensely practical — less theology, more application.' },
      { title: 'Teaching Time', duration: '15 minutes', icon: '🎓', type: 'teaching', content: '**Key Themes in James 1:**\n\n**1. Trials Produce Maturity (vv. 2-4)**\n- "Consider it pure joy" — not feeling joy, but choosing perspective\n- Testing → Perseverance → Maturity → Completeness\n- God doesn\'t waste our pain\n\n**2. Wisdom is Available (vv. 5-8)**\n- God gives generously without finding fault\n- The requirement: Ask in faith, not double-minded\n- Application: What decision needs God\'s wisdom right now?\n\n**3. Temptation\'s Anatomy (vv. 13-15)**\n- God doesn\'t tempt us\n- Progression: Desire → Enticement → Sin → Death\n- We must take responsibility for our choices\n\n**4. Every Good Gift (vv. 16-18)**\n- God is the giver of all good things\n- He doesn\'t change like shifting shadows\n- We are "firstfruits" — precious to Him' },
      { title: 'Discussion Questions', duration: '15 minutes', icon: '💬', type: 'discussion', content: '**Break into small groups of 3-4 and discuss:**\n\n1. James says to "consider it pure joy" when facing trials. How is this possible? What perspective shift does this require?\n\n2. Verse 8 warns against being "double-minded." What does this look like in everyday life? How do we move from doubt to faith?\n\n3. Look at the temptation progression in verses 14-15. Can you identify a time when you saw this pattern in your own life? Where could you have interrupted the cycle?\n\n4. James will go on to say "faith without works is dead." Based on chapter 1, what kind of "works" do you think he has in mind?\n\n**Regroup and share key insights.**' },
      { title: 'Application', duration: '10 minutes', icon: '✍️', type: 'activity', content: '**Personal Reflection & Commitment:**\n\nDistribute index cards. Ask participants to write:\n\n1. **One trial** you\'re currently facing that you will choose to see as an opportunity for growth\n\n2. **One area** where you need to ask God for wisdom this week\n\n3. **One action step** you will take to move from "hearing" to "doing" the Word\n\n**Share with a partner for accountability (optional).**' },
      { title: 'Closing & Prayer', duration: '5 minutes', icon: '🙏', type: 'closing', content: '**Preview Next Week:**\nJames 2 — Faith and works, showing no favoritism, the royal law of love.\n\n**Challenge:**\nEach day this week, read one section of James 1 and ask: "What is God calling me to DO in response to this?"\n\n**Closing Prayer:**\n"Father, thank You for Your Word that challenges and transforms us. Give us wisdom for our trials, strength against temptation, and courage to put our faith into action. May we be doers of the Word, not hearers only. We trust You with our lives. In Jesus\' name, Amen."' },
    ],
    parentTakeHome: {
      summary: 'Today we studied James 1, exploring how trials develop perseverance, how to seek God\'s wisdom, and the importance of being doers of the Word, not just hearers.',
      memoryVerse: '"Do not merely listen to the word, and so deceive yourselves. Do what it says." — James 1:22 (NIV)',
      discussionStarters: ['What trial are you currently facing that could be an opportunity for growth?', 'Where do you need God\'s wisdom most right now?', 'What\'s one way you can put your faith into action this week?'],
      familyActivity: 'As a household, identify one practical way to serve someone in need this week — then do it together.',
      weeklyChallenge: 'Read James 1 daily and journal one action step from each reading.',
    },
    crossReferences: [
      { reference: 'Romans 5:3-5', text: 'Suffering produces perseverance, character, and hope' },
      { reference: 'Proverbs 2:6', text: 'The Lord gives wisdom' },
      { reference: 'Matthew 7:24-27', text: 'Wise and foolish builders — hearing vs. doing' },
      { reference: '1 John 3:18', text: 'Love with actions and in truth, not just words' },
    ],
    teacherNotes: [
      'Adults appreciate depth — don\'t oversimplify the text',
      'Allow space for honest discussion about struggles with faith and action',
      'The book of James can feel convicting — balance challenge with grace',
      'Consider offering the study guide for take-home deeper study',
    ],
  },
]

// In-memory lesson store for cross-page state (before backend persistence)
let _lessons: LessonData[] = [...SAMPLE_LESSONS]
let _listeners: Array<() => void> = []

// Version history types
export interface LessonVersion {
  id: string
  lessonId: string
  timestamp: string
  changes: string
  data: LessonData
}

// Version history storage
let _versionHistory: Map<string, LessonVersion[]> = new Map()

// Collaboration types
export interface LessonShare {
  lessonId: string
  sharedWith: string[] // email addresses
  permissions: 'view' | 'edit'
  sharedAt: string
}

let _shares: LessonShare[] = []

function notify() {
  _listeners.forEach(fn => fn())
}

// Generate a diff description between two lesson states
function generateChangeDescription(oldLesson: LessonData | undefined, newLesson: LessonData): string {
  if (!oldLesson) return 'Initial version'
  
  const changes: string[] = []
  
  if (oldLesson.title !== newLesson.title) changes.push('Title updated')
  if (oldLesson.passage !== newLesson.passage) changes.push('Passage changed')
  if (oldLesson.description !== newLesson.description) changes.push('Description modified')
  if (oldLesson.ageGroup !== newLesson.ageGroup) changes.push('Age group changed')
  if (oldLesson.duration !== newLesson.duration) changes.push('Duration updated')
  if (oldLesson.theme !== newLesson.theme) changes.push('Theme changed')
  if (JSON.stringify(oldLesson.sections) !== JSON.stringify(newLesson.sections)) changes.push('Sections modified')
  if (JSON.stringify(oldLesson.objectives) !== JSON.stringify(newLesson.objectives)) changes.push('Objectives updated')
  if (JSON.stringify(oldLesson.materialsNeeded) !== JSON.stringify(newLesson.materialsNeeded)) changes.push('Materials updated')
  if (JSON.stringify(oldLesson.memoryVerse) !== JSON.stringify(newLesson.memoryVerse)) changes.push('Memory verse changed')
  if (JSON.stringify(oldLesson.crossReferences) !== JSON.stringify(newLesson.crossReferences)) changes.push('Cross references updated')
  if (JSON.stringify(oldLesson.teacherNotes) !== JSON.stringify(newLesson.teacherNotes)) changes.push('Teacher notes modified')
  if (JSON.stringify(oldLesson.parentTakeHome) !== JSON.stringify(newLesson.parentTakeHome)) changes.push('Parent take-home updated')
  
  return changes.length > 0 ? changes.join(', ') : 'Minor changes'
}

export const lessonStore = {
  getAll(): LessonData[] {
    return _lessons
  },

  getById(id: string): LessonData | undefined {
    return _lessons.find(l => l.id === id)
  },

  add(lesson: LessonData): void {
    _lessons = [lesson, ..._lessons]
    // Create initial version
    this.saveVersion(lesson.id, lesson, 'Initial version')
    notify()
  },

  update(id: string, updates: Partial<LessonData>): void {
    const oldLesson = _lessons.find(l => l.id === id)
    _lessons = _lessons.map(l => l.id === id ? { ...l, ...updates } : l)
    
    // Save version history
    const newLesson = _lessons.find(l => l.id === id)
    if (newLesson) {
      const changeDesc = generateChangeDescription(oldLesson, newLesson)
      this.saveVersion(id, newLesson, changeDesc)
    }
    notify()
  },

  delete(id: string): void {
    _lessons = _lessons.filter(l => l.id !== id)
    // Also delete version history
    _versionHistory.delete(id)
    // Remove any shares
    _shares = _shares.filter(s => s.lessonId !== id)
    notify()
  },

  // Alias for delete
  remove(id: string): void {
    this.delete(id)
  },

  toggleFavorite(id: string): void {
    _lessons = _lessons.map(l => l.id === id ? { ...l, favorite: !l.favorite } : l)
    notify()
  },

  subscribe(listener: () => void): () => void {
    _listeners.push(listener)
    return () => {
      _listeners = _listeners.filter(fn => fn !== listener)
    }
  },

  // ============ VERSION HISTORY ============
  
  saveVersion(lessonId: string, lesson: LessonData, changes: string): void {
    const versions = _versionHistory.get(lessonId) || []
    
    // Don't save if nothing changed (compare with last version)
    if (versions.length > 0) {
      const lastVersion = versions[versions.length - 1]
      if (JSON.stringify(lastVersion.data) === JSON.stringify(lesson)) {
        return // Skip duplicate
      }
    }
    
    const version: LessonVersion = {
      id: `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lessonId,
      timestamp: new Date().toISOString(),
      changes,
      data: JSON.parse(JSON.stringify(lesson)), // Deep clone
    }
    
    // Keep max 50 versions per lesson
    const newVersions = [...versions, version].slice(-50)
    _versionHistory.set(lessonId, newVersions)
  },
  
  getVersionHistory(lessonId: string): LessonVersion[] {
    return _versionHistory.get(lessonId) || []
  },
  
  getVersion(lessonId: string, versionId: string): LessonVersion | undefined {
    const versions = _versionHistory.get(lessonId) || []
    return versions.find(v => v.id === versionId)
  },
  
  restoreVersion(lessonId: string, versionId: string): boolean {
    const version = this.getVersion(lessonId, versionId)
    if (!version) return false
    
    // Restore the lesson data (but keep the original ID)
    const restoredData = { ...version.data, id: lessonId }
    _lessons = _lessons.map(l => l.id === lessonId ? restoredData : l)
    
    // Save as new version
    this.saveVersion(lessonId, restoredData, `Restored from ${new Date(version.timestamp).toLocaleString()}`)
    notify()
    return true
  },
  
  compareVersions(lessonId: string, versionId1: string, versionId2: string): { field: string; old: any; new: any }[] {
    const v1 = this.getVersion(lessonId, versionId1)
    const v2 = this.getVersion(lessonId, versionId2)
    if (!v1 || !v2) return []
    
    const diffs: { field: string; old: any; new: any }[] = []
    const fieldsToCompare = ['title', 'passage', 'description', 'ageGroup', 'duration', 'theme', 'format']
    
    for (const field of fieldsToCompare) {
      if ((v1.data as any)[field] !== (v2.data as any)[field]) {
        diffs.push({
          field,
          old: (v1.data as any)[field],
          new: (v2.data as any)[field],
        })
      }
    }
    
    // Check sections count
    if (v1.data.sections.length !== v2.data.sections.length) {
      diffs.push({
        field: 'sections',
        old: `${v1.data.sections.length} sections`,
        new: `${v2.data.sections.length} sections`,
      })
    }
    
    return diffs
  },

  // ============ COLLABORATION / SHARING ============
  
  shareLesson(lessonId: string, emails: string[], permissions: 'view' | 'edit' = 'view'): LessonShare {
    // Remove existing share for this lesson
    _shares = _shares.filter(s => s.lessonId !== lessonId)
    
    const share: LessonShare = {
      lessonId,
      sharedWith: emails,
      permissions,
      sharedAt: new Date().toISOString(),
    }
    _shares.push(share)
    notify()
    return share
  },
  
  getShareInfo(lessonId: string): LessonShare | undefined {
    return _shares.find(s => s.lessonId === lessonId)
  },
  
  unshareLesson(lessonId: string): void {
    _shares = _shares.filter(s => s.lessonId !== lessonId)
    notify()
  },
  
  getSharedWithMe(email: string): LessonData[] {
    const sharedLessonIds = _shares
      .filter(s => s.sharedWith.includes(email))
      .map(s => s.lessonId)
    return _lessons.filter(l => sharedLessonIds.includes(l.id))
  },
  
  canEdit(lessonId: string, email: string): boolean {
    const share = _shares.find(s => s.lessonId === lessonId)
    if (!share) return false
    return share.sharedWith.includes(email) && share.permissions === 'edit'
  },

  // Search lessons by query string across title, passage, theme, description
  search(query: string): LessonData[] {
    if (!query.trim()) return _lessons
    const q = query.toLowerCase()
    return _lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.passage.toLowerCase().includes(q) ||
      l.theme.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q)
    )
  },

  // Filter lessons by criteria
  filter(opts: { ageGroup?: string; theme?: string; favoritesOnly?: boolean }): LessonData[] {
    return _lessons.filter(l => {
      if (opts.ageGroup && opts.ageGroup !== 'All' && l.ageGroup !== opts.ageGroup) return false
      if (opts.theme && opts.theme !== 'All Themes' && l.theme !== opts.theme) return false
      if (opts.favoritesOnly && !l.favorite) return false
      return true
    })
  },

  // Get unique age groups from all lessons
  getAgeGroups(): string[] {
    return [...new Set(_lessons.map(l => l.ageGroup))]
  },

  // Get unique themes from all lessons
  getThemes(): string[] {
    return [...new Set(_lessons.map(l => l.theme))]
  },

  // Get stats about the lesson library
  getStats() {
    return {
      total: _lessons.length,
      favorites: _lessons.filter(l => l.favorite).length,
      ageGroups: new Set(_lessons.map(l => l.ageGroup)).size,
      totalSections: _lessons.reduce((sum, l) => sum + l.sections.length, 0),
    }
  },
}
