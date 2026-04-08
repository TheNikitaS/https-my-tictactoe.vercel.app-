import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { createLiveWorkspaceController } from "./live-workspaces.js?v=20260408-platform-ux33";
import { createDomovoyNeonik } from "./domovoy-neonik.js?v=20260408-platform-ux33";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const REDIRECT_URL = window.location.href.split("#")[0];
const PLATFORM_BUILD = "20260408-platform-ux33";
const PLATFORM_DATA_RESET_VERSION = "20260403-cleanstart-5";
const PLATFORM_UI_KEYS = {
  wideMode: "dom-neona:platform:wideMode",
  sidebarCollapsed: "dom-neona:platform:sidebarCollapsed",
  dashboardPeriod: "dom-neona:platform:dashboardPeriod",
  activeModule: "dom-neona:platform:activeModule"
};

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const DOM = {
  authScreen: document.getElementById("authScreen"),
  appShell: document.getElementById("appShell"),
  authTabs: document.getElementById("authTabs"),
  authStatus: document.getElementById("authStatus"),
  platformStatusSection: document.getElementById("platformStatusSection"),
  platformStatus: document.getElementById("platformStatus"),
  profileCard: document.getElementById("profileCard"),
  moduleNav: document.getElementById("moduleNav"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),
  sidebarToggleButton: document.getElementById("sidebarToggleButton"),
  wideModeButton: document.getElementById("wideModeButton"),
  refreshButton: document.getElementById("refreshButton"),
  signOutButton: document.getElementById("signOutButton"),
  dashboardView: document.getElementById("dashboardView"),
  dashboardGrid: document.getElementById("dashboardGrid"),
  embedView: document.getElementById("embedView"),
  moduleFrame: document.getElementById("moduleFrame"),
  adminView: document.getElementById("adminView"),
  adminUsersBody: document.getElementById("adminUsersBody"),
  userAccessEditor: document.getElementById("userAccessEditor"),
  roleTemplatesBody: document.getElementById("roleTemplatesBody"),
  roleTemplateForm: document.getElementById("roleTemplateForm"),
  rolePermissionsGrid: document.getElementById("rolePermissionsGrid"),
  newRoleButton: document.getElementById("newRoleButton"),
  resetRoleFormButton: document.getElementById("resetRoleFormButton"),
  deleteRoleTemplateButton: document.getElementById("deleteRoleTemplateButton"),
  partnerDirectoryBody: document.getElementById("partnerDirectoryBody"),
  messengerView: document.getElementById("messengerView"),
  threadList: document.getElementById("threadList"),
  messagesList: document.getElementById("messagesList"),
  messageThreadTitle: document.getElementById("messageThreadTitle"),
  messageThreadMeta: document.getElementById("messageThreadMeta"),
  placeholderView: document.getElementById("placeholderView"),
  placeholderCard: document.getElementById("placeholderCard"),
  schemaWarningSection: document.getElementById("schemaWarningSection"),
  aiWidgetToggle: document.getElementById("aiWidgetToggle"),
  aiWidgetPanel: document.getElementById("aiWidgetPanel"),
  aiWidgetClose: document.getElementById("aiWidgetClose"),
  aiWidgetMessages: document.getElementById("aiWidgetMessages"),
  aiWidgetForm: document.getElementById("aiWidgetForm"),
  aiWidgetInput: document.getElementById("aiWidgetInput")
};

const STATE = {
  session: null,
  user: null,
  profile: null,
  schemaReady: true,
  schemaError: "",
  activeModule: readStoredModuleKey(),
  lastNonAiModule: "dashboard",
  loadedEmbedKey: null,
  loadedEmbedSrc: "",
  queuedBootstrapSignature: "",
  queuedBootstrapTimer: null,
  users: [],
  partnerProfiles: [],
  roleTemplates: [],
  selectedUserId: null,
  editingRoleKey: null,
  platformConfig: {
    domovoyApiBaseUrl: "",
    domovoyHealth: null,
    domovoySyncAt: ""
  },
  threads: [],
  activeThreadId: null,
  ui: {
    wideMode: readStoredBoolean(PLATFORM_UI_KEYS.wideMode, true),
    sidebarCollapsed: readStoredBoolean(PLATFORM_UI_KEYS.sidebarCollapsed, false),
    dashboardPeriod: (() => {
      try {
        const stored = window.localStorage.getItem(PLATFORM_UI_KEYS.dashboardPeriod);
        return ["week", "month", "year"].includes(stored) ? stored : "week";
      } catch {
        return "week";
      }
    })()
  },
  shellStatus: {
    message: "",
    tone: ""
  },
  dashboardRequestId: 0,
  dashboardSnapshot: null,
  ai: {
    history: [],
    widgetBusy: false,
    moduleBusy: false
  },
  menu: {
    profileOpen: false
  }
};

const MODULES = {
  dashboard: {
    title: "Показатели",
    subtitle: "Ключевые показатели, активный график и сигналы по всей платформе.",
    type: "dashboard"
  },
  purchases: {
    title: "Закупки",
    subtitle: "Заказы поставщикам, приёмки, статусы поставок и автоматическая связь со складом.",
    type: "placeholder"
  },
  sales: {
    title: "Продажи",
    subtitle: "Текущий рабочий модуль с заказами, ЗП и лид-метриками.",
    type: "embed",
    src: () => `../prodazhi/index.html?v=${PLATFORM_BUILD}`
  },
  products: {
    title: "Товары",
    subtitle: "Каталог товаров и услуг: группы, поставщики, цены, маржинальность и карточки номенклатуры.",
    type: "placeholder"
  },
  crm: {
    title: "CRM",
    subtitle: "Живой коммерческий контур: сделки, стадии, карточки клиентов, вкладки и KPI-конструктор.",
    type: "placeholder"
  },
  warehouse: {
    title: "Склад",
    subtitle: "Живой складской контур: позиции, движения, резервы, дефицит и гибкие поля под ваш учет.",
    type: "placeholder"
  },
  money: {
    title: "Деньги",
    subtitle: "Приходы, расходы, статьи денег, контрагенты и перемещения по счетам.",
    type: "placeholder"
  },
  production: {
    title: "Производство",
    subtitle: "Производственные задания, сроки, ответственные, этапы и контур исполнения.",
    type: "placeholder"
  },
  my_calculator: {
    title: "Мой калькулятор",
    subtitle: "Личный расчет вывесок и связанные вкладки.",
    type: "embed",
    src: () => "../moy/index.html"
  },
  partner_calculator: {
    title: "Партнерский калькулятор",
    subtitle: "Персональный партнерский калькулятор с отдельным scope по ссылке.",
    type: "embed",
    src: () => {
      const slug = getCurrentPartnerSlug();
      return slug ? `../part/index.html?partner=${encodeURIComponent(slug)}` : "../part/index.html";
    }
  },
  light2: {
    title: "ДОМ НЕОНА",
    subtitle: "Финансовый и операционный контур компании внутри платформы.",
    type: "embed",
    src: () => `./light2/index.html?v=${PLATFORM_BUILD}`
  },
  board: {
    title: "Доска",
    subtitle: "Совместная визуальная доска для быстрых схем, заметок, планов и пространства команды.",
    type: "embed",
    src: () => `./board/index.html?v=${PLATFORM_BUILD}`
  },
  messenger: {
    title: "Мессенджер",
    subtitle: "Личные и групповые чаты команды.",
    type: "messenger"
  },
  admin: {
    title: "Админ-панель",
    subtitle: "Пользователи, роли, доступы и список партнеров.",
    type: "admin"
  },
  directories: {
    title: "Данные",
    subtitle: "Единые справочники и выпадающие списки для всей платформы.",
    type: "placeholder"
  },
  tasks: {
    title: "Тасктрекер",
    subtitle: "Живая доска задач: итерации, приоритеты, блокеры, кастомные колонки и представления.",
    type: "placeholder"
  },
  ai: {
    title: "Домовой Неоник",
    subtitle: "Корпоративный ИИ и база знаний компании.",
    type: "ai"
  }
};

const MODULE_PERMISSION_ALIASES = {
  products: "warehouse",
  purchases: "warehouse",
  money: "warehouse",
  production: "warehouse"
};

const domovoyNeonik = createDomovoyNeonik({
  build: PLATFORM_BUILD,
  getApiBaseUrl: () => getDomovoyApiBaseUrl(),
  getAccessToken: async () => {
    if (STATE.session?.access_token) return STATE.session.access_token;
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || "";
  }
});

const MODULE_GROUPS = [
  "dashboard",
  "purchases",
  "sales",
  "products",
  "crm",
  "warehouse",
  "money",
  "production",
  "my_calculator",
  "partner_calculator",
  "light2",
  "board",
  "directories",
  "tasks",
  "messenger",
  "admin",
  "ai"
];

const PERMISSION_FLAGS = [
  { key: "view", label: "Видит" },
  { key: "edit", label: "Редактирует" },
  { key: "manage", label: "Управляет" }
];

const DEFAULT_ROLE_TEMPLATES = [
  {
    role_key: "owner",
    display_name: "Владелец",
    description: "Полный доступ ко всей платформе.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: true, manage: true },
      sales: { view: true, edit: true, manage: true },
      my_calculator: { view: true, edit: true, manage: true },
      partner_calculator: { view: true, edit: true, manage: true },
      light2: { view: true, edit: true, manage: true },
      board: { view: true, edit: true, manage: true },
      messenger: { view: true, edit: true, manage: true },
      admin: { view: true, edit: true, manage: true },
      directories: { view: true, edit: true, manage: true },
      crm: { view: true, edit: true, manage: true },
      warehouse: { view: true, edit: true, manage: true },
      tasks: { view: true, edit: true, manage: true },
      ai: { view: true, edit: true, manage: true }
    }
  },
  {
    role_key: "admin",
    display_name: "Администратор",
    description: "Управляет пользователями, ролями и модулями.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: true, manage: true },
      sales: { view: true, edit: true, manage: true },
      my_calculator: { view: true, edit: true, manage: true },
      partner_calculator: { view: true, edit: true, manage: true },
      light2: { view: true, edit: true, manage: true },
      board: { view: true, edit: true, manage: true },
      messenger: { view: true, edit: true, manage: true },
      admin: { view: true, edit: true, manage: true },
      directories: { view: true, edit: true, manage: true },
      crm: { view: true, edit: true, manage: true },
      warehouse: { view: true, edit: true, manage: true },
      tasks: { view: true, edit: true, manage: true },
      ai: { view: true, edit: true, manage: true }
    }
  },
  {
    role_key: "manager",
    display_name: "Менеджер",
    description: "Работает с продажами и ключевыми рабочими инструментами.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: true, manage: false },
      sales: { view: true, edit: true, manage: false },
      my_calculator: { view: true, edit: true, manage: false },
      partner_calculator: { view: true, edit: true, manage: false },
      light2: { view: true, edit: true, manage: false },
      board: { view: true, edit: true, manage: false },
      directories: { view: true, edit: true, manage: false },
      messenger: { view: true, edit: true, manage: false }
    }
  },
  {
    role_key: "partner",
    display_name: "Партнер",
    description: "Видит только свой контур и партнерский калькулятор.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: false, manage: false },
      partner_calculator: { view: true, edit: true, manage: false },
      light2: { view: true, edit: false, manage: false },
      board: { view: true, edit: true, manage: false },
      messenger: { view: true, edit: true, manage: false }
    }
  },
  {
    role_key: "staff",
    display_name: "Сотрудник",
    description: "Работает внутри назначенных ему модулей.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: false, manage: false },
      directories: { view: true, edit: false, manage: false },
      board: { view: true, edit: true, manage: false },
      messenger: { view: true, edit: true, manage: false }
    }
  },
  {
    role_key: "viewer",
    display_name: "Наблюдатель",
    description: "Только просмотр без редактирования.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: false, manage: false }
    }
  },
  {
    role_key: "user",
    display_name: "Пользователь",
    description: "Базовый вход в систему.",
    is_system: true,
    module_permissions: {
      dashboard: { view: true, edit: false, manage: false }
    }
  }
];

const PLACEHOLDER_BLUEPRINTS = {
  crm: {
    eyebrow: "Коммерческий контур",
    intro:
      "CRM уже собрана как следующий слой над Продажами: здесь должна жить короткая воронка, карточка сделки, контроль менеджеров и гибкие интеграции с каналами заявок.",
    metrics: [
      { label: "Источник базы", value: "Продажи + ЛИД" },
      { label: "Карточка сделки", value: "Гибкая, под неон и вывески" },
      { label: "Автообновление", value: "Из заказов и лидов" }
    ],
    sections: [
      {
        title: "Что уже заложено",
        items: [
          "Быстрый переход из платформы и разграничение доступа по ролям.",
          "Связка с модулем Продажи как базовым источником заказов и счетов.",
          "Место под подключение каналов: Авито, сайт, рекомендации, мессенджеры."
        ]
      },
      {
        title: "Карточка продажи",
        items: [
          "Клиент, канал, ответственный, стадия, сумма, сроки, комментарии.",
          "История коммуникаций и закрепление файлов, счетов и договоров.",
          "Переход заказа в производство и в складские движения без двойного ввода."
        ]
      },
      {
        title: "Гибкие интеграции",
        items: [
          "Отдельный слой для каналов, чтобы позже добавить ответы из Авито прямо в карточке.",
          "Управляемые статусы и поля без жесткой привязки к одной воронке.",
          "Основа под API-подключения и собственные сценарии автоматизации."
        ]
      }
    ],
    lanes: [
      { title: "Новые лиды", items: ["Сайт / Авито", "Нужен первый контакт", "Новая заявка в работу"] },
      { title: "В работе", items: ["Квалификация", "Дизайн / КП", "Счет выставлен"] },
      { title: "Заказ", items: ["Счет оплачен", "Передано в производство", "Контроль исполнения"] }
    ],
    links: ["sales", "light2", "admin"]
  },
  warehouse: {
    eyebrow: "Операционный контур",
    intro:
      "Склад строится не отдельно, а как часть общей экосистемы: остатки, закупки, продажи и финансы должны видеть друг друга. Здесь закладываю рабочую структуру под это.",
    metrics: [
      { label: "Источник закупок", value: "ДОМ НЕОНА / Закупки" },
      { label: "Связь с калькуляторами", value: "Остатки и артикулы" },
      { label: "Финансы", value: "Поступления, закупки, маржа" }
    ],
    sections: [
      {
        title: "Что должен видеть склад",
        items: [
          "Остатки материалов, блоков питания, комплектующих и неона по цветам.",
          "Резервы под текущие заказы и предупреждения о дефиците.",
          "Связь с закупками, чтобы заказ материалов рождался из нехватки."
        ]
      },
      {
        title: "Как он свяжется с платформой",
        items: [
          "Продажи передают потребность и статус заказа.",
          "Калькуляторы используют те же группы товаров и артикулы.",
          "ДОМ НЕОНА отражает финансовую часть закупки и оплат."
        ]
      },
      {
        title: "Первый набор разделов",
        items: [
          "Остатки и движения.",
          "Поступления и списания.",
          "Закупки, финансы, графики расхода и маржинальность."
        ]
      }
    ],
    lanes: [
      { title: "Остатки", items: ["Критический остаток", "В резерве", "Доступно к продаже"] },
      { title: "Закупка", items: ["Нужно заказать", "У поставщика", "Принято на склад"] },
      { title: "Аналитика", items: ["Оборачиваемость", "Топ расходников", "Потери и дефицит"] }
    ],
    links: ["light2", "sales", "my_calculator"]
  },
  tasks: {
    eyebrow: "Контур исполнения",
    intro:
      "Тасктрекер будет держать в одном месте итерации, оценку задач и рабочие доски команды. Основа уже выделена как отдельный модуль платформы.",
    metrics: [
      { label: "Формат", value: "Канбан + итерации" },
      { label: "Оценка", value: "Через приоритет и загрузку" },
      { label: "Связь", value: "С CRM, складом и производством" }
    ],
    sections: [
      {
        title: "Что будет внутри",
        items: [
          "Общая доска задач по отделам и направлениям.",
          "Итерации и очередь задач на взятие в работу.",
          "Гибкие статусы, ответственные, сроки и блокеры."
        ]
      },
      {
        title: "Под ваш процесс",
        items: [
          "Отдельный слой под оценку задач из файла итераций.",
          "Разделение управленческих и производственных задач.",
          "Быстрые фильтры: срочно, ждет данных, заблокировано, готово к запуску."
        ]
      },
      {
        title: "Связи с модулями",
        items: [
          "Задача может рождаться из сделки, закупки или проблемы по заказу.",
          "Ответственный видит только свой контур по правам.",
          "Домовой Неоник сможет помогать с поиском информации по задаче."
        ]
      }
    ],
    lanes: [
      { title: "Очередь", items: ["Новая инициатива", "Нужна оценка", "Готово к старту"] },
      { title: "В работе", items: ["Исполнение", "Нужен ответ", "На проверке"] },
      { title: "Финиш", items: ["Сделано", "Архив", "Перенос в следующую итерацию"] }
    ],
    links: ["messenger", "admin", "ai"]
  },
  ai: {
    eyebrow: "Корпоративный ИИ",
    intro:
      "Домовой Неоник — внутренний помощник компании. Он должен знать только ваши процессы, документы, товары, регламенты и отвечать как внутренняя база знаний, а не как общий чат-бот.",
    metrics: [
      { label: "Назначение", value: "Внутренняя база знаний" },
      { label: "Источники", value: "Документы, регламенты, таблицы" },
      { label: "Режим", value: "Только внутри компании" }
    ],
    sections: [
      {
        title: "Что он должен уметь",
        items: [
          "Отвечать сотрудникам по товарам, процессам, ролям и внутренним правилам.",
          "Подсказывать, где в платформе лежит нужная информация.",
          "Помогать в онбординге новых сотрудников и партнеров."
        ]
      },
      {
        title: "Контур знаний",
        items: [
          "Документы компании, презентации, регламенты, таблицы и описания товаров.",
          "Выборочные данные из CRM, склада, задач и ДОМ НЕОНА.",
          "Гибкое разделение доступа: кому какие знания можно раскрывать."
        ]
      },
      {
        title: "Следующий шаг",
        items: [
          "Отдельный интерфейс чата внутри платформы.",
          "Загрузка и структурирование базы знаний.",
          "Привязка ответов к ролям, отделам и источникам."
        ]
      }
    ],
    lanes: [
      { title: "Источники", items: ["Регламенты", "Презентации", "Таблицы / справочники"] },
      { title: "Сценарии", items: ["Поиск ответа", "Подсказка по модулю", "Справка по процессу"] },
      { title: "Контроль", items: ["Ограничения доступа", "Проверка ответов", "Расширение базы"] }
    ],
    links: ["light2", "warehouse", "tasks"]
  }
};

const liveWorkspaceController = createLiveWorkspaceController({
  supabase,
  setStatus: setShellStatus,
  escapeHtml,
  hasModulePermission,
  hasModuleAccess,
  getPermissionBadgeLabel,
  getModuleStageLabel,
  modules: MODULES,
  rerenderCurrentModule: async () => {
    if (!liveWorkspaceController.supports(STATE.activeModule)) return;
    DOM.placeholderCard.innerHTML = await liveWorkspaceController.render(STATE.activeModule);
    liveWorkspaceController.afterRender(STATE.activeModule, DOM.placeholderCard);
    DOM.placeholderView.classList.remove("d-none");
  },
  rerenderDashboard: () => {
    if (STATE.activeModule === "dashboard") {
      void renderDashboard();
    }
  },
  schemaReadyProvider: () => STATE.schemaReady
});

function setAuthStatus(message, tone = "") {
  DOM.authStatus.textContent = message;
  DOM.authStatus.className = `status-box${tone ? " " + tone : ""}`;
  if (!DOM.appShell.classList.contains("d-none")) {
    STATE.shellStatus = {
      message: String(message || "").trim(),
      tone: tone || ""
    };
    renderShellStatus();
  }
}

function renderShellStatus() {
  if (!DOM.platformStatus || !DOM.platformStatusSection) return;
  const hasMessage = Boolean(STATE.shellStatus.message);
  DOM.platformStatusSection.classList.toggle("d-none", !hasMessage);
  if (!hasMessage) {
    DOM.platformStatus.textContent = "";
    DOM.platformStatus.className = "status-box";
    return;
  }
  DOM.platformStatus.textContent = STATE.shellStatus.message;
  DOM.platformStatus.className = `status-box${STATE.shellStatus.tone ? " " + STATE.shellStatus.tone : ""}`;
}

function setShellStatus(message, tone = "") {
  STATE.shellStatus = {
    message: String(message || "").trim(),
    tone: tone || ""
  };
  renderShellStatus();
}

function clearShellStatus() {
  STATE.shellStatus = { message: "", tone: "" };
  renderShellStatus();
}

const DASHBOARD_MONEY_FORMATTER = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

const DASHBOARD_NUMBER_FORMATTER = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0
});

function readStoredBoolean(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored === "true";
  } catch {
    return fallback;
  }
}

function readStoredModuleKey() {
  try {
    const stored = window.localStorage.getItem(PLATFORM_UI_KEYS.activeModule);
    return stored ? String(stored) : "dashboard";
  } catch {
    return "dashboard";
  }
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function getModuleShortLabel(key) {
  const labels = {
    dashboard: "Показ.",
    purchases: "Закуп.",
    sales: "Прод.",
    products: "Товары",
    crm: "CRM",
    warehouse: "Склад",
    money: "Деньги",
    production: "Произв.",
    my_calculator: "Мой",
    partner_calculator: "Парт.",
    light2: "Контур",
    board: "Доска",
    messenger: "Чаты",
    admin: "Админ",
    directories: "Спр.",
    tasks: "Задачи",
    ai: "Неоник"
  };
  return labels[key] || "Модуль";
}

function getModuleIconClass(key) {
  const icons = {
    dashboard: "bi-graph-up-arrow",
    purchases: "bi-cart-check",
    sales: "bi-bag-check",
    products: "bi-box2",
    crm: "bi-kanban",
    warehouse: "bi-box-seam",
    money: "bi-wallet2",
    production: "bi-gear-wide-connected",
    my_calculator: "bi-calculator",
    partner_calculator: "bi-people",
    light2: "bi-building",
    board: "bi-easel2",
    messenger: "bi-chat-dots",
    admin: "bi-shield-check",
    directories: "bi-sliders2",
    tasks: "bi-list-check",
    ai: "bi-stars"
  };
  return icons[key] || "bi-grid";
}

function persistShellUi() {
  try {
    window.localStorage.setItem(PLATFORM_UI_KEYS.wideMode, String(STATE.ui.wideMode));
    window.localStorage.setItem(PLATFORM_UI_KEYS.sidebarCollapsed, String(STATE.ui.sidebarCollapsed));
  } catch {
    // Ignore storage failures in browser privacy modes.
  }
}

function persistActiveModule() {
  try {
    window.localStorage.setItem(PLATFORM_UI_KEYS.activeModule, STATE.activeModule || "dashboard");
  } catch {
    // Ignore storage failures in browser privacy modes.
  }
}

function applyShellMode() {
  document.body.classList.toggle("platform-wide", STATE.ui.wideMode);
  DOM.appShell.classList.toggle("sidebar-collapsed", Boolean(STATE.ui.sidebarCollapsed && DOM.sidebarToggleButton));

  if (DOM.sidebarToggleButton) {
    DOM.sidebarToggleButton.textContent = STATE.ui.sidebarCollapsed ? "Показать меню" : "Свернуть меню";
    DOM.sidebarToggleButton.classList.toggle("btn-dark", STATE.ui.sidebarCollapsed);
    DOM.sidebarToggleButton.classList.toggle("btn-outline-dark", !STATE.ui.sidebarCollapsed);
  }

  if (DOM.wideModeButton) {
    DOM.wideModeButton.textContent = STATE.ui.wideMode ? "Обычная ширина" : "Широкий режим";
    DOM.wideModeButton.classList.toggle("btn-dark", STATE.ui.wideMode);
    DOM.wideModeButton.classList.toggle("btn-outline-dark", !STATE.ui.wideMode);
  }
}

function toggleSidebarCollapsed() {
  STATE.ui.sidebarCollapsed = !STATE.ui.sidebarCollapsed;
  persistShellUi();
  applyShellMode();
}

function toggleWideMode() {
  STATE.ui.wideMode = !STATE.ui.wideMode;
  persistShellUi();
  applyShellMode();
  renderProfileCard();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value ?? {}));
}

function createEmptyPermissionMap() {
  return MODULE_GROUPS.reduce((acc, key) => {
    acc[key] = { view: false, edit: false, manage: false };
    return acc;
  }, {});
}

function applyPermissionAliases(permissionMap, explicitKeys = new Set()) {
  const next = cloneJson(permissionMap);
  Object.entries(MODULE_PERMISSION_ALIASES).forEach(([aliasKey, parentKey]) => {
    if (explicitKeys.has(aliasKey)) return;
    const parent = next[parentKey];
    if (!parent) return;
    const hasParentAccess = parent.view || parent.edit || parent.manage;
    if (!hasParentAccess) return;
    next[aliasKey] = { ...parent };
  });
  return next;
}

function normalizeModulePermissions(rawPermissions, fallbackModules = []) {
  const base = createEmptyPermissionMap();
  const explicitKeys = new Set();
  if (rawPermissions && typeof rawPermissions === "object" && !Array.isArray(rawPermissions)) {
    Object.entries(rawPermissions).forEach(([key, value]) => {
      if (!base[key]) return;
      explicitKeys.add(key);
      base[key] = {
        view: Boolean(value?.view),
        edit: Boolean(value?.edit),
        manage: Boolean(value?.manage)
      };
    });
  }
  if (Array.isArray(fallbackModules)) {
    fallbackModules.forEach((key) => {
      if (base[key]) {
        base[key].view = true;
        base[key].edit = true;
      }
    });
  }
  base.dashboard.view = true;
  return applyPermissionAliases(base, explicitKeys);
}

function permissionsToAllowedModules(permissions) {
  return MODULE_GROUPS.filter((key) => permissions?.[key]?.view);
}

function getRoleTemplate(roleKey) {
  return STATE.roleTemplates.find((role) => role.role_key === roleKey) || null;
}

function getProfilePermissionMap(profile = STATE.profile) {
  const roleKey = profile?.role || "user";
  if (roleKey === "owner" || roleKey === "admin") {
    return MODULE_GROUPS.reduce((acc, key) => {
      acc[key] = { view: true, edit: true, manage: true };
      return acc;
    }, {});
  }

  const template = getRoleTemplate(roleKey);
  const templatePermissions = normalizeModulePermissions(
    template?.module_permissions,
    Array.isArray(template?.allowed_modules) ? template.allowed_modules : []
  );
  const ownPermissions = normalizeModulePermissions(profile?.module_permissions, profile?.allowed_modules);
  const hasOwnPermissions =
    profile?.module_permissions &&
    typeof profile.module_permissions === "object" &&
    !Array.isArray(profile.module_permissions) &&
    Object.keys(profile.module_permissions).length > 0;
  const effective = hasOwnPermissions ? ownPermissions : templatePermissions;
  effective.dashboard.view = true;
  return effective;
}

function summarizeModuleAccess(profile) {
  const permissions = getProfilePermissionMap(profile);
  return MODULE_GROUPS.filter((key) => permissions[key]?.view)
    .map((key) => MODULES[key]?.title || key)
    .join(", ");
}

function formatDateTime(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function formatDashboardMoney(value) {
  return DASHBOARD_MONEY_FORMATTER.format(Number(value) || 0);
}

function formatDashboardNumber(value) {
  return DASHBOARD_NUMBER_FORMATTER.format(Number(value) || 0);
}

function persistDashboardPeriod() {
  try {
    window.localStorage.setItem(PLATFORM_UI_KEYS.dashboardPeriod, STATE.ui.dashboardPeriod);
  } catch {
    // Ignore storage failures in private browsing modes.
  }
}

function setDashboardPeriod(periodKey) {
  if (!["week", "month", "year"].includes(periodKey)) return;
  STATE.ui.dashboardPeriod = periodKey;
  persistDashboardPeriod();
  if (STATE.activeModule === "dashboard") {
    renderDashboard().catch((error) => console.error("dashboard rerender error", error));
  }
}

function buildDashboardChartAttrs(point) {
  return `
    data-chart-label="${escapeHtml(point.label || "")}"
    data-chart-full-label="${escapeHtml(point.fullLabel || point.label || "")}"
    data-chart-orders="${escapeHtml(String(point.orders || 0))}"
    data-chart-revenue="${escapeHtml(String(point.revenue || 0))}"
    data-chart-invoices="${escapeHtml(String(point.invoices || 0))}"
  `;
}

function getDashboardTooltipPoint(target) {
  if (!target?.dataset?.chartLabel) return null;
  return {
    label: target.dataset.chartLabel,
    fullLabel: target.dataset.chartFullLabel || target.dataset.chartLabel,
    orders: Number(target.dataset.chartOrders || 0),
    revenue: Number(target.dataset.chartRevenue || 0),
    invoices: Number(target.dataset.chartInvoices || 0)
  };
}

function hideDashboardTooltip() {
  const tooltip = DOM.dashboardGrid.querySelector(".dashboard-tooltip");
  if (!tooltip) return;
  tooltip.classList.add("d-none");
}

function showDashboardTooltip(event, point) {
  const tooltip = DOM.dashboardGrid.querySelector(".dashboard-tooltip");
  const chartCard = event.target.closest(".dashboard-chart-card");
  if (!tooltip || !chartCard || !point) return;

  tooltip.innerHTML = `
    <strong>${escapeHtml(point.fullLabel || point.label || "Период")}</strong>
    <span>Заказов: ${escapeHtml(formatDashboardNumber(point.orders))}</span>
    <span>Выручка: ${escapeHtml(formatDashboardMoney(point.revenue))}</span>
    <span>Счетов: ${escapeHtml(formatDashboardNumber(point.invoices))}</span>
  `;

  const rect = chartCard.getBoundingClientRect();
  const left = Math.min(
    Math.max(event.clientX - rect.left + 16, 16),
    rect.width - 220
  );
  const top = Math.max(event.clientY - rect.top - 18, 18);

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
  tooltip.classList.remove("d-none");
}

function getAiQuickQuestions() {
  return [
    "Где в платформе смотреть неоплаченные счета?",
    "Как связаны CRM, склад и задачи?",
    "Что есть на сайте domneon.ru для клиента?",
    "Где настраивать роли, доступы и выпадающие списки?"
  ];
}

function buildAiContext() {
  return {
    snapshot: STATE.dashboardSnapshot || null,
    profile: {
      displayName:
        STATE.profile?.display_name ||
        STATE.profile?.full_name ||
        STATE.user?.user_metadata?.display_name ||
        STATE.user?.email ||
        "Сотрудник",
      role: STATE.profile?.role || "user",
      partnerSlug: getCurrentPartnerSlug()
    },
    modules: moduleListFromProfile().map((key) => ({
      key,
      title: MODULES[key]?.title || key,
      subtitle: MODULES[key]?.subtitle || ""
    })),
    documents: {
      directories: liveWorkspaceController.getDocument("directories"),
      crm: liveWorkspaceController.getDocument("crm"),
      warehouse: liveWorkspaceController.getDocument("warehouse"),
      tasks: liveWorkspaceController.getDocument("tasks")
    },
    history: STATE.ai.history
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.body || ""
      }))
  };
}

function renderAiMessages(items, tokens = []) {
  if (!items.length) {
    return `
      <div class="ai-empty-state">
        <strong>Домовой Неоник готов к вопросам.</strong>
        <p>Спрашивайте про платформу, процессы компании, 24lite.ru, domneon.ru, склад, CRM, задачи и регламенты.</p>
      </div>
    `;
  }

  return items
    .map((item) => {
      const sources = (item.sources || [])
        .map(
          (source) =>
            source.url && !String(source.url).startsWith("platform://")
              ? `
                  <a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer noopener">
                    ${escapeHtml(source.sourceLabel || source.title || "Источник")}
                  </a>
                `
              : `
                  <span>${escapeHtml(source.sourceLabel || source.title || "Источник")}</span>
                `
        )
        .join("");

      return `
        <article class="ai-message ai-message--${escapeHtml(item.role)}">
          <div class="ai-message__role">${item.role === "user" ? "Вы" : "Домовой Неоник"}</div>
          <div class="ai-message__body">${domovoyNeonik.highlightText(escapeHtml(item.body || ""), tokens).replace(/\n/g, "<br>")}</div>
          ${sources ? `<div class="ai-message__sources">${sources}</div>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderAiWidget() {
  if (!DOM.aiWidgetPanel) return;
  if (!DOM.aiWidgetPanel.querySelector("#aiWidgetMessages")) {
    DOM.aiWidgetPanel.insertAdjacentHTML(
      "beforeend",
      `
        <div class="ai-widget__suggestions"></div>
        <div class="ai-widget__messages" id="aiWidgetMessages"></div>
        <form class="ai-widget__form" id="aiWidgetForm">
          <textarea class="form-control form-control-sm" id="aiWidgetInput" name="question" rows="2" placeholder="Задайте вопрос по платформе, процессу, модулю или сайту компании"></textarea>
          <div class="ai-widget__actions">
            <button class="btn btn-dark btn-sm" type="submit">Спросить</button>
            <button class="btn btn-outline-dark btn-sm" type="button" data-ai-open="ai">Открыть модуль</button>
          </div>
        </form>
        <div class="ai-widget__footer">
          <button class="btn btn-outline-secondary btn-sm" type="button" data-ai-open="crm">CRM</button>
          <button class="btn btn-outline-secondary btn-sm" type="button" data-ai-open="warehouse">Склад</button>
          <button class="btn btn-outline-secondary btn-sm" type="button" data-ai-open="directories">Данные</button>
        </div>
      `
    );
  }

  const messagesContainer = DOM.aiWidgetPanel.querySelector("#aiWidgetMessages");
  const form = DOM.aiWidgetPanel.querySelector("#aiWidgetForm");
  const input = DOM.aiWidgetPanel.querySelector("#aiWidgetInput");
  const lastAssistant = [...STATE.ai.history].reverse().find((item) => item.role === "assistant");
  const tokens = lastAssistant?.highlights || [];

  messagesContainer.innerHTML = renderAiMessages(STATE.ai.history.slice(-4), tokens);

  const suggestions = getAiQuickQuestions()
    .map(
      (question) => `
        <button class="ai-widget__suggestion" type="button" data-ai-suggest="${escapeHtml(question)}">${escapeHtml(question)}</button>
      `
    )
    .join("");

  const suggestionRow = DOM.aiWidgetPanel.querySelector(".ai-widget__suggestions");
  if (suggestionRow) {
    suggestionRow.innerHTML = suggestions;
  }

  if (input) {
    input.disabled = STATE.ai.widgetBusy;
  }
  if (form) {
    const button = form.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = STATE.ai.widgetBusy;
      button.textContent = STATE.ai.widgetBusy ? "Ищу..." : "Спросить";
    }
  }
}

function renderAiModule() {
  const lastAssistant = [...STATE.ai.history].reverse().find((item) => item.role === "assistant");
  const tokens = lastAssistant?.highlights || [];
  const apiBaseUrl = getDomovoyApiBaseUrl();
  const apiConfigured = Boolean(apiBaseUrl);
  const suggestions = getAiQuickQuestions()
    .map(
      (question) => `
        <button class="ai-prompt-chip" type="button" data-ai-suggest="${escapeHtml(question)}">${escapeHtml(question)}</button>
      `
    )
    .join("");

  DOM.placeholderCard.innerHTML = `
    <section class="ai-assistant-shell">
      <article class="ai-assistant-hero">
        <div>
          <div class="section-eyebrow">Внутренний ИИ компании</div>
          <h2>Домовой Неоник</h2>
          <p>База знаний для сотрудников и партнеров: отвечает по платформе, рабочим процессам, внутренним данным, архиву знаний Olesia и по публичным материалам с 24lite.ru и domneon.ru.</p>
          <div class="compact-help mt-2">
            ${apiConfigured
              ? `Серверный ИИ подключён: ${escapeHtml(apiBaseUrl)}`
              : "Сейчас включён локальный резервный режим. Чтобы Домовой отвечал как полноценный ИИ, укажите API в админ-панели."}
          </div>
        </div>
        <div class="ai-assistant-hero__side">
          <div class="ai-assistant-badges">
            <span>Платформа</span>
            <span>24lite.ru</span>
            <span>domneon.ru</span>
            <span>Архив Olesia</span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" type="button" data-ai-close>
            <i class="bi bi-x-lg"></i>
            <span>Закрыть</span>
          </button>
        </div>
      </article>

      <div class="ai-assistant-grid">
        <aside class="ai-assistant-side">
          <div class="section-card">
            <h3>Быстрые вопросы</h3>
            <div class="ai-prompt-list">${suggestions}</div>
          </div>
          <div class="section-card">
            <h3>Что умеет</h3>
            <ul class="ai-capability-list">
              <li>Подсказывает, где в платформе делать нужное действие.</li>
              <li>Ищет ответы в данных платформы, архиве Olesia и по публичным сайтам компании.</li>
              <li>Объясняет связи между CRM, Продажами, Складом, задачами и ДОМ НЕОНА.</li>
            </ul>
          </div>
        </aside>

        <section class="ai-assistant-main">
          <div class="section-card ai-chat-card">
            <div class="panel-heading">
              <div>
                <h3>Диалог с базой знаний</h3>
                <div class="compact-help">Задавайте вопросы так же, как коллеге: коротко и по делу.</div>
              </div>
            </div>
            <div class="ai-chat-log" id="aiModuleMessages">${renderAiMessages(STATE.ai.history, tokens)}</div>
            <form class="ai-chat-form" id="aiModuleForm">
              <textarea class="form-control" id="aiModuleInput" name="question" rows="3" placeholder="Например: где смотреть неоплаченные счета и как это связано с CRM?" ${STATE.ai.moduleBusy ? "disabled" : ""}></textarea>
              <div class="ai-chat-form__actions">
                <button class="btn btn-dark" type="submit" ${STATE.ai.moduleBusy ? "disabled" : ""}>${STATE.ai.moduleBusy ? "Ищу ответ..." : "Спросить"}</button>
                <button class="btn btn-outline-secondary" type="button" data-ai-clear>Очистить диалог</button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </section>
  `;
}

async function askDomovoyNeonik(question, origin = "module") {
  const cleanQuestion = String(question || "").trim();
  if (!cleanQuestion) return;

  STATE.ai.history.push({
    role: "user",
    body: cleanQuestion,
    createdAt: new Date().toISOString(),
    sources: []
  });

  if (origin === "widget") {
    STATE.ai.widgetBusy = true;
  } else {
    STATE.ai.moduleBusy = true;
  }

  renderAiWidget();
  if (STATE.activeModule === "ai") {
    renderAiModule();
  }

  try {
    const context = buildAiContext();
    context.history = STATE.ai.history
      .slice(0, -1)
      .filter((item) => item.role === "user" || item.role === "assistant")
      .slice(-8)
      .map((item) => ({
        role: item.role,
        content: item.body || ""
      }));
    const response = await domovoyNeonik.ask(cleanQuestion, context);
    STATE.ai.history.push({
      role: "assistant",
      body: response.answer,
      createdAt: new Date().toISOString(),
      sources: response.sources || [],
      highlights: response.highlights || []
    });
  } catch (error) {
    STATE.ai.history.push({
      role: "assistant",
      body: `Не удалось собрать ответ: ${error.message || "ошибка поиска по базе знаний"}.`,
      createdAt: new Date().toISOString(),
      sources: []
    });
  } finally {
    if (STATE.ai.history.length > 18) {
      STATE.ai.history = STATE.ai.history.slice(-18);
    }
    STATE.ai.widgetBusy = false;
    STATE.ai.moduleBusy = false;
    renderAiWidget();
    if (STATE.activeModule === "ai") {
      renderAiModule();
    }
  }
}

function buildDashboardChartGeometry(points) {
  const chartWidth = 720;
  const chartHeight = 240;
  const paddingX = 34;
  const paddingTop = 24;
  const paddingBottom = 26;
  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const revenueMax = Math.max(...points.map((point) => Number(point.revenue) || 0), 1);
  const ordersMax = Math.max(...points.map((point) => Number(point.orders) || 0), 1);
  const stepX = points.length > 1 ? innerWidth / (points.length - 1) : innerWidth;
  const barWidth = Math.max(22, Math.min(40, innerWidth / Math.max(points.length * 1.8, 1)));

  const dots = points.map((point, index) => {
    const x = paddingX + stepX * index;
    const y = paddingTop + innerHeight - ((Number(point.revenue) || 0) / revenueMax) * innerHeight;
    return {
      x,
      y,
      point
    };
  });

  const polyline = dots
    .map((point, index) => {
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const area = polyline
    ? `${paddingX},${chartHeight - paddingBottom} ${polyline} ${paddingX + stepX * Math.max(points.length - 1, 0)},${chartHeight - paddingBottom}`
    : "";

  const bars = points.map((point, index) => {
    const barHeight = ((Number(point.orders) || 0) / ordersMax) * (innerHeight * 0.68);
    const x = paddingX + stepX * index - barWidth / 2;
    const y = chartHeight - paddingBottom - barHeight;
    return {
      x,
      y,
      width: barWidth,
      height: barHeight,
      point
    };
  });

  const gridLines = Array.from({ length: 4 }, (_, index) => {
    const factor = index / 3;
    const y = paddingTop + innerHeight * factor;
    return { y, value: formatDashboardMoney(revenueMax - revenueMax * factor) };
  });

  return {
    chartWidth,
    chartHeight,
    polyline,
    area,
    bars,
    dots,
    gridLines
  };
}

function moduleListFromProfile() {
  if (STATE.profile?.role === "admin" || STATE.profile?.role === "owner") return MODULE_GROUPS;
  const permissions = getProfilePermissionMap();
  const visible = permissionsToAllowedModules(permissions)
    .filter((key) => MODULES[key])
    .filter((key) => key !== "admin" || Boolean(permissions.admin?.manage));
  if (visible.length) return visible;
  return ["dashboard"];
}

function hasModulePermission(key, flag = "view", profile = STATE.profile) {
  if (!MODULES[key]) return false;
  if (profile?.role === "owner" || profile?.role === "admin") return true;
  const permissions = getProfilePermissionMap(profile);
  return Boolean(permissions?.[key]?.[flag]);
}

function hasModuleAccess(key) {
  return hasModulePermission(key, "view") && moduleListFromProfile().includes(key);
}

function isAdmin() {
  return hasModulePermission("admin", "manage");
}

function getCurrentPartnerSlug() {
  if (STATE.profile?.partner_slug) return STATE.profile.partner_slug;
  const ownPartner = STATE.partnerProfiles.find((partner) => partner.owner_user_id === STATE.user?.id);
  return ownPartner?.slug || "";
}

function buildPartnerCalculatorUrl(slug) {
  return `../part/index.html?partner=${encodeURIComponent(slug)}`;
}

function isMessengerPolicyRecursion(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("infinite recursion detected in policy") &&
    (message.includes("app_thread_members") || message.includes("app_threads") || message.includes("app_messages"))
  );
}

function isSchemaMissing(error) {
  const message = (error?.message || "").toLowerCase();
  return (
    error?.code === "42P01" ||
    message.includes("does not exist") ||
    message.includes('relation "app_profiles"') ||
    message.includes("app_profiles")
  );
}

function showAuthPane(key) {
  const buttons = DOM.authTabs.querySelectorAll("[data-auth-pane]");
  buttons.forEach((button) => {
    button.classList.toggle("active", button.dataset.authPane === key);
  });

  document.querySelectorAll(".auth-pane").forEach((pane) => {
    pane.classList.toggle("active", pane.id === `pane-${key}`);
  });
}

function showAuthScreen() {
  DOM.authScreen.classList.remove("d-none");
  DOM.appShell.classList.add("d-none");
  clearShellStatus();
}

function showAppShell() {
  DOM.authScreen.classList.add("d-none");
  DOM.appShell.classList.remove("d-none");
  applyShellMode();
  renderShellStatus();
}

function renderSchemaWarning() {
  if (STATE.schemaReady) {
    DOM.schemaWarningSection.innerHTML = "";
    return;
  }

  DOM.schemaWarningSection.innerHTML = `
    <div class="schema-warning">
      <strong>Платформа еще не инициализирована в Supabase.</strong>
      <div class="mt-2">Нужно выполнить SQL-файл <code>platform_setup.sql</code> в Supabase SQL Editor, после чего обновить страницу.</div>
      <div class="mt-2">Техническая деталь: ${escapeHtml(STATE.schemaError || "таблицы платформы не найдены")}</div>
    </div>
  `;
}

function renderProfileCard() {
  const displayName =
    STATE.profile?.display_name ||
    STATE.profile?.full_name ||
    STATE.user?.user_metadata?.display_name ||
    STATE.user?.email ||
    "Пользователь";

  const roleKey = STATE.profile?.role || (STATE.schemaReady ? "user" : "standalone");
  const role = getRoleTemplate(roleKey)?.display_name || roleKey;
  const partnerSlug = getCurrentPartnerSlug();
  const initials = String(displayName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2) || "DN";

  DOM.profileCard.innerHTML = `
    <div class="profile-card__inner">
      <div class="profile-card__avatar">${escapeHtml(initials)}</div>
      <div class="profile-card__meta">
        <strong>${escapeHtml(displayName)}</strong>
        <span>${escapeHtml(STATE.user?.email || "—")}</span>
        <div class="profile-card__foot">
          <span class="role-pill">${escapeHtml(role)}</span>
          <span class="profile-card__scope">контур: ${escapeHtml(partnerSlug || "общий")}</span>
        </div>
      </div>
      <div class="profile-card__menu">
        <button class="profile-card__menu-toggle" type="button" data-profile-menu-toggle aria-expanded="${STATE.menu.profileOpen ? "true" : "false"}" aria-label="Открыть меню профиля">
          <i class="bi bi-three-dots"></i>
        </button>
        <div class="profile-card__dropdown${STATE.menu.profileOpen ? "" : " d-none"}">
          <button class="profile-card__action" type="button" data-profile-action="wide">
            <i class="bi ${STATE.ui.wideMode ? "bi-arrows-angle-contract" : "bi-arrows-angle-expand"}"></i>
            <span>${STATE.ui.wideMode ? "Обычная ширина" : "Широкий режим"}</span>
          </button>
          <button class="profile-card__action" type="button" data-profile-action="refresh">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Обновить</span>
          </button>
          <button class="profile-card__action profile-card__action--danger" type="button" data-profile-action="signout">
            <i class="bi bi-box-arrow-right"></i>
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderModuleNav() {
  DOM.moduleNav.innerHTML = "";
  DOM.moduleNav.classList.add("module-nav--top");
  moduleListFromProfile().forEach((key) => {
    const shortLabel = getModuleShortLabel(key);
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.moduleKey = key;
    button.dataset.shortLabel = shortLabel;
    button.title = MODULES[key].title;
    button.setAttribute("aria-label", MODULES[key].title);
    button.classList.toggle("active", STATE.activeModule === key);
    button.innerHTML = `
      <span class="module-nav-icon"><i class="bi ${escapeHtml(getModuleIconClass(key))}"></i></span>
      <span class="module-nav-main">${escapeHtml(shortLabel)}</span>
      <span class="module-nav-mini">${escapeHtml(MODULES[key].title)}</span>
    `;
    DOM.moduleNav.appendChild(button);
  });
}

function getModuleStageLabel(moduleKey) {
  const labels = {
    purchases: "Живой рабочий модуль",
    sales: "Рабочий модуль",
    products: "Живой рабочий модуль",
    crm: "Живой рабочий модуль",
    warehouse: "Живой рабочий модуль",
    money: "Живой рабочий модуль",
    production: "Живой рабочий модуль",
    my_calculator: "Рабочий модуль",
    partner_calculator: "Рабочий модуль",
    light2: "Активно развивается",
    board: "Совместная доска",
    messenger: "Базовая версия",
    admin: "Управляющий модуль",
    directories: "Единый слой данных",
    tasks: "Живой рабочий модуль",
    ai: "База знаний"
  };
  return labels[moduleKey] || "Доступен";
}

function getPermissionBadgeLabel(moduleKey, profile = STATE.profile) {
  if (!hasModulePermission(moduleKey, "view", profile)) return "Нет доступа";
  if (hasModulePermission(moduleKey, "manage", profile)) return "Управление";
  if (hasModulePermission(moduleKey, "edit", profile)) return "Редактирование";
  return "Просмотр";
}

function summarizePermissionStats(permissions) {
  return MODULE_GROUPS.reduce(
    (acc, key) => {
      if (permissions[key]?.view) acc.view += 1;
      if (permissions[key]?.edit) acc.edit += 1;
      if (permissions[key]?.manage) acc.manage += 1;
      return acc;
    },
    { view: 0, edit: 0, manage: 0 }
  );
}

function getPermissionMapFromForm(container, mode) {
  const permissions = createEmptyPermissionMap();
  container?.querySelectorAll(`[data-${mode}-module]`).forEach((input) => {
    const moduleKey = input.dataset[`${mode}Module`];
    const permKey = input.dataset[`${mode}Perm`];
    if (!permissions[moduleKey]) return;
    permissions[moduleKey][permKey] = input.checked;
  });
  return normalizePermissionDependencies(permissions);
}

function normalizePermissionDependencies(permissions) {
  const next = cloneJson(permissions);
  MODULE_GROUPS.forEach((key) => {
    if (!next[key]) {
      next[key] = { view: false, edit: false, manage: false };
    }
    if (next[key].manage) {
      next[key].edit = true;
      next[key].view = true;
    } else if (next[key].edit) {
      next[key].view = true;
    } else if (!next[key].view) {
      next[key].edit = false;
      next[key].manage = false;
    }
  });
  next.dashboard.view = true;
  return next;
}

function applyPermissionPreset(permissions, preset) {
  const next = createEmptyPermissionMap();
  if (preset === "all") {
    MODULE_GROUPS.forEach((key) => {
      next[key] = { view: true, edit: true, manage: true };
    });
  } else if (preset === "view") {
    MODULE_GROUPS.forEach((key) => {
      next[key] = { view: true, edit: false, manage: false };
    });
  } else if (preset === "work") {
    MODULE_GROUPS.forEach((key) => {
      next[key] = { view: true, edit: true, manage: false };
    });
    next.admin = { view: false, edit: false, manage: false };
    next.ai = { view: true, edit: false, manage: false };
  } else {
    return normalizePermissionDependencies(next);
  }
  return normalizePermissionDependencies(next);
}

function renderPermissionSummary(permissions, mode) {
  const stats = summarizePermissionStats(permissions);
  return `
    <div class="permission-summary">
      <div class="permission-summary__stats">
        <div class="permission-stat">
          <span>Видит</span>
          <strong>${escapeHtml(String(stats.view))}</strong>
        </div>
        <div class="permission-stat">
          <span>Редактирует</span>
          <strong>${escapeHtml(String(stats.edit))}</strong>
        </div>
        <div class="permission-stat">
          <span>Управляет</span>
          <strong>${escapeHtml(String(stats.manage))}</strong>
        </div>
      </div>
      <div class="permission-toolbar">
        <button class="btn btn-sm btn-outline-dark" type="button" data-${mode}-preset="all">Полный доступ</button>
        <button class="btn btn-sm btn-outline-dark" type="button" data-${mode}-preset="work">Рабочий доступ</button>
        <button class="btn btn-sm btn-outline-dark" type="button" data-${mode}-preset="view">Только просмотр</button>
        <button class="btn btn-sm btn-outline-secondary" type="button" data-${mode}-preset="clear">Сбросить</button>
      </div>
    </div>
  `;
}

function renderPlaceholderModule(moduleKey) {
  const module = MODULES[moduleKey];
  const blueprint = PLACEHOLDER_BLUEPRINTS[moduleKey];
  if (!module || !blueprint) {
    DOM.placeholderCard.innerHTML = `
      <h3>${escapeHtml(module?.title || "Модуль")}</h3>
      <p class="mb-0 text-muted">Модуль уже заложен в платформу как место подключения. Следующим этапом сюда будем переносить бизнес-логику.</p>
    `;
    return;
  }

  const permissionLabel = getPermissionBadgeLabel(moduleKey);
  const relatedLinks = blueprint.links
    .filter((key) => hasModuleAccess(key))
    .map(
      (key) => `
        <button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="${escapeHtml(key)}">
          ${escapeHtml(MODULES[key].title)}
        </button>
      `
    )
    .join("");

  DOM.placeholderCard.innerHTML = `
    <div class="placeholder-shell">
      <div class="placeholder-hero">
        <div>
          <div class="placeholder-eyebrow">${escapeHtml(blueprint.eyebrow)}</div>
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(blueprint.intro)}</p>
        </div>
        <div class="placeholder-status">
          <div class="placeholder-chip">${escapeHtml(getModuleStageLabel(moduleKey))}</div>
          <div class="placeholder-chip">${escapeHtml(permissionLabel)}</div>
        </div>
      </div>

      <div class="placeholder-metrics">
        ${blueprint.metrics
          .map(
            (item) => `
              <article class="placeholder-metric">
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="placeholder-sections">
        ${blueprint.sections
          .map(
            (section) => `
              <article class="placeholder-panel">
                <h4>${escapeHtml(section.title)}</h4>
                <ul class="placeholder-list">
                  ${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
                </ul>
              </article>
            `
          )
          .join("")}
      </div>

      <div class="placeholder-board">
        ${blueprint.lanes
          .map(
            (lane) => `
              <article class="placeholder-lane">
                <h4>${escapeHtml(lane.title)}</h4>
                ${lane.items.map((item) => `<div class="placeholder-task">${escapeHtml(item)}</div>`).join("")}
              </article>
            `
          )
          .join("")}
      </div>

      <div class="placeholder-links">
        <div class="compact-help">Связанные модули платформы</div>
        <div class="d-flex flex-wrap gap-2">${relatedLinks || '<span class="text-muted">Связанные модули появятся после выдачи доступов.</span>'}</div>
      </div>
    </div>
  `;
}

function renderDashboardModuleCards(moduleKeys, summaryLookup = {}) {
  return moduleKeys
    .map((key) => {
      const module = MODULES[key];
      const summary = summaryLookup[key] || liveWorkspaceController.getDashboardSummary(key) || module.subtitle;
      return `
        <article class="dashboard-module-card">
          <div class="dashboard-module-card__top">
            <div class="dashboard-module-card__icon"><i class="bi ${escapeHtml(getModuleIconClass(key))}"></i></div>
            <div>
              <h4>${escapeHtml(module.title)}</h4>
              <div class="dashboard-module-card__meta">${escapeHtml(getModuleStageLabel(key))} • ${escapeHtml(getPermissionBadgeLabel(key))}</div>
            </div>
          </div>
          <p>${escapeHtml(summary)}</p>
          <button class="btn btn-dark btn-sm" type="button" data-dashboard-open="${escapeHtml(key)}">Открыть</button>
        </article>
      `;
    })
    .join("");
}

async function renderDashboard() {
  const requestId = ++STATE.dashboardRequestId;
  const moduleKeys = moduleListFromProfile().filter((key) => key !== "dashboard");
  setViewMeta("Показатели", "Ключевые показатели, динамика по периодам и сигналы по всей платформе.");

  DOM.dashboardGrid.innerHTML = `
    <div class="dashboard-shell">
      <section class="dashboard-skeleton">
        <div class="dashboard-skeleton__hero"></div>
        <div class="dashboard-skeleton__row">
          <div class="dashboard-skeleton__card"></div>
          <div class="dashboard-skeleton__card"></div>
          <div class="dashboard-skeleton__card"></div>
        </div>
      </section>
    </div>
  `;

  let snapshot = null;
  try {
    snapshot = await liveWorkspaceController.getDashboardSnapshot();
  } catch (error) {
    console.error("dashboard snapshot error", error);
  }

  if (requestId !== STATE.dashboardRequestId) return;
  STATE.dashboardSnapshot = snapshot;

  const summaryLookup = snapshot
    ? {
        purchases: `${formatDashboardNumber(snapshot.warehouse.purchasesCount || 0)} закупок • ${formatDashboardMoney(snapshot.warehouse.purchasesTotal || 0)}`,
        sales: `${formatDashboardNumber(snapshot.sales.ordersCount)} заказов • ${formatDashboardNumber(snapshot.sales.unpaidInvoicesCount)} счетов без оплаты`,
        products: `${formatDashboardNumber(snapshot.warehouse.productsCount || 0)} товаров • ${formatDashboardMoney(snapshot.warehouse.catalogMargin || 0)} потенциал маржи`,
        crm: `${formatDashboardNumber(snapshot.crm.openDealsCount)} сделок в работе • ${formatDashboardMoney(snapshot.crm.pipelineAmount)}`,
        warehouse: `${formatDashboardNumber(snapshot.warehouse.itemsCount)} позиций • ${formatDashboardNumber(snapshot.warehouse.lowCount)} в дефиците`,
        money: `${formatDashboardMoney(snapshot.warehouse.netMoney || 0)} баланс • ${formatDashboardMoney(snapshot.warehouse.incomeTotal || 0)} / ${formatDashboardMoney(snapshot.warehouse.expenseTotal || 0)}`,
        production: `${formatDashboardNumber(snapshot.warehouse.productionActive || 0)} в работе • ${formatDashboardNumber(snapshot.warehouse.productionTotal || 0)} всего`,
        tasks: `${formatDashboardNumber(snapshot.tasks.openCount)} задач • ${formatDashboardNumber(snapshot.tasks.blockedCount)} с блокером`,
        directories: `${formatDashboardNumber(snapshot.directories.listsCount)} справочников • ${formatDashboardNumber(snapshot.directories.valuesCount)} значений`
      }
    : {};

  if (!snapshot) {
    DOM.dashboardGrid.innerHTML = `
      <div class="dashboard-shell">
        <section class="dashboard-fallback">
          <div class="workspace-empty">Показатели временно недоступны. Обновите страницу или откройте нужный модуль из шапки.</div>
        </section>
      </div>
    `;
    return;
  }

  const periodLabels = {
    week: "Неделя",
    month: "Месяц",
    year: "Год"
  };
  const activePeriod = ["week", "month", "year"].includes(STATE.ui.dashboardPeriod) ? STATE.ui.dashboardPeriod : "week";
  const activeSeries = snapshot.sales.seriesByPeriod?.[activePeriod] || snapshot.sales.series || [];
  const periodRevenue = activeSeries.reduce((sum, point) => sum + (Number(point.revenue) || 0), 0);
  const periodOrders = activeSeries.reduce((sum, point) => sum + (Number(point.orders) || 0), 0);
  const periodInvoices = activeSeries.reduce((sum, point) => sum + (Number(point.invoices) || 0), 0);
  const periodAverage = periodOrders ? periodRevenue / periodOrders : 0;
  const periodMeta = {
    week: {
      label: "Текущая неделя",
      caption: "За последние 7 дней"
    },
    month: {
      label: "Текущий месяц",
      caption: "По дням за месяц"
    },
    year: {
      label: "Текущий год",
      caption: "По месяцам за год"
    }
  }[activePeriod];

  const kpis = [
    {
      label: "Выручка месяца",
      value: formatDashboardMoney(snapshot.sales.monthRevenue),
      meta: `${formatDashboardNumber(snapshot.sales.monthOrdersCount)} заказов в этом месяце`,
      tone: "accent"
    },
    {
      label: "Счета без оплаты",
      value: formatDashboardNumber(snapshot.sales.unpaidInvoicesCount),
      meta: `${formatDashboardMoney(snapshot.sales.unpaidInvoicesAmount)} ждёт оплаты`,
      tone: "warning"
    },
    {
      label: "CRM в работе",
      value: formatDashboardNumber(snapshot.crm.openDealsCount),
      meta: `${formatDashboardMoney(snapshot.crm.pipelineAmount)} в активной воронке`,
      tone: "info"
    },
    {
      label: "Задачи в работе",
      value: formatDashboardNumber(snapshot.tasks.openCount),
      meta: `${formatDashboardNumber(snapshot.tasks.blockedCount)} блокеров • ${formatDashboardNumber(snapshot.tasks.overdueCount)} просрочено`,
      tone: "neutral"
    },
    {
      label: "Дефицит склада",
      value: formatDashboardNumber(snapshot.warehouse.lowCount),
      meta: `${formatDashboardNumber(snapshot.warehouse.missingDemandCount)} SKU ещё не заведены`,
      tone: "danger"
    },
    {
      label: "Активные калькуляции",
      value: formatDashboardNumber(snapshot.calculators.activeTabs),
      meta: `${formatDashboardNumber(snapshot.calculators.invoiceIssuedTabs)} счёт выставлен • ${formatDashboardNumber(snapshot.calculators.invoicePaidTabs)} оплачено`,
      tone: "success"
    }
  ];

  const geometry = buildDashboardChartGeometry(activeSeries);
  const alerts = snapshot.alerts
    .filter((item) => hasModuleAccess(item.moduleKey))
    .map(
      (item) => `
        <div class="dashboard-alert dashboard-alert--${escapeHtml(item.tone)}">
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <div class="dashboard-alert__meta">${escapeHtml(item.meta)}</div>
          </div>
          <button class="btn btn-sm btn-outline-dark" type="button" data-dashboard-open="${escapeHtml(item.moduleKey)}">${escapeHtml(item.actionLabel || "Открыть")}</button>
        </div>
      `
    )
    .join("");

  const salesChannels = (snapshot.sales.channels || [])
    .map(
      (channel) => `
        <div class="dashboard-progress">
          <div class="dashboard-progress__head">
            <span>${escapeHtml(channel.label)}</span>
            <strong>${escapeHtml(formatDashboardNumber(channel.count))}</strong>
          </div>
          <div class="dashboard-progress__bar"><span style="width:${Math.max(8, (channel.count / Math.max(snapshot.sales.ordersCount || 1, 1)) * 100)}%"></span></div>
        </div>
      `
    )
    .join("");

  const stageCards = (snapshot.crm.stageTotals || [])
    .filter((stage) => stage.count > 0)
    .map(
      (stage) => `
        <div class="dashboard-mini dashboard-mini--${escapeHtml(stage.tone)}">
          <span>${escapeHtml(stage.label)}</span>
          <strong>${escapeHtml(formatDashboardNumber(stage.count))}</strong>
        </div>
      `
    )
    .join("");

  const taskCards = (snapshot.tasks.statusTotals || [])
    .filter((status) => status.count > 0)
    .map(
      (status) => `
        <div class="dashboard-mini dashboard-mini--${escapeHtml(status.tone)}">
          <span>${escapeHtml(status.label)}</span>
          <strong>${escapeHtml(formatDashboardNumber(status.count))}</strong>
        </div>
      `
    )
    .join("");

  const demandCards = (snapshot.warehouse.topDemand || [])
    .map(
      (entry) => `
        <div class="dashboard-demand">
          <div>
            <strong>${escapeHtml(entry.sku)}</strong>
            <div class="dashboard-alert__meta">${escapeHtml((entry.sources || []).slice(0, 2).join(" • ") || "Калькуляторы")}</div>
          </div>
          <span>${escapeHtml(formatDashboardNumber(entry.qtyTotal))}</span>
        </div>
      `
    )
    .join("");

  const recentActivityRows = (snapshot.activity || [])
    .filter((entry) => {
      const timestamp = new Date(entry?.date || entry?.updated_at || entry?.created_at || 0).getTime();
      if (!Number.isFinite(timestamp)) return false;
      const ageMs = Date.now() - timestamp;
      return ageMs >= 0 && ageMs <= 24 * 60 * 60 * 1000;
    })
    .sort((left, right) => {
      const leftTs = new Date(left?.date || left?.updated_at || left?.created_at || 0).getTime() || 0;
      const rightTs = new Date(right?.date || right?.updated_at || right?.created_at || 0).getTime() || 0;
      return rightTs - leftTs;
    });

  const recentActivity = recentActivityRows
    .map(
      (entry) => `
        <div class="workspace-list-item">
          <div>
            <strong>${escapeHtml(entry.title || "Событие платформы")}</strong>
            <div class="workspace-list-item__meta">${escapeHtml(entry.meta || "Без деталей")}</div>
          </div>
          <div class="text-end">
            <div class="workspace-tag workspace-tag--${escapeHtml(entry.tone || "neutral")}">${escapeHtml(formatDate(entry.date))}</div>
            <div class="workspace-card__actions mt-2">
              <button class="btn btn-sm btn-outline-dark" type="button" data-dashboard-open="${escapeHtml(entry.moduleKey || "dashboard")}">Открыть</button>
            </div>
          </div>
        </div>
      `
    )
    .join("");

  DOM.dashboardGrid.innerHTML = `
    <div class="dashboard-shell">
      <section class="dashboard-focus-strip">
        <article class="dashboard-focus-card dashboard-focus-card--primary">
          <span>${escapeHtml(periodMeta.label)}</span>
          <strong>${escapeHtml(formatDashboardMoney(periodRevenue))}</strong>
          <small>${escapeHtml(periodMeta.caption)}</small>
        </article>
        <article class="dashboard-focus-card">
          <span>Заказы</span>
          <strong>${escapeHtml(formatDashboardNumber(periodOrders))}</strong>
          <small>Новых заказов за период</small>
        </article>
        <article class="dashboard-focus-card">
          <span>Счета</span>
          <strong>${escapeHtml(formatDashboardNumber(periodInvoices))}</strong>
          <small>Создано счетов за период</small>
        </article>
        <article class="dashboard-focus-card">
          <span>Средний чек</span>
          <strong>${escapeHtml(formatDashboardMoney(periodAverage))}</strong>
          <small>Выручка / заказы</small>
        </article>
      </section>

      <section class="dashboard-kpis">
        ${kpis
          .map(
            (item) => `
              <article class="dashboard-kpi dashboard-kpi--${escapeHtml(item.tone)}">
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(item.value)}</strong>
                <small>${escapeHtml(item.meta)}</small>
              </article>
            `
          )
          .join("")}
      </section>

      <section class="dashboard-overview">
        <article class="dashboard-chart-card">
          <div class="panel-heading">
            <div>
              <h3>Показатели продаж</h3>
              <div class="compact-help">Линия показывает выручку, столбики — новые заказы, наведение мышкой показывает точные значения по периоду.</div>
            </div>
            <div class="dashboard-chart-card__controls">
              <div class="dashboard-periods">
                ${Object.entries(periodLabels)
                  .map(
                    ([periodKey, periodLabel]) => `
                      <button class="dashboard-period${activePeriod === periodKey ? " active" : ""}" type="button" data-dashboard-period="${escapeHtml(periodKey)}">${escapeHtml(periodLabel)}</button>
                    `
                  )
                  .join("")}
              </div>
              <div class="dashboard-period-caption">${escapeHtml(periodMeta.caption)}</div>
              <div class="dashboard-legend">
                <span><i class="bi bi-graph-up-arrow"></i> Выручка</span>
                <span><i class="bi bi-bar-chart"></i> Заказы</span>
              </div>
            </div>
          </div>
          <div class="dashboard-chart">
            <svg viewBox="0 0 ${geometry.chartWidth} ${geometry.chartHeight}" role="img" aria-label="Показатели продаж за 7 дней">
              ${geometry.gridLines
                .map(
                  (line) => `
                    <line x1="34" x2="${geometry.chartWidth - 34}" y1="${line.y}" y2="${line.y}" class="dashboard-chart__grid"></line>
                    <text x="${geometry.chartWidth - 6}" y="${line.y - 4}" text-anchor="end" class="dashboard-chart__label">${escapeHtml(line.value)}</text>
                  `
                )
                .join("")}
              ${geometry.area ? `<polygon points="${geometry.area}" class="dashboard-chart__area"></polygon>` : ""}
              ${geometry.bars
                .map(
                  (bar) => `
                    <rect x="${bar.x}" y="${bar.y}" width="${bar.width}" height="${bar.height}" rx="8" class="dashboard-chart__bar"></rect>
                  `
                )
                .join("")}
              ${geometry.polyline ? `<polyline points="${geometry.polyline}" class="dashboard-chart__line"></polyline>` : ""}
              ${geometry.dots
                .map(
                  (dot) => `
                    <circle cx="${dot.x}" cy="${dot.y}" r="5.5" class="dashboard-chart__dot" ${buildDashboardChartAttrs(dot.point)}></circle>
                  `
                )
                .join("")}
              ${geometry.bars
                .map(
                  (bar) => `
                    <rect
                      x="${bar.x - 8}"
                      y="18"
                      width="${bar.width + 16}"
                      height="${geometry.chartHeight - 38}"
                      rx="12"
                      class="dashboard-chart__hotspot"
                      ${buildDashboardChartAttrs(bar.point)}
                    ></rect>
                  `
                )
                .join("")}
            </svg>
            <div class="dashboard-tooltip d-none"></div>
          </div>
          <div class="dashboard-axis">
            ${activeSeries
              .map(
                (point) => `
                  <div class="dashboard-axis__item" ${buildDashboardChartAttrs(point)}>
                    <span>${escapeHtml(point.label)}</span>
                    <strong>${escapeHtml(formatDashboardNumber(point.orders))}</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>

        <article class="dashboard-alerts-card">
          <div class="panel-heading">
            <div>
              <h3>Операционные сигналы</h3>
              <div class="compact-help">Первые проблемы и точки внимания по продажам, CRM, складу и задачам.</div>
            </div>
            <div class="workspace-note">Сигналов: ${escapeHtml(formatDashboardNumber(snapshot.alerts.length))}</div>
          </div>
          <div class="dashboard-alerts">
            ${alerts || '<div class="workspace-empty workspace-empty--tight">Критичных сигналов сейчас нет.</div>'}
          </div>
        </article>
      </section>

      <section class="dashboard-panels">
        <article class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h3>Продажи и каналы</h3>
              <div class="compact-help">Что даёт поток заказов и где сейчас лежат деньги.</div>
            </div>
            <button class="btn btn-outline-dark btn-sm" type="button" data-dashboard-open="sales">Открыть продажи</button>
          </div>
          <div class="dashboard-mini-grid">${salesChannels || '<div class="workspace-empty workspace-empty--tight">Каналы появятся после заполнения заказов.</div>'}</div>
        </article>

        <article class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h3>CRM и этапы</h3>
              <div class="compact-help">Куда распределена активная воронка и где нужны действия менеджеров.</div>
            </div>
            <button class="btn btn-outline-dark btn-sm" type="button" data-dashboard-open="crm">Открыть CRM</button>
          </div>
          <div class="dashboard-mini-grid">${stageCards || '<div class="workspace-empty workspace-empty--tight">Сделки пока не заведены.</div>'}</div>
        </article>

        <article class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h3>Склад и спрос</h3>
              <div class="compact-help">Топ позиций по спросу из калькуляторов и зоны дефицита.</div>
            </div>
            <button class="btn btn-outline-dark btn-sm" type="button" data-dashboard-open="warehouse">Открыть склад</button>
          </div>
          <div class="dashboard-stack">
            <div class="dashboard-mini-grid">
              <div class="dashboard-mini dashboard-mini--neutral"><span>На руках</span><strong>${escapeHtml(formatDashboardNumber(snapshot.warehouse.onHandTotal))}</strong></div>
              <div class="dashboard-mini dashboard-mini--accent"><span>Доступно</span><strong>${escapeHtml(formatDashboardNumber(snapshot.warehouse.availableTotal))}</strong></div>
              <div class="dashboard-mini dashboard-mini--warning"><span>В резерве</span><strong>${escapeHtml(formatDashboardNumber(snapshot.warehouse.reservedTotal))}</strong></div>
              <div class="dashboard-mini dashboard-mini--danger"><span>Критичный спрос</span><strong>${escapeHtml(formatDashboardNumber(snapshot.warehouse.criticalDemandCount))}</strong></div>
            </div>
            ${demandCards || '<div class="workspace-empty workspace-empty--tight">Спрос из калькуляторов ещё не сформирован.</div>'}
          </div>
        </article>

        <article class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h3>Задачи и исполнение</h3>
              <div class="compact-help">Срез по статусам задач и по тому, где процесс тормозит.</div>
            </div>
            <button class="btn btn-outline-dark btn-sm" type="button" data-dashboard-open="tasks">Открыть задачи</button>
          </div>
          <div class="dashboard-mini-grid">${taskCards || '<div class="workspace-empty workspace-empty--tight">Задачи пока не заведены.</div>'}</div>
        </article>

        <article class="dashboard-panel">
          <div class="panel-heading">
            <div>
              <h3>Последняя активность</h3>
              <div class="compact-help">Только действия за последние 24 часа, чтобы главная не разрасталась вниз.</div>
            </div>
            <button class="btn btn-outline-dark btn-sm" type="button" data-dashboard-open="dashboard">Обновить вид</button>
          </div>
          <div class="workspace-stack">${recentActivity || '<div class="workspace-empty workspace-empty--tight">За последние 24 часа новых событий пока не было.</div>'}</div>
        </article>
      </section>
    </div>
  `;
}

function setViewMeta(title, subtitle) {
  DOM.viewTitle.textContent = title;
  DOM.viewSubtitle.textContent = subtitle;
}

function hideViews() {
  DOM.dashboardView.classList.add("d-none");
  DOM.embedView.classList.add("d-none");
  DOM.adminView.classList.add("d-none");
  DOM.messengerView.classList.add("d-none");
  DOM.placeholderView.classList.add("d-none");
}

async function openModule(key) {
  if (!hasModuleAccess(key)) return;
  const module = MODULES[key];
  if (STATE.menu.profileOpen) {
    STATE.menu.profileOpen = false;
    renderProfileCard();
  }
  const nextSrc = module.type === "embed" ? (typeof module.src === "function" ? module.src() : module.src) : "";
  const sameEmbedAlreadyOpen =
    module.type === "embed" &&
    STATE.activeModule === key &&
    STATE.loadedEmbedKey === key &&
    STATE.loadedEmbedSrc === nextSrc &&
    !DOM.embedView.classList.contains("d-none");

  if (key !== "ai") {
    STATE.lastNonAiModule = key;
  }
  STATE.activeModule = key;
  persistActiveModule();
  renderModuleNav();
  setViewMeta(module.title, module.subtitle);
  hideViews();
  clearShellStatus();

  if (module.type === "dashboard") {
    await renderDashboard();
    DOM.dashboardView.classList.remove("d-none");
    return;
  }

  if (module.type === "embed") {
    if (!sameEmbedAlreadyOpen) {
      DOM.moduleFrame.src = nextSrc;
      STATE.loadedEmbedKey = key;
      STATE.loadedEmbedSrc = nextSrc;
    }
    DOM.embedView.classList.remove("d-none");
    return;
  }

  if (module.type === "admin") {
    DOM.adminView.classList.remove("d-none");
    await loadAdminData();
    return;
  }

  if (module.type === "messenger") {
    DOM.messengerView.classList.remove("d-none");
    try {
      await loadThreads();
    } catch (error) {
      if (isMessengerPolicyRecursion(error)) {
        DOM.threadList.innerHTML = `<div class="compact-help">Мессенджер временно недоступен: в Supabase зациклилась policy для чата. Выполните <code>platform_messenger_rls_fix.sql</code> в SQL Editor.</div>`;
        DOM.messagesList.innerHTML = `<div class="compact-help">После выполнения SQL-патча обновите платформу, и чат заработает без рекурсии policy.</div>`;
        setShellStatus("Мессенджер временно отключён до выполнения platform_messenger_rls_fix.sql.", "warning");
        return;
      }
      throw error;
    }
    return;
  }

  if (module.type === "ai") {
    await domovoyNeonik.ensureReady();
    renderAiModule();
    DOM.placeholderView.classList.remove("d-none");
    return;
  }

  if (liveWorkspaceController.supports(key)) {
    DOM.placeholderCard.innerHTML = await liveWorkspaceController.render(key);
    liveWorkspaceController.afterRender(key, DOM.placeholderCard);
  } else {
    renderPlaceholderModule(key);
  }
  DOM.placeholderView.classList.remove("d-none");
}

async function ensureProfile(user) {
  const { data, error } = await supabase
    .from("app_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (data) return data;

  const displayName = user.user_metadata?.display_name || user.email || "Пользователь";
  const insertPayload = {
    id: user.id,
    email: user.email,
    full_name: displayName,
    display_name: displayName
  };

  const { data: inserted, error: insertError } = await supabase
    .from("app_profiles")
    .upsert(insertPayload)
    .select("*")
    .single();

  if (insertError) throw insertError;
  return inserted;
}

async function loadPartnerProfiles() {
  if (!STATE.schemaReady) return;
  const { data, error } = await supabase
    .from("partner_profiles")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) throw error;
  STATE.partnerProfiles = data || [];
}

async function loadRoleTemplates() {
  if (!STATE.schemaReady) {
    STATE.roleTemplates = DEFAULT_ROLE_TEMPLATES.map((item) => cloneJson(item));
    return;
  }

  const { data, error } = await supabase.from("app_role_templates").select("*").order("display_name", { ascending: true });
  if (error) {
    if (error.code === "42P01") {
      STATE.roleTemplates = DEFAULT_ROLE_TEMPLATES.map((item) => cloneJson(item));
      return;
    }
    throw error;
  }

  const current = Array.isArray(data) ? data : [];
  const merged = DEFAULT_ROLE_TEMPLATES.map((role) => {
    const existing = current.find((item) => item.role_key === role.role_key);
    return existing ? existing : cloneJson(role);
  });

  current
    .filter((role) => !merged.some((item) => item.role_key === role.role_key))
    .forEach((role) => merged.push(role));

  STATE.roleTemplates = merged;

  if (!STATE.editingRoleKey || !STATE.roleTemplates.some((role) => role.role_key === STATE.editingRoleKey)) {
    STATE.editingRoleKey = STATE.roleTemplates[0]?.role_key || null;
  }
}

async function upsertSharedState(appId, payload) {
  const { data, error } = await supabase
    .from("shared_app_states")
    .select("app_id")
    .eq("app_id", appId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (data?.app_id) {
    const { error: updateError } = await supabase
      .from("shared_app_states")
      .update({ payload })
      .eq("app_id", appId);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase.from("shared_app_states").insert({
    app_id: appId,
    payload
  });
  if (insertError) throw insertError;
}

function normalizePlatformConfig(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  return {
    domovoyApiBaseUrl: String(source.domovoyApiBaseUrl || "").trim().replace(/\/+$/, ""),
    domovoyHealth: source.domovoyHealth && typeof source.domovoyHealth === "object" ? source.domovoyHealth : null,
    domovoySyncAt: String(source.domovoySyncAt || "")
  };
}

function getDomovoyApiBaseUrl() {
  return String(STATE.platformConfig?.domovoyApiBaseUrl || "").trim().replace(/\/+$/, "");
}

async function loadPlatformConfig() {
  if (!STATE.schemaReady) {
    STATE.platformConfig = normalizePlatformConfig();
    renderDomovoySettings();
    return;
  }

  const { data, error } = await supabase
    .from("shared_app_states")
    .select("payload")
    .eq("app_id", "platform_global_config")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  STATE.platformConfig = normalizePlatformConfig(data?.payload);
  renderDomovoySettings();
}

async function savePlatformConfigPatch(patch = {}) {
  const nextConfig = normalizePlatformConfig({
    ...STATE.platformConfig,
    ...patch
  });
  await upsertSharedState("platform_global_config", nextConfig);
  STATE.platformConfig = nextConfig;
  renderDomovoySettings();
}

function renderDomovoySettings() {
  const form = document.getElementById("domovoyConfigForm");
  const statusBox = document.getElementById("domovoyConfigStatus");
  if (!form || !statusBox) return;

  const urlInput = form.elements.domovoyApiBaseUrl;
  if (urlInput && document.activeElement !== urlInput) {
    urlInput.value = STATE.platformConfig.domovoyApiBaseUrl || "";
  }

  const health = STATE.platformConfig.domovoyHealth;
  const fragments = [];
  if (STATE.platformConfig.domovoyApiBaseUrl) {
    fragments.push(`API: ${escapeHtml(STATE.platformConfig.domovoyApiBaseUrl)}`);
  } else {
    fragments.push("API пока не указан");
  }
  if (health?.status) {
    fragments.push(`health: ${escapeHtml(health.status)}`);
  }
  if (health?.mode) {
    fragments.push(`режим: ${escapeHtml(health.mode)}`);
  }
  if (STATE.platformConfig.domovoySyncAt) {
    fragments.push(`синхронизация: ${escapeHtml(formatDateTime(STATE.platformConfig.domovoySyncAt))}`);
  }

  statusBox.innerHTML = fragments.join(" • ");
}

async function checkDomovoyHealth() {
  const apiBaseUrl = getDomovoyApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("Сначала укажите HTTPS-адрес API Домового Неоника.");
  }
  const response = await fetch(`${apiBaseUrl}/api/domovoy/health`, {
    method: "GET",
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || `HTTP ${response.status}`);
  }
  await savePlatformConfigPatch({ domovoyHealth: payload });
  return payload;
}

async function syncDomovoySources() {
  const apiBaseUrl = getDomovoyApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error("Сначала укажите HTTPS-адрес API Домового Неоника.");
  }
  const accessToken = STATE.session?.access_token || (await supabase.auth.getSession()).data?.session?.access_token || "";
  const response = await fetch(`${apiBaseUrl}/api/domovoy/sync`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || `HTTP ${response.status}`);
  }
  await savePlatformConfigPatch({
    domovoyHealth: payload?.sources ? { ...(STATE.platformConfig.domovoyHealth || {}), sources: payload.sources } : STATE.platformConfig.domovoyHealth,
    domovoySyncAt: new Date().toISOString()
  });
  return payload;
}

async function clearTableByColumn(tableName, columnName, options = {}) {
  const { error } = await supabase.from(tableName).delete().not(columnName, "is", null);
  if (!error || error.code === "42P01") return;
  if (options.ignoreMessengerPolicyError && isMessengerPolicyRecursion(error)) return;
  throw error;
}

async function performOwnerDataResetIfNeeded() {
  if (!STATE.schemaReady || !isAdmin()) return false;

  const { data, error } = await supabase
    .from("shared_app_states")
    .select("app_id, payload")
    .eq("app_id", "platform_system_flags")
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  const flags = data?.payload && typeof data.payload === "object" ? data.payload : {};
  if (flags.dataResetVersion === PLATFORM_DATA_RESET_VERSION) return false;

  const now = new Date().toISOString();

  await upsertSharedState("platform_crm_v1", {
    version: 1,
    deals: [],
    updatedAt: now
  });
  await upsertSharedState("platform_crm_v2", {
    version: 2,
    builder: {
      views: [{ id: "default", label: "Все сделки", filters: { search: "", stage: "all", owner: "all" } }],
      fields: [],
      formulas: []
    },
    deals: [],
    updatedAt: now
  });
  await upsertSharedState("platform_warehouse_v1", {
    version: 1,
    items: [],
    movements: [],
    updatedAt: now
  });
  await upsertSharedState("platform_warehouse_v2", {
    version: 2,
    builder: {
      views: [{ id: "default", label: "Все позиции", filters: { search: "", category: "all" } }],
      fields: [],
      formulas: []
    },
    items: [],
    movements: [],
    updatedAt: now
  });
  await upsertSharedState("platform_tasks_v1", {
    version: 1,
    sprints: [],
    tasks: [],
    updatedAt: now
  });
  await upsertSharedState("platform_tasks_v2", {
    version: 2,
    builder: {
      views: [{ id: "default", label: "Все задачи", filters: { search: "", status: "all", sprint: "all", owner: "all" } }],
      fields: [],
      formulas: []
    },
    sprints: [],
    tasks: [],
    updatedAt: now
  });

  await clearTableByColumn("app_messages", "id", { ignoreMessengerPolicyError: true });
  await clearTableByColumn("app_thread_members", "thread_id", { ignoreMessengerPolicyError: true });
  await clearTableByColumn("app_threads", "id", { ignoreMessengerPolicyError: true });
  await clearTableByColumn("light2_asset_payments", "id");
  await clearTableByColumn("light2_assets", "id");
  await clearTableByColumn("light2_purchase_catalog", "id");
  await clearTableByColumn("light2_balance_entries", "id");
  await clearTableByColumn("light2_payment_calendar_entries", "id");
  await clearTableByColumn("light2_partner_settlements", "id");

  await upsertSharedState("platform_system_flags", {
    ...flags,
    dataResetVersion: PLATFORM_DATA_RESET_VERSION,
    resetCompletedAt: now
  });

  return true;
}

async function bootstrapApp(session) {
  const previousModule = STATE.activeModule || "dashboard";
  let didResetData = false;
  STATE.session = session;
  STATE.user = session.user;
  STATE.schemaReady = true;
  STATE.schemaError = "";

  try {
    STATE.profile = await ensureProfile(session.user);
    await loadRoleTemplates();
    await loadPlatformConfig();
    if (isAdmin()) {
      await loadPartnerProfiles();
    } else {
      STATE.partnerProfiles = [];
    }
    didResetData = await performOwnerDataResetIfNeeded();
  } catch (error) {
    if (isSchemaMissing(error)) {
      STATE.schemaReady = false;
      STATE.schemaError = error.message || "таблицы платформы не найдены";
      STATE.platformConfig = normalizePlatformConfig();
      STATE.profile = {
        display_name: session.user.user_metadata?.display_name || session.user.email,
        role: "user",
        allowed_modules: ["dashboard", "sales", "my_calculator", "partner_calculator", "board"],
        module_permissions: normalizeModulePermissions(null, ["dashboard", "sales", "my_calculator", "partner_calculator", "board"])
      };
      STATE.roleTemplates = DEFAULT_ROLE_TEMPLATES.map((item) => cloneJson(item));
    } else {
      throw error;
    }
  }

  renderSchemaWarning();
  renderDomovoySettings();
  renderProfileCard();
  renderModuleNav();
  renderAiWidget();
  await renderDashboard();
  showAppShell();
  const availableModules = moduleListFromProfile();
  const targetModule = availableModules.includes(previousModule) ? previousModule : availableModules[0] || "dashboard";
  await openModule(targetModule);
  if (didResetData) {
    setShellStatus(
      "Рабочие данные очищены: ДОМ НЕОНА, CRM, Склад, Тасктрекер и Мессенджер запущены с пустого состояния.",
      "success"
    );
  }
}

async function openPlatformForSession(session) {
  try {
    await bootstrapApp(session);
  } catch (error) {
    showAuthScreen();
    setAuthStatus(error.message || "Не удалось открыть платформу.", "error");
  }
}

function queuePlatformBootstrap(session) {
  const signature = `${session.user.id}:${session.access_token || ""}:${session.expires_at || ""}`;
  if (STATE.queuedBootstrapSignature === signature) return;
  STATE.queuedBootstrapSignature = signature;
  if (STATE.queuedBootstrapTimer) {
    window.clearTimeout(STATE.queuedBootstrapTimer);
  }
  STATE.queuedBootstrapTimer = window.setTimeout(() => {
    STATE.queuedBootstrapTimer = null;
    void openPlatformForSession(session);
  }, 0);
}

function renderUserTable() {
  if (!STATE.users.length) {
    DOM.adminUsersBody.innerHTML = `<tr><td colspan="7" class="text-muted">Пользователи пока не найдены.</td></tr>`;
    DOM.userAccessEditor.innerHTML = `<div class="compact-help">Пользователи пока не найдены.</div>`;
    return;
  }

  if (!STATE.selectedUserId || !STATE.users.some((user) => user.id === STATE.selectedUserId)) {
    STATE.selectedUserId = STATE.users[0].id;
  }

  DOM.adminUsersBody.innerHTML = STATE.users
    .map((user) => {
      const accessSummary = summarizeModuleAccess(user) || "Нет";
      const roleTemplate = getRoleTemplate(user.role);
      const roleLabel = roleTemplate?.display_name || user.role || "user";

      return `
        <tr data-user-id="${escapeHtml(user.id)}" class="${STATE.selectedUserId === user.id ? "table-active" : ""}">
          <td class="small">${escapeHtml(user.email || "—")}</td>
          <td>${escapeHtml(user.display_name || user.full_name || "—")}</td>
          <td>${escapeHtml(roleLabel)}</td>
          <td>${escapeHtml(user.partner_slug || "—")}</td>
          <td class="small">${escapeHtml(accessSummary)}</td>
          <td>${user.is_active ? "Да" : "Нет"}</td>
          <td><button class="btn btn-sm btn-outline-dark" type="button" data-select-user="${escapeHtml(user.id)}">Настроить</button></td>
        </tr>
      `;
    })
    .join("");

  renderUserAccessEditor();
}

function renderPermissionGrid(container, permissions, mode) {
  const normalized = normalizePermissionDependencies(permissions);
  container.innerHTML = `
    ${renderPermissionSummary(normalized, mode)}
    ${MODULE_GROUPS.map((key) => {
      const module = MODULES[key];
      const current = normalized[key] || { view: false, edit: false, manage: false };
      return `
        <article class="permission-card">
          <div class="permission-card__head">
            <strong>${escapeHtml(module.title)}</strong>
            <span>${escapeHtml(module.subtitle)}</span>
          </div>
          <div class="permission-card__flags">
            ${PERMISSION_FLAGS.map((flag) => `
              <label class="permission-flag">
                <input
                  class="form-check-input"
                  type="checkbox"
                  data-${mode}-module="${escapeHtml(key)}"
                  data-${mode}-perm="${escapeHtml(flag.key)}"
                  ${current[flag.key] ? "checked" : ""}
                />
                <span>${escapeHtml(flag.label)}</span>
              </label>
            `).join("")}
          </div>
        </article>
      `;
    }).join("")}
  `;
}

function renderRoleTemplatesTable() {
  if (!STATE.roleTemplates.length) {
    DOM.roleTemplatesBody.innerHTML = `<tr><td colspan="4" class="text-muted">Роли пока не настроены.</td></tr>`;
    return;
  }

  DOM.roleTemplatesBody.innerHTML = STATE.roleTemplates
    .map((role) => `
      <tr class="${STATE.editingRoleKey === role.role_key ? "table-active" : ""}">
        <td><code>${escapeHtml(role.role_key)}</code></td>
        <td>${escapeHtml(role.display_name || role.role_key)}</td>
        <td>${role.is_system ? "Да" : "Нет"}</td>
        <td><button class="btn btn-sm btn-outline-dark" type="button" data-edit-role="${escapeHtml(role.role_key)}">Открыть</button></td>
      </tr>
    `)
    .join("");
}

function fillRoleTemplateForm(role) {
  const form = DOM.roleTemplateForm;
  if (!form) return;
  const permissions = normalizeModulePermissions(role?.module_permissions, role?.allowed_modules);
  form.elements.role_key.value = role?.role_key || "";
  form.elements.display_name.value = role?.display_name || "";
  form.elements.description.value = role?.description || "";
  form.elements.role_key.readOnly = Boolean(role?.is_system);
  DOM.deleteRoleTemplateButton.classList.toggle("d-none", !role || role.is_system);
  renderPermissionGrid(DOM.rolePermissionsGrid, permissions, "role");
}

function renderUserAccessEditor() {
  const user = STATE.users.find((item) => item.id === STATE.selectedUserId);
  if (!user) {
    DOM.userAccessEditor.innerHTML = `<div class="compact-help">Выберите пользователя из таблицы слева.</div>`;
    return;
  }

  const roleOptions = STATE.roleTemplates
    .map((role) => `<option value="${escapeHtml(role.role_key)}" ${role.role_key === user.role ? "selected" : ""}>${escapeHtml(role.display_name || role.role_key)}</option>`)
    .join("");
  const permissions = getProfilePermissionMap(user);
  const currentRole = getRoleTemplate(user.role);
  const stats = summarizePermissionStats(permissions);

  DOM.userAccessEditor.innerHTML = `
    <form id="userAccessForm" data-user-id="${escapeHtml(user.id)}" class="row g-3">
      <div class="col-12">
        <div class="access-user-title">${escapeHtml(user.email || "Пользователь")}</div>
        <div class="compact-help">Изменения сохраняются отдельно для выбранного пользователя.</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Имя</label>
        <input class="form-control" type="text" name="display_name" value="${escapeHtml(user.display_name || user.full_name || "")}" />
      </div>
      <div class="col-md-6">
        <label class="form-label">Роль</label>
        <select class="form-select" name="role">${roleOptions}</select>
        <div class="compact-help mt-2">${escapeHtml(currentRole?.description || "Роль задает базовый шаблон доступа, который можно донастроить ниже.")}</div>
      </div>
      <div class="col-md-6">
        <label class="form-label">Партнерский slug</label>
        <input class="form-control" type="text" name="partner_slug" value="${escapeHtml(user.partner_slug || "")}" />
      </div>
      <div class="col-md-6 d-flex align-items-end">
        <label class="permission-flag mb-0">
          <input class="form-check-input" type="checkbox" name="is_active" ${user.is_active ? "checked" : ""} />
          <span>Аккаунт активен</span>
        </label>
      </div>
      <div class="col-md-6">
        <div class="permission-summary__stats">
          <div class="permission-stat"><span>Видит модулей</span><strong>${escapeHtml(String(stats.view))}</strong></div>
          <div class="permission-stat"><span>Редактирует</span><strong>${escapeHtml(String(stats.edit))}</strong></div>
          <div class="permission-stat"><span>Управляет</span><strong>${escapeHtml(String(stats.manage))}</strong></div>
        </div>
      </div>
      <div class="col-12">
        <div class="d-flex flex-wrap gap-2 mb-2">
          <button class="btn btn-sm btn-outline-dark" type="button" data-apply-role-template>Применить права роли</button>
        </div>
        <div class="form-label mb-2">Доступы по модулям</div>
        <div class="permission-grid" id="userPermissionsGrid"></div>
      </div>
      <div class="col-12">
        <button class="btn btn-dark" type="submit">Сохранить пользователя</button>
      </div>
    </form>
  `;

  const grid = document.getElementById("userPermissionsGrid");
  renderPermissionGrid(grid, permissions, "user");
}

function renderPartnerDirectory() {
  if (!STATE.partnerProfiles.length) {
    DOM.partnerDirectoryBody.innerHTML = `<tr><td colspan="5" class="text-muted">Партнеры пока не добавлены.</td></tr>`;
    return;
  }

  const usersMap = new Map((STATE.users || []).map((user) => [user.id, user]));
  DOM.partnerDirectoryBody.innerHTML = STATE.partnerProfiles
    .map((partner) => {
      const url = partner.calculator_url || buildPartnerCalculatorUrl(partner.slug);
      const owner = usersMap.get(partner.owner_user_id);
      const ownerLabel = owner?.display_name || owner?.email || "—";
      return `
        <tr>
          <td>${escapeHtml(partner.display_name)}</td>
          <td>${escapeHtml(partner.slug)}</td>
          <td>${escapeHtml(partner.email || "—")}</td>
          <td>${escapeHtml(ownerLabel)}</td>
          <td><a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${escapeHtml(url)}</a></td>
        </tr>
      `;
    })
    .join("");
}

async function loadAdminData() {
  if (!isAdmin() || !STATE.schemaReady) {
    DOM.adminUsersBody.innerHTML = `<tr><td colspan="7" class="text-muted">Админ-функции доступны после запуска схемы платформы и входа админа.</td></tr>`;
    DOM.partnerDirectoryBody.innerHTML = `<tr><td colspan="5" class="text-muted">Сначала выполните platform_setup.sql.</td></tr>`;
    DOM.roleTemplatesBody.innerHTML = `<tr><td colspan="4" class="text-muted">Роли станут доступны после запуска platform_setup.sql.</td></tr>`;
    DOM.userAccessEditor.innerHTML = `<div class="compact-help">Доступы станут доступны после запуска схемы платформы.</div>`;
    return;
  }

  const [{ data: users, error: userError }, { data: partners, error: partnerError }, { data: roles, error: roleError }] = await Promise.all([
    supabase.from("app_profiles").select("*").order("created_at", { ascending: true }),
    supabase.from("partner_profiles").select("*").order("display_name", { ascending: true }),
    supabase.from("app_role_templates").select("*").order("display_name", { ascending: true })
  ]);

  if (userError) throw userError;
  if (partnerError) throw partnerError;
  if (roleError && roleError.code !== "42P01") throw roleError;

  STATE.users = users || [];
  STATE.partnerProfiles = partners || [];
  STATE.roleTemplates = [
    ...DEFAULT_ROLE_TEMPLATES.map((role) => roles?.find((item) => item.role_key === role.role_key) || cloneJson(role)),
    ...(roles || []).filter((role) => !DEFAULT_ROLE_TEMPLATES.some((item) => item.role_key === role.role_key))
  ];
  if (!STATE.editingRoleKey || !STATE.roleTemplates.some((role) => role.role_key === STATE.editingRoleKey)) {
    STATE.editingRoleKey = STATE.roleTemplates[0]?.role_key || null;
  }
  renderUserTable();
  renderPartnerDirectory();
  renderRoleTemplatesTable();
  fillRoleTemplateForm(getRoleTemplate(STATE.editingRoleKey));
  renderDomovoySettings();
}

async function saveUserProfile(userId) {
  const form = document.getElementById("userAccessForm");
  if (!form || form.dataset.userId !== userId) return;

  const role = form.elements.role.value;
  const modulePermissions = normalizePermissionDependencies(getPermissionMapFromForm(form, "user"));

  const payload = {
    display_name: form.elements.display_name.value.trim(),
    role,
    partner_slug: sanitizeSlug(form.elements.partner_slug.value),
    module_permissions: modulePermissions,
    allowed_modules: permissionsToAllowedModules(modulePermissions),
    is_active: form.elements.is_active.checked
  };

  const { error } = await supabase.from("app_profiles").update(payload).eq("id", userId);
  if (error) throw error;
  setAuthStatus("Изменения пользователя сохранены.", "success");
  await loadAdminData();
}

function applyRoleTemplateToSelectedUser() {
  const form = document.getElementById("userAccessForm");
  if (!form) return;
  const template = getRoleTemplate(form.elements.role.value);
  const permissions = normalizeModulePermissions(template?.module_permissions, template?.allowed_modules);
  const grid = document.getElementById("userPermissionsGrid");
  if (grid) renderPermissionGrid(grid, permissions, "user");
}

async function saveRoleTemplate() {
  const form = DOM.roleTemplateForm;
  const roleKey = sanitizeSlug(form.elements.role_key.value).replaceAll("-", "_");
  if (!roleKey) {
    throw new Error("Укажите ключ роли.");
  }

  const permissions = normalizePermissionDependencies(getPermissionMapFromForm(form, "role"));

  const existing = getRoleTemplate(STATE.editingRoleKey);
  const payload = {
    role_key: roleKey,
    display_name: form.elements.display_name.value.trim() || roleKey,
    description: form.elements.description.value.trim() || null,
    is_system: existing?.is_system || false,
    module_permissions: permissions
  };

  const { error } = await supabase.from("app_role_templates").upsert(payload, { onConflict: "role_key" });
  if (error) throw error;

  STATE.editingRoleKey = roleKey;
  setAuthStatus("Роль сохранена.", "success");
  await loadAdminData();
}

async function deleteRoleTemplate() {
  const role = getRoleTemplate(STATE.editingRoleKey);
  if (!role || role.is_system) {
    throw new Error("Системную роль удалить нельзя.");
  }
  const { error } = await supabase.from("app_role_templates").delete().eq("role_key", role.role_key);
  if (error) throw error;
  STATE.editingRoleKey = DEFAULT_ROLE_TEMPLATES[0]?.role_key || null;
  setAuthStatus("Роль удалена.", "success");
  await loadAdminData();
}

async function createPartner(form) {
  const formData = new FormData(form);
  const displayName = String(formData.get("displayName") || "").trim();
  const slug = sanitizeSlug(formData.get("slug"));
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const notes = String(formData.get("notes") || "").trim();

  if (!displayName || !slug) {
    throw new Error("Укажите имя и slug партнера.");
  }

  let ownerUserId = null;
  let ownerModules = null;
  let ownerPermissions = null;
  if (email) {
    const { data: owner, error: ownerError } = await supabase
      .from("app_profiles")
      .select("id, allowed_modules, module_permissions")
      .eq("email", email)
      .maybeSingle();

    if (ownerError && ownerError.code !== "PGRST116") throw ownerError;
    ownerUserId = owner?.id || null;
    ownerModules = Array.isArray(owner?.allowed_modules) ? owner.allowed_modules : null;
    ownerPermissions = normalizeModulePermissions(owner?.module_permissions, ownerModules);
  }

  const payload = {
    display_name: displayName,
    slug,
    email: email || null,
    owner_user_id: ownerUserId,
    notes: notes || null,
    calculator_url: buildPartnerCalculatorUrl(slug)
  };

  const { error } = await supabase.from("partner_profiles").upsert(payload, { onConflict: "slug" });
  if (error) throw error;

  if (ownerUserId) {
    const nextModules = Array.from(
      new Set([
        ...(ownerModules || ["dashboard", "sales", "my_calculator", "partner_calculator", "messenger", "board"]),
        "light2"
      ])
    );
    ownerPermissions = ownerPermissions || createEmptyPermissionMap();
    ownerPermissions.dashboard.view = true;
    ownerPermissions.partner_calculator.view = true;
    ownerPermissions.partner_calculator.edit = true;
    ownerPermissions.light2.view = true;
    await supabase
      .from("app_profiles")
      .update({ partner_slug: slug, allowed_modules: nextModules, module_permissions: ownerPermissions })
      .eq("id", ownerUserId);
  }

  form.reset();
  await loadAdminData();
}

function renderThreadList() {
  if (!STATE.threads.length) {
    DOM.threadList.innerHTML = `<div class="compact-help">Пока нет ни одного чата. Создайте первый.</div>`;
    return;
  }

  DOM.threadList.innerHTML = STATE.threads
    .map((thread) => `
      <button class="thread-item ${STATE.activeThreadId === thread.id ? "active" : ""}" type="button" data-open-thread="${escapeHtml(thread.id)}">
        <div class="fw-bold">${escapeHtml(thread.title || (thread.thread_type === "direct" ? "Личный чат" : "Группа"))}</div>
        <small>${escapeHtml(thread.thread_type)} • ${escapeHtml(formatDateTime(thread.created_at))}</small>
      </button>
    `)
    .join("");
}

async function loadThreads() {
  if (!STATE.schemaReady) {
    DOM.threadList.innerHTML = `<div class="compact-help">Мессенджер станет доступен после запуска platform_setup.sql.</div>`;
    DOM.messagesList.innerHTML = `<div class="compact-help">Таблицы мессенджера еще не созданы.</div>`;
    return;
  }

  const { data, error } = await supabase
    .from("app_thread_members")
    .select("thread_id, app_threads(id, title, thread_type, created_at)")
    .eq("user_id", STATE.user.id);

  if (error) throw error;

  STATE.threads = (data || [])
    .map((row) => row.app_threads)
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  renderThreadList();

  if (STATE.activeThreadId && STATE.threads.some((thread) => thread.id === STATE.activeThreadId)) {
    await loadMessages(STATE.activeThreadId);
  } else if (STATE.threads[0]) {
    await loadMessages(STATE.threads[0].id);
  } else {
    STATE.activeThreadId = null;
    DOM.messageThreadTitle.textContent = "Выберите чат";
    DOM.messageThreadMeta.textContent = "После создания новый чат появится слева.";
    DOM.messagesList.innerHTML = `<div class="compact-help">Пока чат не выбран.</div>`;
  }
}

async function loadMessages(threadId) {
  const thread = STATE.threads.find((item) => item.id === threadId);
  if (!thread) return;

  STATE.activeThreadId = threadId;
  renderThreadList();

  DOM.messageThreadTitle.textContent = thread.title || (thread.thread_type === "direct" ? "Личный чат" : "Группа");
  DOM.messageThreadMeta.textContent = `Тип: ${thread.thread_type} • создан ${formatDateTime(thread.created_at)}`;

  const { data: messages, error } = await supabase
    .from("app_messages")
    .select("id, thread_id, sender_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const senderIds = [...new Set((messages || []).map((message) => message.sender_id))];
  let profilesMap = new Map();

  if (senderIds.length) {
    const { data: profiles } = await supabase
      .from("app_profiles")
      .select("id, display_name, email")
      .in("id", senderIds);

    profilesMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  }

  DOM.messagesList.innerHTML = (messages || [])
    .map((message) => {
      const profile = profilesMap.get(message.sender_id);
      const senderLabel = profile?.display_name || profile?.email || message.sender_id.slice(0, 8);
      const own = message.sender_id === STATE.user.id;
      return `
        <div class="message-bubble ${own ? "mine" : ""}">
          <div class="message-meta">${escapeHtml(senderLabel)} • ${escapeHtml(formatDateTime(message.created_at))}</div>
          <div>${escapeHtml(message.body)}</div>
        </div>
      `;
    })
    .join("") || `<div class="compact-help">В этом чате пока нет сообщений.</div>`;

  DOM.messagesList.scrollTop = DOM.messagesList.scrollHeight;
}

async function createThread(form) {
  if (!STATE.schemaReady) {
    throw new Error("Сначала нужно выполнить platform_setup.sql в Supabase.");
  }

  const formData = new FormData(form);
  const threadType = String(formData.get("threadType") || "direct");
  const titleInput = String(formData.get("title") || "").trim();
  const emails = String(formData.get("emails") || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const uniqueEmails = [...new Set(emails)];
  let memberProfiles = [];

  if (uniqueEmails.length) {
    const { data, error } = await supabase
      .from("app_profiles")
      .select("id, email, display_name")
      .in("email", uniqueEmails);

    if (error) throw error;
    memberProfiles = data || [];
  }

  const memberIds = [...new Set(memberProfiles.map((profile) => profile.id).filter((id) => id && id !== STATE.user.id))];
  if (!memberIds.length) {
    throw new Error("Укажите хотя бы одного существующего участника по почте.");
  }

  const threadTitle =
    titleInput ||
    (threadType === "direct"
      ? memberProfiles[0]?.display_name || memberProfiles[0]?.email || "Личный чат"
      : `Группа ${new Date().toLocaleDateString("ru-RU")}`);

  const { data: thread, error: threadError } = await supabase
    .from("app_threads")
    .insert({
      thread_type: threadType,
      title: threadTitle,
      created_by: STATE.user.id
    })
    .select("*")
    .single();

  if (threadError) throw threadError;

  const memberships = [
    { thread_id: thread.id, user_id: STATE.user.id, member_role: "owner" },
    ...memberIds.map((userId) => ({ thread_id: thread.id, user_id: userId, member_role: "member" }))
  ];

  const { error: memberError } = await supabase.from("app_thread_members").insert(memberships);
  if (memberError) throw memberError;

  form.reset();
  await loadThreads();
  await loadMessages(thread.id);
}

async function sendMessage(form) {
  if (!STATE.activeThreadId) {
    throw new Error("Сначала выберите чат.");
  }

  const formData = new FormData(form);
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  const { error } = await supabase.from("app_messages").insert({
    thread_id: STATE.activeThreadId,
    sender_id: STATE.user.id,
    body
  });

  if (error) throw error;
  form.reset();
  await loadMessages(STATE.activeThreadId);
}

async function refreshCurrentView() {
  if (STATE.activeModule === "admin") {
    await loadAdminData();
    return;
  }
  if (STATE.activeModule === "messenger") {
    try {
      await loadThreads();
    } catch (error) {
      if (isMessengerPolicyRecursion(error)) {
        DOM.threadList.innerHTML = `<div class="compact-help">Мессенджер временно недоступен: выполните <code>platform_messenger_rls_fix.sql</code> в Supabase SQL Editor.</div>`;
        DOM.messagesList.innerHTML = `<div class="compact-help">После SQL-патча обновите платформу.</div>`;
        setShellStatus("Мессенджер временно отключён до выполнения platform_messenger_rls_fix.sql.", "warning");
        return;
      }
      throw error;
    }
    return;
  }
  if (STATE.activeModule === "dashboard") {
    await renderDashboard();
    return;
  }
  if (STATE.activeModule === "ai") {
    renderAiWidget();
    renderAiModule();
    DOM.placeholderView.classList.remove("d-none");
    return;
  }
  if (liveWorkspaceController.supports(STATE.activeModule)) {
    await liveWorkspaceController.refresh(STATE.activeModule);
    DOM.placeholderCard.innerHTML = await liveWorkspaceController.render(STATE.activeModule);
    liveWorkspaceController.afterRender(STATE.activeModule, DOM.placeholderCard);
    DOM.placeholderView.classList.remove("d-none");
    return;
  }
  if (MODULES[STATE.activeModule]?.type === "embed") {
    DOM.moduleFrame.src = DOM.moduleFrame.src;
  }
}

function bindAuthEvents() {
  DOM.authTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-auth-pane]");
    if (!button) return;
    showAuthPane(button.dataset.authPane);
  });

  document.querySelectorAll("[data-auth-pane-trigger]").forEach((button) => {
    button.addEventListener("click", () => showAuthPane(button.dataset.authPaneTrigger));
  });

  document.getElementById("signInForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Проверяю логин и пароль...");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") || "").trim(),
        password: String(formData.get("password") || "")
      });
      if (error) {
        setAuthStatus(error.message, "error");
        return;
      }
      setAuthStatus("Вход выполнен. Открываю платформу...", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось выполнить вход.", "error");
    }
  });

  document.getElementById("registerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Создаю учетную запись...");
    const { error } = await supabase.auth.signUp({
      email: String(formData.get("email") || "").trim(),
      password: String(formData.get("password") || ""),
      options: {
        emailRedirectTo: REDIRECT_URL,
        data: {
          display_name: String(formData.get("displayName") || "").trim()
        }
      }
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Аккаунт создан. Проверьте почту для подтверждения и входа.", "success");
  });

  document.getElementById("otpRequestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    setAuthStatus("Отправляю код на почту...");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false, emailRedirectTo: REDIRECT_URL }
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    const verifyEmailField = document.querySelector('#otpVerifyForm [name="email"]');
    if (verifyEmailField) verifyEmailField.value = email;
    setAuthStatus("Код отправлен. Введите его в нижнюю форму.", "success");
  });

  document.getElementById("otpVerifyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Подтверждаю код...");
    const { error } = await supabase.auth.verifyOtp({
      email: String(formData.get("email") || "").trim(),
      token: String(formData.get("token") || "").trim(),
      type: "email"
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Код подтвержден. Вход выполнен.", "success");
  });

  document.getElementById("resetRequestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Отправляю письмо для восстановления...");
    const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get("email") || "").trim(), {
      redirectTo: REDIRECT_URL
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Письмо для восстановления отправлено.", "success");
  });

  document.getElementById("updatePasswordForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setAuthStatus("Сохраняю новый пароль...");
    const { error } = await supabase.auth.updateUser({
      password: String(formData.get("password") || "")
    });
    if (error) {
      setAuthStatus(error.message, "error");
      return;
    }
    setAuthStatus("Новый пароль сохранен. Теперь можно войти.", "success");
  });
}

function bindAppEvents() {
  window.addEventListener("dom-neona:workspace-open", async (event) => {
    const detail = event?.detail && typeof event.detail === "object" ? event.detail : {};
    if (!detail.moduleKey) return;
    liveWorkspaceController.focusEntity(detail.moduleKey, detail);
    await openModule(detail.moduleKey);
  });

  DOM.moduleNav.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-module-key]");
    if (!button) return;
    await openModule(button.dataset.moduleKey);
  });

  DOM.dashboardGrid.addEventListener("click", async (event) => {
    const periodButton = event.target.closest("[data-dashboard-period]");
    if (periodButton) {
      setDashboardPeriod(periodButton.dataset.dashboardPeriod);
      return;
    }
    const button = event.target.closest("[data-dashboard-open]");
    if (!button) return;
    await openModule(button.dataset.dashboardOpen);
  });

  DOM.dashboardGrid.addEventListener("mousemove", (event) => {
    const pointTarget = event.target.closest("[data-chart-label]");
    if (!pointTarget) {
      hideDashboardTooltip();
      return;
    }
    showDashboardTooltip(event, getDashboardTooltipPoint(pointTarget));
  });

  DOM.dashboardGrid.addEventListener("mouseleave", () => {
    hideDashboardTooltip();
  });

  DOM.placeholderCard.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-placeholder-open]");
    if (button) {
      await openModule(button.dataset.placeholderOpen);
      return;
    }
    if (STATE.activeModule === "ai") {
      const closeButton = event.target.closest("[data-ai-close]");
      if (closeButton) {
        await openModule(STATE.lastNonAiModule || "dashboard");
        return;
      }
      const suggestion = event.target.closest("[data-ai-suggest]");
      if (suggestion) {
        await askDomovoyNeonik(suggestion.dataset.aiSuggest, "module");
        return;
      }
      const clearButton = event.target.closest("[data-ai-clear]");
      if (clearButton) {
        STATE.ai.history = [];
        renderAiWidget();
        renderAiModule();
        return;
      }
    }
    if (!liveWorkspaceController.supports(STATE.activeModule)) return;
    try {
      await liveWorkspaceController.handleClick(event, STATE.activeModule);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось выполнить действие в модуле.", "error");
    }
  });

  DOM.placeholderCard.addEventListener("input", (event) => {
    if (!liveWorkspaceController.supports(STATE.activeModule)) return;
    liveWorkspaceController.handleInput(event, STATE.activeModule);
  });

  DOM.placeholderCard.addEventListener("change", async (event) => {
    if (!liveWorkspaceController.supports(STATE.activeModule)) return;
    try {
      await liveWorkspaceController.handleChange(event, STATE.activeModule);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось обновить данные модуля.", "error");
    }
  });

  DOM.placeholderCard.addEventListener("submit", async (event) => {
    if (STATE.activeModule === "ai") {
      const form = event.target.closest("#aiModuleForm");
      if (!form) return;
      event.preventDefault();
      const formData = new FormData(form);
      form.reset();
      await askDomovoyNeonik(formData.get("question"), "module");
      return;
    }
    if (!liveWorkspaceController.supports(STATE.activeModule)) return;
    try {
      await liveWorkspaceController.handleSubmit(event, STATE.activeModule);
    } catch (error) {
      event.preventDefault();
      setAuthStatus(error.message || "Не удалось сохранить данные модуля.", "error");
    }
  });

  DOM.signOutButton?.addEventListener("click", async () => {
    await supabase.auth.signOut();
  });

  DOM.refreshButton?.addEventListener("click", async () => {
    await refreshCurrentView();
  });

  DOM.sidebarToggleButton?.addEventListener("click", () => {
    toggleSidebarCollapsed();
  });

  DOM.wideModeButton?.addEventListener("click", () => {
    toggleWideMode();
  });

  DOM.aiWidgetToggle?.addEventListener("click", () => {
    renderAiWidget();
    DOM.aiWidgetPanel?.classList.toggle("d-none");
  });

  DOM.aiWidgetClose?.addEventListener("click", () => {
    DOM.aiWidgetPanel?.classList.add("d-none");
  });

  DOM.aiWidgetPanel?.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-ai-open]");
    if (button) {
      DOM.aiWidgetPanel?.classList.add("d-none");
      await openModule(button.dataset.aiOpen);
      return;
    }
    const suggestion = event.target.closest("[data-ai-suggest]");
    if (!suggestion) return;
    await askDomovoyNeonik(suggestion.dataset.aiSuggest, "widget");
  });

  DOM.aiWidgetPanel?.addEventListener("submit", async (event) => {
    const form = event.target.closest("#aiWidgetForm");
    if (!form) return;
    event.preventDefault();
    const formData = new FormData(form);
    form.reset();
    await askDomovoyNeonik(formData.get("question"), "widget");
  });

  DOM.profileCard?.addEventListener("click", async (event) => {
    const toggle = event.target.closest("[data-profile-menu-toggle]");
    if (toggle) {
      STATE.menu.profileOpen = !STATE.menu.profileOpen;
      renderProfileCard();
      return;
    }

    const actionButton = event.target.closest("[data-profile-action]");
    if (!actionButton) return;

    STATE.menu.profileOpen = false;
    const action = actionButton.dataset.profileAction;
    if (action === "wide") {
      toggleWideMode();
      return;
    }
    if (action === "refresh") {
      await refreshCurrentView();
      renderProfileCard();
      return;
    }
    if (action === "signout") {
      await supabase.auth.signOut();
    }
  });

  document.addEventListener("click", (event) => {
    if (!STATE.menu.profileOpen) return;
    if (event.target.closest("#profileCard")) return;
    STATE.menu.profileOpen = false;
    renderProfileCard();
  });

  document.getElementById("reloadUsersButton").addEventListener("click", async () => {
    await loadAdminData();
  });

  document.getElementById("reloadThreadsButton").addEventListener("click", async () => {
    await loadThreads();
  });

  DOM.adminUsersBody.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-select-user]");
    if (!button) return;
    STATE.selectedUserId = button.dataset.selectUser;
    renderUserTable();
  });

  DOM.userAccessEditor.addEventListener("click", (event) => {
    const applyButton = event.target.closest("[data-apply-role-template]");
    if (!applyButton) return;
    applyRoleTemplateToSelectedUser();
  });

  DOM.userAccessEditor.addEventListener("click", (event) => {
    const presetButton = event.target.closest("[data-user-preset]");
    if (!presetButton) return;
    const grid = document.getElementById("userPermissionsGrid");
    if (!grid) return;
    renderPermissionGrid(grid, applyPermissionPreset(getPermissionMapFromForm(grid, "user"), presetButton.dataset.userPreset), "user");
  });

  DOM.userAccessEditor.addEventListener("change", (event) => {
    const roleSelect = event.target.closest('#userAccessForm select[name="role"]');
    if (!roleSelect) return;
    applyRoleTemplateToSelectedUser();
  });

  DOM.userAccessEditor.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-user-module]");
    if (!checkbox) return;
    const grid = document.getElementById("userPermissionsGrid");
    if (!grid) return;
    renderPermissionGrid(grid, getPermissionMapFromForm(grid, "user"), "user");
  });

  DOM.userAccessEditor.addEventListener("submit", async (event) => {
    const form = event.target.closest("#userAccessForm");
    if (!form) return;
    event.preventDefault();
    try {
      await saveUserProfile(form.dataset.userId);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить пользователя.", "error");
    }
  });

  DOM.roleTemplatesBody.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-role]");
    if (!button) return;
    STATE.editingRoleKey = button.dataset.editRole;
    renderRoleTemplatesTable();
    fillRoleTemplateForm(getRoleTemplate(STATE.editingRoleKey));
  });

  DOM.roleTemplateForm.addEventListener("click", (event) => {
    const presetButton = event.target.closest("[data-role-preset]");
    if (!presetButton) return;
    renderPermissionGrid(
      DOM.rolePermissionsGrid,
      applyPermissionPreset(getPermissionMapFromForm(DOM.rolePermissionsGrid, "role"), presetButton.dataset.rolePreset),
      "role"
    );
  });

  DOM.roleTemplateForm.addEventListener("change", (event) => {
    const checkbox = event.target.closest("[data-role-module]");
    if (!checkbox) return;
    renderPermissionGrid(DOM.rolePermissionsGrid, getPermissionMapFromForm(DOM.rolePermissionsGrid, "role"), "role");
  });

  DOM.newRoleButton.addEventListener("click", () => {
    STATE.editingRoleKey = null;
    DOM.roleTemplateForm.reset();
    DOM.roleTemplateForm.elements.role_key.readOnly = false;
    DOM.deleteRoleTemplateButton.classList.add("d-none");
    renderPermissionGrid(DOM.rolePermissionsGrid, createEmptyPermissionMap(), "role");
    renderRoleTemplatesTable();
  });

  DOM.resetRoleFormButton.addEventListener("click", () => {
    fillRoleTemplateForm(getRoleTemplate(STATE.editingRoleKey));
  });

  DOM.roleTemplateForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await saveRoleTemplate();
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить роль.", "error");
    }
  });

  DOM.deleteRoleTemplateButton.addEventListener("click", async () => {
    try {
      await deleteRoleTemplate();
    } catch (error) {
      setAuthStatus(error.message || "Не удалось удалить роль.", "error");
    }
  });

  document.getElementById("partnerForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createPartner(event.currentTarget);
      setAuthStatus("Партнер сохранен.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить партнера.", "error");
    }
  });

  document.getElementById("domovoyConfigForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const apiBaseUrl = String(form.elements.domovoyApiBaseUrl.value || "").trim().replace(/\/+$/, "");
      await savePlatformConfigPatch({ domovoyApiBaseUrl: apiBaseUrl });
      setAuthStatus("Настройки Домового Неоника сохранены.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось сохранить настройки Домового Неоника.", "error");
    }
  });

  document.getElementById("domovoyHealthButton")?.addEventListener("click", async () => {
    try {
      const payload = await checkDomovoyHealth();
      setAuthStatus(
        payload?.mode === "llm"
          ? "Домовой Неоник подключён к серверному ИИ."
          : "Домовой Неоник работает, но сейчас в резервном режиме.",
        "success"
      );
    } catch (error) {
      setAuthStatus(error.message || "Не удалось проверить API Домового Неоника.", "error");
    }
  });

  document.getElementById("domovoySyncButton")?.addEventListener("click", async () => {
    try {
      await syncDomovoySources();
      setAuthStatus("Синхронизация 24lite.ru и domneon.ru запущена.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось запустить синхронизацию Домового Неоника.", "error");
    }
  });

  document.getElementById("threadCreateForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createThread(event.currentTarget);
      setAuthStatus("Чат создан.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось создать чат.", "error");
    }
  });

  DOM.threadList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-open-thread]");
    if (!button) return;
    try {
      await loadMessages(button.dataset.openThread);
    } catch (error) {
      setAuthStatus(error.message || "Не удалось открыть чат.", "error");
    }
  });

  document.getElementById("messageForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await sendMessage(event.currentTarget);
      setAuthStatus("Сообщение отправлено.", "success");
    } catch (error) {
      setAuthStatus(error.message || "Не удалось отправить сообщение.", "error");
    }
  });
}

async function init() {
  bindAuthEvents();
  bindAppEvents();

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
      showAuthScreen();
      showAuthPane("reset");
      setAuthStatus("Можно задать новый пароль.", "success");
      return;
    }

    if (event === "SIGNED_OUT") {
      STATE.session = null;
      STATE.user = null;
      STATE.profile = null;
      STATE.loadedEmbedKey = null;
      STATE.loadedEmbedSrc = "";
      STATE.queuedBootstrapSignature = "";
      if (STATE.queuedBootstrapTimer) {
        window.clearTimeout(STATE.queuedBootstrapTimer);
        STATE.queuedBootstrapTimer = null;
      }
      STATE.threads = [];
      STATE.users = [];
      STATE.partnerProfiles = [];
      STATE.roleTemplates = [];
      STATE.selectedUserId = null;
      STATE.editingRoleKey = null;
      showAuthScreen();
      setAuthStatus("Вы вышли из системы.");
      return;
    }

    if (
      session &&
      STATE.user?.id === session.user.id &&
      !DOM.appShell.classList.contains("d-none")
    ) {
      STATE.session = session;
      STATE.user = session.user;
      return;
    }

    if (session) {
      queuePlatformBootstrap(session);
    }
  });

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    setAuthStatus(error.message || "Не удалось прочитать сессию.", "error");
    return;
  }

  if (data.session) {
    await openPlatformForSession(data.session);
  } else {
    showAuthScreen();
  }
}

init().catch((error) => {
  console.error(error);
  showAuthScreen();
  setAuthStatus(error.message || "Платформа не смогла запуститься.", "error");
});


