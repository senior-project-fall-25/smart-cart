const cheerio = require('cheerio');
const fs = require('fs');

async function scrapeFacet(facet, totalPages) {
  async function scrapePage(pageNumber) {
    const url =
      pageNumber === 1
        ? `https://us.openfoodfacts.org/facets/${facet}`
        : `https://us.openfoodfacts.org/facets/${facet}/${pageNumber}`;

    console.log(`Fetching ${facet} page ${pageNumber}...`);
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];
    $('#tagstable tbody tr').each((_, el) => {
      const name = $(el).find('td:first-child a').text().trim();
      const link = $(el).find('td:first-child a').attr('href');
      if (name && link) {
        results.push({ name, url: `https://us.openfoodfacts.org${link}` });
      }
    });
    return results;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const pagesData = await Promise.all(pageNumbers.map(scrapePage));
  const allItems = pagesData.flat();

  const jsContent = `export const ${facet} = ${JSON.stringify(allItems, null, 2)};\n`;
  const fileName = `${facet}.js`;
  fs.writeFileSync(fileName, jsContent);

  console.log(`✅ Scraped ${allItems.length} ${facet} from ${totalPages} pages and saved to ${fileName}`);
}

(async () => {
  await scrapeFacet('allergens', 4);
  await scrapeFacet('additives', 5);
  await scrapeFacet('traces', 7);   
})();
