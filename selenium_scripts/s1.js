const { Builder, By, Key, until } = require('selenium-webdriver');



(async function example() {


    let driver = await new Builder().forBrowser('chrome').build();


    try {
        await driver.get('https://www.linkedin.com/');

    } finally {
       // await driver.quit();
    }


})();