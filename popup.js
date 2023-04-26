const button = document.getElementById('button');
button.innerHTML = 'calculate';
document.getElementById('result').textContent = 0;

function reverseElements(selector) {
  const container = document.querySelector(selector);
  const childNodesArray = Array.from(container.childNodes).reverse();

  childNodesArray.forEach((childNode) => {
    container.appendChild(childNode);
  });
}

const fillList = (c, selectedDate, ourObject) => {
  let sel = document.getElementById('urlist');
  sel.innerHTML = ''; // Effacer les options précédentes

  for (let i in c) {
    let hasDataForSelectedDate = ourObject.some(
      (obj) => obj.url === c[i] && obj.date === selectedDate
    );

    if (hasDataForSelectedDate) {
      let opt = document.createElement('option');
      opt.innerHTML = c[i];
      opt.value = c[i];
      sel.appendChild(opt);
    }
  }
  reverseElements('#urlist');
};

chrome.storage.local.get().then((result) => {
  console.log('result', result);

  let ourObject = [];
  let keys = Object.keys(result);
  let values = Object.values(result);
  let date = [];
  let url = [];
  let url2 = [];

  for (let i = 0; i < keys.length; i++) {
    let cool = keys[i].split(':');
    let hours = Math.floor(values[i] / 3600);
    let minutes = Math.floor((values[i] % 3600) / 60);

    ourObject.push({
      url: cool[0],
      time: values[i],
      hours: hours,
      minutes: minutes,
      seconds: values[i] % 60,
      date: cool[1],
    });

    date.push(cool[1]);

    if (!url2.includes(cool[0])) {
      url.push(cool[0]);
      url2.push(cool[0]);
    }
  }

  console.log(ourObject);

  let sel = document.getElementById('date');
  let date2 = [];
  for (let i in date) {
    if (date2.includes(date[i]) == false) {
      date2.push(date[i]);
      let opt = document.createElement('option');
      opt.innerHTML = date[i];
      opt.value = date[i];
      sel.appendChild(opt);
    }
  }
  reverseElements('#date');
  let initialSelectedDate = document.getElementById('date').options[0]?.value;
  fillList(url, initialSelectedDate, ourObject);

  let list = document.getElementById('urlist');
  let selDate = document.getElementById('date');

  selDate.addEventListener('change', () => {
    let selectedDate = selDate.options[selDate.selectedIndex].value;
    fillList(url, selectedDate, ourObject);
  });

  button.onclick = () => {
    document.getElementById('result').textContent = 'No data on this day';
    let selectedValue = list.options[list.selectedIndex]?.value;
    let selectedDate = selDate.options[selDate.selectedIndex].value;

    for (let i = 0; i < ourObject.length; i++) {
      if (
        selectedValue == ourObject[i].url &&
        selectedDate == ourObject[i].date
      ) {
        document.getElementById('result').textContent =
          ourObject[i].hours +
          ' hours ' +
          ourObject[i].minutes +
          ' minutes ' +
          ourObject[i].seconds +
          ' seconds';
      }
    }
  };
});

function getTotalTimeByDomain(ourObject) {
  const totalTimeByDomain = {};

  for (let i = 0; i < ourObject.length; i++) {
    const { url, time } = ourObject[i];

    if (totalTimeByDomain[url]) {
      totalTimeByDomain[url] += time;
    } else {
      totalTimeByDomain[url] = time;
    }
  }

  return totalTimeByDomain;
}

const showTotalButton = document.getElementById('showTotal');
const totalResultsDiv = document.getElementById('totalResults');

showTotalButton.onclick = () => {
  const totalTimeByDomain = getTotalTimeByDomain(ourObject);
  let resultsHTML = '';

  for (const [domain, totalTime] of Object.entries(totalTimeByDomain)) {
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const seconds = totalTime % 60;

    resultsHTML += `${domain}: ${hours} hours ${minutes} minutes ${seconds} seconds<br>`;
  }

  totalResultsDiv.innerHTML = resultsHTML;
};

let instead = document.getElementById('instead');