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

// Icons
const closeButton = require('../../../../../img/toolbar/stoploading_btn.svg')

// Utils
const isWindows = require('../../../../common/lib/platformUtil').isWindows()

// hCaptcha Config
const hCaptchaVars = {
  domain        : 'hcaptcha.com',
  element_id    : 'h-captcha',
  site_key      : 'a86b0ecb-3ff5-4255-aa23-40f86ae4fcb4',
  iframe_title  : 'hCaptcha human verification'
}


// TODO: report when funds are too low
class Captcha extends ImmutableComponent {

  constructor (props) {
    super(props)

    this.getText         = this.getText.bind(this)
    this.removeFrame     = this.removeFrame.bind(this)
    this.onloadScript    = this.onloadScript.bind(this)
    this.onerrorCaptcha  = this.onerrorCaptcha.bind(this)
    this.onsubmitCaptcha = this.onsubmitCaptcha.bind(this) 
    this.closeCaptcha    = this.closeCaptcha.bind(this) 

    this._id = null
    this._removed = false;
  }

  componentDidMount () { //Once captcha is mounted intialize hCaptcha
      if (typeof hcaptcha === 'undefined') {  //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha element - hCaptcha
        let script = CaptchaScript(this.onloadScript);
        document.getElementById(hCaptchaVars.element_id).appendChild(script);
      } else {
        this.onloadScript();
      }
  }

  componentWillUnmount() { //If captcha gets removed for timeout or error check to make sure iframe is also removed - hCaptcha
      if (this._removed === false) this.removeFrame()
  }

  preventDefault (event) {
    event.preventDefault()
  }

  onsubmitCaptcha (event) {
    if (typeof hcaptcha === 'undefined') return
    
    let token = hcaptcha.getResponse(this._id) //Get response token from hCaptcha widget - hCaptcha

    event.preventDefault()
    appActions.onPromotionClaim(token)
  }

  closeCaptcha () {
    this.removeFrame();
    appActions.onCaptchaClose()
  }

  onerrorCaptcha (e) {
    if (typeof hcaptcha === 'undefined') return
    hcaptcha.reset(this._id) // If hCaptcha runs into error, reset captcha - hCaptcha
  }

  onloadScript() {
    if (typeof hcaptcha !== undefined) { //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
      this._id = hcaptcha.render(hCaptchaVars.element_id, 
        {           
          "sitekey"         : hCaptchaVars.site_key, 
          "error-callback"  : this.onerrorCaptcha, 
          "expired-callback": this.onerrorCaptcha, 
          "callback"        : this.onsubmitCaptcha 
        })
    } 
  }

  removeFrame() {
    let nodes = document.body.childNodes //Get top level dom elements - hCaptcha
    let foundFrame = false

    let i = nodes.length
    let k, src, title, frames

    while (--i > -1 && foundFrame === false) { //Look for hCaptcha verification iframe appended at document body - hCaptcha
      frames = nodes[i].getElementsByTagName('iframe')
      
      if (frames.length > 0) {
        for (k=0; k < frames.length; k++) {
          src = frames[k].getAttribute("src")
          title = frames[k].getAttribute("title")

          if (src.includes(hCaptchaVars.domain) && title.includes(hCaptchaVars.iframe_title)) foundFrame = nodes[i] //Compare iframe source and title to find correct iframe appened to body - hCaptcha
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
        <CatpchaClose click={this.closeCaptcha} />      
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

const CaptchaScript = (cb) => { // Create script to intialize hCaptcha tool - hCaptcha
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
