/**
 * aiAssistantService.ts
 * Motor de IA e Assistente Virtual do Site KIVORA
 * Suporta múltiplos provedores (Google Gemini, OpenAI, Groq, OpenRouter, Anthropic, Custom)
 * com persistência no Firestore, auto-detecção de chave e fallback semântico local.
 */

import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type AIAssistantProvider =
  | 'gemini'
  | 'openai'
  | 'groq'
  | 'openrouter'
  | 'anthropic'
  | 'custom';

export interface AIAssistantConfig {
  enabled: boolean;
  provider: AIAssistantProvider;
  apiKey: string;
  model: string;
  customEndpoint?: string;
  temperature?: number;
  welcomeMessage?: string;
  systemPrompt?: string;
  updated_at?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export const KIVORA_SYSTEM_KNOWLEDGE = `
És o Assistente Virtual Oficial do KIVORA ERP, desenvolvido pela equipa da Kivora em Luanda, Angola.
O teu tom de voz é profissional, cordial, seguro, executivo e acolhedor. Responde sempre em português de Angola / europeu com clareza.

CONHECIMENTO ESSENCIAL DO KIVORA ERP:
1. O QUE É O KIVORA:
   - É um software completo de faturação eletrónica e gestão empresarial desktop para Windows.
   - 100% Certificado pela Administração Geral Tributária (AGT) em conformidade com o Decreto Presidencial n.º 71/25.
   - Produz ficheiro SAF-T (AO) mensal 100% validado sem erros, faturas com QR Code AGT e assinatura digital com algoritmo RSA-SHA256.

2. FUNCIONAMENTO OFFLINE & REDE LOCAL:
   - A sua maior vantagem: O KIVORA funciona 100% OFFLINE com base de dados local rápida e segura.
   - Se a internet cair, a loja ou supermercado CONTINUA A VENDER normalmente sem interrupção.
   - Suporta múltiplos computadores em rede local (LAN) conectando caixas e armazéns em tempo real.
   - Sincroniza dados com a nuvem quando a ligação à internet é restabelecida.

3. MÓDULOS PRINCIPAIS:
   - Faturação Eletrónica AGT: Faturas, faturas-recibo, notas de crédito, guias de transporte.
   - POS / Ponto de Venda Rápido: Para retalho, supermercados, padarias e farmácias. Talões térmicos de 58mm e 80mm, fecho Z, abertura e fecho de turno de operador, ligação a gaveta de dinheiro.
   - Gestão de Stocks e Armazéns: Controlo de lotes, datas de validade, alertas de rutura, inventários periódicos e transferências entre filiais.
   - Recursos Humanos & Salários: Processamento salarial de acordo com a Lei Geral do Trabalho, tabelas oficiais de IRT 2026 e retenção de segurança social INSS (3% trabalhador, 8% entidade patronal).

4. TABELA OFICIAL DE PREÇOS (Kz - Kwanzas):
   - Plano Mensal: 25.000 Kz / mês (ideal para novos negócios).
   - Plano Semestral: 130.000 Kz / semestre.
   - Plano Anual: 250.000 Kz / ano (Mais popular, poupança de 17%).
   - Plano Vitalício (Licença Perpétua Pro): 1.500.000 Kz (Paga uma única vez, sem anuidades ou mensalidades de software).
   - Terminais Adicionais / Postos em Rede LAN: 35.000 Kz por posto extra.

5. PROGRAMA DE PARCEIROS & REVENDEDORES:
   - Técnicos de TI e empresas podem revender licenças Kivora com margens de lucro de 30% a 50%.
   - Vantagem exclusiva para novos parceiros: AS 2 PRIMEIRAS LICENÇAS SÃO A CRÉDITO (o parceiro só paga à Kivora depois de instalar e receber do cliente final).
   - A terceira licença exige a regularização prévia das anteriores ou recarga da carteira.
   - Suporte técnico prioritário de nível 2 e materiais oficiais de marketing.
   - Inscrição aberta na secção "Parceiros" do site.

6. CONTACTOS & LOCALIZAÇÃO:
   - WhatsApp / Telefone Comercial: +244 947 888 333
   - E-mail Oficial: suporte@kivora.ao / comercial@kivora.ao
   - Sede: Luanda, Angola.

DIRETRIZES DE RESPOSTA:
- Se o cliente perguntar sobre preços, cita os planos com valores em Kwanzas (Kz).
- Se perguntar sobre certificação da AGT, reforça com firmeza que é certificado pelo Decreto Presidencial 71/25.
- Se perguntar se precisa de internet, explica enfaticamente que funciona offline.
- Usa formatação Markdown com moderação (negrito, listas de tópicos) para tornar a leitura agradável.
- Mantém respostas diretas, úteis e com cerca de 2 a 4 parágrafos.
`.trim();

export const DEFAULT_AI_CONFIG: AIAssistantConfig = {
  enabled: true,
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  welcomeMessage:
    'Olá! Sou o Assistente Virtual do KIVORA ERP. Como posso ajudar o seu negócio hoje? Pode perguntar sobre certificação AGT, funcionamento offline, planos de preços ou o nosso programa de parceiros.',
  systemPrompt: KIVORA_SYSTEM_KNOWLEDGE,
  updated_at: Date.now(),
};

/**
 * Auto-detecta o provedor de IA a partir do formato da chave API
 */
export function detectAIProvider(key: string): {
  provider: AIAssistantProvider;
  defaultModel: string;
} {
  const clean = (key || '').trim();
  if (clean.startsWith('AIzaSy')) {
    return { provider: 'gemini', defaultModel: 'gemini-1.5-flash' };
  }
  if (clean.startsWith('gsk_')) {
    return { provider: 'groq', defaultModel: 'llama-3.3-70b-versatile' };
  }
  if (clean.startsWith('sk-or-')) {
    return { provider: 'openrouter', defaultModel: 'google/gemini-2.0-flash-exp:free' };
  }
  if (clean.startsWith('sk-ant-')) {
    return { provider: 'anthropic', defaultModel: 'claude-3-5-haiku-20241022' };
  }
  if (clean.startsWith('sk-proj-') || clean.startsWith('sk-')) {
    return { provider: 'openai', defaultModel: 'gpt-4o-mini' };
  }
  return { provider: 'custom', defaultModel: 'gpt-4o-mini' };
}

let cachedAIConfig: AIAssistantConfig = { ...DEFAULT_AI_CONFIG };

/**
 * Retorna a configuração em cache para uso síncrono inicial
 */
export function getCachedAIConfig(): AIAssistantConfig {
  return cachedAIConfig;
}

/**
 * Subscreve as configurações do assistente do Firestore (settings/ai_assistant)
 */
export function subscribeAIAssistantConfig(
  callback: (config: AIAssistantConfig) => void
): () => void {
  const docRef = doc(db, 'settings', 'ai_assistant');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<AIAssistantConfig>;
        cachedAIConfig = {
          ...DEFAULT_AI_CONFIG,
          ...data,
          systemPrompt: data.systemPrompt || KIVORA_SYSTEM_KNOWLEDGE,
        };
      } else {
        cachedAIConfig = { ...DEFAULT_AI_CONFIG };
      }
      callback(cachedAIConfig);
    },
    (err) => {
      console.warn('Erro ao subscrever definições de IA do Firestore:', err);
      callback(cachedAIConfig);
    }
  );
}

/**
 * Grava as configurações de IA no Firestore (apenas admin)
 */
export async function saveAIAssistantConfig(
  config: Partial<AIAssistantConfig>
): Promise<void> {
  const docRef = doc(db, 'settings', 'ai_assistant');
  const payload: AIAssistantConfig = {
    ...cachedAIConfig,
    ...config,
    updated_at: Date.now(),
  };
  await setDoc(docRef, payload, { merge: true });
  cachedAIConfig = payload;
}

/**
 * Testa a conexão com a API de IA configurada
 */
export async function testAIConnection(
  config: AIAssistantConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey?.trim()) {
    return { success: false, message: 'Por favor introduza uma chave API válida.' };
  }

  try {
    const testPrompt = 'Diga apenas: "Conexão com a Kivora IA bem-sucedida!"';
    const response = await callAIProvider(config, [
      { id: '1', role: 'user', content: testPrompt, timestamp: Date.now() },
    ]);

    if (response && response.length > 0) {
      return {
        success: true,
        message: `Sucesso (${config.provider} • ${config.model}): ${response.slice(0, 80)}...`,
      };
    }
    return { success: false, message: 'A API não retornou resposta.' };
  } catch (err: any) {
    return {
      success: false,
      message: `Erro na validação da API (${config.provider}): ${err.message || err}`,
    };
  }
}

/**
 * Executa a chamada HTTP para o provedor de IA adequado
 */
async function callAIProvider(
  config: AIAssistantConfig,
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = config.apiKey.trim();
  const provider = config.provider;
  const systemPrompt = config.systemPrompt || KIVORA_SYSTEM_KNOWLEDGE;

  // 1. GOOGLE GEMINI
  if (provider === 'gemini') {
    const model = config.model || 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `[INSTRUÇÃO DE SISTEMA]\n${systemPrompt}` }],
      },
      {
        role: 'model',
        parts: [{ text: 'Entendido. Estou pronto para atender os clientes da Kivora com rigor e cortesia.' }],
      },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP Gemini ${res.status}`);
    }

    const data = await res.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Não foi possível gerar a resposta.'
    );
  }

  // 2. OPENAI
  if (provider === 'openai') {
    const model = config.model || 'gpt-4o-mini';
    const url = 'https://api.openai.com/v1/chat/completions';

    const openAiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: openAiMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP OpenAI ${res.status}`);
    }

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      'Não foi possível gerar a resposta.'
    );
  }

  // 3. GROQ (Llama 3.3 70B)
  if (provider === 'groq') {
    const model = config.model || 'llama-3.3-70b-versatile';
    const url = 'https://api.groq.com/openai/v1/chat/completions';

    const groqMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP Groq ${res.status}`);
    }

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      'Não foi possível gerar a resposta.'
    );
  }

  // 4. OPENROUTER
  if (provider === 'openrouter') {
    const model = config.model || 'google/gemini-2.0-flash-exp:free';
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const orMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://kivora.ao',
        'X-Title': 'Kivora ERP Assistant',
      },
      body: JSON.stringify({
        model,
        messages: orMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP OpenRouter ${res.status}`);
    }

    const data = await res.json();
    return (
      data.choices?.[0]?.message?.content ||
      'Não foi possível gerar a resposta.'
    );
  }

  // 5. ANTHROPIC (Claude)
  if (provider === 'anthropic') {
    const model = config.model || 'claude-3-5-haiku-20241022';
    const url = 'https://api.anthropic.com/v1/messages';

    const claudeMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: claudeMessages,
        max_tokens: 600,
        temperature: config.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP Anthropic ${res.status}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || 'Não foi possível gerar a resposta.';
  }

  // 6. CUSTOM ENDPOINT (Compatível com OpenAI Spec)
  if (provider === 'custom') {
    const url = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
    const model = config.model || 'gpt-4o-mini';

    const customMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: customMessages,
        temperature: config.temperature ?? 0.7,
        max_tokens: 600,
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Erro HTTP Custom ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'Sem resposta do endpoint.';
  }

  throw new Error(`Provedor desconhecido: ${provider}`);
}

/**
 * MOTOR DE FALLBACK SEMÂNTICO LOCAL
 * Responde com inteligência mesmo quando nenhuma chave de IA estiver configurada
 */
export function getLocalKnowledgeResponse(userQuery: string): string {
  const q = userQuery.toLowerCase().trim();

  if (
    q.includes('preço') ||
    q.includes('preco') ||
    q.includes('quanto custa') ||
    q.includes('plano') ||
    q.includes('tabela') ||
    q.includes('valor') ||
    q.includes('vitalicio') ||
    q.includes('vitalício')
  ) {
    return `O **KIVORA ERP** disponibiliza planos transparentes em Kwanzas (Kz), sem taxas ocultas:

• **Plano Mensal:** 25.000 Kz / mês (ideal para começar)
• **Plano Semestral:** 130.000 Kz / semestre
• **Plano Anual:** 250.000 Kz / ano *(Recomendado: 17% de desconto)*
• **Plano Vitalício (Licença Perpétua Pro):** 1.500.000 Kz *(Paga uma única vez, sem qualquer mensalidade)*
• **Terminais Adicionais em Rede Local:** 35.000 Kz / posto extra

Todos os planos incluem suporte técnico e atualizações fiscais da AGT. Deseja agendar uma demonstração gratuita ou falar com o nosso consultor comercial?`;
  }

  if (
    q.includes('agt') ||
    q.includes('fiscal') ||
    q.includes('certifica') ||
    q.includes('saft') ||
    q.includes('saf-t') ||
    q.includes('decreto') ||
    q.includes('71/25') ||
    q.includes('qr code')
  ) {
    return `Sim! O **KIVORA ERP** é um software de faturação eletrónica **100% certificado pela Administração Geral Tributária (AGT)** em Angola, cumprindo escrupulosamente com o **Decreto Presidencial n.º 71/25**.

Garantias Fiscais:
• Assinatura digital criptográfica RSA-SHA256 em cada documento emitido;
• Impressão obrigatória de QR Code nos talões térmicos e faturas A4;
• Exportação mensal do ficheiro SAF-T (AO) sem rejeições ou incoerências;
• Tabelas atualizadas de IRT 2026 e retenções fiscais na fonte.

A sua empresa fica totalmente blindada contra coimas e fiscalizações.`;
  }

  if (
    q.includes('offline') ||
    q.includes('sem net') ||
    q.includes('sem internet') ||
    q.includes('caiu a net') ||
    q.includes('conexao') ||
    q.includes('conexão') ||
    q.includes('rede local') ||
    q.includes('lan')
  ) {
    return `Excelente pergunta! O **KIVORA ERP funciona 100% OFFLINE**.

Diferente de sistemas exclusivamente em nuvem que bloqueiam quando a internet falha, o Kivora armazena os dados numa base local ultrarrápida no seu computador:
• A sua equipa continua a emitir faturas e a passar artigos no POS sem interrupção;
• Vários computadores comunicam entre si via rede local (LAN), mesmo sem internet;
• Quando a ligação à internet é restabelecida, o sistema sincroniza os dados em segundo plano com a nuvem.`;
  }

  if (
    q.includes('parceiro') ||
    q.includes('revendedor') ||
    q.includes('revenda') ||
    q.includes('comissao') ||
    q.includes('comissão') ||
    q.includes('crédito') ||
    q.includes('credito') ||
    q.includes('candidatura')
  ) {
    return `O **Programa Oficial de Parceiros KIVORA** foi criado para técnicos de TI, empresas de consultoria e integradores em Angola:

• **Margens Lucrativas:** Obtenha entre 30% a 50% de margem na revenda de licenças;
• **Emissão a Crédito:** Novos parceiros Bronze contam com **as 2 primeiras licenças a crédito** (emita, instale no cliente e só pague depois de faturar);
• **Autonomia Total:** Painel exclusivo de parceiro para gerir clientes, emitir licenças e aceder a materiais de apoio;
• **Suporte Técnico Dedicado:** Atendimento direto com engenheiros de produto.

Para se candidatar, basta aceder à secção **"Parceiros"** no menu do site ou enviar a sua candidatura diretamente online!`;
  }

  if (
    q.includes('contato') ||
    q.includes('contacto') ||
    q.includes('whatsapp') ||
    q.includes('telefone') ||
    q.includes('suporte') ||
    q.includes('email') ||
    q.includes('onde fica') ||
    q.includes('luanda')
  ) {
    return `Pode entrar em contacto direto com a nossa equipa através dos seguintes canais:

• **WhatsApp / Linha Comercial:** +244 947 888 333
• **E-mail de Apoio ao Cliente:** suporte@kivora.ao
• **E-mail Comercial:** comercial@kivora.ao
• **Localização:** Luanda, Angola

Estamos disponíveis de segunda a sexta das 08h às 18h e sábados das 08h às 13h.`;
  }

  if (
    q.includes('download') ||
    q.includes('baixar') ||
    q.includes('instalar') ||
    q.includes('requisito') ||
    q.includes('windows')
  ) {
    return `O instalador do **KIVORA ERP** está disponível na secção **"Download"** do nosso site.

Requisitos Mínimos Recomendados:
• Sistema Operativo: Windows 10 ou Windows 11 (64-bit);
• Processador: Intel Core i3 / AMD equivalente ou superior;
• Memória RAM: Mínimo 4 GB (8 GB recomendado);
• Espaço em Disco: 500 MB livres (SSD recomendado para velocidade no POS);
• Compatível com impressoras térmicas ESC/POS (58mm/80mm), leitores de código de barras e gavetas de dinheiro RJ11.`;
  }

  if (
    q.includes('demonstra') ||
    q.includes('demo') ||
    q.includes('teste') ||
    q.includes('testar') ||
    q.includes('ver o sistema')
  ) {
    return `Pode agendar uma demonstração gratuita e personalizada do KIVORA ERP!

Os nossos consultores podem:
1. Apresentar o sistema em funcionamento real no seu setor (retalho, armazém, serviços ou restauração);
2. Esclarecer dúvidas sobre a migração de dados do seu sistema antigo;
3. Ajudar a configurar a sua empresa para a certificação da AGT.

Basta clicar no botão **"Solicitar Demonstração"** no topo da página ou escrever para o nosso WhatsApp (+244 947 888 333).`;
  }

  // Resposta padrão caso nenhuma intenção específica coincida
  return `O **KIVORA ERP** é a solução definitiva em Angola para faturação eletrónica certificada pela AGT (Decreto 71/25), ponto de venda (POS), controlo rigoroso de stocks e processamento de salários com IRT 2026.

Funciona **100% offline**, com preços acessíveis a partir de **25.000 Kz/mês** ou licença perpétua vitalícia.

Como posso orientar melhor o seu negócio? Pode perguntar sobre:
• Tabela de preços e planos;
• Garantias de certificação fiscal da AGT;
• Como funciona o sistema offline;
• Programa de revendedores e parceiros com licenças a crédito;
• Agendamento de demonstração gratuita.`;
}

/**
 * Envia mensagem para o Assistente Virtual
 * Usa a API configurada (Gemini, OpenAI, Groq, etc.) ou o fallback semântico local caso não haja chave ativa.
 */
export async function sendChatMessage(
  history: ChatMessage[],
  userText: string
): Promise<string> {
  const config = getCachedAIConfig();

  // Se o assistente estiver desligado no admin
  if (config.enabled === false) {
    return 'O assistente virtual encontra-se temporariamente em manutenção. Por favor fale connosco pelo WhatsApp +244 947 888 333.';
  }

  // Se houver chave API válida, tenta chamar a IA
  if (config.apiKey && config.apiKey.trim().length > 5) {
    try {
      const messagesToSend: ChatMessage[] = [
        ...history,
        { id: 'user_last', role: 'user', content: userText, timestamp: Date.now() },
      ];
      return await callAIProvider(config, messagesToSend);
    } catch (err: any) {
      console.warn(
        'Erro na API externa de IA. Acionando motor de conhecimento local Kivora:',
        err
      );
      // Fallback transparente sem travar a experiência do usuário
      return getLocalKnowledgeResponse(userText);
    }
  }

  // Fallback local semântico inteligente
  return getLocalKnowledgeResponse(userText);
}
