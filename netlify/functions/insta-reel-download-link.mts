import { Context } from "@netlify/functions";
import puppeteer from 'puppeteer';

export default async (request: Request, context: Context) => {
    try {
        const { url } = context.params;
        if (!url) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required parameter: url" }),
            };
        }
        const videoLink = await getVideoLink(url);
        return {
            statusCode: 200,
            body: JSON.stringify({ downloadLink: videoLink }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error" }),
        };
    }
};

const getVideoLink = async (url) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    try {
        // Navigate to the Instagram reel URL
        await page.goto(url);

        // Wait for the video element to be available in the DOM
        await page.waitForSelector('video');

        // Extract the src attribute value of the video element
        const videoSrc = await page.evaluate(() => {
            const videoElement = document.querySelector('video');
            return videoElement ? videoElement.getAttribute('src') : null;
        });

        return videoSrc;
    } catch (error) {
        throw new Error("Error extracting video link");
    } finally {
        // Close the browser after extraction
        await browser.close();
    }
};