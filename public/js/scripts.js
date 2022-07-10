console.log('SCRIPTS LOADED')

if (document.querySelector('#new-event')) {
    document.querySelector('#new-event').addEventListener('submit', (e) => {
        console.log('TESTING NEW')
        e.preventDefault();
        // Use FormData to grab everything now that we have files mixed in with text
        var form = document.getElementById("new-event");
        var event = new FormData(form);
        
        for (const [key, value] of event) {
            console.log(`${key}: ${value}\n`);
        }

        // Assign the multipart/form-data headers to axios does a proper post
        axios.post('/events', event, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(function (response) {
                window.location.replace(`/events/${response.data.event._id}`);

            })
            .catch(function (error) {
                const alert = document.getElementById('alert')
                console.log('ERROR ERROR')
                alert.classList.add('alert-warning');
                alert.textContent = 'Oops, something went wrong saving your event. Please check your information and try again.';
                alert.style.display = 'block';
                setTimeout(() => {
                    alert.style.display = 'none';
                    alert.classList.remove('alert-warning');
                }, 3000)
            });
    });
};