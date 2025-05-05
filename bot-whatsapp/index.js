const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', qr => {
  console.log("Escanea este código QR con WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ Bot conectado y listo');
});

// Webhook desde AppSheet
app.post('/enviar-grupo', async (req, res) => {
  const { nombreGrupo, mensaje } = req.body;

  try {
    const chats = await client.getChats();
    const grupo = chats.find(chat => chat.isGroup && chat.name === nombreGrupo);

    if (grupo) {
      await grupo.sendMessage(mensaje);
      res.send('Mensaje enviado al grupo');
    } else {
      res.status(404).send('Grupo no encontrado');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al enviar el mensaje');
  }
});

client.initialize();

app.listen(3000, () => {
  console.log('🚀 Webhook escuchando en http://localhost:3000/enviar-grupo');
});
