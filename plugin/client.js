// Generated from src/client by `npm run build` (scripts/build-client.mjs). Do not edit by hand.
window.__ModuleLoader__.load({
  id: 'apmixbot',
  factory: (require) => {
const module = { exports: {} }
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/client/index.js
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);

// src/client/i18n.js
var NAMESPACE = "apmixbot";
var fill = (text, params) => params ? text.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match) : text;
function installLocale() {
  return () => {
  };
}
function t(key, params) {
  return fill(key, params);
}
var hostText = (message) => message;
var language = () => "en";
var dateLocale = () => "en-US";

// src/client/diagnostics.js
var MAX = 30;
var REPEAT_MS = 5 * 60 * 1e3;
var entries = [];
var noted = /* @__PURE__ */ new WeakSet();
var markNoted = (error) => {
  if (error !== null && typeof error === "object") noted.add(error);
  return error;
};
function noteClientError(where, error) {
  if (error !== null && typeof error === "object") {
    if (noted.has(error)) return;
    noted.add(error);
  }
  const message = String(error?.message ?? error ?? "error").slice(0, 300);
  const code = typeof error?.code === "string" ? error.code : void 0;
  const text = `${where}: ${message}`;
  const now = Date.now();
  const last = entries.at(-1);
  if (last && last.text === text && now - last.time < REPEAT_MS) {
    last.time = now;
    last.count = (last.count ?? 1) + 1;
    return;
  }
  entries.push({ time: now, level: "error", text, ...code ? { code } : {} });
  if (entries.length > MAX) entries.splice(0, entries.length - MAX);
}
var quietly = (where) => (error) => noteClientError(where, error);
var clearClientErrors = () => {
  entries.length = 0;
};
var clientErrors = () => entries.map((entry) => entry.count > 1 ? { ...entry, text: `${entry.text} (×${entry.count})` } : { ...entry });
var FAILURES = {
  AUTH: "The API key was rejected",
  QUOTA: "The account is out of quota",
  ACCOUNT_QUOTA: "The account is out of quota",
  RATE_LIMIT: "Too many requests to the model",
  CONTEXT_WINDOW_EXCEEDED: "The conversation is too long for the model",
  INVALID_REQUEST: "The model service refused the request",
  SERVER: "The model service failed",
  TIMEOUT: "The model took too long to answer",
  TRANSPORT: "Could not reach the model service",
  SESSION: "Its group conversation could not open",
  SESSION_RESET: "Its group conversation could not open, so it starts a new one next time"
};
function failureLabel(code, message) {
  if (FAILURES[code]) return t(FAILURES[code]);
  return message || code || t("Unknown error");
}

// src/client/api.js
var ROUTE = "api/bot";
var REFUSALS = /* @__PURE__ */ new Set(["bot/refused", "bot/invalid", "bot/read-only", "bot/not-found", "bot/browser-off"]);
var call = async (endpoint, payload, signal) => {
  let response;
  try {
    response = await fetch(ROUTE, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ endpoint, payload: payload ?? null }),
      signal
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    noteClientError(endpoint, Object.assign(new Error(`network error: ${error?.message ?? error}`), { code: "NETWORK" }));
    throw markNoted(Object.assign(new Error(t("Could not reach ApmixBot. Check that it is still running.")), { code: "NETWORK", cause: error }));
  }
  if (!response.ok) {
    const error = Object.assign(new Error(hostText(`HTTP ${response.status}`)), { code: `HTTP_${response.status}` });
    noteClientError(endpoint, error);
    throw error;
  }
  const result = await response.json();
  if (!result.ok) {
    const code = result.error?.code ?? "bot/error";
    const message = hostText(result.error?.message ?? "Request failed");
    const error = Object.assign(new Error(message), { code });
    if (!REFUSALS.has(code)) {
      noteClientError(endpoint, Object.assign(new Error(result.error?.message ?? "Request failed"), { code }));
      markNoted(error);
    }
    throw error;
  }
  return result.value;
};

// src/client/inks.js
var INKS = {
  red: ["#E5202E", "#FF3B47"],
  crimson: ["#A8101D", "#E23345"],
  ember: ["#FF6A1A", "#FF8A3D"],
  amber: ["#D98A00", "#FFB224"],
  green: ["#1E9E57", "#3DD07F"],
  teal: ["#0F9B8E", "#25CDB8"],
  blue: ["#2B6FE8", "#5B9BFF"],
  violet: ["#7B4FE0", "#A385FF"],
  rose: ["#E8175D", "#F2457A"],
  wine: ["#7A0F24", "#C23A55"],
  black: ["#000000", "#FFFFFF"],
  charcoal: ["#1C1C1F", "#ECECEF"],
  graphite: ["#3A3A3F", "#C9C9CE"],
  steel: ["#5E636B", "#9EA3AB"],
  silver: ["#8E9299", "#BFC2C8"],
  snow: ["#E6E7EA", "#FFFFFF"],
  gray: ["#959595", "#777777"],
  blaze: ["#E5202E", "#FF3B47"]
};
var GRADIENTS = { blaze: [[0, "#FF6A3D"], [0.45, "#E5202E"], [1, "#3A0A10"]] };
var ACCENT_INKS = ["red", "crimson", "rose", "wine", "charcoal", "graphite"];
var isHex = (color) => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color);
var luminance = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255).map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
var inkName = (color) => INKS[color] ? color : "gray";
var inkFill = (color) => isHex(color) ? color : `var(--bt-ink-${inkName(color)})`;
var inkText = (color) => color === "black" || color === "snow" ? "var(--bt-ink-gray)" : inkFill(color);
var eyeOn = (hex) => luminance(hex) > 0.3 ? "#141414" : "#ffffff";
var inkEye = (color) => GRADIENTS[color] ? "#ffffff" : isHex(color) ? eyeOn(color) : `var(--bt-eye-${inkName(color)})`;
var paintCss = (color) => GRADIENTS[color] ? `linear-gradient(135deg,${GRADIENTS[color].map(([offset, value]) => `${value} ${offset * 100}%`).join(",")})` : inkFill(color);

// src/client/characters.js
var num = (value) => Math.round(value * 100) / 100;
var at = (x, y) => `${num(x)} ${num(y)}`;
function box(x, y, w, h40, r = 0) {
  const k = Math.min(r, w / 2, h40 / 2);
  if (k <= 0) return `M${at(x, y)}H${num(x + w)}V${num(y + h40)}H${num(x)}Z`;
  const arc = (ex, ey) => `A${num(k)} ${num(k)} 0 0 1 ${at(ex, ey)}`;
  return `M${at(x + k, y)}H${num(x + w - k)}${arc(x + w, y + k)}V${num(y + h40 - k)}${arc(x + w - k, y + h40)}H${num(x + k)}${arc(x, y + h40 - k)}V${num(y + k)}${arc(x + k, y)}Z`;
}
var circle = (sweep) => (cx, cy, r) => `M${at(cx - r, cy)}A${num(r)} ${num(r)} 0 1 ${sweep} ${at(cx + r, cy)}A${num(r)} ${num(r)} 0 1 ${sweep} ${at(cx - r, cy)}Z`;
var disc = circle(1);
var hole = circle(0);
function poly(points, r = 0) {
  const turn = points.reduce((sum, [x, y], index) => {
    const [nx, ny] = points[(index + 1) % points.length];
    return sum + x * ny - nx * y;
  }, 0);
  const list = turn < 0 ? [...points].reverse() : points;
  if (r <= 0) return `M${list.map(([x, y]) => at(x, y)).join("L")}Z`;
  const toward = ([x, y], [tx, ty]) => {
    const length = Math.hypot(tx - x, ty - y);
    const k = Math.min(r, length / 2) / length;
    return [x + (tx - x) * k, y + (ty - y) * k];
  };
  const corners = list.map((point, index) => [toward(point, list[(index + list.length - 1) % list.length]), point, toward(point, list[(index + 1) % list.length])]);
  return `M${at(...corners[0][2])}${[...corners.slice(1), corners[0]].map(([from, corner, to]) => `L${at(...from)}Q${at(...corner)} ${at(...to)}`).join("")}Z`;
}
function rod(x1, y1, x2, y2, w) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const [nx, ny] = [(y1 - y2) / length * (w / 2), (x2 - x1) / length * (w / 2)];
  return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]) + disc(x1, y1, w / 2) + disc(x2, y2, w / 2);
}
function arcBand(cx, cy, inner, outer, from, to) {
  const point = (r, angle) => at(cx + r * Math.cos(angle * Math.PI / 180), cy + r * Math.sin(angle * Math.PI / 180));
  const large = to - from > 180 ? 1 : 0;
  return `M${point(outer, from)}A${outer} ${outer} 0 ${large} 1 ${point(outer, to)}L${point(inner, to)}A${inner} ${inner} 0 ${large} 0 ${point(inner, from)}Z`;
}
var VISOR = "#000";
var BOLT = [[47, 3], [62, 3], [55, 14], [63, 14], [44, 35], [50, 20], [41, 20]];
var BOLT_LIGHT = [[50, 7], [56.5, 7], [53, 13.5], [58.5, 15.5], [48.5, 28], [50.5, 19.5], [45.5, 19.5]];
var PINS = [32, 46.5, 61].flatMap((p) => [box(p, 9, 7, 12, 3), box(p, 79, 7, 12, 3), box(9, p, 12, 7, 3), box(79, p, 12, 7, 3)]);
var CHARACTERS = {
  apex: {
    label: "Apex",
    body: [box(14, 30, 72, 56, 22), box(5, 47, 13, 24, 6.5), box(82, 47, 13, 24, 6.5), box(46.5, 15, 7, 18, 3.5), disc(50, 12, 8.5)],
    paints: [[box(21, 41, 58, 34, 17), VISOR, 0.28]],
    glow: [disc(50, 12, 4)],
    eyes: [[37.5, 58, 13, 16], [62.5, 58, 13, 16]]
  },
  pixel: {
    label: "Pixel",
    body: [box(13, 26, 74, 64, 13), rod(31, 28, 24, 11, 6), disc(23, 10, 6.5), rod(69, 28, 76, 11, 6), disc(77, 10, 6.5)],
    paints: [[box(21, 38, 58, 36, 9), VISOR, 0.28]],
    marks: [box(43, 66, 14, 3.6, 1.8)],
    glow: [disc(23, 10, 3), disc(77, 10, 3)],
    eyes: [[37, 54, 13, 13, 0, 3], [63, 54, 13, 13, 0, 3]]
  },
  orbit: {
    label: "Orbit",
    body: [disc(50, 56, 33), disc(15, 58, 8), disc(85, 58, 8), box(47.5, 17, 5, 10, 2.5), disc(50, 11, 8) + hole(50, 11, 3.8)],
    paints: [[box(25, 42, 50, 30, 15), VISOR, 0.28]],
    glow: [disc(50, 11, 2.2)],
    eyes: [[39.5, 57, 11, 15], [60.5, 57, 11, 15]]
  },
  visor: {
    label: "Visor",
    body: [box(7, 36, 86, 48, 24), poly([[37, 39], [43, 21], [57, 21], [63, 39]], 5)],
    paints: [[box(15, 46, 70, 27, 13.5), VISOR, 0.3]],
    glow: [box(44.5, 25, 11, 4.4, 2.2)],
    eyes: [[34, 59.5, 17, 10], [66, 59.5, 17, 10]]
  },
  bolt: {
    label: "Bolt",
    body: [poly([[15, 31], [85, 31], [85, 64], [63, 89], [37, 89], [15, 64]], 11), poly(BOLT, 1.2)],
    paints: [[box(23, 42, 54, 27, 13.5), VISOR, 0.28]],
    glow: [poly(BOLT_LIGHT, 0.8)],
    eyes: [[37.5, 55.5, 15, 10, 7], [62.5, 55.5, 15, 10, -7]]
  },
  dome: {
    label: "Dome",
    body: ["M15 57A35 35 0 0 1 85 57V78A10 10 0 0 1 75 88H25A10 10 0 0 1 15 78Z", box(47, 11, 6, 14, 3), disc(50, 10, 6.5), disc(12.5, 71, 6.5), disc(87.5, 71, 6.5)],
    paints: [["M25 61A25 25 0 0 1 75 61V65A8 8 0 0 1 67 73H33A8 8 0 0 1 25 65Z", VISOR, 0.28]],
    glow: [disc(50, 10, 3)],
    eyes: [[40, 59, 12, 14], [60, 59, 12, 14]]
  },
  cyclo: {
    label: "Cyclo",
    body: [box(18, 22, 64, 68, 26), box(9, 45, 13, 22, 6), box(78, 45, 13, 22, 6), box(47.5, 10, 5, 14, 2.5), disc(50, 9, 6.5)],
    paints: [[disc(50, 52, 19.5), VISOR, 0.3], [box(38, 77, 24, 3.6, 1.8), VISOR, 0.24]],
    glow: [disc(50, 9, 3)],
    eyes: [[50, 52, 22, 22]]
  },
  hexo: {
    label: "Hexo",
    body: [poly([[29, 27], [71, 27], [89, 58], [71, 89], [29, 89], [11, 58]], 9), rod(40, 29, 31, 12, 5), disc(30, 10, 6), rod(60, 29, 69, 12, 5), disc(70, 10, 6)],
    paints: [[box(25, 44, 50, 29, 14.5), VISOR, 0.28]],
    glow: [disc(30, 10, 2.6), disc(70, 10, 2.6)],
    eyes: [[39.5, 58.5, 12, 12], [60.5, 58.5, 12, 12]]
  },
  retro: {
    label: "Retro",
    body: [box(9, 31, 82, 56, 14), rod(43, 33, 29, 11, 4.5), disc(28, 9.5, 5.5), rod(57, 33, 71, 11, 4.5), disc(72, 9.5, 5.5), box(21, 84, 15, 8, 3.5), box(64, 84, 15, 8, 3.5)],
    paints: [[box(17, 40, 52, 39, 10), VISOR, 0.3], [disc(80, 51, 4.6), VISOR, 0.26], [disc(80, 66, 4.6), VISOR, 0.26]],
    glow: [disc(28, 9.5, 2.5), disc(72, 9.5, 2.5)],
    eyes: [[33.5, 59.5, 11, 15], [52.5, 59.5, 11, 15]]
  },
  buddy: {
    label: "Buddy",
    body: [disc(50, 57, 31), arcBand(50, 57, 34, 40, 192, 348), box(5, 45, 17, 26, 8.5), box(78, 45, 17, 26, 8.5)],
    paints: [[box(27, 44, 46, 27, 13.5), VISOR, 0.28]],
    glow: [disc(13.5, 58, 2.8), disc(86.5, 58, 2.8)],
    eyes: [[40, 57.5, 11, 14], [60, 57.5, 11, 14]]
  },
  rover: {
    label: "Rover",
    body: [box(9, 40, 82, 47, 18), box(60, 19, 7, 25, 3.5), box(51, 9, 28, 14, 7)],
    paints: [[box(17, 50, 66, 27, 13.5), VISOR, 0.28]],
    glow: [disc(71.5, 16, 3.2)],
    eyes: [[35.5, 63.5, 13, 13], [64.5, 63.5, 13, 13]]
  },
  chip: {
    label: "Chip",
    body: [box(19, 19, 62, 62, 13), ...PINS],
    paints: [[box(27, 31, 46, 31, 9), VISOR, 0.28]],
    marks: [box(42, 68.5, 16, 3.6, 1.8)],
    glow: [disc(71, 71, 2.6)],
    eyes: [[40.5, 46.5, 11, 11, 0, 2.5], [59.5, 46.5, 11, 11, 0, 2.5]]
  }
};
var PICKER_SHAPES = Object.keys(CHARACTERS);
var PICKER_COLUMNS = 6;
var DEFAULT_SHAPES = ["pixel", "orbit", "visor", "dome", "retro", "buddy", "rover", "chip"];
var FALLBACK_SHAPE = "pixel";
var MAIN_LOOK = Object.freeze({ shape: "apex", color: "red" });
var CHARACTER_COLORS = ["red", "crimson", "ember", "amber", "green", "teal", "blue", "violet", "rose", "wine", "black", "charcoal", "graphite", "steel", "silver", "snow", "blaze"];
var DEFAULT_COLORS = ["ember", "amber", "green", "teal", "blue", "violet", "rose"];
var isColor = (color) => isHex(color) || Object.hasOwn(INKS, color);
function fnv1a(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619);
  return value >>> 0;
}
function defaultColor(id) {
  const t2 = fnv1a(id) + 1831565813 | 0;
  let n = Math.imul(t2 ^ t2 >>> 15, 1 | t2);
  n = n + Math.imul(n ^ n >>> 7, 61 | n) ^ n;
  return DEFAULT_COLORS[Math.floor(((n ^ n >>> 14) >>> 0) / 4294967296 * DEFAULT_COLORS.length)];
}
function defaultShape(id) {
  let value = fnv1a(id) | 0;
  value = Math.imul(value ^ value >>> 16, 73244475);
  value = Math.imul(value ^ value >>> 13, 3266489909);
  return DEFAULT_SHAPES[((value ^ value >>> 16) >>> 0) % DEFAULT_SHAPES.length];
}
var colorOf = (bot) => isColor(bot?.color) ? bot.color : bot?.id ? defaultColor(String(bot.id)) : "black";
function lookOf(bot) {
  const avatar = bot?.avatar ?? {};
  return {
    shape: hasShape(avatar.shape) ? avatar.shape : bot?.id ? defaultShape(String(bot.id)) : FALLBACK_SHAPE,
    image: avatar.image,
    color: colorOf(bot)
  };
}
var MASK_ID = "%MASK%";
var maskBox = (size) => `maskUnits="userSpaceOnUse" x="${-size}" y="${-size}" width="${size * 3}" height="${size * 3}"`;
var holes = (def, eyes) => `<rect x="${-def.size}" y="${-def.size}" width="${def.size * 3}" height="${def.size * 3}" fill="#fff"/>${eyes}`;
var rim = (key, path, [dx, dy], fill2, opacity) => `<mask id="${MASK_ID}${key}" ${maskBox(100)}>${holes({ size: 100 }, `<path d="${path}" transform="translate(${dx} ${dy})"/>`)}</mask><path d="${path}" fill="${fill2}" fill-opacity="${opacity}" mask="url(#${MASK_ID}${key})"/>`;
var SHAPES = {};
for (const [id, character] of Object.entries(CHARACTERS)) {
  const path = character.body.join("");
  const layers = [
    ...(character.paints ?? []).map(([d, fill2, opacity]) => `<path d="${d}" fill="${fill2}" fill-opacity="${opacity}"/>`),
    rim("s", path, [-3.5, -4.5], "#000", 0.16),
    rim("l", path, [2.5, 3.5], "#fff", 0.2),
    ...(character.marks ?? []).map((d) => `<path d="${d}" fill="currentColor"/>`),
    ...(character.glow ?? []).map((d) => `<path class="bt-glow" d="${d}" fill="currentColor"/>`)
  ].join("");
  SHAPES[id] = { label: character.label ?? id[0].toUpperCase() + id.slice(1), size: 100, path, layers, eyes: character.eyes };
}
var hasShape = (id) => typeof id === "string" && Object.hasOwn(SHAPES, id);
var shapeId = (id) => hasShape(id) ? id : FALLBACK_SHAPE;
var shapeOf = (id) => SHAPES[shapeId(id)];
function bodyOf(def, paint, flat = false) {
  if (def.path) return `<path d="${def.path}" fill="${paint}"/>${flat ? "" : def.layers}`;
  try {
    return def.body(paint);
  } catch {
    return "";
  }
}
var eyeMarkup = ([cx, cy, w, h40, tilt = 0, r = Math.min(w, h40) / 2]) => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><rect class="bt-eye" x="${-w / 2}" y="${-h40 / 2}" width="${w}" height="${h40}" rx="${r}"/></g>`;
var happyEyeMarkup = ([cx, cy, w, h40, tilt = 0]) => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><path class="bt-eye-happy" opacity="0" d="M${num(-w * 0.55)} ${num(w * 0.12)}Q0 ${num(-w * 0.5)} ${num(w * 0.55)} ${num(w * 0.12)}" fill="none" stroke="currentColor" stroke-width="${num(Math.min(w, h40) * 0.42)}" stroke-linecap="round"/></g>`;
var markSerial = 0;
var nextMarkSerial = () => markSerial += 1;
var markupCache = /* @__PURE__ */ new Map();
function characterMarkup(shape, color) {
  const key = `${shape}|${color}`;
  let markup = markupCache.get(key);
  if (markup === void 0) {
    const def = shapeOf(shape);
    const eyes = `<g class="bt-gaze"><g class="bt-eyes" fill="currentColor">${def.eyes.map(eyeMarkup).join("")}${def.eyes.map(happyEyeMarkup).join("")}</g></g>`;
    const stops = GRADIENTS[color];
    const gradient = stops ? `<defs><linearGradient id="${MASK_ID}g" gradientUnits="userSpaceOnUse" x1="18" y1="10" x2="78" y2="92">${stops.map(([offset, value]) => `<stop offset="${offset}" stop-color="${value}"/>`).join("")}</linearGradient></defs>` : "";
    const inner = `${bodyOf(def, stops ? `url(#${MASK_ID}g)` : inkFill(color))}${eyes}`;
    markup = `${gradient}<g class="bt-b" style="color:${inkEye(color)}">${def.wrap ? `<g transform="${def.wrap}">${inner}</g>` : inner}</g>`;
    markupCache.set(key, markup);
  }
  return markup;
}
var svgUrl = (inner, size) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${inner}</svg>`)}")`;
var maskCache = /* @__PURE__ */ new Map();
function maskOf(shape) {
  let mask = maskCache.get(shape);
  if (mask === void 0) {
    const def = shapeOf(shape);
    const body = `<g mask="url(#e)">${bodyOf(def, "#000", true)}</g>`;
    mask = svgUrl(`<mask id="e" ${maskBox(def.size)}>${holes(def, def.eyes.map(eyeMarkup).join("").replaceAll('class="bt-eye"', 'fill="#000"'))}</mask>${def.wrap ? `<g transform="${def.wrap}">${body}</g>` : body}`, def.size);
    maskCache.set(shape, mask);
  }
  return mask;
}
var DEFAULT_MASK = maskOf(FALLBACK_SHAPE);

// src/client/sources.js
function createSource(initial) {
  let value = initial;
  const listeners2 = /* @__PURE__ */ new Set();
  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners2.add(listener);
      return () => {
        listeners2.delete(listener);
      };
    },
    set(next) {
      const resolved = typeof next === "function" ? next(value) : next;
      if (resolved === value) return;
      value = resolved;
      for (const listener of [...listeners2]) listener();
    }
  };
}
var EMPTY_ROSTER = { revision: -1, mainBotId: null, mainBotIds: [], bots: [], rooms: [], agents: [], exchangeTurns: {}, questions: {}, secrets: [], capabilities: [], capabilityStatuses: {}, secretRequests: {}, models: [], defaultModel: null, modelsKey: null, prefs: {}, byId: {}, roomsById: {}, agentsById: {}, agentOf: {}, ready: false };
var isMainOf = (roster, id) => id !== void 0 && (roster.mainBotIds ?? []).includes(id);
function indexRoster(value) {
  const byId = {};
  for (const bot of value.bots) {
    for (const id of [...bot.parts ?? [], bot.sessionId ?? bot.id, bot.id]) byId[id] = bot;
  }
  const roomsById = {};
  for (const room2 of value.rooms) roomsById[room2.id] = room2;
  const agentsById = {};
  const agentOf = {};
  for (const agent of value.agents ?? []) {
    agentsById[agent.id] = agent;
    for (const sessionId of agent.sessions ?? []) agentOf[sessionId] = agent.id;
  }
  return { ...value, agents: value.agents ?? [], byId, roomsById, agentsById, agentOf, ready: true };
}
function isAgentSession(roster, cache, sessionId) {
  if (sessionId === void 0 || sessionId === null || sessionId === "") return false;
  if (roster.ready) return roster.agentOf[sessionId] !== void 0;
  return cache.has(sessionId);
}
var heldCardKey = (kind, requestId) => JSON.stringify([kind, requestId]);
function countCards(state, sessionId, callIds, delta) {
  const own = { ...state[sessionId] };
  for (const callId of callIds) {
    const count = (own[callId] ?? 0) + delta;
    if (count > 0) own[callId] = count;
    else delete own[callId];
  }
  return { ...state, [sessionId]: own };
}

// src/client/team-actions.js
function teamActions({ call: call2, after, partFor, roster, ui: ui2, live, cards, heldCards, turnClock }) {
  const memoryOf = (id) => roster.getSnapshot().roomsById[id] ? { roomId: id } : { botId: id };
  return {
    openNewChat: (mode) => {
      ui2.set((state) => ({ ...state, newChat: mode, menu: null, palette: null }));
    },
    openPalette: (query = "") => {
      ui2.set((state) => ({ ...state, palette: { query, token: Date.now() }, newChat: null, menu: null }));
    },
    // The token keeps a late exit timer from closing a palette opened again since.
    closePalette: (token) => {
      ui2.set((state) => state.palette && (token === void 0 || state.palette.token === token) ? { ...state, palette: null } : state);
    },
    openExchange: (a, b) => {
      if (a && b) ui2.set((state) => ({ ...state, exchange: [a, b] }));
    },
    // Its own closer: the sheet's exit timer must not close what opened since.
    closeExchange: () => {
      ui2.set((state) => state.exchange ? { ...state, exchange: null } : state);
    },
    toggleDetails: (id, force) => {
      ui2.set((state) => {
        const details = force || state.details !== id || state.view !== "details" ? id : null;
        return { ...state, renaming: false, tab: null, details, view: "details" };
      });
    },
    // The open panel follows the main view; a subject with no browser (a group
    // chat, an outside Session) settles on the details view.
    followPanel: (id) => {
      ui2.set((state) => {
        if (!state.details || state.details === id) return state;
        const view = state.view === "browser" && roster.getSnapshot().byId[id] === void 0 ? "details" : state.view;
        return { ...state, details: id, view, renaming: false, tab: null };
      });
    },
    showDetails: (id, tab = null) => {
      ui2.set((state) => ({ ...state, details: id, view: "details", renaming: false, tab }));
    },
    // Opening the conversation would move focus to its composer and blur the name field.
    renameBot: (id) => {
      ui2.set((state) => ({ ...state, details: partFor(id), view: "details", renaming: true, tab: null }));
    },
    // `id` opens one Bot (page 'bots') or one group chat (page 'groups').
    openSettings: (page = "general", id = null) => {
      ui2.set((state) => ({ ...state, settings: { page, id }, menu: null, palette: null, newChat: null }));
    },
    closeSettings: () => {
      ui2.set((state) => state.settings ? { ...state, settings: null } : state);
    },
    openMemory: (id) => {
      ui2.set((state) => ({ ...state, memory: id, menu: null, palette: null }));
    },
    closeMemory: () => {
      ui2.set((state) => state.memory ? { ...state, memory: null } : state);
    },
    openConnectors: () => {
      ui2.set((state) => ({ ...state, settings: { page: "connectors", id: null }, menu: null, palette: null, newChat: null }));
    },
    openModels: () => {
      ui2.set((state) => ({ ...state, settings: { page: "models", id: null }, menu: null, palette: null, newChat: null }));
    },
    setPanelView: (view) => {
      if (view !== "details" && view !== "browser") return;
      ui2.set((state) => state.details && state.view !== view ? { ...state, view } : state);
    },
    closePanel: () => {
      ui2.set((state) => state.details ? { ...state, details: null, view: "details", renaming: false, tab: null } : state);
    },
    quote: (sessionId, text) => ui2.set((state) => ({ ...state, quote: { sessionId, text, token: Date.now() } })),
    clearQuote: (token) => ui2.set((state) => state.quote?.token === token ? { ...state, quote: null } : state),
    setFlags: (id, flags) => after(call2("set-flags", { id, ...flags })),
    deleteRoom: (id) => after(call2("delete-room", { id })),
    openMenu: (menu) => {
      ui2.set((state) => ({ ...state, menu }));
    },
    closeMenu: () => {
      ui2.set((state) => state.menu ? { ...state, menu: null } : state);
    },
    closeOverlay: () => {
      ui2.set((state) => ({ ...state, newChat: null, exchange: null, details: state.newChat || state.exchange ? state.details : null }));
    },
    createBot: (payload) => after(call2("create-bot", payload)),
    createRoom: (members, options = {}) => after(call2("create-room", { members, ...options })),
    updateBot: (id, patch) => after(call2("update-bot", { id, ...patch })),
    refreshModels: () => after(call2("models")).catch(() => {
    }),
    efforts: (ref) => call2("efforts", { ref }),
    // The engine keeps the provider routes in its settings and their keys in its credential
    // store; a key only travels from a form to the host, and never comes back.
    providers: () => call2("providers"),
    setProviderKey: (provider, value) => after(call2("provider-key", { provider, value })),
    addProvider: (body) => after(call2("provider-add", body)),
    setProviderModels: (body) => after(call2("provider-set-models", body)),
    providerModels: (body) => call2("provider-models", body),
    removeProvider: (provider) => after(call2("provider-remove", { provider })),
    folders: () => call2("folders"),
    folderPick: () => call2("folder-pick"),
    folderList: (path) => call2("folder-list", { path: path ?? "" }),
    setTeamWorkspace: (path) => after(call2("team-workspace", { path })),
    deleteBot: (id) => after(call2("delete-bot", { id })),
    clearChat: (id) => after(call2("clear-chat", { id })),
    duplicateBot: (id) => after(call2("duplicate-bot", { id })),
    setPrefs: (prefs) => after(call2("set-prefs", prefs)),
    setMain: (id, main = true, options = {}) => after(call2("set-main", { id, main, ...options })),
    updateRoom: (id, patch) => after(call2("update-room", { id, ...patch })),
    send: (sessionId, text) => after(call2("send", { sessionId: partFor(sessionId), text })),
    answerQuestion: (sessionId, questionId, answer) => after(call2("answer-question", { sessionId: partFor(sessionId), questionId, answer })),
    dismissQuestion: (sessionId) => after(call2("dismiss-question", { sessionId })),
    answerView: (sessionId, viewId, action, values) => after(call2("view-reply", { sessionId: partFor(sessionId), viewId, action, values })),
    dismissView: (sessionId) => after(call2("dismiss-view", { sessionId: partFor(sessionId) })),
    answerApproval: (id, choice) => after(call2("approval-answer", { id, choice })),
    dismissAppLink: (id) => after(call2("app-link-done", { id })),
    // Without names, every tool asks again.
    resetAllowedTools: (names) => after(call2("allowed-tools-reset", names === void 0 ? {} : { names })),
    stopMemberWork: (roomId, botId) => after(call2("stop-member-work", { roomId, botId })),
    // Values go out in these requests and never come back in a response.
    secretSet: (payload) => after(call2("secret-set", payload)),
    secretAllow: (requestId) => after(call2("secret-allow", { requestId })),
    secretCancel: (requestId) => after(call2("secret-cancel", { requestId })),
    secretUpdate: (name, scope) => after(call2("secret-update", { name, scope })),
    secretDelete: (name) => after(call2("secret-delete", { name })),
    connectorConnect: (id, token) => after(call2("connector-connect", { id, token })),
    connectorDisconnect: (id) => after(call2("connector-disconnect", { id })),
    connectorRetry: (id) => after(call2("connector-retry", { id })),
    // Apps (docs/apps.md). An answer may name the sign-in page to open: `signIn`.
    appConnect: (body) => after(call2("app-connect", body)),
    appAdd: (body) => after(call2("app-add", body)),
    appSignIn: (id) => after(call2("app-sign-in", { id })),
    appEnable: (id, enabled) => after(call2("app-enable", { id, enabled })),
    appRetry: (id) => after(call2("app-retry", { id })),
    appRemove: (id) => after(call2("app-remove", { id })),
    saveCapability: (capability) => after(call2("capability-save", capability)),
    deleteCapability: (name) => after(call2("capability-delete", { name })),
    // `updatedAt` names the version the user looked at: a Bot may have saved another since.
    approveCapability: (name, updatedAt) => after(call2("capability-approve", { name, ...updatedAt === void 0 ? {} : { updatedAt } })),
    setBotCapability: (botId, name, attached) => after(call2("bot-capability", { botId, name, attached })),
    schedules: () => call2("schedules"),
    scheduleCreate: (task) => call2("schedule-create", task),
    scheduleDelete: (sessionId, id) => call2("schedule-delete", { sessionId, id }),
    exchange: (a, b) => call2("exchange", { a, b }).catch(() => []),
    exchangeText: (id) => call2("exchange-text", { id }).catch(() => void 0),
    fileText: (file) => call2("file-text", { file }).catch(() => void 0),
    roomProgress: (roomId) => call2("room-progress", { roomId }).catch(() => []),
    earlier: (sessionId, cursor) => call2("earlier", { sessionId, cursor: cursor ?? null }),
    // Hours come back in this browser's time zone, so days start at local midnight.
    usage: () => call2("usage", { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    // `summarize` starts a summary when the entries changed; `regenerate` always does.
    memoryView: (id, flags = {}) => call2("memory-view", { ...memoryOf(id), ...flags }),
    memoryAsk: (id, text) => call2("memory-ask", { ...memoryOf(id), text }),
    memoryForget: (id, entry) => call2("memory-forget", { ...memoryOf(id), scope: entry.scope, topic: entry.topic, text: entry.text }),
    repoStars: () => call2("repo-stars"),
    // A failed action away from any form (a menu, the palette) shows as a toast.
    reportError: (error, where = "action") => {
      noteClientError(where, error);
      ui2.set((state) => ({ ...state, toast: { text: error?.message ?? String(error), token: Date.now() } }));
    },
    dismissToast: (token) => ui2.set((state) => state.toast && (token === void 0 || state.toast.token === token) ? { ...state, toast: null } : state),
    noteTurnTime: (sessionId, turn, key, time) => {
      if (sessionId === void 0 || !Number.isFinite(turn) || !Number.isFinite(time)) return;
      turnClock.set((state) => {
        const turns = state[sessionId] ?? {};
        const entry = turns[turn] ?? {};
        const next = key === "first" && entry.first !== void 0 ? Math.min(entry.first, time) : time;
        if (entry[key] === next) return state;
        return { ...state, [sessionId]: { ...turns, [turn]: { ...entry, [key]: next } } };
      });
    },
    noteTurnPeer: (sessionId, turn, peerId) => {
      if (sessionId === void 0 || !Number.isFinite(turn)) return;
      turnClock.set((state) => {
        const turns = state[sessionId] ?? {};
        const entry = turns[turn] ?? {};
        if (entry.peer === peerId) return state;
        return { ...state, [sessionId]: { ...turns, [turn]: { ...entry, peer: peerId } } };
      });
    },
    noteLive: (sessionId, id, entry) => {
      if (sessionId === void 0) return;
      live.set((state) => {
        const own = state[sessionId] ?? {};
        const prev = own[id];
        if (entry === null ? prev === void 0 : prev !== void 0 && JSON.stringify({ ...prev, at: 0 }) === JSON.stringify({ ...entry, at: 0 })) return state;
        const next = { ...own };
        if (entry === null) delete next[id];
        else next[id] = { ...entry, at: prev?.at ?? Date.now() };
        return { ...state, [sessionId]: next };
      });
    },
    noteCards: (sessionId, callIds, delta) => {
      if (sessionId !== void 0) cards.set((state) => countCards(state, sessionId, callIds, delta));
    },
    noteHeldCard: (sessionId, kind, requestId, delta) => {
      if (sessionId !== void 0) heldCards.set((state) => countCards(state, sessionId, [heldCardKey(kind, requestId)], delta));
    },
    clearLive: (sessionId) => live.set((state) => {
      if (!state[sessionId]) return state;
      const next = { ...state };
      delete next[sessionId];
      return next;
    })
  };
}

// src/client/themes.js
var THEME_KEYS = ["bg", "sidebar", "bubble", "card", "text", "user", "userText", "accent"];
var DEFAULT_THEME = "apmix";
var THEMES = {
  apmix: {
    label: "ApmixBot",
    light: { bg: "#ffffff", sidebar: "#f5f5f6", bubble: "#f1f1f2", card: "#ffffff", text: "#111112", user: "#d91c2a", userText: "#ffffff", accent: "#e5202e" },
    dark: { bg: "#0c0c0d", sidebar: "#141416", bubble: "#232326", card: "#1a1a1c", text: "#f4f4f5", user: "#d91c2a", userText: "#ffffff", accent: "#e5202e" }
  },
  mono: {
    label: "Mono",
    light: { bg: "#ffffff", sidebar: "#f9f9f9", bubble: "#f0f0f0", card: "#ffffff", text: "#0d0d0d", user: "#0d0d0d", userText: "#ffffff", accent: "#0d0d0d" },
    dark: { bg: "#0f0f0f", sidebar: "#171717", bubble: "#242424", card: "#1c1c1c", text: "#f4f4f4", user: "#f4f4f4", userText: "#0f0f0f", accent: "#f4f4f4" }
  },
  paper: {
    label: "Paper",
    light: { bg: "#faf9f5", sidebar: "#f3f0e8", bubble: "#ebe7dc", card: "#ffffff", text: "#1f1e1b", user: "#2b2a26", userText: "#faf9f5", accent: "#d97757" },
    dark: { bg: "#1f1e1b", sidebar: "#262521", bubble: "#34322d", card: "#2a2925", text: "#f3f0e8", user: "#f3f0e8", userText: "#1f1e1b", accent: "#e08a6d" }
  }
};
var DARK_INK = "#141414";
var accentInk = (accent) => (luminance(accent) + 0.05) ** 2 > 1.05 * (luminance(DARK_INK) + 0.05) ? DARK_INK : "#ffffff";
var rgba = (hex, alpha) => `rgba(${[1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(",")},${alpha})`;
function themeVars(mode, dark, accent = mode.accent) {
  return {
    "--bt-ink": mode.text,
    "--bt-ink-2": rgba(mode.text, 0.6),
    "--bt-ink-3": rgba(mode.text, 0.36),
    "--bt-bubble": mode.bubble,
    "--bt-sidebar": mode.sidebar,
    "--bt-main": mode.bg,
    "--bt-card": mode.card,
    "--bt-line": rgba(mode.text, 0.08),
    "--bt-line-2": rgba(mode.text, 0.15),
    "--bt-hover": dark ? "rgba(160,160,160,.12)" : "rgba(119,119,119,.09)",
    "--bt-active": dark ? "rgba(160,160,160,.2)" : "rgba(119,119,119,.17)",
    "--bt-accent": accent,
    "--bt-accent-ink": accentInk(accent),
    "--bt-user": mode.user,
    "--bt-user-ink": mode.userText,
    "--bt-tag-bg": rgba(mode.text, dark ? 0.09 : 0.06),
    "--bt-tag-ink": rgba(mode.text, 0.58)
  };
}
var declarations = (vars) => Object.entries(vars).map(([name, value]) => `${name}:${value}`).join(";");
var darkAccent = (accent) => {
  const ink = ACCENT_INKS.find((id) => INKS[id][0] === accent);
  return ink === void 0 ? accent : INKS[ink][1];
};
var themeCss = (theme, accent) => `html body{${declarations(themeVars(theme.light, false, accent ?? theme.light.accent))}}
html body[data-ds-dark-theme]{${declarations(themeVars(theme.dark, true, darkAccent(accent) ?? theme.dark.accent))}}
${theme.css ?? ""}`;
var shellTokens = ({ light, dark }) => ({
  "--dsw-alias-bg-base": { light: light.bg, dark: dark.bg },
  "--dsw-specific-sidebar-fill": { light: light.sidebar, dark: dark.sidebar },
  "--dsw-specific-input-major": { light: light.bg, dark: dark.sidebar },
  "--dsw-alias-label-primary": { light: light.text, dark: dark.text },
  "--dsw-alias-label-secondary": { light: rgba(light.text, 0.74), dark: rgba(dark.text, 0.74) },
  "--dsw-alias-label-tertiary": { light: rgba(light.text, 0.6), dark: rgba(dark.text, 0.6) }
});
var customThemes = {};
var registry = createSource(0);
var isPoint = (point) => Array.isArray(point) && point.length === 2 && point.every(Number.isFinite);
function registerShape(id, shape) {
  if (typeof id !== "string" || !/^[a-z][\w-]{0,31}$/.test(id)) throw new Error("Shape ids are lowercase words");
  if (typeof shape?.body !== "function" || typeof shape.body("#000") !== "string") throw new Error("A shape needs body(paint) returning SVG markup");
  const at2 = shape.eyes?.at;
  if (!Array.isArray(at2) || at2.length !== 2 || !at2.every(isPoint)) throw new Error("A shape needs eyes.at: two [x, y] points");
  const size = Number.isFinite(shape.size) && shape.size > 0 ? shape.size : 100;
  const pick = (key, fallback) => Number.isFinite(shape.eyes[key]) ? shape.eyes[key] : fallback;
  const eyes = at2.map(([x, y]) => [x, y, pick("w", size * 0.1), pick("h", size * 0.23), pick("tilt", -27)]);
  const previous = SHAPES[id];
  SHAPES[id] = {
    label: String(shape.label ?? id),
    size,
    body: shape.body,
    eyes,
    ...typeof shape.wrap === "string" ? { wrap: shape.wrap } : {}
  };
  const refresh = () => {
    markupCache.clear();
    maskCache.delete(id);
    registry.set((value) => value + 1);
  };
  refresh();
  return () => {
    if (previous) SHAPES[id] = previous;
    else delete SHAPES[id];
    refresh();
  };
}
function registerTheme(id, theme) {
  if (typeof id !== "string" || !/^[a-z][\w-]{0,31}$/.test(id)) throw new Error("Theme ids are lowercase words");
  for (const mode of ["light", "dark"]) {
    for (const key of THEME_KEYS) if (!isHex(theme?.[mode]?.[key])) throw new Error(`Theme ${mode}.${key} must be a #rrggbb color`);
  }
  const previous = customThemes[id];
  customThemes[id] = { label: String(theme.label ?? id), light: theme.light, dark: theme.dark, css: typeof theme.css === "string" ? theme.css : "" };
  registry.set((value) => value + 1);
  return () => {
    if (previous) customThemes[id] = previous;
    else delete customThemes[id];
    registry.set((value) => value + 1);
  };
}
var allThemes = () => ({ ...THEMES, ...customThemes });

// src/shared/mentions.js
var ALL_WORDS = ["all", "everyone"];
var USER_NAMES = ["user", "you"];
var speakerOf = (line) => line.botId !== void 0 && USER_NAMES.includes(String(line.who ?? "").trim().toLowerCase()) ? `Bot "${line.who}"` : line.who;
var NAME_GOES_ON = /^(?:[a-z0-9_\-/\\]|\.[a-z0-9_-])/i;
var ADDRESS_BEFORE = /[a-z0-9_./]/i;
var LITERAL = /```[\s\S]*?(?:```|$)|`[^`\n]*`|\[[^\]\n]*\]\([^)\s]*(?:\s+(?:"[^"\n]*"|'[^'\n]*'))?\)/g;
var fitsAt = (text, at2, word) => text.slice(at2, at2 + word.length).toLowerCase() === word.toLowerCase() && !NAME_GOES_ON.test(text.slice(at2 + word.length));
var overlaps = (spans, start, end) => spans.some((span) => start < span.end && span.start < end);
function nameProblem(name) {
  const text = String(name ?? "").trim();
  if (text === "") return "A Bot needs a name";
  if (/[@`\r\n]/.test(text)) return "A Bot name cannot contain @, ` or a line break";
  if (ALL_WORDS.includes(text.toLowerCase())) return `"${text}" calls everyone in a group, so it cannot be a Bot name`;
  if (USER_NAMES.includes(text.toLowerCase())) return `"${text}" stands for the user in a chat, so it cannot be a Bot name`;
  return void 0;
}
function referenceSpans(text, labels = []) {
  const spans = [];
  for (const label of [...labels].sort((a, b) => b.length - a.length)) {
    const mention = `@${label}`;
    for (let at2 = text.indexOf(mention); at2 !== -1; at2 = text.indexOf(mention, at2 + 1)) {
      const end = at2 + mention.length;
      if (at2 > 0 && ADDRESS_BEFORE.test(text[at2 - 1]) || NAME_GOES_ON.test(text.slice(end)) || overlaps(spans, at2, end)) continue;
      spans.push({ start: at2, end, label });
      break;
    }
  }
  return spans.sort((a, b) => a.start - b.start);
}
function mentionSpans(text, bots, { references = [] } = {}) {
  const value = String(text ?? "");
  const skip = [
    ...[...value.matchAll(LITERAL)].map((match) => ({ start: match.index, end: match.index + match[0].length })),
    ...referenceSpans(value, references)
  ];
  const byLength = bots.filter((bot) => bot?.name).sort((a, b) => b.name.length - a.name.length);
  const spans = [];
  for (let at2 = value.indexOf("@"); at2 !== -1; at2 = value.indexOf("@", at2 + 1)) {
    if (at2 > 0 && ADDRESS_BEFORE.test(value[at2 - 1]) || overlaps(skip, at2, at2 + 1)) continue;
    const bot = byLength.find((candidate) => fitsAt(value, at2 + 1, candidate.name));
    const all = bot ? void 0 : ALL_WORDS.find((word) => fitsAt(value, at2 + 1, word));
    if (!bot && !all) continue;
    const end = at2 + 1 + (bot ? bot.name.length : all.length);
    spans.push(bot ? { start: at2, end, bot } : { start: at2, end, all: true });
    at2 = end - 1;
  }
  return spans;
}

// src/client/text.js
var MENTION_ORIGIN = "https://bots.local/";
function linkMentions(text, bots, selfId) {
  if (!text || !text.includes("@")) return text;
  let out = "";
  let cursor = 0;
  for (const span of mentionSpans(text, bots)) {
    if (!span.bot || span.bot.id === selfId) continue;
    out += `${text.slice(cursor, span.start)}[${text.slice(span.start + 1, span.end).replace(/[[\]\\]/g, "\\$&")}](${MENTION_ORIGIN}${span.bot.id})`;
    cursor = span.end;
  }
  return cursor === 0 ? text : out + text.slice(cursor);
}
function mentionTarget(event) {
  const anchor = event.target instanceof Element ? event.target.closest(`a[href^="${MENTION_ORIGIN}"]`) : null;
  return anchor ? anchor.getAttribute("href").slice(MENTION_ORIGIN.length) : null;
}
function clock(ms) {
  return new Date(ms).toLocaleTimeString(dateLocale(), { hour: "numeric", minute: "2-digit" });
}
var midnight = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
var daysBefore = (date, now) => Math.round((midnight(new Date(now)) - midnight(date)) / 864e5);
function dayLabel(ms) {
  const date = new Date(ms);
  const today = /* @__PURE__ */ new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay ? t("Today {time}", { time: clock(ms) }) : `${date.toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric" })} ${clock(ms)}`;
}
function clockLabel(time, now = Date.now()) {
  const date = new Date(time);
  const days = daysBefore(date, now);
  const stamp = clock(time);
  if (days === 0) return t("Today {time}", { time: stamp });
  if (days === 1) return t("Yesterday {time}", { time: stamp });
  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return `${date.toLocaleDateString(dateLocale(), { weekday: "short", month: "short", day: "numeric", ...sameYear ? {} : { year: "numeric" } })} ${stamp}`;
}
function messageClock(time, now = Date.now()) {
  return daysBefore(new Date(time), now) === 0 ? clock(time) : clockLabel(time, now);
}
function relativeShort(ms) {
  const diff = Math.max(0, Date.now() - ms);
  if (diff < 6e4) return t("just now");
  if (diff < 36e5) return t("{n} min", { n: Math.floor(diff / 6e4) });
  if (diff < 864e5) return t("{n} h", { n: Math.floor(diff / 36e5) });
  if (diff < 30 * 864e5) return t("{n} d", { n: Math.floor(diff / 864e5) });
  return new Date(ms).toLocaleDateString(dateLocale(), { month: "short", day: "numeric" });
}
function elapsedLabel(ms) {
  const total = Math.max(0, Math.floor(ms / 1e3));
  const hours = Math.floor(total / 3600);
  return `${hours > 0 ? `${hours}h ` : ""}${total >= 60 ? `${Math.floor(total / 60) % 60}m ` : ""}${total % 60}s`;
}
var contentText = (content) => (content ?? []).filter((block) => block?.type === "text").map((block) => block.text).join("\n");
var HEADER = /^\[(Message from|Reply from|Group chat|Group post from|Bot team setup|Handoff · part|Secret card)(?:[^\r\n]*\]\r?\n|[^\]\r\n]*\])/;
var currentPart = (bot) => bot.sessionId ?? bot.id;
function reminderPrompts(text) {
  const one = /^reminder_prompt_json: (.*)$/m.exec(text);
  const batch = /^reminders_json: (.*)$/m.exec(text);
  try {
    const prompts = [...one ? [JSON.parse(one[1])] : [], ...batch ? JSON.parse(batch[1]).map((entry) => entry.reminder_prompt) : []];
    return prompts.filter((prompt) => typeof prompt === "string" && prompt.trim() !== "");
  } catch {
    return [];
  }
}
var stripHeader = (text) => text.replace(HEADER, "");
function latestMemoryChange(news, ids) {
  const at2 = (id) => news?.[id]?.seen ? news[id].at ?? 0 : 0;
  return ids.reduce((best, id) => at2(id) > at2(best) ? id : best, ids[0] ?? null);
}
function summaryBlocks(text) {
  const blocks = [];
  let paragraph = [];
  const flush = () => {
    if (paragraph.length > 0) blocks.push({ kind: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  for (const raw of String(text ?? "").split("\n")) {
    const line = raw.trim().replace(/\*\*|__/g, "");
    const heading = /^#{1,6}\s+(.+)$/.exec(line);
    if (heading) {
      flush();
      blocks.push({ kind: "h", text: heading[1].trim() });
    } else if (line === "") {
      flush();
    } else {
      paragraph.push(line.replace(/^[-*•]\s+/, ""));
    }
  }
  flush();
  return blocks;
}
function isHiddenTurn(roster, sessionId, turn) {
  if (sessionId === void 0 || turn === void 0) return false;
  return (roster.exchangeTurns[sessionId] ?? []).includes(turn);
}
var toolName = (root) => root.name || root.call?.name;
function toolArgs(root) {
  if (typeof root.args?.text === "function") {
    return { text: (key) => root.args.text(key) ?? void 0, value: (key) => typeof root.args.value === "function" ? root.args.value(key) : void 0 };
  }
  let parsed;
  const object = () => {
    if (parsed === void 0) {
      try {
        parsed = JSON.parse(root.argsRaw ?? root.call?.argsRaw ?? "");
      } catch {
        parsed = null;
      }
      if (typeof parsed !== "object" || Array.isArray(parsed)) parsed = null;
    }
    return parsed;
  };
  return {
    text: (key) => {
      const value = object()?.[key];
      return typeof value === "string" ? value : void 0;
    },
    value: (key) => object()?.[key]
  };
}
var RELAY_ROLES = /* @__PURE__ */ new Set(["request", "reply", "stopped"]);
var isRelayContext = (data) => {
  const source = data?.source;
  if (source === null || typeof source !== "object" || source.kind !== "bot" || source.handoff === true) return false;
  if (source.deferred === true || source.resumed === true || source.retried === true) return false;
  return RELAY_ROLES.has(source.role) && typeof source.senderSessionId === "string";
};
var stepShows = (step) => (step?.blocks ?? []).some((block) => {
  if (block === void 0 || block.kind === "tool-call") return false;
  return block.kind === "text" || block.kind === "reasoning" ? String(block.text ?? "").trim() !== "" : true;
});
var stepHasReasoning = (step) => (step?.blocks ?? []).some((block) => block?.kind === "reasoning" && String(block.text ?? "").trim() !== "");
var relayPart = (data, groupPart) => groupPart === void 0 || (stepHasReasoning(data) ? groupPart === "reasoning" : groupPart === "response");
function relaysBefore(contexts, steps, step) {
  const index = steps.findIndex((entry) => entry?.step === step?.step);
  if (index === -1) return [];
  let prev = -Infinity;
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    if (stepShows(steps[cursor])) {
      prev = steps[cursor].time;
      break;
    }
  }
  return (contexts ?? []).filter((data) => isRelayContext(data) && typeof data.time === "number" && data.time >= prev && data.time < step.time);
}
function commRunOf(order, peers, turn, hiddenTurns = []) {
  const turns = [];
  for (const entry of order) {
    const peer = peers[entry];
    const hidden = hiddenTurns.includes(entry);
    if (hidden && peer === void 0) continue;
    turns.push({ turn: entry, peer, hidden });
  }
  const at2 = turns.findIndex((entry) => entry.turn === turn);
  if (at2 === -1 || turns[at2].peer === void 0) return null;
  const previous = turns[at2 - 1];
  if (previous?.peer !== void 0 && previous.hidden) return "folded";
  let count = 0;
  const peerIds = [];
  for (let index = at2; index < turns.length; index += 1) {
    const entry = turns[index];
    if (entry.peer === void 0 || index > at2 && !turns[index - 1].hidden) break;
    count += entry.hidden ? 2 : 1;
    if (!peerIds.includes(entry.peer)) peerIds.push(entry.peer);
  }
  return { count, peerIds };
}
function previewOf(list, id, hiddenTurns = []) {
  const outline = list.projectionsBySession?.[id]?.values?.turnOutline ?? list.byId[id]?.projectionValues?.turnOutline;
  if (!Array.isArray(outline)) return "";
  for (let index = outline.length - 1; index >= 0; index -= 1) {
    const entry = outline[index];
    if (hiddenTurns.includes(entry.turn)) continue;
    const text = entry.response || entry.prompt || "";
    if (text !== "") return stripHeader(text).replace(/\s+/g, " ").trim();
  }
  return "";
}
var formatTokens = (count) => count >= 1e6 ? `${(count / 1e6).toFixed(1)}M` : count >= 1e3 ? `${(count / 1e3).toFixed(1)}K` : String(count);
function usageOf(list, ids) {
  let input = 0;
  let cacheRead = 0;
  let output = 0;
  for (const id of ids) {
    const usage = list.projectionsBySession?.[id]?.values?.tokenUsage;
    if (!usage) continue;
    input += (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
    cacheRead += usage.cacheReadTokens ?? 0;
    output += usage.outputTokens ?? 0;
  }
  if (input + output === 0) return "";
  const hit = input > 0 ? Math.round(cacheRead / input * 100) : 0;
  return t("{tokens} tok · Cache hit {hit}%", { tokens: formatTokens(input + output), hit });
}
function percentText(part, whole) {
  if (part >= whole) return "100";
  for (let places = 0; places < 3; places += 1) {
    const text = (part / whole * 100).toFixed(places);
    if (Number(text) < 100) return text;
  }
  return "99.99";
}
function runStatsOf(values) {
  const stats = values?.sessionStats;
  const usage = values?.tokenUsage;
  const pressure = values?.contextPressure;
  const shown = [];
  if (stats?.turns > 0) shown.push({ key: "turns", text: stats.turns === 1 ? t("1 turn") : t("{count} turns", { count: stats.turns }) });
  if (stats?.decodeMs > 0 && stats.decodeTokens > 0) {
    const speed = stats.decodeTokens / (stats.decodeMs / 1e3);
    shown.push({ key: "speed", text: t("{speed} tok/s", { speed: speed >= 10 ? Math.round(speed) : Math.round(speed * 10) / 10 }) });
  }
  const prompt = (usage?.uncachedInputTokens ?? 0) + (usage?.cacheReadTokens ?? 0) + (usage?.cacheWriteTokens ?? 0);
  if (prompt > 0) shown.push({ key: "cache", text: t("Cache hit {hit}%", { hit: percentText(usage.cacheReadTokens ?? 0, prompt) }) });
  const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
  if (Number.isFinite(used) && pressure.contextWindow > 0) {
    shown.push({
      key: "context",
      text: t("Context {percent}%", { percent: Math.min(100, Math.round(used / pressure.contextWindow * 100)) }),
      title: t("{used} of {total} tokens of context in use", { used: formatTokens(used), total: formatTokens(pressure.contextWindow) })
    });
  }
  return shown;
}

// src/client/motion.js
var import_react = require("react");
var reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
function springEasing(stiffness, damping) {
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * w0);
  const at2 = (t2) => {
    if (zeta >= 1) return 1 - (1 + w0 * t2) * Math.exp(-w0 * t2);
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t2) * (Math.cos(wd * t2) + zeta * w0 / wd * Math.sin(wd * t2));
  };
  let end = 0.05;
  while (end < 2 && Math.abs(1 - at2(end)) > 1e-3) end += 0.01;
  const points = Array.from({ length: 25 }, (_, index) => (index === 24 ? 1 : at2(end * index / 24)).toFixed(4));
  return { duration: Math.round(end * 1e3), easing: `linear(${points.join(",")})`, stiffness, damping };
}
var SPRING_SHAPE = springEasing(400, 31.2);
var SPRING_TAP = springEasing(900, 48);
var SPRING_LIST = springEasing(484, 35.2);
var SPRING_STRETCH = springEasing(320, 20);
var SPRING_POP = springEasing(500, 22);
var SPRING_LEAD = springEasing(784, 48.2);
var SPRING_TRAIL = springEasing(289, 29.2);
var QUICK_EDGES = { lead: springEasing(900, 51), trail: springEasing(400, 34) };
var spring = (curve, ...properties) => properties.map((property) => `${property} ${curve.duration}ms ${curve.easing}`).join(",");
function liveSprings(apply2) {
  const values = /* @__PURE__ */ new Map();
  let frame = 0;
  let last = 0;
  const read = () => Object.fromEntries([...values].map(([key, value]) => [key, value.x]));
  const step = (now) => {
    const dt = Math.min(0.5, Math.max(1e-3, (now - last) / 1e3));
    last = now;
    const steps = Math.ceil(dt * 240);
    const h40 = dt / steps;
    let moving = false;
    for (const value of values.values()) {
      for (let index = 0; index < steps; index += 1) {
        value.v += (-value.k * (value.x - value.to) - value.c * value.v) * h40;
        value.x += value.v * h40;
      }
      if (Math.abs(value.x - value.to) < 0.05 && Math.abs(value.v) < 1) {
        value.x = value.to;
        value.v = 0;
      } else moving = true;
    }
    apply2(read());
    frame = moving ? requestAnimationFrame(step) : 0;
  };
  return {
    target: () => values.size ? Object.fromEntries([...values].map(([key, value]) => [key, value.to])) : null,
    set(targets, curves, jump) {
      for (const [key, to] of Object.entries(targets)) {
        const value = values.get(key);
        const { stiffness: k, damping: c } = curves[key];
        if (!value || jump) values.set(key, { x: to, v: 0, to, k, c });
        else Object.assign(value, { to, k, c });
      }
      if (jump) {
        cancelAnimationFrame(frame);
        frame = 0;
        apply2(read());
        return;
      }
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(step);
      }
    },
    stop: () => cancelAnimationFrame(frame)
  };
}
var CHOSEN = '[aria-pressed="true"],[aria-selected="true"],[aria-current="page"]';
function useGlide(key, { axis = "x", selector = CHOSEN, lead = SPRING_LEAD, trail = SPRING_TRAIL, box: given } = {}) {
  const ownBox = (0, import_react.useRef)(null);
  const box2 = given ?? ownBox;
  const thumb = (0, import_react.useRef)(null);
  const own = (0, import_react.useRef)(null);
  if (own.current === null) {
    own.current = {
      key: void 0,
      node: null,
      observer: null,
      springs: liveSprings(({ start, end }) => {
        const knob = thumb.current;
        if (!knob) return;
        knob.style.transform = axis === "x" ? `translateX(${start}px)` : `translateY(${start}px)`;
        knob.style[axis === "x" ? "width" : "height"] = `${Math.max(0, end - start)}px`;
      })
    };
  }
  const place = (jump) => {
    const container = box2.current;
    const knob = thumb.current;
    if (!container || !knob) return;
    const chosen = container.querySelector(selector);
    if (!chosen) {
      knob.dataset.hidden = "";
      return;
    }
    const start = axis === "x" ? chosen.offsetLeft : chosen.offsetTop;
    const end = start + (axis === "x" ? chosen.offsetWidth : chosen.offsetHeight);
    const { springs } = own.current;
    const before = springs.target();
    const hidden = knob.dataset.hidden !== void 0;
    if (jump && !hidden && before?.start === start && before?.end === end && container.dataset.glide !== void 0) return;
    delete knob.dataset.hidden;
    const forward = before === null || start >= before.start;
    springs.set({ start, end }, forward ? { start: trail, end: lead } : { start: lead, end: trail }, jump || hidden || before === null || reducedMotion());
    container.dataset.glide = "";
  };
  (0, import_react.useLayoutEffect)(() => {
    const state = own.current;
    const node = box2.current;
    if (node === state.node && key === state.key) return;
    const fresh = node !== state.node;
    state.key = key;
    if (fresh) {
      state.observer?.disconnect();
      state.node = node;
      state.observer = node && typeof ResizeObserver === "function" ? new ResizeObserver(() => place(true)) : null;
      state.observer?.observe(node);
    }
    place(fresh);
  });
  (0, import_react.useEffect)(() => () => {
    own.current.observer?.disconnect();
    own.current.springs.stop();
  }, []);
  return { box: box2, thumb };
}
function Segmented({ label, value, className, children }) {
  const glide = useGlide(value);
  return (0, import_react.createElement)(
    "div",
    { ref: glide.box, className: className ? `bt-seg ${className}` : "bt-seg", role: "group", "aria-label": label },
    (0, import_react.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
    children
  );
}
function useFlip(list, key, selector, id = (node) => node.dataset.flip) {
  const tops = (0, import_react.useRef)(null);
  (0, import_react.useLayoutEffect)(() => {
    const container = list.current;
    if (!container) return;
    const next = /* @__PURE__ */ new Map();
    const moving = tops.current !== null && !reducedMotion();
    for (const node of container.querySelectorAll(selector)) {
      const name = id(node);
      const top = node.offsetTop;
      next.set(name, top);
      if (!moving) continue;
      const before = tops.current.get(name);
      if (before === void 0) {
        node.animate([{ opacity: 0, filter: "blur(4px)" }, { opacity: 1, filter: "blur(0)" }], { duration: 180, easing: "ease-out" });
      } else if (Math.abs(before - top) > 0.5) {
        node.animate([{ transform: `translateY(${before - top}px)` }, { transform: "none" }], { duration: SPRING_LIST.duration, easing: SPRING_LIST.easing });
      }
    }
    tops.current = next;
  }, [key]);
}
function useMorph(box2, key) {
  const last = (0, import_react.useRef)({ key, height: null, node: null, observer: null });
  (0, import_react.useLayoutEffect)(() => {
    const node = box2.current;
    const state = last.current;
    if (node !== state.node) {
      state.observer?.disconnect();
      Object.assign(state, { key, height: null, node, observer: null });
      if (!node || typeof ResizeObserver !== "function") return;
      state.observer = new ResizeObserver(([entry]) => {
        if (node.dataset.morph === void 0) state.height = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      });
      state.observer.observe(node);
      return;
    }
    if (!node || key === state.key) return;
    const running = node.getAnimations().filter((animation2) => animation2.id === "bt-morph");
    const from = running.length ? node.offsetHeight : state.height;
    for (const animation2 of running) animation2.cancel();
    const to = node.offsetHeight;
    Object.assign(state, { key, height: to });
    if (from === null || Math.abs(from - to) < 1 || reducedMotion()) return;
    node.dataset.morph = "";
    const animation = node.animate([{ height: `${from}px` }, { height: `${to}px` }], { duration: SPRING_SHAPE.duration, easing: SPRING_SHAPE.easing, id: "bt-morph" });
    animation.onfinish = () => {
      delete node.dataset.morph;
    };
    animation.oncancel = () => {
      if (!node.getAnimations().some((other) => other.id === "bt-morph" && other !== animation)) delete node.dataset.morph;
    };
  });
  (0, import_react.useEffect)(() => () => last.current.observer?.disconnect(), []);
}
function useLinger(value, ms) {
  const [kept, setKept] = (0, import_react.useState)(value);
  (0, import_react.useEffect)(() => {
    if (value) {
      setKept(value);
      return void 0;
    }
    const timer = setTimeout(() => setKept(value), reducedMotion() ? 0 : ms);
    return () => clearTimeout(timer);
  }, [value]);
  return [value || kept, !value && Boolean(kept)];
}

// src/client/styles.js
var SKIN_FOOT = ':is(div,footer):not([class*="_footArea"]):has(> div > [data-slot="sidebar.footer.action"] > .bt-connect-wrap)';
var SHELL_CSS = `
body{--bt-ink:#111112;--bt-danger:#e02135;--bt-ink-2:rgba(17,17,18,.6);--bt-ink-3:rgba(17,17,18,.36);--bt-bubble:#f1f1f2;--bt-sidebar:#f5f5f6;--bt-main:#ffffff;--bt-line:rgba(17,17,18,.08);--bt-line-2:rgba(17,17,18,.15);--bt-line-weak:rgba(17,17,18,.1);--bt-hover:rgba(119,119,119,.09);--bt-active:rgba(119,119,119,.17);--bt-card:#ffffff;--bt-accent:#e5202e;--bt-green:#00c972;--bt-star:#ff9800;--bt-user:#d91c2a;--bt-user-ink:#ffffff;--bt-tag-bg:rgba(17,17,18,.06);--bt-tag-ink:rgba(17,17,18,.56);--bt-logo-tile:#ffffff}
body[data-ds-dark-theme]{--bt-ink:#f4f4f5;--bt-ink-2:rgba(244,244,245,.6);--bt-ink-3:rgba(244,244,245,.36);--bt-bubble:#232326;--bt-sidebar:#141416;--bt-main:#0c0c0d;--bt-line:rgba(255,255,255,.08);--bt-line-2:rgba(255,255,255,.15);--bt-line-weak:rgba(255,255,255,.1);--bt-hover:rgba(160,160,160,.12);--bt-active:rgba(160,160,160,.2);--bt-card:#1a1a1c;--bt-user:#d91c2a;--bt-user-ink:#ffffff;--bt-tag-bg:rgba(255,255,255,.09);--bt-tag-ink:rgba(244,244,245,.62)}
${Object.entries(INKS).map(([name, [light]]) => `body{--bt-ink-${name}:${light};--bt-eye-${name}:${eyeOn(light)}}`).join("")}
${Object.entries(INKS).map(([name, [, dark]]) => `body[data-ds-dark-theme]{--bt-ink-${name}:${dark};--bt-eye-${name}:${eyeOn(dark)}}`).join("")}
.bt-mark{display:inline-block;flex:none;position:relative;line-height:0}
.bt-mark svg{width:100%;height:100%;overflow:visible}
.bt-mark-img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;box-shadow:inset 0 0 0 1px var(--bt-line)}
.bt-mark .bt-b,.bt-mark .bt-eye,.bt-mark .bt-eyes,.bt-mark .bt-gaze,.bt-mark .bt-glow{transform-box:fill-box}
.bt-mark .bt-b{transform-origin:50% 100%}
.bt-mark .bt-eye,.bt-mark .bt-eyes,.bt-mark .bt-glow{transform-origin:center}
/* Motion levels (Settings → Bots → Animation) set body[data-bt-motion]: quiet moves a
   mark only for its state; normal, the default, adds petting, pokes and eyes that follow
   the pointer; lively adds blinks and fidgets at rest and a question riding on the head. */
/* A live robot's antenna lights breathe at rest; each Bot keeps its own beat. */
body:not([data-bt-motion=quiet]) .bt-mark[data-live] .bt-glow{animation:bt-glow 2.8s ease-in-out var(--bt-delay,0s) infinite}
body[data-bt-motion=lively] .bt-mark[data-live]:is([data-state=idle],[data-state=alert]) .bt-eye{animation:bt-blink-idle 5s linear infinite;animation-delay:var(--bt-delay,0s)}
body[data-bt-motion=lively] .bt-mark[data-live][data-state=idle]:is([data-fidget=tilt],[data-fidget=beep],[data-fidget=bounce]) :is(.bt-b,.bt-mark-img){animation:var(--bt-fidget) 9s ease-in-out var(--bt-fidget-delay,0s) infinite}
body[data-bt-motion=lively] .bt-mark[data-live][data-state=idle][data-fidget=tilt]{--bt-fidget:bt-fidget-tilt}
body[data-bt-motion=lively] .bt-mark[data-live][data-state=idle][data-fidget=beep]{--bt-fidget:bt-fidget-beep}
body[data-bt-motion=lively] .bt-mark[data-live][data-state=idle][data-fidget=bounce]{--bt-fidget:bt-fidget-bounce}
body[data-bt-motion=lively] .bt-mark[data-live][data-state=idle][data-fidget=scan] .bt-eyes{animation:bt-fidget-scan 9s ease-in-out var(--bt-fidget-delay,0s) infinite}
@keyframes bt-fidget-tilt{0%,13%,100%{transform:none}3%,9%{transform:rotate(-9deg)}11%{transform:rotate(2deg)}}
@keyframes bt-fidget-beep{0%,9%,100%{transform:none}2%{transform:translateY(-7%)}4%{transform:none}6%{transform:translateY(-4%)}8%{transform:none}}
@keyframes bt-fidget-bounce{0%,9%,100%{transform:none}3%{transform:scale(1.07,.9)}6%{transform:translateY(-9%) scale(.95,1.06)}}
@keyframes bt-fidget-scan{0%,24%,100%{transform:none}4%,10%{transform:translateX(-16%)}14%,20%{transform:translateX(16%)}}
@keyframes bt-glow{0%,100%{opacity:1}50%{opacity:.35}}
body[data-bt-motion=lively] .bt-badge-alert{right:auto;bottom:auto;left:50%;top:calc(var(--bt-size,36px) * -.14);translate:-50% 0;animation:bt-q-ride 1.3s cubic-bezier(.3,.7,.4,1) infinite}
body[data-bt-motion=lively] :is(.bt-row,.bt-tile)>.bt-mark:hover .bt-badge-alert{animation:none}
@keyframes bt-q-ride{0%,55%,100%{transform:translateY(0)}20%{transform:translateY(calc(var(--bt-size,36px) * -.14))}40%{transform:translateY(0)}}
/* Petting: with the pointer on a sidebar avatar or just around it (a ring a fifth of its
   size wide), a resting mark leans into the pointer and keeps nuzzling it, its eyes
   closed in a happy arc, and springs back when the pointer leaves. */
:is(.bt-row,.bt-tile)>:is(.bt-mark,.bt-cluster)::before{content:'';position:absolute;inset:-20%;border-radius:50%}
.bt-mark[data-live] .bt-b,.bt-mark[data-live] .bt-mark-img{transition:rotate .5s cubic-bezier(.34,1.56,.64,1),translate .5s cubic-bezier(.34,1.56,.64,1),scale .3s ease-out}
.bt-mark[data-live] .bt-eye{transition:scale .14s ease-in}
.bt-mark[data-live] .bt-eye-happy{transition:opacity .12s ease-out}
body:not([data-bt-motion=quiet]) :is(.bt-row,.bt-tile)>:is(.bt-mark,.bt-cluster):hover .bt-mark[data-live]:is([data-state=idle],[data-state=alert]):not(.bt-mark-poke) :is(.bt-b,.bt-mark-img){rotate:8deg;translate:5% -1%;animation:bt-nuzzle .78s ease-in-out .32s infinite}
body:not([data-bt-motion=quiet]) :is(.bt-row,.bt-tile)>:is(.bt-mark,.bt-cluster):hover .bt-mark[data-live]:is([data-state=idle],[data-state=alert]) .bt-eye{scale:1 0;animation:none}
body:not([data-bt-motion=quiet]) :is(.bt-row,.bt-tile)>:is(.bt-mark,.bt-cluster):hover .bt-mark[data-live]:is([data-state=idle],[data-state=alert]) .bt-eye-happy{opacity:1;transition-delay:.1s}
@keyframes bt-nuzzle{50%{rotate:14deg;translate:8% -3%;scale:1.03 .97}}
.bt-mark[data-gaze] .bt-b{translate:calc(var(--bt-gx,0) * 5%) calc(var(--bt-gy,0) * 4%);transition:translate .18s ease-out}
.bt-mark[data-gaze] .bt-gaze{transform:translate(calc(var(--bt-gx,0) * 12%),calc(var(--bt-gy,0) * 11%));transition:transform .18s ease-out}
body[data-bt-motion=quiet] .bt-mark[data-gaze] .bt-b{translate:none}
body[data-bt-motion=quiet] .bt-mark[data-gaze] .bt-gaze{transform:none}
.bt-mark[data-state=thinking] .bt-b{animation:bt-think 2.4s ease-in-out infinite}
.bt-mark[data-state=thinking] .bt-eyes{animation:bt-think-eyes 2.4s ease-in-out infinite}
.bt-mark[data-state=searching] .bt-b{animation:bt-seek 1.2s ease-in-out infinite}
.bt-mark[data-state=searching] .bt-eyes{animation:bt-scan 1.2s ease-in-out infinite}
.bt-mark[data-state=working] .bt-b{animation:bt-work 1s ease-in-out infinite}
.bt-mark[data-state=working] .bt-eye{animation:bt-blink 2.4s ease-in-out infinite}
.bt-mark[data-state=sending] .bt-b{animation:bt-send 1.1s cubic-bezier(.4,0,.2,1) infinite}
/* A busy robot flashes its lights. */
.bt-mark:is([data-state=thinking],[data-state=searching],[data-state=working],[data-state=sending]) .bt-glow{animation:bt-glow .8s ease-in-out infinite}
/* Waiting for teammates to hand back work: the robot rocks and its eyes take turns,
   like a loading light. */
.bt-mark:is([data-state=orbit],[data-state=waiting]) .bt-b{animation:bt-rock 2.6s ease-in-out infinite;transform-origin:50% 50%}
.bt-mark:is([data-state=orbit],[data-state=waiting]) .bt-eye{animation:bt-relay 1.3s ease-in-out infinite}
.bt-mark:is([data-state=orbit],[data-state=waiting]) .bt-eyes>g:nth-child(2) .bt-eye{animation-delay:.32s}
/* A question for you hops twice when it arrives and the badge keeps it in view after;
   a lively mark keeps hopping. Its lights blink fast until you answer. */
.bt-mark[data-state=alert] .bt-b{animation:bt-hop 1.3s cubic-bezier(.3,.7,.4,1) 2}
.bt-mark[data-state=alert] .bt-glow{animation:bt-glow .5s steps(2,jump-none) infinite}
.bt-mark[data-shape=image]:not([data-state=idle]) .bt-mark-img{animation:bt-work 1.6s ease-in-out infinite}
.bt-mark[data-shape=image][data-state=alert] .bt-mark-img{animation:bt-hop 1.3s cubic-bezier(.3,.7,.4,1) 2}
body[data-bt-motion=lively] .bt-mark[data-state=alert] :is(.bt-b,.bt-mark-img){animation-iteration-count:infinite}
.bt-mark[data-state=done] .bt-b{animation:bt-done 1.8s linear 1}
.bt-mark[data-shape=image][data-state=done] .bt-mark-img{animation:bt-done 1.8s linear 1;transform-origin:50% 100%}
@keyframes bt-done{0%{transform:none;animation-timing-function:cubic-bezier(.4,0,.2,1)}13.3%{transform:scale(1.12,.88);animation-timing-function:cubic-bezier(.4,0,.2,1)}25.6%{transform:scale(.93,1.09);animation-timing-function:cubic-bezier(.4,0,.2,1)}37.8%{transform:scale(1.04,.97);animation-timing-function:cubic-bezier(.4,0,.2,1)}51.1%,100%{transform:none}}
.bt-mark-poke .bt-b{animation:bt-poke .7s cubic-bezier(.3,.7,.4,1) 1!important;transform-origin:50% 60%!important}
.bt-mark-poke .bt-eye{animation:bt-poke-eyes .7s ease-out 1!important}
.bt-mark-poke .bt-mark-img{animation:bt-poke-img .6s ease-out 1!important}
.bt-mark[data-poke]{cursor:pointer}
body[data-bt-motion=quiet] .bt-mark-poke :is(.bt-b,.bt-mark-img){animation:none!important}
body[data-bt-motion=quiet] .bt-mark[data-poke]{cursor:default}
@keyframes bt-work{0%,50%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-4%) rotate(-3deg)}75%{transform:translateY(-4%) rotate(3deg)}}
@keyframes bt-think{0%,100%{transform:rotate(-6deg)}50%{transform:translateY(-3%) rotate(-9deg)}}
@keyframes bt-think-eyes{0%,100%{transform:translate(-8%,-10%) scaleY(.8)}50%{transform:translate(6%,-12%) scaleY(.72)}}
@keyframes bt-seek{0%,100%{transform:rotate(-4deg)}50%{transform:translateY(-3%) rotate(4deg)}}
@keyframes bt-scan{0%,100%{transform:translateX(-14%)}50%{transform:translateX(14%)}}
@keyframes bt-send{0%,100%{transform:none}30%{transform:translateX(8%) rotate(8deg) scale(1.02)}55%{transform:translateX(-3%) rotate(-3deg)}75%{transform:translateX(1%)}}
@keyframes bt-rock{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
@keyframes bt-relay{0%,100%{transform:scale(1)}40%{transform:scale(.55)}}
@keyframes bt-hop{0%,55%,100%{transform:translateY(0) scale(1,1)}20%{transform:translateY(-14%) scale(.96,1.05)}40%{transform:translateY(0) scale(1.06,.94)}}
@keyframes bt-poke{0%,100%{transform:none}12%{transform:translateX(-7%) rotate(-6deg) scale(1.06)}26%{transform:translateX(7%) rotate(6deg) scale(1.06)}40%{transform:translateX(-5%) rotate(-4deg)}54%{transform:translateX(4%) rotate(3deg)}68%{transform:translateX(-2%)}84%{transform:translateY(-6%) scale(.97,1.04)}}
@keyframes bt-poke-eyes{0%,100%{transform:scale(1)}15%,55%{transform:scale(1.35)}}
@keyframes bt-poke-img{0%,100%{transform:scale(1)}40%{transform:scale(1.14) rotate(-6deg)}}
/* Idle clip: two .26s blinks (lid to 3%, then a 6% overshoot) at 1.48s and 3.46s. */
@keyframes bt-blink-idle{0%,29.6%,35%,69.2%,74.6%,100%{transform:scaleY(1)}32.2%,71.8%{transform:scaleY(.03)}33.8%,73.4%{transform:scaleY(1.06)}}
@keyframes bt-blink{0%,42%,50%,100%{transform:scaleY(1)}46%{transform:scaleY(.03)}48%{transform:scaleY(1.06)}}
@media (prefers-reduced-motion:reduce){.bt-mark *{animation:none!important;transition:none!important}}
.bt-badge{position:absolute;right:0;bottom:0;width:12px;height:12px;border-radius:50%;corner-shape:round;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 1.5px var(--bt-sidebar)}
.bt-badge-admin{background:color-mix(in srgb,var(--bt-star) 82%,var(--bt-sidebar))}
.bt-badge-admin svg{width:7px;height:7px}
.bt-badge-main{right:calc(var(--bt-size,36px) * -.07);bottom:calc(var(--bt-size,36px) * -.07);width:clamp(14px,calc(var(--bt-size,36px) * .36),22px);height:clamp(14px,calc(var(--bt-size,36px) * .36),22px);border-radius:0;box-shadow:none}
.bt-badge-main svg{width:100%;height:100%;overflow:visible}
.bt-badge-main path{fill:var(--bt-star);stroke:var(--bt-sidebar);stroke-width:2.6;stroke-linejoin:round;paint-order:stroke}
.bt-badge-alert{background:color-mix(in srgb,var(--bt-accent) 78%,var(--bt-sidebar));color:var(--bt-accent-ink,#fff);font-size:8.5px;line-height:12px;font-weight:600;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-badge-working{background:color-mix(in srgb,var(--bt-green) 82%,var(--bt-sidebar));width:8px;height:8px;right:1px;bottom:1px}
.bt-cluster{position:relative;display:inline-block;flex:none;line-height:0}
.bt-cluster>*{position:absolute}
.bt-cluster-more,.bt-cluster-you{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bt-active);color:var(--bt-ink-3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;font-weight:500;line-height:1;font-variant-numeric:tabular-nums}
.bt-cluster-you{background:color-mix(in srgb,var(--bt-ink) 12%,transparent)}
.bt-stack{display:inline-flex;align-items:center;flex:none;line-height:0}
.bt-stack>*+*{margin-left:calc(var(--bt-stack-size) * -.3)}
.bt-stack-more{font-size:11px;line-height:16px;color:var(--bt-ink-3);margin-left:3px!important}

.bt-side{display:flex;flex-direction:column;min-height:0;flex:1 1 auto;gap:2px;padding:0 12px 8px 0;color:var(--bt-ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-side-top{display:flex;justify-content:flex-end;align-items:center;gap:8px;padding:6px 5px 0 0}
.bt-brand{display:inline-flex;align-items:center;gap:6px;margin-right:auto;padding:4px 8px 4px 4px;border:0;border-radius:8px;background:none;cursor:pointer;font-family:inherit;font-size:15px;line-height:20px;font-weight:600;letter-spacing:-.01em;color:var(--bt-ink);white-space:nowrap}
.bt-brand-mark{display:inline-flex;color:var(--bt-accent)}
.bt-brand-name{font-weight:700;font-size:15px;letter-spacing:-.02em}
.bt-brand-name b{font-weight:inherit;color:var(--bt-accent)}
.bt-round{width:36px;height:36px;border-radius:50%;border:1px solid var(--bt-line);background:var(--bt-main);color:var(--bt-ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background-color .12s ease,transform .12s ease}
.bt-round:hover{background:var(--bt-hover)}
.bt-round:active{transform:scale(.94)}
.bt-list{display:flex;flex-direction:column;gap:3px;overflow-y:auto;min-height:0;flex:1 1 auto}
.bt-tile-wrap{display:flex;justify-content:center;padding:20px 0 15px}
.bt-tile{display:flex;flex-direction:column;align-items:center;gap:4px;width:95px;padding:6px 8px 4px;border-radius:12px;border:0;background:transparent;color:var(--bt-ink);cursor:pointer;font-family:inherit;transition:background-color .12s ease}
.bt-tile:hover{background:var(--bt-hover)}
.bt-tile[aria-current=page]{background:var(--bt-active);box-shadow:inset 0 0 0 1.5px color-mix(in srgb,var(--bt-accent) 55%,transparent)}
.bt-tile-name{font-size:13px;line-height:18px;font-weight:500;max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-chip{font-size:11px;line-height:16px;padding:1px 4px;border-radius:4px;background:var(--bt-hover);border:1px solid var(--bt-line);color:var(--bt-ink-2);white-space:nowrap;max-width:84px;overflow:hidden;text-overflow:ellipsis}
.bt-row{display:flex;align-items:center;gap:10px;min-height:54px;padding:7px 8px;border:0;border-radius:10px;background:transparent;color:var(--bt-ink);text-align:left;cursor:pointer;width:100%;box-sizing:border-box;font-family:inherit;transition:background-color .12s ease}
.bt-row:hover{background:var(--bt-hover)}
.bt-row[aria-current=page]{background:var(--bt-active);box-shadow:inset 3px 0 0 var(--bt-accent)}
.bt-row-body{display:flex;flex-direction:column;min-width:0;flex:1 1 auto}
.bt-row-name{display:flex;align-items:center;gap:6px;min-width:0;font-size:14px;line-height:20px;font-weight:500}
.bt-row-title{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-tag{flex:none;max-width:96px;font-size:12px;line-height:16px;font-weight:400;padding:1px 6px;border-radius:4px;background:var(--bt-tag-bg);color:var(--bt-tag-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-row-preview{font-size:13px;line-height:18px;color:var(--bt-ink-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-unread{width:8px;height:8px;border-radius:50%;background:var(--bt-accent);flex:none;margin-right:2px;animation:bt-fade .13s cubic-bezier(.22,1,.36,1)}
.bt-unread-wait{background:var(--bt-star)}
.bt-rail{align-items:center;padding:0 0 8px}
.bt-rail .bt-row{justify-content:center;padding:6px 0;min-height:44px}
.bt-side-foot{display:flex;padding-top:8px}
.bt-connect{flex:1;height:36px;border-radius:999px;border:1px solid var(--bt-line);background:var(--bt-main);color:var(--bt-ink);font-family:inherit;font-size:14px;line-height:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:background-color .12s ease}
.bt-connect:hover{background:var(--bt-hover)}
.bt-connect svg{flex:none;width:15px;height:15px}
.bt-connect-wrap{position:relative;display:flex;flex:1 1 auto;min-width:0}

.bt-head{position:relative;display:flex;justify-content:center;align-items:center;height:40px;flex:none;pointer-events:none}
.bt-pill{pointer-events:auto;display:inline-flex;align-items:center;gap:8px;height:40px;padding:7.5px 13.5px 7.5px 7.5px;border-radius:999px;background:var(--bt-main);border:.5px solid var(--bt-line-2);box-shadow:0 2px 8px -1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);color:var(--bt-ink);font-family:inherit;font-size:14px;line-height:20px;cursor:pointer;max-width:70%;box-sizing:border-box;transition:background-color .12s ease,transform ${SPRING_TAP.duration}ms ${SPRING_TAP.easing}}
.bt-pill:hover{background:color-mix(in srgb,var(--bt-main),#777 9%)}
.bt-head-side{position:absolute;right:12px;top:4px;width:32px;height:32px;border-radius:8px;pointer-events:auto;transition:background-color .12s ease}
.bt-head-side:hover{background:color-mix(in srgb,var(--bt-main),#777 12%);color:var(--bt-ink)}
.bt-pill:active{transform:scale(.965)}
.bt-pill-name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
.bt-pill-mem{flex:none;display:inline-flex;width:0;margin-left:-8px;overflow:hidden;transition:${spring(SPRING_SHAPE, "width", "margin-left")}}
.bt-pill[data-memory=updated] .bt-pill-mem{width:var(--bt-mem-w);margin-left:0;transition:${spring(SPRING_STRETCH, "width", "margin-left")}}
.bt-pill-mem-in{flex:none;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;color:var(--bt-ink-2);font-size:13px;font-weight:500;opacity:0;filter:blur(6px);transform:translateX(-8px);transition:opacity .14s ease,filter .18s ease,${spring(SPRING_SHAPE, "transform")}}
.bt-pill-mem-in::before{content:"";flex:none;width:1px;height:14px;margin-right:4px;background:var(--bt-line-2)}
.bt-pill[data-memory=updated] .bt-pill-mem-in{opacity:1;filter:none;transform:none;transition-delay:70ms}
.bt-pill-mem-ico{flex:none;display:inline-flex;width:16px;height:16px;color:var(--bt-accent)}
.bt-pill-mem-ico svg{width:16px;height:16px}
.bt-pill[data-memory=updated] .bt-pill-mem-ico{animation:bt-mem-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} 90ms both}
@keyframes bt-mem-pop{from{transform:scale(.4) rotate(-14deg)}to{transform:none}}
.bt-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (prefers-reduced-motion:reduce){.bt-pill-mem,.bt-pill-mem-in{transition:none!important}.bt-pill-mem-in{filter:none;transform:none}.bt-pill[data-memory=updated] .bt-pill-mem-ico{animation:none}}
.bt-swap{color:var(--bt-ink-3);font-size:12px}
.bt-pill-go{flex:none;display:inline-flex;align-items:center;justify-content:flex-end;width:0;margin-left:-8px;overflow:hidden;opacity:0;filter:blur(6px);transform:translateX(-6px);color:var(--bt-ink-2);transition:width ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},margin-left ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},transform ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},opacity .18s ease,filter .18s ease}
.bt-pill-go svg{flex:none;transition:transform ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
.bt-pill:hover .bt-pill-go,.bt-pill:focus-visible .bt-pill-go,.bt-pill[aria-expanded=true] .bt-pill-go{width:18px;margin-left:0;opacity:1;filter:none;transform:none}
.bt-pill[aria-expanded=true] .bt-pill-go svg{transform:rotate(180deg)}
.bt-pill[data-memory=updated]:is(:hover,:focus-visible,[aria-expanded=true]) .bt-pill-go{width:0;margin-left:-8px;opacity:0;filter:blur(6px);transform:translateX(-6px)}
@media (prefers-reduced-motion:reduce){.bt-pill,.bt-pill-go,.bt-pill-go svg{transition:none!important}.bt-pill-go{filter:none}.bt-pill:active{transform:none}}

.bt-astack{display:flex;flex-direction:column;align-items:flex-start;gap:4px;margin:0}
.bt-bubble{max-width:min(80%,560px,calc(100% - 82px));background:var(--bt-bubble);color:var(--bt-ink);border-radius:18px;border-end-start-radius:6px;padding:7px 12px;font-size:var(--dsh-content-font-size,14px);line-height:calc(var(--dsh-content-font-size,14px) + 8px);box-sizing:border-box;overflow-wrap:anywhere}
.bt-msg:not(:first-child)>.bt-msg-line>.bt-bubble{border-start-start-radius:6px}
.bt-msg:not(:last-child)>.bt-msg-line>.bt-bubble{border-end-start-radius:6px}
.bt-bubble [class*="_markdown"]>*+*{margin-top:10px}
.bt-bubble [class*="_markdown"]{color:inherit!important;font-size:inherit!important;line-height:inherit!important}
.bt-bubble p{margin:0}
.bt-bubble p + p{margin-top:6px}
.bt-bubble ul,.bt-bubble ol{margin:4px 0;padding-left:20px}
.bt-bubble a[href^="${MENTION_ORIGIN}"]{text-decoration:none;font-weight:400;cursor:pointer;white-space:nowrap}
.bt-bubble a[href^="${MENTION_ORIGIN}"]::before{content:"";display:inline-block;width:16px;height:16px;margin-right:3px;vertical-align:-3px;background:currentColor;-webkit-mask:${DEFAULT_MASK} center/contain no-repeat;mask:${DEFAULT_MASK} center/contain no-repeat}
.bt-group-msg{display:flex;flex-direction:column;gap:4px;margin:16px 0 0}
.bt-group-msg:first-child{margin-top:0}
.bt-lead{flex:none;display:flex;margin-bottom:1px}
button.bt-lead{border:0;background:none;padding:0;cursor:pointer}
/* Rows without the avatar start where the bubble beside it starts: 22px avatar + 8px gap. */
.bt-astack[data-lead]>.bt-msg:not(:last-child)>.bt-msg-line,.bt-astack[data-lead] .bt-reacts{margin-left:30px}
.bt-group-name{font-size:12px;line-height:16px;font-weight:500;margin-left:42px}
.bt-group-time,.bt-group-took{margin-left:6px;font-size:11px;line-height:16px;font-weight:400;color:var(--bt-ink-2);font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-x{border:0;background:none;color:var(--bt-ink-2);cursor:pointer;width:24px;height:24px;border-radius:6px;font-size:16px;line-height:24px;padding:0;transition:background-color .12s ease,color .12s ease,${spring(SPRING_TAP, "scale")}}
.bt-x:hover{background:var(--bt-hover);color:var(--bt-ink)}

.bt-q{margin:0 auto 8px;width:100%;max-width:var(--dsh-chat-content-width,748px);display:flex;flex-direction:column;gap:12px;--bt-q-edge:color-mix(in srgb,var(--bt-ink) 10%,transparent);--bt-q-rule:color-mix(in srgb,var(--bt-ink) 8%,transparent);--bt-q-rule-2:color-mix(in srgb,var(--bt-ink) 5%,transparent);background:var(--bt-card);box-shadow:0 1px 3px rgba(20,20,20,.04),inset 0 0 0 1px var(--bt-q-edge);border-radius:16px;padding:14px 16px;box-sizing:border-box;color:var(--bt-ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
body[data-ds-dark-theme] .bt-q{--bt-q-edge:rgba(255,255,255,.16);--bt-q-rule:rgba(255,255,255,.12);--bt-q-rule-2:rgba(255,255,255,.08)}
@keyframes bt-q-in{from{transform:translateY(10px) scale(.97)}}
.bt-q-settled{animation:none}
.bt-q-head{display:flex;align-items:flex-start;gap:8px;min-width:0}
.bt-q-text{flex:1 1 0;min-width:0;display:flex;flex-direction:column}
.bt-q-title{margin:0;font-size:15px;line-height:22px;font-weight:600;overflow-wrap:anywhere}
.bt-q-detail{font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-q-x{flex:none;width:20px;height:20px;border:0;padding:0;border-radius:6px;background:none;color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease,${spring(SPRING_TAP, "scale")}}
.bt-q-x svg{width:14px;height:14px}
.bt-q-x:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-q-x:focus-visible,.bt-q-opt:focus-visible{outline:2px solid var(--bt-accent);outline-offset:-2px}
.bt-q-list{display:flex;flex-direction:column;gap:1px;min-width:0;box-sizing:border-box;margin:0 -8px}
.bt-q-opt{position:relative;display:flex;align-items:flex-start;gap:16px;width:100%;min-width:0;box-sizing:border-box;margin:0;border:0;border-radius:12px;background:transparent;padding:10px 8px;font:inherit;color:var(--bt-ink);text-align:start;cursor:pointer;transition:background-color .12s ease}
.bt-q:not(.bt-q-raised)>.bt-q-head:has(+.bt-q-list){padding-bottom:12px;border-bottom:1px solid var(--bt-q-rule)}
.bt-q:not(.bt-q-raised)>.bt-q-head+.bt-q-list{margin-top:-6px}
.bt-q-opt+.bt-q-opt::before{content:"";position:absolute;left:calc(var(--bt-key,24px) + 24px);right:8px;top:-1px;height:1px;background:var(--bt-q-rule-2);transition:opacity .12s ease;pointer-events:none}
button.bt-q-opt:hover::before,button.bt-q-opt:hover+.bt-q-opt::before,.bt-q-opt[aria-pressed=true]::before,.bt-q-opt[aria-pressed=true]+.bt-q-opt::before{opacity:0}
.bt-q-raised .bt-q-opt::before{display:none}
button.bt-q-opt:hover{background:var(--bt-hover)}
button.bt-q-opt:active{background:var(--bt-active)}
.bt-q-opt[aria-pressed=true]{background:var(--bt-active)}
.bt-q:not(.bt-q-raised) :is(button.bt-q-opt:hover,.bt-q-opt[aria-pressed=true]) .bt-key{background:var(--bt-card);color:var(--bt-ink)}
.bt-key{flex:none;box-sizing:border-box;width:var(--bt-key,24px);height:var(--bt-key,24px);border-radius:8px;background:var(--bt-hover);color:var(--bt-ink-2);font-size:12px;line-height:var(--bt-key,24px);font-weight:500;text-align:center;font-variant-numeric:tabular-nums;transition:background-color .12s ease,color .12s ease}
.bt-q-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:1px;padding-top:2px}
/* With a description the key spans the two text lines less 2px above and below. */
.bt-q-opt:has(.bt-q-desc){--bt-key:34px}
.bt-q-opt:has(.bt-q-desc) .bt-key{margin-top:2px;border-radius:10px;font-size:13px}
.bt-q-opt:has(.bt-q-desc) .bt-q-body{padding-top:0}
.bt-q-label{font-size:14px;line-height:20px;font-weight:500;white-space:normal;overflow-wrap:anywhere}
.bt-q-desc{font-size:12px;line-height:17px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-q-check{flex:none;display:inline-flex;align-items:center;color:var(--bt-ink-2);animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} backwards}
.bt-q-settled .bt-q-check{animation:none}
.bt-q-check svg{width:16px;height:16px}
.bt-q-settled .bt-key{opacity:.4}
.bt-q-settled .bt-q-label{color:color-mix(in srgb,var(--bt-ink) 45%,transparent)}
.bt-q-dismissed .bt-q-title{color:var(--bt-ink-2)}
.bt-q.bt-q-settled{gap:6px;padding:12px 16px}
.bt-q-settled .bt-q-title{font-size:14px;line-height:20px;font-weight:500}
.bt-q.bt-q-settled>.bt-q-head:has(+.bt-q-list){padding-bottom:0;border-bottom:0}
.bt-q.bt-q-settled>.bt-q-head+.bt-q-list{margin-top:0}
.bt-q-settled .bt-q-opt{padding:4px 8px}
.bt-q-badge{flex:none;height:20px;padding:0 7px;border-radius:999px;border:1px dotted var(--bt-line-2);color:var(--bt-ink-2);font-size:12px;line-height:18px;box-sizing:border-box}
.bt-q-custom{display:flex;align-items:flex-start;gap:8px;width:100%;min-width:0}
.bt-q-field{flex:1 1 0;min-width:0;display:flex;box-sizing:border-box;min-height:32px;padding:5px 11px;border-radius:8px;border:.5px solid var(--bt-line-2);background:none;cursor:text;transition:border-color .12s ease}
.bt-q-field:focus-within{border-color:color-mix(in srgb,var(--bt-ink) 30%,transparent)}
.bt-q-input{flex:1;width:100%;min-width:0;max-height:120px;margin:0;padding:0;border:0;outline:none;background:transparent;color:var(--bt-ink);font:inherit;font-size:14px;line-height:20px;resize:none;overflow-y:hidden;white-space:pre-wrap;overflow-wrap:anywhere}
.bt-q-input:not(:placeholder-shown){field-sizing:content}
.bt-q-input::placeholder{color:var(--bt-ink-3)}
.bt-q-submit,.bt-q-btn{flex:none;height:36px;padding:0 14px;border:0;border-radius:999px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .12s ease,background-color .12s ease,${spring(SPRING_TAP, "scale")}}
.bt-q-submit{background:var(--bt-accent);color:var(--bt-accent-ink,#fff);animation:bt-q-submit-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing} backwards,bt-veil-in .16s ease-out backwards}
@keyframes bt-q-submit-in{from{transform:translateX(8px) scale(.9)}}
.bt-q-submit:hover:not(:disabled){opacity:.86}
.bt-q-submit:disabled{opacity:.4;cursor:default}
.bt-q-btn{background:var(--bt-hover);color:var(--bt-ink)}
.bt-q-btn:hover{background:var(--bt-active)}
.bt-q-foot{display:flex;justify-content:flex-end;gap:8px}
.bt-q-raised{width:calc(var(--dsh-chat-content-width,748px) - 32px);max-width:calc(100% - 32px);gap:0;padding:0;box-shadow:0 2px 8px rgba(20,20,20,.035),inset 0 0 0 .5px color-mix(in srgb,var(--bt-ink) 5%,transparent)}
.bt-q-raised .bt-q-head{padding:14px 16px 4px 20px}
.bt-q-raised .bt-q-head:last-child{padding-bottom:16px}
.bt-q-raised .bt-q-list{gap:1px;margin:0;padding:8px}
.bt-q-raised .bt-q-opt{gap:4px;padding:7px;border-radius:16px;color:var(--bt-ink-2)}
.bt-q-raised button.bt-q-opt:hover{color:var(--bt-ink)}
.bt-q-raised .bt-q-opt[aria-pressed=true]{background:transparent;color:var(--bt-ink)}
.bt-q-raised .bt-q-opt[aria-pressed=true]:hover{background:var(--bt-hover)}
.bt-q-raised .bt-q-opt[aria-pressed=true] .bt-key,.bt-q-ownrow:focus-within .bt-key,.bt-q-ownrow[data-filled] .bt-key{background:var(--bt-user);color:var(--bt-user-ink)}
.bt-q-raised .bt-q-body{padding:2px 6px 0}
.bt-q-raised .bt-q-desc{color:color-mix(in srgb,var(--bt-ink) 61%,transparent)}
.bt-q-ownrow{cursor:text}
.bt-q-ownrow .bt-q-input{color:var(--bt-ink)}
.bt-q-raised .bt-q-foot{padding:0 8px 8px}
@media (prefers-reduced-motion:reduce){.bt-q{animation:bt-fade .12s ease-out backwards}.bt-q-settled{animation:none}.bt-q-submit{animation:none}}

.bt-newchat{flex:1;display:flex;flex-direction:column;min-width:0;position:relative;animation:bt-veil-in .18s ease-out}
.bt-to{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-height:48px;padding:6px 12px;border-bottom:1px solid var(--bt-line);font-size:14px;box-sizing:border-box}
.bt-to-label{color:var(--bt-ink-2)}
.bt-to input{flex:1;min-width:120px;border:0;outline:none;background:none;color:var(--bt-ink);font-size:14px;height:26px}
.bt-token{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 6px 0 4px;border-radius:999px;background:var(--bt-hover);font-size:13px;animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-token button{border:0;background:none;color:var(--bt-ink-2);cursor:pointer;padding:0 2px}
.bt-admin-star{flex:none;display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;border-radius:50%;corner-shape:round;background:color-mix(in srgb,var(--bt-star) 82%,var(--bt-sidebar));vertical-align:-1px}
.bt-to-star{display:inline-flex;margin-right:-2px;animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-to .bt-to-create{flex:none;height:28px;padding:0 12px;font-size:13px;animation:bt-q-submit-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .16s ease-out}
.bt-drop{position:absolute;top:48px;left:32px;width:min(550px,calc(100% - 64px));display:flex;flex-direction:column;padding:6px;max-height:min(420px,60vh);overflow-y:auto;background:var(--bt-card);border:1px solid var(--bt-line-2);border-radius:12px;box-shadow:0 6px 20px -4px rgba(0,0,0,.12);box-sizing:border-box;z-index:1;transform-origin:24px 0;animation:bt-pop-drop ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .14s ease-out}
.bt-option{display:flex;align-items:center;gap:10px;border:0;background:none;border-radius:8px;padding:7px 8px;min-height:36px;box-sizing:border-box;font-size:13px;line-height:18px;color:var(--bt-ink);cursor:pointer;text-align:left;width:100%}
.bt-option[aria-selected=true]{background:var(--bt-active)}
.bt-drop-list>.bt-option:not([aria-selected=true]):hover{background:var(--bt-hover)}
.bt-option-label{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-option-hint{font-size:11px;color:var(--bt-ink-2);flex:none;animation:bt-veil-in .16s ease-out}
.bt-option-icon{width:22px;height:22px;border-radius:50%;background:var(--bt-hover);color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;flex:none}
.bt-hint{padding:14px;text-align:center;font-size:13px;color:var(--bt-ink-2)}
.bt-nc-spacer{flex:1}
.bt-nc-compose{padding:0 16px 14px;display:flex;justify-content:center}
.bt-nc-card{display:flex;align-items:flex-end;gap:6px;width:100%;max-width:var(--dsh-chat-content-width,748px);min-height:44px;padding:4px 6px;border-radius:22px;border:1px solid var(--bt-line-2);background:var(--bt-main);box-shadow:0 2px 8px -2px rgba(0,0,0,.06);box-sizing:border-box}
.bt-nc-plus{width:34px;height:34px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:var(--bt-ink-2);background:var(--bt-hover);flex:none}
.bt-nc-card textarea{flex:1;resize:none;border:0;outline:none;background:none;color:var(--bt-ink);font:inherit;font-size:14px;line-height:20px;padding:7px 4px;min-height:34px;max-height:140px;box-sizing:border-box}
.bt-nc-send{width:34px;height:34px;border-radius:50%;border:0;background:var(--bt-accent);color:var(--bt-accent-ink,#fff);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none}
.bt-nc-send:disabled{opacity:.3;cursor:default}
.bt-create{flex:1;display:flex;flex-direction:column;min-width:0}
.bt-create-head{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:48px;padding:6px 12px;border-bottom:1px solid var(--bt-line);box-sizing:border-box}
.bt-create-gap{width:28px}
.bt-create-title{font-size:14px;line-height:20px;font-weight:500}
.bt-create-body{flex:1;overflow-y:auto;padding:28px 16px 32px;display:flex;justify-content:center}
.bt-create-card{width:100%;max-width:400px;display:flex;flex-direction:column;gap:18px;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} both,bt-veil-in .22s ease-out both}
.bt-create-preview{display:flex;flex-direction:column;align-items:center;gap:10px}
.bt-create-pop{display:inline-flex;animation:bt-create-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} both}
@keyframes bt-create-pop{from{transform:scale(.72);opacity:.4}}
.bt-create-name{font-size:17px;line-height:24px;font-weight:500;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-create-step{font-size:12px;line-height:16px;color:var(--bt-ink-2);margin-bottom:-10px}
.bt-create-looks{display:flex;flex-direction:column;gap:10px;padding:10px;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card)}
.bt-create-lookbar{justify-content:center}
.bt-create-foot{display:flex;justify-content:flex-end;gap:8px;padding-top:4px}
.bt-create-go{height:36px;padding:0 20px}
@media (prefers-reduced-motion:reduce){.bt-create-card,.bt-create-pop{animation:none}}
.bt-send{height:40px;min-width:40px;border-radius:999px;border:0;background:var(--bt-accent);color:var(--bt-accent-ink,#fff);font-size:14px;padding:0 14px;cursor:pointer;flex:none;white-space:nowrap}
.bt-send:disabled{opacity:.35;cursor:default}
.bt-error{padding:0 14px 10px;color:var(--bt-danger);font-size:12px}

/* Side panels keep their content clear of the Windows caption buttons. A host may set the
   chrome top to 0 so that dialog masks also cover the caption band; the panel then reaches
   the top edge, its own surface under the buttons, and the band over it still drags the
   window. Where the chrome top already clears the title bar the band is 0. */
html[data-windows-titlebar]:not([data-fullscreen]) :is(.bt-pane,.bt-panel){--bt-caption-band:calc(var(--dsh-windows-titlebar-height,0px) - var(--dsh-frame-chrome-top,0px));padding-top:var(--bt-caption-band)}
html[data-windows-titlebar]:not([data-fullscreen]) :is(.bt-pane,.bt-panel)::before{content:"";position:absolute;top:0;left:0;right:0;height:var(--bt-caption-band);-webkit-app-region:drag}
.bt-pane{position:fixed;top:var(--dsh-frame-chrome-top,0px);right:0;bottom:0;z-index:45;pointer-events:auto;background:var(--bt-main);color:var(--bt-ink);display:flex;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-dialog{flex:1;display:flex;flex-direction:column;min-width:0}
.bt-dialog .bt-head{height:62px}
.bt-dialog-log{flex:1;overflow-y:auto;padding:8px 16px 20px;width:100%;max-width:var(--dsh-chat-content-width,748px);margin:0 auto;box-sizing:border-box}
.bt-dialog-foot{display:flex;justify-content:center;padding:10px 10px 16px}
.bt-exchange{animation:bt-sheet-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} both,bt-veil-in .24s ease-out both}
.bt-exchange[data-leaving]{animation:bt-sheet-out .22s cubic-bezier(.4,0,1,1) forwards;pointer-events:none}
@keyframes bt-sheet-in{from{transform:translateY(24px)}}
@keyframes bt-sheet-out{to{opacity:0;transform:translateY(16px);filter:blur(4px)}}
.bt-exchange .bt-dialog{position:relative}
.bt-exchange .bt-dialog-log{max-width:none;margin:0;padding:39px max(16px,calc((100% - 960px)/2)) 116px;scrollbar-width:thin}
.bt-exchange .bt-tools{display:none}
.bt-fold{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px;margin-top:4px;white-space:normal}
.bt-fold-note{font-size:12px;line-height:16px;color:var(--bt-ink-3)}
[data-folded] .bt-fold-body{-webkit-mask-image:linear-gradient(to bottom,#000 calc(100% - 40px),transparent);mask-image:linear-gradient(to bottom,#000 calc(100% - 40px),transparent)}
.bt-ubody .bt-fold .bt-more,.bt-ububble .bt-fold .bt-more,.bt-ubody .bt-fold-note,.bt-ububble .bt-fold-note{color:inherit;opacity:.7}
.bt-ubody .bt-fold .bt-more:hover,.bt-ububble .bt-fold .bt-more:hover{opacity:1}
.bt-exchange .bt-dialog-foot{position:absolute;left:0;right:0;bottom:0;height:76px;box-sizing:border-box;align-items:flex-end;padding:0 0 28px;background:var(--bt-main);z-index:3;animation:bt-foot-in .3s cubic-bezier(.22,1,.36,1) .3s both}
.bt-exchange .bt-dialog-foot::before{content:"";position:absolute;left:0;right:0;bottom:100%;height:40px;background:linear-gradient(to top,var(--bt-main),transparent);pointer-events:none}
.bt-exchange[data-leaving] .bt-dialog-foot{animation:bt-foot-out .22s cubic-bezier(.4,0,1,1) forwards}
@keyframes bt-foot-in{from{opacity:0;transform:translateY(6px)}}
@keyframes bt-foot-out{to{opacity:0;transform:translateY(6px)}}
@media (prefers-reduced-motion:reduce){.bt-exchange,.bt-exchange .bt-dialog-foot{animation-duration:.01s}}
.bt-soft{height:36px;border-radius:999px;border:0;background:var(--bt-hover);color:var(--bt-ink);padding:0 16px;font-size:14px;cursor:pointer;flex:none;white-space:nowrap}
.bt-soft:hover{background:var(--bt-active)}
.bt-time{display:block;text-align:center;font-size:12px;line-height:16px;color:var(--bt-ink-2);padding:6px 0}

.bt-panel{position:fixed;top:var(--dsh-frame-chrome-top,0px);right:0;bottom:0;width:var(--bt-panel-w,320px);pointer-events:auto;z-index:40;background:var(--bt-main);border-left:.5px solid var(--bt-line-2);display:flex;flex-direction:column;color:var(--bt-ink);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;box-sizing:border-box;animation:bt-pane-in .3s cubic-bezier(.2,0,0,1);transition:width ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
.bt-panel[data-leaving]{transform:translateX(100%);transition:transform .3s cubic-bezier(.2,0,0,1);pointer-events:none}
.bt-panel[data-instant]{transition:none}
@keyframes bt-pane-in{from{transform:translateX(100%)}}
[class*="_centerCol"]{transition:margin-right ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
.bt-panel-grip{position:absolute;left:-5px;top:0;bottom:0;width:8px;cursor:col-resize;z-index:3;touch-action:none}
.bt-panel-grip:hover,.bt-panel[data-dragging] .bt-panel-grip{background:linear-gradient(to right,transparent 4px,var(--bt-line-2) 4px,var(--bt-line-2) 6px,transparent 6px)}
.bt-drag-shield{position:fixed;inset:0;z-index:45;cursor:col-resize}
.bt-panel-view{flex:1;min-height:0;display:flex;flex-direction:column}
.bt-drawer-top{display:flex;justify-content:flex-end;gap:8px;padding:12px 17px 6px 12px}
.bt-drawer-id{display:flex;flex-direction:column;align-items:center;padding:14px 16px 0}
.bt-drawer-id>.bt-mark,.bt-drawer-id>.bt-cluster,.bt-drawer-id>.bt-pile{margin-bottom:16px}
.bt-pile{display:flex;align-items:center;justify-content:center;line-height:0}
.bt-pile-face{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;width:44px;height:44px;border-radius:50%;background:var(--bt-main);box-shadow:0 0 0 3px var(--bt-main);animation:bt-pile-in .36s cubic-bezier(.34,1.56,.64,1) backwards}
.bt-pile-face+.bt-pile-face{margin-left:-10px}
.bt-pile-more{background:var(--bt-hover);color:var(--bt-ink-2);font-size:13px;line-height:1;font-weight:500;font-variant-numeric:tabular-nums}
@keyframes bt-pile-in{from{opacity:0;transform:translateY(6px) scale(.85)}}
@media (prefers-reduced-motion:reduce){.bt-pile-face{animation:none}}
.bt-drawer-name{font-size:17px;line-height:24px;font-weight:500;border:0;background:none;color:inherit;cursor:text;padding:0 6px;border-radius:6px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-drawer-name:hover{background:var(--bt-hover)}
.bt-drawer-name-input{font-size:17px;line-height:24px;text-align:center;border:.5px solid var(--bt-line-2);border-radius:6px;padding:0 6px;background:var(--bt-main);color:var(--bt-ink);outline:none;font-weight:500}
.bt-drawer-role{font-size:12px;line-height:16px;color:var(--bt-ink-3);margin-top:6px;text-align:center}
.bt-tabs{position:relative;display:flex;justify-content:center;gap:2px;margin:16px 16px 0}
.bt-tab{position:relative;z-index:1;border:0;background:none;border-radius:9999px;padding:4px 8px;font-size:13px;line-height:20px;color:var(--bt-ink-2);cursor:pointer;white-space:nowrap}
.bt-tab:hover{color:var(--bt-ink)}
.bt-tab[aria-selected=true]{background:var(--bt-hover);color:var(--bt-ink)}
.bt-tabs>.bt-thumb{top:0;bottom:0;border-radius:9999px;background:var(--bt-hover)}
.bt-tabs[data-glide] .bt-tab[aria-selected=true]{background:transparent}
.bt-drawer-body{flex:1;overflow-y:auto;padding:20px 16px 16px;font-size:13px;line-height:18px;display:flex;flex-direction:column;gap:16px}
.bt-empty{text-align:center;color:var(--bt-ink-3);font-size:13px;line-height:18px;padding:8px 12px}
.bt-section-title{font-size:12px;color:var(--bt-ink-2);margin-bottom:6px}
.bt-muted{color:var(--bt-ink-2)}
.bt-swatches{display:flex;flex-wrap:wrap;gap:6px}
.bt-swatch{width:22px;height:22px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;box-shadow:inset 0 0 0 1px var(--bt-line-2)}
.bt-swatch[aria-pressed=true]{border-color:var(--bt-ink)}
.bt-textarea{width:100%;box-sizing:border-box;min-height:120px;border:1px solid var(--bt-line);border-radius:8px;padding:8px;background:var(--bt-card);color:var(--bt-ink);font:inherit;resize:vertical}
.bt-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.bt-kv{display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:20px;color:var(--bt-ink-2)}
.bt-kv span:last-child{color:var(--bt-ink);font-variant-numeric:tabular-nums}
.bt-run-stats{display:flex;flex-wrap:wrap;justify-content:center;gap:0 6px;margin-top:-6px;font-size:12px;line-height:18px;color:var(--bt-ink-2);font-variant-numeric:tabular-nums}
.bt-run-sep{color:var(--bt-ink-3)}
.bt-danger{color:var(--bt-danger)}

/* Bot settings: fields, the avatar editor popover, and the details-pane sub-view. */
.bt-field{display:flex;flex-direction:column;gap:6px}
.bt-field-label{font-size:13px;line-height:18px;font-weight:500}
.bt-input{width:100%;box-sizing:border-box;height:36px;border:1px solid var(--bt-line);border-radius:8px;padding:0 10px;background:var(--bt-card);color:var(--bt-ink);font:inherit;font-size:13px;outline:none}
.bt-input:focus{border-color:var(--bt-line-2)}
.bt-input-area{height:auto;min-height:96px;padding:8px 10px;line-height:18px;resize:vertical}
.bt-note{font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-soft-sm{height:28px;padding:0 12px;font-size:12px}
.bt-set-avatar{display:flex;justify-content:center;padding:4px 0}
.bt-avatar-anchor{position:relative}
.bt-avatar-trigger{position:relative;width:64px;height:64px;border:0;border-radius:50%;background:none;cursor:pointer;padding:0}
.bt-avatar-pencil{position:absolute;right:-2px;bottom:-2px;width:22px;height:22px;border-radius:50%;background:var(--bt-main);border:1px solid var(--bt-line-2);color:var(--bt-ink-2);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 4px rgba(0,0,0,.12)}
.bt-avedit{position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);width:300px;background:var(--bt-main);border:1px solid var(--bt-line);border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:10px;z-index:70;display:flex;flex-direction:column;gap:10px;color:var(--bt-ink);transform-origin:top center;animation:bt-pop-drop ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .16s ease-out}
.bt-bs .bt-avedit{transform-origin:32px 0}
.bt-avedit-top{display:flex;align-items:center;justify-content:space-between}
.bt-avedit-tabs{position:relative;display:flex;gap:2px;background:var(--bt-hover);border-radius:999px;padding:2px}
.bt-avedit-tab{position:relative;z-index:1;border:0;background:none;border-radius:999px;padding:3px 10px;font-size:12px;line-height:16px;color:var(--bt-ink-2);cursor:pointer}
.bt-avedit-tab[aria-selected=true]{background:var(--bt-main);color:var(--bt-ink)}
.bt-avedit-tabs>.bt-thumb{top:2px;bottom:2px;border-radius:999px;background:var(--bt-main);box-shadow:0 1px 2px rgba(0,0,0,.06)}
.bt-avedit-tabs[data-glide] .bt-avedit-tab[aria-selected=true]{background:transparent}
.bt-avedit-reset{color:var(--bt-ink-3)}
.bt-avedit-reset:hover{color:var(--bt-ink)}
.bt-shapes{display:flex;flex-direction:column;gap:2px}
.bt-shape-row{display:grid;grid-template-columns:repeat(6,1fr);gap:2px}
.bt-shape{position:relative;aspect-ratio:1;border:0;border-radius:8px;background:none;color:var(--bt-ink);cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.bt-shape:hover{background:var(--bt-hover)}
.bt-shape .bt-ring{position:absolute;left:50%;top:50%;width:36px;height:36px;translate:-50% -50%;overflow:visible;opacity:0;scale:.82;pointer-events:none;transition:opacity .14s ease,${spring(SPRING_POP, "scale")}}
.bt-shape[aria-pressed=true] .bt-ring{opacity:1;scale:1}
.bt-colors{display:grid;grid-template-columns:repeat(9,22px);justify-content:space-between;row-gap:6px}
.bt-color{width:22px;height:22px;border-radius:50%;border:2px solid transparent;padding:2px;background:none;cursor:pointer;box-sizing:border-box;transition:border-color .14s ease,${spring(SPRING_TAP, "scale")}}
.bt-color[aria-pressed=true] span{animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-color span{display:block;width:100%;height:100%;border-radius:50%}
.bt-color[aria-pressed=true]{border-color:var(--bt-ink)}
.bt-dropzone{border:1.5px dashed var(--bt-line-2);border-radius:10px;padding:18px 12px;display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--bt-ink-2);font-size:12px;line-height:16px;text-align:center}
.bt-dropzone[data-over]{border-color:var(--bt-accent);color:var(--bt-ink)}
.bt-dropzone img{width:64px;height:64px;border-radius:50%;object-fit:cover}
.bt-set-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.bt-about{white-space:pre-wrap;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}
.bt-about[data-open]{display:block;-webkit-line-clamp:unset}
.bt-more{border:0;background:none;color:var(--bt-ink-3);font-size:12px;line-height:16px;cursor:pointer;padding:2px 0}
.bt-more:hover{color:var(--bt-ink)}
.bt-subhead{display:flex;align-items:center;gap:4px;padding:10px 12px 4px}
.bt-subhead-title{flex:1;font-size:15px;line-height:24px;font-weight:600;padding-left:4px}
.bt-icon-btn{width:28px;height:28px;border-radius:50%;border:0;background:none;color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.bt-icon-btn:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-set-body{gap:20px}
.bt-drawer-model{display:flex;flex-direction:column}
.bt-drawer-model .bt-note{margin-top:6px}
.bt-drawer-permission{display:flex;flex-direction:column}
.bt-seg button.bt-perm-danger,.bt-seg button.bt-perm-danger[aria-pressed=true],.bt-kv span.bt-perm-danger{color:var(--bt-danger)}

/* Settings dialog: a 198px page list beside the page. */
.bt-settings-layer{position:fixed;inset:var(--dsh-frame-chrome-top,0px) 0 0;z-index:60;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-scrim{position:absolute;inset:0;background:rgba(0,0,0,.32);animation:bt-fade .22s ease-out}
body[data-ds-dark-theme] .bt-scrim{background:rgba(0,0,0,.5)}
.bt-settings{--bt-set-w:min(1100px,calc(100vw - 48px));--bt-set-h:min(780px,calc(100vh - 2*max(32px,var(--dsh-frame-overlay-top,32px))));position:relative;width:var(--bt-set-w);height:var(--bt-set-h);background:var(--bt-main);border-radius:16px;border:.5px solid var(--bt-line-2);box-shadow:0 24px 80px rgba(0,0,0,.24);display:flex;overflow:hidden;color:var(--bt-ink);animation:bt-dialog-rise ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
:is(.bt-settings-layer,.bt-mem-layer)[data-leaving]{pointer-events:none}
:is(.bt-settings-layer,.bt-mem-layer)[data-leaving] .bt-scrim{opacity:0;transition:opacity .16s ease-in}
:is(.bt-settings-layer,.bt-mem-layer)[data-leaving]>[role=dialog]{animation:bt-dialog-sink .16s cubic-bezier(.4,0,1,1) forwards}
@keyframes bt-dialog-rise{from{transform:translateY(12px) scale(.96)}}
@keyframes bt-dialog-sink{to{opacity:0;transform:translateY(6px) scale(.975);filter:blur(3px)}}
@media (prefers-reduced-motion:reduce){.bt-settings,.bt-scrim,.bt-settings-page>*{animation:bt-fade .12s ease-out!important}}
.bt-settings-nav{position:relative;width:198px;flex:none;padding:16px 8px;border-right:.5px solid var(--bt-line);display:flex;flex-direction:column;gap:2px;background:var(--bt-sidebar);box-sizing:border-box}
.bt-settings-item{position:relative;z-index:1;display:flex;align-items:center;gap:8px;padding:6px 8px;border:0;border-radius:8px;background:none;color:var(--bt-ink-2);font:inherit;font-size:13px;line-height:20px;cursor:pointer;text-align:left;transition:background-color .12s ease,color .12s ease}
.bt-settings-item:hover{color:var(--bt-ink);background:var(--bt-hover)}
.bt-settings-item[aria-current=page]{background:var(--bt-active);color:var(--bt-ink)}
.bt-settings-nav>.bt-thumb{left:8px;right:8px;border-radius:8px;background:var(--bt-active)}
.bt-settings-nav[data-glide] .bt-settings-item[aria-current=page]{background:transparent}
.bt-settings-shell{margin-top:auto}
/* Usage while another page is open: out of the flow, so it keeps its layout, and not
   rendered. */
.bt-settings-usage[data-off]{position:absolute;top:0;left:198px;width:calc(var(--bt-set-w) - 198px);height:100%;box-sizing:border-box;content-visibility:hidden;pointer-events:none}
.bt-settings-main{flex:none;display:flex;flex-direction:column;min-width:0;width:calc(var(--bt-set-w) - 198px);height:var(--bt-set-h)}
.bt-settings-head{display:flex;align-items:center;gap:6px;padding:16px 56px 4px 20px}
.bt-settings-head h2{margin:0;font-size:15px;line-height:24px;font-weight:600;animation:bt-veil-in .2s ease-out}
.bt-settings-head>.bt-icon-btn{animation:bt-back-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .16s ease-out}
@keyframes bt-back-in{from{translate:6px 0;scale:.8}}
.bt-settings-scroll{flex:1;overflow-y:auto;padding:12px 20px 24px;display:flex;flex-direction:column;gap:20px;scrollbar-width:thin}
.bt-settings-page>:not(.bt-us){animation:bt-page-up ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .22s ease-out backwards}
.bt-settings-page[data-move=in]>:not(.bt-us){animation-name:bt-page-in,bt-veil-in}
.bt-settings-page[data-move=out]>:not(.bt-us){animation-name:bt-page-out,bt-veil-in}
.bt-settings-page>:nth-child(2){animation-delay:30ms}
.bt-settings-page>:nth-child(3){animation-delay:60ms}
.bt-settings-page>:nth-child(4){animation-delay:90ms}
.bt-settings-page>:nth-child(n+5){animation-delay:120ms}
@keyframes bt-page-up{from{transform:translateY(10px)}}
@keyframes bt-page-in{from{transform:translateX(18px)}}
@keyframes bt-page-out{from{transform:translateX(-18px)}}
.bt-settings-close{position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:50%;border:0;background:var(--bt-hover);color:var(--bt-ink-2);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.bt-settings-close:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-settings-form{display:flex;flex-direction:column;gap:16px}
.bt-set-section h3{font-size:13px;line-height:18px;font-weight:600;margin:0 0 8px;padding:0 4px}
.bt-set-card{border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card);display:flex;flex-direction:column}
.bt-set-card>*+*{border-top:.5px solid var(--bt-line)}
.bt-set-row{display:flex;align-items:center;gap:12px;padding:10px 12px;border:0;background:none;color:var(--bt-ink);font:inherit;font-size:13px;line-height:18px;text-align:left;width:100%;box-sizing:border-box;border-radius:0}
button.bt-set-row{cursor:pointer}
button.bt-set-row:hover{background:var(--bt-hover)}
.bt-set-card>.bt-set-row+.bt-set-row{border-top:.5px solid var(--bt-line)}
.bt-set-row:first-child{border-top-left-radius:12px;border-top-right-radius:12px}
.bt-set-row:last-child{border-bottom-left-radius:12px;border-bottom-right-radius:12px}
.bt-set-copy{flex:1;display:flex;flex-direction:column;gap:2px;min-width:0}
.bt-set-hint{font-size:12px;line-height:16px;color:color-mix(in srgb,var(--bt-ink-2) 50%,var(--bt-ink-3))}
.bt-set-control{flex:none;display:flex;align-items:center;gap:6px}
.bt-set-places .bt-set-control{flex:0 1 auto;max-width:50%;min-width:0}
.bt-set-places .bt-set-hint{overflow-wrap:anywhere}
.bt-set-value{font-size:13px;color:var(--bt-ink-2);text-align:right}
.bt-set-bot{flex:1;display:flex;align-items:center;gap:8px;min-width:0}
.bt-set-paste{flex-direction:column;align-items:stretch;gap:8px}
.bt-chevron{color:var(--bt-ink-3);display:inline-flex;flex:none}

/* Settings → Connectors. */
.bt-connector{display:flex;flex-direction:column;gap:10px;padding:12px}
.bt-connector-head{display:flex;align-items:center;gap:12px;min-width:0}
.bt-connector-mark{flex:none;width:36px;height:36px;border-radius:10px;background:var(--bt-card);border:.5px solid var(--bt-line);display:flex;align-items:center;justify-content:center;color:var(--bt-ink)}
.bt-connector-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bt-connector-name{font-size:14px;line-height:20px;font-weight:500}
.bt-connector-status{font-size:12px;line-height:16px;color:var(--bt-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-connector[data-state=ready] .bt-connector-status{color:var(--bt-ink-2)}
.bt-connector[data-state=error] .bt-connector-status{color:var(--bt-danger);white-space:normal}
.bt-connector-status.bt-cap-command{color:var(--bt-ink-2);white-space:normal;overflow-wrap:anywhere}
.bt-connector-actions{flex:none;display:flex;gap:6px}
.bt-connector-form{display:flex;flex-direction:column;gap:8px;padding-left:48px;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-connector-form-row{display:flex;align-items:center;gap:6px}
.bt-connector-link{flex:1;font-size:12px;color:var(--bt-ink-2)}
.bt-connector-error{padding-left:48px;font-size:12px;line-height:16px;color:var(--bt-danger)}

/* Shell chrome reshaped for the team view. Selectors use stable data attributes where the
   shell offers them and CSS-module name suffixes elsewhere. */
[class*="_newSession"],nav[class*="_panelList"],[class*="_logoRow"]>[class*="_brand"],[class*="_logoRow"]:not(:has([class*="_toggle"])){display:none!important}
/* The shell's sidebar switch stays where the shell puts it whenever the sidebar is
   collapsed: on the rail, or fixed in a Windows title bar, where it also stays while
   the sidebar is open. Elsewhere an open sidebar uses the team's own top row. */
html:not([data-windows-titlebar]) :not([class*="_collapsed"])>[class*="_logoRow"]{display:none!important}
html[data-windows-titlebar] :not([class*="_collapsed"])>[class*="_logoRow"]{height:0!important;margin:0!important}
html[data-windows-titlebar] .bt-side-collapse,html[data-platform=darwin] .bt-side-collapse{display:none}
/* The footer ends in the Bot row: Apex's settings seat, then Connect apps. Every
   other plugin's entry takes a whole row above it, in the shell's order, so none of them
   squeezes the Bot row. */
[class*="_footArea"]{grid-template-columns:auto minmax(0,1fr);grid-auto-flow:row dense;align-items:center;gap:4px 9px;padding:8px 6px 6px!important}
/* The engine hides the footer of a collapsed sidebar under a Windows title bar; the grid
   stays out of that one place. */
html:not([data-windows-titlebar]) [class*="_footArea"],:not([class*="_collapsed"])>[class*="_footArea"]{display:grid!important}
[class*="_footArea"]>[class*="_footerActions"],[class*="_footArea"]>[class*="_footerActions"]>div{display:contents!important}
[class*="_footArea"]>[class*="_footerActions"]>div>*{grid-column:1/-1}
[class*="_footArea"]>[class*="_footerActions"]>div>.bt-connect-wrap{grid-column:2;order:1}
[class*="_footArea"]>[class*="_settingsArea"]{grid-column:1;order:1;width:auto!important}
[class*="_footArea"] button[aria-label="Settings"]{width:auto!important;padding:0!important;background:none!important;border-radius:50%!important;height:auto!important}
${SKIN_FOOT}{display:flex!important;flex-direction:row!important;align-items:center!important;gap:9px!important}
${SKIN_FOOT}>div:has(> [data-slot="sidebar.footer.action"]){display:flex!important;align-items:center!important;flex:1 1 auto!important;min-width:0!important}
${SKIN_FOOT}>div:has(> [data-slot="sidebar.settings"]){order:-1!important;flex:none!important;width:auto!important}
[class*="_widthHandle"]{display:none!important}

@keyframes bt-fade{from{opacity:0}to{opacity:1}}
.bt-msg{display:flex;flex-direction:column;align-items:flex-start;max-width:min(80%,560px,calc(100% - 82px))}
/* The bubble's row: reactions hang below it, so the hover toolbar (and a group
   sender's avatar) line up with the bubble alone. */
.bt-msg-line{position:relative;display:flex;align-items:flex-end;gap:8px;max-width:100%}
.bt-msg-line>.bt-bubble{max-width:none;min-width:0}
/* The same bubble width as beside an avatar column: 80% of (100% - 30px), plus the 30px. */
.bt-astack[data-lead]>.bt-msg{max-width:min(calc(80% + 6px),590px,calc(100% - 52px))}
.bt-tools{position:absolute;top:50%;left:100%;margin-left:6px;transform:translateY(-50%);display:flex;gap:2px;opacity:0;visibility:hidden;transition:opacity .12s ease,visibility .12s}
.bt-tools::after{content:"";position:absolute;top:-8px;bottom:-8px;right:100%;width:128px;z-index:-1}
.bt-msg:hover>.bt-msg-line>.bt-tools,.bt-msg:focus-within>.bt-msg-line>.bt-tools,.bt-tools[data-open]{opacity:1;visibility:visible}
.bt-tool{width:24px;height:24px;border:0;padding:0;border-radius:6px;background:none;color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.bt-tool:hover,.bt-tool[aria-expanded=true]{background:var(--bt-hover);color:var(--bt-ink)}
.bt-tool:active{background:var(--bt-active)}
.bt-tool:focus-visible{outline:2px solid var(--bt-accent);outline-offset:-2px}
.bt-react-strip{position:fixed;z-index:60;pointer-events:auto;display:flex;gap:2px;padding:4px;border-radius:999px;background:var(--bt-main);border:.5px solid var(--bt-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.08),0 4px 6px -4px rgba(0,0,0,.06);transform:translate(-50%,-100%);transform-origin:bottom center;animation:bt-pop-lift ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .14s ease-out}
.bt-react-strip button{width:32px;height:32px;border:0;border-radius:50%;background:none;font-size:18px;line-height:1;cursor:pointer;transition:background-color .12s ease,${spring(SPRING_POP, "transform")};animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} backwards}
.bt-react-strip button:nth-child(2){animation-delay:20ms}
.bt-react-strip button:nth-child(3){animation-delay:40ms}
.bt-react-strip button:nth-child(4){animation-delay:60ms}
.bt-react-strip button:nth-child(n+5){animation-delay:80ms}
.bt-react-strip button:hover{background:var(--bt-hover);transform:scale(1.15)}
.bt-react-strip button:active{transform:scale(.92)}
.bt-reacts{display:flex;gap:4px;margin-top:4px}
.bt-react{height:22px;min-width:30px;padding:0 6px;border-radius:999px;border:.5px solid var(--bt-line-2);background:var(--bt-main);font-size:13px;line-height:20px;cursor:pointer;animation:bt-react-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing};transition:background-color .12s ease,${spring(SPRING_TAP, "scale")}}
.bt-react:hover{background:var(--bt-hover)}
.bt-react:active{scale:.92}
@keyframes bt-react-pop{from{transform:scale(.6);opacity:0}}
.bt-bubble a[href^="${MENTION_ORIGIN}"] svg{display:none}
.bt-you{width:36px;height:36px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--bt-ink) 5%,var(--bt-sidebar));color:var(--bt-ink-2);box-shadow:inset 0 0 0 1px var(--bt-line);transition:background-color .12s ease}
button:hover .bt-you{background:color-mix(in srgb,var(--bt-ink) 9%,var(--bt-sidebar))}
.bt-you-wrap{display:inline-flex;padding:0}
.bt-connect-foot{width:100%;height:36px}

.bt-menu{position:fixed;pointer-events:auto;z-index:60;min-width:200px;padding:6px;border-radius:12px;background:var(--bt-main);border:.5px solid var(--bt-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1),0 0 0 1px rgba(228,228,228,.04);display:flex;flex-direction:column;gap:2px;transform-origin:var(--bt-origin,top left);animation:bt-pop-drop ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .14s ease-out;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;box-sizing:border-box}
.bt-menu button{display:flex;align-items:center;gap:4px;width:100%;min-height:30px;text-align:left;border:0;background:none;border-radius:6px;padding:6px 8px;font:inherit;font-size:13px;line-height:18px;color:var(--bt-ink);cursor:pointer;box-sizing:border-box}
.bt-menu button:hover{background:var(--bt-hover)}
.bt-menu button svg{flex:none;width:16px;height:16px;margin:0 1px}
.bt-menu .bt-danger{color:var(--bt-danger)}
.bt-menu [data-confirm]{background:color-mix(in srgb,var(--bt-danger) 12%,transparent)}
.bt-menu-sep{height:.5px;flex:none;background:var(--bt-line-2);margin:4px 8px}
.bt-menu-up{--bt-origin:bottom left;animation-name:bt-pop-lift,bt-veil-in}
.bt-menu[data-leaving]{pointer-events:none;animation:bt-pop-out .12s cubic-bezier(.4,0,1,1) forwards}
.bt-menu-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-menu-hint{flex:none;color:var(--bt-ink-3);font-size:12px;font-variant-numeric:tabular-nums}
.bt-palette-layer{position:fixed;inset:var(--dsh-frame-chrome-top,0px) 0 0;z-index:70;pointer-events:auto;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.46);animation:bt-fade .22s ease-out}
.bt-palette{position:absolute;top:50%;left:50%;width:min(560px,92vw);transform:translate(-50%,-50%);display:flex;flex-direction:column;border-radius:12px;background:var(--bt-main);border:1px solid var(--bt-line-2);box-shadow:0 24px 48px -12px rgba(0,0,0,.25);overflow:hidden;color:var(--bt-ink);animation:bt-palette-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-palette-layer[data-leaving]{pointer-events:none}
.bt-palette-layer[data-leaving] .bt-backdrop{opacity:0;transition:opacity .16s ease-in}
.bt-palette-layer[data-leaving] .bt-palette{animation:bt-dialog-sink .16s cubic-bezier(.4,0,1,1) forwards}
@keyframes bt-palette-in{from{translate:0 -10px;scale:.96}}
.bt-palette-head{display:flex;align-items:center;gap:4px;padding:14px 10px 14px 14px;border-bottom:.5px solid var(--bt-line-2)}
.bt-palette-glyph{display:inline-flex;width:18px;height:18px;align-items:center;justify-content:center;color:var(--bt-ink-3);margin-right:4px}
.bt-palette-head input{flex:1;min-width:0;border:0;outline:none;background:none;color:var(--bt-ink);font:inherit;font-size:15px;line-height:22px;padding:0}
.bt-palette-head input::placeholder{color:var(--bt-ink-3)}
.bt-palette-clear{width:18px;height:18px;border:0;padding:0;border-radius:6px;background:none;color:var(--bt-ink-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.bt-palette-clear:hover{color:var(--bt-ink)}
.bt-palette-clear svg{width:12px;height:12px}
.bt-palette-list{position:relative;height:402px;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:2px;box-sizing:border-box}
.bt-palette-list>.bt-thumb,.bt-drop-list>.bt-thumb{left:0;right:0;border-radius:8px;background:var(--bt-active)}
.bt-palette-list>.bt-thumb{left:8px;right:8px}
:is(.bt-palette-list,.bt-drop-list)[data-glide] [aria-selected=true]{background:transparent}
:is(.bt-palette-row,.bt-palette-section,.bt-drop-list>.bt-option){position:relative;z-index:1}
.bt-palette-section{padding:8px 8px 4px;font-size:12px;line-height:16px;color:var(--bt-ink-3);flex:none}
.bt-palette-section:first-of-type{padding-top:0}
.bt-palette-row{flex:none;display:flex;align-items:center;gap:8px;height:49px;padding:6px 10px 6px 8px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;box-sizing:border-box;width:100%}
.bt-palette-row[aria-selected=true]{background:var(--bt-active)}
.bt-palette-lead{flex:none;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center}
.bt-palette-cmd{width:24px;height:24px;border-radius:50%;background:var(--bt-hover);display:inline-flex;align-items:center;justify-content:center;color:var(--bt-ink-2)}
.bt-palette-cmd svg{width:14px;height:14px}
.bt-palette-agent{width:24px;height:24px;border-radius:50%;background:var(--bt-hover);display:inline-flex;align-items:center;justify-content:center;color:var(--bt-ink)}
.bt-palette-text{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.bt-palette-title{font-size:14px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-palette-sub{font-size:12px;line-height:16px;color:var(--bt-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-palette-badge{flex:none;font-size:11px;line-height:16px;padding:0 6px;border-radius:4px;background:var(--bt-tag-bg);color:var(--bt-tag-ink)}
.bt-palette-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:0 16px;text-align:center;animation:bt-veil-in .22s ease-out}
.bt-palette-empty-icon{color:var(--bt-line-2)}
.bt-palette-empty-icon svg{width:32px;height:32px}
.bt-palette-empty-label{font-size:14px;font-weight:500;color:var(--bt-ink-2)}
.bt-palette-empty-hint{font-size:13px;line-height:16px;color:var(--bt-ink-3)}
@media (prefers-reduced-motion:reduce){.bt-palette{animation:bt-fade .1s ease-out}}
.bt-account-menu{width:224px}
.bt-account{flex:none;width:36px;height:36px;border:0;padding:0;background:none;border-radius:50%;cursor:pointer;display:inline-flex}
.bt-account:hover .bt-you,.bt-account[aria-expanded=true] .bt-you{background:color-mix(in srgb,var(--bt-ink) 9%,var(--bt-sidebar))}
/* Popover keyframes move translate and scale, which compose with a transform the popover
   already has. */
@keyframes bt-pop-drop{from{translate:0 -4px;scale:.96}}
@keyframes bt-pop-lift{from{translate:0 4px;scale:.96}}
@keyframes bt-pop-out{to{opacity:0;scale:.97;filter:blur(2px)}}
@keyframes bt-veil-in{from{opacity:0;filter:blur(6px)}}
@keyframes bt-check-pop{from{opacity:0;scale:.4}}
@media (prefers-reduced-motion:reduce){.bt-menu,.bt-avedit,.bt-react-strip{animation:bt-fade .1s ease-out}.bt-react-strip button,.bt-q-check,.bt-color[aria-pressed=true] span{animation:none}}
.bt-brand:hover{background:var(--bt-hover)}
.bt-drop-list{position:relative;display:flex;flex-direction:column;gap:2px}
.bt-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
.bt-pick{display:flex;flex-direction:column;align-items:center;gap:4px;padding:7px 2px 6px;border-radius:10px;border:1px solid transparent;background:none;color:var(--bt-ink);cursor:pointer;font:inherit;font-size:11px;line-height:14px;min-width:0}
.bt-pick:hover{background:var(--bt-hover)}
.bt-pick[aria-pressed=true]{border-color:var(--bt-line-2);background:var(--bt-hover)}
.bt-pick>span:last-child:not(.bt-mark){max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-pick:hover .bt-mark[data-state=idle] .bt-eye{animation:bt-blink .5s linear 1}
.bt-select{width:100%;height:34px;box-sizing:border-box;border-radius:8px;border:1px solid var(--bt-line);background:var(--bt-card);color:var(--bt-ink);padding:0 8px;font:inherit;font-size:13px}
.bt-note{font-size:12px;line-height:16px;color:var(--bt-ink-2);margin-top:6px}
.bt-swatch-sep{width:1px;height:22px;background:var(--bt-line-2);margin:0 2px}
.bt-swatch-custom{position:relative;overflow:hidden;background:conic-gradient(#ff3e51,#ffaf38,#00c972,#1cc3b0,#2a92fe,#a97efe,#ff5eb1,#ff3e51);box-sizing:border-box}
.bt-swatch-custom[data-on=true]{border-color:var(--bt-ink)}
.bt-swatch-custom input{position:absolute;inset:-4px;width:calc(100% + 8px);height:calc(100% + 8px);opacity:0;cursor:pointer;border:0;padding:0}
.bt-swatch-default{background:linear-gradient(135deg,var(--bt-card) 0 46%,var(--bt-line-2) 46% 54%,var(--bt-card) 54%);box-shadow:inset 0 0 0 1px var(--bt-line-2)}
.bt-states{display:flex;flex-wrap:wrap;gap:4px}
.bt-state{border:1px solid var(--bt-line);background:none;border-radius:999px;font:inherit;font-size:11px;line-height:16px;padding:2px 8px;color:var(--bt-ink-2);cursor:pointer}
.bt-state:hover{color:var(--bt-ink)}
.bt-state[aria-pressed=true]{background:var(--bt-active);border-color:var(--bt-line-2);color:var(--bt-ink)}
.bt-theme-chip{position:relative;width:46px;height:30px;border-radius:8px;box-shadow:inset 0 0 0 1px var(--bt-line-2);background:linear-gradient(90deg,var(--ls) 0 36%,var(--lb) 36%);overflow:hidden}
.bt-theme-chip i{position:absolute;right:7px;bottom:7px;width:10px;height:10px;border-radius:50%;background:var(--la)}
body[data-ds-dark-theme] .bt-theme-chip{background:linear-gradient(90deg,var(--ds) 0 36%,var(--db) 36%)}
body[data-ds-dark-theme] .bt-theme-chip i{background:var(--da)}
.bt-tabs{flex-wrap:wrap}
.bt-soft:disabled{opacity:.4;cursor:default}
.bt-group-role{margin-left:6px;font-size:11px;line-height:14px;padding:1px 5px;border-radius:4px;background:var(--bt-tag-bg);color:var(--bt-tag-ink);vertical-align:1px}
.bt-mini{flex:none;border:0;background:none;border-radius:6px;padding:2px 6px;font:inherit;font-size:12px;line-height:18px;color:var(--bt-ink-2);cursor:pointer}
.bt-mini:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-add{color:var(--bt-ink-2);margin-top:2px}
.bt-add:hover,.bt-addlist .bt-option:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-addlist{display:flex;flex-direction:column;margin-top:4px;padding:4px;border:1px solid var(--bt-line);border-radius:10px;background:var(--bt-card);animation:bt-rise .16s ease-out}
.bt-seg{position:relative;display:flex;gap:2px;padding:2px;border-radius:10px;background:var(--bt-hover)}
.bt-motion-seg{width:216px}
.bt-seg button{position:relative;z-index:1;flex:1;height:30px;border:0;border-radius:8px;background:none;font:inherit;font-size:13px;color:var(--bt-ink-2);cursor:pointer;transition:background-color .15s ease,color .15s ease,box-shadow .15s ease,${spring(SPRING_TAP, "scale")}}
.bt-seg button[aria-pressed=true]{background:var(--bt-card);color:var(--bt-ink);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.bt-seg button:disabled{opacity:.4;cursor:default}
.bt-seg button:active:not(:disabled){scale:.96}
.bt-seg>.bt-thumb{top:2px;bottom:2px;border-radius:8px;background:var(--bt-card);box-shadow:0 1px 3px rgba(0,0,0,.08)}
.bt-seg[data-glide] button[aria-pressed=true]{background:transparent;box-shadow:none}
@keyframes bt-rise{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){.bt-addlist{animation:none}}

/* Memory dialog: a summary of every entry, the entries behind the menu, "Ask or update" below. */
.bt-mem-row{display:flex;align-items:center;gap:8px;width:100%;height:36px;padding:0 8px 0 10px;border:.5px solid var(--bt-line-2);border-radius:10px;background:var(--bt-card);color:var(--bt-ink);font:inherit;font-size:13px;cursor:pointer;box-sizing:border-box;transition:background-color .12s ease}
.bt-mem-row:hover{background:var(--bt-hover)}
.bt-mem-row>svg{flex:none;color:var(--bt-ink-2)}
.bt-mem-row-copy{flex:1;text-align:left}
.bt-mem-row-go{display:inline-flex;align-items:center;gap:2px;color:var(--bt-ink-3);font-size:12px;flex:none;white-space:nowrap}
.bt-mem-layer{position:fixed;inset:var(--dsh-frame-chrome-top,0px) 0 0;z-index:61;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-mem-scrim{animation:bt-fade .2s ease-out}
.bt-mem{position:relative;width:min(680px,calc(100vw - 48px));height:min(760px,calc(100vh - 2*max(32px,var(--dsh-frame-overlay-top,32px))));background:var(--bt-main);border-radius:20px;border:.5px solid var(--bt-line-2);box-shadow:0 24px 80px rgba(0,0,0,.24);display:flex;flex-direction:column;overflow:hidden;color:var(--bt-ink);animation:bt-dialog-rise ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-mem-head{position:relative;display:flex;align-items:center;gap:8px;height:60px;flex:none;padding:0 14px 0 24px;border-bottom:.5px solid var(--bt-line);box-sizing:border-box}
.bt-mem-head .bt-icon-btn{width:32px;height:32px;flex:none}
.bt-mem-head [aria-haspopup] svg{width:18px;height:18px;stroke-width:2.6}
.bt-mem-head>.bt-icon-btn:first-child{margin-left:-10px}
.bt-mem-head h2{margin:0;font-size:17px;line-height:24px;font-weight:600;white-space:nowrap}
.bt-mem-status{font-size:13px;line-height:18px;color:var(--bt-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;font-variant-numeric:tabular-nums}
.bt-mem-head-gap{flex:1}
.bt-mem-menu{position:absolute;top:52px;right:50px;min-width:220px;--bt-origin:top right}
.bt-mem-menu button:disabled{opacity:.4;cursor:default;background:none}
.bt-mem-body{flex:1;overflow-y:auto;padding:22px 28px 24px;scrollbar-width:thin;display:flex;flex-direction:column;gap:12px}
.bt-mem-summary{transition:opacity .3s ease}
.bt-mem-summary[data-stale]{opacity:.55}
.bt-mem-summary h3{margin:20px 0 6px;font-size:17px;line-height:26px;font-weight:600}
.bt-mem-summary h3:first-child{margin-top:0}
.bt-mem-summary p{margin:0;font-size:15px;line-height:26px}
.bt-mem-summary>*{animation:bt-mem-line .45s cubic-bezier(.16,1,.3,1) both}
.bt-mem-summary>:nth-child(2){animation-delay:.03s}
.bt-mem-summary>:nth-child(3){animation-delay:.06s}
.bt-mem-summary>:nth-child(4){animation-delay:.09s}
.bt-mem-summary>:nth-child(5){animation-delay:.12s}
.bt-mem-summary>:nth-child(6){animation-delay:.15s}
.bt-mem-summary>:nth-child(n+7){animation-delay:.18s}
@keyframes bt-mem-line{from{opacity:0;transform:translateY(4px)}}
.bt-mem-skel{display:flex;flex-direction:column;gap:24px}
.bt-mem-skel-block{display:flex;flex-direction:column;gap:10px}
.bt-mem-skel-block span{display:block;height:12px;border-radius:6px;background:linear-gradient(90deg,var(--bt-hover) 25%,var(--bt-active) 50%,var(--bt-hover) 75%);background-size:200% 100%;animation:bt-mem-skel 1.4s ease-in-out infinite}
.bt-mem-skel-block .bt-mem-skel-head{width:30%;height:16px;margin-bottom:2px}
@keyframes bt-mem-skel{from{background-position:150% 0}to{background-position:-50% 0}}
.bt-mem-skel-label{font-size:13px;line-height:18px;color:var(--bt-ink-3)}
.bt-mem-empty{margin:auto;max-width:400px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:24px 0;animation:bt-mem-line .45s cubic-bezier(.16,1,.3,1) both}
.bt-mem-empty-mark{width:48px;height:48px;border-radius:50%;background:var(--bt-hover);display:flex;align-items:center;justify-content:center;color:var(--bt-ink-2);margin-bottom:4px}
.bt-mem-empty-mark svg{width:22px;height:22px}
.bt-mem-empty-title{font-size:15px;line-height:22px;font-weight:600}
.bt-mem-empty-text{font-size:13px;line-height:20px;color:var(--bt-ink-2)}
.bt-mem-failed{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;background:var(--bt-hover);font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-mem-failed>span{flex:1;min-width:0;overflow-wrap:anywhere}
.bt-mem-entries{display:flex;flex-direction:column;gap:28px;animation:bt-page-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .22s ease-out}
.bt-mem-section-head{display:flex;align-items:baseline;gap:8px;margin-bottom:4px}
.bt-mem-section-head h3{margin:0;font-size:15px;line-height:22px;font-weight:600}
.bt-mem-section-head span{font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-mem-section-head .bt-mem-size{margin-left:auto;font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-mem-topic{font-size:12px;line-height:16px;color:var(--bt-ink-2);margin:14px 0 2px 4px;font-weight:500}
.bt-mem-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.bt-mem-entry{display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:.5px solid var(--bt-line);transition:opacity .2s ease}
.bt-mem-entry[data-busy]{opacity:.4}
.bt-mem-entry-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bt-mem-entry-text{font-size:14px;line-height:20px;overflow-wrap:anywhere}
.bt-mem-entry-meta{font-size:12px;line-height:16px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums}
.bt-mem-remove{flex:none;height:28px;min-width:28px;border-radius:999px;border:0;background:none;color:var(--bt-ink-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0 6px;font:inherit;font-size:12px;opacity:0;transition:opacity .12s ease,background-color .12s ease,color .12s ease}
.bt-mem-entry:hover .bt-mem-remove,.bt-mem-remove:focus-visible,.bt-mem-remove[data-confirm]{opacity:1}
.bt-mem-remove:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-mem-remove[data-confirm]{background:color-mix(in srgb,var(--bt-danger) 10%,transparent);color:var(--bt-danger);padding:0 10px}
@media (hover:none){.bt-mem-remove{opacity:1}}
.bt-mem-none{font-size:13px;line-height:18px;color:var(--bt-ink-3);padding:8px 4px}
.bt-mem-foot{flex:none;padding:8px 20px 20px;display:flex;flex-direction:column;gap:10px}
.bt-mem-reply{border-radius:16px;background:var(--bt-hover);padding:8px 8px 12px 16px;display:flex;flex-direction:column;gap:6px;max-height:36vh;overflow-y:auto;scrollbar-width:thin;transform-origin:50% 100%;animation:bt-pop-lift ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-mem-reply-head{display:flex;align-items:center;gap:8px;min-height:24px}
.bt-mem-reply-asked{flex:1;min-width:0;font-size:12px;line-height:16px;color:var(--bt-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-mem-reply .bt-icon-btn{width:24px;height:24px;flex:none}
.bt-mem-reply-text{font-size:14px;line-height:21px;padding-right:8px;overflow-wrap:anywhere}
.bt-mem-changes{list-style:none;margin:2px 0 0;padding:0 8px 0 0;display:flex;flex-direction:column;gap:4px}
.bt-mem-changes li{display:flex;align-items:flex-start;gap:6px;font-size:13px;line-height:18px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-mem-changes li svg{flex:none;margin-top:1px;color:var(--bt-danger);animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} .12s backwards}
.bt-mem-changes li[data-ok] svg{color:var(--bt-green)}
.bt-mem-ask{display:flex;align-items:center;gap:8px;height:52px;padding:0 8px 0 22px;border-radius:999px;border:.5px solid var(--bt-line-2);background:var(--bt-card);box-shadow:0 4px 16px rgba(0,0,0,.06);box-sizing:border-box;transition:border-color .15s ease,box-shadow .15s ease}
.bt-mem-ask:focus-within{border-color:var(--bt-ink-3);box-shadow:0 4px 20px rgba(0,0,0,.1)}
.bt-mem-input{flex:1;min-width:0;border:0;background:none;outline:none;color:var(--bt-ink);font:inherit;font-size:15px;line-height:22px;padding:0}
.bt-mem-input::placeholder{color:var(--bt-ink-3)}
.bt-mem-send{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:var(--bt-ink);color:var(--bt-main);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:opacity .15s ease,${spring(SPRING_TAP, "scale")}}
.bt-mem-send:disabled{opacity:.22;cursor:default}
.bt-mem-send:not(:disabled):active{scale:.92}
.bt-mem-send>*{animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-mem-spin{width:14px;height:14px;border-radius:50%;border:2px solid currentColor;border-right-color:transparent;box-sizing:border-box;animation:bt-mem-spin .7s linear infinite}
@keyframes bt-mem-spin{to{transform:rotate(360deg)}}
@media (max-width:640px){.bt-mem{width:100vw;height:100%;border-radius:0;border:0}.bt-mem-body{padding:18px 18px 20px}.bt-mem-foot{padding:8px 12px 12px}}
@media (prefers-reduced-motion:reduce){.bt-mem,.bt-mem-scrim,.bt-mem-summary>*,.bt-mem-empty,.bt-mem-reply,.bt-mem-skel-block span,.bt-mem-entries,.bt-mem-send>*,.bt-mem-changes li svg{animation:none}}

.bt-thumb{position:absolute;left:0;top:0;z-index:0;pointer-events:none;transition:opacity .14s ease}
.bt-thumb[data-hidden]{opacity:0}
[data-morph]{overflow:hidden!important}
.bt-veil{animation:bt-veil-in .22s ease-out}
.bt-with-icon{display:inline-flex;align-items:center;gap:4px}
.bt-with-icon svg{width:14px;height:14px}
.bt-tag-admin{display:inline-flex;align-items:center;gap:4px}
.bt-create-inline{padding:18px 16px;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card)}
.bt-create-inline .bt-create-card{max-width:none}
.bt-panel-view>[data-move=in]{animation:bt-page-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
.bt-panel-view>[data-move=out]{animation:bt-page-out ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
.bt-panel-view>:is([data-move=in],[data-move=out]):nth-child(2){animation-delay:25ms}
.bt-panel-view>:is([data-move=in],[data-move=out]):nth-child(n+3){animation-delay:50ms}
.bt-panel-view>.bt-drawer-body[data-move=tab]{animation:bt-veil-in .2s ease-out}
.bt-drawer-name-input{animation:bt-veil-in .16s ease-out}
.bt-pop-in{display:inline-flex;animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
:is(.bt-soft,.bt-send,.bt-icon-btn,.bt-settings-close,.bt-mini,.bt-tab,.bt-nc-send,.bt-avedit-tab,.bt-shape,.bt-pick,.bt-swatch,.bt-palette-clear){transition:background-color .12s ease,color .12s ease,border-color .12s ease,opacity .12s ease,${spring(SPRING_TAP, "scale")}}
:is(.bt-icon-btn,.bt-settings-close,.bt-nc-send,.bt-shape,.bt-swatch,.bt-color,.bt-x,.bt-q-x,.bt-palette-clear):active:not(:disabled){scale:.9}
:is(.bt-soft,.bt-send,.bt-mini,.bt-tab,.bt-avedit-tab,.bt-pick,.bt-q-submit,.bt-q-btn):active:not(:disabled){scale:.96}
@media (prefers-reduced-motion:reduce){.bt-thumb{transition:none}.bt-panel-view>[data-move],.bt-drawer-name-input,.bt-veil,.bt-pop-in,.bt-token,.bt-drop,.bt-newchat,.bt-option-hint,.bt-connector-form,.bt-settings-head>*{animation:none}}
`;
var CONVERSATION_CSS = `
.bt-think{font-size:13px;line-height:18px;color:var(--bt-ink-2);margin:2px 0 4px;max-width:min(560px,78%)}
.bt-think summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px}
.bt-think summary::-webkit-details-marker{display:none}
.bt-think-time{font-variant-numeric:tabular-nums;white-space:nowrap}
/* Five lines of the 18px line height; the rest scrolls inside the box. */
.bt-think-text{white-space:pre-wrap;overflow-wrap:anywhere;margin-top:6px;padding-left:10px;border-left:2px solid var(--bt-line-2);max-height:90px;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:thin;outline:none}
.bt-think-text:focus-visible{border-left-color:var(--bt-ink-2)}
.bt-think-text[data-fade=top]{mask-image:linear-gradient(to bottom,transparent,#000 18px)}
.bt-think-text[data-fade=bottom]{mask-image:linear-gradient(to top,transparent,#000 18px)}
.bt-think-text[data-fade=both]{mask-image:linear-gradient(to bottom,transparent,#000 18px,#000 calc(100% - 18px),transparent)}
.bt-event{display:flex;justify-content:center;align-items:center;gap:2px;min-height:24px;margin:2px 0;font-size:12px;line-height:16px;color:var(--bt-ink-2);flex-wrap:wrap}
.bt-event>span{padding:0 2px}
.bt-event button{border:0;background:none;color:inherit;font:inherit;display:inline-flex;align-items:center;gap:4px;cursor:pointer;height:24px;padding:4px 6px 4px 4px;border-radius:999px;box-sizing:border-box;transition:background-color .12s ease}
.bt-event button:hover{background:var(--bt-hover)}
.bt-event button:active{background:var(--bt-active)}
.bt-event button.bt-event-whole{min-width:0;max-width:100%;padding:4px 6px 4px 8px}
.bt-event-error{color:var(--bt-danger)}
.bt-event-whole>*{flex:none}
.bt-event-whole>span:first-child{margin-right:2px}
/* One button cannot wrap like separate parts, so a long name is cut to fit the chat. */
.bt-event-whole>.bt-event-name{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-time-sep{display:flex;justify-content:center;align-items:center;height:28px;margin:14px 0 8px;font-size:12px;line-height:16px;color:var(--bt-ink-2);white-space:nowrap}
[class*="_scroll"]>[class*="_column"]::before{content:var(--bt-first-sep,none);display:block;flex:none;height:28px;margin:17px 0 12px;font-size:12px;line-height:28px;text-align:center;color:var(--bt-ink-2);white-space:nowrap}
.bt-activity{display:flex;align-items:center;gap:10px;margin:8px 0 4px 2px;font-size:14px;color:var(--bt-ink-2)}
.bt-group-replies{display:contents}
/* A Bot chat is flat in every work-details mode, without changing the user's mode
   (it is an engine-wide setting): step groups lose their header and stay open, and what a
   mode folds away in a finished turn stays shown. TurnProcessCell also opens that
   fold; these rules cover the first frame before it does. */
[data-step-process]>div:first-child{display:none!important}
[data-step-process]>[data-step-process-body]{display:block!important;content-visibility:visible!important;max-height:none!important;overflow:visible!important;mask-image:none!important;scrollbar-gutter:auto!important}
:is([data-step-process],[data-turn-process-hidden])[hidden]{content-visibility:visible!important}
[class*="_flowItem"]:has(> [data-slot="conversation.chat.node"]:empty){display:none!important}
[class*="_header"]:has(.bt-head){border-bottom-color:transparent!important;box-shadow:none!important}
/* The transcript runs under a floating header pill. */
header[class*="_header"]:has(.bt-head){position:absolute!important;top:0;left:0;right:0;z-index:8;display:flex!important;padding:10px 0 0!important;background:transparent!important;pointer-events:none;justify-content:center}
header[class*="_header"]:has(.bt-head)::before{content:"";position:absolute;inset:0 0 auto;height:60px;background:linear-gradient(to bottom,var(--bt-main),color-mix(in srgb,var(--bt-main) 0%,transparent));pointer-events:none;z-index:-1}
header[class*="_header"]:has(.bt-head)>[class*="_headerLeading"]{position:absolute;left:12px;top:10px;pointer-events:auto}
header[class*="_header"] .bt-head{flex:1 1 auto;width:100%}
[class*="_body"]:has(> [class*="_scrollBody"]){--dsh-chat-content-width:min(960px,100%)}
/* The shell writes the column's width on the conversation root at every resize, only to
   derive the content width that the rule above replaces. Inherited, each write restyled
   the whole conversation: once a frame while the details panel glides, most in a long
   group chat. Kept on the root alone, a write restyles one element. */
@property --dsh-conversation-column-width{syntax:"*";inherits:false}
@property --dsh-chat-user-width{syntax:"*";inherits:false}
/* The engine's turn tail keeps what plugins put in it (delivered files, the Bot's separators),
   without its copy and branch row; a tail with nothing in it takes no room. */
[data-turn-tail]>:not([data-slot="conversation.chat.turnTail"]){display:none!important}
[class*="_flowItem"][data-chat-flow-kind="turn-tail"]:not(:has([data-slot="conversation.chat.turnTail"]:not(:empty))){display:none!important}
/* Every team Session belongs to a Bot or a group, so a blank one is an empty chat, not
   the shell's new-session hero: no headline, no workspace or mode picker, and the
   composer stays docked at the bottom. */
[data-content-phase=hero] [class*="_scrollBody"]{justify-content:flex-end!important}
[data-content-phase=hero] [class*="_composerHero"]{align-self:stretch!important;width:auto!important;padding-bottom:0!important}
[data-content-phase=hero] [class*="_composerHero"]>[class$="_root"],[data-content-phase=hero] [class*="_heroWorkspaceRow"]{display:none!important}
[data-content-phase=hero] [class*="_composerHero"] [class*="_input"]{min-height:0!important}
/* The right sides give back the scrollbar gutter so both edges sit 16px from the column. */
[class*="_scroll"]:has(> [class*="_column"]){padding:60px 11px 16px 16px!important}
/* The shell's running status only hosts the activity row (.bt-typing). */
[data-chat-running]{display:block!important;width:100%;min-height:0!important;margin:0!important;padding:0!important}
[data-chat-running]>span:not([role=status]){display:none!important}
[data-chat-running]:has(> .bt-typing){margin-top:var(--dsh-chat-flow-gap,12px)!important}
.bt-typing{display:flex;align-items:center;gap:12px;height:36px;min-width:0;padding-inline-start:8px;transform-origin:0 50%;animation:bt-typing-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing} backwards}
.bt-typing[data-exiting]{animation:bt-typing-out .14s cubic-bezier(.22,1,.36,1) forwards}
.bt-typing>.bt-mark,.bt-typing>.bt-cluster{flex-shrink:0}
.bt-typing>.bt-mark{cursor:pointer;transition:filter .16s ease-out}
.bt-typing>.bt-mark:hover{filter:drop-shadow(0 2px 4px rgba(0,0,0,.18))}
.bt-typing>.bt-mark .bt-eyes{transition:scale .28s cubic-bezier(.4,.06,.18,1)}
.bt-typing>.bt-mark:hover .bt-eyes{scale:1.18}
.bt-typing-text{display:flex;align-items:center;flex:1 1 auto;min-width:0;animation:bt-typing-label .22s ease-out .2s backwards}
.bt-typing-label{display:inline-flex;align-items:center;gap:6px;min-width:0;animation:bt-typing-label .22s ease-out backwards}
.bt-typing-label>.bt-shimmer{font-size:14px;line-height:22px;font-weight:400;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-typing-time{flex-shrink:0;margin-left:6px;font-size:12px;line-height:22px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
@keyframes bt-typing-in{from{opacity:0;transform:scale(.9)}}
@keyframes bt-typing-out{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(.92);filter:blur(3px)}}
@keyframes bt-typing-label{from{opacity:0;filter:blur(5px);transform:translateY(3px)}}
/* Shimmer: a stepped sweep clipped to the text. */
.bt-shimmer{color:transparent;background:linear-gradient(90deg,var(--bt-shimmer-base) 0%,var(--bt-shimmer-base) 25%,var(--bt-ink) 60%,var(--bt-shimmer-base) 75%,var(--bt-shimmer-base) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;animation:bt-shimmer 2.2s steps(60) infinite;--bt-shimmer-base:color-mix(in srgb,var(--bt-ink) 40%,transparent)}
@keyframes bt-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
/* New rows slide up; a reply that replaces the activity row grows out of its corner. */
[data-bt-enter="new"]{animation:bt-row-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
[data-bt-enter="after-collapse"]{transform-origin:0 100%;animation:bt-row-after .24s cubic-bezier(.23,1,.32,1) .38s backwards}
@keyframes bt-row-in{from{transform:translateY(12px)}to{transform:none}}
@keyframes bt-row-after{0%{opacity:0;transform:translateY(12px) scale(.94)}55%{opacity:1}100%{opacity:1;transform:none}}
@media (prefers-reduced-motion:reduce){
.bt-typing,.bt-typing[data-exiting]{animation-name:bt-fade-in;animation-duration:.12s;transform:none}
.bt-typing[data-exiting]{animation-name:bt-fade-out}
.bt-typing-text,.bt-typing-label{animation-name:bt-fade-in;animation-delay:0s}
.bt-shimmer{animation:none;background:none;color:var(--bt-ink-2)}
[data-bt-enter="new"]{animation:none}
[data-bt-enter="after-collapse"]{animation:bt-fade-in .12s ease-out}
}
@keyframes bt-fade-in{from{opacity:0}to{opacity:1}}
@keyframes bt-fade-out{from{opacity:1}to{opacity:0}}
[data-composer-card]{display:flex!important;flex-direction:row!important;flex-wrap:wrap!important;align-items:center!important;gap:0!important;min-height:44px!important;border-radius:22px!important;padding:7.5px!important;box-sizing:border-box;background:var(--bt-main)!important;border:.5px solid var(--bt-line-2)!important;box-shadow:0 2px 8px -1px rgba(0,0,0,.05),0 1px 2px rgba(0,0,0,.03),0 0 0 1px rgba(228,228,228,.04)!important;transition:border-color .15s ease,background-color .15s ease,${spring(SPRING_SHAPE, "border-radius")}!important}
[data-composer-card]:hover,[data-composer-card]:focus-within{border-color:color-mix(in srgb,var(--bt-ink) 30%,transparent)!important}
[data-composer-card]:has(> [data-slot="conversation.input.attachments"] *),[data-composer-card]:has([data-composer-input] br + *),[data-composer-card]:has([data-composer-input] > :nth-child(2)){border-radius:18px!important}
[class*="_root"]:has(> [data-composer-card]){padding:0 11px 13px 16px!important}
[class*="_root"]:has(> [data-composer-card])>[data-composer-card]{max-width:min(992px,100%)!important}
[data-composer-card]>[class*="_row"]{display:contents!important}
[data-composer-card] [class*="_tools"]{order:1!important;flex:none!important;align-self:flex-end!important;margin:0!important}
[data-composer-card]>[data-input-scroll]{order:2!important;flex:1 1 0!important;min-width:0!important;padding:0 8px!important;margin:0!important}
[data-composer-card] [class*="_trailing"]{order:3!important;flex:none!important;align-self:flex-end!important;margin:0!important}
[data-composer-card]>[data-slot="conversation.input.attachments"]{order:0!important;flex-basis:100%!important}
[data-composer-card] [data-composer-input]{min-height:24px!important;padding:2px 0!important}
[data-composer-card] [data-composer-placeholder]{left:0!important;top:2px!important}
[data-composer-placeholder]{font-size:0!important;line-height:0!important}
/* The name sits on ::before so that ::after stays free for other composer skins. */
[data-composer-placeholder]::before{content:var(--bt-placeholder,"Message")!important;display:block!important;font-size:14px!important;line-height:24px!important;color:color-mix(in srgb,var(--bt-ink) 36%,transparent)!important}
/* The team's "+" (ComposerPlus) takes the seat of the shell's command-menu button. */
[data-composer-card] button[class*="_add"]{display:none!important}
.bt-plus{flex:none;width:28px;height:28px;padding:0;border:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--bt-ink) 5%,transparent);box-shadow:inset 0 0 0 .5px var(--bt-line);color:var(--bt-ink-2);cursor:pointer;transition:background-color .15s ease,color .15s ease,${spring(SPRING_TAP, "scale")}}
.bt-plus:hover,.bt-plus[aria-expanded=true]{background:color-mix(in srgb,var(--bt-ink) 10%,transparent);color:var(--bt-ink)}
.bt-plus:active{scale:.9}
.bt-plus svg{width:14px;height:14px;transition:${spring(SPRING_POP, "rotate")}}
.bt-plus[aria-expanded=true] svg{rotate:45deg}
.bt-plus-menu{min-width:180px}
[data-composer-card] [class*="_tools"]{gap:0!important}
[data-composer-card] [class*="_modes"]:empty{display:none!important}
[data-composer-card] [class*="_activity"]:not(:has([data-slot] > *)){display:none!important}
[data-composer-card] [class*="_trailing"]{gap:8px!important}
/* No display here: the engine hides these controls with [hidden] while the Bot works. */
[data-composer-card] [class*="_standardControls"]{align-items:center!important;gap:8px!important}
[data-composer-card] button[class*="_primary"]{width:28px!important;height:28px!important;background:var(--bt-accent)!important;color:var(--bt-accent-ink,#fff)!important;border-radius:50%!important;transition:opacity .15s ease,${spring(SPRING_TAP, "scale")};animation:bt-icon-swap ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
[data-composer-card] button[class*="_primary"]:hover:not(:disabled){opacity:.9}
[data-composer-card] button[class*="_primary"]:active:not(:disabled){scale:.9}
@keyframes bt-icon-swap{from{opacity:0;transform:scale(.5) rotate(-30deg)}}
[data-composer-card] button[class*="_primary"] svg{width:14px;height:14px}
[data-composer-card] button[class*="_primary"]:disabled{opacity:.35!important;cursor:default!important}
[data-composer-dock]{display:none!important}
[data-chain-overlay-fallback="conversation.composer"]:has(~ .bt-q){display:block!important;order:2}
.bt-q{order:1}
div:has(> nav [class*="_marks"]){display:none!important}
/* Every user-side bubble (sent, steering mid-turn, not yet admitted, question replies)
   takes its surface and its text from the one --bt-user pair: a skin that repaints
   the host's bubble surface alone would otherwise leave the text unreadable. */
[class*="_userRow"] [class*="_bubble"],[data-chat-flow-kind=question-reply] [class*="_bubble"],[data-chat-flow-kind=command-input] [class*="_bubble"]{background:var(--bt-user)!important;color:var(--bt-user-ink)!important;border-radius:18px 18px 6px 18px!important;padding:7px 12px!important;font-size:var(--dsh-content-font-size,14px)!important;line-height:calc(var(--dsh-content-font-size,14px) + 8px)!important}
[class*="_userRow"] [class*="_bubble"] [class*="_markdown"],[class*="_userRow"] [class*="_bubble"] a{color:inherit}
/* Sent messages get the hover toolbar below; steering and unsent bubbles keep none. */
[class*="_userRow"] [class*="_actions"]{display:none!important}
[data-chat-flow-kind=user] [class*="_userRow"]{flex-direction:row-reverse;align-items:center;justify-content:flex-start}
[data-chat-flow-kind=user] [class*="_actions"]{display:flex!important;height:24px!important;gap:2px!important;opacity:0!important;visibility:hidden;transition:opacity .12s ease,visibility .12s!important;flex:none}
[data-chat-flow-kind=user] [class*="_userRow"]:hover [class*="_actions"],[data-chat-flow-kind=user] [class*="_userRow"]:focus-within [class*="_actions"]{opacity:1!important;visibility:visible}
[data-chat-flow-kind=user] [class*="_actions"] [class*="_timeStart"]{display:none}
[data-chat-flow-kind=user] [class*="_actions"] button{width:24px;height:24px;border-radius:6px;color:var(--bt-ink-2)}
[data-chat-flow-kind=user] [class*="_actions"] button:hover{background:var(--bt-hover);color:var(--bt-ink)}
[data-chat-flow-kind=user] [class*="_actions"] svg{width:15px;height:15px}
.bt-q-inline{display:flex;margin:4px 0 6px}
[data-chat-flow-kind=assistant-step]+[data-step-process]:has(.bt-q-inline){margin-top:0!important}
[data-chat-flow-kind=question-reply]:has(.bt-q-inline),[data-chat-group-key]:has([data-chat-flow-kind=question-reply] .bt-q-inline),[data-chat-group-key]:has(.bt-q-gone){margin-top:0!important}
.bt-q-inline .bt-q{margin:0;max-width:min(550px,86%);order:0}
.bt-q-dock{width:100%;display:flex;justify-content:center}
.bt-q-dock .bt-q{margin:0 auto 8px}
[class*="_toBottomSlot"]{justify-content:center!important;padding-right:0!important}
[data-conversation-scroll] [class*="_toBottomSlot"]{bottom:calc(var(--dsh-composer-height,152px) + 8px)!important}
[class*="_toBottomSlot"]>button{width:36px!important;height:36px!important;margin-top:-36px!important;background:var(--bt-main)!important;color:var(--bt-ink)!important;box-shadow:0 0 0 .5px var(--bt-line-2),0 2px 8px -2px rgba(0,0,0,.12)!important;animation:bt-tobottom-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .16s ease-out;transition:background-color .12s ease,${spring(SPRING_TAP, "scale")}}
[class*="_toBottomSlot"]>button:active{scale:.9}
[class*="_toBottomSlot"]>button:hover{background:color-mix(in srgb,var(--bt-ink) 4%,var(--bt-main))!important}
[class*="_toBottomSlot"]>button svg{display:none}
[class*="_toBottomSlot"]>button::before{content:"";width:20px;height:20px;background:currentColor;-webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 4v12M5 11l5 5 5-5'/%3E%3C/svg%3E") center/contain no-repeat;mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 4v12M5 11l5 5 5-5'/%3E%3C/svg%3E") center/contain no-repeat}
@keyframes bt-tobottom-in{from{translate:0 8px;scale:.8}}
[data-bt-news] [class*="_toBottomSlot"]>button{visibility:hidden!important;pointer-events:none!important}
.bt-news{position:fixed;z-index:30;transform:translateX(-50%);display:inline-flex;align-items:center;overflow:hidden;border-radius:999px;background:var(--bt-accent);color:var(--bt-accent-ink);box-shadow:inset 0 0 0 1px rgba(20,20,20,.05),0 1px 3px 0 rgba(0,0,0,.12);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;animation:bt-news-in ${SPRING_TAP.duration}ms ${SPRING_TAP.easing},bt-veil-in .16s ease-out}
@keyframes bt-news-in{from{translate:0 8px;scale:.9}}
.bt-news[data-direction=up]{animation-name:bt-news-in-up,bt-veil-in}
@keyframes bt-news-in-up{from{translate:0 -8px;scale:.9}}
.bt-news-jump{display:inline-flex;align-items:center;gap:2px;margin:0;padding:4px 26px 4px 4px;border:0;border-radius:0;background:transparent;color:inherit;font:inherit;font-size:13px;line-height:18px;white-space:nowrap;cursor:pointer;outline:none}
.bt-news-ico{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px}
.bt-news-ico svg{width:16px;height:16px}
.bt-news-x{position:absolute;right:4px;top:50%;z-index:1;transform:translateY(-50%);width:20px;height:20px;padding:0;border:0;border-radius:999px;background:transparent;color:inherit;opacity:.75;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.bt-news-x svg{width:12px;height:12px}
.bt-news-x:hover{opacity:1;background:rgba(20,20,20,.5)}
@media (prefers-reduced-motion:reduce){.bt-news,[class*="_toBottomSlot"]>button{animation:none}}
.bt-new-sep{display:flex;align-items:center;gap:8px;margin:14px 0 8px;padding:2px 0;font-size:11px;line-height:14px;font-weight:500;letter-spacing:.02em;text-transform:uppercase;color:var(--bt-accent);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
.bt-new-sep::before,.bt-new-sep::after{content:"";flex:1;height:1px;background:color-mix(in srgb,var(--bt-accent) 20%,transparent)}
.bt-open-new{display:flex;flex-direction:column}
.bt-open-new .bt-new-sep{margin:18px 0 0}
.bt-open-new .bt-time-sep{height:16px;margin:32px 0 2px}
.bt-earlier{display:flex;flex-direction:column;gap:6px}
.bt-earlier-top{display:flex;justify-content:center;align-items:center;height:34px;flex:none}
.bt-earlier-top .bt-soft{height:28px;font-size:12px;padding:0 12px}
.bt-urow{display:flex;justify-content:flex-end}
.bt-ububble{max-width:min(560px,78%);background:var(--bt-user);color:var(--bt-user-ink);border-radius:18px;padding:7px 12px;font-size:14px;line-height:20px;box-sizing:border-box;overflow-wrap:anywhere}
.bt-ububble [class*="_markdown"],.bt-ububble a{color:inherit!important}
.bt-ububble p{margin:0;line-height:22px}
.bt-uimages{display:block;font-size:12px;opacity:.7}
.bt-utime{margin-top:-4px;font-size:11px;line-height:14px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-earlier .bt-event{margin:4px 0}
.bt-part-line{display:flex;align-items:center;gap:10px;margin:10px 0 6px;font-size:11px;line-height:14px;color:var(--bt-ink-3)}
.bt-part-line::before,.bt-part-line::after{content:"";flex:1;height:1px;background:var(--bt-line)}
`;
var PLUGIN_ID = "apmixbot";
function installStyles(text, tag) {
  const style = document.createElement("style");
  style.dataset.dshBot = tag;
  style.dataset.plugin = PLUGIN_ID;
  style.textContent = text;
  document.head.appendChild(style);
  return style;
}
var FRAGMENT_SELECTOR = /\[class\*="(_[\w-]+)"\]/g;
var CLASS_TOKEN = /\.((?:\\.|[\w-])+)/g;
function sheetClassNames(sheet) {
  const names = [];
  const visit = (rules) => {
    for (const rule of rules) {
      if (rule.selectorText) for (const match of rule.selectorText.matchAll(CLASS_TOKEN)) names.push(match[1]);
      if (rule.cssRules) visit(rule.cssRules);
    }
  };
  try {
    visit(sheet.cssRules);
  } catch {
  }
  return names;
}
function compileFragmentSelectors(text, names) {
  const compiled = /* @__PURE__ */ new Map();
  return text.replace(FRAGMENT_SELECTOR, (whole, fragment) => {
    if (!compiled.has(fragment)) {
      const exact = [];
      for (const name of names) if (name.includes(fragment)) exact.push(`.${name}`);
      compiled.set(fragment, exact.length ? `:is(${exact.join(",")})` : whole);
    }
    return compiled.get(fragment);
  });
}
function installCompiledStyles(text, tag) {
  const style = installStyles("", tag);
  let disposed = false;
  const cache = /* @__PURE__ */ new WeakMap();
  const render = () => {
    if (disposed) return;
    if (!style.isConnected) document.head.appendChild(style);
    const names = /* @__PURE__ */ new Set();
    for (const sheet of document.styleSheets) {
      if (sheet.ownerNode?.dataset?.dshBot) continue;
      let list = cache.get(sheet);
      if (!list) {
        list = sheetClassNames(sheet);
        cache.set(sheet, list);
      }
      for (const name of list) names.add(name);
    }
    const next = compileFragmentSelectors(text, names);
    if (style.textContent !== next) style.textContent = next;
  };
  render();
  let timer;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  };
  const onLoad = (event) => {
    if (event.target instanceof HTMLLinkElement) schedule();
  };
  const shell = (node) => node.dataset?.dshBot === void 0;
  const observer = new MutationObserver((records) => {
    if (records.some((record) => [...record.removedNodes].includes(style))) render();
    if (records.some((record) => [...record.addedNodes, ...record.removedNodes].some(shell))) schedule();
  });
  observer.observe(document.head, { childList: true });
  document.addEventListener("load", onLoad, true);
  return () => {
    disposed = true;
    observer.disconnect();
    document.removeEventListener("load", onLoad, true);
    clearTimeout(timer);
    style.remove();
  };
}

// src/client/mark.js
var import_react2 = require("react");
var STATES = ["idle", "thinking", "searching", "working", "sending", "orbit", "waiting", "alert", "done"];
var botState = (running, activity, alert) => running ? STATES.includes(activity) && activity !== "waiting" ? activity : "working" : alert ? "alert" : activity === "waiting" ? "waiting" : "idle";
var toolState = (name) => /^(message_bot|stop_bot|create_bot|update_bot|create_group|update_group|delete_group|post_to_group)$/.test(name) ? "sending" : /search|fetch|browse|read|grep|glob|list|recall/i.test(name) ? "searching" : "working";
function useGaze(ref, enabled) {
  (0, import_react2.useEffect)(() => {
    if (!enabled) return void 0;
    let frame = 0;
    let point = null;
    const place = () => {
      frame = 0;
      const node = ref.current;
      if (!node || !point) return;
      const box2 = node.getBoundingClientRect();
      const clamp = (value) => Math.max(-1, Math.min(1, value));
      node.style.setProperty("--bt-gx", clamp((point.x - box2.left - box2.width / 2) / 160).toFixed(2));
      node.style.setProperty("--bt-gy", clamp((point.y - box2.top - box2.height / 2) / 160).toFixed(2));
    };
    const onMove = (event) => {
      point = { x: event.clientX, y: event.clientY };
      if (!frame) frame = requestAnimationFrame(place);
    };
    const onLeave = () => {
      point = null;
      ref.current?.style.setProperty("--bt-gx", "0");
      ref.current?.style.setProperty("--bt-gy", "0");
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);
}
var FIDGETS = ["tilt", "beep", "bounce", "scan"];
function BotMark({ bot, look: given, size = 36, state = "idle", live = false, gaze = false, pokeable = false, label }) {
  const look = given ?? lookOf(bot);
  const ref = (0, import_react2.useRef)(null);
  const maskId = (0, import_react2.useRef)("");
  if (maskId.current === "") maskId.current = `bt-mark-${nextMarkSerial()}`;
  const [poked, setPoked] = (0, import_react2.useState)(false);
  const [broken, setBroken] = (0, import_react2.useState)("");
  const image = look.image && look.image !== broken ? look.image : void 0;
  useGaze(ref, gaze);
  const common = {
    ref,
    className: poked ? "bt-mark bt-mark-poke" : "bt-mark",
    "data-shape": image ? "image" : shapeId(look.shape),
    "data-state": STATES.includes(state) ? state : "idle",
    "data-live": live ? "" : void 0,
    "data-fidget": live ? FIDGETS[fnv1a(`${bot?.id ?? ""}:fidget`) % FIDGETS.length] : void 0,
    "data-gaze": gaze ? "" : void 0,
    "data-poke": pokeable ? "" : void 0,
    style: { width: size, height: size, ...live ? { "--bt-delay": `${-(fnv1a(String(bot?.id ?? "")) % 5e3) / 1e3}s`, "--bt-fidget-delay": `${-(fnv1a(`${bot?.id ?? ""}:when`) % 9e3) / 1e3}s` } : {} },
    role: label ? "img" : void 0,
    "aria-label": label,
    "aria-hidden": label ? void 0 : true,
    onClick: pokeable ? () => setPoked(true) : void 0,
    onAnimationEnd: poked ? (event) => {
      if (/^bt-poke/.test(event.animationName)) setPoked(false);
    } : void 0
  };
  if (image) return (0, import_react2.createElement)("span", common, (0, import_react2.createElement)("img", { className: "bt-mark-img", src: image, alt: "", draggable: false, onError: () => setBroken(image) }));
  const box2 = shapeOf(look.shape).size;
  return (0, import_react2.createElement)("span", common, (0, import_react2.createElement)("svg", { viewBox: `0 0 ${box2} ${box2}`, dangerouslySetInnerHTML: { __html: characterMarkup(look.shape, look.color).replaceAll(MASK_ID, maskId.current) } }));
}
function StarIcon({ size = 8 }) {
  return (0, import_react2.createElement)(
    "svg",
    { width: size, height: size, viewBox: "0 0 10 10", "aria-hidden": true },
    (0, import_react2.createElement)("path", { d: "M5 .6l1.3 2.8 3 .3-2.3 2 .7 3L5 7.2 2.3 8.7l.7-3L.7 3.7l3-.3z", fill: "#fff" })
  );
}
function AdminStar() {
  return (0, import_react2.createElement)("span", { className: "bt-admin-star", role: "img", "aria-label": t("Admin") }, (0, import_react2.createElement)(StarIcon, { size: 7 }));
}
function MainStar() {
  return (0, import_react2.createElement)(
    "svg",
    { viewBox: "0 0 20 20", "aria-hidden": true },
    (0, import_react2.createElement)("path", { d: "M10 2.4l2.29 5.04 5.51.63-4.09 3.74 1.11 5.42L10 14.5l-4.82 2.73 1.11-5.42L2.2 8.07l5.51-.63z" })
  );
}
function useSettled(state) {
  const prev = (0, import_react2.useRef)(state);
  const [settled, setSettled] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    const was = prev.current;
    prev.current = state;
    if (state !== "idle") {
      setSettled(false);
      return void 0;
    }
    if (was === "idle" || was === "alert") return void 0;
    setSettled(true);
    const timer = setTimeout(() => setSettled(false), 1800);
    return () => clearTimeout(timer);
  }, [state]);
  return settled;
}
function BotAvatar({ bot, size, state = "idle", main, admin, badge = true, live = true, gaze = false, pokeable = false }) {
  const settled = useSettled(state);
  if (bot === void 0) return (0, import_react2.createElement)(BotMark, { size });
  const badgeKind = !badge ? null : state === "alert" ? "alert" : state !== "idle" && state !== "waiting" ? "working" : admin ? "admin" : main ? "main" : null;
  return (0, import_react2.createElement)(
    "span",
    { className: "bt-mark", style: { width: size, height: size, "--bt-size": `${size}px` } },
    (0, import_react2.createElement)(BotMark, { bot, size, state: settled ? "done" : state, live, gaze, pokeable }),
    badgeKind === "working" ? (0, import_react2.createElement)("span", { className: "bt-badge bt-badge-working", "aria-label": t("Working"), role: "img" }) : null,
    badgeKind === "alert" ? (0, import_react2.createElement)("span", { className: "bt-badge bt-badge-alert", "aria-label": t("Waiting for your answer"), role: "img" }, "?") : null,
    badgeKind === "admin" ? (0, import_react2.createElement)("span", { className: "bt-badge bt-badge-admin", "aria-label": t("Admin"), role: "img" }, (0, import_react2.createElement)(StarIcon)) : null,
    badgeKind === "main" ? (0, import_react2.createElement)("span", { className: "bt-badge bt-badge-main", "aria-label": t("Main Bot"), role: "img" }, (0, import_react2.createElement)(MainStar)) : null
  );
}
function clusterSeats(count, frame) {
  if (count === 1) return [[0, 0, frame]];
  if (count === 2) return [[0, 0, frame * 2 / 3], [frame / 3, frame / 3, frame * 2 / 3]];
  if (count === 3) {
    const size = frame * 5 / 9;
    const rest = frame - size;
    return [[rest / 2, 0, size], [0, rest, size], [rest, rest, size]];
  }
  const half = frame / 2;
  return [[0, 0, half], [half, 0, half], [0, half, half], [half, half, half]];
}
function RoomAvatar({ room: room2, roster, size = 36 }) {
  const members = room2.members.map((id) => roster.byId[id]).filter(Boolean);
  const people = members.length === 1 ? [members[0], null] : members;
  const seat = (bot, seatSize, key) => bot ? (0, import_react2.createElement)(BotMark, { key, bot, size: seatSize }) : (0, import_react2.createElement)("span", { key, className: "bt-cluster-you", style: { width: seatSize * 0.92, height: seatSize * 0.92, margin: seatSize * 0.04 } });
  if (people.length === 0) return (0, import_react2.createElement)(BotMark, { size });
  if (size <= 20 && people.length > 1) {
    return (0, import_react2.createElement)(
      "span",
      { className: "bt-stack", style: { "--bt-stack-size": `${size}px` } },
      people.slice(0, 3).map((bot, index) => seat(bot, size, bot?.id ?? `you-${index}`)),
      people.length > 3 ? (0, import_react2.createElement)("span", { className: "bt-stack-more" }, `+${people.length - 3}`) : null
    );
  }
  const seats = clusterSeats(Math.min(people.length, 4), size);
  const overflow = people.length > 4 ? people.length - 3 : 0;
  const gap = size / 14;
  const rings = seats.map(([x, y, s]) => ({ cx: x + s / 2, cy: y + s / 2, r: s * 0.48 + gap }));
  return (0, import_react2.createElement)(
    "span",
    { className: "bt-cluster", style: { width: size, height: size } },
    seats.map(([x, y, s], index) => {
      const holes2 = rings.slice(index + 1).filter((ring) => Math.hypot(ring.cx - x - s / 2, ring.cy - y - s / 2) < ring.r + s * 0.46).map((ring) => `radial-gradient(circle at ${ring.cx - x}px ${ring.cy - y}px,transparent ${ring.r}px,#000 ${ring.r + 0.5}px)`);
      const style = { left: x, top: y, width: s, height: s };
      if (holes2.length > 0) Object.assign(style, { WebkitMaskImage: holes2.join(","), maskImage: holes2.join(","), WebkitMaskComposite: "source-in", maskComposite: "intersect" });
      if (overflow > 0 && index === 3) {
        return (0, import_react2.createElement)("span", { key: "more", className: "bt-cluster-more", style: { ...style, width: s * 0.92, height: s * 0.92, margin: s * 0.04, fontSize: Math.max(8, Math.round(s * 0.36)) } }, `+${overflow}`);
      }
      const bot = people[index];
      return (0, import_react2.createElement)("span", { key: bot?.id ?? "you", style }, seat(bot, s));
    })
  );
}

// src/client/icons.js
var import_react3 = require("react");
function PlusIcon() {
  return (0, import_react3.createElement)("svg", { width: 18, height: 18, viewBox: "0 0 20 20", "aria-hidden": true }, (0, import_react3.createElement)("path", { d: "M10 3.5v13M3.5 10h13", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }));
}
function SearchIcon() {
  return (0, import_react3.createElement)("svg", { width: 16, height: 16, viewBox: "0 0 20 20", "aria-hidden": true }, (0, import_react3.createElement)("circle", { cx: 8.5, cy: 8.5, r: 5.5, stroke: "currentColor", strokeWidth: 1.6, fill: "none" }), (0, import_react3.createElement)("path", { d: "M13 13l4 4", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }));
}
function SidebarIcon() {
  return (0, import_react3.createElement)(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, "aria-hidden": true },
    (0, import_react3.createElement)("rect", { x: 3, y: 4, width: 14, height: 12, rx: 2.5 }),
    (0, import_react3.createElement)("path", { d: "M8 4v12" })
  );
}
function PeopleIcon() {
  return (0, import_react3.createElement)(
    "svg",
    { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", "aria-hidden": true },
    (0, import_react3.createElement)("circle", { cx: 7.5, cy: 7, r: 3 }),
    (0, import_react3.createElement)("path", { d: "M2 16.5c.6-2.8 2.8-4.5 5.5-4.5s4.9 1.7 5.5 4.5" }),
    (0, import_react3.createElement)("path", { d: "M13 4.3a3 3 0 0 1 0 5.4M15 12.4c1.6.6 2.6 2 3 4.1" })
  );
}
function ArrowUpIcon() {
  return (0, import_react3.createElement)("svg", { width: 16, height: 16, viewBox: "0 0 20 20", "aria-hidden": true }, (0, import_react3.createElement)("path", { d: "M10 16V4M5 9l5-5 5 5", stroke: "currentColor", strokeWidth: 1.8, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }));
}
function ShareIcon() {
  return (0, import_react3.createElement)(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    (0, import_react3.createElement)("path", { d: "M10 12.5V3M6.5 6.5L10 3l3.5 3.5M4 11v4.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V11" })
  );
}
function CloseIcon() {
  return (0, import_react3.createElement)("svg", { width: 16, height: 16, viewBox: "0 0 20 20", "aria-hidden": true }, (0, import_react3.createElement)("path", { d: "M5 5l10 10M15 5L5 15", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" }));
}
var ChevronLeftIcon = () => (0, import_react3.createElement)("svg", { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, (0, import_react3.createElement)("path", { d: "M12.5 4.5L7 10l5.5 5.5" }));
var ChevronRightIcon = () => (0, import_react3.createElement)("svg", { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, (0, import_react3.createElement)("path", { d: "M7.5 4.5L13 10l-5.5 5.5" }));
var lineIcon = (paths) => function LineIcon() {
  return (0, import_react3.createElement)(
    "svg",
    { width: 15, height: 15, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    paths.map((d, index) => (0, import_react3.createElement)("path", { key: index, d }))
  );
};
var CLOUD = "M6.5 15.25H5.75a3.25 3.25 0 0 1-.55-6.45 4.75 4.75 0 0 1 9.2-1.1 3.75 3.75 0 0 1 .1 7.55H13.5";
function CloudDownloadIcon({ done = false }) {
  return (0, import_react3.createElement)(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    (0, import_react3.createElement)("path", { d: CLOUD }),
    done ? (0, import_react3.createElement)("path", { d: "M7.75 13.25l1.75 1.75 3-3.25" }) : (0, import_react3.createElement)("g", { className: "bt-cloud-arrow" }, (0, import_react3.createElement)("path", { d: "M10 9.75v7" }), (0, import_react3.createElement)("path", { d: "M7.75 14.5L10 16.75l2.25-2.25" }))
  );
}
var SmileIcon = lineIcon(["M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z", "M7.3 11.6a3.4 3.4 0 0 0 5.4 0", "M7.75 8.25h.01M12.25 8.25h.01"]);
var ReplyIcon = lineIcon(["M8 5L4 9l4 4", "M4 9h7.5a4.5 4.5 0 0 1 4.5 4.5V15"]);
var DotsIcon = lineIcon(["M5 10h.01M10 10h.01M15 10h.01"]);
var CheckIcon = lineIcon(["M4.5 10.5l3.5 3.5 7.5-8"]);
var ArrowDownIcon = lineIcon(["M10 4v12", "M5 11l5 5 5-5"]);
var DownloadIcon = lineIcon(["M10 3.5v9", "M6.5 9.5L10 13l3.5-3.5", "M4 16h12"]);
var GaugeIcon = lineIcon(["M3.5 13.5a6.5 6.5 0 1 1 13 0", "M10 13.5l3-4", "M10 13.5h.01"]);
var PlugIcon = lineIcon(["M7 3v4M13 3v4", "M5 7h10v2.5a5 5 0 0 1-10 0z", "M10 14.5V17"]);
var CalendarIcon = lineIcon(["M5.5 5h9A1.5 1.5 0 0 1 16 6.5v8a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14.5v-8A1.5 1.5 0 0 1 5.5 5z", "M4 8.75h12", "M7.25 3.5v3M12.75 3.5v3"]);
var ConnectorIcon = lineIcon(["M7 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z", "M18 10a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z", "M7 10h6"]);
var SwitchIcon = lineIcon(["M4 7h9.5M10.5 3.5L14 7l-3.5 3.5", "M16 13H6.5M9.5 9.5L6 13l3.5 3.5"]);
var PaperclipIcon = lineIcon(["M15.5 9.5l-5.6 5.6a3.4 3.4 0 0 1-4.8-4.8l6.1-6.1a2.25 2.25 0 0 1 3.2 3.2l-6 6a1.1 1.1 0 0 1-1.6-1.6l5.5-5.5"]);
var ClockIcon = lineIcon(["M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z", "M10 6.5V10l2.5 1.5"]);
function AgentIcon({ size = 18 }) {
  return (0, import_react3.createElement)(
    "svg",
    { width: size, height: size, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    (0, import_react3.createElement)("path", { d: "M4.5 3.5h11A1.5 1.5 0 0 1 17 5v10a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15V5a1.5 1.5 0 0 1 1.5-1.5z" }),
    (0, import_react3.createElement)("path", { d: "M6.5 8l2.5 2-2.5 2" }),
    (0, import_react3.createElement)("path", { d: "M10.5 12.5h3" })
  );
}
var GearIcon = lineIcon(["M10 7.4a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z", "M7.85 4.4l.29-1.87a7.7 7.7 0 0 1 3.72 0l.29 1.87a6 6 0 0 1 1.63.94l1.76-.69a7.7 7.7 0 0 1 1.86 3.23l-1.47 1.18a6 6 0 0 1 0 1.88l1.47 1.18a7.7 7.7 0 0 1-1.86 3.23l-1.76-.69a6 6 0 0 1-1.63.94l-.29 1.87a7.7 7.7 0 0 1-3.72 0l-.29-1.87a6 6 0 0 1-1.63-.94l-1.76.69a7.7 7.7 0 0 1-1.86-3.23l1.47-1.18a6 6 0 0 1 0-1.88L2.6 7.88a7.7 7.7 0 0 1 1.86-3.23l1.76.69a6 6 0 0 1 1.63-.94z"]);
var PinIcon = lineIcon(["M12.5 3l4.5 4.5-3 1.5-2.5 2.5.5 3.5-1.5 1.5L7 13 3.5 16.5", "M7 13l-3.5-3.5L5 8l3.5.5L11 6l1.5-3"]);
function PinMarkIcon() {
  return (0, import_react3.createElement)(
    "svg",
    { width: 12, height: 12, viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": true },
    (0, import_react3.createElement)(
      "g",
      { transform: "rotate(45 10 10)" },
      (0, import_react3.createElement)("path", { d: "M8 2.5h4a.9.9 0 0 1 0 1.8h-.4v4.1c0 1.4 1.1 2.6 2.6 3.1l.7.3v1.5H5.1v-1.5l.7-.3c1.5-.5 2.6-1.7 2.6-3.1V4.3H8a.9.9 0 0 1 0-1.8z" }),
      (0, import_react3.createElement)("path", { d: "M9.35 13.3h1.3v3.6L10 18l-.65-1.1z" })
    )
  );
}
var UnreadIcon = lineIcon(["M10 3.5a4.5 4.5 0 0 0-4.5 4.5v3L4 13.5h12L14.5 11V8", "M8.3 16a1.8 1.8 0 0 0 3.4 0", "M15.5 3.2a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z"]);
var PencilIcon = lineIcon(["M9 4H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3", "M14.3 3.7a1.6 1.6 0 0 1 2.3 2.3L10.5 12l-3 .8.8-3z"]);
var InfoIcon = lineIcon(["M10 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z", "M10 9.25v4", "M10 6.6h.01"]);
var StarLineIcon = lineIcon(["M10 3l2.1 4.3 4.7.7-3.4 3.3.8 4.7L10 13.8 5.8 16l.8-4.7L3.2 8l4.7-.7z"]);
var CopyIcon = lineIcon(["M8.5 7h6A1.5 1.5 0 0 1 16 8.5v6a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 7 14.5v-6A1.5 1.5 0 0 1 8.5 7z", "M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4H13"]);
var HideIcon = lineIcon(["M3 3l14 14", "M8.6 5.2A7.6 7.6 0 0 1 10 5c4.5 0 7 5 7 5a12.6 12.6 0 0 1-2 2.6M12.2 14.5A6.8 6.8 0 0 1 10 15c-4.5 0-7-5-7-5a12.4 12.4 0 0 1 3-3.4", "M8.5 8.5a2 2 0 0 0 3 3"]);
var TrashIcon = lineIcon(["M3.5 5.5h13", "M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5", "M5 5.5l.7 10A1.5 1.5 0 0 0 7.2 17h5.6a1.5 1.5 0 0 0 1.5-1.5l.7-10", "M8.5 9v4.5M11.5 9v4.5"]);
var EraseIcon = lineIcon(["M10.6 4.1a1.4 1.4 0 0 1 2 0l3.3 3.3a1.4 1.4 0 0 1 0 2L9.5 15.8a1.4 1.4 0 0 1-1 .4H6.3a1.4 1.4 0 0 1-1-.4L4.1 14.6a1.4 1.4 0 0 1 0-2z", "M7.4 7.3l5.3 5.3", "M10.5 16.2H16"]);
var DuplicateIcon = lineIcon(["M7 7h8.5v9.5H7z", "M4.5 13V3.5H13", "M11.25 9.5v4.5M9 11.75h4.5"]);
var SlidersIcon = lineIcon(["M4 6.5h5M12.5 6.5H16M4 13.5h4M11.5 13.5H16", "M10.5 4.5v4M9.5 11.5v4"]);
var MemoryIcon = lineIcon(["M5.5 3.5h8A1.5 1.5 0 0 1 15 5v10a1.5 1.5 0 0 1-1.5 1.5h-8z", "M5.5 3.5v13", "M8.5 7.5h3.5M8.5 10.5h2.5", "M12 3.5v4l1-.8 1 .8"]);
var SidePanelIcon = lineIcon(["M4.5 4h11A1.5 1.5 0 0 1 17 5.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5v-9A1.5 1.5 0 0 1 4.5 4z", "M12.5 4v12"]);
var FolderIcon = lineIcon(["M3 6A1.5 1.5 0 0 1 4.5 4.5h3.2l1.8 2h6A1.5 1.5 0 0 1 17 8v6.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 14.5z"]);
var ChatsIcon = lineIcon(["M3.5 5.5A1.5 1.5 0 0 1 5 4h7a1.5 1.5 0 0 1 1.5 1.5V10A1.5 1.5 0 0 1 12 11.5H8L5 14v-2.5A1.5 1.5 0 0 1 3.5 10z", "M13.5 7.5H15A1.5 1.5 0 0 1 16.5 9v4.5A1.5 1.5 0 0 1 15 15v2l-2.5-2h-3A1.5 1.5 0 0 1 8 13.5V13"]);
var SETTINGS_ICONS = { general: GearIcon, bots: PeopleIcon, groups: ChatsIcon, usage: GaugeIcon };

// src/client/dsh-primitives.js
var import_dsh_client_ui_primitives = require("@apmixbot/dsh-client-ui-primitives");

// src/client/card-hold.js
var import_react4 = require("react");
function useDockHold(sessionId, kind, requestId, actions, inline) {
  const release = (0, import_react4.useRef)(null);
  const note = actions.noteHeldCard;
  (0, import_react4.useLayoutEffect)(() => () => {
    const stop = release.current;
    release.current = null;
    stop?.();
  }, [sessionId, kind, requestId, note, inline]);
  return () => {
    if (inline || release.current || !note) return;
    release.current = () => note(sessionId, kind, requestId, -1);
    note(sessionId, kind, requestId, 1);
  };
}

// src/client/questions.js
var import_react5 = require("react");
var keyLetter = (index) => String.fromCharCode(65 + index);
var optionsOf = (question) => (question?.options ?? []).map((option) => typeof option === "string" ? { label: option } : option);
var isTypingTarget = (node) => node instanceof HTMLInputElement || node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement || node instanceof HTMLElement && node.isContentEditable;
function useOptionKeys(count, onPick, ownRef) {
  const pick = (0, import_react5.useRef)(onPick);
  pick.current = onPick;
  (0, import_react5.useEffect)(() => {
    if (count === 0) return void 0;
    const onKey = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.key.length !== 1) return;
      if (isTypingTarget(event.target) || isTypingTarget(document.activeElement)) return;
      if (document.querySelector('[role="dialog"], [aria-modal="true"]') !== null) return;
      const index = event.key.toUpperCase().charCodeAt(0) - 65;
      if (index >= 0 && index < count) {
        event.preventDefault();
        pick.current(index);
      } else if (index === count && ownRef.current) {
        event.preventDefault();
        ownRef.current.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [count, ownRef]);
}
function QuestionView({ question, onAnswer, onDismiss, onInteract, busy = false, ownAnswer = false, raised = false }) {
  const [own, setOwn] = (0, import_react5.useState)("");
  const [picked, setPicked] = (0, import_react5.useState)([]);
  const ownRef = (0, import_react5.useRef)(null);
  const titleId = (0, import_react5.useId)();
  const options = optionsOf(question);
  const multi = question.multiSelect === true;
  const custom = own.trim();
  const canSubmit = multi ? picked.length > 0 || custom !== "" : custom !== "";
  const choose = (label) => {
    if (busy) return;
    onInteract?.();
    if (multi) {
      setPicked((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
      return;
    }
    onAnswer({ selected: [label] });
  };
  const submit = () => {
    if (!canSubmit || busy) return;
    onInteract?.();
    onAnswer({ selected: multi ? picked : [], ...custom ? { custom } : {} });
  };
  useOptionKeys(busy ? 0 : options.length, (index) => choose(options[index].label), ownRef);
  const ownLetter = options.length > 0 ? keyLetter(options.length) : void 0;
  const field = ownAnswer ? (0, import_react5.createElement)("textarea", {
    ref: ownRef,
    rows: 1,
    value: own,
    readOnly: busy,
    autoComplete: "off",
    spellCheck: false,
    className: "bt-q-input",
    "aria-label": t("Your own answer"),
    placeholder: t("Type your own answer"),
    "aria-keyshortcuts": ownLetter?.toLowerCase(),
    onChange: (event) => {
      if (!busy) {
        onInteract?.();
        setOwn(event.target.value);
      }
    },
    onKeyDown: (event) => {
      if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
      event.preventDefault();
      submit();
    }
  }) : null;
  const rows = options.map((option, optionIndex) => {
    const selected = multi && picked.includes(option.label);
    return (0, import_react5.createElement)(
      "button",
      {
        key: option.label,
        type: "button",
        className: "bt-q-opt",
        disabled: busy,
        "aria-pressed": multi ? selected : void 0,
        "aria-keyshortcuts": keyLetter(optionIndex).toLowerCase(),
        onClick: () => choose(option.label)
      },
      (0, import_react5.createElement)("span", { className: "bt-key", "aria-hidden": true }, keyLetter(optionIndex)),
      (0, import_react5.createElement)(
        "span",
        { className: "bt-q-body" },
        (0, import_react5.createElement)("span", { className: "bt-q-label" }, option.label),
        option.description ? (0, import_react5.createElement)("span", { className: "bt-q-desc" }, option.description) : null
      ),
      selected && !raised ? (0, import_react5.createElement)("span", { className: "bt-q-check", title: t("Selected") }, (0, import_react5.createElement)(CheckIcon)) : null
    );
  });
  if (raised && field) {
    rows.push((0, import_react5.createElement)(
      "label",
      { key: "own", className: "bt-q-opt bt-q-ownrow", "data-filled": custom !== "" ? "" : void 0 },
      ownLetter ? (0, import_react5.createElement)("span", { className: "bt-key", "aria-hidden": true }, ownLetter) : null,
      (0, import_react5.createElement)("span", { className: "bt-q-body" }, field)
    ));
  }
  let foot = null;
  if (raised && multi) {
    foot = (0, import_react5.createElement)(
      "div",
      { className: "bt-q-foot" },
      (0, import_react5.createElement)("button", { type: "button", className: "bt-q-btn", onClick: onDismiss, disabled: busy }, t("Skip")),
      (0, import_react5.createElement)("button", { type: "submit", className: "bt-q-submit", disabled: !canSubmit || busy }, t("Submit"))
    );
  } else if ((raised || multi) && canSubmit) {
    foot = (0, import_react5.createElement)("div", { className: "bt-q-foot" }, (0, import_react5.createElement)("button", { type: "submit", className: "bt-q-submit", disabled: busy }, t("Submit")));
  }
  return (0, import_react5.createElement)(
    "form",
    {
      className: raised ? "bt-q bt-q-raised" : "bt-q",
      "aria-labelledby": titleId,
      "aria-busy": busy || void 0,
      onFocusCapture: onInteract,
      onPointerDownCapture: onInteract,
      onSubmit: (event) => {
        event.preventDefault();
        submit();
      }
    },
    (0, import_react5.createElement)(
      "div",
      { className: "bt-q-head" },
      (0, import_react5.createElement)(
        "div",
        { className: "bt-q-text" },
        (0, import_react5.createElement)("p", { className: "bt-q-title", id: titleId }, question.header ? `${question.header} · ` : "", question.question),
        question.detail ? (0, import_react5.createElement)("div", { className: "bt-q-detail" }, question.detail) : null,
        raised && multi ? (0, import_react5.createElement)("div", { className: "bt-q-detail" }, t("Choose all that apply")) : null
      ),
      (0, import_react5.createElement)("button", { type: "button", className: "bt-q-x", "aria-label": t("Dismiss question"), title: t("Dismiss"), onClick: onDismiss, disabled: busy }, (0, import_react5.createElement)(CloseIcon))
    ),
    rows.length > 0 ? (0, import_react5.createElement)("div", { className: "bt-q-list", role: "group" }, rows) : null,
    field && !raised ? (0, import_react5.createElement)(
      "div",
      { className: "bt-q-custom" },
      (0, import_react5.createElement)("label", { className: "bt-q-field" }, field),
      !multi && canSubmit ? (0, import_react5.createElement)("button", { type: "submit", className: "bt-q-submit", disabled: busy }, t("Submit")) : null
    ) : null,
    foot
  );
}
function SettledQuestion({ question, answer }) {
  const options = optionsOf(question);
  const prompt = question?.question ?? "";
  const chosen = [...answer.selected ?? [], ...answer.custom ? [answer.custom] : []];
  if (chosen.length === 0) {
    return (0, import_react5.createElement)(
      "div",
      { className: "bt-q bt-q-settled bt-q-dismissed", role: "group", "aria-label": prompt },
      (0, import_react5.createElement)(
        "div",
        { className: "bt-q-head" },
        (0, import_react5.createElement)("div", { className: "bt-q-text" }, (0, import_react5.createElement)("p", { className: "bt-q-title" }, prompt)),
        (0, import_react5.createElement)("span", { className: "bt-q-badge" }, t("Dismissed"))
      )
    );
  }
  return (0, import_react5.createElement)(
    "div",
    { className: "bt-q bt-q-settled", role: "group", "aria-label": prompt },
    prompt ? (0, import_react5.createElement)("div", { className: "bt-q-head" }, (0, import_react5.createElement)("div", { className: "bt-q-text" }, (0, import_react5.createElement)("p", { className: "bt-q-title" }, prompt))) : null,
    (0, import_react5.createElement)("div", { className: "bt-q-list", role: "group", "aria-label": t("Your answer") }, chosen.map((label, index) => {
      const optionIndex = options.findIndex((option) => option.label === label);
      return (0, import_react5.createElement)(
        "div",
        { key: `${label}-${index}`, className: "bt-q-opt" },
        optionIndex >= 0 ? (0, import_react5.createElement)("span", { className: "bt-key", "aria-hidden": true }, keyLetter(optionIndex)) : null,
        (0, import_react5.createElement)("span", { className: "bt-q-body" }, (0, import_react5.createElement)("span", { className: "bt-q-label" }, label)),
        (0, import_react5.createElement)("span", { className: "bt-q-check", title: t("Selected") }, (0, import_react5.createElement)(CheckIcon))
      );
    }))
  );
}
function QuestionCard({ matched }) {
  const pending = matched;
  const questions = pending.questions ?? [];
  const [index, setIndex] = (0, import_react5.useState)(0);
  const [answers, setAnswers] = (0, import_react5.useState)([]);
  const question = questions[index];
  if (question === void 0) return null;
  const onAnswer = (answer) => {
    const next = [...answers, { id: question.id, ...answer }];
    if (index + 1 < questions.length) {
      setAnswers(next);
      setIndex(index + 1);
      return;
    }
    pending.answer({ answers: next });
  };
  return (0, import_react5.createElement)(QuestionView, { key: index, question, onAnswer, onDismiss: () => pending.dismiss(), ownAnswer: true, raised: true });
}
function PendingQuestion({ sessionId, question, actions, inline }) {
  const [answered, setAnswered] = (0, import_react5.useState)(null);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const busyRef = (0, import_react5.useRef)(false);
  const hold = useDockHold(sessionId, "question", question.id, actions, inline);
  if (answered === question.id) return null;
  const run = (make) => {
    if (busyRef.current) return;
    hold();
    busyRef.current = true;
    setBusy(true);
    void Promise.resolve().then(make).then(() => setAnswered(question.id), () => setAnswered(null)).finally(() => {
      busyRef.current = false;
      setBusy(false);
    });
  };
  const onAnswer = (answer) => run(() => actions.answerQuestion(sessionId, question.id, { selected: answer.selected ?? [], custom: answer.custom ?? "" }));
  const onDismiss = () => run(() => actions.dismissQuestion(sessionId));
  return (0, import_react5.createElement)(
    "div",
    { className: inline ? "bt-q-inline" : "bt-q-dock" },
    (0, import_react5.createElement)(QuestionView, { key: question.id, question, onAnswer, onDismiss, onInteract: hold, busy, ownAnswer: question.allowCustom === true, raised: !inline })
  );
}
function QuestionDock({ sessionId, useRoster, useCards, useHeldCards, actions }) {
  const question = useRoster((value) => value.questions?.[sessionId]);
  const drawn = useCards?.((state) => state[sessionId]?.[question?.callId] > 0) === true;
  const held = useHeldCards?.((state) => state[sessionId]?.[heldCardKey("question", question?.id)] > 0) === true;
  if (question === void 0 || question.callId && drawn && !held) return null;
  return (0, import_react5.createElement)(PendingQuestion, { key: JSON.stringify([sessionId, question.id]), sessionId, question, actions, inline: false });
}
function AnsweredCell({ node }) {
  const data = node.data ?? {};
  const questions = Array.isArray(data.questions) ? data.questions : [];
  if (questions.length === 0) {
    return data.text ? (0, import_react5.createElement)("div", { className: "bt-urow" }, (0, import_react5.createElement)("div", { className: "bt-ububble" }, data.text)) : null;
  }
  const answers = Array.isArray(data.answers) ? data.answers : [];
  return (0, import_react5.createElement)("div", { className: "bt-q-inline" }, questions.map((question) => (0, import_react5.createElement)(SettledQuestion, {
    key: question.id,
    question,
    answer: answers.find((answer) => answer.id === question.id) ?? { selected: [] }
  })));
}

// src/shared/views.js
var COMPONENTS = ["stack", "text", "metric", "table", "options", "confirm", "form", "progress"];
var TONES = ["good", "warn", "bad"];
var INTERACTIVE = /* @__PURE__ */ new Set(["options", "confirm", "form"]);
var PROPS = {
  stack: ["children"],
  text: ["text"],
  metric: ["label", "value", "tone"],
  table: ["columns", "rows"],
  options: ["id", "options", "multi"],
  confirm: ["id", "confirmLabel", "cancelLabel"],
  form: ["id", "fields", "submitLabel"],
  progress: ["label", "percent"]
};
var MAX_DEPTH = 8;
var MAX_NODES = 64;
var MAX_CHILDREN = 16;
var MAX_TEXT = 2e3;
var MAX_CELL = 200;
var MAX_COLUMNS = 8;
var MAX_ROWS = 50;
var MAX_OPTIONS = 8;
var MAX_FIELDS = 6;
var SUMMARY_PART = 40;
var SUMMARY_COUNT = 8;
var VIEW_BYTE_LIMIT = 8192;
var isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
var quoted = (value) => JSON.stringify(value);
var allowed = (list) => list.join(", ");
function viewBytes(title, view) {
  return new TextEncoder().encode(`${JSON.stringify(view) ?? ""}${title ?? ""}`).length;
}
function normalizeView(value) {
  if (Array.isArray(value)) return value.map(normalizeView);
  if (!isRecord(value)) return value;
  const keys = Object.keys(value);
  if (keys.length === 1 && keys[0] === "item") {
    const inner = normalizeView(value.item);
    if (Array.isArray(inner)) return inner;
  }
  const out = {};
  for (const key of keys) out[key] = normalizeView(value[key]);
  for (const field of ["value", "percent"]) {
    if (typeof out[field] === "string" && out[field].trim() !== "" && !Number.isNaN(Number(out[field]))) out[field] = Number(out[field]);
  }
  return out;
}
function validateView(view) {
  const ctx = { ids: /* @__PURE__ */ new Set(), nodes: 0, interactive: false };
  const error = checkNode(view, "view", 1, ctx);
  return error === void 0 ? { ok: true, interactive: ctx.interactive } : { ok: false, error };
}
function checkShownView(title, view) {
  let bytes;
  try {
    bytes = viewBytes(title, view);
  } catch {
    return { error: "The view is not JSON data." };
  }
  if (bytes > VIEW_BYTE_LIMIT) return { error: `The view is ${bytes} bytes; the limit is ${VIEW_BYTE_LIMIT}.` };
  const named = String(title ?? "").trim();
  if (named === "") return { error: "Give the view a title." };
  const checked = validateView(view);
  if (!checked.ok) return { error: checked.error };
  return { title: named, interactive: checked.interactive };
}
function checkNode(node, path, depth, ctx) {
  if (!isRecord(node)) return `${path}: expected a component object`;
  if (depth > MAX_DEPTH) return `${path}: ${depth} levels exceeds the limit of ${MAX_DEPTH}`;
  ctx.nodes += 1;
  if (ctx.nodes > MAX_NODES) return `${path}: ${ctx.nodes} components exceeds the limit of ${MAX_NODES}`;
  const type = node.type;
  if (!COMPONENTS.includes(type)) return `${path}.type: unknown component ${quoted(type)}; allowed: ${allowed(COMPONENTS)}`;
  const props = PROPS[type];
  for (const key of Object.keys(node)) {
    if (key === "type" || props.includes(key)) continue;
    return `${path}.${key}: unknown property ${quoted(key)}; allowed: ${allowed(props)}`;
  }
  if (INTERACTIVE.has(type)) ctx.interactive = true;
  if (type === "stack") return checkStack(node, path, depth, ctx);
  if (type === "text") return checkText(node, path);
  if (type === "metric") return checkMetric(node, path);
  if (type === "table") return checkTable(node, path);
  if (type === "options") return checkOptions(node, path, ctx);
  if (type === "confirm") return checkConfirm(node, path, ctx);
  if (type === "form") return checkForm(node, path, ctx);
  return checkProgress(node, path);
}
function checkStack(node, path, depth, ctx) {
  if (!Array.isArray(node.children)) return `${path}.children: expected an array of 1 to ${MAX_CHILDREN} components`;
  if (node.children.length < 1 || node.children.length > MAX_CHILDREN) return `${path}.children: expected 1 to ${MAX_CHILDREN} children; got ${node.children.length}`;
  for (let index = 0; index < node.children.length; index += 1) {
    const error = checkNode(node.children[index], `${path}.children[${index}]`, depth + 1, ctx);
    if (error !== void 0) return error;
  }
  return void 0;
}
function checkText(node, path) {
  if (typeof node.text !== "string") return `${path}.text: expected a string`;
  if (node.text.length > MAX_TEXT) return `${path}.text: ${node.text.length} characters exceeds the limit of ${MAX_TEXT}`;
  return void 0;
}
function checkMetric(node, path) {
  if (typeof node.label !== "string") return `${path}.label: expected a string`;
  if (typeof node.value !== "string" && typeof node.value !== "number") return `${path}.value: expected a string or a number`;
  if (typeof node.value === "number" && !Number.isFinite(node.value)) return `${path}.value: expected a finite number`;
  if (node.tone !== void 0 && !TONES.includes(node.tone)) return `${path}.tone: unknown tone ${quoted(node.tone)}; allowed: ${allowed(TONES)}`;
  return void 0;
}
function checkTable(node, path) {
  if (!Array.isArray(node.columns)) return `${path}.columns: expected an array of at most ${MAX_COLUMNS} columns`;
  if (node.columns.length > MAX_COLUMNS) return `${path}.columns: ${node.columns.length} columns exceeds the limit of ${MAX_COLUMNS}`;
  for (let index = 0; index < node.columns.length; index += 1) {
    const column = node.columns[index];
    const at2 = `${path}.columns[${index}]`;
    if (!isRecord(column)) return `${at2}: expected a column object`;
    for (const key of Object.keys(column)) {
      if (key !== "key" && key !== "label") return `${at2}.${key}: unknown property ${quoted(key)}; allowed: key, label`;
    }
    if (typeof column.key !== "string" || column.key === "") return `${at2}.key: expected a non-empty string`;
    if (typeof column.label !== "string") return `${at2}.label: expected a string`;
  }
  if (!Array.isArray(node.rows)) return `${path}.rows: expected an array of at most ${MAX_ROWS} rows`;
  if (node.rows.length > MAX_ROWS) return `${path}.rows: ${node.rows.length} rows exceeds the limit of ${MAX_ROWS}`;
  for (let row = 0; row < node.rows.length; row += 1) {
    const cells = node.rows[row];
    if (!Array.isArray(cells)) return `${path}.rows[${row}]: expected an array of cells`;
    for (let column = 0; column < cells.length; column += 1) {
      const text = cellText(cells[column]);
      if (text.length > MAX_CELL) return `${path}.rows[${row}][${column}]: ${text.length} characters exceeds the limit of ${MAX_CELL}`;
    }
  }
  return void 0;
}
function checkOptions(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.multi !== void 0 && typeof node.multi !== "boolean") return `${path}.multi: expected a boolean`;
  if (!Array.isArray(node.options)) return `${path}.options: expected an array of 1 to ${MAX_OPTIONS} options`;
  if (node.options.length < 1 || node.options.length > MAX_OPTIONS) return `${path}.options: expected 1 to ${MAX_OPTIONS} options; got ${node.options.length}`;
  const labels = /* @__PURE__ */ new Set();
  for (let index = 0; index < node.options.length; index += 1) {
    const option = node.options[index];
    const at2 = `${path}.options[${index}]`;
    if (!isRecord(option)) return `${at2}: expected an option object`;
    for (const key of Object.keys(option)) {
      if (key !== "label" && key !== "description") return `${at2}.${key}: unknown property ${quoted(key)}; allowed: label, description`;
    }
    if (typeof option.label !== "string" || option.label.trim() === "") return `${at2}.label: expected a non-empty string`;
    if (labels.has(option.label)) return `${at2}.label: duplicate label ${quoted(option.label)}`;
    labels.add(option.label);
    if (option.description !== void 0 && typeof option.description !== "string") return `${at2}.description: expected a string`;
  }
  return void 0;
}
function checkConfirm(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.confirmLabel !== void 0 && typeof node.confirmLabel !== "string") return `${path}.confirmLabel: expected a string`;
  if (node.cancelLabel !== void 0 && typeof node.cancelLabel !== "string") return `${path}.cancelLabel: expected a string`;
  return void 0;
}
function checkForm(node, path, ctx) {
  const idError = checkId(node, path, ctx);
  if (idError !== void 0) return idError;
  if (node.submitLabel !== void 0 && typeof node.submitLabel !== "string") return `${path}.submitLabel: expected a string`;
  if (!Array.isArray(node.fields)) return `${path}.fields: expected an array of at most ${MAX_FIELDS} fields`;
  if (node.fields.length > MAX_FIELDS) return `${path}.fields: ${node.fields.length} fields exceeds the limit of ${MAX_FIELDS}`;
  const seen = /* @__PURE__ */ new Set();
  for (let index = 0; index < node.fields.length; index += 1) {
    const field = node.fields[index];
    const at2 = `${path}.fields[${index}]`;
    if (!isRecord(field)) return `${at2}: expected a field object`;
    for (const key of Object.keys(field)) {
      if (key !== "id" && key !== "label" && key !== "placeholder") return `${at2}.${key}: unknown property ${quoted(key)}; allowed: id, label, placeholder`;
    }
    if (typeof field.id !== "string" || field.id === "") return `${at2}.id: expected a non-empty string`;
    if (field.id === "__proto__") return `${at2}.id: "__proto__" cannot be an id`;
    if (seen.has(field.id)) return `${at2}.id: duplicate field id ${quoted(field.id)}`;
    seen.add(field.id);
    if (typeof field.label !== "string") return `${at2}.label: expected a string`;
    if (field.placeholder !== void 0 && typeof field.placeholder !== "string") return `${at2}.placeholder: expected a string`;
  }
  return void 0;
}
function checkProgress(node, path) {
  if (node.label !== void 0 && typeof node.label !== "string") return `${path}.label: expected a string`;
  if (typeof node.percent !== "number" || !Number.isFinite(node.percent) || node.percent < 0 || node.percent > 100) return `${path}.percent: expected a number from 0 to 100`;
  return void 0;
}
function checkId(node, path, ctx) {
  if (typeof node.id !== "string" || node.id === "") return `${path}.id: expected a non-empty string`;
  if (node.id === "__proto__") return `${path}.id: "__proto__" cannot be an id`;
  if (ctx.ids.has(node.id)) return `${path}.id: duplicate id ${quoted(node.id)}`;
  ctx.ids.add(node.id);
  return void 0;
}
function cellText(value) {
  if (typeof value === "string") return value;
  const text = JSON.stringify(value);
  return typeof text === "string" ? text : "";
}
function clip(text) {
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length <= SUMMARY_PART ? flat : flat.slice(0, SUMMARY_PART);
}
function componentSummary(node) {
  if (node.type === "text") return `text: ${node.text ?? ""}`;
  if (node.type === "metric") return `metric: ${node.label}=${node.value}`;
  if (node.type === "table") return `table: ${(Array.isArray(node.columns) ? node.columns : []).map((column) => column?.label ?? column?.key ?? "").filter(Boolean).join("/")}`;
  if (node.type === "options") return `options: ${(Array.isArray(node.options) ? node.options : []).map((option) => option?.label).filter(Boolean).join("/")}`;
  if (node.type === "confirm") return "confirm";
  if (node.type === "form") return `form: ${(Array.isArray(node.fields) ? node.fields : []).map((field) => field?.label ?? field?.id).filter(Boolean).join("/")}`;
  if (node.type === "progress") return `progress: ${node.label ? `${node.label} ` : ""}${node.percent}%`;
  return void 0;
}
function viewSummary(view) {
  const parts = [];
  const visit = (node) => {
    if (parts.length >= SUMMARY_COUNT || !isRecord(node)) return;
    const line = componentSummary(node);
    if (line !== void 0) parts.push(clip(line));
    if (parts.length >= SUMMARY_COUNT || node.type !== "stack" || !Array.isArray(node.children)) return;
    for (const child of node.children) visit(child);
  };
  visit(view);
  return parts.join("; ");
}
function interactiveNodes(node, found = []) {
  if (!isRecord(node)) return found;
  if (INTERACTIVE.has(node.type)) found.push(node);
  if (node.type === "stack" && Array.isArray(node.children)) {
    for (const child of node.children) interactiveNodes(child, found);
  }
  return found;
}
function validateViewAnswer(view, action, values) {
  const nodes = interactiveNodes(view);
  if (typeof action !== "string" || action === "") return { error: `action: expected an interactive component id; allowed: ${allowed(nodes.map((node2) => node2.id))}` };
  const node = nodes.find((item) => item.id === action);
  if (node === void 0) return { error: `action: no interactive component with id ${quoted(action)}; allowed: ${allowed(nodes.map((item) => item.id))}` };
  if (!isRecord(values)) return { error: "values: expected an object" };
  if (node.type === "options") return validateOptions(node, values);
  if (node.type === "confirm") return validateConfirm(values);
  return validateForm(node, values);
}
function validateOptions(node, values) {
  if (!Array.isArray(values.selected)) return { error: "values.selected: expected an array of option labels" };
  const labels = new Set((node.options ?? []).map((option) => option?.label));
  const picked = values.selected.filter((label) => typeof label === "string" && labels.has(label));
  const selected = node.multi === true ? [...new Set(picked)] : picked.slice(0, 1);
  if (selected.length === 0) return { error: "values.selected: select at least one option" };
  return { selected };
}
function validateConfirm(values) {
  if (typeof values.confirmed !== "boolean") return { error: "values.confirmed: expected a boolean" };
  return { confirmed: values.confirmed };
}
function validateForm(node, values) {
  if (!isRecord(values.fields)) return { error: "values.fields: expected an object of field ids to strings" };
  const declared = (node.fields ?? []).map((field) => field?.id).filter((id) => typeof id === "string");
  const allowedIds = new Set(declared);
  const fields = {};
  for (const [key, value] of Object.entries(values.fields)) {
    if (!allowedIds.has(key)) return { error: `values.fields.${key}: unknown field; allowed: ${allowed(declared)}` };
    if (typeof value !== "string") return { error: `values.fields.${key}: expected a string` };
    if (value.length > MAX_TEXT) return { error: `values.fields.${key}: ${value.length} characters exceeds the limit of ${MAX_TEXT}` };
    fields[key] = value;
  }
  return { fields };
}

// src/client/widget-cell.js
var import_react6 = require("react");
var mdLabels = () => ({ code: { copyLabel: t("Copy"), copiedLabel: t("Copied") }, footnotes: t("Footnotes") });
var optionsOf2 = (node) => (Array.isArray(node?.options) ? node.options : []).map((option) => typeof option === "string" ? { label: option } : option).filter((option) => option !== null && typeof option === "object" && option.label !== void 0);
var fieldsOf = (node) => (Array.isArray(node?.fields) ? node.fields : []).filter((field) => field !== null && typeof field === "object" && field.id !== void 0);
var cellText2 = (value) => value === null || value === void 0 ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
var countType = (node, type) => {
  if (node === null || typeof node !== "object") return 0;
  const children = Array.isArray(node.children) ? node.children : [];
  return (node.type === type ? 1 : 0) + children.reduce((sum, child) => sum + countType(child, type), 0);
};
var answerValues = (answer, node) => answer?.action === node.id ? answer.values : void 0;
function OptionsInput({ node, onSubmit, keys }) {
  const [picked, setPicked] = (0, import_react6.useState)([]);
  const options = optionsOf2(node);
  const multi = node.multi === true;
  const choose = (label) => {
    if (multi) {
      setPicked((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
      return;
    }
    onSubmit?.(node.id, { selected: [label] });
  };
  const submit = () => {
    if (picked.length > 0) onSubmit?.(node.id, { selected: picked });
  };
  const ownRef = (0, import_react6.useRef)(null);
  useOptionKeys(keys ? options.length : 0, (index) => choose(options[index].label), ownRef);
  return (0, import_react6.createElement)(
    import_react6.Fragment,
    null,
    (0, import_react6.createElement)("div", { className: "bt-q-list", role: "group" }, options.map((option, index) => {
      const selected = multi && picked.includes(option.label);
      return (0, import_react6.createElement)(
        "button",
        {
          key: option.label,
          type: "button",
          className: "bt-q-opt",
          "aria-pressed": multi ? selected : void 0,
          "aria-keyshortcuts": keys ? keyLetter(index).toLowerCase() : void 0,
          onClick: () => choose(option.label)
        },
        keys ? (0, import_react6.createElement)("span", { className: "bt-key", "aria-hidden": true }, keyLetter(index)) : null,
        (0, import_react6.createElement)(
          "span",
          { className: "bt-q-body" },
          (0, import_react6.createElement)("span", { className: "bt-q-label" }, option.label),
          option.description ? (0, import_react6.createElement)("span", { className: "bt-q-desc" }, option.description) : null
        ),
        selected ? (0, import_react6.createElement)("span", { className: "bt-q-check", title: t("Selected") }, (0, import_react6.createElement)(CheckIcon)) : null
      );
    })),
    multi ? (0, import_react6.createElement)(
      "div",
      { className: "bt-q-foot" },
      (0, import_react6.createElement)("button", { type: "button", className: "bt-q-submit", disabled: picked.length === 0, onClick: submit }, t("Submit"))
    ) : null
  );
}
function SettledOptions({ node, answer }) {
  const selected = answerValues(answer, node)?.selected;
  const chosen = Array.isArray(selected) ? selected : [];
  return (0, import_react6.createElement)(
    "div",
    { className: "bt-q-list", role: "group", "aria-label": t("Your answer") },
    optionsOf2(node).map((option) => (0, import_react6.createElement)(
      "div",
      { key: option.label, className: "bt-q-opt" },
      (0, import_react6.createElement)(
        "span",
        { className: "bt-q-body" },
        (0, import_react6.createElement)("span", { className: "bt-q-label" }, option.label),
        option.description ? (0, import_react6.createElement)("span", { className: "bt-q-desc" }, option.description) : null
      ),
      chosen.includes(option.label) ? (0, import_react6.createElement)("span", { className: "bt-q-check", title: t("Selected") }, (0, import_react6.createElement)(CheckIcon)) : null
    ))
  );
}
function ConfirmInput({ node, onSubmit }) {
  return (0, import_react6.createElement)(
    "div",
    { className: "bt-q-foot" },
    (0, import_react6.createElement)("button", { type: "button", className: "bt-q-btn", onClick: () => onSubmit?.(node.id, { confirmed: false }) }, node.cancelLabel ?? t("Cancel")),
    (0, import_react6.createElement)("button", { type: "button", className: "bt-q-submit", onClick: () => onSubmit?.(node.id, { confirmed: true }) }, node.confirmLabel ?? t("Confirm"))
  );
}
function SettledConfirm({ node, answer }) {
  const confirmed = answerValues(answer, node)?.confirmed;
  if (confirmed !== true && confirmed !== false) {
    return (0, import_react6.createElement)(
      "div",
      { className: "bt-q-foot" },
      (0, import_react6.createElement)("button", { type: "button", className: "bt-q-btn", disabled: true }, node.cancelLabel ?? t("Cancel")),
      (0, import_react6.createElement)("button", { type: "button", className: "bt-q-submit", disabled: true }, node.confirmLabel ?? t("Confirm"))
    );
  }
  const label = confirmed ? node.confirmLabel ?? t("Confirm") : node.cancelLabel ?? t("Cancel");
  return (0, import_react6.createElement)("span", { className: "bt-q-badge" }, label);
}
function FormInput({ node, onSubmit }) {
  const fields = fieldsOf(node);
  const [draft, setDraft] = (0, import_react6.useState)({});
  const submit = () => onSubmit?.(node.id, { fields: Object.fromEntries(fields.map((field) => [field.id, draft[field.id] ?? ""])) });
  return (0, import_react6.createElement)(
    "form",
    {
      className: "bt-widget-form",
      onSubmit: (event) => {
        event.preventDefault();
        submit();
      }
    },
    fields.map((field) => (0, import_react6.createElement)(
      "label",
      { key: field.id, className: "bt-widget-field" },
      (0, import_react6.createElement)("span", { className: "bt-widget-field-label" }, field.label),
      (0, import_react6.createElement)(
        "span",
        { className: "bt-q-field" },
        (0, import_react6.createElement)("input", {
          className: "bt-q-input",
          type: "text",
          value: draft[field.id] ?? "",
          autoComplete: "off",
          spellCheck: false,
          "aria-label": field.label,
          placeholder: field.placeholder ?? void 0,
          onChange: (event) => setDraft((current) => ({ ...current, [field.id]: event.target.value })),
          onKeyDown: (event) => {
            if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
            event.preventDefault();
            submit();
          }
        })
      )
    )),
    (0, import_react6.createElement)("div", { className: "bt-q-foot" }, (0, import_react6.createElement)("button", { type: "submit", className: "bt-q-submit" }, node.submitLabel ?? t("Submit")))
  );
}
function SettledForm({ node, answer }) {
  const fields = answerValues(answer, node)?.fields;
  const values = fields !== null && typeof fields === "object" ? fields : {};
  return (0, import_react6.createElement)(
    "div",
    { className: "bt-widget-form" },
    fieldsOf(node).map((field) => (0, import_react6.createElement)(
      "label",
      { key: field.id, className: "bt-widget-field" },
      (0, import_react6.createElement)("span", { className: "bt-widget-field-label" }, field.label),
      (0, import_react6.createElement)(
        "span",
        { className: "bt-q-field" },
        (0, import_react6.createElement)("input", { className: "bt-q-input", type: "text", value: values[field.id] ?? "", disabled: true, readOnly: true, "aria-label": field.label })
      )
    ))
  );
}
function WidgetTable({ node }) {
  const columns = (Array.isArray(node.columns) ? node.columns : []).filter((column) => column !== null && typeof column === "object");
  const rows = Array.isArray(node.rows) ? node.rows : [];
  return (0, import_react6.createElement)(
    "div",
    { className: "bt-widget-table" },
    (0, import_react6.createElement)(
      "table",
      null,
      (0, import_react6.createElement)("thead", null, (0, import_react6.createElement)("tr", null, columns.map((column, index) => (0, import_react6.createElement)("th", { key: column.key ?? index, scope: "col" }, column.label)))),
      (0, import_react6.createElement)("tbody", null, rows.map((row, rowIndex) => (0, import_react6.createElement)(
        "tr",
        { key: rowIndex },
        columns.map((column, columnIndex) => (0, import_react6.createElement)("td", { key: column.key ?? columnIndex }, cellText2(Array.isArray(row) ? row[columnIndex] : void 0)))
      )))
    )
  );
}
function WidgetProgress({ node }) {
  const percent2 = Math.max(0, Math.min(100, Number(node.percent) || 0));
  return (0, import_react6.createElement)(
    "div",
    { className: "bt-widget-progress" },
    (0, import_react6.createElement)("span", { className: "bt-widget-progress-label" }, (0, import_react6.createElement)("span", null, node.label), (0, import_react6.createElement)("span", null, `${Math.round(percent2)}%`)),
    (0, import_react6.createElement)("div", {
      className: "bt-widget-progress-track",
      role: "progressbar",
      "aria-valuenow": percent2,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-label": node.label ?? t("Progress")
    }, (0, import_react6.createElement)("div", { className: "bt-widget-progress-fill", style: { width: `${percent2}%` } }))
  );
}
function WidgetNode({ node, ctx }) {
  if (node === null || typeof node !== "object") return null;
  switch (node.type) {
    case "stack": {
      const children = Array.isArray(node.children) ? node.children : [];
      return (0, import_react6.createElement)(
        "div",
        { className: "bt-widget-stack" },
        children.map((child, index) => (0, import_react6.createElement)(WidgetNode, { key: child?.id ?? index, node: child, ctx }))
      );
    }
    case "text":
      return (0, import_react6.createElement)(import_dsh_client_ui_primitives.MarkdownText, { text: String(node.text ?? ""), labels: mdLabels(), variant: "compact" });
    case "metric": {
      const tone = ["good", "warn", "bad"].includes(node.tone) ? node.tone : void 0;
      return (0, import_react6.createElement)(
        "div",
        { className: "bt-widget-metric", "data-tone": tone },
        (0, import_react6.createElement)("span", { className: "bt-widget-metric-label" }, node.label),
        (0, import_react6.createElement)("span", { className: "bt-widget-metric-value" }, node.value)
      );
    }
    case "table":
      return (0, import_react6.createElement)(WidgetTable, { node });
    case "options":
      return ctx.settled ? (0, import_react6.createElement)(SettledOptions, { node, answer: ctx.answer }) : (0, import_react6.createElement)(OptionsInput, { node, onSubmit: ctx.onSubmit, keys: ctx.keys });
    case "confirm":
      return ctx.settled ? (0, import_react6.createElement)(SettledConfirm, { node, answer: ctx.answer }) : (0, import_react6.createElement)(ConfirmInput, { node, onSubmit: ctx.onSubmit });
    case "form":
      return ctx.settled ? (0, import_react6.createElement)(SettledForm, { node, answer: ctx.answer }) : (0, import_react6.createElement)(FormInput, { node, onSubmit: ctx.onSubmit });
    case "progress":
      return (0, import_react6.createElement)(WidgetProgress, { node });
    default:
      return null;
  }
}
function WidgetView({ view, onSubmit, settled = false, answer = null }) {
  const ctx = { onSubmit, settled, answer, keys: !settled && countType(view, "options") === 1 };
  return (0, import_react6.createElement)(WidgetNode, { node: view, ctx });
}
function WidgetCard({ title, view, onSubmit, onDismiss, raised = false, settled = false, answer = null }) {
  const titleId = (0, import_react6.useId)();
  return (0, import_react6.createElement)(
    "div",
    {
      className: settled ? "bt-q bt-q-settled" : raised ? "bt-q bt-q-raised" : "bt-q",
      role: "group",
      "aria-labelledby": titleId
    },
    (0, import_react6.createElement)(
      "div",
      { className: "bt-q-head" },
      (0, import_react6.createElement)("div", { className: "bt-q-text" }, (0, import_react6.createElement)("p", { className: "bt-q-title", id: titleId }, title)),
      (0, import_react6.createElement)("span", { className: "bt-q-badge" }, t("View")),
      onDismiss ? (0, import_react6.createElement)("button", { type: "button", className: "bt-q-x", "aria-label": t("Dismiss view"), title: t("Dismiss"), onClick: onDismiss }, (0, import_react6.createElement)(CloseIcon)) : null
    ),
    (0, import_react6.createElement)(WidgetView, { view, onSubmit, settled, answer })
  );
}
function PendingView({ sessionId, view, actions, inline }) {
  const [answered, setAnswered] = (0, import_react6.useState)(null);
  const hold = useDockHold(sessionId, "view", view.id, actions, inline);
  const onSubmit = (action, values) => {
    setAnswered(view.id);
    void actions.answerView(sessionId, view.id, action, values).catch(() => setAnswered(null));
  };
  const onDismiss = () => {
    setAnswered(view.id);
    void Promise.resolve(actions.dismissView(sessionId)).catch(() => setAnswered(null));
  };
  return (0, import_react6.createElement)(
    "div",
    { className: inline ? "bt-q-inline" : "bt-q-dock", style: answered === view.id ? { display: "none" } : void 0, onFocusCapture: hold, onPointerDownCapture: hold },
    (0, import_react6.createElement)(WidgetCard, { key: view.id, title: view.title ?? "", view: view.view, onSubmit, onDismiss, raised: !inline })
  );
}
function WidgetCell({ sessionId, callId, args, done, isError, roster, actions, heldCards }) {
  const record = roster.views?.[sessionId];
  if (record !== void 0 && record.callId === callId) {
    if (heldCards?.[heldCardKey("view", record.id)] > 0) return null;
    return (0, import_react6.createElement)(PendingView, { sessionId, view: record, actions, inline: true });
  }
  if (done && isError) return (0, import_react6.createElement)("span", { className: "bt-q-gone", hidden: true });
  const blueprint = normalizeView(args?.value?.("view"));
  const shown = checkShownView(args?.text?.("title"), blueprint);
  if (shown.error !== void 0 || shown.interactive || args?.value?.("await_reply") === true) {
    return (0, import_react6.createElement)("span", { className: "bt-q-gone", hidden: true });
  }
  return (0, import_react6.createElement)("div", { className: "bt-q-inline" }, (0, import_react6.createElement)(WidgetCard, { title: shown.title, view: blueprint }));
}
function WidgetDock({ sessionId, useRoster, useCards, useHeldCards, actions }) {
  const view = useRoster((value) => value.views?.[sessionId]);
  const drawn = useCards?.((state) => state[sessionId]?.[view?.callId] > 0) === true;
  const held = useHeldCards?.((state) => state[sessionId]?.[heldCardKey("view", view?.id)] > 0) === true;
  if (view === void 0 || view.callId && drawn && !held) return null;
  return (0, import_react6.createElement)(PendingView, { sessionId, view, actions, inline: false });
}
function AnsweredView({ node }) {
  const data = node.data ?? {};
  let payload = null;
  if (Array.isArray(data.views)) payload = data;
  else {
    try {
      payload = typeof data.text === "string" ? JSON.parse(data.text) : null;
    } catch {
      payload = null;
    }
    if (payload?.kind !== "answer_to_pending_view") payload = null;
  }
  const view = payload?.views?.[0];
  if (view === null || typeof view !== "object" || view.view === void 0) return null;
  const answers = Array.isArray(payload.answers) ? payload.answers : [];
  const answer = answers.find((entry) => entry?.id === view.id) ?? answers[0] ?? null;
  return (0, import_react6.createElement)("div", { className: "bt-q-inline" }, (0, import_react6.createElement)(WidgetCard, { title: view.title ?? "", view: view.view, settled: true, answer }));
}
function AnsweredReply({ node }) {
  const data = node?.data ?? {};
  if (Array.isArray(data.views) && data.views.length > 0) return (0, import_react6.createElement)(AnsweredView, { node });
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    let parsed = null;
    try {
      parsed = typeof data.text === "string" ? JSON.parse(data.text) : null;
    } catch {
      parsed = null;
    }
    if (parsed?.kind === "answer_to_pending_view") return (0, import_react6.createElement)(AnsweredView, { node });
  }
  return (0, import_react6.createElement)(AnsweredCell, { node });
}
var WIDGET_CSS = `
.bt-widget-stack{display:flex;flex-direction:column;gap:8px;min-width:0}
.bt-widget-stack>.bt-q-badge{align-self:flex-start}
.bt-widget-metric{display:flex;flex-direction:column;gap:1px;min-width:0}
.bt-widget-metric-label{font-size:12px;line-height:16px;color:var(--bt-ink-2)}
.bt-widget-metric-value{font-size:22px;line-height:28px;font-weight:600;font-variant-numeric:tabular-nums;color:var(--bt-ink);overflow-wrap:anywhere}
.bt-widget-metric[data-tone=good] .bt-widget-metric-value{color:var(--bt-green)}
.bt-widget-metric[data-tone=warn] .bt-widget-metric-value{color:var(--bt-star)}
.bt-widget-metric[data-tone=bad] .bt-widget-metric-value{color:var(--bt-danger)}
.bt-widget-table{max-width:100%;overflow-x:auto;border:.5px solid var(--bt-line-2);border-radius:10px}
.bt-widget-table table{border-collapse:collapse;min-width:100%;font-size:13px;line-height:18px}
.bt-widget-table th{padding:6px 10px;font-weight:500;text-align:start;white-space:nowrap;color:var(--bt-ink-2);border-bottom:.5px solid var(--bt-line-2)}
.bt-widget-table td{padding:6px 10px;max-width:280px;color:var(--bt-ink);overflow-wrap:anywhere}
.bt-widget-table tbody tr+tr td{border-top:.5px solid var(--bt-line)}
.bt-widget-form{display:flex;flex-direction:column;gap:8px;margin:0}
.bt-widget-field{display:flex;flex-direction:column;gap:4px;min-width:0}
.bt-widget-field-label{font-size:12px;line-height:16px;color:var(--bt-ink-2)}
.bt-widget-field .bt-q-field:has(.bt-q-input:disabled){cursor:default;opacity:.75}
.bt-widget-progress{display:flex;flex-direction:column;gap:5px;min-width:0}
.bt-widget-progress-label{display:flex;justify-content:space-between;gap:8px;font-size:12px;line-height:16px;color:var(--bt-ink-2)}
.bt-widget-progress-track{height:6px;border-radius:999px;background:var(--bt-hover);overflow:hidden}
.bt-widget-progress-fill{height:100%;border-radius:inherit;background:var(--bt-accent)}
.bt-q-raised .bt-widget-stack{padding:0 16px 14px}
.bt-q-raised .bt-widget-stack>.bt-q-list{padding:0}
`;

// src/client/secret-card.js
var import_react7 = require("react");
var MIN_VALUE = 4;
var NONE = {};
var KeyIcon = () => (0, import_react7.createElement)(
  "svg",
  { width: 15, height: 15, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
  (0, import_react7.createElement)("path", { d: "M7 9.5a3.5 3.5 0 1 1 0 .01z" }),
  (0, import_react7.createElement)("path", { d: "M10.4 10.6L17 10.6M14.5 10.6v2.4M16.6 10.6v1.8" })
);
var LockIcon = () => (0, import_react7.createElement)(
  "svg",
  { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
  (0, import_react7.createElement)("path", { d: "M6.5 9V7a3.5 3.5 0 0 1 7 0v2" }),
  (0, import_react7.createElement)("rect", { x: 4.5, y: 9, width: 11, height: 8, rx: 2 })
);
var WarnIcon = () => (0, import_react7.createElement)(
  "svg",
  { width: 14, height: 14, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
  (0, import_react7.createElement)("path", { d: "M10 3.5l7 12.5H3z" }),
  (0, import_react7.createElement)("path", { d: "M10 8.5v3.5M10 14.2h.01" })
);
var MASK_BY_CSS = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("-webkit-text-security", "disc");
var insecure = () => typeof location !== "undefined" && location.protocol === "http:" && !/^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/.test(location.hostname);
var scopeLabel = (scope, roster) => {
  if (scope === "all") return t("All Bots");
  const names = (scope ?? []).map((id) => roster.byId[id]?.name).filter(Boolean);
  return names.length === 0 ? t("No Bot") : names.join(t(" and "));
};
var when = (time) => Number.isFinite(time) ? new Date(time).toLocaleString(dateLocale(), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";
function MaskedInput({ value, onChange, onEnter, label, autoFocus = false }) {
  return (0, import_react7.createElement)("input", {
    className: "bt-secret-input",
    type: MASK_BY_CSS ? "text" : "password",
    "data-masked": MASK_BY_CSS ? "" : void 0,
    value,
    autoFocus,
    autoComplete: MASK_BY_CSS ? "off" : "new-password",
    autoCorrect: "off",
    autoCapitalize: "off",
    spellCheck: false,
    "data-1p-ignore": "",
    "data-lpignore": "true",
    "data-bwignore": "",
    "data-form-type": "other",
    "aria-label": label,
    placeholder: t("Paste or type the key"),
    onChange: (event) => onChange(event.target.value),
    onKeyDown: (event) => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
      event.preventDefault();
      onEnter?.();
    }
  });
}
function ScopeSwitch({ value, onChange, bot }) {
  const options = [["all", t("All Bots")], ["bot", t("Only {name}", { name: bot.name })]];
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-secret-scope", role: "radiogroup", "aria-label": t("Who may use it") },
    (0, import_react7.createElement)("span", { className: "bt-secret-glide", "data-at": value === "all" ? 0 : 1, "aria-hidden": true }),
    options.map(([id, text]) => (0, import_react7.createElement)("button", {
      key: id,
      type: "button",
      role: "radio",
      "aria-checked": value === id,
      className: "bt-secret-seg",
      onClick: () => onChange(id)
    }, text))
  );
}
function SecretHead({ bot, title, detail, name, onClose }) {
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-q-head bt-secret-head" },
    (0, import_react7.createElement)("span", { className: "bt-secret-who" }, (0, import_react7.createElement)(BotMark, { bot, size: 28 }), (0, import_react7.createElement)("span", { className: "bt-secret-lock" }, (0, import_react7.createElement)(LockIcon))),
    (0, import_react7.createElement)(
      "div",
      { className: "bt-q-text" },
      (0, import_react7.createElement)("p", { className: "bt-q-title" }, title),
      (0, import_react7.createElement)("div", { className: "bt-q-detail" }, (0, import_react7.createElement)("code", { className: "bt-secret-name" }, name), detail ? ` · ${detail}` : "")
    ),
    onClose ? (0, import_react7.createElement)("button", { type: "button", className: "bt-q-x", "aria-label": t("Cancel the request"), title: t("Cancel"), onClick: onClose }, (0, import_react7.createElement)(CloseIcon)) : null
  );
}
function SecretCard({ sessionId, bot, request, roster, actions, inline = false }) {
  const [value, setValue] = (0, import_react7.useState)("");
  const [scope, setScope] = (0, import_react7.useState)("all");
  const [replacing, setReplacing] = (0, import_react7.useState)(false);
  const [busy, setBusy] = (0, import_react7.useState)(false);
  const [error, setError] = (0, import_react7.useState)("");
  const busyRef = (0, import_react7.useRef)(false);
  const hold = useDockHold(sessionId, "secret", request.id, actions, inline);
  const noteId = (0, import_react7.useId)();
  const secret = (roster.secrets ?? []).find((entry) => entry.name === request.name);
  const run = (make) => {
    if (busyRef.current) return void 0;
    hold();
    busyRef.current = true;
    setBusy(true);
    setError("");
    return Promise.resolve().then(make).then(() => setValue(""), (failure) => setError(failure?.message ?? String(failure))).finally(() => {
      busyRef.current = false;
      setBusy(false);
    });
  };
  const cancel = () => run(() => actions.secretCancel(request.id));
  const long = value.trim().length >= MIN_VALUE;
  const save = () => {
    if (long && !busy) void run(() => actions.secretSet({ requestId: request.id, value, scope }));
  };
  const allow = () => {
    if (!busy) void run(() => actions.secretAllow(request.id));
  };
  const filling = request.kind === "fill" || replacing;
  const warn = insecure() ? (0, import_react7.createElement)("div", { className: "bt-secret-warn", role: "note" }, (0, import_react7.createElement)(WarnIcon), t("This page is not on HTTPS: the key crosses the network unencrypted.")) : null;
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-q bt-secret", role: "group", "aria-describedby": noteId, "data-kind": request.kind, onFocusCapture: hold, onPointerDownCapture: hold },
    (0, import_react7.createElement)(SecretHead, {
      bot,
      title: request.kind === "allow" ? t("Let {bot} use {name}?", { bot: bot.name, name: request.name }) : t("{name} needs a key", { name: bot.name }),
      detail: request.purpose,
      name: request.name,
      onClose: busy ? void 0 : cancel
    }),
    request.kind === "allow" ? (0, import_react7.createElement)("div", { className: "bt-secret-saved" }, (0, import_react7.createElement)(KeyIcon), t("Saved for {scope}", { scope: scopeLabel(secret?.scope, roster) })) : null,
    filling ? (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-body" },
      (0, import_react7.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react7.createElement)(MaskedInput, { value, onChange: (next) => {
        hold();
        setValue(next);
      }, onEnter: save, label: t("Value of {name}", { name: request.name }), autoFocus: replacing })),
      request.kind === "fill" ? (0, import_react7.createElement)(ScopeSwitch, { value: scope, onChange: (next) => {
        hold();
        setScope(next);
      }, bot }) : null
    ) : null,
    (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-note", id: noteId },
      t("{bot} never sees the value. It reaches {bot}'s shell as ", { bot: bot.name }),
      (0, import_react7.createElement)("code", null, `$DSH_SECRET_${request.name}`),
      ".",
      filling && value !== "" && !long ? t(" At least {count} characters.", { count: MIN_VALUE }) : ""
    ),
    warn,
    error ? (0, import_react7.createElement)("div", { className: "bt-secret-error", role: "alert" }, error) : null,
    (0, import_react7.createElement)(
      "div",
      { className: "bt-q-foot" },
      request.kind === "allow" && !replacing ? (0, import_react7.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: () => {
        hold();
        setReplacing(true);
      } }, t("Replace value")) : null,
      (0, import_react7.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: cancel }, t("Cancel")),
      filling ? (0, import_react7.createElement)("button", { type: "button", className: "bt-q-submit", disabled: !long || busy, onClick: save }, busy ? t("Saving…") : t("Save")) : (0, import_react7.createElement)("button", { type: "button", className: "bt-q-submit", disabled: busy, onClick: allow }, busy ? t("Allowing…") : t("Allow"))
    )
  );
}
function SettledSecret({ bot, request, roster }) {
  const canceled = request.status === "canceled";
  const text = canceled ? t("{bot} asked for {name}", { bot: bot.name, name: request.name }) : request.status === "allowed" ? t("Allowed {bot} to use {name}", { bot: bot.name, name: request.name }) : t("Saved {name}", { name: request.name });
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-q bt-q-settled bt-secret bt-secret-done", role: "group", "aria-label": text, "data-status": request.status },
    (0, import_react7.createElement)(
      "div",
      { className: "bt-q-head" },
      (0, import_react7.createElement)("span", { className: "bt-secret-who" }, (0, import_react7.createElement)(BotMark, { bot, size: 22 })),
      (0, import_react7.createElement)("div", { className: "bt-q-text" }, (0, import_react7.createElement)(
        "p",
        { className: "bt-q-title" },
        text,
        canceled ? null : (0, import_react7.createElement)("span", { className: "bt-secret-scope-tag" }, ` · ${scopeLabel(request.scope, roster)}`)
      )),
      canceled ? (0, import_react7.createElement)("span", { className: "bt-q-badge" }, t("Canceled")) : (0, import_react7.createElement)("span", { className: "bt-q-check bt-secret-check", title: t("Done") }, (0, import_react7.createElement)(CheckIcon))
    )
  );
}
function RequestView({ sessionId, bot, request, roster, actions }) {
  return request.status === "pending" ? (0, import_react7.createElement)(SecretCard, { key: JSON.stringify([sessionId, request.id, request.kind]), sessionId, bot, request, roster, actions, inline: true }) : (0, import_react7.createElement)(SettledSecret, { bot, request, roster });
}
function SecretToolCell({ sessionId, callId, name, done, content, roster, actions, heldCards = NONE }) {
  const bot = roster.byId[sessionId];
  if (!bot) return null;
  const request = (roster.secretRequests?.[bot.id] ?? []).find((entry) => entry.callId === callId && (entry.sessionId ?? sessionId) === sessionId);
  if (request?.status === "pending" && heldCards[heldCardKey("secret", request.id)] > 0) return null;
  if (request) return (0, import_react7.createElement)("div", { className: "bt-q-inline" }, (0, import_react7.createElement)(RequestView, { sessionId, bot, request, roster, actions }));
  if (done && /already saved/.test(contentText(content))) {
    return (0, import_react7.createElement)("div", { className: "bt-event" }, (0, import_react7.createElement)("span", { className: "bt-secret-event" }, (0, import_react7.createElement)(KeyIcon), t("{bot} is using {name}", { bot: bot.name, name: name ?? t("a saved key") })));
  }
  return null;
}
function SecretDock({ sessionId, useRoster, useCards, useHeldCards, actions }) {
  const roster = useRoster((value) => value);
  const shown = useCards?.((state) => state[sessionId]) ?? NONE;
  const held = useHeldCards?.((state) => state[sessionId]) ?? NONE;
  const bot = roster.byId[sessionId];
  if (!bot || currentPart(bot) !== sessionId) return null;
  const drawn = (entry) => entry.callId && entry.sessionId === sessionId && shown[entry.callId] > 0 && !(held[heldCardKey("secret", entry.id)] > 0);
  const waiting = (roster.secretRequests?.[bot.id] ?? []).filter((entry) => entry.status === "pending" && !drawn(entry));
  if (waiting.length === 0) return null;
  return (0, import_react7.createElement)("div", { className: "bt-q-dock bt-secret-dock" }, waiting.map((request) => (0, import_react7.createElement)(SecretCard, { key: JSON.stringify([sessionId, request.id, request.kind]), sessionId, bot, request, roster, actions })));
}
function ScopeEditor({ secret, roster, onSave }) {
  const [mode, setMode] = (0, import_react7.useState)(secret.scope === "all" ? "all" : "some");
  const [picked, setPicked] = (0, import_react7.useState)(secret.scope === "all" ? [] : secret.scope);
  const toggle = (id) => setPicked((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  const same = mode === "all" ? secret.scope === "all" : secret.scope !== "all" && [...picked].sort().join() === [...secret.scope].sort().join();
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-secret-edit-block" },
    (0, import_react7.createElement)("div", { className: "bt-secret-edit-label" }, t("Who may use it")),
    (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-radios", role: "radiogroup", "aria-label": t("Who may use {name}", { name: secret.name }) },
      [["all", t("All Bots")], ["some", t("Chosen Bots")]].map(([id, text]) => (0, import_react7.createElement)(
        "label",
        { key: id, className: "bt-secret-radio" },
        (0, import_react7.createElement)("input", { type: "radio", name: `scope-${secret.name}`, checked: mode === id, onChange: () => setMode(id) }),
        text
      ))
    ),
    mode === "some" ? (0, import_react7.createElement)("div", { className: "bt-secret-bots" }, roster.bots.map((bot) => (0, import_react7.createElement)("button", {
      key: bot.id,
      type: "button",
      className: "bt-secret-bot",
      "aria-pressed": picked.includes(bot.id),
      onClick: () => toggle(bot.id)
    }, (0, import_react7.createElement)(BotAvatar, { bot, size: 20, badge: false, live: false }), bot.name, picked.includes(bot.id) ? (0, import_react7.createElement)(CheckIcon) : null))) : null,
    (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-row-actions" },
      (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: same, onClick: () => onSave(mode === "all" ? "all" : picked) }, t("Save access"))
    )
  );
}
function ValueEditor({ secret, onSave }) {
  const [value, setValue] = (0, import_react7.useState)("");
  const [replaced, setReplaced] = (0, import_react7.useState)(false);
  const long = value.trim().length >= MIN_VALUE;
  const save = () => {
    if (!long) return;
    void Promise.resolve(onSave(value)).then((ok) => {
      if (ok) {
        setValue("");
        setReplaced(true);
      }
    });
  };
  const edit = (next) => {
    setValue(next);
    setReplaced(false);
  };
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-secret-edit-block" },
    (0, import_react7.createElement)("div", { className: "bt-secret-edit-label" }, t("Replace the value")),
    (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-inline" },
      (0, import_react7.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react7.createElement)(MaskedInput, { value, onChange: edit, onEnter: save, label: t("New value of {name}", { name: secret.name }) })),
      (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: !long, onClick: save }, t("Replace"))
    ),
    value !== "" && !long ? (0, import_react7.createElement)("div", { className: "bt-set-hint" }, t("At least {count} characters.", { count: MIN_VALUE })) : replaced ? (0, import_react7.createElement)("div", { className: "bt-set-hint bt-secret-ok", role: "status" }, (0, import_react7.createElement)(CheckIcon), t("Replaced. Bots get the new value from their next command.")) : null
  );
}
function SecretRow({ secret, roster, actions, run, open, onToggle }) {
  const [confirm, setConfirm] = (0, import_react7.useState)(false);
  (0, import_react7.useEffect)(() => {
    if (!open) setConfirm(false);
  }, [open]);
  const asker = secret.requestedBy ? roster.byId[secret.requestedBy]?.name ?? t("a deleted Bot") : t("you");
  const allowed2 = secret.scope === "all" ? [] : secret.scope.map((id) => roster.byId[id]).filter(Boolean);
  const meta = [t("Asked by {name}", { name: asker }), t("added {time}", { time: when(secret.createdAt) }), secret.lastUsedAt ? t("last used {time}", { time: when(secret.lastUsedAt) }) : t("not used yet")].join(" · ");
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-secret-item", "data-open": open ? "" : void 0 },
    (0, import_react7.createElement)(
      "button",
      { type: "button", className: "bt-set-row bt-secret-summary", "aria-expanded": open, onClick: onToggle },
      (0, import_react7.createElement)(
        "span",
        { className: "bt-set-copy" },
        (0, import_react7.createElement)("span", { className: "bt-secret-title" }, (0, import_react7.createElement)(KeyIcon), (0, import_react7.createElement)("code", { className: "bt-secret-name" }, secret.name), secret.purpose ? (0, import_react7.createElement)("span", { className: "bt-secret-purpose" }, secret.purpose) : null),
        (0, import_react7.createElement)("span", { className: "bt-set-hint" }, meta)
      ),
      (0, import_react7.createElement)(
        "span",
        { className: "bt-set-control" },
        secret.scope === "all" ? (0, import_react7.createElement)("span", { className: "bt-tag" }, t("All Bots")) : allowed2.length === 0 ? (0, import_react7.createElement)("span", { className: "bt-tag" }, t("No Bot")) : (0, import_react7.createElement)("span", { className: "bt-secret-faces", title: allowed2.map((bot) => bot.name).join(", ") }, allowed2.slice(0, 5).map((bot) => (0, import_react7.createElement)(BotAvatar, { key: bot.id, bot, size: 20, badge: false, live: false })))
      )
    ),
    open ? (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-edit" },
      (0, import_react7.createElement)(ScopeEditor, { key: JSON.stringify(secret.scope), secret, roster, onSave: (scope) => run(actions.secretUpdate(secret.name, scope)) }),
      (0, import_react7.createElement)(ValueEditor, { secret, onSave: (value) => run(actions.secretSet({ name: secret.name, value })) }),
      (0, import_react7.createElement)(
        "div",
        { className: "bt-secret-row-actions" },
        confirm ? [
          (0, import_react7.createElement)("span", { key: "q", className: "bt-set-hint" }, t("Delete {name}? Bots lose it at once.", { name: secret.name })),
          (0, import_react7.createElement)("button", { key: "no", type: "button", className: "bt-soft bt-soft-sm", onClick: () => setConfirm(false) }, t("Keep")),
          (0, import_react7.createElement)("button", { key: "yes", type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", onClick: () => run(actions.secretDelete(secret.name)) }, t("Delete"))
        ] : (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", onClick: () => setConfirm(true) }, (0, import_react7.createElement)(TrashIcon), t("Delete"))
      )
    ) : null
  );
}
function AddSecret({ secrets, actions, run, onDone }) {
  const [name, setName] = (0, import_react7.useState)("");
  const [purpose, setPurpose] = (0, import_react7.useState)("");
  const [value, setValue] = (0, import_react7.useState)("");
  const taken = secrets.some((secret) => secret.name === name.trim().replace(/[\s-]+/g, "_"));
  const ready2 = /^[A-Za-z][\w-]{0,63}$/.test(name.trim()) && value.trim().length >= MIN_VALUE && !taken;
  const save = () => {
    if (!ready2) return;
    void run(actions.secretSet({ name, purpose, value, scope: "all" })).then((ok) => {
      if (ok) {
        setValue("");
        onDone();
      }
    });
  };
  return (0, import_react7.createElement)(
    "div",
    { className: "bt-set-row bt-set-paste bt-secret-add" },
    (0, import_react7.createElement)("input", { className: "bt-input", "aria-label": t("Key name"), placeholder: t("NAME, e.g. GITHUB_TOKEN"), value: name, spellCheck: false, autoComplete: "off", autoFocus: true, onChange: (event) => setName(event.target.value.toUpperCase()) }),
    (0, import_react7.createElement)("input", { className: "bt-input", "aria-label": t("What it is for"), placeholder: t("What it is for"), value: purpose, autoComplete: "off", onChange: (event) => setPurpose(event.target.value) }),
    (0, import_react7.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react7.createElement)(MaskedInput, { value, onChange: setValue, onEnter: save, label: t("Value") })),
    (0, import_react7.createElement)(
      "div",
      { className: "bt-secret-row-actions" },
      (0, import_react7.createElement)("span", { className: "bt-set-hint" }, taken ? t("That key is already saved. Open it in the list to replace its value.") : t("New keys are for all Bots; narrow it down afterwards.")),
      (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onDone }, t("Cancel")),
      (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: !ready2, onClick: save }, t("Save key"))
    )
  );
}
function SecretsPage({ roster, actions, run, Section }) {
  const [open, setOpen] = (0, import_react7.useState)(null);
  const [adding, setAdding] = (0, import_react7.useState)(false);
  const secrets = roster.secrets ?? [];
  return [
    (0, import_react7.createElement)(
      "p",
      { key: "about", className: "bt-secret-about" },
      t("Keys your Bots asked for. Bots never see the values: they use them as "),
      (0, import_react7.createElement)("code", null, "$DSH_SECRET_NAME"),
      t(" in their shell, and every value is replaced by "),
      (0, import_react7.createElement)("code", null, "[secret:NAME]"),
      t(" before anything goes to a model.")
    ),
    (0, import_react7.createElement)(
      Section,
      { key: "list", title: t("Secrets · {count}", { count: secrets.length }) },
      secrets.length === 0 && !adding ? (0, import_react7.createElement)("div", { className: "bt-set-row" }, (0, import_react7.createElement)("span", { className: "bt-set-hint" }, t("No keys yet. When a Bot needs one, it shows a card in its chat."))) : null,
      secrets.map((secret) => (0, import_react7.createElement)(SecretRow, { key: secret.name, secret, roster, actions, run, open: open === secret.name, onToggle: () => setOpen(open === secret.name ? null : secret.name) })),
      adding ? (0, import_react7.createElement)(AddSecret, { secrets, actions, run, onDone: () => setAdding(false) }) : null
    ),
    adding ? null : (0, import_react7.createElement)("div", { key: "add", className: "bt-actions" }, (0, import_react7.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => setAdding(true) }, t("Add a key")))
  ];
}
var SECRET_CSS = `
.bt-secret-head{align-items:center;gap:10px}
.bt-secret-who{position:relative;flex:none;display:inline-flex}
.bt-secret-lock{position:absolute;right:-5px;bottom:-4px;width:16px;height:16px;border-radius:50%;background:var(--bt-main);color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 0 0 1.5px var(--bt-bubble)}
.bt-secret-lock svg{width:11px;height:11px}
.bt-secret-name{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:16px;padding:1px 6px;border-radius:5px;background:var(--bt-hover);color:var(--bt-ink)}
.bt-secret-body{display:flex;flex-direction:column;gap:8px}
.bt-secret-field{align-items:center;min-height:36px}
.bt-secret-input{flex:1;width:100%;min-width:0;margin:0;padding:0;border:0;outline:none;background:transparent;color:var(--bt-ink);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;line-height:20px;letter-spacing:.04em}
.bt-secret-input[data-masked]{-webkit-text-security:disc}
.bt-secret-input::placeholder{color:var(--bt-ink-3);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;letter-spacing:0}
.bt-secret-scope{position:relative;display:inline-grid;grid-template-columns:1fr 1fr;align-self:flex-start;padding:2px;border-radius:999px;background:var(--bt-hover)}
.bt-secret-glide{position:absolute;top:2px;bottom:2px;left:2px;width:calc(50% - 2px);border-radius:999px;background:var(--bt-main);box-shadow:0 1px 3px rgba(20,20,20,.08),inset 0 0 0 .5px color-mix(in srgb,var(--bt-ink) 6%,transparent);transition:${spring(SPRING_SHAPE, "transform")}}
.bt-secret-glide[data-at="1"]{transform:translateX(100%)}
.bt-secret-seg{position:relative;z-index:1;height:28px;padding:0 14px;border:0;border-radius:999px;background:none;color:var(--bt-ink-2);font:inherit;font-size:13px;white-space:nowrap;cursor:pointer;transition:color .16s ease}
.bt-secret-seg[aria-checked=true]{color:var(--bt-ink);font-weight:500}
.bt-secret-seg:focus-visible{outline:2px solid var(--bt-accent);outline-offset:-2px}
/* A key card asks the user to act, so the process group carrying it stays open in every
   work-details mode (same override as .bt-group-replies in styles.js). */
[data-step-process]:has(.bt-secret)>div:first-child{display:none!important}
[data-step-process]:has(.bt-secret)>[data-step-process-body]{display:block!important;content-visibility:visible!important;max-height:none!important;overflow:visible!important;mask-image:none!important;scrollbar-gutter:auto!important}
.bt-secret-ok{display:flex;align-items:center;gap:4px;margin-top:6px;animation:bt-secret-in .22s cubic-bezier(.22,1,.36,1)}
.bt-secret-ok svg{width:13px;height:13px;color:#16a34a}
@keyframes bt-secret-in{from{opacity:0;transform:translateY(-2px)}}
.bt-secret-saved{display:flex;align-items:center;gap:6px;font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-secret-note{font-size:12px;line-height:17px;color:var(--bt-ink-3)}
.bt-secret-note code,.bt-secret-about code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}
.bt-secret-warn{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;font-size:12px;line-height:16px;color:#b25e09;background:color-mix(in srgb,#f59e0b 12%,transparent)}
.bt-secret-error{font-size:12px;line-height:16px;color:var(--bt-danger)}
.bt-secret .bt-q-btn:disabled{opacity:.5;cursor:default}
.bt-secret-done .bt-q-head{align-items:center}
.bt-secret-done .bt-q-title{font-size:13px;line-height:18px;color:var(--bt-ink-2);font-weight:500}
.bt-secret-scope-tag{font-weight:400;color:var(--bt-ink-3)}
.bt-secret-check{color:var(--bt-green,#22a06b);animation:bt-secret-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} backwards}
.bt-secret-done{animation:bt-secret-settle .32s cubic-bezier(.22,1,.36,1) backwards}
@keyframes bt-secret-pop{from{opacity:0;transform:scale(.4)}}
@keyframes bt-secret-settle{from{opacity:.4;transform:scale(.985)}}
.bt-secret-event{display:inline-flex;align-items:center;gap:5px}
.bt-secret-dock{flex-direction:column;align-items:center}
.bt-secret-dock .bt-q{max-width:min(550px,calc(100% - 32px))}
.bt-secret-about{margin:0 0 12px;padding:0 4px;font-size:12px;line-height:17px;color:var(--bt-ink-2)}
.bt-secret-title{display:flex;align-items:center;gap:6px;min-width:0;color:var(--bt-ink)}
.bt-secret-title svg{flex:none;color:var(--bt-ink-2)}
.bt-secret-purpose{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--bt-ink-2)}
.bt-secret-faces{display:inline-flex}
.bt-secret-faces>*+*{margin-left:-6px}
.bt-secret-edit{display:flex;flex-direction:column;gap:14px;padding:4px 12px 14px;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
.bt-secret-edit-block{display:flex;flex-direction:column;gap:8px}
.bt-secret-edit-label{font-size:12px;line-height:16px;font-weight:600;color:var(--bt-ink-2)}
.bt-secret-radios{display:flex;gap:16px;font-size:13px}
.bt-secret-radio{display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.bt-secret-bots{display:flex;flex-wrap:wrap;gap:6px}
.bt-secret-bot{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px 0 5px;border-radius:999px;border:.5px solid var(--bt-line);background:var(--bt-card);color:var(--bt-ink-2);font:inherit;font-size:12px;cursor:pointer;transition:background-color .12s ease,color .12s ease,border-color .12s ease}
.bt-secret-bot[aria-pressed=true]{background:var(--bt-active);color:var(--bt-ink);border-color:var(--bt-line-2)}
.bt-secret-bot svg{width:13px;height:13px}
.bt-secret-inline{display:flex;gap:8px;align-items:center}
.bt-secret-row-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.bt-secret-row-actions .bt-set-hint{flex:1}
.bt-secret-danger{color:var(--bt-danger);display:inline-flex;align-items:center;gap:4px}
.bt-secret-danger svg{width:13px;height:13px}
.bt-secret-add .bt-input{height:34px}
@media (prefers-reduced-motion:reduce){.bt-secret-glide{transition:none}.bt-secret-check,.bt-secret-done,.bt-secret-ok,.bt-secret-edit{animation:none}}
`;

// src/client/turn-reasoning.js
function turnReasoning(steps, current) {
  const members = steps.length ? steps : [current];
  if (members.findLast((step) => stepReasoning(step) !== "")?.step !== current.step) return "";
  return members.map(stepReasoning).filter(Boolean).join("\n\n");
}
var thinkingStep = (steps) => steps.find(thinkingLive);
var thinkingLive = (step) => step.status === "running" && texts(step).length === 0 && step.blocks.some((block) => block.kind === "reasoning");
var texts = (step) => step.blocks.filter((block) => block.kind === "text" && block.text.trim() !== "");
var stepReasoning = (step) => step.blocks.filter((block) => block.kind === "reasoning").map((block) => block.text).join("\n").trim();

// src/client/fold.js
var import_react8 = require("react");
var FOLD_AT = { chars: 1500, lines: 25 };
var FOLD_HUGE = { chars: 2e4, lines: Infinity };
var ALWAYS = { chars: -1, lines: 0 };
var PREVIEW_LINES = 10;
var PREVIEW_CHARS = 600;
var FENCE = /^ {0,3}(`{3,}|~{3,})/;
function moreLines(text, max) {
  let lines = 1;
  for (let at2 = text.indexOf("\n"); at2 !== -1; at2 = text.indexOf("\n", at2 + 1)) {
    if (++lines > max) return true;
  }
  return false;
}
function foldPreview(text, limit = FOLD_AT, markdown = true) {
  if (text.length <= limit.chars && !moreLines(text, limit.lines)) return null;
  let head = text.split("\n", PREVIEW_LINES).join("\n");
  if (head.length > PREVIEW_CHARS) {
    const cut = head.lastIndexOf("\n", PREVIEW_CHARS);
    const end = cut > 0 ? cut : PREVIEW_CHARS;
    const code = head.charCodeAt(end - 1);
    head = head.slice(0, code >= 55296 && code <= 56319 ? end - 1 : end);
  }
  if (!markdown) return head;
  let open = null;
  for (const line of head.split("\n")) {
    const marker = FENCE.exec(line)?.[1];
    if (marker === void 0) continue;
    if (open === null) open = marker;
    else if (marker[0] === open[0] && marker.length >= open.length) open = null;
  }
  return open === null ? head : `${head}
${open}`;
}
var stripLongNote = (text) => text.replace(/^\[A long message: \d+ characters\.[^\]\n]*\]\n/, "");
function useFold(text, { limit = FOLD_AT, whole, live = false, markdown = true } = {}) {
  const [open, setOpen] = (0, import_react8.useState)(false);
  const [read, setRead] = (0, import_react8.useState)();
  const cut = whole !== void 0 && whole.length > text.length;
  const preview = (0, import_react8.useMemo)(() => live ? null : foldPreview(text, cut ? ALWAYS : limit, markdown), [text, live, limit, markdown, cut]);
  if (preview === null) return { shown: text, control: null };
  const count = (cut ? whole.length : text.length).toLocaleString();
  if (!open) {
    const show = async () => {
      setOpen(true);
      if (!cut || read !== void 0 || whole.load === void 0) return;
      setRead("loading");
      setRead(await whole.load() ?? { whole: false });
    };
    return { shown: preview, folded: true, control: (0, import_react8.createElement)("span", { className: "bt-fold" }, (0, import_react8.createElement)("button", { type: "button", className: "bt-more", onClick: show }, t("Show all · {count} characters", { count }))) };
  }
  const loaded = typeof read?.text === "string" ? read : void 0;
  const note = !cut || read === void 0 || read === "loading" || loaded?.whole ? null : loaded !== void 0 && loaded.text.length > text.length ? t("Showing the first {count} characters", { count: loaded.text.length.toLocaleString() }) : t("Only the start of this message is kept here");
  return {
    shown: loaded?.text ?? text,
    control: (0, import_react8.createElement)(
      "span",
      { className: "bt-fold" },
      note ? (0, import_react8.createElement)("span", { className: "bt-fold-note" }, note) : null,
      (0, import_react8.createElement)("button", { type: "button", className: "bt-more", onClick: () => setOpen(false) }, t("Show less"))
    )
  };
}

// src/client/cells.js
var import_react9 = require("react");
var import_react_dom = require("react-dom");
var mdLabels2 = () => ({ code: { copyLabel: t("Copy"), copiedLabel: t("Copied") }, footnotes: t("Footnotes") });
function Bubbles({ texts: texts2, roster, selfId, actions, streaming, sessionId, msgKey, useUi, lead, mentions, fold = FOLD_AT, whole }) {
  const onClick = (event) => {
    const target = mentionTarget(event);
    if (target === null) return;
    event.preventDefault();
    event.stopPropagation();
    actions.openSession(target);
  };
  const reactions = useUi ? useUi((state) => msgKey ? state.reactions?.[msgKey] ?? null : null) : null;
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-astack", "data-lead": lead ? "" : void 0, onClickCapture: onClick },
    texts2.map((text, index) => {
      const last = index === texts2.length - 1;
      return (0, import_react9.createElement)(Bubble, {
        key: index,
        text,
        index,
        roster,
        selfId,
        actions,
        sessionId,
        msgKey,
        mentions,
        fold,
        picked: msgKey ? reactions?.[index] ?? [] : [],
        live: streaming && last,
        lead: lead && last ? lead : null,
        whole: last ? whole : void 0
      });
    })
  );
}
function Bubble({ text, index, roster, selfId, actions, sessionId, msgKey, mentions, fold, picked, live, lead, whole }) {
  const { shown, folded, control } = useFold(text, { limit: fold, whole, live });
  const key = msgKey ? `${msgKey}:${index}` : void 0;
  const body = (0, import_react9.createElement)(import_dsh_client_ui_primitives.MarkdownText, { text: linkMentions(shown, roster.bots, selfId), streaming: live, labels: mdLabels2(), variant: "compact", fileMentions: mentions });
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-msg" },
    (0, import_react9.createElement)(
      "div",
      { className: "bt-msg-line" },
      lead,
      (0, import_react9.createElement)(
        "div",
        { className: "bt-bubble", "data-folded": folded || void 0 },
        control ? (0, import_react9.createElement)("div", { className: "bt-fold-body" }, body) : body,
        control
      ),
      live ? null : (0, import_react9.createElement)(MessageTools, { text: folded ? text : shown, name: roster.byId[selfId]?.name ?? t("Bot"), sessionId, react: key ? (emoji) => actions.toggleReaction(msgKey, index, emoji) : void 0, actions })
    ),
    picked.length ? (0, import_react9.createElement)("div", { className: "bt-reacts" }, picked.map((emoji) => (0, import_react9.createElement)("button", {
      key: emoji,
      type: "button",
      className: "bt-react",
      "aria-label": t("Remove reaction {emoji}", { emoji }),
      onClick: () => actions.toggleReaction(msgKey, index, emoji)
    }, emoji))) : null
  );
}
var REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
function useDismiss(open, close, refs) {
  (0, import_react9.useEffect)(() => {
    if (!open) return void 0;
    const onDown = (event) => {
      if (refs.some((ref) => ref.current?.contains(event.target))) return;
      close();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
}
function MessageTools({ text, name, sessionId, react, actions }) {
  const [panel, setPanel] = (0, import_react9.useState)(null);
  const [place, setPlace] = (0, import_react9.useState)(null);
  const [copied, setCopied] = (0, import_react9.useState)(false);
  const tools = (0, import_react9.useRef)(null);
  const pop = (0, import_react9.useRef)(null);
  const close = () => setPanel(null);
  useDismiss(panel !== null, close, [tools, pop]);
  const open = (kind, event) => {
    if (panel === kind) {
      close();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const below = rect.bottom + 220 < window.innerHeight;
    setPlace(kind === "react" ? { left: rect.left + rect.width / 2, top: rect.top - 6, "--bt-origin": "bottom center" } : { left: Math.min(rect.left, window.innerWidth - 208), ...below ? { top: rect.bottom + 4 } : { bottom: window.innerHeight - rect.top + 4, "--bt-origin": "bottom left" } });
    setPanel(kind);
  };
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1e3);
    });
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `${name}-message.md` });
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1e3);
  };
  const item = (label, Icon, run) => (0, import_react9.createElement)("button", { key: label, type: "button", role: "menuitem", onClick: () => {
    close();
    run();
  } }, (0, import_react9.createElement)(Icon), label);
  return (0, import_react9.createElement)(
    "div",
    { ref: tools, className: "bt-tools", "data-open": panel !== null || void 0 },
    react ? (0, import_react9.createElement)("button", { type: "button", className: "bt-tool", "aria-label": t("Add reaction"), title: t("Add reaction"), "aria-expanded": panel === "react", onClick: (event) => open("react", event) }, (0, import_react9.createElement)(SmileIcon)) : null,
    sessionId ? (0, import_react9.createElement)("button", { type: "button", className: "bt-tool", "aria-label": t("Reply"), title: t("Reply"), onClick: () => actions.quote(sessionId, text) }, (0, import_react9.createElement)(ReplyIcon)) : null,
    (0, import_react9.createElement)("button", { type: "button", className: "bt-tool", "aria-label": t("More message actions"), title: t("More"), "aria-haspopup": "menu", "aria-expanded": panel === "more", onClick: (event) => open("more", event) }, copied ? (0, import_react9.createElement)(CheckIcon) : (0, import_react9.createElement)(DotsIcon)),
    panel === "react" ? (0, import_react_dom.createPortal)((0, import_react9.createElement)(
      "div",
      { ref: pop, className: "bt-react-strip", role: "menu", "aria-label": t("Reactions"), style: place },
      REACTIONS.map((emoji) => (0, import_react9.createElement)("button", { key: emoji, type: "button", role: "menuitem", "aria-label": emoji, onClick: () => {
        close();
        react(emoji);
      } }, emoji))
    ), document.body) : null,
    panel === "more" ? (0, import_react_dom.createPortal)((0, import_react9.createElement)(
      "div",
      { ref: pop, className: "bt-menu", role: "menu", "aria-label": t("Message actions"), style: place },
      item(t("Copy"), CopyIcon, copy),
      item(t("Download"), DownloadIcon, download)
    ), document.body) : null
  );
}
var thinkingTimes = /* @__PURE__ */ new Map();
function useThinkingMs({ sessionId, turn, settledSteps, skip }) {
  const key = `${sessionId}:${turn}:${settledSteps}`;
  const [ms, setMs] = (0, import_react9.useState)(() => thinkingTimes.get(key));
  (0, import_react9.useEffect)(() => {
    if (skip || thinkingTimes.has(key)) {
      setMs(thinkingTimes.get(key));
      return void 0;
    }
    const control = new AbortController();
    call("thinking", { sessionId, turn }, control.signal).then((value) => {
      thinkingTimes.set(key, value?.ms);
      setMs(value?.ms);
    }).catch(() => {
    });
    return () => control.abort();
  }, [key, skip]);
  return ms;
}
var rowViews = /* @__PURE__ */ new Map();
function ThinkingRow({ text, live, at: at2, ms, viewKey }) {
  const box2 = (0, import_react9.useRef)(null);
  const view = (0, import_react9.useRef)(rowViews.get(viewKey));
  const atEnd = (0, import_react9.useRef)(view.current?.atEnd ?? true);
  const [open, setOpen] = (0, import_react9.useState)(view.current?.open ?? false);
  const [fade, setFade] = (0, import_react9.useState)(void 0);
  const remember = (patch) => {
    if (viewKey !== void 0) rowViews.set(viewKey, { ...rowViews.get(viewKey), ...patch });
  };
  const measure = () => {
    const el = box2.current;
    atEnd.current = el.scrollHeight - el.scrollTop - el.clientHeight < 2;
    remember({ atEnd: atEnd.current, top: el.scrollTop });
    const above = el.scrollTop > 0;
    setFade(above && !atEnd.current ? "both" : above ? "top" : !atEnd.current ? "bottom" : void 0);
  };
  const toggle = (event) => {
    const next = event.currentTarget.open;
    if (next) atEnd.current = true;
    remember({ open: next });
    setOpen(next);
  };
  (0, import_react9.useLayoutEffect)(() => {
    if (!open) return;
    const el = box2.current;
    const restore = view.current;
    view.current = void 0;
    if (atEnd.current) el.scrollTop = el.scrollHeight;
    else if (restore?.top !== void 0) el.scrollTop = restore.top;
    measure();
  }, [text, open]);
  const title = live ? t("Thinking") : t("Thought it through");
  return (0, import_react9.createElement)(
    "details",
    { className: "bt-think", open, onToggle: toggle },
    (0, import_react9.createElement)(
      "summary",
      null,
      title,
      live && at2 !== void 0 ? (0, import_react9.createElement)(Elapsed, { at: at2, className: "bt-think-time" }) : null,
      !live && ms !== void 0 ? (0, import_react9.createElement)("span", { className: "bt-think-time" }, `· ${elapsedLabel(Math.max(1e3, ms))}`) : null
    ),
    (0, import_react9.createElement)("div", { ref: box2, className: "bt-think-text", role: "region", "aria-label": title, tabIndex: 0, "data-fade": fade, onScroll: measure }, text)
  );
}
function useFileMentions({ node, openFile, fileMentions, useTurnData }) {
  const tail = useTurnData?.("turn-tail");
  const location2 = node.location;
  const turn = location2?.kind === "turn" || location2?.kind === "step" ? location2.turn : void 0;
  const seq = node.data.finalNode?.seq;
  return (0, import_react9.useMemo)(() => {
    if (typeof fileMentions !== "function" || turn?.status !== "closed" || seq === void 0) return void 0;
    return tail?.closing?.finalNode.seq === seq ? fileMentions({ turn, seq, openFile }) : void 0;
  }, [fileMentions, openFile, seq, tail, turn]);
}
function AssistantCell({ node, groupPart, sessionId, openFile, fileMentions, useTurnData, useRoster, useUi, useTurnSteps, useTurnContext, actions }) {
  const roster = useRoster((value) => value);
  const data = node.data;
  const steps = useTurnSteps(String(data.turn));
  const contexts = useTurnContext(String(data.turn));
  const mentions = useFileMentions({ node, openFile, fileMentions, useTurnData });
  const hidden = Boolean(roster.roomsById[sessionId]) || isHiddenTurn(roster, sessionId, data.turn);
  const texts2 = groupPart === "reasoning" ? [] : data.blocks.filter((block) => block.kind === "text" && block.text.trim() !== "").map((block) => block.text);
  const running = data.status === "running";
  const members = steps.length ? steps : [data];
  const reasoning = groupPart === "response" ? "" : turnReasoning(steps, data);
  const thinking = groupPart === "response" ? void 0 : thinkingStep(members);
  const ms = useThinkingMs({ sessionId, turn: data.turn, settledSteps: members.filter((step) => step.status !== "running").length, skip: hidden || reasoning === "" });
  useLiveNote(actions, sessionId, `text:${node.key ?? data.seq}`, !hidden && running && texts2.length > 0 ? { text: true } : null);
  useLiveNote(actions, sessionId, `think:${node.key ?? data.seq}`, !hidden && thinking !== void 0 && reasoning !== "" ? { text: true } : null);
  if (hidden) return null;
  const relays = relayPart(data, groupPart) ? relaysBefore(contexts, steps, data) : [];
  if (texts2.length === 0 && !reasoning && relays.length === 0) return null;
  const selfId = roster.byId[sessionId]?.id ?? sessionId;
  return (0, import_react9.createElement)(
    import_react9.Fragment,
    null,
    relays.map((relay) => {
      const source = relay.source;
      const sender = roster.byId[source.senderSessionId] ?? { id: source.senderSessionId, name: source.senderName ?? t("a Bot"), color: "gray" };
      return (0, import_react9.createElement)(EventLine, {
        key: relay.seq,
        prefix: source.role === "stopped" ? t("Stopped by") : source.role === "reply" ? t("Reply from") : t("Message from"),
        bots: [sender],
        onOpen: () => {
          if (sender.id) actions.openExchange(selfId, sender.id);
        },
        whole: true
      });
    }),
    reasoning ? (0, import_react9.createElement)(ThinkingRow, {
      text: reasoning,
      live: thinking !== void 0,
      viewKey: `${sessionId}:${data.turn}`,
      // The live clock counts the settled steps too: backing `at` by the settled
      // time makes one Elapsed show settled + running.
      ...thinking !== void 0 ? { at: typeof thinking.time === "number" ? thinking.time - (ms ?? 0) : void 0 } : { ms }
    }) : null,
    texts2.length ? (0, import_react9.createElement)(Bubbles, { texts: texts2, roster, selfId, actions, streaming: running, sessionId, msgKey: `${sessionId}:${data.turn}:${node.key ?? data.seq ?? ""}`, useUi, mentions, fold: FOLD_HUGE }) : null
  );
}
function EventLine({ prefix, bots, joiner = t("and"), onOpen, whole = false }) {
  if (whole && bots.length === 1) {
    return (0, import_react9.createElement)(
      "div",
      { className: "bt-event" },
      (0, import_react9.createElement)(
        "button",
        { type: "button", className: "bt-event-whole", title: bots[0].name, onClick: () => onOpen?.(bots[0]) },
        (0, import_react9.createElement)("span", null, prefix),
        (0, import_react9.createElement)(BotMark, { bot: bots[0], size: 16 }),
        (0, import_react9.createElement)("span", { className: "bt-event-name" }, bots[0].name)
      )
    );
  }
  const parts = [];
  parts.push((0, import_react9.createElement)("span", { key: "p" }, prefix));
  bots.forEach((bot, index) => {
    if (index > 0) parts.push((0, import_react9.createElement)("span", { key: `j${index}` }, joiner));
    parts.push((0, import_react9.createElement)(
      "button",
      { key: bot.id ?? index, type: "button", onClick: () => onOpen?.(bot) },
      (0, import_react9.createElement)(BotMark, { bot, size: 16 }),
      bot.name
    ));
  });
  return (0, import_react9.createElement)("div", { className: "bt-event" }, parts);
}
function GroupMessage({ bot, text, texts: texts2 = [text], room: room2, roster, actions, msgKey, useUi, whole, time, duration }) {
  const lead = (0, import_react9.createElement)(
    "button",
    { type: "button", className: "bt-lead", "aria-label": t("Open {name}'s chat", { name: bot.name }), onClick: () => actions.openSession(bot.id) },
    (0, import_react9.createElement)(BotMark, { bot, size: 22 })
  );
  const took = Number.isFinite(duration) ? elapsedLabel(duration) : void 0;
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-group-msg" },
    (0, import_react9.createElement)(
      "span",
      { className: "bt-group-name", style: { color: inkText(colorOf(bot)) } },
      bot.name,
      room2?.admin === bot.id ? (0, import_react9.createElement)("span", { className: "bt-group-role" }, t("Admin")) : null,
      Number.isFinite(time) ? (0, import_react9.createElement)("span", { className: "bt-group-time", title: clockLabel(time) }, messageClock(time)) : null,
      took ? (0, import_react9.createElement)("span", { className: "bt-group-took", title: t("Ran for {duration}", { duration: took }) }, took) : null
    ),
    (0, import_react9.createElement)(Bubbles, { texts: texts2, roster, selfId: bot.id, actions, sessionId: room2?.id, msgKey, useUi, lead, whole })
  );
}
function stackReplies(replies) {
  const items = [];
  replies.forEach((reply, index) => {
    const last = items.at(-1);
    if (reply.kind === void 0 && last?.reply.kind === void 0 && last?.reply.botId === reply.botId) {
      last.texts.push(reply.text);
      last.time = reply.time;
      last.duration = reply.duration;
    } else items.push({ reply, index, texts: reply.kind === void 0 ? [reply.text] : [], time: reply.time, duration: reply.duration });
  });
  return items;
}
function GroupEvent({ prefix, room: room2, name, roster, actions }) {
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-event" },
    (0, import_react9.createElement)("span", null, prefix),
    room2 ? (0, import_react9.createElement)("button", { type: "button", onClick: () => actions.openSession(room2.id) }, (0, import_react9.createElement)(RoomAvatar, { room: room2, roster, size: 16 }), room2.name) : name ? (0, import_react9.createElement)("span", null, name) : null
  );
}
function MemoryEvent({ sessionId, scope, result, roster, actions, findBot }) {
  if (!/^(Saved to|Updated in|Removed from) /.test(result)) return null;
  const self = roster.byId[sessionId];
  const team = /^team$/i.test(String(scope ?? "").trim());
  const other = team || !scope ? void 0 : findBot(scope);
  const target = other && other.id !== self?.id ? other : self;
  if (!target) return null;
  const label = team ? t("Team memory updated") : target === self ? t("Memory updated") : t("Updated {name}'s memory", { name: target.name });
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-event" },
    (0, import_react9.createElement)("button", { type: "button", title: result, onClick: () => actions.openMemory(target.id) }, (0, import_react9.createElement)(MemoryIcon), label)
  );
}
function PartLine({ time }) {
  return (0, import_react9.createElement)("div", { className: "bt-part-line", role: "separator" }, Number.isFinite(time) ? (0, import_react9.createElement)("span", null, dayLabel(time)) : null);
}
var scrollParent = (node) => {
  for (let at2 = node.parentElement; at2; at2 = at2.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(at2).overflowY)) return at2;
  }
  return null;
};
function EarlierUser({ row }) {
  const { shown, folded, control } = useFold(row.text ?? "");
  const body = row.text ? (0, import_react9.createElement)(import_dsh_client_ui_primitives.MarkdownText, { text: shown, labels: mdLabels2(), variant: "compact" }) : null;
  return (0, import_react9.createElement)("div", { className: "bt-urow" }, (0, import_react9.createElement)(
    "div",
    { className: "bt-ububble", "data-folded": folded || void 0 },
    control ? (0, import_react9.createElement)("div", { className: "bt-fold-body" }, body) : body,
    control,
    row.images ? (0, import_react9.createElement)("span", { className: "bt-uimages" }, row.images === 1 ? t("1 image") : t("{count} images", { count: row.images })) : null
  ));
}
function EarlierParts({ sessionId, roster, actions }) {
  const [view, setView] = (0, import_react9.useState)({ items: [], cursor: void 0, loading: true, failed: false, startedAt: null });
  const top = (0, import_react9.useRef)(null);
  const busy = (0, import_react9.useRef)(false);
  const alive = (0, import_react9.useRef)(true);
  const restore = (0, import_react9.useRef)(null);
  const load = (cursor) => {
    if (busy.current) return;
    busy.current = true;
    setView((current) => ({ ...current, loading: true, failed: false }));
    actions.earlier(sessionId, cursor).then((page) => {
      busy.current = false;
      if (!alive.current) return;
      const scroller = top.current && scrollParent(top.current);
      if (scroller) restore.current = { scroller, fromEnd: scroller.scrollHeight - scroller.scrollTop };
      setView((current) => ({ items: [...page.items, ...current.items], cursor: page.cursor, loading: false, failed: false, startedAt: page.startedAt ?? current.startedAt }));
    }, () => {
      busy.current = false;
      if (alive.current) setView((current) => ({ ...current, loading: false, failed: true }));
    });
  };
  (0, import_react9.useEffect)(() => {
    alive.current = true;
    load(void 0);
    return () => {
      alive.current = false;
    };
  }, [sessionId]);
  (0, import_react9.useLayoutEffect)(() => {
    const pending = restore.current;
    restore.current = null;
    if (pending) pending.scroller.scrollTop = pending.scroller.scrollHeight - pending.fromEnd;
  }, [view.items]);
  (0, import_react9.useEffect)(() => {
    const node = top.current;
    if (!node || view.loading || view.failed || !view.cursor || typeof IntersectionObserver !== "function") return void 0;
    const observer = new IntersectionObserver((entries2) => {
      if (entries2.some((entry) => entry.isIntersecting)) load(view.cursor);
    }, { root: scrollParent(node), rootMargin: "600px 0px 0px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [view.cursor, view.loading, view.failed]);
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-earlier", role: "feed", "aria-label": t("Earlier messages"), "aria-busy": view.loading },
    (0, import_react9.createElement)(
      "div",
      { ref: top, className: "bt-earlier-top" },
      view.loading ? (0, import_react9.createElement)(Shimmer, null, t("Loading earlier messages…")) : view.failed ? (0, import_react9.createElement)("button", { type: "button", className: "bt-soft", onClick: () => load(view.cursor) }, t("Couldn’t load earlier messages · Retry")) : view.cursor ? (0, import_react9.createElement)("button", { type: "button", className: "bt-soft", onClick: () => load(view.cursor) }, t("Load earlier")) : null
    ),
    (0, import_react9.createElement)(ChatRows, { items: view.items, sessionId, roster, actions }),
    (0, import_react9.createElement)(PartLine, { time: view.startedAt })
  );
}
function ChatRows({ items, sessionId, roster, actions, useUi, clock: clock4 = false }) {
  const selfId = roster.byId[sessionId]?.id;
  const rows = [];
  for (const item of items) {
    const last = rows.at(-1);
    if (item.kind === "bot" && last?.kind === "bot") {
      last.texts.push(item.text);
      last.end = item.time;
    } else rows.push(item.kind === "bot" ? { kind: "bot", texts: [item.text], time: item.time, end: item.time } : item);
  }
  let before;
  return rows.flatMap((row, index) => {
    const key = rows.length - index;
    const shown = chatRow(row, key, { sessionId, selfId, roster, actions, useUi });
    if (row.kind === "divider") {
      before = void 0;
      return [shown];
    }
    const pause = clock4 && Number.isFinite(row.time) && (before === void 0 || row.time - before >= SEPARATOR_GAP_MS);
    if (Number.isFinite(row.end ?? row.time)) before = row.end ?? row.time;
    return pause ? [(0, import_react9.createElement)("div", { key: `${key}:clock`, className: "bt-time-sep", role: "separator" }, clockLabel(row.time)), shown] : [shown];
  });
}
function chatRow(row, key, { sessionId, selfId, roster, actions, useUi }) {
  switch (row.kind) {
    case "divider":
      return (0, import_react9.createElement)(PartLine, { key, time: row.time });
    case "user":
      return (0, import_react9.createElement)(EarlierUser, { key, row });
    case "answer":
      return (0, import_react9.createElement)(AnsweredReply, { key, node: { data: row } });
    case "bot":
      return (0, import_react9.createElement)(Bubbles, { key, texts: row.texts, roster, selfId, actions, sessionId: useUi ? sessionId : void 0, msgKey: useUi ? `${sessionId}:${row.time}` : void 0, useUi, fold: FOLD_HUGE });
    case "event": {
      if (row.role === "report") return (0, import_react9.createElement)(GroupEvent, { key, prefix: t("Replies from"), room: roster.roomsById[row.roomId], name: t("a group chat"), roster, actions });
      const other = roster.byId[row.botId] ?? { id: row.botId, name: row.name ?? t("a Bot"), color: "gray" };
      const prefix = { stopped: t("Stopped by"), reply: t("Reply from") }[row.role] ?? t("Message from");
      return (0, import_react9.createElement)(EventLine, { key, prefix, bots: [other], onOpen: () => {
        if (selfId && other.id) actions.openExchange(selfId, other.id);
      }, whole: true });
    }
    default:
      return null;
  }
}
function TriggerCell({ node, sessionId, useRoster, useSessions, useTurnClock, useUi, actions }) {
  const roster = useRoster((value) => value);
  const data = node.data;
  const source = data.source !== null && typeof data.source === "object" ? data.source : {};
  const selfId = roster.byId[sessionId]?.id ?? sessionId;
  const deferred = source.kind === "bot" && source.deferred === true;
  const relayed = isRelayContext(data);
  const turn = node.location?.turn?.turn ?? data.turn;
  (0, import_react9.useLayoutEffect)(() => {
    if (relayed) actions.noteTurnPeer(sessionId, turn, source.senderSessionId);
  }, [relayed, sessionId, turn, source.senderSessionId]);
  const order = useSessions((list) => {
    const outline = list.projectionsBySession?.[sessionId]?.values?.turnOutline ?? list.byId[sessionId]?.projectionValues?.turnOutline;
    return Array.isArray(outline) ? outline.map((entry) => entry.turn).join(",") : "";
  });
  const peers = useTurnClock((state) => {
    if (!relayed) return "";
    const turns = state[sessionId] ?? {};
    return Object.keys(turns).filter((key) => turns[key].peer !== void 0).map((key) => `${key}:${turns[key].peer}`).join(",");
  });
  const visit = useUi((state) => state.visits?.[sessionId]);
  const hiddenTurns = roster.exchangeTurns[sessionId];
  const unreadOpening = useTurnClock((state) => {
    const first = openingTurn(state[sessionId], order, hiddenTurns);
    return first?.turn === turn && unseenSince(visit, first.start) ? clockLabel(first.start) : "";
  });
  const body = triggerBody();
  return unreadOpening ? (0, import_react9.createElement)(import_react9.Fragment, null, (0, import_react9.createElement)("div", { className: "bt-open-new" }, (0, import_react9.createElement)(NewDivider), (0, import_react9.createElement)("div", { className: "bt-time-sep", role: "separator" }, unreadOpening)), body) : body;
  function triggerBody() {
    if (source.kind === "bot") {
      if (source.handoff === true) return roster.roomsById[sessionId] ? null : (0, import_react9.createElement)(EarlierParts, { sessionId, roster, actions });
      if (source.role === "kickoff" || source.role === "room") return null;
      if (source.role === "secret" || deferred) return null;
      if (source.role === "post") {
        if (source.logged !== void 0) return null;
        if (source.failed !== void 0 || source.resumed === true || source.stopped === true || source.done === true) return null;
        const room2 = roster.roomsById[sessionId];
        const poster = roster.byId[source.senderSessionId] ?? { id: source.senderSessionId, name: source.senderName ?? t("a Bot"), color: "gray" };
        const file = source.length === void 0 ? void 0 : (data.content ?? []).find((block) => block?.type === "file")?.attachment;
        const text = stripHeader(contentText(data.content));
        return (0, import_react9.createElement)(GroupMessage, {
          bot: poster,
          text: file ? stripLongNote(text) : text,
          room: room2,
          roster,
          actions,
          msgKey: `${sessionId}:post:${data.seq ?? node.key}`,
          useUi,
          time: data.time,
          whole: file ? { length: source.length, load: () => actions.fileText(file) } : void 0
        });
      }
      if (source.role === "report") {
        return (0, import_react9.createElement)(GroupEvent, { prefix: t("Replies from"), room: roster.roomsById[source.roomId], name: t("a group chat"), roster, actions });
      }
      if (source.role === "resume" || source.resumed === true) return (0, import_react9.createElement)("div", { className: "bt-event" }, t("Picked up its work after a restart"));
      if (source.role === "retry" || source.retried === true) return (0, import_react9.createElement)("div", { className: "bt-event" }, t("Asked to make the tool call it wrote as text"));
      const run = relayed ? commRunOf(
        order.split(",").filter(Boolean).map(Number),
        Object.fromEntries(peers.split(",").filter(Boolean).map((pair) => [Number(pair.slice(0, pair.indexOf(":"))), pair.slice(pair.indexOf(":") + 1)])),
        turn,
        hiddenTurns
      ) : null;
      if (run === "folded") return null;
      const sender = roster.byId[source.senderSessionId] ?? { id: source.senderSessionId, name: source.senderName ?? t("a Bot"), color: "gray" };
      const count = run?.count ?? (isHiddenTurn(roster, sessionId, turn) ? 2 : 1);
      const bots = [sender];
      for (const peer of (run?.peerIds ?? []).map((id) => roster.byId[id]).filter(Boolean)) {
        if (!bots.some((bot) => bot.id === peer.id)) bots.push(peer);
      }
      return (0, import_react9.createElement)(EventLine, {
        prefix: source.role === "stopped" ? t("Stopped by") : count > 1 ? t("{count} messages with", { count }) : t("Message from"),
        bots,
        onOpen: (bot) => actions.openExchange(selfId, bot.id),
        whole: true
      });
    }
    if (source.kind === "schedule") {
      const prompts = reminderPrompts(contentText(data.content));
      return (0, import_react9.createElement)("div", { className: "bt-event" }, prompts.length > 0 ? t("Scheduled task: {text}", { text: prompts.join(" · ").slice(0, 80) }) : t("Routine started"));
    }
    if (source.kind === "user-question-reply" || source.kind === "goal") return null;
    return (0, import_react9.createElement)("div", { className: "bt-event" }, contentText(data.content).slice(0, 80) || t("Update"));
  }
}
function NewDivider() {
  return (0, import_react9.createElement)("div", { className: "bt-new-sep", role: "separator", "aria-label": t("New messages") }, (0, import_react9.createElement)("span", null, t("New")));
}
function TurnProcessCell({ node, sessionId, turnProcess, useRoster, useUi, useTurnClock, actions }) {
  const open = turnProcess === void 0 || !turnProcess.foldable || turnProcess.open;
  (0, import_react9.useEffect)(() => {
    if (!open) turnProcess.setOpen(true);
  }, [open, turnProcess]);
  const turn = node?.location?.turn?.turn ?? node?.data?.turn;
  const start = node?.location?.turn?.start?.time;
  const hidden = useRoster((roster) => isHiddenTurn(roster, sessionId, turn));
  (0, import_react9.useEffect)(() => {
    actions.noteTurnTime(sessionId, turn, "first", start);
  }, [sessionId, turn, start]);
  const visit = useUi((state) => state.visits?.[sessionId]);
  const fresh = useTurnClock((state) => {
    const own = state[sessionId]?.[turn];
    return !hidden && typeof visit?.seen === "number" && own?.first !== void 0 && own.first <= visit.seen && own.end !== void 0 && own.end > visit.seen && own.end <= visit.entered;
  });
  return fresh ? (0, import_react9.createElement)(NewDivider) : null;
}
function Nothing() {
  return null;
}
var SEPARATOR_GAP_MS = 30 * 60 * 1e3;
function nextTurnStart(turns, turn) {
  let next;
  for (const key in turns) {
    const candidate = Number(key);
    if (candidate > turn && turns[key].first !== void 0 && (next === void 0 || candidate < next)) next = candidate;
  }
  return next === void 0 ? void 0 : turns[next].first;
}
function openingTurn(turns, firstTurns, hiddenTurns) {
  if (!turns || !firstTurns) return null;
  const start = nextTurnStart(turns, -Infinity);
  if (start === void 0) return null;
  const turn = Number(Object.keys(turns).filter((key) => turns[key].first === start)[0]);
  const listed = firstTurns.split(",").map(Number);
  const earlier = listed.filter((entry) => entry < turn);
  return listed.includes(turn) && earlier.every((entry) => hiddenTurns?.includes(entry)) ? { turn, start } : null;
}
var unseenSince = (visit, time) => typeof visit?.seen === "number" && time > visit.seen && time <= visit.entered;
function TurnTailCell({ turn: location2, sessionId, useTurnClock, useUi, actions }) {
  const turn = location2.turn;
  const time = location2.end.time;
  (0, import_react9.useEffect)(() => {
    actions.noteTurnTime(sessionId, turn, "end", time);
  }, [sessionId, turn, time]);
  const label = useTurnClock((state) => {
    const start = nextTurnStart(state[sessionId] ?? {}, turn);
    return start !== void 0 && start - time >= SEPARATOR_GAP_MS ? clockLabel(start) : "";
  });
  const visit = useUi((state) => state.visits?.[sessionId]);
  const fresh = useTurnClock((state) => {
    if (typeof visit?.seen !== "number" || time > visit.seen) return false;
    const start = nextTurnStart(state[sessionId] ?? {}, turn);
    return start !== void 0 && start > visit.seen && start <= visit.entered;
  });
  if (!label && !fresh) return null;
  return (0, import_react9.createElement)(
    import_react9.Fragment,
    null,
    label ? (0, import_react9.createElement)("div", { className: "bt-time-sep", role: "separator" }, label) : null,
    fresh ? (0, import_react9.createElement)(NewDivider) : null
  );
}
function Shimmer({ children }) {
  return (0, import_react9.createElement)("span", { className: "bt-shimmer" }, children);
}
function Elapsed({ at: at2, className }) {
  const [now, setNow] = (0, import_react9.useState)(Date.now);
  (0, import_react9.useEffect)(() => {
    let timer = 0;
    const tick = () => {
      const time = Date.now();
      setNow(time);
      timer = setTimeout(tick, 1e3 - ((time - at2) % 1e3 + 1e3) % 1e3);
    };
    tick();
    return () => clearTimeout(timer);
  }, [at2]);
  return (0, import_react9.createElement)("span", { className }, `· ${elapsedLabel(Math.max(1e3, now - at2))}`);
}
var PHRASES = {
  thinking: ["Thinking about it", "Weighing the options", "Working out a plan", "Sorting out the details"],
  working: ["On it", "Busy with it", "Moving ahead", "Taking care of it", "Making headway"]
};
var TOOL_PHRASES = [
  [/web_?search|search_?web/i, "Searching online"],
  [/fetch|browse|browser|web/i, "Reading a page"],
  [/shell|bash|pwsh|powershell|exec|command|terminal/i, "Running shell commands"],
  [/^(read|view|cat)\b|read_/i, "Opening a file"],
  [/grep|glob|list_dir|^ls$|find|search/i, "Looking through files"],
  [/write|edit|patch|apply|replace/i, "Writing changes"],
  [/image|photo|draw/i, "Working on an image"]
];
var GROUP_PHRASES = { create_group: "Creating a group", update_group: "Updating the group", delete_group: "Deleting the group", post_to_group: "Posting in the group" };
function toolActivity(name, arg, findBot, self) {
  switch (name) {
    case "ask_user":
      return null;
    case "request_secret":
      return null;
    case "list_secrets":
      return { label: t("Checking the keys"), state: "searching" };
    case "ask_user_question":
      return { label: t("Waiting for your answer"), state: "alert" };
    case "group_relay":
      return { relay: true, state: "orbit" };
    case "message_bot": {
      const target = findBot(arg("to"));
      return { label: target ? t("Asking {name}", { name: target.name }) : t("Asking another Bot"), state: "sending" };
    }
    case "stop_bot": {
      const target = findBot(arg("bot"));
      return { label: target ? t("Stopping {name}", { name: target.name }) : t("Stopping another Bot"), state: "sending" };
    }
    case "create_bot":
      return { label: t("Creating {name}", { name: arg("name") ?? t("a Bot") }), state: "sending" };
    case "update_bot": {
      const target = findBot(arg("name")) ?? findBot(arg("bot")) ?? (arg("bot") ? void 0 : self);
      return { label: t("Updating {name}", { name: target?.name ?? t("a Bot") }), state: "sending" };
    }
    case "list_bots":
      return { label: t("Checking the team"), state: "searching" };
    case "read_group_chat":
      return { label: t("Reading {name}", { name: arg("group") ?? t("a group chat") }), state: "searching" };
    case "read_own_chat":
      return { label: t("Looking back through the chat"), state: "searching" };
    case "remember":
      return { label: t("Saving to memory"), state: "working" };
    case "forget":
      return { label: t("Updating memory"), state: "working" };
    case "recall":
      return { label: t("Checking memory"), state: "searching" };
    default:
      if (GROUP_PHRASES[name]) return { label: t(GROUP_PHRASES[name]), state: "sending" };
      const phrase = TOOL_PHRASES.find(([pattern]) => pattern.test(name))?.[1];
      return { label: phrase ? t(phrase) : null, state: toolState(name) };
  }
}
function workPhrase(doing) {
  const { tool, said, note, target, switching } = typeof doing === "string" ? { tool: doing } : doing ?? {};
  if (switching) return t("Moving to a fresh conversation");
  const own = (said || note)?.replace(/[\s.…]+$/u, "");
  if (own) return own;
  if (!tool) return t("Thinking about it");
  const label = toolActivity(tool, () => void 0, () => void 0)?.label ?? t("On it");
  return target ? `${label} · ${target}` : label;
}
function useLiveNote(actions, sessionId, id, entry) {
  const key = entry ? JSON.stringify(entry) : "";
  (0, import_react9.useEffect)(() => {
    if (!key) return void 0;
    actions.noteLive(sessionId, id, JSON.parse(key));
    return () => actions.noteLive(sessionId, id, null);
  }, [sessionId, id, key]);
}
function GroupReplies({ sessionId, callId, done, content, roster, actions, useUi, useWork }) {
  const [live, setLive] = (0, import_react9.useState)({ replies: [], speaking: null });
  (0, import_react9.useEffect)(() => {
    if (done) return void 0;
    let stop = false;
    let timer;
    let seen = "";
    const tick = async () => {
      const result = await actions.roomProgress(sessionId);
      if (stop) return;
      const entry = (result ?? []).find((item) => item.callId === callId) ?? (result ?? [])[0];
      const key = entry ? JSON.stringify([entry.replies, entry.speaking]) : "";
      if (entry && key !== seen) {
        seen = key;
        setLive({ replies: entry.replies ?? [], speaking: entry.speaking ?? null });
      }
      timer = setTimeout(tick, document.hidden ? 5e3 : 1e3);
    };
    void tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [done, sessionId, callId]);
  let replies = live.replies;
  if (done) {
    try {
      replies = JSON.parse(contentText(content)).replies ?? [];
    } catch {
      replies = [];
    }
  }
  const pending = done || !live.speaking ? [] : [live.speaking];
  const speakerTool = useWork?.((work) => work.bots?.[live.speaking]?.tool) ?? void 0;
  const speakerDoing = useWork?.((work) => work.bots?.[live.speaking]?.tool ? workPhrase(work.bots[live.speaking]) : void 0) ?? void 0;
  if (replies.length === 0 && pending.length === 0) return null;
  const room2 = roster.roomsById[sessionId];
  return (0, import_react9.createElement)(
    "div",
    { className: "bt-group-replies" },
    stackReplies(replies).map(({ reply, index, texts: texts2, time, duration }) => {
      const bot = roster.byId[reply.botId] ?? { id: reply.botId, name: reply.name, color: reply.color ?? "gray" };
      if (reply.kind === "user") {
        return (0, import_react9.createElement)("div", { key: `user-${index}`, className: "bt-urow" }, (0, import_react9.createElement)(
          "div",
          { className: "bt-ububble" },
          (0, import_react9.createElement)(import_dsh_client_ui_primitives.MarkdownText, { text: reply.text, labels: mdLabels2(), variant: "compact" }),
          Number.isFinite(time) ? (0, import_react9.createElement)("div", { className: "bt-utime", title: clockLabel(time) }, messageClock(time)) : null
        ));
      }
      if (reply.kind === "failed") {
        return (0, import_react9.createElement)(
          "div",
          { key: `${reply.botId}-${index}`, className: "bt-event bt-event-error", role: "status", title: [reply.code, reply.status, reply.text].filter(Boolean).join(" · ") },
          t("{name} could not answer: {reason}", { name: bot.name, reason: failureLabel(reply.code, reply.text) })
        );
      }
      if (reply.kind === "lookup") {
        return (0, import_react9.createElement)(
          "div",
          { key: `${reply.botId}-${index}`, className: "bt-event" },
          reply.text ? t("{name} looked up its own chat for “{text}”", { name: bot.name, text: reply.text }) : t("{name} looked up its own chat", { name: bot.name })
        );
      }
      if (reply.kind === "missed") {
        return (0, import_react9.createElement)("div", { key: `${reply.botId}-${index}`, className: "bt-event" }, t("{name} didn't answer in time", { name: bot.name }));
      }
      if (reply.kind === "resumed") {
        return (0, import_react9.createElement)("div", { key: `${reply.botId}-${index}`, className: "bt-event" }, t("{name} was cut off by a restart and picked its work back up", { name: bot.name }));
      }
      if (reply.kind === "cut") {
        return (0, import_react9.createElement)("div", { key: `${reply.botId}-${index}`, className: "bt-event" }, t("{name} was cut off by a restart again and stopped", { name: bot.name }));
      }
      if (reply.kind === "approval" || reply.kind === "working") {
        return (0, import_react9.createElement)(
          "div",
          { key: `${reply.botId}-${index}`, className: "bt-event" },
          (0, import_react9.createElement)(
            "button",
            { type: "button", className: "bt-event-whole", onClick: () => actions.showDetails(sessionId) },
            (0, import_react9.createElement)(BotMark, { bot, size: 16 }),
            (0, import_react9.createElement)("span", { className: "bt-event-name" }, t(reply.kind === "working" ? "{name} started on it" : "{name} paused for your approval", { name: bot.name }))
          )
        );
      }
      if (reply.kind === "stopped") {
        return (0, import_react9.createElement)("div", { key: `${reply.botId}-${index}`, className: "bt-event" }, t("You stopped {name}'s work", { name: bot.name }));
      }
      if (reply.kind === "done") {
        return (0, import_react9.createElement)("div", { key: `${reply.botId}-${index}`, className: "bt-event" }, t("{name} finished its work", { name: bot.name }));
      }
      return (0, import_react9.createElement)(GroupMessage, { key: `${reply.botId}-${index}`, bot, texts: texts2, room: room2, roster, actions, msgKey: callId ? `${sessionId}:${callId}:${index}` : void 0, useUi, time, duration });
    }),
    pending.map((id) => {
      const bot = roster.byId[id];
      if (!bot) return null;
      return (0, import_react9.createElement)(
        "div",
        { key: `pending-${id}`, className: "bt-activity" },
        (0, import_react9.createElement)(BotMark, { bot, size: 22, state: speakerTool ? toolState(speakerTool) : "thinking" }),
        (0, import_react9.createElement)(Shimmer, null, speakerDoing ? `${bot.name} · ${speakerDoing}…` : t("{name} is typing…", { name: bot.name }))
      );
    })
  );
}
var DRAWN = /* @__PURE__ */ new Set(["message_bot", "stop_bot", "create_bot", "update_bot", "group_relay", "create_group", "update_group", "delete_group", "post_to_group", "ask_user", "request_secret", "ask_user_question", "show_view", "read_group_chat", "remember", "forget"]);
var CARDS = /* @__PURE__ */ new Set(["ask_user", "request_secret", "show_view"]);
function callTree(root) {
  const calls = [];
  const seen = /* @__PURE__ */ new Set();
  const visit = (call2) => {
    const id = call2.callId ?? call2;
    if (seen.has(id)) return;
    seen.add(id);
    calls.push(call2);
    for (const child of call2.subCalls ?? []) visit(child);
  };
  visit(root);
  return calls;
}
function useShownCards(actions, sessionId, callIds) {
  const key = JSON.stringify(callIds);
  (0, import_react9.useLayoutEffect)(() => {
    const ids = JSON.parse(key);
    if (ids.length === 0 || !actions.noteCards) return void 0;
    actions.noteCards(sessionId, ids, 1);
    return () => actions.noteCards(sessionId, ids, -1);
  }, [sessionId, key]);
}
function renderCall(call2, { sessionId, roster, actions, useUi, useWork, findBot, heldCards }) {
  const tool = toolName(call2);
  const done = call2.kind === "tool-result";
  const { text: arg, value: argValue } = toolArgs(call2);
  const self = roster.byId[sessionId];
  switch (tool) {
    case "message_bot": {
      const target = findBot(arg("to")) ?? { name: arg("to") ?? "…", color: "gray" };
      if (done && call2.isError) return (0, import_react9.createElement)("div", { className: "bt-event" }, t("Couldn't message {name}", { name: target.name }));
      return (0, import_react9.createElement)(EventLine, { prefix: t("Messaged"), bots: [target], onOpen: (bot) => bot.id && actions.openExchange(self?.id ?? sessionId, bot.id), whole: true });
    }
    case "stop_bot": {
      const target = findBot(arg("bot")) ?? { name: arg("bot") ?? "…", color: "gray" };
      if (done && call2.isError) return (0, import_react9.createElement)("div", { className: "bt-event" }, t("Couldn't stop {name}", { name: target.name }));
      return (0, import_react9.createElement)(EventLine, { prefix: t("Stopped"), bots: [target], onOpen: (bot) => bot.id && actions.openExchange(self?.id ?? sessionId, bot.id), whole: true });
    }
    case "create_bot": {
      const created = findBot(arg("name"));
      if (!done || created === void 0) return null;
      return (0, import_react9.createElement)(EventLine, { prefix: t("Created"), bots: [created], onOpen: (bot) => actions.openSession(bot.id) });
    }
    case "update_bot": {
      const target = findBot(arg("name")) ?? findBot(arg("bot")) ?? (arg("bot") ? void 0 : self);
      return done && target ? (0, import_react9.createElement)(EventLine, { prefix: t("Updated"), bots: [target], onOpen: (bot) => actions.openSession(bot.id) }) : null;
    }
    case "group_relay":
      return (0, import_react9.createElement)(GroupReplies, { sessionId, callId: call2.callId, done, content: call2.content, roster, actions, useUi, useWork });
    case "create_group":
    case "update_group":
    case "delete_group":
    case "post_to_group": {
      const verbs = {
        create_group: ["Created group", "Couldn't create the group"],
        update_group: ["Updated group", "Couldn't update the group"],
        delete_group: ["Deleted group", "Couldn't delete the group"],
        post_to_group: ["Posted in", "Couldn't post in the group"]
      }[tool];
      if (!done) return null;
      const result = contentText(call2.content);
      const named = /^(Created group|Updated|Nothing changed in|Deleted|Posted in) "([^"]+)"/.exec(result);
      if (call2.isError || !named) return (0, import_react9.createElement)("div", { className: "bt-event", title: result }, t(verbs[1]));
      const name = named[2];
      const room2 = roster.rooms.find((entry) => entry.name === name);
      return (0, import_react9.createElement)(GroupEvent, { prefix: t(verbs[0]), room: tool === "delete_group" ? void 0 : room2, name, roster, actions });
    }
    case "ask_user": {
      const question = roster.questions?.[sessionId];
      if (!question || question.callId !== call2.callId) return (0, import_react9.createElement)("span", { className: "bt-q-gone", hidden: true });
      if (heldCards?.[heldCardKey("question", question.id)] > 0) return null;
      return (0, import_react9.createElement)(PendingQuestion, { key: JSON.stringify([sessionId, question.id]), sessionId, question, actions, inline: true });
    }
    case "show_view":
      return (0, import_react9.createElement)(WidgetCell, { sessionId, callId: call2.callId, args: { text: arg, value: argValue }, done, isError: call2.isError, roster, actions, heldCards });
    case "request_secret":
      return (0, import_react9.createElement)(SecretToolCell, { sessionId, callId: call2.callId, name: arg("name"), done, content: call2.content, roster, actions, heldCards });
    case "ask_user_question": {
      if (!done) return null;
      let parsed = null;
      try {
        parsed = JSON.parse(contentText(call2.content));
      } catch {
        parsed = null;
      }
      const answer = parsed?.answers?.[0];
      const question = argValue("questions")?.[0];
      if (!answer) return null;
      return (0, import_react9.createElement)("div", { className: "bt-q-inline" }, (0, import_react9.createElement)(SettledQuestion, { question, answer }));
    }
    case "read_group_chat": {
      if (!done) return null;
      const room2 = roster.rooms.find((entry) => entry.name === arg("group"));
      return room2 ? (0, import_react9.createElement)(GroupEvent, { prefix: t("Read"), room: room2, roster, actions }) : null;
    }
    case "remember":
    case "forget":
      return done && !call2.isError ? (0, import_react9.createElement)(MemoryEvent, { sessionId, scope: arg("scope"), result: contentText(call2.content), roster, actions, findBot }) : null;
    default:
      return null;
  }
}
function ToolCell({ node, sessionId, useRoster, useUi, useWork, useHeldCards, actions }) {
  const roster = useRoster((value) => value);
  const heldCards = useHeldCards?.((state) => state[sessionId]);
  const root = node.data.root;
  const turn = node.location?.turn?.turn ?? root.turn;
  const hidden = isHiddenTurn(roster, sessionId, turn);
  const findBot = (nameOrId) => roster.byId[nameOrId] ?? roster.bots.find((bot) => bot.name.toLowerCase() === String(nameOrId ?? "").toLowerCase());
  const calls = hidden ? [] : callTree(root);
  const drawn = calls.filter((call2) => DRAWN.has(toolName(call2)));
  const running = root.kind === "tool-result" ? void 0 : calls.findLast((call2) => call2.kind !== "tool-result");
  const note = running ? toolActivity(toolName(running), toolArgs(running).text, findBot, roster.byId[sessionId]) : null;
  useLiveNote(actions, sessionId, `tool:${root.callId ?? node.key}`, note);
  useShownCards(actions, sessionId, drawn.filter((call2) => CARDS.has(toolName(call2)) && call2.callId).map((call2) => call2.callId));
  if (drawn.length === 0) return null;
  const env = { sessionId, roster, actions, useUi, useWork, findBot, heldCards };
  return (0, import_react9.createElement)(import_react9.Fragment, null, drawn.map((call2, index) => (0, import_react9.createElement)(import_react9.Fragment, { key: call2.callId ?? index }, renderCall(call2, env))));
}

// src/client/activity-row.js
var import_react10 = require("react");
var import_react_dom2 = require("react-dom");
var PHRASE_HOLD_MS = 800;
var drawPhrase = (pool) => t(pool[Math.min(pool.length - 1, Math.floor(Math.random() * pool.length))]);
function useRunningHost(active) {
  const [host, setHost] = (0, import_react10.useState)(null);
  (0, import_react10.useEffect)(() => {
    if (!active) {
      setHost(null);
      return void 0;
    }
    let frame = 0;
    const find = () => {
      frame = 0;
      const node = document.querySelector("[data-chat-flow] > [data-chat-running]");
      setHost((prev) => prev === node ? prev : node);
    };
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(find);
    });
    observer.observe(document.querySelector("[data-conversation-scroll]") ?? document.body, { childList: true, subtree: true });
    find();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [active]);
  return host;
}
function useRowEntrances(replacing) {
  const check = (0, import_react10.useRef)(replacing);
  check.current = replacing;
  (0, import_react10.useEffect)(() => {
    const seen = /* @__PURE__ */ new WeakSet();
    const started = Date.now();
    let column = null;
    let frame = 0;
    const settle = (event) => {
      if (event.target !== event.currentTarget || !/^bt-row/.test(event.animationName)) return;
      delete event.currentTarget.dataset.btEnter;
      event.currentTarget.removeEventListener("animationend", settle);
    };
    const scan = () => {
      frame = 0;
      const next = document.querySelector("[data-chat-flow]");
      if (next !== column) {
        observer.disconnect();
        column = next;
        if (column) observer.observe(column, { childList: true, subtree: true });
      }
      if (!column) return;
      const items = [...column.querySelectorAll(":scope > [data-chat-flow-key]")];
      let last = -1;
      items.forEach((item, index) => {
        if (seen.has(item)) last = index;
      });
      const fresh = items.filter((item) => !seen.has(item) && item.offsetHeight > 0);
      for (const item of fresh) seen.add(item);
      if (last < 0 || Date.now() - started < 800 || fresh.length > 3) return;
      for (const item of fresh) {
        if (items.indexOf(item) < last) continue;
        const reply = [void 0, "assistant-step", "tool-call"].includes(item.dataset.chatFlowKind);
        item.dataset.btEnter = reply && check.current() ? "after-collapse" : "new";
        item.addEventListener("animationend", settle);
      }
    };
    const observer = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(scan);
    });
    scan();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);
}
function ActivityIndicator({ sessionId, useRoster, useSessionStatus, useLive, useSession, useWork, actions }) {
  const roster = useRoster((value) => value);
  const running = useSessionStatus((map) => map.get(sessionId)?.running === true);
  const turnAt = useWork?.((work) => work.turns?.[sessionId]);
  const runAt = (0, import_react10.useRef)(0);
  if (!running) runAt.current = 0;
  else if (runAt.current === 0) runAt.current = Date.now();
  const liveKey = useLive((state) => JSON.stringify(state[sessionId] ?? {}));
  const pendingInput = useSession((snapshot) => Math.max(0, ...(snapshot?.pendingSubmissions ?? []).filter((sub) => sub.placement !== "queued").map((sub) => sub.time)));
  const bot = roster.byId[sessionId];
  const room2 = roster.roomsById[sessionId];
  const entries2 = (0, import_react10.useMemo)(() => Object.values(JSON.parse(liveKey)), [liveKey]);
  const streaming = entries2.some((entry) => entry.text);
  const tools = entries2.filter((entry) => !entry.text).sort((a, b) => a.at - b.at);
  const relaying = tools.some((entry) => entry.relay);
  const visible = running && !streaming && !relaying && (bot !== void 0 || room2 !== void 0);
  const tool = tools.at(-1);
  const inputRef = (0, import_react10.useRef)(0);
  const inputAt = Math.max(inputRef.current, pendingInput);
  inputRef.current = inputAt;
  const want = !visible ? null : inputAt > (tool?.at ?? 0) ? { key: `input:${inputAt}`, pool: PHRASES.thinking, state: "thinking" } : tool ? { key: tool.label ? `tool:${tool.label}` : "working", label: tool.label, pool: PHRASES.working, state: tool.state ?? "working" } : { key: "thinking", pool: PHRASES.thinking, state: "thinking" };
  const [shown, setShown] = (0, import_react10.useState)(null);
  const wantKey = want?.key ?? null;
  const markState = (0, import_react10.useRef)("thinking");
  if (want) markState.current = want.state;
  (0, import_react10.useEffect)(() => {
    if (wantKey === null || shown?.key === wantKey) return void 0;
    const make = () => setShown({ key: wantKey, text: want.label ?? drawPhrase(want.pool), at: Date.now() });
    const wait = shown ? shown.at + PHRASE_HOLD_MS - Date.now() : 0;
    if (wait <= 0) {
      make();
      return void 0;
    }
    const timer = setTimeout(make, wait);
    return () => clearTimeout(timer);
  }, [wantKey, shown]);
  const [phase, setPhase] = (0, import_react10.useState)(null);
  const endedAt = (0, import_react10.useRef)(0);
  const shift = (0, import_react10.useRef)(null);
  const leaving = (0, import_react10.useRef)(false);
  leaving.current = phase !== null && !visible;
  (0, import_react10.useEffect)(() => {
    if (visible) {
      setPhase("in");
      return void 0;
    }
    setPhase((current) => current === "in" ? "out" : current);
    const timer = setTimeout(() => {
      shift.current = document.querySelector("[data-conversation-scroll]")?.scrollTop ?? null;
      setPhase((current) => current === "out" ? null : current);
    }, 140);
    return () => clearTimeout(timer);
  }, [visible]);
  (0, import_react10.useLayoutEffect)(() => {
    if (phase !== null) return;
    endedAt.current = Date.now();
    setShown(null);
    const before = shift.current;
    shift.current = null;
    const scroller = document.querySelector("[data-conversation-scroll]");
    if (before === null || !scroller || reducedMotion()) return;
    const delta = before - scroller.scrollTop;
    if (delta > 0) scroller.querySelector("[data-chat-flow]")?.animate([{ transform: `translateY(${-delta}px)` }, { transform: "none" }], { duration: 140, easing: "cubic-bezier(.23,1,.32,1)" });
  }, [phase]);
  (0, import_react10.useEffect)(() => {
    if (!running) actions.clearLive(sessionId);
  }, [running, sessionId]);
  useRowEntrances(() => leaving.current || Date.now() - endedAt.current < 300);
  const host = useRunningHost(running);
  if (!host || phase === null || !shown) return null;
  return (0, import_react_dom2.createPortal)((0, import_react10.createElement)(
    "div",
    { className: "bt-typing", "data-exiting": phase === "out" ? "" : void 0, "aria-hidden": true },
    bot ? (0, import_react10.createElement)(BotMark, { bot, size: 28, state: markState.current, live: true, pokeable: true }) : room2 ? (0, import_react10.createElement)(RoomAvatar, { room: room2, roster, size: 28 }) : null,
    (0, import_react10.createElement)(
      "span",
      { className: "bt-typing-text" },
      (0, import_react10.createElement)("span", { key: `${shown.key}:${shown.at}`, className: "bt-typing-label" }, (0, import_react10.createElement)(Shimmer, null, `${shown.text}…`)),
      (0, import_react10.createElement)(Elapsed, { at: Math.max(turnAt ?? runAt.current, inputAt), className: "bt-typing-time" })
    )
  ), host);
}

// src/client/sidebar.js
var import_react11 = require("react");
var import_react_dom3 = require("react-dom");
var ROW_MARK = 40;
var RAIL_MARK = 36;
function useMarkedUnread(id, active, marked, actions) {
  (0, import_react11.useEffect)(() => {
    if (active && marked) actions.clearUnread(id);
  }, [active, marked]);
}
var PinMark = () => (0, import_react11.createElement)("span", { className: "bt-pin", "aria-hidden": true }, (0, import_react11.createElement)(PinMarkIcon));
var useApproval = (useWork, match) => useWork ? useWork((work) => (work.approvals ?? []).some(match)) : false;
var useGroupWork = (useWork, pick) => useWork ? useWork((work) => JSON.stringify(pick(work.rooms ?? {}))) : "[]";
var workKeys = (text) => JSON.parse(text);
var doingOf = ({ tool, said, note, target, switching }) => ({ tool, said, note, target, switching });
var workLine = (lead, doing, more) => (0, import_react11.createElement)(Shimmer, null, `${lead} · ${workPhrase(doing)}…${more > 0 ? ` +${more}` : ""}`);
var waitingFor = (roster, waits) => {
  const names = [...(waits?.bots ?? []).map((id) => roster.byId[id]?.name), ...(waits?.rooms ?? []).map((id) => roster.roomsById[id]?.name)].filter(Boolean);
  return names.length === 0 ? "" : t("Waiting for {names}", { names: names.join(t(" and ")) });
};
function BotRow({ bot, roster, actions, useSessions, useSessionStatus, useSessionRetainInfo, useActivity, useWork, wide, marked }) {
  const id = bot.id;
  const part = currentPart(bot);
  const preview = useSessions((list) => previewOf(list, part, roster.exchangeTurns[part]));
  const running = useSessionStatus((map) => map.get(part)?.running === true);
  const active = useSessionRetainInfo(part, (info) => (info?.retainedBy?.mainView ?? 0) > 0);
  const unread = useSessionStatus((map) => map.get(part)?.completionUnread === true || map.get(part)?.pendingInteraction !== void 0) || marked && !active;
  useMarkedUnread(id, active, marked, actions);
  const main = isMainOf(roster, id);
  const tile = roster.mainBotId === id;
  const approval = useApproval(useWork, (entry) => entry.botId === id);
  const alert = roster.questions?.[part] !== void 0 || approval;
  const doing = useActivity((map) => map[id]);
  const groups = workKeys(useGroupWork(useWork, (rooms) => Object.entries(rooms).flatMap(([roomId, entries2]) => entries2.filter((entry) => entry.botId === id).map((entry) => ({ id: roomId, ...doingOf(entry) })))));
  const away = !running && groups.length > 0;
  const state = botState(running || away, doing, alert);
  const awayLine = away ? workLine(roster.roomsById[groups[0].id]?.name ?? t("a group chat"), groups[0], groups.length - 1) : null;
  const waits = workKeys(useWork ? useWork((work) => JSON.stringify(work.waiting?.[id] ?? null)) : "null");
  const waitsFor = state === "waiting" ? waitingFor(roster, waits) : "";
  if (bot.hidden && !active && !main) return null;
  const onContextMenu = (event) => {
    event.preventDefault();
    actions.openMenu({ kind: "bot", id, x: event.clientX, y: event.clientY });
  };
  const pinned = bot.pinned === true && !tile;
  const label = [bot.name, main ? t("Main Bot") : "", pinned ? t("Pinned") : "", running || away ? t("Working") : "", waitsFor, approval ? t("Waiting for your approval") : alert ? t("Waiting for your answer") : "", unread ? t("Unread activity") : ""].filter(Boolean).join(", ");
  if (tile && wide) {
    return (0, import_react11.createElement)("div", { className: "bt-tile-wrap" }, (0, import_react11.createElement)(
      "button",
      {
        type: "button",
        className: "bt-tile",
        "aria-label": label,
        "aria-current": active ? "page" : void 0,
        "data-bot-id": id,
        title: preview || bot.name,
        onClick: () => actions.openSession(id),
        onContextMenu
      },
      (0, import_react11.createElement)(BotAvatar, { bot, size: 60, state, main: true }),
      (0, import_react11.createElement)("span", { className: "bt-tile-name" }, bot.name),
      bot.role ? (0, import_react11.createElement)("span", { className: "bt-chip" }, bot.role) : null
    ));
  }
  return (0, import_react11.createElement)(
    "button",
    {
      type: "button",
      className: "bt-row",
      "aria-label": label,
      "aria-current": active ? "page" : void 0,
      "data-bot-id": id,
      title: wide ? void 0 : bot.name,
      onClick: () => actions.openSession(id),
      onContextMenu
    },
    (0, import_react11.createElement)(BotAvatar, { bot, size: wide ? ROW_MARK : RAIL_MARK, state, main }),
    pinned && !wide ? (0, import_react11.createElement)(PinMark) : null,
    wide ? (0, import_react11.createElement)(
      "span",
      { className: "bt-row-body" },
      (0, import_react11.createElement)("span", { className: "bt-row-name" }, (0, import_react11.createElement)("span", { className: "bt-row-title" }, bot.name), pinned ? (0, import_react11.createElement)(PinMark) : null),
      awayLine ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, awayLine) : waitsFor ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, waitsFor) : preview ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, preview) : null
    ) : null,
    wide && unread && !active ? (0, import_react11.createElement)("span", { className: "bt-unread", "aria-hidden": true }) : null
  );
}
function RoomRow({ room: room2, roster, actions, useSessions, useSessionStatus, useSessionRetainInfo, useWork, wide, marked }) {
  const id = room2.id;
  const fallback = useSessions((list) => previewOf(list, id));
  const preview = room2.preview?.replace(/\s+/g, " ").trim() || fallback;
  const active = useSessionRetainInfo(id, (info) => (info?.retainedBy?.mainView ?? 0) > 0);
  const unread = useSessionStatus((map) => map.get(id)?.completionUnread === true) || marked && !active;
  useMarkedUnread(id, active, marked, actions);
  const approval = useApproval(useWork, (entry) => entry.roomId === id);
  const members = workKeys(useGroupWork(useWork, (rooms) => (rooms[id] ?? []).map((entry) => ({ id: entry.botId, ...doingOf(entry) }))));
  const first = roster.byId[members[0]?.id];
  const workingLine = first ? workLine(first.name, members[0], members.length - 1) : null;
  if (room2.hidden && !active) return null;
  const pinned = room2.pinned === true;
  const label = [room2.name, pinned ? t("Pinned") : "", members.length > 0 ? t("Working") : "", approval ? t("Waiting for your approval") : ""].filter(Boolean).join(", ");
  return (0, import_react11.createElement)(
    "button",
    {
      type: "button",
      className: "bt-row",
      "aria-label": label,
      "aria-current": active ? "page" : void 0,
      "data-room-id": id,
      onClick: () => actions.openSession(id),
      onContextMenu: (event) => {
        event.preventDefault();
        actions.openMenu({ kind: "room", id, x: event.clientX, y: event.clientY });
      }
    },
    (0, import_react11.createElement)(RoomAvatar, { room: room2, roster, size: wide ? ROW_MARK : RAIL_MARK }),
    pinned && !wide ? (0, import_react11.createElement)(PinMark) : null,
    wide ? (0, import_react11.createElement)(
      "span",
      { className: "bt-row-body" },
      (0, import_react11.createElement)("span", { className: "bt-row-name" }, (0, import_react11.createElement)("span", { className: "bt-row-title" }, room2.name), pinned ? (0, import_react11.createElement)(PinMark) : null),
      workingLine ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, workingLine) : preview ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, preview) : null
    ) : null,
    wide && approval && !active ? (0, import_react11.createElement)("span", { className: "bt-unread bt-unread-wait", "aria-hidden": true }) : wide && unread && !active ? (0, import_react11.createElement)("span", { className: "bt-unread", "aria-hidden": true }) : null
  );
}
function AgentSessionRow({ session, agent, actions, renaming, index }) {
  const input = (0, import_react11.useRef)(null);
  (0, import_react11.useLayoutEffect)(() => {
    if (!renaming) return;
    input.current?.focus();
    input.current?.select();
  }, [renaming]);
  if (renaming) {
    const commit = (keep) => {
      const value = input.current?.value ?? "";
      if (!keep || value.trim() === "" || value.trim() === session.title) {
        actions.endAgentRename();
        return;
      }
      void (async () => {
        try {
          await actions.renameAgentSession(agent.id, session.id, value);
          actions.endAgentRename();
        } catch (error) {
          actions.reportError(error, "agent-rename");
        }
      })();
    };
    return (0, import_react11.createElement)(
      "div",
      { className: "bt-agent-sub-row bt-agent-edit", style: { "--i": index } },
      (0, import_react11.createElement)("input", {
        ref: input,
        defaultValue: session.title,
        "aria-label": t("Rename"),
        onKeyDown: (event) => {
          if (event.nativeEvent.isComposing) return;
          if (event.key === "Enter") commit(true);
          else if (event.key === "Escape") commit(false);
        },
        onBlur: () => commit(true)
      })
    );
  }
  return (0, import_react11.createElement)(
    "button",
    {
      type: "button",
      className: "bt-agent-sub-row",
      "aria-current": session.active ? "page" : void 0,
      style: { "--i": index },
      onClick: () => actions.openAgentSession(session.id),
      onContextMenu: (event) => {
        event.preventDefault();
        event.stopPropagation();
        actions.openMenu({ kind: "agent-session", id: session.id, agentId: agent.id, x: event.clientX, y: event.clientY });
      }
    },
    (0, import_react11.createElement)("span", { className: "bt-agent-sub-title" }, session.title),
    (0, import_react11.createElement)("span", { className: "bt-agent-sub-time" }, session.at > 0 ? relativeShort(session.at) : "")
  );
}
function AgentRow({ agent, actions, useSessions, useSessionStatus, useUi, wide, marked }) {
  const info = useSessions((list) => JSON.stringify(agent.sessions.map((id) => {
    const row = list.byId[id];
    return {
      id,
      // A blank Session's title is the workspace folder name; show the label instead.
      title: row?.blank === true ? "" : row?.displayTitle ?? row?.title ?? "",
      at: row?.updatedAt ?? 0,
      running: row?.running === true,
      active: (row?.retainedBy?.mainView ?? 0) > 0
    };
  }).sort((a, b) => b.at - a.at)));
  const statusInfo = useSessionStatus((map) => JSON.stringify(agent.sessions.map((id) => ({
    id,
    running: map.get(id)?.running === true,
    unread: map.get(id)?.completionUnread === true
  }))));
  const statuses = Object.fromEntries(JSON.parse(statusInfo).map((entry) => [entry.id, entry]));
  const sessions = JSON.parse(info).map((session) => ({
    ...session,
    running: statuses[session.id]?.running ?? session.running,
    unread: statuses[session.id]?.unread ?? false,
    title: session.title === "" ? t("New session") : session.title
  }));
  const renaming = useUi((value) => value.renameAgent);
  const active = sessions.some((session) => session.active);
  const running = sessions.some((session) => session.running);
  const unread = sessions.some((session) => session.unread) || marked && !active;
  useMarkedUnread(agent.id, active, marked, actions);
  const preview = sessions[0]?.title ?? t("New session");
  const label = ["Engine Agent", running ? t("Working") : "", unread ? t("Unread activity") : ""].filter(Boolean).join(", ");
  const open = active && wide;
  return (0, import_react11.createElement)(
    "div",
    { className: "bt-agent" },
    (0, import_react11.createElement)(
      "button",
      {
        type: "button",
        className: "bt-row",
        "aria-label": label,
        "aria-current": active ? "page" : void 0,
        "data-agent-id": agent.id,
        title: wide ? void 0 : "Engine Agent",
        onClick: () => actions.openAgent(agent.id),
        onContextMenu: (event) => {
          event.preventDefault();
          actions.openMenu({ kind: "agent", id: agent.id, x: event.clientX, y: event.clientY });
        }
      },
      (0, import_react11.createElement)("span", { className: `bt-agent-ava${running ? " bt-run" : ""}` }, (0, import_react11.createElement)(AgentIcon, { size: 20 })),
      wide ? (0, import_react11.createElement)(
        "span",
        { className: "bt-row-body" },
        (0, import_react11.createElement)("span", { className: "bt-row-name" }, "Engine Agent"),
        preview ? (0, import_react11.createElement)("span", { className: "bt-row-preview" }, preview) : null
      ) : null,
      wide && unread && !active ? (0, import_react11.createElement)("span", { className: "bt-unread", "aria-hidden": true }) : null
    ),
    (0, import_react11.createElement)(
      "div",
      { className: "bt-agent-sub", "data-open": open || void 0 },
      (0, import_react11.createElement)(
        "div",
        { className: "bt-agent-sub-in" },
        (0, import_react11.createElement)(
          "button",
          { type: "button", className: "bt-agent-sub-row bt-agent-new", style: { "--i": 0 }, onClick: () => {
            void actions.newAgentSession(agent.id).catch((error) => actions.reportError(error, "agent-session"));
          } },
          (0, import_react11.createElement)(PlusIcon),
          (0, import_react11.createElement)("span", { className: "bt-agent-sub-title" }, t("New session"))
        ),
        sessions.map((session, index) => (0, import_react11.createElement)(AgentSessionRow, {
          key: session.id,
          session,
          agent,
          actions,
          index: index + 1,
          renaming: renaming === session.id
        }))
      )
    )
  );
}
var GLIDE = springEasing(1e3, 63);
function useListGlide(listRef, layout, key) {
  const tops = (0, import_react11.useRef)({ layout, map: /* @__PURE__ */ new Map() });
  (0, import_react11.useLayoutEffect)(() => {
    const list = listRef.current;
    if (!list) return;
    const next = /* @__PURE__ */ new Map();
    const still = reducedMotion() || tops.current.layout !== layout;
    for (const row of list.querySelectorAll("[data-bot-id],[data-room-id],[data-agent-id]")) {
      const id = row.dataset.botId ?? row.dataset.roomId ?? row.dataset.agentId;
      const top = row.offsetTop;
      next.set(id, top);
      const before = tops.current.map.get(id);
      if (!still && before !== void 0 && Math.abs(before - top) > 0.5) {
        row.animate([{ transform: `translateY(${before - top}px)` }, { transform: "none" }], GLIDE);
      }
    }
    tops.current = { layout, map: next };
  }, [layout, key]);
}
function TeamSidebar(props) {
  const { wide, expandSidebar, useRoster, useUi, useSessions, actions } = props;
  const listRef = (0, import_react11.useRef)(null);
  const closing = (0, import_react11.useRef)(false);
  (0, import_react11.useLayoutEffect)(() => {
    closing.current = false;
  });
  const roster = useRoster((value) => value);
  const markedUnread = useUi((value) => value.unread);
  props.useRegistry((value) => value);
  const updated = useSessions((list) => {
    const stamps = {};
    for (const id of list.ids) stamps[id] = list.byId[id]?.updatedAt ?? 0;
    return JSON.stringify(stamps);
  });
  const order = (0, import_react11.useMemo)(() => {
    const stamps = JSON.parse(updated);
    const entries2 = [
      ...roster.bots.filter((bot) => bot.id !== roster.mainBotId).map((bot) => ({ kind: "bot", item: bot, at: stamps[currentPart(bot)] ?? bot.createdAt })),
      ...roster.rooms.map((room2) => ({ kind: "room", item: room2, at: stamps[room2.id] ?? room2.createdAt })),
      // The Agent sorts by its most recent Session, falling back to when it was added.
      ...(roster.agents ?? []).map((agent) => ({ kind: "agent", item: agent, at: Math.max(0, ...agent.sessions.map((id) => stamps[id] ?? 0)) || agent.createdAt }))
    ];
    return entries2.sort((a, b) => Number(Boolean(b.item.pinned)) - Number(Boolean(a.item.pinned)) || b.at - a.at);
  }, [roster, updated]);
  const main = roster.byId[roster.mainBotId];
  useListGlide(listRef, wide, order.map((entry) => entry.item.id).join(","));
  useLandOnMainBot(roster, useSessions, actions);
  const navigate = (open, id) => {
    const result = open(id);
    if (wide && window.innerWidth < 1024 && !closing.current) {
      closing.current = true;
      expandSidebar?.();
      actions.toggleSidebar();
    }
    return result;
  };
  const rowActions = {
    ...actions,
    openSession: (id) => navigate(actions.openSession, id),
    openAgent: (id) => navigate(actions.openAgent, id),
    openAgentSession: (id) => navigate(actions.openAgentSession, id),
    newAgentSession: (id) => navigate(actions.newAgentSession, id)
  };
  const rowProps = { roster, actions: rowActions, useSessions, useUi, useSessionStatus: props.useSessionStatus, useSessionRetainInfo: props.useSessionRetainInfo, useActivity: props.useActivity, useWork: props.useWork, wide };
  const typeToSearch = (event) => {
    if (event.defaultPrevented || event.key.length !== 1 || event.key === " " || event.metaKey || event.ctrlKey || event.altKey || event.nativeEvent.isComposing) return;
    if (event.target instanceof Element && event.target.closest("input,textarea,[contenteditable]")) return;
    event.preventDefault();
    actions.openPalette(event.key);
  };
  return (0, import_react11.createElement)(
    "div",
    { className: wide ? "bt-side" : "bt-side bt-rail", onKeyDown: typeToSearch },
    wide ? (0, import_react11.createElement)(
      "div",
      { className: "bt-side-top" },
      (0, import_react11.createElement)("span", { className: "bt-brand" }, (0, import_react11.createElement)(BrandMark, { size: 22 }), (0, import_react11.createElement)(BrandName)),
      (0, import_react11.createElement)(UpdateButton, { useUpdate: props.useUpdate, actions }),
      (0, import_react11.createElement)("button", { type: "button", className: "bt-round", "aria-label": t("Search"), title: t("Search"), onClick: () => actions.openPalette() }, (0, import_react11.createElement)(SearchIcon)),
      (0, import_react11.createElement)("button", { type: "button", className: "bt-round", "aria-label": t("New…"), title: t("New…"), onClick: () => actions.openNewChat("new") }, (0, import_react11.createElement)(PlusIcon)),
      (0, import_react11.createElement)("button", { type: "button", className: "bt-round bt-side-collapse", "aria-label": t("Collapse sidebar"), title: t("Collapse sidebar"), onClick: () => actions.toggleSidebar() }, (0, import_react11.createElement)(SidebarIcon))
    ) : (0, import_react11.createElement)(
      import_react11.Fragment,
      null,
      (0, import_react11.createElement)(UpdateButton, { useUpdate: props.useUpdate, actions }),
      (0, import_react11.createElement)("button", { type: "button", className: "bt-round", "aria-label": t("New…"), title: t("New…"), onClick: () => actions.openNewChat("new") }, (0, import_react11.createElement)(PlusIcon))
    ),
    wide && roster.readOnly ? (0, import_react11.createElement)("div", { className: "bt-hint bt-read-only", role: "status" }, hostText(roster.readOnly)) : null,
    (0, import_react11.createElement)(
      "div",
      { ref: listRef, className: "bt-list", role: "region", "aria-label": t("Bot list") },
      main ? (0, import_react11.createElement)(BotRow, { ...rowProps, bot: main, marked: markedUnread[main.id] === true }) : roster.ready ? null : (0, import_react11.createElement)("div", { className: "bt-hint" }, t("Setting up your Main Bot…")),
      order.map((entry) => entry.kind === "bot" ? (0, import_react11.createElement)(BotRow, { key: entry.item.id, ...rowProps, bot: entry.item, marked: markedUnread[entry.item.id] === true }) : entry.kind === "room" ? (0, import_react11.createElement)(RoomRow, { key: entry.item.id, ...rowProps, room: entry.item, marked: markedUnread[entry.item.id] === true }) : (0, import_react11.createElement)(AgentRow, { key: entry.item.id, ...rowProps, agent: entry.item, marked: markedUnread[entry.item.id] === true }))
    )
  );
}
function UpdateButton({ useUpdate, actions }) {
  const update = useUpdate((value) => value);
  const [open, setOpen] = (0, import_react11.useState)(false);
  const [box2, setBox] = (0, import_react11.useState)(null);
  const [error, setError] = (0, import_react11.useState)("");
  const button = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!open) return void 0;
    const onDown = (event) => {
      if (event.target instanceof Element && (event.target.closest(".bt-update-pop") || button.current?.contains(event.target))) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  const phase = update?.phase ?? "idle";
  if (!update?.available && phase === "idle") return null;
  const toggle = () => {
    const rect = button.current?.getBoundingClientRect();
    if (rect) setBox({ left: Math.max(8, Math.min(rect.left, window.innerWidth - 288)), top: rect.bottom + 6 });
    setOpen((value) => !value);
  };
  const start = () => {
    setError("");
    void actions.installUpdate().catch((failure) => setError(hostText(failure?.message ?? String(failure))));
  };
  const label = phase === "installing" ? t("Updating ApmixBot…") : phase === "installed" ? t("ApmixBot {version} is installed. Restart ApmixBot to use it.", { version: update.installed ?? update.latest }) : t("ApmixBot {version} is available", { version: update.latest });
  const message = error || (phase === "failed" ? update.error : "");
  return (0, import_react11.createElement)(
    import_react11.Fragment,
    null,
    (0, import_react11.createElement)("button", {
      ref: button,
      type: "button",
      className: "bt-round bt-update",
      "data-phase": phase,
      "aria-label": label,
      title: label,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      onClick: toggle
    }, (0, import_react11.createElement)(CloudDownloadIcon, { done: phase === "installed" }), phase === "failed" ? (0, import_react11.createElement)("span", { className: "bt-update-dot", "aria-hidden": true }) : null),
    open && box2 ? (0, import_react_dom3.createPortal)((0, import_react11.createElement)(
      "div",
      { className: "bt-update-pop", role: "dialog", "aria-label": t("ApmixBot update"), style: box2 },
      (0, import_react11.createElement)("div", { className: "bt-update-title" }, phase === "installed" ? t("Update installed") : t("ApmixBot {version}", { version: update.latest })),
      (0, import_react11.createElement)("div", { className: "bt-update-text" }, phase === "installed" ? t("Restart ApmixBot to start using version {version}.", { version: update.installed ?? update.latest }) : t("You have {version}.", { version: update.current })),
      message ? (0, import_react11.createElement)("div", { className: "bt-update-error", role: "alert" }, t("The update did not finish: {reason}", { reason: message })) : null,
      (0, import_react11.createElement)(
        "div",
        { className: "bt-update-actions" },
        update.notesUrl ? (0, import_react11.createElement)("a", { className: "bt-update-notes", href: update.notesUrl, target: "_blank", rel: "noopener noreferrer" }, t("What's new")) : null,
        phase === "installed" ? null : (0, import_react11.createElement)("button", {
          type: "button",
          className: "bt-update-go",
          disabled: phase === "installing",
          onClick: start
        }, phase === "installing" ? t("Updating…") : phase === "failed" ? t("Try again") : t("Update"))
      )
    ), document.body) : null
  );
}
function ConnectPlugins({ wide, actions }) {
  if (!wide) return null;
  return (0, import_react11.createElement)(
    "span",
    { className: "bt-connect-wrap" },
    (0, import_react11.createElement)(
      "button",
      {
        type: "button",
        className: "bt-connect bt-connect-foot",
        onClick: () => actions.openConnectors()
      },
      (0, import_react11.createElement)(PlugIcon),
      t("Connect apps")
    )
  );
}
function YouAvatar() {
  return (0, import_react11.createElement)(
    "span",
    { className: "bt-you-wrap" },
    (0, import_react11.createElement)("span", { className: "bt-you", "aria-hidden": true }, (0, import_react11.createElement)(BotMark, { look: MAIN_LOOK, size: 24 })),
    (0, import_react11.createElement)("span", { style: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" } }, t("Settings"))
  );
}
var openShellSettings = null;
var shellShortcuts = null;
function holdShellShortcuts(shortcuts) {
  shellShortcuts = shortcuts;
  return () => {
    if (shellShortcuts === shortcuts) shellShortcuts = null;
  };
}
function openEngineSettings() {
  requestAnimationFrame(() => {
    if (openShellSettings) {
      openShellSettings();
      return;
    }
    const desktop = document.querySelector('button[aria-haspopup="menu"][data-signed-out]');
    if (desktop) openThroughMenu(desktop);
    else pressSettingsShortcut();
  });
}
function openThroughMenu(trigger) {
  const before = new Set(document.querySelectorAll('[role="menu"]'));
  trigger.click();
  let frames = 0;
  const look = () => {
    const menu = [...document.querySelectorAll('[role="menu"]')].find((node) => !before.has(node));
    const item = menu?.querySelector('button[role="menuitem"]');
    if (item) item.click();
    else if (++frames < 30) requestAnimationFrame(look);
    else pressSettingsShortcut();
  };
  requestAnimationFrame(look);
}
function pressSettingsShortcut() {
  const binding = shellShortcuts?.catalog.getSnapshot().find((row) => row.id === "settings.open")?.binding;
  if (!binding) return;
  const held = new Set(binding.modifiers);
  window.dispatchEvent(new KeyboardEvent("keydown", {
    code: binding.code,
    key: binding.code === "Comma" ? "," : "",
    bubbles: true,
    cancelable: true,
    ctrlKey: held.has("control"),
    altKey: held.has("alt"),
    shiftKey: held.has("shift"),
    metaKey: held.has("meta")
  }));
}
function AccountLauncher({ seat = true, settingsOpen, openSettings, actions }) {
  const [open, setOpen] = (0, import_react11.useState)(false);
  (0, import_react11.useLayoutEffect)(() => {
    if (!seat) return void 0;
    actions.seatAccount(true);
    return () => actions.seatAccount(false);
  }, [seat]);
  const [box2, setBox] = (0, import_react11.useState)(null);
  const button = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (settingsOpen) setOpen(false);
  }, [settingsOpen]);
  (0, import_react11.useEffect)(() => {
    if (!openSettings) return void 0;
    openShellSettings = openSettings;
    return () => {
      if (openShellSettings === openSettings) openShellSettings = null;
    };
  }, [openSettings]);
  (0, import_react11.useEffect)(() => {
    if (!open) return void 0;
    const onDown = (event) => {
      if (event.target instanceof Element && (event.target.closest(".bt-account-menu") || button.current?.contains(event.target))) return;
      setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  const toggle = () => {
    const rect = button.current?.getBoundingClientRect();
    if (rect) setBox({ left: rect.left, bottom: window.innerHeight - rect.top + 5 });
    setOpen((value) => !value);
  };
  const groups = [
    [
      [t("Usage"), GaugeIcon, () => actions.openSettings("usage")],
      [t("Apps"), ConnectorIcon, () => actions.openConnectors()],
      [t("Plugins"), PlugIcon, () => actions.selectPanel("plugins")],
      [t("Automation tasks"), ClockIcon, () => actions.selectPanel("schedules")],
      [t("Bot settings"), GearIcon, () => actions.openSettings("general")]
    ],
    [
      [t("Switch to classic Agent mode"), SwitchIcon, () => actions.setSurface("agent")]
    ]
  ];
  return (0, import_react11.createElement)(
    import_react11.Fragment,
    null,
    (0, import_react11.createElement)(
      "button",
      { ref: button, type: "button", className: "bt-account", "aria-label": t("Account"), "aria-haspopup": "menu", "aria-expanded": open, onClick: toggle },
      (0, import_react11.createElement)("span", { className: "bt-you", "aria-hidden": true }, (0, import_react11.createElement)(BotMark, { look: MAIN_LOOK, size: 24 }))
    ),
    open && box2 ? (0, import_react_dom3.createPortal)((0, import_react11.createElement)(
      "div",
      { className: "bt-menu bt-menu-up bt-account-menu", role: "menu", "aria-label": t("Account"), style: box2 },
      groups.map((group, index) => (0, import_react11.createElement)(
        import_react11.Fragment,
        { key: index },
        index > 0 ? (0, import_react11.createElement)("div", { className: "bt-menu-sep", role: "separator" }) : null,
        group.map(([label, Icon, run, hint]) => (0, import_react11.createElement)("button", {
          key: label,
          type: "button",
          role: "menuitem",
          onClick: () => {
            setOpen(false);
            void Promise.resolve(run()).catch((error) => actions.reportError(error, "menu"));
          }
        }, (0, import_react11.createElement)(Icon), (0, import_react11.createElement)("span", { className: "bt-menu-label" }, label), hint ? (0, import_react11.createElement)("span", { className: "bt-menu-hint" }, hint) : null))
      ))
    ), document.body) : null
  );
}
function useLandOnMainBot(roster, useSessions, actions) {
  const mainView = useSessions((list) => {
    const row = Object.values(list.byId).find((session) => (session?.retainedBy?.mainView ?? 0) > 0);
    return row ? `${row.id}|${row.blank ? 1 : 0}` : "";
  });
  const lastBot = (0, import_react11.useRef)(null);
  (0, import_react11.useEffect)(() => {
    if (!roster.ready || !roster.mainBotId) return void 0;
    const [id, blank3] = mainView.split("|");
    const bot = id === "" ? void 0 : roster.byId[id];
    if (bot !== void 0) {
      lastBot.current = { botId: bot.id, sessionId: id };
      if (currentPart(bot) !== id) actions.landOn(bot.id);
      return void 0;
    }
    if (id !== "" && (roster.roomsById[id] || (actions.isAgentSession?.(id) ?? roster.agentOf[id] !== void 0) || blank3 !== "1")) {
      lastBot.current = null;
      return void 0;
    }
    const last = lastBot.current;
    const timer = setTimeout(() => actions.landOn(roster.mainBotId, last), last ? 0 : 400);
    return () => clearTimeout(timer);
  }, [mainView, roster]);
}
function FooterAccount(props) {
  const seated = props.useUi((value) => value.accountSeated === true);
  if (seated) return null;
  return (0, import_react11.createElement)("span", { className: "bt-foot-account" }, (0, import_react11.createElement)(AccountLauncher, { ...props, seat: false }));
}
function BotReturn({ wide, useSurface, actions }) {
  const mode = useSurface((value) => value.mode);
  if (mode !== "agent") return null;
  return (0, import_react11.createElement)(
    "button",
    { type: "button", className: "bt-return", "aria-label": "ApmixBot", title: "ApmixBot", onClick: () => actions.setSurface("bot") },
    (0, import_react11.createElement)(BotMark, { look: MAIN_LOOK, size: 20 }),
    wide ? (0, import_react11.createElement)("span", { className: "bt-return-name" }, "ApmixBot") : null
  );
}
var RETURN_CSS = `
.bt-return{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:36px;padding:0 14px;border:0;border-radius:999px;background:none;color:inherit;font:inherit;font-size:14px;line-height:20px;cursor:pointer;transition:background-color .12s ease}
.bt-return:hover{background:rgba(127,127,127,.14)}
.bt-return:active{transform:scale(.96)}
.bt-return .bt-mark{display:inline-flex;flex:none;line-height:0}
.bt-return .bt-mark svg{width:100%;height:100%;overflow:visible}
/* Shell styles carry the robot inks and Agent mode withdraws them; pin Apex's here. */
.bt-return .bt-mark{--bt-ink-${MAIN_LOOK.color}:${INKS[MAIN_LOOK.color][0]};--bt-eye-${MAIN_LOOK.color}:${eyeOn(INKS[MAIN_LOOK.color][0])}}
.bt-return-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
`;
function BrandMark({ size = 24 }) {
  return (0, import_react11.createElement)("span", { className: "bt-brand-mark" }, (0, import_react11.createElement)(BotMark, { look: MAIN_LOOK, size, live: true }));
}
function BrandName() {
  return (0, import_react11.createElement)("span", { className: "bt-brand-name" }, "Apmix", (0, import_react11.createElement)("b", null, "Bot"));
}
var SIDEBAR_CSS = `
.bt-side-top .bt-brand{cursor:default;padding-left:6px}
.bt-side-top .bt-brand:hover{background:none}
.bt-brand .bt-mark{flex:none}
.bt-pin{flex:none;display:inline-flex;color:var(--bt-ink-3)}
.bt-rail .bt-row{position:relative}
.bt-rail .bt-pin{position:absolute;top:3px;left:calc(50% + 12px)}
.bt-side .bt-read-only{margin:4px 8px 6px;padding:8px 10px;border-radius:10px;background:var(--bt-hover);font-size:12px;line-height:1.45;text-align:left}
[class*="_footArea"]:has(.bt-foot-account){grid-template-columns:auto minmax(0,1fr) auto;column-gap:6px}
[class*="_footArea"]>[class*="_footerActions"]>div>.bt-foot-account{grid-column:1;order:1;display:inline-flex}
[class*="_footArea"]:has(.bt-foot-account)>[class*="_footerActions"]>div>.bt-connect-wrap{grid-column:2}
[class*="_footArea"]:has(.bt-foot-account)>[class*="_settingsArea"]{grid-column:3}
[class*="_footArea"]:has(.bt-foot-account)>[class*="_settingsArea"] button[class*="_trigger"] [class*="_label"]{display:none!important}

/* The update cloud springs in when a newer ApmixBot shows up; its arrow drops in a
   loop while the install runs. */
.bt-round.bt-update{position:relative;color:var(--bt-accent,${INKS.red[0]});animation:bt-update-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
.bt-round.bt-update svg{width:17px;height:17px}
.bt-round.bt-update[data-phase=installed]{color:var(--bt-ink-2)}
@keyframes bt-update-in{from{opacity:0;transform:scale(.6);filter:blur(4px)}}
.bt-update[data-phase=installing] .bt-cloud-arrow{animation:bt-cloud-drop 1.1s cubic-bezier(.45,0,.55,1) infinite}
@keyframes bt-cloud-drop{0%{transform:translateY(-3px);opacity:0}35%{opacity:1}70%{transform:translateY(1px);opacity:1}100%{transform:translateY(2px);opacity:0}}
.bt-update-dot{position:absolute;top:6px;right:6px;width:7px;height:7px;border-radius:50%;background:#E5484D;box-shadow:0 0 0 1.5px var(--bt-sidebar)}
.bt-update-pop{position:fixed;z-index:60;width:280px;padding:14px 14px 12px;border-radius:14px;background:var(--bt-main);border:.5px solid var(--bt-line-2);box-shadow:0 10px 20px -3px rgba(0,0,0,.1),0 4px 6px -4px rgba(0,0,0,.1);color:var(--bt-ink);box-sizing:border-box;transform-origin:top left;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;animation:bt-update-pop ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
@keyframes bt-update-pop{from{opacity:0;transform:scale(.96);filter:blur(4px)}}
.bt-update-title{font-size:14px;line-height:20px;font-weight:600}
.bt-update-text{margin-top:2px;font-size:12.5px;line-height:18px;color:var(--bt-ink-2)}
.bt-update-error{margin-top:8px;font-size:12px;line-height:17px;color:var(--bt-danger);overflow-wrap:anywhere;max-height:90px;overflow:auto}
.bt-update-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:12px}
.bt-update-notes{margin-right:auto;font-size:12.5px;color:var(--bt-ink-2);text-decoration:none}
.bt-update-notes:hover{color:var(--bt-ink);text-decoration:underline}
.bt-update-go{height:30px;padding:0 14px;border:0;border-radius:999px;background:var(--bt-accent,${INKS.red[0]});color:var(--bt-accent-ink,#fff);font:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:opacity .12s ease,transform .12s ease}
.bt-update-go:hover:not(:disabled){opacity:.9}
.bt-update-go:active:not(:disabled){transform:scale(.96)}
.bt-update-go:disabled{opacity:.6;cursor:default}
@media (prefers-reduced-motion:reduce){.bt-round.bt-update,.bt-update-pop,.bt-update .bt-cloud-arrow{animation:none}}

/* The Engine Agent row and its expanding Session list. The terminal mark reads as
   "plain dsh" next to the robots. */
.bt-agent-ava{flex:none;width:${ROW_MARK}px;height:${ROW_MARK}px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:var(--bt-hover);color:var(--bt-ink)}
.bt-rail .bt-agent-ava{width:${RAIL_MARK}px;height:${RAIL_MARK}px}
.bt-agent-ava.bt-run{animation:bt-agent-pulse 1.4s ease-in-out infinite}
@keyframes bt-agent-pulse{0%,100%{opacity:1}50%{opacity:.55}}
.bt-agent-sub{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},visibility 0s linear ${SPRING_SHAPE.duration}ms}
.bt-agent-sub[data-open]{grid-template-rows:1fr;visibility:visible;transition-delay:0s}
.bt-agent-sub-in{overflow:hidden;min-height:0;margin-left:44px}
.bt-agent-sub-row{display:flex;align-items:center;gap:8px;width:100%;padding:5px 10px 5px 8px;border:0;border-radius:8px;background:none;color:var(--bt-ink-2);font:inherit;font-size:13px;line-height:20px;text-align:left;cursor:pointer}
.bt-agent-sub-row:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-agent-sub-row[aria-current=page]{background:var(--bt-hover);color:var(--bt-ink);font-weight:500}
.bt-agent-sub-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-agent-sub-time{flex:none;font-size:11px;color:var(--bt-ink-3)}
.bt-agent-new{color:var(--bt-ink-3)}
.bt-agent-new svg{width:14px;height:14px;flex:none}
.bt-agent-edit{padding:3px 10px 3px 4px}
.bt-agent-edit input{width:100%;border:0;border-radius:6px;background:var(--bt-hover);color:var(--bt-ink);font:inherit;font-size:13px;line-height:20px;padding:2px 8px;outline:none;box-shadow:inset 0 0 0 .5px var(--bt-line-2)}
.bt-agent-sub[data-open] .bt-agent-sub-row{animation:bt-agent-row-in .24s ease both;animation-delay:calc(var(--i, 0)*30ms)}
@keyframes bt-agent-row-in{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:blur(0)}}
@media (prefers-reduced-motion:reduce){.bt-agent-sub{transition:none}.bt-agent-sub .bt-agent-sub-row{animation:none}}
`;

// src/client/header.js
var import_react12 = require("react");
var import_react_dom4 = require("react-dom");
var GoArrow = () => (0, import_react12.createElement)("svg", { width: 14, height: 14, viewBox: "-12 -12 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, (0, import_react12.createElement)("path", { d: "M-7 0H7M2 -5L7 0L2 5" }));
var MEMORY_NOTICE_MS = 3200;
var noNews = (select) => select({});
function useMemoryNotice(ids, useMemoryNews) {
  const seen = useMemoryNews((map) => Math.max(0, ...ids.map((id) => map?.[id]?.seen ?? 0)));
  const [shown, setShown] = (0, import_react12.useState)(false);
  (0, import_react12.useEffect)(() => {
    const left = seen + MEMORY_NOTICE_MS - Date.now();
    setShown(seen > 0 && left > 0);
    if (seen === 0 || left <= 0) return void 0;
    const timer = setTimeout(() => setShown(false), left);
    return () => clearTimeout(timer);
  }, [seen]);
  return shown;
}
function MemoryNotice({ shown }) {
  const inner = (0, import_react12.useRef)(null);
  const [width, setWidth] = (0, import_react12.useState)(0);
  const label = t("Memory updated");
  (0, import_react12.useLayoutEffect)(() => {
    if (shown) setWidth(inner.current?.scrollWidth ?? 0);
  }, [label, shown]);
  return (0, import_react12.createElement)(
    "span",
    { className: "bt-pill-mem", "aria-hidden": true, style: { "--bt-mem-w": `${width}px` } },
    (0, import_react12.createElement)("span", { className: "bt-pill-mem-in", ref: inner }, (0, import_react12.createElement)("span", { className: "bt-pill-mem-ico" }, (0, import_react12.createElement)(MemoryIcon)), label)
  );
}
function HeaderPill({ sessionId, useRoster, useSessions, useSessionStatus, useSession, useActivity, useMemoryNews, useTurnClock, useUi, useLive, useWork, useStore, useConversationViews, selectView, actions }) {
  const roster = useRoster((value) => value);
  const selectedView = useStore?.((state) => state.view);
  const away = useConversationViews?.((views) => views.some((view) => view.id === selectedView && view.id !== "chat")) === true && typeof selectView === "function";
  const title = useSessions((list) => list.byId[sessionId]?.displayTitle ?? list.byId[sessionId]?.title ?? "");
  const firstTurns = useSessions((list) => {
    const outline = list.projectionsBySession?.[sessionId]?.values?.turnOutline ?? list.byId[sessionId]?.projectionValues?.turnOutline;
    return Array.isArray(outline) ? outline.slice(0, 8).map((entry) => entry.turn).join(",") : "";
  });
  const hiddenTurns = roster.exchangeTurns?.[sessionId];
  const visit = useUi((state) => state.visits?.[sessionId]);
  const opening = useTurnClock((state) => {
    const first = openingTurn(state[sessionId], firstTurns, hiddenTurns);
    return first && !unseenSince(visit, first.start) ? clockLabel(first.start) : "";
  });
  (0, import_react12.useEffect)(() => {
    if (opening) document.body.style.setProperty("--bt-first-sep", JSON.stringify(opening));
    else document.body.style.removeProperty("--bt-first-sep");
    return () => document.body.style.removeProperty("--bt-first-sep");
  }, [opening]);
  const running = useSessionStatus((map) => map.get(sessionId)?.running === true);
  const owner = roster.byId[sessionId]?.id ?? sessionId;
  const doing = useActivity((map) => map[owner]);
  const bot = roster.byId[sessionId];
  const room2 = roster.roomsById[sessionId];
  const detailsOpen = useUi((state) => state.details === sessionId);
  const name = bot?.name ?? room2?.name ?? "";
  const useNews = useMemoryNews ?? noNews;
  const memoryIds = bot ? [bot.id] : room2 ? [room2.id, ...room2.members] : [];
  const notice = useMemoryNotice(memoryIds, useNews);
  const changed = useNews((map) => latestMemoryChange(map, memoryIds));
  (0, import_react12.useEffect)(() => {
    document.body.style.setProperty("--bt-placeholder", JSON.stringify(name ? t("Message {name}", { name }) : t("Message")));
  }, [name, t("Message")]);
  const ready2 = roster.ready === true;
  (0, import_react12.useEffect)(() => {
    if (!ready2) return void 0;
    actions.beginVisit(sessionId);
    return () => actions.endVisit(sessionId);
  }, [sessionId, ready2]);
  const memoryNotice = !away && notice && changed !== null && roster.memory !== false;
  return (0, import_react12.createElement)(
    "div",
    { className: "bt-head" },
    (0, import_react12.createElement)(
      "button",
      {
        type: "button",
        className: "bt-pill",
        "aria-expanded": away ? void 0 : detailsOpen,
        "data-memory": memoryNotice ? "updated" : void 0,
        "aria-label": away ? t("Back to chat") : memoryNotice ? t("Memory updated. Open {name}'s memory", { name: roster.byId[changed]?.name ?? name }) : t("View conversation details"),
        title: away ? name : void 0,
        onClick: () => away ? selectView("chat") : memoryNotice ? actions.openMemory(changed) : actions.toggleDetails(sessionId)
      },
      bot ? (0, import_react12.createElement)(BotAvatar, { bot, size: 24, state: botState(running, doing, roster.questions?.[currentPart(bot)] !== void 0), badge: false }) : room2 ? (0, import_react12.createElement)(RoomAvatar, { room: room2, roster, size: 24 }) : null,
      (0, import_react12.createElement)("span", { className: "bt-pill-name" }, away ? t("Back to chat") : bot?.name ?? room2?.name ?? (title || t("New chat"))),
      (0, import_react12.createElement)(MemoryNotice, { shown: memoryNotice }),
      (0, import_react12.createElement)("span", { className: "bt-pill-go", "aria-hidden": true }, (0, import_react12.createElement)(GoArrow))
    ),
    (0, import_react12.createElement)("span", { className: "bt-sr", role: "status" }, memoryNotice ? t("Memory updated") : ""),
    (0, import_react12.createElement)(NewMessagePills, { key: sessionId, sessionId, useSessions, useUi, useTurnClock }),
    (0, import_react12.createElement)(ActivityIndicator, { key: `activity:${sessionId}`, sessionId, useRoster, useSessionStatus, useSession, useLive, useWork, actions }),
    // The engine's way into its right sidebar sits in the session header this pill replaces.
    actions.hasRightSidebar?.() ? (0, import_react12.createElement)("button", { type: "button", className: "bt-icon-btn bt-head-side", "data-bt-right-sidebar": "", "aria-label": t("Show or hide the right sidebar"), title: t("Right sidebar"), onClick: () => actions.toggleRightSidebar() }, (0, import_react12.createElement)(SidePanelIcon)) : null
  );
}
function useTranscriptView() {
  const [view, setView] = (0, import_react12.useState)(null);
  (0, import_react12.useEffect)(() => {
    let frame = 0;
    let watched = null;
    const observer = new MutationObserver(() => schedule());
    const measure = () => {
      frame = 0;
      const scroller = document.querySelector("[data-conversation-scroll]");
      if (scroller !== watched) {
        observer.disconnect();
        watched = scroller;
        if (scroller) observer.observe(scroller, { childList: true, subtree: true });
      }
      if (!scroller) {
        setView(null);
        return;
      }
      const box2 = scroller.getBoundingClientRect();
      const headerBottom = document.querySelector('header[class*="_header"]')?.getBoundingClientRect().bottom ?? box2.top + 50;
      const sep = scroller.querySelector(".bt-new-sep");
      let divider = null;
      if (sep) {
        const at2 = sep.getBoundingClientRect();
        divider = at2.bottom <= headerBottom ? "above" : at2.top >= box2.bottom ? "below" : "in-view";
      }
      const composer = parseFloat(getComputedStyle(scroller).getPropertyValue("--dsh-composer-height")) || 152;
      const next = {
        unpinned: scroller.querySelector('[class*="_toBottomSlot"]>button') !== null,
        divider,
        center: Math.round(box2.left + box2.width / 2),
        top: Math.round(headerBottom + 8),
        bottom: Math.round(window.innerHeight - box2.bottom + composer + 8)
      };
      setView((prev) => prev && Object.keys(next).every((key) => prev[key] === next[key]) ? prev : next);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    document.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  return view;
}
function NewMessagePills({ sessionId, useSessions, useUi, useTurnClock }) {
  const replies = useSessions((list) => {
    const outline = list.projectionsBySession?.[sessionId]?.values?.turnOutline ?? list.byId[sessionId]?.projectionValues?.turnOutline;
    return Array.isArray(outline) ? outline.reduce((count, entry) => count + (entry.response ? 1 : 0), 0) : 0;
  });
  const visit = useUi((state) => state.visits?.[sessionId]);
  const unread = useTurnClock((state) => {
    if (typeof visit?.seen !== "number") return 0;
    let count = 0;
    for (const entry of Object.values(state[sessionId] ?? {})) {
      if (entry.first !== void 0 && entry.first > visit.seen && entry.first <= visit.entered) count += 1;
    }
    return count;
  });
  const view = useTranscriptView();
  const unpinned = view?.unpinned === true;
  const [release, setRelease] = (0, import_react12.useState)({ base: null, dismissed: false });
  const [above, setAbove] = (0, import_react12.useState)({ seen: false, dismissed: false });
  (0, import_react12.useEffect)(() => {
    setRelease({ base: unpinned ? replies : null, dismissed: false });
  }, [unpinned]);
  (0, import_react12.useEffect)(() => {
    if (view?.divider === "in-view") setAbove((state) => state.seen ? state : { ...state, seen: true });
  }, [view?.divider]);
  const fresh = release.base === null ? 0 : replies - release.base;
  const showDown = unpinned && fresh > 0 && !release.dismissed;
  const showUp = view?.divider === "above" && !above.seen && !above.dismissed;
  (0, import_react12.useEffect)(() => {
    const scroller = document.querySelector("[data-conversation-scroll]");
    if (!scroller) return void 0;
    scroller.toggleAttribute("data-bt-news", showDown);
    return () => scroller.removeAttribute("data-bt-news");
  }, [showDown]);
  if (!view || !showDown && !showUp) return null;
  const label = (count) => count === 1 ? t("1 new message") : count > 0 ? t("{count} new messages", { count }) : t("New messages");
  const pill = (direction, count, style, onJump, onDismiss) => (0, import_react12.createElement)(
    "div",
    { className: "bt-news", "data-direction": direction, style },
    (0, import_react12.createElement)(
      "button",
      { type: "button", className: "bt-news-jump", onClick: onJump },
      (0, import_react12.createElement)("span", { className: "bt-news-ico" }, (0, import_react12.createElement)(direction === "up" ? ArrowUpIcon : ArrowDownIcon)),
      label(count)
    ),
    (0, import_react12.createElement)("button", {
      type: "button",
      className: "bt-news-x",
      "aria-label": t("Dismiss new messages"),
      onClick: (event) => {
        event.stopPropagation();
        onDismiss();
      }
    }, (0, import_react12.createElement)(CloseIcon))
  );
  const toLatest = () => {
    const scroller = document.querySelector("[data-conversation-scroll]");
    const back = scroller?.querySelector('[class*="_toBottomSlot"]>button');
    if (back) back.click();
    else scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
  };
  const toDivider = () => document.querySelector("[data-conversation-scroll] .bt-new-sep")?.scrollIntoView({ block: "center", behavior: "smooth" });
  return (0, import_react_dom4.createPortal)(
    (0, import_react12.createElement)(
      import_react12.Fragment,
      null,
      showUp ? pill("up", unread, { left: view.center, top: view.top }, toDivider, () => setAbove((state) => ({ ...state, dismissed: true }))) : null,
      showDown ? pill("down", fresh, { left: view.center, bottom: view.bottom }, toLatest, () => setRelease((state) => ({ ...state, dismissed: true }))) : null
    ),
    document.body
  );
}

// src/client/composer.js
var import_react13 = require("react");
var import_react_dom5 = require("react-dom");
var keepComposerFocus = (event) => event.preventDefault();
function ComposerQuote({ sessionId, inputActions, actions, useUi }) {
  const quote = useUi((state) => state.quote?.sessionId === sessionId ? state.quote : null);
  (0, import_react13.useEffect)(() => {
    if (!quote || !inputActions) return;
    actions.clearQuote(quote.token);
    const excerpt = quote.text.replace(/\s+/g, " ").trim();
    const line = `> ${excerpt.length > 200 ? `${excerpt.slice(0, 200)}…` : excerpt}

`;
    inputActions.insertText(line, inputActions.captureInsertion());
    const box2 = document.querySelector('[class*="_centerCol"] [role=textbox][contenteditable=true]');
    if (box2 instanceof HTMLElement) {
      box2.focus();
      const selection = window.getSelection();
      selection?.selectAllChildren(box2);
      selection?.collapseToEnd();
    }
  }, [quote?.token]);
  return null;
}
function menuIcons(roster) {
  const marks = /* @__PURE__ */ new Map();
  return (row) => {
    if (!row.bot) return PeopleIcon;
    const id = row.bot.id;
    if (!marks.has(id)) marks.set(id, ({ size = 14 }) => (0, import_react13.createElement)(BotMark, { bot: roster.getSnapshot().byId[id] ?? row.bot, size }));
    return marks.get(id);
  };
}
function ComposerPlus({ sessionId, inputActions, useRoster, actions }) {
  const roster = useRoster((value) => value);
  const [open, setOpen] = (0, import_react13.useState)(null);
  const [shown, leaving] = useLinger(open, 120);
  const button = (0, import_react13.useRef)(null);
  const menu = (0, import_react13.useRef)(null);
  (0, import_react13.useEffect)(() => {
    if (!open) return void 0;
    const onDown = (event) => {
      if (![button.current, menu.current].some((node) => node?.contains(event.target))) setOpen(null);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setOpen(null);
      }
    };
    window.addEventListener("mousedown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);
  const target = roster.byId?.[sessionId]?.id ?? roster.roomsById?.[sessionId]?.id;
  if (sessionId === void 0 || target === void 0) return null;
  const fileInput = () => button.current?.closest("[data-composer-card]")?.querySelector("input[type=file]");
  const toggle = () => {
    if (open) {
      setOpen(null);
      return;
    }
    const rect = button.current.getBoundingClientRect();
    setOpen({ left: rect.left, bottom: window.innerHeight - rect.top + 8, files: Boolean(fileInput()) });
  };
  const attach = () => {
    setOpen(null);
    fileInput()?.click();
  };
  const schedule = () => {
    setOpen(null);
    actions.openSettings("schedules", target);
  };
  const reference = () => {
    setOpen(null);
    actions.referenceChat(sessionId, inputActions?.captureInsertion?.());
  };
  const canReference = typeof inputActions?.captureInsertion === "function" && actions.canReferenceChat();
  return (0, import_react13.createElement)(
    import_react13.Fragment,
    null,
    (0, import_react13.createElement)("button", {
      ref: button,
      type: "button",
      className: "bt-plus",
      "aria-label": t("Add"),
      title: t("Add"),
      "aria-haspopup": "menu",
      "aria-expanded": Boolean(open),
      onMouseDown: keepComposerFocus,
      onClick: toggle
    }, (0, import_react13.createElement)(PlusIcon)),
    shown ? (0, import_react_dom5.createPortal)((0, import_react13.createElement)(
      "div",
      {
        ref: menu,
        className: "bt-menu bt-menu-up bt-plus-menu",
        role: "menu",
        "aria-label": t("Add"),
        style: { left: shown.left, bottom: shown.bottom },
        "data-leaving": leaving || void 0
      },
      shown.files ? (0, import_react13.createElement)("button", { type: "button", role: "menuitem", onClick: attach }, (0, import_react13.createElement)(PaperclipIcon), (0, import_react13.createElement)("span", { className: "bt-menu-label" }, t("Add files"))) : null,
      canReference ? (0, import_react13.createElement)("button", { type: "button", role: "menuitem", onMouseDown: keepComposerFocus, onClick: reference }, (0, import_react13.createElement)(ChatsIcon), (0, import_react13.createElement)("span", { className: "bt-menu-label" }, t("Reference a chat"))) : null,
      (0, import_react13.createElement)("button", { type: "button", role: "menuitem", onClick: schedule }, (0, import_react13.createElement)(ClockIcon), (0, import_react13.createElement)("span", { className: "bt-menu-label" }, t("Scheduled task")))
    ), document.body) : null
  );
}

// src/client/at-menu.js
var BOTS_SOURCE = "apmixbot";
var CHATS_SOURCE = "apmixbot-chats";
var ROOM_ALL = ["all", "everyone"];
var OTHER_CHATS_MAX = 8;
var conversationOf = (roster, sessionId) => {
  if (!roster.ready) return null;
  const room2 = roster.roomsById[sessionId];
  if (room2) return { room: room2 };
  const self = roster.byId[sessionId];
  return self ? { self } : null;
};
function mentionRows(roster, sessionId, query = "") {
  const here = conversationOf(roster, sessionId);
  if (here === null) return null;
  const bots = here.room ? here.room.members.map((id) => roster.byId[id]).filter(Boolean) : roster.bots.filter((bot) => bot.id !== here.self.id);
  const needle = query.trim().toLowerCase();
  const rows = bots.filter((bot) => bot.name.toLowerCase().includes(needle)).map((bot) => ({ bot, text: `@${bot.name} ` }));
  const everyone = t("Everyone");
  if (here.room && bots.length > 1 && [everyone, ...ROOM_ALL].some((word) => word.toLowerCase().startsWith(needle))) {
    rows.push({ room: here.room, text: `@${everyone} ` });
  }
  return rows;
}
function chatRows(roster, list, sessionId) {
  const here = conversationOf(roster, sessionId);
  if (here === null) return [];
  const byId = list?.byId ?? {};
  const bots = roster.bots.filter((bot) => bot.id !== here.self?.id).map((bot) => {
    const id = currentPart(bot);
    return { sessionId: id, label: t("Chat with {name}", { name: bot.name }), bot, updatedAt: byId[id]?.updatedAt };
  });
  const team = /* @__PURE__ */ new Set([
    ...roster.bots.flatMap((bot) => [bot.id, currentPart(bot), ...bot.parts ?? []]),
    ...roster.rooms.flatMap((room2) => [room2.id, ...room2.parts ?? []])
  ]);
  const others = (list?.ids ?? []).map((id) => byId[id]).filter((row) => row !== void 0 && row.id !== sessionId && !team.has(row.id) && row.origin !== "subagent" && row.blank !== true).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)).slice(0, OTHER_CHATS_MAX).map((row) => ({ sessionId: row.id, label: row.displayTitle || row.title || row.id, updatedAt: row.updatedAt }));
  return [...bots, ...others];
}
function sessionMention(sessionId, label) {
  let binary = "";
  for (const byte of new TextEncoder().encode(JSON.stringify(sessionId))) binary += String.fromCharCode(byte);
  const payload = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `@[${label.replace(/[\\\]]/g, (mark) => `\\${mark}`)}](dsh-session:${payload})`;
}
function atSources({ roster, sessions, launched, iconFor }) {
  const bots = {
    trigger: "@",
    name: BOTS_SOURCE,
    order: -20,
    showGroupTitle: false,
    async candidates(session, { query }) {
      return (mentionRows(roster.getSnapshot(), session.sessionId, query) ?? []).map((row) => ({
        name: row.bot ? row.bot.name : t("Everyone"),
        ...row.bot?.role ? { description: row.bot.role } : {},
        ...row.room ? { description: t("{count} members", { count: row.room.members.length }) } : {},
        icon: iconFor(row),
        section: t("Bots"),
        value: row.text
      }));
    },
    onPick: ({ candidate }) => candidate.value ? { text: candidate.value } : void 0
  };
  const chats = {
    trigger: "@",
    name: CHATS_SOURCE,
    order: -10,
    showGroupTitle: false,
    async candidates(session) {
      if (!launched(session.sessionId)) return [];
      return chatRows(roster.getSnapshot(), sessions.list.getSnapshot(), session.sessionId).map((row) => ({
        name: row.bot ? row.bot.name : row.label,
        ...row.updatedAt ? { description: relativeShort(row.updatedAt) } : {},
        icon: row.bot ? iconFor(row) : "session",
        section: row.bot ? t("Bots") : t("Conversations"),
        value: JSON.stringify({ sessionId: row.sessionId, label: row.label })
      }));
    },
    onPick({ candidate }) {
      const { sessionId, label } = JSON.parse(candidate.value);
      const mention = sessionMention(sessionId, label);
      return { insert: { source: CHATS_SOURCE, ref: mention, label, appearance: "session", clipboardText: mention } };
    },
    codec: { clipboardText: (ref) => ref, serialize: (ref) => Promise.resolve(ref) }
  };
  return [bots, chats];
}

// src/client/storage.js
var STORAGE = {
  unread: "apmixbot:unread",
  reactions: "apmixbot:reactions",
  seen: "apmixbot:seen",
  prefs: "apmixbot:prefs",
  surface: "apmixbot:surface",
  agentSessions: "apmixbot:agent-sessions",
  browserWidth: "apmixbot:browser-width",
  browsers: "apmixbot.browser.v2"
};

// src/client/surface.js
function groupsFor({ mode, plain = false }) {
  return { shell: mode === "bot", conversation: mode === "bot" && !plain };
}
var GROUPS = ["shell", "conversation"];
function disposeAll(disposers, label) {
  for (const dispose of [...disposers].reverse()) {
    try {
      dispose?.();
    } catch (error) {
      console.warn(`[apmixbot] ${label}`, error);
    }
  }
}
function surfaceGroups(install, { onError } = {}) {
  const mounted = { shell: [], conversation: [] };
  const withdraw = (group) => {
    const disposers = mounted[group];
    mounted[group] = [];
    disposeAll(disposers, `withdraw ${group}`);
  };
  return {
    reconcile(wanted) {
      for (const group of [...GROUPS].reverse()) if (!wanted[group]) withdraw(group);
      for (const group of GROUPS) {
        if (!wanted[group] || mounted[group].length > 0) continue;
        const disposers = [];
        try {
          for (const step of install[group]()) if (step) disposers.push(step());
          mounted[group] = disposers;
        } catch (error) {
          disposeAll(disposers, `roll back ${group}`);
          console.warn(`[apmixbot] install ${group}`, error);
          onError?.(group, error);
          break;
        }
      }
    },
    dispose() {
      for (const group of [...GROUPS].reverse()) withdraw(group);
    }
  };
}
function freePriority(entries2, { priority, key, id }) {
  if (priority === void 0) return void 0;
  const taken = entries2.filter((entry) => (key === void 0 || entry.options?.key === key) && (id === void 0 || entry.options?.id === id)).map((entry) => (entry.options?.priority ?? 0) - 1);
  return Math.min(priority, ...taken);
}
function readMode(storage = globalThis.localStorage) {
  try {
    return storage.getItem(STORAGE.surface) === "agent" ? "agent" : "bot";
  } catch {
    return "bot";
  }
}
function writeMode(mode, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE.surface, mode);
  } catch {
  }
}

// src/client/header-navigation.js
var navigationEntry = (entries2) => entries2.find((entry) => entry.store && typeof entry.inject === "function");
function headerNavigation(entries2, face) {
  const source = navigationEntry(entries2);
  return {
    ...source ? { store: source.store } : {},
    inject: (...args) => {
      const navigation = source?.inject(...args) ?? {};
      const own = face();
      return { ...navigation, ...own, hooks: { ...navigation.hooks, ...own.hooks } };
    }
  };
}
function installHeaderNavigation(slots, face, component, priority) {
  const name = "conversation.session.header";
  let source;
  let dispose;
  const refresh = () => {
    const entries2 = slots.entries(name).filter((entry) => entry.component !== component);
    const next = navigationEntry(entries2);
    if (dispose && source === next) return;
    dispose?.();
    source = next;
    dispose = slots.register({ name, priority: freePriority(entries2, { priority }), ...headerNavigation(entries2, face) }, component);
  };
  const unsubscribe = slots.subscribe(name, refresh);
  try {
    refresh();
  } catch (error) {
    unsubscribe();
    throw error;
  }
  return () => {
    unsubscribe();
    dispose?.();
  };
}

// src/client/overlay-hooks.js
var import_react14 = require("react");
var escapeLayers = [];
var onEscapeKey = (event) => {
  if (event.key === "Escape") escapeLayers.at(-1)?.current();
};
function useEscape(onClose, { base = false } = {}) {
  const ref = (0, import_react14.useRef)(onClose);
  ref.current = onClose;
  (0, import_react14.useEffect)(() => {
    if (escapeLayers.length === 0) window.addEventListener("keydown", onEscapeKey);
    if (base) escapeLayers.unshift(ref);
    else escapeLayers.push(ref);
    return () => {
      escapeLayers.splice(escapeLayers.indexOf(ref), 1);
      if (escapeLayers.length === 0) window.removeEventListener("keydown", onEscapeKey);
    };
  }, []);
}
function usePaneLeft() {
  const [paneLeft, setPaneLeft] = (0, import_react14.useState)(280);
  (0, import_react14.useLayoutEffect)(() => {
    const column = document.querySelector('[class*="_footArea"]')?.parentElement;
    if (column) setPaneLeft(Math.round(column.getBoundingClientRect().right));
  }, []);
  return paneLeft;
}

// src/client/palette.js
var import_react15 = require("react");
var PALETTE_EXIT_MS = 160;
function CommandPalette({ start, token, roster, actions, useSessions }) {
  const [query, setQuery] = (0, import_react15.useState)(start ?? "");
  const [cursor, setCursor] = (0, import_react15.useState)(0);
  const [leaving, setLeaving] = (0, import_react15.useState)(false);
  const wanted = query.trim().toLowerCase();
  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => actions.closePalette(token), PALETTE_EXIT_MS);
  };
  useEscape(close);
  const ids = [...roster.bots.map(currentPart), ...roster.rooms.map((item) => item.id)];
  const found = useSessions((list) => {
    if (wanted.length < 2) return "[]";
    const hits = [];
    for (const id of ids) {
      const outline = list.projectionsBySession?.[id]?.values?.turnOutline ?? list.byId[id]?.projectionValues?.turnOutline;
      if (!Array.isArray(outline)) continue;
      const hidden = roster.exchangeTurns[id] ?? [];
      for (let index2 = outline.length - 1; index2 >= 0 && hits.length < 30; index2 -= 1) {
        const entry = outline[index2];
        if (hidden.includes(entry.turn)) continue;
        for (const raw of [entry.response, entry.prompt]) {
          const text = stripHeader(raw ?? "").replace(/\s+/g, " ").trim();
          const at2 = text.toLowerCase().indexOf(wanted);
          if (at2 < 0) continue;
          const from = Math.max(0, at2 - 24);
          hits.push([id, entry.turn, (from > 0 ? "…" : "") + text.slice(from, at2 + wanted.length + 60)]);
          break;
        }
      }
    }
    return JSON.stringify(hits);
  });
  const matchesName = (...fields) => wanted === "" || fields.some((field) => (field ?? "").toLowerCase().includes(wanted));
  const sections = [];
  const people = [
    ...roster.bots.filter((bot) => matchesName(bot.name, bot.role)).map((bot) => ({
      key: bot.id,
      avatar: (0, import_react15.createElement)(BotAvatar, { bot, size: 24, badge: false, live: false }),
      title: bot.name,
      subtitle: [bot.role, isMainOf(roster, bot.id) ? t("Main Bot") : ""].filter(Boolean).join(" · "),
      badge: bot.hidden ? t("Hidden") : void 0,
      run: async () => {
        if (bot.hidden) await actions.setFlags(bot.id, { hidden: false });
        actions.openSession(bot.id);
      }
    })),
    ...roster.rooms.filter((room2) => matchesName(room2.name)).map((room2) => ({
      key: room2.id,
      avatar: (0, import_react15.createElement)(RoomAvatar, { room: room2, roster, size: 24 }),
      title: room2.name,
      subtitle: t("{count} members", { count: room2.members.length }),
      badge: room2.hidden ? t("Hidden") : void 0,
      run: async () => {
        if (room2.hidden) await actions.setFlags(room2.id, { hidden: false });
        actions.openSession(room2.id);
      }
    }))
  ];
  if (people.length) sections.push([t("Bots"), people]);
  const agents = (roster.agents ?? []).filter(() => matchesName("Engine Agent")).map((agent) => ({
    key: agent.id,
    avatar: (0, import_react15.createElement)("span", { className: "bt-palette-agent" }, (0, import_react15.createElement)(AgentIcon, { size: 18 })),
    title: "Engine Agent",
    subtitle: t("Plain dsh session"),
    run: () => actions.openAgent(agent.id)
  }));
  if (agents.length) sections.push(["Engine Agent", agents]);
  const messages = JSON.parse(found).map(([id, turn, snippet]) => {
    const bot = roster.byId[id];
    const room2 = roster.roomsById[id];
    return {
      key: `${id}:${turn}`,
      title: bot?.name ?? room2?.name ?? t("Bot"),
      subtitle: snippet,
      avatar: bot ? (0, import_react15.createElement)(BotAvatar, { bot, size: 24, badge: false, live: false }) : (0, import_react15.createElement)(RoomAvatar, { room: room2, roster, size: 24 }),
      run: () => actions.openSession(id)
    };
  });
  if (messages.length) sections.push([t("Messages"), messages]);
  const commands = [
    { key: "cmd:new", icon: (0, import_react15.createElement)(PlusIcon), title: t("New chat"), run: () => actions.openNewChat("new") },
    { key: "cmd:bot", icon: (0, import_react15.createElement)(PlusIcon), title: t("Create Bot"), run: () => actions.openNewChat("create") },
    { key: "cmd:group", icon: (0, import_react15.createElement)(PeopleIcon), title: t("Create group chat"), run: () => actions.openNewChat("group") },
    { key: "cmd:settings", icon: (0, import_react15.createElement)(GearIcon), title: t("Bot settings"), run: () => actions.openSettings("general") }
  ].filter((command) => matchesName(command.title));
  if (commands.length) sections.push([t("Commands"), commands]);
  const rows = sections.flatMap(([, items]) => items);
  const active = Math.min(cursor, Math.max(rows.length - 1, 0));
  const shown = rows.map((row) => row.key).join("\n");
  const glide = useGlide(`${active}
${shown}`, { axis: "y", ...QUICK_EDGES });
  const listRef = glide.box;
  useFlip(listRef, shown, "[data-flip]");
  (0, import_react15.useEffect)(() => {
    listRef.current?.querySelector("[aria-selected=true]")?.scrollIntoView({ block: "nearest" });
  }, [active, query]);
  const choose = (row) => {
    if (!row || leaving) return;
    void Promise.resolve(row.run()).catch((error) => actions.reportError(error, "menu"));
    close();
  };
  let index = -1;
  return (0, import_react15.createElement)(
    "div",
    { className: "bt-palette-layer", "data-leaving": leaving || void 0 },
    (0, import_react15.createElement)("div", { className: "bt-backdrop", onMouseDown: close }),
    (0, import_react15.createElement)(
      "div",
      { className: "bt-palette", role: "dialog", "aria-label": t("Search"), "aria-modal": true },
      (0, import_react15.createElement)(
        "div",
        { className: "bt-palette-head" },
        (0, import_react15.createElement)("span", { className: "bt-palette-glyph", "aria-hidden": true }, (0, import_react15.createElement)(SearchIcon)),
        (0, import_react15.createElement)("input", {
          autoFocus: true,
          value: query,
          placeholder: t("Search Bots, chats and messages"),
          "aria-label": t("Search"),
          role: "combobox",
          "aria-expanded": true,
          "aria-controls": "bt-palette-list",
          onChange: (event) => {
            setQuery(event.target.value);
            setCursor(0);
          },
          onKeyDown: (event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setCursor(Math.min(active + 1, rows.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setCursor(Math.max(active - 1, 0));
            } else if (event.key === "Enter") {
              event.preventDefault();
              choose(rows[active]);
            }
          }
        }),
        query ? (0, import_react15.createElement)("button", { type: "button", className: "bt-palette-clear", "aria-label": t("Clear search"), onClick: () => {
          setQuery("");
          setCursor(0);
        } }, (0, import_react15.createElement)(CloseIcon)) : null
      ),
      (0, import_react15.createElement)(
        "div",
        { ref: listRef, id: "bt-palette-list", className: "bt-palette-list", role: "listbox", "aria-label": t("Results") },
        (0, import_react15.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
        rows.length === 0 ? (0, import_react15.createElement)(
          "div",
          { className: "bt-palette-empty" },
          (0, import_react15.createElement)("span", { className: "bt-palette-empty-icon", "aria-hidden": true }, (0, import_react15.createElement)(SearchIcon)),
          (0, import_react15.createElement)("span", { className: "bt-palette-empty-label" }, t("No results")),
          (0, import_react15.createElement)("span", { className: "bt-palette-empty-hint" }, t("Try a Bot name or words from a message"))
        ) : sections.map(([title, items]) => (0, import_react15.createElement)(
          import_react15.Fragment,
          { key: title },
          (0, import_react15.createElement)("div", { className: "bt-palette-section", role: "presentation", "data-flip": `section:${title}` }, title),
          items.map((row) => {
            index += 1;
            const at2 = index;
            return (0, import_react15.createElement)(
              "button",
              {
                key: row.key,
                type: "button",
                role: "option",
                className: "bt-palette-row",
                "aria-selected": at2 === active,
                "data-flip": row.key,
                onMouseMove: () => {
                  if (cursor !== at2) setCursor(at2);
                },
                onClick: () => choose(row)
              },
              (0, import_react15.createElement)("span", { className: "bt-palette-lead" }, row.avatar ?? (0, import_react15.createElement)("span", { className: "bt-palette-cmd" }, row.icon)),
              (0, import_react15.createElement)(
                "span",
                { className: "bt-palette-text" },
                (0, import_react15.createElement)("span", { className: "bt-palette-title" }, row.title),
                row.subtitle ? (0, import_react15.createElement)("span", { className: "bt-palette-sub" }, row.subtitle) : null
              ),
              row.badge ? (0, import_react15.createElement)("span", { className: "bt-palette-badge" }, row.badge) : null
            );
          })
        ))
      )
    )
  );
}

// src/client/endpoint-form.js
var import_react16 = require("react");
var PROTOCOLS = ["openai-completions", "openai-responses", "anthropic-messages"];
var PROTOCOL_NAMES = { "openai-completions": "OpenAI Chat Completions", "openai-responses": "OpenAI Responses", "anthropic-messages": "Anthropic Messages" };
var ENDPOINT_HINTS = { "anthropic-messages": "https://gateway.example" };
var ENDPOINT_HINT = "https://gateway.example/v1";
var SEARCH_FROM = 12;
var failureText = (failure) => hostText(failure?.message ?? String(failure));
var typedIds = (text) => text.split(/[\s,]+/).map((id) => id.trim()).filter(Boolean);
function ModelPicker({ models, picked, onPick, typed, onType }) {
  const [query, setQuery] = (0, import_react16.useState)("");
  const listed = models ?? [];
  const needle = query.trim().toLowerCase();
  const shown = needle === "" ? listed : listed.filter((model) => model.id.toLowerCase().includes(needle) || (model.name ?? "").toLowerCase().includes(needle));
  const toggle = (id) => onPick(picked.includes(id) ? picked.filter((item) => item !== id) : [...picked, id]);
  return (0, import_react16.createElement)(
    "div",
    { className: "bt-endpoint-models" },
    models !== null && listed.length === 0 ? (0, import_react16.createElement)("div", { className: "bt-set-hint" }, t("The endpoint lists no models. Enter their ids below.")) : null,
    listed.length > SEARCH_FROM ? (0, import_react16.createElement)("input", {
      className: "bt-input",
      type: "search",
      "aria-label": t("Search models"),
      placeholder: t("Search models"),
      value: query,
      spellCheck: false,
      onChange: (event) => setQuery(event.target.value)
    }) : null,
    listed.length > 0 ? (0, import_react16.createElement)(
      "div",
      { className: "bt-endpoint-picks-head" },
      (0, import_react16.createElement)("span", { className: "bt-set-hint" }, t("{count} selected", { count: picked.length })),
      // Select all takes the models the search shows; Clear drops every pick, hidden ones too.
      (0, import_react16.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: shown.every((model) => picked.includes(model.id)), onClick: () => onPick([.../* @__PURE__ */ new Set([...picked, ...shown.map((model) => model.id)])]) }, t("Select all")),
      (0, import_react16.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: picked.length === 0, onClick: () => onPick([]) }, t("Clear"))
    ) : null,
    listed.length > 0 ? (0, import_react16.createElement)(
      "div",
      { className: "bt-secret-bots bt-endpoint-found", role: "group", "aria-label": t("Models") },
      shown.length === 0 ? (0, import_react16.createElement)("span", { className: "bt-set-hint" }, t("No model matches.")) : shown.map((model) => (0, import_react16.createElement)("button", {
        key: model.id,
        type: "button",
        className: "bt-secret-bot",
        "aria-pressed": picked.includes(model.id),
        title: model.name && model.name !== model.id ? model.name : void 0,
        onClick: () => toggle(model.id)
      }, (0, import_react16.createElement)("code", null, model.id), picked.includes(model.id) ? (0, import_react16.createElement)(CheckIcon) : null))
    ) : null,
    (0, import_react16.createElement)("input", {
      className: "bt-input",
      "aria-label": t("Model ids"),
      value: typed,
      spellCheck: false,
      autoComplete: "off",
      placeholder: listed.length > 0 ? t("Other model ids, separated by commas") : t("Model ids, separated by commas"),
      onChange: (event) => onType(event.target.value)
    })
  );
}
function EndpointForm({ actions, onAdded, onCancel, submitLabel, busyLabel, variant = "page", autoFocus = false, extra = null }) {
  const [draft, setDraft] = (0, import_react16.useState)({ baseURL: "", api: PROTOCOLS[0], key: "", name: "", contextWindow: "" });
  const [found, setFound] = (0, import_react16.useState)(null);
  const [picked, setPicked] = (0, import_react16.useState)([]);
  const [typed, setTyped] = (0, import_react16.useState)("");
  const [asking, setAsking] = (0, import_react16.useState)(false);
  const [busy, setBusy] = (0, import_react16.useState)(false);
  const [error, setError] = (0, import_react16.useState)("");
  const set = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const size = Number(draft.contextWindow);
  const sized = (model) => Number.isInteger(size) && size > 0 && model.contextWindow === void 0 ? { ...model, contextWindow: size } : model;
  const models = [
    ...(found ?? []).filter((model) => picked.includes(model.id)),
    ...typedIds(typed).filter((id) => !picked.includes(id)).map((id) => ({ id }))
  ].map(sized);
  const hasEndpoint = draft.baseURL.trim() !== "";
  const ready2 = hasEndpoint && models.length > 0 && !busy;
  const fetchModels = () => {
    if (asking || !hasEndpoint) return;
    setAsking(true);
    setError("");
    void Promise.resolve(actions.providerModels({ baseURL: draft.baseURL, api: draft.api, key: draft.key })).then((list) => {
      const listed = Array.isArray(list) ? list : [];
      setFound(listed);
      setPicked((current) => listed.length === 1 ? [listed[0].id] : current.filter((id) => listed.some((model) => model.id === id)));
    }, (failure) => setError(failureText(failure))).finally(() => setAsking(false));
  };
  const add = () => {
    if (!ready2) return;
    setBusy(true);
    setError("");
    void Promise.resolve(actions.addProvider({ custom: true, baseURL: draft.baseURL, api: draft.api, key: draft.key, name: draft.name, models })).then((view) => {
      set("key", "");
      onAdded?.(view);
    }, (failure) => {
      setError(failureText(failure));
      setBusy(false);
    });
  };
  const card = variant === "card";
  const quiet = card ? "bt-q-btn" : "bt-soft bt-soft-sm";
  const main = card ? "bt-q-submit" : "bt-soft bt-soft-sm";
  return (0, import_react16.createElement)(
    "div",
    { className: "bt-endpoint", "data-variant": variant },
    (0, import_react16.createElement)(
      "div",
      { className: "bt-endpoint-pair" },
      (0, import_react16.createElement)("input", {
        className: "bt-input",
        "aria-label": t("Endpoint"),
        placeholder: ENDPOINT_HINTS[draft.api] ?? ENDPOINT_HINT,
        value: draft.baseURL,
        inputMode: "url",
        spellCheck: false,
        autoComplete: "off",
        autoFocus,
        onChange: (event) => set("baseURL", event.target.value)
      }),
      (0, import_react16.createElement)(
        "select",
        { className: "bt-select", "aria-label": t("Protocol"), value: draft.api, onChange: (event) => set("api", event.target.value) },
        PROTOCOLS.map((api) => (0, import_react16.createElement)("option", { key: api, value: api }, PROTOCOL_NAMES[api]))
      )
    ),
    (0, import_react16.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react16.createElement)(KeyIcon), (0, import_react16.createElement)(MaskedInput, { value: draft.key, onChange: (value) => set("key", value), onEnter: fetchModels, label: t("API key") })),
    (0, import_react16.createElement)(
      "div",
      { className: "bt-endpoint-models-head" },
      (0, import_react16.createElement)("span", { className: "bt-secret-edit-label" }, t("Models")),
      (0, import_react16.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: asking || !hasEndpoint, onClick: fetchModels }, asking ? t("Asking…") : t("Fetch models"))
    ),
    (0, import_react16.createElement)(ModelPicker, { models: found, picked, onPick: setPicked, typed, onType: setTyped }),
    (0, import_react16.createElement)(
      "details",
      { className: "bt-endpoint-more" },
      (0, import_react16.createElement)("summary", null, t("More options")),
      (0, import_react16.createElement)(
        "div",
        { className: "bt-endpoint-pair" },
        (0, import_react16.createElement)("input", { className: "bt-input", "aria-label": t("Name"), placeholder: t("Name (optional)"), value: draft.name, autoComplete: "off", onChange: (event) => set("name", event.target.value) }),
        (0, import_react16.createElement)("input", {
          className: "bt-input",
          "aria-label": t("Context window (tokens)"),
          placeholder: t("Context window (tokens)"),
          value: draft.contextWindow,
          inputMode: "numeric",
          autoComplete: "off",
          onChange: (event) => set("contextWindow", event.target.value.replace(/\D+/g, ""))
        })
      ),
      (0, import_react16.createElement)("div", { className: "bt-set-hint" }, t("The context window goes to the models whose endpoint does not tell it."))
    ),
    error ? (0, import_react16.createElement)("div", { className: "bt-secret-error", role: "alert" }, error) : null,
    (0, import_react16.createElement)(
      "div",
      { className: card ? "bt-q-foot" : "bt-secret-row-actions" },
      extra,
      onCancel ? (0, import_react16.createElement)("button", { type: "button", className: quiet, onClick: onCancel }, t("Cancel")) : null,
      (0, import_react16.createElement)("button", { type: "button", className: main, disabled: !ready2, onClick: add }, busy ? busyLabel ?? t("Saving…") : submitLabel ?? t("Add"))
    )
  );
}
var ENDPOINT_CSS = `
.bt-endpoint{display:flex;flex-direction:column;gap:10px;min-width:0}
.bt-endpoint-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,190px);gap:8px}
.bt-endpoint .bt-endpoint-more .bt-endpoint-pair{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.bt-endpoint .bt-input,.bt-endpoint .bt-select{height:34px}
.bt-endpoint .bt-secret-field{min-height:36px;align-items:center;gap:8px}
.bt-endpoint .bt-secret-field>svg{flex:none;color:var(--bt-ink-3)}
.bt-endpoint-models-head,.bt-endpoint-picks-head{display:flex;align-items:center;gap:8px}
.bt-endpoint-models-head .bt-secret-edit-label,.bt-endpoint-picks-head .bt-set-hint{flex:1}
.bt-endpoint-models{display:flex;flex-direction:column;gap:8px}
.bt-endpoint-found{max-height:180px;overflow-y:auto;scrollbar-width:thin}
.bt-endpoint-found code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}
.bt-endpoint-found .bt-secret-bot{padding:0 10px}
.bt-endpoint-more{display:flex;flex-direction:column;gap:8px}
.bt-endpoint-more>summary{width:max-content;font-size:12px;line-height:16px;color:var(--bt-ink-2);cursor:pointer;border-radius:4px}
.bt-endpoint-more>summary:focus-visible{outline:2px solid var(--bt-accent);outline-offset:2px}
.bt-endpoint-more[open]>summary{margin-bottom:8px}
.bt-endpoint-more[open]>.bt-endpoint-pair{animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards}
.bt-endpoint .bt-q-foot{flex-wrap:wrap;align-items:center}
.bt-endpoint .bt-q-submit:disabled,.bt-endpoint .bt-q-btn:disabled{opacity:.45;cursor:default}
@media (max-width:560px){.bt-endpoint-pair,.bt-endpoint .bt-endpoint-more .bt-endpoint-pair{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.bt-endpoint-more[open]>.bt-endpoint-pair{animation:none}}
`;

// src/client/model-menu.js
var import_react17 = require("react");
var import_react_dom6 = require("react-dom");
var MENU_EXIT_MS = 120;
var CONNECT_POLL_MS = 1500;
var CONNECT_TRIES = 8;
function groupModels(models) {
  const groups = /* @__PURE__ */ new Map();
  for (const model of models ?? []) {
    const provider = model.provider ?? model.providerName ?? model.ref.split("/")[0];
    if (!groups.has(provider)) groups.set(provider, []);
    groups.get(provider).push(model);
  }
  const names = /* @__PURE__ */ new Map();
  for (const [provider, list] of groups) {
    const name = list[0].providerName ?? provider;
    names.set(name, (names.get(name) ?? 0) + 1);
  }
  return [...groups].map(([provider, list]) => {
    const name = list[0].providerName ?? provider;
    return [names.get(name) > 1 ? `${name} (${provider})` : name, list];
  });
}
var servedOf = (roster, ref) => (roster.models ?? []).find((model) => model.ref === ref);
function modelOf(bot, roster) {
  const ref = bot.model ?? bot.appliedModel;
  if (!ref) return void 0;
  const served = servedOf(roster, ref);
  const [provider, ...rest] = ref.split("/");
  return { ref, name: served?.name ?? rest.join("/"), provider: served?.providerName ?? provider, served: served !== void 0, needsKey: served?.needsKey === true };
}
var choicesOf = (roster, current) => (roster.models ?? []).filter((model) => !model.needsKey || model.ref === current);
var effortCache = /* @__PURE__ */ new Map();
function useEfforts(served, ref, actions) {
  const [fetched, setFetched] = (0, import_react17.useState)(void 0);
  (0, import_react17.useEffect)(() => {
    setFetched(void 0);
    if (ref === void 0 || served?.reasoning !== void 0 || actions?.efforts === void 0) return void 0;
    let live = true;
    if (effortCache.has(ref)) setFetched(effortCache.get(ref));
    else void Promise.resolve(actions.efforts(ref)).then((value) => {
      const reasoning = value?.efforts ? value : null;
      effortCache.set(ref, reasoning);
      if (live) setFetched(reasoning);
    }).catch(() => {
    });
    return () => {
      live = false;
    };
  }, [ref, served?.reasoning !== void 0, actions]);
  return served?.reasoning ?? fetched;
}
function effortRows(reasoning) {
  if (reasoning?.efforts === void 0 || reasoning.efforts.length === 0) return [];
  return [
    { effort: void 0, label: t("Default") },
    ...reasoning.efforts.map((effort) => ({ effort: effort.id, label: effort.name }))
  ];
}
function EffortRows({ reasoning, current, onPick }) {
  return (0, import_react17.createElement)(
    import_react17.Fragment,
    null,
    (0, import_react17.createElement)("div", { className: "bt-menu-sep", role: "separator" }),
    (0, import_react17.createElement)("div", { className: "bt-model-group", role: "presentation" }, t("Thinking level")),
    effortRows(reasoning).map((row) => (0, import_react17.createElement)(
      "button",
      {
        key: row.effort ?? "default",
        type: "button",
        role: "menuitemradio",
        "aria-checked": row.effort === current,
        onClick: () => onPick(row.effort)
      },
      (0, import_react17.createElement)("span", { className: "bt-menu-label" }, row.label),
      (0, import_react17.createElement)("span", { className: "bt-model-tick", "aria-hidden": true }, row.effort === current ? (0, import_react17.createElement)(CheckIcon) : null)
    ))
  );
}
function ModelRows({ models, roster, current, onPick }) {
  return groupModels(models).map(([provider, list]) => (0, import_react17.createElement)(
    import_react17.Fragment,
    { key: list[0].provider ?? provider },
    (0, import_react17.createElement)("div", { className: "bt-model-group", role: "presentation" }, provider),
    list.map((model) => (0, import_react17.createElement)(
      "button",
      {
        key: model.ref,
        type: "button",
        role: "menuitemradio",
        "aria-checked": model.ref === current,
        title: model.ref,
        onClick: () => onPick(model.ref)
      },
      (0, import_react17.createElement)("span", { className: "bt-menu-label" }, model.name),
      model.ref === roster.defaultModel ? (0, import_react17.createElement)("span", { className: "bt-menu-hint" }, t("Default")) : null,
      (0, import_react17.createElement)("span", { className: "bt-model-tick", "aria-hidden": true }, model.ref === current ? (0, import_react17.createElement)(CheckIcon) : null)
    ))
  ));
}
var Caret = () => (0, import_react17.createElement)("svg", { className: "bt-model-caret", width: 12, height: 12, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true }, (0, import_react17.createElement)("path", { d: "M5.5 8l4.5 4.5L14.5 8" }));
function useAnchoredMenu() {
  const [place, setPlace] = (0, import_react17.useState)(null);
  const [shownPlace, leaving] = useLinger(place, MENU_EXIT_MS);
  const button = (0, import_react17.useRef)(null);
  const menu = (0, import_react17.useRef)(null);
  const close = () => setPlace(null);
  (0, import_react17.useEffect)(() => {
    if (place === null) return void 0;
    const onDown = (event) => {
      if (menu.current?.contains(event.target) || button.current?.contains(event.target)) return;
      close();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        button.current?.focus();
      }
    };
    const onScroll = (event) => {
      if (!menu.current?.contains(event.target)) close();
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [place]);
  const open = () => {
    const rect = button.current.getBoundingClientRect();
    const width = Math.max(240, rect.width);
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
    const below = window.innerHeight - rect.bottom;
    setPlace(below >= 260 || below >= rect.top ? { left, width, top: rect.bottom + 4, maxHeight: below - 16, "--bt-origin": "top right" } : { left, width, bottom: window.innerHeight - rect.top + 4, maxHeight: rect.top - 16, "--bt-origin": "bottom right" });
  };
  return { isOpen: place !== null, shownPlace, leaving, button, menu, open, close };
}
function ModelMenu({ bot, roster, actions, run, wide = false, onPick, onPickEffort }) {
  const { isOpen, shownPlace, leaving, button, menu, open, close } = useAnchoredMenu();
  const shown = modelOf(bot, roster);
  const current = bot.model ?? bot.appliedModel;
  const served = servedOf(roster, current);
  const reasoning = useEfforts(served, current, actions);
  const picked = reasoning?.efforts?.some((effort) => effort.id === bot.effort) ? bot.effort : void 0;
  const currentEffort = picked ?? reasoning?.defaultEffort;
  const effortLabel = currentEffort === void 0 ? reasoning?.efforts?.length > 0 ? t("Default") : void 0 : reasoning.efforts.find((effort) => effort.id === currentEffort)?.name ?? currentEffort;
  const toggle = () => {
    if (isOpen) {
      close();
      return;
    }
    void actions?.refreshModels?.();
    open();
  };
  const pick = (ref) => {
    close();
    if (onPick) onPick(ref);
    else if (ref !== current || !bot.model) void run(actions.updateBot(bot.id, { model: ref }));
  };
  const pickEffort = (effort) => {
    close();
    if (onPickEffort) onPickEffort(effort);
    else if (effort !== bot.effort) void run(actions.updateBot(bot.id, { effort: effort ?? null }));
  };
  const models = roster.models ?? [];
  const choices = choicesOf(roster, current);
  const manage = manageModels(actions);
  const missing = shown !== void 0 && (!shown.served && models.length > 0 || shown.needsKey);
  const providerLine = shown === void 0 ? void 0 : shown.needsKey ? t("{provider} · needs an API key", { provider: shown.provider }) : shown.served || models.length === 0 ? effortLabel === void 0 ? shown.provider : `${shown.provider} · ${effortLabel}` : t("{provider} · not available", { provider: shown.provider });
  return (0, import_react17.createElement)(
    import_react17.Fragment,
    null,
    (0, import_react17.createElement)(
      "button",
      {
        ref: button,
        type: "button",
        className: "bt-model-trigger",
        "data-wide": wide || void 0,
        "aria-haspopup": "menu",
        "aria-expanded": isOpen,
        "aria-label": t("Model: {model}", { model: shown?.name ?? t("none") }),
        "data-missing": missing ? "" : void 0,
        onClick: toggle
      },
      (0, import_react17.createElement)(
        "span",
        { className: "bt-model-copy" },
        (0, import_react17.createElement)("span", { className: "bt-model-name" }, shown?.name ?? t("Choose a model")),
        providerLine === void 0 ? null : (0, import_react17.createElement)("span", { className: "bt-model-provider" }, providerLine)
      ),
      (0, import_react17.createElement)(Caret)
    ),
    shownPlace ? (0, import_react_dom6.createPortal)((0, import_react17.createElement)(
      "div",
      { ref: menu, className: `bt-menu bt-model-menu${shownPlace.bottom !== void 0 ? " bt-menu-up" : ""}`, role: "menu", "aria-label": t("Model for {name}", { name: bot.name }), style: shownPlace, "data-leaving": leaving || void 0 },
      choices.length > 0 ? (0, import_react17.createElement)(ModelRows, { models: choices, roster, current, onPick: pick }) : (0, import_react17.createElement)("div", { className: "bt-model-none" }, t("No model is ready yet. Connect a model provider first.")),
      effortRows(reasoning).length > 0 ? (0, import_react17.createElement)(EffortRows, { reasoning, current: picked, onPick: pickEffort }) : null,
      manage ? (0, import_react17.createElement)("div", { className: "bt-menu-sep", role: "separator" }) : null,
      manage ? (0, import_react17.createElement)("button", { type: "button", role: "menuitem", onClick: () => {
        close();
        manage();
      } }, (0, import_react17.createElement)(SlidersIcon), (0, import_react17.createElement)("span", { className: "bt-menu-label" }, t("Models and providers…"))) : null
    ), document.body) : null
  );
}
function ModelChoiceDock({ sessionId, useRoster, actions }) {
  const roster = useRoster((value) => value);
  const bot = roster.byId[sessionId];
  const [busy, setBusy] = (0, import_react17.useState)("");
  const [error, setError] = (0, import_react17.useState)("");
  const shown = Boolean(bot) && currentPart(bot) === sessionId && roster.ready;
  (0, import_react17.useEffect)(() => {
    if (shown) void actions.refreshModels?.();
  }, [shown, sessionId]);
  if (!bot || currentPart(bot) !== sessionId || !roster.ready) return null;
  const models = roster.models ?? [];
  const usable = models.filter((model) => !model.needsKey);
  const lost = bot.model ? !models.some((model) => model.ref === bot.model) : false;
  if (bot.model && (!lost || models.length === 0)) return null;
  const connect = usable.length === 0 && roster.providerSetup === true && actions.addProvider !== void 0;
  const manage = manageModels(actions);
  const pick = (ref) => {
    setBusy(ref);
    setError("");
    void Promise.resolve(actions.updateBot(bot.id, { model: ref })).catch((failure) => {
      setError(failure?.message ?? String(failure));
      void actions.refreshModels?.();
    }).finally(() => setBusy(""));
  };
  const text = lost ? t("{model} is not available anymore. Pick another model for me.", { model: bot.model.split("/").slice(1).join("/") }) : connect ? t("Hi, I'm {name}. Connect me to a model first: enter your provider's endpoint and API key.", { name: bot.name }) : usable.length === 0 ? t("Hi, I'm {name}. I don't have a model yet. How do you want to set one up?", { name: bot.name }) : t("Hi, I'm {name}. Pick a model for me first. You can change it later in my details.", { name: bot.name });
  const choices = usable.length === 0 ? setupChoices(actions).map(([label, run]) => (0, import_react17.createElement)("button", { key: label, type: "button", className: "bt-model-chip", onClick: run }, label)) : [
    ...groupModels(usable).map(([provider, list]) => (0, import_react17.createElement)(
      "div",
      { key: list[0].provider ?? provider, className: "bt-model-choice-group", role: "group", "aria-label": provider },
      (0, import_react17.createElement)("div", { className: "bt-model-choice-provider", "aria-hidden": true }, provider),
      (0, import_react17.createElement)("div", { className: "bt-model-choice-chips" }, list.map((model) => (0, import_react17.createElement)("button", {
        key: model.ref,
        type: "button",
        className: "bt-model-chip",
        disabled: busy !== "",
        "aria-busy": busy === model.ref || void 0,
        "aria-label": `${model.name} · ${provider}`,
        title: model.ref === roster.defaultModel ? `${model.ref} · ${t("Engine default")}` : model.ref,
        onClick: () => pick(model.ref)
      }, model.name, busy === model.ref ? (0, import_react17.createElement)("span", { className: "bt-model-spin", "aria-label": t("Saving…") }) : null)))
    )),
    manage ? (0, import_react17.createElement)("button", { key: "manage", type: "button", className: "bt-model-chip bt-model-chip-quiet", onClick: manage }, (0, import_react17.createElement)(SlidersIcon), t("Manage models")) : null
  ];
  return (0, import_react17.createElement)(
    "div",
    { className: "bt-model-dock" },
    (0, import_react17.createElement)(
      "div",
      { className: "bt-astack", "data-lead": "" },
      (0, import_react17.createElement)(
        "div",
        { className: "bt-msg" },
        (0, import_react17.createElement)(
          "div",
          { className: "bt-msg-line" },
          (0, import_react17.createElement)(BotMark, { bot, size: 22 }),
          (0, import_react17.createElement)("div", { className: "bt-bubble" }, text)
        )
      )
    ),
    connect ? (0, import_react17.createElement)(ConnectCard, { actions }) : (0, import_react17.createElement)("div", { className: "bt-model-chips", role: "group", "aria-label": t("Choose a model") }, choices),
    error ? (0, import_react17.createElement)("div", { className: "bt-secret-error bt-model-error", role: "alert" }, error) : null
  );
}
function ConnectCard({ actions }) {
  const [connected, setConnected] = (0, import_react17.useState)(0);
  const [late, setLate] = (0, import_react17.useState)(false);
  (0, import_react17.useEffect)(() => {
    if (connected === 0) return void 0;
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      void actions.refreshModels?.();
      if (tries >= CONNECT_TRIES) {
        clearInterval(timer);
        setLate(true);
      }
    }, CONNECT_POLL_MS);
    return () => clearInterval(timer);
  }, [connected]);
  const label = t("Connect a model provider");
  const others = actions.openModels ? [[t("More providers"), actions.openModels]] : [];
  const again = () => {
    setLate(false);
    setConnected(0);
  };
  return (0, import_react17.createElement)(
    "div",
    { className: "bt-q bt-model-key bt-model-connect", role: "group", "aria-label": label },
    (0, import_react17.createElement)("div", { className: "bt-model-key-title" }, (0, import_react17.createElement)(KeyIcon), label),
    connected === 0 ? [
      (0, import_react17.createElement)("div", { key: "about", className: "bt-set-hint" }, t("Any OpenAI- or Anthropic-compatible API. The key stays on this machine and is never shown again.")),
      (0, import_react17.createElement)(EndpointForm, {
        key: "form",
        actions,
        variant: "card",
        autoFocus: true,
        submitLabel: t("Connect"),
        busyLabel: t("Connecting…"),
        onAdded: () => setConnected(Date.now()),
        extra: others.map(([text, run]) => (0, import_react17.createElement)("button", { key: text, type: "button", className: "bt-q-btn bt-model-key-other", onClick: run }, text))
      })
    ] : late ? [
      (0, import_react17.createElement)("div", { key: "late", className: "bt-set-hint", role: "status" }, t("The provider is saved, but none of its models is ready yet. Check its endpoint, key and models in Settings → Models.")),
      (0, import_react17.createElement)(
        "div",
        { key: "foot", className: "bt-q-foot" },
        actions.openModels ? (0, import_react17.createElement)("button", { type: "button", className: "bt-q-btn bt-model-key-other", onClick: actions.openModels }, t("Models and providers…")) : null,
        (0, import_react17.createElement)("button", { type: "button", className: "bt-q-btn", onClick: again }, t("Connect another"))
      )
    ] : (0, import_react17.createElement)("div", { className: "bt-model-connecting", role: "status" }, (0, import_react17.createElement)("span", { className: "bt-model-spin", "aria-hidden": true }), t("Connected. Loading its models…"))
  );
}
var manageModels = (actions) => actions.openModels ?? actions.openEngineSettings;
function setupChoices(actions) {
  return actions.openEngineSettings ? [[t("Open settings to set up a custom model"), actions.openEngineSettings]] : [];
}
var MODEL_CSS = `
.bt-model-trigger{display:inline-flex;align-items:center;gap:8px;max-width:100%;min-width:0;height:auto;min-height:32px;padding:4px 8px 4px 10px;border:0;border-radius:8px;background:var(--bt-hover);color:var(--bt-ink);font:inherit;text-align:left;cursor:pointer;transition:background-color .12s ease}
.bt-model-trigger:hover,.bt-model-trigger[aria-expanded=true]{background:var(--bt-active)}
.bt-model-trigger:focus-visible{outline:2px solid var(--bt-accent);outline-offset:1px}
.bt-model-trigger[data-missing] .bt-model-provider{color:var(--bt-danger)}
.bt-model-trigger[data-wide]{display:flex;width:100%;min-height:48px;padding:7px 12px;justify-content:space-between;border-radius:12px;background:var(--bt-card);box-shadow:inset 0 0 0 1px var(--bt-line)}
.bt-model-trigger[data-wide]:hover,.bt-model-trigger[data-wide][aria-expanded=true]{background:var(--bt-hover)}
.bt-model-copy{display:flex;flex-direction:column;min-width:0}
.bt-model-name{font-size:13px;line-height:18px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-model-provider{font-size:11px;line-height:14px;color:var(--bt-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-model-caret{flex:none;color:var(--bt-ink-3);transition:${spring(SPRING_SHAPE, "transform")}}
.bt-model-trigger[aria-expanded=true] .bt-model-caret{transform:rotate(180deg)}
.bt-model-menu{overflow-y:auto;scrollbar-width:thin}
.bt-model-group{flex:none;padding:8px 8px 2px;font-size:11px;line-height:14px;font-weight:500;color:var(--bt-ink-3);text-transform:none}
.bt-model-group:first-child{padding-top:2px}
.bt-model-tick{flex:none;width:16px;height:16px;display:inline-flex;color:var(--bt-ink-2)}
.bt-model-tick svg{animation:bt-check-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing} 60ms backwards}
.bt-model-none{padding:8px;font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-model-dock{width:100%;max-width:var(--dsh-chat-content-width,748px);margin:0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:8px;padding:0 0 10px;box-sizing:border-box;animation:bt-model-in ${SPRING_POP.duration}ms ${SPRING_POP.easing} backwards}
.bt-model-chips{display:flex;flex-wrap:wrap;gap:6px;margin-left:30px;max-width:min(560px,calc(100% - 30px));max-height:min(240px,36vh);overflow-y:auto;scrollbar-width:thin}
.bt-model-choice-group{display:flex;flex-direction:column;gap:6px;width:100%;min-width:0}
.bt-model-choice-provider{padding-top:4px;font-size:12px;line-height:16px;font-weight:500;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-model-choice-chips{display:flex;flex-wrap:wrap;gap:6px}
.bt-model-chip{display:inline-flex;align-items:center;gap:6px;min-height:30px;padding:5px 12px;border:.5px solid var(--bt-line-2);border-radius:999px;background:var(--bt-surface,transparent);color:var(--bt-ink);font:inherit;font-size:13px;line-height:18px;cursor:pointer;transition:background-color .12s ease,border-color .12s ease}
.bt-model-chip:hover:not(:disabled){background:var(--bt-hover)}
.bt-model-chip:focus-visible{outline:2px solid var(--bt-accent);outline-offset:1px}
.bt-model-chip-quiet{color:var(--bt-ink-2)}
.bt-model-chip svg{width:14px;height:14px}
.bt-model-chip:disabled{cursor:default}
.bt-model-chip:disabled:not([aria-busy]){opacity:.5}
.bt-model-error{margin-left:30px}
.bt-q.bt-model-key{margin:0 0 0 30px;width:min(480px,calc(100% - 30px));gap:10px}
.bt-model-key-title{display:flex;align-items:center;gap:6px;font-size:13px;line-height:18px;font-weight:500;color:var(--bt-ink-2)}
.bt-model-key-title svg{flex:none;width:16px;height:16px}
.bt-model-key .bt-q-foot{margin-top:2px}
.bt-model-key-other{margin-right:auto}
.bt-q.bt-model-connect{width:min(560px,calc(100% - 30px))}
.bt-model-connect .bt-model-key-other+.bt-model-key-other{margin-right:0}
.bt-model-connecting{display:flex;align-items:center;gap:8px;font-size:13px;line-height:18px;color:var(--bt-ink-2)}
@keyframes bt-model-in{from{opacity:0;transform:translateY(6px)}}
.bt-model-spin{flex:none;width:14px;height:14px;border-radius:50%;border:1.5px solid var(--bt-line-2);border-top-color:var(--bt-ink-2);animation:bt-model-spin .7s linear infinite}
@keyframes bt-model-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bt-model-dock{animation:none}.bt-model-spin{animation-duration:2s}.bt-model-caret{transition:none}.bt-model-tick svg{animation:none}}
`;

// src/client/folder-menu.js
var import_react18 = require("react");
var import_react_dom7 = require("react-dom");
var folderName = (path) => String(path).replace(/[\\/]+$/, "").split(/[\\/]/).pop() || String(path);
var Tick = ({ on }) => (0, import_react18.createElement)("span", { className: "bt-model-tick", "aria-hidden": true }, on ? (0, import_react18.createElement)(CheckIcon) : null);
function FolderMenu({ value, group = false, team = false, actions, run, onPick, wide = false, disabled = false }) {
  const { isOpen, shownPlace, leaving, button, menu, open, close } = useAnchoredMenu();
  const [info, setInfo] = (0, import_react18.useState)(null);
  const [view, setView] = (0, import_react18.useState)("list");
  const [draft, setDraft] = (0, import_react18.useState)("");
  const [listing, setListing] = (0, import_react18.useState)(null);
  const [problem, setProblem] = (0, import_react18.useState)("");
  const fallback = group ? t("Each Bot's own folder") : t("Team workspace");
  const toggle = () => {
    if (isOpen) {
      close();
      return;
    }
    setView("list");
    setProblem("");
    void Promise.resolve(actions.folders()).then(setInfo).catch(() => setInfo((last) => last ?? { team: null, picker: null, folders: [] }));
    open();
  };
  const choose = (path) => {
    close();
    if (path !== (value ?? "")) void onPick(path);
  };
  const browse = (path) => {
    setProblem("");
    void Promise.resolve(actions.folderList(path)).then((next) => {
      setListing(next);
      setView("browse");
    }).catch((failure) => setProblem(failure?.message ?? String(failure)));
  };
  const pickNative = () => {
    close();
    void run(Promise.resolve(actions.folderPick()).then((path) => path ? onPick(path) : void 0));
  };
  const typed = () => {
    const path = draft.trim();
    if (path !== "") choose(path);
  };
  const known = info?.folders ?? [];
  const folders = value && !known.some((folder) => folder.path === value) ? [{ path: value, title: folderName(value) }, ...known] : known;
  const listView = (0, import_react18.createElement)(
    "div",
    { key: "list", className: "bt-folder-view" },
    team ? null : (0, import_react18.createElement)(
      "button",
      { type: "button", role: "menuitemradio", "aria-checked": !value, title: group ? void 0 : info?.team ?? void 0, onClick: () => choose("") },
      (0, import_react18.createElement)("span", { className: "bt-menu-label" }, fallback),
      (0, import_react18.createElement)(Tick, { on: !value })
    ),
    folders.length > 0 ? (0, import_react18.createElement)("div", { className: "bt-model-group", role: "presentation" }, t("Folders")) : null,
    folders.map((folder) => (0, import_react18.createElement)(
      "button",
      { key: folder.path, type: "button", role: "menuitemradio", "aria-checked": folder.path === value, title: folder.path, onClick: () => choose(folder.path) },
      (0, import_react18.createElement)("span", { className: "bt-folder-copy" }, (0, import_react18.createElement)("span", { className: "bt-menu-label" }, folder.title), (0, import_react18.createElement)("span", { className: "bt-folder-path" }, folder.path)),
      (0, import_react18.createElement)(Tick, { on: folder.path === value })
    )),
    (0, import_react18.createElement)("div", { className: "bt-menu-sep", role: "separator" }),
    info?.picker === "native" ? (0, import_react18.createElement)("button", { type: "button", role: "menuitem", onClick: pickNative }, (0, import_react18.createElement)(FolderIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Choose a folder…"))) : null,
    info?.picker === "browse" ? (0, import_react18.createElement)("button", { type: "button", role: "menuitem", onClick: () => browse(value) }, (0, import_react18.createElement)(FolderIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Browse folders…"))) : null,
    (0, import_react18.createElement)("button", { type: "button", role: "menuitem", onClick: () => {
      setDraft(value ?? "");
      setView("type");
    } }, (0, import_react18.createElement)(PencilIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Enter a path…")))
  );
  const typeView = (0, import_react18.createElement)(
    "div",
    { key: "type", className: "bt-folder-view" },
    (0, import_react18.createElement)("button", { type: "button", className: "bt-folder-back", onClick: () => setView("list") }, (0, import_react18.createElement)(ChevronLeftIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Back"))),
    (0, import_react18.createElement)("input", {
      className: "bt-folder-input",
      autoFocus: true,
      value: draft,
      spellCheck: false,
      "aria-label": t("Folder path"),
      placeholder: t("Full path of a folder"),
      onChange: (event) => setDraft(event.target.value),
      onKeyDown: (event) => {
        if (event.key === "Enter" && !event.nativeEvent.isComposing) typed();
      }
    }),
    (0, import_react18.createElement)("button", { type: "button", className: "bt-folder-use", disabled: draft.trim() === "", onClick: typed }, t("Use this folder"))
  );
  const parent = listing?.crumbs?.length > 1 ? listing.crumbs.at(-2) : void 0;
  const inside = listing?.entries?.filter((entry) => !entry.hidden) ?? [];
  const browseView = listing ? (0, import_react18.createElement)(
    "div",
    { key: `browse:${listing.path}`, className: "bt-folder-view" },
    (0, import_react18.createElement)("button", { type: "button", className: "bt-folder-back", onClick: () => setView("list") }, (0, import_react18.createElement)(ChevronLeftIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Back"))),
    (0, import_react18.createElement)("div", { className: "bt-folder-path bt-folder-here" }, listing.path),
    parent ? (0, import_react18.createElement)("button", { type: "button", role: "menuitem", title: parent.path, onClick: () => browse(parent.path) }, (0, import_react18.createElement)(FolderIcon), (0, import_react18.createElement)("span", { className: "bt-menu-label" }, t("Up one level"))) : null,
    inside.map((entry) => (0, import_react18.createElement)(
      "button",
      { key: entry.path, type: "button", role: "menuitem", onClick: () => browse(entry.path) },
      (0, import_react18.createElement)(FolderIcon),
      (0, import_react18.createElement)("span", { className: "bt-menu-label" }, entry.name),
      (0, import_react18.createElement)(ChevronRightIcon)
    )),
    inside.length === 0 ? (0, import_react18.createElement)("div", { className: "bt-model-none" }, t("No folders inside.")) : null,
    listing.truncated ? (0, import_react18.createElement)("div", { className: "bt-folder-path bt-folder-here" }, t("Some folders are not shown.")) : null,
    (0, import_react18.createElement)("div", { className: "bt-menu-sep", role: "separator" }),
    (0, import_react18.createElement)("button", { type: "button", className: "bt-folder-use", onClick: () => choose(listing.path) }, t("Use this folder"))
  ) : null;
  const shownView = view === "type" ? typeView : view === "browse" && browseView ? browseView : listView;
  return (0, import_react18.createElement)(
    import_react18.Fragment,
    null,
    (0, import_react18.createElement)(
      "button",
      {
        ref: button,
        type: "button",
        className: "bt-model-trigger",
        "data-wide": wide || void 0,
        "aria-haspopup": "menu",
        "aria-expanded": isOpen,
        "aria-label": team ? t("Team workspace: {folder}", { folder: value ?? "" }) : t("Working folder: {folder}", { folder: value ?? fallback }),
        title: value,
        onClick: toggle,
        disabled
      },
      (0, import_react18.createElement)(
        "span",
        { className: "bt-model-copy" },
        (0, import_react18.createElement)("span", { className: "bt-model-name" }, value ? folderName(value) : fallback),
        value ? (0, import_react18.createElement)("span", { className: "bt-model-provider" }, value) : null
      ),
      (0, import_react18.createElement)(Caret)
    ),
    shownPlace ? (0, import_react_dom7.createPortal)((0, import_react18.createElement)(
      "div",
      { ref: menu, className: `bt-menu bt-model-menu bt-folder-menu${shownPlace.bottom !== void 0 ? " bt-menu-up" : ""}`, role: "menu", "aria-label": team ? t("Team workspace") : t("Working folder"), style: shownPlace, "data-leaving": leaving || void 0 },
      shownView,
      problem ? (0, import_react18.createElement)("div", { className: "bt-folder-error", role: "alert" }, problem) : null
    ), document.body) : null
  );
}
var FOLDER_CSS = `
.bt-folder-view{display:flex;flex-direction:column;gap:2px;animation:bt-veil-in .14s ease-out}
.bt-folder-copy{flex:1;display:flex;flex-direction:column;min-width:0}
.bt-folder-copy .bt-menu-label{flex:none}
.bt-folder-path{min-width:0;font-size:11px;line-height:14px;color:var(--bt-ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-folder-here{padding:0 8px 4px;white-space:normal;overflow-wrap:anywhere}
.bt-menu .bt-folder-back{color:var(--bt-ink-2);font-weight:500}
.bt-folder-input{height:30px;margin:2px 4px;padding:0 8px;border:1px solid var(--bt-line-2);border-radius:8px;background:var(--bt-main);color:var(--bt-ink);font:inherit;font-size:13px;outline:none;box-sizing:border-box}
.bt-folder-input:focus{border-color:var(--bt-accent)}
.bt-menu .bt-folder-use{justify-content:center;font-weight:500;color:var(--bt-accent)}
.bt-menu .bt-folder-use:disabled{color:var(--bt-ink-3);cursor:default;background:none}
.bt-model-trigger:disabled{opacity:.6;cursor:default}
.bt-folder-error{padding:4px 8px;font-size:12px;line-height:16px;color:var(--bt-danger);overflow-wrap:anywhere}
@media (prefers-reduced-motion:reduce){.bt-folder-view{animation:none}}
`;

// src/client/schedules.js
var import_react19 = require("react");
var POLL_MS = 3e4;
var shared = null;
var listeners = /* @__PURE__ */ new Set();
function publish(view) {
  shared = view;
  for (const listener of listeners) listener(view);
}
function useSchedules(actions) {
  const [view, setView] = (0, import_react19.useState)(shared);
  (0, import_react19.useEffect)(() => {
    listeners.add(setView);
    let stopped = false;
    let timer;
    const load = () => actions.schedules?.().then((next) => {
      if (!stopped) publish(next);
    }).catch(() => {
    }).finally(() => {
      if (!stopped) timer = setTimeout(load, POLL_MS);
    });
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
      listeners.delete(setView);
    };
  }, []);
  return view;
}
var localZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
var clock2 = (time) => String(time ?? "").slice(0, 5);
var when2 = (ms, options) => new Intl.DateTimeFormat(dateLocale(), options).format(ms);
function dayAndTime(ms) {
  const sameYear = new Date(ms).getFullYear() === (/* @__PURE__ */ new Date()).getFullYear();
  return when2(ms, { ...sameYear ? {} : { year: "numeric" }, month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function weekdayNames(days) {
  const names = days.map((day) => when2(Date.UTC(2024, 0, day), { weekday: "short", timeZone: "UTC" }));
  return names.join(", ");
}
function everyText(seconds) {
  if (seconds % 86400 === 0) return seconds === 86400 ? t("Every day") : t("Every {count} days", { count: seconds / 86400 });
  if (seconds % 3600 === 0) return seconds === 3600 ? t("Every hour") : t("Every {count} hours", { count: seconds / 3600 });
  return t("Every {count} minutes", { count: Math.round(seconds / 60) });
}
function timingText(task) {
  const zone = task.timeZone && task.timeZone !== localZone() ? ` (${task.timeZone})` : "";
  switch (task.kind) {
    case "after":
    case "at":
      return t("Once, {time}", { time: dayAndTime(Date.parse(task.scheduledAt)) });
    case "every":
      return everyText(task.everySeconds);
    case "daily":
      return `${t("Every day at {time}", { time: clock2(task.time) })}${zone}`;
    case "weekly": {
      const days = (task.weekdays ?? []).join();
      const text = days === "1,2,3,4,5" ? t("Every weekday at {time}", { time: clock2(task.time) }) : days === "6,7" ? t("Every weekend at {time}", { time: clock2(task.time) }) : days === "1,2,3,4,5,6,7" ? t("Every day at {time}", { time: clock2(task.time) }) : t("Every {days} at {time}", { days: weekdayNames(task.weekdays ?? []), time: clock2(task.time) });
      return `${text}${zone}`;
    }
    case "cron":
      return `${t("On the schedule {expression}", { expression: task.expression })}${zone}`;
    default:
      return "";
  }
}
var nextText = (task) => task.status === "active" ? t("Next: {time}", { time: dayAndTime(Date.parse(task.scheduledAt)) }) : t("Finished");
function TaskRow({ task, actions, onView, showBot, roster }) {
  const [confirming, setConfirming] = (0, import_react19.useState)(false);
  const [busy, setBusy] = (0, import_react19.useState)(false);
  (0, import_react19.useEffect)(() => {
    if (!confirming) return void 0;
    const timer = setTimeout(() => setConfirming(false), 3e3);
    return () => clearTimeout(timer);
  }, [confirming]);
  const remove = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    void actions.scheduleDelete(task.sessionId, task.id).then(onView, () => setBusy(false));
  };
  const room2 = task.roomId ? roster.roomsById[task.roomId] : void 0;
  return (0, import_react19.createElement)(
    "div",
    { className: "bt-set-row bt-task", "data-done": task.status === "active" ? void 0 : "", "data-busy": busy || void 0 },
    showBot ? (0, import_react19.createElement)(BotAvatar, { bot: roster.byId[task.botId], size: 28, badge: false, live: false }) : null,
    (0, import_react19.createElement)(
      "span",
      { className: "bt-set-copy" },
      (0, import_react19.createElement)("span", { className: "bt-task-title" }, task.title),
      (0, import_react19.createElement)("span", { className: "bt-set-hint" }, [timingText(task), room2 ? t("in {name}", { name: room2.name }) : ""].filter(Boolean).join(" · ")),
      task.prompt && task.prompt !== task.title ? (0, import_react19.createElement)("span", { className: "bt-task-prompt" }, task.prompt) : null
    ),
    (0, import_react19.createElement)("span", { className: "bt-task-next" }, nextText(task)),
    (0, import_react19.createElement)("button", {
      type: "button",
      className: "bt-mini bt-task-remove",
      "data-confirm": confirming || void 0,
      disabled: busy,
      "aria-label": confirming ? t("Click again to delete") : t("Delete task"),
      title: confirming ? void 0 : t("Delete task"),
      onClick: remove
    }, confirming ? t("Delete") : (0, import_react19.createElement)(TrashIcon))
  );
}
var pad = (number) => String(number).padStart(2, "0");
function inAnHour() {
  const date = new Date(Date.now() + 36e5);
  date.setMinutes(0, 0, 0);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:00`;
}
var KINDS = [["at", "Once"], ["daily", "Every day"], ["weekly", "Every week"], ["every", "Repeat"]];
var UNITS = [["minutes", 1, "minutes"], ["hours", 60, "hours"], ["days", 1440, "days"]];
function TaskForm({ roster, actions, start, onDone, onCancel }) {
  const [target, setTarget] = (0, import_react19.useState)(start ?? roster.bots[0]?.id ?? "");
  const [title, setTitle] = (0, import_react19.useState)("");
  const [prompt, setPrompt] = (0, import_react19.useState)("");
  const [kind, setKind] = (0, import_react19.useState)("daily");
  const [at2, setAt] = (0, import_react19.useState)(inAnHour);
  const [time, setTime] = (0, import_react19.useState)("09:00");
  const [weekdays, setWeekdays] = (0, import_react19.useState)([1, 2, 3, 4, 5]);
  const [count, setCount] = (0, import_react19.useState)(1);
  const [unit, setUnit] = (0, import_react19.useState)("hours");
  const [busy, setBusy] = (0, import_react19.useState)(false);
  const [error, setError] = (0, import_react19.useState)("");
  const timing = () => {
    if (kind === "at") return { kind, at: new Date(at2).toISOString() };
    if (kind === "every") return { kind, minutes: Math.round(Number(count) * UNITS.find(([id]) => id === unit)[1]) };
    return { kind, time, timeZone: localZone(), ...kind === "weekly" ? { weekdays } : {} };
  };
  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    let when3;
    try {
      when3 = timing();
    } catch {
      setError(t("Pick a date and time"));
      setBusy(false);
      return;
    }
    void actions.scheduleCreate({ target, title, prompt, when: when3 }).then(onDone, (failure) => {
      setError(hostText(failure?.message ?? String(failure)));
      setBusy(false);
    });
  };
  const toggleDay = (day) => setWeekdays((days) => days.includes(day) ? days.filter((item) => item !== day) : [...days, day].sort());
  return (0, import_react19.createElement)(
    "form",
    { className: "bt-set-card bt-task-form", onSubmit: submit },
    (0, import_react19.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row" },
      (0, import_react19.createElement)("span", { className: "bt-set-copy" }, (0, import_react19.createElement)("span", { className: "bt-bs-label" }, t("Send to"))),
      (0, import_react19.createElement)(
        "select",
        { className: "bt-select bt-task-bot", value: target, onChange: (event) => setTarget(event.target.value) },
        (0, import_react19.createElement)("optgroup", { label: t("Bots") }, roster.bots.map((bot) => (0, import_react19.createElement)("option", { key: bot.id, value: bot.id }, bot.name))),
        roster.rooms.length > 0 ? (0, import_react19.createElement)("optgroup", { label: t("Group chats") }, roster.rooms.map((room2) => (0, import_react19.createElement)("option", { key: room2.id, value: room2.id }, room2.name))) : null
      )
    ),
    (0, import_react19.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row" },
      (0, import_react19.createElement)("span", { className: "bt-set-copy" }, (0, import_react19.createElement)("span", { className: "bt-bs-label" }, t("Name"))),
      (0, import_react19.createElement)("input", { className: "bt-bs-input", value: title, maxLength: 120, placeholder: t("Morning briefing"), autoFocus: true, onChange: (event) => setTitle(event.target.value) })
    ),
    (0, import_react19.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row bt-bs-stack" },
      (0, import_react19.createElement)("span", { className: "bt-set-copy" }, (0, import_react19.createElement)("span", { className: "bt-bs-label" }, t("What to do"))),
      (0, import_react19.createElement)("textarea", { className: "bt-bs-input bt-bs-area", value: prompt, rows: 3, placeholder: t("Sum up what changed since yesterday and what needs me today."), onChange: (event) => setPrompt(event.target.value) })
    ),
    (0, import_react19.createElement)(
      "div",
      { className: "bt-set-row bt-bs-row bt-bs-stack" },
      (0, import_react19.createElement)("span", { className: "bt-set-copy" }, (0, import_react19.createElement)("span", { className: "bt-bs-label" }, t("When"))),
      (0, import_react19.createElement)(Segmented, { label: t("When"), value: kind }, KINDS.map(([id, label]) => (0, import_react19.createElement)("button", { key: id, type: "button", "aria-pressed": kind === id, onClick: () => setKind(id) }, t(label)))),
      (0, import_react19.createElement)(
        "div",
        { key: kind, className: "bt-task-when bt-veil" },
        kind === "at" ? (0, import_react19.createElement)("input", { className: "bt-input", type: "datetime-local", value: at2, "aria-label": t("Date and time"), onChange: (event) => setAt(event.target.value) }) : null,
        kind === "weekly" ? (0, import_react19.createElement)("div", { className: "bt-task-days", role: "group", "aria-label": t("Days") }, [1, 2, 3, 4, 5, 6, 7].map((day) => (0, import_react19.createElement)("button", {
          key: day,
          type: "button",
          className: "bt-task-day",
          "aria-pressed": weekdays.includes(day),
          onClick: () => toggleDay(day)
        }, when2(Date.UTC(2024, 0, day), { weekday: "narrow", timeZone: "UTC" })))) : null,
        kind === "daily" || kind === "weekly" ? (0, import_react19.createElement)("input", { className: "bt-input bt-task-time", type: "time", value: time, "aria-label": t("Time"), onChange: (event) => setTime(event.target.value) }) : null,
        kind === "every" ? (0, import_react19.createElement)(
          import_react19.Fragment,
          null,
          (0, import_react19.createElement)("span", { className: "bt-task-every" }, t("Every")),
          (0, import_react19.createElement)("input", { className: "bt-input bt-task-count", type: "number", min: 1, value: count, "aria-label": t("How many"), onChange: (event) => setCount(event.target.value) }),
          (0, import_react19.createElement)(
            "select",
            { className: "bt-select bt-task-unit", value: unit, "aria-label": t("Unit"), onChange: (event) => setUnit(event.target.value) },
            UNITS.map(([id, , label]) => (0, import_react19.createElement)("option", { key: id, value: id }, t(label)))
          )
        ) : null
      )
    ),
    error ? (0, import_react19.createElement)("div", { className: "bt-set-row" }, (0, import_react19.createElement)("span", { className: "bt-danger bt-set-hint" }, error)) : null,
    (0, import_react19.createElement)(
      "div",
      { className: "bt-set-row bt-task-foot" },
      (0, import_react19.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onCancel }, t("Cancel")),
      (0, import_react19.createElement)("button", { type: "submit", className: "bt-send bt-soft-sm", disabled: busy || !target || title.trim() === "" || prompt.trim() === "" }, busy ? t("Creating…") : t("Create task"))
    )
  );
}
function AutomationOff({ actions }) {
  return (0, import_react19.createElement)(
    "div",
    { className: "bt-set-card bt-task-off" },
    (0, import_react19.createElement)("span", { className: "bt-task-off-mark" }, (0, import_react19.createElement)(ClockIcon)),
    (0, import_react19.createElement)("span", { className: "bt-task-off-title" }, t("Turn on Automation tasks in the engine settings")),
    (0, import_react19.createElement)("span", { className: "bt-set-hint" }, t("Switch on Automation tasks on the Plugins page in Engine settings.")),
    actions.openEngineSettings ? (0, import_react19.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: actions.openEngineSettings }, t("Open Engine settings")) : null
  );
}
function SchedulesPage({ roster, actions, start }) {
  const view = useSchedules(actions);
  const [adding, setAdding] = (0, import_react19.useState)(Boolean(start));
  if (view === null) return (0, import_react19.createElement)("div", { className: "bt-set-hint" }, t("Loading…"));
  if (!view.available) return (0, import_react19.createElement)(AutomationOff, { actions });
  const shown = (next) => {
    publish(next);
    setAdding(false);
  };
  const byChat = [
    ...roster.bots.map((bot) => [bot.id, (0, import_react19.createElement)(BotAvatar, { bot, size: 18, badge: false, live: false }), bot.name, view.tasks.filter((task) => task.botId === bot.id)]),
    ...roster.rooms.map((room2) => [room2.id, (0, import_react19.createElement)(RoomAvatar, { room: room2, roster, size: 18 }), room2.name, view.tasks.filter((task) => task.botId === void 0 && task.roomId === room2.id)])
  ].filter(([, , , tasks]) => tasks.length > 0);
  return [
    adding ? (0, import_react19.createElement)(TaskForm, { key: "form", roster, actions, start, onDone: shown, onCancel: () => setAdding(false) }) : (0, import_react19.createElement)("div", { key: "add", className: "bt-actions" }, (0, import_react19.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-with-icon", onClick: () => setAdding(true) }, (0, import_react19.createElement)(PlusIcon), t("New task"))),
    byChat.length === 0 && !adding ? (0, import_react19.createElement)("div", { key: "none", className: "bt-set-card" }, (0, import_react19.createElement)("div", { className: "bt-set-row" }, (0, import_react19.createElement)("span", { className: "bt-set-hint" }, t("No scheduled tasks yet.")))) : byChat.map(([id, avatar, name, tasks]) => (0, import_react19.createElement)(
      "section",
      { key: id, className: "bt-set-section" },
      (0, import_react19.createElement)("h3", { className: "bt-task-head" }, avatar, name),
      (0, import_react19.createElement)("div", { className: "bt-set-card" }, tasks.map((task) => (0, import_react19.createElement)(TaskRow, { key: task.id, task, actions, roster, onView: publish })))
    ))
  ];
}
function BotSchedules({ bot, roster, actions }) {
  const view = useSchedules(actions);
  if (view === null) return null;
  const tasks = view.available ? view.tasks.filter((task) => task.botId === bot.id) : [];
  return (0, import_react19.createElement)(
    "section",
    { className: "bt-set-section" },
    (0, import_react19.createElement)("h3", null, t("Scheduled tasks")),
    (0, import_react19.createElement)(
      "div",
      { className: "bt-set-card" },
      !view.available ? (0, import_react19.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row" },
        (0, import_react19.createElement)("span", { className: "bt-set-copy" }, (0, import_react19.createElement)("span", { className: "bt-set-hint" }, t("Switch on Automation tasks on the Plugins page in Engine settings."))),
        actions.openEngineSettings ? (0, import_react19.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: actions.openEngineSettings }, t("Open Engine settings")) : null
      ) : [
        ...tasks.map((task) => (0, import_react19.createElement)(TaskRow, { key: task.id, task, actions, roster, onView: publish })),
        (0, import_react19.createElement)("button", { key: "new", type: "button", className: "bt-set-row bt-bs-row bt-gs-add", onClick: () => actions.openSettings("schedules", bot.id) }, (0, import_react19.createElement)(PlusIcon), t("New task"))
      ]
    )
  );
}
function ScheduleSummary({ bot, actions }) {
  const view = useSchedules(actions);
  const tasks = view?.available ? view.tasks.filter((task) => task.botId === bot.id && task.status === "active") : [];
  return (0, import_react19.createElement)(
    "div",
    null,
    (0, import_react19.createElement)("div", { className: "bt-section-title" }, t("Scheduled tasks")),
    tasks.length === 0 ? (0, import_react19.createElement)("button", { type: "button", className: "bt-more", onClick: () => actions.openSettings("schedules", bot.id) }, view?.available === false ? t("Switch on Automation tasks on the Plugins page in Engine settings.") : t("No scheduled tasks yet. Add one")) : (0, import_react19.createElement)("div", { className: "bt-task-list" }, tasks.slice(0, 3).map((task) => (0, import_react19.createElement)(
      "button",
      { key: task.id, type: "button", className: "bt-task-line", onClick: () => actions.openSettings("schedules") },
      (0, import_react19.createElement)(ClockIcon),
      (0, import_react19.createElement)("span", { className: "bt-task-line-title" }, task.title),
      (0, import_react19.createElement)("span", { className: "bt-task-line-when" }, timingText(task))
    )))
  );
}
var SCHEDULE_CSS = `
.bt-task{gap:10px}
.bt-task[data-done]{opacity:.6}
.bt-task[data-busy]{opacity:.4}
.bt-task-title{font-size:13px;line-height:18px;font-weight:500;overflow-wrap:anywhere}
.bt-task-prompt{font-size:12px;line-height:16px;color:var(--bt-ink-2);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bt-task-next{flex:none;font-size:12px;line-height:16px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-task-remove{display:inline-flex;align-items:center;justify-content:center;min-width:26px;height:26px;color:var(--bt-ink-3)}
.bt-task-remove svg{width:14px;height:14px}
.bt-task-remove[data-confirm]{background:color-mix(in srgb,var(--bt-danger) 10%,transparent);color:var(--bt-danger)}
.bt-task-head{display:flex;align-items:center;gap:6px}
.bt-task-form{animation:bt-q-in .4s cubic-bezier(.22,1,.36,1),bt-veil-in .2s ease-out}
.bt-task-bot{width:auto;min-width:160px;max-width:58%}
.bt-task-when{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.bt-task-when .bt-input{width:auto;height:32px}
.bt-task-time{min-width:110px}
.bt-task-count{width:72px!important}
.bt-task-unit{width:auto;height:32px}
.bt-task-every{font-size:13px;color:var(--bt-ink-2)}
.bt-task-days{display:flex;gap:4px}
.bt-task-day{width:30px;height:30px;border-radius:50%;border:1px solid var(--bt-line);background:none;color:var(--bt-ink-2);font:inherit;font-size:12px;cursor:pointer;transition:background-color .12s ease,color .12s ease,border-color .12s ease}
.bt-task-day[aria-pressed=true]{background:var(--bt-user);border-color:var(--bt-user);color:var(--bt-user-ink)}
.bt-task-foot{justify-content:flex-end;gap:8px}
.bt-task-foot .bt-send{height:28px;font-size:12px}
.bt-task-off{align-items:center;gap:8px;padding:28px 20px;text-align:center}
.bt-task-off>*+*{border-top:0}
.bt-task-off-mark{width:44px;height:44px;border-radius:50%;background:var(--bt-hover);display:flex;align-items:center;justify-content:center;color:var(--bt-ink-2)}
.bt-task-off-mark svg{width:20px;height:20px}
.bt-task-off-title{font-size:14px;line-height:20px;font-weight:600}
.bt-task-off .bt-set-hint{max-width:380px}
.bt-task-list{display:flex;flex-direction:column;gap:2px}
.bt-task-line{display:flex;align-items:center;gap:8px;width:100%;min-width:0;padding:6px 8px;border:0;border-radius:8px;background:none;color:var(--bt-ink);font:inherit;font-size:13px;text-align:left;cursor:pointer;transition:background-color .12s ease}
.bt-task-line:hover{background:var(--bt-hover)}
.bt-task-line svg{flex:none;color:var(--bt-ink-3)}
.bt-task-line-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-task-line-when{flex:none;font-size:12px;color:var(--bt-ink-3)}
@media (prefers-reduced-motion:reduce){.bt-task-form{animation:none}}
`;

// src/client/capability-settings.js
var import_react20 = require("react");
var blank = () => ({ name: "", kind: "mcp", description: "", transport: "stdio", command: "", argsText: "", envText: "{}", url: "", headersText: "{}", content: "", items: [] });
var parseMap = (text, label) => {
  let value;
  try {
    value = JSON.parse(text || "{}");
  } catch {
    throw new Error(t("{label} must be valid JSON.", { label }));
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(t("{label} must be a JSON object.", { label }));
  return value;
};
var statusText = (status) => !status ? void 0 : status.state === "ready" ? t("Ready") : status.state === "needs-approval" ? t("Needs approval") : status.state === "error" ? t("Could not connect: {error}", { error: status.error ?? "" }) : t("Connecting…");
function Field({ label, value, onChange, multiline = false, disabled = false, placeholder }) {
  return (0, import_react20.createElement)(
    "label",
    { className: "bt-set-row bt-bs-row bt-bs-stack" },
    (0, import_react20.createElement)("span", { className: "bt-set-copy" }, (0, import_react20.createElement)("span", { className: "bt-bs-label" }, t(label))),
    (0, import_react20.createElement)(multiline ? "textarea" : "input", {
      className: multiline ? "bt-input bt-input-area" : "bt-input",
      value,
      disabled,
      maxLength: label === "Name" ? 32 : void 0,
      placeholder,
      spellCheck: false,
      onChange: (event) => onChange(event.target.value)
    })
  );
}
function CapabilityForm({ draft, setDraft, items, actions, onClose }) {
  const [error, setError] = (0, import_react20.useState)("");
  const set = (key, value) => setDraft((previous) => ({ ...previous, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    let payload;
    try {
      payload = { name: draft.name.trim(), kind: draft.kind, description: draft.description };
      if (draft.kind === "mcp" && draft.transport === "stdio") {
        payload.transport = "stdio";
        payload.command = draft.command;
        payload.args = draft.argsText.split("\n").filter((line) => line !== "");
        payload.env = parseMap(draft.envText, t("Environment"));
      } else if (draft.kind === "mcp") {
        payload.transport = "streamable-http";
        payload.url = draft.url;
        payload.headers = parseMap(draft.headersText, t("Headers"));
      } else if (draft.kind === "skill") payload.content = draft.content;
      else payload.items = draft.items;
    } catch (failure) {
      setError(failure?.message ?? String(failure));
      return;
    }
    try {
      await actions.saveCapability(payload);
      onClose();
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    }
  };
  const available = items.filter((item) => item.name !== draft.name && ["mcp", "skill"].includes(item.kind));
  return (0, import_react20.createElement)(
    "form",
    { className: "bt-connector-form", onSubmit: submit },
    (0, import_react20.createElement)(Field, { label: "Name", value: draft.name, disabled: draft.originalName !== void 0, onChange: (value) => set("name", value), placeholder: "my-tool" }),
    (0, import_react20.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row bt-bs-stack" },
      (0, import_react20.createElement)("span", { className: "bt-set-copy" }, (0, import_react20.createElement)("span", { className: "bt-bs-label" }, t("Type"))),
      (0, import_react20.createElement)(
        "select",
        { className: "bt-input", value: draft.kind, disabled: draft.originalName !== void 0, onChange: (event) => set("kind", event.target.value) },
        ["mcp", "skill", "pack"].map((kind) => (0, import_react20.createElement)("option", { key: kind, value: kind }, t(kind === "mcp" ? "MCP server" : kind === "skill" ? "Skill" : "Pack")))
      )
    ),
    (0, import_react20.createElement)(Field, { label: "Description", value: draft.description, onChange: (value) => set("description", value) }),
    draft.kind === "mcp" ? (0, import_react20.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row bt-bs-stack" },
      (0, import_react20.createElement)("span", { className: "bt-set-copy" }, (0, import_react20.createElement)("span", { className: "bt-bs-label" }, t("Connection"))),
      (0, import_react20.createElement)(
        "select",
        { className: "bt-input", value: draft.transport, onChange: (event) => set("transport", event.target.value) },
        (0, import_react20.createElement)("option", { value: "stdio" }, t("Local command")),
        (0, import_react20.createElement)("option", { value: "streamable-http" }, t("HTTP server"))
      )
    ) : null,
    draft.kind === "mcp" && draft.transport === "stdio" ? (0, import_react20.createElement)(
      "div",
      null,
      (0, import_react20.createElement)(Field, { label: "Command", value: draft.command, onChange: (value) => set("command", value) }),
      (0, import_react20.createElement)(Field, { label: "Arguments (one per line)", value: draft.argsText, onChange: (value) => set("argsText", value), multiline: true }),
      (0, import_react20.createElement)(Field, { label: "Environment (JSON)", value: draft.envText, onChange: (value) => set("envText", value), multiline: true, placeholder: t('{"API_KEY": "$DSH_SECRET_MY_KEY"}') })
    ) : null,
    draft.kind === "mcp" && draft.transport === "streamable-http" ? (0, import_react20.createElement)(
      "div",
      null,
      (0, import_react20.createElement)(Field, { label: "URL", value: draft.url, onChange: (value) => set("url", value) }),
      (0, import_react20.createElement)(Field, { label: "Headers (JSON)", value: draft.headersText, onChange: (value) => set("headersText", value), multiline: true, placeholder: t('{"API_KEY": "$DSH_SECRET_MY_KEY"}') })
    ) : null,
    draft.kind === "skill" ? (0, import_react20.createElement)(Field, { label: "Skill instructions", value: draft.content, onChange: (value) => set("content", value), multiline: true }) : null,
    draft.kind === "pack" ? (0, import_react20.createElement)(
      "div",
      { className: "bt-set-card" },
      available.length === 0 ? (0, import_react20.createElement)("div", { className: "bt-set-row" }, (0, import_react20.createElement)("span", { className: "bt-set-hint" }, t("Save an MCP server or skill first."))) : available.map((item) => (0, import_react20.createElement)(
        "label",
        { key: item.name, className: "bt-set-row bt-bs-row" },
        (0, import_react20.createElement)("span", { className: "bt-set-copy" }, (0, import_react20.createElement)("span", { className: "bt-bs-label" }, item.name)),
        (0, import_react20.createElement)("input", { type: "checkbox", checked: draft.items.includes(item.name), onChange: (event) => set("items", event.target.checked ? [...draft.items, item.name] : draft.items.filter((name) => name !== item.name)) })
      ))
    ) : null,
    error ? (0, import_react20.createElement)("div", { className: "bt-connector-error", role: "alert" }, error) : null,
    (0, import_react20.createElement)(
      "div",
      { className: "bt-connector-form-row" },
      (0, import_react20.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onClose }, t("Cancel")),
      (0, import_react20.createElement)("button", { type: "submit", className: "bt-soft bt-soft-sm" }, draft.originalName ? t("Save changes") : t("Add capability"))
    )
  );
}
var commandLine = (item) => [item.command, ...item.args ?? []].filter((part) => typeof part === "string" && part !== "").join(" ");
function CapabilityRow({ item, onEdit, onDelete, onApprove, confirming }) {
  const waiting = item.kind === "mcp" && item.transport === "stdio" && !item.approved;
  const detail = item.kind === "pack" ? `${t("Pack")}: ${(item.items ?? []).join(", ") || t("No items")}` : item.kind === "mcp" ? item.transport === "stdio" ? t("Local command") : t("HTTP server") : t("Skill");
  const secondary = item.kind === "pack" ? [item.description, (item.items ?? []).join(", ") || t("No items")].filter(Boolean).join(" · ") : item.description || detail;
  return (0, import_react20.createElement)(
    "div",
    { className: "bt-connector" },
    (0, import_react20.createElement)(
      "div",
      { className: "bt-connector-head" },
      (0, import_react20.createElement)(
        "span",
        { className: "bt-connector-text" },
        (0, import_react20.createElement)("span", { className: "bt-connector-name" }, item.name),
        (0, import_react20.createElement)("span", { className: "bt-connector-status" }, secondary),
        waiting ? (0, import_react20.createElement)("span", { className: "bt-connector-status bt-cap-command" }, t("Allow lets it run this on your computer: {command}", { command: commandLine(item) })) : null
      ),
      (0, import_react20.createElement)(
        "span",
        { className: "bt-connector-actions" },
        waiting ? (0, import_react20.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onApprove }, t("Allow")) : null,
        (0, import_react20.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onEdit }, t("Edit")),
        (0, import_react20.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onDelete }, confirming ? t("Click again to delete.") : t("Delete"))
      )
    )
  );
}
function CapabilitiesPage({ roster, actions, run }) {
  const items = [...roster.capabilities ?? []].sort((a, b) => a.name.localeCompare(b.name));
  const [draft, setDraft] = (0, import_react20.useState)(null);
  const [confirming, setConfirming] = (0, import_react20.useState)("");
  (0, import_react20.useEffect)(() => {
    if (!confirming) return void 0;
    const timer = setTimeout(() => setConfirming(""), 4e3);
    return () => clearTimeout(timer);
  }, [confirming]);
  const startNew = () => setDraft(blank());
  const edit = (item) => setDraft({
    ...blank(),
    ...item,
    originalName: item.name,
    argsText: (item.args ?? []).join("\n"),
    envText: JSON.stringify(item.env ?? {}, null, 2),
    headersText: JSON.stringify(item.headers ?? {}, null, 2),
    items: [...item.items ?? []]
  });
  const remove = (item) => {
    if (confirming !== item.name) {
      setConfirming(item.name);
      return;
    }
    setConfirming("");
    void run(actions.deleteCapability(item.name));
  };
  return (0, import_react20.createElement)(
    "section",
    { className: "bt-set-section" },
    (0, import_react20.createElement)("h3", null, t("Shared capabilities")),
    (0, import_react20.createElement)(
      "div",
      { className: "bt-actions" },
      (0, import_react20.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: startNew }, t("Add capability"))
    ),
    draft ? (0, import_react20.createElement)(CapabilityForm, { draft, setDraft, items, actions, onClose: () => setDraft(null) }) : null,
    (0, import_react20.createElement)(
      "div",
      { className: "bt-set-card bt-connectors-card" },
      items.length === 0 ? (0, import_react20.createElement)("div", { className: "bt-set-row" }, (0, import_react20.createElement)("span", { className: "bt-set-hint" }, t("No capabilities saved"))) : items.map((item) => (0, import_react20.createElement)(CapabilityRow, {
        key: item.name,
        item,
        confirming: confirming === item.name,
        onEdit: () => edit(item),
        onDelete: () => remove(item),
        onApprove: () => void run(actions.approveCapability(item.name, item.updatedAt))
      }))
    )
  );
}
function BotCapabilitiesCard({ bot, roster, actions, run, Card: Card2, SwitchRow: SwitchRow2 }) {
  const items = [...roster.capabilities ?? []].sort((a, b) => Number(b.kind === "pack") - Number(a.kind === "pack") || a.name.localeCompare(b.name));
  const attached = new Set(bot.capabilities ?? []);
  const statuses = roster.capabilityStatuses?.[bot.id] ?? {};
  if (items.length === 0) return null;
  return (0, import_react20.createElement)(
    Card2,
    { title: t("Capabilities") },
    items.map((item) => (0, import_react20.createElement)(SwitchRow2, {
      key: item.name,
      label: item.name,
      hint: attached.has(item.name) ? statusText(statuses[item.name]) : void 0,
      on: attached.has(item.name),
      onChange: (enabled) => void run(actions.setBotCapability(bot.id, item.name, enabled))
    }))
  );
}

// src/client/memory-panel.js
var import_react21 = require("react");
var POLL_MS2 = 1500;
var MENU_EXIT_MS2 = 120;
var counts = /* @__PURE__ */ new Map();
var countListeners = /* @__PURE__ */ new Set();
function noteCount(id, count) {
  if (counts.get(id) === count) return;
  counts.set(id, count);
  for (const listener of countListeners) listener();
}
function useMemoryCount(id, actions) {
  const [count, setCount] = (0, import_react21.useState)(counts.get(id) ?? null);
  (0, import_react21.useEffect)(() => {
    const listener = () => setCount(counts.get(id) ?? null);
    countListeners.add(listener);
    listener();
    let stop = false;
    actions.memoryView?.(id).then((view) => {
      if (!stop) noteCount(id, view.entries.length);
    }).catch(() => {
    });
    return () => {
      stop = true;
      countListeners.delete(listener);
    };
  }, [id]);
  return count;
}
function MemoryRow({ owner, actions }) {
  const count = useMemoryCount(owner.id, actions);
  const label = count === null ? t("Loading…") : count === 0 ? t("Nothing saved yet") : count === 1 ? t("1 entry") : t("{count} entries", { count });
  return (0, import_react21.createElement)(
    "div",
    null,
    (0, import_react21.createElement)("div", { className: "bt-section-title" }, t("Memory")),
    (0, import_react21.createElement)(
      "button",
      { type: "button", className: "bt-mem-row", "aria-label": t("Manage {name}'s memory", { name: owner.name }), onClick: () => actions.openMemory(owner.id) },
      (0, import_react21.createElement)(MemoryIcon),
      (0, import_react21.createElement)("span", { className: "bt-mem-row-copy" }, label),
      (0, import_react21.createElement)("span", { className: "bt-mem-row-go" }, t("Manage"), (0, import_react21.createElement)(ChevronRightIcon))
    )
  );
}
function ago(at2, now) {
  const seconds = Math.max(0, Math.round((now - at2) / 1e3));
  if (seconds < 60) return null;
  const format = new Intl.RelativeTimeFormat(dateLocale(), { numeric: "auto" });
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return format.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return format.format(-hours, "hour");
  return format.format(-Math.round(hours / 24), "day");
}
function Skeleton({ label }) {
  return (0, import_react21.createElement)(
    "div",
    { className: "bt-mem-skel", "aria-busy": true },
    [0, 1].map((block) => (0, import_react21.createElement)(
      "div",
      { key: block, className: "bt-mem-skel-block" },
      (0, import_react21.createElement)("span", { className: "bt-mem-skel-head" }),
      (0, import_react21.createElement)("span", null),
      (0, import_react21.createElement)("span", null),
      (0, import_react21.createElement)("span", { style: { width: block === 0 ? "62%" : "48%" } })
    )),
    label ? (0, import_react21.createElement)("div", { className: "bt-mem-skel-label" }, label) : null
  );
}
function Summary({ owner, view, regenerate }) {
  if (view.entries.length === 0) {
    return (0, import_react21.createElement)(
      "div",
      { className: "bt-mem-empty" },
      (0, import_react21.createElement)("div", { className: "bt-mem-empty-mark" }, (0, import_react21.createElement)(MemoryIcon)),
      (0, import_react21.createElement)("div", { className: "bt-mem-empty-title" }, owner.group ? t("Nothing is saved for this group yet") : t("{name} has not saved anything yet", { name: owner.name })),
      (0, import_react21.createElement)("div", { className: "bt-mem-empty-text" }, owner.group ? t("A group keeps the decisions, rules, and facts its work needs, for its members to read here. Tell it below, or in the group.") : t("Bots keep lasting preferences, decisions, and what you ask them to remember. Tell {name} below, or in its chat.", { name: owner.name }))
    );
  }
  const failed = view.error && !view.summarizing ? (0, import_react21.createElement)(
    "div",
    { className: "bt-mem-failed", role: "alert" },
    (0, import_react21.createElement)("span", null, view.summary ? t("The summary is out of date: {reason}", { reason: hostText(view.error) }) : t("The summary could not be written: {reason}", { reason: hostText(view.error) })),
    (0, import_react21.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: regenerate }, t("Try again"))
  ) : null;
  if (!view.summary) return (0, import_react21.createElement)(import_react21.Fragment, null, failed, failed ? null : (0, import_react21.createElement)(Skeleton, { label: t("Writing the summary…") }));
  return (0, import_react21.createElement)(
    import_react21.Fragment,
    null,
    failed,
    (0, import_react21.createElement)(
      "div",
      { key: view.summary.at, className: "bt-mem-summary", "data-stale": !view.fresh || void 0 },
      summaryBlocks(view.summary.text).map((block, index) => block.kind === "h" ? (0, import_react21.createElement)("h3", { key: index }, block.text) : (0, import_react21.createElement)("p", { key: index }, block.text))
    )
  );
}
var groupEntries = (entries2) => entries2.reduce((groups, entry) => {
  const key = `${entry.scope}:${entry.topic ?? ""}`;
  const group = groups.find((item) => item.key === key);
  if (group) group.entries.push(entry);
  else groups.push({ key, scope: entry.scope, topic: entry.topic, entries: [entry] });
  return groups;
}, []);
function EntryRow({ entry, remove }) {
  const [confirming, setConfirming] = (0, import_react21.useState)(false);
  const [busy, setBusy] = (0, import_react21.useState)(false);
  (0, import_react21.useEffect)(() => {
    if (!confirming) return void 0;
    const timer = setTimeout(() => setConfirming(false), 3e3);
    return () => clearTimeout(timer);
  }, [confirming]);
  const by = entry.source === "memory panel" ? t("by you") : entry.by ? t("by {name}", { name: entry.by }) : null;
  const meta = [entry.added, by].filter(Boolean).join(" · ");
  const click = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setBusy(true);
    if (!await remove(entry)) setBusy(false);
  };
  return (0, import_react21.createElement)(
    "li",
    { className: "bt-mem-entry", "data-busy": busy || void 0 },
    (0, import_react21.createElement)(
      "div",
      { className: "bt-mem-entry-copy" },
      (0, import_react21.createElement)("span", { className: "bt-mem-entry-text" }, entry.text),
      meta ? (0, import_react21.createElement)("span", { className: "bt-mem-entry-meta" }, meta) : null
    ),
    (0, import_react21.createElement)("button", {
      type: "button",
      className: "bt-mem-remove",
      "data-confirm": confirming || void 0,
      disabled: busy,
      "aria-label": confirming ? t("Click again to remove") : t("Remove from memory"),
      title: confirming ? void 0 : t("Remove from memory"),
      onClick: click
    }, confirming ? t("Remove") : (0, import_react21.createElement)(TrashIcon))
  );
}
function Entries({ owner, view, remove }) {
  const groups = groupEntries(view.entries);
  const sections = owner.group ? [{ scope: "group", title: t("Group memory"), hint: t("Only its members read it"), size: view.sizes.group }] : [
    { scope: "own", title: t("{name}'s memory", { name: owner.name }), size: view.sizes.own },
    { scope: "team", title: t("Team memory"), hint: t("Every Bot reads it"), size: view.sizes.team }
  ];
  return (0, import_react21.createElement)(
    "div",
    { className: "bt-mem-entries" },
    sections.map((section) => (0, import_react21.createElement)(
      "section",
      { key: section.scope, className: "bt-mem-section" },
      (0, import_react21.createElement)(
        "div",
        { className: "bt-mem-section-head" },
        (0, import_react21.createElement)("h3", null, section.title),
        section.hint ? (0, import_react21.createElement)("span", null, section.hint) : null,
        (0, import_react21.createElement)("span", { className: "bt-mem-size", title: t("MEMORY.md, which every conversation reads") }, t("{used} of {limit} characters", { used: section.size.toLocaleString(dateLocale()), limit: view.limits.main.toLocaleString(dateLocale()) }))
      ),
      groups.some((group) => group.scope === section.scope) ? groups.filter((group) => group.scope === section.scope).map((group) => (0, import_react21.createElement)(
        import_react21.Fragment,
        { key: group.key },
        group.topic ? (0, import_react21.createElement)("div", { className: "bt-mem-topic" }, group.topic) : null,
        (0, import_react21.createElement)("ul", { className: "bt-mem-list" }, group.entries.map((entry) => (0, import_react21.createElement)(EntryRow, { key: `${entry.topic ?? ""}:${entry.text}`, entry, remove })))
      )) : (0, import_react21.createElement)("div", { className: "bt-mem-none" }, t("Nothing saved yet"))
    ))
  );
}
function changeLine(change) {
  const text = change.text.length > 120 ? `${change.text.slice(0, 120)}…` : change.text;
  if (!change.ok) return t("Not changed: {text} ({reason})", { text, reason: hostText(change.error ?? "") });
  if (change.op === "remove") return change.scope === "team" ? t("Removed from team memory: {text}", { text }) : t("Removed: {text}", { text });
  if (change.op === "edit") return t("Updated: {text}", { text });
  return change.scope === "team" ? t("Added to team memory: {text}", { text }) : t("Added: {text}", { text });
}
function Reply({ answer, dismiss }) {
  return (0, import_react21.createElement)(
    "div",
    { className: "bt-mem-reply", role: "status" },
    (0, import_react21.createElement)(
      "div",
      { className: "bt-mem-reply-head" },
      (0, import_react21.createElement)("span", { className: "bt-mem-reply-asked" }, answer.asked),
      answer.pending ? null : (0, import_react21.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Dismiss"), onClick: dismiss }, (0, import_react21.createElement)(CloseIcon))
    ),
    answer.pending ? (0, import_react21.createElement)("div", { className: "bt-mem-reply-text bt-shimmer" }, t("Thinking…")) : answer.error ? (0, import_react21.createElement)("div", { className: "bt-mem-reply-text bt-danger" }, hostText(answer.error)) : (0, import_react21.createElement)(
      import_react21.Fragment,
      null,
      answer.reply ? (0, import_react21.createElement)("div", { className: "bt-mem-reply-text" }, answer.reply) : null,
      answer.changes.length > 0 ? (0, import_react21.createElement)("ul", { className: "bt-mem-changes" }, answer.changes.map((change, index) => (0, import_react21.createElement)(
        "li",
        { key: index, "data-ok": change.ok || void 0 },
        change.ok ? (0, import_react21.createElement)(CheckIcon) : (0, import_react21.createElement)(CloseIcon),
        (0, import_react21.createElement)("span", null, changeLine(change))
      ))) : null
    )
  );
}
function useMemoryView(id, actions) {
  const [view, setView] = (0, import_react21.useState)(null);
  const [error, setError] = (0, import_react21.useState)("");
  const timer = (0, import_react21.useRef)(0);
  const latest = (0, import_react21.useRef)(0);
  const alive = (0, import_react21.useRef)(true);
  const show = (0, import_react21.useCallback)((next) => {
    setView(next);
    setError("");
    noteCount(id, next.entries.length);
  }, [id]);
  const load = (0, import_react21.useCallback)(async (flags = {}) => {
    clearTimeout(timer.current);
    const ticket = ++latest.current;
    try {
      const next = await actions.memoryView(id, flags);
      if (!alive.current || ticket !== latest.current) return;
      show(next);
      if (next.summarizing) timer.current = setTimeout(() => void load({ summarize: flags.summarize || flags.regenerate }), POLL_MS2);
    } catch (failure) {
      if (alive.current && ticket === latest.current) setError(failure?.message ?? String(failure));
    }
  }, [id]);
  (0, import_react21.useEffect)(() => {
    alive.current = true;
    void load({ summarize: true });
    return () => {
      alive.current = false;
      clearTimeout(timer.current);
    };
  }, [id]);
  return { view, error, load, show };
}
function useNow(every) {
  const [now, setNow] = (0, import_react21.useState)(Date.now());
  (0, import_react21.useEffect)(() => {
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}
function MemoryDialog({ owner, actions, leaving = false }) {
  const { view, error, load, show } = useMemoryView(owner.id, actions);
  const [page, setPage] = (0, import_react21.useState)("summary");
  const [menu, setMenu] = (0, import_react21.useState)(false);
  const [menuShown, menuLeaving] = useLinger(menu, MENU_EXIT_MS2);
  const [text, setText] = (0, import_react21.useState)("");
  const [answer, setAnswer] = (0, import_react21.useState)(null);
  const menuRef = (0, import_react21.useRef)(null);
  const dotsRef = (0, import_react21.useRef)(null);
  const inputRef = (0, import_react21.useRef)(null);
  const now = useNow(3e4);
  const close = (0, import_react21.useCallback)(() => actions.closeMemory(), []);
  useEscape(close);
  (0, import_react21.useEffect)(() => {
    if (!menu) return void 0;
    const onDown = (event) => {
      if (menuRef.current?.contains(event.target) || dotsRef.current?.contains(event.target)) return;
      setMenu(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        setMenu(false);
        dotsRef.current?.focus();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [menu]);
  const regenerate = () => {
    setMenu(false);
    setPage("summary");
    void load({ regenerate: true });
  };
  const openEntries = () => {
    setMenu(false);
    setPage("entries");
  };
  const backToSummary = () => {
    setPage("summary");
    void load({ summarize: true });
  };
  const remove = async (entry) => {
    try {
      show(await actions.memoryForget(owner.id, entry));
      return true;
    } catch (failure) {
      setAnswer({ asked: entry.text, error: failure?.message ?? String(failure) });
      return false;
    }
  };
  const ask = async (event) => {
    event.preventDefault();
    const asked = text.trim();
    if (asked === "" || answer?.pending) return;
    setText("");
    setAnswer({ asked, pending: true });
    try {
      const result = await actions.memoryAsk(owner.id, asked);
      setAnswer({ asked, reply: result.reply, changes: result.changes });
      show(result.view);
      if (result.changes.some((change) => change.ok)) void load({ summarize: page === "summary" });
    } catch (failure) {
      setAnswer({ asked, error: failure?.message ?? String(failure) });
    }
    inputRef.current?.focus();
  };
  const count = view?.entries.length ?? 0;
  const when3 = view?.summary ? ago(view.summary.at, now) : null;
  const status = view === null ? "" : page === "entries" ? count === 1 ? t("1 entry") : t("{count} entries", { count }) : view.summarizing && view.summary ? t("Updating…") : view.summary && view.fresh ? when3 ? t("Updated {time}", { time: when3 }) : t("Updated just now") : "";
  const busy = answer?.pending === true;
  return (0, import_react21.createElement)(
    "div",
    { className: "bt-mem-layer", "data-leaving": leaving || void 0 },
    (0, import_react21.createElement)("div", { className: "bt-scrim bt-mem-scrim", onMouseDown: close }),
    (0, import_react21.createElement)(
      "div",
      { className: "bt-mem", role: "dialog", "aria-modal": true, "aria-label": t("{name}'s memory", { name: owner.name }) },
      (0, import_react21.createElement)(
        "div",
        { className: "bt-mem-head" },
        page === "entries" ? (0, import_react21.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Back to the summary"), onClick: backToSummary }, (0, import_react21.createElement)(ChevronLeftIcon)) : null,
        (0, import_react21.createElement)("h2", null, page === "entries" ? t("All entries") : t("Memory summary")),
        (0, import_react21.createElement)("span", { className: "bt-mem-status" }, page === "summary" ? [owner.name, status].filter(Boolean).join(" · ") : status),
        (0, import_react21.createElement)("span", { className: "bt-mem-head-gap" }),
        (0, import_react21.createElement)("button", { ref: dotsRef, type: "button", className: "bt-icon-btn", "aria-label": t("Memory options"), "aria-haspopup": "menu", "aria-expanded": menu, onClick: () => setMenu((value) => !value) }, (0, import_react21.createElement)(DotsIcon)),
        (0, import_react21.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Close memory"), onClick: close }, (0, import_react21.createElement)(CloseIcon)),
        menuShown ? (0, import_react21.createElement)(
          "div",
          { ref: menuRef, className: "bt-menu bt-mem-menu", role: "menu", "aria-label": t("Memory options"), "data-leaving": menuLeaving || void 0 },
          (0, import_react21.createElement)(
            "button",
            { type: "button", role: "menuitem", onClick: openEntries },
            (0, import_react21.createElement)("span", { className: "bt-menu-label" }, t("All entries")),
            (0, import_react21.createElement)("span", { className: "bt-menu-hint" }, String(count))
          ),
          (0, import_react21.createElement)(
            "button",
            { type: "button", role: "menuitem", disabled: count === 0 || view?.summarizing, onClick: regenerate },
            (0, import_react21.createElement)("span", { className: "bt-menu-label" }, t("Regenerate summary"))
          )
        ) : null
      ),
      (0, import_react21.createElement)(
        "div",
        { className: "bt-mem-body" },
        error ? (0, import_react21.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, hostText(error)) : null,
        view === null ? error ? null : (0, import_react21.createElement)(Skeleton) : page === "entries" ? (0, import_react21.createElement)(Entries, { owner, view, remove }) : (0, import_react21.createElement)(Summary, { owner, view, regenerate })
      ),
      (0, import_react21.createElement)(
        "div",
        { className: "bt-mem-foot" },
        answer ? (0, import_react21.createElement)(Reply, { answer, dismiss: () => setAnswer(null) }) : null,
        (0, import_react21.createElement)(
          "form",
          { className: "bt-mem-ask", onSubmit: ask },
          (0, import_react21.createElement)("input", {
            ref: inputRef,
            className: "bt-mem-input",
            value: text,
            maxLength: 2e3,
            disabled: view === null,
            placeholder: t("Ask or update"),
            "aria-label": t("Ask about or update {name}'s memory", { name: owner.name }),
            onChange: (event) => setText(event.target.value)
          }),
          (0, import_react21.createElement)(
            "button",
            { type: "submit", className: "bt-mem-send", disabled: busy || text.trim() === "", "aria-label": t("Send") },
            busy ? (0, import_react21.createElement)("span", { className: "bt-mem-spin", "aria-hidden": true }) : (0, import_react21.createElement)(ArrowUpIcon)
          )
        )
      )
    )
  );
}

// src/client/bot-settings.js
var import_react22 = require("react");
var capitalize = (word) => word[0].toUpperCase() + word.slice(1);
async function avatarImage(file) {
  if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) throw new Error(t("Choose a PNG, JPEG, WebP, or GIF image"));
  if (file.size > 25 * 1024 * 1024) throw new Error(t("Choose an image smaller than 25 MB"));
  const bitmap = await createImageBitmap(file);
  const side = 160;
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  const crop = Math.min(bitmap.width, bitmap.height);
  context.drawImage(bitmap, (bitmap.width - crop) / 2, (bitmap.height - crop) / 2, crop, crop, 0, 0, side, side);
  bitmap.close?.();
  for (const quality of [0.9, 0.75, 0.6]) {
    const url = canvas.toDataURL("image/webp", quality);
    if (url.startsWith("data:image/webp") && url.length < 15e4) return url;
  }
  const png = canvas.toDataURL("image/png");
  if (png.length < 15e4) return png;
  throw new Error(t("That image is too large"));
}
function InlineText({ label, value, placeholder, required = false, maxLength, multiline = false, onSave }) {
  const [draft, setDraft] = (0, import_react22.useState)(null);
  const reverting = (0, import_react22.useRef)(false);
  const commit = () => {
    const next = draft?.trim();
    if (reverting.current) {
      reverting.current = false;
      setDraft(null);
      return;
    }
    if (next === void 0 || next === (value ?? "") || required && next === "") {
      setDraft(null);
      return;
    }
    void Promise.resolve(onSave(next)).then((saved) => {
      if (saved !== false) setDraft(null);
    }, () => {
    });
  };
  return (0, import_react22.createElement)(multiline ? "textarea" : "input", {
    className: multiline ? "bt-bs-input bt-bs-area" : "bt-bs-input",
    value: draft ?? value ?? "",
    placeholder,
    maxLength,
    required,
    "aria-label": label,
    spellCheck: false,
    onChange: (event) => setDraft(event.target.value),
    onBlur: commit,
    onKeyDown: (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        reverting.current = true;
        event.currentTarget.blur();
      }
      if (event.key === "Enter" && !multiline && !event.nativeEvent.isComposing) event.currentTarget.blur();
    }
  });
}
function Row({ label, hint, stack = false, children }) {
  return (0, import_react22.createElement)(
    "label",
    { className: stack ? "bt-set-row bt-bs-row bt-bs-stack" : "bt-set-row bt-bs-row" },
    (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, label), hint ? (0, import_react22.createElement)("span", { className: "bt-set-hint" }, hint) : null),
    children
  );
}
function Card({ title, children }) {
  return (0, import_react22.createElement)("section", { className: "bt-set-section" }, title ? (0, import_react22.createElement)("h3", null, title) : null, (0, import_react22.createElement)("div", { className: "bt-set-card" }, children));
}
function Switch({ on, label, disabled, onChange }) {
  return (0, import_react22.createElement)(
    "button",
    { type: "button", role: "switch", className: "bt-switch", "aria-checked": on, "aria-label": label, disabled, onClick: () => onChange(!on) },
    (0, import_react22.createElement)("span", { className: "bt-switch-knob", "aria-hidden": true })
  );
}
function SwitchRow({ label, hint, on, disabled, onChange }) {
  return (0, import_react22.createElement)(
    "div",
    { className: "bt-set-row bt-bs-row" },
    (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, label), hint ? (0, import_react22.createElement)("span", { className: "bt-set-hint" }, hint) : null),
    (0, import_react22.createElement)(Switch, { on, label, disabled, onChange })
  );
}
function modelHint(bot, roster) {
  const shown = modelOf(bot, roster);
  if (shown === void 0) return t("Pick the model this Bot runs on.");
  if (!shown.served && (roster.models ?? []).length > 0) return t("This model is not available now. Pick another one.");
  if (bot.appliedModel && bot.appliedModel === bot.model) return t("Every message of this Bot runs on it.");
  return t("Applies from the next message.");
}
function ShapeRing({ shape, size }) {
  const maskId = (0, import_react22.useRef)("");
  if (maskId.current === "") maskId.current = `bt-ring-${nextMarkSerial()}`;
  const def = shapeOf(shape);
  const unit = def.size / size;
  const markup = `<defs><mask id="${maskId.current}" ${maskBox(def.size)}>${holes(def, `<g stroke="#000" stroke-width="${6 * unit}" stroke-linejoin="round">${bodyOf(def, "#000", true)}</g>`)}</mask></defs><g mask="url(#${maskId.current})" stroke="currentColor" stroke-width="${8 * unit}" stroke-linejoin="round">${bodyOf(def, "currentColor", true)}</g>`;
  return (0, import_react22.createElement)("svg", { className: "bt-ring", viewBox: `0 0 ${def.size} ${def.size}`, "aria-hidden": true, dangerouslySetInnerHTML: { __html: markup } });
}
function CharacterGrid({ look, hasPhoto = false, onShape, onColor }) {
  const shapes = [...PICKER_SHAPES, ...Object.keys(SHAPES).filter((id) => !Object.hasOwn(CHARACTERS, id))];
  if (!shapes.includes(look.shape)) shapes.push(look.shape);
  const rows = [];
  for (let index = 0; index < shapes.length; index += PICKER_COLUMNS) rows.push(shapes.slice(index, index + PICKER_COLUMNS));
  return (0, import_react22.createElement)(
    import_react22.Fragment,
    null,
    (0, import_react22.createElement)("div", { className: "bt-shapes", role: "group", "aria-label": t("Character shape") }, rows.map((row, index) => (0, import_react22.createElement)("div", { key: index, className: "bt-shape-row" }, row.map((id) => (0, import_react22.createElement)("button", {
      key: id,
      type: "button",
      className: "bt-shape",
      "aria-label": t(shapeOf(id).label),
      title: t(shapeOf(id).label),
      "aria-pressed": !hasPhoto && look.shape === id,
      onClick: () => onShape(id)
    }, (0, import_react22.createElement)(ShapeRing, { shape: id, size: 36 }), (0, import_react22.createElement)(BotMark, { look: { shape: id, color: look.color }, size: 36 })))))),
    (0, import_react22.createElement)("div", { className: "bt-colors", role: "group", "aria-label": t("Character color") }, CHARACTER_COLORS.map((color) => (0, import_react22.createElement)("button", {
      key: color,
      type: "button",
      className: "bt-color",
      "aria-label": t(capitalize(color)),
      title: t(capitalize(color)),
      "aria-pressed": look.color === color,
      onClick: () => onColor(color)
    }, (0, import_react22.createElement)("span", { style: { background: paintCss(color) } }))))
  );
}
function AvatarEditor({ bot, actions, run, onClose }) {
  const look = lookOf(bot);
  const [tab, setTab] = (0, import_react22.useState)(look.image ? "upload" : "bot");
  const [over, setOver] = (0, import_react22.useState)(false);
  const ref = (0, import_react22.useRef)(null);
  const fileRef = (0, import_react22.useRef)(null);
  const upload = (file) => {
    if (file) void run(avatarImage(file).then((image) => actions.updateBot(bot.id, { avatar: { ...bot.avatar ?? {}, image } })));
  };
  (0, import_react22.useEffect)(() => {
    const onDown = (event) => {
      if (!(event.target instanceof Element) || ref.current?.contains(event.target) || event.target.closest(".bt-avatar-trigger")) return;
      onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);
  (0, import_react22.useEffect)(() => {
    if (tab !== "upload") return void 0;
    const onPaste = (event) => {
      const file = [...event.clipboardData?.files ?? []].find((item) => item.type.startsWith("image/"));
      if (file) {
        event.preventDefault();
        upload(file);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [tab, bot]);
  const hasPhoto = Boolean(look.image);
  const glide = useGlide(tab);
  return (0, import_react22.createElement)(
    "div",
    { ref, className: "bt-avedit", role: "dialog", "aria-label": t("Avatar editor") },
    (0, import_react22.createElement)(
      "div",
      { className: "bt-avedit-top" },
      (0, import_react22.createElement)(
        "div",
        { ref: glide.box, role: "tablist", "aria-label": t("Avatar source"), className: "bt-avedit-tabs" },
        (0, import_react22.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
        [["bot", "Bot"], ["upload", "Upload"]].map(([id, label]) => (0, import_react22.createElement)("button", { key: id, type: "button", role: "tab", className: "bt-avedit-tab", "aria-selected": tab === id, onClick: () => setTab(id) }, t(label)))
      ),
      (0, import_react22.createElement)("button", {
        type: "button",
        className: "bt-avedit-tab bt-avedit-reset",
        title: t("Reset character to default"),
        onClick: () => run(actions.updateBot(bot.id, { avatar: null, color: null }))
      }, t("Reset"))
    ),
    tab === "bot" ? (0, import_react22.createElement)(CharacterGrid, {
      look,
      hasPhoto,
      onShape: (shape) => run(actions.updateBot(bot.id, { avatar: { shape } })),
      onColor: (color) => run(actions.updateBot(bot.id, { color }))
    }) : null,
    tab === "upload" ? (0, import_react22.createElement)(
      "div",
      {
        className: "bt-dropzone",
        "data-over": over || void 0,
        onDragOver: (event) => {
          event.preventDefault();
          setOver(true);
        },
        onDragLeave: () => setOver(false),
        onDrop: (event) => {
          event.preventDefault();
          setOver(false);
          upload(event.dataTransfer.files?.[0]);
        }
      },
      hasPhoto ? (0, import_react22.createElement)("img", { src: look.image, alt: "" }) : null,
      (0, import_react22.createElement)("div", null, t("Drag, drop, or paste an image")),
      (0, import_react22.createElement)(
        "div",
        { className: "bt-actions", style: { justifyContent: "center" } },
        (0, import_react22.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => fileRef.current?.click() }, hasPhoto ? t("Replace") : t("Browse files")),
        hasPhoto ? (0, import_react22.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => run(actions.updateBot(bot.id, { avatar: hasShape(bot.avatar?.shape) ? { shape: bot.avatar.shape } : null })) }, t("Remove photo")) : null
      ),
      (0, import_react22.createElement)("input", { ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", hidden: true, onChange: (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        upload(file);
      } })
    ) : null
  );
}
function MemoryCard({ bot, actions }) {
  const count = useMemoryCount(bot.id, actions);
  const label = count === null ? t("Loading…") : count === 0 ? t("Nothing saved yet") : count === 1 ? t("1 entry") : t("{count} entries", { count });
  return (0, import_react22.createElement)(
    Card,
    { title: t("Memory") },
    (0, import_react22.createElement)(
      "button",
      { type: "button", className: "bt-set-row bt-bs-row", "aria-label": t("Manage {name}'s memory", { name: bot.name }), onClick: () => actions.openMemory(bot.id) },
      (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, label)),
      (0, import_react22.createElement)("span", { className: "bt-mem-row-go" }, t("Manage"), (0, import_react22.createElement)(ChevronRightIcon))
    )
  );
}
function BotSettingsForm({ bot, roster, actions, run }) {
  const [editing, setEditing] = (0, import_react22.useState)(false);
  const [confirming, setConfirming] = (0, import_react22.useState)(false);
  const closeEditor = (0, import_react22.useCallback)(() => setEditing(false), []);
  (0, import_react22.useEffect)(() => {
    if (!confirming) return void 0;
    const timer = setTimeout(() => setConfirming(false), 4e3);
    return () => clearTimeout(timer);
  }, [confirming]);
  const isMainBot = isMainOf(roster, bot.id);
  const onlyMain = isMainBot && (roster.mainBotIds ?? []).length === 1;
  const isTile = roster.mainBotId === bot.id;
  const save = (patch) => run(actions.updateBot(bot.id, patch));
  const duplicate = () => run(actions.duplicateBot(bot.id).then((copy) => actions.openSession(copy.id)));
  const remove = () => {
    if (confirming) void run(actions.deleteBot(bot.id));
    else setConfirming(true);
  };
  (0, import_react22.useEffect)(() => {
    void actions.refreshModels?.();
  }, [bot.id]);
  return (0, import_react22.createElement)(
    "div",
    { className: "bt-bs" },
    (0, import_react22.createElement)(
      "div",
      { className: "bt-bs-hero" },
      (0, import_react22.createElement)(
        "div",
        { className: "bt-avatar-anchor" },
        (0, import_react22.createElement)(
          "button",
          { type: "button", className: "bt-avatar-trigger", "aria-label": t("Edit Bot avatar"), "aria-expanded": editing, onClick: () => setEditing((value) => !value) },
          (0, import_react22.createElement)(BotMark, { bot, size: 64, live: true }),
          (0, import_react22.createElement)("span", { className: "bt-avatar-pencil", "aria-hidden": true }, (0, import_react22.createElement)(PencilIcon))
        ),
        editing ? (0, import_react22.createElement)(AvatarEditor, { bot, actions, run, onClose: closeEditor }) : null
      ),
      (0, import_react22.createElement)(
        "div",
        { className: "bt-bs-who" },
        (0, import_react22.createElement)("span", { className: "bt-bs-name" }, bot.name),
        (0, import_react22.createElement)("span", { className: "bt-bs-sub" }, [bot.role, isMainBot ? t("Main Bot") : ""].filter(Boolean).join(" · ") || t("Bot"))
      )
    ),
    (0, import_react22.createElement)(
      Card,
      { title: t("Profile") },
      (0, import_react22.createElement)(Row, { label: t("Name") }, (0, import_react22.createElement)(InlineText, { label: t("Name"), value: bot.name, placeholder: "Bob", required: true, maxLength: 40, onSave: (name) => save({ name }) })),
      (0, import_react22.createElement)(Row, { label: t("Label"), hint: t("Optional. Shown under the name.") }, (0, import_react22.createElement)(InlineText, { label: t("Label"), value: bot.role, placeholder: t("Research, admin…"), maxLength: 24, onSave: (role) => save({ role }) }))
    ),
    (0, import_react22.createElement)(
      Card,
      { title: t("Model") },
      (0, import_react22.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row" },
        (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, t("Model")), (0, import_react22.createElement)("span", { className: "bt-set-hint" }, modelHint(bot, roster))),
        (0, import_react22.createElement)(ModelMenu, { bot, roster, actions, run })
      )
    ),
    (0, import_react22.createElement)(
      Card,
      { title: t("Working folder") },
      (0, import_react22.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row" },
        (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, t("Folder"))),
        (0, import_react22.createElement)(FolderMenu, { value: bot.workDir, actions, run, onPick: (workDir) => save({ workDir }) })
      )
    ),
    (0, import_react22.createElement)(
      Card,
      { title: t("Instructions") },
      (0, import_react22.createElement)(
        Row,
        { label: t("What this Bot does"), hint: t("Its job on the team. Part of the Bot's system prompt."), stack: true },
        (0, import_react22.createElement)(InlineText, { label: t("Instructions"), value: bot.instructions, multiline: true, placeholder: t("What this Bot is responsible for…"), onSave: (instructions) => save({ instructions }) })
      )
    ),
    (0, import_react22.createElement)(BotCapabilitiesCard, { bot, roster, actions, run, Card, SwitchRow }),
    roster.memory === false ? null : (0, import_react22.createElement)(MemoryCard, { bot, actions }),
    (0, import_react22.createElement)(BotSchedules, { bot, roster, actions }),
    (0, import_react22.createElement)(
      Card,
      { title: t("Main Bot") },
      onlyMain ? (0, import_react22.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row" },
        (0, import_react22.createElement)(
          "span",
          { className: "bt-set-copy" },
          (0, import_react22.createElement)("span", { className: "bt-bs-label" }, t("Main Bot")),
          (0, import_react22.createElement)("span", { className: "bt-set-hint" }, t("The only Main Bot. To hand the role to another Bot, use Main Bot on the Bots page."))
        ),
        (0, import_react22.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => actions.openSettings("bots") }, t("Change"))
      ) : (0, import_react22.createElement)(SwitchRow, { label: t("Main Bot"), hint: t("Can create and change Bots, and runs every group chat."), on: isMainBot, onChange: (on) => run(actions.setMain(bot.id, on)) })
    ),
    // The Main Bot tile is always first and always shown, like in the context menu.
    isTile ? null : (0, import_react22.createElement)(
      Card,
      { title: t("Sidebar") },
      (0, import_react22.createElement)(SwitchRow, { label: t("Pin"), hint: t("Kept above the other chats."), on: bot.pinned === true, onChange: (pinned) => run(actions.setFlags(bot.id, { pinned })) }),
      isMainBot ? null : (0, import_react22.createElement)(SwitchRow, { label: t("Hide from sidebar"), hint: t("Search still finds it."), on: bot.hidden === true, onChange: (hidden) => run(actions.setFlags(bot.id, { hidden })) })
    ),
    (0, import_react22.createElement)(
      Card,
      { title: t("Manage") },
      (0, import_react22.createElement)(
        "button",
        { type: "button", className: "bt-set-row bt-bs-row", onClick: duplicate },
        (0, import_react22.createElement)("span", { className: "bt-set-copy" }, (0, import_react22.createElement)("span", { className: "bt-bs-label" }, t("Duplicate")), (0, import_react22.createElement)("span", { className: "bt-set-hint" }, t("A copy with the same job and model, and fresh memory."))),
        (0, import_react22.createElement)("span", { className: "bt-chevron" }, (0, import_react22.createElement)(ChevronRightIcon))
      ),
      isMainBot ? null : (0, import_react22.createElement)(
        "button",
        { type: "button", className: "bt-set-row bt-bs-row bt-bs-danger", "data-confirm": confirming || void 0, onClick: remove },
        (0, import_react22.createElement)(
          "span",
          { className: "bt-set-copy" },
          (0, import_react22.createElement)("span", { className: "bt-bs-label" }, confirming ? t("Delete {name}?", { name: bot.name }) : t("Delete Bot")),
          (0, import_react22.createElement)("span", { className: "bt-set-hint" }, confirming ? t("Click again to delete. Its chats are archived.") : t("Removes the Bot from the team."))
        ),
        (0, import_react22.createElement)("span", { className: "bt-chevron" }, (0, import_react22.createElement)(ChevronRightIcon))
      )
    )
  );
}
var BOT_SETTINGS_CSS = `
.bt-bs{display:flex;flex-direction:column;gap:18px}
.bt-bs-hero{display:flex;align-items:center;gap:14px;padding:2px 4px}
.bt-bs-who{display:flex;flex-direction:column;min-width:0;gap:2px}
.bt-bs-name{font-size:17px;line-height:24px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-bs-sub{font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-bs .bt-avedit{left:0;transform:none}
.bt-bs-row{min-height:48px}
label.bt-bs-row{cursor:text}
.bt-bs-row>.bt-set-copy{flex:1 1 auto}
.bt-bs-label{font-size:13px;line-height:18px;font-weight:500}
.bt-bs-row .bt-model-trigger{flex:none;max-width:58%}
.bt-bs-input{flex:0 1 220px;width:0;min-width:96px;height:30px;box-sizing:border-box;margin:-4px -6px -4px 0;padding:0 8px;border:1px solid transparent;border-radius:8px;background:none;color:var(--bt-ink);font:inherit;font-size:13px;text-align:right;outline:none;transition:background-color .12s ease,border-color .12s ease}
.bt-bs-input:hover{background:var(--bt-hover)}
.bt-bs-input:focus{background:var(--bt-main);border-color:var(--bt-line-2);text-align:left}
.bt-bs-input::placeholder{color:var(--bt-ink-3)}
.bt-bs-stack{flex-direction:column;align-items:stretch;gap:8px}
.bt-bs-area{flex:none;width:auto;min-height:112px;height:auto;margin:0 -6px -4px;padding:8px;line-height:19px;text-align:left;resize:vertical;background:var(--bt-hover)}
.bt-bs-area:hover{background:var(--bt-active)}
.bt-bs-danger .bt-bs-label{color:var(--bt-danger)}
.bt-bs-danger[data-confirm]{background:color-mix(in srgb,var(--bt-danger) 8%,transparent)}
.bt-bs-danger[data-confirm]:hover{background:color-mix(in srgb,var(--bt-danger) 12%,transparent)}
.bt-switch{position:relative;flex:none;width:36px;height:20px;padding:0;border:0;border-radius:999px;background:var(--bt-line-2);cursor:pointer;transition:background-color .2s ease}
.bt-switch[aria-checked=true]{background:var(--bt-accent)}
.bt-switch:disabled{opacity:.45;cursor:default}
.bt-switch:focus-visible{outline:2px solid var(--bt-accent);outline-offset:2px}
.bt-switch-knob{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:999px;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:${spring(SPRING_SHAPE, "transform")},${spring(SPRING_TAP, "width")}}
.bt-switch[aria-checked=true] .bt-switch-knob{transform:translateX(16px)}
.bt-switch:active:not(:disabled) .bt-switch-knob{width:21px}
.bt-switch[aria-checked=true]:active:not(:disabled) .bt-switch-knob{transform:translateX(11px)}
.bt-avedit :is(.bt-shapes,.bt-colors,.bt-dropzone){animation:bt-veil-in .18s ease-out}
@media (prefers-reduced-motion:reduce){.bt-switch,.bt-switch-knob{transition:none}.bt-avedit :is(.bt-shapes,.bt-colors,.bt-dropzone){animation:none}}
`;

// src/client/bot-draft.js
function randomLook(bots, avoid = {}, random = Math.random) {
  const worn = bots.map(lookOf);
  const fresh = (list, key) => {
    const rest = list.filter((value) => value !== avoid[key]);
    const unworn = rest.filter((value) => !worn.some((look) => look[key] === value));
    return unworn.length > 0 ? unworn : rest;
  };
  const pick = (list) => list[Math.floor(random() * list.length)];
  return { shape: pick(fresh(DEFAULT_SHAPES, "shape")), color: pick(fresh(DEFAULT_COLORS, "color")) };
}
function freshBotName(roster, base = "New Bot") {
  const taken = new Set(roster.bots.map((bot) => bot.name.toLowerCase()));
  if (!taken.has(base.toLowerCase())) return base;
  let index = 2;
  while (taken.has(`${base.toLowerCase()} ${index}`)) index += 1;
  return `${base} ${index}`;
}
function startModel(roster) {
  const models = (roster.models ?? []).filter((model) => !model.needsKey);
  return (models.find((model) => model.ref === roster.defaultModel) ?? models[0])?.ref ?? "";
}
function createPayload({ name, look, image, model, effort, brief }) {
  const payload = { name, color: look.color, avatar: image ? { shape: look.shape, image } : { shape: look.shape } };
  if (model) payload.model = model;
  if (effort) payload.effort = effort;
  if (brief) payload.brief = brief;
  return payload;
}

// src/client/create-bot.js
var import_react23 = require("react");
function CreateBot({ roster, actions, start, brief = "", onBack, canGoBack, onCreated, inline = false }) {
  const [look, setLook] = (0, import_react23.useState)(() => randomLook(roster.bots));
  const [image, setImage] = (0, import_react23.useState)(null);
  const [name, setName] = (0, import_react23.useState)(start?.name ?? "");
  const [model, setModel] = (0, import_react23.useState)(() => startModel(roster));
  const [effort, setEffort] = (0, import_react23.useState)(void 0);
  const [busy, setBusy] = (0, import_react23.useState)(false);
  const [error, setError] = (0, import_react23.useState)("");
  const fileRef = (0, import_react23.useRef)(null);
  const frame = (0, import_react23.useRef)(null);
  useEscape(onBack);
  (0, import_react23.useEffect)(() => {
    if (inline) frame.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, []);
  const fallbackName = freshBotName(roster, t("New Bot"));
  const finalName = name.trim() || fallbackName;
  const clash = roster.bots.some((bot) => bot.name.toLowerCase() === finalName.toLowerCase());
  const problem = nameProblem(finalName);
  const create = async () => {
    if (busy || clash || problem) return;
    setError("");
    setBusy(true);
    try {
      const bot = await actions.createBot(createPayload({ name: finalName, look, image, model, effort, brief }));
      onCreated(bot);
    } catch (failure) {
      setError(failure?.message ?? String(failure));
      setBusy(false);
    }
  };
  const upload = (file) => {
    if (!file) return;
    setError("");
    avatarImage(file).then(setImage, (failure) => setError(failure?.message ?? String(failure)));
  };
  const previewLook = image ? { ...look, image } : look;
  const card = (0, import_react23.createElement)(
    "div",
    { className: "bt-create-card" },
    (0, import_react23.createElement)(
      "div",
      { className: "bt-create-preview" },
      // The key remounts the mark, so every new pick plays the pop.
      (0, import_react23.createElement)(
        "span",
        { key: `${look.shape}:${look.color}:${image ? "photo" : ""}`, className: "bt-create-pop" },
        (0, import_react23.createElement)(BotMark, { look: previewLook, bot: { id: "new-bot" }, size: 88, live: true, gaze: true, pokeable: true })
      ),
      (0, import_react23.createElement)("span", { className: "bt-create-name" }, finalName)
    ),
    (0, import_react23.createElement)("div", { className: "bt-create-step" }, t("Look")),
    (0, import_react23.createElement)(
      "div",
      { className: "bt-create-looks" },
      (0, import_react23.createElement)(CharacterGrid, {
        look,
        hasPhoto: Boolean(image),
        onShape: (shape) => {
          setImage(null);
          setLook((current) => ({ ...current, shape }));
        },
        onColor: (color) => {
          setImage(null);
          setLook((current) => ({ ...current, color }));
        }
      }),
      (0, import_react23.createElement)(
        "div",
        { className: "bt-actions bt-create-lookbar" },
        (0, import_react23.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => {
          setImage(null);
          setLook((current) => randomLook(roster.bots, current));
        } }, t("Shuffle")),
        (0, import_react23.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => fileRef.current?.click() }, image ? t("Replace photo") : t("Upload photo")),
        image ? (0, import_react23.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => setImage(null) }, t("Remove photo")) : null,
        (0, import_react23.createElement)("input", { ref: fileRef, type: "file", accept: "image/png,image/jpeg,image/webp,image/gif", hidden: true, onChange: (event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          upload(file);
        } })
      )
    ),
    (0, import_react23.createElement)(
      "label",
      { className: "bt-field" },
      (0, import_react23.createElement)("span", { className: "bt-field-label" }, t("Name")),
      (0, import_react23.createElement)("input", {
        className: "bt-input",
        autoFocus: !inline,
        value: name,
        placeholder: fallbackName,
        maxLength: 40,
        "aria-label": t("Name"),
        onChange: (event) => setName(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter" && !event.nativeEvent.isComposing) {
            event.preventDefault();
            void create();
          }
        }
      }),
      problem ? (0, import_react23.createElement)("span", { className: "bt-note bt-danger" }, hostText(problem)) : clash ? (0, import_react23.createElement)("span", { className: "bt-note bt-danger" }, t("A Bot named {name} already exists", { name: finalName })) : null
    ),
    (0, import_react23.createElement)(
      "div",
      { className: "bt-field" },
      (0, import_react23.createElement)("span", { className: "bt-field-label" }, t("Model")),
      (0, import_react23.createElement)(ModelMenu, { bot: { id: "new-bot", name: finalName, model: model || void 0, effort }, roster, actions, wide: true, onPick: (ref) => {
        setModel(ref);
        setEffort(void 0);
      }, onPickEffort: setEffort }),
      (0, import_react23.createElement)("span", { className: "bt-note" }, (roster.models ?? []).some((entry) => !entry.needsKey) ? t("The Bot runs on this model. You can change it later in its details.") : t("Connect a model provider in Settings → Models first, or pick a model in the Bot's chat later."))
    ),
    error ? (0, import_react23.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, error) : null,
    (0, import_react23.createElement)(
      "div",
      { className: "bt-create-foot" },
      (0, import_react23.createElement)("button", { type: "button", className: "bt-soft", onClick: onBack }, canGoBack ? t("Back") : t("Cancel")),
      (0, import_react23.createElement)("button", { type: "button", className: "bt-send bt-create-go", disabled: busy || clash || Boolean(problem), onClick: () => void create() }, busy ? t("Creating…") : t("Create"))
    )
  );
  if (inline) return (0, import_react23.createElement)("div", { ref: frame, className: "bt-create-inline", role: "group", "aria-label": t("Create Bot") }, card);
  return (0, import_react23.createElement)(
    "div",
    { className: "bt-create", role: "dialog", "aria-label": t("Create Bot") },
    (0, import_react23.createElement)(
      "div",
      { className: "bt-create-head" },
      canGoBack ? (0, import_react23.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Back to new chat"), onClick: onBack }, (0, import_react23.createElement)(ChevronLeftIcon)) : (0, import_react23.createElement)("span", { className: "bt-create-gap" }),
      (0, import_react23.createElement)("span", { className: "bt-create-title" }, t("Create Bot")),
      (0, import_react23.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Close"), onClick: () => actions.closeOverlay() }, (0, import_react23.createElement)(CloseIcon))
    ),
    (0, import_react23.createElement)("div", { className: "bt-create-body" }, card)
  );
}

// src/client/new-chat.js
var import_react24 = require("react");
function NewChat({ mode, roster, actions }) {
  const [query, setQuery] = (0, import_react24.useState)("");
  const [picked, setPicked] = (0, import_react24.useState)([]);
  const [group, setGroup] = (0, import_react24.useState)(mode === "group");
  const [admin, setAdmin] = (0, import_react24.useState)(null);
  const [message, setMessage] = (0, import_react24.useState)("");
  const [busy, setBusy] = (0, import_react24.useState)(false);
  const [error, setError] = (0, import_react24.useState)("");
  const [cursor, setCursor] = (0, import_react24.useState)(0);
  const [draft, setDraft] = (0, import_react24.useState)(mode === "create" ? { name: "", fromList: false } : null);
  const inputRef = (0, import_react24.useRef)(null);
  const close = () => actions.closeOverlay();
  useEscape(close);
  const paneLeft = usePaneLeft();
  const wanted = query.trim().toLowerCase();
  const matches = roster.bots.filter((bot) => !picked.includes(bot.id) && bot.id !== admin && (wanted === "" || bot.name.toLowerCase().includes(wanted) || (bot.role ?? "").toLowerCase().includes(wanted)));
  const choosingAdmin = group && admin === null;
  const exact = roster.bots.some((bot) => bot.name.toLowerCase() === wanted);
  const pickedBots = picked.map((id) => roster.byId[id]).filter(Boolean);
  const run = async (task) => {
    if (busy) return;
    setError("");
    setBusy(true);
    try {
      await task();
    } catch (failure) {
      setError(failure?.message ?? String(failure));
    } finally {
      setBusy(false);
    }
  };
  const pick = (bot) => {
    setPicked((current) => [...current, bot.id]);
    setQuery("");
    setCursor(0);
    inputRef.current?.focus();
  };
  const chooseAdmin = (bot) => {
    setAdmin(bot.id);
    setQuery("");
    setCursor(0);
    inputRef.current?.focus();
  };
  const openBot = (bot) => run(async () => {
    if (choosingAdmin) {
      chooseAdmin(bot);
      return;
    }
    if (group || picked.length > 0) {
      pick(bot);
      return;
    }
    if (bot.hidden) await actions.setFlags(bot.id, { hidden: false });
    if (message.trim()) await actions.send(bot.id, message.trim());
    actions.openSession(bot.id);
    close();
  });
  const createBot = () => {
    if (busy) return;
    setError("");
    setDraft({ name: query.trim() !== "" && !exact ? query.trim() : "", fromList: true });
  };
  const created = (bot) => {
    close();
    actions.openSession(bot.id);
    actions.showDetails(bot.id, "settings");
  };
  const makeGroup = async () => {
    if (admin === null || picked.length === 0) return;
    const text = message.trim();
    const room2 = await actions.createRoom([admin, ...picked], { admin, ...text ? {} : { greet: true } });
    if (text) await actions.send(room2.id, text);
    actions.openSession(room2.id);
    close();
  };
  const createGroup = () => run(makeGroup);
  const sendMessage = () => run(async () => {
    const text = message.trim();
    if (group && admin !== null) {
      await makeGroup();
      return;
    }
    if (text === "" || picked.length === 0) return;
    if (picked.length === 1) {
      await actions.send(picked[0], text);
      actions.openSession(picked[0]);
      close();
      return;
    }
    const room2 = await actions.createRoom(picked);
    await actions.send(room2.id, text);
    actions.openSession(room2.id);
    close();
  });
  const options = [];
  if (!group && picked.length === 0 && mode !== "search" && wanted === "") {
    options.push({ key: "new", icon: (0, import_react24.createElement)(PlusIcon), label: t("Create new Bot"), run: createBot });
    options.push({ key: "group", icon: (0, import_react24.createElement)(PeopleIcon), label: t("Create group chat"), run: () => {
      setGroup(true);
      setCursor(0);
      inputRef.current?.focus();
    } });
    if ((roster.agents ?? []).length === 0 && actions.addAgent) {
      options.push({ key: "agent", icon: (0, import_react24.createElement)(AgentIcon, { size: 16 }), label: t("Add Engine Agent"), run: () => run(async () => {
        await actions.addAgent();
        close();
      }) });
    }
  }
  for (const bot of matches) {
    options.push({ key: bot.id, bot, label: bot.name, hint: choosingAdmin ? t("Make admin") : group || picked.length > 0 ? t("Add to group chat") : void 0, run: () => openBot(bot) });
  }
  if (wanted !== "" && !exact && mode !== "search") options.push({ key: "create", icon: (0, import_react24.createElement)(PlusIcon), label: t("Create new Bot “{name}”", { name: query.trim() }), run: createBot });
  const active = Math.min(cursor, Math.max(options.length - 1, 0));
  const listed = options.map((option) => option.key).join("\n");
  const glide = useGlide(`${active}
${listed}`, { axis: "y", ...QUICK_EDGES });
  useFlip(glide.box, listed, "[data-flip]");
  const drop = (0, import_react24.useRef)(null);
  useMorph(drop, listed);
  if (draft) {
    return (0, import_react24.createElement)(
      "div",
      { className: "bt-pane", style: { left: paneLeft } },
      (0, import_react24.createElement)(CreateBot, {
        roster,
        actions,
        start: draft,
        brief: message.trim(),
        canGoBack: draft.fromList,
        onBack: draft.fromList ? () => {
          setDraft(null);
          setTimeout(() => inputRef.current?.focus());
        } : close,
        onCreated: created
      })
    );
  }
  const adminBot = admin === null ? void 0 : roster.byId[admin];
  const recipients = adminBot ? [adminBot, ...pickedBots] : pickedBots;
  const placeholder = recipients.length > 0 ? t("Message {name}", { name: recipients.map((bot) => bot.name).join(t(" and ")) }) : t("Message Bot");
  const unpick = () => {
    if (picked.length > 0) setPicked((current) => current.slice(0, -1));
    else if (admin !== null) setAdmin(null);
  };
  return (0, import_react24.createElement)(
    "div",
    { className: "bt-pane", style: { left: paneLeft } },
    (0, import_react24.createElement)(
      "div",
      { className: "bt-newchat", role: "dialog", "aria-label": mode === "search" ? t("Search") : t("New chat") },
      (0, import_react24.createElement)(
        "div",
        { className: "bt-to" },
        (0, import_react24.createElement)("span", { className: "bt-to-label" }, t("To:")),
        adminBot ? (0, import_react24.createElement)(
          "span",
          { key: adminBot.id, className: "bt-token bt-token-admin", title: t("Admin") },
          (0, import_react24.createElement)(BotMark, { bot: adminBot, size: 16 }),
          adminBot.name,
          (0, import_react24.createElement)(AdminStar),
          (0, import_react24.createElement)("button", { type: "button", "aria-label": t("Remove {name}", { name: adminBot.name }), onClick: () => setAdmin(null) }, "×")
        ) : null,
        choosingAdmin ? (0, import_react24.createElement)("span", { className: "bt-to-star", "aria-hidden": true }, (0, import_react24.createElement)(AdminStar)) : null,
        pickedBots.map((bot) => (0, import_react24.createElement)(
          "span",
          { key: bot.id, className: "bt-token" },
          (0, import_react24.createElement)(BotMark, { bot, size: 16 }),
          bot.name,
          (0, import_react24.createElement)("button", { type: "button", "aria-label": t("Remove {name}", { name: bot.name }), onClick: () => setPicked((current) => current.filter((id) => id !== bot.id)) }, "×")
        )),
        (0, import_react24.createElement)("input", {
          ref: inputRef,
          autoFocus: true,
          value: query,
          "aria-label": t("Recipient"),
          placeholder: mode === "search" ? t("Search Bots…") : choosingAdmin ? t("Choose the group admin") : group ? t("Who to chat with…") : t("Start a chat with…"),
          onChange: (event) => {
            setQuery(event.target.value);
            setCursor(0);
          },
          onKeyDown: (event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setCursor(Math.min(active + 1, options.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setCursor(Math.max(active - 1, 0));
            } else if (event.key === "Enter" && options[active]) {
              event.preventDefault();
              options[active].run();
            } else if (event.key === "Backspace" && query === "") unpick();
          }
        }),
        group && admin !== null ? (0, import_react24.createElement)("button", {
          type: "button",
          className: "bt-send bt-to-create",
          disabled: busy || picked.length === 0,
          title: picked.length === 0 ? t("Add at least one more Bot") : void 0,
          onClick: createGroup
        }, t("Create group chat")) : null,
        (0, import_react24.createElement)("button", { type: "button", className: "bt-x", "aria-label": t("Close new chat"), onClick: close }, "×")
      ),
      (0, import_react24.createElement)(
        "div",
        { ref: drop, className: "bt-drop" },
        (0, import_react24.createElement)(
          "div",
          { ref: glide.box, role: "listbox", "aria-label": t("Recipients"), className: "bt-drop-list" },
          (0, import_react24.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
          options.length === 0 ? (0, import_react24.createElement)("div", { className: "bt-hint" }, mode === "search" ? t("No Bots match") : t("Type a name to create a Bot")) : options.map((option, index) => (0, import_react24.createElement)(
            "button",
            {
              key: option.key,
              type: "button",
              role: "option",
              className: "bt-option",
              "aria-selected": index === active,
              "data-flip": option.key,
              onMouseEnter: () => setCursor(index),
              onClick: option.run
            },
            option.bot ? (0, import_react24.createElement)(BotMark, { bot: option.bot, size: 22 }) : (0, import_react24.createElement)("span", { className: "bt-option-icon" }, option.icon),
            (0, import_react24.createElement)("span", { className: "bt-option-label" }, option.label),
            option.hint && index === active ? (0, import_react24.createElement)("span", { className: "bt-option-hint" }, option.hint) : null
          ))
        )
      ),
      (0, import_react24.createElement)("div", { className: "bt-nc-spacer" }),
      error ? (0, import_react24.createElement)("div", { className: "bt-error" }, error) : null,
      (0, import_react24.createElement)(
        "div",
        { className: "bt-nc-compose" },
        (0, import_react24.createElement)(
          "div",
          { className: "bt-nc-card" },
          (0, import_react24.createElement)("span", { className: "bt-nc-plus", "aria-hidden": true }, (0, import_react24.createElement)(PlusIcon)),
          (0, import_react24.createElement)("textarea", {
            rows: 1,
            value: message,
            placeholder,
            "aria-label": placeholder,
            onChange: (event) => setMessage(event.target.value),
            onKeyDown: (event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                sendMessage();
              }
            }
          }),
          (0, import_react24.createElement)("button", { type: "button", className: "bt-nc-send", "aria-label": t("Send message"), disabled: busy || message.trim() === "" || picked.length === 0, onClick: sendMessage }, (0, import_react24.createElement)(ArrowUpIcon))
        )
      )
    )
  );
}

// src/client/exchange.js
var import_react25 = require("react");
var SHEET_EXIT_MS = 220;
function ExchangeDialog({ pair, roster, actions }) {
  const [entries2, setEntries] = (0, import_react25.useState)(null);
  const [leaving, setLeaving] = (0, import_react25.useState)(false);
  const log = (0, import_react25.useRef)(null);
  const atEnd = (0, import_react25.useRef)(true);
  (0, import_react25.useLayoutEffect)(() => {
    if (entries2 !== null && atEnd.current && log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [entries2]);
  const close = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => actions.closeExchange(), SHEET_EXIT_MS);
  };
  useEscape(close);
  (0, import_react25.useEffect)(() => {
    let stop = false;
    let timer;
    let seen = null;
    atEnd.current = true;
    setEntries(null);
    const load = async () => {
      const result = await actions.exchange(pair[0], pair[1]);
      if (stop) return;
      const key = JSON.stringify(result ?? []);
      if (key !== seen) {
        seen = key;
        setEntries(result ?? []);
      }
      timer = setTimeout(load, document.hidden ? 8e3 : 2e3);
    };
    void load();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [pair[0], pair[1]]);
  const left = roster.byId[pair[0]];
  const right = roster.byId[pair[1]];
  let lastDay = 0;
  const paneLeft = usePaneLeft();
  return (0, import_react25.createElement)(
    "div",
    { className: "bt-pane bt-exchange", style: { left: paneLeft }, "data-leaving": leaving || void 0 },
    (0, import_react25.createElement)(
      "div",
      { className: "bt-dialog", role: "dialog", "aria-label": t("Bot exchange") },
      (0, import_react25.createElement)("div", { className: "bt-head" }, (0, import_react25.createElement)(
        "span",
        { className: "bt-pill", style: { cursor: "default" } },
        left ? (0, import_react25.createElement)(BotMark, { bot: left, size: 22 }) : null,
        left?.name ?? "?",
        (0, import_react25.createElement)("span", { className: "bt-swap" }, "⇄"),
        right ? (0, import_react25.createElement)(BotMark, { bot: right, size: 22 }) : null,
        right?.name ?? "?"
      )),
      (0, import_react25.createElement)(
        "div",
        { ref: log, className: "bt-dialog-log", role: "log", "aria-label": t("Bot exchange transcript"), onScroll: (event) => {
          const node = event.currentTarget;
          atEnd.current = node.scrollHeight - node.scrollTop - node.clientHeight < 2;
        } },
        entries2 === null ? (0, import_react25.createElement)("div", { className: "bt-hint" }, t("Loading…")) : entries2.length === 0 ? (0, import_react25.createElement)("div", { className: "bt-hint" }, t("No messages yet")) : entries2.map((entry) => {
          const bot = roster.byId[entry.from] ?? { id: entry.from, name: t("You"), color: "gray" };
          const showDay = entry.time - lastDay > 30 * 60 * 1e3;
          lastDay = entry.time;
          const whole = entry.length === void 0 ? void 0 : { length: entry.length, load: () => actions.exchangeText(entry.id) };
          return (0, import_react25.createElement)(
            import_react25.Fragment,
            { key: entry.id },
            showDay ? (0, import_react25.createElement)("time", { className: "bt-time" }, dayLabel(entry.time)) : null,
            (0, import_react25.createElement)(
              "div",
              { className: "bt-group-msg" },
              (0, import_react25.createElement)("span", { className: "bt-group-name", style: { color: inkText(colorOf(bot)) } }, bot.name),
              (0, import_react25.createElement)(Bubbles, { texts: [stripLongNote(entry.text)], roster, selfId: bot.id, actions, whole, lead: (0, import_react25.createElement)("span", { className: "bt-lead" }, (0, import_react25.createElement)(BotMark, { bot, size: 22 })) })
            )
          );
        })
      ),
      (0, import_react25.createElement)("div", { className: "bt-dialog-foot" }, (0, import_react25.createElement)("button", { type: "button", className: "bt-soft", onClick: close }, t("Close Chat")))
    )
  );
}

// src/client/permission-picker.js
var import_react26 = require("react");
var LABELS = { "read-only": "Read only", "workspace-write": "Workspace", "danger-full-access": "Full access" };
var DANGER = /* @__PURE__ */ new Set(["danger-full-access"]);
var presetDanger = (value) => DANGER.has(value);
var presetName = (value, catalog) => LABELS[value] ? t(LABELS[value]) : catalog?.options?.find((option) => option.value === value)?.name ?? value;
function PermissionPicker({ catalog, saved, onPick, repick = false }) {
  const [pending, setPending] = (0, import_react26.useState)(null);
  const flight = (0, import_react26.useRef)({ value: void 0, latest: void 0 });
  (0, import_react26.useEffect)(() => {
    const flying = flight.current.value;
    if (pending === saved && (flying === void 0 || flying === pending)) setPending(null);
  }, [pending, saved]);
  const send = (value) => {
    flight.current.value = value;
    void Promise.resolve(onPick(value)).then((done) => done !== false, () => false).then((ok) => {
      const wanted = flight.current.latest;
      flight.current.latest = void 0;
      if (wanted !== void 0 && !(wanted === value && ok)) {
        send(wanted);
        return;
      }
      flight.current.value = void 0;
      if (!ok) setPending(null);
    });
  };
  const current = pending ?? saved;
  const pick = (value) => {
    if (value === current && !repick) return;
    setPending(value);
    if (flight.current.value !== void 0) {
      flight.current.latest = value;
      return;
    }
    send(value);
  };
  return (0, import_react26.createElement)(
    Segmented,
    { label: t("Permissions"), value: current },
    catalog.options.map((option) => (0, import_react26.createElement)("button", {
      key: option.value,
      type: "button",
      "aria-pressed": option.value === current,
      title: option.description,
      onClick: () => pick(option.value),
      className: presetDanger(option.value) ? "bt-perm-danger" : void 0
    }, presetName(option.value, catalog)))
  );
}

// src/client/group-settings.js
var import_react27 = require("react");
var ROOM_MODES = [
  ["admin", "Admin leads", "Plain messages go to the admin, who calls others with @Name."],
  ["everyone", "Everyone", "Every member answers in turn, admin first."]
];
var shownMode = (room2, roster) => roster.byId[room2.admin] ? room2.mode : "everyone";
function roomSubtitle(room2, roster) {
  const admin = roster.byId[room2.admin];
  return [t("{count} members", { count: room2.members.length }), admin ? t("Admin {name}", { name: admin.name }) : t("No admin")].join(" · ");
}
function GroupPermission({ room: room2, catalog, update }) {
  if (!catalog?.options?.length) return null;
  const shared2 = room2.permission !== void 0;
  return (0, import_react27.createElement)(
    Card,
    { title: t("Permissions") },
    (0, import_react27.createElement)(SwitchRow, {
      label: t("Same for every member"),
      hint: t("Replaces each member's own permissions in this group."),
      on: shared2,
      onChange: (on) => update({ permission: on ? catalog.defaultPreset ?? catalog.options[0].value : null })
    }),
    shared2 ? (0, import_react27.createElement)(
      "div",
      { className: "bt-set-row bt-bs-row bt-bs-stack bt-gs-perm bt-veil" },
      (0, import_react27.createElement)(PermissionPicker, { catalog, saved: room2.permission, onPick: (permission) => update({ permission }) })
    ) : null
  );
}
function GroupSettingsForm({ room: room2, roster, actions, run, onDeleted }) {
  const [adding, setAdding] = (0, import_react27.useState)(false);
  const [confirming, setConfirming] = (0, import_react27.useState)(false);
  (0, import_react27.useEffect)(() => {
    if (!confirming) return void 0;
    const timer = setTimeout(() => setConfirming(false), 4e3);
    return () => clearTimeout(timer);
  }, [confirming]);
  const members = room2.members.map((id) => roster.byId[id]).filter(Boolean);
  const outside = roster.bots.filter((bot) => !room2.members.includes(bot.id));
  const admin = roster.byId[room2.admin];
  const mode = shownMode(room2, roster);
  const modeHint = ROOM_MODES.find(([id]) => id === mode)?.[2] ?? "";
  const update = (patch) => run(actions.updateRoom(room2.id, patch));
  const openBot = (id) => {
    actions.closeSettings();
    actions.openSession(id);
  };
  const remove = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    void Promise.resolve(run(actions.deleteRoom(room2.id))).then((done) => {
      if (done) onDeleted?.();
    });
  };
  return (0, import_react27.createElement)(
    "div",
    { className: "bt-bs" },
    (0, import_react27.createElement)(
      "div",
      { className: "bt-bs-hero" },
      (0, import_react27.createElement)(RoomAvatar, { room: room2, roster, size: 64 }),
      (0, import_react27.createElement)(
        "div",
        { className: "bt-bs-who" },
        (0, import_react27.createElement)("span", { className: "bt-bs-name" }, room2.name),
        (0, import_react27.createElement)("span", { className: "bt-bs-sub" }, roomSubtitle(room2, roster))
      )
    ),
    (0, import_react27.createElement)(
      Card,
      { title: t("Profile") },
      (0, import_react27.createElement)(
        Row,
        { label: t("Name"), hint: t("Leave it empty to name the group after its members.") },
        (0, import_react27.createElement)(InlineText, { label: t("Group name"), value: room2.named ? room2.name : "", placeholder: t("Name after members"), maxLength: 60, onSave: (name) => update({ name }) })
      ),
      (0, import_react27.createElement)(
        Row,
        { label: t("Notice"), hint: t("Every member reads it before speaking in this group."), stack: true },
        (0, import_react27.createElement)(InlineText, { label: t("Group notice"), value: room2.notice, multiline: true, maxLength: 2e3, placeholder: t("Shared instructions every member reads before speaking…"), onSave: (notice) => update({ notice }) })
      )
    ),
    (0, import_react27.createElement)(
      Card,
      { title: t("Who answers") },
      (0, import_react27.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row bt-bs-stack" },
        (0, import_react27.createElement)(Segmented, { label: t("Who answers"), value: mode }, ROOM_MODES.map(([id, label]) => (0, import_react27.createElement)("button", {
          key: id,
          type: "button",
          "aria-pressed": mode === id,
          disabled: id === "admin" && !admin,
          title: id === "admin" && !admin ? t("Choose an admin first") : void 0,
          onClick: () => {
            if (mode !== id) void update({ mode: id });
          }
        }, t(label)))),
        (0, import_react27.createElement)("span", { key: mode, className: "bt-set-hint bt-veil" }, `${t(modeHint)} ${t("@mentions always pick who answers.")}`)
      )
    ),
    (0, import_react27.createElement)(
      Card,
      { title: t("Working folder") },
      (0, import_react27.createElement)(
        "div",
        { className: "bt-set-row bt-bs-row" },
        (0, import_react27.createElement)("span", { className: "bt-set-copy" }, (0, import_react27.createElement)("span", { className: "bt-bs-label" }, t("Folder"))),
        (0, import_react27.createElement)(FolderMenu, { value: room2.workDir, group: true, actions, run, onPick: (workDir) => update({ workDir }) })
      )
    ),
    (0, import_react27.createElement)(GroupPermission, { room: room2, catalog: roster.permissions, update }),
    (0, import_react27.createElement)(
      Card,
      { title: t("Members · {count}", { count: members.length }) },
      members.map((member) => {
        const leads = room2.admin === member.id;
        return (0, import_react27.createElement)(
          "div",
          { key: member.id, className: "bt-set-row bt-bs-row bt-gs-member" },
          (0, import_react27.createElement)(
            "button",
            { type: "button", className: "bt-gs-who", title: t("Open {name}'s chat", { name: member.name }), onClick: () => openBot(member.id) },
            (0, import_react27.createElement)(BotAvatar, { bot: member, size: 26, main: isMainOf(roster, member.id), admin: leads, live: false }),
            (0, import_react27.createElement)("span", { className: "bt-row-title" }, member.name),
            leads ? (0, import_react27.createElement)("span", { className: "bt-tag" }, t("Admin")) : null
          ),
          leads ? (0, import_react27.createElement)("button", { type: "button", className: "bt-mini", title: t("Leave the group without an admin"), onClick: () => update({ admin: null }) }, t("Unset")) : (0, import_react27.createElement)("button", { type: "button", className: "bt-mini", onClick: () => update({ admin: member.id }) }, t("Make admin")),
          members.length > 2 ? (0, import_react27.createElement)("button", { type: "button", className: "bt-x", "aria-label": t("Remove {name} from the group", { name: member.name }), title: t("Remove from group"), onClick: () => update({ remove: [member.id] }) }, "×") : null
        );
      }),
      adding ? [
        ...outside.map((bot) => (0, import_react27.createElement)(
          "button",
          { key: bot.id, type: "button", className: "bt-set-row bt-bs-row bt-gs-pick", onClick: () => {
            setAdding(false);
            void update({ add: [bot.id] });
          } },
          (0, import_react27.createElement)(BotMark, { bot, size: 22 }),
          (0, import_react27.createElement)("span", { className: "bt-set-copy" }, (0, import_react27.createElement)("span", { className: "bt-bs-label" }, bot.name)),
          (0, import_react27.createElement)("span", { className: "bt-set-hint" }, t("Add"))
        )),
        (0, import_react27.createElement)("button", { key: "cancel", type: "button", className: "bt-set-row bt-bs-row bt-gs-add", onClick: () => setAdding(false) }, t("Cancel"))
      ] : outside.length > 0 ? (0, import_react27.createElement)("button", { type: "button", className: "bt-set-row bt-bs-row bt-gs-add", onClick: () => setAdding(true) }, (0, import_react27.createElement)(PlusIcon), t("Add member")) : null,
      (0, import_react27.createElement)("div", { className: "bt-set-row bt-gs-note" }, (0, import_react27.createElement)(
        "span",
        { className: "bt-set-hint" },
        // The host checks for two members on every change, even a rename.
        members.length < 2 ? t("Add a Bot first: a group chat needs at least two.") : admin ? t("{name} leads this group: it can call members with @Name, change the group, and post here.", { name: admin.name }) : t("No admin yet. An admin can call members with @Name, change the group, and post here.")
      ))
    ),
    (0, import_react27.createElement)(
      Card,
      { title: t("Sidebar") },
      (0, import_react27.createElement)(SwitchRow, { label: t("Pin"), hint: t("Kept above the other chats."), on: room2.pinned === true, onChange: (pinned) => run(actions.setFlags(room2.id, { pinned })) }),
      (0, import_react27.createElement)(SwitchRow, { label: t("Hide from sidebar"), hint: t("Search still finds it."), on: room2.hidden === true, onChange: (hidden) => run(actions.setFlags(room2.id, { hidden })) })
    ),
    (0, import_react27.createElement)(
      Card,
      { title: t("Manage") },
      (0, import_react27.createElement)(
        "button",
        { type: "button", className: "bt-set-row bt-bs-row bt-bs-danger", "data-confirm": confirming || void 0, onClick: remove },
        (0, import_react27.createElement)(
          "span",
          { className: "bt-set-copy" },
          (0, import_react27.createElement)("span", { className: "bt-bs-label" }, confirming ? t("Delete {name}?", { name: room2.name }) : t("Delete group")),
          (0, import_react27.createElement)("span", { className: "bt-set-hint" }, confirming ? t("Click again to delete. Its history is archived.") : t("Removes the group chat. Its members stay on the team."))
        ),
        (0, import_react27.createElement)("span", { className: "bt-chevron" }, (0, import_react27.createElement)(ChevronRightIcon))
      )
    )
  );
}
function NewGroupForm({ roster, actions, run, onCreated, onCancel }) {
  const [admin, setAdmin] = (0, import_react27.useState)(null);
  const [members, setMembers] = (0, import_react27.useState)([]);
  const [name, setName] = (0, import_react27.useState)("");
  const [busy, setBusy] = (0, import_react27.useState)(false);
  const toggle = (id) => setMembers((list) => list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  const pickAdmin = (id) => {
    setAdmin(id);
    setMembers((list) => list.filter((item) => item !== id));
  };
  const create = async () => {
    if (busy || admin === null || members.length === 0) return;
    setBusy(true);
    let room2;
    const done = await run(actions.createRoom([admin, ...members], { admin, greet: true, ...name.trim() ? { name: name.trim() } : {} }).then((value) => {
      room2 = value;
    }));
    if (done && room2) onCreated(room2);
    else setBusy(false);
  };
  const chip = (bot, on, onClick, role) => (0, import_react27.createElement)("button", {
    key: bot.id,
    type: "button",
    role,
    className: "bt-ng-chip",
    "aria-checked": on,
    onClick
  }, (0, import_react27.createElement)(BotAvatar, { bot, size: 22, badge: false, live: false }), (0, import_react27.createElement)("span", { className: "bt-ng-name" }, bot.name), on && role === "radio" ? (0, import_react27.createElement)(AdminStar) : null);
  return (0, import_react27.createElement)(
    "div",
    { className: "bt-set-card bt-ng" },
    (0, import_react27.createElement)(
      "div",
      { className: "bt-set-row bt-bs-row bt-bs-stack" },
      (0, import_react27.createElement)("span", { className: "bt-set-copy" }, (0, import_react27.createElement)("span", { className: "bt-bs-label bt-ng-label" }, (0, import_react27.createElement)(AdminStar), t("Choose the group admin"))),
      (0, import_react27.createElement)(
        "div",
        { className: "bt-ng-picks", role: "radiogroup", "aria-label": t("Group admin") },
        roster.bots.map((bot) => chip(bot, admin === bot.id, () => pickAdmin(bot.id), "radio"))
      )
    ),
    admin === null ? null : (0, import_react27.createElement)(
      "div",
      { className: "bt-set-row bt-bs-row bt-bs-stack bt-ng-step" },
      (0, import_react27.createElement)("span", { className: "bt-set-copy" }, (0, import_react27.createElement)("span", { className: "bt-bs-label" }, t("Who to chat with…"))),
      (0, import_react27.createElement)(
        "div",
        { className: "bt-ng-picks", role: "group", "aria-label": t("Members") },
        roster.bots.filter((bot) => bot.id !== admin).map((bot) => chip(bot, members.includes(bot.id), () => toggle(bot.id), "checkbox"))
      )
    ),
    admin === null || members.length === 0 ? null : (0, import_react27.createElement)(
      "label",
      { className: "bt-set-row bt-bs-row bt-ng-step" },
      (0, import_react27.createElement)("span", { className: "bt-set-copy" }, (0, import_react27.createElement)("span", { className: "bt-bs-label" }, t("Name"))),
      (0, import_react27.createElement)("input", { className: "bt-bs-input", value: name, maxLength: 60, placeholder: t("Name after members"), onChange: (event) => setName(event.target.value) })
    ),
    (0, import_react27.createElement)(
      "div",
      { className: "bt-set-row bt-task-foot" },
      (0, import_react27.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onCancel }, t("Cancel")),
      (0, import_react27.createElement)("button", { type: "button", className: "bt-send bt-soft-sm", disabled: busy || admin === null || members.length === 0, onClick: () => void create() }, t("Create group chat"))
    )
  );
}
var GROUP_SETTINGS_CSS = `
.bt-ng{animation:bt-q-in .4s cubic-bezier(.22,1,.36,1),bt-veil-in .2s ease-out}
.bt-ng-step{animation:bt-veil-in .22s ease-out}
.bt-ng-label{display:inline-flex;align-items:center;gap:6px}
.bt-ng-picks{display:flex;flex-wrap:wrap;gap:6px}
.bt-ng-chip{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 10px 0 5px;border-radius:999px;border:.5px solid var(--bt-line);background:var(--bt-card);color:var(--bt-ink-2);font:inherit;font-size:13px;cursor:pointer;transition:background-color .12s ease,color .12s ease,border-color .12s ease,scale .3s cubic-bezier(.34,1.56,.64,1)}
.bt-ng-chip:hover{background:var(--bt-hover);color:var(--bt-ink)}
.bt-ng-chip:active{scale:.96}
.bt-ng-chip[aria-checked=true]{background:var(--bt-active);border-color:var(--bt-line-2);color:var(--bt-ink)}
.bt-ng-chip .bt-admin-star{animation:bt-check-pop .4s cubic-bezier(.34,1.56,.64,1)}
.bt-ng-name{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.bt-ng,.bt-ng-step,.bt-ng-chip .bt-admin-star{animation:none}}
.bt-gs-member{gap:8px}
.bt-gs-who{flex:1;display:flex;align-items:center;gap:8px;min-width:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.bt-gs-who .bt-row-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-gs-who:hover .bt-row-title{text-decoration:underline;text-underline-offset:2px}
.bt-gs-add{gap:8px;color:var(--bt-ink-2)}
.bt-gs-pick{gap:10px;animation:bt-rise .16s ease-out}
.bt-bs-stack .bt-seg{align-self:stretch}
.bt-gs-perm .bt-seg button{flex:auto;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.bt-gs-pick{animation:none}}
`;

// src/client/usage-data.js
var HOUR = 0;
var OWNER = 1;
var MODEL = 2;
var KIND = 3;
var HOUR_MS = 36e5;
var DAY_MS = 864e5;
var RANGES = [
  { id: "24h", unit: "hour", count: 24, stride: 6 },
  { id: "7d", unit: "day", count: 7, stride: 1 },
  { id: "30d", unit: "day", count: 30, stride: 5 },
  { id: "12w", unit: "week", count: 12, stride: 2 },
  { id: "12m", unit: "month", count: 12, stride: 1 }
];
var hourMs = (key) => Date.UTC(Number(key.slice(0, 4)), Number(key.slice(5, 7)) - 1, Number(key.slice(8, 10)), Number(key.slice(11, 13)) || 0);
var dayKey = (ms) => new Date(ms).toISOString().slice(0, 10);
var hourKey = (ms) => new Date(ms).toISOString().slice(0, 13).replace("T", " ");
var mondayOf = (ms) => ms - (new Date(ms).getUTCDay() + 6) % 7 * DAY_MS;
function spanRange(from, to) {
  if (to < from) [from, to] = [to, from];
  const days = Math.round((hourMs(to) - hourMs(from)) / DAY_MS) + 1;
  const unit = days <= 2 ? "hour" : days <= 62 ? "day" : days <= 182 ? "week" : "month";
  const range = { id: "custom", unit, from, to, days };
  const count = spanBuckets(range).length;
  const stride = unit === "hour" ? 6 : [1, 2, 3, 5, 7, 10, 14].find((step) => count / step <= 12) ?? Math.ceil(count / 12);
  return { ...range, count, stride };
}
function spanBuckets(range) {
  const first = hourMs(range.from);
  const end = hourMs(range.to) + DAY_MS;
  const buckets = [];
  if (range.unit === "hour" || range.unit === "day") {
    const step = range.unit === "hour" ? HOUR_MS : DAY_MS;
    for (let start = first; start < end; start += step) buckets.push({ start, end: start + step, key: range.unit === "hour" ? hourKey(start) : dayKey(start) });
  } else if (range.unit === "week") {
    for (let monday = mondayOf(first); monday < end; monday += 7 * DAY_MS) {
      buckets.push({ start: Math.max(monday, first), end: Math.min(monday + 7 * DAY_MS, end), key: dayKey(monday) });
    }
  } else {
    const year = new Date(first).getUTCFullYear();
    for (let month = new Date(first).getUTCMonth(); Date.UTC(year, month, 1) < end; month += 1) {
      const start = Date.UTC(year, month, 1);
      buckets.push({ start: Math.max(start, first), end: Math.min(Date.UTC(year, month + 1, 1), end), key: dayKey(start).slice(0, 7) });
    }
  }
  return buckets;
}
function spanOf(range, now) {
  if (range.from) {
    return { buckets: spanBuckets(range), from: `${range.from} 00`, to: `${range.to} 23`, before: hourKey(hourMs(range.from) - range.days * DAY_MS) };
  }
  const buckets = bucketsOf(range, now);
  return { buckets: buckets.slice(range.count), from: hourKey(buckets[range.count].start), to: now, before: hourKey(buckets[0].start) };
}
function bucketsOf(range, now) {
  const end = hourMs(now);
  const today = end - end % DAY_MS;
  const buckets = [];
  for (let back = range.count * 2 - 1; back >= 0; back -= 1) {
    let start;
    if (range.unit === "hour") start = end - back * HOUR_MS;
    else if (range.unit === "day") start = today - back * DAY_MS;
    else if (range.unit === "week") start = mondayOf(today) - back * 7 * DAY_MS;
    else start = Date.UTC(new Date(end).getUTCFullYear(), new Date(end).getUTCMonth() - back, 1);
    buckets.push({ start, key: range.unit === "hour" ? hourKey(start) : range.unit === "month" ? dayKey(start).slice(0, 7) : dayKey(start) });
  }
  return buckets;
}
var tokensOf = (row) => row[4] + row[5] + row[6] + row[7];
var blank2 = () => ({ input: 0, cacheRead: 0, output: 0, calls: 0, total: 0 });
function addRow(sum, row) {
  sum.input += row[4] + row[6];
  sum.cacheRead += row[5];
  sum.output += row[7];
  sum.calls += row[8];
  sum.total += tokensOf(row);
  return sum;
}
function addTo(map, key, row) {
  map.set(key, addRow(map.get(key) ?? blank2(), row));
}
function summarize(view, range, keep = () => true, seriesOf = () => "all") {
  const { buckets, from, to, before } = spanOf(range, view.now);
  const index = new Map(buckets.map((bucket, at2) => [bucket.key, at2]));
  const weeks = /* @__PURE__ */ new Map();
  const keyOf = (hour) => {
    if (range.unit === "hour") return hour;
    if (range.unit === "day") return hour.slice(0, 10);
    if (range.unit === "month") return hour.slice(0, 7);
    const day = hour.slice(0, 10);
    let week = weeks.get(day);
    if (week === void 0) weeks.set(day, week = dayKey(mondayOf(hourMs(day))));
    return week;
  };
  const current = buckets.map((bucket) => ({ ...bucket, sum: blank2(), stacks: /* @__PURE__ */ new Map() }));
  const result = { buckets: current, total: blank2(), previous: 0, owners: /* @__PURE__ */ new Map(), models: /* @__PURE__ */ new Map(), kinds: /* @__PURE__ */ new Map() };
  for (const row of view.rows) {
    const hour = row[HOUR];
    if (hour < before || hour > to || !keep(row)) continue;
    if (hour < from) {
      result.previous += tokensOf(row);
      continue;
    }
    const at2 = index.get(keyOf(hour));
    if (at2 === void 0) continue;
    const bucket = current[at2];
    addRow(bucket.sum, row);
    addRow(result.total, row);
    const series = seriesOf(row);
    bucket.stacks.set(series, (bucket.stacks.get(series) ?? 0) + tokensOf(row));
    addTo(result.owners, row[OWNER], row);
    addTo(result.models, row[MODEL], row);
    addTo(result.kinds, row[KIND], row);
  }
  return result;
}
function trimmed(value) {
  const text = value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2);
  return text.includes(".") ? text.replace(/\.?0+$/, "") : text;
}
function compact(count) {
  for (const [size, unit] of [[1e9, "B"], [1e6, "M"], [1e3, "K"]]) {
    if (count >= size * 0.9995) return `${trimmed(count / size)}${unit}`;
  }
  return String(Math.round(count));
}
function percent(part, whole) {
  if (!(whole > 0) || !(part > 0)) return "0";
  const value = part / whole * 100;
  return value < 1 ? "<1" : String(Math.round(value));
}

// src/client/usage-page.js
var import_react28 = require("react");
var HEAT_WEEKS = 53;
var TOP_SERIES = 7;
var RING_R = 42;
var RING = 2 * Math.PI * RING_R;
var rangeLabel = (id) => ({ "24h": t("24 hours"), "7d": t("7 days"), "30d": t("30 days"), "12w": t("12 weeks"), "12m": t("12 months") })[id];
var unitLabel = (unit) => ({ hour: t("Per hour"), day: t("Per day"), week: t("Per week"), month: t("Per month") })[unit];
var MODEL_INKS = ["red", "charcoal", "ember", "steel", "rose", "graphite", "crimson", "silver", "wine"];
var PARTS = [["output", 1], ["input", 0.6], ["cacheRead", 0.32]];
var partLabel = (part) => ({ output: t("Output"), input: t("Input"), cacheRead: t("Cache hit") })[part];
var soften = (paint, strength = 1) => {
  const mix = (color) => `color-mix(in srgb, ${color} ${Math.round(88 * strength)}%, var(--bt-card))`;
  return paint.startsWith("linear-gradient(") ? paint.replace(/#[0-9a-f]{6}/gi, mix) : mix(paint);
};
var full = (count) => new Intl.NumberFormat(dateLocale()).format(Math.round(count));
var hitRate = (sum) => percent(sum.cacheRead, sum.input + sum.cacheRead);
var dates = (options) => new Intl.DateTimeFormat(dateLocale(), { timeZone: "UTC", ...options });
var hourText = (ms) => `${String(new Date(ms).getUTCHours()).padStart(2, "0")}:00`;
var yearOf = (ms) => new Date(ms).getUTCFullYear();
function spanText(from, to) {
  const start = hourMs(from);
  const end = hourMs(to);
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const format = dates(yearOf(start) !== year || yearOf(end) !== year ? { year: "numeric", month: "short", day: "numeric" } : { month: "short", day: "numeric" });
  return from === to ? format.format(start) : `${format.format(start)} – ${format.format(end)}`;
}
var daysText = (count) => count === 1 ? t("1 day") : t("{count} days", { count });
var lastText = (range) => range.from ? spanText(range.from, range.to) : t("Last {range}", { range: rangeLabel(range.id) });
function compareText(range) {
  if (!range.from) return t("Compared with the {range} before", { range: rangeLabel(range.id) });
  return range.days === 1 ? t("Compared with the day before") : t("Compared with the {count} days before", { count: range.days });
}
function tickOf(range, bucket) {
  if (range.unit === "hour") {
    return range.days > 1 && new Date(bucket.start).getUTCHours() === 0 ? dates({ month: "numeric", day: "numeric" }).format(bucket.start) : hourText(bucket.start);
  }
  if (range.unit === "month") return dates({ month: "short" }).format(bucket.start);
  return dates({ month: "numeric", day: "numeric" }).format(bucket.start);
}
function titleOf(range, bucket) {
  if (range.unit === "hour") return `${dates({ month: "short", day: "numeric" }).format(bucket.start)} ${hourText(bucket.start)}–${hourText(bucket.start + HOUR_MS)}`;
  if (range.unit === "day") return dates({ month: "long", day: "numeric", weekday: "short" }).format(bucket.start);
  if (range.unit === "week") return spanText(dayKey(bucket.start), dayKey((bucket.end ?? bucket.start + 7 * DAY_MS) - DAY_MS));
  if (bucket.end && (new Date(bucket.start).getUTCDate() !== 1 || new Date(bucket.end).getUTCDate() !== 1)) return spanText(dayKey(bucket.start), dayKey(bucket.end - DAY_MS));
  return dates({ year: "numeric", month: "long" }).format(bucket.start);
}
function useTween(value) {
  const [shown, setShown] = (0, import_react28.useState)(0);
  const from = (0, import_react28.useRef)(0);
  (0, import_react28.useEffect)(() => {
    if (reducedMotion() || typeof requestAnimationFrame !== "function") {
      from.current = value;
      setShown(value);
      return void 0;
    }
    const begin = from.current;
    const started = performance.now();
    let frame;
    const step = (now) => {
      const progress = Math.min(1, (now - started) / 650);
      from.current = begin + (value - begin) * (1 - (1 - progress) ** 3);
      setShown(from.current);
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return shown;
}
var glyphBox = (size, icon2) => (0, import_react28.createElement)("span", { className: "bt-us-glyph", style: { width: size, height: size } }, (0, import_react28.createElement)(icon2));
function ModelGlyph({ name, paint, size }) {
  return (0, import_react28.createElement)("span", {
    className: "bt-us-model",
    "aria-hidden": true,
    style: { width: size, height: size, fontSize: Math.round(size * 0.42), background: `color-mix(in srgb, ${paint} 20%, var(--bt-card))`, color: `color-mix(in srgb, ${paint} 72%, var(--bt-ink))` }
  }, (name.match(/[\p{L}\p{N}]/u)?.[0] ?? "?").toUpperCase());
}
function ownerFace(owner, roster) {
  if (owner.kind === "bot") {
    const bot = roster.byId[owner.id] ?? { id: owner.id, name: owner.name };
    const name = bot.name || owner.name || t("Deleted Bot");
    const role = bot.role?.trim() ?? "";
    return {
      kind: "bot",
      name,
      sub: owner.deleted ? t("Deleted") : role.toLowerCase() === name.toLowerCase() ? "" : role,
      paint: paintCss(colorOf(bot)),
      stops: GRADIENTS[colorOf(bot)],
      glyph: (size) => (0, import_react28.createElement)(BotAvatar, { bot, size, badge: false, live: false })
    };
  }
  if (owner.kind === "room") {
    const room2 = roster.roomsById[owner.id];
    return {
      kind: "room",
      name: owner.name || t("Deleted group chat"),
      sub: owner.deleted ? t("Deleted") : t("Group chat"),
      paint: "var(--bt-us-rest)",
      glyph: (size) => room2 ? (0, import_react28.createElement)(RoomAvatar, { room: room2, roster, size }) : glyphBox(size, ChatsIcon)
    };
  }
  if (owner.kind === "agent") {
    return {
      kind: "agent",
      name: owner.name || "Engine Agent",
      sub: owner.deleted ? t("Deleted") : "",
      paint: "var(--bt-us-rest)",
      glyph: (size) => glyphBox(size, ChatsIcon)
    };
  }
  return { kind: "other", name: t("Other"), sub: "", paint: "var(--bt-us-rest)", glyph: (size) => glyphBox(size, ChatsIcon) };
}
function kindLabel(kind, botFocus) {
  const labels = { chat: botFocus ? t("Own chat") : t("Conversations"), group: t("Group chats"), compaction: t("Compaction and handoff"), image: t("Image reading"), memory: t("Memory"), "session-title": t("Titles"), other: t("Other") };
  return labels[kind] ?? kind;
}
function Tabs({ label, value, options, onChange, boxRef }) {
  const names = options.map(([, text]) => text).join("\n");
  const glide = useGlide(`${value}
${names}`, { box: boxRef });
  return (0, import_react28.createElement)(
    "div",
    { ref: glide.box, className: "bt-us-tabs", role: "group", "aria-label": label },
    (0, import_react28.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
    options.map(([id, text, icon2]) => (0, import_react28.createElement)("button", { key: id, type: "button", "aria-pressed": value === id, onClick: () => onChange(id) }, icon2 ? (0, import_react28.createElement)(icon2) : null, text))
  );
}
function Stats({ range, total, previous }) {
  const shown = useTween(total.total);
  const change = previous > 0 ? Math.round((total.total - previous) / previous * 100) : null;
  const cell = (label, value) => (0, import_react28.createElement)("div", { className: "bt-us-stat" }, (0, import_react28.createElement)("span", { className: "bt-us-stat-label" }, label), (0, import_react28.createElement)("span", { className: "bt-us-stat-value" }, value));
  return (0, import_react28.createElement)(
    "section",
    { className: "bt-us-stats", style: { "--i": 0 } },
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-stat bt-us-stat-main" },
      (0, import_react28.createElement)("span", { className: "bt-us-stat-label" }, lastText(range)),
      (0, import_react28.createElement)(
        "span",
        { className: "bt-us-stat-value" },
        compact(shown),
        (0, import_react28.createElement)("small", null, t("tokens")),
        change === null ? null : (0, import_react28.createElement)(
          "span",
          { className: "bt-us-delta", title: compareText(range) },
          `${change >= 0 ? "↑" : "↓"} ${Math.abs(change)}%`
        )
      )
    ),
    cell(t("Cache hit rate"), `${hitRate(total)}%`),
    cell(t("Output"), compact(total.output)),
    cell(t("Calls"), full(total.calls))
  );
}
function niceTop(max) {
  if (!(max > 0)) return 1;
  const step = 10 ** Math.floor(Math.log10(max));
  return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((scale) => scale * step).find((value) => value >= max);
}
function Chart({ range, columns, series, tipSeries, by, onBy, onPick }) {
  const [hover, setHover] = (0, import_react28.useState)(null);
  const top = niceTop(Math.max(0, ...columns.map((column) => column.total)));
  const count = columns.length;
  const fillOf = new Map(series.map((entry) => [entry.key, entry.fill]));
  const tipOf = new Map(tipSeries.map((entry) => [entry.key, entry]));
  const tip = hover === null ? null : columns[hover];
  const tipSide = hover !== null && hover >= count / 2 ? { right: `calc(${(count - hover) / count * 100}% + 8px)` } : { left: `calc(${(hover + 1) / count * 100}% + 8px)` };
  return (0, import_react28.createElement)(
    "section",
    { className: "bt-us-card bt-us-chart", style: { "--i": 1 } },
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-card-head" },
      (0, import_react28.createElement)("h3", null, t("Tokens over time"), (0, import_react28.createElement)("span", null, unitLabel(range.unit))),
      onBy ? (0, import_react28.createElement)(Tabs, { label: t("Group usage by"), value: by, onChange: onBy, options: [["bot", t("By Bot")], ["model", t("By model")]] }) : null
    ),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-chart-body" },
      (0, import_react28.createElement)(
        "div",
        { className: "bt-us-plot", "data-hover": hover === null ? void 0 : "", onMouseLeave: () => setHover(null) },
        [1, 0.5].map((level) => (0, import_react28.createElement)("div", { key: level, className: "bt-us-grid", style: { bottom: `${level * 100}%` } }, (0, import_react28.createElement)("span", null, compact(top * level)))),
        (0, import_react28.createElement)("div", { className: "bt-us-grid bt-us-base", style: { bottom: 0 } }, (0, import_react28.createElement)("span", null, "0")),
        (0, import_react28.createElement)(
          "div",
          { className: "bt-us-cols" },
          columns.map((column, at2) => (0, import_react28.createElement)("div", {
            key: `${range.from ? `${range.from}~${range.to}` : range.id}:${column.key}`,
            className: "bt-us-col",
            "data-on": hover === at2 ? "" : void 0,
            onMouseEnter: () => setHover(at2)
          }, column.total > 0 ? (0, import_react28.createElement)(
            "div",
            { className: "bt-us-stack", style: { height: `${column.total / top * 100}%`, "--i": at2 } },
            column.parts.map(([key, value]) => value > 0 ? (0, import_react28.createElement)("i", { key, style: { flexGrow: value, background: fillOf.get(key) } }) : null)
          ) : (0, import_react28.createElement)("div", { className: "bt-us-stub" })))
        ),
        tip ? (0, import_react28.createElement)(
          "div",
          { className: "bt-us-tip", style: tipSide },
          (0, import_react28.createElement)("div", { className: "bt-us-tip-title" }, tip.title),
          (0, import_react28.createElement)("div", { className: "bt-us-tip-total" }, t("{count} tokens", { count: full(tip.total) })),
          tip.tip.filter(([, value]) => value > 0).sort((a, b) => b[1] - a[1]).map(([key, value]) => (0, import_react28.createElement)(
            "div",
            { key, className: "bt-us-tip-row" },
            (0, import_react28.createElement)("i", { className: "bt-us-dot", style: { background: tipOf.get(key)?.fill } }),
            (0, import_react28.createElement)("span", null, tipOf.get(key)?.name),
            (0, import_react28.createElement)("b", null, compact(value))
          ))
        ) : null
      ),
      (0, import_react28.createElement)(
        "div",
        { className: "bt-us-ticks", "aria-hidden": true },
        // A preset counts its labels back from now; a picked span forward from its first day.
        columns.map((column, at2) => (0, import_react28.createElement)(
          "span",
          { key: column.key, "data-now": at2 === count - 1 && range.ends !== false ? "" : void 0 },
          (range.from ? at2 : count - 1 - at2) % range.stride === 0 ? column.tick : ""
        ))
      )
    ),
    series.length > 1 || series[0]?.pick ? (0, import_react28.createElement)(
      "div",
      { className: "bt-us-legend" },
      series.map((entry) => (0, import_react28.createElement)(entry.pick ? "button" : "span", {
        key: entry.key,
        className: "bt-us-key",
        ...entry.pick ? { type: "button", onClick: () => onPick(entry.pick) } : {}
      }, (0, import_react28.createElement)("i", { className: "bt-us-dot", style: { background: entry.fill } }), entry.name))
    ) : null
  );
}
function Row2({ kind, glyph, name, sub, sum, whole, fill: fill2, index, onClick }) {
  const width = whole > 0 ? Math.max(sum.total > 0 ? 2 : 0, sum.total / whole * 100) : 0;
  return (0, import_react28.createElement)(
    onClick ? "button" : "div",
    {
      className: "bt-us-row",
      "data-kind": kind,
      style: { "--i": index },
      title: t("{tokens} tokens · {calls} calls", { tokens: full(sum.total), calls: full(sum.calls) }),
      ...onClick ? { type: "button", onClick } : {}
    },
    glyph ? (0, import_react28.createElement)("span", { className: "bt-us-row-glyph" }, glyph) : null,
    (0, import_react28.createElement)(
      "span",
      { className: "bt-us-row-body" },
      (0, import_react28.createElement)(
        "span",
        { className: "bt-us-row-line" },
        (0, import_react28.createElement)("span", { className: "bt-us-row-name" }, name),
        sub ? (0, import_react28.createElement)("span", { className: "bt-us-row-sub" }, sub) : null
      ),
      (0, import_react28.createElement)("span", { className: "bt-us-track" }, (0, import_react28.createElement)("span", { style: { width: `${width}%`, background: fill2 } }))
    ),
    (0, import_react28.createElement)("span", { className: "bt-us-row-num" }, (0, import_react28.createElement)("b", null, compact(sum.total)), (0, import_react28.createElement)("small", null, `${percent(sum.total, whole)}%`))
  );
}
function ListCard({ title, count, index, children }) {
  return (0, import_react28.createElement)(
    "section",
    { className: "bt-us-card", style: { "--i": index } },
    (0, import_react28.createElement)("div", { className: "bt-us-card-head" }, (0, import_react28.createElement)("h3", null, title, count === void 0 ? null : (0, import_react28.createElement)("span", null, count))),
    (0, import_react28.createElement)("div", { className: "bt-us-rows" }, children)
  );
}
function Profile({ face, share, range }) {
  const arc = Math.max(0, Math.min(1, share)) * RING;
  return (0, import_react28.createElement)(
    "section",
    { className: "bt-us-profile" },
    (0, import_react28.createElement)(
      "span",
      { className: "bt-us-ring" },
      (0, import_react28.createElement)(
        "svg",
        { viewBox: "0 0 96 96", "aria-hidden": true },
        face.stops ? (0, import_react28.createElement)("defs", null, (0, import_react28.createElement)(
          "linearGradient",
          { id: "bt-us-ring-paint", x1: 0, y1: 1, x2: 1, y2: 0 },
          face.stops.map(([offset, color]) => (0, import_react28.createElement)("stop", { key: offset, offset, stopColor: color }))
        )) : null,
        (0, import_react28.createElement)("circle", { className: "bt-us-ring-track", cx: 48, cy: 48, r: RING_R }),
        arc > 0 ? (0, import_react28.createElement)("circle", { className: "bt-us-ring-arc", cx: 48, cy: 48, r: RING_R, style: { stroke: face.stops ? "url(#bt-us-ring-paint)" : face.paint, strokeDasharray: `${arc} ${RING}` } }) : null
      ),
      (0, import_react28.createElement)("span", { className: "bt-us-ring-face" }, face.glyph(64))
    ),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-profile-copy" },
      (0, import_react28.createElement)("h3", null, face.name),
      face.sub ? (0, import_react28.createElement)("span", { className: "bt-us-profile-sub" }, face.sub) : null,
      (0, import_react28.createElement)("span", { className: "bt-us-profile-share" }, range.from ? t("{share}% of all usage from {span}", { share: percent(share, 1), span: spanText(range.from, range.to) }) : t("{share}% of all usage in the last {range}", { share: percent(share, 1), range: rangeLabel(range.id) }))
    )
  );
}
var monthOf = (ms) => Date.UTC(yearOf(ms), new Date(ms).getUTCMonth(), 1);
var addMonths = (ms, count) => Date.UTC(yearOf(ms), new Date(ms).getUTCMonth() + count, 1);
function SpanPicker({ span, today, oldest, active, near, onPick, onClose }) {
  const box2 = (0, import_react28.useRef)(null);
  const todayMs = hourMs(today);
  const thisMonth = monthOf(todayMs);
  const [right, setRight] = (0, import_react28.useState)(() => Math.max(addMonths(oldest, 1), monthOf(hourMs(span?.to ?? today))));
  const [anchor, setAnchor] = (0, import_react28.useState)(null);
  const [hover, setHover] = (0, import_react28.useState)(null);
  (0, import_react28.useEffect)(() => {
    const onDown = (event) => {
      if (![box2, near].some((ref) => ref.current?.contains(event.target))) onClose();
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey, true);
    };
  }, []);
  const [low, high] = anchor ? [anchor, hover ?? anchor].sort() : span ? [span.from, span.to] : [null, null];
  const press = (key) => {
    if (!anchor) {
      setAnchor(key);
      return;
    }
    const [from, to] = [anchor, key].sort();
    onPick(from, to);
  };
  const weekdays = (0, import_react28.useMemo)(() => Array.from({ length: 7 }, (_, at2) => dates({ weekday: "narrow" }).format(Date.UTC(2024, 0, 1 + at2))), []);
  const month = (start, side) => {
    const length = new Date(addMonths(start, 1) - DAY_MS).getUTCDate();
    const lead = (new Date(start).getUTCDay() + 6) % 7;
    const cells = Array.from({ length: lead }, (_, at2) => (0, import_react28.createElement)("span", { key: `b${at2}` }));
    for (let day = 1; day <= length; day += 1) {
      const ms = start + (day - 1) * DAY_MS;
      const key = dayKey(ms);
      const weekday = (lead + day - 1) % 7;
      const flag = (on) => on ? "" : void 0;
      cells.push((0, import_react28.createElement)("button", {
        key,
        type: "button",
        className: "bt-us-day",
        disabled: ms > todayMs,
        "aria-label": dates({ year: "numeric", month: "long", day: "numeric", weekday: "short" }).format(ms),
        "aria-pressed": key === low || key === high,
        "data-in": flag(low !== null && key >= low && key <= high),
        "data-start": flag(key === low),
        "data-end": flag(key === high),
        "data-l": flag(weekday === 0 || day === 1),
        "data-r": flag(weekday === 6 || day === length),
        "data-today": flag(key === today),
        "data-has": flag(active.has(key)),
        onMouseEnter: () => setHover(key),
        onClick: () => press(key)
      }, (0, import_react28.createElement)("b", null, day)));
    }
    const nav = side === "left" ? (0, import_react28.createElement)("button", { type: "button", className: "bt-us-month-nav", "data-side": "left", "aria-label": t("Previous month"), disabled: start <= oldest, onClick: () => setRight(addMonths(right, -1)) }, (0, import_react28.createElement)(ChevronLeftIcon)) : (0, import_react28.createElement)("button", { type: "button", className: "bt-us-month-nav", "data-side": "right", "aria-label": t("Next month"), disabled: start >= thisMonth, onClick: () => setRight(addMonths(right, 1)) }, (0, import_react28.createElement)(ChevronRightIcon));
    return (0, import_react28.createElement)(
      "div",
      { key: start, className: "bt-us-month" },
      (0, import_react28.createElement)("div", { className: "bt-us-month-head" }, nav, (0, import_react28.createElement)("span", null, dates({ year: "numeric", month: "long" }).format(start))),
      (0, import_react28.createElement)("div", { className: "bt-us-weekdays", "aria-hidden": true }, weekdays.map((name, at2) => (0, import_react28.createElement)("span", { key: at2 }, name))),
      (0, import_react28.createElement)("div", { className: "bt-us-days", onMouseLeave: () => setHover(null) }, cells)
    );
  };
  const shortcuts = [
    ["month", t("This month"), dayKey(thisMonth), today],
    ["last", t("Last month"), dayKey(addMonths(thisMonth, -1)), dayKey(thisMonth - DAY_MS)],
    ["year", t("This year"), `${today.slice(0, 4)}-01-01`, today]
  ];
  const count = low === null ? 0 : Math.round((hourMs(high) - hourMs(low)) / DAY_MS) + 1;
  return (0, import_react28.createElement)(
    "div",
    { ref: box2, className: "bt-us-pick", role: "dialog", "aria-label": t("Custom range") },
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-pick-quick" },
      shortcuts.map(([id, label, from, to]) => (0, import_react28.createElement)("button", {
        key: id,
        type: "button",
        "aria-pressed": span?.from === from && span?.to === to,
        onClick: () => onPick(from, to)
      }, label))
    ),
    (0, import_react28.createElement)("div", { className: "bt-us-pick-months" }, month(addMonths(right, -1), "left"), month(right, "right")),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-pick-foot", role: "status" },
      (0, import_react28.createElement)("span", null, anchor ? t("Pick the last day") : t("Pick the first day")),
      low === null ? null : (0, import_react28.createElement)("span", null, (0, import_react28.createElement)("b", null, spanText(low, high)), ` · ${daysText(count)}`)
    )
  );
}
function Heat({ view, keep, paint, index }) {
  const [hover, setHover] = (0, import_react28.useState)(null);
  const today = hourMs(`${view.now.slice(0, 10)} 00`);
  const first = mondayOf(today) - (HEAT_WEEKS - 1) * 7 * DAY_MS;
  const from = dayKey(first);
  const daily = /* @__PURE__ */ new Map();
  for (const row of view.rows) {
    const day = row[HOUR].slice(0, 10);
    if (day >= from && keep(row)) daily.set(day, (daily.get(day) ?? 0) + tokensOf(row));
  }
  const most = Math.max(0, ...daily.values());
  const levels = [0.3, 0.52, 0.76, 1];
  const months = [];
  const cells = [];
  for (let week = 0; week < HEAT_WEEKS; week += 1) {
    const monday = first + week * 7 * DAY_MS;
    if (week > 0 && new Date(monday).getUTCMonth() !== new Date(monday - 7 * DAY_MS).getUTCMonth()) {
      months.push((0, import_react28.createElement)("span", { key: week, style: { gridColumn: week + 1 } }, dates({ month: "short" }).format(monday)));
    }
    for (let day = 0; day < 7; day += 1) {
      const ms = monday + day * DAY_MS;
      const value = daily.get(dayKey(ms)) ?? 0;
      const level = value > 0 ? Math.max(1, Math.ceil(4 * Math.sqrt(value / most))) : 0;
      cells.push((0, import_react28.createElement)("span", {
        key: ms,
        className: "bt-us-cell",
        style: { "--w": week },
        "data-on": hover?.ms === ms ? "" : void 0,
        "data-future": ms > today ? "" : void 0,
        "data-today": ms === today ? "" : void 0,
        onMouseEnter: ms > today ? void 0 : () => setHover({ ms, week, day })
      }, level > 0 ? (0, import_react28.createElement)("i", { style: { background: soften(paint, levels[level - 1]) } }) : null));
    }
  }
  const tipSide = hover ? {
    ...hover.week >= HEAT_WEEKS / 2 ? { right: `calc(${(HEAT_WEEKS - hover.week) / HEAT_WEEKS * 100}% + 8px)` } : { left: `calc(${(hover.week + 1) / HEAT_WEEKS * 100}% + 8px)` },
    ...hover.day < 4 ? { top: `calc(${hover.day / 7 * 100}% - 2px)` } : { top: "auto", bottom: `calc(${(6 - hover.day) / 7 * 100}% - 2px)` }
  } : null;
  const active = [...daily.values()].filter((value) => value > 0).length;
  const summary = active === 1 ? t("Active on 1 day in the last year") : t("Active on {count} days in the last year", { count: active });
  return (0, import_react28.createElement)(
    "section",
    { className: "bt-us-card bt-us-heat", style: { "--i": index } },
    (0, import_react28.createElement)("div", { className: "bt-us-card-head" }, (0, import_react28.createElement)("h3", null, t("Activity")), (0, import_react28.createElement)("span", { className: "bt-us-head-note" }, summary)),
    (0, import_react28.createElement)("div", { className: "bt-us-heat-months", "aria-hidden": true }, months),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-heat-plot", onMouseLeave: () => setHover(null) },
      (0, import_react28.createElement)("div", { className: "bt-us-heat-grid", role: "img", "aria-label": summary }, cells),
      hover ? (0, import_react28.createElement)(
        "div",
        { className: "bt-us-tip bt-us-heat-tip", style: tipSide },
        (0, import_react28.createElement)("div", { className: "bt-us-tip-title" }, dates({ month: "long", day: "numeric", weekday: "short" }).format(hover.ms)),
        (0, import_react28.createElement)("div", { className: "bt-us-tip-total" }, t("{count} tokens", { count: full(daily.get(dayKey(hover.ms)) ?? 0) }))
      ) : null
    ),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-heat-scale", "aria-hidden": true },
      t("Light"),
      levels.map((level) => (0, import_react28.createElement)("span", { key: level, className: "bt-us-cell" }, (0, import_react28.createElement)("i", { style: { background: soften(paint, level) } }))),
      t("Heavy")
    )
  );
}
function Skeleton2() {
  return (0, import_react28.createElement)(
    "div",
    { className: "bt-us", "aria-busy": true },
    (0, import_react28.createElement)("div", { className: "bt-us-skel", style: { height: 32, width: 320, borderRadius: 999 } }),
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-sheet bt-us-skel-sheet" },
      (0, import_react28.createElement)("div", { className: "bt-us-skel", style: { height: 94 } }),
      (0, import_react28.createElement)("div", { className: "bt-us-skel", style: { height: 318 } }),
      (0, import_react28.createElement)(
        "div",
        { className: "bt-us-pair" },
        (0, import_react28.createElement)("div", { className: "bt-us-skel", style: { height: 200 } }),
        (0, import_react28.createElement)("div", { className: "bt-us-skel", style: { height: 200 } })
      )
    )
  );
}
var focusOf = (id) => typeof id !== "string" ? null : id.startsWith("model:") ? { kind: "model", key: id.slice("model:".length) } : id.startsWith("owner:") ? { kind: "owner", key: id.slice("owner:".length) } : null;
function UsagePage({ roster, actions, focusId }) {
  const [view, setView] = (0, import_react28.useState)(null);
  const [error, setError] = (0, import_react28.useState)("");
  const [rangeId, setRangeId] = (0, import_react28.useState)("7d");
  const [span, setSpan] = (0, import_react28.useState)(null);
  const [picking, setPicking] = (0, import_react28.useState)(false);
  const [by, setBy] = (0, import_react28.useState)("bot");
  const tabs = (0, import_react28.useRef)(null);
  const focus = focusOf(focusId);
  (0, import_react28.useEffect)(() => {
    let stopped = false;
    let timer;
    const load = async () => {
      try {
        const value = await actions.usage();
        if (stopped) return;
        (0, import_react28.startTransition)(() => setView(value));
        setError("");
        timer = setTimeout(load, value.scanning ? 3e3 : 2e4);
      } catch (failure) {
        if (stopped) return;
        setError(failure?.message ?? String(failure));
        timer = setTimeout(load, 1e4);
      }
    };
    void load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, []);
  const today = view?.now.slice(0, 10);
  const range = rangeId === "custom" && span ? { ...spanRange(span.from, span.to), ends: span.to >= today } : RANGES.find((item) => item.id === rangeId);
  const shaped = (0, import_react28.useMemo)(() => {
    if (!view) return null;
    const faces2 = view.owners.map((owner) => ownerFace(owner, roster));
    const lifetime = /* @__PURE__ */ new Map();
    for (const row of view.rows) lifetime.set(row[MODEL], (lifetime.get(row[MODEL]) ?? 0) + tokensOf(row));
    const modelPaint = new Map([...lifetime].sort((a, b) => b[1] - a[1]).map(([model], rank) => [model, `var(--bt-ink-${MODEL_INKS[rank % MODEL_INKS.length]})`]));
    const models2 = view.models.map((model, at2) => {
      const name = model.name || model.model || t("Unknown model");
      const paint = modelPaint.get(at2) ?? "var(--bt-us-rest)";
      return { kind: "model", name, sub: model.providerName ?? model.provider, paint, glyph: (size) => (0, import_react28.createElement)(ModelGlyph, { name, paint, size }) };
    });
    const ownerAt2 = focus?.kind === "owner" ? view.owners.findIndex((owner) => owner.key === focus.key) : -1;
    const modelAt = focus?.kind === "model" ? view.models.findIndex((model) => model.key === focus.key) : -1;
    const isBot2 = (at2) => ["bot", "agent"].includes(view.owners[at2]?.kind);
    const all2 = summarize(view, range, void 0, (row) => by === "bot" ? isBot2(row[OWNER]) ? `o${row[OWNER]}` : "rest" : `m${row[MODEL]}`);
    const keep2 = ownerAt2 >= 0 ? (row) => row[OWNER] === ownerAt2 : modelAt >= 0 ? (row) => row[MODEL] === modelAt : () => true;
    const face2 = ownerAt2 >= 0 ? faces2[ownerAt2] : modelAt >= 0 ? models2[modelAt] : null;
    const part2 = face2 ? summarize(view, range, keep2) : all2;
    const activeDays2 = /* @__PURE__ */ new Set();
    let first = view.now;
    for (const row of view.rows) {
      if (row[HOUR] < first) first = row[HOUR];
      if (keep2(row) && tokensOf(row) > 0) activeDays2.add(row[HOUR].slice(0, 10));
    }
    const oldest2 = Math.min(monthOf(hourMs(first)), addMonths(monthOf(hourMs(view.now)), -12));
    const ranked2 = (map) => [...map].filter(([, sum]) => sum.total > 0).sort((a, b) => b[1].total - a[1].total);
    let series2;
    if (face2) {
      series2 = [{ key: "all", name: face2.name, fill: soften(face2.paint) }];
    } else {
      if (by === "bot") {
        const bots = ranked2(all2.owners).filter(([at2]) => isBot2(at2));
        series2 = bots.slice(0, TOP_SERIES).map(([at2]) => ({ key: `o${at2}`, name: faces2[at2].name, paint: faces2[at2].paint, pick: { kind: "owner", key: view.owners[at2].key } }));
        if (bots.length > TOP_SERIES) series2.push({ key: "more", name: t("More Bots"), paint: "var(--bt-us-more)" });
        if (ranked2(all2.owners).some(([at2]) => !isBot2(at2))) series2.push({ key: "rest", name: t("Other"), paint: "var(--bt-us-rest)" });
      } else {
        const used = ranked2(all2.models);
        series2 = used.slice(0, TOP_SERIES).map(([at2]) => ({ key: `m${at2}`, name: models2[at2].name, paint: models2[at2].paint, pick: { kind: "model", key: view.models[at2].key } }));
        if (used.length > TOP_SERIES) series2.push({ key: "more", name: t("More models"), paint: "var(--bt-us-more)" });
      }
      const repeats = /* @__PURE__ */ new Map();
      for (const entry of series2) {
        const seen = repeats.get(entry.paint) ?? 0;
        repeats.set(entry.paint, seen + 1);
        entry.fill = soften(entry.paint, [1, 0.6, 0.36][seen % 3]);
      }
    }
    const tipSeries2 = face2 ? PARTS.map(([key, strength]) => ({ key, name: partLabel(key), fill: soften(face2.paint, strength) })) : series2;
    const fillOf2 = new Map(series2.map((entry) => [entry.key, entry.fill]));
    const shownKeys = new Set(series2.map((entry) => entry.key));
    const columns2 = part2.buckets.map((bucket) => {
      const parts = face2 ? [["all", bucket.sum.total]] : series2.map((entry) => [entry.key, entry.key === "more" ? [...bucket.stacks].filter(([key]) => key !== "rest" && !shownKeys.has(key)).reduce((sum, [, value]) => sum + value, 0) : bucket.stacks.get(entry.key) ?? 0]);
      const tip = face2 ? PARTS.map(([key]) => [key, bucket.sum[key]]) : parts;
      return { key: bucket.key, tick: tickOf(range, bucket), title: titleOf(range, bucket), total: bucket.sum.total, parts, tip };
    });
    return { faces: faces2, models: models2, ownerAt: ownerAt2, modelAt, face: face2, keep: keep2, all: all2, part: part2, series: series2, tipSeries: tipSeries2, fillOf: fillOf2, columns: columns2, ranked: ranked2, isBot: isBot2, activeDays: activeDays2, oldest: oldest2 };
  }, [view, rangeId, span, by, focusId, roster]);
  const root = (0, import_react28.useRef)(null);
  (0, import_react28.useEffect)(() => {
    root.current?.closest(".bt-settings-scroll")?.scrollTo?.({ top: 0 });
  }, [focusId]);
  if (!view) {
    return error ? (0, import_react28.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, error) : (0, import_react28.createElement)(Skeleton2);
  }
  if (view.rows.length === 0) {
    return (0, import_react28.createElement)(
      "div",
      { className: "bt-us" },
      (0, import_react28.createElement)(
        "div",
        { className: "bt-us-empty" },
        (0, import_react28.createElement)(BotMark, { look: MAIN_LOOK, size: 56, live: true }),
        (0, import_react28.createElement)("b", null, view.scanning ? t("Reading your chats…") : t("No usage yet.")),
        (0, import_react28.createElement)("span", null, t("Token usage shows up here after a model is called."))
      )
    );
  }
  const { faces, models, ownerAt, face, keep, all, part, series, tipSeries, fillOf, columns, ranked, isBot, activeDays, oldest } = shaped;
  const pick = (next) => actions.openSettings("usage", `${next.kind}:${next.key}`);
  const chooseRange = (id) => {
    if (id !== "custom") {
      setRangeId(id);
      setPicking(false);
      return;
    }
    if (span) setRangeId("custom");
    setPicking((open) => !open);
  };
  const pickSpan = (from, to) => {
    setSpan({ from, to });
    setRangeId("custom");
    setPicking(false);
  };
  const rangeOptions = [
    ...RANGES.map((item) => [item.id, rangeLabel(item.id)]),
    ["custom", rangeId === "custom" && span ? spanText(span.from, span.to) : t("Custom"), CalendarIcon]
  ];
  const whole = part.total.total;
  const ownerRow = ([at2, sum], index, total = whole) => (0, import_react28.createElement)(Row2, {
    key: `o${at2}`,
    kind: faces[at2].kind,
    glyph: faces[at2].glyph(32),
    name: faces[at2].name,
    sub: faces[at2].sub,
    sum,
    whole: total,
    index,
    fill: face ? soften(face.paint, 0.8) : fillOf.get(`o${at2}`) ?? soften(faces[at2].paint),
    onClick: () => pick({ kind: "owner", key: view.owners[at2].key })
  });
  const modelRow = ([at2, sum], index) => (0, import_react28.createElement)(Row2, {
    key: `m${at2}`,
    kind: "model",
    glyph: models[at2].glyph(32),
    name: models[at2].name,
    sub: models[at2].sub,
    sum,
    whole,
    index,
    fill: face ? soften(face.paint, 0.8) : fillOf.get(`m${at2}`) ?? soften(models[at2].paint),
    onClick: () => pick({ kind: "model", key: view.models[at2].key })
  });
  const nothing = (0, import_react28.createElement)("div", { className: "bt-us-none" }, t("Nothing in this range."));
  let body;
  if (face) {
    const kinds = ranked(part.kinds);
    const usedModels = ranked(part.models);
    const owners = ranked(part.owners);
    body = [
      (0, import_react28.createElement)(Profile, { key: "profile", face, range, share: all.total.total > 0 ? whole / all.total.total : 0 }),
      (0, import_react28.createElement)(
        "div",
        { key: "sheet", className: "bt-us-sheet" },
        (0, import_react28.createElement)(Stats, { key: "stats", range, total: part.total, previous: part.previous }),
        (0, import_react28.createElement)(Chart, { key: "chart", range, columns, series, tipSeries, onPick: pick }),
        (0, import_react28.createElement)(
          "div",
          { key: "pair", className: "bt-us-pair" },
          ownerAt >= 0 ? (0, import_react28.createElement)(ListCard, { title: t("Models"), count: usedModels.length, index: 2 }, usedModels.length > 0 ? usedModels.map(modelRow) : nothing) : (0, import_react28.createElement)(ListCard, { title: t("Who used it"), count: owners.length, index: 2 }, owners.length > 0 ? owners.map((entry, index) => ownerRow(entry, index)) : nothing),
          (0, import_react28.createElement)(
            ListCard,
            { title: t("What for"), index: 3 },
            kinds.length > 0 ? kinds.map(([at2, sum], index) => (0, import_react28.createElement)(Row2, { key: at2, name: kindLabel(view.kinds[at2], ownerAt >= 0 && isBot(ownerAt)), sum, whole, index, fill: soften(face.paint, 0.8) })) : nothing
          )
        ),
        (0, import_react28.createElement)(Heat, { key: "heat", view, keep, paint: face.paint, index: 4 })
      )
    ];
  } else {
    const owners = ranked(all.owners);
    const bots = owners.filter(([at2]) => isBot(at2));
    const rest = owners.filter(([at2]) => !isBot(at2));
    const usedModels = ranked(all.models);
    body = [
      (0, import_react28.createElement)(
        "div",
        { key: "sheet", className: "bt-us-sheet" },
        (0, import_react28.createElement)(Stats, { key: "stats", range, total: all.total, previous: all.previous }),
        (0, import_react28.createElement)(Chart, { key: "chart", range, columns, series, tipSeries, by, onBy: setBy, onPick: pick }),
        (0, import_react28.createElement)(
          "div",
          { key: "pair", className: "bt-us-pair" },
          (0, import_react28.createElement)(
            ListCard,
            { title: t("Bots"), count: bots.length, index: 2 },
            owners.length > 0 ? null : nothing,
            bots.map((entry, index) => ownerRow(entry, index)),
            bots.length > 0 && rest.length > 0 ? (0, import_react28.createElement)("div", { className: "bt-us-split", role: "separator" }) : null,
            rest.map((entry, index) => ownerRow(entry, bots.length + index))
          ),
          (0, import_react28.createElement)(ListCard, { title: t("Models"), count: usedModels.length, index: 3 }, usedModels.length > 0 ? usedModels.map(modelRow) : nothing)
        ),
        (0, import_react28.createElement)(Heat, { key: "heat", view, keep, paint: "var(--bt-accent)", index: 4 })
      )
    ];
  }
  return (0, import_react28.createElement)(
    "div",
    { ref: root, className: "bt-us", key: focusId ?? "all" },
    (0, import_react28.createElement)(
      "div",
      { className: "bt-us-top" },
      (0, import_react28.createElement)(Tabs, { label: t("Time range"), value: rangeId, onChange: chooseRange, options: rangeOptions, boxRef: tabs }),
      view.scanning ? (0, import_react28.createElement)("span", { className: "bt-us-note", role: "status" }, t("Still reading older chats; totals may grow.")) : null,
      picking ? (0, import_react28.createElement)(SpanPicker, { span, today, oldest, active: activeDays, near: tabs, onPick: pickSpan, onClose: () => setPicking(false) }) : null
    ),
    error ? (0, import_react28.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, error) : null,
    body
  );
}
var USAGE_CSS = `
.bt-us{--bt-us-ease:cubic-bezier(.22,1,.36,1);--bt-us-rest:color-mix(in srgb,var(--bt-ink) 30%,var(--bt-card));--bt-us-more:color-mix(in srgb,var(--bt-ink) 16%,var(--bt-card));display:flex;flex-direction:column;gap:14px;padding-bottom:4px}
.bt-us-top{position:relative;z-index:4;display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.bt-us-tabs{position:relative;display:inline-flex;flex:none;padding:3px;border-radius:999px;background:var(--bt-hover)}
.bt-us-tabs button{position:relative;z-index:1;display:inline-flex;align-items:center;gap:5px;height:26px;padding:0 12px;border:0;border-radius:999px;background:none;color:var(--bt-ink-2);font:inherit;font-size:12px;line-height:26px;white-space:nowrap;cursor:pointer;transition:color .15s ease}
.bt-us-tabs button svg{flex:none;width:13px;height:13px;margin-left:-2px}
.bt-us-pick{position:absolute;top:calc(100% + 8px);left:0;max-width:100%;box-sizing:border-box;padding:14px 16px 12px;border-radius:18px;border:.5px solid var(--bt-line-2);background:var(--bt-card);box-shadow:0 22px 50px -18px rgba(0,0,0,.32),0 2px 8px rgba(0,0,0,.05);transform-origin:24px 0;animation:bt-us-drop .2s var(--bt-us-ease)}
.bt-us-pick-quick{display:flex;gap:6px;margin-bottom:12px}
.bt-us-pick-quick button{height:26px;padding:0 11px;border:0;border-radius:999px;background:var(--bt-hover);color:var(--bt-ink-2);font:inherit;font-size:12px;cursor:pointer;transition:background-color .12s ease,color .12s ease}
.bt-us-pick-quick button:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-us-pick-quick button[aria-pressed=true]{background:color-mix(in srgb,var(--bt-accent) 14%,transparent);color:var(--bt-accent)}
.bt-us-pick-months{display:flex;flex-wrap:wrap;gap:8px 28px}
.bt-us-month{width:252px;animation:bt-us-fade .22s ease}
.bt-us-month-head{position:relative;display:flex;align-items:center;justify-content:center;height:28px;margin-bottom:4px;font-size:13px;line-height:18px;font-weight:600}
.bt-us-month-nav{position:absolute;top:0;width:28px;height:28px;padding:0;border:0;border-radius:9px;background:none;color:var(--bt-ink-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background-color .12s ease}
.bt-us-month-nav[data-side=left]{left:0}
.bt-us-month-nav[data-side=right]{right:0}
.bt-us-month-nav:hover:not(:disabled){background:var(--bt-hover);color:var(--bt-ink)}
.bt-us-month-nav:disabled{opacity:.3;cursor:default}
.bt-us-weekdays,.bt-us-days{display:grid;grid-template-columns:repeat(7,36px)}
.bt-us-weekdays span{height:24px;font-size:11px;line-height:24px;text-align:center;color:var(--bt-ink-3)}
.bt-us-day{position:relative;height:36px;padding:0;border:0;background:none;color:var(--bt-ink);font:inherit;font-size:12px;font-variant-numeric:tabular-nums;cursor:pointer}
.bt-us-day::before{content:'';position:absolute;top:4px;bottom:4px;left:0;right:0;transition:background-color .12s ease}
.bt-us-day>b{position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-weight:400;transition:background-color .12s ease,color .12s ease}
.bt-us-day:hover:not(:disabled)>b{background:var(--bt-hover)}
.bt-us-day[data-today]>b{color:var(--bt-accent);font-weight:600}
.bt-us-day[data-has]::after{content:'';position:absolute;z-index:2;left:50%;bottom:6px;width:3px;height:3px;margin-left:-1.5px;border-radius:50%;background:var(--bt-ink-3)}
.bt-us-day[data-in]::before{background:color-mix(in srgb,var(--bt-accent) 13%,transparent)}
.bt-us-day[data-in][data-l]::before{left:4px;border-radius:14px 0 0 14px}
.bt-us-day[data-in][data-r]::before{right:4px;border-radius:0 14px 14px 0}
.bt-us-day[data-in][data-l][data-r]::before{border-radius:14px}
.bt-us-day[data-in][data-start]::before{left:50%;border-radius:0}
.bt-us-day[data-in][data-end]::before{right:50%;border-radius:0}
.bt-us-day[data-in][data-start][data-r]::before,.bt-us-day[data-in][data-end][data-l]::before,.bt-us-day[data-in][data-start][data-end]::before{display:none}
.bt-us-day[data-start]>b,.bt-us-day[data-end]>b,.bt-us-day[data-start]:hover>b,.bt-us-day[data-end]:hover>b{background:var(--bt-accent);color:var(--bt-accent-ink,#fff);font-weight:600}
.bt-us-day[data-start][data-has]::after,.bt-us-day[data-end][data-has]::after{background:color-mix(in srgb,var(--bt-accent-ink,#fff) 75%,transparent)}
.bt-us-day:disabled{color:var(--bt-ink-3);opacity:.45;cursor:default}
.bt-us-pick-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:8px;padding-top:10px;border-top:1px solid var(--bt-line);font-size:12px;line-height:16px;color:var(--bt-ink-3);white-space:nowrap}
.bt-us-pick-foot b{color:var(--bt-ink);font-weight:500}
.bt-us-tabs button:hover,.bt-us-tabs button[aria-pressed=true]{color:var(--bt-ink)}
.bt-us-tabs:not([data-glide]) button[aria-pressed=true]{background:var(--bt-card)}
.bt-us-tabs>.bt-thumb{top:3px;bottom:3px;border-radius:999px;background:var(--bt-card);box-shadow:0 1px 3px rgba(0,0,0,.08),0 0 0 .5px var(--bt-line-2)}
.bt-us-note{display:inline-flex;align-items:center;gap:8px;font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-us-note::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--bt-accent);animation:bt-us-pulse 1.4s ease-in-out infinite}
.bt-us-sheet{display:flex;flex-direction:column;gap:4px}
.bt-us-sheet>.bt-us-stats,.bt-us-sheet>.bt-us-card,.bt-us-sheet>.bt-us-pair>.bt-us-card{border-radius:0}
.bt-us-sheet>:first-child{border-radius:16px 16px 0 0}
.bt-us-sheet>:last-child{border-radius:0 0 16px 16px}
.bt-us-stats{display:grid;grid-template-columns:1.6fr 1fr 1fr 1fr;border-radius:16px;border:1px solid var(--bt-line);background:var(--bt-card);animation:bt-us-in .45s var(--bt-us-ease) backwards}
.bt-us-stat{display:flex;flex-direction:column;justify-content:flex-end;gap:6px;min-width:0;padding:16px 18px}
.bt-us-stat+.bt-us-stat{border-left:1px solid var(--bt-line)}
.bt-us-stat-label{overflow:hidden;font-size:12px;line-height:16px;color:var(--bt-ink-3);white-space:nowrap;text-overflow:ellipsis}
.bt-us-stat-value{display:flex;align-items:baseline;gap:6px;min-width:0;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-us-stat-main .bt-us-stat-value{font-size:34px;line-height:40px;letter-spacing:-.025em}
.bt-us-stat-value small{font-size:13px;font-weight:400;letter-spacing:0;color:var(--bt-ink-3)}
.bt-us-delta{align-self:center;margin-left:2px;padding:0 8px;border-radius:999px;background:var(--bt-tag-bg);color:var(--bt-ink-2);font-size:11px;line-height:20px;font-weight:500;letter-spacing:0}
.bt-us-card{display:flex;flex-direction:column;gap:12px;min-width:0;padding:14px 18px 16px;border-radius:16px;border:1px solid var(--bt-line);background:var(--bt-card);animation:bt-us-in .45s var(--bt-us-ease) backwards;animation-delay:calc(var(--i,0) * 45ms)}
.bt-us-card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:32px}
.bt-us-card-head h3{display:flex;align-items:baseline;gap:8px;min-width:0;margin:0;font-size:13px;line-height:18px;font-weight:600}
.bt-us-card-head h3 span,.bt-us-head-note{font-size:12px;font-weight:400;color:var(--bt-ink-3)}
.bt-us-chart-body{display:flex;flex-direction:column;gap:8px;padding-top:6px}
.bt-us-plot{position:relative;height:200px;margin-left:40px}
.bt-us-grid{position:absolute;left:0;right:0;border-top:1px dashed var(--bt-line-2);pointer-events:none}
.bt-us-grid.bt-us-base{border-top:1px solid var(--bt-line-2)}
.bt-us-grid span{position:absolute;right:calc(100% + 8px);top:-8px;font-size:10px;line-height:16px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.bt-us-cols{position:absolute;inset:0;display:flex;align-items:flex-end}
.bt-us-col{position:relative;flex:1 1 0;min-width:0;height:100%;display:flex;align-items:flex-end;justify-content:center}
.bt-us-stack{display:flex;flex-direction:column-reverse;gap:2px;width:56%;min-width:4px;max-width:28px;transform-origin:50% 100%;animation:bt-us-grow .6s var(--bt-us-ease) backwards;animation-delay:calc(var(--i,0) * 14ms);transition:height .45s var(--bt-us-ease),opacity .18s ease}
.bt-us-stack>i{flex:1 1 0;min-height:2px;border-radius:5px;transition:flex-grow .45s var(--bt-us-ease)}
.bt-us-plot[data-hover] .bt-us-col:not([data-on]) .bt-us-stack{opacity:.3}
.bt-us-stub{width:4px;height:4px;margin-bottom:-2px;border-radius:50%;background:var(--bt-line-2)}
.bt-us-ticks{display:flex;margin-left:40px;font-size:11px;line-height:14px;color:var(--bt-ink-3);font-variant-numeric:tabular-nums}
.bt-us-ticks span{flex:1 1 0;min-width:0;text-align:center;white-space:nowrap}
.bt-us-ticks span[data-now]{color:var(--bt-ink);font-weight:500}
.bt-us-tip{position:absolute;top:6px;z-index:3;min-width:160px;max-width:240px;padding:10px 12px;border-radius:12px;border:.5px solid var(--bt-line-2);background:color-mix(in srgb,var(--bt-card) 90%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 14px 34px -12px rgba(0,0,0,.28);font-size:12px;line-height:16px;pointer-events:none;animation:bt-us-pop .16s var(--bt-us-ease)}
.bt-us-tip-title{color:var(--bt-ink-3)}
.bt-us-tip-total{margin:2px 0 8px;font-size:15px;line-height:20px;font-weight:600;font-variant-numeric:tabular-nums}
.bt-us-tip-total:last-child{margin-bottom:0}
.bt-us-tip-row{display:flex;align-items:center;gap:8px;color:var(--bt-ink-2)}
.bt-us-tip-row+.bt-us-tip-row{margin-top:5px}
.bt-us-tip-row span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-us-tip-row b{font-weight:500;color:var(--bt-ink);font-variant-numeric:tabular-nums}
.bt-us-legend{display:flex;flex-wrap:wrap;gap:6px}
.bt-us-key{display:inline-flex;align-items:center;gap:6px;min-width:0;height:24px;padding:0 10px 0 8px;border:0;border-radius:999px;background:var(--bt-hover);color:var(--bt-ink-2);font:inherit;font-size:12px;line-height:24px}
button.bt-us-key{cursor:pointer;transition:background-color .12s ease,color .12s ease}
button.bt-us-key:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-us-dot{flex:none;width:8px;height:8px;border-radius:50%}
.bt-us-pair{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:4px}
.bt-us-rows{display:flex;flex-direction:column;margin:0 -8px}
.bt-us-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:8px;border:0;border-radius:12px;background:none;color:var(--bt-ink);font:inherit;text-align:left;animation:bt-us-in .4s var(--bt-us-ease) backwards;animation-delay:calc(var(--i,0) * 35ms + 90ms)}
button.bt-us-row{cursor:pointer;transition:background-color .12s ease}
button.bt-us-row:hover{background:var(--bt-hover)}
.bt-us-row-glyph{flex:none;display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px}
.bt-us-row-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}
.bt-us-row-line{display:flex;align-items:baseline;gap:8px;min-width:0;font-size:13px;line-height:18px}
.bt-us-row-name{flex:0 1 auto;min-width:0;overflow:hidden;font-weight:500;text-overflow:ellipsis;white-space:nowrap}
.bt-us-row-sub{flex:0 1 auto;min-width:0;overflow:hidden;font-size:12px;color:var(--bt-ink-3);text-overflow:ellipsis;white-space:nowrap}
.bt-us-track{display:block;height:4px;border-radius:999px;background:var(--bt-hover);overflow:hidden}
.bt-us-track>span{display:block;height:100%;border-radius:inherit;transform-origin:0 50%;animation:bt-us-fill .7s var(--bt-us-ease) backwards;animation-delay:calc(var(--i,0) * 35ms + 140ms);transition:width .45s var(--bt-us-ease)}
.bt-us-row-num{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:1px;min-width:52px;font-variant-numeric:tabular-nums}
.bt-us-row-num b{font-size:13px;line-height:18px;font-weight:600}
.bt-us-row-num small{font-size:11px;line-height:14px;color:var(--bt-ink-3)}
.bt-us-split{height:1px;margin:6px 8px;background:var(--bt-line)}
.bt-us-none{padding:18px 8px;font-size:12px;color:var(--bt-ink-3);text-align:center}
.bt-us-glyph{display:inline-flex;align-items:center;justify-content:center;border-radius:50%;background:var(--bt-hover);color:var(--bt-ink-2)}
.bt-us-model{display:inline-flex;align-items:center;justify-content:center;border-radius:30%;font-weight:600;line-height:1}
.bt-us-profile{display:flex;align-items:center;gap:20px;padding:6px 4px 2px;animation:bt-us-in .45s var(--bt-us-ease) backwards}
.bt-us-ring{position:relative;flex:none;width:96px;height:96px}
.bt-us-ring>svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.bt-us-ring>svg circle{fill:none;stroke-width:4}
.bt-us-ring-track{stroke:var(--bt-line)}
.bt-us-ring-arc{stroke-linecap:round;transition:stroke-dasharray .6s var(--bt-us-ease);animation:bt-us-ring 1s var(--bt-us-ease) .1s backwards}
.bt-us-ring-face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
.bt-us-profile-copy{display:flex;flex-direction:column;gap:3px;min-width:0}
.bt-us-profile-copy h3{margin:0;overflow:hidden;font-size:22px;line-height:28px;font-weight:600;letter-spacing:-.01em;text-overflow:ellipsis;white-space:nowrap}
.bt-us-profile-sub{font-size:13px;line-height:18px;color:var(--bt-ink-2)}
.bt-us-profile-share{font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-us-heat{gap:8px}
.bt-us-heat-months,.bt-us-heat-grid{display:grid;grid-template-columns:repeat(${HEAT_WEEKS},1fr);gap:3px}
.bt-us-heat-months{height:14px;font-size:10px;line-height:14px;color:var(--bt-ink-3)}
.bt-us-heat-months span{white-space:nowrap}
.bt-us-heat-plot{position:relative}
.bt-us-heat-grid{grid-template-rows:repeat(7,auto);grid-auto-flow:column}
.bt-us-heat-grid .bt-us-cell[data-on]{outline:1.5px solid var(--bt-ink-2);outline-offset:1px}
.bt-us-heat-tip{min-width:0;white-space:nowrap}
.bt-us-cell{position:relative;aspect-ratio:1;border-radius:3px;background:var(--bt-hover);overflow:hidden}
.bt-us-heat-grid .bt-us-cell{animation:bt-us-cell .5s var(--bt-us-ease) backwards;animation-delay:calc(var(--w,0) * 7ms + 120ms)}
.bt-us-cell>i{position:absolute;inset:0}
.bt-us-cell[data-today]{outline:1.5px solid var(--bt-ink-3);outline-offset:1px}
.bt-us-cell[data-future]{visibility:hidden}
.bt-us-heat-scale{display:flex;align-items:center;justify-content:flex-end;gap:4px;font-size:11px;line-height:14px;color:var(--bt-ink-3)}
.bt-us-heat-scale .bt-us-cell{width:10px}
.bt-us-skel{border-radius:16px;background:linear-gradient(90deg,var(--bt-hover) 0%,var(--bt-active) 50%,var(--bt-hover) 100%);background-size:200% 100%;animation:bt-us-shine 1.4s ease-in-out infinite}
.bt-us-skel-sheet>.bt-us-skel:first-child{border-radius:16px 16px 0 0}
.bt-us-skel-sheet>.bt-us-skel:not(:first-child){border-radius:0}
.bt-us-skel-sheet>.bt-us-pair>.bt-us-skel:first-child{border-radius:0 0 0 16px}
.bt-us-skel-sheet>.bt-us-pair>.bt-us-skel:last-child{border-radius:0 0 16px 0}
.bt-us-empty{display:flex;flex-direction:column;align-items:center;gap:8px;padding:72px 16px;text-align:center;font-size:13px;line-height:18px;color:var(--bt-ink-3)}
.bt-us-empty b{margin-top:6px;font-size:15px;font-weight:600;color:var(--bt-ink)}
@keyframes bt-us-in{from{opacity:0;transform:translateY(6px)}}
@keyframes bt-us-grow{from{transform:scaleY(0)}}
@keyframes bt-us-fill{from{transform:scaleX(0)}}
@keyframes bt-us-pop{from{opacity:0;transform:translateY(3px) scale(.97)}}
@keyframes bt-us-drop{from{opacity:0;transform:translateY(-4px) scale(.96)}}
@keyframes bt-us-fade{from{opacity:0}}
@keyframes bt-us-cell{from{opacity:0;transform:scale(.5)}}
@keyframes bt-us-ring{from{stroke-dasharray:0 ${Math.ceil(RING)}}}
@keyframes bt-us-pulse{50%{opacity:.25}}
@keyframes bt-us-shine{from{background-position:200% 0}to{background-position:-200% 0}}
@media (prefers-reduced-motion:reduce){.bt-us *,.bt-us *::before{animation:none!important;transition:none!important}}
`;

// src/client/connectors.js
var import_react29 = require("react");
var TOKEN_URL = "https://github.com/settings/personal-access-tokens/new";
var GitHubMark = () => (0, import_react29.createElement)(
  "svg",
  { width: 20, height: 20, viewBox: "0 0 16 16", fill: "currentColor", "aria-hidden": true },
  (0, import_react29.createElement)("path", { d: "M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" })
);
var MARKS = { github: GitHubMark };
var ABOUT = { github: () => t("Repositories, issues, and pull requests") };
function statusText2(connector) {
  if (connector.state === "connecting") return t("Connecting…");
  if (connector.state === "error") return t("Could not connect: {error}", { error: connector.error ?? "" });
  if (connector.state === "ready") return connector.account ? t("Connected as {account}", { account: connector.account }) : t("Connected");
  return ABOUT[connector.id]?.() ?? "";
}
function ConnectorRow({ connector, actions }) {
  const [form, setForm] = (0, import_react29.useState)(false);
  const [token, setToken] = (0, import_react29.useState)("");
  const [busy, setBusy] = (0, import_react29.useState)(false);
  const [error, setError] = (0, import_react29.useState)(null);
  const run = (task, after) => {
    setBusy(true);
    setError(null);
    return task.then(() => {
      after?.();
    }, (failure) => setError(failure?.message ?? String(failure))).finally(() => setBusy(false));
  };
  const connect = () => {
    if (busy || token.trim() === "") return;
    void run(actions.connectorConnect(connector.id, token), () => {
      setToken("");
      setForm(false);
    });
  };
  const on = connector.state !== "off";
  const Mark = MARKS[connector.id];
  const row = (0, import_react29.useRef)(null);
  useMorph(row, `${form}:${error !== null}:${connector.state}`);
  return (0, import_react29.createElement)(
    "div",
    { ref: row, className: "bt-connector", "data-state": connector.state },
    (0, import_react29.createElement)(
      "div",
      { className: "bt-connector-head" },
      (0, import_react29.createElement)("span", { className: "bt-connector-mark" }, Mark ? (0, import_react29.createElement)(Mark) : null),
      (0, import_react29.createElement)(
        "span",
        { className: "bt-connector-text" },
        (0, import_react29.createElement)("span", { className: "bt-connector-name" }, connector.name),
        (0, import_react29.createElement)("span", { className: "bt-connector-status" }, statusText2(connector))
      ),
      (0, import_react29.createElement)(
        "span",
        { className: "bt-connector-actions" },
        connector.state === "error" ? (0, import_react29.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: busy, onClick: () => void run(actions.connectorRetry(connector.id)) }, t("Try again")) : null,
        on ? (0, import_react29.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: busy, onClick: () => void run(actions.connectorDisconnect(connector.id)) }, t("Disconnect")) : form ? null : (0, import_react29.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => setForm(true) }, t("Connect"))
      )
    ),
    !on && form ? (0, import_react29.createElement)(
      "div",
      { className: "bt-connector-form" },
      (0, import_react29.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react29.createElement)(MaskedInput, { value: token, onChange: setToken, onEnter: connect, label: t("GitHub token"), autoFocus: true })),
      (0, import_react29.createElement)(
        "div",
        { className: "bt-connector-form-row" },
        (0, import_react29.createElement)("a", { className: "bt-connector-link", href: TOKEN_URL, target: "_blank", rel: "noopener noreferrer" }, t("Create a token on GitHub")),
        (0, import_react29.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: busy, onClick: () => {
          setForm(false);
          setToken("");
          setError(null);
        } }, t("Cancel")),
        (0, import_react29.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: busy || token.trim() === "", onClick: connect }, busy ? t("Connecting…") : t("Connect"))
      )
    ) : null,
    error ? (0, import_react29.createElement)("div", { className: "bt-connector-error", role: "alert" }, error) : null
  );
}
function ConnectorsPage({ roster, actions }) {
  const list = roster?.connectors ?? [];
  return (0, import_react29.createElement)(
    "section",
    { className: "bt-set-section" },
    (0, import_react29.createElement)("div", { className: "bt-set-card bt-connectors-card" }, list.length === 0 ? (0, import_react29.createElement)("div", { className: "bt-set-row" }, (0, import_react29.createElement)("span", { className: "bt-set-hint" }, t("No connectors"))) : list.map((connector) => (0, import_react29.createElement)(ConnectorRow, { key: connector.id, connector, actions })))
  );
}

// src/shared/app-catalog.js
var APP_CATEGORIES = ["Google", "Work and notes", "Developers", "Design and sites", "Payments", "Search and knowledge", "Travel", "Many apps in one"];
var GOOGLE_NOTE = `Google's own MCP servers are in developer preview and take only an OAuth client someone made for them: in a Google Cloud project, turn on the app's API and its MCP API, add yourself as a test user, then create an OAuth client (Web application) with the redirect address below and "Use this client for an AI-powered agent" ticked.`;
var google = (id, name, host, about, guide) => ({
  id,
  name,
  url: `https://${host}.googleapis.com/mcp/v1`,
  auth: "oauth",
  about,
  needsClient: true,
  note: GOOGLE_NOTE,
  docs: `https://developers.google.com/workspace/${guide}`
});
var app = (id, name, url, auth, about, more = {}) => ({ id, name, url, auth, about, ...more });
var LIMITED = { note: "Free without an account, with a rate limit." };
var BY_CATEGORY = {
  Google: [
    google("gmail", "Gmail", "gmailmcp", "Search and read your email, write drafts, and sort it with labels", "gmail/api/guides/configure-mcp-server"),
    google("google_calendar", "Google Calendar", "calendarmcp", "See your schedule, find free time, and add or change events", "calendar/api/guides/configure-mcp-server"),
    google("google_drive", "Google Drive", "drivemcp", "Find, read and upload your files, and share them", "guides/configure-mcp-servers"),
    google("google_docs", "Google Docs", "docsmcp", "Read and edit your documents", "guides/configure-mcp-servers"),
    google("google_sheets", "Google Sheets", "sheetsmcp", "Read and update your spreadsheets", "guides/configure-mcp-servers"),
    google("google_slides", "Google Slides", "slidesmcp", "Read and update your presentations", "guides/configure-mcp-servers"),
    google("google_chat", "Google Chat", "chatmcp", "Find conversations, read messages and reply", "guides/configure-mcp-servers"),
    app("google_maps", "Google Maps", "https://mapstools.googleapis.com/mcp", "header", "Places, routes and the weather, from Google Maps", {
      header: "X-Goog-Api-Key",
      keyLabel: "API key",
      keyUrl: "https://console.cloud.google.com/apis/credentials",
      note: "A Google Cloud API key with the Maps Grounding Lite API turned on.",
      docs: "https://developers.google.com/maps/ai/grounding-lite"
    })
  ],
  "Work and notes": [
    app("notion", "Notion", "https://mcp.notion.com/mcp", "oauth", "Search, read and write your pages and databases"),
    app("linear", "Linear", "https://mcp.linear.app/mcp", "oauth", "Find, create and update issues and projects"),
    app("atlassian", "Jira and Confluence", "https://mcp.atlassian.com/v2/mcp", "oauth", "Jira issues and Confluence pages, with Atlassian Rovo"),
    app("trello", "Trello", "https://mcp.trello.com/v1", "oauth", "Your boards, lists and cards"),
    app("monday", "monday.com", "https://mcp.monday.com/mcp", "oauth", "Boards, items and updates in your workspace", { note: "An account admin may have to approve ApmixBot first." }),
    app("todoist", "Todoist", "https://ai.todoist.net/mcp", "oauth", "Your tasks and projects: add, find and finish them"),
    app("airtable", "Airtable", "https://mcp.airtable.com/mcp", "oauth", "Read and change the records in your bases"),
    app("miro", "Miro", "https://mcp.miro.com/", "oauth", "Read and add to your boards"),
    app("intercom", "Intercom", "https://mcp.intercom.com/mcp", "oauth", "Conversations, contacts and help articles"),
    app("evernote", "Evernote", "https://mcp.evernote.com/mcp", "oauth", "Your notes, notebooks, tags and tasks"),
    app("craft", "Craft", "https://mcp.craft.do/my/mcp", "oauth", "Read and write your Craft documents"),
    app("ticktick", "TickTick", "https://mcp.ticktick.com", "oauth", "Your tasks and lists: add, find and finish them"),
    app("calendly", "Calendly", "https://mcp.calendly.com", "oauth", "Your event types, bookings and free times"),
    app("calcom", "Cal.com", "https://mcp.cal.com/mcp", "oauth", "Your booking pages, bookings and availability"),
    app("typeform", "Typeform", "https://api.typeform.com/mcp", "oauth", "Your forms and the answers they got"),
    app("granola", "Granola", "https://mcp.granola.ai/mcp", "oauth", "Your meeting notes and what was decided"),
    app("fireflies", "Fireflies", "https://api.fireflies.ai/mcp", "oauth", "Your meetings' transcripts and summaries"),
    app("deepl", "DeepL", "https://mcp.deepl.com/v1/mcp", "oauth", "Translate text and documents, with your glossaries", { note: "A free DeepL account is enough." })
  ],
  Developers: [
    app("gitlab", "GitLab", "https://gitlab.com/api/v4/mcp", "oauth", "Projects, issues, merge requests and pipelines"),
    app("sentry", "Sentry", "https://mcp.sentry.dev/mcp", "oauth", "Errors and issues in your projects, and what caused them"),
    app("supabase", "Supabase", "https://mcp.supabase.com/mcp", "oauth", "Your projects' databases, tables and logs"),
    app("vercel", "Vercel", "https://mcp.vercel.com", "oauth", "Your projects, deployments, logs and domains", {
      note: "Signing in is not all: Vercel has you approve each team as well. The first time a Bot works in a team, it gives you a link to open."
    }),
    app("cloudflare", "Cloudflare", "https://mcp.cloudflare.com/mcp", "oauth", "Your Cloudflare account: Workers, DNS and more"),
    app("netlify", "Netlify", "https://netlify-mcp.netlify.app/mcp", "oauth", "Your sites, deploys and forms"),
    app("neon", "Neon", "https://mcp.neon.tech/mcp", "oauth", "Your Postgres databases: projects, branches and queries"),
    app("postman", "Postman", "https://mcp.postman.com/minimal", "oauth", "Your collections, workspaces and APIs"),
    app("prisma", "Prisma", "https://mcp.prisma.io/mcp", "oauth", "Your Prisma Postgres databases"),
    app("posthog", "PostHog", "https://mcp.posthog.com/mcp", "oauth", "Your product analytics: insights, flags and errors"),
    app("apify", "Apify", "https://mcp.apify.com/", "oauth", "Run web scrapers and automation Actors")
  ],
  "Design and sites": [
    app("canva", "Canva", "https://mcp.canva.com/mcp", "oauth", "Find, make and edit your designs"),
    app("webflow", "Webflow", "https://mcp.webflow.com/mcp", "oauth", "Your sites, pages and CMS collections"),
    app("wix", "Wix", "https://mcp.wix.com/mcp", "oauth", "Your Wix sites, stores and bookings"),
    app("wordpress", "WordPress.com", "https://public-api.wordpress.com/wpcom/v2/mcp/v1", "oauth", "Your sites' posts, pages and comments", { note: "Turn MCP on in your WordPress.com settings first." })
  ],
  Payments: [
    app("stripe", "Stripe", "https://mcp.stripe.com", "oauth", "Customers, payments, invoices and payment links"),
    app("paypal", "PayPal", "https://mcp.paypal.com/mcp", "oauth", "Invoices, orders, payments and disputes"),
    app("square", "Square", "https://mcp.squareup.com/mcp", "oauth", "Your store's payments, orders and catalog")
  ],
  "Search and knowledge": [
    app("deepwiki", "DeepWiki", "https://mcp.deepwiki.com/mcp", "none", "Ask about any public GitHub repository and read its wiki"),
    app("context7", "Context7", "https://mcp.context7.com/mcp", "none", "Current documentation and code examples for libraries", LIMITED),
    app("microsoft_learn", "Microsoft Learn", "https://learn.microsoft.com/api/mcp", "none", "Microsoft's documentation and code samples"),
    app("cloudflare_docs", "Cloudflare Docs", "https://docs.mcp.cloudflare.com/mcp", "none", "Cloudflare's developer documentation"),
    app("exa", "Exa", "https://mcp.exa.ai/mcp", "none", "Web search with clean page text", LIMITED),
    app("tavily", "Tavily", "https://mcp.tavily.com/mcp/", "oauth", "Web search, page extraction and site crawls"),
    app("firecrawl", "Firecrawl", "https://mcp.firecrawl.dev/v2/mcp", "none", "Read and search web pages as clean text", { note: "Without an account it reads and searches a little; more with a key." }),
    app("wikidata", "Wikidata", "https://wd-mcp.wmcloud.org/mcp", "none", "Facts about people, places and things, from Wikidata"),
    app("wolfram", "Wolfram|Alpha", "https://agenttools.wolfram.com/mcp", "none", "Exact answers in maths, science, units and data"),
    app("coingecko", "CoinGecko", "https://mcp.api.coingecko.com/mcp", "none", "Prices and market data for cryptocurrencies"),
    app("pocketcasts", "Pocket Casts", "https://mcp.pocketcasts.com/mcp", "none", "Find podcasts and episodes, and what is trending"),
    app("raindrop", "Raindrop.io", "https://api.raindrop.io/rest/v2/ai/mcp", "oauth", "Your bookmarks and collections"),
    app("readwise", "Readwise", "https://mcp2.readwise.io/mcp", "oauth", "Your highlights, and what you saved to read later"),
    app("kagi", "Kagi", "https://mcp.kagi.com/mcp", "bearer", "Web search without ads, and summaries of pages", {
      keyLabel: "API key",
      keyUrl: "https://kagi.com/api/keys",
      note: "Kagi's search is a paid service; make the key in your Kagi account."
    })
  ],
  Travel: [
    app("kiwi", "Kiwi.com", "https://mcp.kiwi.com", "none", "Search flights and compare their prices"),
    app("trivago", "trivago", "https://mcp.trivago.com/mcp", "none", "Search hotels and compare their prices"),
    app("ferryhopper", "Ferryhopper", "https://mcp.ferryhopper.com/mcp", "none", "Ferry routes, ports and trips"),
    app("peek", "Peek", "https://mcp.peek.com", "none", "Tours and things to do, and when they are free")
  ],
  "Many apps in one": [
    app("composio", "Composio", "https://connect.composio.dev/mcp", "oauth", "One sign-in for 1,000+ apps: Gmail, Slack, Outlook, Calendar and more", { note: "You link each app (such as Gmail) in Composio the first time a Bot needs it." }),
    app("pipedream", "Pipedream", "https://mcp.pipedream.net/v2", "oauth", "Gmail, Slack and 2,000+ apps through your Pipedream account"),
    app("zapier", "Zapier", "https://mcp.zapier.com/api/v1/connect", "bearer", "The actions you choose in 8,000+ apps, such as sending a Gmail", {
      keyLabel: "Connection token",
      keyUrl: "https://mcp.zapier.com",
      note: "In Zapier MCP, add the actions the Bots may use (Gmail: send email, Google Calendar: add event …), then copy the server's token."
    }),
    app("make", "Make", "https://mcp.make.com/v2", "oauth", "Run your Make scenarios as tools")
  ]
};
var APP_CATALOG = Object.freeze(APP_CATEGORIES.flatMap((category) => BY_CATEGORY[category].map((entry) => Object.freeze({ ...entry, category }))));
var catalogApp = (id) => APP_CATALOG.find((entry) => entry.id === id);

// src/client/app-logos.js
var LOGOS = {
  airtable: [176.917, 176.917, '<path d="M79 16.33l-65.96 27.29c-3.67 1.52-3.63 6.73 .06 8.19l66.24 26.27c5.82 2.31 12.3 2.31 18.12 0l66.24-26.27c3.69-1.46 3.73-6.67 .06-8.19l-65.96-27.29c-6.02-2.49-12.78-2.49-18.8 0" fill="#fcb400"/><path d="M94.27 92.42l0 65.62c0 3.12 3.15 5.26 6.05 4.11l73.81-28.65c1.68-.67 2.79-2.3 2.79-4.11l0-65.62c0-3.12-3.15-5.26-6.05-4.11l-73.81 28.65c-1.68 .67-2.79 2.3-2.79 4.11" fill="#18bfff"/><path d="M77.04 95.81l-21.9 10.58-2.22 1.08-46.24 22.16c-2.93 1.41-6.67-.72-6.67-3.98l0-61.59c0-1.18 .6-2.19 1.41-2.96 .33-.33 .71-.61 1.12-.84 1.1-.66 2.68-.84 4.02-.31l70.12 27.78c3.56 1.41 3.84 6.41 .37 8.09" fill="#f82b60"/><path d="M77.04 95.81l-21.9 10.58-53.72-45.29c.33-.33 .71-.61 1.12-.84 1.1-.66 2.68-.84 4.02-.31l70.12 27.78c3.56 1.41 3.84 6.41 .37 8.09" fill-opacity="0.25"/>'],
  apify: [923.56, 923.56, '<path d="M529.64 0l379.92 0c7.73 0 14 6.27 14 13.99l0 580.62c0 13.91-18.09 19.3-25.71 7.66l-379.92-580.61c-6.09-9.31 .59-21.66 11.71-21.66z" fill="#246dff"/><path d="M393.92 0l-379.93 0c-7.73 0-13.99 6.27-13.99 13.99l0 580.62c0 13.91 18.09 19.3 25.7 7.66l379.93-580.61c6.09-9.31-.59-21.66-11.71-21.66z" fill="#20a34e"/><path d="M455.27 464.86l-431.6 434.85c-8.76 8.83-2.51 23.85 9.93 23.85l856.71 0c12.39 0 18.67-14.92 10-23.78l-425.1-434.84c-5.46-5.58-14.44-5.62-19.94-.08z" fill="#f86606"/>'],
  atlassian: [34.693, 34.693, '<path d="M34.32 32.6l-15.88-31.75c-.31-.69-.62-.81-1-.81-.31 0-.69 .13-1.06 .75-2.25 3.56-3.25 7.69-3.25 12 0 6 3.06 11.63 7.56 20.69 .5 1 .88 1.19 1.75 1.19l11 0c.81 0 1.25-.31 1.25-.94 0-.31-.06-.5-.37-1.13zm-23.07-15c-1.25-1.87-1.62-2-1.94-2-.31 0-.5 .13-1.06 1.25l-7.94 15.88c-.25 .5-.31 .69-.31 .94 0 .5 .44 1 1.38 1l11.19 0c.75 0 1.31-.62 1.63-1.81 .38-1.5 .5-2.81 .5-4.37 0-4.38-1.94-8.63-3.44-10.88z" fill="#1868db"/>'],
  calcom: [48, 48, '<path d="M10.56 0H37.44A10.56 10.56 0 0 1 48 10.56V37.44A10.56 10.56 0 0 1 37.44 48H10.56A10.56 10.56 0 0 1 0 37.44V10.56A10.56 10.56 0 0 1 10.56 0Z" fill="#292929"/><path d="M16.98 30.66C13.22 30.66 10.39 27.69 10.39 24.02 10.39 20.33 13.08 17.34 16.98 17.34 19.05 17.34 20.48 17.97 21.6 19.43L19.8 20.93C19.04 20.13 18.12 19.72 16.98 19.72 14.44 19.72 13.04 21.67 13.04 24.02 13.04 26.37 14.57 28.27 16.98 28.27 18.11 28.27 19.07 27.87 19.83 27.06L21.61 28.63C20.54 30.02 19.07 30.66 16.98 30.66Z" fill="#ffffff"/><path d="M29.39 20.88H31.82V30.43H29.39V29.03C28.89 30.02 28.04 30.68 26.43 30.68 23.85 30.68 21.79 28.44 21.79 25.69 21.79 22.94 23.85 20.7 26.43 20.7 28.03 20.7 28.89 21.36 29.39 22.35V20.88ZM29.46 25.69C29.46 24.2 28.44 22.96 26.83 22.96 25.27 22.96 24.26 24.21 24.26 25.69 24.26 27.14 25.27 28.42 26.83 28.42 28.43 28.42 29.46 27.17 29.46 25.69Z" fill="#ffffff"/><path d="M33.54 17.03H35.98V30.41H33.54V17.03Z" fill="#ffffff"/>'],
  calendly: [48, 48, '<defs><linearGradient id="%ID%0" gradientUnits="userSpaceOnUse" x1="24" y1="0" x2="24" y2="48"><stop offset="0" stop-color="#6ab0ff"/><stop offset="1" stop-color="#4793eb"/></linearGradient></defs><path d="M48 24C48 42.11 39.85 48 24 48 8.15 48 0 42.08 0 24 0 5.93 8.15 0 24 0 39.85 0 48 5.93 48 24Z" fill="url(#%ID%0)"/><path d="M24 42.87C11.55 42.87 5.13 38.23 5.13 24 5.13 9.77 11.54 5.13 24 5.13 36.46 5.13 42.87 9.77 42.87 24 42.87 38.23 36.46 42.87 24 42.87ZM34.28 13.78C27.7 7.2 17.76 6.47 12.09 12.14 6.41 17.82 7.15 27.75 13.73 34.33 20.31 40.91 30.24 41.64 35.91 35.97 41.59 30.29 40.86 20.36 34.28 13.78L34.28 13.78ZM24 30.51C26.65 30.51 28.91 28.69 29.73 26.16 29.8 25.93 30.01 25.78 30.24 25.78H33.07C33.32 25.78 33.5 25.99 33.48 26.23 32.85 31.78 29.65 33.65 24 33.65 17.67 33.65 14.41 31.3 14.41 24.05 14.41 16.81 17.67 14.45 24 14.45 29.65 14.45 32.85 16.33 33.48 21.88 33.5 22.12 33.32 22.33 33.07 22.33H30.24C30.01 22.33 29.8 22.18 29.73 21.95 28.91 19.42 26.65 17.6 24 17.6 20.66 17.6 17.95 20.49 17.95 24.05 17.95 27.62 20.66 30.51 24 30.51V30.51Z" fill="#ffffff"/>'],
  canva: [80, 80, '<defs><clipPath id="%ID%0"><path d="M0 0l80 0 0 80-80 0z"/></clipPath><radialGradient id="%ID%1" gradientUnits="userSpaceOnUse" cx="15.45" cy="70.91" r="61.87"><stop offset="0" stop-color="#6420ff"/><stop offset="1" stop-color="#6420ff" stop-opacity="0"/></radialGradient><radialGradient id="%ID%2" gradientUnits="userSpaceOnUse" cx="21.18" cy="9.1" r="69.77"><stop offset="0" stop-color="#00c4cc"/><stop offset="1" stop-color="#00c4cc" stop-opacity="0"/></radialGradient><radialGradient id="%ID%3" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1"><stop offset="0" stop-color="#6420ff"/><stop offset="1" stop-color="#6420ff" stop-opacity="0"/></radialGradient><radialGradient id="%ID%4" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1"><stop offset="0" stop-color="#00c4cc" stop-opacity="0.73"/><stop offset="0" stop-color="#00c4cc"/><stop offset="1" stop-color="#00c4cc" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#%ID%0)"><path d="M40 80c22.09 0 40-17.91 40-40 0-22.09-17.91-40-40-40-22.09 0-40 17.91-40 40 0 22.09 17.91 40 40 40z" fill="#7d2ae7"/><path d="M40 80c22.09 0 40-17.91 40-40 0-22.09-17.91-40-40-40-22.09 0-40 17.91-40 40 0 22.09 17.91 40 40 40z" fill="url(#%ID%1)"/><path d="M40 80c22.09 0 40-17.91 40-40 0-22.09-17.91-40-40-40-22.09 0-40 17.91-40 40 0 22.09 17.91 40 40 40z" fill="url(#%ID%2)"/><g transform="translate(15.45 70.91) rotate(-45.2) scale(61.12 28.11)"><path d="M.18 .85c.25 .56 .67 .56 .93 .01 .26-.55 .26-1.45 0-2.01-.25-.56-.67-.56-.93-.01-.26 .55-.26 1.45 0 2.01z" fill="url(#%ID%3)"/></g><g transform="translate(32.72 10.78) rotate(-23.48) scale(105.51 62.98)"><g transform="rotate(90)"><path d="M1.05 .2c.14-.19-.01-.42-.33-.5-.32-.08-.7 0-.84 .2-.14 .19 .01 .42 .33 .5 .32 .08 .7 0 .84-.2z" fill="url(#%ID%4)"/></g></g><path d="M57.27 48.21c-.33 0-.62 .28-.92 .89-3.41 6.92-9.31 11.82-16.13 11.82-7.89 0-12.77-7.12-12.78-16.96 0-16.67 9.29-26.3 17.44-26.3 3.81 0 6.14 2.4 6.14 6.21 0 4.52-2.57 6.92-2.57 8.51 0 .72 .45 1.15 1.33 1.15 3.55 0 7.72-4.08 7.72-9.84 0-5.59-4.86-9.69-13.02-9.69-13.48 0-25.46 12.5-25.46 29.79 0 13.38 7.64 22.23 19.44 22.23 12.52 0 19.75-12.45 19.75-16.49 0-.89-.46-1.3-.93-1.31z" fill="#ffffff"/></g>'],
  cloudflare: [256, 256, '<path d="M202.36 119.5l-5.31-2.12c-24.96 56.16-124.26 22.02-130.24 38.73-1 11.29 54.23 2.15 93.71 4.05 12.04 .58 18.08 9.67 12.96 24.49l10.07 .03c11.61-36.21 48.68-17.73 50.23-29.68-2.55-7.86-42.6 0-31.42-35.5z" fill="#ffffff"/><path d="M176.33 178.46c1.59-5.31 1.06-10.62-1.59-13.81-2.66-3.19-6.37-5.31-11.16-5.84l-92.41-1.07c-.53 0-1.06-.53-1.59-.53-.53-.53-.53-1.06 0-1.59 .53-1.06 1.06-1.59 2.12-1.6l92.95-1.06c11.15-.53 22.84-9.56 27.08-20.18l5.32-13.81c0-.53 .53-1.06 0-1.59-5.84-27.09-30.27-47.27-58.96-47.27-26.56 0-49.39 17-57.36 40.89-5.31-3.72-11.68-5.84-19.12-5.31-12.75 1.06-22.84 11.68-24.43 24.43-.53 3.19 0 6.37 .53 9.56-20.71 .53-37.71 17.53-37.71 38.78 0 2.12 0 3.72 .53 5.84 0 1.06 1.06 1.59 1.59 1.59l170.49 0c1.06 0 2.13-.53 2.13-1.59l1.59-5.84z" fill="#f4811f"/><path d="M205.54 118.97l-2.65 0c-.53 0-1.06 .53-1.6 1.06l-3.71 12.75c-1.59 5.31-1.06 10.62 1.59 13.81 2.66 3.19 6.37 5.31 11.15 5.84l19.66 1.06c.53 0 1.06 .53 1.59 .53 .53 .53 .53 1.06 0 1.6-.53 1.06-1.06 1.59-2.13 1.59l-20.18 1.06c-11.15 .53-22.84 9.56-27.08 20.19l-1.07 4.78c-.53 .53 0 1.59 1.07 1.59l70.1 0c1.06 0 1.59-.53 1.6-1.59 1.06-4.25 2.12-9.03 2.12-13.81 0-27.62-22.84-50.46-50.46-50.46" fill="#faad3f"/>'],
  coingecko: [48, 48, '<path d="M46.89 23.29C46.94 36.18 36.62 46.67 23.82 46.73 11.03 46.79 .61 36.39 .55 23.5 .49 10.61 10.82 .12 23.61 .06 36.41 0 46.83 10.4 46.89 23.29Z" fill="#ffe866"/><path d="M35.47 15.04C33.79 14.55 32.04 13.86 30.28 13.15 30.18 12.71 29.79 12.15 28.99 11.47 27.84 10.47 25.67 10.49 23.8 10.94 21.74 10.45 19.69 10.27 17.73 10.75 1.71 15.19 10.8 26.04 4.91 36.94 5.75 38.73 14.99 47.31 27.83 46.36 27.83 46.36 23.36 35.56 33.44 30.37 41.61 26.16 47.51 18.35 35.47 15.04L35.47 15.04Z" fill="#4bcc00"/><path d="M24.91 17.64C24.91 20.14 22.9 22.15 20.43 22.15 17.96 22.15 15.95 20.14 15.95 17.64 15.95 15.15 17.96 13.13 20.43 13.13 22.9 13.13 24.91 15.15 24.91 17.64Z" fill="#ffffff"/><path d="M41.07 24.14C37.45 26.71 33.32 28.67 27.46 28.67 24.72 28.67 24.16 25.73 22.35 27.17 21.42 27.91 18.12 29.57 15.5 29.45 12.86 29.32 8.65 27.77 7.46 22.15 6.99 27.77 6.76 31.92 4.66 36.67 9.81 44.24 18.79 48 27.83 46.36 26.86 39.53 32.78 32.84 36.12 29.42 37.38 28.13 39.81 26.01 41.07 24.14Z" fill="#4bcc00"/><path d="M19.69 17.61A3.68 2.63 90 1 0 24.95 17.61 3.68 2.63 90 1 0 19.69 17.61Z" fill="#0d1217"/><path d="M23.37 10.93C24.8 11.5 30.04 13.25 32.31 13.93 29.99 10.09 26.49 10.31 23.37 10.93Z" fill="#35af00"/><path d="M22.32 17.61L19.16 15.51V19.71L22.32 17.61Z" fill="#ffffff"/>'],
  composio: [88.586, 88.586, '<path d="M81.26 25.02l-50.02-10.23c-3.28-.67-6.36 1.85-6.36 5.19l0 23.7 0 1.26 0 23.7c0 3.35 3.08 5.87 6.37 5.19l50.03-10.23" fill="none" stroke="#000000" stroke-width="2.54" stroke-linecap="round" stroke-linejoin="round"/><path d="M42.64 6.56c0-4.7 4.8-7.84 9.11-6.04l.21 .09 0 0 26.76 12.36c2.35 1.06 3.82 3.4 3.82 5.95l0 10.47c0 3.82-3.25 6.84-7.05 6.54l-30.31-2.26 0 21.29 30.3-2.26 .36-.02c3.64-.09 6.7 2.85 6.68 6.54l0 10.47c0 2.57-1.51 4.88-3.82 5.95l0 0-26.74 12.34 0 0c-4.36 2.02-9.32-1.16-9.32-5.95l0-9.98c-.2 .08-.41 .13-.63 .14l-14.79 1.07c-1.24 .09-2.29-.89-2.29-2.13l0-10.98c0-.43 .13-.82 .35-1.16l-12.17 .91 0 0c-3.79 .27-7.05-2.74-7.05-6.54l0-18.07c0-3.82 3.26-6.84 7.06-6.54l0 0 11.9 .89c-.05-.18-.08-.38-.08-.58l0-11.57c0-1.69 1.51-2.98 3.18-2.71l14.08 2.25c.16 .03 .3 .07 .44 .12l0-10.58zm33.04 48.66l0 0-30.5 2.28 0 13.23 34.8-7.27 0-4.25 0-.21c-.1-2.21-2.04-3.94-4.3-3.77zm-51.23-23.1c.21 .33 .34 .73 .34 1.15l0 22.48c0 .26-.05 .51-.13 .74l17.99-1.34 0-21.66-18.19-1.36zm20.73-.99l30.5 2.28 .01 0 .22 .01c2.23 .05 4.11-1.75 4.11-4.03l0-4.4-34.83-7.28 0 13.42z"/>'],
  context7: [28, 28, '<path d="M4 0l20 0c2.21 0 4 1.79 4 4l0 20c0 2.21-1.79 4-4 4l-20 0c-2.21 0-4-1.79-4-4l0-20c0-2.21 1.79-4 4-4z"/><path d="M10.57 15.26c0 2.25-.91 4.12-2.39 5.85l3.45 0 0 1.67-5.3 0 0-1.59c1.62-1.83 2.25-3.33 2.25-5.93l1.99 0z" fill="#ffffff"/><path d="M17.43 15.26c0 2.25 .91 4.12 2.39 5.85l-3.45 0 0 1.67 5.3 0 0-1.59c-1.62-1.83-2.25-3.33-2.25-5.93l-1.99 0z" fill="#ffffff"/><path d="M10.57 12.74c0-2.25-.91-4.12-2.39-5.85l3.45 0 0-1.67-5.3 0 0 1.59c1.62 1.83 2.25 3.33 2.25 5.93l1.99 0z" fill="#ffffff"/><path d="M17.43 12.74c0-2.25 .91-4.12 2.39-5.85l-3.45 0 0-1.67 5.3 0 0 1.59c-1.62 1.83-2.25 3.33-2.25 5.93l-1.99 0z" fill="#ffffff"/>'],
  craft: [48, 48, '<path d="M22.19 48L22.19 48C10.1 48 .28 38.28 .13 26.23L.13 25.94H22.19V48Z" fill="#030302"/><path d="M22.19 0L22.19 0C10 0 .13 9.88 .13 22.06L.13 22.06 22.19 22.06 22.19 0Z" fill="#030302"/><path d="M25.81 22.06L25.82 22.06C38 22.06 47.88 12.19 47.88 0V0L25.81 0 25.81 22.06Z" fill="#030302"/><path d="M25.81 25.94L25.82 25.94C37.9 25.94 47.72 35.66 47.87 47.71L47.88 48H25.81V25.94Z" fill="#030302"/>'],
  deepl: [48, 48, '<path d="M23.36 .08C23.02 .19 22.54 .44 21.25 1.21L19.74 2.09A1202.13 1202.13 0 0 0 13.71 5.64 1653.11 1653.11 0 0 0 6.89 9.66C5.73 10.34 5.33 10.83 5.13 11.83L4.99 12.47 5.02 22.18 5.04 31.89 5.2 32.33C5.44 33.04 6.86 34.42 7.34 34.42 7.38 34.42 8.93 35.31 9.04 35.39A22.35 22.35 0 0 0 10.23 36.1L11.61 36.9C11.75 36.99 12.57 37.47 13.43 37.97 14.28 38.46 15.02 38.9 15.07 38.94 15.14 39 16.11 39.57 17.68 40.47 17.85 40.57 18.03 40.68 18.08 40.72S18.39 40.9 18.66 41.05C19.16 41.32 20.23 41.95 21.19 42.53 22.37 43.24 23.64 43.98 24.47 44.45 24.76 44.61 25.16 44.85 25.36 44.98 25.65 45.17 26.51 45.68 27.78 46.4 27.91 46.47 28.49 46.82 29.08 47.16L30.35 47.89 30.56 48 30.68 47.89 30.81 47.79V40.65L31.1 40.27C31.35 39.93 32.11 39.4 32.89 38.99 33.04 38.92 33.45 38.69 33.8 38.48L38.05 35.98C39.05 35.37 39.35 35.2 40.53 34.51A8.87 8.87 0 0 0 42.18 33.35L42.68 32.85 42.85 32.33 43.01 31.81V11.94L42.85 11.44C42.6 10.62 42.01 10.07 40.35 9.14L39.46 8.65A10.29 10.29 0 0 1 38.57 8.12C38.42 8.01 37.89 7.69 37.38 7.4 36.87 7.12 36.29 6.78 36.09 6.66L34.35 5.65A47.9 47.9 0 0 1 32.74 4.69 35.48 35.48 0 0 0 31.41 3.9L29.14 2.59C28.36 2.14 27.24 1.47 26.69 1.13A20.93 20.93 0 0 0 25.4 .42L24.56 0 24.07 .01A3.55 3.55 0 0 0 23.36 .08" fill="#0f2b46"/><path d="M18.1 9.95C14.7 10.42 14.13 15.25 17.3 16.69L17.91 16.97H19.51L19.93 16.78C20.16 16.68 20.46 16.51 20.61 16.41 21.04 16.11 21.76 16.42 24.47 18.1 24.76 18.28 25.78 18.88 26.73 19.42 28.74 20.58 28.68 20.52 28.68 21.31A3.55 3.55 0 0 0 31.6 24.85L32.24 24.95 32.81 24.85A3.44 3.44 0 0 0 35.36 22.89L35.64 22.31 35.67 21.49 35.71 20.68 35.52 20.18A3.55 3.55 0 0 0 30.37 18.35C30.2 18.45 30 18.54 29.92 18.54 29.79 18.54 27.61 17.32 26.42 16.58A79.48 79.48 0 0 0 23.23 14.73 4.97 4.97 0 0 1 22.45 14.21L22.21 13.98V13.44C22.21 11.28 20.28 9.64 18.1 9.95M26.31 24.1C26.15 24.19 25.48 24.58 24.81 24.97 24.15 25.36 23.4 25.79 23.15 25.93 22.9 26.07 22.4 26.36 22.04 26.58 21.21 27.07 21.06 27.11 20.78 26.89 20.65 26.79 20.32 26.6 20.03 26.48L19.5 26.24 18.73 26.24 17.96 26.23 17.4 26.44 16.84 26.65 16.26 27.23 15.68 27.81 15.43 28.43 15.18 29.05V29.76A3.5 3.5 0 0 0 20.81 32.57C21.62 31.96 22.21 30.8 22.21 29.79V29.27L22.45 29.04C22.58 28.91 22.81 28.76 22.96 28.69 23.11 28.62 23.52 28.4 23.87 28.19L27.04 26.32 27.6 25.99C28.07 25.71 28.07 25.58 27.58 24.95L26.99 24.2C26.78 23.91 26.7 23.9 26.31 24.11" fill="#ffffff"/>'],
  deepwiki: [41.143, 41.143, '<path d="M15.16 16.7l0 0c.68-.39 1.45-.6 2.23-.6l.06 0 .08 0c.05 0 .11 0 .16 .01l.04 0c.64 .05 1.25 .23 1.83 .54 .06 .03 .11 .06 .17 .1 .04 .03 .09 .05 .13 .08l.04 .03c.35 .24 .67 .53 .95 .86 .04 .05 .08 .09 .12 .15l.02 .03c.03 .04 .06 .08 .08 .12l.05 .07c.02 .03 .04 .07 .06 .1 .02 .03 .04 .06 .05 .09l.03 .05c.39 .68 .6 1.45 .6 2.23l0 0c0 .78-.21 1.56-.6 2.23l-.07 .12c-.03 .05-.06 .09-.09 .14l-.02 .03c-.36 .53-.82 .97-1.38 1.31-.06 .03-.11 .07-.17 .1-.04 .03-.09 .05-.14 .07l-.04 .02c-.38 .19-.79 .32-1.22 .39-.06 .01-.12 .02-.18 .03l-.05 .01c-.05 .01-.1 .01-.14 .01-.03 0-.06 .01-.09 .01-.04 0-.08 .01-.12 0-.03 0-.07 0-.1 0l-.06 0 0 0c-.78 0-1.55-.21-2.23-.6l-4.13-2.38-8.27 4.78 0 9.54 8.27 4.77 8.27-4.77 0-4.77c0-.78 .21-1.56 .6-2.23l.07-.12c.03-.05 .06-.09 .09-.13l.02-.03c.36-.53 .83-.97 1.38-1.31 .06-.03 .11-.06 .17-.1 .05-.02 .09-.05 .14-.07l.05-.02c.38-.19 .79-.32 1.22-.39 .06-.01 .12-.02 .18-.02l.05-.01c.05 0 .1-.01 .15-.01l.09-.01c.04 0 .08 0 .12 0 .03 0 .07 0 .1 0l.06 0 0 0c.78 0 1.55 .21 2.23 .6l4.14 2.38 8.27-4.77 0-9.54-8.27-4.77-4.13 2.39 0-.01c-.68 .39-1.45 .59-2.24 .6l-.05 0-.08 0c-.05 0-.11 0-.16-.01l-.04 0c-.64-.05-1.25-.23-1.82-.54-.06-.03-.11-.06-.17-.1-.04-.03-.09-.06-.13-.08l-.04-.03c-.35-.24-.67-.52-.95-.86-.04-.05-.07-.09-.12-.15l-.02-.03c-.03-.04-.06-.08-.08-.12l-.05-.07c-.02-.03-.04-.07-.06-.1-.02-.03-.04-.06-.05-.09l-.03-.05c-.39-.68-.6-1.45-.6-2.23l0 0 0-4.77-8.23-4.75-.04-.02-8.27 4.78 0 9.54 8.27 4.77 4.14-2.39 .01 0z" fill="#0e1015"/>'],
  evernote: [48, 48, '<path d="M18 2.24C19.45 .73 21.53 0 23.61 .28 25.01 .47 26.31 1.11 27.31 2.1L28.35 3.12H29.72C37.39 3.12 43.6 9.34 43.6 17V31.94H43.59C43.59 37.76 42.17 41.57 39.17 44.04 35.3 47.66 27.81 48 23.46 44.52 21.75 43.15 20.61 41.62 19.41 38.96L26.26 36.35C26.49 36.86 26.93 37.71 27.65 38.48 29.1 40.05 32.16 40.06 33.37 38.96 36.27 36.32 33.78 31.94 28.68 31.94L18.33 31.94C11.61 31.94 6.03 27.04 4.97 20.61 4.98 20.61 4.98 20.61 4.98 20.62 4.4 16.75 5.58 15.53 7.9 15.53H14.18C19.31 15.53 20.71 13.37 20.71 9.5V7.52H19.78C19.78 7.52 19.66 8.54 19.28 9.5 18.48 11.55 17.71 13.02 14.71 13.02 13.37 13.02 12.02 13.02 10.67 13.02 9.67 13.02 8.67 13.02 7.67 13.02L9.64 10.97 18 2.24ZM33.49 20.11C31.67 20.11 30.19 21.32 30.18 22.81H36.8C36.8 21.32 35.32 20.11 33.49 20.11Z" fill="#00a82d" fill-rule="evenodd"/>'],
  exa: [129, 129, '<path d="M117.71 9.31c0 .27-.09 .53-.26 .73l-44.61 54.46 44.62 54.46c.17 .21 .26 .47 .26 .73l0 8.15c0 .64-.52 1.16-1.16 1.16l-104.09 0c-.64 0-1.16-.52-1.16-1.16l0-126.69c0-.64 .52-1.16 1.16-1.16l104.09 0c.64 0 1.16 .52 1.16 1.16l0 8.15zm-87.38 107.08l68.66 0-34.33-41.9-34.33 41.9zm-6.37-12.19l27.47-33.53-27.47 0 0 33.53zm0-46.15l27.23 0-27.23-33.23 0 33.24zm40.69-3.52l34.33-41.9-68.66 0 34.33 41.9z" fill="#0143d9" fill-rule="evenodd"/>'],
  ferryhopper: [48, 48, '<path d="M11.14 39.22C11.14 43.98 16.9 48 24.01 48S36.86 44.07 36.86 39.22C36.86 35.68 33.74 32.63 29.29 31.25L27.34 35.51A4.38 4.38 0 0 1 30.44 39.22C30.44 41.6 27.56 43.62 24.01 43.62S17.54 41.65 17.54 39.22A4.19 4.19 0 0 1 20.2 35.7L18.33 31.37C14.07 32.8 11.19 35.77 11.19 39.22" fill="#01c3a7"/><path d="M35.24 12.24A11.25 11.25 0 1 0 13.95 17.26H13.95L23.77 39.72 34.2 17.26H34.2A11.44 11.44 0 0 0 35.24 12.24Z"/>'],
  firecrawl: [70.996, 70.996, '<path d="M52.21 22.69c-2.76 .82-4.84 2.68-6.37 4.69-.33 .43-1.01 .11-.88-.42 2.92-12.01-.94-21.99-12.96-26.9-.28-.11-.6-.06-.83 .13-.23 .2-.33 .51-.25 .8 5.47 21.96-17.54 20.11-14.63 45.01 .05 .43-.43 .72-.78 .47-1.09-.78-2.31-2.41-3.14-3.56-.11-.15-.3-.23-.49-.2-.19 .03-.34 .17-.39 .36-.66 2.4-.98 4.67-.98 6.92 0 8.75 4.5 16.45 11.3 20.92 .39 .26 .89-.11 .76-.56-.36-1.2-.55-2.44-.56-3.7 0-.79 .05-1.59 .17-2.34 .28-1.88 .94-3.68 2.04-5.31 3.77-5.66 11.33-11.13 10.13-18.56-.08-.47 .48-.78 .83-.46 5.33 4.87 6.38 11.42 5.51 17.29-.07 .51 .56 .78 .89 .38 .81-1.02 1.79-1.89 2.89-2.59 .27-.17 .63-.04 .73 .26 .6 1.75 1.5 3.4 2.34 5.04 1.58 3.09 1.9 6.66 .91 9.98-.06 .2 .01 .42 .18 .55 .17 .13 .4 .14 .58 .02 6.81-4.46 11.31-12.17 11.31-20.92 0-3.04-.53-6.02-1.54-8.82-2.11-5.86-7.47-10.26-6.12-17.9 .07-.36-.27-.68-.63-.58" fill="#fa5d19"/>'],
  fireflies: [48, 48, '<defs><linearGradient id="%ID%0" gradientUnits="userSpaceOnUse" x1="38.6" y1="39.63" x2="-27.73" y2="-30.06"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de2d7a"/><stop offset=".3" stop-color="#c5388f"/><stop offset=".54" stop-color="#9b4ab0"/><stop offset=".82" stop-color="#6262de"/><stop offset=".99" stop-color="#3b73ff"/></linearGradient><linearGradient id="%ID%1" gradientUnits="userSpaceOnUse" x1="38.83" y1="39.41" x2="-27.5" y2="-30.28"><stop offset="0" stop-color="#ff3c82"/><stop offset=".1" stop-color="#f53e88"/><stop offset=".27" stop-color="#dc4598"/><stop offset=".49" stop-color="#b251b2"/><stop offset=".75" stop-color="#7961d7"/><stop offset=".99" stop-color="#3b73ff"/></linearGradient><linearGradient id="%ID%2" gradientUnits="userSpaceOnUse" x1="49.85" y1="28.93" x2="27.37" y2="-52.52"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de2d7a"/><stop offset=".3" stop-color="#c5388f"/><stop offset=".54" stop-color="#9b4ab0"/><stop offset=".82" stop-color="#6262de"/><stop offset=".99" stop-color="#3b73ff"/></linearGradient><linearGradient id="%ID%3" gradientUnits="userSpaceOnUse" x1="27.73" y1="49.98" x2="-52.73" y2="25.47"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de2d7a"/><stop offset=".3" stop-color="#c5388f"/><stop offset=".54" stop-color="#9b4ab0"/><stop offset=".82" stop-color="#6262de"/><stop offset=".99" stop-color="#3b73ff"/></linearGradient><linearGradient id="%ID%4" gradientUnits="userSpaceOnUse" x1="-7.72" y1="-19.57" x2="14.82" y2="32.08"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de286e"/><stop offset=".3" stop-color="#c52361"/><stop offset=".54" stop-color="#9b1a4d"/><stop offset=".83" stop-color="#620f30"/><stop offset=".99" stop-color="#3d081e"/></linearGradient><linearGradient id="%ID%5" gradientUnits="userSpaceOnUse" x1="10.98" y1="-.65" x2="33.51" y2="50.99"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de286e"/><stop offset=".3" stop-color="#c52361"/><stop offset=".54" stop-color="#9b1a4d"/><stop offset=".83" stop-color="#620f30"/><stop offset=".99" stop-color="#3d081e"/></linearGradient><linearGradient id="%ID%6" gradientUnits="userSpaceOnUse" x1="-5.24" y1="-1.48" x2="45.8" y2="32.43"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de286e"/><stop offset=".3" stop-color="#c52361"/><stop offset=".54" stop-color="#9b1a4d"/><stop offset=".83" stop-color="#620f30"/><stop offset=".99" stop-color="#3d081e"/></linearGradient><linearGradient id="%ID%7" gradientUnits="userSpaceOnUse" x1="-1117.34" y1="1102.02" x2="-1108.59" y2="1171.07"><stop offset="0" stop-color="#e82a73"/><stop offset=".11" stop-color="#de286e"/><stop offset=".3" stop-color="#c52361"/><stop offset=".54" stop-color="#9b1a4d"/><stop offset=".83" stop-color="#620f30"/><stop offset=".99" stop-color="#3d081e"/></linearGradient></defs><path d="M15.78 0H0V15.66H15.78V0Z" fill="url(#%ID%0)"/><path d="M34.47 18.91H18.69V34.57H34.47V18.91Z" fill="url(#%ID%1)"/><path d="M34.47 0H18.69V15.66H48V13.43C48 9.87 46.57 6.45 44.04 3.93 41.5 1.42 38.06 0 34.47 0H34.47Z" fill="url(#%ID%2)"/><path d="M0 18.91V34.57C0 38.14 1.43 41.55 3.96 44.07 6.5 46.59 9.94 48 13.53 48H15.78V18.91H0Z" fill="url(#%ID%3)"/><path d="M0 0L15.78 15.66H0V0Z" fill="url(#%ID%4)" fill-opacity="0.18"/><path d="M18.69 18.91L34.47 34.57H18.69V18.91Z" fill="url(#%ID%5)" fill-opacity="0.18"/><path d="M0 34.57C0 38.14 1.43 41.55 3.96 44.07 6.5 46.59 9.94 48 13.53 48H15.78V18.91L0 34.57Z" fill="url(#%ID%6)" fill-opacity="0.18"/><path d="M34.47 0C38.06 0 41.5 1.42 44.04 3.93 46.57 6.45 48 9.87 48 13.43V15.66H18.69L34.47 0Z" fill="url(#%ID%7)" fill-opacity="0.18"/>'],
  gitlab: [32.005, 32.005, '<path d="M31.46 12.79l-.04-.12-4.35-11.35c-.18-.45-.64-.74-1.13-.71-.24 0-.47 .1-.66 .24-.19 .15-.33 .36-.39 .6l-2.94 9-11.9 0-2.94-9c-.12-.48-.54-.83-1.04-.86-.5-.03-.95 .26-1.14 .72l-4.35 11.38-.05 .11c-1.28 3.36-.19 7.17 2.68 9.34l.02 .01 .04 .03 6.63 4.97 3.28 2.48 2 1.52c.48 .36 1.14 .36 1.62 0l2-1.52 3.28-2.48 6.67-5 .02 0c2.89-2.17 3.99-5.99 2.7-9.36z" fill="#e24329"/><path d="M31.46 12.79l-.04-.12c-2.12 .44-4.12 1.34-5.86 2.64l-9.55 7.24 6.09 4.6 6.67-5 .02 0c2.88-2.18 3.97-5.99 2.67-9.36z" fill="#fc6d26"/><path d="M9.9 27.15l3.28 2.48 2 1.52c.48 .36 1.14 .36 1.62 0l2-1.52 3.28-2.48-6.1-4.6-6.07 4.6z" fill="#fca326"/><path d="M6.44 15.31c-1.74-1.3-3.74-2.2-5.86-2.63l-.05 .12c-1.28 3.36-.19 7.17 2.68 9.34l.02 .01 .04 .03 6.63 4.97 6.1-4.6-9.56-7.24z" fill="#fc6d26"/>'],
  gmail: [512, 512, '<path d="M34.91 448.05l81.45 0 0-197.82-116.36-87.28 0 250.19c0 19.29 15.62 34.91 34.91 34.91z" fill="#4285f4"/><path d="M395.64 448.05l81.45 0c19.29 0 34.91-15.62 34.91-34.91l0-250.19-116.36 87.28z" fill="#34a853"/><path d="M395.64 98.95l0 151.28 116.36-87.28 0-46.54c0-43.14-49.25-67.78-83.78-41.89z" fill="#fbbc04"/><path d="M116.36 250.23l0-151.28 139.64 104.73 139.64-104.73 0 151.28-139.64 104.72z" fill="#ea4335" fill-rule="evenodd"/><path d="M0 116.41l0 46.54 116.36 87.28 0-151.28-32.58-24.43c-34.53-25.89-83.78-1.25-83.78 41.89z" fill="#c5221f"/>'],
  google_calendar: [512, 512, '<defs><clipPath id="%ID%0"><path d="M0 0l512 0 0 512-512 0z"/></clipPath></defs><g clip-path="url(#%ID%0)"><path d="M390.74 121.26l-269.48 0 0 269.48 269.48 0 0-269.48z" fill="#ffffff"/><path d="M390.74 512l121.26-121.26-60.63-10.35-60.63 10.35-11.07 55.46 11.07 65.8z" fill="#ea4335"/><path d="M0 390.74l0 80.84c0 22.33 18.09 40.42 40.42 40.42l80.84 0 12.45-60.63-12.45-60.63-66.06-10.35-55.2 10.35z" fill="#188038"/><path d="M512 121.26l0-80.84c0-22.33-18.09-40.42-40.42-40.42l-80.84 0c-7.38 30.07-11.06 52.2-11.07 66.39 0 14.19 3.69 32.48 11.07 54.87 26.82 7.68 47.03 11.52 60.63 11.52 13.6 0 33.81-3.84 60.63-11.52z" fill="#1967d2"/><path d="M512 121.26l-121.26 0 0 269.48 121.26 0 0-269.48z" fill="#fbbc04"/><path d="M390.74 390.74l-269.48 0 0 121.26 269.48 0 0-121.26z" fill="#34a853"/><path d="M390.74 0l-350.32 0c-22.33 0-40.42 18.09-40.42 40.42l0 350.32 121.26 0 0-269.48 269.48 0 0-121.26z" fill="#4285f4"/><path d="M176.54 330.31c-10.07-6.8-17.05-16.74-20.85-29.88l23.38-9.63c2.12 8.08 5.82 14.35 11.11 18.79 5.25 4.45 11.65 6.64 19.13 6.64 7.65 0 14.21-2.32 19.71-6.98 5.49-4.65 8.25-10.58 8.25-17.75 0-7.34-2.9-13.34-8.69-17.98-5.79-4.65-13.07-6.97-21.76-6.98l-13.51 0 0-23.14 12.13 0c7.48 0 13.78-2.02 18.9-6.06 5.12-4.04 7.68-9.57 7.68-16.61 0-6.26-2.29-11.25-6.87-14.99-4.58-3.74-10.38-5.63-17.42-5.62-6.87 0-12.33 1.82-16.37 5.49-4.04 3.68-7.08 8.33-8.83 13.51l-23.14-9.64c3.06-8.69 8.69-16.37 16.95-23 8.25-6.64 18.8-9.97 31.59-9.97 9.47 0 17.99 1.82 25.54 5.49 7.54 3.67 13.47 8.76 17.75 15.22 4.28 6.5 6.4 13.78 6.4 21.86 0 8.25-1.99 15.23-5.96 20.95-3.97 5.73-8.86 10.1-14.66 13.17l0 1.38c7.48 3.08 13.98 8.15 18.8 14.66 4.88 6.57 7.34 14.42 7.34 23.58 0 9.16-2.33 17.35-6.97 24.52-4.65 7.18-11.08 12.83-19.24 16.94-8.18 4.11-17.38 6.2-27.58 6.2-11.82 .03-22.74-3.37-32.81-10.17zm143.59-116.01l-25.66 18.56-12.84-19.47 46.05-33.21 17.65 0 0 156.66-25.2 0 0-122.54z" fill="#4285f4"/></g>'],
  google_chat: [99.995, 99.995, '<defs><clipPath id="%ID%0"><path d="M2.06 0l95.88 0 0 100-95.88 0z"/></clipPath></defs><g clip-path="url(#%ID%0)"><path d="M23.82 53.94l0-32.5-14.2 0c-4.18 0-7.56 3.4-7.56 7.58l0 67.18c0 3.38 4.08 5.06 6.46 2.68l15.62-15.62 44.48 0c4.18 0 7.56-3.38 7.56-7.56l0-14.2-44.78 0c-4.18 0-7.58-3.38-7.58-7.56z" fill="#00ac47"/><path d="M90.38 0l-58.98 0c-4.18 0-7.56 3.38-7.56 7.56l0 13.88 44.78 0c4.18 0 7.56 3.38 7.56 7.56l0 32.48 14.2 0c4.18 0 7.56-3.38 7.56-7.56l0-46.36c0-4.18-3.38-7.56-7.56-7.56z" fill="#5bb974"/><path d="M68.62 21.44l-44.8 0 0 32.48c0 4.18 3.38 7.56 7.56 7.56l44.78 0 0-32.46c.02-4.18-3.36-7.58-7.54-7.58z" fill="#00832d"/></g>'],
  google_docs: [88, 88, '<path d="M70 88l-52 0c-3.3 0-6-2.7-6-6l0-76c0-3.3 2.7-6 6-6l36 0 22 22 0 60c0 3.3-2.7 6-6 6z" fill="#3086f6"/><path d="M54 0l22 22-22 0 0-22z" fill="#0c67d6"/><path d="M62 39l-36 0 0-5 36 0 0 5zm0 7l-36 0 0 5 36 0 0-5zm-10 12l-26 0 0 5 26 0 0-5z" fill="#fdffff"/>'],
  google_drive: [87.3, 87.3, '<path d="M6.6 71.5l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8-27.5 0c0 1.55 .4 3.1 1.2 4.5z" fill="#0066da"/><path d="M43.65 29.65l-13.75-23.8c-1.35 .8-2.5 1.9-3.3 3.3l-25.4 44c-.78 1.37-1.2 2.92-1.2 4.5l27.5 0z" fill="#00ac47"/><path d="M73.55 81.45c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5l-27.5 0 5.85 11.5z" fill="#ea4335"/><path d="M43.65 29.65l13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2l-18.5 0c-1.6 0-3.15 .45-4.5 1.2z" fill="#00832d"/><path d="M59.8 57.65l-32.3 0-13.75 23.8c1.35 .8 2.9 1.2 4.5 1.2l50.8 0c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/><path d="M73.4 31.15l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28 27.45 0c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>'],
  google_maps: [132.4, 132.4, '<path d="M80.2 2.2c-4.4-1.4-9.2-2.2-14.1-2.2-14.1 0-26.8 6.4-35.3 16.5l21.8 18.3 27.6-32.6z" fill="#1a73e8"/><path d="M30.8 16.5c-6.7 8-10.8 18.4-10.8 29.6 0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z" fill="#ea4335"/><path d="M66.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7l-27.6 32.6c3.3-3.8 8.1-6.3 13.6-6.3" fill="#4285f4"/><path d="M66.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3" fill="#fbbc04"/><path d="M79.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3l-61.6 73.1c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1 6 0 3.4-8.7 12.8-23.2" fill="#34a853"/>'],
  google_sheets: [97.139, 97.139, '<defs><clipPath id="%ID%0"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><clipPath id="%ID%1"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><clipPath id="%ID%2"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><linearGradient id="%ID%3" gradientUnits="userSpaceOnUse" x1="71.62" y1="26.66" x2="71.62" y2="49.11"><stop offset="0" stop-color="#263238" stop-opacity="0.2"/><stop offset="1" stop-color="#263238" stop-opacity="0.02"/></linearGradient><clipPath id="%ID%4"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><clipPath id="%ID%5"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><clipPath id="%ID%6"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><clipPath id="%ID%7"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z"/></clipPath><radialGradient id="%ID%8" gradientUnits="userSpaceOnUse" cx="15.48" cy="1.93" r="113.92"><stop offset="0" stop-color="#ffffff" stop-opacity="0.1"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#%ID%0)"><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-15.45-11.04-11.04-15.45z" fill="#0f9d58"/></g><g clip-path="url(#%ID%1)"><path d="M30.91 47.47l0 32.01 35.32 0 0-32.01-35.32 0zm15.45 27.6l-11.04 0 0-5.52 11.04 0 0 5.52zm0-8.83l-11.04 0 0-5.52 11.04 0 0 5.52zm0-8.83l-11.04 0 0-5.52 11.04 0 0 5.52zm15.45 17.66l-11.04 0 0-5.52 11.04 0 0 5.52zm0-8.83l-11.04 0 0-5.52 11.04 0 0 5.52zm0-8.83l-11.04 0 0-5.52 11.04 0 0 5.52z" fill="#f1f1f1"/></g><g clip-path="url(#%ID%2)"><path d="M59.34 24.56l24.56 24.55 0-22.61-24.55-1.94z" fill="url(#%ID%3)"/></g><g clip-path="url(#%ID%4)"><path d="M57.4 0l0 19.87c0 3.66 2.96 6.62 6.62 6.62l19.87 0-26.49-26.49z" fill="#87ceac"/></g><g clip-path="url(#%ID%5)"><path d="M19.87 0c-3.64 0-6.62 2.98-6.62 6.62l0 .55c0-3.64 2.98-6.62 6.62-6.62l37.53 0 0-.55-37.53 0z" fill="#ffffff" fill-opacity="0.2"/></g><g clip-path="url(#%ID%6)"><path d="M77.27 96.59l-57.4 0c-3.64 0-6.62-2.98-6.62-6.62l0 .55c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-.55c0 3.64-2.98 6.62-6.62 6.62z" fill="#263238" fill-opacity="0.2"/></g><g clip-path="url(#%ID%7)"><path d="M64.02 26.49c-3.66 0-6.62-2.96-6.62-6.62l0 .55c0 3.66 2.96 6.62 6.62 6.62l19.87 0 0-.55-19.87 0z" fill="#263238" fill-opacity="0.1"/></g><path d="M57.4 0l-37.53 0c-3.64 0-6.62 2.98-6.62 6.62l0 83.89c0 3.64 2.98 6.62 6.62 6.62l57.4 0c3.64 0 6.62-2.98 6.62-6.62l0-64.02-26.49-26.49z" fill="url(#%ID%8)"/>'],
  google_slides: [98.611, 98.611, '<defs><clipPath id="%ID%0"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%1"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%2"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><linearGradient id="%ID%3" gradientUnits="userSpaceOnUse" x1="72.7" y1="27.07" x2="72.7" y2="49.85"><stop offset="0" stop-color="#bf360c" stop-opacity="0.2"/><stop offset="1" stop-color="#bf360c" stop-opacity="0.02"/></linearGradient><clipPath id="%ID%4"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%5"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%6"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%7"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><clipPath id="%ID%8"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z"/></clipPath><radialGradient id="%ID%9" gradientUnits="userSpaceOnUse" cx="15.72" cy="1.96" r="115.64"><stop offset="0" stop-color="#ffffff" stop-opacity="0.1"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><g clip-path="url(#%ID%0)"><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-15.69-11.21-11.21-15.69z" fill="#f4b400"/></g><g clip-path="url(#%ID%1)"><path d="M63.87 44.82l-29.13 0c-1.85 0-3.36 1.51-3.36 3.36l0 29.14c0 1.85 1.51 3.36 3.36 3.36l29.14 0c1.85 0 3.36-1.51 3.36-3.36l0-29.13c0-1.85-1.51-3.36-3.36-3.36zm-1.12 25.77l-26.89 0 0-15.69 26.89 0 0 15.69z" fill="#f1f1f1"/></g><g clip-path="url(#%ID%2)"><path d="M60.24 24.93l24.93 24.92 0-22.95-24.93-1.97z" fill="url(#%ID%3)"/></g><g clip-path="url(#%ID%4)"><path d="M58.27 0l0 20.17c0 3.72 3.01 6.72 6.72 6.72l20.17 0-26.89-26.89z" fill="#fada80"/></g><g clip-path="url(#%ID%5)"><path d="M58.27 0l0 .56 26.33 26.33 .56 0-26.89-26.89z" fill="#ffffff" fill-opacity="0.1"/></g><g clip-path="url(#%ID%6)"><path d="M20.17 0c-3.7 0-6.72 3.03-6.72 6.72l0 .56c0-3.7 3.03-6.72 6.72-6.72l38.1 0 0-.56-38.1 0z" fill="#ffffff" fill-opacity="0.2"/></g><g clip-path="url(#%ID%7)"><path d="M78.44 98.05l-58.27 0c-3.7 0-6.72-3.02-6.72-6.72l0 .56c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-.56c0 3.7-3.03 6.72-6.72 6.72z" fill="#bf360c" fill-opacity="0.2"/></g><g clip-path="url(#%ID%8)"><path d="M64.99 26.89c-3.71 0-6.72-3.01-6.72-6.72l0 .56c0 3.72 3.01 6.72 6.72 6.72l20.17 0 0-.56-20.17 0z" fill="#bf360c" fill-opacity="0.1"/></g><path d="M58.27 0l-38.1 0c-3.7 0-6.72 3.03-6.72 6.72l0 85.17c0 3.7 3.03 6.72 6.72 6.72l58.27 0c3.7 0 6.72-3.03 6.72-6.72l0-64.99-26.89-26.89z" fill="url(#%ID%9)"/>'],
  granola: [48, 48, '<path d="M10.56 0H37.44A10.56 10.56 0 0 1 48 10.56V37.44A10.56 10.56 0 0 1 37.44 48H10.56A10.56 10.56 0 0 1 0 37.44V10.56A10.56 10.56 0 0 1 10.56 0Z" fill="#b2c248"/><path d="M23.81 41.74C27.49 41.74 31.34 40.92 32.89 39.79 33.89 39.08 34.38 39.15 35.26 38.31 35.51 38.06 35.61 37.99 35.68 37.92 39.04 35.16 40.99 31.59 40.99 26.96 40.99 19.42 35.65 14.29 28.01 14.29 21.29 14.29 16.16 18.57 16.16 24.05 16.16 29.04 20.05 32.61 25.61 32.61 25.92 32.61 26.07 32.43 26.42 32.43 27.77 32.43 28.86 32.05 29.57 31.3 29.92 30.92 30.59 30.14 30.66 30.1 30.98 29.82 31.05 29.39 31.13 29.22 31.19 29.04 31.34 28.93 31.41 28.69 31.48 28.4 31.38 28.05 31.38 27.73 31.38 27.17 31.62 26.6 31.62 26.07 31.62 24.59 29.85 23.1 28.26 23.1 28.08 23.1 28.08 22.96 27.98 22.96 27.87 22.96 27.77 23.07 27.66 23.07 27.55 23.07 27.41 22.89 27.27 22.89 27.13 22.89 27.06 23.03 26.85 23.03 26.39 23.03 26.35 23.1 26 23.1 25.89 23.1 25.71 23.14 25.64 23.17 25.5 23.24 25.5 23.35 25.36 23.35 25.17 23.35 25.07 23.38 25.07 23.45 25.07 23.84 25.11 23.77 24.93 23.77 24.74 23.77 24.63 23.79 24.58 23.81 24.44 23.88 24.54 24.05 24.4 24.16 24.26 24.23 24.23 24.34 24.19 24.55 24.16 24.76 23.94 24.83 23.94 25.05 23.94 25.15 23.98 25.22 23.98 25.29 23.98 25.5 23.56 25.43 23.56 25.65 23.56 25.79 23.66 25.89 23.66 26.03 23.66 26.14 23.59 26.21 23.59 26.32 23.59 26.43 23.66 26.5 23.66 26.56 23.66 26.74 23.42 26.78 23.42 26.92 23.42 27.06 23.56 27.16 23.56 27.27 23.56 27.34 23.45 27.38 23.45 27.48 23.45 27.59 23.42 27.41 23.63 27.73 23.77 27.94 23.77 28.05 23.63 28.23 23.49 28.4 23.21 28.51 22.85 28.51 21.37 28.51 21.19 26.99 20.38 26.74 20.13 26.67 20.09 26.63 20.09 26.53 20.09 26.43 20.09 26.46 20.24 26.32 20.38 26.18 20.41 26.07 20.41 25.96 20.41 25.86 20.41 25.82 20.34 25.75 20.06 25.29 19.92 24.73 19.92 24.09 19.92 20.84 23.88 18.11 27.63 18.11 28.76 18.11 28.58 18.4 29.26 18.4 29.43 18.4 29.36 18.4 29.61 18.36 30.25 18.26 31.41 18.51 32.33 18.96 34.88 20.24 36.54 23.24 36.54 26.75 36.54 32.72 31.24 37.07 24.16 37.07 20.31 37.07 17.66 35.87 15.04 32.93 14.75 32.61 15.18 33 14.72 32.19 14.15 31.2 14.22 31.84 14.22 31.84 14.05 31.63 13.73 31.02 13.55 30.81 13.34 30.57 13.05 30.6 12.95 30.46 12.81 30.28 13.02 29.96 12.95 29.79 12.88 29.5 12.28 29.08 12.21 28.87 12.14 28.66 11.89 27.31 11.89 27.06 11.89 26.78 12.1 26.75 12.1 26.57 12.1 26.32 11.78 26.25 11.61 25.9 11.43 25.54 11.32 24.73 11.32 23.84 11.32 23.38 11.32 23.2 11.46 22.14 11.5 21.79 12.03 21.79 12.03 21.4 12.03 21.26 11.96 21.08 11.96 20.98 11.96 20.84 11.96 20.8 11.99 20.69 13.48 14.47 20.13 9.84 27.52 9.84 30.06 9.84 32.01 10.3 35.02 11.57 36.01 12 37.46 11.25 37.46 10.48 37.53 10.23 37.39 10.16 37.35 10.02 37.31 9.87 37.17 9.7 37.03 9.66 36.96 9.63 36.92 9.52 36.85 9.42 36.74 9.24 36.64 9.17 36.36 9.1 36.21 9.06 36.15 9.03 36.07 8.96 35.96 8.81 35.9 8.74 35.75 8.67 35.61 8.6 35.51 8.67 35.43 8.64 35.37 8.6 35.33 8.53 35.26 8.49 35.22 8.46 35.15 8.46 35.05 8.46 31.48 6.55 29.15 6.26 26.04 6.26 19.32 6.26 13.3 9.17 9.59 14.22 9.27 14.64 9.45 15.35 8.99 15.78 8.11 16.59 7.01 21.05 7.01 23.88 7.01 26.25 7.58 29.39 8.32 31.13 9.77 34.52 9.13 33.11 9.35 33.42 9.77 34.1 10.12 34.17 10.3 34.38 10.3 34.38 10.41 34.59 10.41 34.8 10.41 34.94 10.41 34.98 10.44 35.05 10.55 35.26 11.04 35.61 11.18 35.76 11.5 36.07 11.75 36.75 12.28 37.28 13.09 38.09 14.26 38.73 17.97 40.46 19.28 41.06 18.54 40.74 18.68 40.78 19 40.89 19.42 40.89 19.67 41.06 19.81 41.17 19.64 41.13 20.02 41.13 20.09 41.13 20.09 41.17 20.17 41.2 20.24 41.24 20.31 41.34 20.41 41.34 20.48 41.34 20.52 41.28 20.62 41.31 20.73 41.34 20.98 41.52 21.19 41.63 21.37 41.74 21.4 41.74 21.47 41.66 21.68 41.52 21.83 41.7 22.04 41.7 22.11 41.7 22.21 41.66 22.43 41.66 22.71 41.66 22.71 41.73 23.81 41.73" fill="#1e1e1e"/>'],
  intercom: [36, 36, '<path d="M31.17 19.81c0 .32-.13 .63-.35 .86-.22 .23-.53 .35-.85 .35-.32 0-.62-.13-.85-.35-.22-.23-.35-.54-.35-.86l0-10.81c0-.32 .13-.63 .35-.86 .22-.23 .53-.35 .85-.35 .32 0 .62 .13 .85 .35 .23 .23 .35 .54 .35 .86zm-.42 7.49c-.16 .16-4.61 3.91-12.77 3.91-8.16 0-12.59-3.73-12.77-3.89-.24-.2-.39-.5-.41-.81-.03-.31 .07-.63 .28-.87 .21-.24 .5-.39 .81-.41 .32-.02 .63 .08 .87 .28 .07 .05 4.05 3.31 11.22 3.31 7.17 0 11.18-3.28 11.22-3.31 .51-.43 1.26-.37 1.69 .13 .42 .5 .37 1.24-.12 1.67zm-25.97-18.3c.02-.32 .16-.62 .4-.84 .24-.21 .55-.33 .87-.31 .3 .02 .57 .14 .78 .36 .21 .21 .33 .5 .35 .79l0 10.79c0 .32-.13 .63-.35 .86-.22 .23-.53 .35-.85 .35-.32 0-.62-.13-.85-.35-.22-.23-.35-.54-.35-.86zm6.01-2.4c.02-.32 .16-.62 .4-.84 .24-.21 .55-.33 .87-.31 .3 .02 .57 .14 .78 .36 .21 .21 .33 .5 .35 .79l0 16c0 .32-.13 .63-.35 .86-.22 .23-.53 .35-.85 .35-.32 0-.62-.13-.85-.35-.22-.23-.35-.54-.35-.86zm6.04-.6c0-.32 .13-.63 .35-.86 .22-.23 .53-.35 .85-.35 .32 0 .62 .13 .85 .35 .22 .23 .35 .54 .35 .86l0 17.4c0 .32-.13 .63-.35 .86-.22 .23-.53 .35-.85 .35-.32 0-.62-.13-.85-.35-.22-.23-.35-.54-.35-.86zm5.94 .6c0-.32 .13-.63 .35-.86 .22-.23 .53-.35 .85-.35 .32 0 .62 .13 .85 .35 .22 .23 .35 .54 .35 .86l0 16c0 .32-.13 .63-.35 .86-.22 .23-.53 .35-.85 .35-.32 0-.62-.13-.85-.35-.22-.23-.35-.54-.35-.86zm8.74-6.6l-26.99 0c-.59 0-1.17 .11-1.72 .33-.55 .23-1.04 .56-1.46 .97-.84 .85-1.32 2-1.33 3.19l0 27c0 .59 .12 1.18 .35 1.73 .23 .55 .56 1.05 .98 1.46 .42 .42 .91 .75 1.46 .97 .54 .23 1.13 .34 1.72 .33l27 0c.59 .01 1.17-.11 1.72-.33 .54-.22 1.04-.55 1.46-.97 .85-.85 1.32-1.99 1.33-3.19l0-27.01c-.01-1.2-.48-2.34-1.32-3.19-.42-.42-.91-.75-1.45-.97-.54-.22-1.12-.34-1.71-.34"/>'],
  kagi: [48, 48, '<path d="M29.23 36.78H19.01C16.25 36.78 15.77 33.77 16.25 32.56 16.49 31.96 17.09 31.12 17.57 30.51 19.49 31.6 21.78 32.2 24.18 32.2 31.87 32.2 38.01 25.93 38.01 18.33 38.01 14.23 36.2 10.61 33.44 7.96L33.8 7.6C34.52 6.87 35.6 6.39 36.68 6.51L38.37 6.63V0H35.48C32.12 0 29.35 2.05 28.15 4.95 26.95 4.58 25.62 4.34 24.3 4.34 16.61 4.34 10.48 10.61 10.48 18.21 10.48 21.23 11.44 24.12 13.12 26.41 12.88 26.65 12.52 26.89 12.28 27.02L11.92 27.38C9.15 30.03 7.83 33.41 8.55 37.27 8.91 39.32 10.72 41.49 12.52 42.69 13.72 43.54 15.28 43.9 16.85 43.9L28.39 43.42C29.71 43.42 30.91 44.02 31.63 45.23L33.08 48 40.17 45.59 38.97 42.93C37.16 39.2 33.44 36.78 29.23 36.78M24.3 11.7C27.91 11.7 30.91 14.71 30.91 18.33S27.91 24.97 24.3 24.97 17.69 21.95 17.69 18.33C17.69 14.59 20.57 11.7 24.3 11.7" fill="#ffb319"/>'],
  kiwi: [48, 48, '<path d="M30.55 16.23C30.26 15.94 29.9 15.78 29.52 15.78S28.77 15.94 28.48 16.23L21.78 22.92C21.5 23.21 21.34 23.58 21.35 23.98 21.34 24.39 21.5 24.77 21.78 25.06L28.48 31.75C28.77 32.04 29.14 32.2 29.52 32.2 29.9 32.2 30.26 32.04 30.55 31.75 30.85 31.45 31.01 31.08 31 30.69 31 30.32 30.84 29.96 30.55 29.67L24.86 23.99 30.55 18.31C31.15 17.7 31.15 16.83 30.55 16.23ZM20.49 17.25C20.49 16.86 20.35 16.49 20.08 16.21 19.8 15.94 19.43 15.79 19.02 15.79 18.19 15.79 17.56 16.42 17.56 17.25V30.71C17.56 31.56 18.17 32.17 19.02 32.17 19.45 32.17 19.82 32.03 20.09 31.75 20.35 31.48 20.49 31.11 20.49 30.71Z" fill="#171b1e"/><path d="M46.39 22.86C45.5 22.86 44.78 23.58 44.78 24.47 44.78 25.36 45.5 26.08 46.39 26.08S48 25.36 48 24.47C48 23.58 47.28 22.86 46.39 22.86Z" fill="#00a58e" fill-rule="evenodd"/><path d="M44.05 32.56C43.8 32.37 43.5 32.27 43.18 32.27 42.72 32.27 42.28 32.5 42.01 32.87 40.17 35.35 37.58 37.43 34.52 38.89 31.33 40.4 27.68 41.2 23.97 41.2 18.3 41.2 12.98 39.38 8.99 36.07 7.08 34.49 5.58 32.65 4.54 30.6 3.47 28.51 2.93 26.28 2.93 24 2.93 21.71 3.47 19.49 4.54 17.4 6.11 14.32 8.72 11.69 12.1 9.79 15.61 7.83 19.71 6.79 23.97 6.79 27.69 6.79 31.34 7.6 34.54 9.12 37.61 10.58 40.2 12.67 42.03 15.16 42.3 15.54 42.75 15.76 43.21 15.76 43.53 15.76 43.82 15.66 44.08 15.48 44.73 15 44.87 14.08 44.39 13.44 42.27 10.55 39.3 8.15 35.8 6.48 32.21 4.77 28.12 3.87 23.97 3.87 17.62 3.87 11.64 5.93 7.12 9.67 4.9 11.52 3.15 13.67 1.93 16.07 .65 18.58 0 21.25 0 24S.65 29.42 1.93 31.93C3.77 35.53 6.79 38.58 10.67 40.75 14.61 42.96 19.21 44.13 23.97 44.13 28.11 44.13 32.19 43.23 35.77 41.53 39.27 39.87 42.24 37.47 44.36 34.61 44.84 33.96 44.7 33.04 44.05 32.56Z" fill="#00a58e" fill-rule="evenodd"/>'],
  linear: [100.002, 100.002, '<path d="M1.23 61.52c-.22-.95 .91-1.55 1.6-.86l36.51 36.51c.69 .69 .09 1.82-.86 1.6-18.42-4.32-32.93-18.83-37.25-37.25zm-1.22-14.63c-.02 .28 .09 .56 .29 .76l52.06 52.06c.2 .2 .48 .31 .76 .29 2.37-.15 4.7-.46 6.96-.93 .77-.16 1.03-1.1 .48-1.65l-57.97-57.98c-.55-.55-1.49-.29-1.65 .48-.47 2.3-.78 4.62-.93 6.96zm4.21-17.18c-.16 .37-.08 .81 .21 1.1l64.78 64.78c.29 .29 .73 .38 1.1 .21 1.78-.79 3.51-1.69 5.19-2.68 .26-.16 .43-.42 .47-.72 .04-.3-.07-.6-.29-.81l-67.23-67.23c-.21-.22-.51-.32-.82-.29-.3 .04-.57 .21-.72 .47-.99 1.67-1.89 3.41-2.68 5.19zm8.45-11.63c-.37-.37-.39-.96-.04-1.35 9.17-10.26 22.5-16.72 37.34-16.72 27.64 0 50.05 22.41 50.05 50.05 0 14.84-6.46 28.17-16.72 37.34-.39 .35-.99 .33-1.35-.04l-69.27-69.27z" fill="#5e6ad2"/>'],
  make: [32.102, 32.102, '<path d="M27.87 .05l-23.64 0c-2.34 0-4.23 1.89-4.23 4.22l0 23.56c0 2.33 1.89 4.22 4.23 4.22l23.64 0c2.34 0 4.23-1.89 4.23-4.22l0-23.56c0-2.33-1.89-4.22-4.23-4.22z" fill="#8200fa"/><path d="M13.01 21.98l3.1-12.9c.06-.25 .32-.41 .57-.35l3.7 .88c.26 .06 .41 .32 .35 .57l-3.1 12.9c-.06 .25-.32 .41-.57 .35l-3.7-.88c-.25-.06-.41-.32-.35-.57l0 0zm8.66 1.37l3.8 0c.26 0 .47-.21 .47-.47l0-13.26c0-.26-.21-.47-.47-.47l-3.8 0c-.26 0-.47 .21-.47 .47l0 13.26c0 .26 .21 .47 .47 .47l0 0zm-16.48-1.89l3.42 1.66c.24 .12 .52 .02 .64-.22l5.84-11.92c.12-.23 .02-.52-.22-.63l-3.42-1.66c-.24-.11-.52-.02-.63 .22l-5.83 11.92c-.12 .24-.02 .52 .22 .64z" fill="#ffffff"/>'],
  microsoft: [256, 256, '<path d="M121.67 121.67l-121.67 0 0-121.67 121.67 0z" fill="#f1511b"/><path d="M256 121.67l-121.66 0 0-121.67 121.66 0z" fill="#80cc28"/><path d="M121.66 256l-121.66 0 0-121.66 121.66 0z" fill="#00adef"/><path d="M256 256l-121.66 0 0-121.66 121.66 0z" fill="#fbbc09"/>'],
  miro: [32, 32, '<path d="M7 0l18 0c3.87 0 7 3.13 7 7l0 18c0 3.87-3.13 7-7 7l-18 0c-3.87 0-7-3.13-7-7l0-18c0-3.87 3.13-7 7-7z" fill="#ffd02f"/><path d="M20.67 5.6l-3.03 0 2.69 4.17-5.68-4.17-3.03 0 2.69 5.46-5.68-5.46-3.03 0 2.64 7.05-2.64 13.75 3.03 0 5.68-14.75-2.69 14.75 3.03 0 5.68-16.04-2.69 16.04 3.03 0 5.73-17.62-5.73-3.18z" fill="#050038"/>'],
  monday: [23.505, 23.505, '<path d="M2.92 18.59c-1.06 0-2.04-.55-2.55-1.44-.51-.89-.48-1.98 .08-2.84l5.26-8.04c.54-.87 1.53-1.4 2.59-1.37 1.06 .03 2.02 .61 2.51 1.51 .49 .9 .43 1.99-.16 2.84l-5.25 8.04c-.53 .82-1.47 1.31-2.48 1.31z" fill="#fb275d"/><path d="M11.87 18.59c-1.06 0-2.03-.55-2.55-1.44-.51-.89-.48-1.97 .08-2.83l5.25-8.02c.53-.89 1.53-1.43 2.6-1.4 1.07 .02 2.04 .61 2.53 1.52 .49 .91 .42 2-.19 2.85l-5.24 8.02c-.53 .81-1.46 1.31-2.47 1.31z" fill="#ffcc00"/><path d="M20.6 18.61c1.61 0 2.91-1.3 2.91-2.9 0-1.6-1.3-2.9-2.91-2.9-1.6 0-2.91 1.3-2.91 2.9 0 1.6 1.3 2.9 2.91 2.9z" fill="#00ca72"/>'],
  neon: [63.553, 63.553, '<path d="M63.28 .02l0 63.54-24.58-21.3 0 21.3-38.42 0 0-63.55 63 .02zm-55.28 55.82l22.97 0 0-30.51 24.58 21.72 0-39.32-47.55-.01 0 48.12z" fill="#37c38f"/>'],
  netlify: [256, 256, '<path d="M69.18 203.46l-2.42 0-12.06-12.06 0-2.42 18.44-18.45 12.78 0 1.7 1.71 0 12.78zm-14.48-136.46l0-2.42 12.06-12.06 2.42 0 18.44 18.44 0 12.78-1.7 1.71-12.78 0z" fill="#05bdba"/><path d="M160.91 164.57l-17.56 0-1.46-1.46 0-41.09c0-7.31-2.87-12.98-11.69-13.18-4.54-.12-9.73 0-15.28 .22l-.83 .85 0 53.18-1.46 1.46-17.56 0-1.46-1.46 0-70.19 1.46-1.47 39.51 0c15.35 0 27.8 12.44 27.79 27.79l0 43.89-1.46 1.46z" fill="#014847"/><path d="M71.68 138.26l-70.21 0-1.47-1.46 0-17.6 1.47-1.46 70.21 0 1.46 1.46 0 17.6zm182.85 0l-70.21 0-1.46-1.46 0-17.6 1.46-1.46 70.21 0 1.47 1.46 0 17.6zm-136.65-68.76l0-52.66 1.46-1.47 17.6 0 1.46 1.47 0 52.66-1.46 1.46-17.6 0zm0 169.66l0-52.66 1.46-1.46 17.6 0 1.46 1.46 0 52.66-1.46 1.47-17.6 0z" fill="#05bdba"/>'],
  notion: [267.47, 267.47, '<path d="M21.83 11.54l147.99-10.93c18.18-1.56 22.85-.51 34.28 7.8l47.25 33.28c7.79 5.72 10.39 7.28 10.38 13.52l0 182.52c0 11.44-4.16 18.2-18.69 19.24l-171.87 10.41c-10.91 .52-16.11-1.04-21.82-8.33l-34.79-45.24c-6.24-8.33-8.83-14.56-8.83-21.84l0-162.24c0-9.35 4.16-17.15 16.1-18.19z" fill="#ffffff"/><path d="M169.82 .61l-147.99 10.93c-11.94 1.03-16.09 8.84-16.1 18.19l0 162.24c0 7.28 2.58 13.52 8.83 21.84l34.79 45.24c5.71 7.28 10.91 8.84 21.82 8.33l171.87-10.41c14.53-1.03 18.7-7.8 18.69-19.24l0-182.52c0-5.91-2.34-7.61-9.21-12.66l-1.18-.86-47.24-33.28c-11.43-8.31-16.1-9.36-34.28-7.8zm-94.76 51.61c-14.03 .95-17.22 1.16-25.18-5.32l-20.27-16.12c-2.06-2.09-1.03-4.69 4.16-5.21l142.28-10.39c11.95-1.04 18.17 3.12 22.84 6.75l24.4 17.68c1.04 .53 3.64 3.64 .52 3.64l-146.93 8.84-1.82 .13zm-16.36 183.95l0-154.95c0-6.77 2.08-9.89 8.3-10.41l168.75-9.88c5.72-.52 8.31 3.12 8.31 9.88l0 153.92c0 6.77-1.04 12.49-10.38 13l-161.49 9.36c-9.34 .52-13.49-2.59-13.49-10.92zm159.41-146.64c1.03 4.68 0 9.36-4.68 9.9l-7.78 1.54 0 114.4c-6.76 3.64-12.98 5.71-18.18 5.72-8.31 0-10.39-2.6-16.61-10.4l-50.9-80.08 0 77.48 16.1 3.64c0 0 0 9.36-12.99 9.37l-35.81 2.07c-1.04-2.09 0-7.28 3.63-8.31l9.35-2.6 0-102.44-12.98-1.05c-1.04-4.68 1.55-11.44 8.82-11.96l38.43-2.59 52.96 81.11 0-71.76-13.5-1.55c-1.04-5.73 3.11-9.9 8.3-10.4l35.84-2.09z"/>'],
  paypal: [45, 45, '<path d="M35.68 10.35c0 5.57-5.14 12.15-12.93 12.15l-7.5 0-.37 2.32-1.75 11.18-9.32 0 5.61-36 15.1 0c5.08 0 9.08 2.83 10.56 6.77 .43 1.15 .63 2.36 .6 3.58z" fill="#002991"/><path d="M41.05 20.7c-1.03 6.24-6.43 10.82-12.75 10.8l-5.21 0-2.17 13.5-9.27 0 1.48-9 1.75-11.18 .37-2.32 7.5 0c7.77 0 12.93-6.58 12.93-12.15 3.83 1.97 6.06 5.96 5.37 10.35z" fill="#60cdff"/><path d="M35.68 10.35c-1.6-.84-3.55-1.35-5.67-1.35l-12.64 0-2.12 13.5 7.5 0c7.77 0 12.93-6.58 12.93-12.15z" fill="#008cff"/>'],
  peek: [48, 48, '<path d="M10.56 0H37.44A10.56 10.56 0 0 1 48 10.56V37.44A10.56 10.56 0 0 1 37.44 48H10.56A10.56 10.56 0 0 1 0 37.44V10.56A10.56 10.56 0 0 1 10.56 0Z" fill="#fff200"/><path d="M36.48 29.71L36.48 37.55 37.07 37.55 37.65 37.55 37.65 29.71 37.65 21.87 37.07 21.87 36.48 21.87 36.48 29.71Z" fill="#231f20"/><path d="M8.67 27.47C7.85 27.65 7.06 28.06 6.38 28.67L5.87 29.14 5.87 28.38 5.87 27.63 5.28 27.63 4.69 27.63 4.69 35.79 4.69 43.95 5.28 43.95 5.87 43.95 5.87 39.83 5.87 35.71 6.43 36.22C9.11 38.65 13.4 37.53 14.62 34.07 14.96 33.16 14.96 31.77 14.62 30.8 14.19 29.52 13.23 28.44 12 27.84 10.91 27.32 9.88 27.21 8.67 27.47ZM11.09 28.77C12.08 29.12 12.79 29.76 13.3 30.76 13.52 31.18 13.59 31.51 13.63 32.18 13.69 33.23 13.49 33.95 12.95 34.69 11.58 36.58 8.92 36.86 7.22 35.31 5.58 33.8 5.46 31.45 6.94 29.81 8.02 28.64 9.6 28.25 11.09 28.77Z" fill="#231f20"/><path d="M19.23 27.47C18.3 27.67 17.56 28.1 16.77 28.88 15.61 30.02 15.07 31.63 15.34 33.2 15.7 35.39 17.36 37.06 19.54 37.45 21.61 37.82 23.89 36.68 24.84 34.8L25.17 34.13 24.5 34.13C23.88 34.13 23.81 34.16 23.7 34.4 23.49 34.87 22.74 35.57 22.17 35.87 20.56 36.68 18.72 36.35 17.5 35.04 17.05 34.54 16.53 33.55 16.53 33.17 16.53 33.11 18.26 33.06 20.99 33.05L25.44 33.01 25.42 32.21C25.36 29.87 23.63 27.85 21.29 27.42 20.49 27.28 20.06 27.29 19.23 27.47ZM21.59 28.77C22.81 29.13 23.85 30.25 24.15 31.49L24.21 31.79 20.37 31.79C17.98 31.79 16.53 31.74 16.53 31.68 16.53 31.31 17.05 30.33 17.5 29.81 18.57 28.65 20.01 28.28 21.59 28.77Z" fill="#231f20"/><path d="M29.79 27.47C27.04 28.09 25.27 30.96 25.97 33.65 26.73 36.57 29.75 38.2 32.57 37.24 33.4 36.95 34.29 36.33 34.8 35.69 35.22 35.16 35.63 34.44 35.63 34.24 35.63 34.18 35.37 34.13 35.02 34.14 34.4 34.14 34.4 34.14 34.08 34.65 33.16 36.06 31.18 36.68 29.53 36.05 28.7 35.74 27.84 34.94 27.42 34.11 26.85 32.97 26.45 33.07 31.52 33.07 35.48 33.07 35.96 33.05 36.02 32.9 36.05 32.8 36.03 32.34 35.96 31.86 35.82 30.88 35.39 29.86 34.83 29.16 33.66 27.76 31.6 27.05 29.79 27.47ZM31.73 28.64C32.34 28.74 33.32 29.29 33.77 29.79 34.12 30.18 34.54 30.96 34.72 31.54L34.78 31.79 30.93 31.79 27.07 31.79 27.15 31.44C27.44 30.11 28.83 28.83 30.26 28.59 30.77 28.5 30.91 28.51 31.73 28.64Z" fill="#231f20"/><path d="M40.27 30.02L37.81 32.41 40.37 34.98 42.93 37.55 43.79 37.55 44.64 37.55 42.08 34.99 39.52 32.43 41.92 30.03 44.32 27.63 43.52 27.63 42.72 27.63 40.27 30.02Z" fill="#231f20"/>'],
  pipedream: [600, 600, '<path d="M33 0l534 0c18.23 0 33 14.77 33 33l0 534c0 18.23-14.77 33-33 33l-534 0c-18.23 0-33-14.77-33-33l0-534c0-18.23 14.77-33 33-33z" fill="#34d28b"/><path d="M456.47 259.35c0 29.7-3.16 55.52-9.47 77.42-6.33 21.9-15.14 40.1-26.46 54.58-11.32 14.48-25.07 25.24-41.22 32.31-16.16 7.06-34.08 10.58-53.76 10.58-14.39 .11-28.73-1.76-42.61-5.57-13.17-3.72-25.17-10.96-35.93-21.72l-1.68 .56 1.12 45.11 0 61.83-87.46 0 0-421.09 60.72-3.9 16.71 29.52c12.05-10.87 26.03-19.37 41.22-25.06 16.02-6.02 33.02-9.04 50.14-8.92 20.79 0 39.17 3.06 55.15 9.19 15.95 6.13 29.42 15.95 40.39 29.53 10.96 13.55 19.22 31.47 24.79 53.75 5.57 22.28 8.36 49.57 8.35 81.87zm-89.69-.56c0-19.32-1.22-35.27-3.62-47.9-2.4-12.63-6.13-22.56-11.14-29.8-4.69-7-11.54-12.27-19.49-15.04-9.08-2.95-18.59-4.37-28.14-4.18-11.64-.22-23.18 2.26-33.7 7.24-9.85 4.81-17.93 11.52-24.23 20.05l0 144.82c5.19 8.18 12.43 15.04 21.72 20.61 9.29 5.57 20.79 8.35 34.54 8.36 8.9 .12 17.76-1.29 26.18-4.18 7.8-2.79 14.48-7.98 20.06-15.6 5.57-7.6 9.93-18.2 13.09-31.75 3.16-13.54 4.74-31.09 4.74-52.63z" fill="#ffffff" fill-rule="evenodd"/>'],
  pocketcasts: [48, 48, '<path d="M24 0C10.74 0 0 10.74 0 24 0 37.26 10.74 48 24 48 37.26 48 48 37.26 48 24 48 10.74 37.26 0 24 0ZM31.13 24C31.13 20.06 27.94 16.87 24 16.87 20.06 16.87 16.87 20.06 16.87 24 16.87 27.94 20.06 31.13 24 31.13V35.2C17.81 35.2 12.8 30.19 12.8 24 12.8 17.81 17.81 12.8 24 12.8 30.19 12.8 35.2 17.81 35.2 24H31.13ZM38 24C38 16.27 31.73 10 24 10 16.27 10 10 16.27 10 24 10 31.73 16.27 38 24 38V42.67C13.69 42.67 5.33 34.31 5.33 24 5.33 13.69 13.69 5.33 24 5.33 34.31 5.33 42.67 13.69 42.67 24H38Z" fill="#f43e37"/>'],
  posthog: [47.985, 47.985, '<path d="M10.89 25.5c-.17 .34-.52 .55-.89 .55-.38 0-.72-.21-.89-.55l-.88-1.76c-.14-.28-.14-.61 0-.89l.88-1.76c.17-.34 .52-.55 .89-.55 .38 0 .72 .21 .89 .55l.88 1.76c.14 .28 .14 .61 0 .89l-.88 1.76zm0 10c-.17 .34-.52 .55-.89 .55-.38 0-.72-.21-.89-.55l-.88-1.76c-.14-.28-.14-.61 0-.89l.88-1.76c.17-.34 .52-.55 .89-.55 .38 0 .72 .21 .89 .55l.88 1.76c.14 .28 .14 .61 0 .89l-.88 1.76z" fill="#1d4aff"/><path d="M0 31.7c0-.89 1.08-1.34 1.71-.71l4.58 4.58c.63 .63 .18 1.71-.71 1.71l-4.58 0c-.55 0-1-.45-1-1l0-4.58zm0-4.83c0 .27 .11 .52 .29 .71l9.41 9.41c.19 .19 .44 .29 .71 .29l5.17 0c.89 0 1.34-1.08 .71-1.71l-14.58-14.58c-.63-.63-1.71-.18-1.71 .71l0 5.17zm0-10c0 .27 .11 .52 .29 .71l19.41 19.41c.19 .19 .44 .29 .71 .29l5.17 0c.89 0 1.34-1.08 .71-1.71l-24.58-24.58c-.63-.63-1.71-.18-1.71 .71l0 5.17zm10 0c0 .27 .11 .52 .29 .71l17.99 18c.63 .63 1.71 .18 1.71-.71l0-5.17c0-.26-.1-.52-.29-.71l-17.99-17.99c-.63-.63-1.71-.18-1.71 .71l0 5.17zm11.7-5.88c-.63-.63-1.71-.18-1.71 .71l0 5.17c0 .27 .11 .52 .29 .71l8 8c.63 .63 1.71 .18 1.71-.71l0-5.17c0-.26-.1-.52-.29-.71l-8-8z" fill="#f9bd2b"/><path d="M42.53 31.82l-9.41-9.41c-.63-.63-1.71-.18-1.71 .71l0 13.17c0 .55 .45 1 1 1l14.58 0c.55 0 1-.45 1-1l0-1.2c0-.55-.45-.99-1-1.06-1.69-.22-3.26-.99-4.46-2.2zm-6.32 2.26c-.88 0-1.6-.72-1.6-1.6 0-.88 .72-1.6 1.6-1.6 .88 0 1.6 .72 1.6 1.6 0 .88-.72 1.6-1.6 1.6z"/><path d="M0 36.28c0 .55 .45 1 1 1l4.58 0c.89 0 1.34-1.08 .71-1.71l-4.58-4.58c-.63-.63-1.71-.18-1.71 .71l0 4.58zm10-16.99l-8.29-8.29c-.63-.63-1.71-.18-1.71 .71l0 5.17c0 .27 .11 .52 .29 .71l9.7 9.71 0-8zm-8.29 1.71c-.63-.63-1.71-.18-1.71 .71l0 5.17c0 .27 .11 .52 .29 .71l9.7 9.71 0-8-8.29-8.29z" fill="#1d4aff"/><path d="M19.99 19.7c0-.26-.1-.52-.29-.71l-8-8c-.63-.63-1.71-.18-1.71 .71l0 5.17c0 .27 .11 .52 .29 .71l9.7 9.71 0-7.58zm-10 17.58l5.58 0c.89 0 1.34-1.08 .71-1.71l-6.29-6.29 0 8zm0-17.99l0 7.58c0 .27 .11 .52 .29 .71l9.7 9.7 0-7.58c0-.26-.1-.52-.29-.71l-9.7-9.7z" fill="#f54e00"/>'],
  postman: [256, 256, '<path d="M254.95 144.25c8.96-70.13-40.57-134.25-110.57-143.2-70-8.96-134.38 40.57-143.33 110.57-8.96 70 40.57 134.25 110.57 143.33 70.13 8.96 134.25-40.57 143.33-110.7z" fill="#ff6c37"/><path d="M174.2 82.18l-54.01 54.01-15.23-15.23c53.11-53.11 58.36-48.5 69.24-38.78z" fill="#ffffff"/><path d="M120.19 137.47c-.38 0-.64-.13-.89-.38l-15.36-15.23c-.25-.23-.38-.56-.38-.9 0-.34 .14-.66 .38-.89 54.01-54.01 59.64-48.89 71.03-38.65 .26 .26 .38 .51 .38 .89 0 .38-.13 .64-.38 .9l-54.01 53.88c-.13 .26-.51 .38-.77 .38zm-13.43-16.51l13.43 13.44 52.09-52.09c-9.47-8.45-15.87-11.01-65.52 38.65z" fill="#ff6c37"/><path d="M135.68 151.68l-14.72-14.72 54.01-54.01c14.46 14.59-7.17 38.27-39.29 68.73z" fill="#ffffff"/><path d="M135.68 152.96c-.38 0-.64-.13-.9-.39l-14.72-14.72c-.26-.26-.26-.51-.25-.89 0-.38 .13-.64 .38-.9l54.01-54c.23-.24 .56-.38 .9-.39 .34 0 .66 .14 .89 .39 3.31 3.06 5.13 7.4 4.99 11.9-.26 14.21-16.38 32.25-44.28 58.61-.38 .26-.77 .38-1.02 .39zm-12.93-16c8.19 8.32 11.65 11.65 12.93 12.92 21.5-20.48 42.36-41.46 42.49-55.92 .13-3.33-1.15-6.66-3.33-9.22l-52.09 52.22z" fill="#ff6c37"/><path d="M105.22 121.35l10.88 10.87c.26 .26 .26 .51 0 .77-.13 .13-.13 .13-.26 .13l-22.52 4.86c-1.15 .13-2.18-.64-2.43-1.79-.13-.64 .13-1.28 .51-1.66l13.05-13.06c.26-.26 .64-.38 .77-.12z" fill="#ffffff"/><path d="M92.93 139.26c-1.92 0-3.33-1.54-3.32-3.45 0-.9 .38-1.79 1.02-2.43l13.05-13.06c.77-.64 1.79-.64 2.56 0l10.88 10.88c.77 .64 .77 1.79 0 2.56-.26 .26-.51 .38-.89 .51l-22.53 4.86c-.26 0-.51 .13-.77 .13zm11.91-16.51l-12.55 12.55c-.26 .26-.38 .64-.12 1.02 .13 .38 .51 .51 .89 .38l21.12-4.6-9.34-9.35z" fill="#ff6c37"/><path d="M202.74 52.24c-8.19-7.94-21.37-7.68-29.31 .64-7.93 8.32-7.68 21.37 .64 29.3 6.75 6.52 17.05 7.68 25.08 2.82l-14.59-14.59 18.18-18.17z" fill="#ffffff"/><path d="M188.4 89.22c-12.16 0-22.01-9.85-22.01-22.01 0-12.16 9.85-22.01 22.01-22.01 5.63 0 11.13 2.18 15.23 6.14 .25 .26 .38 .51 .39 .9 0 .38-.13 .64-.39 .89l-17.27 17.28 13.56 13.57c.51 .51 .51 1.28 0 1.79l-.25 .25c-3.33 2.05-7.3 3.2-11.27 3.2zm0-41.33c-10.75 0-19.45 8.7-19.32 19.45 0 10.75 8.7 19.45 19.45 19.32 2.94 0 5.89-.64 8.58-2.04l-13.44-13.31c-.26-.26-.38-.51-.38-.9 0-.38 .13-.64 .38-.89l17.15-17.15c-3.46-2.94-7.81-4.48-12.42-4.48z" fill="#ff6c37"/><path d="M203.12 52.62l-.25-.25-18.3 18.04 14.46 14.46c1.41-.9 2.82-1.92 3.96-3.07 3.92-3.84 6.13-9.08 6.16-14.56 .02-5.48-2.15-10.75-6.03-14.62z" fill="#ffffff"/><path d="M199.15 86.28c-.38 0-.64-.13-.89-.38l-14.59-14.59c-.26-.26-.38-.51-.38-.9 0-.38 .13-.64 .38-.89l18.17-18.18c.23-.24 .56-.38 .9-.38 .34 0 .66 .14 .89 .38l.39 .26c8.57 8.57 8.57 22.4 .13 31.1-1.28 1.28-2.69 2.43-4.23 3.32-.38 .13-.64 .26-.77 .26zm-12.79-15.87l12.92 12.93c1.02-.64 2.05-1.54 2.82-2.31 7.29-7.29 7.68-19.2 .64-26.87l-16.38 16.25z" fill="#ff6c37"/><path d="M176.38 84.49c-3.08-3.07-8.06-3.07-11.14 0l-48.25 48.25 8.07 8.06 51.06-44.79c3.33-2.82 3.58-7.81 .77-11.14-.26-.13-.38-.26-.51-.38z" fill="#ffffff"/><path d="M124.93 142.08c-.38 0-.64-.13-.9-.39l-8.06-8.06c-.25-.23-.38-.56-.38-.89 0-.34 .14-.66 .38-.9l48.25-48.25c1.71-1.72 4.04-2.69 6.46-2.69 2.43 0 4.75 .97 6.46 2.69 1.72 1.71 2.69 4.04 2.69 6.47 0 2.43-.97 4.75-2.69 6.46l-.38 .38-51.06 44.79c-.13 .26-.38 .38-.77 .39zm-6.14-9.34l6.27 6.27 50.16-44.03c2.82-2.3 3.07-6.53 .77-9.34-2.3-2.82-6.53-3.07-9.34-.77-.13 .13-.26 .26-.51 .39l-47.35 47.48z" fill="#ff6c37"/><path d="M80.01 187.64c-.51 .26-.77 .77-.64 1.28l2.17 9.21c.51 1.28-.26 2.82-1.66 3.2-1.02 .38-2.18 0-2.82-.77l-14.07-13.95 45.94-45.94 15.87 .26 10.75 10.75c-2.56 2.18-18.04 17.15-55.54 35.96z" fill="#ffffff"/><path d="M78.98 202.61c-1.02 0-2.05-.38-2.68-1.15l-13.95-13.95c-.25-.26-.38-.51-.39-.9 0-.38 .13-.64 .39-.89l45.94-45.95c.26-.26 .64-.38 .9-.38l15.87 .26c.38 0 .64 .13 .89 .38l10.75 10.75c.26 .26 .38 .64 .39 1.02 0 .38-.13 .64-.52 .9l-.89 .77c-13.57 11.9-32 23.8-54.9 35.19l2.17 9.09c.38 1.66-.38 3.46-1.92 4.35-.77 .38-1.41 .51-2.05 .51zm-14.07-16l13.18 13.06c.38 .64 1.15 .9 1.79 .51 .64-.38 .9-1.15 .51-1.79l-2.17-9.22c-.26-1.15 .26-2.18 1.28-2.68 22.65-11.39 40.95-23.16 54.39-34.81l-9.47-9.47-14.72-.26-44.79 44.66z" fill="#ff6c37"/><path d="M52.11 197.62l11.01-11.01 16.38 16.38-26.11-1.79c-1.15-.13-1.92-1.15-1.79-2.3 0-.51 .13-1.02 .51-1.28z" fill="#ffffff"/><path d="M79.5 204.15l-26.24-1.79c-1.92-.13-3.2-1.79-3.07-3.72 .13-.77 .38-1.53 1.02-2.04l11.01-11.01c.23-.25 .56-.38 .9-.38 .34 0 .66 .14 .89 .38l16.38 16.38c.39 .39 .51 .9 .26 1.41-.26 .51-.64 .77-1.15 .77zm-16.38-15.74l-10.11 10.11c-.38 .26-.38 .9 0 1.15 .13 .13 .26 .26 .51 .25l22.65 1.54-13.05-13.05zm41.33-41.85c-.77 0-1.28-.64-1.28-1.28 0-.38 .13-.64 .39-.9l12.41-12.41c.23-.25 .56-.38 .9-.39 .34 0 .66 .14 .89 .39l8.06 8.06c.38 .38 .51 .77 .39 1.28-.13 .38-.51 .77-1.03 .9l-20.47 4.35-.26 0zm12.42-11.9l-8.45 8.44 13.82-2.94-5.37-5.5z" fill="#ff6c37"/><path d="M124.8 140.93l-14.08 3.07c-1.02 .26-2.05-.38-2.3-1.41-.13-.64 0-1.28 .51-1.79l7.81-7.81 8.06 7.94z" fill="#ffffff"/><path d="M110.47 145.28c-.85 .01-1.67-.33-2.28-.93-.6-.6-.94-1.42-.92-2.27 0-.9 .39-1.66 .89-2.31l7.81-7.8c.23-.25 .56-.38 .9-.39 .34 0 .66 .14 .89 .39l8.06 8.06c.38 .38 .51 .77 .39 1.28-.13 .38-.51 .77-1.03 .9l-14.07 3.07-.64 0zm6.4-10.62l-6.91 6.91c-.26 .26-.26 .51-.13 .76 .13 .26 .38 .38 .76 .39l11.78-2.56-5.5-5.5zm86.38-69.75c-.26-.77-1.15-1.15-1.92-.9-.77 .25-1.15 1.15-.9 1.92 0 .13 .13 .25 .13 .39 .77 1.54 .51 3.45-.51 4.86-.51 .64-.38 1.54 .13 2.05 .64 .51 1.54 .38 2.05-.26 1.92-2.43 2.3-5.5 1.02-8.06z" fill="#ff6c37"/>'],
  prisma: [309.14, 309.14, '<path d="M280.88 235.52l-106.31-225.77c-2.69-5.66-8.27-9.39-14.53-9.71-6.27-.42-12.26 2.68-15.53 8.05l-115.31 186.76c-3.58 5.76-3.5 13.07 .2 18.75l56.37 87.3c4.38 6.73 12.67 9.78 20.36 7.49l163.6-48.4c4.98-1.46 9.09-5 11.26-9.72 2.14-4.7 2.1-10.09-.1-14.76l-.01 .01zm-23.8 9.68l-138.82 41.05c-4.24 1.26-8.3-2.41-7.42-6.68l49.6-237.49c.93-4.44 7.06-5.15 9-1.03l91.81 194.97c.82 1.76 .83 3.79 .03 5.56-.8 1.77-2.34 3.09-4.21 3.62l.01 0z"/>'],
  raindrop: [48, 48, '<defs><clipPath id="%ID%0"><path d="M12 19.58A12 12 0 0 1 24 31.58V43.58H12A12 12 0 0 1 12 19.58Z"/></clipPath><clipPath id="%ID%1"><path d="M24 43.58V31.58L24.01 31.24A12 12 0 1 1 36 43.58H24Z"/></clipPath></defs><path d="M35.61 10.36C42.02 16.59 42.02 26.69 35.61 32.92 35.4 33.13 35.18 33.33 34.96 33.53L24 43.58 13.05 33.53C12.82 33.33 12.6 33.13 12.39 32.92 5.98 26.69 5.98 16.59 12.39 10.36 18.8 4.13 29.2 4.13 35.61 10.36Z" fill="#0b7ed0"/><path d="M12 19.58A12 12 0 0 1 24 31.58V43.58H12A12 12 0 0 1 12 19.58Z" fill="#2cd4ed"/><g clip-path="url(#%ID%0)"><path d="M35.61 10.36C42.02 16.59 42.02 26.69 35.61 32.92 35.4 33.13 35.18 33.33 34.96 33.53L24 43.58 13.05 33.53C12.82 33.33 12.6 33.13 12.39 32.92 5.98 26.69 5.98 16.59 12.39 10.36 18.8 4.13 29.2 4.13 35.61 10.36Z" fill="#0db4e2"/></g><path d="M24 43.58V31.58L24.01 31.24A12 12 0 1 1 36 43.58H24Z" fill="#3169ff"/><g clip-path="url(#%ID%1)"><path d="M35.61 10.36C42.02 16.59 42.02 26.69 35.61 32.92 35.4 33.13 35.18 33.33 34.96 33.53L24 43.58 13.05 33.53C12.82 33.33 12.6 33.13 12.39 32.92 5.98 26.69 5.98 16.59 12.39 10.36 18.8 4.13 29.2 4.13 35.61 10.36Z" fill="#3153ff"/></g>'],
  readwise: [48, 48, '<path d="M.97 47.03V.97H47.03V47.03H.97Z" fill="none" stroke="#000000" stroke-width="1.94"/><path d="M34.77 34.35C35.79 36.04 36.61 36.6 38.3 36.8V38.48H29.97L22.17 25.46H20.22V33.99C20.22 36.28 20.78 36.6 23.18 36.8V38.48H10.61V36.8C13.01 36.6 13.58 36.28 13.58 33.99V14.93C13.58 12.6 13.09 12.32 10.61 12.12V10.44H23.55C31.36 10.44 35.43 12.08 35.43 17.85 35.43 22.21 33.31 24.3 29.03 25.02L34.77 34.35ZM21.34 13.17C20.67 13.17 20.22 13.65 20.22 14.37V22.74H23.45C26.79 22.74 28.77 21.54 28.77 17.85 28.77 14.13 26.79 13.17 23.56 13.17H21.34Z"/><path d="M30.09 11.44H17.96V23.03H30.09V11.44Z"/><path d="M28.57 13.44C27.9 14.66 28.93 20.4 28.93 20.4 28.94 20.7 28.74 20.96 28.44 21.03 28.44 21.03 22.18 21.06 20.12 22.77" fill="#f4f9f9"/>'],
  sentry: [256, 256, '<path d="M148.37 26.72c-4.33-7.19-12.11-11.58-20.5-11.58-8.39 0-16.17 4.39-20.51 11.58l-33.72 57.76c52.43 26.17 87.05 78.18 90.97 136.65l-23.67 0c-3.92-50.11-34.06-94.41-79.24-116.45l-31.22 53.97c25.36 11.38 43.19 34.88 47.31 62.37l-54.38 0c-1.31-.09-2.49-.84-3.12-1.98-.64-1.15-.66-2.54-.06-3.71l15.07-25.62c-5.11-4.26-10.94-7.56-17.22-9.74l-14.91 25.63c-3.14 5.38-3.99 11.79-2.36 17.8 1.63 6.01 5.6 11.12 11.02 14.18 3.54 1.99 7.52 3.05 11.58 3.07l74.47 0c2.81-34.71-12.74-68.37-41-88.72l11.84-20.5c35.68 24.5 55.75 66.04 52.79 109.22l63.09 0c2.99-65.43-29.05-127.51-84.1-162.98l23.93-41c1.11-1.86 3.51-2.48 5.38-1.39 2.72 1.49 103.99 178.21 105.89 180.26 .68 1.22 .66 2.71-.06 3.91-.72 1.2-2.03 1.92-3.42 1.88l-24.4 0c.31 6.53 .31 13.04 0 19.53l24.5 0c6.28 .04 12.32-2.43 16.77-6.87 4.45-4.44 6.94-10.47 6.91-16.76 0-4.11-1.09-8.14-3.18-11.69l-104.45-178.82z" fill="#362d59"/>'],
  square: [994.6, 994.6, '<path d="M828.4 0l-662.2 0c-91.8 0-166.2 74.4-166.2 166.2l0 662.2c0 91.8 74.4 166.2 166.2 166.2l662.2 0c91.8 0 166.2-74.4 166.2-166.2l0-662.2c0-91.8-74.4-166.2-166.2-166.2zm-14.6 761.3c0 29-23.5 52.5-52.5 52.5l-528 0c-29 0-52.5-23.5-52.5-52.5l0-528c0-29 23.5-52.5 52.5-52.5l528 0c29 0 52.5 23.5 52.5 52.5l0 528zm-422-129c-16.7 0-30.1-13.5-30.1-30.2l0-210.8c0-16.7 13.4-30.3 30.1-30.3l211.1 0c16.6 0 30.1 13.5 30.1 30.3l0 210.7c0 16.7-13.5 30.2-30.1 30.2l-211.1 0z" fill="#1a1a1a"/>'],
  stripe: [272, 272, '<path d="M0 272l272-57.68 0-214.32-272 58.36z" fill="#533afd" fill-rule="evenodd"/>'],
  supabase: [111.932, 111.932, '<defs><linearGradient id="%ID%0" gradientUnits="userSpaceOnUse" x1="55.43" y1="54.76" x2="95.62" y2="71.62"><stop offset="0" stop-color="#249361"/><stop offset="1" stop-color="#3ecf8e"/></linearGradient><linearGradient id="%ID%1" gradientUnits="userSpaceOnUse" x1="37.61" y1="30.37" x2="55.94" y2="64.87"><stop offset="0" stop-color="#000000"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></linearGradient></defs><path d="M65.16 110.07c-2.86 3.6-8.66 1.63-8.73-2.97l-1.01-67.25 45.22 0c8.19 0 12.76 9.46 7.67 15.87l-43.15 54.35z" fill="url(#%ID%0)"/><path d="M65.16 110.07c-2.86 3.6-8.66 1.63-8.73-2.97l-1.01-67.25 45.22 0c8.19 0 12.76 9.46 7.67 15.87l-43.15 54.35z" fill="url(#%ID%1)" fill-opacity="0.2"/><path d="M46.77 1.86c2.86-3.6 8.66-1.63 8.73 2.97l.44 67.25-44.65 0c-8.19 0-12.76-9.46-7.66-15.87l43.15-54.35z" fill="#3ecf8e"/>'],
  tavily: [55, 55, '<path d="M38.81 0c5.67 0 8.5 0 10.67 1.1 1.9 .97 3.45 2.52 4.42 4.42 1.1 2.17 1.1 5 1.1 10.67l0 22.62c0 5.67 0 8.5-1.1 10.67-.97 1.9-2.52 3.45-4.42 4.42-2.16 1.1-5 1.1-10.67 1.1l-22.62 0c-5.67 0-8.5 0-10.67-1.1-1.9-.97-3.45-2.52-4.42-4.42-1.1-2.16-1.1-5-1.1-10.67l0-22.62c0-5.67 0-8.5 1.1-10.67 .97-1.9 2.52-3.45 4.42-4.42 2.17-1.1 5-1.1 10.67-1.1l22.62 0z" fill="#1f1e1e"/><path d="M23.39 30.41c-.3 0-.59 .06-.87 .17-.28 .11-.52 .28-.73 .49l-4.33 4.35-1.15-1.15c-.85-.85-2.29-.43-2.56 .74l-1.64 7.3c-.06 .25-.05 .51 .02 .76 .07 .25 .2 .47 .38 .65l0 0c.18 .18 .41 .32 .65 .39 .25 .07 .51 .08 .76 .02l7.27-1.65c1.17-.26 1.59-1.72 .74-2.57l-1.15-1.15 4.33-4.35c.43-.43 .66-1.01 .66-1.61 0-.6-.24-1.18-.66-1.61l-.06-.06 0 0-.06-.06c-.21-.21-.46-.38-.74-.49-.28-.11-.57-.17-.87-.17zm15.62-2.74c-1.01-.64-2.33 .09-2.33 1.29l0 1.63-9.28 0c.31 .6 .49 1.27 .49 1.99 0 1.04-.37 1.99-.98 2.73l9.77 0 0 1.63c0 1.2 1.32 1.93 2.33 1.29l6.3-3.99c.47-.3 .71-.8 .71-1.29 0-.49-.24-.99-.71-1.29l-6.3-3.99zm-15.39-17.44c-.26 0-.51 .06-.73 .19-.22 .12-.41 .31-.55 .52l-3.98 6.32 0 0c-.64 1.01 .09 2.34 1.29 2.34l1.63 0 0 9.39c.68-.45 1.48-.71 2.35-.71 .87 0 1.68 .26 2.35 .71l0-9.39 1.63 0c1.2 0 1.92-1.32 1.29-2.34l-3.98-6.32c-.3-.47-.79-.71-1.28-.71z" fill="#fffcf6"/>'],
  ticktick: [48, 48, '<path d="M16.77 18.16L12.77 23.03 22.25 30.81C22.82 31.27 23.53 31.52 24.26 31.52 24.36 31.52 24.47 31.52 24.58 31.51 25.42 31.42 26.19 31 26.72 30.34L43.72 9.11 38.8 5.17 23.79 23.91 16.77 18.16Z" fill="#ffb000" fill-rule="evenodd"/><path d="M24 42.6C13.74 42.6 5.4 34.26 5.4 24 5.4 13.74 13.74 5.4 24 5.4L24 0C10.77 0 0 10.77 0 24 0 37.23 10.77 48 24 48 37.23 48 48 37.23 48 24L42.6 24C42.6 34.26 34.26 42.6 24 42.6Z" fill="#4772fa" fill-rule="evenodd"/>'],
  todoist: [151.6, 151.6, '<path d="M19.1 .15c-10.4 0-18.9 8.5-18.9 18.9l0 113.5c0 10.4 8.5 18.9 18.9 18.9l113.6 0c10.4 0 18.9-8.5 18.9-18.9l0-113.4c0-10.4-8.5-18.9-18.9-18.9l-113.6 0z" fill="#e44332"/><path d="M32.3 71.85l60.8-35.4c1.3-.8 1.4-3.1-.1-3.9-1.5-.8-4.2-2.4-5.3-3-1.5-.8-3.2-.8-4.7 .1-.7 .4-49.3 28.7-51 29.6-1.9 1.1-4.4 1.1-6.3 0l-25.7-15.1 0 12.8c6.2 3.7 21.8 12.8 25.6 15 2.3 1.2 4.5 1.2 6.7-.1m0 24.2l60.8-35.4c1.3-.8 1.4-3.1-.1-3.9-1.5-.8-4.2-2.4-5.3-3-1.5-.8-3.2-.8-4.7 .1-.7 .4-49.3 28.7-51 29.6-1.9 1.1-4.4 1.1-6.3 0l-25.7-15.1 0 12.8c6.2 3.7 21.8 12.8 25.6 15 2.3 1.2 4.5 1.2 6.7-.1m0 25.8l60.8-35.4c1.3-.8 1.4-3.1-.1-3.9-1.5-.8-4.2-2.4-5.3-3-1.5-.8-3.2-.8-4.7 .1-.7 .4-49.3 28.7-51 29.6-1.9 1.1-4.4 1.1-6.3 0l-25.7-15.1 0 12.7c6.2 3.7 21.8 12.8 25.6 15 2.3 1.2 4.5 1.2 6.7 0" fill="#ffffff"/>'],
  trello: [24, 24, '<path d="M0 6c0-3.31 2.69-6 6-6l12 0c3.31 0 6 2.69 6 6l0 12c0 3.31-2.69 6-6 6l-12 0c-3.31 0-6-2.69-6-6z" fill="#1558bc"/><path d="M9.39 18.23c.53 0 .95-.42 .95-.95l0-11.9c0-.52-.42-.95-.95-.95l-4.01 0c-.52 0-.95 .43-.95 .95l0 11.91c0 .52 .42 .95 .95 .95zm9.23-5.46c.53 0 .95-.42 .95-.95l0-6.44c0-.52-.42-.95-.95-.95l-4.01 0c-.52 0-.95 .43-.95 .95l0 6.44c0 .52 .42 .95 .95 .95z" fill="#ffffff"/>'],
  trivago: [48, 48, '<path d="M15.62 .01A.51 .51 0 0 0 15.35 .09L5.66 6.37A.85 .85 0 0 0 5.27 7.08V25.65C5.27 25.93 5.5 26.16 5.78 26.16H16.14V.52C16.14 .21 15.89 0 15.62 .01Z" fill="#e32851"/><path d="M16.14 26.16L36.85 14.71A.85 .85 0 0 0 37.3 13.96V3.36C37.3 2.97 36.88 2.72 36.54 2.91L16.14 14.19Z" fill="#ff932c"/><path d="M15.65 29.42L5.79 29.42C5.5 29.42 5.27 29.66 5.28 29.95 5.64 39.98 13.89 48 24 48 34.12 48 42.36 39.98 42.72 29.95 42.73 29.66 42.5 29.42 42.21 29.42H32.34C32.08 29.42 31.86 29.63 31.84 29.89 31.52 33.94 28.13 37.13 24 37.13 19.05 37.13 17.04 32.92 17.04 32.92 16.4 31.71 16.22 30.54 16.16 29.88A.51 .51 0 0 0 15.65 29.42Z" fill="#0088d9"/>'],
  typeform: [48, 48, '<path d="M0 16.13C0 10.94 2.05 8.24 5.5 8.24 8.95 8.24 10.99 10.94 10.99 16.13V31.87C10.99 37.06 8.95 39.76 5.5 39.76 2.05 39.76 0 37.06 0 31.87V16.13ZM37.03 8.24H25.67C15.47 8.24 14.67 12.65 14.67 18.51L14.66 29.47C14.66 35.59 15.42 39.76 25.7 39.76H37.03C47.25 39.76 48 35.37 48 29.5V18.53C48 12.65 47.22 8.24 37.03 8.24Z" fill="#3c323e" fill-rule="evenodd"/>'],
  vercel: [256, 256, '<path d="M128 17.15l128 221.7-256 0z"/>'],
  webflow: [1080, 1080, '<path d="M1080 203.16l-344.61 673.68-323.69 0 144.22-279.2-6.47 0c-118.98 154.45-296.5 256.13-549.45 279.2l0-275.34c0 0 161.81-9.56 256.94-109.57l-256.94 0 0-288.77 288.77 0 0 237.51 6.48-.02 118-237.49 218.39 0 0 236.01 6.49-.01 122.43-236 319.44 0z" fill="#146ef5" fill-rule="evenodd"/>'],
  wikidata: [48, 48, '<path d="M0 38.82H1.78V9.19H0V38.82ZM3.56 38.82H8.89V9.19H3.56V38.82ZM10.67 9.19V38.82H16V9.19H10.67Z" fill="#990000"/><path d="M42.67 38.82H44.44V9.19H42.67V38.82ZM46.22 9.19V38.82H48V9.19H46.22ZM17.78 38.82H19.56V9.19H17.78V38.82ZM21.33 9.19V38.82H23.11V9.19H21.33Z" fill="#339966"/><path d="M24.89 38.82H30.22V9.19H24.89V38.82ZM32 38.82H33.78V9.19H32V38.82ZM35.56 9.19V38.82H40.89V9.19H35.56Z" fill="#006699"/>'],
  wix: [75, 75, '<path d="M75 22.98l-4.14 0c-1.15 0-2.22 .57-2.87 1.52l-5.54 8.17c-.07 .1-.18 .16-.31 .16-.12 0-.24-.06-.31-.16l-5.54-8.17c-.64-.95-1.72-1.52-2.87-1.52l-4.14 0 9.87 14.56-9.81 14.48 4.14 0c1.15 0 2.22-.57 2.87-1.52l5.49-8.09c.07-.1 .19-.16 .31-.16 .12 0 .24 .06 .31 .16l5.49 8.09c.65 .95 1.72 1.52 2.87 1.52l4.14 0-9.81-14.48zm-34.24 2.97l0 26.07 1.98 0c1.64 0 2.97-1.33 2.97-2.97l0-26.07-1.98 0c-1.64 0-2.97 1.33-2.97 2.97m-3.63-2.97l-1.76 0c-1.94 0-3.62 1.34-4.05 3.23l-3.94 17.33-3.45-16.17c-.64-2.99-3.71-5.01-6.84-4.14-2 .55-3.48 2.24-3.91 4.27l-3.41 16.02-3.93-17.31c-.43-1.89-2.11-3.23-4.05-3.23l-1.76 0 6.6 29.04 2.5 0c2.27 0 4.23-1.59 4.71-3.81l4.22-19.81c.05-.25 .27-.42 .52-.42 .25 0 .47 .18 .52 .42l4.23 19.81c.47 2.22 2.44 3.81 4.71 3.81l2.51 0z"/>'],
  wolfram: [48, 48, '<path d="M47.37 31.42L37.43 33.54 38.44 43.42 29.13 39.42 24 48 18.87 39.42 9.56 43.42 10.57 33.54 .63 31.42 7.4 24 .63 16.59 10.57 14.46 9.56 4.59 18.87 8.58 24 0 29.13 8.58 38.44 4.59 37.43 14.48 47.37 16.59 40.6 24" fill="#f16850"/><path d="M24 14.98L18.87 8.58 9.56 4.59 15.11 11.89" fill="#fd694f"/><path d="M10.57 14.46L.63 16.59 7.4 24 15.36 21.11" fill="#ff3413"/><path d="M15.11 11.89L9.56 4.59 10.57 14.46 15.36 21.11" fill="#dc1d23"/><path d="M29.13 8.58L24 0 18.87 8.58 24 14.98" fill="#ff9281"/><path d="M40.6 24L47.37 16.59 37.43 14.46 32.64 21.11" fill="#ff8b79"/><path d="M32.64 21.11L37.43 14.46 38.45 4.59 32.89 11.89" fill="#fd694f"/><path d="M32.89 11.89L38.45 4.59 29.13 8.58 24 14.98" fill="#ef5240"/><path d="M38.4 28.42L47.37 31.42 40.6 24 32.64 21.11" fill="#ff482c"/><path d="M15.36 21.11L7.4 24 .63 31.42 9.6 28.42" fill="#ec2101"/><path d="M24 38.64L24 48 29.13 39.42 29.34 31.02" fill="#d21c22"/><path d="M38.4 28.42L29.34 31.02 37.43 33.54 47.37 31.42" fill="#c90901"/><path d="M29.13 39.42L38.44 43.42 37.43 33.54 29.34 31.02" fill="#ec2101"/><path d="M9.6 28.42L.63 31.42 10.57 33.52 18.66 31.02" fill="#b6171e"/><path d="M18.66 31.02L18.87 39.42 24 48 24 38.64" fill="#b4151b"/><path d="M10.57 33.52L9.56 43.42 18.87 39.42 18.66 31.02" fill="#d21c22"/><path d="M32.64 21.11L32.89 11.89 24 14.98 24 23.95" fill="#e63320"/><path d="M24 14.98L15.11 11.89 15.36 21.11 24 23.95" fill="#ff4527"/><path d="M18.66 31.02L24 38.64 29.34 31.02 24 23.95" fill="#ff9281"/><path d="M24 23.95L29.34 31.02 38.4 28.42 32.64 21.11" fill="#fd684d"/><path d="M15.36 21.11L9.6 28.42 18.66 31.02 24 23.95" fill="#fd745c"/>'],
  wordpress: [122.527, 122.527, '<path d="M8.71 61.26c0 20.8 12.09 38.78 29.62 47.3l-25.07-68.69c-2.92 6.54-4.55 13.77-4.55 21.39z" fill="#21759b"/><path d="M96.74 58.61c0-6.49-2.33-10.99-4.33-14.49-2.66-4.33-5.16-7.99-5.16-12.32 0-4.83 3.66-9.33 8.82-9.33 .23 0 .45 .03 .68 .04-9.35-8.57-21.81-13.8-35.49-13.8-18.36 0-34.51 9.42-43.91 23.69 1.23 .04 2.4 .06 3.38 .06 5.5 0 14.01-.67 14.01-.67 2.83-.17 3.17 3.99 .34 4.33 0 0-2.85 .34-6.01 .5l19.14 56.93 11.5-34.49-8.19-22.43c-2.83-.17-5.51-.5-5.51-.5-2.83-.17-2.5-4.5 .33-4.33 0 0 8.68 .67 13.84 .67 5.5 0 14.01-.67 14.01-.67 2.84-.17 3.17 3.99 .34 4.33 0 0-2.85 .34-6.01 .5l18.99 56.49 5.24-17.52c2.27-7.27 4-12.49 4-16.99z" fill="#21759b"/><path d="M62.18 65.86l-15.77 45.82c4.71 1.38 9.69 2.14 14.85 2.14 6.12 0 11.99-1.06 17.45-2.98-.14-.22-.27-.46-.37-.72z" fill="#21759b"/><path d="M107.38 36.05c.23 1.67 .35 3.47 .35 5.4 0 5.33-1 11.33-4 18.82l-16.05 46.41c15.62-9.11 26.13-26.04 26.13-45.43 0-9.14-2.33-17.73-6.44-25.21z" fill="#21759b"/><path d="M61.26 0c-33.78 0-61.26 27.48-61.26 61.26 0 33.78 27.48 61.26 61.26 61.26 33.78 0 61.27-27.48 61.27-61.26 0-33.78-27.49-61.26-61.26-61.26zm0 119.72c-32.23 0-58.45-26.22-58.45-58.45 0-32.23 26.22-58.45 58.45-58.45 32.23 0 58.45 26.22 58.45 58.45 0 32.23-26.22 58.46-58.45 58.46z" fill="#21759b"/>'],
  zapier: [24, 24, '<path d="M4.16 0c-1.1 0-2.16 .44-2.94 1.22-.78 .78-1.22 1.84-1.21 2.94l0 15.68c0 1.1 .43 2.16 1.21 2.94 .78 .78 1.84 1.22 2.94 1.22l15.68 0c1.1 0 2.16-.43 2.95-1.22 .78-.78 1.22-1.84 1.22-2.94l0-15.68c0-1.1-.43-2.16-1.22-2.94-.78-.78-1.84-1.22-2.94-1.22l-15.68 0zm10.61 8.76l.03 0c.08 0 .16 .01 .23 .04 .08 .03 .14 .07 .2 .12 .11 .12 .16 .27 .16 .43 .01 .16-.05 .32-.16 .44-.06 .06-.13 .1-.2 .13-.07 .03-.15 .04-.23 .04-.08 0-.16-.01-.23-.04-.15-.06-.27-.18-.33-.33-.03-.07-.04-.15-.04-.23 0-.16 .06-.31 .17-.43 .11-.1 .25-.16 .41-.16zm2.85 1.57c.03 0 .06 0 .1 0 .33-.01 .65 .06 .94 .22 .24 .14 .43 .36 .55 .61 .13 .28 .19 .58 .19 .89l0 .19c0 .07 0 .15 0 .22l-2.5 0c0 .23 .08 .45 .2 .64 .16 .19 .4 .28 .65 .27 .17 .02 .34-.03 .48-.14 .11-.08 .19-.19 .23-.32l.92 .26c-.05 .2-.15 .38-.28 .54-.14 .16-.32 .28-.52 .36-.27 .1-.55 .14-.84 .14-.35 .01-.7-.07-1-.24-.29-.16-.52-.41-.66-.7-.16-.32-.24-.68-.23-1.04-.03-.51 .14-1.01 .48-1.4 .36-.32 .82-.49 1.3-.49zm-9.61 .02c.16 0 .33 .03 .48 .08 .21 .07 .4 .17 .56 .31 .26 .3 .39 .69 .37 1.09l0 2.28-.89 0-.11-.71-.06 0c-.06 .16-.15 .31-.27 .44-.1 .11-.23 .2-.37 .26-.14 .06-.3 .09-.45 .08-.31 .02-.62-.08-.87-.26-.23-.2-.35-.5-.33-.8-.01-.15 .02-.29 .08-.43 .05-.14 .14-.26 .24-.36 .3-.23 .67-.34 1.04-.3l.95 0 0-.18c.01-.16-.04-.32-.14-.45-.12-.11-.28-.17-.44-.15-.13-.01-.26 .02-.38 .09-.09 .06-.16 .15-.19 .25l-.99-.14c.04-.21 .13-.4 .26-.56 .14-.17 .32-.3 .53-.38 .26-.09 .54-.14 .82-.13 .05 0 .11-.01 .16-.01zm4.38 .01c.17 0 .35 .04 .51 .11 .18 .08 .34 .21 .46 .37 .26 .42 .38 .91 .35 1.41 .03 .51-.09 1.01-.35 1.45-.22 .34-.6 .53-1.01 .52-.2 0-.4-.04-.58-.14-.2-.1-.37-.26-.48-.46-.05-.07-.08-.15-.11-.23l-.04 0 0 1.78-1.06 0 0-4.71 .9 0 .12 .81 .06 0c.07-.21 .18-.4 .33-.56 .22-.23 .53-.35 .84-.34l.08 0 0 0zm7.56 .08l.9 0 .11 .81 .05 0c.05-.17 .13-.34 .24-.48 .08-.1 .19-.19 .31-.24 .12-.06 .26-.08 .39-.08l.23 0 0 1.05-.4 0c-.1-.02-.21-.02-.31 .01-.1 .03-.2 .08-.27 .16-.08 .07-.14 .16-.17 .26-.03 .1-.04 .21-.03 .31l0 1.88-1.05 0 0-3.67zm-17.51 0l3.26 0 0 .9-1.97 1.76 .03 .11 1.97 0 .04 .9-3.38 0 0-.9 1.93-1.75-.04-.12-1.84 0 0-.9zm11.82 0l1.06 0 0 3.66-1.05 0 0-3.66zm3.44 .68l.02 .02c-.12-.02-.24 0-.35 .05-.11 .04-.21 .11-.29 .2-.11 .16-.17 .34-.19 .52l1.55 0c-.03-.53-.26-.79-.74-.79l0 0zm-5.72 .16c-.03 0-.06 0-.08 0-.11 0-.21 .01-.31 .05-.1 .04-.19 .11-.26 .19-.15 .2-.22 .45-.2 .7l0 .06c-.01 .26 .06 .51 .2 .71 .07 .09 .15 .15 .25 .2 .1 .05 .21 .07 .31 .06 .23 .02 .45-.08 .58-.26 .14-.22 .2-.48 .19-.74 .01-.25-.05-.5-.18-.71-.12-.15-.31-.25-.5-.26zm-4.51 1.27c-.1 .01-.19 .04-.27 .1-.07 .07-.12 .17-.11 .28 0 .05 .01 .11 .03 .16 .02 .05 .05 .1 .09 .13 .11 .08 .26 .12 .4 .11l0 0c.2 .01 .4-.06 .56-.18 .14-.11 .22-.28 .21-.46l0-.14-.9 0z" fill="#ff4f00"/>']
};
var SHARED = { microsoft_learn: "microsoft", cloudflare_docs: "cloudflare" };
var logoOf = (id) => LOGOS[SHARED[id] ?? id];

// src/client/apps-page.js
var import_react30 = require("react");
var CONFIRM_MS = 4e3;
var COPIED_MS = 2e3;
var appsOf = (roster) => ({ available: false, redirect: "", ...roster?.apps, apps: Array.isArray(roster?.apps?.apps) ? roster.apps.apps : [] });
function tileOf(id, name) {
  const color = DEFAULT_COLORS[fnv1a(String(id)) % DEFAULT_COLORS.length];
  return { letter: (String(name ?? "").trim()[0] ?? "?").toUpperCase(), color };
}
function statusLine(app2) {
  if (app2.signingIn) return t("Finish signing in in your browser…");
  if (app2.enabled === false || app2.state === "off") return t("Switched off");
  if (app2.state === "connecting") return t("Connecting…");
  if (app2.state === "ready") {
    if (!(app2.tools > 0)) return t("Ready");
    return app2.lookedUp ? t("Ready · {count} tools, found by your Bots as they need them", { count: app2.tools }) : t("Ready · {count} tools", { count: app2.tools });
  }
  if (app2.state === "sign-in") return app2.error || t("Sign in to finish connecting");
  return app2.error || t("Could not connect");
}
function allowedLine(allowed2 = []) {
  if (allowed2.length === 0) return t('None. A Bot asks before it uses a tool of an app, and "Always allow" on its card puts the tool here.');
  const byApp = /* @__PURE__ */ new Map();
  for (const entry of allowed2) byApp.set(entry.app, [...byApp.get(entry.app) ?? [], entry.tool]);
  return [...byApp].map(([app2, tools]) => `${app2}: ${tools.join(", ")}`).join(" · ");
}
function searchCatalog(query = "") {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const holds = (entry) => words.every((word) => `${entry.name} ${entry.about} ${entry.category}`.toLowerCase().includes(word));
  return APP_CATEGORIES.map((category) => ({ category, entries: APP_CATALOG.filter((entry) => entry.category === category && holds(entry)) })).filter((group) => group.entries.length > 0);
}
function connectFields(entry) {
  if (entry.auth === "oauth") return { key: false, client: entry.needsClient ? "required" : "optional", button: t("Sign in with {name}", { name: entry.name }), signsIn: true };
  if (entry.auth === "bearer" || entry.auth === "header") return { key: true, client: "none", button: t("Connect"), signsIn: false };
  return { key: false, client: "none", button: t("Connect"), signsIn: false };
}
var SIGN_INS = [
  ["auto", "Find out for me", "Signs in when the app asks"],
  ["bearer", "An API key or token", "Sent as Authorization: Bearer"],
  ["header", "A key in a header of its own", "Sent in the header you name"],
  ["none", "No sign-in", "The app needs no account"]
];
function addFields(auth) {
  return { header: auth === "header", key: auth === "bearer" || auth === "header", client: auth === "auto" };
}
var LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"];
function addressProblem(address) {
  const text = String(address ?? "").trim();
  if (text === "") return "";
  let url;
  try {
    url = new URL(text);
  } catch {
    return t("Use the app's https:// address.");
  }
  const local = url.protocol === "http:" && LOCAL_HOSTS.includes(url.hostname);
  return url.protocol === "https:" || local ? "" : t("Use the app's https:// address.");
}
var filled = (value) => typeof value === "string" && value.trim() !== "" ? value.trim() : void 0;
var ownClient = ({ clientId, clientSecret }) => filled(clientId) ? { clientId: filled(clientId), ...filled(clientSecret) ? { clientSecret: filled(clientSecret) } : {} } : {};
var connectBody = (entry, form = {}) => ({
  id: entry.id,
  ...connectFields(entry).key && filled(form.key) ? { key: filled(form.key) } : {},
  ...connectFields(entry).client === "none" ? {} : ownClient(form)
});
function addBody(form) {
  const fields = addFields(form.auth);
  return {
    ...filled(form.name) ? { name: filled(form.name).slice(0, 40) } : {},
    url: String(form.url ?? "").trim(),
    auth: form.auth,
    ...fields.header && filled(form.header) ? { header: filled(form.header) } : {},
    ...fields.key && filled(form.key) ? { key: filled(form.key) } : {},
    ...fields.client ? ownClient(form) : {}
  };
}
function signInWindow(win = window) {
  if (win.dshDesktop !== void 0) return { go: (url) => {
    win.open(url, "_blank");
    return true;
  }, drop: () => {
  } };
  const reserved = win.open("", "_blank");
  if (reserved !== null) reserved.opener = null;
  return {
    go: (url) => {
      if (reserved === null) return false;
      reserved.location.href = url;
      return true;
    },
    drop: () => reserved?.close()
  };
}
function followSignIn(target, task) {
  return Promise.resolve(task).then((answer) => {
    const url = typeof answer?.signIn === "string" && /^https?:\/\//i.test(answer.signIn) ? answer.signIn : null;
    if (url === null) {
      target.drop();
      return null;
    }
    return target.go(url) ? null : url;
  }, (failure) => {
    target.drop();
    throw failure;
  });
}
function useTask() {
  const [busy, setBusy] = (0, import_react30.useState)(false);
  const [error, setError] = (0, import_react30.useState)(null);
  const start = (task, after) => {
    setBusy(true);
    setError(null);
    return Promise.resolve(task).then((value) => after?.(value), (failure) => setError(failure?.message ?? String(failure))).finally(() => setBusy(false));
  };
  return { busy, error, start, clear: () => setError(null) };
}
var logoSerial = 0;
function Tile({ id, name, catalog }) {
  const prefix = (0, import_react30.useRef)("");
  if (prefix.current === "") prefix.current = `bt-app-logo-${logoSerial += 1}-`;
  const logo = catalog ? logoOf(catalog) : void 0;
  if (logo) {
    const [width, height, markup] = logo;
    return (0, import_react30.createElement)(
      "span",
      { className: "bt-connector-mark bt-app-tile bt-app-logo", "aria-hidden": true },
      (0, import_react30.createElement)("svg", { viewBox: `0 0 ${width} ${height}`, dangerouslySetInnerHTML: { __html: markup.replaceAll("%ID%", prefix.current) } })
    );
  }
  const { letter, color } = tileOf(id, name);
  return (0, import_react30.createElement)("span", { className: "bt-connector-mark bt-app-tile", "aria-hidden": true, style: { background: inkFill(color), color: inkEye(color) } }, letter);
}
var copyText = (text) => navigator.clipboard === void 0 ? Promise.resolve(false) : navigator.clipboard.writeText(text).then(() => true, () => false);
function RedirectAddress({ redirect }) {
  const [copied, setCopied] = (0, import_react30.useState)(false);
  (0, import_react30.useEffect)(() => {
    if (!copied) return void 0;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);
  if (!redirect) return null;
  return (0, import_react30.createElement)(
    "div",
    { className: "bt-secret-edit-block" },
    (0, import_react30.createElement)("div", { className: "bt-secret-edit-label" }, t("Redirect address")),
    (0, import_react30.createElement)(
      "div",
      { className: "bt-secret-inline" },
      (0, import_react30.createElement)("code", { className: "bt-app-code" }, redirect),
      (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => {
        void copyText(redirect).then(setCopied);
      } }, copied ? t("Copied") : t("Copy"))
    )
  );
}
function ClientFields({ form, set, redirect }) {
  return [
    (0, import_react30.createElement)(RedirectAddress, { key: "redirect", redirect }),
    (0, import_react30.createElement)("input", { key: "id", className: "bt-input", "aria-label": t("Client ID"), placeholder: t("Client ID"), value: form.clientId, spellCheck: false, autoComplete: "off", onChange: (event) => set({ clientId: event.target.value }) }),
    (0, import_react30.createElement)("label", { key: "secret", className: "bt-q-field bt-secret-field" }, (0, import_react30.createElement)(KeyIcon), (0, import_react30.createElement)(MaskedInput, { value: form.clientSecret, onChange: (clientSecret) => set({ clientSecret }), label: t("Client secret (if it has one)") }))
  ];
}
var BlockedLink = ({ url }) => url ? (0, import_react30.createElement)("a", { className: "bt-connector-link", href: url, target: "_blank", rel: "noopener noreferrer" }, t("Open the sign-in page")) : null;
function CatalogForm({ entry, redirect, actions, onDone }) {
  const fields = connectFields(entry);
  const [form, setForm] = (0, import_react30.useState)({ key: "", clientId: "", clientSecret: "" });
  const [own, setOwn] = (0, import_react30.useState)(fields.client === "required");
  const [blocked, setBlocked] = (0, import_react30.useState)(null);
  const task = useTask();
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const ready2 = !task.busy && (!fields.key || form.key.trim() !== "") && (fields.client !== "required" || form.clientId.trim() !== "");
  const connect = () => {
    if (!ready2) return;
    const body = connectBody(entry, own ? form : { key: form.key });
    const request = () => actions.appConnect(body);
    const run = fields.signsIn ? followSignIn(signInWindow(), request()) : Promise.resolve(request()).then(() => null);
    void task.start(run, (url) => {
      if (url) setBlocked(url);
      else onDone();
    });
  };
  return (0, import_react30.createElement)(
    "div",
    { className: "bt-connector-form" },
    entry.note ? (0, import_react30.createElement)("div", { className: "bt-app-note" }, entry.note, entry.docs ? [" ", (0, import_react30.createElement)("a", { key: "docs", href: entry.docs, target: "_blank", rel: "noopener noreferrer" }, t("How to set it up"))] : null) : null,
    entry.auth === "none" ? (0, import_react30.createElement)("div", { className: "bt-app-note" }, t("{name} needs no account.", { name: entry.name })) : null,
    fields.key ? (0, import_react30.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react30.createElement)(KeyIcon), (0, import_react30.createElement)(MaskedInput, { value: form.key, onChange: (key) => set({ key }), onEnter: connect, label: entry.keyLabel ?? t("API key"), autoFocus: true })) : null,
    own ? (0, import_react30.createElement)(ClientFields, { form, set, redirect }) : null,
    fields.signsIn ? (0, import_react30.createElement)("div", { className: "bt-app-note" }, t("ApmixBot opens {name}'s own sign-in page in your browser. You sign in there and choose what to allow; ApmixBot never sees your password.", { name: entry.name })) : null,
    (0, import_react30.createElement)(
      "div",
      { className: "bt-connector-form-row" },
      fields.key && entry.keyUrl ? (0, import_react30.createElement)("a", { className: "bt-connector-link", href: entry.keyUrl, target: "_blank", rel: "noopener noreferrer" }, t("Get one")) : fields.client === "optional" ? (0, import_react30.createElement)("button", { type: "button", className: "bt-connector-link bt-app-linkish", "aria-expanded": own, onClick: () => setOwn(!own) }, t("Use my own OAuth client")) : (0, import_react30.createElement)("span", { className: "bt-connector-link" }),
      (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: task.busy, onClick: onDone }, t("Cancel")),
      (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: !ready2, onClick: connect }, task.busy ? t("Connecting…") : fields.button)
    ),
    (0, import_react30.createElement)(BlockedLink, { url: blocked }),
    task.error ? (0, import_react30.createElement)("div", { className: "bt-app-error", role: "alert" }, task.error) : null
  );
}
function CatalogRow({ entry, connected, open, onToggle, redirect, actions }) {
  return (0, import_react30.createElement)(
    "div",
    { className: "bt-connector" },
    (0, import_react30.createElement)(
      "div",
      { className: "bt-connector-head" },
      (0, import_react30.createElement)(Tile, { id: entry.id, name: entry.name, catalog: entry.id }),
      (0, import_react30.createElement)(
        "button",
        { type: "button", className: "bt-app-head", disabled: connected, "aria-expanded": connected ? void 0 : open, onClick: onToggle },
        (0, import_react30.createElement)("span", { className: "bt-connector-name" }, entry.name),
        (0, import_react30.createElement)("span", { className: "bt-connector-status bt-app-about" }, entry.about)
      ),
      connected ? (0, import_react30.createElement)("span", { className: "bt-set-hint bt-app-done" }, (0, import_react30.createElement)(CheckIcon), t("Connected")) : (0, import_react30.createElement)("span", { className: "bt-chevron", "data-open": open || void 0, "aria-hidden": true }, (0, import_react30.createElement)(ChevronRightIcon))
    ),
    open && !connected ? (0, import_react30.createElement)(CatalogForm, { entry, redirect, actions, onDone: onToggle }) : null
  );
}
function Catalog({ view, actions }) {
  const [query, setQuery] = (0, import_react30.useState)("");
  const [open, setOpen] = (0, import_react30.useState)(null);
  const connected = new Set(view.apps.map((app2) => app2.catalog).filter(Boolean));
  const groups = searchCatalog(query);
  return (0, import_react30.createElement)(
    import_react30.Fragment,
    null,
    (0, import_react30.createElement)(
      "div",
      { className: "bt-app-search" },
      (0, import_react30.createElement)("input", { className: "bt-input", role: "searchbox", "aria-label": t("Search apps"), placeholder: t("Search {count} apps", { count: APP_CATALOG.length }), value: query, onChange: (event) => setQuery(event.target.value) })
    ),
    groups.length === 0 ? (0, import_react30.createElement)("div", { className: "bt-set-row" }, (0, import_react30.createElement)("span", { className: "bt-set-hint" }, t("No app by that name. Add it by its address below."))) : null,
    groups.map((group) => (0, import_react30.createElement)(
      "div",
      { key: group.category, className: "bt-app-group", role: "group", "aria-label": t(group.category) },
      (0, import_react30.createElement)("div", { className: "bt-app-cat" }, t(group.category)),
      group.entries.map((entry) => (0, import_react30.createElement)(CatalogRow, {
        key: entry.id,
        entry,
        connected: connected.has(entry.id),
        open: open === entry.id,
        redirect: view.redirect,
        actions,
        onToggle: () => setOpen(open === entry.id ? null : entry.id)
      }))
    ))
  );
}
function ConnectedRow({ app: app2, actions, run, open, onToggle }) {
  const [confirm, setConfirm] = (0, import_react30.useState)(false);
  const [blocked, setBlocked] = (0, import_react30.useState)(null);
  const task = useTask();
  (0, import_react30.useEffect)(() => {
    if (!confirm) return void 0;
    const timer = setTimeout(() => setConfirm(false), CONFIRM_MS);
    return () => clearTimeout(timer);
  }, [confirm]);
  (0, import_react30.useEffect)(() => {
    if (!open) setConfirm(false);
  }, [open]);
  const signIn = () => {
    void task.start(followSignIn(signInWindow(), actions.appSignIn(app2.id)), setBlocked);
  };
  const remove = () => {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    setConfirm(false);
    void run(actions.appRemove(app2.id));
  };
  const name = app2.name || catalogApp(app2.catalog)?.name || app2.id;
  const state = app2.enabled === false ? "off" : app2.state;
  return (0, import_react30.createElement)(
    "div",
    { className: "bt-connector", "data-state": state },
    (0, import_react30.createElement)(
      "div",
      { className: "bt-connector-head" },
      (0, import_react30.createElement)(Tile, { id: app2.catalog ?? app2.id, name, catalog: app2.catalog }),
      (0, import_react30.createElement)(
        "button",
        { type: "button", className: "bt-app-head", "aria-expanded": open, onClick: onToggle },
        (0, import_react30.createElement)("span", { className: "bt-connector-name" }, name),
        (0, import_react30.createElement)("span", { className: "bt-connector-status" }, statusLine(app2))
      ),
      (0, import_react30.createElement)(
        "span",
        { className: "bt-connector-actions" },
        (0, import_react30.createElement)(Switch, { on: app2.enabled !== false, label: t("Use {name}", { name }), onChange: (enabled) => run(actions.appEnable(app2.id, enabled)) })
      )
    ),
    open ? (0, import_react30.createElement)(
      "div",
      { className: "bt-connector-form" },
      app2.url ? (0, import_react30.createElement)("div", { className: "bt-set-hint bt-app-url" }, app2.url) : null,
      (0, import_react30.createElement)(
        "div",
        { className: "bt-connector-form-row" },
        (0, import_react30.createElement)("span", { className: "bt-connector-link" }),
        app2.state === "error" ? (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: task.busy, onClick: () => run(actions.appRetry(app2.id)) }, t("Try again")) : null,
        app2.auth === "oauth" || app2.state === "sign-in" ? (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: task.busy, onClick: signIn }, app2.state === "sign-in" ? t("Sign in") : t("Sign in again")) : null,
        (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", "data-confirm": confirm || void 0, onClick: remove }, (0, import_react30.createElement)(TrashIcon), confirm ? t("Click again to remove") : t("Remove"))
      ),
      (0, import_react30.createElement)(BlockedLink, { url: blocked }),
      task.error ? (0, import_react30.createElement)("div", { className: "bt-app-error", role: "alert" }, task.error) : null
    ) : null
  );
}
function AddByAddress({ redirect, actions, onDone }) {
  const [form, setForm] = (0, import_react30.useState)({ name: "", url: "", auth: "auto", header: "", key: "", clientId: "", clientSecret: "" });
  const [own, setOwn] = (0, import_react30.useState)(false);
  const [blocked, setBlocked] = (0, import_react30.useState)(null);
  const task = useTask();
  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const fields = addFields(form.auth);
  const problem = addressProblem(form.url);
  const ready2 = !task.busy && form.url.trim() !== "" && problem === "" && (!fields.key || form.key.trim() !== "");
  const add = () => {
    if (!ready2) return;
    const body = addBody(own ? form : { ...form, clientId: "", clientSecret: "" });
    const run = fields.client ? followSignIn(signInWindow(), actions.appAdd(body)) : Promise.resolve(actions.appAdd(body)).then(() => null);
    void task.start(run, (url) => {
      if (url) setBlocked(url);
      else onDone();
    });
  };
  const hint = SIGN_INS.find(([id]) => id === form.auth)[2];
  return (0, import_react30.createElement)(
    "div",
    { className: "bt-set-row bt-set-paste bt-secret-add" },
    (0, import_react30.createElement)("input", { className: "bt-input", "aria-label": t("Name"), placeholder: t("Name, e.g. My app"), maxLength: 40, value: form.name, autoComplete: "off", autoFocus: true, onChange: (event) => set({ name: event.target.value }) }),
    (0, import_react30.createElement)("input", { className: "bt-input", "aria-label": t("Address"), placeholder: t("Address, e.g. https://mcp.example.com/mcp"), value: form.url, spellCheck: false, autoComplete: "off", "aria-invalid": problem !== "" || void 0, onChange: (event) => set({ url: event.target.value }) }),
    problem ? (0, import_react30.createElement)("div", { className: "bt-app-error", role: "alert" }, problem) : null,
    (0, import_react30.createElement)(
      "div",
      { className: "bt-secret-edit-block" },
      (0, import_react30.createElement)("div", { className: "bt-secret-edit-label" }, t("How it signs in")),
      (0, import_react30.createElement)(
        "select",
        { className: "bt-select", "aria-label": t("How it signs in"), value: form.auth, onChange: (event) => set({ auth: event.target.value }) },
        SIGN_INS.map(([id, label]) => (0, import_react30.createElement)("option", { key: id, value: id }, t(label)))
      ),
      (0, import_react30.createElement)("div", { className: "bt-set-hint" }, t(hint))
    ),
    fields.header ? (0, import_react30.createElement)("input", { className: "bt-input", "aria-label": t("Header"), placeholder: t("Header, e.g. X-API-Key"), value: form.header, spellCheck: false, autoComplete: "off", onChange: (event) => set({ header: event.target.value }) }) : null,
    fields.key ? (0, import_react30.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react30.createElement)(KeyIcon), (0, import_react30.createElement)(MaskedInput, { value: form.key, onChange: (key) => set({ key }), onEnter: add, label: t("Key") })) : null,
    fields.client && own ? (0, import_react30.createElement)(ClientFields, { form, set, redirect }) : null,
    fields.client && own ? (0, import_react30.createElement)("div", { className: "bt-set-hint" }, t("For an app that does not register apps itself. Register a client on its developer site with the redirect address above.")) : null,
    (0, import_react30.createElement)(
      "div",
      { className: "bt-secret-row-actions" },
      fields.client ? (0, import_react30.createElement)("button", { type: "button", className: "bt-set-hint bt-app-linkish", "aria-expanded": own, onClick: () => setOwn(!own) }, t("Use my own OAuth client")) : (0, import_react30.createElement)("span", { className: "bt-set-hint" }),
      (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: task.busy, onClick: onDone }, t("Cancel")),
      (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: !ready2, onClick: add }, task.busy ? t("Connecting…") : t("Add the app"))
    ),
    (0, import_react30.createElement)(BlockedLink, { url: blocked }),
    task.error ? (0, import_react30.createElement)("div", { className: "bt-app-error", role: "alert" }, task.error) : null
  );
}
function AppsPage({ roster, actions, run, Section }) {
  const [open, setOpen] = (0, import_react30.useState)(null);
  const [adding, setAdding] = (0, import_react30.useState)(false);
  const view = appsOf(roster);
  const allowed2 = Array.isArray(roster?.allowedTools) ? roster.allowedTools : [];
  const intro = (0, import_react30.createElement)("p", { key: "about", className: "bt-secret-about bt-app-intro" }, t("Connect the apps you use, and your Bots work in them as you: your email, calendar, files, code and payments."));
  if (!view.available) return [intro, (0, import_react30.createElement)("p", { key: "off", className: "bt-set-hint" }, t("This engine cannot connect apps."))];
  return [
    intro,
    (0, import_react30.createElement)(
      Section,
      { key: "connected", title: t("Connected · {count}", { count: view.apps.length }) },
      view.apps.length === 0 ? (0, import_react30.createElement)("div", { className: "bt-set-row" }, (0, import_react30.createElement)("span", { className: "bt-set-hint" }, t("No apps yet. Pick one below."))) : null,
      view.apps.map((app2) => (0, import_react30.createElement)(ConnectedRow, { key: app2.id, app: app2, actions, run, open: open === app2.id, onToggle: () => setOpen(open === app2.id ? null : app2.id) }))
    ),
    (0, import_react30.createElement)(
      Section,
      { key: "asking", title: t("Approvals") },
      (0, import_react30.createElement)(
        "div",
        { className: "bt-set-row" },
        (0, import_react30.createElement)(
          "div",
          { className: "bt-set-copy" },
          (0, import_react30.createElement)("span", null, t("Tools your Bots use without asking")),
          (0, import_react30.createElement)("span", { className: "bt-set-hint bt-app-url" }, allowedLine(allowed2))
        ),
        allowed2.length > 0 ? (0, import_react30.createElement)("div", { className: "bt-set-control" }, (0, import_react30.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => run(actions.resetAllowedTools()) }, t("Ask again"))) : null
      )
    ),
    (0, import_react30.createElement)(Section, { key: "catalog", title: t("Add an app") }, (0, import_react30.createElement)(Catalog, { view, actions })),
    (0, import_react30.createElement)(
      Section,
      { key: "other", title: t("Another app") },
      adding ? (0, import_react30.createElement)(AddByAddress, { redirect: view.redirect, actions, onDone: () => setAdding(false) }) : (0, import_react30.createElement)(
        "button",
        { type: "button", className: "bt-set-row bt-secret-summary", onClick: () => setAdding(true) },
        (0, import_react30.createElement)(
          "span",
          { className: "bt-set-copy" },
          (0, import_react30.createElement)("span", null, t("Add an app by its address")),
          (0, import_react30.createElement)("span", { className: "bt-set-hint" }, t("Any MCP server that answers at an https address"))
        ),
        (0, import_react30.createElement)("span", { className: "bt-chevron", "aria-hidden": true }, (0, import_react30.createElement)(ChevronRightIcon))
      )
    )
  ];
}
var APPS_CSS = `
.bt-app-intro{margin-top:16px}
.bt-connector-mark.bt-app-tile{border:0;font-size:15px;line-height:20px;font-weight:600}
.bt-connector-mark.bt-app-logo{background:var(--bt-logo-tile);padding:7px;box-sizing:border-box;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.1)}
.bt-app-logo svg{width:100%;height:100%;display:block}
.bt-app-head{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.bt-app-head:disabled{cursor:default}
.bt-app-about{white-space:normal;color:var(--bt-ink-2)}
.bt-app-done{flex:none;display:inline-flex;align-items:center;gap:4px}
.bt-app-done svg{width:13px;height:13px}
.bt-app-search{padding:10px 12px}
.bt-app-cat{padding:12px 12px 2px;font-size:12px;line-height:16px;font-weight:600;color:var(--bt-ink-2)}
.bt-app-group>.bt-connector+.bt-connector{border-top:.5px solid var(--bt-line)}
.bt-app-note{font-size:12px;line-height:17px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-app-note a{color:var(--bt-accent)}
.bt-app-url{overflow-wrap:anywhere}
.bt-app-code{flex:1;min-width:0;padding:6px 8px;border-radius:8px;background:var(--bt-hover);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:16px;overflow-wrap:anywhere;user-select:all}
.bt-app-linkish{border:0;padding:0;background:none;font:inherit;font-size:12px;text-align:left;text-decoration:underline;cursor:pointer}
.bt-app-error{font-size:12px;line-height:16px;color:var(--bt-danger);overflow-wrap:anywhere}
.bt-connector .bt-secret-danger[data-confirm]{background:var(--bt-danger);color:var(--bt-accent-ink)}
.bt-connector .bt-chevron{transition:rotate .16s ease}
.bt-connector .bt-chevron[data-open]{rotate:90deg}
@media (prefers-reduced-motion:reduce){.bt-connector .bt-chevron{transition:none}}
`;

// src/client/about.js
var import_react31 = require("react");
var CHEER_MS = 1800;
var WEBSITE = "https://bot.apmix.ai/";
var SUPPORT_EMAIL = "support@apmix.ai";
var SOCIALS = [["X", "https://x.com/ApmixAi"], ["Telegram", "https://t.me/apmix_ai"]];
var bare = (url) => url.replace(/^https:\/\//, "").replace(/\/$/, "");
var starCount = (count) => new Intl.NumberFormat(dateLocale(), { notation: "compact", maximumFractionDigits: 1 }).format(count);
function whenText(time) {
  const date = new Date(time);
  const today = (/* @__PURE__ */ new Date()).toDateString() === date.toDateString();
  const clock4 = date.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit" });
  return today ? clock4 : `${date.toLocaleDateString(dateLocale(), { month: "short", day: "numeric" })} ${clock4}`;
}
function botHint(update) {
  if (update.phase === "installing") return t("Updating ApmixBot…");
  if (update.phase === "installed") return t("Restart ApmixBot to start using version {version}.", { version: update.installed ?? update.latest });
  if (update.phase === "failed") return t("The update did not finish: {reason}", { reason: hostText(update.error ?? "") });
  if (update.available) return t("ApmixBot {version} is available", { version: update.latest });
  if (update.source === "app") return t("Updates come with the ApmixBot app.");
  if (update.enabled === false) return t("Update checks are off.");
  if (update.source === "path") return t("Installed from a local folder; update it there.");
  if (!update.checkedAt) return null;
  if (!update.latest && update.source !== "registry") return t("Updates are not offered for this install.");
  const checked = t("Checked {time}", { time: whenText(update.checkedAt) });
  return `${update.latest ? t("Up to date") : t("Could not check for updates.")} · ${checked}`;
}
var linkProps = (href) => ({ className: "bt-soft bt-soft-sm bt-about-link", href, target: "_blank", rel: "noopener noreferrer" });
function AboutPage({ useUpdate, actions, run, Section, Row: Row3 }) {
  const update = useUpdate((value) => value) ?? {};
  const [checking, setChecking] = (0, import_react31.useState)(false);
  const [stars, setStars] = (0, import_react31.useState)(null);
  (0, import_react31.useEffect)(() => {
    let live = true;
    actions.repoStars().then((count) => {
      if (live && Number.isInteger(count)) setStars(count);
    }, () => {
    });
    return () => {
      live = false;
    };
  }, []);
  const [cheer, setCheer] = (0, import_react31.useState)(true);
  (0, import_react31.useEffect)(() => {
    if (!cheer) return void 0;
    const timer = setTimeout(() => setCheer(false), CHEER_MS);
    return () => clearTimeout(timer);
  }, [cheer]);
  const check = () => {
    setChecking(true);
    void run(actions.checkUpdate()).then((done) => {
      setChecking(false);
      if (done) setCheer(true);
    });
  };
  const phase = update.phase ?? "idle";
  (0, import_react31.useEffect)(() => {
    if (phase === "installed") setCheer(true);
  }, [phase]);
  const markState = checking ? "searching" : phase === "installing" ? "working" : cheer ? "done" : "idle";
  const botControl = phase === "installed" || update.source === "app" ? null : update.available || phase === "installing" ? (0, import_react31.createElement)(
    "button",
    { type: "button", className: "bt-about-primary", disabled: phase === "installing", onClick: () => run(actions.installUpdate()) },
    phase === "installing" ? t("Updating…") : phase === "failed" ? t("Try again") : t("Update")
  ) : (0, import_react31.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: checking || update.enabled === false, onClick: check }, checking ? t("Checking…") : t("Check for updates"));
  const repo = update.repoUrl;
  return [
    (0, import_react31.createElement)(
      "div",
      { key: "hero", className: "bt-about-hero" },
      (0, import_react31.createElement)("span", { className: "bt-about-mark" }, (0, import_react31.createElement)(BotMark, { look: MAIN_LOOK, bot: { id: "about" }, size: 52, state: markState, live: true, gaze: true, pokeable: true })),
      (0, import_react31.createElement)(
        "div",
        { className: "bt-about-copy" },
        (0, import_react31.createElement)("span", { className: "bt-about-name" }, "Apmix", (0, import_react31.createElement)("b", null, "Bot")),
        update.current ? (0, import_react31.createElement)("span", { className: "bt-about-version" }, t("Version {version}", { version: update.current })) : null
      ),
      repo ? (0, import_react31.createElement)(
        "a",
        {
          className: "bt-star",
          href: repo,
          target: "_blank",
          rel: "noopener noreferrer",
          title: t("Star ApmixBot on GitHub"),
          "aria-label": stars === null ? t("Star ApmixBot on GitHub") : `${t("Star ApmixBot on GitHub")} · ${t("{count} stars", { count: stars })}`
        },
        (0, import_react31.createElement)("span", { className: "bt-star-main" }, (0, import_react31.createElement)("span", { className: "bt-star-icon" }, (0, import_react31.createElement)(StarLineIcon)), "Star"),
        stars === null ? null : (0, import_react31.createElement)("span", { className: "bt-star-count" }, starCount(stars))
      ) : null
    ),
    repo ? (0, import_react31.createElement)("p", { key: "ask", className: "bt-about-ask" }, t("If ApmixBot helps you, a star on GitHub helps more people find it.")) : null,
    (0, import_react31.createElement)(
      Section,
      { key: "updates", title: t("Updates") },
      (0, import_react31.createElement)(Row3, { label: "ApmixBot", hint: botHint(update) }, botControl, update.available && update.notesUrl ? (0, import_react31.createElement)("a", linkProps(update.notesUrl), t("What's new")) : null)
    ),
    (0, import_react31.createElement)(
      Section,
      { key: "links", title: t("Links") },
      (0, import_react31.createElement)(Row3, { label: t("Website"), hint: bare(WEBSITE) }, (0, import_react31.createElement)("a", linkProps(WEBSITE), t("Open"))),
      repo ? (0, import_react31.createElement)(Row3, { label: t("Source code"), hint: bare(repo) }, (0, import_react31.createElement)("a", linkProps(repo), (0, import_react31.createElement)(GitHubMark), t("Open"))) : null,
      update.notesUrl ? (0, import_react31.createElement)(Row3, { label: t("Release notes") }, (0, import_react31.createElement)("a", linkProps(update.notesUrl), t("Open"))) : null,
      // No target: a mail address opens the mail app, and a new tab for it would stay empty.
      (0, import_react31.createElement)(Row3, { label: t("Support"), hint: SUPPORT_EMAIL }, (0, import_react31.createElement)("a", { className: "bt-soft bt-soft-sm bt-about-link", href: `mailto:${SUPPORT_EMAIL}` }, t("Email"))),
      SOCIALS.map(([name, url]) => (0, import_react31.createElement)(Row3, { key: name, label: name, hint: bare(url) }, (0, import_react31.createElement)("a", linkProps(url), t("Open"))))
    )
  ];
}
var ABOUT_CSS = `
.bt-about-hero{display:flex;align-items:center;gap:14px;padding:16px;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card)}
.bt-about-mark{flex:none;display:inline-flex;position:relative}
.bt-about-mark::before{content:'';position:absolute;inset:-20%;border-radius:50%}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle]:not(.bt-mark-poke) .bt-b{rotate:8deg;translate:5% -1%;animation:bt-nuzzle .78s ease-in-out .32s infinite}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle] .bt-eye{scale:1 0;animation:none}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle] .bt-eye-happy{opacity:1;transition-delay:.1s}
.bt-about-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bt-about-name{font-size:16px;line-height:22px;font-weight:700;letter-spacing:-.02em}
.bt-about-name b{font-weight:inherit;color:var(--bt-accent)}
.bt-about-version{font-size:12px;line-height:16px;color:var(--bt-ink-2);font-variant-numeric:tabular-nums}
.bt-about-ask{margin:-10px 4px 0;font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-star{flex:none;display:inline-flex;align-items:stretch;height:30px;border-radius:999px;border:1px solid var(--bt-line-2,var(--bt-line));overflow:hidden;color:var(--bt-ink);text-decoration:none;font-size:12px;line-height:28px;transition:transform .12s ease,border-color .15s ease}
.bt-star:hover{border-color:color-mix(in srgb,#e3a008 55%,var(--bt-line))}
.bt-star:active{transform:scale(.96)}
.bt-star-main{display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;background:var(--bt-hover);font-weight:500}
.bt-star-icon{display:inline-flex;color:var(--bt-ink-2);transition:color .15s ease}
.bt-star-icon path{transition:fill .15s ease}
.bt-star:hover .bt-star-icon{color:#e3a008;animation:bt-star-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-star:hover .bt-star-icon path{fill:currentColor}
.bt-star-count{display:inline-flex;align-items:center;padding:0 11px;border-left:1px solid var(--bt-line-2,var(--bt-line));color:var(--bt-ink-2);font-variant-numeric:tabular-nums;animation:bt-star-count-in ${SPRING_POP.duration}ms ${SPRING_POP.easing},bt-veil-in .2s ease-out}
@keyframes bt-star-pop{from{scale:.6;rotate:-30deg}}
@keyframes bt-star-count-in{from{translate:-6px 0}}
.bt-about-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.bt-about-link svg{width:14px;height:14px}
.bt-about-primary{height:28px;border-radius:999px;border:0;background:var(--bt-accent);color:var(--bt-accent-ink);padding:0 14px;font-size:12px;cursor:pointer;transition:filter .12s ease;flex:none;white-space:nowrap}
.bt-about-primary:hover{filter:brightness(1.08)}
.bt-about-primary:active{filter:brightness(.94)}
.bt-about-primary:disabled{opacity:.6;cursor:default;filter:none}
@media (prefers-reduced-motion:reduce){.bt-star:hover .bt-star-icon,.bt-star-count{animation:none}}
`;

// src/client/providers-page.js
var import_react32 = require("react");
var SHOWN_MODELS = 8;
var translated = (promise) => Promise.resolve(promise).catch((failure) => {
  throw new Error(hostText(failure?.message ?? String(failure)));
});
var ready = (provider) => provider.key === null || provider.key.configured;
function ProvidersPage({ actions, run, Section }) {
  const [view, setView] = (0, import_react32.useState)(null);
  const [open, setOpen] = (0, import_react32.useState)(null);
  const [adding, setAdding] = (0, import_react32.useState)(false);
  const apply2 = (promise) => run(translated(promise).then((next) => {
    if (next?.providers) setView(next);
  }));
  (0, import_react32.useEffect)(() => {
    void apply2(Promise.resolve(actions.providers()).then((next) => {
      if (next?.available && !next.providers.some(ready)) setAdding(true);
      return next;
    }));
  }, []);
  if (view === null) return null;
  if (!view.available) return (0, import_react32.createElement)("p", { className: "bt-set-hint" }, t("This engine cannot set up model providers."));
  const added = (next) => {
    if (next?.providers) setView(next);
    setAdding(false);
  };
  return [
    (0, import_react32.createElement)(
      Section,
      { key: "list", title: t("Model providers · {count}", { count: view.providers.length }) },
      view.providers.map((provider) => (0, import_react32.createElement)(ProviderRow, {
        key: provider.id,
        provider,
        apply: apply2,
        actions,
        open: open === provider.id,
        onToggle: () => setOpen(open === provider.id ? null : provider.id)
      })),
      adding ? (0, import_react32.createElement)(AddProvider, { key: "add", view, apply: apply2, actions, onAdded: added, onDone: () => setAdding(false) }) : null
    ),
    adding ? null : (0, import_react32.createElement)("div", { key: "add", className: "bt-actions" }, (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => setAdding(true) }, t("Add a provider")))
  ];
}
function keyState(provider) {
  const { key } = provider;
  if (key === null) return null;
  if (!key.configured) return provider.removable ? ["missing", t("Needs an API key")] : ["off", t("Not set up")];
  return key.writable ? ["set", t("Key set")] : ["outside", t("Key set outside ApmixBot")];
}
function ProviderRow({ provider, apply: apply2, actions, open, onToggle }) {
  const [confirm, setConfirm] = (0, import_react32.useState)(false);
  (0, import_react32.useEffect)(() => {
    if (!open) setConfirm(false);
  }, [open]);
  const state = keyState(provider);
  const count = provider.models.length === 0 ? t("No models") : provider.models.length === 1 ? t("1 model") : t("{count} models", { count: provider.models.length });
  const hint = provider.error ?? (provider.endpoint ? `${provider.endpoint} · ${count}` : count);
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-secret-item bt-provider", "data-open": open ? "" : void 0 },
    (0, import_react32.createElement)(
      "button",
      { type: "button", className: "bt-set-row bt-secret-summary", "aria-expanded": open, onClick: onToggle },
      (0, import_react32.createElement)(
        "span",
        { className: "bt-set-copy" },
        (0, import_react32.createElement)("span", { className: "bt-secret-title" }, provider.name, provider.name !== provider.id ? (0, import_react32.createElement)("span", { className: "bt-provider-id" }, provider.id) : null),
        (0, import_react32.createElement)("span", { className: "bt-set-hint", "data-error": provider.error ? "" : void 0 }, hint)
      ),
      state ? (0, import_react32.createElement)("span", { className: "bt-set-control" }, (0, import_react32.createElement)("span", { className: "bt-provider-state", "data-state": state[0] }, state[1])) : null
    ),
    open ? (0, import_react32.createElement)(
      "div",
      { className: "bt-secret-edit" },
      provider.api ? (0, import_react32.createElement)("div", { className: "bt-set-hint" }, t("Protocol: {protocol}", { protocol: PROTOCOL_NAMES[provider.api] ?? provider.api })) : null,
      provider.key?.writable ? (0, import_react32.createElement)(KeyEditor, { provider, apply: apply2, actions }) : null,
      provider.key && !provider.key.writable ? (0, import_react32.createElement)("div", { className: "bt-set-hint" }, t("This key comes from outside ApmixBot, such as an environment variable, and cannot be changed here.")) : null,
      provider.custom && provider.removable ? (0, import_react32.createElement)(ModelsEditor, { provider, apply: apply2, actions }) : provider.models.length > 0 ? (0, import_react32.createElement)("div", { className: "bt-secret-edit-block" }, (0, import_react32.createElement)("div", { className: "bt-secret-edit-label" }, t("Models")), (0, import_react32.createElement)(ModelTags, { provider })) : null,
      provider.removable ? (0, import_react32.createElement)(
        "div",
        { className: "bt-secret-row-actions" },
        confirm ? [
          (0, import_react32.createElement)("span", { key: "q", className: "bt-set-hint" }, t("Remove {name}? Bots on its models need another model.", { name: provider.name })),
          (0, import_react32.createElement)("button", { key: "no", type: "button", className: "bt-soft bt-soft-sm", onClick: () => setConfirm(false) }, t("Keep")),
          (0, import_react32.createElement)("button", { key: "yes", type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", onClick: () => apply2(actions.removeProvider(provider.id)) }, t("Remove"))
        ] : (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", onClick: () => setConfirm(true) }, (0, import_react32.createElement)(TrashIcon), t("Remove provider"))
      ) : null
    ) : null
  );
}
function ModelTags({ provider }) {
  const shown = provider.models.slice(0, SHOWN_MODELS);
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-provider-models" },
    shown.map((model) => (0, import_react32.createElement)("span", { key: model.ref, className: "bt-tag", title: model.ref }, model.name)),
    provider.models.length > shown.length ? (0, import_react32.createElement)("span", { className: "bt-set-hint" }, t("and {count} more", { count: provider.models.length - shown.length })) : null
  );
}
function ModelsEditor({ provider, apply: apply2, actions }) {
  const current = provider.models.map((model) => ({ id: model.ref.slice(provider.id.length + 1), name: model.name }));
  const [editing, setEditing] = (0, import_react32.useState)(false);
  const [found, setFound] = (0, import_react32.useState)(null);
  const [picked, setPicked] = (0, import_react32.useState)([]);
  const [typed, setTyped] = (0, import_react32.useState)("");
  const [asking, setAsking] = (0, import_react32.useState)(false);
  const head = (button) => (0, import_react32.createElement)("div", { className: "bt-provider-models-head" }, (0, import_react32.createElement)("span", { className: "bt-secret-edit-label" }, t("Models")), button);
  if (!editing) {
    const edit = () => {
      setFound(null);
      setPicked(current.map((model) => model.id));
      setTyped("");
      setEditing(true);
    };
    return (0, import_react32.createElement)(
      "div",
      { className: "bt-secret-edit-block" },
      head((0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: edit }, t("Change models"))),
      provider.models.length > 0 ? (0, import_react32.createElement)(ModelTags, { provider }) : null
    );
  }
  const base = found ?? current;
  const listed = [...base, ...picked.filter((id) => !base.some((model) => model.id === id)).map((id) => ({ id }))];
  const models = [
    ...listed.filter((model) => picked.includes(model.id)),
    ...typedIds(typed).filter((id) => !picked.includes(id)).map((id) => ({ id }))
  ];
  const fetchModels = () => {
    setAsking(true);
    void apply2(Promise.resolve(actions.providerModels({ provider: provider.id })).then((list) => {
      setFound(Array.isArray(list) ? list : []);
    })).finally(() => setAsking(false));
  };
  const save = () => apply2(actions.setProviderModels({ provider: provider.id, models })).then((ok) => {
    if (ok) setEditing(false);
  });
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-secret-edit-block" },
    head((0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: asking, onClick: fetchModels }, asking ? t("Asking…") : t("Fetch models"))),
    (0, import_react32.createElement)(ModelPicker, { models: listed, picked, onPick: setPicked, typed, onType: setTyped }),
    (0, import_react32.createElement)(
      "div",
      { className: "bt-secret-row-actions" },
      (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => setEditing(false) }, t("Cancel")),
      (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: models.length === 0, onClick: save }, t("Save models"))
    )
  );
}
function KeyEditor({ provider, apply: apply2, actions }) {
  const [value, setValue] = (0, import_react32.useState)("");
  const [saved, setSaved] = (0, import_react32.useState)(false);
  const filled2 = value.trim() !== "";
  const save = () => {
    if (!filled2) return;
    void apply2(actions.setProviderKey(provider.id, value)).then((ok) => {
      if (ok) {
        setValue("");
        setSaved(true);
      }
    });
  };
  const edit = (next) => {
    setValue(next);
    setSaved(false);
  };
  const label = t("{provider} API key", { provider: provider.name });
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-secret-edit-block" },
    (0, import_react32.createElement)("div", { className: "bt-secret-edit-label" }, provider.key.configured ? t("Replace the API key") : t("API key")),
    (0, import_react32.createElement)(
      "div",
      { className: "bt-secret-inline" },
      (0, import_react32.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react32.createElement)(KeyIcon), (0, import_react32.createElement)(MaskedInput, { value, onChange: edit, onEnter: save, label })),
      (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: !filled2, onClick: save }, t("Save")),
      provider.key.configured ? (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-secret-danger", onClick: () => apply2(actions.setProviderKey(provider.id, null)) }, t("Remove key")) : null
    ),
    saved ? (0, import_react32.createElement)("div", { className: "bt-set-hint bt-secret-ok", role: "status" }, (0, import_react32.createElement)(CheckIcon), t("Saved.")) : null
  );
}
function AddProvider({ view, apply: apply2, actions, onAdded, onDone }) {
  const [mode, setMode] = (0, import_react32.useState)("custom");
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-set-row bt-set-paste bt-provider-add" },
    (0, import_react32.createElement)(
      Segmented,
      { label: t("Kind of provider"), value: mode },
      [["custom", t("Endpoint and key")], ["known", t("Known provider")]].map(([id, label]) => (0, import_react32.createElement)("button", {
        key: id,
        type: "button",
        "aria-pressed": mode === id,
        disabled: id === "known" && view.addable.length === 0,
        onClick: () => setMode(id)
      }, label))
    ),
    // Both forms stay mounted, so switching keeps what is typed in the other.
    (0, import_react32.createElement)("div", { hidden: mode !== "custom" }, (0, import_react32.createElement)(EndpointForm, { actions, onAdded, onCancel: onDone })),
    (0, import_react32.createElement)("div", { hidden: mode !== "known" }, (0, import_react32.createElement)(KnownForm, { view, apply: apply2, actions, onDone }))
  );
}
function KnownForm({ view, apply: apply2, actions, onDone }) {
  const [provider, setProvider] = (0, import_react32.useState)("");
  const [key, setKey] = (0, import_react32.useState)("");
  const options = [...view.addable].sort((a, b) => a.name.localeCompare(b.name));
  const add = () => {
    if (provider === "") return;
    void apply2(actions.addProvider({ provider, key })).then((ok) => {
      if (ok) onDone();
    });
  };
  return (0, import_react32.createElement)(
    "div",
    { className: "bt-provider-form" },
    (0, import_react32.createElement)(
      "select",
      { className: "bt-select", "aria-label": t("Provider"), value: provider, onChange: (event) => setProvider(event.target.value) },
      (0, import_react32.createElement)("option", { value: "", disabled: true }, t("Choose a provider")),
      options.map((option) => (0, import_react32.createElement)("option", { key: option.id, value: option.id }, option.name))
    ),
    (0, import_react32.createElement)("label", { className: "bt-q-field bt-secret-field" }, (0, import_react32.createElement)(KeyIcon), (0, import_react32.createElement)(MaskedInput, { value: key, onChange: setKey, onEnter: add, label: t("API key") })),
    (0, import_react32.createElement)(
      "div",
      { className: "bt-secret-row-actions" },
      (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: onDone }, t("Cancel")),
      (0, import_react32.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: provider === "", onClick: add }, t("Add"))
    )
  );
}
var PROVIDERS_CSS = `
.bt-provider-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--bt-ink-3)}
.bt-provider .bt-set-hint{overflow-wrap:anywhere}
.bt-provider .bt-set-hint[data-error]{color:var(--bt-danger)}
.bt-provider-state{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--bt-ink-2);white-space:nowrap}
.bt-provider-state::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--bt-ink-3)}
.bt-provider-state[data-state=set]::before{background:var(--bt-green)}
.bt-provider-state[data-state=off]{color:var(--bt-ink-3)}
.bt-provider-state[data-state=missing]{color:var(--bt-danger)}
.bt-provider-state[data-state=missing]::before{background:var(--bt-danger)}
.bt-provider .bt-secret-field{align-items:center;gap:8px}
.bt-provider .bt-secret-field>svg,.bt-provider-form .bt-secret-field>svg{flex:none;color:var(--bt-ink-3)}
.bt-provider-models{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.bt-provider-models .bt-tag{max-width:220px}
.bt-provider-models-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bt-provider-add{gap:12px;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
.bt-provider-add .bt-seg{align-self:flex-start}
.bt-provider-add .bt-seg button{flex:none;padding:0 14px;white-space:nowrap}
.bt-provider-add .bt-seg button:disabled{opacity:.45;cursor:default}
.bt-provider-form{display:flex;flex-direction:column;gap:10px}
.bt-provider-form .bt-secret-field{min-height:36px;align-items:center;gap:8px}
@media (prefers-reduced-motion:reduce){.bt-provider-add{animation:none}}
`;

// src/client/settings.js
var import_react33 = require("react");
var capitalize2 = (word) => word[0].toUpperCase() + word.slice(1);
var SETTINGS_PAGES = [["general", "General"], ["models", "Models"], ["bots", "Bots"], ["groups", "Group chats"], ["connectors", "Apps"], ["capabilities", "Capabilities"], ["schedules", "Scheduled tasks"], ["usage", "Usage"], ["secrets", "Secrets"], ["about", "About ApmixBot"]];
var PAGE_ICONS = { ...SETTINGS_ICONS, models: SlidersIcon, connectors: ConnectorIcon, capabilities: PlugIcon, schedules: ClockIcon, secrets: KeyIcon, about: InfoIcon };
function SetSection({ title, className = "", children }) {
  return (0, import_react33.createElement)("section", { className: `bt-set-section ${className}`.trim() }, (0, import_react33.createElement)("h3", null, title), (0, import_react33.createElement)("div", { className: "bt-set-card" }, children));
}
function SetRow({ label, hint, children }) {
  return (0, import_react33.createElement)(
    "div",
    { className: "bt-set-row" },
    (0, import_react33.createElement)("div", { className: "bt-set-copy" }, (0, import_react33.createElement)("span", null, label), hint ? (0, import_react33.createElement)("span", { className: "bt-set-hint" }, hint) : null),
    children ? (0, import_react33.createElement)("div", { className: "bt-set-control" }, children) : null
  );
}
function GeneralPage({ roster, actions, run }) {
  const prefs = roster.prefs ?? {};
  const themes = allThemes();
  const current = themes[prefs.theme] ? prefs.theme : DEFAULT_THEME;
  const [custom, setCustom] = (0, import_react33.useState)(prefs.accent ?? themes[current].light.accent);
  const timer = (0, import_react33.useRef)(0);
  (0, import_react33.useEffect)(() => () => clearTimeout(timer.current), []);
  const pickCustom = (value) => {
    setCustom(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => run(actions.setPrefs({ accent: value })), 350);
  };
  return [
    (0, import_react33.createElement)(
      SetSection,
      { key: "look", title: t("Appearance") },
      (0, import_react33.createElement)(
        SetRow,
        { label: t("Theme"), hint: t("Colors for the whole team, on every device.") },
        (0, import_react33.createElement)(
          "select",
          { className: "bt-select", "aria-label": t("Theme"), value: current, onChange: (event) => run(actions.setPrefs({ theme: event.target.value })) },
          Object.entries(themes).map(([id, theme]) => (0, import_react33.createElement)("option", { key: id, value: id }, t(theme.label)))
        )
      ),
      (0, import_react33.createElement)(
        SetRow,
        { label: t("Accent"), hint: t("Unread marks, badges, and the brand mark.") },
        (0, import_react33.createElement)(
          "div",
          { className: "bt-swatches" },
          (0, import_react33.createElement)("button", { type: "button", className: "bt-swatch bt-swatch-default", title: t("Theme accent"), "aria-label": t("Theme accent"), "aria-pressed": !prefs.accent, onClick: () => run(actions.setPrefs({ accent: null })) }),
          ACCENT_INKS.map((ink) => (0, import_react33.createElement)("button", {
            key: ink,
            type: "button",
            className: "bt-swatch",
            title: t(capitalize2(ink)),
            "aria-label": t(capitalize2(ink)),
            "aria-pressed": prefs.accent === INKS[ink][0],
            style: { background: INKS[ink][0] },
            onClick: () => run(actions.setPrefs({ accent: INKS[ink][0] }))
          })),
          (0, import_react33.createElement)(
            "label",
            { className: "bt-swatch bt-swatch-custom", title: t("Custom accent"), "data-on": Boolean(prefs.accent) && !ACCENT_INKS.some((ink) => INKS[ink][0] === prefs.accent) },
            (0, import_react33.createElement)("input", { type: "color", value: custom, "aria-label": t("Custom accent"), onChange: (event) => pickCustom(event.target.value) })
          )
        )
      )
    ),
    actions.setSurface ? (0, import_react33.createElement)(
      SetSection,
      { key: "mode", title: t("Mode") },
      (0, import_react33.createElement)(
        SetRow,
        { label: t("Classic Agent mode") },
        (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => actions.setSurface("agent") }, t("Switch"))
      )
    ) : null,
    (0, import_react33.createElement)(LocationsSection, { key: "places", actions, run })
  ];
}
function LocationsSection({ actions, run }) {
  const app2 = globalThis.apmixbotApp;
  const [team, setTeam] = (0, import_react33.useState)(null);
  const [data, setData] = (0, import_react33.useState)(null);
  const [moving, setMoving] = (0, import_react33.useState)(false);
  const busy = (0, import_react33.useRef)(false);
  (0, import_react33.useEffect)(() => {
    void Promise.resolve(actions.folders()).then((info) => setTeam(info?.team ?? null)).catch(() => {
    });
    if (app2 !== void 0) void Promise.resolve(app2.dataLocation()).then(setData).catch(() => {
    });
  }, []);
  const pickTeam = (path) => {
    if (busy.current) return void 0;
    busy.current = true;
    setMoving(true);
    return run(Promise.resolve(actions.setTeamWorkspace(path)).then((answer) => {
      setTeam(answer.team);
      app2?.teamWorkspaceChanged(answer.team);
    }).finally(() => {
      busy.current = false;
      setMoving(false);
    }));
  };
  return (0, import_react33.createElement)(
    SetSection,
    { title: t("Locations"), className: "bt-set-places" },
    (0, import_react33.createElement)(
      SetRow,
      { label: t("Team workspace"), hint: t("Where Bots without a folder of their own work.") },
      team === null ? null : (0, import_react33.createElement)(FolderMenu, { value: team, team: true, actions, run, onPick: pickTeam, disabled: moving })
    ),
    data === null ? null : (0, import_react33.createElement)(
      SetRow,
      { label: t("Data location"), hint: data.path },
      data.fixed ? null : (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", disabled: moving, onClick: () => {
        if (!busy.current) void run(app2.moveData(team ?? void 0));
      } }, t("Change…"))
    )
  );
}
function MainBotsSection({ roster, actions, run }) {
  const mains = (roster.mainBotIds ?? []).map((id) => roster.byId[id]).filter(Boolean);
  const [first, ...others] = mains;
  const candidates = roster.bots.filter((bot) => !isMainOf(roster, bot.id));
  return (0, import_react33.createElement)(
    SetSection,
    { title: t("Main Bot") },
    (0, import_react33.createElement)(
      SetRow,
      {
        label: t("Main Bot"),
        hint: first ? t("First in the sidebar. Pick another Bot to hand it the role; {name} then stops being a Main Bot.", { name: first.name }) : void 0
      },
      (0, import_react33.createElement)("select", {
        className: "bt-select",
        "aria-label": t("Main Bot"),
        value: first?.id ?? "",
        onChange: (event) => run(actions.setMain(event.target.value, true, first ? { replace: first.id } : {}))
      }, first ? null : (0, import_react33.createElement)("option", { value: "" }, t("Choose a Bot…")), roster.bots.map((bot) => (0, import_react33.createElement)("option", { key: bot.id, value: bot.id }, bot.name)))
    ),
    others.map((bot) => (0, import_react33.createElement)(
      SetRow,
      { key: bot.id, label: bot.name, hint: t("Also a Main Bot.") },
      (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => run(actions.setMain(bot.id, true, { primary: true })) }, t("Move to first")),
      (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm", onClick: () => run(actions.setMain(bot.id, false)) }, t("Remove Main Bot role"))
    )),
    candidates.length > 0 ? (0, import_react33.createElement)(
      SetRow,
      { label: t("Add a Main Bot"), hint: t("Main Bots can create and change Bots, and run every group chat.") },
      (0, import_react33.createElement)("select", {
        className: "bt-select",
        "aria-label": t("Add a Main Bot"),
        value: "",
        onChange: (event) => {
          if (event.target.value) void run(actions.setMain(event.target.value, true));
        }
      }, (0, import_react33.createElement)("option", { value: "" }, t("Choose a Bot…")), candidates.map((bot) => (0, import_react33.createElement)("option", { key: bot.id, value: bot.id }, bot.name)))
    ) : null
  );
}
var MOTIONS = [["quiet", "Quiet"], ["normal", "Normal"], ["lively", "Lively"]];
function MotionSection({ roster, actions, run }) {
  const motion = roster.prefs?.motion === "quiet" || roster.prefs?.motion === "lively" ? roster.prefs.motion : "normal";
  return (0, import_react33.createElement)(
    SetSection,
    { title: t("Animation") },
    (0, import_react33.createElement)(
      SetRow,
      { label: t("Bot animation") },
      (0, import_react33.createElement)(Segmented, { label: t("Bot animation"), value: motion, className: "bt-motion-seg" }, MOTIONS.map(([id, label]) => (0, import_react33.createElement)("button", {
        key: id,
        type: "button",
        "aria-pressed": motion === id,
        onClick: () => {
          if (motion !== id) run(actions.setPrefs({ motion: id }));
        }
      }, t(label))))
    )
  );
}
function BotsPage({ roster, actions, run }) {
  const [creating, setCreating] = (0, import_react33.useState)(false);
  return [
    (0, import_react33.createElement)(MainBotsSection, { key: "main", roster, actions, run }),
    (0, import_react33.createElement)(MotionSection, { key: "motion", roster, actions, run }),
    creating ? (0, import_react33.createElement)(CreateBot, { key: "create", roster, actions, inline: true, onBack: () => setCreating(false), onCreated: (bot) => actions.openSettings("bots", bot.id) }) : (0, import_react33.createElement)(
      "div",
      { key: "new", className: "bt-actions" },
      (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-with-icon", onClick: () => setCreating(true) }, (0, import_react33.createElement)(PlusIcon), t("New Bot"))
    ),
    (0, import_react33.createElement)(
      SetSection,
      { key: "bots", title: t("Bots · {count}", { count: roster.bots.length }) },
      roster.bots.map((bot) => (0, import_react33.createElement)(
        "button",
        { key: bot.id, type: "button", className: "bt-set-row", onClick: () => actions.openSettings("bots", bot.id) },
        (0, import_react33.createElement)(
          "span",
          { className: "bt-set-bot" },
          (0, import_react33.createElement)(BotAvatar, { bot, size: 28, badge: false, live: false }),
          (0, import_react33.createElement)("span", { className: "bt-row-title" }, bot.name),
          bot.role ? (0, import_react33.createElement)("span", { className: "bt-tag" }, bot.role) : null,
          isMainOf(roster, bot.id) ? (0, import_react33.createElement)("span", { className: "bt-tag" }, t("Main Bot")) : null,
          bot.hidden && !isMainOf(roster, bot.id) ? (0, import_react33.createElement)("span", { className: "bt-tag" }, t("Hidden")) : null
        ),
        (0, import_react33.createElement)("span", { className: "bt-chevron" }, (0, import_react33.createElement)(ChevronRightIcon))
      ))
    )
  ];
}
function GroupsPage({ roster, actions, run }) {
  const [creating, setCreating] = (0, import_react33.useState)(false);
  return [
    creating ? (0, import_react33.createElement)(NewGroupForm, { key: "create", roster, actions, run, onCancel: () => setCreating(false), onCreated: (room2) => actions.openSettings("groups", room2.id) }) : (0, import_react33.createElement)(
      "div",
      { key: "new", className: "bt-actions" },
      (0, import_react33.createElement)("button", { type: "button", className: "bt-soft bt-soft-sm bt-with-icon", disabled: roster.bots.length < 2, title: roster.bots.length < 2 ? t("A group chat needs at least two Bots") : void 0, onClick: () => setCreating(true) }, (0, import_react33.createElement)(PlusIcon), t("Create group chat"))
    ),
    (0, import_react33.createElement)(
      SetSection,
      { key: "groups", title: t("Group chats · {count}", { count: roster.rooms.length }) },
      roster.rooms.length === 0 ? (0, import_react33.createElement)(SetRow, { label: t("No group chats yet."), hint: t("A group chat lets several Bots work on one thing with you.") }) : roster.rooms.map((room2) => {
        const admin = roster.byId[room2.admin];
        return (0, import_react33.createElement)(
          "button",
          { key: room2.id, type: "button", className: "bt-set-row", onClick: () => actions.openSettings("groups", room2.id) },
          (0, import_react33.createElement)(
            "span",
            { className: "bt-set-bot" },
            (0, import_react33.createElement)(RoomAvatar, { room: room2, roster, size: 28 }),
            (0, import_react33.createElement)("span", { className: "bt-row-title" }, room2.name),
            (0, import_react33.createElement)("span", { className: "bt-tag" }, t("{count} members", { count: room2.members.length })),
            admin ? (0, import_react33.createElement)("span", { className: "bt-tag bt-tag-admin" }, (0, import_react33.createElement)(AdminStar), admin.name) : null,
            room2.hidden ? (0, import_react33.createElement)("span", { className: "bt-tag" }, t("Hidden")) : null
          ),
          (0, import_react33.createElement)("span", { className: "bt-chevron" }, (0, import_react33.createElement)(ChevronRightIcon))
        );
      })
    )
  ];
}
function SettingsDialog({ page, id, roster, actions, useUpdate, leaving = false }) {
  const [error, setError] = (0, import_react33.useState)("");
  const close = (0, import_react33.useCallback)(() => actions.closeSettings(), []);
  useEscape(close);
  const run = (promise) => Promise.resolve(promise).then(() => {
    setError("");
    return true;
  }).catch((failure) => {
    setError(failure?.message ?? String(failure));
    return false;
  });
  const bot = page === "bots" && id ? roster.byId[id] : void 0;
  const room2 = page === "groups" && id ? roster.roomsById[id] : void 0;
  const pages = SETTINGS_PAGES.filter(([key]) => key !== "models" || actions.providers !== void 0);
  const shown = pages.some(([key]) => key === page) ? page : "general";
  const usageFocus = shown === "usage" && id ? id : null;
  const label = t(pages.find(([key]) => key === shown)[1]);
  const back = bot ? t("Back to Bots") : room2 ? t("Back to group chats") : usageFocus ? t("All usage") : null;
  const nav = useGlide(shown, { axis: "y" });
  const pageKey = `${shown}:${bot?.id ?? room2?.id ?? ""}`;
  const depth = bot || room2 ? 1 : 0;
  const last = (0, import_react33.useRef)({ key: pageKey, depth, move: "up" });
  if (last.current.key !== pageKey) {
    last.current = { key: pageKey, depth, move: depth > last.current.depth ? "in" : depth < last.current.depth ? "out" : "up" };
  }
  const [usageOpened, setUsageOpened] = (0, import_react33.useState)(shown === "usage");
  if (shown === "usage" && !usageOpened) setUsageOpened(true);
  const errorLine = error ? (0, import_react33.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, error) : null;
  return (0, import_react33.createElement)(
    "div",
    { className: "bt-settings-layer", "data-leaving": leaving || void 0 },
    (0, import_react33.createElement)("div", { className: "bt-scrim", onMouseDown: close }),
    (0, import_react33.createElement)(
      "div",
      { className: "bt-settings", role: "dialog", "aria-modal": true, "aria-label": t("ApmixBot settings") },
      (0, import_react33.createElement)(
        "nav",
        { ref: nav.box, className: "bt-settings-nav", "aria-label": t("Settings pages") },
        (0, import_react33.createElement)("span", { ref: nav.thumb, className: "bt-thumb", "aria-hidden": true }),
        pages.map(([key, text]) => (0, import_react33.createElement)("button", {
          key,
          type: "button",
          className: "bt-settings-item",
          "aria-current": shown === key ? "page" : void 0,
          onClick: () => actions.openSettings(key)
        }, (0, import_react33.createElement)(PAGE_ICONS[key]), t(text))),
        actions.openEngineSettings ? (0, import_react33.createElement)("button", {
          type: "button",
          className: "bt-settings-item bt-settings-shell",
          title: t("Models, providers, and the rest of the engine"),
          onClick: () => {
            close();
            actions.openEngineSettings();
          }
        }, (0, import_react33.createElement)(SlidersIcon), t("Engine settings")) : null
      ),
      (0, import_react33.createElement)(
        "div",
        { className: "bt-settings-main" },
        (0, import_react33.createElement)(
          "div",
          { className: "bt-settings-head" },
          back ? (0, import_react33.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": back, title: back, onClick: () => actions.openSettings(shown) }, (0, import_react33.createElement)(ChevronLeftIcon)) : null,
          (0, import_react33.createElement)("h2", { key: bot?.id ?? room2?.id ?? shown }, bot?.name ?? room2?.name ?? label)
        ),
        shown === "usage" ? null : (0, import_react33.createElement)(
          "div",
          { key: pageKey, className: "bt-settings-scroll bt-settings-page", "data-move": last.current.move },
          errorLine,
          shown === "general" ? (0, import_react33.createElement)(GeneralPage, { roster, actions, run }) : null,
          shown === "models" ? (0, import_react33.createElement)(ProvidersPage, { actions, run, Section: SetSection }) : null,
          bot ? (0, import_react33.createElement)("div", { className: "bt-settings-form" }, (0, import_react33.createElement)(BotSettingsForm, { key: bot.id, bot, roster, actions, run })) : null,
          shown === "bots" && !bot ? (0, import_react33.createElement)(BotsPage, { roster, actions, run }) : null,
          room2 ? (0, import_react33.createElement)("div", { className: "bt-settings-form" }, (0, import_react33.createElement)(GroupSettingsForm, { key: room2.id, room: room2, roster, actions, run })) : null,
          shown === "groups" && !room2 ? (0, import_react33.createElement)(GroupsPage, { roster, actions, run }) : null,
          shown === "connectors" ? (0, import_react33.createElement)(ConnectorsPage, { roster, actions }) : null,
          shown === "connectors" ? (0, import_react33.createElement)(AppsPage, { roster, actions, run, Section: SetSection }) : null,
          shown === "capabilities" ? (0, import_react33.createElement)(CapabilitiesPage, { roster, actions, run }) : null,
          shown === "schedules" ? (0, import_react33.createElement)(SchedulesPage, { roster, actions, start: id ?? void 0 }) : null,
          shown === "secrets" ? (0, import_react33.createElement)(SecretsPage, { roster, actions, run, Section: SetSection }) : null,
          shown === "about" ? (0, import_react33.createElement)(AboutPage, { useUpdate, actions, run, Section: SetSection, Row: SetRow }) : null
        ),
        usageOpened ? (0, import_react33.createElement)(
          "div",
          { key: "usage", className: "bt-settings-scroll bt-settings-usage", "data-off": shown === "usage" ? void 0 : "", "aria-hidden": shown === "usage" ? void 0 : true },
          shown === "usage" ? errorLine : null,
          (0, import_react33.createElement)(UsagePage, { roster, actions, focusId: usageFocus })
        ) : null
      ),
      (0, import_react33.createElement)("button", { type: "button", className: "bt-settings-close", "aria-label": t("Close settings"), onClick: close }, (0, import_react33.createElement)(CloseIcon))
    )
  );
}

// src/client/context-menu.js
var import_react34 = require("react");
function ContextMenu({ menu, roster, actions, leaving = false }) {
  useEscape(() => actions.closeMenu());
  (0, import_react34.useEffect)(() => {
    const onDown = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".bt-menu")) actions.closeMenu();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);
  const ref = (0, import_react34.useRef)(null);
  const [place, setPlace] = (0, import_react34.useState)({ left: menu.x, top: menu.y });
  const [confirming, setConfirming] = (0, import_react34.useState)(null);
  (0, import_react34.useLayoutEffect)(() => {
    const box2 = ref.current?.getBoundingClientRect();
    if (!box2) return;
    setPlace({ left: Math.max(8, Math.min(menu.x, window.innerWidth - box2.width - 8)), top: Math.max(8, Math.min(menu.y, window.innerHeight - box2.height - 8)) });
  }, [menu.x, menu.y]);
  if (menu.kind === "agent" || menu.kind === "agent-session") return (0, import_react34.createElement)(AgentMenu, { menu, roster, actions, leaving });
  const bot = roster.byId[menu.id];
  const room2 = roster.roomsById[menu.id];
  const entry = bot ?? room2;
  if (entry === void 0) return null;
  const isMainBot = isMainOf(roster, menu.id);
  const isTile = roster.mainBotId === menu.id;
  const mainCount = (roster.mainBotIds ?? []).length;
  const groups = [
    [
      isTile ? null : [entry.pinned ? t("Unpin") : t("Pin"), PinIcon, () => actions.setFlags(menu.id, { pinned: !entry.pinned })],
      [t("Mark as Unread"), UnreadIcon, () => actions.markUnread(menu.id)]
    ],
    [
      bot ? [t("Rename Bot"), PencilIcon, () => actions.renameBot(bot.id)] : null,
      bot ? [t("Edit Bot"), GearIcon, () => actions.openSettings("bots", bot.id)] : null,
      room2 ? [t("Group settings"), GearIcon, () => actions.openSettings("groups", room2.id)] : null,
      room2 ? [t("Rename group"), PencilIcon, () => actions.renameBot(room2.id)] : null,
      bot ? [t("Duplicate"), DuplicateIcon, async () => {
        const copy = await actions.duplicateBot(bot.id);
        actions.openSession(copy.id);
      }] : null,
      bot && !isMainBot ? [t("Make Main Bot"), StarLineIcon, () => actions.setMain(bot.id, true)] : null,
      bot && isMainBot && mainCount > 1 ? [t("Remove Main Bot role"), StarLineIcon, () => actions.setMain(bot.id, false)] : null
    ],
    [[t("Copy conversation ID"), CopyIcon, () => navigator.clipboard?.writeText(bot ? currentPart(bot) : menu.id)]],
    [
      bot ? [t("Clear conversation"), EraseIcon, async () => {
        await actions.clearChat(bot.id);
        actions.openSession(bot.id);
      }, true, t("Click again to clear")] : null,
      isMainBot ? null : [t("Hide from sidebar"), HideIcon, () => actions.setFlags(menu.id, { hidden: true })],
      isMainBot ? null : [room2 ? t("Delete group") : t("Delete"), TrashIcon, () => bot ? actions.deleteBot(bot.id) : actions.deleteRoom(menu.id), true]
    ]
  ].map((group) => group.filter(Boolean)).filter((group) => group.length > 0);
  return (0, import_react34.createElement)(
    "div",
    { ref, className: "bt-menu", role: "menu", "aria-label": t("{name} actions", { name: bot?.name ?? room2.name }), style: place, "data-leaving": leaving || void 0 },
    groups.map((group, index) => (0, import_react34.createElement)(
      import_react34.Fragment,
      { key: index },
      index > 0 ? (0, import_react34.createElement)("div", { className: "bt-menu-sep", role: "separator" }) : null,
      group.map(([label, Icon, run, danger, again]) => (0, import_react34.createElement)("button", {
        key: label,
        type: "button",
        role: "menuitem",
        className: danger ? "bt-danger" : void 0,
        "data-confirm": again && confirming === label || void 0,
        onClick: () => {
          if (again && confirming !== label) {
            setConfirming(label);
            return;
          }
          actions.closeMenu();
          void Promise.resolve(run()).catch((error) => actions.reportError(error, "menu"));
        }
      }, (0, import_react34.createElement)(Icon), again && confirming === label ? again : label))
    ))
  );
}
function AgentMenu({ menu, roster, actions, leaving }) {
  const ref = (0, import_react34.useRef)(null);
  const [place, setPlace] = (0, import_react34.useState)({ left: menu.x, top: menu.y });
  (0, import_react34.useLayoutEffect)(() => {
    const box2 = ref.current?.getBoundingClientRect();
    if (!box2) return;
    setPlace({ left: Math.max(8, Math.min(menu.x, window.innerWidth - box2.width - 8)), top: Math.max(8, Math.min(menu.y, window.innerHeight - box2.height - 8)) });
  }, [menu.x, menu.y]);
  const agent = roster.agentsById[menu.kind === "agent" ? menu.id : menu.agentId];
  if (agent === void 0) return null;
  const groups = menu.kind === "agent" ? [
    [
      [agent.pinned ? t("Unpin") : t("Pin"), PinIcon, () => actions.setFlags(agent.id, { pinned: !agent.pinned })]
    ],
    [
      [t("Remove Engine Agent"), TrashIcon, () => actions.removeAgent(agent.id), true]
    ]
  ] : [
    [
      [t("Rename"), PencilIcon, () => actions.beginAgentRename(menu.id)]
    ],
    [
      [t("Archive"), TrashIcon, () => actions.archiveAgentSession(agent.id, menu.id), true]
    ]
  ];
  return (0, import_react34.createElement)(
    "div",
    { ref, className: "bt-menu", role: "menu", "aria-label": menu.kind === "agent" ? "Engine Agent" : t("Session actions"), style: place, "data-leaving": leaving || void 0 },
    groups.map((group, index) => (0, import_react34.createElement)(
      import_react34.Fragment,
      { key: index },
      index > 0 ? (0, import_react34.createElement)("div", { className: "bt-menu-sep", role: "separator" }) : null,
      group.map(([label, Icon, run, danger]) => (0, import_react34.createElement)("button", {
        key: label,
        type: "button",
        role: "menuitem",
        className: danger ? "bt-danger" : void 0,
        onClick: () => {
          actions.closeMenu();
          void Promise.resolve(run()).catch((error) => console.warn("[apmixbot]", error));
        }
      }, (0, import_react34.createElement)(Icon), label))
    ))
  );
}

// src/client/member-status.js
var import_react35 = require("react");
var NO_WORK = { bots: {}, rooms: {}, approvals: [] };
var FACES_MAX = 3;
var DOCK_EXIT_MS = 160;
function memberWork(room2, work = NO_WORK) {
  const here = work.rooms?.[room2.id] ?? [];
  return room2.members.map((id) => {
    const approvals = (work.approvals ?? []).filter((entry) => entry.botId === id);
    const local = here.find((entry) => entry.botId === id);
    const doing = local ? { ...local, roomId: room2.id } : work.bots?.[id];
    return { id, approvals, doing, here: local !== void 0, state: approvals.length > 0 ? "ask" : doing ? "work" : "idle" };
  });
}
function busyMembers(room2, work, roster) {
  const busy = memberWork(room2, work).filter((entry) => entry.state !== "idle" && roster.byId[entry.id]);
  return [...busy.filter((entry) => entry.state === "ask"), ...busy.filter((entry) => entry.state === "work")].map((entry) => ({ ...entry, bot: roster.byId[entry.id] }));
}
var dockMembers = (busy) => busy.filter((entry) => !(entry.state === "work" && entry.here && entry.doing.speaking === true));
var workState = (doing) => doing?.switching ? "thinking" : toolState(doing?.tool ?? "");
function botGroupWork(botId, work, roster) {
  return Object.entries(work.rooms ?? {}).flatMap(([roomId, entries2]) => {
    const entry = entries2.find((item) => item.botId === botId);
    const room2 = roster.roomsById[roomId];
    return entry && room2 ? [{ room: room2, doing: entry, since: entry.since }] : [];
  });
}
function summaryText(busy) {
  const asks = busy.filter((entry) => entry.state === "ask");
  const workers = busy.filter((entry) => entry.state === "work");
  const names = asks.slice(0, 2).map((entry) => entry.bot.name);
  const waiting = asks.length === 0 ? "" : asks.length === 1 ? t("{name} is waiting for your approval", { name: names[0] }) : asks.length === 2 ? t("{first} and {second} are waiting for your approval", { first: names[0], second: names[1] }) : t("{first}, {second} and {count} more are waiting for your approval", { first: names[0], second: names[1], count: asks.length - 2, total: asks.length });
  const first = workers[0];
  const doing = first ? `${first.bot.name} · ${workPhrase(first.doing)}…${workers.length > 1 ? ` +${workers.length - 1}` : ""}` : "";
  return { waiting, doing };
}
function dockModel(sessionId, roster, work) {
  const room2 = roster.roomsById[sessionId];
  if (room2) {
    const busy = dockMembers(busyMembers(room2, work, roster));
    if (busy.length === 0) return null;
    const { waiting, doing } = summaryText(busy);
    return {
      open: { details: room2.id },
      faces: busy.slice(0, FACES_MAX).map((entry) => ({ id: entry.id, ask: entry.state === "ask", state: workState(entry.doing) })),
      waiting,
      doing
    };
  }
  const bot = roster.byId[sessionId];
  if (!bot || work.bots?.[bot.id] !== void 0 && work.bots[bot.id].roomId === void 0) return null;
  const groups = botGroupWork(bot.id, work, roster);
  if (groups.length === 0) return null;
  const [first] = groups;
  return {
    open: { session: first.room.id },
    faces: [{ id: bot.id, ask: false, state: workState(first.doing) }],
    waiting: "",
    doing: `${t("in {name}", { name: first.room.name })} · ${workPhrase(first.doing)}…${groups.length > 1 ? ` +${groups.length - 1}` : ""}`
  };
}
function Face({ bot, ask, state }) {
  return (0, import_react35.createElement)(
    "span",
    { className: "bt-mw-face", "data-ask": ask || void 0 },
    (0, import_react35.createElement)(BotMark, { bot, size: 20, state: ask ? "alert" : state })
  );
}
function useFitWidth(inner, key) {
  const [width, setWidth] = (0, import_react35.useState)(null);
  (0, import_react35.useLayoutEffect)(() => {
    setWidth(key && inner.current ? inner.current.offsetWidth : null);
  }, [key]);
  return width;
}
function MemberDock({ sessionId, useRoster, useWork, actions }) {
  const roster = useRoster((value) => value);
  const work = useWork((value) => value);
  const live = dockModel(sessionId, roster, work);
  const [kept, leaving] = useLinger(live ? JSON.stringify(live) : null, DOCK_EXIT_MS);
  const model = kept ? JSON.parse(kept) : null;
  const inner = (0, import_react35.useRef)(null);
  const width = useFitWidth(inner, kept);
  if (!model) return null;
  const faces = model.faces.map((face) => ({ ...face, bot: roster.byId[face.id] })).filter((face) => face.bot);
  const label = [model.waiting, model.doing].filter(Boolean).join(" · ");
  const open = () => model.open.details ? actions.showDetails(model.open.details) : actions.openSession(model.open.session);
  return (0, import_react35.createElement)(
    "div",
    { className: "bt-mw-dock", "data-leaving": leaving || void 0 },
    (0, import_react35.createElement)(
      "button",
      { type: "button", className: "bt-mw-pill", "aria-label": label, onClick: open, disabled: leaving, style: width ? { width } : void 0 },
      (0, import_react35.createElement)(
        "span",
        { ref: inner, className: "bt-mw-pill-in" },
        (0, import_react35.createElement)("span", { className: "bt-mw-faces", "aria-hidden": true }, faces.map((face) => (0, import_react35.createElement)(Face, { key: face.id, ...face }))),
        (0, import_react35.createElement)(
          "span",
          { key: label, className: "bt-mw-label", "aria-hidden": true },
          model.waiting ? (0, import_react35.createElement)("span", { className: "bt-mw-ask" }, model.waiting) : null,
          model.waiting && model.doing ? (0, import_react35.createElement)("span", { className: "bt-mw-dot" }, "·") : null,
          model.doing ? (0, import_react35.createElement)("span", { className: "bt-mw-doing" }, (0, import_react35.createElement)(Shimmer, null, model.doing)) : null
        )
      )
    )
  );
}
var stateLine = (className, at2, ...what) => (0, import_react35.createElement)(
  "span",
  { className },
  (0, import_react35.createElement)("span", { className: "bt-member-what" }, ...what),
  typeof at2 === "number" ? (0, import_react35.createElement)(Elapsed, { at: at2, className: "bt-member-time" }) : null
);
function ApprovalCard({ approval, bot, actions }) {
  const [busy, setBusy] = (0, import_react35.useState)(false);
  const answer = (choice) => {
    setBusy(true);
    void Promise.resolve(actions.answerApproval(approval.id, choice)).catch((error) => actions.reportError(error, "approval")).finally(() => setBusy(false));
  };
  return (0, import_react35.createElement)(
    "div",
    { className: "bt-mw-card", role: "group", "aria-label": t("{name} is waiting for your approval", { name: bot.name }) },
    (0, import_react35.createElement)("div", { className: "bt-mw-tool" }, approval.app ? `${approval.app} · ${approval.tool}` : approval.tool),
    approval.detail?.text ? (0, import_react35.createElement)("div", { className: "bt-mw-text" }, approval.detail.text) : null,
    approval.reason ? (0, import_react35.createElement)("div", { className: "bt-mw-reason" }, approval.reason) : null,
    approval.detail?.code ? (0, import_react35.createElement)("code", { className: "bt-mw-code", title: approval.detail.code }, approval.detail.code) : null,
    approval.answerable ? (0, import_react35.createElement)(
      "div",
      { className: "bt-mw-actions" },
      (0, import_react35.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: () => answer("reject") }, approval.always ? t("Decline") : t("Reject")),
      approval.always ? (0, import_react35.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: () => answer("always") }, t("Always allow")) : null,
      (0, import_react35.createElement)("button", { type: "button", className: "bt-q-submit", disabled: busy, onClick: () => answer("allow") }, t("Allow once"))
    ) : (0, import_react35.createElement)(
      "div",
      { className: "bt-mw-actions" },
      (0, import_react35.createElement)("button", { type: "button", className: "bt-q-btn", onClick: () => actions.openSession(bot.id) }, t("Open {name}'s chat", { name: bot.name }))
    )
  );
}
function MemberState({ entry, bot, room: room2, roster }) {
  if (entry?.state === "ask") return stateLine("bt-member-state bt-mw-ask", entry.approvals[0].at, t("Waiting for your approval"));
  if (entry?.state !== "work") return bot.role ? stateLine("bt-member-state", void 0, bot.role) : null;
  const where = entry.doing.roomId === room2.id ? "" : entry.doing.roomId ? t("in {name}", { name: roster.roomsById[entry.doing.roomId]?.name ?? t("a group chat") }) : t("in its own chat");
  return stateLine("bt-member-state", entry.doing.since, (0, import_react35.createElement)(Shimmer, null, `${workPhrase(entry.doing)}…`), where ? ` ${where}` : "");
}
function StopMemberWork({ entry, bot, room: room2, actions }) {
  const [stopping, setStopping] = (0, import_react35.useState)(false);
  if (!entry?.here || entry.state !== "work" && entry.state !== "ask") return null;
  const stop = () => {
    setStopping(true);
    void Promise.resolve(actions.stopMemberWork(room2.id, bot.id)).catch((error) => actions.reportError(error, "stop")).finally(() => setStopping(false));
  };
  return (0, import_react35.createElement)("button", { type: "button", className: "bt-member-stop", disabled: stopping, "aria-label": `${t("Stop")} · ${bot.name}`, onClick: stop }, t("Stop"));
}
function MemberApprovals({ entry, bot, actions }) {
  if (entry?.state !== "ask") return null;
  return (0, import_react35.createElement)("div", { className: "bt-member-cards" }, entry.approvals.map((approval) => (0, import_react35.createElement)(ApprovalCard, { key: approval.id, approval, bot, actions })));
}
function useMemberWork(room2, useWork) {
  const work = useWork?.((value) => value) ?? NO_WORK;
  return { entries: room2 ? memberWork(room2, work) : [] };
}
var MEMBER_CSS = `
.bt-mw-dock{display:flex;justify-content:center;margin:0 auto 8px;pointer-events:none}
.bt-mw-pill{pointer-events:auto;position:relative;display:inline-flex;align-items:center;flex:none;box-sizing:border-box;height:32px;max-width:100%;padding:0;border:0;border-radius:999px;overflow:hidden;background:var(--bt-main);box-shadow:0 0 0 .5px var(--bt-line-2),0 2px 8px -2px rgba(0,0,0,.12);color:var(--bt-ink-2);font:inherit;font-size:13px;line-height:18px;cursor:pointer;animation:bt-mw-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .18s ease-out backwards;transition:background-color .12s ease,${spring(SPRING_SHAPE, "width")},${spring(SPRING_TAP, "scale")}}
.bt-mw-pill:hover{background:color-mix(in srgb,var(--bt-ink) 4%,var(--bt-main))}
.bt-mw-pill:active{scale:.97}
.bt-mw-dock[data-leaving] .bt-mw-pill{animation:bt-mw-out .16s cubic-bezier(.4,0,1,1) forwards;pointer-events:none}
.bt-mw-pill-in{display:inline-flex;align-items:center;gap:8px;flex:none;padding:0 13px 0 6px;white-space:nowrap}
.bt-mw-faces{display:inline-flex;align-items:center;flex:none;line-height:0}
.bt-mw-face{position:relative;display:inline-flex;flex:none;border-radius:50%;background:var(--bt-main);box-shadow:0 0 0 2px var(--bt-main);animation:bt-mw-seat .26s cubic-bezier(.34,1.56,.64,1) backwards}
.bt-mw-face+.bt-mw-face{margin-left:-5px}
.bt-mw-face[data-ask]::after{content:"";position:absolute;right:-1px;bottom:-1px;width:7px;height:7px;border-radius:50%;background:#e3a008;box-shadow:0 0 0 1.5px var(--bt-main)}
.bt-mw-label{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:min(420px,58vw);animation:bt-mw-swap .22s ease-out backwards}
.bt-mw-label>*{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-mw-ask{color:#b7791f;flex:none}
.bt-mw-dot{flex:none;color:var(--bt-ink-3)}
.bt-mw-doing{flex:0 1 auto}
body[data-ds-dark-theme] .bt-mw-ask{color:#f0b84a}
@keyframes bt-mw-in{from{transform:translateY(8px) scale(.94)}}
@keyframes bt-mw-out{to{opacity:0;transform:translateY(6px) scale(.96);filter:blur(3px)}}
@keyframes bt-mw-seat{from{opacity:0;scale:.6}}
@keyframes bt-mw-swap{from{opacity:0;filter:blur(4px)}}
.bt-members{display:flex;flex-direction:column;gap:2px;margin:0 -8px}
.bt-member{display:flex;flex-direction:column;border-radius:12px;animation:bt-rise .18s ease-out backwards}
.bt-member-row{display:flex;align-items:center;gap:8px;min-height:48px;padding:0 8px;border-radius:12px;transition:background-color .12s ease}
.bt-member-row:hover{background:var(--bt-hover)}
.bt-member-open{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:8px 0;border:0;background:none;color:var(--bt-ink);font:inherit;text-align:left;cursor:pointer}
.bt-member-open>.bt-mark{flex:none}
.bt-member-text{display:flex;flex-direction:column;min-width:0;gap:1px}
.bt-member-line{display:flex;align-items:center;gap:6px;min-width:0}
.bt-member-name{min-width:0;font-size:14px;line-height:20px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bt-member-line>.bt-tag{font-size:11px;line-height:15px;padding:0 5px}
.bt-member-state{display:flex;min-width:0;font-size:12px;line-height:16px;color:var(--bt-ink-3);white-space:nowrap}
.bt-member-what{min-width:0;overflow:hidden;text-overflow:ellipsis}
.bt-member-time{flex:none;margin-left:.3em;font-variant-numeric:tabular-nums}
.bt-member-state.bt-mw-ask{color:#b7791f}
body[data-ds-dark-theme] .bt-member-state.bt-mw-ask{color:#f0b84a}
.bt-member-stop{flex:none;height:26px;padding:0 11px;border:0;border-radius:13px;background:var(--bt-main);box-shadow:inset 0 0 0 .5px var(--bt-line-2);color:var(--bt-ink-2);font:inherit;font-size:12px;cursor:pointer;transition:background-color .12s ease,color .12s ease,${spring(SPRING_TAP, "scale")}}
.bt-member-stop:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-member-stop:active:not(:disabled){scale:.94}
.bt-member-stop:disabled{opacity:.5;cursor:default}
.bt-member-cards{display:flex;flex-direction:column;gap:6px;padding:2px 8px 8px 50px}
.bt-mw-card{display:flex;flex-direction:column;gap:4px;padding:10px 12px;border-radius:12px;background:var(--bt-hover);font-size:12px;line-height:17px;color:var(--bt-ink-2);animation:bt-rise .2s ease-out backwards}
.bt-mw-tool{font-weight:600;color:var(--bt-ink)}
.bt-mw-text{color:var(--bt-ink);overflow-wrap:anywhere}
.bt-mw-reason{overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.bt-mw-code{display:block;padding:4px 8px;border-radius:6px;background:var(--bt-main);font:11px/16px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--bt-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-mw-actions{display:flex;justify-content:flex-end;gap:6px;margin-top:4px}
.bt-mw-actions>button{height:28px;padding:0 12px;font-size:12px}
.bt-mw-actions>button:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){.bt-mw-pill,.bt-mw-face,.bt-mw-label,.bt-member,.bt-mw-card{animation:none}.bt-mw-pill{transition:background-color .12s ease}}
`;

// src/client/details-drawer.js
var import_react36 = require("react");
function transcriptOf(list, id, name, hiddenTurns = []) {
  const outline = list.projectionsBySession?.[id]?.values?.turnOutline ?? list.byId[id]?.projectionValues?.turnOutline;
  if (!Array.isArray(outline)) return "";
  const lines = [];
  for (const entry of outline) {
    if (hiddenTurns.includes(entry.turn)) continue;
    if (entry.prompt && !HEADER.test(entry.prompt)) lines.push(`**${t("You")}:** ${entry.prompt.trim()}`);
    if (entry.response) lines.push(`**${name}:** ${stripHeader(entry.response).trim()}`);
  }
  return lines.join("\n\n");
}
var TAB_LABELS = { details: "Details", browser: "Browser" };
var hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};
var shortUrl = (url) => String(url ?? "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
var EMPTY_TABS = { ids: [], active: null };
function PermissionRow({ bot, roster, actions, run }) {
  const catalog = roster.permissions;
  if (!catalog?.options?.length) return null;
  return (0, import_react36.createElement)(
    "div",
    { className: "bt-drawer-permission" },
    (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Permissions")),
    // A Bot without its own preset may run on another one set in the engine, so its first pick always applies.
    (0, import_react36.createElement)(PermissionPicker, { catalog, saved: bot.permission ?? catalog.defaultPreset, repick: bot.permission === void 0, onPick: (permission) => run(actions.updateBot(bot.id, { permission })) })
  );
}
function RunStats({ bot, part, running, actions }) {
  const [values, setValues] = (0, import_react36.useState)(null);
  (0, import_react36.useEffect)(() => {
    if (!actions.runStats) return void 0;
    let current = true;
    actions.runStats(bot.id).then(
      (next) => {
        if (current) setValues(next);
      },
      // The line stays as it was until the next read works.
      () => {
      }
    );
    return () => {
      current = false;
    };
  }, [bot.id, part, running]);
  const shown = runStatsOf(values);
  if (shown.length === 0) return null;
  return (0, import_react36.createElement)(
    "div",
    { className: "bt-run-stats" },
    shown.map((entry, index) => (0, import_react36.createElement)(
      import_react36.Fragment,
      { key: entry.key },
      index > 0 ? (0, import_react36.createElement)("span", { className: "bt-run-sep", "aria-hidden": true }, "·") : null,
      (0, import_react36.createElement)("span", { title: entry.title }, entry.text)
    ))
  );
}
function BrowserCards({ bot, sessionId, roster, actions, useBrowserTabs, useBrowserPages }) {
  const state = useBrowserTabs((map) => map[bot.id] ?? EMPTY_TABS);
  const pages = useBrowserPages((map) => map);
  (0, import_react36.useEffect)(() => {
    actions.browserEnsure?.(bot.id);
  }, [bot.id]);
  if (roster.browser !== true || !actions.browserShow) {
    return (0, import_react36.createElement)("div", { className: "bt-muted" }, t("The browser needs a desktop shell with a browser panel."));
  }
  if (state.ids.length === 0) {
    return (0, import_react36.createElement)(
      "div",
      { className: "bt-browser-empty-mark" },
      (0, import_react36.createElement)(BotMark, { bot, size: 40, state: "idle", live: true }),
      (0, import_react36.createElement)("div", { className: "bt-browser-empty-title" }, t("{name}'s browser", { name: bot.name })),
      (0, import_react36.createElement)("div", { className: "bt-muted" }, t("Open a page here and {name} can read it with you. Logins and cookies stay with {name}; other Bots never see them.", { name: bot.name })),
      (0, import_react36.createElement)("button", { type: "button", className: "bt-browser-retry", onClick: () => actions.openBrowser(sessionId) }, t("Open browser"))
    );
  }
  return (0, import_react36.createElement)(
    "div",
    { className: "bt-bcards" },
    state.ids.map((tabId, index) => {
      const page = pages[tabId] ?? {};
      const label = page.title || shortUrl(page.url) || t("New tab");
      return (0, import_react36.createElement)(
        "div",
        { key: tabId, className: "bt-bcard", "data-active": state.active === tabId || void 0, style: { animationDelay: `${index * 30}ms` } },
        (0, import_react36.createElement)(
          "button",
          { type: "button", className: "bt-bcard-shot", "aria-label": t("Open {title}", { title: label }), title: page.url, onClick: () => actions.browserPick(sessionId, tabId) },
          page.excerpt ? (0, import_react36.createElement)(
            "span",
            { className: "bt-bcard-preview" },
            (0, import_react36.createElement)("span", { className: "bt-bcard-ptitle" }, label),
            (0, import_react36.createElement)("span", { className: "bt-bcard-excerpt" }, page.excerpt)
          ) : (0, import_react36.createElement)("span", { className: "bt-bcard-blank" }, (0, import_react36.createElement)(GlobeIcon), (0, import_react36.createElement)("span", null, label))
        ),
        (0, import_react36.createElement)("button", {
          type: "button",
          className: "bt-bcard-x",
          "aria-label": t("Close tab"),
          title: t("Close tab"),
          onClick: () => {
            void actions.browserCloseTab(bot.id, tabId);
          }
        }, "×"),
        (0, import_react36.createElement)(
          "div",
          { className: "bt-bcard-row" },
          (0, import_react36.createElement)(Favicon, { src: page.favicon, className: "bt-bcard-fav" }),
          (0, import_react36.createElement)("span", { className: "bt-bcard-title" }, label),
          page.url ? (0, import_react36.createElement)("span", { className: "bt-bcard-host" }, hostOf(page.url)) : null
        )
      );
    }),
    (0, import_react36.createElement)("button", { type: "button", className: "bt-bcard-new", style: { animationDelay: `${state.ids.length * 30}ms` }, onClick: () => actions.browserNewTab(sessionId) }, (0, import_react36.createElement)(PlusIcon), t("New tab"))
  );
}
function About({ text, title = "About" }) {
  const [open, setOpen] = (0, import_react36.useState)(false);
  const long = text.split("\n").length > 5 || text.length > 240;
  const body = (0, import_react36.useRef)(null);
  useMorph(body, open);
  return (0, import_react36.createElement)(
    "div",
    null,
    (0, import_react36.createElement)("div", { className: "bt-section-title" }, t(title)),
    (0, import_react36.createElement)("div", { ref: body, className: "bt-about", "data-open": open || void 0 }, text),
    long ? (0, import_react36.createElement)("button", { type: "button", className: "bt-more", onClick: () => setOpen((value) => !value) }, open ? t("Show less") : t("Show more")) : null
  );
}
var PILE_MAX = 4;
function MemberPile({ room: room2, roster }) {
  const members = room2.members.map((id) => roster.byId[id]).filter(Boolean);
  const shown = members.length > PILE_MAX ? members.slice(0, PILE_MAX - 1) : members;
  const more = members.length - shown.length;
  return (0, import_react36.createElement)(
    "span",
    { className: "bt-pile", "aria-hidden": true },
    shown.map((bot, index) => (0, import_react36.createElement)("span", { key: bot.id, className: "bt-pile-face", style: { animationDelay: `${index * 40}ms` } }, (0, import_react36.createElement)(BotMark, { bot, size: 44, live: true }))),
    more > 0 ? (0, import_react36.createElement)("span", { key: "more", className: "bt-pile-face bt-pile-more", style: { animationDelay: `${shown.length * 40}ms` } }, `+${more}`) : null
  );
}
var markOf = (entry) => entry?.state === "ask" ? "alert" : entry?.state === "work" ? workState(entry.doing) : "idle";
function MemberRow({ member, entry, room: room2, roster, actions }) {
  return (0, import_react36.createElement)(
    "div",
    { role: "listitem", className: "bt-member" },
    (0, import_react36.createElement)(
      "div",
      { className: "bt-member-row" },
      (0, import_react36.createElement)(
        "button",
        { type: "button", className: "bt-member-open", title: t("Open {name}'s chat", { name: member.name }), onClick: () => actions.openSession(member.id) },
        (0, import_react36.createElement)(BotMark, { bot: member, size: 32, state: markOf(entry) }),
        (0, import_react36.createElement)(
          "span",
          { className: "bt-member-text" },
          (0, import_react36.createElement)(
            "span",
            { className: "bt-member-line" },
            (0, import_react36.createElement)("span", { className: "bt-member-name" }, member.name),
            room2.admin === member.id ? (0, import_react36.createElement)("span", { className: "bt-tag" }, t("Admin")) : null
          ),
          (0, import_react36.createElement)(MemberState, { entry, bot: member, room: room2, roster })
        )
      ),
      (0, import_react36.createElement)(StopMemberWork, { entry, bot: member, room: room2, actions })
    ),
    (0, import_react36.createElement)(MemberApprovals, { entry, bot: member, actions })
  );
}
function GroupOverview({ room: room2, roster, actions, usage, useWork, openSettings }) {
  const members = room2.members.map((id) => roster.byId[id]).filter(Boolean);
  const { entries: entries2 } = useMemberWork(room2, useWork);
  return [
    room2.notice ? (0, import_react36.createElement)(About, { key: "notice", title: "Notice", text: room2.notice }) : (0, import_react36.createElement)("button", { key: "notice", type: "button", className: "bt-more", onClick: openSettings }, t("Add a notice in group settings")),
    (0, import_react36.createElement)(
      "div",
      { key: "members" },
      (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Members · {count}", { count: members.length })),
      (0, import_react36.createElement)("div", { className: "bt-members", role: "list" }, members.map((member) => (0, import_react36.createElement)(MemberRow, {
        key: member.id,
        member,
        entry: entries2.find((item) => item.id === member.id),
        room: room2,
        roster,
        actions
      })))
    ),
    (0, import_react36.createElement)(
      "div",
      { key: "mode" },
      (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Who answers")),
      (0, import_react36.createElement)("div", { className: "bt-kv" }, (0, import_react36.createElement)("span", null, t(ROOM_MODES.find(([id]) => id === shownMode(room2, roster))?.[1] ?? "Everyone")))
    ),
    room2.permission ? (0, import_react36.createElement)(
      "div",
      { key: "permission" },
      (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Permissions")),
      (0, import_react36.createElement)("div", { className: "bt-kv" }, (0, import_react36.createElement)("span", { className: presetDanger(room2.permission) ? "bt-perm-danger" : void 0 }, presetName(room2.permission, roster.permissions)))
    ) : null,
    roster.memory === false ? null : (0, import_react36.createElement)(MemoryRow, { key: "memory", owner: { id: room2.id, name: room2.name, group: true }, actions }),
    usage ? (0, import_react36.createElement)(
      "div",
      { key: "usage" },
      (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Usage")),
      (0, import_react36.createElement)("div", { className: "bt-kv" }, (0, import_react36.createElement)("span", null, room2.name), (0, import_react36.createElement)("span", null, usage))
    ) : null
  ];
}
function DetailsDrawer({ sessionId, startRenaming, startTab, hasStrip, roster, actions, useSessions, useSessionStatus, useActivity, useWork, useBrowserTabs, useBrowserPages }) {
  const owner = roster.byId[sessionId];
  const part = owner ? currentPart(owner) : sessionId;
  const isMainBot = isMainOf(roster, owner?.id);
  const [tab, setTab] = (0, import_react36.useState)("details");
  const room2 = roster.roomsById[sessionId];
  const [view, setView] = (0, import_react36.useState)(startTab === "settings" && (owner || room2) ? "settings" : "overview");
  const [editing, setEditing] = (0, import_react36.useState)(Boolean(startRenaming && (roster.byId[sessionId] || roster.roomsById[sessionId])));
  const [draftName, setDraftName] = (0, import_react36.useState)(roster.byId[sessionId]?.name ?? (roster.roomsById[sessionId]?.named ? roster.roomsById[sessionId].name : ""));
  const [copied, setCopied] = (0, import_react36.useState)(false);
  const [error, setError] = (0, import_react36.useState)("");
  const glide = useGlide(tab);
  const last = (0, import_react36.useRef)({ view, tab, move: void 0 });
  if (last.current.view !== view) last.current = { view, tab, move: view === "settings" ? "in" : "out" };
  else if (last.current.tab !== tab) last.current = { view, tab, move: "tab" };
  const move = last.current.move;
  const side = move === "tab" ? void 0 : move;
  const close = () => actions.closeOverlay();
  useEscape(close, { base: true });
  const bot = owner;
  const running = useSessionStatus((map) => map.get(part)?.running === true);
  const doing = useActivity((map) => map[bot?.id ?? sessionId]);
  const transcript = useSessions((list) => transcriptOf(list, part, bot?.name ?? room2?.name ?? t("Bot"), roster.exchangeTurns[part]));
  const usage = useSessions((list) => usageOf(list, [part, ...bot?.parts ?? room2?.parts ?? []]));
  const run = (promise) => Promise.resolve(promise).then(() => {
    setError("");
    return true;
  }).catch((failure) => {
    setError(failure?.message ?? String(failure));
    return false;
  });
  const share = () => {
    void navigator.clipboard?.writeText(transcript).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };
  const errorLine = error ? (0, import_react36.createElement)("div", { className: "bt-error", role: "alert", style: { padding: 0 } }, error) : null;
  if ((bot || room2) && view === "settings") {
    return [
      (0, import_react36.createElement)(
        "div",
        { key: "head", className: "bt-subhead", "data-move": move },
        (0, import_react36.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Back to details"), onClick: () => setView("overview") }, (0, import_react36.createElement)(ChevronLeftIcon)),
        (0, import_react36.createElement)("span", { className: "bt-subhead-title" }, bot ? t("Settings") : t("Group settings")),
        hasStrip ? null : (0, import_react36.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Close details"), onClick: close }, (0, import_react36.createElement)(CloseIcon))
      ),
      (0, import_react36.createElement)(
        "div",
        { key: "set-body", className: "bt-drawer-body bt-set-body", "data-move": move },
        errorLine,
        bot ? (0, import_react36.createElement)(BotSettingsForm, { bot, roster, actions, run }) : (0, import_react36.createElement)(GroupSettingsForm, { room: room2, roster, actions, run, onDeleted: close })
      )
    ];
  }
  const top = (0, import_react36.createElement)(
    "div",
    { className: "bt-drawer-top", "data-move": side },
    bot || room2 ? (0, import_react36.createElement)("button", { type: "button", className: "bt-round", "aria-label": bot ? t("Edit Bot") : t("Group settings"), title: bot ? t("Edit Bot") : t("Group settings"), "data-info-row": "settings", onClick: () => setView("settings") }, (0, import_react36.createElement)(GearIcon)) : null,
    bot && roster.browser === true && actions.openBrowser ? (0, import_react36.createElement)("button", { type: "button", className: "bt-round", "aria-label": t("Open browser"), title: t("Open this Bot's browser"), onClick: () => actions.openBrowser(sessionId) }, (0, import_react36.createElement)(GlobeIcon)) : null,
    bot || room2 ? (0, import_react36.createElement)("button", { type: "button", className: "bt-round", "aria-label": copied ? t("Copied conversation") : t("Share conversation"), title: copied ? t("Copied") : t("Copy conversation as Markdown"), onClick: share }, copied ? (0, import_react36.createElement)("span", { key: "copied", className: "bt-pop-in" }, "✓") : (0, import_react36.createElement)(ShareIcon)) : null,
    hasStrip ? null : (0, import_react36.createElement)("button", { type: "button", className: "bt-round", "aria-label": t("Close details"), onClick: close }, (0, import_react36.createElement)(CloseIcon))
  );
  if (!bot && !room2) {
    return [
      (0, import_react36.createElement)(import_react36.Fragment, { key: "top" }, top),
      (0, import_react36.createElement)("div", { key: "body", className: "bt-drawer-body" }, (0, import_react36.createElement)("div", { className: "bt-muted" }, t("This conversation is not part of your Bot team.")))
    ];
  }
  const current = bot?.name ?? room2.name;
  const saveName = async () => {
    setEditing(false);
    const next = draftName.trim();
    if (next === current || room2 && !room2.named && next === "") return;
    if (bot && next) await run(actions.updateBot(bot.id, { name: next }));
    if (room2) await run(actions.updateRoom(room2.id, { name: next }));
  };
  const subtitle = bot ? bot.role : roomSubtitle(room2, roster);
  const tabs = bot ? ["details", "browser"] : ["details"];
  return [
    (0, import_react36.createElement)(import_react36.Fragment, { key: "top" }, top),
    (0, import_react36.createElement)(
      "div",
      { key: "id", className: "bt-drawer-id", "data-move": side },
      bot ? (0, import_react36.createElement)(BotAvatar, { bot, size: 64, state: botState(running, doing, roster.questions?.[part] !== void 0), main: isMainBot, badge: false, gaze: true, pokeable: true }) : (0, import_react36.createElement)(MemberPile, { room: room2, roster }),
      editing ? (0, import_react36.createElement)("input", {
        className: "bt-drawer-name-input",
        autoFocus: true,
        value: draftName,
        "aria-label": bot ? t("Bot name") : t("Group name"),
        placeholder: room2 ? t("Name after members") : void 0,
        onChange: (event) => setDraftName(event.target.value),
        onBlur: saveName,
        onKeyDown: (event) => {
          if (event.key === "Enter") void saveName();
          if (event.key === "Escape") {
            event.stopPropagation();
            setEditing(false);
          }
        }
      }) : (0, import_react36.createElement)("button", { type: "button", className: "bt-drawer-name", "aria-label": t("Rename {name}", { name: current }), title: t("Rename"), onClick: () => {
        setDraftName(room2 && !room2.named ? "" : current);
        setEditing(true);
      } }, current),
      subtitle ? (0, import_react36.createElement)("span", { className: "bt-drawer-role" }, subtitle) : null
    ),
    tabs.length > 1 ? (0, import_react36.createElement)(
      "div",
      { key: "tabs", ref: glide.box, className: "bt-tabs", role: "tablist", "data-move": side },
      (0, import_react36.createElement)("span", { ref: glide.thumb, className: "bt-thumb", "aria-hidden": true }),
      tabs.map((key) => (0, import_react36.createElement)("button", { key, type: "button", role: "tab", className: "bt-tab", "aria-selected": tab === key, onClick: () => setTab(key) }, t(TAB_LABELS[key])))
    ) : null,
    (0, import_react36.createElement)(
      "div",
      { key: `body:${tab}`, className: "bt-drawer-body", "data-move": move },
      errorLine,
      room2 && tab === "details" ? (0, import_react36.createElement)(GroupOverview, { room: room2, roster, actions, usage, useWork, openSettings: () => setView("settings") }) : null,
      bot && tab === "details" ? [
        (0, import_react36.createElement)(RunStats, { key: "stats", bot, part, running, actions }),
        (0, import_react36.createElement)(
          "div",
          { key: "model", className: "bt-drawer-model" },
          (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Model")),
          (0, import_react36.createElement)(ModelMenu, { bot, roster, actions, run, wide: true }),
          modelOf(bot, roster) ? null : (0, import_react36.createElement)("div", { className: "bt-note" }, t("Pick a model and {name} can start.", { name: bot.name }))
        ),
        (0, import_react36.createElement)(PermissionRow, { key: "permission", bot, roster, actions, run }),
        (0, import_react36.createElement)(
          "div",
          { key: "folder", className: "bt-drawer-model" },
          (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Working folder")),
          (0, import_react36.createElement)(FolderMenu, { value: bot.workDir, actions, run, wide: true, onPick: (workDir) => run(actions.updateBot(bot.id, { workDir })) })
        ),
        bot.instructions ? (0, import_react36.createElement)(About, { key: "about", text: bot.instructions }) : (0, import_react36.createElement)("button", { key: "about", type: "button", className: "bt-more", onClick: () => setView("settings") }, t("Add instructions in Bot settings")),
        roster.memory === false ? null : (0, import_react36.createElement)(MemoryRow, { key: "memory", owner: { id: bot.id, name: bot.name }, actions }),
        usage ? (0, import_react36.createElement)(
          "div",
          { key: "usage" },
          (0, import_react36.createElement)("div", { className: "bt-section-title" }, t("Usage")),
          (0, import_react36.createElement)("div", { className: "bt-kv" }, (0, import_react36.createElement)("span", null, bot.name), (0, import_react36.createElement)("span", null, usage))
        ) : null,
        (0, import_react36.createElement)(ScheduleSummary, { key: "routines", bot, actions })
      ] : null,
      bot && tab === "browser" ? (0, import_react36.createElement)(BrowserCards, { bot, sessionId, roster, actions, useBrowserTabs, useBrowserPages }) : null
    )
  ];
}

// src/client/browser-pane.js
var import_react37 = require("react");
var import_react_dom8 = require("react-dom");
var PANEL_LINGER_MS = 300;
var WIDTH_KEY = STORAGE.browserWidth;
var DEFAULT_WIDTH = 520;
var DETAILS_WIDTH = 320;
var DETAILS_MAX = 520;
var MIN_WIDTH = 360;
var MIN_CHAT = 420;
var READ_FLASH_MS = 2400;
var EMPTY_PAGE = { url: "", title: "", favicon: null, loading: false, canGoBack: false, canGoForward: false, error: null, excerpt: "" };
var EMPTY_TABS2 = { ids: [], active: null };
var SPRING_LEAD2 = springEasing(576, 39.4);
var SPRING_TRAIL2 = springEasing(144, 19.7);
var icon = (paths) => function BrowserIcon() {
  return (0, import_react37.createElement)(
    "svg",
    { width: 16, height: 16, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
    paths.map((d, index) => (0, import_react37.createElement)("path", { key: index, d }))
  );
};
var GlobeIcon = icon(["M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14z", "M3 10h14", "M10 3c2 2.2 2.9 4.5 2.9 7S12 14.8 10 17c-2-2.2-2.9-4.5-2.9-7S8 5.2 10 3z"]);
var BackIcon = icon(["M12.5 4.5L7 10l5.5 5.5"]);
var ForwardIcon = icon(["M7.5 4.5L13 10l-5.5 5.5"]);
var ReloadIcon = icon(["M15.5 10a5.5 5.5 0 1 1-1.6-3.9", "M15.5 3.5v3.5H12"]);
var StopIcon = icon(["M5.5 5.5l9 9M14.5 5.5l-9 9"]);
var CloseIcon2 = icon(["M5.5 5.5l9 9M14.5 5.5l-9 9"]);
var PlusTabIcon = icon(["M10 5v10M5 10h10"]);
var LockIcon2 = icon(["M6.5 9V7a3.5 3.5 0 0 1 7 0v2", "M5.5 9h9v7h-9z"]);
function Favicon({ src, className }) {
  const [failed, setFailed] = (0, import_react37.useState)(null);
  if (!src || failed === src) return (0, import_react37.createElement)("span", { className: `${className} bt-ptab-globe` }, (0, import_react37.createElement)(GlobeIcon));
  return (0, import_react37.createElement)("img", { className, src, alt: "", "aria-hidden": true, onError: () => setFailed(src) });
}
var savedWidth = () => {
  try {
    const value = Number(localStorage.getItem(WIDTH_KEY));
    return Number.isFinite(value) && value >= DETAILS_WIDTH ? value : null;
  } catch {
    return null;
  }
};
var widthRange = (view, viewport) => view === "browser" ? [MIN_WIDTH, viewport - MIN_CHAT] : [DETAILS_WIDTH, Math.min(DETAILS_MAX, viewport - MIN_CHAT)];
var fitWidth = (width, [low, high]) => Math.round(Math.max(low, Math.min(width, high)));
var room = { rule: null, selector: "" };
var roomRule = () => {
  const live = room.rule?.parentStyleSheet?.ownerNode?.isConnected;
  if (live && room.selector) return room.rule;
  const column = document.querySelector('[class*="_centerCol"]');
  const selector = column ? [...column.classList].filter((name) => name.includes("_centerCol")).map((name) => `.${CSS.escape(name)}`).join(",") : "";
  if (live && !selector) return room.rule;
  const declarations2 = room.rule?.style.cssText ?? "";
  room.rule?.parentStyleSheet?.ownerNode?.remove();
  const style = installStyles(`${selector || '[class*="_centerCol"]'}{${declarations2}}`, "chat-room");
  room.rule = style.sheet.cssRules[0];
  room.selector = selector;
  return room.rule;
};
var roomHold = 0;
var chatRoom = {
  /** The column's right margin in px, or null for the shell's own. */
  set(width) {
    const { style } = roomRule();
    if (width === null) style.removeProperty("margin-right");
    else style.setProperty("margin-right", `${width}px`, "important");
  },
  /** While on, a margin change lands at once instead of gliding. */
  hold(on) {
    cancelAnimationFrame(roomHold);
    if (on) {
      roomRule().style.setProperty("transition", "none", "important");
      return;
    }
    roomHold = requestAnimationFrame(() => {
      roomHold = requestAnimationFrame(() => roomRule().style.removeProperty("transition"));
    });
  },
  /** The columns themselves, for a drag's per-frame writes. */
  columns() {
    roomRule();
    return room.selector ? [...document.querySelectorAll(room.selector)] : [];
  }
};
var shortAddress = (url) => String(url ?? "").replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");
var reducedMotion2 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
var tabLabel = (page) => page.title || shortAddress(page.url) || t("New tab");
function PanelStrip({ bot, subject, view, ids, active, reading, onView, actions, useBrowserPages }) {
  const pages = useBrowserPages((map) => map);
  const wrap = (0, import_react37.useRef)(null);
  const ind = (0, import_react37.useRef)(null);
  const spot = (0, import_react37.useRef)(null);
  const under = (0, import_react37.useRef)(null);
  (0, import_react37.useLayoutEffect)(() => {
    const box2 = wrap.current;
    const capsule = ind.current;
    if (!box2 || !capsule) return void 0;
    const node = view === "details" ? box2.querySelector(".bt-ptab-bot") : box2.querySelector(`[data-tab="${active}"]`);
    under.current = node;
    if (!node) {
      capsule.style.opacity = "0";
      spot.current = null;
      return void 0;
    }
    if (view === "details") box2.scrollLeft = 0;
    else node.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    const to = { left: node.offsetLeft, right: box2.offsetWidth - node.offsetLeft - node.offsetWidth };
    const from = spot.current;
    spot.current = to;
    capsule.style.opacity = "1";
    capsule.style.left = `${to.left}px`;
    capsule.style.right = `${to.right}px`;
    if (from === null || from.left === to.left && from.right === to.right || reducedMotion2()) return void 0;
    const ahead = to.left > from.left ? "right" : "left";
    const behind = ahead === "right" ? "left" : "right";
    const lead = capsule.animate([{ [ahead]: `${from[ahead]}px` }, { [ahead]: `${to[ahead]}px` }], { duration: SPRING_LEAD2.duration, easing: SPRING_LEAD2.easing });
    const trail = capsule.animate([{ [behind]: `${from[behind]}px` }, { [behind]: `${to[behind]}px` }], { duration: SPRING_TRAIL2.duration, easing: SPRING_TRAIL2.easing });
    return () => {
      lead.cancel();
      trail.cancel();
    };
  });
  (0, import_react37.useEffect)(() => {
    const box2 = wrap.current;
    if (!box2) return void 0;
    const observer = new ResizeObserver(() => {
      const node = under.current;
      const capsule = ind.current;
      if (!node?.isConnected || !capsule || spot.current === null) return;
      spot.current = { left: node.offsetLeft, right: box2.offsetWidth - node.offsetLeft - node.offsetWidth };
      capsule.style.left = `${spot.current.left}px`;
      capsule.style.right = `${spot.current.right}px`;
    });
    observer.observe(box2);
    return () => observer.disconnect();
  }, []);
  return (0, import_react37.createElement)(
    "div",
    { className: "bt-ptabs", role: "tablist", "aria-label": t("Panel tabs") },
    (0, import_react37.createElement)(
      "div",
      { className: "bt-ptabs-in", ref: wrap },
      (0, import_react37.createElement)(
        "button",
        {
          type: "button",
          role: "tab",
          "aria-selected": view === "details",
          className: "bt-ptab bt-ptab-bot",
          title: bot.name,
          onClick: () => onView("details")
        },
        (0, import_react37.createElement)(BotMark, { bot, size: 20, state: reading ? "searching" : "idle" }),
        view === "details" ? (0, import_react37.createElement)("span", { className: "bt-ptab-name" }, bot.name) : null
      ),
      ids.map((tabId) => {
        const page = pages[tabId] ?? EMPTY_PAGE;
        const on = view === "browser" && tabId === active;
        return (0, import_react37.createElement)(
          "button",
          {
            key: tabId,
            type: "button",
            role: "tab",
            "aria-selected": on,
            "data-tab": tabId,
            className: "bt-ptab",
            title: page.url || t("New tab"),
            onClick: () => {
              actions.browserActivate(bot.id, tabId);
              onView("browser");
            },
            onAuxClick: (event) => {
              if (event.button === 1) {
                event.preventDefault();
                void actions.browserCloseTab(bot.id, tabId);
              }
            }
          },
          (0, import_react37.createElement)(Favicon, { src: page.favicon, className: "bt-ptab-fav" }),
          (0, import_react37.createElement)("span", { className: "bt-ptab-title" }, tabLabel(page)),
          (0, import_react37.createElement)("span", {
            className: "bt-ptab-x",
            role: "button",
            "aria-label": t("Close tab"),
            title: t("Close tab"),
            onClick: (event) => {
              event.stopPropagation();
              void actions.browserCloseTab(bot.id, tabId);
            }
          }, "×")
        );
      }),
      (0, import_react37.createElement)("span", { ref: ind, className: "bt-ptab-ind", "aria-hidden": true })
    ),
    // New tab and Close stay outside the scrolling tabs, so a narrow panel keeps both.
    (0, import_react37.createElement)("button", { type: "button", className: "bt-ptab-new", "aria-label": t("New tab"), title: t("New tab"), onClick: () => actions.browserNewTab(subject) }, (0, import_react37.createElement)(PlusTabIcon)),
    (0, import_react37.createElement)("button", { type: "button", className: "bt-icon-btn bt-ptab-close", "aria-label": t("Close panel"), title: t("Close panel"), onClick: () => actions.closePanel() }, (0, import_react37.createElement)(CloseIcon2))
  );
}
function BrowserView({ bot, tabId, leaving, landed, actions, useBrowserPages }) {
  const page = useBrowserPages((pages) => pages[tabId ?? ""]) ?? EMPTY_PAGE;
  const frame = (0, import_react37.useRef)(null);
  const input = (0, import_react37.useRef)(null);
  const [draft, setDraft] = (0, import_react37.useState)(null);
  const showGuest = landed && !leaving && Boolean(page.url) && !page.error;
  (0, import_react37.useLayoutEffect)(() => {
    const element = frame.current;
    if (!element || leaving || !tabId) {
      void actions.browserShow(null);
      return void 0;
    }
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      const box2 = element.getBoundingClientRect();
      void actions.browserShow(tabId, showGuest ? { left: box2.left, top: box2.top, width: box2.width, height: box2.height } : null);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, [tabId, showGuest, leaving]);
  (0, import_react37.useEffect)(() => {
    setDraft(null);
    if (landed && !page.url) input.current?.focus();
  }, [tabId, landed]);
  const go = (event) => {
    event.preventDefault();
    const text = draft ?? "";
    if (text.trim() === "") return;
    setDraft(null);
    input.current?.blur();
    void actions.browserNavigate(tabId, text).then((opened) => {
      if (opened) actions.browserFocus(tabId);
    });
  };
  const editing = draft !== null;
  const secure = /^https:/i.test(page.url);
  return (0, import_react37.createElement)(
    "div",
    { className: "bt-panel-view bt-panel-browser", "aria-label": t("{name}'s browser", { name: bot.name }) },
    (0, import_react37.createElement)(
      "div",
      { className: "bt-browser-bar" },
      (0, import_react37.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Back"), title: t("Back"), disabled: !page.canGoBack, onClick: () => actions.browserCommand(tabId, "back") }, (0, import_react37.createElement)(BackIcon)),
      (0, import_react37.createElement)("button", { type: "button", className: "bt-icon-btn", "aria-label": t("Forward"), title: t("Forward"), disabled: !page.canGoForward, onClick: () => actions.browserCommand(tabId, "forward") }, (0, import_react37.createElement)(ForwardIcon)),
      (0, import_react37.createElement)("button", {
        type: "button",
        className: "bt-icon-btn",
        disabled: !page.url,
        "aria-label": page.loading ? t("Stop") : t("Reload"),
        title: page.loading ? t("Stop") : t("Reload"),
        onClick: () => actions.browserCommand(tabId, page.loading ? "stop" : "reload")
      }, (0, import_react37.createElement)(page.loading ? StopIcon : ReloadIcon)),
      (0, import_react37.createElement)(
        "form",
        { className: "bt-browser-address", onSubmit: go, "data-editing": editing || void 0 },
        (0, import_react37.createElement)("span", { className: "bt-browser-scheme", "aria-hidden": true }, (0, import_react37.createElement)(secure && !editing ? LockIcon2 : GlobeIcon)),
        (0, import_react37.createElement)("input", {
          ref: input,
          type: "text",
          spellCheck: false,
          autoComplete: "off",
          "aria-label": t("Address"),
          placeholder: t("Search or enter address"),
          value: editing ? draft : shortAddress(page.url),
          onFocus: (event) => {
            setDraft(page.url);
            const target = event.target;
            requestAnimationFrame(() => target.select());
          },
          onBlur: () => setDraft(null),
          onChange: (event) => setDraft(event.target.value),
          onKeyDown: (event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setDraft(null);
              event.currentTarget.blur();
            }
          }
        })
      ),
      page.loading ? (0, import_react37.createElement)("span", { className: "bt-browser-progress", "aria-hidden": true }) : null
    ),
    (0, import_react37.createElement)(
      "div",
      { ref: frame, className: "bt-browser-frame", "data-guest": showGuest || void 0 },
      page.error ? (0, import_react37.createElement)(
        "div",
        { className: "bt-browser-empty" },
        (0, import_react37.createElement)("div", { className: "bt-browser-empty-title" }, t("This page didn’t load")),
        (0, import_react37.createElement)("div", { className: "bt-browser-empty-text" }, t(page.error)),
        page.url ? (0, import_react37.createElement)("button", { type: "button", className: "bt-browser-retry", onClick: () => {
          void actions.browserNavigate(tabId, page.url);
        } }, t("Try again")) : null
      ) : !page.url ? (0, import_react37.createElement)(
        "div",
        { className: "bt-browser-empty" },
        (0, import_react37.createElement)(BotMark, { bot, size: 48, state: "idle", live: true }),
        (0, import_react37.createElement)("div", { className: "bt-browser-empty-title" }, t("{name}'s browser", { name: bot.name })),
        (0, import_react37.createElement)("div", { className: "bt-browser-empty-text" }, t("Open a page here and {name} can read it with you. Logins and cookies stay with {name}; other Bots never see them.", { name: bot.name }))
      ) : null
    )
  );
}
function BotPanel({ pane, leaving, roster, actions, useSessions, useSessionStatus, useActivity, useWork, useBrowserTabs, useBrowserPages }) {
  const bot = roster.byId[pane.id];
  const canBrowse = Boolean(bot && roster.browser === true && actions.browserShow);
  const view = pane.view === "browser" && canBrowse ? "browser" : "details";
  const tabState = useBrowserTabs((map) => bot ? map[bot.id] ?? EMPTY_TABS2 : EMPTY_TABS2);
  const active = tabState.active;
  const page = useBrowserPages((pages) => (active ? pages[active] : null) ?? EMPTY_PAGE);
  const root = (0, import_react37.useRef)(null);
  const fly = (0, import_react37.useRef)(null);
  const [landed, setLanded] = (0, import_react37.useState)(false);
  const [settling, setSettling] = (0, import_react37.useState)(false);
  const [width, setWidth] = (0, import_react37.useState)(savedWidth);
  const [viewport, setViewport] = (0, import_react37.useState)(() => window.innerWidth);
  const [dragging, setDragging] = (0, import_react37.useState)(false);
  const [resizing, setResizing] = (0, import_react37.useState)(false);
  const instant = dragging || resizing;
  const [reading, setReading] = (0, import_react37.useState)(false);
  const panelWidth = fitWidth(width ?? (view === "browser" ? DEFAULT_WIDTH : DETAILS_WIDTH), widthRange(view, viewport));
  (0, import_react37.useLayoutEffect)(() => {
    if (view === "browser" && width === null) setWidth(DEFAULT_WIDTH);
  }, [view, width]);
  (0, import_react37.useLayoutEffect)(() => {
    chatRoom.hold(instant);
  }, [instant]);
  const [last, setLast] = (0, import_react37.useState)({ view, width: panelWidth });
  if (last.view !== view || last.width !== panelWidth) {
    setLast({ view, width: panelWidth });
    if (last.view !== view) setSettling(last.width !== panelWidth && !instant);
  }
  const shownView = (0, import_react37.useRef)(view);
  (0, import_react37.useLayoutEffect)(() => {
    const switched = settling && shownView.current !== view;
    shownView.current = view;
    if (switched) chatRoom.hold(true);
    chatRoom.set(leaving ? null : panelWidth);
    if (switched) chatRoom.hold(false);
  }, [view, panelWidth, leaving]);
  (0, import_react37.useEffect)(() => () => {
    chatRoom.set(null);
    chatRoom.hold(false);
  }, []);
  (0, import_react37.useEffect)(() => {
    let timer;
    const onResize = () => {
      setResizing(true);
      setViewport(window.innerWidth);
      clearTimeout(timer);
      timer = setTimeout(() => setResizing(false), 160);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  (0, import_react37.useEffect)(() => {
    if (!settling) return void 0;
    const timer = setTimeout(() => setSettling(false), SPRING_SHAPE.duration + 40);
    return () => clearTimeout(timer);
  }, [settling, view]);
  (0, import_react37.useEffect)(() => {
    const timer = setTimeout(() => setLanded(true), 360);
    return () => clearTimeout(timer);
  }, []);
  (0, import_react37.useEffect)(() => {
    if (canBrowse) actions.browserEnsure(bot.id);
  }, [bot?.id, canBrowse]);
  (0, import_react37.useEffect)(() => {
    if (view === "browser" && (active === null || !tabState.ids.includes(active))) actions.setPanelView("details");
  }, [view, active, tabState.ids.length]);
  (0, import_react37.useEffect)(() => {
    if (view !== "browser" || leaving) void actions.browserShow?.(null);
  }, [view, leaving]);
  (0, import_react37.useEffect)(() => () => {
    void actions.browserShow?.(null);
  }, []);
  (0, import_react37.useEffect)(() => {
    if (!page.readAt || Date.now() - page.readAt > READ_FLASH_MS) return void 0;
    setReading(true);
    const timer = setTimeout(() => setReading(false), READ_FLASH_MS);
    return () => clearTimeout(timer);
  }, [page.readAt]);
  const beginSwitch = (next) => {
    if (reducedMotion2()) return;
    const panel = root.current;
    const outgoing = panel?.querySelector(".bt-panel-view");
    if (outgoing) {
      const ghostEl = document.createElement("div");
      ghostEl.className = "bt-panel-ghost";
      ghostEl.style.width = `${outgoing.offsetWidth}px`;
      ghostEl.append(outgoing.cloneNode(true));
      outgoing.parentElement.append(ghostEl);
      void ghostEl.animate([
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.985)" }
      ], { duration: 160, easing: "ease-out", fill: "forwards" }).finished.catch(() => {
      }).finally(() => ghostEl.remove());
    }
    const source = next === "browser" ? panel?.querySelector(".bt-drawer-id .bt-mark") : panel?.querySelector(".bt-ptab-bot .bt-mark");
    if (source) fly.current = { node: source.cloneNode(true), from: source.getBoundingClientRect() };
  };
  const switchView = (next) => {
    if (next === view || leaving) return;
    beginSwitch(next);
    actions.setPanelView(next);
  };
  const panelActions = { ...actions };
  for (const name of ["openBrowser", "browserNewTab", "browserPick"]) {
    if (actions[name]) panelActions[name] = (...args) => {
      if (view !== "browser") beginSwitch("browser");
      return actions[name](...args);
    };
  }
  (0, import_react37.useLayoutEffect)(() => {
    const move = fly.current;
    if (!move) return;
    fly.current = null;
    const target = view === "browser" ? root.current?.querySelector(".bt-ptab-bot .bt-mark") : root.current?.querySelector(".bt-drawer-id .bt-mark");
    if (!target || move.from.width === 0) return;
    const growing = root.current.getAnimations({ subtree: true }).filter((animation) => animation.animationName === "bt-strip-in");
    const at2 = growing.map((animation) => animation.currentTime);
    for (const animation of growing) animation.currentTime = animation.effect.getComputedTiming().endTime;
    const to = target.getBoundingClientRect();
    growing.forEach((animation, index) => {
      animation.currentTime = at2[index];
    });
    const clone = move.node;
    Object.assign(clone.style, {
      position: "fixed",
      left: `${move.from.left}px`,
      top: `${move.from.top}px`,
      width: `${move.from.width}px`,
      height: `${move.from.height}px`,
      margin: "0",
      transformOrigin: "0 0",
      zIndex: "80",
      pointerEvents: "none",
      visibility: ""
    });
    document.body.append(clone);
    target.style.visibility = "hidden";
    const scale = to.width / move.from.width;
    const anim = clone.animate([
      { transform: "translate(0px, 0px) scale(1)" },
      { transform: `translate(${to.left - move.from.left}px, ${to.top - move.from.top}px) scale(${scale})` }
    ], { duration: SPRING_SHAPE.duration, easing: SPRING_SHAPE.easing, fill: "forwards" });
    void anim.finished.catch(() => {
    }).finally(() => {
      clone.remove();
      target.style.visibility = "";
    });
  }, [view, pane.id]);
  const startResize = (event) => {
    if (event.button !== 0 || leaving) return;
    event.preventDefault();
    const panel = root.current;
    const grip = event.currentTarget;
    grip.setPointerCapture?.(event.pointerId);
    const range = widthRange(view, window.innerWidth);
    const from = { x: event.clientX, width: panelWidth };
    let next = panelWidth;
    setDragging(true);
    setSettling(false);
    chatRoom.hold(true);
    const columns = chatRoom.columns();
    for (const column of columns) column.style.setProperty("transition", "none", "important");
    const onMove = (move) => {
      next = fitWidth(from.width + from.x - move.clientX, range);
      panel.style.width = `${next}px`;
      if (columns.length === 0) chatRoom.set(next);
      for (const column of columns) column.style.setProperty("margin-right", `${next}px`, "important");
    };
    const ends = ["pointerup", "pointercancel", "lostpointercapture"];
    const onEnd = (end) => {
      if (end.type === "pointerup") onMove(end);
      grip.removeEventListener("pointermove", onMove);
      for (const name of ends) grip.removeEventListener(name, onEnd);
      chatRoom.set(next);
      for (const column of columns) {
        column.style.removeProperty("margin-right");
        column.style.removeProperty("transition");
      }
      panel.style.setProperty("--bt-panel-w", `${next}px`);
      panel.style.removeProperty("width");
      setDragging(false);
      if (next === from.width) return;
      setWidth(next);
      try {
        localStorage.setItem(WIDTH_KEY, String(next));
      } catch {
      }
    };
    grip.addEventListener("pointermove", onMove);
    for (const name of ends) grip.addEventListener(name, onEnd);
  };
  const hasStrip = canBrowse && tabState.ids.length > 0;
  return (0, import_react37.createElement)(
    "aside",
    {
      ref: root,
      className: "bt-panel",
      "data-view": view,
      "aria-label": view === "browser" && bot ? t("{name}'s browser", { name: bot.name }) : t("Conversation details"),
      "data-leaving": leaving || void 0,
      "aria-hidden": leaving || void 0,
      "data-settling": settling || void 0,
      "data-instant": instant || void 0,
      "data-dragging": dragging || void 0,
      style: { "--bt-panel-w": `${panelWidth}px` },
      onAnimationEnd: (event) => {
        if (event.target === event.currentTarget) setLanded(true);
      }
    },
    leaving ? null : (0, import_react37.createElement)("div", { className: "bt-panel-grip", role: "separator", "aria-orientation": "vertical", "aria-label": t("Resize panel"), onPointerDown: startResize }),
    // Over the whole window while dragging: the cursor stays a resize cursor and the
    // pages underneath (the chat, the guest) see no pointer.
    dragging ? (0, import_react_dom8.createPortal)((0, import_react37.createElement)("div", { className: "bt-drag-shield", "aria-hidden": true }), document.body) : null,
    hasStrip ? (0, import_react37.createElement)(PanelStrip, { bot, subject: pane.id, view, ids: tabState.ids, active, reading, onView: switchView, actions: panelActions, useBrowserPages }) : null,
    view === "browser" && bot ? (0, import_react37.createElement)(BrowserView, { key: `browser:${active}`, bot, tabId: active, leaving, landed: landed && !settling, actions, useBrowserPages }) : (0, import_react37.createElement)(
      "div",
      { key: `details:${pane.id}:${pane.renaming ? "rename" : ""}:${pane.tab ?? ""}`, className: "bt-panel-view" },
      (0, import_react37.createElement)(DetailsDrawer, {
        sessionId: pane.id,
        startRenaming: pane.renaming,
        startTab: pane.tab,
        hasStrip,
        roster,
        actions: panelActions,
        useSessions,
        useSessionStatus,
        useActivity,
        useWork,
        useBrowserTabs,
        useBrowserPages
      })
    )
  );
}
var BROWSER_CSS = `
.bt-panel{--bt-panel-view-fade:${SPRING_SHAPE.duration}ms}
.bt-ptabs{position:relative;display:flex;align-items:center;height:44px;flex:none;border-bottom:.5px solid var(--bt-line);padding:0 6px;gap:0;animation:bt-strip-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing}}
@keyframes bt-strip-in{from{height:0;opacity:0}}
.bt-ptabs-in{position:relative;display:flex;align-items:center;gap:2px;flex:1;min-width:0;height:100%;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;padding:4px 2px;scroll-padding-left:48px;mask-image:linear-gradient(to right,#000,#000 calc(100% - 10px),transparent)}
.bt-ptabs-in>.bt-ptab-bot{position:sticky;left:0;z-index:2;background:var(--bt-main)}
.bt-ptabs-in>.bt-ptab-bot[aria-selected=true]{background:transparent}
.bt-ptabs-in::-webkit-scrollbar{display:none}
.bt-ptab{position:relative;z-index:1;display:inline-flex;align-items:center;gap:6px;height:32px;max-width:180px;padding:0 8px;flex:none;border:0;border-radius:9px;background:none;color:var(--bt-ink-2);font:inherit;font-size:12.5px;cursor:pointer;white-space:nowrap;transition:color .12s ease}
.bt-ptab:hover{color:var(--bt-ink)}
.bt-ptab[aria-selected=true]{color:var(--bt-ink)}
.bt-ptab-bot{padding:0 7px}
.bt-ptab-bot .bt-mark{flex:none}
.bt-ptab-name{max-width:96px;overflow:hidden;text-overflow:ellipsis;font-weight:500;animation:bt-ptab-label .18s ease}
@keyframes bt-ptab-label{from{opacity:0;filter:blur(4px);max-width:0}}
.bt-ptab-fav{width:14px;height:14px;flex:none;border-radius:3px;object-fit:cover;color:var(--bt-ink-3)}
.bt-ptab-globe{display:inline-flex}
.bt-ptab-globe svg{width:14px;height:14px}
.bt-ptab-title{max-width:140px;overflow:hidden;text-overflow:ellipsis}
.bt-ptab-x{flex:none;width:16px;height:16px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:13px;line-height:1;color:var(--bt-ink-3);opacity:0;transition:opacity .12s ease,background-color .12s ease}
.bt-ptab:hover .bt-ptab-x,.bt-ptab[aria-selected=true] .bt-ptab-x{opacity:1}
.bt-ptab-x:hover{background:var(--bt-active);color:var(--bt-ink)}
.bt-ptab-new{position:relative;z-index:1;flex:none;width:28px;height:32px;border:0;border-radius:9px;background:none;color:var(--bt-ink-3);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.bt-ptab-new:hover{color:var(--bt-ink)}
.bt-ptab-new svg{width:15px;height:15px}
.bt-ptab-ind{position:absolute;top:4px;bottom:4px;border-radius:9px;background:var(--bt-hover);opacity:0;pointer-events:none;z-index:0;transition:opacity .15s ease}
.bt-ptab-close{flex:none;margin-left:2px}
.bt-panel-ghost{position:absolute;top:calc(44px + var(--bt-caption-band,0px));right:0;bottom:0;overflow:hidden;pointer-events:none;z-index:2}
.bt-panel-ghost>.bt-panel-view{position:absolute;inset:0}
.bt-panel-view{flex:1;min-height:0;display:flex;flex-direction:column;animation:bt-panel-view-in .22s cubic-bezier(.16,1,.3,1)}
@keyframes bt-panel-view-in{from{opacity:0}}
/* While the panel changes width its views keep their final width on the right edge, so
   only the panel edge moves and nothing inside reflows frame by frame. */
.bt-panel[data-settling]{overflow:hidden}
.bt-panel[data-settling]>.bt-ptabs,.bt-panel[data-settling]>.bt-panel-view{flex-shrink:0;align-self:flex-end;box-sizing:border-box;width:calc(var(--bt-panel-w,320px) - .5px)}
.bt-panel-browser{position:relative}
.bt-browser-bar{position:relative;display:flex;align-items:center;gap:2px;height:52px;padding:0 10px 0 12px;flex:none;border-bottom:.5px solid var(--bt-line)}
.bt-browser-bar .bt-icon-btn:disabled{opacity:.35;cursor:default;background:none}
.bt-browser-address{flex:1;min-width:0;display:flex;align-items:center;gap:6px;height:32px;margin:0 4px;padding:0 12px;border-radius:999px;background:var(--bt-hover);border:.5px solid transparent;transition:background-color .12s ease,border-color .12s ease,box-shadow .12s ease}
.bt-browser-address:hover{background:var(--bt-active)}
.bt-browser-address[data-editing]{background:var(--bt-main);border-color:var(--bt-line-2);box-shadow:0 2px 8px -1px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04)}
.bt-browser-scheme{display:inline-flex;color:var(--bt-ink-3);flex:none}
.bt-browser-scheme svg{width:14px;height:14px}
.bt-browser-address input{flex:1;min-width:0;border:0;background:none;outline:none;color:var(--bt-ink);font:inherit;font-size:13px;line-height:18px;padding:0;text-overflow:ellipsis}
.bt-browser-address input::placeholder{color:var(--bt-ink-3)}
.bt-browser-progress{position:absolute;left:0;right:0;bottom:-1px;height:2px;overflow:hidden;pointer-events:none}
.bt-browser-progress::after{content:"";position:absolute;inset:0;width:40%;background:var(--bt-accent,${INKS.red[0]});border-radius:2px;animation:bt-browser-load 1.1s cubic-bezier(.4,0,.2,1) infinite}
@keyframes bt-browser-load{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
.bt-browser-frame{position:relative;flex:1;min-height:0;background:var(--bt-main)}
.bt-browser-frame[data-guest]{background:#fff}
.bt-browser-empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:32px;text-align:center;animation:bt-foot-in .3s ease}
.bt-browser-empty-title{font-size:15px;line-height:22px;font-weight:500;margin-top:6px}
.bt-browser-empty-text{max-width:300px;font-size:13px;line-height:19px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-browser-retry{margin-top:6px;height:32px;padding:0 14px;border-radius:999px;border:.5px solid var(--bt-line-2);background:var(--bt-main);color:var(--bt-ink);font:inherit;font-size:13px;cursor:pointer}
.bt-browser-retry:hover{background:var(--bt-hover)}
.bt-bcards{display:flex;flex-direction:column;gap:12px}
.bt-bcard{position:relative;border:.5px solid var(--bt-line-2);border-radius:12px;overflow:hidden;background:var(--bt-main);animation:bt-bcard-in .24s cubic-bezier(.16,1,.3,1) both;transition:border-color .12s ease,box-shadow .12s ease}
@keyframes bt-bcard-in{from{opacity:0;filter:blur(4px);transform:translateY(4px)}}
.bt-bcard[data-active]{border-color:var(--bt-accent,${INKS.red[0]});box-shadow:0 0 0 1px var(--bt-accent,${INKS.red[0]})}
.bt-bcard-shot{position:relative;display:block;width:100%;aspect-ratio:16/10;border:0;background:var(--bt-hover);padding:0;cursor:pointer}
.bt-bcard-blank{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:var(--bt-ink-3);font-size:12px}
.bt-bcard-blank svg{width:20px;height:20px}
.bt-bcard-preview{position:absolute;inset:0;display:flex;flex-direction:column;gap:6px;padding:14px 16px;text-align:left;background:linear-gradient(to bottom,var(--bt-main),var(--bt-hover));overflow:hidden}
.bt-bcard-ptitle{font-size:13px;line-height:18px;font-weight:600;color:var(--bt-ink);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.bt-bcard-excerpt{font-size:12px;line-height:17px;color:var(--bt-ink-2);display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.bt-bcard-row{display:flex;align-items:center;gap:7px;padding:8px 10px;min-width:0}
.bt-bcard-fav{width:14px;height:14px;flex:none;border-radius:3px;color:var(--bt-ink-3)}
.bt-bcard-row svg.bt-bcard-fav{width:14px;height:14px}
.bt-bcard-title{flex:1;min-width:0;font-size:12.5px;line-height:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--bt-ink)}
.bt-bcard-host{flex:none;font-size:11px;line-height:15px;color:var(--bt-ink-3);max-width:38%;overflow:hidden;text-overflow:ellipsis}
.bt-bcard-x{position:absolute;top:6px;right:6px;width:22px;height:22px;border:0;border-radius:7px;background:color-mix(in srgb,var(--bt-main) 88%,transparent);color:var(--bt-ink-2);display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;opacity:0;transition:opacity .12s ease;backdrop-filter:blur(4px)}
.bt-bcard:hover .bt-bcard-x{opacity:1}
.bt-bcard-new{display:flex;align-items:center;justify-content:center;gap:6px;height:40px;border:.5px dashed var(--bt-line-2);border-radius:12px;background:none;color:var(--bt-ink-3);font:inherit;font-size:12.5px;cursor:pointer}
.bt-bcard-new:hover{color:var(--bt-ink);border-color:var(--bt-ink-3)}
.bt-bcard-new svg{width:14px;height:14px}
.bt-browser-empty-mark{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
@media (prefers-reduced-motion:reduce){.bt-ptabs,.bt-panel-view,.bt-bcard,.bt-ptab-name{animation:none}}
`;

// src/client/overlays.js
var import_react38 = require("react");
var import_react_dom9 = require("react-dom");
var DIALOG_EXIT_MS = 160;
var MENU_EXIT_MS3 = 120;
function Overlays({ useRoster, useUi, useSessions, useSessionStatus, useActivity, useWork, useRegistry, useBrowserPages, useBrowserTabs, useUpdate, actions }) {
  const roster = useRoster((value) => value);
  const ui2 = useUi((value) => value);
  useRegistry((value) => value);
  const current = useSessions((list) => Object.values(list.byId).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id ?? null);
  const previous = (0, import_react38.useRef)(current);
  (0, import_react38.useEffect)(() => {
    if (previous.current === current) return;
    previous.current = current;
    if (!current) return;
    const bot = roster.byId[current];
    if (bot) actions.browserEnsure?.(bot.id);
    actions.followPanel?.(current);
  }, [current]);
  const open = ui2.details ? { id: ui2.details, view: ui2.view ?? "details", renaming: ui2.renaming, tab: ui2.tab } : null;
  const [kept, setKept] = (0, import_react38.useState)(open);
  (0, import_react38.useEffect)(() => {
    if (open) {
      setKept(open);
      return void 0;
    }
    const timer = setTimeout(() => setKept(null), PANEL_LINGER_MS);
    return () => clearTimeout(timer);
  }, [ui2.details, ui2.view, ui2.renaming, ui2.tab]);
  const pane = open ?? kept;
  const [settings, settingsLeaving] = useLinger(ui2.settings, DIALOG_EXIT_MS);
  const memoryOwner = (id) => {
    const bot = roster.byId[id];
    if (bot) return { id: bot.id, name: bot.name };
    const room2 = roster.roomsById[id];
    return room2 ? { id: room2.id, name: room2.name, group: true } : null;
  };
  const [memory, memoryLeaving] = useLinger(ui2.memory && memoryOwner(ui2.memory) ? ui2.memory : null, DIALOG_EXIT_MS);
  const owner = memory ? memoryOwner(memory) : null;
  const [menu, menuLeaving] = useLinger(ui2.menu, MENU_EXIT_MS3);
  return (0, import_react38.createElement)(
    import_react38.Fragment,
    null,
    pane ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(BotPanel, { pane, leaving: open === null, roster, actions, useSessions, useSessionStatus, useActivity, useWork, useBrowserTabs, useBrowserPages }), document.body) : null,
    ui2.newChat ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(NewChat, { key: ui2.newChat, mode: ui2.newChat, roster, actions }), document.body) : null,
    ui2.palette ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(CommandPalette, { key: ui2.palette.token, start: ui2.palette.query, token: ui2.palette.token, roster, actions, useSessions }), document.body) : null,
    ui2.exchange ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(ExchangeDialog, { pair: ui2.exchange, roster, actions }), document.body) : null,
    menu ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(ContextMenu, { key: `${menu.kind ?? ""}:${menu.id}:${menu.x}:${menu.y}`, menu, roster, actions, leaving: menuLeaving }), document.body) : null,
    settings ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(SettingsDialog, { page: settings.page, id: settings.id, roster, actions, useUpdate, leaving: settingsLeaving }), document.body) : null,
    owner ? (0, import_react_dom9.createPortal)((0, import_react38.createElement)(MemoryDialog, { key: owner.id, owner, actions, leaving: memoryLeaving }), document.body) : null
  );
}

// src/client/read-page.js
var READ_LIMITS = {
  chars: 4e5,
  nodes: 15e4,
  depth: 400,
  ms: 1500,
  items: 3e3,
  tableRows: 5e3,
  tableCols: 30,
  frameDepth: 3
};
function readPage(limits) {
  const started = performance.now();
  const SKIP = /* @__PURE__ */ new Set(["script", "style", "noscript", "template", "head", "title", "meta", "link", "svg", "object", "embed", "audio", "video", "source", "track", "map", "datalist", "option", "optgroup"]);
  const ITEM = 'a[href], button, input:not([type=hidden]), textarea, select, summary, [role=button], [role=link], [role=tab], [role=menuitem], [role=checkbox], [role=switch], [role=radio], [contenteditable=""], [contenteditable=true]';
  const ROLES = { a: "link", button: "button", select: "select", textarea: "textbox", summary: "button" };
  const INPUT_ROLES = { checkbox: "checkbox", radio: "radio", submit: "button", button: "button", reset: "button", image: "button", search: "searchbox", range: "slider", file: "button", color: "button" };
  const NO_VALUE_TYPES = /* @__PURE__ */ new Set(["checkbox", "radio", "submit", "button", "reset", "image", "file", "color"]);
  const SECRET_HINT = /(^|[-_\s])(cvv|cvc|csc|cc-?(num|number|csc|exp)|card-?(num|number)|otp|one-?time-?code|pin)([-_\s]|$)/i;
  const BLOCK_DISPLAY = /^(block|flex|grid|list-item|table|flow-root|table-caption|table-row-group|table-header-group|table-footer-group|table-row|-webkit-box)$/;
  const INLINE_BLOCK = /^(inline-block|inline-flex|inline-grid|inline-table|table-cell|-webkit-inline-box)$/;
  const SEMANTIC = /^(ul|ol|table|pre|blockquote|h[1-6]|code|details)$/;
  const items = [];
  const stash = [];
  const stats = { nodes: 0, frames: 0 };
  let chars = 0;
  let stop = "";
  const collapse = (value) => String(value || "").replace(/\s+/g, " ").trim();
  const isSecret = (el) => {
    if (el.localName !== "input" && el.localName !== "textarea") return false;
    const auto = String(el.getAttribute("autocomplete") || "").toLowerCase();
    return el.type === "password" || /(^|\s)(cc-|one-time-code)/.test(auto) || SECRET_HINT.test(`${el.getAttribute("name") || ""} ${el.id || ""}`);
  };
  const keep = (text2, end = "") => {
    if (text2 === "") return "";
    stash.push(text2);
    return `

${stash.length - 1}${end}

`;
  };
  const expand = (text2) => text2.replace(/\u0001(\d+)[\u0002\u0003]/g, (_, index) => expand(stash[Number(index)]));
  const flow = (text2) => text2.split("\n").map((line) => line.replace(/[ \t\f\v\u00a0\u2028\u2029]+/g, " ").trim().replace(/^· /, "")).join("\n").replace(/\n{3,}/g, "\n\n").replace(/\u0003\n\n(?=\u0001\d+\u0003)/g, "\n").trim();
  const block = (text2) => expand(flow(text2));
  const oneLine = (text2) => block(text2).replace(/\s*\n+\s*/g, " ").trim();
  const styleOf = (el) => (el.ownerDocument.defaultView || window).getComputedStyle(el);
  const childrenOf = (el) => {
    if (el.shadowRoot) return el.shadowRoot.childNodes;
    if (el.localName === "slot" && typeof el.assignedNodes === "function") {
      const assigned = el.assignedNodes();
      if (assigned.length > 0) return assigned;
    }
    return el.childNodes;
  };
  const over = () => {
    if (stop) return true;
    if (chars > limits.chars) stop = `the text passed ${limits.chars} characters`;
    else if (stats.nodes > limits.nodes) stop = `the page has more than ${limits.nodes} nodes`;
    else if (stats.nodes % 512 === 0 && performance.now() - started > limits.ms) stop = `reading took longer than ${limits.ms} ms`;
    return stop !== "";
  };
  const roleOf = (el) => el.getAttribute("role") || ROLES[el.localName] || (el.localName === "input" ? INPUT_ROLES[el.type] || "textbox" : el.isContentEditable ? "textbox" : el.localName);
  const sized = (el) => {
    const box2 = el.getBoundingClientRect();
    return box2.width > 0 && box2.height > 0;
  };
  const itemFor = (el, style) => {
    if (items.length >= limits.items || style.visibility !== "visible" || !el.matches(ITEM) || !sized(el)) return null;
    const item = { role: roleOf(el) };
    const secret = isSecret(el);
    if (el.href) item.href = String(el.href);
    if ((el.localName === "input" || el.localName === "textarea") && !secret && !NO_VALUE_TYPES.has(el.type) && el.value) item.value = String(el.value).slice(0, 120);
    if (el.localName === "select" && el.selectedOptions?.length) item.value = collapse([...el.selectedOptions].map((option) => option.label || option.text).join(", ")).slice(0, 120);
    if (el.checked) item.checked = true;
    if (el.disabled) item.disabled = true;
    items.push(item);
    return { item, number: items.length, secret };
  };
  const nameOf = (el, text2, secret) => collapse(
    el.getAttribute("aria-label") || text2 || (el.localName === "input" && !secret && NO_VALUE_TYPES.has(el.type) ? el.value : "") || el.getAttribute("placeholder") || el.title || el.getAttribute("alt") || el.querySelector?.("img[alt]")?.alt || el.getAttribute("name") || ""
  ).slice(0, 80);
  const fenced = (code, lang) => {
    const longest = Math.max(2, ...(code.match(/`{3,}/g) || []).map((run) => run.length));
    const fence = "`".repeat(longest + 1);
    return `${fence}${lang}
${code.replace(/\n+$/, "")}
${fence}`;
  };
  const langOf = (el) => {
    const names = `${el.className || ""} ${el.querySelector?.("code")?.className || ""}`;
    return /(?:^|\s)(?:lang|language)-([\w+#.-]+)/.exec(names)?.[1] || "";
  };
  const list = (el, ctx) => {
    const ordered = el.localName === "ol";
    let number = ordered ? Number(el.getAttribute("start") || 1) || 1 : 1;
    const lines = [];
    for (const child of childrenOf(el)) {
      if (over()) break;
      if (child.nodeType !== 1 || child.localName !== "li") {
        const loose = block(render(child, ctx));
        if (loose) lines.push(loose);
        continue;
      }
      const style = styleOf(child);
      if (style.display === "none") continue;
      let body2 = block(children(child, { ...ctx, depth: ctx.depth + 1, shown: style.visibility === "visible" }));
      if (!body2.includes("```")) body2 = body2.replace(/\n{2,}/g, "\n");
      const marker = ordered ? `${number++}. ` : "- ";
      if (body2 === "") continue;
      const pad2 = " ".repeat(marker.length);
      lines.push(body2.split("\n").map((line, index) => (index === 0 ? marker : line ? pad2 : "") + line).join("\n"));
    }
    return keep(lines.join("\n"));
  };
  const cellText3 = (cell, ctx) => block(children(cell, ctx)).replace(/\n+/g, " <br> ").replace(/\|/g, "\\|");
  const layoutTable = (table, rows) => {
    const role = table.getAttribute("role");
    if (role === "presentation" || role === "none") return true;
    if (table.querySelector("table")) return true;
    return !rows.some((row) => row.cells.length > 1);
  };
  const tableMarkdown = (table, ctx) => {
    const rows = [...table.rows].filter((row) => styleOf(row).display !== "none");
    const caption = table.caption ? oneLine(children(table.caption, ctx)) : "";
    if (layoutTable(table, rows)) {
      return rows.map((row) => [...row.cells].map((cell) => `

${children(cell, ctx)}

`).join("")).join("");
    }
    const grid = [];
    const carry = [];
    let width = 0;
    for (const row of rows.slice(0, limits.tableRows + 1)) {
      if (over()) break;
      const line = [];
      let column = 0;
      const place = () => {
        while (carry[column]?.left > 0) {
          line[column] = carry[column].text;
          carry[column].left -= 1;
          column += 1;
        }
      };
      for (const cell of row.cells) {
        place();
        if (styleOf(cell).display === "none") continue;
        const text2 = cellText3(cell, ctx);
        const span = Math.max(1, Math.min(limits.tableCols, Number(cell.colSpan) || 1));
        const down = Math.max(1, Math.min(limits.tableRows, Number(cell.rowSpan) || 1));
        for (let offset = 0; offset < span; offset += 1) {
          line[column] = offset === 0 ? text2 : "";
          if (down > 1) carry[column] = { text: offset === 0 ? text2 : "", left: down - 1 };
          column += 1;
        }
      }
      place();
      width = Math.max(width, line.length);
      grid.push(line);
    }
    width = Math.min(width, limits.tableCols);
    if (grid.length === 0 || width === 0) return caption ? `

${caption}

` : "";
    const format = (cells) => `| ${Array.from({ length: width }, (_, index) => cells[index] ?? "").join(" | ")} |`;
    const out = [format(grid[0]), `|${" --- |".repeat(width)}`, ...grid.slice(1).map(format)];
    if (rows.length > limits.tableRows + 1) out.push(`… (table cut: ${rows.length - limits.tableRows - 1} more rows)`);
    return `${caption ? `

Table: ${caption}` : ""}${keep(out.join("\n"))}`;
  };
  const frame = (el, ctx) => {
    let doc = null;
    try {
      doc = el.contentDocument;
    } catch {
      doc = null;
    }
    const address = (() => {
      try {
        return doc?.location?.href || el.src || el.getAttribute("src") || "about:blank";
      } catch {
        return el.src || "about:blank";
      }
    })();
    if (!doc) return `

[iframe (cross-origin, not readable): ${address}]

`;
    if (ctx.frames >= limits.frameDepth) return `

[iframe (nested too deep, not read): ${address}]

`;
    stats.frames += 1;
    const title = collapse(el.title || doc.title);
    const body2 = doc.body ? block(children(doc.body, { ...ctx, frames: ctx.frames + 1, depth: ctx.depth + 1, shown: true, pre: false })) : "";
    return keep(`[iframe: ${title ? `${title} (${address})` : address}]
${body2 || "(no text)"}
[iframe end]`);
  };
  function children(el, ctx) {
    let out = "";
    for (const child of childrenOf(el)) {
      if (over()) break;
      out += render(child, ctx);
    }
    return out;
  }
  function render(node, ctx) {
    stats.nodes += 1;
    if (node.nodeType === 3) {
      if (!ctx.shown) return "";
      const data = node.data.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
      const text2 = ctx.pre ? data : data.replace(/[\t\n\r ]+/g, " ");
      chars += text2.length;
      return text2;
    }
    if (node.nodeType !== 1) return "";
    const el = node;
    const tag = el.localName;
    if (SKIP.has(tag) || ctx.depth > limits.depth || over()) return "";
    const style = styleOf(el);
    const display = style.display;
    if (display === "none" || style.contentVisibility === "hidden") return "";
    const shown = style.visibility === "visible";
    const keepsSpace = String(style.whiteSpace || "").startsWith("pre") || style.whiteSpace === "break-spaces";
    const next = { ...ctx, depth: ctx.depth + 1, shown };
    if (display === "contents" && !SEMANTIC.test(tag) && !el.matches(ITEM)) return children(el, next);
    if (style.overflowX !== "visible" || style.overflowY !== "visible") {
      const box2 = el.getBoundingClientRect();
      if (box2.width === 0 || box2.height === 0) return "";
    }
    if (tag === "br") return "\n";
    if (tag === "hr") return "\n\n---\n\n";
    if (tag === "img") {
      const alt = collapse(el.getAttribute("alt"));
      return shown && alt ? `[image: ${alt}]` : "";
    }
    if (tag === "canvas") {
      const box2 = el.getBoundingClientRect();
      return box2.width >= 200 && box2.height >= 100 ? "\n\n[canvas: drawn content, not readable]\n\n" : "";
    }
    if (tag === "iframe" || tag === "frame") {
      const box2 = el.getBoundingClientRect();
      return tag === "iframe" && (box2.width < 2 || box2.height < 2) ? "" : frame(el, next);
    }
    const found = itemFor(el, style);
    const mark = found ? `[#${found.number}]` : "";
    if (tag === "input" || tag === "textarea" || tag === "select") {
      if (found) found.item.name = nameOf(el, tag === "select" ? "" : el.labels?.[0] ? collapse(el.labels[0].textContent) : "", found.secret);
      return mark ? ` ${mark} ` : "";
    }
    let body2;
    if (tag === "pre") {
      const code = shown ? String(el.innerText || el.textContent || "") : "";
      chars += code.length;
      body2 = code.trim() ? keep(fenced(code, langOf(el))) : "";
    } else if (tag === "table") {
      body2 = tableMarkdown(el, next);
    } else if (tag === "ul" || tag === "ol") {
      body2 = list(el, next);
    } else if (tag === "details" && !el.open) {
      const summary = [...el.children].find((child) => child.localName === "summary");
      body2 = summary ? render(summary, next) : "";
    } else {
      body2 = children(el, { ...next, pre: keepsSpace });
    }
    if (found) found.item.name = nameOf(el, oneLine(body2), found.secret);
    const level = /^h([1-6])$/.exec(tag)?.[1] || (el.getAttribute("role") === "heading" ? el.getAttribute("aria-level") || "2" : "");
    if (level) {
      const title = oneLine(body2);
      return title ? `

${"#".repeat(Math.min(6, Number(level) || 2))} ${title}${mark}

` : mark;
    }
    if (tag === "code" && !ctx.pre) {
      const code = oneLine(body2);
      if (!code) return mark;
      const ticks = code.includes("`") ? "``" : "`";
      return `${ticks}${code}${ticks}${mark}`;
    }
    if (tag === "blockquote") {
      const quoted2 = block(body2);
      return quoted2 ? keep(quoted2.split("\n").map((line) => line ? `> ${line}` : ">").join("\n")) : "";
    }
    const end = body2.trimEnd().length;
    const marked = mark ? `${body2.slice(0, end)}${mark}${body2.slice(end)}` : body2;
    if (ctx.pre && !BLOCK_DISPLAY.test(display)) return marked;
    if (keepsSpace && BLOCK_DISPLAY.test(display) && tag !== "pre") {
      return keep(expand(marked).replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").replace(/^\n+|\s+$/g, ""), "");
    }
    if (BLOCK_DISPLAY.test(display)) return `

${marked}

`;
    if (INLINE_BLOCK.test(display)) return ` ${marked} `;
    if (tag === "li") return ` · ${marked}`;
    return marked;
  }
  const body = document.body;
  let text = "";
  if (body) {
    text = block(render(body, { depth: 0, frames: 0, shown: true, pre: false })).replace(/\u00a0/g, " ");
  }
  if (text.length > limits.chars) {
    text = text.slice(0, limits.chars);
    stop ||= `the text passed ${limits.chars} characters`;
  }
  const page = {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || "",
    description: document.querySelector('meta[name="description"]')?.content || "",
    selection: String(getSelection() || "").slice(0, 4e3),
    format: "markdown",
    text,
    items,
    stats: { ...stats, ms: Math.round(performance.now() - started) }
  };
  if (stop) page.truncated = stop;
  return page;
}
var readPageScript = (limits = READ_LIMITS) => `(${readPage})(${JSON.stringify(limits)})`;
var READ_PAGE_SCRIPT = readPageScript();

// src/client/shared-map.js
function sharedMap(key, storage = globalThis.localStorage) {
  const read = (fallback = {}) => {
    if (!storage) return fallback;
    try {
      const value = JSON.parse(storage.getItem(key) ?? "{}");
      return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return fallback;
    }
  };
  const update = (change, fallback = {}) => {
    const base = read(fallback);
    const next = change(base);
    if (next === base) return next;
    try {
      storage?.setItem(key, JSON.stringify(next));
    } catch {
    }
    return next;
  };
  return { key, read, update };
}
function setEntry(map, id, value) {
  if (value === void 0) {
    if (!Object.hasOwn(map, id)) return map;
    const { [id]: _, ...rest } = map;
    return rest;
  }
  return { ...map, [id]: value };
}
function toggleReaction(reactions, key, index, emoji) {
  const entry = { ...reactions[key] };
  const list = entry[index] ?? [];
  entry[index] = list.includes(emoji) ? list.filter((item) => item !== emoji) : [...list, emoji];
  if (entry[index].length === 0) delete entry[index];
  const next = { ...reactions };
  if (Object.keys(entry).length) next[key] = entry;
  else delete next[key];
  return next;
}
function setUnread(unread, id, value) {
  if (Boolean(unread[id]) === value) return unread;
  const next = { ...unread };
  if (value) next[id] = true;
  else delete next[id];
  return next;
}
function noteLeft(seen, ids, now) {
  const next = { ...seen };
  for (const id of ids) next[id] = Math.max(Number(next[id]) || 0, now);
  return next;
}

// src/client/bot-browsers.js
var STORE_KEY = STORAGE.browsers;
var MAX_LIVE = 6;
var READ_TIMEOUT_MS = 1e4;
var PREVIEW_TIMEOUT_MS = 3e3;
var RESIZE_LATER_MS = 200;
var SEARCH_URL = "https://www.bing.com/search?q=";
var PREVIEW_SCRIPT = `(() => {
  const meta = key => document.querySelector('meta[name="' + key + '"],meta[property="' + key + '"]')?.content ?? ''
  const paragraph = [...document.querySelectorAll('main p, article p, p')].map(node => node.innerText ?? '').find(text => text.trim().length > 40) ?? ''
  const text = meta('description') || meta('og:description') || paragraph || document.body?.innerText || ''
  return text.replace(/\\s+/g, ' ').trim().slice(0, 200)
})()`;
var EMPTY = { url: "", title: "", favicon: null, loading: false, canGoBack: false, canGoForward: false, error: null, live: false, excerpt: "" };
var METADATA_HOST = /^(169\.254\.\d+\.\d+|\[fd00:ec2::254\]|metadata\.google\.internal)$/i;
var BLOCKED = "Cloud metadata addresses do not open here.";
var blockedAddress = (url) => URL.canParse(url) && METADATA_HOST.test(new URL(url).hostname);
function browserAddress(input) {
  const text = String(input ?? "").trim();
  if (text === "") return null;
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(text)) return /^https?:\/\//i.test(text) && URL.canParse(text) ? new URL(text).href : null;
  if (/^(about|javascript|data|file|blob|chrome|devtools|view-source):/i.test(text)) return null;
  const host = text.split(/[/?#]/)[0];
  const local = /^(localhost|127(\.\d+){3}|10(\.\d+){3}|192\.168(\.\d+){2}|172\.(1[6-9]|2\d|3[01])(\.\d+){2}|\[[\da-f:]+\])(:\d+)?$/i.test(host);
  const looksLikeHost = !/\s/.test(text) && (local || /^[^\s.]+(\.[^\s.]+)+(:\d+)?$/.test(host));
  if (looksLikeHost && URL.canParse(`http://${text}`)) return new URL(`${local ? "http" : "https"}://${text}`).href;
  return `${SEARCH_URL}${encodeURIComponent(text)}`;
}
function createBotBrowsers({ bridge, createSource: createSource2, storage = globalThis.localStorage, document: doc = globalThis.document }) {
  const views = /* @__PURE__ */ new Map();
  const owner = /* @__PURE__ */ new Map();
  const tabs = createSource2({});
  const pages = createSource2({});
  const store = sharedMap(STORE_KEY, storage);
  let saved = store.read();
  let layer;
  let shown = null;
  let rect = null;
  let visible = false;
  let resizeLater = 0;
  let disposed = false;
  let serial = 0;
  const savedTab = (botId, tabId) => saved[botId]?.tabs?.find((entry) => entry.id === tabId);
  const publish2 = (tabId, patch) => pages.set((state) => {
    const botId = owner.get(tabId);
    return { ...state, [tabId]: { ...EMPTY, ...savedTab(botId, tabId), ...state[tabId], ...patch } };
  });
  const save = (botId, entry) => {
    saved = store.update((stored) => setEntry(stored, botId, entry), saved);
  };
  const persist = (botId) => {
    const state = tabs.getSnapshot()[botId];
    const snapshot = pages.getSnapshot();
    save(botId, state && {
      tabs: state.ids.map((id) => ({ id, url: snapshot[id]?.url ?? "", title: snapshot[id]?.title ?? "" })),
      active: state.active
    });
  };
  const ensureTabs = (botId) => {
    if (tabs.getSnapshot()[botId] !== void 0) return;
    const entries2 = saved[botId]?.tabs ?? [];
    const ids = entries2.map((entry) => entry.id);
    const active = ids.includes(saved[botId]?.active) ? saved[botId].active : ids.at(-1) ?? null;
    for (const entry of entries2) owner.set(entry.id, botId);
    tabs.set((state) => ({ ...state, [botId]: { ids, active } }));
    for (const entry of entries2) publish2(entry.id, { url: entry.url ?? "", title: entry.title ?? "", live: false });
  };
  const ensureLayer = () => {
    if (layer?.isConnected) return layer;
    layer = doc.createElement("div");
    layer.className = "bt-browser-layer";
    Object.assign(layer.style, { position: "fixed", inset: "0", zIndex: "41", pointerEvents: "none" });
    doc.body.append(layer);
    return layer;
  };
  const place = (entry) => {
    const box2 = rect ?? { left: 0, top: 0, width: 800, height: 600 };
    Object.assign(entry.element.style, {
      left: `${box2.left}px`,
      top: `${box2.top}px`,
      width: `${box2.width}px`,
      height: `${box2.height}px`,
      visibility: shown === entry.tabId && visible && rect ? "visible" : "hidden"
    });
  };
  async function preview(tabId) {
    const entry = views.get(tabId);
    if (entry === void 0 || !entry.ready || !/^https?:/i.test(entry.element.getURL())) return false;
    let timer;
    const timeout = new Promise((resolve) => {
      timer = setTimeout(() => resolve(""), PREVIEW_TIMEOUT_MS);
    });
    try {
      const excerpt = await Promise.race([entry.element.executeJavaScript(PREVIEW_SCRIPT), timeout]);
      if (typeof excerpt !== "string" || excerpt === "" || views.get(tabId) !== entry) return false;
      publish2(tabId, { excerpt });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  }
  const observe = (entry) => {
    const { element } = entry;
    if (!entry.ready) return;
    const url = element.getURL();
    if (url.startsWith("about:blank#")) return;
    if (entry.fresh) {
      element.clearHistory();
      entry.fresh = false;
    }
    const title = element.getTitle();
    publish2(entry.tabId, { url, title, loading: element.isLoading(), canGoBack: element.canGoBack(), canGoForward: element.canGoForward(), live: true });
    persist(entry.botId);
  };
  async function create(tabId) {
    const botId = owner.get(tabId);
    const reservation = await bridge.acquire(`bot:${botId}`);
    if (disposed) {
      await bridge.release(reservation.lease).catch(() => {
      });
      return void 0;
    }
    const element = doc.createElement("webview");
    element.dataset.sidebarBrowserFrame = "webview";
    Object.assign(element.style, { position: "fixed", display: "flex", border: "0", pointerEvents: "auto", background: "#fff" });
    element.dataset.btBrowser = tabId;
    element.setAttribute("name", reservation.lease);
    element.setAttribute("partition", reservation.partition);
    element.setAttribute("allowpopups", "");
    element.setAttribute("src", `about:blank#${reservation.lease}`);
    const entry = { botId, tabId, element, lease: reservation.lease, ready: false, fresh: true, pending: pages.getSnapshot()[tabId]?.url || savedTab(botId, tabId)?.url, usedAt: Date.now() };
    const lifetime = new AbortController();
    entry.stop = () => lifetime.abort();
    const { signal } = lifetime;
    const unsubscribe = bridge.onOpenRequested(reservation.lease, (url) => void openTab(botId, url));
    signal.addEventListener("abort", unsubscribe, { once: true });
    element.addEventListener("dom-ready", () => {
      entry.ready = true;
      observe(entry);
      if (entry.pending) {
        const url = entry.pending;
        entry.pending = void 0;
        void element.loadURL(url).catch(() => {
        });
      }
    }, { signal });
    for (const name of ["did-navigate", "did-navigate-in-page", "did-start-loading", "did-stop-loading", "page-title-updated"]) {
      element.addEventListener(name, () => observe(entry), { signal });
    }
    element.addEventListener("did-stop-loading", () => {
      void preview(tabId);
    }, { signal });
    element.addEventListener("page-favicon-updated", (event) => {
      const favicon = event.favicons?.[0];
      if (typeof favicon === "string" && favicon.startsWith("data:")) publish2(tabId, { favicon });
    }, { signal });
    element.addEventListener("did-start-navigation", (event) => {
      if (!event.isMainFrame) return;
      if (blockedAddress(event.url)) {
        element.stop();
        publish2(tabId, { loading: false, error: BLOCKED });
        return;
      }
      publish2(tabId, { loading: true, error: null });
    }, { signal });
    element.addEventListener("did-fail-load", (event) => {
      if (event.isMainFrame && event.errorCode !== -3) publish2(tabId, { loading: false, error: event.errorDescription || `Error ${event.errorCode}` });
    }, { signal });
    element.addEventListener("render-process-gone", () => {
      if (views.get(tabId) === void 0) return;
      void release(tabId);
      publish2(tabId, { loading: false, error: "The page crashed." });
    }, { signal });
    views.set(tabId, entry);
    ensureLayer().append(element);
    place(entry);
    publish2(tabId, { live: true, loading: Boolean(entry.pending) });
    return entry;
  }
  const opening = /* @__PURE__ */ new Map();
  function open(tabId) {
    const entry = views.get(tabId);
    if (entry) return Promise.resolve(entry);
    let job = opening.get(tabId);
    if (job === void 0) {
      job = create(tabId).catch((error) => {
        console.warn("[apmixbot] browser acquire", error);
        publish2(tabId, { loading: false, error: String(error?.message ?? error) });
        return void 0;
      }).finally(() => opening.delete(tabId));
      opening.set(tabId, job);
      void job.then(() => trim());
    }
    return job;
  }
  function trim() {
    const idle = [...views.values()].filter((entry) => entry.tabId !== shown).sort((a, b) => a.usedAt - b.usedAt);
    while (views.size > MAX_LIVE && idle.length > 0) void release(idle.shift().tabId);
  }
  async function release(tabId) {
    const entry = views.get(tabId);
    if (entry === void 0) return;
    views.delete(tabId);
    entry.stop();
    entry.element.remove();
    publish2(tabId, { live: false, loading: false });
    await bridge.release(entry.lease).catch((error) => console.warn("[apmixbot] browser release", error));
  }
  function openTab(botId, url) {
    ensureTabs(botId);
    const tabId = `t${Date.now().toString(36)}-${++serial}`;
    owner.set(tabId, botId);
    tabs.set((state) => {
      const own = state[botId] ?? { ids: [], active: null };
      return { ...state, [botId]: { ids: [...own.ids, tabId], active: tabId } };
    });
    publish2(tabId, { url: "", title: "", live: false });
    if (typeof url === "string" && url !== "") void navigate(tabId, url);
    persist(botId);
    return tabId;
  }
  async function closeTab(botId, tabId) {
    const state = tabs.getSnapshot()[botId];
    if (state === void 0 || !state.ids.includes(tabId)) return;
    await opening.get(tabId)?.catch(() => {
    });
    if (shown === tabId) await show(null);
    await release(tabId);
    tabs.set((snapshot) => {
      const current = snapshot[botId];
      if (current === void 0 || !current.ids.includes(tabId)) return snapshot;
      const at2 = current.ids.indexOf(tabId);
      const ids = current.ids.filter((id) => id !== tabId);
      const active = current.active === tabId ? ids[Math.min(at2, ids.length - 1)] ?? null : current.active;
      const next = { ...snapshot };
      if (ids.length === 0) delete next[botId];
      else next[botId] = { ids, active };
      return next;
    });
    owner.delete(tabId);
    pages.set((snapshot) => {
      if (snapshot[tabId] === void 0) return snapshot;
      const { [tabId]: _, ...rest } = snapshot;
      return rest;
    });
    persist(botId);
  }
  function activate(botId, tabId) {
    ensureTabs(botId);
    const state = tabs.getSnapshot()[botId];
    if (state === void 0 || !state.ids.includes(tabId) || state.active === tabId) return;
    tabs.set((snapshot) => ({ ...snapshot, [botId]: { ...state, active: tabId } }));
    persist(botId);
  }
  const activeTab = (botId) => tabs.getSnapshot()[botId]?.active ?? null;
  async function show(tabId, box2 = null) {
    if (tabId !== null && tabId === shown && visible && box2 !== null) {
      rect = box2;
      const entry2 = views.get(tabId);
      if (entry2) place(entry2);
      clearTimeout(resizeLater);
      resizeLater = setTimeout(() => {
        for (const other of views.values()) place(other);
      }, RESIZE_LATER_MS);
      return;
    }
    shown = tabId;
    if (box2) rect = box2;
    visible = tabId !== null && box2 !== null;
    for (const entry2 of views.values()) place(entry2);
    if (tabId === null) return;
    const entry = await open(tabId);
    if (entry === void 0 || shown !== tabId) return;
    entry.usedAt = Date.now();
    place(entry);
  }
  async function navigate(tabId, input) {
    const url = browserAddress(input);
    if (url === null || blockedAddress(url)) {
      publish2(tabId, { error: url === null ? "Only http and https addresses open here." : BLOCKED });
      return false;
    }
    const entry = await open(tabId);
    if (entry === void 0) return false;
    publish2(tabId, { url, loading: true, error: null });
    persist(owner.get(tabId));
    if (!entry.ready) entry.pending = url;
    else void entry.element.loadURL(url).catch(() => {
    });
    return true;
  }
  async function forget(botId) {
    ensureTabs(botId);
    for (const tabId of tabs.getSnapshot()[botId]?.ids ?? []) {
      await opening.get(tabId)?.catch(() => {
      });
      if (shown === tabId) await show(null);
      await release(tabId);
      owner.delete(tabId);
      pages.set((snapshot) => {
        if (snapshot[tabId] === void 0) return snapshot;
        const { [tabId]: _, ...rest } = snapshot;
        return rest;
      });
    }
    tabs.set((snapshot) => {
      if (snapshot[botId] === void 0) return snapshot;
      const { [botId]: _, ...rest } = snapshot;
      return rest;
    });
    save(botId, void 0);
  }
  return {
    tabs,
    pages,
    /** Restore a Bot's saved strip (or an empty one) so the panel can render it. */
    ensureTabs,
    openTab,
    closeTab,
    activate,
    preview,
    show,
    navigate,
    command(tabId, name) {
      const entry = views.get(tabId);
      if (!entry?.ready) return;
      if (name === "back" && entry.element.canGoBack()) entry.element.goBack();
      else if (name === "forward" && entry.element.canGoForward()) entry.element.goForward();
      else if (name === "reload") entry.element.reload();
      else if (name === "stop") entry.element.stop();
    },
    focus(tabId) {
      views.get(tabId)?.element.focus();
    },
    /** Pages a read can reach: each Bot's active tab, live and showing a document. */
    openPages() {
      const open2 = {};
      const snapshot = pages.getSnapshot();
      for (const [botId, state] of Object.entries(tabs.getSnapshot())) {
        const tabId = state.active;
        const entry = tabId ? views.get(tabId) : void 0;
        const page = tabId ? snapshot[tabId] : void 0;
        if (entry?.ready && page?.url) open2[botId] = { url: page.url, title: page.title };
      }
      return open2;
    },
    /** A Bot's read reaches its active tab. */
    async read(botId) {
      const tabId = activeTab(botId);
      const entry = tabId ? views.get(tabId) : void 0;
      if (!entry?.ready) throw new Error("This Bot has no browser page open.");
      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("The page took too long to read.")), READ_TIMEOUT_MS);
      });
      try {
        return await Promise.race([entry.element.executeJavaScript(READ_PAGE_SCRIPT), timeout]);
      } finally {
        clearTimeout(timer);
      }
    },
    noteRead(botId) {
      const tabId = activeTab(botId);
      if (tabId) publish2(tabId, { readAt: Date.now() });
    },
    release,
    forget,
    /** Forget every Bot outside `botIds`, as when Bots were deleted from another window. */
    retain(botIds) {
      const keep = new Set(botIds);
      const known = /* @__PURE__ */ new Set([...Object.keys(tabs.getSnapshot()), ...Object.keys(saved), ...owner.values()]);
      for (const entry of views.values()) known.add(entry.botId);
      return Promise.all([...known].filter((botId) => !keep.has(botId)).map(forget));
    },
    dispose() {
      disposed = true;
      clearTimeout(resizeLater);
      for (const entry of views.values()) void release(entry.tabId);
      layer?.remove();
    }
  };
}
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function serveBrowserReads({ browsers, post, clientId = globalThis.crypto.randomUUID(), retryMs = 1e3 }) {
  let stopped = false;
  let poll;
  let reported = "";
  const answered = /* @__PURE__ */ new Map();
  const answer = async ({ id, botId }) => {
    let job = answered.get(id);
    if (job === void 0) {
      job = (async () => {
        try {
          const result = { id, ok: true, page: await browsers.read(botId) };
          browsers.noteRead(botId);
          return result;
        } catch (error) {
          return { id, ok: false, error: error instanceof Error ? error.message : String(error) };
        }
      })();
      answered.set(id, job);
      if (answered.size > 200) answered.delete(answered.keys().next().value);
    }
    await post("browser-result", await job).catch((error) => console.warn("[apmixbot] browser result", error));
  };
  const loop = async () => {
    let failures = 0;
    while (!stopped) {
      poll = new AbortController();
      const open = browsers.openPages();
      reported = JSON.stringify(open);
      try {
        const requests = await post("browser-wait", { clientId, open }, poll.signal);
        failures = 0;
        for (const request of Array.isArray(requests) ? requests : []) void answer(request);
      } catch {
        if (stopped) return;
        if (poll.signal.aborted) continue;
        failures += 1;
        await sleep(Math.min(3e4, retryMs * 2 ** Math.min(failures, 5)));
      }
    }
  };
  const offPages = browsers.pages.subscribe(() => {
    if (JSON.stringify(browsers.openPages()) !== reported) poll?.abort();
  });
  void loop();
  return () => {
    stopped = true;
    offPages();
    poll?.abort();
  };
}

// src/client/toast.js
var import_react39 = require("react");
var TOAST_MS = 6e3;
function ErrorToast({ useUi, actions }) {
  const toast = useUi((state) => state.toast);
  const [leaving, setLeaving] = (0, import_react39.useState)(false);
  (0, import_react39.useEffect)(() => {
    if (!toast) return void 0;
    setLeaving(false);
    const fade = setTimeout(() => setLeaving(true), TOAST_MS);
    const gone = setTimeout(() => actions.dismissToast(toast.token), TOAST_MS + 200);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [toast?.token]);
  if (!toast) return null;
  return (0, import_react39.createElement)(
    "div",
    { className: "bt-toast", role: "alert", "data-leaving": leaving || void 0 },
    (0, import_react39.createElement)("span", { className: "bt-toast-text" }, toast.text),
    (0, import_react39.createElement)("button", { type: "button", className: "bt-icon-btn bt-toast-close", "aria-label": t("Dismiss"), onClick: () => actions.dismissToast(toast.token) }, (0, import_react39.createElement)(CloseIcon))
  );
}
var TOAST_CSS = `
.bt-toast{position:fixed;left:50%;bottom:28px;z-index:1000;display:flex;align-items:center;gap:8px;max-width:min(560px,calc(100vw - 32px));padding:8px 8px 8px 14px;border-radius:12px;background:var(--bt-card,#fff);color:var(--bt-ink,#141414);border:1px solid var(--bt-line-2,rgba(0,0,0,.15));box-shadow:0 8px 28px rgba(0,0,0,.14);font-size:13px;line-height:18px;transform:translateX(-50%);animation:bt-toast-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing},bt-veil-in .2s ease-out}
.bt-toast[data-leaving]{opacity:0;transform:translate(-50%,6px) scale(.98);filter:blur(3px);transition:opacity .18s ease-in,transform .18s ease-in,filter .18s ease-in}
.bt-toast-text{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical}
.bt-toast-text::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--bt-danger,#e02135);margin:0 8px 1px 0}
.bt-toast-close{flex:none}
@keyframes bt-toast-in{from{transform:translate(-50%,16px) scale(.94)}}
@media (prefers-reduced-motion:reduce){.bt-toast{animation:none}.bt-toast[data-leaving]{transition:none}}
`;

// src/client/approval-dock.js
var import_react40 = require("react");
var NONE2 = [];
function cardsFor(sessionId, roster, work) {
  const room2 = roster.roomsById?.[sessionId];
  const bot = room2 ? void 0 : roster.byId?.[sessionId];
  const here = (entry) => room2 ? entry.roomId === room2.id : bot !== void 0 && entry.roomId === void 0 && entry.botId === bot.id;
  return {
    approvals: (work?.approvals ?? NONE2).filter((entry) => entry.kind === "app" && entry.answerable && here(entry) && roster.byId?.[entry.botId]),
    links: (work?.links ?? NONE2).filter((entry) => here(entry) && roster.byId?.[entry.botId])
  };
}
function addressParts(address) {
  try {
    const url = new URL(address);
    return { site: url.host, rest: `${url.pathname === "/" ? "" : url.pathname}${url.search}${url.hash}` };
  } catch {
    return { site: "", rest: String(address ?? "") };
  }
}
function useAnswer(actions) {
  const [busy, setBusy] = (0, import_react40.useState)(false);
  const run = (task) => {
    setBusy(true);
    void Promise.resolve().then(task).catch((error) => actions.reportError(error, "approval")).finally(() => setBusy(false));
  };
  return [busy, run];
}
function AppApprovalCard({ approval, bot, actions }) {
  const [busy, run] = useAnswer(actions);
  const answer = (choice) => run(() => actions.answerApproval(approval.id, choice));
  const title = t("{name} wants to use {app}", { name: bot.name, app: approval.app });
  return (0, import_react40.createElement)(
    "div",
    { className: "bt-q bt-ap", role: "group", "aria-label": title },
    (0, import_react40.createElement)("div", { className: "bt-q-head" }, (0, import_react40.createElement)("h4", { className: "bt-q-title" }, title)),
    (0, import_react40.createElement)("div", { className: "bt-ap-tool" }, approval.tool),
    approval.detail?.code ? (0, import_react40.createElement)("code", { className: "bt-ap-code" }, approval.detail.code) : null,
    (0, import_react40.createElement)(
      "div",
      { className: "bt-q-foot" },
      (0, import_react40.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: () => answer("reject") }, t("Decline")),
      approval.always ? (0, import_react40.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, title: t("Bots use {tool} of {app} from now on without asking", { tool: approval.tool, app: approval.app }), onClick: () => answer("always") }, t("Always allow")) : null,
      (0, import_react40.createElement)("button", { type: "button", className: "bt-q-submit", disabled: busy, onClick: () => answer("allow") }, t("Allow once"))
    )
  );
}
function AppLinkCard({ link, actions }) {
  const [busy, run] = useAnswer(actions);
  const { site, rest } = addressParts(link.url);
  const title = t("{app} has a link for you to open", { app: link.app });
  return (0, import_react40.createElement)(
    "div",
    { className: "bt-q bt-ap", role: "group", "aria-label": title },
    (0, import_react40.createElement)("div", { className: "bt-q-head" }, (0, import_react40.createElement)("h4", { className: "bt-q-title" }, title)),
    (0, import_react40.createElement)("div", { className: "bt-ap-url" }, (0, import_react40.createElement)("b", null, site), rest),
    (0, import_react40.createElement)(
      "div",
      { className: "bt-q-foot" },
      (0, import_react40.createElement)("button", { type: "button", className: "bt-q-btn", disabled: busy, onClick: () => run(() => actions.dismissAppLink(link.id)) }, t("Done")),
      (0, import_react40.createElement)("a", { className: "bt-q-submit bt-ap-open", href: link.url, target: "_blank", rel: "noopener noreferrer" }, t("Open link"))
    )
  );
}
function ApprovalDock({ sessionId, useRoster, useWork, actions }) {
  const roster = useRoster((value) => value);
  const work = useWork((value) => value);
  const { approvals, links } = cardsFor(sessionId, roster, work);
  if (approvals.length === 0 && links.length === 0) return null;
  return (0, import_react40.createElement)(
    "div",
    { className: "bt-q-dock bt-ap-dock" },
    approvals.map((approval) => (0, import_react40.createElement)(AppApprovalCard, { key: approval.id, approval, bot: roster.byId[approval.botId], actions })),
    links.map((link) => (0, import_react40.createElement)(AppLinkCard, { key: link.id, link, actions }))
  );
}
var APPROVAL_CSS = `
.bt-ap-dock{flex-direction:column;align-items:center}
.bt-q.bt-ap{gap:8px;animation:bt-rise .2s ease-out backwards}
.bt-ap-tool{font:13px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--bt-ink);overflow-wrap:anywhere}
.bt-ap-code{display:block;max-height:88px;overflow:auto;padding:6px 10px;border-radius:8px;background:var(--bt-hover);font:12px/17px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--bt-ink-2);white-space:pre-wrap;overflow-wrap:anywhere}
.bt-ap-url{font-size:13px;line-height:18px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-ap-url b{font-weight:600;color:var(--bt-ink)}
.bt-ap-open{display:inline-flex;align-items:center;text-decoration:none}
.bt-ap .bt-q-foot>button:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){.bt-q.bt-ap{animation:none}}
`;

// src/client/user-message.js
var import_react41 = require("react");
var ui = __toESM(require("@apmixbot/dsh-client-ui-primitives"), 1);
var canDrawUserMessages = () => typeof ui.projectUserText === "function";
function contentParts(content) {
  const texts2 = [];
  const attachments = [];
  const rest = [];
  for (const block of Array.isArray(content) ? content : []) {
    if (block?.type === "text" && typeof block.text === "string") texts2.push(block.text);
    else if ((block?.type === "image" || block?.type === "file") && block.attachment !== void 0) attachments.push(block);
    else rest.push(block);
  }
  return { text: texts2.join("\n"), attachments, rest };
}
function mentionableBots(roster, sessionId) {
  const room2 = roster.roomsById[sessionId];
  if (room2) return room2.members.map((id) => roster.byId[id]).filter(Boolean);
  return roster.byId[sessionId] ? roster.bots : [];
}
function userTextParts(text, bots, referenceLabels = []) {
  const parts = [];
  let cursor = 0;
  for (const span of mentionSpans(text, bots, { references: referenceLabels })) {
    if (!span.bot) continue;
    if (span.start > cursor) parts.push({ text: text.slice(cursor, span.start) });
    parts.push({ bot: span.bot, label: text.slice(span.start + 1, span.end) });
    cursor = span.end;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor) });
  return parts;
}
function UserText({ text, bots, referenceLabels, skillNames, references, actions }) {
  return userTextParts(text, bots, referenceLabels).map((part, index) => part.bot ? (0, import_react41.createElement)(
    "button",
    { key: index, type: "button", className: "bt-umention", title: `@${part.bot.name}`, onClick: () => actions.openSession(part.bot.id) },
    (0, import_react41.createElement)(BotMark, { bot: part.bot, size: 16 }),
    part.label
  ) : (0, import_react41.createElement)(import_react41.Fragment, { key: index }, ui.projectUserText(part.text, referenceLabels, skillNames, "skill", references)));
}
function Attachments({ attachments, renderMessageImages }) {
  const compact2 = attachments.length > 1;
  return (0, import_react41.createElement)("div", { className: "bt-uattach" }, attachments.map((block, index) => {
    if (block.type === "image") {
      return renderMessageImages ? (0, import_react41.createElement)(import_react41.Fragment, { key: index }, renderMessageImages({ images: [{ attachment: block.attachment }], align: "end", compact: compact2 })) : null;
    }
    const file = block.attachment;
    const meta = [ui.fileExtension?.(file.name)?.toUpperCase().slice(0, 8), ui.fileSizeText?.(file.bytes)].filter(Boolean).join(" · ");
    return (0, import_react41.createElement)(
      "span",
      { key: index, className: "bt-ufile", title: file.name },
      ui.FileTypeIcon ? (0, import_react41.createElement)(ui.FileTypeIcon, { path: file.name, className: "bt-ufile-icon" }) : null,
      (0, import_react41.createElement)("span", { className: "bt-ufile-text" }, (0, import_react41.createElement)("span", { className: "bt-ufile-name" }, file.name), meta ? (0, import_react41.createElement)("span", { className: "bt-ufile-meta" }, meta) : null)
    );
  }));
}
function CopyButton({ text }) {
  const [copied, setCopied] = (0, import_react41.useState)(false);
  const copy = () => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1e3);
    });
  };
  return (0, import_react41.createElement)("button", { type: "button", className: "bt-tool", "aria-label": copied ? t("Copied") : t("Copy"), title: copied ? t("Copied") : t("Copy"), onClick: copy }, copied ? (0, import_react41.createElement)(CheckIcon) : (0, import_react41.createElement)(CopyIcon));
}
var clock3 = (time) => typeof time === "number" ? new Date(time).toLocaleTimeString(dateLocale(), { hour: "numeric", minute: "2-digit" }) : void 0;
function UserMessageCell({ node, sessionId, useRoster, actions, renderMessageImages, openFile, openSkill }) {
  const roster = useRoster((value) => value);
  const data = node.data ?? {};
  const { text, attachments, rest } = contentParts(data.content);
  const referenceLabels = data.referenceLabels ?? [];
  const references = openFile && openSkill ? { openFile, openSkill } : void 0;
  const steering = node.kind === "steering";
  const groupTime = roster.roomsById?.[sessionId] && Number.isFinite(data.time) ? messageClock(data.time) : void 0;
  const { shown, folded, control } = useFold(text, { markdown: false });
  const body = (0, import_react41.createElement)(UserText, { text: shown, bots: mentionableBots(roster, sessionId), referenceLabels, skillNames: data.skillNames ?? [], references, actions });
  return (0, import_react41.createElement)(
    "div",
    { className: "bt-umsg", "data-steering": steering || void 0 },
    (0, import_react41.createElement)(
      "div",
      { className: "bt-ustack" },
      attachments.length > 0 ? (0, import_react41.createElement)(Attachments, { attachments, renderMessageImages }) : null,
      text !== "" || rest.length > 0 ? (0, import_react41.createElement)(
        "div",
        { className: "bt-ubody", title: clock3(data.time), "data-folded": folded || void 0 },
        control ? (0, import_react41.createElement)("div", { className: "bt-fold-body" }, body) : body,
        control,
        rest.map((block, index) => ui.JsonBlock ? (0, import_react41.createElement)(ui.JsonBlock, { key: index, label: t("Content"), payload: block }) : null)
      ) : null,
      referenceLabels.length > 0 ? (0, import_react41.createElement)("div", { className: "bt-urefs" }, t("Referenced {labels}", { labels: referenceLabels.join(t(", ")) })) : null,
      groupTime ? (0, import_react41.createElement)("div", { className: "bt-utime", title: clockLabel(data.time) }, groupTime) : null
    ),
    text === "" ? null : (0, import_react41.createElement)("div", { className: "bt-utools" }, (0, import_react41.createElement)(CopyButton, { text }))
  );
}
var USER_MESSAGE_CSS = `
.bt-umsg{display:flex;flex-direction:row-reverse;align-items:center;justify-content:flex-start;gap:4px}
.bt-ustack{min-width:0;max-width:min(calc(var(--dsh-chat-content-width,748px) * .702),82%);display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.bt-ubody{max-width:100%;box-sizing:border-box;background:var(--bt-user);color:var(--bt-user-ink);border-radius:18px 18px 6px 18px;padding:7px 12px;font-size:var(--dsh-content-font-size,14px);line-height:calc(var(--dsh-content-font-size,14px) + 8px);white-space:pre-wrap;word-break:break-word}
.bt-ubody a{color:inherit}
.bt-umention{display:inline-flex;align-items:center;gap:3px;vertical-align:-3px;max-width:100%;padding:0 1px;border:0;background:none;color:inherit;font:inherit;font-weight:600;line-height:inherit;cursor:pointer;border-radius:6px;white-space:nowrap}
.bt-umention:hover{text-decoration:underline;text-underline-offset:2px}
.bt-umention>:first-child{flex:none}
.bt-uattach{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;max-width:100%}
.bt-ufile{display:inline-flex;align-items:center;gap:10px;box-sizing:border-box;width:240px;min-height:64px;padding:8px 12px;border-radius:18px;border:.5px solid var(--bt-line-2);background:var(--bt-card)}
.bt-ufile-icon{flex:none;width:28px;height:28px}
.bt-ufile-text{display:flex;flex-direction:column;min-width:0}
.bt-ufile-name{font-size:14px;line-height:22px;font-weight:500;color:var(--bt-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-ufile-meta{font-size:12px;line-height:15px;color:var(--bt-ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bt-urefs{font-size:13px;line-height:18px;color:var(--bt-ink-3)}
.bt-utools{display:flex;flex:none;gap:2px;opacity:0;visibility:hidden;transition:opacity .12s ease,visibility .12s}
.bt-umsg:hover .bt-utools,.bt-umsg:focus-within .bt-utools{opacity:1;visibility:visible}
`;

// src/client/approval-notices.js
function noticeApprovals({ work, roster, shownSession, openSession, since = Date.now() }) {
  const told = /* @__PURE__ */ new Set();
  const notify = () => {
    const approvals = work.getSnapshot().approvals ?? [];
    for (const id of told) {
      if (!approvals.some((entry) => entry.id === id)) told.delete(id);
    }
    if (typeof Notification !== "function" || Notification.permission !== "granted") return;
    for (const entry of approvals) {
      if (told.has(entry.id)) continue;
      told.add(entry.id);
      if ((entry.at ?? 0) < since) continue;
      const place = entry.roomId ?? entry.sessionId;
      if (document.visibilityState === "visible" && shownSession() === place) continue;
      const { byId, roomsById } = roster.getSnapshot();
      const room2 = entry.roomId ? roomsById[entry.roomId] : void 0;
      const note = new Notification(t("{name} is waiting for your approval", { name: byId[entry.botId]?.name ?? t("A Bot") }), {
        body: [room2?.name, entry.tool].filter(Boolean).join(" · "),
        tag: `apmixbot-approval-${entry.id}`
      });
      note.onclick = () => {
        window.focus();
        openSession(entry.roomId ?? entry.botId);
        note.close();
      };
    }
  };
  notify();
  return work.subscribe(notify);
}

// src/client/open-listed.js
function listedOpener({ list, open, refresh, current }) {
  let drop = () => {
  };
  return (target) => {
    drop();
    drop = () => {
    };
    const listed = () => list.getSnapshot().byId?.[target] !== void 0;
    if (listed()) {
      open(target);
      return;
    }
    const from = current?.();
    const off = list.subscribe(() => {
      if (current?.() !== from) {
        off();
        drop = () => {
        };
        return;
      }
      if (!listed()) return;
      off();
      drop = () => {
      };
      open(target);
    });
    drop = off;
    refresh?.();
  };
}

// src/client/index.js
var inject = ["sessions", "uiWorkspace", "uiConversation", "slots", "theme", "layout"];
function apply(ctx) {
  ctx.effect(() => installLocale(ctx.get("locale")), "apmixbot: interface copy");
  const roster = createSource(EMPTY_ROSTER);
  const unreadStore = sharedMap(STORAGE.unread);
  const reactionStore = sharedMap(STORAGE.reactions);
  const seenStore = sharedMap(STORAGE.seen);
  let seenAt = seenStore.read();
  const ui2 = createSource({ details: null, view: "details", renaming: false, tab: null, newChat: null, exchange: null, menu: null, palette: null, quote: null, settings: null, memory: null, toast: null, renameAgent: null, unread: unreadStore.read(), reactions: reactionStore.read(), visits: {} });
  const surface = createSource({ mode: readMode(), plain: false });
  let agentSessionCache = /* @__PURE__ */ new Set();
  try {
    agentSessionCache = new Set(JSON.parse(localStorage.getItem(STORAGE.agentSessions) ?? "[]"));
  } catch {
    agentSessionCache = /* @__PURE__ */ new Set();
  }
  const pendingAdopt = /* @__PURE__ */ new Map();
  const isAgentSessionId = (id) => isAgentSession(roster.getSnapshot(), agentSessionCache, id) || pendingAdopt.has(id);
  const agentOfSession = (id) => roster.getSnapshot().agentOf[id] ?? pendingAdopt.get(id);
  const workspaces = ctx.get("workspaces");
  const workspaceOf = (sessionId) => {
    const items = workspaces?.list?.getSnapshot()?.items ?? [];
    return items.find((item) => item.sessionIds?.includes(sessionId))?.workspaceId;
  };
  let expected = null;
  const setPlain = (plain) => surface.set((state) => state.plain === plain ? state : { ...state, plain });
  const dropPanels = () => ui2.set((state) => state.details || state.renaming ? { ...state, details: null, view: "details", renaming: false, tab: null } : state);
  const seenKey = (id) => roster.getSnapshot().byId?.[id]?.id ?? id;
  const leaveVisits = (ids) => {
    seenAt = seenStore.update((seen) => noteLeft(seen, ids.map(seenKey), Date.now()), seenAt);
  };
  ctx.effect(() => {
    const onPageHide = () => leaveVisits(Object.keys(ui2.getSnapshot().visits ?? {}));
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, "apmixbot: remember visits on page hide");
  ctx.effect(() => {
    const onStorage = (event) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === null || event.key === unreadStore.key) ui2.set((state) => ({ ...state, unread: unreadStore.read(state.unread) }));
      if (event.key === null || event.key === reactionStore.key) ui2.set((state) => ({ ...state, reactions: reactionStore.read(state.reactions) }));
      if (event.key === null || event.key === seenStore.key) seenAt = seenStore.read(seenAt);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, "apmixbot: follow other windows");
  const activity = createSource({});
  const work = createSource({ bots: {}, approvals: [] });
  let workKey = "";
  const live = createSource({});
  const cards = createSource({});
  const heldCards = createSource({});
  const turnClock = createSource({});
  let activityKey = "{}";
  const memoryNews = createSource({});
  let memoryNewsKey;
  const noteMemoryNews = (next) => {
    const key = JSON.stringify(next);
    if (key === memoryNewsKey) return;
    const opening = memoryNewsKey === void 0;
    memoryNewsKey = key;
    memoryNews.set((state) => Object.fromEntries(Object.entries(next).map(([id, entry]) => [
      id,
      state[id]?.at === entry.at ? state[id] : { ...entry, seen: opening ? 0 : Date.now() }
    ])));
  };
  const PREFS_KEY = STORAGE.prefs;
  let savedPrefs = {};
  try {
    savedPrefs = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}") ?? {};
  } catch {
    savedPrefs = {};
  }
  const writeUnread = (id, value) => {
    const unread = unreadStore.update((marks) => setUnread(marks, id, value), ui2.getSnapshot().unread);
    ui2.set((state) => JSON.stringify(state.unread) === JSON.stringify(unread) ? state : { ...state, unread });
  };
  const refreshed = /* @__PURE__ */ new Set();
  let pulls = 0;
  let applied = 0;
  const pull = async () => {
    const order = ++pulls;
    const known = roster.getSnapshot();
    const value = await call("state", { since: known.revision, models: known.modelsKey ?? "", locale: language() });
    if (order < applied) return;
    applied = order;
    const nextActivity = JSON.stringify(value.activity ?? {});
    if (nextActivity !== activityKey) {
      activityKey = nextActivity;
      activity.set(value.activity ?? {});
    }
    const nextWork = JSON.stringify(value.work ?? null);
    if (nextWork !== workKey) {
      workKey = nextWork;
      work.set(value.work ?? { bots: {}, approvals: [] });
    }
    noteMemoryNews(value.memoryNews ?? {});
    const current = roster.getSnapshot();
    const live2 = {};
    if (value.connectors !== void 0 && JSON.stringify(value.connectors) !== JSON.stringify(current.connectors ?? [])) live2.connectors = value.connectors;
    if (value.apps !== void 0 && JSON.stringify(value.apps) !== JSON.stringify(current.apps ?? null)) live2.apps = value.apps;
    if (value.capabilityStatuses !== void 0 && JSON.stringify(value.capabilityStatuses) !== JSON.stringify(current.capabilityStatuses ?? {})) live2.capabilityStatuses = value.capabilityStatuses;
    if (value.readOnly !== void 0 && value.readOnly !== (current.readOnly ?? null)) live2.readOnly = value.readOnly;
    if (Object.keys(live2).length > 0 && current.ready) roster.set({ ...current, ...live2 });
    if (value.unchanged || value.revision === current.revision && value.modelsKey === current.modelsKey) return;
    if (Object.keys(seenAt).length === 0) leaveVisits([...value.bots, ...value.rooms].map((entry) => entry.id));
    roster.set(indexRoster(value));
    try {
      const ids = (value.agents ?? []).flatMap((agent) => agent.sessions ?? []);
      localStorage.setItem(STORAGE.agentSessions, JSON.stringify(ids));
      agentSessionCache = new Set(ids);
    } catch {
    }
    const listed = ctx.sessions.list.getSnapshot().byId ?? {};
    for (const id of pendingAdopt.keys()) {
      if (roster.getSnapshot().agentOf[id] !== void 0 || listed[id] === void 0) pendingAdopt.delete(id);
    }
    for (const id of [...value.bots.map(currentPart), ...value.rooms.map((room2) => room2.id)]) {
      if (refreshed.has(id)) continue;
      refreshed.add(id);
      void Promise.resolve(ctx.sessions.refreshProjections?.(id)).catch(quietly("refresh projections"));
    }
  };
  ctx.effect(() => {
    let stopped = false;
    let running = false;
    let timer;
    const loop = async () => {
      clearTimeout(timer);
      if (running || stopped) return;
      running = true;
      try {
        await pull();
      } catch (error) {
        if (!stopped) console.warn("[apmixbot] state", error);
      } finally {
        running = false;
      }
      if (!stopped) timer = setTimeout(loop, document.hidden ? 1e4 : 1500);
    };
    const wake = () => {
      if (!document.hidden) void loop();
    };
    document.addEventListener("visibilitychange", wake);
    void loop();
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", wake);
    };
  }, "apmixbot: roster poll");
  ctx.effect(() => {
    const onError = (event) => {
      if (!event.error && /^(?:Script error|ResizeObserver loop)/u.test(event.message ?? "")) return;
      noteClientError("page", event.error ?? event.message);
    };
    const onRejection = (event) => {
      if (event.reason?.name === "AbortError") return;
      noteClientError("page", event.reason);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, "apmixbot: page errors");
  const update = createSource({ available: false, phase: "idle" });
  let wakeUpdate = () => {
  };
  ctx.effect(() => {
    let stopped = false;
    let timer;
    const loop = async () => {
      clearTimeout(timer);
      if (stopped) return;
      const value = await call("update-check", { fresh: false }).catch(() => null);
      if (stopped) return;
      if (value) update.set(value);
      timer = setTimeout(loop, value?.phase === "installing" ? 2e3 : 60 * 6e4);
    };
    wakeUpdate = loop;
    void loop();
    return () => {
      stopped = true;
      clearTimeout(timer);
      wakeUpdate = () => {
      };
    };
  }, "apmixbot: update check");
  const bridge = window.dshDesktop?.protocolVersion === 1 ? window.dshDesktop.browser ?? null : null;
  const browsers = bridge ? createBotBrowsers({ bridge, createSource }) : null;
  if (browsers) {
    ctx.effect(() => {
      let stopReads = null;
      const sync = () => {
        const snapshot = roster.getSnapshot();
        if (!snapshot.ready) return;
        const on = snapshot.browser === true;
        if (on && !stopReads) stopReads = serveBrowserReads({ browsers, post: call });
        if (!on && stopReads) {
          stopReads();
          stopReads = null;
        }
        void browsers.retain(snapshot.bots.map((bot) => bot.id));
        ui2.set((state) => state.details && state.view === "browser" && (!on || !snapshot.byId[state.details]) ? { ...state, view: "details" } : state);
      };
      sync();
      const offRoster = roster.subscribe(sync);
      return () => {
        offRoster();
        stopReads?.();
        browsers.dispose();
      };
    }, "apmixbot: Bot browsers");
  }
  ctx.effect(() => () => {
    markupCache.clear();
  }, "apmixbot: character markup");
  const installMentions = () => {
    const style = installStyles("", "mentions");
    let last = "";
    const render = () => {
      const next = roster.getSnapshot().bots.map((bot) => {
        const anchor = `.bt-bubble a[href="${MENTION_ORIGIN}${bot.id}"]`;
        const chip = /\s/.test(bot.name) ? "" : `[class*="_userRow"] [data-ref-chip="file"][title="@${bot.name.replace(/["\\]/g, "\\$&")}" i]`;
        const look = lookOf(bot);
        const marks = chip ? `${anchor}::before,${chip}::before` : `${anchor}::before`;
        const mark = look.image ? `${marks}{background:center/cover url("${look.image}");-webkit-mask:none;mask:none;border-radius:50%}` : `${marks}{background:${paintCss(look.color)};-webkit-mask-image:${maskOf(look.shape)};mask-image:${maskOf(look.shape)}}`;
        const chipBase = chip ? `${chip}{color:inherit;font-weight:600}${chip}>svg{display:none}${chip}::before{content:"";display:inline-block;flex:none;width:16px;height:16px;margin-right:3px;vertical-align:-3px;-webkit-mask:${DEFAULT_MASK} center/contain no-repeat;mask:${DEFAULT_MASK} center/contain no-repeat}` : "";
        return `${anchor}{color:${inkText(look.color)}}${chipBase}${mark}`;
      }).join("\n");
      if (next !== last) style.textContent = last = next;
    };
    render();
    const offRoster = roster.subscribe(render);
    const offRegistry = registry.subscribe(render);
    return () => {
      offRoster();
      offRegistry();
      style.remove();
    };
  };
  const installTheme = () => {
    const style = installStyles("", "theme");
    let key = "";
    let releaseTokens = null;
    const render = () => {
      const snapshot = roster.getSnapshot();
      const prefs = snapshot.ready ? snapshot.prefs ?? {} : savedPrefs;
      const themes = allThemes();
      const id = themes[prefs.theme] ? prefs.theme : DEFAULT_THEME;
      const accent = isHex(prefs.accent) ? prefs.accent : void 0;
      const motion = prefs.motion === "quiet" || prefs.motion === "lively" ? prefs.motion : "normal";
      document.body.dataset.btMotion = motion;
      const next = `${id}|${accent ?? ""}|${motion}|${registry.getSnapshot()}`;
      if (next === key) return;
      key = next;
      style.textContent = themeCss(themes[id], accent);
      const release = releaseTokens;
      releaseTokens = ctx.theme.overrideTokens("apmixbot", shellTokens(themes[id]));
      if (typeof release === "function") release();
      if (snapshot.ready) {
        try {
          localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: prefs.theme, accent: prefs.accent, motion: prefs.motion }));
        } catch {
        }
      }
    };
    render();
    const offRoster = roster.subscribe(render);
    const offRegistry = registry.subscribe(render);
    return () => {
      offRoster();
      offRegistry();
      try {
        if (typeof releaseTokens === "function") releaseTokens();
      } finally {
        delete document.body.dataset.btMotion;
        style.remove();
      }
    };
  };
  ctx.effect(() => {
    const hub = { registerShape, registerTheme, themes: () => Object.keys(allThemes()), shapes: () => Object.keys(SHAPES) };
    const queued = Array.isArray(window.dshBotQueue) ? window.dshBotQueue : [];
    window.dshBot = hub;
    window.dshBotQueue = { push: (task) => {
      try {
        task(hub);
      } catch (error) {
        console.warn("[apmixbot] registration", error);
        noteClientError("registration", error);
      }
    } };
    for (const task of queued) window.dshBotQueue.push(task);
    return () => {
      if (window.dshBot === hub) delete window.dshBot;
      delete window.dshBotQueue;
    };
  }, "apmixbot: registry");
  ctx.inject(["shortcuts"], (scope) => {
    scope.effect(() => holdShellShortcuts(scope.shortcuts), "apmixbot: settings shortcut");
  });
  const after = (promise) => promise.then(async (value) => {
    await pull().catch(() => {
    });
    return value;
  });
  const partFor = (id) => {
    const bot = roster.getSnapshot().byId[id];
    return bot ? currentPart(bot) : id;
  };
  const agentSessions = (agentId) => {
    const ids = [...roster.getSnapshot().agentsById[agentId]?.sessions ?? []];
    for (const [id, owner] of pendingAdopt) if (owner === agentId && !ids.includes(id)) ids.push(id);
    return ids;
  };
  const mainView = () => Object.values(ctx.sessions.list.getSnapshot().byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id;
  const show = listedOpener({ list: ctx.sessions.list, refresh: () => Promise.resolve(ctx.sessions.refresh?.()).catch(quietly("refresh sessions")), open: (target) => {
    expected = target;
    ctx.uiWorkspace.openSession(target);
  }, current: mainView });
  const actions = {
    ...teamActions({ call, after, partFor, roster, ui: ui2, live, cards, heldCards, turnClock }),
    // The full-pane overlays sit above the conversation, so opening one must dismiss them
    // or the click appears to do nothing.
    isAgentSession: (id) => isAgentSessionId(id),
    openSession: (id) => {
      if (isAgentSessionId(id)) return actions.openAgentSession(id);
      ui2.set((state) => state.newChat || state.exchange || state.menu || state.palette ? { ...state, newChat: null, exchange: null, menu: null, palette: null } : state);
      setPlain(false);
      const target = partFor(id);
      show(target);
    },
    // The conversation replacements withdraw for a plain Session; set the surface
    // before the navigation so the Bot skin never flashes.
    openAgentSession: (sessionId) => {
      ui2.set((state) => ({ ...state, newChat: null, exchange: null, menu: null, palette: null, details: null, view: "details", renaming: false, tab: null }));
      setPlain(true);
      show(sessionId);
    },
    addAgent: async () => {
      const agent = await after(call("add-agent"));
      if (agent?.sessions?.[0] !== void 0) actions.openAgentSession(agent.sessions[0]);
      return agent;
    },
    openAgent: (agentId) => {
      const agent = roster.getSnapshot().agentsById[agentId];
      if (agent === void 0) return;
      const list = ctx.sessions.list.getSnapshot();
      const recent = agentSessions(agentId).sort((a, b) => (list.byId[b]?.updatedAt ?? 0) - (list.byId[a]?.updatedAt ?? 0));
      if (recent.length === 0) return actions.newAgentSession(agentId);
      actions.openAgentSession(recent[0]);
    },
    newAgentSession: async (agentId) => {
      const agent = roster.getSnapshot().agentsById[agentId];
      if (agent === void 0) return;
      const list = ctx.sessions.list.getSnapshot();
      const recent = agentSessions(agentId).sort((a, b) => (list.byId[b]?.updatedAt ?? 0) - (list.byId[a]?.updatedAt ?? 0));
      if (recent.length > 0 && list.byId[recent[0]]?.blank === true) {
        actions.openAgentSession(recent[0]);
        return recent[0];
      }
      const { sessionId } = await after(call("agent-session", { agentId, workspaceId: workspaceOf(recent[0]) }));
      actions.openAgentSession(sessionId);
      return sessionId;
    },
    archiveAgentSession: async (agentId, sessionId) => {
      await after(call("agent-archive", { agentId, sessionId }));
      const list = ctx.sessions.list.getSnapshot();
      const main = Object.values(list.byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id;
      if (main !== sessionId) return;
      const rest = roster.getSnapshot().agentsById[agentId]?.sessions ?? [];
      if (rest.length > 0) actions.openAgent(agentId);
      else if (roster.getSnapshot().mainBotId) actions.openSession(roster.getSnapshot().mainBotId);
    },
    renameAgentSession: (agentId, sessionId, title) => after(call("agent-rename", { agentId, sessionId, title })),
    beginAgentRename: (sessionId) => ui2.set((state) => ({ ...state, renameAgent: sessionId })),
    endAgentRename: () => ui2.set((state) => state.renameAgent ? { ...state, renameAgent: null } : state),
    // Removing the Agent archives every Session it owns; one of them may fill the
    // main view, and it must not stay there wearing the Bot surface afterwards.
    removeAgent: async (agentId) => {
      const owned = agentSessions(agentId);
      const result = await after(call("remove-agent", { agentId }));
      const list = ctx.sessions.list.getSnapshot();
      const main = Object.values(list.byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id;
      if (main !== void 0 && owned.includes(main) && roster.getSnapshot().mainBotId) actions.openSession(roster.getSnapshot().mainBotId);
      return result;
    },
    // `last` is the Bot conversation the view held before it cleared: when that part
    // was archived for a fresh one, the view goes on in the fresh one.
    landOn: async (id, last) => {
      if (last) await pull().catch(() => {
      });
      const bot = last ? roster.getSnapshot().byId[last.botId] : void 0;
      setPlain(false);
      const target = bot && currentPart(bot) !== last.sessionId ? currentPart(bot) : partFor(id);
      show(target);
    },
    selectPanel: (id) => {
      ctx.layout.selectPanel(id);
    },
    toggleSidebar: () => {
      ctx.layout.toggleSidebar();
    },
    // Agent mode hands the surface back to the shell; everything open on the Bot
    // surface closes first so nothing stale reopens on the way back.
    setSurface: (mode) => {
      if (mode !== "bot" && mode !== "agent") return;
      if (surface.getSnapshot().mode === mode) return;
      if (mode === "agent") {
        ui2.set((state) => ({ ...state, details: null, view: "details", settings: null, palette: null, newChat: null, menu: null, exchange: null, memory: null, toast: null }));
      }
      writeMode(mode);
      surface.set((state) => ({ ...state, mode }));
      if (mode !== "bot") return;
      const home = () => {
        const snapshot = roster.getSnapshot();
        if (!snapshot.ready || !snapshot.mainBotId) return;
        const list = ctx.sessions.list.getSnapshot();
        const main = Object.values(list.byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id;
        if (main !== void 0 && snapshot.byId[main] === void 0 && snapshot.roomsById[main] === void 0) {
          actions.openSession(snapshot.mainBotId);
        }
      };
      if (roster.getSnapshot().ready) home();
      else {
        const off = roster.subscribe(() => {
          if (!roster.getSnapshot().ready) return;
          off();
          home();
        });
      }
    },
    markUnread: (id) => writeUnread(id, true),
    beginVisit: (id) => {
      const made = roster.getSnapshot().byId[id] ?? roster.getSnapshot().roomsById[id];
      const seen = seenAt[seenKey(id)] ?? (made?.createdBy && Number.isFinite(made.createdAt) ? made.createdAt : null);
      ui2.set((state) => ({ ...state, visits: { ...state.visits, [id]: { seen, entered: Date.now() } } }));
    },
    endVisit: (id) => {
      leaveVisits([id]);
      ui2.set((state) => {
        if (!(id in (state.visits ?? {}))) return state;
        const visits = { ...state.visits };
        delete visits[id];
        return { ...state, visits };
      });
    },
    toggleReaction: (key, index, emoji) => {
      const reactions = reactionStore.update((saved) => toggleReaction(saved, key, index, emoji), ui2.getSnapshot().reactions);
      ui2.set((state) => ({ ...state, reactions }));
    },
    clearUnread: (id) => writeUnread(id, false),
    // The engine's right sidebar (files, terminals), which a plugin may load after this one.
    hasRightSidebar: () => ctx.get("sidebarRight") !== void 0,
    toggleRightSidebar: () => {
      try {
        ctx.get("sidebarRight")?.toggleExpanded();
      } catch (error) {
        actions.reportError(error, "right-sidebar");
      }
    }
  };
  if (browsers) {
    Object.assign(actions, {
      // The globe button: the Bot's active tab in the browser view, or a new tab.
      openBrowser: (id) => {
        const bot = roster.getSnapshot().byId[id];
        if (!bot) return;
        browsers.ensureTabs(bot.id);
        if (browsers.tabs.getSnapshot()[bot.id]?.active == null) browsers.openTab(bot.id);
        ui2.set((state) => ({ ...state, details: id, view: "browser", renaming: false, tab: null }));
      },
      // '+' on the strip or the drawer's new-tab card: a blank tab in the browser view.
      browserNewTab: (id) => {
        const bot = roster.getSnapshot().byId[id];
        if (!bot) return null;
        browsers.ensureTabs(bot.id);
        const tabId = browsers.openTab(bot.id);
        ui2.set((state) => ({ ...state, details: id, view: "browser", renaming: false, tab: null }));
        return tabId;
      },
      // A drawer card: its tab active, the panel on the browser view.
      browserPick: (id, tabId) => {
        const bot = roster.getSnapshot().byId[id];
        if (!bot) return;
        browsers.activate(bot.id, tabId);
        ui2.set((state) => ({ ...state, details: id, view: "browser" }));
      },
      browserEnsure: (botId) => browsers.ensureTabs(botId),
      browserCloseTab: (botId, tabId) => browsers.closeTab(botId, tabId),
      browserActivate: (botId, tabId) => browsers.activate(botId, tabId),
      browserShow: (tabId, box2) => browsers.show(tabId, box2),
      browserNavigate: (tabId, input) => browsers.navigate(tabId, input),
      browserCommand: (tabId, name) => browsers.command(tabId, name),
      browserFocus: (tabId) => browsers.focus(tabId)
    });
  }
  actions.openEngineSettings = openEngineSettings;
  actions.seatAccount = (on) => ui2.set((state) => state.accountSeated === on ? state : { ...state, accountSeated: on });
  actions.installUpdate = async () => {
    const value = await call("update-install");
    update.set((previous) => ({ ...previous, ...value }));
    wakeUpdate();
  };
  actions.checkUpdate = async () => {
    update.set(await call("update-check", { fresh: true }));
    wakeUpdate();
  };
  const browserPages = browsers?.pages ?? createSource({});
  const browserTabs = browsers?.tabs ?? createSource({});
  const face = () => ({ actions, hooks: { roster, ui: ui2, activity, work, memoryNews, registry, turnClock, live, cards, heldCards, browserPages, browserTabs, surface, update } });
  ctx.effect(() => noticeApprovals({
    work,
    roster,
    shownSession: () => Object.values(ctx.sessions.list.getSnapshot().byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id,
    openSession: (id) => actions.openSession(id)
  }), "apmixbot: approval notifications");
  const assistantFace = (sessionId) => {
    const binding = ctx.sessions.binding(sessionId);
    if (binding === void 0) throw new Error(`apmixbot: unknown session "${sessionId}"`);
    const chat = ctx.uiConversation.binding(binding).target("chat");
    return { ...face(), keyedHooks: {
      turnSteps: (turn) => {
        const snapshot = chat.getSnapshot();
        if (snapshot === void 0) throw new Error("apmixbot: Chat target is unavailable");
        return snapshot.nodes.turnDataSource(Number(turn), "assistant-step");
      },
      turnContext: (turn) => {
        const snapshot = chat.getSnapshot();
        if (snapshot === void 0) throw new Error("apmixbot: Chat target is unavailable");
        return snapshot.nodes.turnDataSource(Number(turn), "context");
      }
    } };
  };
  const BOT_PRIORITY = -100;
  const shadow = (name, options, component) => ctx.slots.inject(name, () => ctx.slots.register({
    name,
    ...options,
    ...options.priority === void 0 ? {} : { priority: freePriority(ctx.slots.entries(name), options) }
  }, component));
  const installHeader = () => ctx.slots.inject("conversation.session.header", () => installHeaderNavigation(ctx.slots, face, HeaderPill, BOT_PRIORITY));
  let atMenu = null;
  const installAtMenu = () => {
    const fiber = ctx.inject(["inputTriggers"], (scope) => {
      scope.effect(() => {
        const triggers = scope.inputTriggers;
        const controllerOf = (sessionId) => {
          const binding = ctx.sessions.binding(sessionId);
          return binding === void 0 ? void 0 : triggers.sessionOf(binding.ctx);
        };
        const launched = (sessionId) => controllerOf(sessionId)?.launcher.getSnapshot() === CHATS_SOURCE;
        const offs = atSources({ roster, sessions: ctx.sessions, launched, iconFor: menuIcons(roster) }).map((source) => triggers.registerSource(source));
        atMenu = { controllerOf };
        return () => {
          atMenu = null;
          for (const off of offs) off();
        };
      }, "apmixbot: @ menu");
    });
    return () => fiber.dispose();
  };
  actions.canReferenceChat = () => atMenu !== null;
  actions.referenceChat = (sessionId, span) => {
    const controller = atMenu?.controllerOf(sessionId);
    if (controller === void 0 || span === void 0) return;
    controller.toggleSource(CHATS_SOURCE, { trigger: "@", query: "", quoted: false, position: "inline", span });
  };
  const installShell = () => [
    () => installCompiledStyles(SHELL_CSS, "shell"),
    () => installCompiledStyles(SIDEBAR_CSS, "sidebar"),
    () => installCompiledStyles(SECRET_CSS, "secrets"),
    () => installCompiledStyles(MODEL_CSS + ENDPOINT_CSS + PROVIDERS_CSS + FOLDER_CSS + BOT_SETTINGS_CSS + GROUP_SETTINGS_CSS, "models"),
    () => installCompiledStyles(APPS_CSS, "apps"),
    () => installCompiledStyles(USAGE_CSS, "usage"),
    () => installCompiledStyles(SCHEDULE_CSS, "schedules"),
    () => installCompiledStyles(TOAST_CSS, "toast"),
    () => installCompiledStyles(ABOUT_CSS, "about"),
    () => installCompiledStyles(MEMBER_CSS, "members"),
    () => installCompiledStyles(APPROVAL_CSS, "approvals"),
    () => installCompiledStyles(USER_MESSAGE_CSS, "user-messages"),
    () => installCompiledStyles(WIDGET_CSS, "widgets"),
    browsers ? () => installCompiledStyles(BROWSER_CSS, "browser") : null,
    () => installTheme(),
    () => shadow("sidebar.workspaces", { priority: BOT_PRIORITY, inject: face }, TeamSidebar),
    () => shadow("sidebar.brand.mark", { priority: BOT_PRIORITY }, BrandMark),
    () => shadow("sidebar.brand.name", { priority: BOT_PRIORITY }, BrandName),
    () => shadow("sidebar.footer.action", { id: "bot-account", order: -200, inject: face }, FooterAccount),
    () => shadow("sidebar.footer.action", { id: "bot-connect", order: -100, inject: face }, ConnectPlugins),
    () => shadow("settings.trigger", { priority: BOT_PRIORITY }, YouAvatar),
    // Apex wins the seat over a shell account plugin's own launcher (the
    // Desktop's "··· More"), which comes back in Agent mode.
    () => shadow("settings.launcher", { priority: BOT_PRIORITY, inject: face }, AccountLauncher),
    () => shadow("shell.overlay", { id: "bot", order: 50, inject: face }, Overlays),
    () => shadow("shell.overlay", { id: "bot-toast", order: 60, inject: face }, ErrorToast)
  ];
  const installConversation = () => [
    () => installCompiledStyles(CONVERSATION_CSS, "conversation"),
    () => installMentions(),
    () => installAtMenu(),
    installHeader,
    () => shadow("conversation.chat.node", { key: "assistant-step", priority: BOT_PRIORITY, locale: "chat", inject: assistantFace }, AssistantCell),
    () => shadow("conversation.chat.node", { key: "turn-trigger", priority: BOT_PRIORITY, locale: "chat", inject: face }, TriggerCell),
    () => shadow("conversation.chat.node", { key: "tool-call", priority: BOT_PRIORITY, locale: "chat", inject: face }, ToolCell),
    () => shadow("conversation.chat.node", { key: "turn-process", priority: BOT_PRIORITY, locale: "chat", inject: face }, TurnProcessCell),
    // The engine's own turn tail stays, so what other plugins add there shows, such as the
    // cards of the files a turn delivered; its copy and branch row is hidden.
    () => shadow("conversation.chat.turnTail", { id: "bot-turn-separators", order: 1e3, inject: face }, TurnTailCell),
    // A Bot condenses its conversation without telling anyone; the chat keeps showing
    // every message.
    () => shadow("conversation.chat.node", { key: "question-reply", priority: BOT_PRIORITY, locale: "chat" }, AnsweredReply),
    () => shadow("conversation.chat.node", { key: "compaction", priority: BOT_PRIORITY, locale: "chat" }, Nothing),
    ...canDrawUserMessages() ? ["user", "steering"].map((key) => () => shadow("conversation.chat.node", { key, priority: BOT_PRIORITY, locale: "chat", inject: face }, UserMessageCell)) : [],
    () => shadow("conversation.input.permission", { priority: BOT_PRIORITY }, Nothing),
    () => shadow("conversation.input.plan", { priority: BOT_PRIORITY }, Nothing),
    // The composer carries no model picker or run statistics; a Bot's model lives
    // in its details panel.
    () => shadow("conversation.input.model", { priority: BOT_PRIORITY }, Nothing),
    () => shadow("conversation.composer.dock", { id: "activity", order: 0, priority: BOT_PRIORITY }, Nothing),
    () => shadow("conversation.composer.dock", { id: "usage", order: 1, priority: BOT_PRIORITY }, Nothing),
    () => shadow("conversation.input.left", { id: "bot-plus", order: -100, inject: face }, ComposerPlus),
    () => shadow("conversation.input.right", { id: "bot-quote", order: 100, inject: face }, ComposerQuote),
    () => shadow("conversation.composer", {
      priority: BOT_PRIORITY,
      select: (owner) => owner.pendingInteraction?.kind === "question" ? owner.pendingInteraction : null
    }, QuestionCard),
    () => shadow("conversation.input.dock", { id: "bot-members", order: -120, inject: face }, MemberDock),
    () => shadow("conversation.input.dock", { id: "bot-model", order: -110, inject: face }, ModelChoiceDock),
    () => shadow("conversation.input.dock", { id: "bot-question", order: -100, inject: face }, QuestionDock),
    () => shadow("conversation.input.dock", { id: "bot-approval", order: -97, inject: face }, ApprovalDock),
    () => shadow("conversation.input.dock", { id: "bot-view", order: -95, inject: face }, WidgetDock),
    () => shadow("conversation.input.dock", { id: "bot-secret", order: -90, inject: face }, SecretDock)
  ];
  ctx.effect(() => installCompiledStyles(RETURN_CSS, "return"), "apmixbot: return styles");
  shadow("sidebar.footer.action", { id: "bot-return", order: -300, inject: face }, BotReturn);
  ctx.effect(() => {
    let previous;
    const sync = () => {
      const list = ctx.sessions.list.getSnapshot();
      const main = Object.values(list.byId ?? {}).find((session) => (session?.retainedBy?.mainView ?? 0) > 0)?.id;
      const plain = isAgentSessionId(main);
      setPlain(plain);
      if (plain) dropPanels();
      if (main === previous) return;
      const before = previous;
      previous = main;
      const ours = expected !== null && main === expected;
      expected = null;
      if (ours || main === void 0) return;
      if (surface.getSnapshot().mode !== "bot") return;
      const agentId = before !== void 0 ? agentOfSession(before) : void 0;
      if (agentId === void 0) return;
      const snapshot = roster.getSnapshot();
      if (snapshot.byId[main] !== void 0 || snapshot.roomsById[main] !== void 0 || agentOfSession(main) !== void 0) return;
      const row = list.byId[main];
      const parent = row?.parentId ?? row?.parentSessionId;
      const forkedFromAgent = parent !== void 0 && agentOfSession(parent) === agentId;
      if (row?.blank !== true && !forkedFromAgent) return;
      pendingAdopt.set(main, agentId);
      setPlain(true);
      void call("agent-adopt", { agentId, sessionId: main }).then(() => pull()).catch((error) => {
        pendingAdopt.delete(main);
        console.warn("[apmixbot] agent-adopt", error);
        sync();
        actions.reportError(error, "agent-adopt");
      });
      const next = workspaceOf(main);
      if (list.byId[before]?.blank === true && next !== void 0 && workspaceOf(before) !== next) {
        void call("agent-archive", { agentId, sessionId: before }).then(() => pull()).catch(() => {
        });
      }
    };
    const offList = ctx.sessions.list.subscribe(sync);
    const offRoster = roster.subscribe(sync);
    sync();
    return () => {
      offList();
      offRoster();
    };
  }, "apmixbot: agent surface");
  ctx.effect(() => {
    const groups = surfaceGroups({ shell: installShell, conversation: installConversation }, {
      onError: (_group, error) => actions.reportError(new Error(t("Bot mode could not be set up here: {error}", { error: error?.message ?? String(error) })), "surface")
    });
    const reconcile = () => groups.reconcile(groupsFor(surface.getSnapshot()));
    reconcile();
    const unsub = surface.subscribe(reconcile);
    return () => {
      unsub();
      groups.dispose();
    };
  }, "apmixbot: surface");
}
return Object.defineProperty({ ...module.exports }, Symbol.toStringTag, { value: 'Module' })
  },
})
