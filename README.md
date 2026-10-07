# memorizer - Plugin de Memoria Local para Cursor

Este plugin de Cursor (versión 0.1.0) añade una capa de memoria local persistente a tu entorno de desarrollo, diseñada para guardar y recuperar hechos duraderos específicos del proyecto en el que estás trabajando. Su objetivo principal es asegurar que los agentes de IA tengan acceso constante a información contextual clave sin que el usuario tenga que repetirla.

## Qué es el Plugin memorizer

memorizer es un plugin para Cursor que dota a los agentes de IA de una memoria local. Esta memoria almacena "hechos duraderos" relevantes para la carpeta del proyecto abierta en Cursor. Estos hechos pueden ser decisiones de diseño, convenciones específicas del proyecto, nombres con significados particulares, o restricciones que no están directamente en el código fuente.

**No es:** un registro de chat ni una copia redundante de tu repositorio de código.

## Cómo te ayuda

El propósito principal es evitar que tengas que explicar repetidamente los mismos hechos y decisiones a los agentes de IA en cada nueva conversación. El agente está diseñado para identificar un hecho duradero, guardarlo automáticamente, y luego buscarlo cuando sea relevante para tus preguntas o tareas. No necesitas decirle explícitamente al agente "memoriza esto".

## Cómo instalarlo

### Instalación desde GitHub (Recomendado)

1.  En Cursor, ve a **Customize** en la barra lateral.
2.  Selecciona **Plugins**.
3.  Haz clic en **Add** y luego en **From GitHub repository**.
4.  Pega la URL del repositorio: `https://github.com/dguzmano96/memorizer`
5.  Elige el plugin `memorizer` de la lista.
6.  Haz clic en **Install** y selecciona el ámbito (proyecto o usuario).

El repositorio debe contener el archivo `.cursor-plugin/marketplace.json` en su raíz (este ya lo incluye). Los archivos del plugin deben estar subidos a GitHub.

### Alternativa Local (para desarrollo o pruebas)

Puedes copiar o crear una unión simbólica (junction en Windows) del repositorio del plugin a la carpeta de plugins locales de Cursor:

*   **Windows:** `%USERPROFILE%\.cursor\plugins\local\memorizer`
*   **macOS/Linux:** `~/.cursor/plugins/local/memorizer`

Después de copiar, recarga la ventana de Cursor (`Developer: Reload Window`).

## Cómo usarlo

1.  **Guarda un hecho:** Abre un chat en la carpeta de tu proyecto y enuncia el hecho duradero de forma natural. No hace falta pedirle que lo memorice.

    *Ejemplo de lo que escribes:* «En este proyecto el CLI se corre con Bun, no con Node. El lockfile que manda es bun.lock.»

    El agente lo guarda y responde con una sola línea:

    `Memoria guardada.`

2.  **Consulta un hecho:** Más tarde, haz una pregunta que dependa de ese hecho. El agente buscará en el archivo `.memory/index.jsonl` del proyecto. No carga toda la memoria en el prompt, solo busca los índices.

    *   **Orden de búsqueda:** Primero, busca por los 5 `tags` principales (solo filas `active`). Si no encuentra nada, intenta una búsqueda más amplia usando los 3 `lowtags` (estos son más generales y pueden indicar una relación, no una coincidencia exacta).

3.  **Gestión de conflictos:** Si un nuevo hecho entra en conflicto con uno `active` ya existente, el agente te preguntará antes de realizar el cambio. Si confirmas, la fila antigua se marcará como `superseded` y se escribirá una nueva entrada.

    *   Cualquier chat, incluidos los subagentes, puede escribir en la memoria. Un subagente informará al orquestador la ruta y un resumen del hecho guardado.

## Qué se guarda y qué no

### Se guarda

*   Hechos duraderos, decisiones clave, restricciones del proyecto, glosarios de términos específicos, y soluciones alternativas (workarounds) que no están en el control de versiones (Git).

### No se guarda

*   Secretos (solo se guardan los *nombres* de las variables de entorno, no sus valores).
*   Transcripciones completas de chats.
*   Planes de tareas que ya existen en otro lugar.
*   Código fuente (ya está en el repositorio).
*   Reglas de Cursor, el README, o el código del plugin.

## Estructura de la Memoria en Disco

La memoria se organiza en una carpeta `.memory/` dentro de tu proyecto. Su estructura es fija, aunque el contenido cambie:

*   `.memory/MEMORY.md`: Un archivo legible por humanos que describe la memoria; se crea una sola vez y no se reescribe con cada guardado.
*   `.memory/index.jsonl`: Contiene una línea JSON por cada entrada de memoria, utilizado para la búsqueda.
*   `.memory/entries/<timestamp>-<descripción-corta>-<5-tags>.md`: Cada hecho duradero se guarda en su propio archivo Markdown, con un nombre que incluye la fecha, una descripción corta y los 5 tags.

Cuando se guarda el primer hecho, el plugin también añade automáticamente `.memory/` al archivo `.gitignore` del proyecto y `!.memory/` junto con `!.memory/**` al `.cursorignore`. Esto asegura que Git no suba la memoria al repositorio, pero el agente de Cursor puede leerla.

### Campos de las entradas de memoria

Cada archivo Markdown en `entries/` incluye un *frontmatter* con los siguientes campos:

*   `created`: Fecha y hora de creación (ISO-8601 UTC).
*   `updated`: Última fecha y hora de actualización (ISO-8601 UTC).
*   `title`: Título breve del hecho.
*   `type`: Categoría (`user`, `feedback`, `project`, `reference`).
*   `tags`: Exactamente 5 etiquetas de una palabra, utilizadas para la búsqueda principal.
*   `lowtags`: Exactamente 3 etiquetas más amplias, para búsquedas relacionadas si los `tags` no dan resultados.
*   `status`: Estado de la entrada (`active`, `superseded`, `archived`).
*   `summary`: Una frase corta que resume el hecho.
*   `supersedes` (opcional): Ruta relativa al archivo de la entrada que esta entrada reemplaza.

El *cuerpo* del archivo contiene una sección `description` con una explicación detallada del hecho, cuándo aplica, posibles excepciones y cómo verificarlo (aproximadamente 400 tokens). Esta descripción NO se copia al `index.jsonl`.

Las líneas en `.memory/index.jsonl` contienen un subconjunto de estos campos para una búsqueda eficiente: `path`, `tags`, `lowtags`, `type`, `status`, `updated`, `summary`.

## Limitaciones Actuales

Actualmente, no existen comandos para compactar o limpiar la memoria. Estas funcionalidades se añadirán en futuras versiones.

### Qué no está permitido que el agente modifique

El agente no debe:

*   Crear nuevas reglas de Cursor, ni editar el `README.md` de este plugin o sus archivos de manifiesto (`plugin.json`, `marketplace.json`).
*   Inventar nuevos campos, reescribir completamente el archivo `index.jsonl`, eliminar entradas de memoria, o crear carpetas adicionales dentro de `.memory/`.

## Coexistencia con Otros Plugins

El plugin memorizer solo añade la funcionalidad de memoria local. No reemplaza ni interfiere con el funcionamiento de otros plugins de Cursor.

## Licencia

Este plugin está bajo la licencia [MIT](LICENSE).