/**
 * SMS sending service implementation. First version works only with Twilio
 * 
 * @author Alexey Sadovsky
 */

const TeleSign = require('telesignsdk');
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
   * @param {Object|String} [options|customerId] SMS service account SID
   * @param {String} apiKey SMS service authentification token
   * @throws {Error}
   */
  setCredentials() {
    let firstArg = arguments[0];
    
    if(typeof firstArg === 'object') { // Options sent as an object
      this.options = {
        customerId: firstArg.customerId || '',
        apiKey: firstArg.apiKey || '',
        restEndpoint: firstArg.restEndpoint || 'https://rest-api.telesign.com',
        timeout: options.timeout || 1000
      };
    } else if(arguments.length > 1) { // Credentials as separate params
      this.options = {
        customerId: firstArg,
        apiKey: arguments[1],  // Auth token is passed as second argument,
        restEndpoint: arguments[2] || 'https://rest-api.telesign.com',
        timeout: arguments[3] || 1000
      };
    } else if(options) {  // If there is no arguments, we'll fill SMS service options with general options by default
      this.options = {
        customerId: options.customerId,
        apiKey: options.apiKey,
        restEndpoint: options.restEndpoint || 'https://rest-api.telesign.com',
        timeout: options.timeout || 1000
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
      this.smsSender = new TeleSign(this.options.customerId, this.options.apiKey, this.options.restEndpoint, this.options.timeout);
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
      body: this.text,
      type: 'ARN'
    };
    console.log(smsOptions);

    return new Promise((resolve, reject) => {
      this.smsSender.sms.message((error, response) => {
        if (!error) {
          console.log(response);
          resolve(response);
        } else {
          console.log(error);
          reject(error);
        }
      }, smsOptions.to, smsOptions.body, smsOptions.type)
    });
  }
}

module.exports = ServiceSMS;