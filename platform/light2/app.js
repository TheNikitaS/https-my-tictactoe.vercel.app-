import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const FINANCE_APP_ID = "platform_finance_v1";
const STORAGE_KEY = "dom-neona:finance:v1";
const ACTIVE_VIEW_KEY = "dom-neona:finance:activeView";
const TARGET_SHEETS = {
  balance: "Баланс",
  calendar: "Платежный календарь",
  metrics: "Метрики"
};
const VALID_VIEWS = new Set(["overview", ...Object.keys(TARGET_SHEETS)]);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
});

const DOM = {
  userLabel: document.getElementById("userLabel"),
  saveLabel: document.getElementById("saveLabel"),
  statusBox: document.getElementById("statusBox"),
  tabs: document.getElementById("tabs"),
  overviewView: document.getElementById("overviewView"),
  sheetTools: document.getElementById("sheetTools"),
  sheetView: document.getElementById("sheetView"),
  tableWrap: document.getElementById("tableWrap"),
  searchInput: document.getElementById("searchInput"),
  rowLimitInput: document.getElementById("rowLimitInput"),
  sheetMeta: document.getElementById("sheetMeta"),
  addRowButton: document.getElementById("addRowButton"),
  deleteRowsButton: document.getElementById("deleteRowsButton"),
  saveButton: document.getElementById("saveButton"),
  dictionariesButton: document.getElementById("dictionariesButton"),
  dictionariesDialog: document.getElementById("dictionariesDialog"),
  dictionariesGrid: document.getElementById("dictionariesGrid")
};

const STATE = {
  activeView: readStoredValue(ACTIVE_VIEW_KEY, "overview"),
  baseSheets: {},
  dictionaries: {},
  sheets: {},
  selectedRows: new Set(),
  search: "",
  rowLimit: "100",
  saveTimer: null,
  loaded: false
};

boot();

async function boot() {
  bindEvents();
  setStatus("Загружаю заполненный файл ЛАЙТ 2...", "ok");

  const [{ data: userData }, snapshot, saved] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: null })),
    fetch("./workbook_snapshot.json?v=20260428-finance-rebuild").then((response) => response.json()),
    loadSavedState()
  ]);

  const user = userData?.user;
  DOM.userLabel.textContent = user?.email ? `Пользователь: ${user.email}` : "Пользователь: локальный режим";

  STATE.baseSheets = buildBaseSheets(snapshot);
  STATE.dictionaries = saved?.dictionaries || buildDictionaries(snapshot);
  STATE.sheets = mergeSheets(STATE.baseSheets, saved?.sheets || {});
  if (!VALID_VIEWS.has(STATE.activeView)) {
    STATE.activeView = "overview";
    window.localStorage.setItem(ACTIVE_VIEW_KEY, STATE.activeView);
  }
  STATE.loaded = true;

  setSaveLabel(saved?.updatedAt ? `Сохранено: ${formatDateTime(saved.updatedAt)}` : "Исходник загружен");
  setStatus("Финансы собраны из ЛАЙТ 2. Баланс, платежный календарь, метрики и справочники доступны для работы.", "ok");
  render();
}

function bindEvents() {
  DOM.tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-view]");
    if (!button) return;
    STATE.activeView = button.dataset.view;
    window.localStorage.setItem(ACTIVE_VIEW_KEY, STATE.activeView);
    STATE.selectedRows.clear();
    render();
  });

  DOM.searchInput.addEventListener("input", () => {
    STATE.search = DOM.searchInput.value.trim().toLowerCase();
    renderActiveSheet();
  });

  DOM.rowLimitInput.addEventListener("change", () => {
    STATE.rowLimit = DOM.rowLimitInput.value;
    renderActiveSheet();
  });

  DOM.addRowButton.addEventListener("click", () => {
    const sheet = getActiveSheet();
    if (!sheet) return;
    const nextIndex = Math.max(0, ...sheet.rows.map((row) => row.index)) + 1;
    sheet.rows.push({ index: nextIndex, cells: {} });
    scheduleSave();
    renderActiveSheet();
  });

  DOM.deleteRowsButton.addEventListener("click", () => {
    const sheet = getActiveSheet();
    if (!sheet || !STATE.selectedRows.size) return;
    sheet.rows = sheet.rows.filter((row) => !STATE.selectedRows.has(row.index));
    STATE.selectedRows.clear();
    scheduleSave();
    renderActiveSheet();
  });

  DOM.saveButton.addEventListener("click", () => saveStateNow());

  DOM.dictionariesButton.addEventListener("click", () => {
    renderDictionaries();
    DOM.dictionariesDialog.showModal();
  });
}

function buildBaseSheets(snapshot) {
  const result = {};
  Object.entries(TARGET_SHEETS).forEach(([key, name]) => {
    const source = snapshot.sheets.find((sheet) => sheet.name === name);
    if (!source) return;
    result[key] = normalizeSheet(source);
  });
  return result;
}

function normalizeSheet(source) {
  return {
    name: source.name,
    maxCol: source.maxCol || 1,
    sourceNonEmpty: source.nonEmpty || 0,
    sourceFormulas: source.formulas || 0,
    rows: source.rows.map((row) => ({
      index: row.index,
      cells: Object.fromEntries(
        Object.entries(row.cells || {}).map(([column, cell]) => [
          column,
          {
            display: cell.display ?? "",
            raw: cell.raw ?? "",
            kind: cell.kind || "text",
            formula: cell.formula || ""
          }
        ])
      )
    }))
  };
}

function mergeSheets(baseSheets, savedSheets) {
  const result = {};
  Object.entries(baseSheets).forEach(([key, sheet]) => {
    const saved = savedSheets[key];
    result[key] = saved?.rows ? saved : structuredClone(sheet);
  });
  return result;
}

function buildDictionaries(snapshot) {
  const dataSheet = snapshot.sheets.find((sheet) => sheet.name === "Данные");
  if (!dataSheet) return {};

  const matrix = rowsToMatrix(normalizeSheet(dataSheet));
  const dictionaries = {};

  for (let column = 1; column <= (dataSheet.maxCol || 1); column += 1) {
    const title = firstText([matrix[2]?.[column], matrix[1]?.[column]]);
    if (!title) continue;
    const values = [];
    for (let row = 3; row < matrix.length; row += 1) {
      const value = cleanText(matrix[row]?.[column]);
      if (value && !values.includes(value)) values.push(value);
    }
    if (values.length) dictionaries[title] = values;
  }

  return dictionaries;
}

function rowsToMatrix(sheet) {
  const matrix = [];
  sheet.rows.forEach((row) => {
    matrix[row.index] ||= [];
    Object.entries(row.cells).forEach(([column, cell]) => {
      matrix[row.index][Number(column)] = cell.display || String(cell.raw ?? "");
    });
  });
  return matrix;
}

function render() {
  if (!STATE.loaded) return;
  Array.from(DOM.tabs.querySelectorAll("[data-view]")).forEach((button) => {
    button.classList.toggle("active", button.dataset.view === STATE.activeView);
  });

  const isOverview = STATE.activeView === "overview";
  DOM.overviewView.hidden = !isOverview;
  DOM.sheetTools.hidden = isOverview;
  DOM.sheetView.hidden = isOverview;

  if (isOverview) {
    renderOverview();
  } else {
    renderActiveSheet();
  }
}

function renderOverview() {
  const balance = STATE.sheets.balance;
  const calendar = STATE.sheets.calendar;
  const metrics = STATE.sheets.metrics;
  const balanceMatrix = rowsToMatrix(balance);
  const metricRows = extractMetricRows(metrics);
  const revenue = metricRows.find((row) => row.label === "Выручка");
  const cost = metricRows.find((row) => row.label === "Себестоимость");
  const profit = metricRows.find((row) => row.label === "Валовая прибыль");
  const calendarItems = (calendar?.rows || []).filter((row) => row.index >= 6).length;

  DOM.overviewView.innerHTML = `
    ${overviewCard("Баланс всего", formatMoney(parseNumber(balanceMatrix[1]?.[2])), "Из листа «Баланс», ячейка верхнего итога")}
    ${overviewCard("Наличные / карта", formatMoney(parseNumber(balanceMatrix[1]?.[4])), "Текущий остаток")}
    ${overviewCard("Счёт ООО", formatMoney(parseNumber(balanceMatrix[1]?.[6])), "Текущий остаток")}
    ${overviewCard("Счёт ИП", formatMoney(parseNumber(balanceMatrix[1]?.[8])), "Текущий остаток")}
    ${overviewCard("Выручка", formatMoney(lastMetricValue(revenue)), "Последнее заполненное значение")}
    ${overviewCard("Себестоимость", formatMoney(lastMetricValue(cost)), "Последнее заполненное значение")}
    ${overviewCard("Валовая прибыль", formatMoney(lastMetricValue(profit)), "Последнее заполненное значение")}
    ${overviewCard("Платежей в календаре", String(calendarItems), "Заполненные операции")}
    <article class="overview-card chart">
      <span>Динамика выручки</span>
      ${renderRevenueChart(revenue)}
    </article>
    <article class="overview-card chart">
      <span>Что связано</span>
      <strong style="font-size:16px;line-height:1.45">Баланс показывает деньги по счетам. Платежный календарь хранит операции. Метрики собирают управленческие статьи по месяцам. Все значения редактируются в таблицах ниже и сохраняются поверх исходника.</strong>
    </article>
  `;
}

function overviewCard(title, value, hint) {
  return `<article class="overview-card"><span>${escapeHtml(title)}</span><strong>${escapeHtml(value)}</strong><span>${escapeHtml(hint)}</span></article>`;
}

function renderRevenueChart(row) {
  const values = (row?.values || []).filter((item) => Number.isFinite(item.value)).slice(-12);
  if (!values.length) return "<strong>Нет данных</strong>";
  const width = 520;
  const height = 140;
  const max = Math.max(...values.map((item) => item.value), 1);
  const min = Math.min(...values.map((item) => item.value), 0);
  const span = Math.max(max - min, 1);
  const points = values.map((item, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - ((item.value - min) / span) * height;
    return { x, y, ...item };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  return `
    <svg viewBox="0 0 ${width} ${height + 28}" role="img">
      <path class="chart-line" d="${path}"></path>
      ${points.map((point) => `<circle class="chart-dot"><title>${escapeHtml(point.period)}: ${formatMoney(point.value)}</title></circle>`.replace("<circle", `<circle cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4"`)).join("")}
    </svg>
  `;
}

function extractMetricRows(sheet) {
  const matrix = rowsToMatrix(sheet);
  const rows = [];
  for (let row = 4; row < matrix.length; row += 1) {
    const label = cleanText(matrix[row]?.[1]);
    if (!label) continue;
    const values = [];
    for (let column = 2; column <= sheet.maxCol; column += 1) {
      const value = parseNumber(matrix[row]?.[column]);
      if (!Number.isFinite(value)) continue;
      values.push({ period: columnLabel(column), value });
    }
    rows.push({ label, values });
  }
  return rows;
}

function renderActiveSheet() {
  const sheet = getActiveSheet();
  if (!sheet) return;

  const rows = filterRows(sheet);
  const limit = STATE.rowLimit === "all" ? rows.length : Number(STATE.rowLimit);
  const visibleRows = rows.slice(0, limit);
  const columns = Math.max(sheet.maxCol, maxUsedColumn(sheet));

  DOM.sheetMeta.textContent = `${sheet.name}: ${rows.length} строк, формул в исходнике: ${sheet.sourceFormulas || 0}`;

  const table = document.createElement("table");
  table.className = "finance-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th class="row-head">#</th>
        <th class="select-head">✓</th>
        ${Array.from({ length: columns }, (_, index) => `<th>${columnLabel(index + 1)}</th>`).join("")}
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const body = table.querySelector("tbody");
  visibleRows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="row-number">${row.index}</td>
      <td class="row-select"><input type="checkbox" ${STATE.selectedRows.has(row.index) ? "checked" : ""} data-row-check="${row.index}"></td>
      ${Array.from({ length: columns }, (_, index) => renderCell(sheet, row, index + 1)).join("")}
    `;
    body.append(tr);
  });

  DOM.tableWrap.replaceChildren(table, ...renderDatalists(sheet));

  DOM.tableWrap.querySelectorAll("[data-row-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const rowIndex = Number(checkbox.dataset.rowCheck);
      if (checkbox.checked) STATE.selectedRows.add(rowIndex);
      else STATE.selectedRows.delete(rowIndex);
    });
  });

  DOM.tableWrap.querySelectorAll("[data-cell]").forEach((input) => {
    input.addEventListener("input", () => {
      const [rowIndex, column] = input.dataset.cell.split(":").map(Number);
      setCell(sheet, rowIndex, column, input.value);
      scheduleSave();
    });
  });
}

function renderCell(sheet, row, column) {
  const cell = row.cells[String(column)] || { display: "", kind: "text", formula: "" };
  const header = getColumnHeader(sheet, column);
  const dictKey = Object.keys(STATE.dictionaries).find((key) => sameText(key, header));
  const list = dictKey ? ` list="dict-${slug(dictKey)}"` : "";
  const typeClass = ["number", "percent"].includes(cell.kind) ? cell.kind : "";
  const formulaClass = cell.formula ? " formula-cell" : "";
  const title = cell.formula ? ` title="${escapeHtml(cell.formula)}"` : "";
  return `
    <td class="${formulaClass}"${title}>
      <input class="cell-input ${typeClass}" data-cell="${row.index}:${column}" value="${escapeHtml(cell.display || "")}"${list}>
    </td>
  `;
}

function renderDatalists(sheet) {
  const usedKeys = new Set();
  for (let column = 1; column <= sheet.maxCol; column += 1) {
    const header = getColumnHeader(sheet, column);
    const key = Object.keys(STATE.dictionaries).find((item) => sameText(item, header));
    if (key) usedKeys.add(key);
  }

  return Array.from(usedKeys).map((key) => {
    const list = document.createElement("datalist");
    list.id = `dict-${slug(key)}`;
    list.innerHTML = (STATE.dictionaries[key] || []).map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
    return list;
  });
}

function renderDictionaries() {
  DOM.dictionariesGrid.innerHTML = Object.entries(STATE.dictionaries)
    .map(([key, values]) => `
      <article class="dictionary-card">
        <h3>${escapeHtml(key)}</h3>
        <textarea data-dict="${escapeHtml(key)}">${escapeHtml(values.join("\n"))}</textarea>
      </article>
    `)
    .join("");

  DOM.dictionariesGrid.querySelectorAll("[data-dict]").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      const key = textarea.dataset.dict;
      STATE.dictionaries[key] = textarea.value.split("\n").map(cleanText).filter(Boolean);
      scheduleSave();
    });
  });
}

function filterRows(sheet) {
  if (!STATE.search) return [...sheet.rows].sort((a, b) => a.index - b.index);
  return sheet.rows
    .filter((row) => Object.values(row.cells).some((cell) => String(cell.display || "").toLowerCase().includes(STATE.search)))
    .sort((a, b) => a.index - b.index);
}

function getActiveSheet() {
  return STATE.sheets[STATE.activeView] || null;
}

function getColumnHeader(sheet, column) {
  const candidates = sheet.rows
    .filter((row) => row.index <= 6)
    .map((row) => cleanText(row.cells[String(column)]?.display))
    .filter(Boolean);
  return candidates.at(-1) || candidates[0] || "";
}

function setCell(sheet, rowIndex, column, value) {
  let row = sheet.rows.find((item) => item.index === rowIndex);
  if (!row) {
    row = { index: rowIndex, cells: {} };
    sheet.rows.push(row);
  }
  row.cells[String(column)] = {
    ...(row.cells[String(column)] || {}),
    display: value,
    raw: value,
    kind: inferKind(value),
    formula: row.cells[String(column)]?.formula || ""
  };
  sheet.maxCol = Math.max(sheet.maxCol, column);
}

function scheduleSave() {
  setSaveLabel("Сохраняю...");
  clearTimeout(STATE.saveTimer);
  STATE.saveTimer = setTimeout(saveStateNow, 450);
}

async function saveStateNow() {
  clearTimeout(STATE.saveTimer);
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    sheets: STATE.sheets,
    dictionaries: STATE.dictionaries
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  try {
    const { data } = await supabase.from("shared_app_states").select("app_id").eq("app_id", FINANCE_APP_ID).maybeSingle();
    const result = data?.app_id
      ? await supabase.from("shared_app_states").update({ payload, updated_at: new Date().toISOString() }).eq("app_id", FINANCE_APP_ID)
      : await supabase.from("shared_app_states").insert({ app_id: FINANCE_APP_ID, payload });
    if (result.error) throw result.error;
    setSaveLabel(`Сохранено: ${formatDateTime(payload.updatedAt)}`);
    setStatus("Изменения сохранены.", "ok");
  } catch (error) {
    setSaveLabel("Сохранено локально");
    setStatus(`Supabase временно недоступен, изменения сохранены в браузере: ${error.message}`, "error");
  }
}

async function loadSavedState() {
  try {
    const { data, error } = await supabase.from("shared_app_states").select("payload, updated_at").eq("app_id", FINANCE_APP_ID).maybeSingle();
    if (error) throw error;
    if (data?.payload) return { ...data.payload, updatedAt: data.updated_at || data.payload.updatedAt };
  } catch {
    // Local fallback ниже.
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function setStatus(message, tone = "") {
  DOM.statusBox.textContent = message;
  DOM.statusBox.className = `notice ${tone}`.trim();
}

function setSaveLabel(message) {
  DOM.saveLabel.textContent = message;
}

function maxUsedColumn(sheet) {
  return Math.max(
    sheet.maxCol || 1,
    ...sheet.rows.flatMap((row) => Object.keys(row.cells).map(Number))
  );
}

function firstText(values) {
  return values.map(cleanText).find(Boolean) || "";
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function sameText(left, right) {
  return cleanText(left).toLowerCase() === cleanText(right).toLowerCase();
}

function parseNumber(value) {
  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace("%", "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function inferKind(value) {
  const text = String(value ?? "");
  if (/%$/.test(text.trim())) return "percent";
  return Number.isFinite(parseNumber(text)) && text.trim() !== "" ? "number" : "text";
}

function lastMetricValue(row) {
  if (!row?.values?.length) return 0;
  return row.values.at(-1).value || 0;
}

function formatMoney(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(value || 0) + " ₽";
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function columnLabel(column) {
  let label = "";
  let number = column;
  while (number > 0) {
    const mod = (number - 1) % 26;
    label = String.fromCharCode(65 + mod) + label;
    number = Math.floor((number - mod) / 26);
  }
  return label;
}

function slug(value) {
  let hash = 0;
  String(value).split("").forEach((char) => {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  });
  return hash.toString(36);
}

function readStoredValue(key, fallback) {
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
