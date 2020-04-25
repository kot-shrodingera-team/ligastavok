import '../queryTemplateSelectors';
import { getElement, awaiter } from '@kot-shrodingera-team/config//util';

const getBalanceStaked = async (): Promise<number> => {
  const [accountMenu] = document.queryClassTemplateSelector(
    'auth-panel__personal-area-name'
  ) as HTMLElement[];
  accountMenu.click();
  const myBetsButton = document.querySelector(
    '[href="/PersonalFolder/MyOrders"]'
  ) as HTMLElement;
  myBetsButton.click();
  const myBetsMenu = (await getElement(
    '[data-menu="menuOpenBet"]'
  )) as HTMLElement;
  if (!myBetsMenu) {
    console.log('Не найдена кнопка выбора типа пари');
    return -1;
  }
  myBetsMenu.click();
  const myBetsMenuList = await getElement(
    '[data-menu="menuOpenBet"] ~ .mini-opener__content_entered'
  );
  if (!myBetsMenuList) {
    console.log('Не найден список видов пари');
    return -1;
  }
  const stakedListElement = [...myBetsMenuList.children].find(
    (listElement) => listElement.textContent === 'Ожидающие расчета'
  ) as HTMLElement;
  if (!stakedListElement) {
    console.log('Не найдена опция ожидающих расчёта пари');
    return -1;
  }
  stakedListElement.click();
  await awaiter(
    () => !document.queryClassTemplateSelector('content-loader__circle')[0]
  );
  const [myBetsContainer] = document.queryClassTemplateSelector(
    'my-bets__content-wrapper'
  );
  if (myBetsContainer.textContent === 'По Вашему запросу ничего не найдено') {
    return 0;
  }

  let [lazyLoadButtonsContainer] = document.queryClassTemplateSelector(
    'bui-events-lazy-bar__buttons'
  ) as HTMLElement[];
  while (lazyLoadButtonsContainer) {
    (lazyLoadButtonsContainer.lastChild as HTMLElement).click();
    /* eslint-disable no-await-in-loop, no-loop-func */
    await awaiter(
      () =>
        !lazyLoadButtonsContainer ||
        lazyLoadButtonsContainer.getAttribute('data-pending') === 'false'
    );
    /* eslint-enable no-await-in-loop, no-loop-func */
    [lazyLoadButtonsContainer] = document.queryClassTemplateSelector(
      'bui-events-lazy-bar__buttons'
    ) as HTMLElement[];
  }
  try {
    return [...document.queryClassTemplateSelector('stake__grid_3')].reduce(
      (accumulator, stakeSum): number => {
        // eslint-disable-next-line no-param-reassign
        accumulator += parseFloat(stakeSum.textContent.replace(/ /g, ''));
        return accumulator;
      },
      0
    );
  } catch (e) {
    console.log(`Ошибка подсчёта суммы нерасчитанных ставок - ${e}`);
    return -1;
  }
};

const getLastStakeSum = (): number => {
  // try {
  return 0;
  // } catch (e) {
  //   console.log(`Ошибка получения суммы последней ставки - ${e}`);
  //   return -1;
  // }
};

const getLastStakeCoefficient = (): number => {
  // try {
  return 0;
  // } catch (e) {
  //   console.log(`Ошибка получения коэффициента последней ставки - ${e}`);
  //   return -1;
  // }
};

const sendAnalyticsData = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  sumStaked: number,
  coefficient: number,
  balanceAvailable: number,
  balanceStaked: number
  /* eslint-enable @typescript-eslint/no-unused-vars */
): void => {};

declare const getBalance: () => number;
export default async (): Promise<void> => {
  const sumStaked = getLastStakeSum();
  const coefficient = getLastStakeCoefficient();
  const balanceAvailable = getBalance();
  const balanceStaked = await getBalanceStaked();
  sendAnalyticsData(sumStaked, coefficient, balanceAvailable, balanceStaked);
};
