# 🚀 FIAP Match - Conectando para Transformar

Uma aplicação gamificada completa para o **FIAP Next** que engaja participantes através de pulseiras coloridas, QR codes exclusivos e um sistema de pontos, badges e prêmios.

## 🎯 Funcionalidades Implementadas

### ✅ Sistema de Papéis e Pulseiras
- **🔵 Alunos FIAP** - +10 pontos por conexão
- **🟡 Visitantes** - +30 pontos por conexão  
- **🟣 Iniciação Científica** - +20 pontos por conexão
- **🔴 Challenge** - +20 pontos por conexão
- **🟠 Professores** - +10 pontos + badge "Mentoria Next"
- **🟢 Funcionários** - +15 pontos por conexão

### ✅ Sistema de Identificação
- **UIDs únicos** no formato `NEXT25-{ROLE}-{7C}`
- **QR Codes assinados** com payload JSON e HMAC-SHA256
- **Códigos curtos** para digitação manual (ex: `STU-ABC1234`)

### ✅ Cadastro Dinâmico
- **Campos específicos** por papel (RM, curso, projeto, etc.)
- **Validação LGPD** obrigatória
- **Geração automática** de UID, QR e código curto

### ✅ Sistema de Pontos e Badges
- **Pontuação variável** baseada no papel do usuário conectado
- **Badges especiais**: Check-in Next, Mentoria Next, Conector Universal
- **Missões extras** com recompensas exclusivas

### ✅ Validação no Stand
- **Validador dedicado** (`validador-stand.html`)
- **Verificação de assinatura** para evitar fraudes
- **Controle de brindes** e estatísticas em tempo real

### ✅ Sistema de Conexões
- **Deduplicação** automática (mesmo par = 1x/24h)
- **Antifraude** com verificação de assinatura
- **Histórico completo** de conexões

### ✅ Ranking e Prêmios
- **Ranking competitivo** em tempo real
- **Sistema de prêmios** com Top 3
- **Brindes garantidos** para cadastros validados

## 📱 Como Usar

### Para Participantes:
1. **Acesse** `fiap-match-mvp (4).html`
2. **Escolha seu papel** (Aluno, Visitante, IC, etc.)
3. **Preencha os dados** específicos do seu papel
4. **Aceite os termos** LGPD
5. **Gere seu QR Code** e código curto
6. **Vá ao stand** para validar e pegar seu brinde
7. **Comece a conectar** com outras pessoas!

### Para Staff do Stand:
1. **Acesse** `validador-stand.html`
2. **Escaneie QR Codes** ou digite códigos curtos
3. **Valide cadastros** e libere brindes
4. **Acompanhe estatísticas** em tempo real

## 🔐 Segurança

- **Assinatura HMAC-SHA256** em todos os QR codes
- **Verificação de integridade** no validador
- **Deduplicação** de conexões
- **Rate limiting** para evitar spam
- **Armazenamento local** com sincronização

## 🏆 Sistema de Pontos

| Papel | Pontos por Conexão | Badge Especial |
|-------|-------------------|----------------|
| Visitantes | +30 | - |
| IC/Challenge | +20 | - |
| Funcionários | +15 | - |
| Alunos | +10 | - |
| Professores | +10 | ✅ Mentoria Next |

## 🎁 Prêmios

- **Brinde físico garantido** para quem valida no stand
- **Top 3 ranking** recebe kits especiais
- **Badges exclusivas** com benefícios especiais
- **Missões especiais** com recompensas surpresa

## 🛠️ Tecnologias

- **HTML5** com design responsivo
- **CSS3** com animações e gradientes
- **JavaScript ES6+** com funcionalidades modernas
- **QR Code Library** para geração e leitura
- **LocalStorage** para persistência offline
- **Canvas Confetti** para celebrações

## 📊 Estrutura de Dados

### User Object:
```javascript
{
  uid: "NEXT25-STU-ABC1234",
  shortCode: "STU-ABC1234",
  qrPayload: { /* JSON assinado */ },
  name: "João Silva",
  role: "STU",
  roleName: "Alunos FIAP",
  course: "ADS",
  points: 150,
  matches: 5,
  badges: ["CHECKIN_NEXT"],
  validated: true,
  connections: [/* array de conexões */]
}
```

### Connection Object:
```javascript
{
  uid: "NEXT25-VIS-XYZ7890",
  role: "VIS",
  name: "Maria Visitante",
  points: 30,
  timestamp: "2025-01-25T10:30:00Z"
}
```

## 🚀 Próximos Passos

1. **Integração com backend** para sincronização em tempo real
2. **Push notifications** para novas conexões
3. **Analytics** detalhados de engajamento
4. **API REST** para integração com outros sistemas
5. **PWA** para instalação como app nativo

## 📞 Suporte

Para dúvidas ou sugestões sobre o FIAP Match, entre em contato com a equipe de desenvolvimento.

---

**FIAP Match** - Conectando Talentos, Criando Oportunidades 🚀
