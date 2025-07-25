# CharaManagerV3

CharaManager is a web application made to manage and maintain your collection of TavernV2 cards (used by SillyTavern, ChubAi, WyvernChat, and more)

## Features

- Gallery-style management for character cards
- Upload and parsing of character cards
- Multi file upload
- Direct download from ChubAi and WyvernChat
- Automatic conversion of v1 to v2 card specification
- User authentication and authorization
- Embedding-based duplicate detection

### Upcoming Integrations

1. Character card editor
    - Allows editing of all fields except embedded lorebooks
2. Comparison of definition content between related cards using a full diff editor
3. Automatic hierarchy and relation detection
4. Multi functional search including description search
5. Statistics for cards, including characters per author, token count, cards uploaded per day
6. Lorebook Editing

## Dependencies

CharaManagerV3 requires multiple elements to work properly:

- Postgres database with [pgvector](https://github.com/pgvector/pgvector) and [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html) enabled

## Running from Source

### Setup

Make sure to install the dependencies:

```bash
npm install
```

### Database Setup

In the root folder of the project, create a file named `drizzle.config.ts`, and enter following adjusted for your connection:

```TS
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: './utils/drizzle',
    schema: './utils/drizzle/schema.ts',
    dialect: 'postgresql',
    dbCredentials: {
        host: 'host',
        user: 'user',
        password: 'password',
        database: 'database',
        ssl: 'allow',
    },
    verbose: true,
});
```

Afterward run `npx drizzle-kit migrate`

### Settings

Copy the included `.env.sample` to `.env` and adjust the contents as needed.

```bash
npm dev
```

### Development Server

Start the development server on (default) `http://localhost:3000`:

```bash
npm dev
```

### Production

Build the application for production:

```bash
npm build
```

Locally preview production build:

```bash
npm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

# License

This project is licensed under the PolyForm Noncommercial License 1.0.0. The full license text is available in the LICENSE file.

To obtain a commercial license, please contact me at [licensing@schlikow.de](mailto:licensing@schlikow.de)

# Credits

This project is build using VueJS, NuxtJS, and Shadcn-Vue (and more).

Thanks to Cohee and the other SillyTavern developers for helping me with parsing the data from the PNGs.

Many thanks to the nice people over at the SillyTavern Discord for providing feedback and guidance. Especially Cohee, Wolfsblvt, Nyx, and others!
