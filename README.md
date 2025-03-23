# Strava Cities Extractor

A Node.js API that processes Strava activity data and extracts a clean list of cities from segment efforts.

## Description

This service takes Strava activity data via POST request and extracts unique city names from segment efforts, applying the following rules:
- Removes accents from city names
- Capitalizes first letter
- Excludes specific cities (configured in `excluded-cities.yaml`)
- Removes cities with commas in their names
- Removes duplicate cities

## Endpoint

Local development endpoint:

```bash
curl -X POST http://localhost:3000/ \
-H "Content-Type: application/json" \
-d '{
  "segment_efforts": [
    {
      "segment": {
        "city": "Ulldecona"
      }
    },
    {
      "segment": {
        "city": "Tírig"
      }
    },
    {
      "segment": {
        "city": "tirig"
      }
    }
  ]
}'
```

Response:
```json
{
  "cities": "Ulldecona, Tírig"
}
```