const updateResourceCards = function(resources, devCardsCount) {
  document.getElementById('dev-count').innerHTML = devCardsCount;
  for (const resource in resources) {
    const id = `#${resource}-count`;
    document.querySelector(id).innerHTML = resources[resource];
  }
};

const fetchCardsCount = async function() {
  const res = await fetch('/cardsCount');
  const body = await res.json();
  const { resources, totalDevCards } = await body;
  updateResourceCards(resources, totalDevCards);
};

const updateDicePhase = function(num1, num2) {
  const firstDice = document.querySelector('#dice1 img');
  const secondDice = document.querySelector('#dice2 img');
  firstDice.src = `./assets/dice/${num1}.jpg`;
  secondDice.src = `./assets/dice/${num2}.jpg`;
};

const getResources = async function(dice1, dice2) {
  const reqText = JSON.stringify({ numToken: dice1 + dice2 });
  const res = await fetch('/getResources', {
    method: 'POST',
    body: reqText,
    headers: { 'Content-Type': 'application/json' }
  });
  const body = await res.json();
  const { resources, totalDevCards } = await body;
  return { resources, totalDevCards };
};

const getBuildStatus = async function() {
  const res = await fetch('/buildStatus');
  if (res.ok) {
    const { settlement } = await res.json();
    if (settlement) {
      document.getElementById('settlement').classList.remove('disabledUnit');
      return;
    }
    document.getElementById('settlement').classList.add('disabledUnit');
  }
};

const showDicePhase = async function() {
  const res = await fetch('/diceNumbers');
  const body = await res.json();
  const { dice1, dice2 } = await body;
  updateDicePhase(dice1, dice2);
  const { resources, totalDevCards } = await getResources(dice1, dice2);
  updateResourceCards(resources, totalDevCards);
  getBankStatus();
  getBuildStatus();
};
