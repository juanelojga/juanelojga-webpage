---
title: 'Serverless es barato, hasta que ignoras los límites de concurrencia'
date: 2026-04-16
tags: ['serverless', 'concurrencia', 'aws']
summary: 'Las arquitecturas serverless son rentables, pero ignorar los límites de concurrencia puede causar problemas de rendimiento y costos inesperados.'
language: es
slug: serverless-is-cheap-until-you-ignore-concurrency-limits
category: ai
draft: false
readingTime: 6
faq:
  - question: '¿Qué pasa cuando una función serverless alcanza los límites de concurrencia?'
    answer: 'Cuando se superan los límites, las solicitudes se ralentizan (throttling), se ponen en cola o fallan, afectando la experiencia del usuario.'
  - question: '¿Cómo puedo monitorear la concurrencia en AWS Lambda?'
    answer: 'Usa métricas de CloudWatch como `ConcurrentExecutions` y `Throttles`. También puedes habilitar AWS Lambda Insights para un análisis más profundo.'
  - question: '¿Puedo aumentar el límite de concurrencia predeterminado en AWS Lambda?'
    answer: 'Sí, puedes solicitar un aumento de cuota a través del Centro de Soporte de AWS. Sin embargo, incrementar los límites podría elevar los costos si no se gestiona adecuadamente.'
  - question: '¿Son mejores los contenedores que serverless para cargas de alta concurrencia?'
    answer: 'Los contenedores ofrecen más control sobre los recursos y, en muchos casos, son más rentables para cargas sostenidas con alta concurrencia.'
  - question: '¿Qué son la concurrencia reservada y la concurrencia provisionada en AWS Lambda?'
    answer: 'La concurrencia reservada garantiza un número específico de ejecuciones para funciones críticas. La concurrencia provisionada pre-calienta funciones para reducir la latencia de arranques en frío.'
---

## Puntos clave

- Las arquitecturas serverless son rentables, pero los límites de concurrencia suelen ser mal entendidos.
- Ignorar la concurrencia puede causar cuellos de botella, menor rendimiento y costos inesperados.
- Soluciones incluyen un mejor monitoreo, optimización de funciones y considerar arquitecturas híbridas como contenedores para altas cargas concurrentes.

---

## ¿Por qué es importante la concurrencia en arquitecturas serverless?

La concurrencia se refiere al número de ejecuciones de funciones que ocurren simultáneamente en un entorno serverless. Este es un límite muchas veces "invisible" que puede tener un gran impacto en el rendimiento. Por ejemplo, AWS Lambda tiene un límite predeterminado de 1,000 ejecuciones concurrentes por región. Si tu aplicación supera este límite, enfrentará throttling (ralentización o cola de solicitudes), afectando la experiencia del usuario y la escalabilidad del sistema.

Un ejemplo práctico: Imagina que tienes un modelo de inteligencia artificial que se ejecuta en Lambda para procesar peticiones. Si llegan 2,000 solicitudes de manera simultánea, solo las primeras 1,000 se ejecutarán de inmediato. El resto tendrán que esperar en cola o incluso fallarán, dependiendo de la configuración.

### Prueba rápida: alcanzando los límites de concurrencia

Para comprender mejor esto, ejecutemos una función Lambda con alta concurrencia:

```python
import boto3
import json
from concurrent.futures import ThreadPoolExecutor

# Cliente AWS Lambda
lambda_client = boto3.client('lambda')

# Función que invoca Lambda
def invoke_lambda(payload):
    response = lambda_client.invoke(
        FunctionName='MiFuncionLambda',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload),
    )
    return response

# Simulación de concurrencia
payload = {'key': 'value'}
with ThreadPoolExecutor(max_workers=1500) as executor:
    futures = [executor.submit(invoke_lambda, payload) for _ in range(1500)]

# Resultados
results = [future.result() for future in futures]
print(results)
```

Al ejecutar este código, AWS aplicará throttling una vez que se alcance el límite de concurrencia. Notarás un aumento en la latencia o incluso errores en las solicitudes.

---

## ¿Cómo afecta la concurrencia los costos en serverless?

La concurrencia no solo impacta el rendimiento, también puede disparar los costos. Aquí algunos motivos:

1. **Cold Starts:** Cuando una función serverless se ejecuta por primera vez o después de un tiempo inactiva, genera un "arranque en frío". Si tu concurrencia aumenta repentinamente, podrías disparar cientos de estos arranques a la vez.

2. **Invocaciones en cola:** Una vez que se alcanzan los límites de concurrencia, AWS puede colocar solicitudes en cola, lo que retrasa su ejecución. Sin embargo, seguirás pagando por estas invocaciones, aunque perjudiquen la respuesta de tu sistema.

3. **Recursos sobredimensionados:** Muchas organizaciones incrementan los límites de concurrencia (por ejemplo, de 1,000 a 3,000) para evitar problemas. Esto puede generar costos adicionales si no se utiliza la capacidad extra de manera eficiente.

Ejemplo: Si tu función Lambda cuesta $0.00001667 por invocación y tarda 200ms en promedio, 1,000 ejecuciones concurrentes durante 60 segundos costarían alrededor de $1. Subir la concurrencia sin optimizar podría multiplicar estos costos exponencialmente.

---

## Estrategias para gestionar la concurrencia en serverless

Gestionar la concurrencia de manera efectiva implica aplicar patrones y herramientas para escalar de forma responsable. Aquí algunas estrategias:

### 1. Monitorea y establece límites realistas

AWS ofrece métricas como `ConcurrentExecutions` y `Throttles` en CloudWatch para detectar cuándo tu carga de trabajo se acerca al límite de concurrencia.

También puedes reservar concurrencia para funciones críticas para garantizar que siempre tengan capacidad disponible. Ejemplo:

```bash
aws lambda put-function-concurrency \
    --function-name MiFuncionCritica \
    --reserved-concurrent-executions 300
```

Esto asegura que tus funciones más importantes no se vean desplazadas por otras menos prioritarias.

### 2. Optimiza la ejecución de tu código

Reducir el tiempo de ejecución de tus funciones maximiza el rendimiento. Para cargas de trabajo de IA, esto podría significar optimizar el tamaño de tu modelo, usar un framework más rápido o aprovechar servicios como AWS Inferentia.

Ejemplo sencillo:

```python
# Reducir el tamaño del payload
original_payload = {'clave_grande': 'a' * 1000000}  # Payload de 1MB
optimized_payload = json.dumps({'clave_pequeña': 'valor'})  # Payload de 100B
```

Payloads más pequeños reducen el tiempo de ejecución y el uso de memoria, minimizando costos y el impacto en la concurrencia.

### 3. Aprovecha arquitecturas basadas en eventos

Divide las tareas en flujos de trabajo asincrónicos más pequeños usando servicios como AWS Step Functions o Amazon SQS. Esto reduce la necesidad de alta concurrencia, ya que las tareas pueden ejecutarse en lotes más pequeños.

Ejemplo de uso de SQS para distribuir cargas de trabajo:

```python
import boto3

sqs_client = boto3.client('sqs')
queue_url = 'https://sqs.amazonaws.com/123456789012/MiCola'

# Publicar mensajes en SQS
for i in range(1000):
    sqs_client.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps({'tarea_id': i})
    )
```

En lugar de invocar 1,000 Lambdas simultáneamente, distribuye las tareas en mensajes SQS para un escalado más controlado.

### 4. Considera una arquitectura híbrida

Serverless no siempre es la mejor solución. Para cargas de trabajo con alta concurrencia o tiempos largos de ejecución, considera usar contenedores (como AWS Fargate) o instancias EC2. Estas opciones ofrecen mayor control sobre la asignación de recursos y la escalabilidad.

Ejemplo de contenerización para inferencia de modelos de IA:

```dockerfile
FROM python:3.9
WORKDIR /app
COPY model.pkl ./
COPY app.py ./
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

Implementa este contenedor con Fargate para manejar cargas concurrentes sostenidas.

---

## ¿Cuándo vale la pena seguir usando serverless a pesar de los límites de concurrencia?

Serverless es ideal para:

- **Cargas explosivas y de baja latencia:** Aplicaciones donde los picos de tráfico son de corta duración.
- **Ambientes de desarrollo o prototipos:** Itera rápidamente sin preocuparte por administrar servidores.
- **Casos basados en eventos:** Funciones activadas por eventos específicos como cargas de archivos o llamadas a APIs.

Sin embargo, si la concurrencia se convierte en un cuello de botella, es hora de replantear tu arquitectura.

---

## Preguntas frecuentes

### ¿Qué pasa cuando una función serverless alcanza los límites de concurrencia?

Cuando se superan los límites, las solicitudes se ralentizan (throttling), se ponen en cola o fallan, afectando la experiencia del usuario.

### ¿Cómo puedo monitorear la concurrencia en AWS Lambda?

Usa métricas de CloudWatch como `ConcurrentExecutions` y `Throttles`. También puedes habilitar AWS Lambda Insights para un análisis más profundo.

### ¿Puedo aumentar el límite de concurrencia predeterminado en AWS Lambda?

Sí, puedes solicitar un aumento de cuota a través del Centro de Soporte de AWS. Sin embargo, incrementar los límites podría elevar los costos si no se gestiona adecuadamente.

### ¿Son mejores los contenedores que serverless para cargas de alta concurrencia?

Los contenedores ofrecen más control sobre los recursos y, en muchos casos, son más rentables para cargas sostenidas con alta concurrencia.

### ¿Qué son la concurrencia reservada y la concurrencia provisionada en AWS Lambda?

La concurrencia reservada garantiza un número específico de ejecuciones para funciones críticas. La concurrencia provisionada pre-calienta funciones para reducir la latencia de arranques en frío.

---

Las arquitecturas serverless son simples y escalables, pero ignorar los límites de concurrencia puede costarte caro. Comprender estas dinámicas y gestionar tus cargas de manera proactiva es clave para construir sistemas que realmente escalen.
