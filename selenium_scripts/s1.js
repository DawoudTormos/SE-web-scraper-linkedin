const SEL = require('selenium-webdriver');



(async function example() {


    let driver = await new SEL.Builder().forBrowser('chrome').build();


    try {

        await driver.get('https://www.linkedin.com/');

    } finally {

       // await driver.quit();
       
    }


})();