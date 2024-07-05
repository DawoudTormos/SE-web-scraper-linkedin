const SEL = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');


const app = express();
const PORT = 888;



const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.199 Safari/537.36";

let credentials;

let options = new chrome.Options();
options.addArguments(`--user-agent=${userAgent}`);





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

    const dirPath = path.join(__dirname, 'credentials');
    const filePath = path.join(dirPath, './credentials.json');
    const json = { credentials: [...creds] };

     fs.mkdirSync(dirPath, { recursive: true });


     try {

         fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
         res.send('Form submitted successfully!');

     } catch (error) {

         console.error('Error handling the form submission:', error);
         res.status(500).send('An error occurred while processing your request.');

     }


});



app.post('/scrape', (req, res) => {



     try {
        s1();

        res.send('Form submitted successfully!');


     } catch (error) {




     }



});





app.get('/check-creds', (req, res) => {
    const filePath = path.join(__dirname, 'credentials', 'credentials.json');

    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
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














const s1 = async function () {

    let driver =  await new SEL.Builder().forBrowser('chrome').setChromeOptions(options).build();

    try {

         await driver.get('https://www.linkedin.com/login');

         await driver.findElement(By.name('username')).sendKeys(credentials);
         await driver.findElement(By.name('password')).sendKeys('your_password');

         await driver.findElement(By.id('form_id')).submit();

    }catch{


    } finally {

        //await driver.quit();
       
    }


};
