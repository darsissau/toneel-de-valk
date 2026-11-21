import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { qrSvg, parseQr } from './[qr].svg.ts';
export { getStaticPaths } from './[qr].svg.ts';

// Hoge resolutie PNG (~1200px) voor Word, Canva, sociale media
export const GET: APIRoute = async ({ params, site }) => {
  const { svg, size } = await qrSvg(parseQr(params.slug!, params.qr!, site!));
  const px = size * Math.ceil(1200 / size); // veelvoud van de modulegrootte: scherpe randen
  const png = await sharp(Buffer.from(svg.replace('<svg ', `<svg width="${px}" height="${px}" `))).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
