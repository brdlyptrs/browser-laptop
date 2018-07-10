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

const hCaptchaVars = {
  domain        : 'hcaptcha.com',
  element_id    : 'h-captcha',
  site_key      : 'a86b0ecb-3ff5-4255-aa23-40f86ae4fcb4',
  iframe_title  : 'hCaptcha human verification'
}

let Loaded = false;

// TODO: report when funds are too low
class Captcha extends ImmutableComponent {

  constructor (props) {
    super(props)
    this.getText = this.getText.bind(this)
    this._id = null
    this._response = null
    this._removed = false;
    this.offset = 5
  }

  componentDidMount () {
      if (typeof hcaptcha === 'undefined') {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha element
        let script = CaptchaScript(this.onloadScript.bind(this));
        document.getElementById(hCaptchaVars.element_id).appendChild(script);
      } else {
        this.onloadScript.call(this);
      }
  }

  componentWillUnmount() {
      if (this._removed === false) this.removeFrame()
  }

  preventDefault (event) {
    event.preventDefault()
  }

  submitCaptcha (event) {
    if (typeof hcaptcha === 'undefined') return
    
    this._response = hcaptcha.getResponse(this._id)

    event.preventDefault()
    appActions.onPromotionClaim(this._response)
  }

  closeCaptcha () {
    this.removeFrame();
    appActions.onCaptchaClose()
  }

  errorCaptcha (e) {
    if (typeof hcaptcha === 'undefined') return
    hcaptcha.reset(this._id)
  }

  onloadScript() {
    if (typeof hcaptcha !== undefined) {
      this._id = hcaptcha.render(hCaptchaVars.element_id, 
        {           
          "sitekey"         : hCaptchaVars.site_key, 
          "error-callback"  : this.errorCaptcha.bind(this), 
          "expired-callback": this.errorCaptcha.bind(this), 
          "callback"        : this.submitCaptcha.bind(this) 
        })
    } 
  }

  removeFrame() {
    let nodes = document.body.childNodes //Get top level dom elements
    let foundFrame = false

    let i = nodes.length
    let k, src, title, frames

    while (--i > -1 && foundFrame === false) { //Look for hCaptcha verification iframe appended at document body
      frames = nodes[i].getElementsByTagName('iframe')
      
      if (frames.length > 0) {
        for (k=0; k < frames.length; k++) {
          src = frames[k].getAttribute("src")
          title = frames[k].getAttribute("title")

          if (src.includes(hCaptchaVars.domain) && title.includes(hCaptchaVars.iframe_title)) foundFrame = nodes[i] //Compare iframe source and title to find correct iframe appened to body
        }

      }
    }

    if (foundFrame) {
      document.body.removeChild(foundFrame);
      this._removed = true;
    }
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

    return (
      <div id="captcha" className={css(styles.enabledContent__overlay)} style={{'background': `#ececef`}} >
        <CatpchaClose click={this.closeCaptcha.bind(this)} />      
        <CaptchaText  title={text.title} text={text.text} />
        <div id={hCaptchaVars.element_id}  ></div>
      </div>
    )
  }
}


// Dom Elements
const CaptchaText = (props) => {
  return (
      <p className={css(styles.enabledContent__overlay_title, styles.disableDND)}>
          <span className={css(styles.enabledContent__overlay_bold)} data-l10n-id={props.title} />
          <span data-l10n-id={props.text} />
      </p>
    )
}

const CatpchaClose = (props) => {
  return <div className={css(styles.enabledContent__overlay_close, styles.disableDND)} onClick={props.click}/>
}

const CaptchaScript = (cb) => {
  let script = document.createElement("script")
  
  script.src = "https://hcaptcha.com/1/api.js?render=explicit"
  script.async = true

  script.addEventListener('load', cb, true)

  return script;        
}

// CSS Styles
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
    fontSize: '16px',
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

  disableDND: {
    userSelect: 'none',
    '-webkit-user-drag': 'none'
  }
})

module.exports = Captcha
