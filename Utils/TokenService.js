const crypto = require('crypto');

const encode = (object) => Buffer.from(JSON.stringify(object)).toString('base64url');
const decode = (segment) => JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));

const sign = (payload, secret, expiresInSeconds = 3600) => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds });
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

const verify = (token, secret, callback) => {
  try {
    const [header, body, signature] = token.split('.');
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      throw new Error('Firma inválida');
    }

    const payload = decode(body);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expirado');
    }

    callback(null, payload);
  } catch (error) {
    callback(error);
  }
};

module.exports = { sign, verify };
