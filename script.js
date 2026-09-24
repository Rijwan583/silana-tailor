// ========================================
// SILANA TAILOR
// GALLERY + SUPABASE PERMANENT PHOTO UPLOAD
// ========================================


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://yilabtpkpbbfpmutwnuy.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_21v6WZAxDRwg5oEcXfUQAA_jPWQXU_i";

let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );
}


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

    text = (text || "").toLowerCase();

    if (text.includes("sherwani")) {
        return "sherwani";
    }

    if (text.includes("kurta")) {
        return "kurta";
    }

    if (
        text.includes("trouser") ||
        text.includes("pants")
    ) {
        return "trouser";
    }

    if (text.includes("shirt")) {
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
// CHECK OWNER LOGIN
// ========================================

async function checkAdminLogin() {

    if (!supabaseClient) {
        return false;
    }

    const {
        data,
        error
    } = await supabaseClient.auth.getUser();

    if (error) {
        return false;
    }

    return !!data.user;
}


// ========================================
// OWNER LOGIN MODAL
// ========================================

function showLoginPopup() {

    return new Promise((resolve) => {

        const old =
            document.getElementById(
                "silanaLoginPopup"
            );

        if (old) {
            old.remove();
        }


        const popup =
            document.createElement("div");

        popup.id =
            "silanaLoginPopup";


        popup.style.cssText = `
            position:fixed;
            inset:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.90);
            z-index:1000000;
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            box-sizing:border-box;
        `;


        popup.innerHTML = `

            <div style="
                width:100%;
                max-width:420px;
                background:#111;
                border:1px solid #c9a86a;
                border-radius:12px;
                padding:28px;
                box-sizing:border-box;
                position:relative;
            ">

                <button
                    id="silanaLoginClose"
                    style="
                        position:absolute;
                        top:8px;
                        right:14px;
                        background:none;
                        border:none;
                        color:#c9a86a;
                        font-size:30px;
                        cursor:pointer;
                    "
                >
                    ×
                </button>


                <h2 style="
                    color:#c9a86a;
                    text-align:center;
                    margin:0 0 8px;
                ">
                    Owner Login
                </h2>


                <p style="
                    color:#aaa;
                    text-align:center;
                    font-size:13px;
                    margin-bottom:22px;
                ">
                    Login to add photos
                </p>


                <input
                    id="silanaEmail"
                    type="email"
                    placeholder="Owner Email"
                    autocomplete="username"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        margin-bottom:12px;
                        border-radius:6px;
                        border:1px solid #555;
                        background:#222;
                        color:#fff;
                        outline:none;
                    "
                >


                <input
                    id="silanaPassword"
                    type="password"
                    placeholder="Password"
                    autocomplete="current-password"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:13px;
                        margin-bottom:16px;
                        border-radius:6px;
                        border:1px solid #555;
                        background:#222;
                        color:#fff;
                        outline:none;
                    "
                >


                <button
                    id="silanaLoginButton"
                    style="
                        width:100%;
                        padding:13px;
                        border:none;
                        border-radius:6px;
                        background:#c9a86a;
                        color:#111;
                        font-weight:bold;
                        cursor:pointer;
                        font-size:15px;
                    "
                >
                    Login
                </button>


                <p
                    id="silanaLoginMessage"
                    style="
                        color:#d9b87c;
                        text-align:center;
                        font-size:13px;
                        min-height:18px;
                        margin-top:14px;
                    "
                ></p>

            </div>
        `;


        document.body.appendChild(popup);


        const email =
            document.getElementById(
                "silanaEmail"
            );

        const password =
            document.getElementById(
                "silanaPassword"
            );

        const loginButton =
            document.getElementById(
                "silanaLoginButton"
            );

        const message =
            document.getElementById(
                "silanaLoginMessage"
            );

        const closeButton =
            document.getElementById(
                "silanaLoginClose"
            );


        closeButton.addEventListener(
            "click",
            () => {

                popup.remove();

                resolve(false);

            }
        );


        loginButton.addEventListener(
            "click",
            async () => {

                if (!supabaseClient) {

                    message.textContent =
                        "Supabase is not loaded.";

                    return;
                }


                const emailValue =
                    email.value.trim();

                const passwordValue =
                    password.value;


                if (
                    !emailValue ||
                    !passwordValue
                ) {

                    message.textContent =
                        "Enter email and password.";

                    return;
                }


                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "Logging in...";

                message.textContent = "";


                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email:
                                emailValue,
                            password:
                                passwordValue
                        });


                if (error) {

                    message.textContent =
                        "Login failed: " +
                        error.message;

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                if (
                    !data ||
                    !data.user
                ) {

                    message.textContent =
                        "Login failed.";

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "Login";

                    return;
                }


                popup.remove();

                resolve(true);

            }
        );


        password.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter"
                ) {
                    loginButton.click();
                }

            }
        );

    });
}


// ========================================
// LOAD PHOTOS FROM SUPABASE
// ========================================

async function loadSupabasePhotos(
    type,
    grid
) {

    if (!supabaseClient) {
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
                    limit:100,
                    sortBy:{
                        column:"created_at",
                        order:"desc"
                    }
                }
            );


    if (error) {

        console.log(
            "Photo loading error:",
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


        const path =
            `${type}/${file.name}`;


        const {
            data:urlData
        } =
            supabaseClient.storage
                .from("products")
                .getPublicUrl(path);


        if (
            !urlData ||
            !urlData.publicUrl
        ) {
            return;
        }


        const img =
            document.createElement("img");


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
            "Supabase is not loaded. Refresh the website."
        );

        return;
    }


    let uploaded = 0;


    for (
        const file of files
    ) {

        if (
            !file.type ||
            !file.type.startsWith("image/")
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
                .substring(2,8)}-${safeName}`;


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
// CHOOSE PHOTO
// IMPORTANT FOR IPHONE
// ========================================

function choosePhotos(
    type,
    grid
) {

    return new Promise((resolve) => {

        const input =
            document.createElement("input");


        input.type =
            "file";

        input.accept =
            "image/*";

        input.multiple =
            true;


        input.style.display =
            "none";


        document.body.appendChild(
            input
        );


        input.addEventListener(
            "change",
            async () => {

                if (
                    input.files &&
                    input.files.length > 0
                ) {

                    await uploadPhotos(
                        type,
                        input.files,
                        grid
                    );

                }


                input.remove();

                resolve();

            },
            {
                once:true
            }
        );


        // This click happens directly
        // from the owner's button press.
        input.click();

    });

}


// ========================================
// OPEN OWNER PHOTO CONTROL
// ========================================

async function openOwnerPhotoControl(
    type,
    grid
) {

    const loggedIn =
        await checkAdminLogin();


    if (!loggedIn) {

        const success =
            await showLoginPopup();


        if (!success) {
            return;
        }

    }


    // Login complete.
    // Now show a REAL button.
    // User clicks it to open iPhone picker.

    const control =
        document.createElement("div");


    control.id =
        "silanaChoosePhotoControl";


    control.style.cssText = `
        position:fixed;
        inset:0;
        z-index:1000001;
        background:rgba(0,0,0,0.88);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
        box-sizing:border-box;
    `;


    control.innerHTML = `

        <div style="
            width:100%;
            max-width:380px;
            background:#111;
            border:1px solid #c9a86a;
            border-radius:12px;
            padding:28px;
            text-align:center;
            box-sizing:border-box;
        ">

            <h2 style="
                color:#c9a86a;
                margin:0 0 10px;
            ">
                Owner Verified
            </h2>


            <p style="
                color:#aaa;
                font-size:14px;
                margin-bottom:22px;
            ">
                Choose photos to add to this collection.
            </p>


            <button
                id="silanaChoosePhotosButton"
                style="
                    width:100%;
                    padding:14px;
                    border:none;
                    border-radius:6px;
                    background:#c9a86a;
                    color:#111;
                    font-weight:bold;
                    font-size:15px;
                    cursor:pointer;
                "
            >
                Choose Photos
            </button>


            <button
                id="silanaCancelChoose"
                style="
                    width:100%;
                    margin-top:10px;
                    padding:12px;
                    border:1px solid #555;
                    border-radius:6px;
                    background:#222;
                    color:#fff;
                    cursor:pointer;
                "
            >
                Cancel
            </button>

        </div>
    `;


    document.body.appendChild(
        control
    );


    const chooseButton =
        document.getElementById(
            "silanaChoosePhotosButton"
        );


    const cancelButton =
        document.getElementById(
            "silanaCancelChoose"
        );


    cancelButton.addEventListener(
        "click",
        () => {

            control.remove();

        }
    );


    chooseButton.addEventListener(
        "click",
        async () => {

            // IMPORTANT:
            // file picker is opened directly
            // from this button click.

            control.remove();

            await choosePhotos(
                type,
                grid
            );

        }
    );

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


    const oldPopup =
        document.getElementById(
            "silanaGalleryPopup"
        );


    if (oldPopup) {
        oldPopup.remove();
    }


    const popup =
        document.createElement("div");


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

        <div style="
            max-width:1000px;
            margin:auto;
            background:#111;
            border:1px solid #c9a86a;
            padding:25px;
            border-radius:12px;
            box-sizing:border-box;
        ">

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


            <h2 style="
                color:#c9a86a;
                text-align:center;
                margin:0 0 25px 0;
            ">
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


            <div style="
                text-align:center;
                margin-top:25px;
            ">

                <button
                    id="silanaAddPhotoButton"
                    style="
                        display:inline-block;
                        background:#c9a86a;
                        color:#111;
                        padding:14px 24px;
                        border-radius:6px;
                        font-weight:bold;
                        cursor:pointer;
                        border:none;
                        font-size:15px;
                    "
                >
                    + Add More Photo
                </button>


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


    document.body.appendChild(
        popup
    );


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


    const grid =
        document.getElementById(
            "silanaPhotoGrid"
        );


    // Load existing permanent photos
    await loadSupabasePhotos(
        type,
        grid
    );


    // Add photo
    document
        .getElementById(
            "silanaAddPhotoButton"
        )
        .addEventListener(
            "click",
            async () => {

                await openOwnerPhotoControl(
                    type,
                    grid
                );

            }
        );

}


// ========================================
// PRODUCT CARD CLICK
// ========================================

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


    card.dataset.galleryAttached =
        "true";


    card.addEventListener(
        "click",
        () => {

            openGallery(type);

        }
    );

});


// ========================================
// BACKUP CLICK SYSTEM
// ========================================

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.closest(
                "button, a, input, label"
            )
        ) {
            return;
        }


        const element =
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


        if (text.length > 500) {
            return;
        }


        if (
            !element.dataset.galleryAttached
        ) {

            element.dataset.galleryAttached =
                "true";


            openGallery(type);

        }

    }
);
