import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { evaluateSafeFormula } from "../shared/safe-formula.js";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const LIGHT2_BUILD = "20260408-light2-board29";
const LIGHT2_UI_KEYS = {
  compactTables: "dom-neona:light2:compactTables",
  activeSection: "dom-neona:light2:activeSection",
  hiddenForms: "dom-neona:light2:hiddenForms",
  sectionBuilders: "dom-neona:light2:sectionBuilders"
};

const WORKBOOK_IMPORT_SHEETS = [
  "Баланс",
  "Платежный календарь",
  "Активы",
  "Закупки",
  "Взаиморасчет с мастерами"
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const BALANCE_ACCOUNTS = [
  { value: "cash_card", label: "Наличные / карта" },
  { value: "ooo_account", label: "Счёт ООО" },
  { value: "ip_account", label: "Счёт ИП" }
];

const CALENDAR_ACCOUNTS = [
  { value: "Наличные / карта", label: "Наличные / карта" },
  { value: "Счёт ООО", label: "Счёт ООО" },
  { value: "Счёт ИП", label: "Счёт ИП" },
  { value: "Не распределено", label: "Не распределено" }
];

const CALENDAR_STATUSES = ["Платеж", "Поступление", "Ожидает", "Перенесен", "Отменен"];

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];
const MONTH_NAME_SET = new Set(MONTH_NAMES);

const DOM = {
  userDisplay: document.getElementById("userDisplay"),
  accessMode: document.getElementById("accessMode"),
  moduleState: document.getElementById("moduleState"),
  statusBox: document.getElementById("statusBox"),
  workspaceModeLabel: document.getElementById("workspaceModeLabel"),
  toggleCompactTablesButton: document.getElementById("toggleCompactTablesButton"),
  toggleAllFormsButton: document.getElementById("toggleAllFormsButton"),
  sectionTabs: document.getElementById("sectionTabs"),
  liveOverviewSummary: document.getElementById("liveOverviewSummary"),
  liveOverviewPanels: document.getElementById("liveOverviewPanels"),
  overviewGrid: document.getElementById("overviewGrid"),
  importWorkbookButton: document.getElementById("importWorkbookButton"),
  importWorkbookStatus: document.getElementById("importWorkbookStatus"),
  scopeNote: document.getElementById("scopeNote"),
  settlementForm: document.getElementById("settlementForm"),
  settlementPreview: document.getElementById("settlementPreview"),
  settlementSubmitButton: document.getElementById("settlementSubmitButton"),
  settlementResetButton: document.getElementById("settlementResetButton"),
  settlementPartnerFilter: document.getElementById("settlementPartnerFilter"),
  settlementStatusFilter: document.getElementById("settlementStatusFilter"),
  settlementSearch: document.getElementById("settlementSearch"),
  settlementSummary: document.getElementById("settlementSummary"),
  settlementTableBody: document.getElementById("settlementTableBody"),
  settlementActionsHead: document.getElementById("settlementActionsHead"),
  refreshSettlementsButton: document.getElementById("refreshSettlementsButton")
};

function getSettlementDom() {
  return {
    scopeNote: document.getElementById("scopeNote"),
    form: document.getElementById("settlementForm"),
    preview: document.getElementById("settlementPreview"),
    submitButton: document.getElementById("settlementSubmitButton"),
    resetButton: document.getElementById("settlementResetButton"),
    partnerFilter: document.getElementById("settlementPartnerFilter"),
    statusFilter: document.getElementById("settlementStatusFilter"),
    search: document.getElementById("settlementSearch"),
    summary: document.getElementById("settlementSummary"),
    tableBody: document.getElementById("settlementTableBody"),
    actionsHead: document.getElementById("settlementActionsHead"),
    refreshButton: document.getElementById("refreshSettlementsButton")
  };
}

function refreshInteractiveDomRefs() {
  const settlementDom = getSettlementDom();
  DOM.scopeNote = settlementDom.scopeNote;
  DOM.settlementForm = settlementDom.form;
  DOM.settlementPreview = settlementDom.preview;
  DOM.settlementSubmitButton = settlementDom.submitButton;
  DOM.settlementResetButton = settlementDom.resetButton;
  DOM.settlementPartnerFilter = settlementDom.partnerFilter;
  DOM.settlementStatusFilter = settlementDom.statusFilter;
  DOM.settlementSearch = settlementDom.search;
  DOM.settlementSummary = settlementDom.summary;
  DOM.settlementTableBody = settlementDom.tableBody;
  DOM.settlementActionsHead = settlementDom.actionsHead;
  DOM.refreshSettlementsButton = settlementDom.refreshButton;
}

const SECTION_META = {
  overview: {
    title: "Обзор",
    subtitle: "Быстрый вход в рабочие блоки и сверочные листы ДОМ НЕОНА."
  },
  balance: {
    title: "Баланс",
    subtitle: "Три контура из исходного листа: наличные / карта, счёт ООО и счёт ИП.",
    cards: [
      {
        title: "Наличные / карта",
        text: "Быстрый перенос с теми же сущностями, что и в Excel.",
        items: ["Дата", "Приход", "Расход", "Баланс", "Комментарий"]
      },
      {
        title: "Счёт ООО",
        text: "Второй контур учета с отдельным потоком операций.",
        items: ["Дата", "Приход", "Расход", "Баланс"]
      },
      {
        title: "Счёт ИП",
        text: "Третий денежный контур, который уже был в исходном файле.",
        items: ["Дата", "Приход", "Расход", "Баланс"]
      }
    ]
  },
  calendar: {
    title: "Платежный календарь",
    subtitle: "Платежи, контрагенты, статьи, счета и статусы распределения.",
    cards: [
      {
        title: "Поля листа",
        text: "Структура уже зафиксирована для следующего этапа миграции.",
        items: ["Дата платежа", "Контрагент", "Сумма", "Тип операции", "Статья", "Счет", "Статус", "Комментарий"]
      }
    ]
  },
  assets: {
    title: "Активы",
    subtitle: "Активы, стоимость, выплаты и текстовые комментарии.",
    cards: [
      {
        title: "Поля листа",
        text: "Карточки активов и отдельный журнал выплат уже работают внутри платформы.",
        items: ["Актив", "Стоимость", "Выплачено", "Комментарий"]
      }
    ]
  },
  settlements: {
    title: "Взаиморасчеты",
    subtitle: "Полный блок сверки с мастерами и партнерами внутри ДОМ НЕОНА.",
    cards: [
      {
        title: "Поля исходного листа",
        text: "Блок вынесен в отдельную таблицу Supabase с доступом по партнеру.",
        items: ["Период", "Имя мастера / партнера", "ЗП мастера", "Покупки мастера", "Итог взаиморасчета", "Кто кому должен", "Статус"]
      }
    ]
  },
  purchases: {
    title: "Закупки",
    subtitle: "Нормализованный каталог закупок с поставщиками, категориями, артикулами и ценами.",
    cards: [
      {
        title: "Поля каталога",
        text: "Закупки уже вынесены в удобный каталог, который дальше можно будет связать со складом и оплатами.",
        items: ["Поставщик", "Город", "Категория", "Артикул", "Позиция", "Единица", "Цена"]
      }
    ]
  },
  leadgen: {
    title: "Лидогенерация",
    subtitle: "Сводка по рекламе, площадкам, директу и посадочным страницам.",
    cards: [
      {
        title: "Директ / фразы",
        text: "В исходнике есть отдельный лист со страницами и ключевыми фразами.",
        items: ["РСЯ", "Поиск", "Страница", "Фраза"]
      },
      {
        title: "Расходы и эффективность",
        text: "Отдельно зафиксированы расходы, показы и цена показа.",
        items: ["Расходы", "Показы", "Цена показа", "Месяц", "Изменение", "Процент"]
      }
    ],
    snapshotSheet: "Лидогенерация"
  },
  metrics: {
    title: "Метрики",
    subtitle: "Месячные блоки по выручке, себестоимости и процентной динамике.",
    cards: [
      {
        title: "Финансовые статьи",
        text: "Таблица уже размечена под перенос в нормальную аналитику.",
        items: ["Статья", "Сумма", "Деньги", "Процент", "Месяц", "Изменения"]
      }
    ],
    snapshotSheet: "Метрики"
  },
  finance: {
    title: "Финмодель",
    subtitle: "Годовая рамка и ключевые показатели по месяцам.",
    cards: [
      {
        title: "Каркас листа",
        text: "Подготовлено место под верхнеуровневую финмодель.",
        items: ["Статья", "Месяц", "Сумма", "По дате", "Год"]
      }
    ],
    snapshotSheet: "ФинМодель"
  },
  avito: {
    title: "Авито",
    subtitle: "Ежедневная воронка Авито: расход, просмотры, лиды и заказы.",
    cards: [
      {
        title: "Поля листа",
        text: "Снимок ежедневной эффективности уже доступен внутри платформы.",
        items: ["Дата", "Расход", "Просмотры / клики", "Контакты / лиды", "Заказ", "Цена заказа"]
      }
    ],
    snapshotSheet: "Авито"
  },
  direct: {
    title: "Директ",
    subtitle: "Страницы, ключи и частотность по рекламному спросу.",
    cards: [
      {
        title: "Поля листа",
        text: "Полный справочник фраз и спроса вынесен как сверочный лист.",
        items: ["Страница", "Фраза", "Число запросов", "Показов в месяц"]
      }
    ],
    snapshotSheet: "Директ"
  },
  neon_usage: {
    title: "Расход неона",
    subtitle: "Матрица расхода неона по цветам, периодам и каналам.",
    cards: [
      {
        title: "Поля листа",
        text: "Снимок расчетов по цветам и расходу сохранен для сверки.",
        items: ["Цвет", "Период", "Расход", "Итоги"]
      }
    ],
    snapshotSheet: "Расход неона по цветам"
  },
  events: {
    title: "Мероприятия",
    subtitle: "Календарь мероприятий и связанных операционных отметок.",
    cards: [
      {
        title: "Поля листа",
        text: "Лист перенесен для общей видимости и дальнейшей доработки.",
        items: ["Дата", "Событие", "План", "Итог"]
      }
    ],
    snapshotSheet: "Мероприятия"
  },
  risks: {
    title: "Риски",
    subtitle: "Решения, риски и рабочие вопросы по управлению.",
    cards: [
      {
        title: "Поля листа",
        text: "Лист перенесен для управленческой фиксации и обзора.",
        items: ["Категория", "Описание", "Решение", "Комментарий"]
      }
    ],
    snapshotSheet: "Решения и риски"
  },
  data: {
    title: "Данные",
    subtitle: "Справочные данные и базовые таблицы из исходника.",
    cards: [
      {
        title: "Поля листа",
        text: "Справочная подложка перенесена для контроля формул и коэффициентов.",
        items: ["Параметр", "Значение", "Комментарий"]
      }
    ],
    snapshotSheet: "Данные"
  },
  forecast: {
    title: "Прогноз",
    subtitle: "Оборот, расход, маржа, чек, продажи и прибыль.",
    cards: [
      {
        title: "Поля листа",
        text: "Прогнозный блок перенесен как часть общего контура ДОМ НЕОНА.",
        items: ["Оборот", "Расход", "Маржа", "Чек", "Продаж", "Прибыль"]
      }
    ],
    snapshotSheet: "Прогноз"
  },
  franchises: {
    title: "Франшизы",
    subtitle: "Площадки франшиз и связанные рабочие заметки.",
    cards: [
      {
        title: "Поля листа",
        text: "Справочник площадок сохранен внутри платформы.",
        items: ["Площадка", "Описание"]
      }
    ],
    snapshotSheet: "Площадки франшиз"
  },
  questions: {
    title: "Вопросы",
    subtitle: "Открытые вопросы, вынесенные из исходной модели.",
    cards: [
      {
        title: "Поля листа",
        text: "Лист перенесен как список вопросов для следующего управленческого цикла.",
        items: ["Вопрос", "Комментарий"]
      }
    ],
    snapshotSheet: "Вопросы"
  },
  lead_calc: {
    title: "Калькулятор лида",
    subtitle: "Компактный расчетный лист лидогенерации.",
    cards: [
      {
        title: "Поля листа",
        text: "Формулы и текущие значения сохранены для сверки.",
        items: ["Показатель", "Значение"]
      }
    ],
    snapshotSheet: "Калькулятор Лидогереации"
  }
};

const LIVE_SECTION_BUILDERS = {
  settlements: {
    filterKeys: ["partner", "status", "search"],
    tables: {
      main: {
        label: "Взаиморасчеты",
        columns: [
          { key: "period_label", label: "Период" },
          { key: "partner_label", label: "Партнер" },
          { key: "salary_amount", label: "ЗП, ₽" },
          { key: "purchase_amount", label: "Покупки, ₽" },
          { key: "settlement_total", label: "Итог, ₽" },
          { key: "direction", label: "Кто кому должен" },
          { key: "status", label: "Статус" },
          { key: "note", label: "Комментарий" },
          { key: "updated_at", label: "Обновлено" },
          { key: "actions", label: "Действия" }
        ]
      }
    }
  },
  balance: {
    filterKeys: ["account", "month", "search"],
    tables: {
      main: {
        label: "Баланс",
        columns: [
          { key: "entry_date", label: "Дата" },
          { key: "account_type", label: "Счет" },
          { key: "income_amount", label: "Приход, ₽" },
          { key: "expense_amount", label: "Расход, ₽" },
          { key: "running_total", label: "Баланс, ₽" },
          { key: "note", label: "Комментарий" },
          { key: "updated_at", label: "Обновлено" },
          { key: "actions", label: "Действия" }
        ]
      }
    }
  },
  calendar: {
    filterKeys: ["month", "operation", "account", "status", "search"],
    tables: {
      main: {
        label: "Платежный календарь",
        columns: [
          { key: "payment_date", label: "Дата платежа" },
          { key: "counterparty", label: "Контрагент" },
          { key: "signed_amount", label: "Сумма, ₽" },
          { key: "operation_type", label: "Тип" },
          { key: "category", label: "Статья" },
          { key: "account_name", label: "Счет" },
          { key: "status", label: "Статус" },
          { key: "note", label: "Комментарий" },
          { key: "updated_at", label: "Обновлено" },
          { key: "actions", label: "Действия" }
        ]
      }
    }
  },
  assets: {
    filterKeys: ["search", "payment_filter", "payment_search"],
    tables: {
      assets: {
        label: "Активы",
        columns: [
          { key: "asset_name", label: "Актив" },
          { key: "asset_value", label: "Стоимость, ₽" },
          { key: "paid_total", label: "Выплачено, ₽" },
          { key: "remaining_amount", label: "Остаток, ₽" },
          { key: "note", label: "Комментарий" },
          { key: "updated_at", label: "Обновлено" },
          { key: "actions", label: "Действия" }
        ]
      },
      payments: {
        label: "Выплаты по активам",
        columns: [
          { key: "payment_date", label: "Дата выплаты" },
          { key: "asset_label", label: "Актив" },
          { key: "payment_amount", label: "Сумма, ₽" },
          { key: "note", label: "Комментарий" },
          { key: "updated_at", label: "Обновлено" },
          { key: "actions", label: "Действия" }
        ]
      }
    }
  },
  purchases: {
    filterKeys: ["supplier", "category", "search"],
    tables: {
      main: {
        label: "Закупки",
        columns: [
          { key: "supplier_name", label: "Компания" },
          { key: "supplier_inn", label: "ИНН" },
          { key: "city", label: "Город" },
          { key: "category", label: "Категория" },
          { key: "article", label: "Артикул" },
          { key: "item_name", label: "Наименование" },
          { key: "unit_name", label: "Ед. изм." },
          { key: "price", label: "Цена, ₽" },
          { key: "note", label: "Комментарий" },
          { key: "actions", label: "Действия" }
        ]
      }
    }
  }
};

const LIGHT2_FORMULA_FORMATS = [
  { key: "number", label: "Число" },
  { key: "money", label: "Деньги" },
  { key: "percent", label: "Проценты" },
  { key: "text", label: "Текст" }
];

const STATE = {
  session: null,
  user: null,
  profile: null,
  partnerProfiles: [],
  settlements: [],
  balanceEntries: [],
  calendarEntries: [],
  assets: [],
  assetPayments: [],
  purchaseCatalog: [],
  workbookSnapshot: null,
  workbookReady: false,
  workbookError: "",
  snapshotSearches: {},
  importBusy: false,
  activeSection: readStoredString(LIGHT2_UI_KEYS.activeSection, "overview"),
  schemaReady: true,
  schemaError: "",
  financeReady: true,
  financeError: "",
  operationsReady: true,
  operationsError: "",
  editingSettlementId: null,
  editingBalanceId: null,
  editingCalendarId: null,
  editingAssetId: null,
  editingAssetPaymentId: null,
  editingPurchaseId: null,
  sectionBuilders: readStoredJson(LIGHT2_UI_KEYS.sectionBuilders, {}),
  ui: {
    compactTables: readStoredBoolean(LIGHT2_UI_KEYS.compactTables, false),
    hiddenForms: readStoredJson(LIGHT2_UI_KEYS.hiddenForms, {
      settlements: false,
      balance: false,
      calendar: false,
      assets: false,
      purchases: false
    })
  }
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function readStoredBoolean(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === "true";
  } catch {
    return fallback;
  }
}

function readStoredJson(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? { ...fallback, ...parsed } : fallback;
  } catch {
    return fallback;
  }
}

function readStoredString(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored || fallback;
  } catch {
    return fallback;
  }
}

function persistSectionBuilders() {
  try {
    window.localStorage.setItem(LIGHT2_UI_KEYS.sectionBuilders, JSON.stringify(STATE.sectionBuilders || {}));
  } catch {
    // Ignore storage failures in privacy modes.
  }
}

function createDefaultSectionBuilder(sectionKey) {
  const meta = LIVE_SECTION_BUILDERS[sectionKey];
  if (!meta) {
    return {
      open: false,
      views: [],
      formulas: [],
      tables: {}
    };
  }

  const tables = Object.fromEntries(
    Object.entries(meta.tables).map(([tableKey, tableMeta]) => [
      tableKey,
      tableMeta.columns.map((column) => ({
        key: column.key,
        label: column.label,
        visible: column.key !== "actions"
      }))
    ])
  );

  return {
    open: false,
    views: [],
    formulas: [],
    tables,
    sort: {
      key: "",
      direction: "asc"
    }
  };
}

function sanitizeBuilderKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeBuilderFormula(formula) {
  const key = sanitizeBuilderKey(formula?.key || formula?.label);
  const format = LIGHT2_FORMULA_FORMATS.some((item) => item.key === formula?.format) ? formula.format : "number";
  const expression = String(formula?.expression || "").trim();
  if (!key || !expression) return null;
  return {
    key,
    label: String(formula?.label || key).trim(),
    expression,
    format
  };
}

function normalizeSectionBuilder(sectionKey, raw) {
  const fallback = createDefaultSectionBuilder(sectionKey);
  const meta = LIVE_SECTION_BUILDERS[sectionKey];
  if (!meta || !raw || typeof raw !== "object") return fallback;

  const tables = Object.fromEntries(
    Object.entries(meta.tables).map(([tableKey, tableMeta]) => {
      const savedColumns = Array.isArray(raw.tables?.[tableKey]) ? raw.tables[tableKey] : [];
      const normalized = tableMeta.columns.map((column) => {
        const saved = savedColumns.find((item) => item?.key === column.key) || {};
        return {
          key: column.key,
          label: String(saved.label || column.label).trim() || column.label,
          visible: typeof saved.visible === "boolean" ? saved.visible : column.key !== "actions"
        };
      });
      return [tableKey, normalized];
    })
  );

  const views = Array.isArray(raw.views)
    ? raw.views
        .map((view) => {
          const label = String(view?.label || "").trim();
          const id = sanitizeBuilderKey(view?.id || label);
          const filters = view?.filters && typeof view.filters === "object" ? view.filters : {};
          const sort = view?.sort && typeof view.sort === "object" ? view.sort : {};
          if (!id || !label) return null;
          return {
            id,
            label,
            filters,
            sort: {
              key: String(sort.key || "").trim(),
              direction: sort.direction === "desc" ? "desc" : "asc"
            }
          };
        })
        .filter(Boolean)
    : [];

  const formulas = Array.isArray(raw.formulas)
    ? raw.formulas.map((formula) => normalizeBuilderFormula(formula)).filter(Boolean)
    : [];

  return {
    open: Boolean(raw.open),
    views: views.filter((view, index, list) => list.findIndex((item) => item.id === view.id) === index),
    formulas: formulas.filter((formula, index, list) => list.findIndex((item) => item.key === formula.key) === index),
    tables,
    sort: {
      key: String(raw.sort?.key || "").trim(),
      direction: raw.sort?.direction === "desc" ? "desc" : "asc"
    }
  };
}

function getSectionBuilder(sectionKey) {
  STATE.sectionBuilders[sectionKey] = normalizeSectionBuilder(sectionKey, STATE.sectionBuilders[sectionKey]);
  return STATE.sectionBuilders[sectionKey];
}

function toNumber(value) {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? normalized : 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(toNumber(value));
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "short" }).format(date);
}

function roundMoney(value) {
  return Math.round(toNumber(value) * 100) / 100;
}

function getTodayIso() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function diffDaysFromToday(isoDate) {
  if (!isoDate) return null;
  const today = new Date(`${getTodayIso()}T00:00:00`);
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(today.getTime()) || Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function getOpenSettlementRows(rows = STATE.settlements) {
  const allowedRows = isAdmin()
    ? rows.slice()
    : rows.filter((item) => item.partner_slug === getCurrentPartnerSlug());

  return allowedRows.filter((item) => item.status !== "Взаиморасчет произведен" && item.status !== "Архив");
}

function getLatestUpdatedAt(rows) {
  return rows
    .map((item) => item.updated_at || item.created_at || "")
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || "";
}

function getOverviewSectionFootnote(key) {
  if (key === "balance") {
    const totals = getCurrentBalanceTotals();
    return `${STATE.balanceEntries.length} строк • ${formatMoney(totals.total)} ₽`;
  }

  if (key === "calendar") {
    return `${STATE.calendarEntries.length} строк плана`;
  }

  if (key === "assets") {
    return `${STATE.assets.length} активов • ${STATE.assetPayments.length} выплат`;
  }

  if (key === "settlements") {
    const openRows = getOpenSettlementRows();
    return `${STATE.settlements.length} строк • открыто ${openRows.length}`;
  }

  if (key === "purchases") {
    const suppliers = new Set(STATE.purchaseCatalog.map((item) => String(item.supplier_name || "").trim()).filter(Boolean));
    return `${STATE.purchaseCatalog.length} позиций • ${suppliers.size} поставщиков`;
  }

  const sheetName = SECTION_META[key]?.snapshotSheet;
  const sheet = sheetName ? getSnapshotSheet(key) : null;
  if (sheet && key === "leadgen") {
    const parsed = parseLeadgenSnapshot(sheet);
    const activeBlocks = parsed.blocks.filter((block) => block.dataSeries.length);
    return `${activeBlocks.length} каналов • ${parsed.latestMonthLabel || "без среза"}`;
  }

  if (sheet && key === "metrics") {
    const parsed = parseMetricsSnapshot(sheet);
    const latest = parsed.series.at(-1);
    if (latest) {
      return `${latest.monthLabel} ${latest.yearLabel} • ${formatMoney(latest.revenue)} ₽`;
    }
  }

  if (sheet && key === "finance") {
    const parsed = parseFinmodelSnapshot(sheet);
    const latest = parsed.timeline.at(-1);
    if (latest) {
      return `${latest.monthLabel} ${latest.yearLabel} • ${formatMoney(latest.turnover)} ₽`;
    }
  }
  if (sheet) {
    return `${sheet.nonEmpty || 0} ячеек • ${sheet.formulas || 0} формул`;
  }

  if (sheetName && !STATE.workbookReady) {
    return "Сверяю snapshot...";
  }

  return "Готово к работе";
}

function getLiveSectionFilterState(sectionKey) {
  if (sectionKey === "settlements") {
    return {
      partner: DOM.settlementPartnerFilter?.value || "",
      status: DOM.settlementStatusFilter?.value || "",
      search: DOM.settlementSearch?.value || ""
    };
  }

  if (sectionKey === "balance") {
    const dom = getBalanceDom();
    return {
      account: dom.accountFilter?.value || "",
      month: dom.monthFilter?.value || "",
      search: dom.search?.value || ""
    };
  }

  if (sectionKey === "calendar") {
    const dom = getCalendarDom();
    return {
      month: dom.monthFilter?.value || "",
      operation: dom.operationFilter?.value || "",
      account: dom.accountFilter?.value || "",
      status: dom.statusFilter?.value || "",
      search: dom.search?.value || ""
    };
  }

  if (sectionKey === "assets") {
    const dom = getAssetsDom();
    return {
      search: dom.search?.value || "",
      payment_filter: dom.paymentFilter?.value || "",
      payment_search: dom.paymentSearch?.value || ""
    };
  }

  if (sectionKey === "purchases") {
    const dom = getPurchasesDom();
    return {
      supplier: dom.supplierFilter?.value || "",
      category: dom.categoryFilter?.value || "",
      search: dom.search?.value || ""
    };
  }

  return {};
}

function applyLiveSectionFilterState(sectionKey, filters = {}) {
  if (sectionKey === "settlements") {
    if (DOM.settlementPartnerFilter) DOM.settlementPartnerFilter.value = filters.partner || "";
    if (DOM.settlementStatusFilter) DOM.settlementStatusFilter.value = filters.status || "";
    if (DOM.settlementSearch) DOM.settlementSearch.value = filters.search || "";
    renderSettlements();
    return;
  }

  if (sectionKey === "balance") {
    const dom = getBalanceDom();
    if (dom.accountFilter) dom.accountFilter.value = filters.account || "";
    if (dom.monthFilter) dom.monthFilter.value = filters.month || "";
    if (dom.search) dom.search.value = filters.search || "";
    renderBalance();
    return;
  }

  if (sectionKey === "calendar") {
    const dom = getCalendarDom();
    if (dom.monthFilter) dom.monthFilter.value = filters.month || "";
    if (dom.operationFilter) dom.operationFilter.value = filters.operation || "";
    if (dom.accountFilter) dom.accountFilter.value = filters.account || "";
    if (dom.statusFilter) dom.statusFilter.value = filters.status || "";
    if (dom.search) dom.search.value = filters.search || "";
    renderCalendar();
    return;
  }

  if (sectionKey === "assets") {
    const dom = getAssetsDom();
    if (dom.search) dom.search.value = filters.search || "";
    if (dom.paymentFilter) dom.paymentFilter.value = filters.payment_filter || "";
    if (dom.paymentSearch) dom.paymentSearch.value = filters.payment_search || "";
    renderAssets();
    return;
  }

  if (sectionKey === "purchases") {
    const dom = getPurchasesDom();
    if (dom.supplierFilter) dom.supplierFilter.value = filters.supplier || "";
    if (dom.categoryFilter) dom.categoryFilter.value = filters.category || "";
    if (dom.search) dom.search.value = filters.search || "";
    renderPurchases();
  }
}

function getSectionPrimaryTableKey(sectionKey) {
  const meta = LIVE_SECTION_BUILDERS[sectionKey];
  if (!meta?.tables) return "";
  return Object.keys(meta.tables)[0] || "";
}

function getSectionSortOptions(sectionKey) {
  const tableKey = getSectionPrimaryTableKey(sectionKey);
  if (!tableKey) return [];
  return getSectionTableColumns(sectionKey, tableKey).filter((column) => column.key !== "actions");
}

function getSectionFilterSummary(sectionKey) {
  const filters = getLiveSectionFilterState(sectionKey);
  return Object.values(filters).filter((value) => String(value || "").trim()).length;
}

function getSectionSortState(sectionKey) {
  const builder = getSectionBuilder(sectionKey);
  return {
    key: String(builder.sort?.key || "").trim(),
    direction: builder.sort?.direction === "desc" ? "desc" : "asc"
  };
}

function normalizeSortComparable(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.getTime();

  const numeric = Number(String(value ?? "").replace(/\s+/g, "").replace(",", "."));
  if (String(value ?? "").trim() !== "" && Number.isFinite(numeric)) return numeric;

  const asDate = new Date(String(value ?? ""));
  if (!Number.isNaN(asDate.getTime()) && /\d/.test(String(value ?? ""))) return asDate.getTime();

  return String(value ?? "").trim().toLowerCase();
}

function createSectionSortResolver(sectionKey) {
  if (sectionKey === "settlements") {
    return (row, columnKey) => {
      const math = computeSettlement(row);
      if (columnKey === "partner_label") return getPartnerLabel(row.partner_slug);
      if (columnKey === "salary_amount") return toNumber(math.salary);
      if (columnKey === "purchase_amount") return toNumber(math.purchase);
      if (columnKey === "settlement_total") return toNumber(math.total);
      if (columnKey === "direction") return math.direction;
      return row?.[columnKey];
    };
  }

  if (sectionKey === "balance") {
    const runningMap = buildBalanceRunningMap();
    return (row, columnKey) => {
      if (columnKey === "account_type") return getBalanceAccountLabel(row.account_type);
      if (columnKey === "running_total") return toNumber(runningMap.get(row.id) || 0);
      return row?.[columnKey];
    };
  }

  if (sectionKey === "calendar") {
    return (row, columnKey) => {
      if (columnKey === "signed_amount") return toNumber(signedCalendarAmount(row));
      return row?.[columnKey];
    };
  }

  if (sectionKey === "assets") {
    const paymentTotals = buildAssetPaymentTotals();
    return (row, columnKey) => {
      const paid = toNumber(paymentTotals[row.id] || 0);
      if (columnKey === "paid_total") return paid;
      if (columnKey === "remaining_amount") return roundMoney(toNumber(row.asset_value) - paid);
      return row?.[columnKey];
    };
  }

  if (sectionKey === "purchases") {
    return (row, columnKey) => {
      if (columnKey === "price") return toNumber(row.price);
      return row?.[columnKey];
    };
  }

  return (row, columnKey) => row?.[columnKey];
}

function sortSectionRows(sectionKey, rows) {
  const sort = getSectionSortState(sectionKey);
  if (!sort.key) return rows.slice();
  const resolveValue = createSectionSortResolver(sectionKey);

  return rows.slice().sort((left, right) => {
    const leftValue = normalizeSortComparable(resolveValue(left, sort.key));
    const rightValue = normalizeSortComparable(resolveValue(right, sort.key));

    if (leftValue === rightValue) return 0;
    if (leftValue > rightValue) return sort.direction === "desc" ? -1 : 1;
    return sort.direction === "desc" ? 1 : -1;
  });
}

function getSectionTableColumns(sectionKey, tableKey) {
  return getSectionBuilder(sectionKey).tables?.[tableKey] || [];
}

function getVisibleSectionTableColumns(sectionKey, tableKey) {
  return getSectionTableColumns(sectionKey, tableKey).filter((column) => column.visible);
}

function getLight2FormulaHelpers(records) {
  const count = () => records.length;
  const countWhere = (key, expected) =>
    records.filter((record) => String(record?.[key] ?? "") === String(expected ?? "")).length;
  const sum = (key) => records.reduce((total, record) => total + toNumber(record?.[key]), 0);
  const avg = (key) => (records.length ? sum(key) / records.length : 0);
  const min = (key) => {
    const values = records.map((record) => toNumber(record?.[key])).filter(Number.isFinite);
    return values.length ? Math.min(...values) : 0;
  };
  const max = (key) => {
    const values = records.map((record) => toNumber(record?.[key])).filter(Number.isFinite);
    return values.length ? Math.max(...values) : 0;
  };
  const percent = (part, total) => (toNumber(total) ? (toNumber(part) / toNumber(total)) * 100 : 0);
  return { count, countWhere, sum, avg, min, max, percent, today: getTodayIso() };
}

function formatLight2FormulaValue(format, value) {
  if (format === "money") return `${formatMoney(value)} ₽`;
  if (format === "percent") return `${formatPlainNumber(toNumber(value), 2)}%`;
  if (format === "text") return String(value ?? "—");
  return formatPlainNumber(toNumber(value), 0);
}

function getSectionFormulaRecords(sectionKey) {
  if (sectionKey === "settlements") {
    return getVisibleSettlements().map((item) => {
      const math = computeSettlement(item);
      return {
        ...item,
        salary_amount: toNumber(item.salary_amount),
        purchase_amount: toNumber(item.purchase_amount),
        settlement_total: toNumber(math.total),
        direction: math.direction,
        partner_label: getPartnerLabel(item.partner_slug)
      };
    });
  }

  if (sectionKey === "balance") {
    const runningMap = buildBalanceRunningMap();
    return getVisibleBalanceEntries().map((entry) => ({
      ...entry,
      running_total: toNumber(runningMap.get(entry.id) || 0)
    }));
  }

  if (sectionKey === "calendar") {
    return getVisibleCalendarEntries().map((entry) => ({
      ...entry,
      signed_amount: toNumber(signedCalendarAmount(entry))
    }));
  }

  if (sectionKey === "assets") {
    const paymentTotals = buildAssetPaymentTotals();
    return getVisibleAssets().map((asset) => {
      const paid = toNumber(paymentTotals[asset.id] || 0);
      return {
        ...asset,
        paid_total: paid,
        remaining_amount: roundMoney(toNumber(asset.asset_value) - paid)
      };
    });
  }

  if (sectionKey === "purchases") {
    return getVisiblePurchases().map((item) => ({
      ...item,
      price: toNumber(item.price)
    }));
  }

  return [];
}

function getSectionFormulaCards(sectionKey) {
  const formulas = getSectionBuilder(sectionKey).formulas || [];
  if (!formulas.length) return "";
  const records = getSectionFormulaRecords(sectionKey);
  const helpers = getLight2FormulaHelpers(records);

  return formulas
    .map((formula) => {
      try {
        const value = evaluateSafeFormula(formula.expression || "0", {
          variables: {
            records,
            today: helpers.today
          },
          functions: {
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
        return `
          <article class="summary-card summary-card--builder">
            <span>${escapeHtml(formula.label)}</span>
            <strong>${escapeHtml(formatLight2FormulaValue(formula.format, value))}</strong>
          </article>
        `;
      } catch (error) {
        return `
          <article class="summary-card summary-card--builder">
            <span>${escapeHtml(formula.label)}</span>
            <strong>Ошибка</strong>
          </article>
        `;
      }
    })
    .join("");
}

function getSectionColumnClass(columnKey) {
  if (["salary_amount", "purchase_amount", "settlement_total", "income_amount", "expense_amount", "running_total", "signed_amount", "asset_value", "paid_total", "remaining_amount", "payment_amount", "price"].includes(columnKey)) {
    return "text-end";
  }
  if (columnKey === "updated_at") return "small";
  return "";
}

function syncSectionTableHead(sectionKey, tableKey, bodyNode) {
  const row = bodyNode?.closest("table")?.querySelector("thead tr");
  if (!row) return;
  const columns = getVisibleSectionTableColumns(sectionKey, tableKey);
  row.innerHTML = columns
    .map((column) => `<th class="${escapeHtml(getSectionColumnClass(column.key))}">${escapeHtml(column.label)}</th>`)
    .join("");
}

function renderConfiguredSectionRows(sectionKey, tableKey, rows, renderCell, emptyMessage, emptyTone = "muted") {
  const columns = getVisibleSectionTableColumns(sectionKey, tableKey);
  if (!rows.length) {
    return `<tr><td colspan="${columns.length || 1}" class="${escapeHtml(emptyTone)}">${escapeHtml(emptyMessage)}</td></tr>`;
  }

  return rows
    .map(
      (row) => `
        <tr>
          ${columns
            .map((column) => `<td class="${escapeHtml(getSectionColumnClass(column.key))}">${renderCell(row, column.key)}</td>`)
            .join("")}
        </tr>
      `
    )
    .join("");
}

function renderLiveSectionBuilder(sectionKey) {
  const strip = document.querySelector(`[data-builder-strip="${sectionKey}"]`);
  const host = document.querySelector(`[data-builder-host="${sectionKey}"]`);
  const meta = LIVE_SECTION_BUILDERS[sectionKey];
  if (!strip || !host || !meta) return;

  if (!isAdmin()) {
    strip.innerHTML = "";
    host.innerHTML = "";
    return;
  }

  const builder = getSectionBuilder(sectionKey);
  const sortState = getSectionSortState(sectionKey);
  const sortOptions = getSectionSortOptions(sectionKey);
  const filterCount = getSectionFilterSummary(sectionKey);
  const recordCount = getSectionFormulaRecords(sectionKey).length;
  const viewButtons = builder.views.length
    ? builder.views
        .map(
          (view) => `
            <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-apply="${escapeHtml(sectionKey)}" data-builder-view-id="${escapeHtml(view.id)}">
              ${escapeHtml(view.label)}
            </button>
          `
        )
        .join("")
    : "";
  const savedViews = builder.views.length
    ? builder.views
        .map((view) => {
          const viewFilterCount = Object.values(view.filters || {}).filter((value) =>
            String(value || "").trim()
          ).length;
          const viewSortLabel = view.sort?.key
            ? sortOptions.find((column) => column.key === view.sort.key)?.label || view.sort.key
            : "Без сортировки";
          const directionLabel = view.sort?.key ? (view.sort?.direction === "desc" ? "↓" : "↑") : "";
          return `
            <div class="builder-view-chip">
              <div>
                <strong>${escapeHtml(view.label)}</strong>
                <span>Фильтров: ${viewFilterCount} • Сортировка: ${escapeHtml(viewSortLabel)} ${directionLabel}</span>
              </div>
              <div class="builder-view-chip__actions">
                <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-apply="${escapeHtml(sectionKey)}" data-builder-view-id="${escapeHtml(view.id)}">Применить</button>
                <button type="button" class="btn btn-outline-danger btn-sm" data-builder-view-delete="${escapeHtml(sectionKey)}" data-builder-view-id="${escapeHtml(view.id)}">Удалить</button>
              </div>
            </div>
          `;
        })
        .join("")
    : '<div class="builder-note">Сохранённых видов пока нет.</div>';
  const sortOptionsHtml = [
    '<option value="">Без сортировки</option>',
    ...sortOptions.map(
      (column) =>
        `<option value="${escapeHtml(column.key)}" ${sortState.key === column.key ? "selected" : ""}>${escapeHtml(column.label)}</option>`
    )
  ].join("");

  strip.innerHTML = `
    <div class="light2-builder-strip__meta">
      <strong>Конструктор секции</strong>
      <span>Виды, колонки, фильтры, сортировку и KPI можно настраивать без правки кода.</span>
    </div>
    <div class="light2-builder-strip__actions">
      ${viewButtons}
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-save="${escapeHtml(sectionKey)}">Сохранить текущий вид</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-filters-reset="${escapeHtml(sectionKey)}">Сбросить фильтры</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-export="${escapeHtml(sectionKey)}">Экспорт схемы</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-import="${escapeHtml(sectionKey)}">Импорт схемы</button>
      <button type="button" class="btn ${builder.open ? "btn-dark" : "btn-outline-dark"} btn-sm" data-builder-toggle="${escapeHtml(sectionKey)}">
        ${builder.open ? "Скрыть конструктор" : "Открыть конструктор"}
      </button>
    </div>
  `;

  if (!builder.open) {
    host.innerHTML = "";
    return;
  }

  const columnCards = Object.entries(meta.tables)
    .map(([tableKey, tableMeta]) => {
      const columns = getSectionTableColumns(sectionKey, tableKey);
      return `
        <div class="builder-card">
          <div class="builder-card__head">
            <strong>${escapeHtml(tableMeta.label)}</strong>
            <span>Можно переименовать и скрыть колонки.</span>
          </div>
          <div class="builder-column-list" data-builder-columns="${escapeHtml(sectionKey)}" data-builder-table="${escapeHtml(tableKey)}">
            ${columns
              .map(
                (column) => `
                  <label class="builder-column-row">
                    <input type="checkbox" data-builder-column-visible="${escapeHtml(column.key)}" ${column.visible ? "checked" : ""} />
                    <span>${escapeHtml(column.key)}</span>
                    <input class="form-control form-control-sm" type="text" value="${escapeHtml(column.label)}" data-builder-column-label="${escapeHtml(column.key)}" />
                  </label>
                `
              )
              .join("")}
          </div>
          <div class="builder-actions">
            <button type="button" class="btn btn-dark btn-sm" data-builder-columns-save="${escapeHtml(sectionKey)}" data-builder-table-save="${escapeHtml(tableKey)}">Сохранить колонки</button>
          </div>
        </div>
      `;
    })
    .join("");

  const formulas = builder.formulas.length
    ? builder.formulas
        .map(
          (formula) => `
            <div class="builder-list-item">
              <div>
                <strong>${escapeHtml(formula.label)}</strong>
                <span>${escapeHtml(formula.expression)}</span>
              </div>
              <button type="button" class="btn btn-outline-danger btn-sm" data-builder-formula-delete="${escapeHtml(sectionKey)}" data-builder-formula-key="${escapeHtml(formula.key)}">Удалить</button>
            </div>
          `
        )
        .join("")
    : '<div class="builder-note">Формул пока нет.</div>';

  host.innerHTML = `
    <div class="light2-builder-grid">
      <div class="builder-card builder-card--wide">
        <div class="builder-card__head">
          <strong>Фильтры, сортировка и сохранённые виды</strong>
          <span>Управляйте тем, как команда видит секцию: фильтры, порядок строк и пресеты для разных сценариев.</span>
        </div>
        <div class="overview-inline-stats builder-kpi-row">
          <div>
            <span>Строк в текущем срезе</span>
            <strong>${recordCount}</strong>
          </div>
          <div>
            <span>Активных фильтров</span>
            <strong>${filterCount}</strong>
          </div>
          <div>
            <span>Сохранённых видов</span>
            <strong>${builder.views.length}</strong>
          </div>
        </div>
        <div class="builder-form-grid mt-3">
          <select class="form-select" data-builder-sort-key="${escapeHtml(sectionKey)}">
            ${sortOptionsHtml}
          </select>
          <select class="form-select" data-builder-sort-direction="${escapeHtml(sectionKey)}">
            <option value="asc" ${sortState.direction === "asc" ? "selected" : ""}>По возрастанию</option>
            <option value="desc" ${sortState.direction === "desc" ? "selected" : ""}>По убыванию</option>
          </select>
          <button type="button" class="btn btn-dark btn-sm" data-builder-sort-save="${escapeHtml(sectionKey)}">Сохранить сортировку</button>
        </div>
        <div class="builder-actions">
          <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-save="${escapeHtml(sectionKey)}">Сохранить вид с фильтрами</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-builder-filters-reset="${escapeHtml(sectionKey)}">Очистить фильтры секции</button>
        </div>
      </div>
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>Сохранённые виды</strong>
          <span>Быстрые пресеты для владельца, финансового блока, сверки и любых своих сценариев.</span>
        </div>
        <div class="builder-list">${savedViews}</div>
      </div>
      ${columnCards}
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>KPI и формулы</strong>
          <span>Доступны функции: count(), countWhere(), sum(), avg(), min(), max(), percent().</span>
        </div>
        <div class="builder-form-grid">
          <input class="form-control" type="text" placeholder="Ключ, например open_total" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="key" />
          <input class="form-control" type="text" placeholder="Название карточки" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="label" />
          <select class="form-select" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="format">
            ${LIGHT2_FORMULA_FORMATS.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}
          </select>
          <input class="form-control builder-form-grid__wide" type="text" placeholder='Например: sum("signed_amount")' data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="expression" />
          <button type="button" class="btn btn-dark btn-sm" data-builder-formula-save="${escapeHtml(sectionKey)}">Добавить формулу</button>
        </div>
        <div class="builder-list mt-3">${formulas}</div>
      </div>
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>JSON-схема секции</strong>
          <span>Для максимально гибкой настройки можно править секцию целиком одним JSON или переносить конфиг между базами.</span>
        </div>
        <textarea class="form-control builder-schema" data-builder-schema="${escapeHtml(sectionKey)}" rows="18">${escapeHtml(JSON.stringify({
          views: builder.views,
          formulas: builder.formulas,
          tables: builder.tables,
          sort: builder.sort
        }, null, 2))}</textarea>
        <div class="builder-actions">
          <button type="button" class="btn btn-dark btn-sm" data-builder-schema-save="${escapeHtml(sectionKey)}">Сохранить JSON-схему</button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-builder-reset="${escapeHtml(sectionKey)}">Сбросить секцию</button>
        </div>
      </div>
    </div>
  `;
}

function rerenderLiveSection(sectionKey) {
  if (sectionKey === "settlements") {
    renderSettlements();
    return;
  }
  if (sectionKey === "balance") {
    renderBalance();
    return;
  }
  if (sectionKey === "calendar") {
    renderCalendar();
    return;
  }
  if (sectionKey === "assets") {
    renderAssets();
    return;
  }
  if (sectionKey === "purchases") {
    renderPurchases();
  }
}

function toggleSectionBuilder(sectionKey) {
  const builder = getSectionBuilder(sectionKey);
  builder.open = !builder.open;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
}

function saveCurrentSectionView(sectionKey) {
  const label = window.prompt("Название вида");
  if (!label) return;
  const builder = getSectionBuilder(sectionKey);
  const viewId = sanitizeBuilderKey(label);
  if (!viewId) {
    throw new Error("Не удалось создать ключ вида. Используйте название с буквами или цифрами.");
  }
  const filters = getLiveSectionFilterState(sectionKey);
  builder.views = [
    ...builder.views.filter((view) => view.id !== viewId),
    {
      id: viewId,
      label: String(label).trim(),
      filters,
      sort: { ...getSectionSortState(sectionKey) }
    }
  ];
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  setStatus(`Вид секции сохранён: ${label}.`, "success");
}

function applySectionView(sectionKey, viewId) {
  const builder = getSectionBuilder(sectionKey);
  const view = builder.views.find((item) => item.id === viewId);
  if (!view) return;
  builder.sort = {
    key: String(view.sort?.key || "").trim(),
    direction: view.sort?.direction === "desc" ? "desc" : "asc"
  };
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  applyLiveSectionFilterState(sectionKey, view.filters || {});
  setStatus(`Применён вид: ${view.label}.`, "success");
}

function clearSectionFilters(sectionKey) {
  applyLiveSectionFilterState(sectionKey, {});
  setStatus("Фильтры секции очищены.", "success");
}

function saveSectionSort(sectionKey) {
  const keyInput = document.querySelector(`[data-builder-sort-key="${sectionKey}"]`);
  const directionInput = document.querySelector(`[data-builder-sort-direction="${sectionKey}"]`);
  const builder = getSectionBuilder(sectionKey);
  builder.sort = {
    key: String(keyInput?.value || "").trim(),
    direction: directionInput?.value === "desc" ? "desc" : "asc"
  };
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("Сортировка секции сохранена.", "success");
}

function deleteSectionView(sectionKey, viewId) {
  const builder = getSectionBuilder(sectionKey);
  const view = builder.views.find((item) => item.id === viewId);
  if (!view) return;
  if (!window.confirm(`Удалить сохранённый вид "${view.label}"?`)) return;
  builder.views = builder.views.filter((item) => item.id !== viewId);
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  setStatus(`Вид удалён: ${view.label}.`, "success");
}

async function exportSectionBuilder(sectionKey) {
  const builder = getSectionBuilder(sectionKey);
  const payload = JSON.stringify(
    {
      views: builder.views,
      formulas: builder.formulas,
      tables: builder.tables,
      sort: builder.sort
    },
    null,
    2
  );

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(payload);
      setStatus("JSON-схема секции скопирована в буфер обмена.", "success");
      return;
    } catch {
      // Fallback below.
    }
  }

  window.prompt("Скопируйте JSON-схему секции вручную", payload);
  setStatus("JSON-схема секции подготовлена для копирования.", "success");
}

async function importSectionBuilder(sectionKey) {
  let suggestion = "";
  if (navigator.clipboard?.readText) {
    try {
      suggestion = await navigator.clipboard.readText();
    } catch {
      suggestion = "";
    }
  }

  const raw = window.prompt("Вставьте JSON-схему секции", suggestion);
  if (!raw) return;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON не распознан: ${error.message || "ошибка синтаксиса"}`);
  }

  STATE.sectionBuilders[sectionKey] = normalizeSectionBuilder(sectionKey, {
    ...parsed,
    open: true
  });
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("JSON-схема секции импортирована.", "success");
}

function saveSectionColumns(sectionKey, tableKey) {
  const host = document.querySelector(
    `[data-builder-columns="${sectionKey}"][data-builder-table="${tableKey}"]`
  );
  if (!host) return;
  const builder = getSectionBuilder(sectionKey);
  const columns = getSectionTableColumns(sectionKey, tableKey).map((column) => {
    const labelInput = host.querySelector(`[data-builder-column-label="${column.key}"]`);
    const visibleInput = host.querySelector(`[data-builder-column-visible="${column.key}"]`);
    return {
      ...column,
      label: String(labelInput?.value || column.label || column.key).trim() || column.key,
      visible: Boolean(visibleInput?.checked)
    };
  });
  builder.tables[tableKey] = columns;
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("Настройки колонок сохранены.", "success");
}

function clearSectionFormulaInputs(sectionKey) {
  document
    .querySelectorAll(`[data-builder-formula-input="${sectionKey}"]`)
    .forEach((input) => {
      if (input.tagName === "SELECT") {
        input.value = "number";
      } else {
        input.value = "";
      }
    });
}

function saveSectionFormula(sectionKey) {
  const values = {};
  document
    .querySelectorAll(`[data-builder-formula-input="${sectionKey}"]`)
    .forEach((input) => {
      values[input.dataset.builderField] = input.value;
    });

  const formula = normalizeBuilderFormula(values);
  if (!formula) {
    throw new Error("Укажите ключ, название и формулу для KPI.");
  }

  const builder = getSectionBuilder(sectionKey);
  builder.formulas = [
    ...builder.formulas.filter((item) => item.key !== formula.key),
    formula
  ];
  builder.open = true;
  persistSectionBuilders();
  clearSectionFormulaInputs(sectionKey);
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus(`KPI сохранён: ${formula.label}.`, "success");
}

function deleteSectionFormula(sectionKey, formulaKey) {
  const builder = getSectionBuilder(sectionKey);
  builder.formulas = builder.formulas.filter((item) => item.key !== formulaKey);
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("Формула удалена.", "success");
}

function saveSectionSchema(sectionKey) {
  const textarea = document.querySelector(`[data-builder-schema="${sectionKey}"]`);
  if (!textarea) return;
  let parsed;
  try {
    parsed = JSON.parse(textarea.value);
  } catch (error) {
    throw new Error(`JSON не распознан: ${error.message || "ошибка синтаксиса"}`);
  }

  STATE.sectionBuilders[sectionKey] = normalizeSectionBuilder(sectionKey, {
    ...parsed,
    open: true
  });
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("JSON-схема секции сохранена.", "success");
}

function resetSectionBuilder(sectionKey) {
  STATE.sectionBuilders[sectionKey] = createDefaultSectionBuilder(sectionKey);
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("Секция сброшена к базовой конфигурации.", "success");
}

function renderLiveOverviewSummary() {
  if (!DOM.liveOverviewSummary) return;

  const totals = getCurrentBalanceTotals();
  const openSettlements = getOpenSettlementRows();
  const upcomingCalendar = STATE.calendarEntries.filter((entry) => {
    if (!entry.payment_date || entry.status === "Отменен") return false;
    const diff = diffDaysFromToday(entry.payment_date);
    return diff !== null && diff <= 14;
  });
  const upcomingIncoming = upcomingCalendar
    .filter((entry) => entry.operation_type === "Приход")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const upcomingOutgoing = upcomingCalendar
    .filter((entry) => entry.operation_type === "Расход")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const totalAssetValue = STATE.assets.reduce((sum, item) => sum + toNumber(item.asset_value), 0);
  const totalAssetPaid = STATE.assetPayments.reduce((sum, item) => sum + toNumber(item.payment_amount), 0);
  const remainingAssetValue = roundMoney(totalAssetValue - totalAssetPaid);

  DOM.liveOverviewSummary.innerHTML = `
    <article class="summary-card">
      <span>Баланс компании сейчас</span>
      <strong>${formatMoney(totals.total)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Поступления на 14 дней</span>
      <strong>${formatMoney(upcomingIncoming)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Платежи на 14 дней</span>
      <strong>${formatMoney(upcomingOutgoing)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Открытые взаиморасчеты</span>
      <strong>${openSettlements.length}</strong>
    </article>
    <article class="summary-card">
      <span>Остаток по активам</span>
      <strong>${formatMoney(remainingAssetValue)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Позиции закупок</span>
      <strong>${STATE.purchaseCatalog.length}</strong>
    </article>
  `;
}

function renderLiveOverviewPanels() {
  if (!DOM.liveOverviewPanels) return;

  const totals = getCurrentBalanceTotals();
  const latestFinanceUpdate = getLatestUpdatedAt([...STATE.balanceEntries, ...STATE.calendarEntries]);
  const urgentCalendarRows = STATE.calendarEntries
    .filter((entry) => {
      if (!entry.payment_date || entry.status === "Отменен") return false;
      const diff = diffDaysFromToday(entry.payment_date);
      return diff !== null && diff <= 14;
    })
    .sort((a, b) => {
      const diffA = diffDaysFromToday(a.payment_date);
      const diffB = diffDaysFromToday(b.payment_date);
      return diffA - diffB;
    })
    .slice(0, 6);

  const openSettlements = getOpenSettlementRows()
    .map((item) => ({ ...item, settlementTotal: computeSettlement(item).total }))
    .sort((a, b) => Math.abs(b.settlementTotal) - Math.abs(a.settlementTotal))
    .slice(0, 5);

  const totalAssetValue = STATE.assets.reduce((sum, item) => sum + toNumber(item.asset_value), 0);
  const totalAssetPaid = STATE.assetPayments.reduce((sum, item) => sum + toNumber(item.payment_amount), 0);
  const recentPurchases = STATE.purchaseCatalog
    .slice()
    .sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0))
    .slice(0, 4);
  const uniqueSuppliers = new Set(STATE.purchaseCatalog.map((item) => String(item.supplier_name || "").trim()).filter(Boolean));
  const uniqueCategories = new Set(STATE.purchaseCatalog.map((item) => String(item.category || "").trim()).filter(Boolean));

  const accountItems = BALANCE_ACCOUNTS.map(
    (account) => `
      <div class="overview-list-item">
        <span>${escapeHtml(account.label)}</span>
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} ₽</strong>
      </div>
    `
  ).join("");

  const paymentItems = urgentCalendarRows.length
    ? urgentCalendarRows
        .map((entry) => {
          const diff = diffDaysFromToday(entry.payment_date);
          const dueLabel = diff < 0 ? `Просрочено на ${Math.abs(diff)} дн.` : diff === 0 ? "Сегодня" : `Через ${diff} дн.`;
          return `
            <div class="overview-list-item">
              <div>
                <strong>${escapeHtml(entry.counterparty || "Без контрагента")}</strong>
                <span>${escapeHtml(formatDate(entry.payment_date))} • ${escapeHtml(dueLabel)}</span>
              </div>
              <strong class="${entry.operation_type === "Приход" ? "amount-positive" : "amount-negative"}">
                ${entry.operation_type === "Приход" ? "+" : "-"}${formatMoney(entry.amount)} ₽
              </strong>
            </div>
          `;
        })
        .join("")
    : `<div class="muted">На ближайшие 14 дней новых платежей не найдено.</div>`;

  const settlementItems = openSettlements.length
    ? openSettlements
        .map(
          (item) => `
            <div class="overview-list-item">
              <div>
                <strong>${escapeHtml(getPartnerLabel(item.partner_slug))}</strong>
                <span>${escapeHtml(item.period_label)}</span>
              </div>
              <strong class="${item.settlementTotal >= 0 ? "amount-positive" : "amount-negative"}">
                ${item.settlementTotal >= 0 ? "+" : ""}${formatMoney(item.settlementTotal)} ₽
              </strong>
            </div>
          `
        )
        .join("")
    : `<div class="muted">Открытых взаиморасчетов сейчас нет.</div>`;

  const purchaseItems = recentPurchases.length
    ? recentPurchases
        .map(
          (item) => `
            <div class="overview-list-item">
              <div>
                <strong>${escapeHtml(item.item_name || item.article || "Позиция")}</strong>
                <span>${escapeHtml(item.supplier_name || "Без поставщика")} • ${escapeHtml(item.category || "Без категории")}</span>
              </div>
              <strong>${formatMoney(item.price)} ₽</strong>
            </div>
          `
        )
        .join("")
    : `<div class="muted">Каталог закупок пока пуст.</div>`;

  DOM.liveOverviewPanels.innerHTML = `
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Финансы сейчас</div>
      <h3>Деньги по контурам</h3>
      <div class="overview-list">${accountItems}</div>
      <div class="overview-panel-footnote">Последнее обновление: ${escapeHtml(formatDateTime(latestFinanceUpdate))}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Ближайшие даты</div>
      <h3>Платежный радар</h3>
      <div class="overview-list">${paymentItems}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Партнеры</div>
      <h3>Кому нужно уделить внимание</h3>
      <div class="overview-list">${settlementItems}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Активы и закупки</div>
      <h3>Материальная база</h3>
      <div class="overview-inline-stats">
        <div><span>Активов</span><strong>${STATE.assets.length}</strong></div>
        <div><span>Стоимость</span><strong>${formatMoney(totalAssetValue)} ₽</strong></div>
        <div><span>Выплачено</span><strong>${formatMoney(totalAssetPaid)} ₽</strong></div>
        <div><span>Поставщиков</span><strong>${uniqueSuppliers.size}</strong></div>
        <div><span>Категорий</span><strong>${uniqueCategories.size}</strong></div>
        <div><span>Закупок</span><strong>${STATE.purchaseCatalog.length}</strong></div>
      </div>
      <div class="overview-list mt-3">${purchaseItems}</div>
    </article>
  `;
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function parseWorkbookNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const normalized = String(value)
    .replace(/[\u00A0\u202F\s]/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRuDateToIso(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function getWorkbookSheetByName(name) {
  return STATE.workbookSnapshot?.sheets?.find((sheet) => sheet.name === name) || null;
}

function getWorkbookCell(row, col) {
  return row?.cells?.[String(col)] || null;
}

function getWorkbookDisplay(row, col) {
  return getWorkbookCell(row, col)?.display || "";
}

function getWorkbookRaw(row, col) {
  return getWorkbookCell(row, col)?.raw ?? "";
}

function chunkArray(items, chunkSize = 200) {
  const chunks = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

function isOnConflictConstraintError(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("there is no unique or exclusion constraint matching the on conflict specification");
}

function buildCompositeKey(row, fields) {
  return fields.map((field) => String(row?.[field] ?? "")).join("::");
}

async function syncRowsWithoutUpsert(tableName, rows, onConflict) {
  const conflictFields = String(onConflict || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!rows.length || !conflictFields.length) return;

  const dedupedRows = Array.from(
    rows.reduce((map, row) => {
      map.set(buildCompositeKey(row, conflictFields), row);
      return map;
    }, new Map()).values()
  );

  const selectFields = Array.from(new Set(["id", ...conflictFields])).join(", ");
  const existingRows = [];

  if (conflictFields.includes("source_sheet")) {
    const sourceSheets = [...new Set(dedupedRows.map((row) => row.source_sheet).filter(Boolean))];

    for (const sourceSheet of sourceSheets) {
      const scopedRows = dedupedRows.filter((row) => row.source_sheet === sourceSheet);
      const sourceRowValues = conflictFields.includes("source_row")
        ? [...new Set(scopedRows.map((row) => row.source_row).filter((value) => value !== null && value !== undefined))]
        : [];

      if (!sourceRowValues.length) {
        const { data, error } = await supabase.from(tableName).select(selectFields).eq("source_sheet", sourceSheet);
        if (error) throw error;
        existingRows.push(...(data || []));
        continue;
      }

      for (const rowBatch of chunkArray(sourceRowValues, 150)) {
        const { data, error } = await supabase
          .from(tableName)
          .select(selectFields)
          .eq("source_sheet", sourceSheet)
          .in("source_row", rowBatch);
        if (error) throw error;
        existingRows.push(...(data || []));
      }
    }
  } else {
    const { data, error } = await supabase.from(tableName).select(selectFields);
    if (error) throw error;
    existingRows.push(...(data || []));
  }

  const existingMap = new Map();
  existingRows.forEach((row) => {
    const key = buildCompositeKey(row, conflictFields);
    if (!existingMap.has(key)) {
      existingMap.set(key, row.id);
    }
  });

  const inserts = [];
  const updates = [];

  dedupedRows.forEach((row) => {
    const existingId = existingMap.get(buildCompositeKey(row, conflictFields));
    if (existingId) {
      updates.push({ id: existingId, ...row });
    } else {
      inserts.push(row);
    }
  });

  for (const batch of chunkArray(inserts)) {
    if (!batch.length) continue;
    const { error } = await supabase.from(tableName).insert(batch);
    if (error) throw error;
  }

  for (const batch of chunkArray(updates, 40)) {
    const results = await Promise.all(
      batch.map(async (row) => {
        const { id, ...payload } = row;
        return supabase.from(tableName).update(payload).eq("id", id);
      })
    );

    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;
  }
}

function isAdmin() {
  return STATE.profile?.role === "owner" || STATE.profile?.role === "admin";
}

function isSectionAllowed(sectionKey) {
  return isAdmin() || sectionKey === "overview" || sectionKey === "settlements";
}

function isSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return error?.code === "42P01" || message.includes("light2_partner_settlements");
}

function isFinanceSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.code === "42P01" ||
    message.includes("light2_balance_entries") ||
    message.includes("light2_payment_calendar_entries")
  );
}

function isOperationsSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.code === "42P01" ||
    message.includes("light2_assets") ||
    message.includes("light2_asset_payments") ||
    message.includes("light2_purchase_catalog")
  );
}

function getCurrentPartnerSlug() {
  if (STATE.profile?.partner_slug) return STATE.profile.partner_slug;
  const linkedPartner = STATE.partnerProfiles.find((partner) => partner.owner_user_id === STATE.user?.id);
  return linkedPartner?.slug || "";
}

function getPartnerLabel(slug) {
  const cleanSlug = sanitizeSlug(slug);
  const partner = STATE.partnerProfiles.find((item) => item.slug === cleanSlug);
  return partner?.display_name || cleanSlug || "—";
}

function getBalanceAccountLabel(accountType) {
  return BALANCE_ACCOUNTS.find((item) => item.value === accountType)?.label || "—";
}

function signedCalendarAmount(entry) {
  const amount = toNumber(entry?.amount);
  return entry?.operation_type === "Приход" ? amount : -amount;
}

function computeSettlement(entry) {
  const salary = toNumber(entry?.salary_amount);
  const purchase = toNumber(entry?.purchase_amount);
  const total = Math.round((salary - purchase) * 100) / 100;
  let direction = "Баланс закрыт";

  if (entry?.status === "Взаиморасчет произведен") {
    direction = "Взаиморасчёт закрыт";
  } else if (total > 0) {
    direction = "Компания должна партнеру";
  } else if (total < 0) {
    direction = "Партнер должен компании";
  }

  return { salary, purchase, total, direction };
}

function getStatusTone(status) {
  if (status === "К выплате") return "status-ready";
  if (status === "Взаиморасчет произведен") return "status-closed";
  if (status === "Спор") return "status-dispute";
  if (status === "Архив") return "status-archive";
  return "status-open";
}

function setStatus(message, tone = "") {
  DOM.statusBox.textContent = message;
  DOM.statusBox.className = `status-card${tone ? ` ${tone}` : ""}`;
}

function setModuleState(label) {
  DOM.moduleState.textContent = label;
}

function setImportStatus(message, tone = "") {
  if (!DOM.importWorkbookStatus) return;
  DOM.importWorkbookStatus.textContent = message;
  DOM.importWorkbookStatus.className = `scope-note mb-3${tone ? ` scope-note-${tone}` : ""}`;
}

function syncImportButton() {
  if (!DOM.importWorkbookButton) return;

  const available = isAdmin() && STATE.workbookReady && hasImportableWorkbookData();
  DOM.importWorkbookButton.disabled = STATE.importBusy || !available;
  DOM.importWorkbookButton.textContent = STATE.importBusy
    ? "Импортирую исходник..."
    : "Импортировать заполненный исходник";

  if (!isAdmin()) {
    DOM.importWorkbookButton.classList.add("d-none");
    setImportStatus("Импорт исходного файла доступен только владельцу и администраторам.");
    return;
  }

  DOM.importWorkbookButton.classList.remove("d-none");

  if (STATE.workbookError) {
    setImportStatus(`Сверочный файл не загрузился: ${STATE.workbookError}`, "error");
    return;
  }

  if (!STATE.workbookReady) {
    setImportStatus("Подготавливаю заполненный исходник для импорта...");
    return;
  }

  if (!hasImportableWorkbookData()) {
    setImportStatus("Эталон ДОМ НЕОНА сейчас пустой. Платформа стартует с чистой базы, импорт пока не нужен.");
    return;
  }

  if (!STATE.financeReady || !STATE.operationsReady || !STATE.schemaReady) {
    setImportStatus("Перед импортом выполните SQL-патчи ДОМ НЕОНА для схемы, финансов, операций и workbook sync.", "error");
    return;
  }

  setImportStatus("Импорт переносит заполненные блоки исходного файла в рабочие таблицы платформы без дублей.");
}

function persistWorkspaceUi() {
  try {
    window.localStorage.setItem(LIGHT2_UI_KEYS.compactTables, String(STATE.ui.compactTables));
    window.localStorage.setItem(LIGHT2_UI_KEYS.hiddenForms, JSON.stringify(STATE.ui.hiddenForms));
    window.localStorage.setItem(LIGHT2_UI_KEYS.activeSection, STATE.activeSection);
  } catch {
    // Ignore localStorage failures in private browsing.
  }
}

function isSectionFormHidden(sectionKey) {
  return Boolean(STATE.ui.hiddenForms?.[sectionKey]);
}

function applyRecordFormsVisibility() {
  const pairs = [
    { section: "settlements", nodes: [DOM.settlementForm] },
    { section: "balance", nodes: [getBalanceDom().form] },
    { section: "calendar", nodes: [getCalendarDom().form] },
    { section: "assets", nodes: [getAssetsDom().assetForm, getAssetsDom().paymentForm] },
    { section: "purchases", nodes: [getPurchasesDom().form] }
  ];

  pairs.forEach(({ section, nodes }) => {
    const shouldHide = !isAdmin() || isSectionFormHidden(section);
    nodes.forEach((node) => {
      node?.classList.toggle("is-hidden", shouldHide);
    });
    document.querySelectorAll(`[data-form-toggle="${section}"]`).forEach((button) => {
      button.textContent = shouldHide ? "Показать форму" : "Скрыть форму";
      button.classList.toggle("btn-dark", !shouldHide);
      button.classList.toggle("btn-outline-dark", shouldHide);
    });
  });

  if (DOM.toggleAllFormsButton) {
    const hiddenCount = Object.values(STATE.ui.hiddenForms || {}).filter(Boolean).length;
    const totalForms = Object.keys(STATE.ui.hiddenForms || {}).length || 1;
    const allHidden = hiddenCount >= totalForms;
    DOM.toggleAllFormsButton.textContent = allHidden ? "Показать формы" : "Скрыть формы";
    DOM.toggleAllFormsButton.classList.toggle("btn-dark", allHidden);
    DOM.toggleAllFormsButton.classList.toggle("btn-outline-dark", !allHidden);
  }
}

function syncWorkspaceModeUi() {
  document.body.classList.toggle("compact-tables", STATE.ui.compactTables);
  if (DOM.toggleCompactTablesButton) {
    DOM.toggleCompactTablesButton.textContent = STATE.ui.compactTables ? "Обычные таблицы" : "Компактные таблицы";
    DOM.toggleCompactTablesButton.classList.toggle("btn-dark", STATE.ui.compactTables);
    DOM.toggleCompactTablesButton.classList.toggle("btn-outline-dark", !STATE.ui.compactTables);
  }

  const hiddenCount = Object.values(STATE.ui.hiddenForms || {}).filter(Boolean).length;
  if (DOM.workspaceModeLabel) {
    DOM.workspaceModeLabel.textContent = STATE.ui.compactTables
      ? `Компактный режим включен. Скрытых форм: ${hiddenCount}.`
      : `Стандартный режим таблиц. Скрытых форм: ${hiddenCount}.`;
  }

  applyRecordFormsVisibility();
}

function setSectionFormHidden(sectionKey, hidden) {
  if (!Object.prototype.hasOwnProperty.call(STATE.ui.hiddenForms, sectionKey)) return;
  STATE.ui.hiddenForms[sectionKey] = hidden;
  persistWorkspaceUi();
  syncWorkspaceModeUi();
}

function toggleSectionForm(sectionKey) {
  setSectionFormHidden(sectionKey, !isSectionFormHidden(sectionKey));
}

function toggleAllForms() {
  const hasVisibleForm = Object.values(STATE.ui.hiddenForms || {}).some((hidden) => !hidden);
  Object.keys(STATE.ui.hiddenForms || {}).forEach((key) => {
    STATE.ui.hiddenForms[key] = hasVisibleForm;
  });
  persistWorkspaceUi();
  syncWorkspaceModeUi();
}

function ensureSectionFormVisible(sectionKey) {
  if (!isAdmin()) return;
  if (isSectionFormHidden(sectionKey)) {
    setSectionFormHidden(sectionKey, false);
  }
}

function getBalanceDom() {
  return {
    scopeNote: document.getElementById("balanceScopeNote"),
    form: document.getElementById("balanceForm"),
    preview: document.getElementById("balancePreview"),
    submitButton: document.getElementById("balanceSubmitButton"),
    resetButton: document.getElementById("balanceResetButton"),
    accountFilter: document.getElementById("balanceAccountFilter"),
    monthFilter: document.getElementById("balanceMonthFilter"),
    search: document.getElementById("balanceSearch"),
    summary: document.getElementById("balanceSummary"),
    tableBody: document.getElementById("balanceTableBody"),
    actionsHead: document.getElementById("balanceActionsHead"),
    refreshButton: document.getElementById("refreshBalanceButton")
  };
}

function getCalendarDom() {
  return {
    scopeNote: document.getElementById("calendarScopeNote"),
    form: document.getElementById("calendarForm"),
    preview: document.getElementById("calendarPreview"),
    submitButton: document.getElementById("calendarSubmitButton"),
    resetButton: document.getElementById("calendarResetButton"),
    monthFilter: document.getElementById("calendarMonthFilter"),
    operationFilter: document.getElementById("calendarOperationFilter"),
    accountFilter: document.getElementById("calendarAccountFilter"),
    statusFilter: document.getElementById("calendarStatusFilter"),
    search: document.getElementById("calendarSearch"),
    summary: document.getElementById("calendarSummary"),
    tableBody: document.getElementById("calendarTableBody"),
    actionsHead: document.getElementById("calendarActionsHead"),
    refreshButton: document.getElementById("refreshCalendarButton")
  };
}

function getAssetsDom() {
  return {
    scopeNote: document.getElementById("assetsScopeNote"),
    assetForm: document.getElementById("assetForm"),
    assetSubmitButton: document.getElementById("assetSubmitButton"),
    assetResetButton: document.getElementById("assetResetButton"),
    paymentForm: document.getElementById("assetPaymentForm"),
    paymentSubmitButton: document.getElementById("assetPaymentSubmitButton"),
    paymentResetButton: document.getElementById("assetPaymentResetButton"),
    paymentAssetSelect: document.getElementById("assetPaymentAssetId"),
    summary: document.getElementById("assetsSummary"),
    search: document.getElementById("assetsSearch"),
    assetTableBody: document.getElementById("assetsTableBody"),
    paymentFilter: document.getElementById("assetPaymentFilter"),
    paymentSearch: document.getElementById("assetPaymentSearch"),
    paymentTableBody: document.getElementById("assetPaymentsTableBody"),
    refreshButton: document.getElementById("refreshAssetsButton")
  };
}

function getPurchasesDom() {
  return {
    scopeNote: document.getElementById("purchasesScopeNote"),
    form: document.getElementById("purchaseForm"),
    submitButton: document.getElementById("purchaseSubmitButton"),
    resetButton: document.getElementById("purchaseResetButton"),
    supplierFilter: document.getElementById("purchaseSupplierFilter"),
    categoryFilter: document.getElementById("purchaseCategoryFilter"),
    search: document.getElementById("purchaseSearch"),
    summary: document.getElementById("purchaseSummary"),
    tableBody: document.getElementById("purchaseTableBody"),
    refreshButton: document.getElementById("refreshPurchasesButton")
  };
}

function getColumnLabel(index) {
  let value = Number(index || 0);
  let label = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label || "A";
}

function getSnapshotHost(sectionKey) {
  return document.querySelector(`.template-host[data-template="${sectionKey}"]`);
}

function getSnapshotSheet(sectionKey) {
  const sheetName = SECTION_META[sectionKey]?.snapshotSheet;
  if (!sheetName || !STATE.workbookSnapshot?.sheets?.length) return null;
  return STATE.workbookSnapshot.sheets.find((sheet) => sheet.name === sheetName) || null;
}

function sheetHasVisibleData(sheet) {
  return Boolean(sheet && ((sheet.nonEmpty || 0) > 0 || (sheet.rows || []).length > 0));
}

function hasImportableWorkbookData() {
  if (!STATE.workbookReady) return false;
  return WORKBOOK_IMPORT_SHEETS.some((name) => {
    const sheet = getWorkbookSheetByName(name);
    return sheetHasVisibleData(sheet);
  });
}

function getSnapshotSearch(sectionKey) {
  return String(STATE.snapshotSearches[sectionKey] || "").trim().toLowerCase();
}

function buildSnapshotRows(sheet, sectionKey) {
  if (!sheet?.rows?.length) return [];
  const query = getSnapshotSearch(sectionKey);
  if (!query) return sheet.rows;
  return sheet.rows.filter((row) =>
    Object.values(row.cells || {}).some((cell) =>
      [cell.display, cell.raw, cell.formula].join(" | ").toLowerCase().includes(query)
    )
  );
}

function getRowCell(row, columnIndex) {
  return row?.cells?.[String(columnIndex)] || null;
}

function getRowDisplay(row, columnIndex) {
  return String(getRowCell(row, columnIndex)?.display || "").trim();
}

function getRowRaw(row, columnIndex) {
  return getRowCell(row, columnIndex)?.raw ?? "";
}

function getSheetRow(sheet, rowIndex) {
  return sheet?.rows?.find((row) => row.index === rowIndex) || null;
}

function getSheetDisplay(sheet, rowIndex, columnIndex) {
  return getRowDisplay(getSheetRow(sheet, rowIndex), columnIndex);
}

function getSheetCell(sheet, rowIndex, columnIndex) {
  return getRowCell(getSheetRow(sheet, rowIndex), columnIndex);
}

function hasSnapshotValue(cell) {
  if (!cell) return false;
  const display = String(cell.display || "").trim();
  const raw = String(cell.raw ?? "").trim();
  if (!display && !raw) return false;
  if (display === "#DIV/0!" || raw === "#DIV/0!") return false;
  return true;
}

function getSnapshotCellNumber(cell) {
  if (!cell) return 0;
  return parseWorkbookNumber(cell.raw ?? cell.display ?? 0);
}

function getSheetNumber(sheet, rowIndex, columnIndex) {
  return getSnapshotCellNumber(getSheetCell(sheet, rowIndex, columnIndex));
}

function isMonthLabel(value) {
  return MONTH_NAME_SET.has(String(value || "").trim());
}

function toYearLabel(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  const fullYearMatch = source.match(/\d{4}/);
  if (fullYearMatch) return fullYearMatch[0];
  const shortYearMatch = source.match(/\d{2}/);
  return shortYearMatch ? `20${shortYearMatch[0]}` : source;
}

function formatPercentFromDecimal(value) {
  if (!Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * 100)}%`;
}

function formatPlainNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

function getMetricRowByLabels(rowMap, labels = []) {
  for (const label of labels) {
    const row = rowMap.get(label);
    if (row) return row;
  }
  return null;
}

function getMetricCell(rowMap, labels, columnIndex) {
  const row = getMetricRowByLabels(rowMap, labels);
  return row ? getRowCell(row, columnIndex) : null;
}

function getMetricNumber(rowMap, labels, columnIndex) {
  return getSnapshotCellNumber(getMetricCell(rowMap, labels, columnIndex));
}

function parseLeadgenSnapshot(sheet) {
  if (!sheet?.rows?.length) return { blocks: [] };

  const headerRows = sheet.rows.filter((row) => {
    const cells = Object.values(row.cells || {});
    return getRowDisplay(row, 2) === "Среднее" && cells.some((cell) => isMonthLabel(cell.display));
  });

  const blocks = headerRows.map((headerRow, index) => {
    const nextHeaderRow = headerRows[index + 1];
    const monthColumns = Object.keys(headerRow.cells || {})
      .map(Number)
      .sort((a, b) => a - b)
      .filter((columnIndex) => isMonthLabel(getRowDisplay(headerRow, columnIndex)))
      .map((columnIndex) => ({
        columnIndex,
        monthLabel: getRowDisplay(headerRow, columnIndex)
      }));

    const rowMap = new Map(
      sheet.rows
        .filter((row) => row.index > headerRow.index && row.index < (nextHeaderRow?.index || Number.MAX_SAFE_INTEGER))
        .filter((row) => getRowDisplay(row, 1))
        .map((row) => [getRowDisplay(row, 1), row])
    );

    const leadRow = getMetricRowByLabels(rowMap, ["Заявки/Лиды", "Контакты"]);
    const clickConversionRow = getMetricRowByLabels(rowMap, ["Конверсия клики", "Конверсия в контакт"]);
    const leadCostRow = getMetricRowByLabels(rowMap, ["Стоимость лида", "Стоимость контакта"]);

    const dataSeries = monthColumns
      .filter(({ columnIndex }) =>
        [
          getMetricCell(rowMap, ["Расходы"], columnIndex),
          getMetricCell(rowMap, ["Заявки/Лиды", "Контакты"], columnIndex),
          getMetricCell(rowMap, ["Продажи"], columnIndex),
          getMetricCell(rowMap, ["Прибыль чистая"], columnIndex)
        ].some(hasSnapshotValue)
      )
      .map(({ columnIndex, monthLabel }) => ({
        columnIndex,
        monthLabel,
        spend: getMetricNumber(rowMap, ["Расходы"], columnIndex),
        leads: getMetricNumber(rowMap, ["Заявки/Лиды", "Контакты"], columnIndex),
        sales: getMetricNumber(rowMap, ["Продажи"], columnIndex),
        profitNet: getMetricNumber(rowMap, ["Прибыль чистая"], columnIndex),
        costPerLead: getMetricNumber(rowMap, ["Стоимость лида", "Стоимость контакта"], columnIndex),
        costPerSale: getMetricNumber(rowMap, ["Цена продажи"], columnIndex),
        clickConversion: getMetricNumber(rowMap, ["Конверсия клики", "Конверсия в контакт"], columnIndex),
        leadConversion: getMetricNumber(rowMap, ["Конверсия лида"], columnIndex),
        saleConversion: getMetricNumber(rowMap, ["Конверсия продажи"], columnIndex)
      }));

    return {
      title: getRowDisplay(headerRow, 1) || `Канал ${index + 1}`,
      leadLabel: leadRow ? getRowDisplay(leadRow, 1) : "Лиды",
      clickConversionLabel: clickConversionRow ? getRowDisplay(clickConversionRow, 1) : "Конверсия",
      leadCostLabel: leadCostRow ? getRowDisplay(leadCostRow, 1) : "Стоимость лида",
      hasLeadConversion: Boolean(getMetricRowByLabels(rowMap, ["Конверсия лида"])),
      dataSeries
    };
  });

  return {
    blocks,
    latestMonthLabel:
      blocks
        .map((block) => block.dataSeries.at(-1)?.monthLabel)
        .filter(Boolean)
        .at(-1) || ""
  };
}

function parseMetricsSnapshot(sheet) {
  if (!sheet?.rows?.length) return { series: [] };

  const yearGroups = Object.keys(getSheetRow(sheet, 1)?.cells || {})
    .map(Number)
    .sort((a, b) => a - b)
    .filter((columnIndex) => /\d/.test(getSheetDisplay(sheet, 1, columnIndex)))
    .map((columnIndex, index, columns) => ({
      start: columnIndex,
      end: (columns[index + 1] || (sheet.maxCol + 1)) - 1,
      yearLabel: toYearLabel(getSheetDisplay(sheet, 1, columnIndex))
    }));

  const getYearForColumn = (columnIndex) =>
    yearGroups.find((group) => columnIndex >= group.start && columnIndex <= group.end)?.yearLabel || "";

  const rowMap = new Map(
    sheet.rows
      .filter((row) => row.index >= 4 && getRowDisplay(row, 1))
      .map((row) => [getRowDisplay(row, 1), row])
  );

  const series = Array.from({ length: sheet.maxCol || 0 }, (_, idx) => idx + 1)
    .filter((columnIndex) => isMonthLabel(getSheetDisplay(sheet, 2, columnIndex)))
    .filter((columnIndex) => getSheetDisplay(sheet, 3, columnIndex).startsWith("Сумма"))
    .map((columnIndex) => ({
      columnIndex,
      monthLabel: getSheetDisplay(sheet, 2, columnIndex),
      yearLabel: getYearForColumn(columnIndex),
      revenue: getMetricNumber(rowMap, ["Выручка"], columnIndex),
      cost: getMetricNumber(rowMap, ["Себестоимость"], columnIndex),
      grossProfit: getMetricNumber(rowMap, ["Валовая прибыль"], columnIndex),
      operatingExpenses: getMetricNumber(rowMap, ["Операционные расходы"], columnIndex),
      operatingProfit: getMetricNumber(rowMap, ["Операционная прибыль"], columnIndex),
      taxes: getMetricNumber(rowMap, ["Налоги и сборы"], columnIndex),
      netProfit: getMetricNumber(rowMap, ["Чистая прибыль"], columnIndex),
      productProfitability: getMetricNumber(rowMap, ["Rпр — рентабельность продукции"], columnIndex),
      businessProfitability: getMetricNumber(rowMap, ["Рентабильность бизнеса"], columnIndex),
      margin: getMetricNumber(rowMap, ["Маржа"], columnIndex),
      averageCheck: getMetricNumber(rowMap, ["Средний чек"], columnIndex),
      sales: getMetricNumber(rowMap, ["Продажи"], columnIndex),
      warehouse: getMetricNumber(rowMap, ["Склад"], columnIndex),
      tbuMoney: getMetricNumber(rowMap, ["ТБУ в деньгах"], columnIndex)
    }))
    .filter(
      (item) =>
        hasSnapshotValue(getMetricCell(rowMap, ["Выручка"], item.columnIndex)) ||
        hasSnapshotValue(getMetricCell(rowMap, ["Чистая прибыль"], item.columnIndex)) ||
        hasSnapshotValue(getMetricCell(rowMap, ["Продажи"], item.columnIndex))
    );

  return { series };
}

function parseFinmodelSnapshot(sheet) {
  if (!sheet?.rows?.length) return { timeline: [], partnerTotals: [] };

  const timeline = [];
  let currentYear = "";
  let currentPartner = "";

  sheet.rows
    .filter((row) => row.index >= 4)
    .forEach((row) => {
      const yearLabel = toYearLabel(getRowDisplay(row, 12)) || currentYear;
      if (yearLabel) currentYear = yearLabel;

      const partnerLabel = getRowDisplay(row, 20) || currentPartner;
      if (partnerLabel) currentPartner = partnerLabel;

      const monthLabel = getRowDisplay(row, 13);
      const turnoverCell = getRowCell(row, 14);
      if (!isMonthLabel(monthLabel) || !hasSnapshotValue(turnoverCell)) return;

      timeline.push({
        rowIndex: row.index,
        yearLabel: currentYear,
        monthLabel,
        turnover: getSnapshotCellNumber(turnoverCell),
        orders: getSnapshotCellNumber(getRowCell(row, 15)),
        partnerLabel: currentPartner || "Без привязки"
      });
    });

  const partnerTotals = Array.from(
    timeline.reduce((map, item) => {
      const current = map.get(item.partnerLabel) || { partnerLabel: item.partnerLabel, turnover: 0, orders: 0, months: 0 };
      current.turnover += item.turnover;
      current.orders += item.orders;
      current.months += 1;
      map.set(item.partnerLabel, current);
      return map;
    }, new Map()).values()
  ).sort((a, b) => b.turnover - a.turnover);

  return { timeline, partnerTotals };
}

function renderLeadgenAnalytics(sheet) {
  const parsed = parseLeadgenSnapshot(sheet);
  if (!parsed.blocks.length) return "";

  const cards = parsed.blocks
    .map((block) => {
      const latest = block.dataSeries.at(-1);
      if (!latest) return "";

      const recentSeries = block.dataSeries.slice(-4);
      return `
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Канал</div>
          <h3>${escapeHtml(block.title)}</h3>
          <div class="analytics-caption">Последний заполненный срез: ${escapeHtml(latest.monthLabel)}</div>
          <div class="summary-row analytics-kpi-strip">
            <article class="summary-card">
              <span>Расходы</span>
              <strong>${formatMoney(latest.spend)} ₽</strong>
            </article>
            <article class="summary-card">
              <span>${escapeHtml(block.leadLabel)}</span>
              <strong>${formatPlainNumber(latest.leads)}</strong>
            </article>
            <article class="summary-card">
              <span>Продажи</span>
              <strong>${formatPlainNumber(latest.sales)}</strong>
            </article>
            <article class="summary-card">
              <span>Чистая прибыль</span>
              <strong class="${latest.profitNet >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(latest.profitNet)} ₽</strong>
            </article>
          </div>
          <div class="analytics-chip-row">
            <span class="analytics-chip">${escapeHtml(block.clickConversionLabel)}: <strong>${formatPercentFromDecimal(latest.clickConversion)}</strong></span>
            ${block.hasLeadConversion ? `<span class="analytics-chip">Конверсия лида: <strong>${formatPercentFromDecimal(latest.leadConversion)}</strong></span>` : ""}
            <span class="analytics-chip">Конверсия продажи: <strong>${formatPercentFromDecimal(latest.saleConversion)}</strong></span>
            <span class="analytics-chip">${escapeHtml(block.leadCostLabel)}: <strong>${formatMoney(latest.costPerLead)} ₽</strong></span>
            <span class="analytics-chip">Цена продажи: <strong>${formatMoney(latest.costPerSale)} ₽</strong></span>
          </div>
          <div class="table-shell mt-3">
            <table class="table table-sm align-middle analytics-mini-table">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th class="text-end">Расходы</th>
                  <th class="text-end">${escapeHtml(block.leadLabel)}</th>
                  <th class="text-end">Продажи</th>
                  <th class="text-end">Чистая прибыль</th>
                </tr>
              </thead>
              <tbody>
                ${recentSeries
                  .map(
                    (item) => `
                      <tr>
                        <td>${escapeHtml(item.monthLabel)}</td>
                        <td class="text-end">${formatMoney(item.spend)}</td>
                        <td class="text-end">${formatPlainNumber(item.leads)}</td>
                        <td class="text-end">${formatPlainNumber(item.sales)}</td>
                        <td class="text-end ${item.profitNet >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(item.profitNet)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <div class="analytics-shell">
      <div class="scope-note mb-3">
        Каналы разбираются автоматически из листа. Сверху показаны последние заполненные месяцы по каждому рекламному блоку, снизу остаётся исходная таблица для сверки.
      </div>
      <div class="subsection-grid analytics-grid">${cards}</div>
    </div>
  `;
}

function renderMetricsAnalytics(sheet) {
  const parsed = parseMetricsSnapshot(sheet);
  if (!parsed.series.length) return "";

  const latest = parsed.series.at(-1);
  const recentSeries = parsed.series.slice(-6);
  const latestLabel = `${latest.monthLabel} ${latest.yearLabel}`.trim();

  return `
    <div class="analytics-shell">
      <div class="summary-row analytics-kpi-strip mb-3">
        <article class="summary-card">
          <span>Актуальный месяц</span>
          <strong>${escapeHtml(latestLabel)}</strong>
        </article>
        <article class="summary-card">
          <span>Выручка</span>
          <strong>${formatMoney(latest.revenue)} ₽</strong>
        </article>
        <article class="summary-card">
          <span>Чистая прибыль</span>
          <strong class="${latest.netProfit >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(latest.netProfit)} ₽</strong>
        </article>
        <article class="summary-card">
          <span>Продажи</span>
          <strong>${formatPlainNumber(latest.sales)}</strong>
        </article>
        <article class="summary-card">
          <span>Средний чек</span>
          <strong>${formatMoney(latest.averageCheck)} ₽</strong>
        </article>
      </div>
      <div class="subsection-grid analytics-grid">
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Экономика месяца</div>
          <h3>${escapeHtml(latestLabel)}</h3>
          <div class="overview-list">
            <div class="overview-list-item"><span>Себестоимость</span><strong>${formatMoney(latest.cost)} ₽</strong></div>
            <div class="overview-list-item"><span>Валовая прибыль</span><strong class="${latest.grossProfit >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(latest.grossProfit)} ₽</strong></div>
            <div class="overview-list-item"><span>Операционные расходы</span><strong>${formatMoney(latest.operatingExpenses)} ₽</strong></div>
            <div class="overview-list-item"><span>Операционная прибыль</span><strong class="${latest.operatingProfit >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(latest.operatingProfit)} ₽</strong></div>
            <div class="overview-list-item"><span>Налоги и сборы</span><strong>${formatMoney(latest.taxes)} ₽</strong></div>
            <div class="overview-list-item"><span>ТБУ в деньгах</span><strong>${formatMoney(latest.tbuMoney)} ₽</strong></div>
          </div>
        </article>
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Качество бизнеса</div>
          <h3>Маржа и рентабельность</h3>
          <div class="analytics-chip-row">
            <span class="analytics-chip">Маржа: <strong>${formatPercentFromDecimal(latest.margin)}</strong></span>
            <span class="analytics-chip">Rпр: <strong>${formatPercentFromDecimal(latest.productProfitability)}</strong></span>
            <span class="analytics-chip">Рентабельность бизнеса: <strong>${formatPercentFromDecimal(latest.businessProfitability)}</strong></span>
            <span class="analytics-chip">Склад: <strong>${formatMoney(latest.warehouse)} ₽</strong></span>
          </div>
          <div class="analytics-footnote">Показатели взяты из последнего заполненного месяца листа и сохраняют исходную формульную логику.</div>
        </article>
        <article class="subsection-card analytics-panel analytics-panel-wide">
          <div class="panel-kicker">Последние месяцы</div>
          <h3>Динамика управленческих метрик</h3>
          <div class="table-shell mt-2">
            <table class="table table-sm align-middle analytics-mini-table">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th class="text-end">Выручка</th>
                  <th class="text-end">Опер. прибыль</th>
                  <th class="text-end">Чистая прибыль</th>
                  <th class="text-end">Продажи</th>
                  <th class="text-end">Средний чек</th>
                </tr>
              </thead>
              <tbody>
                ${recentSeries
                  .map(
                    (item) => `
                      <tr>
                        <td>${escapeHtml(`${item.monthLabel} ${item.yearLabel}`.trim())}</td>
                        <td class="text-end">${formatMoney(item.revenue)}</td>
                        <td class="text-end ${item.operatingProfit >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(item.operatingProfit)}</td>
                        <td class="text-end ${item.netProfit >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(item.netProfit)}</td>
                        <td class="text-end">${formatPlainNumber(item.sales)}</td>
                        <td class="text-end">${formatMoney(item.averageCheck)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  `;
}

function renderFinmodelAnalytics(sheet) {
  const parsed = parseFinmodelSnapshot(sheet);
  if (!parsed.timeline.length) return "";

  const latest = parsed.timeline.at(-1);
  const bestMonth = parsed.timeline.reduce((best, item) => (!best || item.turnover > best.turnover ? item : best), null);
  const currentYearRows = parsed.timeline.filter((item) => item.yearLabel === latest.yearLabel);
  const currentYearTurnover = currentYearRows.reduce((sum, item) => sum + item.turnover, 0);
  const currentYearOrders = currentYearRows.reduce((sum, item) => sum + item.orders, 0);
  const recentTimeline = parsed.timeline.slice(-8);

  return `
    <div class="analytics-shell">
      <div class="summary-row analytics-kpi-strip mb-3">
        <article class="summary-card">
          <span>Последний месяц</span>
          <strong>${escapeHtml(`${latest.monthLabel} ${latest.yearLabel}`.trim())}</strong>
        </article>
        <article class="summary-card">
          <span>Оборот</span>
          <strong>${formatMoney(latest.turnover)} ₽</strong>
        </article>
        <article class="summary-card">
          <span>Заказов</span>
          <strong>${formatPlainNumber(latest.orders)}</strong>
        </article>
        <article class="summary-card">
          <span>Средний чек месяца</span>
          <strong>${latest.orders ? formatMoney(latest.turnover / latest.orders) : "—"}</strong>
        </article>
      </div>
      <div class="subsection-grid analytics-grid">
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Годовой контур</div>
          <h3>${escapeHtml(latest.yearLabel)} год на сегодня</h3>
          <div class="overview-list">
            <div class="overview-list-item"><span>Оборот</span><strong>${formatMoney(currentYearTurnover)} ₽</strong></div>
            <div class="overview-list-item"><span>Заказов</span><strong>${formatPlainNumber(currentYearOrders)}</strong></div>
            <div class="overview-list-item"><span>Средний чек</span><strong>${currentYearOrders ? formatMoney(currentYearTurnover / currentYearOrders) : "—"}</strong></div>
            <div class="overview-list-item"><span>Лучший месяц</span><strong>${bestMonth ? escapeHtml(`${bestMonth.monthLabel} ${bestMonth.yearLabel}`.trim()) : "—"}</strong></div>
          </div>
        </article>
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Партнёры</div>
          <h3>Вклад по партнёрам</h3>
          <div class="overview-list">
            ${parsed.partnerTotals
              .slice(0, 6)
              .map(
                (item) => `
                  <div class="overview-list-item">
                    <div>
                      <strong>${escapeHtml(item.partnerLabel)}</strong>
                      <span>${formatPlainNumber(item.months)} мес. • ${formatPlainNumber(item.orders)} заказов</span>
                    </div>
                    <strong>${formatMoney(item.turnover)} ₽</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="subsection-card analytics-panel analytics-panel-wide">
          <div class="panel-kicker">Временной ряд</div>
          <h3>Оборот и заказы по месяцам</h3>
          <div class="table-shell mt-2">
            <table class="table table-sm align-middle analytics-mini-table">
              <thead>
                <tr>
                  <th>Месяц</th>
                  <th class="text-end">Оборот</th>
                  <th class="text-end">Заказов</th>
                  <th class="text-end">Средний чек</th>
                  <th>Партнёр</th>
                </tr>
              </thead>
              <tbody>
                ${recentTimeline
                  .map(
                    (item) => `
                      <tr>
                        <td>${escapeHtml(`${item.monthLabel} ${item.yearLabel}`.trim())}</td>
                        <td class="text-end">${formatMoney(item.turnover)}</td>
                        <td class="text-end">${formatPlainNumber(item.orders)}</td>
                        <td class="text-end">${item.orders ? formatMoney(item.turnover / item.orders) : "—"}</td>
                        <td>${escapeHtml(item.partnerLabel)}</td>
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  `;
}

function renderSnapshotAnalytics(sectionKey, sheet) {
  if (sectionKey === "leadgen") return renderLeadgenAnalytics(sheet);
  if (sectionKey === "metrics") return renderMetricsAnalytics(sheet);
  if (sectionKey === "finance") return renderFinmodelAnalytics(sheet);
  return "";
}

function getCalendarStatusTone(status) {
  if (status === "Поступление") return "status-closed";
  if (status === "Платеж") return "status-ready";
  if (status === "Отменен") return "status-dispute";
  if (status === "Перенесен") return "status-archive";
  return "status-open";
}

function getOperationTone(type) {
  return type === "Приход" ? "type-incoming" : "type-outgoing";
}

function renderInteractiveFinanceSections() {
  const balanceHost = document.querySelector('.template-host[data-template="balance"]');
  if (balanceHost) {
    balanceHost.innerHTML = `
      <div class="section-actions section-actions--workspace mb-3">
        <div class="section-actions__group">
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="balance">Новая запись</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="balance">Скрыть форму</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshBalanceButton">Обновить</button>
        </div>
        <span class="workspace-chip">Живой баланс по трем контурам</span>
      </div>
      <div class="scope-note" id="balanceScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="balance"></div>
      <div class="light2-builder-host" data-builder-host="balance"></div>
      <form class="record-form" id="balanceForm">
        <div class="form-grid">
          <div>
            <label class="form-label">Дата</label>
            <input class="form-control" type="date" name="entry_date" required />
          </div>
          <div>
            <label class="form-label">Счёт</label>
            <select class="form-select" name="account_type" required>
              <option value="cash_card">Наличные / карта</option>
              <option value="ooo_account">Счёт ООО</option>
              <option value="ip_account">Счёт ИП</option>
            </select>
          </div>
          <div>
            <label class="form-label">Приход, ₽</label>
            <input class="form-control" type="number" step="0.01" min="0" name="income_amount" value="0" required />
          </div>
          <div>
            <label class="form-label">Расход, ₽</label>
            <input class="form-control" type="number" step="0.01" min="0" name="expense_amount" value="0" required />
          </div>
          <div class="form-preview" id="balancePreview"></div>
        </div>
        <div class="mt-3">
          <label class="form-label">Комментарий</label>
          <textarea class="form-control" name="note" rows="2" placeholder="Например: поступление от клиента, закупка, аренда"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-dark" type="submit" id="balanceSubmitButton">Сохранить запись</button>
          <button class="btn btn-outline-secondary" type="button" id="balanceResetButton">Очистить форму</button>
        </div>
      </form>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">Счёт</label>
          <select class="form-select" id="balanceAccountFilter">
            <option value="">Все счета</option>
            <option value="cash_card">Наличные / карта</option>
            <option value="ooo_account">Счёт ООО</option>
            <option value="ip_account">Счёт ИП</option>
          </select>
        </div>
        <div>
          <label class="form-label">Месяц</label>
          <input class="form-control" type="month" id="balanceMonthFilter" />
        </div>
        <div>
          <label class="form-label">Поиск</label>
          <input class="form-control" type="text" id="balanceSearch" placeholder="Комментарий или дата" />
        </div>
      </div>
      <div class="summary-row mt-3" id="balanceSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Счёт</th>
              <th class="text-end">Приход, ₽</th>
              <th class="text-end">Расход, ₽</th>
              <th class="text-end">Баланс, ₽</th>
              <th>Комментарий</th>
              <th>Обновлено</th>
              <th id="balanceActionsHead">Действия</th>
            </tr>
          </thead>
          <tbody id="balanceTableBody"></tbody>
        </table>
      </div>
    `;
  }

  const calendarHost = document.querySelector('.template-host[data-template="calendar"]');
  if (calendarHost) {
    calendarHost.innerHTML = `
      <div class="section-actions section-actions--workspace mb-3">
        <div class="section-actions__group">
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="calendar">Новая запись</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="calendar">Скрыть форму</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshCalendarButton">Обновить</button>
        </div>
        <span class="workspace-chip">План денег и обязательств</span>
      </div>
      <div class="scope-note" id="calendarScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="calendar"></div>
      <div class="light2-builder-host" data-builder-host="calendar"></div>
      <form class="record-form" id="calendarForm">
        <div class="form-grid">
          <div>
            <label class="form-label">Дата платежа</label>
            <input class="form-control" type="date" name="payment_date" required />
          </div>
          <div>
            <label class="form-label">Контрагент</label>
            <input class="form-control" type="text" name="counterparty" placeholder="Например: аренда, поставщик, клиент" required />
          </div>
          <div>
            <label class="form-label">Сумма, ₽</label>
            <input class="form-control" type="number" step="0.01" min="0" name="amount" value="0" required />
          </div>
          <div>
            <label class="form-label">Тип операции</label>
            <select class="form-select" name="operation_type" required>
              <option value="Расход">Расход</option>
              <option value="Приход">Приход</option>
            </select>
          </div>
          <div>
            <label class="form-label">Статья</label>
            <input class="form-control" type="text" name="category" placeholder="Например: Зарплата" />
          </div>
          <div>
            <label class="form-label">Счёт</label>
            <select class="form-select" name="account_name" required>
              <option value="Наличные / карта">Наличные / карта</option>
              <option value="Счёт ООО">Счёт ООО</option>
              <option value="Счёт ИП">Счёт ИП</option>
              <option value="Не распределено">Не распределено</option>
            </select>
          </div>
          <div>
            <label class="form-label">Статус</label>
            <select class="form-select" name="status" required>
              <option value="Платеж">Платеж</option>
              <option value="Поступление">Поступление</option>
              <option value="Ожидает">Ожидает</option>
              <option value="Перенесен">Перенесен</option>
              <option value="Отменен">Отменен</option>
            </select>
          </div>
          <div class="form-preview" id="calendarPreview"></div>
        </div>
        <div class="mt-3">
          <label class="form-label">Комментарий</label>
          <textarea class="form-control" name="note" rows="2" placeholder="Уточнение по платежу, дате или обязательству"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-dark" type="submit" id="calendarSubmitButton">Сохранить запись</button>
          <button class="btn btn-outline-secondary" type="button" id="calendarResetButton">Очистить форму</button>
        </div>
      </form>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">Месяц</label>
          <input class="form-control" type="month" id="calendarMonthFilter" />
        </div>
        <div>
          <label class="form-label">Тип операции</label>
          <select class="form-select" id="calendarOperationFilter">
            <option value="">Все операции</option>
            <option value="Расход">Расход</option>
            <option value="Приход">Приход</option>
          </select>
        </div>
        <div>
          <label class="form-label">Счёт</label>
          <select class="form-select" id="calendarAccountFilter">
            <option value="">Все счета</option>
            <option value="Наличные / карта">Наличные / карта</option>
            <option value="Счёт ООО">Счёт ООО</option>
            <option value="Счёт ИП">Счёт ИП</option>
            <option value="Не распределено">Не распределено</option>
          </select>
        </div>
        <div>
          <label class="form-label">Статус</label>
          <select class="form-select" id="calendarStatusFilter">
            <option value="">Все статусы</option>
            <option value="Платеж">Платеж</option>
            <option value="Поступление">Поступление</option>
            <option value="Ожидает">Ожидает</option>
            <option value="Перенесен">Перенесен</option>
            <option value="Отменен">Отменен</option>
          </select>
        </div>
        <div>
          <label class="form-label">Поиск</label>
          <input class="form-control" type="text" id="calendarSearch" placeholder="Контрагент, статья или комментарий" />
        </div>
      </div>
      <div class="summary-row mt-3" id="calendarSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Дата платежа</th>
              <th>Контрагент</th>
              <th class="text-end">Сумма, ₽</th>
              <th>Тип</th>
              <th>Статья</th>
              <th>Счёт</th>
              <th>Статус</th>
              <th>Комментарий</th>
              <th>Обновлено</th>
              <th id="calendarActionsHead">Действия</th>
            </tr>
          </thead>
          <tbody id="calendarTableBody"></tbody>
        </table>
      </div>
      `;
    }

  const assetsHost = document.querySelector('.template-host[data-template="assets"]');
  if (assetsHost) {
    assetsHost.innerHTML = `
      <div class="section-actions section-actions--workspace mb-3">
        <div class="section-actions__group">
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="assets">Новая запись</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="assets">Скрыть форму</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshAssetsButton">Обновить</button>
        </div>
        <span class="workspace-chip">Активы и график выплат</span>
      </div>
      <div class="scope-note" id="assetsScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="assets"></div>
      <div class="light2-builder-host" data-builder-host="assets"></div>
      <div class="subsection-grid">
        <article class="subsection-card">
          <h3>Карточка актива</h3>
          <p>Стоимость актива и базовый комментарий. Выплаты ведутся отдельно в журнале ниже.</p>
          <form class="record-form mb-0" id="assetForm">
            <div class="form-grid">
              <div>
                <label class="form-label">Актив</label>
                <input class="form-control" type="text" name="asset_name" placeholder="Например: Сайт" required />
              </div>
              <div>
                <label class="form-label">Стоимость, ₽</label>
                <input class="form-control" type="number" step="0.01" min="0" name="asset_value" value="0" required />
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Комментарий</label>
              <textarea class="form-control" name="note" rows="2" placeholder="Что входит в актив или кому он передан"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-dark" type="submit" id="assetSubmitButton">Сохранить актив</button>
              <button class="btn btn-outline-secondary" type="button" id="assetResetButton">Очистить форму</button>
            </div>
          </form>
        </article>
        <article class="subsection-card">
          <h3>График выплат по активам</h3>
          <p>Можно привязать выплату к активу или оставить без привязки, как в исходном файле ДОМ НЕОНА.</p>
          <form class="record-form mb-0" id="assetPaymentForm">
            <div class="form-grid">
              <div>
                <label class="form-label">Актив</label>
                <select class="form-select" name="asset_id" id="assetPaymentAssetId"></select>
              </div>
              <div>
                <label class="form-label">Дата выплаты</label>
                <input class="form-control" type="date" name="payment_date" required />
              </div>
              <div>
                <label class="form-label">Сумма, ₽</label>
                <input class="form-control" type="number" step="0.01" min="0" name="payment_amount" value="0" required />
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">Комментарий</label>
              <textarea class="form-control" name="note" rows="2" placeholder="Например: передал наличными Кириллу"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-dark" type="submit" id="assetPaymentSubmitButton">Сохранить выплату</button>
              <button class="btn btn-outline-secondary" type="button" id="assetPaymentResetButton">Очистить форму</button>
            </div>
          </form>
        </article>
      </div>
      <div class="toolbar-grid mt-3">
        <div>
          <label class="form-label">Поиск по активам</label>
          <input class="form-control" type="text" id="assetsSearch" placeholder="Название или комментарий" />
        </div>
        <div>
          <label class="form-label">Фильтр выплат</label>
          <select class="form-select" id="assetPaymentFilter">
            <option value="">Все активы</option>
          </select>
        </div>
        <div>
          <label class="form-label">Поиск по выплатам</label>
          <input class="form-control" type="text" id="assetPaymentSearch" placeholder="Комментарий или дата" />
        </div>
      </div>
      <div class="summary-row mt-3" id="assetsSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Актив</th>
              <th class="text-end">Стоимость, ₽</th>
              <th class="text-end">Выплачено, ₽</th>
              <th class="text-end">Остаток, ₽</th>
              <th>Комментарий</th>
              <th>Обновлено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody id="assetsTableBody"></tbody>
        </table>
      </div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Дата выплаты</th>
              <th>Актив</th>
              <th class="text-end">Сумма, ₽</th>
              <th>Комментарий</th>
              <th>Обновлено</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody id="assetPaymentsTableBody"></tbody>
        </table>
      </div>
    `;
  }

  const purchasesHost = document.querySelector('.template-host[data-template="purchases"]');
  if (purchasesHost) {
    purchasesHost.innerHTML = `
      <div class="section-actions section-actions--workspace mb-3">
        <div class="section-actions__group">
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="purchases">Новая позиция</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="purchases">Скрыть форму</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshPurchasesButton">Обновить</button>
        </div>
        <span class="workspace-chip">Каталог поставщиков и цен</span>
      </div>
      <div class="scope-note" id="purchasesScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="purchases"></div>
      <div class="light2-builder-host" data-builder-host="purchases"></div>
      <article class="subsection-card mb-3">
        <h3>Позиция закупки</h3>
        <p>Нормализованный каталог поставщиков и материалов из листа Закупки.</p>
        <form class="record-form mb-0" id="purchaseForm">
          <div class="form-grid">
            <div>
              <label class="form-label">Компания</label>
              <input class="form-control" type="text" name="supplier_name" placeholder="Поставщик" required />
            </div>
            <div>
              <label class="form-label">ИНН</label>
              <input class="form-control" type="text" name="supplier_inn" placeholder="ИНН поставщика" />
            </div>
            <div>
              <label class="form-label">Ссылка</label>
              <input class="form-control" type="url" name="supplier_url" placeholder="https://..." />
            </div>
            <div>
              <label class="form-label">Город</label>
              <input class="form-control" type="text" name="city" placeholder="Например: Спб" />
            </div>
            <div>
              <label class="form-label">Категория</label>
              <input class="form-control" type="text" name="category" placeholder="Например: Гибкий неон" />
            </div>
            <div>
              <label class="form-label">Артикул</label>
              <input class="form-control" type="text" name="article" placeholder="Артикул" />
            </div>
            <div>
              <label class="form-label">Наименование</label>
              <input class="form-control" type="text" name="item_name" placeholder="Название позиции" />
            </div>
            <div>
              <label class="form-label">Ед. изм.</label>
              <input class="form-control" type="text" name="unit_name" placeholder="м, шт, м2" />
            </div>
            <div>
              <label class="form-label">Цена, ₽</label>
              <input class="form-control" type="number" step="0.01" min="0" name="price" value="0" />
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label">Комментарий</label>
            <textarea class="form-control" name="note" rows="2" placeholder="Любая заметка по позиции или поставщику"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-dark" type="submit" id="purchaseSubmitButton">Сохранить позицию</button>
            <button class="btn btn-outline-secondary" type="button" id="purchaseResetButton">Очистить форму</button>
          </div>
        </form>
      </article>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">Поставщик</label>
          <select class="form-select" id="purchaseSupplierFilter">
            <option value="">Все поставщики</option>
          </select>
        </div>
        <div>
          <label class="form-label">Категория</label>
          <select class="form-select" id="purchaseCategoryFilter">
            <option value="">Все категории</option>
          </select>
        </div>
        <div>
          <label class="form-label">Поиск</label>
          <input class="form-control" type="text" id="purchaseSearch" placeholder="Поставщик, артикул, позиция" />
        </div>
      </div>
      <div class="summary-row mt-3" id="purchaseSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Компания</th>
              <th>Город</th>
              <th>Категория</th>
              <th>Артикул</th>
              <th>Наименование</th>
              <th>Ед.</th>
              <th class="text-end">Цена, ₽</th>
              <th>Ссылка</th>
              <th>Комментарий</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody id="purchaseTableBody"></tbody>
        </table>
      </div>
    `;
  }
  }

function updateHero() {
  const displayName =
    STATE.profile?.display_name ||
    STATE.profile?.full_name ||
    STATE.user?.user_metadata?.display_name ||
    STATE.user?.email ||
    "Не определен";

  DOM.userDisplay.textContent = displayName;

  if (isAdmin()) {
    DOM.accessMode.textContent = "Владелец / админ";
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  DOM.accessMode.textContent = partnerSlug ? `Партнер: ${getPartnerLabel(partnerSlug)}` : "Ограниченный доступ";
}

function renderOverview() {
  renderLiveOverviewSummary();
  renderLiveOverviewPanels();
  const cards = Object.entries(SECTION_META)
    .filter(([key]) => key !== "overview" && isSectionAllowed(key))
    .map(([key, meta]) => `
      <article class="overview-card">
        <h3>${escapeHtml(meta.title)}</h3>
        <p>${escapeHtml(meta.subtitle)}</p>
        <div class="overview-card-meta">${escapeHtml(getOverviewSectionFootnote(key))}</div>
        <button class="btn btn-dark btn-sm" type="button" data-open-section="${escapeHtml(key)}">Открыть</button>
      </article>
    `)
    .join("");

  DOM.overviewGrid.innerHTML = cards;
}

function renderTemplateSections() {
  document.querySelectorAll(".template-host").forEach((host) => {
    const key = host.dataset.template;
    const meta = SECTION_META[key];
    if (!meta) return;

    host.innerHTML = `
      <div class="template-grid">
        ${meta.cards
          .map(
            (card) => `
              <article class="template-card">
                <h3>${escapeHtml(card.title)}</h3>
                <p>${escapeHtml(card.text)}</p>
                <ul>
                  ${card.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  });
}

function renderWorkbookSnapshotSection(sectionKey) {
  const host = getSnapshotHost(sectionKey);
  if (!host) return;

  const meta = SECTION_META[sectionKey];
  const sheetName = meta?.snapshotSheet;
  if (!sheetName) return;

  if (STATE.workbookError) {
    host.innerHTML = `<div class="scope-note scope-note-error">Не удалось загрузить сверочный лист: ${escapeHtml(STATE.workbookError)}</div>`;
    return;
  }

  if (!STATE.workbookReady) {
    host.innerHTML = `<div class="scope-note">Загружаю сверочный лист ${escapeHtml(sheetName)} из исходного файла...</div>`;
    return;
  }

  const sheet = getSnapshotSheet(sectionKey);
  if (!sheet) {
    host.innerHTML = `<div class="scope-note">Лист ${escapeHtml(sheetName)} не найден в snapshot-файле.</div>`;
    return;
  }

  if (!sheetHasVisibleData(sheet)) {
    host.innerHTML = `
      <div class="workspace-empty workspace-empty--sheet">
        <strong>${escapeHtml(meta?.title || sheetName)}</strong>
        <div class="mt-2">Раздел сейчас пустой. Вы стартуете с чистой базы и сможете заполнить его уже внутри платформы.</div>
      </div>
    `;
    return;
  }

  const rows = buildSnapshotRows(sheet, sectionKey);
  const headerRow = sheet.rows.find((row) => row.index <= 3) || sheet.rows[0];
  const columns = Array.from({ length: sheet.maxCol || 1 }, (_, idx) => idx + 1);
  const analyticsHtml = renderSnapshotAnalytics(sectionKey, sheet);

  host.innerHTML = `
    ${analyticsHtml}
    <div class="snapshot-toolbar">
      <div class="summary-row">
        <article class="summary-card">
          <span>Лист</span>
          <strong>${escapeHtml(sheet.name)}</strong>
        </article>
        <article class="summary-card">
          <span>Непустых ячеек</span>
          <strong>${escapeHtml(String(sheet.nonEmpty || 0))}</strong>
        </article>
        <article class="summary-card">
          <span>Формул</span>
          <strong>${escapeHtml(String(sheet.formulas || 0))}</strong>
        </article>
        <article class="summary-card">
          <span>Строк в выборке</span>
          <strong>${escapeHtml(String(rows.length))}</strong>
        </article>
      </div>
      <div class="toolbar-grid mt-3">
        <div>
          <label class="form-label">Поиск по листу</label>
          <input
            class="form-control"
            type="text"
            value="${escapeHtml(STATE.snapshotSearches[sectionKey] || "")}"
            data-snapshot-search="${escapeHtml(sectionKey)}"
            placeholder="Значение, формула или подпись"
          />
        </div>
      </div>
    </div>
    <div class="snapshot-hint">
      Значения взяты из заполненного файла. Ячейки с формулами отмечены точкой и показывают формулу по наведению.
    </div>
    <div class="table-shell mt-3">
      <table class="table table-sm align-middle snapshot-table">
        <thead>
          <tr>
            <th class="snapshot-row-head">#</th>
            ${columns.map((col) => `<th>${escapeHtml(getColumnLabel(col))}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${
            rows.length
              ? rows
                  .map((row) => {
                    const cells = row.cells || {};
                    return `
                      <tr>
                        <th class="snapshot-row-head">${escapeHtml(String(row.index))}</th>
                        ${columns
                          .map((col) => {
                            const cell = cells[String(col)];
                            if (!cell) return `<td></td>`;
                            const formula = cell.formula ? ` title="${escapeHtml(cell.formula)}"` : "";
                            const tone = cell.kind ? ` cell-${escapeHtml(cell.kind)}` : "";
                            const marker = cell.formula ? `<span class="formula-dot"></span>` : "";
                            return `<td class="snapshot-cell${tone}"${formula}>${marker}<span>${escapeHtml(cell.display || cell.raw || "")}</span></td>`;
                          })
                          .join("")}
                      </tr>
                    `;
                  })
                  .join("")
              : `<tr><td colspan="${columns.length + 1}" class="muted">По текущему поиску строки не найдены.</td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;

  if (headerRow) {
    host.querySelectorAll("thead th").forEach((cell, index) => {
      if (index === 0) return;
      const headerCell = headerRow.cells?.[String(index)];
      if (headerCell?.display) {
        cell.title = headerCell.display;
      }
    });
  }
}

function renderWorkbookSnapshotSections() {
  Object.keys(SECTION_META).forEach((key) => {
    if (SECTION_META[key].snapshotSheet) {
      renderWorkbookSnapshotSection(key);
    }
  });
}

async function loadWorkbookSnapshot() {
  if (STATE.workbookReady || STATE.workbookError) return;
  try {
    const response = await fetch(`./workbook_snapshot.json?v=${LIGHT2_BUILD}`, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    STATE.workbookSnapshot = await response.json();
    STATE.workbookReady = true;
    STATE.workbookError = "";
  } catch (error) {
    STATE.workbookError = error.message || "неизвестная ошибка";
  }
  renderWorkbookSnapshotSections();
  renderOverview();
  syncModuleStatus();
  syncImportButton();
}

function buildBalanceImportRows() {
  const sheet = getWorkbookSheetByName("Баланс");
  if (!sheet?.rows?.length) return [];

  const groups = [
    { slot: "cash_card", account_type: "cash_card", dateCol: 1, incomeCol: 2, expenseCol: 3, noteCol: 5 },
    { slot: "ooo_account", account_type: "ooo_account", dateCol: 7, incomeCol: 8, expenseCol: 9, noteCol: 11 },
    { slot: "ip_account", account_type: "ip_account", dateCol: 13, incomeCol: 14, expenseCol: 15, noteCol: 17 }
  ];

  return sheet.rows
    .filter((row) => row.index >= 4)
    .flatMap((row) =>
      groups.flatMap((group) => {
        const entryDate = parseRuDateToIso(getWorkbookDisplay(row, group.dateCol));
        const incomeAmount = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, group.incomeCol)));
        const expenseAmount = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, group.expenseCol)));
        const note = String(getWorkbookDisplay(row, group.noteCol) || "").trim();

        if (!entryDate || (!incomeAmount && !expenseAmount && !note)) {
          return [];
        }

        return [
          {
            source_sheet: "Баланс",
            source_row: row.index,
            source_slot: group.slot,
            entry_date: entryDate,
            account_type: group.account_type,
            income_amount: incomeAmount,
            expense_amount: expenseAmount,
            note: note || null,
            created_by: STATE.user?.id || null
          }
        ];
      })
    );
}

function buildCalendarImportRows() {
  const sheet = getWorkbookSheetByName("Платежный календарь");
  if (!sheet?.rows?.length) return [];

  const validAccounts = new Set(CALENDAR_ACCOUNTS.map((item) => item.value));
  const validStatuses = new Set(CALENDAR_STATUSES);

  return sheet.rows
    .filter((row) => row.index >= 6)
    .flatMap((row) => {
      const paymentDate = parseRuDateToIso(getWorkbookDisplay(row, 1));
      const counterparty = String(getWorkbookDisplay(row, 2) || "").trim();
      const amount = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 3)));
      const operationType = String(getWorkbookDisplay(row, 4) || "").trim();
      const category = String(getWorkbookDisplay(row, 5) || "").trim();
      const accountNameRaw = String(getWorkbookDisplay(row, 6) || "").trim();
      const statusRaw = String(getWorkbookDisplay(row, 7) || "").trim();
      const note = String(getWorkbookDisplay(row, 8) || "").trim();

      if (!paymentDate || !counterparty || !amount || !operationType) {
        return [];
      }

      return [
        {
          source_sheet: "Платежный календарь",
          source_row: row.index,
          payment_date: paymentDate,
          counterparty,
          amount,
          operation_type: operationType === "Приход" ? "Приход" : "Расход",
          category: category || null,
          account_name: validAccounts.has(accountNameRaw) ? accountNameRaw : "Не распределено",
          status: validStatuses.has(statusRaw) ? statusRaw : "Ожидает",
          note: note || null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildAssetsImportRows() {
  const sheet = getWorkbookSheetByName("Активы");
  if (!sheet?.rows?.length) return [];

  return sheet.rows
    .filter((row) => row.index >= 3)
    .flatMap((row) => {
      const assetName = String(getWorkbookDisplay(row, 1) || "").trim();
      const assetValue = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 2)));
      if (!assetName && !assetValue) {
        return [];
      }
      return [
        {
          source_sheet: "Активы",
          source_row: row.index,
          asset_name: assetName || `Актив ${row.index}`,
          asset_value: assetValue,
          note: null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildAssetPaymentImportRows() {
  const sheet = getWorkbookSheetByName("Активы");
  if (!sheet?.rows?.length) return [];

  return sheet.rows
    .filter((row) => row.index >= 2)
    .flatMap((row) => {
      const paymentDate = parseRuDateToIso(getWorkbookDisplay(row, 7));
      const trancheOne = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 8)));
      const trancheTwo = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 9)));
      const paidRaw = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 10)));
      const noteRaw = String(getWorkbookDisplay(row, 11) || "").trim();
      const paymentAmount = paidRaw || roundMoney(trancheOne + trancheTwo);

      if (!paymentDate || !paymentAmount) {
        return [];
      }

      const noteParts = [];
      if (trancheOne || trancheTwo) {
        noteParts.push(`План из исходника: ${formatMoney(trancheOne)} ₽ + ${formatMoney(trancheTwo)} ₽`);
      }
      if (noteRaw) {
        noteParts.push(noteRaw);
      }

      return [
        {
          source_sheet: "Активы",
          source_row: row.index,
          asset_id: null,
          payment_date: paymentDate,
          payment_amount: paymentAmount,
          note: noteParts.join(" | ") || null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildPurchaseImportRows() {
  const sheet = getWorkbookSheetByName("Закупки");
  if (!sheet?.rows?.length) return [];

  let currentSupplierName = "";
  let currentInn = "";
  let currentUrl = "";
  let currentCity = "";

  return sheet.rows
    .filter((row) => row.index >= 2)
    .flatMap((row) => {
      const supplierName = String(getWorkbookDisplay(row, 1) || "").trim();
      const supplierInn = String(getWorkbookDisplay(row, 2) || "").trim();
      const supplierUrl = String(getWorkbookDisplay(row, 3) || "").trim();
      const city = String(getWorkbookDisplay(row, 4) || "").trim();

      if (supplierName) currentSupplierName = supplierName;
      if (supplierInn) currentInn = supplierInn;
      if (supplierUrl) currentUrl = supplierUrl;
      if (city) currentCity = city;

      const category = String(getWorkbookDisplay(row, 5) || "").trim();
      const article = String(getWorkbookDisplay(row, 6) || "").trim();
      const itemName = String(getWorkbookDisplay(row, 7) || "").trim();
      const unitName = String(getWorkbookDisplay(row, 8) || "").trim();
      const price = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 9)));

      if (!currentSupplierName || (!category && !article && !itemName && !unitName && !price)) {
        return [];
      }

      return [
        {
          source_sheet: "Закупки",
          source_row: row.index,
          supplier_name: currentSupplierName,
          supplier_inn: currentInn || null,
          supplier_url: currentUrl && currentUrl !== "Нет" ? currentUrl : null,
          city: currentCity || null,
          category: category || null,
          article: article || null,
          item_name: itemName || null,
          unit_name: unitName || null,
          price,
          note: null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildSettlementImportData() {
  const sheet = getWorkbookSheetByName("Взаиморасчет с мастерами");
  if (!sheet?.rows?.length) {
    return { partners: [], settlements: [] };
  }

  const partners = new Map();
  const settlements = [];

  sheet.rows
    .filter((row) => row.index >= 2)
    .forEach((row) => {
      const periodLabel = String(getWorkbookDisplay(row, 1) || "").trim();
      const partnerName = String(getWorkbookDisplay(row, 2) || "").trim();
      const salaryAmount = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 3)));
      const purchaseAmount = roundMoney(parseWorkbookNumber(getWorkbookRaw(row, 4)));
      const status = String(getWorkbookDisplay(row, 7) || "").trim() || "Ожидает сверки";

      if (!periodLabel || !partnerName) {
        return;
      }

      const slug = sanitizeSlug(partnerName);
      if (!slug) {
        return;
      }

      if (!partners.has(slug)) {
        partners.set(slug, {
          slug,
          display_name: partnerName,
          notes: "Импортировано из исходного файла ДОМ НЕОНА.",
          calculator_url: `../part/index.html?partner=${encodeURIComponent(slug)}`
        });
      }

      settlements.push({
        source_sheet: "Взаиморасчет с мастерами",
        source_row: row.index,
        partner_slug: slug,
        period_label: periodLabel,
        salary_amount: salaryAmount,
        purchase_amount: purchaseAmount,
        status,
        note: null,
        created_by: STATE.user?.id || null
      });
    });

  return {
    partners: Array.from(partners.values()),
    settlements
  };
}

async function upsertInBatches(tableName, rows, onConflict) {
  await syncRowsWithoutUpsert(tableName, rows, onConflict);
}

async function ensureImportedPartners(partners) {
  if (!partners.length) return;

  const slugs = partners.map((item) => item.slug);
  const { data, error } = await supabase.from("partner_profiles").select("slug").in("slug", slugs);
  if (error) throw error;

  const existing = new Set((data || []).map((item) => item.slug));
  const missing = partners.filter((item) => !existing.has(item.slug));
  if (!missing.length) return;

  const { error: insertError } = await supabase.from("partner_profiles").insert(missing);
  if (insertError) throw insertError;
}

async function importWorkbookIntoTables() {
  if (!isAdmin()) {
    throw new Error("Импорт доступен только владельцу и администраторам.");
  }

  if (!STATE.workbookReady) {
    await loadWorkbookSnapshot();
  }

  if (!hasImportableWorkbookData()) {
    setImportStatus("Эталон пустой, поэтому импорт не требуется. Рабочие таблицы уже готовы к ручному заполнению.");
    return;
  }

  if (!STATE.schemaReady || !STATE.financeReady || !STATE.operationsReady) {
    throw new Error("Сначала выполните SQL-патчи ДОМ НЕОНА: schema, finance, operations и workbook sync.");
  }

  STATE.importBusy = true;
  syncImportButton();
  setImportStatus("Проверяю заполненный исходник и переношу данные в рабочие таблицы...");

  try {
    const balanceRows = buildBalanceImportRows();
    const calendarRows = buildCalendarImportRows();
    const assetsRows = buildAssetsImportRows();
    const assetPaymentRows = buildAssetPaymentImportRows();
    const purchaseRows = buildPurchaseImportRows();
    const settlementData = buildSettlementImportData();

    await upsertInBatches("light2_balance_entries", balanceRows, "source_sheet,source_row,source_slot");
    await upsertInBatches("light2_payment_calendar_entries", calendarRows, "source_sheet,source_row");
    await upsertInBatches("light2_assets", assetsRows, "source_sheet,source_row");
    await upsertInBatches("light2_asset_payments", assetPaymentRows, "source_sheet,source_row");
    await upsertInBatches("light2_purchase_catalog", purchaseRows, "source_sheet,source_row");
    await ensureImportedPartners(settlementData.partners);
    await upsertInBatches("light2_partner_settlements", settlementData.settlements, "source_sheet,source_row");

    await loadSettlements();
    await loadFinanceData();
    await loadOperationsData();
    syncModuleStatus();

    setImportStatus(
      `Импорт завершен: баланс ${balanceRows.length}, календарь ${calendarRows.length}, активы ${assetsRows.length}, выплаты ${assetPaymentRows.length}, закупки ${purchaseRows.length}, взаиморасчеты ${settlementData.settlements.length}.`,
      "success"
    );
    setStatus("Заполненный исходник ДОМ НЕОНА перенесён в рабочие таблицы платформы.", "success");
  } catch (error) {
    const rawMessage = error.message || "Не удалось импортировать исходный файл.";
    const message =
      rawMessage.includes("source_") ||
      rawMessage.includes("ip_account") ||
      rawMessage.includes("asset_id") ||
      rawMessage.includes("duplicate key value")
        ? `нужен SQL-патч platform_light2_workbook_sync_patch.sql (${rawMessage})`
        : rawMessage;
    setImportStatus(`Импорт остановлен: ${message}`, "error");
    throw new Error(message);
  } finally {
    STATE.importBusy = false;
    syncImportButton();
  }
}

function openSection(sectionKey) {
  STATE.activeSection = isSectionAllowed(sectionKey) ? sectionKey : "overview";
  persistWorkspaceUi();
  refreshInteractiveDomRefs();
  syncWorkspaceModeUi();
  document.querySelectorAll(".section-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === STATE.activeSection);
  });
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("d-none", section.id !== `section-${STATE.activeSection}`);
  });
  if (SECTION_META[STATE.activeSection]?.snapshotSheet) {
    renderWorkbookSnapshotSection(STATE.activeSection);
    void loadWorkbookSnapshot();
  }
}

function syncSectionTabs() {
  document.querySelectorAll(".section-tab").forEach((button) => {
    button.classList.toggle("d-none", !isSectionAllowed(button.dataset.section));
  });
}

function renderPartnerSelect(select, options = {}) {
  const includeAll = options.includeAll ?? false;
  const currentPartnerSlug = getCurrentPartnerSlug();
  const isPartnerMode = !isAdmin();

  let rows = STATE.partnerProfiles.slice().sort((a, b) => a.display_name.localeCompare(b.display_name, "ru"));
  if (isPartnerMode && currentPartnerSlug) {
    rows = rows.filter((item) => item.slug === currentPartnerSlug);
  }

  const items = [];
  if (includeAll) {
    items.push(`<option value="">Все партнеры</option>`);
  }
  rows.forEach((partner) => {
    items.push(`<option value="${escapeHtml(partner.slug)}">${escapeHtml(partner.display_name)}</option>`);
  });

  select.innerHTML = items.join("");

  if (isPartnerMode) {
    select.value = currentPartnerSlug || "";
    select.disabled = true;
  }
}

function updateSettlementPreview() {
  const settlementDom = getSettlementDom();
  if (!settlementDom.form || !settlementDom.preview) return;
  const formData = new FormData(settlementDom.form);
  const draft = {
    salary_amount: formData.get("salary_amount"),
    purchase_amount: formData.get("purchase_amount"),
    status: formData.get("status")
  };
  const math = computeSettlement(draft);

  settlementDom.preview.innerHTML = `
    <span>Итог взаиморасчета</span>
    <strong>${formatMoney(math.total)} ₽</strong>
    <span>${escapeHtml(math.direction)}</span>
  `;
}

function resetSettlementForm() {
  const settlementDom = getSettlementDom();
  if (!settlementDom.form || !settlementDom.submitButton) return;
  DOM.settlementForm = settlementDom.form;
  DOM.settlementSubmitButton = settlementDom.submitButton;
  STATE.editingSettlementId = null;
  DOM.settlementForm.reset();
  DOM.settlementForm.elements.status.value = "Ожидает сверки";
  DOM.settlementSubmitButton.textContent = "Сохранить запись";

  if (!isAdmin()) {
    DOM.settlementForm.classList.add("is-hidden");
  } else {
    DOM.settlementForm.classList.toggle("is-hidden", isSectionFormHidden("settlements"));
    renderPartnerSelect(DOM.settlementForm.elements.partner_slug);
  }

  updateSettlementPreview();
}

function renderScopeNote() {
  const settlementDom = getSettlementDom();
  if (!settlementDom.scopeNote) return;
  DOM.scopeNote = settlementDom.scopeNote;
  if (!STATE.schemaReady) {
    DOM.scopeNote.textContent = "Для блока взаиморасчетов нужно один раз выполнить SQL-патч platform_light2_patch.sql.";
    return;
  }

  if (isAdmin()) {
    DOM.scopeNote.textContent = "Вы видите все взаиморасчеты и можете управлять ими из одного места.";
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  if (!partnerSlug) {
    DOM.scopeNote.textContent = "Партнер еще не привязан к вашему профилю. После привязки тут появятся только ваши взаиморасчеты.";
    return;
  }

  DOM.scopeNote.textContent = `Вы видите только свой контур взаиморасчетов: ${getPartnerLabel(partnerSlug)}.`;
}

function updateBalancePreview() {
  const dom = getBalanceDom();
  if (!dom.form || !dom.preview) return;

  const formData = new FormData(dom.form);
  const income = toNumber(formData.get("income_amount"));
  const expense = toNumber(formData.get("expense_amount"));
  const delta = roundMoney(income - expense);
  const accountLabel = getBalanceAccountLabel(formData.get("account_type"));

  dom.preview.innerHTML = `
    <span>Эффект записи</span>
    <strong class="${delta >= 0 ? "amount-positive" : "amount-negative"}">${delta >= 0 ? "+" : ""}${formatMoney(delta)} ₽</strong>
    <span>${escapeHtml(accountLabel)}</span>
  `;
}

function updateCalendarPreview() {
  const dom = getCalendarDom();
  if (!dom.form || !dom.preview) return;

  const formData = new FormData(dom.form);
  const type = String(formData.get("operation_type") || "Расход");
  const amount = toNumber(formData.get("amount"));
  const signed = type === "Приход" ? amount : -amount;
  const account = String(formData.get("account_name") || "Не распределено");
  const status = String(formData.get("status") || "Платеж");

  dom.preview.innerHTML = `
    <span>Эффект по календарю</span>
    <strong class="${signed >= 0 ? "amount-positive" : "amount-negative"}">${signed >= 0 ? "+" : ""}${formatMoney(signed)} ₽</strong>
    <span>${escapeHtml(account)} • ${escapeHtml(status)}</span>
  `;
}

function resetBalanceForm() {
  const dom = getBalanceDom();
  if (!dom.form) return;

  STATE.editingBalanceId = null;
  dom.form.reset();
  dom.form.elements.entry_date.value = new Date().toISOString().slice(0, 10);
  dom.form.elements.account_type.value = "cash_card";
  dom.form.elements.income_amount.value = "0";
  dom.form.elements.expense_amount.value = "0";
  dom.submitButton.textContent = "Сохранить запись";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("balance"));
  updateBalancePreview();
}

function resetCalendarForm() {
  const dom = getCalendarDom();
  if (!dom.form) return;

  STATE.editingCalendarId = null;
  dom.form.reset();
  dom.form.elements.payment_date.value = new Date().toISOString().slice(0, 10);
  dom.form.elements.operation_type.value = "Расход";
  dom.form.elements.account_name.value = "Наличные / карта";
  dom.form.elements.status.value = "Платеж";
  dom.form.elements.amount.value = "0";
  dom.submitButton.textContent = "Сохранить запись";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("calendar"));
  updateCalendarPreview();
}

function renderBalanceScopeNote() {
  const dom = getBalanceDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Баланс компании видит только владелец и администраторы платформы.";
    return;
  }

  if (!STATE.financeReady) {
    dom.scopeNote.textContent = "Для раздела Баланс выполните SQL-патч platform_light2_finance_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Записи здесь фиксируют фактическое движение денег и формируют текущий баланс по каждому контуру.";
}

function renderCalendarScopeNote() {
  const dom = getCalendarDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Платежный календарь компании видит только владелец и администраторы платформы.";
    return;
  }

  if (!STATE.financeReady) {
    dom.scopeNote.textContent = "Для раздела Платежный календарь выполните SQL-патч platform_light2_finance_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Календарь показывает план платежей и поступлений отдельно от фактического баланса, чтобы было видно нагрузку по датам.";
}

function buildBalanceRunningMap() {
  const rows = STATE.balanceEntries
    .slice()
    .sort((a, b) => {
      const dateDiff = String(a.entry_date || "").localeCompare(String(b.entry_date || ""));
      if (dateDiff !== 0) return dateDiff;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });

  const totals = {};
  const map = new Map();

  rows.forEach((entry) => {
    const key = entry.account_type || "unknown";
    const delta = roundMoney(toNumber(entry.income_amount) - toNumber(entry.expense_amount));
    totals[key] = roundMoney((totals[key] || 0) + delta);
    map.set(entry.id, totals[key]);
  });

  return map;
}

function getCurrentBalanceTotals() {
  return STATE.balanceEntries.reduce(
    (acc, entry) => {
      const delta = roundMoney(toNumber(entry.income_amount) - toNumber(entry.expense_amount));
      const key = entry.account_type || "unknown";
      acc.byAccount[key] = roundMoney((acc.byAccount[key] || 0) + delta);
      acc.total = roundMoney(acc.total + delta);
      return acc;
    },
    { byAccount: {}, total: 0 }
  );
}

function getVisibleBalanceEntries() {
  const dom = getBalanceDom();
  const accountFilter = dom.accountFilter?.value || "";
  const monthFilter = dom.monthFilter?.value || "";
  const query = String(dom.search?.value || "").trim().toLowerCase();

  let rows = STATE.balanceEntries.slice();

  if (accountFilter) rows = rows.filter((entry) => entry.account_type === accountFilter);
  if (monthFilter) rows = rows.filter((entry) => String(entry.entry_date || "").slice(0, 7) === monthFilter);
  if (query) {
    rows = rows.filter((entry) =>
      [entry.entry_date, getBalanceAccountLabel(entry.account_type), entry.note].join(" | ").toLowerCase().includes(query)
    );
  }

  rows.sort((a, b) => {
    const dateDiff = String(b.entry_date || "").localeCompare(String(a.entry_date || ""));
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
  });

  return rows;
}

function getVisibleCalendarEntries() {
  const dom = getCalendarDom();
  const monthFilter = dom.monthFilter?.value || "";
  const operationFilter = dom.operationFilter?.value || "";
  const accountFilter = dom.accountFilter?.value || "";
  const statusFilter = dom.statusFilter?.value || "";
  const query = String(dom.search?.value || "").trim().toLowerCase();

  let rows = STATE.calendarEntries.slice();

  if (monthFilter) rows = rows.filter((entry) => String(entry.payment_date || "").slice(0, 7) === monthFilter);
  if (operationFilter) rows = rows.filter((entry) => entry.operation_type === operationFilter);
  if (accountFilter) rows = rows.filter((entry) => entry.account_name === accountFilter);
  if (statusFilter) rows = rows.filter((entry) => entry.status === statusFilter);
  if (query) {
    rows = rows.filter((entry) =>
      [entry.payment_date, entry.counterparty, entry.category, entry.account_name, entry.status, entry.note]
        .join(" | ")
        .toLowerCase()
        .includes(query)
    );
  }

  rows.sort((a, b) => {
    const dateDiff = String(a.payment_date || "").localeCompare(String(b.payment_date || ""));
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
  });

  return rows;
}

function getAssetLabel(assetId) {
  if (!assetId) return "Без привязки";
  return STATE.assets.find((item) => item.id === assetId)?.asset_name || "Без привязки";
}

function buildAssetPaymentTotals() {
  return STATE.assetPayments.reduce((map, item) => {
    map[item.asset_id] = roundMoney((map[item.asset_id] || 0) + toNumber(item.payment_amount));
    return map;
  }, {});
}

function populateAssetSelectors() {
  const dom = getAssetsDom();
  if (!dom.paymentAssetSelect || !dom.paymentFilter) return;

  const previousFormValue = dom.paymentAssetSelect.value;
  const previousFilterValue = dom.paymentFilter.value;
  const options = ['<option value="">Без привязки к активу</option>']
    .concat(
      STATE.assets
        .slice()
        .sort((a, b) => String(a.asset_name || "").localeCompare(String(b.asset_name || ""), "ru"))
        .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.asset_name)}</option>`)
    )
    .join("");

  dom.paymentAssetSelect.innerHTML = options;
  dom.paymentFilter.innerHTML = ['<option value="">Все активы</option>', '<option value="__unassigned__">Без привязки</option>']
    .concat(
      STATE.assets
        .slice()
        .sort((a, b) => String(a.asset_name || "").localeCompare(String(b.asset_name || ""), "ru"))
        .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.asset_name)}</option>`)
    )
    .join("");

  if (previousFormValue && STATE.assets.some((item) => item.id === previousFormValue)) {
    dom.paymentAssetSelect.value = previousFormValue;
  }
  if (previousFilterValue === "__unassigned__") {
    dom.paymentFilter.value = "__unassigned__";
  } else if (previousFilterValue && STATE.assets.some((item) => item.id === previousFilterValue)) {
    dom.paymentFilter.value = previousFilterValue;
  }
}

function populatePurchaseFilters() {
  const dom = getPurchasesDom();
  if (!dom.supplierFilter || !dom.categoryFilter) return;

  const previousSupplier = dom.supplierFilter.value;
  const previousCategory = dom.categoryFilter.value;

  const suppliers = [...new Set(STATE.purchaseCatalog.map((item) => String(item.supplier_name || "").trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ru")
  );
  const categories = [...new Set(STATE.purchaseCatalog.map((item) => String(item.category || "").trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ru")
  );

  dom.supplierFilter.innerHTML = ['<option value="">Все поставщики</option>']
    .concat(suppliers.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");
  dom.categoryFilter.innerHTML = ['<option value="">Все категории</option>']
    .concat(categories.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");

  if (suppliers.includes(previousSupplier)) dom.supplierFilter.value = previousSupplier;
  if (categories.includes(previousCategory)) dom.categoryFilter.value = previousCategory;
}

function resetAssetForm() {
  const dom = getAssetsDom();
  if (!dom.assetForm) return;

  STATE.editingAssetId = null;
  dom.assetForm.reset();
  dom.assetForm.elements.asset_value.value = "0";
  dom.assetSubmitButton.textContent = "Сохранить актив";
  dom.assetForm.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
}

function resetAssetPaymentForm() {
  const dom = getAssetsDom();
  if (!dom.paymentForm) return;

  STATE.editingAssetPaymentId = null;
  dom.paymentForm.reset();
  dom.paymentForm.elements.payment_date.value = new Date().toISOString().slice(0, 10);
  dom.paymentForm.elements.payment_amount.value = "0";
  dom.paymentSubmitButton.textContent = "Сохранить выплату";
  dom.paymentForm.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
}

function resetPurchaseForm() {
  const dom = getPurchasesDom();
  if (!dom.form) return;

  STATE.editingPurchaseId = null;
  dom.form.reset();
  dom.form.elements.price.value = "0";
  dom.submitButton.textContent = "Сохранить позицию";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("purchases"));
}

function renderAssetsScopeNote() {
  const dom = getAssetsDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Раздел Активы доступен только владельцу и администраторам платформы.";
    return;
  }

  if (!STATE.operationsReady) {
    dom.scopeNote.textContent = "Для раздела Активы выполните SQL-патч platform_light2_assets_purchases_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Активы перенесены в карточки и журнал выплат: это удобнее, чем хранить суммы в длинной Excel-матрице.";
}

function renderPurchasesScopeNote() {
  const dom = getPurchasesDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Раздел Закупки доступен только владельцу и администраторам платформы.";
    return;
  }

  if (!STATE.operationsReady) {
    dom.scopeNote.textContent = "Для раздела Закупки выполните SQL-патч platform_light2_assets_purchases_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Закупки перенесены в нормализованный каталог: поставщик, категория, артикул, позиция, единица и цена.";
}

function getVisibleAssets() {
  const dom = getAssetsDom();
  const query = String(dom.search?.value || "").trim().toLowerCase();
  const totals = buildAssetPaymentTotals();

  let rows = STATE.assets.slice();
  if (query) {
    rows = rows.filter((asset) =>
      [asset.asset_name, asset.note, formatMoney(totals[asset.id] || 0), formatMoney(asset.asset_value)].join(" | ").toLowerCase().includes(query)
    );
  }

  rows.sort((a, b) => String(a.asset_name || "").localeCompare(String(b.asset_name || ""), "ru"));
  return rows;
}

function getVisibleAssetPayments() {
  const dom = getAssetsDom();
  const assetFilter = dom.paymentFilter?.value || "";
  const query = String(dom.paymentSearch?.value || "").trim().toLowerCase();

  let rows = STATE.assetPayments.slice();
  if (assetFilter === "__unassigned__") {
    rows = rows.filter((item) => !item.asset_id);
  } else if (assetFilter) {
    rows = rows.filter((item) => item.asset_id === assetFilter);
  }
  if (query) {
    rows = rows.filter((item) =>
      [item.payment_date, getAssetLabel(item.asset_id), item.note, formatMoney(item.payment_amount)].join(" | ").toLowerCase().includes(query)
    );
  }

  rows.sort((a, b) => {
    const dateDiff = String(b.payment_date || "").localeCompare(String(a.payment_date || ""));
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0);
  });
  return rows;
}

function getVisiblePurchases() {
  const dom = getPurchasesDom();
  const supplierFilter = dom.supplierFilter?.value || "";
  const categoryFilter = dom.categoryFilter?.value || "";
  const query = String(dom.search?.value || "").trim().toLowerCase();

  let rows = STATE.purchaseCatalog.slice();
  if (supplierFilter) rows = rows.filter((item) => item.supplier_name === supplierFilter);
  if (categoryFilter) rows = rows.filter((item) => item.category === categoryFilter);
  if (query) {
    rows = rows.filter((item) =>
      [
        item.supplier_name,
        item.supplier_inn,
        item.city,
        item.category,
        item.article,
        item.item_name,
        item.unit_name,
        item.note
      ]
        .join(" | ")
        .toLowerCase()
        .includes(query)
    );
  }

  rows.sort((a, b) => {
    const supplierDiff = String(a.supplier_name || "").localeCompare(String(b.supplier_name || ""), "ru");
    if (supplierDiff !== 0) return supplierDiff;
    return String(a.item_name || "").localeCompare(String(b.item_name || ""), "ru");
  });
  return rows;
}

function renderAssetsSummary() {
  const dom = getAssetsDom();
  if (!dom.summary) return;

  const assetRows = getVisibleAssets();
  const paymentRows = getVisibleAssetPayments();
  const totalValue = assetRows.reduce((sum, asset) => sum + toNumber(asset.asset_value), 0);
  const totalPaid = paymentRows.reduce((sum, item) => sum + toNumber(item.payment_amount), 0);
  const remaining = roundMoney(totalValue - totalPaid);

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Активов в выборке</span>
      <strong>${assetRows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Стоимость активов</span>
      <strong>${formatMoney(totalValue)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Уже выплачено</span>
      <strong>${formatMoney(totalPaid)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Остаток к закрытию</span>
      <strong class="${remaining <= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(remaining)} ₽</strong>
    </article>
  `;
}

function renderPurchasesSummary() {
  const dom = getPurchasesDom();
  if (!dom.summary) return;

  const rows = getVisiblePurchases();
  const supplierCount = new Set(rows.map((item) => item.supplier_name).filter(Boolean)).size;
  const categoryCount = new Set(rows.map((item) => item.category).filter(Boolean)).size;
  const pricedCount = rows.filter((item) => toNumber(item.price) > 0).length;
  const averagePrice = pricedCount
    ? rows.filter((item) => toNumber(item.price) > 0).reduce((sum, item) => sum + toNumber(item.price), 0) / pricedCount
    : 0;

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Позиции в выборке</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Поставщиков</span>
      <strong>${supplierCount}</strong>
    </article>
    <article class="summary-card">
      <span>Категорий</span>
      <strong>${categoryCount}</strong>
    </article>
    <article class="summary-card">
      <span>Средняя цена по заполненным</span>
      <strong>${formatMoney(averagePrice)} ₽</strong>
    </article>
  `;
}

function renderAssets() {
  const dom = getAssetsDom();
  if (!dom.assetTableBody || !dom.paymentTableBody) return;

  renderAssetsScopeNote();
  renderLiveSectionBuilder("assets");
  dom.assetForm?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
  dom.paymentForm?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
  populateAssetSelectors();

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.assetTableBody.innerHTML = `<tr><td colspan="7" class="muted">Раздел доступен только владельцу и администраторам.</td></tr>`;
    dom.paymentTableBody.innerHTML = `<tr><td colspan="6" class="muted">Раздел доступен только владельцу и администраторам.</td></tr>`;
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    dom.assetTableBody.innerHTML = `<tr><td colspan="7" class="muted">Сначала выполните platform_light2_assets_purchases_patch.sql в Supabase SQL Editor.</td></tr>`;
    dom.paymentTableBody.innerHTML = `<tr><td colspan="6" class="muted">Сначала выполните platform_light2_assets_purchases_patch.sql в Supabase SQL Editor.</td></tr>`;
    return;
  }

  const totals = buildAssetPaymentTotals();
  const assetRows = getVisibleAssets();
  const paymentRows = getVisibleAssetPayments();
  renderAssetsSummary();
  if (dom.summary) {
    dom.summary.insertAdjacentHTML("beforeend", getSectionFormulaCards("assets"));
  }

  dom.assetTableBody.innerHTML = assetRows.length
    ? assetRows
        .map((asset) => {
          const paid = toNumber(totals[asset.id] || 0);
          const remaining = roundMoney(toNumber(asset.asset_value) - paid);
          return `
            <tr>
              <td>${escapeHtml(asset.asset_name || "—")}</td>
              <td class="text-end">${escapeHtml(formatMoney(asset.asset_value))}</td>
              <td class="text-end">${escapeHtml(formatMoney(paid))}</td>
              <td class="text-end ${remaining <= 0 ? "amount-positive" : "amount-negative"}">${escapeHtml(formatMoney(remaining))}</td>
              <td>${escapeHtml(asset.note || "—")}</td>
              <td class="small">${escapeHtml(formatDateTime(asset.updated_at || asset.created_at))}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset="${escapeHtml(asset.id)}">Изменить</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset="${escapeHtml(asset.id)}">Удалить</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7" class="muted">Пока нет активов для текущего фильтра.</td></tr>`;

  dom.paymentTableBody.innerHTML = paymentRows.length
    ? paymentRows
        .map(
          (payment) => `
            <tr>
              <td>${escapeHtml(formatDate(payment.payment_date))}</td>
              <td>${escapeHtml(getAssetLabel(payment.asset_id))}</td>
              <td class="text-end">${escapeHtml(formatMoney(payment.payment_amount))}</td>
              <td>${escapeHtml(payment.note || "—")}</td>
              <td class="small">${escapeHtml(formatDateTime(payment.updated_at || payment.created_at))}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset-payment="${escapeHtml(payment.id)}">Изменить</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset-payment="${escapeHtml(payment.id)}">Удалить</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="6" class="muted">Пока нет выплат для текущего фильтра.</td></tr>`;
}

function renderPurchases() {
  const dom = getPurchasesDom();
  if (!dom.tableBody) return;

  renderPurchasesScopeNote();
  renderLiveSectionBuilder("purchases");
  dom.form?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("purchases"));
  populatePurchaseFilters();

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Раздел доступен только владельцу и администраторам.</td></tr>`;
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Сначала выполните platform_light2_assets_purchases_patch.sql в Supabase SQL Editor.</td></tr>`;
    return;
  }

  const rows = getVisiblePurchases();
  renderPurchasesSummary();
  if (dom.summary) {
    dom.summary.insertAdjacentHTML("beforeend", getSectionFormulaCards("purchases"));
  }

  dom.tableBody.innerHTML = rows.length
    ? rows
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.supplier_name || "—")}</td>
              <td>${escapeHtml(item.city || "—")}</td>
              <td>${escapeHtml(item.category || "—")}</td>
              <td>${escapeHtml(item.article || "—")}</td>
              <td>${escapeHtml(item.item_name || "—")}</td>
              <td>${escapeHtml(item.unit_name || "—")}</td>
              <td class="text-end">${escapeHtml(formatMoney(item.price))}</td>
              <td>${item.supplier_url ? `<a href="${escapeHtml(item.supplier_url)}" target="_blank" rel="noreferrer">Открыть</a>` : "—"}</td>
              <td>${escapeHtml(item.note || "—")}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-purchase="${escapeHtml(item.id)}">Изменить</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-purchase="${escapeHtml(item.id)}">Удалить</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="10" class="muted">Пока нет позиций закупки для текущего фильтра.</td></tr>`;
}

function fillAssetForm(item) {
  const dom = getAssetsDom();
  if (!dom.assetForm) return;

  ensureSectionFormVisible("assets");
  STATE.editingAssetId = item.id;
  dom.assetForm.elements.asset_name.value = item.asset_name || "";
  dom.assetForm.elements.asset_value.value = toNumber(item.asset_value);
  dom.assetForm.elements.note.value = item.note || "";
  dom.assetSubmitButton.textContent = "Сохранить изменения";
}

function fillAssetPaymentForm(item) {
  const dom = getAssetsDom();
  if (!dom.paymentForm) return;

  ensureSectionFormVisible("assets");
  STATE.editingAssetPaymentId = item.id;
  dom.paymentForm.elements.asset_id.value = item.asset_id || "";
  dom.paymentForm.elements.payment_date.value = item.payment_date || "";
  dom.paymentForm.elements.payment_amount.value = toNumber(item.payment_amount);
  dom.paymentForm.elements.note.value = item.note || "";
  dom.paymentSubmitButton.textContent = "Сохранить изменения";
}

function fillPurchaseForm(item) {
  const dom = getPurchasesDom();
  if (!dom.form) return;

  ensureSectionFormVisible("purchases");
  STATE.editingPurchaseId = item.id;
  dom.form.elements.supplier_name.value = item.supplier_name || "";
  dom.form.elements.supplier_inn.value = item.supplier_inn || "";
  dom.form.elements.supplier_url.value = item.supplier_url || "";
  dom.form.elements.city.value = item.city || "";
  dom.form.elements.category.value = item.category || "";
  dom.form.elements.article.value = item.article || "";
  dom.form.elements.item_name.value = item.item_name || "";
  dom.form.elements.unit_name.value = item.unit_name || "";
  dom.form.elements.price.value = toNumber(item.price);
  dom.form.elements.note.value = item.note || "";
  dom.submitButton.textContent = "Сохранить изменения";
}

function getVisibleSettlements() {
  const filterPartner = sanitizeSlug(DOM.settlementPartnerFilter.value);
  const filterStatus = DOM.settlementStatusFilter.value;
  const query = String(DOM.settlementSearch.value || "").trim().toLowerCase();
  const currentPartnerSlug = getCurrentPartnerSlug();

  let rows = STATE.settlements.slice();

  if (!isAdmin()) {
    rows = rows.filter((item) => sanitizeSlug(item.partner_slug) === currentPartnerSlug);
  } else if (filterPartner) {
    rows = rows.filter((item) => sanitizeSlug(item.partner_slug) === filterPartner);
  }

  if (filterStatus) {
    rows = rows.filter((item) => item.status === filterStatus);
  }

  if (query) {
    rows = rows.filter((item) => {
      const math = computeSettlement(item);
      const haystack = [
        item.period_label,
        getPartnerLabel(item.partner_slug),
        item.status,
        item.note,
        math.direction
      ]
        .join(" | ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  rows.sort((a, b) => new Date(b.updated_at || b.created_at || 0) - new Date(a.updated_at || a.created_at || 0));
  return rows;
}

function renderSettlementSummary(rows) {
  const pending = rows.filter((item) => item.status !== "Взаиморасчет произведен" && item.status !== "Архив");
  const total = rows.reduce((sum, item) => sum + computeSettlement(item).total, 0);
  const payout = pending.reduce((sum, item) => {
    const math = computeSettlement(item);
    return math.total > 0 ? sum + math.total : sum;
  }, 0);

  DOM.settlementSummary.innerHTML = `
    <article class="summary-card">
      <span>Строк в выборке</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Открытых строк</span>
      <strong>${pending.length}</strong>
    </article>
    <article class="summary-card">
      <span>Чистый итог</span>
      <strong>${formatMoney(total)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>К выплате партнерам</span>
      <strong>${formatMoney(payout)} ₽</strong>
    </article>
  `;
}

function renderBalanceSummary(rows) {
  const dom = getBalanceDom();
  if (!dom.summary) return;

  const totals = getCurrentBalanceTotals();
  const income = rows.reduce((sum, entry) => sum + toNumber(entry.income_amount), 0);
  const expense = rows.reduce((sum, entry) => sum + toNumber(entry.expense_amount), 0);
  const accountCards = BALANCE_ACCOUNTS.map(
    (account) => `
      <article class="summary-card">
        <span>${escapeHtml(account.label)}</span>
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} ₽</strong>
      </article>
    `
  ).join("");

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Записей в выборке</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Приход в выборке</span>
      <strong>${formatMoney(income)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Расход в выборке</span>
      <strong>${formatMoney(expense)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Баланс компании сейчас</span>
      <strong>${formatMoney(totals.total)} ₽</strong>
    </article>
    ${accountCards}
  `;
}

function renderCalendarSummary(rows) {
  const dom = getCalendarDom();
  if (!dom.summary) return;

  const totals = getCurrentBalanceTotals();
  const incoming = rows
    .filter((entry) => entry.operation_type === "Приход")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const outgoing = rows
    .filter((entry) => entry.operation_type === "Расход")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const net = roundMoney(incoming - outgoing);
  const accountCards = BALANCE_ACCOUNTS.map(
    (account) => `
      <article class="summary-card">
        <span>${escapeHtml(account.label)}</span>
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} ₽</strong>
      </article>
    `
  ).join("");

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Записей в выборке</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>Приходы по плану</span>
      <strong>${formatMoney(incoming)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Расходы по плану</span>
      <strong>${formatMoney(outgoing)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Сальдо выборки</span>
      <strong class="${net >= 0 ? "amount-positive" : "amount-negative"}">${net >= 0 ? "+" : ""}${formatMoney(net)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Баланс компании сейчас</span>
      <strong>${formatMoney(totals.total)} ₽</strong>
    </article>
    ${accountCards}
  `;
}

function renderSettlements() {
  DOM.settlementActionsHead.textContent = isAdmin() ? "Действия" : "";
  renderScopeNote();
  renderLiveSectionBuilder("settlements");

  if (!STATE.schemaReady) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">Сначала выполните platform_light2_patch.sql в Supabase SQL Editor.</td></tr>`;
    DOM.settlementSummary.innerHTML = "";
    return;
  }

  const rows = sortSectionRows("settlements", getVisibleSettlements());
  renderSettlementSummary(rows);
  DOM.settlementSummary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("settlements"));

  if (!rows.length) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">Пока нет записей для текущего фильтра.</td></tr>`;
    return;
  }

  DOM.settlementTableBody.innerHTML = rows
    .map((item) => {
      const math = computeSettlement(item);
      const canEdit = isAdmin();
      return `
        <tr>
          <td>${escapeHtml(item.period_label)}</td>
          <td>${escapeHtml(getPartnerLabel(item.partner_slug))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.salary))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.purchase))}</td>
          <td class="text-end">${escapeHtml(formatMoney(math.total))}</td>
          <td>${escapeHtml(math.direction)}</td>
          <td><span class="badge-soft ${getStatusTone(item.status)}">${escapeHtml(item.status)}</span></td>
          <td>${escapeHtml(item.note || "—")}</td>
          <td class="small">${escapeHtml(formatDateTime(item.updated_at || item.created_at))}</td>
          <td>
            ${
              canEdit
                ? `
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark btn-sm" type="button" data-edit-settlement="${escapeHtml(item.id)}">Изменить</button>
                    <button class="btn btn-outline-danger btn-sm" type="button" data-delete-settlement="${escapeHtml(item.id)}">Удалить</button>
                  </div>
                `
                : `<span class="muted">—</span>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderBalance() {
  const dom = getBalanceDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Действия" : "";
  renderBalanceScopeNote();
  renderLiveSectionBuilder("balance");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">Раздел доступен только владельцу и администраторам.</td></tr>`;
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">Сначала выполните platform_light2_finance_patch.sql в Supabase SQL Editor.</td></tr>`;
    return;
  }

  const rows = sortSectionRows("balance", getVisibleBalanceEntries());
  const runningMap = buildBalanceRunningMap();
  renderBalanceSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("balance"));

  if (!rows.length) {
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">Пока нет записей для текущего фильтра.</td></tr>`;
    return;
  }

  dom.tableBody.innerHTML = rows
    .map(
      (entry) => `
        <tr>
          <td>${escapeHtml(formatDate(entry.entry_date))}</td>
          <td>${escapeHtml(getBalanceAccountLabel(entry.account_type))}</td>
          <td class="text-end">${escapeHtml(formatMoney(entry.income_amount))}</td>
          <td class="text-end">${escapeHtml(formatMoney(entry.expense_amount))}</td>
          <td class="text-end">${escapeHtml(formatMoney(runningMap.get(entry.id) || 0))}</td>
          <td>${escapeHtml(entry.note || "—")}</td>
          <td class="small">${escapeHtml(formatDateTime(entry.updated_at || entry.created_at))}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-dark btn-sm" type="button" data-edit-balance="${escapeHtml(entry.id)}">Изменить</button>
              <button class="btn btn-outline-danger btn-sm" type="button" data-delete-balance="${escapeHtml(entry.id)}">Удалить</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderCalendar() {
  const dom = getCalendarDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Действия" : "";
  renderCalendarScopeNote();
  renderLiveSectionBuilder("calendar");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Раздел доступен только владельцу и администраторам.</td></tr>`;
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Сначала выполните platform_light2_finance_patch.sql в Supabase SQL Editor.</td></tr>`;
    return;
  }

  const rows = sortSectionRows("calendar", getVisibleCalendarEntries());
  renderCalendarSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("calendar"));

  if (!rows.length) {
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Пока нет записей для текущего фильтра.</td></tr>`;
    return;
  }

  dom.tableBody.innerHTML = rows
    .map((entry) => {
      const signed = signedCalendarAmount(entry);
      return `
        <tr>
          <td>${escapeHtml(formatDate(entry.payment_date))}</td>
          <td>${escapeHtml(entry.counterparty || "—")}</td>
          <td class="text-end ${signed >= 0 ? "amount-positive" : "amount-negative"}">${signed >= 0 ? "+" : ""}${escapeHtml(formatMoney(entry.amount))}</td>
          <td><span class="badge-soft ${getOperationTone(entry.operation_type)}">${escapeHtml(entry.operation_type || "—")}</span></td>
          <td>${escapeHtml(entry.category || "—")}</td>
          <td>${escapeHtml(entry.account_name || "—")}</td>
          <td><span class="badge-soft ${getCalendarStatusTone(entry.status)}">${escapeHtml(entry.status || "—")}</span></td>
          <td>${escapeHtml(entry.note || "—")}</td>
          <td class="small">${escapeHtml(formatDateTime(entry.updated_at || entry.created_at))}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-dark btn-sm" type="button" data-edit-calendar="${escapeHtml(entry.id)}">Изменить</button>
              <button class="btn btn-outline-danger btn-sm" type="button" data-delete-calendar="${escapeHtml(entry.id)}">Удалить</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function fillSettlementForm(item) {
  ensureSectionFormVisible("settlements");
  STATE.editingSettlementId = item.id;
  DOM.settlementForm.elements.period_label.value = item.period_label || "";
  DOM.settlementForm.elements.partner_slug.value = item.partner_slug || "";
  DOM.settlementForm.elements.salary_amount.value = toNumber(item.salary_amount);
  DOM.settlementForm.elements.purchase_amount.value = toNumber(item.purchase_amount);
  DOM.settlementForm.elements.status.value = item.status || "Ожидает сверки";
  DOM.settlementForm.elements.note.value = item.note || "";
  DOM.settlementSubmitButton.textContent = "Сохранить изменения";
  updateSettlementPreview();
}

function fillBalanceForm(item) {
  const dom = getBalanceDom();
  if (!dom.form) return;

  ensureSectionFormVisible("balance");
  STATE.editingBalanceId = item.id;
  dom.form.elements.entry_date.value = item.entry_date || "";
  dom.form.elements.account_type.value = item.account_type || "cash_card";
  dom.form.elements.income_amount.value = toNumber(item.income_amount);
  dom.form.elements.expense_amount.value = toNumber(item.expense_amount);
  dom.form.elements.note.value = item.note || "";
  dom.submitButton.textContent = "Сохранить изменения";
  updateBalancePreview();
}

function fillCalendarForm(item) {
  const dom = getCalendarDom();
  if (!dom.form) return;

  ensureSectionFormVisible("calendar");
  STATE.editingCalendarId = item.id;
  dom.form.elements.payment_date.value = item.payment_date || "";
  dom.form.elements.counterparty.value = item.counterparty || "";
  dom.form.elements.amount.value = toNumber(item.amount);
  dom.form.elements.operation_type.value = item.operation_type || "Расход";
  dom.form.elements.category.value = item.category || "";
  dom.form.elements.account_name.value = item.account_name || "Наличные / карта";
  dom.form.elements.status.value = item.status || "Платеж";
  dom.form.elements.note.value = item.note || "";
  dom.submitButton.textContent = "Сохранить изменения";
  updateCalendarPreview();
}

function syncModuleStatus() {
  if (!STATE.schemaReady && !STATE.financeReady && !STATE.operationsReady) {
    setModuleState("Нужны SQL-патчи");
    setStatus(
      "ДОМ НЕОНА загружен частично. Выполните platform_light2_patch.sql, platform_light2_finance_patch.sql и platform_light2_assets_purchases_patch.sql в Supabase SQL Editor.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.schemaReady) {
    setModuleState("Частично готово");
    setStatus(
      `Остальные блоки работают, но для взаиморасчетов нужен platform_light2_patch.sql${STATE.operationsReady ? "" : " и для Активов/Закупок нужен platform_light2_assets_purchases_patch.sql"}.`,
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.financeReady && !STATE.operationsReady) {
    setModuleState("Частично готово");
    setStatus(
      "Взаиморасчеты уже работают. Для финансовых блоков выполните platform_light2_finance_patch.sql, а для Активов и Закупок — platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.financeReady) {
    setModuleState("Частично готово");
    setStatus(
      "Взаиморасчеты уже работают. Для разделов Баланс и Платежный календарь выполните platform_light2_finance_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.operationsReady) {
    setModuleState("Частично готово");
    setStatus(
      "Финансовые блоки уже работают. Для разделов Активы и Закупки выполните platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  setModuleState("Готово");
  setStatus("ДОМ НЕОНА загружен. Взаиморасчеты, Баланс, Платежный календарь, Активы и Закупки работают внутри платформы.", "success");
  syncImportButton();
}

async function loadBootstrapData() {
  refreshInteractiveDomRefs();
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  if (!sessionData.session) {
    STATE.session = null;
    STATE.user = null;
    STATE.profile = null;
    setModuleState("Нужен вход");
    setStatus("Откройте модуль через платформу после входа в аккаунт.", "warning");
    DOM.userDisplay.textContent = "Нет сессии";
    DOM.accessMode.textContent = "—";
    syncImportButton();
    return false;
  }

  STATE.session = sessionData.session;
  STATE.user = sessionData.session.user;

  const [{ data: profile, error: profileError }, { data: partners, error: partnersError }] = await Promise.all([
    supabase.from("app_profiles").select("*").eq("id", STATE.user.id).maybeSingle(),
    supabase.from("partner_profiles").select("*").order("display_name", { ascending: true })
  ]);

  if (profileError && profileError.code !== "PGRST116") throw profileError;
  if (partnersError) throw partnersError;

  STATE.profile = profile || null;
  STATE.partnerProfiles = partners || [];
  updateHero();
  syncSectionTabs();
  renderOverview();
  syncImportButton();

  renderPartnerSelect(DOM.settlementPartnerFilter, { includeAll: true });
  renderPartnerSelect(DOM.settlementForm.elements.partner_slug);
  resetSettlementForm();
  resetBalanceForm();
  resetCalendarForm();
  resetAssetForm();
  resetAssetPaymentForm();
  resetPurchaseForm();
  return true;
}

async function loadSettlements() {
  const { data, error } = await supabase
    .from("light2_partner_settlements")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    if (isSchemaMissing(error)) {
      STATE.schemaReady = false;
      STATE.schemaError = error.message || "Таблица light2_partner_settlements не найдена.";
      setModuleState("Нужен SQL-патч");
      setStatus("Чтобы включить рабочий блок взаиморасчетов, выполните platform_light2_patch.sql в Supabase SQL Editor.", "warning");
      renderSettlements();
      renderOverview();
      return;
    }
    throw error;
  }

  STATE.schemaReady = true;
  STATE.schemaError = "";
  STATE.settlements = data || [];
  setModuleState("Готово");
  setStatus("ДОМ НЕОНА загружен. Взаиморасчеты уже работают внутри платформы.", "success");
  renderSettlements();
  renderOverview();
}

async function loadFinanceData() {
  const balanceResult = await supabase
    .from("light2_balance_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("updated_at", { ascending: false });

  const calendarResult = await supabase
    .from("light2_payment_calendar_entries")
    .select("*")
    .order("payment_date", { ascending: true })
    .order("updated_at", { ascending: false });

  if (balanceResult.error || calendarResult.error) {
    const error = balanceResult.error || calendarResult.error;
    if (isFinanceSchemaMissing(error)) {
      STATE.financeReady = false;
      STATE.financeError = error.message || "Таблицы финансовых блоков не найдены.";
      STATE.balanceEntries = [];
      STATE.calendarEntries = [];
      renderBalance();
      renderCalendar();
      renderOverview();
      return;
    }
    throw error;
  }

  STATE.financeReady = true;
  STATE.financeError = "";
  STATE.balanceEntries = balanceResult.data || [];
  STATE.calendarEntries = calendarResult.data || [];
  renderBalance();
  renderCalendar();
  renderOverview();
}

async function loadOperationsData() {
  const [assetsResult, paymentsResult, purchasesResult] = await Promise.all([
    supabase.from("light2_assets").select("*").order("asset_name", { ascending: true }),
    supabase.from("light2_asset_payments").select("*").order("payment_date", { ascending: false }).order("updated_at", { ascending: false }),
    supabase.from("light2_purchase_catalog").select("*").order("supplier_name", { ascending: true }).order("item_name", { ascending: true })
  ]);

  if (assetsResult.error || paymentsResult.error || purchasesResult.error) {
    const error = assetsResult.error || paymentsResult.error || purchasesResult.error;
    if (isOperationsSchemaMissing(error)) {
      STATE.operationsReady = false;
      STATE.operationsError = error.message || "Таблицы блоков Активы/Закупки не найдены.";
      STATE.assets = [];
      STATE.assetPayments = [];
      STATE.purchaseCatalog = [];
      renderAssets();
      renderPurchases();
      renderOverview();
      return;
    }
    throw error;
  }

  STATE.operationsReady = true;
  STATE.operationsError = "";
  STATE.assets = assetsResult.data || [];
  STATE.assetPayments = paymentsResult.data || [];
  STATE.purchaseCatalog = purchasesResult.data || [];
  renderAssets();
  renderPurchases();
  renderOverview();
}

async function saveSettlement() {
  const formData = new FormData(DOM.settlementForm);
  const payload = {
    partner_slug: sanitizeSlug(formData.get("partner_slug")),
    period_label: String(formData.get("period_label") || "").trim(),
    salary_amount: toNumber(formData.get("salary_amount")),
    purchase_amount: toNumber(formData.get("purchase_amount")),
    status: String(formData.get("status") || "Ожидает сверки"),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.partner_slug || !payload.period_label) {
    throw new Error("Укажите период и партнера.");
  }

  if (STATE.editingSettlementId) {
    const { error } = await supabase
      .from("light2_partner_settlements")
      .update(payload)
      .eq("id", STATE.editingSettlementId);
    if (error) throw error;
    setStatus("Запись взаиморасчета обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_partner_settlements").insert(payload);
    if (error) throw error;
    setStatus("Запись взаиморасчета добавлена.", "success");
  }

  resetSettlementForm();
  await loadSettlements();
  syncModuleStatus();
}

async function deleteSettlement(id) {
  const { error } = await supabase.from("light2_partner_settlements").delete().eq("id", id);
  if (error) throw error;
  setStatus("Запись взаиморасчета удалена.", "success");
  await loadSettlements();
  syncModuleStatus();
}

async function saveBalanceEntry() {
  const dom = getBalanceDom();
  const formData = new FormData(dom.form);
  const payload = {
    entry_date: String(formData.get("entry_date") || "").trim(),
    account_type: String(formData.get("account_type") || "cash_card"),
    income_amount: roundMoney(formData.get("income_amount")),
    expense_amount: roundMoney(formData.get("expense_amount")),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.entry_date) throw new Error("Укажите дату записи.");
  if (!BALANCE_ACCOUNTS.some((item) => item.value === payload.account_type)) throw new Error("Выберите корректный счёт.");
  if (payload.income_amount <= 0 && payload.expense_amount <= 0) {
    throw new Error("Укажите приход или расход больше нуля.");
  }

  if (STATE.editingBalanceId) {
    const { error } = await supabase.from("light2_balance_entries").update(payload).eq("id", STATE.editingBalanceId);
    if (error) throw error;
    setStatus("Запись баланса обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_balance_entries").insert(payload);
    if (error) throw error;
    setStatus("Запись баланса добавлена.", "success");
  }

  resetBalanceForm();
  await loadFinanceData();
  syncModuleStatus();
}

async function saveCalendarEntry() {
  const dom = getCalendarDom();
  const formData = new FormData(dom.form);
  const payload = {
    payment_date: String(formData.get("payment_date") || "").trim(),
    counterparty: String(formData.get("counterparty") || "").trim(),
    amount: roundMoney(formData.get("amount")),
    operation_type: String(formData.get("operation_type") || "Расход"),
    category: String(formData.get("category") || "").trim() || null,
    account_name: String(formData.get("account_name") || "Не распределено"),
    status: String(formData.get("status") || "Платеж"),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.payment_date || !payload.counterparty) throw new Error("Укажите дату платежа и контрагента.");
  if (payload.amount <= 0) throw new Error("Сумма должна быть больше нуля.");
  if (!["Приход", "Расход"].includes(payload.operation_type)) throw new Error("Выберите корректный тип операции.");
  if (!CALENDAR_ACCOUNTS.some((item) => item.value === payload.account_name)) throw new Error("Выберите корректный счёт.");
  if (!CALENDAR_STATUSES.includes(payload.status)) throw new Error("Выберите корректный статус.");

  if (STATE.editingCalendarId) {
    const { error } = await supabase
      .from("light2_payment_calendar_entries")
      .update(payload)
      .eq("id", STATE.editingCalendarId);
    if (error) throw error;
    setStatus("Запись платежного календаря обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_payment_calendar_entries").insert(payload);
    if (error) throw error;
    setStatus("Запись платежного календаря добавлена.", "success");
  }

  resetCalendarForm();
  await loadFinanceData();
  syncModuleStatus();
}

async function saveAsset() {
  const dom = getAssetsDom();
  const formData = new FormData(dom.assetForm);
  const payload = {
    asset_name: String(formData.get("asset_name") || "").trim(),
    asset_value: roundMoney(formData.get("asset_value")),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.asset_name) throw new Error("Укажите название актива.");
  if (payload.asset_value < 0) throw new Error("Стоимость актива не может быть отрицательной.");

  if (STATE.editingAssetId) {
    const { error } = await supabase.from("light2_assets").update(payload).eq("id", STATE.editingAssetId);
    if (error) throw error;
    setStatus("Актив обновлен.", "success");
  } else {
    const { error } = await supabase.from("light2_assets").insert(payload);
    if (error) throw error;
    setStatus("Актив добавлен.", "success");
  }

  resetAssetForm();
  await loadOperationsData();
  syncModuleStatus();
}

async function saveAssetPayment() {
  const dom = getAssetsDom();
  const formData = new FormData(dom.paymentForm);
  const payload = {
    asset_id: String(formData.get("asset_id") || "").trim() || null,
    payment_date: String(formData.get("payment_date") || "").trim(),
    payment_amount: roundMoney(formData.get("payment_amount")),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.payment_date) throw new Error("Укажите дату выплаты.");
  if (payload.payment_amount <= 0) throw new Error("Сумма выплаты должна быть больше нуля.");

  if (STATE.editingAssetPaymentId) {
    const { error } = await supabase.from("light2_asset_payments").update(payload).eq("id", STATE.editingAssetPaymentId);
    if (error) throw error;
    setStatus("Запись графика выплат обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_asset_payments").insert(payload);
    if (error) throw error;
    setStatus("Запись графика выплат добавлена.", "success");
  }

  resetAssetPaymentForm();
  await loadOperationsData();
  syncModuleStatus();
}

async function savePurchase() {
  const dom = getPurchasesDom();
  const formData = new FormData(dom.form);
  const payload = {
    supplier_name: String(formData.get("supplier_name") || "").trim(),
    supplier_inn: String(formData.get("supplier_inn") || "").trim() || null,
    supplier_url: String(formData.get("supplier_url") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    category: String(formData.get("category") || "").trim() || null,
    article: String(formData.get("article") || "").trim() || null,
    item_name: String(formData.get("item_name") || "").trim() || null,
    unit_name: String(formData.get("unit_name") || "").trim() || null,
    price: roundMoney(formData.get("price")),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.supplier_name) throw new Error("Укажите поставщика.");

  if (STATE.editingPurchaseId) {
    const { error } = await supabase.from("light2_purchase_catalog").update(payload).eq("id", STATE.editingPurchaseId);
    if (error) throw error;
    setStatus("Позиция закупки обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_purchase_catalog").insert(payload);
    if (error) throw error;
    setStatus("Позиция закупки добавлена.", "success");
  }

  resetPurchaseForm();
  await loadOperationsData();
  syncModuleStatus();
}

async function deleteBalanceEntry(id) {
  const { error } = await supabase.from("light2_balance_entries").delete().eq("id", id);
  if (error) throw error;
  setStatus("Запись баланса удалена.", "success");
  await loadFinanceData();
  syncModuleStatus();
}

async function deleteCalendarEntry(id) {
  const { error } = await supabase.from("light2_payment_calendar_entries").delete().eq("id", id);
  if (error) throw error;
  setStatus("Запись платежного календаря удалена.", "success");
  await loadFinanceData();
  syncModuleStatus();
}

async function deleteAsset(id) {
  const { error } = await supabase.from("light2_assets").delete().eq("id", id);
  if (error) throw error;
  setStatus("Актив удален.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

async function deleteAssetPayment(id) {
  const { error } = await supabase.from("light2_asset_payments").delete().eq("id", id);
  if (error) throw error;
  setStatus("Выплата по активу удалена.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

async function deletePurchase(id) {
  const { error } = await supabase.from("light2_purchase_catalog").delete().eq("id", id);
  if (error) throw error;
  setStatus("Позиция закупки удалена.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

function bindEvents() {
  refreshInteractiveDomRefs();
  const settlementDom = getSettlementDom();
  const balanceDom = getBalanceDom();
  const calendarDom = getCalendarDom();
  const assetsDom = getAssetsDom();
  const purchasesDom = getPurchasesDom();

  DOM.sectionTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    openSection(button.dataset.section);
  });

  DOM.overviewGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-open-section]");
    if (!button) return;
    openSection(button.dataset.openSection);
  });

  DOM.toggleCompactTablesButton?.addEventListener("click", () => {
    STATE.ui.compactTables = !STATE.ui.compactTables;
    persistWorkspaceUi();
    syncWorkspaceModeUi();
  });

  DOM.toggleAllFormsButton?.addEventListener("click", () => {
    toggleAllForms();
  });

  document.body.addEventListener("click", (event) => {
    const formToggleButton = event.target.closest("[data-form-toggle]");
    if (formToggleButton) {
      toggleSectionForm(formToggleButton.dataset.formToggle);
      return;
    }

    const startButton = event.target.closest("[data-section-start]");
    if (startButton) {
      const sectionKey = startButton.dataset.sectionStart;
      ensureSectionFormVisible(sectionKey);
      if (sectionKey === "settlements") {
        resetSettlementForm();
      } else if (sectionKey === "balance") {
        resetBalanceForm();
      } else if (sectionKey === "calendar") {
        resetCalendarForm();
      } else if (sectionKey === "assets") {
        resetAssetForm();
        resetAssetPaymentForm();
      } else if (sectionKey === "purchases") {
        resetPurchaseForm();
      }
      openSection(sectionKey);
      document.querySelector(`#section-${sectionKey}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  DOM.importWorkbookButton?.addEventListener("click", async () => {
    try {
      await importWorkbookIntoTables();
    } catch (error) {
      setStatus(error.message || "Не удалось импортировать исходный файл.", "error");
    }
  });

  document.body.addEventListener("input", (event) => {
    const input = event.target.closest("[data-snapshot-search]");
    if (!input) return;
    STATE.snapshotSearches[input.dataset.snapshotSearch] = input.value;
    renderWorkbookSnapshotSection(input.dataset.snapshotSearch);
  });

  settlementDom.form?.addEventListener("input", updateSettlementPreview);
  balanceDom.form?.addEventListener("input", updateBalancePreview);
  calendarDom.form?.addEventListener("input", updateCalendarPreview);

  settlementDom.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveSettlement();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить запись взаиморасчета.", "error");
    }
  });

  balanceDom.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveBalanceEntry();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить запись баланса.", "error");
    }
  });

  calendarDom.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveCalendarEntry();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить запись платежного календаря.", "error");
    }
  });

  assetsDom.assetForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveAsset();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить актив.", "error");
    }
  });

  assetsDom.paymentForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveAssetPayment();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить выплату по активу.", "error");
    }
  });

  purchasesDom.form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await savePurchase();
    } catch (error) {
      setStatus(error.message || "Не удалось сохранить позицию закупки.", "error");
    }
  });

  settlementDom.resetButton?.addEventListener("click", () => {
    resetSettlementForm();
    renderSettlements();
  });

  balanceDom.resetButton?.addEventListener("click", () => {
    resetBalanceForm();
    renderBalance();
  });

  calendarDom.resetButton?.addEventListener("click", () => {
    resetCalendarForm();
    renderCalendar();
  });

  assetsDom.assetResetButton?.addEventListener("click", () => {
    resetAssetForm();
    renderAssets();
  });

  assetsDom.paymentResetButton?.addEventListener("click", () => {
    resetAssetPaymentForm();
    renderAssets();
  });

  purchasesDom.resetButton?.addEventListener("click", () => {
    resetPurchaseForm();
    renderPurchases();
  });

  [settlementDom.partnerFilter, settlementDom.statusFilter, settlementDom.search].forEach((element) => {
    element.addEventListener("input", renderSettlements);
    element.addEventListener("change", renderSettlements);
  });

  [balanceDom.accountFilter, balanceDom.monthFilter, balanceDom.search].forEach((element) => {
    element?.addEventListener("input", renderBalance);
    element?.addEventListener("change", renderBalance);
  });

  [calendarDom.monthFilter, calendarDom.operationFilter, calendarDom.accountFilter, calendarDom.statusFilter, calendarDom.search].forEach(
    (element) => {
      element?.addEventListener("input", renderCalendar);
      element?.addEventListener("change", renderCalendar);
    }
  );

  [assetsDom.search, assetsDom.paymentFilter, assetsDom.paymentSearch].forEach((element) => {
    element?.addEventListener("input", renderAssets);
    element?.addEventListener("change", renderAssets);
  });

  [purchasesDom.supplierFilter, purchasesDom.categoryFilter, purchasesDom.search].forEach((element) => {
    element?.addEventListener("input", renderPurchases);
    element?.addEventListener("change", renderPurchases);
  });

  settlementDom.refreshButton?.addEventListener("click", async () => {
    try {
      await loadSettlements();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить взаиморасчеты.", "error");
    }
  });

  balanceDom.refreshButton?.addEventListener("click", async () => {
    try {
      await loadFinanceData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить баланс.", "error");
    }
  });

  calendarDom.refreshButton?.addEventListener("click", async () => {
    try {
      await loadFinanceData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить платежный календарь.", "error");
    }
  });

  assetsDom.refreshButton?.addEventListener("click", async () => {
    try {
      await loadOperationsData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить раздел Активы.", "error");
    }
  });

  purchasesDom.refreshButton?.addEventListener("click", async () => {
    try {
      await loadOperationsData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "Не удалось обновить раздел Закупки.", "error");
    }
  });

  settlementDom.tableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-settlement]");
    if (editButton) {
      const item = STATE.settlements.find((row) => row.id === editButton.dataset.editSettlement);
      if (item) {
        fillSettlementForm(item);
        openSection("settlements");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-settlement]");
    if (!deleteButton) return;

    if (!window.confirm("Удалить запись взаиморасчета?")) return;
    try {
      await deleteSettlement(deleteButton.dataset.deleteSettlement);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить запись.", "error");
    }
  });

  balanceDom.tableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-balance]");
    if (editButton) {
      const item = STATE.balanceEntries.find((row) => row.id === editButton.dataset.editBalance);
      if (item) {
        fillBalanceForm(item);
        openSection("balance");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-balance]");
    if (!deleteButton) return;
    if (!window.confirm("Удалить запись баланса?")) return;

    try {
      await deleteBalanceEntry(deleteButton.dataset.deleteBalance);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить запись баланса.", "error");
    }
  });

  calendarDom.tableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-calendar]");
    if (editButton) {
      const item = STATE.calendarEntries.find((row) => row.id === editButton.dataset.editCalendar);
      if (item) {
        fillCalendarForm(item);
        openSection("calendar");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-calendar]");
    if (!deleteButton) return;
    if (!window.confirm("Удалить запись платежного календаря?")) return;

    try {
      await deleteCalendarEntry(deleteButton.dataset.deleteCalendar);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить запись платежного календаря.", "error");
    }
  });

  assetsDom.assetTableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-asset]");
    if (editButton) {
      const item = STATE.assets.find((row) => row.id === editButton.dataset.editAsset);
      if (item) {
        fillAssetForm(item);
        openSection("assets");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-asset]");
    if (!deleteButton) return;
    if (!window.confirm("Удалить актив?")) return;

    try {
      await deleteAsset(deleteButton.dataset.deleteAsset);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить актив.", "error");
    }
  });

  assetsDom.paymentTableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-asset-payment]");
    if (editButton) {
      const item = STATE.assetPayments.find((row) => row.id === editButton.dataset.editAssetPayment);
      if (item) {
        fillAssetPaymentForm(item);
        openSection("assets");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-asset-payment]");
    if (!deleteButton) return;
    if (!window.confirm("Удалить выплату по активу?")) return;

    try {
      await deleteAssetPayment(deleteButton.dataset.deleteAssetPayment);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить выплату по активу.", "error");
    }
  });

  purchasesDom.tableBody?.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-purchase]");
    if (editButton) {
      const item = STATE.purchaseCatalog.find((row) => row.id === editButton.dataset.editPurchase);
      if (item) {
        fillPurchaseForm(item);
        openSection("purchases");
      }
      return;
    }

    const deleteButton = event.target.closest("[data-delete-purchase]");
    if (!deleteButton) return;
    if (!window.confirm("Удалить позицию закупки?")) return;

    try {
      await deletePurchase(deleteButton.dataset.deletePurchase);
    } catch (error) {
      setStatus(error.message || "Не удалось удалить позицию закупки.", "error");
    }
  });
}

function renderSettlements() {
  DOM.settlementActionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderScopeNote();
  renderLiveSectionBuilder("settlements");

  if (!STATE.schemaReady) {
    syncSectionTableHead("settlements", "main", DOM.settlementTableBody);
    DOM.settlementTableBody.innerHTML = renderConfiguredSectionRows(
      "settlements",
      "main",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_patch.sql РІ Supabase SQL Editor."
    );
    DOM.settlementSummary.innerHTML = "";
    return;
  }

  const rows = sortSectionRows("settlements", getVisibleSettlements());
  renderSettlementSummary(rows);
  DOM.settlementSummary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("settlements"));
  syncSectionTableHead("settlements", "main", DOM.settlementTableBody);
  DOM.settlementTableBody.innerHTML = renderConfiguredSectionRows(
    "settlements",
    "main",
    rows,
    (item, columnKey) => {
      const math = computeSettlement(item);
      if (columnKey === "period_label") return escapeHtml(item.period_label || "вЂ”");
      if (columnKey === "partner_label") return escapeHtml(getPartnerLabel(item.partner_slug));
      if (columnKey === "salary_amount") return escapeHtml(formatMoney(math.salary));
      if (columnKey === "purchase_amount") return escapeHtml(formatMoney(math.purchase));
      if (columnKey === "settlement_total") return escapeHtml(formatMoney(math.total));
      if (columnKey === "direction") return escapeHtml(math.direction);
      if (columnKey === "status") return `<span class="badge-soft ${getStatusTone(item.status)}">${escapeHtml(item.status)}</span>`;
      if (columnKey === "note") return escapeHtml(item.note || "вЂ”");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(item.updated_at || item.created_at));
      if (columnKey === "actions") {
        if (!isAdmin()) return `<span class="muted">вЂ”</span>`;
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-settlement="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-settlement="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
}

function renderBalance() {
  const dom = getBalanceDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderBalanceScopeNote();
  renderLiveSectionBuilder("balance");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("balance", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "balance",
      "main",
      [],
      () => "",
      "Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј."
    );
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("balance", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "balance",
      "main",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql РІ Supabase SQL Editor."
    );
    return;
  }

  const rows = sortSectionRows("balance", getVisibleBalanceEntries());
  const runningMap = buildBalanceRunningMap();
  renderBalanceSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("balance"));
  syncSectionTableHead("balance", "main", dom.tableBody);
  dom.tableBody.innerHTML = renderConfiguredSectionRows(
    "balance",
    "main",
    rows,
    (entry, columnKey) => {
      if (columnKey === "entry_date") return escapeHtml(formatDate(entry.entry_date));
      if (columnKey === "account_type") return escapeHtml(getBalanceAccountLabel(entry.account_type));
      if (columnKey === "income_amount") return escapeHtml(formatMoney(entry.income_amount));
      if (columnKey === "expense_amount") return escapeHtml(formatMoney(entry.expense_amount));
      if (columnKey === "running_total") return escapeHtml(formatMoney(runningMap.get(entry.id) || 0));
      if (columnKey === "note") return escapeHtml(entry.note || "вЂ”");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(entry.updated_at || entry.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-balance="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-balance="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
}

function renderCalendar() {
  const dom = getCalendarDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderCalendarScopeNote();
  renderLiveSectionBuilder("calendar");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("calendar", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "calendar",
      "main",
      [],
      () => "",
      "Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј."
    );
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("calendar", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "calendar",
      "main",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql РІ Supabase SQL Editor."
    );
    return;
  }

  const rows = sortSectionRows("calendar", getVisibleCalendarEntries());
  renderCalendarSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("calendar"));
  syncSectionTableHead("calendar", "main", dom.tableBody);
  dom.tableBody.innerHTML = renderConfiguredSectionRows(
    "calendar",
    "main",
    rows,
    (entry, columnKey) => {
      const signed = signedCalendarAmount(entry);
      if (columnKey === "payment_date") return escapeHtml(formatDate(entry.payment_date));
      if (columnKey === "counterparty") return escapeHtml(entry.counterparty || "вЂ”");
      if (columnKey === "signed_amount") {
        return `<span class="${signed >= 0 ? "amount-positive" : "amount-negative"}">${signed >= 0 ? "+" : ""}${escapeHtml(formatMoney(entry.amount))}</span>`;
      }
      if (columnKey === "operation_type") {
        return `<span class="badge-soft ${getOperationTone(entry.operation_type)}">${escapeHtml(entry.operation_type || "вЂ”")}</span>`;
      }
      if (columnKey === "category") return escapeHtml(entry.category || "вЂ”");
      if (columnKey === "account_name") return escapeHtml(entry.account_name || "вЂ”");
      if (columnKey === "status") {
        return `<span class="badge-soft ${getCalendarStatusTone(entry.status)}">${escapeHtml(entry.status || "вЂ”")}</span>`;
      }
      if (columnKey === "note") return escapeHtml(entry.note || "вЂ”");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(entry.updated_at || entry.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-calendar="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-calendar="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
}

function renderAssets() {
  const dom = getAssetsDom();
  if (!dom.assetTableBody || !dom.paymentTableBody) return;

  renderAssetsScopeNote();
  renderLiveSectionBuilder("assets");
  dom.assetForm?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
  dom.paymentForm?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
  populateAssetSelectors();

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("assets", "assets", dom.assetTableBody);
    syncSectionTableHead("assets", "payments", dom.paymentTableBody);
    dom.assetTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "assets",
      [],
      () => "",
      "Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј."
    );
    dom.paymentTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "payments",
      [],
      () => "",
      "Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј."
    );
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("assets", "assets", dom.assetTableBody);
    syncSectionTableHead("assets", "payments", dom.paymentTableBody);
    dom.assetTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "assets",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor."
    );
    dom.paymentTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "payments",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor."
    );
    return;
  }

  const totals = buildAssetPaymentTotals();
  const assetRows = sortSectionRows("assets", getVisibleAssets());
  const paymentRows = getVisibleAssetPayments();
  renderAssetsSummary();
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("assets"));
  syncSectionTableHead("assets", "assets", dom.assetTableBody);
  dom.assetTableBody.innerHTML = renderConfiguredSectionRows(
    "assets",
    "assets",
    assetRows,
    (asset, columnKey) => {
      const paid = toNumber(totals[asset.id] || 0);
      const remaining = roundMoney(toNumber(asset.asset_value) - paid);
      if (columnKey === "asset_name") return escapeHtml(asset.asset_name || "вЂ”");
      if (columnKey === "asset_value") return escapeHtml(formatMoney(asset.asset_value));
      if (columnKey === "paid_total") return escapeHtml(formatMoney(paid));
      if (columnKey === "remaining_amount") {
        return `<span class="${remaining <= 0 ? "amount-positive" : "amount-negative"}">${escapeHtml(formatMoney(remaining))}</span>`;
      }
      if (columnKey === "note") return escapeHtml(asset.note || "вЂ”");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(asset.updated_at || asset.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset="${escapeHtml(asset.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset="${escapeHtml(asset.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ Р°РєС‚РёРІРѕРІ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
  syncSectionTableHead("assets", "payments", dom.paymentTableBody);
  dom.paymentTableBody.innerHTML = renderConfiguredSectionRows(
    "assets",
    "payments",
    paymentRows,
    (payment, columnKey) => {
      if (columnKey === "payment_date") return escapeHtml(formatDate(payment.payment_date));
      if (columnKey === "asset_label") return escapeHtml(getAssetLabel(payment.asset_id));
      if (columnKey === "payment_amount") return escapeHtml(formatMoney(payment.payment_amount));
      if (columnKey === "note") return escapeHtml(payment.note || "вЂ”");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(payment.updated_at || payment.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset-payment="${escapeHtml(payment.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset-payment="${escapeHtml(payment.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ РІС‹РїР»Р°С‚ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
}

function renderPurchases() {
  const dom = getPurchasesDom();
  if (!dom.tableBody) return;

  renderPurchasesScopeNote();
  renderLiveSectionBuilder("purchases");
  dom.form?.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("purchases"));
  populatePurchaseFilters();

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("purchases", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "purchases",
      "main",
      [],
      () => "",
      "Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј."
    );
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    syncSectionTableHead("purchases", "main", dom.tableBody);
    dom.tableBody.innerHTML = renderConfiguredSectionRows(
      "purchases",
      "main",
      [],
      () => "",
      "РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor."
    );
    return;
  }

  const rows = sortSectionRows("purchases", getVisiblePurchases());
  renderPurchasesSummary();
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("purchases"));
  syncSectionTableHead("purchases", "main", dom.tableBody);
  dom.tableBody.innerHTML = renderConfiguredSectionRows(
    "purchases",
    "main",
    rows,
    (item, columnKey) => {
      if (columnKey === "supplier_name") return escapeHtml(item.supplier_name || "вЂ”");
      if (columnKey === "supplier_inn") return escapeHtml(item.supplier_inn || "вЂ”");
      if (columnKey === "city") return escapeHtml(item.city || "вЂ”");
      if (columnKey === "category") return escapeHtml(item.category || "вЂ”");
      if (columnKey === "article") return escapeHtml(item.article || "вЂ”");
      if (columnKey === "item_name") return escapeHtml(item.item_name || "вЂ”");
      if (columnKey === "unit_name") return escapeHtml(item.unit_name || "вЂ”");
      if (columnKey === "price") return escapeHtml(formatMoney(item.price));
      if (columnKey === "note") return escapeHtml(item.note || "вЂ”");
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-purchase="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-purchase="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>
          </div>
        `;
      }
      return `<span class="muted">вЂ”</span>`;
    },
    "РџРѕРєР° РЅРµС‚ РїРѕР·РёС†РёР№ Р·Р°РєСѓРїРєРё РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°."
  );
}

function bindBuilderEvents() {
  document.body.addEventListener("click", async (event) => {
    const toggleButton = event.target.closest("[data-builder-toggle]");
    if (toggleButton) {
      toggleSectionBuilder(toggleButton.dataset.builderToggle);
      return;
    }

    const saveViewButton = event.target.closest("[data-builder-view-save]");
    if (saveViewButton) {
      try {
        saveCurrentSectionView(saveViewButton.dataset.builderViewSave);
      } catch (error) {
        setStatus(error.message || "Не удалось сохранить вид.", "error");
      }
      return;
    }

    const applyViewButton = event.target.closest("[data-builder-view-apply]");
    if (applyViewButton) {
      applySectionView(applyViewButton.dataset.builderViewApply, applyViewButton.dataset.builderViewId);
      return;
    }

    const deleteViewButton = event.target.closest("[data-builder-view-delete]");
    if (deleteViewButton) {
      deleteSectionView(deleteViewButton.dataset.builderViewDelete, deleteViewButton.dataset.builderViewId);
      return;
    }

    const resetFiltersButton = event.target.closest("[data-builder-filters-reset]");
    if (resetFiltersButton) {
      clearSectionFilters(resetFiltersButton.dataset.builderFiltersReset);
      return;
    }

    const saveSortButton = event.target.closest("[data-builder-sort-save]");
    if (saveSortButton) {
      saveSectionSort(saveSortButton.dataset.builderSortSave);
      return;
    }

    const exportButton = event.target.closest("[data-builder-export]");
    if (exportButton) {
      try {
        await exportSectionBuilder(exportButton.dataset.builderExport);
      } catch (error) {
        setStatus(error.message || "Не удалось экспортировать схему секции.", "error");
      }
      return;
    }

    const importButton = event.target.closest("[data-builder-import]");
    if (importButton) {
      try {
        await importSectionBuilder(importButton.dataset.builderImport);
      } catch (error) {
        setStatus(error.message || "Не удалось импортировать схему секции.", "error");
      }
      return;
    }

    const saveColumnsButton = event.target.closest("[data-builder-columns-save]");
    if (saveColumnsButton) {
      try {
        saveSectionColumns(
          saveColumnsButton.dataset.builderColumnsSave,
          saveColumnsButton.dataset.builderTableSave
        );
      } catch (error) {
        setStatus(error.message || "Не удалось сохранить колонки.", "error");
      }
      return;
    }

    const saveFormulaButton = event.target.closest("[data-builder-formula-save]");
    if (saveFormulaButton) {
      try {
        saveSectionFormula(saveFormulaButton.dataset.builderFormulaSave);
      } catch (error) {
        setStatus(error.message || "Не удалось сохранить формулу.", "error");
      }
      return;
    }

    const deleteFormulaButton = event.target.closest("[data-builder-formula-delete]");
    if (deleteFormulaButton) {
      deleteSectionFormula(
        deleteFormulaButton.dataset.builderFormulaDelete,
        deleteFormulaButton.dataset.builderFormulaKey
      );
      return;
    }

    const saveSchemaButton = event.target.closest("[data-builder-schema-save]");
    if (saveSchemaButton) {
      try {
        saveSectionSchema(saveSchemaButton.dataset.builderSchemaSave);
      } catch (error) {
        setStatus(error.message || "Не удалось сохранить JSON-схему.", "error");
      }
      return;
    }

    const resetButton = event.target.closest("[data-builder-reset]");
    if (resetButton) {
      resetSectionBuilder(resetButton.dataset.builderReset);
    }
  });
}

async function start() {
  renderOverview();
  renderTemplateSections();
  renderInteractiveFinanceSections();
  refreshInteractiveDomRefs();
  renderWorkbookSnapshotSections();
  syncSectionTabs();
  bindEvents();
  bindBuilderEvents();
  syncWorkspaceModeUi();
  openSection(STATE.activeSection || "overview");
  void loadWorkbookSnapshot();

  try {
    const ready = await loadBootstrapData();
    if (!ready) return;
    await loadSettlements();
    await loadFinanceData();
    await loadOperationsData();
    syncModuleStatus();
    syncImportButton();
  } catch (error) {
    setModuleState("Ошибка");
    setStatus(error.message || "Не удалось запустить модуль ДОМ НЕОНА.", "error");
    syncImportButton();
  }
}

start();
