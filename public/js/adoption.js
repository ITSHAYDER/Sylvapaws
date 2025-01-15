document.addEventListener("DOMContentLoaded", function() {
    // Define the base URL for the API
    const BASE_URL = "http://127.0.0.1:5000";
    const currentPath = window.location.pathname;
    let img = document.getElementsByClassName("profile-image")[0]
    let imgbase64 = localStorage.getItem("img")
    img.src = `data:image/png;base64,${imgbase64}`


    class Post {
        constructor(aname, description, imageBase64, id) {
            this.aname = aname;
            this.description = description;
            this.imageBase64 = imageBase64;
            this.id = id;
            this.element = this.createPostElement();
        }
    
        createPostElement() {
            const post = document.createElement("div");
            post.className = "post";
            post.id = `post-${this.id}`;  // Add unique ID for each post
            
            const name = document.createElement("h3");
            name.textContent = this.aname;
            name.className = "name";
            
            const image = document.createElement("img");
            image.src = `data:image/png;base64,${this.imageBase64}`;
            image.className = "card-image";
            
            const desc = document.createElement("p");
            desc.textContent = this.description;
            desc.className = "description";
            
            post.appendChild(image);
            post.appendChild(name);
            post.appendChild(desc);
            
            post.style.cursor = 'pointer';
            post.addEventListener('click', () => {
                window.location.href = `/public/pages/post.html?id=${this.id}`;
            });
    
            return post;
        }
    
        render(container, prepend = false) {
            if (prepend) {
                container.prepend(this.element);
            } else {
                container.appendChild(this.element);
            }
        }
    
        static createPosts(postsData, container, prepend = false) {
            return postsData.map(post => {
                const newPost = new Post(
                    post.animal_name,
                    post.description,
                    post.image_base64,
                    post.post_id
                );
                newPost.render(container, prepend);
                return newPost;
            });
        }
    }

    // Track the last post ID we've seen
    let lastSeenPostId = 0;

    // Cookie management functions
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    }

    // Token management and validation
    const tokenfromcookies = getCookie("token");
    const id = getCookie("id");

    if (tokenfromcookies) {
        localStorage.setItem("token", tokenfromcookies);
        localStorage.setItem("id", id);
        deleteCookie("token");
    }

    const token = localStorage.getItem('token');
    validateToken(token);

    // Modified periodic token validation
    setInterval(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${BASE_URL}/api/verify_token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ token: token })
            })
            .then(response => {
                if (!response.ok) {
                    localStorage.removeItem("token");
                    window.location.href = '/public/pages/login.html';
                }
                // If token is valid, do nothing and stay on current page
            })
            .catch(error => {
                console.error("Token validation error:", error);
            });
        }
    }, 60000);

    function validateToken(token) {
        fetch(`${BASE_URL}/api/verify_token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ token: token })
        })
        .then(response => {
            if (!response.ok) {
                localStorage.removeItem("token");
                redirect(null);
            } else {
                redirect(token);
            }
        })
        .catch(error => {
            console.error("Token validation error:", error);
        });
    }

    function redirect(token) {
        if (!token && currentPath !== "/public/pages/login.html") {
            window.location.href = '/public/pages/login.html';
        } else if (token && currentPath === "/public/pages/adoption.html") {
            get_posts();
        } else if (token && currentPath !== "/public/pages/adoption.html") {
            window.location.href = '/public/pages/adoption.html';
        }
    }

    function updateLastSeenPostId(posts) {
        posts.forEach(post => {
            lastSeenPostId = Math.max(lastSeenPostId, post.post_id);
        });
    }

    function get_posts(country) {
        const postsContainer = document.querySelector(".posts");
        
        // Only clear container on initial load or filter change
        if (country !== undefined) {
            postsContainer.innerHTML = "";
            lastSeenPostId = 0;
        }

        fetch(`${BASE_URL}/api/get_posts`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                country: country,
                last_seen_id: lastSeenPostId 
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("There is a problem with the request");
            }
            return response.json();
        })
        .then(data => {
            if (data.posts.length > 0) {
                // If this is not the initial load, only prepend new posts
                const shouldPrepend = lastSeenPostId > 0;
                Post.createPosts(data.posts, postsContainer, shouldPrepend);
                updateLastSeenPostId(data.posts);
            }
        })
        .catch(error => {
            console.error("Error fetching posts:", error);
        });
    }

    function addPost(animalName, description, imageFile, token, country, tags, contactInfo, medical, exactPlace, animaltype) {
        const formData = new FormData();
        formData.append('animal_name', animalName);
        formData.append('description', description);
        formData.append('user_id', localStorage.getItem("id"));
        formData.append("file", imageFile);
        formData.append("country", country);
        formData.append("tags", tags);
        formData.append("contactInfo", contactInfo);
        formData.append("medical", medical);
        formData.append("exact-place", exactPlace);
        formData.append("animal_type", animaltype);

        return fetch(`${BASE_URL}/api/addpost`, {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.text().then(text => {
                    throw new Error("Error adding post: " + text);
                });
            }
        })
        .then(data => {
            const postsContainer = document.querySelector(".posts");
            const newPost = new Post(
                data.post.animal_name,
                data.post.description,
                data.post.image_base64,
                data.post.post_id
            );
            newPost.render(postsContainer, true);  // Prepend new post
            lastSeenPostId = Math.max(lastSeenPostId, data.post.post_id);
        })
        .catch(error => {
            alert(error.message);
        });
    }

    // Event Listeners
    let postBtn = document.querySelector("#step2-form");
    if (postBtn) {
        postBtn.addEventListener("submit", function(e) {
            e.preventDefault();

            let aniName = document.querySelector("#post-title").value;
            let aniDescription = document.querySelector("#post-description").value;
            let imgFile = document.querySelector("#post-image").files[0];
            let country = document.querySelector("#country-info").value;
            let tagnames = document.querySelector("#post-tags").value;
            let contact = document.querySelector("#contact-info").value;
            let medical = document.querySelector("#animal-sickness").value;
            let exactPlace = document.querySelector("#exact-place").value;
            let animaltype = document.querySelector("#animal-type").value;

            if (!aniName || !aniDescription || !imgFile) {
                alert("Please fill out all the fields and select an image.");
                return;
            }

            const addPostStep2Modal = bootstrap.Modal.getInstance(document.getElementById('addPostStep2Modal'));
            addPostStep2Modal.hide();

            // Send the post data to the server
            addPost(aniName, aniDescription, imgFile, token, country, tagnames, contact, medical, exactPlace, animaltype);

            // Reset form fields
            document.querySelector("#step1-form").reset();
            document.querySelector("#step2-form").reset();
        });
    }

    // Profile image click handler
    let profileImages = document.querySelectorAll(".profile");
    profileImages.forEach(element => {
        element.addEventListener("click", function(e) {
            e.preventDefault();
            window.location.href = "profile.html";
        });
    });

    // Modal navigation handlers
    const nextToStep2Btn = document.getElementById('next-to-step2');
    if (nextToStep2Btn) {
        nextToStep2Btn.addEventListener('click', function() {
            const addPostModal = bootstrap.Modal.getInstance(document.getElementById('addPostModal'));
            addPostModal.hide();

            const addPostStep2Modal = new bootstrap.Modal(document.getElementById('addPostStep2Modal'));
            addPostStep2Modal.show();
        });
    }

    const backToStep1Btn = document.getElementById('back-to-step1');
    if (backToStep1Btn) {
        backToStep1Btn.addEventListener('click', function() {
            const addPostStep2Modal = bootstrap.Modal.getInstance(document.getElementById('addPostStep2Modal'));
            addPostStep2Modal.hide();

            const addPostModal = new bootstrap.Modal(document.getElementById('addPostModal'));
            addPostModal.show();
        });
    }

    const searchBox = document.querySelector("#search-box");
    if (searchBox) {
        searchBox.addEventListener("input", function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const posts = document.querySelectorAll(".post");
            
            posts.forEach(post => {
                const name = post.querySelector(".name").textContent.toLowerCase();
                const description = post.querySelector(".description").textContent.toLowerCase();
                
                if (name.includes(searchTerm) || description.includes(searchTerm)) {
                    post.style.display = "block";
                } else {
                    post.style.display = "none";
                }
            });
        });
    }

    // Filter dropdown functionality
    const filterItems = document.querySelectorAll(".dropdown-item");
    filterItems.forEach(item => {
        item.addEventListener("click", function(e) {
            e.preventDefault();
            const filterType = this.textContent.toLowerCase();
            get_posts(filterType);
        });
    });

    // Start periodic polling for new posts
    setInterval(() => {
        if (currentPath === "/public/pages/adoption.html") {
            get_posts();
        }
    }, 5000);  // Poll every 5 seconds


    
});