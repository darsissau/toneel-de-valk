import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import QRCode from 'qrcode';
import logoSvg from '../../../../public/favicon.svg?raw';

// qr -> voorstellingspagina, qr-programma -> programmaboekje (alleen als er een PDF is).
// Elk ook als "-transparant" variant zonder witte achtergrond.
export async function getStaticPaths() {
  const voorstellingen = await getCollection('voorstellingen');
  return voorstellingen.flatMap((post) =>
    ['qr', ...(post.data.pdf ? ['qr-programma'] : [])]
      .flatMap((qr) => [qr, `${qr}-transparant`])
      .map((qr) => ({ params: { slug: post.id, qr } })));
}

export const parseQr = (slug: string, qr: string, site: URL) => ({
  url: new URL(`/voorstellingen/${slug}/${qr.startsWith('qr-programma') ? 'programma/' : ''}`, site).href,
  transparent: qr.endsWith('-transparant'),
});

const logoViewBox = logoSvg.match(/viewBox="([^"]+)"/)![1];
// Logo in hetzelfde zwart als de QR-modules
const logoInner = logoSvg.replace(/^[\s\S]*?<svg[^>]*>|<\/svg>\s*$/g, '').replace(/<metadata>[\s\S]*?<\/metadata>/, '').replaceAll('#231f20', '#000000');

// QR met het valklogo in het midden. Foutcorrectie H (30%) houdt de code scanbaar ondanks het logo.
export async function qrSvg({ url, transparent }: { url: string; transparent: boolean }) {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 4,
    color: { dark: '#000000', light: transparent ? '#ffffff00' : '#ffffff' },
  });
  const size = Number(svg.match(/viewBox="0 0 (\d+)/)![1]);
  const box = Math.round(size * 0.22); // vrij vlak: ~5% van de code, ruim binnen de 30% marge
  const pos = (size - box) / 2;
  const pad = box * 0.12;
  const logoSvgEl = `<svg x="${pos + pad}" y="${pos + pad}" width="${box - 2 * pad}" height="${box - 2 * pad}" viewBox="${logoViewBox}">${logoInner}</svg>`;
  if (!transparent) {
    const logo = `<rect x="${pos}" y="${pos}" width="${box}" height="${box}" fill="#ffffff"/>${logoSvgEl}`;
    return { svg: svg.replace('</svg>', `${logo}</svg>`), size };
  }
  // Transparant: geen wit vlak, dus de modules onder het logo wegmaskeren
  const mask = `<mask id="m"><rect width="${size}" height="${size}" fill="#fff"/><rect x="${pos}" y="${pos}" width="${box}" height="${box}" fill="#000"/></mask>`;
  const out = svg.replace(/(<path[^>]*stroke="#000000"[^>]*\/>)/, `${mask}<g mask="url(#m)">$1</g>`);
  return { svg: out.replace('</svg>', `${logoSvgEl}</svg>`), size };
}

// Vectorbestand: scherp op elke drukgrootte (flyers, affiches)
export const GET: APIRoute = async ({ params, site }) => {
  const { svg } = await qrSvg(parseQr(params.slug!, params.qr!, site!));
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
