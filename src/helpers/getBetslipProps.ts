import { getReactInstance } from '@kot-shrodingera-team/germes-utils/reactUtils';

const getBetslipProps = (): BetslipProps => {
  const betslip = document.querySelector('.betslip_mode_default');
  if (!betslip) {
    return null;
  }
  const betslipInstance = getReactInstance(betslip) as BetslipReactInstanse;
  if (
    !betslipInstance ||
    !betslipInstance.return ||
    !betslipInstance.return.memoizedProps
  ) {
    return null;
  }
  return betslipInstance.return.memoizedProps;
};

export default getBetslipProps;
