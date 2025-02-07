let footerElement = document.querySelector("onto-footer");

const setAcceptedUser = (accepted) => {
  setAuthUser(getUser(accepted));
}

const setDevMode = (enabled) => {
  window.wbDevMode = enabled;
}

function getLicense(productType) {
  return {
    productType,
    valid: true,
  };
}

const setLicense = (licenseType) => {
  updateLicense(getLicense(licenseType));
}

const getUser = (acceptedCookiePolicy) => {
  return {
    username: 'user',
    appSettings: {
      COOKIE_CONSENT: {
        policyAccepted: acceptedCookiePolicy,
        statistic: true,
        thirdParty: true,
        updatedAt: 1738066723443
      }
    }
  }
}
