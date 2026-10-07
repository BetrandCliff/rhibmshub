import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteFile, putFile } from '@/lib/r2';

const imageExtensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Sign in to post a lost or found item.' }, { status: 401 });

  let imageKey: string | undefined;
  try {
    const form = await request.formData();
    const type = form.get('type');
    const itemName = String(form.get('itemName') || '').trim();
    const description = String(form.get('description') || '').trim();
    const location = String(form.get('location') || '').trim();
    const contactName = String(form.get('contactName') || '').trim();
    const contactDetails = String(form.get('contactDetails') || '').trim();
    const image = form.get('image');

    if (type !== 'MISSING' && type !== 'FOUND') {
      return NextResponse.json({ error: 'Choose whether the item is missing or found.' }, { status: 400 });
    }
    if (itemName.length < 2 || itemName.length > 120 || description.length < 5 || description.length > 3000 || location.length < 2 || location.length > 200 || contactName.length < 2 || contactName.length > 120 || contactDetails.length < 3 || contactDetails.length > 200) {
      return NextResponse.json({ error: 'Complete each field using the displayed length limits.' }, { status: 400 });
    }
    if (!(image instanceof File) || !image.size) {
      return NextResponse.json({ error: 'Add an image of the item.' }, { status: 400 });
    }
    if (!imageExtensions[image.type]) {
      return NextResponse.json({ error: 'Use a JPG, PNG, or WebP image.' }, { status: 400 });
    }
    const maxBytes = 8 * 1024 * 1024;
    if (image.size > maxBytes) {
      return NextResponse.json({ error: 'The image must be 8 MB or smaller.' }, { status: 400 });
    }

    imageKey = `lost-found/${new Date().getFullYear()}/${crypto.randomUUID()}${imageExtensions[image.type]}`;
    await putFile(imageKey, Buffer.from(await image.arrayBuffer()), image.type);
    const item = await db.lostFoundItem.create({
      data: {
        type,
        itemName,
        description,
        location,
        contactName,
        contactDetails,
        imageKey,
        imageName: image.name,
        imageMimeType: image.type,
        postedById: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: item.id }, { status: 201 });
  } catch (error) {
    if (imageKey) {
      try {
        await deleteFile(imageKey);
      } catch (cleanupError) {
        console.error('Could not clean up an image after a lost-and-found post failed:', cleanupError);
      }
    }
    console.error('Lost-and-found post failed:', error);
    return NextResponse.json({ error: 'The item could not be posted. Please try again.' }, { status: 500 });
  }
}
