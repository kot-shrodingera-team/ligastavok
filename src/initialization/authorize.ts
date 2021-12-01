import authorizeGenerator from '@kot-shrodingera-team/germes-generators/initialization/authorize';
import {
  awaiter,
  getElement,
  getPhoneLoginData,
  log,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { authElementSelector } from '../stake_info/checkAuth';
import { updateBalance, balanceReady } from '../stake_info/getBalance';
// import afterSuccesfulLogin from './afterSuccesfulLogin';

// const preCheck = async (): Promise<boolean> => {
//   return true;
// };

const preInputCheck = async (): Promise<boolean> => {
  const authTabsSelector = '[class*=tab-switcher__name-]';
  const activeTabClassRegex = /^tab-switcher__name_active-/i;

  const phoneLoginData = getPhoneLoginData();
  const targetTabName = phoneLoginData ? 'Номер телефона' : 'E-mail';
  if (phoneLoginData) {
    log('Авторизация по телефону', 'cadetblue', true);
  } else {
    log('Авторизация по E-mail', 'cadetblue', true);
  }
  const authFormTabs = [
    ...document.querySelectorAll<HTMLElement>(authTabsSelector),
  ];
  if (!authFormTabs.length) {
    log('Не найдены кнопки переключения типа логина', 'crimson');
    return false;
  }
  const targetTab = authFormTabs.find((tab) => text(tab) === targetTabName);
  if (!targetTab) {
    log(
      'Не найдена кнопка переключения на авторизацию по нужному типу логина',
      'crimson'
    );
    return false;
  }
  if (
    ![...targetTab.classList].some((tabClass) => {
      return activeTabClassRegex.test(tabClass); // активный это НЕ выбранный !!!
    })
  ) {
    log(
      'Уже переключено на авторизацию по нужному типу логина',
      'cadetblue',
      true
    );
    return true;
  }
  targetTab.click();
  const targetTabActive = await awaiter(
    () => {
      return ![...targetTab.classList].some((tabClass) => {
        return activeTabClassRegex.test(tabClass); // активный это НЕ выбранный !!!
      });
    },
    1000,
    50
  );
  if (!targetTabActive) {
    log('Не удалось переключиться на вкладку нужного типа логина');
  }
  return true;
};

const beforeSubmitCheck = async (): Promise<boolean> => {
  // const recaptchaIFrame = await getElement('iframe[title="reCAPTCHA"]', 1000);
  // if (recaptchaIFrame) {
  //   log('Есть капча. Пытаемся решить', 'orange');
  //   try {
  //     await resolveRecaptcha();
  //   } catch (e) {
  //     if (e instanceof Error) {
  //       log(e.message, 'red');
  //     }
  //     return false;
  //   }
  // } else {
  //   log('Нет капчи', 'steelblue');
  // }
  const enabledSubmitButton = await getElement(
    'form#auth button[type="submit"]:not(disabled)'
  );
  if (!enabledSubmitButton) {
    log('Кнопка входа не стала доступной', 'crimson');
    return false;
  }
  return true;
};

// const afterSubmitCheck = async (): Promise<boolean> => {
//   return true;
// };

const authorize = authorizeGenerator({
  // preCheck,
  openForm: {
    selector: '#header-sign-in',
    openedSelector: 'form#auth',
    beforeOpenDelay: 3000,
    loopCount: 5,
    triesInterval: 1000,
    afterOpenDelay: 2000,
  },
  preInputCheck,
  loginInputSelector: 'input[name="mobilePhone"], input[name="email"]',
  passwordInputSelector: 'input[name="password"]',
  beforePasswordInputDelay: 1000,
  submitButtonSelector: 'form#auth button[type="submit"]',
  inputType: 'react',
  // fireEventNames: ['input'],
  beforeSubmitDelay: 2000,
  beforeSubmitCheck,
  // afterSubmitCheck,
  loginedWait: {
    loginedSelector: authElementSelector,
    timeout: 10000,
    balanceReady,
    updateBalance,
    // afterSuccesfulLogin,
  },
  // context: () => document,
});

export default authorize;
