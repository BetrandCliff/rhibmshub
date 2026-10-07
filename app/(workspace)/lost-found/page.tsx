import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { signedImage } from '@/lib/r2';
import LostFoundForm from './lost-found-form';
import styles from './lost-found.module.css';

export default async function LostFoundPage() {
  await requireUser();
  const items = await db.lostFoundItem.findMany({ orderBy: { createdAt: 'desc' } });
  const posts = await Promise.all(items.map(async (item) => ({
    ...item,
    imageUrl: await signedImage(item.imageKey, item.imageName, item.imageMimeType),
  })));

  return (
    <>
      <div className="top">
        <div>
          <div className="eyebrow">CAMPUS COMMUNITY</div>
          <h1>Lost &amp; Found</h1>
          <p>Post missing items, report what you found, and help reunite items with their owners.</p>
        </div>
      </div>

      <section className={`card ${styles.postCard}`}>
        <h2>Post a missing or found item</h2>
        <p className="muted">Posts include your contact details so people can follow up. For found items, the post shows who found it.</p>
        <LostFoundForm />
      </section>

      <section className={`card ${styles.listCard}`}>
        <div className="dashboard-section-head">
          <div><h2>Recent items</h2><p>Contact the person listed to ask about an item or arrange collection.</p></div>
          <span className="private-chip">{posts.length} {posts.length === 1 ? 'POST' : 'POSTS'}</span>
        </div>
        {posts.length ? (
          <div className={styles.grid}>
            {posts.map((item) => (
              <article className={styles.itemCard} key={item.id}>
                <img className={styles.image} src={item.imageUrl} alt={`Photo of ${item.itemName}`} />
                <div className={styles.itemContent}>
                  <span className={item.type === 'FOUND' ? styles.found : styles.missing}>
                    {item.type === 'FOUND' ? 'FOUND ITEM' : 'MISSING ITEM'}
                  </span>
                  <h3>{item.itemName}</h3>
                  <p className={styles.description}>{item.description}</p>
                  <dl className={styles.details}>
                    <div><dt>{item.type === 'FOUND' ? 'Found at' : 'Last seen'}</dt><dd>{item.location}</dd></div>
                    <div><dt>{item.type === 'FOUND' ? 'Found by' : 'Contact person'}</dt><dd>{item.contactName}</dd></div>
                    <div><dt>Contact / collection details</dt><dd>{item.contactDetails}</dd></div>
                  </dl>
                  <small className={styles.date}>Posted {item.createdAt.toLocaleDateString()}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state"><b>No items posted yet</b><p>Be the first to post a missing or found item.</p></div>
        )}
      </section>
    </>
  );
}
