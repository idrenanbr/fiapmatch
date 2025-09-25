// FIAP Match - Index Navigation with Device Detection

// Detecção de dispositivo
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768 || 
           ('ontouchstart' in window);
}

function isTabletDevice() {
    return /iPad|Android(?=.*Tablet)|Kindle|Silk/i.test(navigator.userAgent) || 
           (window.innerWidth > 768 && window.innerWidth <= 1024);
}

function getDeviceType() {
    if (isMobileDevice()) return 'mobile';
    if (isTabletDevice()) return 'tablet';
    return 'desktop';
}

// Ajustar layout baseado no dispositivo
function adjustLayoutForDevice() {
    const deviceType = getDeviceType();
    const body = document.body;
    const card = document.querySelector('.card');
    const actions = document.querySelector('.actions');
    const deviceIndicator = document.getElementById('deviceIndicator');
    const deviceIcon = document.getElementById('deviceIcon');
    const deviceText = document.getElementById('deviceText');
    
    // Remove classes anteriores
    body.classList.remove('mobile-layout', 'tablet-layout', 'desktop-layout');
    
    // Atualizar indicador de dispositivo
    if (deviceIndicator && deviceIcon && deviceText) {
        deviceIndicator.style.display = 'block';
        
        if (deviceType === 'mobile') {
            deviceIcon.className = 'fas fa-mobile-alt';
            deviceText.textContent = 'Modo Mobile • Layout otimizado para celular';
            body.classList.add('mobile-layout');
            
        } else if (deviceType === 'tablet') {
            deviceIcon.className = 'fas fa-tablet-alt';
            deviceText.textContent = 'Modo Tablet • Layout intermediário';
            body.classList.add('tablet-layout');
            
        } else {
            deviceIcon.className = 'fas fa-desktop';
            deviceText.textContent = 'Modo Desktop • Layout completo';
            body.classList.add('desktop-layout');
        }
    }
    
    // Aplicar estilos específicos do dispositivo (backup caso CSS não carregue)
    if (deviceType === 'mobile') {
        // Layout para mobile: botões empilhados, texto menor
        if (actions) {
            actions.style.flexDirection = 'column';
            actions.style.gap = '16px';
        }
        if (card) {
            card.style.padding = '20px';
            card.style.margin = '10px';
        }
        
    } else if (deviceType === 'tablet') {
        // Layout para tablet: botões lado a lado, tamanho médio
        if (actions) {
            actions.style.flexDirection = 'row';
            actions.style.gap = '20px';
        }
        if (card) {
            card.style.padding = '32px';
            card.style.maxWidth = '600px';
        }
        
    } else {
        // Layout para desktop: botões lado a lado, tamanho grande
        if (actions) {
            actions.style.flexDirection = 'row';
            actions.style.gap = '24px';
        }
        if (card) {
            card.style.padding = '40px';
            card.style.maxWidth = '700px';
        }
    }
}

function openApp(){
    try {
        const deviceType = getDeviceType();
        
        // Abre o app principal
        window.location.href = 'app.html';
    } catch (error) {
        console.error('Erro ao abrir aplicativo:', error);
        alert('Erro ao abrir o aplicativo. Verifique se o arquivo app.html existe.');
    }
}

function openValidator(){
    try {
        const deviceType = getDeviceType();
        
        // Abre o validador do stand
        window.location.href = 'validador-stand.html';
    } catch (error) {
        console.error('Erro ao abrir validador:', error);
        alert('Erro ao abrir o validador. Verifique se o arquivo validador-stand.html existe.');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    
    // Ajustar layout inicial
    adjustLayoutForDevice();
    
    // Reajustar quando a janela for redimensionada
    window.addEventListener('resize', function() {
        setTimeout(adjustLayoutForDevice, 100); // Debounce
    });
    
    // Reajustar quando a orientação mudar (mobile)
    window.addEventListener('orientationchange', function() {
        setTimeout(adjustLayoutForDevice, 200);
    });
});

