import {DARK_MODE} from '../core/services/theme-service';

const modules = [];

angular
  .module('graphdb.framework.help.webapi', modules)
  .controller('WebapiCtrl', WebapiCtrl);

WebapiCtrl.$inject = ['ThemeService'];

function WebapiCtrl(ThemeService) {
  const iframe = document.querySelector('iframe');

  iframe.addEventListener('load', () => {
    const appliedTheme = ThemeService.getAppliedTheme();
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (appliedTheme === DARK_MODE) {
      doc.documentElement.classList.add(DARK_MODE);
    } else {
      doc.documentElement.classList.remove(DARK_MODE);
    }
  });
}
