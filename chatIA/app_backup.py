import speech_recognition as sr
from flask import Flask, render_template, jsonify

app = Flask(__name__)

# Instancia o reconhecedor de voz
recognizer = sr.Recognizer()

# REQUISITO: Encerrar a captura após ~3 segundos de silêncio
recognizer.pause_threshold = 1.0 

# Define a frase de ativação (Wake Word) em minúsculo para facilitar a busca
FRASE_ATIVACAO = "alexa"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/escutar', methods=['GET'])
def escutar():
    with sr.Microphone() as source:
        # Ajusta o microfone para o ruído ambiente antes de começar
        recognizer.adjust_for_ambient_noise(source, duration=0.5)
        
        try:
            # FASE 1: Aguarda a frase de ativação
            # timeout=5 (tempo máximo esperando começar a falar)
            # phrase_time_limit=3 (tempo máximo da frase de ativação)
            audio_ativacao = recognizer.listen(source, timeout=5, phrase_time_limit=3)
            texto_ativacao = recognizer.recognize_google(audio_ativacao, language='pt-BR').lower()
            
            if FRASE_ATIVACAO in texto_ativacao:
                # FASE 2: Frase de ativação detectada. Agora grava o comando real.
                # Aqui o sistema vai parar sozinho após 3 segundos de silêncio (pause_threshold)
                audio_comando = recognizer.listen(source, timeout=10)
                texto_comando = recognizer.recognize_google(audio_comando, language='pt-BR')
                
                return jsonify({
                    "status": "sucesso", 
                    "mensagem": "Comando processado!",
                    "texto": texto_comando
                })
            else:
                return jsonify({"status": "aguardando", "mensagem": f"Ouvi algo, mas não foi '{FRASE_ATIVACAO}'."})
                
        except sr.WaitTimeoutError:
            return jsonify({"status": "aguardando", "mensagem": "Silêncio... ainda aguardando."})
        except sr.UnknownValueError:
            return jsonify({"status": "aguardando", "mensagem": "Não entendi o que você disse."})
        except Exception as e:
            return jsonify({"status": "erro", "mensagem": str(e)})

if __name__ == '__main__':
    app.run(debug=True)