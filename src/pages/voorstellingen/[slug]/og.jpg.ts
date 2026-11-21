import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { join } from 'node:path';
import sharp from 'sharp';

// Deelbeeld voor WhatsApp, Messenger, Facebook, ...: 1200x630 en klein genoeg (<300 KB) voor WhatsApp
export async function getStaticPaths() {
  const voorstellingen = await getCollection('voorstellingen');
  return voorstellingen
    .filter((post) => post.data.image.startsWith('/'))
    .map((post) => ({ params: { slug: post.id }, props: { image: post.data.image } }));
}

const W = 1200;
const H = 630;

export const GET: APIRoute = async ({ props }) => {
  const file = join(process.cwd(), 'public', props.image);
  // Achtergrond: dezelfde flyer, vergroot, vervaagd en donkerder; daarop de volledige flyer
  const background = await sharp(file).resize(W, H, { fit: 'cover' }).blur(40).modulate({ brightness: 0.45 }).toBuffer();
  const flyer = await sharp(file).resize({ height: H - 60, width: W - 60, fit: 'inside' }).toBuffer();
  const jpg = await sharp(background)
    .composite([{ input: flyer, gravity: 'center' }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
  return new Response(new Uint8Array(jpg), { headers: { 'Content-Type': 'image/jpeg' } });
};
