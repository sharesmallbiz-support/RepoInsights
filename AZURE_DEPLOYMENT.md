# Azure App Service Deployment Guide

This guide walks you through deploying GitHubSpark to Azure App Service on Linux.

## Prerequisites

1. **Azure Account**: Sign up at [azure.microsoft.com](https://azure.microsoft.com)
2. **Azure CLI**: Install from [docs.microsoft.com/cli/azure/install-azure-cli](https://docs.microsoft.com/cli/azure/install-azure-cli)
3. **GitHub Personal Access Token**: Create at [github.com/settings/tokens](https://github.com/settings/tokens)
4. **PostgreSQL Database**: Use Neon (free tier) or Azure Database for PostgreSQL

## Quick Start (Azure Portal)

### Step 1: Create Azure App Service

1. Log in to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → **"Web App"**
3. Configure:
   - **Subscription**: Select your subscription
   - **Resource Group**: Create new (e.g., `githubspark-rg`)
   - **Name**: Your app name (e.g., `githubspark-app`)
   - **Publish**: Code
   - **Runtime stack**: Node 20 LTS
   - **Operating System**: Linux
   - **Region**: Choose nearest region
   - **Pricing Plan**: Basic B1 ($13/month) or higher
4. Click **"Review + create"** → **"Create"**

### Step 2: Configure Environment Variables

1. Navigate to your App Service
2. Go to **"Configuration"** → **"Application settings"**
3. Add the following settings:

| Name | Value | Example |
|------|-------|---------|
| `NODE_ENV` | `production` | `production` |
| `DATABASE_URL` | Your PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `GITHUB_TOKEN` | Your GitHub Personal Access Token | `ghp_xxxxxxxxxxxxxxxxxxxx` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` | `true` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` | `~20` |

4. Click **"Save"**

### Step 3: Deploy via GitHub Actions (Recommended)

1. In Azure Portal, go to your App Service
2. Navigate to **"Deployment Center"**
3. Select **"GitHub"** as source
4. Authorize Azure to access your GitHub
5. Select:
   - **Organization**: Your GitHub username/org
   - **Repository**: RepoInsights
   - **Branch**: main (or your preferred branch)
6. Click **"Save"**

Azure will automatically:
- Create a GitHub Actions workflow in `.github/workflows/`
- Deploy your app on every push to the selected branch
- Run `npm install` and `npm run build` automatically

### Step 4: Configure Startup Command (Optional)

1. Go to **"Configuration"** → **"General settings"**
2. Set **Startup Command**: `node dist/index.js`
3. Click **"Save"**

### Step 5: Enable Always On

1. Go to **"Configuration"** → **"General settings"**
2. Enable **"Always On"** (prevents cold starts)
3. Click **"Save"**

### Step 6: Verify Deployment

1. Wait for deployment to complete (check GitHub Actions tab)
2. Navigate to your app URL: `https://your-app-name.azurewebsites.net`
3. Test the API endpoint: `https://your-app-name.azurewebsites.net/api/stats`

---

## Alternative: Deploy via Azure CLI

### 1. Login to Azure

```bash
az login
```

### 2. Create Resource Group

```bash
az group create --name githubspark-rg --location eastus
```

### 3. Create App Service Plan

```bash
az appservice plan create \
  --name githubspark-plan \
  --resource-group githubspark-rg \
  --is-linux \
  --sku B1
```

### 4. Create Web App

```bash
az webapp create \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --plan githubspark-plan \
  --runtime "NODE:20-lts"
```

### 5. Configure Environment Variables

```bash
az webapp config appsettings set \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --settings \
    NODE_ENV="production" \
    DATABASE_URL="your-postgres-connection-string" \
    GITHUB_TOKEN="your-github-token" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

### 6. Enable Always On

```bash
az webapp config set \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --always-on true
```

### 7. Deploy Code

#### Option A: Deploy from Local Git

```bash
# Configure deployment user (one time only)
az webapp deployment user set \
  --user-name your-username \
  --password your-password

# Get Git URL
az webapp deployment source config-local-git \
  --name your-unique-app-name \
  --resource-group githubspark-rg

# Add Azure remote and push
git remote add azure <deployment-url>
git push azure main
```

#### Option B: Deploy from GitHub

```bash
az webapp deployment source config \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --repo-url https://github.com/your-org/RepoInsights \
  --branch main \
  --manual-integration
```

---

## GitHub Personal Access Token Setup

### Create Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - **Note**: "GitHubSpark Azure App"
   - **Expiration**: 90 days (or custom)
   - **Scopes**: Select:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:user` (Read ALL user profile data)
     - ✅ `read:org` (Read org and team membership)
4. Click **"Generate token"**
5. **Copy the token immediately** (you won't see it again!)

### Rate Limits

- **Authenticated requests**: 5,000 requests/hour
- **Unauthenticated requests**: 60 requests/hour

For production apps analyzing many repositories, consider:
- Creating a GitHub App for higher rate limits (5,000 per installation)
- Implementing request caching (already built into the app)

---

## Database Setup (Neon PostgreSQL)

### Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up or log in
3. Create a new project: **"GitHubSpark"**
4. Copy the connection string (looks like):
   ```
   postgresql://user:pass@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Add this as `DATABASE_URL` in Azure App Service configuration

### Run Database Migrations

The app uses Drizzle ORM. To set up the database schema:

```bash
# Install dependencies
npm install

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://..."

# Push schema to database
npm run db:push
```

Alternatively, Azure App Service will run migrations automatically if configured in the build script.

---

## Monitoring and Logs

### View Application Logs

#### Via Azure Portal

1. Navigate to your App Service
2. Go to **"Monitoring"** → **"Log stream"**
3. View real-time logs

#### Via Azure CLI

```bash
az webapp log tail \
  --name your-unique-app-name \
  --resource-group githubspark-rg
```

### Enable Application Insights (Recommended)

1. In Azure Portal, go to your App Service
2. Navigate to **"Application Insights"**
3. Click **"Turn on Application Insights"**
4. Select **"Create new resource"**
5. Click **"Apply"**

This provides:
- Performance monitoring
- Error tracking
- Usage analytics
- Custom metrics

---

## Scaling

### Vertical Scaling (Upgrade tier)

```bash
az appservice plan update \
  --name githubspark-plan \
  --resource-group githubspark-rg \
  --sku S1
```

Available tiers:
- **B1** ($13/month): 1.75 GB RAM, good for moderate traffic
- **B2** ($26/month): 3.5 GB RAM
- **S1** ($70/month): Same as B1 but with staging slots, auto-scale
- **P1V2** ($74/month): 3.5 GB RAM, premium performance

### Horizontal Scaling (Add instances)

Available in Standard (S1) and above:

```bash
az appservice plan update \
  --name githubspark-plan \
  --resource-group githubspark-rg \
  --number-of-workers 2
```

Or configure auto-scale rules in Azure Portal.

---

## Custom Domain and SSL

### Add Custom Domain

1. In Azure Portal, go to your App Service
2. Navigate to **"Custom domains"**
3. Click **"Add custom domain"**
4. Follow instructions to:
   - Add DNS records (CNAME or A record)
   - Validate domain ownership
5. Azure provides free SSL certificates via managed certificates

### Enable HTTPS Only

```bash
az webapp update \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --https-only true
```

---

## Troubleshooting

### App Not Starting

**Check logs**:
```bash
az webapp log tail --name your-app-name --resource-group githubspark-rg
```

**Common issues**:
1. **Missing environment variables**: Verify `DATABASE_URL` and `GITHUB_TOKEN` are set
2. **Build failed**: Check if `npm run build` completed successfully
3. **Port binding**: App should listen on `process.env.PORT` (Azure sets this automatically)

### Database Connection Errors

**Verify connection string**:
```bash
az webapp config appsettings list \
  --name your-app-name \
  --resource-group githubspark-rg \
  | grep DATABASE_URL
```

**Test connection locally**:
```bash
export DATABASE_URL="your-connection-string"
npm run db:push
```

### GitHub API Rate Limits

**Check token**:
```bash
curl -H "Authorization: token YOUR_GITHUB_TOKEN" https://api.github.com/rate_limit
```

**Symptoms**:
- API returns 403 errors
- Analysis fails for repositories

**Solutions**:
- Verify `GITHUB_TOKEN` is set correctly
- Check token hasn't expired
- Ensure token has required scopes
- Consider using GitHub App for higher limits

### Performance Issues

**Enable diagnostics**:
1. Azure Portal → App Service → **"Diagnose and solve problems"**
2. Check **"Availability and Performance"**

**Optimization tips**:
- Enable **Always On** to prevent cold starts
- Upgrade to higher tier (more CPU/RAM)
- Monitor memory usage (Node.js apps can be memory-intensive)
- Consider enabling HTTP/2

---

## Cost Optimization

### Development/Testing

- Use **Free (F1)** tier: $0/month
  - 60 minutes/day execution time
  - 1 GB storage
  - Good for testing, not production

### Production

- **Basic B1** ($13/month): Best value for most apps
  - 1.75 GB RAM
  - 10 GB storage
  - 99.95% SLA
  - Always On available

### High Traffic

- **Standard S1** ($70/month): For scaling needs
  - Auto-scale
  - Staging slots (test before production)
  - Daily backups

---

## CI/CD Pipeline

Azure automatically creates a GitHub Actions workflow. Example:

```yaml
name: Build and deploy Node.js app to Azure

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Deploy to Azure
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'your-app-name'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

---

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
   - Use Azure App Service Application Settings
   - Rotate GitHub tokens periodically

2. **HTTPS Only**: Always enable HTTPS-only mode

3. **Managed Identity**: Consider using Azure Managed Identity for database access

4. **Security Headers**: Add security headers (app already uses Express middleware)

5. **Regular Updates**: Keep dependencies updated
   ```bash
   npm audit
   npm update
   ```

6. **IP Restrictions** (optional): Restrict access to specific IPs
   ```bash
   az webapp config access-restriction add \
     --name your-app-name \
     --resource-group githubspark-rg \
     --rule-name "Office IP" \
     --action Allow \
     --ip-address 203.0.113.0/24 \
     --priority 100
   ```

---

## Backup and Recovery

### Manual Backup

```bash
az webapp config backup create \
  --resource-group githubspark-rg \
  --webapp-name your-app-name \
  --backup-name manual-backup \
  --container-url "<your-storage-sas-url>"
```

### Database Backups

Neon provides automatic daily backups. For Azure PostgreSQL:
- Automatic backups are enabled by default
- Retention: 7-35 days (configurable)

---

## Support Resources

- **Azure Documentation**: [docs.microsoft.com/azure/app-service](https://docs.microsoft.com/azure/app-service)
- **Azure Support**: [Azure Portal → Help + support](https://portal.azure.com)
- **GitHub Issues**: Report issues at your repository
- **Community**: [Stack Overflow tag: azure-app-service](https://stackoverflow.com/questions/tagged/azure-app-service)

---

## Summary Checklist

- [ ] Create Azure App Service (Basic B1 or higher)
- [ ] Set up PostgreSQL database (Neon or Azure)
- [ ] Create GitHub Personal Access Token
- [ ] Configure environment variables in Azure
- [ ] Enable Always On
- [ ] Deploy code (GitHub Actions or Azure CLI)
- [ ] Verify app is running
- [ ] Configure custom domain (optional)
- [ ] Enable Application Insights monitoring
- [ ] Set up alerts for errors
- [ ] Test API endpoints
- [ ] Document production URL

Congratulations! Your GitHubSpark app is now running on Azure App Service! 🎉
