// ========================================
// SILANA TAILOR
// ========================================

// MOBILE MENU
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


// Create gallery popup
function openGallery(type) {

    const item = gallery[type];

    if (!item) return;

    const popup = document.createElement("div");

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
            ">${item.title}</h2>

            <div id="photoGrid" style="
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
                gap:18px;
            ">
                <img src="${item.image}" style="
                    width:100%;
                    height:300px;
                    object-fit:cover;
                    border-radius:8px;
                ">
            </div>

            <div style="text-align:center;margin-top:25px;">

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
                    Phone se photo select karke yahan add kar sakte ho.
                </p>

            </div>

        </div>
    `;

    document.body.appendChild(popup);


    // CLOSE
    document
        .getElementById("closeGallery")
        .addEventListener("click", () => {
            popup.remove();
        });


    // ADD PHOTOS
    document
        .getElementById("addPhotos")
        .addEventListener("change", function () {

            const grid = document.getElementById("photoGrid");

            Array.from(this.files).forEach(file => {

                const reader = new FileReader();

                reader.onload = function(e) {

                    const img = document.createElement("img");

                    img.src = e.target.result;

                    img.style.cssText = `
                        width:100%;
                        height:300px;
                        object-fit:cover;
                        border-radius:8px;
                    `;

                    grid.appendChild(img);
                };

                reader.readAsDataURL(file);
            });
        });
}


// ========================================
// DETECT PRODUCT CARDS
// ========================================

document.querySelectorAll(".product-card, .collection-card").forEach(card => {

    const text = card.innerText.toLowerCase();

    let type = null;

    if (text.includes("shirt")) {
        type = "shirt";
    }
    else if (text.includes("trouser")) {
        type = "trouser";
    }
    else if (text.includes("sherwani")) {
        type = "sherwani";
    }
    else if (text.includes("kurta")) {
        type = "kurta";
    }
    else if (text.includes("suit") || text.includes("wedding")) {
        type = "suit";
    }

    if (type) {

        card.style.cursor = "pointer";

        card.addEventListener("click", function() {
            openGallery(type);
        });
    }
});