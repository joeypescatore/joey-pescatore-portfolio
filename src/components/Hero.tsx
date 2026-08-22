import { socialLinks, profile } from '../data/portfolio'
import { Sprite } from './Sprite'
import './Hero.css'

export function Hero() {
  return (
    <section className="hero">
      <Sprite />

      <div className="hero-bio">
        <p className="hero-bio-line">
          {profile.bioLine1} {profile.bioLine2Prefix}
          <a href={profile.bioLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.bioLink.label}
          </a>
          .
        </p>
        <p className="hero-bio-line">{profile.bioParagraph2}</p>
      </div>

      <div className="hero-links">
        {socialLinks.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="hero-link">
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}
