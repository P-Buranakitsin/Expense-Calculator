// Class Expense
class Expense {
  constructor() {
    this.items = [];
  }

  // addItem method
  addItem(name, price) {
    const item = {
      name,
      price,
    };
    this.items.push(item);
    return item;
  }
}

// Class Friend
class People {
  constructor() {
    this.friends = [];
  }
}

// selectors
const elements = {
  item: document.getElementById("item"),
  price: document.getElementById("price"),
  friend: document.getElementById("friend"),
  checkBoxes: (ev) => {
    const checkBoxes = ev.target.parentNode.parentNode.querySelectorAll(
      "input[checked]"
    );
    return checkBoxes;
  },
};

// State
const state = {}; // Current State
state.expense = new Expense();
state.people = new People();

// Handling 'เพิ่มรายการใช้จ่าย' button clicks
document
  .querySelector("[value=เพิ่มรายการใช้จ่าย]")
  .addEventListener("click", () => {
    if (elements.item.value && elements.price.value > 0) {
      controlExpense();
      if (state.people.friends.length !== 0) {
        storeExpenses();
        delCols();
        timesRenderPeople();
      }
    } else if (!elements.item.value || !elements.price.value) {
      alert("Please enter both item and its price");
    } else if (elements.item.value && elements.price.value <= 0) {
      alert("Price must be higher than 0");
    }
  });

// Handling 'เพิ่มคน' button clicks
document.querySelector("[value=เพิ่มคน]").addEventListener("click", () => {
  controlPeople();
});

// Control Expense
const controlExpense = () => {
  // Store input values in the state
  const newItem = state.expense.addItem(
    elements.item.value,
    elements.price.value
  );

  // Prices without division
  state.expense.prices = state.expense.items.map((item) =>
    parseFloat(item.price, 10)
  );
  const totalPrice = state.expense.prices.reduce((acc, cur) => acc + cur);
  state.expense.prices.push(totalPrice);

  // Clear input fields
  elements.item.value = elements.price.value = "";

  // Render expense items according to input values
  renderExpense(newItem);
};

// Render Expense to table
const renderExpense = (item) => {
  const markup = `<tr>
      <th>${item.name} (${item.price})</th>
      <th id="total">0</th>
    </tr>`;
  document
    .querySelector("[style~=red]")
    .insertAdjacentHTML("beforebegin", markup);
};

const names = [];

// Store new expenses to existing state
const storeExpenses = () => {
  const expenses = state.expense.items.map(
    (item) => parseFloat(item.price, 10) / names.length
  );
  const totalExpense = expenses.reduce((acc, cur) => acc + cur);
  const friendsArrObj = names.map((name) => {
    return {
      name: name,
      expenses: expenses,
      total: totalExpense,
    };
  });
  state.people.friends = friendsArrObj;
};

// Delete previous column(s)
const delCols = () => {
  const addedTDs = Array.from(document.querySelectorAll("td"));
  addedTDs.forEach((addedTD) => addedTD.remove());
};

// Render x times based on array of arrays
const timesRenderPeople = () => {
  // Convert array of objects to array of arrays
  const friendsArrArr = state.people.friends.map((e) => Object.values(e));
  for (let i = friendsArrArr.length - 1; i >= 0; i--) {
    renderPeople(friendsArrArr[i].flat(), state.people.friends[i]);
  }
};

// Control People
const controlPeople = () => {
  if (
    state.expense.items.length >= 1 &&
    !names.includes(elements.friend.value)
  ) {
    // Delete previous column(s)
    delCols();

    // Check if name already exists in array
    names.push(elements.friend.value);
    storeExpenses();

    timesRenderPeople();
  } else {
    alert("Please add an item first or enter unrepeated name");
  }
};

const renderPeople = (friendArr, friend) => {
  // Convert nodelist to array
  const trArr = Array.from(document.querySelectorAll("tr"));

  trArr.forEach((e, index) => {
    const thtdArr = e.querySelectorAll("th", "td");

    // Change values of รวมทุกคน column
    // Select every rows except the first one
    if (e.querySelector("#total") !== null) {
      e.querySelector("#total").innerHTML = state.expense.prices[index - 1];
    }

    // Add td tag to index.html
    e.insertCell(thtdArr.length - 1).innerHTML = friendArr[index];

    // Add Checkbox
    if (index !== 0 && index !== trArr.length - 1) {
      const tdTag = e.querySelector("td");
      // Add "" around template literal if its value contains space
      const markup = `<input type="checkbox" checked=true value="${
        tdTag.innerText
      }" name="${friend.name}" index=${index - 1}>`;
      tdTag.insertAdjacentHTML("afterbegin", markup);
    }

    // If there is only one person, disable all checkboxes
    if (state.people.friends.length === 1) {
      Array.from(document.querySelectorAll("input[checked]")).forEach((e) =>
        e.setAttribute("disabled", true)
      );
    }
  });
};

// Optional Checkboxes
document.querySelector(".sub-container3").onclick = (ev) => {
  if (ev.target.type === "checkbox") {
    ev.target.toggleAttribute("checked");

    const checkedBoxes = ev.target.parentNode.parentNode.querySelectorAll(
      "input[checked]"
    );

    // If there are many people, and only one checkbox in rows if left checked, then disable it
    if (checkedBoxes.length === 1) {
      checkedBoxes[0].disabled = true;
    } else {
      checkedBoxes.forEach((checkBox) => (checkBox.disabled = false));
    }
    if (ev.target.checked === false) {
      // Use else if to avoid undefined case
      controlBox(ev, 0, checkedBoxes.length);
      renderBox();
    } else if (ev.target.checked === true) {
      controlBox(
        ev,
        parseFloat(ev.target.getAttribute("value")),
        checkedBoxes.length
      );
      renderBox();
    }
  }
};

// A function used to find matched object in the state and modify values
const controlBox = (ev, value, checkedBoxesLen) => {
  // Get name attribute of input tag
  const name = ev.target.getAttribute("name");

  // Get index attribute of input tag
  const index = parseInt(ev.target.getAttribute("index"), 10);

  const peopleObj = state.people.friends.find((obj) => {
    return obj.name === name;
  });

  // Change the copy then insert it back
  const expensesCopy = peopleObj.expenses.slice(0);
  expensesCopy[index] = value;
  peopleObj.expenses = expensesCopy;

  // Change the rest of the price according to checkboxes
  const checkedNames = Array.from(
    ev.target.parentNode.parentNode.querySelectorAll("input[checked]")
  ).map((e) => e.getAttribute("name"));
  const checkedNamesObjs = state.people.friends.filter((friend) =>
    checkedNames.includes(friend.name)
  );
  checkedNamesObjs.forEach(
    (e) => (e.expenses[index] = state.expense.prices[index] / checkedBoxesLen)
  );

  // Find new total price that the friend has to pay
  state.people.friends.forEach((e) => {
    const totalPrice = e.expenses.reduce((acc, cur) => acc + cur);
    e.total = totalPrice;
  });
};

const genExpenseArr = () => {
  const expenseArr = [];
  const expenseArrArr = state.people.friends.map((e) => e.expenses);
  for (let i = 0; i < expenseArrArr[0].length; i++) {
    const expenseArrCol = expenseArrArr.map((e) => e[i]);
    expenseArr.push(expenseArrCol);
  }
  return expenseArr.flat();
};

const renderBox = () => {
  // Use this syntax to avoid removing all child nodes
  /* ev.target.parentNode.childNodes[1].textContent = value; */

  // Generate expense array to be rendered
  const renExpenseArr = genExpenseArr();

  // Change text of td tags with checkboxes
  const checkBoxes = Array.from(
    document.querySelectorAll("input[type=checkbox]")
  );
  checkBoxes.forEach((e, i) => {
    e.parentNode.childNodes[1].textContent = renExpenseArr[i];
  });

  // Change text of td tags with red color (total of individuals)
  // Select all td tags with red color
  const lastRowLen = document.querySelector("[style~=red]").childNodes.length;
  // Slice out nodes that are not td
  const tdLastRow = Array.from(
    document.querySelectorAll("[style~=red]")[0].childNodes
  ).slice(3, lastRowLen - 2);

  // select all totals of all individuals
  const allIn = state.people.friends.map((e) => e.total);

  tdLastRow.forEach((e, index) => (e.textContent = allIn[index]));
};
