// supabase.js

// Importa a função createClient da biblioteca Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// As suas chaves de acesso ao projeto Supabase
const supabaseUrl = 'https://ikpnwedylgjvntovqrae.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrcG53ZWR5bGdqdm50b3ZxcmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2ODE4NjUsImV4cCI6MjA2ODI1Nzg2NX0.QcQB_zSTEf5Xz719IlMM7c6uPwiWGrjFLRAd0PO0ALY';

// Cria e exporta o cliente Supabase para ser usado em outros arquivos
export const supabase = createClient(supabaseUrl, supabaseKey);