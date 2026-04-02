import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const BALANCE_ACCOUNTS = [
  { value: "cash_card", label: "Наличные / карта" },
  { value: "ooo_account", label: "Счёт ООО" }
];

const CALENDAR_ACCOUNTS = [
  { value: "Наличные / карта", label: "Наличные / карта" },
  { value: "Счёт ООО", label: "Счёт ООО" },
  { value: "Счёт ИП", label: "Счёт ИП" },
  { value: "Не распределено", label: "Не распределено" }
];

const CALENDAR_STATUSES = ["Платеж", "Поступление", "Ожидает", "Перенесен", "Отменен"];

const DOM = {
  userDisplay: document.getElementById("userDisplay"),
  accessMode: document.getElementById("accessMode"),
  moduleState: document.getElementById("moduleState"),
  statusBox: document.getElementById("statusBox"),
  sectionTabs: document.getElementById("sectionTabs"),
  overviewGrid: document.getElementById("overviewGrid"),
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

const SECTION_META = {
  overview: {
    title: "Обзор",
    subtitle: "Быстрый вход в перенесенные блоки ЛАЙТ 2."
  },
  balance: {
    title: "Баланс",
    subtitle: "Два контура из исходного листа: наличные / карта и счет ООО.",
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
    subtitle: "Первый полностью рабочий раздел переноса из ЛАЙТ 2.",
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
    ]
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
    ]
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
    ]
  }
};

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
  activeSection: "overview",
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
  editingPurchaseId: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
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
      <div class="section-actions mb-3">
        <button type="button" class="btn btn-outline-dark btn-sm" id="refreshBalanceButton">Обновить</button>
      </div>
      <div class="scope-note" id="balanceScopeNote"></div>
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
      <div class="section-actions mb-3">
        <button type="button" class="btn btn-outline-dark btn-sm" id="refreshCalendarButton">Обновить</button>
      </div>
      <div class="scope-note" id="calendarScopeNote"></div>
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
      <div class="section-actions mb-3">
        <button type="button" class="btn btn-outline-dark btn-sm" id="refreshAssetsButton">Обновить</button>
      </div>
      <div class="scope-note" id="assetsScopeNote"></div>
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
          <h3>Выплата по активу</h3>
          <p>Журналируем отдельные выплаты, чтобы видеть сколько уже закрыто и что осталось.</p>
          <form class="record-form mb-0" id="assetPaymentForm">
            <div class="form-grid">
              <div>
                <label class="form-label">Актив</label>
                <select class="form-select" name="asset_id" id="assetPaymentAssetId" required></select>
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
      <div class="section-actions mb-3">
        <button type="button" class="btn btn-outline-dark btn-sm" id="refreshPurchasesButton">Обновить</button>
      </div>
      <div class="scope-note" id="purchasesScopeNote"></div>
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
  const cards = Object.entries(SECTION_META)
    .filter(([key]) => key !== "overview" && isSectionAllowed(key))
    .map(([key, meta]) => `
      <article class="overview-card">
        <h3>${escapeHtml(meta.title)}</h3>
        <p>${escapeHtml(meta.subtitle)}</p>
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

function openSection(sectionKey) {
  STATE.activeSection = isSectionAllowed(sectionKey) ? sectionKey : "overview";
  document.querySelectorAll(".section-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.section === STATE.activeSection);
  });
  document.querySelectorAll(".page-section").forEach((section) => {
    section.classList.toggle("d-none", section.id !== `section-${STATE.activeSection}`);
  });
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
  const formData = new FormData(DOM.settlementForm);
  const draft = {
    salary_amount: formData.get("salary_amount"),
    purchase_amount: formData.get("purchase_amount"),
    status: formData.get("status")
  };
  const math = computeSettlement(draft);

  DOM.settlementPreview.innerHTML = `
    <span>Итог взаиморасчета</span>
    <strong>${formatMoney(math.total)} ₽</strong>
    <span>${escapeHtml(math.direction)}</span>
  `;
}

function resetSettlementForm() {
  STATE.editingSettlementId = null;
  DOM.settlementForm.reset();
  DOM.settlementForm.elements.status.value = "Ожидает сверки";
  DOM.settlementSubmitButton.textContent = "Сохранить запись";

  if (!isAdmin()) {
    DOM.settlementForm.classList.add("is-hidden");
  } else {
    DOM.settlementForm.classList.remove("is-hidden");
    renderPartnerSelect(DOM.settlementForm.elements.partner_slug);
  }

  updateSettlementPreview();
}

function renderScopeNote() {
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
  dom.form.classList.toggle("is-hidden", !isAdmin());
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
  dom.form.classList.toggle("is-hidden", !isAdmin());
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
      if (entry.account_type === "cash_card") acc.cashCard = roundMoney(acc.cashCard + delta);
      if (entry.account_type === "ooo_account") acc.oooAccount = roundMoney(acc.oooAccount + delta);
      acc.total = roundMoney(acc.total + delta);
      return acc;
    },
    { cashCard: 0, oooAccount: 0, total: 0 }
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
  return STATE.assets.find((item) => item.id === assetId)?.asset_name || "—";
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
  const options = ['<option value="">Выберите актив</option>']
    .concat(
      STATE.assets
        .slice()
        .sort((a, b) => String(a.asset_name || "").localeCompare(String(b.asset_name || ""), "ru"))
        .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.asset_name)}</option>`)
    )
    .join("");

  dom.paymentAssetSelect.innerHTML = options;
  dom.paymentFilter.innerHTML = ['<option value="">Все активы</option>']
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
  if (previousFilterValue && STATE.assets.some((item) => item.id === previousFilterValue)) {
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
  dom.assetForm.classList.toggle("is-hidden", !isAdmin());
}

function resetAssetPaymentForm() {
  const dom = getAssetsDom();
  if (!dom.paymentForm) return;

  STATE.editingAssetPaymentId = null;
  dom.paymentForm.reset();
  dom.paymentForm.elements.payment_date.value = new Date().toISOString().slice(0, 10);
  dom.paymentForm.elements.payment_amount.value = "0";
  dom.paymentSubmitButton.textContent = "Сохранить выплату";
  dom.paymentForm.classList.toggle("is-hidden", !isAdmin());
}

function resetPurchaseForm() {
  const dom = getPurchasesDom();
  if (!dom.form) return;

  STATE.editingPurchaseId = null;
  dom.form.reset();
  dom.form.elements.price.value = "0";
  dom.submitButton.textContent = "Сохранить позицию";
  dom.form.classList.toggle("is-hidden", !isAdmin());
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
  if (assetFilter) rows = rows.filter((item) => item.asset_id === assetFilter);
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

  const totals = buildAssetPaymentTotals();
  const assetRows = getVisibleAssets();
  const totalValue = assetRows.reduce((sum, asset) => sum + toNumber(asset.asset_value), 0);
  const totalPaid = assetRows.reduce((sum, asset) => sum + toNumber(totals[asset.id] || 0), 0);
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
  dom.assetForm?.classList.toggle("is-hidden", !isAdmin());
  dom.paymentForm?.classList.toggle("is-hidden", !isAdmin());
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
  dom.form?.classList.toggle("is-hidden", !isAdmin());
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

  STATE.editingAssetId = item.id;
  dom.assetForm.elements.asset_name.value = item.asset_name || "";
  dom.assetForm.elements.asset_value.value = toNumber(item.asset_value);
  dom.assetForm.elements.note.value = item.note || "";
  dom.assetSubmitButton.textContent = "Сохранить изменения";
}

function fillAssetPaymentForm(item) {
  const dom = getAssetsDom();
  if (!dom.paymentForm) return;

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
    <article class="summary-card">
      <span>Наличные / карта</span>
      <strong>${formatMoney(totals.cashCard)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Счёт ООО</span>
      <strong>${formatMoney(totals.oooAccount)} ₽</strong>
    </article>
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
    <article class="summary-card">
      <span>Наличные / карта</span>
      <strong>${formatMoney(totals.cashCard)} ₽</strong>
    </article>
    <article class="summary-card">
      <span>Счёт ООО</span>
      <strong>${formatMoney(totals.oooAccount)} ₽</strong>
    </article>
  `;
}

function renderSettlements() {
  DOM.settlementActionsHead.textContent = isAdmin() ? "Действия" : "";
  renderScopeNote();

  if (!STATE.schemaReady) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">Сначала выполните platform_light2_patch.sql в Supabase SQL Editor.</td></tr>`;
    DOM.settlementSummary.innerHTML = "";
    return;
  }

  const rows = getVisibleSettlements();
  renderSettlementSummary(rows);

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

  const rows = getVisibleBalanceEntries();
  const runningMap = buildBalanceRunningMap();
  renderBalanceSummary(rows);

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

  const rows = getVisibleCalendarEntries();
  renderCalendarSummary(rows);

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
      "LIGHT 2 загружен частично. Выполните platform_light2_patch.sql, platform_light2_finance_patch.sql и platform_light2_assets_purchases_patch.sql в Supabase SQL Editor.",
      "warning"
    );
    return;
  }

  if (!STATE.schemaReady) {
    setModuleState("Частично готово");
    setStatus(
      `Остальные блоки работают, но для взаиморасчетов нужен platform_light2_patch.sql${STATE.operationsReady ? "" : " и для Активов/Закупок нужен platform_light2_assets_purchases_patch.sql"}.`,
      "warning"
    );
    return;
  }

  if (!STATE.financeReady && !STATE.operationsReady) {
    setModuleState("Частично готово");
    setStatus(
      "Взаиморасчеты уже работают. Для финансовых блоков выполните platform_light2_finance_patch.sql, а для Активов и Закупок — platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    return;
  }

  if (!STATE.financeReady) {
    setModuleState("Частично готово");
    setStatus(
      "Взаиморасчеты уже работают. Для разделов Баланс и Платежный календарь выполните platform_light2_finance_patch.sql.",
      "warning"
    );
    return;
  }

  if (!STATE.operationsReady) {
    setModuleState("Частично готово");
    setStatus(
      "Финансовые блоки уже работают. Для разделов Активы и Закупки выполните platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    return;
  }

  setModuleState("Готово");
  setStatus("ЛАЙТ 2 загружен. Взаиморасчеты, Баланс, Платежный календарь, Активы и Закупки работают внутри платформы.", "success");
}

async function loadBootstrapData() {
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
      return;
    }
    throw error;
  }

  STATE.schemaReady = true;
  STATE.schemaError = "";
  STATE.settlements = data || [];
  setModuleState("Готово");
  setStatus("ЛАЙТ 2 загружен. Взаиморасчеты уже работают внутри платформы.", "success");
  renderSettlements();
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
    asset_id: String(formData.get("asset_id") || "").trim(),
    payment_date: String(formData.get("payment_date") || "").trim(),
    payment_amount: roundMoney(formData.get("payment_amount")),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.asset_id) throw new Error("Выберите актив для выплаты.");
  if (!payload.payment_date) throw new Error("Укажите дату выплаты.");
  if (payload.payment_amount <= 0) throw new Error("Сумма выплаты должна быть больше нуля.");

  if (STATE.editingAssetPaymentId) {
    const { error } = await supabase.from("light2_asset_payments").update(payload).eq("id", STATE.editingAssetPaymentId);
    if (error) throw error;
    setStatus("Выплата по активу обновлена.", "success");
  } else {
    const { error } = await supabase.from("light2_asset_payments").insert(payload);
    if (error) throw error;
    setStatus("Выплата по активу добавлена.", "success");
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

  DOM.settlementForm.addEventListener("input", updateSettlementPreview);
  balanceDom.form?.addEventListener("input", updateBalancePreview);
  calendarDom.form?.addEventListener("input", updateCalendarPreview);

  DOM.settlementForm.addEventListener("submit", async (event) => {
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

  DOM.settlementResetButton.addEventListener("click", () => {
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

  [DOM.settlementPartnerFilter, DOM.settlementStatusFilter, DOM.settlementSearch].forEach((element) => {
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

  DOM.refreshSettlementsButton.addEventListener("click", async () => {
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

  DOM.settlementTableBody.addEventListener("click", async (event) => {
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

async function start() {
  renderOverview();
  renderTemplateSections();
  renderInteractiveFinanceSections();
  syncSectionTabs();
  bindEvents();
  openSection("overview");

  try {
    const ready = await loadBootstrapData();
    if (!ready) return;
    await loadSettlements();
    await loadFinanceData();
    await loadOperationsData();
    syncModuleStatus();
  } catch (error) {
    setModuleState("Ошибка");
    setStatus(error.message || "Не удалось запустить модуль ЛАЙТ 2.", "error");
  }
}

start();
