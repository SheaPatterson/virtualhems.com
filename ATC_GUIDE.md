# VirtualHEMS ATC Communications Guide

## 🎙️ AI-Powered ATC System

Your VirtualHEMS platform now includes a complete AI-powered Air Traffic Control system using AWS Bedrock (Claude 3 Sonnet).

## Features

### 5 Controller Types
1. **Ground Control** - Taxi instructions, parking, ground movement
2. **Tower Control** - Takeoff/landing clearances, runway operations
3. **Departure Control** - Initial climb, traffic advisories, handoffs
4. **Approach Control** - Descent instructions, approach clearances
5. **Center Control** - Enroute flight following, altitude changes

### Realistic Communications
- ✅ Proper ATC phraseology
- ✅ Context-aware responses
- ✅ Emergency priority handling
- ✅ Traffic advisories
- ✅ Weather information
- ✅ Text-to-speech audio

### Smart Features
- Auto-fills callsign
- Quick phrase buttons
- Frequency management
- Airport code tracking
- Message history
- Audio playback

## How to Use

### 1. Access ATC Chat

During an active mission:
1. Go to Mission Tracking page
2. Click the **"ATC"** tab (next to Dispatch)
3. ATC chat interface appears

### 2. Select Controller

Choose the appropriate controller for your phase of flight:

| Phase | Controller | Typical Frequency |
|-------|-----------|------------------|
| Pre-flight | Ground | 121.9 |
| Takeoff | Tower | 118.1 |
| Departure | Departure | 125.8 |
| Enroute | Center | 132.45 |
| Arrival | Approach | 119.3 |
| Landing | Tower | 118.1 |

### 3. Enter Airport Code (Optional)

- Use ICAO format (e.g., KPIT, KJFK)
- Helps AI provide location-specific info
- Not required but recommended

### 4. Enter Frequency (Optional)

- Standard ATC frequencies
- Adds realism to communications
- AI will reference it in responses

### 5. Send Messages

Type your message or use quick phrases:
- "Request taxi"
- "Ready for departure"
- "Request landing"
- "Declare emergency"

### 6. Receive Responses

- AI responds as real ATC would
- Proper phraseology
- Context-aware
- Audio playback available

## Example Communications

### Ground Control

**Pilot**: "STAT-1, request taxi"

**Ground**: "STAT-1, Ground, taxi to runway 28 via taxiway Alpha, hold short of runway 28, altimeter 30.12"

### Tower Control

**Pilot**: "STAT-1, ready for departure, runway 28"

**Tower**: "STAT-1, Tower, runway 28, cleared for takeoff, wind 270 at 8, emergency priority approved"

### Departure Control

**Pilot**: "STAT-1, passing 1,500 for 3,000"

**Departure**: "STAT-1, Departure, roger, climb and maintain 3,000, turn left heading 180, contact Center on 132.45"

### Approach Control

**Pilot**: "STAT-1, requesting approach clearance"

**Approach**: "STAT-1, Approach, descend and maintain 2,000, expect visual approach runway 10, report field in sight"

### Center Control

**Pilot**: "STAT-1, level at 5,000"

**Center**: "STAT-1, Center, roger, maintain 5,000, advise if you need priority handling for your medical flight"

### Emergency Declaration

**Pilot**: "STAT-1, emergency priority, medical flight, patient critical"

**ATC**: "STAT-1, roger, emergency priority approved, all traffic cleared, expedite as able, advise fuel and souls on board"

## Quick Phrases

Pre-configured phrases for common situations:

1. **Request Taxi** - `[Callsign], request taxi`
2. **Ready for Departure** - `[Callsign], ready for departure`
3. **Request Landing** - `[Callsign], request landing`
4. **Declare Emergency** - `[Callsign], emergency priority, medical flight`

Click any button to auto-fill the message.

## Tips for Realistic Communications

### Standard Format
```
[Your Callsign], [Your Message]
```

Example: "STAT-1, request taxi to runway 28"

### Include Key Information
- Callsign (auto-filled)
- Current position/altitude
- Intentions
- Special requests

### Use Standard Phraseology
- "Request" not "Can I have"
- "Roger" for acknowledgment
- "Wilco" for will comply
- "Negative" not "No"
- "Affirmative" not "Yes"

### Emergency Communications
- State "Emergency" clearly
- Provide nature of emergency
- State intentions
- Fuel and souls on board if asked

## Controller Personalities

Each controller type has unique characteristics:

### Ground Control
- **Focus**: Safe ground movement
- **Style**: Clear and directive
- **Typical**: Taxi routes, hold short instructions

### Tower Control
- **Focus**: Runway safety
- **Style**: Authoritative
- **Typical**: Takeoff/landing clearances, go-arounds

### Departure Control
- **Focus**: Traffic separation
- **Style**: Efficient
- **Typical**: Climb instructions, vectors, handoffs

### Approach Control
- **Focus**: Sequencing
- **Style**: Calm and methodical
- **Typical**: Descent clearances, approach types

### Center Control
- **Focus**: Enroute efficiency
- **Style**: Professional
- **Typical**: Altitude changes, weather, routing

## Advanced Features

### Context Awareness

The AI knows:
- Your callsign
- Aircraft type
- Current position
- Altitude and speed
- Mission type (HEMS)
- Patient status
- Fuel remaining
- Flight phase

### Emergency Priority

When you declare emergency:
- AI prioritizes your requests
- Clears traffic
- Expedites clearances
- Offers assistance
- Requests fuel/souls if needed

### Weather Integration

AI can provide:
- Current conditions
- Wind information
- Altimeter settings
- Visibility reports
- Weather advisories

### Traffic Advisories

AI may include:
- Traffic information
- Sequencing instructions
- Spacing requirements
- Conflict alerts

## API Endpoints

### Contact ATC
```
POST /api/atc/contact
{
  "mission_id": "HEMS-ABC123",
  "message": "Request taxi",
  "controller_type": "ground",
  "airport_code": "KPIT",
  "frequency": "121.9"
}
```

### Response
```json
{
  "success": true,
  "response_text": "STAT-1, Ground, taxi to runway 28...",
  "controller_type": "ground",
  "airport_code": "KPIT",
  "frequency": "121.9",
  "mission_id": "HEMS-ABC123"
}
```

## Troubleshooting

### ATC Not Responding
- Check backend is running
- Verify AWS Bedrock access
- Check browser console for errors
- Ensure mission is active

### Audio Not Playing
- Check browser audio permissions
- Verify AWS Polly is configured
- Check volume settings
- Try refreshing page

### Wrong Controller Type
- Select appropriate controller for phase
- Ground → Tower → Departure → Center → Approach → Tower
- Match controller to your operation

### Unrealistic Responses
- Provide more context in message
- Include altitude/position
- Specify intentions clearly
- Use standard phraseology

## Cost Estimate

### AWS Bedrock (Claude 3 Sonnet)
- Input: $0.003 per 1K tokens
- Output: $0.015 per 1K tokens
- Average ATC exchange: ~500 tokens
- Cost per exchange: ~$0.01
- 100 exchanges: ~$1.00

### AWS Polly (TTS)
- $4 per 1M characters
- Average response: 100 characters
- Cost per response: ~$0.0004
- 1,000 responses: ~$0.40

**Total**: Very affordable with your AWS credits!

## Future Enhancements

### Planned Features
- [ ] ATIS (Automated Terminal Information)
- [ ] NOTAM integration
- [ ] Real weather data
- [ ] Multiple aircraft tracking
- [ ] Handoff between controllers
- [ ] Voice recognition (pilot speech-to-text)
- [ ] Realistic radio effects
- [ ] Controller workload simulation

### Community Requests
- Custom airport procedures
- International phraseology
- Military ATC
- Helicopter-specific procedures
- Emergency scenarios

## Comparison: Dispatch vs ATC

| Feature | Dispatch | ATC |
|---------|----------|-----|
| **Purpose** | Mission coordination | Air traffic control |
| **Focus** | Patient care, logistics | Flight safety, separation |
| **Style** | Supportive, informative | Directive, authoritative |
| **When** | Throughout mission | During flight operations |
| **Info** | Medical, fuel, weather | Clearances, traffic, weather |

Use both for complete realism!

## Examples by Scenario

### Scenario 1: Normal Departure

1. **Ground**: "STAT-1, request taxi"
2. **Ground**: "STAT-1, taxi runway 28 via Alpha"
3. **Tower**: "STAT-1, ready for departure"
4. **Tower**: "STAT-1, cleared for takeoff runway 28"
5. **Departure**: "STAT-1, passing 1,500"
6. **Departure**: "STAT-1, climb maintain 3,000"

### Scenario 2: Emergency Landing

1. **Center**: "STAT-1, emergency, patient critical, requesting priority"
2. **Center**: "STAT-1, emergency approved, contact Approach 119.3"
3. **Approach**: "STAT-1, emergency, requesting immediate landing"
4. **Approach**: "STAT-1, cleared direct, descend 2,000, runway 10"
5. **Tower**: "STAT-1, emergency, 5 miles final"
6. **Tower**: "STAT-1, cleared to land runway 10, emergency equipment standing by"

### Scenario 3: Weather Diversion

1. **Center**: "STAT-1, requesting weather at destination"
2. **Center**: "STAT-1, destination IFR, visibility 1 mile, suggest alternate"
3. **Center**: "STAT-1, diverting to KPIT"
4. **Center**: "STAT-1, roger, cleared direct KPIT, contact Approach"

## Best Practices

1. **Always include callsign** (auto-filled)
2. **Be concise** - ATC is busy
3. **Use standard phrases** - easier to understand
4. **Read back clearances** - safety critical
5. **Declare emergencies early** - don't wait
6. **Monitor frequency** - listen to other traffic
7. **Switch controllers** - as you progress through flight
8. **Use quick phrases** - for common requests

## Support

### Getting Help
- Check browser console (F12)
- Review backend logs
- Test with simple messages first
- Verify AWS Bedrock access

### Reporting Issues
- Include message sent
- Include response received
- Note controller type
- Check for error messages

## Conclusion

Your VirtualHEMS platform now has professional-grade ATC communications powered by AI. Use it alongside the Dispatch system for the most realistic HEMS simulation experience!

**Enjoy your flights! 🚁**

---

*ATC System v1.0*
*Powered by AWS Bedrock (Claude 3 Sonnet)*
*Added: February 11, 2026*
