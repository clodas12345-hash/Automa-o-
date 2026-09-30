import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Tuya Credentials default from user project
const DEFAULT_TUYA_CLIENT_ID = 'x9a3j37a75mue8vgfew5';
const DEFAULT_TUYA_SECRET = '7de32ae5608146759c4fd57f09eed534';
const TUYA_ENDPOINT = 'https://openapi.tuyaus.com'; // Western America

// Helper: Tuya HMAC-SHA256 signature generator
function calculateSign(
  clientId: string,
  secret: string,
  timestamp: string,
  nonce: string,
  httpMethod: string,
  urlPath: string,
  bodyStr: string = '',
  accessToken: string = ''
) {
  const contentHash = crypto.createHash('sha256').update(bodyStr).digest('hex');
  const stringToSign = [httpMethod.toUpperCase(), contentHash, '', urlPath].join('\n');
  const signStr = clientId + accessToken + timestamp + nonce + stringToSign;
  return crypto.createHmac('sha256', secret).update(signStr).digest('hex').toUpperCase();
}

// 1. Obter Access Token da Tuya
async function getTuyaAccessToken(clientId: string, secret: string) {
  const timestamp = Date.now().toString();
  const nonce = crypto.randomUUID();
  const urlPath = '/v1.0/token?grant_type=1';
  const sign = calculateSign(clientId, secret, timestamp, nonce, 'GET', urlPath, '');

  const response = await fetch(`${TUYA_ENDPOINT}${urlPath}`, {
    method: 'GET',
    headers: {
      client_id: clientId,
      sign: sign,
      t: timestamp,
      sign_method: 'HMAC-SHA256',
      nonce: nonce,
    },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.msg || 'Erro ao obter Token da Tuya');
  }
  return data.result.access_token as string;
}

// 2. Rota para Listar Dispositivos vinculados na Tuya
app.get('/api/tuya/devices', async (req, res) => {
  try {
    const clientId = (req.query.clientId as string) || DEFAULT_TUYA_CLIENT_ID;
    const secret = (req.query.secret as string) || DEFAULT_TUYA_SECRET;

    const token = await getTuyaAccessToken(clientId, secret);
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const urlPath = '/v1.0/users/devices'; // Devices by user/project
    const sign = calculateSign(clientId, secret, timestamp, nonce, 'GET', urlPath, '', token);

    const response = await fetch(`${TUYA_ENDPOINT}${urlPath}`, {
      method: 'GET',
      headers: {
        client_id: clientId,
        access_token: token,
        sign: sign,
        t: timestamp,
        sign_method: 'HMAC-SHA256',
        nonce: nonce,
      },
    });

    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Rota para Acionar a Fechadura / Equipamento Tuya
app.post('/api/tuya/unlock', async (req, res) => {
  try {
    const { deviceId, clientId = DEFAULT_TUYA_CLIENT_ID, secret = DEFAULT_TUYA_SECRET, command = 'unlock' } = req.body;

    if (!deviceId) {
      return res.status(400).json({ success: false, error: 'Device ID é obrigatório' });
    }

    const token = await getTuyaAccessToken(clientId, secret);
    const timestamp = Date.now().toString();
    const nonce = crypto.randomUUID();
    const urlPath = `/v1.0/devices/${deviceId}/commands`;

    // Try standard smart lock and switch commands
    const isLockAction = command === 'unlock' || command === 'open';
    const commandsPayload = JSON.stringify({
      commands: [
        {
          code: 'unlock_switch',
          value: isLockAction,
        },
      ],
    });

    const sign = calculateSign(clientId, secret, timestamp, nonce, 'POST', urlPath, commandsPayload, token);

    let response = await fetch(`${TUYA_ENDPOINT}${urlPath}`, {
      method: 'POST',
      headers: {
        client_id: clientId,
        access_token: token,
        sign: sign,
        t: timestamp,
        sign_method: 'HMAC-SHA256',
        nonce: nonce,
        'Content-Type': 'application/json',
      },
      body: commandsPayload,
    });

    let data = await response.json();

    // Fallback: If unlock_switch is not supported by this model, try switch / switch_1
    if (!data.success && (data.code === 2008 || data.code === 1010 || data.msg?.includes('not support'))) {
      const fallbackPayload = JSON.stringify({
        commands: [
          {
            code: 'switch',
            value: true,
          },
        ],
      });
      const fallbackNonce = crypto.randomUUID();
      const fallbackTime = Date.now().toString();
      const fallbackSign = calculateSign(clientId, secret, fallbackTime, fallbackNonce, 'POST', urlPath, fallbackPayload, token);

      response = await fetch(`${TUYA_ENDPOINT}${urlPath}`, {
        method: 'POST',
        headers: {
          client_id: clientId,
          access_token: token,
          sign: fallbackSign,
          t: fallbackTime,
          sign_method: 'HMAC-SHA256',
          nonce: fallbackNonce,
          'Content-Type': 'application/json',
        },
        body: fallbackPayload,
      });
      data = await response.json();
    }

    return res.json(data);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Testar conexão com a API da Tuya
app.get('/api/tuya/test', async (req, res) => {
  try {
    const token = await getTuyaAccessToken(DEFAULT_TUYA_CLIENT_ID, DEFAULT_TUYA_SECRET);
    return res.json({ success: true, message: 'Conexão com a Tuya estabelecida com sucesso!', tokenFound: Boolean(token) });
  } catch (err: any) {
    return res.status(400).json({ success: false, error: err.message });
  }
});

// Mount Vite or static dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor GKD Hub rodando na porta ${PORT}`);
  });
}

startServer();
