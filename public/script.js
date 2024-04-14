document.addEventListener("DOMContentLoaded", function() {
    const getCrafts = async () => {
        try {
            return (await fetch("/api/crafts")).json();
        } catch (error) {
            console.log(error);
        }
    };

    const showCrafts = async () => {
        let crafts = await getCrafts();
        let galleryContainer = document.getElementById("gallery-container");
        galleryContainer.innerHTML = "";
        crafts.forEach((craft) => {
            const craftCard = document.createElement("section");
            craftCard.classList.add("gallery-item");
            galleryContainer.appendChild(craftCard);

            const craftLink = document.createElement("a");
            craftLink.href = "#";
            craftCard.appendChild(craftLink);

            const craftImage = document.createElement("img");
            craftImage.src = `/${craft.img}`;
            craftImage.onclick = () => {
                console.log("Craft clicked:", craft);
                displayCraftDetails(craft);
            };
            craftLink.appendChild(craftImage);
        });
    };

    const displayCraftDetails = (craft) => {
        openDialog("craft-details");
    
        const dialogDetails = document.getElementById("craft-details");
        dialogDetails.innerHTML = "";

        const h2 = document.createElement("h2");
        h2.textContent = craft.name;
        dialogDetails.appendChild(h2);

        const deleteLink = document.createElement("a");
        deleteLink.innerHTML = "&#9249";
        dialogDetails.append(deleteLink);
        deleteLink.id = "delete-link";

        const editLink = document.createElement("a");
        editLink.innerHTML = "&#9998";
        dialogDetails.append(editLink);
        editLink.id = "edit-link";

        const p = document.createElement("p");
        dialogDetails.appendChild(p);
        p.innerHTML = craft.description;
        

        const img = document.createElement("img");
        img.src = `/${craft.img}`;
        img.alt = craft.name;
        img.style.maxWidth = "350px";
        img.style.maxHeight = "300px";
        img.style.width = "auto";
        img.style.height = "auto";
        dialogDetails.appendChild(img);

        const suppliesList = document.createElement("ul");
        craft.supplies.forEach((supply) => {
            const li = document.createElement("li");
            li.textContent = supply;
            suppliesList.appendChild(li);
        });
        dialogDetails.appendChild(suppliesList);

        editLink.onclick = showCraftForm;
        deleteLink.onclick = deleteCraft.bind(this, craft);

        populateEditForm(craft);
    };

    const populateEditForm = (craft) => {
        if(craft){
        console.log("populating edit form");
        const form = document.getElementById("add-craft-form");
        form._id.value = craft._id;
        form.name.value = craft.name;
        form.description.value = craft.description;
        document.getElementById("img-prev").src = `/${craft.img}`;
        populateSupplies(craft.supplies);
        } else {
            console.log("craft is undefined");
        }
    };

    const populateSupplies = (supplies) => {
        console.log("populating supplies");
        const section = document.getElementById("supply-boxes");
        supplies.forEach((supply) => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = supply;
            section.append(input);
        });
    };

    const addEditCraft = async (e) => {
        e.preventDefault();
        const form = document.getElementById("add-craft-form");
        const formData = new FormData(form);
        let response;
        formData.append("supplies", getSupplies());

        console.log(...formData);

        if(form._id.value.trim() == "") {
            console.log("inside the POST");
            response = await fetch ("/api/crafts" , {
                method : "POST",
                body : formData,
            });
        } else {
            response = await fetch (`/api/crafts/${form._id.value}`, {
                method : "PUT",
                body : formData,
            });
        }

        if(response.status != 200) {
            console.log("error adding or editing data");
        }

        await response.json();
        resetForm();
        document.getElementById("dialog").style.display = "none";
        showCrafts();
    };
    
    const deleteCraft = async(craft) => {
        let response = await fetch(`/api/crafts/${craft._id}`, {
            method:"DELETE",
            headers:{
                "Content-Type":"application/json;charset=utf-8"
            }
        });

        if(response.status != 200) {
            console.log("Error Deleting");
            return;
        }

        let result = await response.json();
        resetForm();
        showCrafts();
        document.getElementById("dialog").style.display = "none";
    };

    const getSupplies = () => {
        const inputs = document.querySelectorAll("#supply-boxes input");
        const supplies = [];

        inputs.forEach((input) => {
            supplies.push(input.value);
        });
        return supplies;
    };

    const resetForm = () => {
        const form = document.getElementById("add-craft-form");
        form.reset();
        form._id.value = "";
        document.getElementById("supply-boxes").innerHTML = "";
        document.getElementById("img-prev").src = "";
    };

    const showCraftForm = (e) => {
        console.log("in show craft form");
        openDialog("add-craft-form");
        console.log(e.target);
        if (e.target.getAttribute("id") != "edit-link") {
            resetForm();
        }
    };

    const addSupply = (e) => {
        e.preventDefault();
        const section = document.getElementById("supply-boxes");
        const input = document.createElement("input");
        input.type = "text";
        section.append(input);
    };

    const openDialog = (id) => {
        document.getElementById("dialog").style.display = "block";
        document.querySelectorAll("#dialog-details > *").forEach((section) => {
            section.classList.add("hidden");
        });
        document.getElementById(id).classList.remove("hidden");
    };

    const cancelForm = () => {
        resetForm();
        document.getElementById("dialog").style.display = "none";
        showCrafts();
    }

    showCrafts();
    document.getElementById("add-craft-form").onsubmit = addEditCraft;
    document.getElementById("add-link").onclick = showCraftForm;
    document.getElementById("add-supply").onclick = addSupply;
    document.getElementById("cancel-button").onclick = cancelForm;

    document.getElementById("img").onchange = (e) => {
        if (!e.target.files.length) {
            document.getElementById("img-prev").src = "";
            return;
        }
        document.getElementById("img-prev").src = URL.createObjectURL(
            e.target.files.item(0)
        );
    };
});