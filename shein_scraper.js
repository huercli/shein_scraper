/*
Downloads a csv with the following information from the shein store:
    Name / Link / Price / Discount percentage
*/

// Delay between element requests (ms)
DELAY = 1000

// Timeout for fetch requests (ms)
TIMEOUT = 5000

// CSV Delimitter
DELIMITTER = ';'

// Common objects
const dom_parser = new DOMParser();
const page_promises = new Array();
const csv_data = new Array();

const href_parameters = /\?.*/; // Captures any parameters in a url
const page_parameter = /(?<=page=)\d+/; // Captures the page number argument
const number_pattern = /(\d+\.\d+|\d+)/; // Captures a number or a number with digits

// As an example, execute at: https://eur.shein.com/RecommendSelection/Women-Clothing-sc-017172961.html
main();

async function main() {
    // Set CSV headers
    csv_data.push(["Name", "Link", "Price", "Discount Percentage"].map(surround_with_quotes).join(DELIMITTER));

    // Get total number of pages
    re_pages = /Total (\d+) Pages/;
    total_pages = parseInt(re_pages.exec(document.body.textContent)[1]);

    console.log(`${total_pages} pages found.`);

    // For each page, visit and get all the items
    url = window.location.href;

    for (let i = 1; i <= total_pages; i++) {
        // Fetch each page
        await sleep(DELAY);

        const page_url = setPageParameter(url, i)

        console.log(`Fetching page ${i} / ${total_pages}`);
        page_promises.push(
            getHTMLQuery(page_url).then((html) => {
                return getItemsFromPage(html, csv_data);
            })
        );
    }

    // Wait for all queries to finish
    await Promise.all(page_promises);

    // Insert a fake item for a minigame
    if (csv_data.length > 1000) {
        const item = generate_fake(csv_data);

        // Insert at a random position
        csv_data.splice(Math.floor(Math.random() * (csv_data.length + 1)), 0, item);
    }

    console.log("Done");

    // Replace . by , because excel in spain uses , as a decimal separator.
    const result = csv_data.join("\n").replace('.', ',');
    download("shein_data.csv", result);
}

/**
 * It's original price it's equal to the mean of all the original prices
 * It contains the string "me" in its name
 * It has a unique discount
 * @param {Array<string>} csv_data 
 */
function generate_fake(csv_data) {
    var mean = 0;
    const discounts_set = new Set();

    // Skip the first line of headers
    for (var data_line of csv_data.slice(1)) {
        data_line_ = data_line.split(DELIMITTER);
        let price_discounted = Number.parseFloat(data_line_[2]);
        let discount = Number.parseInt(data_line_[3]);

        mean += price_discounted / (1.0-discount/100.0);

        discounts_set.add(discount);
    }

    mean = mean / csv_data.length;
    
    const unused_discounts = new Array();
    for (var i = 0; i <= 100; i++) {
        if (!discounts_set.has(i)) {
            unused_discounts.push(i);
        }
    }

    const discount = unused_discounts[Math.floor(Math.random() * unused_discounts.length)].toString();
    const price =(Math.floor(mean - mean * (discount/100.0))).toString() + ".00"

    const name = atob("U0hFSU4gY2xpY2sgbWUgU0hFSU4gOik=");
    const link = atob("aHR0cHM6Ly93d3cubXVuZG9kZXBvcnRpdm8uY29tL2FsZmFiZXRhL2hlcm8vMjAyMy8wNy9hbGZhYmV0YS4xNjg4Mjg4MTI2LjAzODMuanBnP3dpZHRoPTc2OCZhc3BlY3RfcmF0aW89MTY6OSZmb3JtYXQ9bm93ZWJw");

    return [surround_with_quotes(name), surround_with_quotes(link), price, discount].join(DELIMITTER);
}

/**
 * Given a url, sets or creates the parameter page with the given number.
 * @param {string} url 
 * @param {number} i
 */
function setPageParameter(url, i) {
    if (page_parameter.exec(url) == null) {
        if (href_parameters.exec(url) == null) {
            return url + `?page=${i}`;
        }
        else {
            return url + `&page=${i}`;
        }  
    }
    else {
        return url.replace(page_parameter, `${i}`);
    }
}

/**
 * Finds all items in an html document and appends them to the provided list in CSV format
 * @param {Document} page       - The document that contains all items
 * @param {Array<string>} list  - The array to insert items to
 * @returns {void}
 */
async function getItemsFromPage(page, list) {
    // Find each item
    const items = page.querySelectorAll("section.product-card");
    if (items.length == 0) {
        console.log("Could not find any item in page, check CAPTCHA or ban.");
        return;
    }

    for (var item of items) {
        const csv_line = getItemInfoCSV(item);

        if (csv_line != undefined) {
            list.push(csv_line);
        }
        else {
            console.log(`Could not gather item data for ${item.ariaLabel}`);
        }
    }
}

/**
 * Given a product card, format all the relevant info in a CSV line
 * @param {Element} item 
 * @returns {string | undefined}
 */
function getItemInfoCSV(item) {
    const title = item.querySelector("div.product-card__goods-title-container > a");

    const name = title?.textContent.trim();
    const link = title?.href?.replace(href_parameters, "");

    var price = item.querySelector("p.product-item__camecase-wrap")?.textContent;
    var discount = item.querySelector("div.product-card__discount-label")?.textContent ?? '0';

    // Check if any value is undefined
    var csv_line = [name, link, price, discount];

    for (var item of csv_line) {
        if (item == undefined) {
            return undefined;
        }
    }

    // Format price and discount
    price = number_pattern.exec(price)[1];
    discount = number_pattern.exec(discount)[1];

    csv_line = [surround_with_quotes(name), surround_with_quotes(link), price, discount];

    return csv_line.join(DELIMITTER);
}

function surround_with_quotes(text) {
    return `\"${text}\"`
}

/**
 * Fetches an url and returns it as a DOM object (Document).
 * Adds a new attribute to the Document returned, location_from, which is its url.
 * (location is undefined and cannot be changed)
 * @param {string} url - URL of the page to fetch.
 * @returns {Document}
 */
async function getHTMLQuery(url) {
    // Return a promise
    return fetchWithTimeout(url)
        .then((data) => data.text())
        .then((data) => {
            const html = dom_parser.parseFromString(data, "text/html");
            html.location_from = url;
            return html;
        })
        .catch((reason) => {
            console.log(`${url} not found. Reason: ${reason}`);
        });
}

/**
 * Fetches an URL with a timeout set by the global TIMEOUT.
 * @param {string} url - URL to fetch.
 * @returns {Response}
 */
function fetchWithTimeout(url) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT);

    return fetch(url, {signal: controller.signal}).then((response) => {
        clearTimeout(id);
        return response;
    });
}

/**
 * Halts execution for a set amount of milliseconds
 * @param {number} ms 
 */
async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Downloads a text file.
 * @param {string} filename 
 * @param {string} text 
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.click();
  }