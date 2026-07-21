import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = "https://igurvpxbklmodzewzvsd.supabase.co";
let supabaseKey = "sb_publishable_y8k4GYNuVECnXOkH9ZknFA_EbFGWwhw";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=");
    const val = vals.join("=").trim();
    if (key?.trim() === "NEXT_PUBLIC_SUPABASE_URL" && val) supabaseUrl = val;
    if ((key?.trim() === "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" || key?.trim() === "NEXT_PUBLIC_SUPABASE_ANON_KEY") && val) supabaseKey = val;
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubmissions() {
  const { data, error } = await supabase.from("submissions").select("*");
  console.log("Database Submissions Count:", data?.length || 0);
  console.log("Submissions Data:", JSON.stringify(data, null, 2));
}

checkSubmissions();
