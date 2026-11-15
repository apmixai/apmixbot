// The apps a user can connect in one step: remote MCP servers the services themselves run.
// The host connects them (src/host/apps.js) and Settings lists them (src/client/apps-page.js).
// GitHub is not here: it is the GitHub connector (src/host/connectors.js).
//
// An entry: id, name, url (https), about (one line for the list), category, and how it signs in:
//   'oauth'   the service's own sign-in page, in the browser
//   'bearer'  a key sent as Authorization: Bearer
//   'header'  a key in a header of its own (`header`)
//   'none'    no account
// Where they apply: keyLabel and keyUrl (what the key is called and where to make one),
// needsClient (the service takes only an OAuth client the user made for it), note, docs.

export const APP_CATEGORIES = ['Google', 'Work and notes', 'Developers', 'Design and sites', 'Payments', 'Search and knowledge', 'Travel', 'Many apps in one']

const GOOGLE_NOTE = 'Google\'s own MCP servers are in developer preview and take only an OAuth client someone made for them: in a Google Cloud project, turn on the app\'s API and its MCP API, add yourself as a test user, then create an OAuth client (Web application) with the redirect address below and "Use this client for an AI-powered agent" ticked.'
const google = (id, name, host, about, guide) => ({
  id, name, url: `https://${host}.googleapis.com/mcp/v1`, auth: 'oauth', about, needsClient: true,
  note: GOOGLE_NOTE, docs: `https://developers.google.com/workspace/${guide}`,
})
const app = (id, name, url, auth, about, more = {}) => ({ id, name, url, auth, about, ...more })
const LIMITED = { note: 'Free without an account, with a rate limit.' }

const BY_CATEGORY = {
  Google: [
    google('gmail', 'Gmail', 'gmailmcp', 'Search and read your email, write drafts, and sort it with labels', 'gmail/api/guides/configure-mcp-server'),
    google('google_calendar', 'Google Calendar', 'calendarmcp', 'See your schedule, find free time, and add or change events', 'calendar/api/guides/configure-mcp-server'),
    google('google_drive', 'Google Drive', 'drivemcp', 'Find, read and upload your files, and share them', 'guides/configure-mcp-servers'),
    google('google_docs', 'Google Docs', 'docsmcp', 'Read and edit your documents', 'guides/configure-mcp-servers'),
    google('google_sheets', 'Google Sheets', 'sheetsmcp', 'Read and update your spreadsheets', 'guides/configure-mcp-servers'),
    google('google_slides', 'Google Slides', 'slidesmcp', 'Read and update your presentations', 'guides/configure-mcp-servers'),
    google('google_chat', 'Google Chat', 'chatmcp', 'Find conversations, read messages and reply', 'guides/configure-mcp-servers'),
    app('google_maps', 'Google Maps', 'https://mapstools.googleapis.com/mcp', 'header', 'Places, routes and the weather, from Google Maps', {
      header: 'X-Goog-Api-Key', keyLabel: 'API key', keyUrl: 'https://console.cloud.google.com/apis/credentials',
      note: 'A Google Cloud API key with the Maps Grounding Lite API turned on.', docs: 'https://developers.google.com/maps/ai/grounding-lite',
    }),
  ],
  'Work and notes': [
    app('notion', 'Notion', 'https://mcp.notion.com/mcp', 'oauth', 'Search, read and write your pages and databases'),
    app('linear', 'Linear', 'https://mcp.linear.app/mcp', 'oauth', 'Find, create and update issues and projects'),
    app('atlassian', 'Jira and Confluence', 'https://mcp.atlassian.com/v2/mcp', 'oauth', 'Jira issues and Confluence pages, with Atlassian Rovo'),
    app('trello', 'Trello', 'https://mcp.trello.com/v1', 'oauth', 'Your boards, lists and cards'),
    app('monday', 'monday.com', 'https://mcp.monday.com/mcp', 'oauth', 'Boards, items and updates in your workspace', { note: 'An account admin may have to approve ApmixBot first.' }),
    app('todoist', 'Todoist', 'https://ai.todoist.net/mcp', 'oauth', 'Your tasks and projects: add, find and finish them'),
    app('airtable', 'Airtable', 'https://mcp.airtable.com/mcp', 'oauth', 'Read and change the records in your bases'),
    app('miro', 'Miro', 'https://mcp.miro.com/', 'oauth', 'Read and add to your boards'),
    app('intercom', 'Intercom', 'https://mcp.intercom.com/mcp', 'oauth', 'Conversations, contacts and help articles'),
    app('evernote', 'Evernote', 'https://mcp.evernote.com/mcp', 'oauth', 'Your notes, notebooks, tags and tasks'),
    app('craft', 'Craft', 'https://mcp.craft.do/my/mcp', 'oauth', 'Read and write your Craft documents'),
    app('ticktick', 'TickTick', 'https://mcp.ticktick.com', 'oauth', 'Your tasks and lists: add, find and finish them'),
    app('calendly', 'Calendly', 'https://mcp.calendly.com', 'oauth', 'Your event types, bookings and free times'),
    app('calcom', 'Cal.com', 'https://mcp.cal.com/mcp', 'oauth', 'Your booking pages, bookings and availability'),
    app('typeform', 'Typeform', 'https://api.typeform.com/mcp', 'oauth', 'Your forms and the answers they got'),
    app('granola', 'Granola', 'https://mcp.granola.ai/mcp', 'oauth', 'Your meeting notes and what was decided'),
    app('fireflies', 'Fireflies', 'https://api.fireflies.ai/mcp', 'oauth', 'Your meetings\' transcripts and summaries'),
    app('deepl', 'DeepL', 'https://mcp.deepl.com/v1/mcp', 'oauth', 'Translate text and documents, with your glossaries', { note: 'A free DeepL account is enough.' }),
  ],
  Developers: [
    app('gitlab', 'GitLab', 'https://gitlab.com/api/v4/mcp', 'oauth', 'Projects, issues, merge requests and pipelines'),
    app('sentry', 'Sentry', 'https://mcp.sentry.dev/mcp', 'oauth', 'Errors and issues in your projects, and what caused them'),
    app('supabase', 'Supabase', 'https://mcp.supabase.com/mcp', 'oauth', 'Your projects\' databases, tables and logs'),
    app('vercel', 'Vercel', 'https://mcp.vercel.com', 'oauth', 'Your projects, deployments, logs and domains', {
      note: 'Signing in is not all: Vercel has you approve each team as well. The first time a Bot works in a team, it gives you a link to open.',
    }),
    app('cloudflare', 'Cloudflare', 'https://mcp.cloudflare.com/mcp', 'oauth', 'Your Cloudflare account: Workers, DNS and more'),
    app('netlify', 'Netlify', 'https://netlify-mcp.netlify.app/mcp', 'oauth', 'Your sites, deploys and forms'),
    app('neon', 'Neon', 'https://mcp.neon.tech/mcp', 'oauth', 'Your Postgres databases: projects, branches and queries'),
    app('postman', 'Postman', 'https://mcp.postman.com/minimal', 'oauth', 'Your collections, workspaces and APIs'),
    app('prisma', 'Prisma', 'https://mcp.prisma.io/mcp', 'oauth', 'Your Prisma Postgres databases'),
    app('posthog', 'PostHog', 'https://mcp.posthog.com/mcp', 'oauth', 'Your product analytics: insights, flags and errors'),
    app('apify', 'Apify', 'https://mcp.apify.com/', 'oauth', 'Run web scrapers and automation Actors'),
  ],
  'Design and sites': [
    app('canva', 'Canva', 'https://mcp.canva.com/mcp', 'oauth', 'Find, make and edit your designs'),
    app('webflow', 'Webflow', 'https://mcp.webflow.com/mcp', 'oauth', 'Your sites, pages and CMS collections'),
    app('wix', 'Wix', 'https://mcp.wix.com/mcp', 'oauth', 'Your Wix sites, stores and bookings'),
    app('wordpress', 'WordPress.com', 'https://public-api.wordpress.com/wpcom/v2/mcp/v1', 'oauth', 'Your sites\' posts, pages and comments', { note: 'Turn MCP on in your WordPress.com settings first.' }),
  ],
  Payments: [
    app('stripe', 'Stripe', 'https://mcp.stripe.com', 'oauth', 'Customers, payments, invoices and payment links'),
    app('paypal', 'PayPal', 'https://mcp.paypal.com/mcp', 'oauth', 'Invoices, orders, payments and disputes'),
    app('square', 'Square', 'https://mcp.squareup.com/mcp', 'oauth', 'Your store\'s payments, orders and catalog'),
  ],
  'Search and knowledge': [
    app('deepwiki', 'DeepWiki', 'https://mcp.deepwiki.com/mcp', 'none', 'Ask about any public GitHub repository and read its wiki'),
    app('context7', 'Context7', 'https://mcp.context7.com/mcp', 'none', 'Current documentation and code examples for libraries', LIMITED),
    app('microsoft_learn', 'Microsoft Learn', 'https://learn.microsoft.com/api/mcp', 'none', 'Microsoft\'s documentation and code samples'),
    app('cloudflare_docs', 'Cloudflare Docs', 'https://docs.mcp.cloudflare.com/mcp', 'none', 'Cloudflare\'s developer documentation'),
    app('exa', 'Exa', 'https://mcp.exa.ai/mcp', 'none', 'Web search with clean page text', LIMITED),
    app('tavily', 'Tavily', 'https://mcp.tavily.com/mcp/', 'oauth', 'Web search, page extraction and site crawls'),
    app('firecrawl', 'Firecrawl', 'https://mcp.firecrawl.dev/v2/mcp', 'none', 'Read and search web pages as clean text', { note: 'Without an account it reads and searches a little; more with a key.' }),
    app('wikidata', 'Wikidata', 'https://wd-mcp.wmcloud.org/mcp', 'none', 'Facts about people, places and things, from Wikidata'),
    app('wolfram', 'Wolfram|Alpha', 'https://agenttools.wolfram.com/mcp', 'none', 'Exact answers in maths, science, units and data'),
    app('coingecko', 'CoinGecko', 'https://mcp.api.coingecko.com/mcp', 'none', 'Prices and market data for cryptocurrencies'),
    app('pocketcasts', 'Pocket Casts', 'https://mcp.pocketcasts.com/mcp', 'none', 'Find podcasts and episodes, and what is trending'),
    app('raindrop', 'Raindrop.io', 'https://api.raindrop.io/rest/v2/ai/mcp', 'oauth', 'Your bookmarks and collections'),
    app('readwise', 'Readwise', 'https://mcp2.readwise.io/mcp', 'oauth', 'Your highlights, and what you saved to read later'),
    app('kagi', 'Kagi', 'https://mcp.kagi.com/mcp', 'bearer', 'Web search without ads, and summaries of pages', {
      keyLabel: 'API key', keyUrl: 'https://kagi.com/api/keys', note: 'Kagi\'s search is a paid service; make the key in your Kagi account.',
    }),
  ],
  Travel: [
    app('kiwi', 'Kiwi.com', 'https://mcp.kiwi.com', 'none', 'Search flights and compare their prices'),
    app('trivago', 'trivago', 'https://mcp.trivago.com/mcp', 'none', 'Search hotels and compare their prices'),
    app('ferryhopper', 'Ferryhopper', 'https://mcp.ferryhopper.com/mcp', 'none', 'Ferry routes, ports and trips'),
    app('peek', 'Peek', 'https://mcp.peek.com', 'none', 'Tours and things to do, and when they are free'),
  ],
  'Many apps in one': [
    app('composio', 'Composio', 'https://connect.composio.dev/mcp', 'oauth', 'One sign-in for 1,000+ apps: Gmail, Slack, Outlook, Calendar and more', { note: 'You link each app (such as Gmail) in Composio the first time a Bot needs it.' }),
    app('pipedream', 'Pipedream', 'https://mcp.pipedream.net/v2', 'oauth', 'Gmail, Slack and 2,000+ apps through your Pipedream account'),
    app('zapier', 'Zapier', 'https://mcp.zapier.com/api/v1/connect', 'bearer', 'The actions you choose in 8,000+ apps, such as sending a Gmail', {
      keyLabel: 'Connection token', keyUrl: 'https://mcp.zapier.com',
      note: 'In Zapier MCP, add the actions the Bots may use (Gmail: send email, Google Calendar: add event …), then copy the server\'s token.',
    }),
    app('make', 'Make', 'https://mcp.make.com/v2', 'oauth', 'Run your Make scenarios as tools'),
  ],
}

export const APP_CATALOG = Object.freeze(APP_CATEGORIES.flatMap(category => BY_CATEGORY[category].map(entry => Object.freeze({ ...entry, category }))))
export const catalogApp = id => APP_CATALOG.find(entry => entry.id === id)
