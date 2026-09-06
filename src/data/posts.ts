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

export const posts: Post[] = []
