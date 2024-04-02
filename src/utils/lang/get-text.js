import en from './en.js';

export default (lang, key) => {
  if (lang == 'tr') {
    return tr[key];
  } else {
    return en[key];
  }
};
