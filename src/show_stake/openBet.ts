import {
  awaiter,
  log,
  repeatingOpenBet,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import { maximumStakeReady } from '../stake_info/getMaximumStake';
import getParameter from '../stake_info/getParameter';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';
import findOutcome from './helpers/findOutcome';
import getDispatch from './helpers/getDispatch';

const openBet = async (): Promise<void> => {
  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  const dispatch = getDispatch();
  if (!dispatch) {
    throw new JsFailError('Не удалось найти диспетчер');
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
    throw new JsFailError('Не удалось получить информацию о линии');
  }

  const eventLineJson = await eventLine.json();
  if (!eventLineJson || !eventLineJson.result) {
    throw new JsFailError('Не удалось обработать информацию о линии');
  }

  const eventData = eventLineJson.result;

  const betObject = findOutcome(eventData);
  if (!betObject) {
    throw new JsFailError('Ставка не найдена');
  }

  // Открытие ставки, проверка, что ставка попала в купон
  const openingAction = async () => {
    dispatch({
      type: '@@betslip/ADD_BET',
      bet: {
        base: betObject.adValue,
        comment: betObject.eventComment,
        eventId: betObject.eventId,
        eventType: betObject.eventType,
        factorId: betObject.facId,
        gameId: betObject.eventGameId,
        group: betObject.partTitle,
        id: betObject.id,
        locked: betObject.locked,
        marketId: betObject.marketId,
        // marketType: betObject.marketType,
        name: betObject.title,
        odd: betObject.value,
        outcomeKey: betObject.outcomeKey,
        partName: betObject.partName,
        teams: betObject.eventTeam,
        topicId: betObject.topicId,
        type: betObject.marketTitle,
      },
    });
  };
  await repeatingOpenBet(openingAction, getStakeCount, 5, 1000, 50);

  const maximumLoaded = await maximumStakeReady();
  if (!maximumLoaded) {
    throw new JsFailError('Максимум не появился');
  }
  log('Максимум появился', 'cadetblue', true);

  const { param } = JSON.parse(worker.ForkObj);
  if (typeof param !== 'undefined') {
    log('Ждём появления параметра', 'cadetblue', true);
    const parameterLoaded = await awaiter(() => {
      return getParameter() !== -6666;
    });
    if (!parameterLoaded) {
      throw new JsFailError('Параметр не появился');
    }
    log('Параметр появился', 'cadetblue', true);
  }

  const eventNameSelector = '[class*="bet__teams-"]';
  const marketNameSelector =
    '[class*="bet__info-top"] [class*="bet__label_outcome-title-"]';
  const betNameSelector =
    '[class*="bet__info"]:not([class*="bet__info-top"]) [class*="bet__wrapper"]';

  const eventNameElement = document.querySelector(eventNameSelector);
  const marketNameElement = document.querySelector(marketNameSelector);
  const betNameElement = document.querySelector(betNameSelector);

  if (!eventNameElement) {
    throw new JsFailError('Не найдено событие открытой ставки');
  }
  if (!marketNameElement) {
    throw new JsFailError('Не найден маркет открытой ставки');
  }
  if (!betNameElement) {
    throw new JsFailError('Не найдена роспись открытой ставки');
  }

  const eventName = text(eventNameElement);
  const marketName = text(marketNameElement);
  const betName = text(betNameElement);

  log(`Открыта ставка\n${eventName}\n${marketName}\n${betName}`, 'steelblue');
};

export default openBet;
