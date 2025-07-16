import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = //cole aqui sua URL
const supabaseKey = //cole aqui sua chave anom 
export const supabase = createClient(supabaseUrl, supabaseKey);