document.addEventListener('DOMContentLoaded', () => {  
    const pantallaAnterior = document.getElementById('pantalla-anterior');
    const pantallaActual = document.getElementById('pantalla-actual');
    const botones = document.querySelectorAll('.calculadora button');

    let valorActual = '0';
    let operacionGuardada = '';
    let esperandoSegundoOperando = false;
    let calculoFinalizado = false;

    function ingresarNumero(numero) {
        if (calculoFinalizado) {
            valorActual = numero;
            operacionGuardada = '';
            calculoFinalizado = false;
            return;
        }

        if (esperandoSegundoOperando) {
            valorActual = numero;
            esperandoSegundoOperando = false;
        } else if (valorActual === '0') {
            valorActual = numero;
        } else {
            valorActual += numero;
        }
    }
    
    function ingresarOperador(operador) {
        
        if (calculoFinalizado) {
            calculoFinalizado = false;
        }

        if (operacionGuardada) {
            operacionGuardada = operacionGuardada.replace(/.$/, operador.trim());
            pantallaAnterior.innerText = operacionGuardada;
            return; 
        }

        operacionGuardada = valorActual + operador;
        esperandoSegundoOperando = true;
    }
    
    function limpiar() {
        valorActual = '0';
        operacionGuardada = '';
        esperandoSegundoOperando = false;
        calculoFinalizado = false;
        pantallaAnterior.innerText = '';
    }

    function actualizarPantalla() {
        pantallaActual.innerText = valorActual;
        pantallaAnterior.innerText = operacionGuardada;
    }

    async function llamarFlask() {
        if (!operacionGuardada || esperandoSegundoOperando) return;
        
        const operacionCompleta = operacionGuardada + valorActual;
       
        const partes = operacionCompleta.trim().split(/\s+/);

        const num1 = partes[0];
        const operador = partes[1];
        const num2 = partes[2];
        
        try {
            const response = await fetch('/calcular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
             
                body: JSON.stringify({
                    num1: num1,
                    operador: operador,
                    num2: num2
                })
            });

            const data = await response.json();
            
            if (data.resultado.includes("Error")) {
                pantallaActual.innerText = data.resultado;
                limpiar();
            } else {
                valorActual = data.resultado;
                operacionGuardada = ''; 
                calculoFinalizado = true;
            }
            
        } catch (error) {
            pantallaActual.innerText = "Error de conexión con el servidor.";
            console.error('Error al llamar a Flask:', error);
            limpiar();
        }
    }
    
    botones.forEach(boton => {
        boton.addEventListener('click', () => {
            const valor = boton.innerText.trim();

            if (/[0-9]/.test(valor)) {
                ingresarNumero(valor);
            } else if (valor === 'C') {
                limpiar();
            } else if (valor === '=') {
                llamarFlask();
            } else if (boton.classList.contains('operador')) {
                const operador = boton.getAttribute('data-operador');
                ingresarOperador(operador);
            }
            
            actualizarPantalla();
        });
    });
});