const URL_ALL_PRODUCTS = "https://my-json-server.typicode.com/Webbeginer/pwaapi/db";
const URL_DETAIL_BASE = "https://my-json-server.typicode.com/Webbeginer/pwaapi/products";

async function getData() {
    const url = URL_ALL_PRODUCTS;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch {
        console.log("Error");
        return [];
    };
};

async function getDetailData(name) {
    const url = `${URL_DETAIL_BASE}?name=${name}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch {
        console.log("Error");
        return [];
    };
};

const dataSelect = document.getElementById("CarSelect");
const CarList = document.getElementById("CarList");

function renderList(products) {
    CarList.innerHTML = "";
    products.forEach(element => {
        const h3 = document.createElement("h3");
        h3.innerHTML = `<h3>${element.name}</h3>`;
        const p = document.createElement("p");
        p.innerHTML = ` <p>${element.category}</p>`;
        CarList.appendChild(h3);
        CarList.appendChild(p);
    });
};

// untuk mengupdate data baru ke chache
// apakah data sudah diterima atau belum
let networkDataReceived = false;
var networkUpdate = fetch(URL_ALL_PRODUCTS).then(response => {
    return response.json();
}).then(data => {
    networkDataReceived = true;
    renderList(data.products);
});

// return data form cache
caches.match(URL_ALL_PRODUCTS).then(function (response) {
    if (!response) throw new Error("No cache found");
    return response.json();
}).then(function (data) {
    if (!networkDataReceived) {
        renderList(data.products);
        console.log("data from cache");
    }
}).catch(function () {
    return networkUpdate;
})

window.onload = async function () {
    const data = await getData();
    const names = [...new Set(data.products.map(product => product.name))];
    names.forEach(element => {
        const option = document.createElement("option");
        option.value = element;
        option.text = element;
        dataSelect.appendChild(option);

    });
    renderList(data.products);

};
dataSelect.addEventListener("change", async function () {
    CarList.innerHTML = "";
    const data = await getData();

    if (dataSelect.value === "All") {
        renderList(data.products);
    };
    if (dataSelect.value !== "All") {
        const detailData = await getDetailData(dataSelect.value);
        console.log(detailData);
        renderList(detailData);
    };
});


// service worker

// bagian register
const registerServiceWorker = async () => {
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js", {
                scope: "/",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
};

// …

registerServiceWorker();


