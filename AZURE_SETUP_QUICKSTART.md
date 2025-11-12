# Azure App Service Quick Start Guide

This is a quick reference guide for deploying GitHubSpark to Azure App Service. For detailed instructions, see [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md).

## Prerequisites

- Azure account (free tier available)
- GitHub Personal Access Token
- PostgreSQL database (Neon free tier recommended)

## Quick Deployment Steps

### 1. Create Azure App Service (5 minutes)

#### Option A: Azure Portal (Recommended for beginners)

1. Go to [portal.azure.com](https://portal.azure.com)
2. Click **"Create a resource"** → **"Web App"**
3. Fill in:
   - **Name**: `your-app-name` (must be unique)
   - **Runtime**: Node 20 LTS
   - **OS**: Linux
   - **Pricing**: Basic B1 ($13/month)
4. Click **"Create"**

#### Option B: Azure CLI (Fast)

```bash
# Login
az login

# Create resource group
az group create --name githubspark-rg --location eastus

# Create app service plan
az appservice plan create \
  --name githubspark-plan \
  --resource-group githubspark-rg \
  --is-linux \
  --sku B1

# Create web app
az webapp create \
  --name your-unique-app-name \
  --resource-group githubspark-rg \
  --plan githubspark-plan \
  --runtime "NODE:20-lts"
```

---

### 2. Get GitHub Personal Access Token (2 minutes)

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Select scopes:
   - ✅ `repo`
   - ✅ `read:user`
   - ✅ `read:org`
4. Copy the token (save it securely!)

---

### 3. Set Up Database (3 minutes)

#### Using Neon (Free tier)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create new project: "GitHubSpark"
3. Copy connection string:
   ```
   postgresql://user:pass@ep-xxx.aws.neon.tech/neondb?sslmode=require
   ```

---

### 4. Configure Environment Variables in Azure (3 minutes)

#### Option A: Azure Portal

1. Navigate to your App Service
2. **Settings** → **Configuration** → **Application settings**
3. Click **"New application setting"** and add:

| Name | Value |
|------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `GITHUB_TOKEN` | Your GitHub PAT |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~20` |
| `SCM_DO_BUILD_DURING_DEPLOYMENT` | `true` |

4. Click **"Save"**

#### Option B: Azure CLI

```bash
az webapp config appsettings set \
  --name your-app-name \
  --resource-group githubspark-rg \
  --settings \
    NODE_ENV="production" \
    DATABASE_URL="postgresql://..." \
    GITHUB_TOKEN="ghp_..." \
    WEBSITE_NODE_DEFAULT_VERSION="~20" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

---

### 5. Enable Always On (1 minute)

#### Azure Portal

1. **Configuration** → **General settings**
2. Toggle **"Always On"** to **On**
3. Click **"Save"**

#### Azure CLI

```bash
az webapp config set \
  --name your-app-name \
  --resource-group githubspark-rg \
  --always-on true
```

---

### 6. Set Up GitHub Actions Deployment (5 minutes)

#### Option A: Azure Portal (Automatic)

1. Navigate to your App Service
2. **Deployment** → **Deployment Center**
3. Select **"GitHub"** as source
4. Authorize Azure to access GitHub
5. Select your repository and branch
6. Click **"Save"**

Azure automatically:
- Creates `.github/workflows/` file
- Sets up `AZURE_WEBAPP_PUBLISH_PROFILE` secret
- Triggers first deployment

#### Option B: Manual Setup

1. **Download publish profile** from Azure Portal:
   - App Service → **Overview** → **Get publish profile**

2. **Add GitHub Secret**:
   - GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: Paste publish profile content
   - Click **"Add secret"**

3. **Update workflow file**:
   - Edit `.github/workflows/azure-app-service-deploy.yml`
   - Replace `your-app-name` with your actual Azure app name:
     ```yaml
     env:
       AZURE_WEBAPP_NAME: 'your-actual-app-name'
     ```

4. **Commit and push**:
   ```bash
   git add .github/workflows/azure-app-service-deploy.yml
   git commit -m "Configure Azure deployment"
   git push origin main
   ```

---

### 7. Verify Deployment (2 minutes)

1. **Watch GitHub Actions**:
   - Go to your repo → **Actions** tab
   - Click on the running workflow
   - Wait for completion (~3-5 minutes)

2. **Test your app**:
   ```bash
   # Replace with your app name
   curl https://your-app-name.azurewebsites.net/api/stats
   ```

3. **Open in browser**:
   ```
   https://your-app-name.azurewebsites.net
   ```

---

## Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
- Go to **Actions** tab in your repo
- Click on failed workflow
- Review error messages

**Common fixes**:
- Verify publish profile secret is set correctly
- Ensure app name in workflow matches Azure app name
- Check if build completes successfully

### App Not Starting

**View logs**:
```bash
az webapp log tail --name your-app-name --resource-group githubspark-rg
```

**Common issues**:
1. ❌ Missing `GITHUB_TOKEN` → Add in Azure settings
2. ❌ Invalid `DATABASE_URL` → Check connection string format
3. ❌ Build failed → Review build logs in Azure

### Database Connection Error

**Test connection locally**:
```bash
export DATABASE_URL="your-connection-string"
npm run db:push
```

**Check firewall**: Neon and Azure PostgreSQL allow connections by default, but verify in database settings

### GitHub API Rate Limit

**Verify token**:
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit
```

**Check**:
- Token hasn't expired
- Token has correct scopes: `repo`, `read:user`, `read:org`

---

## Post-Deployment Checklist

- [ ] App is accessible at `https://your-app-name.azurewebsites.net`
- [ ] API endpoint works: `/api/stats`
- [ ] GitHub analysis works: Test with a repo URL
- [ ] Always On is enabled (no cold starts)
- [ ] Application Insights is enabled (monitoring)
- [ ] Environment variables are set correctly
- [ ] GitHub Actions deployment succeeds

---

## Cost Summary

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Azure App Service | Basic B1 | $13 |
| Neon PostgreSQL | Free | $0 |
| GitHub Actions | Free (2000 min) | $0 |
| **Total** | | **$13/month** |

---

## Useful Commands

### View Logs
```bash
az webapp log tail --name your-app-name --resource-group githubspark-rg
```

### Restart App
```bash
az webapp restart --name your-app-name --resource-group githubspark-rg
```

### SSH into Container
```bash
az webapp ssh --name your-app-name --resource-group githubspark-rg
```

### Update Environment Variable
```bash
az webapp config appsettings set \
  --name your-app-name \
  --resource-group githubspark-rg \
  --settings GITHUB_TOKEN="new-token"
```

### Scale Up (Upgrade tier)
```bash
az appservice plan update \
  --name githubspark-plan \
  --resource-group githubspark-rg \
  --sku S1
```

---

## Next Steps

1. **Set up custom domain**: [Azure Portal → Custom domains]
2. **Enable Application Insights**: [Azure Portal → Application Insights]
3. **Configure alerts**: Set up email alerts for errors
4. **Set up staging slot**: Test before production (Standard tier+)
5. **Add authentication**: Implement user login (Passport.js already included)

---

## Support

- **Detailed guide**: [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)
- **Azure docs**: [docs.microsoft.com/azure/app-service](https://docs.microsoft.com/azure/app-service)
- **Issues**: Report bugs in GitHub Issues

---

## Summary

You should now have:
- ✅ GitHubSpark running on Azure App Service
- ✅ Automatic deployments via GitHub Actions
- ✅ Always On enabled (no cold starts)
- ✅ Monitoring and logs available
- ✅ Production-ready setup for ~$13/month

**Total setup time**: ~20 minutes

🎉 **Congratulations! Your app is live on Azure!** 🎉
