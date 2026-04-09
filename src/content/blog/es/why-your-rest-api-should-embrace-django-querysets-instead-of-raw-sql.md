---
title: 'Por qué tu API REST debería usar Querysets de Django en lugar de SQL puro'
date: 2026-04-02
tags: ['django', 'api rest', 'querysets', 'sql puro', 'backend']
summary: 'Los Querysets de Django son una opción más segura, expresiva y escalable para interactuar con bases de datos en APIs REST. Aprende por qué el SQL puro debería ser una excepción rarísima y cómo los Querysets pueden simplificar el desarrollo backend.'
language: es
slug: why-your-rest-api-should-embrace-django-querysets-instead-of-raw-sql
category: backend
draft: false
readingTime: 6
---

## Introducción

Vamos al grano: si estás construyendo una API REST en Django y estás usando consultas de SQL puro por todas partes en tu código, probablemente estés causando más problemas de los que solucionas. Lo entiendo, el SQL puro es tentador. Parece más "directo", te da control y a veces puede parecer más eficiente. Pero cuando trabajas con Django, apoyarte en su ORM y usar Querysets no es solo una “comodidad,” es una elección más inteligente, segura y escalable.

Vamos a desglosar por qué los Querysets de Django deberían ser tu opción por defecto, y en qué casos el SQL puro podría tener sentido (si es que lo tiene).

---

## Razones para usar Querysets

Si no estás utilizando Querysets para interactuar con tu base de datos, estás desperdiciando una de las mayores fortalezas de Django: su ORM (Object-Relational Mapping). Un Queryset no es solo una forma de consultar datos; es una capa de abstracción que resuelve problemas que no querrías manejar manualmente.

### 1. Los Querysets son más seguros

Hablemos de la inyección SQL, el terror de los desarrolladores que escriben código descuidado. Las consultas de SQL puro son notoriamente vulnerables a ataques de inyección si no se construyen con extremo cuidado. Aquí tienes un escenario de pesadilla:

```python
# Ejemplo de SQL puro vulnerable a inyección

def obtener_usuario_por_email(email):
    with connection.cursor() as cursor:
        consulta = f"SELECT * FROM users WHERE email = '{email}'"
        cursor.execute(consulta)
        return cursor.fetchall()

# Un usuario malintencionado pasa este email a tu API:
email = "' OR 1=1 --"
resultado = obtener_usuario_por_email(email)
```

¡Boom! Acabas de regalar el acceso a tu base de datos a un actor malicioso.

Ahora comparemos esto con cómo se hace utilizando Querysets de Django:

```python
# Usando Querysets de Django
from django.contrib.auth.models import User

def obtener_usuario_por_email(email):
    return User.objects.filter(email=email)
```

El ORM de Django escapa automáticamente los inputs, haciendo que los ataques de inyección sean _mucho_ más difíciles. Esto no es solo algo “agradable de tener,” es un requisito básico en el desarrollo web moderno.

### 2. Los Querysets son más expresivos

Usar SQL puro generalmente implica escribir más código repetitivo solo para lograr algo básico. Los Querysets, en cambio, te permiten concentrarte en _qué_ quieres lograr, en lugar de preocuparte por _cómo_ manejar la base de datos.

Ejemplo: Consultar usuarios activos creados en los últimos 7 días:

```python
from datetime import timedelta
from django.utils.timezone import now

# Ejemplo con Querysets
usuarios_activos = User.objects.filter(is_active=True, date_joined__gte=now() - timedelta(days=7))
```

Y aquí está el equivalente con SQL puro:

```python
import datetime
from django.utils.timezone import now
from django.db import connection

def obtener_usuarios_activos():
    hace_siete_dias = now() - datetime.timedelta(days=7)
    with connection.cursor() as cursor:
        consulta = """
        SELECT * FROM users
        WHERE is_active = TRUE
        AND date_joined >= %s
        """
        cursor.execute(consulta, [hace_siete_dias])
        return cursor.fetchall()
```

Nota dos cosas:

1. La versión con SQL puro es más larga y menos legible.
2. Gestionar manualmente los placeholders (`%s`) y parámetros agrega complejidad innecesaria.

Los Querysets eliminan este desorden, permitiéndote centrarte en tu lógica de negocio.

### 3. Los Querysets son agnósticos a la base de datos

Una de las principales ventajas de Django es su ORM, que es independiente de la base de datos. Puedes cambiar de PostgreSQL a MySQL, SQLite o incluso Oracle sin reescribir todas tus consultas. Sin embargo, si estás casado con SQL puro, buena suerte con esa migración.

Por ejemplo, si has estado escribiendo SQL puro específico para PostgreSQL, usando sintaxis como `ILIKE` o tipos de datos como `JSONB`, el día que necesites cambiar a otra base de datos, tus consultas se romperán.

Con Querysets, este problema desaparece por completo. Por ejemplo:

```python
# Búsqueda sin distinción de mayúsculas/minúsculas con Querysets
usuarios = User.objects.filter(email__icontains="example.com")
```

Django se encarga de las diferencias entre `ILIKE` (PostgreSQL) y lo que sea equivalente en otras bases de datos. Tú no tienes que preocuparte: tus consultas simplemente funcionan.

### 4. Los Querysets son más fáciles de depurar

¿Alguna vez te has quedado mirando una consulta SQL durante horas tratando de descubrir por qué los datos no se ven como deberían? Los Querysets hacen que depurar sea más fácil porque:

1. Puedes registrar el SQL generado (`print(queryset.query)`).
2. Trabajas en un nivel más alto de abstracción, lo que facilita el razonamiento sobre la lógica.

Por ejemplo:

```python
# Imprimir el SQL detrás de un queryset
queryset = User.objects.filter(is_active=True)
print(queryset.query)
```

Esto te permite ver exactamente qué está enviando Django a tu base de datos sin sacrificar la claridad de tu código en Python.

---

## Cuándo el SQL puro _PODRÍA_ tener sentido

De acuerdo, lo admito: existen casos excepcionales donde el SQL puro puede superar a los Querysets. Usualmente, éstos caen en una de estas dos categorías:

### 1. Consultas complejas que Django no puede manejar

El ORM de Django es poderoso, pero no todo lo puede. Si necesitas usar funciones específicas de la base de datos, como funciones de ventana o consultas recursivas, el SQL puro puede ser tu única opción.

Ejemplo de una consulta SQL para un total acumulado:

```sql
SELECT date,
       SUM(sales) OVER (PARTITION BY region ORDER BY date ASC) AS running_total
FROM sales_data;
```

Django ha estado mejorando su soporte para funciones avanzadas de bases de datos con métodos como `annotate()` o `Subquery()`, pero a veces el SQL puro es inevitable.

### 2. Problemas de rendimiento

En casos raros, los Querysets de Django pueden ser menos eficientes que una consulta SQL puro optimizada manualmente. Por ejemplo, si necesitas obtener 10 millones de filas con joins y agregaciones muy específicos, el SQL puro puede ser mejor.

Dicho esto, siempre realiza pruebas de rendimiento antes de asumir que el SQL puro será más rápido. Los Querysets de Django suelen ser lo suficientemente buenos, y una optimización prematura puede llevar a una complejidad innecesaria.

---

## Consejos prácticos para trabajar con Querysets

Algunos consejos para maximizar el uso de los Querysets sin perder flexibilidad:

### Consejo 1: Aprende a usar `annotate()` y `aggregate()`

Los Querysets de Django pueden manejar agregaciones y cálculos complejos si sabes cómo usar estos métodos:

```python
from django.db.models import Count

# Contar el número de usuarios activos por grupo
grupo_conteos = Group.objects.annotate(num_usuarios=Count('user'))
```

### Consejo 2: Depura los Querysets con SQL

Si algo no está funcionando como esperabas, imprime la consulta SQL detrás de tu Queryset:

```python
queryset = User.objects.filter(is_active=True)
print(queryset.query)
```

Esta es una herramienta imprescindible para depurar.

### Consejo 3: Evita el problema de N+1 consultas

No conviertas tus Querysets en un desastre de N+1 consultas. Usa `.select_related()` y `.prefetch_related()` para obtener eficientemente datos relacionados:

```python
# Obtener datos relacionados de manera eficiente
usuarios = User.objects.select_related('profile')
```

---

## Conclusión

Los Querysets de Django no son solo una comodidad: son una práctica recomendada para desarrollar APIs REST. Son más seguros, más expresivos y más fáciles de depurar, además de mantener tu base de código independiente de la base de datos. Sí, el SQL puro tiene su lugar en casos excepcionales, pero no debería ser tu herramienta predeterminada.

Si estás tentado a escribir SQL puro por hábito o porque crees que será más rápido, detente y reflexiona. Nueve de cada diez veces, los Querysets de Django harán el trabajo mejor, más rápido y con menos riesgos.

Así que la próxima vez que pienses en usar SQL puro en tu proyecto de Django, pregúntate si hay algún método de Queryset que pueda lograr lo mismo. Lo más probable es que lo haya, y que sea la mejor opción.
