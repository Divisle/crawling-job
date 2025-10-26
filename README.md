# Job Scraper & Slack Notifier

A comprehensive TypeScript-based job scraping system that monitors career pages of various companies and sends real-time notifications to Slack channels when new job postings are detected.

## 🚀 Overview

This project automatically scrapes job listings from 100+ companies, detects new job postings, updates, and deletions, then sends formatted notifications to designated Slack channels. It supports multiple scraping methods including Selenium WebDriver automation and direct API calls.

## ✨ Features

- **Multi-Company Support**: Monitors job postings from 100+ tech companies
- **Multiple Scraping Methods**:
  - Selenium WebDriver for dynamic content
  - Direct API calls (AshbyHQ, Greenhouse, Comeet, etc.)
  - Custom HTML parsing for specific platforms
- **Real-time Notifications**: Sends formatted messages to Slack channels
- **Change Detection**: Tracks new jobs, updates, and deletions
- **Database Integration**: Uses Prisma ORM with PostgreSQL
- **Docker Support**: Containerized deployment ready

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **Web Automation**: Selenium WebDriver with Chrome
- **Database**: PostgreSQL with Prisma ORM
- **Messaging**: Slack Bot API
- **HTTP Client**: Axios
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
src/
├── global.ts              # Global utilities and Slack messaging
├── template/              # Message formatting templates
│   └── build.ts          # Job message builders
└── [company-name]/       # Individual company scrapers
    ├── handler.ts        # Main scraping logic
    ├── database.ts       # Database operations
    └── types.ts          # TypeScript interfaces
```

## 🏢 Supported Companies

The system monitors job postings from major tech companies including:

- **AI/ML Companies**: OpenAI, Anthropic, Hugging Face, Scale AI
- **Security**: CrowdStrike, Okta, Auth0, Chainguard
- **Developer Tools**: GitHub, GitLab, Vercel, Netlify
- **Cloud/Infrastructure**: AWS, Google Cloud, Cloudflare
- \*\*And 100+ more companies across various sectors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL database
- Slack Bot Token
- Chrome browser (for Selenium)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd crawling-job
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Configure your .env file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/jobsdb"
SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
SLACK_FIRST_CHANNEL_ID="C1234567890"
SLACK_SECOND_CHANNEL_ID="C0987654321"
```

4. **Set up database**

```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Run with Docker**

```bash
docker-compose up -d
```

### Manual Execution

Run specific company scrapers:

```bash
# Run a specific company scraper
npm run start -- --company=github

# Run all scrapers
npm run start:all
```

## 📊 Scraping Methods

### 1. Selenium WebDriver

Used for JavaScript-heavy sites requiring browser automation:

```typescript
export class CompanyJobScraper {
  private driver: WebDriver;

  async scrapeJobs(): Promise<JobCreateInput[]> {
    await this.driver.get("https://company.com/careers");
    const jobElements = await this.driver.findElements(
      By.xpath("//div[@class='job-listing']")
    );
    // Extract job data...
  }
}
```

### 2. API Integration

Direct API calls for companies using standard job board APIs:

```typescript
async scrapeJobs(): Promise<JobCreateInput[]> {
  const response = await axios.post("https://jobs.ashbyhq.com/api/...", payload);
  return response.data.jobBoard.jobPostings.map(job => ({
    title: job.title,
    location: job.locationName,
    href: job.jobUrl
  }));
}
```

### 3. HTML Parsing

Custom parsing for companies with unique implementations:

```typescript
async scrapeJobs(): Promise<JobCreateInput[]> {
  const response = await axios.get("https://company.com/careers");
  const parsedData = JSON.parse(response.data.split('data-props="')[1]...);
  // Process parsed data...
}
```

## 💬 Slack Integration

The system sends formatted job notifications to Slack channels:

```typescript
const blocks = buildJobMessage(
  jobData,
  "Company Name",
  "https://company.com",
  channelType
);
await sendSlackMessage(channelId, blocks);
```

### Message Format

```
🚀 NEW JOBS POSTED @ Company Name 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Job role: Senior Software Engineer
📍 Location: San Francisco, CA
🏢 Department: Engineering
```

## 🔧 Configuration

### Adding New Companies

1. Create company directory: `src/new-company/`
2. Implement handler with required methods:


    - `scrapeJobs()`: Extract job data
    - `filterData()`: Detect changes
    - `sendMessage()`: Format Slack notification
    - `static run()`: Main execution method

3. Update database schema if needed:

```bash
npx prisma db push
```

### Environment Variables

| Variable                  | Description                    | Required |
| ------------------------- | ------------------------------ | -------- |
| `DATABASE_URL`            | PostgreSQL connection string   | ✅       |
| `SLACK_BOT_TOKEN`         | Slack Bot OAuth token          | ✅       |
| `SLACK_FIRST_CHANNEL_ID`  | Primary notification channel   | ✅       |
| `SLACK_SECOND_CHANNEL_ID` | Secondary notification channel | ❌       |

## 🐳 Docker Deployment

The project includes Docker configuration for easy deployment:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: jobsdb
```

## 📈 Monitoring & Logging

- Job scraping results are logged to console
- Database changes are tracked automatically
- Slack notifications include job change summaries
- Error handling with graceful failure recovery

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-company`
3. Add the new company scraper following existing patterns
4. Test the scraper thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Related Links

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Selenium WebDriver](https://selenium-webdriver.js.org/)
- [Slack API](https://api.slack.com/)
