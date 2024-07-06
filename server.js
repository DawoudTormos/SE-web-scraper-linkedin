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

let credentials;
const credsPath = path.join(__dirname, 'credentials', 'credentials.json');

let options = new chrome.Options();
options.addArguments(`--user-agent=${userAgent}`);
options.addArguments('--disable-webrtc');  // To avoid STUN errors
options.addArguments('--log-level=3'); 


let searchTitle,geoId;




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

    let driver =  await new Builder().forBrowser('chrome').setChromeOptions(options).build();

      searchTitle = req.body.searchTitle;
      geoId =   req.body.geoId;
      console.log(req.body)

      res.send('Request Reached node server. Selenium should have started');


     try {
        await login(driver);

        await waitUntilUrlIs(driver , "https://www.linkedin.com/feed/");
        await startScraping(driver);

        let nbOfJobs = await driver.executeScript(`
            let nbOfJobs = document.querySelectorAll('.jobs-search-results-list__subtitle > span ')[0].textContent;           
            return nbOfJobs;
        `);
        console.log(`Number of jobs found: ${extractNumber(nbOfJobs)}`);


        await scrapePage(driver);



     } catch (error) {




     }



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





const startScraping = async  (driver)=> {


    try {
        await console.log(searchTitle);

        await driver.get(`https://www.linkedin.com/jobs/search/?keywords=${searchTitle}&geoId=&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON&refresh=true`);



    }catch(err){
        console.log("error: "+err);


    } finally {
        //await driver.quit();
        console.log("loading search ended");
    }


};








const scrapePage = async (driver) => {

    try {



        let res = async()=>{



            let result = [];

            try {
                
        
                let listItems = await driver.findElements(By.css('.scaffold-layout__list-container > li'));
                await driver.sleep(2000);
                await driver.executeScript("let list = document.querySelectorAll('.scaffold-layout__list-container > li');list[24].scrollIntoView();");

                for (let i = 0; i < listItems.length; i++) {
                    let randomDelay = Math.floor(Math.random() * 1200);
        
                    
                    await listItems[i].findElement(By.css('div > div')).click();
        
                    // Scroll to the end of the element
                    if(i<2){await driver.executeScript("let list = document.querySelectorAll('.scaffold-layout__list-container > li');list[24].scrollIntoView();");}

                    //wait page to load
                     await driver.sleep(2000);

        
                    let obj = {};


                    
            
        
                    try {

                        let jobId = await listItems[i].findElement(By.css('div > div')).getAttribute('data-job-id'); 
                        obj.jobId = jobId;

                       
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

                        let skillsNeeded = await driver.findElement(By.css('.job-details-how-you-match__skills-item-subtitle '));
                        obj.skillsNeeded = await skillsNeeded.getText();


                        let applicationLink = await driver.findElement(By.css('.jobs-apply-button'));
                        obj.applicationLink = await applicationLink.getText();
                        
                    } catch (error) {
                        console.log(error);
                    } finally {
                        result.push(obj);
                    }
        
                    // Wait before moving to the next list item
                     await driver.sleep(1200 + randomDelay);
                }
        
            } catch (error) {
                console.error('Error occurred:', error);
            } finally {
                console.log(result);
                // driver.quit();
            }
        
            return result;
        }

        console.log("x value: " + res())




    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
       // await driver.quit();
       console.log("x value: " + res())

    }





    try{



    }catch(error){

        console.error('Error occurred:', error);

    }



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

checkCreds();


/*
document.querySelectorAll('.artdeco-pagination__pages.artdeco-pagination__pages--number > li > button')[1].click()


            let pages = document.querySelectorAll('.artdeco-pagination__indicator.artdeco-pagination__indicator--number ember-view ');  

            let jobs = document.querySelectorAll('.scaffold-layout__list-container > li'); 

*/