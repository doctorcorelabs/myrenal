var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// cf-worker/interaction-checker-worker/src/index.ts
function handleOptions(request) {
  const headers = request.headers;
  if (headers.get("Origin") !== null && headers.get("Access-Control-Request-Method") !== null && headers.get("Access-Control-Request-Headers") !== null) {
    const respHeaders = {
      "Access-Control-Allow-Origin": "*",
      // Adjust in production for security
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": headers.get("Access-Control-Request-Headers") || "Content-Type",
      "Access-Control-Max-Age": "86400"
      // Cache preflight for 1 day
    };
    return new Response(null, { headers: respHeaders });
  } else {
    return new Response(null, {
      headers: {
        Allow: "POST, OPTIONS"
      }
    });
  }
}
__name(handleOptions, "handleOptions");
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: { "Allow": "POST, OPTIONS" } });
    }
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      // Adjust in production
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    try {
      const body = await request.json();
      const drugs = body?.drugs;
      if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
        return new Response(JSON.stringify({ error: 'Please provide an array of at least two drug names in the "drugs" field.' }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const validDrugs = drugs.map((d) => String(d).trim()).filter((d) => d.length > 0);
      if (validDrugs.length < 2) {
        return new Response(JSON.stringify({ error: "Please provide at least two non-empty drug names." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      console.log("Received drugs for interaction check:", validDrugs);
      const rxcuiMap = await getRxCUIs(validDrugs, env);
      const rxcuis = Object.values(rxcuiMap).filter(Boolean);
      if (rxcuis.length < 2 && validDrugs.length >= 2) {
        console.warn("Could not identify at least two drugs via RxCUI:", rxcuiMap);
      }
      const interactionData = await fetchOpenFDAInteractions(rxcuis, validDrugs, env);
      if (interactionData.error) {
        return new Response(JSON.stringify({ error: `OpenFDA API Error: ${interactionData.error.message}` }), {
          status: 502,
          // Bad Gateway might be appropriate
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      const results = parseInteractions(interactionData, rxcuiMap, validDrugs);
      return new Response(JSON.stringify({ interactions: results }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error processing interaction check:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof SyntaxError) {
        errorMessage = "Invalid JSON payload received.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};
async function getRxCUIs(drugNames, env) {
  console.log("Fetching RxCUIs for:", drugNames);
  const rxcuiMap = {};
  const rxnormApiUrl = "https://rxnav.nlm.nih.gov/REST";
  for (const name of drugNames) {
    try {
      const approxUrl = `${rxnormApiUrl}/approximateTerm.json?term=${encodeURIComponent(name)}&maxEntries=1`;
      const approxResponse = await fetch(approxUrl);
      if (!approxResponse.ok) {
        console.error(`RxNorm approxTerm API error for "${name}": ${approxResponse.status}`);
        rxcuiMap[name] = null;
        continue;
      }
      const approxData = await approxResponse.json();
      const candidate = approxData.approximateGroup?.candidate?.[0];
      if (candidate?.rxcui) {
        rxcuiMap[name] = candidate.rxcui;
        console.log(`Found RxCUI ${candidate.rxcui} for "${name}"`);
      } else {
        console.warn(`No RxCUI found for "${name}" via approximateTerm.`);
        rxcuiMap[name] = null;
      }
    } catch (error) {
      console.error(`Error fetching RxCUI for "${name}":`, error);
      rxcuiMap[name] = null;
    }
  }
  console.log("RxCUI Map:", rxcuiMap);
  return rxcuiMap;
}
__name(getRxCUIs, "getRxCUIs");
async function fetchOpenFDAInteractions(rxcuis, originalDrugNames, env) {
  console.log("Fetching OpenFDA interactions for RxCUIs:", rxcuis, "and Names:", originalDrugNames);
  if (rxcuis.length === 0 && originalDrugNames.length === 0) {
    return { results: [] };
  }
  const rxcuiQueryParts = rxcuis.map((rxcui) => `openfda.rxcui:"${rxcui}"`);
  const nameQueryParts = originalDrugNames.map((name) => {
    const escapedName = name.replace(/[\+\-\&\|\!\(\)\{\}\[\]\^"~\*\?:\\\/\s]/g, "\\$&");
    return `(openfda.generic_name:"${escapedName}" OR openfda.brand_name:"${escapedName}")`;
  });
  const allQueryParts = [...rxcuiQueryParts, ...nameQueryParts];
  if (allQueryParts.length === 0) {
    console.warn("No valid query parts generated for OpenFDA.");
    return { results: [] };
  }
  const query = allQueryParts.join("+OR+");
  const limit = 200;
  const openFDAUrl = `https://api.fda.gov/drug/label.json?search=(${query})&limit=${limit}`;
  const finalUrl = openFDAUrl;
  console.log("OpenFDA Query URL:", finalUrl);
  try {
    const response = await fetch(finalUrl);
    if (!response.ok) {
      console.error(`OpenFDA API error: ${response.status} ${response.statusText}`);
      let errorMessage = response.statusText;
      try {
        const errorBody = await response.json();
        console.error("OpenFDA Error Body:", errorBody);
        errorMessage = errorBody?.error?.message || errorMessage;
      } catch (e) {
        console.error("Could not parse OpenFDA error body:", e);
      }
      if (response.status === 404) {
        return { error: { code: "NOT_FOUND", message: "No labels found matching the query." } };
      }
      return { error: { code: String(response.status), message: errorMessage } };
    }
    const data = await response.json();
    console.log(`OpenFDA returned ${data.results?.length || 0} labels.`);
    return data;
  } catch (error) {
    console.error("Error fetching from OpenFDA:", error);
    let message = "Failed to fetch data from OpenFDA.";
    if (error instanceof Error) {
      message = error.message;
    }
    return { error: { code: "FETCH_FAILED", message } };
  }
}
__name(fetchOpenFDAInteractions, "fetchOpenFDAInteractions");
function parseInteractions(apiResponse, rxcuiMap, originalDrugNames) {
  console.log("--- Starting Interaction Parsing ---");
  const interactions = [];
  const inputRxCUIs = new Set(Object.values(rxcuiMap).filter(Boolean));
  const inputNamesLower = new Set(originalDrugNames.map((name) => name.toLowerCase()));
  if (!apiResponse.results || apiResponse.results.length === 0) {
    console.log("No relevant labels found in OpenFDA response to parse.");
    return interactions;
  }
  const drugNameMap = {};
  for (const name in rxcuiMap) {
    if (rxcuiMap[name]) {
      drugNameMap[rxcuiMap[name]] = name;
    }
  }
  console.log("Input RxCUIs Set:", inputRxCUIs);
  console.log("RxCUI to Name Map:", drugNameMap);
  console.log("Input Names Set (lower):", inputNamesLower);
  for (const label of apiResponse.results) {
    const labelId = label.id || "unknown";
    const labelRxCUIs = label.openfda?.rxcui || [];
    const interactionText = (label.drug_interactions || []).join(" ").toLowerCase();
    const labelBrandNamesLower = (label.openfda?.brand_name || []).map((n) => n.toLowerCase());
    const labelGenericNamesLower = (label.openfda?.generic_name || []).map((n) => n.toLowerCase());
    console.log(`
--- Processing Label ID: ${labelId} (RxCUIs: ${labelRxCUIs.join(", ")}) ---`);
    const associatedInputDrugs = /* @__PURE__ */ new Set();
    for (const rxcui of labelRxCUIs) {
      if (inputRxCUIs.has(rxcui) && drugNameMap[rxcui]) {
        associatedInputDrugs.add(drugNameMap[rxcui]);
      }
    }
    for (const inputName of originalDrugNames) {
      if (!associatedInputDrugs.has(inputName)) {
        const inputNameLower = inputName.toLowerCase();
        if (labelBrandNamesLower.includes(inputNameLower) || labelGenericNamesLower.includes(inputNameLower)) {
          associatedInputDrugs.add(inputName);
        }
      }
    }
    const primaryDrugNamesForLabel = Array.from(associatedInputDrugs);
    if (primaryDrugNamesForLabel.length === 0 || interactionText.length === 0) {
      continue;
    }
    console.log(`   Label identified as relating to input drug(s): ${primaryDrugNamesForLabel.join(", ")}`);
    for (const otherInputName of originalDrugNames) {
      if (primaryDrugNamesForLabel.includes(otherInputName)) {
        continue;
      }
      const otherInputNameLower = otherInputName.toLowerCase();
      console.log(`   Checking if interaction text mentions OTHER drug: "${otherInputNameLower}"`);
      if (interactionText.includes(otherInputNameLower)) {
        console.log(`   !!! Match Found: Text mentions "${otherInputNameLower}"`);
        for (const primaryName of primaryDrugNamesForLabel) {
          const pair = [primaryName, otherInputName].sort();
          if (!interactions.some((existing) => existing.pair[0] === pair[0] && existing.pair[1] === pair[1])) {
            console.log(`   +++ Adding Interaction: ${pair[0]} + ${pair[1]}`);
            const originalInteractionText = (label.drug_interactions || []).join(" ");
            interactions.push({
              pair,
              severity: "Unknown",
              // OpenFDA label text rarely gives structured severity
              description: `Interaction mentioned in the labeling for ${primaryName}. Full text: "${originalInteractionText}"`
              // Use full original text
            });
          } else {
          }
        }
      } else {
      }
    }
  }
  console.log(`--- Interaction Parsing Complete. Found ${interactions.length} potential interaction mentions. ---`);
  return interactions;
}
__name(parseInteractions, "parseInteractions");

// C:/Users/ACER/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/ACER/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-pMm3zg/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// C:/Users/ACER/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-pMm3zg/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
