// server/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl ? "Set" : "Missing");
console.log("Supabase Key:", supabaseKey ? "Set" : "Missing");

if (!supabaseUrl || !supabaseKey) {
  console.error("Environment variables:", {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "exists" : "missing"
  });
  throw new Error("Missing Supabase environment variables. Please check Railway settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
