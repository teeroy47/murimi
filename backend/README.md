# Murimi Backend (NestJS + Prisma + PostgreSQL)

Production-oriented backend foundation for Murimi (Livestock Farm Management System), focused on pigs for MVP and designed to extend to other livestock.

## Stack

- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- Redis (foundation for BullMQ/background jobs)
- JWT (access + refresh rotation)
- Argon2 password hashing
- `class-validator` DTO validation
- Swagger/OpenAPI (`/api/docs`)

## Key Features Implemented

- Multi-tenant farm model (`farm_id` on farm-scoped tables)
- Farm membership validation via `x-farm-id` context header
- RBAC guards (JWT + membership + permissions)
- Audit trail service + audit query endpoint
- Core pig domain modules (animals, nutrition, breeding, health, slaughter, map, reports)
- Offline-first sync endpoints (`push`, `pull`, `resolve-conflict`) with version conflict detection
- Soft-delete + `version` strategy on sync-capable entities

## Tenant Isolation Approach (MVP)

MVP uses strict **application-layer farm scoping** on queries/mutations via:

- `FarmMembershipGuard` validating active membership
- Farm-scoped query filters in services/controllers
- Tests covering guard behavior (tenant access denied when membership missing)

This is designed so PostgreSQL RLS can be added later without breaking API contracts.

## Project Structure

See `src/modules/*` for domain modules and `prisma/schema.prisma` for all data models.

## Setup

1. Copy env file

```bash
cp .env.example .env
```

2. Start dependencies

```bash
docker compose up -d
```

3. Install dependencies

```bash
npm install
```

4. Generate Prisma client and migrate

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. (Optional) Seed permissions and starter templates

```bash
npm run prisma:seed
```

6. Run backend

```bash
npm run start:dev
```

Swagger docs: `http://localhost:3001/api/docs`

## Environment Variables

- `PORT`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_ACCESS_SECRET`
- `JWT_ACCESS_TTL`
- `DEFAULT_GESTATION_DAYS`
- `SEED_ADMIN_EMAIL`

## Notes

- Include `Authorization: Bearer <token>` for protected routes.
- Include `x-farm-id: <farmId>` for farm-context endpoints, especially query-based endpoints.
- Audit endpoint: `GET /api/audit?farmId=<id>`

## Example cURL Flows

### 1) Register / Login

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"Passw0rd!","displayName":"Owner"}'
```

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@example.com","password":"Passw0rd!"}'
```

### 2) Create Farm + Invite Member

```bash
curl -X POST http://localhost:3001/api/farms \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Murimi Demo Farm"}'
```

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/invites \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"email":"worker@example.com","roleId":"<ROLE_ID>"}'
```

### 3) Create Pigs + Log Feed/Weight

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/animals \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"tag":"PIG-001","stage":"FINISHER","sex":"MALE"}'
```

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/weight-records \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"animalId":"<ANIMAL_ID>","weightKg":92.5,"recordedAt":"2026-02-24T08:00:00Z"}'
```

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/feeding-events \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"feedTypeId":"<FEED_TYPE_ID>","penId":"<PEN_ID>","totalAmountKg":45,"headCount":20,"eventDate":"2026-02-24T07:00:00Z"}'
```

### 4) Service Sow -> Predicted Farrowing Date

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/service-events \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"sowAnimalId":"<SOW_ID>","boarAnimalId":"<BOAR_ID>","servicedAt":"2026-02-24T10:00:00Z"}'
```

### 5) Treatment Withdrawal -> Slaughter Block -> Override

```bash
curl -X POST http://localhost:3001/api/farms/<FARM_ID>/treatment-events \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"animalId":"<ANIMAL_ID>","medicineId":"<MED_ID>","dose":"2ml","administeredAt":"2026-02-24T12:00:00Z"}'
```

```bash
curl "http://localhost:3001/api/slaughter/eligibility?farmId=<FARM_ID>&animalId=<ANIMAL_ID>" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>"
```

```bash
curl -X POST http://localhost:3001/api/slaughter-events \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"animalId":"<ANIMAL_ID>","slaughteredAt":"2026-03-02T08:00:00Z","liveWeightKg":96,"override":true,"overrideReason":"Emergency sale"}'
```

### 6) Offline Sync Push/Pull + Conflict Example

```bash
curl -X POST http://localhost:3001/api/sync/push \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId":"device-1",
    "farmId":"<FARM_ID>",
    "changes":[
      {
        "entityType":"Animal",
        "entityId":"<ANIMAL_ID>",
        "op":"UPDATE",
        "baseVersion":1,
        "payload":{"notes":"Offline edit"},
        "clientMutationId":"m-001"
      }
    ]
  }'
```

Conflict response shape (example):

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "entityId": "<ANIMAL_ID>",
        "clientMutationId": "m-001",
        "status": "conflict",
        "conflict": {
          "entityId": "<ANIMAL_ID>",
          "serverVersion": 2,
          "serverState": { "id": "<ANIMAL_ID>", "version": 2 },
          "clientAttempt": { "baseVersion": 1, "payload": { "notes": "Offline edit" } }
        }
      }
    ]
  },
  "error": null
}
```

```bash
curl "http://localhost:3001/api/sync/pull?farmId=<FARM_ID>&sinceCursor=2026-02-24T00:00:00.000Z" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>"
```

```bash
curl -X POST http://localhost:3001/api/sync/resolve-conflict \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "x-farm-id: <FARM_ID>" \
  -H "Content-Type: application/json" \
  -d '{"farmId":"<FARM_ID>","deviceId":"device-1","entityType":"Animal","entityId":"<ANIMAL_ID>","resolution":"KEEP_SERVER","baseServerVersion":2}'
```
