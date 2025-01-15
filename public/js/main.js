document.addEventListener("DOMContentLoaded", function () {
    // Select all card elements by class
    const cardImages = document.querySelectorAll(".card-img-top");
    const cardTitles = document.querySelectorAll(".card-title");
    const cardDescriptions = document.querySelectorAll(".card-text");

    // Fetch data from API
    fetch("http://127.0.0.1:5000/api/main_posts",{
        headers: {
            'ngrok-skip-browser-warning': '1'  // Set this header to skip the warning
        }
    })
        .then(response => response.json())
        .then(data => {
            // Access the posts array from the API response
            const posts = data.posts;  // Correctly access the posts array

            // Iterate over the posts and update the cards
            posts.forEach((post, index) => {
                if (index < 3) { // Ensure we only handle up to 3 cards
                    cardImages[index].src = `data:image/png;base64,${post.image_url}`; // Correctly access the image_url
                    cardTitles[index].textContent = post.title;
                    cardDescriptions[index].textContent = post.description;
                }
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});
