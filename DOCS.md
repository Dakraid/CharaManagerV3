# CharaManagerV3 Technical Documentation

## 1. Project Overview

CharaManagerV3 is a comprehensive web application designed for managing character cards in the TavernV2 format. It serves as a centralized hub for roleplaying characters, offering features for organization, search, analysis, and refinement using AI technologies. The application is built on a modern full-stack TypeScript architecture, leveraging Nuxt 3 for the framework and PostgreSQL for data persistence.

## 2. Technology Stack

### Core Framework

- **Nuxt 4**: The meta-framework driving the application, handling server-side rendering (SSR), API routes, and auto-imports.
- **Vue 3**: The reactive frontend framework, utilizing the Composition API and `<script setup>` syntax.
- **TypeScript**: Used extensively across the entire stack for type safety.

### UI & Styling

- **Tailwind CSS v4**: Utility-first CSS framework for styling.
- **Shadcn Nuxt**: A collection of re-usable components built with Radix Vue and Tailwind CSS.
- **Reka UI**: Accessible UI primitives.
- **Lucide Vue Next**: Icon library.
- **Motion V / Tw Animate CSS**: Animation libraries for dynamic UI elements.

### Backend & Database

- **PostgreSQL**: The primary relational database.
- **Drizzle ORM**: TypeScript ORM for type-safe database interactions and schema management.
- **Drizzle Kit**: CLI tool for generating migrations and managing the database schema.
- **Redis (Optional)**: Caching layer for performance optimization.

### State Management

- **Pinia**: The intuitive store library for Vue, handling global application state.
- **pinia-plugin-persistedstate**: Persists store state to local storage/cookies.

### Authentication

- **Nuxt Auth Utils**: Handles session management and authentication flows.
- **WebAuthn**: The schema suggests support for Passkeys/WebAuthn via the `credentials` table.

### AI & Data Processing

- **OpenAI / OpenRouter**: Integration with LLMs for character evaluation and text generation.
- **Voyage AI**: Used for generating text embeddings to enable semantic search.
- **pgvector**: PostgreSQL extension for storing and querying vector embeddings.
- **Sharp**: High-performance image processing (resizing, format conversion).
- **PNG Chunk Utils**: `png-chunks-extract`, `png-chunks-encode`, `png-chunk-text` for reading and writing TavernV2 metadata directly to PNG files.

## 3. Architecture

### Database Schema

The database is structured around the `characters` table, which serves as the central entity.

- **`characters`**: Stores core metadata (name, tags, token counts), visibility settings, and embeddings.
- **`definitions`**: Contains the actual TavernV2 character data (description, personality, scenario, etc.) stored as JSONB. It supports versioning via `change_date`.
- **`evaluations`**: Links to `definitions` and stores AI-generated quality assessments.
- **`originals`**: Stores the raw original image files associated with characters.
- **`users` & `credentials`**: Manages user identities and secure authentication methods.
- **`relationships`**: Defines parent-child relationships between characters, allowing for derivative tracking.

### Backend API (`server/api`)

The backend is organized into domain-specific namespaces:

- **`/auth`**: Handles user registration, login, and session management.
- **`/character`**: CRUD operations for individual characters.
- **`/characters`**: Bulk operations, listing, and filtering.
- **`/embeddings`**: Manages vector embeddings for semantic search.
- **`/image`**: Handles image uploads, processing, and serving.
- **`/llm`**: Proxies requests to external LLM providers for evaluations.

### Frontend Architecture (`app`)

- **Pages**: Route-based views.
    - `index.vue`: Dashboard/Home.
    - `character/[id].vue`: Detailed character view.
    - `preset-compare.vue`: Tool for comparing generation presets.
    - `tag-management.vue`: Interface for managing global tags.
- **Stores**: Modular state management.
    - `characterStore`: Manages the list of characters and current selection.
    - `uploadStore`: Handles the file upload queue and status.
    - `settingsStore`: Persists user preferences (theme, API keys, etc.).
- **Components**:
    - `ui/*`: Generic, reusable UI components (Buttons, Inputs, Dialogs).
    - `Character/*`: Domain-specific components for displaying and editing characters.

## 4. Key Features

### Character Management

- **Import/Export**: Reads and writes TavernV2 data directly from/to PNG images.
- **Versioning**: Tracks changes to character definitions over time.
- **Search**: Supports both keyword search (via full-text index) and semantic search (via vector embeddings).
- **Tagging**: Flexible tagging system for organization.

### AI Integration

- **Automated Evaluation**: Uses LLMs to score characters on grammar, personality depth, and consistency.
- **Embeddings**: Automatically generates embeddings for character descriptions to find similar characters.

### Image Processing

- **Optimization**: Automatically generates thumbnails and optimized versions of character images.
- **Metadata Handling**: Preserves and modifies PNG text chunks to store character data.

## 5. Setup & Configuration

Configuration is managed via `.env` and `nuxt.config.ts`.
Key environment variables:

- `NUXT_POSTGRESQL_URL`: Connection string for the PostgreSQL database.
- `NUXT_SESSION_PASSWORD`: Secret for encrypting session cookies.
- `NUXT_VOYAGE_API_KEY`: API key for embedding generation.
- `NUXT_OPENROUTER_API_KEY` (or similar): API key for LLM services.

Run scripts:

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run drizzle:migrate`: Apply database migrations.

## 6. Database Schema Deep Dive

The application uses PostgreSQL with Drizzle ORM. Below is a detailed breakdown of each table, its columns, and its purpose.

### `characters`

The central entity of the application. Stores metadata about a character card.

| Column              | Type           | Default             | Description                                                                       |
| :------------------ | :------------- | :------------------ | :-------------------------------------------------------------------------------- |
| `character_id`      | `serial` (PK)  | -                   | Unique identifier for the character.                                              |
| `owner_id`          | `uuid` (FK)    | -                   | References `users.id`. The user who owns this character.                          |
| `public_visible`    | `boolean`      | `false`             | Whether the character is visible to other users (if public features are enabled). |
| `character_name`    | `text`         | -                   | The display name of the character. Indexed for search.                            |
| `upload_date`       | `timestamptz`  | `CURRENT_TIMESTAMP` | When the character was first uploaded.                                            |
| `image_etag`        | `text`         | -                   | A unique hash/tag for the character's image, used for caching and versioning.     |
| `total_token_count` | `integer`      | `0`                 | Total token count of the character definition (permanent + temporary).            |
| `perma_token_count` | `integer`      | `0`                 | Token count of the permanent tokens (name, description, etc.).                    |
| `evaluation_score`  | `integer`      | `0`                 | Cached score from the latest evaluation.                                          |
| `character_tags`    | `text[]`       | `[]`                | Array of tags associated with the character.                                      |
| `embeddings`        | `vector(1024)` | -                   | Vector embedding of the character's description for semantic search.              |

**Constraints & Indexes:**

- `idx_characters_name`: B-tree index on `character_name`.
- `idx_characters_owner`: B-tree index on `owner_id`.
- `idx_characters_public`: B-tree index on `public_visible`.
- Checks: `total_token_count >= 0`, `perma_token_count >= 0`.

### `definitions`

Stores the actual content of the character card (TavernV2 format). A character can have multiple definitions (versions), but usually, the latest one is used.

| Column         | Type           | Default             | Description                                                       |
| :------------- | :------------- | :------------------ | :---------------------------------------------------------------- |
| `id`           | `serial` (PK)  | -                   | Unique identifier for this specific definition version.           |
| `character_id` | `integer` (FK) | -                   | References `characters.character_id`.                             |
| `change_date`  | `timestamptz`  | `CURRENT_TIMESTAMP` | When this version was created.                                    |
| `content`      | `jsonb`        | -                   | The full TavernV2 JSON data (name, description, first_mes, etc.). |
| `hash`         | `text`         | (Generated)         | SHA256 hash of the `content` column, used to detect duplicates.   |
| `name`         | `text`         | (Generated)         | Extracted from `content->data->name`.                             |
| `description`  | `text`         | (Generated)         | Extracted from `content->data->description`.                      |
| `personality`  | `text`         | (Generated)         | Extracted from `content->data->personality`.                      |
| `scenario`     | `text`         | (Generated)         | Extracted from `content->data->scenario`.                         |

**Constraints & Indexes:**

- `idx_definitions_change`: B-tree index on `change_date` (descending) to quickly find the latest version.
- `idx_definitions_character`: B-tree index on `character_id`.
- `idx_definitions_search`: GIN index on `to_tsvector('english', description)` for full-text search.

### `evaluations`

Stores AI-generated evaluations of a character definition.

| Column               | Type           | Default             | Description                                                        |
| :------------------- | :------------- | :------------------ | :----------------------------------------------------------------- |
| `id`                 | `serial` (PK)  | -                   | Unique identifier for the evaluation.                              |
| `definition_id`      | `integer` (FK) | -                   | References `definitions.id`. The specific version being evaluated. |
| `evaluation_date`    | `timestamptz`  | `CURRENT_TIMESTAMP` | When the evaluation was performed.                                 |
| `evaluation_version` | `text`         | -                   | Version of the evaluation prompt/logic used.                       |
| `evaluation_result`  | `jsonb`        | -                   | The structured result from the LLM (scores, feedback).             |

### `originals`

Stores the original image file uploaded by the user.

| Column         | Type               | Default | Description                                                          |
| :------------- | :----------------- | :------ | :------------------------------------------------------------------- |
| `character_id` | `integer` (PK, FK) | -       | References `characters.character_id`. One-to-one relationship.       |
| `file_name`    | `text`             | -       | Original filename.                                                   |
| `file_origin`  | `text`             | -       | Source of the file (e.g., "upload", "import").                       |
| `file_raw`     | `text`             | -       | Base64 encoded or path to the raw file data (implementation detail). |

### `users`

Manages user accounts.

| Column     | Type        | Default             | Description           |
| :--------- | :---------- | :------------------ | :-------------------- |
| `id`       | `uuid` (PK) | `gen_random_uuid()` | Unique user ID.       |
| `username` | `text`      | -                   | Unique username.      |
| `email`    | `text`      | -                   | Unique email address. |
| `password` | `text`      | -                   | Hashed password.      |

### `credentials`

Stores WebAuthn/Passkey credentials for passwordless login.

| Column       | Type        | Default             | Description                                     |
| :----------- | :---------- | :------------------ | :---------------------------------------------- |
| `user_id`    | `uuid` (FK) | -                   | References `users.id`.                          |
| `id`         | `uuid` (PK) | `gen_random_uuid()` | Credential ID.                                  |
| `public_key` | `text`      | -                   | Public key for the credential.                  |
| `counter`    | `integer`   | -                   | Counter for replay protection.                  |
| `backed_up`  | `boolean`   | `false`             | Whether the credential is backed up.            |
| `transports` | `text`      | -                   | Supported transports (usb, nfc, ble, internal). |

### `relationships`

Defines a directed graph of character derivations (Parent -> Child).

| Column      | Type           | Default | Description                           |
| :---------- | :------------- | :------ | :------------------------------------ |
| `parent_id` | `integer` (FK) | -       | References `characters.character_id`. |
| `child_id`  | `integer` (FK) | -       | References `characters.character_id`. |

**Constraints:**

- PK: (`parent_id`, `child_id`)
- Check: `parent_id <> child_id` (No self-loops).

### `tags`

Global list of available tags.

| Column | Type        | Default             | Description    |
| :----- | :---------- | :------------------ | :------------- |
| `id`   | `uuid` (PK) | `gen_random_uuid()` | Unique tag ID. |
| `tag`  | `text`      | -                   | The tag text.  |

## 7. Server API Deep Dive

The backend API is structured using Nuxt server routes.

### Authentication (`/api/auth`)

- **POST `/login`**: Authenticates a user via email/username and password. Sets a session cookie.
- **POST `/register`**: Creates a new user account if registration is enabled.
- **POST `/validate`**: Checks if the current session is valid. Returns `200 OK` or `401 Unauthorized`.

### Character Management (`/api/character`)

- **GET `/`**: Retrieves a single character by ID.
    - Query: `id` (UUID)
- **PUT `/`**: Uploads or creates a new character.
    - Body: `FormData` (file, origin, public flag).
- **DELETE `/`**: Deletes a character.
    - Body: `{ id: string }`
- **PATCH `/`**: Updates a character's definition (TavernV2 data).
    - Body: `{ id: string, content: V2 }`
- **POST `/download`**: Downloads a character as a PNG file with embedded metadata.
    - Body: `{ id: string }`
- **GET `/evaluation`**: Retrieves the latest evaluation for a character.
    - Query: `id` (UUID)
- **PATCH `/visibility`**: Toggles public visibility of a character.
    - Body: `{ id: string, public: boolean }`

### Bulk Operations (`/api/characters`)

- **POST `/list`**: Lists characters with pagination and filtering.
    - Body: `{ page: number, perPage: number, search?: string, tags?: string[], ... }`
- **POST `/count`**: Returns the total count of characters owned by the user.

### AI & Embeddings

- **POST `/api/embeddings`**: Triggers generation of vector embeddings for a character.
    - Body: `{ id: string }`
- **POST `/api/llm/evaluate`**: Triggers an LLM-based evaluation of a character.
    - Body: `{ id: string }`
- **POST `/api/llm/correction`**: Requests an LLM to correct/improve a character definition.
    - Body: `{ content: V2, requirements: ... }`

### External Sites (`/api/sites`)

- **POST `/chubai`**: Imports a character from Chub.ai.
    - Body: `{ targetUri: string }`
- **POST `/wyvern`**: Imports a character from Wyvern.chat.
    - Body: `{ targetUri: string }`

### Images (`/api/image`)

- **GET `/full/[slug]`**: Serves the full-resolution image for a character.
- **GET `/thumb/[slug]`**: Serves the optimized thumbnail for a character.

### Tags (`/api/tags`)

- **GET `/`**: Retrieves all unique tags used across the system.

## 8. State Management Deep Dive (Pinia)

The application uses Pinia for global state management, split into modular stores.

### `appStore`

Manages global UI state.

- **State**:
    - `currentPage`: Current page number for pagination.
    - `isFetching`: Global loading state.
    - `showActions`: Toggles the actions menu.
    - `showOverlay`: Toggles the global overlay.
    - `showNavigation`: Toggles the mobile navigation menu.
- **Actions**:
    - `toggleActions()`: Switches `showActions`.
    - `toggleNavigation()`: Switches `showNavigation`.

### `cacheStore`

Handles client-side caching of character data to reduce API calls.

- **State**:
    - `characterCache`: Map of character lists.
    - `fullCharacterCache`: Map of full character details (including definitions).
- **Persistence**: Persisted to `localStorage`.

### `characterStore`

Manages the list of characters currently being viewed.

- **State**:
    - `characterCount`: Total number of characters available.
    - `characterList`: Array of `Character` objects for the current view.
- **Actions**:
    - `getCharacterIndex(id)`: Finds a character in the list.
    - `putCharacter(character)`: Updates a character in the list.

### `settingsStore`

Stores user preferences.

- **State**:
    - `perPage`: Number of items per page (default: 30).
    - `censorImages`: Blur NSFW images.
    - `censorNames`: Hide character names.
    - `permaControls`: Show permanent token controls.
- **Persistence**: Persisted to `localStorage`.

### `uploadStore`

Manages the file upload queue.

- **State**:
    - `files`: Array of `Upload` objects (file, origin, public flag).
    - `urls`: Array of URLs (unused?).
- **Actions**:
    - `add(file, origin)`: Adds a single file to the queue.
    - `addMany(files)`: Adds multiple files.
    - `remove(file)`: Removes a file from the queue.
    - `clear()`: Clears the queue.

## 9. Frontend Components Deep Dive

### Pages

- **`index.vue`**: The main dashboard.
    - **Logic**: Fetches the character list on mount using `clientService.getCharacters()`.
    - **Layout**: Renders `CharacterGallery` inside a responsive layout.
- **`character/[id].vue`**: Detailed view for editing and interacting with a character.
    - **Route Params**: Validates `id` using Zod.
    - **State**: Fetches character data and the full-resolution image blob.
    - **Components**:
        - `CharacterPageImage`: Displays the character image with censorship support.
        - `CharacterPageEditorNew`: Editor for the TavernV2 definition.

### Domain Components (`components/Character`)

- **`Card.vue`**: The core UI element for displaying a character.
    - **Features**:
        - **Hover Effects**: Reveals controls and details on hover.
        - **Context Menu**: Right-click menu for Download, Edit, Delete, and Evaluation.
        - **Visuals**: Uses `GlowBorderHover` and dynamic background blurring.
        - **Actions**: Connects to `clientService` for all operations.
- **`Files.vue`**: A drag-and-drop file upload zone.
    - **Logic**: Handles file selection, drag events, and bulk uploads via `uploadStore`.
    - **UI**: Shows a drop overlay and a list of queued files (`CharacterFilesItem`).
- **`Sidebar.vue`**: The right-hand sidebar for tools.
    - **Content**: Contains `CharacterFetch` (URL import) and `CharacterFiles` (Upload).
    - **Responsiveness**: Hidden on mobile, toggled via `appStore.showActions`.

### Shared UI (`components/ui`)

The project uses Shadcn Nuxt, so most UI primitives (Buttons, Dialogs, Inputs) are standard implementations located here.

### Other Component Directories

- **`components/Auth`**: Components related to user authentication (Login, Register).
- **`components/Common`**: Reusable application-wide components (Headers, Footers, Navigation).
- **`components/Control`**: Specialized UI controls and inputs.
- **`components/Preset`**: Components for managing and comparing generation presets.

## 10. Shared Utilities Deep Dive

### Validation Schemas (`shared/utils/ZodSchema.ts`)

The project uses Zod for runtime validation of API requests and forms.

- **`characterIdSchema`**: Validates `{ id: number | string }`.
- **`evaluationSchema`**: Validates the structure of LLM evaluation results (grammar, personality, etc.).
- **`uploadSchema`**: Validates file uploads (file object, origin, public flag).
- **`listingSchema`**: Validates pagination and search parameters.
- **`registerSchema` / `loginSchema`**: Validates user credentials with strict password rules (min 8 chars, numbers, symbols, mixed case).
- **`ChubUriSchema` / `WyvernUriSchema`**: Validates URLs for external character imports.

### Database Relations (`shared/utils/relations.ts`)

Defines the graph of relationships between tables for Drizzle ORM.

- **Characters**: Have many `definitions`, `originals`, and `relationships` (as parent or child). Belongs to a `user`.
- **Definitions**: Belongs to a `character`. Has many `evaluations`.
- **Evaluations**: Belongs to a `definition`.
- **Users**: Have many `characters`.

### Other Utilities

- **`StatusCode.ts`**: Enum for HTTP status codes to avoid magic numbers.
- **`lib/utils.ts`**: Contains the `cn()` helper for merging Tailwind classes (clsx + tailwind-merge).
