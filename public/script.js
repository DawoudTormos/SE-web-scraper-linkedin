

document.getElementById('scrape-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Stop submitting like usual
    const scrapeInput = document.getElementById('scrape-input').value;
    const geoId = document.getElementById('geo-input').value;
        

    fetch('/scrape', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ searchTitle : scrapeInput ,geoId})
    })
    .then(response => response.text())
    .then(data => {
    })
    .catch(error => {});

  
});



document.getElementById('creds-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Stop submitting like usual

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('/submit-creds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        const alert =  document.querySelector('#cred-exists  > div')
        const text =  document.querySelector('#cred-exists  > div span') 
        text.innerHTML = "Credentials Added"
        alert.classList.remove('d-none') 

        const alert2 =  document.querySelector('#alert > div') 
        alert2.classList.add('d-none') 

        
        const scrapeBtn =  document.querySelector('#scrape-btn') 
        scrapeBtn.removeAttribute("disabled");

        const inputs =  document.querySelectorAll('#creds-form input ') 
        inputs.forEach((i)=>{
            i.value = ""
        }
    )

    })
    .catch(error => {
        console.error('Error:', error);
        const alert =  document.querySelector('#alert  > div')
        const text =  document.querySelector('#alert > div span') 
        text.innerHTML = 'Error:'+ error
        alert.classList.remove('d-none')             });


});







function checkCredentialsFile() {
    fetch('/check-creds')
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                console.log('Credentials file exists:', data.credentials);

                const alert =  document.querySelector('#cred-exists > div') 
                alert.classList.remove('d-none') 

                const scrapeBtn =  document.querySelector('#scrape-btn') 
                scrapeBtn.removeAttribute("disabled");

            } else {
                console.log('Credentials file does not exist.');

                const text =  document.querySelector('#alert > div span') 
                text.innerHTML = "Credentials not added yet"

                const alert =  document.querySelector('#alert > div') 
                alert.classList.remove('d-none') 

    }
        })
        .catch(error => {
        console.error('Error:', error);
        const alert =  document.querySelector('#alert  > div')
        const text =  document.querySelector('#alert > div span') 
        text.innerHTML = 'Error:'+ error
        alert.classList.remove('d-none') 
        });
}


window.onload = checkCredentialsFile;