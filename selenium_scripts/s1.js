const SEL = require('selenium-webdriver');



 const s1 = async function () {


    let driver =  await new SEL.Builder().forBrowser('chrome').build();


    try {

         await driver.get('https://google.com');

    }catch{


    } finally {

       // await driver.quit();
       
    }


};


export {s1}
 