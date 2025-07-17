import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

console.log("Função de limpeza iniciada");

serve(async (_req) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    console.log(`Data limite para limpeza: ${sixMonthsAgo.toISOString()}`);

    const { data: oldHolerites, error: selectError } = await supabaseAdmin
      .from('holerites')
      .select('id, pdf_path')
      .lt('uploaded_at', sixMonthsAgo.toISOString()) 
      .not('pdf_path', 'is', null); 

    if (selectError) {
      console.error('Erro ao buscar holerites antigos:', selectError);
      throw selectError;
    }

    if (!oldHolerites || oldHolerites.length === 0) {
      const message = "Nenhum arquivo com mais de 6 meses encontrado para limpar.";
      console.log(message);
      return new Response(JSON.stringify({ message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    console.log(`Encontrados ${oldHolerites.length} arquivos para limpar.`);

    const pathsToDelete = oldHolerites.map(h => h.pdf_path);
    const idsToUpdate = oldHolerites.map(h => h.id);
    console.log("Caminhos para deletar:", pathsToDelete);

    const { error: storageError } = await supabaseAdmin.storage
      .from('holerites') 
      .remove(pathsToDelete);

    if (storageError) {
      console.error('Erro ao deletar arquivos do Storage:', storageError);
      throw storageError;
    }
    console.log("Arquivos deletados do Storage com sucesso.");
    const { error: updateError } = await supabaseAdmin
      .from('holerites')
      .update({ pdf_path: null })
      .in('id', idsToUpdate);

    if (updateError) {
      console.error('Erro ao atualizar os registros no banco:', updateError);
      throw updateError;
    }
    console.log("Registros do banco de dados atualizados com sucesso.");
    
    const successMessage = `Sucesso! ${pathsToDelete.length} arquivos foram limpos do sistema.`;
    return new Response(JSON.stringify({ message: successMessage }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro geral na execução da função de limpeza:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});