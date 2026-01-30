import mongoose from "mongoose";
import slugify from "slugify";
import dotenv from "dotenv";
import Store from "./Models/storeModel.js";

dotenv.config();

async function migrateSlugs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const stores = await Store.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }]
    });

    console.log(`🔍 Found ${stores.length} stores without slug`);

    for (const store of stores) {
      let baseSlug = slugify(store.storeName, {
        lower: true,
        strict: true,
      });

      let slug = baseSlug;
      let count = 1;

      // Handle duplicate slugs
      while (await Store.findOne({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
      }

      store.slug = slug;
      await store.save();

      console.log(`✔ ${store.storeName} → ${slug}`);
    }

    console.log("🎉 Slug migration completed");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateSlugs();
