const productions = {
  fields: 'grain',
  forest: 'lumber',
  hills: 'brick',
  pasture: 'wool',
  mountains: 'ore'
};

const getTerrainDetails = function(req, res) {
  const boardData = {
    terrainsInfo: req.app.locals.board.getTerrains(),
    settlements: req.app.locals.player.getSettlements(),
    roads: req.app.locals.player.getRoads()
  };
  res.json(boardData);
};

const getBankStatus = (req, res) => {
  const { bank } = req.app.locals;
  const bankStatus = bank.status;
  res.json(bankStatus);
};

const getCardsCount = function(req, res) {
  const { player } = req.app.locals;
  res.json(player.cardsCount());
};

const getAvailableSettlements = function(req, res) {
  const settlements = req.app.locals.board.getAvailableSettlements();
  res.json(settlements);
};

const randNum = () => Math.ceil(Math.random() * 6);

const getRandomDiceNum = function(req, res) {
  res.json({ dice1: randNum(), dice2: randNum() });
};

const buildSettlement = function(req, res) {
  const { intersection } = req.body;
  const { board, player, bank } = req.app.locals;
  board.buildSettlement(intersection);
  player.addSettlement(intersection);
  player.deductCardsForSettlement(intersection);
  bank.add({ grain: 1, lumber: 1, brick: 1, wool: 1 });
  res.end();
};

const buildInitialSettlement = function(req, res) {
  const { intersection } = req.body;
  const { board, player } = req.app.locals;
  board.buildSettlement(intersection);
  player.addSettlement(intersection);
  res.end();
};

const addResourcesToPlayer = function(req, res) {
  const productions = {
    fields: 'grain',
    forest: 'lumber',
    hills: 'brick',
    pasture: 'wool',
    mountains: 'ore'
  };
  const { board, bank, player } = req.app.locals;
  const terrains = board.getTerrains();
  const settlement = player.settlements.slice().pop();
  const tokenIds = settlement.split('');
  const resourceCards = tokenIds.reduce((resourceCards, tokenId) => {
    if (terrains[tokenId]) {
      const terrain = terrains[tokenId].resource;
      resourceCards.push({ resource: productions[terrain], count: 1 });
    }
    return resourceCards;
  }, []);
  resourceCards.forEach(resourceCard => {
    bank.remove(resourceCard);
    player.addResources(resourceCard);
  });
  res.end();
};

const addRoad = function(req, res) {
  const { board, player } = req.app.locals;
  const { pathId } = req.body;
  board.addRoad(pathId);
  player.addRoad(pathId);
  res.end();
};

const servePossiblePathsForRoadInSetup = (req, res) => {
  const { player, board } = req.app.locals;
  const settlement = player.settlements.slice().pop();
  const possiblePositionsForRoad = board.getEmptyPaths();
  const possiblePositionsToBuildRoad = possiblePositionsForRoad.filter(
    position => {
      return position
        .split('-')
        .some(intersection => settlement === intersection);
    }
  );
  res.json(possiblePositionsToBuildRoad);
};

const updateTransaction = (resourceCards, bank, player) => {
  resourceCards.forEach(resourceCard => {
    bank.remove(resourceCard);
    player.addResources(resourceCard);
  });
};

const servePossiblePathsForRoad = (req, res) => {
  const { player, board } = req.app.locals;
  const settlements = player.getSettlements();
  const remainingPaths = board.getEmptyPaths();
  const possiblePaths = settlements.reduce((possiblePaths, settlement) => {
    const positionsToBuildRoad = remainingPaths.filter(position => {
      return position
        .split('-')
        .some(intersection => settlement === intersection);
    });
    return possiblePaths.concat(positionsToBuildRoad);
  }, []);
  res.json(possiblePaths);
};

const pickTerrains = (terrains, numToken) => {
  const selectedTerrains = [];
  for (const terrain in terrains) {
    if (terrains[terrain]['noToken'] === numToken) {
      selectedTerrains.push(terrain);
    }
  }
  return selectedTerrains;
};

const getResources = function(req, res) {
  const { bank, player, board } = req.app.locals;
  const terrains = board.getTerrains();
  const { numToken } = req.body;
  const selectedTerrains = pickTerrains(terrains, numToken);
  const terrainsId = player.getTerrainsId();
  const resourceId = terrainsId.filter(id => selectedTerrains.includes(id));
  const resourceCards = resourceId.map(id => {
    return { resource: productions[board.getResource(id)], count: 1 };
  });
  updateTransaction(resourceCards, bank, player);
  res.json(player.cardsCount());
};

const getBuildStatus = function(req, res) {
  const { player } = req.app.locals;
  const canBuildSettlement = player.canBuildSettlement();
  res.json({ settlement: canBuildSettlement });
};

module.exports = {
  getTerrainDetails,
  getCardsCount,
  getBankStatus,
  getAvailableSettlements,
  buildSettlement,
  addResourcesToPlayer,
  getRandomDiceNum,
  servePossiblePathsForRoadInSetup,
  addRoad,
  getResources,
  getBuildStatus,
  servePossiblePathsForRoad,
  buildInitialSettlement
};
