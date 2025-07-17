import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'SUA_URL_AQUI';
const supabaseKey = 'SUA_CHAVE_ANOM_AQUI';
export const supabase = createClient(supabaseUrl, supabaseKey);

/*
const supabaseUrl = 'https://ikpnwedylgjvntovqrae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcG53ZWR5bGdqdm50b3ZxcmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODE4NjUsImV4cCI6MjA2ODI1Nzg2NX0.QcQB_zSTEf5Xz719IlMM7c6uPwiWGrjFLRAd0PO0ALY';

const supabaseUrl = 'SUA_URL_AQUI';
const supabaseKey = 'SUA_CHAVE_ANOM_AQUI';

*/