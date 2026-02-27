import { handbookArticle } from './handbook'
import { leadSundaySchoolArticle } from './lead-sunday-school'
import { ageAppropriateArticle } from './age-appropriate'
import { visualAidsArticle } from './visual-aids'
import { classroomBehaviorArticle } from './classroom-behavior'
import { bibleOverviewArticle } from './bible-overview'
import { scriptureMemoryArticle } from './scripture-memory'
import { bibleTimelineArticle } from './bible-timeline'
import { bibleContextArticle } from './bible-context'
import { parablesArticle } from './parables-of-jesus'
import { oldTestamentHeroesArticle } from './old-testament-heroes'
import { fruitsArticle } from './fruits-of-the-spirit'
import { tenCommandmentsArticle } from './ten-commandments'
import { miraclesArticle } from './miracles-of-jesus'
import { womenOfBibleArticle } from './women-of-bible'
import { psalmsWorshipArticle } from './psalms-worship'
import { beatitudesArticle } from './beatitudes'
import { bibleCraftsArticle } from './bible-crafts'
import { bibleGamesArticle } from './bible-games'
import { worshipSongsArticle } from './worship-songs'
import { dramaSkitsArticle } from './drama-skits'
import { christmasLessonsArticle } from './christmas-lessons'
import { easterDevotionalsArticle } from './easter-devotionals'
import { vbsThemesArticle } from './vbs-themes'
import { backToSchoolArticle } from './back-to-school'
import { familyDevotionalsArticle } from './family-devotionals'
import { parentCommunicationArticle } from './parent-communication'
import { faithAtHomeArticle } from './faith-at-home'

export interface Article {
  slug: string
  title: string
  category: string
  tag: string
  readTime: string
  gradient: string
  description: string
  html: string
}

export const articles: Article[] = [
  handbookArticle,
  leadSundaySchoolArticle,
  ageAppropriateArticle,
  visualAidsArticle,
  classroomBehaviorArticle,
  bibleOverviewArticle,
  scriptureMemoryArticle,
  bibleTimelineArticle,
  bibleContextArticle,
  parablesArticle,
  oldTestamentHeroesArticle,
  fruitsArticle,
  tenCommandmentsArticle,
  miraclesArticle,
  womenOfBibleArticle,
  psalmsWorshipArticle,
  beatitudesArticle,
  bibleCraftsArticle,
  bibleGamesArticle,
  worshipSongsArticle,
  dramaSkitsArticle,
  christmasLessonsArticle,
  easterDevotionalsArticle,
  vbsThemesArticle,
  backToSchoolArticle,
  familyDevotionalsArticle,
  parentCommunicationArticle,
  faithAtHomeArticle,
]

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find(a => a.slug === slug)
}
