import { evaluateSafeFormula } from "./shared/safe-formula.js";

const LIVE_MODULE_CONFIG = {
  directories: {
    appId: "platform_directories_v1",
    intro:
      "Р•РґРёРЅС‹Рµ СЃРїСЂР°РІРѕС‡РЅРёРєРё РїР»Р°С‚С„РѕСЂРјС‹: РєР°РЅР°Р»С‹, СЃРѕС‚СЂСѓРґРЅРёРєРё, РєР°С‚РµРіРѕСЂРёРё, РµРґРёРЅРёС†С‹ РёР·РјРµСЂРµРЅРёСЏ Рё Р»СЋР±С‹Рµ РІР°С€Рё РІС‹РїР°РґР°СЋС‰РёРµ СЃРїРёСЃРєРё.",
    links: ["crm", "warehouse", "tasks", "light2"]
  },
  crm: {
    appId: "platform_crm_v2",
    legacyAppId: "platform_crm_v1",
    intro:
      "Р–РёРІРѕР№ РєРѕРјРјРµСЂС‡РµСЃРєРёР№ РєРѕРЅС‚СѓСЂ: СЃРґРµР»РєРё, РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рµ, СЃСЂРѕРєРё, СЃСѓРјРјС‹, РєР°РЅР°Р»С‹ Рё СЃРѕР±СЃС‚РІРµРЅРЅС‹Рµ РІРєР»Р°РґРєРё-РїСЂРµРґСЃС‚Р°РІР»РµРЅРёСЏ Р±РµР· РґРІРѕР№РЅРѕРіРѕ РІРІРѕРґР°.",
    links: ["sales", "light2", "tasks"]
  },
  warehouse: {
    appId: "platform_warehouse_v2",
    legacyAppId: "platform_warehouse_v1",
    intro:
      "Р•РґРёРЅС‹Р№ СЃРєР»Р°РґСЃРєРѕР№ РєРѕРЅС‚СѓСЂ: РєР°С‚Р°Р»РѕРі РјР°С‚РµСЂРёР°Р»РѕРІ, РґРІРёР¶РµРЅРёСЏ, СЂРµР·РµСЂРІС‹, РґРµС„РёС†РёС‚ Рё РіРёР±РєР°СЏ РЅР°СЃС‚СЂРѕР№РєР° СЃРѕР±СЃС‚РІРµРЅРЅС‹С… РїРѕР»РµР№ РїРѕРґ РІР°С€ С„РѕСЂРјР°С‚ СѓС‡РµС‚Р°.",
    links: ["light2", "my_calculator", "crm"]
  },
  tasks: {
    appId: "platform_tasks_v2",
    legacyAppId: "platform_tasks_v1",
    intro:
      "Р Р°Р±РѕС‡Р°СЏ РґРѕСЃРєР° РєРѕРјР°РЅРґС‹: Р·Р°РґР°С‡Рё, РёС‚РµСЂР°С†РёРё, СЃСЂРѕРєРё, Р±Р»РѕРєРµСЂС‹ Рё РєР°СЃС‚РѕРјРЅС‹Рµ РєРѕР»РѕРЅРєРё РґР»СЏ РІР°С€РµР№ РѕРїРµСЂР°С†РёРѕРЅРЅРѕР№ РјРѕРґРµР»Рё.",
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
  { key: "lead", label: "РќРѕРІС‹Р№ Р»РёРґ", tone: "neutral" },
  { key: "qualified", label: "РљРІР°Р»РёС„РёРєР°С†РёСЏ", tone: "info" },
  { key: "quote", label: "РљРџ / СЃС‡РµС‚", tone: "accent" },
  { key: "production", label: "Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµ", tone: "warning" },
  { key: "done", label: "РЎРґРµР»РєР° Р·Р°РєСЂС‹С‚Р°", tone: "success" },
  { key: "lost", label: "РџРѕС‚РµСЂСЏРЅРѕ", tone: "danger" }
];

const WAREHOUSE_MOVEMENT_TYPES = [
  { key: "in", label: "РџСЂРёС…РѕРґ" },
  { key: "out", label: "РЎРїРёСЃР°РЅРёРµ" },
  { key: "reserve", label: "Р РµР·РµСЂРІ" },
  { key: "release", label: "РЎРЅСЏС‚РёРµ СЂРµР·РµСЂРІР°" }
];

const WAREHOUSE_PURCHASE_STATUSES = [
  { key: "draft", label: "Р§РµСЂРЅРѕРІРёРє", tone: "neutral" },
  { key: "ordered", label: "Р—Р°РєР°Р·Р°РЅРѕ", tone: "accent" },
  { key: "in_transit", label: "Р’ РїСѓС‚Рё", tone: "warning" },
  { key: "received", label: "РџСЂРёРЅСЏС‚Рѕ", tone: "success" },
  { key: "cancelled", label: "РћС‚РјРµРЅРµРЅРѕ", tone: "danger" }
];

const FINANCE_ENTRY_KINDS = [
  { key: "income", label: "РџСЂРёС…РѕРґ", tone: "success" },
  { key: "expense", label: "Р Р°СЃС…РѕРґ", tone: "danger" },
  { key: "transfer", label: "РџРµСЂРµРјРµС‰РµРЅРёРµ", tone: "accent" }
];

const PRODUCTION_JOB_STATUSES = [
  { key: "queue", label: "РћС‡РµСЂРµРґСЊ", tone: "neutral" },
  { key: "prep", label: "РџРѕРґРіРѕС‚РѕРІРєР°", tone: "info" },
  { key: "in_work", label: "Р’ СЂР°Р±РѕС‚Рµ", tone: "accent" },
  { key: "qa", label: "РљРѕРЅС‚СЂРѕР»СЊ", tone: "warning" },
  { key: "done", label: "Р“РѕС‚РѕРІРѕ", tone: "success" },
  { key: "paused", label: "РџР°СѓР·Р°", tone: "danger" }
];

const TASK_STATUSES = [
  { key: "backlog", label: "РћС‡РµСЂРµРґСЊ", tone: "neutral" },
  { key: "todo", label: "Рљ Р·Р°РїСѓСЃРєСѓ", tone: "accent" },
  { key: "in_progress", label: "Р’ СЂР°Р±РѕС‚Рµ", tone: "info" },
  { key: "review", label: "РџСЂРѕРІРµСЂРєР°", tone: "warning" },
  { key: "done", label: "Р“РѕС‚РѕРІРѕ", tone: "success" }
];

const TASK_PRIORITIES = [
  { key: "low", label: "РќРёР·РєРёР№" },
  { key: "medium", label: "РЎСЂРµРґРЅРёР№" },
  { key: "high", label: "Р’С‹СЃРѕРєРёР№" },
  { key: "urgent", label: "РЎСЂРѕС‡РЅС‹Р№" }
];

const CUSTOM_FIELD_TYPES = [
  { key: "text", label: "РўРµРєСЃС‚" },
  { key: "textarea", label: "Р‘РѕР»СЊС€РѕР№ С‚РµРєСЃС‚" },
  { key: "number", label: "Р§РёСЃР»Рѕ" },
  { key: "date", label: "Р”Р°С‚Р°" },
  { key: "select", label: "РЎРїРёСЃРѕРє" },
  { key: "checkbox", label: "Р”Р° / РЅРµС‚" }
];

const FORMULA_FORMATS = [
  { key: "number", label: "Р§РёСЃР»Рѕ" },
  { key: "money", label: "Р”РµРЅСЊРіРё" },
  { key: "percent", label: "РџСЂРѕС†РµРЅС‚С‹" },
  { key: "text", label: "РўРµРєСЃС‚" }
];

const BUILDER_META = {
  crm: {
    entityLabel: "СЃРґРµР»РєР°",
    defaultViewLabel: "Р’СЃРµ СЃРґРµР»РєРё",
    baseFields: [
      { key: "title", label: "РЎРґРµР»РєР°", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "client", label: "РљР»РёРµРЅС‚", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "channel", label: "РљР°РЅР°Р»", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "owner", label: "РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№", type: "text", showInForm: true, showInTable: true, showInCard: false },
      {
        key: "stage",
        label: "РЎС‚Р°РґРёСЏ",
        type: "select",
        options: CRM_STAGES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: false
      },
      { key: "amount", label: "РЎСѓРјРјР°", type: "number", showInForm: true, showInTable: true, showInCard: true },
      { key: "deadline", label: "РЎСЂРѕРє", type: "date", showInForm: true, showInTable: true, showInCard: false },
      { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  },
  warehouse: {
    entityLabel: "РїРѕР·РёС†РёСЏ",
    defaultViewLabel: "Р’СЃРµ РїРѕР·РёС†РёРё",
    baseFields: [
      { key: "name", label: "РџРѕР·РёС†РёСЏ", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "sku", label: "SKU", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "category", label: "РљР°С‚РµРіРѕСЂРёСЏ", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "unit", label: "Р•Рґ. РёР·Рј.", type: "text", showInForm: true, showInTable: false, showInCard: false },
      { key: "openingStock", label: "РЎС‚Р°СЂС‚РѕРІС‹Р№ РѕСЃС‚Р°С‚РѕРє", type: "number", showInForm: true, showInTable: false, showInCard: false },
      { key: "minStock", label: "РњРёРЅРёРјСѓРј", type: "number", showInForm: true, showInTable: true, showInCard: false },
      { key: "available", label: "Р”РѕСЃС‚СѓРїРЅРѕ", type: "number", showInForm: false, showInTable: true, showInCard: true },
      { key: "reserved", label: "Р РµР·РµСЂРІ", type: "number", showInForm: false, showInTable: true, showInCard: false },
      { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  },
  tasks: {
    entityLabel: "Р·Р°РґР°С‡Р°",
    defaultViewLabel: "Р’СЃРµ Р·Р°РґР°С‡Рё",
    baseFields: [
      { key: "title", label: "Р—Р°РґР°С‡Р°", type: "text", showInForm: true, showInTable: true, showInCard: true },
      { key: "owner", label: "РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№", type: "text", showInForm: true, showInTable: true, showInCard: false },
      {
        key: "status",
        label: "РЎС‚Р°С‚СѓСЃ",
        type: "select",
        options: TASK_STATUSES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: false
      },
      {
        key: "priority",
        label: "РџСЂРёРѕСЂРёС‚РµС‚",
        type: "select",
        options: TASK_PRIORITIES.map((item) => item.label),
        showInForm: true,
        showInTable: true,
        showInCard: true
      },
      { key: "sprintId", label: "РС‚РµСЂР°С†РёСЏ", type: "text", showInForm: true, showInTable: true, showInCard: false },
      { key: "dueDate", label: "РЎСЂРѕРє", type: "date", showInForm: true, showInTable: true, showInCard: false },
      { key: "blocked", label: "Р•СЃС‚СЊ Р±Р»РѕРєРµСЂ", type: "checkbox", showInForm: true, showInTable: true, showInCard: true },
      { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№", type: "textarea", showInForm: true, showInTable: false, showInCard: false }
    ]
  }
};

const MODULE_MODE_CONFIG = {
  directories: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "lists", label: "РЎРїСЂР°РІРѕС‡РЅРёРєРё" }
  ],
  crm: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "board", label: "Р’РѕСЂРѕРЅРєР°" },
    { key: "table", label: "РўР°Р±Р»РёС†Р°" },
    { key: "form", label: "РљР°СЂС‚РѕС‡РєР°" }
  ],
  warehouse: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "catalog", label: "РћСЃС‚Р°С‚РєРё" },
    { key: "products", label: "РўРѕРІР°СЂС‹" },
    { key: "purchases", label: "Р—Р°РєСѓРїРєРё" },
    { key: "finance", label: "Р”РµРЅСЊРіРё" },
    { key: "production", label: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ" },
    { key: "movements", label: "Р”РІРёР¶РµРЅРёСЏ" },
    { key: "form", label: "Р¤РѕСЂРјС‹" }
  ],
  products: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "products", label: "РўРѕРІР°СЂС‹" }
  ],
  purchases: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "purchases", label: "Р—Р°РєСѓРїРєРё" }
  ],
  money: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "finance", label: "Р”РµРЅСЊРіРё" }
  ],
  production: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "production", label: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ" }
  ],
  tasks: [
    { key: "overview", label: "РћР±Р·РѕСЂ" },
    { key: "board", label: "РљР°РЅР±Р°РЅ" },
    { key: "table", label: "Р›РµРЅС‚Р°" },
    { key: "form", label: "Р¤РѕСЂРјС‹" }
  ]
};

if (Array.isArray(MODULE_MODE_CONFIG.warehouse) && !MODULE_MODE_CONFIG.warehouse.some((item) => item.key === "history")) {
  MODULE_MODE_CONFIG.warehouse.splice(2, 0, { key: "history", label: "РСЃС‚РѕСЂРёСЏ" });
}

const LIVE_UI_STORAGE_PREFIX = "dom-neona:live-ui";
const LIVE_DRAFT_STORAGE_PREFIX = "dom-neona:live-draft";
const EXTERNAL_SHARED_APPS = {
  sales: "sales-tracker",
  myCalculator: "moy-calculator",
  partnerCalculatorsPattern: "part-calculator%"
};

const DEFAULT_DIRECTORY_LISTS = [
  {
    id: "crm_channels",
    key: "crm_channels",
    title: "РљР°РЅР°Р»С‹ CRM",
    description: "РСЃС‚РѕС‡РЅРёРєРё Р»РёРґРѕРІ Рё Р·Р°РєР°Р·РѕРІ.",
    options: ["РђРІРёС‚Рѕ", "РЎР°Р№С‚", "РќР°С€ РєР»РёРµРЅС‚", "VK", "РЎРѕРѕР±С‰РµСЃС‚РІРѕ", "Р РµРєРѕРјРµРЅРґР°С†РёРё"]
  },
  {
    id: "team_members",
    key: "team_members",
    title: "РЎРѕС‚СЂСѓРґРЅРёРєРё",
    description: "РњРµРЅРµРґР¶РµСЂС‹, РґРёР·Р°Р№РЅРµСЂС‹, РјР°СЃС‚РµСЂР° Рё РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рµ.",
    options: ["РќРёРєРёС‚Р° РЎСѓС…РѕС‚РёРЅ"]
  },
  {
    id: "warehouse_categories",
    key: "warehouse_categories",
    title: "РљР°С‚РµРіРѕСЂРёРё СЃРєР»Р°РґР°",
    description: "Р“СЂСѓРїРїС‹ С‚РѕРІР°СЂРѕРІ Рё РјР°С‚РµСЂРёР°Р»РѕРІ.",
    options: ["РќРµРѕРЅ", "Р‘Р»РѕРєРё РїРёС‚Р°РЅРёСЏ", "РџСЂРѕС„РёР»СЊ", "РљСЂРµРїРµР¶", "Р Р°СЃС…РѕРґРЅРёРєРё"]
  },
  {
    id: "warehouse_units",
    key: "warehouse_units",
    title: "Р•РґРёРЅРёС†С‹ РёР·РјРµСЂРµРЅРёСЏ",
    description: "Р•РґРёРЅРёС†С‹ РґР»СЏ РєР°С‚Р°Р»РѕРіР° С‚РѕРІР°СЂРѕРІ Рё РјР°С‚РµСЂРёР°Р»РѕРІ.",
    options: ["С€С‚", "Рј", "РєРѕРјРїР»", "СѓРїР°Рє"]
  },
  {
    id: "suppliers",
    key: "suppliers",
    title: "РџРѕСЃС‚Р°РІС‰РёРєРё",
    description: "РљРѕРЅС‚СЂР°РіРµРЅС‚С‹ РґР»СЏ Р·Р°РєСѓРїРѕРє, С‚РѕРІР°СЂРѕРІ Рё РґРµРЅРµР¶РЅС‹С… РѕРїРµСЂР°С†РёР№.",
    options: ["РћРћРћ Р›РђР™Рў", "РћСЃРЅРѕРІРЅРѕР№ РїРѕСЃС‚Р°РІС‰РёРє"]
  },
  {
    id: "product_groups",
    key: "product_groups",
    title: "Р“СЂСѓРїРїС‹ С‚РѕРІР°СЂРѕРІ",
    description: "РљР°С‚РµРіРѕСЂРёРё С‚РѕРІР°СЂРЅРѕРіРѕ РєР°С‚Р°Р»РѕРіР° РґР»СЏ РїСЂРѕРґР°Р¶Рё Рё РїСЂРѕРёР·РІРѕРґСЃС‚РІР°.",
    options: ["Р’С‹РІРµСЃРєРё", "РќРµРѕРЅ", "РљРѕРјРїР»РµРєС‚СѓСЋС‰РёРµ", "РЈСЃР»СѓРіРё"]
  },
  {
    id: "finance_accounts",
    key: "finance_accounts",
    title: "РЎС‡РµС‚Р° Рё РєР°СЃСЃС‹",
    description: "РљСѓРґР° РїСЂРёС…РѕРґСЏС‚ Рё РѕС‚РєСѓРґР° СѓС…РѕРґСЏС‚ РґРµРЅСЊРіРё.",
    options: ["РћСЃРЅРѕРІРЅРѕР№ СЃС‡РµС‚", "РљР°СЃСЃР°", "РљР°СЂС‚Р°", "РџР°СЂС‚РЅРµСЂСЃРєРёР№ СЃС‡РµС‚"]
  },
  {
    id: "finance_categories",
    key: "finance_categories",
    title: "РЎС‚Р°С‚СЊРё РґРµРЅРµРі",
    description: "РЎС‚Р°С‚СЊРё РїСЂРёС…РѕРґРѕРІ, СЂР°СЃС…РѕРґРѕРІ Рё РїРµСЂРµРјРµС‰РµРЅРёР№.",
    options: ["РџСЂРѕРґР°Р¶Р°", "Р—Р°РєСѓРїРєР°", "Р—Р°СЂРїР»Р°С‚Р°", "Р”РѕСЃС‚Р°РІРєР°", "РќР°Р»РѕРіРё", "РџРµСЂРµРјРµС‰РµРЅРёРµ"]
  },
  {
    id: "production_stages",
    key: "production_stages",
    title: "Р­С‚Р°РїС‹ РїСЂРѕРёР·РІРѕРґСЃС‚РІР°",
    description: "РЎС‚Р°С‚СѓСЃС‹ Рё СЌС‚Р°РїС‹ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹С… Р·Р°РґР°С‡.",
    options: ["РћС‡РµСЂРµРґСЊ", "РџРѕРґРіРѕС‚РѕРІРєР°", "Р’ СЂР°Р±РѕС‚Рµ", "РљРѕРЅС‚СЂРѕР»СЊ", "Р“РѕС‚РѕРІРѕ", "РџР°СѓР·Р°"]
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
  if (!normalized) return "вЂ”";
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

function repairMojibakeText(value) {
  if (typeof value !== "string") return value;
  if (!/[ÐÑРСЃЃв]/.test(value)) return value;
  try {
    let repaired = decodeURIComponent(escape(value));
    if (/[ÐÑРСЃЃв]/.test(repaired) && repaired !== value) {
      try {
        const repairedTwice = decodeURIComponent(escape(repaired));
        if (/[А-Яа-яЁё₽]/.test(repairedTwice)) repaired = repairedTwice;
      } catch {
        // Ignore second-pass failures.
      }
    }
    repaired = repaired.replace(/в‚Ѕ/g, "₽").replace(/вЂ”/g, "—").replace(/вЂў/g, "•");
    return /[А-Яа-яЁё₽]/.test(repaired) ? repaired : value;
  } catch {
    return value;
  }
}

function repairMojibakeDeep(value) {
  if (Array.isArray(value)) {
    return value.map(repairMojibakeDeep);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entryValue]) => [key, repairMojibakeDeep(entryValue)]));
  }
  return repairMojibakeText(value);
}

async function loadLight2WorkbookSnapshotFallback() {
  try {
    const response = await fetch(`./light2/workbook_snapshot.json?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return null;
    return repairMojibakeDeep(await response.json());
  } catch {
    return null;
  }
}

function parseDashboardLooseNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = compactText(String(value ?? "")).replace(/\s+/g, "").replace("%", "").replace(",", ".");
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function getSnapshotSheetByName(snapshot, name) {
  return snapshot?.sheets?.find((sheet) => compactText(sheet?.name) === compactText(name)) || null;
}

const SNAPSHOT_MONTH_NAMES = [
  "янв",
  "фев",
  "мар",
  "апр",
  "май",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "сент",
  "окт",
  "ноя",
  "дек"
];

function getSnapshotRowDisplay(row, columnIndex) {
  return repairMojibakeText(compactText(row?.cells?.[String(columnIndex)]?.display || row?.cells?.[String(columnIndex)]?.value || ""));
}

function getSnapshotSheetDisplay(sheet, rowIndex, columnIndex) {
  const row = (sheet?.rows || []).find((entry) => Number(entry?.index) === Number(rowIndex));
  return getSnapshotRowDisplay(row, columnIndex);
}

function isSnapshotMonthLabel(value) {
  const normalized = repairMojibakeText(compactText(value)).toLowerCase().replace(/\./g, "");
  if (!normalized) return false;
  return SNAPSHOT_MONTH_NAMES.some((month) => normalized.includes(month));
}

function getSnapshotMetricCell(rowMap, labels, columnIndex) {
  for (const label of labels) {
    const row = rowMap.get(label);
    if (!row) continue;
    const cell = row?.cells?.[String(columnIndex)] || null;
    const display = repairMojibakeText(compactText(cell?.display || cell?.value || ""));
    if (display) {
      return {
        display,
        value: cell?.value
      };
    }
  }
  return null;
}

function getSnapshotMetricNumber(rowMap, labels, columnIndex) {
  const cell = getSnapshotMetricCell(rowMap, labels, columnIndex);
  return cell ? parseDashboardLooseNumber(cell.display ?? cell.value) : null;
}

function parseLight2MetricsSeries(sheet) {
  if (!sheet?.rows?.length) return [];

  const headerRow = (sheet.rows || []).find((row) => Number(row?.index) === 2);
  const sumRow = (sheet.rows || []).find((row) => Number(row?.index) === 3);
  const yearRow = (sheet.rows || []).find((row) => Number(row?.index) === 1);
  const headerColumns = Object.keys(headerRow?.cells || {})
    .map(Number)
    .sort((a, b) => a - b)
    .filter((columnIndex) => isSnapshotMonthLabel(getSnapshotRowDisplay(headerRow, columnIndex)));

  if (!headerColumns.length) return [];

  const yearGroups = Object.keys(yearRow?.cells || {})
    .map(Number)
    .sort((a, b) => a - b)
    .filter((columnIndex) => /\d/.test(getSnapshotRowDisplay(yearRow, columnIndex)))
    .map((columnIndex, index, columns) => ({
      start: columnIndex,
      end: (columns[index + 1] || ((sheet.maxCol || columns[columns.length - 1] || columnIndex) + 1)) - 1,
      yearLabel: getSnapshotRowDisplay(yearRow, columnIndex)
    }));

  const rowMap = new Map(
    (sheet.rows || [])
      .filter((row) => Number(row?.index) >= 4)
      .map((row) => {
        const rowLabel = repairMojibakeText(getSnapshotRowDisplay(row, 1));
        return rowLabel ? [rowLabel, row] : null;
      })
      .filter(Boolean)
  );

  return headerColumns
    .filter((columnIndex) => repairMojibakeText(getSnapshotRowDisplay(sumRow, columnIndex)).startsWith("Сумма"))
    .map((columnIndex) => {
      const group = yearGroups.find((entry) => columnIndex >= entry.start && columnIndex <= entry.end);
      return {
        columnIndex,
        monthLabel: getSnapshotRowDisplay(headerRow, columnIndex),
        yearLabel: compactText(group?.yearLabel),
        revenue: getSnapshotMetricNumber(rowMap, ["Выручка"], columnIndex) || 0,
        cost: getSnapshotMetricNumber(rowMap, ["Себестоимость"], columnIndex) || 0,
        grossProfit: getSnapshotMetricNumber(rowMap, ["Валовая прибыль"], columnIndex) || 0,
        operatingExpenses: getSnapshotMetricNumber(rowMap, ["Операционные расходы"], columnIndex) || 0,
        operatingProfit: getSnapshotMetricNumber(rowMap, ["Операционная прибыль"], columnIndex) || 0,
        taxes: getSnapshotMetricNumber(rowMap, ["Налоги и сборы"], columnIndex) || 0,
        netProfit: getSnapshotMetricNumber(rowMap, ["Чистая прибыль"], columnIndex) || 0,
        margin: getSnapshotMetricNumber(rowMap, ["Маржа"], columnIndex) || 0,
        averageCheck: getSnapshotMetricNumber(rowMap, ["Средний чек", "Чек"], columnIndex) || 0,
        sales: getSnapshotMetricNumber(rowMap, ["Продаж", "Продажи"], columnIndex) || 0,
        warehouse: getSnapshotMetricNumber(rowMap, ["Склад"], columnIndex) || 0,
        tbuMoney: getSnapshotMetricNumber(rowMap, ["ТБУ в деньгах"], columnIndex) || 0
      };
    })
    .filter((item) => item.revenue || item.netProfit || item.sales || item.averageCheck);
}

function buildLight2DashboardFallback(snapshot) {
  if (!snapshot?.sheets?.length) return null;
  const metricsSheet = getSnapshotSheetByName(snapshot, "Метрики");
  const purchasesSheet = getSnapshotSheetByName(snapshot, "Закупки");
  const settlementsSheet = getSnapshotSheetByName(snapshot, "Взаиморасчет с мастерами");
  const assetsSheet = getSnapshotSheetByName(snapshot, "Активы");
  const metricsSeries = parseLight2MetricsSeries(metricsSheet);
  const latestMetrics = metricsSeries.at(-1) || null;
  let balanceTotal = 0;
  let settlementsPayout = 0;
  let openSettlementsCount = 0;
  let purchasesCount = 0;
  let assetsRemaining = 0;
  const suppliers = new Set();

  if (latestMetrics) {
    balanceTotal = latestMetrics.netProfit || latestMetrics.operatingProfit || latestMetrics.revenue || 0;
  }

  settlementsSheet?.rows?.forEach((row) => {
    const employee = repairMojibakeText(compactText(row?.cells?.["2"]?.display || row?.cells?.["1"]?.display || ""));
    if (!employee) return;
    const status = repairMojibakeText(compactText(row?.cells?.["6"]?.display || row?.cells?.["5"]?.display || ""));
    if (["Взаиморасчет произведен", "Архив"].includes(status)) return;
    openSettlementsCount += 1;
    const amount = parseDashboardLooseNumber(row?.cells?.["3"]?.display || row?.cells?.["4"]?.display || row?.cells?.["5"]?.display);
    if (amount !== null && amount > 0) settlementsPayout += amount;
  });

  purchasesSheet?.rows?.forEach((row) => {
    const supplier = repairMojibakeText(compactText(row?.cells?.["1"]?.display || ""));
    const itemName = repairMojibakeText(compactText(row?.cells?.["7"]?.display || row?.cells?.["6"]?.display || ""));
    if (!supplier && !itemName) return;
    purchasesCount += 1;
    if (supplier) suppliers.add(supplier);
  });

  assetsSheet?.rows?.forEach((row) => {
    const title = repairMojibakeText(compactText(row?.cells?.["1"]?.display || ""));
    if (!title) return;
    const amount = parseDashboardLooseNumber(row?.cells?.["4"]?.display || row?.cells?.["3"]?.display || row?.cells?.["2"]?.display);
    if (amount !== null && amount > 0) assetsRemaining += amount;
  });

  return {
    balanceTotal: roundMoney(balanceTotal),
    openSettlementsCount,
    settlementsPayout: roundMoney(settlementsPayout),
    assetsRemaining: roundMoney(assetsRemaining || latestMetrics?.warehouse || 0),
    purchasesCount,
    suppliersCount: suppliers.size,
    metricsSeries,
    latestMetrics
  };
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
  return TASK_PRIORITIES.find((item) => item.key === priorityKey)?.label || "РЎСЂРµРґРЅРёР№";
}

function sanitizeKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_Р°-СЏС‘-]+/gi, "_")
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
    title: title || "РЎРѕР±С‹С‚РёРµ Р·Р°РґР°С‡Рё",
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
  if (!previous) return "РљР°СЂС‚РѕС‡РєР° Р·Р°РІРµРґРµРЅР° РІ СЂР°Р±РѕС‡РµРј РєРѕРЅС‚СѓСЂРµ.";
  const sprintMap = new Map((sprintOptions || []).map((sprint) => [compactText(sprint.id), compactText(sprint.title)]));
  const changes = [];

  if (compactText(previous.title) !== compactText(next.title)) changes.push("РЅР°Р·РІР°РЅРёРµ");
  if (compactText(previous.owner) !== compactText(next.owner)) changes.push("РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№");
  if (compactText(previous.status) !== compactText(next.status)) {
    changes.push(`СЃС‚Р°С‚СѓСЃ: ${getTaskStatusMeta(previous.status).label} -> ${getTaskStatusMeta(next.status).label}`);
  }
  if (compactText(previous.priority) !== compactText(next.priority)) {
    changes.push(`РїСЂРёРѕСЂРёС‚РµС‚: ${getPriorityLabel(previous.priority)} -> ${getPriorityLabel(next.priority)}`);
  }
  if (compactText(previous.sprintId) !== compactText(next.sprintId)) {
    const before = sprintMap.get(compactText(previous.sprintId)) || "Р±РµР· РёС‚РµСЂР°С†РёРё";
    const after = sprintMap.get(compactText(next.sprintId)) || "Р±РµР· РёС‚РµСЂР°С†РёРё";
    changes.push(`РёС‚РµСЂР°С†РёСЏ: ${before} -> ${after}`);
  }
  if (normalizeDateInput(previous.dueDate) !== normalizeDateInput(next.dueDate)) {
    changes.push(`СЃСЂРѕРє: ${formatDate(previous.dueDate)} -> ${formatDate(next.dueDate)}`);
  }
  if (Boolean(previous.blocked) !== Boolean(next.blocked)) {
    changes.push(next.blocked ? "РґРѕР±Р°РІР»РµРЅ Р±Р»РѕРєРµСЂ" : "Р±Р»РѕРєРµСЂ СЃРЅСЏС‚");
  }
  if (compactText(previous.note) !== compactText(next.note)) changes.push("РєРѕРјРјРµРЅС‚Р°СЂРёР№");
  if (JSON.stringify(previous.custom || {}) !== JSON.stringify(next.custom || {})) changes.push("РєР°СЃС‚РѕРјРЅС‹Рµ РїРѕР»СЏ");

  return changes.length ? changes.join(" вЂў ") : "РћР±РЅРѕРІР»РµРЅС‹ РґРµС‚Р°Р»Рё РєР°СЂС‚РѕС‡РєРё.";
}

function getTaskSourceLabel(context) {
  if (!context) return "Р СѓС‡РЅР°СЏ Р·Р°РґР°С‡Р°";
  if (context.type === "crm" || context.type === "crm-signal") return "CRM";
  if (context.type === "warehouse" || context.type === "warehouse-signal") return "РЎРєР»Р°Рґ";
  if (context.type === "sales-signal") return "РџСЂРѕРґР°Р¶Рё";
  return "РЎРІСЏР·Р°РЅРЅС‹Р№ РєРѕРЅС‚СѓСЂ";
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
  if (field?.type === "checkbox") return rawValue ? "Р”Р°" : "РќРµС‚";
  return compactText(rawValue) || "вЂ”";
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
    return `<label><span>${escapeHtml(field.label)}</span><select class="form-select" name="${escapeHtml(name)}"><option value="">РќРµ РІС‹Р±СЂР°РЅРѕ</option>${options.map((option) => `<option value="${escapeHtml(option)}" ${String(value || "") === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select></label>`;
  }
  return `<label><span>${escapeHtml(field.label)}</span><input class="form-control" type="text" name="${escapeHtml(name)}" value="${escapeHtml(String(value || ""))}" /></label>`;
}

function renderCustomFieldSection(moduleKey, doc, record, escapeHtml) {
  const fields = getVisibleCustomFields(moduleKey, doc, "showInForm");
  if (!fields.length) return "";
  return `
    <div class="workspace-custom-block">
      <div class="workspace-custom-block__head">
        <strong>РќР°СЃС‚СЂР°РёРІР°РµРјС‹Рµ РїРѕР»СЏ</strong>
        <span>Р”РѕР±Р°РІР»СЏСЋС‚СЃСЏ С‡РµСЂРµР· РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ СЂР°Р·РґРµР»Р°</span>
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
  if (format === "text") return String(value ?? "вЂ”");
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
      return { label: formula.label, value: formatFormulaValue(formula.format, value), caption: "Р¤РѕСЂРјСѓР»Р° РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂР°" };
    } catch (error) {
      return { label: formula.label, value: "РћС€РёР±РєР°", caption: error.message || "Р¤РѕСЂРјСѓР»Р° РЅРµ СЂР°СЃСЃС‡РёС‚Р°Р»Р°СЃСЊ" };
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
      ${uiState.activeViewId === "adhoc" ? '<span class="workspace-view-tab workspace-view-tab--ghost">РўРµРєСѓС‰РёР№ С„РёР»СЊС‚СЂ</span>' : ""}
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
          <h4>РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ СЂР°Р·РґРµР»Р°</h4>
          <div class="compact-help">РЎРѕР±РёСЂР°Р№С‚Рµ СЃРѕР±СЃС‚РІРµРЅРЅС‹Рµ РІРєР»Р°РґРєРё, РїРѕР»СЏ Рё KPI Р±РµР· РѕС‚РґРµР»СЊРЅРѕР№ СЂР°Р·СЂР°Р±РѕС‚РєРё Р±Р°Р·С‹.</div>
        </div>
      </div>
      <div class="builder-grid">
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>Р’РєР»Р°РґРєРё-РїСЂРµРґСЃС‚Р°РІР»РµРЅРёСЏ</strong>
            <span>РЎРѕС…СЂР°РЅСЏСЋС‚ С‚РµРєСѓС‰РёРµ С„РёР»СЊС‚СЂС‹ РєР°Рє РѕС‚РґРµР»СЊРЅСѓСЋ РІРєР»Р°РґРєСѓ.</span>
          </div>
          <form class="builder-form" data-builder-action="view">
            <input class="form-control" type="text" name="label" placeholder="РќР°РїСЂРёРјРµСЂ: РЎСЂРѕС‡РЅС‹Рµ СЃРґРµР»РєРё" required />
            <button class="btn btn-dark btn-sm" type="submit">РЎРѕС…СЂР°РЅРёС‚СЊ РІРєР»Р°РґРєСѓ</button>
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
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-view-delete="${escapeHtml(view.id)}">РЈРґР°Р»РёС‚СЊ</button>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅС‹С… РІРєР»Р°РґРѕРє РїРѕРєР° РЅРµС‚.</div>'
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>РќР°СЃС‚СЂР°РёРІР°РµРјС‹Рµ РїРѕР»СЏ</strong>
            <span>РџРѕР»СЏ РјРѕР¶РЅРѕ РІС‹РІРѕРґРёС‚СЊ РІ С„РѕСЂРјСѓ, С‚Р°Р±Р»РёС†Сѓ Рё РєР°СЂС‚РѕС‡РєСѓ РѕС‚РґРµР»СЊРЅРѕ.</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="field">
            <div class="workspace-form-grid">
              <label><span>РљР»СЋС‡ РїРѕР»СЏ</span><input class="form-control" type="text" name="key" placeholder="client_city" required /></label>
              <label><span>РџРѕРґРїРёСЃСЊ</span><input class="form-control" type="text" name="label" placeholder="Р“РѕСЂРѕРґ РєР»РёРµРЅС‚Р°" required /></label>
              <label><span>РўРёРї</span><select class="form-select" name="type">${CUSTOM_FIELD_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label>
              <label><span>РћРїС†РёРё СЃРїРёСЃРєР°</span><input class="form-control" type="text" name="options" placeholder="Р’ СЂР°Р±РѕС‚Рµ, РќР° РїР°СѓР·Рµ, РђСЂС…РёРІ" /></label>
            </div>
            <div class="builder-checks">
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInForm" checked /><span>РџРѕРєР°Р·С‹РІР°С‚СЊ РІ С„РѕСЂРјРµ</span></label>
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInTable" checked /><span>РџРѕРєР°Р·С‹РІР°С‚СЊ РІ С‚Р°Р±Р»РёС†Рµ</span></label>
              <label class="permission-flag"><input class="form-check-input" type="checkbox" name="showInCard" /><span>РџРѕРєР°Р·С‹РІР°С‚СЊ РІ РєР°СЂС‚РѕС‡РєРµ</span></label>
            </div>
            <button class="btn btn-dark btn-sm" type="submit">Р”РѕР±Р°РІРёС‚СЊ РїРѕР»Рµ</button>
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
                            <span>${escapeHtml(field.key)} вЂў ${escapeHtml(field.type)}</span>
                          </div>
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-field-delete="${escapeHtml(field.key)}">РЈРґР°Р»РёС‚СЊ</button>
                        </div>
                      `
                    )
                    .join("")
                : `<div class="workspace-empty workspace-empty--tight">РџРѕРєР° РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ С‚РѕР»СЊРєРѕ Р±Р°Р·РѕРІС‹Рµ РїРѕР»СЏ ${escapeHtml(meta.entityLabel)}.</div>`
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>Р¤РѕСЂРјСѓР»С‹ Рё KPI</strong>
            <span>Р¤РѕСЂРјСѓР»С‹ СЃС‡РёС‚Р°СЋС‚ РїРѕРєР°Р·Р°С‚РµР»Рё РїРѕ С‚РµРєСѓС‰РµРјСѓ РЅР°Р±РѕСЂСѓ РґР°РЅРЅС‹С….</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="formula">
            <div class="workspace-form-grid">
              <label><span>РљР»СЋС‡</span><input class="form-control" type="text" name="key" placeholder="pipeline_margin" required /></label>
              <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="label" placeholder="РњР°СЂР¶Р° РІ РІРѕСЂРѕРЅРєРµ" required /></label>
              <label><span>Р¤РѕСЂРјР°С‚</span><select class="form-select" name="format">${FORMULA_FORMATS.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label>
            </div>
            <label><span>Р¤РѕСЂРјСѓР»Р°</span><input class="form-control" type="text" name="expression" placeholder='РќР°РїСЂРёРјРµСЂ: sum("amount") / Math.max(count(), 1)' required /></label>
            <div class="compact-help">Р”РѕСЃС‚СѓРїРЅС‹Рµ С„СѓРЅРєС†РёРё: <code>count()</code>, <code>countWhere("field","value")</code>, <code>sum("field")</code>, <code>avg("field")</code>, <code>min("field")</code>, <code>max("field")</code>, <code>percent(a,b)</code>.</div>
            <button class="btn btn-dark btn-sm" type="submit">Р”РѕР±Р°РІРёС‚СЊ С„РѕСЂРјСѓР»Сѓ</button>
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
                          <button class="btn btn-sm btn-outline-danger" type="button" data-builder-formula-delete="${escapeHtml(formula.key)}">РЈРґР°Р»РёС‚СЊ</button>
                        </div>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Р¤РѕСЂРјСѓР»С‹ РїРѕРєР° РЅРµ РґРѕР±Р°РІР»РµРЅС‹.</div>'
            }
          </div>
        </article>
        <article class="builder-card">
          <div class="builder-card__head">
            <strong>JSON-СЃС…РµРјР° СЂР°Р·РґРµР»Р°</strong>
            <span>Р”Р»СЏ РјР°РєСЃРёРјР°Р»СЊРЅРѕ РіРёР±РєРѕР№ РЅР°СЃС‚СЂРѕР№РєРё РјРѕР¶РЅРѕ РїСЂР°РІРёС‚СЊ views, fields Рё formulas С†РµР»РёРєРѕРј РѕРґРЅРёРј JSON.</span>
          </div>
          <form class="builder-form builder-form--stack" data-builder-action="schema">
            <label>
              <span>РЎС…РµРјР° РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂР°</span>
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
            <div class="compact-help">РџРѕРґРґРµСЂР¶РёРІР°СЋС‚СЃСЏ С‚СЂРё РјР°СЃСЃРёРІР°: <code>views</code>, <code>fields</code>, <code>formulas</code>. РџРѕСЃР»Рµ СЃРѕС…СЂР°РЅРµРЅРёСЏ СЃС…РµРјР° РЅРѕСЂРјР°Р»РёР·СѓРµС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё.</div>
            <button class="btn btn-dark btn-sm" type="submit">РЎРѕС…СЂР°РЅРёС‚СЊ JSON-СЃС…РµРјСѓ</button>
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
    partnerCalculators: null
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
      <div class="workspace-mode-tabs" role="tablist" aria-label="Р РµР¶РёРјС‹ СЂР°Р·РґРµР»Р°">
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
    const activeModeLabel = modeOptions.find((item) => item.key === uiState.mode)?.label || "РћР±Р·РѕСЂ";
    const activeViewLabel = uiState.activeViewId === "adhoc" ? "РўРµРєСѓС‰РёР№ С„РёР»СЊС‚СЂ" : "РЎРѕС…СЂР°РЅРµРЅРЅС‹Р№";
    return `
      <div class="workspace-command-bar">
        <div class="workspace-command-bar__meta">
          <span class="workspace-command-chip">Р РµР¶РёРј: ${escapeFn(activeModeLabel)}</span>
          <span class="workspace-command-chip">Р’РёРґ: ${escapeFn(activeViewLabel)}</span>
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
    return '<div class="workspace-inline-hint">Р•СЃС‚СЊ С‡РµСЂРЅРѕРІРёРє. РћРЅ СѓР¶Рµ РїРѕРґСЃС‚Р°РІР»РµРЅ РІ С„РѕСЂРјСѓ Рё РЅРµ РїРѕС‚РµСЂСЏРµС‚СЃСЏ РїРѕСЃР»Рµ РѕР±РЅРѕРІР»РµРЅРёСЏ СЃС‚СЂР°РЅРёС†С‹.</div>';
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
    setStatus("JSON РІС‹РіСЂСѓР¶РµРЅ.", "success");
  }

  async function importModuleData(moduleKey) {
    const raw = window.prompt("Р’СЃС‚Р°РІСЊС‚Рµ JSON СЌРєСЃРїРѕСЂС‚ СЌС‚РѕРіРѕ СЂР°Р·РґРµР»Р° С†РµР»РёРєРѕРј.");
    if (!raw) return;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      throw new Error(`JSON РЅРµ СЂР°СЃРїРѕР·РЅР°РЅ: ${error.message || "РѕС€РёР±РєР° СЃРёРЅС‚Р°РєСЃРёСЃР°"}`);
    }
    await saveDocument(moduleKey, parsed, "JSON СЂР°Р·РґРµР»Р° РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅ.");
    await rerenderCurrentModule();
  }

  function duplicateTitle(value) {
    return compactText(value) ? `${compactText(value)} РєРѕРїРёСЏ` : "РљРѕРїРёСЏ";
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
    if (status.includes("РѕС‚РјРµРЅ")) return "lost";
    if (status.includes("РіРѕС‚РѕРІ")) return "done";
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
      const key = compactText(order.leadChannel || order.salesChannel || "Р‘РµР· РєР°РЅР°Р»Р°");
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
    if (appId === EXTERNAL_SHARED_APPS.myCalculator) return "РњРѕР№ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ";
    if (appId === "part-calculator") return "РџР°СЂС‚РЅРµСЂСЃРєРёР№ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂ";
    if (appId.startsWith("part-calculator:")) return `РџР°СЂС‚РЅРµСЂ: ${appId.split(":")[1] || "Р±РµР· РёРјРµРЅРё"}`;
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
        name: compactText(tab.name) || `Р’РєР»Р°РґРєР° ${index + 1}`,
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
          entry.examples.push(`${tab.label} вЂў ${tab.name}`);
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
      if (family === "CRM") return { label: "РР· CRM", moduleKey: "crm" };
      if (family === "РЎРєР»Р°Рґ") return { label: "РР· РЎРєР»Р°РґР°", moduleKey: "warehouse" };
      if (family === "РџСЂРѕРґР°Р¶Рё") return { label: "РР· РџСЂРѕРґР°Р¶", moduleKey: "sales" };
      return { label: "РР· СЃРёРіРЅР°Р»Р°", moduleKey: "tasks" };
    }
    if (sourceApp === "platform_crm_manual" || compactText(task?.sourceKey).startsWith("crm-deal:")) {
      return { label: "РЎРІСЏР·Р°РЅРѕ СЃРѕ СЃРґРµР»РєРѕР№", moduleKey: "crm" };
    }
    if (sourceApp === "platform_warehouse_manual" || compactText(task?.sourceKey).startsWith("warehouse-item:")) {
      return { label: "РЎРІСЏР·Р°РЅРѕ СЃРѕ СЃРєР»Р°РґРѕРј", moduleKey: "warehouse" };
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
        title: deal?.title || deal?.client || "CRM-СЃРґРµР»РєР°",
        subtitle: deal?.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ",
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
        title: item?.name || item?.sku || "РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР°",
        subtitle: item?.sku || item?.category || "РЎРєР»Р°РґСЃРєРѕР№ РєРѕРЅС‚СѓСЂ",
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
        title: deal?.title || task.title || "РЎРёРіРЅР°Р» CRM",
        subtitle: "РџСЂРѕСЃСЂРѕС‡РµРЅРЅР°СЏ СЃРґРµР»РєР°",
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
        title: item?.name || task.title || "РЎРёРіРЅР°Р» СЃРєР»Р°РґР°",
        subtitle: "РќРёР·РєРёР№ РѕСЃС‚Р°С‚РѕРє",
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
        title: order?.orderNumber || order?.title || task.title || "РЎРёРіРЅР°Р» РѕРїР»Р°С‚С‹",
        subtitle: order?.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ",
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
    const sprintTitle = compactText(task?.sprint?.title || "") || "Р‘РµР· РёС‚РµСЂР°С†РёРё";
    const cards = [
      {
        label: "РЎС‚Р°С‚СѓСЃ",
        value: getTaskStatusMeta(task?.status).label,
        caption: overdue ? "СЃСЂРѕРє СѓР¶Рµ РїСЂРѕСЃСЂРѕС‡РµРЅ" : "СЂР°Р±РѕС‡РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ РєР°СЂС‚РѕС‡РєРё",
        tone: overdue ? "danger" : getTaskStatusMeta(task?.status).tone
      },
      {
        label: "РџСЂРёРѕСЂРёС‚РµС‚",
        value: getPriorityLabel(task?.priority),
        caption: task?.owner ? `РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№: ${task.owner}` : "РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№ РЅРµ РЅР°Р·РЅР°С‡РµРЅ",
        tone: task?.priority === "urgent" ? "danger" : task?.priority === "high" ? "warning" : "neutral"
      },
      {
        label: "РЎСЂРѕРє",
        value: dueDate ? formatDate(dueDate) : "РќРµ Р·Р°РґР°РЅ",
        caption: overdue ? "С‚СЂРµР±СѓРµС‚ СЃСЂРѕС‡РЅРѕРіРѕ РІРЅРёРјР°РЅРёСЏ" : dueDate ? "РєРѕРЅС‚СЂРѕР»СЊ РїРѕ РєР°Р»РµРЅРґР°СЂСЋ" : "РґР°С‚Р° РїРѕРєР° РЅРµ СѓРєР°Р·Р°РЅР°",
        tone: overdue ? "danger" : dueDate ? "info" : "neutral"
      },
      {
        label: "РС‚РµСЂР°С†РёСЏ",
        value: sprintTitle,
        caption: sprintTitle === "Р‘РµР· РёС‚РµСЂР°С†РёРё" ? "РЅРµ РїСЂРёРІСЏР·Р°РЅР° Рє СЃРїСЂРёРЅС‚Сѓ" : "СЂР°Р±РѕС‡РёР№ С†РёРєР» Р·Р°РґР°С‡Рё",
        tone: sprintTitle === "Р‘РµР· РёС‚РµСЂР°С†РёРё" ? "neutral" : "accent"
      },
      {
        label: "РСЃС‚РѕС‡РЅРёРє",
        value: getTaskSourceLabel(context),
        caption: context?.title ? compactText(context.title) : "СЂСѓС‡РЅРѕР№ РєРѕРЅС‚СѓСЂ",
        tone: context?.tone || "neutral"
      },
      {
        label: "Р‘Р»РѕРєРµСЂ",
        value: task?.blocked ? "Р”Р°" : "РќРµС‚",
        caption: task?.blocked ? "РЅСѓР¶РЅР° РїРѕРјРѕС‰СЊ РёР»Рё СЂРµС€РµРЅРёРµ" : "РєСЂРёС‚РёС‡РЅС‹С… Р±Р»РѕРєРµСЂРѕРІ РЅРµС‚",
        tone: task?.blocked ? "danger" : "success"
      }
    ];

    if (typeof context?.amount !== "undefined") {
      cards.push({
        label: "РЎСѓРјРјР° РєРѕРЅС‚СѓСЂР°",
        value: formatMoney(context.amount || 0),
        caption: "СЃРІСЏР·Р°РЅРЅС‹Р№ С„РёРЅР°РЅСЃРѕРІС‹Р№ РѕР±СЉС‘Рј",
        tone: "info"
      });
    } else if (typeof context?.available !== "undefined") {
      cards.push({
        label: "Р”РѕСЃС‚СѓРїРЅРѕ РЅР° СЃРєР»Р°РґРµ",
        value: formatNumber(context.available || 0),
        caption: `${formatNumber(context.onHand || 0)} РЅР° СЂСѓРєР°С… вЂў ${formatNumber(context.reserved || 0)} РІ СЂРµР·РµСЂРІРµ`,
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

    if (!history.some((entry) => compactText(entry.title) === "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°")) {
      events.push({
        date: task?.createdAt || new Date().toISOString(),
        title: "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°",
        meta: compactText(task?.title || "Р‘РµР· РЅР°Р·РІР°РЅРёСЏ"),
        tone: "neutral",
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }
    if (task?.updatedAt && compactText(task.updatedAt) !== compactText(task.createdAt)) {
      events.push({
        date: task.updatedAt,
        title: "РљР°СЂС‚РѕС‡РєР° РѕР±РЅРѕРІР»РµРЅР°",
        meta: `${getTaskStatusMeta(task.status).label} вЂў ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }
    if (normalizeDateInput(task?.dueDate)) {
      events.push({
        date: normalizeDateInput(task.dueDate),
        title: compactText(task?.status) === "done" ? "Р¤РёРЅР°Р»СЊРЅС‹Р№ СЃСЂРѕРє Р·Р°РґР°С‡Рё" : "РљРѕРЅС‚СЂРѕР»СЊРЅС‹Р№ СЃСЂРѕРє",
        meta: compactText(task?.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ"),
        tone: compactText(task?.status) === "done" ? "success" : "warning",
        moduleKey: "tasks",
        entityId: task?.id || ""
      });
    }

    events.push(...history);

    if (context?.order?.invoiceDate) {
      events.push({
        date: context.order.invoiceDate,
        title: "РџРѕ РёСЃС‚РѕС‡РЅРёРєСѓ РІС‹СЃС‚Р°РІР»РµРЅ СЃС‡С‘С‚",
        meta: `${compactText(context.order.orderNumber || context.order.title || "Р—Р°РєР°Р·")} вЂў ${formatMoney(context.order.amount || 0)}`,
        tone: "accent",
        moduleKey: "sales"
      });
    }
    if (context?.order?.paidDate) {
      events.push({
        date: context.order.paidDate,
        title: "РџРѕ РёСЃС‚РѕС‡РЅРёРєСѓ РїСЂРёС€Р»Р° РѕРїР»Р°С‚Р°",
        meta: `${compactText(context.order.orderNumber || context.order.title || "Р—Р°РєР°Р·")} вЂў ${formatMoney(context.order.paidAmount || context.order.amount || 0)}`,
        tone: "success",
        moduleKey: "sales"
      });
    }
    (context?.reservation?.rows || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: movement.kind === "release" ? "Р РµР·РµСЂРІ РїРѕ Р·Р°РґР°С‡Рµ СЃРЅСЏС‚" : "РџРѕРґ Р·Р°РґР°С‡Сѓ Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ РјР°С‚РµСЂРёР°Р»",
        meta: `${formatNumber(movement.qty || 0)} вЂў ${compactText(movement.note || "РЎРєР»Р°РґСЃРєРѕР№ СЂРµР·РµСЂРІ")}`,
        tone: movement.kind === "release" ? "neutral" : "info",
        moduleKey: movement.itemId ? "warehouse" : "",
        entityId: movement.itemId || ""
      });
    });
    (context?.movements || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: "РЎРєР»Р°РґСЃРєРѕРµ РґРІРёР¶РµРЅРёРµ РїРѕ РёСЃС‚РѕС‡РЅРёРєСѓ",
        meta: `${compactText(WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind)?.label || movement.kind)} вЂў ${formatNumber(movement.qty || 0)}`,
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
        label: "РЎС‡РµС‚",
        value: order?.invoiceDate ? "Р’С‹СЃС‚Р°РІР»РµРЅ" : "РќРµС‚",
        caption: order?.invoiceDate ? formatDate(order.invoiceDate) : "СЃС‡РµС‚ РµС‰Рµ РЅРµ РІС‹СЃС‚Р°РІР»РµРЅ",
        tone: order?.invoiceDate ? "accent" : "neutral"
      },
      {
        label: "РћРїР»Р°С‚Р°",
        value: order?.paidDate ? "РћРїР»Р°С‡РµРЅ" : order?.invoiceDate ? "РћР¶РёРґР°РµС‚" : "вЂ”",
        caption: order?.paidDate ? formatDate(order.paidDate) : order?.invoiceDate ? "СЃС‡РµС‚ Р±РµР· РѕРїР»Р°С‚С‹" : "РЅРµС‚ РїР»Р°С‚РµР¶Р°",
        tone: order?.paidDate ? "success" : order?.invoiceDate ? "warning" : "neutral"
      },
      {
        label: "Р—Р°РґР°С‡Рё",
        value: formatNumber(openTasks.length),
        caption: blockedTasks.length ? `${blockedTasks.length} СЃ Р±Р»РѕРєРµСЂРѕРј` : `${linkedTasks.length} РІСЃРµРіРѕ`,
        tone: blockedTasks.length ? "danger" : openTasks.length ? "warning" : "success"
      },
      {
        label: "РњР°С‚РµСЂРёР°Р»С‹",
        value: formatNumber(reservation?.qty || 0),
        caption: reservation?.rows?.length ? `${reservation.rows.length} РґРІРёР¶РµРЅРёР№ СЂРµР·РµСЂРІР°` : deal?.stage === "production" ? "СЂРµР·РµСЂРІ РµС‰Рµ РЅРµ СЃРѕР·РґР°РЅ" : "СЂРµР·РµСЂРІ РЅРµ РЅСѓР¶РµРЅ",
        tone: reservation?.qty > 0 ? "info" : deal?.stage === "production" ? "warning" : "neutral"
      },
      {
        label: "РЎСЂРѕРє",
        value: normalizeDateInput(deal?.deadline) ? formatDate(deal.deadline) : "вЂ”",
        caption: overdue ? "СЃСЂРѕРє СѓР¶Рµ РїСЂРѕС€РµР»" : "РїРѕ РєР°СЂС‚РѕС‡РєРµ СЃРґРµР»РєРё",
        tone: overdue ? "danger" : "neutral"
      }
    ];
  }

  function buildDealTimeline(deal, order, reservationRows, tasks) {
    const events = [];
    const dealTitle = compactText(deal?.title || deal?.client || "РЎРґРµР»РєР°");

    if (deal?.createdAt) {
      events.push({
        date: deal.createdAt,
        title: "РЎРґРµР»РєР° СЃРѕР·РґР°РЅР°",
        meta: `${dealTitle}${deal?.owner ? ` вЂў ${compactText(deal.owner)}` : ""}`,
        tone: "neutral"
      });
    }
    if (deal?.updatedAt && compactText(deal.updatedAt) !== compactText(deal.createdAt)) {
      events.push({
        date: deal.updatedAt,
        title: "РЎРґРµР»РєР° РѕР±РЅРѕРІР»РµРЅР°",
        meta: `${getCrmStageMeta(deal.stage).label}${deal?.amount ? ` вЂў ${formatMoney(deal.amount)}` : ""}`,
        tone: getCrmStageMeta(deal.stage).tone
      });
    }

    if (order?.createdAt) {
      events.push({
        date: order.createdAt,
        title: "Р—Р°РєР°Р· РїРѕСЏРІРёР»СЃСЏ РІ РџСЂРѕРґР°Р¶Р°С…",
        meta: `${compactText(order.orderNumber || order.title || "Р—Р°РєР°Р·")} вЂў ${compactText(order.client || "РєР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")}`,
        tone: "neutral",
        moduleKey: "sales"
      });
    }
    if (order?.invoiceDate) {
      events.push({
        date: order.invoiceDate,
        title: "РЎС‡РµС‚ РІС‹СЃС‚Р°РІР»РµРЅ",
        meta: `${compactText(order.orderNumber || "Р—Р°РєР°Р·")} вЂў ${formatMoney(order.amount || 0)}`,
        tone: "accent",
        moduleKey: "sales"
      });
    }
    if (order?.paidDate) {
      events.push({
        date: order.paidDate,
        title: "РЎС‡РµС‚ РѕРїР»Р°С‡РµРЅ",
        meta: `${compactText(order.orderNumber || "Р—Р°РєР°Р·")} вЂў ${formatMoney(order.paidAmount || order.amount || 0)}`,
        tone: "success",
        moduleKey: "sales"
      });
    }
    if (order?.productionStart) {
      events.push({
        date: order.productionStart,
        title: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ Р·Р°РїСѓС‰РµРЅРѕ",
        meta: compactText(order.orderNumber || order.title || "Р—Р°РєР°Р·"),
        tone: "warning",
        moduleKey: "sales"
      });
    }
    if (order?.productionEnd) {
      events.push({
        date: order.productionEnd,
        title: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ Р·Р°РІРµСЂС€РµРЅРѕ",
        meta: compactText(order.orderNumber || order.title || "Р—Р°РєР°Р·"),
        tone: "success",
        moduleKey: "sales"
      });
    }
    if (order?.deliveryDate) {
      events.push({
        date: order.deliveryDate,
        title: "РџР»Р°РЅРѕРІР°СЏ РґР°С‚Р° РІС‹РґР°С‡Рё / РґРѕСЃС‚Р°РІРєРё",
        meta: compactText(order.orderNumber || order.title || "Р—Р°РєР°Р·"),
        tone: "info",
        moduleKey: "sales"
      });
    }

    (tasks || []).forEach((task) => {
      events.push({
        date: task.updatedAt || task.createdAt,
        title: "Р—Р°РґР°С‡Р° РїРѕ СЃРґРµР»РєРµ",
        meta: `${compactText(task.title || "Р—Р°РґР°С‡Р°")} вЂў ${getTaskStatusMeta(task.status).label} вЂў ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task.id
      });
    });

    (reservationRows || []).forEach((movement) => {
      events.push({
        date: movement.date || movement.createdAt,
        title: movement.kind === "release" ? "Р РµР·РµСЂРІ СЃРЅСЏС‚" : "РњР°С‚РµСЂРёР°Р» Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ",
        meta: `${formatNumber(movement.qty || 0)} вЂў ${compactText(movement.note || "РЎРєР»Р°РґСЃРєРѕР№ СЂРµР·РµСЂРІ")}`,
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
        label: "РћСЃС‚Р°С‚РѕРє",
        value: formatNumber(item?.available || 0),
        caption: `${formatNumber(item?.onHand || 0)} РЅР° СЂСѓРєР°С… вЂў ${formatNumber(item?.reserved || 0)} РІ СЂРµР·РµСЂРІРµ`,
        tone: item?.low ? "danger" : "success"
      },
      {
        label: "РЎРїСЂРѕСЃ",
        value: formatNumber(demandEntry?.qtyTotal || 0),
        caption: demandEntry?.tabsCount ? `${formatNumber(demandEntry.tabsCount)} РІРєР»Р°РґРѕРє РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ` : "СЃРїСЂРѕСЃ РїРѕРєР° РЅРµ РЅР°Р№РґРµРЅ",
        tone: demandEntry?.qtyTotal ? "accent" : "neutral"
      },
      {
        label: "РЎРґРµР»РєРё",
        value: formatNumber(deals.length),
        caption: deals.length ? "РјР°С‚РµСЂРёР°Р» СѓР¶Рµ СѓС‡Р°СЃС‚РІСѓРµС‚ РІ CRM-СЃРґРµР»РєР°С…" : "РїРѕРєР° РЅРµ РїСЂРёРІСЏР·Р°РЅ Рє СЃРґРµР»РєР°Рј",
        tone: deals.length ? "info" : "neutral"
      },
      {
        label: "Р—Р°РґР°С‡Рё",
        value: formatNumber(openTasks.length),
        caption: blockedTasks.length ? `${blockedTasks.length} СЃ Р±Р»РѕРєРµСЂРѕРј` : `${tasks.length} РІСЃРµРіРѕ`,
        tone: blockedTasks.length ? "danger" : openTasks.length ? "warning" : "neutral"
      },
      {
        label: "РњРёРЅРёРјСѓРј",
        value: formatNumber(item?.minStock || 0),
        caption: item?.low ? "РЅРёР¶Рµ Р±РµР·РѕРїР°СЃРЅРѕРіРѕ РѕСЃС‚Р°С‚РєР°" : "Р·Р°РїР°СЃ РІ РЅРѕСЂРјРµ",
        tone: item?.low ? "danger" : "success"
      }
    ];
  }

  function buildWarehouseItemTimeline(item, demandEntry, movements, linkedTasks, relatedDeals) {
    const events = [];
    if (item?.createdAt) {
      events.push({
        date: item.createdAt,
        title: "РџРѕР·РёС†РёСЏ Р·Р°РІРµРґРµРЅР°",
        meta: `${compactText(item.name || item.sku || "РњР°С‚РµСЂРёР°Р»")} вЂў СЃС‚Р°СЂС‚ ${formatNumber(item.openingStock || 0)}`,
        tone: "neutral"
      });
    }
    if (item?.updatedAt && compactText(item.updatedAt) !== compactText(item.createdAt)) {
      events.push({
        date: item.updatedAt,
        title: "РљР°СЂС‚РѕС‡РєР° РїРѕР·РёС†РёРё РѕР±РЅРѕРІР»РµРЅР°",
        meta: `${compactText(item.category || "Р±РµР· РєР°С‚РµРіРѕСЂРёРё")} вЂў РјРёРЅРёРјСѓРј ${formatNumber(item.minStock || 0)}`,
        tone: "neutral"
      });
    }
    if (demandEntry?.qtyTotal) {
      events.push({
        date: new Date().toISOString(),
        title: "РћР±РЅР°СЂСѓР¶РµРЅ СЃРїСЂРѕСЃ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ",
        meta: `${formatNumber(demandEntry.qtyTotal)} вЂў ${compactText((demandEntry.sources || []).join(", ") || "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂС‹")}`,
        tone: "accent"
      });
    }
    (movements || []).forEach((movement) => {
      const movementTitle =
        movement.kind === "in"
          ? "РџСЂРёС…РѕРґ РјР°С‚РµСЂРёР°Р»Р°"
          : movement.kind === "out"
            ? "РЎРїРёСЃР°РЅРёРµ РјР°С‚РµСЂРёР°Р»Р°"
            : movement.kind === "reserve"
              ? "РњР°С‚РµСЂРёР°Р» Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ"
              : "Р РµР·РµСЂРІ СЃРЅСЏС‚";
      events.push({
        date: movement.date || movement.createdAt,
        title: movementTitle,
        meta: `${formatNumber(movement.qty || 0)} вЂў ${compactText(movement.note || "Р‘РµР· РєРѕРјРјРµРЅС‚Р°СЂРёСЏ")}`,
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
        title: "Р—Р°РґР°С‡Р° РїРѕ РїРѕР·РёС†РёРё",
        meta: `${compactText(task.title || "Р—Р°РґР°С‡Р°")} вЂў ${getTaskStatusMeta(task.status).label} вЂў ${getPriorityLabel(task.priority)}`,
        tone: getTaskStatusMeta(task.status).tone,
        moduleKey: "tasks",
        entityId: task.id
      });
    });
    (relatedDeals || []).forEach((deal) => {
      events.push({
        date: deal.updatedAt || deal.createdAt || "",
        title: "РњР°С‚РµСЂРёР°Р» СѓС‡Р°СЃС‚РІСѓРµС‚ РІ СЃРґРµР»РєРµ",
        meta: `${compactText(deal.title || deal.client || "РЎРґРµР»РєР°")} вЂў ${getCrmStageMeta(deal.stage).label}`,
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
          ? { label: "РџСЂРёС…РѕРґ", tone: "success" }
          : movement.kind === "out"
            ? { label: "РЎРїРёСЃР°РЅРёРµ", tone: "warning" }
            : movement.kind === "reserve"
              ? { label: "Р РµР·РµСЂРІ", tone: "info" }
              : { label: "РЎРЅСЏС‚РёРµ СЂРµР·РµСЂРІР°", tone: "neutral" };
      const item = itemLookup.get(movement.itemId);
      entries.push({
        id: `movement:${movement.id}`,
        date: movement.date || movement.createdAt || "",
        family: "movement",
        label: meta.label,
        title: item?.name || item?.sku || "РЎРєР»Р°РґСЃРєР°СЏ РїРѕР·РёС†РёСЏ",
        meta: `${formatNumber(movement.qty || 0)} вЂў ${compactText(movement.note || "Р‘РµР· РєРѕРјРјРµРЅС‚Р°СЂРёСЏ")}`,
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
        label: "Р—Р°РєСѓРїРєР°",
        title: purchase.number || purchase.supplier || "Р—Р°РєСѓРїРєР°",
        meta: `${meta.label} вЂў ${purchase.supplier || "Р‘РµР· РїРѕСЃС‚Р°РІС‰РёРєР°"}`,
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
        title: entry.category || entry.counterparty || entry.account || "Р”РµРЅРµР¶РЅР°СЏ РѕРїРµСЂР°С†РёСЏ",
        meta: `${entry.account || "Р‘РµР· СЃС‡РµС‚Р°"} вЂў ${entry.counterparty || "Р‘РµР· РєРѕРЅС‚СЂР°РіРµРЅС‚Р°"}`,
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
        label: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ",
        title: job.title || job.itemLabel || "РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ",
        meta: `${meta.label} вЂў ${job.assignee || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ"}`,
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
        title: `Р”РѕР¶Р°С‚СЊ СЃРґРµР»РєСѓ: ${compactText(deal.title || deal.client || "Р±РµР· РЅР°Р·РІР°РЅРёСЏ")}`,
        owner: compactText(deal.owner),
        priority: "high",
        dueDate: deadline,
        note: `РџСЂРѕСЃСЂРѕС‡РµРЅРЅР°СЏ CRM-СЃРґРµР»РєР°. РљР»РёРµРЅС‚: ${compactText(deal.client || "РЅРµ СѓРєР°Р·Р°РЅ")}. РЎС‚Р°РґРёСЏ: ${getCrmStageMeta(deal.stage).label}.`,
        alreadyExists: taskSourceKeys.has(`crm-overdue:${deal.id}`)
      });
    });

    buildWarehouseSnapshot(warehouseDoc).lowItems.forEach((item) => {
      const sourceKey = `warehouse-low:${item.id}`;
      signals.push({
        sourceKey,
        family: "РЎРєР»Р°Рґ",
        title: `РџРѕРїРѕР»РЅРёС‚СЊ СЃРєР»Р°Рґ: ${compactText(item.name || item.sku || "РїРѕР·РёС†РёСЏ")}`,
        owner: "Р—Р°РєСѓРїРєРё",
        priority: "high",
        dueDate: today,
        note: `Р”РѕСЃС‚СѓРїРЅС‹Р№ РѕСЃС‚Р°С‚РѕРє ${formatNumber(item.available)} РЅРёР¶Рµ РјРёРЅРёРјСѓРјР° ${formatNumber(item.minStock || 0)}. SKU: ${compactText(item.sku || "вЂ”")}.`,
        alreadyExists: taskSourceKeys.has(sourceKey)
      });
    });

    buildSalesSnapshot(salesRecord).unpaidInvoices.slice(0, 20).forEach((order) => {
      const sourceKey = `sales-invoice:${order.sourceId}`;
      signals.push({
        sourceKey,
        family: "РџСЂРѕРґР°Р¶Рё",
        title: `РџСЂРѕРІРµСЂРёС‚СЊ РѕРїР»Р°С‚Сѓ СЃС‡РµС‚Р°: ${compactText(order.orderNumber || order.title || "Р·Р°РєР°Р·")}`,
        owner: compactText(order.manager),
        priority: "urgent",
        dueDate: order.invoiceDate || today,
        note: `РЎС‡РµС‚ РІС‹СЃС‚Р°РІР»РµРЅ ${formatDate(order.invoiceDate)}, РѕРїР»Р°С‚С‹ РїРѕРєР° РЅРµС‚. РљР»РёРµРЅС‚: ${compactText(order.client || "РЅРµ СѓРєР°Р·Р°РЅ")}.`,
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
          <div class="placeholder-eyebrow">Р–РёРІРѕР№ СЂР°Р±РѕС‡РёР№ РјРѕРґСѓР»СЊ</div>
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
    return `<div class="workspace-empty"><strong>${escapeHtml(modules[moduleKey]?.title || moduleKey)}</strong><div class="mt-2">Р”Р»СЏ СЌС‚РѕРіРѕ СЂР°Р·РґРµР»Р° Сѓ РІР°С€РµР№ СЂРѕР»Рё СЃРµР№С‡Р°СЃ С‚РѕР»СЊРєРѕ РїСЂРѕСЃРјРѕС‚СЂ. РђРЅР°Р»РёР·РёСЂРѕРІР°С‚СЊ РјРѕР¶РЅРѕ, СЂРµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РЅРµР»СЊР·СЏ.</div></div>`;
  }

  function renderRelatedLinks(moduleKey) {
    const config = LIVE_MODULE_CONFIG[moduleKey] || LIVE_MODULE_CONFIG[resolveLiveModuleKey(moduleKey)];
    const links = (config.links || [])
      .filter((key) => hasModuleAccess(key))
      .map((key) => `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="${escapeHtml(key)}">${escapeHtml(modules[key]?.title || key)}</button>`)
      .join("");
    return `<div class="workspace-links"><div class="compact-help">РЎРІСЏР·Р°РЅРЅС‹Рµ СЂР°Р·РґРµР»С‹ РїР»Р°С‚С„РѕСЂРјС‹</div><div class="d-flex flex-wrap gap-2">${links || '<span class="text-muted">РЎРІСЏР·Р°РЅРЅС‹Рµ СЂР°Р·РґРµР»С‹ РїРѕСЏРІСЏС‚СЃСЏ РїРѕСЃР»Рµ РІС‹РґР°С‡Рё РґРѕСЃС‚СѓРїРѕРІ.</span>'}</div></div>`;
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
      { label: "РўРѕРІР°СЂС‹", value: formatNumber(snapshot.products.length), caption: "РІ РїСЂРѕРґР°СЋС‰РµРј РєР°С‚Р°Р»РѕРіРµ" },
      { label: "Р—Р°РєСѓРїРєРё", value: formatNumber(snapshot.purchases.length), caption: `${formatMoney(snapshot.purchasesTotal)} РІ Р·Р°РєР°Р·Р°С…` },
      { label: "Р‘Р°Р»Р°РЅСЃ", value: formatMoney(snapshot.incomeTotal - snapshot.expenseTotal), caption: `${formatMoney(snapshot.incomeTotal)} РїСЂРёС…РѕРґ вЂў ${formatMoney(snapshot.expenseTotal)} СЂР°СЃС…РѕРґ` },
      { label: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ", value: formatNumber(snapshot.productionActive), caption: "Р°РєС‚РёРІРЅС‹С… Р·Р°РґР°РЅРёР№" },
      { label: "РЎРїСЂР°РІРѕС‡РЅРёРєРѕРІ", value: formatNumber(allLists.length), caption: "РѕР±С‰Р°СЏ Р±РёР±Р»РёРѕС‚РµРєР° СЃРїРёСЃРєРѕРІ" },
      { label: "Р—РЅР°С‡РµРЅРёР№", value: formatNumber(sumBy(allLists, (list) => (list.options || []).length)), caption: "РІСЃРµРіРѕ РІС‹РїР°РґР°СЋС‰РёС… Р·РЅР°С‡РµРЅРёР№" },
      { label: "РљР°РЅР°Р»С‹ CRM", value: formatNumber(getDirectoryOptions("crm_channels").length), caption: "РіРѕС‚РѕРІРѕ РґР»СЏ Р»РёРґРѕРІ Рё РїСЂРѕРґР°Р¶" },
      { label: "РЎРѕС‚СЂСѓРґРЅРёРєРё", value: formatNumber(getDirectoryOptions("team_members").length), caption: "РµРґРёРЅС‹Р№ СЃРїРёСЃРѕРє РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹С…" }
    ];
    const actionBar = renderActionBar(
      "directories",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-directory-new>РќРѕРІС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-directory-edit>РќР°СЃС‚СЂРѕРёС‚СЊ СЃРїРёСЃРѕРє</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-directory-option-new>Р”РѕР±Р°РІРёС‚СЊ Р·РЅР°С‡РµРЅРёРµ</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="directories">Р­РєСЃРїРѕСЂС‚ JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="directories">РРјРїРѕСЂС‚ JSON</button>' : ""
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
            <input class="form-control" type="search" placeholder="РџРѕРёСЃРє РїРѕ РЅР°Р·РІР°РЅРёСЋ, РєР»СЋС‡Сѓ РёР»Рё Р·РЅР°С‡РµРЅРёСЋ" value="${escapeHtml(filters.search)}" data-live-filter="search" />
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            <span class="workspace-note">РЎРїСЂР°РІРѕС‡РЅРёРєРё РїРѕРґРєР»СЋС‡Р°СЋС‚СЃСЏ Рє С„РѕСЂРјР°Рј CRM, РЎРєР»Р°РґР° Рё РўР°СЃРєС‚СЂРµРєРµСЂР° Р±РµР· РґРІРѕР№РЅРѕР№ РЅР°СЃС‚СЂРѕР№РєРё.</span>
          </div>
        </div>
        <div class="workspace-grid workspace-grid--3">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РљР°С‚Р°Р»РѕРі</h4><div class="compact-help">РЎРѕР·РґР°РІР°Р№С‚Рµ СЃРїРёСЃРєРё РѕРґРёРЅ СЂР°Р· Рё РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РёС… РІРѕ РІСЃРµР№ РїР»Р°С‚С„РѕСЂРјРµ.</div></div></div>
            <div class="workspace-stack">
              ${filteredLists.length
                ? filteredLists
                    .map(
                      (list) => `
                        <button class="workspace-list-item workspace-list-item--button ${selectedList?.key === list.key ? "workspace-list-item--active" : ""}" type="button" data-directory-select="${escapeHtml(list.key)}">
                          <div>
                            <strong>${escapeHtml(list.title)}</strong>
                            <div class="workspace-list-item__meta">${escapeHtml(list.key)} вЂў ${escapeHtml(list.description || "Р‘РµР· РѕРїРёСЃР°РЅРёСЏ")}</div>
                          </div>
                          <div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber((list.options || []).length))}</div></div>
                        </button>
                      `
                    )
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">РЎРїСЂР°РІРѕС‡РЅРёРєРё РїРѕРєР° РЅРµ РЅР°Р№РґРµРЅС‹.</div>'}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${selectedList ? "РќР°СЃС‚СЂРѕР№РєРё СЃРїРёСЃРєР°" : "РќРѕРІС‹Р№ СЃРїРёСЃРѕРє"}</h4><div class="compact-help">РљР»СЋС‡ Р»СѓС‡С€Рµ РЅРµ РјРµРЅСЏС‚СЊ С‡Р°СЃС‚Рѕ: РЅР° РЅРµРіРѕ РјРѕРіСѓС‚ СЃСЃС‹Р»Р°С‚СЊСЃСЏ РїРѕР»СЏ Рё РІС‹РїР°РґР°С€РєРё.</div></div></div>
            ${canEdit
              ? `${selectedList ? `<div class="workspace-stage-strip"><div class="workspace-stage-card"><span>РљР»СЋС‡</span><strong>${escapeHtml(selectedList.key || "вЂ”")}</strong></div><div class="workspace-stage-card"><span>Р—РЅР°С‡РµРЅРёР№</span><strong>${escapeHtml(formatNumber(selectedOptions.length))}</strong></div></div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-directory-edit>Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РІ РѕРєРЅРµ</button>${selectedList && canManage ? `<button class="btn btn-outline-danger" type="button" data-directory-delete="${escapeHtml(selectedList.key)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div>` : `<div class="workspace-empty workspace-empty--tight">РЎРѕР·РґР°Р№С‚Рµ РїРµСЂРІС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє С‡РµСЂРµР· РІСЃРїР»С‹РІР°СЋС‰РµРµ РѕРєРЅРѕ, С‡С‚РѕР±С‹ РЅРµ РїРµСЂРµРіСЂСѓР¶Р°С‚СЊ СЌС‚РѕС‚ СЌРєСЂР°РЅ РґР»РёРЅРЅРѕР№ С„РѕСЂРјРѕР№.</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-directory-new>РЎРѕР·РґР°С‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРє</button></div>`}<form id="directoriesListForm" class="workspace-form d-none">
                  <input type="hidden" name="id" value="${escapeHtml(selectedList?.id || "")}" />
                  <div class="workspace-form-grid">
                    <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="title" value="${escapeHtml(selectedList?.title || "")}" placeholder="РљР°РЅР°Р»С‹ CRM" required /></label>
                    <label><span>РљР»СЋС‡</span><input class="form-control" type="text" name="key" value="${escapeHtml(selectedList?.key || "")}" placeholder="crm_channels" required /></label>
                  </div>
                  <label><span>РћРїРёСЃР°РЅРёРµ</span><textarea class="form-control" name="description" rows="3" placeholder="Р”Р»СЏ С‡РµРіРѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ СЌС‚РѕС‚ СЃРїСЂР°РІРѕС‡РЅРёРє">${escapeHtml(selectedList?.description || "")}</textarea></label>
                  <div class="workspace-form__actions">
                    <button class="btn btn-dark" type="submit">${selectedList ? "РЎРѕС…СЂР°РЅРёС‚СЊ СЃРїРёСЃРѕРє" : "РЎРѕР·РґР°С‚СЊ СЃРїРёСЃРѕРє"}</button>
                    ${selectedList && canManage ? `<button class="btn btn-outline-danger" type="button" data-directory-delete="${escapeHtml(selectedList.key)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}
                  </div>
                </form>`
              : renderAccessHint("directories")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р—РЅР°С‡РµРЅРёСЏ</h4><div class="compact-help">Р—РЅР°С‡РµРЅРёСЏ СЃСЂР°Р·Сѓ РїРѕСЏРІСЏС‚СЃСЏ РІ РІР°С€РёС… РІС‹РїР°РґР°СЋС‰РёС… СЃРїРёСЃРєР°С… Рё РїРѕРґСЃРєР°Р·РєР°С….</div></div></div>
            ${selectedList
              ? `${canEdit
                  ? `<div class="workspace-card__actions"><button class="btn btn-dark" type="button" data-directory-option-new>Р”РѕР±Р°РІРёС‚СЊ Р·РЅР°С‡РµРЅРёРµ</button><span class="workspace-note">Р—РЅР°С‡РµРЅРёРµ РѕС‚РєСЂРѕРµС‚СЃСЏ РІ РѕС‚РґРµР»СЊРЅРѕР№ РєР°СЂС‚РѕС‡РєРµ Рё СЃСЂР°Р·Сѓ РїРѕРїР°РґС‘С‚ РІРѕ РІСЃРµ РІС‹РїР°РґР°СЋС‰РёРµ СЃРїРёСЃРєРё.</span></div><form id="directoriesOptionForm" class="workspace-form workspace-form--inline d-none">
                      <input type="hidden" name="key" value="${escapeHtml(selectedList.key)}" />
                      <label class="workspace-form__grow"><span>РќРѕРІРѕРµ Р·РЅР°С‡РµРЅРёРµ</span><input class="form-control" type="text" name="option" placeholder="Р”РѕР±Р°РІРёС‚СЊ Р·РЅР°С‡РµРЅРёРµ" required /></label>
                      <button class="btn btn-dark" type="submit">Р”РѕР±Р°РІРёС‚СЊ</button>
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
                                <div class="workspace-list-item__meta">РџРѕР·РёС†РёСЏ ${escapeHtml(String(index + 1))}</div>
                              </div>
                              ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-directory-option-delete="${escapeHtml(`${selectedList.key}:${option}`)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}
                            </div>
                          `
                        )
                        .join("")
                    : '<div class="workspace-empty workspace-empty--tight">Р’ СЌС‚РѕРј СЃРїРёСЃРєРµ РїРѕРєР° РЅРµС‚ Р·РЅР°С‡РµРЅРёР№.</div>'}
                </div>`
              : '<div class="workspace-empty workspace-empty--tight">Р’С‹Р±РµСЂРёС‚Рµ СЃРїСЂР°РІРѕС‡РЅРёРє СЃР»РµРІР° РёР»Рё СЃРѕР·РґР°Р№С‚Рµ РЅРѕРІС‹Р№.</div>'}
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
        ? `<div class="workspace-card__meta">РСЃС‚РѕС‡РЅРёРє: РџСЂРѕРґР°Р¶Рё вЂў Р·Р°РєР°Р· ${escapeHtml(compactText(deal?.integration?.orderNumber || "вЂ”"))}</div>`
        : "";
    return `
      <article class="workspace-card workspace-card--${escapeHtml(stage.tone)}">
        <div class="workspace-card__head">
          <strong>${escapeHtml(deal.title || "РЎРґРµР»РєР°")}</strong>
          <span>${escapeHtml(formatMoney(deal.amount || 0))}</span>
        </div>
        <div class="workspace-card__meta">${escapeHtml(deal.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")} вЂў ${escapeHtml(deal.channel || "РљР°РЅР°Р» РЅРµ СѓРєР°Р·Р°РЅ")}</div>
        <div class="workspace-card__meta">${escapeHtml(deal.owner || "РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№ РЅРµ РЅР°Р·РЅР°С‡РµРЅ")} вЂў СЃСЂРѕРє ${escapeHtml(formatDate(deal.deadline))}</div>
        ${reservation?.qty ? `<div class="workspace-card__meta">РњР°С‚РµСЂРёР°Р»РѕРІ РІ СЂРµР·РµСЂРІРµ: ${escapeHtml(formatNumber(reservation.qty))}</div>` : ""}
        ${integrationMeta}
        ${deal.note ? `<div class="workspace-card__note">${escapeHtml(deal.note)}</div>` : ""}
        ${renderCustomCardSection("crm", doc, deal, escapeHtml)}
        <div class="workspace-card__footer">
          ${canEdit ? `<select class="form-select form-select-sm workspace-inline-select" data-crm-stage-select="${escapeHtml(deal.id)}">${CRM_STAGES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === deal.stage ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>` : `<span class="workspace-tag workspace-tag--${escapeHtml(stage.tone)}">${escapeHtml(stage.label)}</span>`}
          <div class="workspace-card__actions">
            ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(deal.id)}">РљРѕРїРёСЏ</button>` : ""}
            ${canEdit ? `<button class="btn btn-sm btn-outline-secondary" type="button" data-crm-task-from-deal="${escapeHtml(deal.id)}">Р—Р°РґР°С‡Р°</button>` : ""}
            ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-crm-delete="${escapeHtml(deal.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}
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
      { label: "РђРєС‚РёРІРЅС‹Рµ СЃРґРµР»РєРё", value: formatNumber(openDeals.length), caption: "Р±РµР· Р·Р°РєСЂС‹С‚С‹С… Рё РїРѕС‚РµСЂСЏРЅРЅС‹С…" },
      { label: "РЎСѓРјРјР° РІ РІРѕСЂРѕРЅРєРµ", value: formatMoney(sumBy(openDeals, (deal) => deal.amount || 0)), caption: "РїРѕ С‚РµРєСѓС‰РёРј СЃС‚Р°РґРёСЏРј" },
      { label: "Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµ", value: formatNumber((doc.deals || []).filter((deal) => deal.stage === "production").length), caption: "РіРѕС‚РѕРІС‹ Рє РёСЃРїРѕР»РЅРµРЅРёСЋ" },
      { label: "РџСЂРѕСЃСЂРѕС‡РµРЅРѕ", value: formatNumber(overdueCount), caption: "С‚СЂРµР±СѓСЋС‚ РІРЅРёРјР°РЅРёСЏ" },
      { label: "РР· РџСЂРѕРґР°Р¶", value: formatNumber(salesImportable.length), caption: "РјРѕР¶РЅРѕ Р·Р°Р±СЂР°С‚СЊ РІ CRM" },
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
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-crm-new>РќРѕРІР°СЏ СЃРґРµР»РєР°</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-crm-import-sales>Р—Р°Р±СЂР°С‚СЊ РёР· РџСЂРѕРґР°Р¶</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-crm-reserve-open>Р РµР·РµСЂРІ РїРѕРґ СЃРґРµР»РєСѓ</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="board">Р’РѕСЂРѕРЅРєР°</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="table">РўР°Р±Р»РёС†Р°</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="crm">Р­РєСЃРїРѕСЂС‚ JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="crm">РРјРїРѕСЂС‚ JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="crm:deal">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );
    const dealTableRows =
      filtered.length > 0
        ? filtered
            .map((deal) => {
              const stage = getCrmStageMeta(deal.stage);
              const reservation = reservationMap.get(getCrmDealSourceKey(deal.id));
              return `<tr><td><strong>${escapeHtml(deal.title || "РЎРґРµР»РєР°")}</strong>${reservation?.qty ? `<div class="workspace-table__sub">Р РµР·РµСЂРІ: ${escapeHtml(formatNumber(reservation.qty))}</div>` : ""}</td><td>${escapeHtml(deal.client || "вЂ”")}</td><td>${escapeHtml(stage.label)}</td><td>${escapeHtml(deal.owner || "вЂ”")}</td><td>${escapeHtml(deal.channel || "вЂ”")}</td><td>${escapeHtml(formatMoney(deal.amount || 0))}</td><td>${escapeHtml(formatDate(deal.deadline))}</td>${renderCustomTableCells("crm", doc, deal, escapeHtml)}<td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">РћС‚РєСЂС‹С‚СЊ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(deal.id)}">РљРѕРїРёСЏ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-crm-task-from-deal="${escapeHtml(deal.id)}">Р—Р°РґР°С‡Р°</button>` : ""}</div></td></tr>`;
            })
            .join("")
        : `<tr><td colspan="${8 + getVisibleCustomFields("crm", doc, "showInTable").length}" class="text-muted">РџРѕ С‚РµРєСѓС‰РёРј С„РёР»СЊС‚СЂР°Рј СЃРґРµР»РѕРє РЅРµС‚.</td></tr>`;

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("crm")}
        ${renderMetricGrid(metrics)}
        <section class="workspace-panel workspace-panel--muted">
          <div class="panel-heading"><div><h4>РњРѕСЃС‚ СЃ РџСЂРѕРґР°Р¶Р°РјРё</h4><div class="compact-help">РџР»Р°С‚С„РѕСЂРјР° РІРёРґРёС‚ Р¶РёРІС‹Рµ Р·Р°РєР°Р·С‹ РёР· СЂР°Р·РґРµР»Р° РџСЂРѕРґР°Р¶Рё Рё РјРѕР¶РµС‚ Р·Р°Р±СЂР°С‚СЊ РёС… РІ CRM Р±РµР· РґРІРѕР№РЅРѕРіРѕ РІРІРѕРґР°.</div></div><div class="workspace-note">РћР±РЅРѕРІР»РµРЅРѕ: ${escapeHtml(formatDate(salesSnapshot.updatedAt))}</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Р—Р°РєР°Р·РѕРІ РІ РџСЂРѕРґР°Р¶Р°С…</span><strong>${escapeHtml(formatNumber(salesSnapshot.orders.length))}</strong></div>
            <div class="workspace-stage-card"><span>РЎС‡РµС‚Р° Р±РµР· РѕРїР»Р°С‚С‹</span><strong>${escapeHtml(formatNumber(salesSnapshot.unpaidInvoices.length))}</strong></div>
            <div class="workspace-stage-card"><span>Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµ</span><strong>${escapeHtml(formatNumber(salesSnapshot.productionOrders.length))}</strong></div>
            <div class="workspace-stage-card"><span>РќРµ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ</span><strong>${escapeHtml(formatNumber(salesImportable.length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(salesImportable.slice(0, 6) || []).map((order) => `<div class="workspace-list-item"><div><strong>${escapeHtml(order.orderNumber || order.title || "Р—Р°РєР°Р·")}</strong><div class="workspace-list-item__meta">${escapeHtml(order.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")} вЂў ${escapeHtml(order.leadChannel || order.salesChannel || "Р‘РµР· РєР°РЅР°Р»Р°")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(order.amount || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(order.manager || "Р‘РµР· РјРµРЅРµРґР¶РµСЂР°")}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РќРѕРІС‹С… Р·Р°РєР°Р·РѕРІ РёР· РџСЂРѕРґР°Р¶ РґР»СЏ РёРјРїРѕСЂС‚Р° РїРѕРєР° РЅРµС‚.</div>'}
          </div>
        </section>
        ${renderViewTabs("crm", doc, ui.crm, escapeHtml)}
        ${buildModeTabs("crm", escapeHtml)}
        ${actionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="РџРѕРёСЃРє РїРѕ РєР»РёРµРЅС‚Сѓ, РєР°РЅР°Р»Сѓ, РЅР°Р·РІР°РЅРёСЋ" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="stage"><option value="all">Р’СЃРµ СЃС‚Р°РґРёРё</option>${CRM_STAGES.map((stage) => `<option value="${escapeHtml(stage.key)}" ${filters.stage === stage.key ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="owner"><option value="all">Р’СЃРµ РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рµ</option>${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-live-mode="form">РљР°СЂС‚РѕС‡РєР°</button>` : `<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>`}
            <button class="btn btn-outline-dark" type="button" data-live-filters-reset="crm">РЎР±СЂРѕСЃРёС‚СЊ С„РёР»СЊС‚СЂС‹</button>
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="crm">${ui.crm.configOpen ? "РЎРєСЂС‹С‚СЊ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ" : "РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel("crm", doc, ui.crm, escapeHtml) : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editDeal ? "РљР°СЂС‚РѕС‡РєР° СЃРґРµР»РєРё" : "РќРѕРІР°СЏ СЃРґРµР»РєР°"}</h4><div class="compact-help">РљР°СЂС‚РѕС‡РєР° СЃС‚СЂРѕРёС‚СЃСЏ РїРѕРґ РІР°С€ С†РёРєР»: Р»РёРґ в†’ РєРІР°Р»РёС„РёРєР°С†РёСЏ в†’ РљРџ/СЃС‡РµС‚ в†’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ в†’ Р·Р°РєСЂС‹С‚РёРµ.</div></div></div>
            ${canEdit ? `${renderDraftBadge("crm", "deal")}<div class="workspace-empty workspace-empty--tight">${editDeal ? "РЎРґРµР»РєР° СѓР¶Рµ РІС‹Р±СЂР°РЅР° Рё РѕС‚РєСЂС‹С‚Р° РІ С„РѕРєСѓСЃРµ СЃРїСЂР°РІР°. Р”Р»СЏ СЂРµРґР°РєС‚РёСЂРѕРІР°РЅРёСЏ РёСЃРїРѕР»СЊР·СѓР№С‚Рµ РІСЃРїР»С‹РІР°СЋС‰СѓСЋ РєР°СЂС‚РѕС‡РєСѓ, С‡С‚РѕР±С‹ РЅРµ РїРµСЂРµРіСЂСѓР¶Р°С‚СЊ СЌРєСЂР°РЅ." : "РЎРѕР·РґР°РІР°Р№С‚Рµ СЃРґРµР»РєРё С‡РµСЂРµР· РІСЃРїР»С‹РІР°СЋС‰СѓСЋ РєР°СЂС‚РѕС‡РєСѓ. РўР°Рє РѕР±Р·РѕСЂ РѕСЃС‚Р°С‘С‚СЃСЏ С‡РёСЃС‚С‹Рј, Р° СЃР°РјР° С„РѕСЂРјР° РЅРµ Р»РѕРјР°РµС‚ СЂРёС‚Рј СЂР°Р±РѕС‚С‹."}</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-crm-new>${editDeal ? "РќРѕРІР°СЏ СЃРґРµР»РєР°" : "РЎРѕР·РґР°С‚СЊ СЃРґРµР»РєСѓ"}</button>${editDeal ? `<button class="btn btn-outline-dark" type="button" data-crm-edit="${escapeHtml(editDeal.id)}">Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ РІ РѕРєРЅРµ</button><button class="btn btn-outline-secondary" type="button" data-crm-duplicate="${escapeHtml(editDeal.id)}">РЎРґРµР»Р°С‚СЊ РєРѕРїРёСЋ</button>` : ""}</div>${editDeal ? `<div class="workspace-stage-strip mt-3"><div class="workspace-stage-card"><span>РљР»РёРµРЅС‚</span><strong>${escapeHtml(editDeal.client || "вЂ”")}</strong></div><div class="workspace-stage-card"><span>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</span><strong>${escapeHtml(editDeal.owner || "вЂ”")}</strong></div><div class="workspace-stage-card"><span>РЎСЂРѕРє</span><strong>${escapeHtml(formatDate(editDeal.deadline))}</strong></div></div>` : ""}` : renderAccessHint("crm")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editDeal ? "РЎРІСЏР·Р°РЅРЅС‹Р№ РєРѕРЅС‚СѓСЂ СЃРґРµР»РєРё" : "Р¤РѕРєСѓСЃ РЅРµРґРµР»Рё"}</h4><div class="compact-help">${editDeal ? "РСЃС‚РѕС‡РЅРёРє, Р·Р°РґР°С‡Рё Рё СЂРµР·РµСЂРІ РјР°С‚РµСЂРёР°Р»РѕРІ СЃРѕР±СЂР°РЅС‹ СЂСЏРґРѕРј СЃ РєР°СЂС‚РѕС‡РєРѕР№, С‡С‚РѕР±С‹ РїРѕ СЃРґРµР»РєРµ РЅРµ РїСЂРёС…РѕРґРёР»РѕСЃСЊ Р±РµРіР°С‚СЊ РїРѕ РјРѕРґСѓР»СЏРј." : "Р‘С‹СЃС‚СЂС‹Р№ СЃСЂРµР· РїРѕ С‚РµРј СЃРґРµР»РєР°Рј, РєРѕС‚РѕСЂС‹Рј РїСЂСЏРјРѕ СЃРµР№С‡Р°СЃ РЅСѓР¶РµРЅ РєРѕРЅС‚СЂРѕР»СЊ."}</div></div></div>
            ${editDeal ? `<div class="workspace-stage-strip"><div class="workspace-stage-card"><span>РЎС‚Р°РґРёСЏ</span><strong>${escapeHtml(getCrmStageMeta(editDeal.stage).label)}</strong></div><div class="workspace-stage-card"><span>РЎРІСЏР·Р°РЅРЅС‹С… Р·Р°РґР°С‡</span><strong>${escapeHtml(formatNumber(editDealTasks.length))}</strong></div><div class="workspace-stage-card"><span>Р’ СЂРµР·РµСЂРІРµ</span><strong>${escapeHtml(formatNumber(editDealReservation.qty || 0))}</strong></div><div class="workspace-stage-card"><span>РЎСѓРјРјР° СЃРґРµР»РєРё</span><strong>${escapeHtml(formatMoney(editDeal.amount || 0))}</strong></div></div>
            <div class="workspace-stack mt-3">
              ${editDealSourceOrder ? `<div><div class="panel-heading panel-heading--compact"><div><h4>РСЃС‚РѕС‡РЅРёРє РёР· РџСЂРѕРґР°Р¶</h4><div class="compact-help">РЎРІСЏР·Р°РЅРЅС‹Р№ Р·Р°РєР°Р·, РёР· РєРѕС‚РѕСЂРѕРіРѕ РїСЂРёС€Р»Р° РёР»Рё СЃ РєРѕС‚РѕСЂС‹Рј СЃРёРЅС…СЂРѕРЅРёР·РёСЂРѕРІР°РЅР° СЌС‚Р° СЃРґРµР»РєР°.</div></div></div><div class="workspace-list-item"><div><strong>${escapeHtml(editDealSourceOrder.orderNumber || editDealSourceOrder.title || "Р—Р°РєР°Р·")}</strong><div class="workspace-list-item__meta">${escapeHtml(editDealSourceOrder.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")} вЂў ${escapeHtml(editDealSourceOrder.manager || "Р‘РµР· РјРµРЅРµРґР¶РµСЂР°")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(editDealSourceOrder.amount || 0))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ РџСЂРѕРґР°Р¶Рё</button></div></div></div></div>` : ""}
              <div><div class="panel-heading panel-heading--compact"><div><h4>РЎРІСЏР·Р°РЅРЅС‹Рµ Р·Р°РґР°С‡Рё</h4><div class="compact-help">Р—Р°РґР°С‡Рё, Р·Р°РІРµРґРµРЅРЅС‹Рµ РёР· СЌС‚РѕР№ СЃРґРµР»РєРё РёР»Рё СЂР°Р±РѕС‚Р°СЋС‰РёРµ РїРѕ РЅРµР№.</div></div></div><div class="workspace-stack">${editDealTasks.length ? editDealTasks.slice(0, 5).map((task) => `<div class="workspace-list-item"><div><strong>${escapeHtml(task.title || "Р—Р°РґР°С‡Р°")}</strong><div class="workspace-list-item__meta">${escapeHtml(task.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")} вЂў ${escapeHtml(getTaskStatusMeta(task.status).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(task.status).tone)}">${escapeHtml(getPriorityLabel(task.priority))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(task.id)}">РћС‚РєСЂС‹С‚СЊ Р·Р°РґР°С‡Сѓ</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">РЎРІСЏР·Р°РЅРЅС‹С… Р·Р°РґР°С‡ РїРѕРєР° РЅРµС‚.</div>'}</div></div>
              <div><div class="panel-heading panel-heading--compact"><div><h4>РњР°С‚РµСЂРёР°Р»С‹ РІ СЂРµР·РµСЂРІРµ</h4><div class="compact-help">Р’СЃРµ СЂРµР·РµСЂРІС‹ РїРѕРґ СЌС‚Сѓ СЃРґРµР»РєСѓ РїРѕРґС‚СЏРіРёРІР°СЋС‚СЃСЏ РёР· СЃРєР»Р°РґСЃРєРѕРіРѕ РјРѕРґСѓР»СЏ.</div></div></div><div class="workspace-stack">${editDealReservation.rows.length ? sortByDateDesc(editDealReservation.rows, "date").slice(0, 5).map((movement) => { const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); const movementLabel = movement.kind === "release" ? "СЃРЅСЏС‚РёРµ СЂРµР·РµСЂРІР°" : "СЂРµР·РµСЂРІ"; return `<div class="workspace-list-item"><div><strong>${escapeHtml(item?.name || "РџРѕР·РёС†РёСЏ")}</strong><div class="workspace-list-item__meta">${escapeHtml(movementLabel)} вЂў ${escapeHtml(formatDate(movement.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div>${movement.itemId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(movement.itemId)}">РћС‚РєСЂС‹С‚СЊ РїРѕР·РёС†РёСЋ</button></div>` : ""}</div></div>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Р РµР·РµСЂРІРѕРІ РїРѕ СЌС‚РѕР№ СЃРґРµР»РєРµ РїРѕРєР° РЅРµС‚.</div>'}</div></div>
            </div>` : `<div class="workspace-stage-strip">${stageSummary}</div>
            <div class="workspace-stack">${(sortByDateDesc(openDeals, "deadline").slice(0, 6) || []).map((deal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(deal.title || "РЎРґРµР»РєР°")}</strong><div class="workspace-list-item__meta">${escapeHtml(deal.client || "вЂ”")} вЂў ${escapeHtml(deal.owner || "вЂ”")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getCrmStageMeta(deal.stage).tone)}">${escapeHtml(getCrmStageMeta(deal.stage).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(deal.deadline))}</div></div></div>`).join("") || '<div class="workspace-empty">РђРєС‚РёРІРЅС‹С… СЃРґРµР»РѕРє РїРѕРєР° РЅРµС‚.</div>'}</div>`}
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р РµР·РµСЂРІ РјР°С‚РµСЂРёР°Р»РѕРІ РїРѕРґ СЃРґРµР»РєСѓ</h4><div class="compact-help">РњРѕР¶РЅРѕ СЃСЂР°Р·Сѓ РїСЂРёРІСЏР·Р°С‚СЊ СЂРµР·РµСЂРІ СЃРєР»Р°РґР° Рє РєРѕРЅРєСЂРµС‚РЅРѕР№ CRM-СЃРґРµР»РєРµ, С‡С‚РѕР±С‹ Р·Р°РґР°С‡Р° Рё РјР°С‚РµСЂРёР°Р» РЅРµ Р¶РёР»Рё РѕС‚РґРµР»СЊРЅРѕ.</div></div></div>
            ${canEdit ? `<div class="workspace-empty workspace-empty--tight">Р РµР·РµСЂРІ РјР°С‚РµСЂРёР°Р»РѕРІ С‚РµРїРµСЂСЊ РѕС‚РєСЂС‹РІР°РµС‚СЃСЏ РѕС‚РґРµР»СЊРЅРѕР№ РІСЃРїР»С‹РІР°СЋС‰РµР№ РєР°СЂС‚РѕС‡РєРѕР№: РјРµРЅСЊС€Рµ РІРёР·СѓР°Р»СЊРЅРѕРіРѕ С€СѓРјР° Рё СѓРґРѕР±РЅРµРµ СЂР°Р±РѕС‚Р°С‚СЊ РЅР° РЅРѕСѓС‚Р±СѓРєРµ.</div><div class="workspace-card__actions mt-3"><button class="btn btn-dark" type="button" data-crm-reserve-open>РћС‚РєСЂС‹С‚СЊ СЂРµР·РµСЂРІ</button>${editDeal ? `<button class="btn btn-outline-dark" type="button" data-crm-reserve-open>Р РµР·РµСЂРІ РїРѕРґ РІС‹Р±СЂР°РЅРЅСѓСЋ СЃРґРµР»РєСѓ</button>` : ""}</div>` : renderAccessHint("crm")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РЎРІСЏР·Р°РЅРЅС‹Рµ СЂРµР·РµСЂРІС‹</h4><div class="compact-help">РџРѕСЃР»РµРґРЅРёРµ СЂРµР·РµСЂРІС‹ РјР°С‚РµСЂРёР°Р»РѕРІ, РєРѕС‚РѕСЂС‹Рµ СѓР¶Рµ СЃРІСЏР·Р°РЅС‹ СЃРѕ СЃРґРµР»РєР°РјРё CRM.</div></div></div>
            <div class="workspace-stack">${(sortByDateDesc((warehouseDoc.movements || []).filter((movement) => compactText(movement?.integration?.sourceKey || "").startsWith("crm-deal:")), "date").slice(0, 6) || []).map((movement) => { const deal = (doc.deals || []).find((entry) => getCrmDealSourceKey(entry.id) === compactText(movement?.integration?.sourceKey || "")); const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); return `<div class="workspace-list-item"><div><strong>${escapeHtml(deal?.title || "РЎРґРµР»РєР°")}</strong><div class="workspace-list-item__meta">${escapeHtml(item?.name || "РџРѕР·РёС†РёСЏ")} вЂў ${escapeHtml(movement.kind === "release" ? "СЃРЅСЏС‚РёРµ СЂРµР·РµСЂРІР°" : "СЂРµР·РµСЂРІ")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(movement.date))}</div></div></div>`; }).join("") || '<div class="workspace-empty workspace-empty--tight">РЎРІСЏР·Р°РЅРЅС‹С… СЂРµР·РµСЂРІРѕРІ РїРѕРєР° РЅРµС‚.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "form") && editDeal ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РћРїРµСЂР°С†РёРѕРЅРЅС‹Р№ СЃС‚Р°С‚СѓСЃ СЃРґРµР»РєРё</h4><div class="compact-help">Р—РґРµСЃСЊ РІРёРґРЅРѕ, РіРґРµ СЃРґРµР»РєР° СЃРµР№С‡Р°СЃ СѓРїРёСЂР°РµС‚СЃСЏ: РІ СЃС‡РµС‚, РѕРїР»Р°С‚Сѓ, Р·Р°РґР°С‡Рё, РјР°С‚РµСЂРёР°Р»С‹ РёР»Рё СЃСЂРѕРєРё.</div></div></div>
            <div class="workspace-stage-strip">${editDealOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-task-from-deal="${escapeHtml(editDeal.id)}">${editDealTasks.length ? "РћС‚РєСЂС‹С‚СЊ Р·Р°РґР°С‡Сѓ" : "РЎРѕР·РґР°С‚СЊ Р·Р°РґР°С‡Сѓ"}</button>` : ""}
              ${editDealSourceOrder ? `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ РІ РџСЂРѕРґР°Р¶Р°С…</button>` : ""}
              ${editDealReservation.rows?.[0]?.itemId ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(editDealReservation.rows[0].itemId)}">РћС‚РєСЂС‹С‚СЊ РјР°С‚РµСЂРёР°Р»</button>` : ""}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р›РµРЅС‚Р° СЃРґРµР»РєРё</h4><div class="compact-help">РСЃС‚РѕСЂРёСЏ СЃРѕР±РёСЂР°РµС‚СЃСЏ РёР· CRM, РџСЂРѕРґР°Р¶, Р—Р°РґР°С‡ Рё СЃРєР»Р°РґСЃРєРёС… СЂРµР·РµСЂРІРѕРІ.</div></div><div class="workspace-note">РЎРѕР±С‹С‚РёР№: ${escapeHtml(formatNumber(editDealTimeline.length))}</div></div>
            <div class="workspace-stack">${editDealTimeline.slice(0, 10).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Р‘РµР· РґРµС‚Р°Р»РµР№")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">РћС‚РєСЂС‹С‚СЊ</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РЎРѕР±С‹С‚РёР№ РїРѕ СЃРґРµР»РєРµ РїРѕРєР° РЅРµС‚.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "board") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Р’РѕСЂРѕРЅРєР° СЃРґРµР»РѕРє</h4><div class="compact-help">РљР°СЂС‚РѕС‡РєРё РјРѕР¶РЅРѕ Р±С‹СЃС‚СЂРѕ РїРµСЂРµРІРѕРґРёС‚СЊ РјРµР¶РґСѓ СЃС‚Р°РґРёСЏРјРё РїСЂСЏРјРѕ РёР· СЃРїРёСЃРєР°.</div></div><div class="workspace-note">РџРѕРєР°Р·Р°РЅРѕ: ${escapeHtml(String(filtered.length))}</div></div>
          <div class="workspace-board workspace-board--crm">${CRM_STAGES.map((stage) => { const stageDeals = filtered.filter((deal) => deal.stage === stage.key); return `<article class="workspace-lane"><div class="workspace-lane__head"><strong>${escapeHtml(stage.label)}</strong><span>${escapeHtml(String(stageDeals.length))}</span></div><div class="workspace-lane__body">${stageDeals.map((deal) => renderCrmCard(doc, deal, canEdit, canManage)).join("") || '<div class="workspace-empty workspace-empty--tight">РџСѓСЃС‚Рѕ</div>'}</div></article>`; }).join("")}</div>
        </section>` : ""}
        ${modeIs(filters, "table") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>РЎРїРёСЃРѕРє СЃРґРµР»РѕРє</h4><div class="compact-help">РќРёР¶РЅСЏСЏ С‚Р°Р±Р»РёС†Р° СѓРґРѕР±РЅР° РґР»СЏ РїРѕРёСЃРєР° Рё Р±С‹СЃС‚СЂРѕРіРѕ РїРµСЂРµС…РѕРґР° Рє РЅСѓР¶РЅРѕР№ РєР°СЂС‚РѕС‡РєРµ.</div></div></div>
          <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>РЎРґРµР»РєР°</th><th>РљР»РёРµРЅС‚</th><th>РЎС‚Р°РґРёСЏ</th><th>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</th><th>РљР°РЅР°Р»</th><th>РЎСѓРјРјР°</th><th>РЎСЂРѕРє</th>${customHeader}<th></th></tr></thead><tbody>${dealTableRows}</tbody></table></div>
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
      { value: "movement", label: "Р”РІРёР¶РµРЅРёСЏ" },
      { value: "purchase", label: "Р—Р°РєСѓРїРєРё" },
      { value: "finance", label: "Р”РµРЅСЊРіРё" },
      { value: "production", label: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ" }
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
          placeholder: "РџРѕРёСЃРє РїРѕ РёСЃС‚РѕСЂРёРё, РєРѕРјРјРµРЅС‚Р°СЂРёСЋ, СЃС‡РµС‚Сѓ, Р·Р°РєСѓРїРєРµ РёР»Рё РґРІРёР¶РµРЅРёСЋ",
          allLabel: "Р’СЃРµ СЃРѕР±С‹С‚РёСЏ",
          options: historyTypeOptions,
          primaryButtons: '<button class="btn btn-outline-dark" type="button" data-live-mode="overview">Рљ РѕР±Р·РѕСЂСѓ</button><button class="btn btn-outline-dark" type="button" data-live-mode="movements">Р”РІРёР¶РµРЅРёСЏ</button>'
        };
      }
      if (moduleKey === "products") {
        return {
          placeholder: "РџРѕРёСЃРє РїРѕ С‚РѕРІР°СЂСѓ, РіСЂСѓРїРїРµ, РїРѕСЃС‚Р°РІС‰РёРєСѓ",
          allLabel: "Р’СЃРµ РіСЂСѓРїРїС‹",
          options: productGroups,
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-product-new>РќРѕРІС‹Р№ С‚РѕРІР°СЂ</button><button class="btn btn-outline-dark" type="button" data-live-mode="catalog">РћС‚РєСЂС‹С‚СЊ РѕСЃС‚Р°С‚РєРё</button>'
            : '<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>'
        };
      }
      if (moduleKey === "purchases") {
        return {
          placeholder: "РџРѕРёСЃРє РїРѕ РЅРѕРјРµСЂСѓ, РїРѕСЃС‚Р°РІС‰РёРєСѓ, СЃС‚Р°С‚СѓСЃСѓ",
          allLabel: "Р’СЃРµ СЃС‚Р°С‚СѓСЃС‹",
          options: WAREHOUSE_PURCHASE_STATUSES.map((status) => ({ value: status.key, label: status.label })),
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-purchase-new>РќРѕРІР°СЏ Р·Р°РєСѓРїРєР°</button><button class="btn btn-outline-dark" type="button" data-live-mode="products">РўРѕРІР°СЂС‹</button>'
            : '<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>'
        };
      }
      if (moduleKey === "money") {
        return {
          placeholder: "РџРѕРёСЃРє РїРѕ СЃС‡РµС‚Сѓ, СЃС‚Р°С‚СЊРµ, РєРѕРЅС‚СЂР°РіРµРЅС‚Сѓ",
          allLabel: "Р’СЃРµ СЃС‡РµС‚Р°",
          options: financeAccounts,
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-finance-new>РќРѕРІР°СЏ РѕРїРµСЂР°С†РёСЏ</button><button class="btn btn-outline-dark" type="button" data-live-mode="purchases">Р—Р°РєСѓРїРєРё</button>'
            : '<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>'
        };
      }
      if (moduleKey === "production") {
        return {
          placeholder: "РџРѕРёСЃРє РїРѕ Р·Р°РґР°РЅРёСЋ, СЌС‚Р°РїСѓ, РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРјСѓ",
          allLabel: "Р’СЃРµ СЌС‚Р°РїС‹",
          options: PRODUCTION_JOB_STATUSES.map((status) => ({ value: status.key, label: status.label })),
          primaryButtons: canEdit
            ? '<button class="btn btn-dark" type="button" data-warehouse-production-new>Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</button><button class="btn btn-outline-dark" type="button" data-live-mode="products">РўРѕРІР°СЂС‹</button>'
            : '<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>'
        };
      }
      return {
        placeholder: "РџРѕРёСЃРє РїРѕ РїРѕР·РёС†РёРё, SKU, РєР°С‚РµРіРѕСЂРёРё",
        allLabel: "Р’СЃРµ РєР°С‚РµРіРѕСЂРёРё",
        options: categories,
        primaryButtons: canEdit
          ? '<button class="btn btn-dark" type="button" data-warehouse-item-new>РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ</button><button class="btn btn-outline-dark" type="button" data-warehouse-movement-pick="">РќРѕРІРѕРµ РґРІРёР¶РµРЅРёРµ</button>'
          : '<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>'
      };
    })();
    const metrics = (() => {
      if (moduleKey === "products") {
        return [
          { label: "РўРѕРІР°СЂРѕРІ", value: formatNumber(snapshot.products.length), caption: "РІ РїСЂРѕРґР°СЋС‰РµРј РєР°С‚Р°Р»РѕРіРµ" },
          { label: "Р“СЂСѓРїРї", value: formatNumber(productGroups.length), caption: "С‚РѕРІР°СЂРЅС‹Рµ РЅР°РїСЂР°РІР»РµРЅРёСЏ" },
          { label: "РџРѕСЃС‚Р°РІС‰РёРєРѕРІ", value: formatNumber(new Set((doc.products || []).map((item) => compactText(item.supplier)).filter(Boolean)).size), caption: "Р°РєС‚РёРІРЅС‹Рµ РєРѕРЅС‚СЂР°РіРµРЅС‚С‹" },
          { label: "РЎСЂРµРґРЅСЏСЏ Р·Р°РєСѓРїРєР°", value: formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.purchasePrice || 0) / filteredProducts.length : 0), caption: "РїРѕ С‚РµРєСѓС‰РµР№ РІС‹Р±РѕСЂРєРµ" },
          { label: "РЎСЂРµРґРЅСЏСЏ РїСЂРѕРґР°Р¶Р°", value: formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.salePrice || 0) / filteredProducts.length : 0), caption: "РїРѕ С‚РµРєСѓС‰РµР№ РІС‹Р±РѕСЂРєРµ" },
          { label: "РњР°СЂР¶Р°", value: formatMoney(sumBy(filteredProducts, (item) => (item.salePrice || 0) - (item.purchasePrice || 0))), caption: "РІР°Р»РѕРІР°СЏ РїРѕ РІС‹Р±РѕСЂРєРµ" }
        ];
      }
      if (moduleKey === "purchases") {
        return [
          { label: "Р—Р°РєСѓРїРѕРє", value: formatNumber(snapshot.purchases.length), caption: "РІСЃРµРіРѕ РІ РєРѕРЅС‚СѓСЂРµ" },
          { label: "Р’ РѕР±РѕСЂРѕС‚Рµ", value: formatMoney(snapshot.purchasesTotal || 0), caption: "РѕР±С‰Р°СЏ СЃСѓРјРјР° Р·Р°РєР°Р·РѕРІ" },
          { label: "РџСЂРёРЅСЏС‚Рѕ", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "received").length), caption: "СѓР¶Рµ РЅР° СЃРєР»Р°РґРµ" },
          { label: "Р’ РїСѓС‚Рё", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "in_transit").length), caption: "РµС‰Рµ РЅРµ РїРѕСЃС‚СѓРїРёР»Рё" },
          { label: "Р§РµСЂРЅРѕРІРёРєРё", value: formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === "draft").length), caption: "РЅРµ РѕС‚РїСЂР°РІР»РµРЅС‹ РїРѕСЃС‚Р°РІС‰РёРєСѓ" },
          { label: "РЎСЂРµРґРЅРёР№ С‡РµРє", value: formatMoney(filteredPurchases.length ? sumBy(filteredPurchases, (item) => item.amount || 0) / filteredPurchases.length : 0), caption: "РїРѕ С‚РµРєСѓС‰РµР№ РІС‹Р±РѕСЂРєРµ" }
        ];
      }
      if (moduleKey === "money") {
        return [
          { label: "Р‘Р°Р»Р°РЅСЃ", value: formatMoney((snapshot.incomeTotal || 0) - (snapshot.expenseTotal || 0)), caption: "РїСЂРёС…РѕРґ РјРёРЅСѓСЃ СЂР°СЃС…РѕРґ" },
          { label: "РџСЂРёС…РѕРґ", value: formatMoney(snapshot.incomeTotal || 0), caption: "РґРµРЅРµР¶РЅС‹Р№ РїРѕС‚РѕРє РІРЅСѓС‚СЂСЊ" },
          { label: "Р Р°СЃС…РѕРґ", value: formatMoney(snapshot.expenseTotal || 0), caption: "РґРµРЅРµР¶РЅС‹Р№ РїРѕС‚РѕРє РЅР°СЂСѓР¶Сѓ" },
          { label: "РћРїРµСЂР°С†РёР№", value: formatNumber(filteredFinance.length), caption: "РїРѕ С‚РµРєСѓС‰РµР№ РІС‹Р±РѕСЂРєРµ" },
          { label: "РЎС‡РµС‚РѕРІ", value: formatNumber(financeAccounts.length), caption: "Р°РєС‚РёРІРЅС‹Рµ РєР°СЃСЃС‹ Рё СЃС‡РµС‚Р°" },
          { label: "РљРѕРЅС‚СЂР°РіРµРЅС‚РѕРІ", value: formatNumber(new Set((doc.financeEntries || []).map((entry) => compactText(entry.counterparty)).filter(Boolean)).size), caption: "РІ РґРµРЅРµР¶РЅС‹С… РѕРїРµСЂР°С†РёСЏС…" }
        ];
      }
      if (moduleKey === "production") {
        return [
          { label: "РђРєС‚РёРІРЅС‹Рµ", value: formatNumber(snapshot.productionActive || 0), caption: "РЅРµ Р·Р°РІРµСЂС€РµРЅС‹ Рё РЅРµ РЅР° РїР°СѓР·Рµ" },
          { label: "Р’ РѕС‡РµСЂРµРґРё", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "queue").length), caption: "РѕР¶РёРґР°СЋС‚ Р·Р°РїСѓСЃРє" },
          { label: "Р’ СЂР°Р±РѕС‚Рµ", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "in_work").length), caption: "Сѓ РёСЃРїРѕР»РЅРёС‚РµР»РµР№" },
          { label: "РљРѕРЅС‚СЂРѕР»СЊ", value: formatNumber((doc.productionJobs || []).filter((item) => compactText(item.stage) === "qa").length), caption: "РЅР° РїСЂРѕРІРµСЂРєРµ" },
          { label: "РЎРѕС‚СЂСѓРґРЅРёРєРѕРІ", value: formatNumber(new Set((doc.productionJobs || []).map((item) => compactText(item.assignee)).filter(Boolean)).size), caption: "РІ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРј С†РёРєР»Рµ" },
          { label: "РћР±СЉРµРј", value: formatNumber(sumBy(filteredProduction, (item) => item.qty || 0)), caption: "РїРѕ С‚РµРєСѓС‰РµР№ РІС‹Р±РѕСЂРєРµ" }
        ];
      }
      return [
        { label: "РџРѕР·РёС†РёР№", value: formatNumber(snapshot.items.length), caption: "РІ РєР°С‚Р°Р»РѕРіРµ РјР°С‚РµСЂРёР°Р»РѕРІ" },
        { label: "РќР° СЂСѓРєР°С…", value: formatNumber(snapshot.onHandTotal), caption: "РѕР±С‰РµРµ РєРѕР»РёС‡РµСЃС‚РІРѕ" },
        { label: "Р’ СЂРµР·РµСЂРІРµ", value: formatNumber(snapshot.reservedTotal), caption: "РїРѕРґ С‚РµРєСѓС‰РёРµ Р·Р°РєР°Р·С‹" },
        { label: "РќСѓР¶РЅРѕ РїРѕРїРѕР»РЅРёС‚СЊ", value: formatNumber(snapshot.lowItems.length), caption: "РЅРёР¶Рµ РјРёРЅРёРјР°Р»СЊРЅРѕРіРѕ Р·Р°РїР°СЃР°" },
        { label: "РР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ", value: formatNumber(calculatorSnapshot.activeTabs), caption: "Р°РєС‚РёРІРЅС‹С… РІРєР»Р°РґРѕРє СЃРїСЂРѕСЃР°" },
        ...getFormulaMetrics("warehouse", doc, filteredItems)
      ];
    })();
    const customHeader = renderCustomTableHeader("warehouse", doc, escapeHtml);
    const warehouseActionButtons = (() => {
      if (moduleKey === "products") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-product-new>РќРѕРІС‹Р№ С‚РѕРІР°СЂ</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">РћСЃС‚Р°С‚РєРё</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Р—Р°РєСѓРїРєРё</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Р­РєСЃРїРѕСЂС‚ JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">РРјРїРѕСЂС‚ JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:product">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє С‚РѕРІР°СЂР°</button>' : ""
        ];
      }
      if (moduleKey === "purchases") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-purchase-new>РќРѕРІР°СЏ Р·Р°РєСѓРїРєР°</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">РўРѕРІР°СЂС‹</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="finance">Р”РµРЅСЊРіРё</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Р­РєСЃРїРѕСЂС‚ JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">РРјРїРѕСЂС‚ JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:purchase">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє Р·Р°РєСѓРїРєРё</button>' : ""
        ];
      }
      if (moduleKey === "money") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-finance-new>РќРѕРІР°СЏ РѕРїРµСЂР°С†РёСЏ</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Р—Р°РєСѓРїРєРё</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="production">РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Р­РєСЃРїРѕСЂС‚ JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">РРјРїРѕСЂС‚ JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:finance">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РґРµРЅРµРі</button>' : ""
        ];
      }
      if (moduleKey === "production") {
        return [
          canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-production-new>Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">РўРѕРІР°СЂС‹</button>' : "",
          canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">РћСЃС‚Р°С‚РєРё</button>' : "",
          '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Р­РєСЃРїРѕСЂС‚ JSON</button>',
          canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">РРјРїРѕСЂС‚ JSON</button>' : "",
          canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:production">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РїСЂРѕРёР·РІРѕРґСЃС‚РІР°</button>' : ""
        ];
      }
      return [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-item-new>РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-product-new>РќРѕРІС‹Р№ С‚РѕРІР°СЂ</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-purchase-new>РќРѕРІР°СЏ Р·Р°РєСѓРїРєР°</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-finance-new>РќРѕРІР°СЏ РѕРїРµСЂР°С†РёСЏ</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-production-new>Р’ РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-seed-demand>Р”РѕР±Р°РІРёС‚СЊ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="products">РўРѕРІР°СЂС‹</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="purchases">Р—Р°РєСѓРїРєРё</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="finance">Р”РµРЅСЊРіРё</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="production">РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</button>',
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="movements">Р”РІРёР¶РµРЅРёСЏ</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">РћСЃС‚Р°С‚РєРё</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Р­РєСЃРїРѕСЂС‚ JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">РРјРїРѕСЂС‚ JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:item">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РїРѕР·РёС†РёРё</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:movement">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РґРІРёР¶РµРЅРёСЏ</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:product">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє С‚РѕРІР°СЂР°</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:purchase">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє Р·Р°РєСѓРїРєРё</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:finance">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РґРµРЅРµРі</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:production">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РїСЂРѕРёР·РІРѕРґСЃС‚РІР°</button>' : ""
      ];
    })();
    if (moduleKey === "warehouse" && !warehouseActionButtons.some((action) => String(action).includes('data-live-mode="history"'))) {
      warehouseActionButtons.splice(10, 0, '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="history">РСЃС‚РѕСЂРёСЏ</button>');
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
          <div class="panel-heading"><div><h4>РЎРїСЂРѕСЃ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ</h4><div class="compact-help">РџР»Р°С‚С„РѕСЂРјР° РІРёРґРёС‚ Р°РєС‚РёРІРЅС‹Рµ РІРєР»Р°РґРєРё РёР· Р»РёС‡РЅРѕРіРѕ Рё РїР°СЂС‚РЅРµСЂСЃРєРёС… РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ Рё РїРѕРґСЃРІРµС‡РёРІР°РµС‚ Р°СЂС‚РёРєСѓР»С‹, РєРѕС‚РѕСЂС‹Рµ СЃС‚РѕРёС‚ РґРµСЂР¶Р°С‚СЊ РїРѕРґ СЂСѓРєРѕР№.</div></div><div class="workspace-note">${escapeHtml(formatNumber(calculatorSnapshot.invoiceIssuedTabs))} СЃС‡РµС‚РѕРІ РІС‹СЃС‚Р°РІР»РµРЅРѕ вЂў ${escapeHtml(formatNumber(calculatorSnapshot.invoicePaidTabs))} РѕРїР»Р°С‡РµРЅРѕ</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>РђРєС‚РёРІРЅС‹С… РІРєР»Р°РґРѕРє</span><strong>${escapeHtml(formatNumber(calculatorSnapshot.activeTabs))}</strong></div>
            <div class="workspace-stage-card"><span>РђСЂС‚РёРєСѓР»РѕРІ СЃРѕ СЃРїСЂРѕСЃРѕРј</span><strong>${escapeHtml(formatNumber(demandBridge.length))}</strong></div>
            <div class="workspace-stage-card"><span>РќРµ Р·Р°РІРµРґРµРЅРѕ РЅР° СЃРєР»Р°РґРµ</span><strong>${escapeHtml(formatNumber(missingDemand.length))}</strong></div>
            <div class="workspace-stage-card"><span>РљСЂРёС‚РёС‡РЅРѕ РїРѕ РѕСЃС‚Р°С‚РєСѓ</span><strong>${escapeHtml(formatNumber(criticalDemand.length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(demandBridge.slice(0, 8) || []).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.match?.name || entry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.sku)} вЂў ${escapeHtml(entry.sources.join(", ") || "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂС‹")}</div></div><div class="text-end"><div class="workspace-tag ${entry.missing ? "workspace-tag--warning" : entry.low ? "workspace-tag--danger" : "workspace-tag--success"}">${escapeHtml(formatNumber(entry.qtyTotal))}</div><div class="workspace-list-item__meta mt-1">${entry.missing ? "РЅРµС‚ РїРѕР·РёС†РёРё" : `РґРѕСЃС‚СѓРїРЅРѕ ${escapeHtml(formatNumber(entry.match?.available || 0))}`}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РЎРїСЂРѕСЃ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ РїРѕРєР° РЅРµ РЅР°Р№РґРµРЅ.</div>'}
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
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="warehouse">${ui.warehouse.configOpen ? "РЎРєСЂС‹С‚СЊ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ" : "РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel(moduleKey, doc, ui.warehouse, escapeHtml) : ""}
        ${modeIs(filters, "history") ? `<section class="workspace-panel workspace-panel--active" data-mode-section="history">
          <div class="panel-heading">
            <div>
              <h4>РСЃС‚РѕСЂРёСЏ СЃРєР»Р°РґР°</h4>
              <div class="compact-help">Р•РґРёРЅР°СЏ Р»РµРЅС‚Р° СЃРєР»Р°РґР°, Р·Р°РєСѓРїРѕРє, РґРµРЅРµРі Рё РїСЂРѕРёР·РІРѕРґСЃС‚РІР°. Р—РґРµСЃСЊ СѓРґРѕР±РЅРѕ РїСЂРѕРІРµСЂСЏС‚СЊ РїРѕСЃР»РµРґРЅРёРµ РґРµР№СЃС‚РІРёСЏ Р±РµР· РїРµСЂРµС…РѕРґРѕРІ РїРѕ СЂР°Р·РґРµР»Р°Рј.</div>
            </div>
            <div class="workspace-note">РЎРѕР±С‹С‚РёР№: ${escapeHtml(formatNumber(filteredHistory.length))}</div>
          </div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>Р’СЃРµРіРѕ</span><strong>${escapeHtml(formatNumber(historyEntries.length))}</strong><small class="workspace-list-item__meta">РІ РµРґРёРЅРѕР№ РёСЃС‚РѕСЂРёРё</small></div>
            <div class="workspace-stage-card"><span>Р—Р° 24 С‡Р°СЃР°</span><strong>${escapeHtml(formatNumber(filteredHistory.filter((entry) => Date.now() - new Date(entry.date).getTime() <= 24 * 60 * 60 * 1000).length))}</strong><small class="workspace-list-item__meta">РїРѕСЃР»РµРґРЅСЏСЏ Р°РєС‚РёРІРЅРѕСЃС‚СЊ</small></div>
            <div class="workspace-stage-card"><span>РџРѕ Р·Р°РєСѓРїРєР°Рј</span><strong>${escapeHtml(formatNumber(filteredHistory.filter((entry) => entry.family === "purchase").length))}</strong><small class="workspace-list-item__meta">РІ С‚РµРєСѓС‰РµРј С„РёР»СЊС‚СЂРµ</small></div>
            <div class="workspace-stage-card"><span>Р”РµРЅСЊРіРё</span><strong>${escapeHtml(formatMoney(sumBy(filteredHistory.filter((entry) => entry.family === "finance"), (entry) => entry.amount || 0)))}</strong><small class="workspace-list-item__meta">СЃСѓРјРјР° РѕРїРµСЂР°С†РёР№</small></div>
          </div>
          <div class="workspace-grid workspace-grid--2 mt-3">
            <section class="workspace-panel workspace-panel--active" data-mode-section="history">
              <div class="panel-heading panel-heading--compact">
                <div>
                  <h4>РџРѕСЃР»РµРґРЅРёРµ СЃРѕР±С‹С‚РёСЏ</h4>
                  <div class="compact-help">Р›РµРЅС‚Р° РїРѕРєР°Р·С‹РІР°РµС‚ РїРѕСЃР»РµРґРЅРµРµ РґРІРёР¶РµРЅРёРµ РїРѕ СЃРєР»Р°РґСѓ, РїР»Р°С‚РµР¶, Р·Р°РєСѓРїРєСѓ РёР»Рё РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ РґРµР№СЃС‚РІРёРµ.</div>
                </div>
              </div>
              <div class="workspace-stack">
                ${filteredHistory.slice(0, 18).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.label)} вЂў ${escapeHtml(entry.meta || "Р‘РµР· РґРµС‚Р°Р»РµР№")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(entry.tone || "neutral")}">${escapeHtml(formatDate(entry.date))}</div><div class="workspace-list-item__meta mt-1">${entry.family === "finance" ? escapeHtml(formatMoney(entry.amount || 0)) : escapeHtml(formatNumber(entry.amount || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РџРѕ РІС‹Р±СЂР°РЅРЅС‹Рј С„РёР»СЊС‚СЂР°Рј РёСЃС‚РѕСЂРёСЏ РїРѕРєР° РїСѓСЃС‚Р°СЏ.</div>'}
              </div>
            </section>
            <section class="workspace-panel workspace-panel--active" data-mode-section="history">
              <div class="panel-heading panel-heading--compact">
                <div>
                  <h4>Р–СѓСЂРЅР°Р» РґРµР№СЃС‚РІРёР№</h4>
                  <div class="compact-help">Р‘С‹СЃС‚СЂС‹Р№ РїРµСЂРµС…РѕРґ РїСЂСЏРјРѕ РІ РЅСѓР¶РЅСѓСЋ СЃСѓС‰РЅРѕСЃС‚СЊ: РїРѕР·РёС†РёСЋ, Р·Р°РєСѓРїРєСѓ, РѕРїРµСЂР°С†РёСЋ РёР»Рё РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ.</div>
                </div>
              </div>
              <div class="table-shell">
                <table class="table table-sm align-middle workspace-table">
                  <thead>
                    <tr><th>Р”Р°С‚Р°</th><th>РўРёРї</th><th>РЎРѕР±С‹С‚РёРµ</th><th>Р”РµС‚Р°Р»Рё</th><th>Р—РЅР°С‡РµРЅРёРµ</th><th></th></tr>
                  </thead>
                  <tbody>
                    ${filteredHistory.length ? filteredHistory.map((entry) => `<tr><td>${escapeHtml(formatDate(entry.date))}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(entry.tone || "neutral")}">${escapeHtml(entry.label)}</span></td><td><strong>${escapeHtml(entry.title)}</strong></td><td>${escapeHtml(entry.meta || "вЂ”")}</td><td>${entry.family === "finance" ? escapeHtml(formatMoney(entry.amount || 0)) : escapeHtml(formatNumber(entry.amount || 0))}</td><td class="text-end">${entry.action?.type === "item" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-item-edit="${escapeHtml(entry.action.id)}">РћС‚РєСЂС‹С‚СЊ</button>` : entry.action?.type === "purchase" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-purchase-edit="${escapeHtml(entry.action.id)}">РћС‚РєСЂС‹С‚СЊ</button>` : entry.action?.type === "finance" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-finance-edit="${escapeHtml(entry.action.id)}">РћС‚РєСЂС‹С‚СЊ</button>` : entry.action?.type === "production" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-production-edit="${escapeHtml(entry.action.id)}">РћС‚РєСЂС‹С‚СЊ</button>` : entry.action?.type === "mode" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-live-mode="${escapeHtml(entry.action.mode)}">РћС‚РєСЂС‹С‚СЊ</button>` : ""}</td></tr>`).join("") : '<tr><td colspan="6" class="text-muted">РџРѕ С‚РµРєСѓС‰РёРј С„РёР»СЊС‚СЂР°Рј РёСЃС‚РѕСЂРёСЏ РїСѓСЃС‚Р°.</td></tr>'}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>` : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editItem ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїРѕР·РёС†РёРё" : "РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ СЃРєР»Р°РґР°"}</h4><div class="compact-help">РљР°С‚Р°Р»РѕРі РјРѕР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ РєР°Рє РѕР±С‰РёР№ СЃРїСЂР°РІРѕС‡РЅРёРє РјР°С‚РµСЂРёР°Р»РѕРІ РґР»СЏ СЃРєР»Р°РґР° Рё Р±СѓРґСѓС‰РёС… РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ.</div></div></div>
            ${canEdit ? `<form id="warehouseItemForm" class="workspace-form" data-draft-form="item"><input type="hidden" name="id" value="${escapeHtml(editItem?.id || "")}" /><div class="workspace-form-grid"><label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="name" value="${escapeHtml(editItem?.name || "")}" required /></label><label><span>SKU / Р°СЂС‚РёРєСѓР»</span><input class="form-control" type="text" name="sku" value="${escapeHtml(editItem?.sku || "")}" /></label><label><span>РљР°С‚РµРіРѕСЂРёСЏ</span><input class="form-control" type="text" name="category" value="${escapeHtml(editItem?.category || "")}" /></label><label><span>Р•Рґ. РёР·Рј.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(editItem?.unit || "С€С‚")}" /></label><label><span>РЎС‚Р°СЂС‚РѕРІС‹Р№ РѕСЃС‚Р°С‚РѕРє</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(String(toNumber(editItem?.openingStock || 0) || ""))}" /></label><label><span>РњРёРЅРёРјСѓРј</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(String(toNumber(editItem?.minStock || 0) || ""))}" /></label></div><label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="3">${escapeHtml(editItem?.note || "")}</textarea></label>${renderCustomFieldSection("warehouse", doc, editItem, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editItem ? "РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ" : "Р”РѕР±Р°РІРёС‚СЊ РїРѕР·РёС†РёСЋ"}</button><button class="btn btn-outline-secondary" type="button" data-warehouse-item-new>РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button></div></form>` : renderAccessHint("warehouse")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р”РІРёР¶РµРЅРёРµ РїРѕ СЃРєР»Р°РґСѓ</h4><div class="compact-help">РџСЂРёС…РѕРґ, СЃРїРёСЃР°РЅРёРµ Рё СЂРµР·РµСЂРІС‹ Р»СѓС‡С€Рµ РІРЅРѕСЃРёС‚СЊ РѕС‚РґРµР»СЊРЅРѕ вЂ” РѕСЃС‚Р°С‚РєРё СЃС‡РёС‚Р°СЋС‚СЃСЏ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё.</div></div></div>
            ${canEdit ? `<form id="warehouseMovementForm" class="workspace-form" data-draft-form="movement"><div class="workspace-form-grid"><label><span>РџРѕР·РёС†РёСЏ</span><select class="form-select" name="itemId" required><option value="">Р’С‹Р±РµСЂРёС‚Рµ РїРѕР·РёС†РёСЋ</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${filters.movementItemId === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label><label><span>РўРёРї</span><select class="form-select" name="kind">${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label><label><span>РљРѕР»РёС‡РµСЃС‚РІРѕ</span><input class="form-control" type="number" min="0" step="1" name="qty" required /></label><label><span>Р”Р°С‚Р°</span><input class="form-control" type="date" name="date" value="${escapeHtml(todayString())}" /></label></div><label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="3"></textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">РЎРѕС…СЂР°РЅРёС‚СЊ РґРІРёР¶РµРЅРёРµ</button></div></form>` : renderAccessHint("warehouse")}
          </section>
        </div>` : ""}
        ${editItem ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РљРѕРЅС‚СѓСЂ РїРѕР·РёС†РёРё</h4><div class="compact-help">РЎРѕР±РёСЂР°РµС‚ РІ РѕРґРЅРѕРј РјРµСЃС‚Рµ РѕСЃС‚Р°С‚РѕРє, СЃРїСЂРѕСЃ, СЃРґРµР»РєРё Рё Р·Р°РґР°С‡Рё РїРѕ С‚РµРєСѓС‰РµРјСѓ РјР°С‚РµСЂРёР°Р»Сѓ.</div></div></div>
            <div class="workspace-stage-strip">${editItemOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-task-from-item="${escapeHtml(editItem.id)}">${editItemPrimaryTask ? "РћС‚РєСЂС‹С‚СЊ Р·Р°РґР°С‡Сѓ" : "РЎРѕР·РґР°С‚СЊ Р·Р°РґР°С‡Сѓ"}</button>` : ""}
              ${relatedDeals[0]?.id ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="crm:${escapeHtml(relatedDeals[0].id)}">РћС‚РєСЂС‹С‚СЊ СЃРґРµР»РєСѓ</button>` : ""}
              <button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-movement-pick="${escapeHtml(editItem.id)}">Р”РѕР±Р°РІРёС‚СЊ РґРІРёР¶РµРЅРёРµ</button>
            </div>
            <div class="workspace-stack mt-3">
              <div><div class="panel-heading panel-heading--compact"><div><h4>РЎРїСЂРѕСЃ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ</h4><div class="compact-help">РџРѕРєР°Р·С‹РІР°РµС‚, РіРґРµ СЌС‚РѕС‚ РјР°С‚РµСЂРёР°Р» СѓР¶Рµ С„РёРіСѓСЂРёСЂСѓРµС‚ РІ СЂР°СЃС‡РµС‚Р°С….</div></div></div><div class="workspace-stack">${editDemandEntry ? editDemandEntry.examples?.length ? editDemandEntry.examples.map((example) => `<div class="workspace-list-item"><div><strong>${escapeHtml(editDemandEntry.match?.name || editItem.name || editDemandEntry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml(example)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber(editDemandEntry.qtyTotal || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml((editDemandEntry.sources || []).join(", ") || "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂС‹")}</div></div></div>`).join("") : `<div class="workspace-list-item"><div><strong>${escapeHtml(editItem.name || editDemandEntry.sku)}</strong><div class="workspace-list-item__meta">${escapeHtml((editDemandEntry.sources || []).join(", ") || "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂС‹")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatNumber(editDemandEntry.qtyTotal || 0))}</div></div></div>` : '<div class="workspace-empty workspace-empty--tight">РџРѕ РєР°Р»СЊРєСѓР»СЏС‚РѕСЂР°Рј СЃРїСЂРѕСЃ РЅР° СЌС‚Сѓ РїРѕР·РёС†РёСЋ РїРѕРєР° РЅРµ РЅР°Р№РґРµРЅ.</div>'}</div></div>
              <div><div class="panel-heading panel-heading--compact"><div><h4>РЎРІСЏР·Р°РЅРЅС‹Рµ СЃРґРµР»РєРё</h4><div class="compact-help">РЎРґРµР»РєРё, РіРґРµ СЌС‚РѕС‚ РјР°С‚РµСЂРёР°Р» СѓР¶Рµ СѓС€С‘Р» РІ СЂРµР·РµСЂРІ РёР»Рё СѓС‡Р°СЃС‚РІСѓРµС‚ РІ РїРѕРґРіРѕС‚РѕРІРєРµ Р·Р°РєР°Р·Р°.</div></div></div><div class="workspace-stack">${relatedDeals.length ? relatedDeals.slice(0, 5).map((deal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(deal.title || "РЎРґРµР»РєР°")}</strong><div class="workspace-list-item__meta">${escapeHtml(deal.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")} вЂў ${escapeHtml(getCrmStageMeta(deal.stage).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getCrmStageMeta(deal.stage).tone)}">${escapeHtml(formatMoney(deal.amount || 0))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="crm:${escapeHtml(deal.id)}">РћС‚РєСЂС‹С‚СЊ</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">РЎРґРµР»РѕРє РїРѕ СЌС‚РѕР№ РїРѕР·РёС†РёРё РїРѕРєР° РЅРµС‚.</div>'}</div></div>
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р›РµРЅС‚Р° РїРѕР·РёС†РёРё</h4><div class="compact-help">РСЃС‚РѕСЂРёСЏ СЃРѕР±РёСЂР°РµС‚СЃСЏ РёР· РєР°СЂС‚РѕС‡РєРё РјР°С‚РµСЂРёР°Р»Р°, РґРІРёР¶РµРЅРёР№, Р·Р°РґР°С‡ Рё СЃРІСЏР·РµР№ СЃРѕ СЃРґРµР»РєР°РјРё.</div></div><div class="workspace-note">РЎРѕР±С‹С‚РёР№: ${escapeHtml(formatNumber(editItemTimeline.length))}</div></div>
            <div class="workspace-stack">${editItemTimeline.slice(0, 10).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Р‘РµР· РґРµС‚Р°Р»РµР№")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">РћС‚РєСЂС‹С‚СЊ</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РСЃС‚РѕСЂРёСЏ РїРѕ РїРѕР·РёС†РёРё РїРѕРєР° РїСѓСЃС‚Р°СЏ.</div>'}</div>
          </section>
        </div>` : ""}
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РўРµРєСѓС‰РёРµ РѕСЃС‚Р°С‚РєРё</h4><div class="compact-help">Р”РѕСЃС‚СѓРїРЅРѕРµ РєРѕР»РёС‡РµСЃС‚РІРѕ = РЅР° СЂСѓРєР°С… в€’ СЂРµР·РµСЂРІ.</div></div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>РџРѕР·РёС†РёСЏ</th><th>РљР°С‚РµРіРѕСЂРёСЏ</th><th>РќР° СЂСѓРєР°С…</th><th>Р РµР·РµСЂРІ</th><th>Р”РѕСЃС‚СѓРїРЅРѕ</th><th>РњРёРЅРёРјСѓРј</th>${customHeader}<th></th></tr></thead><tbody>${filteredItems.length ? filteredItems.map((item) => `<tr><td><strong>${escapeHtml(item.name)}</strong><div class="workspace-table__sub">${escapeHtml(item.sku || "Р±РµР· Р°СЂС‚РёРєСѓР»Р°")} вЂў ${escapeHtml(item.unit || "С€С‚")}</div></td><td>${escapeHtml(item.category || "вЂ”")}</td><td>${escapeHtml(formatNumber(item.onHand))}</td><td>${escapeHtml(formatNumber(item.reserved))}</td><td><span class="workspace-tag ${item.low ? "workspace-tag--danger" : "workspace-tag--success"}">${escapeHtml(formatNumber(item.available))}</span></td><td>${escapeHtml(formatNumber(item.minStock || 0))}</td>${renderCustomTableCells("warehouse", doc, item, escapeHtml)}<td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-item-edit="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-item-duplicate="${escapeHtml(item.id)}">РљРѕРїРёСЏ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-movement-pick="${escapeHtml(item.id)}">Р”РІРёР¶РµРЅРёРµ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-task-from-item="${escapeHtml(item.id)}">Р—Р°РґР°С‡Р°</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-item-delete="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="${8 + getVisibleCustomFields("warehouse", doc, "showInTable").length}" class="text-muted">РџРѕР·РёС†РёРё РЅРµ РЅР°Р№РґРµРЅС‹. Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІСѓСЋ Р·Р°РїРёСЃСЊ РёР»Рё СЃРјРµРЅРёС‚Рµ С„РёР»СЊС‚СЂ.</td></tr>`}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РџРѕСЃР»РµРґРЅРёРµ РґРІРёР¶РµРЅРёСЏ</h4><div class="compact-help">РћС‚СЃСЋРґР° СѓРґРѕР±РЅРѕ РєРѕРЅС‚СЂРѕР»РёСЂРѕРІР°С‚СЊ, С‡С‚Рѕ Рё РєРѕРіРґР° СѓС€Р»Рѕ РІ СЂРµР·РµСЂРІ РёР»Рё Р±С‹Р»Рѕ СЃРїРёСЃР°РЅРѕ.</div></div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Р”Р°С‚Р°</th><th>РџРѕР·РёС†РёСЏ</th><th>РўРёРї</th><th>РљРѕР»-РІРѕ</th><th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th><th></th></tr></thead><tbody>${recentMovements.length ? recentMovements.map((movement) => { const item = (doc.items || []).find((entry) => entry.id === movement.itemId); const kind = WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind); return `<tr><td>${escapeHtml(formatDate(movement.date))}</td><td>${escapeHtml(item?.name || "РџРѕР·РёС†РёСЏ СѓРґР°Р»РµРЅР°")}</td><td>${escapeHtml(kind?.label || movement.kind)}</td><td>${escapeHtml(formatNumber(movement.qty || 0))}</td><td>${escapeHtml(movement.note || "вЂ”")}</td><td class="text-end">${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-movement-delete="${escapeHtml(movement.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">Р”РІРёР¶РµРЅРёР№ РїРѕРєР° РЅРµС‚.</td></tr>'}</tbody></table></div>
            <div class="workspace-stack mt-3"><div class="panel-heading panel-heading--compact"><div><h4>РќСѓР¶РЅРѕ РїРѕРїРѕР»РЅРёС‚СЊ</h4><div class="compact-help">РљСЂРёС‚РёС‡РЅС‹Рµ РїРѕР·РёС†РёРё, РіРґРµ РґРѕСЃС‚СѓРїРЅС‹Р№ РѕСЃС‚Р°С‚РѕРє РЅРёР¶Рµ РјРёРЅРёРјСѓРјР°.</div></div></div>${snapshot.lowItems.length ? snapshot.lowItems.map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.name)}</strong><div class="workspace-list-item__meta">${escapeHtml(item.category || "вЂ”")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--danger">${escapeHtml(formatNumber(item.available))}</div><div class="workspace-list-item__meta mt-1">РјРёРЅРёРјСѓРј ${escapeHtml(formatNumber(item.minStock || 0))}</div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">РљСЂРёС‚РёС‡РЅС‹С… РѕСЃС‚Р°С‚РєРѕРІ РЅРµС‚.</div>'}</div>
          </section>
        </div>
        ${modeIs(filters, "overview", "products") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РўРѕРІР°СЂС‹</h4><div class="compact-help">РџСЂРѕРґР°СЋС‰РёР№ РєР°С‚Р°Р»РѕРі РїР»Р°С‚С„РѕСЂРјС‹: РіСЂСѓРїРїС‹, С†РµРЅС‹, РїРѕСЃС‚Р°РІС‰РёРєРё Рё РµРґРёРЅРёС†С‹ РёР·РјРµСЂРµРЅРёСЏ.</div></div><div class="workspace-note">${escapeHtml(formatNumber(filteredProducts.length))} РїРѕР·РёС†РёР№</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>РўРѕРІР°СЂ</th><th>Р“СЂСѓРїРїР°</th><th>РџРѕСЃС‚Р°РІС‰РёРє</th><th>Р¦РµРЅР° Р·Р°РєСѓРїРєРё</th><th>Р¦РµРЅР° РїСЂРѕРґР°Р¶Рё</th><th></th></tr></thead><tbody>${filteredProducts.length ? filteredProducts.map((item) => `<tr><td><strong>${escapeHtml(item.name || "РўРѕРІР°СЂ")}</strong><div class="workspace-table__sub">${escapeHtml(item.sku || "Р±РµР· Р°СЂС‚РёРєСѓР»Р°")} вЂў ${escapeHtml(item.unit || "С€С‚")}</div></td><td>${escapeHtml(item.group || "вЂ”")}</td><td>${escapeHtml(item.supplier || "вЂ”")}</td><td>${escapeHtml(formatMoney(item.purchasePrice || 0))}</td><td>${escapeHtml(formatMoney(item.salePrice || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-product-edit="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-product-delete="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></td></tr>`).join("") : '<tr><td colspan="6" class="text-muted">РўРѕРІР°СЂРЅС‹Р№ РєР°С‚Р°Р»РѕРі РїРѕРєР° РїСѓСЃС‚. Р”РѕР±Р°РІСЊС‚Рµ РїРµСЂРІСѓСЋ РїРѕР·РёС†РёСЋ С‡РµСЂРµР· РІСЃРїР»С‹РІР°СЋС‰РµРµ РѕРєРЅРѕ.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р¤РѕРєСѓСЃ РїРѕ С‚РѕРІР°СЂР°Рј</h4><div class="compact-help">Р‘С‹СЃС‚СЂС‹Р№ РѕР±Р·РѕСЂ РїРѕ РєР°С‚Р°Р»РѕРіСѓ Рё С†РµРЅР°Рј Р±РµР· СѓС…РѕРґР° РІ РєР°СЂС‚РѕС‡РєРё.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>Р“СЂСѓРїРї</span><strong>${escapeHtml(formatNumber(productGroups.length))}</strong></div>
              <div class="workspace-stage-card"><span>РџРѕСЃС‚Р°РІС‰РёРєРѕРІ</span><strong>${escapeHtml(formatNumber(new Set((doc.products || []).map((item) => compactText(item.supplier)).filter(Boolean)).size))}</strong></div>
              <div class="workspace-stage-card"><span>РЎСЂРµРґРЅСЏСЏ Р·Р°РєСѓРїРєР°</span><strong>${escapeHtml(formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.purchasePrice || 0) / filteredProducts.length : 0))}</strong></div>
              <div class="workspace-stage-card"><span>РЎСЂРµРґРЅСЏСЏ РїСЂРѕРґР°Р¶Р°</span><strong>${escapeHtml(formatMoney(filteredProducts.length ? sumBy(filteredProducts, (item) => item.salePrice || 0) / filteredProducts.length : 0))}</strong></div>
            </div>
            <div class="workspace-stack mt-3">${filteredProducts.slice(0, 6).map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.name || "РўРѕРІР°СЂ")}</strong><div class="workspace-list-item__meta">${escapeHtml(item.group || "Р‘РµР· РіСЂСѓРїРїС‹")} вЂў ${escapeHtml(item.supplier || "Р‘РµР· РїРѕСЃС‚Р°РІС‰РёРєР°")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney((item.salePrice || 0) - (item.purchasePrice || 0)))}</div><div class="workspace-list-item__meta mt-1">РјР°СЂР¶Р° Р·Р° РµРґРёРЅРёС†Сѓ</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РџРѕРєР° РЅРµС‚ С‚РѕРІР°СЂРѕРІ РґР»СЏ РѕР±Р·РѕСЂР°.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "purchases") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р—Р°РєСѓРїРєРё</h4><div class="compact-help">Р—Р°РєР°Р·С‹ РїРѕСЃС‚Р°РІС‰РёРєР°Рј, РєРѕРЅС‚СЂРѕР»СЊ СЃС‚Р°С‚СѓСЃРѕРІ Рё РѕР±С‰РёС… СЃСѓРјРј.</div></div><div class="workspace-note">${escapeHtml(formatMoney(snapshot.purchasesTotal || 0))} РІ РѕР±РѕСЂРѕС‚Рµ</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>РќРѕРјРµСЂ</th><th>РџРѕСЃС‚Р°РІС‰РёРє</th><th>РЎС‚Р°С‚СѓСЃ</th><th>Р”Р°С‚Р°</th><th>РЎСѓРјРјР°</th><th></th></tr></thead><tbody>${filteredPurchases.length ? filteredPurchases.map((item) => { const meta = getPurchaseStatusMeta(item.status); return `<tr><td><strong>${escapeHtml(item.number || "Р—Р°РєСѓРїРєР°")}</strong></td><td>${escapeHtml(item.supplier || "вЂ”")}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(formatDate(item.date))}</td><td>${escapeHtml(formatMoney(item.amount || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-purchase-edit="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-purchase-delete="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">Р—Р°РєСѓРїРѕРє РїРѕРєР° РЅРµС‚.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РЎС‚Р°С‚СѓСЃС‹ Р·Р°РєСѓРїРѕРє</h4><div class="compact-help">Р“РґРµ СЃРµР№С‡Р°СЃ Р·Р°РІРёСЃР°СЋС‚ Р·Р°РєСѓРїРєРё Рё РєР°РєРёРµ РїРѕСЃС‚Р°РІС‰РёРєРё Р·Р°РіСЂСѓР¶РµРЅС‹ СЃРёР»СЊРЅРµРµ.</div></div></div>
            <div class="workspace-mini-grid">${WAREHOUSE_PURCHASE_STATUSES.map((status) => `<div class="dashboard-mini dashboard-mini--${escapeHtml(status.tone)}"><span>${escapeHtml(status.label)}</span><strong>${escapeHtml(formatNumber((doc.purchases || []).filter((item) => compactText(item.status) === status.key).length))}</strong></div>`).join("")}</div>
            <div class="workspace-stack mt-3">${filteredPurchases.slice(0, 6).map((item) => `<div class="workspace-list-item"><div><strong>${escapeHtml(item.number || "Р—Р°РєСѓРїРєР°")}</strong><div class="workspace-list-item__meta">${escapeHtml(item.supplier || "вЂ”")} вЂў ${escapeHtml(formatDate(item.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getPurchaseStatusMeta(item.status).tone)}">${escapeHtml(getPurchaseStatusMeta(item.status).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatMoney(item.amount || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РќРµС‚ РґР°РЅРЅС‹С… РїРѕ Р·Р°РєСѓРїРєР°Рј.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "finance") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р”РµРЅСЊРіРё</h4><div class="compact-help">РџСЂРёС…РѕРґС‹, СЂР°СЃС…РѕРґС‹ Рё РїРµСЂРµРјРµС‰РµРЅРёСЏ РїРѕ СЃС‡РµС‚Р°Рј РїР»Р°С‚С„РѕСЂРјС‹.</div></div><div class="workspace-note">Р‘Р°Р»Р°РЅСЃ ${escapeHtml(formatMoney(snapshot.incomeTotal - snapshot.expenseTotal))}</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Р”Р°С‚Р°</th><th>РўРёРї</th><th>РЎС‡РµС‚</th><th>РЎС‚Р°С‚СЊСЏ</th><th>РљРѕРЅС‚СЂР°РіРµРЅС‚</th><th>РЎСѓРјРјР°</th><th></th></tr></thead><tbody>${filteredFinance.length ? filteredFinance.map((entry) => { const meta = getFinanceKindMeta(entry.kind); return `<tr><td>${escapeHtml(formatDate(entry.date))}</td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(entry.account || "вЂ”")}</td><td>${escapeHtml(entry.category || "вЂ”")}</td><td>${escapeHtml(entry.counterparty || "вЂ”")}</td><td>${escapeHtml(formatMoney(entry.amount || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-finance-edit="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-finance-delete="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="7" class="text-muted">Р”РµРЅРµР¶РЅС‹С… РѕРїРµСЂР°С†РёР№ РїРѕРєР° РЅРµС‚.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РЎС‡РµС‚Р° Рё РєР°СЃСЃС‹</h4><div class="compact-help">РџРѕРєР°Р·С‹РІР°РµС‚, РіРґРµ СЃРµР№С‡Р°СЃ Р»РµР¶РёС‚ РѕР±РѕСЂРѕС‚ Рё РєР°РєРёРµ СЃС‚Р°С‚СЊРё Р°РєС‚РёРІРЅРµРµ РІСЃРµРіРѕ.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>РџСЂРёС…РѕРґ</span><strong>${escapeHtml(formatMoney(snapshot.incomeTotal || 0))}</strong></div>
              <div class="workspace-stage-card"><span>Р Р°СЃС…РѕРґ</span><strong>${escapeHtml(formatMoney(snapshot.expenseTotal || 0))}</strong></div>
              <div class="workspace-stage-card"><span>РћРїРµСЂР°С†РёР№</span><strong>${escapeHtml(formatNumber(filteredFinance.length))}</strong></div>
              <div class="workspace-stage-card"><span>РЎС‡РµС‚РѕРІ</span><strong>${escapeHtml(formatNumber(new Set((doc.financeEntries || []).map((entry) => compactText(entry.account)).filter(Boolean)).size))}</strong></div>
            </div>
            <div class="workspace-stack mt-3">${(getDirectoryOptions("finance_accounts") || []).map((account) => `<div class="workspace-list-item"><div><strong>${escapeHtml(account)}</strong><div class="workspace-list-item__meta">РћРїРµСЂР°С†РёР№: ${escapeHtml(formatNumber((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account)).length))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(sumBy((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account) && compactText(entry.kind) === "income"), (entry) => entry.amount || 0) - sumBy((doc.financeEntries || []).filter((entry) => compactText(entry.account) === compactText(account) && compactText(entry.kind) === "expense"), (entry) => entry.amount || 0)))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РЎРїСЂР°РІРѕС‡РЅРёРєРё СЃС‡РµС‚РѕРІ РїРѕРєР° РїСѓСЃС‚С‹.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "production") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ</h4><div class="compact-help">РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹Рµ Р·Р°РґР°РЅРёСЏ, СЃСЂРѕРєРё, РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рµ Рё СЃРІСЏР·РєР° СЃ РјР°С‚РµСЂРёР°Р»Р°РјРё.</div></div><div class="workspace-note">${escapeHtml(formatNumber(snapshot.productionActive || 0))} Р°РєС‚РёРІРЅС‹С…</div></div>
            <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Р—Р°РґР°РЅРёРµ</th><th>Р­С‚Р°Рї</th><th>РЎСЂРѕРє</th><th>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</th><th>РљРѕР»-РІРѕ</th><th></th></tr></thead><tbody>${filteredProduction.length ? filteredProduction.map((entry) => { const meta = getProductionStatusMeta(entry.stage); return `<tr><td><strong>${escapeHtml(entry.title || "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ")}</strong><div class="workspace-table__sub">${escapeHtml(entry.itemLabel || "Р‘РµР· РїРѕР·РёС†РёРё")}</div></td><td><span class="workspace-tag workspace-tag--${escapeHtml(meta.tone)}">${escapeHtml(meta.label)}</span></td><td>${escapeHtml(formatDate(entry.deadline))}</td><td>${escapeHtml(entry.assignee || "вЂ”")}</td><td>${escapeHtml(formatNumber(entry.qty || 0))}</td><td class="text-end"><div class="d-flex justify-content-end gap-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-production-edit="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-production-delete="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></td></tr>`; }).join("") : '<tr><td colspan="6" class="text-muted">РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹С… Р·Р°РґР°РЅРёР№ РїРѕРєР° РЅРµС‚.</td></tr>'}</tbody></table></div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р­С‚Р°РїС‹ РїСЂРѕРёР·РІРѕРґСЃС‚РІР°</h4><div class="compact-help">РЎСЂР°Р·Сѓ РІРёРґРЅРѕ, РіРґРµ СЂР°Р±РѕС‚Р° РІ РѕС‡РµСЂРµРґРё, РіРґРµ РІ РїСЂРѕС†РµСЃСЃРµ Рё РіРґРµ С‚РѕСЂРјРѕР·РёС‚ РєРѕРЅС‚СЂРѕР»СЊ.</div></div></div>
            <div class="workspace-mini-grid">${PRODUCTION_JOB_STATUSES.map((status) => `<div class="dashboard-mini dashboard-mini--${escapeHtml(status.tone)}"><span>${escapeHtml(status.label)}</span><strong>${escapeHtml(formatNumber((doc.productionJobs || []).filter((entry) => compactText(entry.stage) === status.key).length))}</strong></div>`).join("")}</div>
            <div class="workspace-stack mt-3">${filteredProduction.slice(0, 6).map((entry) => `<div class="workspace-list-item"><div><strong>${escapeHtml(entry.title || "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ")}</strong><div class="workspace-list-item__meta">${escapeHtml(entry.assignee || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")} вЂў ${escapeHtml(formatDate(entry.deadline))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getProductionStatusMeta(entry.stage).tone)}">${escapeHtml(getProductionStatusMeta(entry.stage).label)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatNumber(entry.qty || 0))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РќРµС‚ Р°РєС‚РёРІРЅС‹С… РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹С… Р·Р°РґР°РЅРёР№.</div>'}</div>
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
      { label: "РћС‚РєСЂС‹С‚С‹Рµ Р·Р°РґР°С‡Рё", value: formatNumber(openTasks.length), caption: "Р±РµР· Р·Р°РІРµСЂС€РµРЅРЅС‹С…" },
      { label: "Р’ СЂР°Р±РѕС‚Рµ", value: formatNumber(taskList.filter((task) => task.status === "in_progress").length), caption: "Р°РєС‚РёРІРЅРѕРµ РёСЃРїРѕР»РЅРµРЅРёРµ" },
      { label: "Р‘Р»РѕРєРµСЂС‹", value: formatNumber(blockedCount), caption: "С‚СЂРµР±СѓСЋС‚ СЂРµС€РµРЅРёСЏ" },
      { label: "РџСЂРѕСЃСЂРѕС‡РµРЅРѕ", value: formatNumber(overdue), caption: "СЃСЂРѕРє СѓР¶Рµ РїСЂРѕС€РµР»" },
      { label: "РќРѕРІС‹Рµ СЃРёРіРЅР°Р»С‹", value: formatNumber(taskSignals.newSignals.length), caption: "РјРѕР¶РЅРѕ РїСЂРµРІСЂР°С‚РёС‚СЊ РІ Р·Р°РґР°С‡Рё" },
      ...getFormulaMetrics("tasks", doc, filteredTasks)
    ];
    const customHeader = renderCustomTableHeader("tasks", doc, escapeHtml);
    const tasksActionBar = renderActionBar(
      "tasks",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-task-new>РќРѕРІР°СЏ Р·Р°РґР°С‡Р°</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-sprint-new>РќРѕРІР°СЏ РёС‚РµСЂР°С†РёСЏ</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-task-generate-signals>РЎРѕР±СЂР°С‚СЊ РёР· СЂРёСЃРєРѕРІ</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="board">РљР°РЅР±Р°РЅ</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="table">Р›РµРЅС‚Р°</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="tasks">Р­РєСЃРїРѕСЂС‚ JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="tasks">РРјРїРѕСЂС‚ JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="tasks:task">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє Р·Р°РґР°С‡Рё</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="tasks:sprint">РЎР±СЂРѕСЃРёС‚СЊ С‡РµСЂРЅРѕРІРёРє РёС‚РµСЂР°С†РёРё</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("tasks")}
        ${renderMetricGrid(metrics)}
        <section class="workspace-panel workspace-panel--muted">
          <div class="panel-heading"><div><h4>РћРїРµСЂР°С†РёРѕРЅРЅС‹Рµ СЃРёРіРЅР°Р»С‹</h4><div class="compact-help">Р—РґРµСЃСЊ СЃРѕР±РёСЂР°СЋС‚СЃСЏ СЂРµР°Р»СЊРЅС‹Рµ СЂРёСЃРєРё РёР· CRM, РџСЂРѕРґР°Р¶ Рё РЎРєР»Р°РґР°, С‡С‚РѕР±С‹ РёС… РјРѕР¶РЅРѕ Р±С‹Р»Рѕ РѕРґРЅРёРј РґРµР№СЃС‚РІРёРµРј РїСЂРµРІСЂР°С‚РёС‚СЊ РІ Р·Р°РґР°С‡Рё.</div></div><div class="workspace-note">Р’СЃРµРіРѕ СЃРёРіРЅР°Р»РѕРІ: ${escapeHtml(formatNumber(taskSignals.total))}</div></div>
          <div class="workspace-stage-strip">
            <div class="workspace-stage-card"><span>РќРѕРІС‹С… Р·Р°РґР°С‡ Рє СЃРѕР·РґР°РЅРёСЋ</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.length))}</strong></div>
            <div class="workspace-stage-card"><span>РЈР¶Рµ Р·Р°РІРµРґРµРЅРѕ</span><strong>${escapeHtml(formatNumber(taskSignals.signals.filter((signal) => signal.alreadyExists).length))}</strong></div>
            <div class="workspace-stage-card"><span>РџСЂРёРѕСЂРёС‚РµС‚ urgent</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.filter((signal) => signal.priority === "urgent").length))}</strong></div>
            <div class="workspace-stage-card"><span>РџСЂРёРѕСЂРёС‚РµС‚ high</span><strong>${escapeHtml(formatNumber(taskSignals.newSignals.filter((signal) => signal.priority === "high").length))}</strong></div>
          </div>
          <div class="workspace-stack mt-3">
            ${(taskSignals.signals.slice(0, 8) || []).map((signal) => `<div class="workspace-list-item"><div><strong>${escapeHtml(signal.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(signal.family)} вЂў ${escapeHtml(signal.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")}</div></div><div class="text-end"><div class="workspace-tag ${signal.alreadyExists ? "workspace-tag--neutral" : signal.priority === "urgent" ? "workspace-tag--danger" : "workspace-tag--warning"}">${escapeHtml(signal.alreadyExists ? "СѓР¶Рµ РµСЃС‚СЊ" : signal.priority)}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(signal.dueDate))}</div></div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РћРїРµСЂР°С†РёРѕРЅРЅС‹С… СЃРёРіРЅР°Р»РѕРІ РїРѕРєР° РЅРµС‚.</div>'}
          </div>
        </section>
        ${renderViewTabs("tasks", doc, ui.tasks, escapeHtml)}
        ${buildModeTabs("tasks", escapeHtml)}
        ${tasksActionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="РџРѕРёСЃРє РїРѕ Р·Р°РґР°С‡Рµ, РІР»Р°РґРµР»СЊС†Сѓ, РёС‚РµСЂР°С†РёРё" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="status"><option value="all">Р’СЃРµ СЃС‚Р°С‚СѓСЃС‹</option>${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${filters.status === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="sprint"><option value="all">Р’СЃРµ РёС‚РµСЂР°С†РёРё</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${filters.sprint === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select>
            <select class="form-select" data-live-filter="owner"><option value="all">Р’СЃРµ РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рµ</option>${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-task-new>РќРѕРІР°СЏ Р·Р°РґР°С‡Р°</button><button class="btn btn-outline-dark" type="button" data-sprint-new>РќРѕРІР°СЏ РёС‚РµСЂР°С†РёСЏ</button>` : `<span class="workspace-note">Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕС‚РєР»СЋС‡РµРЅРѕ РґР»СЏ РІР°С€РµР№ СЂРѕР»Рё</span>`}
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="tasks">${ui.tasks.configOpen ? "РЎРєСЂС‹С‚СЊ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ" : "РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel("tasks", doc, ui.tasks, escapeHtml) : ""}
        ${modeIs(filters, "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editTask ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РґР°С‡Рё" : "РќРѕРІР°СЏ Р·Р°РґР°С‡Р°"}</h4><div class="compact-help">Р—Р°РґР°С‡Рё РјРѕР¶РЅРѕ РІРµСЃС‚Рё РїРѕ РѕС‚РґРµР»Р°Рј, РёРЅРёС†РёР°С‚РёРІР°Рј Рё РїСЂРѕРµРєС‚Р°Рј. Р‘С‹СЃС‚СЂС‹Р№ РїРµСЂРµРІРѕРґ РјРµР¶РґСѓ РєРѕР»РѕРЅРєР°РјРё РѕСЃС‚Р°РµС‚СЃСЏ РїСЂСЏРјРѕ РЅР° РєР°СЂС‚РѕС‡РєР°С….</div></div></div>
            ${canEdit ? `<form id="tasksTaskForm" class="workspace-form" data-draft-form="task"><input type="hidden" name="id" value="${escapeHtml(editTask?.id || "")}" /><div class="workspace-form-grid"><label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="title" value="${escapeHtml(editTask?.title || "")}" required /></label><label><span>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editTask?.owner || "")}" /></label><label><span>РЎС‚Р°С‚СѓСЃ</span><select class="form-select" name="status">${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${(editTask?.status || "backlog") === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select></label><label><span>РџСЂРёРѕСЂРёС‚РµС‚</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((priority) => `<option value="${escapeHtml(priority.key)}" ${(editTask?.priority || "medium") === priority.key ? "selected" : ""}>${escapeHtml(priority.label)}</option>`).join("")}</select></label><label><span>РС‚РµСЂР°С†РёСЏ</span><select class="form-select" name="sprintId"><option value="">Р‘РµР· РёС‚РµСЂР°С†РёРё</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${editTask?.sprintId === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label><label><span>РЎСЂРѕРє</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(editTask?.dueDate || ""))}" /></label></div><label class="permission-flag"><input class="form-check-input" type="checkbox" name="blocked" ${editTask?.blocked ? "checked" : ""} /><span>Р•СЃС‚СЊ Р±Р»РѕРєРµСЂ / РЅСѓР¶РЅР° РїРѕРјРѕС‰СЊ</span></label><label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(editTask?.note || "")}</textarea></label>${renderCustomFieldSection("tasks", doc, editTask, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editTask ? "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РґР°С‡Сѓ" : "Р”РѕР±Р°РІРёС‚СЊ Р·Р°РґР°С‡Сѓ"}</button><button class="btn btn-outline-secondary" type="button" data-task-new>РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button></div></form>` : renderAccessHint("tasks")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editSprint ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РёС‚РµСЂР°С†РёРё" : "РќРѕРІР°СЏ РёС‚РµСЂР°С†РёСЏ"}</h4><div class="compact-help">РС‚РµСЂР°С†РёСЏ РїРѕРјРѕРіР°РµС‚ РґРµСЂР¶Р°С‚СЊ РІ С„РѕРєСѓСЃРµ Р±Р»РёР¶Р°Р№С€РёР№ СЂР°Р±РѕС‡РёР№ С†РёРєР» Рё СЂР°СЃРїСЂРµРґРµР»СЏС‚СЊ Р·Р°РґР°С‡Рё РїРѕ СЌС‚Р°РїР°Рј.</div></div></div>
            ${canEdit ? `<form id="tasksSprintForm" class="workspace-form" data-draft-form="sprint"><input type="hidden" name="id" value="${escapeHtml(editSprint?.id || "")}" /><div class="workspace-form-grid"><label><span>РќР°Р·РІР°РЅРёРµ РёС‚РµСЂР°С†РёРё</span><input class="form-control" type="text" name="title" value="${escapeHtml(editSprint?.title || "")}" required /></label><label><span>РЎС‚Р°СЂС‚</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(editSprint?.startDate || ""))}" /></label><label><span>Р¤РёРЅРёС€</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(editSprint?.endDate || ""))}" /></label></div><label><span>Р¦РµР»СЊ РёС‚РµСЂР°С†РёРё</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(editSprint?.goal || "")}</textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editSprint ? "РЎРѕС…СЂР°РЅРёС‚СЊ РёС‚РµСЂР°С†РёСЋ" : "Р”РѕР±Р°РІРёС‚СЊ РёС‚РµСЂР°С†РёСЋ"}</button><button class="btn btn-outline-secondary" type="button" data-sprint-new>РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button></div></form>` : renderAccessHint("tasks")}
          </section>
        </div>` : ""}
        ${editTask ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РљРѕРЅС‚СѓСЂ Р·Р°РґР°С‡Рё</h4><div class="compact-help">Р•РґРёРЅР°СЏ РєР°СЂС‚РѕС‡РєР° Р·Р°РґР°С‡Рё: С‚РµРєСѓС‰РµРµ СЃРѕСЃС‚РѕСЏРЅРёРµ, Р±С‹СЃС‚СЂС‹Рµ РґРµР№СЃС‚РІРёСЏ Рё РІРµСЃСЊ СЃРѕСЃРµРґРЅРёР№ РєРѕРЅС‚РµРєСЃС‚ Р±РµР· РїРµСЂРµС…РѕРґРѕРІ РјРµР¶РґСѓ РјРѕРґСѓР»СЏРјРё.</div></div><div class="workspace-note">РћР±РЅРѕРІР»РµРЅРѕ ${escapeHtml(formatDate(editTask.updatedAt || editTask.createdAt))}</div></div>
            <div class="workspace-stage-strip">${editTaskOperationCards.map((card) => `<div class="workspace-stage-card"><span>${escapeHtml(card.label)}</span><strong>${escapeHtml(card.value)}</strong><small class="workspace-list-item__meta">${escapeHtml(card.caption)}</small></div>`).join("")}</div>
            <div class="workspace-card__actions mt-3">
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-set-status="${escapeHtml(editTask.id)}:${escapeHtml(editTask.status === "done" ? "todo" : "done")}">${editTask.status === "done" ? "Р’РµСЂРЅСѓС‚СЊ РІ СЂР°Р±РѕС‚Сѓ" : "РћС‚РјРµС‚РёС‚СЊ РІС‹РїРѕР»РЅРµРЅРЅРѕР№"}</button>` : ""}
              ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-toggle-blocked="${escapeHtml(editTask.id)}">${editTask.blocked ? "РЎРЅСЏС‚СЊ Р±Р»РѕРєРµСЂ" : "РџРѕСЃС‚Р°РІРёС‚СЊ Р±Р»РѕРєРµСЂ"}</button>` : ""}
              ${editTaskContext?.moduleKey === "sales" ? `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ РёСЃС‚РѕС‡РЅРёРє</button>` : editTaskContext?.entityId ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${editTaskContext.moduleKey}:${editTaskContext.entityId}`)}">РћС‚РєСЂС‹С‚СЊ РёСЃС‚РѕС‡РЅРёРє</button>` : ""}
              ${editTaskPrimaryRelated ? `<button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(editTaskPrimaryRelated.id)}">РћС‚РєСЂС‹С‚СЊ СЃРІСЏР·Р°РЅРЅСѓСЋ Р·Р°РґР°С‡Сѓ</button>` : ""}
            </div>
            <div class="workspace-stack mt-3">
              <div class="workspace-list-item">
                <div>
                  <strong>${escapeHtml(editTask.title || "Р—Р°РґР°С‡Р°")}</strong>
                  <div class="workspace-list-item__meta">${escapeHtml(editTask.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")} вЂў ${escapeHtml(editTask.sprint?.title || "Р‘РµР· РёС‚РµСЂР°С†РёРё")}</div>
                </div>
                <div class="text-end">
                  <div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(editTask.status).tone)}">${escapeHtml(getTaskStatusMeta(editTask.status).label)}</div>
                  <div class="workspace-list-item__meta mt-1">${escapeHtml(getPriorityLabel(editTask.priority))}</div>
                </div>
              </div>
              ${editTask.note ? `<div class="workspace-empty workspace-empty--tight">${escapeHtml(editTask.note)}</div>` : '<div class="workspace-empty workspace-empty--tight">РљРѕРјРјРµРЅС‚Р°СЂРёР№ Рє Р·Р°РґР°С‡Рµ РїРѕРєР° РЅРµ Р·Р°РїРѕР»РЅРµРЅ.</div>'}
              ${editTaskContext ? `<div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.title || "РСЃС‚РѕС‡РЅРёРє")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.subtitle || "РЎРІСЏР·Р°РЅРЅС‹Р№ РѕР±СЉРµРєС‚")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(editTaskContext.tone || "neutral")}">${escapeHtml(getTaskSourceLabel(editTaskContext))}</div></div></div>` : '<div class="workspace-empty workspace-empty--tight">Р—Р°РґР°С‡Р° РїРѕРєР° РЅРµ РїСЂРёРІСЏР·Р°РЅР° Рє CRM, СЃРєР»Р°РґСѓ РёР»Рё РїСЂРѕРґР°Р¶Р°Рј.</div>'}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Р›РµРЅС‚Р° Р·Р°РґР°С‡Рё</h4><div class="compact-help">Р—РґРµСЃСЊ СЃРѕР±РёСЂР°РµС‚СЃСЏ Р¶РёРІР°СЏ РёСЃС‚РѕСЂРёСЏ СЃР°РјРѕР№ Р·Р°РґР°С‡Рё Рё СЃРѕР±С‹С‚РёР№ РёР· РµС‘ РёСЃС‚РѕС‡РЅРёРєР°: СЃРґРµР»РєРё, РѕРїР»Р°С‚С‹, СЂРµР·РµСЂРІРѕРІ Рё СЃРєР»Р°РґСЃРєРёС… РґРІРёР¶РµРЅРёР№.</div></div><div class="workspace-note">РЎРѕР±С‹С‚РёР№: ${escapeHtml(formatNumber(editTaskTimeline.length))}</div></div>
            <div class="workspace-stack">${editTaskTimeline.slice(0, 12).map((event) => `<div class="workspace-list-item"><div><strong>${escapeHtml(event.title)}</strong><div class="workspace-list-item__meta">${escapeHtml(event.meta || "Р‘РµР· РґРµС‚Р°Р»РµР№")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(event.tone || "neutral")}">${escapeHtml(formatDate(event.date))}</div>${event.moduleKey === "sales" ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ</button></div>` : event.entityId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${event.moduleKey}:${event.entityId}`)}">РћС‚РєСЂС‹С‚СЊ</button></div>` : ""}</div></div>`).join("") || '<div class="workspace-empty workspace-empty--tight">РСЃС‚РѕСЂРёСЏ РїРѕ Р·Р°РґР°С‡Рµ РїРѕРєР° РїСѓСЃС‚Р°СЏ.</div>'}</div>
          </section>
        </div>` : ""}
        ${editTask && editTaskContext ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РСЃС‚РѕС‡РЅРёРє Р·Р°РґР°С‡Рё</h4><div class="compact-help">РљР°СЂС‚РѕС‡РєР° СЃРІСЏР·Рё РїРѕРјРѕРіР°РµС‚ РїРѕРЅСЏС‚СЊ, РёР· РєР°РєРѕРіРѕ Р±РёР·РЅРµСЃ-РєРѕРЅС‚РµРєСЃС‚Р° Р·Р°РґР°С‡Р° РїСЂРёС€Р»Р° Рё РєСѓРґР° РѕРЅР° РІР»РёСЏРµС‚.</div></div></div>
            <div class="workspace-stage-strip">
              <div class="workspace-stage-card"><span>РљРѕРЅС‚СѓСЂ</span><strong>${escapeHtml(editTaskContext.type === "crm" || editTaskContext.type === "crm-signal" ? "CRM" : editTaskContext.type === "warehouse" || editTaskContext.type === "warehouse-signal" ? "РЎРєР»Р°Рґ" : "РџСЂРѕРґР°Р¶Рё")}</strong></div>
              ${typeof editTaskContext.amount !== "undefined" ? `<div class="workspace-stage-card"><span>РЎСѓРјРјР°</span><strong>${escapeHtml(formatMoney(editTaskContext.amount || 0))}</strong></div>` : ""}
              ${typeof editTaskContext.available !== "undefined" ? `<div class="workspace-stage-card"><span>Р”РѕСЃС‚СѓРїРЅРѕ</span><strong>${escapeHtml(formatNumber(editTaskContext.available || 0))}</strong></div>` : ""}
              ${editTaskContext.stageLabel ? `<div class="workspace-stage-card"><span>РЎС‚Р°С‚СѓСЃ</span><strong>${escapeHtml(editTaskContext.stageLabel)}</strong></div>` : ""}
              ${editTaskContext.dueDate ? `<div class="workspace-stage-card"><span>РЎСЂРѕРє / РґР°С‚Р°</span><strong>${escapeHtml(formatDate(editTaskContext.dueDate))}</strong></div>` : ""}
            </div>
            <div class="workspace-stack mt-3">
              <div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.title || "РСЃС‚РѕС‡РЅРёРє")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.subtitle || "РЎРІСЏР·Р°РЅРЅС‹Р№ РѕР±СЉРµРєС‚ РїР»Р°С‚С„РѕСЂРјС‹")}</div></div><div class="text-end">${editTaskContext.moduleKey === "sales" ? `<div class="workspace-card__actions"><button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="sales">РћС‚РєСЂС‹С‚СЊ РџСЂРѕРґР°Р¶Рё</button></div>` : editTaskContext.entityId ? `<div class="workspace-card__actions"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="${escapeHtml(`${editTaskContext.moduleKey}:${editTaskContext.entityId}`)}">РћС‚РєСЂС‹С‚СЊ РёСЃС‚РѕС‡РЅРёРє</button></div>` : ""}</div></div>
              ${editTaskContext.order ? `<div class="workspace-list-item"><div><strong>${escapeHtml(editTaskContext.order.orderNumber || editTaskContext.order.title || "Р—Р°РєР°Р·")}</strong><div class="workspace-list-item__meta">${escapeHtml(editTaskContext.order.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")} вЂў ${escapeHtml(editTaskContext.order.manager || "Р‘РµР· РјРµРЅРµРґР¶РµСЂР°")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--accent">${escapeHtml(formatMoney(editTaskContext.order.amount || 0))}</div></div></div>` : ""}
              ${editTaskContext.note ? `<div class="workspace-empty workspace-empty--tight">${escapeHtml(editTaskContext.note)}</div>` : ""}
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>РЎРІСЏР·Р°РЅРЅС‹Рµ РґРµР№СЃС‚РІРёСЏ</h4><div class="compact-help">РЎРѕСЃРµРґРЅРёРµ Р·Р°РґР°С‡Рё Рё РґРІРёР¶РµРЅРёСЏ, РєРѕС‚РѕСЂС‹Рµ РѕС‚РЅРѕСЃСЏС‚СЃСЏ Рє С‚РѕРјСѓ Р¶Рµ РёСЃС‚РѕС‡РЅРёРєСѓ.</div></div></div>
            <div class="workspace-stack">
              ${editTaskContext.relatedTasks?.length ? editTaskContext.relatedTasks.slice(0, 5).map((task) => `<div class="workspace-list-item"><div><strong>${escapeHtml(task.title || "Р—Р°РґР°С‡Р°")}</strong><div class="workspace-list-item__meta">${escapeHtml(task.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")} вЂў ${escapeHtml(getTaskStatusMeta(task.status).label)}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--${escapeHtml(getTaskStatusMeta(task.status).tone)}">${escapeHtml(getPriorityLabel(task.priority))}</div><div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="tasks:${escapeHtml(task.id)}">РћС‚РєСЂС‹С‚СЊ</button></div></div></div>`).join("") : '<div class="workspace-empty workspace-empty--tight">Р”СЂСѓРіРёС… СЃРІСЏР·Р°РЅРЅС‹С… Р·Р°РґР°С‡ РїРѕРєР° РЅРµС‚.</div>'}
              ${editTaskContext.reservation?.rows?.length ? `<div><div class="panel-heading panel-heading--compact"><div><h4>Р РµР·РµСЂРІ РјР°С‚РµСЂРёР°Р»РѕРІ</h4><div class="compact-help">РњР°С‚РµСЂРёР°Р»С‹, СѓР¶Рµ Р·Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅРЅС‹Рµ РїРѕРґ СЃРІСЏР·Р°РЅРЅС‹Р№ РёСЃС‚РѕС‡РЅРёРє.</div></div></div><div class="workspace-stack">${sortByDateDesc(editTaskContext.reservation.rows, "date").slice(0, 4).map((movement) => { const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); return `<div class="workspace-list-item"><div><strong>${escapeHtml(item?.name || "РџРѕР·РёС†РёСЏ")}</strong><div class="workspace-list-item__meta">${escapeHtml(movement.kind === "release" ? "СЃРЅСЏС‚РёРµ СЂРµР·РµСЂРІР°" : "СЂРµР·РµСЂРІ")} вЂў ${escapeHtml(formatDate(movement.date))}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div>${movement.itemId ? `<div class="workspace-card__actions mt-2"><button class="btn btn-sm btn-outline-dark" type="button" data-linked-open="warehouse:${escapeHtml(movement.itemId)}">РћС‚РєСЂС‹С‚СЊ</button></div>` : ""}</div></div>`; }).join("")}</div></div>` : ""}
              ${editTaskContext.movements?.length ? `<div><div class="panel-heading panel-heading--compact"><div><h4>РџРѕСЃР»РµРґРЅРёРµ РґРІРёР¶РµРЅРёСЏ</h4><div class="compact-help">РЎРІРµР¶РёРµ РёР·РјРµРЅРµРЅРёСЏ РїРѕ СЃРєР»Р°РґСЃРєРѕР№ РїРѕР·РёС†РёРё, Рє РєРѕС‚РѕСЂРѕР№ РїСЂРёРІСЏР·Р°РЅР° Р·Р°РґР°С‡Р°.</div></div></div><div class="workspace-stack">${editTaskContext.movements.map((movement) => `<div class="workspace-list-item"><div><strong>${escapeHtml(WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind)?.label || movement.kind)}</strong><div class="workspace-list-item__meta">${escapeHtml(formatDate(movement.date))} вЂў ${escapeHtml(movement.note || "Р‘РµР· РєРѕРјРјРµРЅС‚Р°СЂРёСЏ")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div></div></div>`).join("")}</div></div>` : ""}
            </div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "form") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>РС‚РµСЂР°С†РёРё</h4><div class="compact-help">РўРµРєСѓС‰РёР№ Р°РєС‚РёРІРЅС‹Р№ С†РёРєР»: ${escapeHtml(activeSprint?.title || "РЅРµ РІС‹Р±СЂР°РЅ")}</div></div></div>
          <div class="workspace-sprint-strip">${sprintOptions.length ? sprintOptions.map((sprint) => { const sprintTasks = taskList.filter((task) => task.sprintId === sprint.id); return `<article class="workspace-sprint-card ${activeSprint?.id === sprint.id ? "active" : ""}"><div class="workspace-card__head"><strong>${escapeHtml(sprint.title)}</strong><span>${escapeHtml(String(sprintTasks.length))}</span></div><div class="workspace-card__meta">${escapeHtml(formatDate(sprint.startDate))} вЂ” ${escapeHtml(formatDate(sprint.endDate))}</div>${sprint.goal ? `<div class="workspace-card__note">${escapeHtml(sprint.goal)}</div>` : ""}<div class="workspace-card__actions mt-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-sprint-edit="${escapeHtml(sprint.id)}">РР·РјРµРЅРёС‚СЊ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-sprint-delete="${escapeHtml(sprint.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">РС‚РµСЂР°С†РёРё РїРѕРєР° РЅРµ СЃРѕР·РґР°РЅС‹.</div>'}</div>
        </section>` : ""}
        ${modeIs(filters, "board") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>РљР°РЅР±Р°РЅ</h4><div class="compact-help">РљР°СЂС‚РѕС‡РєРё РѕС‚СЂР°Р¶Р°СЋС‚ С‚РµРєСѓС‰СѓСЋ Р·Р°РіСЂСѓР·РєСѓ РєРѕРјР°РЅРґС‹ Рё РґР°СЋС‚ Р±С‹СЃС‚СЂС‹Р№ РґРѕСЃС‚СѓРї Рє РїСЂР°РІРєРµ СЃС‚Р°С‚СѓСЃР°.</div></div><div class="workspace-note">РџРѕРєР°Р·Р°РЅРѕ: ${escapeHtml(String(filteredTasks.length))}</div></div>
          <div class="workspace-board workspace-board--tasks">${TASK_STATUSES.map((status) => { const laneTasks = filteredTasks.filter((task) => task.status === status.key); return `<article class="workspace-lane"><div class="workspace-lane__head"><strong>${escapeHtml(status.label)}</strong><span>${escapeHtml(String(laneTasks.length))}</span></div><div class="workspace-lane__body">${laneTasks.length ? laneTasks.map((task) => { const integration = getTaskIntegrationMeta(task); return `<article class="workspace-card workspace-card--${escapeHtml(status.tone)}"><div class="workspace-card__head"><strong>${escapeHtml(task.title || "Р—Р°РґР°С‡Р°")}</strong><span>${escapeHtml(getPriorityLabel(task.priority))}</span></div><div class="workspace-card__meta">${escapeHtml(task.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ")} вЂў СЃСЂРѕРє ${escapeHtml(formatDate(task.dueDate))}</div><div class="workspace-card__meta">${escapeHtml(task.sprint?.title || "Р‘РµР· РёС‚РµСЂР°С†РёРё")}</div>${integration ? `<div class="workspace-card__meta">${escapeHtml(integration.label)} вЂў <button class="btn btn-link btn-sm p-0 align-baseline" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">${escapeHtml(modules[integration.moduleKey]?.title || integration.moduleKey)}</button></div>` : ""}${task.note ? `<div class="workspace-card__note">${escapeHtml(task.note)}</div>` : ""}${renderCustomCardSection("tasks", doc, task, escapeHtml)}${task.blocked ? '<div class="workspace-tag workspace-tag--danger mt-2">Р•СЃС‚СЊ Р±Р»РѕРєРµСЂ</div>' : ""}<div class="workspace-card__footer">${canEdit ? `<select class="form-select form-select-sm workspace-inline-select" data-task-status-select="${escapeHtml(task.id)}">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === task.status ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>` : `<span class="workspace-tag workspace-tag--${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>`}<div class="workspace-card__actions">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">РР·РјРµРЅРёС‚СЊ</button><button class="btn btn-sm btn-outline-secondary" type="button" data-task-duplicate="${escapeHtml(task.id)}">РљРѕРїРёСЏ</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-task-delete="${escapeHtml(task.id)}">РЈРґР°Р»РёС‚СЊ</button>` : ""}</div></div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">РџСѓСЃС‚Рѕ</div>'}</div></article>`; }).join("")}</div>
        </section>` : ""}
        ${modeIs(filters, "table") ? `<section class="workspace-panel">
          <div class="panel-heading"><div><h4>Р›РµРЅС‚Р° Р·Р°РґР°С‡</h4><div class="compact-help">РќРёР¶РЅСЏСЏ С‚Р°Р±Р»РёС†Р° РїРѕР»РµР·РЅР° РґР»СЏ СЃРѕСЂС‚РёСЂРѕРІРєРё Рё Р±С‹СЃС‚СЂРѕРіРѕ РїРµСЂРµС…РѕРґР° РІ РЅСѓР¶РЅСѓСЋ РєР°СЂС‚РѕС‡РєСѓ.</div></div></div>
          <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Р—Р°РґР°С‡Р°</th><th>РЎС‚Р°С‚СѓСЃ</th><th>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</th><th>РС‚РµСЂР°С†РёСЏ</th><th>РЎСЂРѕРє</th><th>РџСЂРёРѕСЂРёС‚РµС‚</th>${customHeader}<th></th></tr></thead><tbody>${filteredTasks.length ? filteredTasks.map((task) => { const status = getTaskStatusMeta(task.status); const integration = getTaskIntegrationMeta(task); return `<tr><td><strong>${escapeHtml(task.title || "Р—Р°РґР°С‡Р°")}</strong>${task.blocked ? '<div class="workspace-table__sub text-danger">Р•СЃС‚СЊ Р±Р»РѕРєРµСЂ</div>' : ""}${integration ? `<div class="workspace-table__sub">${escapeHtml(integration.label)}</div>` : ""}</td><td>${escapeHtml(status.label)}</td><td>${escapeHtml(task.owner || "вЂ”")}</td><td>${escapeHtml(task.sprint?.title || "вЂ”")}</td><td>${escapeHtml(formatDate(task.dueDate))}</td><td>${escapeHtml(getPriorityLabel(task.priority))}</td>${renderCustomTableCells("tasks", doc, task, escapeHtml)}<td class="text-end">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">РћС‚РєСЂС‹С‚СЊ</button>` : ""}${integration ? `<button class="btn btn-sm btn-outline-secondary ms-2" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">РСЃС‚РѕС‡РЅРёРє</button>` : ""}</td></tr>`; }).join("") : `<tr><td colspan="${8 + getVisibleCustomFields("tasks", doc, "showInTable").length}" class="text-muted">РџРѕ С‚РµРєСѓС‰РёРј С„РёР»СЊС‚СЂР°Рј Р·Р°РґР°С‡ РЅРµС‚.</td></tr>`}</tbody></table></div>
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
    await saveDocument("crm", { ...doc, deals }, index >= 0 ? "РЎРґРµР»РєР° РѕР±РЅРѕРІР»РµРЅР°." : "РЎРґРµР»РєР° РґРѕР±Р°РІР»РµРЅР°.");
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
      unit: compactText(formData.get("unit")) || "С€С‚",
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
    await saveDocument("warehouse", { ...doc, items }, index >= 0 ? "РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР° РѕР±РЅРѕРІР»РµРЅР°." : "РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР° РґРѕР±Р°РІР»РµРЅР°.");
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
    if (!record.itemId) throw new Error("Р’С‹Р±РµСЂРёС‚Рµ РїРѕР·РёС†РёСЋ РґР»СЏ РґРІРёР¶РµРЅРёСЏ.");
    ui.warehouse.movementItemId = record.itemId;
    ui.warehouse.modal = "";
    clearDraft("warehouse", "movement");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, movements: [record, ...(doc.movements || [])] }, "Р”РІРёР¶РµРЅРёРµ РїРѕ СЃРєР»Р°РґСѓ СЃРѕС…СЂР°РЅРµРЅРѕ.");
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
      unit: compactText(formData.get("unit")) || "С€С‚",
      purchasePrice: toNumber(formData.get("purchasePrice")),
      salePrice: toNumber(formData.get("salePrice")),
      note: compactText(formData.get("note")),
      custom: existing?.custom && typeof existing.custom === "object" ? existing.custom : {},
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    if (!record.name) throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ С‚РѕРІР°СЂР°.");
    const products = [...(doc.products || [])];
    const index = products.findIndex((item) => item.id === record.id);
    if (index >= 0) products[index] = record;
    else products.unshift(record);
    ui.warehouse.productEditId = null;
    ui.warehouse.modal = "";
    ui.warehouse.mode = "products";
    clearDraft("warehouse", "product");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, products }, index >= 0 ? "РўРѕРІР°СЂ РѕР±РЅРѕРІР»РµРЅ." : "РўРѕРІР°СЂ РґРѕР±Р°РІР»РµРЅ.");
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
    if (!record.supplier) throw new Error("РЈРєР°Р¶РёС‚Рµ РїРѕСЃС‚Р°РІС‰РёРєР°.");
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
        note: record.note || `РџСЂРёРµРјРєР° РїРѕ Р·Р°РєСѓРїРєРµ ${record.number}`,
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
      purchaseIndex >= 0 ? "Р—Р°РєСѓРїРєР° РѕР±РЅРѕРІР»РµРЅР°." : "Р—Р°РєСѓРїРєР° РґРѕР±Р°РІР»РµРЅР°."
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
    if (!record.account) throw new Error("РЈРєР°Р¶РёС‚Рµ СЃС‡РµС‚ РёР»Рё РєР°СЃСЃСѓ.");
    if (!record.category) throw new Error("РЈРєР°Р¶РёС‚Рµ СЃС‚Р°С‚СЊСЋ РѕРїРµСЂР°С†РёРё.");
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
      index >= 0 ? "РћРїРµСЂР°С†РёСЏ РѕР±РЅРѕРІР»РµРЅР°." : "РћРїРµСЂР°С†РёСЏ СЃРѕС…СЂР°РЅРµРЅР°."
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
    if (!record.title) throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ Р·Р°РґР°РЅРёСЏ.");
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
      index >= 0 ? "РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ РѕР±РЅРѕРІР»РµРЅРѕ." : "РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ РґРѕР±Р°РІР»РµРЅРѕ."
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
              title: "РљР°СЂС‚РѕС‡РєР° Р·Р°РґР°С‡Рё РѕР±РЅРѕРІР»РµРЅР°",
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
              title: "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°",
              meta: "РљР°СЂС‚РѕС‡РєР° Р·Р°РІРµРґРµРЅР° РІСЂСѓС‡РЅСѓСЋ РІ С‚Р°СЃРєС‚СЂРµРєРµСЂРµ.",
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
    await saveDocument("tasks", { ...doc, tasks }, index >= 0 ? "Р—Р°РґР°С‡Р° РѕР±РЅРѕРІР»РµРЅР°." : "Р—Р°РґР°С‡Р° РґРѕР±Р°РІР»РµРЅР°.");
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
    await saveDocument("tasks", { ...doc, sprints }, index >= 0 ? "РС‚РµСЂР°С†РёСЏ РѕР±РЅРѕРІР»РµРЅР°." : "РС‚РµСЂР°С†РёСЏ РґРѕР±Р°РІР»РµРЅР°.");
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
      throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ Рё РєР»СЋС‡ СЃРїСЂР°РІРѕС‡РЅРёРєР°.");
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
    await saveDocument("directories", { ...doc, lists }, existingIndex >= 0 ? "РЎРїСЂР°РІРѕС‡РЅРёРє РѕР±РЅРѕРІР»С‘РЅ." : "РЎРїСЂР°РІРѕС‡РЅРёРє СЃРѕР·РґР°РЅ.");
    await rerenderCurrentModule();
  }

  async function handleDirectoriesOptionSubmit(form) {
    const doc = await ensureDocument("directories");
    const formData = new FormData(form);
    const listKey = sanitizeKey(formData.get("key"));
    const option = compactText(formData.get("option"));
    if (!listKey || !option) {
      throw new Error("Р’С‹Р±РµСЂРёС‚Рµ СЃРїСЂР°РІРѕС‡РЅРёРє Рё СѓРєР°Р¶РёС‚Рµ Р·РЅР°С‡РµРЅРёРµ.");
    }
    const lists = [...(doc.lists || [])];
    const index = lists.findIndex((list) => list.key === listKey || list.id === listKey);
    if (index < 0) {
      throw new Error("РЎРїСЂР°РІРѕС‡РЅРёРє РЅРµ РЅР°Р№РґРµРЅ.");
    }
    lists[index] = { ...lists[index], options: [...new Set([...(lists[index].options || []), option])] };
    ui.directories.activeListId = lists[index].key;
    ui.directories.modal = "";
    persistUiState("directories");
    await saveDocument("directories", { ...doc, lists }, "Р—РЅР°С‡РµРЅРёРµ РґРѕР±Р°РІР»РµРЅРѕ РІ СЃРїСЂР°РІРѕС‡РЅРёРє.");
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
      setStatus("РќРѕРІС‹С… Р·Р°РєР°Р·РѕРІ РёР· РџСЂРѕРґР°Р¶ РґР»СЏ CRM РЅРµС‚.", "success");
      return;
    }

    importableOrders.forEach((order) => {
      nextDeals.unshift({
        id: createId("deal"),
        title: compactText(order.title || `Р—Р°РєР°Р· ${order.orderNumber}`),
        client: compactText(order.client),
        channel: compactText(order.leadChannel || order.salesChannel),
        owner: compactText(order.manager),
        stage: deriveSalesDealStage(order),
        amount: toNumber(order.amount),
        deadline: normalizeDateInput(order.deliveryDate || order.invoiceDate || order.createdAt),
        note: `РРјРїРѕСЂС‚ РёР· РџСЂРѕРґР°Р¶. Р—Р°РєР°Р· ${compactText(order.orderNumber || "Р±РµР· РЅРѕРјРµСЂР°")}${order.city ? ` вЂў ${order.city}` : ""}${order.status ? ` вЂў СЃС‚Р°С‚СѓСЃ: ${order.status}` : ""}.`,
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
    await saveDocument("crm", { ...doc, deals: nextDeals }, `РР· РџСЂРѕРґР°Р¶ РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ ${importableOrders.length} СЃРґРµР»РѕРє.`);
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
        name: `РњР°С‚РµСЂРёР°Р» ${entry.sku}`,
        sku: entry.sku,
        category: "РРјРїРѕСЂС‚ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ",
        unit: "РµРґ.",
        openingStock: 0,
        minStock: Math.max(1, Math.ceil(toNumber(entry.qtyTotal))),
        note: `РЎРѕР·РґР°РЅРѕ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ. РСЃС‚РѕС‡РЅРёРєРё: ${entry.sources.join(", ")}.`,
        custom: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

    if (!newItems.length) {
      setStatus("Р’СЃРµ Р°СЂС‚РёРєСѓР»С‹ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ СѓР¶Рµ Р·Р°РІРµРґРµРЅС‹ РЅР° СЃРєР»Р°РґРµ.", "success");
      return;
    }

    ui.warehouse.mode = "catalog";
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, items: [...newItems, ...(doc.items || [])] }, `РќР° СЃРєР»Р°Рґ РґРѕР±Р°РІР»РµРЅРѕ ${newItems.length} РїРѕР·РёС†РёР№ РёР· РєР°Р»СЊРєСѓР»СЏС‚РѕСЂРѕРІ.`);
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
            title: "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР° РёР· РѕРїРµСЂР°С†РёРѕРЅРЅРѕРіРѕ СЃРёРіРЅР°Р»Р°",
            meta: `${signal.family} вЂў ${signal.note}`,
            tone: signal.priority === "urgent" ? "danger" : "warning",
            moduleKey: "tasks"
          })
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

    if (!records.length) {
      setStatus("РќРѕРІС‹С… Р·Р°РґР°С‡ РёР· СЂРёСЃРєРѕРІ РЅРµ РЅР°Р№РґРµРЅРѕ.", "success");
      return;
    }

    ui.tasks.mode = "table";
    persistUiState("tasks");
    await saveDocument("tasks", { ...doc, tasks: [...records, ...(doc.tasks || [])] }, `РЎРѕР·РґР°РЅРѕ ${records.length} Р·Р°РґР°С‡ РёР· РѕРїРµСЂР°С†РёРѕРЅРЅС‹С… СЃРёРіРЅР°Р»РѕРІ.`);
    await rerenderCurrentModule();
  }

  async function createTaskFromDeal(dealId) {
    const crmDoc = await ensureDocument("crm");
    const tasksDoc = await ensureDocument("tasks");
    const deal = (crmDoc.deals || []).find((entry) => entry.id === dealId);
    if (!deal) {
      setStatus("РЎРґРµР»РєР° РЅРµ РЅР°Р№РґРµРЅР°.", "error");
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
      setStatus("РћС‚РєСЂС‹РІР°СЋ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰СѓСЋ Р·Р°РґР°С‡Сѓ РїРѕ СЃРґРµР»РєРµ.", "success");
      return;
    }
    const sprintId = getCurrentActiveSprintId(tasksDoc);
    const record = {
      id: createId("task"),
      title: `РЎРґРµР»РєР°: ${compactText(deal.title || deal.client || "Р±РµР· РЅР°Р·РІР°РЅРёСЏ")}`,
      owner: compactText(deal.owner),
      status: "todo",
      priority: deal.stage === "production" ? "urgent" : "high",
      sprintId,
      dueDate: normalizeDateInput(deal.deadline) || todayString(),
      blocked: false,
      note: `РЎРѕР·РґР°РЅРѕ РёР· CRM. РљР»РёРµРЅС‚: ${compactText(deal.client || "РЅРµ СѓРєР°Р·Р°РЅ")}. РЎС‚Р°РґРёСЏ: ${getCrmStageMeta(deal.stage).label}.`,
      custom: {},
      integration: {
        sourceApp: "platform_crm_manual",
        sourceKey,
        dealId: deal.id
      },
      sourceKey,
      history: [
        createTaskHistoryEntry({
          title: "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР° РёР· CRM",
          meta: `РЎРґРµР»РєР°: ${compactText(deal.title || deal.client || "Р±РµР· РЅР°Р·РІР°РЅРёСЏ")} вЂў ${getCrmStageMeta(deal.stage).label}`,
          tone: deal.stage === "production" ? "warning" : "info",
          moduleKey: "crm",
          entityId: deal.id
        })
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("tasks", { ...tasksDoc, tasks: [record, ...(tasksDoc.tasks || [])] }, "Р—Р°РґР°С‡Р° РїРѕ СЃРґРµР»РєРµ СЃРѕР·РґР°РЅР°.");
    rerenderDashboard();
    await rerenderCurrentModule();
  }

  async function createTaskFromWarehouseItem(itemId) {
    const warehouseDoc = await ensureDocument("warehouse");
    const tasksDoc = await ensureDocument("tasks");
    const item = (warehouseDoc.items || []).find((entry) => entry.id === itemId);
    if (!item) {
      setStatus("РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР° РЅРµ РЅР°Р№РґРµРЅР°.", "error");
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
      setStatus("РћС‚РєСЂС‹РІР°СЋ СѓР¶Рµ СЃСѓС‰РµСЃС‚РІСѓСЋС‰СѓСЋ Р·Р°РґР°С‡Сѓ РїРѕ РїРѕР·РёС†РёРё СЃРєР»Р°РґР°.", "success");
      return;
    }
    const sprintId = getCurrentActiveSprintId(tasksDoc);
    const record = {
      id: createId("task"),
      title: `РЎРєР»Р°Рґ: ${compactText(item.name || item.sku || "РїРѕР·РёС†РёСЏ")}`,
      owner: "Р—Р°РєСѓРїРєРё",
      status: "todo",
      priority: "high",
      sprintId,
      dueDate: todayString(),
      blocked: false,
      note: `РЎРѕР·РґР°РЅРѕ РёР· СЃРєР»Р°РґР°. SKU: ${compactText(item.sku || "вЂ”")}. РњРёРЅРёРјСѓРј: ${formatNumber(item.minStock || 0)}.`,
      custom: {},
      integration: {
        sourceApp: "platform_warehouse_manual",
        sourceKey,
        itemId: item.id
      },
      sourceKey,
      history: [
        createTaskHistoryEntry({
          title: "Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР° РёР· СЃРєР»Р°РґР°",
          meta: `РџРѕР·РёС†РёСЏ: ${compactText(item.name || item.sku || "Р±РµР· РЅР°Р·РІР°РЅРёСЏ")} вЂў РјРёРЅРёРјСѓРј ${formatNumber(item.minStock || 0)}`,
          tone: "warning",
          moduleKey: "warehouse",
          entityId: item.id
        })
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("tasks", { ...tasksDoc, tasks: [record, ...(tasksDoc.tasks || [])] }, "Р—Р°РґР°С‡Р° РїРѕ РїРѕР·РёС†РёРё СЃРєР»Р°РґР° СЃРѕР·РґР°РЅР°.");
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
      throw new Error("Р’С‹Р±РµСЂРёС‚Рµ СЃРґРµР»РєСѓ, РїРѕР·РёС†РёСЋ СЃРєР»Р°РґР° Рё РєРѕР»РёС‡РµСЃС‚РІРѕ.");
    }
    const deal = (crmDoc.deals || []).find((entry) => entry.id === dealId);
    const item = (warehouseDoc.items || []).find((entry) => entry.id === itemId);
    if (!deal || !item) {
      throw new Error("РЎРґРµР»РєР° РёР»Рё РїРѕР·РёС†РёСЏ СЃРєР»Р°РґР° РЅРµ РЅР°Р№РґРµРЅС‹.");
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
      note: compactText(formData.get("note")) || `Р РµР·РµСЂРІ РїРѕРґ СЃРґРµР»РєСѓ ${compactText(deal.title || deal.client || "Р±РµР· РЅР°Р·РІР°РЅРёСЏ")}`,
      integration: {
        sourceApp: "platform_crm_manual",
        sourceKey: getCrmDealSourceKey(deal.id),
        dealId: deal.id,
        itemId: item.id
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await saveDocument("warehouse", { ...warehouseDoc, movements: [movement, ...(warehouseDoc.movements || [])] }, "Р РµР·РµСЂРІ РїРѕРґ СЃРґРµР»РєСѓ СЃРѕР·РґР°РЅ.");
    await rerenderCurrentModule();
  }

  async function handleBuilderSubmit(moduleKey, form) {
    const doc = await ensureDocument(moduleKey);
    const formData = new FormData(form);
    const action = form.dataset.builderAction;

    if (action === "view") {
      const label = compactText(formData.get("label"));
      if (!label) throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ РІРєР»Р°РґРєРё.");
      const filterKeys = Object.keys(getDefaultFilters(moduleKey));
      const nextView = {
        id: sanitizeKey(label) || createId("view"),
        label,
        filters: Object.fromEntries(filterKeys.map((key) => [key, ui[moduleKey][key]]))
      };
      const views = [createDefaultView(moduleKey), ...(doc.builder.views || []).filter((view) => view.id !== "default" && view.id !== nextView.id), nextView];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, views } }, "Р’РєР»Р°РґРєР° СЃРѕС…СЂР°РЅРµРЅР°.");
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
      if (!field) throw new Error("РЈРєР°Р¶РёС‚Рµ РєР»СЋС‡ Рё РїРѕРґРїРёСЃСЊ РїРѕР»СЏ.");
      const fields = [...(doc.builder.fields || []).filter((item) => item.key !== field.key), field];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, fields } }, "РџРѕР»Рµ РґРѕР±Р°РІР»РµРЅРѕ РІ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ.");
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
      if (!formula || !formula.expression) throw new Error("РЈРєР°Р¶РёС‚Рµ РєР»СЋС‡, РЅР°Р·РІР°РЅРёРµ Рё С„РѕСЂРјСѓР»Сѓ.");
      const formulas = [...(doc.builder.formulas || []).filter((item) => item.key !== formula.key), formula];
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, formulas } }, "Р¤РѕСЂРјСѓР»Р° РґРѕР±Р°РІР»РµРЅР°.");
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return;
    }

    if (action === "schema") {
      const rawSchema = compactText(formData.get("schema"));
      if (!rawSchema) {
        throw new Error("Р’СЃС‚Р°РІСЊС‚Рµ JSON-СЃС…РµРјСѓ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂР°.");
      }
      let parsed;
      try {
        parsed = JSON.parse(rawSchema);
      } catch (error) {
        throw new Error(`JSON РЅРµ СЂР°СЃРїРѕР·РЅР°РЅ: ${error.message || "РѕС€РёР±РєР° СЃРёРЅС‚Р°РєСЃРёСЃР°"}`);
      }
      const builder = normalizeBuilderSchema(moduleKey, parsed);
      await saveDocument(moduleKey, { ...doc, builder }, "JSON-СЃС…РµРјР° РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂР° СЃРѕС…СЂР°РЅРµРЅР°.");
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
            <button class="btn btn-sm btn-outline-secondary" type="button" data-live-modal-close>Р—Р°РєСЂС‹С‚СЊ</button>
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
      "Р РµР·РµСЂРІ РјР°С‚РµСЂРёР°Р»РѕРІ РїРѕРґ СЃРґРµР»РєСѓ",
      `<form id="crmReserveForm" class="workspace-form" data-draft-form="reserve">
        <div class="workspace-form-grid">
          <label><span>РЎРґРµР»РєР°</span><select class="form-select" name="dealId" required><option value="">Р’С‹Р±РµСЂРёС‚Рµ СЃРґРµР»РєСѓ</option>${reserveDealOptions.map((deal) => `<option value="${escapeHtml(deal.id)}" ${selectedDealId === deal.id ? "selected" : ""}>${escapeHtml(deal.title || deal.client || "РЎРґРµР»РєР°")} вЂў ${escapeHtml(deal.client || "вЂ”")}</option>`).join("")}</select></label>
          <label><span>РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР°</span><select class="form-select" name="itemId" required><option value="">Р’С‹Р±РµСЂРёС‚Рµ РјР°С‚РµСЂРёР°Р»</option>${(warehouseDoc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${compactText(draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""} вЂў РґРѕСЃС‚СѓРїРЅРѕ ${escapeHtml(formatNumber(toNumber(item.available || item.openingStock || 0)))}</option>`).join("")}</select></label>
          <label><span>РљРѕР»РёС‡РµСЃС‚РІРѕ</span><input class="form-control" type="number" min="1" step="1" name="qty" value="${escapeHtml(compactText(draft?.qty || ""))}" required /></label>
          <label><span>Р”Р°С‚Р°</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draft?.date || todayString()))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="3" placeholder="РќР°РїСЂРёРјРµСЂ: СЂРµР·РµСЂРІ РїРѕРґ РїСЂРѕРёР·РІРѕРґСЃС‚РІРѕ РёР»Рё РјРѕРЅС‚Р°Р¶">${escapeHtml(draftValue("", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Р РµР·РµСЂРІРёСЂРѕРІР°С‚СЊ</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РћС‚РґРµР»СЊРЅРѕРµ РѕРєРЅРѕ РґР»СЏ Р±С‹СЃС‚СЂРѕРіРѕ СЂРµР·РµСЂРІР° РјР°С‚РµСЂРёР°Р»РѕРІ РїРѕРґ СЃРґРµР»РєСѓ Р±РµР· РїРµСЂРµРіСЂСѓР·Р° РѕСЃРЅРѕРІРЅРѕРіРѕ СЌРєСЂР°РЅР°."
    );
  }

  function renderDirectoriesListModal(doc) {
    const selectedList =
      (doc.lists || []).find((list) => list.id === ui.directories.activeListId || list.key === ui.directories.activeListId) ||
      null;
    return renderWorkspaceModalShell(
      selectedList ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ СЃРїСЂР°РІРѕС‡РЅРёРєР°" : "РќРѕРІС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє",
      `<form id="directoriesListForm" class="workspace-form">
        <input type="hidden" name="id" value="${escapeHtml(selectedList?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="title" value="${escapeHtml(selectedList?.title || "")}" placeholder="РќР°РїСЂРёРјРµСЂ: РљР°РЅР°Р»С‹ CRM" required /></label>
          <label><span>РљР»СЋС‡</span><input class="form-control" type="text" name="key" value="${escapeHtml(selectedList?.key || "")}" placeholder="crm_channels" required /></label>
        </div>
        <label><span>РћРїРёСЃР°РЅРёРµ</span><textarea class="form-control" name="description" rows="3" placeholder="Р“РґРµ Рё РґР»СЏ С‡РµРіРѕ РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ СЌС‚РѕС‚ СЃРїРёСЃРѕРє">${escapeHtml(selectedList?.description || "")}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${selectedList ? "РЎРѕС…СЂР°РЅРёС‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРє" : "РЎРѕР·РґР°С‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРє"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РЎРїСЂР°РІРѕС‡РЅРёРє СЃРѕР·РґР°С‘С‚СЃСЏ РѕРґРёРЅ СЂР°Р· Рё РїРѕС‚РѕРј РёСЃРїРѕР»СЊР·СѓРµС‚СЃСЏ РІ С„РѕСЂРјР°С… CRM, СЃРєР»Р°РґР°, Р·Р°РґР°С‡ Рё РґСЂСѓРіРёС… СЂР°Р·РґРµР»РѕРІ."
    );
  }

  function renderDirectoriesOptionModal(doc) {
    const selectedList =
      (doc.lists || []).find((list) => list.id === ui.directories.activeListId || list.key === ui.directories.activeListId) ||
      null;
    if (!selectedList) {
      return renderWorkspaceModalShell(
        "РЎРЅР°С‡Р°Р»Р° РІС‹Р±РµСЂРёС‚Рµ СЃРїСЂР°РІРѕС‡РЅРёРє",
        `<div class="workspace-empty workspace-empty--tight">Р’С‹Р±РµСЂРёС‚Рµ СЃРїСЂР°РІРѕС‡РЅРёРє РІ РєР°С‚Р°Р»РѕРіРµ, Р° Р·Р°С‚РµРј РґРѕР±Р°РІР»СЏР№С‚Рµ Р·РЅР°С‡РµРЅРёСЏ.</div>`,
        "Р—РЅР°С‡РµРЅРёСЏ РІСЃРµРіРґР° РґРѕР±Р°РІР»СЏСЋС‚СЃСЏ РІ РєРѕРЅРєСЂРµС‚РЅС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє."
      );
    }
    return renderWorkspaceModalShell(
      "РќРѕРІРѕРµ Р·РЅР°С‡РµРЅРёРµ СЃРїСЂР°РІРѕС‡РЅРёРєР°",
      `<form id="directoriesOptionForm" class="workspace-form">
        <input type="hidden" name="key" value="${escapeHtml(selectedList.key)}" />
        <label><span>РЎРїСЂР°РІРѕС‡РЅРёРє</span><input class="form-control" type="text" value="${escapeHtml(selectedList.title)}" disabled /></label>
        <label><span>РќРѕРІРѕРµ Р·РЅР°С‡РµРЅРёРµ</span><input class="form-control" type="text" name="option" placeholder="Р”РѕР±Р°РІРёС‚СЊ Р·РЅР°С‡РµРЅРёРµ" required /></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Р”РѕР±Р°РІРёС‚СЊ Р·РЅР°С‡РµРЅРёРµ</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "Р—РЅР°С‡РµРЅРёРµ СЃСЂР°Р·Сѓ РїРѕСЏРІРёС‚СЃСЏ РІ РІС‹РїР°РґР°СЋС‰РёС… СЃРїРёСЃРєР°С… РїР»Р°С‚С„РѕСЂРјС‹."
    );
  }

  function renderCrmCreateModal(doc) {
    const existing = (doc.deals || []).find((deal) => deal.id === ui.crm.editId) || null;
    const draft = readDraft("crm", "deal");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ СЃРґРµР»РєРё" : "РќРѕРІР°СЏ СЃРґРµР»РєР°",
      `<form id="crmDealModalForm" class="workspace-form" data-draft-form="deal">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ СЃРґРµР»РєРё</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>РљР»РёРµРЅС‚</span><input class="form-control" type="text" name="client" value="${escapeHtml(draftValue(existing?.client || "", draft?.client))}" required /></label>
          <label><span>РљР°РЅР°Р»</span><input class="form-control" type="text" name="channel" value="${escapeHtml(draftValue(existing?.channel || "", draft?.channel))}" /></label>
          <label><span>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</span><input class="form-control" type="text" name="owner" value="${escapeHtml(draftValue(existing?.owner || "", draft?.owner))}" /></label>
          <label><span>РЎС‚Р°РґРёСЏ</span><select class="form-select" name="stage">${CRM_STAGES.map((stage) => `<option value="${escapeHtml(stage.key)}" ${((draftValue(existing?.stage || "lead", draft?.stage || "lead")) === stage.key) ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("")}</select></label>
          <label><span>РЎСѓРјРјР°, в‚Ѕ</span><input class="form-control" type="number" min="0" step="1" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount || ""))}" /></label>
          <label><span>РЎСЂРѕРє</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(normalizeDateInput(draftValue(existing?.deadline || "", draft?.deadline || "")))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("crm", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ" : "РЎРѕС…СЂР°РЅРёС‚СЊ СЃРґРµР»РєСѓ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      existing ? "РџРѕР»РЅР°СЏ РєР°СЂС‚РѕС‡РєР° СЃРґРµР»РєРё РІРѕ РІСЃРїР»С‹РІР°СЋС‰РµРј РѕРєРЅРµ Р±РµР· СѓС…РѕРґР° РёР· С‚РµРєСѓС‰РµРіРѕ СЂРµР¶РёРјР°." : "Р‘С‹СЃС‚СЂРѕРµ СЃРѕР·РґР°РЅРёРµ СЃРґРµР»РєРё РІРѕ РІСЃРїР»С‹РІР°СЋС‰РµРј РѕРєРЅРµ Р±РµР· СѓС…РѕРґР° РёР· С‚РµРєСѓС‰РµРіРѕ РІРёРґР°."
    );
  }

  function renderWarehouseItemCreateModal(doc) {
    const existing = (doc.items || []).find((item) => item.id === ui.warehouse.itemEditId) || null;
    const draft = readDraft("warehouse", "item");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїРѕР·РёС†РёРё СЃРєР»Р°РґР°" : "РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ СЃРєР»Р°РґР°",
      `<form id="warehouseItemModalForm" class="workspace-form" data-draft-form="item">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="name" value="${escapeHtml(draftValue(existing?.name || "", draft?.name))}" required /></label>
          <label><span>SKU / Р°СЂС‚РёРєСѓР»</span><input class="form-control" type="text" name="sku" value="${escapeHtml(draftValue(existing?.sku || "", draft?.sku))}" /></label>
          <label><span>РљР°С‚РµРіРѕСЂРёСЏ</span><input class="form-control" type="text" name="category" value="${escapeHtml(draftValue(existing?.category || "", draft?.category))}" /></label>
          <label><span>Р•Рґ. РёР·Рј.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(draftValue(existing?.unit || "С€С‚", draft?.unit || "С€С‚"))}" /></label>
          <label><span>РЎС‚Р°СЂС‚РѕРІС‹Р№ РѕСЃС‚Р°С‚РѕРє</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(draftValue(existing?.openingStock || "", draft?.openingStock || ""))}" /></label>
          <label><span>РњРёРЅРёРјСѓРј</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(draftValue(existing?.minStock || "", draft?.minStock || ""))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("warehouse", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ" : "РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      existing ? "РџРѕР»РЅР°СЏ РєР°СЂС‚РѕС‡РєР° СЃРєР»Р°РґСЃРєРѕР№ РїРѕР·РёС†РёРё РІРѕ РІСЃРїР»С‹РІР°СЋС‰РµРј РѕРєРЅРµ Р±РµР· Р»РёС€РЅРµРіРѕ РїРµСЂРµС…РѕРґР° РїРѕ СЌРєСЂР°РЅСѓ." : "РЎРѕР·РґР°РЅРёРµ С‚РѕРІР°СЂР° РёР»Рё РјР°С‚РµСЂРёР°Р»Р° РІ РѕС‚РґРµР»СЊРЅРѕРј РѕРєРЅРµ РїРѕ Р»РѕРіРёРєРµ РњРѕР№РЎРєР»Р°Рґ."
    );
  }

  function renderWarehouseMovementCreateModal(doc) {
    const draft = readDraft("warehouse", "movement");
    return renderWorkspaceModalShell(
      "РќРѕРІРѕРµ РґРІРёР¶РµРЅРёРµ РїРѕ СЃРєР»Р°РґСѓ",
      `<form id="warehouseMovementModalForm" class="workspace-form" data-draft-form="movement">
        <div class="workspace-form-grid">
          <label><span>РџРѕР·РёС†РёСЏ</span><select class="form-select" name="itemId" required><option value="">Р’С‹Р±РµСЂРёС‚Рµ РїРѕР·РёС†РёСЋ</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${(ui.warehouse.movementItemId === item.id || draft?.itemId === item.id) ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>РўРёРї</span><select class="form-select" name="kind">${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draft?.kind || "in") === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>РљРѕР»РёС‡РµСЃС‚РІРѕ</span><input class="form-control" type="number" min="0" step="1" name="qty" value="${escapeHtml(compactText(draft?.qty || ""))}" required /></label>
          <label><span>Р”Р°С‚Р°</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draft?.date || todayString()))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue("", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">РЎРѕС…СЂР°РЅРёС‚СЊ РґРІРёР¶РµРЅРёРµ</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РџСЂРёС…РѕРґ, СЃРїРёСЃР°РЅРёРµ Рё СЂРµР·РµСЂРІ С‚РµРїРµСЂСЊ РјРѕР¶РЅРѕ РІРЅРѕСЃРёС‚СЊ РІСЃРїР»С‹РІР°СЋС‰РёРј РѕРєРЅРѕРј."
    );
  }

  function renderWarehouseProductCreateModal(doc) {
    const existing = (doc.products || []).find((item) => item.id === ui.warehouse.productEditId) || null;
    const draft = readDraft("warehouse", "product");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ С‚РѕРІР°СЂР°" : "РќРѕРІС‹Р№ С‚РѕРІР°СЂ",
      `<form id="warehouseProductModalForm" class="workspace-form" data-draft-form="product">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="name" value="${escapeHtml(draftValue(existing?.name || "", draft?.name))}" required /></label>
          <label><span>SKU / Р°СЂС‚РёРєСѓР»</span><input class="form-control" type="text" name="sku" value="${escapeHtml(draftValue(existing?.sku || "", draft?.sku))}" /></label>
          <label><span>Р“СЂСѓРїРїР°</span><input class="form-control" type="text" name="group" value="${escapeHtml(draftValue(existing?.group || "", draft?.group))}" /></label>
          <label><span>РџРѕСЃС‚Р°РІС‰РёРє</span><input class="form-control" type="text" name="supplier" value="${escapeHtml(draftValue(existing?.supplier || "", draft?.supplier))}" /></label>
          <label><span>Р•Рґ. РёР·Рј.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(draftValue(existing?.unit || "С€С‚", draft?.unit || "С€С‚"))}" /></label>
          <label><span>Р—Р°РєСѓРїРѕС‡РЅР°СЏ С†РµРЅР°</span><input class="form-control" type="number" min="0" step="0.01" name="purchasePrice" value="${escapeHtml(draftValue(existing?.purchasePrice || "", draft?.purchasePrice))}" /></label>
          <label><span>Р¦РµРЅР° РїСЂРѕРґР°Р¶Рё</span><input class="form-control" type="number" min="0" step="0.01" name="salePrice" value="${escapeHtml(draftValue(existing?.salePrice || "", draft?.salePrice))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ С‚РѕРІР°СЂ" : "РЎРѕР·РґР°С‚СЊ С‚РѕРІР°СЂ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РћС‚РґРµР»СЊРЅР°СЏ РєР°СЂС‚РѕС‡РєР° С‚РѕРІР°СЂР° РґР»СЏ РєР°С‚Р°Р»РѕРіР°, С†РµРЅ, РїРѕСЃС‚Р°РІС‰РёРєРѕРІ Рё РіРѕС‚РѕРІРѕР№ РїСЂРѕРґСѓРєС†РёРё."
    );
  }

  function renderWarehousePurchaseCreateModal(doc) {
    const existing = (doc.purchases || []).find((item) => item.id === ui.warehouse.purchaseEditId) || null;
    const draft = readDraft("warehouse", "purchase");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РєСѓРїРєРё" : "РќРѕРІР°СЏ Р·Р°РєСѓРїРєР°",
      `<form id="warehousePurchaseModalForm" class="workspace-form" data-draft-form="purchase">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќРѕРјРµСЂ</span><input class="form-control" type="text" name="number" value="${escapeHtml(draftValue(existing?.number || "", draft?.number))}" /></label>
          <label><span>РџРѕСЃС‚Р°РІС‰РёРє</span><input class="form-control" type="text" name="supplier" value="${escapeHtml(draftValue(existing?.supplier || "", draft?.supplier))}" required /></label>
          <label><span>РЎС‚Р°С‚СѓСЃ</span><select class="form-select" name="status">${WAREHOUSE_PURCHASE_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.status || "draft", draft?.status || "draft") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Р”Р°С‚Р°</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draftValue(existing?.date || todayString(), draft?.date || todayString())))}" /></label>
          <label><span>РћР¶РёРґР°РµРјР°СЏ РґР°С‚Р°</span><input class="form-control" type="date" name="expectedDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.expectedDate || "", draft?.expectedDate || "")))}" /></label>
          <label><span>РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР°</span><select class="form-select" name="itemId"><option value="">Р‘РµР· РїРѕР·РёС†РёРё</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${draftValue(existing?.itemId || "", draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>РљРѕР»РёС‡РµСЃС‚РІРѕ / РѕР±СЉРµРј</span><input class="form-control" type="number" min="0" step="0.01" name="qty" value="${escapeHtml(draftValue(existing?.qty || "", draft?.qty || ""))}" /></label>
          <label><span>РЎС‡РµС‚ / РєР°СЃСЃР°</span><input class="form-control" type="text" name="account" value="${escapeHtml(draftValue(existing?.account || "", draft?.account))}" /></label>
          <label><span>РЎСѓРјРјР°</span><input class="form-control" type="number" min="0" step="0.01" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РєСѓРїРєСѓ" : "РЎРѕР·РґР°С‚СЊ Р·Р°РєСѓРїРєСѓ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "Р—Р°РєСѓРїРєР° СЃСЂР°Р·Сѓ СЃРІСЏР·Р°РЅР° СЃ РїРѕСЃС‚Р°РІС‰РёРєРѕРј, СЃРєР»Р°РґСЃРєРѕР№ РїРѕР·РёС†РёРµР№ Рё РїСЂРёРµРјРєРѕР№ РЅР° СЃРєР»Р°Рґ."
    );
  }

  function renderWarehouseFinanceCreateModal(doc) {
    const existing = (doc.financeEntries || []).find((item) => item.id === ui.warehouse.financeEditId) || null;
    const draft = readDraft("warehouse", "finance");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РѕРїРµСЂР°С†РёРё" : "РќРѕРІР°СЏ РґРµРЅРµР¶РЅР°СЏ РѕРїРµСЂР°С†РёСЏ",
      `<form id="warehouseFinanceModalForm" class="workspace-form" data-draft-form="finance">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РўРёРї</span><select class="form-select" name="kind">${FINANCE_ENTRY_KINDS.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.kind || "expense", draft?.kind || "expense") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>Р”Р°С‚Р°</span><input class="form-control" type="date" name="date" value="${escapeHtml(normalizeDateInput(draftValue(existing?.date || todayString(), draft?.date || todayString())))}" /></label>
          <label><span>РЎС‡РµС‚</span><input class="form-control" type="text" name="account" value="${escapeHtml(draftValue(existing?.account || "", draft?.account))}" required /></label>
          <label><span>РЎС‚Р°С‚СЊСЏ</span><input class="form-control" type="text" name="category" value="${escapeHtml(draftValue(existing?.category || "", draft?.category))}" required /></label>
          <label><span>РљРѕРЅС‚СЂР°РіРµРЅС‚</span><input class="form-control" type="text" name="counterparty" value="${escapeHtml(draftValue(existing?.counterparty || "", draft?.counterparty))}" /></label>
          <label><span>РЎСѓРјРјР°</span><input class="form-control" type="number" min="0" step="0.01" name="amount" value="${escapeHtml(draftValue(existing?.amount || "", draft?.amount))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ" : "РЎРѕС…СЂР°РЅРёС‚СЊ РѕРїРµСЂР°С†РёСЋ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РџСЂРёС…РѕРґС‹, СЂР°СЃС…РѕРґС‹ Рё РїРµСЂРµРјРµС‰РµРЅРёСЏ РґРµРЅРµРі РІ РѕРґРЅРѕРј РѕРєРЅРµ СЃ РїСЂРёРІСЏР·РєРѕР№ Рє СЃС‡РµС‚Р°Рј Рё СЃС‚Р°С‚СЊСЏРј."
    );
  }

  function renderWarehouseProductionCreateModal(doc) {
    const existing = (doc.productionJobs || []).find((item) => item.id === ui.warehouse.productionEditId) || null;
    const draft = readDraft("warehouse", "production");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїСЂРѕРёР·РІРѕРґСЃС‚РІР°" : "РќРѕРІРѕРµ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ",
      `<form id="warehouseProductionModalForm" class="workspace-form" data-draft-form="production">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ Р·Р°РґР°РЅРёСЏ</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>Р­С‚Р°Рї</span><select class="form-select" name="stage">${PRODUCTION_JOB_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${draftValue(existing?.stage || "queue", draft?.stage || "queue") === item.key ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>РЎСЂРѕРє</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(normalizeDateInput(draftValue(existing?.deadline || todayString(), draft?.deadline || todayString())))}" /></label>
          <label><span>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</span><input class="form-control" type="text" name="assignee" value="${escapeHtml(draftValue(existing?.assignee || "", draft?.assignee))}" /></label>
          <label><span>РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР°</span><select class="form-select" name="itemId"><option value="">Р‘РµР· РїРѕР·РёС†РёРё</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${draftValue(existing?.itemId || "", draft?.itemId || "") === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label>
          <label><span>РљРѕР»РёС‡РµСЃС‚РІРѕ</span><input class="form-control" type="number" min="0" step="0.01" name="qty" value="${escapeHtml(draftValue(existing?.qty || "", draft?.qty))}" /></label>
        </div>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РґР°РЅРёРµ" : "РЎРѕР·РґР°С‚СЊ Р·Р°РґР°РЅРёРµ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      "РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅС‹Р№ РїРѕС‚РѕРє РїРѕ Р·Р°РґР°РЅРёСЏРј, СЃСЂРѕРєР°Рј Рё РѕС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Рј РІРЅСѓС‚СЂРё РѕР±С‰РµР№ РїР»Р°С‚С„РѕСЂРјС‹."
    );
  }

  function renderTasksTaskCreateModal(doc) {
    const existing = (doc.tasks || []).find((task) => task.id === ui.tasks.taskEditId) || null;
    const draft = readDraft("tasks", "task");
    const sprintOptions = sortByDateDesc(doc.sprints || [], "startDate");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РґР°С‡Рё" : "РќРѕРІР°СЏ Р·Р°РґР°С‡Р°",
      `<form id="tasksTaskModalForm" class="workspace-form" data-draft-form="task">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>Р—Р°РґР°С‡Р°</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>РћС‚РІРµС‚СЃС‚РІРµРЅРЅС‹Р№</span><input class="form-control" type="text" name="owner" value="${escapeHtml(draftValue(existing?.owner || "", draft?.owner))}" /></label>
          <label><span>РЎС‚Р°С‚СѓСЃ</span><select class="form-select" name="status">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draftValue(existing?.status || "todo", draft?.status || "todo")) === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>РџСЂРёРѕСЂРёС‚РµС‚</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((item) => `<option value="${escapeHtml(item.key)}" ${((draftValue(existing?.priority || "medium", draft?.priority || "medium")) === item.key) ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select></label>
          <label><span>РС‚РµСЂР°С†РёСЏ</span><select class="form-select" name="sprintId"><option value="">Р‘РµР· РёС‚РµСЂР°С†РёРё</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${(draftValue(existing?.sprintId || "", draft?.sprintId || "")) === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label>
          <label><span>РЎСЂРѕРє</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.dueDate || "", draft?.dueDate || "")))}" /></label>
        </div>
        <label class="workspace-check"><input class="form-check-input" type="checkbox" name="blocked" ${(draftValue(existing?.blocked ? "1" : "", draft?.blocked ? "1" : "")) ? "checked" : ""} /> <span>Р•СЃС‚СЊ Р±Р»РѕРєРµСЂ</span></label>
        <label><span>РљРѕРјРјРµРЅС‚Р°СЂРёР№</span><textarea class="form-control" name="note" rows="4">${escapeHtml(draftValue(existing?.note || "", draft?.note))}</textarea></label>
        ${renderCustomFieldSection("tasks", doc, existing || draft, escapeHtml)}
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РґР°С‡Сѓ" : "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РґР°С‡Сѓ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      existing ? "РџРѕР»РЅР°СЏ РєР°СЂС‚РѕС‡РєР° Р·Р°РґР°С‡Рё РІРѕ РІСЃРїР»С‹РІР°СЋС‰РµРј РѕРєРЅРµ Р±РµР· СѓС…РѕРґР° РёР· С‚РµРєСѓС‰РµРіРѕ СЂРµР¶РёРјР°." : "Р‘С‹СЃС‚СЂРѕРµ РґРѕР±Р°РІР»РµРЅРёРµ Р·Р°РґР°С‡Рё Р±РµР· РїРµСЂРµС…РѕРґР° РІ РєР°СЂС‚РѕС‡РєСѓ."
    );
  }

  function renderTasksSprintCreateModal() {
    const doc = docs.tasks || createDefaultTasksDoc();
    const existing = (doc.sprints || []).find((sprint) => sprint.id === ui.tasks.sprintEditId) || null;
    const draft = readDraft("tasks", "sprint");
    return renderWorkspaceModalShell(
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РёС‚РµСЂР°С†РёРё" : "РќРѕРІР°СЏ РёС‚РµСЂР°С†РёСЏ",
      `<form id="tasksSprintModalForm" class="workspace-form" data-draft-form="sprint">
        <input type="hidden" name="id" value="${escapeHtml(existing?.id || "")}" />
        <div class="workspace-form-grid">
          <label><span>РќР°Р·РІР°РЅРёРµ</span><input class="form-control" type="text" name="title" value="${escapeHtml(draftValue(existing?.title || "", draft?.title))}" required /></label>
          <label><span>РЎС‚Р°СЂС‚</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.startDate || "", draft?.startDate || "")))}" /></label>
          <label><span>Р¤РёРЅРёС€</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(draftValue(existing?.endDate || "", draft?.endDate || "")))}" /></label>
        </div>
        <label><span>Р¦РµР»СЊ</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(draftValue(existing?.goal || "", draft?.goal))}</textarea></label>
        <div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${existing ? "РЎРѕС…СЂР°РЅРёС‚СЊ РёС‚РµСЂР°С†РёСЋ" : "РЎРѕС…СЂР°РЅРёС‚СЊ РёС‚РµСЂР°С†РёСЋ"}</button><button class="btn btn-outline-secondary" type="button" data-live-modal-close>РћС‚РјРµРЅР°</button></div>
      </form>`,
      existing ? "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ СЂР°Р±РѕС‡РµРіРѕ С†РёРєР»Р° РєРѕРјР°РЅРґС‹ Р±РµР· СѓС…РѕРґР° РёР· РєР°РЅР±Р°РЅР° Рё СЃРїРёСЃРєР°." : "РС‚РµСЂР°С†РёРё Р·Р°РґР°СЋС‚ СЂРёС‚Рј СЂР°Р±РѕС‚С‹ Рё РїСЂРёРѕСЂРёС‚РµС‚С‹ РєРѕРјР°РЅРґС‹."
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
        { text: "РљР°СЂС‚РѕС‡РєР° СЃРґРµР»РєРё", modes: "overview form" },
        { text: "РќРѕРІР°СЏ СЃРґРµР»РєР°", modes: "overview form" },
        { text: "Р¤РѕРєСѓСЃ РЅРµРґРµР»Рё", modes: "overview form" },
        { text: "Р’РѕСЂРѕРЅРєР° СЃРґРµР»РѕРє", modes: "board" },
        { text: "РЎРїРёСЃРѕРє СЃРґРµР»РѕРє", modes: "table" }
      ],
      warehouse: [
        { text: "РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ СЃРєР»Р°РґР°", modes: "form" },
        { text: "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РїРѕР·РёС†РёРё", modes: "form" },
        { text: "Р”РІРёР¶РµРЅРёРµ РїРѕ СЃРєР»Р°РґСѓ", modes: "form movements" },
        { text: "РўРµРєСѓС‰РёРµ РѕСЃС‚Р°С‚РєРё", modes: "overview catalog" },
        { text: "РџРѕСЃР»РµРґРЅРёРµ РґРІРёР¶РµРЅРёСЏ", modes: "overview movements" },
        { text: "РўРѕРІР°СЂС‹", modes: "overview products" },
        { text: "Р—Р°РєСѓРїРєРё", modes: "overview purchases" },
        { text: "Р”РµРЅРµР¶РЅС‹Рµ РѕРїРµСЂР°С†РёРё", modes: "overview finance" },
        { text: "РџСЂРѕРёР·РІРѕРґСЃС‚РІРѕ", modes: "overview production" }
      ],
      tasks: [
        { text: "РќРѕРІР°СЏ Р·Р°РґР°С‡Р°", modes: "form" },
        { text: "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ Р·Р°РґР°С‡Рё", modes: "form" },
        { text: "РќРѕРІР°СЏ РёС‚РµСЂР°С†РёСЏ", modes: "form" },
        { text: "Р РµРґР°РєС‚РёСЂРѕРІР°РЅРёРµ РёС‚РµСЂР°С†РёРё", modes: "form" },
        { text: "РС‚РµСЂР°С†РёРё", modes: "overview form" },
        { text: "РљР°РЅР±Р°РЅ", modes: "board" },
        { text: "Р›РµРЅС‚Р° Р·Р°РґР°С‡", modes: "table" }
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
        await saveDocument("crm", { ...doc, deals }, "РЎС‚Р°РґРёСЏ СЃРґРµР»РєРё РѕР±РЅРѕРІР»РµРЅР°.");
        await rerenderCurrentModule();
      }
      return true;
    }
    const taskStatusSelect = event.target.closest("[data-task-status-select]");
    if (taskStatusSelect) {
      const nextStatus = compactText(taskStatusSelect.value) || "todo";
      const updatedTask = await updateTaskRecord(
        taskStatusSelect.dataset.taskStatusSelect,
        "РЎС‚Р°С‚СѓСЃ Р·Р°РґР°С‡Рё РѕР±РЅРѕРІР»РµРЅ.",
        (task) => ({
          ...task,
          status: nextStatus,
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: "РЎС‚Р°С‚СѓСЃ Р·Р°РґР°С‡Рё РёР·РјРµРЅРµРЅ",
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
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, views } }, "Р’РєР»Р°РґРєР° СѓРґР°Р»РµРЅР°.");
      return;
    }
    if (type === "field") {
      const fields = (doc.builder.fields || []).filter((field) => field.key !== key);
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, fields } }, "РџРѕР»Рµ СѓРґР°Р»РµРЅРѕ.");
      return;
    }
    if (type === "formula") {
      const formulas = (doc.builder.formulas || []).filter((formula) => formula.key !== key);
      await saveDocument(moduleKey, { ...doc, builder: { ...doc.builder, formulas } }, "Р¤РѕСЂРјСѓР»Р° СѓРґР°Р»РµРЅР°.");
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
        setStatus("Р§РµСЂРЅРѕРІРёРє РѕС‡РёС‰РµРЅ.", "success");
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
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРє С†РµР»РёРєРѕРј?")) return true;
        const listKey = sanitizeKey(deleteButton.dataset.directoryDelete);
        const lists = (doc.lists || []).filter((list) => list.key !== listKey && list.id !== listKey);
        ui.directories.activeListId = lists[0]?.key || "";
        persistUiState("directories");
        await saveDocument("directories", { ...doc, lists }, "РЎРїСЂР°РІРѕС‡РЅРёРє СѓРґР°Р»С‘РЅ.");
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
        await saveDocument("directories", { ...doc, lists }, "Р—РЅР°С‡РµРЅРёРµ СѓРґР°Р»РµРЅРѕ РёР· СЃРїСЂР°РІРѕС‡РЅРёРєР°.");
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
        await saveDocument("crm", { ...doc, deals: [copy, ...(doc.deals || [])] }, "РљРѕРїРёСЏ СЃРґРµР»РєРё СЃРѕР·РґР°РЅР°.");
        ui.crm.editId = copy.id;
        ui.crm.modal = "deal";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const deleteButton = event.target.closest("[data-crm-delete]");
      if (deleteButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ СЃРґРµР»РєСѓ?")) return true;
        const deals = (doc.deals || []).filter((deal) => deal.id !== deleteButton.dataset.crmDelete);
        ui.crm.editId = ui.crm.editId === deleteButton.dataset.crmDelete ? null : ui.crm.editId;
        await saveDocument("crm", { ...doc, deals }, "РЎРґРµР»РєР° СѓРґР°Р»РµРЅР°.");
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
        await saveDocument("warehouse", { ...doc, items: [copy, ...(doc.items || [])] }, "РљРѕРїРёСЏ РїРѕР·РёС†РёРё СЃРѕР·РґР°РЅР°.");
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
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ РїРѕР·РёС†РёСЋ Рё СЃРІСЏР·Р°РЅРЅС‹Рµ РґРІРёР¶РµРЅРёСЏ?")) return true;
        const itemId = deleteItemButton.dataset.warehouseItemDelete;
        const items = (doc.items || []).filter((item) => item.id !== itemId);
        const movements = (doc.movements || []).filter((movement) => movement.itemId !== itemId);
        if (ui.warehouse.itemEditId === itemId) ui.warehouse.itemEditId = null;
        if (ui.warehouse.movementItemId === itemId) ui.warehouse.movementItemId = "";
        await saveDocument("warehouse", { ...doc, items, movements }, "РџРѕР·РёС†РёСЏ СЃРєР»Р°РґР° СѓРґР°Р»РµРЅР°.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteMovementButton = event.target.closest("[data-warehouse-movement-delete]");
      if (deleteMovementButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ РґРІРёР¶РµРЅРёРµ?")) return true;
        const movements = (doc.movements || []).filter((movement) => movement.id !== deleteMovementButton.dataset.warehouseMovementDelete);
        await saveDocument("warehouse", { ...doc, movements }, "Р”РІРёР¶РµРЅРёРµ СѓРґР°Р»РµРЅРѕ.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteProductButton = event.target.closest("[data-warehouse-product-delete]");
      if (deleteProductButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ С‚РѕРІР°СЂ?")) return true;
        const productId = deleteProductButton.dataset.warehouseProductDelete;
        const products = (doc.products || []).filter((item) => item.id !== productId);
        if (ui.warehouse.productEditId === productId) ui.warehouse.productEditId = null;
        await saveDocument("warehouse", { ...doc, products }, "РўРѕРІР°СЂ СѓРґР°Р»РµРЅ.");
        await rerenderCurrentModule();
        return true;
      }
      const deletePurchaseButton = event.target.closest("[data-warehouse-purchase-delete]");
      if (deletePurchaseButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РєСѓРїРєСѓ Рё СЃРІСЏР·Р°РЅРЅСѓСЋ РїСЂРёРµРјРєСѓ?")) return true;
        const purchaseId = deletePurchaseButton.dataset.warehousePurchaseDelete;
        const purchases = (doc.purchases || []).filter((item) => item.id !== purchaseId);
        const movements = (doc.movements || []).filter(
          (movement) => compactText(movement?.integration?.purchaseId) !== purchaseId
        );
        if (ui.warehouse.purchaseEditId === purchaseId) ui.warehouse.purchaseEditId = null;
        await saveDocument("warehouse", { ...doc, purchases, movements }, "Р—Р°РєСѓРїРєР° СѓРґР°Р»РµРЅР°.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteFinanceButton = event.target.closest("[data-warehouse-finance-delete]");
      if (deleteFinanceButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ РґРµРЅРµР¶РЅСѓСЋ РѕРїРµСЂР°С†РёСЋ?")) return true;
        const financeId = deleteFinanceButton.dataset.warehouseFinanceDelete;
        const financeEntries = (doc.financeEntries || []).filter((entry) => entry.id !== financeId);
        if (ui.warehouse.financeEditId === financeId) ui.warehouse.financeEditId = null;
        await saveDocument("warehouse", { ...doc, financeEntries }, "РћРїРµСЂР°С†РёСЏ СѓРґР°Р»РµРЅР°.");
        await rerenderCurrentModule();
        return true;
      }
      const deleteProductionButton = event.target.closest("[data-warehouse-production-delete]");
      if (deleteProductionButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ РїСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ?")) return true;
        const productionId = deleteProductionButton.dataset.warehouseProductionDelete;
        const productionJobs = (doc.productionJobs || []).filter((entry) => entry.id !== productionId);
        if (ui.warehouse.productionEditId === productionId) ui.warehouse.productionEditId = null;
        await saveDocument("warehouse", { ...doc, productionJobs }, "РџСЂРѕРёР·РІРѕРґСЃС‚РІРµРЅРЅРѕРµ Р·Р°РґР°РЅРёРµ СѓРґР°Р»РµРЅРѕ.");
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
        const updatedTask = await updateTaskRecord(taskId, "РЎРѕСЃС‚РѕСЏРЅРёРµ Р·Р°РґР°С‡Рё РѕР±РЅРѕРІР»РµРЅРѕ.", (task) => ({
          ...task,
          status: compactText(nextStatus) || "todo",
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: compactText(nextStatus) === "done" ? "Р—Р°РґР°С‡Р° РѕС‚РјРµС‡РµРЅР° РІС‹РїРѕР»РЅРµРЅРЅРѕР№" : "Р—Р°РґР°С‡Р° РІРѕР·РІСЂР°С‰РµРЅР° РІ СЂР°Р±РѕС‚Сѓ",
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
        const updatedTask = await updateTaskRecord(taskToggleBlockedButton.dataset.taskToggleBlocked, "РЎРѕСЃС‚РѕСЏРЅРёРµ Р±Р»РѕРєРµСЂР° РѕР±РЅРѕРІР»РµРЅРѕ.", (task) => ({
          ...task,
          blocked: !task.blocked,
          history: appendTaskHistory(
            task,
            createTaskHistoryEntry({
              title: !task.blocked ? "Р”Р»СЏ Р·Р°РґР°С‡Рё РѕС‚РјРµС‡РµРЅ Р±Р»РѕРєРµСЂ" : "Р‘Р»РѕРєРµСЂ РїРѕ Р·Р°РґР°С‡Рµ СЃРЅСЏС‚",
              meta: !task.blocked ? "РќСѓР¶РЅР° РїРѕРјРѕС‰СЊ РёР»Рё СѓРїСЂР°РІР»РµРЅС‡РµСЃРєРѕРµ СЂРµС€РµРЅРёРµ." : "Р—Р°РґР°С‡Р° СЃРЅРѕРІР° РјРѕР¶РµС‚ РґРІРёРіР°С‚СЊСЃСЏ Р±РµР· РѕРіСЂР°РЅРёС‡РµРЅРёР№.",
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
              title: "РЎРѕР·РґР°РЅР° РєРѕРїРёСЏ Р·Р°РґР°С‡Рё",
              meta: `РСЃС‚РѕС‡РЅРёРє РєРѕРїРёРё: ${compactText(source.title || "Р—Р°РґР°С‡Р°")}`,
              tone: "info",
              moduleKey: "tasks",
              entityId: source.id
            })
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDocument("tasks", { ...doc, tasks: [copy, ...(doc.tasks || [])] }, "РљРѕРїРёСЏ Р·Р°РґР°С‡Рё СЃРѕР·РґР°РЅР°.");
        ui.tasks.taskEditId = copy.id;
        ui.tasks.modal = "task";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const deleteTaskButton = event.target.closest("[data-task-delete]");
      if (deleteTaskButton) {
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РґР°С‡Сѓ?")) return true;
        const tasks = (doc.tasks || []).filter((task) => task.id !== deleteTaskButton.dataset.taskDelete);
        if (ui.tasks.taskEditId === deleteTaskButton.dataset.taskDelete) ui.tasks.taskEditId = null;
        await saveDocument("tasks", { ...doc, tasks }, "Р—Р°РґР°С‡Р° СѓРґР°Р»РµРЅР°.");
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
        if (!window.confirm("РЈРґР°Р»РёС‚СЊ РёС‚РµСЂР°С†РёСЋ? Р—Р°РґР°С‡Рё РѕСЃС‚Р°РЅСѓС‚СЃСЏ, РЅРѕ РѕС‚РІСЏР¶СѓС‚СЃСЏ РѕС‚ РЅРµРµ.")) return true;
        const sprintId = deleteSprintButton.dataset.sprintDelete;
        const sprints = (doc.sprints || []).filter((sprint) => sprint.id !== sprintId);
        const sprintTitle = compactText((doc.sprints || []).find((sprint) => sprint.id === sprintId)?.title || "РС‚РµСЂР°С†РёСЏ");
        const tasks = (doc.tasks || []).map((task) => (task.sprintId === sprintId
          ? {
              ...task,
              sprintId: "",
              updatedAt: new Date().toISOString(),
              history: appendTaskHistory(
                task,
                createTaskHistoryEntry({
                  title: "РС‚РµСЂР°С†РёСЏ СѓРґР°Р»РµРЅР°",
                  meta: `Р—Р°РґР°С‡Р° РѕС‚РІСЏР·Р°РЅР° РѕС‚ РёС‚РµСЂР°С†РёРё ${sprintTitle}.`,
                  tone: "warning",
                  moduleKey: "tasks",
                  entityId: task.id
                })
              )
            }
          : task));
        if (ui.tasks.sprintEditId === sprintId) ui.tasks.sprintEditId = null;
        await saveDocument("tasks", { ...doc, sprints, tasks }, "РС‚РµСЂР°С†РёСЏ СѓРґР°Р»РµРЅР°.");
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
      return `${lists.length} СЃРїСЂР°РІРѕС‡РЅРёРєРѕРІ вЂў ${formatNumber(sumBy(lists, (list) => (list.options || []).length))} Р·РЅР°С‡РµРЅРёР№`;
    }
    if (moduleKey === "crm") {
      const deals = docs.crm.deals || [];
      const salesSnapshot = buildSalesSnapshot(externalDocs.sales);
      return `${deals.length} СЃРґРµР»РѕРє вЂў ${formatMoney(sumBy(deals, (deal) => deal.amount || 0))}${salesSnapshot.orders.length ? ` вЂў ${salesSnapshot.unpaidInvoices.length} СЃС‡РµС‚РѕРІ Р±РµР· РѕРїР»Р°С‚С‹` : ""}`;
    }
    if (moduleKey === "warehouse") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse);
      const calculatorSnapshot = buildCalculatorDemandSnapshot(externalDocs.myCalculator, externalDocs.partnerCalculators || []);
      return `${snapshot.items.length} РїРѕР·РёС†РёР№ вЂў ${snapshot.products.length} С‚РѕРІР°СЂРѕРІ вЂў ${snapshot.purchases.length} Р·Р°РєСѓРїРѕРє${calculatorSnapshot.activeTabs ? ` вЂў ${calculatorSnapshot.activeTabs} РІРєР»Р°РґРѕРє СЃРїСЂРѕСЃР°` : ""}`;
    }
    if (moduleKey === "products") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${snapshot.products.length} С‚РѕРІР°СЂРѕРІ вЂў ${formatMoney(sumBy(snapshot.products, (item) => (item.salePrice || 0) - (item.purchasePrice || 0)))} РІР°Р»РѕРІР°СЏ РјР°СЂР¶Р°`;
    }
    if (moduleKey === "purchases") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${snapshot.purchases.length} Р·Р°РєСѓРїРѕРє вЂў ${formatMoney(snapshot.purchasesTotal || 0)} РІ Р·Р°РєР°Р·Р°С…`;
    }
    if (moduleKey === "money") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${formatMoney((snapshot.incomeTotal || 0) - (snapshot.expenseTotal || 0))} Р±Р°Р»Р°РЅСЃ вЂў ${formatMoney(snapshot.incomeTotal || 0)} РїСЂРёС…РѕРґ / ${formatMoney(snapshot.expenseTotal || 0)} СЂР°СЃС…РѕРґ`;
    }
    if (moduleKey === "production") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse || createDefaultWarehouseDoc());
      return `${formatNumber(snapshot.productionActive || 0)} Р°РєС‚РёРІРЅС‹С… вЂў ${formatNumber(snapshot.productionJobs.length)} РІСЃРµРіРѕ Р·Р°РґР°РЅРёР№`;
    }
    if (moduleKey === "tasks") {
      const tasks = docs.tasks.tasks || [];
      const openCount = tasks.filter((task) => task.status !== "done").length;
      const blockedCount = tasks.filter((task) => task.status !== "done" && task.blocked).length;
      const overdueCount = tasks.filter((task) => task.status !== "done" && normalizeDateInput(task.dueDate) && normalizeDateInput(task.dueDate) < todayString()).length;
      return `${openCount} РѕС‚РєСЂС‹С‚С‹С… Р·Р°РґР°С‡${blockedCount ? ` вЂў ${blockedCount} СЃ Р±Р»РѕРєРµСЂРѕРј` : ""}${overdueCount ? ` вЂў ${overdueCount} РїСЂРѕСЃСЂРѕС‡РµРЅРѕ` : ""}`;
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
    const taskSignals = await buildTaskSignalSnapshot(tasksDoc);
    const light2LiveEmpty = !light2Settlements.length
      && !light2BalanceEntries.length
      && !light2CalendarEntries.length
      && !light2Assets.length
      && !light2AssetPayments.length
      && !light2Purchases.length;
    const light2FallbackSnapshot = await loadLight2WorkbookSnapshotFallback();
    const light2Fallback = buildLight2DashboardFallback(light2FallbackSnapshot);

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
    const contourOpenSettlements = (light2Settlements || []).filter((entry) => !contourClosedStatuses.has(repairMojibakeText(compactText(entry.status))));
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
        (light2CalendarEntries || []).filter((entry) => repairMojibakeText(compactText(entry.operation_type)) === compactText("Приход")),
        (entry) => entry.amount
      )
    );
    const contourCalendarOutgoing = roundMoney(
      sumBy(
        (light2CalendarEntries || []).filter((entry) => repairMojibakeText(compactText(entry.operation_type)) === compactText("Расход")),
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
          title: order.title || `Р—Р°РєР°Р· ${order.orderNumber || "Р±РµР· РЅРѕРјРµСЂР°"}`,
          meta: `${order.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ"} вЂў ${order.status || "РЎС‚Р°С‚СѓСЃ РЅРµ СѓРєР°Р·Р°РЅ"}`,
          tone: order.isPaid ? "success" : order.isInvoiced ? "accent" : "neutral",
          moduleKey: "sales"
        })),
        ...sortByDateDesc(deals, "updatedAt").slice(0, 8).map((deal) => ({
          id: `activity-crm-${deal.id}`,
          date: deal.updatedAt || deal.createdAt || "",
          title: deal.title || deal.client || "РЎРґРµР»РєР°",
          meta: `${getCrmStageMeta(deal.stage).label} вЂў ${deal.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ"}`,
          tone: getCrmStageMeta(deal.stage).tone,
          moduleKey: "crm"
        })),
        ...sortByDateDesc(warehouseDoc?.movements || [], "date").slice(0, 8).map((movement) => {
          const item = (warehouseDoc?.items || []).find((entry) => entry.id === movement.itemId);
          return {
            id: `activity-move-${movement.id}`,
            date: movement.date || movement.createdAt || "",
            title: item?.name || movement.itemName || "РЎРєР»Р°РґСЃРєРѕРµ РґРІРёР¶РµРЅРёРµ",
            meta: `${WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === compactText(movement.kind))?.label || movement.kind || "Р”РІРёР¶РµРЅРёРµ"} вЂў ${formatNumber(movement.qty || 0)}`,
            tone: compactText(movement.kind) === "in" ? "success" : compactText(movement.kind) === "out" ? "danger" : "info",
            moduleKey: "warehouse"
          };
        }),
        ...sortByDateDesc(warehouseDoc?.financeEntries || [], "date").slice(0, 6).map((entry) => ({
          id: `activity-finance-${entry.id}`,
          date: entry.date || entry.createdAt || "",
          title: entry.counterparty || entry.account || "Р”РµРЅРµР¶РЅР°СЏ РѕРїРµСЂР°С†РёСЏ",
          meta: `${FINANCE_ENTRY_KINDS.find((item) => item.key === compactText(entry.kind))?.label || entry.kind || "РћРїРµСЂР°С†РёСЏ"} вЂў ${formatMoney(entry.amount || 0)}`,
          tone: FINANCE_ENTRY_KINDS.find((item) => item.key === compactText(entry.kind))?.tone || "neutral",
          moduleKey: "money"
        })),
        ...tasks.flatMap((task) =>
          (Array.isArray(task?.history) ? task.history.map((entry) => normalizeTaskHistoryEntry(entry)).filter(Boolean).slice(0, 2) : []).map((entry) => ({
            id: entry.id || `activity-task-${task.id}`,
            date: entry.date || task.updatedAt || task.createdAt || "",
            title: entry.title || task.title || "РЎРѕР±С‹С‚РёРµ Р·Р°РґР°С‡Рё",
            meta: entry.meta || `${task.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ"} вЂў ${getTaskStatusMeta(task.status).label}`,
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
        title: order.title || `Р—Р°РєР°Р· ${order.orderNumber || "Р±РµР· РЅРѕРјРµСЂР°"}`,
        meta: `${formatMoney(order.amount || 0)} вЂў ${compactText(order.client || "РљР»РёРµРЅС‚ РЅРµ СѓРєР°Р·Р°РЅ")}`,
        actionLabel: "РћС‚РєСЂС‹С‚СЊ РїСЂРѕРґР°Р¶Рё"
      })),
      ...warehouseSnapshot.lowItems.slice(0, 4).map((item) => ({
        id: `warehouse-${item.id}`,
        tone: "danger",
        moduleKey: "warehouse",
        title: item.name || item.sku || "РЎРєР»Р°РґСЃРєР°СЏ РїРѕР·РёС†РёСЏ",
        meta: `Р”РѕСЃС‚СѓРїРЅРѕ ${formatNumber(item.available)} вЂў РјРёРЅРёРјСѓРј ${formatNumber(item.minStock || 0)}`,
        actionLabel: "РћС‚РєСЂС‹С‚СЊ СЃРєР»Р°Рґ"
      })),
      ...overdueDeals.slice(0, 3).map((deal) => ({
        id: `crm-${deal.id}`,
        tone: "accent",
        moduleKey: "crm",
        title: deal.title || deal.client || "CRM-СЃРґРµР»РєР°",
        meta: `${getCrmStageMeta(deal.stage).label} вЂў СЃСЂРѕРє ${formatDate(deal.deadline)}`,
        actionLabel: "РћС‚РєСЂС‹С‚СЊ CRM"
      })),
      ...overdueTasks.slice(0, 3).map((task) => ({
        id: `tasks-${task.id}`,
        tone: "info",
        moduleKey: "tasks",
        title: task.title || "Р—Р°РґР°С‡Р°",
        meta: `${task.owner || "Р‘РµР· РѕС‚РІРµС‚СЃС‚РІРµРЅРЅРѕРіРѕ"} вЂў СЃСЂРѕРє ${formatDate(task.dueDate)}`,
        actionLabel: "РћС‚РєСЂС‹С‚СЊ Р·Р°РґР°С‡Рё"
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
        settlementsCount: (light2Settlements || []).length || light2Fallback?.openSettlementsCount || 0,
        openSettlementsCount: contourOpenSettlements.length || light2Fallback?.openSettlementsCount || 0,
        settlementsPayout: contourSettlementsPayout || light2Fallback?.settlementsPayout || 0,
        balanceEntriesCount: (light2BalanceEntries || []).length,
        balanceTotal: contourBalanceTotal || light2Fallback?.balanceTotal || 0,
        calendarEntriesCount: (light2CalendarEntries || []).length,
        calendarIncoming: contourCalendarIncoming || 0,
        calendarOutgoing: contourCalendarOutgoing || 0,
        assetsCount: (light2Assets || []).length,
        assetsValue: contourAssetsValue || light2Fallback?.assetsRemaining || 0,
        assetsRemaining: contourAssetsRemaining || light2Fallback?.assetsRemaining || 0,
        purchasesCount: (light2Purchases || []).length || light2Fallback?.purchasesCount || 0,
        suppliersCount: contourSuppliers.size || light2Fallback?.suppliersCount || 0,
        metricsMonthLabel: light2Fallback?.latestMetrics?.monthLabel || "",
        latestRevenue: light2Fallback?.latestMetrics?.revenue || 0,
        latestNetProfit: light2Fallback?.latestMetrics?.netProfit || 0,
        latestSales: light2Fallback?.latestMetrics?.sales || 0,
        latestAverageCheck: light2Fallback?.latestMetrics?.averageCheck || 0,
        latestMargin: light2Fallback?.latestMetrics?.margin || 0,
        metricsSeries: Array.isArray(light2Fallback?.metricsSeries) ? light2Fallback.metricsSeries : []
      },
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


