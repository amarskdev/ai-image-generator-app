# AI Image Generation Platform

A full-stack AI image generation platform built with **Laravel, Vue 3, and Inertia.js**. It allows authenticated users to generate images from text prompts, customize generation settings, track processing status, and manage usage-based generation costs.

The platform integrates with an external AI image generation API and provides asynchronous processing, secure webhook handling, accurate cost calculation, generation history, and credit management.

## Features

### AI Image Generation

- Generate images using text prompts.
- Choose image dimensions and generation quality.
- Provide optional reference image URLs.
- Submit requests through an external AI image generation API.
- Process generation requests asynchronously.
- Display generated images when processing completes.

### Usage-Based Pricing

- Display estimated generation costs before submission.
- Calculate provider costs using actual token consumption and published API rates.
- Apply a configurable 25% platform markup.
- Record estimated and actual generation costs separately.
- Support precise monetary calculations without floating-point inaccuracies.
- Automatically calculate final charges after successful generation.
- Failed generations are not charged.

### Generation History

- View previously submitted generation requests.
- Track generation statuses:
  - **Queued**
  - **Processing**
  - **Succeeded**
  - **Failed**
- View generated images and associated prompts.
- Track estimated and actual generation costs.
- Maintain generation history for individual user accounts.

### Webhook Integration

- Receive asynchronous generation updates through webhooks.
- Verify incoming webhook signatures.
- Handle duplicate webhook deliveries safely.
- Process out-of-order events without corrupting generation states.
- Prevent duplicate event processing and billing.
- Reconcile generation status through API polling.
- Maintain reliable and consistent generation records.

### Credit Management

- Maintain individual user credit balances in USD.
- Add credits through a simulated purchase flow.
- Support predefined credit packages of $5, $10, and $25.
- Reserve estimated maximum generation costs before submission.
- Release unused reserved credits after successful generation.
- Refund reserved credits when generation fails.
- Prevent generation requests when available credits are insufficient.

### Admin Dashboard and Usage Reports

- View overall platform generation activity.
- Monitor total customer spending.
- Track external AI provider costs.
- Calculate platform profit.
- View daily financial reports.
- Analyze spending and provider costs by individual user.
- Compare recorded provider costs against external API usage reports.
- Restrict administrative access to authorized email addresses.

### Reliability and Error Handling

- Handle API rate limits and concurrency restrictions.
- Handle provider overload and temporary failures.
- Support failures occurring after a generation request has been accepted.
- Ensure idempotent webhook processing.
- Prevent duplicate billing and event records.
- Maintain consistent financial records.
- Keep API credentials and webhook secrets secure on the backend.

## Technology Stack

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| Laravel        | Backend framework                |
| PHP 8.4+       | Server-side development          |
| Vue 3          | Frontend framework               |
| Inertia.js     | Backend and frontend integration |
| Tailwind CSS   | UI styling                       |
| PostgreSQL     | Relational database              |
| Laravel Queues | Background job processing        |
| REST API       | External AI service integration  |
| Webhooks       | Asynchronous event processing    |
| PHPUnit        | Automated testing                |
| Vite           | Frontend asset bundling          |

## Application Architecture

The application follows an asynchronous image generation workflow:

1. **Authentication:** Users sign in to access the platform.
2. **Generation Configuration:** Users enter a prompt and select image settings.
3. **Cost Estimation:** The backend calculates the estimated generation cost using published API pricing.
4. **Credit Reservation:** Available credits are checked and the required amount is reserved.
5. **Request Submission:** Laravel submits the generation request to the external AI provider.
6. **Background Processing:** The provider processes the request asynchronously.
7. **Status Synchronization:** Webhooks and API polling update the generation status.
8. **Usage Calculation:** Actual token consumption is used to calculate the provider cost.
9. **Final Billing:** The platform applies its markup and records the final customer charge.
10. **Result Display:** Users can view their generated images, generation status, and final costs in their history.

## Pricing Model

The platform uses usage-based pricing with a 25% markup on the underlying provider cost.

**Pricing formula:**

```text
Provider Cost = Actual Token Usage × Published Token Rate

Customer Charge = Provider Cost × 1.25

Platform Profit = Customer Charge - Provider Cost
```

Generation costs are calculated using actual token usage rather than relying solely on initial estimates.

The platform maintains separate records for estimated costs, actual provider costs, and final customer charges.

Failed generations are free, and reserved credits are released when a generation fails.

### Financial Accuracy

Financial calculations use integer nanodollar units (nine decimal places) instead of floating-point arithmetic.

This ensures precise calculations, consistent billing, and reliable financial reporting, including when provider costs contain fractions of a cent.

## Prerequisites

Before running the application, make sure you have:

- PHP 8.4 or newer
- Composer 2
- Node.js 20 or newer
- npm
- PostgreSQL or another supported Laravel database
- An account and API credentials for a compatible AI image generation provider

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install dependencies

```bash
composer install
npm install
```

### 3. Configure environment variables

Create your environment file:

```bash
cp .env.example .env
```

Generate the application key:

```bash
php artisan key:generate
```

### 4. Configure the environment

Update the `.env` file with your application, database, API, and queue configuration.

```dotenv
APP_NAME="AI Image Generation Platform"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=image_generation
DB_USERNAME=postgres
DB_PASSWORD=

AI_API_KEY=
AI_API_URL=

AI_WEBHOOK_SECRET=

ADMIN_EMAILS=

QUEUE_CONNECTION=database
```

Use the environment variable names expected by your configured provider integration. The example above represents a generic configuration.

Never commit API keys, webhook secrets, or production credentials to source control.

### 5. Run database migrations

```bash
php artisan migrate
```

### 6. Start the development servers

Start the frontend development server:

```bash
npm run dev
```

Start the Laravel server:

```bash
php artisan serve
```

The application will be available at:

```text
http://localhost:8000
```

Make sure the queue worker is running:

```bash
php artisan queue:work
```

## Webhook Configuration

The platform uses signed webhooks to receive generation status updates from the external AI provider.

Configure the webhook endpoint in your provider dashboard:

```text
https://your-domain.com/api/pixelforge/webhooks
```

Configure the corresponding signing secret in your application's environment variables.

For local development, expose your local Laravel application using a tunneling service such as ngrok or Cloudflare Tunnel.

Webhook processing includes:

- Signature verification.
- Event de-duplication.
- Idempotent processing.
- Safe handling of out-of-order events.
- Generation status reconciliation.
- Accurate usage and billing updates.

## Testing

Run the automated test suite:

```bash
php artisan test
```

Build production frontend assets:

```bash
npm run build
```

Important testing areas include:

- User authentication and authorization.
- Generation cost estimation.
- Pricing and markup calculations.
- Monetary precision and rounding.
- Credit reservation and refunds.
- Successful generation requests.
- Provider errors and generation failures.
- Webhook signature verification.
- Duplicate webhook deliveries.
- Out-of-order webhook events.
- Polling and generation reconciliation.
- Prevention of duplicate billing.
- User-specific generation history.
- Administrative report authorization.

## Deployment

The application can be deployed to any hosting platform that supports Laravel, PHP, persistent database storage, background workers, and HTTPS.

Suitable hosting options include Laravel Cloud and other Laravel-compatible cloud platforms.

### Deployment Checklist

1. Configure production environment variables.
2. Set up a persistent PostgreSQL database.
3. Configure production API credentials.
4. Configure the production webhook URL and signing secret.
5. Install PHP dependencies:

```bash
composer install --no-dev --optimize-autoloader
```

6. Install and build frontend assets:

```bash
npm ci
npm run build
```

7. Run production migrations:

```bash
php artisan migrate --force
```

8. Configure and start Laravel queue workers.
9. Configure the scheduler if periodic polling or reconciliation jobs are used.
10. Enable HTTPS and verify webhook delivery.
11. Test image generation, billing, and generation history in production.

## Useful Artisan Commands

```bash
# Database migrations
php artisan migrate

# Check migration status
php artisan migrate:status

# Run automated tests
php artisan test

# Start Laravel development server
php artisan serve

# Start frontend development server
npm run dev

# Build frontend assets
npm run build

# Start queue worker
php artisan queue:work

# Optimize application for production
php artisan optimize
```

## Security and Reliability

The platform follows several important practices:

- Keep external API credentials and webhook secrets server-side.
- Verify webhook signatures before processing events.
- Use database transactions for critical financial operations.
- Ensure webhook processing is idempotent.
- Prevent duplicate generation charges.
- Use precise monetary representations.
- Validate user ownership before displaying generation records.
- Restrict administrative functionality to authorized users.
- Reserve and release credits consistently.
- Use persistent queues for reliable background processing.

## Future Enhancements

Potential improvements include:

- Support for multiple AI image generation providers.
- More image customization options.
- Generation retry and recovery mechanisms.
- Advanced usage analytics.
- Download and export generated images.
- Configurable pricing and markup rules.
- Additional payment gateway integrations.
- Generation templates and prompt management.

## License

This project is intended for learning, development, and demonstration purposes.
