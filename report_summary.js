import fs from 'fs/promises';

async function generateSummary() {
    try {
        // Read the report data
        const reportData = JSON.parse(await fs.readFile('sales_and_traffic_report.json', 'utf8'));

        // Calculate summary statistics
        const summary = {
            dateRange: {
                start: reportData.reportSpecification.dataStartTime,
                end: reportData.reportSpecification.dataEndTime
            },
            totalSales: {
                amount: 0,
                currencyCode: 'USD'
            },
            totalB2BSales: {
                amount: 0,
                currencyCode: 'USD'
            },
            totalUnitsOrdered: 0,
            totalUnitsOrderedB2B: 0,
            totalPageViews: 0,
            totalSessions: 0,
            averageBuyBoxPercentage: 0
        };

        // Calculate totals from daily data
        reportData.salesAndTrafficByDate.forEach(day => {
            summary.totalSales.amount += day.salesByDate.orderedProductSales.amount;
            summary.totalB2BSales.amount += day.salesByDate.orderedProductSalesB2B.amount;
            summary.totalUnitsOrdered += day.salesByDate.unitsOrdered;
            summary.totalUnitsOrderedB2B += day.salesByDate.unitsOrderedB2B;
            summary.totalPageViews += day.trafficByDate.pageViews;
            summary.totalSessions += day.trafficByDate.sessions;
            summary.averageBuyBoxPercentage += day.trafficByDate.buyBoxPercentage;
        });

        // Calculate averages
        summary.averageBuyBoxPercentage /= reportData.salesAndTrafficByDate.length;

        // Round numbers for better readability
        summary.totalSales.amount = Math.round(summary.totalSales.amount * 100) / 100;
        summary.totalB2BSales.amount = Math.round(summary.totalB2BSales.amount * 100) / 100;
        summary.averageBuyBoxPercentage = Math.round(summary.averageBuyBoxPercentage * 100) / 100;

        // Save summary to file
        await fs.writeFile('report_summary.json', JSON.stringify(summary, null, 2));

        console.log('Sales and Traffic Report Summary:');
        console.log('--------------------------------');
        console.log(`Date Range: ${summary.dateRange.start} to ${summary.dateRange.end}`);
        console.log(`Total Sales: $${summary.totalSales.amount}`);
        console.log(`Total B2B Sales: $${summary.totalB2BSales.amount}`);
        console.log(`Total Units Ordered: ${summary.totalUnitsOrdered}`);
        console.log(`Total B2B Units Ordered: ${summary.totalUnitsOrderedB2B}`);
        console.log(`Total Page Views: ${summary.totalPageViews}`);
        console.log(`Total Sessions: ${summary.totalSessions}`);
        console.log(`Average Buy Box Percentage: ${summary.averageBuyBoxPercentage}%`);

    } catch (error) {
        console.error('Error generating summary:', error);
    }
}

generateSummary();
