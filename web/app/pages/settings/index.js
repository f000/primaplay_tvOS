import ATV from 'atvjs'
import template from './template.hbs'

import LoginScreen from './loginScreen.js'
import DeviceScreen from './deviceScreen.js'

import API from 'lib/prima.js'
const _ = ATV._
let isPremium = false

const SettingsPage = ATV.Page.create({
  name: 'settings',
  template: template,
  ready (options, resolve, reject) {
    if (_.isUndefined(ATV.Settings.get('password'))) {
      resolve(template)
    } else {
      // let login = ATV.Ajax
      //   .post(API.url.token, API.xhrOptions({
      //     grant_type: 'password',
      //     password: options.pass,
      //     username: options.username
      //   }))

      try {
        API.loginAndGetRefreshToken()
      }
      catch (ex) {
        console.log(ex)
      }
      let isDeviceRegistered = !_.isEmpty(ATV.Settings.get('slotID'));
      let deviceName = ATV.Settings.get('deviceName');

      let getUserInfo = ATV.Ajax.get(API.url.profile, API.primaGet())

      Promise
        .all([getUserInfo])
        .then((xhrs) => {
          let response = xhrs[0].response
          console.log(response)

          isPremium = (response.level.localeCompare('PREMIUM') === 0);
          let premiumInfo = {}
          if (isPremium) {
            premiumInfo.deviceRegistrationDesc = (isDeviceRegistered ? "Registrováno" + (deviceName ? ` (${deviceName})` : "") : "Neregistrováno");
          }

          resolve({
            response,
            premium: premiumInfo
          })
        }, (xhr) => {
          // error
          resolve(template) // we need to resolve the template even here - login might be failing
          //let response = xhr.response
          //ATV.Navigation.showError({
          //  data: {
          //    title: 'Chyba',
          //    message: response.userMessage
          //  },
          //  type: 'modal'
          //})
        })
    }
  },
  onSelect: function (e) {
    let element = e.target
    let elementType = element.nodeName.toLowerCase()
  },
  afterReady (doc) {
    const beginLogin = () => {
      ATV.Navigation.navigate('login')
    }

    const backToMenu = () => {
      ATV.Navigation.navigateToMenuPage()
    }

    const registerDevice = () => {
      ATV.Navigation.navigate('device')
    }

    doc
      .getElementById('login')
      .addEventListener('select', beginLogin)

    doc
      .getElementById('menu')
      .addEventListener('select', backToMenu)

    if (isPremium) {
      doc
        .getElementById('device')
        .addEventListener('select', registerDevice)
    }
  }
})

export default SettingsPage
