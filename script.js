// ========================================
// SILANA TAILOR
// SUPABASE + PERMANENT PRODUCT GALLERY
// ========================================


// ========================================
// SUPABASE CONFIGURATION
// ========================================

const SUPABASE_URL =
    "https://yilabtpkpbbfpmutwnuy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_21v6WZAxDRwg5oEcXfUQAA_jPWQXU_i";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ========================================
// MOBILE MENU
// ========================================

const menuBtn =
    document.querySelector(".menu-btn");

const navLinks =
    document.querySelector(".nav-links");

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("show");
    });

    document
        .querySelectorAll(".nav-links a")
        .forEach(link => {

            link.addEventListener("click", () => {
                navLinks.classList.remove("show");
            });

        });
}


// ========================================
// PRODUCT GALLERY DATA
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
// CHECK ADMIN LOGIN
// ========================================

async function isAdminLoggedIn() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    return !!user;
}


// ========================================
// ADMIN LOGIN
// ========================================

async function adminLogin() {

    const email =
        prompt("Enter admin email:");

    if (!email) {
        return false;
    }


    const password =
        prompt("Enter admin password:");

    if (!password) {
        return false;
    }


    const {
        error
    } =
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
// LOAD PHOTOS FROM SUPABASE
// ========================================

async function loadSupabasePhotos(
    type,
    grid
) {

    const {
        data,
        error
    } =
        await supabaseClient.storage
            .from("products")
            .list(type, {
                limit: 100,
                sortBy: {
                    column: "created_at",
                    order: "desc"
                }
            });


    if (error) {

        console.error(
            "Could not load photos:",
            error
        );

        return;
    }


    if (!data || data.length === 0) {
        return;
    }


    data.forEach(file => {

        if (!file.name) {
            return;
        }


        const filePath =
            `${type}/${file.name}`;


        const {
            data: publicUrlData
        } =
            supabaseClient.storage
                .from("products")
                .getPublicUrl(filePath);


        if (
            !publicUrlData ||
            !publicUrlData.publicUrl
        ) {
            return;
        }


        const img =
            document.createElement("img");


        img.src =
            publicUrlData.publicUrl;


        img.alt =
            `${type} collection`;


        img.loading = "lazy";


        img.style.cssText = `
            width:100%;
            height:300px;
            object-fit:cover;
            border-radius:8px;
            display:block;
        `;


        img.className =
            "supabase-photo";


        grid.appendChild(img);

    });

}


// ========================================
// UPLOAD PHOTOS TO SUPABASE
// ========================================

async function uploadPhotos(
    type,
    files,
    grid
) {

    if (!files || files.length === 0) {
        return;
    }


    // Check whether admin is already logged in
    let loggedIn =
        await isAdminLoggedIn();


    // If not logged in, ask for login
    if (!loggedIn) {

        loggedIn =
            await adminLogin();

        if (!loggedIn) {
            return;
        }
    }


    let uploaded = 0;


    for (const file of files) {

        // Only images
        if (
            !file.type ||
            !file.type.startsWith("image/")
        ) {

            alert(
                `${file.name} is not an image.`
            );

            continue;
        }


        // Make filename safe
        const safeName =
            file.name
                .replace(
                    /[^\w.-]/g,
                    "_"
                );


        // Unique filename
        const uniqueName =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 9)}-${safeName}`;


        // Example:
        // shirt/1723456789-abcd-shirt.jpg
        const filePath =
            `${type}/${uniqueName}`;


        const {
            error
        } =
            await supabaseClient.storage
                .from("products")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        contentType: file.type,
                        upsert: false
                    }
                );


        if (error) {

            console.error(
                "Upload error:",
                error
            );

            alert(
                "Photo upload failed.\n\n" +
                error.message
            );

            continue;
        }


        uploaded++;

    }


    // Upload completed
    if (uploaded > 0) {

        alert(
            `${uploaded} photo(s) uploaded successfully!`
        );


        // Remove old Supabase photos
        grid
            .querySelectorAll(
                ".supabase-photo"
            )
            .forEach(photo => {
                photo.remove();
            });


        // Load fresh photos
        await loadSupabasePhotos(
            type,
            grid
        );

    }

}


// ========================================
// OPEN PRODUCT GALLERY
// ========================================

async function openGallery(type) {

    const item =
        gallery[type];


    if (!item) {
        return;
    }


    // Create popup
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

            <!-- CLOSE BUTTON -->

            <button
                id="closeGallery"
                style="
                    float:right;
                    background:none;
                    border:none;
                    color:#c9a86a;
                    font-size:35px;
                    cursor:pointer;
                "
            >
                ×
            </button>


            <!-- TITLE -->

            <h2 style="
                color:#c9a86a;
                text-align:center;
                margin-bottom:25px;
            ">
                ${item.title}
            </h2>


            <!-- PHOTO GRID -->

            <div
                id="photoGrid"
                style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit,minmax(220px,1fr));
                    gap:18px;
                "
            >

                <!-- ORIGINAL IMAGE -->

                <img
                    src="${item.image}"
                    alt="${item.title}"
                    style="
                        width:100%;
                        height:300px;
                        object-fit:cover;
                        border-radius:8px;
                        display:block;
                    "
                >

            </div>


            <!-- ADMIN UPLOAD -->

            <div style="
                text-align:center;
                margin-top:25px;
            ">

                <label
                    style="
                        display:inline-block;
                        background:#c9a86a;
                        color:#111;
                        padding:14px 24px;
                        border-radius:6px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >

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

    const closeButton =
        document.getElementById(
            "closeGallery"
        );


    closeButton.addEventListener(
        "click",
        () => {
            popup.remove();
        }
    );


    // ========================================
    // PHOTO GRID
    // ========================================

    const grid =
        document.getElementById(
            "photoGrid"
        );


    // ========================================
    // LOAD SAVED SUPABASE PHOTOS
    // ========================================

    await loadSupabasePhotos(
        type,
        grid
    );


    // ========================================
    // ADD MORE PHOTO BUTTON
    // ========================================

    const fileInput =
        document.getElementById(
            "addPhotos"
        );


    fileInput.addEventListener(
        "change",
        async function () {

            await uploadPhotos(
                type,
                this.files,
                grid
            );


            // Reset file input
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


        // SHIRT

        if (
            text.includes("shirt")
        ) {

            type = "shirt";

        }


        // TROUSER / PANTS

        else if (
            text.includes("trouser") ||
            text.includes("pants")
        ) {

            type = "trouser";

        }


        // SHERWANI

        else if (
            text.includes("sherwani")
        ) {

            type = "sherwani";

        }


        // KURTA

        else if (
            text.includes("kurta")
        ) {

            type = "kurta";

        }


        // SUIT / WEDDING

        else if (
            text.includes("suit") ||
            text.includes("wedding")
        ) {

            type = "suit";

        }


        // MAKE CARD CLICKABLE

        if (type) {

            card.style.cursor =
                "pointer";


            card.addEventListener(
                "click",
                () => {

                    openGallery(type);

                }
            );

        }

    });
