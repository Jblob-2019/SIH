# Codebase Audit Report: AquaMind HIC

This document outlines the findings from a full-stack audit of the AquaMind Hydraulic Intelligence Command codebase. The issues are categorized by severity and domain.

## 1. Backend & API Issues

### 🔴 High Severity: Synchronous File I/O & Concurrency (Data Loss Risk)
- **Location**: `server/data/store.js` (`saveStore` function)
- **Issue**: The `saveStore` function uses `fs.writeFileSync`. Node.js is single-threaded. If multiple requests mutate data concurrently (e.g., multiple incident reports), synchronous writes will block the event loop, causing severe latency for all other users. Furthermore, concurrent synchronous writes can lead to file corruption or crash the process if the file is locked.
- **Recommendation**: Refactor to use `fs.promises.writeFile` (async/await) and ideally implement a write-queue or debounce mechanism to prevent concurrent write collisions.

### 🔴 High Severity: Over-permissive Data Mutation (Security/Integrity)
- **Location**: `server/data/store.js` (`patchIncident` function)
- **Issue**: The endpoint uses `Object.assign(inc, body || {})`. This allows a malicious client to overwrite critical system-controlled fields such as `id`, `openedAt`, or inject unexpected properties into the object, potentially causing prototype pollution or breaking the frontend.
- **Recommendation**: Implement an explicit allow-list of fields that can be updated (e.g., `status`, `severity`, `team`).

### 🟠 Medium Severity: Request Payload Limit Too Low
- **Location**: `server/src/index.js`
- **Issue**: The Express JSON body parser is configured with `{ limit: '1mb' }`. The Citizen frontend UI specifically mentions accepting photos and videos up to 25MB. If uploads are ever routed through this API as base64 strings, they will immediately trigger `413 Payload Too Large` errors.
- **Recommendation**: Increase the limit to `'50mb'` or implement multipart/form-data for media uploads.

### 🟠 Medium Severity: Overly Permissive CORS
- **Location**: `server/src/index.js`
- **Issue**: The `cors()` middleware is used without configuration, which allows cross-origin requests from any domain (`*`).
- **Recommendation**: Restrict CORS origins in production using environment variables.

### 🟡 Low Severity: Array Splice Argument Limits
- **Location**: `server/data/store.js` (Initialization block)
- **Issue**: The persistence loader updates arrays using spread syntax: `LAKES.splice(0, LAKES.length, ..._state.LAKES)`. If an array grows beyond ~100,000 items (e.g., sensor readings or incidents over time), the V8 engine will throw a `Maximum call stack size exceeded` error.
- **Recommendation**: Replace arrays in place without spread, or just re-assign the references if the architecture allows.

---

## 2. Frontend Issues

### 🔴 High Severity: API Error Swallowing on Non-JSON Responses
- **Location**: `client/src/lib/api.js`
- **Issue**: The fetch wrapper attempts to parse `(await r.json()).error` on HTTP failures. If a load balancer or proxy returns a 502/504 Gateway Timeout as an HTML page, `r.json()` will throw a `SyntaxError`. This crashes the promise chain and hides the original HTTP status code from the developer/user.
- **Recommendation**: Wrap `r.json()` in a `try/catch` and fallback to `r.statusText` if parsing fails.

### 🟠 Medium Severity: Vite Docker Binding Issue
- **Location**: `client/vite.config.js`
- **Issue**: The server host is hardcoded to `'127.0.0.1'`. Even though `allowedHosts: true` is set, binding strictly to loopback means the Vite dev server cannot be accessed from outside a Docker container easily unless explicitly port-forwarded/proxied by the container engine.
- **Recommendation**: Change `host` to `'0.0.0.0'` or `true` so it binds to all network interfaces.

### 🟠 Medium Severity: Unhandled Promise Rejections in UI
- **Location**: `client/src/views/Incidents.jsx`
- **Issue**: The `handleAdd` function in the new modal calls `await api.createIncident(...)`. If this request fails (e.g., network down, 500 error), the UI will freeze silently. The user is not notified, and the modal remains open.
- **Recommendation**: Wrap the API call in a `try/catch` block and display an error toast/message on failure.

### 🟡 Low Severity: Hash Routing Fragility
- **Location**: `client/src/App.jsx`
- **Issue**: The routing checks `VIEWS[window.location.hash.slice(1)]`. If query parameters are ever appended to the hash (e.g., `#dashboard?filter=today`), the router will fail to match the view and fallback to the dashboard incorrectly.
- **Recommendation**: Strip query parameters before matching: `hash.slice(1).split('?')[0]`.

### 🟡 Low Severity: React Key Anti-Patterns
- **Location**: `client/src/views/Citizen.jsx`
- **Issue**: The inbox list uses array indices as React keys (`key={i}`). While functional for append-only lists, if the inbox supports deleting, sorting, or filtering tickets in the future, this will cause rendering bugs and state-mismatches.
- **Recommendation**: Use a stable identifier like `key={m.id || i}`.

## Summary
The codebase provides a solid, highly polished foundation. The most critical items to address before a production release are the **synchronous file operations in the backend** and **securing the patch endpoints** to prevent data corruption. On the frontend, improving **error handling for API calls** will drastically improve resilience.
