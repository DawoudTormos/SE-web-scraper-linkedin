A linkedin Scarper for jobs that saves to json files.

Notes:
 - I dealt with signing in with a simple GUI. The app is a node.js express.js server.
 - Scraping is done with selenium library and its chrome driver.
 - I am editing user agent to that of chrome on windows to hide the user agent of selenium.
 - I am randomizing the time between clicks for any software to help not to detect bot movement.
 - still a user needs to do captchaa and security checks when needed. The software waits you to do that before it continues.


Steps:
 - clone repo
 - have node and npm on your machine
 - CLI: npm install
 - CLI: node server.js to run the server
 - open localhost:888 on your browser.
   
