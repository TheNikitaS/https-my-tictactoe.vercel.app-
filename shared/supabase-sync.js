(function () {
  const SUPABASE_URL = "https://cfmjxssilejlqmsbtbrv.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ZLMLOM21dAYfchc7OW9TsA_vjTQ3sB3";
  const TABLE_NAME = "shared_app_states";
  const DEFAULT_POLL_MS = 3000;
  const DEFAULT_SAVE_DEBOUNCE_MS = 800;

  function cloneJson(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function stringifyState(value) {
    return JSON.stringify(value ?? null);
  }

  async function request(path, options) {
    const settings = options || {};
    const headers = new Headers(settings.headers || {});
    headers.set("apikey", SUPABASE_KEY);
    headers.set("Authorization", "Bearer " + SUPABASE_KEY);

    let body = settings.body;
    if (settings.json !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(settings.json);
    }

    const response = await fetch(SUPABASE_URL + path, {
      method: settings.method || "GET",
      headers,
      body,
      cache: "no-store"
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error("Supabase request failed (" + response.status + "): " + text.slice(0, 240));
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  function parseTimestamp(value) {
    const parsed = Date.parse(value || "");
    return Number.isFinite(parsed) ? parsed : 0;
  }

  window.createSharedSupabaseSync = function createSharedSupabaseSync(options) {
    const appId = options.appId;
    const clientId =
      options.clientId ||
      appId + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

    let lastRemoteTimestamp = 0;
    let lastKnownStateHash = null;
    let saveTimer = null;
    let pollTimer = null;
    let pendingSave = false;
    let applyingRemoteState = false;
    let initialized = false;

    function notify(status, detail) {
      if (typeof options.onStatus === "function") {
        options.onStatus(status, detail || null);
      }
    }

    async function readRemote() {
      const rows = await request(
        "/rest/v1/" +
          TABLE_NAME +
          "?app_id=eq." +
          encodeURIComponent(appId) +
          "&select=app_id,payload,updated_at,updated_by",
        { method: "GET" }
      );
      return Array.isArray(rows) ? rows[0] || null : null;
    }

    async function writeRemote(reason) {
      pendingSave = false;
      const state = cloneJson(options.getState());
      const stateHash = stringifyState(state);

      if (initialized && stateHash === lastKnownStateHash && reason !== "force" && reason !== "seed") {
        notify("saved");
        return null;
      }

      notify("saving");

      const rows = await request("/rest/v1/" + TABLE_NAME + "?on_conflict=app_id", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        json: {
          app_id: appId,
          payload: state,
          updated_by: clientId
        }
      });

      const row = Array.isArray(rows) ? rows[0] || null : null;
      lastKnownStateHash = stateHash;
      lastRemoteTimestamp = parseTimestamp(row && row.updated_at);
      notify("saved");
      return row;
    }

    function persistRemoteLocally(nextState) {
      if (typeof options.persistLocal === "function") {
        options.persistLocal(cloneJson(nextState));
      }
    }

    function applyRemote(row) {
      if (!row || !row.payload) {
        return false;
      }

      const remoteTimestamp = parseTimestamp(row.updated_at);
      const remoteHash = stringifyState(row.payload);

      lastRemoteTimestamp = remoteTimestamp;

      if (remoteHash === lastKnownStateHash) {
        return false;
      }

      applyingRemoteState = true;
      try {
        options.applyState(cloneJson(row.payload), {
          source: "remote",
          updatedAt: row.updated_at,
          updatedBy: row.updated_by || null
        });
        persistRemoteLocally(row.payload);
        lastKnownStateHash = remoteHash;
        notify("remote");
        return true;
      } finally {
        applyingRemoteState = false;
      }
    }

    async function syncFromRemote() {
      if (!initialized || pendingSave || applyingRemoteState) {
        return;
      }

      const row = await readRemote();
      if (!row) {
        return;
      }

      const remoteTimestamp = parseTimestamp(row.updated_at);
      if ((row.updated_by || null) === clientId) {
        lastRemoteTimestamp = remoteTimestamp;
        return;
      }

      if (remoteTimestamp <= lastRemoteTimestamp) {
        return;
      }

      applyRemote(row);
      notify("idle");
    }

    function startPolling() {
      if (pollTimer) {
        return;
      }

      pollTimer = window.setInterval(async function () {
        try {
          await syncFromRemote();
        } catch (error) {
          notify("warn", error);
        }
      }, options.pollMs || DEFAULT_POLL_MS);
    }

    return {
      async init() {
        notify("connecting");
        const localState = cloneJson(options.getState());
        lastKnownStateHash = stringifyState(localState);

        const row = await readRemote();
        if (row && row.payload) {
          applyRemote(row);
        } else {
          await writeRemote("seed");
        }

        initialized = true;
        startPolling();
        notify("idle");
      },
      scheduleSave() {
        if (applyingRemoteState) {
          return;
        }

        pendingSave = true;
        notify("dirty");

        if (saveTimer) {
          window.clearTimeout(saveTimer);
        }

        saveTimer = window.setTimeout(async function () {
          try {
            await writeRemote("save");
          } catch (error) {
            notify("error", error);
          }
        }, options.saveDebounceMs || DEFAULT_SAVE_DEBOUNCE_MS);
      },
      async forceSave() {
        if (applyingRemoteState) {
          return null;
        }

        if (saveTimer) {
          window.clearTimeout(saveTimer);
        }

        return writeRemote("force");
      },
      isApplyingRemoteState() {
        return applyingRemoteState;
      }
    };
  };
})();
