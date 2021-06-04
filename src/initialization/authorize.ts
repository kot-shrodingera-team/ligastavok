import authorizeGenerator from '@kot-shrodingera-team/germes-generators/initialization/authorize';
import {
  awaiter,
  getPhoneLoginData,
  log,
  text,
} from '@kot-shrodingera-team/germes-utils';
import { authElementSelector } from '../stake_info/checkAuth';
import { updateBalance, balanceReady } from '../stake_info/getBalance';
// import afterSuccesfulLogin from './afterSuccesfulLogin';

const setLoginType = async (): Promise<boolean> => {
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

const authorize = authorizeGenerator({
  openForm: {
    selector: '#header-sign-in',
    openedSelector: 'form#auth',
    loopCount: 10,
    triesInterval: 1000,
    afterOpenDelay: 0,
  },
  setLoginType,
  loginInputSelector: 'input[name="mobilePhone"], input[name="email"]',
  passwordInputSelector: 'input[name="password"]',
  submitButtonSelector: 'form#auth button[type="submit"]',
  inputType: 'react',
  // fireEventNames: ['input'],
  beforeSubmitDelay: 1000,
  // captchaSelector: '',
  loginedWait: {
    loginedSelector: authElementSelector,
    timeout: 5000,
    balanceReady,
    updateBalance,
    // afterSuccesfulLogin,
  },
  // context: () => document,
});

export default authorize;
