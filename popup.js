document.addEventListener("DOMContentLoaded", () => {
    handleNoData();
});

function handleNoData() {
    const content = document.getElementById("content");

    content.innerText = "No data found.";
}