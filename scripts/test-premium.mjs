// Temporary: configure product "expense-tracker-pro" with premium fields
// to verify the new product page sections render. Not part of the app.
import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./scrollzea.db" });

const slug = "expense-tracker-pro";
const expiresAt = new Date(Date.now() + 2 * 86400000).toISOString();

async function main() {
  const row = await client.execute("SELECT id FROM products WHERE slug = ?", [slug]);
  const id = row.rows[0]?.id;
  if (!id) { console.log("product not found"); return; }

  await client.execute(
    `UPDATE products SET
      price=399, discount_price=1999, show_limited_offer=1,
      offer_label='Limited Time Offer',
      payment_description='One-time payment · Lifetime access · No subscriptions',
      cta_text='Get Instant Access Now',
      social_proof_text='Join 50,000+ satisfied customers',
      currency='INR',
      urgency_enabled=1, show_fire_symbol=1, urgency_text='Hurry! Offer Ends In', expires_at=?,
      youtube_enabled=1, youtube_url='https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtube_button_text='Watch YouTube Video', youtube_video_title='Watch how it works'
    WHERE id=?`, [expiresAt, id]);

  // Make idempotent: clear existing relations first
  await client.execute("DELETE FROM product_features WHERE product_id=?", [id]);
  await client.execute("DELETE FROM faqs WHERE product_id=?", [id]);
  await client.execute("DELETE FROM product_reviews WHERE product_id=?", [id]);
  await client.execute("DELETE FROM product_perfect_for WHERE product_id=?", [id]);

  // Features (What's Included)
  const feats = ["870+ Flutter mobile app source codes", "Developer tools access", "Generative AI & LLM apps", "Web3 & Crypto apps"];
  for (let i = 0; i < feats.length; i++)
    await client.execute("INSERT INTO product_features (product_id, feature, enabled, sort_order) VALUES (?,?,1,?)", [id, feats[i], i]);

  // FAQs
  const faqs = [
    ["What will I receive after purchase?", "Instant download access to everything included."],
    ["Can I use these for client projects?", "Yes, a commercial license is included."],
    ["Do I need Flutter knowledge?", "Basic knowledge helps, but templates are ready to run."],
  ];
  for (let i = 0; i < faqs.length; i++)
    await client.execute("INSERT INTO faqs (product_id, question, answer, enabled, sort_order) VALUES (?,?,?,1,?)", [id, faqs[i][0], faqs[i][1], i]);

  // Reviews
  const reviews = [
    ["Amit S.", "Business Owner", 5, "Amazing bundle. Saved me months of work."],
    ["Priya R.", "Freelance Designer", 4, "Great value for the price. Support is responsive."],
    ["Rahul K.", "Startup Founder", 5, "Everything I needed in one place. Highly recommended."],
  ];
  for (let i = 0; i < reviews.length; i++)
    await client.execute("INSERT INTO product_reviews (product_id, customer_name, company, rating, review_text, enabled, sort_order) VALUES (?,?,?,?,?,1,?)",
      [id, reviews[i][0], reviews[i][1], reviews[i][2], reviews[i][3], i]);

  // Perfect For
  const pf = ["Flutter Developers", "Freelancers", "Students", "Agencies"];
  for (let i = 0; i < pf.length; i++)
    await client.execute("INSERT INTO product_perfect_for (product_id, title, description, enabled, sort_order) VALUES (?,?,?,1,?)", [id, pf[i], null, i]);

  // Payment option (razorpay test link)
  await client.execute("INSERT INTO payment_options (product_id, provider, payment_url, enabled) VALUES (?, 'RAZORPAY', 'https://rzp.io/lt/test', 1)", [id]);

  console.log("Configured product", id, "with premium fields");
}
main().catch((e) => { console.error(e); process.exit(1); });
