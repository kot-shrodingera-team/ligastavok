import checkCouponLoadingGenerator from '@kot-shrodingera-team/germes-generators/worker_callbacks/checkCouponLoading';
import {
  log,
  getElement,
  awaiter,
  getRemainingTimeout,
  checkCouponLoadingError,
  checkCouponLoadingSuccess,
  text,
  sendTGBotMessage,
} from '@kot-shrodingera-team/germes-utils';
import { StateMachine } from '@kot-shrodingera-team/germes-utils/stateMachine';

const loaderSelector = '.service-message__icon_loading';
const errorSelector =
  '[class*="betslip__service-message-"][data-type="danger-warning"]';
const betPlacedSelector = '.service-message__icon_done';

const asyncCheck = async () => {
  const machine = new StateMachine();

  machine.promises = {
    loader: () => getElement(loaderSelector, getRemainingTimeout()),
    error: () => getElement(errorSelector, getRemainingTimeout()),
    betPlaced: () => getElement(betPlacedSelector, getRemainingTimeout()),
  };

  machine.setStates({
    start: {
      entry: async () => {
        log('Начало обработки ставки', 'steelblue');
      },
    },
    loader: {
      entry: async () => {
        log('Появился индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = 'индикатор';
        delete machine.promises.loader;
        machine.promises.loaderDissappeared = () =>
          awaiter(
            () => document.querySelector(loaderSelector) === null,
            getRemainingTimeout()
          );
      },
    },
    loaderDissappeared: {
      entry: async () => {
        log('Исчез индикатор', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        delete machine.promises.loaderDissappeared;
      },
    },
    error: {
      entry: async () => {
        log('Появилась ошибка', 'steelblue');
        window.germesData.betProcessingAdditionalInfo = null;
        const errorMessages = [...document.querySelectorAll(errorSelector)];
        errorMessages.forEach((error) => {
          const errorText = text(error);
          log(errorText, 'tomato');
          if (!/^Пари не приняты$/i.test(errorText)) {
            worker.Helper.SendInformedMessage(errorText);
            sendTGBotMessage(
              '1786981726:AAE35XkwJRsuReonfh1X2b8E7k9X4vknC_s',
              126302051,
              errorText
            );
          }
        });
        checkCouponLoadingError({});
      },
      final: true,
    },
    betPlaced: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        const serviceMessageArrow = document.querySelector<HTMLElement>(
          '[class*="service-message__arrow-"]'
        );
        if (!serviceMessageArrow) {
          log(
            'Не найдена кнопка разворачивания информации об успешной ставке',
            'crimson'
          );
        } else {
          serviceMessageArrow.click();
          const resultCoefficientElement = await getElement(
            '[class*="successful-bet-info-"] > span:nth-child(3)'
          );
          if (!resultCoefficientElement) {
            log(
              'Не появился коэффициент в информации об супешной ставке',
              'crimson'
            );
          }
        }
        checkCouponLoadingSuccess('Ставка принята');
      },
      final: true,
    },
    timeout: {
      entry: async () => {
        window.germesData.betProcessingAdditionalInfo = null;
        checkCouponLoadingError({
          botMessage: 'Не дождались результата ставки',
          informMessage: 'Не дождались результата ставки',
        });
      },
      final: true,
    },
  });

  machine.start('start');
};

const checkCouponLoading = checkCouponLoadingGenerator({
  asyncCheck,
});

export default checkCouponLoading;
