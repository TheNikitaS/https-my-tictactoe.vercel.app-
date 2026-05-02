import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const FINANCE_APP_ID = "platform_finance_v1";
const STORAGE_KEY = "dom-neona:finance:v1";
const ACTIVE_VIEW_KEY = "dom-neona:finance:activeView";
const SNAPSHOT_VERSION = "20260502-finance-fix-4";

const TARGET_SHEETS = {
  balance: "Баланс",
  calendar: "Платежный календарь",
  metrics: "Метрики"
};

const VALID_VIEWS = new Set(["overview", ...Object.keys(TARGET_SHEETS)]);

const BALANCE_SECTION_CONFIG = [
  { key: "cash", title: "Наличные / карта", startCol: 1, incomeCol: 2, expenseCol: 3, balanceCol: 4, commentCol: 5 },
  { key: "ooo", title: "Счёт ООО", startCol: 7, incomeCol: 8, expenseCol: 9, balanceCol: 10, commentCol: 11 },
  { key: "ip", title: "Счёт ИП", startCol: 13, incomeCol: 14, expenseCol: 15, balanceCol: 16, commentCol: 17 }
];

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

boot().catch((error) => {
  console.error("finance boot failed", error);
  setStatus(error.message || "Не удалось открыть Финансы.", "error");
});

async function boot() {
  bindEvents();
  setStatus("Загружаю заполненный исходник ЛАЙТ 2...", "ok");

  const [{ data: userData }, snapshot, saved] = await Promise.all([
    supabase.auth.getUser().catch(() => ({ data: null })),
    fetch(`./workbook_snapshot.json?v=${SNAPSHOT_VERSION}`, { cache: "no-store" }).then((response) => response.json()),
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
  setStatus("Финансы готовы к работе.", "ok");
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
    appendRowForActiveView(sheet);
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

const SHEET_NAME_ALIASES = {
  balance: ["Баланс", "Р‘Р°Р»Р°РЅСЃ"],
  calendar: ["Платежный календарь", "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ"],
  metrics: ["Метрики", "РњРµС‚СЂРёРєРё"],
  data: ["Данные", "Р”Р°РЅРЅС‹Рµ"]
};

const METRIC_ROW_ALIASES = {
  revenue: ["Выручка", "Р’С‹СЂСѓС‡РєР°"],
  cost: ["Себестоимость", "РЎРµР±РµСЃС‚РѕРёРјРѕСЃС‚СЊ"],
  gross_profit: ["Валовая прибыль", "Р’Р°Р»РѕРІР°СЏ РїСЂРёР±С‹Р»СЊ"],
  net_profit: ["Чистая прибыль", "Р§РёСЃС‚Р°СЏ РїСЂРёР±С‹Р»СЊ"],
  sales: ["Продажи", "РџСЂРѕРґР°Р¶Рё"]
};

function matchesAnyAlias(value, aliases = []) {
  const source = cleanText(value).toLowerCase();
  return aliases.some((alias) => cleanText(alias).toLowerCase() === source);
}

function findMetricRowByAliases(metricRows, aliases = []) {
  return (metricRows || []).find((row) => matchesAnyAlias(row?.label, aliases)) || null;
}

function buildBaseSheets(snapshot) {
  const result = {};
  Object.entries(TARGET_SHEETS).forEach(([key, name]) => {
    const source = (snapshot.sheets || []).find((sheet) => matchesAnyAlias(sheet.name, SHEET_NAME_ALIASES[key] || [name]));
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
    rows: (source.rows || []).map((row) => ({
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
  const dataSheet = (snapshot.sheets || []).find((sheet) => matchesAnyAlias(sheet.name, SHEET_NAME_ALIASES.data));
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
  (sheet?.rows || []).forEach((row) => {
    matrix[row.index] ||= [];
    Object.entries(row.cells || {}).forEach(([column, cell]) => {
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

  try {
    if (isOverview) renderOverview();
    else renderActiveSheet();
  } catch (error) {
    console.error("finance render failed", error);
    DOM.tableWrap.replaceChildren();
    DOM.overviewView.replaceChildren();
    setStatus(error.message || "Не удалось отрисовать Финансы.", "error");
  }
}

function renderOverview() {
  const balanceSheet = STATE.sheets.balance;
  const calendarSheet = STATE.sheets.calendar;
  const metricsSheet = STATE.sheets.metrics;

  const balanceSections = buildBalanceSectionsSummary(balanceSheet);
  const calendarSummary = buildCalendarSummary(calendarSheet);
  const metricRows = extractMetricRows(metricsSheet);
  const revenueRow = findMetricRowByAliases(metricRows, METRIC_ROW_ALIASES.revenue);
  const costRow = findMetricRowByAliases(metricRows, METRIC_ROW_ALIASES.cost);
  const grossRow = findMetricRowByAliases(metricRows, METRIC_ROW_ALIASES.gross_profit);
  const netRow = findMetricRowByAliases(metricRows, METRIC_ROW_ALIASES.net_profit);
  const salesRow = findMetricRowByAliases(metricRows, METRIC_ROW_ALIASES.sales);

  DOM.overviewView.innerHTML = `
    ${overviewCard("Баланс всего", formatMoney(balanceSections.total), "Сумма по наличным, ООО и ИП")}
    ${overviewCard("Наличные / карта", formatMoney(balanceSections.cash.current), `${formatMoney(balanceSections.cash.income)} приход • ${formatMoney(balanceSections.cash.expense)} расход`)}
    ${overviewCard("Счёт ООО", formatMoney(balanceSections.ooo.current), `${formatMoney(balanceSections.ooo.income)} приход • ${formatMoney(balanceSections.ooo.expense)} расход`)}
    ${overviewCard("Счёт ИП", formatMoney(balanceSections.ip.current), `${formatMoney(balanceSections.ip.income)} приход • ${formatMoney(balanceSections.ip.expense)} расход`)}
    ${overviewCard("Выручка", formatMoney(lastMetricValue(revenueRow)), "Последнее значение из блока Метрики")}
    ${overviewCard("Себестоимость", formatMoney(lastMetricValue(costRow)), "Последнее значение из блока Метрики")}
    ${overviewCard("Валовая прибыль", formatMoney(lastMetricValue(grossRow)), "Последнее значение из блока Метрики")}
    ${overviewCard("Чистая прибыль", formatMoney(lastMetricValue(netRow)), "Последнее значение из блока Метрики")}
    ${overviewCard("Продажи", formatNumber(lastMetricValue(salesRow)), "Последнее значение из блока Метрики")}
    ${overviewCard("Платежей в календаре", formatNumber(calendarSummary.entriesCount), `${formatMoney(calendarSummary.incoming)} приход • ${formatMoney(calendarSummary.outgoing)} расход`)}
    <article class="overview-card chart">
      <span>Динамика выручки</span>
      ${renderRevenueChart(revenueRow)}
    </article>
    <article class="overview-card chart">
      <span>Ближайшие операции</span>
      <div class="overview-feed">
        ${
          calendarSummary.items.length
            ? calendarSummary.items
                .slice(0, 6)
                .map(
                  (item) => `
                    <div class="overview-feed__item">
                      <div>
                        <strong>${escapeHtml(item.counterparty || item.article || "Платёж")}</strong>
                        <small>${escapeHtml(item.date || "Без даты")} • ${escapeHtml(item.kind || "Операция")}</small>
                      </div>
                      <span class="${item.kind === "Расход" ? "tone-expense" : "tone-income"}">${escapeHtml(formatMoney(item.amount))}</span>
                    </div>
                  `
                )
                .join("")
            : '<div class="workspace-empty workspace-empty--tight">Платежный календарь пока пуст.</div>'
        }
      </div>
    </article>
  `;
}

function buildBalanceSectionsSummary(sheet) {
  const result = {
    total: 0,
    cash: { title: "Наличные / карта", current: 0, income: 0, expense: 0 },
    ooo: { title: "Счёт ООО", current: 0, income: 0, expense: 0 },
    ip: { title: "Счёт ИП", current: 0, income: 0, expense: 0 }
  };

  const computed = buildComputedSheet(sheet);

  BALANCE_SECTION_CONFIG.forEach((section) => {
    const key = section.key;
    const rows = (sheet?.rows || []).filter((row) => Number(row.index) >= 4);
    const incoming = roundMoney(
      rows.reduce((sum, row) => sum + getComputedNumeric(computed, row.index, section.incomeCol), 0)
    );
    const expense = roundMoney(
      rows.reduce((sum, row) => sum + getComputedNumeric(computed, row.index, section.expenseCol), 0)
    );
    result[key] = {
      title: section.title,
      current: roundMoney(getComputedNumeric(computed, 1, section.balanceCol)),
      income: roundMoney(incoming),
      expense: roundMoney(expense)
    };
  });

  result.total = roundMoney(result.cash.current + result.ooo.current + result.ip.current);
  return result;
}

function buildCalendarSummary(sheet) {
  const layout = getSheetLayout(sheet, "calendar");
  const computed = buildComputedSheet(sheet);
  const rows = filterRows(sheet)
    .filter((row) => !layout.hiddenRows.has(row.index))
    .sort((a, b) => a.index - b.index);

  const items = rows
    .map((row) => {
      const date = getComputedDisplay(computed, row.index, 1);
      const counterparty = getComputedDisplay(computed, row.index, 2);
      const amount = getComputedNumeric(computed, row.index, 3);
      const kind = getComputedDisplay(computed, row.index, 4);
      const article = getComputedDisplay(computed, row.index, 5);
      const account = getComputedDisplay(computed, row.index, 6);
      const status = getComputedDisplay(computed, row.index, 7);
      const comment = getComputedDisplay(computed, row.index, 8);
      if (!date && !counterparty && !amount && !article && !comment) return null;
      return { date, counterparty, amount, kind, article, account, status, comment };
    })
    .filter(Boolean);

  return {
    entriesCount: items.length,
    incoming: roundMoney(
      items.filter((item) => cleanText(item.kind).toLowerCase() === "приход").reduce((sum, item) => sum + item.amount, 0)
    ),
    outgoing: roundMoney(
      items.filter((item) => cleanText(item.kind).toLowerCase() === "расход").reduce((sum, item) => sum + item.amount, 0)
    ),
    items
  };
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
      ${points
        .map(
          (point) => `
            <circle class="chart-dot" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="4">
              <title>${escapeHtml(point.period)}: ${formatMoney(point.value)}</title>
            </circle>
          `
        )
        .join("")}
    </svg>
  `;
}

function extractMetricRows(sheet) {
  const computed = buildComputedSheet(sheet);
  const matrix = rowsToComputedMatrix(sheet, computed);
  const rows = [];

  for (let row = 1; row < matrix.length; row += 1) {
    const cells = matrix[row] || [];
    const labelColumn = findMetricLabelColumn(cells, sheet?.maxCol || 1);
    const label = labelColumn ? cleanText(cells[labelColumn]) : "";
    if (!label) continue;

    const values = [];
    for (let column = labelColumn + 1; column <= (sheet?.maxCol || 1); column += 1) {
      const metricKind = cleanText(matrix[3]?.[column]).toLowerCase();
      if (metricKind && metricKind !== "сумма") continue;
      const value = parseNumber(matrix[row]?.[column]);
      if (!Number.isFinite(value)) continue;
      values.push({
        period: cleanText(matrix[2]?.[column]) || columnLabel(column),
        value
      });
    }

    rows.push({ label, values });
  }

  return rows;
}

function findMetricLabelColumn(cells, maxCol) {
  for (let column = 1; column <= maxCol; column += 1) {
    const label = cleanText(cells?.[column]);
    if (!label) continue;
    const numeric = parseNumber(label);
    if (Number.isFinite(numeric) && String(label).replace(/\s/g, "").length <= 12) continue;
    const hasNumericToRight = Array.from({ length: Math.max(maxCol - column, 0) }, (_, index) => column + index + 1)
      .some((nextColumn) => Number.isFinite(parseNumber(cells?.[nextColumn])));
    if (hasNumericToRight) return column;
  }
  return 0;
}

function renderActiveSheet() {
  const sheet = getActiveSheet();
  if (!sheet) return;

  if (STATE.activeView === "balance") {
    renderBalanceSheet(sheet);
    return;
  }

  if (STATE.activeView === "calendar") {
    renderCalendarSheet(sheet);
    return;
  }

  if (STATE.activeView === "metrics") {
    renderMetricsSheet(sheet);
    return;
  }

  const computed = buildComputedSheet(sheet);
  const layout = getSheetLayout(sheet, STATE.activeView);
  const rows = filterRows(sheet).filter((row) => !layout.hiddenRows.has(row.index));
  const limit = STATE.rowLimit === "all" ? rows.length : Number(STATE.rowLimit);
  const visibleRows = rows.slice(0, limit);
  const columns = layout.columns;

  DOM.sheetMeta.textContent = `${sheet.name}: ${rows.length} строк, формул в исходнике: ${sheet.sourceFormulas || 0}`;

  const table = document.createElement("table");
  table.className = "finance-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th class="row-head">№</th>
        <th class="select-head">✓</th>
        ${columns.map((column) => `<th>${escapeHtml(layout.headers[column] || columnLabel(column))}</th>`).join("")}
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
      ${columns.map((column) => renderCell(sheet, computed, row, column)).join("")}
    `;
    body.append(tr);
  });

  DOM.tableWrap.replaceChildren(table, ...renderDatalists(sheet));

  bindRenderedSheetEvents(sheet);
}

function renderBalanceSheet(sheet) {
  const computed = buildComputedSheet(sheet);
  const summary = buildBalanceSectionsSummary(sheet);
  const rowsLimit = STATE.rowLimit === "all" ? Infinity : Number(STATE.rowLimit || 100);

  DOM.sheetMeta.textContent = `Баланс: ${sheet.rows.length} строк, формул: ${sheet.sourceFormulas || 0}`;

  const content = `
    <div class="finance-section-grid">
      ${BALANCE_SECTION_CONFIG.map((section) => renderBalanceSection(sheet, computed, summary[section.key], section, rowsLimit)).join("")}
    </div>
  `;

  DOM.tableWrap.replaceChildren(htmlToElement(content), ...renderFinanceDatalists());
  bindRenderedSheetEvents(sheet);
  bindFinanceActionEvents(sheet);
}

function renderBalanceSection(sheet, computed, summary, section, limit) {
  const rows = filterRows(sheet)
    .filter((row) => row.index >= 4)
    .filter((row) => hasSectionContent(row, section))
    .slice(0, limit);

  return `
    <article class="finance-block" data-balance-section="${escapeHtml(section.key)}">
      <header class="finance-block__head">
        <div>
          <h3>${escapeHtml(section.title)}</h3>
          <strong>${formatMoney(summary?.current || 0)}</strong>
        </div>
        <button type="button" class="mini-button" data-add-balance="${escapeHtml(section.key)}">+ Операция</button>
      </header>
      <div class="balance-totals">
        <span>Приход: <b class="tone-income">${formatMoney(summary?.income || 0)}</b></span>
        <span>Расход: <b class="tone-expense">${formatMoney(summary?.expense || 0)}</b></span>
      </div>
      <div class="finance-list finance-list--balance">
        <div class="finance-list__row finance-list__row--head">
          <span>Дата</span>
          <span>Приход</span>
          <span>Расход</span>
          <span>Остаток</span>
          <span>Комментарий</span>
          <span></span>
        </div>
        ${
          rows.length
            ? rows
                .map(
                  (row) => `
                    <div class="finance-list__row">
                      ${renderFinanceCell(sheet, computed, row, section.startCol, { type: "date" })}
                      ${renderFinanceCell(sheet, computed, row, section.incomeCol, { type: "money" })}
                      ${renderFinanceCell(sheet, computed, row, section.expenseCol, { type: "money" })}
                      ${renderFinanceCell(sheet, computed, row, section.balanceCol, { type: "money", readonly: true })}
                      ${renderFinanceCell(sheet, computed, row, section.commentCol, { dictionary: "comment" })}
                      <span></span>
                    </div>
                  `
                )
                .join("")
            : '<div class="workspace-empty workspace-empty--tight">Нет операций по выбранному фильтру.</div>'
        }
      </div>
    </article>
  `;
}

function renderCalendarSheet(sheet) {
  const computed = buildComputedSheet(sheet);
  const summary = buildCalendarSummary(sheet);
  const layout = getSheetLayout(sheet, "calendar");
  const rowsLimit = STATE.rowLimit === "all" ? Infinity : Number(STATE.rowLimit || 100);
  const rows = filterRows(sheet)
    .filter((row) => !layout.hiddenRows.has(row.index))
    .slice(0, rowsLimit);

  DOM.sheetMeta.textContent = `Платежный календарь: ${summary.entriesCount} операций`;

  const content = `
    <div class="finance-toolbar-line">
      <span>Приход: <b class="tone-income">${formatMoney(summary.incoming)}</b></span>
      <span>Расход: <b class="tone-expense">${formatMoney(summary.outgoing)}</b></span>
      <span>Операций: <b>${formatNumber(summary.entriesCount)}</b></span>
    </div>
    <div class="finance-list finance-list--calendar">
      <div class="finance-list__row finance-list__row--head">
        <span>Дата</span>
        <span>Контрагент</span>
        <span>Сумма</span>
        <span>Тип</span>
        <span>Статья</span>
        <span>Счёт</span>
        <span>Статус</span>
        <span>Комментарий</span>
        <span></span>
      </div>
      ${
        rows.length
          ? rows
              .map(
                (row) => `
                  <div class="finance-list__row">
                    ${renderFinanceCell(sheet, computed, row, 1, { type: "date" })}
                    ${renderFinanceCell(sheet, computed, row, 2, { dictionary: "counterparty" })}
                    ${renderFinanceCell(sheet, computed, row, 3, { type: "money" })}
                    ${renderFinanceCell(sheet, computed, row, 4, { options: ["Приход", "Расход"] })}
                    ${renderFinanceCell(sheet, computed, row, 5, { dictionary: "article" })}
                    ${renderFinanceCell(sheet, computed, row, 6, { options: accountOptions() })}
                    ${renderFinanceCell(sheet, computed, row, 7, { dictionary: "status", options: ["Платеж", "Поступление", "План", "Отложено"] })}
                    ${renderFinanceCell(sheet, computed, row, 8, { dictionary: "comment" })}
                    ${renderRowSelector(row.index)}
                  </div>
                `
              )
              .join("")
          : '<div class="workspace-empty workspace-empty--tight">Операций нет.</div>'
      }
    </div>
  `;

  DOM.tableWrap.replaceChildren(htmlToElement(content), ...renderFinanceDatalists());
  bindRenderedSheetEvents(sheet);
}

function renderMetricsSheet(sheet) {
  const computed = buildComputedSheet(sheet);
  const rowsLimit = STATE.rowLimit === "all" ? Infinity : Number(STATE.rowLimit || 100);
  const metricRows = filterRows(sheet)
    .map((row) => ({
      row,
      labelColumn: findMetricLabelColumnForRow(sheet, computed, row)
    }))
    .filter((entry) => entry.labelColumn)
    .slice(0, rowsLimit);

  DOM.sheetMeta.textContent = `Метрики: ${metricRows.length} показателей, формул: ${sheet.sourceFormulas || 0}`;

  const content = `
    <div class="metrics-board">
      ${metricRows.map(({ row, labelColumn }) => renderMetricCard(sheet, computed, row, labelColumn)).join("")}
    </div>
  `;

  DOM.tableWrap.replaceChildren(htmlToElement(content));
  bindRenderedSheetEvents(sheet);
}

function findMetricLabelColumnForRow(sheet, computed, row) {
  const cells = [];
  for (let column = 1; column <= (sheet?.maxCol || 1); column += 1) {
    cells[column] = getComputedDisplay(computed, row.index, column);
  }
  return findMetricLabelColumn(cells, sheet?.maxCol || 1);
}

function renderMetricCard(sheet, computed, row, labelColumn = 1) {
  const columns = getSheetLayout(sheet, "metrics").columns
    .filter((column) => column > labelColumn)
    .filter((column) => cleanText(getComputedDisplay(computed, row.index, column)) || cleanText(getComputedDisplay(computed, 2, column)))
    .slice(-12);

  return `
    <article class="metric-card">
      <header>
        ${renderFinanceCell(sheet, computed, row, labelColumn, { className: "metric-title" })}
        ${renderRowSelector(row.index)}
      </header>
      <div class="metric-values">
        ${columns
          .map((column) => {
            const period = [getComputedDisplay(computed, 2, column), getComputedDisplay(computed, 3, column)].filter(Boolean).join(" / ");
            return `
              <label>
                <span>${escapeHtml(period || columnLabel(column))}</span>
                ${renderFinanceCell(sheet, computed, row, column, { type: "money" })}
              </label>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function bindRenderedSheetEvents(sheet) {
  DOM.tableWrap.querySelectorAll("[data-row-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const rowIndex = Number(checkbox.dataset.rowCheck);
      if (checkbox.checked) STATE.selectedRows.add(rowIndex);
      else STATE.selectedRows.delete(rowIndex);
    });
  });

  DOM.tableWrap.querySelectorAll("[data-cell]").forEach((input) => {
    if (input.hasAttribute("readonly")) return;
    const updateCell = () => {
      const [rowIndex, column] = input.dataset.cell.split(":").map(Number);
      setCell(sheet, rowIndex, column, input.value);
      scheduleSave();
    };
    input.addEventListener("input", updateCell);
    input.addEventListener("change", updateCell);
  });
}

function bindFinanceActionEvents(sheet) {
  DOM.tableWrap.querySelectorAll("[data-add-balance]").forEach((button) => {
    button.addEventListener("click", () => {
      appendBalanceRow(sheet, button.dataset.addBalance);
      scheduleSave();
      renderActiveSheet();
    });
  });
}

function renderFinanceCell(sheet, computed, row, column, options = {}) {
  const cell = row.cells[String(column)] || { display: "", kind: "text", formula: "" };
  const displayValue = getComputedDisplay(computed, row.index, column);
  const formula = Boolean(cell.formula);
  const readonly = options.readonly || formula;
  const classes = ["finance-field", options.type === "money" ? "finance-field--number" : "", options.className || "", formula ? "finance-field--formula" : ""]
    .filter(Boolean)
    .join(" ");
  const title = formula ? ` title="${escapeHtml(cell.formula)}"` : "";
  const optionValues = options.options || mergedOptions(dictionaryOptions(options.dictionary || getColumnHeader(sheet, column)), sheetColumnValues(sheet, column));

  if (optionValues.length && !readonly) {
    return `
      <select class="${classes}" data-cell="${row.index}:${column}"${title}>
        ${renderSelectOptions(displayValue, optionValues)}
      </select>
    `;
  }

  const type = options.type === "date" ? "text" : "text";
  const listId = options.dictionary ? ` list="dict-${slug(options.dictionary)}"` : "";
  return `
    <input class="${classes}" type="${type}" data-cell="${row.index}:${column}" value="${escapeHtml(displayValue)}"${listId}${readonly ? " readonly" : ""}${title}>
  `;
}

function renderSelectOptions(value, values) {
  const current = cleanText(value);
  const unique = Array.from(new Set([current, ...values.map(cleanText)].filter(Boolean)));
  return ['<option value=""></option>', ...unique.map((item) => `<option value="${escapeHtml(item)}"${sameText(item, current) ? " selected" : ""}>${escapeHtml(item)}</option>`)].join("");
}

function renderRowSelector(rowIndex) {
  return `<label class="row-check"><input type="checkbox" ${STATE.selectedRows.has(rowIndex) ? "checked" : ""} data-row-check="${rowIndex}"><span></span></label>`;
}

function appendRowForActiveView(sheet) {
  if (STATE.activeView === "balance") {
    appendBalanceRow(sheet, "cash");
    return;
  }

  const nextIndex = Math.max(0, ...sheet.rows.map((row) => row.index)) + 1;
  const row = { index: nextIndex, cells: {} };

  if (STATE.activeView === "calendar") {
    row.cells = {
      1: createCell(formatDateForInput(new Date())),
      4: createCell("Расход"),
      6: createCell("Наличные / карта"),
      7: createCell("Платеж")
    };
  }

  sheet.rows.push(row);
}

function appendBalanceRow(sheet, sectionKey) {
  const section = BALANCE_SECTION_CONFIG.find((item) => item.key === sectionKey) || BALANCE_SECTION_CONFIG[0];
  const nextIndex = Math.max(3, ...sheet.rows.map((row) => row.index)) + 1;
  const row = { index: nextIndex, cells: {} };
  row.cells[String(section.startCol)] = createCell(formatDateForInput(new Date()));
  row.cells[String(section.incomeCol)] = createCell("");
  row.cells[String(section.expenseCol)] = createCell("");
  row.cells[String(section.balanceCol)] = createCell("", `=${columnLabel(section.balanceCol)}${nextIndex - 1}+${columnLabel(section.incomeCol)}${nextIndex}-${columnLabel(section.expenseCol)}${nextIndex}`);
  row.cells[String(section.commentCol)] = createCell("");
  sheet.rows.push(row);
}

function createCell(value, formula = "") {
  return {
    display: value,
    raw: value,
    kind: inferKind(value),
    formula
  };
}

function hasSectionContent(row, section) {
  return [section.startCol, section.incomeCol, section.expenseCol, section.balanceCol, section.commentCol].some((column) =>
    cleanText(row.cells?.[String(column)]?.display || row.cells?.[String(column)]?.raw)
  );
}

function dictionaryOptions(keyOrKind) {
  const key = cleanText(keyOrKind).toLowerCase();
  const exact = Object.keys(STATE.dictionaries).find((item) => sameText(item, keyOrKind));
  if (exact) return STATE.dictionaries[exact] || [];

  if (key.includes("status") || key.includes("статус")) return STATE.dictionaries["Статус"] || [];
  if (key.includes("article") || key.includes("статья")) return dictionaryByFragments(["статья", "категория"]);
  if (key.includes("counterparty") || key.includes("контрагент")) return dictionaryByFragments(["контрагент", "партнер", "покупатель", "поставщик"]);
  if (key.includes("comment") || key.includes("комментар")) return [];
  return dictionaryByFragments([key]);
}

function mergedOptions(...groups) {
  const values = [];
  groups.flat().forEach((item) => {
    const value = cleanText(item);
    if (value && !values.includes(value)) values.push(value);
  });
  return values;
}

function sheetColumnValues(sheet, column) {
  return (sheet?.rows || [])
    .map((row) => cleanText(row.cells?.[String(column)]?.display || row.cells?.[String(column)]?.raw))
    .filter(Boolean)
    .slice(0, 300);
}

function dictionaryByFragments(fragments) {
  const values = [];
  Object.entries(STATE.dictionaries).forEach(([key, items]) => {
    const lowerKey = key.toLowerCase();
    if (fragments.some((fragment) => fragment && lowerKey.includes(fragment))) {
      items.forEach((item) => {
        if (item && !values.includes(item)) values.push(item);
      });
    }
  });
  return values;
}

function accountOptions() {
  return ["Наличные / карта", "Счёт ООО", "Счёт ИП"];
}

function renderFinanceDatalists() {
  return Object.entries(STATE.dictionaries).map(([key, values]) => {
    const list = document.createElement("datalist");
    list.id = `dict-${slug(key)}`;
    list.innerHTML = (values || []).map((value) => `<option value="${escapeHtml(value)}"></option>`).join("");
    return list;
  });
}

function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function renderCell(sheet, computed, row, column) {
  const cell = row.cells[String(column)] || { display: "", kind: "text", formula: "" };
  const displayValue = getComputedDisplay(computed, row.index, column);
  const header = getColumnHeader(sheet, column);
  const dictKey = Object.keys(STATE.dictionaries).find((key) => sameText(key, header));
  const list = dictKey ? ` list="dict-${slug(dictKey)}"` : "";
  const typeClass = ["number", "percent"].includes(cell.kind) ? cell.kind : "";
  const emptyClass = cleanText(displayValue) ? "" : " cell-empty";
  const formulaClass = cell.formula ? " formula-cell" : "";
  const title = cell.formula ? ` title="${escapeHtml(cell.formula)}"` : "";
  const readonly = cell.formula ? " readonly" : "";
  return `
    <td class="${formulaClass}"${title}>
      <input class="cell-input ${typeClass}${emptyClass}" data-cell="${row.index}:${column}" value="${escapeHtml(displayValue)}"${list}${readonly}>
    </td>
  `;
}

function getSheetLayout(sheet, viewKey) {
  const headerRowByView = {
    balance: 3,
    calendar: 1,
    metrics: 3
  };
  const hiddenRowsByView = {
    balance: new Set([1, 2, 3]),
    calendar: new Set([1, 2, 3, 4, 5]),
    metrics: new Set([1, 2, 3])
  };

  const headerRowIndex = headerRowByView[viewKey] || 1;
  const hiddenRows = hiddenRowsByView[viewKey] || new Set([headerRowIndex]);
  const headerRow = (sheet.rows || []).find((row) => row.index === headerRowIndex);
  const maxColumn = Math.max(sheet.maxCol, maxUsedColumn(sheet));
  const columns = [];
  const headers = {};

  for (let column = 1; column <= maxColumn; column += 1) {
    const header = cleanText(headerRow?.cells?.[String(column)]?.display);
    const hasData = sheet.rows.some((row) => !hiddenRows.has(row.index) && cleanText(row.cells?.[String(column)]?.display || row.cells?.[String(column)]?.raw));
    if (!header && !hasData) continue;
    columns.push(column);
    if (viewKey === "metrics") {
      const month = cleanText((sheet.rows || []).find((row) => row.index === 2)?.cells?.[String(column)]?.display);
      headers[column] = [month, header].filter(Boolean).join(" / ") || columnLabel(column);
    } else {
      headers[column] = header || columnLabel(column);
    }
  }

  return { columns, headers, hiddenRows };
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
    .map(
      ([key, values]) => `
        <article class="dictionary-card">
          <h3>${escapeHtml(key)}</h3>
          <textarea data-dict="${escapeHtml(key)}">${escapeHtml(values.join("\n"))}</textarea>
        </article>
      `
    )
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
    .filter((row) =>
      Object.values(row.cells || {}).some((cell) => {
        const blob = `${cell.display || ""} ${cell.raw || ""}`.toLowerCase();
        return blob.includes(STATE.search);
      })
    )
    .sort((a, b) => a.index - b.index);
}

function getActiveSheet() {
  return STATE.sheets[STATE.activeView] || null;
}

function getColumnHeader(sheet, column) {
  const candidates = (sheet.rows || [])
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
    // Fallback to local storage below.
  }

  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function buildComputedSheet(sheet) {
  const rowMap = new Map((sheet?.rows || []).map((row) => [Number(row.index), row]));
  const numericCache = new Map();
  const displayCache = new Map();
  const stack = new Set();

  function getCell(rowIndex, column) {
    return rowMap.get(Number(rowIndex))?.cells?.[String(column)] || null;
  }

  function cacheKey(rowIndex, column) {
    return `${Number(rowIndex)}:${Number(column)}`;
  }

  function evaluateNumeric(rowIndex, column) {
    const key = cacheKey(rowIndex, column);
    if (numericCache.has(key)) return numericCache.get(key);
    if (stack.has(key)) return 0;
    stack.add(key);

    const cell = getCell(rowIndex, column);
    let value = 0;

    if (cell?.formula) {
      value = evaluateFormula(cell.formula, (ref) => {
        const point = parseCellReference(ref);
        if (!point) return 0;
        return evaluateNumeric(point.row, point.column);
      });
    } else {
      value = parseNumber(cell?.display ?? cell?.raw);
      if (!Number.isFinite(value)) value = 0;
    }

    stack.delete(key);
    value = roundMoney(value);
    numericCache.set(key, value);
    return value;
  }

  function evaluateDisplay(rowIndex, column) {
    const key = cacheKey(rowIndex, column);
    if (displayCache.has(key)) return displayCache.get(key);

    const cell = getCell(rowIndex, column);
    let display = cleanText(cell?.display ?? cell?.raw);
    if (cell?.formula) {
      display = formatFormulaResult(evaluateNumeric(rowIndex, column), cell);
    }
    displayCache.set(key, display);
    return display;
  }

  return {
    getNumeric: evaluateNumeric,
    getDisplay: evaluateDisplay
  };
}

function evaluateFormula(formula, resolveRef) {
  const source = String(formula || "").trim();
  if (!source.startsWith("=")) return parseNumber(source);
  let expression = source.slice(1);
  expression = expression.replace(/\$/g, "");
  expression = expression.replace(/([A-Z]+[0-9]+)/g, (match) => String(resolveRef(match)).replace(",", "."));
  if (!isSafeFormulaExpression(expression)) return 0;
  expression = expression.replace(/,/g, ".");
  try {
    const value = Function(`"use strict"; return (${expression});`)();
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function parseCellReference(reference) {
  const match = String(reference || "").match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return {
    column: columnNumber(match[1]),
    row: Number(match[2])
  };
}

function isSafeFormulaExpression(expression) {
  const source = String(expression || "");
  if (!source) return false;
  const allowed = new Set(["+", "-", "*", "/", "(", ")", ".", ",", " "]);
  for (const char of source) {
    if ((char >= "0" && char <= "9") || allowed.has(char) || char === "\t" || char === "\n" || char === "\r") continue;
    return false;
  }
  return true;
}

function columnNumber(label) {
  return String(label)
    .split("")
    .reduce((sum, char) => sum * 26 + (char.charCodeAt(0) - 64), 0);
}

function formatFormulaResult(value, cell) {
  if (!Number.isFinite(value)) return "";
  const source = String(cell?.display ?? cell?.raw ?? "");
  const decimalsMatch = source.match(/[,.](\d+)/);
  const decimals = decimalsMatch ? Math.min(decimalsMatch[1].length, 4) : Math.abs(value % 1) > 0 ? 2 : 0;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
  return cell?.kind === "percent" ? `${formatted}%` : formatted;
}

function getComputedNumeric(computed, rowIndex, column) {
  return Number.isFinite(computed?.getNumeric?.(rowIndex, column)) ? computed.getNumeric(rowIndex, column) : 0;
}

function getComputedDisplay(computed, rowIndex, column) {
  return computed?.getDisplay?.(rowIndex, column) || "";
}

function rowsToComputedMatrix(sheet, computed) {
  const matrix = [];
  (sheet?.rows || []).forEach((row) => {
    matrix[row.index] ||= [];
    Object.keys(row.cells || {}).forEach((column) => {
      matrix[row.index][Number(column)] = getComputedDisplay(computed, row.index, Number(column));
    });
  });
  return matrix;
}

function setStatus(message, tone = "") {
  DOM.statusBox.textContent = message;
  DOM.statusBox.className = `notice ${tone}`.trim();
}

function setSaveLabel(message) {
  DOM.saveLabel.textContent = message;
}

function maxUsedColumn(sheet) {
  return Math.max(sheet.maxCol || 1, ...(sheet.rows || []).flatMap((row) => Object.keys(row.cells || {}).map(Number)));
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
  if (cleanText(value) === "") return Number.NaN;
  const normalized = String(value ?? "")
    .replace(/\s/g, "")
    .replace("%", "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : Number.NaN;
}

function inferKind(value) {
  const text = String(value ?? "");
  if (/%$/.test(text.trim())) return "percent";
  return Number.isFinite(parseNumber(text)) && text.trim() !== "" ? "number" : "text";
}

function lastMetricValue(row) {
  if (!row?.values?.length) return 0;
  const meaningful = [...row.values]
    .reverse()
    .find((item) => Number.isFinite(item?.value) && Math.abs(Number(item.value) || 0) > 0.0001);
  return meaningful?.value || row.values.at(-1)?.value || 0;
}

function roundMoney(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

function formatMoney(value) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0)} ₽`;
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
}

function formatDateForInput(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU");
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
  String(value)
    .split("")
    .forEach((char) => {
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
