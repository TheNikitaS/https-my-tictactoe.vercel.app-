import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { evaluateSafeFormula } from "../shared/safe-formula.js";

const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
const LIGHT2_BUILD = "20260418-light2-safe57";
const LIGHT2_UI_KEYS = {
  compactTables: "dom-neona:light2:compactTables",
  activeSection: "dom-neona:light2:activeSection",
  hiddenForms: "dom-neona:light2:hiddenForms",
  sectionBuilders: "dom-neona:light2:sectionBuilders",
  restoreStamp: "dom-neona:light2:restoreStamp"
};

const WORKBOOK_IMPORT_SHEETS = [
  "Р‘Р°Р»Р°РЅСЃ",
  "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ",
  "РђРєС‚РёРІС‹",
  "Р—Р°РєСѓРїРєРё",
  "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ СЃ РјР°СЃС‚РµСЂР°РјРё"
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const BALANCE_ACCOUNTS = [
  { value: "cash_card", label: "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°" },
  { value: "ooo_account", label: "РЎС‡С‘С‚ РћРћРћ" },
  { value: "ip_account", label: "РЎС‡С‘С‚ РРџ" }
];

const CALENDAR_ACCOUNTS = [
  { value: "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°", label: "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°" },
  { value: "РЎС‡С‘С‚ РћРћРћ", label: "РЎС‡С‘С‚ РћРћРћ" },
  { value: "РЎС‡С‘С‚ РРџ", label: "РЎС‡С‘С‚ РРџ" },
  { value: "РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ", label: "РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ" }
];

const CALENDAR_STATUSES = ["РџР»Р°С‚РµР¶", "РџРѕСЃС‚СѓРїР»РµРЅРёРµ", "РћР¶РёРґР°РµС‚", "РџРµСЂРµРЅРµСЃРµРЅ", "РћС‚РјРµРЅРµРЅ"];

const MONTH_NAMES = [
  "РЇРЅРІР°СЂСЊ",
  "Р¤РµРІСЂР°Р»СЊ",
  "РњР°СЂС‚",
  "РђРїСЂРµР»СЊ",
  "РњР°Р№",
  "РСЋРЅСЊ",
  "РСЋР»СЊ",
  "РђРІРіСѓСЃС‚",
  "РЎРµРЅС‚СЏР±СЂСЊ",
  "РћРєС‚СЏР±СЂСЊ",
  "РќРѕСЏР±СЂСЊ",
  "Р”РµРєР°Р±СЂСЊ"
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

function bindDomEvent(node, eventName, handler, options) {
  if (!node || typeof node.addEventListener !== "function") return;
  node.addEventListener(eventName, handler, options);
}

function bindDomEvents(nodes, eventNames, handler, options) {
  const targets = (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean);
  const names = Array.isArray(eventNames) ? eventNames : [eventNames];
  targets.forEach((node) => {
    names.forEach((eventName) => bindDomEvent(node, eventName, handler, options));
  });
}

const SECTION_META = {
  overview: {
    title: "РћР±Р·РѕСЂ",
    subtitle: "Р‘С‹СЃС‚СЂС‹Р№ РІС…РѕРґ РІ СЂР°Р±РѕС‡РёРµ Р±Р»РѕРєРё Рё СЃРІРµСЂРѕС‡РЅС‹Рµ Р»РёСЃС‚С‹ Р”РћРњ РќР•РћРќРђ."
  },
  balance: {
    title: "Р‘Р°Р»Р°РЅСЃ",
    subtitle: "РўСЂРё РєРѕРЅС‚СѓСЂР° РёР· РёСЃС…РѕРґРЅРѕРіРѕ Р»РёСЃС‚Р°: РЅР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°, СЃС‡С‘С‚ РћРћРћ Рё СЃС‡С‘С‚ РРџ.",
    cards: [
      {
        title: "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°",
        text: "Р‘С‹СЃС‚СЂС‹Р№ РїРµСЂРµРЅРѕСЃ СЃ С‚РµРјРё Р¶Рµ СЃСѓС‰РЅРѕСЃС‚СЏРјРё, С‡С‚Рѕ Рё РІ Excel.",
        items: ["Р”Р°С‚Р°", "РџСЂРёС…РѕРґ", "Р Р°СЃС…РѕРґ", "Р‘Р°Р»Р°РЅСЃ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      },
      {
        title: "РЎС‡С‘С‚ РћРћРћ",
        text: "Р’С‚РѕСЂРѕР№ РєРѕРЅС‚СѓСЂ СѓС‡РµС‚Р° СЃ РѕС‚РґРµР»СЊРЅС‹Рј РїРѕС‚РѕРєРѕРј РѕРїРµСЂР°С†РёР№.",
        items: ["Р”Р°С‚Р°", "РџСЂРёС…РѕРґ", "Р Р°СЃС…РѕРґ", "Р‘Р°Р»Р°РЅСЃ"]
      },
      {
        title: "РЎС‡С‘С‚ РРџ",
        text: "РўСЂРµС‚РёР№ РґРµРЅРµР¶РЅС‹Р№ РєРѕРЅС‚СѓСЂ, РєРѕС‚РѕСЂС‹Р№ СѓР¶Рµ Р±С‹Р» РІ РёСЃС…РѕРґРЅРѕРј С„Р°Р№Р»Рµ.",
        items: ["Р”Р°С‚Р°", "РџСЂРёС…РѕРґ", "Р Р°СЃС…РѕРґ", "Р‘Р°Р»Р°РЅСЃ"]
      }
    ]
  },
  calendar: {
    title: "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ",
    subtitle: "РџР»Р°С‚РµР¶Рё, РєРѕРЅС‚СЂР°РіРµРЅС‚С‹, СЃС‚Р°С‚СЊРё, СЃС‡РµС‚Р° Рё СЃС‚Р°С‚СѓСЃС‹ СЂР°СЃРїСЂРµРґРµР»РµРЅРёСЏ.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РЎС‚СЂСѓРєС‚СѓСЂР° СѓР¶Рµ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅР° РґР»СЏ СЃР»РµРґСѓСЋС‰РµРіРѕ СЌС‚Р°РїР° РјРёРіСЂР°С†РёРё.",
        items: ["Р”Р°С‚Р° РїР»Р°С‚РµР¶Р°", "РљРѕРЅС‚СЂР°РіРµРЅС‚", "РЎСѓРјРјР°", "РўРёРї РѕРїРµСЂР°С†РёРё", "РЎС‚Р°С‚СЊСЏ", "РЎС‡РµС‚", "РЎС‚Р°С‚СѓСЃ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      }
    ]
  },
  assets: {
    title: "РђРєС‚РёРІС‹",
    subtitle: "РђРєС‚РёРІС‹, СЃС‚РѕРёРјРѕСЃС‚СЊ, РІС‹РїР»Р°С‚С‹ Рё С‚РµРєСЃС‚РѕРІС‹Рµ РєРѕРјРјРµРЅС‚Р°СЂРёРё.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РљР°СЂС‚РѕС‡РєРё Р°РєС‚РёРІРѕРІ Рё РѕС‚РґРµР»СЊРЅС‹Р№ Р¶СѓСЂРЅР°Р» РІС‹РїР»Р°С‚ СѓР¶Рµ СЂР°Р±РѕС‚Р°СЋС‚ РІРЅСѓС‚СЂРё РїР»Р°С‚С„РѕСЂРјС‹.",
        items: ["РђРєС‚РёРІ", "РЎС‚РѕРёРјРѕСЃС‚СЊ", "Р’С‹РїР»Р°С‡РµРЅРѕ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      }
    ]
  },
  settlements: {
    title: "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹",
    subtitle: "РџРѕР»РЅС‹Р№ Р±Р»РѕРє СЃРІРµСЂРєРё СЃ РјР°СЃС‚РµСЂР°РјРё Рё РїР°СЂС‚РЅРµСЂР°РјРё РІРЅСѓС‚СЂРё Р”РћРњ РќР•РћРќРђ.",
    cards: [
      {
        title: "РџРѕР»СЏ РёСЃС…РѕРґРЅРѕРіРѕ Р»РёСЃС‚Р°",
        text: "Р‘Р»РѕРє РІС‹РЅРµСЃРµРЅ РІ РѕС‚РґРµР»СЊРЅСѓСЋ С‚Р°Р±Р»РёС†Сѓ Supabase СЃ РґРѕСЃС‚СѓРїРѕРј РїРѕ РїР°СЂС‚РЅРµСЂСѓ.",
        items: ["РџРµСЂРёРѕРґ", "РРјСЏ РјР°СЃС‚РµСЂР° / РїР°СЂС‚РЅРµСЂР°", "Р—Рџ РјР°СЃС‚РµСЂР°", "РџРѕРєСѓРїРєРё РјР°СЃС‚РµСЂР°", "РС‚РѕРі РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р°", "РљС‚Рѕ РєРѕРјСѓ РґРѕР»Р¶РµРЅ", "РЎС‚Р°С‚СѓСЃ"]
      }
    ]
  },
  purchases: {
    title: "Р—Р°РєСѓРїРєРё",
    subtitle: "РќРѕСЂРјР°Р»РёР·РѕРІР°РЅРЅС‹Р№ РєР°С‚Р°Р»РѕРі Р·Р°РєСѓРїРѕРє СЃ РїРѕСЃС‚Р°РІС‰РёРєР°РјРё, РєР°С‚РµРіРѕСЂРёСЏРјРё, Р°СЂС‚РёРєСѓР»Р°РјРё Рё С†РµРЅР°РјРё.",
    cards: [
      {
        title: "РџРѕР»СЏ РєР°С‚Р°Р»РѕРіР°",
        text: "Р—Р°РєСѓРїРєРё СѓР¶Рµ РІС‹РЅРµСЃРµРЅС‹ РІ СѓРґРѕР±РЅС‹Р№ РєР°С‚Р°Р»РѕРі, РєРѕС‚РѕСЂС‹Р№ РґР°Р»СЊС€Рµ РјРѕР¶РЅРѕ Р±СѓРґРµС‚ СЃРІСЏР·Р°С‚СЊ СЃРѕ СЃРєР»Р°РґРѕРј Рё РѕРїР»Р°С‚Р°РјРё.",
        items: ["РџРѕСЃС‚Р°РІС‰РёРє", "Р“РѕСЂРѕРґ", "РљР°С‚РµРіРѕСЂРёСЏ", "РђСЂС‚РёРєСѓР»", "РџРѕР·РёС†РёСЏ", "Р•РґРёРЅРёС†Р°", "Р¦РµРЅР°"]
      }
    ]
  },
  leadgen: {
    title: "Р›РёРґРѕРіРµРЅРµСЂР°С†РёСЏ",
    subtitle: "РЎРІРѕРґРєР° РїРѕ СЂРµРєР»Р°РјРµ, РїР»РѕС‰Р°РґРєР°Рј, РґРёСЂРµРєС‚Сѓ Рё РїРѕСЃР°РґРѕС‡РЅС‹Рј СЃС‚СЂР°РЅРёС†Р°Рј.",
    cards: [
      {
        title: "Р”РёСЂРµРєС‚ / С„СЂР°Р·С‹",
        text: "Р’ РёСЃС…РѕРґРЅРёРєРµ РµСЃС‚СЊ РѕС‚РґРµР»СЊРЅС‹Р№ Р»РёСЃС‚ СЃРѕ СЃС‚СЂР°РЅРёС†Р°РјРё Рё РєР»СЋС‡РµРІС‹РјРё С„СЂР°Р·Р°РјРё.",
        items: ["Р РЎРЇ", "РџРѕРёСЃРє", "РЎС‚СЂР°РЅРёС†Р°", "Р¤СЂР°Р·Р°"]
      },
      {
        title: "Р Р°СЃС…РѕРґС‹ Рё СЌС„С„РµРєС‚РёРІРЅРѕСЃС‚СЊ",
        text: "РћС‚РґРµР»СЊРЅРѕ Р·Р°С„РёРєСЃРёСЂРѕРІР°РЅС‹ СЂР°СЃС…РѕРґС‹, РїРѕРєР°Р·С‹ Рё С†РµРЅР° РїРѕРєР°Р·Р°.",
        items: ["Р Р°СЃС…РѕРґС‹", "РџРѕРєР°Р·С‹", "Р¦РµРЅР° РїРѕРєР°Р·Р°", "РњРµСЃСЏС†", "РР·РјРµРЅРµРЅРёРµ", "РџСЂРѕС†РµРЅС‚"]
      }
    ],
    snapshotSheet: "Р›РёРґРѕРіРµРЅРµСЂР°С†РёСЏ"
  },
  metrics: {
    title: "РњРµС‚СЂРёРєРё",
    subtitle: "РњРµСЃСЏС‡РЅС‹Рµ Р±Р»РѕРєРё РїРѕ РІС‹СЂСѓС‡РєРµ, СЃРµР±РµСЃС‚РѕРёРјРѕСЃС‚Рё Рё РїСЂРѕС†РµРЅС‚РЅРѕР№ РґРёРЅР°РјРёРєРµ.",
    cards: [
      {
        title: "Р¤РёРЅР°РЅСЃРѕРІС‹Рµ СЃС‚Р°С‚СЊРё",
        text: "РўР°Р±Р»РёС†Р° СѓР¶Рµ СЂР°Р·РјРµС‡РµРЅР° РїРѕРґ РїРµСЂРµРЅРѕСЃ РІ РЅРѕСЂРјР°Р»СЊРЅСѓСЋ Р°РЅР°Р»РёС‚РёРєСѓ.",
        items: ["РЎС‚Р°С‚СЊСЏ", "РЎСѓРјРјР°", "Р”РµРЅСЊРіРё", "РџСЂРѕС†РµРЅС‚", "РњРµСЃСЏС†", "РР·РјРµРЅРµРЅРёСЏ"]
      }
    ],
    snapshotSheet: "РњРµС‚СЂРёРєРё"
  },
  finance: {
    title: "Р¤РёРЅРјРѕРґРµР»СЊ",
    subtitle: "Р“РѕРґРѕРІР°СЏ СЂР°РјРєР° Рё РєР»СЋС‡РµРІС‹Рµ РїРѕРєР°Р·Р°С‚РµР»Рё РїРѕ РјРµСЃСЏС†Р°Рј.",
    cards: [
      {
        title: "РљР°СЂРєР°СЃ Р»РёСЃС‚Р°",
        text: "РџРѕРґРіРѕС‚РѕРІР»РµРЅРѕ РјРµСЃС‚Рѕ РїРѕРґ РІРµСЂС…РЅРµСѓСЂРѕРІРЅРµРІСѓСЋ С„РёРЅРјРѕРґРµР»СЊ.",
        items: ["РЎС‚Р°С‚СЊСЏ", "РњРµСЃСЏС†", "РЎСѓРјРјР°", "РџРѕ РґР°С‚Рµ", "Р“РѕРґ"]
      }
    ],
    snapshotSheet: "Р¤РёРЅРњРѕРґРµР»СЊ"
  },
  avito: {
    title: "РђРІРёС‚Рѕ",
    subtitle: "Р•Р¶РµРґРЅРµРІРЅР°СЏ РІРѕСЂРѕРЅРєР° РђРІРёС‚Рѕ: СЂР°СЃС…РѕРґ, РїСЂРѕСЃРјРѕС‚СЂС‹, Р»РёРґС‹ Рё Р·Р°РєР°Р·С‹.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РЎРЅРёРјРѕРє РµР¶РµРґРЅРµРІРЅРѕР№ СЌС„С„РµРєС‚РёРІРЅРѕСЃС‚Рё СѓР¶Рµ РґРѕСЃС‚СѓРїРµРЅ РІРЅСѓС‚СЂРё РїР»Р°С‚С„РѕСЂРјС‹.",
        items: ["Р”Р°С‚Р°", "Р Р°СЃС…РѕРґ", "РџСЂРѕСЃРјРѕС‚СЂС‹ / РєР»РёРєРё", "РљРѕРЅС‚Р°РєС‚С‹ / Р»РёРґС‹", "Р—Р°РєР°Р·", "Р¦РµРЅР° Р·Р°РєР°Р·Р°"]
      }
    ],
    snapshotSheet: "РђРІРёС‚Рѕ"
  },
  direct: {
    title: "Р”РёСЂРµРєС‚",
    subtitle: "РЎС‚СЂР°РЅРёС†С‹, РєР»СЋС‡Рё Рё С‡Р°СЃС‚РѕС‚РЅРѕСЃС‚СЊ РїРѕ СЂРµРєР»Р°РјРЅРѕРјСѓ СЃРїСЂРѕСЃСѓ.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РџРѕР»РЅС‹Р№ СЃРїСЂР°РІРѕС‡РЅРёРє С„СЂР°Р· Рё СЃРїСЂРѕСЃР° РІС‹РЅРµСЃРµРЅ РєР°Рє СЃРІРµСЂРѕС‡РЅС‹Р№ Р»РёСЃС‚.",
        items: ["РЎС‚СЂР°РЅРёС†Р°", "Р¤СЂР°Р·Р°", "Р§РёСЃР»Рѕ Р·Р°РїСЂРѕСЃРѕРІ", "РџРѕРєР°Р·РѕРІ РІ РјРµСЃСЏС†"]
      }
    ],
    snapshotSheet: "Р”РёСЂРµРєС‚"
  },
  neon_usage: {
    title: "Р Р°СЃС…РѕРґ РЅРµРѕРЅР°",
    subtitle: "РњР°С‚СЂРёС†Р° СЂР°СЃС…РѕРґР° РЅРµРѕРЅР° РїРѕ С†РІРµС‚Р°Рј, РїРµСЂРёРѕРґР°Рј Рё РєР°РЅР°Р»Р°Рј.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РЎРЅРёРјРѕРє СЂР°СЃС‡РµС‚РѕРІ РїРѕ С†РІРµС‚Р°Рј Рё СЂР°СЃС…РѕРґСѓ СЃРѕС…СЂР°РЅРµРЅ РґР»СЏ СЃРІРµСЂРєРё.",
        items: ["Р¦РІРµС‚", "РџРµСЂРёРѕРґ", "Р Р°СЃС…РѕРґ", "РС‚РѕРіРё"]
      }
    ],
    snapshotSheet: "Р Р°СЃС…РѕРґ РЅРµРѕРЅР° РїРѕ С†РІРµС‚Р°Рј"
  },
  events: {
    title: "РњРµСЂРѕРїСЂРёСЏС‚РёСЏ",
    subtitle: "РљР°Р»РµРЅРґР°СЂСЊ РјРµСЂРѕРїСЂРёСЏС‚РёР№ Рё СЃРІСЏР·Р°РЅРЅС‹С… РѕРїРµСЂР°С†РёРѕРЅРЅС‹С… РѕС‚РјРµС‚РѕРє.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "Р›РёСЃС‚ РїРµСЂРµРЅРµСЃРµРЅ РґР»СЏ РѕР±С‰РµР№ РІРёРґРёРјРѕСЃС‚Рё Рё РґР°Р»СЊРЅРµР№С€РµР№ РґРѕСЂР°Р±РѕС‚РєРё.",
        items: ["Р”Р°С‚Р°", "РЎРѕР±С‹С‚РёРµ", "РџР»Р°РЅ", "РС‚РѕРі"]
      }
    ],
    snapshotSheet: "РњРµСЂРѕРїСЂРёСЏС‚РёСЏ"
  },
  risks: {
    title: "Р РёСЃРєРё",
    subtitle: "Р РµС€РµРЅРёСЏ, СЂРёСЃРєРё Рё СЂР°Р±РѕС‡РёРµ РІРѕРїСЂРѕСЃС‹ РїРѕ СѓРїСЂР°РІР»РµРЅРёСЋ.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "Р›РёСЃС‚ РїРµСЂРµРЅРµСЃРµРЅ РґР»СЏ СѓРїСЂР°РІР»РµРЅС‡РµСЃРєРѕР№ С„РёРєСЃР°С†РёРё Рё РѕР±Р·РѕСЂР°.",
        items: ["РљР°С‚РµРіРѕСЂРёСЏ", "РћРїРёСЃР°РЅРёРµ", "Р РµС€РµРЅРёРµ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      }
    ],
    snapshotSheet: "Р РµС€РµРЅРёСЏ Рё СЂРёСЃРєРё"
  },
  data: {
    title: "Р”Р°РЅРЅС‹Рµ",
    subtitle: "РЎРїСЂР°РІРѕС‡РЅС‹Рµ РґР°РЅРЅС‹Рµ Рё Р±Р°Р·РѕРІС‹Рµ С‚Р°Р±Р»РёС†С‹ РёР· РёСЃС…РѕРґРЅРёРєР°.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РЎРїСЂР°РІРѕС‡РЅР°СЏ РїРѕРґР»РѕР¶РєР° РїРµСЂРµРЅРµСЃРµРЅР° РґР»СЏ РєРѕРЅС‚СЂРѕР»СЏ С„РѕСЂРјСѓР» Рё РєРѕСЌС„С„РёС†РёРµРЅС‚РѕРІ.",
        items: ["РџР°СЂР°РјРµС‚СЂ", "Р—РЅР°С‡РµРЅРёРµ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      }
    ],
    snapshotSheet: "Р”Р°РЅРЅС‹Рµ"
  },
  forecast: {
    title: "РџСЂРѕРіРЅРѕР·",
    subtitle: "РћР±РѕСЂРѕС‚, СЂР°СЃС…РѕРґ, РјР°СЂР¶Р°, С‡РµРє, РїСЂРѕРґР°Р¶Рё Рё РїСЂРёР±С‹Р»СЊ.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РџСЂРѕРіРЅРѕР·РЅС‹Р№ Р±Р»РѕРє РїРµСЂРµРЅРµСЃРµРЅ РєР°Рє С‡Р°СЃС‚СЊ РѕР±С‰РµРіРѕ РєРѕРЅС‚СѓСЂР° Р”РћРњ РќР•РћРќРђ.",
        items: ["РћР±РѕСЂРѕС‚", "Р Р°СЃС…РѕРґ", "РњР°СЂР¶Р°", "Р§РµРє", "РџСЂРѕРґР°Р¶", "РџСЂРёР±С‹Р»СЊ"]
      }
    ],
    snapshotSheet: "РџСЂРѕРіРЅРѕР·"
  },
  franchises: {
    title: "Р¤СЂР°РЅС€РёР·С‹",
    subtitle: "РџР»РѕС‰Р°РґРєРё С„СЂР°РЅС€РёР· Рё СЃРІСЏР·Р°РЅРЅС‹Рµ СЂР°Р±РѕС‡РёРµ Р·Р°РјРµС‚РєРё.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "РЎРїСЂР°РІРѕС‡РЅРёРє РїР»РѕС‰Р°РґРѕРє СЃРѕС…СЂР°РЅРµРЅ РІРЅСѓС‚СЂРё РїР»Р°С‚С„РѕСЂРјС‹.",
        items: ["РџР»РѕС‰Р°РґРєР°", "РћРїРёСЃР°РЅРёРµ"]
      }
    ],
    snapshotSheet: "РџР»РѕС‰Р°РґРєРё С„СЂР°РЅС€РёР·"
  },
  questions: {
    title: "Р’РѕРїСЂРѕСЃС‹",
    subtitle: "РћС‚РєСЂС‹С‚С‹Рµ РІРѕРїСЂРѕСЃС‹, РІС‹РЅРµСЃРµРЅРЅС‹Рµ РёР· РёСЃС…РѕРґРЅРѕР№ РјРѕРґРµР»Рё.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "Р›РёСЃС‚ РїРµСЂРµРЅРµСЃРµРЅ РєР°Рє СЃРїРёСЃРѕРє РІРѕРїСЂРѕСЃРѕРІ РґР»СЏ СЃР»РµРґСѓСЋС‰РµРіРѕ СѓРїСЂР°РІР»РµРЅС‡РµСЃРєРѕРіРѕ С†РёРєР»Р°.",
        items: ["Р’РѕРїСЂРѕСЃ", "РљРѕРјРјРµРЅС‚Р°СЂРёР№"]
      }
    ],
    snapshotSheet: "Р’РѕРїСЂРѕСЃС‹"
  },
  lead_calc: {
    title: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ Р»РёРґР°",
    subtitle: "РљРѕРјРїР°РєС‚РЅС‹Р№ СЂР°СЃС‡РµС‚РЅС‹Р№ Р»РёСЃС‚ Р»РёРґРѕРіРµРЅРµСЂР°С†РёРё.",
    cards: [
      {
        title: "РџРѕР»СЏ Р»РёСЃС‚Р°",
        text: "Р¤РѕСЂРјСѓР»С‹ Рё С‚РµРєСѓС‰РёРµ Р·РЅР°С‡РµРЅРёСЏ СЃРѕС…СЂР°РЅРµРЅС‹ РґР»СЏ СЃРІРµСЂРєРё.",
        items: ["РџРѕРєР°Р·Р°С‚РµР»СЊ", "Р—РЅР°С‡РµРЅРёРµ"]
      }
    ],
    snapshotSheet: "РљР°Р»СЊРєСѓР»СЏС‚РѕСЂ Р›РёРґРѕРіРµСЂРµР°С†РёРё"
  }
};

const LIVE_SECTION_BUILDERS = {
  settlements: {
    filterKeys: ["partner", "status", "search"],
    tables: {
      main: {
        label: "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹",
        columns: [
          { key: "period_label", label: "РџРµСЂРёРѕРґ" },
          { key: "partner_label", label: "РџР°СЂС‚РЅРµСЂ" },
          { key: "salary_amount", label: "Р—Рџ, в‚Ѕ" },
          { key: "purchase_amount", label: "РџРѕРєСѓРїРєРё, в‚Ѕ" },
          { key: "settlement_total", label: "РС‚РѕРі, в‚Ѕ" },
          { key: "direction", label: "РљС‚Рѕ РєРѕРјСѓ РґРѕР»Р¶РµРЅ" },
          { key: "status", label: "РЎС‚Р°С‚СѓСЃ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "updated_at", label: "РћР±РЅРѕРІР»РµРЅРѕ" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      }
    }
  },
  balance: {
    filterKeys: ["account", "month", "search"],
    tables: {
      main: {
        label: "Р‘Р°Р»Р°РЅСЃ",
        columns: [
          { key: "entry_date", label: "Р”Р°С‚Р°" },
          { key: "account_type", label: "РЎС‡РµС‚" },
          { key: "income_amount", label: "РџСЂРёС…РѕРґ, в‚Ѕ" },
          { key: "expense_amount", label: "Р Р°СЃС…РѕРґ, в‚Ѕ" },
          { key: "running_total", label: "Р‘Р°Р»Р°РЅСЃ, в‚Ѕ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "updated_at", label: "РћР±РЅРѕРІР»РµРЅРѕ" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      }
    }
  },
  calendar: {
    filterKeys: ["month", "operation", "account", "status", "search"],
    tables: {
      main: {
        label: "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ",
        columns: [
          { key: "payment_date", label: "Р”Р°С‚Р° РїР»Р°С‚РµР¶Р°" },
          { key: "counterparty", label: "РљРѕРЅС‚СЂР°РіРµРЅС‚" },
          { key: "signed_amount", label: "РЎСѓРјРјР°, в‚Ѕ" },
          { key: "operation_type", label: "РўРёРї" },
          { key: "category", label: "РЎС‚Р°С‚СЊСЏ" },
          { key: "account_name", label: "РЎС‡РµС‚" },
          { key: "status", label: "РЎС‚Р°С‚СѓСЃ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "updated_at", label: "РћР±РЅРѕРІР»РµРЅРѕ" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      }
    }
  },
  assets: {
    filterKeys: ["search", "payment_filter", "payment_search"],
    tables: {
      assets: {
        label: "РђРєС‚РёРІС‹",
        columns: [
          { key: "asset_name", label: "РђРєС‚РёРІ" },
          { key: "asset_value", label: "РЎС‚РѕРёРјРѕСЃС‚СЊ, в‚Ѕ" },
          { key: "paid_total", label: "Р’С‹РїР»Р°С‡РµРЅРѕ, в‚Ѕ" },
          { key: "remaining_amount", label: "РћСЃС‚Р°С‚РѕРє, в‚Ѕ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "updated_at", label: "РћР±РЅРѕРІР»РµРЅРѕ" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      },
      payments: {
        label: "Р’С‹РїР»Р°С‚С‹ РїРѕ Р°РєС‚РёРІР°Рј",
        columns: [
          { key: "payment_date", label: "Р”Р°С‚Р° РІС‹РїР»Р°С‚С‹" },
          { key: "asset_label", label: "РђРєС‚РёРІ" },
          { key: "payment_amount", label: "РЎСѓРјРјР°, в‚Ѕ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "updated_at", label: "РћР±РЅРѕРІР»РµРЅРѕ" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      }
    }
  },
  purchases: {
    filterKeys: ["supplier", "category", "search"],
    tables: {
      main: {
        label: "Р—Р°РєСѓРїРєРё",
        columns: [
          { key: "supplier_name", label: "РљРѕРјРїР°РЅРёСЏ" },
          { key: "supplier_inn", label: "РРќРќ" },
          { key: "city", label: "Р“РѕСЂРѕРґ" },
          { key: "category", label: "РљР°С‚РµРіРѕСЂРёСЏ" },
          { key: "article", label: "РђСЂС‚РёРєСѓР»" },
          { key: "item_name", label: "РќР°РёРјРµРЅРѕРІР°РЅРёРµ" },
          { key: "unit_name", label: "Р•Рґ. РёР·Рј." },
          { key: "price", label: "Р¦РµРЅР°, в‚Ѕ" },
          { key: "note", label: "РљРѕРјРјРµРЅС‚Р°СЂРёР№" },
          { key: "actions", label: "Р”РµР№СЃС‚РІРёСЏ" }
        ]
      }
    }
  }
};

const LIGHT2_FORMULA_FORMATS = [
  { key: "number", label: "Р§РёСЃР»Рѕ" },
  { key: "money", label: "Р”РµРЅСЊРіРё" },
  { key: "percent", label: "РџСЂРѕС†РµРЅС‚С‹" },
  { key: "text", label: "РўРµРєСЃС‚" }
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
  autoRestoreAttempted: false,
  autoRestoreCompleted: false,
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
  eventsBound: false,
  builderEventsBound: false,
  sectionBuilders: readStoredJson(LIGHT2_UI_KEYS.sectionBuilders, {}),
  ui: {
    compactTables: readStoredBoolean(LIGHT2_UI_KEYS.compactTables, true),
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
    .replace(/[^a-z0-9Р°-СЏС‘_-]+/gi, "_")
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
  if (!date || Number.isNaN(date.getTime())) return "вЂ”";
  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function formatDate(value) {
  if (!value) return "вЂ”";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "вЂ”";
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

  return allowedRows.filter((item) => item.status !== "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ РїСЂРѕРёР·РІРµРґРµРЅ" && item.status !== "РђСЂС…РёРІ");
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
    return `${STATE.balanceEntries.length} СЃС‚СЂРѕРє вЂў ${formatMoney(totals.total)} в‚Ѕ`;
  }

  if (key === "calendar") {
    return `${STATE.calendarEntries.length} СЃС‚СЂРѕРє РїР»Р°РЅР°`;
  }

  if (key === "assets") {
    return `${STATE.assets.length} Р°РєС‚РёРІРѕРІ вЂў ${STATE.assetPayments.length} РІС‹РїР»Р°С‚`;
  }

  if (key === "settlements") {
    const openRows = getOpenSettlementRows();
    return `${STATE.settlements.length} СЃС‚СЂРѕРє вЂў РѕС‚РєСЂС‹С‚Рѕ ${openRows.length}`;
  }

  if (key === "purchases") {
    const suppliers = new Set(STATE.purchaseCatalog.map((item) => String(item.supplier_name || "").trim()).filter(Boolean));
    return `${STATE.purchaseCatalog.length} РїРѕР·РёС†РёР№ вЂў ${suppliers.size} РїРѕСЃС‚Р°РІС‰РёРєРѕРІ`;
  }

  const sheetName = SECTION_META[key]?.snapshotSheet;
  const sheet = sheetName ? getSnapshotSheet(key) : null;
  if (sheet && key === "leadgen") {
    const parsed = parseLeadgenSnapshot(sheet);
    const activeBlocks = parsed.blocks.filter((block) => block.dataSeries.length);
    return `${activeBlocks.length} РєР°РЅР°Р»РѕРІ вЂў ${parsed.latestMonthLabel || "Р±РµР· СЃСЂРµР·Р°"}`;
  }

  if (sheet && key === "metrics") {
    const parsed = parseMetricsSnapshot(sheet);
    const latest = parsed.series.at(-1);
    if (latest) {
      return `${latest.monthLabel} ${latest.yearLabel} вЂў ${formatMoney(latest.revenue)} в‚Ѕ`;
    }
  }

  if (sheet && key === "finance") {
    const parsed = parseFinmodelSnapshot(sheet);
    const latest = parsed.timeline.at(-1);
    if (latest) {
      return `${latest.monthLabel} ${latest.yearLabel} вЂў ${formatMoney(latest.turnover)} в‚Ѕ`;
    }
  }
  if (sheet) {
    return `${sheet.nonEmpty || 0} СЏС‡РµРµРє вЂў ${sheet.formulas || 0} С„РѕСЂРјСѓР»`;
  }

  if (sheetName && !STATE.workbookReady) {
    return "РЎРІРµСЂСЏСЋ snapshot...";
  }

  return "Р“РѕС‚РѕРІРѕ Рє СЂР°Р±РѕС‚Рµ";
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
    renderSettlementSection();
    return;
  }

  if (sectionKey === "balance") {
    const dom = getBalanceDom();
    if (dom.accountFilter) dom.accountFilter.value = filters.account || "";
    if (dom.monthFilter) dom.monthFilter.value = filters.month || "";
    if (dom.search) dom.search.value = filters.search || "";
    renderBalanceSection();
    return;
  }

  if (sectionKey === "calendar") {
    const dom = getCalendarDom();
    if (dom.monthFilter) dom.monthFilter.value = filters.month || "";
    if (dom.operationFilter) dom.operationFilter.value = filters.operation || "";
    if (dom.accountFilter) dom.accountFilter.value = filters.account || "";
    if (dom.statusFilter) dom.statusFilter.value = filters.status || "";
    if (dom.search) dom.search.value = filters.search || "";
    renderCalendarSection();
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
  if (format === "money") return `${formatMoney(value)} в‚Ѕ`;
  if (format === "percent") return `${formatPlainNumber(toNumber(value), 2)}%`;
  if (format === "text") return String(value ?? "вЂ”");
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
            <strong>РћС€РёР±РєР°</strong>
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
            : "Р‘РµР· СЃРѕСЂС‚РёСЂРѕРІРєРё";
          const directionLabel = view.sort?.key ? (view.sort?.direction === "desc" ? "в†“" : "в†‘") : "";
          return `
            <div class="builder-view-chip">
              <div>
                <strong>${escapeHtml(view.label)}</strong>
                <span>Р¤РёР»СЊС‚СЂРѕРІ: ${viewFilterCount} вЂў РЎРѕСЂС‚РёСЂРѕРІРєР°: ${escapeHtml(viewSortLabel)} ${directionLabel}</span>
              </div>
              <div class="builder-view-chip__actions">
                <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-apply="${escapeHtml(sectionKey)}" data-builder-view-id="${escapeHtml(view.id)}">РџСЂРёРјРµРЅРёС‚СЊ</button>
                <button type="button" class="btn btn-outline-danger btn-sm" data-builder-view-delete="${escapeHtml(sectionKey)}" data-builder-view-id="${escapeHtml(view.id)}">РЈРґР°Р»РёС‚СЊ</button>
              </div>
            </div>
          `;
        })
        .join("")
    : '<div class="builder-note">РЎРѕС…СЂР°РЅС‘РЅРЅС‹С… РІРёРґРѕРІ РїРѕРєР° РЅРµС‚.</div>';
  const sortOptionsHtml = [
    '<option value="">Р‘РµР· СЃРѕСЂС‚РёСЂРѕРІРєРё</option>',
    ...sortOptions.map(
      (column) =>
        `<option value="${escapeHtml(column.key)}" ${sortState.key === column.key ? "selected" : ""}>${escapeHtml(column.label)}</option>`
    )
  ].join("");

  strip.innerHTML = `
    <div class="light2-builder-strip__meta">
      <strong>РљРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ СЃРµРєС†РёРё</strong>
      <span>Р’РёРґС‹, РєРѕР»РѕРЅРєРё, С„РёР»СЊС‚СЂС‹, СЃРѕСЂС‚РёСЂРѕРІРєСѓ Рё KPI РјРѕР¶РЅРѕ РЅР°СЃС‚СЂР°РёРІР°С‚СЊ Р±РµР· РїСЂР°РІРєРё РєРѕРґР°.</span>
    </div>
    <div class="light2-builder-strip__actions">
      ${viewButtons}
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-save="${escapeHtml(sectionKey)}">РЎРѕС…СЂР°РЅРёС‚СЊ С‚РµРєСѓС‰РёР№ РІРёРґ</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-filters-reset="${escapeHtml(sectionKey)}">РЎР±СЂРѕСЃРёС‚СЊ С„РёР»СЊС‚СЂС‹</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-export="${escapeHtml(sectionKey)}">Р­РєСЃРїРѕСЂС‚ СЃС…РµРјС‹</button>
      <button type="button" class="btn btn-outline-dark btn-sm" data-builder-import="${escapeHtml(sectionKey)}">РРјРїРѕСЂС‚ СЃС…РµРјС‹</button>
      <button type="button" class="btn ${builder.open ? "btn-dark" : "btn-outline-dark"} btn-sm" data-builder-toggle="${escapeHtml(sectionKey)}">
        ${builder.open ? "РЎРєСЂС‹С‚СЊ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ" : "РћС‚РєСЂС‹С‚СЊ РєРѕРЅСЃС‚СЂСѓРєС‚РѕСЂ"}
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
            <span>РњРѕР¶РЅРѕ РїРµСЂРµРёРјРµРЅРѕРІР°С‚СЊ Рё СЃРєСЂС‹С‚СЊ РєРѕР»РѕРЅРєРё.</span>
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
            <button type="button" class="btn btn-dark btn-sm" data-builder-columns-save="${escapeHtml(sectionKey)}" data-builder-table-save="${escapeHtml(tableKey)}">РЎРѕС…СЂР°РЅРёС‚СЊ РєРѕР»РѕРЅРєРё</button>
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
              <button type="button" class="btn btn-outline-danger btn-sm" data-builder-formula-delete="${escapeHtml(sectionKey)}" data-builder-formula-key="${escapeHtml(formula.key)}">РЈРґР°Р»РёС‚СЊ</button>
            </div>
          `
        )
        .join("")
    : '<div class="builder-note">Р¤РѕСЂРјСѓР» РїРѕРєР° РЅРµС‚.</div>';

  host.innerHTML = `
    <div class="light2-builder-grid">
      <div class="builder-card builder-card--wide">
        <div class="builder-card__head">
          <strong>Р¤РёР»СЊС‚СЂС‹, СЃРѕСЂС‚РёСЂРѕРІРєР° Рё СЃРѕС…СЂР°РЅС‘РЅРЅС‹Рµ РІРёРґС‹</strong>
          <span>РЈРїСЂР°РІР»СЏР№С‚Рµ С‚РµРј, РєР°Рє РєРѕРјР°РЅРґР° РІРёРґРёС‚ СЃРµРєС†РёСЋ: С„РёР»СЊС‚СЂС‹, РїРѕСЂСЏРґРѕРє СЃС‚СЂРѕРє Рё РїСЂРµСЃРµС‚С‹ РґР»СЏ СЂР°Р·РЅС‹С… СЃС†РµРЅР°СЂРёРµРІ.</span>
        </div>
        <div class="overview-inline-stats builder-kpi-row">
          <div>
            <span>РЎС‚СЂРѕРє РІ С‚РµРєСѓС‰РµРј СЃСЂРµР·Рµ</span>
            <strong>${recordCount}</strong>
          </div>
          <div>
            <span>РђРєС‚РёРІРЅС‹С… С„РёР»СЊС‚СЂРѕРІ</span>
            <strong>${filterCount}</strong>
          </div>
          <div>
            <span>РЎРѕС…СЂР°РЅС‘РЅРЅС‹С… РІРёРґРѕРІ</span>
            <strong>${builder.views.length}</strong>
          </div>
        </div>
        <div class="builder-form-grid mt-3">
          <select class="form-select" data-builder-sort-key="${escapeHtml(sectionKey)}">
            ${sortOptionsHtml}
          </select>
          <select class="form-select" data-builder-sort-direction="${escapeHtml(sectionKey)}">
            <option value="asc" ${sortState.direction === "asc" ? "selected" : ""}>РџРѕ РІРѕР·СЂР°СЃС‚Р°РЅРёСЋ</option>
            <option value="desc" ${sortState.direction === "desc" ? "selected" : ""}>РџРѕ СѓР±С‹РІР°РЅРёСЋ</option>
          </select>
          <button type="button" class="btn btn-dark btn-sm" data-builder-sort-save="${escapeHtml(sectionKey)}">РЎРѕС…СЂР°РЅРёС‚СЊ СЃРѕСЂС‚РёСЂРѕРІРєСѓ</button>
        </div>
        <div class="builder-actions">
          <button type="button" class="btn btn-outline-dark btn-sm" data-builder-view-save="${escapeHtml(sectionKey)}">РЎРѕС…СЂР°РЅРёС‚СЊ РІРёРґ СЃ С„РёР»СЊС‚СЂР°РјРё</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-builder-filters-reset="${escapeHtml(sectionKey)}">РћС‡РёСЃС‚РёС‚СЊ С„РёР»СЊС‚СЂС‹ СЃРµРєС†РёРё</button>
        </div>
      </div>
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>РЎРѕС…СЂР°РЅС‘РЅРЅС‹Рµ РІРёРґС‹</strong>
          <span>Р‘С‹СЃС‚СЂС‹Рµ РїСЂРµСЃРµС‚С‹ РґР»СЏ РІР»Р°РґРµР»СЊС†Р°, С„РёРЅР°РЅСЃРѕРІРѕРіРѕ Р±Р»РѕРєР°, СЃРІРµСЂРєРё Рё Р»СЋР±С‹С… СЃРІРѕРёС… СЃС†РµРЅР°СЂРёРµРІ.</span>
        </div>
        <div class="builder-list">${savedViews}</div>
      </div>
      ${columnCards}
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>KPI Рё С„РѕСЂРјСѓР»С‹</strong>
          <span>Р”РѕСЃС‚СѓРїРЅС‹ С„СѓРЅРєС†РёРё: count(), countWhere(), sum(), avg(), min(), max(), percent().</span>
        </div>
        <div class="builder-form-grid">
          <input class="form-control" type="text" placeholder="РљР»СЋС‡, РЅР°РїСЂРёРјРµСЂ open_total" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="key" />
          <input class="form-control" type="text" placeholder="РќР°Р·РІР°РЅРёРµ РєР°СЂС‚РѕС‡РєРё" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="label" />
          <select class="form-select" data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="format">
            ${LIGHT2_FORMULA_FORMATS.map((item) => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join("")}
          </select>
          <input class="form-control builder-form-grid__wide" type="text" placeholder='РќР°РїСЂРёРјРµСЂ: sum("signed_amount")' data-builder-formula-input="${escapeHtml(sectionKey)}" data-builder-field="expression" />
          <button type="button" class="btn btn-dark btn-sm" data-builder-formula-save="${escapeHtml(sectionKey)}">Р”РѕР±Р°РІРёС‚СЊ С„РѕСЂРјСѓР»Сѓ</button>
        </div>
        <div class="builder-list mt-3">${formulas}</div>
      </div>
      <div class="builder-card">
        <div class="builder-card__head">
          <strong>JSON-СЃС…РµРјР° СЃРµРєС†РёРё</strong>
          <span>Р”Р»СЏ РјР°РєСЃРёРјР°Р»СЊРЅРѕ РіРёР±РєРѕР№ РЅР°СЃС‚СЂРѕР№РєРё РјРѕР¶РЅРѕ РїСЂР°РІРёС‚СЊ СЃРµРєС†РёСЋ С†РµР»РёРєРѕРј РѕРґРЅРёРј JSON РёР»Рё РїРµСЂРµРЅРѕСЃРёС‚СЊ РєРѕРЅС„РёРі РјРµР¶РґСѓ Р±Р°Р·Р°РјРё.</span>
        </div>
        <textarea class="form-control builder-schema" data-builder-schema="${escapeHtml(sectionKey)}" rows="18">${escapeHtml(JSON.stringify({
          views: builder.views,
          formulas: builder.formulas,
          tables: builder.tables,
          sort: builder.sort
        }, null, 2))}</textarea>
        <div class="builder-actions">
          <button type="button" class="btn btn-dark btn-sm" data-builder-schema-save="${escapeHtml(sectionKey)}">РЎРѕС…СЂР°РЅРёС‚СЊ JSON-СЃС…РµРјСѓ</button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-builder-reset="${escapeHtml(sectionKey)}">РЎР±СЂРѕСЃРёС‚СЊ СЃРµРєС†РёСЋ</button>
        </div>
      </div>
    </div>
  `;
  scheduleMojibakeRepair(host);
}

function rerenderLiveSection(sectionKey) {
  if (sectionKey === "settlements") {
    renderSettlementSection();
    return;
  }
  if (sectionKey === "balance") {
    renderBalanceSection();
    return;
  }
  if (sectionKey === "calendar") {
    renderCalendarSection();
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
  const label = window.prompt("РќР°Р·РІР°РЅРёРµ РІРёРґР°");
  if (!label) return;
  const builder = getSectionBuilder(sectionKey);
  const viewId = sanitizeBuilderKey(label);
  if (!viewId) {
    throw new Error("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕР·РґР°С‚СЊ РєР»СЋС‡ РІРёРґР°. РСЃРїРѕР»СЊР·СѓР№С‚Рµ РЅР°Р·РІР°РЅРёРµ СЃ Р±СѓРєРІР°РјРё РёР»Рё С†РёС„СЂР°РјРё.");
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
  setStatus(`Р’РёРґ СЃРµРєС†РёРё СЃРѕС…СЂР°РЅС‘РЅ: ${label}.`, "success");
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
  setStatus(`РџСЂРёРјРµРЅС‘РЅ РІРёРґ: ${view.label}.`, "success");
}

function clearSectionFilters(sectionKey) {
  applyLiveSectionFilterState(sectionKey, {});
  setStatus("Р¤РёР»СЊС‚СЂС‹ СЃРµРєС†РёРё РѕС‡РёС‰РµРЅС‹.", "success");
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
  setStatus("РЎРѕСЂС‚РёСЂРѕРІРєР° СЃРµРєС†РёРё СЃРѕС…СЂР°РЅРµРЅР°.", "success");
}

function deleteSectionView(sectionKey, viewId) {
  const builder = getSectionBuilder(sectionKey);
  const view = builder.views.find((item) => item.id === viewId);
  if (!view) return;
  if (!window.confirm(`РЈРґР°Р»РёС‚СЊ СЃРѕС…СЂР°РЅС‘РЅРЅС‹Р№ РІРёРґ "${view.label}"?`)) return;
  builder.views = builder.views.filter((item) => item.id !== viewId);
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  setStatus(`Р’РёРґ СѓРґР°Р»С‘РЅ: ${view.label}.`, "success");
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
      setStatus("JSON-СЃС…РµРјР° СЃРµРєС†РёРё СЃРєРѕРїРёСЂРѕРІР°РЅР° РІ Р±СѓС„РµСЂ РѕР±РјРµРЅР°.", "success");
      return;
    } catch {
      // Fallback below.
    }
  }

  window.prompt("РЎРєРѕРїРёСЂСѓР№С‚Рµ JSON-СЃС…РµРјСѓ СЃРµРєС†РёРё РІСЂСѓС‡РЅСѓСЋ", payload);
  setStatus("JSON-СЃС…РµРјР° СЃРµРєС†РёРё РїРѕРґРіРѕС‚РѕРІР»РµРЅР° РґР»СЏ РєРѕРїРёСЂРѕРІР°РЅРёСЏ.", "success");
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

  const raw = window.prompt("Р’СЃС‚Р°РІСЊС‚Рµ JSON-СЃС…РµРјСѓ СЃРµРєС†РёРё", suggestion);
  if (!raw) return;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`JSON РЅРµ СЂР°СЃРїРѕР·РЅР°РЅ: ${error.message || "РѕС€РёР±РєР° СЃРёРЅС‚Р°РєСЃРёСЃР°"}`);
  }

  STATE.sectionBuilders[sectionKey] = normalizeSectionBuilder(sectionKey, {
    ...parsed,
    open: true
  });
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("JSON-СЃС…РµРјР° СЃРµРєС†РёРё РёРјРїРѕСЂС‚РёСЂРѕРІР°РЅР°.", "success");
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
  setStatus("РќР°СЃС‚СЂРѕР№РєРё РєРѕР»РѕРЅРѕРє СЃРѕС…СЂР°РЅРµРЅС‹.", "success");
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
    throw new Error("РЈРєР°Р¶РёС‚Рµ РєР»СЋС‡, РЅР°Р·РІР°РЅРёРµ Рё С„РѕСЂРјСѓР»Сѓ РґР»СЏ KPI.");
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
  setStatus(`KPI СЃРѕС…СЂР°РЅС‘РЅ: ${formula.label}.`, "success");
}

function deleteSectionFormula(sectionKey, formulaKey) {
  const builder = getSectionBuilder(sectionKey);
  builder.formulas = builder.formulas.filter((item) => item.key !== formulaKey);
  builder.open = true;
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("Р¤РѕСЂРјСѓР»Р° СѓРґР°Р»РµРЅР°.", "success");
}

function saveSectionSchema(sectionKey) {
  const textarea = document.querySelector(`[data-builder-schema="${sectionKey}"]`);
  if (!textarea) return;
  let parsed;
  try {
    parsed = JSON.parse(textarea.value);
  } catch (error) {
    throw new Error(`JSON РЅРµ СЂР°СЃРїРѕР·РЅР°РЅ: ${error.message || "РѕС€РёР±РєР° СЃРёРЅС‚Р°РєСЃРёСЃР°"}`);
  }

  STATE.sectionBuilders[sectionKey] = normalizeSectionBuilder(sectionKey, {
    ...parsed,
    open: true
  });
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("JSON-СЃС…РµРјР° СЃРµРєС†РёРё СЃРѕС…СЂР°РЅРµРЅР°.", "success");
}

function resetSectionBuilder(sectionKey) {
  STATE.sectionBuilders[sectionKey] = createDefaultSectionBuilder(sectionKey);
  persistSectionBuilders();
  renderLiveSectionBuilder(sectionKey);
  rerenderLiveSection(sectionKey);
  setStatus("РЎРµРєС†РёСЏ СЃР±СЂРѕС€РµРЅР° Рє Р±Р°Р·РѕРІРѕР№ РєРѕРЅС„РёРіСѓСЂР°С†РёРё.", "success");
}

function renderLiveOverviewSummary() {
  if (!DOM.liveOverviewSummary) return;

  const totals = getCurrentBalanceTotals();
  const openSettlements = getOpenSettlementRows();
  const upcomingCalendar = STATE.calendarEntries.filter((entry) => {
    if (!entry.payment_date || entry.status === "РћС‚РјРµРЅРµРЅ") return false;
    const diff = diffDaysFromToday(entry.payment_date);
    return diff !== null && diff <= 14;
  });
  const upcomingIncoming = upcomingCalendar
    .filter((entry) => entry.operation_type === "РџСЂРёС…РѕРґ")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const upcomingOutgoing = upcomingCalendar
    .filter((entry) => entry.operation_type === "Р Р°СЃС…РѕРґ")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const totalAssetValue = STATE.assets.reduce((sum, item) => sum + toNumber(item.asset_value), 0);
  const totalAssetPaid = STATE.assetPayments.reduce((sum, item) => sum + toNumber(item.payment_amount), 0);
  const remainingAssetValue = roundMoney(totalAssetValue - totalAssetPaid);

  DOM.liveOverviewSummary.innerHTML = `
    <article class="summary-card">
      <span>Р‘Р°Р»Р°РЅСЃ РєРѕРјРїР°РЅРёРё СЃРµР№С‡Р°СЃ</span>
      <strong>${formatMoney(totals.total)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РџРѕСЃС‚СѓРїР»РµРЅРёСЏ РЅР° 14 РґРЅРµР№</span>
      <strong>${formatMoney(upcomingIncoming)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РџР»Р°С‚РµР¶Рё РЅР° 14 РґРЅРµР№</span>
      <strong>${formatMoney(upcomingOutgoing)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РћС‚РєСЂС‹С‚С‹Рµ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹</span>
      <strong>${openSettlements.length}</strong>
    </article>
    <article class="summary-card">
      <span>РћСЃС‚Р°С‚РѕРє РїРѕ Р°РєС‚РёРІР°Рј</span>
      <strong>${formatMoney(remainingAssetValue)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РџРѕР·РёС†РёРё Р·Р°РєСѓРїРѕРє</span>
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
      if (!entry.payment_date || entry.status === "РћС‚РјРµРЅРµРЅ") return false;
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
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} в‚Ѕ</strong>
      </div>
    `
  ).join("");

  const paymentItems = urgentCalendarRows.length
    ? urgentCalendarRows
        .map((entry) => {
          const diff = diffDaysFromToday(entry.payment_date);
          const dueLabel = diff < 0 ? `РџСЂРѕСЃСЂРѕС‡РµРЅРѕ РЅР° ${Math.abs(diff)} РґРЅ.` : diff === 0 ? "РЎРµРіРѕРґРЅСЏ" : `Р§РµСЂРµР· ${diff} РґРЅ.`;
          return `
            <div class="overview-list-item">
              <div>
                <strong>${escapeHtml(entry.counterparty || "Р‘РµР· РєРѕРЅС‚СЂР°РіРµРЅС‚Р°")}</strong>
                <span>${escapeHtml(formatDate(entry.payment_date))} вЂў ${escapeHtml(dueLabel)}</span>
              </div>
              <strong class="${entry.operation_type === "РџСЂРёС…РѕРґ" ? "amount-positive" : "amount-negative"}">
                ${entry.operation_type === "РџСЂРёС…РѕРґ" ? "+" : "-"}${formatMoney(entry.amount)} в‚Ѕ
              </strong>
            </div>
          `;
        })
        .join("")
    : `<div class="muted">РќР° Р±Р»РёР¶Р°Р№С€РёРµ 14 РґРЅРµР№ РЅРѕРІС‹С… РїР»Р°С‚РµР¶РµР№ РЅРµ РЅР°Р№РґРµРЅРѕ.</div>`;

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
                ${item.settlementTotal >= 0 ? "+" : ""}${formatMoney(item.settlementTotal)} в‚Ѕ
              </strong>
            </div>
          `
        )
        .join("")
    : `<div class="muted">РћС‚РєСЂС‹С‚С‹С… РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚РѕРІ СЃРµР№С‡Р°СЃ РЅРµС‚.</div>`;

  const purchaseItems = recentPurchases.length
    ? recentPurchases
        .map(
          (item) => `
            <div class="overview-list-item">
              <div>
                <strong>${escapeHtml(item.item_name || item.article || "РџРѕР·РёС†РёСЏ")}</strong>
                <span>${escapeHtml(item.supplier_name || "Р‘РµР· РїРѕСЃС‚Р°РІС‰РёРєР°")} вЂў ${escapeHtml(item.category || "Р‘РµР· РєР°С‚РµРіРѕСЂРёРё")}</span>
              </div>
              <strong>${formatMoney(item.price)} в‚Ѕ</strong>
            </div>
          `
        )
        .join("")
    : `<div class="muted">РљР°С‚Р°Р»РѕРі Р·Р°РєСѓРїРѕРє РїРѕРєР° РїСѓСЃС‚.</div>`;

  DOM.liveOverviewPanels.innerHTML = `
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Р¤РёРЅР°РЅСЃС‹ СЃРµР№С‡Р°СЃ</div>
      <h3>Р”РµРЅСЊРіРё РїРѕ РєРѕРЅС‚СѓСЂР°Рј</h3>
      <div class="overview-list">${accountItems}</div>
      <div class="overview-panel-footnote">РџРѕСЃР»РµРґРЅРµРµ РѕР±РЅРѕРІР»РµРЅРёРµ: ${escapeHtml(formatDateTime(latestFinanceUpdate))}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">Р‘Р»РёР¶Р°Р№С€РёРµ РґР°С‚С‹</div>
      <h3>РџР»Р°С‚РµР¶РЅС‹Р№ СЂР°РґР°СЂ</h3>
      <div class="overview-list">${paymentItems}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">РџР°СЂС‚РЅРµСЂС‹</div>
      <h3>РљРѕРјСѓ РЅСѓР¶РЅРѕ СѓРґРµР»РёС‚СЊ РІРЅРёРјР°РЅРёРµ</h3>
      <div class="overview-list">${settlementItems}</div>
    </article>
    <article class="subsection-card overview-panel">
      <div class="panel-kicker">РђРєС‚РёРІС‹ Рё Р·Р°РєСѓРїРєРё</div>
      <h3>РњР°С‚РµСЂРёР°Р»СЊРЅР°СЏ Р±Р°Р·Р°</h3>
      <div class="overview-inline-stats">
        <div><span>РђРєС‚РёРІРѕРІ</span><strong>${STATE.assets.length}</strong></div>
        <div><span>РЎС‚РѕРёРјРѕСЃС‚СЊ</span><strong>${formatMoney(totalAssetValue)} в‚Ѕ</strong></div>
        <div><span>Р’С‹РїР»Р°С‡РµРЅРѕ</span><strong>${formatMoney(totalAssetPaid)} в‚Ѕ</strong></div>
        <div><span>РџРѕСЃС‚Р°РІС‰РёРєРѕРІ</span><strong>${uniqueSuppliers.size}</strong></div>
        <div><span>РљР°С‚РµРіРѕСЂРёР№</span><strong>${uniqueCategories.size}</strong></div>
        <div><span>Р—Р°РєСѓРїРѕРє</span><strong>${STATE.purchaseCatalog.length}</strong></div>
      </div>
      <div class="overview-list mt-3">${purchaseItems}</div>
    </article>
  `;
}

function sanitizeSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9Р°-СЏС‘_-]+/gi, "-")
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

function repairMojibakeText(value) {
  if (typeof value !== "string") return value;
  if (!/[ÐÑРСЃЃв]/.test(value)) return value;
  try {
    let repaired = decodeURIComponent(escape(value));
    if (/[ÐÑРСЃЃв]/.test(repaired) && repaired !== value) {
      try {
        const repairedTwice = decodeURIComponent(escape(repaired));
        if (/[А-Яа-яЁё₽]/.test(repairedTwice)) repaired = repairedTwice;
      } catch {}
    }
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

function repairMojibakeDom(root = document.body) {
  if (!root) return;

  const repairNode = (node) => {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const nextValue = repairMojibakeText(node.nodeValue);
      if (nextValue !== node.nodeValue) {
        node.nodeValue = nextValue;
      }
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    ["placeholder", "title", "aria-label", "value"].forEach((attr) => {
      if (!node.hasAttribute?.(attr)) return;
      const currentValue = node.getAttribute(attr);
      const nextValue = repairMojibakeText(currentValue);
      if (nextValue !== currentValue) {
        node.setAttribute(attr, nextValue);
      }
    });

    node.childNodes.forEach(repairNode);
  };

  repairNode(root);
}

function scheduleMojibakeRepair(root = document.body) {
  window.requestAnimationFrame(() => repairMojibakeDom(root));
}

function installMojibakeRepairObserver() {
  if (window.__light2MojibakeObserverInstalled) return;
  window.__light2MojibakeObserverInstalled = true;
  const observer = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.type === "characterData") {
        repairMojibakeDom(record.target?.parentNode || document.body);
        return;
      }
      record.addedNodes.forEach((node) => repairMojibakeDom(node));
      if (record.type === "attributes") {
        repairMojibakeDom(record.target);
      }
    });
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder", "title", "aria-label", "value"]
  });
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

function withTimeout(promise, timeoutMs, timeoutMessage) {
  let timerId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = window.setTimeout(() => {
      reject(new Error(timeoutMessage || "РџСЂРµРІС‹С€РµРЅРѕ РІСЂРµРјСЏ РѕР¶РёРґР°РЅРёСЏ РѕС‚РІРµС‚Р°."));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timerId) window.clearTimeout(timerId);
  });
}

function getCurrentPartnerSlug() {
  if (STATE.profile?.partner_slug) return STATE.profile.partner_slug;
  const linkedPartner = STATE.partnerProfiles.find((partner) => partner.owner_user_id === STATE.user?.id);
  return linkedPartner?.slug || "";
}

function getPartnerLabel(slug) {
  const cleanSlug = sanitizeSlug(slug);
  const partner = STATE.partnerProfiles.find((item) => item.slug === cleanSlug);
  return partner?.display_name || cleanSlug || "вЂ”";
}

function getBalanceAccountLabel(accountType) {
  return BALANCE_ACCOUNTS.find((item) => item.value === accountType)?.label || "вЂ”";
}

function signedCalendarAmount(entry) {
  const amount = toNumber(entry?.amount);
  return entry?.operation_type === "РџСЂРёС…РѕРґ" ? amount : -amount;
}

function computeSettlement(entry) {
  const salary = toNumber(entry?.salary_amount);
  const purchase = toNumber(entry?.purchase_amount);
  const total = Math.round((salary - purchase) * 100) / 100;
  let direction = "Р‘Р°Р»Р°РЅСЃ Р·Р°РєСЂС‹С‚";

  if (entry?.status === "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ РїСЂРѕРёР·РІРµРґРµРЅ") {
    direction = "Р’Р·Р°РёРјРѕСЂР°СЃС‡С‘С‚ Р·Р°РєСЂС‹С‚";
  } else if (total > 0) {
    direction = "РљРѕРјРїР°РЅРёСЏ РґРѕР»Р¶РЅР° РїР°СЂС‚РЅРµСЂСѓ";
  } else if (total < 0) {
    direction = "РџР°СЂС‚РЅРµСЂ РґРѕР»Р¶РµРЅ РєРѕРјРїР°РЅРёРё";
  }

  return { salary, purchase, total, direction };
}

function getStatusTone(status) {
  if (status === "Рљ РІС‹РїР»Р°С‚Рµ") return "status-ready";
  if (status === "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ РїСЂРѕРёР·РІРµРґРµРЅ") return "status-closed";
  if (status === "РЎРїРѕСЂ") return "status-dispute";
  if (status === "РђСЂС…РёРІ") return "status-archive";
  return "status-open";
}

function setStatus(message, tone = "") {
  if (!DOM.statusBox) return;
  DOM.statusBox.textContent = message;
  DOM.statusBox.className = `status-card${tone ? ` ${tone}` : ""}`;
}

function setModuleState(label) {
  if (!DOM.moduleState) return;
  DOM.moduleState.textContent = label;
}

async function activateReadonlyFallback(reason) {
  try {
    if (!STATE.workbookSnapshot) {
      await withTimeout(
        loadWorkbookSnapshot(),
        8000,
        "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ snapshot РљРѕРЅС‚СѓСЂ РґР»СЏ СЂРµР·РµСЂРІРЅРѕРіРѕ СЂРµР¶РёРјР°."
      );
    }
  } catch (error) {
    console.warn("light2 readonly fallback snapshot load failed", error);
  }

  if (!STATE.profile) {
    STATE.profile = {
      id: null,
      display_name: STATE.user?.email || "Р РµР·РµСЂРІРЅС‹Р№ СЂРµР¶РёРј",
      full_name: "",
      role: "user",
      partner_slug: null
    };
  }

  if (DOM.userDisplay) {
    DOM.userDisplay.textContent =
      STATE.profile?.display_name ||
      STATE.user?.email ||
      "Р РµР·РµСЂРІРЅС‹Р№ СЂРµР¶РёРј";
  }

  if (DOM.accessMode) {
    DOM.accessMode.textContent = "РџСЂРѕСЃРјРѕС‚СЂ snapshot";
  }

  renderOverview();
  renderWorkbookSnapshotSections();
  syncSectionTabs();
  openSection("overview");
  syncWorkspaceModeUi();
  syncImportButton();
  setModuleState("Р РµР·РµСЂРІРЅС‹Р№ СЂРµР¶РёРј");
  setStatus(
    `РљРѕРЅС‚СѓСЂ РѕС‚РєСЂС‹С‚ РІ СЂРµР·РµСЂРІРЅРѕРј СЂРµР¶РёРјРµ. Р–РёРІС‹Рµ С‚Р°Р±Р»РёС†С‹ РІСЂРµРјРµРЅРЅРѕ РЅРµРґРѕСЃС‚СѓРїРЅС‹, РЅРѕ РґР°РЅРЅС‹Рµ РёР· РёСЃС…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° СѓР¶Рµ РґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ РїСЂРѕСЃРјРѕС‚СЂР°.${reason?.message ? ` РџСЂРёС‡РёРЅР°: ${reason.message}` : ""}`,
    "warning"
  );
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
    ? "РРјРїРѕСЂС‚РёСЂСѓСЋ РёСЃС…РѕРґРЅРёРє..."
    : "РРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ Р·Р°РїРѕР»РЅРµРЅРЅС‹Р№ РёСЃС…РѕРґРЅРёРє";

  if (!isAdmin()) {
    DOM.importWorkbookButton.classList.add("d-none");
    setImportStatus("РРјРїРѕСЂС‚ РёСЃС…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.");
    return;
  }

  DOM.importWorkbookButton.classList.remove("d-none");

  if (STATE.workbookError) {
    setImportStatus(`РЎРІРµСЂРѕС‡РЅС‹Р№ С„Р°Р№Р» РЅРµ Р·Р°РіСЂСѓР·РёР»СЃСЏ: ${STATE.workbookError}`, "error");
    return;
  }

  if (!STATE.workbookReady) {
    setImportStatus("РџРѕРґРіРѕС‚Р°РІР»РёРІР°СЋ Р·Р°РїРѕР»РЅРµРЅРЅС‹Р№ РёСЃС…РѕРґРЅРёРє РґР»СЏ РёРјРїРѕСЂС‚Р°...");
    return;
  }

  if (!hasImportableWorkbookData()) {
    setImportStatus("Р­С‚Р°Р»РѕРЅ Р”РћРњ РќР•РћРќРђ СЃРµР№С‡Р°СЃ РїСѓСЃС‚РѕР№. РџР»Р°С‚С„РѕСЂРјР° СЃС‚Р°СЂС‚СѓРµС‚ СЃ С‡РёСЃС‚РѕР№ Р±Р°Р·С‹, РёРјРїРѕСЂС‚ РїРѕРєР° РЅРµ РЅСѓР¶РµРЅ.");
    return;
  }

  if (!STATE.financeReady || !STATE.operationsReady || !STATE.schemaReady) {
    setImportStatus("РџРµСЂРµРґ РёРјРїРѕСЂС‚РѕРј РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡Рё Р”РћРњ РќР•РћРќРђ РґР»СЏ СЃС…РµРјС‹, С„РёРЅР°РЅСЃРѕРІ, РѕРїРµСЂР°С†РёР№ Рё workbook sync.", "error");
    return;
  }

  setImportStatus("РРјРїРѕСЂС‚ РїРµСЂРµРЅРѕСЃРёС‚ Р·Р°РїРѕР»РЅРµРЅРЅС‹Рµ Р±Р»РѕРєРё РёСЃС…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° РІ СЂР°Р±РѕС‡РёРµ С‚Р°Р±Р»РёС†С‹ РїР»Р°С‚С„РѕСЂРјС‹ Р±РµР· РґСѓР±Р»РµР№.");
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
      button.textContent = shouldHide ? "РџРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјСѓ" : "РЎРєСЂС‹С‚СЊ С„РѕСЂРјСѓ";
      button.classList.toggle("btn-dark", !shouldHide);
      button.classList.toggle("btn-outline-dark", shouldHide);
    });
  });

  if (DOM.toggleAllFormsButton) {
    const hiddenCount = Object.values(STATE.ui.hiddenForms || {}).filter(Boolean).length;
    const totalForms = Object.keys(STATE.ui.hiddenForms || {}).length || 1;
    const allHidden = hiddenCount >= totalForms;
    DOM.toggleAllFormsButton.textContent = allHidden ? "РџРѕРєР°Р·Р°С‚СЊ С„РѕСЂРјС‹" : "РЎРєСЂС‹С‚СЊ С„РѕСЂРјС‹";
    DOM.toggleAllFormsButton.classList.toggle("btn-dark", allHidden);
    DOM.toggleAllFormsButton.classList.toggle("btn-outline-dark", !allHidden);
  }
}

function syncWorkspaceModeUi() {
  document.body.classList.toggle("compact-tables", STATE.ui.compactTables);
  if (DOM.toggleCompactTablesButton) {
    DOM.toggleCompactTablesButton.textContent = STATE.ui.compactTables ? "РћР±С‹С‡РЅС‹Рµ С‚Р°Р±Р»РёС†С‹" : "РљРѕРјРїР°РєС‚РЅС‹Рµ С‚Р°Р±Р»РёС†С‹";
    DOM.toggleCompactTablesButton.classList.toggle("btn-dark", STATE.ui.compactTables);
    DOM.toggleCompactTablesButton.classList.toggle("btn-outline-dark", !STATE.ui.compactTables);
  }

  const hiddenCount = Object.values(STATE.ui.hiddenForms || {}).filter(Boolean).length;
  if (DOM.workspaceModeLabel) {
    DOM.workspaceModeLabel.textContent = STATE.ui.compactTables
      ? `РљРѕРјРїР°РєС‚РЅС‹Р№ СЂРµР¶РёРј РІРєР»СЋС‡РµРЅ. РЎРєСЂС‹С‚С‹С… С„РѕСЂРј: ${hiddenCount}.`
      : `РЎС‚Р°РЅРґР°СЂС‚РЅС‹Р№ СЂРµР¶РёРј С‚Р°Р±Р»РёС†. РЎРєСЂС‹С‚С‹С… С„РѕСЂРј: ${hiddenCount}.`;
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

function hasLiveContourData() {
  return Boolean(
    STATE.settlements.length ||
      STATE.balanceEntries.length ||
      STATE.calendarEntries.length ||
      STATE.assets.length ||
      STATE.assetPayments.length ||
      STATE.purchaseCatalog.length
  );
}

function getContourRestoreStamp() {
  if (!STATE.workbookSnapshot?.generatedAt || !STATE.workbookSnapshot?.workbook) return "";
  return `${STATE.workbookSnapshot.generatedAt}:${STATE.workbookSnapshot.workbook}`;
}

function readContourRestoreStamp() {
  return readStoredString(LIGHT2_UI_KEYS.restoreStamp, "");
}

function persistContourRestoreStamp() {
  try {
    const stamp = getContourRestoreStamp();
    if (stamp) {
      window.localStorage.setItem(LIGHT2_UI_KEYS.restoreStamp, stamp);
    }
  } catch {
    // Ignore localStorage failures in privacy modes.
  }
}

function shouldAutoRestoreContourData() {
  return (
    isAdmin() &&
    !STATE.importBusy &&
    STATE.workbookReady &&
    hasImportableWorkbookData() &&
    STATE.schemaReady &&
    STATE.financeReady &&
    STATE.operationsReady &&
    !hasLiveContourData() &&
    readContourRestoreStamp() !== getContourRestoreStamp()
  );
}

async function maybeAutoRestoreContourData() {
  if (STATE.autoRestoreAttempted || !shouldAutoRestoreContourData()) {
    return false;
  }

  STATE.autoRestoreAttempted = true;
  setImportStatus("Р–РёРІС‹Рµ С‚Р°Р±Р»РёС†С‹ РљРѕРЅС‚СѓСЂ РїСѓСЃС‚С‹. Р’РѕР·РІСЂР°С‰Р°СЋ РґР°РЅРЅС‹Рµ РёР· РёСЃС…РѕРґРЅРѕРіРѕ Р›РђР™Рў 2...");

  try {
    await importWorkbookIntoTables();
    STATE.autoRestoreCompleted = true;
    persistContourRestoreStamp();
    return true;
  } catch (error) {
    console.error("light2 auto restore failed", error);
    setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РІРµСЂРЅСѓС‚СЊ РґР°РЅРЅС‹Рµ РљРѕРЅС‚СѓСЂ.", "error");
    return false;
  }
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
  if (!Number.isFinite(value)) return "вЂ”";
  return `${new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value * 100)}%`;
}

function formatPlainNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "вЂ”";
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
    return getRowDisplay(row, 2) === "РЎСЂРµРґРЅРµРµ" && cells.some((cell) => isMonthLabel(cell.display));
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

    const leadRow = getMetricRowByLabels(rowMap, ["Р—Р°СЏРІРєРё/Р›РёРґС‹", "РљРѕРЅС‚Р°РєС‚С‹"]);
    const clickConversionRow = getMetricRowByLabels(rowMap, ["РљРѕРЅРІРµСЂСЃРёСЏ РєР»РёРєРё", "РљРѕРЅРІРµСЂСЃРёСЏ РІ РєРѕРЅС‚Р°РєС‚"]);
    const leadCostRow = getMetricRowByLabels(rowMap, ["РЎС‚РѕРёРјРѕСЃС‚СЊ Р»РёРґР°", "РЎС‚РѕРёРјРѕСЃС‚СЊ РєРѕРЅС‚Р°РєС‚Р°"]);

    const dataSeries = monthColumns
      .filter(({ columnIndex }) =>
        [
          getMetricCell(rowMap, ["Р Р°СЃС…РѕРґС‹"], columnIndex),
          getMetricCell(rowMap, ["Р—Р°СЏРІРєРё/Р›РёРґС‹", "РљРѕРЅС‚Р°РєС‚С‹"], columnIndex),
          getMetricCell(rowMap, ["РџСЂРѕРґР°Р¶Рё"], columnIndex),
          getMetricCell(rowMap, ["РџСЂРёР±С‹Р»СЊ С‡РёСЃС‚Р°СЏ"], columnIndex)
        ].some(hasSnapshotValue)
      )
      .map(({ columnIndex, monthLabel }) => ({
        columnIndex,
        monthLabel,
        spend: getMetricNumber(rowMap, ["Р Р°СЃС…РѕРґС‹"], columnIndex),
        leads: getMetricNumber(rowMap, ["Р—Р°СЏРІРєРё/Р›РёРґС‹", "РљРѕРЅС‚Р°РєС‚С‹"], columnIndex),
        sales: getMetricNumber(rowMap, ["РџСЂРѕРґР°Р¶Рё"], columnIndex),
        profitNet: getMetricNumber(rowMap, ["РџСЂРёР±С‹Р»СЊ С‡РёСЃС‚Р°СЏ"], columnIndex),
        costPerLead: getMetricNumber(rowMap, ["РЎС‚РѕРёРјРѕСЃС‚СЊ Р»РёРґР°", "РЎС‚РѕРёРјРѕСЃС‚СЊ РєРѕРЅС‚Р°РєС‚Р°"], columnIndex),
        costPerSale: getMetricNumber(rowMap, ["Р¦РµРЅР° РїСЂРѕРґР°Р¶Рё"], columnIndex),
        clickConversion: getMetricNumber(rowMap, ["РљРѕРЅРІРµСЂСЃРёСЏ РєР»РёРєРё", "РљРѕРЅРІРµСЂСЃРёСЏ РІ РєРѕРЅС‚Р°РєС‚"], columnIndex),
        leadConversion: getMetricNumber(rowMap, ["РљРѕРЅРІРµСЂСЃРёСЏ Р»РёРґР°"], columnIndex),
        saleConversion: getMetricNumber(rowMap, ["РљРѕРЅРІРµСЂСЃРёСЏ РїСЂРѕРґР°Р¶Рё"], columnIndex)
      }));

    return {
      title: getRowDisplay(headerRow, 1) || `РљР°РЅР°Р» ${index + 1}`,
      leadLabel: leadRow ? getRowDisplay(leadRow, 1) : "Р›РёРґС‹",
      clickConversionLabel: clickConversionRow ? getRowDisplay(clickConversionRow, 1) : "РљРѕРЅРІРµСЂСЃРёСЏ",
      leadCostLabel: leadCostRow ? getRowDisplay(leadCostRow, 1) : "РЎС‚РѕРёРјРѕСЃС‚СЊ Р»РёРґР°",
      hasLeadConversion: Boolean(getMetricRowByLabels(rowMap, ["РљРѕРЅРІРµСЂСЃРёСЏ Р»РёРґР°"])),
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
      .filter((row) => row.index >= 4 && repairMojibakeText(getRowDisplay(row, 1)))
      .map((row) => [repairMojibakeText(getRowDisplay(row, 1)), row])
  );

  const series = Array.from({ length: sheet.maxCol || 0 }, (_, idx) => idx + 1)
    .filter((columnIndex) => isMonthLabel(getSheetDisplay(sheet, 2, columnIndex)))
    .filter((columnIndex) => repairMojibakeText(getSheetDisplay(sheet, 3, columnIndex)).startsWith("Сумма"))
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
      businessProfitability: getMetricNumber(rowMap, ["Рентабельность бизнеса"], columnIndex),
      margin: getMetricNumber(rowMap, ["Маржа"], columnIndex),
      averageCheck: getMetricNumber(rowMap, ["Средний чек", "Чек"], columnIndex),
      sales: getMetricNumber(rowMap, ["Продаж", "Продажи"], columnIndex),
      warehouse: getMetricNumber(rowMap, ["Склад"], columnIndex),
      tbuMoney: getMetricNumber(rowMap, ["ТБУ в деньгах"], columnIndex)
    }))
    .filter(
      (item) =>
        hasSnapshotValue(getMetricCell(rowMap, ["Выручка"], item.columnIndex)) ||
        hasSnapshotValue(getMetricCell(rowMap, ["Чистая прибыль"], item.columnIndex)) ||
        hasSnapshotValue(getMetricCell(rowMap, ["Продаж", "Продажи"], item.columnIndex))
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
        partnerLabel: currentPartner || "Р‘РµР· РїСЂРёРІСЏР·РєРё"
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
          <div class="panel-kicker">РљР°РЅР°Р»</div>
          <h3>${escapeHtml(block.title)}</h3>
          <div class="analytics-caption">РџРѕСЃР»РµРґРЅРёР№ Р·Р°РїРѕР»РЅРµРЅРЅС‹Р№ СЃСЂРµР·: ${escapeHtml(latest.monthLabel)}</div>
          <div class="summary-row analytics-kpi-strip">
            <article class="summary-card">
              <span>Р Р°СЃС…РѕРґС‹</span>
              <strong>${formatMoney(latest.spend)} в‚Ѕ</strong>
            </article>
            <article class="summary-card">
              <span>${escapeHtml(block.leadLabel)}</span>
              <strong>${formatPlainNumber(latest.leads)}</strong>
            </article>
            <article class="summary-card">
              <span>РџСЂРѕРґР°Р¶Рё</span>
              <strong>${formatPlainNumber(latest.sales)}</strong>
            </article>
            <article class="summary-card">
              <span>Р§РёСЃС‚Р°СЏ РїСЂРёР±С‹Р»СЊ</span>
              <strong class="${latest.profitNet >= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(latest.profitNet)} в‚Ѕ</strong>
            </article>
          </div>
          <div class="analytics-chip-row">
            <span class="analytics-chip">${escapeHtml(block.clickConversionLabel)}: <strong>${formatPercentFromDecimal(latest.clickConversion)}</strong></span>
            ${block.hasLeadConversion ? `<span class="analytics-chip">РљРѕРЅРІРµСЂСЃРёСЏ Р»РёРґР°: <strong>${formatPercentFromDecimal(latest.leadConversion)}</strong></span>` : ""}
            <span class="analytics-chip">РљРѕРЅРІРµСЂСЃРёСЏ РїСЂРѕРґР°Р¶Рё: <strong>${formatPercentFromDecimal(latest.saleConversion)}</strong></span>
            <span class="analytics-chip">${escapeHtml(block.leadCostLabel)}: <strong>${formatMoney(latest.costPerLead)} в‚Ѕ</strong></span>
            <span class="analytics-chip">Р¦РµРЅР° РїСЂРѕРґР°Р¶Рё: <strong>${formatMoney(latest.costPerSale)} в‚Ѕ</strong></span>
          </div>
          <div class="table-shell mt-3">
            <table class="table table-sm align-middle analytics-mini-table">
              <thead>
                <tr>
                  <th>РњРµСЃСЏС†</th>
                  <th class="text-end">Р Р°СЃС…РѕРґС‹</th>
                  <th class="text-end">${escapeHtml(block.leadLabel)}</th>
                  <th class="text-end">РџСЂРѕРґР°Р¶Рё</th>
                  <th class="text-end">Р§РёСЃС‚Р°СЏ РїСЂРёР±С‹Р»СЊ</th>
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
          <strong>${formatMoney(latest.averageCheck)} в‚Ѕ</strong>
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
            <span class="analytics-chip">Рентабельность продукции: <strong>${formatPercentFromDecimal(latest.productProfitability)}</strong></span>
            <span class="analytics-chip">Рентабельность бизнеса: <strong>${formatPercentFromDecimal(latest.businessProfitability)}</strong></span>
            <span class="analytics-chip">Склад: <strong>${formatMoney(latest.warehouse)} ₽</strong></span>
          </div>
          <div class="analytics-footnote">Показатели собраны в структуру платформы и больше не отображаются как сырая excel-таблица.</div>
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
          <span>РџРѕСЃР»РµРґРЅРёР№ РјРµСЃСЏС†</span>
          <strong>${escapeHtml(`${latest.monthLabel} ${latest.yearLabel}`.trim())}</strong>
        </article>
        <article class="summary-card">
          <span>РћР±РѕСЂРѕС‚</span>
          <strong>${formatMoney(latest.turnover)} в‚Ѕ</strong>
        </article>
        <article class="summary-card">
          <span>Р—Р°РєР°Р·РѕРІ</span>
          <strong>${formatPlainNumber(latest.orders)}</strong>
        </article>
        <article class="summary-card">
          <span>РЎСЂРµРґРЅРёР№ С‡РµРє РјРµСЃСЏС†Р°</span>
          <strong>${latest.orders ? formatMoney(latest.turnover / latest.orders) : "вЂ”"}</strong>
        </article>
      </div>
      <div class="subsection-grid analytics-grid">
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">Р“РѕРґРѕРІРѕР№ РєРѕРЅС‚СѓСЂ</div>
          <h3>${escapeHtml(latest.yearLabel)} РіРѕРґ РЅР° СЃРµРіРѕРґРЅСЏ</h3>
          <div class="overview-list">
            <div class="overview-list-item"><span>РћР±РѕСЂРѕС‚</span><strong>${formatMoney(currentYearTurnover)} в‚Ѕ</strong></div>
            <div class="overview-list-item"><span>Р—Р°РєР°Р·РѕРІ</span><strong>${formatPlainNumber(currentYearOrders)}</strong></div>
            <div class="overview-list-item"><span>РЎСЂРµРґРЅРёР№ С‡РµРє</span><strong>${currentYearOrders ? formatMoney(currentYearTurnover / currentYearOrders) : "вЂ”"}</strong></div>
            <div class="overview-list-item"><span>Р›СѓС‡С€РёР№ РјРµСЃСЏС†</span><strong>${bestMonth ? escapeHtml(`${bestMonth.monthLabel} ${bestMonth.yearLabel}`.trim()) : "вЂ”"}</strong></div>
          </div>
        </article>
        <article class="subsection-card analytics-panel">
          <div class="panel-kicker">РџР°СЂС‚РЅС‘СЂС‹</div>
          <h3>Р’РєР»Р°Рґ РїРѕ РїР°СЂС‚РЅС‘СЂР°Рј</h3>
          <div class="overview-list">
            ${parsed.partnerTotals
              .slice(0, 6)
              .map(
                (item) => `
                  <div class="overview-list-item">
                    <div>
                      <strong>${escapeHtml(item.partnerLabel)}</strong>
                      <span>${formatPlainNumber(item.months)} РјРµСЃ. вЂў ${formatPlainNumber(item.orders)} Р·Р°РєР°Р·РѕРІ</span>
                    </div>
                    <strong>${formatMoney(item.turnover)} в‚Ѕ</strong>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
        <article class="subsection-card analytics-panel analytics-panel-wide">
          <div class="panel-kicker">Р’СЂРµРјРµРЅРЅРѕР№ СЂСЏРґ</div>
          <h3>РћР±РѕСЂРѕС‚ Рё Р·Р°РєР°Р·С‹ РїРѕ РјРµСЃСЏС†Р°Рј</h3>
          <div class="table-shell mt-2">
            <table class="table table-sm align-middle analytics-mini-table">
              <thead>
                <tr>
                  <th>РњРµСЃСЏС†</th>
                  <th class="text-end">РћР±РѕСЂРѕС‚</th>
                  <th class="text-end">Р—Р°РєР°Р·РѕРІ</th>
                  <th class="text-end">РЎСЂРµРґРЅРёР№ С‡РµРє</th>
                  <th>РџР°СЂС‚РЅС‘СЂ</th>
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
                        <td class="text-end">${item.orders ? formatMoney(item.turnover / item.orders) : "вЂ”"}</td>
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
  if (status === "РџРѕСЃС‚СѓРїР»РµРЅРёРµ") return "status-closed";
  if (status === "РџР»Р°С‚РµР¶") return "status-ready";
  if (status === "РћС‚РјРµРЅРµРЅ") return "status-dispute";
  if (status === "РџРµСЂРµРЅРµСЃРµРЅ") return "status-archive";
  return "status-open";
}

function getOperationTone(type) {
  return type === "РџСЂРёС…РѕРґ" ? "type-incoming" : "type-outgoing";
}

function renderInteractiveFinanceSections() {
  const balanceHost = document.querySelector('.template-host[data-template="balance"]');
  if (balanceHost) {
    balanceHost.innerHTML = `
      <div class="section-actions section-actions--workspace mb-3">
        <div class="section-actions__group">
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="balance">РќРѕРІР°СЏ Р·Р°РїРёСЃСЊ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="balance">РЎРєСЂС‹С‚СЊ С„РѕСЂРјСѓ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshBalanceButton">РћР±РЅРѕРІРёС‚СЊ</button>
        </div>
        <span class="workspace-chip">Р–РёРІРѕР№ Р±Р°Р»Р°РЅСЃ РїРѕ С‚СЂРµРј РєРѕРЅС‚СѓСЂР°Рј</span>
      </div>
      <div class="scope-note" id="balanceScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="balance"></div>
      <div class="light2-builder-host" data-builder-host="balance"></div>
      <form class="record-form" id="balanceForm">
        <div class="form-grid">
          <div>
            <label class="form-label">Р”Р°С‚Р°</label>
            <input class="form-control" type="date" name="entry_date" required />
          </div>
          <div>
            <label class="form-label">РЎС‡С‘С‚</label>
            <select class="form-select" name="account_type" required>
              <option value="cash_card">РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°</option>
              <option value="ooo_account">РЎС‡С‘С‚ РћРћРћ</option>
              <option value="ip_account">РЎС‡С‘С‚ РРџ</option>
            </select>
          </div>
          <div>
            <label class="form-label">РџСЂРёС…РѕРґ, в‚Ѕ</label>
            <input class="form-control" type="number" step="0.01" min="0" name="income_amount" value="0" required />
          </div>
          <div>
            <label class="form-label">Р Р°СЃС…РѕРґ, в‚Ѕ</label>
            <input class="form-control" type="number" step="0.01" min="0" name="expense_amount" value="0" required />
          </div>
          <div class="form-preview" id="balancePreview"></div>
        </div>
        <div class="mt-3">
          <label class="form-label">РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
          <textarea class="form-control" name="note" rows="2" placeholder="РќР°РїСЂРёРјРµСЂ: РїРѕСЃС‚СѓРїР»РµРЅРёРµ РѕС‚ РєР»РёРµРЅС‚Р°, Р·Р°РєСѓРїРєР°, Р°СЂРµРЅРґР°"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-dark" type="submit" id="balanceSubmitButton">РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ</button>
          <button class="btn btn-outline-secondary" type="button" id="balanceResetButton">РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button>
        </div>
      </form>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">РЎС‡С‘С‚</label>
          <select class="form-select" id="balanceAccountFilter">
            <option value="">Р’СЃРµ СЃС‡РµС‚Р°</option>
            <option value="cash_card">РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°</option>
            <option value="ooo_account">РЎС‡С‘С‚ РћРћРћ</option>
            <option value="ip_account">РЎС‡С‘С‚ РРџ</option>
          </select>
        </div>
        <div>
          <label class="form-label">РњРµСЃСЏС†</label>
          <input class="form-control" type="month" id="balanceMonthFilter" />
        </div>
        <div>
          <label class="form-label">РџРѕРёСЃРє</label>
          <input class="form-control" type="text" id="balanceSearch" placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№ РёР»Рё РґР°С‚Р°" />
        </div>
      </div>
      <div class="summary-row mt-3" id="balanceSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Р”Р°С‚Р°</th>
              <th>РЎС‡С‘С‚</th>
              <th class="text-end">РџСЂРёС…РѕРґ, в‚Ѕ</th>
              <th class="text-end">Р Р°СЃС…РѕРґ, в‚Ѕ</th>
              <th class="text-end">Р‘Р°Р»Р°РЅСЃ, в‚Ѕ</th>
              <th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
              <th>РћР±РЅРѕРІР»РµРЅРѕ</th>
              <th id="balanceActionsHead">Р”РµР№СЃС‚РІРёСЏ</th>
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
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="calendar">РќРѕРІР°СЏ Р·Р°РїРёСЃСЊ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="calendar">РЎРєСЂС‹С‚СЊ С„РѕСЂРјСѓ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshCalendarButton">РћР±РЅРѕРІРёС‚СЊ</button>
        </div>
        <span class="workspace-chip">РџР»Р°РЅ РґРµРЅРµРі Рё РѕР±СЏР·Р°С‚РµР»СЊСЃС‚РІ</span>
      </div>
      <div class="scope-note" id="calendarScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="calendar"></div>
      <div class="light2-builder-host" data-builder-host="calendar"></div>
      <form class="record-form" id="calendarForm">
        <div class="form-grid">
          <div>
            <label class="form-label">Р”Р°С‚Р° РїР»Р°С‚РµР¶Р°</label>
            <input class="form-control" type="date" name="payment_date" required />
          </div>
          <div>
            <label class="form-label">РљРѕРЅС‚СЂР°РіРµРЅС‚</label>
            <input class="form-control" type="text" name="counterparty" placeholder="РќР°РїСЂРёРјРµСЂ: Р°СЂРµРЅРґР°, РїРѕСЃС‚Р°РІС‰РёРє, РєР»РёРµРЅС‚" required />
          </div>
          <div>
            <label class="form-label">РЎСѓРјРјР°, в‚Ѕ</label>
            <input class="form-control" type="number" step="0.01" min="0" name="amount" value="0" required />
          </div>
          <div>
            <label class="form-label">РўРёРї РѕРїРµСЂР°С†РёРё</label>
            <select class="form-select" name="operation_type" required>
              <option value="Р Р°СЃС…РѕРґ">Р Р°СЃС…РѕРґ</option>
              <option value="РџСЂРёС…РѕРґ">РџСЂРёС…РѕРґ</option>
            </select>
          </div>
          <div>
            <label class="form-label">РЎС‚Р°С‚СЊСЏ</label>
            <input class="form-control" type="text" name="category" placeholder="РќР°РїСЂРёРјРµСЂ: Р—Р°СЂРїР»Р°С‚Р°" />
          </div>
          <div>
            <label class="form-label">РЎС‡С‘С‚</label>
            <select class="form-select" name="account_name" required>
              <option value="РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°">РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°</option>
              <option value="РЎС‡С‘С‚ РћРћРћ">РЎС‡С‘С‚ РћРћРћ</option>
              <option value="РЎС‡С‘С‚ РРџ">РЎС‡С‘С‚ РРџ</option>
              <option value="РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ">РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ</option>
            </select>
          </div>
          <div>
            <label class="form-label">РЎС‚Р°С‚СѓСЃ</label>
            <select class="form-select" name="status" required>
              <option value="РџР»Р°С‚РµР¶">РџР»Р°С‚РµР¶</option>
              <option value="РџРѕСЃС‚СѓРїР»РµРЅРёРµ">РџРѕСЃС‚СѓРїР»РµРЅРёРµ</option>
              <option value="РћР¶РёРґР°РµС‚">РћР¶РёРґР°РµС‚</option>
              <option value="РџРµСЂРµРЅРµСЃРµРЅ">РџРµСЂРµРЅРµСЃРµРЅ</option>
              <option value="РћС‚РјРµРЅРµРЅ">РћС‚РјРµРЅРµРЅ</option>
            </select>
          </div>
          <div class="form-preview" id="calendarPreview"></div>
        </div>
        <div class="mt-3">
          <label class="form-label">РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
          <textarea class="form-control" name="note" rows="2" placeholder="РЈС‚РѕС‡РЅРµРЅРёРµ РїРѕ РїР»Р°С‚РµР¶Сѓ, РґР°С‚Рµ РёР»Рё РѕР±СЏР·Р°С‚РµР»СЊСЃС‚РІСѓ"></textarea>
        </div>
        <div class="form-actions">
          <button class="btn btn-dark" type="submit" id="calendarSubmitButton">РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ</button>
          <button class="btn btn-outline-secondary" type="button" id="calendarResetButton">РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button>
        </div>
      </form>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">РњРµСЃСЏС†</label>
          <input class="form-control" type="month" id="calendarMonthFilter" />
        </div>
        <div>
          <label class="form-label">РўРёРї РѕРїРµСЂР°С†РёРё</label>
          <select class="form-select" id="calendarOperationFilter">
            <option value="">Р’СЃРµ РѕРїРµСЂР°С†РёРё</option>
            <option value="Р Р°СЃС…РѕРґ">Р Р°СЃС…РѕРґ</option>
            <option value="РџСЂРёС…РѕРґ">РџСЂРёС…РѕРґ</option>
          </select>
        </div>
        <div>
          <label class="form-label">РЎС‡С‘С‚</label>
          <select class="form-select" id="calendarAccountFilter">
            <option value="">Р’СЃРµ СЃС‡РµС‚Р°</option>
            <option value="РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°">РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°</option>
            <option value="РЎС‡С‘С‚ РћРћРћ">РЎС‡С‘С‚ РћРћРћ</option>
            <option value="РЎС‡С‘С‚ РРџ">РЎС‡С‘С‚ РРџ</option>
            <option value="РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ">РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ</option>
          </select>
        </div>
        <div>
          <label class="form-label">РЎС‚Р°С‚СѓСЃ</label>
          <select class="form-select" id="calendarStatusFilter">
            <option value="">Р’СЃРµ СЃС‚Р°С‚СѓСЃС‹</option>
            <option value="РџР»Р°С‚РµР¶">РџР»Р°С‚РµР¶</option>
            <option value="РџРѕСЃС‚СѓРїР»РµРЅРёРµ">РџРѕСЃС‚СѓРїР»РµРЅРёРµ</option>
            <option value="РћР¶РёРґР°РµС‚">РћР¶РёРґР°РµС‚</option>
            <option value="РџРµСЂРµРЅРµСЃРµРЅ">РџРµСЂРµРЅРµСЃРµРЅ</option>
            <option value="РћС‚РјРµРЅРµРЅ">РћС‚РјРµРЅРµРЅ</option>
          </select>
        </div>
        <div>
          <label class="form-label">РџРѕРёСЃРє</label>
          <input class="form-control" type="text" id="calendarSearch" placeholder="РљРѕРЅС‚СЂР°РіРµРЅС‚, СЃС‚Р°С‚СЊСЏ РёР»Рё РєРѕРјРјРµРЅС‚Р°СЂРёР№" />
        </div>
      </div>
      <div class="summary-row mt-3" id="calendarSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Р”Р°С‚Р° РїР»Р°С‚РµР¶Р°</th>
              <th>РљРѕРЅС‚СЂР°РіРµРЅС‚</th>
              <th class="text-end">РЎСѓРјРјР°, в‚Ѕ</th>
              <th>РўРёРї</th>
              <th>РЎС‚Р°С‚СЊСЏ</th>
              <th>РЎС‡С‘С‚</th>
              <th>РЎС‚Р°С‚СѓСЃ</th>
              <th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
              <th>РћР±РЅРѕРІР»РµРЅРѕ</th>
              <th id="calendarActionsHead">Р”РµР№СЃС‚РІРёСЏ</th>
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
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="assets">РќРѕРІР°СЏ Р·Р°РїРёСЃСЊ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="assets">РЎРєСЂС‹С‚СЊ С„РѕСЂРјСѓ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshAssetsButton">РћР±РЅРѕРІРёС‚СЊ</button>
        </div>
        <span class="workspace-chip">РђРєС‚РёРІС‹ Рё РіСЂР°С„РёРє РІС‹РїР»Р°С‚</span>
      </div>
      <div class="scope-note" id="assetsScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="assets"></div>
      <div class="light2-builder-host" data-builder-host="assets"></div>
      <div class="subsection-grid">
        <article class="subsection-card">
          <h3>РљР°СЂС‚РѕС‡РєР° Р°РєС‚РёРІР°</h3>
          <p>РЎС‚РѕРёРјРѕСЃС‚СЊ Р°РєС‚РёРІР° Рё Р±Р°Р·РѕРІС‹Р№ РєРѕРјРјРµРЅС‚Р°СЂРёР№. Р’С‹РїР»Р°С‚С‹ РІРµРґСѓС‚СЃСЏ РѕС‚РґРµР»СЊРЅРѕ РІ Р¶СѓСЂРЅР°Р»Рµ РЅРёР¶Рµ.</p>
          <form class="record-form mb-0" id="assetForm">
            <div class="form-grid">
              <div>
                <label class="form-label">РђРєС‚РёРІ</label>
                <input class="form-control" type="text" name="asset_name" placeholder="РќР°РїСЂРёРјРµСЂ: РЎР°Р№С‚" required />
              </div>
              <div>
                <label class="form-label">РЎС‚РѕРёРјРѕСЃС‚СЊ, в‚Ѕ</label>
                <input class="form-control" type="number" step="0.01" min="0" name="asset_value" value="0" required />
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
              <textarea class="form-control" name="note" rows="2" placeholder="Р§С‚Рѕ РІС…РѕРґРёС‚ РІ Р°РєС‚РёРІ РёР»Рё РєРѕРјСѓ РѕРЅ РїРµСЂРµРґР°РЅ"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-dark" type="submit" id="assetSubmitButton">РЎРѕС…СЂР°РЅРёС‚СЊ Р°РєС‚РёРІ</button>
              <button class="btn btn-outline-secondary" type="button" id="assetResetButton">РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button>
            </div>
          </form>
        </article>
        <article class="subsection-card">
          <h3>Р“СЂР°С„РёРє РІС‹РїР»Р°С‚ РїРѕ Р°РєС‚РёРІР°Рј</h3>
          <p>РњРѕР¶РЅРѕ РїСЂРёРІСЏР·Р°С‚СЊ РІС‹РїР»Р°С‚Сѓ Рє Р°РєС‚РёРІСѓ РёР»Рё РѕСЃС‚Р°РІРёС‚СЊ Р±РµР· РїСЂРёРІСЏР·РєРё, РєР°Рє РІ РёСЃС…РѕРґРЅРѕРј С„Р°Р№Р»Рµ Р”РћРњ РќР•РћРќРђ.</p>
          <form class="record-form mb-0" id="assetPaymentForm">
            <div class="form-grid">
              <div>
                <label class="form-label">РђРєС‚РёРІ</label>
                <select class="form-select" name="asset_id" id="assetPaymentAssetId"></select>
              </div>
              <div>
                <label class="form-label">Р”Р°С‚Р° РІС‹РїР»Р°С‚С‹</label>
                <input class="form-control" type="date" name="payment_date" required />
              </div>
              <div>
                <label class="form-label">РЎСѓРјРјР°, в‚Ѕ</label>
                <input class="form-control" type="number" step="0.01" min="0" name="payment_amount" value="0" required />
              </div>
            </div>
            <div class="mt-3">
              <label class="form-label">РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
              <textarea class="form-control" name="note" rows="2" placeholder="РќР°РїСЂРёРјРµСЂ: РїРµСЂРµРґР°Р» РЅР°Р»РёС‡РЅС‹РјРё РљРёСЂРёР»Р»Сѓ"></textarea>
            </div>
            <div class="form-actions">
              <button class="btn btn-dark" type="submit" id="assetPaymentSubmitButton">РЎРѕС…СЂР°РЅРёС‚СЊ РІС‹РїР»Р°С‚Сѓ</button>
              <button class="btn btn-outline-secondary" type="button" id="assetPaymentResetButton">РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button>
            </div>
          </form>
        </article>
      </div>
      <div class="toolbar-grid mt-3">
        <div>
          <label class="form-label">РџРѕРёСЃРє РїРѕ Р°РєС‚РёРІР°Рј</label>
          <input class="form-control" type="text" id="assetsSearch" placeholder="РќР°Р·РІР°РЅРёРµ РёР»Рё РєРѕРјРјРµРЅС‚Р°СЂРёР№" />
        </div>
        <div>
          <label class="form-label">Р¤РёР»СЊС‚СЂ РІС‹РїР»Р°С‚</label>
          <select class="form-select" id="assetPaymentFilter">
            <option value="">Р’СЃРµ Р°РєС‚РёРІС‹</option>
          </select>
        </div>
        <div>
          <label class="form-label">РџРѕРёСЃРє РїРѕ РІС‹РїР»Р°С‚Р°Рј</label>
          <input class="form-control" type="text" id="assetPaymentSearch" placeholder="РљРѕРјРјРµРЅС‚Р°СЂРёР№ РёР»Рё РґР°С‚Р°" />
        </div>
      </div>
      <div class="summary-row mt-3" id="assetsSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>РђРєС‚РёРІ</th>
              <th class="text-end">РЎС‚РѕРёРјРѕСЃС‚СЊ, в‚Ѕ</th>
              <th class="text-end">Р’С‹РїР»Р°С‡РµРЅРѕ, в‚Ѕ</th>
              <th class="text-end">РћСЃС‚Р°С‚РѕРє, в‚Ѕ</th>
              <th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
              <th>РћР±РЅРѕРІР»РµРЅРѕ</th>
              <th>Р”РµР№СЃС‚РІРёСЏ</th>
            </tr>
          </thead>
          <tbody id="assetsTableBody"></tbody>
        </table>
      </div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>Р”Р°С‚Р° РІС‹РїР»Р°С‚С‹</th>
              <th>РђРєС‚РёРІ</th>
              <th class="text-end">РЎСѓРјРјР°, в‚Ѕ</th>
              <th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
              <th>РћР±РЅРѕРІР»РµРЅРѕ</th>
              <th>Р”РµР№СЃС‚РІРёСЏ</th>
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
          <button type="button" class="btn btn-outline-dark btn-sm" data-section-start="purchases">РќРѕРІР°СЏ РїРѕР·РёС†РёСЏ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" data-form-toggle="purchases">РЎРєСЂС‹С‚СЊ С„РѕСЂРјСѓ</button>
          <button type="button" class="btn btn-outline-dark btn-sm" id="refreshPurchasesButton">РћР±РЅРѕРІРёС‚СЊ</button>
        </div>
        <span class="workspace-chip">РљР°С‚Р°Р»РѕРі РїРѕСЃС‚Р°РІС‰РёРєРѕРІ Рё С†РµРЅ</span>
      </div>
      <div class="scope-note" id="purchasesScopeNote"></div>
      <div class="light2-builder-strip" data-builder-strip="purchases"></div>
      <div class="light2-builder-host" data-builder-host="purchases"></div>
      <article class="subsection-card mb-3">
        <h3>РџРѕР·РёС†РёСЏ Р·Р°РєСѓРїРєРё</h3>
        <p>РќРѕСЂРјР°Р»РёР·РѕРІР°РЅРЅС‹Р№ РєР°С‚Р°Р»РѕРі РїРѕСЃС‚Р°РІС‰РёРєРѕРІ Рё РјР°С‚РµСЂРёР°Р»РѕРІ РёР· Р»РёСЃС‚Р° Р—Р°РєСѓРїРєРё.</p>
        <form class="record-form mb-0" id="purchaseForm">
          <div class="form-grid">
            <div>
              <label class="form-label">РљРѕРјРїР°РЅРёСЏ</label>
              <input class="form-control" type="text" name="supplier_name" placeholder="РџРѕСЃС‚Р°РІС‰РёРє" required />
            </div>
            <div>
              <label class="form-label">РРќРќ</label>
              <input class="form-control" type="text" name="supplier_inn" placeholder="РРќРќ РїРѕСЃС‚Р°РІС‰РёРєР°" />
            </div>
            <div>
              <label class="form-label">РЎСЃС‹Р»РєР°</label>
              <input class="form-control" type="url" name="supplier_url" placeholder="https://..." />
            </div>
            <div>
              <label class="form-label">Р“РѕСЂРѕРґ</label>
              <input class="form-control" type="text" name="city" placeholder="РќР°РїСЂРёРјРµСЂ: РЎРїР±" />
            </div>
            <div>
              <label class="form-label">РљР°С‚РµРіРѕСЂРёСЏ</label>
              <input class="form-control" type="text" name="category" placeholder="РќР°РїСЂРёРјРµСЂ: Р“РёР±РєРёР№ РЅРµРѕРЅ" />
            </div>
            <div>
              <label class="form-label">РђСЂС‚РёРєСѓР»</label>
              <input class="form-control" type="text" name="article" placeholder="РђСЂС‚РёРєСѓР»" />
            </div>
            <div>
              <label class="form-label">РќР°РёРјРµРЅРѕРІР°РЅРёРµ</label>
              <input class="form-control" type="text" name="item_name" placeholder="РќР°Р·РІР°РЅРёРµ РїРѕР·РёС†РёРё" />
            </div>
            <div>
              <label class="form-label">Р•Рґ. РёР·Рј.</label>
              <input class="form-control" type="text" name="unit_name" placeholder="Рј, С€С‚, Рј2" />
            </div>
            <div>
              <label class="form-label">Р¦РµРЅР°, в‚Ѕ</label>
              <input class="form-control" type="number" step="0.01" min="0" name="price" value="0" />
            </div>
          </div>
          <div class="mt-3">
            <label class="form-label">РљРѕРјРјРµРЅС‚Р°СЂРёР№</label>
            <textarea class="form-control" name="note" rows="2" placeholder="Р›СЋР±Р°СЏ Р·Р°РјРµС‚РєР° РїРѕ РїРѕР·РёС†РёРё РёР»Рё РїРѕСЃС‚Р°РІС‰РёРєСѓ"></textarea>
          </div>
          <div class="form-actions">
            <button class="btn btn-dark" type="submit" id="purchaseSubmitButton">РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ</button>
            <button class="btn btn-outline-secondary" type="button" id="purchaseResetButton">РћС‡РёСЃС‚РёС‚СЊ С„РѕСЂРјСѓ</button>
          </div>
        </form>
      </article>
      <div class="toolbar-grid">
        <div>
          <label class="form-label">РџРѕСЃС‚Р°РІС‰РёРє</label>
          <select class="form-select" id="purchaseSupplierFilter">
            <option value="">Р’СЃРµ РїРѕСЃС‚Р°РІС‰РёРєРё</option>
          </select>
        </div>
        <div>
          <label class="form-label">РљР°С‚РµРіРѕСЂРёСЏ</label>
          <select class="form-select" id="purchaseCategoryFilter">
            <option value="">Р’СЃРµ РєР°С‚РµРіРѕСЂРёРё</option>
          </select>
        </div>
        <div>
          <label class="form-label">РџРѕРёСЃРє</label>
          <input class="form-control" type="text" id="purchaseSearch" placeholder="РџРѕСЃС‚Р°РІС‰РёРє, Р°СЂС‚РёРєСѓР», РїРѕР·РёС†РёСЏ" />
        </div>
      </div>
      <div class="summary-row mt-3" id="purchaseSummary"></div>
      <div class="table-shell mt-3">
        <table class="table table-sm align-middle">
          <thead>
            <tr>
              <th>РљРѕРјРїР°РЅРёСЏ</th>
              <th>Р“РѕСЂРѕРґ</th>
              <th>РљР°С‚РµРіРѕСЂРёСЏ</th>
              <th>РђСЂС‚РёРєСѓР»</th>
              <th>РќР°РёРјРµРЅРѕРІР°РЅРёРµ</th>
              <th>Р•Рґ.</th>
              <th class="text-end">Р¦РµРЅР°, в‚Ѕ</th>
              <th>РЎСЃС‹Р»РєР°</th>
              <th>РљРѕРјРјРµРЅС‚Р°СЂРёР№</th>
              <th>Р”РµР№СЃС‚РІРёСЏ</th>
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
    "РќРµ РѕРїСЂРµРґРµР»РµРЅ";

  if (DOM.userDisplay) {
    DOM.userDisplay.textContent = displayName;
  }

  if (isAdmin()) {
    if (DOM.accessMode) {
      DOM.accessMode.textContent = "Р’Р»Р°РґРµР»РµС† / Р°РґРјРёРЅ";
    }
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  if (DOM.accessMode) {
    DOM.accessMode.textContent = partnerSlug ? `РџР°СЂС‚РЅРµСЂ: ${getPartnerLabel(partnerSlug)}` : "РћРіСЂР°РЅРёС‡РµРЅРЅС‹Р№ РґРѕСЃС‚СѓРї";
  }
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
        <button class="btn btn-dark btn-sm" type="button" data-open-section="${escapeHtml(key)}">РћС‚РєСЂС‹С‚СЊ</button>
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

function getSnapshotPrimaryLabel(row) {
  if (!row?.cells) return "";
  for (const col of [2, 1, 3]) {
    const value = compactText(row.cells[String(col)]?.display || row.cells[String(col)]?.raw || "");
    if (value) return value;
  }
  for (const cell of Object.values(row.cells)) {
    const value = compactText(cell?.display || cell?.raw || "");
    if (value) return value;
  }
  return "";
}

function renderSnapshotPrimaryDeck(sectionKey, rows) {
  if (!["forecast"].includes(sectionKey)) return "";
  const cards = rows
    .map((row) => {
      const label = getSnapshotPrimaryLabel(row);
      if (!label || label === "Изменения") return "";
      const values = Object.entries(row.cells || {})
        .filter(([col, cell]) => Number(col) > 2 && compactText(cell?.display || cell?.raw || ""))
        .map(([, cell]) => `<span class="metric-chip">${escapeHtml(String(cell.display || cell.raw || ""))}</span>`)
        .slice(0, 8)
        .join("");
      if (!values) return "";
      return `
        <article class="metric-deck-card">
          <strong>${escapeHtml(label)}</strong>
          <div class="metric-chip-row">${values}</div>
        </article>
      `;
    })
    .filter(Boolean)
    .slice(0, 18)
    .join("");

  if (!cards) return "";
  return `
    <section class="metric-deck">
      <div class="scope-note scope-note-soft">Показываю адаптированный срез по ключевым строкам. Исходную таблицу можно раскрыть ниже, если понадобится сверка.</div>
      <div class="metric-deck-grid">${cards}</div>
    </section>
  `;
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
        <div class="mt-2">Раздел сейчас пустой. Его можно заполнять уже внутри платформы.</div>
      </div>
    `;
    return;
  }

  const rows = buildSnapshotRows(sheet, sectionKey);
  const headerRow = sheet.rows.find((row) => row.index <= 3) || sheet.rows[0];
  const columns = Array.from({ length: sheet.maxCol || 1 }, (_, idx) => idx + 1);
  const analyticsHtml = renderSnapshotAnalytics(sectionKey, sheet);
  const primaryDeckHtml = renderSnapshotPrimaryDeck(sectionKey, rows);

  host.innerHTML = `
    ${analyticsHtml}
    ${primaryDeckHtml}
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
      Сводка уже адаптирована под стиль платформы. Исходную таблицу можно развернуть только при необходимости.
    </div>
    <div class="snapshot-source-panel collapsed" data-source-panel>
      <button type="button" class="snapshot-source-toggle" data-toggle-source-panel>
        <span data-toggle-source-label>Показать исходную таблицу</span>
      </button>
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
    const response = await withTimeout(
      fetch(`./workbook_snapshot.json?v=${LIGHT2_BUILD}`, { cache: "no-store" }),
      6000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ СЌС‚Р°Р»РѕРЅ РљРѕРЅС‚СѓСЂ."
    );
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    STATE.workbookSnapshot = repairMojibakeDeep(await withTimeout(
      response.json(),
      4000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ РїСЂРѕС‡РёС‚Р°С‚СЊ snapshot РљРѕРЅС‚СѓСЂ."
    ));
    STATE.workbookReady = true;
    STATE.workbookError = "";
  } catch (error) {
    STATE.workbookError = error.message || "РЅРµРёР·РІРµСЃС‚РЅР°СЏ РѕС€РёР±РєР°";
  }
  renderWorkbookSnapshotSections();
  renderOverview();
  syncModuleStatus();
  syncImportButton();
}

function buildBalanceImportRows() {
  const sheet = getWorkbookSheetByName("Р‘Р°Р»Р°РЅСЃ");
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
            source_sheet: "Р‘Р°Р»Р°РЅСЃ",
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
  const sheet = getWorkbookSheetByName("РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ");
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
          source_sheet: "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ",
          source_row: row.index,
          payment_date: paymentDate,
          counterparty,
          amount,
          operation_type: operationType === "РџСЂРёС…РѕРґ" ? "РџСЂРёС…РѕРґ" : "Р Р°СЃС…РѕРґ",
          category: category || null,
          account_name: validAccounts.has(accountNameRaw) ? accountNameRaw : "РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ",
          status: validStatuses.has(statusRaw) ? statusRaw : "РћР¶РёРґР°РµС‚",
          note: note || null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildAssetsImportRows() {
  const sheet = getWorkbookSheetByName("РђРєС‚РёРІС‹");
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
          source_sheet: "РђРєС‚РёРІС‹",
          source_row: row.index,
          asset_name: assetName || `РђРєС‚РёРІ ${row.index}`,
          asset_value: assetValue,
          note: null,
          created_by: STATE.user?.id || null
        }
      ];
    });
}

function buildAssetPaymentImportRows() {
  const sheet = getWorkbookSheetByName("РђРєС‚РёРІС‹");
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
        noteParts.push(`РџР»Р°РЅ РёР· РёСЃС…РѕРґРЅРёРєР°: ${formatMoney(trancheOne)} в‚Ѕ + ${formatMoney(trancheTwo)} в‚Ѕ`);
      }
      if (noteRaw) {
        noteParts.push(noteRaw);
      }

      return [
        {
          source_sheet: "РђРєС‚РёРІС‹",
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
  const sheet = getWorkbookSheetByName("Р—Р°РєСѓРїРєРё");
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
          source_sheet: "Р—Р°РєСѓРїРєРё",
          source_row: row.index,
          supplier_name: currentSupplierName,
          supplier_inn: currentInn || null,
          supplier_url: currentUrl && currentUrl !== "РќРµС‚" ? currentUrl : null,
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
  const sheet = getWorkbookSheetByName("Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ СЃ РјР°СЃС‚РµСЂР°РјРё");
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
      const status = String(getWorkbookDisplay(row, 7) || "").trim() || "РћР¶РёРґР°РµС‚ СЃРІРµСЂРєРё";

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
          notes: "РРјРїРѕСЂС‚РёСЂРѕРІР°РЅРѕ РёР· РёСЃС…РѕРґРЅРѕРіРѕ С„Р°Р№Р»Р° Р”РћРњ РќР•РћРќРђ.",
          calculator_url: `../part/index.html?partner=${encodeURIComponent(slug)}`
        });
      }

      settlements.push({
        source_sheet: "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ СЃ РјР°СЃС‚РµСЂР°РјРё",
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
    throw new Error("РРјРїРѕСЂС‚ РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.");
  }

  if (!STATE.workbookReady) {
    await loadWorkbookSnapshot();
  }

  if (!hasImportableWorkbookData()) {
    setImportStatus("Р­С‚Р°Р»РѕРЅ РїСѓСЃС‚РѕР№, РїРѕСЌС‚РѕРјСѓ РёРјРїРѕСЂС‚ РЅРµ С‚СЂРµР±СѓРµС‚СЃСЏ. Р Р°Р±РѕС‡РёРµ С‚Р°Р±Р»РёС†С‹ СѓР¶Рµ РіРѕС‚РѕРІС‹ Рє СЂСѓС‡РЅРѕРјСѓ Р·Р°РїРѕР»РЅРµРЅРёСЋ.");
    return;
  }

  if (!STATE.schemaReady || !STATE.financeReady || !STATE.operationsReady) {
    throw new Error("РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡Рё Р”РћРњ РќР•РћРќРђ: schema, finance, operations Рё workbook sync.");
  }

  STATE.importBusy = true;
  syncImportButton();
  setImportStatus("РџСЂРѕРІРµСЂСЏСЋ Р·Р°РїРѕР»РЅРµРЅРЅС‹Р№ РёСЃС…РѕРґРЅРёРє Рё РїРµСЂРµРЅРѕС€Сѓ РґР°РЅРЅС‹Рµ РІ СЂР°Р±РѕС‡РёРµ С‚Р°Р±Р»РёС†С‹...");

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
      `РРјРїРѕСЂС‚ Р·Р°РІРµСЂС€РµРЅ: Р±Р°Р»Р°РЅСЃ ${balanceRows.length}, РєР°Р»РµРЅРґР°СЂСЊ ${calendarRows.length}, Р°РєС‚РёРІС‹ ${assetsRows.length}, РІС‹РїР»Р°С‚С‹ ${assetPaymentRows.length}, Р·Р°РєСѓРїРєРё ${purchaseRows.length}, РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ ${settlementData.settlements.length}.`,
      "success"
    );
    setStatus("Р—Р°РїРѕР»РЅРµРЅРЅС‹Р№ РёСЃС…РѕРґРЅРёРє Р”РћРњ РќР•РћРќРђ РїРµСЂРµРЅРµСЃС‘РЅ РІ СЂР°Р±РѕС‡РёРµ С‚Р°Р±Р»РёС†С‹ РїР»Р°С‚С„РѕСЂРјС‹.", "success");
  } catch (error) {
    const rawMessage = error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ РёСЃС…РѕРґРЅС‹Р№ С„Р°Р№Р».";
    const message =
      rawMessage.includes("source_") ||
      rawMessage.includes("ip_account") ||
      rawMessage.includes("asset_id") ||
      rawMessage.includes("duplicate key value")
        ? `РЅСѓР¶РµРЅ SQL-РїР°С‚С‡ platform_light2_workbook_sync_patch.sql (${rawMessage})`
        : rawMessage;
    setImportStatus(`РРјРїРѕСЂС‚ РѕСЃС‚Р°РЅРѕРІР»РµРЅ: ${message}`, "error");
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
    items.push(`<option value="">Р’СЃРµ РїР°СЂС‚РЅРµСЂС‹</option>`);
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
    <span>РС‚РѕРі РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р°</span>
    <strong>${formatMoney(math.total)} в‚Ѕ</strong>
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
  DOM.settlementForm.elements.status.value = "РћР¶РёРґР°РµС‚ СЃРІРµСЂРєРё";
  DOM.settlementSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ";

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
    DOM.scopeNote.textContent = "Р”Р»СЏ Р±Р»РѕРєР° РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚РѕРІ РЅСѓР¶РЅРѕ РѕРґРёРЅ СЂР°Р· РІС‹РїРѕР»РЅРёС‚СЊ SQL-РїР°С‚С‡ platform_light2_patch.sql.";
    return;
  }

  if (isAdmin()) {
    DOM.scopeNote.textContent = "Р’С‹ РІРёРґРёС‚Рµ РІСЃРµ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ Рё РјРѕР¶РµС‚Рµ СѓРїСЂР°РІР»СЏС‚СЊ РёРјРё РёР· РѕРґРЅРѕРіРѕ РјРµСЃС‚Р°.";
    return;
  }

  const partnerSlug = getCurrentPartnerSlug();
  if (!partnerSlug) {
    DOM.scopeNote.textContent = "РџР°СЂС‚РЅРµСЂ РµС‰Рµ РЅРµ РїСЂРёРІСЏР·Р°РЅ Рє РІР°С€РµРјСѓ РїСЂРѕС„РёР»СЋ. РџРѕСЃР»Рµ РїСЂРёРІСЏР·РєРё С‚СѓС‚ РїРѕСЏРІСЏС‚СЃСЏ С‚РѕР»СЊРєРѕ РІР°С€Рё РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹.";
    return;
  }

  DOM.scopeNote.textContent = `Р’С‹ РІРёРґРёС‚Рµ С‚РѕР»СЊРєРѕ СЃРІРѕР№ РєРѕРЅС‚СѓСЂ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚РѕРІ: ${getPartnerLabel(partnerSlug)}.`;
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
    <span>Р­С„С„РµРєС‚ Р·Р°РїРёСЃРё</span>
    <strong class="${delta >= 0 ? "amount-positive" : "amount-negative"}">${delta >= 0 ? "+" : ""}${formatMoney(delta)} в‚Ѕ</strong>
    <span>${escapeHtml(accountLabel)}</span>
  `;
}

function updateCalendarPreview() {
  const dom = getCalendarDom();
  if (!dom.form || !dom.preview) return;

  const formData = new FormData(dom.form);
  const type = String(formData.get("operation_type") || "Р Р°СЃС…РѕРґ");
  const amount = toNumber(formData.get("amount"));
  const signed = type === "РџСЂРёС…РѕРґ" ? amount : -amount;
  const account = String(formData.get("account_name") || "РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ");
  const status = String(formData.get("status") || "РџР»Р°С‚РµР¶");

  dom.preview.innerHTML = `
    <span>Р­С„С„РµРєС‚ РїРѕ РєР°Р»РµРЅРґР°СЂСЋ</span>
    <strong class="${signed >= 0 ? "amount-positive" : "amount-negative"}">${signed >= 0 ? "+" : ""}${formatMoney(signed)} в‚Ѕ</strong>
    <span>${escapeHtml(account)} вЂў ${escapeHtml(status)}</span>
  `;
}

function resetBalanceForm() {
  const dom = getBalanceDom();
  if (!dom.form) return;

  STATE.editingBalanceId = null;
  dom.form.reset();
  dom.form.elements.entry_date.value = getTodayIso();
  dom.form.elements.account_type.value = "cash_card";
  dom.form.elements.income_amount.value = "0";
  dom.form.elements.expense_amount.value = "0";
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("balance"));
  updateBalancePreview();
}

function resetCalendarForm() {
  const dom = getCalendarDom();
  if (!dom.form) return;

  STATE.editingCalendarId = null;
  dom.form.reset();
  dom.form.elements.payment_date.value = getTodayIso();
  dom.form.elements.operation_type.value = "Р Р°СЃС…РѕРґ";
  dom.form.elements.account_name.value = "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°";
  dom.form.elements.status.value = "РџР»Р°С‚РµР¶";
  dom.form.elements.amount.value = "0";
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("calendar"));
  updateCalendarPreview();
}

function renderBalanceScopeNote() {
  const dom = getBalanceDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Р‘Р°Р»Р°РЅСЃ РєРѕРјРїР°РЅРёРё РІРёРґРёС‚ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»РµС† Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂС‹ РїР»Р°С‚С„РѕСЂРјС‹.";
    return;
  }

  if (!STATE.financeReady) {
    dom.scopeNote.textContent = "Р”Р»СЏ СЂР°Р·РґРµР»Р° Р‘Р°Р»Р°РЅСЃ РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡ platform_light2_finance_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Р—Р°РїРёСЃРё Р·РґРµСЃСЊ С„РёРєСЃРёСЂСѓСЋС‚ С„Р°РєС‚РёС‡РµСЃРєРѕРµ РґРІРёР¶РµРЅРёРµ РґРµРЅРµРі Рё С„РѕСЂРјРёСЂСѓСЋС‚ С‚РµРєСѓС‰РёР№ Р±Р°Р»Р°РЅСЃ РїРѕ РєР°Р¶РґРѕРјСѓ РєРѕРЅС‚СѓСЂСѓ.";
}

function renderCalendarScopeNote() {
  const dom = getCalendarDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ РєРѕРјРїР°РЅРёРё РІРёРґРёС‚ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»РµС† Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂС‹ РїР»Р°С‚С„РѕСЂРјС‹.";
    return;
  }

  if (!STATE.financeReady) {
    dom.scopeNote.textContent = "Р”Р»СЏ СЂР°Р·РґРµР»Р° РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡ platform_light2_finance_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "РљР°Р»РµРЅРґР°СЂСЊ РїРѕРєР°Р·С‹РІР°РµС‚ РїР»Р°РЅ РїР»Р°С‚РµР¶РµР№ Рё РїРѕСЃС‚СѓРїР»РµРЅРёР№ РѕС‚РґРµР»СЊРЅРѕ РѕС‚ С„Р°РєС‚РёС‡РµСЃРєРѕРіРѕ Р±Р°Р»Р°РЅСЃР°, С‡С‚РѕР±С‹ Р±С‹Р»Рѕ РІРёРґРЅРѕ РЅР°РіСЂСѓР·РєСѓ РїРѕ РґР°С‚Р°Рј.";
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
  if (!assetId) return "Р‘РµР· РїСЂРёРІСЏР·РєРё";
  return STATE.assets.find((item) => item.id === assetId)?.asset_name || "Р‘РµР· РїСЂРёРІСЏР·РєРё";
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
  const options = ['<option value="">Р‘РµР· РїСЂРёРІСЏР·РєРё Рє Р°РєС‚РёРІСѓ</option>']
    .concat(
      STATE.assets
        .slice()
        .sort((a, b) => String(a.asset_name || "").localeCompare(String(b.asset_name || ""), "ru"))
        .map((asset) => `<option value="${escapeHtml(asset.id)}">${escapeHtml(asset.asset_name)}</option>`)
    )
    .join("");

  dom.paymentAssetSelect.innerHTML = options;
  dom.paymentFilter.innerHTML = ['<option value="">Р’СЃРµ Р°РєС‚РёРІС‹</option>', '<option value="__unassigned__">Р‘РµР· РїСЂРёРІСЏР·РєРё</option>']
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

  dom.supplierFilter.innerHTML = ['<option value="">Р’СЃРµ РїРѕСЃС‚Р°РІС‰РёРєРё</option>']
    .concat(suppliers.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`))
    .join("");
  dom.categoryFilter.innerHTML = ['<option value="">Р’СЃРµ РєР°С‚РµРіРѕСЂРёРё</option>']
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
  dom.assetSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ Р°РєС‚РёРІ";
  dom.assetForm.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
}

function resetAssetPaymentForm() {
  const dom = getAssetsDom();
  if (!dom.paymentForm) return;

  STATE.editingAssetPaymentId = null;
  dom.paymentForm.reset();
  dom.paymentForm.elements.payment_date.value = getTodayIso();
  dom.paymentForm.elements.payment_amount.value = "0";
  dom.paymentSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РІС‹РїР»Р°С‚Сѓ";
  dom.paymentForm.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("assets"));
}

function resetPurchaseForm() {
  const dom = getPurchasesDom();
  if (!dom.form) return;

  STATE.editingPurchaseId = null;
  dom.form.reset();
  dom.form.elements.price.value = "0";
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ";
  dom.form.classList.toggle("is-hidden", !isAdmin() || isSectionFormHidden("purchases"));
}

function renderAssetsScopeNote() {
  const dom = getAssetsDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Р Р°Р·РґРµР» РђРєС‚РёРІС‹ РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј РїР»Р°С‚С„РѕСЂРјС‹.";
    return;
  }

  if (!STATE.operationsReady) {
    dom.scopeNote.textContent = "Р”Р»СЏ СЂР°Р·РґРµР»Р° РђРєС‚РёРІС‹ РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡ platform_light2_assets_purchases_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "РђРєС‚РёРІС‹ РїРµСЂРµРЅРµСЃРµРЅС‹ РІ РєР°СЂС‚РѕС‡РєРё Рё Р¶СѓСЂРЅР°Р» РІС‹РїР»Р°С‚: СЌС‚Рѕ СѓРґРѕР±РЅРµРµ, С‡РµРј С…СЂР°РЅРёС‚СЊ СЃСѓРјРјС‹ РІ РґР»РёРЅРЅРѕР№ Excel-РјР°С‚СЂРёС†Рµ.";
}

function renderPurchasesScopeNote() {
  const dom = getPurchasesDom();
  if (!dom.scopeNote) return;

  if (!isAdmin()) {
    dom.scopeNote.textContent = "Р Р°Р·РґРµР» Р—Р°РєСѓРїРєРё РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј РїР»Р°С‚С„РѕСЂРјС‹.";
    return;
  }

  if (!STATE.operationsReady) {
    dom.scopeNote.textContent = "Р”Р»СЏ СЂР°Р·РґРµР»Р° Р—Р°РєСѓРїРєРё РІС‹РїРѕР»РЅРёС‚Рµ SQL-РїР°С‚С‡ platform_light2_assets_purchases_patch.sql.";
    return;
  }

  dom.scopeNote.textContent = "Р—Р°РєСѓРїРєРё РїРµСЂРµРЅРµСЃРµРЅС‹ РІ РЅРѕСЂРјР°Р»РёР·РѕРІР°РЅРЅС‹Р№ РєР°С‚Р°Р»РѕРі: РїРѕСЃС‚Р°РІС‰РёРє, РєР°С‚РµРіРѕСЂРёСЏ, Р°СЂС‚РёРєСѓР», РїРѕР·РёС†РёСЏ, РµРґРёРЅРёС†Р° Рё С†РµРЅР°.";
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
      <span>РђРєС‚РёРІРѕРІ РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${assetRows.length}</strong>
    </article>
    <article class="summary-card">
      <span>РЎС‚РѕРёРјРѕСЃС‚СЊ Р°РєС‚РёРІРѕРІ</span>
      <strong>${formatMoney(totalValue)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РЈР¶Рµ РІС‹РїР»Р°С‡РµРЅРѕ</span>
      <strong>${formatMoney(totalPaid)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РћСЃС‚Р°С‚РѕРє Рє Р·Р°РєСЂС‹С‚РёСЋ</span>
      <strong class="${remaining <= 0 ? "amount-positive" : "amount-negative"}">${formatMoney(remaining)} в‚Ѕ</strong>
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
      <span>РџРѕР·РёС†РёРё РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>РџРѕСЃС‚Р°РІС‰РёРєРѕРІ</span>
      <strong>${supplierCount}</strong>
    </article>
    <article class="summary-card">
      <span>РљР°С‚РµРіРѕСЂРёР№</span>
      <strong>${categoryCount}</strong>
    </article>
    <article class="summary-card">
      <span>РЎСЂРµРґРЅСЏСЏ С†РµРЅР° РїРѕ Р·Р°РїРѕР»РЅРµРЅРЅС‹Рј</span>
      <strong>${formatMoney(averagePrice)} в‚Ѕ</strong>
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
    dom.assetTableBody.innerHTML = `<tr><td colspan="7" class="muted">Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.</td></tr>`;
    dom.paymentTableBody.innerHTML = `<tr><td colspan="6" class="muted">Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.</td></tr>`;
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    dom.assetTableBody.innerHTML = `<tr><td colspan="7" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor.</td></tr>`;
    dom.paymentTableBody.innerHTML = `<tr><td colspan="6" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor.</td></tr>`;
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
              <td>${escapeHtml(asset.asset_name || "вЂ”")}</td>
              <td class="text-end">${escapeHtml(formatMoney(asset.asset_value))}</td>
              <td class="text-end">${escapeHtml(formatMoney(paid))}</td>
              <td class="text-end ${remaining <= 0 ? "amount-positive" : "amount-negative"}">${escapeHtml(formatMoney(remaining))}</td>
              <td>${escapeHtml(asset.note || "вЂ”")}</td>
              <td class="small">${escapeHtml(formatDateTime(asset.updated_at || asset.created_at))}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset="${escapeHtml(asset.id)}">РР·РјРµРЅРёС‚СЊ</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset="${escapeHtml(asset.id)}">РЈРґР°Р»РёС‚СЊ</button>
                </div>
              </td>
            </tr>
          `;
        })
        .join("")
    : `<tr><td colspan="7" class="muted">РџРѕРєР° РЅРµС‚ Р°РєС‚РёРІРѕРІ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;

  dom.paymentTableBody.innerHTML = paymentRows.length
    ? paymentRows
        .map(
          (payment) => `
            <tr>
              <td>${escapeHtml(formatDate(payment.payment_date))}</td>
              <td>${escapeHtml(getAssetLabel(payment.asset_id))}</td>
              <td class="text-end">${escapeHtml(formatMoney(payment.payment_amount))}</td>
              <td>${escapeHtml(payment.note || "вЂ”")}</td>
              <td class="small">${escapeHtml(formatDateTime(payment.updated_at || payment.created_at))}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset-payment="${escapeHtml(payment.id)}">РР·РјРµРЅРёС‚СЊ</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset-payment="${escapeHtml(payment.id)}">РЈРґР°Р»РёС‚СЊ</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="6" class="muted">РџРѕРєР° РЅРµС‚ РІС‹РїР»Р°С‚ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;
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
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.</td></tr>`;
    return;
  }

  if (!STATE.operationsReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor.</td></tr>`;
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
              <td>${escapeHtml(item.supplier_name || "вЂ”")}</td>
              <td>${escapeHtml(item.city || "вЂ”")}</td>
              <td>${escapeHtml(item.category || "вЂ”")}</td>
              <td>${escapeHtml(item.article || "вЂ”")}</td>
              <td>${escapeHtml(item.item_name || "вЂ”")}</td>
              <td>${escapeHtml(item.unit_name || "вЂ”")}</td>
              <td class="text-end">${escapeHtml(formatMoney(item.price))}</td>
              <td>${item.supplier_url ? `<a href="${escapeHtml(item.supplier_url)}" target="_blank" rel="noreferrer">РћС‚РєСЂС‹С‚СЊ</a>` : "вЂ”"}</td>
              <td>${escapeHtml(item.note || "вЂ”")}</td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-outline-dark btn-sm" type="button" data-edit-purchase="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>
                  <button class="btn btn-outline-danger btn-sm" type="button" data-delete-purchase="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>
                </div>
              </td>
            </tr>
          `
        )
        .join("")
    : `<tr><td colspan="10" class="muted">РџРѕРєР° РЅРµС‚ РїРѕР·РёС†РёР№ Р·Р°РєСѓРїРєРё РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;
}

function fillAssetForm(item) {
  const dom = getAssetsDom();
  if (!dom.assetForm) return;

  ensureSectionFormVisible("assets");
  STATE.editingAssetId = item.id;
  dom.assetForm.elements.asset_name.value = item.asset_name || "";
  dom.assetForm.elements.asset_value.value = toNumber(item.asset_value);
  dom.assetForm.elements.note.value = item.note || "";
  dom.assetSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
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
  dom.paymentSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
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
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
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
  const pending = rows.filter((item) => item.status !== "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚ РїСЂРѕРёР·РІРµРґРµРЅ" && item.status !== "РђСЂС…РёРІ");
  const total = rows.reduce((sum, item) => sum + computeSettlement(item).total, 0);
  const payout = pending.reduce((sum, item) => {
    const math = computeSettlement(item);
    return math.total > 0 ? sum + math.total : sum;
  }, 0);

  DOM.settlementSummary.innerHTML = `
    <article class="summary-card">
      <span>РЎС‚СЂРѕРє РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>РћС‚РєСЂС‹С‚С‹С… СЃС‚СЂРѕРє</span>
      <strong>${pending.length}</strong>
    </article>
    <article class="summary-card">
      <span>Р§РёСЃС‚С‹Р№ РёС‚РѕРі</span>
      <strong>${formatMoney(total)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>Рљ РІС‹РїР»Р°С‚Рµ РїР°СЂС‚РЅРµСЂР°Рј</span>
      <strong>${formatMoney(payout)} в‚Ѕ</strong>
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
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} в‚Ѕ</strong>
      </article>
    `
  ).join("");

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Р—Р°РїРёСЃРµР№ РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>РџСЂРёС…РѕРґ РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${formatMoney(income)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>Р Р°СЃС…РѕРґ РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${formatMoney(expense)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>Р‘Р°Р»Р°РЅСЃ РєРѕРјРїР°РЅРёРё СЃРµР№С‡Р°СЃ</span>
      <strong>${formatMoney(totals.total)} в‚Ѕ</strong>
    </article>
    ${accountCards}
  `;
}

function renderCalendarSummary(rows) {
  const dom = getCalendarDom();
  if (!dom.summary) return;

  const totals = getCurrentBalanceTotals();
  const incoming = rows
    .filter((entry) => entry.operation_type === "РџСЂРёС…РѕРґ")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const outgoing = rows
    .filter((entry) => entry.operation_type === "Р Р°СЃС…РѕРґ")
    .reduce((sum, entry) => sum + toNumber(entry.amount), 0);
  const net = roundMoney(incoming - outgoing);
  const accountCards = BALANCE_ACCOUNTS.map(
    (account) => `
      <article class="summary-card">
        <span>${escapeHtml(account.label)}</span>
        <strong>${formatMoney(totals.byAccount[account.value] || 0)} в‚Ѕ</strong>
      </article>
    `
  ).join("");

  dom.summary.innerHTML = `
    <article class="summary-card">
      <span>Р—Р°РїРёСЃРµР№ РІ РІС‹Р±РѕСЂРєРµ</span>
      <strong>${rows.length}</strong>
    </article>
    <article class="summary-card">
      <span>РџСЂРёС…РѕРґС‹ РїРѕ РїР»Р°РЅСѓ</span>
      <strong>${formatMoney(incoming)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>Р Р°СЃС…РѕРґС‹ РїРѕ РїР»Р°РЅСѓ</span>
      <strong>${formatMoney(outgoing)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>РЎР°Р»СЊРґРѕ РІС‹Р±РѕСЂРєРё</span>
      <strong class="${net >= 0 ? "amount-positive" : "amount-negative"}">${net >= 0 ? "+" : ""}${formatMoney(net)} в‚Ѕ</strong>
    </article>
    <article class="summary-card">
      <span>Р‘Р°Р»Р°РЅСЃ РєРѕРјРїР°РЅРёРё СЃРµР№С‡Р°СЃ</span>
      <strong>${formatMoney(totals.total)} в‚Ѕ</strong>
    </article>
    ${accountCards}
  `;
}

function renderSettlementSection() {
  DOM.settlementActionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderScopeNote();
  renderLiveSectionBuilder("settlements");

  if (!STATE.schemaReady) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_patch.sql РІ Supabase SQL Editor.</td></tr>`;
    DOM.settlementSummary.innerHTML = "";
    return;
  }

  const rows = sortSectionRows("settlements", getVisibleSettlements());
  renderSettlementSummary(rows);
  DOM.settlementSummary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("settlements"));

  if (!rows.length) {
    DOM.settlementTableBody.innerHTML = `<tr><td colspan="10" class="muted">РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;
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
          <td>${escapeHtml(item.note || "вЂ”")}</td>
          <td class="small">${escapeHtml(formatDateTime(item.updated_at || item.created_at))}</td>
          <td>
            ${
              canEdit
                ? `
                  <div class="d-flex gap-2">
                    <button class="btn btn-outline-dark btn-sm" type="button" data-edit-settlement="${escapeHtml(item.id)}">РР·РјРµРЅРёС‚СЊ</button>
                    <button class="btn btn-outline-danger btn-sm" type="button" data-delete-settlement="${escapeHtml(item.id)}">РЈРґР°Р»РёС‚СЊ</button>
                  </div>
                `
                : `<span class="muted">вЂ”</span>`
            }
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderBalanceSection() {
  const dom = getBalanceDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderBalanceScopeNote();
  renderLiveSectionBuilder("balance");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.</td></tr>`;
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql РІ Supabase SQL Editor.</td></tr>`;
    return;
  }

  const rows = sortSectionRows("balance", getVisibleBalanceEntries());
  const runningMap = buildBalanceRunningMap();
  renderBalanceSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("balance"));

  if (!rows.length) {
    dom.tableBody.innerHTML = `<tr><td colspan="8" class="muted">РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;
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
          <td>${escapeHtml(entry.note || "вЂ”")}</td>
          <td class="small">${escapeHtml(formatDateTime(entry.updated_at || entry.created_at))}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-dark btn-sm" type="button" data-edit-balance="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>
              <button class="btn btn-outline-danger btn-sm" type="button" data-delete-balance="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderCalendarSection() {
  const dom = getCalendarDom();
  if (!dom.tableBody) return;

  dom.actionsHead.textContent = isAdmin() ? "Р”РµР№СЃС‚РІРёСЏ" : "";
  renderCalendarScopeNote();
  renderLiveSectionBuilder("calendar");

  if (!isAdmin()) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">Р Р°Р·РґРµР» РґРѕСЃС‚СѓРїРµРЅ С‚РѕР»СЊРєРѕ РІР»Р°РґРµР»СЊС†Сѓ Рё Р°РґРјРёРЅРёСЃС‚СЂР°С‚РѕСЂР°Рј.</td></tr>`;
    return;
  }

  if (!STATE.financeReady) {
    dom.summary.innerHTML = "";
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">РЎРЅР°С‡Р°Р»Р° РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql РІ Supabase SQL Editor.</td></tr>`;
    return;
  }

  const rows = sortSectionRows("calendar", getVisibleCalendarEntries());
  renderCalendarSummary(rows);
  dom.summary?.insertAdjacentHTML("beforeend", getSectionFormulaCards("calendar"));

  if (!rows.length) {
    dom.tableBody.innerHTML = `<tr><td colspan="10" class="muted">РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№ РґР»СЏ С‚РµРєСѓС‰РµРіРѕ С„РёР»СЊС‚СЂР°.</td></tr>`;
    return;
  }

  dom.tableBody.innerHTML = rows
    .map((entry) => {
      const signed = signedCalendarAmount(entry);
      return `
        <tr>
          <td>${escapeHtml(formatDate(entry.payment_date))}</td>
          <td>${escapeHtml(entry.counterparty || "вЂ”")}</td>
          <td class="text-end ${signed >= 0 ? "amount-positive" : "amount-negative"}">${signed >= 0 ? "+" : ""}${escapeHtml(formatMoney(entry.amount))}</td>
          <td><span class="badge-soft ${getOperationTone(entry.operation_type)}">${escapeHtml(entry.operation_type || "вЂ”")}</span></td>
          <td>${escapeHtml(entry.category || "вЂ”")}</td>
          <td>${escapeHtml(entry.account_name || "вЂ”")}</td>
          <td><span class="badge-soft ${getCalendarStatusTone(entry.status)}">${escapeHtml(entry.status || "вЂ”")}</span></td>
          <td>${escapeHtml(entry.note || "вЂ”")}</td>
          <td class="small">${escapeHtml(formatDateTime(entry.updated_at || entry.created_at))}</td>
          <td>
            <div class="d-flex gap-2">
              <button class="btn btn-outline-dark btn-sm" type="button" data-edit-calendar="${escapeHtml(entry.id)}">РР·РјРµРЅРёС‚СЊ</button>
              <button class="btn btn-outline-danger btn-sm" type="button" data-delete-calendar="${escapeHtml(entry.id)}">РЈРґР°Р»РёС‚СЊ</button>
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
  DOM.settlementForm.elements.status.value = item.status || "РћР¶РёРґР°РµС‚ СЃРІРµСЂРєРё";
  DOM.settlementForm.elements.note.value = item.note || "";
  DOM.settlementSubmitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
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
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
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
  dom.form.elements.operation_type.value = item.operation_type || "Р Р°СЃС…РѕРґ";
  dom.form.elements.category.value = item.category || "";
  dom.form.elements.account_name.value = item.account_name || "РќР°Р»РёС‡РЅС‹Рµ / РєР°СЂС‚Р°";
  dom.form.elements.status.value = item.status || "РџР»Р°С‚РµР¶";
  dom.form.elements.note.value = item.note || "";
  dom.submitButton.textContent = "РЎРѕС…СЂР°РЅРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ";
  updateCalendarPreview();
}

function syncModuleStatus() {
  if (!STATE.schemaReady && !STATE.financeReady && !STATE.operationsReady) {
    setModuleState("РќСѓР¶РЅС‹ SQL-РїР°С‚С‡Рё");
    setStatus(
      "Р”РћРњ РќР•РћРќРђ Р·Р°РіСЂСѓР¶РµРЅ С‡Р°СЃС‚РёС‡РЅРѕ. Р’С‹РїРѕР»РЅРёС‚Рµ platform_light2_patch.sql, platform_light2_finance_patch.sql Рё platform_light2_assets_purchases_patch.sql РІ Supabase SQL Editor.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.schemaReady) {
    setModuleState("Р§Р°СЃС‚РёС‡РЅРѕ РіРѕС‚РѕРІРѕ");
    setStatus(
      `РћСЃС‚Р°Р»СЊРЅС‹Рµ Р±Р»РѕРєРё СЂР°Р±РѕС‚Р°СЋС‚, РЅРѕ РґР»СЏ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚РѕРІ РЅСѓР¶РµРЅ platform_light2_patch.sql${STATE.operationsReady ? "" : " Рё РґР»СЏ РђРєС‚РёРІРѕРІ/Р—Р°РєСѓРїРѕРє РЅСѓР¶РµРЅ platform_light2_assets_purchases_patch.sql"}.`,
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.financeReady && !STATE.operationsReady) {
    setModuleState("Р§Р°СЃС‚РёС‡РЅРѕ РіРѕС‚РѕРІРѕ");
    setStatus(
      "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ СѓР¶Рµ СЂР°Р±РѕС‚Р°СЋС‚. Р”Р»СЏ С„РёРЅР°РЅСЃРѕРІС‹С… Р±Р»РѕРєРѕРІ РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql, Р° РґР»СЏ РђРєС‚РёРІРѕРІ Рё Р—Р°РєСѓРїРѕРє вЂ” platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.financeReady) {
    setModuleState("Р§Р°СЃС‚РёС‡РЅРѕ РіРѕС‚РѕРІРѕ");
    setStatus(
      "Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ СѓР¶Рµ СЂР°Р±РѕС‚Р°СЋС‚. Р”Р»СЏ СЂР°Р·РґРµР»РѕРІ Р‘Р°Р»Р°РЅСЃ Рё РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_finance_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  if (!STATE.operationsReady) {
    setModuleState("Р§Р°СЃС‚РёС‡РЅРѕ РіРѕС‚РѕРІРѕ");
    setStatus(
      "Р¤РёРЅР°РЅСЃРѕРІС‹Рµ Р±Р»РѕРєРё СѓР¶Рµ СЂР°Р±РѕС‚Р°СЋС‚. Р”Р»СЏ СЂР°Р·РґРµР»РѕРІ РђРєС‚РёРІС‹ Рё Р—Р°РєСѓРїРєРё РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_assets_purchases_patch.sql.",
      "warning"
    );
    syncImportButton();
    return;
  }

  setModuleState("Р“РѕС‚РѕРІРѕ");
  setStatus("Р”РћРњ РќР•РћРќРђ Р·Р°РіСЂСѓР¶РµРЅ. Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹, Р‘Р°Р»Р°РЅСЃ, РџР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ, РђРєС‚РёРІС‹ Рё Р—Р°РєСѓРїРєРё СЂР°Р±РѕС‚Р°СЋС‚ РІРЅСѓС‚СЂРё РїР»Р°С‚С„РѕСЂРјС‹.", "success");
  syncImportButton();
}

async function loadBootstrapData() {
  refreshInteractiveDomRefs();
  const runBootstrapUiStep = (label, fn) => {
    try {
      fn();
    } catch (error) {
      console.warn(`light2 bootstrap ui step failed: ${label}`, error);
    }
  };
  const { data: sessionData, error: sessionError } = await withTimeout(
    supabase.auth.getSession(),
    6000,
    "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ РїСЂРѕРІРµСЂРёС‚СЊ СЃРµСЃСЃРёСЋ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ."
  );
  if (sessionError) throw sessionError;

  if (!sessionData.session) {
    STATE.session = null;
    STATE.user = null;
    STATE.profile = null;
    setModuleState("РќСѓР¶РµРЅ РІС…РѕРґ");
    setStatus("РћС‚РєСЂРѕР№С‚Рµ РјРѕРґСѓР»СЊ С‡РµСЂРµР· РїР»Р°С‚С„РѕСЂРјСѓ РїРѕСЃР»Рµ РІС…РѕРґР° РІ Р°РєРєР°СѓРЅС‚.", "warning");
    DOM.userDisplay.textContent = "РќРµС‚ СЃРµСЃСЃРёРё";
    DOM.accessMode.textContent = "вЂ”";
    syncImportButton();
    return false;
  }

  STATE.session = sessionData.session;
  STATE.user = sessionData.session.user;

  const fallbackProfile = {
    id: STATE.user.id,
    display_name: STATE.user.user_metadata?.display_name || STATE.user.email || "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ",
    full_name: STATE.user.user_metadata?.display_name || "",
    role: "user",
    partner_slug: null
  };

  let profileResult = null;
  try {
    profileResult = await withTimeout(
      supabase.from("app_profiles").select("*").eq("id", STATE.user.id).maybeSingle(),
      6000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ РїСЂРѕС„РёР»СЊ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ."
    );
  } catch (error) {
    console.warn("light2 profile load fallback", error);
  }

  if (profileResult?.error && profileResult.error.code !== "PGRST116") throw profileResult.error;

  STATE.profile = profileResult?.data || fallbackProfile;
  STATE.partnerProfiles = [];
  runBootstrapUiStep("hero", () => updateHero());
  runBootstrapUiStep("section-tabs", () => syncSectionTabs());
  runBootstrapUiStep("overview", () => renderOverview());
  syncImportButton();

  runBootstrapUiStep("partner-filter", () => renderPartnerSelect(DOM.settlementPartnerFilter, { includeAll: true }));
  runBootstrapUiStep("partner-form-select", () => renderPartnerSelect(DOM.settlementForm?.elements?.partner_slug));
  runBootstrapUiStep("reset-settlement-form", () => resetSettlementForm());
  runBootstrapUiStep("reset-balance-form", () => resetBalanceForm());
  runBootstrapUiStep("reset-calendar-form", () => resetCalendarForm());
  runBootstrapUiStep("reset-asset-form", () => resetAssetForm());
  runBootstrapUiStep("reset-asset-payment-form", () => resetAssetPaymentForm());
  runBootstrapUiStep("reset-purchase-form", () => resetPurchaseForm());

  void (async () => {
    try {
      const partnersResult = await withTimeout(
        supabase.from("partner_profiles").select("*").order("display_name", { ascending: true }),
        6000,
        "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ СЃРїСЂР°РІРѕС‡РЅРёРє РїР°СЂС‚РЅРµСЂРѕРІ."
      );
      if (partnersResult?.error) throw partnersResult.error;
      STATE.partnerProfiles = partnersResult?.data || [];
      runBootstrapUiStep("hero-partners", () => updateHero());
      runBootstrapUiStep("overview-partners", () => renderOverview());
      runBootstrapUiStep("partner-filter-refresh", () => renderPartnerSelect(DOM.settlementPartnerFilter, { includeAll: true }));
      runBootstrapUiStep("partner-form-refresh", () => renderPartnerSelect(DOM.settlementForm?.elements?.partner_slug));
    } catch (error) {
      console.warn("light2 partner directory fallback", error);
    }
  })();

  return true;
}

async function loadContourBlocks() {
  const loaders = [
    ["Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹", loadSettlements],
    ["Р¤РёРЅР°РЅСЃС‹", loadFinanceData],
    ["РђРєС‚РёРІС‹ Рё Р·Р°РєСѓРїРєРё", loadOperationsData]
  ];

  const results = await Promise.allSettled(
    loaders.map(async ([label, loader]) => {
      try {
        await withTimeout(
          loader(),
          9000,
          `Р‘Р»РѕРє "${label}" РЅРµ СѓСЃРїРµР» Р·Р°РіСЂСѓР·РёС‚СЊСЃСЏ РІРѕРІСЂРµРјСЏ.`
        );
      } catch (error) {
        console.error(`light2 loader failed: ${label}`, error);
        setStatus(error.message || `РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ Р±Р»РѕРє "${label}".`, "error");
      }
    })
  );

  return results;
}

async function loadSettlements() {
  const { data, error } = await withTimeout(
    supabase.from("light2_partner_settlements").select("*").order("updated_at", { ascending: false }),
    7000,
    "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ Р”РћРњ РќР•РћРќРђ."
  );

  if (error) {
    if (isSchemaMissing(error)) {
      STATE.schemaReady = false;
      STATE.schemaError = error.message || "РўР°Р±Р»РёС†Р° light2_partner_settlements РЅРµ РЅР°Р№РґРµРЅР°.";
      setModuleState("РќСѓР¶РµРЅ SQL-РїР°С‚С‡");
      setStatus("Р§С‚РѕР±С‹ РІРєР»СЋС‡РёС‚СЊ СЂР°Р±РѕС‡РёР№ Р±Р»РѕРє РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚РѕРІ, РІС‹РїРѕР»РЅРёС‚Рµ platform_light2_patch.sql РІ Supabase SQL Editor.", "warning");
      renderSettlementSection();
      renderOverview();
      return;
    }
    throw error;
  }

  STATE.schemaReady = true;
  STATE.schemaError = "";
  STATE.settlements = data || [];
  setModuleState("Р“РѕС‚РѕРІРѕ");
  setStatus("Р”РћРњ РќР•РћРќРђ Р·Р°РіСЂСѓР¶РµРЅ. Р’Р·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹ СѓР¶Рµ СЂР°Р±РѕС‚Р°СЋС‚ РІРЅСѓС‚СЂРё РїР»Р°С‚С„РѕСЂРјС‹.", "success");
  renderSettlementSection();
  renderOverview();
}

async function loadFinanceData() {
  const [balanceResult, calendarResult] = await Promise.all([
    withTimeout(
      supabase
        .from("light2_balance_entries")
        .select("*")
        .order("entry_date", { ascending: false })
        .order("updated_at", { ascending: false }),
      7000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ Р±Р°Р»Р°РЅСЃ Р”РћРњ РќР•РћРќРђ."
    ),
    withTimeout(
      supabase
        .from("light2_payment_calendar_entries")
        .select("*")
        .order("payment_date", { ascending: true })
        .order("updated_at", { ascending: false }),
      7000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ РїР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ Р”РћРњ РќР•РћРќРђ."
    )
  ]);

  if (balanceResult.error || calendarResult.error) {
    const error = balanceResult.error || calendarResult.error;
    if (isFinanceSchemaMissing(error)) {
      STATE.financeReady = false;
      STATE.financeError = error.message || "РўР°Р±Р»РёС†С‹ С„РёРЅР°РЅСЃРѕРІС‹С… Р±Р»РѕРєРѕРІ РЅРµ РЅР°Р№РґРµРЅС‹.";
      STATE.balanceEntries = [];
      STATE.calendarEntries = [];
      renderBalanceSection();
      renderCalendarSection();
      renderOverview();
      return;
    }
    throw error;
  }

  STATE.financeReady = true;
  STATE.financeError = "";
  STATE.balanceEntries = balanceResult.data || [];
  STATE.calendarEntries = calendarResult.data || [];
  renderBalanceSection();
  renderCalendarSection();
  renderOverview();
}

async function loadOperationsData() {
  const [assetsResult, paymentsResult, purchasesResult] = await Promise.all([
    withTimeout(
      supabase.from("light2_assets").select("*").order("asset_name", { ascending: true }),
      7000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ Р°РєС‚РёРІС‹ Р”РћРњ РќР•РћРќРђ."
    ),
    withTimeout(
      supabase
        .from("light2_asset_payments")
        .select("*")
        .order("payment_date", { ascending: false })
        .order("updated_at", { ascending: false }),
      7000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ РІС‹РїР»Р°С‚С‹ РїРѕ Р°РєС‚РёРІР°Рј Р”РћРњ РќР•РћРќРђ."
    ),
    withTimeout(
      supabase
        .from("light2_purchase_catalog")
        .select("*")
        .order("supplier_name", { ascending: true })
        .order("item_name", { ascending: true }),
      7000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ Р·Р°РєСѓРїРєРё Р”РћРњ РќР•РћРќРђ."
    )
  ]);

  if (assetsResult.error || paymentsResult.error || purchasesResult.error) {
    const error = assetsResult.error || paymentsResult.error || purchasesResult.error;
    if (isOperationsSchemaMissing(error)) {
      STATE.operationsReady = false;
      STATE.operationsError = error.message || "РўР°Р±Р»РёС†С‹ Р±Р»РѕРєРѕРІ РђРєС‚РёРІС‹/Р—Р°РєСѓРїРєРё РЅРµ РЅР°Р№РґРµРЅС‹.";
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
    status: String(formData.get("status") || "РћР¶РёРґР°РµС‚ СЃРІРµСЂРєРё"),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.partner_slug || !payload.period_label) {
    throw new Error("РЈРєР°Р¶РёС‚Рµ РїРµСЂРёРѕРґ Рё РїР°СЂС‚РЅРµСЂР°.");
  }

  if (STATE.editingSettlementId) {
    const { error } = await supabase
      .from("light2_partner_settlements")
      .update(payload)
      .eq("id", STATE.editingSettlementId);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р° РѕР±РЅРѕРІР»РµРЅР°.", "success");
  } else {
    const { error } = await supabase.from("light2_partner_settlements").insert(payload);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р° РґРѕР±Р°РІР»РµРЅР°.", "success");
  }

  resetSettlementForm();
  await loadSettlements();
  syncModuleStatus();
}

async function deleteSettlement(id) {
  const { error } = await supabase.from("light2_partner_settlements").delete().eq("id", id);
  if (error) throw error;
  setStatus("Р—Р°РїРёСЃСЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р° СѓРґР°Р»РµРЅР°.", "success");
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

  if (!payload.entry_date) throw new Error("РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ Р·Р°РїРёСЃРё.");
  if (!BALANCE_ACCOUNTS.some((item) => item.value === payload.account_type)) throw new Error("Р’С‹Р±РµСЂРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‡С‘С‚.");
  if (payload.income_amount <= 0 && payload.expense_amount <= 0) {
    throw new Error("РЈРєР°Р¶РёС‚Рµ РїСЂРёС…РѕРґ РёР»Рё СЂР°СЃС…РѕРґ Р±РѕР»СЊС€Рµ РЅСѓР»СЏ.");
  }

  if (STATE.editingBalanceId) {
    const { error } = await supabase.from("light2_balance_entries").update(payload).eq("id", STATE.editingBalanceId);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР° РѕР±РЅРѕРІР»РµРЅР°.", "success");
  } else {
    const { error } = await supabase.from("light2_balance_entries").insert(payload);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР° РґРѕР±Р°РІР»РµРЅР°.", "success");
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
    operation_type: String(formData.get("operation_type") || "Р Р°СЃС…РѕРґ"),
    category: String(formData.get("category") || "").trim() || null,
    account_name: String(formData.get("account_name") || "РќРµ СЂР°СЃРїСЂРµРґРµР»РµРЅРѕ"),
    status: String(formData.get("status") || "РџР»Р°С‚РµР¶"),
    note: String(formData.get("note") || "").trim() || null,
    created_by: STATE.user?.id || null
  };

  if (!payload.payment_date || !payload.counterparty) throw new Error("РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РїР»Р°С‚РµР¶Р° Рё РєРѕРЅС‚СЂР°РіРµРЅС‚Р°.");
  if (payload.amount <= 0) throw new Error("РЎСѓРјРјР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РЅСѓР»СЏ.");
  if (!["РџСЂРёС…РѕРґ", "Р Р°СЃС…РѕРґ"].includes(payload.operation_type)) throw new Error("Р’С‹Р±РµСЂРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ С‚РёРї РѕРїРµСЂР°С†РёРё.");
  if (!CALENDAR_ACCOUNTS.some((item) => item.value === payload.account_name)) throw new Error("Р’С‹Р±РµСЂРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‡С‘С‚.");
  if (!CALENDAR_STATUSES.includes(payload.status)) throw new Error("Р’С‹Р±РµСЂРёС‚Рµ РєРѕСЂСЂРµРєС‚РЅС‹Р№ СЃС‚Р°С‚СѓСЃ.");

  if (STATE.editingCalendarId) {
    const { error } = await supabase
      .from("light2_payment_calendar_entries")
      .update(payload)
      .eq("id", STATE.editingCalendarId);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ РѕР±РЅРѕРІР»РµРЅР°.", "success");
  } else {
    const { error } = await supabase.from("light2_payment_calendar_entries").insert(payload);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ РґРѕР±Р°РІР»РµРЅР°.", "success");
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

  if (!payload.asset_name) throw new Error("РЈРєР°Р¶РёС‚Рµ РЅР°Р·РІР°РЅРёРµ Р°РєС‚РёРІР°.");
  if (payload.asset_value < 0) throw new Error("РЎС‚РѕРёРјРѕСЃС‚СЊ Р°РєС‚РёРІР° РЅРµ РјРѕР¶РµС‚ Р±С‹С‚СЊ РѕС‚СЂРёС†Р°С‚РµР»СЊРЅРѕР№.");

  if (STATE.editingAssetId) {
    const { error } = await supabase.from("light2_assets").update(payload).eq("id", STATE.editingAssetId);
    if (error) throw error;
    setStatus("РђРєС‚РёРІ РѕР±РЅРѕРІР»РµРЅ.", "success");
  } else {
    const { error } = await supabase.from("light2_assets").insert(payload);
    if (error) throw error;
    setStatus("РђРєС‚РёРІ РґРѕР±Р°РІР»РµРЅ.", "success");
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

  if (!payload.payment_date) throw new Error("РЈРєР°Р¶РёС‚Рµ РґР°С‚Сѓ РІС‹РїР»Р°С‚С‹.");
  if (payload.payment_amount <= 0) throw new Error("РЎСѓРјРјР° РІС‹РїР»Р°С‚С‹ РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ РЅСѓР»СЏ.");

  if (STATE.editingAssetPaymentId) {
    const { error } = await supabase.from("light2_asset_payments").update(payload).eq("id", STATE.editingAssetPaymentId);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РіСЂР°С„РёРєР° РІС‹РїР»Р°С‚ РѕР±РЅРѕРІР»РµРЅР°.", "success");
  } else {
    const { error } = await supabase.from("light2_asset_payments").insert(payload);
    if (error) throw error;
    setStatus("Р—Р°РїРёСЃСЊ РіСЂР°С„РёРєР° РІС‹РїР»Р°С‚ РґРѕР±Р°РІР»РµРЅР°.", "success");
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

  if (!payload.supplier_name) throw new Error("РЈРєР°Р¶РёС‚Рµ РїРѕСЃС‚Р°РІС‰РёРєР°.");

  if (STATE.editingPurchaseId) {
    const { error } = await supabase.from("light2_purchase_catalog").update(payload).eq("id", STATE.editingPurchaseId);
    if (error) throw error;
    setStatus("РџРѕР·РёС†РёСЏ Р·Р°РєСѓРїРєРё РѕР±РЅРѕРІР»РµРЅР°.", "success");
  } else {
    const { error } = await supabase.from("light2_purchase_catalog").insert(payload);
    if (error) throw error;
    setStatus("РџРѕР·РёС†РёСЏ Р·Р°РєСѓРїРєРё РґРѕР±Р°РІР»РµРЅР°.", "success");
  }

  resetPurchaseForm();
  await loadOperationsData();
  syncModuleStatus();
}

async function deleteBalanceEntry(id) {
  const { error } = await supabase.from("light2_balance_entries").delete().eq("id", id);
  if (error) throw error;
  setStatus("Р—Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР° СѓРґР°Р»РµРЅР°.", "success");
  await loadFinanceData();
  syncModuleStatus();
}

async function deleteCalendarEntry(id) {
  const { error } = await supabase.from("light2_payment_calendar_entries").delete().eq("id", id);
  if (error) throw error;
  setStatus("Р—Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ СѓРґР°Р»РµРЅР°.", "success");
  await loadFinanceData();
  syncModuleStatus();
}

async function deleteAsset(id) {
  const { error } = await supabase.from("light2_assets").delete().eq("id", id);
  if (error) throw error;
  setStatus("РђРєС‚РёРІ СѓРґР°Р»РµРЅ.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

async function deleteAssetPayment(id) {
  const { error } = await supabase.from("light2_asset_payments").delete().eq("id", id);
  if (error) throw error;
  setStatus("Р’С‹РїР»Р°С‚Р° РїРѕ Р°РєС‚РёРІСѓ СѓРґР°Р»РµРЅР°.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

async function deletePurchase(id) {
  const { error } = await supabase.from("light2_purchase_catalog").delete().eq("id", id);
  if (error) throw error;
  setStatus("РџРѕР·РёС†РёСЏ Р·Р°РєСѓРїРєРё СѓРґР°Р»РµРЅР°.", "success");
  await loadOperationsData();
  syncModuleStatus();
}

function bindEvents() {
  if (STATE.eventsBound) return;
  STATE.eventsBound = true;
  refreshInteractiveDomRefs();
  const settlementDom = getSettlementDom();
  const balanceDom = getBalanceDom();
  const calendarDom = getCalendarDom();
  const assetsDom = getAssetsDom();
  const purchasesDom = getPurchasesDom();

  bindDomEvent(DOM.sectionTabs, "click", (event) => {
    const button = event.target.closest("[data-section]");
    if (!button) return;
    openSection(button.dataset.section);
  });

  bindDomEvent(DOM.overviewGrid, "click", (event) => {
    const button = event.target.closest("[data-open-section]");
    if (!button) return;
    openSection(button.dataset.openSection);
  });

  bindDomEvent(DOM.toggleCompactTablesButton, "click", () => {
    STATE.ui.compactTables = !STATE.ui.compactTables;
    persistWorkspaceUi();
    syncWorkspaceModeUi();
  });

  bindDomEvent(DOM.toggleAllFormsButton, "click", () => {
    toggleAllForms();
  });

  bindDomEvent(document.body, "click", (event) => {
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

  bindDomEvent(DOM.importWorkbookButton, "click", async () => {
    try {
      await importWorkbookIntoTables();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ РёСЃС…РѕРґРЅС‹Р№ С„Р°Р№Р».", "error");
    }
  });

  bindDomEvent(document.body, "click", (event) => {
    const toggle = event.target.closest("[data-toggle-source-panel]");
    if (!toggle) return;
    const panel = toggle.closest("[data-source-panel]");
    if (!panel) return;
    panel.classList.toggle("collapsed");
    const label = toggle.querySelector("[data-toggle-source-label]");
    if (label) {
      label.textContent = panel.classList.contains("collapsed")
        ? "Показать исходную таблицу"
        : "Скрыть исходную таблицу";
    }
  });
  bindDomEvent(document.body, "input", (event) => {
    const input = event.target.closest("[data-snapshot-search]");
    if (!input) return;
    STATE.snapshotSearches[input.dataset.snapshotSearch] = input.value;
    renderWorkbookSnapshotSection(input.dataset.snapshotSearch);
  });

  bindDomEvent(settlementDom.form, "input", updateSettlementPreview);
  bindDomEvent(balanceDom.form, "input", updateBalancePreview);
  bindDomEvent(calendarDom.form, "input", updateCalendarPreview);

  bindDomEvent(settlementDom.form, "submit", async (event) => {
    event.preventDefault();
    try {
      await saveSettlement();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р°.", "error");
    }
  });

  bindDomEvent(balanceDom.form, "submit", async (event) => {
    event.preventDefault();
    try {
      await saveBalanceEntry();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР°.", "error");
    }
  });

  bindDomEvent(calendarDom.form, "submit", async (event) => {
    event.preventDefault();
    try {
      await saveCalendarEntry();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р·Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ.", "error");
    }
  });

  bindDomEvent(assetsDom.assetForm, "submit", async (event) => {
    event.preventDefault();
    try {
      await saveAsset();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ Р°РєС‚РёРІ.", "error");
    }
  });

  bindDomEvent(assetsDom.paymentForm, "submit", async (event) => {
    event.preventDefault();
    try {
      await saveAssetPayment();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РІС‹РїР»Р°С‚Сѓ РїРѕ Р°РєС‚РёРІСѓ.", "error");
    }
  });

  bindDomEvent(purchasesDom.form, "submit", async (event) => {
    event.preventDefault();
    try {
      await savePurchase();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РїРѕР·РёС†РёСЋ Р·Р°РєСѓРїРєРё.", "error");
    }
  });

  bindDomEvent(settlementDom.resetButton, "click", () => {
    resetSettlementForm();
    renderSettlementSection();
  });

  bindDomEvent(balanceDom.resetButton, "click", () => {
    resetBalanceForm();
    renderBalanceSection();
  });

  bindDomEvent(calendarDom.resetButton, "click", () => {
    resetCalendarForm();
    renderCalendarSection();
  });

  bindDomEvent(assetsDom.assetResetButton, "click", () => {
    resetAssetForm();
    renderAssets();
  });

  bindDomEvent(assetsDom.paymentResetButton, "click", () => {
    resetAssetPaymentForm();
    renderAssets();
  });

  bindDomEvent(purchasesDom.resetButton, "click", () => {
    resetPurchaseForm();
    renderPurchases();
  });

  bindDomEvents([settlementDom.partnerFilter, settlementDom.statusFilter, settlementDom.search], ["input", "change"], renderSettlementSection);
  bindDomEvents([balanceDom.accountFilter, balanceDom.monthFilter, balanceDom.search], ["input", "change"], renderBalanceSection);
  bindDomEvents(
    [calendarDom.monthFilter, calendarDom.operationFilter, calendarDom.accountFilter, calendarDom.statusFilter, calendarDom.search],
    ["input", "change"],
    renderCalendarSection
  );
  bindDomEvents([assetsDom.search, assetsDom.paymentFilter, assetsDom.paymentSearch], ["input", "change"], renderAssets);
  bindDomEvents([purchasesDom.supplierFilter, purchasesDom.categoryFilter, purchasesDom.search], ["input", "change"], renderPurchases);

  bindDomEvent(settlementDom.refreshButton, "click", async () => {
    try {
      await loadSettlements();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚С‹.", "error");
    }
  });

  bindDomEvent(balanceDom.refreshButton, "click", async () => {
    try {
      await loadFinanceData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ Р±Р°Р»Р°РЅСЃ.", "error");
    }
  });

  bindDomEvent(calendarDom.refreshButton, "click", async () => {
    try {
      await loadFinanceData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ РїР»Р°С‚РµР¶РЅС‹Р№ РєР°Р»РµРЅРґР°СЂСЊ.", "error");
    }
  });

  bindDomEvent(assetsDom.refreshButton, "click", async () => {
    try {
      await loadOperationsData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ СЂР°Р·РґРµР» РђРєС‚РёРІС‹.", "error");
    }
  });

  bindDomEvent(purchasesDom.refreshButton, "click", async () => {
    try {
      await loadOperationsData();
      syncModuleStatus();
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РѕР±РЅРѕРІРёС‚СЊ СЂР°Р·РґРµР» Р—Р°РєСѓРїРєРё.", "error");
    }
  });

  bindDomEvent(settlementDom.tableBody, "click", async (event) => {
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

    if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ РІР·Р°РёРјРѕСЂР°СЃС‡РµС‚Р°?")) return;
    try {
      await deleteSettlement(deleteButton.dataset.deleteSettlement);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ.", "error");
    }
  });

  bindDomEvent(balanceDom.tableBody, "click", async (event) => {
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
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР°?")) return;

    try {
      await deleteBalanceEntry(deleteButton.dataset.deleteBalance);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ Р±Р°Р»Р°РЅСЃР°.", "error");
    }
  });

  bindDomEvent(calendarDom.tableBody, "click", async (event) => {
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
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ?")) return;

    try {
      await deleteCalendarEntry(deleteButton.dataset.deleteCalendar);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ РїР»Р°С‚РµР¶РЅРѕРіРѕ РєР°Р»РµРЅРґР°СЂСЏ.", "error");
    }
  });

  bindDomEvent(assetsDom.assetTableBody, "click", async (event) => {
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
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ Р°РєС‚РёРІ?")) return;

    try {
      await deleteAsset(deleteButton.dataset.deleteAsset);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ Р°РєС‚РёРІ.", "error");
    }
  });

  bindDomEvent(assetsDom.paymentTableBody, "click", async (event) => {
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
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ РІС‹РїР»Р°С‚Сѓ РїРѕ Р°РєС‚РёРІСѓ?")) return;

    try {
      await deleteAssetPayment(deleteButton.dataset.deleteAssetPayment);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ РІС‹РїР»Р°С‚Сѓ РїРѕ Р°РєС‚РёРІСѓ.", "error");
    }
  });

  bindDomEvent(purchasesDom.tableBody, "click", async (event) => {
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
    if (!window.confirm("РЈРґР°Р»РёС‚СЊ РїРѕР·РёС†РёСЋ Р·Р°РєСѓРїРєРё?")) return;

    try {
      await deletePurchase(deleteButton.dataset.deletePurchase);
    } catch (error) {
      setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СѓРґР°Р»РёС‚СЊ РїРѕР·РёС†РёСЋ Р·Р°РєСѓРїРєРё.", "error");
    }
  });
}

function renderAssetsConfigured() {
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
      "Р В Р В°Р В·Р Т‘Р ВµР В» Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р ВµР Р… РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Р†Р В»Р В°Р Т‘Р ВµР В»РЎРЉРЎвЂ РЎС“ Р С‘ Р В°Р Т‘Р СР С‘Р Р…Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР С•РЎР‚Р В°Р С."
    );
    dom.paymentTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "payments",
      [],
      () => "",
      "Р В Р В°Р В·Р Т‘Р ВµР В» Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р ВµР Р… РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Р†Р В»Р В°Р Т‘Р ВµР В»РЎРЉРЎвЂ РЎС“ Р С‘ Р В°Р Т‘Р СР С‘Р Р…Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР С•РЎР‚Р В°Р С."
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
      "Р РЋР Р…Р В°РЎвЂЎР В°Р В»Р В° Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р С‘РЎвЂљР Вµ platform_light2_assets_purchases_patch.sql Р Р† Supabase SQL Editor."
    );
    dom.paymentTableBody.innerHTML = renderConfiguredSectionRows(
      "assets",
      "payments",
      [],
      () => "",
      "Р РЋР Р…Р В°РЎвЂЎР В°Р В»Р В° Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р С‘РЎвЂљР Вµ platform_light2_assets_purchases_patch.sql Р Р† Supabase SQL Editor."
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
      if (columnKey === "asset_name") return escapeHtml(asset.asset_name || "РІР‚вЂќ");
      if (columnKey === "asset_value") return escapeHtml(formatMoney(asset.asset_value));
      if (columnKey === "paid_total") return escapeHtml(formatMoney(paid));
      if (columnKey === "remaining_amount") {
        return `<span class="${remaining <= 0 ? "amount-positive" : "amount-negative"}">${escapeHtml(formatMoney(remaining))}</span>`;
      }
      if (columnKey === "note") return escapeHtml(asset.note || "РІР‚вЂќ");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(asset.updated_at || asset.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset="${escapeHtml(asset.id)}">Р ВР В·Р СР ВµР Р…Р С‘РЎвЂљРЎРЉ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset="${escapeHtml(asset.id)}">Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ</button>
          </div>
        `;
      }
      return `<span class="muted">РІР‚вЂќ</span>`;
    },
    "Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р В°Р С”РЎвЂљР С‘Р Р†Р С•Р Р† Р Т‘Р В»РЎРЏ РЎвЂљР ВµР С”РЎС“РЎвЂ°Р ВµР С–Р С• РЎвЂћР С‘Р В»РЎРЉРЎвЂљРЎР‚Р В°."
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
      if (columnKey === "note") return escapeHtml(payment.note || "РІР‚вЂќ");
      if (columnKey === "updated_at") return escapeHtml(formatDateTime(payment.updated_at || payment.created_at));
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-asset-payment="${escapeHtml(payment.id)}">Р ВР В·Р СР ВµР Р…Р С‘РЎвЂљРЎРЉ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-asset-payment="${escapeHtml(payment.id)}">Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ</button>
          </div>
        `;
      }
      return `<span class="muted">РІР‚вЂќ</span>`;
    },
    "Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р Р†РЎвЂ№Р С—Р В»Р В°РЎвЂљ Р Т‘Р В»РЎРЏ РЎвЂљР ВµР С”РЎС“РЎвЂ°Р ВµР С–Р С• РЎвЂћР С‘Р В»РЎРЉРЎвЂљРЎР‚Р В°."
  );
}

function renderPurchasesConfigured() {
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
      "Р В Р В°Р В·Р Т‘Р ВµР В» Р Т‘Р С•РЎРѓРЎвЂљРЎС“Р С—Р ВµР Р… РЎвЂљР С•Р В»РЎРЉР С”Р С• Р Р†Р В»Р В°Р Т‘Р ВµР В»РЎРЉРЎвЂ РЎС“ Р С‘ Р В°Р Т‘Р СР С‘Р Р…Р С‘РЎРѓРЎвЂљРЎР‚Р В°РЎвЂљР С•РЎР‚Р В°Р С."
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
      "Р РЋР Р…Р В°РЎвЂЎР В°Р В»Р В° Р Р†РЎвЂ№Р С—Р С•Р В»Р Р…Р С‘РЎвЂљР Вµ platform_light2_assets_purchases_patch.sql Р Р† Supabase SQL Editor."
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
      if (columnKey === "supplier_name") return escapeHtml(item.supplier_name || "РІР‚вЂќ");
      if (columnKey === "supplier_inn") return escapeHtml(item.supplier_inn || "РІР‚вЂќ");
      if (columnKey === "city") return escapeHtml(item.city || "РІР‚вЂќ");
      if (columnKey === "category") return escapeHtml(item.category || "РІР‚вЂќ");
      if (columnKey === "article") return escapeHtml(item.article || "РІР‚вЂќ");
      if (columnKey === "item_name") return escapeHtml(item.item_name || "РІР‚вЂќ");
      if (columnKey === "unit_name") return escapeHtml(item.unit_name || "РІР‚вЂќ");
      if (columnKey === "price") return escapeHtml(formatMoney(item.price));
      if (columnKey === "note") return escapeHtml(item.note || "РІР‚вЂќ");
      if (columnKey === "actions") {
        return `
          <div class="d-flex gap-2">
            <button class="btn btn-outline-dark btn-sm" type="button" data-edit-purchase="${escapeHtml(item.id)}">Р ВР В·Р СР ВµР Р…Р С‘РЎвЂљРЎРЉ</button>
            <button class="btn btn-outline-danger btn-sm" type="button" data-delete-purchase="${escapeHtml(item.id)}">Р Р€Р Т‘Р В°Р В»Р С‘РЎвЂљРЎРЉ</button>
          </div>
        `;
      }
      return `<span class="muted">РІР‚вЂќ</span>`;
    },
    "Р СџР С•Р С”Р В° Р Р…Р ВµРЎвЂљ Р С—Р С•Р В·Р С‘РЎвЂ Р С‘Р в„– Р В·Р В°Р С”РЎС“Р С—Р С”Р С‘ Р Т‘Р В»РЎРЏ РЎвЂљР ВµР С”РЎС“РЎвЂ°Р ВµР С–Р С• РЎвЂћР С‘Р В»РЎРЉРЎвЂљРЎР‚Р В°."
  );
}

function bindBuilderEvents() {
  if (STATE.builderEventsBound) return;
  STATE.builderEventsBound = true;
  bindDomEvent(document.body, "click", async (event) => {
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
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РІРёРґ.", "error");
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
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЌРєСЃРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ СЃС…РµРјСѓ СЃРµРєС†РёРё.", "error");
      }
      return;
    }

    const importButton = event.target.closest("[data-builder-import]");
    if (importButton) {
      try {
        await importSectionBuilder(importButton.dataset.builderImport);
      } catch (error) {
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РёРјРїРѕСЂС‚РёСЂРѕРІР°С‚СЊ СЃС…РµРјСѓ СЃРµРєС†РёРё.", "error");
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
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ РєРѕР»РѕРЅРєРё.", "error");
      }
      return;
    }

    const saveFormulaButton = event.target.closest("[data-builder-formula-save]");
    if (saveFormulaButton) {
      try {
        saveSectionFormula(saveFormulaButton.dataset.builderFormulaSave);
      } catch (error) {
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ С„РѕСЂРјСѓР»Сѓ.", "error");
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
        setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ JSON-СЃС…РµРјСѓ.", "error");
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
  setModuleState("РЎС‚Р°СЂС‚...");
  setStatus("Р—Р°РїСѓСЃРєР°СЋ РљРѕРЅС‚СѓСЂ Рё РїРѕРґРєР»СЋС‡Р°СЋ СЂР°Р±РѕС‡РёРµ Р±Р»РѕРєРё...", "");
  installMojibakeRepairObserver();
  scheduleMojibakeRepair(document.body);
  const runStartupStep = (label, fn) => {
    try {
      fn();
      scheduleMojibakeRepair(document.body);
    } catch (error) {
      console.error(`light2 startup step failed: ${label}`, error);
      setStatus(error.message || `РћС€РёР±РєР° РЅР° С€Р°РіРµ "${label}".`, "error");
    }
  };

  runStartupStep("overview", () => renderOverview());
  runStartupStep("template-sections", () => renderTemplateSections());
  runStartupStep("interactive-finance", () => renderInteractiveFinanceSections());
  runStartupStep("dom-refs", () => refreshInteractiveDomRefs());
  runStartupStep("snapshot-sections", () => renderWorkbookSnapshotSections());
  runStartupStep("section-tabs", () => syncSectionTabs());
  try {
    bindEvents();
    bindBuilderEvents();
  } catch (error) {
    console.error("light2 bind error", error);
    setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ РёРЅРёС†РёР°Р»РёР·РёСЂРѕРІР°С‚СЊ РёРЅС‚РµСЂР°РєС‚РёРІРЅС‹Рµ РєРЅРѕРїРєРё Р”РћРњ РќР•РћРќРђ.", "error");
  }
  runStartupStep("workspace-mode", () => syncWorkspaceModeUi());
  runStartupStep("open-section", () => openSection(STATE.activeSection || "overview"));

  try {
    const ready = await withTimeout(
      loadBootstrapData(),
      9000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ РїРѕРґРіРѕС‚РѕРІРёС‚СЊ РїСЂРѕС„РёР»СЊ Рё СЃРµСЃСЃРёСЋ РљРѕРЅС‚СѓСЂ."
    );
    if (!ready) {
      await activateReadonlyFallback(new Error("РЎРµСЃСЃРёСЏ РїР»Р°С‚С„РѕСЂРјС‹ РЅРµРґРѕСЃС‚СѓРїРЅР° РґР»СЏ Р¶РёРІРѕРіРѕ СЂРµР¶РёРјР°."));
      return;
    }
    await withTimeout(
      loadWorkbookSnapshot(),
      8000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ Р·Р°РіСЂСѓР·РёС‚СЊ snapshot РљРѕРЅС‚СѓСЂ."
    );
    await loadContourBlocks();
    const restored = await withTimeout(
      maybeAutoRestoreContourData(),
      12000,
      "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕРІСЂРµРјСЏ РІРѕСЃСЃС‚Р°РЅРѕРІРёС‚СЊ Р¶РёРІС‹Рµ РґР°РЅРЅС‹Рµ РљРѕРЅС‚СѓСЂ."
    );
    if (restored) {
      await loadContourBlocks();
    }
    syncModuleStatus();
    syncImportButton();
    scheduleMojibakeRepair(document.body);
  } catch (error) {
    setModuleState("РћС€РёР±РєР°");
    setStatus(error.message || "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РїСѓСЃС‚РёС‚СЊ РјРѕРґСѓР»СЊ Р”РћРњ РќР•РћРќРђ.", "error");
    syncImportButton();
    scheduleMojibakeRepair(document.body);
  }
}

window.setTimeout(async () => {
  const stillBooting =
    /РџСЂРѕРІРµСЂСЏСЋ|Р—Р°РіСЂСѓР·РєР°|РЎС‚Р°СЂС‚/i.test(String(DOM.userDisplay?.textContent || "")) ||
    /РџСЂРѕРІРµСЂСЏСЋ|Р—Р°РіСЂСѓР·РєР°|РЎС‚Р°СЂС‚/i.test(String(DOM.accessMode?.textContent || "")) ||
    /Р—Р°РіСЂСѓР·РєР°|РЎС‚Р°СЂС‚/i.test(String(DOM.moduleState?.textContent || "")) ||
    /Р—Р°РіСЂСѓР¶Р°СЋ СЃС‚СЂСѓРєС‚СѓСЂСѓ РјРѕРґСѓР»СЏ/i.test(String(DOM.statusBox?.textContent || ""));

  if (!stillBooting) return;

  console.warn("light2 bootstrap guard activated");
  try {
    await activateReadonlyFallback(new Error("РљРѕРЅС‚СѓСЂ РЅРµ Р·Р°РІРµСЂС€РёР» СЃС‚Р°СЂС‚ РІРѕРІСЂРµРјСЏ."));
  } catch (error) {
    console.error("light2 bootstrap guard failed", error);
  }
}, 12000);

start();

