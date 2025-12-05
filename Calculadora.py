from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

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
        
        if resultado == int(resultado):
            
            resultado_formateado = str(int(resultado))
        else:
        
            resultado_formateado = f"{resultado:.2f}".replace('.', ',')
        
        return resultado_formateado
            
    except ValueError:
        return "Error: Entrada no válida"
    except Exception as e:
        return f"Ocurrió un error inesperado: {e}"

@app.route('/')
def index():
 
    return render_template('Calculadora.html')

@app.route('/calcular', methods=['POST'])
def manejar_calculo():
 
    data = request.get_json()
    
    num1 = data.get('num1')
    operador = data.get('operador')
    num2 = data.get('num2')
    
    resultado_calculado = calcular_resultado(num1, operador, num2)
    
    return jsonify({
        'resultado': resultado_calculado
    })

if __name__ == "__main__":
    app.run(debug=True)