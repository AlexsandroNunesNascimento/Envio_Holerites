import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'SUA_URL_AQUI';
const supabaseKey = 'SUA_CHAVE_ANOM_AQUI';
export const supabase = createClient(supabaseUrl, supabaseKey);

