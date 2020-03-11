const {Player} = require('./player');
const {Board} = require('./board');
const {Bank} = require('./bank');
const {Turn} = require('./turn');

const productions = {
  fields: 'grain',
  forest: 'lumber',
  hills: 'brick',
  pasture: 'wool',
  mountains: 'ore'
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

const isIntersectionIncluded = (path, intersection) => {
  return path.split('-').includes(intersection);
};

const isRoadIncluded = (path, road) => {
  return path.split('-').some(isIntersectionIncluded.bind(null, road));
};

class Game {
  constructor() {
    this.board = new Board();
    this.bank = new Bank();
    this.player = new Player();
    this.players = {};
    this.isStarted = false;
    this.availableColors = ['blue', 'red', 'green', 'orange'];
  }

  static initializeGame() {
    const game = new Game();
    return game;
  }

  cardsCount() {
    return this.player.cardsCount();
  }

  generateNewPlayerId() {
    let [lastId] = Object.keys(this.players)
      .sort()
      .reverse();
    return ++lastId || 1;
  }

  addPlayer(name) {
    const color = this.availableColors.shift();
    const id = this.generateNewPlayerId();
    this.players[id] = new Player(name, color);
    this.start();
    return id;
  }

  getBoardData() {
    return {
      terrainsInfo: this.board.getTerrains(),
      settlements: this.player.getSettlements(),
      roads: this.player.getRoads()
    };
  }

  getAvailableSettlements() {
    return this.board.getAvailableSettlements();
  }

  resourceProduction(numToken) {
    if (numToken) {
      const terrains = this.board.getTerrains();
      const selectedTerrains = pickTerrains(terrains, numToken);
      for (const player in this.players) {
        const terrainsId = this.players[player].getTerrainsId();
        const resourceId = terrainsId.filter(id => {
          return selectedTerrains.includes(id);
        });
        const resourceCards = resourceId.map(id => {
          const resourceId = this.board.getResource(id);
          return {resource: productions[resourceId], count: 1};
        });
        this.distribute(this.players[player], resourceCards);
      }
      return true;
    }
    return false;
  }

  distribute(player, resourceCards) {
    resourceCards.forEach(card => {
      if (this.bank.remove(card)) {
        player.addResources(card);
      }
    });
  }

  bankStatus() {
    return this.bank.status;
  }

  buildInitialSettlement(intersection, playerId) {
    this.board.buildSettlement(intersection);
    this.players[playerId].addSettlement(intersection);
  }

  buildSettlement(intersection, playerId) {
    const player = this.players[playerId];
    if (player.deductCardsForSettlement(intersection)) {
      player.addSettlement(intersection);
      this.board.buildSettlement(intersection);
      this.bank.add({grain: 1, lumber: 1, brick: 1, wool: 1});
      return true;
    }
    return false;
  }

  addResourcesToPlayer(playerId) {
    const terrains = this.board.getTerrains();
    const player = this.players[playerId];
    const tokenIds = player.getLastSettlementTerrains();
    const resourceCards = tokenIds.reduce((resourceCards, tokenId) => {
      if (terrains[tokenId]) {
        const terrain = terrains[tokenId].resource;
        resourceCards.push({resource: productions[terrain], count: 1});
      }
      return resourceCards;
    }, []);
    this.distribute(player, resourceCards);
  }

  addRoad(pathId) {
    if (pathId) {
      const isRoadAddedToBoard = this.board.addRoad(pathId);
      const isRoadAddedToPlayer = this.player.addRoad(pathId);
      return isRoadAddedToBoard && isRoadAddedToPlayer;
    }
    return false;
  }

  possiblePathsForSetup() {
    const settlement = this.player.settlements.slice().pop();
    const possiblePositionsForRoad = this.board.getEmptyPaths();
    const possiblePositionsToBuildRoad = possiblePositionsForRoad.filter(
      position => {
        return position
          .split('-')
          .some(intersection => settlement === intersection);
      }
    );
    return possiblePositionsToBuildRoad;
  }

  possiblePaths() {
    const paths = this.board.getEmptyPaths();
    const roads = this.player.getRoads();
    const settlements = this.player.getSettlements();
    const possiblePaths = paths.filter(path => {
      const isPathConnectedToRoad = roads.some(isRoadIncluded.bind(null, path));
      const isPathConnectedToSettlement = settlements.some(settlement => {
        return isIntersectionIncluded(path, settlement);
      });
      return isPathConnectedToRoad || isPathConnectedToSettlement;
    });
    return possiblePaths;
  }

  canBuild() {
    const canBuildSettlement = this.player.canBuildSettlement();
    const canBuildRoad = this.player.canBuildRoad();
    const havePositionsToBuildSettlements =
      this.getAvailableAdjSettlements().length > 0;
    return {
      settlement: canBuildSettlement && havePositionsToBuildSettlements,
      road: canBuildRoad
    };
  }

  getAvailableAdjSettlements() {
    const settlements = this.getAvailableSettlements();
    const roads = this.player.getRoads();
    let adjSettlements = settlements.filter(settlement => {
      return roads.some(road => road.split('-').includes(settlement));
    });
    adjSettlements = new Set(adjSettlements);
    return Array.from(adjSettlements);
  }

  addRoadWithResources(pathId) {
    this.board.addRoad(pathId);
    this.player.addRoad(pathId);
    const isDeducted = this.player.deductCardsForRoad(pathId);
    if (isDeducted) {
      this.bank.add({lumber: 1, brick: 1});
    }
  }

  start() {
    const playerIds = Object.keys(this.players);
    if (playerIds.length === 4) {
      this.turn = new Turn(playerIds);
      this.isStarted = true;
    }
    return this.isStarted;
  }

  hasStarted() {
    return this.isStarted;
  }

  getPlayerDetails() {
    const details = {};
    Object.keys(this.players).forEach(player => {
      details[this.players[player].color] = this.players[player].name;
    });
    return details;
  }
}

module.exports = {Game};
