# Memorizer

Plugin de Cursor que añade memoria local del workspace: hechos duraderos en `.memory/`, con regla always-on. No toca Scrum ni otros plugins; solo el comportamiento de memoria.

## Instalar desde GitHub

Cursor importa el repositorio como marketplace y luego instala el plugin. Hace falta `.cursor-plugin/marketplace.json` en la raíz del repo (este repo ya lo incluye). No hace falta un release ni una subcarpeta: el plugin vive en la raíz (`source` es `.`).

1. En Cursor, abre **Customize** (barra lateral).
2. Ve a **Plugins**.
3. **Add** → **From GitHub repository**.
4. Pega esta URL:

```text
https://github.com/dguzmano96/memorizer
```

También vale `https://github.com/dguzmano96/memorizer.git`, o `dguzmano96/memorizer` si el diálogo pide owner/repo.

5. Elige el plugin **memorizer**.
6. **Install** y elige alcance de proyecto o de usuario.

El repositorio debe estar en GitHub y ser accesible para tu cuenta de Cursor. Para el marketplace oficial de Cursor el envío exige un Git **público**; esta instalación desde GitHub no pide un tag ni un branch concreto en la documentación. Los archivos tienen que estar **pusheados** a GitHub: lo que solo exista en disco local no aparece en ese diálogo.

## Archivos

- `.cursor-plugin/plugin.json` — manifiesto del plugin
- `.cursor-plugin/marketplace.json` — índice para instalar desde GitHub
- `rules/memorizer.mdc` — protocolo (siempre inyectado)
- `README.md` — esta guía
- `LICENSE` — MIT

Los comandos de compactar y limpiar memoria vendrán después.

## Probar en local

Los plugins locales viven en `~/.cursor/plugins/local`. Copia este repo (o una junction) a `~/.cursor/plugins/local/memorizer` e incluye `.cursor-plugin/plugin.json`. Recarga la ventana (`Developer: Reload Window`).
