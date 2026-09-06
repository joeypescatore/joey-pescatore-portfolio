import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconArrowLeft'
import type { Post } from '../data/posts'
import './PostPage.css'

export function PostPage({ post, onBack }: { post: Post; onBack: () => void }) {
  const chapters = post.sections.filter((section) => section.heading)

  return (
    <div className="post-page">
      <div className="post-content">
        <aside className="post-aside">
          <button type="button" className="post-back-button" onClick={onBack}>
            <IconArrowLeft size={16} />
            Back
          </button>

          {chapters.length > 0 && (
            <nav className="post-chapters">
              <ul className="post-chapters-list">
                {chapters.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>{section.heading}</a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </aside>

        <main className="post-main">
          <article className="post-article">
            <header className="post-header">
              <h1 className="post-title">{post.title}</h1>
              <time className="post-date">{post.date}</time>
            </header>

            {post.sections.map((section) => (
              <section key={section.id} id={section.id} className="post-section">
                {section.heading && <h2 className="post-section-heading">{section.heading}</h2>}
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="post-paragraph">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            {post.footnotes && post.footnotes.length > 0 && (
              <footer className="post-footnotes">
                <ol>
                  {post.footnotes.map((footnote, index) => (
                    <li key={index}>{footnote}</li>
                  ))}
                </ol>
              </footer>
            )}
          </article>
        </main>
      </div>
    </div>
  )
}
