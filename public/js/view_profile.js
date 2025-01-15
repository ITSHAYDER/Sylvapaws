document.addEventListener("DOMContentLoaded", function() {
    let user = document.querySelector(".username");
    let bio = document.querySelector(".bio-text");
    let image = document.querySelector(".profile-image");
    let badges = document.querySelector(".badges");
    let bootstrapPostRow = document.querySelector(".row");

    // Function to get the user ID from the URL
    function getUserIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Fetch the user info using the ID from the URL
    async function fetchUserInfo(id) {
        try {
            let response = await fetch(`http://127.0.0.1:5000/api/profile/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            });

            let data = await response.json();

            if (response.ok) {
                // Update the profile with user info
                updateProfile(data);
                // Display posts
                displayPosts(data.posts);
            } else {
                console.error('Error fetching user info:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Function to update the profile on the page
    function updateProfile(data) {
        user.textContent = data.username || "Unknown User";
        bio.textContent = data.bio || "No Bio yet";
        image.src = data.profile_image || "https://imgv3.fotor.com/images/blog-richtext-image/10-profile-picture-ideas-to-make-you-stand-out.jpg";
        
        // Clear existing badges
        badges.innerHTML = "";

        // Display tags/badges
        if (data.tags) {
            data.tags.forEach(tag => createBadge(tag));
        }
    }

    // Function to create a badge and append it to the badge section
    function createBadge(badge) {
        let badgeSpan = document.createElement("span");
        badgeSpan.className = "badge-text";
        badgeSpan.textContent = badge;
        badges.appendChild(badgeSpan);
    }

    // Function to display posts on the page
    function displayPosts(posts) {
        // Clear any existing posts
        bootstrapPostRow.innerHTML = "";

        posts.forEach(post => {
            createPost(post.animal_name, post.description, post.date);
        });
    }

    // Function to create a single post and append it to the page
    function createPost(title, text, date) {
        let btsPost = document.createElement("div");
        btsPost.className = "col-md-4 mb-4";

        let postCard = document.createElement("div");
        postCard.className = "post card";
        btsPost.appendChild(postCard);

        let cardBody = document.createElement("div");
        cardBody.className = "card-body";
        postCard.appendChild(cardBody);

        let cardTitle = document.createElement("h5");
        cardTitle.textContent = title;
        cardTitle.className = "card-title";
        cardBody.appendChild(cardTitle);

        let cardText = document.createElement("p");
        cardText.className = "card-text";
        cardText.textContent = text;
        cardBody.appendChild(cardText);

        let dataSmallText = document.createElement("small");
        dataSmallText.textContent = "posted on " + date;
        dataSmallText.className = "text-muted";
        let dateHolder = document.createElement("p");
        dateHolder.appendChild(dataSmallText);
        cardBody.appendChild(dateHolder);
        
        bootstrapPostRow.appendChild(btsPost);
    }

    // Main function
    function main() {
        const userId = getUserIdFromUrl(); // Extract ID from URL
        if (userId) {
            fetchUserInfo(userId); // Fetch user data based on the ID
        } else {
            console.error('No user ID found in the URL');
        }
    }

    main();
});
