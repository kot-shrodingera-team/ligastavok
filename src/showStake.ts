import { getReactInstance } from '@kot-shrodingera-team/config/reactUtils';
import { awaiter, getElement } from '@kot-shrodingera-team/config/util';
import { getStakeCount, checkLogin } from './callbacks/getStakeInfo';
import {
  betslipSelector,
  betslipClearButtonSelector,
  reactRootSelector,
  betslipBetLimitSelector,
} from './selectors';
import { updateBalance } from './authorize';

interface Bet {
  id: string;
  eventId: string;
}

interface BetslipProps {
  bets: Bet[];
}

interface BetslipReactInstanse {
  return: {
    memoizedProps: BetslipProps;
  };
}

interface RootReactInstanse {
  return: {
    pendingProps: {
      value: {
        store: {
          dispatch: Function;
        };
      };
    };
  };
}

interface BetObject {
  eventComment: string;
  eventId: string;
  eventType: string;
  facId: string;
  eventGameId: string;
  partTitle: string;
  id: string;
  locked: string;
  marketId: string;
  marketType: string;
  title: string;
  value: string;
  outcomeKey: string;
  partName: string;
  eventTeam: string;
  topicId: string;
  marketTitle: string;
}

// interface EventData {
//   outcomesTypes: string[];
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   [key: string]: // outcomeType
//   | Array<{
//         [key: string]: Array<{
//           // outcomesTypeMarket
//           [key: string]: Array<{
//             id: string;
//           }>;
//         }>;
//       }>
//     | string[];
// }

const HWL = worker.Helper.WriteLine;

const getBetslipProps = (): BetslipProps => {
  const betslip = document.querySelector(betslipSelector);
  if (!betslip) {
    return null;
  }
  const props = (getReactInstance(betslip) as BetslipReactInstanse).return
    .memoizedProps;
  if (!props) {
    return undefined;
  }
  return props;
};

const checkStakeOpened = (): boolean => {
  if (getStakeCount() === 1) {
    const bet = getBetslipProps().bets[0];
    if (bet.id === worker.BetId && bet.eventId === worker.EventId) {
      return true;
    }
  }
  return false;
};

const findOutcome = (eventData: Record<string, unknown>): BetObject => {
  const outcomesTypes = Object.entries(eventData)
    .filter(([key]) => (eventData.outcomesTypes as string[]).includes(key))
    .map(([, value]) => value);

  const outcomesTypeMarkets = outcomesTypes
    .map((market) => {
      return Object.values(market);
    })
    .flat(1);

  const outcomes = outcomesTypeMarkets.reduce(
    (accumulator: [], market: { outcomes: {} }) => {
      return accumulator.concat(Object.values(market.outcomes));
    },
    []
  ) as BetObject[];

  const outcome = outcomes.find(
    (element) => String(element.id) === worker.BetId
  );
  return outcome;
};

const showStake = async (): Promise<void> => {
  const couponOpenFailed = (message: string): void => {
    HWL(message);
    worker.JSFail();
  };

  await awaiter(
    () => Boolean(document.querySelector(betslipSelector)),
    5000,
    100
  );

  worker.Islogin = checkLogin();
  worker.JSLogined();
  if (!worker.Islogin) {
    couponOpenFailed('Ошибка открытия купона: Нет авторизации');
    return;
  }
  updateBalance();

  if (checkStakeOpened()) {
    HWL('Уже открыт нужный купон');
    worker.JSStop();
    return;
  }
  if (getStakeCount() > 0) {
    HWL('Купон не пуст. Очищаем');
    const clearButton = document.querySelector(
      betslipClearButtonSelector
    ) as HTMLElement;
    if (!clearButton) {
      couponOpenFailed(
        'Ошибка открытия купона: Не найдена кнопка очистки купона'
      );
      return;
    }
    clearButton.click();
    const couponCleared = await awaiter(() => getStakeCount() === 0, 1000, 20);
    if (!couponCleared) {
      couponOpenFailed(
        'Ошибка открытия купона: Не найдена кнопка очистки купона'
      );
      return;
    }
  }
  const { dispatch } = (getReactInstance(
    document.querySelector(reactRootSelector)
  ) as RootReactInstanse).return.pendingProps.value.store;
  if (!dispatch) {
    couponOpenFailed('Ошибка открытия купона: Не удалось найти диспетчер');
    return;
  }
  const eventLine = await fetch(
    'https://lds-api.ligastavok.ru/rest/events/v1/actionLine',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: worker.EventId }),
    }
  );
  if (!eventLine) {
    couponOpenFailed(
      'Ошибка открытия купона: Не удалось получить информацию о линии'
    );
    return;
  }
  const eventData = (await eventLine.json()).result;
  if (!eventData) {
    couponOpenFailed(
      'Ошибка открытия купона: Не удалось обработать информацию о линии'
    );
    return;
  }
  const betObject = findOutcome(eventData);
  if (!betObject) {
    couponOpenFailed('Ошибка открытия купона: Ставка не найдена');
    return;
  }
  HWL('Открываем ставку');
  dispatch({
    type: '@@betslip/ADD_BET',
    bet: {
      base: '0',
      comment: betObject.eventComment,
      eventId: betObject.eventId,
      eventType: betObject.eventType,
      factorId: betObject.facId,
      gameId: betObject.eventGameId,
      group: betObject.partTitle,
      id: betObject.id,
      locked: betObject.locked,
      marketId: betObject.marketId,
      marketType: betObject.marketType,
      name: betObject.title,
      odd: betObject.value,
      outcomeKey: betObject.outcomeKey,
      partName: betObject.partName,
      teams: betObject.eventTeam,
      topicId: betObject.topicId,
      type: betObject.marketTitle,
    },
  });
  const betOpened = await awaiter(() => getStakeCount() === 1, 1000, 20);
  if (!betOpened) {
    couponOpenFailed('Ошибка открытия купона: Ставка не попала в купон');
    return;
  }
  HWL('Ставка успешно открылась. Ждём появления макса');
  const maximumFound = await getElement(
    `${betslipBetLimitSelector}:nth-child(2)`
  );
  // const maximumFound = await awaiter(
  //   () => !Number.isNaN(getMaxStake()),
  //   5000,
  //   50
  // );
  if (!maximumFound) {
    couponOpenFailed('Ошибка открытия купона: Максимум не появился');
    return;
  }
  HWL('Максимум появился');
  worker.JSStop();
};

export default showStake;
