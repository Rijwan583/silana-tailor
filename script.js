// ========================================
// SILANA TAILOR
// ========================================

// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL = "https://yilabtpkpbbfpmutwnuy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_21v6WZAxDRwg5oEcXfUQAA_jPWQXU_i";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ========================================
// MOBILE MENU
// ========================================

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    document.querySelectorAll(".nav-links a").forEach(link => {

        link.addEventListener("click", () => {
            navLinks.classList.remove("show");
        });

    });
}


// ========================================
// PRODUCT GALLERY
// ========================================

const gallery = {

    shirt: {
        title: "Shirt Collection",
        image: "images/shirt.jpg"
    },

    trouser: {
        title: "Trouser Collection",
        image: "images/trouser.jpg"
    },

    suit: {
        title: "Suit Collection",
        image: "images/suit.jpg"
    },

    kurta: {
        title: "Kurta Collection",
        image: "images/kurta.jpg"
    },

    sherwani: {
        title: "Sherwani Collection",
        image: "images/sherwani.jpg"
    }

};


// ========================================
// ADMIN LOGIN
// ========================================

async function adminLogin() {

    const email = prompt("Enter admin email:");

    if (!email) {
        return false;
    }

    const password = prompt("Enter admin password:");

    if (!password) {
        return false;
    }

    const { error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {

        alert(
            "Login failed.\n\n" +
            error.message
        );

        return false;
    }

    alert("Admin login successful!");

    return true;
}


// ========================================
// CHECK ADMIN LOGIN
// ========================================

async function checkAdminLogin() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return !!user;
}


// ========================================
// LOAD PHOTOS FROM SUPABASE
// ========================================

async function loadSupabasePhotos(type, grid) {

    const {
        data,
        error
    } = await supabaseClient.storage
        .from("products")
        .list(type, {
            limit: 100,
            sortBy: {
                column: "created_at",
                order: "desc"
            }
        });

    if (error) {

        console.log(
            "Supabase photo loading error:",
            error
        );

        return;
    }

    if (!data || data.length === 0) {
        return;
    }


    data.forEach(file => {

        // Ignore folders
        if (!file.name) {
            return;
        }


        const filePath =
            `${type}/${file.name}`;


        const {
            data: publicData
        } =
            supabaseClient.storage
                .from("products")
                .getPublicUrl(filePath);


        if (!publicData || !publicData.publicUrl) {
            return;
        }


        const img =
            document.createElement("img");


        img.src =
            publicData.publicUrl;


        img.style.cssText = `
            width:100%;
            height:300px;
            object-fit:cover;
            border-radius:8px;
        `;


        img.loading = "lazy";


        grid.appendChild(img);

    });

}


// ========================================
// UPLOAD PHOTOS
// ========================================

async function uploadPhotos(type, files, grid) {

    if (!files || files.length === 0) {
        return;
    }


    // Check login
    let loggedIn =
        await checkAdminLogin();


    // If not logged in → login
    if (!loggedIn) {

        loggedIn =
            await adminLogin();

        if (!loggedIn) {
            return;
        }
    }


    let uploadedCount = 0;


    for (const file of files) {

        try {

            // Safe filename
            const safeName =
                file.name.replace(
                    /[^\w.-]/g,
                    "_"
                );


            // Unique filename
            const uniqueName =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2, 8)}-${safeName}`;


            // Category folder
            const filePath =
                `${type}/${uniqueName}`;


            const {
                error
            } = await supabaseClient.storage
                .from("products")
                .upload(
                    filePath,
                    file,
                    {
                        contentType: file.type,
                        cacheControl: "3600",
                        upsert: false
                    }
                );


            if (error) {

                console.error(
                    "Upload error:",
                    error
                );

                alert(
                    `Failed to upload ${file.name}\n\n${error.message}`
                );

                continue;
            }


            uploadedCount++;


        } catch (err) {

            console.error(err);

        }

    }


    // Refresh gallery
    if (uploadedCount > 0) {

        alert(
            `${uploadedCount} photo(s) uploaded successfully!`
        );


        // Remove old dynamically loaded photos
        grid
            .querySelectorAll(
                ".supabase-photo"
            )
            .forEach(img => img.remove());


        // Reload everything
        await reloadGalleryPhotos(
            type,
            grid
        );

    }

}


// ========================================
// RELOAD SUPABASE PHOTOS
// ========================================

async function reloadGalleryPhotos(type, grid) {

    const {
        data,
        error
    } = await supabaseClient.storage
        .from("products")
        .list(type, {
            limit: 100,
            sortBy: {
                column: "created_at",
                order: "desc"
            }
        });


    if (error) {

        console.log(error);

        return;
    }


    if (!data) {
        return;
    }


    data.forEach(file => {

        if (!file.name) {
            return;
        }


        const filePath =
            `${type}/${file.name}`;


        const {
            data: publicData
        } =
            supabaseClient.storage
                .from("products")
                .getPublicUrl(filePath);


        if (!publicData?.publicUrl) {
            return;
        }


        const img =
            document.createElement("img");


        img.src =
            publicData.publicUrl;


        img.className =
            "supabase-photo";


        img.style.cssText = `
            width:100%;
            height:300px;
            object-fit:cover;
            border-radius:8px;
        `;


        img.loading = "lazy";


        grid.appendChild(img);

    });

}


// ========================================
// OPEN GALLERY
// ========================================

async function openGallery(type) {

    const item = gallery[type];

    if (!item) {
        return;
    }


    const popup =
        document.createElement("div");


    popup.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.92);
        z-index:99999;
        overflow-y:auto;
        padding:30px 15px;
    `;


    popup.innerHTML = `

        <div style="
            max-width:1000px;
            margin:auto;
            background:#111;
            border:1px solid #c9a86a;
            padding:25px;
            border-radius:12px;
        ">

            <button id="closeGallery" style="
                float:right;
                background:none;
                border:none;
                color:#c9a86a;
                font-size:35px;
                cursor:pointer;
            ">×</button>


            <h2 style="
                color:#c9a86a;
                text-align:center;
                margin-bottom:25px;
            ">
                ${item.title}
            </h2>


            <div id="photoGrid" style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(220px,1fr));
                gap:18px;
            ">

                <img
                    src="${item.image}"
                    style="
                        width:100%;
                        height:300px;
                        object-fit:cover;
                        border-radius:8px;
                    "
                >

            </div>


            <div style="
                text-align:center;
                margin-top:25px;
            ">

                <label style="
                    display:inline-block;
                    background:#c9a86a;
                    color:#111;
                    padding:14px 24px;
                    border-radius:6px;
                    font-weight:bold;
                    cursor:pointer;
                ">

                    + Add More Photo

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        id="addPhotos"
                        style="display:none;"
                    >

                </label>


                <p style="
                    color:#aaa;
                    margin-top:12px;
                    font-size:13px;
                ">
                    Owner login required to add photos.
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(popup);


    // ========================================
    // CLOSE GALLERY
    // ========================================

    document
        .getElementById("closeGallery")
        .addEventListener(
            "click",
            () => popup.remove()
        );


    // ========================================
    // LOAD SUPABASE PHOTOS
    // ========================================

    const grid =
        document.getElementById(
            "photoGrid"
        );


    await loadSupabasePhotos(
        type,
        grid
    );


    // ========================================
    // ADD MORE PHOTOS
    // ========================================

    document
        .getElementById("addPhotos")
        .addEventListener(
            "change",
            async function () {

                await uploadPhotos(
                    type,
                    this.files,
                    grid
                );

                // Clear input
                this.value = "";

            }
        );

}


// ========================================
// DETECT PRODUCT CARDS
// ========================================

document
    .querySelectorAll(
        ".product-card, .collection-card"
    )
    .forEach(card => {

        const text =
            card.innerText.toLowerCase();


        let type = null;


        if (text.includes("shirt")) {

            type = "shirt";

        }

        else if (
            text.includes("trouser") ||
            text.includes("pants")
        ) {

            type = "trouser";

        }

        else if (
            text.includes("sherwani")
        ) {

            type = "sherwani";

        }

        else if (
            text.includes("kurta")
        ) {

            type = "kurta";

        }

        else if (
            text.includes("suit") ||
            text.includes("wedding")
        ) {

            type = "suit";

        }


        if (type) {

            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                function () {

                    openGallery(type);

                }
            );

        }

    });
