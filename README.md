# Vendor Contract Tracker

A full-stack application for maintaining vendor records and their contracts. The Spring Boot REST API persists vendors and contracts in MySQL, while the React interface provides searchable directories, status and expiry views, portfolio metrics, and a contract-renewal workflow.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Backend | Java 21, Spring Boot 4.0.5, Spring Web MVC |
| Persistence | Spring Data JPA, Hibernate, MySQL |
| Frontend | React 19, Vite 8, React Router 7 |
| UI and HTTP | Material UI 7, Axios |
| Build tooling | Maven Wrapper, npm |
| Utilities | Lombok |

## Features

- Create, view, update, and delete vendors.
- Create, update, and delete contracts associated with a selected vendor.
- Cascade contract persistence and deletion through the vendor aggregate.
- Search and filter vendors by text, status, category, and city.
- Search and filter contracts by text, status/expiry health, and vendor.
- Calculate dashboard metrics in the client, including contract counts, total portfolio value, recent contracts, and agreements expiring within 45 days.
- Preview and apply contract renewal changes for end date, value, and status.
- Display responsive tables, status indicators, notifications, and confirmation prompts with Material UI.

## Architecture

The backend follows a conventional layered structure:

```text
HTTP request
    -> REST controller
        -> service (lookup and update rules)
            -> Spring Data JPA repository
                -> MySQL
```

- `controller` exposes the vendor and contract REST resources and permits the local Vite development origins through controller-level CORS configuration.
- `service` coordinates entity lookup, field updates, and vendor assignment for contracts.
- `repository` uses `JpaRepository` for persistence.
- `entity` contains the JPA domain model.
- `frontend/src/api` centralizes Axios configuration; pages handle API calls and client-side presentation logic.

The application currently returns JPA entities directly from the controllers. `@JsonIgnoreProperties("contracts")` on the contract-to-vendor reference prevents recursive JSON serialization.

## Data model

| Entity | Table | Fields | Relationship |
| --- | --- | --- | --- |
| `Vendor` | `vendors` | `id`, `companyName`, `contactPerson`, `email`, `phone`, `category`, `city`, `status` | One vendor has many contracts. `cascade = ALL` and `orphanRemoval = true` make contracts part of the vendor lifecycle. |
| `Contract` | `contracts` | `id`, `contractTitle`, `startDate`, `endDate`, `contractValue`, `paymentTerms`, `status` | Many contracts belong to one vendor through the `vendor_id` join column. |

Both primary keys use MySQL identity generation. Contract values use `BigDecimal`, and dates use `LocalDate`.

## API

The backend is configured at `http://localhost:8080`. Request and response bodies use JSON.

| Method | Endpoint | Behavior |
| --- | --- | --- |
| `GET` | `/api/vendors` | Return all vendors. |
| `GET` | `/api/vendors/{id}` | Return one vendor or fail if it is not found. |
| `POST` | `/api/vendors` | Persist a vendor from the request body. |
| `PUT` | `/api/vendors/{id}` | Replace the editable fields of an existing vendor. |
| `DELETE` | `/api/vendors/{id}` | Delete a vendor; mapped contracts are deleted through cascading. |
| `GET` | `/api/contracts` | Return all contracts, including each contract's vendor data. |
| `POST` | `/api/contracts/vendor/{vendorId}` | Create a contract and associate it with an existing vendor. |
| `PUT` | `/api/contracts/{id}/vendor/{vendorId}` | Update a contract and assign it to the specified vendor. |
| `DELETE` | `/api/contracts/{id}` | Delete a contract. |

There is no dedicated `GET /api/contracts/{id}` endpoint; the edit screen loads the collection and finds the requested contract in the browser.

## Local setup

### Prerequisites

- JDK 21
- MySQL 8 or compatible MySQL server
- Node.js version compatible with Vite 8 and npm

### Backend

1. Create the database:

   ```sql
   CREATE DATABASE vendor_tracker;
   ```

2. Update `src/main/resources/application.properties` if your MySQL username, password, host, or port differs from the checked-in development values (`root` / `root`, port `3306`). Hibernate is configured with `ddl-auto=update`, so it creates or updates the tables when the application starts.

3. From the repository root, start the API:

   On macOS/Linux:

   ```bash
   ./mvnw spring-boot:run
   ```

   On Windows:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

4. The API is available at `http://localhost:8080/api`.

### Frontend

The checked-in Axios client currently targets `http://localhost:8081/api`, while the backend configuration uses port `8080`. Before starting the UI, either change `frontend/src/api/api.js` to port `8080`, or start Spring Boot on port `8081`:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

Then, in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The backend CORS allowlist includes Vite development and preview ports `5173`, `5174`, and `4173` for both `localhost` and `127.0.0.1`.

Useful frontend checks:

```bash
npm run lint
npm run build
```

## Design decisions

| Choice | Alternative rejected | Why |
| --- | --- | --- |
| Layered controller-service-repository backend | Calling repositories directly from controllers | Keeps HTTP handling separate from lookup, association, and update logic, leaving a clear place for additional business rules. |
| Bidirectional one-to-many/many-to-one JPA mapping | Storing only an unmodeled vendor ID on contracts | Models ownership in the domain and lets contract responses expose their vendor while vendor deletion controls the child lifecycle. |
| `BigDecimal` for contract value | `double`/`float` | Avoids binary floating-point representation for monetary values. |
| `LocalDate` for contract dates | Strings or timestamps | Represents date-only agreement boundaries without an irrelevant time zone or time of day. |
| Explicit vendor ID in contract create/update URLs | Trusting a nested vendor object from the request body | Forces the service to resolve an existing managed vendor before saving the contract. |
| Client-side dashboard and filters | Additional reporting/search endpoints | Keeps the initial API small and derives views from the two existing collections; this is suitable for the current dataset but will not scale like server-side filtering and aggregation. |
| Material UI components and a shared theme | Building every control and style from scratch | Provides consistent responsive forms, tables, feedback, and accessible UI primitives. |
| Direct entity request/response bodies | Separate API DTOs and mapping layer | Reduces code for this small project, at the cost of coupling the API contract to persistence entities and weakening control over exposed fields. |

## Current scope

The backend includes the validation starter, but the entity fields have no Bean Validation annotations and controller bodies do not use `@Valid`; therefore there is no server-side input validation yet. The React forms only mark company name, contract title, and vendor selection as required through browser validation.

There is no authentication or authorization. The only automated backend test is the generated Spring context-load test, and there are no frontend tests. Runtime exceptions for missing records are not translated by a global exception handler into explicit API error responses.
