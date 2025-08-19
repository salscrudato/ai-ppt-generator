# Environment Setup Guide

## 🔒 Secure OpenAI API Key Configuration

This guide explains how to securely configure your OpenAI API key for local development without exposing it to version control or Firebase deployment.

## 📁 File Structure

```
ai-ppt-generator/
├── .env                    # ✅ Root environment file (secure, not committed)
├── .env.example           # ✅ Template file (committed)
├── .gitignore             # ✅ Excludes .env files
├── functions/
│   └── .env               # ✅ Auto-generated from root .env
└── start-dev.sh           # ✅ Loads and configures environment
```

## 🚀 Quick Setup

### 1. Create Environment File
```bash
# Copy the template
cp .env.example .env

# Edit with your actual API key
# OPENAI_API_KEY=your-actual-api-key-here
```

### 2. Start Development
```bash
# The script automatically configures everything
./start-dev.sh
```

## 🔧 How It Works

### Environment Loading Process
1. **Root .env Loading**: `start-dev.sh` loads variables from root `.env`
2. **Functions Configuration**: Script automatically copies `OPENAI_API_KEY` to `functions/.env`
3. **Firebase Emulator**: Reads the API key from `functions/.env`
4. **Frontend**: Uses environment-aware API endpoints

### Security Features
- ✅ **Version Control**: `.env` files are excluded from Git
- ✅ **Deployment Safety**: Root `.env` never deployed to Firebase
- ✅ **Local Only**: API keys stay on your development machine
- ✅ **Auto-Configuration**: No manual copying of keys required

## 🛡️ Security Best Practices

### ✅ DO
- Keep your `.env` file in the project root
- Use different API keys for development and production
- Rotate API keys regularly
- Set up production keys using Firebase Secret Manager

### ❌ DON'T
- Never commit `.env` files to version control
- Never share API keys in chat/email
- Never hardcode API keys in source code
- Never deploy `.env` files to production

## 🔍 Verification

### Check Environment Loading
```bash
# Start development and look for these messages:
# 🔑 Loading environment variables from .env file...
# 🔧 Configuring functions environment...
# ✅ Functions environment configured with API key
```

### Test API Key Configuration
```bash
# Check API health endpoint
curl http://127.0.0.1:5001/plsfixthx-ai/us-central1/api/health

# Should show: "apiKeyStatus": "configured"
```

## 🚨 Troubleshooting

### API Key Not Found
If you see warnings about missing API key:

1. **Check Root .env**: Ensure `OPENAI_API_KEY` is set in root `.env`
2. **Restart Development**: Run `./start-dev.sh` again
3. **Check Functions .env**: Verify `functions/.env` has the API key
4. **Permissions**: Ensure `.env` files are readable

### Environment Not Loading
```bash
# Check if .env exists
ls -la .env

# Check if start-dev.sh is executable
chmod +x start-dev.sh

# Check environment variables
echo $OPENAI_API_KEY
```

## 🏭 Production Deployment

For production, use Firebase Secret Manager instead of environment files:

```bash
# Set production secret
firebase functions:secrets:set OPENAI_API_KEY

# Deploy with secrets
firebase deploy --only functions
```

## 📝 Notes

- The `functions/.env` file is auto-generated and can be safely deleted
- The root `.env` file is the single source of truth for local development
- Environment variables are loaded fresh each time you run `./start-dev.sh`
- The setup works with both Firebase emulators and production deployment
