import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCrossMedium } from '@central-icons-react/round-filled-radius-3-stroke-2/IconCrossMedium'
import { IconCheckmark1Medium } from '@central-icons-react/round-filled-radius-3-stroke-2/IconCheckmark1Medium'
import { caseStudies } from '../data/portfolio'
import { useCursorPreview } from '../hooks/useCursorPreview'
import { staggerDelay } from '../utils/stagger'
import './CaseStudies.css'

export function CaseStudies() {
  const { hoveredIndex, setHoveredIndex, previewX, previewY, handleMouseMove, handleMouseLeave } = useCursorPreview({
    width: 200,
    height: 130,
  })

  // for a case study with no slug/href — right now just Merge — clicking it
  // doesn't navigate anywhere. Instead the hover preview morphs in place
  // into a fake password gate, so it reads as "there's a real case study
  // here, just locked" rather than a bare "coming soon." On touch devices
  // there's no cursor-following box to morph, so it opens a centered modal
  // instead — same idea, different shape.
  const [gateOpenIndex, setGateOpenIndex] = useState<number | null>(null)
  const [gatePos, setGatePos] = useState<{ x: number; y: number } | null>(null)
  const [mobileGateOpen, setMobileGateOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const modalInputWrapRef = useRef<HTMLFormElement>(null)
  const revertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // only actually "in gate shape" while the gated item is the one being
  // shown — hovering a different row (Eventual, Wavform) should morph the
  // box straight back to its normal media size, same as leaving the gate
  // open in the background would otherwise wrongly keep it tiny
  const isGateActive = gateOpenIndex !== null && hoveredIndex === gateOpenIndex

  // same condition CaseStudies.css uses to hide the cursor-following
  // preview entirely (`@media (hover: none)`) — a real touch device, not
  // just a narrow desktop window
  const [isTouch, setIsTouch] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(hover: none)')
    setIsTouch(query.matches)
    function handleChange(event: MediaQueryListEvent) {
      setIsTouch(event.matches)
    }
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  function openGate(index: number) {
    setGatePos({ x: previewX, y: previewY })
    setGateOpenIndex(index)
    setHoveredIndex(index)
  }

  function closeGate() {
    setGateOpenIndex(null)
    setGatePos(null)
    if (revertTimeoutRef.current) clearTimeout(revertTimeoutRef.current)
    previewRef.current?.classList.remove('is-error', 'is-shaking')
  }

  // hovering onto any other row should drop the gate entirely, not just
  // shrink it out of view in the background — coming back to Merge later
  // starts fresh instead of resuming a stale typed password
  function handleRowHover(index: number) {
    setHoveredIndex(index)
    if (gateOpenIndex !== null && index !== gateOpenIndex) closeGate()
  }

  useEffect(() => {
    if (gateOpenIndex === null) return
    function handleOutsideClick(event: MouseEvent) {
      if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
        closeGate()
        setHoveredIndex(null)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [gateOpenIndex, setHoveredIndex])

  useEffect(() => {
    if (!mobileGateOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobileGateOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileGateOpen])

  function triggerShake(el: HTMLElement | null) {
    if (!el) return
    // restart-able even if it's already mid-shake: remove the class, force a
    // reflow so the browser actually notices, then re-add it
    el.classList.remove('is-shaking')
    void el.offsetWidth
    el.classList.add('is-shaking')

    el.classList.add('is-error')
    if (revertTimeoutRef.current) clearTimeout(revertTimeoutRef.current)
    // matches --revert-hold in CaseStudies.css — border fades back to
    // neutral after sitting red for a beat
    revertTimeoutRef.current = setTimeout(() => el.classList.remove('is-error'), 3000)
  }

  function handleGateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // there's no correct password — anything entered is wrong
    triggerShake(previewRef.current)
    const input = event.currentTarget.elements.namedItem('gate-password') as HTMLInputElement | null
    if (input) input.value = ''
  }

  function handleMobileGateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    triggerShake(modalInputWrapRef.current)
    const input = event.currentTarget.elements.namedItem('gate-password-mobile') as HTMLInputElement | null
    if (input) input.value = ''
  }

  return (
    <section id="case-studies" className="case-studies">
      <div className="case-studies-content stagger-in" style={staggerDelay(5)}>
        <div className="section-label">Case Studies</div>

        <div
          className={`case-studies-list${hoveredIndex !== null ? ' is-hovering' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (gateOpenIndex !== null) return
            handleMouseLeave()
          }}
        >
          {caseStudies.map((item, index) => {
            const rowClassName = `case-study-row${hoveredIndex === index ? ' is-active' : ''}`
            const content = (
              <>
                <div className="case-study-title">{item.title}</div>
                <div className="case-study-right">
                  <div className="case-study-company">{item.company}</div>
                  <span className="case-study-arrow">&#8594;</span>
                </div>
              </>
            )

            if (item.slug) {
              return (
                <Link
                  key={item.title}
                  to={`/${item.slug}`}
                  className={rowClassName}
                  onMouseEnter={() => handleRowHover(index)}
                >
                  {content}
                </Link>
              )
            }

            if (item.href) {
              return (
                <a
                  key={item.title}
                  href={item.href}
                  className={rowClassName}
                  onMouseEnter={() => handleRowHover(index)}
                >
                  {content}
                </a>
              )
            }

            return (
              <a
                key={item.title}
                href="#"
                className={rowClassName}
                onMouseEnter={() => setHoveredIndex(index)}
                onClick={(event) => {
                  event.preventDefault()
                  if (isTouch) {
                    setMobileGateOpen(true)
                  } else {
                    openGate(index)
                  }
                }}
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>

      <div
        ref={previewRef}
        className={`case-study-preview${hoveredIndex !== null ? ' is-visible' : ''}${isGateActive ? ' is-gate' : ''}`}
        style={{
          left: isGateActive && gatePos ? gatePos.x : previewX,
          top: isGateActive && gatePos ? gatePos.y : previewY,
        }}
      >
        {caseStudies.map((item, index) => {
          if (gateOpenIndex === index) {
            return (
              <form
                key={item.title}
                className={`case-study-preview-image case-study-gate-form${
                  hoveredIndex === index ? ' is-active' : ''
                }`}
                onSubmit={handleGateSubmit}
              >
                <input
                  name="gate-password"
                  type="password"
                  placeholder="Password"
                  autoFocus
                  autoComplete="off"
                  className="case-study-gate-input"
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') closeGate()
                  }}
                />
              </form>
            )
          }

          return item.video ? (
            <video
              key={item.title}
              src={item.video}
              poster={item.image}
              muted
              loop
              autoPlay
              playsInline
              className={`case-study-preview-image${hoveredIndex === index ? ' is-active' : ''}`}
            />
          ) : (
            <img
              key={item.title}
              src={item.image}
              alt=""
              className={`case-study-preview-image${hoveredIndex === index ? ' is-active' : ''}`}
            />
          )
        })}
      </div>

      {mobileGateOpen && (
        <div
          className="case-study-gate-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setMobileGateOpen(false)
          }}
        >
          <div className="case-study-gate-modal">
            <div className="case-study-gate-modal-header">
              <span className="case-study-gate-modal-title">Password Protected</span>
              <button
                type="button"
                className="case-study-gate-modal-close"
                onClick={() => setMobileGateOpen(false)}
              >
                <IconCrossMedium size={20} color="#8d8d8d" />
              </button>
            </div>

            <form
              ref={modalInputWrapRef}
              className="case-study-gate-modal-input-wrap"
              onSubmit={handleMobileGateSubmit}
            >
              <input
                name="gate-password-mobile"
                type="password"
                placeholder="Password"
                autoFocus
                autoComplete="off"
                className="case-study-gate-input"
              />
              <button type="submit" className="case-study-gate-modal-submit">
                <IconCheckmark1Medium size={15} color="#ffffff" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
