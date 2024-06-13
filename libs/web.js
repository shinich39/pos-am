'use strict';

import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36";

function wait(delay) {
  return new Promise(function(resolve) {
    return setTimeout(resolve, delay);
  });
}

class Web {
  constructor() {
    this.browser = null;
    this.page = null;
  }
}

/**
 * 
 */
Web.prototype.init = async function() {
  if (this.browser) {
    await this.destory();
  }
  this.browser = await puppeteer.launch();
  this.page = await this.browser.newPage();
  await this.page.setUserAgent(USER_AGENT);
}

/**
 * 
 */
Web.prototype.destory = async function() {
  if (this.page) {
    await this.page.close();
    this.page = null;
  }
  if (this.browser) {
    await this.browser.close();
    this.browser = null;
  }
}

/**
 * cheerio.load(data);
 * 
 * Ref.
 * https://cheerio.js.org/docs/basics/selecting
 * @param {string|object} data
 * @returns 
 */
Web.prototype.load = function(data) {
  return cheerio.load(data);
}

/**
 * 
 * @param {string} url 
 * @returns 
 */
Web.prototype.get = async function(url) {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }

  await this.page.goto(url);
}

/**
 * 
 * @param {number} delay ms, default 30000
 * @param {string} selector 
 */
Web.prototype.wait = async function(delay, selector) {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }

  if (!delay) {
    delay = 1000 * 30; // 30 sec
  }

  if (selector) {
    await this.page.waitForSelector(selector, {
      timeout: delay,
    });
  } else {
    await wait(delay);
  }
}

/**
 * 
 * @param {string} selector default document.documentElement
 */
Web.prototype.scroll = async function(selector) {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }

  await this.page.evaluate(function(selector) {
    if (selector) {
      document.querySelector(selector).scrollTo(0, document.querySelector(selector).scrollHeight);
    } else {
      window.scrollTo(0, Math.max(document.documentElement.scrollHeight, document.body.scrollHeight));
    }
  }, selector);
}

/**
 * 
 * @param {string} selector default document.documentElement
 * @returns 
 */
Web.prototype.getScroll = async function(selector) {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }

  return await this.page.evaluate(function(selector) {
    return selector ? 
      document.querySelector(selector).scrollTop :
      document.documentElement.scrollTop;
  }, selector);
}

/**
 * 
 * @param {string} selector default document.documentElement
 * @returns 
 */
Web.prototype.getHeight = async function(selector) {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }

  return await this.page.evaluate(function(selector) {
    return selector ? 
      document.querySelector(selector).scrollHeight :
      document.documentElement.scrollHeight;
  }, selector);
}

/**
 * 
 * @returns 
 */
Web.prototype.toString = async function() {
  if (!this.browser) {
    throw new Error("Browser has not been initialized.");
  }
  const content = await this.page.content();
  return content;
}

/**
 * 
 * @returns 
 */
Web.prototype.toObject = async function() {
  const html = await this.toString();
  const $ = cheerio.load(html);
  return $;
}

/**
 * 
 * @param {string[]} selectors default ["body"]
 * @returns 
 */
Web.prototype.toArray = async function(selectors) {
  const $ = await this.toObject();
  if (typeof selectors === "string") {
    selectors = [selectors];
  } else if (!Array.isArray(selectors)) {
    selectors = ["body"];
  }

  return selectors.reduce(function(prev, curr) {
    return prev.concat($(curr).contents().toArray());
  }, []);
}

// esm
export default Web;