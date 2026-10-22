import { useState } from 'react';
import { profile } from '../data/portfolio';
import { Brand } from './Navigation';
import TiltedCard from './TiltedCard';
import './Contact.css';
function ContactTitle() {
  const lines = ['LET’S BUILD', 'BETTER VISUAL', 'SYSTEMS ↘'];
  return <h2 aria-label={lines.join(' ')}>
    <span aria-hidden="true">{lines.map(line => <span className="contact-title-line" key={line}>
      <span className="contact-line-content">
      {Array.from(line).map((character, index) => character === ' '
        ? ' '
        : <span className={character === '↘' ? 'contact-letter contact-arrow' : 'contact-letter'} key={index}>
          <span className="contact-glyph">{character}</span>
        </span>)}
      </span>
    </span>)}</span>
  </h2>;
}

export default function Contact() {
  const [message,setMessage] = useState('');
  async function copy(value) { if(value.includes('*')) { setMessage('该联系方式已隐藏部分信息。'); return; } try { await navigator.clipboard.writeText(value); setMessage('已复制到剪贴板'); } catch { setMessage(`请手动复制：${value}`); } }
  return <section id="contact" className="contact section">
    <div className="contact-main container">
      <div className="contact-headline">
        <p>联系方式 / LET’S TALK</p>
        <ContactTitle/>
        <a href="#home" aria-label="返回首页"><Brand/></a>
      </div>
      <div className="motion-card contact-reveal" data-motion-card>
      <TiltedCard rotateAmplitude={12} scaleOnHover={1.03}>
        <div className="contact-card">
          <span className="eyebrow accent">HAVE A PROJECT IN MIND?</span>
          <h3>一起，让想法发生。</h3>
          <div className="contact-rows">
            {[[ '手机', profile.phone ],[ '微信', profile.wechat ],[ '邮箱', profile.email ]].map(([label,value]) => <button onClick={() => copy(value)} key={label}>
              <span>{label}：</span><span>{value}</span><span>↗</span>
            </button>)}
          </div>
          <div className="contact-card-bottom">
            <span className="contact-symbol" aria-hidden="true"/>
            <p>Visual, Brand & AI Design<br/><span>好的视觉，始于一次对话。</span></p>
          </div>
          <p className="contact-message" role="status">{message || '点击邮箱即可复制'}</p>
        </div>
      </TiltedCard>
      </div>
    </div>
  </section>;
}

