const figlet = require('figlet');

function showTerminalMessage() {
    const colors = {
      reset: '\x1b[0m',
      blue: '\x1b[34m',
      green: '\x1b[32m',
      white: '\x1b[37m',
      yellow: '\x1b[33m'
    };
  
    process.stdout.write('\x1b[2J\x1b[0f');
  
    figlet.text('PORTAL PGA', { font: 'Big' }, (err, data) => {
        if (err) return;
        console.log(`${colors.blue}${data}${colors.reset}`);
        figlet.text('SISTEMA DE GESTAO', { font: 'Big' }, (err, data2) => {
            console.log(`${colors.blue}${data2}${colors.reset}`);
            console.log(`${colors.blue}=======================================================${colors.reset}`);
            console.log('');
            console.log(`${colors.white}Iniciando sistema...${colors.reset}`);
            console.log('');
            
            setTimeout(() => {
              console.log(`${colors.green}✔ Sistema inicializado com sucesso${colors.reset}`);
              console.log(`${colors.yellow}URL: http://localhost:4200${colors.reset}`);
              console.log(`${colors.white}${new Date().toLocaleString()}${colors.reset}`);
            }, 1500);
        });
    });
}
  
showTerminalMessage();