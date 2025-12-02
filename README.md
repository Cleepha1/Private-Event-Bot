# SkyBlock Event Bot

A private Discord bot for me to check SkyBlock event timings and mayor election data.

## Purpose

This bot is strictly for **personal, non-commercial use**. It helps me track SkyBlock events without needing to check in-game constantly.

## What It Does

- Shows currently active SkyBlock events
- Displays upcoming event schedules
- Provides event lookup with timing information
- Fetches current mayor election vote counts from Hypixel API

## Technical Details

**Discord.js Version**: v14  
**Node.js**: ES Modules  
**API Usage**: Hypixel API v2

### API Endpoints Used

- `https://api.hypixel.net/v2/resources/skyblock/election`
- `https://api.hypixel.net/v2/resources/skyblock/bingo`


### Request Pattern

- **Frequency**: On-demand only (triggered by me using commands)
- **Caching**: 60-second cache to minimize requests
- **No Automation**: No polling, timers, or scheduled tasks
- **Rate Limiting**: Respects Hypixel's rate limits with built-in caching

### User Base

- Private Discord server with only me
- Estimated usage: 10 API calls per day

### Data Handling

- No data storage or logging of API responses
- No user data collection
- No redistribution of Hypixel data
- Cache cleared automatically after 60 seconds

## API Key Usage

This bot requires a Hypixel API key configured in `config.json`. The API key is:
- Used only for the endpoints listed above
- Not shared or distributed
- Protected in `.gitignore` to prevent accidental commits

## Commands

- `/event current` - Active events right now
- `/event upcoming` - Next events on the schedule
- `/event lookup` - Search for a specific event
- `/event mayorvotes` - Current election standings

## Compliance

This project:
- ✅ Is for personal use only
- ✅ Does not redistribute or commercialize Hypixel data
- ✅ Uses only public API endpoints
- ✅ Implements caching to reduce API load
- ✅ Makes requests only when users actively request data
- ✅ Does not use any Hypixel branding or assets
- ✅ Is not advertised or distributed publicly

## Not Included

This repository does not include installation guides, documentation, or licensing as it is not intended for public use or distribution.
