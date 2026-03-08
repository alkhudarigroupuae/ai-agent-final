import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  wcUrl: process.env.WC_URL || '',
  wcConsumerKey: process.env.WC_CONSUMER_KEY || '',
  wcConsumerSecret: process.env.WC_CONSUMER_SECRET || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};
