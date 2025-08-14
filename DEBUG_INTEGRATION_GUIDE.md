# 🐛 Comprehensive Debugging System Integration Guide

## Overview

This guide shows how to use the advanced debugging infrastructure that's been added to both the frontend and backend of your AI PowerPoint Generator.

## 🔧 Backend Debugging (Functions)

### Features Added

1. **Request Tracing**: Every API request gets a unique ID and is tracked from start to finish
2. **Performance Monitoring**: Automatic timing of operations with memory usage tracking
3. **AI Model Debugging**: Specific logging for AI model calls and responses
4. **Error Tracking**: Comprehensive error logging with stack traces
5. **Categorized Logging**: Organized logs by category (API, AI_MODEL, PPT_GENERATION, etc.)

### Usage Examples

```typescript
// The debugging is already integrated into your API endpoints
// Example from /draft endpoint:

const requestId = debugLogger.createRequestContext('/draft', {
  userAgent: req.get('User-Agent'),
  contentLength: req.get('Content-Length'),
  ip: req.ip
});

debugLogger.info('Draft generation request received', DebugCategory.API, requestId, {
  promptLength: requestData.prompt?.length || 0,
  audience: requestData.audience,
  tone: requestData.tone
});

// Performance tracking
const perfId = debugLogger.startPerformanceTracking('draft-generation', requestId);
// ... do work ...
debugLogger.endPerformanceTracking(perfId, { slideGenerated: true });
```

### Log Output Example

```
[2025-08-13T23:19:41.337Z] [req_12345678] [INFO] [API] 🚀 Request started: /draft
  📊 Metadata: {
    "endpoint": "/draft",
    "userAgent": "Mozilla/5.0...",
    "promptLength": 70
  }

[2025-08-13T23:19:41.500Z] [req_12345678] [INFO] [AI_MODEL] 🤖 AI Model Call: gpt-4o-mini
  📊 Metadata: {
    "model": "gpt-4o-mini",
    "promptLength": 1250,
    "promptPreview": "You are an expert PowerPoint presentation architect..."
  }

[2025-08-13T23:19:51.095Z] [req_12345678] [INFO] [API] ✅ Request completed: /draft (9758ms)
```

## 🌐 Frontend Debugging

### Features Added

1. **Visual Debug Dashboard**: Floating debug panel with real-time logs
2. **API Call Tracking**: Automatic tracking of all API requests/responses
3. **User Interaction Logging**: Track clicks, form submissions, navigation
4. **Performance Monitoring**: Client-side performance metrics
5. **Error Boundary Integration**: Automatic error reporting
6. **Persistent Logging**: Logs saved to localStorage

### Integration in React Components

```typescript
import { useDebugLogger, DebugCategory } from '../utils/debugLogger';

function MyComponent() {
  const debug = useDebugLogger();

  const handleButtonClick = () => {
    debug.trackUserInteraction('click', 'generate-button');
    debug.log.info('User clicked generate button', DebugCategory.USER_INTERACTION);
    
    // API call with automatic tracking
    const apiCallId = debug.trackAPICall('/api/generate', 'POST', formData);
    
    // Your API call here...
    // debug.completeAPICall(apiCallId, response.status, responseData);
  };

  return <button onClick={handleButtonClick}>Generate</button>;
}
```

### Using the Enhanced API Client

```typescript
import { api } from '../utils/apiClient';

// All API calls are automatically tracked and logged
const result = await api.generateDraft({
  prompt: "Create a presentation about AI",
  audience: "executives",
  tone: "professional"
});

// Automatic logging includes:
// - Request/response timing
// - Payload sizes
// - Error tracking
// - Retry attempts
```

### Visual Debug Dashboard

Add to your main App component:

```typescript
import DebugDashboard from './components/DebugDashboard';

function App() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div>
      {/* Your app content */}
      
      {/* Debug dashboard - only shows in development */}
      {process.env.NODE_ENV === 'development' && (
        <DebugDashboard 
          isVisible={showDebug} 
          onToggle={setShowDebug} 
        />
      )}
    </div>
  );
}
```

## 🎛️ Configuration Options

### Backend Configuration

Set environment variables:

```bash
# Enable debugging
DEBUG=true
DEBUG_LEVEL=3  # 0=ERROR, 1=WARN, 2=INFO, 3=DEBUG, 4=TRACE

# In development
NODE_ENV=development
```

### Frontend Configuration

Use localStorage for runtime configuration:

```javascript
// Enable debugging
localStorage.setItem('debug', 'true');
localStorage.setItem('debugLevel', '3');

// Or programmatically
frontendDebugLogger.updateConfig({
  enabled: true,
  level: DebugLevel.DEBUG,
  showVisualDebugger: true,
  persistLogs: true
});
```

## 🔍 Troubleshooting Common Issues

### 1. PowerPoint Generation Errors

**Backend logs to check:**
- Look for `PPT_GENERATION` category logs
- Check for AI model errors in `AI_MODEL` category
- Review validation errors in `VALIDATION` category

**Frontend logs to check:**
- API call failures in the debug dashboard
- Check network tab for request/response details

### 2. API Connection Issues

**Backend logs:**
```
❌ API connection error: TypeError: Failed to fetch
📊 Metadata: {
  "baseUrl": "http://localhost:5003",
  "endpoint": "/health",
  "error": "Connection refused"
}
```

**Frontend logs:**
- Check API call tracking in debug dashboard
- Look for network errors and retry attempts

### 3. Performance Issues

**Backend performance tracking:**
```
⏱️ Performance tracking completed: draft-generation (9756ms)
📊 Metadata: {
  "memoryDelta": { "heapUsed": 15728640 },
  "operation": "draft-generation"
}
```

**Frontend performance tracking:**
- Check performance metrics in debug dashboard
- Look for slow API calls and rendering issues

## 📊 Debug Dashboard Features

### Tabs Available:

1. **Logs**: Real-time log viewer with filtering
   - Filter by level (Error, Warn, Info, Debug, Trace)
   - Filter by category (API, User Interaction, etc.)
   - Auto-scroll option
   - Export logs as JSON

2. **API**: API call monitoring (coming soon)
   - Request/response details
   - Performance metrics
   - Error rates

3. **Performance**: Performance metrics (coming soon)
   - Page load times
   - API response times
   - Memory usage

4. **Settings**: Configuration options
   - Debug level control
   - Enable/disable features
   - Persistence settings

## 🚀 Quick Start

1. **Backend**: Debugging is automatically enabled in development mode
2. **Frontend**: Add the DebugDashboard component to your app
3. **Open the debug panel**: Look for the floating "🐛 Debug" button in development
4. **Monitor logs**: Watch real-time logs as you use the application
5. **Export logs**: Use the export button to save logs for analysis

## 💡 Best Practices

1. **Use appropriate log levels**: Error for failures, Info for important events, Debug for detailed tracing
2. **Include context**: Always include relevant metadata with log entries
3. **Track user flows**: Use user interaction tracking to understand user behavior
4. **Monitor performance**: Use performance tracking for slow operations
5. **Export logs**: Save logs when reporting issues or analyzing problems

This debugging system will make troubleshooting much easier and provide valuable insights into how your application is performing!
