# Amazon Seller Analytics Dashboard

An interactive web dashboard for visualizing Amazon Seller API data, including sales, traffic, and ASIN-specific metrics.

## Features

- **Overview Dashboard**
  - Summary cards with key metrics
  - Interactive charts for sales and traffic trends
  - Daily performance visualization

- **ASIN Analysis**
  - Detailed metrics for each ASIN
  - Sortable data tables
  - Search and filter functionality

- **Daily Performance**
  - Day-by-day breakdown of all metrics
  - Comprehensive sales and traffic data
  - Searchable and sortable interface

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd amazon-seller-analytics
```

2. Configure your Amazon Seller API credentials in `.env`:
```
SELLING_PARTNER_APP_CLIENT_ID=your_client_id
SELLING_PARTNER_APP_CLIENT_SECRET=your_client_secret
SELLING_PARTNER_REFRESH_TOKEN=your_refresh_token
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_SELLING_PARTNER_ROLE=your_role_arn
```

3. Run the data fetching script:
```bash
node index.js
```

4. Start the web server:
```bash
python3 -m http.server 8000
```

5. Open the dashboard:
```
http://localhost:8000
```

## Project Structure

- `index.js` - Main script for fetching data from Amazon SP-API
- `index.html` - Interactive web dashboard
- `report_summary.js` - Report data processing utilities
- `.env` - API credentials and configuration
- `sales_and_traffic_report.json` - Latest fetched report data

## Security Note

Make sure to never commit your `.env` file or expose your API credentials. The `.env` file is included in `.gitignore` for security.
