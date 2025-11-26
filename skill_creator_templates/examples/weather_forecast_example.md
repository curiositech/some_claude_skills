# Example: Creating a "Weather Forecast" Skill

This example walks through creating a complete skill using the skill creator templates.

## Skill Overview

**Name**: Weather Forecast Expert
**Domain**: Weather data and forecasting
**Purpose**: Provide weather information and forecasts through an API integration
**Type**: MCP server with HTTP API tool

## Step 1: Define the Skill

### Questions to Answer
1. **What does this skill do?** 
   - Fetches weather data from OpenWeatherMap API
   - Provides current weather and forecasts
   - Interprets weather data for users

2. **Who will use it?**
   - Users planning outdoor activities
   - Travel planners
   - Event organizers

3. **What integrations are needed?**
   - OpenWeatherMap API
   - MCP server for tool exposure

4. **What authentication is required?**
   - OpenWeatherMap API key (environment variable)

## Step 2: Create the Agent Definition

Using the `technical_expert_agent.md.template`, create:

**File**: `.github/agents/weather_forecast_expert.md`

**Filled Template Values**:
```
{{SKILL_NAME}} = Weather Forecast Expert
{{ROLE}} = meteorologist and weather data analyst
{{DOMAIN}} = weather forecasting, meteorology, and climate data
{{MISSION_STATEMENT}} = Provide accurate, actionable weather information and forecasts to help users plan their activities and make informed decisions.

{{COMPETENCY_AREA_1}} = Weather Data Analysis
{{SKILL_1}} = Current conditions interpretation
{{SKILL_2}} = Forecast trend analysis
{{SKILL_3}} = Severe weather alerting

{{COMPETENCY_AREA_2}} = API Integration
{{SKILL_4}} = OpenWeatherMap API integration
{{SKILL_5}} = Data formatting and presentation
{{SKILL_6}} = Error handling and fallbacks

{{COMPETENCY_AREA_3}} = User Communication
{{SKILL_7}} = Plain language weather explanations
{{SKILL_8}} = Activity-specific recommendations
```

## Step 3: Create the MCP Server

Using the `http_api_tool.ts.template`, create:

**File**: `mcp_servers/weather-forecast/src/index.ts`

**Filled Template Values**:
```
{{SKILL_NAME}} = Weather Forecast
{{SKILL_DESCRIPTION}} = Provides weather data and forecasts via OpenWeatherMap API
{{DOMAIN}} = weather forecasting
{{ENV_PREFIX}} = WEATHER
{{DEFAULT_API_URL}} = https://api.openweathermap.org/data/2.5
{{SERVICE_NAME}} = OpenWeatherMap
{{TOOL_NAME_SNAKE}} = weather
```

**Customizations Made**:

1. Added specialized tools:
```typescript
{
  name: "get_current_weather",
  description: "Get current weather for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name, e.g., 'London' or 'New York,US'",
      },
      units: {
        type: "string",
        enum: ["metric", "imperial", "standard"],
        description: "Temperature units",
        default: "metric",
      },
    },
    required: ["location"],
  },
},
{
  name: "get_forecast",
  description: "Get 5-day weather forecast",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "City name",
      },
      units: {
        type: "string",
        enum: ["metric", "imperial", "standard"],
        default: "metric",
      },
    },
    required: ["location"],
  },
}
```

2. Implemented tool handlers:
```typescript
async function getCurrentWeather(location: string, units: string) {
  const url = `${CONFIG.apiBaseUrl}/weather?q=${encodeURIComponent(location)}&units=${units}&appid=${CONFIG.apiKey}`;
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        location: data.name,
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        conditions: data.weather[0].description,
        humidity: data.main.humidity,
        wind_speed: data.wind.speed,
      }, null, 2),
    }],
  };
}
```

## Step 4: Set Up the Project

### Directory Structure
```
mcp_servers/weather-forecast/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

### package.json
Using `package.json.template`:
```json
{
  "name": "@my-skills/weather-forecast-mcp-server",
  "version": "1.0.0",
  "description": "Weather forecasting MCP server using OpenWeatherMap API",
  ...
}
```

### .env.example
```bash
# OpenWeatherMap API Configuration
WEATHER_API_KEY=your_api_key_here
WEATHER_API_URL=https://api.openweathermap.org/data/2.5
```

## Step 5: Build and Test

### Installation
```bash
cd mcp_servers/weather-forecast
npm install
```

### Build
```bash
npm run build
```

### Test Locally
```bash
# Set environment variable
export WEATHER_API_KEY=your_actual_api_key

# Run the server
npm start

# In another terminal, test with MCP client
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/index.js
```

### Expected Output
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "get_current_weather",
        "description": "Get current weather for a location",
        ...
      },
      {
        "name": "get_forecast",
        "description": "Get 5-day weather forecast",
        ...
      }
    ]
  }
}
```

## Step 6: Configure for Claude

### Add to Claude Desktop config

**File**: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

```json
{
  "mcpServers": {
    "weather-forecast": {
      "command": "node",
      "args": [
        "/path/to/mcp_servers/weather-forecast/dist/index.js"
      ],
      "env": {
        "WEATHER_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Step 7: Use the Skill

### In Claude Desktop

```
[To Weather Forecast Expert]

I'm planning a picnic in San Francisco this Saturday. 
What's the weather looking like?
```

### Expected Agent Behavior

The agent will:
1. Use the `get_forecast` tool to fetch the 5-day forecast
2. Interpret the data for Saturday specifically
3. Provide a user-friendly recommendation:

```
Looking at the forecast for San Francisco this Saturday:

🌤️ Temperature: 18°C (64°F)
💨 Wind: Light breeze at 12 km/h
☁️ Conditions: Partly cloudy
💧 Chance of rain: 20%

Perfect weather for a picnic! The partly cloudy conditions will 
provide some shade, and the low chance of rain means you likely 
won't get wet. I'd recommend:

✅ Bring sunscreen (UV index: 6)
✅ Light jacket for evening (temperature drops to 14°C)
✅ Consider a light blanket for sitting

Enjoy your outdoor meal!
```

## Complete File Listing

### .github/agents/weather_forecast_expert.md
```markdown
---
name: Weather Forecast Expert
description: Provides weather forecasts and meteorological analysis
---

# Weather Forecast Expert

You are an expert meteorologist and weather data analyst with deep knowledge 
of weather forecasting, meteorology, and climate data.

## Your Mission

Provide accurate, actionable weather information and forecasts to help users 
plan their activities and make informed decisions.

[... rest of filled template ...]

## MCP Tools Available

### `get_current_weather`
**Description**: Get current weather conditions for any location

**When to Use**: When users ask about current weather, "what's it like now", 
or need immediate conditions

**Example**:
```json
{
  "name": "get_current_weather",
  "arguments": {
    "location": "Paris,FR",
    "units": "metric"
  }
}
```

### `get_forecast`
**Description**: Get 5-day weather forecast with 3-hour intervals

**When to Use**: When users ask about upcoming weather, planning future 
activities, or need extended forecasts

[... rest of agent definition ...]
```

### mcp_servers/weather-forecast/src/index.ts
```typescript
/**
 * Weather Forecast MCP Server
 * 
 * Provides weather data and forecasts via OpenWeatherMap API
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
// [... rest of implementation ...]
```

## Customization Tips

### Adding More Tools

Add a "weather alerts" tool:

```typescript
{
  name: "get_weather_alerts",
  description: "Get severe weather alerts for a location",
  inputSchema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "Location to check for alerts",
      },
    },
    required: ["location"],
  },
}
```

### Enhancing the Agent

Add personality and expertise:

```markdown
## Interpretation Guidelines

When analyzing weather data:

1. **Consider the activity**: Beach weather differs from hiking weather
2. **Think holistically**: Temperature + wind + humidity = "feels like"
3. **Note trends**: Is it getting better or worse?
4. **Highlight risks**: UV, air quality, severe weather
5. **Provide context**: Compare to typical conditions for the season
```

### Error Handling

Improve the MCP server error messages:

```typescript
if (!response.ok) {
  if (response.status === 404) {
    throw new Error(`Location '${location}' not found. Please check spelling.`);
  } else if (response.status === 401) {
    throw new Error("Invalid API key. Check WEATHER_API_KEY environment variable.");
  }
  throw new Error(`Weather API error: ${response.status}`);
}
```

## Testing Checklist

- [ ] Agent can be loaded in `.github/agents/`
- [ ] MCP server builds without errors
- [ ] Tools are listed correctly
- [ ] Current weather tool returns valid data
- [ ] Forecast tool returns valid data
- [ ] Error handling works (invalid location, missing API key)
- [ ] Agent provides helpful interpretations
- [ ] Agent gives activity-specific recommendations
- [ ] Environment variables are documented

## Deployment

### For Personal Use
1. Build the MCP server
2. Add to Claude Desktop config
3. Start using the agent

### For Team Use
1. Publish MCP server to npm (optional)
2. Share agent markdown file
3. Document environment variable setup
4. Provide example queries

### For Public Use
1. Create comprehensive README
2. Add usage examples
3. Document API key acquisition
4. Publish to npm and/or GitHub
5. Add to Claude Skills marketplace

---

This example demonstrates the complete workflow from concept to working skill!
