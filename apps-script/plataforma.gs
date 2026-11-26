/**
 * Plataforma DesIn: entrega as abas da planilha ao servidor da Vercel.
 *
 * Fica no MESMO projeto do Apps Script que já escreve na planilha (DesIn, em script.google.com),
 * como um arquivo a mais: Arquivos > + > Script > nome "plataforma". Não altera o desin.gs.
 *
 * A planilha continua privada. Só quem envia a chave secreta (guardada nas propriedades
 * do script e na Vercel) recebe os dados. Passo a passo no README da plataforma.
 *
 * Todos os nomes começam com PLATAFORMA_ / plataforma para não colidir com o desin.gs,
 * já que os arquivos de um mesmo projeto compartilham o mesmo escopo.
 */

// Abas que a plataforma pode ler. Qualquer outra (ex.: registro_horas) é recusada.
const PLATAFORMA_ABAS = ['roadmap', 'scripts', 'project_docs', 'testes_beta', 'correcoes_linear'];

function doPost(e) {
  try {
    const pedido = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const props = PropertiesService.getScriptProperties();
    const chave = props.getProperty('PLATAFORMA_CHAVE');

    if (!chave || chave.length < 32 || !plataformaIguais(String(pedido.chave || ''), chave)) {
      return plataformaResposta({ erro: 'nao_autorizado' });
    }
    if (PLATAFORMA_ABAS.indexOf(pedido.aba) === -1) {
      return plataformaResposta({ erro: 'aba_invalida' });
    }

    // Usa o ID da propriedade PLATAFORMA_PLANILHA_ID; se não houver, o mesmo do desin.gs.
    const planilhaId =
      props.getProperty('PLATAFORMA_PLANILHA_ID') ||
      (typeof PLANILHA_ID !== 'undefined' ? PLANILHA_ID : '');
    const aba = SpreadsheetApp.openById(planilhaId).getSheetByName(pedido.aba);
    if (!aba) return plataformaResposta({ erro: 'aba_inexistente' });

    const linhas = aba.getLastRow() === 0 ? [] : aba.getDataRange().getDisplayValues();
    return plataformaResposta({ linhas: linhas });
  } catch (erro) {
    console.error(erro);
    return plataformaResposta({ erro: 'falha_interna' });
  }
}

/** Sem doGet: abrir a URL no navegador não mostra nada. */
function doGet() {
  return plataformaResposta({ erro: 'metodo_nao_permitido' });
}

function plataformaResposta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

/** Compara as chaves pelo HMAC, para o tempo de resposta não revelar nada sobre a chave. */
function plataformaIguais(a, b) {
  const ha = Utilities.computeHmacSha256Signature(a, b);
  const hb = Utilities.computeHmacSha256Signature(b, b);
  let diferenca = 0;
  for (let i = 0; i < ha.length; i++) diferenca |= ha[i] ^ hb[i];
  return diferenca === 0;
}

/**
 * Rode uma vez pelo editor (menu ao lado de Executar > plataformaGerarChave).
 * Gera a chave secreta, guarda nas propriedades do script e mostra no log
 * para você copiar para a Vercel (variável APPS_SCRIPT_KEY).
 */
function plataformaGerarChave() {
  const bytes = [];
  for (let i = 0; i < 4; i++) {
    bytes.push(...Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Math.random()));
  }
  const chave = Utilities.base64EncodeWebSafe(bytes).replace(/=+$/, '').slice(0, 64);
  PropertiesService.getScriptProperties().setProperty('PLATAFORMA_CHAVE', chave);
  console.log('Copie para a Vercel (APPS_SCRIPT_KEY): ' + chave);
}
