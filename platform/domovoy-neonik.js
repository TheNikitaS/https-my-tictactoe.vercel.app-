const TOKEN_RE = /[0-9A-Za-zА-Яа-яЁё]+/g;
const VECTOR_SIZE = 384;
const LEGACY_INDEX_PATHS = [
  "../Ai%20bot%20Olesia/knowledge_store/client_4f72b4e7_7009_42f1_9699_279d7e8f3c3c.json",
  "../Ai%20bot%20Olesia/knowledge_store/client_cdba3bda_b208_4f20_8589_d787df8160be.json"
];

function tokenize(text) {
  return String(text || "").match(TOKEN_RE) || [];
}

function uniqueTokens(text) {
  return [...new Set(tokenize(String(text || "").toLowerCase()))];
}

function hashEmbedding(text) {
  const vector = new Array(VECTOR_SIZE).fill(0);
  tokenize(text.toLowerCase()).forEach((token) => {
    let hash = 0;
    for (let index = 0; index < token.length; index += 1) {
      hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
    }
    vector[hash % VECTOR_SIZE] += 1;
  });

  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

function cosineSimilarity(vectorA, vectorB) {
  let sum = 0;
  for (let index = 0; index < VECTOR_SIZE; index += 1) {
    sum += (vectorA[index] || 0) * (vectorB[index] || 0);
  }
  return sum;
}

function chunkText(text, chunkSize = 920, overlap = 120) {
  const source = String(text || "").trim();
  if (!source) return [];

  const chunks = [];
  const step = Math.max(chunkSize - overlap, 1);
  for (let start = 0; start < source.length; start += step) {
    const chunk = source.slice(start, start + chunkSize).trim();
    if (chunk.length >= 80) {
      chunks.push(chunk);
    }
  }
  return chunks;
}

function trimSnippet(text, query) {
  const source = String(text || "").replace(/\s+/g, " ").trim();
  if (!source) return "";

  const tokens = tokenize(query.toLowerCase()).slice(0, 6);
  const lower = source.toLowerCase();
  const hitToken = tokens.find((token) => lower.includes(token.toLowerCase()));
  if (!hitToken) return source.slice(0, 240).trim();

  const position = lower.indexOf(hitToken.toLowerCase());
  const start = Math.max(position - 90, 0);
  const end = Math.min(position + 210, source.length);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < source.length ? "…" : "";
  return `${prefix}${source.slice(start, end).trim()}${suffix}`;
}

function countTokenHits(queryTokens, text) {
  const haystack = String(text || "").toLowerCase();
  if (!haystack) return 0;
  return queryTokens.reduce((sum, token) => {
    if (!token || !haystack.includes(token)) return sum;
    return sum + (token.length >= 8 ? 1.35 : 1);
  }, 0);
}

function countPhraseHits(query, text) {
  const question = String(query || "").toLowerCase().trim();
  const haystack = String(text || "").toLowerCase();
  if (!question || !haystack) return 0;
  let hits = 0;
  if (question.length >= 8 && haystack.includes(question)) hits += 2;
  question
    .split(/[?!.,;:]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 10)
    .slice(0, 3)
    .forEach((phrase) => {
      if (haystack.includes(phrase)) hits += 1;
    });
  return hits;
}

function detectQueryIntent(query) {
  const lower = String(query || "").toLowerCase();
  const intents = {
    sales: ["продаж", "заказ", "счет", "счёт", "оплат", "клиент", "лид", "кп"],
    warehouse: ["склад", "остат", "товар", "материал", "закуп", "резерв", "артикул", "sku"],
    crm: ["crm", "сделк", "воронк", "контакт", "коммерческ"],
    tasks: ["задач", "итерац", "блокер", "срок", "спринт"],
    finance: ["деньг", "баланс", "платеж", "платёж", "расход", "приход", "финанс"],
    production: ["производ", "мастер", "этап", "техкарт", "сборк"]
  };
  let bestIntent = "general";
  let bestScore = 0;
  Object.entries(intents).forEach(([intent, keywords]) => {
    const score = keywords.reduce((sum, keyword) => sum + (lower.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  });
  return bestIntent;
}

function getKnowledgeSourceBoost(intent, row) {
  const haystack = `${row?.sourceLabel || ""} ${row?.title || ""} ${row?.url || ""}`.toLowerCase();
  if (!haystack) return 0;
  const boosts = {
    sales: ["продажи", "crm", "24lite"],
    warehouse: ["склад", "товар", "закуп", "domneon"],
    crm: ["crm", "сделк", "клиент"],
    tasks: ["тасктрекер", "задач"],
    finance: ["деньги", "баланс", "платеж", "платёж", "контур"],
    production: ["производ", "мастер", "сборк"]
  };
  const matches = (boosts[intent] || []).reduce((sum, token) => sum + (haystack.includes(token) ? 1 : 0), 0);
  return Math.min(matches * 0.035, 0.12);
}

function scoreKnowledgeRow(query, queryEmbedding, row) {
  const queryTokens = uniqueTokens(query);
  const text = `${row?.title || ""} ${row?.text || ""}`.toLowerCase();
  const title = String(row?.title || "").toLowerCase();
  const cosine = cosineSimilarity(queryEmbedding, row.embedding);
  const tokenHits = countTokenHits(queryTokens, text);
  const titleHits = countTokenHits(queryTokens, title);
  const lexicalScore = queryTokens.length ? Math.min(tokenHits / Math.max(queryTokens.length, 1), 1.4) : 0;
  const titleScore = queryTokens.length ? Math.min(titleHits / Math.max(queryTokens.length, 1), 1.4) : 0;
  const phraseScore = Math.min(countPhraseHits(query, text), 3) / 3;
  const sourceBoost = getKnowledgeSourceBoost(detectQueryIntent(query), row);
  return cosine * 0.56 + lexicalScore * 0.24 + titleScore * 0.1 + phraseScore * 0.08 + sourceBoost;
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function createIndexRows(documents) {
  return documents.flatMap((document) => {
    const chunks = chunkText(document.text);
    return chunks.map((chunk, chunkIndex) => ({
      id: `${document.id}_${chunkIndex}`,
      title: document.title,
      sourceLabel: document.sourceLabel,
      url: document.url,
      text: chunk,
      embedding: hashEmbedding(chunk)
    }));
  });
}

function buildPlatformContextDocs(context = {}) {
  const docs = [];
  const snapshot = context.snapshot || {};
  const profile = context.profile || {};
  const modules = Array.isArray(context.modules) ? context.modules : [];
  const documents = context.documents || {};

  docs.push({
    id: "platform_overview",
    title: "Платформа Дом Неона",
    sourceLabel: "Платформа",
    url: "platform://overview",
    text: `Платформа Дом Неона объединяет показатели, продажи, мой калькулятор, партнерский калькулятор, ДОМ НЕОНА, мессенджер, админ-панель, данные, CRM, склад, тасктрекер и Домового Неоника. Текущий пользователь: ${profile.displayName || "сотрудник"}. Роль: ${profile.role || "не указана"}. Доступные модули: ${modules.map((item) => item.title).join(", ") || "пока не определены"}.`
  });

  if (snapshot.sales) {
    docs.push({
      id: "platform_sales_snapshot",
      title: "Срез продаж платформы",
      sourceLabel: "Платформа • Продажи",
      url: "platform://sales",
      text: `Сейчас в платформе ${formatNumber(snapshot.sales.ordersCount)} заказов, ${formatNumber(snapshot.sales.unpaidInvoicesCount)} счетов без оплаты на сумму ${formatMoney(snapshot.sales.unpaidInvoicesAmount)}. За текущий месяц ${formatNumber(snapshot.sales.monthOrdersCount)} заказов и выручка ${formatMoney(snapshot.sales.monthRevenue)}.`
    });
  }

  if (snapshot.crm) {
    docs.push({
      id: "platform_crm_snapshot",
      title: "Срез CRM платформы",
      sourceLabel: "Платформа • CRM",
      url: "platform://crm",
      text: `В CRM сейчас ${formatNumber(snapshot.crm.dealsCount)} сделок, из них ${formatNumber(snapshot.crm.openDealsCount)} в работе. Активная воронка оценивается в ${formatMoney(snapshot.crm.pipelineAmount)}.`
    });
  }

  if (snapshot.warehouse) {
    docs.push({
      id: "platform_warehouse_snapshot",
      title: "Срез склада платформы",
      sourceLabel: "Платформа • Склад",
      url: "platform://warehouse",
      text: `На складе ${formatNumber(snapshot.warehouse.itemsCount)} позиций. В дефиците ${formatNumber(snapshot.warehouse.lowCount)} позиций, критичный спрос у ${formatNumber(snapshot.warehouse.criticalDemandCount)} SKU, отсутствующих позиций под спрос ${formatNumber(snapshot.warehouse.missingDemandCount)}.`
    });
  }

  if (snapshot.tasks) {
    docs.push({
      id: "platform_tasks_snapshot",
      title: "Срез задач платформы",
      sourceLabel: "Платформа • Тасктрекер",
      url: "platform://tasks",
      text: `В тасктрекере ${formatNumber(snapshot.tasks.totalCount)} задач, ${formatNumber(snapshot.tasks.openCount)} из них открыты, ${formatNumber(snapshot.tasks.blockedCount)} с блокером и ${formatNumber(snapshot.tasks.overdueCount)} просрочены.`
    });
  }

  if (documents.directories?.lists?.length) {
    const listsText = documents.directories.lists
      .slice(0, 10)
      .map((list) => `${list.title || list.key}: ${(list.options || []).slice(0, 8).join(", ")}`)
      .join(". ");
    docs.push({
      id: "platform_directories",
      title: "Справочники платформы",
      sourceLabel: "Платформа • Данные",
      url: "platform://directories",
      text: `В единых данных настроены справочники платформы. ${listsText}`
    });
  }

  if (documents.crm?.deals?.length) {
    const topDeals = documents.crm.deals
      .slice(0, 6)
      .map((deal) => `${deal.title || deal.client || "Сделка"}: стадия ${deal.stage || "не указана"}, сумма ${formatMoney(deal.amount || 0)}`)
      .join(". ");
    docs.push({
      id: "platform_crm_deals",
      title: "Примеры активных сделок",
      sourceLabel: "Платформа • CRM",
      url: "platform://crm",
      text: `Актуальные сделки в CRM: ${topDeals}`
    });
  }

  if (documents.warehouse?.items?.length) {
    const topItems = documents.warehouse.items
      .slice(0, 8)
      .map((item) => `${item.name || item.sku || "Позиция"}: доступно ${formatNumber(item.available || item.onHand || 0)}, резерв ${formatNumber(item.reserved || 0)}`)
      .join(". ");
    docs.push({
      id: "platform_warehouse_items",
      title: "Ключевые позиции склада",
      sourceLabel: "Платформа • Склад",
      url: "platform://warehouse",
      text: `Ключевые складские позиции и доступность: ${topItems}`
    });
  }

  if (documents.tasks?.tasks?.length) {
    const topTasks = documents.tasks.tasks
      .slice(0, 8)
      .map((task) => `${task.title || "Задача"}: статус ${task.status || "не указан"}, ответственный ${task.owner || "не назначен"}`)
      .join(". ");
    docs.push({
      id: "platform_tasks_list",
      title: "Текущие задачи платформы",
      sourceLabel: "Платформа • Тасктрекер",
      url: "platform://tasks",
      text: `Текущие задачи в платформе: ${topTasks}`
    });
  }

  return docs;
}

function buildQueryHints(question, matches, context) {
  const lower = String(question || "").toLowerCase();
  const snapshot = context.snapshot || {};
  const hints = [];

  if (/(счет|счёт|оплат|деньг|выручк|заказ)/.test(lower) && snapshot.sales) {
    hints.push(
      `По текущим данным платформы: ${formatNumber(snapshot.sales.unpaidInvoicesCount)} счетов без оплаты на ${formatMoney(snapshot.sales.unpaidInvoicesAmount)}, выручка месяца ${formatMoney(snapshot.sales.monthRevenue)}.`
    );
  }

  if (/(склад|остат|материал|товар|резерв|закуп)/.test(lower) && snapshot.warehouse) {
    hints.push(
      `По складу: ${formatNumber(snapshot.warehouse.itemsCount)} позиций, ${formatNumber(snapshot.warehouse.lowCount)} в дефиците, ${formatNumber(snapshot.warehouse.criticalDemandCount)} критичных SKU под спрос.`
    );
  }

  if (/(crm|сделк|лид|кп|клиент)/.test(lower) && snapshot.crm) {
    hints.push(
      `По CRM: ${formatNumber(snapshot.crm.openDealsCount)} активных сделок на сумму ${formatMoney(snapshot.crm.pipelineAmount)}.`
    );
  }

  if (/(задач|итерац|блокер|срок)/.test(lower) && snapshot.tasks) {
    hints.push(
      `По задачам: ${formatNumber(snapshot.tasks.openCount)} открытых, ${formatNumber(snapshot.tasks.blockedCount)} с блокером, ${formatNumber(snapshot.tasks.overdueCount)} просрочены.`
    );
  }

  if (!hints.length && matches[0]) {
    hints.push(`Самый релевантный источник сейчас: ${matches[0].sourceLabel}.`);
  }

  return hints;
}

function composeAnswer(question, matches, context) {
  if (!matches.length) {
    return [
      "Я пока не нашёл точного ответа в базе Дом Неона.",
      "Попробуйте уточнить формулировку: модуль платформы, тип заказа, страницу сайта, материал, оплату или конкретный процесс."
    ].join("\n\n");
  }

  const topMatches = [];
  const seenSources = new Set();
  matches.forEach((match) => {
    const key = `${match.sourceLabel}|${match.url}`;
    if (seenSources.has(key) || topMatches.length >= 3) return;
    seenSources.add(key);
    topMatches.push(match);
  });

  const hints = buildQueryHints(question, matches, context);
  const bullets = topMatches.map((match) => `- ${match.sourceLabel}: ${trimSnippet(match.text, question)}`);
  const leadingSnippet = trimSnippet(topMatches[0]?.text || "", question);
  let nextStep = "Если нужно, я могу дальше сузить ответ под конкретный модуль, заказ, материал или регламент.";
  if (topMatches.some((match) => /crm|сделк/i.test(`${match.sourceLabel} ${match.title}`))) {
    nextStep = "Если нужен следующий шаг по клиенту или сделке, откройте CRM и уточните стадию, срок или ответственного.";
  } else if (topMatches.some((match) => /склад|товар|закуп|материал/i.test(`${match.sourceLabel} ${match.title}`))) {
    nextStep = "Если нужно действие по материалам, откройте Склад и проверьте остаток, резерв или закупку.";
  } else if (topMatches.some((match) => /продаж|счет|счёт|заказ/i.test(`${match.sourceLabel} ${match.title}`))) {
    nextStep = "Если вопрос про заказ или оплату, откройте Продажи и уточните номер заказа, счет или статус.";
  } else if (topMatches.some((match) => /задач|итерац|спринт/i.test(`${match.sourceLabel} ${match.title}`))) {
    nextStep = "Если нужен контроль исполнения, откройте Тасктрекер и проверьте срок, блокер или ответственного.";
  }

  return [
    `Коротко: ${leadingSnippet || "подходящий фрагмент найден, но вопрос лучше уточнить."}`,
    hints.length ? `Что важно сейчас:\n${hints.map((item) => `- ${item}`).join("\n")}` : "",
    `На что я опираюсь:\n${bullets.join("\n")}`,
    `Что делать дальше: ${nextStep}`
  ]
    .filter(Boolean)
    .join("\n\n");

  return [
    "Вот что нашёл по базе знаний компании и текущим данным платформы:",
    ...hints,
    ...bullets,
    "Если нужно, я могу дальше сузить ответ под конкретный модуль, заказ, материал или регламент."
  ].join("\n");
}

function normalizeApiBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function createDomovoyNeonik(options = {}) {
  const build = options.build || "latest";
  const getApiBaseUrl = typeof options.getApiBaseUrl === "function" ? options.getApiBaseUrl : () => "";
  const getAccessToken = typeof options.getAccessToken === "function" ? options.getAccessToken : async () => "";
  let indexedDocs = [];
  let readyPromise = null;

  async function loadLegacyIndexes() {
    const results = await Promise.allSettled(
      LEGACY_INDEX_PATHS.map((path) =>
        fetch(`${path}?v=${encodeURIComponent(build)}`, {
          credentials: "same-origin",
          cache: "no-store"
        }).then((response) => {
          if (!response.ok) return [];
          return response.json();
        })
      )
    );

    return results.flatMap((result) => {
      if (result.status !== "fulfilled" || !Array.isArray(result.value)) return [];
      return result.value
        .filter((row) => row && typeof row === "object" && row.text && Array.isArray(row.embedding))
        .map((row, index) => ({
          id: `legacy_${index}_${row.id || row.url || "doc"}`,
          title: row.title || row.url || "Ai bot Olesia",
          sourceLabel: row.sourceLabel || "Ai bot Olesia",
          url: row.url || "platform://legacy",
          text: row.text,
          embedding: row.embedding
        }));
    });
  }

  async function ensureReady() {
    if (indexedDocs.length) return indexedDocs;
    if (!readyPromise) {
      readyPromise = fetch(`./knowledge/domovoy-docs.json?v=${encodeURIComponent(build)}`, {
        credentials: "same-origin",
        cache: "no-store"
      })
        .then((response) => {
          if (!response.ok) throw new Error("Не удалось загрузить базу знаний Домового Неоника.");
          return response.json();
        })
        .then(async (documents) => {
          const primaryDocs = createIndexRows(Array.isArray(documents) ? documents : []);
          const legacyDocs = await loadLegacyIndexes().catch(() => []);
          const seen = new Set();
          indexedDocs = [...primaryDocs, ...legacyDocs].filter((row) => {
            const key = `${row.url}|${String(row.text || "").slice(0, 180) || row.id}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          return indexedDocs;
        });
    }
    return readyPromise;
  }

  async function ask(question, context = {}) {
    const query = String(question || "").trim();
    if (!query) {
      return {
        answer: "Задайте вопрос: по платформе, модулю, процессу, товару, сайту 24lite.ru или domneon.ru.",
        sources: []
      };
    }

    const apiBaseUrl = normalizeApiBaseUrl(getApiBaseUrl());
    let remoteError = "";
    if (apiBaseUrl) {
      try {
        const accessToken = String((await getAccessToken()) || "").trim();
        const response = await fetch(`${apiBaseUrl}/api/domovoy/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
          },
          body: JSON.stringify({
            question: query,
            history: Array.isArray(context.history) ? context.history : [],
            context
          })
        });

        const payload = await parseJsonSafe(response);
        if (!response.ok) {
          remoteError = payload?.detail || payload?.message || `HTTP ${response.status}`;
        } else if (payload?.answer) {
          const highlights = Array.isArray(payload.highlights) && payload.highlights.length
            ? payload.highlights
            : tokenize(query)
                .slice(0, 5)
                .filter(Boolean)
                .reduce((acc, token) => {
                  if (!acc.some((item) => item.toLowerCase() === token.toLowerCase())) acc.push(token);
                  return acc;
                }, []);

          return {
            answer: payload.answer,
            sources: Array.isArray(payload.sources) ? payload.sources : [],
            highlights,
            mode: payload.mode || "server"
          };
        }
      } catch (error) {
        remoteError = error?.message || "не удалось обратиться к серверному ИИ";
      }
    }

    await ensureReady();

    const platformDocs = createIndexRows(buildPlatformContextDocs(context));
    const allRows = [...platformDocs, ...indexedDocs];
    const queryEmbedding = hashEmbedding(query);
    const scored = allRows
      .map((row) => ({
        ...row,
        score: scoreKnowledgeRow(query, queryEmbedding, row)
      }))
      .filter((row) => row.score > 0.065)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const answer = composeAnswer(query, scored, context);
    const sources = [];
    const seen = new Set();
    scored.forEach((row) => {
      const key = `${row.sourceLabel}|${row.url}`;
      if (seen.has(key) || sources.length >= 5) return;
      seen.add(key);
      sources.push({
        title: row.title,
        sourceLabel: row.sourceLabel,
        url: row.url,
        snippet: trimSnippet(row.text, query)
      });
    });

    const highlights = tokenize(query)
      .slice(0, 5)
      .filter(Boolean)
      .reduce((acc, token) => {
        if (!acc.some((item) => item.toLowerCase() === token.toLowerCase())) acc.push(token);
        return acc;
      }, []);

    return {
      answer: remoteError ? `${answer}\n\nСерверный ИИ сейчас недоступен, поэтому я ответил по резервной локальной базе знаний.` : answer,
      sources,
      highlights,
      mode: remoteError ? "local-fallback" : "local"
    };
  }

  function highlightText(text, tokens = []) {
    let result = String(text || "");
    tokens
      .filter((token) => token.length >= 3)
      .sort((left, right) => right.length - left.length)
      .forEach((token) => {
        result = result.replace(new RegExp(`(${escapeRegExp(token)})`, "gi"), "<mark>$1</mark>");
      });
    return result;
  }

  return {
    ensureReady,
    ask,
    highlightText
  };
}
