import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';

// Interface for the data structure in the database
interface NewsDatabaseItem {
  title?: string;
  link: string; // Link is mandatory and unique
  pub_date?: string | null; // Store as TIMESTAMPTZ compatible string or null
  iso_date?: string | null; // Original ISO date string
  content_snippet?: string;
  source?: string;
}

// Interface for the parsed RSS item
interface FeedItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  source?: string; // Added by our processing
}

const feedUrls = [
  // Using the reliable feeds
  { name: 'The Lancet', url: 'https://www.thelancet.com/rssfeed/lancet_current.xml' },
  { name: 'WHO', url: 'https://www.who.int/rss-feeds/news-english.xml' },
];

const parser = new Parser();

// Initialize Supabase client
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in Netlify environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- DEBUG LOGGING START ---
console.log(`DEBUG: process.env.SUPABASE_URL exists? ${!!supabaseUrl}`);
console.log(`DEBUG: process.env.SUPABASE_SERVICE_ROLE_KEY exists? ${!!supabaseKey}`);
// Avoid logging the full key, but log if it exists
if (supabaseKey) {
  console.log(`DEBUG: SUPABASE_SERVICE_ROLE_KEY starts with: ${supabaseKey.substring(0, 5)}...`);
}
// --- DEBUG LOGGING END ---

if (!supabaseUrl || !supabaseKey) {
  // Log error in production instead of throwing? Or let Netlify handle the throw.
  console.error("Supabase URL and Service Role Key must be provided in environment variables.");
  throw new Error("Supabase URL and Service Role Key must be provided in environment variables.");
}
// Use service_role key for backend operations to bypass RLS if needed
const supabase = createClient(supabaseUrl, supabaseKey);


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log("Scheduled function 'fetch-medical-news' triggered.");

  try {
    let allItems: FeedItem[] = [];
    console.log("Starting to fetch news feeds...");

    for (const feed of feedUrls) {
      console.log(`Processing feed: ${feed.name} (${feed.url})`);
      try {
        const parsedFeed = await parser.parseURL(feed.url);
        if (parsedFeed.items) {
          console.log(` -> Success: Fetched ${parsedFeed.items.length} items from ${feed.name}`);
          const itemsWithSource = parsedFeed.items
            .filter(item => item.link) // Ensure item has a link
            .map(item => ({
              ...item,
              source: feed.name
            }));
          allItems = allItems.concat(itemsWithSource);
        } else {
          console.log(` -> Success but no items found for ${feed.name}`);
        }
      } catch (error) {
        console.error(` -> Error fetching or parsing feed ${feed.name} (${feed.url}):`, error instanceof Error ? error.message : String(error));
      }
    }
    console.log(`Finished fetching all feeds. Total items collected: ${allItems.length}`);

    if (allItems.length === 0) {
      console.log("No items fetched, exiting function.");
      return { statusCode: 200, body: "No new items fetched." };
    }

    // Prepare data for Supabase upsert
    const newsToUpsert: NewsDatabaseItem[] = allItems.map(item => ({
      title: item.title,
      link: item.link!, // We filtered for items with links
      // Attempt to create a valid timestamp string, otherwise null
      pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : (item.isoDate ? new Date(item.isoDate).toISOString() : null),
      iso_date: item.isoDate ?? null,
      content_snippet: item.contentSnippet,
      source: item.source,
    })).filter(item => item.link); // Double check link exists

    console.log(`Attempting to upsert ${newsToUpsert.length} items into Supabase...`);

    // Upsert into Supabase
    // 'link' is the conflict target (defined as UNIQUE in the SQL schema)
    // Use { returning: 'minimal' } if we don't need the data back, might simplify types
    const { error: upsertError } = await supabase
      .from('latest_medical_news')
      .upsert(newsToUpsert, { onConflict: 'link', ignoreDuplicates: true }); // Consider returning: 'minimal'

    if (upsertError) {
      console.error("Supabase upsert error:", upsertError);
      throw upsertError; // Throw error to be caught by the outer catch block
    }

    // Simplified success log
    console.log(`Supabase upsert operation completed successfully for ${newsToUpsert.length} attempted items.`);

    // Prune news older than 3 days based on pub_date
    try {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const dateString = threeDaysAgo.toISOString();

      console.log(`Attempting to delete news items published before ${dateString}...`);

      const { error: deleteError } = await supabase
        .from('latest_medical_news')
        .delete()
        .lt('pub_date', dateString); // Use less than operator

      if (deleteError) {
        console.error("Supabase delete error:", deleteError);
        // Decide if this should be a fatal error for the function run
        // For now, we'll just log it and continue
      } else {
        console.log("Successfully pruned old news items.");
      }
    } catch (pruneError) {
      console.error("Error during news pruning:", pruneError);
      // Log and continue, as the main task (fetching) succeeded
    }

    // Optional: Add logic here to prune old news items from the table if desired
    // e.g., DELETE FROM latest_medical_news WHERE fetched_at < NOW() - INTERVAL '7 days';

    return {
      statusCode: 200,
      body: `Successfully fetched and processed ${newsToUpsert.length} news items.`,
    };

  } catch (globalError) {
    console.error("Global error in fetch-medical-news function:", globalError);
    return {
      statusCode: 500,
      // Don't return detailed error messages in production for scheduled functions if not needed
      body: JSON.stringify({ error: "Failed to process news feeds." }),
    };
  }
};

export { handler };
