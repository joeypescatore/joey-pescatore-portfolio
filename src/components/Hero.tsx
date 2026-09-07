import { profile } from '../data/portfolio'
import { Sprite } from './Sprite'
import { staggerDelay } from '../utils/stagger'
import './Hero.css'

// game entry point disabled for now (onPlay unused) — click-to-play on the
// sprite is being replaced by a chat feature; re-wire `<Sprite onPlay={onPlay} />`
// to bring it back in the meantime
export function Hero({ onPlay: _onPlay }: { onPlay: () => void }) {
  return (
    <section className="hero">
      <div className="stagger-in" style={staggerDelay(0)}>
        <Sprite />
      </div>

      <div className="hero-bio">
        <p className="hero-bio-line stagger-in" style={staggerDelay(1)}>
          {profile.bioLine1} {profile.bioLine2Prefix}
          <a href={profile.bioLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.bioLink.label}
          </a>
          .
        </p>
        <p className="hero-bio-line stagger-in" style={staggerDelay(2)}>
          {profile.bioParagraph2Prefix}
          <a href={profile.eventualLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.eventualLink.label}
          </a>
          {profile.bioParagraph2Middle}
          <a href={profile.cactusJackLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.cactusJackLink.label}
          </a>
          ,{' '}
          <a
            href={profile.republicRecordsLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-bio-link"
          >
            {profile.republicRecordsLink.label}
          </a>
          ,{' '}
          <a
            href={profile.columbiaRecordsLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-bio-link"
          >
            {profile.columbiaRecordsLink.label}
          </a>{' '}
          and more.
        </p>
        <p className="hero-bio-line stagger-in" style={staggerDelay(3)}>
          {profile.contactPrefix}
          <a href={profile.twitterLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.twitterLink.label}
          </a>
          ,{' '}
          <a href={profile.linkedinLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.linkedinLink.label}
          </a>
          , or via{' '}
          <a href={profile.emailLink.href} className="hero-bio-link">
            {profile.emailLink.label}
          </a>
          .
        </p>
      </div>
    </section>
  )
}
