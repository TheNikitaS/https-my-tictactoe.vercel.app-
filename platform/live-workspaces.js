const LIVE_MODULE_CONFIG = {
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
  crm: [
    { key: "overview", label: "Обзор" },
    { key: "board", label: "Воронка" },
    { key: "table", label: "Таблица" },
    { key: "form", label: "Карточка" }
  ],
  warehouse: [
    { key: "overview", label: "Обзор" },
    { key: "catalog", label: "Каталог" },
    { key: "movements", label: "Движения" },
    { key: "form", label: "Формы" }
  ],
  tasks: [
    { key: "overview", label: "Обзор" },
    { key: "board", label: "Канбан" },
    { key: "table", label: "Лента" },
    { key: "form", label: "Формы" }
  ]
};

const LIVE_UI_STORAGE_PREFIX = "dom-neona:live-ui";
const LIVE_DRAFT_STORAGE_PREFIX = "dom-neona:live-draft";
const EXTERNAL_SHARED_APPS = {
  sales: "sales-tracker",
  myCalculator: "moy-calculator",
  partnerCalculatorsPattern: "part-calculator%"
};

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
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
  if (moduleKey === "crm") return { search: "", stage: "all", owner: "all" };
  if (moduleKey === "warehouse") return { search: "", category: "all" };
  return { search: "", status: "all", sprint: "all", owner: "all" };
}

function createDefaultView(moduleKey) {
  return {
    id: "default",
    label: BUILDER_META[moduleKey].defaultViewLabel,
    filters: getDefaultFilters(moduleKey)
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
  const fields = Array.isArray(builder?.fields)
    ? builder.fields.map((field) => normalizeFieldDefinition(moduleKey, field)).filter(Boolean)
    : [];
  const formulas = Array.isArray(builder?.formulas)
    ? builder.formulas.map((formula) => normalizeFormulaDefinition(formula)).filter(Boolean)
    : [];
  const defaultView = createDefaultView(moduleKey);
  const customViews = Array.isArray(builder?.views)
    ? builder.views.map((view) => normalizeViewDefinition(moduleKey, view)).filter(Boolean)
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

function createDefaultWarehouseDoc() {
  return { version: 2, builder: normalizeBuilderSchema("warehouse", null), items: [], movements: [], updatedAt: new Date().toISOString() };
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

function normalizeWarehouseDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultWarehouseDoc();
  next.builder = normalizeBuilderSchema("warehouse", next.builder);
  next.items = Array.isArray(next.items) ? next.items.map((item) => ({ ...item, custom: item?.custom && typeof item.custom === "object" ? item.custom : {} })) : [];
  next.movements = Array.isArray(next.movements) ? next.movements : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeTasksDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultTasksDoc();
  next.builder = normalizeBuilderSchema("tasks", next.builder);
  next.sprints = Array.isArray(next.sprints) ? next.sprints : [];
  next.tasks = Array.isArray(next.tasks) ? next.tasks.map((task) => ({ ...task, custom: task?.custom && typeof task.custom === "object" ? task.custom : {} })) : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
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
      const evaluator = new Function(
        "records",
        "helpers",
        "count",
        "countWhere",
        "sum",
        "avg",
        "min",
        "max",
        "percent",
        "today",
        `return (${formula.expression || "0"});`
      );
      const value = evaluator(
        records,
        helpers,
        helpers.count,
        helpers.countWhere,
        helpers.sum,
        helpers.avg,
        helpers.min,
        helpers.max,
        helpers.percent,
        helpers.today
      );
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
  const meta = BUILDER_META[moduleKey];
  const customFields = getCustomFields(moduleKey, doc);
  const formulas = doc?.builder?.formulas || [];
  const views = getViewList(moduleKey, doc).filter((view) => view.id !== "default");

  return `
    <section class="workspace-panel workspace-builder ${uiState.configOpen ? "" : "d-none"}">
      <div class="panel-heading">
        <div>
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
  const docs = { crm: null, warehouse: null, tasks: null };
  const externalDocs = {
    sales: null,
    myCalculator: null,
    partnerCalculators: null
  };

  function getModuleUiKey(moduleKey) {
    return `${LIVE_UI_STORAGE_PREFIX}:${moduleKey}`;
  }

  function getDraftKey(moduleKey, formKey) {
    return `${LIVE_DRAFT_STORAGE_PREFIX}:${moduleKey}:${formKey}`;
  }

  function hydrateUiState(moduleKey, defaults) {
    return { ...defaults, ...readStoredJson(getModuleUiKey(moduleKey), {}) };
  }

  function persistUiState(moduleKey) {
    if (!supports(moduleKey)) return;
    const state = ui[moduleKey] || {};
    const payload = {};
    Object.keys(state).forEach((key) => {
      if (key.endsWith("Id")) return;
      payload[key] = state[key];
    });
    writeStoredJson(getModuleUiKey(moduleKey), payload);
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
    const uiState = ui[moduleKey];
    const options = MODULE_MODE_CONFIG[moduleKey] || [];
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
    return `
      <div class="workspace-command-bar">
        <div class="workspace-command-bar__meta">
          <span class="workspace-command-chip">Режим: ${escapeFn((MODULE_MODE_CONFIG[moduleKey] || []).find((item) => item.key === ui[moduleKey].mode)?.label || "Обзор")}</span>
          <span class="workspace-command-chip">Вид: ${escapeFn(ui[moduleKey].activeViewId === "adhoc" ? "Текущий фильтр" : "Сохраненный")}</span>
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
    crm: hydrateUiState("crm", { search: "", stage: "all", owner: "all", editId: null, activeViewId: "default", configOpen: false, mode: "overview" }),
    warehouse: hydrateUiState("warehouse", { search: "", category: "all", itemEditId: null, movementItemId: "", activeViewId: "default", configOpen: false, mode: "overview" }),
    tasks: hydrateUiState("tasks", { search: "", status: "all", sprint: "all", owner: "all", taskEditId: null, sprintEditId: null, activeViewId: "default", configOpen: false, mode: "overview" })
  };

  const docFactories = {
    crm: createDefaultCrmDoc,
    warehouse: createDefaultWarehouseDoc,
    tasks: createDefaultTasksDoc
  };

  const docNormalizers = {
    crm: normalizeCrmDoc,
    warehouse: normalizeWarehouseDoc,
    tasks: normalizeTasksDoc
  };

  function supports(moduleKey) {
    return Boolean(LIVE_MODULE_CONFIG[moduleKey]);
  }

  function schemaReady() {
    return typeof schemaReadyProvider === "function" ? Boolean(schemaReadyProvider()) : true;
  }

  async function ensureDocument(moduleKey, force = false) {
    if (!supports(moduleKey)) return null;
    if (docs[moduleKey] && !force) return docs[moduleKey];

    if (!schemaReady()) {
      docs[moduleKey] = docFactories[moduleKey]();
      return docs[moduleKey];
    }

    const config = LIVE_MODULE_CONFIG[moduleKey];
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

    docs[moduleKey] = docNormalizers[moduleKey](payload);
    return docs[moduleKey];
  }

  async function saveDocument(moduleKey, payload, successMessage = "") {
    const nextDoc = docNormalizers[moduleKey](payload);
    nextDoc.updatedAt = new Date().toISOString();
    docs[moduleKey] = nextDoc;

    if (!schemaReady()) {
      if (successMessage) setStatus(successMessage, "success");
      rerenderDashboard();
      return nextDoc;
    }

    const appId = LIVE_MODULE_CONFIG[moduleKey].appId;
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
    const config = LIVE_MODULE_CONFIG[moduleKey];
    return `
      <div class="workspace-hero">
        <div>
          <div class="placeholder-eyebrow">Живой рабочий модуль</div>
          <h3>${escapeHtml(modules[moduleKey]?.title || moduleKey)}</h3>
          <p>${escapeHtml(config.intro)}</p>
        </div>
        <div class="placeholder-status">
          <div class="placeholder-chip">${escapeHtml(getModuleStageLabel(moduleKey))}</div>
          <div class="placeholder-chip">${escapeHtml(getPermissionBadgeLabel(moduleKey))}</div>
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
    const config = LIVE_MODULE_CONFIG[moduleKey];
    const links = (config.links || [])
      .filter((key) => hasModuleAccess(key))
      .map((key) => `<button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="${escapeHtml(key)}">${escapeHtml(modules[key]?.title || key)}</button>`)
      .join("");
    return `<div class="workspace-links"><div class="compact-help">Связанные разделы платформы</div><div class="d-flex flex-wrap gap-2">${links || '<span class="text-muted">Связанные разделы появятся после выдачи доступов.</span>'}</div></div>`;
  }

  function activateView(moduleKey, doc, viewId) {
    const view = getViewList(moduleKey, doc).find((item) => item.id === viewId);
    if (!view) return;
    Object.assign(ui[moduleKey], getDefaultFilters(moduleKey), view.filters || {});
    ui[moduleKey].activeViewId = viewId;
    persistUiState(moduleKey);
  }

  function markFiltersAsAdHoc(moduleKey) {
    ui[moduleKey].activeViewId = "adhoc";
    persistUiState(moduleKey);
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
        ${modeIs(filters, "overview", "form") ? `<div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editDeal ? "Карточка сделки" : "Новая сделка"}</h4><div class="compact-help">Карточка строится под ваш цикл: лид → квалификация → КП/счет → производство → закрытие.</div></div></div>
            ${canEdit ? `${renderDraftBadge("crm", "deal")}<form id="crmDealForm" class="workspace-form" data-draft-form="deal"><input type="hidden" name="id" value="${escapeHtml(editDeal?.id || "")}" /><div class="workspace-form-grid"><label><span>Название сделки</span><input class="form-control" type="text" name="title" value="${escapeHtml(editDeal ? editDeal.title || "" : draftValue("", formDraft?.title))}" required /></label><label><span>Клиент</span><input class="form-control" type="text" name="client" value="${escapeHtml(editDeal ? editDeal.client || "" : draftValue("", formDraft?.client))}" required /></label><label><span>Канал</span><input class="form-control" type="text" name="channel" value="${escapeHtml(editDeal ? editDeal.channel || "" : draftValue("", formDraft?.channel))}" /></label><label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editDeal ? editDeal.owner || "" : draftValue("", formDraft?.owner))}" /></label><label><span>Стадия</span><select class="form-select" name="stage">${CRM_STAGES.map((stage) => `<option value="${escapeHtml(stage.key)}" ${((editDeal?.stage || formDraft?.stage || "lead") === stage.key) ? "selected" : ""}>${escapeHtml(stage.label)}</option>`).join("")}</select></label><label><span>Сумма, ₽</span><input class="form-control" type="number" min="0" step="1" name="amount" value="${escapeHtml(editDeal ? String(toNumber(editDeal.amount || 0) || "") : compactText(formDraft?.amount || ""))}" /></label><label><span>Срок</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(editDeal ? normalizeDateInput(editDeal.deadline || "") : normalizeDateInput(formDraft?.deadline || ""))}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(editDeal ? editDeal.note || "" : draftValue("", formDraft?.note))}</textarea></label>${renderCustomFieldSection("crm", doc, editDeal || formDraft, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editDeal ? "Сохранить изменения" : "Добавить сделку"}</button><button class="btn btn-outline-secondary" type="button" data-crm-new>Очистить форму</button>${editDeal ? `<button class="btn btn-outline-dark" type="button" data-crm-duplicate="${escapeHtml(editDeal.id)}">Сделать копию</button>` : ""}</div></form>` : renderAccessHint("crm")}
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
            ${canEdit ? `<form id="crmReserveForm" class="workspace-form"><div class="workspace-form-grid"><label><span>Сделка</span><select class="form-select" name="dealId" required><option value="">Выберите сделку</option>${reserveDealOptions.map((deal) => `<option value="${escapeHtml(deal.id)}" ${editDeal?.id === deal.id ? "selected" : ""}>${escapeHtml(deal.title || deal.client || "Сделка")} • ${escapeHtml(deal.client || "—")}</option>`).join("")}</select></label><label><span>Позиция склада</span><select class="form-select" name="itemId" required><option value="">Выберите материал</option>${warehouseSnapshot.items.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""} • доступно ${escapeHtml(formatNumber(item.available || 0))}</option>`).join("")}</select></label><label><span>Количество</span><input class="form-control" type="number" min="1" step="1" name="qty" required /></label><label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(todayString())}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="3" placeholder="Например: резерв под производство или монтаж"></textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Резервировать</button></div></form>` : renderAccessHint("crm")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Связанные резервы</h4><div class="compact-help">Последние резервы материалов, которые уже связаны со сделками CRM.</div></div></div>
            <div class="workspace-stack">${(sortByDateDesc((warehouseDoc.movements || []).filter((movement) => compactText(movement?.integration?.sourceKey || "").startsWith("crm-deal:")), "date").slice(0, 6) || []).map((movement) => { const deal = (doc.deals || []).find((entry) => getCrmDealSourceKey(entry.id) === compactText(movement?.integration?.sourceKey || "")); const item = (warehouseDoc.items || []).find((entry) => entry.id === movement.itemId); return `<div class="workspace-list-item"><div><strong>${escapeHtml(deal?.title || "Сделка")}</strong><div class="workspace-list-item__meta">${escapeHtml(item?.name || "Позиция")} • ${escapeHtml(movement.kind === "release" ? "снятие резерва" : "резерв")}</div></div><div class="text-end"><div class="workspace-tag workspace-tag--info">${escapeHtml(formatNumber(movement.qty || 0))}</div><div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(movement.date))}</div></div></div>`; }).join("") || '<div class="workspace-empty workspace-empty--tight">Связанных резервов пока нет.</div>'}</div>
          </section>
        </div>` : ""}
        ${modeIs(filters, "overview", "form") && editDeal ? `<div class="workspace-grid workspace-grid--2">
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
      lowItems: items.filter((item) => item.low),
      reservedTotal: sumBy(items, (item) => item.reserved),
      availableTotal: sumBy(items, (item) => item.available),
      onHandTotal: sumBy(items, (item) => item.onHand)
    };
  }

  async function renderWarehouse(doc) {
    const canEdit = hasModulePermission("warehouse", "edit");
    const canManage = hasModulePermission("warehouse", "manage");
    const filters = ui.warehouse;
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
    const filteredItems = snapshot.items.filter((item) => {
      const blob = [item.name, item.sku, item.category, item.note, ...getCustomFields("warehouse", doc).map((field) => getRecordValue(item, field.key))].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (filters.category !== "all" && compactText(item.category) !== filters.category) return false;
      return true;
    });
    const editItem = (doc.items || []).find((item) => item.id === filters.itemEditId) || null;
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
    const metrics = [
      { label: "Позиций", value: formatNumber(snapshot.items.length), caption: "в каталоге материалов" },
      { label: "На руках", value: formatNumber(snapshot.onHandTotal), caption: "общее количество" },
      { label: "В резерве", value: formatNumber(snapshot.reservedTotal), caption: "под текущие заказы" },
      { label: "Нужно пополнить", value: formatNumber(snapshot.lowItems.length), caption: "ниже минимального запаса" },
      { label: "Из калькуляторов", value: formatNumber(calculatorSnapshot.activeTabs), caption: "активных вкладок спроса" },
      ...getFormulaMetrics("warehouse", doc, filteredItems)
    ];
    const customHeader = renderCustomTableHeader("warehouse", doc, escapeHtml);
    const warehouseActionBar = renderActionBar(
      "warehouse",
      [
        canEdit ? '<button class="btn btn-dark btn-sm" type="button" data-warehouse-item-new>Новая позиция</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-warehouse-seed-demand>Добавить из калькуляторов</button>' : "",
        canEdit ? '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="movements">Движения</button>' : "",
        '<button class="btn btn-outline-dark btn-sm" type="button" data-live-mode="catalog">Каталог</button>',
        '<button class="btn btn-outline-dark btn-sm" type="button" data-module-export="warehouse">Экспорт JSON</button>',
        canManage ? '<button class="btn btn-outline-dark btn-sm" type="button" data-module-import="warehouse">Импорт JSON</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:item">Сбросить черновик позиции</button>' : "",
        canEdit ? '<button class="btn btn-outline-secondary btn-sm" type="button" data-module-draft-clear="warehouse:movement">Сбросить черновик движения</button>' : ""
      ].filter(Boolean),
      escapeHtml
    );

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("warehouse")}
        ${renderMetricGrid(metrics)}
        <section class="workspace-panel workspace-panel--muted">
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
        </section>
        ${renderViewTabs("warehouse", doc, ui.warehouse, escapeHtml)}
        ${buildModeTabs("warehouse", escapeHtml)}
        ${warehouseActionBar}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по позиции, SKU, категории" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="category"><option value="all">Все категории</option>${categories.map((category) => `<option value="${escapeHtml(category)}" ${filters.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}</select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-warehouse-item-new>Новая позиция</button><button class="btn btn-outline-dark" type="button" data-warehouse-movement-pick="">Новое движение</button>` : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`}
            ${canManage ? `<button class="btn btn-outline-dark" type="button" data-builder-toggle="warehouse">${ui.warehouse.configOpen ? "Скрыть конструктор" : "Конструктор"}</button>` : ""}
          </div>
        </div>
        ${canManage ? renderBuilderPanel("warehouse", doc, ui.warehouse, escapeHtml) : ""}
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editItem ? "Редактирование позиции" : "Новая позиция склада"}</h4><div class="compact-help">Каталог можно использовать как общий справочник материалов для склада и будущих калькуляторов.</div></div></div>
            ${canEdit ? `<form id="warehouseItemForm" class="workspace-form" data-draft-form="item"><input type="hidden" name="id" value="${escapeHtml(editItem?.id || "")}" /><div class="workspace-form-grid"><label><span>Название</span><input class="form-control" type="text" name="name" value="${escapeHtml(editItem?.name || "")}" required /></label><label><span>SKU / артикул</span><input class="form-control" type="text" name="sku" value="${escapeHtml(editItem?.sku || "")}" /></label><label><span>Категория</span><input class="form-control" type="text" name="category" value="${escapeHtml(editItem?.category || "")}" /></label><label><span>Ед. изм.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(editItem?.unit || "шт")}" /></label><label><span>Стартовый остаток</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(String(toNumber(editItem?.openingStock || 0) || ""))}" /></label><label><span>Минимум</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(String(toNumber(editItem?.minStock || 0) || ""))}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="3">${escapeHtml(editItem?.note || "")}</textarea></label>${renderCustomFieldSection("warehouse", doc, editItem, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editItem ? "Сохранить позицию" : "Добавить позицию"}</button><button class="btn btn-outline-secondary" type="button" data-warehouse-item-new>Очистить форму</button></div></form>` : renderAccessHint("warehouse")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>Движение по складу</h4><div class="compact-help">Приход, списание и резервы лучше вносить отдельно — остатки считаются автоматически.</div></div></div>
            ${canEdit ? `<form id="warehouseMovementForm" class="workspace-form" data-draft-form="movement"><div class="workspace-form-grid"><label><span>Позиция</span><select class="form-select" name="itemId" required><option value="">Выберите позицию</option>${(doc.items || []).map((item) => `<option value="${escapeHtml(item.id)}" ${filters.movementItemId === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`).join("")}</select></label><label><span>Тип</span><select class="form-select" name="kind">${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}</select></label><label><span>Количество</span><input class="form-control" type="number" min="0" step="1" name="qty" required /></label><label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(todayString())}" /></label></div><label><span>Комментарий</span><textarea class="form-control" name="note" rows="3"></textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">Сохранить движение</button></div></form>` : renderAccessHint("warehouse")}
          </section>
        </div>
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
        ${renderRelatedLinks("warehouse")}
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
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editTask ? "Редактирование задачи" : "Новая задача"}</h4><div class="compact-help">Задачи можно вести по отделам, инициативам и проектам. Быстрый перевод между колонками остается прямо на карточках.</div></div></div>
            ${canEdit ? `<form id="tasksTaskForm" class="workspace-form" data-draft-form="task"><input type="hidden" name="id" value="${escapeHtml(editTask?.id || "")}" /><div class="workspace-form-grid"><label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(editTask?.title || "")}" required /></label><label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editTask?.owner || "")}" /></label><label><span>Статус</span><select class="form-select" name="status">${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${(editTask?.status || "backlog") === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select></label><label><span>Приоритет</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((priority) => `<option value="${escapeHtml(priority.key)}" ${(editTask?.priority || "medium") === priority.key ? "selected" : ""}>${escapeHtml(priority.label)}</option>`).join("")}</select></label><label><span>Итерация</span><select class="form-select" name="sprintId"><option value="">Без итерации</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${editTask?.sprintId === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label><label><span>Срок</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(editTask?.dueDate || ""))}" /></label></div><label class="permission-flag"><input class="form-check-input" type="checkbox" name="blocked" ${editTask?.blocked ? "checked" : ""} /><span>Есть блокер / нужна помощь</span></label><label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(editTask?.note || "")}</textarea></label>${renderCustomFieldSection("tasks", doc, editTask, escapeHtml)}<div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editTask ? "Сохранить задачу" : "Добавить задачу"}</button><button class="btn btn-outline-secondary" type="button" data-task-new>Очистить форму</button></div></form>` : renderAccessHint("tasks")}
          </section>
          <section class="workspace-panel">
            <div class="panel-heading"><div><h4>${editSprint ? "Редактирование итерации" : "Новая итерация"}</h4><div class="compact-help">Итерация помогает держать в фокусе ближайший рабочий цикл и распределять задачи по этапам.</div></div></div>
            ${canEdit ? `<form id="tasksSprintForm" class="workspace-form" data-draft-form="sprint"><input type="hidden" name="id" value="${escapeHtml(editSprint?.id || "")}" /><div class="workspace-form-grid"><label><span>Название итерации</span><input class="form-control" type="text" name="title" value="${escapeHtml(editSprint?.title || "")}" required /></label><label><span>Старт</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(editSprint?.startDate || ""))}" /></label><label><span>Финиш</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(editSprint?.endDate || ""))}" /></label></div><label><span>Цель итерации</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(editSprint?.goal || "")}</textarea></label><div class="workspace-form__actions"><button class="btn btn-dark" type="submit">${editSprint ? "Сохранить итерацию" : "Добавить итерацию"}</button><button class="btn btn-outline-secondary" type="button" data-sprint-new>Очистить форму</button></div></form>` : renderAccessHint("tasks")}
          </section>
        </div>
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
        <section class="workspace-panel">
          <div class="panel-heading"><div><h4>Итерации</h4><div class="compact-help">Текущий активный цикл: ${escapeHtml(activeSprint?.title || "не выбран")}</div></div></div>
          <div class="workspace-sprint-strip">${sprintOptions.length ? sprintOptions.map((sprint) => { const sprintTasks = taskList.filter((task) => task.sprintId === sprint.id); return `<article class="workspace-sprint-card ${activeSprint?.id === sprint.id ? "active" : ""}"><div class="workspace-card__head"><strong>${escapeHtml(sprint.title)}</strong><span>${escapeHtml(String(sprintTasks.length))}</span></div><div class="workspace-card__meta">${escapeHtml(formatDate(sprint.startDate))} — ${escapeHtml(formatDate(sprint.endDate))}</div>${sprint.goal ? `<div class="workspace-card__note">${escapeHtml(sprint.goal)}</div>` : ""}<div class="workspace-card__actions mt-2">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-sprint-edit="${escapeHtml(sprint.id)}">Изменить</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-sprint-delete="${escapeHtml(sprint.id)}">Удалить</button>` : ""}</div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Итерации пока не созданы.</div>'}</div>
        </section>
        <section class="workspace-panel">
          <div class="panel-heading"><div><h4>Канбан</h4><div class="compact-help">Карточки отражают текущую загрузку команды и дают быстрый доступ к правке статуса.</div></div><div class="workspace-note">Показано: ${escapeHtml(String(filteredTasks.length))}</div></div>
          <div class="workspace-board workspace-board--tasks">${TASK_STATUSES.map((status) => { const laneTasks = filteredTasks.filter((task) => task.status === status.key); return `<article class="workspace-lane"><div class="workspace-lane__head"><strong>${escapeHtml(status.label)}</strong><span>${escapeHtml(String(laneTasks.length))}</span></div><div class="workspace-lane__body">${laneTasks.length ? laneTasks.map((task) => { const integration = getTaskIntegrationMeta(task); return `<article class="workspace-card workspace-card--${escapeHtml(status.tone)}"><div class="workspace-card__head"><strong>${escapeHtml(task.title || "Задача")}</strong><span>${escapeHtml(getPriorityLabel(task.priority))}</span></div><div class="workspace-card__meta">${escapeHtml(task.owner || "Без ответственного")} • срок ${escapeHtml(formatDate(task.dueDate))}</div><div class="workspace-card__meta">${escapeHtml(task.sprint?.title || "Без итерации")}</div>${integration ? `<div class="workspace-card__meta">${escapeHtml(integration.label)} • <button class="btn btn-link btn-sm p-0 align-baseline" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">${escapeHtml(modules[integration.moduleKey]?.title || integration.moduleKey)}</button></div>` : ""}${task.note ? `<div class="workspace-card__note">${escapeHtml(task.note)}</div>` : ""}${renderCustomCardSection("tasks", doc, task, escapeHtml)}${task.blocked ? '<div class="workspace-tag workspace-tag--danger mt-2">Есть блокер</div>' : ""}<div class="workspace-card__footer">${canEdit ? `<select class="form-select form-select-sm workspace-inline-select" data-task-status-select="${escapeHtml(task.id)}">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === task.status ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>` : `<span class="workspace-tag workspace-tag--${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>`}<div class="workspace-card__actions">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Изменить</button><button class="btn btn-sm btn-outline-secondary" type="button" data-task-duplicate="${escapeHtml(task.id)}">Копия</button>` : ""}${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-task-delete="${escapeHtml(task.id)}">Удалить</button>` : ""}</div></div></article>`; }).join("") : '<div class="workspace-empty workspace-empty--tight">Пусто</div>'}</div></article>`; }).join("")}</div>
        </section>
        <section class="workspace-panel">
          <div class="panel-heading"><div><h4>Лента задач</h4><div class="compact-help">Нижняя таблица полезна для сортировки и быстрого перехода в нужную карточку.</div></div></div>
          <div class="table-shell"><table class="table table-sm align-middle workspace-table"><thead><tr><th>Задача</th><th>Статус</th><th>Ответственный</th><th>Итерация</th><th>Срок</th><th>Приоритет</th>${customHeader}<th></th></tr></thead><tbody>${filteredTasks.length ? filteredTasks.map((task) => { const status = getTaskStatusMeta(task.status); const integration = getTaskIntegrationMeta(task); return `<tr><td><strong>${escapeHtml(task.title || "Задача")}</strong>${task.blocked ? '<div class="workspace-table__sub text-danger">Есть блокер</div>' : ""}${integration ? `<div class="workspace-table__sub">${escapeHtml(integration.label)}</div>` : ""}</td><td>${escapeHtml(status.label)}</td><td>${escapeHtml(task.owner || "—")}</td><td>${escapeHtml(task.sprint?.title || "—")}</td><td>${escapeHtml(formatDate(task.dueDate))}</td><td>${escapeHtml(getPriorityLabel(task.priority))}</td>${renderCustomTableCells("tasks", doc, task, escapeHtml)}<td class="text-end">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Открыть</button>` : ""}${integration ? `<button class="btn btn-sm btn-outline-secondary ms-2" type="button" data-placeholder-open="${escapeHtml(integration.moduleKey)}">Источник</button>` : ""}</td></tr>`; }).join("") : `<tr><td colspan="${8 + getVisibleCustomFields("tasks", doc, "showInTable").length}" class="text-muted">По текущим фильтрам задач нет.</td></tr>`}</tbody></table></div>
        </section>
        ${renderRelatedLinks("tasks")}
      </div>
    `;
  }

  async function render(moduleKey) {
    if (!supports(moduleKey)) return "";
    const doc = await ensureDocument(moduleKey);
    if (moduleKey === "crm") return await renderCrm(doc);
    if (moduleKey === "warehouse") return await renderWarehouse(doc);
    if (moduleKey === "tasks") return await renderTasks(doc);
    return "";
  }

  async function refresh(moduleKey) {
    if (!supports(moduleKey)) return;
    externalDocs.sales = null;
    externalDocs.myCalculator = null;
    externalDocs.partnerCalculators = null;
    await ensureDocument(moduleKey, true);
  }

  function resetFormState(moduleKey) {
    if (moduleKey === "crm") ui.crm.editId = null;
    if (moduleKey === "warehouse") ui.warehouse.itemEditId = null;
    if (moduleKey === "tasks") {
      ui.tasks.taskEditId = null;
      ui.tasks.sprintEditId = null;
    }
  }

  function focusEntity(moduleKey, entity = {}) {
    if (moduleKey === "crm") {
      ui.crm.editId = compactText(entity.entityId || entity.dealId || entity.id);
      ui.crm.mode = "form";
      persistUiState("crm");
      return;
    }
    if (moduleKey === "warehouse") {
      ui.warehouse.itemEditId = compactText(entity.entityId || entity.itemId || entity.id);
      ui.warehouse.mode = "form";
      persistUiState("warehouse");
      return;
    }
    if (moduleKey === "tasks") {
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
    clearDraft("warehouse", "movement");
    persistUiState("warehouse");
    await saveDocument("warehouse", { ...doc, movements: [record, ...(doc.movements || [])] }, "Движение по складу сохранено.");
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
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const tasks = [...(doc.tasks || [])];
    const index = tasks.findIndex((task) => task.id === record.id);
    if (index >= 0) tasks[index] = record;
    else tasks.unshift(record);
    ui.tasks.taskEditId = null;
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
    clearDraft("tasks", "sprint");
    persistUiState("tasks");
    await saveDocument("tasks", { ...doc, sprints }, index >= 0 ? "Итерация обновлена." : "Итерация добавлена.");
    await rerenderCurrentModule();
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
    if (event.target.id === "crmDealForm") {
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
    if (event.target.id === "warehouseMovementForm") {
      event.preventDefault();
      await handleWarehouseMovementSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksTaskForm") {
      event.preventDefault();
      await handleTasksTaskSubmit(event.target);
      return true;
    }
    if (event.target.id === "tasksSprintForm") {
      event.preventDefault();
      await handleTasksSprintSubmit(event.target);
      return true;
    }
    return false;
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
        { text: "Последние движения", modes: "overview movements" }
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
      const match = (headingMap[moduleKey] || []).find((item) => title.includes(item.text.toLowerCase()));
      if (match) panel.dataset.modeSection = match.modes;
    });

    const mode = ui[moduleKey]?.mode || "overview";
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
    if (!supports(moduleKey)) return false;
    const draftForm = event.target.closest("[data-draft-form]");
    if (draftForm) {
      writeDraft(moduleKey, draftForm.dataset.draftForm, serializeFormDraft(draftForm));
    }
    const target = event.target.closest("[data-live-filter]");
    if (!target) return false;
    ui[moduleKey][target.dataset.liveFilter] = target.value;
    markFiltersAsAdHoc(moduleKey);
    persistUiState(moduleKey);
    void rerenderCurrentModule();
    return true;
  }

  async function handleChange(event, moduleKey) {
    if (!supports(moduleKey)) return false;
    const filterTarget = event.target.closest("[data-live-filter]");
    if (filterTarget) {
      ui[moduleKey][filterTarget.dataset.liveFilter] = filterTarget.value;
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
      const doc = await ensureDocument("tasks");
      const tasks = [...(doc.tasks || [])];
      const index = tasks.findIndex((task) => task.id === taskStatusSelect.dataset.taskStatusSelect);
      if (index >= 0) {
        tasks[index] = { ...tasks[index], status: taskStatusSelect.value, updatedAt: new Date().toISOString() };
        await saveDocument("tasks", { ...doc, tasks }, "Статус задачи обновлен.");
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
    if (!supports(moduleKey)) return false;
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

    const doc = await ensureDocument(moduleKey);
    const viewButton = event.target.closest("[data-builder-view]");
    if (viewButton) {
      activateView(moduleKey, doc, viewButton.dataset.builderView);
      await rerenderCurrentModule();
      return true;
    }
    const builderToggle = event.target.closest("[data-builder-toggle]");
    if (builderToggle) {
      ui[moduleKey].configOpen = !ui[moduleKey].configOpen;
      await rerenderCurrentModule();
      return true;
    }
    const deleteViewButton = event.target.closest("[data-builder-view-delete]");
    if (deleteViewButton) {
      await deleteBuilderEntity(moduleKey, "view", deleteViewButton.dataset.builderViewDelete);
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const deleteFieldButton = event.target.closest("[data-builder-field-delete]");
    if (deleteFieldButton) {
      await deleteBuilderEntity(moduleKey, "field", deleteFieldButton.dataset.builderFieldDelete);
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const deleteFormulaButton = event.target.closest("[data-builder-formula-delete]");
    if (deleteFormulaButton) {
      await deleteBuilderEntity(moduleKey, "formula", deleteFormulaButton.dataset.builderFormulaDelete);
      ui[moduleKey].configOpen = true;
      await rerenderCurrentModule();
      return true;
    }
    const modeButton = event.target.closest("[data-live-mode]");
    if (modeButton) {
      ui[moduleKey].mode = modeButton.dataset.liveMode || "overview";
      persistUiState(moduleKey);
      await rerenderCurrentModule();
      return true;
    }
    const resetFiltersButton = event.target.closest("[data-live-filters-reset]");
    if (resetFiltersButton) {
      Object.assign(ui[moduleKey], getDefaultFilters(moduleKey), { activeViewId: "default" });
      persistUiState(moduleKey);
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

    if (moduleKey === "crm") {
      const importSalesButton = event.target.closest("[data-crm-import-sales]");
      if (importSalesButton) {
        await importDealsFromSales();
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
        ui.crm.mode = "form";
        persistUiState("crm");
        await rerenderCurrentModule();
        return true;
      }
      const editButton = event.target.closest("[data-crm-edit]");
      if (editButton) {
        ui.crm.editId = editButton.dataset.crmEdit;
        ui.crm.mode = "form";
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
        ui.crm.mode = "form";
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

    if (moduleKey === "warehouse") {
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
        ui.warehouse.mode = "form";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const editItemButton = event.target.closest("[data-warehouse-item-edit]");
      if (editItemButton) {
        ui.warehouse.itemEditId = editItemButton.dataset.warehouseItemEdit;
        ui.warehouse.mode = "form";
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
        ui.warehouse.mode = "form";
        persistUiState("warehouse");
        await rerenderCurrentModule();
        return true;
      }
      const pickMovementButton = event.target.closest("[data-warehouse-movement-pick]");
      if (pickMovementButton) {
        ui.warehouse.movementItemId = pickMovementButton.dataset.warehouseMovementPick || "";
        ui.warehouse.mode = "movements";
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
    }

    if (moduleKey === "tasks") {
      const generateSignalsButton = event.target.closest("[data-task-generate-signals]");
      if (generateSignalsButton) {
        await generateTasksFromSignals();
        return true;
      }
      const newTaskButton = event.target.closest("[data-task-new]");
      if (newTaskButton) {
        ui.tasks.taskEditId = null;
        ui.tasks.mode = "form";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const editTaskButton = event.target.closest("[data-task-edit]");
      if (editTaskButton) {
        ui.tasks.taskEditId = editTaskButton.dataset.taskEdit;
        ui.tasks.mode = "form";
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await saveDocument("tasks", { ...doc, tasks: [copy, ...(doc.tasks || [])] }, "Копия задачи создана.");
        ui.tasks.taskEditId = copy.id;
        ui.tasks.mode = "form";
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
        ui.tasks.mode = "form";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const editSprintButton = event.target.closest("[data-sprint-edit]");
      if (editSprintButton) {
        ui.tasks.sprintEditId = editSprintButton.dataset.sprintEdit;
        ui.tasks.mode = "form";
        persistUiState("tasks");
        await rerenderCurrentModule();
        return true;
      }
      const deleteSprintButton = event.target.closest("[data-sprint-delete]");
      if (deleteSprintButton) {
        if (!window.confirm("Удалить итерацию? Задачи останутся, но отвяжутся от нее.")) return true;
        const sprintId = deleteSprintButton.dataset.sprintDelete;
        const sprints = (doc.sprints || []).filter((sprint) => sprint.id !== sprintId);
        const tasks = (doc.tasks || []).map((task) => (task.sprintId === sprintId ? { ...task, sprintId: "" } : task));
        if (ui.tasks.sprintEditId === sprintId) ui.tasks.sprintEditId = null;
        await saveDocument("tasks", { ...doc, sprints, tasks }, "Итерация удалена.");
        await rerenderCurrentModule();
        return true;
      }
    }
    return false;
  }

  function getDashboardSummary(moduleKey) {
    if (!supports(moduleKey) || !docs[moduleKey]) return "";
    if (moduleKey === "crm") {
      const deals = docs.crm.deals || [];
      const salesSnapshot = buildSalesSnapshot(externalDocs.sales);
      return `${deals.length} сделок • ${formatMoney(sumBy(deals, (deal) => deal.amount || 0))}${salesSnapshot.orders.length ? ` • ${salesSnapshot.unpaidInvoices.length} счетов без оплаты` : ""}`;
    }
    if (moduleKey === "warehouse") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse);
      const calculatorSnapshot = buildCalculatorDemandSnapshot(externalDocs.myCalculator, externalDocs.partnerCalculators || []);
      return `${snapshot.items.length} позиций • ${formatNumber(snapshot.availableTotal)} доступно${calculatorSnapshot.activeTabs ? ` • ${calculatorSnapshot.activeTabs} вкладок спроса` : ""}`;
    }
    if (moduleKey === "tasks") {
      const openCount = (docs.tasks.tasks || []).filter((task) => task.status !== "done").length;
      return `${openCount} открытых задач`;
    }
    return "";
  }

  function afterRender(moduleKey, root) {
    if (!supports(moduleKey) || !root) return;
    hydrateDraftForms(moduleKey, root);
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
    resetFormState,
    focusEntity
  };
}

