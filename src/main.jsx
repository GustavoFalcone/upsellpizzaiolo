import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowDown, ArrowRight, BookOpen, Camera, Check, FileDown, FolderHeart, Sparkles } from 'lucide-react';
import { upsellConfig, withTracking } from './config';
import './styles.css';

const SESSION_KEY = 'pizza-upsell-progress-start-v2';
const DURATION = 150_000;

function UpsellProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let start = Number(sessionStorage.getItem(SESSION_KEY));
    if (!Number.isFinite(start) || start <= 0 || start > Date.now()) {
      start = Date.now();
      sessionStorage.setItem(SESSION_KEY, String(start));
    }
    let frame;
    const update = () => {
      const next = Math.min(1, (Date.now() - start) / DURATION);
      setProgress(next);
      if (next < 1) frame = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(frame);
  }, []);
  const verified = upsellConfig.accessStatus === 'processing';
  const percentage = Math.floor(progress * 100);
  return <section className="progress-section" aria-label="Etapa pós-compra">
    <div className="progress-shell">
      <div className="progress-topline"><span>ETAPA PÓS-COMPRA</span><strong>{percentage}%</strong></div>
      <div className="progress-copy">
        <span className="progress-mark"><Check size={17} strokeWidth={3} /></span>
        <div>
          <strong>{verified ? 'SEU MATERIAL ESTÁ SENDO PREPARADO!' : 'COMPRA REGISTRADA!'}</strong>
          <p>{verified ? 'Enquanto isso, temos uma oferta especial para você.' : 'Antes de acessar seu material, confira esta oferta especial.'}</p>
        </div>
      </div>
      <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage} aria-label="Progresso visual da apresentação da oferta, não do pagamento">
        <div style={{ width: `${progress * 100}%` }} />
      </div>
      <small>Progresso visual da apresentação · não indica processamento do pagamento</small>
    </div>
    <a href="#oferta" className="scroll-cue" aria-label="Ver a oferta"><ArrowDown size={18} /></a>
  </section>;
}

function UpsellHero() {
  return <header className="hero" id="oferta">
    <div className="eyebrow"><Sparkles size={14} /> UM COMPLEMENTO ESPECIAL PARA SEU ATLAS</div>
    <h1>Agora imagine criar as fichas das <span>suas próprias pizzas!</span></h1>
    <p>Com este aplicativo, você envia a foto da sua pizza, organiza os ingredientes e transforma cada sabor do seu cardápio em uma ficha visual personalizada, pronta para consultar ou salvar em PDF.</p>
  </header>;
}

const benefits = [
  { Icon: Camera, title: 'Suas pizzas, suas fichas', text: 'Crie montagens personalizadas usando os sabores reais do seu cardápio.' },
  { Icon: FolderHeart, title: 'Tudo organizado', text: 'Encontre suas montagens mais rápido, sem depender apenas da memória.' },
  { Icon: FileDown, title: 'PDF pronto para usar', text: 'Reúna suas fichas em um manual visual para consultar ou imprimir.' },
];

function BenefitChips() {
  return <section className="benefit-grid" aria-label="Vantagens do aplicativo">
    {benefits.map(({ Icon, title, text }) => <article className="benefit" key={title}>
      <span className="benefit-icon"><Icon size={19} strokeWidth={1.8} /></span>
      <div><h2>{title}</h2><p>{text}</p></div>
    </article>)}
  </section>;
}

function VerticalDemoVideo() {
  const [ratio, setRatio] = useState(576 / 1248);
  const landscape = ratio > 1;
  return <section className="demo" aria-labelledby="demo-heading">
    <div className="section-kicker"><span /> DEMONSTRAÇÃO DO INFOAPP <span /></div>
    <h2 id="demo-heading">Veja como é simples criar sua própria ficha</h2>
    <div className={`demo-layout ${landscape ? 'demo-layout--landscape' : ''}`}>
      <div className={`video-frame ${landscape ? 'video-frame--landscape' : ''}`} style={{ aspectRatio: ratio }}>
        <video src={upsellConfig.videoUrl} poster={upsellConfig.videoPosterUrl || undefined} playsInline preload="metadata" controls onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          if (videoWidth > 0 && videoHeight > 0) setRatio(videoWidth / videoHeight);
        }} aria-label="Demonstração do aplicativo" />
      </div>
      <div className="demo-steps" aria-label="Como funciona">
        <div><span>01</span><strong>Envie a foto</strong><p>Adicione a imagem da sua pizza.</p></div>
        <div><span>02</span><strong>Personalize</strong><p>Informe os ingredientes e a ordem de montagem.</p></div>
        <div><span>03</span><strong>Ficha pronta</strong><p>Visualize a montagem em uma página clara.</p></div>
        <div><span>04</span><strong>Salve ou exporte</strong><p>Guarde na biblioteca ou gere seu PDF.</p></div>
      </div>
    </div>
    <div className="mechanism" aria-label="Foto, ingredientes, ficha e PDF"><span>FOTO</span><ArrowRight /><span>INGREDIENTES</span><ArrowRight /><span>FICHA</span><ArrowRight /><span>PDF</span></div>
  </section>;
}

function UpsellOffer() {
  return <section className="offer" aria-labelledby="offer-heading">
    <div className="offer-ornament"><BookOpen size={21} strokeWidth={1.7} /></div>
    <span className="offer-label">O QUE VOCÊ VAI RECEBER</span>
    <h2 id="offer-heading">Tenha o seu próprio criador de fichas visuais</h2>
    <ul>
      <li><Check /> Crie fichas personalizadas com as pizzas da sua pizzaria.</li>
      <li><Check /> Organize seus sabores em uma biblioteca visual.</li>
      <li><Check /> Consulte suas montagens rapidamente pelo celular.</li>
      <li><Check /> Gere PDFs com as fichas que você mesmo criou.</li>
    </ul>
    <div className="offer-price">
      <span>OFERTA ESPECIAL PÓS-COMPRA</span>
      <p>Adicione o aplicativo ao seu material por apenas:</p>
      <strong>{upsellConfig.price}</strong>
      <small>Valor adicional à sua compra já realizada.</small>
    </div>
    <UpsellActions />
  </section>;
}

function UpsellActions() {
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const inFlight = useRef(false);

  async function accept() {
    if (inFlight.current) return;
    const gatewayAction = window.pizzaUpsellAccept;
    if (!upsellConfig.acceptUrl && typeof gatewayAction !== 'function') {
      setNotice('A opção de adicionar o aplicativo aguarda a integração oficial do checkout. Nenhuma cobrança foi feita.');
      return;
    }
    inFlight.current = true;
    setLoading(true);
    setNotice('');
    try {
      if (typeof gatewayAction === 'function') {
        await gatewayAction({ price: upsellConfig.price, query: window.location.search });
      } else {
        window.location.assign(withTracking(upsellConfig.acceptUrl));
      }
    } catch {
      setNotice('Não foi possível abrir a oferta. Tente novamente; nenhuma compra foi confirmada por esta página.');
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  function decline() {
    const declineAction = window.pizzaUpsellDecline;
    if (typeof declineAction === 'function') {
      declineAction({ query: window.location.search });
    } else if (upsellConfig.declineUrl) {
      window.location.assign(withTracking(upsellConfig.declineUrl));
    } else {
      setNotice('O destino de acesso ao Atlas ainda não foi informado. A recusa não adiciona o aplicativo nem altera sua compra.');
    }
  }

  return <div className="actions">
    <button type="button" className="accept" onClick={accept} disabled={loading}>
      <span>{loading ? 'Abrindo a oferta…' : 'SIM! QUERO CRIAR MINHAS PRÓPRIAS FICHAS'}</span>
      <small>Adicionar o aplicativo por {upsellConfig.price}</small>
    </button>
    <button type="button" className="decline" onClick={decline}>Não, obrigado. Quero continuar para o meu material.</button>
    {notice && <p role="status" className="action-notice">{notice}</p>}
  </div>;
}

function App() {
  return <><UpsellProgress /><main><UpsellHero /><VerticalDemoVideo /><BenefitChips /><UpsellOffer /></main></>;
}

const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
root.render(<App />);
if (import.meta.hot) import.meta.hot.dispose((data) => { data.root = root; });
