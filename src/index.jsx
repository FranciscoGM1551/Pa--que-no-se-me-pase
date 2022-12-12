const electron = require("electron");
const { ipcRenderer } = electron;
const fs = require("fs");
const timerScreen = document.getElementById("timer");
const clockTitle = document.getElementById("title");
const countdown = document.getElementById("countdown");
const createNewScreen = document.getElementById("new");
const clockrow = document.getElementById("row");
const errorLine = document.getElementById("error");

const button = document.getElementById("toggleButton");
const pin = document.getElementById("togglePin");

//Los valores para el temporizador
let [title, hours, minutes, seconds] = [null, null, null, null];
let [interval, time, saveData] = [null, null, null];

//Metodo para mandar los valores
const write = (to, data) => {
  fs.writeFile(to, data, function (err) {
    if (err) console.error("Shit happens");
  });
};

//Metodo para leer los valores
const read = async (from) => {
  try {
    return JSON.parse(await fs.readFileSync(from, "utf8"));
  } catch {
    return false;
  }
};

//Creacion de los inputs del texto inicial
const createInputs = () => {
  const inputList = [];
  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = "Title";
  createNewScreen.insertBefore(titleInput, clockrow);
  inputList.push(titleInput);

  //Creacion todos los inputs del contador
  for (const label of ["hours", "minutes", "seconds"]) {
    const input = document.createElement("input");
    input.type = "text";
    input.value = "00";
    input.maxLength = "2";
    input.id = `${label}Input`;
    clockrow.append(input);
    inputList.push(input);
    const colon = document.createElement("label");
    colon.innerHTML = ":";
    if (label != "seconds") clockrow.append(colon);
  }

  return inputList;
};

//Limpiar campos
const clearInputs = () => {
  title.remove();
  clockrow.innerHTML = "";
};

//Comprobar si se ingresan numeros
const inputValidation = (element) => {
  if (!isNaN(element.value)) return true;
};

//Regresa un mensaje de error en caso de ser necesario
const errorMsg = (text, variable) => {
  hours.classList.remove("error");
  minutes.classList.remove("error");
  seconds.classList.remove("error");
  variable.classList.add("error");
  error.innerHTML = `${text}(s) invalidos. Los valores deben de ser numericos (0 a 9)`;
};

//Comprobar si el contador termino
const isValidCountDown = () => {
  const previousDate = new Date(saveData["date"]);
  const currentDate = Date.now();
  const differenceInTime = Math.abs(currentDate - previousDate);
  if (differenceInTime > time) time = 0;
};

//Actualiza el contador
const updateCountDown = () => {
  if (time == 0) countdown.innerHTML = "El temporizador termino";
  else {
    time -= 1;
    countdown.innerHTML = new Date(time * 1000).toISOString().substr(11, 8);
  }
};

async function loadData() {
  saveData = await read((from = "./data.json"));
  clockTitle.innerHTML = saveData["title"];
  time = saveData["time"];
  isValidCountDown();
  interval = setInterval(updateCountDown, 1000);
}
loadData();

//Lo que sucede cuando clickemos el boton Done
button.addEventListener("click", function () {
  if (button.innerHTML == "New") {
    button.innerHTML = "Done";
    timerScreen.style.display = "none";
    createNewScreen.style.display = "block";
    const inputs = createInputs();
    title = inputs[0];
    hours = inputs[1];
    minutes = inputs[2];
    seconds = inputs[3];
  } else if (!inputValidation(hours)) errorMsg("hora", hours);
  else if (!inputValidation(minutes)) errorMsg("minuto", minutes);
  else if (!inputValidation(seconds)) errorMsg("segundo", seconds);
  else {
    clockTitle.innerHTML = title.value;
    time =
      parseInt(hours.value) * 60 * 60 +
      parseInt(minutes.value) * 60 +
      parseInt(seconds.value);
    button.innerHTML = "New";
    timerScreen.style.display = "block";
    createNewScreen.style.display = "none";
    clearInputs();
  }
});
//Evento cuando presionas el boton Pin
pin.addEventListener("click", function () {
  if (pin.innerHTML == "Pin") {
    pin.innerHTML = "Unpin";
    pin.classList.add("active");
    ipcRenderer.send("pin_status", true);
  } else {
    pin.innerHTML = "Pin";
    pin.classList.remove("active");
    ipcRenderer.send("pin_status", false);
  }
});

ipcRenderer.on("save", () => {
  write(
    (to = "./data.json"),
    dataJSON.stringify({
      title: time,
      date: Date.now(),
    })
  );
  ipcRenderer.send("close_save");
});
