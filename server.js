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


let searchTitle;




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

      res.send('Request Reached node server. Selenium should have started');


     try {
        await login(driver);

        await waitUntilUrlIs(driver , "https://www.linkedin.com/feed/");

        await startScraping(driver);

        await getInfo(driver);



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

        await driver.get(`https://www.linkedin.com/jobs/search/?keywords=${searchTitle}&origin=JOB_SEARCH_PAGE_SEARCH_BUTTON`);



    }catch(err){
        console.log("error: "+err);


    } finally {
        //await driver.quit();
        console.log("loading search ended");
    }


};





const getInfo = async (driver) => {

    try {

        let nbOfJobs = await driver.executeScript(`
            let pagesArray = [];
            let nbOfJobs = document.querySelectorAll('.jobs-search-results-list__subtitle > span ');            
        

            return nbOfJobs;
        `);

        console.log(`Number of pages found: ${nbOfProducts}`);

        // Fetch children of each page into a 2D array
       /* let childrenArray = [];
        for (let page of pages) {
            let children = await driver.executeScript(`
                let childrenArray = [];
                let children = arguments[0].querySelectorAll('.classChildren');
                for (let child of children) {
                    childrenArray.push(child);
                }
                return childrenArray;
            `, page);

            childrenArray.push(children);
        }

        console.log('Children of each page:');
        console.log(childrenArray);*/

    } catch (error) {
        console.error('Error occurred:', error);
    } finally {
       // await driver.quit();
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
    // Use a regular expression to find the first occurrence of a sequence of digits
    let match = str.match(/\d+/);

    // Return the number as an integer, or null if no match is found
    return match ? parseInt(match[0], 10) : null;
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