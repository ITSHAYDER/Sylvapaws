document.addEventListener("DOMContentLoaded", function(e) {
    const BASE_URL = "http://127.0.0.1:5000"; // Change to your Ngrok URL later
    let user = document.querySelector(".username");
    let bio = document.querySelector(".bio-text");
    let image = document.querySelector(".profile-image"); 
    let badges = document.querySelector(".badges");
    let bootstrapPostRow = document.querySelector(".row");
    let pro_image = document.querySelector("#profile-image");

    async function fetchUserInfo() {
        try {
            let response = await fetch(`${BASE_URL}/api/profile/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'ngrok-skip-browser-warning': '1'
                }
            });

            let data = await response.json();
            if (response.ok) {
                updateProfile(data);
                displayPosts(data.posts);
            } else {
                console.error('Error fetching user info:', data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function updateProfile(data) {
        user.textContent = data.username;
        bio.textContent = data.bio || "No Bio yet";
        image.src = `data:image/png;base64,${data.image}`;
        pro_image.src =  `data:image/png;base64,${data.image}`;
        localStorage.setItem("img",data.image)
        

        if (data.tags) {
            badges.innerHTML = ""; 
            data.tags.forEach(tag => createBadge(tag));
        }
    }

    function createBadge(badge) {
        let badgeSpan = document.createElement("span");
        badgeSpan.className = "badge-text";
        badgeSpan.textContent = badge;
        badges.appendChild(badgeSpan);
    }

    function displayPosts(posts) {
        posts.forEach(post => {
            createPost(post.animal_name, post.description, post.date, post.post_id);
        });
    }

    function createPost(title, text, date, postId) {
        let btsPost = document.createElement("div");
        btsPost.className = "col-md-4 mb-4";

        let postCard = document.createElement("div");
        postCard.className = "post card";
        postCard.id = postId;
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

        let dateHolder = document.createElement("p");
        let dataSmallText = document.createElement("small");
        dataSmallText.textContent = "posted on " + date;
        dataSmallText.className = "text-muted";
        dateHolder.appendChild(dataSmallText);
        cardBody.appendChild(dateHolder);

        let editBtn = document.createElement("button");
        editBtn.className = "btn btn-primary me-2";
        editBtn.textContent = "Edit";
        cardBody.appendChild(editBtn);

        let deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("data-post-id", postId); 
        cardBody.appendChild(deleteBtn);

        bootstrapPostRow.appendChild(btsPost);

        editBtn.addEventListener("click", e => {
            const editpostmodel = new bootstrap.Modal(document.getElementById("editPostModal"));
            editpostmodel.show();
        });

        deleteBtn.addEventListener("click", (e) => {
            let postId = e.target.getAttribute("data-post-id"); 
            const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
            deleteModal.show();

            const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
            confirmDeleteBtn.onclick = async function() {
                try {
                    let response = await fetch(`${BASE_URL}/api/delete`, {
                        method: "DELETE",
                        headers: {
                            'Content-Type': 'application/json', 
                            'Authorization': 'Bearer ' + localStorage.getItem('token')
                        },
                        body: JSON.stringify({ post_id: postId })  
                    });

                    if (response.ok) {
                        alert("Post deleted successfully");
                        deleteModal.hide();
                        btsPost.remove();
                    } else {
                        let data = await response.json();
                        console.error("Error deleting post:", data);
                        alert("Error: " + data.message);
                    }
                } catch (error) {
                    console.error("Error:", error);
                    alert("Error: " + error);
                }
            };
        });
    }

    async function main() {
        await fetchUserInfo();
    }

    main();

    let submitBtn = document.querySelector("#submit-btn");
    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        let editedName = document.querySelector("#username").value;
        let editedBio = document.querySelector("#bio").value;
        let token = localStorage.getItem("token");
        let pro_image = document.querySelector("#profileImage").files[0];

        if (!editedName && !editedBio && !pro_image) {
            alert("There is nothing to be updated");
            return;
        }

        let formData = new FormData();
        formData.append('username', editedName);
        formData.append('bio', editedBio);
        if (pro_image) {
            formData.append('file', pro_image); 
        }

        try {
            let response = await fetch(`${BASE_URL}/api/update_profile`, {
                method: "POST",
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                body: formData
            });

            let data = await response.json();
            if (response.ok) {
                alert("Profile updated successfully");
                updateProfile(data);
            } else {
                console.error('Error updating profile:', data);
                alert("Error updating profile: " + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert("Error: " + error);
        }
    });
});
