const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const { start } = require('repl');


const app = express();
const PORT = 888;




const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36";

let searchTitle;
let credentials;
const credsPath = path.join(__dirname, 'credentials', 'credentials.json');

let options = new chrome.Options();
options.addArguments(`--user-agent=${userAgent}`);
options.addArguments('--disable-webrtc');  // To avoid STUN errors
options.addArguments('--log-level=3'); 






app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});




app.post('/submit-creds', (req, res) => {
    const user = req.body.username;
    const pass = req.body.password;
    const creds = [ user , pass ];

    credentials = [...creds]// keeping the new credentials in memory after updating the files

    const json = { credentials: [...creds] };



     try {

         fs.writeFileSync(credsPath, JSON.stringify(json, null, 2), 'utf8');
         res.send('Form submitted successfully!');

     } catch (error) {

         console.error('Error handling the form submission:', error);
         res.status(500).send('An error occurred while processing your request.');

     }


});



app.post('/scrape', async(req, res) => {

let geoId = "",pagesNb;
    let driver =  await new Builder().forBrowser('chrome').setChromeOptions(options).build();


    process.on('exit', () => {
        console.log('Exiting script...');
        if (driver) {
            driver.quit(); // Ensure WebDriver is properly closed
        }
    });


      searchTitle = req.body.searchTitle;
      geoId =   req.body.geoId;
      pagesNb =   req.body.pagesNb;
      console.log(req.body)

      res.send('Request Reached node server. Selenium should have started');

      makeResultDir(searchTitle);

     try {
        await login(driver);

        await waitUntilUrlIs(driver , "https://www.linkedin.com/feed/");
        await loadPage(driver,geoId,0);

        let nbOfJobs = parseInt(extractNumber(await driver.executeScript(`
            let nbOfJobs = document.querySelectorAll('.jobs-search-results-list__subtitle > span ')[0].textContent;           
            return nbOfJobs;
        `)))
        console.log(`Number of jobs found: ${nbOfJobs}`);



        let resultPage = await scrapePage(driver);
        let resultPageJson = JSON.stringify(resultPage , null , 2);

        let filePath = path.join(__dirname,"results", `${searchTitle}-search`, `${searchTitle}-${0}-to-${24}.json`);
        console.log(`${filePath}`);
        fs.writeFile(filePath, resultPageJson, 'utf8', (err) => {
            if (err) {
                console.error('An error occurred while writing JSON to file:', err);
            } else {
                console.log('Number of objects in resultPage:', resultPage.length);
                console.log('JSON file has been saved.');
            }
        });


        let pagesNb_;

        if(pagesNb > 0 && pagesNb != undefined && pagesNb != ""){
            
            pagesNb_ = pagesNb
        }else{
            pagesNb_  = nbOfJobs / 25;
        }

        for(let i = 1;  i  < pagesNb_  ; i++){
           
        await loadPage(driver,geoId,i*25);
        let resultPage = await scrapePage(driver);
        let resultPageJson = JSON.stringify(resultPage , null , 2);
        

        let filePath = path.join(__dirname,"results", `${searchTitle}-search`, `${searchTitle}-${i*25}-to-${i*25+24}.json`);

        if(resultPage.length >0){
            fs.writeFile(filePath, resultPageJson, 'utf8', (err) => {
            if (err) {
                console.error('An error occurred while writing JSON to file:', err);
            } else {
                console.log('Number of objects in resultPage:', resultPage.length);
                console.log('JSON file has been saved.');
            }
        });
    }


        }




     } catch (error) {




     }

     pagesNb=0;



});





app.get('/check-creds', (req, res) => {

    try {
        if (fs.existsSync(credsPath)) {
            const data = fs.readFileSync(credsPath, 'utf8');
            const json = JSON.parse(data);
            credentials = json.credentials ;
            res.json({ exists: true, credentials: json.credentials });
        } else {
            res.json({ exists: false });
        }
    } catch (error) {
        console.error('Error checking credentials file:', error);
        res.status(500).send('An error occurred while checking for the credentials file.');
    }

    
});







app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});














const login = async  (driver)=> {


    try {



         await driver.get('https://www.linkedin.com/login');
         console.log("1");

         await  driver.executeScript(`document.getElementById('username').value = '${credentials[0]}';`);
         console.log("2");
 
         await driver.executeScript(`document.getElementById('password').value = '${credentials[1]}';`);
         console.log("3");

        await driver.executeScript(`document.querySelector('form.login__form').submit();`);

    }catch(err){
        console.log("error: "+err);


    } finally {
        //await driver.quit();
        console.log("login ended");
    }


};





const loadPage = async  (driver,geoId,start)=> {


    try {
        await console.log(searchTitle);

        await driver.get(`https://www.linkedin.com/jobs/search/?keywords=${searchTitle}&geoId=${geoId}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true&start=${start}`);



    }catch(err){
        console.log("error: "+err);


    } finally {
        //await driver.quit();
        console.log("finished loading page : "+ start + " to "+(start+24));
    }


};








const scrapePage = async (driver) => {
    const pageResult = async () => {
        let result = [];

        try {
            // Initial scroll to ensure the list is loaded
            await driver.executeScript("let list = document.querySelectorAll('.scaffold-layout__list-container > li');list[list.length - 1].scrollIntoView();");
            await driver.sleep(500);

            let listItems = await driver.findElements(By.css('.scaffold-layout__list-container > li'));

            for (let i = 0; i < listItems.length ; i++) {
                try {
                    var randomDelay = Math.floor(Math.random() * 2000);

                    // Refresh the list of items to avoid stale element references
                    listItems = await driver.findElements(By.css('.scaffold-layout__list-container > li'));

                    // Click the list item
                    await listItems[i].findElement(By.css('div > div')).click();

                    // Scroll to the end of the element if necessary
                        await driver.executeScript("let list = document.querySelectorAll('.scaffold-layout__list-container > li');list[list.length - 1].scrollIntoView();");
                        await driver.sleep(5000); // Sleep to ensure the new items load
                    

                    var obj = {};

                    // Extract job details
                    let jobIdElement = await listItems[i].findElement(By.css('div > div'));
                    obj.jobId = await jobIdElement.getAttribute('data-job-id');

                    let jobTitle = await driver.findElement(By.css('.job-details-jobs-unified-top-card__job-title > h1 > a'));
                    obj.jobTitle = await jobTitle.getText();

                    let companyName = await driver.findElement(By.css('.job-details-jobs-unified-top-card__company-name > a'));
                    obj.companyName = await companyName.getText();

                    let jobLocation = await driver.findElement(By.css('.job-details-jobs-unified-top-card__primary-description-container > div > span'));
                    obj.jobLocation = await jobLocation.getText();

                    let jobDescription = await driver.findElement(By.css('#job-details'));
                    obj.jobDescription = await jobDescription.getText();

                    let jobPostDate = await driver.findElements(By.css('.job-details-jobs-unified-top-card__primary-description-container > div > span'));
                    obj.jobPostDate = await jobPostDate[2].getText();

                    let applicationLink = await driver.findElement(By.css('.jobs-apply-button'));
                    obj.applicationLink = await applicationLink.getText();

                    await driver.executeScript("let x = document.querySelector('.job-details-how-you-match__skills-item-subtitle');x.scrollIntoView();");
                    await driver.sleep(3000); // Sleep to ensure the new items load
                    let skillsNeeded = await driver.findElement(By.css('.job-details-how-you-match__skills-item-subtitle'));
                    obj.skillsNeeded = await skillsNeeded.getText();


                } catch (error) {
                    console.log(`Error extracting job details at index ${i}:`, error);
                }finally{
                    await result.push(obj);
                }

                // Wait before moving to the next list item
                await driver.sleep(2000 + randomDelay);
            }

        } catch (error) {
            console.error('Error occurred while scraping:', error);
        }

        return result;
    }

    return await pageResult();
};







const waitUntilUrlIs = async (driver , desiredUrl) => {

    try {
        console.log(`waiting for this url: ${desiredUrl}`);

        await driver.wait(until.urlIs(desiredUrl), 1000000); 

        console.log(`URL is now: ${desiredUrl}`);

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
      //  await driver.quit();
    }
};













function extractNumber(str) {
    let match = str.match(/[\d,]+/);

    return match ? parseInt(match[0].replace(/,/g, ''), 10) : null;
}




const checkCreds = async ()=>{
    try {
        const dirPath = path.join(__dirname, 'credentials');
        fs.mkdirSync(dirPath, { recursive: true });


        if (fs.existsSync(credsPath)) {
            const data = fs.readFileSync(credsPath, 'utf8');
            const json = JSON.parse(data);
            credentials = json.credentials ;
        } else {
            throw "Directry doesn't exist."
        }

    } catch (error) {
        console.error('Error checking credentials file:', error);
    }


}



const makeResultDir = async (searchTitle)=>{
    try {
        const dirPath = path.join(__dirname,"results" ,`${searchTitle}-search`);


        if (!fs.existsSync(dirPath)) {

        fs.mkdirSync(dirPath, { recursive: true });
        console.log( "Result Directry created.");

        } else {
            console.log( "Result Directry exists already.");
        }

    } catch (error) {
        console.error('Error creating result directory file:', error);
    }


}



checkCreds();


/*
document.querySelectorAll('.artdeco-pagination__pages.artdeco-pagination__pages--number > li > button')[1].click()


            let pages = document.querySelectorAll('.artdeco-pagination__indicator.artdeco-pagination__indicator--number ember-view ');  

            let jobs = document.querySelectorAll('.scaffold-layout__list-container > li'); 

*/