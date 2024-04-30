import { chromium } from 'playwright';
import fs from 'fs/promises';

const run = async () => {
  const browser = await chromium.launch();  // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto('https://nextjs.org/docs');

  //get the 'nav' element
  const nav = await page.$('nav.styled-scrollbar');

  if(!nav) {
      throw new Error('nav element not found');
  } 

  // get all the 'a' elements
  const links = await nav.$$('a');

  const urls = await Promise.all(
    links.map(async (link) => {
      return await link.getAttribute('href');
    })
  );

  for (const url of urls) {
    console.log(`Visiting: https://nextjs.org${url}`);
    await page.goto(`https://nextjs.org${url}`);
    
    //get the content of the 'div' element
    const content = await page.$eval(
      'div.prose.prose-vercel',
      (el) => el.textContent
    );
    
    if (!content) {
      continue;
    }
    
    const encodedUrlForFileName = `${url}`.replace(/\//g, '_');
    
    const filePath = `./data/nextjs/${encodedUrlForFileName}.txt`;
    console.log(`Writing content to ${filePath}`);
    fs.writeFile(filePath, content);
  }

  await browser.close();  
}

run();