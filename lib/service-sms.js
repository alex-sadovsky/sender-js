/**
 * SMS sending service implementation. First version works only with Twilio
 * 
 * @author Alexey Sadovsky
 */

const twilio = require('twilio');
const Service = require('./sender-prototype');

let options = {};

/**
 * SMS sender prototype class
 * 
 * @param {Object} mgOptions Options object needs to use SMS service
 * @param {boolean} setLocalOptions Flag to save option in local object
 */
class ServiceSMS extends Service {
  /**
   * Constructor
   * 
   * @param {Object} mgOptions Options object needs to use Mailgun
   * @param {boolean} setLocalOptions Flag to save option in local object
   */
  constructor(mgOptions, setLocalOptions) {
    if(setLocalOptions) {
      options = mgOptions['sms'] || {};
    }

    super();

    /**
     * SMS service options
     */
    this.options = {};
    
    if(mgOptions && !setLocalOptions) {
      this.setCredentials(mgOptions);
    } else if(options) {
      this.setCredentials();
    }
  }

  /**
   * Returns current SMS service class options
   * 
   * @returns {Object} Maigun credentials object
   */
  getCredentials() {
    return this.options;
  }

  /**
   * Sets SMS service options
   * 
   * @param {Object|String} [options|accountSid] SMS service account SID
   * @param {String} authToken SMS service authentification token
   * @throws {Error}
   */
  setCredentials() {
    let firstArg = arguments[0];
    
    if(typeof firstArg === 'object') { // Options sent as an object
      this.options = {
        accountSid: firstArg.accountSid || '',
        authToken: firstArg.authToken || ''
      };
    } else if(arguments.length > 1) { // Credentials as separate params
      this.options = {
        accountSid: firstArg,
        authToken: arguments[1]  // Auth token is passed as second argument
      };
    } else if(options) {  // If there is no arguments, we'll fill SMS service options with general options by default
      this.options = {
        accountSid: options.accountSid,
        authToken: options.authToken
      };
    } else {
      throw new Error('@setCredentials Wrong SMS service options');
    }
  }

  /**
   * Creates SMS service object
   * 
   * @param {boolean} makeNew Flag to make new Mailgun object
   * @returns {undefined}
   */
  initialize(makeNew) {
    // Creates new SMS service object if there is no one or if the necessary flag is set
    if(!this.smsSender || makeNew) {
      this.smsSender = new twilio(this.options.accountSid, this.options.authToken);
    }
  }

  /**
   * Sends mail to the specfied mail
   * 
   * @param {Object} messageOptions Message options which is used to send mail
   * @returns {Object} Result message from SMS service
   * @throws Error
   */
  async send(messageOptions, callback) {
    super.send(messageOptions, callback);

    this.initialize();
    let smsOptions = {
      from: this.from,
      to: this.to,
      body: this.text
    };

    try {
      return this.smsSender.messages.create(smsOptions);
    } catch(e) {
      throw new Error(e);
    }
  }
}

module.exports = ServiceSMS;