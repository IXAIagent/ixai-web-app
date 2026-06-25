# V17.00 Market Data Provider Foundation

## Goal

V17 creates a product-layer market data provider foundation for future live market integration.

## Scope

- Adds provider contracts under `src/lib/market-data/`.
- Adds a manual placeholder provider and provider registry metadata.
- Produces `MarketDataSnapshot` objects with symbol, asset type, price, currency, source, `asOf`, data quality, and provider status.
- Explicitly does not import or re-export existing legacy market-data provider modules that contain external provider logic.

## Boundaries

- No Yahoo Finance connection.
- No Binance connection.
- No broker connection.
- No external API calls.
- No database writes, SQL, migrations, trading logic, or recommendations.

## Next

V18 uses this snapshot contract to prepare Morning Brief live-data readiness.
