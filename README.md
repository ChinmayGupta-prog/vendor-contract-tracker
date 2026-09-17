# Vendor Contract Tracker

A full-stack application for maintaining vendor records and their contracts. The Spring Boot REST API persists vendors and contracts in MySQL, while the React interface provides searchable vendor and contract directories and a summary dashboard.

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
- Search vendors by company, status, category, and city; search contracts by title, status, and vendor name.
- Show total vendors, total contracts, and contracts marked Active on the dashboard.
- Validate required names, email format, non-negative contract values, and contract date ordering.
- Display request failures and confirm deletion, including the removal of a vendor's contracts.

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
| `GET` | `/api/vendors/{id}` | Return one vendor, or HTTP 404 if it is not found. |
| `POST` | `/api/vendors` | Persist a vendor from the request body. |
| `PUT` | `/api/vendors/{id}` | Replace the editable fields of an existing vendor. |
| `DELETE` | `/api/vendors/{id}` | Delete a vendor; mapped contracts are deleted through cascading. |
| `GET` | `/api/contracts` | Return all contracts, including each contract's vendor data. |
| `POST` | `/api/contracts/vendor/{vendorId}` | Create a contract and associate it with an existing vendor. |
| `PUT` | `/api/contracts/{id}/vendor/{vendorId}` | Update a contract and assign it to the specified vendor. |
| `DELETE` | `/api/contracts/{id}` | Delete a contract. |

There is no dedicated `GET /api/contracts/{id}` endpoint; the edit form uses the selected table row.

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

The frontend and backend both default to port `8080` for the API. To use a different API address, set `VITE_API_BASE_URL` in `frontend/.env.local`, for example `VITE_API_BASE_URL=http://localhost:8081/api`, and restart Vite.

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
| Direct entity request/response bodies | Separate API DTOs and mapping layer | Keeps this small application simple, but couples its API to persistence entities. |

## Validation and error handling

Vendor company name and contract title must contain non-whitespace text. Contracts must reference an existing vendor. Email is optional but must be valid when supplied. Contract dates and values are optional; supplied values cannot be negative, and an end date cannot precede a supplied start date. Zero values and same-day contracts are valid.

Invalid request bodies return HTTP 400 with a JSON `message`. Missing vendors and contracts return HTTP 404. The UI displays request failures and asks for confirmation before deleting records.

## Testing

Run `mvn test` (or `.\mvnw.cmd test`) with the configured MySQL database running. The suite includes a context-load check and transactional API regression tests for validation, zero values, error responses, and CORS. Regression test data is rolled back.

Run `npm run lint` and `npm run build` from `frontend`.

## Current scope

There is no authentication or authorization. This is a local development application, with development database credentials in application.properties. Dashboard Active counts use the stored status, not automatic expiry calculation. Renewal workflows, expiry alerts, portfolio value metrics, pagination, and frontend automated tests are not implemented.
