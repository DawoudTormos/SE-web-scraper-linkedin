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




            // I had to do the below code as I need to deal with how timeout is asynchrous and await/async didn't help
        /*let x = await driver.executeScript(`

                let list = document.querySelectorAll('.scaffold-layout__list-container > li')
                let result=[];
                


                let i = 0;

                function myLoop() {

                    let ran = Math.floor(Math.random() * 1200) //a randomized margin

                    setTimeout(function() {

                        list[i].children[0].children[0].click()
                        let obj = {};


                        setTimeout(function() {
                        try{obj.Title = document.querySelector(".job-details-jobs-unified-top-card__job-title > h1 > a").textContent;
                            }catch(error){
                            console.log(error)
                            }finally{
                            result.push(obj)
                            }
                            
                            },1200)
                        
        
                        
                        
                        i++;
                        if (i < list.length) {           
                          myLoop();            
                        }else{
                            afterLoop();
                        }

                    }, 4000 + ran)

                }

                myLoop();
                
                function afterLoop() {

                return result;
                }


                
                
                
            
        `);

        console.log("x value: " + x)*/

        


export {s1}
 