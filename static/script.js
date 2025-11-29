// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos de la pantalla
    const pantallaAnterior = document.getElementById('pantalla-anterior');
    const pantallaActual = document.getElementById('pantalla-actual');
    const botones = document.querySelectorAll('.calculadora button');

    let valorActual = '0';
    let operacionGuardada = '';
    let esperandoSegundoOperando = false;

    // Función para manejar los números y el punto decimal
    function ingresarNumero(numero) {
        if (esperandoSegundoOperando) {
            valorActual = numero;
            esperandoSegundoOperando = false;
        } else if (valorActual === '0') {
            valorActual = numero;
        } else {
            valorActual += numero;
        }
    }

    // Función para manejar las operaciones (+, -, *, /)
    function ingresarOperador(operador) {
        // Si ya hay una operación guardada, no permite otra sin usar el =
        if (operacionGuardada) {
            // Actualiza solo el operador, si se presiona dos veces
            operacionGuardada = operacionGuardada.replace(/.$/, operador.trim());
            pantallaAnterior.innerText = operacionGuardada;
            return; 
        }

        // Guarda el valor actual y el operador
        operacionGuardada = valorActual + operador;
        esperandoSegundoOperando = true;
    }
    
    // Función para limpiar la calculadora
    function limpiar() {
        valorActual = '0';
        operacionGuardada = '';
        esperandoSegundoOperando = false;
        pantallaAnterior.innerText = '';
    }

    // Función que actualiza la pantalla del navegador
    function actualizarPantalla() {
        pantallaActual.innerText = valorActual;
        pantallaAnterior.innerText = operacionGuardada;
    }

    // Función CLAVE: Llama al servidor Flask
    async function llamarFlask() {
        if (!operacionGuardada || esperandoSegundoOperando) return;

        // 1. Prepara la operación (ej. "5 + 3")
        const operacionCompleta = operacionGuardada + valorActual;
        
        // 2. Extrae los componentes para enviarlos a Python
        // Esto asume un formato: [número1] [operador] [número2]
        const partes = operacionCompleta.trim().split(/\s+/);

        const num1 = partes[0];
        const operador = partes[1];
        const num2 = partes[2];

        // 3. Envía la petición POST a la ruta '/calcular' de Flask
        try {
            const response = await fetch('/calcular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                // El cuerpo de la petición va en formato JSON
                body: JSON.stringify({
                    num1: num1,
                    operador: operador,
                    num2: num2
                })
            });

            const data = await response.json();
            
            // 4. Muestra el resultado de Flask
            if (data.resultado.includes("Error")) {
                pantallaActual.innerText = data.resultado;
                limpiar(); // Limpia después del error
            } else {
                valorActual = data.resultado;
                operacionGuardada = '';
            }
            
        } catch (error) {
            pantallaActual.innerText = "Error de conexión con el servidor.";
            console.error('Error al llamar a Flask:', error);
            limpiar();
        }
    }

    // Asignar los eventos de clic a los botones
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
    
    actualizarPantalla(); // Inicializa la pantalla al cargar

});