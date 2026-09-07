import wavformPreview from '../assets/wavform-in-app-event.jpg'
import outrspcePreview from '../assets/outrspce-spotify.png'
import pulse2Preview from '../assets/pulse2-youtube.png'
import inkinPreview from '../assets/inkin-thumbnail.jpg'
import eventualThumbnail from '../assets/eventual/hero.jpg'
import wavformThumbnail from '../assets/wavform/thumbnail.jpg'
// import hhwThumbnail from '../assets/hhw/thumbnail.jpg'

export const profile = {
  bioLine1: "I'm a product designer based in New York City.",
  bioLine2Prefix: 'Currently helping build software at ',
  bioLink: { label: 'Merge', href: 'https://www.merge.dev/' },
  bioParagraph2Prefix: 'Before that, I was the founding product designer at ',
  eventualLink: { label: 'Eventual', href: 'https://eventualclimate.com/' },
  bioParagraph2Middle:
    ' and other early stage startups. In a previous life I spent years freelancing in the entertainment industry, doing creative work for labels/artists like ',
  cactusJackLink: { label: 'Cactus Jack (Travis Scott)', href: 'https://www.reddit.com/r/SoFaygo/s/DcFZSzrqdo' },
  republicRecordsLink: {
    label: 'Republic Records',
    href: 'https://www.youtube.com/playlist?list=PLaiW-gZtXntFkM4tBGw5iMg1PS0YTp2AY',
  },
  columbiaRecordsLink: {
    label: 'Columbia Records',
    href: 'https://www.youtube.com/playlist?list=PLaiW-gZtXntFkM4tBGw5iMg1PS0YTp2AY',
  },
  contactPrefix: 'You can reach me on ',
  twitterLink: { label: 'Twitter/X', href: 'https://x.com/joeypescatore_' },
  linkedinLink: { label: 'LinkedIn', href: 'https://www.linkedin.com/in/joeypescatore' },
  emailLink: { label: 'email', href: 'mailto:jpesco25@gmail.com' },
}

export const experience = [
  { startYear: '2026', title: 'Product Designer', company: 'Merge' },
  { startYear: '2025', title: 'Founding Product Designer', company: 'Eventual' },
  { startYear: '2024', title: 'Product Designer, Growth', company: 'HHW' },
  { startYear: '2022', title: 'Lead Designer', company: 'Cartoons.io' },
  { startYear: '2018', title: 'Visual Designer', company: 'Freelance' },
]

type CaseStudy = {
  image: string
  title: string
  company: string
  year: string
  href?: string
  slug?: string
}

export const caseStudies: CaseStudy[] = [
  {
    image: eventualThumbnail,
    title: 'Shaping A Complicated Rollout For Widespread Adoption',
    company: 'Eventual',
    year: '2026',
    slug: 'eventual',
  },
  {
    image: wavformThumbnail,
    title: 'Reinventing How Fans Review & Discover Music',
    company: 'Wavform',
    year: '2025',
    slug: 'wavform',
  },
  // {
  //   image: hhwThumbnail,
  //   title: 'Design Language & Web Overhaul For Holistic Health',
  //   company: 'HHW',
  //   year: '2025',
  //   slug: 'hhw',
  // },
]

type Writing = {
  title: string
  date: string
  comingSoon?: boolean
  badge?: string
  slug?: string
}

export const writings: Writing[] = [
  {
    title: 'Designing How Waiting Is Perceived',
    date: 'Coming Soon',
    comingSoon: true,
  },
]

export const sideProjects = [
  {
    title: 'Inkin',
    description: 'Coming Soon',
    image: inkinPreview,
    href: 'https://x.com/joeypescatore_/status/2095846880064176231?s=20',
  },
  {
    title: 'Wavform',
    description: 'Letterboxd, but for music',
    image: wavformPreview,
    href: 'https://apps.apple.com/us/app/wavform/id6670220932',
  },
  {
    title: 'Pulse²',
    description: 'Video docs on random topics',
    image: pulse2Preview,
    href: 'https://www.youtube.com/@PulseSquared/videos',
  },
  {
    title: 'Outrspce',
    description: 'Ambient music',
    image: outrspcePreview,
    href: 'https://open.spotify.com/artist/13gXQCviBL36w5CKWtVESO?si=Uw-w8bqjSCWAgzSuEY6XQA',
  },
]
