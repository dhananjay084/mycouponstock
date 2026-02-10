// migrateDealSlugs.js
import mongoose from "mongoose";
import slugify from "slugify";
import dotenv from "dotenv";
import Deal from "./Models/dealModel.js"; // Adjust path as needed

dotenv.config();

async function migrateDealSlugs() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for deal slug migration");

    // Find deals without slugs or with empty slugs
    const deals = await Deal.find({
      $or: [{ slug: { $exists: false } }, { slug: "" }]
    });

    console.log(`🔍 Found ${deals.length} deals without slugs`);

    let updatedCount = 0;
    let duplicateCount = 0;

    for (const deal of deals) {
      try {
        // Generate base slug from dealTitle
        let baseSlug = slugify(deal.dealTitle, {
          lower: true,
          strict: true,
          trim: true,
          remove: /[*+~.()'"!:@]/g // Remove special characters
        });

        // If slug is empty after processing, use a fallback
        if (!baseSlug || baseSlug.length === 0) {
          baseSlug = `deal-${deal._id.toString().substring(0, 8)}`;
        }

        let slug = baseSlug;
        let count = 1;

        // Check for existing slugs (excluding current deal)
        while (await Deal.findOne({ slug, _id: { $ne: deal._id } })) {
          slug = `${baseSlug}-${count}`;
          count++;
          
          if (count > 10) {
            // If too many duplicates, append deal ID
            slug = `${baseSlug}-${deal._id.toString().substring(0, 6)}`;
            duplicateCount++;
            break;
          }
        }

        // Update the deal
        deal.slug = slug;
        await deal.save();
        
        updatedCount++;
        console.log(`✔ [${updatedCount}/${deals.length}] ${deal.dealTitle} → ${slug}`);
        
      } catch (error) {
        console.error(`❌ Failed to update deal ${deal._id}:`, error.message);
      }
    }

    console.log("\n🎉 Deal slug migration completed!");
    console.log(`📊 Updated: ${updatedCount} deals`);
    console.log(`🚨 Duplicates handled: ${duplicateCount} deals`);
    
    // Optional: Verify migration
    const totalDeals = await Deal.countDocuments();
    const dealsWithSlugs = await Deal.countDocuments({ slug: { $exists: true, $ne: "" } });
    
    console.log(`\n📋 Verification:`);
    console.log(`   Total deals in DB: ${totalDeals}`);
    console.log(`   Deals with slugs: ${dealsWithSlugs}`);
    console.log(`   Missing slugs: ${totalDeals - dealsWithSlugs}`);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

// Run migration
migrateDealSlugs();