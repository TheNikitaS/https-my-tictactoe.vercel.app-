const TOKEN_RE = /[0-9A-Za-zА-Яа-яЁё]+/g;
const VECTOR_SIZE = 384;
const LEGACY_INDEX_PATHS = [
  "../Ai%20bot%20Olesia/knowledge_store/client_4f72b4e7_7009_42f1_9699_279d7e8f3c3c.json",
  "../Ai%20bot%20Olesia/knowledge_store/client_cdba3bda_b208_4f20_8589_d787df8160be.json"
];

function tokenize(text) {
  return String(text || "").match(TOKEN_RE) || [];
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

  return [
    "Вот что нашёл по базе знаний компании и текущим данным платформы:",
    ...hints,
    ...bullets,
    "Если нужно, я могу дальше сузить ответ под конкретный модуль, заказ, материал или регламент."
  ].join("\n");
}

export function createDomovoyNeonik(options = {}) {
  const build = options.build || "latest";
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

    await ensureReady();

    const platformDocs = createIndexRows(buildPlatformContextDocs(context));
    const allRows = [...platformDocs, ...indexedDocs];
    const queryEmbedding = hashEmbedding(query);
    const scored = allRows
      .map((row) => ({
        ...row,
        score: cosineSimilarity(queryEmbedding, row.embedding)
      }))
      .filter((row) => row.score > 0.02)
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
      answer,
      sources,
      highlights
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
