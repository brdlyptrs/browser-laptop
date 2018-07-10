/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const React = require('react')
const {StyleSheet, css} = require('aphrodite/no-important')

// Components
const ImmutableComponent = require('../../immutableComponent')

// Actions
const appActions = require('../../../../../js/actions/appActions')

// Constants
const promotionStatuses = require('../../../../common/constants/promotionStatuses')

// Styles
const closeButton = require('../../../../../img/toolbar/stoploading_btn.svg')
const dragIcon = require('../../../../extensions/brave/img/ledger/BAT_captcha_dragicon.png')
const arrowIcon = require('../../../../extensions/brave/img/ledger/BAT_captcha_BG_arrow.png')

// Utils
const isWindows = require('../../../../common/lib/platformUtil').isWindows()



// TODO: report when funds are too low
class Captcha extends ImmutableComponent {
  constructor (props) {
    super(props)
    this.getText = this.getText.bind(this)
    this.captchaBox = null
    this.offset = 5
  }

  componentDidMount () {
        const script = document.createElement("script")
        
        script.src = "https://hcaptcha.com/1/api.js"
        script.async = true

        document.getElementById('captcha').appendChild(script);
    }

  onSubmit (event) {
    event.preventDefault()
    appActions.onPromotionClaim()
  }

  preventDefault (event) {
    event.preventDefault()
  }

  closeCaptcha () {
    appActions.onCaptchaClose()
  }

  getText () {
    if (this.props.promo.get('promotionStatus') === promotionStatuses.CAPTCHA_ERROR) {
      return {
        title: 'promotionCaptchaErrorTitle',
        text: 'promotionCaptchaErrorText'
      }
    }

    return {
      title: 'promotionCaptchaTitle',
      text: 'promotionCaptchaText'
    }
  }

  render () {
    const text = this.getText()

    return <div id="captcha" className={css(styles.enabledContent__overlay)} style={{'background': `#f3f3f3`}} >
        <div draggable='false' className={css(styles.enabledContent__overlay_close, styles.disableDND)} onClick={this.closeCaptcha}/>
          <form onClick={this.onSubmit}>
          <div className="h-captcha" data-sitekey="a86b0ecb-3ff5-4255-aa23-40f86ae4fcb4"></div>
          <input type="submit" value="Submit"/>
          </form>
    </div>
  }
}



const styles = StyleSheet.create({
  enabledContent__overlay: {
    position: 'absolute',
    zIndex: 3,
    top: 0,
    left: 0,
    width: '805px',
    height: '180px',
    padding: '20px',
    background: '#f3f3f3',
    borderRadius: '8px',
    boxSizing: 'border-box',
    boxShadow: '4px 6px 3px #dadada'
  },

  enabledContent__overlay_close: {
    position: 'absolute',
    right: '15px',
    top: '15px',
    height: '15px',
    width: '15px',
    cursor: 'pointer',
    zIndex: 3,

    background: `url(${closeButton}) center no-repeat`,
    backgroundSize: `15px`,

    ':focus': {
      outline: 'none'
    }
  },

  enabledContent__overlay_title: {
    color: '#5f5f5f',
    fontSize: '20px',
    display: 'block',
    marginBottom: '10px'
  },

  enabledContent__overlay_bold: {
    color: '#ff5500',
    paddingRight: '5px'
  },

  enabledContent__overlay_text: {
    fontSize: '16px',
    color: '#828282',
    maxWidth: '700px',
    lineHeight: '25px',
    padding: '5px 5px 5px 0',
    marginTop: '10px'
  },

  enabledContent__captcha__wrap: {
    display: 'flex'
  },

  enabledContent__captcha__drop: {
    position: 'absolute',
    width: '400px',
    height: '180px',
    top: 0,
    right: 0,
    zIndex: 2,
    display: 'block'
  },

  enabledContent__captcha__arrow: {
    height: '62px',
    flexBasis: '185px',
    margin: '10px 0 0 -40px',
    position: 'relative',
    zIndex: '1'
  },

  enabledContent__captcha__image: {
    flexBasis: '66px',
    height: '62px',
    marginTop: '10px',
    position: 'relative',
    zIndex: '2',
    cursor: 'pointer'
  },

  disableDND: {
    userSelect: 'none',
    '-webkit-user-drag': 'none'
  }
})

module.exports = Captcha
