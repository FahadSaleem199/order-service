const crypto = require('crypto');

// Should only contain lowercase letters and numbers
const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

// profiles that can be applied
const DEPLOY_WHITELIST = ['local', 'develop', 'qa', 'sandbox', 'uat', 'prod'];

// Should only contain at most 8 lowercase letters and/or numbers
const STAGE_WHITELIST = ['manual', 'develop', 'qa', 'sandbox', 'uat', 'prod'];

// This is an encoder function which uses bitwise operators for efficiency
/* eslint-disable no-bitwise */
function base32Encode(buffer) {
  const length = buffer.byteLength;
  const view = new Uint8Array(buffer);

  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < length; i += 1) {
    value = (value << 8) | view[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}
// Create a string hash
function hash(value) {
  const buffer = crypto.createHash('sha256').update(value).digest();

  return base32Encode(buffer).slice(0, 8);
}

/**
 * Estimate deployment profile
 * `develop` by default/fallback
 */
module.exports.profile = (sls) => {
  if (sls.variables.options.profile && DEPLOY_WHITELIST.includes(sls.variables.options.profile)) {
    return sls.variables.options.profile;
  }
  if (process.env.DEPLOY_PROFILE && DEPLOY_WHITELIST.includes(process.env.DEPLOY_PROFILE)) {
    return process.env.DEPLOY_PROFILE;
  }

  return 'develop';
};

/**
 * Resolve stage
 */
module.exports.stage = (sls) => {
  if (sls.variables.options.stage) {
    return sls.variables.options.stage;
  }
  if (process.env.DEPLOY_STAGE) {
    return process.env.DEPLOY_STAGE;
  }
  if (process.env.BRANCH_NAME) {
    return process.env.BRANCH_NAME;
  }

  return 'manual';
};

/**
 * Get stage short name
 * @param {*} sls
 */
module.exports.stageShort = (sls) => {
  const original = module.exports.stage(sls);

  if (STAGE_WHITELIST.includes(original)) {
    return original;
  }

  const truncated = original
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/[-]+/g, '-')
    .slice(0, 14);

  return `${truncated}-${hash(original)}`;
};

/**
 * Get sage hash
 * @param {*} sls
 */
module.exports.stageHash = (sls) => {
  const original = module.exports.stage(sls);

  if (STAGE_WHITELIST.includes(original)) {
    return original;
  }

  return hash(original);
};

module.exports.snsTopicsPrefix = (sls) => {
  const original = sls.variables.options.stage || sls.service.provider.stage;

  if (STAGE_WHITELIST.includes(original)) {
    return original;
  }

  return 'develop';
};
