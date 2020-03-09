const { assert } = require('chai');
const { Player } = require('../../src/models/player');

describe('Player', () => {
  describe('cardsCount', () => {
    it('should give card count of the player', () => {
      const player = new Player();
      const expected = {
        resources: {
          ore: 0,
          wool: 0,
          lumber: 0,
          brick: 0,
          grain: 0
        },
        devCards: {
          knight: 0,
          yearOfPlenty: 0,
          roadBuilding: 0,
          monoPoly: 0
        },
        totalDevCards: 0
      };
      assert.deepStrictEqual(player.cardsCount(), expected);
    });
  });

  describe('addResources', () => {
    it('should add given resources to existing resources and return true for valid resources', () => {
      const player = new Player();
      assert.isTrue(player.addResources({ resource: 'wool', count: 2 }));
    });

    it('should not add given resources if given resources is undefined', () => {
      const player = new Player();
      assert.isFalse(player.addResources());
    });

    it('should not add given resources if given resources is not valid', () => {
      const player = new Player();
      assert.isFalse(player.addResources('wrong'));
    });
  });

  describe('getMatchingTerrains', function() {
    const selectedTerrains = {
      // eslint-disable-next-line id-length
      a: { noToken: 9, resource: 'fields' },
      // eslint-disable-next-line id-length
      b: { noToken: 8, resource: 'forest' }
    };
    it('should find no terrain when no settlements are their', () => {
      const player = new Player();
      assert.deepStrictEqual(player.getMatchingTerrains(selectedTerrains), []);
    });
    it('should find terrains which matches the given terrain', () => {
      const player = new Player();
      player.addSettlement('ab');
      player.addSettlement('jk');
      const expected = ['a', 'b'];
      assert.deepStrictEqual(
        player.getMatchingTerrains(selectedTerrains),
        expected
      );
    });
  });

  describe('canBuildSettlement', () => {
    it('should give true if player has resources to build settlement', () => {
      const player = new Player();
      player.addResources({ resource: 'wool', count: 2 });
      player.addResources({ resource: 'brick', count: 2 });
      player.addResources({ resource: 'lumber', count: 2 });
      player.addResources({ resource: 'grain', count: 2 });
      assert.isTrue(player.canBuildSettlement());
    });

    it('should give false if player has resources to build settlement', () => {
      const player = new Player();
      player.addResources({ resource: 'wool', count: 2 });
      player.addResources({ resource: 'brick', count: 2 });
      player.addResources({ resource: 'lumber', count: 2 });
      assert.isFalse(player.canBuildSettlement());
    });
  });
});
