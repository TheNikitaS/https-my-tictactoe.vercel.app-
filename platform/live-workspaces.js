import { evaluateSafeFormula } from "./shared/safe-formula.js";

const LIVE_MODULE_CONFIG = {
  directories: {
    appId: "platform_directories_v1",
    intro:
      "Единые справочники платформы: каналы, сотрудники, категории, единицы измерения и любые ваши выпадающие списки.",
    links: ["crm", "warehouse", "tasks", "light2"]
  },
  crm: {
    appId: "platform_crm_v2",
    legacyAppId: "platform_crm_v1",
    intro:
      "Живой коммерческий контур: сделки, ответственные, сроки, суммы, каналы и собственные вкладки-представления без двойного ввода.",
    links: ["sales", "light2", "tasks"]
  },
  warehouse: {
    appId: "platform_warehouse_v2",
    legacyAppId: "platform_warehouse_v1",
    intro:
      "Единый складской контур: каталог материалов, движения, резервы, дефицит и гибкая настройка собственных полей под ваш формат учета.",
    links: ["light2", "my_calculator", "crm"]
  },
  tasks: {
    appId: "platform_tasks_v2",
    legacyAppId: "platform_tasks_v1",
    intro:
      "Рабочая доска команды: задачи, итерации, сроки, блокеры и кастомные колонки для вашей операционной модели.",
    links: ["crm", "messenger", "ai"]
  }
};

const LIVE_MODULE_CANONICAL_MAP = {
  products: "warehouse",
  purchases: "warehouse",
  money: "warehouse",
  production: "warehouse"
};

const LIVE_MODULE_FORCED_MODE = {
  products: "products",
  purchases: "purchases",
  money: "finance",
  production: "production"
};

function resolveLiveModuleKey(moduleKey) {
  return LIVE_MODULE_CANONICAL_MAP[moduleKey] || moduleKey;
}

function resolveLiveModuleMode(moduleKey) {
  return LIVE_MODULE_FORCED_MODE[moduleKey] || "";
}

const CRM_STAGES = [
  { key: "lead", label: "Новый лид", tone: "neutral" },
  { key: "qualified", label: "Квалификация", tone: "info" },
  { key: "quote", label: "КП / счет", tone: "accent" },
  { key: "production", label: "В производстве", tone: "warning" },
  { key: "done", label: "Сделка закрыта", tone: "success" },
  { key: "lost", label: "Потеряно", tone: "danger" }
];

const WAREHOUSE_MOVEMENT_TYPES = [
  { key: "in", label: "Приход" },
  { key: "out", label: "Списание" },
  { key: "reserve", label: "Резерв" },
  { key: "release", label: "Снятие резерва" }
];

const WAREHOUSE_PURCHASE_STATUSES = [
  { key: "draft", label: "Черновик", tone: "neutral" },
  { key: "ordered", label: "Заказано", tone: "accent" },
  { key: "in_transit", label: "В пути", tone: "warning" },
  { key: "received", label: "Принято", tone: "success" },
  { key: "cancelled", label: "Отменено", tone: "danger" }
];

const FINANCE_ENTRY_KINDS = [
  { key: "income", label: "Приход", tone: "success" },
  { key: "expense", label: "Расход", tone: "danger" },
  { key: "transfer", label: "Перемещение", tone: "accent" }
];

const PRODUCTION_JOB_STATUSES = [
  { key: "queue", label: "Очередь", tone: "neutral" },
  { key: "prep", label: "Подготовка", tone: "info" },
  { key: "in_work", label: "В работе", tone: "accent" },
  { key: "qa", label: "Контроль", tone: "warning" },
  { key: "done", label: "Готово", tone: "success" },
  { key: "paused", label: "Пауза", tone: "danger" }
];

const TASK_STATUSES = [
  { key: "backlog", label: "Очередь", tone: "neutral" },
  { key: "todo", label: "К запуску", tone: "accent" },
  { key: "in_progress", label: "В работе", tone: "info" },
  { key: "review", label: "Проверка", tone: "warning" },
  { key: "done", label: "Готово", tone: "success" }
];

const TASK_PRIORITIES = [
  { key: "low", label: "Низкий" },
  { key: "medium", label: "Средний" },
  { key: "high", label: "Высокий" },
  { key: "urgent", label: "Срочный" }
];

const CUSTOM_FIELD_TYPES = [
  { key: "text", label: "Текст" },
  { key: "textarea", label: "Большой текст" },
  { key: "number", label: "Число" },
  { key: "date", label: "Дата" },
  { key: "select", label: "Список" },
  { key: "checkbox", label: "Да / нет" }
];

const FORMULA_FORMATS = [
  { key: "number", label: "Число" },
  { key: "money", label: "Деньги" },
  { key: "percent", label: "Проценты" },
  { key: "text", label: "Текст" }
];

const BUILDER_META = {
  crm: {
    entityLabel: "сделка",
    defaultViewLabel: "Все сделки",
    baseFields: [
      { key: "title", label: "Сделка", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "client", label: "Клиент", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "channel", label: "Канал", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "owner", label: "Ответственный", type: "text", showInForm: true, showInTable: true, showInCard: false },
      {
        key: "stage",
        label: "Стадия",
        type: "select",
        options: CRM_STAGES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: false
      },
      { key: "amount", label: "Сумма", type: "number", showInForm: true, showInTable: true, showInCard: true },
      { key: "deadline", label: "Срок", type: "date", showInForm: true, showInTable: true, showInCard: false },
      { key: "note", label: "Комментарий", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  },
  warehouse: {
    entityLabel: "позиция",
    defaultViewLabel: "Все позиции",
    baseFields: [
      { key: "name", label: "Позиция", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "sku", label: "SKU", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "category", label: "Категория", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "unit", label: "Ед. изм.", type: "text", showInForm: true, showInTable: false, showInCard: false },
      { key: "openingStock", label: "Стартовый остаток", type: "number", showInForm: true, showInTable: false, showInCard: false },
      { key: "minStock", label: "Минимум", type: "number", showInForm: true, showInTable: true, showInCard: false },
      { key: "available", label: "Доступно", type: "number", showInForm: false, showInTable: true, showInCard: true },
      { key: "reserved", label: "Резерв", type: "number", showInForm: false, showInTable: true, showInCard: false },
      { key: "note", label: "Комментарий", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  },
  tasks: {
    entityLabel: "задача",
    defaultViewLabel: "Все задачи",
    baseFields: [
      { key: "title", label: "Задача", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "owner", label: "Ответственный", type: "text", showInForm: true, showInTable: true, showInCard: false },
      {
        key: "status",
        label: "Статус",
        type: "select",
        options: TASK_STATUSES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: false
      },
      {
        key: "priority",
        label: "Приоритет",
        type: "select",
        options: TASK_PRIORITIES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: true
      },
      { key: "sprintId", label: "Итерация", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "dueDate", label: "Срок", type: "date", showInForm: true, showInTable: true, showInCard: false },
      { key: "blocked", label: "Есть блокер", type: "checkbox", showInForm: true, showInTable: true, showInCard: true },
      { key: "note", label: "Комментарий", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  }
};

const MODULE_MODE_CONFIG = {
  directories: [
    { key: "overview", label: "Обзор" },
    { key: "lists", label: "Справочники" }
  ],
  crm: [
    { key: "overview", label: "Обзор" },
    { key: "board", label: "Воронка" },
    { key: "table", label: "Таблица" },
    { key: "form", label: "Карточка" }
  ],
  warehouse: [
    { key: "overview", label: "Обзор" },
    { key: "catalog", label: "Остатки" },
    { key: "products", label: "Товары" },
    { key: "purchases", label: "Закупки" },
    { key: "finance", label: "Деньги" },
    { key: "production", label: "Производство" },
    { key: "movements", label: "Движения" },
    { key: "form", label: "Формы" }
  ],
  products: [
    { key: "overview", label: "Обзор" },
    { key: "products", label: "Товары" }
  ],
  purchases: [
    { key: "overview", label: "Обзор" },
    { key: "purchases", label: "Закупки" }
  ],
  money: [
    { key: "overview", label: "Обзор" },
    { key: "finance", label: "Деньги" }
  ],
  production: [
    { key: "overview", label: "Обзор" },
    { key: "production", label: "Производство" }
  ],
  tasks: [
    { key: "overview", label: "Обзор" },
    { key: "board", label: "Канбан" },
    { key: "table", label: "Лента" },
    { key: "form", label: "Формы" }
  ]
};

if (Array.isArray(MODULE_MODE_CONFIG.warehouse) && !MODULE_MODE_CONFIG.warehouse.some((item) => item.key === "history")) {
  MODULE_MODE_CONFIG.warehouse.splice(2, 0, { key: "history", label: "История" });
}

const LIVE_UI_STORAGE_PREFIX = "dom-neona:live-ui";
const LIVE_DRAFT_STORAGE_PREFIX = "dom-neona:live-draft";
const EXTERNAL_SHARED_APPS = {
  sales: "sales-tracker",
  myCalculator: "moy-calculator",
  partnerCalculatorsPattern: "part-calculator%",
  light2Metrics: "platform_light2_metrics_v1"
};

const LIGHT2_METRIC_SUMMARY_META = {
  revenue: { aggregate: "sum" },
  cost: { aggregate: "sum" },
  gross_profit: { aggregate: "sum" },
  operating_expenses: { aggregate: "sum" },
  operating_profit: { aggregate: "sum" },
  taxes: { aggregate: "sum" },
  net_profit: { aggregate: "sum" },
  average_check: { aggregate: "last" },
  sales: { aggregate: "sum" },
  warehouse: { aggregate: "last" },
  tbu_money: { aggregate: "last" },
  margin: { aggregate: "last" },
  product_profitability: { aggregate: "last" },
  business_profitability: { aggregate: "last" },
  custom_money: { aggregate: "sum" },
  custom_number: { aggregate: "sum" },
  custom_percent: { aggregate: "last" }
};

function normalizeLight2MetricMonthKey(value) {
  const source = compactText(value);
  if (/^\d{4}-\d{2}$/.test(source)) return source;
  return "";
}

function normalizeLight2MetricsDoc(payload) {
  const entries = Array.isArray(payload?.entries) ? payload.entries : [];
  return entries
    .map((entry, index) => ({
      id: compactText(entry?.id) || `metric-${index + 1}`,
      monthKey: normalizeLight2MetricMonthKey(entry?.monthKey),
      category: compactText(entry?.category) || "revenue",
      label: String(entry?.label || "").trim(),
      amount: toNumber(entry?.amount),
      updatedAt: compactText(entry?.updatedAt)
    }))
    .filter((entry) => entry.monthKey && entry.label);
}

function buildLight2MetricsSummary(payload) {
  const entries = normalizeLight2MetricsDoc(payload);
  const months = Array.from(new Set(entries.map((entry) => entry.monthKey))).sort();
  const latestMonthKey = months.at(-1) || "";
  const latestEntries = latestMonthKey ? entries.filter((entry) => entry.monthKey === latestMonthKey) : [];
  const totals = {};

  Object.keys(LIGHT2_METRIC_SUMMARY_META).forEach((key) => {
    const rows = latestEntries.filter((entry) => entry.category === key);
    if (!rows.length) {
      totals[key] = 0;
      return;
    }
    const aggregate = LIGHT2_METRIC_SUMMARY_META[key]?.aggregate || "sum";
    totals[key] = aggregate === "last" ? toNumber(rows.at(-1)?.amount) : roundMoney(sumBy(rows, (entry) => entry.amount));
  });

  return {
    entriesCount: entries.length,
    monthCount: months.length,
    latestMonthKey,
    totals
  };
}

const DEFAULT_DIRECTORY_LISTS = [
  {
    id: "crm_channels",
    key: "crm_channels",
    title: "Каналы CRM",
    description: "Источники лидов и заказов.",
    options: ["Авито", "Сайт", "Наш клиент", "VK", "Сообщество", "Рекомендации"]
  },
  {
    id: "team_members",
    key: "team_members",
    title: "Сотрудники",
    description: "Менеджеры, дизайнеры, мастера и ответственные.",
    options: ["Никита Сухотин"]
  },
  {
    id: "warehouse_categories",
    key: "warehouse_categories",
    title: "Категории склада",
    description: "Группы товаров и материалов.",
    options: ["Неон", "Блоки питания", "Профиль", "Крепеж", "Расходники"]
  },
  {
    id: "warehouse_units",
    key: "warehouse_units",
    title: "Единицы измерения",
    description: "Единицы для каталога товаров и материалов.",
    options: ["шт", "м", "компл", "упак"]
  },
  {
    id: "suppliers",
    key: "suppliers",
    title: "Поставщики",
    description: "Контрагенты для закупок, товаров и денежных операций.",
    options: ["ООО ЛАЙТ", "Основной поставщик"]
  },
  {
    id: "product_groups",
    key: "product_groups",
    title: "Группы товаров",
    description: "Категории товарного каталога для продажи и производства.",
    options: ["Вывески", "Неон", "Комплектующие", "Услуги"]
  },
  {
    id: "finance_accounts",
    key: "finance_accounts",
    title: "Счета и кассы",
    description: "Куда приходят и откуда уходят деньги.",
    options: ["Основной счет", "Касса", "Карта", "Партнерский счет"]
  },
  {
    id: "finance_categories",
    key: "finance_categories",
    title: "Статьи денег",
    description: "Статьи приходов, расходов и перемещений.",
    options: ["Продажа", "Закупка", "Зарплата", "Доставка", "Налоги", "Перемещение"]
  },
  {
    id: "production_stages",
    key: "production_stages",
    title: "Этапы производства",
    description: "Статусы и этапы производственных задач.",
    options: ["Очередь", "Подготовка", "В работе", "Контроль", "Готово", "Пауза"]
  }
];

const moneyFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

function deepClone(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function readStoredJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return deepClone(fallback);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : deepClone(fallback);
  } catch {
    return deepClone(fallback);
  }
}

function writeStoredJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value ?? null));
  } catch {
    // Ignore storage failures in private browsing modes.
  }
}

function removeStoredValue(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures in private browsing modes.
  }
}

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value ?? "").trim().replace(/\s+/g, "").replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function todayString() {
  const date = new Date();
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeDateInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const year = Number(value.slice(0, 4));
    return year >= 2000 && year <= 2100 ? value.slice(0, 10) : "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  if (year < 2000 || year > 2100) return "";
  return `${year}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDate(value) {
  const normalized = normalizeDateInput(value);
  if (!normalized) return "—";
  const [year, month, day] = normalized.split("-");
  return `${day}.${month}.${year}`;
}

function formatMoney(value) {
  return moneyFormatter.format(toNumber(value));
}

function formatNumber(value) {
  return numberFormatter.format(toNumber(value));
}

function sumBy(list, mapper) {
  return (list || []).reduce((total, item) => total + toNumber(mapper(item)), 0);
}

function compactText(value) {
  return String(value || "").trim();
}

function matchesSearch(haystack, needle) {
  if (!needle) return true;
  return String(haystack || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

function sortByDateDesc(items, field) {
  return [...(items || [])].sort((a, b) => {
    const left = new Date(a?.[field] || a?.updatedAt || a?.createdAt || 0).getTime();
    const right = new Date(b?.[field] || b?.updatedAt || b?.createdAt || 0).getTime();
    return right - left;
  });
}

function getCrmStageMeta(stageKey) {
  return CRM_STAGES.find((stage) => stage.key === stageKey) || CRM_STAGES[0];
}

function getTaskStatusMeta(statusKey) {
  return TASK_STATUSES.find((status) => status.key === statusKey) || TASK_STATUSES[0];
}

function getPriorityLabel(priorityKey) {
  return TASK_PRIORITIES.find((item) => item.key === priorityKey)?.label || "Средний";
}

function sanitizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_а-яё-]+/gi, "_")
    .replace(/-+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseSelectOptions(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDefaultFilters(moduleKey) {
  const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
  if (canonicalModuleKey === "directories") return { search: "" };
  if (canonicalModuleKey === "crm") return { search: "", stage: "all", owner: "all" };
  if (canonicalModuleKey === "warehouse") return { search: "", category: "all" };
  return { search: "", status: "all", sprint: "all", owner: "all" };
}

function createDefaultView(moduleKey) {
  const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
  return {
    id: "default",
    label: BUILDER_META[canonicalModuleKey].defaultViewLabel,
    filters: getDefaultFilters(canonicalModuleKey)
  };
}

function normalizeFieldDefinition(moduleKey, field) {
  const type = CUSTOM_FIELD_TYPES.some((item) => item.key === field?.type) ? field.type : "text";
  const key = sanitizeKey(field?.key || field?.id);
  if (!key) return null;
  return {
    id: key,
    key,
    label: compactText(field?.label) || key,
    type,
    options: type === "select" ? parseSelectOptions(field?.options || (field?.options || []).join(",")) : [],
    showInForm: field?.showInForm !== false,
    showInTable: field?.showInTable !== false,
    showInCard: Boolean(field?.showInCard)
  };
}

function normalizeFormulaDefinition(formula) {
  const key = sanitizeKey(formula?.key || formula?.id);
  if (!key) return null;
  return {
    id: key,
    key,
    label: compactText(formula?.label) || key,
    expression: compactText(formula?.expression),
    format: FORMULA_FORMATS.some((item) => item.key === formula?.format) ? formula.format : "number"
  };
}

function normalizeViewDefinition(moduleKey, view) {
  const key = sanitizeKey(view?.id || view?.key || view?.label);
  if (!key || key === "default") return null;
  return {
    id: key,
    label: compactText(view?.label) || key,
    filters: { ...getDefaultFilters(moduleKey), ...(view?.filters && typeof view.filters === "object" ? view.filters : {}) }
  };
}

function normalizeBuilderSchema(moduleKey, builder) {
  const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
  const fields = Array.isArray(builder?.fields)
    ? builder.fields.map((field) => normalizeFieldDefinition(canonicalModuleKey, field)).filter(Boolean)
    : [];
  const formulas = Array.isArray(builder?.formulas)
    ? builder.formulas.map((formula) => normalizeFormulaDefinition(formula)).filter(Boolean)
    : [];
  const defaultView = createDefaultView(canonicalModuleKey);
  const customViews = Array.isArray(builder?.views)
    ? builder.views.map((view) => normalizeViewDefinition(canonicalModuleKey, view)).filter(Boolean)
    : [];

  return {
    views: [defaultView, ...customViews.filter((view, index, list) => list.findIndex((item) => item.id === view.id) === index)],
    fields: fields.filter((field, index, list) => list.findIndex((item) => item.key === field.key) === index),
    formulas: formulas.filter((formula, index, list) => list.findIndex((item) => item.key === formula.key) === index)
  };
}

function createDefaultCrmDoc() {
  return { version: 2, builder: normalizeBuilderSchema("crm", null), deals: [], updatedAt: new Date().toISOString() };
}

function normalizeDirectoryList(list, index = 0) {
  const key = sanitizeKey(list?.key || list?.id || list?.title || `directory_${index + 1}`);
  if (!key) return null;
  const options = Array.isArray(list?.options)
    ? list.options.map((option) => compactText(option)).filter(Boolean)
    : parseSelectOptions(list?.options);
  return {
    id: compactText(list?.id) || key,
    key,
    title: compactText(list?.title) || key,
    description: compactText(list?.description),
    options: [...new Set(options)]
  };
}

function createDefaultDirectoriesDoc() {
  return {
    version: 1,
    lists: DEFAULT_DIRECTORY_LISTS.map((list, index) => normalizeDirectoryList(list, index)).filter(Boolean),
    updatedAt: new Date().toISOString()
  };
}

function createDefaultWarehouseDoc() {
  return {
    version: 3,
    builder: normalizeBuilderSchema("warehouse", null),
    items: [],
    movements: [],
    products: [],
    purchases: [],
    financeEntries: [],
    productionJobs: [],
    updatedAt: new Date().toISOString()
  };
}

function createDefaultTasksDoc() {
  return { version: 2, builder: normalizeBuilderSchema("tasks", null), sprints: [], tasks: [], updatedAt: new Date().toISOString() };
}

function normalizeCrmDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultCrmDoc();
  next.builder = normalizeBuilderSchema("crm", next.builder);
  next.deals = Array.isArray(next.deals) ? next.deals.map((deal) => ({ ...deal, custom: deal?.custom && typeof deal.custom === "object" ? deal.custom : {} })) : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeDirectoriesDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultDirectoriesDoc();
  const baseLists = createDefaultDirectoriesDoc().lists || [];
  const incomingLists = Array.isArray(next.lists) ? next.lists : [];
  const merged = [...incomingLists, ...baseLists].map((list, index) => normalizeDirectoryList(list, index)).filter(Boolean);
  next.lists = merged.filter((list, index, collection) => collection.findIndex((item) => item.key === list.key) === index);
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeWarehouseDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultWarehouseDoc();
  next.builder = normalizeBuilderSchema("warehouse", next.builder);
  next.items = Array.isArray(next.items) ? next.items.map((item) => ({ ...item, custom: item?.custom && typeof item.custom === "object" ? item.custom : {} })) : [];
  next.movements = Array.isArray(next.movements) ? next.movements : [];
  next.products = Array.isArray(next.products)
    ? next.products.map((item) => ({ ...item, custom: item?.custom && typeof item.custom === "object" ? item.custom : {} }))
    : [];
  next.purchases = Array.isArray(next.purchases) ? next.purchases : [];
  next.financeEntries = Array.isArray(next.financeEntries) ? next.financeEntries : [];
  next.productionJobs = Array.isArray(next.productionJobs) ? next.productionJobs : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeTasksDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultTasksDoc();
  next.builder = normalizeBuilderSchema("tasks", next.builder);
  next.sprints = Array.isArray(next.sprints) ? next.sprints : [];
  next.tasks = Array.isArray(next.tasks)
    ? next.tasks.map((task) => ({
        ...task,
        custom: task?.custom && typeof task.custom === "object" ? task.custom : {},
        history: Array.isArray(task?.history)
          ? task.history
              .map((entry) => normalizeTaskHistoryEntry(entry))
              .filter(Boolean)
          : []
      }))
    : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeTaskHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const date = compactText(entry.date || entry.createdAt || "");
  const title = compactText(entry.title || entry.label || "");
  if (!date && !title) return null;
  return {
    id: compactText(entry.id || ""),
    date: date || new Date().toISOString(),
    title: title || "Событие задачи",
    meta: compactText(entry.meta || entry.description || ""),
    tone: ["neutral", "success", "warning", "danger", "info", "accent"].includes(entry.tone) ? entry.tone : "neutral",
    moduleKey: compactText(entry.moduleKey || "tasks") || "tasks",
    entityId: compactText(entry.entityId || "")
  };
}

function createTaskHistoryEntry({ title, meta = "", tone = "neutral", moduleKey = "tasks", entityId = "", date = new Date().toISOString() }) {
  return normalizeTaskHistoryEntry({
    id: createId("taskevt"),
    date,
    title,
    meta,
    tone,
    moduleKey,
    entityId
  });
}

function appendTaskHistory(task, ...entries) {
  const history = Array.isArray(task?.history)
    ? task.history.map((entry) => normalizeTaskHistoryEntry(entry)).filter(Boolean)
    : [];
  entries.flat().forEach((entry) => {
    const normalized = normalizeTaskHistoryEntry(entry);
    if (normalized) history.push(normalized);
  });
  return sortByDateDesc(history, "date").slice(0, 80);
}

function buildTaskChangeMeta(previous, next, sprintOptions = []) {
  if (!previous) return "Карточка заведена в рабочем контуре.";
  const sprintMap = new Map((sprintOptions || []).map((sprint) => [compactText(sprint.id), compactText(sprint.title)]));
  const changes = [];

  if (compactText(previous.title) !== compactText(next.title)) changes.push("название");
  if (compactText(previous.owner) !== compactText(next.owner)) changes.push("ответственный");
  if (compactText(previous.status) !== compactText(next.status)) {
    changes.push(`статус: ${getTaskStatusMeta(previous.status).label} -> ${getTaskStatusMeta(next.status).label}`);
  }
  if (compactText(previous.priority) !== compactText(next.priority)) {
    changes.push(`приоритет: ${getPriorityLabel(previous.priority)} -> ${getPriorityLabel(next.priority)}`);
  }
  if (compactText(previous.sprintId) !== compactText(next.sprintId)) {
    const before = sprintMap.get(compactText(previous.sprintId)) || "без итерации";
    const after = sprintMap.get(compactText(next.sprintId)) || "без итерации";
    changes.push(`итерация: ${before} -> ${after}`);
  }
  if (normalizeDateInput(previous.dueDate) !== normalizeDateInput(next.dueDate)) {
    changes.push(`срок: ${formatDate(previous.dueDate)} -> ${formatDate(next.dueDate)}`);
  }
  if (Boolean(previous.blocked) !== Boolean(next.blocked)) {
    changes.push(next.blocked ? "добавлен блокер" : "блокер снят");
  }
  if (compactText(previous.note) !== compactText(next.note)) changes.push("комментарий");
  if (JSON.stringify(previous.custom || {}) !== JSON.stringify(next.custom || {})) changes.push("кастомные поля");

  return changes.length ? changes.join(" • ") : "Обновлены детали карточки.";
}

function getTaskSourceLabel(context) {
  if (!context) return "Ручная задача";
  if (context.type === "crm" || context.type === "crm-signal") return "CRM";
  if (context.type === "warehouse" || context.type === "warehouse-signal") return "Склад";
  if (context.type === "sales-signal") return "Продажи";
  return "Связанный контур";
}

function getCustomFields(moduleKey, doc) {
  return doc?.builder?.fields || [];
}

function getVisibleCustomFields(moduleKey, doc, flag) {
  return getCustomFields(moduleKey, doc).filter((field) => Boolean(field?.[flag]));
}

function getRecordValue(record, key) {
  if (!record) return "";
  if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
  return record.custom && typeof record.custom === "object" ? record.custom[key] : "";
}

function formatFieldValue(field, rawValue) {
  if (field?.type === "number") return formatNumber(rawValue || 0);
  if (field?.type === "date") return formatDate(rawValue);
  if (field?.type === "checkbox") return rawValue ? "Да" : "Нет";
  return compactText(rawValue) || "—";
}

function renderCustomFieldInput(escapeHtml, field, value) {
  const name = `custom:${field.key}`;
  const options = field.options || [];

  if (field.type === "textarea") {
    return `<label><span>${escapeHtml(field.label)}</span><textarea class="form-control" name="${escapeHtml(name)}" rows="3">${escapeHtml(String(value || ""))}</textarea></label>`;
  }
  if (field.type === "number") {
    return `<label><span>${escapeHtml(field.label)}</span><input class="form-control" type="number" step="0.01" name="${escapeHtml(name)}" value="${escapeHtml(String(value ?? ""))}" /></label>`;
  }
  if (field.type === "date") {
    return `<label><span>${escapeHtml(field.label)}</span><input class="form-control" type="date" name="${escapeHtml(name)}" value="${escapeHtml(normalizeDateInput(value || ""))}" /></label>`;
  }
  if (field.type === "checkbox") {
    return `<label class="permission-flag"><input class="form-check-input" type="checkbox" name="${escapeHtml(name)}" ${value ? "checked" : ""} /><span>${escapeHtml(field.label)}</span></label>`;
  }
  if (field.type === "select") {
    return `<label><span>${escapeHtml(field.label)}</span><select class="form-select" name="${escapeHtml(name)}"><option value="">Не выбрано</option>${options.map((option) => `<option value="${escapeHtml(option)}" ${String(value || "") === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }
  return `<label><span>${escapeHtml(field.label)}</span><input class="form-control" type="text" name="${escapeHtml(name)}" value="${escapeHtml(String(value || ""))}" /></label>`;
}

function renderCustomFieldSection(moduleKey, doc, record, escapeHtml) {
  const fields = getVisibleCustomFields(moduleKey, doc, "showInForm");
  if (!fields.length) return "";
  return `
    <div class="workspace-custom-block">
      <div class="workspace-custom-block__head">
        <strong>Настраиваемые поля</strong>
        <span>Добавляются через конструктор раздела</span>
      </div>
      <div class="workspace-custom-grid">
        ${fields.map((field) => renderCustomFieldInput(escapeHtml, field, getRecordValue(record, field.key))).join("")}
      </div>
    </div>
  `;
}

function renderCustomCardSection(moduleKey, doc, record, escapeHtml) {
  const items = getVisibleCustomFields(moduleKey, doc, "showInCard")
    .map((field) => ({ field, value: getRecordValue(record, field.key) }))
    .filter(({ value }) => value !== "" && value !== null && value !== undefined && value !== false);
  if (!items.length) return "";
  return `<div class="workspace-custom-pills">${items.map(({ field, value }) => `<span class="workspace-data-pill"><small>${escapeHtml(field.label)}</small><strong>${escapeHtml(formatFieldValue(field, value))}</strong></span>`).join("")}</div>`;
}

function renderCustomTableHeader(moduleKey, doc, escapeHtml) {
  return getVisibleCustomFields(moduleKey, doc, "showInTable")
    .map((field) => `<th>${escapeHtml(field.label)}</th>`)
    .join("");
}

function renderCustomTableCells(moduleKey, doc, record, escapeHtml) {
  return getVisibleCustomFields(moduleKey, doc, "showInTable")
    .map((field) => `<td>${escapeHtml(formatFieldValue(field, getRecordValue(record, field.key)))}</td>`)
    .join("");
}

function readCustomValuesFromForm(moduleKey, doc, formData, existingCustom = {}) {
  const custom = { ...(existingCustom || {}) };
  getCustomFields(moduleKey, doc).forEach((field) => {
    const name = `custom:${field.key}`;
    if (field.type === "checkbox") {
      custom[field.key] = formData.get(name) === "on";
      return;
    }
    if (field.type === "number") {
      custom[field.key] = toNumber(formData.get(name));
      return;
    }
    if (field.type === "date") {
      custom[field.key] = normalizeDateInput(formData.get(name));
      return;
    }
    custom[field.key] = compactText(formData.get(name));
  });
  return custom;
}

function getViewList(moduleKey, doc) {
  return doc?.builder?.views || [createDefaultView(moduleKey)];
}

function getFormulaHelpers(records) {
  const values = (key) => records.map((record) => getRecordValue(record, key));
  const count = () => records.length;
  const countWhere = (key, expected) =>
    records.filter((record) => String(getRecordValue(record, key) ?? "") === String(expected ?? "")).length;
  const sum = (key) => sumBy(records, (record) => getRecordValue(record, key));
  const avg = (key) => (records.length ? sum(key) / records.length : 0);
  const min = (key) => {
    const numbers = values(key).map((value) => toNumber(value)).filter((value) => Number.isFinite(value));
    return numbers.length ? Math.min(...numbers) : 0;
  };
  const max = (key) => {
    const numbers = values(key).map((value) => toNumber(value)).filter((value) => Number.isFinite(value));
    return numbers.length ? Math.max(...numbers) : 0;
  };
  const percent = (part, total) => (toNumber(total) ? (toNumber(part) / toNumber(total)) * 100 : 0);
  return { values, count, countWhere, sum, avg, min, max, percent, today: todayString() };
}

function formatFormulaValue(format, value) {
  if (format === "money") return formatMoney(value);
  if (format === "percent") return `${toNumber(value).toFixed(2)}%`;
  if (format === "text") return String(value ?? "—");
  return formatNumber(value);
}

function getFormulaMetrics(moduleKey, doc, records) {
  const formulas = doc?.builder?.formulas || [];
  if (!formulas.length) return [];
  const helpers = getFormulaHelpers(records);
  return formulas.map((formula) => {
    try {
      const value = evaluateSafeFormula(formula.expression || "0", {
        variables: {
          records,
          helpers,
          today: helpers.today
        },
        functions: {
          values: helpers.values,
          count: helpers.count,
          countWhere: helpers.countWhere,
          sum: helpers.sum,
          avg: helpers.avg,
          min: helpers.min,
          max: helpers.max,
          percent: helpers.percent,
          abs: Math.abs,
          round: Math.round,
          ceil: Math.ceil,
          floor: Math.floor,
          minOf: Math.min,
          maxOf: Math.max
        }
      });
      return { label: formula.label, value: formatFormulaValue(formula.format, value), caption: "Формула конструктора" };
    } catch (error) {
      return { label: formula.label, value: "Ошибка", caption: error.message || "Формула не рассчиталась" };
    }
  });
}

function renderViewTabs(moduleKey, doc, uiState, escapeHtml) {
  const views = getViewList(moduleKey, doc);
  return `
    <div class="workspace-view-tabs">
      ${views
        .map(
          (view) => `
            <button class="workspace-view-tab ${uiState.activeViewId === view.id ? "active" : ""}" type="button" data-builder-view="${escapeHtml(view.id)}">
              ${escapeHtml(view.label)}
            </button>
          `
        )
        .join("")}
      ${uiState.activeViewId === "adhoc" ? '<span class="workspace-view-tab workspace-view-tab--ghost">Текущий фильтр</span>' : ""}
    </div>
  `;
}

function renderBuilderPanel(moduleKey, doc, uiState, escapeHtml) {
  const builderModuleKey = resolveLiveModuleKey(moduleKey);
  const meta = BUILDER_META[builderModuleKey];
  const customFields = getCustomFields(builderModuleKey, doc);
  const formulas = doc?.builder?.formulas || [];
  const views = getViewList(builderModuleKey, doc).filter((view) => view.id !== "default");

  return `
    <section class="workspace-panel workspace-builder ${uiState.configOpen ? "" : "d-none"}">
      <div class="panel-heading">
        <div class="workspace-hero__copy">
          <h4>Конструктор раздела</h4>
          <div class="compact-help">Собирайте собственные вкладки, поля и KPI без отдельной разработки базы.</div>
        </div>
      </div>
      <div class="builder-grid">
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>Вкладки-представления</strong>
            <span>Сохраняют текущие фильтры как отдельную вкладку.</span>
          </div>
          <form class="builder-form" data-builder-action="view">
            <input class="form-control" type="text" name="label" placeholder="Например: Срочные сделки" required />
            <button class="btn btn-dark btn-sm" type="submit">Сохранить вкладку</button>
          </form>
          <div class="builder-list">
            ${
              views.length
                ? views
                    .map(
                      (view) => `
                        <div class="builder-list-item">
                          <div>
                            <strong>${escapeHtml(view.label)}</strong>
                            <span>${escapeHtml(JSON.stringify(view.filters))}</span>
                          </div>
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-view-delete="${escapeHtml(view.id)}">Удалить</button>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Дополнительных вкладок пока нет.</div>'
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>Настраиваемые поля</strong>
            <span>Поля можно выводить в форму, таблицу и карточку отдельно.</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="field">
            <div class="workspace-form-grid">
              <label><span>Ключ поля</span><input class="form-control" type="text" name="key" placeholder="client_city" required /></label>
              <label><span>Подпись</span><input class="form-control" type="text" name="label" placeholder="Город клиента" required /></label>
              <label><span>Тип</span><select class="form-select" name="type">${CUSTOM_FIELD_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label>
              <label><span>Опции списка</span><input class="form-control" type="text" name="options" placeholder="В работе, На паузе, Архив" /></label>
            </div>
            <div class="builder-checks">
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInForm" checked /><span>Показывать в форме</span></label>
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInTable" checked /><span>Показывать в таблице</span></label>
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInCard" /><span>Показывать в карточке</span></label>
            </div>
            <button class="btn btn-dark btn-sm" type="submit">Добавить поле</button>
          </form>
          <div class="builder-list">
            ${
              customFields.length
                ? customFields
                    .map(
                      (field) => `
                        <div class="builder-list-item">
                          <div>
                            <strong>${escapeHtml(field.label)}</strong>
                            <span>${escapeHtml(field.key)} • ${escapeHtml(field.type)}</span>
                          </div>
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-field-delete="${escapeHtml(field.key)}">Удалить</button>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="workspace-empty workspace-empty--tight">Пока используются только базовые поля ${escapeHtml(meta.entityLabel)}.</div>`
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>Формулы и KPI</strong>
            <span>Формулы считают показатели по текущему набору данных.</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="formula">
            <div class="workspace-form-grid">
              <label><span>Ключ</span><input class="form-control" type="text" name="key" placeholder="pipeline_margin" required /></label>
              <label><span>Название</span><input class="form-control" type="text" name="label" placeholder="Маржа в воронке" required /></label>
              <label><span>Формат</span><select class="form-select" name="format">${FORMULA_FORMATS.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label>
            </div>
            <label><span>Формула</span><input class="form-control" type="text" name="expression" placeholder='Например: sum("amount") / Math.max(count(), 1)' required /></label>
            <div class="compact-help">Доступные функции: <code>count()</code>, <code>countWhere("field","value")</code>, <code>sum("field")</code>, <code>avg("field")</code>, <code>min("field")</code>, <code>max("field")</code>, <code>percent(a,b)</code>.</div>
            <button class="btn btn-dark btn-sm" type="submit">Добавить формулу</button>
          </form>
          <div class="builder-list">
            ${
              formulas.length
                ? formulas
                    .map(
                      (formula) => `
                        <div class="builder-list-item">
                          <div>
                            <strong>${escapeHtml(formula.label)}</strong>
                            <span>${escapeHtml(formula.expression)}</span>
                          </div>
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-formula-delete="${escapeHtml(formula.key)}">Удалить</button>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Формулы пока не добавлены.</div>'
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>JSON-схема раздела</strong>
            <span>Для максимально гибкой настройки можно править views, fields и formulas целиком одним JSON.</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="schema">
            <label>
              <span>Схема конструктора</span>
              <textarea class="form-control" name="schema" rows="18">${escapeHtml(
                JSON.stringify(
                  {
                    views: (doc.builder?.views || []).filter((view) => view.id !== "default"),
                    fields: doc.builder?.fields || [],
                    formulas: doc.builder?.formulas || []
                  },
                  null,
                  2
                )
              )}</textarea>
            </label>
            <div class="compact-help">Поддерживаются три массива: <code>views</code>, <code>fields</code>, <code>formulas</code>. После сохранения схема нормализуется автоматически.</div>
            <button class="btn btn-dark btn-sm" type="submit">Сохранить JSON-схему</button>
          </form>
        </article>
      </div>
    </section>
  `;
}

export function createLiveWorkspaceController({
  supabase,
  setStatus,
  escapeHtml,
  hasModulePermission,
  hasModuleAccess,
  getPermissionBadgeLabel,
  getModuleStageLabel,
  modules,
  rerenderCurrentModule,
  rerenderDashboard,
  schemaReadyProvider
}) {
  const docs = { directories: null, crm: null, warehouse: null, tasks: null };
  const externalDocs = {
    sales: null,
    myCalculator: null,
    partnerCalculators: null,
    light2Metrics: null
  };

  function getModuleUiKey(moduleKey) {
    return `${LIVE_UI_STORAGE_PREFIX}:${resolveLiveModuleKey(moduleKey)}`;
  }

  function getDraftKey(moduleKey, formKey) {
    return `${LIVE_DRAFT_STORAGE_PREFIX}:${resolveLiveModuleKey(moduleKey)}:${formKey}`;
  }

  function hydrateUiState(moduleKey, defaults) {
    return { ...defaults, ...readStoredJson(getModuleUiKey(moduleKey), {}) };
  }

  function persistUiState(moduleKey) {
    const stateKey = resolveLiveModuleKey(moduleKey);
    if (!supports(stateKey)) return;
    const state = ui[stateKey] || {};
    const payload = {};
    Object.keys(state).forEach((key) => {
      if (key.endsWith("Id")) return;
      payload[key] = state[key];
    });
    writeStoredJson(getModuleUiKey(stateKey), payload);
  }

  function readDraft(moduleKey, formKey) {
    return readStoredJson(getDraftKey(moduleKey, formKey), {});
  }

  function writeDraft(moduleKey, formKey, draft) {
    writeStoredJson(getDraftKey(moduleKey, formKey), draft);
  }

  function clearDraft(moduleKey, formKey) {
    removeStoredValue(getDraftKey(moduleKey, formKey));
  }

  function serializeFormDraft(form) {
    const payload = {};
    Array.from(form.elements || []).forEach((field) => {
      if (!field || !field.name || field.disabled || field.type === "hidden") return;
      if (field.type === "checkbox") {
        payload[field.name] = Boolean(field.checked);
        return;
      }
      payload[field.name] = field.value ?? "";
    });
    return payload;
  }

  function draftValue(primaryValue, fallbackDraftValue) {
    const primaryText = compactText(primaryValue);
    if (primaryText) return primaryValue;
    if (typeof primaryValue === "number" && Number.isFinite(primaryValue)) return primaryValue;
    return fallbackDraftValue ?? "";
  }

  function modeIs(uiState, ...modes) {
    const current = uiState?.mode || "overview";
    return modes.includes(current);
  }

function buildModeTabs(moduleKey, escapeFn) {
    const uiState = ui[resolveLiveModuleKey(moduleKey)] || ui[moduleKey];
    const options = MODULE_MODE_CONFIG[moduleKey] || MODULE_MODE_CONFIG[resolveLiveModuleKey(moduleKey)] || [];
    return `
      <div class="workspace-mode-tabs" role="tablist" aria-label="Режимы раздела">
        ${options
          .map(
            (option) => `
              <button class="workspace-mode-tab ${uiState.mode === option.key ? "active" : ""}" type="button" data-live-mode="${escapeFn(option.key)}">
                ${escapeFn(option.label)}
              </button>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderActionBar(moduleKey, actions, escapeFn) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    const uiState = ui[canonicalModuleKey] || ui[moduleKey] || {};
    const modeOptions = MODULE_MODE_CONFIG[moduleKey] || MODULE_MODE_CONFIG[canonicalModuleKey] || [];
    const activeModeLabel = modeOptions.find((item) => item.key === uiState.mode)?.label || "Обзор";
    const activeViewLabel = uiState.activeViewId === "adhoc" ? "Текущий фильтр" : "Сохраненный";
    return `
      <div class="workspace-command-bar">
        <div class="workspace-command-bar__meta">
          <span class="workspace-command-chip">Режим: ${escapeFn(activeModeLabel)}</span>
          <span class="workspace-command-chip">Вид: ${escapeFn(activeViewLabel)}</span>
        </div>
        <div class="workspace-command-bar__actions">
          ${actions.join("")}
        </div>
      </div>
    `;
  }

  function renderDraftBadge(moduleKey, formKey) {
    const draft = readDraft(moduleKey, formKey);
    if (!draft || !Object.keys(draft).length) return "";
    return '<div class="workspace-inline-hint">Есть черновик. Он уже подставлен в форму и не потеряется после обновления страницы.</div>';
  }

  async function exportModuleData(moduleKey) {
    const doc = await ensureDocument(moduleKey);
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${moduleKey}-${todayString()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("JSON выгружен.", "success");
  }

  async function importModuleData(moduleKey) {
    const raw = window.prompt("Вставьте JSON экспорт этого раздела целиком.");
    if (!raw) return;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`JSON не распознан: ${error.message || "ошибка синтаксиса"}`);
    }
    await saveDocument(moduleKey, parsed, "JSON раздела импортирован.");
    await rerenderCurrentModule();
  }

  function duplicateTitle(value) {
    return compactText(value) ? `${compactText(value)} копия` : "Копия";
  }

  const ui = {
    directories: hydrateUiState("directories", { search: "", activeListId: "crm_channels", activeViewId: "default", mode: "overview", modal: "" }),
    crm: hydrateUiState("crm", { search: "", stage: "all", owner: "all", editId: null, activeViewId: "default", configOpen: false, mode: "overview", modal: "" }),
    warehouse: hydrateUiState("warehouse", {
      search: "",
      category: "all",
      itemEditId: null,
      movementItemId: "",
      productEditId: null,
      purchaseEditId: null,
      financeEditId: null,
      productionEditId: null,
      activeViewId: "default",
      configOpen: false,
      mode: "overview",
      modal: ""
    }),
    tasks: hydrateUiState("tasks", { search: "", status: "all", sprint: "all", owner: "all", taskEditId: null, sprintEditId: null, activeViewId: "default", configOpen: false, mode: "overview", modal: "" })
  };
  ui.products = ui.warehouse;
  ui.purchases = ui.warehouse;
  ui.money = ui.warehouse;
  ui.production = ui.warehouse;

  const docFactories = {
    directories: createDefaultDirectoriesDoc,
    crm: createDefaultCrmDoc,
    warehouse: createDefaultWarehouseDoc,
    tasks: createDefaultTasksDoc
  };

  const docNormalizers = {
    directories: normalizeDirectoriesDoc,
    crm: normalizeCrmDoc,
    warehouse: normalizeWarehouseDoc,
    tasks: normalizeTasksDoc
  };

  function supports(moduleKey) {
    return Boolean(LIVE_MODULE_CONFIG[resolveLiveModuleKey(moduleKey)]);
  }

  function schemaReady() {
    return typeof schemaReadyProvider === "function" ? Boolean(schemaReadyProvider()) : true;
  }

  async function ensureDocument(moduleKey, force = false) {
    const stateKey = resolveLiveModuleKey(moduleKey);
    if (!supports(stateKey)) return null;
    if (docs[stateKey] && !force) return docs[stateKey];

    if (!schemaReady()) {
      docs[stateKey] = docFactories[stateKey]();
      return docs[stateKey];
    }

    const config = LIVE_MODULE_CONFIG[stateKey];
    const appIds = [config.appId, config.legacyAppId].filter(Boolean);
    let payload = null;

    for (const appId of appIds) {
      const { data, error } = await supabase
        .from("shared_app_states")
        .select("app_id, payload")
        .eq("app_id", appId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      if (data?.payload) {
        payload = data.payload;
        break;
      }
    }

    docs[stateKey] = docNormalizers[stateKey](payload);
    return docs[stateKey];
  }

  async function saveDocument(moduleKey, payload, successMessage = "") {
    const stateKey = resolveLiveModuleKey(moduleKey);
    const nextDoc = docNormalizers[stateKey](payload);
    nextDoc.updatedAt = new Date().toISOString();
    docs[stateKey] = nextDoc;

    if (!schemaReady()) {
      if (successMessage) setStatus(successMessage, "success");
      rerenderDashboard();
      return nextDoc;
    }

    const appId = LIVE_MODULE_CONFIG[stateKey].appId;
    const { data, error } = await supabase.from("shared_app_states").select("app_id").eq("app_id", appId).maybeSingle();
    if (error && error.code !== "PGRST116") throw error;

    if (data?.app_id) {
      const { error: updateError } = await supabase.from("shared_app_states").update({ payload: nextDoc }).eq("app_id", appId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("shared_app_states").insert({ app_id: appId, payload: nextDoc });
      if (insertError) throw insertError;
    }

    if (successMessage) setStatus(successMessage, "success");
    rerenderDashboard();
    return nextDoc;
  }

  async function fetchSharedPayload(appId) {
    if (!schemaReady()) return null;
    const { data, error } = await supabase.from("shared_app_states").select("app_id, payload, updated_at").eq("app_id", appId).maybeSingle();
    if (error && error.code !== "PGRST116") throw error;
    return data || null;
  }

  async function fetchSharedPayloadsByLike(pattern) {
    if (!schemaReady()) return [];
    const { data, error } = await supabase.from("shared_app_states").select("app_id, payload, updated_at").like("app_id", pattern).order("app_id", { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }

  async function ensureExternalDoc(key, force = false) {
    if (!force && externalDocs[key] !== null) return externalDocs[key];
    if (key === "sales") {
      externalDocs.sales = await fetchSharedPayload(EXTERNAL_SHARED_APPS.sales);
      return externalDocs.sales;
    }
    if (key === "myCalculator") {
      externalDocs.myCalculator = await fetchSharedPayload(EXTERNAL_SHARED_APPS.myCalculator);
      return externalDocs.myCalculator;
    }
    if (key === "partnerCalculators") {
      externalDocs.partnerCalculators = await fetchSharedPayloadsByLike(EXTERNAL_SHARED_APPS.partnerCalculatorsPattern);
      return externalDocs.partnerCalculators;
    }
    if (key === "light2Metrics") {
      externalDocs.light2Metrics = await fetchSharedPayload(EXTERNAL_SHARED_APPS.light2Metrics);
      return externalDocs.light2Metrics;
    }
    return null;
  }

  function getDirectoriesDoc() {
    return docs.directories || createDefaultDirectoriesDoc();
  }

  function getDirectoryList(listKey) {
    const normalizedKey = sanitizeKey(listKey);
    if (!normalizedKey) return null;
    return (getDirectoriesDoc().lists || []).find((list) => list.key === normalizedKey || list.id === normalizedKey) || null;
  }

  function getDirectoryOptions(listKey) {
    return getDirectoryList(listKey)?.options || [];
  }

  function normalizeSalesOrder(order) {
    const cells = Array.isArray(order?.cells) ? order.cells : [];
    return {
      sourceId: compactText(order?.id) || createId("sales"),
      rowId: compactText(order?.id),
      orderNumber: compactText(cells[0]),
      title: compactText(cells[1]),
      status: compactText(cells[2]),
      createdAt: normalizeDateInput(cells[3]),
      amount: toNumber(cells[4]),
      paidAmount: toNumber(cells[5]),
      client: compactText(cells[6]),
      phone: compactText(cells[7]),
      city: compactText(cells[8]),
      manager: compactText(cells[11]),
      designer: compactText(cells[15]),
      assembler: compactText(cells[18]),
      installer: compactText(cells[21]),
      leadChannel: compactText(cells[23]),
      salesChannel: compactText(cells[24]),
      category: compactText(cells[25]),
      invoiceDate: normalizeDateInput(cells[32]),
      paidDate: normalizeDateInput(cells[33]),
      productionStart: normalizeDateInput(cells[36]),
      productionEnd: normalizeDateInput(cells[37]),
      deliveryDate: normalizeDateInput(cells[39]),
      hidden: Boolean(order?.hidden),
      assemblyTeam: Array.isArray(order?.assemblyTeam) ? order.assemblyTeam : []
    };
  }

  function deriveSalesDealStage(order) {
    const status = compactText(order.status).toLowerCase();
    if (status.includes("отмен")) return "lost";
    if (status.includes("готов")) return "done";
    if (order.productionStart || order.productionEnd || order.paidDate) return "production";
    if (order.invoiceDate) return "quote";
    return "lead";
  }

  function getSalesSourceKey(order) {
    return `sales:${compactText(order.sourceId || order.orderNumber || order.title)}`;
  }

  function buildSalesSnapshot(payloadRecord) {
    const payload = payloadRecord?.payload && typeof payloadRecord.payload === "object" ? payloadRecord.payload : {};
    const orders = (Array.isArray(payload.orders) ? payload.orders : [])
      .map((order) => normalizeSalesOrder(order))
      .filter((order) => !order.hidden && (order.orderNumber || order.title || order.client));
    const unpaidInvoices = orders.filter((order) => order.invoiceDate && !order.paidDate);
    const productionOrders = orders.filter((order) => deriveSalesDealStage(order) === "production");
    const doneOrders = orders.filter((order) => deriveSalesDealStage(order) === "done");
    const leadChannels = new Map();
    orders.forEach((order) => {
      const key = compactText(order.leadChannel || order.salesChannel || "Без канала");
      leadChannels.set(key, (leadChannels.get(key) || 0) + 1);
    });
    return {
      updatedAt: payloadRecord?.updated_at || "",
      orders: sortByDateDesc(orders, "createdAt"),
      unpaidInvoices,
      productionOrders,
      doneOrders,
      channels: [...leadChannels.entries()].sort((left, right) => right[1] - left[1]).map(([label, count]) => ({ label, count }))
    };
  }

  function getCalculatorLabel(appId) {
    if (appId === EXTERNAL_SHARED_APPS.myCalculator) return "Мой калькулятор";
    if (appId === "part-calculator") return "Партнерский калькулятор";
    if (appId.startsWith("part-calculator:")) return `Партнер: ${appId.split(":")[1] || "без имени"}`;
    return appId;
  }

  function normalizeCalculatorTabs(payloadRecord) {
    const payload = payloadRecord?.payload && typeof payloadRecord.payload === "object" ? payloadRecord.payload : {};
    const tabs = Array.isArray(payload.tabs) ? payload.tabs : [];
    return tabs
      .filter((tab) => tab && typeof tab === "object")
      .map((tab, index) => ({
        appId: payloadRecord?.app_id || "",
        label: getCalculatorLabel(payloadRecord?.app_id || ""),
        id: compactText(tab.id) || `tab_${index + 1}`,
        name: compactText(tab.name) || `Вкладка ${index + 1}`,
        hidden: Boolean(tab.hidden),
        status: compactText(tab?.data?.status),
        quantities: tab?.data?.quantities && typeof tab.data.quantities === "object" ? tab.data.quantities : {},
        params: tab?.data?.params && typeof tab.data.params === "object" ? tab.data.params : {}
      }));
  }

  function buildCalculatorDemandSnapshot(myCalculatorRecord, partnerCalculatorRecords) {
    const sources = [];
    if (myCalculatorRecord?.payload) {
      sources.push(...normalizeCalculatorTabs(myCalculatorRecord));
    }
    (partnerCalculatorRecords || []).forEach((record) => {
      sources.push(...normalizeCalculatorTabs(record));
    });

    const demandMap = new Map();
    let activeTabs = 0;
    let invoiceIssuedTabs = 0;
    let invoicePaidTabs = 0;

    sources.forEach((tab) => {
      if (tab.hidden) return;
      activeTabs += 1;
      if (tab.status === "invoice_issued") invoiceIssuedTabs += 1;
      if (tab.status === "invoice_paid") invoicePaidTabs += 1;

      Object.entries(tab.quantities || {}).forEach(([sku, rawQty]) => {
        const quantity = toNumber(rawQty);
        if (quantity <= 0) return;
        const normalizedSku = compactText(sku);
        if (!normalizedSku) return;
        if (!demandMap.has(normalizedSku)) {
          demandMap.set(normalizedSku, {
            sku: normalizedSku,
            qtyTotal: 0,
            tabsCount: 0,
            sources: new Set(),
            examples: []
          });
        }
        const entry = demandMap.get(normalizedSku);
        entry.qtyTotal += quantity;
        entry.tabsCount += 1;
        entry.sources.add(tab.label);
        if (entry.examples.length < 4) {
          entry.examples.push(`${tab.label} • ${tab.name}`);
        }
      });
    });

    return {
      activeTabs,
      invoiceIssuedTabs,
      invoicePaidTabs,
      demand: [...demandMap.values()]
        .map((entry) => ({
          ...entry,
          sources: [...entry.sources]
        }))
        .sort((left, right) => right.qtyTotal - left.qtyTotal)
    };
  }

  function findWarehouseMatch(snapshot, sku) {
    const normalizedSku = compactText(sku).toLowerCase();
    return snapshot.items.find((item) => {
      const itemSku = compactText(item.sku).toLowerCase();
      const itemName = compactText(item.name).toLowerCase();
      return itemSku === normalizedSku || itemName === normalizedSku;
    }) || null;
  }

  function getCrmDealSourceKey(dealId) {
    return `crm-deal:${compactText(dealId)}`;
  }

  function getWarehouseItemSourceKey(itemId) {
    return `warehouse-item:${compactText(itemId)}`;
  }

  function buildDealReservationMap(warehouseDoc) {
    const map = new Map();
    (warehouseDoc?.movements || []).forEach((movement) => {
      const sourceKey = compactText(movement?.integration?.sourceKey || movement?.sourceKey);
      if (!sourceKey.startsWith("crm-deal:")) return;
      if (!map.has(sourceKey)) {
        map.set(sourceKey, {
          qty: 0,
          rows: []
        });
      }
      const entry = map.get(sourceKey);
      const qty = toNumber(movement.qty);
      entry.qty += movement.kind === "release" ? -qty : qty;
      entry.rows.push(movement);
    });
    return map;
  }

  function getTaskIntegrationMeta(task) {
    const sourceApp = compactText(task?.integration?.sourceApp || "");
    const family = compactText(task?.integration?.family || "");
    if (sourceApp === "platform_risk_engine") {
      if (family === "CRM") return { label: "Из CRM", moduleKey: "crm" };
      if (family === "Склад") return { label: "Из Склада", moduleKey: "warehouse" };
      if (family === "Продажи") return { label: "Из Продаж", moduleKey: "sales" };
      return { label: "Из сигнала", moduleKey: "tasks" };
    }
    if (sourceApp === "platform_crm_manual" || compactText(task?.sourceKey).startsWith("crm-deal:")) {
      return { label: "Связано со сделкой", moduleKey: "crm" };
    }
    if (sourceApp === "platform_warehouse_manual" || compactText(task?.sourceKey).startsWith("warehouse-item:")) {
      return { label: "Связано со складом", moduleKey: "warehouse" };
    }
    return null;
  }

  function getTasksLinkedToSource(tasksDoc, sourceKey) {
    const normalizedSourceKey = compactText(sourceKey);
    if (!normalizedSourceKey) return [];
    return sortByDateDesc(getTasksDecorated(tasksDoc), "updatedAt").filter((task) => {
      const taskSourceKey = compactText(task?.integration?.sourceKey || task?.sourceKey);
      return taskSourceKey === normalizedSourceKey;
    });
  }

  function getSalesOrderBySourceKey(snapshot, sourceKey) {
    const normalizedSourceKey = compactText(sourceKey);
    if (!normalizedSourceKey) return null;
    return (snapshot?.orders || []).find((order) => getSalesSourceKey(order) === normalizedSourceKey) || null;
  }

  function getSalesOrderBySourceId(snapshot, sourceId) {
    const normalizedSourceId = compactText(sourceId);
    if (!normalizedSourceId) return null;
    return (snapshot?.orders || []).find((order) => compactText(order.sourceId) === normalizedSourceId) || null;
  }

  function getTaskSourceContext(task, crmDoc, warehouseDoc, salesSnapshot, tasksDoc) {
    const sourceKey = compactText(task?.integration?.sourceKey || task?.sourceKey);
    const sourceApp = compactText(task?.integration?.sourceApp || "");
    if (!sourceKey) return null;

    const relatedTasks = getTasksLinkedToSource(tasksDoc, sourceKey).filter((entry) => entry.id !== task.id);

    if (sourceKey.startsWith("crm-deal:")) {
      const dealId = sourceKey.slice("crm-deal:".length);
      const deal = (crmDoc?.deals || []).find((entry) => entry.id === dealId) || null;
      const order = getSalesOrderBySourceKey(
        salesSnapshot,
        compactText(deal?.integration?.sourceKey || deal?.sourceKey)
      );
      const reservation = buildDealReservationMap(warehouseDoc).get(sourceKey) || { qty: 0, rows: [] };
      return {
        type: "crm",
        title: deal?.title || deal?.client || "CRM-сделка",
        subtitle: deal?.client || "Клиент не указан",
        moduleKey: "crm",
        entityId: deal?.id || "",
        tone: getCrmStageMeta(deal?.stage).tone,
        stageLabel: getCrmStageMeta(deal?.stage).label,
        amount: deal?.amount || 0,
        dueDate: deal?.deadline || "",
        relatedTasks,
        order,
        reservation,
        note: deal?.note || ""
      };
    }

    if (sourceKey.startsWith("warehouse-item:")) {
      const itemId = sourceKey.slice("warehouse-item:".length);
      const item = (warehouseDoc?.items || []).find((entry) => entry.id === itemId) || null;
      const movements = sortByDateDesc(
        (warehouseDoc?.movements || []).filter((movement) => movement.itemId === itemId),
        "date"
      ).slice(0, 5);
      const snapshot = buildWarehouseSnapshot(warehouseDoc);
      const decoratedItem = snapshot.items.find((entry) => entry.id === itemId) || null;
      return {
        type: "warehouse",
        title: item?.name || item?.sku || "Позиция склада",
        subtitle: item?.sku || item?.category || "Складской контур",
        moduleKey: "warehouse",
        entityId: item?.id || "",
        tone: decoratedItem?.low ? "danger" : "success",
        available: decoratedItem?.available || 0,
        reserved: decoratedItem?.reserved || 0,
        onHand: decoratedItem?.onHand || 0,
        relatedTasks,
        movements,
        note: item?.note || ""
      };
    }

    if (sourceApp === "platform_risk_engine" && sourceKey.startsWith("crm-overdue:")) {
      const dealId = sourceKey.slice("crm-overdue:".length);
      const deal = (crmDoc?.deals || []).find((entry) => entry.id === dealId) || null;
      return {
        type: "crm-signal",
        title: deal?.title || task.title || "Сигнал CRM",
        subtitle: "Просроченная сделка",
        moduleKey: "crm",
        entityId: deal?.id || "",
        tone: "warning",
        stageLabel: getCrmStageMeta(deal?.stage).label,
        amount: deal?.amount || 0,
        dueDate: deal?.deadline || "",
        relatedTasks
      };
    }

    if (sourceApp === "platform_risk_engine" && sourceKey.startsWith("warehouse-low:")) {
      const itemId = sourceKey.slice("warehouse-low:".length);
      const snapshot = buildWarehouseSnapshot(warehouseDoc);
      const item = snapshot.items.find((entry) => entry.id === itemId) || null;
      return {
        type: "warehouse-signal",
        title: item?.name || task.title || "Сигнал склада",
        subtitle: "Низкий остаток",
        moduleKey: "warehouse",
        entityId: item?.id || "",
        tone: item?.low ? "danger" : "warning",
        available: item?.available || 0,
        reserved: item?.reserved || 0,
        onHand: item?.onHand || 0,
        relatedTasks
      };
    }

    if (sourceApp === "platform_risk_engine" && sourceKey.startsWith("sales-invoice:")) {
      const order = getSalesOrderBySourceId(salesSnapshot, sourceKey.slice("sales-invoice:".length));
      return {
        type: "sales-signal",
        title: order?.orderNumber || order?.title || task.title || "Сигнал оплаты",
        subtitle: order?.client || "Клиент не указан",
        moduleKey: "sales",
        entityId: "",
        tone: order?.paidDate ? "success" : "accent",
        amount: order?.amount || 0,
        dueDate: order?.invoiceDate || "",
        order,
        relatedTasks
      };
    }

    return null;
  }

  function buildTaskOperationCards(task, context) {
    const dueDate = normalizeDateInput(task?.dueDate);
    const overdue = dueDate && dueDate < todayString() && compactText(task?.status) !== "done";
    const sprintTitle = compactText(task?.sprint?.title || "") || "Без итерации";
    const cards = [
      {
        label: "Статус",
        value: getTaskStatusMeta(task?.status).label,
        caption: overdue ? "срок уже просрочен" : "рабочее состояние карточки",
        tone: overdue ? "danger" : getTaskStatusMeta(task?.status).tone
      },
      {
        label: "Приоритет",
        value: getPriorityLabel(task?.priority),
        caption: task?.owner ? `ответственный: ${task.owner}` : "ответственный не назначен",
        tone: task?.priority === "urgent" ? "danger" : task?.priority === "high" ? "warning" : "neutral"
      },
      {
        label: "Срок",
        value: dueDate ? formatDate(dueDate) : "Не задан",
        caption: overdue ? "требует срочного внимания" : dueDate ? "контроль по календарю" : "дата пока не указана",
        tone: overdue ? "danger" : dueDate ? "info" : "neutral"
      },
      {
        label: "Итерация",
        value: sprintTitle,
        caption: sprintTitle === "Без итерации" ? "не привязана к спринту" : "рабочий цикл задачи",
        tone: sprintTitle === "Без итерации" ? "neutral" : "accent"
      },
      {
        label: "Источник",
        value: getTaskSourceLabel(context),
        caption: context?.title ? compactText(context.title) : "ручной контур",
        tone: context?.tone || "neutral"
      },
      {
        label: "Блокер",
        value: task?.blocked ? "Да" : "Нет",
        caption: task?.blocked ? "нужна помощь или решение" : "критичных блокеров нет",
        tone: task?.blocked ? "danger" : "success"
      }
    ];

    if (typeof context?.amount !== "undefined") {
      cards.push({
        label: "Сумма контура",
        value: formatMoney(context.amount || 0),
        caption: "связанный финансовый объём",
        tone: "info"
      });
    } else if (typeof context?.available !== "undefined") {
      cards.push({
        label: "Доступно на складе",
        value: formatNumber(context.available || 0),
        caption: `${formatNumber(context.onHand || 0)} на руках • ${formatNumber(context.reserved || 0)} в резерве`,
        tone: context?.available > 0 ? "success" : "danger"
      });
    }

    return cards;
  }

  function buildTaskTimeline(task, context) {
    const events = [];
    const history = Array.isArray(task?.history)
      ? task.history.map((entry) => normalizeTaskHistoryEntry(entry)).filter(Boolean)
      : [];

    if (!history.some((entry) => compactText(entry.title) === "Задача создана")) {
      events.push({
        date: task?.createdAt || new Date().toISOString(),
        title: "Задача создана",
        meta: compactText(task?.title || "Без названия"),
        tone: "neutral",
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }
    if (task?.updatedAt && compactText(task.updatedAt) !== compactText(task.createdAt)) {
      events.push({
        date: task.updatedAt,
        title: "Карточка обновлена",
        meta: `${getTaskStatusMeta(task.status).label} • ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }
    if (normalizeDateInput(task?.dueDate)) {
      events.push({
        date: normalizeDateInput(task.dueDate),
        title: compactText(task?.status) === "done" ? "Финальный срок задачи" : "Контрольный срок",
        meta: compactText(task?.owner || "Без ответственного"),
        tone: compactText(task?.status) === "done" ? "success" : "warning",
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }

    events.push(...history);

    if (context?.order?.invoiceDate) {
      events.push({
        date: context.order.invoiceDate,
        title: "По источнику выставлен счёт",
        meta: `${compactText(context.order.orderNumber || context.order.title || "Заказ")} • ${formatMoney(context.order.amount || 0)}`,
        tone: "accent",
        moduleKey: "sales"
      });
    }
    if (context?.order?.paidDate) {
      events.push({
        date: context.order.paidDate,
        title: "По источнику пришла оплата",
        meta: `${compactText(context.order.orderNumber || context.order.title || "Заказ")} • ${formatMoney(context.order.paidAmount || context.order.amount || 0)}`,
        tone: "success",
        moduleKey: "sales"
      });
    }
    (context?.reservation?.rows || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: movement.kind === "release" ? "Резерв по задаче снят" : "Под задачу зарезервирован материал",
        meta: `${formatNumber(movement.qty || 0)} • ${compactText(movement.note || "Складской резерв")}`,
        tone: movement.kind === "release" ? "neutral" : "info",
        moduleKey: movement.itemId ? "warehouse" : "",
        entityId: movement.itemId || ""
      });
    });
    (context?.movements || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: "Складское движение по источнику",
        meta: `${compactText(WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind)?.label || movement.kind)} • ${formatNumber(movement.qty || 0)}`,
        tone: movement.kind === "in" ? "success" : movement.kind === "out" ? "warning" : "info",
        moduleKey: movement.itemId ? "warehouse" : "",
        entityId: movement.itemId || ""
      });
    });

    return sortByDateDesc(
      events.filter((event) => compactText(event.date)),
      "date"
    );
  }

  function buildDealOperationCards(deal, order, reservation, tasks) {
    const linkedTasks = tasks || [];
    const openTasks = linkedTasks.filter((task) => task.status !== "done");
    const blockedTasks = linkedTasks.filter((task) => Boolean(task.blocked));
    const overdue = normalizeDateInput(deal?.deadline) && normalizeDateInput(deal?.deadline) < todayString();
    return [
      {
        label: "Счет",
        value: order?.invoiceDate ? "Выставлен" : "Нет",
        caption: order?.invoiceDate ? formatDate(order.invoiceDate) : "счет еще не выставлен",
        tone: order?.invoiceDate ? "accent" : "neutral"
      },
      {
        label: "Оплата",
        value: order?.paidDate ? "Оплачен" : order?.invoiceDate ? "Ожидает" : "—",
        caption: order?.paidDate ? formatDate(order.paidDate) : order?.invoiceDate ? "счет без оплаты" : "нет платежа",
        tone: order?.paidDate ? "success" : order?.invoiceDate ? "warning" : "neutral"
      },
      {
        label: "Задачи",
        value: formatNumber(openTasks.length),
        caption: blockedTasks.length ? `${blockedTasks.length} с блокером` : `${linkedTasks.length} всего`,
        tone: blockedTasks.length ? "danger" : openTasks.length ? "warning" : "success"
      },
      {
        label: "Материалы",
        value: formatNumber(reservation?.qty || 0),
        caption: reservation?.rows?.length ? `${reservation.rows.length} движений резерва` : deal?.stage === "production" ? "резерв еще не создан" : "резерв не нужен",
        tone: reservation?.qty > 0 ? "info" : deal?.stage === "production" ? "warning" : "neutral"
      },
      {
        label: "Срок",
        value: normalizeDateInput(deal?.deadline) ? formatDate(deal.deadline) : "—",
        caption: overdue ? "срок уже прошел" : "по карточке сделки",
        tone: overdue ? "danger" : "neutral"
      }
    ];
  }

  function buildDealTimeline(deal, order, reservationRows, tasks) {
    const events = [];
    const dealTitle = compactText(deal?.title || deal?.client || "Сделка");

    if (deal?.createdAt) {
      events.push({
        date: deal.createdAt,
        title: "Сделка создана",
        meta: `${dealTitle}${deal?.owner ? ` • ${compactText(deal.owner)}` : ""}`,
        tone: "neutral"
      });
    }
    if (deal?.updatedAt && compactText(deal.updatedAt) !== compactText(deal.createdAt)) {
      events.push({
        date: deal.updatedAt,
        title: "Сделка обновлена",
        meta: `${getCrmStageMeta(deal.stage).label}${deal?.amount ? ` • ${formatMoney(deal.amount)}` : ""}`,
        tone: getCrmStageMeta(deal.stage).tone
      });
    }

    if (order?.createdAt) {
      events.push({
        date: order.createdAt,
        title: "Заказ появился в Продажах",
        meta: `${compactText(order.orderNumber || order.title || "Заказ")} • ${compactText(order.client || "клиент не указан")}`,
        tone: "neutral",
        moduleKey: "sales"
      });
    }
    if (order?.invoiceDate) {
      events.push({
        date: order.invoiceDate,
        title: "Счет выставлен",
        meta: `${compactText(order.orderNumber || "Заказ")} • ${formatMoney(order.amount || 0)}`,
        tone: "accent",
        moduleKey: "sales"
      });
    }
    if (order?.paidDate) {
      events.push({
        date: order.paidDate,
        title: "Счет оплачен",
        meta: `${compactText(order.orderNumber || "Заказ")} • ${formatMoney(order.paidAmount || order.amount || 0)}`,
        tone: "success",
        moduleKey: "sales"
      });
    }
    if (order?.productionStart) {
      events.push({
        date: order.productionStart,
        title: "Производство запущено",
        meta: compactText(order.orderNumber || order.title || "Заказ"),
        tone: "warning",
        moduleKey: "sales"
      });
    }
    if (order?.productionEnd) {
      events.push({
        date: order.productionEnd,
        title: "Производство завершено",
        meta: compactText(order.orderNumber || order.title || "Заказ"),
        tone: "success",
        moduleKey: "sales"
      });
    }
    if (order?.deliveryDate) {
      events.push({
        date: order.deliveryDate,
        title: "Плановая дата выдачи / доставки",
        meta: compactText(order.orderNumber || order.title || "Заказ"),
        tone: "info",
        moduleKey: "sales"
      });
    }

    (tasks || []).forEach((task) => {
      events.push({
        date: task.updatedAt || task.createdAt,
        title: "Задача по сделке",
        meta: `${compactText(task.title || "Задача")} • ${getTaskStatusMeta(task.status).label} • ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task.id
      });
    });

    (reservationRows || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: movement.kind === "release" ? "Резерв снят" : "Материал зарезервирован",
        meta: `${formatNumber(movement.qty || 0)} • ${compactText(movement.note || "Складской резерв")}`,
        tone: movement.kind === "release" ? "neutral" : "info",
        moduleKey: movement.itemId ? "warehouse" : "",
        entityId: movement.itemId || ""
      });
    });

    return sortByDateDesc(
      events.filter((event) => compactText(event.date)),
      "date"
    );
  }

  function buildWarehouseItemOperationCards(item, demandEntry, linkedTasks, relatedDeals) {
    const tasks = linkedTasks || [];
    const openTasks = tasks.filter((task) => task.status !== "done");
    const blockedTasks = tasks.filter((task) => Boolean(task.blocked));
    const deals = relatedDeals || [];
    return [
      {
        label: "Остаток",
        value: formatNumber(item?.available || 0),
        caption: `${formatNumber(item?.onHand || 0)} на руках • ${formatNumber(item?.reserved || 0)} в резерве`,
        tone: item?.low ? "danger" : "success"
      },
      {
        label: "Спрос",
        value: formatNumber(demandEntry?.qtyTotal || 0),
        caption: demandEntry?.tabsCount ? `${formatNumber(demandEntry.tabsCount)} вкладок калькуляторов` : "спрос пока не найден",
        tone: demandEntry?.qtyTotal ? "accent" : "neutral"
      },
      {
        label: "Сделки",
        value: formatNumber(deals.length),
        caption: deals.length ? "материал уже участвует в CRM-сделках" : "пока не привязан к сделкам",
        tone: deals.length ? "info" : "neutral"
      },
      {
        label: "Задачи",
        value: formatNumber(openTasks.length),
        caption: blockedTasks.length ? `${blockedTasks.length} с блокером` : `${tasks.length} всего`,
        tone: blockedTasks.length ? "danger" : openTasks.length ? "warning" : "neutral"
      },
      {
        label: "Минимум",
        value: formatNumber(item?.minStock || 0),
        caption: item?.low ? "ниже безопасного остатка" : "запас в норме",
        tone: item?.low ? "danger" : "success"
      }
    ];
  }

  function buildWarehouseItemTimeline(item, demandEntry, movements, linkedTasks, relatedDeals) {
    const events = [];
    if (item?.createdAt) {
      events.push({
        date: item.createdAt,
        title: "Позиция заведена",
        meta: `${compactText(item.name || item.sku || "Материал")} • старт ${formatNumber(item.openingStock || 0)}`,
        tone: "neutral"
      });
    }
    if (item?.updatedAt && compactText(item.updatedAt) !== compactText(item.createdAt)) {
      events.push({
        date: item.updatedAt,
        title: "Карточка позиции обновлена",
        meta: `${compactText(item.category || "без категории")} • минимум ${formatNumber(item.minStock || 0)}`,
        tone: "neutral"
      });
    }
    if (demandEntry?.qtyTotal) {
      events.push({
        date: new Date().toISOString(),
        title: "Обнаружен спрос из калькуляторов",
        meta: `${formatNumber(demandEntry.qtyTotal)} • ${compactText((demandEntry.sources || []).join(", ") || "Калькуляторы")}`,
        tone: "accent"
      });
    }
    (movements || []).forEach((movement) => {
      const movementTitle =
        movement.kind === "in"
          ? "Приход материала"
          : movement.kind === "out"
            ? "Списание материала"
            : movement.kind === "reserve"
              ? "Материал зарезервирован"
              : "Резерв снят";
      events.push({
        date: movement.date || movement.createdAt,
        title: movementTitle,
        meta: `${formatNumber(movement.qty || 0)} • ${compactText(movement.note || "Без комментария")}`,
        tone:
          movement.kind === "in"
            ? "success"
            : movement.kind === "out"
              ? "warning"
              : movement.kind === "reserve"
                ? "info"
                : "neutral",
        moduleKey: movement.itemId ? "warehouse" : "",
        entityId: movement.itemId || ""
      });
    });
    (linkedTasks || []).forEach((task) => {
      events.push({
        date: task.updatedAt || task.createdAt,
        title: "Задача по позиции",
        meta: `${compactText(task.title || "Задача")} • ${getTaskStatusMeta(task.status).label} • ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task.id
      });
    });
    (relatedDeals || []).forEach((deal) => {
      events.push({
        date: deal.updatedAt || deal.createdAt || "",
        title: "Материал участвует в сделке",
        meta: `${compactText(deal.title || deal.client || "Сделка")} • ${getCrmStageMeta(deal.stage).label}`,
        tone: getCrmStageMeta(deal.stage).tone,
        moduleKey: "crm",
        entityId: deal.id
      });
    });
    return sortByDateDesc(events.filter((event) => compactText(event.date)), "date");
  }

  function buildWarehouseHistoryEntries(doc) {
    const itemLookup = new Map((doc.items || []).map((item) => [item.id, item]));
    const entries = [];

    (doc.movements || []).forEach((movement) => {
      const meta =
        movement.kind === "in"
          ? { label: "Приход", tone: "success" }
          : movement.kind === "out"
            ? { label: "Списание", tone: "warning" }
            : movement.kind === "reserve"
              ? { label: "Резерв", tone: "info" }
              : { label: "Снятие резерва", tone: "neutral" };
      const item = itemLookup.get(movement.itemId);
      entries.push({
        id: `movement:${movement.id}`,
        date: movement.date || movement.createdAt || "",
        family: "movement",
        label: meta.label,
        title: item?.name || item?.sku || "Складская позиция",
        meta: `${formatNumber(movement.qty || 0)} • ${compactText(movement.note || "Без комментария")}`,
        tone: meta.tone,
        amount: movement.qty || 0,
        action: movement.itemId ? { type: "item", id: movement.itemId } : { type: "mode", mode: "movements" }
      });
    });

    (doc.purchases || []).forEach((purchase) => {
      const meta = getPurchaseStatusMeta(purchase.status);
      entries.push({
        id: `purchase:${purchase.id}`,
        date: purchase.date || purchase.updatedAt || purchase.createdAt || "",
        family: "purchase",
        label: "Закупка",
        title: purchase.number || purchase.supplier || "Закупка",
        meta: `${meta.label} • ${purchase.supplier || "Без поставщика"}`,
        tone: meta.tone,
        amount: purchase.amount || 0,
        action: { type: "purchase", id: purchase.id }
      });
    });

    (doc.financeEntries || []).forEach((entry) => {
      const meta = getFinanceKindMeta(entry.kind);
      entries.push({
        id: `finance:${entry.id}`,
        date: entry.date || entry.updatedAt || entry.createdAt || "",
        family: "finance",
        label: meta.label,
        title: entry.category || entry.counterparty || entry.account || "Денежная операция",
        meta: `${entry.account || "Без счета"} • ${entry.counterparty || "Без контрагента"}`,
        tone: meta.tone,
        amount: entry.amount || 0,
        action: { type: "finance", id: entry.id }
      });
    });

    (doc.productionJobs || []).forEach((job) => {
      const meta = getProductionStatusMeta(job.stage);
      entries.push({
        id: `production:${job.id}`,
        date: job.deadline || job.updatedAt || job.createdAt || "",
        family: "production",
        label: "Производство",
        title: job.title || job.itemLabel || "Производственное задание",
        meta: `${meta.label} • ${job.assignee || "Без ответственного"}`,
        tone: meta.tone,
        amount: job.qty || 0,
        action: { type: "production", id: job.id }
      });
    });

    return sortByDateDesc(entries.filter((entry) => compactText(entry.date)), "date");
  }

  async function buildTaskSignalSnapshot(tasksDoc) {
    const [crmDoc, warehouseDoc, salesRecord] = await Promise.all([
      ensureDocument("crm"),
      ensureDocument("warehouse"),
      ensureExternalDoc("sales")
    ]);
    const taskSourceKeys = new Set((tasksDoc.tasks || []).map((task) => compactText(task?.integration?.sourceKey || task?.sourceKey)).filter(Boolean));
    const today = todayString();
    const signals = [];

    (crmDoc.deals || []).forEach((deal) => {
      if (["done", "lost"].includes(deal.stage)) return;
      const deadline = normalizeDateInput(deal.deadline);
      if (!deadline || deadline >= today) return;
      signals.push({
        sourceKey: `crm-overdue:${deal.id}`,
        family: "CRM",
        title: `Дожать сделку: ${compactText(deal.title || deal.client || "без названия")}`,
        owner: compactText(deal.owner),
        priority: "high",
        dueDate: deadline,
        note: `Просроченная CRM-сделка. Клиент: ${compactText(deal.client || "не указан")}. Стадия: ${getCrmStageMeta(deal.stage).label}.`,
        alreadyExists: taskSourceKeys.has(`crm-overdue:${deal.id}`)
      });
    });

    buildWarehouseSnapshot(warehouseDoc).lowItems.forEach((item) => {
      const sourceKey = `warehouse-low:${item.id}`;
      signals.push({
        sourceKey,
        family: "Склад",
        title: `Пополнить склад: ${compactText(item.name || item.sku || "позиция")}`,
        owner: "Закупки",
        priority: "high",
        dueDate: today,
        note: `Доступный остаток ${formatNumber(item.available)} ниже минимума ${formatNumber(item.minStock || 0)}. SKU: ${compactText(item.sku || "—")}.`,
        alreadyExists: taskSourceKeys.has(sourceKey)
      });
    });

    buildSalesSnapshot(salesRecord).unpaidInvoices.slice(0, 20).forEach((order) => {
      const sourceKey = `sales-invoice:${order.sourceId}`;
      signals.push({
        sourceKey,
        family: "Продажи",
        title: `Проверить оплату счета: ${compactText(order.orderNumber || order.title || "заказ")}`,
        owner: compactText(order.manager),
        priority: "urgent",
        dueDate: order.invoiceDate || today,
        note: `Счет выставлен ${formatDate(order.invoiceDate)}, оплаты пока нет. Клиент: ${compactText(order.client || "не указан")}.`,
        alreadyExists: taskSourceKeys.has(sourceKey)
      });
    });

    return {
      total: signals.length,
      newSignals: signals.filter((signal) => !signal.alreadyExists),
      signals
    };
  }

  function getCurrentActiveSprintId(doc) {
    const sprints = sortByDateDesc(doc.sprints || [], "startDate");
    const today = todayString();
    const activeSprint = sprints.find((sprint) => {
      const start = normalizeDateInput(sprint.startDate);
      const end = normalizeDateInput(sprint.endDate);
      return start && end && start <= today && end >= today;
    });
    return activeSprint?.id || "";
  }

  function renderWorkspaceHeader(moduleKey) {
    const config = LIVE_MODULE_CONFIG[moduleKey] || LIVE_MODULE_CONFIG[resolveLiveModuleKey(moduleKey)];
    return `
      <div class="workspace-hero">
        <div>
          <div class="placeholder-eyebrow">Живой рабочий модуль</div>
          <h3>${escapeHtml(modules[moduleKey]?.title || moduleKey)}</h3>
          <p>${escapeHtml(modules[moduleKey]?.subtitle || config?.intro || "")}</p>
        </div>
        <div class="workspace-hero__meta">
          <div class="workspace-hero__chip">${escapeHtml(getModuleStageLabel(moduleKey))}</div>
          <div class="workspace-hero__chip">${escapeHtml(getPermissionBadgeLabel(moduleKey))}</div>
        </div>
      </div>
    `;
  }

  function renderMetricGrid(metrics) {
    return `
      <div class="workspace-metrics">
        ${metrics.map((metric) => `<article class="workspace-metric"><span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong>${metric.caption ? `<small>${escapeHtml(metric.caption)}</small>` : ""}</article>`).join("")}
      </div>
    `;
  }

  function renderAccessHint(moduleKey) {
    return `<div class="workspace-empty"><strong>${escapeHtml(modules[moduleKey]?.title || moduleKey)}</strong><div class="mt-2">Для этого раздела у вашей роли сейчас только просмотр. Анализировать можно, редактировать нельзя.</div></div>`;
  }

  function renderRelatedLinks(moduleKey) {
    const config = LIVE_MODULE_CONFIG[moduleKey] || LIVE_MODULE_CONFIG[resolveLiveModuleKey(moduleKey)];
    const links = (config.links || [])
      .filter((key) => hasModuleAccess(key))
      .map((key) => `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="${escapeHtml(key)}">${escapeHtml(modules[key]?.title || key)}</button>`)
      .join("");
    return `<div class="workspace-links"><div class="compact-help">Связанные разделы платформы</div><div class="d-flex flex-wrap gap-2">${links || '<span class="text-muted">Связанные разделы появятся после выдачи доступов.</span>'}</div></div>`;
  }

  function activateView(moduleKey, doc, viewId) {
    const stateKey = resolveLiveModuleKey(moduleKey);
    const view = getViewList(moduleKey, doc).find((item) => item.id === viewId);
    if (!view) return;
    Object.assign(ui[stateKey], getDefaultFilters(stateKey), view.filters || {});
    ui[stateKey].activeViewId = viewId;
    persistUiState(stateKey);
  }

  function markFiltersAsAdHoc(moduleKey) {
    const stateKey = resolveLiveModuleKey(moduleKey);
    ui[stateKey].activeViewId = "adhoc";
    persistUiState(stateKey);
  }

  async function renderDirectories(doc) {
    const canEdit = hasModulePermission("directories", "edit");
    const canManage = hasModulePermission("directories", "manage");
    const filters = ui.directories;
    const warehouseDoc = await ensureDocument("warehouse");
    const snapshot = buildWarehouseSnapshot(warehouseDoc || createDefaultWarehouseDoc());
    const allLists = Array.isArray(doc.lists) ? doc.lists : [];
    const filteredLists = allLists.filter((list) => matchesSearch([list.title, list.key, list.description, ...(list.options || [])].join(" "), filters.search));
    const selectedList =
      filteredLists.find((list) => list.id === filters.activeListId || list.key === filters.activeListId) ||
      allLists.find((list) => list.id === filters.activeListId || list.key === filters.activeListId) ||
      filteredLists[0] ||
      allLists[0] ||
      null;
    const selectedOptions = selectedList?.options || [];
    const metrics = [
      { label: "Товары", value: formatNumber(snapshot.products.length), caption: "в продающем каталоге" },
      { label: "Закупки", value: formatNumber(snapshot.purchases.length), caption: `${formatMoney(snapshot.purchasesTotal)} в заказах` },
      { label: "Баланс", value: formatMoney(snapshot.incomeTotal - snapshot.expenseTotal), caption: `${formatMoney(snapshot.incomeTotal)} приход • ${formatMoney(snapshot.expenseTotal)} расход` },
      { label: "Производство", value: formatNumber(snapshot.productionActive), caption: "активных заданий" },
      { label: "Справочников", value: formatNumber(allLists.length), caption: "общая библиотека списков" },
      { label: "Значений", value: formatNumber(sumBy(allLists, (list) => (list.options || []).length)), caption: "всего выпадающих значений" },
      { label: "Каналы CRM", value: formatNumber(getDirectoryOptions("crm_channels").length), caption: "готово для лидов и продаж" },
      { label: "Сотрудники", value: formatNumber(getDirectoryOptions("team_members").length), caption: "единый список ответственных" }
    ];
    const actionBar = renderActionBar(
      "directories",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-directory-new>Новый справочник</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-directory-edit>Настроить список</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-directory-option-new>Добавить значение</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="directories">Экспорт JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="directories">Импорт JSON</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );
    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("directories")}
        ${renderMetricGrid(metrics)}
        ${buildModeTabs("directories", escapeHtml)}
        ${actionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по названию, ключу или значению" value="${escapeHtml(filters.search)}" data-live-filter="search" />
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            <span class="workspace-note">Справочники подключаются к формам CRM, Склада и Тасктрекера без двойной настройки.</span>
          </div>
        </div>
        <div class="workspace-grid workspace-grid--3">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Каталог</h4><div class="compact-help">Создавайте списки один раз и используйте их во всей платформе.</div></div></div>
            <div class="workspace-stack">
              ${filteredLists.length
                ? filteredLists
                    .map(
                      (list) => `
                        <button class="workspace-list-item workspace-list-item--button ${selectedList?.key === list.key ? "workspace-list-item--active" : ""}" type="button" data-directory-select="${escapeHtml(list.key)}">
                          <div>
                            <strong>${escapeHtml(list.title)}</strong>
                            <div class="workspace-list-item__meta">${escapeHtml(list.key)} • ${escapeHtml(list.description || "Без описания")}</div>
                          </div>
                          <div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber((list.options || []).length))}</div></div>
                        </button>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Справочники пока не найдены.</div>'}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${selectedList ? "Настройки списка" : "Новый список"}</h4><div class="compact-help">Ключ лучше не менять часто: на него могут ссылаться поля и выпадашки.</div></div></div>
            ${canEdit
              ? `${selectedList ? `<div class="workspace-stage-strip"><div class="workspace-stage-card"><span>Ключ</span><strong>${escapeHtml(selectedList.key || "—")}</strong></div><div class="workspace-stage-card"><span>Значений</span><strong>${escapeHtml(formatNumber(selectedOptions.length))}</strong></div></div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-directory-edit>Редактировать в окне</button>${selectedList && canManage ? `<button class="btn btn-outline-danger" type="button" data-directory-delete="${escapeHtml(selectedList.key)}">Удалить</button>` : ""}</div>` : `<div class="workspace-empty workspace-empty--tight">Создайте первый справочник через всплывающее окно, чтобы не перегружать этот экран длинной формой.</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-directory-new>Создать справочник</button></div>`}<form id="directoriesListForm" class="workspace-form d-none">
                  <input type="hidden" name="id" value="${escapeHtml(selectedList?.id || "")}" />
                  <div class="workspace-form-grid">
                    <label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(selectedList?.title || "")}" placeholder="Каналы CRM" required /></label>
                    <label><span>Ключ</span><input class="form-control" type="text" name="key" value="${escapeHtml(selectedList?.key || "")}" placeholder="crm_channels" required /></label>
                  </div>
                  <label><span>Описание</span><textarea class="form-control" name="description" rows="3" placeholder="Для чего используется этот справочник">${escapeHtml(selectedList?.description || "")}</textarea></label>
                  <div class="workspace-form__actions">
                    <button class="btn btn-dark" type="submit">${selectedList ? "Сохранить список" : "Создать список"}</button>
                    ${selectedList && canManage ? `<button class="btn btn-outline-danger" type="button" data-directory-delete="${escapeHtml(selectedList.key)}">Удалить</button>` : ""}
                  </div>
                </form>`
              : renderAccessHint("directories")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Значения</h4><div class="compact-help">Значения сразу появятся в ваших выпадающих списках и подсказках.</div></div></div>
            ${selectedList
              ? `${canEdit
                  ? `<div class="workspace-card__actions"><button class="btn btn-dark" type="button" data-directory-option-new>Добавить значение</button><span class="workspace-note">Значение откроется в отдельной карточке и сразу попадёт во все выпадающие списки.</span></div><form id="directoriesOptionForm" class="workspace-form workspace-form--inline d-none">
                      <input type="hidden" name="key" value="${escapeHtml(selectedList.key)}" />
                      <label class="workspace-form__grow"><span>Новое значение</span><input class="form-control" type="text" name="option" placeholder="Добавить значение" required /></label>
                      <button class="btn btn-dark" type="submit">Добавить</button>
                    </form>`
                  : ""}
                <div class="workspace-stack mt-3">
                  ${selectedOptions.length
                    ? selectedOptions
                        .map(
                          (option, index) => `
                            <div class="workspace-list-item">
                              <div>
                                <strong>${escapeHtml(option)}</strong>
                                <div class="workspace-list-item__meta">Позиция ${escapeHtml(String(index + 1))}</div>
                              </div>
                              ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-directory-option-delete="${escapeHtml(`${selectedList.key}:${option}`)}">Удалить</button>` : ""}
                            </div>
                          `
                        )
                        .join("")
                    : '<div class="workspace-empty workspace-empty--tight">В этом списке пока нет значений.</div>'}
                </div>`
              : '<div class="workspace-empty workspace-empty--tight">Выберите справочник слева или создайте новый.</div>'}
          </section>
        </div>
        ${renderRelatedLinks("directories")}
      </div>
    `;
  }

  function getFilteredCrmDeals(doc) {
    const filters = ui.crm;
    return sortByDateDesc(doc.deals || [], "updatedAt").filter((deal) => {
      const searchBlob = [deal.title, deal.client, deal.channel, deal.owner, deal.note, ...getCustomFields("crm", doc).map((field) => getRecordValue(deal, field.key))].join(" ");
      if (!matchesSearch(searchBlob, filters.search)) return false;
      if (filters.stage !== "all" && deal.stage !== filters.stage) return false;
      if (filters.owner !== "all" && compactText(deal.owner) !== filters.owner) return false;
      return true;
    });
  }

  function renderCrmCard(doc, deal, canEdit, canManage) {
    const stage = getCrmStageMeta(deal.stage);
    const warehouseDoc = docs.warehouse || createDefaultWarehouseDoc();
    const reservation = buildDealReservationMap(warehouseDoc).get(getCrmDealSourceKey(deal.id));
    const integrationMeta =
      compactText(deal?.integration?.sourceApp) === EXTERNAL_SHARED_APPS.sales
        ? `<div class="workspace-card__meta">Источник: Продажи • заказ ${escapeHtml(compactText(deal?.integration?.orderNumber || "—"))}</div>`
        : "";
    return `
      <article class="workspace-card workspace-card--${escapeHtml(stage.tone)}">
        <div class="workspace-card__head">
          <strong>${escapeHtml(deal.title || "Сделка")}</strong>
          <span>${escapeHtml(formatMoney(deal.amount || 0))}</span>
        </div>
        <div class="workspace-card__meta">${escapeHtml(deal.client || "Клиент не указан")} • ${escapeHtml(deal.channel || "Канал не указан")}</div>
        <div class="workspace-card__meta">${escapeHtml(deal.owner || "Ответственный не назначен")} • срок ${escapeHtml(formatDate(deal.deadline))}</div>
        ${reservation?.qty ? `<div class="workspace-card__meta">Материалов в резерве: ${escapeHtml(formatNumber(reservation.qty))}</div>` : ""}
        ${integrationMeta}
        ${deal.note ? `<div class="workspace-card__note">${escapeHtml(deal.note)}</div>` : ""}
        ${renderCustomCardSection("crm", doc, deal, escapeHtml)}
        <div class="workspace-card__footer">
          ${canEdit ? `<select class="form-select form-select-sm workspace-inline-select" data-crm-stage-select="${escapeHtml(deal.id)}">${CRM_STAGES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === deal.stage ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>` : `<span class="workspace-tag workspace-tag--${escapeHtml(stage.tone)}">${escapeHtml(stage.label)}</span>`}
          <div class="workspace-card__actions">
            ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">Изменить</button>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(deal.id)}">Копия</button>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-crm-task-from-deal="${escapeHtml(deal.id)}">Задача</button>` : ""}
            ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-crm-delete="${escapeHtml(deal.id)}">Удалить</button>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  async function renderCrm(doc) {
    const canEdit = hasModulePermission("crm", "edit");
    const canManage = hasModulePermission("crm", "manage");
    const filters = ui.crm;
    const filtered = getFilteredCrmDeals(doc);
    const [salesRecord, warehouseDoc, tasksDoc] = await Promise.all([
      ensureExternalDoc("sales"),
      ensureDocument("warehouse"),
      ensureDocument("tasks")
    ]);
    const salesSnapshot = buildSalesSnapshot(salesRecord);
    const warehouseSnapshot = buildWarehouseSnapshot(warehouseDoc);
    const reservationMap = buildDealReservationMap(warehouseDoc);
    const linkedSourceKeys = new Set(
      (doc.deals || [])
        .map((deal) => compactText(deal?.integration?.sourceKey || deal?.sourceKey))
        .filter(Boolean)
    );
    const salesImportable = salesSnapshot.orders.filter((order) => !linkedSourceKeys.has(getSalesSourceKey(order)));
    const owners = [...new Set((doc.deals || []).map((deal) => compactText(deal.owner)).filter(Boolean))].sort();
    const openDeals = (doc.deals || []).filter((deal) => !["done", "lost"].includes(deal.stage));
    const overdueCount = openDeals.filter((deal) => normalizeDateInput(deal.deadline) && normalizeDateInput(deal.deadline) < todayString()).length;
    const editDeal = (doc.deals || []).find((deal) => deal.id === ui.crm.editId) || null;
    const editDealSourceKey = editDeal ? getCrmDealSourceKey(editDeal.id) : "";
    const editDealTasks = editDeal ? getTasksLinkedToSource(tasksDoc, editDealSourceKey) : [];
    const editDealReservation = editDeal ? reservationMap.get(editDealSourceKey) || { qty: 0, rows: [] } : { qty: 0, rows: [] };
    const editDealSourceOrder = editDeal
      ? getSalesOrderBySourceKey(salesSnapshot, compactText(editDeal?.integration?.sourceKey || editDeal?.sourceKey))
      : null;
    const editDealOperationCards = editDeal
      ? buildDealOperationCards(editDeal, editDealSourceOrder, editDealReservation, editDealTasks)
      : [];
    const editDealTimeline = editDeal
      ? buildDealTimeline(editDeal, editDealSourceOrder, editDealReservation.rows, editDealTasks)
      : [];
    const reserveDealOptions = sortByDateDesc(openDeals.length ? openDeals : doc.deals || [], "updatedAt");
    const metrics = [
      { label: "Активные сделки", value: formatNumber(openDeals.length), caption: "без закрытых и потерянных" },
      { label: "Сумма в воронке", value: formatMoney(sumBy(openDeals, (deal) => deal.amount || 0)), caption: "по текущим стадиям" },
      { label: "В производстве", value: formatNumber((doc.deals || []).filter((deal) => deal.stage === "production").length), caption: "готовы к исполнению" },
      { label: "Просрочено", value: formatNumber(overdueCount), caption: "требуют внимания" },
      { label: "Из Продаж", value: formatNumber(salesImportable.length), caption: "можно забрать в CRM" },
      ...getFormulaMetrics("crm", doc, filtered)
    ];
    const customHeader = renderCustomTableHeader("crm", doc, escapeHtml);
    const formDraft = editDeal ? null : readDraft("crm", "deal");
    const stageSummary = CRM_STAGES.map((stage) => {
      const count = (doc.deals || []).filter((deal) => deal.stage === stage.key).length;
      return `<div class="workspace-stage-card"><span>${escapeHtml(stage.label)}</span><strong>${escapeHtml(formatNumber(count))}</strong></div>`;
    }).join("");
    const actionBar = renderActionBar(
      "crm",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-crm-new>Новая сделка</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-crm-import-sales>Забрать из Продаж</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-crm-reserve-open>Резерв под сделку</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="board">Воронка</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="table">Таблица</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="crm">Экспорт JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="crm">Импорт JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="crm:deal">Сбросить черновик</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );
    const dealTableRows =
      filtered.length > 0
        ? filtered
            .map((deal) => {
              const stage = getCrmStageMeta(deal.stage);
              const reservation = reservationMap.get(getCrmDealSourceKey(deal.id));
              return `<tr><td><strong>${escapeHtml(deal.title || "Сделка")}</strong>${reservation?.qty ? `<div class="workspace-table__sub">Резерв: ${escapeHtml(formatNumber(reservation.qty))}</div>` : ""}</td><td>${escapeHtml(deal.client || "—")}</td><td>${escapeHtml(stage.label)}</td><td>${escapeHtml(deal.owner || "—")}</td><td>${escapeHtml(deal.channel || "—")}</td><td>${escapeHtml(formatMoney(deal.amount || 0))}</td><td>${escapeHtml(formatDate(deal.deadline))}</td>${renderCustomTableCells("crm", doc, deal, escapeHtml)}<td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">Открыть</button><button class="btn btn-sm btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(deal.id)}">Копия</button><button class="btn btn-sm btn-outline-secondary" type="button" data-crm-task-from-deal="${escapeHtml(deal.id)}">Задача</button>` : ""}</div></td></tr>`;
            })
            .join("")
        : `<tr><td colspan="${8 + getVisibleCustomFields("crm", doc, "showInTable").length}" class="text-muted">По текущим фильтрам сделок нет.</td></tr>`;

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("crm")}
        ${renderMetricGrid(metrics)}
        <section class="workspace-panel workspace-panel--muted">
          <div class="panel-heading"><div><h4>Мост с Продажами</h4><div class="compact-help">Платформа видит живые заказы из раздела Продажи и может забрать их в CRM без двойного ввода.</div></div><div class="workspace-note">Обновлено: ${escapeHtml(formatDate(salesSnapshot.updatedAt))}</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Заказов в Продажах</span><strong>${escapeHtml(formatNumber(salesSnapshot.orders.length))}</strong></div>
            <div class="workspace-stage-card"><span>Счета без оплаты</span><strong>${escapeHtml(formatNumber(salesSnapshot.unpaidInvoices.length))}</strong></div>
            <div class="workspace-stage-card"><span>В производстве</span><strong>${escapeHtml(formatNumber(salesSnapshot.productionOrders.length))}</strong></div>
            <div class="workspace-stage-card"><span>Не импортировано</span><strong>${escapeHtml(formatNumber(salesImportable.length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(salesImportable.slice(0, 6) || []).map((order) => `<div class="workspace-list-item"><div><strong>${escapeHtml(order.orderNumber || order.title || "Заказ")}</strong><div class="workspace-list-item__meta">${escapeHtml(order.client || "Клиент не указан")} • ${escapeHtml(order.leadChannel || order.salesChannel || "Без канала")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(order.amount || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(order.manager || "Без менеджера")}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Новых заказов из Продаж для импорта пока нет.</div>'}
          </div>
        </section>
        ${renderViewTabs("crm", doc, ui.crm, escapeHtml)}
        ${buildModeTabs("crm", escapeHtml)}
        ${actionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по клиенту, каналу, названию" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="stage"><option value="all">Все стадии</option>${CRM_STAGES.map((stage) => `<option value="${escapeHtml(stage.key)}" ${filters.stage === stage.key ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="owner"><option value="all">Все ответственные</option>${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-live-mode="form">Карточка</button>` : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`}
            <button class="btn btn-outline-dark" type="button" data-live-filters-reset="crm">Сбросить фильтры</button>
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="crm">${ui.crm.configOpen ? "Скрыть конструктор" : "Конструктор"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel("crm", doc, ui.crm, escapeHtml) : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editDeal ? "Карточка сделки" : "Новая сделка"}</h4><div class="compact-help">Карточка строится под ваш цикл: лид → квалификация → КП/счет → производство → закрытие.</div></div></div>
            ${canEdit ? `${renderDraftBadge("crm", "deal")}<div class="workspace-empty workspace-empty--tight">${editDeal ? "Сделка уже выбрана и открыта в фокусе справа. Для редактирования используйте всплывающую карточку, чтобы не перегружать экран." : "Создавайте сделки через всплывающую карточку. Так обзор остаётся чистым, а сама форма не ломает ритм работы."}</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-crm-new>${editDeal ? "Новая сделка" : "Создать сделку"}</button>${editDeal ? `<button class="btn btn-outline-dark" type="button" data-crm-edit="${escapeHtml(editDeal.id)}">Редактировать в окне</button><button class="btn btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(editDeal.id)}">Сделать копию</button>` : ""}</div>${editDeal ? `<div class="workspace-stage-strip mt-3"><div class="workspace-stage-card"><span>Клиент</span><strong>${escapeHtml(editDeal.client || "—")}</strong></div><div class="workspace-stage-card"><span>Ответственный</span><strong>${escapeHtml(editDeal.owner || "—")}</strong></div><div class="workspace-stage-card"><span>Срок</span><strong>${escapeHtml(formatDate(editDeal.deadline))}</strong></div></div>` : ""}` : renderAccessHint("crm")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editDeal ? "Связанный контур сделки" : "Фокус недели"}</h4><div class="compact-help">${editDeal ? "Источник, задачи и резерв материалов собраны рядом с карточкой, чтобы по сделке не приходилось бегать по модулям." : "Быстрый срез по тем сделкам, которым прямо сейчас нужен контроль."}</div></div></div>
            ${editDeal ? `<div class="workspace-stage-strip"><div class="workspace-stage-card"><span>Стадия</span><strong>${escapeHtml(getCrmStageMeta(editDeal.stage).label)}</strong></div><div class="workspace-stage-card"><span>Связанных задач</span><strong>${escapeHtml(formatNumber(editDealTasks.length))}</strong></div><div class="workspace-stage-card"><span>В резерве</span><strong>${escapeHtml(formatNumber(editDealReservation.qty || 0))}</strong></div><div class="workspace-stage-card"><span>Сумма сделки</span><strong>${escapeHtml(formatMoney(editDeal.amount || 0))}</strong></div></div>
            <div class="workspace-stack mt-3">
              ${editDealSourceOrder ? `<div><div class="panel-heading panel-heading--compact"><div><h4>Источник из Продаж</h4><div class="compact-help">Связанный заказ, из которого пришла или с которым синхронизирована эта сделка.</div></div></div><div class="workspace-list-item"><div><strong>${escapeHtml(editDealSourceOrder.orderNumber || editDealSourceOrder.title || "Заказ")}</strong><div class="workspace-list-item__meta">${escapeHtml(editDealSourceOrder.client || "Клиент не указан")} • ${escapeHtml(editDealSourceOrder.manager || "Без менеджера")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(editDealSourceOrder.amount || 0))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть Продажи</button></div></div></div></div>` : ""}
              <div><div class="panel-heading panel-heading--compact"><div><h4>Связанные задачи</h4><div class="compact-help">Задачи, заведенные из этой сделки или работающие по ней.</div></div></div><div class="workspace-stack">${editDealTasks.length ? editDealTasks.slice(0, 5).map((task) => `<div class="workspace-list-item"><div><strong>${escapeHtml(task.title || "Задача")}</strong><div class="workspace-list-item__meta">${escapeHtml(task.owner || "Без ответственного")} • ${escapeHtml(getTaskStatusMeta(task.status).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(task.status).tone)}">${escapeHtml(getPriorityLabel(task.priority))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(task.id)}">Открыть задачу</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">Связанных задач пока нет.</div>'}</div></div>
              <div><div class="panel-heading panel-heading--compact"><div><h4>Материалы в резерве</h4><div class="compact-help">Все резервы под эту сделку подтягиваются из складского модуля.</div></div></div><div class="workspace-stack">${editDealReservation.rows.length ? sortByDateDesc(editDealReservation.rows, "date").slice(0, 5).map((movement) => { const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); const movementLabel = movement.kind === "release" ? "снятие резерва" : "резерв"; return `<div class="workspace-list-item"><div><strong>${escapeHtml(item?.name || "Позиция")}</strong><div class="workspace-list-item__meta">${escapeHtml(movementLabel)} • ${escapeHtml(formatDate(movement.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div>${movement.itemId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(movement.itemId)}">Открыть позицию</button></div>` : ""}</div></div>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Резервов по этой сделке пока нет.</div>'}</div></div>
            </div>` : `<div class="workspace-stage-strip">${stageSummary}</div>
            <div class="workspace-stack">${(sortByDateDesc(openDeals, "deadline").slice(0, 6) || []).map((deal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(deal.title || "Сделка")}</strong><div class="workspace-list-item__meta">${escapeHtml(deal.client || "—")} • ${escapeHtml(deal.owner || "—")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getCrmStageMeta(deal.stage).tone)}">${escapeHtml(getCrmStageMeta(deal.stage).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(deal.deadline))}</div></div></div>`).join("") || '<div class="workspace-empty">Активных сделок пока нет.</div>'}</div>`}
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Резерв материалов под сделку</h4><div class="compact-help">Можно сразу привязать резерв склада к конкретной CRM-сделке, чтобы задача и материал не жили отдельно.</div></div></div>
            ${canEdit ? `<div class="workspace-empty workspace-empty--tight">Резерв материалов теперь открывается отдельной всплывающей карточкой: меньше визуального шума и удобнее работать на ноутбуке.</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-crm-reserve-open>Открыть резерв</button>${editDeal ? `<button class="btn btn-outline-dark" type="button" data-crm-reserve-open>Резерв под выбранную сделку</button>` : ""}</div>` : renderAccessHint("crm")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Связанные резервы</h4><div class="compact-help">Последние резервы материалов, которые уже связаны со сделками CRM.</div></div></div>
            <div class="workspace-stack">${(sortByDateDesc((warehouseDoc.movements || []).filter((movement) => compactText(movement?.integration?.sourceKey || "").startsWith("crm-deal:")), "date").slice(0, 6) || []).map((movement) => { const deal = (doc.deals || []).find((entry) => getCrmDealSourceKey(entry.id) === compactText(movement?.integration?.sourceKey || "")); const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); return `<div class="workspace-list-item"><div><strong>${escapeHtml(deal?.title || "Сделка")}</strong><div class="workspace-list-item__meta">${escapeHtml(item?.name || "Позиция")} • ${escapeHtml(movement.kind === "release" ? "снятие резерва" : "резерв")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(movement.date))}</div></div></div>`; }).join("") || '<div class="workspace-empty workspace-empty--tight">Связанных резервов пока нет.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "form") && editDeal ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Операционный статус сделки</h4><div class="compact-help">Здесь видно, где сделка сейчас упирается: в счет, оплату, задачи, материалы или сроки.</div></div></div>
            <div class="workspace-stage-strip">${editDealOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-task-from-deal="${escapeHtml(editDeal.id)}">${editDealTasks.length ? "Открыть задачу" : "Создать задачу"}</button>` : ""}
              ${editDealSourceOrder ? `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть в Продажах</button>` : ""}
              ${editDealReservation.rows?.[0]?.itemId ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(editDealReservation.rows[0].itemId)}">Открыть материал</button>` : ""}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Лента сделки</h4><div class="compact-help">История собирается из CRM, Продаж, Задач и складских резервов.</div></div><div class="workspace-note">Событий: ${escapeHtml(formatNumber(editDealTimeline.length))}</div></div>
            <div class="workspace-stack">${editDealTimeline.slice(0, 10).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Без деталей")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">Открыть</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Событий по сделке пока нет.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "board") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Воронка сделок</h4><div class="compact-help">Карточки можно быстро переводить между стадиями прямо из списка.</div></div><div class="workspace-note">Показано: ${escapeHtml(String(filtered.length))}</div></div>
          <div class="workspace-board workspace-board--crm">${CRM_STAGES.map((stage) => { const stageDeals = filtered.filter((deal) => deal.stage === stage.key); return `<article class="workspace-lane"><div class="workspace-lane__head"><strong>${escapeHtml(stage.label)}</strong><span>${escapeHtml(String(stageDeals.length))}</span></div><div class="workspace-lane__body">${stageDeals.map((deal) => renderCrmCard(doc, deal, canEdit, canManage)).join("") || '<div class="workspace-empty workspace-empty--tight">Пусто</div>'}</div></article>`; }).join("")}</div>
        </section>` : ""}
        ${modeIs(filters, "table") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Список сделок</h4><div class="compact-help">Нижняя таблица удобна для поиска и быстрого перехода к нужной карточке.</div></div></div>
          <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Сделка</th><th>Клиент</th><th>Стадия</th><th>Ответственный</th><th>Канал</th><th>Сумма</th><th>Срок</th>${customHeader}<th></th></tr></thead><tbody>${dealTableRows}</tbody></table></div>
        </section>` : ""}
        ${renderRelatedLinks("crm")}
      </div>
    `;
  }

  function buildWarehouseSnapshot(doc) {
    const items = (doc.items || []).map((item) => {
      const relatedMovements = (doc.movements || []).filter((movement) => movement.itemId === item.id);
      let stockDelta = 0;
      let reservedDelta = 0;
      relatedMovements.forEach((movement) => {
        const qty = toNumber(movement.qty);
        if (movement.kind === "in") stockDelta += qty;
        if (movement.kind === "out") stockDelta -= qty;
        if (movement.kind === "reserve") reservedDelta += qty;
        if (movement.kind === "release") reservedDelta -= qty;
      });
      const opening = toNumber(item.openingStock);
      const onHand = opening + stockDelta;
      const reserved = Math.max(0, reservedDelta);
      const available = onHand - reserved;
      return { ...item, opening, onHand, reserved, available, low: available <= toNumber(item.minStock) };
    });
    return {
      items,
      products: Array.isArray(doc.products) ? doc.products : [],
      purchases: Array.isArray(doc.purchases) ? doc.purchases : [],
      financeEntries: Array.isArray(doc.financeEntries) ? doc.financeEntries : [],
      productionJobs: Array.isArray(doc.productionJobs) ? doc.productionJobs : [],
      lowItems: items.filter((item) => item.low),
      reservedTotal: sumBy(items, (item) => item.reserved),
      availableTotal: sumBy(items, (item) => item.available),
      onHandTotal: sumBy(items, (item) => item.onHand),
      purchasesTotal: sumBy(doc.purchases || [], (entry) => entry.amount || 0),
      incomeTotal: sumBy((doc.financeEntries || []).filter((entry) => entry.kind === "income"), (entry) => entry.amount || 0),
      expenseTotal: sumBy((doc.financeEntries || []).filter((entry) => entry.kind === "expense"), (entry) => entry.amount || 0),
      productionActive: (doc.productionJobs || []).filter((entry) => !["done", "paused"].includes(compactText(entry.stage))).length
    };
  }

  function getPurchaseStatusMeta(statusKey) {
    return WAREHOUSE_PURCHASE_STATUSES.find((item) => item.key === compactText(statusKey)) || WAREHOUSE_PURCHASE_STATUSES[0];
  }

  function getFinanceKindMeta(kindKey) {
    return FINANCE_ENTRY_KINDS.find((item) => item.key === compactText(kindKey)) || FINANCE_ENTRY_KINDS[0];
  }

  function getProductionStatusMeta(stageKey) {
    return PRODUCTION_JOB_STATUSES.find((item) => item.key === compactText(stageKey)) || PRODUCTION_JOB_STATUSES[0];
  }

  async function renderWarehouse(doc, moduleKey = "warehouse") {
    const canEdit = hasModulePermission("warehouse", "edit");
    const canManage = hasModulePermission("warehouse", "manage");
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    const forcedMode = resolveLiveModuleMode(moduleKey);
    const allowedModes = (MODULE_MODE_CONFIG[moduleKey] || MODULE_MODE_CONFIG[canonicalModuleKey] || []).map((item) => item.key);
    const currentMode =
      forcedMode && !allowedModes.includes(ui.warehouse.mode)
        ? forcedMode
        : forcedMode && !["overview", forcedMode].includes(ui.warehouse.mode)
          ? forcedMode
          : ui.warehouse.mode;
    const filters = forcedMode ? { ...ui.warehouse, mode: currentMode } : ui.warehouse;
    const snapshot = buildWarehouseSnapshot(doc);
    const [myCalculatorDoc, partnerCalculatorDocs, tasksDoc, crmDoc] = await Promise.all([
      ensureExternalDoc("myCalculator"),
      ensureExternalDoc("partnerCalculators"),
      ensureDocument("tasks"),
      ensureDocument("crm")
    ]);
    const calculatorSnapshot = buildCalculatorDemandSnapshot(
      myCalculatorDoc,
      partnerCalculatorDocs
    );
    const demandBridge = calculatorSnapshot.demand.map((entry) => {
      const match = findWarehouseMatch(snapshot, entry.sku);
      return { ...entry, match, low: Boolean(match?.low), missing: !match };
    });
    const missingDemand = demandBridge.filter((entry) => entry.missing);
    const criticalDemand = demandBridge.filter((entry) => entry.low);
    const categories = [...new Set((doc.items || []).map((item) => compactText(item.category)).filter(Boolean))].sort();
    const productGroups = [...new Set((doc.products || []).map((item) => compactText(item.group)).filter(Boolean))].sort();
    const filteredItems = snapshot.items.filter((item) => {
      const blob = [item.name, item.sku, item.category, item.note, ...getCustomFields("warehouse", doc).map((field) => getRecordValue(item, field.key))].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (filters.category !== "all" && compactText(item.category) !== filters.category) return false;
      return true;
    });
    const filteredProducts = sortByDateDesc(
      (doc.products || []).filter((item) => {
        const blob = [item.name, item.sku, item.group, item.supplier, item.note].join(" ");
        if (!matchesSearch(blob, filters.search)) return false;
        if (filters.category !== "all" && compactText(item.group) !== filters.category) return false;
        return true;
      }),
      "updatedAt"
    );
    const filteredPurchases = sortByDateDesc(
      (doc.purchases || []).filter((item) => {
        const blob = [item.number, item.supplier, item.status, item.note].join(" ");
        if (!matchesSearch(blob, filters.search)) return false;
        if (moduleKey === "purchases" && filters.category !== "all" && compactText(item.status) !== filters.category) return false;
        return true;
      }),
      "date"
    );
    const filteredFinance = sortByDateDesc(
      (doc.financeEntries || []).filter((entry) => {
        const blob = [entry.kind, entry.account, entry.category, entry.counterparty, entry.note].join(" ");
        if (!matchesSearch(blob, filters.search)) return false;
        if (moduleKey === "money" && filters.category !== "all" && compactText(entry.account) !== filters.category) return false;
        return true;
      }),
      "date"
    );
    const filteredProduction = sortByDateDesc(
      (doc.productionJobs || []).filter((entry) => {
        const blob = [entry.title, entry.stage, entry.assignee, entry.note].join(" ");
        if (!matchesSearch(blob, filters.search)) return false;
        if (moduleKey === "production" && filters.category !== "all" && compactText(entry.stage) !== filters.category) return false;
        return true;
      }),
      "deadline"
    );
    const editItem = (doc.items || []).find((item) => item.id === filters.itemEditId) || null;
    const editProduct = (doc.products || []).find((item) => item.id === filters.productEditId) || null;
    const editPurchase = (doc.purchases || []).find((item) => item.id === filters.purchaseEditId) || null;
    const editFinanceEntry = (doc.financeEntries || []).find((item) => item.id === filters.financeEditId) || null;
    const editProductionJob = (doc.productionJobs || []).find((item) => item.id === filters.productionEditId) || null;
    const editItemSourceKey = editItem ? getWarehouseItemSourceKey(editItem.id) : "";
    const editItemTasks = editItem ? getTasksLinkedToSource(tasksDoc, editItemSourceKey) : [];
    const editDemandEntry = editItem
      ? demandBridge.find((entry) => entry.match?.id === editItem.id || compactText(entry.sku).toLowerCase() === compactText(editItem.sku || editItem.name).toLowerCase()) || null
      : null;
    const editItemMovements = editItem
      ? sortByDateDesc((doc.movements || []).filter((movement) => movement.itemId === editItem.id), "date")
      : [];
    const relatedDealIds = new Set(
      editItemMovements
        .map((movement) => compactText(movement?.integration?.dealId || ""))
        .filter(Boolean)
    );
    const relatedDeals = editItem
      ? sortByDateDesc(
          (crmDoc.deals || []).filter((deal) => relatedDealIds.has(deal.id)),
          "updatedAt"
        )
      : [];
    const editItemOperationCards = editItem
      ? buildWarehouseItemOperationCards(editItem, editDemandEntry, editItemTasks, relatedDeals)
      : [];
    const editItemTimeline = editItem
      ? buildWarehouseItemTimeline(editItem, editDemandEntry, editItemMovements, editItemTasks, relatedDeals)
      : [];
    const editItemPrimaryTask = editItemTasks[0] || null;
    const recentMovements = sortByDateDesc(doc.movements || [], "date").slice(0, 10);
    const historyEntries = buildWarehouseHistoryEntries(doc);
    const historyTypeOptions = [
      { value: "movement", label: "Движения" },
      { value: "purchase", label: "Закупки" },
      { value: "finance", label: "Деньги" },
      { value: "production", label: "Производство" }
    ];
    const filteredHistory = historyEntries.filter((entry) => {
      const blob = [entry.label, entry.title, entry.meta, entry.family].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (currentMode === "history" && filters.category !== "all" && compactText(entry.family) !== filters.category) return false;
      return true;
    });
    const financeAccounts = [...new Set((doc.financeEntries || []).map((entry) => compactText(entry.account)).filter(Boolean))].sort();
    const moduleFilterMeta = (() => {
      if (moduleKey === "warehouse" && currentMode === "history") {
        return {
          placeholder: "Поиск по истории, комментарию, счету, закупке или движению",
          allLabel: "Все события",
          options: historyTypeOptions,
          primaryButtons: '<button class="btn btn-outline-dark" type="button" data-live-mode="overview">К обзору</button><button class="btn btn-outline-dark" type="button" data-live-mode="movements">Движения</button>'
        };
      }
      if (moduleKey === "products") {
        return {
          placeholder: "Поиск по товару, группе, поставщику",
          allLabel: "Все группы",
          options: productGroups,
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-product-new>Новый товар</button><button class="btn btn-outline-dark" type="button" data-live-mode="catalog">Открыть остатки</button>'
            : '<span class="workspace-note">Редактирование отключено для вашей роли</span>'
        };
      }
      if (moduleKey === "purchases") {
        return {
          placeholder: "Поиск по номеру, поставщику, статусу",
          allLabel: "Все статусы",
          options: WAREHOUSE_PURCHASE_STATUSES.map((status) => ({ value: status.key, label: status.label })),
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-purchase-new>Новая закупка</button><button class="btn btn-outline-dark" type="button" data-live-mode="products">Товары</button>'
            : '<span class="workspace-note">Редактирование отключено для вашей роли</span>'
        };
      }
      if (moduleKey === "money") {
        return {
          placeholder: "Поиск по счету, статье, контрагенту",
          allLabel: "Все счета",
          options: financeAccounts,
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-finance-new>Новая операция</button><button class="btn btn-outline-dark" type="button" data-live-mode="purchases">Закупки</button>'
            : '<span class="workspace-note">Редактирование отключено для вашей роли</span>'
        };
      }
      if (moduleKey === "production") {
        return {
          placeholder: "Поиск по заданию, этапу, ответственному",
          allLabel: "Все этапы",
          options: PRODUCTION_JOB_STATUSES.map((status) => ({ value: status.key, label: status.label })),
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-production-new>В производство</button><button class="btn btn-outline-dark" type="button" data-live-mode="products">Товары</button>'
            : '<span class="workspace-note">Редактирование отключено для вашей роли</span>'
        };
      }
      return {
        placeholder: "Поиск по позиции, SKU, категории",
        allLabel: "Все категории",
        options: categories,
        primaryButtons: canEdit
          ? '<button class="btn btn-dark" type="button" data-warehouse-item-new>Новая позиция</button><button class="btn btn-outline-dark" type="button" data-warehouse-movement-pick="">Новое движение</button>'
          : '<span class="workspace-note">Редактирование отключено для вашей роли</span>'
      };
    })();
    const metrics = (() => {
      if (moduleKey === "products") {
        return [
          { label: "Товаров", value: formatNumber(snapshot.products.length), caption: "в продающем каталоге" },
          { label: "Групп", value: formatNumber(productGroups.length), caption: "товарные направления" },
          { label: "Поставщиков", value: formatNumber(new Set((doc.products || []).map((item) => compactText(item.supplier)).filter(Boolean)).size), caption: "активные контрагенты" },
          { label: "Средняя закупка", value: formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.purchasePrice || 0) / filteredProducts.length : 0), caption: "по текущей выборке" },
          { label: "Средняя продажа", value: formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.salePrice || 0) / filteredProducts.length : 0), caption: "по текущей выборке" },
          { label: "Маржа", value: formatMoney(sumBy(filteredProducts, (item) => (item.salePrice || 0) - (item.purchasePrice || 0))), caption: "валовая по выборке" }
        ];
      }
      if (moduleKey === "purchases") {
        return [
          { label: "Закупок", value: formatNumber(snapshot.purchases.length), caption: "всего в контуре" },
          { label: "В обороте", value: formatMoney(snapshot.purchasesTotal || 0), caption: "общая сумма заказов" },
          { label: "Принято", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "received").length), caption: "уже на складе" },
          { label: "В пути", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "in_transit").length), caption: "еще не поступили" },
          { label: "Черновики", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "draft").length), caption: "не отправлены поставщику" },
          { label: "Средний чек", value: formatMoney(filteredPurchases.length ? sumBy(filteredPurchases, (item) => item.amount || 0) / filteredPurchases.length : 0), caption: "по текущей выборке" }
        ];
      }
      if (moduleKey === "money") {
        return [
          { label: "Баланс", value: formatMoney((snapshot.incomeTotal || 0) - (snapshot.expenseTotal || 0)), caption: "приход минус расход" },
          { label: "Приход", value: formatMoney(snapshot.incomeTotal || 0), caption: "денежный поток внутрь" },
          { label: "Расход", value: formatMoney(snapshot.expenseTotal || 0), caption: "денежный поток наружу" },
          { label: "Операций", value: formatNumber(filteredFinance.length), caption: "по текущей выборке" },
          { label: "Счетов", value: formatNumber(financeAccounts.length), caption: "активные кассы и счета" },
          { label: "Контрагентов", value: formatNumber(new Set((doc.financeEntries || []).map((entry) => compactText(entry.counterparty)).filter(Boolean)).size), caption: "в денежных операциях" }
        ];
      }
      if (moduleKey === "production") {
        return [
          { label: "Активные", value: formatNumber(snapshot.productionActive || 0), caption: "не завершены и не на паузе" },
          { label: "В очереди", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "queue").length), caption: "ожидают запуск" },
          { label: "В работе", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "in_work").length), caption: "у исполнителей" },
          { label: "Контроль", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "qa").length), caption: "на проверке" },
          { label: "Сотрудников", value: formatNumber(new Set((doc.productionJobs || []).map((item) => compactText(item.assignee)).filter(Boolean)).size), caption: "в производственном цикле" },
          { label: "Объем", value: formatNumber(sumBy(filteredProduction, (item) => item.qty || 0)), caption: "по текущей выборке" }
        ];
      }
      return [
        { label: "Позиций", value: formatNumber(snapshot.items.length), caption: "в каталоге материалов" },
        { label: "На руках", value: formatNumber(snapshot.onHandTotal), caption: "общее количество" },
        { label: "В резерве", value: formatNumber(snapshot.reservedTotal), caption: "под текущие заказы" },
        { label: "Нужно пополнить", value: formatNumber(snapshot.lowItems.length), caption: "ниже минимального запаса" },
        { label: "Из калькуляторов", value: formatNumber(calculatorSnapshot.activeTabs), caption: "активных вкладок спроса" },
        ...getFormulaMetrics("warehouse", doc, filteredItems)
      ];
    })();
    const customHeader = renderCustomTableHeader("warehouse", doc, escapeHtml);
    const warehouseActionButtons = (() => {
      if (moduleKey === "products") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-product-new>Новый товар</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">Остатки</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Закупки</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:product">Сбросить черновик товара</button>' : ""
        ];
      }
      if (moduleKey === "purchases") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-purchase-new>Новая закупка</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">Товары</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="finance">Деньги</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:purchase">Сбросить черновик закупки</button>' : ""
        ];
      }
      if (moduleKey === "money") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-finance-new>Новая операция</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Закупки</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="production">Производство</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:finance">Сбросить черновик денег</button>' : ""
        ];
      }
      if (moduleKey === "production") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-production-new>В производство</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">Товары</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">Остатки</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:production">Сбросить черновик производства</button>' : ""
        ];
      }
      return [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-item-new>Новая позиция</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-product-new>Новый товар</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-purchase-new>Новая закупка</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-finance-new>Новая операция</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-production-new>В производство</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-seed-demand>Добавить из калькуляторов</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">Товары</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Закупки</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="finance">Деньги</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="production">Производство</button>',
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="movements">Движения</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">Остатки</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:item">Сбросить черновик позиции</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:movement">Сбросить черновик движения</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:product">Сбросить черновик товара</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:purchase">Сбросить черновик закупки</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:finance">Сбросить черновик денег</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:production">Сбросить черновик производства</button>' : ""
      ];
    })();
    if (moduleKey === "warehouse" && !warehouseActionButtons.some((action) => String(action).includes('data-live-mode="history"'))) {
      warehouseActionButtons.splice(10, 0, '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="history">История</button>');
    }
    const warehouseActionBar = renderActionBar(
      moduleKey,
      warehouseActionButtons.filter(Boolean),
      escapeHtml
    );
    const showDemandPanel =
      (moduleKey === "warehouse" || moduleKey === "products") &&
      modeIs(filters, "overview", "catalog", "products");

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader(moduleKey)}
        ${renderMetricGrid(metrics)}
        ${showDemandPanel ? `<section class="workspace-panel workspace-panel--muted" data-mode-section="overview catalog products">
          <div class="panel-heading"><div><h4>Спрос из калькуляторов</h4><div class="compact-help">Платформа видит активные вкладки из личного и партнерских калькуляторов и подсвечивает артикулы, которые стоит держать под рукой.</div></div><div class="workspace-note">${escapeHtml(formatNumber(calculatorSnapshot.invoiceIssuedTabs))} счетов выставлено • ${escapeHtml(formatNumber(calculatorSnapshot.invoicePaidTabs))} оплачено</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Активных вкладок</span><strong>${escapeHtml(formatNumber(calculatorSnapshot.activeTabs))}</strong></div>
            <div class="workspace-stage-card"><span>Артикулов со спросом</span><strong>${escapeHtml(formatNumber(demandBridge.length))}</strong></div>
            <div class="workspace-stage-card"><span>Не заведено на складе</span><strong>${escapeHtml(formatNumber(missingDemand.length))}</strong></div>
            <div class="workspace-stage-card"><span>Критично по остатку</span><strong>${escapeHtml(formatNumber(criticalDemand.length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(demandBridge.slice(0, 8) || []).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.match?.name || entry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.sku)} • ${escapeHtml(entry.sources.join(", ") || "Калькуляторы")}</div></div><div class="text-end"><div class="workspace-tag ${entry.missing ? "workspace-tag--warning" : entry.low ? "workspace-tag--danger" : "workspace-tag--success"}">${escapeHtml(formatNumber(entry.qtyTotal))}</div><div class="workspace-list-item__meta mt-1">${entry.missing ? "нет позиции" : `доступно ${escapeHtml(formatNumber(entry.match?.available || 0))}`}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Спрос из калькуляторов пока не найден.</div>'}
          </div>
        </section>` : ""}
        ${renderViewTabs(moduleKey, doc, ui.warehouse, escapeHtml)}
        ${buildModeTabs(moduleKey, escapeHtml)}
        ${warehouseActionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="${escapeHtml(moduleFilterMeta.placeholder)}" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="category"><option value="all">${escapeHtml(moduleFilterMeta.allLabel)}</option>${moduleFilterMeta.options.map((option) => { const optionValue = typeof option === "string" ? option : option.value; const optionLabel = typeof option === "string" ? option : option.label; return `<option value="${escapeHtml(optionValue)}" ${filters.category === optionValue ? "selected" : ""}>${escapeHtml(optionLabel)}</option>`; }).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${moduleFilterMeta.primaryButtons}
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="warehouse">${ui.warehouse.configOpen ? "Скрыть конструктор" : "Конструктор"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel(moduleKey, doc, ui.warehouse, escapeHtml) : ""}
        ${modeIs(filters, "history") ? `<section class="workspace-panel workspace-panel--active" data-mode-section="history">
          <div class="panel-heading">
            <div>
              <h4>История склада</h4>
              <div class="compact-help">Единая лента склада, закупок, денег и производства. Здесь удобно проверять последние действия без переходов по разделам.</div>
            </div>
            <div class="workspace-note">Событий: ${escapeHtml(formatNumber(filteredHistory.length))}</div>
          </div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Всего</span><strong>${escapeHtml(formatNumber(historyEntries.length))}</strong><small class="workspace-list-item__meta">в единой истории</small></div>
            <div class="workspace-stage-card"><span>За 24 часа</span><strong>${escapeHtml(formatNumber(filteredHistory.filter((entry) => Date.now() - new Date(entry.date).getTime() <= 24 * 60 * 60 * 1000).length))}</strong><small class="workspace-list-item__meta">последняя активность</small></div>
            <div class="workspace-stage-card"><span>По закупкам</span><strong>${escapeHtml(formatNumber(filteredHistory.filter((entry) => entry.family === "purchase").length))}</strong><small class="workspace-list-item__meta">в текущем фильтре</small></div>
            <div class="workspace-stage-card"><span>Деньги</span><strong>${escapeHtml(formatMoney(sumBy(filteredHistory.filter((entry) => entry.family === "finance"), (entry) => entry.amount || 0)))}</strong><small class="workspace-list-item__meta">сумма операций</small></div>
          </div>
          <div class="workspace-grid workspace-grid--2 mt-3">
            <section class="workspace-panel workspace-panel--active" data-mode-section="history">
              <div class="panel-heading panel-heading--compact">
                <div>
                  <h4>Последние события</h4>
                  <div class="compact-help">Лента показывает последнее движение по складу, платеж, закупку или производственное действие.</div>
                </div>
              </div>
              <div class="workspace-stack">
                ${filteredHistory.slice(0, 18).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.label)} • ${escapeHtml(entry.meta || "Без деталей")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(entry.tone || "neutral")}">${escapeHtml(formatDate(entry.date))}</div><div class="workspace-list-item__meta mt-1">${entry.family === "finance" ? escapeHtml(formatMoney(entry.amount || 0)) : escapeHtml(formatNumber(entry.amount || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">По выбранным фильтрам история пока пустая.</div>'}
              </div>
            </section>
            <section class="workspace-panel workspace-panel--active" data-mode-section="history">
              <div class="panel-heading panel-heading--compact">
                <div>
                  <h4>Журнал действий</h4>
                  <div class="compact-help">Быстрый переход прямо в нужную сущность: позицию, закупку, операцию или производство.</div>
                </div>
              </div>
              <div class="table-shell">
                <table class="table table-sm align-middle workspace-table">
                  <thead>
                    <tr><th>Дата</th><th>Тип</th><th>Событие</th><th>Детали</th><th>Значение</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${filteredHistory.length ? filteredHistory.map((entry) => `<tr><td>${escapeHtml(formatDate(entry.date))}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(entry.tone || "neutral")}">${escapeHtml(entry.label)}</span></td><td><strong>${escapeHtml(entry.title)}</strong></td><td>${escapeHtml(entry.meta || "—")}</td><td>${entry.family === "finance" ? escapeHtml(formatMoney(entry.amount || 0)) : escapeHtml(formatNumber(entry.amount || 0))}</td><td class="text-end">${entry.action?.type === "item" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-item-edit="${escapeHtml(entry.action.id)}">Открыть</button>` : entry.action?.type === "purchase" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-purchase-edit="${escapeHtml(entry.action.id)}">Открыть</button>` : entry.action?.type === "finance" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-finance-edit="${escapeHtml(entry.action.id)}">Открыть</button>` : entry.action?.type === "production" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-production-edit="${escapeHtml(entry.action.id)}">Открыть</button>` : entry.action?.type === "mode" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-live-mode="${escapeHtml(entry.action.mode)}">Открыть</button>` : ""}</td></tr>`).join("") : '<tr><td colspan="6" class="text-muted">По текущим фильтрам история пуста.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>` : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editItem ? "Редактирование позиции" : "Новая позиция склада"}</h4><div class="compact-help">Каталог можно использовать как общий справочник материалов для склада и будущих калькуляторов.</div></div></div>
            ${canEdit ? `<form id="warehouseItemForm" class="workspace-form" data-draft-form="item"><input type="hidden" name="id" value="${escapeHtml(editItem?.id || "")}" /><div class="workspace-form-grid"><label><span>Название</span><input class="form-control" type="text" name="name" value="${escapeHtml(editItem?.name || "")}" required /></label><label><span>SKU / артикул</span><input class="form-control" type="text" name="sku" value="${escapeHtml(editItem?.sku || "")}" /></label><label><span>Категория</span><input class="form-control" type="text" name="category" value="${escapeHtml(editItem?.category || "")}" /></label><label><span>Ед. изм.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(editItem?.unit || "шт")}" /></label><label><span>Стартовый остаток</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(String(toNumber(editItem?.openingStock || 0) || ""))}" /></label><label><span>Минимум</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(String(toNumber(editItem?.minStock || 0) || ""))}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="3">${escapeHtml(editItem?.note || "")}</textarea></label>${renderCustomFieldSection("warehouse", doc, editItem, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editItem ? "Сохранить позицию" : "Добавить позицию"}</button><button class="btn btn-outline-secondary" type="button" data-warehouse-item-new>Очистить форму</button></div></form>` : renderAccessHint("warehouse")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Движение по складу</h4><div class="compact-help">Приход, списание и резервы лучше вносить отдельно — остатки считаются автоматически.</div></div></div>
            ${canEdit ? `<form id="warehouseMovementForm" class="workspace-form" data-draft-form="movement"><div class="workspace-form-grid"><label><span>Позиция</span><select class="form-select" name="itemId" required><option value="">Выберите позицию</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${filters.movementItemId === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label><label><span>Тип</span><select class="form-select" name="kind">${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label><label><span>Количество</span><input class="form-control" type="number" min="0" step="1" name="qty" required /></label><label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(todayString())}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="3"></textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Сохранить движение</button></div></form>` : renderAccessHint("warehouse")}
          </section>
        </div>` : ""}
        ${editItem ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Контур позиции</h4><div class="compact-help">Собирает в одном месте остаток, спрос, сделки и задачи по текущему материалу.</div></div></div>
            <div class="workspace-stage-strip">${editItemOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-task-from-item="${escapeHtml(editItem.id)}">${editItemPrimaryTask ? "Открыть задачу" : "Создать задачу"}</button>` : ""}
              ${relatedDeals[0]?.id ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="crm:${escapeHtml(relatedDeals[0].id)}">Открыть сделку</button>` : ""}
              <button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-movement-pick="${escapeHtml(editItem.id)}">Добавить движение</button>
            </div>
            <div class="workspace-stack mt-3">
              <div><div class="panel-heading panel-heading--compact"><div><h4>Спрос из калькуляторов</h4><div class="compact-help">Показывает, где этот материал уже фигурирует в расчетах.</div></div></div><div class="workspace-stack">${editDemandEntry ? editDemandEntry.examples?.length ? editDemandEntry.examples.map((example) => `<div class="workspace-list-item"><div><strong>${escapeHtml(editDemandEntry.match?.name || editItem.name || editDemandEntry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml(example)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber(editDemandEntry.qtyTotal || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml((editDemandEntry.sources || []).join(", ") || "Калькуляторы")}</div></div></div>`).join("") : `<div class="workspace-list-item"><div><strong>${escapeHtml(editItem.name || editDemandEntry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml((editDemandEntry.sources || []).join(", ") || "Калькуляторы")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber(editDemandEntry.qtyTotal || 0))}</div></div></div>` : '<div class="workspace-empty workspace-empty--tight">По калькуляторам спрос на эту позицию пока не найден.</div>'}</div></div>
              <div><div class="panel-heading panel-heading--compact"><div><h4>Связанные сделки</h4><div class="compact-help">Сделки, где этот материал уже ушёл в резерв или участвует в подготовке заказа.</div></div></div><div class="workspace-stack">${relatedDeals.length ? relatedDeals.slice(0, 5).map((deal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(deal.title || "Сделка")}</strong><div class="workspace-list-item__meta">${escapeHtml(deal.client || "Клиент не указан")} • ${escapeHtml(getCrmStageMeta(deal.stage).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getCrmStageMeta(deal.stage).tone)}">${escapeHtml(formatMoney(deal.amount || 0))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="crm:${escapeHtml(deal.id)}">Открыть</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">Сделок по этой позиции пока нет.</div>'}</div></div>
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Лента позиции</h4><div class="compact-help">История собирается из карточки материала, движений, задач и связей со сделками.</div></div><div class="workspace-note">Событий: ${escapeHtml(formatNumber(editItemTimeline.length))}</div></div>
            <div class="workspace-stack">${editItemTimeline.slice(0, 10).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Без деталей")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">Открыть</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">История по позиции пока пустая.</div>'}</div>
          </section>
        </div>` : ""}
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Текущие остатки</h4><div class="compact-help">Доступное количество = на руках − резерв.</div></div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Позиция</th><th>Категория</th><th>На руках</th><th>Резерв</th><th>Доступно</th><th>Минимум</th>${customHeader}<th></th></tr></thead><tbody>${filteredItems.length ? filteredItems.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong><div class="workspace-table__sub">${escapeHtml(item.sku || "без артикула")} • ${escapeHtml(item.unit || "шт")}</div></td><td>${escapeHtml(item.category || "—")}</td><td>${escapeHtml(formatNumber(item.onHand))}</td><td>${escapeHtml(formatNumber(item.reserved))}</td><td><span class="workspace-tag ${item.low ? "workspace-tag--danger" : "workspace-tag--success"}">${escapeHtml(formatNumber(item.available))}</span></td><td>${escapeHtml(formatNumber(item.minStock || 0))}</td>${renderCustomTableCells("warehouse", doc, item, escapeHtml)}<td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-item-edit="${escapeHtml(item.id)}">Изменить</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-item-duplicate="${escapeHtml(item.id)}">Копия</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-movement-pick="${escapeHtml(item.id)}">Движение</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-task-from-item="${escapeHtml(item.id)}">Задача</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-item-delete="${escapeHtml(item.id)}">Удалить</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="${8 + getVisibleCustomFields("warehouse", doc, "showInTable").length}" class="text-muted">Позиции не найдены. Добавьте первую запись или смените фильтр.</td></tr>`}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Последние движения</h4><div class="compact-help">Отсюда удобно контролировать, что и когда ушло в резерв или было списано.</div></div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Дата</th><th>Позиция</th><th>Тип</th><th>Кол-во</th><th>Комментарий</th><th></th></tr></thead><tbody>${recentMovements.length ? recentMovements.map((movement) => { const item = (doc.items || []).find((entry) => entry.id === movement.itemId); const kind = WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind); return `<tr><td>${escapeHtml(formatDate(movement.date))}</td><td>${escapeHtml(item?.name || "Позиция удалена")}</td><td>${escapeHtml(kind?.label || movement.kind)}</td><td>${escapeHtml(formatNumber(movement.qty || 0))}</td><td>${escapeHtml(movement.note || "—")}</td><td class="text-end">${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-movement-delete="${escapeHtml(movement.id)}">Удалить</button>` : ""}</td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">Движений пока нет.</td></tr>'}</tbody></table></div>
            <div class="workspace-stack mt-3"><div class="panel-heading panel-heading--compact"><div><h4>Нужно пополнить</h4><div class="compact-help">Критичные позиции, где доступный остаток ниже минимума.</div></div></div>${snapshot.lowItems.length ? snapshot.lowItems.map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.name)}</strong><div class="workspace-list-item__meta">${escapeHtml(item.category || "—")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--danger">${escapeHtml(formatNumber(item.available))}</div><div class="workspace-list-item__meta mt-1">минимум ${escapeHtml(formatNumber(item.minStock || 0))}</div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">Критичных остатков нет.</div>'}</div>
          </section>
        </div>
        ${modeIs(filters, "overview", "products") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Товары</h4><div class="compact-help">Продающий каталог платформы: группы, цены, поставщики и единицы измерения.</div></div><div class="workspace-note">${escapeHtml(formatNumber(filteredProducts.length))} позиций</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Товар</th><th>Группа</th><th>Поставщик</th><th>Цена закупки</th><th>Цена продажи</th><th></th></tr></thead><tbody>${filteredProducts.length ? filteredProducts.map((item) => `<tr><td><strong>${escapeHtml(item.name || "Товар")}</strong><div class="workspace-table__sub">${escapeHtml(item.sku || "без артикула")} • ${escapeHtml(item.unit || "шт")}</div></td><td>${escapeHtml(item.group || "—")}</td><td>${escapeHtml(item.supplier || "—")}</td><td>${escapeHtml(formatMoney(item.purchasePrice || 0))}</td><td>${escapeHtml(formatMoney(item.salePrice || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-product-edit="${escapeHtml(item.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-product-delete="${escapeHtml(item.id)}">Удалить</button>` : ""}</div></td></tr>`).join("") : '<tr><td colspan="6" class="text-muted">Товарный каталог пока пуст. Добавьте первую позицию через всплывающее окно.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Фокус по товарам</h4><div class="compact-help">Быстрый обзор по каталогу и ценам без ухода в карточки.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>Групп</span><strong>${escapeHtml(formatNumber(productGroups.length))}</strong></div>
              <div class="workspace-stage-card"><span>Поставщиков</span><strong>${escapeHtml(formatNumber(new Set((doc.products || []).map((item) => compactText(item.supplier)).filter(Boolean)).size))}</strong></div>
              <div class="workspace-stage-card"><span>Средняя закупка</span><strong>${escapeHtml(formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.purchasePrice || 0) / filteredProducts.length : 0))}</strong></div>
              <div class="workspace-stage-card"><span>Средняя продажа</span><strong>${escapeHtml(formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.salePrice || 0) / filteredProducts.length : 0))}</strong></div>
            </div>
            <div class="workspace-stack mt-3">${filteredProducts.slice(0, 6).map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.name || "Товар")}</strong><div class="workspace-list-item__meta">${escapeHtml(item.group || "Без группы")} • ${escapeHtml(item.supplier || "Без поставщика")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney((item.salePrice || 0) - (item.purchasePrice || 0)))}</div><div class="workspace-list-item__meta mt-1">маржа за единицу</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Пока нет товаров для обзора.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "purchases") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Закупки</h4><div class="compact-help">Заказы поставщикам, контроль статусов и общих сумм.</div></div><div class="workspace-note">${escapeHtml(formatMoney(snapshot.purchasesTotal || 0))} в обороте</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Номер</th><th>Поставщик</th><th>Статус</th><th>Дата</th><th>Сумма</th><th></th></tr></thead><tbody>${filteredPurchases.length ? filteredPurchases.map((item) => { const meta = getPurchaseStatusMeta(item.status); return `<tr><td><strong>${escapeHtml(item.number || "Закупка")}</strong></td><td>${escapeHtml(item.supplier || "—")}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(formatMoney(item.amount || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-purchase-edit="${escapeHtml(item.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-purchase-delete="${escapeHtml(item.id)}">Удалить</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">Закупок пока нет.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Статусы закупок</h4><div class="compact-help">Где сейчас зависают закупки и какие поставщики загружены сильнее.</div></div></div>
            <div class="workspace-mini-grid">${WAREHOUSE_PURCHASE_STATUSES.map((status) => `<div class="dashboard-mini dashboard-mini--${escapeHtml(status.tone)}"><span>${escapeHtml(status.label)}</span><strong>${escapeHtml(formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === status.key).length))}</strong></div>`).join("")}</div>
            <div class="workspace-stack mt-3">${filteredPurchases.slice(0, 6).map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.number || "Закупка")}</strong><div class="workspace-list-item__meta">${escapeHtml(item.supplier || "—")} • ${escapeHtml(formatDate(item.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getPurchaseStatusMeta(item.status).tone)}">${escapeHtml(getPurchaseStatusMeta(item.status).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatMoney(item.amount || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Нет данных по закупкам.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "finance") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Деньги</h4><div class="compact-help">Приходы, расходы и перемещения по счетам платформы.</div></div><div class="workspace-note">Баланс ${escapeHtml(formatMoney(snapshot.incomeTotal - snapshot.expenseTotal))}</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Дата</th><th>Тип</th><th>Счет</th><th>Статья</th><th>Контрагент</th><th>Сумма</th><th></th></tr></thead><tbody>${filteredFinance.length ? filteredFinance.map((entry) => { const meta = getFinanceKindMeta(entry.kind); return `<tr><td>${escapeHtml(formatDate(entry.date))}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(entry.account || "—")}</td><td>${escapeHtml(entry.category || "—")}</td><td>${escapeHtml(entry.counterparty || "—")}</td><td>${escapeHtml(formatMoney(entry.amount || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-finance-edit="${escapeHtml(entry.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-finance-delete="${escapeHtml(entry.id)}">Удалить</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="7" class="text-muted">Денежных операций пока нет.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Счета и кассы</h4><div class="compact-help">Показывает, где сейчас лежит оборот и какие статьи активнее всего.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>Приход</span><strong>${escapeHtml(formatMoney(snapshot.incomeTotal || 0))}</strong></div>
              <div class="workspace-stage-card"><span>Расход</span><strong>${escapeHtml(formatMoney(snapshot.expenseTotal || 0))}</strong></div>
              <div class="workspace-stage-card"><span>Операций</span><strong>${escapeHtml(formatNumber(filteredFinance.length))}</strong></div>
              <div class="workspace-stage-card"><span>Счетов</span><strong>${escapeHtml(formatNumber(new Set((doc.financeEntries || []).map((entry) => compactText(entry.account)).filter(Boolean)).size))}</strong></div>
            </div>
            <div class="workspace-stack mt-3">${(getDirectoryOptions("finance_accounts") || []).map((account) => `<div class="workspace-list-item"><div><strong>${escapeHtml(account)}</strong><div class="workspace-list-item__meta">Операций: ${escapeHtml(formatNumber((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account)).length))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(sumBy((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account) && compactText(entry.kind) === "income"), (entry) => entry.amount || 0) - sumBy((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account) && compactText(entry.kind) === "expense"), (entry) => entry.amount || 0)))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Справочники счетов пока пусты.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "production") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Производство</h4><div class="compact-help">Производственные задания, сроки, ответственные и связка с материалами.</div></div><div class="workspace-note">${escapeHtml(formatNumber(snapshot.productionActive || 0))} активных</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Задание</th><th>Этап</th><th>Срок</th><th>Ответственный</th><th>Кол-во</th><th></th></tr></thead><tbody>${filteredProduction.length ? filteredProduction.map((entry) => { const meta = getProductionStatusMeta(entry.stage); return `<tr><td><strong>${escapeHtml(entry.title || "Производство")}</strong><div class="workspace-table__sub">${escapeHtml(entry.itemLabel || "Без позиции")}</div></td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(formatDate(entry.deadline))}</td><td>${escapeHtml(entry.assignee || "—")}</td><td>${escapeHtml(formatNumber(entry.qty || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-production-edit="${escapeHtml(entry.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-production-delete="${escapeHtml(entry.id)}">Удалить</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">Производственных заданий пока нет.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Этапы производства</h4><div class="compact-help">Сразу видно, где работа в очереди, где в процессе и где тормозит контроль.</div></div></div>
            <div class="workspace-mini-grid">${PRODUCTION_JOB_STATUSES.map((status) => `<div class="dashboard-mini dashboard-mini--${escapeHtml(status.tone)}"><span>${escapeHtml(status.label)}</span><strong>${escapeHtml(formatNumber((doc.productionJobs || []).filter((entry) => compactText(entry.stage) === status.key).length))}</strong></div>`).join("")}</div>
            <div class="workspace-stack mt-3">${filteredProduction.slice(0, 6).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.title || "Производство")}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.assignee || "Без ответственного")} • ${escapeHtml(formatDate(entry.deadline))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getProductionStatusMeta(entry.stage).tone)}">${escapeHtml(getProductionStatusMeta(entry.stage).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatNumber(entry.qty || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Нет активных производственных заданий.</div>'}</div>
          </section>
        </div>` : ""}
        ${renderRelatedLinks(moduleKey)}
      </div>
    `;
  }

  function getTasksDecorated(doc) {
    const sprintMap = new Map((doc.sprints || []).map((sprint) => [sprint.id, sprint]));
    return (doc.tasks || []).map((task) => ({ ...task, sprint: sprintMap.get(task.sprintId) || null }));
  }

  async function renderTasks(doc) {
    const canEdit = hasModulePermission("tasks", "edit");
    const canManage = hasModulePermission("tasks", "manage");
    const filters = ui.tasks;
    const taskList = getTasksDecorated(doc);
    const taskSignals = await buildTaskSignalSnapshot(doc);
    const [crmDoc, warehouseDoc, salesRecord] = await Promise.all([
      ensureDocument("crm"),
      ensureDocument("warehouse"),
      ensureExternalDoc("sales")
    ]);
    const salesSnapshot = buildSalesSnapshot(salesRecord);
    const sprintOptions = sortByDateDesc(doc.sprints || [], "startDate");
    const owners = [...new Set(taskList.map((task) => compactText(task.owner)).filter(Boolean))].sort();
    const filteredTasks = sortByDateDesc(taskList, "updatedAt").filter((task) => {
      const blob = [task.title, task.owner, task.note, task.sprint?.title, ...getCustomFields("tasks", doc).map((field) => getRecordValue(task, field.key))].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.sprint !== "all" && task.sprintId !== filters.sprint) return false;
      if (filters.owner !== "all" && compactText(task.owner) !== filters.owner) return false;
      return true;
    });
    const openTasks = taskList.filter((task) => task.status !== "done");
    const overdue = openTasks.filter((task) => normalizeDateInput(task.dueDate) && normalizeDateInput(task.dueDate) < todayString()).length;
    const blockedCount = openTasks.filter((task) => Boolean(task.blocked)).length;
    const activeSprint = sprintOptions.find((sprint) => { const start = normalizeDateInput(sprint.startDate); const end = normalizeDateInput(sprint.endDate); const today = todayString(); return start && end && start <= today && end >= today; }) || sprintOptions[0] || null;
    const editTask = taskList.find((task) => task.id === filters.taskEditId) || null;
    const editSprint = (doc.sprints || []).find((sprint) => sprint.id === filters.sprintEditId) || null;
    const editTaskContext = editTask ? getTaskSourceContext(editTask, crmDoc, warehouseDoc, salesSnapshot, doc) : null;
    const editTaskOperationCards = editTask ? buildTaskOperationCards(editTask, editTaskContext) : [];
    const editTaskTimeline = editTask ? buildTaskTimeline(editTask, editTaskContext) : [];
    const editTaskPrimaryRelated = editTaskContext?.relatedTasks?.[0] || null;
    const metrics = [
      { label: "Открытые задачи", value: formatNumber(openTasks.length), caption: "без завершенных" },
      { label: "В работе", value: formatNumber(taskList.filter((task) => task.status === "in_progress").length), caption: "активное исполнение" },
      { label: "Блокеры", value: formatNumber(blockedCount), caption: "требуют решения" },
      { label: "Просрочено", value: formatNumber(overdue), caption: "срок уже прошел" },
      { label: "Новые сигналы", value: formatNumber(taskSignals.newSignals.length), caption: "можно превратить в задачи" },
      ...getFormulaMetrics("tasks", doc, filteredTasks)
    ];
    const customHeader = renderCustomTableHeader("tasks", doc, escapeHtml);
    const tasksActionBar = renderActionBar(
      "tasks",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-task-new>Новая задача</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-sprint-new>Новая итерация</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-task-generate-signals>Собрать из рисков</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="board">Канбан</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="table">Лента</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="tasks">Экспорт JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="tasks">Импорт JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="tasks:task">Сбросить черновик задачи</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="tasks:sprint">Сбросить черновик итерации</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("tasks")}
        ${renderMetricGrid(metrics)}
        <section class="workspace-panel workspace-panel--muted">
          <div class="panel-heading"><div><h4>Операционные сигналы</h4><div class="compact-help">Здесь собираются реальные риски из CRM, Продаж и Склада, чтобы их можно было одним действием превратить в задачи.</div></div><div class="workspace-note">Всего сигналов: ${escapeHtml(formatNumber(taskSignals.total))}</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Новых задач к созданию</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.length))}</strong></div>
            <div class="workspace-stage-card"><span>Уже заведено</span><strong>${escapeHtml(formatNumber(taskSignals.signals.filter((signal) => signal.alreadyExists).length))}</strong></div>
            <div class="workspace-stage-card"><span>Приоритет urgent</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.filter((signal) => signal.priority === "urgent").length))}</strong></div>
            <div class="workspace-stage-card"><span>Приоритет high</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.filter((signal) => signal.priority === "high").length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(taskSignals.signals.slice(0, 8) || []).map((signal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(signal.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(signal.family)} • ${escapeHtml(signal.owner || "Без ответственного")}</div></div><div class="text-end"><div class="workspace-tag ${signal.alreadyExists ? "workspace-tag--neutral" : signal.priority === "urgent" ? "workspace-tag--danger" : "workspace-tag--warning"}">${escapeHtml(signal.alreadyExists ? "уже есть" : signal.priority)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(signal.dueDate))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">Операционных сигналов пока нет.</div>'}
          </div>
        </section>
        ${renderViewTabs("tasks", doc, ui.tasks, escapeHtml)}
        ${buildModeTabs("tasks", escapeHtml)}
        ${tasksActionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по задаче, владельцу, итерации" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="status"><option value="all">Все статусы</option>${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${filters.status === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="sprint"><option value="all">Все итерации</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${filters.sprint === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="owner"><option value="all">Все ответственные</option>${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-task-new>Новая задача</button><button class="btn btn-outline-dark" type="button" data-sprint-new>Новая итерация</button>` : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`}
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="tasks">${ui.tasks.configOpen ? "Скрыть конструктор" : "Конструктор"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel("tasks", doc, ui.tasks, escapeHtml) : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editTask ? "Редактирование задачи" : "Новая задача"}</h4><div class="compact-help">Задачи можно вести по отделам, инициативам и проектам. Быстрый перевод между колонками остается прямо на карточках.</div></div></div>
            ${canEdit ? `<form id="tasksTaskForm" class="workspace-form" data-draft-form="task"><input type="hidden" name="id" value="${escapeHtml(editTask?.id || "")}" /><div class="workspace-form-grid"><label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(editTask?.title || "")}" required /></label><label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editTask?.owner || "")}" /></label><label><span>Статус</span><select class="form-select" name="status">${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${(editTask?.status || "backlog") === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select></label><label><span>Приоритет</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((priority) => `<option value="${escapeHtml(priority.key)}" ${(editTask?.priority || "medium") === priority.key ? "selected" : ""}>${escapeHtml(priority.label)}</option>`).join("")}</select></label><label><span>Итерация</span><select class="form-select" name="sprintId"><option value="">Без итерации</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${editTask?.sprintId === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label><label><span>Срок</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(editTask?.dueDate || ""))}" /></label></div><label class="permission-flag"><input class="form-check-input" type="checkbox" name="blocked" ${editTask?.blocked ? "checked" : ""} /><span>Есть блокер / нужна помощь</span></label><label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(editTask?.note || "")}</textarea></label>${renderCustomFieldSection("tasks", doc, editTask, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editTask ? "Сохранить задачу" : "Добавить задачу"}</button><button class="btn btn-outline-secondary" type="button" data-task-new>Очистить форму</button></div></form>` : renderAccessHint("tasks")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editSprint ? "Редактирование итерации" : "Новая итерация"}</h4><div class="compact-help">Итерация помогает держать в фокусе ближайший рабочий цикл и распределять задачи по этапам.</div></div></div>
            ${canEdit ? `<form id="tasksSprintForm" class="workspace-form" data-draft-form="sprint"><input type="hidden" name="id" value="${escapeHtml(editSprint?.id || "")}" /><div class="workspace-form-grid"><label><span>Название итерации</span><input class="form-control" type="text" name="title" value="${escapeHtml(editSprint?.title || "")}" required /></label><label><span>Старт</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(editSprint?.startDate || ""))}" /></label><label><span>Финиш</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(editSprint?.endDate || ""))}" /></label></div><label><span>Цель итерации</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(editSprint?.goal || "")}</textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editSprint ? "Сохранить итерацию" : "Добавить итерацию"}</button><button class="btn btn-outline-secondary" type="button" data-sprint-new>Очистить форму</button></div></form>` : renderAccessHint("tasks")}
          </section>
        </div>` : ""}
        ${editTask ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Контур задачи</h4><div class="compact-help">Единая карточка задачи: текущее состояние, быстрые действия и весь соседний контекст без переходов между модулями.</div></div><div class="workspace-note">Обновлено ${escapeHtml(formatDate(editTask.updatedAt || editTask.createdAt))}</div></div>
            <div class="workspace-stage-strip">${editTaskOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-set-status="${escapeHtml(editTask.id)}:${escapeHtml(editTask.status === "done" ? "todo" : "done")}">${editTask.status === "done" ? "Вернуть в работу" : "Отметить выполненной"}</button>` : ""}
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-toggle-blocked="${escapeHtml(editTask.id)}">${editTask.blocked ? "Снять блокер" : "Поставить блокер"}</button>` : ""}
              ${editTaskContext?.moduleKey === "sales" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть источник</button>` : editTaskContext?.entityId ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${editTaskContext.moduleKey}:${editTaskContext.entityId}`)}">Открыть источник</button>` : ""}
              ${editTaskPrimaryRelated ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(editTaskPrimaryRelated.id)}">Открыть связанную задачу</button>` : ""}
            </div>
            <div class="workspace-stack mt-3">
              <div class="workspace-list-item">
                <div>
                  <strong>${escapeHtml(editTask.title || "Задача")}</strong>
                  <div class="workspace-list-item__meta">${escapeHtml(editTask.owner || "Без ответственного")} • ${escapeHtml(editTask.sprint?.title || "Без итерации")}</div>
                </div>
                <div class="text-end">
                  <div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(editTask.status).tone)}">${escapeHtml(getTaskStatusMeta(editTask.status).label)}</div>
                  <div class="workspace-list-item__meta mt-1">${escapeHtml(getPriorityLabel(editTask.priority))}</div>
                </div>
              </div>
              ${editTask.note ? `<div class="workspace-empty workspace-empty--tight">${escapeHtml(editTask.note)}</div>` : '<div class="workspace-empty workspace-empty--tight">Комментарий к задаче пока не заполнен.</div>'}
              ${editTaskContext ? `<div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.title || "Источник")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.subtitle || "Связанный объект")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(editTaskContext.tone || "neutral")}">${escapeHtml(getTaskSourceLabel(editTaskContext))}</div></div></div>` : '<div class="workspace-empty workspace-empty--tight">Задача пока не привязана к CRM, складу или продажам.</div>'}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Лента задачи</h4><div class="compact-help">Здесь собирается живая история самой задачи и событий из её источника: сделки, оплаты, резервов и складских движений.</div></div><div class="workspace-note">Событий: ${escapeHtml(formatNumber(editTaskTimeline.length))}</div></div>
            <div class="workspace-stack">${editTaskTimeline.slice(0, 12).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Без деталей")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">Открыть</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">История по задаче пока пустая.</div>'}</div>
          </section>
        </div>` : ""}
        ${editTask && editTaskContext ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Источник задачи</h4><div class="compact-help">Карточка связи помогает понять, из какого бизнес-контекста задача пришла и куда она влияет.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>Контур</span><strong>${escapeHtml(editTaskContext.type === "crm" || editTaskContext.type === "crm-signal" ? "CRM" : editTaskContext.type === "warehouse" || editTaskContext.type === "warehouse-signal" ? "Склад" : "Продажи")}</strong></div>
              ${typeof editTaskContext.amount !== "undefined" ? `<div class="workspace-stage-card"><span>Сумма</span><strong>${escapeHtml(formatMoney(editTaskContext.amount || 0))}</strong></div>` : ""}
              ${typeof editTaskContext.available !== "undefined" ? `<div class="workspace-stage-card"><span>Доступно</span><strong>${escapeHtml(formatNumber(editTaskContext.available || 0))}</strong></div>` : ""}
              ${editTaskContext.stageLabel ? `<div class="workspace-stage-card"><span>Статус</span><strong>${escapeHtml(editTaskContext.stageLabel)}</strong></div>` : ""}
              ${editTaskContext.dueDate ? `<div class="workspace-stage-card"><span>Срок / дата</span><strong>${escapeHtml(formatDate(editTaskContext.dueDate))}</strong></div>` : ""}
            </div>
            <div class="workspace-stack mt-3">
              <div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.title || "Источник")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.subtitle || "Связанный объект платформы")}</div></div><div class="text-end">${editTaskContext.moduleKey === "sales" ? `<div class="workspace-card__actions"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">Открыть Продажи</button></div>` : editTaskContext.entityId ? `<div class="workspace-card__actions"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${editTaskContext.moduleKey}:${editTaskContext.entityId}`)}">Открыть источник</button></div>` : ""}</div></div>
              ${editTaskContext.order ? `<div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.order.orderNumber || editTaskContext.order.title || "Заказ")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.order.client || "Клиент не указан")} • ${escapeHtml(editTaskContext.order.manager || "Без менеджера")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(editTaskContext.order.amount || 0))}</div></div></div>` : ""}
              ${editTaskContext.note ? `<div class="workspace-empty workspace-empty--tight">${escapeHtml(editTaskContext.note)}</div>` : ""}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Связанные действия</h4><div class="compact-help">Соседние задачи и движения, которые относятся к тому же источнику.</div></div></div>
            <div class="workspace-stack">
              ${editTaskContext.relatedTasks?.length ? editTaskContext.relatedTasks.slice(0, 5).map((task) => `<div class="workspace-list-item"><div><strong>${escapeHtml(task.title || "Задача")}</strong><div class="workspace-list-item__meta">${escapeHtml(task.owner || "Без ответственного")} • ${escapeHtml(getTaskStatusMeta(task.status).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(task.status).tone)}">${escapeHtml(getPriorityLabel(task.priority))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(task.id)}">Открыть</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">Других связанных задач пока нет.</div>'}
              ${editTaskContext.reservation?.rows?.length ? `<div><div class="panel-heading panel-heading--compact"><div><h4>Резерв материалов</h4><div class="compact-help">Материалы, уже зарезервированные под связанный источник.</div></div></div><div class="workspace-stack">${sortByDateDesc(editTaskContext.reservation.rows, "date").slice(0, 4).map((movement) => { const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); return `<div class="workspace-list-item"><div><strong>${escapeHtml(item?.name || "Позиция")}</strong><div class="workspace-list-item__meta">${escapeHtml(movement.kind === "release" ? "снятие резерва" : "резерв")} • ${escapeHtml(formatDate(movement.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div>${movement.itemId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(movement.itemId)}">Открыть</button></div>` : ""}</div></div>`; }).join("")}</div></div>` : ""}
              ${editTaskContext.movements?.length ? `<div><div class="panel-heading panel-heading--compact"><div><h4>Последние движения</h4><div class="compact-help">Свежие изменения по складской позиции, к которой привязана задача.</div></div></div><div class="workspace-stack">${editTaskContext.movements.map((movement) => `<div class="workspace-list-item"><div><strong>${escapeHtml(WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind)?.label || movement.kind)}</strong><div class="workspace-list-item__meta">${escapeHtml(formatDate(movement.date))} • ${escapeHtml(movement.note || "Без комментария")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div></div></div>`).join("")}</div></div>` : ""}
            </div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "form") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Итерации</h4><div class="compact-help">Текущий активный цикл: ${escapeHtml(activeSprint?.title || "не выбран")}</div></div></div>
          <div class="workspace-sprint-strip">${sprintOptions.length ? sprintOptions.map((sprint) => { const sprintTasks = taskList.filter((task) => task.sprintId === sprint.id); return `<article class="workspace-sprint-card ${activeSprint?.id === sprint.id ? "active" : ""}"><div class="workspace-card__head"><strong>${escapeHtml(sprint.title)}</strong><span>${escapeHtml(String(sprintTasks.length))}</span></div><div class="workspace-card__meta">${escapeHtml(formatDate(sprint.startDate))} — ${escapeHtml(formatDate(sprint.endDate))}</div>${sprint.goal ? `<div class="workspace-card__note">${escapeHtml(sprint.goal)}</div>` : ""}<div class="workspace-card__actions mt-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-sprint-edit="${escapeHtml(sprint.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-sprint-delete="${escapeHtml(sprint.id)}">Удалить</button>` : ""}</div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Итерации пока не созданы.</div>'}</div>
        </section>` : ""}
        ${modeIs(filters, "board") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Канбан</h4><div class="compact-help">Карточки отражают текущую загрузку команды и дают быстрый доступ к правке статуса.</div></div><div class="workspace-note">Показано: ${escapeHtml(String(filteredTasks.length))}</div></div>
          <div class="workspace-board workspace-board--tasks">${TASK_STATUSES.map((status) => { const laneTasks = filteredTasks.filter((task) => task.status === status.key); return `<article class="workspace-lane"><div class="workspace-lane__head"><strong>${escapeHtml(status.label)}</strong><span>${escapeHtml(String(laneTasks.length))}</span></div><div class="workspace-lane__body">${laneTasks.length ? laneTasks.map((task) => { const integration = getTaskIntegrationMeta(task); return `<article class="workspace-card workspace-card--${escapeHtml(status.tone)}"><div class="workspace-card__head"><strong>${escapeHtml(task.title || "Задача")}</strong><span>${escapeHtml(getPriorityLabel(task.priority))}</span></div><div class="workspace-card__meta">${escapeHtml(task.owner || "Без ответственного")} • срок ${escapeHtml(formatDate(task.dueDate))}</div><div class="workspace-card__meta">${escapeHtml(task.sprint?.title || "Без итерации")}</div>${integration ? `<div class="workspace-card__meta">${escapeHtml(integration.label)} • <button class="btn btn-link btn-sm p-0 align-baseline" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">${escapeHtml(modules[integration.moduleKey]?.title || integration.moduleKey)}</button></div>` : ""}${task.note ? `<div class="workspace-card__note">${escapeHtml(task.note)}</div>` : ""}${renderCustomCardSection("tasks", doc, task, escapeHtml)}${task.blocked ? '<div class="workspace-tag workspace-tag--danger mt-2">Есть блокер</div>' : ""}<div class="workspace-card__footer">${canEdit ? `<select class="form-select form-select-sm workspace-inline-select" data-task-status-select="${escapeHtml(task.id)}">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === task.status ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>` : `<span class="workspace-tag workspace-tag--${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>`}<div class="workspace-card__actions">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Изменить</button><button class="btn btn-sm btn-outline-secondary" type="button" data-task-duplicate="${escapeHtml(task.id)}">Копия</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-task-delete="${escapeHtml(task.id)}">Удалить</button>` : ""}</div></div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Пусто</div>'}</div></article>`; }).join("")}</div>
        </section>` : ""}
        ${modeIs(filters, "table") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Лента задач</h4><div class="compact-help">Нижняя таблица полезна для сортировки и быстрого перехода в нужную карточку.</div></div></div>
          <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Задача</th><th>Статус</th><th>Ответственный</th><th>Итерация</th><th>Срок</th><th>Приоритет</th>${customHeader}<th></th></tr></thead><tbody>${filteredTasks.length ? filteredTasks.map((task) => { const status = getTaskStatusMeta(task.status); const integration = getTaskIntegrationMeta(task); return `<tr><td><strong>${escapeHtml(task.title || "Задача")}</strong>${task.blocked ? '<div class="workspace-table__sub text-danger">Есть блокер</div>' : ""}${integration ? `<div class="workspace-table__sub">${escapeHtml(integration.label)}</div>` : ""}</td><td>${escapeHtml(status.label)}</td><td>${escapeHtml(task.owner || "—")}</td><td>${escapeHtml(task.sprint?.title || "—")}</td><td>${escapeHtml(formatDate(task.dueDate))}</td><td>${escapeHtml(getPriorityLabel(task.priority))}</td>${renderCustomTableCells("tasks", doc, task, escapeHtml)}<td class="text-end">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Открыть</button>` : ""}${integration ? `<button class="btn btn-sm btn-outline-secondary ms-2" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">Источник</button>` : ""}</td></tr>`; }).join("") : `<tr><td colspan="${8 + getVisibleCustomFields("tasks", doc, "showInTable").length}" class="text-muted">По текущим фильтрам задач нет.</td></tr>`}</tbody></table></div>
        </section>` : ""}
        ${renderRelatedLinks("tasks")}
      </div>
    `;
  }

  async function render(moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (!supports(canonicalModuleKey)) return "";
    if (canonicalModuleKey === "directories") return await renderDirectories(await ensureDocument("directories"));
    const doc = await ensureDocument(moduleKey);
    if (canonicalModuleKey === "crm") return await renderCrm(doc);
    if (canonicalModuleKey === "warehouse") return await renderWarehouse(doc, moduleKey);
    if (canonicalModuleKey === "tasks") return await renderTasks(doc);
    return "";
  }

  async function refresh(moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (!supports(canonicalModuleKey)) return;
    externalDocs.sales = null;
    externalDocs.myCalculator = null;
    externalDocs.partnerCalculators = null;
    await ensureDocument(canonicalModuleKey, true);
  }

  function resetFormState(moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (ui[canonicalModuleKey]) ui[canonicalModuleKey].modal = "";
    if (canonicalModuleKey === "crm") ui.crm.editId = null;
    if (canonicalModuleKey === "warehouse") {
      ui.warehouse.itemEditId = null;
      ui.warehouse.productEditId = null;
      ui.warehouse.purchaseEditId = null;
      ui.warehouse.financeEditId = null;
      ui.warehouse.productionEditId = null;
      ui.warehouse.movementItemId = "";
    }
    if (canonicalModuleKey === "tasks") {
      ui.tasks.taskEditId = null;
      ui.tasks.sprintEditId = null;
    }
  }

  function focusEntity(moduleKey, entity = {}) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (canonicalModuleKey === "crm") {
      ui.crm.modal = "";
      ui.crm.editId = compactText(entity.entityId || entity.dealId || entity.id);
      ui.crm.mode = "form";
      persistUiState("crm");
      return;
    }
    if (moduleKey === "products") {
      ui.warehouse.modal = "";
      ui.warehouse.productEditId = compactText(entity.entityId || entity.productId || entity.id);
      ui.warehouse.mode = "products";
      persistUiState("warehouse");
      return;
    }
    if (moduleKey === "purchases") {
      ui.warehouse.modal = "";
      ui.warehouse.purchaseEditId = compactText(entity.entityId || entity.purchaseId || entity.id);
      ui.warehouse.mode = "purchases";
      persistUiState("warehouse");
      return;
    }
    if (moduleKey === "money") {
      ui.warehouse.modal = "";
      ui.warehouse.financeEditId = compactText(entity.entityId || entity.financeId || entity.id);
      ui.warehouse.mode = "finance";
      persistUiState("warehouse");
      return;
    }
    if (moduleKey === "production") {
      ui.warehouse.modal = "";
      ui.warehouse.productionEditId = compactText(entity.entityId || entity.productionId || entity.id);
      ui.warehouse.mode = "production";
      persistUiState("warehouse");
      return;
    }
    if (canonicalModuleKey === "warehouse") {
      ui.warehouse.modal = "";
      ui.warehouse.itemEditId = compactText(entity.entityId || entity.itemId || entity.id);
      ui.warehouse.mode = "form";
      persistUiState("warehouse");
      return;
    }
    if (canonicalModuleKey === "tasks") {
      ui.tasks.modal = "";
      ui.tasks.taskEditId = compactText(entity.entityId || entity.taskId || entity.id);
      ui.tasks.mode = "form";
      persistUiState("tasks");
    }
  }

  async function handleCrmSubmit(form) {
    const doc = await ensureDocument("crm");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.deals || []).find((deal) => deal.id === id) || null;
    const record = {
      id: id || createId("deal"),
      title: compactText(formData.get("title")),
      client: compactText(formData.get("client")),
      channel: compactText(formData.get("channel")),
      owner: compactText(formData.get("owner")),
      stage: compactText(formData.get("stage")) || "lead",
      amount: toNumber(formData.get("amount")),
      deadline: normalizeDateInput(formData.get("deadline")),
      note: compactText(formData.get("note")),
      custom: readCustomValuesFromForm("crm", doc, formData, existing?.custom),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const deals = [...(doc.deals || [])];
    const index = deals.findIndex((deal) => deal.id === record.id);
    if (index >= 0) deals[index] = record;
    else deals.unshift(record);
    ui.crm.editId = null;
    ui.crm.modal = "";
    clearDraft("crm", "deal");
    persistUiState("crm");
    await saveDocument("crm", { ...doc, deals }, index >= 0 ? "Сделка обновлена." : "Сделка добавлена.");
    await rerenderCurrentModule();
  }

  async function handleWarehouseItemSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.items || []).find((item) => item.id === id) || null;
    const record = {
      id: id || createId("item"),
      name: compactText(formData.get("name")),
      sku: compactText(formData.get("sku")),
      category: compactText(formData.get("category")),
      unit: compactText(formData.get("unit")) || "шт",
      openingStock: toNumber(formData.get("openingStock")),
      minStock: toNumber(formData.get("minStock")),
      note: compactText(formData.get("note")),
      custom: readCustomValuesFromForm("warehouse", doc, formData, existing?.custom),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const items = [...(doc.items || [])];
    const index = items.findIndex((item) => item.id === record.id);
    if (index >= 0) items[index] = record;
    else items.unshift(record);
    ui.warehouse.itemEditId = null;
    ui.warehouse.modal = "";
    clearDraft("warehouse", "item");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, items }, index >= 0 ? "Позиция склада обновлена." : "Позиция склада добавлена.");
    await rerenderCurrentModule();
  }

  async function handleWarehouseMovementSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const record = {
      id: createId("move"),
      itemId: compactText(formData.get("itemId")),
      kind: compactText(formData.get("kind")) || "in",
      qty: toNumber(formData.get("qty")),
      date: normalizeDateInput(formData.get("date")) || todayString(),
      note: compactText(formData.get("note")),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.itemId) throw new Error("Выберите позицию для движения.");
    ui.warehouse.movementItemId = record.itemId;
    ui.warehouse.modal = "";
    clearDraft("warehouse", "movement");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, movements: [record, ...(doc.movements || [])] }, "Движение по складу сохранено.");
    await rerenderCurrentModule();
  }

  async function handleWarehouseProductSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.products || []).find((item) => item.id === id) || null;
    const record = {
      id: id || createId("product"),
      name: compactText(formData.get("name")),
      sku: compactText(formData.get("sku")),
      group: compactText(formData.get("group")),
      supplier: compactText(formData.get("supplier")),
      unit: compactText(formData.get("unit")) || "шт",
      purchasePrice: toNumber(formData.get("purchasePrice")),
      salePrice: toNumber(formData.get("salePrice")),
      note: compactText(formData.get("note")),
      custom: existing?.custom && typeof existing.custom === "object" ? existing.custom : {},
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.name) throw new Error("Укажите название товара.");
    const products = [...(doc.products || [])];
    const index = products.findIndex((item) => item.id === record.id);
    if (index >= 0) products[index] = record;
    else products.unshift(record);
    ui.warehouse.productEditId = null;
    ui.warehouse.modal = "";
    ui.warehouse.mode = "products";
    clearDraft("warehouse", "product");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, products }, index >= 0 ? "Товар обновлен." : "Товар добавлен.");
    await rerenderCurrentModule();
  }

  async function handleWarehousePurchaseSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.purchases || []).find((item) => item.id === id) || null;
    const itemId = compactText(formData.get("itemId"));
    const linkedItem = (doc.items || []).find((item) => item.id === itemId) || null;
    const record = {
      id: id || createId("purchase"),
      number: compactText(formData.get("number")) || `P-${Date.now().toString().slice(-6)}`,
      supplier: compactText(formData.get("supplier")),
      status: compactText(formData.get("status")) || "draft",
      date: normalizeDateInput(formData.get("date")) || todayString(),
      expectedDate: normalizeDateInput(formData.get("expectedDate")),
      amount: toNumber(formData.get("amount")),
      itemId,
      itemLabel: linkedItem?.name || compactText(formData.get("itemLabel")),
      account: compactText(formData.get("account")),
      note: compactText(formData.get("note")),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.supplier) throw new Error("Укажите поставщика.");
    const purchases = [...(doc.purchases || [])];
    const purchaseIndex = purchases.findIndex((item) => item.id === record.id);
    if (purchaseIndex >= 0) purchases[purchaseIndex] = record;
    else purchases.unshift(record);

    let movements = [...(doc.movements || [])];
    const linkedMovementIndex = movements.findIndex(
      (movement) => compactText(movement?.integration?.purchaseId) === record.id
    );
    if (record.status === "received" && record.itemId && record.amount > 0) {
      const qty = Math.max(1, toNumber(formData.get("qty")) || record.amount);
      const movementRecord = {
        id: linkedMovementIndex >= 0 ? movements[linkedMovementIndex].id : createId("move"),
        itemId: record.itemId,
        kind: "in",
        qty,
        date: record.date,
        note: record.note || `Приемка по закупке ${record.number}`,
        integration: {
          sourceApp: "platform_purchase_flow",
          purchaseId: record.id
        },
        createdAt: linkedMovementIndex >= 0 ? movements[linkedMovementIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (linkedMovementIndex >= 0) movements[linkedMovementIndex] = movementRecord;
      else movements.unshift(movementRecord);
    } else if (linkedMovementIndex >= 0) {
      movements = movements.filter((movement) => compactText(movement?.integration?.purchaseId) !== record.id);
    }

    ui.warehouse.purchaseEditId = null;
    ui.warehouse.modal = "";
    ui.warehouse.mode = "purchases";
    clearDraft("warehouse", "purchase");
    persistUiState("warehouse");
    await saveDocument(
      "warehouse",
      { ...doc, purchases, movements },
      purchaseIndex >= 0 ? "Закупка обновлена." : "Закупка добавлена."
    );
    await rerenderCurrentModule();
  }

  async function handleWarehouseFinanceSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.financeEntries || []).find((item) => item.id === id) || null;
    const record = {
      id: id || createId("finance"),
      kind: compactText(formData.get("kind")) || "expense",
      date: normalizeDateInput(formData.get("date")) || todayString(),
      account: compactText(formData.get("account")),
      category: compactText(formData.get("category")),
      counterparty: compactText(formData.get("counterparty")),
      amount: toNumber(formData.get("amount")),
      note: compactText(formData.get("note")),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.account) throw new Error("Укажите счет или кассу.");
    if (!record.category) throw new Error("Укажите статью операции.");
    const financeEntries = [...(doc.financeEntries || [])];
    const index = financeEntries.findIndex((item) => item.id === record.id);
    if (index >= 0) financeEntries[index] = record;
    else financeEntries.unshift(record);
    ui.warehouse.financeEditId = null;
    ui.warehouse.modal = "";
    ui.warehouse.mode = "finance";
    clearDraft("warehouse", "finance");
    persistUiState("warehouse");
    await saveDocument(
      "warehouse",
      { ...doc, financeEntries },
      index >= 0 ? "Операция обновлена." : "Операция сохранена."
    );
    await rerenderCurrentModule();
  }

  async function handleWarehouseProductionSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.productionJobs || []).find((item) => item.id === id) || null;
    const itemId = compactText(formData.get("itemId"));
    const linkedItem = (doc.items || []).find((item) => item.id === itemId) || null;
    const record = {
      id: id || createId("prod"),
      title: compactText(formData.get("title")),
      stage: compactText(formData.get("stage")) || "queue",
      deadline: normalizeDateInput(formData.get("deadline")) || todayString(),
      assignee: compactText(formData.get("assignee")),
      qty: toNumber(formData.get("qty")),
      itemId,
      itemLabel: linkedItem?.name || compactText(formData.get("itemLabel")),
      note: compactText(formData.get("note")),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.title) throw new Error("Укажите название задания.");
    const productionJobs = [...(doc.productionJobs || [])];
    const index = productionJobs.findIndex((item) => item.id === record.id);
    if (index >= 0) productionJobs[index] = record;
    else productionJobs.unshift(record);
    ui.warehouse.productionEditId = null;
    ui.warehouse.modal = "";
    ui.warehouse.mode = "production";
    clearDraft("warehouse", "production");
    persistUiState("warehouse");
    await saveDocument(
      "warehouse",
      { ...doc, productionJobs },
      index >= 0 ? "Производственное задание обновлено." : "Производственное задание добавлено."
    );
    await rerenderCurrentModule();
  }

  async function handleTasksTaskSubmit(form) {
    const doc = await ensureDocument("tasks");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.tasks || []).find((task) => task.id === id) || null;
    const record = {
      id: id || createId("task"),
      title: compactText(formData.get("title")),
      owner: compactText(formData.get("owner")),
      status: compactText(formData.get("status")) || "backlog",
      priority: compactText(formData.get("priority")) || "medium",
      sprintId: compactText(formData.get("sprintId")) || "",
      dueDate: normalizeDateInput(formData.get("dueDate")),
      blocked: formData.get("blocked") === "on",
      note: compactText(formData.get("note")),
      custom: readCustomValuesFromForm("tasks", doc, formData, existing?.custom),
      history: appendTaskHistory(
        existing,
        existing
          ? createTaskHistoryEntry({
              title: "Карточка задачи обновлена",
              meta: buildTaskChangeMeta(existing, {
                title: compactText(formData.get("title")),
                owner: compactText(formData.get("owner")),
                status: compactText(formData.get("status")) || "backlog",
                priority: compactText(formData.get("priority")) || "medium",
                sprintId: compactText(formData.get("sprintId")) || "",
                dueDate: normalizeDateInput(formData.get("dueDate")),
                blocked: formData.get("blocked") === "on",
                note: compactText(formData.get("note")),
                custom: readCustomValuesFromForm("tasks", doc, formData, existing?.custom)
              }, doc.sprints),
              tone: "info",
              moduleKey: "tasks",
              entityId: existing.id
            })
          : createTaskHistoryEntry({
              title: "Задача создана",
              meta: "Карточка заведена вручную в тасктрекере.",
              tone: "success",
              moduleKey: "tasks"
            })
      ),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const tasks = [...(doc.tasks || [])];
    const index = tasks.findIndex((task) => task.id === record.id);
    if (index >= 0) tasks[index] = record;
    else tasks.unshift(record);
    ui.tasks.taskEditId = null;
    ui.tasks.modal = "";
    clearDraft("tasks", "task");
    persistUiState("tasks");
    await saveDocument("tasks", { ...doc, tasks }, index >= 0 ? "Задача обновлена." : "Задача добавлена.");
    await rerenderCurrentModule();
  }

  async function handleTasksSprintSubmit(form) {
    const doc = await ensureDocument("tasks");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const existing = (doc.sprints || []).find((sprint) => sprint.id === id) || null;
    const record = {
      id: id || createId("sprint"),
      title: compactText(formData.get("title")),
      startDate: normalizeDateInput(formData.get("startDate")),
      endDate: normalizeDateInput(formData.get("endDate")),
      goal: compactText(formData.get("goal")),
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const sprints = [...(doc.sprints || [])];
    const index = sprints.findIndex((sprint) => sprint.id === record.id);
    if (index >= 0) sprints[index] = record;
    else sprints.unshift(record);
    ui.tasks.sprintEditId = null;
    ui.tasks.modal = "";
    clearDraft("tasks", "sprint");
    persistUiState("tasks");
    await saveDocument("tasks", { ...doc, sprints }, index >= 0 ? "Итерация обновлена." : "Итерация добавлена.");
    await rerenderCurrentModule();
  }

  async function handleDirectoriesListSubmit(form) {
    const doc = await ensureDocument("directories");
    const formData = new FormData(form);
    const incoming = normalizeDirectoryList({
      id: formData.get("id"),
      key: formData.get("key"),
      title: formData.get("title"),
      description: formData.get("description")
    });
    if (!incoming) {
      throw new Error("Укажите название и ключ справочника.");
    }
    const lists = [...(doc.lists || [])];
    const existingIndex = lists.findIndex((list) => list.id === incoming.id || list.key === incoming.key);
    if (existingIndex >= 0) {
      lists[existingIndex] = { ...lists[existingIndex], ...incoming, options: lists[existingIndex].options || [] };
    } else {
      lists.unshift({ ...incoming, options: [] });
    }
    ui.directories.activeListId = incoming.key;
    ui.directories.modal = "";
    persistUiState("directories");
    await saveDocument("directories", { ...doc, lists }, existingIndex >= 0 ? "Справочник обновлён." : "Справочник создан.");
    await rerenderCurrentModule();
  }

  async function handleDirectoriesOptionSubmit(form) {
    const doc = await ensureDocument("directories");
    const formData = new FormData(form);
    const listKey = sanitizeKey(formData.get("key"));
    const option = compactText(formData.get("option"));
    if (!listKey || !option) {
      throw new Error("Выберите справочник и укажите значение.");
    }
    const lists = [...(doc.lists || [])];
    const index = lists.findIndex((list) => list.key === listKey || list.id === listKey);
    if (index < 0) {
      throw new Error("Справочник не найден.");
    }
    lists[index] = { ...lists[index], options: [...new Set([...(lists[index].options || []), option])] };
    ui.directories.activeListId = lists[index].key;
    ui.directories.modal = "";
    persistUiState("directories");
    await saveDocument("directories", { ...doc, lists }, "Значение добавлено в справочник.");
    await rerenderCurrentModule();
  }

  async function updateTaskRecord(taskId, successMessage, mutate) {
    const doc = await ensureDocument("tasks");
    const tasks = [...(doc.tasks || [])];
    const index = tasks.findIndex((task) => task.id === taskId);
    if (index < 0) return null;
    const current = tasks[index];
    const updated = mutate(deepClone(current), doc);
    if (!updated) return null;
    tasks[index] = {
      ...updated,
      updatedAt: new Date().toISOString(),
      history: Array.isArray(updated.history)
        ? updated.history.map((entry) => normalizeTaskHistoryEntry(entry)).filter(Boolean)
        : []
    };
    await saveDocument("tasks", { ...doc, tasks }, successMessage);
    return tasks[index];
  }

  async function importDealsFromSales() {
    const doc = await ensureDocument("crm");
    const salesSnapshot = buildSalesSnapshot(await ensureExternalDoc("sales", true));
    const existingSourceKeys = new Set(
      (doc.deals || [])
        .map((deal) => compactText(deal?.integration?.sourceKey || deal?.sourceKey))
        .filter(Boolean)
    );
    const nextDeals = [...(doc.deals || [])];
    const importableOrders = salesSnapshot.orders.filter((order) => !existingSourceKeys.has(getSalesSourceKey(order)));

    if (!importableOrders.length) {
      setStatus("Новых заказов из Продаж для CRM нет.", "success");
      return;
    }

    importableOrders.forEach((order) => {
      nextDeals.unshift({
        id: createId("deal"),
        title: compactText(order.title || `Заказ ${order.orderNumber}`),
        client: compactText(order.client),
        channel: compactText(order.leadChannel || order.salesChannel),
        owner: compactText(order.manager),
        stage: deriveSalesDealStage(order),
        amount: toNumber(order.amount),
        deadline: normalizeDateInput(order.deliveryDate || order.invoiceDate || order.createdAt),
        note: `Импорт из Продаж. Заказ ${compactText(order.orderNumber || "без номера")}${order.city ? ` • ${order.city}` : ""}${order.status ? ` • статус: ${order.status}` : ""}.`,
        custom: {},
        integration: {
          sourceApp: EXTERNAL_SHARED_APPS.sales,
          sourceKey: getSalesSourceKey(order),
          sourceRecordId: order.sourceId,
          orderNumber: order.orderNumber
        },
        sourceKey: getSalesSourceKey(order),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    });

    ui.crm.mode = "table";
    persistUiState("crm");
    await saveDocument("crm", { ...doc, deals: nextDeals }, `Из Продаж импортировано ${importableOrders.length} сделок.`);
    await rerenderCurrentModule();
  }

  async function seedWarehouseItemsFromCalculators() {
    const doc = await ensureDocument("warehouse");
    const snapshot = buildWarehouseSnapshot(doc);
    const calculatorSnapshot = buildCalculatorDemandSnapshot(
      await ensureExternalDoc("myCalculator", true),
      await ensureExternalDoc("partnerCalculators", true)
    );
    const existingKeys = new Set(
      snapshot.items.flatMap((item) => [compactText(item.sku).toLowerCase(), compactText(item.name).toLowerCase()]).filter(Boolean)
    );
    const newItems = calculatorSnapshot.demand
      .filter((entry) => !existingKeys.has(compactText(entry.sku).toLowerCase()))
      .map((entry) => ({
        id: createId("item"),
        name: `Материал ${entry.sku}`,
        sku: entry.sku,
        category: "Импорт из калькуляторов",
        unit: "ед.",
        openingStock: 0,
        minStock: Math.max(1, Math.ceil(toNumber(entry.qtyTotal))),
        note: `Создано из калькуляторов. Источники: ${entry.sources.join(", ")}.`,
        custom: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

    if (!newItems.length) {
      setStatus("Все артикулы из калькуляторов уже заведены на складе.", "success");
      return;
    }

    ui.warehouse.mode = "catalog";
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, items: [...newItems, ...(doc.items || [])] }, `На склад добавлено ${newItems.length} позиций из калькуляторов.`);
    await rerenderCurrentModule();
  }

  async function generateTasksFromSignals() {
    const doc = await ensureDocument("tasks");
    const taskSignals = await buildTaskSignalSnapshot(doc);
    const sourceKeys = new Set((doc.tasks || []).map((task) => compactText(task?.integration?.sourceKey || task?.sourceKey)).filter(Boolean));
    const sprintId = getCurrentActiveSprintId(doc);
    const records = taskSignals.newSignals
      .filter((signal) => !sourceKeys.has(signal.sourceKey))
      .map((signal) => ({
        id: createId("task"),
        title: signal.title,
        owner: compactText(signal.owner),
        status: "todo",
        priority: signal.priority,
        sprintId,
        dueDate: normalizeDateInput(signal.dueDate) || todayString(),
        blocked: false,
        note: signal.note,
        custom: {},
        integration: {
          sourceApp: "platform_risk_engine",
          sourceKey: signal.sourceKey,
          family: signal.family
        },
        sourceKey: signal.sourceKey,
        history: [
          createTaskHistoryEntry({
            title: "Задача создана из операционного сигнала",
            meta: `${signal.family} • ${signal.note}`,
            tone: signal.priority === "urgent" ? "danger" : "warning",
            moduleKey: "tasks"
          })
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

    if (!records.length) {
      setStatus("Новых задач из рисков не найдено.", "success");
      return;
    }

    ui.tasks.mode = "table";
    persistUiState("tasks");
    await saveDocument("tasks", { ...doc, tasks: [...records, ...(doc.tasks || [])] }, `Создано ${records.length} задач из операционных сигналов.`);
    await rerenderCurrentModule();
  }

  async function createTaskFromDeal(dealId) {
    const crmDoc = await ensureDocument("crm");
    const tasksDoc = await ensureDocument("tasks");
    const deal = (crmDoc.deals || []).find((entry) => entry.id === dealId);
    if (!deal) {
      setStatus("Сделка не найдена.", "error");
      return;
    }
    const sourceKey = getCrmDealSourceKey(deal.id);
    const existingTask = (tasksDoc.tasks || []).find((task) => compactText(task?.integration?.sourceKey || task?.sourceKey) === sourceKey);
    if (existingTask) {
      focusEntity("tasks", { entityId: existingTask.id });
      window.dispatchEvent(
        new CustomEvent("dom-neona:workspace-open", {
          detail: {
            moduleKey: "tasks",
            entityId: existingTask.id
          }
        })
      );
      setStatus("Открываю уже существующую задачу по сделке.", "success");
      return;
    }
    const sprintId = getCurrentActiveSprintId(tasksDoc);
    const record = {
      id: createId("task"),
      title: `Сделка: ${compactText(deal.title || deal.client || "без названия")}`,
      owner: compactText(deal.owner),
      status: "todo",
      priority: deal.stage === "production" ? "urgent" : "high",
      sprintId,
      dueDate: normalizeDateInput(deal.deadline) || todayString(),
      blocked: false,
      note: `Создано из CRM. Клиент: ${compactText(deal.client || "не указан")}. Стадия: ${getCrmStageMeta(deal.stage).label}.`,
      custom: {},
      integration: {
        sourceApp: "platform_crm_manual",
        sourceKey,
        dealId: deal.id
      },
      sourceKey,
      history: [
        createTaskHistoryEntry({
          title: "Задача создана из CRM",
          meta: `Сделка: ${compactText(deal.title || deal.client || "без названия")} • ${getCrmStageMeta(deal.stage).label}`,
          tone: deal.stage === "production" ? "warning" : "info",
          moduleKey: "crm",
          entityId: deal.id
        })
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("tasks", { ...tasksDoc, tasks: [record, ...(tasksDoc.tasks || [])] }, "Задача по сделке создана.");
    rerenderDashboard();
    await rerenderCurrentModule();
  }

  async function createTaskFromWarehouseItem(itemId) {
    const warehouseDoc = await ensureDocument("warehouse");
    const tasksDoc = await ensureDocument("tasks");
    const item = (warehouseDoc.items || []).find((entry) => entry.id === itemId);
    if (!item) {
      setStatus("Позиция склада не найдена.", "error");
      return;
    }
    const sourceKey = getWarehouseItemSourceKey(item.id);
    const existingTask = (tasksDoc.tasks || []).find((task) => compactText(task?.integration?.sourceKey || task?.sourceKey) === sourceKey);
    if (existingTask) {
      focusEntity("tasks", { entityId: existingTask.id });
      window.dispatchEvent(
        new CustomEvent("dom-neona:workspace-open", {
          detail: {
            moduleKey: "tasks",
            entityId: existingTask.id
          }
        })
      );
      setStatus("Открываю уже существующую задачу по позиции склада.", "success");
      return;
    }
    const sprintId = getCurrentActiveSprintId(tasksDoc);
    const record = {
      id: createId("task"),
      title: `Склад: ${compactText(item.name || item.sku || "позиция")}`,
      owner: "Закупки",
      status: "todo",
      priority: "high",
      sprintId,
      dueDate: todayString(),
      blocked: false,
      note: `Создано из склада. SKU: ${compactText(item.sku || "—")}. Минимум: ${formatNumber(item.minStock || 0)}.`,
      custom: {},
      integration: {
        sourceApp: "platform_warehouse_manual",
        sourceKey,
        itemId: item.id
      },
      sourceKey,
      history: [
        createTaskHistoryEntry({
          title: "Задача создана из склада",
          meta: `Позиция: ${compactText(item.name || item.sku || "без названия")} • минимум ${formatNumber(item.minStock || 0)}`,
          tone: "warning",
          moduleKey: "warehouse",
          entityId: item.id
        })
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("tasks", { ...tasksDoc, tasks: [record, ...(tasksDoc.tasks || [])] }, "Задача по позиции склада создана.");
    rerenderDashboard();
    await rerenderCurrentModule();
  }

  async function handleCrmReserveSubmit(form) {
    const crmDoc = await ensureDocument("crm");
    const warehouseDoc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const dealId = compactText(formData.get("dealId"));
    const itemId = compactText(formData.get("itemId"));
    const qty = toNumber(formData.get("qty"));
    if (!dealId || !itemId || qty <= 0) {
      throw new Error("Выберите сделку, позицию склада и количество.");
    }
    const deal = (crmDoc.deals || []).find((entry) => entry.id === dealId);
    const item = (warehouseDoc.items || []).find((entry) => entry.id === itemId);
    if (!deal || !item) {
      throw new Error("Сделка или позиция склада не найдены.");
    }
    ui.crm.modal = "";
    clearDraft("crm", "reserve");
    persistUiState("crm");
    const movement = {
      id: createId("move"),
      itemId,
      kind: "reserve",
      qty,
      date: normalizeDateInput(formData.get("date")) || todayString(),
      note: compactText(formData.get("note")) || `Резерв под сделку ${compactText(deal.title || deal.client || "без названия")}`,
      integration: {
        sourceApp: "platform_crm_manual",
        sourceKey: getCrmDealSourceKey(deal.id),
        dealId: deal.id,
        itemId: item.id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("warehouse", { ...warehouseDoc, movements: [movement, ...(warehouseDoc.movements || [])] }, "Резерв под сделку создан.");
    await rerenderCurrentModule();
  }

  async function handleBuilderSubmit(moduleKey, form) {
    const doc = await ensureDocument(moduleKey);
    const formData = new FormData(form);
    const action = form.dataset.builderAction;

    if (action === "view") {
      const label = compactText(formData.get("label"));
      if (!label) throw new Error("Укажите название вкладки.");
      const filterKeys = Object.keys(getDefaultFilters(moduleKey));
      const nextView = {
        id: sanitizeKey(label) || createId("view"),
        label,
        filters: Object.fromEntries(filterKeys.map((key) => [key, ui[moduleKey][key]]))
      };
      const views = [createDefaultView(moduleKey), ...(doc.builder.views || []).filter((view) => view.id !== "default" && view.id !== nextView.id), nextView];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, views } }, "Вкладка сохранена.");
      ui[moduleKey].activeViewId = nextView.id;
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return;
    }

    if (action === "field") {
      const field = normalizeFieldDefinition(moduleKey, {
        key: formData.get("key"),
        label: formData.get("label"),
        type: formData.get("type"),
        options: formData.get("options"),
        showInForm: formData.get("showInForm") === "on",
        showInTable: formData.get("showInTable") === "on",
        showInCard: formData.get("showInCard") === "on"
      });
      if (!field) throw new Error("Укажите ключ и подпись поля.");
      const fields = [...(doc.builder.fields || []).filter((item) => item.key !== field.key), field];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, fields } }, "Поле добавлено в конструктор.");
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return;
    }

    if (action === "formula") {
      const formula = normalizeFormulaDefinition({
        key: formData.get("key"),
        label: formData.get("label"),
        expression: formData.get("expression"),
        format: formData.get("format")
      });
      if (!formula || !formula.expression) throw new Error("Укажите ключ, название и формулу.");
      const formulas = [...(doc.builder.formulas || []).filter((item) => item.key !== formula.key), formula];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, formulas } }, "Формула добавлена.");
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return;
    }

    if (action === "schema") {
      const rawSchema = compactText(formData.get("schema"));
      if (!rawSchema) {
        throw new Error("Вставьте JSON-схему конструктора.");
      }
      let parsed;
      try {
        parsed = JSON.parse(rawSchema);
      } catch (error) {
        throw new Error(`JSON не распознан: ${error.message || "ошибка синтаксиса"}`);
      }
      const builder = normalizeBuilderSchema(moduleKey, parsed);
      await saveDocument(moduleKey, { ...doc, builder }, "JSON-схема конструктора сохранена.");
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
    }
  }

  async function handleSubmit(event, moduleKey) {
    if (!supports(moduleKey)) return false;
    const builderForm = event.target.closest("[data-builder-action]");
    if (builderForm) {
      event.preventDefault();
      await handleBuilderSubmit(moduleKey, builderForm);
      return true;
    }
    if (event.target.id === "directoriesListForm") {
      event.preventDefault();
      await handleDirectoriesListSubmit(event.target);
      return true;
    }
    if (event.target.id === "directoriesOptionForm") {
      event.preventDefault();
      await handleDirectoriesOptionSubmit(event.target);
      return true;
    }
    if (event.target.id === "crmDealForm") {
      event.preventDefault();
      await handleCrmSubmit(event.target);
      return true;
    }
    if (event.target.id === "crmDealModalForm") {
      event.preventDefault();
      await handleCrmSubmit(event.target);
      return true;
    }
    if (event.target.id === "crmReserveForm") {
      event.preventDefault();
      await handleCrmReserveSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseItemForm") {
      event.preventDefault();
      await handleWarehouseItemSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseItemModalForm") {
      event.preventDefault();
      await handleWarehouseItemSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseMovementForm") {
      event.preventDefault();
      await handleWarehouseMovementSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseMovementModalForm") {
      event.preventDefault();
      await handleWarehouseMovementSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseProductModalForm") {
      event.preventDefault();
      await handleWarehouseProductSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehousePurchaseModalForm") {
      event.preventDefault();
      await handleWarehousePurchaseSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseFinanceModalForm") {
      event.preventDefault();
      await handleWarehouseFinanceSubmit(event.target);
      return true;
    }
    if (event.target.id === "warehouseProductionModalForm") {
      event.preventDefault();
      await handleWarehouseProductionSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksTaskForm") {
      event.preventDefault();
      await handleTasksTaskSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksTaskModalForm") {
      event.preventDefault();
      await handleTasksTaskSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksSprintForm") {
      event.preventDefault();
      await handleTasksSprintSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksSprintModalForm") {
      event.preventDefault();
      await handleTasksSprintSubmit(event.target);
      return true;
    }
    return false;
  }

  function renderWorkspaceModalShell(title, formHtml, subtitle = "") {
    return `
      <div class="workspace-modal-backdrop" data-live-modal-backdrop>
        <div class="workspace-modal">
          <div class="workspace-modal__head">
            <div class="workspace-modal__title">
              <h3>${escapeHtml(title)}</h3>
              ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
            </div>
            <button class="btn btn-sm btn-outline-secondary" type="button" data-live-modal-close>Закрыть</button>
          </div>
          <div class="workspace-modal__body">${formHtml}</div>
        </div>
      </div>
    `;
  }

  function renderCrmReserveModal(crmDoc, warehouseDoc) {
    const reserveDealOptions = sortByDateDesc(
      (crmDoc.deals || []).length ? crmDoc.deals || [] : [],
      "updatedAt"
    );
    const draft = readDraft("crm", "reserve");
    const selectedDealId = compactText(draft?.dealId || ui.crm.editId || "");
    return renderWorkspaceModalShell(
      "Резерв материалов под сделку",
      `<form id="crmReserveForm" class="workspace-form" data-draft-form="reserve">
        <div class="workspace-form-grid">
          <label><span>Сделка</span><select class="form-select" name="dealId" required><option value="">Выберите сделку</option>${reserveDealOptions.map((deal) => `<option value="${escapeHtml(deal.id)}" ${selectedDealId === deal.id ? "selected" : ""}>${escapeHtml(deal.title || deal.client || "Сделка")} • ${escapeHtml(deal.client || "—")}</option>`).join("")}</select></label>
          <label><span>Позиция склада</span><select class="form-select" name="itemId" required><option value="">Выберите материал</option>${(warehouseDoc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${compactText(draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""} • доступно ${escapeHtml(formatNumber(toNumber(item.available || item.openingStock || 0)))}</option>`).join("")}</select></label>
          <label><span>Количество</span><input class="form-control" type="number" min="1" step="1" name="qty" value="${escapeHtml(compactText(draft?.qty || ""))}" required /></label>
          <label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draft?.date || todayString()))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="3" placeholder="Например: резерв под производство или монтаж">${escapeHtml(draftValue("", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Резервировать</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Отдельное окно для быстрого резерва материалов под сделку без перегруза основного экрана."
    );
  }

  function renderDirectoriesListModal(doc) {
    const selectedList =
      (doc.lists || []).find((list) => list.id === ui.directories.activeListId || list.key === ui.directories.activeListId) ||
      null;
    return renderWorkspaceModalShell(
      selectedList ? "Редактирование справочника" : "Новый справочник",
      `<form id="directoriesListForm" class="workspace-form">
        <input type="hidden" name="id" value="${escapeHtml(selectedList?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(selectedList?.title || "")}" placeholder="Например: Каналы CRM" required /></label>
          <label><span>Ключ</span><input class="form-control" type="text" name="key" value="${escapeHtml(selectedList?.key || "")}" placeholder="crm_channels" required /></label>
        </div>
        <label><span>Описание</span><textarea class="form-control" name="description" rows="3" placeholder="Где и для чего используется этот список">${escapeHtml(selectedList?.description || "")}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${selectedList ? "Сохранить справочник" : "Создать справочник"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Справочник создаётся один раз и потом используется в формах CRM, склада, задач и других разделов."
    );
  }

  function renderDirectoriesOptionModal(doc) {
    const selectedList =
      (doc.lists || []).find((list) => list.id === ui.directories.activeListId || list.key === ui.directories.activeListId) ||
      null;
    if (!selectedList) {
      return renderWorkspaceModalShell(
        "Сначала выберите справочник",
        `<div class="workspace-empty workspace-empty--tight">Выберите справочник в каталоге, а затем добавляйте значения.</div>`,
        "Значения всегда добавляются в конкретный справочник."
      );
    }
    return renderWorkspaceModalShell(
      "Новое значение справочника",
      `<form id="directoriesOptionForm" class="workspace-form">
        <input type="hidden" name="key" value="${escapeHtml(selectedList.key)}" />
        <label><span>Справочник</span><input class="form-control" type="text" value="${escapeHtml(selectedList.title)}" disabled /></label>
        <label><span>Новое значение</span><input class="form-control" type="text" name="option" placeholder="Добавить значение" required /></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Добавить значение</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Значение сразу появится в выпадающих списках платформы."
    );
  }

  function renderCrmCreateModal(doc) {
    const existing = (doc.deals || []).find((deal) => deal.id === ui.crm.editId) || null;
    const draft = readDraft("crm", "deal");
    return renderWorkspaceModalShell(
      existing ? "Редактирование сделки" : "Новая сделка",
      `<form id="crmDealModalForm" class="workspace-form" data-draft-form="deal">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название сделки</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>Клиент</span><input class="form-control" type="text" name="client" value="${escapeHtml(draftValue(existing?.client || "", draft?.client))}" required /></label>
          <label><span>Канал</span><input class="form-control" type="text" name="channel" value="${escapeHtml(draftValue(existing?.channel || "", draft?.channel))}" /></label>
          <label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(draftValue(existing?.owner || "", draft?.owner))}" /></label>
          <label><span>Стадия</span><select class="form-select" name="stage">${CRM_STAGES.map((stage) => `<option value="${escapeHtml(stage.key)}" ${((draftValue(existing?.stage || "lead", draft?.stage || "lead")) === stage.key) ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("")}</select></label>
          <label><span>Сумма, ₽</span><input class="form-control" type="number" min="0" step="1" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount || ""))}" /></label>
          <label><span>Срок</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(normalizeDateInput(draftValue(existing?.deadline || "", draft?.deadline || "")))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("crm", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить изменения" : "Сохранить сделку"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      existing ? "Полная карточка сделки во всплывающем окне без ухода из текущего режима." : "Быстрое создание сделки во всплывающем окне без ухода из текущего вида."
    );
  }

  function renderWarehouseItemCreateModal(doc) {
    const existing = (doc.items || []).find((item) => item.id === ui.warehouse.itemEditId) || null;
    const draft = readDraft("warehouse", "item");
    return renderWorkspaceModalShell(
      existing ? "Редактирование позиции склада" : "Новая позиция склада",
      `<form id="warehouseItemModalForm" class="workspace-form" data-draft-form="item">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название</span><input class="form-control" type="text" name="name" value="${escapeHtml(draftValue(existing?.name || "", draft?.name))}" required /></label>
          <label><span>SKU / артикул</span><input class="form-control" type="text" name="sku" value="${escapeHtml(draftValue(existing?.sku || "", draft?.sku))}" /></label>
          <label><span>Категория</span><input class="form-control" type="text" name="category" value="${escapeHtml(draftValue(existing?.category || "", draft?.category))}" /></label>
          <label><span>Ед. изм.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(draftValue(existing?.unit || "шт", draft?.unit || "шт"))}" /></label>
          <label><span>Стартовый остаток</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(draftValue(existing?.openingStock || "", draft?.openingStock || ""))}" /></label>
          <label><span>Минимум</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(draftValue(existing?.minStock || "", draft?.minStock || ""))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("warehouse", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить позицию" : "Сохранить позицию"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      existing ? "Полная карточка складской позиции во всплывающем окне без лишнего перехода по экрану." : "Создание товара или материала в отдельном окне по логике МойСклад."
    );
  }

  function renderWarehouseMovementCreateModal(doc) {
    const draft = readDraft("warehouse", "movement");
    return renderWorkspaceModalShell(
      "Новое движение по складу",
      `<form id="warehouseMovementModalForm" class="workspace-form" data-draft-form="movement">
        <div class="workspace-form-grid">
          <label><span>Позиция</span><select class="form-select" name="itemId" required><option value="">Выберите позицию</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${(ui.warehouse.movementItemId === item.id || draft?.itemId === item.id) ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>Тип</span><select class="form-select" name="kind">${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draft?.kind || "in") === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Количество</span><input class="form-control" type="number" min="0" step="1" name="qty" value="${escapeHtml(compactText(draft?.qty || ""))}" required /></label>
          <label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draft?.date || todayString()))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue("", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Сохранить движение</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Приход, списание и резерв теперь можно вносить всплывающим окном."
    );
  }

  function renderWarehouseProductCreateModal(doc) {
    const existing = (doc.products || []).find((item) => item.id === ui.warehouse.productEditId) || null;
    const draft = readDraft("warehouse", "product");
    return renderWorkspaceModalShell(
      existing ? "Редактирование товара" : "Новый товар",
      `<form id="warehouseProductModalForm" class="workspace-form" data-draft-form="product">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название</span><input class="form-control" type="text" name="name" value="${escapeHtml(draftValue(existing?.name || "", draft?.name))}" required /></label>
          <label><span>SKU / артикул</span><input class="form-control" type="text" name="sku" value="${escapeHtml(draftValue(existing?.sku || "", draft?.sku))}" /></label>
          <label><span>Группа</span><input class="form-control" type="text" name="group" value="${escapeHtml(draftValue(existing?.group || "", draft?.group))}" /></label>
          <label><span>Поставщик</span><input class="form-control" type="text" name="supplier" value="${escapeHtml(draftValue(existing?.supplier || "", draft?.supplier))}" /></label>
          <label><span>Ед. изм.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(draftValue(existing?.unit || "шт", draft?.unit || "шт"))}" /></label>
          <label><span>Закупочная цена</span><input class="form-control" type="number" min="0" step="0.01" name="purchasePrice" value="${escapeHtml(draftValue(existing?.purchasePrice || "", draft?.purchasePrice))}" /></label>
          <label><span>Цена продажи</span><input class="form-control" type="number" min="0" step="0.01" name="salePrice" value="${escapeHtml(draftValue(existing?.salePrice || "", draft?.salePrice))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить товар" : "Создать товар"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Отдельная карточка товара для каталога, цен, поставщиков и готовой продукции."
    );
  }

  function renderWarehousePurchaseCreateModal(doc) {
    const existing = (doc.purchases || []).find((item) => item.id === ui.warehouse.purchaseEditId) || null;
    const draft = readDraft("warehouse", "purchase");
    return renderWorkspaceModalShell(
      existing ? "Редактирование закупки" : "Новая закупка",
      `<form id="warehousePurchaseModalForm" class="workspace-form" data-draft-form="purchase">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Номер</span><input class="form-control" type="text" name="number" value="${escapeHtml(draftValue(existing?.number || "", draft?.number))}" /></label>
          <label><span>Поставщик</span><input class="form-control" type="text" name="supplier" value="${escapeHtml(draftValue(existing?.supplier || "", draft?.supplier))}" required /></label>
          <label><span>Статус</span><select class="form-select" name="status">${WAREHOUSE_PURCHASE_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.status || "draft", draft?.status || "draft") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draftValue(existing?.date || todayString(), draft?.date || todayString())))}" /></label>
          <label><span>Ожидаемая дата</span><input class="form-control" type="date" name="expectedDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.expectedDate || "", draft?.expectedDate || "")))}" /></label>
          <label><span>Позиция склада</span><select class="form-select" name="itemId"><option value="">Без позиции</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${draftValue(existing?.itemId || "", draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>Количество / объем</span><input class="form-control" type="number" min="0" step="0.01" name="qty" value="${escapeHtml(draftValue(existing?.qty || "", draft?.qty || ""))}" /></label>
          <label><span>Счет / касса</span><input class="form-control" type="text" name="account" value="${escapeHtml(draftValue(existing?.account || "", draft?.account))}" /></label>
          <label><span>Сумма</span><input class="form-control" type="number" min="0" step="0.01" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить закупку" : "Создать закупку"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Закупка сразу связана с поставщиком, складской позицией и приемкой на склад."
    );
  }

  function renderWarehouseFinanceCreateModal(doc) {
    const existing = (doc.financeEntries || []).find((item) => item.id === ui.warehouse.financeEditId) || null;
    const draft = readDraft("warehouse", "finance");
    return renderWorkspaceModalShell(
      existing ? "Редактирование операции" : "Новая денежная операция",
      `<form id="warehouseFinanceModalForm" class="workspace-form" data-draft-form="finance">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Тип</span><select class="form-select" name="kind">${FINANCE_ENTRY_KINDS.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.kind || "expense", draft?.kind || "expense") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draftValue(existing?.date || todayString(), draft?.date || todayString())))}" /></label>
          <label><span>Счет</span><input class="form-control" type="text" name="account" value="${escapeHtml(draftValue(existing?.account || "", draft?.account))}" required /></label>
          <label><span>Статья</span><input class="form-control" type="text" name="category" value="${escapeHtml(draftValue(existing?.category || "", draft?.category))}" required /></label>
          <label><span>Контрагент</span><input class="form-control" type="text" name="counterparty" value="${escapeHtml(draftValue(existing?.counterparty || "", draft?.counterparty))}" /></label>
          <label><span>Сумма</span><input class="form-control" type="number" min="0" step="0.01" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить операцию" : "Сохранить операцию"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Приходы, расходы и перемещения денег в одном окне с привязкой к счетам и статьям."
    );
  }

  function renderWarehouseProductionCreateModal(doc) {
    const existing = (doc.productionJobs || []).find((item) => item.id === ui.warehouse.productionEditId) || null;
    const draft = readDraft("warehouse", "production");
    return renderWorkspaceModalShell(
      existing ? "Редактирование производства" : "Новое производственное задание",
      `<form id="warehouseProductionModalForm" class="workspace-form" data-draft-form="production">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название задания</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>Этап</span><select class="form-select" name="stage">${PRODUCTION_JOB_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.stage || "queue", draft?.stage || "queue") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Срок</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(normalizeDateInput(draftValue(existing?.deadline || todayString(), draft?.deadline || todayString())))}" /></label>
          <label><span>Ответственный</span><input class="form-control" type="text" name="assignee" value="${escapeHtml(draftValue(existing?.assignee || "", draft?.assignee))}" /></label>
          <label><span>Позиция склада</span><select class="form-select" name="itemId"><option value="">Без позиции</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${draftValue(existing?.itemId || "", draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>Количество</span><input class="form-control" type="number" min="0" step="0.01" name="qty" value="${escapeHtml(draftValue(existing?.qty || "", draft?.qty))}" /></label>
        </div>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить задание" : "Создать задание"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      "Производственный поток по заданиям, срокам и ответственным внутри общей платформы."
    );
  }

  function renderTasksTaskCreateModal(doc) {
    const existing = (doc.tasks || []).find((task) => task.id === ui.tasks.taskEditId) || null;
    const draft = readDraft("tasks", "task");
    const sprintOptions = sortByDateDesc(doc.sprints || [], "startDate");
    return renderWorkspaceModalShell(
      existing ? "Редактирование задачи" : "Новая задача",
      `<form id="tasksTaskModalForm" class="workspace-form" data-draft-form="task">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Задача</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(draftValue(existing?.owner || "", draft?.owner))}" /></label>
          <label><span>Статус</span><select class="form-select" name="status">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draftValue(existing?.status || "todo", draft?.status || "todo")) === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Приоритет</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draftValue(existing?.priority || "medium", draft?.priority || "medium")) === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Итерация</span><select class="form-select" name="sprintId"><option value="">Без итерации</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${(draftValue(existing?.sprintId || "", draft?.sprintId || "")) === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label>
          <label><span>Срок</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.dueDate || "", draft?.dueDate || "")))}" /></label>
        </div>
        <label class="workspace-check"><input class="form-check-input" type="checkbox" name="blocked" ${(draftValue(existing?.blocked ? "1" : "", draft?.blocked ? "1" : "")) ? "checked" : ""} /> <span>Есть блокер</span></label>
        <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("tasks", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить задачу" : "Сохранить задачу"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      existing ? "Полная карточка задачи во всплывающем окне без ухода из текущего режима." : "Быстрое добавление задачи без перехода в карточку."
    );
  }

  function renderTasksSprintCreateModal() {
    const doc = docs.tasks || createDefaultTasksDoc();
    const existing = (doc.sprints || []).find((sprint) => sprint.id === ui.tasks.sprintEditId) || null;
    const draft = readDraft("tasks", "sprint");
    return renderWorkspaceModalShell(
      existing ? "Редактирование итерации" : "Новая итерация",
      `<form id="tasksSprintModalForm" class="workspace-form" data-draft-form="sprint">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>Старт</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.startDate || "", draft?.startDate || "")))}" /></label>
          <label><span>Финиш</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.endDate || "", draft?.endDate || "")))}" /></label>
        </div>
        <label><span>Цель</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(draftValue(existing?.goal || "", draft?.goal))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "Сохранить итерацию" : "Сохранить итерацию"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>Отмена</button></div>
      </form>`,
      existing ? "Редактирование рабочего цикла команды без ухода из канбана и списка." : "Итерации задают ритм работы и приоритеты команды."
    );
  }

  function mountModuleModal(moduleKey, root) {
    if (!root) return;
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    const modalState = compactText(ui[canonicalModuleKey]?.modal || "");
    if (!modalState) return;
    let html = "";
    if (canonicalModuleKey === "crm" && modalState === "deal") {
      html = renderCrmCreateModal(docs.crm || createDefaultCrmDoc());
    } else if (canonicalModuleKey === "crm" && modalState === "reserve") {
      html = renderCrmReserveModal(docs.crm || createDefaultCrmDoc(), docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "directories" && modalState === "list") {
      html = renderDirectoriesListModal(docs.directories || createDefaultDirectoriesDoc());
    } else if (canonicalModuleKey === "directories" && modalState === "option") {
      html = renderDirectoriesOptionModal(docs.directories || createDefaultDirectoriesDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "item") {
      html = renderWarehouseItemCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "movement") {
      html = renderWarehouseMovementCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "product") {
      html = renderWarehouseProductCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "purchase") {
      html = renderWarehousePurchaseCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "finance") {
      html = renderWarehouseFinanceCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "warehouse" && modalState === "production") {
      html = renderWarehouseProductionCreateModal(docs.warehouse || createDefaultWarehouseDoc());
    } else if (canonicalModuleKey === "tasks" && modalState === "task") {
      html = renderTasksTaskCreateModal(docs.tasks || createDefaultTasksDoc());
    } else if (canonicalModuleKey === "tasks" && modalState === "sprint") {
      html = renderTasksSprintCreateModal();
    }
    if (!html) return;
    root.insertAdjacentHTML("beforeend", html);
  }

  function attachDirectoryDatalist(root, input, listKey) {
    if (!root || !input) return;
    const options = getDirectoryOptions(listKey);
    if (!options.length) return;
    const dataListId = `directory_${sanitizeKey(listKey)}_${sanitizeKey(input.name || "field")}`;
    input.setAttribute("list", dataListId);
    if (root.querySelector(`#${dataListId}`)) return;
    const datalist = document.createElement("datalist");
    datalist.id = dataListId;
    datalist.innerHTML = options.map((option) => `<option value="${escapeHtml(option)}"></option>`).join("");
    input.insertAdjacentElement("afterend", datalist);
  }

  function hydrateDirectoryFields(moduleKey, root) {
    if (!root) return;
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (canonicalModuleKey === "crm") {
      root.querySelectorAll('input[name="channel"]').forEach((input) => attachDirectoryDatalist(root, input, "crm_channels"));
      root.querySelectorAll('input[name="owner"]').forEach((input) => attachDirectoryDatalist(root, input, "team_members"));
    }
    if (canonicalModuleKey === "warehouse") {
      root.querySelectorAll('input[name="category"]').forEach((input) => attachDirectoryDatalist(root, input, "warehouse_categories"));
      root.querySelectorAll('input[name="unit"]').forEach((input) => attachDirectoryDatalist(root, input, "warehouse_units"));
      root.querySelectorAll('input[name="group"]').forEach((input) => attachDirectoryDatalist(root, input, "product_groups"));
      root.querySelectorAll('input[name="supplier"]').forEach((input) => attachDirectoryDatalist(root, input, "suppliers"));
      root.querySelectorAll('input[name="account"]').forEach((input) => attachDirectoryDatalist(root, input, "finance_accounts"));
      root.querySelectorAll('input[name="category"]').forEach((input) => {
        if (input.closest("#warehouseFinanceModalForm")) attachDirectoryDatalist(root, input, "finance_categories");
      });
      root.querySelectorAll('input[name="counterparty"]').forEach((input) => attachDirectoryDatalist(root, input, "suppliers"));
      root.querySelectorAll('input[name="assignee"]').forEach((input) => attachDirectoryDatalist(root, input, "team_members"));
    }
    if (canonicalModuleKey === "tasks") {
      root.querySelectorAll('input[name="owner"]').forEach((input) => attachDirectoryDatalist(root, input, "team_members"));
    }
  }

  function hydrateDraftForms(moduleKey, root) {
    if (!root) return;
    root.querySelectorAll("[data-draft-form]").forEach((form) => {
      const formKey = form.dataset.draftForm;
      const idField = form.querySelector('input[name="id"]');
      if (idField && compactText(idField.value)) return;
      const draft = readDraft(moduleKey, formKey);
      if (!draft || !Object.keys(draft).length) return;
      Array.from(form.elements || []).forEach((field) => {
        if (!field || !field.name || field.disabled) return;
        if (field.type === "hidden") return;
        if (field.type === "checkbox") {
          if (draft[field.name] !== undefined) field.checked = Boolean(draft[field.name]);
          return;
        }
        if ((field.value ?? "") !== "") return;
        if (draft[field.name] !== undefined) field.value = draft[field.name];
      });
    });
  }

  function focusModeSection(moduleKey, root) {
    if (!root) return;
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    const headingKey = MODULE_MODE_CONFIG[moduleKey] ? moduleKey : canonicalModuleKey;
    const headingMap = {
      crm: [
        { text: "Карточка сделки", modes: "overview form" },
        { text: "Новая сделка", modes: "overview form" },
        { text: "Фокус недели", modes: "overview form" },
        { text: "Воронка сделок", modes: "board" },
        { text: "Список сделок", modes: "table" }
      ],
      warehouse: [
        { text: "Новая позиция склада", modes: "form" },
        { text: "Редактирование позиции", modes: "form" },
        { text: "Движение по складу", modes: "form movements" },
        { text: "Текущие остатки", modes: "overview catalog" },
        { text: "Последние движения", modes: "overview movements" },
        { text: "Товары", modes: "overview products" },
        { text: "Закупки", modes: "overview purchases" },
        { text: "Денежные операции", modes: "overview finance" },
        { text: "Производство", modes: "overview production" }
      ],
      tasks: [
        { text: "Новая задача", modes: "form" },
        { text: "Редактирование задачи", modes: "form" },
        { text: "Новая итерация", modes: "form" },
        { text: "Редактирование итерации", modes: "form" },
        { text: "Итерации", modes: "overview form" },
        { text: "Канбан", modes: "board" },
        { text: "Лента задач", modes: "table" }
      ]
    };
    root.querySelectorAll(".workspace-panel").forEach((panel) => {
      if (panel.dataset.modeSection) return;
      const heading = panel.querySelector("h4");
      const title = String(heading?.textContent || "").trim().toLowerCase();
      const match = (headingMap[headingKey] || headingMap[canonicalModuleKey] || []).find((item) => title.includes(item.text.toLowerCase()));
      if (match) panel.dataset.modeSection = match.modes;
    });

    const mode = ui[canonicalModuleKey]?.mode || "overview";
    root.querySelectorAll("[data-mode-section]").forEach((section) => {
      const values = String(section.dataset.modeSection || "")
        .replaceAll(",", " ")
        .split(" ")
        .map((value) => value.trim())
        .filter(Boolean);
      const active = mode === "overview" ? values.includes("overview") : values.includes(mode);
      section.classList.toggle("workspace-panel--active", active);
      section.classList.toggle("workspace-panel--muted", mode !== "overview" && !active);
    });

    if (mode === "overview") return;
    const target = root.querySelector(`[data-mode-section~="${mode}"], [data-mode-section*="${mode},"]`);
    if (target) {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function handleInput(event, moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (!supports(canonicalModuleKey)) return false;
    const draftForm = event.target.closest("[data-draft-form]");
    if (draftForm) {
      writeDraft(moduleKey, draftForm.dataset.draftForm, serializeFormDraft(draftForm));
    }
    const target = event.target.closest("[data-live-filter]");
    if (!target) return false;
    ui[canonicalModuleKey][target.dataset.liveFilter] = target.value;
    markFiltersAsAdHoc(moduleKey);
    persistUiState(moduleKey);
    void rerenderCurrentModule();
    return true;
  }

  async function handleChange(event, moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (!supports(canonicalModuleKey)) return false;
    const filterTarget = event.target.closest("[data-live-filter]");
    if (filterTarget) {
      ui[canonicalModuleKey][filterTarget.dataset.liveFilter] = filterTarget.value;
      markFiltersAsAdHoc(moduleKey);
      persistUiState(moduleKey);
      await rerenderCurrentModule();
      return true;
    }
    const draftForm = event.target.closest("[data-draft-form]");
    if (draftForm) {
      writeDraft(moduleKey, draftForm.dataset.draftForm, serializeFormDraft(draftForm));
    }
    const crmStageSelect = event.target.closest("[data-crm-stage-select]");
    if (crmStageSelect) {
      const doc = await ensureDocument("crm");
      const deals = [...(doc.deals || [])];
      const index = deals.findIndex((deal) => deal.id === crmStageSelect.dataset.crmStageSelect);
      if (index >= 0) {
        deals[index] = { ...deals[index], stage: crmStageSelect.value, updatedAt: new Date().toISOString() };
        await saveDocument("crm", { ...doc, deals }, "Стадия сделки обновлена.");
        await rerenderCurrentModule();
      }
      return true;
    }
    const taskStatusSelect = event.target.closest("[data-task-status-select]");
    if (taskStatusSelect) {
      const nextStatus = compactText(taskStatusSelect.value) || "todo";
      const updatedTask = await updateTaskRecord(
        taskStatusSelect.dataset.taskStatusSelect,
        "Статус задачи обновлен.",
        (task) => ({
          ...task,
          status: nextStatus,
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: "Статус задачи изменен",
              meta: `${getTaskStatusMeta(task.status).label} -> ${getTaskStatusMeta(nextStatus).label}`,
              tone: getTaskStatusMeta(nextStatus).tone,
              moduleKey: "tasks",
              entityId: task.id
            })
          )
        })
      );
      if (updatedTask) {
        await rerenderCurrentModule();
      }
      return true;
    }
    return false;
  }

  async function deleteBuilderEntity(moduleKey, type, key) {
    const doc = await ensureDocument(moduleKey);
    if (type === "view") {
      const views = [createDefaultView(moduleKey), ...(doc.builder.views || []).filter((view) => view.id !== "default" && view.id !== key)];
      Object.assign(ui[moduleKey], getDefaultFilters(moduleKey), { activeViewId: "default" });
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, views } }, "Вкладка удалена.");
      return;
    }
    if (type === "field") {
      const fields = (doc.builder.fields || []).filter((field) => field.key !== key);
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, fields } }, "Поле удалено.");
      return;
    }
    if (type === "formula") {
      const formulas = (doc.builder.formulas || []).filter((formula) => formula.key !== key);
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, formulas } }, "Формула удалена.");
    }
  }

  async function handleClick(event, moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    if (!supports(canonicalModuleKey)) return false;
    const linkedOpenButton = event.target.closest("[data-linked-open]");
    if (linkedOpenButton) {
      const [targetModuleKey, entityId] = String(linkedOpenButton.dataset.linkedOpen || "").split(":");
      if (targetModuleKey) {
        focusEntity(targetModuleKey, { entityId });
        window.dispatchEvent(
          new CustomEvent("dom-neona:workspace-open", {
            detail: {
              moduleKey: targetModuleKey,
              entityId
            }
          })
        );
      }
      return true;
    }
    if (event.target.closest("[data-placeholder-open]")) return false;
    if (event.target.closest("[data-live-modal-close]") || event.target.hasAttribute("data-live-modal-backdrop")) {
      if (ui[canonicalModuleKey]) {
        ui[canonicalModuleKey].modal = "";
        persistUiState(canonicalModuleKey);
        await rerenderCurrentModule();
      }
      return true;
    }

    const doc = await ensureDocument(moduleKey);
    const viewButton = event.target.closest("[data-builder-view]");
    if (viewButton) {
      activateView(moduleKey, doc, viewButton.dataset.builderView);
      await rerenderCurrentModule();
      return true;
    }
    const builderToggle = event.target.closest("[data-builder-toggle]");
    if (builderToggle) {
      ui[canonicalModuleKey].configOpen = !ui[canonicalModuleKey].configOpen;
      await rerenderCurrentModule();
      return true;
    }
    const deleteViewButton = event.target.closest("[data-builder-view-delete]");
    if (deleteViewButton) {
      await deleteBuilderEntity(moduleKey, "view", deleteViewButton.dataset.builderViewDelete);
      ui[canonicalModuleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const deleteFieldButton = event.target.closest("[data-builder-field-delete]");
    if (deleteFieldButton) {
      await deleteBuilderEntity(moduleKey, "field", deleteFieldButton.dataset.builderFieldDelete);
      ui[canonicalModuleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const deleteFormulaButton = event.target.closest("[data-builder-formula-delete]");
    if (deleteFormulaButton) {
      await deleteBuilderEntity(moduleKey, "formula", deleteFormulaButton.dataset.builderFormulaDelete);
      ui[canonicalModuleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const modeButton = event.target.closest("[data-live-mode]");
    if (modeButton) {
      ui[canonicalModuleKey].mode = modeButton.dataset.liveMode || "overview";
      persistUiState(canonicalModuleKey);
      await rerenderCurrentModule();
      return true;
    }
    const resetFiltersButton = event.target.closest("[data-live-filters-reset]");
    if (resetFiltersButton) {
      Object.assign(ui[canonicalModuleKey], getDefaultFilters(moduleKey), { activeViewId: "default" });
      persistUiState(canonicalModuleKey);
      await rerenderCurrentModule();
      return true;
    }
    const exportButton = event.target.closest("[data-module-export]");
    if (exportButton) {
      await exportModuleData(moduleKey);
      return true;
    }
    const importButton = event.target.closest("[data-module-import]");
    if (importButton) {
      await importModuleData(moduleKey);
      return true;
    }
    const clearDraftButton = event.target.closest("[data-module-draft-clear]");
    if (clearDraftButton) {
      const [draftModuleKey, draftFormKey] = String(clearDraftButton.dataset.moduleDraftClear || "").split(":");
      if (draftModuleKey && draftFormKey) {
        clearDraft(draftModuleKey, draftFormKey);
        setStatus("Черновик очищен.", "success");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (canonicalModuleKey === "directories") {
      const selectButton = event.target.closest("[data-directory-select]");
      if (selectButton) {
        ui.directories.activeListId = selectButton.dataset.directorySelect || "";
        persistUiState("directories");
        await rerenderCurrentModule();
        return true;
      }
      const newButton = event.target.closest("[data-directory-new]");
      if (newButton) {
        ui.directories.activeListId = "";
        ui.directories.modal = "list";
        persistUiState("directories");
        await rerenderCurrentModule();
        return true;
      }
      const editButton = event.target.closest("[data-directory-edit]");
      if (editButton) {
        ui.directories.modal = "list";
        persistUiState("directories");
        await rerenderCurrentModule();
        return true;
      }
      const newOptionButton = event.target.closest("[data-directory-option-new]");
      if (newOptionButton) {
        ui.directories.modal = "option";
        persistUiState("directories");
        await rerenderCurrentModule();
        return true;
      }
      const deleteButton = event.target.closest("[data-directory-delete]");
      if (deleteButton) {
        if (!window.confirm("Удалить справочник целиком?")) return true;
        const listKey = sanitizeKey(deleteButton.dataset.directoryDelete);
        const lists = (doc.lists || []).filter((list) => list.key !== listKey && list.id !== listKey);
        ui.directories.activeListId = lists[0]?.key || "";
        persistUiState("directories");
        await saveDocument("directories", { ...doc, lists }, "Справочник удалён.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteOptionButton = event.target.closest("[data-directory-option-delete]");
      if (deleteOptionButton) {
        const [listKey, optionRaw] = String(deleteOptionButton.dataset.directoryOptionDelete || "").split(":");
        const option = compactText(optionRaw);
        if (!listKey || !option) return true;
        const lists = [...(doc.lists || [])];
        const index = lists.findIndex((list) => list.key === sanitizeKey(listKey) || list.id === sanitizeKey(listKey));
        if (index < 0) return true;
        lists[index] = {
          ...lists[index],
          options: (lists[index].options || []).filter((entry) => compactText(entry) !== option)
        };
        ui.directories.activeListId = lists[index].key;
        persistUiState("directories");
        await saveDocument("directories", { ...doc, lists }, "Значение удалено из справочника.");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (canonicalModuleKey === "crm") {
      const importSalesButton = event.target.closest("[data-crm-import-sales]");
      if (importSalesButton) {
        await importDealsFromSales();
        return true;
      }
      const reserveOpenButton = event.target.closest("[data-crm-reserve-open]");
      if (reserveOpenButton) {
        ui.crm.modal = "reserve";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const taskFromDealButton = event.target.closest("[data-crm-task-from-deal]");
      if (taskFromDealButton) {
        await createTaskFromDeal(taskFromDealButton.dataset.crmTaskFromDeal);
        return true;
      }
      const newButton = event.target.closest("[data-crm-new]");
      if (newButton) {
        ui.crm.editId = null;
        ui.crm.modal = "deal";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const editButton = event.target.closest("[data-crm-edit]");
      if (editButton) {
        ui.crm.editId = editButton.dataset.crmEdit;
        ui.crm.modal = "deal";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const duplicateButton = event.target.closest("[data-crm-duplicate]");
      if (duplicateButton) {
        const source = (doc.deals || []).find((deal) => deal.id === duplicateButton.dataset.crmDuplicate);
        if (!source) return true;
        const copy = {
          ...deepClone(source),
          id: createId("deal"),
          title: duplicateTitle(source.title),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDocument("crm", { ...doc, deals: [copy, ...(doc.deals || [])] }, "Копия сделки создана.");
        ui.crm.editId = copy.id;
        ui.crm.modal = "deal";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const deleteButton = event.target.closest("[data-crm-delete]");
      if (deleteButton) {
        if (!window.confirm("Удалить сделку?")) return true;
        const deals = (doc.deals || []).filter((deal) => deal.id !== deleteButton.dataset.crmDelete);
        ui.crm.editId = ui.crm.editId === deleteButton.dataset.crmDelete ? null : ui.crm.editId;
        await saveDocument("crm", { ...doc, deals }, "Сделка удалена.");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (canonicalModuleKey === "warehouse") {
      const seedDemandButton = event.target.closest("[data-warehouse-seed-demand]");
      if (seedDemandButton) {
        await seedWarehouseItemsFromCalculators();
        return true;
      }
      const taskFromItemButton = event.target.closest("[data-warehouse-task-from-item]");
      if (taskFromItemButton) {
        await createTaskFromWarehouseItem(taskFromItemButton.dataset.warehouseTaskFromItem);
        return true;
      }
      const newItemButton = event.target.closest("[data-warehouse-item-new]");
      if (newItemButton) {
        ui.warehouse.itemEditId = null;
        ui.warehouse.modal = "item";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const newProductButton = event.target.closest("[data-warehouse-product-new]");
      if (newProductButton) {
        ui.warehouse.productEditId = null;
        ui.warehouse.modal = "product";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const newPurchaseButton = event.target.closest("[data-warehouse-purchase-new]");
      if (newPurchaseButton) {
        ui.warehouse.purchaseEditId = null;
        ui.warehouse.modal = "purchase";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const newFinanceButton = event.target.closest("[data-warehouse-finance-new]");
      if (newFinanceButton) {
        ui.warehouse.financeEditId = null;
        ui.warehouse.modal = "finance";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const newProductionButton = event.target.closest("[data-warehouse-production-new]");
      if (newProductionButton) {
        ui.warehouse.productionEditId = null;
        ui.warehouse.modal = "production";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editItemButton = event.target.closest("[data-warehouse-item-edit]");
      if (editItemButton) {
        ui.warehouse.itemEditId = editItemButton.dataset.warehouseItemEdit;
        ui.warehouse.modal = "item";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editProductButton = event.target.closest("[data-warehouse-product-edit]");
      if (editProductButton) {
        ui.warehouse.productEditId = editProductButton.dataset.warehouseProductEdit;
        ui.warehouse.modal = "product";
        ui.warehouse.mode = "products";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editPurchaseButton = event.target.closest("[data-warehouse-purchase-edit]");
      if (editPurchaseButton) {
        ui.warehouse.purchaseEditId = editPurchaseButton.dataset.warehousePurchaseEdit;
        ui.warehouse.modal = "purchase";
        ui.warehouse.mode = "purchases";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editFinanceButton = event.target.closest("[data-warehouse-finance-edit]");
      if (editFinanceButton) {
        ui.warehouse.financeEditId = editFinanceButton.dataset.warehouseFinanceEdit;
        ui.warehouse.modal = "finance";
        ui.warehouse.mode = "finance";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editProductionButton = event.target.closest("[data-warehouse-production-edit]");
      if (editProductionButton) {
        ui.warehouse.productionEditId = editProductionButton.dataset.warehouseProductionEdit;
        ui.warehouse.modal = "production";
        ui.warehouse.mode = "production";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const duplicateItemButton = event.target.closest("[data-warehouse-item-duplicate]");
      if (duplicateItemButton) {
        const source = (doc.items || []).find((item) => item.id === duplicateItemButton.dataset.warehouseItemDuplicate);
        if (!source) return true;
        const copy = {
          ...deepClone(source),
          id: createId("item"),
          name: duplicateTitle(source.name),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDocument("warehouse", { ...doc, items: [copy, ...(doc.items || [])] }, "Копия позиции создана.");
        ui.warehouse.itemEditId = copy.id;
        ui.warehouse.modal = "item";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const pickMovementButton = event.target.closest("[data-warehouse-movement-pick]");
      if (pickMovementButton) {
        ui.warehouse.movementItemId = pickMovementButton.dataset.warehouseMovementPick || "";
        ui.warehouse.modal = "movement";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const deleteItemButton = event.target.closest("[data-warehouse-item-delete]");
      if (deleteItemButton) {
        if (!window.confirm("Удалить позицию и связанные движения?")) return true;
        const itemId = deleteItemButton.dataset.warehouseItemDelete;
        const items = (doc.items || []).filter((item) => item.id !== itemId);
        const movements = (doc.movements || []).filter((movement) => movement.itemId !== itemId);
        if (ui.warehouse.itemEditId === itemId) ui.warehouse.itemEditId = null;
        if (ui.warehouse.movementItemId === itemId) ui.warehouse.movementItemId = "";
        await saveDocument("warehouse", { ...doc, items, movements }, "Позиция склада удалена.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteMovementButton = event.target.closest("[data-warehouse-movement-delete]");
      if (deleteMovementButton) {
        if (!window.confirm("Удалить движение?")) return true;
        const movements = (doc.movements || []).filter((movement) => movement.id !== deleteMovementButton.dataset.warehouseMovementDelete);
        await saveDocument("warehouse", { ...doc, movements }, "Движение удалено.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteProductButton = event.target.closest("[data-warehouse-product-delete]");
      if (deleteProductButton) {
        if (!window.confirm("Удалить товар?")) return true;
        const productId = deleteProductButton.dataset.warehouseProductDelete;
        const products = (doc.products || []).filter((item) => item.id !== productId);
        if (ui.warehouse.productEditId === productId) ui.warehouse.productEditId = null;
        await saveDocument("warehouse", { ...doc, products }, "Товар удален.");
        await rerenderCurrentModule();
        return true;
      }
      const deletePurchaseButton = event.target.closest("[data-warehouse-purchase-delete]");
      if (deletePurchaseButton) {
        if (!window.confirm("Удалить закупку и связанную приемку?")) return true;
        const purchaseId = deletePurchaseButton.dataset.warehousePurchaseDelete;
        const purchases = (doc.purchases || []).filter((item) => item.id !== purchaseId);
        const movements = (doc.movements || []).filter(
          (movement) => compactText(movement?.integration?.purchaseId) !== purchaseId
        );
        if (ui.warehouse.purchaseEditId === purchaseId) ui.warehouse.purchaseEditId = null;
        await saveDocument("warehouse", { ...doc, purchases, movements }, "Закупка удалена.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteFinanceButton = event.target.closest("[data-warehouse-finance-delete]");
      if (deleteFinanceButton) {
        if (!window.confirm("Удалить денежную операцию?")) return true;
        const financeId = deleteFinanceButton.dataset.warehouseFinanceDelete;
        const financeEntries = (doc.financeEntries || []).filter((entry) => entry.id !== financeId);
        if (ui.warehouse.financeEditId === financeId) ui.warehouse.financeEditId = null;
        await saveDocument("warehouse", { ...doc, financeEntries }, "Операция удалена.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteProductionButton = event.target.closest("[data-warehouse-production-delete]");
      if (deleteProductionButton) {
        if (!window.confirm("Удалить производственное задание?")) return true;
        const productionId = deleteProductionButton.dataset.warehouseProductionDelete;
        const productionJobs = (doc.productionJobs || []).filter((entry) => entry.id !== productionId);
        if (ui.warehouse.productionEditId === productionId) ui.warehouse.productionEditId = null;
        await saveDocument("warehouse", { ...doc, productionJobs }, "Производственное задание удалено.");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (canonicalModuleKey === "tasks") {
      const generateSignalsButton = event.target.closest("[data-task-generate-signals]");
      if (generateSignalsButton) {
        await generateTasksFromSignals();
        return true;
      }
      const taskSetStatusButton = event.target.closest("[data-task-set-status]");
      if (taskSetStatusButton) {
        const [taskId, nextStatus] = String(taskSetStatusButton.dataset.taskSetStatus || "").split(":");
        const updatedTask = await updateTaskRecord(taskId, "Состояние задачи обновлено.", (task) => ({
          ...task,
          status: compactText(nextStatus) || "todo",
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: compactText(nextStatus) === "done" ? "Задача отмечена выполненной" : "Задача возвращена в работу",
              meta: `${getTaskStatusMeta(task.status).label} -> ${getTaskStatusMeta(compactText(nextStatus) || "todo").label}`,
              tone: compactText(nextStatus) === "done" ? "success" : "warning",
              moduleKey: "tasks",
              entityId: task.id
            })
          )
        }));
        if (updatedTask) {
          await rerenderCurrentModule();
        }
        return true;
      }
      const taskToggleBlockedButton = event.target.closest("[data-task-toggle-blocked]");
      if (taskToggleBlockedButton) {
        const updatedTask = await updateTaskRecord(taskToggleBlockedButton.dataset.taskToggleBlocked, "Состояние блокера обновлено.", (task) => ({
          ...task,
          blocked: !task.blocked,
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: !task.blocked ? "Для задачи отмечен блокер" : "Блокер по задаче снят",
              meta: !task.blocked ? "Нужна помощь или управленческое решение." : "Задача снова может двигаться без ограничений.",
              tone: !task.blocked ? "danger" : "success",
              moduleKey: "tasks",
              entityId: task.id
            })
          )
        }));
        if (updatedTask) {
          await rerenderCurrentModule();
        }
        return true;
      }
      const newTaskButton = event.target.closest("[data-task-new]");
      if (newTaskButton) {
        ui.tasks.taskEditId = null;
        ui.tasks.modal = "task";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const editTaskButton = event.target.closest("[data-task-edit]");
      if (editTaskButton) {
        ui.tasks.taskEditId = editTaskButton.dataset.taskEdit;
        ui.tasks.modal = "task";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const duplicateTaskButton = event.target.closest("[data-task-duplicate]");
      if (duplicateTaskButton) {
        const source = (doc.tasks || []).find((task) => task.id === duplicateTaskButton.dataset.taskDuplicate);
        if (!source) return true;
        const copy = {
          ...deepClone(source),
          id: createId("task"),
          title: duplicateTitle(source.title),
          history: [
            createTaskHistoryEntry({
              title: "Создана копия задачи",
              meta: `Источник копии: ${compactText(source.title || "Задача")}`,
              tone: "info",
              moduleKey: "tasks",
              entityId: source.id
            })
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDocument("tasks", { ...doc, tasks: [copy, ...(doc.tasks || [])] }, "Копия задачи создана.");
        ui.tasks.taskEditId = copy.id;
        ui.tasks.modal = "task";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const deleteTaskButton = event.target.closest("[data-task-delete]");
      if (deleteTaskButton) {
        if (!window.confirm("Удалить задачу?")) return true;
        const tasks = (doc.tasks || []).filter((task) => task.id !== deleteTaskButton.dataset.taskDelete);
        if (ui.tasks.taskEditId === deleteTaskButton.dataset.taskDelete) ui.tasks.taskEditId = null;
        await saveDocument("tasks", { ...doc, tasks }, "Задача удалена.");
        await rerenderCurrentModule();
        return true;
      }
      const newSprintButton = event.target.closest("[data-sprint-new]");
      if (newSprintButton) {
        ui.tasks.sprintEditId = null;
        ui.tasks.modal = "sprint";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const editSprintButton = event.target.closest("[data-sprint-edit]");
      if (editSprintButton) {
        ui.tasks.sprintEditId = editSprintButton.dataset.sprintEdit;
        ui.tasks.modal = "sprint";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const deleteSprintButton = event.target.closest("[data-sprint-delete]");
      if (deleteSprintButton) {
        if (!window.confirm("Удалить итерацию? Задачи останутся, но отвяжутся от нее.")) return true;
        const sprintId = deleteSprintButton.dataset.sprintDelete;
        const sprints = (doc.sprints || []).filter((sprint) => sprint.id !== sprintId);
        const sprintTitle = compactText((doc.sprints || []).find((sprint) => sprint.id === sprintId)?.title || "Итерация");
        const tasks = (doc.tasks || []).map((task) => (task.sprintId === sprintId
          ? {
              ...task,
              sprintId: "",
              updatedAt: new Date().toISOString(),
              history: appendTaskHistory(
                task,
                createTaskHistoryEntry({
                  title: "Итерация удалена",
                  meta: `Задача отвязана от итерации ${sprintTitle}.`,
                  tone: "warning",
                  moduleKey: "tasks",
                  entityId: task.id
                })
              )
            }
          : task));
        if (ui.tasks.sprintEditId === sprintId) ui.tasks.sprintEditId = null;
        await saveDocument("tasks", { ...doc, sprints, tasks }, "Итерация удалена.");
        await rerenderCurrentModule();
        return true;
      }
    }
    return false;
  }

  function getDashboardSummary(moduleKey) {
    const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
    const moduleDoc = docs[canonicalModuleKey];
    if (!supports(canonicalModuleKey) || !moduleDoc) return "";
    if (moduleKey === "directories") {
      const lists = docs.directories.lists || [];
      return `${lists.length} справочников • ${formatNumber(sumBy(lists, (list) => (list.options || []).length))} значений`;
    }
    if (moduleKey === "crm") {
      const deals = docs.crm.deals || [];
      const salesSnapshot = buildSalesSnapshot(externalDocs.sales);
      return `${deals.length} сделок • ${formatMoney(sumBy(deals, (deal) => deal.amount || 0))}${salesSnapshot.orders.length ? ` • ${salesSnapshot.unpaidInvoices.length} счетов без оплаты` : ""}`;
    }
    if (moduleKey === "warehouse") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse);
      const calculatorSnapshot = buildCalculatorDemandSnapshot(externalDocs.myCalculator, externalDocs.partnerCalculators || []);
      return `${snapshot.items.length} позиций • ${snapshot.products.length} товаров • ${snapshot.purchases.length} закупок${calculatorSnapshot.activeTabs ? ` • ${calculatorSnapshot.activeTabs} вкладок спроса` : ""}`;
    }
    if (moduleKey === "products") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${snapshot.products.length} товаров • ${formatMoney(sumBy(snapshot.products, (item) => (item.salePrice || 0) - (item.purchasePrice || 0)))} валовая маржа`;
    }
    if (moduleKey === "purchases") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${snapshot.purchases.length} закупок • ${formatMoney(snapshot.purchasesTotal || 0)} в заказах`;
    }
    if (moduleKey === "money") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${formatMoney((snapshot.incomeTotal || 0) - (snapshot.expenseTotal || 0))} баланс • ${formatMoney(snapshot.incomeTotal || 0)} приход / ${formatMoney(snapshot.expenseTotal || 0)} расход`;
    }
    if (moduleKey === "production") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${formatNumber(snapshot.productionActive || 0)} активных • ${formatNumber(snapshot.productionJobs.length)} всего заданий`;
    }
    if (moduleKey === "tasks") {
      const tasks = docs.tasks.tasks || [];
      const openCount = tasks.filter((task) => task.status !== "done").length;
      const blockedCount = tasks.filter((task) => task.status !== "done" && task.blocked).length;
      const overdueCount = tasks.filter((task) => task.status !== "done" && normalizeDateInput(task.dueDate) && normalizeDateInput(task.dueDate) < todayString()).length;
      return `${openCount} открытых задач${blockedCount ? ` • ${blockedCount} с блокером` : ""}${overdueCount ? ` • ${overdueCount} просрочено` : ""}`;
    }
    return "";
  }

  function buildDashboardActivitySeries(orders, period = "week") {
    const points = [];
    const lookup = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "year") {
      for (let offset = 11; offset >= 0; offset -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
        const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
        const label = date.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "");
        const point = {
          key,
          label,
          fullLabel: date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }),
          orders: 0,
          revenue: 0,
          invoices: 0
        };
        points.push(point);
        lookup.set(key, point);
      }
    } else {
      const days = period === "month" ? 30 : 7;
      for (let offset = days - 1; offset >= 0; offset -= 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
        const label = period === "week"
          ? date.toLocaleDateString("ru-RU", { weekday: "short" }).replace(".", "")
          : `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`;
        const point = {
          key,
          label,
          fullLabel: date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" }),
          orders: 0,
          revenue: 0,
          invoices: 0
        };
        points.push(point);
        lookup.set(key, point);
      }
    }

    (orders || []).forEach((order) => {
      const createdDate = normalizeDateInput(order.createdAt);
      if (createdDate) {
        const createdKey = period === "year" ? createdDate.slice(0, 7) : createdDate;
        if (lookup.has(createdKey)) {
          lookup.get(createdKey).orders += 1;
        }
      }

      const billingDate = normalizeDateInput(order.paidDate || order.invoiceDate || order.createdAt);
      if (billingDate) {
        const billingKey = period === "year" ? billingDate.slice(0, 7) : billingDate;
        if (lookup.has(billingKey)) {
          const point = lookup.get(billingKey);
          point.revenue += toNumber(order.paidAmount || order.amount || 0);
          if (order.invoiceDate) point.invoices += 1;
        }
      }
    });

    return points;
  }

  async function getDashboardSnapshot() {
    if (!schemaReadyProvider()) {
      return null;
    }

    const loadLight2Rows = async (tableName) => {
      try {
        const { data, error } = await supabase.from(tableName).select("*");
        if (error) return [];
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    };

    const [
      directoriesDoc,
      crmDoc,
      warehouseDoc,
      tasksDoc,
      salesRecord,
      myCalculatorDoc,
      partnerCalculatorDocs,
      light2MetricsDoc,
      light2Settlements,
      light2BalanceEntries,
      light2CalendarEntries,
      light2Assets,
      light2AssetPayments,
      light2Purchases
    ] = await Promise.all([
      ensureDocument("directories"),
      ensureDocument("crm"),
      ensureDocument("warehouse"),
      ensureDocument("tasks"),
      ensureExternalDoc("sales", true),
      ensureExternalDoc("myCalculator", true),
      ensureExternalDoc("partnerCalculators", true),
      ensureExternalDoc("light2Metrics", true),
      loadLight2Rows("light2_partner_settlements"),
      loadLight2Rows("light2_balance_entries"),
      loadLight2Rows("light2_payment_calendar_entries"),
      loadLight2Rows("light2_assets"),
      loadLight2Rows("light2_asset_payments"),
      loadLight2Rows("light2_purchase_catalog")
    ]);

    const salesSnapshot = buildSalesSnapshot(salesRecord);
    const warehouseSnapshot = buildWarehouseSnapshot(warehouseDoc);
    const calculatorSnapshot = buildCalculatorDemandSnapshot(myCalculatorDoc, partnerCalculatorDocs || []);
    const light2MetricsSummary = buildLight2MetricsSummary(light2MetricsDoc?.payload);
    const taskSignals = await buildTaskSignalSnapshot(tasksDoc);

    const today = todayString();
    const currentMonthKey = today.slice(0, 7);

    const deals = crmDoc?.deals || [];
    const openDeals = deals.filter((deal) => !["done", "lost"].includes(compactText(deal.stage)));
    const overdueDeals = openDeals.filter((deal) => {
      const deadline = normalizeDateInput(deal.deadline);
      return deadline && deadline < today;
    });

    const tasks = tasksDoc?.tasks || [];
    const openTasks = tasks.filter((task) => compactText(task.status) !== "done");
    const blockedTasks = openTasks.filter((task) => Boolean(task.blocked));
    const overdueTasks = openTasks.filter((task) => {
      const dueDate = normalizeDateInput(task.dueDate);
      return dueDate && dueDate < today;
    });

    const monthOrders = salesSnapshot.orders.filter((order) => {
      const createdAt = normalizeDateInput(order.createdAt);
      return createdAt && createdAt.slice(0, 7) === currentMonthKey;
    });

    const monthPaidOrders = salesSnapshot.orders.filter((order) => {
      const paidDate = normalizeDateInput(order.paidDate);
      return paidDate && paidDate.slice(0, 7) === currentMonthKey;
    });

    const missingDemand = calculatorSnapshot.demand.filter((entry) => !findWarehouseMatch(warehouseSnapshot, entry.sku));
    const criticalDemand = calculatorSnapshot.demand.filter((entry) => {
      const match = findWarehouseMatch(warehouseSnapshot, entry.sku);
      return Boolean(match?.low);
    });

    const contourClosedStatuses = new Set(["Взаиморасчет произведен", "Архив"].map((value) => compactText(value)));
    ["Взаиморасчет произведен", "Архив"].forEach((value) => contourClosedStatuses.add(compactText(value)));
    const contourOpenSettlements = (light2Settlements || []).filter((entry) => !contourClosedStatuses.has(compactText(entry.status)));
    const contourSettlementsPayout = roundMoney(
      contourOpenSettlements.reduce((sum, entry) => {
        const total = roundMoney(toNumber(entry.salary_amount) - toNumber(entry.purchase_amount));
        return total > 0 ? sum + total : sum;
      }, 0)
    );
    const contourBalanceTotal = roundMoney(
      (light2BalanceEntries || []).reduce((sum, entry) => sum + toNumber(entry.income_amount) - toNumber(entry.expense_amount), 0)
    );
    const contourCalendarIncoming = roundMoney(
      sumBy(
        (light2CalendarEntries || []).filter((entry) => compactText(entry.operation_type) === compactText("Приход")),
        (entry) => entry.amount
      )
    );
    const contourCalendarOutgoing = roundMoney(
      sumBy(
        (light2CalendarEntries || []).filter((entry) => compactText(entry.operation_type) === compactText("Расход")),
        (entry) => entry.amount
      )
    );
    const contourAssetsValue = roundMoney(sumBy(light2Assets || [], (entry) => entry.asset_value));
    const contourAssetsPaid = roundMoney(sumBy(light2AssetPayments || [], (entry) => entry.payment_amount));
    const contourAssetsRemaining = roundMoney(contourAssetsValue - contourAssetsPaid);
    const contourSuppliers = new Set((light2Purchases || []).map((entry) => compactText(entry.supplier_name)).filter(Boolean));

    const activity = sortByDateDesc(
      [
        ...salesSnapshot.orders.slice(0, 8).map((order) => ({
          id: `activity-sales-${order.sourceId || order.orderNumber || createId("sales")}`,
          date: order.paidDate || order.invoiceDate || order.createdAt || "",
          title: order.title || `Заказ ${order.orderNumber || "без номера"}`,
          meta: `${order.client || "Клиент не указан"} • ${order.status || "Статус не указан"}`,
          tone: order.isPaid ? "success" : order.isInvoiced ? "accent" : "neutral",
          moduleKey: "sales"
        })),
        ...sortByDateDesc(deals, "updatedAt").slice(0, 8).map((deal) => ({
          id: `activity-crm-${deal.id}`,
          date: deal.updatedAt || deal.createdAt || "",
          title: deal.title || deal.client || "Сделка",
          meta: `${getCrmStageMeta(deal.stage).label} • ${deal.owner || "Без ответственного"}`,
          tone: getCrmStageMeta(deal.stage).tone,
          moduleKey: "crm"
        })),
        ...sortByDateDesc(warehouseDoc?.movements || [], "date").slice(0, 8).map((movement) => {
          const item = (warehouseDoc?.items || []).find((entry) => entry.id === movement.itemId);
          return {
            id: `activity-move-${movement.id}`,
            date: movement.date || movement.createdAt || "",
            title: item?.name || movement.itemName || "Складское движение",
            meta: `${WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === compactText(movement.kind))?.label || movement.kind || "Движение"} • ${formatNumber(movement.qty || 0)}`,
            tone: compactText(movement.kind) === "in" ? "success" : compactText(movement.kind) === "out" ? "danger" : "info",
            moduleKey: "warehouse"
          };
        }),
        ...sortByDateDesc(warehouseDoc?.financeEntries || [], "date").slice(0, 6).map((entry) => ({
          id: `activity-finance-${entry.id}`,
          date: entry.date || entry.createdAt || "",
          title: entry.counterparty || entry.account || "Денежная операция",
          meta: `${FINANCE_ENTRY_KINDS.find((item) => item.key === compactText(entry.kind))?.label || entry.kind || "Операция"} • ${formatMoney(entry.amount || 0)}`,
          tone: FINANCE_ENTRY_KINDS.find((item) => item.key === compactText(entry.kind))?.tone || "neutral",
          moduleKey: "money"
        })),
        ...tasks.flatMap((task) =>
          (Array.isArray(task?.history) ? task.history.map((entry) => normalizeTaskHistoryEntry(entry)).filter(Boolean).slice(0, 2) : []).map((entry) => ({
            id: entry.id || `activity-task-${task.id}`,
            date: entry.date || task.updatedAt || task.createdAt || "",
            title: entry.title || task.title || "Событие задачи",
            meta: entry.meta || `${task.owner || "Без ответственного"} • ${getTaskStatusMeta(task.status).label}`,
            tone: entry.tone || "info",
            moduleKey: entry.moduleKey || "tasks"
          }))
        )
      ].filter((item) => compactText(item.date)),
      "date"
    ).slice(0, 12);

    const alerts = [
      ...salesSnapshot.unpaidInvoices.slice(0, 4).map((order) => ({
        id: `sales-${order.sourceId}`,
        tone: "warning",
        moduleKey: "sales",
        title: order.title || `Заказ ${order.orderNumber || "без номера"}`,
        meta: `${formatMoney(order.amount || 0)} • ${compactText(order.client || "Клиент не указан")}`,
        actionLabel: "Открыть продажи"
      })),
      ...warehouseSnapshot.lowItems.slice(0, 4).map((item) => ({
        id: `warehouse-${item.id}`,
        tone: "danger",
        moduleKey: "warehouse",
        title: item.name || item.sku || "Складская позиция",
        meta: `Доступно ${formatNumber(item.available)} • минимум ${formatNumber(item.minStock || 0)}`,
        actionLabel: "Открыть склад"
      })),
      ...overdueDeals.slice(0, 3).map((deal) => ({
        id: `crm-${deal.id}`,
        tone: "accent",
        moduleKey: "crm",
        title: deal.title || deal.client || "CRM-сделка",
        meta: `${getCrmStageMeta(deal.stage).label} • срок ${formatDate(deal.deadline)}`,
        actionLabel: "Открыть CRM"
      })),
      ...overdueTasks.slice(0, 3).map((task) => ({
        id: `tasks-${task.id}`,
        tone: "info",
        moduleKey: "tasks",
        title: task.title || "Задача",
        meta: `${task.owner || "Без ответственного"} • срок ${formatDate(task.dueDate)}`,
        actionLabel: "Открыть задачи"
      }))
    ].slice(0, 10);

    return {
      generatedAt: new Date().toISOString(),
      directories: {
        listsCount: (directoriesDoc?.lists || []).length,
        valuesCount: sumBy(directoriesDoc?.lists || [], (list) => (list.options || []).length)
      },
      sales: {
        ordersCount: salesSnapshot.orders.length,
        monthOrdersCount: monthOrders.length,
        monthRevenue: sumBy(monthPaidOrders, (order) => order.paidAmount || order.amount || 0),
        unpaidInvoicesCount: salesSnapshot.unpaidInvoices.length,
        unpaidInvoicesAmount: sumBy(salesSnapshot.unpaidInvoices, (order) => order.amount || 0),
        productionCount: salesSnapshot.productionOrders.length,
        doneCount: salesSnapshot.doneOrders.length,
        channels: salesSnapshot.channels.slice(0, 5),
        series: buildDashboardActivitySeries(salesSnapshot.orders, "week"),
        seriesByPeriod: {
          week: buildDashboardActivitySeries(salesSnapshot.orders, "week"),
          month: buildDashboardActivitySeries(salesSnapshot.orders, "month"),
          year: buildDashboardActivitySeries(salesSnapshot.orders, "year")
        }
      },
      crm: {
        dealsCount: deals.length,
        openDealsCount: openDeals.length,
        overdueDealsCount: overdueDeals.length,
        pipelineAmount: sumBy(openDeals, (deal) => deal.amount || 0),
        stageTotals: CRM_STAGES.map((stage) => ({
          key: stage.key,
          label: stage.label,
          tone: stage.tone,
          count: deals.filter((deal) => compactText(deal.stage) === stage.key).length
        }))
      },
      warehouse: {
        itemsCount: warehouseSnapshot.items.length,
        onHandTotal: warehouseSnapshot.onHandTotal,
        availableTotal: warehouseSnapshot.availableTotal,
        reservedTotal: warehouseSnapshot.reservedTotal,
        lowCount: warehouseSnapshot.lowItems.length,
        missingDemandCount: missingDemand.length,
        criticalDemandCount: criticalDemand.length,
        topDemand: calculatorSnapshot.demand.slice(0, 5)
      },
      light2: {
        settlementsCount: (light2Settlements || []).length,
        openSettlementsCount: contourOpenSettlements.length,
        settlementsPayout: contourSettlementsPayout,
        balanceEntriesCount: (light2BalanceEntries || []).length,
        balanceTotal: contourBalanceTotal,
        calendarEntriesCount: (light2CalendarEntries || []).length,
        calendarIncoming: contourCalendarIncoming,
        calendarOutgoing: contourCalendarOutgoing,
        assetsCount: (light2Assets || []).length,
        assetsValue: contourAssetsValue,
        assetsRemaining: contourAssetsRemaining,
        purchasesCount: (light2Purchases || []).length,
        suppliersCount: contourSuppliers.size
      },
      light2Metrics: light2MetricsSummary,
      tasks: {
        totalCount: tasks.length,
        openCount: openTasks.length,
        blockedCount: blockedTasks.length,
        overdueCount: overdueTasks.length,
        signalsCount: taskSignals.newSignals.length,
        statusTotals: TASK_STATUSES.map((status) => ({
          key: status.key,
          label: status.label,
          tone: status.tone,
          count: tasks.filter((task) => compactText(task.status) === status.key).length
        }))
      },
      calculators: {
        activeTabs: calculatorSnapshot.activeTabs,
        invoiceIssuedTabs: calculatorSnapshot.invoiceIssuedTabs,
        invoicePaidTabs: calculatorSnapshot.invoicePaidTabs
      },
      activity,
      alerts
    };
  }

  function afterRender(moduleKey, root) {
    if (!supports(moduleKey) || !root) return;
    hydrateDraftForms(moduleKey, root);
    mountModuleModal(moduleKey, root);
    hydrateDraftForms(moduleKey, root);
    hydrateDirectoryFields(moduleKey, root);
    focusModeSection(moduleKey, root);
  }

  return {
    supports,
    render,
    afterRender,
    refresh,
    handleClick,
    handleInput,
    handleChange,
    handleSubmit,
    getDashboardSummary,
    getDashboardSnapshot,
    getDocument(moduleKey) {
      const canonicalModuleKey = resolveLiveModuleKey(moduleKey);
      if (!supports(canonicalModuleKey) || !docs[canonicalModuleKey]) return null;
      return deepClone(docs[canonicalModuleKey]);
    },
    resetFormState,
    focusEntity
  };
}

