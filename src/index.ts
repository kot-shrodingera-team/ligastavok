import './queryTemplateSelectors';
// import { pipeHwlToConsole, domLoaded } from './util';
import { pipeHwlToConsole, domLoaded } from '@kot-shrodingera-team/config/util';
import { getStakeInfo } from './callbacks/getStakeInfo';
import setStakeSum from './callbacks/setStakeSum';
import doStake from './callbacks/doStake';
import checkCuponLoading from './callbacks/checkCouponLoading';
import checkStakeStatus from './callbacks/checkStakeStatus';
import authorize from './authorize';
import showStake from './showStake';

pipeHwlToConsole();
// import afterSuccesfulStake from './afterSuccesfulStake';
const HWL = worker.Helper.WriteLine;

const FastLoad = async (): Promise<void> => {
  // Не знаю, что это за проверка
  // if (document.querySelector('[class*="application__failed-connect"]')) {
  //   worker.Helper.LoadUrl(worker.EventUrl);
  //   return;
  // }
  HWL('Быстрая загрузка');
  await showStake();
};

worker.SetCallBacks(
  console.log,
  getStakeInfo,
  setStakeSum,
  doStake,
  checkCuponLoading,
  checkStakeStatus
);
worker.SetFastCallback(FastLoad);

(async (): Promise<void> => {
  HWL('Начали');
  await domLoaded();
  if (
    document
      .querySelector('body')
      .textContent.includes('ERR_CONNECTION_TIMED_OUT')
  ) {
    HWL('На Лиге Ставок необходимо сменить прокси');
    worker.Helper.SendInformedMessage(
      'На Лиге Ставок необходимо сменить прокси'
    );
  } else if (!worker.IsShowStake) {
    authorize();
  } else {
    showStake();
  }
})();
