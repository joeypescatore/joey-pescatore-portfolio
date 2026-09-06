export type PostSection = {
  id: string
  heading?: string
  paragraphs: string[]
}

export type Post = {
  slug: string
  title: string
  date: string
  sections: PostSection[]
  footnotes?: string[]
}

export const posts: Post[] = [
  {
    slug: 'ai-and-its-place-in-design',
    title: 'AI and Its Place in Design',
    date: 'Aug 23, 2026',
    sections: [
      {
        id: 'intro',
        paragraphs: [
          "A year ago I was almost entirely uneducated on engineering. Now I'm pushing FE PRs across two companies, and I feel almost as comfortable, maybe even more, ideating and building in code as I do in Figma.",
        ],
      },
      {
        id: 'ideate-in-code',
        heading: 'Ideate in code',
        paragraphs: [
          "Especially on a quick turnaround, it's 1000x easier to drop a screenshot of what the UI currently looks like into Claude, use voice to text to say what I want changed, and let it spit out variations while I look through Mobbin or start on the next thing in the backlog.",
          "Recently, for the Merge for Workforce release, I had 30 to 45 minutes to take a screen I'd never seen before, didn't know the intent of, and get it from entirely Claude-generated to something a bit more polished and understandable. Granted, it was far from perfect. But for getting from v0 to v1, it does an impeccable job. If I'd had to go into Figma to get a mid-fi mockup in front of our PM, that alone would've taken a minimum of 30 minutes, especially now that a lot of stuff gets built in dev before it ever touches Figma.",
          'Worth pointing to here: Karri Saarinen at Linear put it well, "design is a search, not a production pipeline."¹',
        ],
      },
      {
        id: 'be-detailed',
        heading: 'Be detailed',
        paragraphs: [
          'Piggybacking off the last point, people are quick to give up on testing these tools. Prompting it with "design a [generic web or mobile app idea]" is obviously still not up to par. These products shine right now at improving on previously built systems. That\'s not to say they\'re incapable of net-new ideas, you\'ll just see the quality shift from mid-high to low fidelity.',
        ],
      },
      {
        id: 'test-out-paper',
        heading: 'Test out Paper',
        paragraphs: [
          "Obviously not sponsored, but a genuinely interesting tool worth playing around with. I haven't been a huge fan of Claude Design, tan/purple/orange design systems, I get it, it's ugly. But at my last startup I switched my workflow to only showing leadership interactive prototypes. For designers it's easy to look at a Figma frame and play out in your head how everything's going to work. Nontechnical management's brains don't work like that. It's very, very hard for some people to imagine a flat Figma frame as something that will actually ship to end users.",
          "We went from design to shipped 3x faster with this workflow, almost entirely because of how much it cut back on misalignment. It's just an unmatched internal experience. Get variations done in Paper, build it out in Claude, send it off for review. This is NOT usually the end all be all, but it gets the team aligned on a direction, so when you go back to Figma for the pixel-perfect pass, you're not dealing with leadership walking back everything.",
        ],
      },
      {
        id: 'keep-up',
        heading: 'Keep up',
        paragraphs: [
          "It's also extremely important for designers to keep up. When engineers can go off and build things without any real cost of failure, there's usually no thought put into whether or how you know you're building the right thing. Timelines are sometimes hours now, because there's no constraint on eng workload, so we're spending a lot less time thinking through problems and a lot more time just acting on thoughts. That's not to say speed doesn't have its place, plenty of people would argue speed over everything. But that's all the more reason designers need to pick up speed too, so we can make sure what's being built is actually targeting the right problems. In a way, design has become even more important than it was before, not less.",
          "Almost like we're going back to having UX designers again. If agents are the ones mocking up ideas and writing the code, that frees up more of your time to actually understand your customer, the problem, whether something should be built at all. Then you come in at the end and polish everything, which, as we all know, is where design goes from 40% to 100%.",
          "None of this means designers should be sitting in Cursor or Claude all day either. Developers are still very much part of the company, and pushing PRs isn't necessarily where you bring the most value versus, say, the initial discovery phase. The back and forth between R&D has basically become a game of pong: the designer can go fix a PR, the developer can jump into Figma, and we've condensed the back and forth to the point where both sides feel more comfortable getting closer to their respective colleagues. All that to say, designers shouldn't always be in code, it lets us step out of the canvas and spend more time guiding the direction of the whole project, the whole company.",
          "For years designers have lived on the canvas, handing off their work to watch it become a reality somewhere else. Even with the most robust system, that back and forth was never optimal. It'll take time to get used to all of this, but that's what I've started calling the slingshot experience: you have to slow yourself down for a period of time to propel yourself at the speeds this is supposed to get you to.",
        ],
      },
    ],
    footnotes: ["From Karri Saarinen's essay Design is more than code."],
  },
]
