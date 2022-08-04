console.log("hello world!");

// const $carContainer = $('.car-container');
const $carListInfo = $(".car-list");

init();

function init() {
  getAllCars();
  AddEventListenerToAddBtn();
  addEventListenerToAddAllBtn(); //Add btn
  addEventListenerToDeleteBtn();
  addEventListenerToUpdateBtn()
  getDate();
}

// ----------------------- CRUD ----------------
// -------------- READ/cars
async function getAllCars() {
  const result = await fetch("/api/cars");
  const data = await result.json();
  for (let i of data) {
    createAndAppendDiv(i.car_id, i.make, i.model, i.year, i.owner_id);
  }
}

// -------------- CREATE/cars
async function postCar(url = '', data = {}) {
  const response = await fetch(url, {
    method: "POST",
    // mode: "cors",
    headers: {
      accept: "application.json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const content = await response.json();
  console.log(content);
  return content;
}

// -------------- DELETE/cars
async function deleteCar(url = "") {
  const response = await fetch(url, {
    method: "DELETE",
    mode: "cors",
    headers: {
      accept: "application.json",
      "Content-Type": "application/json",
    },
  });
  return response.json();
}

// -------------- UPDATE/cars
async function updateCar(url, data = {}) {
  const response = await fetch(url, {
    method: "PATCH",
    mode: "cors",
    headers: {
      accept: "application.json",
      "Content-type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

// ----------------------- FUNCTIONS ----------------
function createAndAppendDiv(carId, carMake, carModel, carYear, carOwner) {
  const carDiv = $(`<div class="car" id=${carId}>`);
  // create child elements
  const li = $(`<li class='car-make'>${carMake}</li>`);
  const li1 = $(`<li class='car-model'>${carModel}</li>`);
  const li2 = $(`<li class='car-make'>${carYear}</li>`);
  const li3 = $(`<li class='car-make'>${carOwner}</li>`);
  const divBtn = $(`<button class='remove-btn' id=${carId}>X</button>`);
  const editBtn = $(`<button class='edit-btn' id=${carId}>Edit</button>`);
  // append child
  $(carDiv).append(li);
  $(carDiv).append(li1);
  $(carDiv).append(li2);
  $(carDiv).append(li3);
  $(carDiv).append(divBtn);
  $(carDiv).append(editBtn);
  $carListInfo.append(carDiv);
}

/// ADD BUTTON
function AddEventListenerToAddBtn() {
  $("#add-btn").on("click", async () => {
    const iDInput = $("#text-owner-id").val();
    const makeInput = $("#text-make").val();
    const modelInput = $("#text-model").val();
    const yearInput = $("#text-year").val();
    // if text input is nothing
    if (
      iDInput.length === 0 ||
      makeInput.length === 0 ||
      modelInput.length === 0
    ) {
      $(".message").show();
      $(".message").text("Wrong format !");
    } else {
      let lastCar = $carListInfo.children().last().attr("id");
      if (lastCar === undefined) {
        lastCar = 1;
        $(".message").hide();
        console.log(lastCar);
        createAndAppendDiv(lastCar, makeInput, modelInput, yearInput, iDInput);
        await postCar("/api/cars", {
          owner_id: iDInput,
          make: makeInput,
          model: modelInput,
          year: yearInput,
        });
      } else {
        lastCar++;
        $(".message").hide();
        console.log("lastCar++", lastCar);
        createAndAppendDiv(lastCar, makeInput, modelInput, yearInput, iDInput);
        await postCar("/api/cars", {
          owner_id: iDInput,
          make: makeInput,
          model: modelInput,
          year: yearInput,
        });
        // $.ajax({type: "POST", crossDomain: true, url: '/api/cars', data: {owner_id: iDInput, make: makeInput, model: modelInput, year: yearInput}, success: function () {}});
      }
    }
  });
}

/// SHOW ALL BUTTON
function addEventListenerToAddAllBtn() {
  $("#add-all-btn").on("click", () => {
    $carListInfo.empty();
    $.get("/api/cars", (data) => {
      console.log(data);
      data.forEach((search) => {
        const carDiv = $(`<div class="car" id=${search.car_id}></div`);
        // create child elements
        const li = $(`<li class='car-make'>${search.make}</li>`);
        const li1 = $(`<li class='car-model'>${search.model}</li>`);
        const li2 = $(`<li class='car-make'>${search.year}</li>`);
        const li3 = $(`<li class='car-owner-id'>${search.owner_id}</li>`);
        const deleteBtn = $(`<button class='remove-btn' id=${search.car_id}>x</button>`);
        const editBtn = $(`<button class='edit-btn' id=${search.car_id}>Edit</button>`);
        // append child
        $(carDiv).append(li);
        $(carDiv).append(li1);
        $(carDiv).append(li2);
        $(carDiv).append(li3);
        $(carDiv).append(deleteBtn);
        $(carDiv).append(editBtn);
        $carListInfo.append(carDiv);
      });
    });
  });
}

/// DELETE BUTTON
function addEventListenerToDeleteBtn() {
  $carListInfo.on("click", async (e) => {
    const deleteBtn = e.target.getAttribute("class") === "remove-btn";
    let divId = e.target.getAttribute("id");
    if (deleteBtn) {
      $(".message").show();
      $(".message").text("Delete!");
      const btnId = e.target.getAttribute("id");
      divId = btnId;
      $(`#${divId}`).hide();
      // delete
      await deleteCar(`/api/cars/${divId}`);
    }
  });
}

/// EDIT BUTTON
function addEventListenerToUpdateBtn() {
  $carListInfo.on("click", async (e) => {
    const iDInput = $("#text-owner-id").val();
    const makeInput = $("#text-make").val();
    const modelInput = $("#text-model").val();
    const yearInput = $("#text-year").val();
    const updateBtn = e.target.getAttribute("class") === "edit-btn";
    let divId = e.target.getAttribute("id");
    if(iDInput.length === 0 ||
        makeInput.length === 0 ||
        modelInput.length === 0 ||
        yearInput.length === 0
      ) {
        $(".message").show();
        $(".message").text(`Missing input ! Please try again`);
    }
    if(updateBtn) {
      $(".message").show()
      $(".message").text(`Updated`);
      const btnId = e.target.getAttribute("id");
      divId = btnId;
      await updateCar(`/api/cars/${divId}`, {
        owner_id: iDInput,
        make: makeInput,
        model: modelInput,
        year: yearInput,
      });
    }
  });
}

function getDate() {
  const fullDate = new Date();
  const year = fullDate.getFullYear();
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][fullDate.getMonth()];
  const date = fullDate.getDate();
  const weekDay = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][fullDate.getDay()];
  const formatted_date = `${month} ${date}, ${year}`;
  // show formatted date
  $(".date").text(formatted_date);
  $(".title-time").html(`&#128467 Have a good ${weekDay} &#8987;`);
}
