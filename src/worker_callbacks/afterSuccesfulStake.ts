import getStakeInfoValueGenerator from '@kot-shrodingera-team/germes-generators/stake_info/getStakeInfoValue';
import { StakeInfoValueOptions } from '@kot-shrodingera-team/germes-generators/stake_info/types';
import { getWorkerParameter, log } from '@kot-shrodingera-team/germes-utils';
// import getCoefficient from '../stake_info/getCoefficient';

export const resultCoefficientSelector =
  '[class*="successful-bet-info-"] > span:nth-child(3)';

const resultCoefficientOptions: StakeInfoValueOptions = {
  name: 'coefficient',
  // fixedValue: () => 0,
  valueFromText: {
    text: {
      // getText: () => '',
      selector: resultCoefficientSelector,
      // context: () => document,
    },
    replaceDataArray: [
      {
        searchValue: ',',
        replaceValue: '.',
      },
    ],
    // removeRegex: /[\s,']/g,
    // matchRegex: /(\d+(?:\.\d+)?)/,
    errorValue: 0,
  },
  // zeroValues: [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // modifyValue: (value: number, extractType: string) => value,
  // disableLog: false,
};

const getResultCoefficient = getStakeInfoValueGenerator(
  resultCoefficientOptions
);

// const getResultCoefficient = getCoefficient;

const afterSuccesfulStake = (): void => {
  if (getWorkerParameter('fakeDoStake')) {
    return;
  }
  log('Обновление итогового коэффициента', 'steelblue');
  const resultCoefficient = getResultCoefficient();
  if (!resultCoefficient) {
    return;
  }
  if (resultCoefficient !== worker.StakeInfo.Coef) {
    log(
      `Коеффициент изменился: ${worker.StakeInfo.Coef} => ${resultCoefficient}`,
      'orange'
    );
    worker.StakeInfo.Coef = resultCoefficient;
    return;
  }
  log('Коеффициент не изменился', 'lightblue');
};

export default afterSuccesfulStake;
