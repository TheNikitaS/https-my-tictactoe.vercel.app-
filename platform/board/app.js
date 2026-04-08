const BOARD_BUILD = "20260408-platform-board29";
const BOARD_APP_ID = "platform_board_v1";
const LOCAL_KEY = "dom-neona:board:local";
const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1400;

const COLORS = {
  note: [
    { value: "yellow", label: "Жёлтый" },
    { value: "blue", label: "Голубой" },
    { value: "green", label: "Зелёный" },
    { value: "pink", label: "Розовый" },
    { value: "sand", label: "Песочный" }
  ],
  frame: [
    { value: "blue", label: "Синий" },
    { value: "green", label: "Зелёный" },
    { value: "pink", label: "Розовый" },
    { value: "sand", label: "Песочный" },
    { value: "neutral", label: "Нейтральный" }
  ]
};

const DOM = {
  syncStatus: document.getElementById("syncStatus"),
  syncDetail: document.getElementById("syncDetail"),
  addNoteButton: document.getElementById("addNoteButton"),
  addFrameButton: document.getElementById("addFrameButton"),
  duplicateButton: document.getElementById("duplicateButton"),
  deleteButton: document.getElementById("deleteButton"),
  centerViewButton: document.getElementById("centerViewButton"),
  zoomSelect: document.getElementById("zoomSelect"),
  boardViewport: document.getElementById("boardViewport"),
  boardStageScale: document.getElementById("boardStageScale"),
  boardStage: document.getElementById("boardStage"),
  boardInspector: document.getElementById("boardInspector"),
  emptyInspector: document.getElementById("emptyInspector"),
  entityForm: document.getElementById("entityForm"),
  entityTypeLabel: document.getElementById("entityTypeLabel"),
  entityTitleLabel: document.getElementById("entityTitleLabel"),
  entityTitleInput: document.getElementById("entityTitleInput"),
  entityTextField: document.getElementById("entityTextField"),
  entityTextInput: document.getElementById("entityTextInput"),
  entityXInput: document.getElementById("entityXInput"),
  entityYInput: document.getElementById("entityYInput"),
  entityWidthInput: document.getElementById("entityWidthInput"),
  entityHeightInput: document.getElementById("entityHeightInput"),
  entityColorInput: document.getElementById("entityColorInput"),
  clearSelectionButton: document.getElementById("clearSelectionButton"),
  duplicateInspectorButton: document.getElementById("duplicateInspectorButton")
};

let state = loadState();
let syncManager = null;
let suppressRemoteSave = false;
let dragState = null;

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultState() {
  const frameId = uid("frame");
  const noteId = uid("note");
  return {
    version: 1,
    zoom: 1,
    selectedId: noteId,
    frames: [
      {
        id: frameId,
        type: "frame",
        title: "Стартовая зона",
        x: 120,
        y: 120,
        width: 860,
        height: 520,
        color: "blue"
      }
    ],
    notes: [
      {
        id: noteId,
        type: "note",
        title: "Что собрать первым",
        text: "Здесь можно раскладывать идеи, задачи, связи между отделами и быстрые рабочие схемы.",
        x: 180,
        y: 190,
        width: 280,
        height: 220,
        color: "yellow"
      }
    ],
    updatedAt: new Date().toISOString()
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeDimension(value, fallback, min, max) {
  return clamp(Math.round(toNumber(value, fallback)), min, max);
}

function normalizeEntity(entity) {
  if (!entity || typeof entity !== "object") return null;
  const type = entity.type === "frame" ? "frame" : "note";
  return {
    id: String(entity.id || uid(type)),
    type,
    title: String(entity.title || (type === "frame" ? "Фрейм" : "Стикер")).trim() || (type === "frame" ? "Фрейм" : "Стикер"),
    text: type === "note" ? String(entity.text || "").trim() : "",
    x: sanitizeDimension(entity.x, 120, 0, CANVAS_WIDTH - 120),
    y: sanitizeDimension(entity.y, 120, 0, CANVAS_HEIGHT - 80),
    width: sanitizeDimension(entity.width, type === "frame" ? 420 : 260, 160, CANVAS_WIDTH),
    height: sanitizeDimension(entity.height, type === "frame" ? 280 : 180, 100, CANVAS_HEIGHT),
    color: String(entity.color || (type === "frame" ? "blue" : "yellow"))
  };
}

function normalizeState(raw) {
  const base = raw && typeof raw === "object" ? raw : createDefaultState();
  const frames = Array.isArray(base.frames) ? base.frames.map(normalizeEntity).filter(Boolean).filter((item) => item.type === "frame") : [];
  const notes = Array.isArray(base.notes) ? base.notes.map(normalizeEntity).filter(Boolean).filter((item) => item.type === "note") : [];
  const selectedId = String(base.selectedId || notes[0]?.id || frames[0]?.id || "");
  return {
    version: 1,
    zoom: clamp(toNumber(base.zoom, 1), 0.8, 1.25),
    selectedId,
    frames,
    notes,
    updatedAt: String(base.updatedAt || new Date().toISOString())
  };
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return normalizeState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeState(null);
  }
}

function persistLocal() {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function persistSnapshot() {
  state.updatedAt = new Date().toISOString();
  persistLocal();
  if (syncManager && !suppressRemoteSave) {
    syncManager.scheduleSave();
  }
}

function getSelectedEntity() {
  return [...state.notes, ...state.frames].find((item) => item.id === state.selectedId) || null;
}

function getEntityCollection(type) {
  return type === "frame" ? state.frames : state.notes;
}

function replaceEntity(nextEntity) {
  const collection = getEntityCollection(nextEntity.type);
  const index = collection.findIndex((item) => item.id === nextEntity.id);
  if (index < 0) return;
  collection[index] = normalizeEntity(nextEntity);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getViewportCenter() {
  const scale = state.zoom || 1;
  const scrollLeft = DOM.boardViewport.scrollLeft;
  const scrollTop = DOM.boardViewport.scrollTop;
  const width = DOM.boardViewport.clientWidth;
  const height = DOM.boardViewport.clientHeight;
  return {
    x: Math.round((scrollLeft + width * 0.35) / scale),
    y: Math.round((scrollTop + height * 0.3) / scale)
  };
}

function createNote() {
  const center = getViewportCenter();
  const note = normalizeEntity({
    id: uid("note"),
    type: "note",
    title: `Стикер ${state.notes.length + 1}`,
    text: "Новая заметка",
    x: center.x,
    y: center.y,
    width: 280,
    height: 220,
    color: COLORS.note[state.notes.length % COLORS.note.length].value
  });
  state.notes.push(note);
  state.selectedId = note.id;
  persistSnapshot();
  render();
}

function createFrame() {
  const center = getViewportCenter();
  const frame = normalizeEntity({
    id: uid("frame"),
    type: "frame",
    title: `Фрейм ${state.frames.length + 1}`,
    x: center.x,
    y: center.y,
    width: 520,
    height: 320,
    color: COLORS.frame[state.frames.length % COLORS.frame.length].value
  });
  state.frames.push(frame);
  state.selectedId = frame.id;
  persistSnapshot();
  render();
}

function duplicateSelected() {
  const entity = getSelectedEntity();
  if (!entity) return;
  const copy = normalizeEntity({
    ...entity,
    id: uid(entity.type),
    title: `${entity.title} — копия`,
    x: entity.x + 40,
    y: entity.y + 40
  });
  getEntityCollection(entity.type).push(copy);
  state.selectedId = copy.id;
  persistSnapshot();
  render();
}

function deleteSelected() {
  const entity = getSelectedEntity();
  if (!entity) return;
  if (!window.confirm(`Удалить ${entity.type === "frame" ? "фрейм" : "стикер"}?`)) return;
  if (entity.type === "frame") {
    state.frames = state.frames.filter((item) => item.id !== entity.id);
  } else {
    state.notes = state.notes.filter((item) => item.id !== entity.id);
  }
  state.selectedId = state.notes[0]?.id || state.frames[0]?.id || "";
  persistSnapshot();
  render();
}

function clearSelection() {
  state.selectedId = "";
  render();
}

function centerViewport() {
  DOM.boardViewport.scrollTo({
    left: Math.max((CANVAS_WIDTH * state.zoom - DOM.boardViewport.clientWidth) / 2, 0),
    top: Math.max((CANVAS_HEIGHT * state.zoom - DOM.boardViewport.clientHeight) / 2, 0),
    behavior: "smooth"
  });
}

function renderStage() {
  const selectedId = state.selectedId;
  const frames = state.frames
    .map((frame) => `
      <article
        class="board-frame frame-color-${escapeHtml(frame.color)} ${frame.id === selectedId ? "selected" : ""}"
        data-entity-id="${escapeHtml(frame.id)}"
        data-entity-type="frame"
        style="left:${frame.x}px;top:${frame.y}px;width:${frame.width}px;height:${frame.height}px;"
      >
        <div class="board-frame__title" data-drag-handle="true">${escapeHtml(frame.title)}</div>
      </article>
    `)
    .join("");

  const notes = state.notes
    .map((note) => `
      <article
        class="board-note note-color-${escapeHtml(note.color)} ${note.id === selectedId ? "selected" : ""}"
        data-entity-id="${escapeHtml(note.id)}"
        data-entity-type="note"
        style="left:${note.x}px;top:${note.y}px;width:${note.width}px;height:${note.height}px;"
      >
        <div class="board-note__head" data-drag-handle="true">${escapeHtml(note.title)}</div>
        <div class="board-note__body">${escapeHtml(note.text).replace(/\n/g, "<br />")}</div>
      </article>
    `)
    .join("");

  DOM.boardStage.innerHTML = `${frames}${notes}`;
  DOM.boardStageScale.style.transform = `scale(${state.zoom})`;
  DOM.boardStageScale.style.width = `${CANVAS_WIDTH * state.zoom}px`;
  DOM.boardStageScale.style.height = `${CANVAS_HEIGHT * state.zoom}px`;
}

function renderInspector() {
  const entity = getSelectedEntity();
  if (!entity) {
    DOM.emptyInspector.classList.remove("d-none");
    DOM.entityForm.classList.add("d-none");
    DOM.duplicateButton.disabled = true;
    DOM.deleteButton.disabled = true;
    return;
  }

  DOM.emptyInspector.classList.add("d-none");
  DOM.entityForm.classList.remove("d-none");
  DOM.duplicateButton.disabled = false;
  DOM.deleteButton.disabled = false;
  DOM.entityTypeLabel.textContent = entity.type === "frame" ? "Фрейм" : "Стикер";
  DOM.entityTitleLabel.textContent = entity.title || (entity.type === "frame" ? "Фрейм" : "Стикер");
  DOM.entityTitleInput.value = entity.title || "";
  DOM.entityTextField.classList.toggle("d-none", entity.type === "frame");
  DOM.entityTextInput.value = entity.text || "";
  DOM.entityXInput.value = entity.x;
  DOM.entityYInput.value = entity.y;
  DOM.entityWidthInput.value = entity.width;
  DOM.entityHeightInput.value = entity.height;

  const colorOptions = (entity.type === "frame" ? COLORS.frame : COLORS.note)
    .map((item) => `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`)
    .join("");
  DOM.entityColorInput.innerHTML = colorOptions;
  DOM.entityColorInput.value = entity.color;
}

function render() {
  DOM.zoomSelect.value = String(state.zoom);
  renderStage();
  renderInspector();
}

function setStatus(message, detail = "") {
  DOM.syncStatus.textContent = message;
  DOM.syncDetail.textContent = detail || "Доска синхронизируется между устройствами.";
}

function selectEntity(id) {
  state.selectedId = id || "";
  render();
}

function handleStageClick(event) {
  const entityNode = event.target.closest("[data-entity-id]");
  if (!entityNode) {
    clearSelection();
    return;
  }
  selectEntity(entityNode.dataset.entityId);
}

function startDrag(event) {
  const handle = event.target.closest("[data-drag-handle]");
  const entityNode = event.target.closest("[data-entity-id]");
  if (!handle || !entityNode) return;
  const entity = [...state.notes, ...state.frames].find((item) => item.id === entityNode.dataset.entityId);
  if (!entity) return;
  selectEntity(entity.id);
  dragState = {
    id: entity.id,
    type: entity.type,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: entity.x,
    startY: entity.y
  };
  entityNode.setPointerCapture?.(event.pointerId);
  event.preventDefault();
}

function moveDrag(event) {
  if (!dragState) return;
  const entity = [...state.notes, ...state.frames].find((item) => item.id === dragState.id);
  if (!entity) return;
  const dx = Math.round((event.clientX - dragState.startClientX) / state.zoom);
  const dy = Math.round((event.clientY - dragState.startClientY) / state.zoom);
  entity.x = clamp(dragState.startX + dx, 0, CANVAS_WIDTH - 80);
  entity.y = clamp(dragState.startY + dy, 0, CANVAS_HEIGHT - 60);
  renderStage();
  renderInspector();
}

function endDrag() {
  if (!dragState) return;
  dragState = null;
  persistSnapshot();
}

function applyInspectorChanges() {
  const entity = getSelectedEntity();
  if (!entity) return;
  replaceEntity({
    ...entity,
    title: DOM.entityTitleInput.value.trim() || (entity.type === "frame" ? "Фрейм" : "Стикер"),
    text: entity.type === "note" ? DOM.entityTextInput.value : "",
    x: sanitizeDimension(DOM.entityXInput.value, entity.x, 0, CANVAS_WIDTH - 80),
    y: sanitizeDimension(DOM.entityYInput.value, entity.y, 0, CANVAS_HEIGHT - 60),
    width: sanitizeDimension(DOM.entityWidthInput.value, entity.width, 160, CANVAS_WIDTH),
    height: sanitizeDimension(DOM.entityHeightInput.value, entity.height, 100, CANVAS_HEIGHT),
    color: DOM.entityColorInput.value || entity.color
  });
  persistSnapshot();
  render();
}

function bindEvents() {
  DOM.addNoteButton.addEventListener("click", createNote);
  DOM.addFrameButton.addEventListener("click", createFrame);
  DOM.duplicateButton.addEventListener("click", duplicateSelected);
  DOM.duplicateInspectorButton.addEventListener("click", duplicateSelected);
  DOM.deleteButton.addEventListener("click", deleteSelected);
  DOM.clearSelectionButton.addEventListener("click", clearSelection);
  DOM.centerViewButton.addEventListener("click", centerViewport);

  DOM.zoomSelect.addEventListener("change", () => {
    state.zoom = clamp(toNumber(DOM.zoomSelect.value, 1), 0.8, 1.25);
    persistSnapshot();
    render();
  });

  DOM.boardStage.addEventListener("click", handleStageClick);
  DOM.boardStage.addEventListener("pointerdown", startDrag);
  window.addEventListener("pointermove", moveDrag);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  DOM.entityForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyInspectorChanges();
  });

  [
    DOM.entityTitleInput,
    DOM.entityTextInput,
    DOM.entityXInput,
    DOM.entityYInput,
    DOM.entityWidthInput,
    DOM.entityHeightInput,
    DOM.entityColorInput
  ].forEach((element) => {
    element.addEventListener("change", applyInspectorChanges);
  });
}

async function initSync() {
  if (typeof window.createSharedSupabaseSync !== "function") {
    setStatus("Режим локальной доски", "Скрипт синхронизации не загрузился, пока работаем локально.");
    return;
  }

  syncManager = window.createSharedSupabaseSync({
    appId: BOARD_APP_ID,
    getState: () => state,
    persistLocal: (nextState) => {
      state = normalizeState(nextState);
      persistLocal();
    },
    applyState: (nextState) => {
      suppressRemoteSave = true;
      try {
        state = normalizeState(nextState);
        persistLocal();
        render();
      } finally {
        suppressRemoteSave = false;
      }
    },
    onStatus: (status, detail) => {
      if (status === "connecting") setStatus("Подключение...", "Поднимаю синхронизацию между устройствами.");
      if (status === "saving") setStatus("Сохраняю...", "Изменения уходят в общий контур.");
      if (status === "saved") setStatus("Сохранено", "Все изменения видны команде.");
      if (status === "remote") setStatus("Обновлено из облака", "Пришли изменения с другого устройства.");
      if (status === "dirty") setStatus("Есть изменения", "Сейчас синхронизирую доску.");
      if (status === "warn") setStatus("Онлайн с предупреждением", detail?.message || "Доска работает, но есть сетевое предупреждение.");
      if (status === "error") setStatus("Ошибка синхронизации", detail?.message || "Не удалось сохранить доску.");
      if (status === "idle") setStatus("Готово", "Доска синхронизируется между устройствами.");
    }
  });

  try {
    await syncManager.init();
  } catch (error) {
    setStatus("Локальный режим", error?.message || "Не удалось поднять облачную синхронизацию.");
  }
}

bindEvents();
render();
requestAnimationFrame(() => {
  centerViewport();
});
void initSync();
