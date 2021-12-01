import {
  // awaiter,
  getElement,
  getWorkerParameter,
  log,
  repeatingOpenBet,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { JsFailError } from '@kot-shrodingera-team/germes-utils/errors';
import { maximumStakeReady } from '../stake_info/getMaximumStake';
// import getParameter from '../stake_info/getParameter';
import getStakeCount from '../stake_info/getStakeCount';
import clearCoupon from './clearCoupon';
import getCoefficient from '../stake_info/getCoefficient';
import findBet from '../helpers/findBet';

const openBet = async (): Promise<void> => {
  /* ======================================================================== */
  /*                              Очистка купона                              */
  /* ======================================================================== */

  const couponCleared = await clearCoupon();
  if (!couponCleared) {
    throw new JsFailError('Не удалось очистить купон');
  }

  /* ======================================================================== */
  /*                               Поиск ставки                               */
  /* ======================================================================== */

  const bet = await findBet();
  if (!bet) {
    throw new JsFailError('Ставка не найдена');
  }

  /* ======================================================================== */
  /*           Открытие ставки, проверка, что ставка попала в купон           */
  /* ======================================================================== */

  const openingAction = async () => {
    bet.click();
  };
  await repeatingOpenBet(openingAction, getStakeCount, 1, 1000, 50);

  /* ======================================================================== */
  /*                            Проверка максимума                            */
  /* ======================================================================== */

  const maximumLoaded = await maximumStakeReady();
  if (!maximumLoaded) {
    throw new JsFailError('Максимум не появился');
  }
  log('Максимум появился', 'cadetblue', true);

  /* ======================================================================== */
  /*                                     ?                                    */
  /* ======================================================================== */

  await getElement(
    '[class*="bet__info"]:not([class*="bet__info-top"]) [class*="bet__wrapper"]'
  );
  // const { param } = JSON.parse(worker.ForkObj);
  // if (typeof param !== 'undefined') {
  //   log('Ждём появления параметра', 'cadetblue', true);
  //   const parameterLoaded = await awaiter(() => {
  //     return getParameter() !== -6666;
  //   });
  //   if (!parameterLoaded) {
  //     throw new JsFailError('Параметр не появился');
  //   }
  //   log('Параметр появился', 'cadetblue', true);
  // }

  /* ======================================================================== */
  /*                    Вывод информации об открытой ставке                   */
  /* ======================================================================== */

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

  /* ======================================================================== */
  /*                           Проверка коэффициента                          */
  /* ======================================================================== */

  const coefficientDropCheck = getWorkerParameter('coefficientDropCheck');
  if (coefficientDropCheck) {
    const currentCoefficient = getCoefficient();
    const { coefficient: forkCoefficient } = JSON.parse(worker.ForkObj);
    if (!forkCoefficient) {
      throw new JsFailError('Не удалось получить коэффициент из вилки');
    }
    log(
      `Коэффициент: ${forkCoefficient} => ${currentCoefficient}`,
      'steelblue'
    );
    if (currentCoefficient < forkCoefficient) {
      throw new JsFailError('Коэффициент упал');
    }
  }
};

export default openBet;
