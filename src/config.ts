export const environment = {
  basUrlV1: 'https://ecommerce.routemisr.com/api/v1',
  basUrlV2: 'https://ecommerce.routemisr.com/api/v2',
  // Where the payment provider sends the user back after card checkout
  url: window.location.origin + window.location.pathname.replace(/\/$/, '') + '/#',
};
