import showStakeGenerator from '@kot-shrodingera-team/germes-generators/show_stake';
import { clearGermesData } from '../bookmakerApi';
import openBet from './openBet';
import openEvent from './openEvent';
import preOpenBet from './preOpenBet';
import preOpenEvent from './preOpenEvent';
import setBetAcceptMode from './setBetAcceptMode';

const showStake = showStakeGenerator({
  clearGermesData,
  preOpenEvent,
  openEvent,
  preOpenBet,
  openBet,
  setBetAcceptMode,
});

export default showStake;
