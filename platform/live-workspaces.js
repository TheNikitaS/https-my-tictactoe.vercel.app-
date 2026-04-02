const LIVE_MODULE_CONFIG = {
  crm: {
    appId: "platform_crm_v1",
    intro:
      "Живой коммерческий контур: воронка сделок, ответственные, сроки, суммы и быстрый перевод сделки между стадиями без двойного ввода.",
    links: ["sales", "light2", "tasks"]
  },
  warehouse: {
    appId: "platform_warehouse_v1",
    intro:
      "Единый складской контур: каталог материалов, движения, резервы и контроль дефицита. Данные можно расширять без нового SQL-слоя.",
    links: ["light2", "my_calculator", "crm"]
  },
  tasks: {
    appId: "platform_tasks_v1",
    intro:
      "Рабочая доска команды: задачи, итерации, приоритеты, сроки и быстрый контроль статусов по всем направлениям платформы.",
    links: ["crm", "messenger", "ai"]
  }
};

const CRM_STAGES = [
  { key: "lead", label: "Новый лид", tone: "neutral" },
  { key: "qualified", label: "Квалификация", tone: "info" },
  { key: "quote", label: "КП / счёт", tone: "accent" },
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

function createId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function toNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
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
    return value.slice(0, 10);
  }
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

function createDefaultCrmDoc() {
  return { version: 1, deals: [], updatedAt: new Date().toISOString() };
}

function createDefaultWarehouseDoc() {
  return { version: 1, items: [], movements: [], updatedAt: new Date().toISOString() };
}

function createDefaultTasksDoc() {
  return { version: 1, sprints: [], tasks: [], updatedAt: new Date().toISOString() };
}

function normalizeCrmDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultCrmDoc();
  next.deals = Array.isArray(next.deals) ? next.deals : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeWarehouseDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultWarehouseDoc();
  next.items = Array.isArray(next.items) ? next.items : [];
  next.movements = Array.isArray(next.movements) ? next.movements : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
}

function normalizeTasksDoc(payload) {
  const next = payload && typeof payload === "object" ? deepClone(payload) : createDefaultTasksDoc();
  next.sprints = Array.isArray(next.sprints) ? next.sprints : [];
  next.tasks = Array.isArray(next.tasks) ? next.tasks : [];
  next.updatedAt = next.updatedAt || new Date().toISOString();
  return next;
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
  const docs = {
    crm: null,
    warehouse: null,
    tasks: null
  };

  const ui = {
    crm: { search: "", stage: "all", owner: "all", editId: null },
    warehouse: { search: "", category: "all", itemEditId: null, movementItemId: "" },
    tasks: { search: "", status: "all", sprint: "all", owner: "all", taskEditId: null, sprintEditId: null }
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

    const appId = LIVE_MODULE_CONFIG[moduleKey].appId;
    const { data, error } = await supabase
      .from("shared_app_states")
      .select("app_id, payload")
      .eq("app_id", appId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    docs[moduleKey] = docNormalizers[moduleKey](data?.payload);
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
    const { data, error } = await supabase
      .from("shared_app_states")
      .select("app_id")
      .eq("app_id", appId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    if (data?.app_id) {
      const { error: updateError } = await supabase
        .from("shared_app_states")
        .update({ payload: nextDoc })
        .eq("app_id", appId);
      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase.from("shared_app_states").insert({
        app_id: appId,
        payload: nextDoc
      });
      if (insertError) throw insertError;
    }

    if (successMessage) setStatus(successMessage, "success");
    rerenderDashboard();
    return nextDoc;
  }

  function renderRelatedLinks(moduleKey) {
    const config = LIVE_MODULE_CONFIG[moduleKey];
    const links = (config.links || [])
      .filter((key) => hasModuleAccess(key))
      .map((key) => {
        const module = modules[key];
        return `
          <button class="btn btn-sm btn-outline-dark" type="button" data-placeholder-open="${escapeHtml(key)}">
            ${escapeHtml(module?.title || key)}
          </button>
        `;
      })
      .join("");

    return `
      <div class="workspace-links">
        <div class="compact-help">Связанные разделы платформы</div>
        <div class="d-flex flex-wrap gap-2">${links || '<span class="text-muted">Связанные разделы появятся после выдачи доступов.</span>'}</div>
      </div>
    `;
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
        ${metrics
          .map(
            (metric) => `
              <article class="workspace-metric">
                <span>${escapeHtml(metric.label)}</span>
                <strong>${escapeHtml(metric.value)}</strong>
                ${metric.caption ? `<small>${escapeHtml(metric.caption)}</small>` : ""}
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderAccessHint(moduleKey) {
    return `
      <div class="workspace-empty">
        <strong>${escapeHtml(modules[moduleKey]?.title || moduleKey)}</strong>
        <div class="mt-2">Для этого раздела у вашей роли сейчас только просмотр. Записи можно анализировать, но не редактировать.</div>
      </div>
    `;
  }

  function getFilteredCrmDeals(doc) {
    const filters = ui.crm;
    const list = sortByDateDesc(doc.deals || [], "updatedAt");
    return list.filter((deal) => {
      const searchBlob = [deal.title, deal.client, deal.channel, deal.owner, deal.note].join(" ");
      if (!matchesSearch(searchBlob, filters.search)) return false;
      if (filters.stage !== "all" && deal.stage !== filters.stage) return false;
      if (filters.owner !== "all" && compactText(deal.owner) !== filters.owner) return false;
      return true;
    });
  }

  function renderCrmCard(deal, canEdit, canManage) {
    const stage = getCrmStageMeta(deal.stage);
    return `
      <article class="workspace-card workspace-card--${escapeHtml(stage.tone)}">
        <div class="workspace-card__head">
          <strong>${escapeHtml(deal.title || "Сделка")}</strong>
          <span>${escapeHtml(formatMoney(deal.amount || 0))}</span>
        </div>
        <div class="workspace-card__meta">${escapeHtml(deal.client || "Клиент не указан")} • ${escapeHtml(deal.channel || "Канал не указан")}</div>
        <div class="workspace-card__meta">${escapeHtml(deal.owner || "Ответственный не назначен")} • срок ${escapeHtml(formatDate(deal.deadline))}</div>
        ${deal.note ? `<div class="workspace-card__note">${escapeHtml(deal.note)}</div>` : ""}
        <div class="workspace-card__footer">
          ${
            canEdit
              ? `
                <select class="form-select form-select-sm workspace-inline-select" data-crm-stage-select="${escapeHtml(deal.id)}">
                  ${CRM_STAGES.map(
                    (item) => `<option value="${escapeHtml(item.key)}" ${item.key === deal.stage ? "selected" : ""}>${escapeHtml(item.label)}</option>`
                  ).join("")}
                </select>
              `
              : `<span class="workspace-tag workspace-tag--${escapeHtml(stage.tone)}">${escapeHtml(stage.label)}</span>`
          }
          <div class="workspace-card__actions">
            ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">Изменить</button>` : ""}
            ${
              canManage
                ? `<button class="btn btn-sm btn-outline-danger" type="button" data-crm-delete="${escapeHtml(deal.id)}">Удалить</button>`
                : ""
            }
          </div>
        </div>
      </article>
    `;
  }

  function renderCrm(doc) {
    const canEdit = hasModulePermission("crm", "edit");
    const canManage = hasModulePermission("crm", "manage");
    const filters = ui.crm;
    const filtered = getFilteredCrmDeals(doc);
    const owners = [...new Set((doc.deals || []).map((deal) => compactText(deal.owner)).filter(Boolean))].sort();
    const openDeals = (doc.deals || []).filter((deal) => !["done", "lost"].includes(deal.stage));
    const overdueCount = openDeals.filter((deal) => normalizeDateInput(deal.deadline) && normalizeDateInput(deal.deadline) < todayString()).length;
    const editDeal = (doc.deals || []).find((deal) => deal.id === ui.crm.editId) || null;

    const metrics = [
      { label: "Активные сделки", value: formatNumber(openDeals.length), caption: "без закрытых и потерянных" },
      { label: "Сумма в воронке", value: formatMoney(sumBy(openDeals, (deal) => deal.amount || 0)), caption: "по текущим стадиям" },
      { label: "В производстве", value: formatNumber((doc.deals || []).filter((deal) => deal.stage === "production").length), caption: "готовы к исполнению" },
      { label: "Просрочено", value: formatNumber(overdueCount), caption: "требуют внимания" }
    ];

    const dealTableRows =
      filtered.length > 0
        ? filtered
            .map((deal) => {
              const stage = getCrmStageMeta(deal.stage);
              return `
                <tr>
                  <td>${escapeHtml(deal.title || "Сделка")}</td>
                  <td>${escapeHtml(deal.client || "—")}</td>
                  <td>${escapeHtml(stage.label)}</td>
                  <td>${escapeHtml(deal.owner || "—")}</td>
                  <td>${escapeHtml(deal.channel || "—")}</td>
                  <td>${escapeHtml(formatMoney(deal.amount || 0))}</td>
                  <td>${escapeHtml(formatDate(deal.deadline))}</td>
                  <td class="text-end">
                    ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-crm-edit="${escapeHtml(deal.id)}">Открыть</button>` : ""}
                  </td>
                </tr>
              `;
            })
            .join("")
        : `<tr><td colspan="8" class="text-muted">По текущим фильтрам сделок нет.</td></tr>`;

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("crm")}
        ${renderMetricGrid(metrics)}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по клиенту, каналу, названию" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="stage">
              <option value="all">Все стадии</option>
              ${CRM_STAGES.map(
                (stage) => `<option value="${escapeHtml(stage.key)}" ${filters.stage === stage.key ? "selected" : ""}>${escapeHtml(stage.label)}</option>`
              ).join("")}
            </select>
            <select class="form-select" data-live-filter="owner">
              <option value="all">Все ответственные</option>
              ${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}
            </select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-crm-new>Новая сделка</button>` : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`}
          </div>
        </div>
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>${editDeal ? "Карточка сделки" : "Новая сделка"}</h4>
                <div class="compact-help">Карточка строится под ваш цикл: лид → квалификация → КП/счёт → производство → закрытие.</div>
              </div>
            </div>
            ${
              canEdit
                ? `
                  <form id="crmDealForm" class="workspace-form">
                    <input type="hidden" name="id" value="${escapeHtml(editDeal?.id || "")}" />
                    <div class="workspace-form-grid">
                      <label><span>Название сделки</span><input class="form-control" type="text" name="title" value="${escapeHtml(editDeal?.title || "")}" required /></label>
                      <label><span>Клиент</span><input class="form-control" type="text" name="client" value="${escapeHtml(editDeal?.client || "")}" required /></label>
                      <label><span>Канал</span><input class="form-control" type="text" name="channel" value="${escapeHtml(editDeal?.channel || "")}" placeholder="Сайт, Авито, рекомендация..." /></label>
                      <label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editDeal?.owner || "")}" /></label>
                      <label>
                        <span>Стадия</span>
                        <select class="form-select" name="stage">
                          ${CRM_STAGES.map(
                            (stage) => `<option value="${escapeHtml(stage.key)}" ${(editDeal?.stage || "lead") === stage.key ? "selected" : ""}>${escapeHtml(stage.label)}</option>`
                          ).join("")}
                        </select>
                      </label>
                      <label><span>Сумма, ₽</span><input class="form-control" type="number" min="0" step="1" name="amount" value="${escapeHtml(String(toNumber(editDeal?.amount || 0) || ""))}" /></label>
                      <label><span>Срок</span><input class="form-control" type="date" name="deadline" value="${escapeHtml(normalizeDateInput(editDeal?.deadline || ""))}" /></label>
                    </div>
                    <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4" placeholder="Что важно по сделке">${escapeHtml(editDeal?.note || "")}</textarea></label>
                    <div class="workspace-form__actions">
                      <button class="btn btn-dark" type="submit">${editDeal ? "Сохранить изменения" : "Добавить сделку"}</button>
                      <button class="btn btn-outline-secondary" type="button" data-crm-new>Очистить форму</button>
                    </div>
                  </form>
                `
                : renderAccessHint("crm")
            }
          </section>
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>Фокус недели</h4>
                <div class="compact-help">Быстрый срез по тем сделкам, которым прямо сейчас нужен контроль.</div>
              </div>
            </div>
            <div class="workspace-stack">
              ${(sortByDateDesc(openDeals, "deadline").slice(0, 6) || [])
                .map((deal) => {
                  const stage = getCrmStageMeta(deal.stage);
                  return `
                    <div class="workspace-list-item">
                      <div>
                        <strong>${escapeHtml(deal.title || "Сделка")}</strong>
                        <div class="workspace-list-item__meta">${escapeHtml(deal.client || "—")} • ${escapeHtml(deal.owner || "—")}</div>
                      </div>
                      <div class="text-end">
                        <div class="workspace-tag workspace-tag--${escapeHtml(stage.tone)}">${escapeHtml(stage.label)}</div>
                        <div class="workspace-list-item__meta mt-1">${escapeHtml(formatDate(deal.deadline))}</div>
                      </div>
                    </div>
                  `;
                })
                .join("") || '<div class="workspace-empty">Активных сделок пока нет.</div>'}
            </div>
          </section>
        </div>
        <section class="workspace-panel">
          <div class="panel-heading">
            <div>
              <h4>Воронка сделок</h4>
              <div class="compact-help">Карточки можно быстро переводить между стадиями прямо из списка.</div>
            </div>
            <div class="workspace-note">Показано: ${escapeHtml(String(filtered.length))}</div>
          </div>
          <div class="workspace-board workspace-board--crm">
            ${CRM_STAGES.map((stage) => {
              const stageDeals = filtered.filter((deal) => deal.stage === stage.key);
              return `
                <article class="workspace-lane">
                  <div class="workspace-lane__head">
                    <strong>${escapeHtml(stage.label)}</strong>
                    <span>${escapeHtml(String(stageDeals.length))}</span>
                  </div>
                  <div class="workspace-lane__body">
                    ${stageDeals.map((deal) => renderCrmCard(deal, canEdit, canManage)).join("") || '<div class="workspace-empty workspace-empty--tight">Пусто</div>'}
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </section>
        <section class="workspace-panel">
          <div class="panel-heading">
            <div>
              <h4>Список сделок</h4>
              <div class="compact-help">Нижняя таблица удобна для быстрого поиска и перехода к нужной карточке.</div>
            </div>
          </div>
          <div class="table-shell">
            <table class="table table-sm align-middle workspace-table">
              <thead>
                <tr>
                  <th>Сделка</th>
                  <th>Клиент</th>
                  <th>Стадия</th>
                  <th>Ответственный</th>
                  <th>Канал</th>
                  <th>Сумма</th>
                  <th>Срок</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>${dealTableRows}</tbody>
            </table>
          </div>
        </section>
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

      return {
        ...item,
        opening,
        onHand,
        reserved,
        available,
        low: available <= toNumber(item.minStock)
      };
    });

    return {
      items,
      lowItems: items.filter((item) => item.low),
      reservedTotal: sumBy(items, (item) => item.reserved),
      availableTotal: sumBy(items, (item) => item.available),
      onHandTotal: sumBy(items, (item) => item.onHand)
    };
  }

  function renderWarehouse(doc) {
    const canEdit = hasModulePermission("warehouse", "edit");
    const canManage = hasModulePermission("warehouse", "manage");
    const filters = ui.warehouse;
    const snapshot = buildWarehouseSnapshot(doc);
    const categories = [...new Set((doc.items || []).map((item) => compactText(item.category)).filter(Boolean))].sort();
    const filteredItems = snapshot.items.filter((item) => {
      const blob = [item.name, item.sku, item.category, item.note].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (filters.category !== "all" && compactText(item.category) !== filters.category) return false;
      return true;
    });
    const editItem = (doc.items || []).find((item) => item.id === filters.itemEditId) || null;
    const recentMovements = sortByDateDesc(doc.movements || [], "date").slice(0, 10);

    const metrics = [
      { label: "Позиций", value: formatNumber(snapshot.items.length), caption: "в каталоге материалов" },
      { label: "На руках", value: formatNumber(snapshot.onHandTotal), caption: "общее количество" },
      { label: "В резерве", value: formatNumber(snapshot.reservedTotal), caption: "под текущие заказы" },
      { label: "Нужно пополнить", value: formatNumber(snapshot.lowItems.length), caption: "ниже минимального запаса" }
    ];

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("warehouse")}
        ${renderMetricGrid(metrics)}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по позиции, SKU, категории" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="category">
              <option value="all">Все категории</option>
              ${categories.map((category) => `<option value="${escapeHtml(category)}" ${filters.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
            </select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${
              canEdit
                ? `
                  <button class="btn btn-dark" type="button" data-warehouse-item-new>Новая позиция</button>
                  <button class="btn btn-outline-dark" type="button" data-warehouse-movement-pick="">Новое движение</button>
                `
                : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`
            }
          </div>
        </div>
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>${editItem ? "Редактирование позиции" : "Новая позиция склада"}</h4>
                <div class="compact-help">Каталог можно использовать как общий справочник материалов для складского контура и будущих калькуляторов.</div>
              </div>
            </div>
            ${
              canEdit
                ? `
                  <form id="warehouseItemForm" class="workspace-form">
                    <input type="hidden" name="id" value="${escapeHtml(editItem?.id || "")}" />
                    <div class="workspace-form-grid">
                      <label><span>Название</span><input class="form-control" type="text" name="name" value="${escapeHtml(editItem?.name || "")}" required /></label>
                      <label><span>SKU / артикул</span><input class="form-control" type="text" name="sku" value="${escapeHtml(editItem?.sku || "")}" /></label>
                      <label><span>Категория</span><input class="form-control" type="text" name="category" value="${escapeHtml(editItem?.category || "")}" placeholder="Неон, блоки питания, крепёж..." /></label>
                      <label><span>Ед. изм.</span><input class="form-control" type="text" name="unit" value="${escapeHtml(editItem?.unit || "шт")}" /></label>
                      <label><span>Стартовый остаток</span><input class="form-control" type="number" min="0" step="1" name="openingStock" value="${escapeHtml(String(toNumber(editItem?.openingStock || 0) || ""))}" /></label>
                      <label><span>Минимум</span><input class="form-control" type="number" min="0" step="1" name="minStock" value="${escapeHtml(String(toNumber(editItem?.minStock || 0) || ""))}" /></label>
                    </div>
                    <label><span>Комментарий</span><textarea class="form-control" name="note" rows="3">${escapeHtml(editItem?.note || "")}</textarea></label>
                    <div class="workspace-form__actions">
                      <button class="btn btn-dark" type="submit">${editItem ? "Сохранить позицию" : "Добавить позицию"}</button>
                      <button class="btn btn-outline-secondary" type="button" data-warehouse-item-new>Очистить форму</button>
                    </div>
                  </form>
                `
                : renderAccessHint("warehouse")
            }
          </section>
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>Движение по складу</h4>
                <div class="compact-help">Приход, списание и резервы лучше вносить отдельно — тогда остатки и доступное количество считаются автоматически.</div>
              </div>
            </div>
            ${
              canEdit
                ? `
                  <form id="warehouseMovementForm" class="workspace-form">
                    <div class="workspace-form-grid">
                      <label>
                        <span>Позиция</span>
                        <select class="form-select" name="itemId" required>
                          <option value="">Выберите позицию</option>
                          ${(doc.items || [])
                            .map(
                              (item) =>
                                `<option value="${escapeHtml(item.id)}" ${filters.movementItemId === item.id ? "selected" : ""}>${escapeHtml(item.name)}${item.sku ? ` (${escapeHtml(item.sku)})` : ""}</option>`
                            )
                            .join("")}
                        </select>
                      </label>
                      <label>
                        <span>Тип</span>
                        <select class="form-select" name="kind">
                          ${WAREHOUSE_MOVEMENT_TYPES.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}
                        </select>
                      </label>
                      <label><span>Количество</span><input class="form-control" type="number" min="0" step="1" name="qty" required /></label>
                      <label><span>Дата</span><input class="form-control" type="date" name="date" value="${escapeHtml(todayString())}" /></label>
                    </div>
                    <label><span>Комментарий</span><textarea class="form-control" name="note" rows="3" placeholder="Например: резерв под заказ или приход от поставщика"></textarea></label>
                    <div class="workspace-form__actions">
                      <button class="btn btn-dark" type="submit">Сохранить движение</button>
                    </div>
                  </form>
                `
                : renderAccessHint("warehouse")
            }
          </section>
        </div>
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>Текущие остатки</h4>
                <div class="compact-help">Доступное количество = на руках − резерв.</div>
              </div>
            </div>
            <div class="table-shell">
              <table class="table table-sm align-middle workspace-table">
                <thead>
                  <tr>
                    <th>Позиция</th>
                    <th>Категория</th>
                    <th>На руках</th>
                    <th>Резерв</th>
                    <th>Доступно</th>
                    <th>Минимум</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    filteredItems.length
                      ? filteredItems
                          .map(
                            (item) => `
                              <tr>
                                <td>
                                  <strong>${escapeHtml(item.name)}</strong>
                                  <div class="workspace-table__sub">${escapeHtml(item.sku || "без артикула")} • ${escapeHtml(item.unit || "шт")}</div>
                                </td>
                                <td>${escapeHtml(item.category || "—")}</td>
                                <td>${escapeHtml(formatNumber(item.onHand))}</td>
                                <td>${escapeHtml(formatNumber(item.reserved))}</td>
                                <td><span class="workspace-tag ${item.low ? "workspace-tag--danger" : "workspace-tag--success"}">${escapeHtml(formatNumber(item.available))}</span></td>
                                <td>${escapeHtml(formatNumber(item.minStock || 0))}</td>
                                <td class="text-end">
                                  <div class="d-flex justify-content-end gap-2">
                                    ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-warehouse-item-edit="${escapeHtml(item.id)}">Изменить</button><button class="btn btn-sm btn-outline-secondary" type="button" data-warehouse-movement-pick="${escapeHtml(item.id)}">Движение</button>` : ""}
                                    ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-item-delete="${escapeHtml(item.id)}">Удалить</button>` : ""}
                                  </div>
                                </td>
                              </tr>
                            `
                          )
                          .join("")
                      : '<tr><td colspan="7" class="text-muted">Позиции не найдены. Добавьте первую запись или смените фильтр.</td></tr>'
                  }
                </tbody>
              </table>
            </div>
          </section>
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>Последние движения</h4>
                <div class="compact-help">Отсюда удобно контролировать, что и когда ушло в резерв или было списано.</div>
              </div>
            </div>
            <div class="table-shell">
              <table class="table table-sm align-middle workspace-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Позиция</th>
                    <th>Тип</th>
                    <th>Кол-во</th>
                    <th>Комментарий</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    recentMovements.length
                      ? recentMovements
                          .map((movement) => {
                            const item = (doc.items || []).find((entry) => entry.id === movement.itemId);
                            const kind = WAREHOUSE_MOVEMENT_TYPES.find((entry) => entry.key === movement.kind);
                            return `
                              <tr>
                                <td>${escapeHtml(formatDate(movement.date))}</td>
                                <td>${escapeHtml(item?.name || "Позиция удалена")}</td>
                                <td>${escapeHtml(kind?.label || movement.kind)}</td>
                                <td>${escapeHtml(formatNumber(movement.qty || 0))}</td>
                                <td>${escapeHtml(movement.note || "—")}</td>
                                <td class="text-end">${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-warehouse-movement-delete="${escapeHtml(movement.id)}">Удалить</button>` : ""}</td>
                              </tr>
                            `;
                          })
                          .join("")
                      : '<tr><td colspan="6" class="text-muted">Движений пока нет.</td></tr>'
                  }
                </tbody>
              </table>
            </div>
            <div class="workspace-stack mt-3">
              <div class="panel-heading panel-heading--compact">
                <div>
                  <h4>Нужно пополнить</h4>
                  <div class="compact-help">Критичные позиции, где доступный остаток ниже минимума.</div>
                </div>
              </div>
              ${
                snapshot.lowItems.length
                  ? snapshot.lowItems
                      .map(
                        (item) => `
                          <div class="workspace-list-item">
                            <div>
                              <strong>${escapeHtml(item.name)}</strong>
                              <div class="workspace-list-item__meta">${escapeHtml(item.category || "—")}</div>
                            </div>
                            <div class="text-end">
                              <div class="workspace-tag workspace-tag--danger">${escapeHtml(formatNumber(item.available))}</div>
                              <div class="workspace-list-item__meta mt-1">минимум ${escapeHtml(formatNumber(item.minStock || 0))}</div>
                            </div>
                          </div>
                        `
                      )
                      .join("")
                  : '<div class="workspace-empty workspace-empty--tight">Критичных остатков нет.</div>'
              }
            </div>
          </section>
        </div>
        ${renderRelatedLinks("warehouse")}
      </div>
    `;
  }

  function getTasksDecorated(doc) {
    const sprintMap = new Map((doc.sprints || []).map((sprint) => [sprint.id, sprint]));
    return (doc.tasks || []).map((task) => ({
      ...task,
      sprint: sprintMap.get(task.sprintId) || null
    }));
  }

  function renderTasks(doc) {
    const canEdit = hasModulePermission("tasks", "edit");
    const canManage = hasModulePermission("tasks", "manage");
    const filters = ui.tasks;
    const taskList = getTasksDecorated(doc);
    const sprintOptions = sortByDateDesc(doc.sprints || [], "startDate");
    const owners = [...new Set(taskList.map((task) => compactText(task.owner)).filter(Boolean))].sort();
    const filteredTasks = sortByDateDesc(taskList, "updatedAt").filter((task) => {
      const blob = [task.title, task.owner, task.note, task.sprint?.title].join(" ");
      if (!matchesSearch(blob, filters.search)) return false;
      if (filters.status !== "all" && task.status !== filters.status) return false;
      if (filters.sprint !== "all" && task.sprintId !== filters.sprint) return false;
      if (filters.owner !== "all" && compactText(task.owner) !== filters.owner) return false;
      return true;
    });

    const openTasks = taskList.filter((task) => task.status !== "done");
    const overdue = openTasks.filter((task) => normalizeDateInput(task.dueDate) && normalizeDateInput(task.dueDate) < todayString()).length;
    const blockedCount = openTasks.filter((task) => Boolean(task.blocked)).length;
    const activeSprint =
      sprintOptions.find((sprint) => {
        const start = normalizeDateInput(sprint.startDate);
        const end = normalizeDateInput(sprint.endDate);
        const today = todayString();
        return start && end && start <= today && end >= today;
      }) || sprintOptions[0] || null;

    const editTask = taskList.find((task) => task.id === filters.taskEditId) || null;
    const editSprint = (doc.sprints || []).find((sprint) => sprint.id === filters.sprintEditId) || null;

    const metrics = [
      { label: "Открытые задачи", value: formatNumber(openTasks.length), caption: "без завершённых" },
      { label: "В работе", value: formatNumber(taskList.filter((task) => task.status === "in_progress").length), caption: "активное исполнение" },
      { label: "Блокеры", value: formatNumber(blockedCount), caption: "требуют решения" },
      { label: "Просрочено", value: formatNumber(overdue), caption: "срок уже прошёл" }
    ];

    return `
      <div class="workspace-shell">
        ${renderWorkspaceHeader("tasks")}
        ${renderMetricGrid(metrics)}
        <div class="workspace-toolbar">
          <div class="workspace-toolbar__group">
            <input class="form-control" type="search" placeholder="Поиск по задаче, владельцу, итерации" value="${escapeHtml(filters.search)}" data-live-filter="search" />
            <select class="form-select" data-live-filter="status">
              <option value="all">Все статусы</option>
              ${TASK_STATUSES.map(
                (status) => `<option value="${escapeHtml(status.key)}" ${filters.status === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`
              ).join("")}
            </select>
            <select class="form-select" data-live-filter="sprint">
              <option value="all">Все итерации</option>
              ${sprintOptions.map(
                (sprint) => `<option value="${escapeHtml(sprint.id)}" ${filters.sprint === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`
              ).join("")}
            </select>
            <select class="form-select" data-live-filter="owner">
              <option value="all">Все ответственные</option>
              ${owners.map((owner) => `<option value="${escapeHtml(owner)}" ${filters.owner === owner ? "selected" : ""}>${escapeHtml(owner)}</option>`).join("")}
            </select>
          </div>
          <div class="workspace-toolbar__group workspace-toolbar__group--end">
            ${canEdit ? `<button class="btn btn-dark" type="button" data-task-new>Новая задача</button><button class="btn btn-outline-dark" type="button" data-sprint-new>Новая итерация</button>` : `<span class="workspace-note">Редактирование отключено для вашей роли</span>`}
          </div>
        </div>
        <div class="workspace-grid workspace-grid--2">
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>${editTask ? "Редактирование задачи" : "Новая задача"}</h4>
                <div class="compact-help">Задачи можно вести по отделам, инициативам и проектам. Быстрый перевод между колонками остаётся прямо на карточках.</div>
              </div>
            </div>
            ${
              canEdit
                ? `
                  <form id="tasksTaskForm" class="workspace-form">
                    <input type="hidden" name="id" value="${escapeHtml(editTask?.id || "")}" />
                    <div class="workspace-form-grid">
                      <label><span>Название</span><input class="form-control" type="text" name="title" value="${escapeHtml(editTask?.title || "")}" required /></label>
                      <label><span>Ответственный</span><input class="form-control" type="text" name="owner" value="${escapeHtml(editTask?.owner || "")}" /></label>
                      <label><span>Статус</span><select class="form-select" name="status">${TASK_STATUSES.map((status) => `<option value="${escapeHtml(status.key)}" ${(editTask?.status || "backlog") === status.key ? "selected" : ""}>${escapeHtml(status.label)}</option>`).join("")}</select></label>
                      <label><span>Приоритет</span><select class="form-select" name="priority">${TASK_PRIORITIES.map((priority) => `<option value="${escapeHtml(priority.key)}" ${(editTask?.priority || "medium") === priority.key ? "selected" : ""}>${escapeHtml(priority.label)}</option>`).join("")}</select></label>
                      <label><span>Итерация</span><select class="form-select" name="sprintId"><option value="">Без итерации</option>${sprintOptions.map((sprint) => `<option value="${escapeHtml(sprint.id)}" ${editTask?.sprintId === sprint.id ? "selected" : ""}>${escapeHtml(sprint.title)}</option>`).join("")}</select></label>
                      <label><span>Срок</span><input class="form-control" type="date" name="dueDate" value="${escapeHtml(normalizeDateInput(editTask?.dueDate || ""))}" /></label>
                    </div>
                    <label class="permission-flag"><input class="form-check-input" type="checkbox" name="blocked" ${editTask?.blocked ? "checked" : ""} /><span>Есть блокер / нужна помощь</span></label>
                    <label><span>Комментарий</span><textarea class="form-control" name="note" rows="4">${escapeHtml(editTask?.note || "")}</textarea></label>
                    <div class="workspace-form__actions">
                      <button class="btn btn-dark" type="submit">${editTask ? "Сохранить задачу" : "Добавить задачу"}</button>
                      <button class="btn btn-outline-secondary" type="button" data-task-new>Очистить форму</button>
                    </div>
                  </form>
                `
                : renderAccessHint("tasks")
            }
          </section>
          <section class="workspace-panel">
            <div class="panel-heading">
              <div>
                <h4>${editSprint ? "Редактирование итерации" : "Новая итерация"}</h4>
                <div class="compact-help">Итерация помогает держать в фокусе ближайший рабочий цикл и распределять задачи по этапам.</div>
              </div>
            </div>
            ${
              canEdit
                ? `
                  <form id="tasksSprintForm" class="workspace-form">
                    <input type="hidden" name="id" value="${escapeHtml(editSprint?.id || "")}" />
                    <div class="workspace-form-grid">
                      <label><span>Название итерации</span><input class="form-control" type="text" name="title" value="${escapeHtml(editSprint?.title || "")}" required /></label>
                      <label><span>Старт</span><input class="form-control" type="date" name="startDate" value="${escapeHtml(normalizeDateInput(editSprint?.startDate || ""))}" /></label>
                      <label><span>Финиш</span><input class="form-control" type="date" name="endDate" value="${escapeHtml(normalizeDateInput(editSprint?.endDate || ""))}" /></label>
                    </div>
                    <label><span>Цель итерации</span><textarea class="form-control" name="goal" rows="4">${escapeHtml(editSprint?.goal || "")}</textarea></label>
                    <div class="workspace-form__actions">
                      <button class="btn btn-dark" type="submit">${editSprint ? "Сохранить итерацию" : "Добавить итерацию"}</button>
                      <button class="btn btn-outline-secondary" type="button" data-sprint-new>Очистить форму</button>
                    </div>
                  </form>
                `
                : renderAccessHint("tasks")
            }
          </section>
        </div>
        <section class="workspace-panel">
          <div class="panel-heading">
            <div>
              <h4>Итерации</h4>
              <div class="compact-help">Текущий активный цикл: ${escapeHtml(activeSprint?.title || "не выбран")}</div>
            </div>
          </div>
          <div class="workspace-sprint-strip">
            ${
              sprintOptions.length
                ? sprintOptions
                    .map((sprint) => {
                      const sprintTasks = taskList.filter((task) => task.sprintId === sprint.id);
                      return `
                        <article class="workspace-sprint-card ${activeSprint?.id === sprint.id ? "active" : ""}">
                          <div class="workspace-card__head">
                            <strong>${escapeHtml(sprint.title)}</strong>
                            <span>${escapeHtml(String(sprintTasks.length))}</span>
                          </div>
                          <div class="workspace-card__meta">${escapeHtml(formatDate(sprint.startDate))} — ${escapeHtml(formatDate(sprint.endDate))}</div>
                          ${sprint.goal ? `<div class="workspace-card__note">${escapeHtml(sprint.goal)}</div>` : ""}
                          <div class="workspace-card__actions mt-2">
                            ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-sprint-edit="${escapeHtml(sprint.id)}">Изменить</button>` : ""}
                            ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-sprint-delete="${escapeHtml(sprint.id)}">Удалить</button>` : ""}
                          </div>
                        </article>
                      `;
                    })
                    .join("")
                : '<div class="workspace-empty workspace-empty--tight">Итерации пока не созданы.</div>'
            }
          </div>
        </section>
        <section class="workspace-panel">
          <div class="panel-heading">
            <div>
              <h4>Канбан</h4>
              <div class="compact-help">Карточки отражают текущую загрузку команды и дают быстрый доступ к правке статуса.</div>
            </div>
            <div class="workspace-note">Показано: ${escapeHtml(String(filteredTasks.length))}</div>
          </div>
          <div class="workspace-board workspace-board--tasks">
            ${TASK_STATUSES.map((status) => {
              const laneTasks = filteredTasks.filter((task) => task.status === status.key);
              return `
                <article class="workspace-lane">
                  <div class="workspace-lane__head">
                    <strong>${escapeHtml(status.label)}</strong>
                    <span>${escapeHtml(String(laneTasks.length))}</span>
                  </div>
                  <div class="workspace-lane__body">
                    ${
                      laneTasks.length
                        ? laneTasks
                            .map(
                              (task) => `
                                <article class="workspace-card workspace-card--${escapeHtml(status.tone)}">
                                  <div class="workspace-card__head">
                                    <strong>${escapeHtml(task.title || "Задача")}</strong>
                                    <span>${escapeHtml(getPriorityLabel(task.priority))}</span>
                                  </div>
                                  <div class="workspace-card__meta">${escapeHtml(task.owner || "Без ответственного")} • срок ${escapeHtml(formatDate(task.dueDate))}</div>
                                  <div class="workspace-card__meta">${escapeHtml(task.sprint?.title || "Без итерации")}</div>
                                  ${task.note ? `<div class="workspace-card__note">${escapeHtml(task.note)}</div>` : ""}
                                  ${task.blocked ? '<div class="workspace-tag workspace-tag--danger mt-2">Есть блокер</div>' : ""}
                                  <div class="workspace-card__footer">
                                    ${
                                      canEdit
                                        ? `<select class="form-select form-select-sm workspace-inline-select" data-task-status-select="${escapeHtml(task.id)}">${TASK_STATUSES.map((item) => `<option value="${escapeHtml(item.key)}" ${item.key === task.status ? "selected" : ""}>${escapeHtml(item.label)}</option>`).join("")}</select>`
                                        : `<span class="workspace-tag workspace-tag--${escapeHtml(status.tone)}">${escapeHtml(status.label)}</span>`
                                    }
                                    <div class="workspace-card__actions">
                                      ${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Изменить</button>` : ""}
                                      ${canManage ? `<button class="btn btn-sm btn-outline-danger" type="button" data-task-delete="${escapeHtml(task.id)}">Удалить</button>` : ""}
                                    </div>
                                  </div>
                                </article>
                              `
                            )
                            .join("")
                        : '<div class="workspace-empty workspace-empty--tight">Пусто</div>'
                    }
                  </div>
                </article>
              `;
            }).join("")}
          </div>
        </section>
        <section class="workspace-panel">
          <div class="panel-heading">
            <div>
              <h4>Лента задач</h4>
              <div class="compact-help">Нижняя таблица полезна для сортировки и быстрого перехода в нужную карточку.</div>
            </div>
          </div>
          <div class="table-shell">
            <table class="table table-sm align-middle workspace-table">
              <thead>
                <tr>
                  <th>Задача</th>
                  <th>Статус</th>
                  <th>Ответственный</th>
                  <th>Итерация</th>
                  <th>Срок</th>
                  <th>Приоритет</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  filteredTasks.length
                    ? filteredTasks
                        .map((task) => {
                          const status = getTaskStatusMeta(task.status);
                          return `
                            <tr>
                              <td><strong>${escapeHtml(task.title || "Задача")}</strong>${task.blocked ? '<div class="workspace-table__sub text-danger">Есть блокер</div>' : ""}</td>
                              <td>${escapeHtml(status.label)}</td>
                              <td>${escapeHtml(task.owner || "—")}</td>
                              <td>${escapeHtml(task.sprint?.title || "—")}</td>
                              <td>${escapeHtml(formatDate(task.dueDate))}</td>
                              <td>${escapeHtml(getPriorityLabel(task.priority))}</td>
                              <td class="text-end">${canEdit ? `<button class="btn btn-sm btn-outline-dark" type="button" data-task-edit="${escapeHtml(task.id)}">Открыть</button>` : ""}</td>
                            </tr>
                          `;
                        })
                        .join("")
                    : '<tr><td colspan="7" class="text-muted">По текущим фильтрам задач нет.</td></tr>'
                }
              </tbody>
            </table>
          </div>
        </section>
        ${renderRelatedLinks("tasks")}
      </div>
    `;
  }

  async function render(moduleKey) {
    if (!supports(moduleKey)) return "";
    const doc = await ensureDocument(moduleKey);
    if (moduleKey === "crm") return renderCrm(doc);
    if (moduleKey === "warehouse") return renderWarehouse(doc);
    if (moduleKey === "tasks") return renderTasks(doc);
    return "";
  }

  async function refresh(moduleKey) {
    if (!supports(moduleKey)) return;
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

  async function handleCrmSubmit(form) {
    const doc = await ensureDocument("crm");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
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
      createdAt: id ? (doc.deals.find((deal) => deal.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const deals = [...(doc.deals || [])];
    const index = deals.findIndex((deal) => deal.id === record.id);
    if (index >= 0) deals[index] = record;
    else deals.unshift(record);
    ui.crm.editId = null;
    await saveDocument("crm", { ...doc, deals }, index >= 0 ? "Сделка обновлена." : "Сделка добавлена.");
    await rerenderCurrentModule();
  }

  async function handleWarehouseItemSubmit(form) {
    const doc = await ensureDocument("warehouse");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const record = {
      id: id || createId("item"),
      name: compactText(formData.get("name")),
      sku: compactText(formData.get("sku")),
      category: compactText(formData.get("category")),
      unit: compactText(formData.get("unit")) || "шт",
      openingStock: toNumber(formData.get("openingStock")),
      minStock: toNumber(formData.get("minStock")),
      note: compactText(formData.get("note")),
      createdAt: id ? (doc.items.find((item) => item.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const items = [...(doc.items || [])];
    const index = items.findIndex((item) => item.id === record.id);
    if (index >= 0) items[index] = record;
    else items.unshift(record);
    ui.warehouse.itemEditId = null;
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
    await saveDocument("warehouse", { ...doc, movements: [record, ...(doc.movements || [])] }, "Движение по складу сохранено.");
    await rerenderCurrentModule();
  }

  async function handleTasksTaskSubmit(form) {
    const doc = await ensureDocument("tasks");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
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
      createdAt: id ? (doc.tasks.find((task) => task.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const tasks = [...(doc.tasks || [])];
    const index = tasks.findIndex((task) => task.id === record.id);
    if (index >= 0) tasks[index] = record;
    else tasks.unshift(record);
    ui.tasks.taskEditId = null;
    await saveDocument("tasks", { ...doc, tasks }, index >= 0 ? "Задача обновлена." : "Задача добавлена.");
    await rerenderCurrentModule();
  }

  async function handleTasksSprintSubmit(form) {
    const doc = await ensureDocument("tasks");
    const formData = new FormData(form);
    const id = compactText(formData.get("id"));
    const record = {
      id: id || createId("sprint"),
      title: compactText(formData.get("title")),
      startDate: normalizeDateInput(formData.get("startDate")),
      endDate: normalizeDateInput(formData.get("endDate")),
      goal: compactText(formData.get("goal")),
      createdAt: id ? (doc.sprints.find((sprint) => sprint.id === id)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const sprints = [...(doc.sprints || [])];
    const index = sprints.findIndex((sprint) => sprint.id === record.id);
    if (index >= 0) sprints[index] = record;
    else sprints.unshift(record);
    ui.tasks.sprintEditId = null;
    await saveDocument("tasks", { ...doc, sprints }, index >= 0 ? "Итерация обновлена." : "Итерация добавлена.");
    await rerenderCurrentModule();
  }

  async function handleSubmit(event, moduleKey) {
    if (!supports(moduleKey)) return false;
    if (event.target.id === "crmDealForm") {
      event.preventDefault();
      await handleCrmSubmit(event.target);
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

  function handleInput(event, moduleKey) {
    if (!supports(moduleKey)) return false;
    const target = event.target.closest("[data-live-filter]");
    if (!target) return false;
    if (moduleKey === "crm") ui.crm[target.dataset.liveFilter] = target.value;
    if (moduleKey === "warehouse") ui.warehouse[target.dataset.liveFilter] = target.value;
    if (moduleKey === "tasks") ui.tasks[target.dataset.liveFilter] = target.value;
    void rerenderCurrentModule();
    return true;
  }

  async function handleChange(event, moduleKey) {
    if (!supports(moduleKey)) return false;

    const filterTarget = event.target.closest("[data-live-filter]");
    if (filterTarget) {
      if (moduleKey === "crm") ui.crm[filterTarget.dataset.liveFilter] = filterTarget.value;
      if (moduleKey === "warehouse") ui.warehouse[filterTarget.dataset.liveFilter] = filterTarget.value;
      if (moduleKey === "tasks") ui.tasks[filterTarget.dataset.liveFilter] = filterTarget.value;
      await rerenderCurrentModule();
      return true;
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
        await saveDocument("tasks", { ...doc, tasks }, "Статус задачи обновлён.");
        await rerenderCurrentModule();
      }
      return true;
    }

    return false;
  }

  async function handleClick(event, moduleKey) {
    if (!supports(moduleKey)) return false;
    if (event.target.closest("[data-placeholder-open]")) return false;

    if (moduleKey === "crm") {
      const newButton = event.target.closest("[data-crm-new]");
      if (newButton) {
        ui.crm.editId = null;
        await rerenderCurrentModule();
        return true;
      }
      const editButton = event.target.closest("[data-crm-edit]");
      if (editButton) {
        ui.crm.editId = editButton.dataset.crmEdit;
        await rerenderCurrentModule();
        return true;
      }
      const deleteButton = event.target.closest("[data-crm-delete]");
      if (deleteButton) {
        if (!window.confirm("Удалить сделку?")) return true;
        const doc = await ensureDocument("crm");
        const deals = (doc.deals || []).filter((deal) => deal.id !== deleteButton.dataset.crmDelete);
        ui.crm.editId = ui.crm.editId === deleteButton.dataset.crmDelete ? null : ui.crm.editId;
        await saveDocument("crm", { ...doc, deals }, "Сделка удалена.");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (moduleKey === "warehouse") {
      const newItemButton = event.target.closest("[data-warehouse-item-new]");
      if (newItemButton) {
        ui.warehouse.itemEditId = null;
        await rerenderCurrentModule();
        return true;
      }
      const editItemButton = event.target.closest("[data-warehouse-item-edit]");
      if (editItemButton) {
        ui.warehouse.itemEditId = editItemButton.dataset.warehouseItemEdit;
        await rerenderCurrentModule();
        return true;
      }
      const pickMovementButton = event.target.closest("[data-warehouse-movement-pick]");
      if (pickMovementButton) {
        ui.warehouse.movementItemId = pickMovementButton.dataset.warehouseMovementPick || "";
        await rerenderCurrentModule();
        return true;
      }
      const deleteItemButton = event.target.closest("[data-warehouse-item-delete]");
      if (deleteItemButton) {
        if (!window.confirm("Удалить позицию и связанные движения?")) return true;
        const doc = await ensureDocument("warehouse");
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
        const doc = await ensureDocument("warehouse");
        const movements = (doc.movements || []).filter((movement) => movement.id !== deleteMovementButton.dataset.warehouseMovementDelete);
        await saveDocument("warehouse", { ...doc, movements }, "Движение удалено.");
        await rerenderCurrentModule();
        return true;
      }
    }

    if (moduleKey === "tasks") {
      const newTaskButton = event.target.closest("[data-task-new]");
      if (newTaskButton) {
        ui.tasks.taskEditId = null;
        await rerenderCurrentModule();
        return true;
      }
      const editTaskButton = event.target.closest("[data-task-edit]");
      if (editTaskButton) {
        ui.tasks.taskEditId = editTaskButton.dataset.taskEdit;
        await rerenderCurrentModule();
        return true;
      }
      const deleteTaskButton = event.target.closest("[data-task-delete]");
      if (deleteTaskButton) {
        if (!window.confirm("Удалить задачу?")) return true;
        const doc = await ensureDocument("tasks");
        const tasks = (doc.tasks || []).filter((task) => task.id !== deleteTaskButton.dataset.taskDelete);
        if (ui.tasks.taskEditId === deleteTaskButton.dataset.taskDelete) ui.tasks.taskEditId = null;
        await saveDocument("tasks", { ...doc, tasks }, "Задача удалена.");
        await rerenderCurrentModule();
        return true;
      }
      const newSprintButton = event.target.closest("[data-sprint-new]");
      if (newSprintButton) {
        ui.tasks.sprintEditId = null;
        await rerenderCurrentModule();
        return true;
      }
      const editSprintButton = event.target.closest("[data-sprint-edit]");
      if (editSprintButton) {
        ui.tasks.sprintEditId = editSprintButton.dataset.sprintEdit;
        await rerenderCurrentModule();
        return true;
      }
      const deleteSprintButton = event.target.closest("[data-sprint-delete]");
      if (deleteSprintButton) {
        if (!window.confirm("Удалить итерацию? Задачи останутся, но отвяжутся от неё.")) return true;
        const doc = await ensureDocument("tasks");
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
      return `${docs.crm.deals?.length || 0} сделок`;
    }
    if (moduleKey === "warehouse") {
      const snapshot = buildWarehouseSnapshot(docs.warehouse);
      return `${snapshot.items.length} позиций • ${formatNumber(snapshot.availableTotal)} доступно`;
    }
    if (moduleKey === "tasks") {
      const openCount = (docs.tasks.tasks || []).filter((task) => task.status !== "done").length;
      return `${openCount} открытых задач`;
    }
    return "";
  }

  return {
    supports,
    render,
    refresh,
    handleClick,
    handleInput,
    handleChange,
    handleSubmit,
    getDashboardSummary,
    resetFormState
  };
}
