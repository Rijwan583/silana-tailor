// ========================================
// SILANA TAILOR
// GALLERY + SUPABASE PHOTO UPLOAD
// ========================================


// ========================================
// SUPABASE CONFIG
// ========================================

const SUPABASE_URL =
    "https://yilabtpkpbbfpmutwnuy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_21v6WZAxDRwg5oEcXfUQAA_jPWQXU_i";


// Safe Supabase connection
let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


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
// GALLERY DATA
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
// FIND PRODUCT TYPE
// ========================================

function getProductType(text) {

    text =
        text.toLowerCase();


    if (
        text.includes("sherwani")
    ) {

        return "sherwani";

    }


    if (
        text.includes("kurta")
    ) {

        return "kurta";

    }


    if (
        text.includes("trouser") ||
        text.includes("pants")
    ) {

        return "trouser";

    }


    if (
        text.includes("shirt")
    ) {

        return "shirt";

    }


    if (
        text.includes("suit") ||
        text.includes("wedding")
    ) {

        return "suit";

    }


    return null;

}


// ========================================
// ADMIN LOGIN
// ========================================

async function adminLogin() {

    if (!supabaseClient) {

        alert(
            "Supabase is not loaded. Please refresh the website."
        );

        return false;

    }


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
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        alert(
            "Login failed:\n\n" +
            error.message
        );

        return false;

    }


    alert(
        "Admin login successful!"
    );


    return true;

}


// ========================================
// CHECK LOGIN
// ========================================

async function checkAdminLogin() {

    if (!supabaseClient) {

        return false;

    }


    const {
        data
    } =
        await supabaseClient.auth
            .getUser();


    return !!data.user;

}


// ========================================
// LOAD SAVED SUPABASE PHOTOS
// ========================================

async function loadSupabasePhotos(
    type,
    grid
) {

    if (!supabaseClient) {

        console.log(
            "Supabase not available."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient.storage
            .from("products")
            .list(

                type,

                {

                    limit: 100,

                    sortBy: {

                        column: "created_at",

                        order: "desc"

                    }

                }

            );


    if (error) {

        console.log(
            "Could not load Supabase photos:",
            error.message
        );

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        return;

    }


    data.forEach(file => {

        if (!file.name) {

            return;

        }


        const filePath =
            `${type}/${file.name}`;


        const {
            data: urlData
        } =
            supabaseClient.storage
                .from("products")
                .getPublicUrl(
                    filePath
                );


        if (
            !urlData ||
            !urlData.publicUrl
        ) {

            return;

        }


        const img =
            document.createElement(
                "img"
            );


        img.src =
            urlData.publicUrl;


        img.alt =
            `${type} collection`;


        img.className =
            "supabase-photo";


        img.style.cssText = `
            width:100%;
            height:300px;
            object-fit:cover;
            border-radius:8px;
            display:block;
        `;


        grid.appendChild(img);

    });

}


// ========================================
// UPLOAD PHOTOS
// ========================================

async function uploadPhotos(
    type,
    files,
    grid
) {

    if (
        !files ||
        files.length === 0
    ) {

        return;

    }


    if (!supabaseClient) {

        alert(
            "Supabase is not loaded.\nPlease refresh the website."
        );

        return;

    }


    let loggedIn =
        await checkAdminLogin();


    if (!loggedIn) {

        loggedIn =
            await adminLogin();


        if (!loggedIn) {

            return;

        }

    }


    let uploaded =
        0;


    for (
        const file of files
    ) {


        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            continue;

        }


        const safeName =
            file.name.replace(
                /[^\w.-]/g,
                "_"
            );


        const uniqueName =
            `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}-${safeName}`;


        const path =
            `${type}/${uniqueName}`;


        const {
            error
        } =
            await supabaseClient.storage
                .from("products")
                .upload(

                    path,

                    file,

                    {

                        contentType:
                            file.type,

                        cacheControl:
                            "3600",

                        upsert:
                            false

                    }

                );


        if (error) {

            alert(
                "Upload failed:\n\n" +
                error.message
            );

            console.log(error);

            continue;

        }


        uploaded++;

    }


    if (uploaded > 0) {

        alert(
            uploaded +
            " photo(s) uploaded successfully!"
        );


        grid
            .querySelectorAll(
                ".supabase-photo"
            )
            .forEach(img => {

                img.remove();

            });


        await loadSupabasePhotos(
            type,
            grid
        );

    }

}


// ========================================
// OPEN GALLERY
// ========================================

async function openGallery(type) {

    const item =
        gallery[type];


    if (!item) {

        return;

    }


    // Create popup
    const popup =
        document.createElement(
            "div"
        );


    popup.id =
        "silanaGalleryPopup";


    popup.style.cssText = `
        position:fixed;
        inset:0;
        width:100%;
        height:100%;
        background:rgba(0,0,0,0.92);
        z-index:999999;
        overflow-y:auto;
        padding:30px 15px;
        box-sizing:border-box;
    `;


    popup.innerHTML = `

        <div
            style="
                max-width:1000px;
                margin:auto;
                background:#111;
                border:1px solid #c9a86a;
                padding:25px;
                border-radius:12px;
                box-sizing:border-box;
            "
        >

            <button
                id="silanaCloseGallery"
                style="
                    float:right;
                    background:none;
                    border:none;
                    color:#c9a86a;
                    font-size:35px;
                    cursor:pointer;
                    line-height:1;
                "
            >
                ×
            </button>


            <h2
                style="
                    color:#c9a86a;
                    text-align:center;
                    margin:0 0 25px 0;
                "
            >
                ${item.title}
            </h2>


            <div
                id="silanaPhotoGrid"
                style="
                    display:grid;
                    grid-template-columns:
                    repeat(
                        auto-fit,
                        minmax(220px,1fr)
                    );
                    gap:18px;
                "
            >

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


            <div
                style="
                    text-align:center;
                    margin-top:25px;
                "
            >

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
                        id="silanaAddPhotos"
                        type="file"
                        accept="image/*"
                        multiple
                        style="display:none;"
                    >

                </label>


                <p
                    style="
                        color:#aaa;
                        margin-top:12px;
                        font-size:13px;
                    "
                >
                    Owner login required to add photos.
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(
        popup
    );


    // Close
    document
        .getElementById(
            "silanaCloseGallery"
        )
        .addEventListener(
            "click",
            () => {

                popup.remove();

            }
        );


    // Grid
    const grid =
        document.getElementById(
            "silanaPhotoGrid"
        );


    // Load permanent photos
    await loadSupabasePhotos(
        type,
        grid
    );


    // File input
    const fileInput =
        document.getElementById(
            "silanaAddPhotos"
        );


    fileInput.addEventListener(
        "change",
        async function () {

            await uploadPhotos(
                type,
                this.files,
                grid
            );


            this.value = "";

        }
    );

}


// ========================================
// PRODUCT CARD CLICK SYSTEM
// ========================================

// First try normal product cards
const productCards =
    document.querySelectorAll(
        ".product-card, .collection-card"
    );


productCards.forEach(card => {

    const type =
        getProductType(
            card.innerText
        );


    if (!type) {

        return;

    }


    card.style.cursor =
        "pointer";


    card.addEventListener(
        "click",
        function () {

            openGallery(type);

        }
    );

});


// ========================================
// BACKUP CLICK SYSTEM
// ========================================

// This catches cards even if their class
// is different from product-card/collection-card.

document.addEventListener(
    "click",
    function (event) {

        // Ignore buttons, links and inputs
        if (
            event.target.closest(
                "button, a, input, label"
            )
        ) {

            return;

        }


        // Find nearest useful element
        let element =
            event.target.closest(
                "article, div, section"
            );


        if (!element) {

            return;

        }


        const text =
            element.innerText || "";


        const type =
            getProductType(text);


        if (!type) {

            return;

        }


        // Prevent huge parent containers
        if (
            text.length > 500
        ) {

            return;

        }


        // If this card was not already
        // handled by the normal system
        if (
            !element.dataset
                .galleryAttached
        ) {

            element.dataset
                .galleryAttached = "true";


            openGallery(type);

        }

    }
);
