// Configure apenas destinos e integrações oficiais. Nada aqui realiza cobrança por conta própria.
export const upsellConfig = {
  price: 'R$39,90',
  acceptUrl: '',
  declineUrl: '',
  videoUrl: '',
  videoPosterUrl: '',
  accessStatus: 'confirmed',
  trackingParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'],
};

export function withTracking(destination) {
  if (!destination) return '';
  const url = new URL(destination, window.location.href);
  const current = new URLSearchParams(window.location.search);
  for (const key of upsellConfig.trackingParams) {
    if (current.has(key) && !url.searchParams.has(key)) url.searchParams.set(key, current.get(key));
  }
  return url.toString();
}
