import wavformPreview from '../assets/wavform-in-app-event.jpg'
import outrspcePreview from '../assets/outrspce-spotify.png'
import pulse2Preview from '../assets/pulse2-youtube.png'
import aafontsPreview from '../assets/aafonts-app.png'

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

export const caseStudies = [
  {
    image: 'https://framerusercontent.com/images/aETKCoxzAcMiSISxyAR2SdsbRg.jpg?width=2322&height=2423',
    title: 'Shaping A Complicated Rollout For Widespread Adoption',
    company: 'Eventual',
    year: '2026',
    href: 'https://www.joeypescatore.com/eventual',
  },
  {
    image: 'https://framerusercontent.com/images/IkC14o2iI9kF89WTKdD74uGY3wM.jpg?width=2322&height=1475',
    title: 'Reinventing How Fans Review & Discover Music',
    company: 'Wavform',
    year: '2025',
    href: 'https://www.joeypescatore.com/wavform',
  },
  {
    image: 'https://framerusercontent.com/images/V5Rk4s0Sho0scGNZPLBS5YJNtI.jpg?width=2322&height=2423',
    title: 'Design Language & Web Overhaul For Holistic Health',
    company: 'HHW',
    year: '2025',
    href: 'https://www.joeypescatore.com/hhw',
  },
]

export const writings = [
  {
    title: 'AI and Its Place in Design',
    date: 'Aug 23',
    badge: 'New',
  },
  {
    title: "Spend More Time on Why You Shouldn't Build It",
    date: 'Coming Soon',
    comingSoon: true,
  },
]

export const sideProjects = [
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
  {
    title: 'AaFonts',
    description: 'Font inspiration library',
    image: aafontsPreview,
    href: 'https://aafonts.vercel.app/',
  },
]
