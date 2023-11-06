const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// Carrega o arquivo JSON quando a página é carregada
app.use(express.static(__dirname)); // Servir arquivos estáticos do diretório atual

app.get('/', (req, res) => {
  const rawData = fs.readFileSync('dados.json'); // Lê o arquivo JSON
  const jsonData = JSON.parse(rawData);
  if (jsonData.dados && jsonData.dados.length > 0) {
    const dadosDoJSON = jsonData.dados[0];
    res.send(`
      <form action="/enviar-email" method="POST">
        <input type="text" name="nome" value="${dadosDoJSON.nome}">
        <input type="email" name="email" value="${dadosDoJSON.email}">
        <input type="tel" name="telefone" value="${dadosDoJSON.telefone}">
        <textarea name="mensagem">${dadosDoJSON.mensagem}</textarea>
        <select name="horario">
          <option value="manha">Manhã</option>
          <option value="tarde">Tarde</option>
          <option value="noite">Noite</option>
        </select>
        <button type="submit">Enviar</button>
      </form>
    `);
  } else {
    res.send('Arquivo JSON vazio ou mal formatado.');
  }
});

// Rota para enviar o email
app.post('/enviar-email', (req, res) => {
  const { nome, email, telefone, mensagem, horario } = req.body;

  // Configurar o transporte de email
  const transporter = nodemailer.createTransport({
    service: 'seu-servico-de-email', // Por exemplo, 'Gmail'
    auth: {
      user: 'seu-email@gmail.com',
      pass: 'sua-senha',
    },
  });

  // Detalhes do email
  const mailOptions = {
    from: 'seu-email@gmail.com',
    to: 'email-de-destinatario@example.com',
    subject: 'Novo formulário de contato',
    text: `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nHorário de atendimento: ${horario}\nMensagem: ${mensagem}`,
  };

  // Enviar email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro no envio do email:', error);
      res.status(500).send('Erro no envio do email');
    } else {
      console.log('Email enviado: ' + info.response);
      res.send('Email enviado com sucesso');
    }
  });
});

app.listen(port, () => {
  console.log(`Servidor está rodando na porta ${port}`);
});
