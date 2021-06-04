import { getElement } from '@kot-shrodingera-team/germes-utils';

const preOpenBet = async (): Promise<void> => {
  await getElement('.betslip_mode_default');
  await getElement('#app > div');
};

export default preOpenBet;
