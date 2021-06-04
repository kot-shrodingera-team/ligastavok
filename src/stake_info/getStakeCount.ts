import getStakeCountGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeCount';

const getStakeCount = getStakeCountGenerator({
  stakeSelector: '[class*="betslip__bet-"]',
  // context: () => document,
});

export default getStakeCount;
