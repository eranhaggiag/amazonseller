import SellingPartnerAPI from 'amazon-sp-api';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import fetch from 'node-fetch';
import { gunzip } from 'zlib';
import { promisify } from 'util';

const gunzipAsync = promisify(gunzip);

// Load environment variables
dotenv.config();

async function downloadAndDecompressReport(url) {
    console.log('Downloading report from URL...');
    const response = await fetch(url);
    const compressedData = await response.buffer();
    
    console.log('Decompressing report data...');
    const decompressedData = await gunzipAsync(compressedData);
    return JSON.parse(decompressedData.toString());
}

async function main() {
    try {
        console.log('Initializing SP-API client...');
        
        // Initialize the SP-API client
        const sellingPartner = new SellingPartnerAPI({
            region: 'na', // North America region
            refresh_token: process.env.SELLING_PARTNER_REFRESH_TOKEN,
            credentials: {
                SELLING_PARTNER_APP_CLIENT_ID: process.env.SELLING_PARTNER_APP_CLIENT_ID,
                SELLING_PARTNER_APP_CLIENT_SECRET: process.env.SELLING_PARTNER_APP_CLIENT_SECRET,
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_SELLING_PARTNER_ROLE: process.env.AWS_SELLING_PARTNER_ROLE
            },
            debug: true
        });

        // Get current date and 30 days ago for report range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        // Request sales and traffic report
        console.log('Requesting sales and traffic report...');
        const reportResponse = await sellingPartner.callAPI({
            operation: 'createReport',
            endpoint: 'reports',
            body: {
                reportType: 'GET_SALES_AND_TRAFFIC_REPORT',
                dataStartTime: startDate.toISOString(),
                dataEndTime: endDate.toISOString(),
                marketplaceIds: ['ATVPDKIKX0DER'] // US marketplace
            }
        });

        console.log('Report creation response:', JSON.stringify(reportResponse, null, 2));

        if (!reportResponse.reportId) {
            throw new Error('No reportId received in response');
        }

        console.log(`Report ID received: ${reportResponse.reportId}`);
        console.log('Waiting for report to be processed...');

        // Poll for report status
        let reportInfo;
        let attempts = 0;
        const maxAttempts = 10;

        do {
            attempts++;
            console.log(`Checking report status (Attempt ${attempts}/${maxAttempts})...`);
            
            reportInfo = await sellingPartner.callAPI({
                operation: 'getReport',
                endpoint: 'reports',
                path: {
                    reportId: reportResponse.reportId
                }
            });

            console.log('Report status:', reportInfo.processingStatus);

            if (reportInfo.processingStatus !== 'DONE') {
                if (attempts >= maxAttempts) {
                    throw new Error('Maximum attempts reached waiting for report generation');
                }
                console.log('Waiting 15 seconds before next check...');
                await new Promise(resolve => setTimeout(resolve, 15000));
            }
        } while (reportInfo.processingStatus !== 'DONE');

        // Get the report document
        console.log('Report is ready. Getting report document...');
        const reportDocument = await sellingPartner.callAPI({
            operation: 'getReportDocument',
            endpoint: 'reports',
            path: {
                reportDocumentId: reportInfo.reportDocumentId
            }
        });

        console.log('Report document info:', JSON.stringify(reportDocument, null, 2));

        // Download and decompress the actual report data
        const reportData = await downloadAndDecompressReport(reportDocument.url);
        
        // Save the actual report data
        await fs.writeFile('sales_and_traffic_report.json', JSON.stringify(reportData, null, 2));
        console.log('Report data has been downloaded, decompressed, and saved to sales_and_traffic_report.json');

    } catch (error) {
        console.error('Error occurred:', error.message);
        if (error.response) {
            console.error('API Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.error('Full error details:', JSON.stringify(error, null, 2));
    }
}

// Update package.json to include "type": "module" for ES modules
const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
packageJson.type = 'module';
await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));

main();
