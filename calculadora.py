from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# --- Tu lógica de cálculo ---
def calcular_resultado(num1, operador, num2):
    try:
        n1 = float(num1)
        n2 = float(num2)
        
        if operador == '+':
            resultado = n1 + n2
        elif operador == '-':
            resultado = n1 - n2
        elif operador == '*':
            resultado = n1 * n2
        elif operador == '/':
            if n2 == 0:
                return "Error: División por cero"
            else:
                resultado = n1 / n2
        else:
            return "Error: Operador no válido"
        
        # Devolvemos el resultado como un string para manejar errores fácilmente
        return str(resultado)
            
    except ValueError:
        return "Error: Entrada no válida"
    except Exception as e:
        return f"Error: {e}"
# --- Fin de la lógica ---


@app.route('/')
def index():
    # Renderiza la plantilla principal
    return render_template('index.html')


# RUTA MODIFICADA: Acepta peticiones POST de JavaScript/Fetch/AJAX
# No renderiza un template, devuelve una respuesta JSON
@app.route('/calcular', methods=['POST'])
def manejar_calculo():
    # 1. Obtiene los datos enviados como JSON
    data = request.get_json()
    
    # 2. Extrae los componentes de la operación
    num1 = data.get('num1')
    operador = data.get('operador')
    num2 = data.get('num2')
    
    # 3. Usa tu función de cálculo
    resultado_calculado = calcular_resultado(num1, operador, num2)
    
    # 4. Devuelve la respuesta a JavaScript en formato JSON
    return jsonify({
        'resultado': resultado_calculado
    })

if __name__ == "__main__":
    app.run(debug=True)