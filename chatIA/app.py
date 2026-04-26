from flask import Flask, render_template, request, jsonify
import os
import uuid
from google.cloud import dialogflow_v2 as dialogflow

app = Flask(__name__)

# ==============================
# CONFIGURAÇÃO DIALOGFLOW
# ==============================

# Caminho do JSON de credenciais (na raiz do projeto)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "credenciais.json"

# ID do projeto Dialogflow (MUDE AQUI)
PROJECT_ID = "assistente-virtual-upju"

# Idioma
LANGUAGE_CODE = "pt-BR"


def detectar_intencao(texto_usuario):
    try:
        # Cria sessão única
        session_id = str(uuid.uuid4())

        session_client = dialogflow.SessionsClient()
        session = session_client.session_path(PROJECT_ID, session_id)

        # Configura o texto
        text_input = dialogflow.TextInput(
            text=texto_usuario,
            language_code=LANGUAGE_CODE
        )

        query_input = dialogflow.QueryInput(text=text_input)

        # Envia para o Dialogflow
        response = session_client.detect_intent(
            request={"session": session, "query_input": query_input}
        )

        # Resposta da intent
        resposta = response.query_result.fulfillment_text

        # Caso não tenha resposta definida
        if not resposta:
            resposta = "Não entendi muito bem, pode repetir?"

        return resposta

    except Exception as e:
        print("Erro Dialogflow:", e)
        return "Erro ao conectar com o assistente."


# ==============================
# ROTAS FLASK
# ==============================

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/comando', methods=['POST'])
def comando():
    try:
        data = request.json
        texto = data.get("texto", "").strip()

        if not texto:
            return jsonify({
                "status": "erro",
                "resposta": "Nenhum texto recebido"
            })

        # 🔥 Aqui entra o Dialogflow
        resposta_dialogflow = detectar_intencao(texto)

        return jsonify({
            "status": "ok",
            "resposta": resposta_dialogflow
        })

    except Exception as e:
        print("Erro na rota:", e)
        return jsonify({
            "status": "erro",
            "resposta": "Erro interno no servidor"
        })


# ==============================
# START
# ==============================

if __name__ == '__main__':
    app.run(debug=True)