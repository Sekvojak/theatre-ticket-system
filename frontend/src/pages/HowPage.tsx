import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAQ_ITEMS = [
  {
    q: 'Môžem rezervovať bez registrácie?',
    a: 'Áno, základná rezervácia na meno nevyžaduje registráciu. Stačí zadať meno a e-mail pre potvrdenie.',
  },
  {
    q: 'Ako môžem zrušiť rezerváciu?',
    a: 'Prihlásený používateľ môže zrušiť rezerváciu v sekcii „Moje rezervácie". Zrušenie je možné do začiatku predstavenia.',
  },
  {
    q: 'Čo sa stane, ak dvaja vyberú rovnaké sedadlo?',
    a: 'Systém kontroluje dostupnosť v reálnom čase. Pri potvrdení rezervácie prebehne finálna kontrola a v prípade konfliktu budete upozornení.',
  },
  {
    q: 'Je možné zakúpiť viac lístkov naraz?',
    a: 'Áno, z mapy sály si môžete vybrať viacero sedadiel v jednej objednávke.',
  },
]

export default function HowPage() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex(prev => prev === i ? null : i)

  return (
    <section className="how-section">
      <div className="how-intro">
        <span className="section-label">Návod</span>
        <h2 className="section-title">Ako to funguje?</h2>
        <p>
          Rezervácia lístka trvá menej ako 2 minúty. Žiadna registrácia nie je potrebná pre základné
          funkcie. Stačí vybrať predstavenie, sedadlo a potvrdiť.
        </p>
      </div>

      <div className="steps-grid">
        <div className="step-card">
          <div className="step-number">01</div>
          <div className="step-icon">🎭</div>
          <h3>Vyber predstavenie</h3>
          <p>Prehliadaj aktuálny repertoár, filtruj podľa žánru a vyber predstavenie, ktoré ťa zaujme.</p>
        </div>
        <div className="step-card">
          <div className="step-number">02</div>
          <div className="step-icon">📅</div>
          <h3>Vyber termín</h3>
          <p>Každé predstavenie môže mať viacero termínov. Vyber si dátum a čas, ktorý ti vyhovuje.</p>
        </div>
        <div className="step-card">
          <div className="step-number">03</div>
          <div className="step-icon">🗺️</div>
          <h3>Vyber sedadlo</h3>
          <p>Interaktívna mapa sály ti ukáže voľné, obsadené aj VIP miesta. Kliknutím si vyber svoje sedadlo.</p>
        </div>
        <div className="step-card">
          <div className="step-number">04</div>
          <div className="step-icon">✅</div>
          <h3>Potvrdiť</h3>
          <p>Zadaj meno a e-mail (alebo sa prihláš). Dostaneš potvrdenie rezervácie s číslom.</p>
        </div>
      </div>

      <div className="faq-list">
        <h3 className="faq-title">Časté otázky</h3>
        {FAQ_ITEMS.map((item, i) => (
          <div
            key={i}
            className={`faq-item${openIndex === i ? ' open' : ''}`}
            onClick={() => toggle(i)}
          >
            <div className="faq-question">
              {item.q}
              <span>+</span>
            </div>
            <div className="faq-answer">{item.a}</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <button className="btn-primary" onClick={() => navigate('/shows')}>
          Pozrieť predstavenia
        </button>
      </div>
    </section>
  )
}
