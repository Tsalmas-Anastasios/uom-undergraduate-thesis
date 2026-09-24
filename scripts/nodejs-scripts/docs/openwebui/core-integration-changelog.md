# OpenWebUI core Integration Changelog

## Summary

- Refactored OpenWebUI core integration to one-file-per-entity (schemas, filters, and tag services).
- Kept integration-only scope (no routes/controllers/jobs/migrations/business logic).

## Architecture & Folder layout

```text
src/models/openwebui/core/*.core.openwebui.model.ts
src/models/openwebui/core/filters/*.core.openwebui.filters.ts
src/enums/openwebui/core/*.core.openwebui.enum.ts
src/types/openwebui/core/*.core.openwebui.type.ts
src/services/openwebui/core-api/*.core.openwebui-api.service.ts
```

## OpenAPI coverage report

- Schemas ported: 172.
- Endpoints ported: 349.
- Tag services generated: 25.

## Configuration & env vars

- `appConfig.apis.external.openwebui.core` in `src/config/index.config.ts`.
- `httpClient.openwebui.core` in `src/utils/http-client.utilities.ts`.
- Env vars in `.env.example`:
    - `OPENWEBUI__CORE_API__URL`
    - `OPENWEBUI__CORE_API__TIMEOUT`
    - `OPENWEBUI__CORE_API__TOKEN`

## Notes / Decisions / Assumptions

- Source of truth: root `openapi.json`.
- Methods follow `operationId` with deterministic suffix on collisions.
- `application/json` response/body content is prioritized for typings.
