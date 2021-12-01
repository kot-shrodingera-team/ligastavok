import { awaiter, getElement, log } from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import { getReactInstance } from '@kot-shrodingera-team/germes-utils/reactUtils';

interface OutcomeReactInstance {
  return: {
    return: {
      pendingProps: {
        id: number;
        facId: number;
        marketId: string;

        marketTitle: string;
        title: string;
      };
    };
  };
}

const findBet = async (): Promise<HTMLElement> => {
  const anyBet = await getElement('[class*="bui-outcome-"]');
  if (!anyBet) {
    throw new JsFailError('Не найдено ни одной ставки');
  }

  const anyBetData = await awaiter(() => {
    const reactInstance = <OutcomeReactInstance>getReactInstance(anyBet);
    return (
      reactInstance &&
      reactInstance.return &&
      reactInstance.return.return &&
      reactInstance.return.return.pendingProps
    );
  });
  if (!anyBetData) {
    throw new JsFailError('Не появились данные о ставке');
  }

  const {
    // marketId,
    factorId: id,
    // factor_facId: facId,
  } = JSON.parse(worker.BetId);

  const bets = [
    ...document.querySelectorAll<HTMLElement>('[class*="bui-outcome-"]'),
  ];
  log(`Найдено ставок: ${bets.length}`, 'cadetblue', true);

  const targetBets = bets.filter((bet) => {
    const reactInstance = <OutcomeReactInstance>getReactInstance(bet);
    if (
      !reactInstance ||
      !reactInstance.return ||
      !reactInstance.return.return ||
      !reactInstance.return.return.pendingProps
    ) {
      log('Не удалось найти данные о ставке', 'crimson');
      return false;
    }
    const outcomeData = reactInstance.return.return.pendingProps;
    log(
      `${outcomeData.marketTitle}: ${outcomeData.title} [${outcomeData.id}]`,
      'white',
      true
    );
    return outcomeData.id === id;
  });

  if (targetBets.length > 1) {
    throw new JsFailError('Найдено больше одной подходящей ставки');
  }

  if (targetBets.length === 0) {
    throw new JsFailError('Нет подходящей ставки');
  }

  return targetBets[0];
};

export default findBet;
